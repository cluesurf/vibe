// The spinor token (code/rule/spinor-token) with its spin written inside the ROLE, about the token's own role
// point, and carried through a color field of translations: a STAND-IN for E-SPN-0066, not the electron.
//
// code/rule/spinor-token takes the spin as a bare doublet. E-SPN-0051 put that doublet inside the role: the role is
// C^3, and about a grid point p it splits into the parity-even doublet, the range of Q_p = (1 + A(p)) / 2 (the
// spinor, where the 2 pi turn about p is -1), and the parity-odd line (a boson). E-SPN-0059 made the weight in the
// doublet about each token's own point its fermion number. This walker carries all three pieces: per dock, one
// amplitude for each own point p (9), slot (2) and role component (3), index ((d 9 + p) 2 + slot) 3 + r.
//
// THE PIECES.
// - Role frame at p: F_p = D(p), so A(p) = D(p) P D(p)^dagger and the doublet about p is F_p times the doublet
//   about the origin. At the origin the doublet is spanned by e0 = |0> and e1 = (|1> + |2>) / sqrt 2 (P = +1),
//   the line by l = (|1> - |2>) / sqrt 2 (P = -1). The spin basis is (e0, e1): sigma_a acts on it as in
//   code/rule/spinor-token.
// - The locked stream along axis a at own point p copies the component with tau_z G_a(p) = +1 forward and the rest
//   back, with G_a(p) = F_p (sigma_a (+) lambda) F_p^dagger in the COMOVING law (the spin read in the token's own
//   frame) and G_a = sigma_a (+) lambda at every p in the FIXED-FRAME control (the spin read about the origin
//   whatever the token's point). lambda = +1 on the line: no choice of it is covariant (E-SPN-0066 part A), and it
//   never acts on a token that stays in the doublet. A depth beat copies every component the same way.
// - The coin C on the slots, the identity on the role, first in every beat, as in code/rule/spinor-token.
// - The color field: every husk link (dock d, axis a) carries a translation v(d, a) in Z3^2. A copy crossing it
//   forward has its role multiplied by D(v) and its own point moved to p + v; backward D(v)^dagger and p - v. Since
//   D(v) A(p) D(v)^dagger = A(p + v), the doublet about p goes to the doublet about p + v.
// - The charge: a U(1) Peierls phase e^(i q theta) per link, as in code/rule/spinor-token.
//
// Floating point, deterministic, no random numbers.

import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { displacementMatrix, phasePointMatrix } from '@/code/algebra/weil-representation'
import { COIN_A, COIN_B, dockIndex, stepAxis, type Step } from '@/code/rule/spinor-token'

export type Law = 'comoving' | 'fixed'

export type RoleWalker = { readonly side: number; re: Float64Array; im: Float64Array }

type M3 = { re: Float64Array; im: Float64Array }

const SQRT_HALF = Math.SQRT1_2

// the basis (e0, e1, l) as the columns of a 3 x 3 unitary
function basisMatrix(): M3 {
  const re = new Float64Array(9)

  re[0 * 3 + 0] = 1
  re[1 * 3 + 1] = SQRT_HALF
  re[2 * 3 + 1] = SQRT_HALF
  re[1 * 3 + 2] = SQRT_HALF
  re[2 * 3 + 2] = -SQRT_HALF

  return { re, im: new Float64Array(9) }
}

function mul3(a: M3, b: M3): M3 {
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      const ar = a.re[i * 3 + k] ?? 0
      const ai = a.im[i * 3 + k] ?? 0

      for (let j = 0; j < 3; j++) {
        re[i * 3 + j] = (re[i * 3 + j] ?? 0) + ar * (b.re[k * 3 + j] ?? 0) - ai * (b.im[k * 3 + j] ?? 0)
        im[i * 3 + j] = (im[i * 3 + j] ?? 0) + ar * (b.im[k * 3 + j] ?? 0) + ai * (b.re[k * 3 + j] ?? 0)
      }
    }
  }

  return { re, im }
}

