// A force on matter (E-FRC-0215, 0216): a husk charge that reads the light and is pushed by it. Its crossings
// are the trit crossings of code/rule/trit-hop read on the husk (the column-summed current, which drives the
// husk light bit for bit, E-FRC-0210); what is new is WHEN a crossing is taken.
//
// A STAND-IN FOR INERTIA. The charge carries a register the knit has not produced: a fine position X_i in
// 0 .. M - 1 on each husk axis and an integer momentum K_i. M is the mass in these units. Nothing in the knit
// holds such a register yet; it is the smallest thing that lets a force change a velocity, and it is labeled
// a stand-in wherever it is used. The register belongs to the charge's dock and goes with the vibe when the
// crossing swaps the docks (the stream copies it), so nothing moves.
//
// THE BEAT, a leapfrog in integers:
//   1. drift. On each axis i in order: X_i <- X_i + K_i, and every multiple of M carried out of X_i is one
//      crossing of the husk axis link in that direction: a threshold, no rounding. The crossing pays the husk
//      string (S_l <- S_l - J, J = +-e, the charge's sign times the direction), so Gauss's law holds exactly,
//      and it turns the momentum: every other axis j takes K_j <- K_j + sigma e Phi^_ij, where Phi^_ij is the
//      circulation of the shadow angle around the two squares in plane (i, j) beside the crossed link (the
//      magnetic flux the crossing sweeps). This is the Lorentz force F = e v x B, one crossing at a time
//   2. the light beat (code/rule/trit-husk-shaped, L levels)
//   3. kick. K_i <- K_i + e (E^_(y, i) + E^_(y - e_i, i)), the shadow flux on the two axis links at the charge's
//      dock: F = e E
// The field numerators are integers: with L levels the shadow is A~ = A + C^T f_t, E~ = E + C^T (f_(t+1) -
// f_t), f = sum C_i / q^i, so E^ = q^L E~ and Phi^ = q^L Phi~ are integer sums of the light's own counters.
// Both kicks carry the same factor (two links, two squares), so the units agree: K in units of pi / (4 D
// q^L) of momentum at hbar = 1 (code/measure/trit-hop-light's energy scale), a velocity K / M docks per beat.
//
// WHY THE SIGNS. The rule's drift is A <- A + E, so its angle is minus the textbook vector potential, and the
// kinetic momentum is K = P + e A with P canonical: dK/dt = e dA/dt = e E, and a crossing along i changes
// A_j at the charge by d_i A_j, whose gauge-invariant form is the circulation d_i A_j - d_j A_i.
//
// REVERSIBLE. The kick reads only the light, which it does not change; the light beat has its inverse; each
// axis's drift reads K_i, which that axis does not change (its crossings turn only the other components), so
// running the axes, and the charges, in reverse order undoes it: n = -floor((X_i' - K_i) / M) crossings back.
//
// Integers only (held exactly in doubles below 2^53): no float, no trig, no rounding.

import { addCurrent, type HuskEngine } from '@/code/rule/trit-husk'
import { shapedBeat, shapedBeatBack, shapedFlux, type ShapedOptions, type ShapedScratch, type ShapedState } from '@/code/rule/trit-husk-shaped'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type KineticMatter = {
  // M: positions run 0 .. M - 1 between docks
  readonly mass: number
  // per charge: its sign (+1 love, -1 fear), and 1 if it moves (0: a pinned charge, never kicked)
  readonly charge: Int8Array
  readonly moving: Uint8Array
  // per charge, three each: its husk dock coordinates, fine positions X and momenta K
  readonly dock: Int32Array
  readonly offset: Float64Array
  readonly momentum: Float64Array
}

export function makeMatter(input: { mass: number; charges: { charge: number; moving: boolean; dock: number[]; offset?: number[]; momentum?: number[] }[] }): KineticMatter {
  const n = input.charges.length

  return {
    mass: input.mass,
    charge: Int8Array.from(input.charges, c => c.charge),
    moving: Uint8Array.from(input.charges, c => (c.moving ? 1 : 0)),
    dock: Int32Array.from(input.charges.flatMap(c => c.dock)),
    offset: Float64Array.from(input.charges.flatMap(c => c.offset ?? [0, 0, 0])),
    momentum: Float64Array.from(input.charges.flatMap(c => c.momentum ?? [0, 0, 0])),
  }
}

export function copyMatter(m: KineticMatter): KineticMatter {
  return {
    mass: m.mass,
    charge: Int8Array.from(m.charge),
    moving: Uint8Array.from(m.moving),
    dock: Int32Array.from(m.dock),
    offset: Float64Array.from(m.offset),
    momentum: Float64Array.from(m.momentum),
  }
}

