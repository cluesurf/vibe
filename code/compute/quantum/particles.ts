// PROPAGATION AND PARTICLES UNDER THE BARE BEAT U (item vibe-computation-models-0032, Q2; decision 004 of
// vibe/computation/models). Exact one- and two-excitation readings of code/rule/bare-beat on its two geometries, the
// hyperbolic {3,4,3,4} and the flat 24-cell honeycomb {3,4,3,3} (bare-beat withGeometry). Every amplitude, weight and
// moment is an exact number of Q(zeta_9) (code/algebra/ninth-field Ninth); an order is read by a certified sign.
//
//   LOCAL_LAYERS, applyLocalBeat   the seven per-dock layers of one beat (U without the stream S)
//   SPECIES, speciesPairClass      the four excitation species (tone, role) and the four classes of an unordered pair
//   facetClass                     the class of two slots by the dot product of their roots (1, 0, -1, or -2 antipodal)
//   lineChain                      the docks of the mesh line through a dock along a slot, by line coordinate
//   layerFingerprint               every per-dock layer, forward and adjoint, on a basis of dock states, as one string
//   flatFrameTransportClash        on the flat mesh, how often the transport F_s Z (the hyperbolic gluing) disagrees
//                                  with itself around closed paths (why the flat mesh carries translated frames)
//   parityAlternation              how many mesh edges of a ball join docks of opposite parity
//   oneExcitationRun               a lone vibe along its line: exact line table, return probability, front, moment
//   readLineSymbol                 the 2 x 2 line coin read off one beat, and the exact symbol constants it fixes
//   lineRecurrenceDefects          the Cayley-Hamilton recurrence of the symbol checked on a run, entry by entry
//   doublonDefects                 BallisticDoublon.lean's P = 0 doublon built on the mesh and U applied to it
//   localScatteringTable           the one-beat 2-to-2 table of every two-excitation dock state, by class
//   localBeatCommutes              live W(F_4) commutation of the per-dock beat on dock states
//   pairRunReadings                per-beat readings of a two-excitation run (counts, weights, docks, distances)
//   productDefects                 a two-excitation run against the product of its two lone runs
//
// DETERMINISM: no random numbers, no floating point, no host Math call.

import {
  type Ninth,
  ONE,
  OMEGA,
  ZERO,
  add,
  conj,
  equals,
  keyOf,
  mul,
  ninth,
  scale,
  sub,
} from '@/code/algebra/ninth-field'
import { realSign } from '@/code/algebra/ninth-real-sign'
import { returnProbability, totalWeight, weightOf } from '@/code/measure/quantum-lab-measures'
import {
  type BeatState,
  type LayerOp,
  type Vibe,
  BEAT_LAYERS,
  BEAT_LAYER_NAMES,
  LINES,
  OPPOSITE_SLOT,
  ROOTS,
  amplitudeOf,
  applyBeat,
  basisKet,
  decodeConfig,
  dockParityOf,
  encodeConfig,
  flatCenterOf,
  mapStateBySlotPerm,
  stepDock,
  superpose,
} from '@/code/rule/bare-beat'

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// The per-dock beat and the vocabulary of excitations
// ---------------------------------------------------------------------------------------------------------------------

// Phi_odd, D, K, M_pair, M_meet, D, Phi_odd: every layer but the stream, in execution order.
export const LOCAL_LAYERS: readonly LayerOp[] = BEAT_LAYERS.slice(0, 7)
export const LOCAL_LAYER_NAMES: readonly string[] = BEAT_LAYER_NAMES.slice(0, 7)

export function applyLocalBeat(state: BeatState): BeatState {
  return LOCAL_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

export type Species = readonly [tone: 1 | -1, role: number]

export const SPECIES: readonly Species[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, 1],
]

export type SpeciesPairClass = 'identical' | 'role_pair' | 'charge_pair_same_role' | 'charge_pair_cross_role'

export const SPECIES_PAIR_CLASSES: readonly SpeciesPairClass[] = [
  'identical',
  'role_pair',
  'charge_pair_same_role',
  'charge_pair_cross_role',
]

export function speciesPairClass(a: Species, b: Species): SpeciesPairClass {
  if (a[0] === b[0]) {
    return a[1] === b[1] ? 'identical' : 'role_pair'
  }

  return a[1] === b[1] ? 'charge_pair_same_role' : 'charge_pair_cross_role'
}

// The dot product of two slots' D_4 roots: 1 (60 degrees, facets sharing a triangle), 0, -1, or -2 (antipodal, one line).
export function facetClass(slotA: number, slotB: number): number {
  const a = ROOTS[slotA]!
  const b = ROOTS[slotB]!

  return Number(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])
}

export const FACET_CLASSES: readonly number[] = [1, 0, -1, -2]

