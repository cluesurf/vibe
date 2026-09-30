// THE GPU RUN: rent one GPU droplet, run the GPU job on it, bring the logs back, destroy it. task/kernel/
// A rented GPU bills until it is DESTROYED (powered off still bills), so this owns the whole life of exactly one machine
// and every exit path ends in its destruction:
//
//   1. refuse if a droplet with the tag already exists (a leftover: gpu-watchdog.ts --sweep removes it)
//   2. create ONE droplet, named and tagged vibe-gpu-bench, and record its id in the run directory at once
//   3. start task/kernel/gpu-watchdog.ts at that moment, DETACHED, armed to destroy that id at creation + the cap: it
//      outlives this process, so a crash here, a lost session or a hung ssh still ends in a destroyed droplet
//   4. wait for the droplet and its ssh, copy the package (kernel/ sources, code/, task/, test/, package.json and the
//      tsconfig; never node_modules, kernel/host or tmp) as a tar stream over ssh
//   5. run task/kernel/gpu-job.sh there, stopped early if it would run past the cap less a margin
//   6. copy tmp/gpu-logs back, then destroy the droplet by its id, confirm by tag that it is gone, stand the watchdog down,
//      and print the elapsed time and what it cost
// Steps 4 to 6 are in a finally: any failure after creation still destroys.
//
// Nothing account-specific is in this file. The DigitalOcean token is read from the environment only
// (DIGITALOCEAN_ACCESS_TOKEN, which doctl reads itself); the region, the ssh key and the private key are arguments or
// environment variables. It prints the plan and creates nothing without --commit.
//
//   gpu-run.ts --region <slug> --ssh-key <id or fingerprint> [--identity <private key>] [--size gpu-mi300x1-192gb]
//              [--image <slug>] [--feature hip|cuda] [--cap-minutes 150] [--commit]
//   environment: VIBE_GPU_REGION, VIBE_GPU_SSH_KEY, VIBE_GPU_IDENTITY, VIBE_GPU_SIZE, VIBE_GPU_IMAGE, VIBE_GPU_FEATURE,
//                VIBE_GPU_CAP_MINUTES
//
// See note/research/vibe/kernel.md for how this project calls it (through term zone load).

