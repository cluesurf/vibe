// The second law, the arrow of time and the depth as the husk's bath, on the adopted knit (E-FND-0146 to E-FND-0148).
//
// THE KNIT. The coset-union vacuum (code/measure/dense-hub, E-RLT-0093, the default dock-varying vacuum since
// 2026-09-26) under the lone bounce collision L (E-RLT-0084), run by the fast bounce kernel
// (code/measure/bounce-pair-kernel), which E-RLT-0084 gates bit for bit against the rule. This file adds the kernel's
// EXACT INVERSE BEAT (the stream undone, then the collision pieces in the other order, each its own inverse), which the
// kernel file does not have. Nothing in the rule is changed: the inverse is the rule's own inverse, checked here by
// running forward and back to the bit.
//
// THE HUSK. The column sum along the depth (code/measure/photon-husk): a bulk dock at standard coordinates v lies in the
// husk column (v1, v2, v3) mod L, one of L^3, each holding L bulk docks. A slot of root r casts the directed husk
// direction (r1, r2, r3): 6 axis directions cast by 2 roots each and 12 diagonal ones cast by 1, so a husk MODE (a
// column and a directed husk direction) holds g = 2L slots on an axis and L on a diagonal.
//
// THE COARSE MAP, fixed before any run: the husk is cut into cubic BLOCKS of b x b x b columns (b divides L); the coarse
// state is the energy per block, E_b = (held slots) + 2 (nonzero store trits) over the block's docks, the knit's own
// conserved energy (E-RLT-0064) summed. The coarse entropy is H = - sum_b p_b ln p_b, p_b = E_b / E, whose largest value
// is ln B (B blocks). E is exactly conserved, so p is a distribution at every beat.
//
// NO ROUNDING, NO CONTINUITY in the rule: permutations of trits and integer points by grid-move tables. Reals appear only
// in the readers (entropies, correlations, temperatures) and in the Weyl start (a measurement choice, not the rule).
// DETERMINISM: every start is a Weyl sequence (golden and silver rates); nothing is drawn.
// NOTHING MOVES: the stream copies each slot's vibe one dock along its root.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { coinMove, pairMove, bounceKernelBeat, makeBounceKernel, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { makeColorWeave } from '@/code/rule/color-weave'
import { denseFresh, type DenseFresh, type StoreKind } from '@/code/measure/dense-hub'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { collisionOrder, separatedLayout } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { d4BoxCell, d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const modulo = (x: number, m: number): number => ((x % m) + m) % m
const frac = (x: number): number => x - Math.floor(x)

// the 18 directed husk directions: index by (r1, r2, r3) of the slot's root
const HUSK_KEY = new Map<string, number>()
export const HUSK_DIRECTION = Int32Array.from(ROOTS, r => {
  const key = `${r[0]},${r[1]},${r[2]}`

  if (!HUSK_KEY.has(key)) HUSK_KEY.set(key, HUSK_KEY.size)

  return HUSK_KEY.get(key) as number
})
export const HUSK_DIRECTIONS = HUSK_KEY.size
// how many roots cast each directed husk direction (2 on an axis, 1 on a diagonal)
export const HUSK_MULTIPLICITY = Int32Array.from({ length: HUSK_DIRECTIONS }, (_, h) => Array.from(HUSK_DIRECTION).filter(x => x === h).length)

export type ArrowBox = {
  readonly fresh: DenseFresh
  readonly kernel: BounceKernel
  readonly side: number
  readonly cells: number
  readonly blockSide: number
  readonly blocks: number
  // per dock: its husk column, depth (v4 mod 2L), husk block, and the dock one depth step 2 e4 along
  readonly column: Int32Array
  readonly depth: Int32Array
  readonly block: Int32Array
  readonly along: Int32Array
  // per slot: the inverse of the grid move its stream applies
  readonly inverseMove: readonly Int8Array[]
}

// `identityLinks`: every link's grid move the identity (a CONTROL, not the adopted start: the role points then never
// change along the stream, so the depth step 2 e4 commutes with the beat on a depth-invariant vacuum)
export function arrowBox(side: number, blockSide: number, which: StoreKind = 'union', kind: CollisionKind = 'lone', identityLinks = false): ArrowBox {
  if (side % blockSide !== 0) throw new Error('the block side must divide the box side')

  const built = denseFresh(side, kind, which)
  const fresh: DenseFresh = identityLinks
    ? (() => {
        const weave = makeColorWeave({ side, table: 'bind' })
        const links = new Int16Array(weave.links.length).fill(weave.moves.identity)

        return { ...built, kernel: makeBounceKernel(weave, kind, 'alternate', links), layout: separatedLayout(weave) }
      })()
    : built
  const cells = fresh.cells
  const column = new Int32Array(cells)
  const depth = new Int32Array(cells)
  const block = new Int32Array(cells)
  const along = new Int32Array(cells)
  const per = side / blockSide

  for (let x = 0; x < cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })
    const v = d4Vector(c)
    const a = modulo(v[0] as number, side)
    const b = modulo(v[1] as number, side)
    const z = modulo(v[2] as number, side)

    column[x] = a + side * b + side * side * z
    depth[x] = modulo(v[3] as number, 2 * side)
    block[x] = Math.floor(a / blockSide) + per * Math.floor(b / blockSide) + per * per * Math.floor(z / blockSide)
    // 2 e4 = b4 - b3 in the box basis
    along[x] = d4BoxCell({ coordinates: [c[0] as number, c[1] as number, (c[2] as number) - 1, (c[3] as number) + 1], side })
  }

  const inverses = new Map<Int8Array, Int8Array>()
  const inverseMove = fresh.kernel.move.map(m => {
    const known = inverses.get(m)

    if (known) return known

    const inv = new Int8Array(m.length)

    for (let p = 0; p < m.length; p++) inv[m[p] as number] = p

    inverses.set(m, inv)

    return inv
  })

  return { fresh, kernel: fresh.kernel, side, cells, blockSide, blocks: per ** 3, column, depth, block, along, inverseMove }
}