// The docks of the line through `dock` along `slot`, for line coordinates -reach..reach (index k + reach). A vibe on
// `slot` moves to coordinate k + 1 each beat, a vibe on the opposite slot to k - 1.
export function lineChain(dock: number, slot: number, reach: number): Map<number, number> {
  const coordinate = new Map<number, number>([[dock, 0]])

  let forward = dock
  let backward = dock

  for (let k = 1; k <= reach; k++) {
    forward = stepDock(forward, slot)
    backward = stepDock(backward, OPPOSITE_SLOT[slot]!)
    assertExact(!coordinate.has(forward) && !coordinate.has(backward), `line through ${dock} along ${slot} closes`)
    coordinate.set(forward, k)
    coordinate.set(backward, -k)
  }

  return coordinate
}

// ---------------------------------------------------------------------------------------------------------------------
// Geometry gates: per-dock layers, the flat frame clash, parity
// ---------------------------------------------------------------------------------------------------------------------

function stateKey(state: BeatState, relabel: (dock: number) => number = d => d): string {
  return [...state.amp.keys()]
    .map(key => {
      const vibes = decodeConfig(key).map(([d, s, t, r]) => [relabel(d), s, t, r] as const)

      return `${encodeConfig(vibes)}=${keyOf(amplitudeOf(state, key))}`
    })
    .sort()
    .join(' ')
}

// Four excitations of role 0 on every 4-set of slots holding slot 0, the second slot of tone -1 and the rest +1 (1,771
// states, mixed charge, the chiral and achiral orbits of chi_odd both among them).
export function fourExcitationFamily(dock: number): Vibe[][] {
  const out: Vibe[][] = []

  for (let a = 1; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      for (let c = b + 1; c < 24; c++) {
        out.push([
          [dock, 0, 1, 0],
          [dock, a, -1, 0],
          [dock, b, 1, 0],
          [dock, c, 1, 0],
        ])
      }
    }
  }

  return out
}

// Phi_odd on a dock against Phi_odd on dock 0 (parity +1), over the 4-excitation family with the dock renamed 0: does it
// run the even layer (equal to Phi_odd at dock 0), the odd one (equal to Phi_odd^dag at dock 0), and on how many states
// do the two differ (the states that can tell the parities apart).
export function phiParityKind(dock: number): { even: boolean; odd: boolean; distinguishing: number } {
  const phi = LOCAL_LAYERS[0]!

  let even = true
  let odd = true
  let distinguishing = 0

  const toZero = (d: number): number => {
    assertExact(d === dock, `Phi_odd moved an excitation off dock ${dock}`)

    return 0
  }

  for (const vibes of fourExcitationFamily(dock)) {
    const here = stateKey(phi(basisKet(vibes), false), toZero)
    const base = basisKet(vibes.map(([, s, t, r]) => [0, s, t, r] as const))
    const forward = stateKey(phi(base, false))
    const adjoint = stateKey(phi(base, true))

    even &&= here === forward
    odd &&= here === adjoint

    if (forward !== adjoint) {
      distinguishing++
    }
  }

  return { even, odd, distinguishing }
}

// Dock states of one dock: every one-excitation state (96), every two-excitation state (4,416), and the 4-excitation
// family (1,771).
export function dockBasis(dock: number): Vibe[][] {
  const out: Vibe[][] = []

  for (let s = 0; s < 24; s++) {
    for (const [tone, role] of SPECIES) {
      out.push([[dock, s, tone, role]])
    }
  }

  for (let s1 = 0; s1 < 24; s1++) {
    for (let s2 = s1 + 1; s2 < 24; s2++) {
      for (const [t1, r1] of SPECIES) {
        for (const [t2, r2] of SPECIES) {
          out.push([
            [dock, s1, t1, r1],
            [dock, s2, t2, r2],
          ])
        }
      }
    }
  }

  return [...out, ...fourExcitationFamily(dock)]
}

// Every per-dock layer, forward and adjoint, on every basis state of `dock`, written with the dock renamed 0. Two meshes
// whose fingerprints agree run the same per-dock layers there.
export function layerFingerprint(dock: number): { fingerprint: string; states: number; parity: number } {
  const basis = dockBasis(dock)
  const parts: string[] = []

  const relabel = (d: number): number => {
    assertExact(d === dock, `a per-dock layer moved an excitation off dock ${dock}`)

    return 0
  }

  for (const vibes of basis) {
    const ket = basisKet(vibes)

    for (const [i, layer] of LOCAL_LAYERS.entries()) {
      for (const dag of [false, true]) {
        parts.push(`${i}${dag ? '+' : ''}|${stateKey(layer(ket, dag), relabel)}`)
      }
    }
  }

  return { fingerprint: parts.join('\n'), states: basis.length, parity: dockParityOf(dock) }
}

type Mat4 = readonly (readonly [bigint, bigint, bigint, bigint])[]

