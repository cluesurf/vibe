// The lattice Boltzmann equation a knit implies: the coarse description one rung above the knit.
//
// The classical route from a lattice gas to a fluid (Frisch, Hasslacher and Pomeau 1986; McNamara and
// Zanetti 1988; Frisch et al. 1987 for the Chapman-Enskog step) replaces the integer state of each slot by
// its ensemble mean and assumes the slots entering a collision are independent (molecular chaos, the
// Boltzmann closure). Here a slot holds a vibe (fear -1, calm 0, love +1), so its one-body state is two
// numbers, the probabilities n+ and n- of love and fear (calm is the rest). A dock's one-body state is the
// 48 numbers (n+_d, n-_d) over its 24 slots, indexed d * 2 + (0 for love, 1 for fear).
//
// THE LINEARIZED COLLISION. Under a product background b, the mean post-collision state of slot e is
// F_e(b) = E_b[1{C(x)_e = s'}]. Its derivative with respect to n+_d (holding n-_d, so calm pays) is
// exactly E over the other 23 slots of [1{C(x with x_d = +1)_e = s'} - 1{C(x with x_d = 0)_e = s'}], and
// the same with -1 for n-_d. This module estimates that expectation over a deterministic ensemble of
// product draws (each slot's uniform a fixed hash of the salt, the phase, the draw and the slot, no random
// numbers), running the knit's own dock collision (see linearizedCollision for the two estimators).
// Because the knit's collision keeps charge, P and the line-momentum sum configuration by configuration,
// the estimated matrix keeps every exact additive invariant of the knit to rounding, whatever the draw
// count; only the relaxation rates of the non-conserved directions carry sampling error.
//
// The matrix A_t (48 by 48, row-major [out][in]) of the beat's collision gives the linear lattice Boltzmann
// equation for a deviation d from the background: d' = A_t d at every dock, then stream (slot e moves one
// root e_e). For the knit's schedule A_t has the period of the schedule.
//
// TWO READINGS OF THE SAME EQUATION.
// - Fourier: a plane wave d e^{i k . r} goes through one period as the 48 by 48 complex map
//   M(k) = prod_t S(k) A_t with S(k) = diag(e^{-i k . e_d}). Its eigenvalues near 1 are the hydrodynamic
//   modes: |lambda| = e^{-24 Gamma}, arg lambda = -24 omega (a Floquet exponent, fixed up to 2 pi / 24 per
//   beat, taken by continuity from k = 0). nu = Gamma / k^2 at small k is the viscosity the equation
//   predicts, with no fit to a knit run.
// - Real space on a reduced lattice: when a flow depends only on a few projections of the dock position
//   (a plane wave on q . r, a two-dimensional slice on r0 and r1), the equation closes on the reduced
//   torus whose sites are those projections mod L, and a slot streams by the projections of its root.
//
// The knit's own averaged field on the same reduced lattice (oneBodyField) is the coarse initial condition
// and the beat-for-beat comparison.

import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { SIDE } from '@/code/rule/scatter-weave'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'

export const SLOT_STATES = 48

const ROOTS = rootsD4()
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

// The draws. hashRand (code/dynamics/conserving-sweep) is one multiply and one shift of a linear
// combination of its inputs, and its values for the 24 slots of one draw are not independent enough for
// a product measure: two salts gave viscosities 4 percent apart that did not close as the draw count grew
// from 5,000 to 100,000. The draws here chain a full 32-bit finalizer (the lowbias32 constants) through
// salt, phase, draw and slot, so each uniform is a fixed function of the four and the salts agree.
function mix32(input: number): number {
  let h = input >>> 0

  h = Math.imul(h ^ (h >>> 16), 0x7feb352d)
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b)

  return (h ^ (h >>> 16)) >>> 0
}

function drawPrefix(salt: number, phase: number, draw: number): number {
  return mix32(mix32(mix32(salt ^ 0x9e3779b9) ^ phase) ^ draw)
}

