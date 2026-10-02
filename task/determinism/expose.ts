// Which registered experiments would print different numbers on x86-64 than on this arm64 Mac? A permanent audit.
//
//   tsx task/determinism/expose.ts expose [--list <file>] [--out <file>] [codes or ids...]
//   tsx task/determinism/expose.ts plain  [--list <file>] [--out <file>] [codes or ids...]
//   tsx task/determinism/expose.ts native [--list <file>] [--out <file>] [codes or ids...]
//   tsx task/determinism/expose.ts flip   [--list <file>] [--out <file>] [codes or ids...]
//
// expose  Math exactly as this machine has it. Every call to a function V8 takes from fdlibm (sin, cos, tan, asin,
//         acos, atan, atan2, exp, expm1, log, log1p, log2, log10, cbrt, sinh, cosh, tanh, asinh, acosh, atanh) is
//         also computed by the PLAIN restatement in task/determinism/fdlibm.ts, the x86-64 build, and a difference is
//         counted. Every Math.pow and every ** (lowered to Math.pow by task/determinism/lower-pow.ts, since V8 sends
//         both to the platform C library) is classified against the correctly rounded value of task/determinism/pow.ts:
//         exact, determined (this Mac is correctly rounded there and the margin clears MARGIN, so glibc agrees), hard
//         (within MARGIN of a midpoint, undetermined), or a MAC MISS (this Mac's pow is not correctly rounded there).
// plain   the same experiments with those twenty functions replaced by the PLAIN restatement, and pow by its
//         correctly rounded value: what an x86-64 node would print, if glibc's pow is correctly rounded on its calls.
// native  no instrument at all: this Mac's own run, the control that the instrument changes nothing.
// flip    the sensitivity test for the HARD pow calls: fdlibm as this machine has it, and every hard pow call rounded
//         the OTHER way (the double across the midpoint). An experiment whose verdict survives every hard call
//         misrounded at once does not hang on how glibc rounds them (no proof that a partial misrounding is
//         harmless, but every misrounding glibc could make is one of these, one call at a time).
//
// Each writes one JSON line per experiment (its verdict, its counts) as it goes, by default to
// tmp/determinism/<mode>.jsonl. task/determinism/compare.ts reads them.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { register } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RESTATED } from './fdlibm'
import { MARGIN, powOracle } from './pow'

type Mode = 'expose' | 'plain' | 'native' | 'flip'

const args = process.argv.slice(2)
const mode = args[0] as Mode

if (mode !== 'expose' && mode !== 'plain' && mode !== 'native' && mode !== 'flip') {
  console.error('usage: expose.ts expose|plain|native|flip [--list <file>] [--out <file>] [codes or ids...]')
  process.exit(1)
}

const option = (name: string): string | undefined => {
  const i = args.indexOf(name)

  return i < 0 ? undefined : args[i + 1]
}