export function dagger3(a: M3): M3 {
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      re[i * 3 + j] = a.re[j * 3 + i] ?? 0
      im[i * 3 + j] = -(a.im[j * 3 + i] ?? 0)
    }
  }

  return { re, im }
}

const fromComplex = (m: ComplexMatrix): M3 => ({ re: Float64Array.from(m.re), im: Float64Array.from(m.im) })

// sigma_a (+) lambda in the basis (e0, e1, l), then written in the computational basis
function originGenerator(axis: number, lambda: number): M3 {
  const g: M3 = { re: new Float64Array(9), im: new Float64Array(9) }

  if (axis === 0) {
    g.re[0 * 3 + 1] = 1
    g.re[1 * 3 + 0] = 1
  } else if (axis === 1) {
    g.im[0 * 3 + 1] = -1
    g.im[1 * 3 + 0] = 1
  } else {
    g.re[0] = 1
    g.re[4] = -1
  }

  g.re[8] = lambda

  const b = basisMatrix()

  return mul3(mul3(b, g), dagger3(b))
}

const phaseIndex = (a: number, b: number): number => 3 * (((a % 3) + 3) % 3) + (((b % 3) + 3) % 3)

export type RoleTables = {
  // per own point p: the projectors (1 + G_a(p)) / 2 and (1 - G_a(p)) / 2, a = 0, 1, 2, for each law
  readonly plus: Record<Law, M3[][]>
  readonly minus: Record<Law, M3[][]>
  // per own point p: Q_p = (1 + A(p)) / 2
  readonly doublet: M3[]
  // per translation v: D(v), D(v)^dagger, and the point it moves p to
  readonly shift: M3[]
  readonly shiftBack: M3[]
  readonly moved: number[][]
  readonly movedBack: number[][]
  // the basis vectors e0, e1 at the origin
  readonly e0: M3
}

export function roleTables(lambda = 1): RoleTables {
  const frames = Array.from({ length: 9 }, (_, p) => fromComplex(displacementMatrix(3, Math.floor(p / 3), p % 3)))
  const origin = [0, 1, 2].map(a => originGenerator(a, lambda))
  const half = (g: M3, s: number): M3 => ({
    re: g.re.map((x, i) => (s * x + (i % 4 === 0 ? 1 : 0)) / 2),
    im: g.im.map(x => (s * x) / 2),
  })
  const projectors = (law: Law, s: number): M3[][] =>
    frames.map(f => origin.map(g => half(law === 'comoving' ? mul3(mul3(f, g), dagger3(f)) : g, s)))
  const doublet = Array.from({ length: 9 }, (_, p) => half(fromComplex(phasePointMatrix(3, Math.floor(p / 3), p % 3)), 1))
  const moved = Array.from({ length: 9 }, (_, v) => Array.from({ length: 9 }, (__, p) => phaseIndex(Math.floor(p / 3) + Math.floor(v / 3), (p % 3) + (v % 3))))
  const movedBack = Array.from({ length: 9 }, (_, v) => Array.from({ length: 9 }, (__, p) => phaseIndex(Math.floor(p / 3) - Math.floor(v / 3), (p % 3) - (v % 3))))

  return {
    plus: { comoving: projectors('comoving', 1), fixed: projectors('fixed', 1) },
    minus: { comoving: projectors('comoving', -1), fixed: projectors('fixed', -1) },
    doublet,
    shift: frames,
    shiftBack: frames.map(dagger3),
    moved,
    movedBack,
    e0: basisMatrix(),
  }
}

export function makeRoleWalker(side: number): RoleWalker {
  return { side, re: new Float64Array(54 * side ** 3), im: new Float64Array(54 * side ** 3) }
}

export const roleIndex = (d: number, p: number, slot: number, r: number): number => ((d * 9 + p) * 2 + slot) * 3 + r

// v(d, a): the color translation on each husk link, from a golden Weyl sequence (all zero when `off`)
export function colorField(side: number, off: boolean): Int8Array {
  const v = new Int8Array(3 * side ** 3)

  if (!off) {
    for (let i = 0; i < v.length; i++) {
      v[i] = Math.floor((((i + 1) * ((Math.sqrt(5) - 1) / 2)) % 1) * 9)
    }
  }

  return v
}

