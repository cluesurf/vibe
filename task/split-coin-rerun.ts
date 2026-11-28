// Rerun the held results that use the coin on the split coin.
//
//   pnpm call task/split-coin-rerun.ts scan                       list the candidate experiments
//   pnpm call task/split-coin-rerun.ts both --dir tmp/split-coin   run them with the coin before, then the ones that
//                                                                  used the working beat with the coin split, then compare
//   pnpm call task/split-coin-rerun.ts run --place split --out x.jsonl [ids...]
//   pnpm call task/split-coin-rerun.ts compare --dir tmp/split-coin
//
// CANDIDATES: every registered experiment whose import closure reaches a file that CALLS the working beat
// (coinedVetoBeat or valueBeat, or their back beats), the only thing the place changes. An experiment that imports the
// coin file only for its constants or composes the coin by hand (coinBranch) is not a candidate: the place cannot reach
// it, and the counters below confirm it on every run (hand coins are counted apart). Two are left out because they set the place themselves or compare
// against the coin-before beat by design: foundations/coin-reversal (E-FND-0179, G0 reads the default beat) and
// foundations/split-coin (E-FND-0180).
//
// EACH PLACE RUNS IN ITS OWN PROCESS (setCoinPlace before any experiment), so no memo of one place reaches the other.
// Per experiment the run records its verdict and how often it called the working beat (coinUse().workingBeats, which
// the place changes) and the bare coin (coinBranches, a coin composed by hand, which it does not). The split pass runs
// only the experiments whose coin-before run called the working beat. The table lists, per experiment, the status
// under each place and every metric that differs (timing metrics left out).

import { spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { coinUse, setCoinPlace } from '@/code/rule/coined-locked-knit'
import { scrubPrivate } from '@/code/tool/private-path'
import { allExperiments, runSuite } from '@/test/scaffold/suite'
import '@/test/experiment/all'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LEFT_OUT = new Set(['foundations/coin-reversal', 'foundations/split-coin'])
// run last: the slowest (E-FND-0178's default run holds the R = 4 ball; E-FND-0171's V8 multi-modular null-space solve
// ran past 46 hours on one machine in clones split-coin and split-coin-2, 2026-11-14 to 11-16, with no line after its
// "V8: 3908 A rows", and held up every candidate behind it)
const LAST = new Set([
  'foundations/pair-conserved-search',
  'geometry/cusp-neighborhood',
  'geometry/honeycomb-quotient',
  'geometry/honeycomb-subgroup-search',
  'relativity/honeycomb-own-vacuum',
  'selves/attraction-in-a-bath',
  'quantum/position-interference',
  'foundations/value-phase',
])
const CHUNK = 40
const TIMING = /second|millis|elapsed|wall|(^|_)ms$|Ms$|duration/i

type Row = {
  id: string
  code: string
  place: string
  status: string
  claim: string
  metrics: Record<string, number>
  seconds: number
  workingBeats: number
  coinBranches: number
  error?: string
}

// ---- the import closure ----

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)

    if (statSync(p).isDirectory()) {
      walk(p, out)
    } else if (name.endsWith('.ts')) {
      out.push(p)
    }
  }
}

