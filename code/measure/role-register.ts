// ROLES AND A TONE ON THE REGISTER RULE (E-FND-0160). The adopted knit gives every vibe a tone (fear, calm, love) and a
// role point, one of the 9 points of the role grid, moved by the links' grid moves and read by the fear beat. The
// register rule (E-SPN-0160, 0163, 0175) has neither: one tone (the love sea) and no role. This module holds what the
// construction adds and what its readings need.
//
//   THE ROLE         a qutrit C^3 on every member. The 9 grid points are its phase space (code/measure/qutrit-phase-space:
//                    the phase-point operators A(a, b)), so a role point of the knit is a Wigner coordinate of this
//                    qutrit, and a grid move is a Clifford conjugation. The register rule's pieces act as (x) 1 on it
//   THE TONE         a species label. The love field and the fear field each fill their own full sea; a hole of the love
//                    sea is a fear-tone member (charge -1), a hole of the fear sea a love-tone member (+1). The tone mirror
//                    swaps the species. The fear-tone role is carried in the conjugate representation (3-bar), which is
//                    forced: the unlike kernel's singlet Phi = sum |a a> / sqrt 3 is invariant under g (x) conj(g) and
//                    3 (x) 3 holds no invariant at all
//   THE FEAR BEAT    the knit's two meeting kernels as a sector contact, counted from the sea: at V = 0 with both holes in
//                    the beat's sector (Q (x) Q), a like pair (one species) takes U = P_sym + w P_anti on its roles and an
//                    unlike pair (one of each) V = 1 + (w - 1) Phi Phi^dag, w = omega (the knit's 2 pi / 3), reversed in
//                    beat 2 and for holes, as every sector piece of E-SPN-0175 is
//   CHANNELS         both kernels are diagonal in a fixed split of the role pair (sym / anti, Phi / Phi-perp), and every
//                    other piece is role-blind, so the two-hole run is two orbital runs of E-SPN-0175's engine, one with the
//                    contact phase shifted by the fear angle and one without. The role state is carried as a label
//
// For an unlike pair started as phi0 (x) chi0, with chi0 = chi_perp + c Phi, the whole state is
//   Psi(t) = phi_perp(t) (x) chi_perp + phi_Phi(t) (x) c Phi
// so the role state left after tracing both members' orbits is fixed by ONE number, g = <phi_perp | phi_Phi>:
//   rho = chi_perp chi_perp^dag + |c|^2 Phi Phi^dag + conj(g) chi_perp (c Phi)^dag + g (c Phi) chi_perp^dag
// With the fear beat off the two runs are one run, g = 1 and rho = chi0 chi0^dag exactly.
//
//   READINGS         the two-role Wigner function on the 81 joint phase points, the 40 Lagrangian context sums S_u
//                    (E-QTM-0149: S_u = 36 W(u) + 4, below 4 only where W < 0), negativity and mana, the Schmidt block
//                    CHSH of a pure role state (E-QTM-0140's block value)
//   THE LINKS        sigmaReading: Sigma(648)'s action on the 9 phase points against the knit's 216 grid moves, and the
//                    kernels' covariance (V under g (x) conj g, U under g (x) g); centralGridTrace and gridPairOrbits,
//                    the two facts that keep the grid's 8 out of the register's 8
//   THE BALL         fearBallEngine: E-SPN-0178's reduced ball with the unlike kernel's phase on the singlet channel
//   A CONTROL        dockPhaseCycle: the fear beat placed where the knit places it, on every pair sharing a dock, which
//                    is not a sector piece
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces (the fear unit is omega = ringUnit(0, 1)).

import { type Operator } from '@/code/measure/grid-weights'
import {
  phasePoint,
  phaseSpaceAction,
  affineOf,
} from '@/code/measure/qutrit-phase-space'
import {
  cosetLabels,
  lagrangians,
  phaseSpace,
} from '@/code/measure/stabilizer-contexts'
import {
  FULL,
  seaBeat,
  type Pair,
  type SeaRule,
  type SectorBases,
  type Torus,
} from '@/code/measure/register-sea'
import {
  ballEngine,
  type BallEngine,
  type BallSector,
} from '@/code/measure/register-ball-reduced'
import { betaOf, type PairParams } from '@/code/measure/register-meson'
import { generateGroup, type Matrix3 } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { gridMoves } from '@/code/rule/vibe-weave'

// ---- two-role vectors, index 3 r1 + r2 ----