// the field numerators, per husk link: E^ = q^L E~ and A^ = q^L A~ minus the raw angle part (the angle part
// is added centered per square). Scratch allocated once per engine
export type FieldScratch = { flux: Int32Array; eHat: Float64Array; aShift: Float64Array; now: Float64Array; delta: Float64Array }

export function makeFieldScratch(engine: HuskEngine): FieldScratch {
  const g = engine.geometry

  return {
    flux: new Int32Array(g.huskLinks),
    eHat: new Float64Array(g.huskLinks),
    aShift: new Float64Array(g.huskLinks),
    now: new Float64Array(g.triangles),
    delta: new Float64Array(g.triangles),
  }
}

export function fieldNumerators(engine: HuskEngine, s: ShapedState, options: ShapedOptions, f: FieldScratch): void {
  const g = engine.geometry
  const q = engine.q
  const levels = options.levels
  const scale = q ** levels

  // sum_i q^(L - i) C_i: the carried fraction times q^L, now (lags) and its change
  for (let p = 0; p < g.triangles; p++) {
    let now = s.lag[p]! * q ** (levels - 1)
    let next = s.counter[p]! * q ** (levels - 1)

    for (let i = 0; i < s.upper.length; i++) {
      const w = q ** (levels - 2 - i)

      now += s.upperLag[i]![p]! * w
      next += s.upper[i]![p]! * w
    }

    f.now[p] = now
    f.delta[p] = next - now
  }

  shapedFlux(engine, s, options.cyclic, f.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    f.eHat[l] = scale * f.flux[l]!
    f.aShift[l] = 0
  }

  for (let p = 0; p < g.triangles; p++) {
    const d = f.delta[p]!
    const n = f.now[p]!

    if (d === 0 && n === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]!

      f.eHat[l] = f.eHat[l]! + c * d
      f.aShift[l] = f.aShift[l]! + c * n
    }
  }
}

const dockIndex = (side: number, a: number, b: number, c: number): number => mod(a, side) + side * mod(b, side) + side * side * mod(c, side)

function coords(m: KineticMatter, k: number): [number, number, number] {
  return [m.dock[k * 3]!, m.dock[k * 3 + 1]!, m.dock[k * 3 + 2]!]
}

// the circulation numerator Phi^_ij of the unit square at base z (z, z + e_i, z + e_i + e_j, z + e_j)
export function squareNumerator(engine: HuskEngine, s: ShapedState, f: FieldScratch, levels: number, z: [number, number, number], i: number, j: number): number {
  const side = engine.geometry.side
  const nb = engine.nb
  const at = (v: [number, number, number], h: number): number => dockIndex(side, v[0], v[1], v[2]) * 9 + h
  const zi: [number, number, number] = [z[0] + (i === 0 ? 1 : 0), z[1] + (i === 1 ? 1 : 0), z[2] + (i === 2 ? 1 : 0)]
  const zj: [number, number, number] = [z[0] + (j === 0 ? 1 : 0), z[1] + (j === 1 ? 1 : 0), z[2] + (j === 2 ? 1 : 0)]
  const links = [at(z, i), at(zi, j), at(zj, i), at(z, j)]
  const signs = [1, 1, -1, -1]
  let raw = 0
  let shift = 0

  for (let k = 0; k < 4; k++) {
    raw += signs[k]! * s.angle[links[k]!]!
    shift += signs[k]! * f.aShift[links[k]!]!
  }

  return engine.q ** levels * (mod(raw + nb / 2, nb) - nb / 2) + shift
}

export type KineticTally = { crossings: number }

function crossOnce(engine: HuskEngine, s: ShapedState, m: KineticMatter, f: FieldScratch, levels: number, k: number, i: number, sigma: number, tally?: KineticTally): void {
  const side = engine.geometry.side
  const e = m.charge[k]!
  const y = coords(m, k)
  const z: [number, number, number] = [y[0] - (sigma < 0 && i === 0 ? 1 : 0), y[1] - (sigma < 0 && i === 1 ? 1 : 0), y[2] - (sigma < 0 && i === 2 ? 1 : 0)]

  addCurrent(s, dockIndex(side, z[0], z[1], z[2]) * 9 + i, sigma * e)

  for (let j = 0; j < 3; j++) {
    if (j === i) continue

    const below: [number, number, number] = [z[0] - (j === 0 ? 1 : 0), z[1] - (j === 1 ? 1 : 0), z[2] - (j === 2 ? 1 : 0)]
    const turn = squareNumerator(engine, s, f, levels, z, i, j) + squareNumerator(engine, s, f, levels, below, i, j)

    m.momentum[k * 3 + j] = m.momentum[k * 3 + j]! + sigma * e * turn
  }

  m.dock[k * 3 + i] = mod(m.dock[k * 3 + i]! + sigma, side)

  if (tally) tally.crossings++
}