function mat4Mul(a: Mat4, b: Mat4): Mat4 {
  return a.map(row =>
    [0, 1, 2, 3].map(j => row[0] * b[0]![j]! + row[1] * b[1]![j]! + row[2] * b[2]![j]! + row[3] * b[3]![j]!),
  ) as unknown as Mat4
}

function mat4Vec(a: Mat4, v: readonly bigint[]): bigint[] {
  return a.map(row => row[0] * v[0]! + row[1] * v[1]! + row[2] * v[2]! + row[3] * v[3]!)
}

function det4(m: Mat4): bigint {
  const minor = (rows: readonly (readonly bigint[])[], skip: number): bigint[][] =>
    rows.slice(1).map(row => row.filter((_, j) => j !== skip))
  const det = (rows: readonly (readonly bigint[])[]): bigint =>
    rows.length === 1
      ? rows[0]![0]!
      : rows[0]!.reduce((sum, x, j) => sum + (j % 2 === 0 ? 1n : -1n) * x * det(minor(rows, j)), 0n)

  return det(m)
}

// The flat mesh glued the hyperbolic way: dock frames M in GL(4, Z), a step on slot s goes to center c + M r_s with
// frame M L_s, L_s = -I + r_s r_s^T (the linear part of F_s Z: it fixes r_s, negates its orthogonal complement, det
// -1). Breadth first to `radius`, a step reaching a known center with another frame, or another det, is a clash.
export function flatFrameTransportClash(radius: number): { docks: number; frameClashes: number; parityClashes: number } {
  const transports: Mat4[] = ROOTS.map(
    r =>
      [0, 1, 2, 3].map(i =>
        [0, 1, 2, 3].map(j => (i === j ? -1n : 0n) + r[i]! * r[j]!),
      ) as unknown as Mat4,
  )
  const identity = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1n : 0n))) as unknown as Mat4
  const frames = new Map<string, Mat4>([['0,0,0,0', identity]])
  const depth = new Map<string, number>([['0,0,0,0', 0]])
  const queue: (readonly [string, bigint[]])[] = [['0,0,0,0', [0n, 0n, 0n, 0n]]]

  let frameClashes = 0
  let parityClashes = 0

  for (const [key, center] of queue) {
    const frame = frames.get(key)!
    const r = depth.get(key)!

    if (r >= radius) {
      continue
    }

    for (let s = 0; s < 24; s++) {
      const move = mat4Vec(frame, ROOTS[s]!)
      const next = center.map((x, i) => x + move[i]!)
      const nextKey = next.join(',')
      const nextFrame = mat4Mul(frame, transports[s]!)
      const known = frames.get(nextKey)

      if (known === undefined) {
        frames.set(nextKey, nextFrame)
        depth.set(nextKey, r + 1)
        queue.push([nextKey, next])
      } else {
        if (known.some((row, i) => row.some((x, j) => x !== nextFrame[i]![j]!))) {
          frameClashes++
        }

        if (det4(known) !== det4(nextFrame)) {
          parityClashes++
        }
      }
    }
  }

  return { docks: frames.size, frameClashes, parityClashes }
}

// Edges of the given docks (each counted from both ends) and how many join opposite parities.
export function parityAlternation(docks: Iterable<number>): { edges: number; alternating: number } {
  let edges = 0
  let alternating = 0

  for (const dock of docks) {
    for (let s = 0; s < 24; s++) {
      edges++

      if (dockParityOf(stepDock(dock, s)) === -dockParityOf(dock)) {
        alternating++
      }
    }
  }

  return { edges, alternating }
}

// Unordered triples of roots summing to zero: odd 3-cycles of docks in any mesh glued by translation.
export function rootTriangles(): number {
  let count = 0

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      for (let c = b + 1; c < 24; c++) {
        const [ra, rb, rc] = [ROOTS[a]!, ROOTS[b]!, ROOTS[c]!]

        const sumsToZero = [0, 1, 2, 3].every(i => {
          const total = ra[i]! + rb[i]! + rc[i]!

          return total === 0n
        })

        if (sumsToZero) {
          count++
        }
      }
    }
  }

  return count
}

// The word length of a D_4 lattice vector over the 24 roots: max(max |x_i|, (sum |x_i|) / 2).
export function flatRootDistance(dock: number): number {
  const center = flatCenterOf(dock)
  const abs = center.map(x => (x < 0n ? -x : x))
  const sum = abs.reduce((s, x) => s + x, 0n)
  const max = abs.reduce((m, x) => (x > m ? x : m), 0n)

  return Number(max > sum / 2n ? max : sum / 2n)
}

// ---------------------------------------------------------------------------------------------------------------------
// One excitation
// ---------------------------------------------------------------------------------------------------------------------

export type LineEntry = readonly [k: number, forward: boolean, amp: Ninth]

