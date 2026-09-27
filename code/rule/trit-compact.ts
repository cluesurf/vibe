// The shaped light in bulk trits, with its counters in balanced ternary (E-FRC-0219, 0220).
//
// E-FRC-0214 made a hopping trit charge radiate the linear light exactly by shaping the carries level after
// level (code/rule/trit-husk-shaped): L levels, 2 L + 1 counters per husk triangle, each a cycling number in
// -D .. D. Held as thermometers (code/rule/trit-column), each counter is a column of D trits, and three levels
// need 1.34 times the trits the bulk holds. A thermometer is the least compact integer code there is: D trits
// hold 2D + 1 values. Balanced ternary holds 3^D.
//
// WHICH COLUMNS MAY BE POSITIONAL, AND WHICH MUST STAY THERMOMETERS. A column may be written in any code only
// if nothing in the bulk reads one of its trits on its own.
//   angle      a bulk triangle reads its own three links' angle trits (its angle sum is the bulk plaquette), and
//              the husk field is the column sum of those sums: every angle trit enters with weight one
//   string     a crossing vibe flips ONE string trit (E-FRC-0210), and Gauss's law holds dock by dock in the
//              bulk, div (s - C^T u) = v: every string trit is a unit of flux on its own bulk link
//   potential  the bulk flux on a bulk link is s - C^T u with each triangle's own u: a potential trit at depth
//              i with a positional weight 3^i would enter its own bulk link with weight one and the husk flux
//              with weight 3^i, and the column sum of the bulk flux would stop being the husk flux
// So the angle, the string and the potential are column sums with unit weights (the thermometer front is
// the reversible way to pay a kick into one, E-FRC-0207). A counter is different: nothing in the bulk reads a
// counter trit. The rule reads a counter only through its whole column's value, in the one non-additive step
// (the floor), which already reads whole columns (E-FRC-0207's theorem). So a counter may be held in any
// bijective code, and balanced ternary is the densest: k trits hold -(3^k - 1)/2 .. (3^k - 1)/2, exactly,
// with no rounding, and a counter in -D .. D needs k = ceil(log3(2D + 1)) trits.
//
// WHERE THE COUNTERS LIVE. The bulk already gives every husk triangle a counter column: one bulk triangle per
// column dock (D of them), each with three counter trits, 3 D trits in all (code/rule/trit-column). With
// balanced ternary the 2 L + 1 counters take (2 L + 1) k of them: counter c's digit d sits in slot j = c k + d,
// slot j being counter trit floor(j / D) of the column's triangle j mod D. So three levels fit when 7 k <= 3 D,
// which holds for every D >= 7 (D = 7: 21 of 21; D = 16: 28 of 48). At D = (3^k - 1) / 2 (13, 40, 121) the
// modulus q = 2D + 1 is 3^k and every trit pattern of a counter is a counter: no pattern is unused.
//
// HOW A COUNTER IS PAID. Adding delta to a counter is a carry chain down its own digits: the lowest digit
// takes delta, each digit keeps its balanced residue and hands the carry down, and the chain stops at the
// first zero carry. The result is the balanced ternary code of the new value (checked exhaustively by the
// callers); a counter never leaves -D .. D because the rule picks each new value in its window.
//
// The beat is code/rule/trit-husk-shaped's, read from and paid into the bulk trits: the drift reads the
// column sums of the bulk flux and pays each angle column's thermometer front, the kick reads the column sums
// of the bulk triangles' angle sums and the counters' values, takes the floors, and pays the counters (carry
// chains) and the potential columns (thermometer fronts). With `code: 'thermometer'` every counter is a column
// of D trits in its own store (more trits than the bulk holds: the reference the ternary rule must equal).
//
// Integers only: no float, no trig, no rounding. The one division is exact (a multiple of q divided by q).

import { writeColumn, type TritBulk, type TritLight } from '@/code/rule/trit-column'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type CounterCode = 'thermometer' | 'ternary'

// the trits a counter in -D .. D needs in balanced ternary
export function ternaryDigits(depth: number): number {
  let k = 0
  let reach = 0

  while (reach < depth) {
    reach = 3 * reach + 1
    k++
  }

  return k
}