// the magnetic turn of a crossing, undone
function uncrossOnce(engine: HuskEngine, s: ShapedState, m: KineticMatter, f: FieldScratch, levels: number, k: number, i: number, sigma: number): void {
  const side = engine.geometry.side
  const e = m.charge[k]!

  m.dock[k * 3 + i] = mod(m.dock[k * 3 + i]! - sigma, side)

  const y = coords(m, k)
  const z: [number, number, number] = [y[0] - (sigma < 0 && i === 0 ? 1 : 0), y[1] - (sigma < 0 && i === 1 ? 1 : 0), y[2] - (sigma < 0 && i === 2 ? 1 : 0)]

  for (let j = 0; j < 3; j++) {
    if (j === i) continue

    const below: [number, number, number] = [z[0] - (j === 0 ? 1 : 0), z[1] - (j === 1 ? 1 : 0), z[2] - (j === 2 ? 1 : 0)]
    const turn = squareNumerator(engine, s, f, levels, z, i, j) + squareNumerator(engine, s, f, levels, below, i, j)

    m.momentum[k * 3 + j] = m.momentum[k * 3 + j]! - sigma * e * turn
  }

  addCurrent(s, dockIndex(side, z[0], z[1], z[2]) * 9 + i, -sigma * e)
}

function drift(engine: HuskEngine, s: ShapedState, m: KineticMatter, f: FieldScratch, options: ShapedOptions, tally?: KineticTally): void {
  const mass = m.mass

  for (let k = 0; k < m.charge.length; k++) {
    if (!m.moving[k]) continue

    for (let i = 0; i < 3; i++) {
      const y = m.offset[k * 3 + i]! + m.momentum[k * 3 + i]!
      const n = floorDiv(y, mass)

      m.offset[k * 3 + i] = y - n * mass

      const sigma = n > 0 ? 1 : -1

      for (let c = 0; c < Math.abs(n); c++) crossOnce(engine, s, m, f, options.levels, k, i, sigma, tally)
    }
  }
}

function driftBack(engine: HuskEngine, s: ShapedState, m: KineticMatter, f: FieldScratch, options: ShapedOptions): void {
  const mass = m.mass

  for (let k = m.charge.length - 1; k >= 0; k--) {
    if (!m.moving[k]) continue

    for (let i = 2; i >= 0; i--) {
      const x = m.offset[k * 3 + i]!
      const kk = m.momentum[k * 3 + i]!
      const n = -floorDiv(x - kk, mass)
      const sigma = n > 0 ? 1 : -1

      for (let c = 0; c < Math.abs(n); c++) uncrossOnce(engine, s, m, f, options.levels, k, i, sigma)

      m.offset[k * 3 + i] = x + n * mass - kk
    }
  }
}

function kick(engine: HuskEngine, m: KineticMatter, f: FieldScratch, sign: number): void {
  const side = engine.geometry.side

  for (let k = 0; k < m.charge.length; k++) {
    if (!m.moving[k]) continue

    const y = coords(m, k)
    const e = m.charge[k]!

    for (let i = 0; i < 3; i++) {
      const here = dockIndex(side, y[0], y[1], y[2]) * 9 + i
      const back = dockIndex(side, y[0] - (i === 0 ? 1 : 0), y[1] - (i === 1 ? 1 : 0), y[2] - (i === 2 ? 1 : 0)) * 9 + i

      m.momentum[k * 3 + i] = m.momentum[k * 3 + i]! + sign * e * (f.eHat[here]! + f.eHat[back]!)
    }
  }
}

// one beat of light and matter, in place
export function kineticBeat(engine: HuskEngine, s: ShapedState, m: KineticMatter, options: ShapedOptions, light: ShapedScratch, f: FieldScratch, tally?: KineticTally): void {
  fieldNumerators(engine, s, options, f)
  drift(engine, s, m, f, options, tally)
  shapedBeat(engine, s, light, options)
  fieldNumerators(engine, s, options, f)
  kick(engine, m, f, 1)
}

export function kineticBeatBack(engine: HuskEngine, s: ShapedState, m: KineticMatter, options: ShapedOptions, light: ShapedScratch, f: FieldScratch): void {
  fieldNumerators(engine, s, options, f)
  kick(engine, m, f, -1)
  shapedBeatBack(engine, s, light, options)
  fieldNumerators(engine, s, options, f)
  driftBack(engine, s, m, f, options)
}