function slotUniform(prefix: number, slot: number): number {
  return mix32(mix32(prefix ^ Math.imul(slot + 1, 0x9e3779b9))) / 4294967296
}

// A knit state drawn from a product background, dock by dock with the same draws as the estimators (the
// dock index is the draw), for starts whose slots must be independent
export function productState(input: { docks: number; background: Float64Array; salt: number }): Int8Array {
  const out = new Int8Array(input.docks * 24)

  for (let dock = 0; dock < input.docks; dock++) {
    const prefix = drawPrefix(input.salt, 7919, dock)

    for (let d = 0; d < 24; d++) {
      const u = slotUniform(prefix, d)
      const plus = input.background[d * 2] ?? 0
      const minus = input.background[d * 2 + 1] ?? 0

      out[dock * 24 + d] = u < plus ? 1 : u < plus + minus ? -1 : 0
    }
  }

  return out
}

// the uniform product background: every slot love with probability occupation / 2, fear the same
export function uniformBackground(occupation: number): Float64Array {
  return Float64Array.from({ length: SLOT_STATES }, () => occupation / 2)
}

// The linearized collision about a product background, and the mean post-collision state of the
// background itself (which equals the background exactly when the background is invariant, as the
// uniform one is under any bijection of dock states).
//
// Two estimators of the same derivative:
// - 'conditional' (the default): under a product measure E over the other slots of f(x with x_d = s) is
//   E[f(x) | x_d = s], so one collision per draw serves every column. With the change h(x) = 1{C(x)_e = s'}
//   - 1{x_e = s'}, the column (d, s) is the unit column plus the mean of h over draws with x_d = s minus
//   its mean over draws with x_d = 0. Every additive invariant l has l . h(x) = 0 for every draw, so the
//   estimate keeps l exactly, draw by draw, and h is zero wherever the collision left a slot alone, which
//   keeps its variance small.
// - 'forced': three collisions per slot per draw, x_d set to +1, -1 and 0 with the rest shared (common
//   random numbers), the column the mean difference. 73 collisions a draw; kept as the second method.
export function linearizedCollision(input: {
  collision: Collision
  background: Float64Array
  samples: number
  salt: number
  phase: number
  method?: 'conditional' | 'forced'
}): {
  matrix: Float64Array
  post: Float64Array
} {
  if ((input.method ?? 'conditional') === 'conditional') {
    return conditionalCollision(input)
  }

  const { collision, background, samples, salt, phase } = input
  const matrix = new Float64Array(SLOT_STATES * SLOT_STATES)
  const post = new Float64Array(SLOT_STATES)
  const x = new Int8Array(24)
  const work = new Int8Array(24)
  const outs = [new Int8Array(24), new Int8Array(24), new Int8Array(24)]
  const values = [1, -1, 0]

  for (let n = 0; n < samples; n++) {
    const prefix = drawPrefix(salt, phase, n)

    for (let d = 0; d < 24; d++) {
      const u = slotUniform(prefix, d)
      const plus = background[d * 2] ?? 0
      const minus = background[d * 2 + 1] ?? 0

      x[d] = u < plus ? 1 : u < plus + minus ? -1 : 0
    }

    work.set(x)
    collision(work, 0, 24)

    for (let e = 0; e < 24; e++) {
      const v = work[e] ?? 0

      if (v !== 0) {
        post[e * 2 + (v > 0 ? 0 : 1)] = (post[e * 2 + (v > 0 ? 0 : 1)] ?? 0) + 1
      }
    }

    for (let d = 0; d < 24; d++) {
      for (let k = 0; k < 3; k++) {
        const out = outs[k] ?? work

        out.set(x)
        out[d] = values[k] ?? 0
        collision(out, 0, 24)
      }

      const zero = outs[2] ?? work

      for (let k = 0; k < 2; k++) {
        const out = outs[k] ?? work
        const column = d * 2 + k

        for (let e = 0; e < 24; e++) {
          const a = out[e] ?? 0
          const b = zero[e] ?? 0

          if (a === b) {
            continue
          }

          if (a !== 0) {
            const row = e * 2 + (a > 0 ? 0 : 1)

            matrix[row * SLOT_STATES + column] = (matrix[row * SLOT_STATES + column] ?? 0) + 1
          }

          if (b !== 0) {
            const row = e * 2 + (b > 0 ? 0 : 1)

            matrix[row * SLOT_STATES + column] = (matrix[row * SLOT_STATES + column] ?? 0) - 1
          }
        }
      }
    }
  }

  return { matrix: matrix.map(v => v / samples), post: post.map(v => v / samples) }
}

