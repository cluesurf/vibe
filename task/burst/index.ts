// THE BURST: run a batch of this package's jobs on ONE temporary DigitalOcean CPU droplet, started when there is work and
// destroyed as soon as it is done, so the laptop stays free and nothing bills while idle. task/burst/
//
//   burst plan   --jobs <jobs.json> [--size c-32]          the size, the threads per job, the hours and the dollars
//   burst up     --size <slug> --region <slug> --ssh-key <id> --identity <key file> [--cap-hours 12] [--cap-dollars 15]
//                [--reuse] --commit                         create ONE droplet tagged vibe-burst, stage, build the kernel
//   burst run    --jobs <jobs.json> [--keep-up] [--oversubscribe] --commit
//                                                           start every job, fetch each as it finishes, then destroy
//   burst run    --jobs <more.json> --detach --commit       add jobs to a live batch; its running `run` watches them
//   burst watch  [--keep-up]                                re-attach the waiting half of `run` (a lost laptop session)
//   burst stop   --job <name> --commit                      stop one job, keep its partial outputs, mark it done
//   burst sync   [--path <file> ...] [--changed] --commit   copy files into the staged package of a live batch
//                                                           (--changed: code/, test/, task/, kernel/src since the stage)
//   burst status                                            every vibe-burst droplet, its age and cost, each job's state
//   burst down   [--force] [--all] --commit                 fetch anything unfetched, then DESTROY the droplet
//
// Without --commit, up, run and down print what they would do and touch nothing.
//
// THE COST RULES, every one of them on by default:
//   - one droplet at a time: `up` refuses while any droplet carries the tag vibe-burst (`--reuse` restages that one)
//   - a hard cap, the EARLIER of --cap-hours (12) and --cap-dollars (15) at the size's hourly price, counted from the
//     create call. At the cap less 10 minutes `run` stops every job, fetches what there is, and destroys the droplet.
//     Each job is also bounded on the machine itself by `timeout`, at the cap less 20 minutes
//   - a detached watchdog (task/kernel/gpu-watchdog.ts) is started at the create, armed with the cap. It outlives this
//     process, so a crash, a closed laptop session or a hung ssh still ends in a destroyed droplet
//   - auto-down: `run` destroys the droplet once every job has finished and been fetched (--keep-up leaves it)
//   - the idle guard (task/burst/idle.sh) runs by cron ON the droplet and powers it off after 20 minutes with no job.
//     A powered-off droplet STILL BILLS, so the guard only stops the work. The destroy is always this command's
//   - `status` warns loudly about any vibe-burst droplet older than its cap, and `down` is safe to run at any time
//
// A jobs file is JSON: { "protect": [paths never written], "jobs": [{ "name", "threads", "hours", "command",
// "outputs": [paths or globs], "append": [paths], "log": path }] }. Every path is relative to the package. `command`
// runs by bash in the package on the droplet with THREADS, CORES and TSX set, node and tsx on PATH, and the package
// also reachable at its LOCAL absolute path (a link), so a tmp/ script that cds to this worktree works there unchanged.
// A finished job's outputs come back to the same paths here. An `append` file's NEW lines (those past its size when the
// job started) are appended to the local file instead of replacing it. A job still running at a `down` or at the cap
// has its outputs fetched to tmp/burst/jobs/<name>/partial/, never over the local files. See
// note/research/vibe/compute.md.
//
// The DigitalOcean token is read from the environment only (DIGITALOCEAN_ACCESS_TOKEN, which doctl reads itself),
// supplied by `term zone load cluesurf -- ...`. Nothing here reads a file for it or prints it.

import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { makeShell, PACKAGE_PATHS, pause, sizes, type Size } from '../kernel/droplet-shell'
import { destroy, doctl, tagged } from '../kernel/gpu-watchdog'

const ROOT = fileURLToPath(new URL('../..', import.meta.url)).replace(/\/$/, '')
const WATCHDOG = fileURLToPath(new URL('../kernel/gpu-watchdog.ts', import.meta.url))
const LOCAL = join(ROOT, 'tmp', 'burst')
const STATE = join(LOCAL, 'state.json')
const HISTORY = join(LOCAL, 'history.jsonl')
const LOG = join(LOCAL, 'burst.log')

const TAG = 'vibe-burst'
const BASE = '/root/vibe-runs/burst'
const PKG = `${BASE}/pkg`
const IMAGE = 'ubuntu-24-04-x64'
// the setup (node, rust, tsx, the native build) as counted in a plan
const SETUP_HOURS = 0.3
// the margins under the hard cap: where `run` stops and destroys, and where each job's own `timeout` fires
const STOP_MARGIN = 10 * 60_000
const JOB_MARGIN = 20 * 60_000
// how often the waiting half of `run` asks the droplet for its jobs' states
const WATCH_SECONDS = 120

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    jobs: { type: 'string' },
    size: { type: 'string' },
    region: { type: 'string' },
    'ssh-key': { type: 'string' },
    identity: { type: 'string' },
    image: { type: 'string' },
    'cap-hours': { type: 'string' },
    'cap-dollars': { type: 'string' },
    commit: { type: 'boolean', default: false },
    reuse: { type: 'boolean', default: false },
    'keep-up': { type: 'boolean', default: false },
    oversubscribe: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    all: { type: 'boolean', default: false },
    detach: { type: 'boolean', default: false },
    job: { type: 'string' },
    path: { type: 'string', multiple: true },
    changed: { type: 'boolean', default: false },
  },
})

const env = (name: string, ...names: string[]): string | undefined =>
  [name, ...names].map(n => process.env[n]).find(v => v !== undefined && v !== '')

const IDENTITY = opt.identity ?? env('VIBE_DROPLET_IDENTITY')