export type RoleVector = { re: Float64Array; im: Float64Array }

export const roleVector = (): RoleVector => ({
  re: new Float64Array(9),
  im: new Float64Array(9),
})

// the singlet of the unlike kernel, sum_a |a a> / sqrt 3
export function singletRole(): RoleVector {
  const v = roleVector()

  for (let a = 0; a < 3; a++) {
    v.re[4 * a] = 1 / Math.sqrt(3)
  }

  return v
}

// |a> (x) |b> for two one-role vectors
export function productRole(
  a: readonly (readonly [number, number])[],
  b: readonly (readonly [number, number])[],
): RoleVector {
  const v = roleVector()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const [ar, ai] = a[i]!
      const [br, bi] = b[j]!

      v.re[3 * i + j] = ar * br - ai * bi
      v.im[3 * i + j] = ar * bi + ai * br
    }
  }

  return v
}

// <x | y>
export function roleInner(x: RoleVector, y: RoleVector): [number, number] {
  let re = 0
  let im = 0

  for (let k = 0; k < 9; k++) {
    re += x.re[k]! * y.re[k]! + x.im[k]! * y.im[k]!
    im += x.re[k]! * y.im[k]! - x.im[k]! * y.re[k]!
  }

  return [re, im]
}

// chi = chi_perp + c Phi
export function splitSinglet(chi: RoleVector): {
  c: [number, number]
  perp: RoleVector
} {
  const phi = singletRole()
  const c = roleInner(phi, chi)
  const perp = roleVector()

  for (let k = 0; k < 9; k++) {
    perp.re[k] = chi.re[k]! - (c[0] * phi.re[k]! - c[1] * phi.im[k]!)
    perp.im[k] = chi.im[k]! - (c[0] * phi.im[k]! + c[1] * phi.re[k]!)
  }

  return { c, perp }
}

// the like kernel's split: chi = chi_sym + chi_anti, (chi +- swap chi) / 2
export function splitExchange(chi: RoleVector): {
  sym: RoleVector
  anti: RoleVector
} {
  const sym = roleVector()
  const anti = roleVector()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const k = 3 * i + j
      const kk = 3 * j + i

      sym.re[k] = (chi.re[k]! + chi.re[kk]!) / 2
      sym.im[k] = (chi.im[k]! + chi.im[kk]!) / 2
      anti.re[k] = (chi.re[k]! - chi.re[kk]!) / 2
      anti.im[k] = (chi.im[k]! - chi.im[kk]!) / 2
    }
  }

  return { sym, anti }
}

// the unlike kernel V(theta) = 1 + (e^(i theta) - 1) Phi Phi^dag applied to a role vector
export function applySinglet(chi: RoleVector, theta: number): RoleVector {
  const { c, perp } = splitSinglet(chi)
  const phi = singletRole()
  const zr = Math.cos(theta) * c[0] - Math.sin(theta) * c[1]
  const zi = Math.cos(theta) * c[1] + Math.sin(theta) * c[0]
  const out = roleVector()

  for (let k = 0; k < 9; k++) {
    out.re[k] = perp.re[k]! + zr * phi.re[k]!
    out.im[k] = perp.im[k]! + zi * phi.re[k]!
  }

  return out
}

// ---- the two orbital channels ----

// <a | b> over the whole pair
export function pairOverlap(a: Pair, b: Pair): [number, number] {
  let re = 0
  let im = 0

  for (let k = 0; k < a.re.length; k++) {
    re += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    im += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [re, im]
}

// the role state left by the two channels, rho = |x><x| summed as above, 9 x 9 row-major
export function reducedRole(chi: RoleVector, g: readonly [number, number]): Operator {
  const { c, perp } = splitSinglet(chi)
  const phi = singletRole()
  // b = c Phi
  const bre = new Float64Array(9)
  const bim = new Float64Array(9)

  for (let k = 0; k < 9; k++) {
    bre[k] = c[0] * phi.re[k]!
    bim[k] = c[1] * phi.re[k]!
  }

  const rho: Operator = {
    n: 9,
    re: new Float64Array(81),
    im: new Float64Array(81),
  }
  // x y^dag entry (i, j) = x_i conj(y_j)
  const add = (
    xr: ArrayLike<number>,
    xi: ArrayLike<number>,
    yr: ArrayLike<number>,
    yi: ArrayLike<number>,
    f: readonly [number, number],
  ): void => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const pr = xr[i]! * yr[j]! + xi[i]! * yi[j]!
        const pi = xi[i]! * yr[j]! - xr[i]! * yi[j]!

        rho.re[i * 9 + j]! += f[0] * pr - f[1] * pi
        rho.im[i * 9 + j]! += f[0] * pi + f[1] * pr
      }
    }
  }

  add(perp.re, perp.im, perp.re, perp.im, [1, 0])
  add(bre, bim, bre, bim, [1, 0])
  add(perp.re, perp.im, bre, bim, [g[0], -g[1]])
  add(bre, bim, perp.re, perp.im, g)

  return rho
}