const listFile = option('--list')
const outFile = option('--out') ?? fileURLToPath(new URL(`../../tmp/determinism/${mode}.jsonl`, import.meta.url))
const named = args.slice(1).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1]!.startsWith('--')))
const wanted = new Set([
  ...named,
  ...(listFile
    ? readFileSync(listFile, 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
    : []),
])

// ---- the counts for the experiment running now ----

type Counts = {
  calls: number
  checked: number
  differ: number
  byFunction: Record<string, number>
  firstDiffer: string
  unrestated: Record<string, number>
  pow: {
    calls: number
    special: number
    exact: number
    determined: number
    hard: number
    macMiss: number
    unchecked: number
    minMargin: number
    firstMiss: string
  }
}

const fresh = (): Counts => ({
  calls: 0,
  checked: 0,
  differ: 0,
  byFunction: {},
  firstDiffer: '',
  unrestated: {},
  pow: {
    calls: 0,
    special: 0,
    exact: 0,
    determined: 0,
    hard: 0,
    macMiss: 0,
    unchecked: 0,
    minMargin: 0.5,
    firstMiss: '',
  },
})

let counts = fresh()

// once an experiment has this many differing calls it is exposed, and checking the rest only costs time
const DIFFER_STOP = 1000
// the most inexact pow calls checked an experiment (the rest are counted as unchecked)
const POW_BUDGET = 20_000_000

// ---- the twenty fdlibm functions ----

const math = Math as unknown as Record<string, unknown>
const native: Record<string, (...a: number[]) => number> = {}

for (const name of Object.keys(RESTATED)) {
  native[name] = math[name] as (...a: number[]) => number
}

const nativePow = Math.pow

// a direct-mapped cache of inputs already checked, per function: repeated angles cost one lookup
const CACHE = 4096
const cacheKey = new Map<string, Float64Array>()
const cacheSeen = new Map<string, Uint8Array>()
const words = new Float64Array(1)
const halves = new Int32Array(words.buffer)

const slot = (x: number): number => {
  words[0] = x

  return (halves[0]! ^ Math.imul(halves[1]!, 0x9e3779b1)) & (CACHE - 1)
}

function differs(name: string, a: number[], here: number, plain: number): void {
  counts.differ++
  counts.byFunction[name] = (counts.byFunction[name] ?? 0) + 1

  if (!counts.firstDiffer) {
    counts.firstDiffer = `${name}(${a.join(', ')}) = ${here} here, ${plain} on x86-64`
  }

  if (importing) {
    // a table built when a module loads reaches every experiment that imports it: name the module
    const frames = (new Error().stack ?? '').split('\n').filter(l => /\/(code|test)\//.test(l))

    importSites.add(`${name}: ${frames.map(f => f.trim().replace(/^at /, '')).join(' < ') || 'unknown'}`)
  }
}

let importing = true

const importSites = new Set<string>()

function large(name: string): void {
  const key = `${name} (|x| >= 2^19 pi/2)`

  counts.unrestated[key] = (counts.unrestated[key] ?? 0) + 1
}

if (mode !== 'native') {
  // flip leaves the fdlibm functions as this machine has them
  for (const [name, restated] of mode === 'flip' ? [] : Object.entries(RESTATED)) {
    const own = native[name]!
    const plainOf = restated as (...a: number[]) => number

    cacheKey.set(name, new Float64Array(CACHE).fill(NaN))
    cacheSeen.set(name, new Uint8Array(CACHE))

    const keys = cacheKey.get(name)!
    const seen = cacheSeen.get(name)!

    if (name === 'atan2') {
      math[name] = (y: number, x: number): number => {
        counts.calls++

        if (mode === 'plain') {
          return plainOf(y, x)
        }

        const here = own(y, x)

        if (counts.differ < DIFFER_STOP) {
          counts.checked++

          const plain = plainOf(y, x)

          if (!Object.is(here, plain)) {
            differs(name, [y, x], here, plain)
          }
        }

        return here
      }

      continue
    }

    math[name] = (x: number): number => {
      counts.calls++

      if (mode === 'plain') {
        try {
          return plainOf(x)
        } catch {
          large(name)

          return own(x)
        }
      }

      const here = own(x)

      if (counts.differ >= DIFFER_STOP) {
        return here
      }

      const s = slot(x)

      if (seen[s] === 1 && Object.is(keys[s], x)) {
        return here
      }

      counts.checked++

      let plain: number

      try {
        plain = plainOf(x)
      } catch {
        large(name)

        return here
      }

      if (Object.is(here, plain)) {
        keys[s] = x
        seen[s] = 1
      } else {
        differs(name, [x], here, plain)
      }

      return here
    }
  }

  // ---- pow, and every ** ----

  const POW_CACHE = 65536
  const powX = new Float64Array(POW_CACHE).fill(NaN)
  const powY = new Float64Array(POW_CACHE).fill(NaN)
  const powKind = new Uint8Array(POW_CACHE)
  const powMargin = new Float64Array(POW_CACHE)
  const powValue = new Float64Array(POW_CACHE)
  const powAway = new Float64Array(POW_CACHE)

  // 1 special, 2 exact, 3 determined, 4 hard, 5 mac miss
  const record = (kind: number, margin: number, x: number, y: number, here: number, right: number): void => {
    const p = counts.pow

    if (kind === 1) {
      p.special++
    } else if (kind === 2) {
      p.exact++
    } else if (kind === 3) {
      p.determined++
    } else if (kind === 4) {
      p.hard++
    } else {
      p.macMiss++

      if (importing) {
        const frames = (new Error().stack ?? '').split('\n').filter(l => /\/(code|test)\//.test(l))

        importSites.add(`pow: ${frames.map(f => f.trim().replace(/^at /, '')).join(' < ') || 'unknown'}`)
      }

      if (!p.firstMiss) {
        p.firstMiss = `pow(${x}, ${y}) = ${here} here, correctly rounded ${right}, margin ${margin.toFixed(4)}`
      }
    }

    if (kind >= 3 && margin < p.minMargin) {
      p.minMargin = margin
    }
  }

  // x * x and its exact rounding error, by Dekker's product (no fused multiply-add needed)
  const SPLIT = 134217729

  // the double across the nearest midpoint from p = x * x, set by squareMargin
  let squareAway = 0

  const squareMargin = (x: number, p: number): number => {
    const c = SPLIT * x
    const hi = c - (c - x)
    const lo = x - hi
    const err = hi * hi - p + 2 * hi * lo + lo * lo

    if (err === 0) {
      squareAway = p

      return -1
    }

    words[0] = p

    const exponent = (halves[1]! >>> 20) & 0x7ff
    const ulp = 2 ** (exponent - 1075)
    // below a power of two the spacing halves
    const power = halves[0] === 0 && (halves[1]! & 0xfffff) === 0

    squareAway = err > 0 ? p + ulp : p - (power ? ulp / 2 : ulp)

    return 0.5 - Math.abs(err) / ulp
  }

  // [kind, margin, the correctly rounded value, the double across the midpoint]
  const kindOf = (x: number, y: number, here: number): [number, number, number, number] => {
    // y = 2, in the range where Dekker's product is exact
    if (y === 2 && Math.abs(x) < 2 ** 500 && Math.abs(x) > 2 ** -480) {
      const p = x * x
      const margin = squareMargin(x, p)

      if (!Object.is(here, p)) {
        return [margin > MARGIN ? 5 : 4, margin, p, squareAway]
      }

      return margin < 0 ? [2, 0.5, p, p] : [margin > MARGIN ? 3 : 4, margin, p, squareAway]
    }

    const s = (slot(x) ^ Math.imul(slot(y), 0x85ebca6b)) & (POW_CACHE - 1)

    let kind: number
    let margin: number
    let right: number
    let away: number

    if (powKind[s] !== 0 && Object.is(powX[s], x) && Object.is(powY[s], y)) {
      kind = powKind[s]!
      margin = powMargin[s]!
      right = powValue[s]!
      away = powAway[s]!
    } else {
      const answer = powOracle(x, y)

      right = answer.value
      away = answer.away
      margin = answer.margin
      kind = answer.special ? 1 : answer.exact ? 2 : margin > MARGIN ? 3 : 4
      powX[s] = x
      powY[s] = y
      powKind[s] = kind
      powMargin[s] = margin
      powValue[s] = right
      powAway[s] = away
    }

    if (!Object.is(here, right) && kind !== 1) {
      // a miss on a hard input may be glibc's answer too: only a miss with room to spare is a definite difference
      return [margin > MARGIN ? 5 : 4, margin, right, away]
    }

    return [kind, margin, right, away]
  }

  math.pow = (x: number | bigint, y: number | bigint): number | bigint => {
    if (typeof x === 'bigint' || typeof y === 'bigint') {
      return (x as bigint) ** (y as bigint)
    }

    counts.pow.calls++

    const here = nativePow(x, y)

    if (mode === 'plain') {
      return kindOf(x, y, here)[2]
    }

    if (counts.pow.determined + counts.pow.hard + counts.pow.macMiss >= POW_BUDGET) {
      counts.pow.unchecked++

      return here
    }

    const [kind, margin, right, away] = kindOf(x, y, here)

    record(kind, margin, x, y, here, right)

    if (mode === 'flip' && kind === 4) {
      // the other choice from this machine's
      return Object.is(here, right) ? away : right
    }

    return here
  }

  register('./lower-pow.ts', import.meta.url)
}

// ---- the run ----

const { allExperiments } = await import('@/test/scaffold/suite')

await import('@/test/experiment/all')

importing = false
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, '')
appendFileSync(outFile, `${JSON.stringify({ id: '(import)', mode, ...counts, importSites: [...importSites] })}\n`)

const list = allExperiments().filter(
  e => wanted.size === 0 || wanted.has(e.id) || (e.code !== undefined && wanted.has(e.code)),
)

console.log(`${mode}: ${list.length} experiments, writing ${outFile}`)

let n = 0

for (const e of list) {
  counts = fresh()

  const started = Date.now()

  let verdict: unknown = null
  let crash: string | null = null

  try {
    verdict = e.run({})
  } catch (error) {
    crash = (error as Error).message
  }

  const ms = Date.now() - started

  appendFileSync(outFile, `${JSON.stringify({ id: e.id, code: e.code ?? null, ms, ...counts, crash, verdict })}\n`)
  n++

  const p = counts.pow

  console.log(
    `${n} of ${list.length}  ${e.code ?? ''} ${e.id}  ${(ms / 1000).toFixed(1)} s  fdlibm ${counts.differ} of ${counts.calls} differ` +
      `  pow ${p.calls} (hard ${p.hard}, mac miss ${p.macMiss})`,
  )
}

console.log('done')
