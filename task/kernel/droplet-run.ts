// THE DROPLET RUN: run a heavy job of this package on a remote machine, bring the logs back, and leave nothing behind.
// task/kernel/
//
// Two ways to get the machine:
//
//   NEW     --kind cpu|gpu      rent ONE droplet for this run and destroy it at the end. A droplet bills until it is
//                               DESTROYED (powered off still bills), so every exit path ends in its destruction:
//     1. refuse if a droplet with the kind's tag already exists (vibe-cpu-run or vibe-gpu-bench; a leftover is removed
//        by gpu-watchdog.ts --sweep --tag <tag>)
//     2. create ONE droplet, named and tagged, and record its id in the run directory at once
//     3. start task/kernel/gpu-watchdog.ts at that moment, DETACHED, armed to destroy that id at creation + the cap: it
//        outlives this process, so a crash here, a lost session or a hung ssh still ends in a destroyed droplet
//     4. wait for the droplet, for ssh to run a command and return that command's own marker, and for cloud-init
//     5-7. as below, then destroy by id, confirm by tag that it is gone, stand the watchdog down, print minutes and cost
//
//   EXISTING  --host work       a machine that is already there and has other work (a work droplet that also builds
//                               deploy images). Nothing is created or destroyed. The address is read at run time, never
//                               written in this file: VIBE_WORK_HOST (user@address), or else the first droplet carrying
//                               the tag --host-tag (default "work"), as root. Before anything runs:
//     - refuse if a build is running there (a docker or buildx build process) or another vibe run is live
//     - the job runs at nice 19, the idle I/O class, and pinned to all cpus but --spare (default 2)
//     - everything lives under ONE directory, /root/vibe-runs/<run id>/, and that directory alone is removed at the end
//       (only this run's own /root/vibe-runs/<id> directory, only with the marker it wrote; --keep leaves it)
//
// Then, either way:
//   5. copy the package (kernel/ sources, code/, task/, test/, package.json and the tsconfig; never node_modules,
//      kernel/host or tmp) as a tar stream over ssh into <run dir>/pkg, with the job's step list beside it
//   6. start the job DETACHED on the machine through task/kernel/droplet-launch.sh, bounded there by `timeout` at the cap
//      less a margin, and follow its log (reconnecting if the connection drops) until it exits
//   7. bring the logs back to tmp/droplet-run/<time>/ and verify them: the job's start and end sentinels, its first and
//      last lines, and every required log must be there, or the run is reported FAILED whatever the exit code said
// Everything after the create (or the copy) is in a finally, and SIGINT, SIGTERM and SIGHUP stop the job and destroy
// (or clean up) too.
//
// The job is either a script of the package (--job, e.g. task/kernel/gpu-job.sh, the default for --kind gpu) or
// task/kernel/droplet-job.sh with a list of steps: presets (--steps proof,bench,rerun:E-FND-0163+E-FND-0164) and any
// number of --step 'name=command' (a command run by bash in the package, with TSX, THREADS and CORES set).
//
// Nothing account-specific is in this file: the DigitalOcean token is read from the environment only
// (DIGITALOCEAN_ACCESS_TOKEN, which doctl reads itself), and the region, keys and host are arguments or environment
// variables. Without --commit it prints the plan, the per-run maximum cost among it, and touches nothing.
//
//   droplet-run.ts --kind cpu|gpu --region <slug> --ssh-key <id or fingerprint> [--identity <private key>]
//                  [--size <slug>] [--image <slug>] [--cap-minutes m] [--feature hip|cuda] [job] [--commit]
//   droplet-run.ts --host work [--host-tag work] [--identity <private key>] [--spare 2] [--cap-minutes m] [--keep]
//                  [job] [--commit]
//   droplet-run.ts --verify <run directory>
//   job: [--job <script> [--job-arg a ...]] | [--steps preset,...] [--step name=command ...]
//   environment: VIBE_DROPLET_REGION, VIBE_DROPLET_SSH_KEY, VIBE_DROPLET_IDENTITY, VIBE_WORK_HOST, VIBE_WORK_IDENTITY
//                (and gpu-run.ts's VIBE_GPU_* names, still read)
//
// See note/project/vibe/kernel.md, "Running heavy jobs on a CPU droplet".