export type OneExcitationBeat = {
  // sorted 'k:+|-:amplitude' entries, the geometry-free description of the state on its line
  readonly lineTable: string
  readonly entries: readonly LineEntry[]
  readonly returnProbability: Ninth
  // the largest |k| of the support, and the exact weight at |k| = beat (the cone edge)
  readonly supportRadius: number
  readonly edgeWeight: Ninth
  // sum over the support of k^2 * weight (a rational number)
  readonly secondMoment: Ninth
  readonly norm: Ninth
}

function lineEntries(state: BeatState, chain: ReadonlyMap<number, number>, slot: number): LineEntry[] {
  const out: LineEntry[] = []

  for (const key of state.amp.keys()) {
    const vibes = decodeConfig(key)

    assertExact(vibes.length === 1, 'a lone vibe split into several excitations')

    const [dock, s] = vibes[0]!
    const k = chain.get(dock)

    assertExact(k !== undefined, `the lone vibe left its line (dock ${dock})`)
    assertExact(s === slot || s === OPPOSITE_SLOT[slot], `the lone vibe left its line (slot ${s})`)
    out.push([k!, s === slot, amplitudeOf(state, key)])
  }

  return out.sort((a, b) => a[0] - b[0] || Number(b[1]) - Number(a[1]))
}

// A lone vibe on (dock 0, slot, tone, role) for `beats` beats on the current mesh.
export function oneExcitationRun(slot: number, tone: 1 | -1, role: number, beats: number): OneExcitationBeat[] {
  const chain = lineChain(0, slot, beats + 1)
  const initial = basisKet([[0, slot, tone, role]])
  const out: OneExcitationBeat[] = []

  let state = initial

  for (let t = 1; t <= beats; t++) {
    state = applyBeat(state)

    const entries = lineEntries(state, chain, slot)

    let supportRadius = 0
    let edgeWeight = ZERO
    let secondMoment = ZERO

    for (const [k, , amp] of entries) {
      const w = mul(conj(amp), amp)
      const r = k < 0 ? -k : k

      supportRadius = r > supportRadius ? r : supportRadius
      secondMoment = add(secondMoment, scale(w, BigInt(k * k)))

      if (r === t) {
        edgeWeight = add(edgeWeight, w)
      }
    }

    out.push({
      lineTable: entries.map(([k, f, a]) => `${k}:${f ? '+' : '-'}:${keyOf(a)}`).join(' '),
      entries,
      returnProbability: returnProbability(initial, state),
      supportRadius,
      edgeWeight,
      secondMoment,
      norm: totalWeight(state),
    })
  }

  return out
}

export type LineSymbol = {
  // C[out][in], 0 = moving along the slot (+), 1 = against it (-): the coin applied before the stream
  readonly coin: readonly (readonly Ninth[])[]
  readonly det: Ninth
  readonly unitDet: boolean
  readonly diagonalEqual: boolean
  // rho^2 = C00^2 conj(det C): with C00 = C11 and |det C| = 1 the eigenvalues of S(k) C are e^(i theta0 +- i W(k)),
  // e^(2 i theta0) = det C and cos W = rho cos k, when rho^2 is a positive rational
  readonly rhoSquared: Ninth
  readonly rhoSquaredRational: boolean
  readonly rhoPositive: boolean
  // for cos W = rho cos k: the top group speed is rho (at k = pi/2), and W''(0) = rho / sqrt(1 - rho^2), so the rest
  // mass m = 1 / W''(0) has m^2 = (1 - rho^2) / rho^2; the rest phase is W(0) = arccos(rho)
  readonly topSpeedSquared: Ninth
  readonly massSquared: Ninth
  readonly detIsOmega: boolean
}

const isRational = (x: Ninth): boolean => x.n.every((c, i) => i === 0 || c === 0n)

// Read the coin off one beat of a lone vibe on dock 0 along `slot`, from both slots of its line.
export function readLineSymbol(slot: number): LineSymbol {
  const chain = lineChain(0, slot, 2)

  const read = (fromForward: boolean): readonly [Ninth, Ninth] => {
    const start = basisKet([[0, fromForward ? slot : OPPOSITE_SLOT[slot]!, 1, 0]])
    const entries = lineEntries(applyBeat(start), chain, slot)
    const forward = entries.find(([k, f]) => k === 1 && f)
    const backward = entries.find(([k, f]) => k === -1 && !f)

    assertExact(entries.length === 2 && forward !== undefined && backward !== undefined, 'line coin shape')

    return [forward![2], backward![2]]
  }

  const [c00, c10] = read(true)
  const [c01, c11] = read(false)
  const det = sub(mul(c00, c11), mul(c01, c10))
  const rhoSquared = mul(mul(c00, c00), conj(det))
  const rhoSquaredRational = isRational(rhoSquared)
  const rhoPositive = rhoSquaredRational && realSign(rhoSquared) > 0
  const p = rhoSquared.n[0] ?? 0n
  const q = rhoSquared.d

  return {
    coin: [
      [c00, c01],
      [c10, c11],
    ],
    det,
    unitDet: equals(mul(det, conj(det)), ONE),
    diagonalEqual: equals(c00, c11),
    rhoSquared,
    rhoSquaredRational,
    rhoPositive,
    topSpeedSquared: rhoSquared,
    massSquared: rhoPositive ? ninth([q - p], p) : ZERO,
    detIsOmega: equals(det, OMEGA),
  }
}