// the pure role state at one orbital configuration, z_perp chi_perp + z_Phi c Phi (not normalized)
export function conditionalRole(
  chi: RoleVector,
  zPerp: readonly [number, number],
  zPhi: readonly [number, number],
): RoleVector {
  const { c, perp } = splitSinglet(chi)
  const phi = singletRole()
  const br = zPhi[0] * c[0] - zPhi[1] * c[1]
  const bi = zPhi[0] * c[1] + zPhi[1] * c[0]
  const out = roleVector()

  for (let k = 0; k < 9; k++) {
    out.re[k] = zPerp[0] * perp.re[k]! - zPerp[1] * perp.im[k]! + br * phi.re[k]!
    out.im[k] = zPerp[0] * perp.im[k]! + zPerp[1] * perp.re[k]! + bi * phi.re[k]!
  }

  return out
}

export function pureOperator(v: RoleVector): Operator {
  const rho: Operator = {
    n: 9,
    re: new Float64Array(81),
    im: new Float64Array(81),
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      rho.re[i * 9 + j] = v.re[i]! * v.re[j]! + v.im[i]! * v.im[j]!
      rho.im[i * 9 + j] = v.im[i]! * v.re[j]! - v.re[i]! * v.im[j]!
    }
  }

  return rho
}

// ---- the two-role Wigner function and the model's own contexts ----

// the 81 two-role phase-point operators A(u1) (x) A(u2), u = 3 a + b, index 9 u1 + u2 (stabilizer-contexts' order)
const TWO_POINTS: { re: Float64Array; im: Float64Array }[] = (() => {
  const one = Array.from({ length: 9 }, (_, p) =>
    phasePoint(Math.floor(p / 3), p % 3),
  )
  const out: { re: Float64Array; im: Float64Array }[] = []

  for (let p1 = 0; p1 < 9; p1++) {
    for (let p2 = 0; p2 < 9; p2++) {
      const a = one[p1]!
      const b = one[p2]!
      const re = new Float64Array(81)
      const im = new Float64Array(81)

      for (let i1 = 0; i1 < 3; i1++) {
        for (let i2 = 0; i2 < 3; i2++) {
          for (let j1 = 0; j1 < 3; j1++) {
            for (let j2 = 0; j2 < 3; j2++) {
              const ar = a[2 * (3 * i1 + j1)]!
              const ai = a[2 * (3 * i1 + j1) + 1]!
              const br = b[2 * (3 * i2 + j2)]!
              const bi = b[2 * (3 * i2 + j2) + 1]!
              const k = (3 * i1 + i2) * 9 + 3 * j1 + j2

              re[k] = ar * br - ai * bi
              im[k] = ar * bi + ai * br
            }
          }
        }
      }

      out.push({ re, im })
    }
  }

  return out
})()

// W(u) = Tr(rho A(u)) / 9, the 81 values
export function twoRoleWigner(rho: Operator): Float64Array {
  const W = new Float64Array(81)

  TWO_POINTS.forEach((A, u) => {
    let s = 0

    // Tr(rho A) = sum_ij rho_ij A_ji, real part
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        s +=
          rho.re[i * 9 + j]! * A.re[j * 9 + i]! -
          rho.im[i * 9 + j]! * A.im[j * 9 + i]!
      }
    }

    W[u] = s / 9
  })

  return W
}

const CONTEXTS: Int32Array[] = (() => {
  const space = phaseSpace(2)

  return lagrangians(space).map(L => cosetLabels(space, L))
})()

// S_u: the sum over the 40 Lagrangian contexts of the chance of the outcome through u (E-QTM-0149, >= 4 for any
// noncontextual assignment), read as coset sums of W
export function contextSums(W: Float64Array): Float64Array {
  const S = new Float64Array(81)

  for (const labels of CONTEXTS) {
    const sums = new Map<number, number>()

    for (let x = 0; x < 81; x++) {
      sums.set(labels[x]!, (sums.get(labels[x]!) ?? 0) + W[x]!)
    }

    for (let u = 0; u < 81; u++) {
      S[u]! += sums.get(labels[u]!)!
    }
  }

  return S
}