// the balanced ternary digits of v, least significant first; throws if v does not fit k digits
export function encodeTernary(v: number, k: number, out: Int8Array | number[]): void {
  let x = v

  for (let d = 0; d < k; d++) {
    const r = mod(x + 1, 3) - 1

    out[d] = r
    x = (x - r) / 3
  }

  if (x !== 0) throw new Error(`${v} does not fit ${k} balanced trits`)
}

export function decodeTernary(digits: ArrayLike<number>, k: number): number {
  let v = 0

  for (let d = k - 1; d >= 0; d--) v = 3 * v + (digits[d] ?? 0)

  return v
}

// Add delta to the digits in place by the carry chain; returns the trits changed (by the size of the change)
// and the reach (the deepest digit changed, plus one)
export function carryAdd(digits: Int8Array | number[], k: number, delta: number): { flips: number; reach: number } {
  let carry = delta
  let flips = 0
  let reach = 0

  for (let d = 0; d < k && carry !== 0; d++) {
    const x = (digits[d] ?? 0) + carry
    const r = mod(x + 1, 3) - 1

    carry = (x - r) / 3

    if (r !== digits[d]) {
      flips += Math.abs(r - (digits[d] ?? 0))
      reach = d + 1
      digits[d] = r
    }
  }

  if (carry !== 0) throw new Error('a counter carried out of its column')

  return { flips, reach }
}

export type CompactLight = {
  readonly light: TritLight
  readonly bulk: TritBulk
  readonly levels: number
  readonly code: CounterCode
  // 2 L + 1: 0 level-1 counter, 1 its lag, 2 the final remainder, then 3 + 2 (i - 2) and 4 + 2 (i - 2) the
  // level-i counter and lag for i = 2 .. L
  readonly counters: number
  // trits per counter: k in ternary, D in thermometer
  readonly digits: number
  // per (husk triangle p, counter c, digit d), index (p * counters + c) * digits + d: the bulk triangle, the
  // store it is in, and its orientation relative to P
  readonly place: Int32Array
  readonly store: Int8Array
  readonly sign: Int8Array
  // the number of per-triangle trit stores the counters use: 3 in ternary (the bulk's own counter trits),
  // 2 L + 1 in thermometer
  readonly stores: number
  // scratch, allocated once
  readonly bulkFlux: Int32Array
  readonly huskFlux: Int32Array
  readonly field: Int32Array
  readonly value: Int32Array[] // per counter, per husk triangle
  readonly curl: Int32Array
  readonly spatial: Int32Array[] // per level, per husk triangle
  readonly digitScratch: Int8Array
}

export type CompactState = {
  readonly vibe: Int8Array
  readonly angle: Int8Array
  readonly string: Int8Array
  readonly potential: Int8Array
  // per-triangle counter stores (ternary: counter, lag, spatial of code/rule/trit-column's TritState)
  readonly store: Int8Array[]
}

export type CompactTally = { flips: number; reach: number; counterFlips: number; counterReach: number; potentialWraps: number; angleWraps: number }

export const emptyCompactTally = (): CompactTally => ({ flips: 0, reach: 0, counterFlips: 0, counterReach: 0, potentialWraps: 0, angleWraps: 0 })