// psi_(t+2)(k) = C00 (psi_(t+1)(k - 1) + psi_(t+1)(k + 1)) - det C psi_t(k), each slot apart (Cayley-Hamilton for the
// symbol S(k) C, whose trace is C00 (z + 1/z) when C00 = C11). Counts entries where it fails, over every t of a run that
// starts with psi_0 = the basis state on (0, +).
export function lineRecurrenceDefects(run: readonly OneExcitationBeat[], symbol: LineSymbol): { checked: number; defects: number } {
  const table = (entries: readonly LineEntry[]): Map<string, Ninth> =>
    new Map(entries.map(([k, f, a]) => [`${k}:${f ? 1 : 0}`, a]))
  const tables = [new Map<string, Ninth>([['0:1', ONE]]), ...run.map(b => table(b.entries))]
  const c00 = symbol.coin[0]![0]!
  const at = (m: Map<string, Ninth>, k: number, f: number): Ninth => m.get(`${k}:${f}`) ?? ZERO

  let checked = 0
  let defects = 0

  for (let t = 0; t + 2 < tables.length; t++) {
    const reach = t + 2

    for (let k = -reach; k <= reach; k++) {
      for (const f of [0, 1]) {
        const predicted = sub(
          mul(c00, add(at(tables[t + 1]!, k - 1, f), at(tables[t + 1]!, k + 1, f))),
          mul(symbol.det, at(tables[t]!, k, f)),
        )

        checked++

        if (!equals(predicted, at(tables[t + 2]!, k, f))) {
          defects++
        }
      }
    }
  }

  return { checked, defects }
}

// ---------------------------------------------------------------------------------------------------------------------
// BallisticDoublon.lean's P = 0 doublon (Section 4) on the mesh
// ---------------------------------------------------------------------------------------------------------------------

// The Lean state, scaled by 13^(M + 1): at contact (m = 0) amplitude 13^(M + 1) on each of the two role-symmetric
// configurations {(X, +, role a), (X, -, role b)}; at separation m >= 1 the ahead vibe at line coordinate X + m and the
// behind one at X - m, spinor index 2 s_ahead + s_behind (0 = moving along the slot, 1 = against), amplitude
// 13^(M + 1 - m) u, u = (3 + 4 omega, -7 + 8 omega, 1, 3 + 4 omega), the same on both role orders. Both tones +1.
export const DOUBLON_U: readonly Ninth[] = [
  add(ninth([3]), scale(OMEGA, 4)),
  add(ninth([-7]), scale(OMEGA, 8)),
  ONE,
  add(ninth([3]), scale(OMEGA, 4)),
]

// 13 lambda = 7 + 15 omega
export const DOUBLON_LAMBDA_13: Ninth = add(ninth([7]), scale(OMEGA, 15))

function power(base: bigint, exponent: number): bigint {
  let out = 1n

  for (let i = 0; i < exponent; i++) {
    out *= base
  }

  return out
}

// Build the doublon for |X| <= comReach and m <= relReach on the line along `slot` through dock 0, apply one beat, and
// count interior configurations (|X| < comReach, m < relReach) where 13 U psi differs from 13 lambda psi, plus
// configurations of U psi that left the line. `lambda13` and `roleSign` (+1 symmetric, -1 antisymmetric) are inputs so
// a caller can run negative controls.
export function doublonDefects(
  slot: number,
  comReach: number,
  relReach: number,
  lambda13: Ninth = DOUBLON_LAMBDA_13,
  roleSign: 1 | -1 = 1,
): { interior: number; defects: number; offLine: number } {
  const reach = comReach + relReach + 2
  const chain = lineChain(0, slot, reach)
  const dockAt = new Map<number, number>([...chain.entries()].map(([d, k]) => [k, d]))
  const opp = OPPOSITE_SLOT[slot]!
  const top = relReach + 1
  const terms: [Vibe[], Ninth][] = []
  const vibe = (k: number, forward: boolean, role: number): Vibe => [dockAt.get(k)!, forward ? slot : opp, 1, role]

  for (let x = -comReach; x <= comReach; x++) {
    const contact = ninth([power(13n, top)])

    terms.push([[vibe(x, true, 0), vibe(x, false, 1)], contact])
    terms.push([[vibe(x, true, 1), vibe(x, false, 0)], scale(contact, roleSign)])

    for (let m = 1; m <= relReach; m++) {
      for (let index = 0; index < 4; index++) {
        const aheadForward = index < 2
        const behindForward = index % 2 === 0
        const amp = scale(DOUBLON_U[index]!, power(13n, top - m))

        terms.push([[vibe(x + m, aheadForward, 0), vibe(x - m, behindForward, 1)], amp])
        terms.push([[vibe(x + m, aheadForward, 1), vibe(x - m, behindForward, 0)], scale(amp, roleSign)])
      }
    }
  }

  const psi = superpose(terms)
  const evolved = applyBeat(psi)
  const keys = new Set([...psi.amp.keys(), ...evolved.amp.keys()])
  const thirteen = ninth([13])

  let interior = 0
  let defects = 0
  let offLine = 0

  for (const key of keys) {
    const vibes = decodeConfig(key)
    const ks = vibes.map(([d]) => chain.get(d))

    if (ks.some(k => k === undefined) || vibes.some(([, s]) => s !== slot && s !== opp)) {
      offLine++
      continue
    }

    const [k1, k2] = ks as [number, number]
    const x2 = k1 + k2
    const m2 = k1 > k2 ? k1 - k2 : k2 - k1

    if (x2 % 2 !== 0) {
      offLine++
      continue
    }

    const x = x2 / 2
    const m = m2 / 2

    if ((x < 0 ? -x : x) >= comReach || m >= relReach) {
      continue
    }

    interior++

    const lhs = mul(thirteen, amplitudeOf(evolved, key))
    const rhs = mul(lambda13, amplitudeOf(psi, key))

    if (!equals(lhs, rhs)) {
      defects++
    }
  }

  return { interior, defects, offLine }
}