// y = m x on a role 3-vector stored at offset o of (re, im), added into (outRe, outIm) at offset t with a phase
function applyAdd(m: M3, re: Float64Array, im: Float64Array, o: number, outRe: Float64Array, outIm: Float64Array, t: number, c: number, s: number): number {
  let carried = 0

  for (let i = 0; i < 3; i++) {
    let yr = 0
    let yi = 0

    for (let j = 0; j < 3; j++) {
      const mr = m.re[i * 3 + j] ?? 0
      const mi = m.im[i * 3 + j] ?? 0
      const xr = re[o + j] ?? 0
      const xi = im[o + j] ?? 0

      yr += mr * xr - mi * xi
      yi += mr * xi + mi * xr
    }

    outRe[t + i] = (outRe[t + i] ?? 0) + yr * c - yi * s
    outIm[t + i] = (outIm[t + i] ?? 0) + yr * s + yi * c
    carried += yr * yr + yi * yi
  }

  return carried
}

const SCRATCH = { re: new Float64Array(3), im: new Float64Array(3) }

// one beat: the coin, then the stream of `step` with the color field and the charge's phase. Records the weight
// carried across each dock's +axis link into `currents` when given (forward minus back), as code/rule/spinor-token
export function beatRoleWalker(input: {
  walker: RoleWalker
  step: Step
  law: Law
  tables: RoleTables
  color: Int8Array
  charge?: number
  theta?: readonly (Float64Array | undefined)[]
  currents?: Float64Array
}): void {
  const { walker: w, step, law, tables, color } = input
  const side = w.side
  const docks = side ** 3
  const q = input.charge ?? 0
  const { axis, sign } = stepAxis(step)
  const theta = input.theta?.[axis]
  const depth = step === 'up' || step === 'down'

  // the coin
  for (let i = 0; i < docks * 9; i++) {
    for (let r = 0; r < 3; r++) {
      const a = i * 6 + r
      const b = i * 6 + 3 + r
      const ar = w.re[a] ?? 0
      const ai = w.im[a] ?? 0
      const br = w.re[b] ?? 0
      const bi = w.im[b] ?? 0

      w.re[a] = COIN_A[0] * ar - COIN_A[1] * ai + COIN_B[0] * br - COIN_B[1] * bi
      w.im[a] = COIN_A[0] * ai + COIN_A[1] * ar + COIN_B[0] * bi + COIN_B[1] * br
      w.re[b] = COIN_B[0] * ar - COIN_B[1] * ai + COIN_A[0] * br - COIN_A[1] * bi
      w.im[b] = COIN_B[0] * ai + COIN_B[1] * ar + COIN_A[0] * bi + COIN_A[1] * br
    }
  }

  const nextRe = new Float64Array(w.re.length)
  const nextIm = new Float64Array(w.im.length)
  const step3 = [0, 0, 0]

  step3[axis] = sign

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const d = dockIndex(side, x, y, z)
        const forward = dockIndex(side, x + (step3[0] ?? 0), y + (step3[1] ?? 0), z + (step3[2] ?? 0))
        const back = dockIndex(side, x - (step3[0] ?? 0), y - (step3[1] ?? 0), z - (step3[2] ?? 0))
        const forwardAngle = sign > 0 ? (theta?.[d] ?? 0) : -(theta?.[forward] ?? 0)
        const backAngle = sign > 0 ? -(theta?.[back] ?? 0) : (theta?.[d] ?? 0)
        // the color translation each copy crosses, and whether it crosses its link forward
        const forwardLink = sign > 0 ? { v: color[3 * d + axis] ?? 0, along: true } : { v: color[3 * forward + axis] ?? 0, along: false }
        const backLink = sign > 0 ? { v: color[3 * back + axis] ?? 0, along: false } : { v: color[3 * d + axis] ?? 0, along: true }
        let carriedForward = 0
        let carriedBack = 0

        for (let p = 0; p < 9; p++) {
          for (let slot = 0; slot < 2; slot++) {
            const o = roleIndex(d, p, slot, 0)
            const tau = slot === 0 ? 1 : -1

            for (const [target, angle, link, isForward] of [
              [forward, forwardAngle, forwardLink, true],
              [back, backAngle, backLink, false],
            ] as const) {
              // the part copied this way: (1 + tau G) / 2 forward, (1 - tau G) / 2 back; a depth beat copies all
              // forward
              if (depth && !isForward) {
                continue
              }

              const projector = depth ? undefined : ((isForward ? tau : -tau) > 0 ? tables.plus[law] : tables.minus[law])[p]?.[axis]

              SCRATCH.re.fill(0)
              SCRATCH.im.fill(0)

              if (projector) {
                applyAdd(projector, w.re, w.im, o, SCRATCH.re, SCRATCH.im, 0, 1, 0)
              } else {
                for (let r = 0; r < 3; r++) {
                  SCRATCH.re[r] = w.re[o + r] ?? 0
                  SCRATCH.im[r] = w.im[o + r] ?? 0
                }
              }

              const shift = (link.along ? tables.shift : tables.shiftBack)[link.v] ?? tables.shift[0]!
              const to = (link.along ? tables.moved : tables.movedBack)[link.v]?.[p] ?? p
              const carried = applyAdd(shift, SCRATCH.re, SCRATCH.im, 0, nextRe, nextIm, roleIndex(target, to, slot, 0), Math.cos(q * angle), Math.sin(q * angle))

              if (isForward) {
                carriedForward += carried
              } else {
                carriedBack += carried
              }
            }
          }
        }

        if (input.currents) {
          if (sign > 0) {
            input.currents[3 * d + axis] = (input.currents[3 * d + axis] ?? 0) + carriedForward
            input.currents[3 * back + axis] = (input.currents[3 * back + axis] ?? 0) - carriedBack
          } else {
            input.currents[3 * forward + axis] = (input.currents[3 * forward + axis] ?? 0) - carriedForward
            input.currents[3 * d + axis] = (input.currents[3 * d + axis] ?? 0) + carriedBack
          }
        }
      }
    }
  }

  w.re.set(nextRe)
  w.im.set(nextIm)
}