export function makeCompactLight(light: TritLight, levels: number, code: CounterCode): CompactLight {
  const bulk = light.bulk
  const depth = bulk.depth
  const counters = 2 * levels + 1
  const digits = code === 'ternary' ? ternaryDigits(depth) : depth
  const stores = code === 'ternary' ? 3 : counters

  if (code === 'ternary' && counters * digits > 3 * depth) {
    throw new Error(`${counters} counters of ${digits} trits do not fit the ${3 * depth} counter trits of a column`)
  }

  const n = bulk.huskTriangles
  const place = new Int32Array(n * counters * digits)
  const store = new Int8Array(counters * digits)
  const sign = new Int8Array(n * counters * digits)

  for (let c = 0; c < counters; c++) {
    for (let d = 0; d < digits; d++) {
      const j = c * digits + d

      store[j] = code === 'ternary' ? Math.floor(j / depth) : c
    }
  }

  for (let p = 0; p < n; p++) {
    for (let c = 0; c < counters; c++) {
      for (let d = 0; d < digits; d++) {
        const j = c * digits + d
        const position = code === 'ternary' ? j % depth : d
        const at = (p * counters + c) * digits + d

        place[at] = bulk.counterColumn[p * depth + position] ?? 0
        sign[at] = bulk.counterColumnSign[p * depth + position] ?? 1
      }
    }
  }

  return {
    light,
    bulk,
    levels,
    code,
    counters,
    digits,
    place,
    store,
    sign,
    stores,
    bulkFlux: new Int32Array(bulk.links),
    huskFlux: new Int32Array(bulk.huskLinks),
    field: new Int32Array(n),
    value: Array.from({ length: counters }, () => new Int32Array(n)),
    curl: new Int32Array(bulk.huskLinks),
    spatial: Array.from({ length: levels }, () => new Int32Array(n)),
    digitScratch: new Int8Array(digits),
  }
}

export function emptyCompact(c: CompactLight): CompactState {
  const b = c.bulk

  return {
    vibe: new Int8Array(b.docks),
    angle: new Int8Array(b.links),
    string: new Int8Array(b.links),
    potential: new Int8Array(b.triangles),
    store: Array.from({ length: c.stores }, () => new Int8Array(b.triangles)),
  }
}

export function copyCompact(s: CompactState): CompactState {
  return {
    vibe: Int8Array.from(s.vibe),
    angle: Int8Array.from(s.angle),
    string: Int8Array.from(s.string),
    potential: Int8Array.from(s.potential),
    store: s.store.map(a => Int8Array.from(a)),
  }
}

// every trit array, for comparisons
export function compactArrays(s: CompactState): Int8Array[] {
  return [s.vibe, s.angle, s.string, s.potential, ...s.store]
}

// ---------------------------------------------------------------------------------------------------------
// counters

export function readCounter(c: CompactLight, s: CompactState, p: number, counter: number): number {
  const base = (p * c.counters + counter) * c.digits
  let v = 0

  if (c.code === 'thermometer') {
    for (let d = 0; d < c.digits; d++) v += c.sign[base + d]! * s.store[c.store[counter * c.digits + d]!]![c.place[base + d]!]!

    return v
  }

  for (let d = c.digits - 1; d >= 0; d--) v = 3 * v + c.sign[base + d]! * s.store[c.store[counter * c.digits + d]!]![c.place[base + d]!]!

  return v
}

// write a counter's new value: a thermometer front, or a carry chain of (new - old) down the ternary digits
export function writeCounter(c: CompactLight, s: CompactState, p: number, counter: number, v: number, tally?: CompactTally): void {
  const base = (p * c.counters + counter) * c.digits
  const k = c.digits

  if (c.code === 'thermometer') {
    const arr = s.store[counter]!
    const want = v > 0 ? 1 : v < 0 ? -1 : 0
    const n = Math.abs(v)

    if (n > k) throw new Error(`counter value ${v} does not fit a column of ${k}`)

    for (let d = 0; d < k; d++) {
      const o = c.sign[base + d]!
      const w = d < n ? want * o : 0
      const at = c.place[base + d]!
      const had = arr[at]!

      if (had !== w) {
        if (tally) {
          tally.counterFlips += Math.abs(w - had)
          tally.counterReach = Math.max(tally.counterReach, d + 1)
        }

        arr[at] = w
      }
    }

    return
  }

  const digits = c.digitScratch
  let old = 0

  for (let d = 0; d < k; d++) {
    digits[d] = c.sign[base + d]! * s.store[c.store[counter * k + d]!]![c.place[base + d]!]!
  }

  for (let d = k - 1; d >= 0; d--) old = 3 * old + digits[d]!

  if (old === v) return

  const r = carryAdd(digits, k, v - old)

  if (tally) {
    tally.counterFlips += r.flips
    tally.counterReach = Math.max(tally.counterReach, r.reach)
  }

  for (let d = 0; d < r.reach; d++) {
    s.store[c.store[counter * k + d]!]![c.place[base + d]!] = c.sign[base + d]! * digits[d]!
  }
}