import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CAP_MINUTES, TAG, destroy, doctl, log as watchLog, tagged } from './gpu-watchdog'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const WATCHDOG = fileURLToPath(new URL('./gpu-watchdog.ts', import.meta.url))

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`)

  return i >= 0 ? process.argv[i + 1] : undefined
}
const opt = (name: string, env: string, fallback?: string): string | undefined => arg(name) ?? process.env[env] ?? fallback

const SIZE = opt('size', 'VIBE_GPU_SIZE', 'gpu-mi300x1-192gb')!
const REGION = opt('region', 'VIBE_GPU_REGION')
// the public ROCm image (ROCm 7.2.4 on Ubuntu 24.04, which carries hiprtc); an NVIDIA run names its own
const IMAGE = opt('image', 'VIBE_GPU_IMAGE', 'amddeveloperclou-rocm724')!
const SSH_KEY = opt('ssh-key', 'VIBE_GPU_SSH_KEY')
const IDENTITY = opt('identity', 'VIBE_GPU_IDENTITY')
const FEATURE = opt('feature', 'VIBE_GPU_FEATURE', 'hip')!
const CAP = Number(opt('cap-minutes', 'VIBE_GPU_CAP_MINUTES', String(CAP_MINUTES)))
const COMMIT = process.argv.includes('--commit')
// the job is stopped this long before the cap, leaving time to copy the logs back and destroy
const MARGIN_MINUTES = 12

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const OUT = join(ROOT, 'tmp', 'gpu-run', stamp)
const RUN_LOG = join(OUT, 'run.log')

const log = (line: string): void => watchLog(line, RUN_LOG)
const pause = (seconds: number): void => {
  execFileSync('sleep', [String(seconds)])
}

type Detail = Awaited<ReturnType<typeof tagged>>[number] & {
  networks?: { v4?: { ip_address: string; type: string }[] }
}

const sshOptions = (): string[] => [
  '-o',
  'BatchMode=yes',
  '-o',
  'ConnectTimeout=15',
  '-o',
  'ServerAliveInterval=30',
  '-o',
  'ServerAliveCountMax=10',
  '-o',
  'StrictHostKeyChecking=accept-new',
  '-o',
  `UserKnownHostsFile=${join(OUT, 'known_hosts')}`,
  ...(IDENTITY ? ['-i', IDENTITY, '-o', 'IdentitiesOnly=yes'] : []),
]

function priceHourly(): number {
  const sizes = JSON.parse(doctl(['compute', 'size', 'list', '-o', 'json'])) as { slug: string; price_hourly: number }[]
  const s = sizes.find(x => x.slug === SIZE)

  if (!s) {
    throw new Error(`no size ${SIZE}`)
  }

  return s.price_hourly
}

function waitActive(id: number, until: number): string {
  for (;;) {
    const d = (JSON.parse(doctl(['compute', 'droplet', 'get', String(id), '-o', 'json'])) as Detail[])[0]
    const ip = d?.networks?.v4?.find(n => n.type === 'public')?.ip_address

    if (d?.status === 'active' && ip) {
      return ip
    }

    if (Date.now() > until) {
      throw new Error(`droplet ${id} not active with an address in time (status ${d?.status})`)
    }

    pause(10)
  }
}

// ssh up AND the machine running our commands. A GPU image finishes its own first-boot setup after ssh answers, and
// until then its login prints "Please wait while we get your droplet ready..." and exits 0 WITHOUT running the command
// (the first run of this script was lost that way): so a command counts only when its own marker comes back
function waitSsh(host: string, until: number): void {
  for (;;) {
    const r = spawnSync('ssh', [...sshOptions(), host, 'echo vibe-ready-$((6 * 7))'], { timeout: 40_000 })

    if (r.status === 0 && r.stdout?.toString().includes('vibe-ready-42')) {
      return
    }

    if (r.stdout?.toString().trim()) {
      log(`not ready yet: ${r.stdout.toString().trim().split('\n')[0]}`)
    }

    if (Date.now() > until) {
      throw new Error(`no ssh to the droplet in time`)
    }

    pause(10)
  }
}

// the image's own first-boot setup (cloud-init, which the DigitalOcean AMD images use to prepare the machine and which
// gates the login until it is done), waited for with a stated bound: 15 minutes
function waitSetup(host: string): void {
  const r = spawnSync(
    'ssh',
    [...sshOptions(), host, 'timeout 900 cloud-init status --wait >/dev/null 2>&1; echo vibe-setup-$(cloud-init status 2>/dev/null | tr -d " ")'],
    { timeout: 960_000 },
  )
  const out = r.stdout?.toString() ?? ''

  log(`first-boot setup: ${out.trim().split('\n').pop() ?? '(nothing)'}`)

  if (!out.includes('vibe-setup-')) {
    throw new Error('the first-boot setup wait did not run')
  }
}

// what a finished job leaves behind: gpu-job.sh's two sentinels, and the logs the report is made of. A run missing any
// of these did NOT happen, whatever the exit code said
export const REQUIRED_LOGS = [
  'started',
  'finished',
  'steps.txt',
  'machine.log',
  'build_gpu.log',
  'check.log',
  'check_fma_control.log',
  'parity_golden.log',
  'parity_fma_control.log',
  'bench_ball_24.log',
  'bench_reduced_30.log',
  'bench_sea.log',
  'bench_holes_3.log',
]

export function verify(out: string): string[] {
  const logs = join(out, 'gpu-logs')
  const missing = REQUIRED_LOGS.filter(f => !existsSync(join(logs, f)))
  const job = existsSync(join(out, 'job.log')) ? readFileSync(join(out, 'job.log'), 'utf8') : ''

  if (!job.includes('== job started on')) {
    missing.push('job.log: the job\'s first line (it never ran)')
  }

  if (!job.includes('job done')) {
    missing.push('job.log: the "job done" line')
  }

  return missing
}

// the package as a tar stream over ssh (the repo copies to droplets this way, never with rsync)
function transfer(host: string): void {
  const paths = ['package.json', 'tsconfig.json', 'kernel/Cargo.toml', 'kernel/Cargo.lock', 'kernel/build.rs', 'kernel/src', 'code', 'task', 'test']
  const tar = spawnSync('tar', ['-czf', '-', '--exclude', 'node_modules', '--exclude', '.DS_Store', ...paths], {
    cwd: ROOT,
    env: { ...process.env, COPYFILE_DISABLE: '1' },
    maxBuffer: 1 << 30,
  })

  if (tar.status !== 0) {
    throw new Error(`tar failed: ${tar.stderr.toString()}`)
  }

  log(`copying ${(tar.stdout.length / 1e6).toFixed(1)} MB to the droplet`)

  const r = spawnSync(
    'ssh',
    [...sshOptions(), host, 'mkdir -p /root/vibe && tar -C /root/vibe -xzf - 2>/dev/null && test -f /root/vibe/task/kernel/gpu-job.sh && echo vibe-copied'],
    { input: tar.stdout, maxBuffer: 1 << 26 },
  )

  if (r.status !== 0 || !r.stdout.toString().includes('vibe-copied')) {
    throw new Error(`copy failed: ${r.stdout.toString().trim()} ${r.stderr.toString().trim()}`)
  }
}

// the job, its output streamed to job.log and to this console, stopped at the deadline
function job(host: string, stopAt: number): Promise<number> {
  const out = openSync(join(OUT, 'job.log'), 'a')

  return new Promise(resolve => {
    const child = spawn('ssh', [...sshOptions(), host, `bash /root/vibe/task/kernel/gpu-job.sh ${FEATURE}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const write = (b: Buffer): void => {
      writeFileSync(out, b)
      process.stdout.write(b)
    }
    const timer = setTimeout(
      () => {
        log('the job reached its deadline: stopping it')
        child.kill('SIGTERM')
      },
      Math.max(0, stopAt - Date.now()),
    )

    child.stdout.on('data', write)
    child.stderr.on('data', write)
    child.on('close', code => {
      clearTimeout(timer)
      closeSync(out)
      resolve(code ?? -1)
    })
  })
}