export const contextCount = (): number => CONTEXTS.length

// the sum of the negative parts of W, and the mana log sum |W|
export function negativity(W: Float64Array): { neg: number; mana: number; least: number } {
  let neg = 0
  let abs = 0
  let least = Infinity

  for (let u = 0; u < 81; u++) {
    neg += W[u]! < 0 ? -W[u]! : 0
    abs += Math.abs(W[u]!)
    least = Math.min(least, W[u]!)
  }

  return { neg, mana: Math.log(abs), least }
}

// the Schmidt weights of a pure two-role vector (normalized), largest first, from the 3 x 3 Hermitian M M^dag by
// Jacobi on its 6 x 6 real form (each weight appears twice there)
export function schmidtWeights(v: RoleVector): number[] {
  let n = 0

  for (let k = 0; k < 9; k++) {
    n += v.re[k]! ** 2 + v.im[k]! ** 2
  }

  // H = M M^dag, M[i][j] = v[3 i + j]
  const hr = new Float64Array(9)
  const hi = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const ar = v.re[3 * i + k]!
        const ai = v.im[3 * i + k]!
        const br = v.re[3 * j + k]!
        const bi = -v.im[3 * j + k]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      hr[3 * i + j] = re / n
      hi[3 * i + j] = im / n
    }
  }

  // the characteristic polynomial of a 3 x 3 Hermitian matrix: its eigenvalues by the trigonometric formula
  const tr = hr[0]! + hr[4]! + hr[8]!
  const m = tr / 3
  const sq = (k: number): number => hr[k]! ** 2 + hi[k]! ** 2
  const d0 = hr[0]! - m
  const d1 = hr[4]! - m
  const d2 = hr[8]! - m
  const p2 = d0 * d0 + d1 * d1 + d2 * d2 + 2 * (sq(1) + sq(2) + sq(5))
  const p = Math.sqrt(p2 / 6)

  if (p < 1e-15) {
    return [m, m, m]
  }

  // det((H - m) / p)
  const b = (k: number): [number, number] => [
    (hr[k]! - (k % 4 === 0 ? m : 0)) / p,
    hi[k]! / p,
  ]
  const mul = (x: [number, number], y: [number, number]): [number, number] => [
    x[0] * y[0] - x[1] * y[1],
    x[0] * y[1] + x[1] * y[0],
  ]
  const term = (i: number, j: number, k: number): number =>
    mul(mul(b(i), b(j)), b(k))[0]
  const det =
    term(0, 4, 8) +
    term(1, 5, 6) +
    term(2, 3, 7) -
    term(2, 4, 6) -
    term(1, 3, 8) -
    term(0, 5, 7)
  const r = Math.max(-1, Math.min(1, det / 2))
  const phi = Math.acos(r) / 3
  const e1 = m + 2 * p * Math.cos(phi)
  const e3 = m + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)
  const e2 = 3 * m - e1 - e3

  return [e1, e2, e3].map(x => Math.max(0, x)).sort((x, y) => y - x)
}

// the Schmidt-aligned block CHSH value of a pure two-role state, 2 sqrt(1 + 4 l1 l2) + ... on the top two weights with
// the third read as a product (E-QTM-0140's block value, a lower bound on the maximum)
export function blockChsh(v: RoleVector): number {
  const [l1, l2, l3] = schmidtWeights(v) as [number, number, number]

  return (l1 + l2) * 2 * Math.sqrt(1 + (4 * l1 * l2) / (l1 + l2) ** 2) + 2 * l3
}

// ---- the fear beat on E-SPN-0178's reduced ball ----

// E-SPN-0178's engine with the fear beat's unlike kernel on its singlet channel: at V = 0 the S S pair takes a further
// e^(i angle) in beat 1 and the D D pair e^(-i angle) in beat 2, as the string's own phase does. On the Phi-perp channel
// the kernel is the identity, so that channel is ballEngine unchanged
export function fearBallEngine(input: {
  sector: BallSector
  params: PairParams
  angle: number
}): BallEngine {
  const { sector, params, angle } = input
  const e = ballEngine(sector, params)
  const [ur, ui] = params.u

  for (let i = 0; i < sector.count; i++) {
    if (sector.V[i] !== 0) {
      continue
    }

    const b1 = betaOf(ur, ui, angle)
    const b2 = betaOf(ur, -ui, -angle)

    e.beta1[2 * i] = b1[0]
    e.beta1[2 * i + 1] = b1[1]
    e.beta2[2 * i] = b2[0]
    e.beta2[2 * i + 1] = b2[1]
  }

  return e
}