// the exact inverse of beat t: undo the stream, then undo the collision (its pieces in the other order)
export function kernelBeatBack(box: ArrowBox, s: Reduced, prev: Reduced, t: number): void {
  const k = box.kernel

  prev.vibe.fill(0)

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const from = k.target[slot] as number
    const v = s.vibe[from] as number

    if (v === 0) continue

    prev.vibe[slot] = v
    prev.point[slot] = (box.inverseMove[slot] as Int8Array)[s.point[from] as number] as number
  }

  prev.store.set(s.store)
  prev.spoint.set(s.spoint)

  const order = collisionOrder(k.schedule, t)

  for (let x = 0; x < box.cells; x++) {
    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i] === 'P') pairMove(k, prev, x)
      else coinMove(k, prev, x)
    }
  }
}

// a two-way runner: forward() applies beat t and advances; backward() undoes beat t - 1 and steps back
export type TwoWay = { state: () => Reduced; time: () => number; forward: () => void; backward: () => void }

export function twoWay(box: ArrowBox, start: Reduced, time = 0): TwoWay {
  let a = cloneReduced(start)
  let b = cloneReduced(start)
  let t = time
  const swap = (): void => {
    const c = a

    a = b
    b = c
  }

  return {
    state: () => a,
    time: () => t,
    forward: () => {
      bounceKernelBeat(box.kernel, a, b, t)
      t++
      swap()
    },
    backward: () => {
      kernelBeatBack(box, a, b, t - 1)
      t--
      swap()
    },
  }
}

// the vacuum state: the store and its layout, no vibe
export function vacuumState(box: ArrowBox): Reduced {
  const slots = box.cells * 24

  return { vibe: new Int8Array(slots), point: new Int8Array(slots), store: Int8Array.from(box.fresh.store), spoint: Int8Array.from(box.fresh.layout) }
}