// every action, to tmp/burst/burst.log and the console, labeled with this process
const log = (line: string): void => {
  const text = `${new Date().toISOString()} [burst ${process.pid}] ${line}`

  mkdirSync(LOCAL, { recursive: true })
  appendFileSync(LOG, `${text}\n`)
  console.log(text)
}

mkdirSync(LOCAL, { recursive: true })

const shell = makeShell(join(LOCAL, 'known_hosts'), IDENTITY, log)

// ---- the state on this laptop ----

type JobSpec = {
  name: string
  threads: number
  hours: number
  command: string
  outputs: string[]
  append: string[]
  log?: string
}

type JobState = JobSpec & { launched: string; pid: number; exit?: number; fetched: boolean }

type Droplet = {
  id: number
  name: string
  ip?: string
  size: string
  region: string
  price: number
  vcpus: number
  created: number
  capHours: number
  capDollars: number
  deadline: number
  watchdogPid?: number
  // when the package was last copied over: `sync --changed` sends what changed here since
  stagedAt?: number
}

type State = { droplet?: Droplet; jobs: Record<string, JobState>; offsets: Record<string, number>; protect: string[] }

const load = (): State =>
  existsSync(STATE) ? (JSON.parse(readFileSync(STATE, 'utf8')) as State) : { jobs: {}, offsets: {}, protect: [] }

const save = (s: State): void => writeFileSync(STATE, `${JSON.stringify(s, null, 2)}\n`)

const history = (entry: Record<string, unknown>): void => appendFileSync(HISTORY, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`)

// ---- the jobs file ----

// a path the runner hands to a remote shell: relative to the package, plain characters (a glob's * allowed), no ..
const SAFE_PATH = /^[A-Za-z0-9_][A-Za-z0-9_.*/-]*$/
const safePath = (p: string): boolean => SAFE_PATH.test(p) && !p.split('/').includes('..')
const under = (p: string, dir: string): boolean => p === dir || p.startsWith(`${dir.replace(/\/$/, '')}/`)

function readJobs(file: string): { jobs: JobSpec[]; protect: string[] } {
  const raw = JSON.parse(readFileSync(resolve(file), 'utf8')) as { jobs?: Partial<JobSpec>[]; protect?: string[] }
  const protect = raw.protect ?? []
  const names = new Set<string>()
  const jobs = (raw.jobs ?? []).map((j): JobSpec => {
    const job: JobSpec = {
      name: j.name ?? '',
      threads: Number(j.threads),
      hours: Number(j.hours),
      command: j.command ?? '',
      outputs: j.outputs ?? [],
      append: j.append ?? [],
      log: j.log,
    }

    if (!/^[A-Za-z0-9_-]+$/.test(job.name) || names.has(job.name)) {
      throw new Error(`a job's name is letters, digits, _ and -, and unique: "${job.name}"`)
    }

    names.add(job.name)

    if (!Number.isInteger(job.threads) || job.threads < 1 || !(job.hours > 0) || job.command.trim() === '') {
      throw new Error(`job ${job.name}: threads (a whole number from 1), hours (an estimate above 0) and a command are required`)
    }

    for (const p of [...job.outputs, ...job.append, ...(job.log ? [job.log] : [])]) {
      if (!safePath(p)) {
        throw new Error(`job ${job.name}: ${p} is not a plain path relative to the package`)
      }

      if (protect.some(d => under(p, d))) {
        throw new Error(`job ${job.name}: ${p} is under a protected path`)
      }
    }

    for (const p of job.append) {
      if (job.outputs.includes(p) || p.includes('*')) {
        throw new Error(`job ${job.name}: ${p} is appended, so it is not also an output, and it is one file, not a glob`)
      }
    }

    return job
  })

  if (jobs.length === 0) {
    throw new Error(`no jobs in ${file}`)
  }

  return { jobs, protect }
}

// ---- prices and caps ----

function sizeOf(slug: string): Size {
  const s = sizes().find(x => x.slug === slug)

  if (!s) {
    throw new Error(`no size ${slug} in DigitalOcean's list (is DIGITALOCEAN_ACCESS_TOKEN set? run under term zone load)`)
  }

  return s
}

// the hard cap in hours: the earlier of the hour cap and the dollar cap at this price
const capOf = (capHours: number, capDollars: number, price: number): number => Math.min(capHours, capDollars / price)

const money = (x: number): string => `$${x.toFixed(2)}`
const hoursOf = (ms: number): number => ms / 3_600_000

function caps(): { capHours: number; capDollars: number } {
  return { capHours: Number(opt['cap-hours'] ?? 12), capDollars: Number(opt['cap-dollars'] ?? 15) }
}

// ---- ssh to the burst droplet ----

const hostOf = (d: Droplet): string => {
  if (!d.ip) {
    throw new Error(`droplet ${d.id} has no address recorded`)
  }

  return `root@${d.ip}`
}

const ssh = (d: Droplet, command: string, timeout = 120_000): string => shell.remote(hostOf(d), command, timeout)

// a file written on the droplet from stdin (no quoting of its content anywhere)
function put(d: Droplet, path: string, content: string | Buffer, mode?: string): void {
  const r = spawnSync('ssh', [...shell.options(), hostOf(d), `cat > ${path}${mode ? ` && chmod ${mode} ${path}` : ''} && echo vibe-put`], {
    input: content,
    maxBuffer: 1 << 26,
    timeout: 120_000,
  })

  if (r.status !== 0 || !r.stdout.toString().includes('vibe-put')) {
    throw new Error(`could not write ${path}: ${r.stderr?.toString().trim().split('\n')[0] ?? ''}`)
  }
}

