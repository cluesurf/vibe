// REGISTER-HOLES ON A KERNEL: E-FND-0161's many-hole cycle (code/measure/register-holes holeCycle) and its band read
// (bandWeights), each the engine's own sequence of steps with the heavy loops on a kernel, and the tables they need.
// code/kernel/
//
// The profile (note/research/vibe/kernel.md) put a three-hole cycle on L = 4 at 5.6 s, half in oneBody (the member by
// member transfer) and half in pairPhases (the 4d FFTs over the torus in relative coordinates and the phase between), and
// a band read at 1.3 s. Those three loops are the primitives holeOneBody, holePair and holeBand.
//
// What stays in TypeScript, and why: every cosine and sine. pairPhases computes cos(sign phi) and sin(sign phi) of the
// summed pair angle phi at every relative site tuple, for every sector pattern; phaseTables below runs that loop exactly
// (the same active pairs in the same order, the same sum, the same Math.cos and Math.sin) once per angle table and sign,
// and the kernel receives the doubles. The 4d FFT's own twiddles are exact at L = 4 (the radix-4 butterfly multiplies
// by 1, i, -1 and -i) and are cos and sin of 2 pi m / L from torusFourier otherwise, passed in. The kernel runs the SAME
// transform, butterfly for butterfly, so the bytes match; a different FFT (a split radix, a different axis order) would
// round differently and is not allowed here.
//
// Only types come from register-holes, so the engine can import this file without a cycle.

import type { HoleFourierTables, HolePairTables, HolePhase, Kernel } from '@/code/kernel/types'
import type { CMatrix } from '@/code/measure/dock-mixer'
import type { HoleEngine, HoleFrame, HoleRule, Holes, TorusFourier } from '@/code/measure/register-holes'

// ---- the tables ----

export function holeFourierTables(F: TorusFourier): HoleFourierTables {
  return {
    classOfGrid: F.classOfGrid,
    gridOfSite: F.gridOfSite,
    gridOfClass: F.gridOfClass,
    cos: F.cos,
    sin: F.sin,
    // toSites' and toClasses' scales, the same expressions
    scales: Float64Array.from([1 / (2 * Math.sqrt(F.N)), 1 / Math.sqrt(F.N)]),
  }
}

// the per-class f x f matrices, concatenated (a[j * f * f + r * f + c])
export function flatMatrices(As: readonly CMatrix[], f: number): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(As.length * f * f)
  const im = new Float64Array(As.length * f * f)

  As.forEach((A, j) => {
    re.set(A.re.subarray(0, f * f), j * f * f)
    im.set(A.im.subarray(0, f * f), j * f * f)
  })

  return { re, im }
}

// the members in the sector for fiber tuple fb, in member order (register-holes pairPhases' inSector)
export function inSectorOf(fr: Pick<HoleFrame, 'fiber' | 'sector'>, n: number, fb: number): number[] {
  const f = fr.fiber
  const out: number[] = []

  for (let i = 0; i < n; i++) {
    const b = Math.floor(fb / f ** (n - 1 - i)) % f

    if (fr.sector[b]) {
      out.push(i)
    }
  }

  return out
}

// the active pairs of an in-sector list under a pair mask, in pairPhases' order
export function activePairs(inSector: readonly number[], pairs?: boolean[][]): [number, number][] {
  const out: [number, number][] = []

  for (let a = 0; a < inSector.length; a++) {
    for (let c = a + 1; c < inSector.length; c++) {
      if (pairs ? Boolean(pairs[inSector[a]!]?.[inSector[c]!]) : true) {
        out.push([inSector[a]!, inSector[c]!])
      }
    }
  }

  return out
}

// the sector patterns (in-sector member sets, as bit masks over the members) that carry at least one active pair, in
// increasing mask order, and each one's index
export function holePatterns(n: number, pairs?: boolean[][]): { masks: number[]; index: Map<number, number> } {
  const masks: number[] = []
  const index = new Map<number, number>()

  for (let mask = 0; mask < 1 << n; mask++) {
    const inSector = Array.from({ length: n }, (_, i) => i).filter(i => (mask >> i) & 1)

    if (activePairs(inSector, pairs).length > 0) {
      index.set(mask, masks.length)
      masks.push(mask)
    }
  }

  return { masks, index }
}