function conditionalCollision(input: { collision: Collision; background: Float64Array; samples: number; salt: number; phase: number }): {
  matrix: Float64Array
  post: Float64Array
} {
  const { collision, background, samples, salt, phase } = input
  const n = SLOT_STATES
  // bucket (d, code) with code 0 love, 1 fear, 2 calm
  const sums = new Float64Array(72 * n)
  const counts = new Float64Array(72)
  const post = new Float64Array(n)
  const x = new Int8Array(24)
  const y = new Int8Array(24)
  const index = new Int32Array(48)
  const value = new Float64Array(48)

  for (let draw = 0; draw < samples; draw++) {
    const prefix = drawPrefix(salt, phase, draw)

    for (let d = 0; d < 24; d++) {
      const u = slotUniform(prefix, d)
      const plus = background[d * 2] ?? 0
      const minus = background[d * 2 + 1] ?? 0

      x[d] = u < plus ? 1 : u < plus + minus ? -1 : 0
    }

    y.set(x)
    collision(y, 0, 24)

    let entries = 0

    for (let e = 0; e < 24; e++) {
      const after = y[e] ?? 0
      const before = x[e] ?? 0

      if (after !== 0) {
        post[e * 2 + (after > 0 ? 0 : 1)] = (post[e * 2 + (after > 0 ? 0 : 1)] ?? 0) + 1
      }

      if (after === before) {
        continue
      }

      if (after !== 0) {
        index[entries] = e * 2 + (after > 0 ? 0 : 1)
        value[entries] = 1
        entries++
      }

      if (before !== 0) {
        index[entries] = e * 2 + (before > 0 ? 0 : 1)
        value[entries] = -1
        entries++
      }
    }

    for (let d = 0; d < 24; d++) {
      const v = x[d] ?? 0
      const bucket = d * 3 + (v > 0 ? 0 : v < 0 ? 1 : 2)

      counts[bucket] = (counts[bucket] ?? 0) + 1

      for (let m = 0; m < entries; m++) {
        const at = bucket * n + (index[m] ?? 0)

        sums[at] = (sums[at] ?? 0) + (value[m] ?? 0)
      }
    }
  }

  const matrix = new Float64Array(n * n)

  for (let d = 0; d < 24; d++) {
    const calm = d * 3 + 2
    const calmCount = counts[calm] ?? 0

    for (let s = 0; s < 2; s++) {
      const bucket = d * 3 + s
      const count = counts[bucket] ?? 0
      const column = d * 2 + s

      for (let r = 0; r < n; r++) {
        const held = count > 0 ? (sums[bucket * n + r] ?? 0) / count : 0
        const empty = calmCount > 0 ? (sums[calm * n + r] ?? 0) / calmCount : 0

        matrix[r * n + column] = (r === column ? 1 : 0) + held - empty
      }
    }
  }

  return { matrix, post: post.map(v => v / samples) }
}

// the linearized collision of every phase of a scheduled rule
export function linearizedSchedule(input: {
  rule: (t: number) => Collision
  period: number
  background: Float64Array
  samples: number
  salt: number
  method?: 'conditional' | 'forced'
}): Float64Array[] {
  return Array.from({ length: input.period }, (_, t) =>
    linearizedCollision({ collision: input.rule(t), background: input.background, samples: input.samples, salt: input.salt, phase: t, method: input.method }).matrix,
  )
}