// the exact inverse of beatRoleWalker: each part gathered back from where it was copied, taken off its link, and
// projected at its own point; then the coin's adjoint
export function inverseBeatRoleWalker(input: {
  walker: RoleWalker
  step: Step
  law: Law
  tables: RoleTables
  color: Int8Array
  charge?: number
  theta?: readonly (Float64Array | undefined)[]
}): void {
  const { walker: w, step, law, tables, color } = input
  const side = w.side
  const q = input.charge ?? 0
  const { axis, sign } = stepAxis(step)
  const theta = input.theta?.[axis]
  const depth = step === 'up' || step === 'down'
  const nextRe = new Float64Array(w.re.length)
  const nextIm = new Float64Array(w.im.length)
  const step3 = [0, 0, 0]

  step3[axis] = sign

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const d = dockIndex(side, x, y, z)
        const forward = dockIndex(side, x + (step3[0] ?? 0), y + (step3[1] ?? 0), z + (step3[2] ?? 0))
        const back = dockIndex(side, x - (step3[0] ?? 0), y - (step3[1] ?? 0), z - (step3[2] ?? 0))
        const forwardAngle = sign > 0 ? (theta?.[d] ?? 0) : -(theta?.[forward] ?? 0)
        const backAngle = sign > 0 ? -(theta?.[back] ?? 0) : (theta?.[d] ?? 0)
        const forwardLink = sign > 0 ? { v: color[3 * d + axis] ?? 0, along: true } : { v: color[3 * forward + axis] ?? 0, along: false }
        const backLink = sign > 0 ? { v: color[3 * back + axis] ?? 0, along: false } : { v: color[3 * d + axis] ?? 0, along: true }

        for (let p = 0; p < 9; p++) {
          for (let slot = 0; slot < 2; slot++) {
            const tau = slot === 0 ? 1 : -1

            for (const [source, angle, link, isForward] of [
              [forward, forwardAngle, forwardLink, true],
              [back, backAngle, backLink, false],
            ] as const) {
              if (depth && !isForward) {
                continue
              }

              const to = (link.along ? tables.moved : tables.movedBack)[link.v]?.[p] ?? p
              const undo = (link.along ? tables.shiftBack : tables.shift)[link.v] ?? tables.shift[0]!

              SCRATCH.re.fill(0)
              SCRATCH.im.fill(0)
              applyAdd(undo, w.re, w.im, roleIndex(source, to, slot, 0), SCRATCH.re, SCRATCH.im, 0, Math.cos(q * angle), -Math.sin(q * angle))

              const projector = depth ? undefined : ((isForward ? tau : -tau) > 0 ? tables.plus[law] : tables.minus[law])[p]?.[axis]
              const o = roleIndex(d, p, slot, 0)

              if (projector) {
                applyAdd(projector, SCRATCH.re, SCRATCH.im, 0, nextRe, nextIm, o, 1, 0)
              } else {
                for (let r = 0; r < 3; r++) {
                  nextRe[o + r] = (nextRe[o + r] ?? 0) + (SCRATCH.re[r] ?? 0)
                  nextIm[o + r] = (nextIm[o + r] ?? 0) + (SCRATCH.im[r] ?? 0)
                }
              }
            }
          }
        }
      }
    }
  }

  w.re.set(nextRe)
  w.im.set(nextIm)

  // the coin's adjoint
  for (let i = 0; i < side ** 3 * 9; i++) {
    for (let r = 0; r < 3; r++) {
      const a = i * 6 + r
      const b = i * 6 + 3 + r
      const ar = w.re[a] ?? 0
      const ai = w.im[a] ?? 0
      const br = w.re[b] ?? 0
      const bi = w.im[b] ?? 0

      w.re[a] = COIN_A[0] * ar + COIN_A[1] * ai + COIN_B[0] * br + COIN_B[1] * bi
      w.im[a] = COIN_A[0] * ai - COIN_A[1] * ar + COIN_B[0] * bi - COIN_B[1] * br
      w.re[b] = COIN_B[0] * ar + COIN_B[1] * ai + COIN_A[0] * br + COIN_A[1] * bi
      w.im[b] = COIN_B[0] * ai - COIN_B[1] * ar + COIN_A[0] * bi - COIN_A[1] * br
    }
  }
}