export const maskOf = (inSector: readonly number[]): number => inSector.reduce((m, i) => m | (1 << i), 0)

// pairPhases' phase at every relative site tuple, for every pattern: phi summed over the active pairs in order, then
// cos(sign phi) and sin(sign phi), skipped where phi is exactly 0, the same loop as the engine's
export function phaseTables(
  F: TorusFourier,
  n: number,
  angle: Float64Array,
  sign: 1 | -1,
  pairs: boolean[][] | undefined,
  masks: readonly number[],
): HolePhase {
  const N = F.N
  const tuples = N ** (n - 1)
  const cos = new Float64Array(masks.length * tuples)
  const sin = new Float64Array(masks.length * tuples)
  const skip = new Int8Array(masks.length * tuples)
  const siteOf = new Int32Array(n)

  masks.forEach((mask, p) => {
    const inSector = Array.from({ length: n }, (_, i) => i).filter(i => (mask >> i) & 1)
    const active = activePairs(inSector, pairs)
    const off = p * tuples

    for (let T = 0; T < tuples; T++) {
      let rest = T

      for (let i = n - 2; i >= 0; i--) {
        siteOf[i] = rest % N
        rest = Math.floor(rest / N)
      }

      siteOf[n - 1] = -1

      let phi = 0

      for (const [i, j] of active) {
        const si = siteOf[i]!
        const sj = siteOf[j]!
        const sep = sj < 0 ? si : F.diff[si * N + sj]!

        phi += angle[sep]!
      }

      if (phi !== 0) {
        cos[off + T] = Math.cos(sign * phi)
        sin[off + T] = Math.sin(sign * phi)
      } else {
        skip[off + T] = 1
      }
    }
  })

  return { cos, sin, skip }
}

// the dense engine's pair tables: an orbit is one fiber index with an active pair, every map the identity
export function densePairTables(
  fr: Pick<HoleFrame, 'fourier' | 'fiber' | 'sector'>,
  n: number,
  pairs?: boolean[][],
): { tables: HolePairTables; masks: number[] } {
  const N = fr.fourier.N
  const tuples = N ** (n - 1)
  const block = fr.fiber ** n
  const { masks, index } = holePatterns(n, pairs)
  const fbs: number[] = []
  const pattern: number[] = []

  for (let fb = 0; fb < block; fb++) {
    const p = index.get(maskOf(inSectorOf(fr, n, fb)))

    if (p !== undefined) {
      fbs.push(fb)
      pattern.push(p)
    }
  }

  const identity = Int32Array.from({ length: tuples }, (_, t) => t)

  return {
    tables: {
      rowOf: identity,
      permOf: new Int32Array(tuples),
      psign: Int32Array.from([1]),
      fbOf: Int32Array.from(fbs),
      pattern: Int32Array.from(pattern),
      writeOff: Int32Array.from({ length: fbs.length + 1 }, (_, k) => k),
      writeC: Int32Array.from(fbs),
      writeTau: new Int32Array(fbs.length),
      tOf: identity,
    },
    masks,
  }
}

// ---- the shape check a backend without its own (wasm) runs before any pointer is used ----

export type HolePairShape = {
  L: number
  N: number
  axes: number
  tuples: number
  rows: number
  nperm: number
  block: number
  orbits: number
}

const allIn = (a: Int32Array, lo: number, hi: number): boolean => a.every(x => x >= lo && x < hi)