// The additive densities, as left vectors on the 48 one-body numbers
export const CHARGE_VECTOR: Float64Array = Float64Array.from({ length: SLOT_STATES }, (_, i) => (i % 2 === 0 ? 1 : -1))
export const COUNT_VECTOR: Float64Array = Float64Array.from({ length: SLOT_STATES }, () => 1)
export const LINE_SUM_VECTOR: Float64Array = Float64Array.from({ length: SLOT_STATES }, (_, i) => SIDE[Math.floor(i / 2)] ?? 0)

export function momentumVector(direction: readonly number[]): Float64Array {
  return Float64Array.from({ length: SLOT_STATES }, (_, i) => dot(ROOTS[Math.floor(i / 2)] ?? [], direction))
}

// The equilibrium shift of a density: the change of the maximum-entropy product state when the multiplier
// of the left vector moves by one, p_d(s) (l(d, s) - sum over s' of p_d(s') l(d, s')), calm counting 0.
export function equilibriumShift(background: Float64Array, left: Float64Array): Float64Array {
  const out = new Float64Array(SLOT_STATES)

  for (let d = 0; d < 24; d++) {
    const plus = background[d * 2] ?? 0
    const minus = background[d * 2 + 1] ?? 0
    const mean = plus * (left[d * 2] ?? 0) + minus * (left[d * 2 + 1] ?? 0)

    out[d * 2] = plus * ((left[d * 2] ?? 0) - mean)
    out[d * 2 + 1] = minus * ((left[d * 2 + 1] ?? 0) - mean)
  }

  return out
}

// A slab invariant along an axis: a combination S + b . P of the line-momentum sum and the particle
// momentum (b integer, each entry -1, 0 or 1) that vanishes on every slot whose root has a component
// along the axis. Both are kept dock by dock, and what it counts streams only inside the slab r_axis =
// const, so its sum over each such slab is an exact invariant of the knit. Undefined when no such
// combination exists; the search is over all 81 choices of b.
export function slabInvariantVector(axis: number): Float64Array | undefined {
  for (let code = 0; code < 81; code++) {
    const b = [0, 1, 2, 3].map(i => (Math.floor(code / 3 ** i) % 3) - 1)
    const vanishes = ROOTS.every((r, d) => (r[axis] ?? 0) === 0 || (SIDE[d] ?? 0) + dot(b, r) === 0)

    if (vanishes) {
      return Float64Array.from({ length: SLOT_STATES }, (_, i) => {
        const d = Math.floor(i / 2)

        return (SIDE[d] ?? 0) + dot(b, ROOTS[d] ?? [])
      })
    }
  }

  return undefined
}

// the sum of a left vector's |vibe| weights (its love entry) over each slab r_axis = const of a knit state
export function slabDensity(input: { data: Int8Array; side: number; axis: number; left: Float64Array }): number[] {
  const { data, side, axis, left } = input
  const out = new Array<number>(side).fill(0)
  const docks = data.length / 24

  for (let dock = 0; dock < docks; dock++) {
    const slab = Math.floor(dock / side ** axis) % side

    for (let d = 0; d < 24; d++) {
      if ((data[dock * 24 + d] ?? 0) !== 0) {
        out[slab] = (out[slab] ?? 0) + (left[d * 2] ?? 0)
      }
    }
  }

  return out
}

// the largest change of a left vector under the matrices: l A - l, over every phase
export function conservationDefect(matrices: readonly Float64Array[], left: Float64Array): number {
  let worst = 0

  for (const a of matrices) {
    for (let c = 0; c < SLOT_STATES; c++) {
      let s = 0

      for (let r = 0; r < SLOT_STATES; r++) {
        s += (left[r] ?? 0) * (a[r * SLOT_STATES + c] ?? 0)
      }

      worst = Math.max(worst, Math.abs(s - (left[c] ?? 0)))
    }
  }

  return worst
}