// ---------------------------------------------------------------------------------------------------------------------
// Two excitations: the one-beat scattering table
// ---------------------------------------------------------------------------------------------------------------------

export type ScatteringOutcome = {
  readonly name: string
  readonly amplitude: string
  readonly probability: string
  readonly count: number
}

export type ScatteringRow = {
  readonly pairClass: SpeciesPairClass
  readonly facet: number
  readonly instances: number
  // instances whose outcome fingerprint differs from the first instance's (0 on a symmetric table)
  readonly deviants: number
  // non-antipodal rows: instances not equal to the product of the two lone coins (0: no interaction off the line)
  readonly nonProduct: number
  readonly outcomes: readonly ScatteringOutcome[]
}

function outcomeName(input: readonly Vibe[], output: readonly Vibe[]): string {
  const [a, b] = input as [Vibe, Vibe]
  const same = (x: readonly Vibe[]): boolean => encodeConfig(x) === encodeConfig(output)
  const swapSlots = (va: Vibe, vb: Vibe): Vibe[] => [
    [va[0], vb[1], va[2], va[3]],
    [vb[0], va[1], vb[2], vb[3]],
  ]
  const swapRoles = (va: Vibe, vb: Vibe): Vibe[] => [
    [va[0], va[1], va[2], vb[3]],
    [vb[0], vb[1], vb[2], va[3]],
  ]
  const flip = (v: Vibe): Vibe => [v[0], OPPOSITE_SLOT[v[1]]!, v[2], v[3]]

  if (same([a, b])) {
    return 'transmit'
  }

  if (facetClass(a[1], b[1]) !== -2) {
    if (same([flip(a), b])) {
      return 'first_reverses'
    }

    if (same([a, flip(b)])) {
      return 'second_reverses'
    }

    if (same([flip(a), flip(b)])) {
      return 'both_reverse'
    }
  }

  // like tones: exchanging slots and exchanging roles give one configuration, read as the role swap
  if (same(swapRoles(a, b))) {
    return 'role_swap'
  }

  if (same(swapSlots(a, b))) {
    return 'bounce'
  }

  if (same(swapRoles(...(swapSlots(a, b) as [Vibe, Vibe])))) {
    return 'bounce_role_swap'
  }

  const line = LINES.findIndex(([x, y]) => x === output[0]![1] || y === output[0]![1])

  return line === LINES.findIndex(([x, y]) => x === a[1] || y === a[1]) ? 'same_line_other' : 'turn'
}

function outcomesOf(input: readonly Vibe[], output: BeatState): ScatteringOutcome[] {
  const grouped = new Map<string, { name: string; amplitude: string; probability: string; count: number }>()

  for (const [key, z] of output.amp) {
    const vibes = decodeConfig(key)
    const name = outcomeName(input, vibes)
    const amplitude = keyOf(amplitudeOf(output, key))
    const probability = keyOf(weightOf(z, output.den))
    const id = `${name}|${amplitude}`
    const hit = grouped.get(id)

    if (hit) {
      hit.count++
    } else {
      grouped.set(id, { name, amplitude, probability, count: 1 })
    }
  }

  return [...grouped.values()].sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : x.amplitude < y.amplitude ? -1 : 1))
}