// a tar stream from the droplet, unpacked into a local directory
function pull(d: Droplet, command: string, into: string): boolean {
  const r = spawnSync('ssh', [...shell.options(), hostOf(d), command], { maxBuffer: 1 << 30, timeout: 900_000 })

  if (r.status !== 0) {
    log(`fetch failed (${r.status}): ${r.stderr?.toString().trim().split('\n')[0] ?? ''}`)

    return false
  }

  mkdirSync(into, { recursive: true })

  const x = spawnSync('tar', ['-xzf', '-', '-C', into], { input: r.stdout, maxBuffer: 1 << 26 })

  if (x.status !== 0) {
    log(`unpacking into ${into} failed: ${x.stderr.toString().trim()}`)

    return false
  }

  return true
}

// ---- the droplet's life ----

const current = (): Droplet | undefined => load().droplet

function listed(id: number): { status: string } | undefined {
  return (JSON.parse(doctl(['compute', 'droplet', 'get', String(id), '-o', 'json'])) as { status: string }[])[0]
}

// a droplet the idle guard powered off is powered on again before anything is asked of it
function awake(d: Droplet): void {
  const s = listed(d.id)

  if (s?.status === 'off') {
    log(`droplet ${d.id} is powered off (the idle guard): powering it on`)
    doctl(['compute', 'droplet-action', 'power-on', String(d.id), '--wait'])
  }

  shell.waitSsh(hostOf(d), Date.now() + 5 * 60_000)
}

// the package as a tar stream over ssh, with tmp/ (the batch's scripts and inputs) but never this runner's own records
function stage(d: Droplet): void {
  const at = Date.now()
  const tar = spawnSync(
    'tar',
    [
      '-czf',
      '-',
      '--exclude',
      'node_modules',
      '--exclude',
      '.DS_Store',
      '--exclude',
      'tmp/burst',
      '--exclude',
      'tmp/droplet-run',
      '--exclude',
      'tmp/gpu-run',
      ...PACKAGE_PATHS,
      'tmp',
    ],
    { cwd: ROOT, env: { ...process.env, COPYFILE_DISABLE: '1' }, maxBuffer: 1 << 30 },
  )

  if (tar.status !== 0) {
    throw new Error(`tar failed: ${tar.stderr.toString()}`)
  }

  log(`copying ${(tar.stdout.length / 1e6).toFixed(1)} MB to ${PKG}`)

  const r = spawnSync('ssh', [...shell.options(), hostOf(d), `mkdir -p ${PKG} && tar -C ${PKG} -xzf - 2>/dev/null && test -f ${PKG}/task/burst/job.sh && echo vibe-copied`], {
    input: tar.stdout,
    maxBuffer: 1 << 26,
  })

  if (r.status !== 0 || !r.stdout.toString().includes('vibe-copied')) {
    throw new Error(`copy failed: ${r.stdout.toString().trim()} ${r.stderr.toString().trim()}`)
  }

  const s = load()

  if (s.droplet?.id === d.id) {
    s.droplet.stagedAt = at
    save(s)
  }
}

// the source trees `sync --changed` looks through. Never tmp/: running jobs write there
const SYNC_TREES = ['code', 'test', 'task', 'research', 'kernel/src']

// files of the package changed here since a time, relative to the package
function changedSince(at: number): string[] {
  const out: string[] = []

  for (const tree of SYNC_TREES) {
    const base = join(ROOT, tree)

    if (!existsSync(base)) {
      continue
    }

    for (const rel of readdirSync(base, { recursive: true }) as string[]) {
      const path = `${tree}/${rel}`
      const st = statSync(join(ROOT, path))

      if (st.isFile() && st.mtimeMs > at && !path.includes('node_modules') && !path.endsWith('.DS_Store')) {
        out.push(path)
      }
    }
  }

  return out.sort()
}

// copy single files (or the sources changed since the stage) into the staged package of a live batch. A running job
// already loaded its code and is not touched; a job started after the sync sees the new files. Refuses any file a
// running job writes, and anything outside the package
function sync(): number {
  const d = current()

  if (!d || !tagged(TAG).some(x => x.id === d.id)) {
    console.error('burst sync: no burst droplet is up')

    return 1
  }

  const s = load()
  const writing = new Set(
    Object.values(s.jobs)
      .filter(j => !j.fetched)
      .flatMap(j => [...j.outputs, ...j.append]),
  )
  const since = d.stagedAt ?? d.created
  const files = [...new Set([...(opt.path ?? []), ...(opt.changed ? changedSince(since) : [])])]

  if (files.length === 0) {
    console.error('burst sync: nothing to send (give --path <file> ..., or --changed for code/, test/, task/ and kernel/src changed since the stage)')

    return 2
  }

  for (const f of files) {
    if (!safePath(f) || f.includes('*') || !existsSync(join(ROOT, f)) || !statSync(join(ROOT, f)).isFile()) {
      console.error(`burst sync: ${f} is not a plain file of the package`)

      return 2
    }

    if (writing.has(f)) {
      console.error(`burst sync: ${f} is written by a running job; refusing to replace it`)

      return 1
    }
  }

  console.log(`burst sync to ${d.name}: ${files.length} file(s) changed here since ${new Date(since).toISOString()}${opt.changed ? '' : ' (named)'}:`)

  for (const f of files) {
    console.log(`  ${f}`)
  }

  if (!opt.commit) {
    console.log('(nothing sent without --commit)')

    return 0
  }

  awake(d)

  const tar = spawnSync('tar', ['-czf', '-', '--', ...files], { cwd: ROOT, env: { ...process.env, COPYFILE_DISABLE: '1' }, maxBuffer: 1 << 30 })

  if (tar.status !== 0) {
    console.error(`burst sync: tar failed: ${tar.stderr.toString()}`)

    return 1
  }

  const r = spawnSync('ssh', [...shell.options(), hostOf(d), `tar -C ${PKG} -xzf - && echo vibe-synced`], { input: tar.stdout, maxBuffer: 1 << 26 })

  if (r.status !== 0 || !r.stdout.toString().includes('vibe-synced')) {
    console.error(`burst sync: the copy failed: ${r.stderr.toString().trim()}`)

    return 1
  }

  log(`synced ${files.length} file(s) to ${d.name}: ${files.join(', ')}`)

  return 0
}