// ---- the Fourier reading ----

// the period map M(k) = prod over t of S(k) A_(t0 + t), A applied first, for a wave vector k (per dock)
export function periodMap(input: { matrices: readonly Float64Array[]; wave: readonly number[]; t0?: number }): { re: Float64Array; im: Float64Array } {
  const n = SLOT_STATES
  const period = input.matrices.length
  const phase = Array.from({ length: n }, (_, i) => -dot(ROOTS[Math.floor(i / 2)] ?? [], input.wave))

  let mr = new Float64Array(n * n)
  let mi = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    mr[i * n + i] = 1
  }

  for (let t = 0; t < period; t++) {
    const a = input.matrices[((input.t0 ?? 0) + t) % period] ?? new Float64Array(n * n)
    const nr = new Float64Array(n * n)
    const ni = new Float64Array(n * n)

    // (S A) M: row r of A M times e^{i phase_r}
    for (let r = 0; r < n; r++) {
      const cr = Math.cos(phase[r] ?? 0)
      const ci = Math.sin(phase[r] ?? 0)

      for (let c = 0; c < n; c++) {
        let sr = 0
        let si = 0

        for (let k = 0; k < n; k++) {
          const w = a[r * n + k] ?? 0

          if (w !== 0) {
            sr += w * (mr[k * n + c] ?? 0)
            si += w * (mi[k * n + c] ?? 0)
          }
        }

        nr[r * n + c] = cr * sr - ci * si
        ni[r * n + c] = cr * si + ci * sr
      }
    }

    mr = nr
    mi = ni
  }

  return { re: mr, im: mi }
}

export type SlowMode = {
  // the period eigenvalue
  readonly re: number
  readonly im: number
  // the decay rate and angular frequency per beat (frequency from the principal argument)
  readonly gamma: number
  readonly omega: number
  // the share of the right eigenvector's weight on each named density, |l . x|^2 over the sum
  readonly content: Record<string, number>
}

// The eigenvalues of a period map whose modulus exceeds a floor, each with its content on the named
// densities (the densities are compared through their left vectors, normalized over the named set)
export function slowModes(input: { map: { re: Float64Array; im: Float64Array }; period: number; floor: number; densities: Record<string, Float64Array> }): SlowMode[] {
  const n = SLOT_STATES
  const ev = complexEigenvalues({ re: input.map.re, im: input.map.im, n })
  const out: SlowMode[] = []

  ev.re.forEach((re, i) => {
    const im = ev.im[i] ?? 0
    const modulus = Math.hypot(re, im)

    if (modulus < input.floor) {
      return
    }

    const x = complexEigenvector({ re: input.map.re, im: input.map.im, n, value: [re, im] })
    const raw: Record<string, number> = {}
    let total = 0

    for (const [name, left] of Object.entries(input.densities)) {
      let sr = 0
      let si = 0
      let norm = 0

      for (let k = 0; k < n; k++) {
        sr += (left[k] ?? 0) * (x.re[k] ?? 0)
        si += (left[k] ?? 0) * (x.im[k] ?? 0)
        norm += (left[k] ?? 0) ** 2
      }

      raw[name] = (sr * sr + si * si) / norm
      total += raw[name] ?? 0
    }

    const content = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, total > 0 ? v / total : 0]))

    out.push({ re, im, gamma: -Math.log(modulus) / input.period, omega: -Math.atan2(im, re) / input.period, content })
  })

  return out.sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im))
}