// ---------------------------------------------------------------------------------------------------------
// the beat

const counterIndex = (level: number, lag: boolean): number => (level === 1 ? (lag ? 1 : 0) : 3 + 2 * (level - 2) + (lag ? 1 : 0))

function columnValue(trits: Int8Array | Int32Array, entries: Int32Array, signs: Int8Array | undefined, start: number, end: number): number {
  let v = 0

  for (let k = start; k < end; k++) v += (signs ? signs[k]! : 1) * trits[entries[k]!]!

  return v
}

// the bulk flux s - C^T u on every bulk link, and its column sums on the husk links
export function compactFlux(c: CompactLight, s: CompactState): void {
  const b = c.bulk
  const e = c.bulkFlux

  for (let l = 0; l < b.links; l++) e[l] = s.string[l]!

  for (let t = 0; t < b.triangles; t++) {
    const u = s.potential[t]!

    if (u === 0) continue

    const base = t * 3

    for (let j = base; j < base + 3; j++) e[b.triLinks[j]!] = e[b.triLinks[j]!]! - b.triSigns[j]! * u
  }

  for (let i = 0; i < b.huskLinks; i++) c.huskFlux[i] = columnValue(e, b.linkColumn, undefined, b.linkColumnStart[i]!, b.linkColumnStart[i + 1]!)
}

function driftTrits(c: CompactLight, s: CompactState, sign: number, tally?: CompactTally): void {
  const b = c.bulk
  const d = b.depth

  compactFlux(c, s)

  for (let i = 0; i < b.huskLinks; i++) {
    const start = b.linkColumnStart[i]!
    const end = b.linkColumnStart[i + 1]!
    const a = columnValue(s.angle, b.linkColumn, undefined, start, end)
    const n = i % 9 < 3 ? 4 * d : 2 * d
    const raw = a + sign * c.huskFlux[i]!
    const next = mod(raw + n / 2, n) - n / 2

    if (tally && next !== raw) tally.angleWraps++

    if (next !== a) {
      const r = writeColumn(s.angle, b.linkColumn, undefined, start, end - start, next)

      if (tally) {
        tally.flips += r.flips
        tally.reach = Math.max(tally.reach, r.reach)
      }
    }
  }
}

// the plaquette fields B_P read from the bulk triangles' angle sums, centered mod 4D
function fieldsFromBulk(c: CompactLight, s: CompactState): void {
  const b = c.bulk
  const nb = 4 * b.depth

  for (let p = 0; p < b.huskTriangles; p++) {
    let v = 0

    for (let k = b.triColumnStart[p]!; k < b.triColumnStart[p + 1]!; k++) {
      const t = b.triColumn[k]!
      const o = b.triColumnSign[k]!
      const base = t * 3

      v += o * (b.triSigns[base]! * s.angle[b.triLinks[base]!]! + b.triSigns[base + 1]! * s.angle[b.triLinks[base + 1]!]! + b.triSigns[base + 2]! * s.angle[b.triLinks[base + 2]!]!)
    }

    c.field[p] = mod((2 * v) / b.multiplicity[p]! + nb / 2, nb) - nb / 2
  }
}

function curlWeighted(b: TritBulk, x: Int32Array, p: number): number {
  const base = p * 3
  const l0 = b.huskTriLinks[base]!
  const l1 = b.huskTriLinks[base + 1]!
  const l2 = b.huskTriLinks[base + 2]!

  return b.huskTriSigns[base]! * b.weight[l0 % 9]! * x[l0]! + b.huskTriSigns[base + 1]! * b.weight[l1 % 9]! * x[l1]! + b.huskTriSigns[base + 2]! * b.weight[l2 % 9]! * x[l2]!
}