export function candidates(): string[] {
  const files: string[] = []

  walk(join(ROOT, 'code'), files)
  walk(join(ROOT, 'test', 'experiment'), files)

  const importers = new Map<string, Set<string>>()

  for (const f of files) {
    const from = relative(ROOT, f)
    const text = readFileSync(f, 'utf8')

    for (const m of text.matchAll(/(?:from|import)\s+'@\/([^']+)'/g)) {
      const to = `${m[1]}.ts`
      const set = importers.get(to) ?? new Set<string>()

      set.add(from)
      importers.set(to, set)
    }
  }

  // the seeds: every file that calls the working beat (the place changes nothing else)
  const seeds = files
    .filter(f => /\b(coinedVetoBeat|coinedVetoBeatBack|valueBeat|valueBeatBack)\(/.test(readFileSync(f, 'utf8')))
    .map(f => relative(ROOT, f))
  // breadth first, so each file's import distance from a call is known: the nearest experiments run first
  const distance = new Map<string, number>(seeds.map(f => [f, 0]))
  const queue = [...seeds]

  while (queue.length > 0) {
    const f = queue.shift()!

    for (const g of importers.get(f) ?? []) {
      if (!distance.has(g)) {
        distance.set(g, distance.get(f)! + 1)
        queue.push(g)
      }
    }
  }

  const registered = new Map<string, string>()

  for (const line of readFileSync(join(ROOT, 'test', 'registry.csv'), 'utf8').split('\n').slice(1)) {
    const cells = line.split(',')
    const file = cells[cells.length - 1]?.trim()
    const id = cells[3]

    if (file && id) {
      registered.set(file, id)
    }
  }

  const ranked = [...distance]
    .filter(([f]) => f.startsWith('test/experiment/') && f !== 'test/experiment/all.ts')
    .map(([f, d]) => ({ id: registered.get(f), d }))
    .filter((x): x is { id: string; d: number } => x.id !== undefined && !LEFT_OUT.has(x.id))
    .sort((p, q) => Number(LAST.has(p.id)) - Number(LAST.has(q.id)) || p.d - q.d || p.id.localeCompare(q.id))

  return ranked.map(x => x.id)
}

// ---- one place ----

function runPlace(place: 'before' | 'split', out: string, ids: readonly string[]): void {
  // registering an experiment computes nothing, so setting the place here comes before every beat
  setCoinPlace(place)
  mkdirSync(dirname(resolve(out)), { recursive: true })

  const experiments = allExperiments()
  const done = new Set(existsSync(out) ? readRows(out).map(r => r.id) : [])

  for (const id of ids) {
    if (done.has(id)) {
      continue
    }

    const e = experiments.find(x => x.id === id)

    if (!e) {
      throw new Error(`split-coin-rerun: no experiment ${id}`)
    }

    const use0 = coinUse()
    const started = Date.now()
    const row: Row = {
      id,
      code: e.code ?? '',
      place,
      status: 'crash',
      claim: '',
      metrics: {},
      seconds: 0,
      workingBeats: 0,
      coinBranches: 0,
    }

    try {
      const [result] = runSuite([e], {})

      row.status = result!.verdict.status
      row.claim = result!.verdict.claim
      row.metrics = result!.verdict.metrics
    } catch (err) {
      // an error message can carry an absolute path (a missing file, a failed import): scrubbed for the record
      row.error = scrubPrivate(err instanceof Error ? err.message : String(err))
    }

    const use1 = coinUse()

    row.seconds = (Date.now() - started) / 1000
    row.workingBeats = use1.workingBeats - use0.workingBeats
    row.coinBranches = use1.coinBranches - use0.coinBranches
    appendFileSync(out, `${JSON.stringify(row)}\n`)
    console.log(`${place} ${row.code} ${id} ${row.status} ${row.seconds.toFixed(1)} s working ${row.workingBeats} hand ${row.coinBranches}${row.error ? ` error ${row.error}` : ''}`)
  }
}

function readRows(file: string): Row[] {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(l => JSON.parse(l) as Row)
}

// ---- compare ----

function fmt(x: number | undefined): string {
  if (x === undefined) {
    return '-'
  }

  return Number.isInteger(x) ? String(x) : x.toPrecision(6)
}