// One hydrodynamic mode followed along a ray of wave vectors k * direction: picked at the first k by a
// score on its content, then continued at each next k by the slow eigenvalue nearest the last one. The
// frequency is unwrapped by continuity, adding the principal change of the period eigenvalue's argument
// step by step, so a mode whose phase advances more than pi a period (c k 24 > pi) keeps its branch. The
// steps must be small enough that the eigenvalue moves less than its distance to any other slow one.
export function trackMode(input: {
  matrices: readonly Float64Array[]
  direction: readonly number[]
  ks: readonly number[]
  densities: Record<string, Float64Array>
  score: (mode: SlowMode) => number
  floor?: number
}): { k: number; gamma: number; omega: number; content: Record<string, number> }[] {
  const period = input.matrices.length
  const out: { k: number; gamma: number; omega: number; content: Record<string, number> }[] = []

  let last: SlowMode | undefined
  let before: SlowMode | undefined
  let omega = 0

  for (const k of input.ks) {
    const wave = input.direction.map(x => x * k)
    const modes = slowModes({ map: periodMap({ matrices: input.matrices, wave }), period, floor: input.floor ?? 0.02, densities: input.densities })
    const pickFrom = last
    // the next eigenvalue extrapolated from the last two (last times last / before), so two modes that
    // pass each other moving in opposite directions are not swapped
    const predicted =
      pickFrom && before
        ? (() => {
            const den = before.re * before.re + before.im * before.im
            const rr = (pickFrom.re * before.re + pickFrom.im * before.im) / den
            const ri = (pickFrom.im * before.re - pickFrom.re * before.im) / den

            return { re: pickFrom.re * rr - pickFrom.im * ri, im: pickFrom.re * ri + pickFrom.im * rr }
          })()
        : pickFrom
    const mode = predicted
      ? modes.reduce((best, m) => (Math.hypot(m.re - predicted.re, m.im - predicted.im) < Math.hypot(best.re - predicted.re, best.im - predicted.im) ? m : best))
      : modes.reduce((best, m) => (input.score(m) > input.score(best) ? m : best))

    if (pickFrom) {
      // the principal change of argument from the last eigenvalue to this one
      const dr = mode.re * pickFrom.re + mode.im * pickFrom.im
      const di = mode.im * pickFrom.re - mode.re * pickFrom.im

      omega += -Math.atan2(di, dr) / period
    } else {
      omega = mode.omega
    }

    out.push({ k, gamma: mode.gamma, omega, content: mode.content })
    before = last
    last = mode
  }

  return out
}

// ---- the real-space reading on a reduced lattice ----

export type ReducedLattice = {
  // the torus side, the same as the knit's
  readonly side: number
  // the projections: a dock at r sits at site (axes[0] . r, axes[1] . r, ...) mod side
  readonly axes: readonly (readonly number[])[]
}

export function reducedSiteCount(lattice: ReducedLattice): number {
  return lattice.side ** lattice.axes.length
}

const mod = (a: number, n: number): number => ((a % n) + n) % n

function siteOf(lattice: ReducedLattice, r: readonly number[]): number {
  let site = 0

  for (let j = lattice.axes.length - 1; j >= 0; j--) {
    site = site * lattice.side + mod(dot(lattice.axes[j] ?? [], r), lattice.side)
  }

  return site
}

// the site coordinates of a site index
export function reducedCoordinates(lattice: ReducedLattice, site: number): number[] {
  return lattice.axes.map((_, j) => Math.floor(site / lattice.side ** j) % lattice.side)
}

// the gather table of one stream on the reduced lattice: next[site * 48 + i] = current[table[site * 48 + i]]
export function reducedStreamTable(lattice: ReducedLattice): Int32Array {
  const sites = reducedSiteCount(lattice)
  const table = new Int32Array(sites * SLOT_STATES)

  for (let site = 0; site < sites; site++) {
    const coords = reducedCoordinates(lattice, site)

    for (let i = 0; i < SLOT_STATES; i++) {
      const root = ROOTS[Math.floor(i / 2)] ?? []
      // the source site is this one minus the root's projections
      let source = 0

      for (let j = lattice.axes.length - 1; j >= 0; j--) {
        source = source * lattice.side + mod((coords[j] ?? 0) - dot(lattice.axes[j] ?? [], root), lattice.side)
      }

      table[site * SLOT_STATES + i] = source * SLOT_STATES + i
    }
  }

  return table
}