// stop one job: every process of its session, its exit recorded as 143, its outputs fetched to
// tmp/burst/jobs/<name>/partial/ (never over the local files), and the job marked done so the batch can finish
function stop(): number {
  const d = current()
  const name = opt.job ?? ''
  const job = load().jobs[name]

  if (!d || !job) {
    console.error(`burst stop: no job ${name} in the batch on the burst droplet`)

    return 1
  }

  if (job.fetched) {
    console.log(`burst stop: ${name} has already finished and been fetched`)

    return 0
  }

  if (!opt.commit) {
    console.log(`burst stop (nothing touched without --commit): stop ${name} (session ${job.pid}) on ${d.name} and keep its partial outputs`)

    return 0
  }

  awake(d)
  ssh(d, `pkill -TERM -s ${job.pid}; sleep 5; pkill -KILL -s ${job.pid}; [ -f ${jobDir(name)}/job.exit ] || echo 143 > ${jobDir(name)}/job.exit; echo stopped`, 60_000)
  fetchJob(d, job, false)

  const s = load()

  s.jobs[name] = { ...s.jobs[name]!, exit: 143, fetched: true }
  save(s)
  log(`${name}: stopped by hand (exit 143), partial outputs in tmp/burst/jobs/${name}/partial/`)

  return 0
}

// the idle guard, by cron every two minutes
function guard(d: Droplet): void {
  put(d, '/root/vibe-burst-idle.sh', readFileSync(join(ROOT, 'task/burst/idle.sh')), '755')
  put(d, '/etc/cron.d/vibe-burst-idle', '*/2 * * * * root /bin/sh /root/vibe-burst-idle.sh\n', '644')
  ssh(d, `mkdir -p ${BASE} && touch ${BASE}/active`)
  log('idle guard installed: powers the droplet off after 20 minutes with no job')
}

// follow one detached process's log on the droplet until it exits, up to a deadline; true once its exit file exists
function follow(d: Droplet, dir: string, pid: number, until: number): boolean {
  for (;;) {
    spawnSync('ssh', [...shell.options(), hostOf(d), `tail -n +1 --pid=${pid} -f ${dir}/job.log`], {
      stdio: ['ignore', 'inherit', 'inherit'],
      timeout: Math.max(1000, until - Date.now()),
    })

    const state = spawnSync('ssh', [...shell.options(), hostOf(d), `cat ${dir}/job.exit 2>/dev/null || echo running`], { timeout: 60_000 })
      .stdout?.toString()
      .trim()

    if (state && state !== 'running') {
      return true
    }

    if (Date.now() > until) {
      return false
    }

    pause(30)
  }
}

// the toolchain and the native kernel, through the same job droplet-run.ts uses (task/kernel/droplet-job.sh, with no
// steps), then the two links: node_modules to the tools' tsx, and the package at its local absolute path
function setup(d: Droplet): void {
  const cap = Math.floor((d.deadline - JOB_MARGIN - Date.now()) / 1000)
  const out = ssh(d, `mkdir -p ${BASE}/setup && cd ${PKG} && env VIBE_SYSTEM_INSTALL=1 bash task/kernel/droplet-launch.sh ${BASE}/setup ${cap} - task/kernel/droplet-job.sh`)
  const pid = Number((/vibe-launched-(\d+)/.exec(out))?.[1])

  if (!pid) {
    throw new Error(`the setup did not launch: ${out.trim()}`)
  }

  log(`setup started (session ${pid}): node, rust, tsx and the native kernel build`)

  if (!follow(d, `${BASE}/setup`, pid, Date.now() + 45 * 60_000)) {
    throw new Error('the setup did not finish in 45 minutes')
  }

  pull(d, `tar -C ${PKG}/tmp -czf - droplet-logs`, join(LOCAL, 'setup'))

  const steps = ssh(d, `cat ${PKG}/tmp/droplet-logs/steps.txt`)
  const failed = steps
    .split('\n')
    .map(l => l.trim().split(/\s+/))
    .filter(p => p.length >= 2 && p[1] !== '0')

  if (failed.length > 0 || !steps.includes('build_native 0')) {
    throw new Error(`the setup failed: ${steps.trim().replace(/\n/g, ', ')} (logs in tmp/burst/setup/droplet-logs)`)
  }

  if (!SAFE_PATH.test(ROOT.slice(1))) {
    throw new Error(`the package path ${ROOT} has characters the link would need quoted`)
  }

  ssh(d, `ln -sfn ${BASE}/tools/node_modules ${PKG}/node_modules && mkdir -p ${dirname(ROOT)} && ln -sfn ${PKG} ${ROOT} && test -f ${PKG}/kernel/host/vibe-kernel.node && echo ok`)
  log(`setup done: the native kernel is built, and the package is also at ${ROOT} on the droplet`)
}

function name(): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const made = existsSync(HISTORY)
    ? readFileSync(HISTORY, 'utf8')
        .split('\n')
        .filter(l => l.includes('"event":"create"') && l.includes(`vibe-burst-${day}-`)).length
    : 0

  return `vibe-burst-${day}-${made + 1}`
}