export function compare(dir: string): string {
  const before = readRows(join(dir, 'before.jsonl'))
  const split = new Map(readRows(join(dir, 'split.jsonl')).map(r => [r.id, r]))
  const lines: string[] = [
    '| code | id | working beats | before | split | metrics that differ (before -> split) |',
    '| --- | --- | --- | --- | --- | --- |',
  ]
  const unreached: string[] = []

  for (const b of before) {
    if (b.workingBeats === 0) {
      unreached.push(`${b.code} ${b.id} (${b.status}${b.coinBranches > 0 ? `, hand coin ${b.coinBranches}` : ''})`)
      continue
    }

    const s = split.get(b.id)

    if (!s) {
      lines.push(`| ${b.code} | ${b.id} | ${b.workingBeats} | ${b.status} | not run | |`)
      continue
    }

    const keys = new Set([...Object.keys(b.metrics), ...Object.keys(s.metrics)])
    const diffs: string[] = []

    for (const k of keys) {
      if (TIMING.test(k)) {
        continue
      }

      const x = b.metrics[k]
      const y = s.metrics[k]

      if (x !== y && !(Number.isNaN(x) && Number.isNaN(y))) {
        diffs.push(`${k} ${fmt(x)} -> ${fmt(y)}`)
      }
    }

    const sStatus = s.error ? `crash: ${s.error.slice(0, 120)}` : s.status
    const bStatus = b.error ? `crash: ${b.error.slice(0, 120)}` : b.status

    lines.push(`| ${b.code} | ${b.id} | ${b.workingBeats} | ${bStatus} | ${sStatus} | ${diffs.length === 0 ? 'none' : diffs.join('; ')} |`)
  }

  lines.push('', `Not reached by the place (no working beat called): ${unreached.join(', ') || 'none'}`)

  return lines.join('\n')
}

// ---- the command ----

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`)

  return i >= 0 ? argv[i + 1] : undefined
}

function main(): void {
  const argv = process.argv.slice(2)
  const verb = argv[0]

  if (verb === 'scan') {
    const ids = candidates()

    console.log(ids.join('\n'))
    console.log(`${ids.length} candidates`)

    return
  }

  if (verb === 'run') {
    const place = flag(argv, 'place')
    const out = flag(argv, 'out')

    if ((place !== 'before' && place !== 'split') || !out) {
      throw new Error('split-coin-rerun: run --place before|split --out <file> [--from <before.jsonl>] [ids...]')
    }

    const from = flag(argv, 'from')
    const named = argv.slice(1).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.startsWith('--'))
    const ids = named.length > 0
      ? named
      : from
        ? readRows(from).filter(r => r.workingBeats > 0).map(r => r.id)
        : candidates()

    runPlace(place, out, ids)

    return
  }

  if (verb === 'both' || verb === 'compare') {
    const dir = resolve(ROOT, flag(argv, 'dir') ?? 'tmp/split-coin')

    if (verb === 'both') {
      mkdirSync(dir, { recursive: true })

      const self = fileURLToPath(import.meta.url)
      const tsx = join(ROOT, 'node_modules', '.bin', 'tsx')

      const all = candidates()
      const beforeFile = join(dir, 'before.jsonl')

      // in chunks, each place in its own process, so both places of the fast experiments land before the slow tail
      for (let at = 0; at < all.length; at += CHUNK) {
        const chunk = all.slice(at, at + CHUNK)
        const before = spawnSync(tsx, [self, 'run', '--place', 'before', '--out', beforeFile, ...chunk], {
          cwd: ROOT,
          stdio: 'inherit',
        })

        if (before.status !== 0) {
          throw new Error(`split-coin-rerun: the before pass exited ${before.status}`)
        }

        const users = readRows(beforeFile).filter(r => chunk.includes(r.id) && r.workingBeats > 0).map(r => r.id)

        if (users.length === 0) {
          continue
        }

        const split = spawnSync(tsx, [self, 'run', '--place', 'split', '--out', join(dir, 'split.jsonl'), ...users], {
          cwd: ROOT,
          stdio: 'inherit',
        })

        if (split.status !== 0) {
          throw new Error(`split-coin-rerun: the split pass exited ${split.status}`)
        }
      }
    }

    const table = compare(dir)

    writeFileSync(join(dir, 'table.md'), `${table}\n`)
    console.log(table)
    console.log('verdict: done')

    return
  }

  throw new Error('split-coin-rerun: scan | run | both | compare')
}

main()