// The knit's averaged one-body field on a reduced lattice: at each site, the fraction of the docks
// projecting there whose slot d holds love (index d * 2) and fear (d * 2 + 1)
export function oneBodyField(input: { data: Int8Array; side: number; lattice: ReducedLattice }): Float64Array {
  const { data, side, lattice } = input
  const sites = reducedSiteCount(lattice)
  const field = new Float64Array(sites * SLOT_STATES)
  const counts = new Float64Array(sites)
  const docks = data.length / 24
  const r = [0, 0, 0, 0]

  for (let dock = 0; dock < docks; dock++) {
    r[0] = dock % side
    r[1] = Math.floor(dock / side) % side
    r[2] = Math.floor(dock / side ** 2) % side
    r[3] = Math.floor(dock / side ** 3) % side

    const site = siteOf(lattice, r)
    const base = site * SLOT_STATES

    counts[site] = (counts[site] ?? 0) + 1

    for (let d = 0; d < 24; d++) {
      const v = data[dock * 24 + d] ?? 0

      if (v !== 0) {
        field[base + d * 2 + (v > 0 ? 0 : 1)] = (field[base + d * 2 + (v > 0 ? 0 : 1)] ?? 0) + 1
      }
    }
  }

  for (let site = 0; site < sites; site++) {
    const c = counts[site] ?? 1

    for (let i = 0; i < SLOT_STATES; i++) {
      field[site * SLOT_STATES + i] = (field[site * SLOT_STATES + i] ?? 0) / c
    }
  }

  return field
}

// the deviation of a field from a background, site by site
export function deviationOf(field: Float64Array, background: Float64Array): Float64Array {
  return field.map((v, i) => v - (background[i % SLOT_STATES] ?? 0))
}

// the density of a left vector at every site
export function densityProfile(field: Float64Array, left: Float64Array): Float64Array {
  const sites = field.length / SLOT_STATES
  const out = new Float64Array(sites)

  for (let site = 0; site < sites; site++) {
    let s = 0

    for (let i = 0; i < SLOT_STATES; i++) {
      s += (left[i] ?? 0) * (field[site * SLOT_STATES + i] ?? 0)
    }

    out[site] = s
  }

  return out
}

// Run the linear lattice Boltzmann equation from a deviation field for some beats, beat t using
// matrices[(t0 + t) mod period]; observe(field, t) sees the start (t = 0) and every beat after
export function linearBoltzmannRun(input: {
  lattice: ReducedLattice
  matrices: readonly Float64Array[]
  start: Float64Array
  beats: number
  t0?: number
  observe: (field: Float64Array, t: number) => void
}): Float64Array {
  const { lattice, matrices, beats } = input
  const table = reducedStreamTable(lattice)
  const sites = reducedSiteCount(lattice)
  const n = SLOT_STATES
  const period = matrices.length

  const current = Float64Array.from(input.start)
  const collided = new Float64Array(current.length)

  input.observe(current, 0)

  for (let t = 0; t < beats; t++) {
    const a = matrices[((input.t0 ?? 0) + t) % period] ?? new Float64Array(n * n)

    for (let site = 0; site < sites; site++) {
      const base = site * n

      for (let r = 0; r < n; r++) {
        let s = 0
        const row = r * n

        for (let c = 0; c < n; c++) {
          s += (a[row + c] ?? 0) * (current[base + c] ?? 0)
        }

        collided[base + r] = s
      }
    }

    for (let i = 0; i < current.length; i++) {
      current[i] = collided[table[i] ?? 0] ?? 0
    }

    input.observe(current, t + 1)
  }

  return current
}