// the fermion number: the weight in the doublet about each amplitude's own point, and the total weight
export function fermionNumber(w: RoleWalker, tables: RoleTables): { doublet: number; total: number } {
  let doublet = 0
  let total = 0

  for (let d = 0; d < w.side ** 3; d++) {
    for (let p = 0; p < 9; p++) {
      const qp = tables.doublet[p]!

      for (let slot = 0; slot < 2; slot++) {
        const o = roleIndex(d, p, slot, 0)

        // <psi| Q |psi>, Q Hermitian
        for (let i = 0; i < 3; i++) {
          const xr = w.re[o + i] ?? 0
          const xi = w.im[o + i] ?? 0

          total += xr * xr + xi * xi

          for (let j = 0; j < 3; j++) {
            const mr = qp.re[i * 3 + j] ?? 0
            const mi = qp.im[i * 3 + j] ?? 0
            const yr = w.re[o + j] ?? 0
            const yi = w.im[o + j] ?? 0

            // conj(x_i) (m_ij y_j), real part
            doublet += xr * (mr * yr - mi * yi) + xi * (mr * yi + mi * yr)
          }
        }
      }
    }
  }

  return { doublet, total }
}

export function roleDensity(w: RoleWalker): Float64Array {
  const out = new Float64Array(w.side ** 3)

  for (let i = 0; i < w.re.length; i++) {
    const d = Math.floor(i / 54)

    out[d] = (out[d] ?? 0) + (w.re[i] ?? 0) ** 2 + (w.im[i] ?? 0) ** 2
  }

  return out
}