function fetchLogs(host: string): void {
  const r = spawnSync('ssh', [...sshOptions(), host, 'tar -C /root/vibe/tmp -czf - gpu-logs'], {
    maxBuffer: 1 << 28,
    timeout: 300_000,
  })

  if (r.status !== 0) {
    log(`could not fetch the logs: ${r.stderr?.toString().split('\n')[0]}`)
    return
  }

  spawnSync('tar', ['-xzf', '-', '-C', OUT], { input: r.stdout })
  log(`logs in ${join(OUT, 'gpu-logs')}`)
}

let verdict = false

function report(dir = OUT): void {
  const missing = verify(dir)

  verdict = missing.length === 0

  if (verdict) {
    log('RUN COMPLETE: both sentinels and every required log are present')
  } else {
    log(`RUN FAILED: missing ${missing.join(', ')}`)
  }
}

async function main(): Promise<void> {
  // --verify <run directory>: the completeness check alone, on a run already fetched (no droplet, no token)
  const check = arg('verify')

  if (check) {
    const missing = verify(check)

    console.log(missing.length === 0 ? 'RUN COMPLETE' : `RUN FAILED: missing ${missing.join(', ')}`)
    process.exit(missing.length === 0 ? 0 : 1)
  }

  if (!REGION || !SSH_KEY) {
    console.error('gpu-run: --region and --ssh-key (or VIBE_GPU_REGION and VIBE_GPU_SSH_KEY) are required')
    process.exit(2)
  }

  const plan = `one ${SIZE} droplet in ${REGION}, image ${IMAGE}, named and tagged ${TAG}, job feature ${FEATURE}, destroyed by ${CAP} min at the latest`

  if (!COMMIT) {
    console.log(`gpu-run plan (nothing created without --commit): ${plan}`)
    return
  }

  mkdirSync(OUT, { recursive: true })

  const leftover = tagged(TAG)

  if (leftover.length > 0) {
    log(`refusing: ${leftover.length} droplet(s) already tagged ${TAG}; run gpu-watchdog.ts --sweep first`)
    process.exit(1)
  }

  const price = priceHourly()

  log(`plan: ${plan}, $${price}/h`)

  // the clock starts BEFORE the create call, so the watchdog's deadline is never later than creation + cap
  const t0 = Date.now()
  const deadline = t0 + CAP * 60_000
  const created = JSON.parse(
    doctl([
      'compute',
      'droplet',
      'create',
      TAG,
      '--size',
      SIZE,
      '--region',
      REGION,
      '--image',
      IMAGE,
      '--ssh-keys',
      SSH_KEY,
      '--tag-name',
      TAG,
      '-o',
      'json',
    ]),
  ) as { id: number; created_at?: string }[]
  const id = created[0]!.id

  writeFileSync(join(OUT, 'droplet.json'), JSON.stringify({ id, tag: TAG, size: SIZE, region: REGION, t0, deadline }, null, 2))
  log(`created droplet ${id}; destroy deadline ${new Date(deadline).toISOString()}`)

  // the watchdog, detached so it outlives this process, its own output kept beside the run's
  const wout = openSync(join(OUT, 'watchdog.out'), 'a')
  const dog = spawn(process.execPath, [...process.execArgv, WATCHDOG, '--id', String(id), '--deadline', new Date(deadline).toISOString(), '--tag', TAG], {
    detached: true,
    stdio: ['ignore', wout, wout],
    env: process.env,
  })

  dog.unref()
  closeSync(wout)
  log(`watchdog started (pid ${dog.pid}), logging to tmp/gpu-watchdog.log`)

  // interrupted (a closed terminal, a stopped task): destroy now rather than wait for the watchdog's deadline
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(signal, () => {
      log(`${signal}: destroying droplet ${id} before exiting`)
      process.exit(destroy(id, TAG, RUN_LOG) ? 130 : 1)
    })
  }

  let gone = false

  try {
    const ip = waitActive(id, t0 + 15 * 60_000)
    const host = `root@${ip}`

    log(`droplet ${id} active at ${ip}`)
    waitSsh(host, Date.now() + 20 * 60_000)
    log('ssh up, and the machine runs commands')
    waitSetup(host)
    transfer(host)

    const code = await job(host, deadline - MARGIN_MINUTES * 60_000)

    log(`job exited ${code}`)
    fetchLogs(host)
    report()
  } catch (e) {
    log(`FAILED: ${(e as Error).message}`)
  } finally {
    gone = destroy(id, TAG, RUN_LOG)

    const t1 = Date.now()
    const minutes = (t1 - t0) / 60_000
    const billed = Math.max(minutes, 5)

    log(
      `${gone ? 'destroyed' : 'NOT CONFIRMED DESTROYED'} droplet ${id}: ${minutes.toFixed(1)} min from create to gone, about $${((billed / 60) * price).toFixed(2)} at $${price}/h (a 5 min minimum)`,
    )

    if (gone && dog.pid) {
      try {
        process.kill(dog.pid, 'SIGTERM')
      } catch {
        log('the watchdog had already exited')
      }
    } else {
      log('the watchdog stays armed')
    }
  }

  process.exit(gone && verdict ? 0 : 1)
}

void main()