export function holePairShape(
  re: Float64Array,
  im: Float64Array,
  F: HoleFourierTables,
  P: HolePairTables,
  ph: HolePhase,
): HolePairShape {
  const L = F.cos.length
  const N = F.gridOfSite.length
  const G = F.classOfGrid.length
  const tuples = P.rowOf.length
  const nperm = P.psign.length
  const orbits = P.pattern.length
  const bad = (what: string): never => {
    throw new Error(`vibe kernel: holePair ${what}`)
  }

  let axes = 0
  let span = 1

  while (span < tuples) {
    span *= N
    axes++
  }

  if (
    F.scales.length !== 2 ||
    F.sin.length !== L ||
    L ** 4 !== G ||
    N < 2 ||
    F.gridOfClass.length !== N ||
    span !== tuples ||
    axes < 1 ||
    P.permOf.length !== tuples ||
    nperm < 1 ||
    P.tOf.length % nperm !== 0 ||
    P.tOf.length === 0 ||
    P.fbOf.length !== orbits * nperm ||
    P.writeOff.length !== orbits + 1 ||
    P.writeTau.length !== P.writeC.length
  ) {
    bad('arguments out of range')
  }

  const rows = P.tOf.length / nperm

  if (re.length % rows !== 0 || im.length !== re.length || re.length === 0) {
    bad('state size')
  }

  const block = re.length / rows

  if (ph.sin.length !== ph.cos.length || ph.skip.length !== ph.cos.length || ph.cos.length % tuples !== 0) {
    bad('phase size')
  }

  const patterns = ph.cos.length / tuples
  const wo = P.writeOff

  let monotone = wo[0] === 0 && wo[orbits] === P.writeC.length

  for (let o = 0; o < orbits; o++) {
    monotone &&= wo[o]! <= wo[o + 1]!
  }

  if (
    !monotone ||
    !allIn(F.classOfGrid, 0, N) ||
    !allIn(F.gridOfSite, 0, G) ||
    !allIn(F.gridOfClass, 0, G) ||
    !allIn(P.rowOf, 0, rows) ||
    !allIn(P.permOf, 0, nperm) ||
    !P.psign.every(s => s === 1 || s === -1) ||
    !allIn(P.fbOf, 0, block) ||
    !allIn(P.pattern, 0, patterns) ||
    !allIn(P.writeC, 0, block) ||
    !allIn(P.writeTau, 0, nperm) ||
    !allIn(P.tOf, 0, tuples)
  ) {
    bad('index out of range')
  }

  // the orbits are disjoint (each fiber index written by one orbit once, an orbit gathering only what it writes), so a
  // threaded backend's rows never share an entry
  const owner = new Int32Array(block).fill(-1)

  for (let o = 0; o < orbits; o++) {
    for (let w = wo[o]!; w < wo[o + 1]!; w++) {
      if (owner[P.writeC[w]!]! >= 0) {
        bad('orbits overlap')
      }

      owner[P.writeC[w]!] = o
    }
  }

  for (let o = 0; o < orbits; o++) {
    for (let p = 0; p < nperm; p++) {
      if (owner[P.fbOf[o * nperm + p]!] !== o) {
        bad('an orbit reads outside itself')
      }
    }
  }

  // the row-by-row gather covers every tuple once
  for (let t = 0; t < tuples; t++) {
    if (P.tOf[P.rowOf[t]! * nperm + P.permOf[t]!] !== t) {
      bad('a tuple the gather never reaches')
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let p = 0; p < nperm; p++) {
      const t = P.tOf[r * nperm + p]!

      if (P.permOf[t] === p && P.rowOf[t] !== r) {
        bad('a tuple the gather reaches twice')
      }
    }
  }

  return { L, N, axes, tuples, rows, nperm, block, orbits }
}

// the shape of holeOneBody and holeBand: the rows, and every class a valid matrix
export function holeRowsShape(
  re: Float64Array,
  im: Float64Array,
  mom: Int32Array,
  n: number,
  f: number,
  aRe: Float64Array,
  aIm: Float64Array,
): number {
  const block = f ** n

  if (
    !Number.isInteger(n) ||
    !Number.isInteger(f) ||
    n < 1 ||
    n > 8 ||
    f < 1 ||
    f > 16 ||
    im.length !== re.length ||
    re.length % block !== 0 ||
    aIm.length !== aRe.length ||
    aRe.length % (f * f) !== 0 ||
    aRe.length === 0
  ) {
    throw new Error('vibe kernel: hole rows arguments out of range')
  }

  const rows = re.length / block

  if (mom.length !== rows * n || !allIn(mom, 0, aRe.length / (f * f))) {
    throw new Error('vibe kernel: hole rows index out of range')
  }

  return rows
}

// ---- the engine's steps ----