import { spawn, spawnSync } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync, writeSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeShell, PACKAGE_PATHS, pause, priceHourly } from './droplet-shell'
import { destroy, doctl, log as watchLog, tagged } from './gpu-watchdog'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const WATCHDOG = fileURLToPath(new URL('./gpu-watchdog.ts', import.meta.url))

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`)

  return i >= 0 ? process.argv[i + 1] : undefined
}

const args = (name: string): string[] => process.argv.flatMap((a, i) => (a === `--${name}` && process.argv[i + 1] ? [process.argv[i + 1]!] : []))
const opt = (name: string, envs: string[], fallback?: string): string | undefined =>
  arg(name) ?? envs.map(e => process.env[e]).find(v => v !== undefined && v !== '') ?? fallback

type Kind = 'cpu' | 'gpu'

// what each kind of new droplet is by default: its tag (the watchdog and the sweep act on this tag only), size, image
// and cap. CPU: the plain Ubuntu image (the job installs node, rust and tsx); c-48, the most dedicated vCPUs of the
// regular CPU-Optimized sizes on offer (24 cores, 48 hyperthreads, 96 GB), is a default by reasoning, NOT yet measured
const KINDS: Record<Kind, { tag: string; size: string; image: string; cap: number }> = {
  cpu: { tag: 'vibe-cpu-run', size: 'c-48', image: 'ubuntu-24-04-x64', cap: 180 },
  gpu: { tag: 'vibe-gpu-bench', size: 'gpu-mi300x1-192gb', image: 'amddeveloperclou-rocm724', cap: 150 },
}

const HOST = arg('host')
const KIND = (arg('kind') ?? (HOST ? 'cpu' : undefined)) as Kind | undefined
const COMMIT = process.argv.includes('--commit')
const KEEP = process.argv.includes('--keep')
const FEATURE = opt('feature', ['VIBE_GPU_FEATURE'], 'hip')!
const REGION = opt('region', ['VIBE_DROPLET_REGION', 'VIBE_GPU_REGION'])
const SSH_KEY = opt('ssh-key', ['VIBE_DROPLET_SSH_KEY', 'VIBE_GPU_SSH_KEY'])
const IDENTITY = opt('identity', HOST ? ['VIBE_WORK_IDENTITY', 'VIBE_DROPLET_IDENTITY'] : ['VIBE_DROPLET_IDENTITY', 'VIBE_GPU_IDENTITY'])
const SPARE = Number(arg('spare') ?? 2)
const HOST_TAG = arg('host-tag') ?? 'work'

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const OUT = join(ROOT, 'tmp', 'droplet-run', stamp)
const RUN_LOG = join(OUT, 'run.log')
const REMOTE = `/root/vibe-runs/${stamp}`
const MARKER = '.vibe-run'

const log = (line: string): void => watchLog(line, RUN_LOG)

// ---- the job ----

type Step = { name: string; info: boolean; command: string }

// the named step lists. proof: the equivalence check and the parity suite LIVE against this machine's own JavaScript
// (byte for byte), then the parity suite against the Mac's golden files as information only (the JavaScript reference
// is known to differ between x86 and arm64 in the last digit of a few cases, kernel.md "Measured on a GPU"). bench: the
// timings, native at several thread counts beside js. bench-large: the radius-40 ball and the four-hole sorted store
// (about 6 GB of state). rerun:<codes joined by +>: registered experiments through test/rerun.ts, each its own step
const PRESETS: Record<string, (x?: string) => Step[]> = {
  proof: () => [
    { name: 'check', info: false, command: 'CHECK_BACKENDS=native "$TSX" task/kernel/check.ts' },
    { name: 'parity_live', info: false, command: 'PARITY_BACKENDS="js,native:1,native:$THREADS" "$TSX" task/kernel/parity.ts' },
    { name: 'parity_golden', info: true, command: 'PARITY_BACKENDS="native:$THREADS" "$TSX" task/kernel/parity.ts --golden' },
  ],
  bench: () =>
    (
      [
        ['bench_primitive', 'primitive 24'],
        ['bench_ball_24', 'ball 24 8'],
        ['bench_reduced_30', 'reduced 30 6'],
        ['bench_sea', 'sea 3'],
        ['bench_holes_3', 'holes 3 3'],
      ] as const
    ).map(([name, what]) => ({
      name,
      info: false,
      command: `BENCH_BACKENDS=js,native BENCH_THREADS="$THREAD_LIST" "$TSX" task/kernel/bench.ts ${what}`,
    })),
  'bench-large': () => [
    { name: 'bench_ball_40', info: false, command: 'BENCH_BACKENDS=js,native BENCH_THREADS="$THREADS" "$TSX" task/kernel/bench.ts ball 40 4' },
    { name: 'bench_sorted_4', info: false, command: 'BENCH_BACKENDS=native BENCH_THREADS="$THREADS" "$TSX" task/kernel/bench.ts sorted 4 2' },
  ],
  rerun: codes =>
    (codes ?? '')
      .split('+')
      .filter(c => /^[A-Za-z0-9/_-]+$/.test(c))
      .map(c => ({ name: `rerun_${c.replace(/\//g, '_')}`, info: false, command: `"$TSX" test/rerun.ts ${c}` })),
}

function stepsOf(): Step[] {
  const steps: Step[] = []

  for (const spec of (arg('steps') ?? '').split(',').filter(s => s.length > 0)) {
    const [name, x] = spec.split(':') as [string, string | undefined]
    const preset = PRESETS[name]

    if (!preset) {
      throw new Error(`no step preset ${name} (have ${Object.keys(PRESETS).join(', ')})`)
    }

    steps.push(...preset(x))
  }

  for (const spec of args('step')) {
    const i = spec.indexOf('=')
    const name = spec.slice(0, i)

    if (i <= 0 || !/^[A-Za-z0-9_-]+$/.test(name)) {
      throw new Error(`a --step is name=command, the name letters, digits, _ and -: ${spec}`)
    }

    steps.push({ name, info: false, command: spec.slice(i + 1) })
  }

  const names = new Set<string>()

  for (const s of steps) {
    if (names.has(s.name) || s.command.includes('\t') || s.command.includes('\n')) {
      throw new Error(`step ${s.name} is named twice, or its command holds a tab or a newline`)
    }

    names.add(s.name)
  }

  return steps
}

// the job to run and what a finished run of it leaves behind (a run missing any of these did NOT happen)
type Job = { script: string; args: string[]; logs: string; required: string[]; steps: Step[] }

const GPU_REQUIRED = [
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
const BASE_REQUIRED = ['started', 'finished', 'steps.txt', 'machine.log', 'build_native.log']

function jobOf(): Job {
  const script = arg('job') ?? (KIND === 'gpu' ? 'task/kernel/gpu-job.sh' : 'task/kernel/droplet-job.sh')

  if (script === 'task/kernel/gpu-job.sh') {
    return { script, args: [FEATURE], logs: 'gpu-logs', required: GPU_REQUIRED, steps: [] }
  }

  const steps = stepsOf()
  const generic = script === 'task/kernel/droplet-job.sh'

  if (generic && steps.length === 0) {
    throw new Error('the job has no steps: give --steps and/or --step name=command')
  }

  if (!existsSync(join(ROOT, script))) {
    throw new Error(`no job script ${script} in the package`)
  }

  return {
    script,
    args: args('job-arg'),
    logs: 'droplet-logs',
    required: generic ? [...BASE_REQUIRED, ...steps.map(s => `${s.name}.log`)] : ['started', 'finished'],
    steps,
  }
}

// a fetched run's completeness: the job's logs, its first and last lines, and its exit file
export function verify(out: string): string[] {
  const saved = existsSync(join(out, 'job.json')) ? (JSON.parse(readFileSync(join(out, 'job.json'), 'utf8')) as Job) : undefined
  // a run from before job.json existed: a GPU run, by its logs or its droplet's tag
  const droplet = existsSync(join(out, 'droplet.json')) ? (JSON.parse(readFileSync(join(out, 'droplet.json'), 'utf8')) as { tag?: string }) : undefined
  const gpu = existsSync(join(out, 'gpu-logs')) || droplet?.tag === KINDS.gpu.tag
  const logs = saved?.logs ?? (gpu ? 'gpu-logs' : 'droplet-logs')
  const required = saved?.required ?? (logs === 'gpu-logs' ? GPU_REQUIRED : BASE_REQUIRED)
  const missing = required.filter(f => !existsSync(join(out, logs, f)))
  const job = existsSync(join(out, 'job.log')) ? readFileSync(join(out, 'job.log'), 'utf8') : ''

  if (!job.includes('== job started on')) {
    missing.push("job.log: the job's first line (it never ran)")
  }

  if (!job.includes('job done')) {
    missing.push('job.log: the "job done" line')
  }

  return missing
}

// the steps that exited nonzero, from steps.txt, apart from the informational ones
function failedSteps(out: string, logs: string): string[] {
  const file = join(out, logs, 'steps.txt')

  if (!existsSync(file)) {
    return []
  }

  return readFileSync(file, 'utf8')
    .split('\n')
    .map(l => l.trim().split(/\s+/))
    .filter(p => p.length >= 3 && p[1] !== '0' && p[3] !== 'info')
    .map(p => `${p[0]} (exit ${p[1]})`)
}

// ---- ssh ----

// ssh, the readiness waits and the package's path list live in droplet-shell.ts, shared with task/burst/index.ts
const shell = makeShell(join(OUT, 'known_hosts'), IDENTITY, log)
const sshOptions = shell.options
const remote = shell.remote
const waitSsh = shell.waitSsh
const waitSetup = shell.waitSetup

// ---- the existing host ----

function resolveHost(): string {
  const fixed = process.env.VIBE_WORK_HOST

  if (fixed) {
    return fixed
  }

  type Listed = { networks?: { v4?: { ip_address: string; type: string }[] } }

  const list = JSON.parse(doctl(['compute', 'droplet', 'list', '--tag-name', HOST_TAG, '-o', 'json']) || '[]') as Listed[]
  const ip = list[0]?.networks?.v4?.find(n => n.type === 'public')?.ip_address

  if (!ip) {
    throw new Error(`no droplet tagged ${HOST_TAG} with a public address (or set VIBE_WORK_HOST)`)
  }

  return `root@${ip}`
}

// what the host is and whether it is free: cores, memory, load, any build running, any other vibe run live. EVERY word
// of every pattern is bracketed, so pgrep cannot match this command's own line: with only the first word bracketed,
// the literal "[d]ocker buildx build" contains "buildx build", which the next pattern matched, and the probe counted
// itself as a running build on an idle host
const PREFLIGHT = [
  'echo "cores $(nproc)"',
  'free -g | awk \'/^Mem/ {print "memory_gb " $2 " available_gb " $7}\'',
  'echo "load $(cut -d " " -f 1-3 /proc/loadavg)"',
  'echo "builds $(pgrep -fc \'[d]ocker [b]uild|[d]ocker [b]uildx [b]uild|[b]uildx [b]uild|[d]ocker [c]ompose [b]uild|[d]ocker-[c]ompose [b]uild|[b]uildctl [b]uild\')"',
  'live=0; for p in /root/vibe-runs/*/job.pid; do [ -f "$p" ] && [ ! -f "$(dirname "$p")/job.exit" ] && kill -0 "$(cat "$p")" 2>/dev/null && live=$((live + 1)); done; echo "vibe_live $live"',
  'for c in node cargo cc taskset ionice setsid timeout; do printf "%s=%s " "$c" "$(command -v "$c" >/dev/null && echo yes || echo no)"; done; echo',
  'echo "node_version $(node --version 2>/dev/null || echo none)"',
].join('; ')

type Preflight = { cores: number; memory: number; available: number; load: string; builds: number; live: number; tools: string; node: string }

function preflight(host: string): Preflight {
  const out = remote(host, PREFLIGHT)
  const field = (k: string): string => (new RegExp(`^${k} (.*)$`, 'm').exec(out))?.[1]?.trim() ?? ''
  const tools = out.split('\n').find(l => l.startsWith('node='))?.trim() ?? ''

  return {
    cores: Number(field('cores')),
    memory: Number((/memory_gb (\d+)/.exec(out))?.[1] ?? 0),
    available: Number((/available_gb (\d+)/.exec(out))?.[1] ?? 0),
    load: field('load'),
    builds: Number(field('builds') || 0),
    live: Number(field('vibe_live') || 0),
    tools,
    node: field('node_version'),
  }
}

// ---- the run ----

// the package as a tar stream over ssh (the repo copies to droplets this way, never with rsync), with the job's step
// list added at the package root
function transfer(host: string, job: Job): void {
  const paths = PACKAGE_PATHS

  writeFileSync(join(OUT, 'job-steps.tsv'), job.steps.map(s => `${s.name}\t${s.info ? 1 : 0}\t${s.command}\n`).join(''))

  const tar = spawnSync('tar', ['-czf', '-', '--exclude', 'node_modules', '--exclude', '.DS_Store', ...paths, '-C', OUT, 'job-steps.tsv'], {
    cwd: ROOT,
    env: { ...process.env, COPYFILE_DISABLE: '1' },
    maxBuffer: 1 << 30,
  })

  if (tar.status !== 0) {
    throw new Error(`tar failed: ${tar.stderr.toString()}`)
  }

  log(`copying ${(tar.stdout.length / 1e6).toFixed(1)} MB to ${REMOTE}/pkg`)

  const r = spawnSync(
    'ssh',
    [...sshOptions(), host, `mkdir -p ${REMOTE}/pkg && tar -C ${REMOTE}/pkg -xzf - 2>/dev/null && test -f ${REMOTE}/pkg/${job.script} && echo vibe-copied`],
    { input: tar.stdout, maxBuffer: 1 << 26 },
  )

  if (r.status !== 0 || !r.stdout.toString().includes('vibe-copied')) {
    throw new Error(`copy failed: ${r.stdout.toString().trim()} ${r.stderr.toString().trim()}`)
  }
}

// start the job detached, bounded on the machine by the cap
function launch(host: string, job: Job, capSeconds: number, cpus: string, env: Record<string, string>): number {
  const vars = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
  const out = remote(
    host,
    `cd ${REMOTE}/pkg && env ${vars} bash task/kernel/droplet-launch.sh ${REMOTE} ${capSeconds} ${cpus} ${job.script} ${job.args.join(' ')}`,
  )
  const pid = Number((/vibe-launched-(\d+)/.exec(out))?.[1])

  if (!pid) {
    throw new Error(`the job did not launch: ${out.trim()}`)
  }

  return pid
}

// follow the job's log until it exits, streamed to job.log and to this console. A dropped connection reconnects from the
// byte already received, until the deadline. Resolves true once the job has written its exit file
async function follow(host: string, pid: number, until: number): Promise<boolean> {
  const file = openSync(join(OUT, 'job.log'), 'a')

  let received = 0

  try {
    for (;;) {
      const code = await new Promise<number>(resolve => {
        const child = spawn('ssh', [...sshOptions(), host, `tail -c +${received + 1} --pid=${pid} -f ${REMOTE}/job.log`], {
          stdio: ['ignore', 'pipe', 'pipe'],
        })
        const timer = setTimeout(() => child.kill('SIGTERM'), Math.max(0, until - Date.now()))

        child.stdout.on('data', (b: Buffer) => {
          received += b.length
          writeSync(file, b)
          process.stdout.write(b)
        })
        child.stderr.on('data', (b: Buffer) => process.stderr.write(b))
        child.on('close', c => {
          clearTimeout(timer)
          resolve(c ?? -1)
        })
      })
      const done = spawnSync('ssh', [...sshOptions(), host, `cat ${REMOTE}/job.exit 2>/dev/null || echo running`], { timeout: 60_000 })
      const state = done.stdout?.toString().trim() ?? ''

      if (done.status === 0 && state !== 'running' && state !== '') {
        log(`job exited ${state}${state === '124' ? ' (stopped at the cap)' : ''}`)

        return true
      }

      if (Date.now() > until) {
        log('the follow reached the deadline with the job still running')

        return false
      }

      log(`the log follow ended (${code}) with the job still running: reconnecting in 30 s`)
      pause(30)
    }
  } finally {
    closeSync(file)
  }
}

// stop the job: every process in its session (setsid made the pid the session id; `timeout` moves itself to a process
// group of its own, so a kill by group would miss it)
function stop(host: string, pid: number): void {
  const r = spawnSync('ssh', [...sshOptions(), host, `pkill -TERM -s ${pid}; sleep 5; pkill -KILL -s ${pid}; echo stopped`], { timeout: 60_000 })

  log(`stop job ${pid}: ${r.status === 0 ? 'sent' : 'could not reach the machine'}`)
}

function fetchLogs(host: string, job: Job): void {
  const r = spawnSync('ssh', [...sshOptions(), host, `tar -C ${REMOTE}/pkg/tmp -czf - ${job.logs}`], { maxBuffer: 1 << 28, timeout: 300_000 })

  if (r.status !== 0) {
    log(`could not fetch the logs: ${r.stderr?.toString().split('\n')[0]}`)

    return
  }

  spawnSync('tar', ['-xzf', '-', '-C', OUT], { input: r.stdout })
  log(`logs in ${join(OUT, job.logs)}`)
}

// on an existing host, remove ONLY this run's own directory: a path under /root/vibe-runs/, holding the marker this run
// wrote. The host is shared infrastructure, and nothing outside our own run directories is ever deleted there. --keep
// leaves even that.
function clean(host: string): void {
  if (KEEP || !REMOTE.startsWith('/root/vibe-runs/') || REMOTE.includes('..')) {
    log(`left ${REMOTE} in place. To remove it by hand: ./work rm -rf -- ${REMOTE}`)

    return
  }

  const r = spawnSync('ssh', [...sshOptions(), host, `test -f ${REMOTE}/${MARKER} && rm -rf -- ${REMOTE} && echo vibe-cleaned`], { timeout: 300_000 })

  log(r.stdout?.toString().includes('vibe-cleaned') ? `removed ${REMOTE}` : `did NOT remove ${REMOTE} (no marker, or no connection). To remove it by hand: ./work rm -rf -- ${REMOTE}`)
}

let verdict = false

function report(job: Job): void {
  const missing = verify(OUT)
  const failed = failedSteps(OUT, job.logs)

  verdict = missing.length === 0

  log(verdict ? 'RUN COMPLETE: both sentinels and every required log are present' : `RUN FAILED: missing ${missing.join(', ')}`)
  log(failed.length === 0 ? 'every step exited 0 (informational steps aside)' : `steps that failed: ${failed.join(', ')}`)
}

// run the job on a machine that is up: copy, launch, follow, fetch, verify. The caller owns the machine's life
async function runOn(host: string, job: Job, deadline: number, margin: number, cpus: string, env: Record<string, string>): Promise<void> {
  remote(host, `mkdir -p ${REMOTE} && touch ${REMOTE}/${MARKER}`)
  transfer(host, job)

  const capSeconds = Math.floor((deadline - margin * 60_000 - Date.now()) / 1000)

  if (capSeconds < 300) {
    throw new Error(`under 5 minutes left before the cap (${capSeconds} s): not starting`)
  }

  const pid = launch(host, job, capSeconds, cpus, env)

  jobPid = pid
  log(`job started (session ${pid}), stopped on the machine after ${(capSeconds / 60).toFixed(0)} min at the latest`)

  const done = await follow(host, pid, deadline - margin * 60_000 + 90_000)

  if (!done) {
    stop(host, pid)
  }

  jobPid = undefined
  fetchLogs(host, job)
  report(job)
}

let jobPid: number | undefined

async function existing(job: Job, cap: number): Promise<boolean> {
  const t0 = Date.now()
  const host = resolveHost()

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'job.json'), JSON.stringify(job, null, 2))
  waitSsh(host, Date.now() + 2 * 60_000)

  const p = preflight(host)

  log(`host: ${p.cores} cores, ${p.memory} GB (${p.available} GB available), load ${p.load}, node ${p.node}, ${p.tools}`)

  if (p.builds > 0) {
    log(`refusing: ${p.builds} build process(es) running on the host; run again once the deploy is done`)

    return false
  }

  if (p.live > 0) {
    log(`refusing: ${p.live} other vibe run(s) live on the host`)

    return false
  }

  if (!p.tools.includes('setsid=yes') || !p.tools.includes('timeout=yes')) {
    log('refusing: the host lacks setsid or timeout, which the launcher needs')

    return false
  }

  const threads = Math.max(1, p.cores - SPARE)
  const cpus = p.tools.includes('taskset=yes') ? `0-${threads - 1}` : '-'

  log(`the job gets ${threads} of ${p.cores} cores (cpus ${cpus}), nice 19, idle I/O; run directory ${REMOTE}`)

  const deadline = t0 + cap * 60_000

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(signal, () => {
      log(`${signal}: stopping the job and cleaning up before exiting`)

      if (jobPid) {
        stop(host, jobPid)
      }

      clean(host)
      process.exit(130)
    })
  }

  try {
    await runOn(host, job, deadline, 3, cpus, { THREADS: String(threads) })
  } catch (e) {
    log(`FAILED: ${(e as Error).message}`)

    if (jobPid) {
      stop(host, jobPid)
    }
  } finally {
    clean(host)
    log(`${((Date.now() - t0) / 60_000).toFixed(1)} min on the existing host; nothing created, nothing billed beyond the host itself`)
  }

  return verdict
}