// ---- the knit-literal placement, a control ----

// THE CONTROL CF: the fear beat placed where the knit places it, on every pair that shares a dock, whatever its modes, as
// a phase e^(i angle) on the whole relative-origin block before each beat (reversed in beat 2), then the rule's own
// beat. It is not a sector piece, so it should release weight from the flats, as E-SPN-0175's dock contact does
export function dockPhaseCycle(input: {
  t: Torus
  rule: SeaRule
  bases: SectorBases
  pair: Pair
  spare: Pair
  angle: number
}): void {
  const { t, rule, bases, pair, spare, angle } = input
  const phase = (s: Pair, a: number): void => {
    const o = t.origin * FULL
    const c = Math.cos(a)
    const sn = Math.sin(a)

    for (let k = o; k < o + FULL; k++) {
      const xr = s.re[k]!
      const xi = s.im[k]!

      s.re[k] = c * xr - sn * xi
      s.im[k] = c * xi + sn * xr
    }
  }

  phase(pair, angle)

  const mid = seaBeat(t, rule, bases, pair, 1, spare)

  phase(mid, -angle)
  seaBeat(t, rule, bases, mid, 2, pair)
}

// ---- the links: Sigma(648) on the role ----

export type SigmaReading = {
  // |Sigma(648)|, the distinct phase-point permutations its elements make, and how many elements make the identity one
  order: number
  permutations: number
  kernel: number
  // every permutation is an affine map of determinant 1 (ASL(2, 3)), and the set equals the knit's 216 grid moves,
  // read with the grid point x + 3 y as the phase point (a, b) = (x, y)
  affine: boolean
  sameAsGrid: boolean
  // the largest entry of [g (x) conj(g), V] and [g (x) g, U] over the group (0 for covariance), and the largest entry of
  // [g (x) g, V] (the singlet is not invariant with both roles in 3: the teeth)
  singletConjugate: number
  swapSame: number
  singletSame: number
}

const kron3 = (a: Matrix3, b: Matrix3): { re: Float64Array; im: Float64Array } => {
  const re = new Float64Array(81)
  const im = new Float64Array(81)

  for (let i1 = 0; i1 < 3; i1++) {
    for (let j1 = 0; j1 < 3; j1++) {
      for (let i2 = 0; i2 < 3; i2++) {
        for (let j2 = 0; j2 < 3; j2++) {
          const ar = a[2 * (3 * i1 + j1)]!
          const ai = a[2 * (3 * i1 + j1) + 1]!
          const br = b[2 * (3 * i2 + j2)]!
          const bi = b[2 * (3 * i2 + j2) + 1]!
          const k = (3 * i1 + i2) * 9 + 3 * j1 + j2

          re[k] = ar * br - ai * bi
          im[k] = ar * bi + ai * br
        }
      }
    }
  }

  return { re, im }
}

const conjugate3 = (a: Matrix3): Matrix3 => a.map((x, k) => (k % 2 === 1 ? -x : x))

// the kernels as 9 x 9 operators: V = 1 + (w - 1) Phi Phi^dag, U = P_sym + w P_anti
export function kernelOperators(theta: number): {
  V: { re: Float64Array; im: Float64Array }
  U: { re: Float64Array; im: Float64Array }
} {
  const zr = Math.cos(theta) - 1
  const zi = Math.sin(theta)
  const V = { re: new Float64Array(81), im: new Float64Array(81) }
  const U = { re: new Float64Array(81), im: new Float64Array(81) }

  for (let i = 0; i < 9; i++) {
    V.re[i * 9 + i] = 1
  }

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      V.re[4 * a * 9 + 4 * b]! += zr / 3
      V.im[4 * a * 9 + 4 * b]! += zi / 3
    }
  }

  // P_sym = (1 + S) / 2, P_anti = (1 - S) / 2, S the swap; U = (1 + w) / 2 + (1 - w) / 2 S
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const k = 3 * i + j
      const s = 3 * j + i

      U.re[k * 9 + k]! += (2 + zr) / 2
      U.im[k * 9 + k]! += zi / 2
      U.re[k * 9 + s]! += -zr / 2
      U.im[k * 9 + s]! += -zi / 2
    }
  }

  return { V, U }
}