// the tables a dense engine's kernel path keeps: the flattened transfers and band projectors, the Fourier tables, and
// the pair tables and phases per rule (angle table, pair mask), built on first use
export type FastHoles = {
  k: Kernel
  fourier: HoleFourierTables
  A1: { re: Float64Array; im: Float64Array }
  A2: { re: Float64Array; im: Float64Array }
  up: { re: Float64Array; im: Float64Array }
  pairs: Map<string, { tables: HolePairTables; masks: number[] }>
  phases: WeakMap<Float64Array, Map<string, HolePhase>>
}

export function fastHoles(k: Kernel, fr: HoleFrame): FastHoles {
  return {
    k,
    fourier: holeFourierTables(fr.fourier),
    A1: flatMatrices(fr.A1, fr.fiber),
    A2: flatMatrices(fr.A2, fr.fiber),
    up: flatMatrices(fr.up, fr.fiber),
    pairs: new Map(),
    phases: new WeakMap(),
  }
}

const pairsKey = (pairs?: boolean[][]): string => (pairs ? JSON.stringify(pairs) : 'all')

function pairTablesFor(h: FastHoles, fr: HoleFrame, n: number, pairs?: boolean[][]): { tables: HolePairTables; masks: number[] } {
  const key = `${n} ${pairsKey(pairs)}`
  let t = h.pairs.get(key)

  if (!t) {
    t = densePairTables(fr, n, pairs)
    h.pairs.set(key, t)
  }

  return t
}

export function phaseFor(
  cache: WeakMap<Float64Array, Map<string, HolePhase>>,
  F: TorusFourier,
  n: number,
  angle: Float64Array,
  sign: 1 | -1,
  pairs: boolean[][] | undefined,
  masks: readonly number[],
): HolePhase {
  let byKey = cache.get(angle)

  if (!byKey) {
    byKey = new Map()
    cache.set(angle, byKey)
  }

  const key = `${n} ${sign} ${pairsKey(pairs)}`
  let ph = byKey.get(key)

  if (!ph) {
    ph = phaseTables(F, n, angle, sign, pairs, masks)
    byKey.set(key, ph)
  }

  return ph
}

// pairPhases on the kernel
function fastPairPhases(h: FastHoles, e: HoleEngine, s: Holes, rule: HoleRule, sign: 1 | -1): void {
  if (!rule.angle) {
    return
  }

  const { tables, masks } = pairTablesFor(h, e.frame, s.n, rule.pairs)

  if (tables.pattern.length === 0) {
    return
  }

  const ph = phaseFor(h.phases, e.frame.fourier, s.n, rule.angle, sign, rule.pairs, masks)

  h.k.holePair(s.re, s.im, h.fourier, tables, ph)
}

// holeCycle: beat 1 (the pair phases on S, then A1), beat 2 (the pair phases on D, reversed, then A2)
export function fastHoleCycle(h: FastHoles, e: HoleEngine, rule: HoleRule, s: Holes): void {
  const f = e.frame.fiber

  fastPairPhases(h, e, s, rule, 1)
  h.k.holeOneBody(s.re, s.im, e.mom, s.n, f, h.A1.re, h.A1.im)
  fastPairPhases(h, e, s, rule.angle2 === undefined ? rule : { ...rule, angle: rule.angle2 }, -1)
  h.k.holeOneBody(s.re, s.im, e.mom, s.n, f, h.A2.re, h.A2.im)
}

// bandWeights: the local sums on the kernel, then the sum over tuples in the reference's order
export function fastBandWeights(h: FastHoles, e: HoleEngine, s: Holes): Float64Array {
  const N = e.frame.fourier.N
  const n = s.n
  const tuples = s.re.length / e.frame.fiber ** n
  const part = new Float64Array(tuples * n)
  const out = new Float64Array(n * N)

  h.k.holeBand(s.re, s.im, e.mom, n, e.frame.fiber, h.up.re, h.up.im, part)

  for (let T = 0; T < tuples; T++) {
    for (let i = 0; i < n; i++) {
      out[i * N + e.mom[T * n + i]!]! += part[T * n + i]!
    }
  }

  return out
}