async function created(kind: Kind, job: Job, cap: number, size: string, image: string, price: number): Promise<boolean> {
  const { tag } = KINDS[kind]
  const leftover = tagged(tag)

  if (leftover.length > 0) {
    log(`refusing: ${leftover.length} droplet(s) already tagged ${tag}; run gpu-watchdog.ts --sweep --tag ${tag} first`)

    return false
  }

  // the clock starts BEFORE the create call, so the watchdog's deadline is never later than creation + cap
  const t0 = Date.now()
  const deadline = t0 + cap * 60_000
  const made = JSON.parse(
    doctl(['compute', 'droplet', 'create', tag, '--size', size, '--region', REGION!, '--image', image, '--ssh-keys', SSH_KEY!, '--tag-name', tag, '-o', 'json']),
  ) as { id: number }[]
  const id = made[0]!.id

  writeFileSync(join(OUT, 'droplet.json'), JSON.stringify({ id, tag, kind, size, region: REGION, t0, deadline }, null, 2))
  log(`created droplet ${id}; destroy deadline ${new Date(deadline).toISOString()}`)

  // the watchdog, detached so it outlives this process, its own output kept beside the run's
  const wout = openSync(join(OUT, 'watchdog.out'), 'a')
  const dog = spawn(process.execPath, [...process.execArgv, WATCHDOG, '--id', String(id), '--deadline', new Date(deadline).toISOString(), '--tag', tag], {
    detached: true,
    stdio: ['ignore', wout, wout],
    env: process.env,
  })

  dog.unref()
  closeSync(wout)
  log(`watchdog started (pid ${dog.pid}), logging to tmp/gpu-watchdog.log`)

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(signal, () => {
      log(`${signal}: destroying droplet ${id} before exiting`)
      process.exit(destroy(id, tag, RUN_LOG) ? 130 : 1)
    })
  }

  let gone = false

  try {
    type Detail = { status?: string; networks?: { v4?: { ip_address: string; type: string }[] } }

    let ip: string | undefined

    for (;;) {
      const d = (JSON.parse(doctl(['compute', 'droplet', 'get', String(id), '-o', 'json'])) as Detail[])[0]

      ip = d?.networks?.v4?.find(n => n.type === 'public')?.ip_address

      if (d?.status === 'active' && ip) {
        break
      }

      if (Date.now() > t0 + 15 * 60_000) {
        throw new Error(`droplet ${id} not active with an address in time (status ${d?.status})`)
      }

      pause(10)
    }

    const host = `root@${ip}`

    log(`droplet ${id} active`)
    waitSsh(host, Date.now() + 20 * 60_000)
    log('ssh up, and the machine runs commands')
    waitSetup(host)
    await runOn(host, job, deadline, 12, '-', { VIBE_SYSTEM_INSTALL: '1' })
  } catch (e) {
    log(`FAILED: ${(e as Error).message}`)
  } finally {
    gone = destroy(id, tag, RUN_LOG)

    const minutes = (Date.now() - t0) / 60_000

    log(
      `${gone ? 'destroyed' : 'NOT CONFIRMED DESTROYED'} droplet ${id}: ${minutes.toFixed(1)} min from create to gone, about $${((Math.max(minutes, 5) / 60) * price).toFixed(2)} at $${price}/h (a 5 min minimum)`,
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

  return gone && verdict
}

export async function main(): Promise<void> {
  // --verify <run directory>: the completeness check alone, on a run already fetched (no machine, no token)
  const check = arg('verify')

  if (check) {
    const missing = verify(check)

    console.log(missing.length === 0 ? 'RUN COMPLETE' : `RUN FAILED: missing ${missing.join(', ')}`)
    process.exit(missing.length === 0 ? 0 : 1)
  }

  if (HOST && HOST !== 'work') {
    console.error('droplet-run: --host takes "work" (the address itself comes from VIBE_WORK_HOST or the --host-tag droplet)')
    process.exit(2)
  }

  if (!HOST && (KIND !== 'cpu' && KIND !== 'gpu')) {
    console.error('droplet-run: give --kind cpu|gpu (a new droplet) or --host work (an existing machine)')
    process.exit(2)
  }

  let job: Job

  try {
    job = jobOf()
  } catch (e) {
    console.error(`droplet-run: ${(e as Error).message}`)
    process.exit(2)
  }

  const cap = Number(arg('cap-minutes') ?? process.env.VIBE_GPU_CAP_MINUTES ?? KINDS[KIND!].cap)
  const steps = job.steps.map(s => s.name).join(', ') || '(the script\'s own)'

  if (HOST) {
    const plan = `the existing ${HOST_TAG} host (nothing created or destroyed), job ${job.script} with steps ${steps}, all but ${SPARE} cores at nice 19, stopped on the host by ${cap} min, run directory ${REMOTE} removed at the end${KEEP ? ' (kept: --keep)' : ''}, and nothing outside it; cost: nothing beyond the host's own bill`

    if (!COMMIT) {
      console.log(`droplet-run plan (nothing touched without --commit): ${plan}`)

      return
    }

    mkdirSync(OUT, { recursive: true })
    log(`plan: ${plan}`)
    process.exit((await existing(job, cap)) ? 0 : 1)
  }

  const kind = KIND!
  const size = opt('size', ['VIBE_DROPLET_SIZE', 'VIBE_GPU_SIZE'], KINDS[kind].size)!
  const image = opt('image', ['VIBE_DROPLET_IMAGE', 'VIBE_GPU_IMAGE'], KINDS[kind].image)!

  if (!REGION || !SSH_KEY) {
    console.error('droplet-run: --region and --ssh-key (or VIBE_DROPLET_REGION and VIBE_DROPLET_SSH_KEY) are required')
    process.exit(2)
  }

  const price = process.env.DIGITALOCEAN_ACCESS_TOKEN ? priceHourly(size) : undefined
  const most = price === undefined ? 'unknown (run under the token to price it)' : `$${((cap / 60) * price).toFixed(2)} at $${price}/h`
  const plan = `one ${size} droplet in ${REGION}, image ${image}, named and tagged ${KINDS[kind].tag}, job ${job.script} with steps ${steps}, destroyed by ${cap} min at the latest; the most this run can cost: ${most}`

  if (!COMMIT) {
    console.log(`droplet-run plan (nothing created without --commit): ${plan}`)

    return
  }

  if (price === undefined) {
    console.error(`droplet-run: no price for size ${size} (is DIGITALOCEAN_ACCESS_TOKEN set, and the slug right?)`)
    process.exit(2)
  }

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'job.json'), JSON.stringify(job, null, 2))
  log(`plan: ${plan}`)
  process.exit((await created(kind, job, cap, size, image, price)) ? 0 : 1)
}

// run only when invoked directly (gpu-run.ts calls main itself)
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  void main()
}