// out[p] = n_P p (C W C^T x)_P
function spatialTerm(c: CompactLight, x: Int32Array, out: Int32Array): void {
  const b = c.bulk
  const curl = c.curl
  const pp = c.light.p

  curl.fill(0)

  for (let p = 0; p < b.huskTriangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    const base = p * 3

    for (let j = base; j < base + 3; j++) curl[b.huskTriLinks[j]!] = curl[b.huskTriLinks[j]!]! + b.huskTriSigns[j]! * v
  }

  for (let p = 0; p < b.huskTriangles; p++) out[p] = b.multiplicity[p]! * pp * curlWeighted(b, curl, p)
}

function readAllCounters(c: CompactLight, s: CompactState): void {
  for (let k = 0; k < c.counters; k++) {
    const out = c.value[k]!

    for (let p = 0; p < c.bulk.huskTriangles; p++) out[p] = readCounter(c, s, p, k)
  }
}

function payPotential(c: CompactLight, s: CompactState, p: number, k: number, tally?: CompactTally): void {
  if (k === 0) return

  const b = c.bulk
  const start = b.triColumnStart[p]!
  const end = b.triColumnStart[p + 1]!
  const u = columnValue(s.potential, b.triColumn, b.triColumnSign, start, end)
  const w = b.multiplicity[p]! * b.depth
  const raw = u + k
  const next = mod(raw + w, 2 * w + 1) - w

  if (tally && next !== raw) tally.potentialWraps++

  const r = writeColumn(s.potential, b.triColumn, b.triColumnSign, start, end - start, next)

  if (tally) {
    tally.flips += r.flips
    tally.reach = Math.max(tally.reach, r.reach)
  }
}

// one beat, in place
export function compactBeat(c: CompactLight, s: CompactState, tally?: CompactTally): void {
  const b = c.bulk
  const h = b.depth
  const q = c.light.q
  const pp = c.light.p
  const levels = c.levels

  driftTrits(c, s, 1, tally)
  fieldsFromBulk(c, s)
  readAllCounters(c, s)

  for (let i = 1; i <= levels; i++) spatialTerm(c, c.value[counterIndex(i, false)]!, c.spatial[i - 1]!)

  const rem = c.value[2]!

  for (let p = 0; p < b.huskTriangles; p++) {
    const top = c.spatial[levels - 1]![p]!
    let w = floorDiv(top + rem[p]! + h, q)

    rem[p] = top + rem[p]! - q * w

    for (let i = levels; i >= 2; i--) {
      const now = c.value[counterIndex(i, false)]!
      const lag = c.value[counterIndex(i, true)]!
      const rest = c.spatial[i - 2]![p]! - 2 * now[p]! + lag[p]! + w
      const v = floorDiv(rest + h, q)

      lag[p] = now[p]!
      now[p] = q * v - rest
      w = v
    }

    const now = c.value[0]!
    const lag = c.value[1]!
    const rest = b.multiplicity[p]! * pp * c.field[p]! - 2 * now[p]! + lag[p]! + w
    const k = floorDiv(rest + h, q)

    lag[p] = now[p]!
    now[p] = q * k - rest

    for (let x = 0; x < c.counters; x++) writeCounter(c, s, p, x, c.value[x]![p]!, tally)

    payPotential(c, s, p, k, tally)
  }
}

// the inverse of compactBeat
export function compactBeatBack(c: CompactLight, s: CompactState): void {
  const b = c.bulk
  const h = b.depth
  const q = c.light.q
  const pp = c.light.p
  const levels = c.levels

  fieldsFromBulk(c, s)
  readAllCounters(c, s)

  for (let i = 1; i <= levels; i++) spatialTerm(c, c.value[counterIndex(i, true)]!, c.spatial[i - 1]!)

  const rem = c.value[2]!

  for (let p = 0; p < b.huskTriangles; p++) {
    const top = c.spatial[levels - 1]![p]!
    const r = rem[p]!
    let w = floorDiv(top - r + h, q)

    rem[p] = r - top + q * w

    for (let i = levels; i >= 2; i--) {
      const now = c.value[counterIndex(i, false)]!
      const lag = c.value[counterIndex(i, true)]!
      const y = now[p]! + c.spatial[i - 2]![p]! - 2 * lag[p]! + w
      const v = floorDiv(y + h, q)

      now[p] = lag[p]!
      lag[p] = q * v - y
      w = v
    }

    const now = c.value[0]!
    const lag = c.value[1]!
    const y = now[p]! + b.multiplicity[p]! * pp * c.field[p]! - 2 * lag[p]! + w
    const k = floorDiv(y + h, q)

    now[p] = lag[p]!
    lag[p] = q * k - y

    for (let x = 0; x < c.counters; x++) writeCounter(c, s, p, x, c.value[x]![p]!)

    payPotential(c, s, p, -k)
  }

  driftTrits(c, s, -1)
}