function up(): number {
  const size = opt.size ?? 'c-32'
  const region = opt.region ?? env('VIBE_DROPLET_REGION')
  const key = opt['ssh-key'] ?? env('VIBE_DROPLET_SSH_KEY')
  const image = opt.image ?? IMAGE
  const { capHours, capDollars } = caps()
  const existing = tagged(TAG)

  if (existing.length > 0 && !opt.reuse) {
    console.error(
      `burst up: refusing, ${existing.length} droplet(s) already tagged ${TAG}: ${existing.map(d => `${d.name} (${d.id})`).join(', ')}. ` +
        'Use it with --reuse, or end it with `burst down --commit`.',
    )

    return 1
  }

  if (opt.reuse) {
    const d = current()

    if (!d || !existing.some(x => x.id === d.id)) {
      console.error('burst up --reuse: no vibe-burst droplet recorded in tmp/burst/state.json matches the tagged list')

      return 1
    }

    const live = Object.values(load().jobs).filter(j => j.exit === undefined)

    if (live.length > 0) {
      console.error(`burst up --reuse: ${live.length} job(s) still running (${live.map(j => j.name).join(', ')}); restaging would overwrite their files`)

      return 1
    }

    if (!opt.commit) {
      console.log(`burst up --reuse (nothing touched without --commit): restage the package onto ${d.name} and rebuild the kernel`)

      return 0
    }

    awake(d)
    stage(d)
    setup(d)

    return 0
  }

  if (!region || !key) {
    console.error('burst up: --region and --ssh-key (or VIBE_DROPLET_REGION and VIBE_DROPLET_SSH_KEY) are required')

    return 2
  }

  const s = sizeOf(size)

  if (!s.regions.includes(region) || !s.available) {
    console.error(`burst up: ${size} is not offered in ${region} (offered in ${s.regions.join(' ') || 'no region'})`)

    return 2
  }

  const cap = capOf(capHours, capDollars, s.price_hourly)
  const plan = `one ${size} (${s.vcpus} vCPU, ${s.memory / 1024} GB) in ${region} at ${money(s.price_hourly)}/h, tagged ${TAG}, destroyed by ${cap.toFixed(1)} h at the latest (the earlier of ${capHours} h and ${money(capDollars)}): the most it can cost is ${money(cap * s.price_hourly)}`

  if (!opt.commit) {
    console.log(`burst up plan (nothing created without --commit): ${plan}`)

    return 0
  }

  log(`plan: ${plan}`)

  const t0 = Date.now()
  const deadline = t0 + cap * 3_600_000
  const dropletName = name()
  const made = JSON.parse(
    doctl(['compute', 'droplet', 'create', dropletName, '--size', size, '--region', region, '--image', image, '--ssh-keys', key, '--tag-name', TAG, '-o', 'json']),
  ) as { id: number }[]
  const d: Droplet = {
    id: made[0]!.id,
    name: dropletName,
    size,
    region,
    price: s.price_hourly,
    vcpus: s.vcpus,
    created: t0,
    capHours,
    capDollars,
    deadline,
  }
  const state = load()

  state.droplet = d
  save(state)
  history({ event: 'create', id: d.id, name: d.name, size, region, price: d.price, deadline: new Date(deadline).toISOString() })
  log(`created ${d.name} (${d.id}); hard cap ${new Date(deadline).toISOString()}`)

  // the watchdog, detached so it outlives this process
  const wout = openSync(join(LOCAL, 'watchdog.out'), 'a')
  const dog = spawn(
    process.execPath,
    [...process.execArgv, WATCHDOG, '--id', String(d.id), '--deadline', new Date(deadline).toISOString(), '--tag', TAG, '--log', join(LOCAL, 'watchdog.log')],
    { detached: true, stdio: ['ignore', wout, wout], env: process.env },
  )

  dog.unref()
  closeSync(wout)
  d.watchdogPid = dog.pid
  save({ ...load(), droplet: d })
  log(`watchdog armed (pid ${dog.pid}): destroys ${d.id} at the cap whatever happens here, logging to tmp/burst/watchdog.log`)

  try {
    for (;;) {
      type Detail = { status?: string; networks?: { v4?: { ip_address: string; type: string }[] } }

      const got = (JSON.parse(doctl(['compute', 'droplet', 'get', String(d.id), '-o', 'json'])) as Detail[])[0]
      const ip = got?.networks?.v4?.find(n => n.type === 'public')?.ip_address

      if (got?.status === 'active' && ip) {
        d.ip = ip
        save({ ...load(), droplet: d })
        break
      }

      if (Date.now() > t0 + 15 * 60_000) {
        throw new Error(`droplet ${d.id} not active with an address in 15 minutes (status ${got?.status})`)
      }

      pause(10)
    }

    log(`${d.name} active at ${d.ip}`)
    shell.waitSsh(hostOf(d), Date.now() + 20 * 60_000)
    shell.waitSetup(hostOf(d))
    guard(d)
    stage(d)
    setup(d)
    log(`${d.name} is up and ready: ${((Date.now() - t0) / 60_000).toFixed(1)} min from the create`)

    return 0
  } catch (e) {
    log(`burst up FAILED: ${(e as Error).message}`)

    if (opt['keep-up']) {
      log('left up (--keep-up): end it with `burst down --commit`')

      return 1
    }

    down('the up failed', true)

    return 1
  }
}

// ---- the jobs ----

const jobDir = (n: string): string => `${BASE}/jobs/${n}`