// The tensor product of the lone coins of two vibes on different lines of one dock (each split by D twice).
function productOfLoneCoins(a: Vibe, b: Vibe): BeatState {
  const ra = applyLocalBeat(basisKet([a]))
  const rb = applyLocalBeat(basisKet([b]))
  const terms: [Vibe[], Ninth][] = []

  for (const ka of ra.amp.keys()) {
    for (const kb of rb.amp.keys()) {
      terms.push([[...decodeConfig(ka), ...decodeConfig(kb)], mul(amplitudeOf(ra, ka), amplitudeOf(rb, kb))])
    }
  }

  return superpose(terms)
}

function sameState(x: BeatState, y: BeatState): boolean {
  const keys = new Set([...x.amp.keys(), ...y.amp.keys()])

  for (const key of keys) {
    if (!equals(amplitudeOf(x, key), amplitudeOf(y, key))) {
      return false
    }
  }

  return true
}

// The one-beat table of every two-excitation state of dock 0, by species-pair class and facet class, with the exact
// isometry check of the per-dock beat on that space (norms 1, distinct inputs orthogonal).
export function localScatteringTable(): {
  rows: ScatteringRow[]
  inputs: number
  normDefects: number
  orthogonalityDefects: number
  pairsChecked: number
} {
  const rows = new Map<string, { row: ScatteringRow; first: string }>()
  const columns: { key: string; out: BeatState }[] = []

  let normDefects = 0

  for (let s1 = 0; s1 < 24; s1++) {
    for (let s2 = s1 + 1; s2 < 24; s2++) {
      for (const sp1 of SPECIES) {
        for (const sp2 of SPECIES) {
          const input: Vibe[] = [
            [0, s1, sp1[0], sp1[1]],
            [0, s2, sp2[0], sp2[1]],
          ]
          const out = applyLocalBeat(basisKet(input))
          const facet = facetClass(s1, s2)
          const pairClass = speciesPairClass(sp1, sp2)
          const outcomes = outcomesOf(input, out)
          const fingerprint = JSON.stringify(outcomes)
          const id = `${pairClass}|${facet}`
          const nonProduct = facet === -2 ? 0 : sameState(out, productOfLoneCoins(input[0]!, input[1]!)) ? 0 : 1

          if (!equals(totalWeight(out), ONE)) {
            normDefects++
          }

          columns.push({ key: encodeConfig(input), out })

          const hit = rows.get(id)

          if (hit === undefined) {
            rows.set(id, {
              first: fingerprint,
              row: { pairClass, facet, instances: 1, deviants: 0, nonProduct, outcomes },
            })
          } else {
            hit.row = {
              ...hit.row,
              instances: hit.row.instances + 1,
              deviants: hit.row.deviants + (fingerprint === hit.first ? 0 : 1),
              nonProduct: hit.row.nonProduct + nonProduct,
            }
          }
        }
      }
    }
  }

  // <out_i | out_j> = 0 for i != j, through an index of output keys
  const byKey = new Map<string, number[]>()

  for (const [i, { out }] of columns.entries()) {
    for (const key of out.amp.keys()) {
      const list = byKey.get(key)

      if (list) {
        list.push(i)
      } else {
        byKey.set(key, [i])
      }
    }
  }

  const pairs = new Set<string>()

  for (const list of byKey.values()) {
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        pairs.add(`${list[a]},${list[b]}`)
      }
    }
  }

  let orthogonalityDefects = 0

  for (const pair of pairs) {
    const [i, j] = pair.split(',').map(Number) as [number, number]
    const x = columns[i]!.out
    const y = columns[j]!.out

    let sum = ZERO

    for (const key of x.amp.keys()) {
      if (y.amp.has(key)) {
        sum = add(sum, mul(conj(amplitudeOf(x, key)), amplitudeOf(y, key)))
      }
    }

    if (!equals(sum, ZERO)) {
      orthogonalityDefects++
    }
  }

  const order = (r: ScatteringRow): number =>
    SPECIES_PAIR_CLASSES.indexOf(r.pairClass) * 10 + FACET_CLASSES.indexOf(r.facet)

  return {
    rows: [...rows.values()].map(v => v.row).sort((a, b) => order(a) - order(b)),
    inputs: columns.length,
    normDefects,
    orthogonalityDefects,
    pairsChecked: pairs.size,
  }
}

// Live commutation of the per-dock beat with a slot permutation on every two-excitation state of dock 0: the count of
// states where applyLocalBeat(P psi) != P applyLocalBeat(psi).
export function localBeatCommutes(perm: Uint8Array): { states: number; failures: number } {
  let states = 0
  let failures = 0

  for (let s1 = 0; s1 < 24; s1++) {
    for (let s2 = s1 + 1; s2 < 24; s2++) {
      for (const sp1 of SPECIES) {
        for (const sp2 of SPECIES) {
          const ket = basisKet([
            [0, s1, sp1[0], sp1[1]],
            [0, s2, sp2[0], sp2[1]],
          ])

          states++

          if (!sameState(applyLocalBeat(mapStateBySlotPerm(ket, perm)), mapStateBySlotPerm(applyLocalBeat(ket), perm))) {
            failures++
          }
        }
      }
    }
  }

  return { states, failures }
}