// THE LOW-ENTROPY START: on the docks of the husk blocks listed, exactly `perDock` extra vibes per dock on average,
// placed on the calm slots of those docks ranked by a Weyl sequence of phase `phase`, alternately love and fear in rank
// order (so the charge is 0 or 1), each with a Weyl role point. With `depthUniform`, the fill of one depth layer of
// every column is copied to every dock of the column (the start is then invariant under the depth step 2 e4, if the
// vacuum is). The count per block is exact and the same for every phase, so every phase has one coarse state.
// `emptyVacuum` clears the store; `store` replaces it (for example a depth-invariant control vacuum).
export function lowEntropyStart(box: ArrowBox, input: { blocks: readonly number[]; perDock: number; phase: number; depthUniform?: boolean; points?: number; emptyVacuum?: boolean; store?: Int8Array; storePoint?: number }): Reduced {
  const s = vacuumState(box)

  if (input.emptyVacuum) s.store.fill(0)
  if (input.store) s.store.set(input.store)
  if (input.storePoint !== undefined) s.spoint.fill(input.storePoint)
  const points = input.points ?? 9
  const inRegion = new Uint8Array(box.cells)

  for (let x = 0; x < box.cells; x++) if (input.blocks.includes(box.block[x] as number)) inRegion[x] = 1

  // the docks to fill directly: every region dock, or with depthUniform one dock per column (the least depth)
  const seedDock = new Int32Array(box.side ** 3).fill(-1)

  if (input.depthUniform) {
    for (let x = 0; x < box.cells; x++) {
      if (!inRegion[x]) continue

      const c = box.column[x] as number
      const now = seedDock[c] as number

      if (now < 0 || (box.depth[x] as number) < (box.depth[now] as number)) seedDock[c] = x
    }
  }

  const blockOfPick = (x: number): number => box.block[x] as number
  const candidates = new Map<number, { slot: number; u: number }[]>()

  for (let x = 0; x < box.cells; x++) {
    if (!inRegion[x]) continue
    if (input.depthUniform && seedDock[box.column[x] as number] !== x) continue

    const list = candidates.get(blockOfPick(x)) ?? []

    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      list.push({ slot, u: frac((slot + 1) * GOLDEN + input.phase * SILVER) })
    }

    candidates.set(blockOfPick(x), list)
  }

  for (const [, list] of [...candidates.entries()].sort((p, q) => p[0] - q[0])) {
    list.sort((p, q) => p.u - q.u || p.slot - q.slot)

    const docks = list.length / 24
    const take = Math.round(input.perDock * docks)

    for (let r = 0; r < take; r++) {
      const slot = (list[r] as { slot: number }).slot

      s.vibe[slot] = r % 2 === 0 ? 1 : -1
      s.point[slot] = Math.floor(points * frac((slot + 1) * SILVER + input.phase * GOLDEN))
    }
  }

  if (input.depthUniform) {
    for (let c = 0; c < seedDock.length; c++) {
      const x0 = seedDock[c] as number

      if (x0 < 0) continue

      let x = box.along[x0] as number

      for (let k = 1; k < box.side && x !== x0; k++) {
        for (let d = 0; d < 24; d++) {
          s.vibe[x * 24 + d] = s.vibe[x0 * 24 + d] as number
          s.point[x * 24 + d] = s.point[x0 * 24 + d] as number
        }

        x = box.along[x] as number
      }
    }
  }

  return s
}

// ---- readers (measurement; reals allowed) ----

export function energyOf(s: Reduced): number {
  let e = 0

  for (let i = 0; i < s.vibe.length; i++) if (s.vibe[i] !== 0) e++
  for (let i = 0; i < s.store.length; i++) if (s.store[i] !== 0) e += 2

  return e
}

export function chargeOf(s: Reduced): number {
  let q = 0

  for (let i = 0; i < s.vibe.length; i++) q += s.vibe[i] as number

  return q
}

// the energy of each husk block, into out (length box.blocks)
export function blockEnergy(box: ArrowBox, s: Reduced, out: Float64Array): void {
  out.fill(0)

  for (let x = 0; x < box.cells; x++) {
    let e = 0

    for (let d = 0; d < 24; d++) if (s.vibe[x * 24 + d] !== 0) e++
    for (let l = 0; l < 12; l++) if (s.store[x * 12 + l] !== 0) e += 2

    out[box.block[x] as number] = (out[box.block[x] as number] as number) + e
  }
}

export function shannon(values: Float64Array): number {
  let total = 0

  for (const v of values) total += v

  let h = 0

  for (const v of values) {
    if (v > 0) {
      const p = v / total

      h -= p * Math.log(p)
    }
  }

  return h
}

// slots differing from their image under the depth step 2 e4 (vibe, and store per line)
export function depthMismatch(box: ArrowBox, s: Reduced): number {
  let n = 0

  for (let x = 0; x < box.cells; x++) {
    const y = box.along[x] as number

    for (let d = 0; d < 24; d++) if (s.vibe[x * 24 + d] !== s.vibe[y * 24 + d]) n++
    for (let l = 0; l < 12; l++) if (s.store[x * 12 + l] !== s.store[y * 12 + l]) n++
  }

  return n
}

// the husk occupation law: per mode (column, directed husk direction) the held count, tallied per class
export type HuskLaw = {
  // slot and store trit counts over the whole box (the husk sums every slot, so these are the husk's fractions too)
  plus: number
  minus: number
  calm: number
  storePlus: number
  storeMinus: number
  storeCalm: number
  // per class (0 axis, 1 diagonal): histogram of the held count per mode, over modes and samples
  histogram: Float64Array[]
  g: number[]
  samples: number
}

export function makeHuskLaw(side: number): HuskLaw {
  return { plus: 0, minus: 0, calm: 0, storePlus: 0, storeMinus: 0, storeCalm: 0, histogram: [new Float64Array(2 * side + 1), new Float64Array(side + 1)], g: [2 * side, side], samples: 0 }
}

const MODE_SCRATCH = new Map<number, Int32Array>()