// one job's outputs, appended lines and its own log, brought back. final: to the package's own paths; otherwise (a job
// still running) to tmp/burst/jobs/<name>/partial/ so a half-written file never replaces a good local one
function fetchJob(d: Droplet, job: JobState, final: boolean): boolean {
  const state = load()

  let ok = pull(d, `tar -C ${BASE}/jobs -czf - ${job.name}`, join(LOCAL, 'jobs'))

  if (job.outputs.length > 0) {
    const found = ssh(d, `cd ${PKG} && ls -d -- ${job.outputs.join(' ')} 2>/dev/null; true`)
      .split('\n')
      .map(x => x.trim())
      .filter(x => x.length > 0 && safePath(x) && !state.protect.some(p => under(x, p)))

    if (found.length > 0) {
      const into = final ? ROOT : join(LOCAL, 'jobs', job.name, 'partial')

      ok = pull(d, `tar -C ${PKG} -czf - -- ${found.join(' ')}`, into) && ok
      log(`${job.name}: fetched ${found.join(', ')}${final ? '' : ` into ${into}`}`)
    }

    const missing = job.outputs.filter(o => !o.includes('*') && !found.includes(o))

    if (final && missing.length > 0) {
      log(`${job.name}: MISSING outputs ${missing.join(', ')}`)
    }
  }

  for (const path of job.append) {
    const from = state.offsets[path] ?? 0
    const r = spawnSync('ssh', [...shell.options(), hostOf(d), `tail -c +${from + 1} ${PKG}/${path} 2>/dev/null; true`], { maxBuffer: 1 << 28, timeout: 300_000 })

    if (r.status !== 0) {
      ok = false
      continue
    }

    // whole lines only: a line still being written is taken next time
    const text = r.stdout.toString('utf8')
    const whole = text.slice(0, text.lastIndexOf('\n') + 1)

    if (whole.length > 0) {
      mkdirSync(dirname(join(ROOT, path)), { recursive: true })
      appendFileSync(join(ROOT, path), whole)

      const now = load()

      now.offsets[path] = from + Buffer.byteLength(whole)
      save(now)
      log(`${job.name}: appended ${whole.split('\n').length - 1} line(s) to ${path}`)
    }
  }

  return ok
}

type Remote = { name: string; exit?: number }

// every job's exit code on the droplet (undefined: still running), in one call
function remoteStates(d: Droplet): Remote[] {
  const out = ssh(d, `for j in ${BASE}/jobs/*/; do [ -d "$j" ] || continue; printf '%s %s\\n' "$(basename "$j")" "$(cat "$j/job.exit" 2>/dev/null || echo -)"; done`)

  return out
    .split('\n')
    .map(l => l.trim().split(' '))
    .filter(p => p.length === 2)
    .map(([n, e]) => ({ name: n!, exit: e === '-' ? undefined : Number(e) }))
}

function settle(d: Droplet, final: boolean): { finished: number; running: number } {
  const states = remoteStates(d)

  let finished = 0
  let running = 0

  for (const job of Object.values(load().jobs)) {
    const r = states.find(s => s.name === job.name)

    if (r?.exit === undefined) {
      running++

      if (final && !job.fetched) {
        fetchJob(d, job, false)
      }

      continue
    }

    finished++

    if (!job.fetched) {
      log(`${job.name}: exit ${r.exit}${r.exit === 124 ? ' (stopped at the cap)' : ''}`)

      if (fetchJob(d, job, true)) {
        const s = load()

        s.jobs[job.name] = { ...s.jobs[job.name]!, exit: r.exit, fetched: true }
        save(s)
      }
    }
  }

  return { finished, running }
}

async function watch(): Promise<number> {
  for (;;) {
    const d = current()

    if (!d) {
      log('no burst droplet recorded (burst down ran): the watch ends')

      return 0
    }

    if (Date.now() >= d.deadline - STOP_MARGIN) {
      log(`the hard cap is reached (${new Date(d.deadline).toISOString()}): stopping the jobs, fetching, destroying`)

      return down('the hard cap', true)
    }

    try {
      const { finished, running } = settle(d, false)

      if (running === 0 && Object.values(load().jobs).every(j => j.fetched)) {
        log(`every job finished (${finished}) and is fetched`)

        if (opt['keep-up']) {
          log('left up (--keep-up): end it with `burst down --commit`')

          return 0
        }

        return down('every job is done', true)
      }
    } catch (e) {
      log(`the droplet did not answer (${(e as Error).message}); asking again in ${WATCH_SECONDS} s`)
    }

    await new Promise(r => setTimeout(r, WATCH_SECONDS * 1000))
  }
}