// ---------------------------------------------------------------------------------------------------------
// reading the husk integers out of the trits, and writing a start

export type HuskShapedValues = {
  angle: Int32Array
  potential: Int32Array
  string: Int32Array
  counter: Int32Array[] // per counter index
}

export function readCompactHusk(c: CompactLight, s: CompactState): HuskShapedValues {
  const b = c.bulk
  const angle = new Int32Array(b.huskLinks)
  const string = new Int32Array(b.huskLinks)
  const potential = new Int32Array(b.huskTriangles)
  const counter = Array.from({ length: c.counters }, () => new Int32Array(b.huskTriangles))

  for (let i = 0; i < b.huskLinks; i++) {
    angle[i] = columnValue(s.angle, b.linkColumn, undefined, b.linkColumnStart[i]!, b.linkColumnStart[i + 1]!)
    string[i] = columnValue(s.string, b.linkColumn, undefined, b.linkColumnStart[i]!, b.linkColumnStart[i + 1]!)
  }

  for (let p = 0; p < b.huskTriangles; p++) {
    potential[p] = columnValue(s.potential, b.triColumn, b.triColumnSign, b.triColumnStart[p]!, b.triColumnStart[p + 1]!)

    for (let k = 0; k < c.counters; k++) counter[k]![p] = readCounter(c, s, p, k)
  }

  return { angle, potential, string, counter }
}

// write husk angles, potentials and counters as trits (strings are placed by the caller along bulk paths)
export function writeCompactHusk(c: CompactLight, s: CompactState, v: { angle: ArrayLike<number>; potential: ArrayLike<number>; counter: ArrayLike<number>[] }): void {
  const b = c.bulk

  for (let i = 0; i < b.huskLinks; i++) {
    writeColumn(s.angle, b.linkColumn, undefined, b.linkColumnStart[i]!, b.linkColumnStart[i + 1]! - b.linkColumnStart[i]!, v.angle[i] ?? 0)
  }

  for (let p = 0; p < b.huskTriangles; p++) {
    writeColumn(s.potential, b.triColumn, b.triColumnSign, b.triColumnStart[p]!, b.triColumnStart[p + 1]! - b.triColumnStart[p]!, v.potential[p] ?? 0)

    for (let k = 0; k < c.counters; k++) writeCounter(c, s, p, k, v.counter[k]?.[p] ?? 0)
  }
}

// the column sums of the bulk flux against S - C^T U computed from the column values: mismatched husk links.
// With unit-weight potential columns this is 0 by construction; the callers use it as the control that a
// positional potential column breaks the reading
export function columnSumIdentityMismatches(c: CompactLight, s: CompactState, potentialValue: (p: number) => number): number {
  const b = c.bulk

  compactFlux(c, s)

  const expected = new Int32Array(b.huskLinks)

  for (let i = 0; i < b.huskLinks; i++) expected[i] = columnValue(s.string, b.linkColumn, undefined, b.linkColumnStart[i]!, b.linkColumnStart[i + 1]!)

  for (let p = 0; p < b.huskTriangles; p++) {
    const u = potentialValue(p)

    if (u === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) expected[b.huskTriLinks[j]!] = expected[b.huskTriLinks[j]!]! - b.huskTriSigns[j]! * u
  }

  let bad = 0

  for (let i = 0; i < b.huskLinks; i++) bad += expected[i] === c.huskFlux[i] ? 0 : 1

  return bad
}