function commutatorMax(
  a: { re: Float64Array; im: Float64Array },
  b: { re: Float64Array; im: Float64Array },
): number {
  let worst = 0

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 9; k++) {
        re +=
          a.re[i * 9 + k]! * b.re[k * 9 + j]! -
          a.im[i * 9 + k]! * b.im[k * 9 + j]! -
          (b.re[i * 9 + k]! * a.re[k * 9 + j]! - b.im[i * 9 + k]! * a.im[k * 9 + j]!)
        im +=
          a.re[i * 9 + k]! * b.im[k * 9 + j]! +
          a.im[i * 9 + k]! * b.re[k * 9 + j]! -
          (b.re[i * 9 + k]! * a.im[k * 9 + j]! + b.im[i * 9 + k]! * a.re[k * 9 + j]!)
      }

      worst = Math.max(worst, Math.hypot(re, im))
    }
  }

  return worst
}

export function sigmaReading(theta: number): SigmaReading {
  const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators })
  const perms = new Map<string, number>()

  let affine = true
  let kernel = 0

  for (const g of group.matrices) {
    const map = phaseSpaceAction({ unitary: g })

    if (!map) {
      affine = false
      continue
    }

    const a = affineOf({ map })

    if (!a || (a.matrix[0] * a.matrix[3] - a.matrix[1] * a.matrix[2] - 1) % 3 !== 0) {
      affine = false
    }

    const key = map.join('')

    perms.set(key, (perms.get(key) ?? 0) + 1)
  }

  kernel = perms.get('012345678') ?? 0

  // the knit's grid moves, point x + 3 y read as phase point 3 x + y
  const moves = gridMoves()
  const grid = new Set<string>()

  for (const table of moves.act) {
    const map: number[] = []

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const image = table[a + 3 * b]!

        map.push(3 * (image % 3) + Math.floor(image / 3))
      }
    }

    grid.add(map.join(''))
  }

  const sameAsGrid =
    grid.size === perms.size && [...perms.keys()].every(k => grid.has(k))
  const { V, U } = kernelOperators(theta)

  let singletConjugate = 0
  let swapSame = 0
  let singletSame = 0

  for (const g of group.matrices) {
    const gg = kron3(g, g)
    const gc = kron3(g, conjugate3(g))

    singletConjugate = Math.max(singletConjugate, commutatorMax(gc, V))
    swapSame = Math.max(swapSame, commutatorMax(gg, U))
    singletSame = Math.max(singletSame, commutatorMax(gg, V))
  }

  return {
    order: group.order,
    permutations: perms.size,
    kernel,
    affine,
    sameAsGrid,
    singletConjugate,
    swapSame,
    singletSame,
  }
}

// ---- the 8 grid points and the 8 register parts ----

// the number of the 8 nonzero grid points the central move x -> -x fixes (its trace on them): an intertwiner between
// the grid's 8 and the register's 8 would need this to equal the trace of -1 on the register, which is -8 under left
// or right multiplication and +8 under the lattice's minors
export function centralGridTrace(): number {
  const moves = gridMoves()
  // the move with table p -> -p
  const target = Array.from({ length: 9 }, (_, p) => {
    const x = p % 3
    const y = Math.floor(p / 3)

    return ((3 - x) % 3) + 3 * ((3 - y) % 3)
  }).join('')
  const table = moves.act.find(t => Array.from(t).join('') === target)

  if (!table) {
    return NaN
  }

  let fixed = 0

  for (let p = 1; p < 9; p++) {
    fixed += table[p] === p ? 1 : 0
  }

  return fixed
}

// how many orbits the grid moves have on ordered pairs of distinct points (1: two-transitive, so the 9 points split
// as 1 + 8 with the 8 irreducible)
export function gridPairOrbits(): number {
  const moves = gridMoves()
  const seen = new Uint8Array(81)

  let orbits = 0

  for (let p = 0; p < 9; p++) {
    for (let q = 0; q < 9; q++) {
      if (p === q || seen[p * 9 + q]) {
        continue
      }

      orbits++

      for (const t of moves.act) {
        seen[t[p]! * 9 + t[q]!] = 1
      }
    }
  }

  return orbits
}