export function sampleHuskLaw(box: ArrowBox, law: HuskLaw, s: Reduced): void {
  const modes = box.side ** 3 * HUSK_DIRECTIONS
  const count = MODE_SCRATCH.get(modes) ?? new Int32Array(modes)

  MODE_SCRATCH.set(modes, count)
  count.fill(0)

  for (let x = 0; x < box.cells; x++) {
    const c = box.column[x] as number

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d] as number

      if (v === 0) {
        law.calm++
        continue
      }

      if (v > 0) law.plus++
      else law.minus++

      count[c * HUSK_DIRECTIONS + (HUSK_DIRECTION[d] as number)]++
    }

    for (let l = 0; l < 12; l++) {
      const v = s.store[x * 12 + l] as number

      if (v > 0) law.storePlus++
      else if (v < 0) law.storeMinus++
      else law.storeCalm++
    }
  }

  for (let m = 0; m < modes; m++) {
    const h = m % HUSK_DIRECTIONS
    const cls = HUSK_MULTIPLICITY[h] === 2 ? 0 : 1
    const hist = law.histogram[cls] as Float64Array

    hist[count[m] as number] = (hist[count[m] as number] as number) + 1
  }

  law.samples++
}

function binomial(n: number, p: number): number[] {
  const out: number[] = []
  let logC = 0

  for (let k = 0; k <= n; k++) {
    if (k > 0) logC += Math.log(n - k + 1) - Math.log(k)

    out.push(Math.exp(logC + k * Math.log(Math.max(p, 1e-300)) + (n - k) * Math.log(Math.max(1 - p, 1e-300))))
  }

  return out
}

export type LawReading = {
  // the temperature from the slot trits: p+ p- / p0^2 = e^(-2 beta); from the store trits: s+ s- / s0^2 = e^(-4 beta)
  betaSlot: number
  betaStore: number
  // per class: the fill f = mean / g, the Fano factor var / mean, the Fermi-Dirac (binomial) Fano 1 - f, and the total
  // variation of the held-count law from the binomial of the same mean
  fill: number[]
  fano: number[]
  fermi: number[]
  tvBinomial: number[]
}

export function readHuskLaw(law: HuskLaw): LawReading {
  const betaSlot = -0.5 * Math.log((law.plus * law.minus) / (law.calm * law.calm))
  const betaStore = -0.25 * Math.log((law.storePlus * law.storeMinus) / (law.storeCalm * law.storeCalm))
  const fill: number[] = []
  const fano: number[] = []
  const fermi: number[] = []
  const tvBinomial: number[] = []

  law.histogram.forEach((hist, cls) => {
    const g = law.g[cls] as number
    let n = 0
    let m1 = 0
    let m2 = 0

    hist.forEach((c, k) => {
      n += c
      m1 += c * k
      m2 += c * k * k
    })

    const mean = m1 / n
    const variance = m2 / n - mean * mean
    const f = mean / g
    const b = binomial(g, f)
    let tv = 0

    hist.forEach((c, k) => {
      tv += Math.abs(c / n - (b[k] as number))
    })
    fill.push(f)
    fano.push(variance / mean)
    fermi.push(1 - f)
    tvBinomial.push(tv / 2)
  })

  return { betaSlot, betaStore, fill, fano, fermi, tvBinomial }
}

// a 64-bit-ish exact fingerprint of a state (two independent 32-bit polynomial hashes), for counting distinct states;
// equal fingerprints are then compared in full by the caller
export function fingerprint(s: Reduced): string {
  let h1 = 0x811c9dc5 | 0
  let h2 = 0x01000193 | 0

  for (let i = 0; i < s.vibe.length; i++) {
    const v = (s.vibe[i] as number) + 1 + (s.vibe[i] !== 0 ? 3 * ((s.point[i] as number) + 1) : 0)

    h1 = Math.imul(h1 ^ v, 16777619)
    h2 = Math.imul(h2 + v, 2654435761) ^ (h2 >>> 13)
  }

  for (let i = 0; i < s.store.length; i++) {
    const v = (s.store[i] as number) + 1 + (s.store[i] !== 0 ? 3 * ((s.spoint[i] as number) + 1) : 0)

    h1 = Math.imul(h1 ^ v, 16777619)
    h2 = Math.imul(h2 + v, 2654435761) ^ (h2 >>> 13)
  }

  return `${(h1 >>> 0).toString(16)}:${(h2 >>> 0).toString(16)}`
}

// Pearson correlation of two equal-length arrays (pooled over members and blocks by the caller)
export function correlation(a: Float64Array, b: Float64Array): number {
  let sa = 0
  let sb = 0
  let ab = 0

  for (let i = 0; i < a.length; i++) {
    sa += (a[i] as number) * (a[i] as number)
    sb += (b[i] as number) * (b[i] as number)
    ab += (a[i] as number) * (b[i] as number)
  }

  return sa > 0 && sb > 0 ? ab / Math.sqrt(sa * sb) : 0
}