async function run(): Promise<number> {
  if (!opt.jobs) {
    console.error('burst run: --jobs <jobs.json> is required')

    return 2
  }

  const { jobs, protect } = readJobs(opt.jobs)
  const d = current()

  if (!d || !tagged(TAG).some(x => x.id === d.id)) {
    console.error('burst run: no burst droplet is up (burst up --commit first)')

    return 1
  }

  const state = load()
  const live = jobs.filter(j => state.jobs[j.name] && state.jobs[j.name]!.exit === undefined && !state.jobs[j.name]!.fetched)
  const busy = Object.values(state.jobs)
    .filter(j => !j.fetched)
    .reduce((n, j) => n + j.threads, 0)
  const threads = jobs.reduce((n, j) => n + j.threads, 0)

  if (live.length > 0) {
    console.error(`burst run: job(s) ${live.map(j => j.name).join(', ')} already running on the droplet`)

    return 1
  }

  if (threads + busy > d.vcpus && !opt.oversubscribe) {
    console.error(`burst run: ${threads} threads asked (and ${busy} still running) on ${d.vcpus} vCPUs; lower the budgets or pass --oversubscribe`)

    return 1
  }

  const left = hoursOf(d.deadline - Date.now())
  const longest = Math.max(...jobs.map(j => j.hours))

  console.log(`burst run on ${d.name}: ${jobs.length} jobs, ${threads} of ${d.vcpus} threads, ${left.toFixed(1)} h left before the hard cap`)

  for (const j of jobs) {
    console.log(`  ${j.name.padEnd(24)} ${String(j.threads).padStart(3)} threads  ~${j.hours} h  ${j.command}`)
  }

  if (longest > left - hoursOf(JOB_MARGIN)) {
    console.log(`  WARNING: the longest estimate (${longest} h) is past the cap; that job will be stopped there and only its partial outputs kept`)
  }

  if (!opt.commit) {
    console.log('(nothing started without --commit)')

    return 0
  }

  awake(d)

  const cap = Math.floor((d.deadline - JOB_MARGIN - Date.now()) / 1000)

  if (cap < 300) {
    console.error(`burst run: under 5 minutes left before the cap (${cap} s): not starting`)

    return 1
  }

  // every write below reads the state fresh: another `run` may be watching the same batch and saving fetches
  for (const j of jobs) {
    const offsets: Record<string, number> = {}

    for (const path of j.append) {
      // the append starts at the file's size on the droplet now: everything before is already in the local copy
      offsets[path] = load().offsets[path] ?? (Number(ssh(d, `stat -c %s ${PKG}/${path} 2>/dev/null || echo 0`).trim()) || 0)
    }

    ssh(d, `rm -rf ${jobDir(j.name)} && mkdir -p ${jobDir(j.name)}`)
    put(d, `${jobDir(j.name)}/command.sh`, `${j.command}\n`)
    put(d, `${jobDir(j.name)}/threads`, `${j.threads}\n`)

    const out = ssh(d, `cd ${PKG} && bash task/kernel/droplet-launch.sh ${jobDir(j.name)} ${cap} - task/burst/job.sh ${jobDir(j.name)}`)
    const pid = Number((/vibe-launched-(\d+)/.exec(out))?.[1])

    if (!pid) {
      log(`${j.name}: did NOT launch: ${out.trim()}`)
      continue
    }

    const s = load()

    s.protect = [...new Set([...s.protect, ...protect])]
    s.offsets = { ...offsets, ...s.offsets }
    s.jobs[j.name] = { ...j, launched: new Date().toISOString(), pid, fetched: false }
    save(s)
    log(`${j.name}: started (session ${pid}), ${j.threads} threads, stopped on the machine by ${(cap / 3600).toFixed(1)} h`)
  }

  ssh(d, `touch ${BASE}/active`)

  if (opt.detach) {
    log('every job started; --detach: the batch\'s running `run` (or `burst watch`) fetches them and brings the droplet down')

    return 0
  }

  log(`every job started; watching every ${WATCH_SECONDS} s, fetching each as it finishes${opt['keep-up'] ? '' : ', then destroying the droplet'}`)

  return watch()
}

// ---- status and down ----

function status(): number {
  const list = tagged(TAG) as unknown as { id: number; name: string; status: string; created_at: string; size_slug: string }[]
  const d = current()
  const prices = new Map(sizes().map(s => [s.slug, s.price_hourly]))

  if (list.length === 0) {
    console.log(`no droplet tagged ${TAG}: nothing is billing`)
  }

  for (const x of list) {
    const age = hoursOf(Date.now() - Date.parse(x.created_at))
    const price = prices.get(x.size_slug)
    const mine = d?.id === x.id
    const cap = mine ? capOf(d.capHours, d.capDollars, d.price) : 12

    console.log(
      `${x.name} (${x.id}) ${x.size_slug} ${x.status}, up ${age.toFixed(2)} h, ${price === undefined ? 'price unknown' : `${money(price)}/h, about ${money(age * price)} so far`}, cap ${cap.toFixed(1)} h${mine ? '' : ' (NOT in tmp/burst/state.json)'}`,
    )

    if (age > cap) {
      console.log(`  !!! WARNING: ${x.name} is ${age.toFixed(1)} h old, past its ${cap.toFixed(1)} h cap. Run: burst down --commit${mine ? '' : ' --all'}`)
    }

    if (x.status === 'off') {
      console.log('  !!! powered off (the idle guard) and STILL BILLING: burst down --commit')
    }
  }

  if (!d) {
    return 0
  }

  const jobs = Object.values(load().jobs)

  if (jobs.length === 0 || !list.some(x => x.id === d.id && x.status === 'active')) {
    for (const j of jobs) {
      console.log(`  ${j.name.padEnd(24)} ${j.exit === undefined ? 'unknown' : `exit ${j.exit}`}${j.fetched ? ', fetched' : ''}`)
    }

    return 0
  }

  const command = jobs
    .map(j => `printf '%s|%s|' ${j.name} "$(cat ${jobDir(j.name)}/job.exit 2>/dev/null || echo running)"; tail -n 1 ${j.log ? `${PKG}/${j.log}` : `${jobDir(j.name)}/job.log`} 2>/dev/null | cut -c 1-140; echo`)
    .join('; ')

  let out = ''

  try {
    out = ssh(d, command, 60_000)
  } catch (e) {
    console.log(`  the droplet did not answer: ${(e as Error).message}`)
  }

  for (const j of jobs) {
    const line = out.split('\n').find(l => l.startsWith(`${j.name}|`))
    const [, state, last] = line?.split('|') ?? []
    const shown = state === 'running' ? 'running' : `exit ${state ?? '?'}`

    console.log(`  ${j.name.padEnd(24)} ${shown.padEnd(8)} ${j.fetched ? 'fetched ' : ''}| ${(last ?? '').trim()}`)
  }

  return 0
}