// ---------------------------------------------------------------------------------------------------------------------
// Two excitations: propagation
// ---------------------------------------------------------------------------------------------------------------------

export type PairReading = {
  readonly configurations: number
  readonly supportDocks: number
  readonly norm: Ninth
  readonly returnProbability: Ninth
  // sorted exact weights of all configurations, joined (the geometry-free description of the amplitude pattern)
  readonly weightPattern: string
  // sorted exact dock occupations, joined (which configurations share docks)
  readonly occupationPattern: string
  // exact weight of excitations at each hop distance 0..distance radius from dock 0, and beyond it
  readonly distanceWeights: readonly string[]
  // the largest hop distance of the support when within the table, else -1
  readonly supportRadius: number
  // configurations whose two vibes sit on one mesh line through a common dock (collinear) or on different lines
  readonly offLineConfigurations: number
}

// Per-beat readings of U^t psi for t = 1..beats, on the current mesh. `distance` is a hop-distance table from dock 0;
// `line` the line coordinate table of the starting line (configurations off it are counted).
export function pairRunReadings(
  initial: BeatState,
  beats: number,
  distance: ReadonlyMap<number, number>,
  line: ReadonlyMap<number, number>,
): PairReading[] {
  const radius = [...distance.values()].reduce((m, r) => (r > m ? r : m), 0)
  const out: PairReading[] = []

  let state = initial

  for (let t = 1; t <= beats; t++) {
    state = applyBeat(state)

    const weights: string[] = []
    const occupation = new Map<number, Ninth>()
    const byDistance: Ninth[] = Array.from({ length: radius + 2 }, () => ZERO)

    let supportRadius = 0
    let offLine = 0

    for (const [key, z] of state.amp) {
      const w = weightOf(z, state.den)
      const vibes = decodeConfig(key)

      weights.push(keyOf(w))

      if (vibes.some(([d]) => !line.has(d))) {
        offLine++
      }

      for (const [dock] of vibes) {
        occupation.set(dock, add(occupation.get(dock) ?? ZERO, w))

        const r = distance.get(dock)
        const bucket = r ?? radius + 1

        byDistance[bucket] = add(byDistance[bucket]!, w)

        if (r === undefined) {
          supportRadius = -1
        } else if (supportRadius >= 0 && r > supportRadius) {
          supportRadius = r
        }
      }
    }

    out.push({
      configurations: state.amp.size,
      supportDocks: occupation.size,
      norm: totalWeight(state),
      returnProbability: returnProbability(initial, state),
      weightPattern: weights.sort().join(' '),
      occupationPattern: [...occupation.values()].map(keyOf).sort().join(' '),
      distanceWeights: byDistance.map(keyOf),
      supportRadius,
      offLineConfigurations: offLine,
    })
  }

  return out
}

// A two-excitation run of two vibes on different lines of dock 0 against the product of their lone runs, beat by beat:
// configurations where the amplitudes differ.
export function productDefects(a: Vibe, b: Vibe, beats: number): number[] {
  let pair = basisKet([a, b])
  let lone1 = basisKet([a])
  let lone2 = basisKet([b])

  const out: number[] = []

  for (let t = 1; t <= beats; t++) {
    pair = applyBeat(pair)
    lone1 = applyBeat(lone1)
    lone2 = applyBeat(lone2)

    const terms: [Vibe[], Ninth][] = []

    for (const k1 of lone1.amp.keys()) {
      for (const k2 of lone2.amp.keys()) {
        terms.push([[...decodeConfig(k1), ...decodeConfig(k2)], mul(amplitudeOf(lone1, k1), amplitudeOf(lone2, k2))])
      }
    }

    const product = superpose(terms)
    const keys = new Set([...pair.amp.keys(), ...product.amp.keys()])

    let diffs = 0

    for (const key of keys) {
      if (!equals(amplitudeOf(pair, key), amplitudeOf(product, key))) {
        diffs++
      }
    }

    out.push(diffs)
  }

  return out
}

// The line description of a two-excitation state that stays on one line: sorted 'k:+|-:tone:role' pairs and amplitudes.
export function pairLineTable(state: BeatState, line: ReadonlyMap<number, number>, slot: number): string {
  return [...state.amp.keys()]
    .map(key => {
      const vibes = decodeConfig(key).map(([d, s, t, r]) => {
        const k = line.get(d)

        assertExact(k !== undefined && (s === slot || s === OPPOSITE_SLOT[slot]), 'a pair left its line')

        return `${k}:${s === slot ? '+' : '-'}:${t}:${r}`
      })

      return `${vibes.sort().join(',')}=${keyOf(amplitudeOf(state, key))}`
    })
    .sort()
    .join(' ')
}