function down(reason: string, auto = false): number {
  const d = current()
  const list = tagged(TAG)

  if (!d) {
    if (list.length === 0) {
      console.log(`no burst droplet recorded and none tagged ${TAG}: nothing to destroy`)

      return 0
    }

    if (!opt.all) {
      console.error(`burst down: ${list.length} droplet(s) tagged ${TAG} that tmp/burst/state.json does not know (${list.map(x => `${x.name} ${x.id}`).join(', ')}): pass --all to destroy them`)

      return 1
    }

    if (!opt.commit) {
      console.log(`burst down --all (nothing destroyed without --commit): would destroy ${list.map(x => x.name).join(', ')}`)

      return 0
    }

    return list.map(x => destroy(x.id, TAG, LOG)).every(Boolean) ? 0 : 1
  }

  if (!d.name.startsWith(`${TAG}-`)) {
    console.error(`burst down: the recorded droplet ${d.name} is not a vibe-burst droplet; refusing`)

    return 1
  }

  if (!opt.commit && !auto) {
    console.log(`burst down (nothing touched without --commit): fetch every unfetched job, then destroy ${d.name} (${d.id})`)

    return 0
  }

  log(`down (${reason}): fetching anything unfetched from ${d.name}`)

  let fetched = true

  if (list.some(x => x.id === d.id)) {
    try {
      awake(d)
      settle(d, true)
    } catch (e) {
      fetched = false
      log(`could not fetch: ${(e as Error).message}`)
    }
  }

  if (!fetched && !auto && !opt.force) {
    console.error('burst down: the fetch failed, so the droplet is left up. Look at `burst status`, or pass --force to destroy anyway')

    return 1
  }

  const gone = destroy(d.id, TAG, LOG)
  const hours = hoursOf(Date.now() - d.created)
  const cost = Math.max(hours, 5 / 60) * d.price

  log(`${gone ? 'destroyed' : 'NOT CONFIRMED DESTROYED'} ${d.name} (${d.id}): ${hours.toFixed(2)} h from create to gone, about ${money(cost)} at ${money(d.price)}/h`)

  if (!gone) {
    log('the watchdog stays armed; destroy it by hand: doctl compute droplet delete ' + d.id)

    return 1
  }

  if (d.watchdogPid) {
    try {
      process.kill(d.watchdogPid, 'SIGTERM')
    } catch {
      log('the watchdog had already exited')
    }
  }

  const s = load()
  const jobs = Object.values(s.jobs).map(j => `${j.name} ${j.exit === undefined ? 'unfinished (partial)' : `exit ${j.exit}`}`)

  history({ event: 'destroy', id: d.id, name: d.name, hours: Number(hours.toFixed(3)), dollars: Number(cost.toFixed(2)), reason, jobs })
  writeFileSync(join(LOCAL, `last-${d.name}.json`), `${JSON.stringify({ ...s, hours, dollars: cost, reason }, null, 2)}\n`)
  save({ jobs: {}, offsets: {}, protect: [] })

  return 0
}

// ---- plan ----

function plan(): number {
  if (!opt.jobs) {
    console.error('burst plan: --jobs <jobs.json> is required')

    return 2
  }

  const { jobs, protect } = readJobs(opt.jobs)
  const size = opt.size ?? 'c-32'
  const s = sizes().find(x => x.slug === size)
  const { capHours, capDollars } = caps()
  const threads = jobs.reduce((n, j) => n + j.threads, 0)
  const longest = Math.max(...jobs.map(j => j.hours))
  const wall = SETUP_HOURS + longest
  const cpuHours = jobs.reduce((n, j) => n + j.threads * j.hours, 0)

  console.log(`burst plan: ${jobs.length} jobs on one ${size}${s ? ` (${s.vcpus} vCPU, ${s.memory / 1024} GB, ${money(s.price_hourly)}/h, regions ${s.regions.join(' ')})` : ' (price unknown: run under term zone load)'}`)
  console.log(`  ${'job'.padEnd(24)} threads  hours  outputs`)

  for (const j of jobs) {
    console.log(`  ${j.name.padEnd(24)} ${String(j.threads).padStart(7)}  ${j.hours.toFixed(1).padStart(5)}  ${[...j.outputs, ...j.append.map(a => `${a} (appended)`)].join(', ')}`)
  }

  console.log(`  threads ${threads} of ${s?.vcpus ?? '?'}${s && threads > s.vcpus ? ' (OVER the budget: run needs --oversubscribe)' : ''}; busy ${((cpuHours / ((s?.vcpus ?? threads) * longest)) * 100).toFixed(0)}% of the machine over the longest job`)
  console.log(`  estimated: ${wall.toFixed(1)} h (setup ${SETUP_HOURS} h + the longest job ${longest} h)${s ? `, about ${money(wall * s.price_hourly)}` : ''}`)

  if (s) {
    const cap = capOf(capHours, capDollars, s.price_hourly)

    console.log(`  hard cap: ${cap.toFixed(1)} h (the earlier of ${capHours} h and ${money(capDollars)}), so the most it can cost is ${money(cap * s.price_hourly)}`)

    if (wall > cap) {
      console.log('  WARNING: the estimate is past the cap; the longest job would be stopped there')
    }
  }

  if (protect.length > 0) {
    console.log(`  never written: ${protect.join(', ')}`)
  }

  return 0
}

async function main(): Promise<number> {
  const command = positionals[0]

  try {
    switch (command) {
      case 'plan':
        return plan()
      case 'up':
        return up()
      case 'run':
        return await run()
      case 'watch':
        return await watch()
      case 'status':
        return status()
      case 'sync':
        return sync()
      case 'stop':
        return stop()
      case 'down':
        return down('burst down')
      default:
        console.error('usage: burst plan|up|run|watch|status|down [options] (see the top of task/burst/index.ts)')

        return 2
    }
  } catch (e) {
    console.error(`burst ${command}: ${(e as Error).message}`)

    return 1
  }
}

process.exitCode = await main()
