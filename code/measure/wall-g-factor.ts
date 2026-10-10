// g OF THE LIGHT WALL PAIR BY LINEAR RESPONSE AT k = 0 (E-SPN-0197, moving-matter item 0009 as rewritten by decision
// 002). The pair is the wall-A and wall-B in-gap levels of E-FRC-0267's chiral slab (code/measure/anomaly-matching-walls
// chiralSlab), joined by the inter-wall leak delta into one massive Dirac member on the 3+1d wall. Its moment is read
// from the cycle alone, with no flux quantum and no real-space plane:
//
//   slabOps          the slab's full-space cycle U(K) = S P2 S P1 on L x 96 modes (wilson-register's slabStream and the
//                    class pieces), its analytic K-derivatives (S(K) is a permutation with Bloch phases e^(-i K . disp),
//                    so dS / dK_j = S D_j, D_j = diag(-i disp_j) on the source modes), the reduced spectrum (slabReduced
//                    and unitaryEigen, lifted to full vectors; U is the identity on the rest, the flat states) and the
//                    untwisted quarter turn of the (0, 1) plane (slot permutation with LEFT multiplication by the spin
//                    lift s, register-symmetry's L(s))
//   denseOps         the same for a small dense unitary U(K) given as a function, K-derivatives by the five-point
//                    stencil (matching-table's coordinate cycle is NOT one: its (a, b) frame is not orthonormal, so the
//                    cycle is not unitary there and its eigenvectors are not the reader's)
//   readMember       the degenerate-band reader on V = -U = e^(-i H), H = i log(-U) the cycle's effective Hamiltonian:
//                      E''  from second-order perturbation of V's eigenvalue (normal V, orthonormal eigenvectors):
//                           lambda(k) = lambda + k^2 W, W = <a|V''|b> / 2 + sum_(n not D) V'_an V'_nb / (lambda - lambda_n),
//                           E'' = 2 i W / lambda, M2 = 1 / E''
//                      mu   the Zeeman matrix of the level (Xiao, Chang and Niu, the degenerate-band orbital moment),
//                           mu_ab = (i q / 2) sum_(n not D) [H0_an H1_nb - H1_an H0_nb] / (E_n - eps), with
//                           H'_nm = V'_nm (E_n - E_m) / (lambda_n - lambda_m) (the divided difference of e^(-i E))
//                      J_z  from the quarter turn R on the level: R = e^(-i (pi/2) J_z), so J_z = -(2 / pi) arg R's
//                           eigenvalues; on a register-only state it is (i / 2) L(e01), matching-table's spinZ / 2
//                      g    = 2 M2 c, c the least-squares ratio of mu to J_z (mu = c J_z + residual)
//                    The flat states sit at V = -1, where log has its cut: their term is returned for E_flat = +pi and
//                    -pi separately, and the read uses their mean (the principal value); the spread is reported as the
//                    branch sensitivity. Reader 'sin' takes (i / 2)(V - V^dag) = sin H instead (no cut)
//   scalarWalk       the control: a unitary with the member's M1 and E'' whose hop is the scalar c(K) = (s_0 + i s_1) / 2
//                    from structureVector, not Clifford
//
// DETERMINISM: no random numbers. Floats as measurement; derivatives of the slab analytic.

import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import {
  ODD,
  partnerProjector48,
  rangeBasis,
  scaled,
  singletProjector24,
  structureVector,
} from '@/code/measure/spinor-register'
import {
  sectorBasis,
  sectorBlock,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import {
  slabApply,
  slabReduced,
  slabStream,
  unitaryEigen,
  wilsonSchedule,
  type CVec,
  type Dense,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import {
  bladeElement,
  evenElement,
  leftMultiplication,
  multiply,
  spinLift,
} from '@/code/measure/register-symmetry'
import type { ChiralSlab } from '@/code/measure/anomaly-matching-walls'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'

const HALF_MODES = 96
const HALF_REG = 4
const SLOTS = 24
const REG = 8

// ---- complex vectors ----

const newVec = (N: number): CVec => ({
  re: new Float64Array(N),
  im: new Float64Array(N),
})

// <a|b>
export const inner = (a: CVec, b: CVec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

const axpy = (y: CVec, a: [number, number], x: CVec): void => {
  for (let k = 0; k < y.re.length; k++) {
    y.re[k]! += a[0] * x.re[k]! - a[1] * x.im[k]!
    y.im[k]! += a[0] * x.im[k]! + a[1] * x.re[k]!
  }
}

const add = (a: CVec, b: CVec, s = 1): CVec => {
  const out = newVec(a.re.length)

  for (let k = 0; k < a.re.length; k++) {
    out.re[k] = a.re[k]! + s * b.re[k]!
    out.im[k] = a.im[k]! + s * b.im[k]!
  }

  return out
}

const scale = (a: CVec, s: number): CVec => ({
  re: a.re.map(x => x * s),
  im: a.im.map(x => x * s),
})

const norm = (a: CVec): number => Math.sqrt(inner(a, a)[0])

type C = [number, number]
const cm = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cdiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1]

  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cj = (a: C): C => [a[0], -a[1]]

// ---- the operators a reader needs ----

export type CycleOps = {
  N: number
  // the non-flat eigenvectors of U(0) (full vectors) and their eigenphases
  vecs: CVec[]
  phases: number[]
  // whether U(0) is the identity on the complement of vecs (the flat states)
  flat: boolean
  U: (v: CVec) => CVec
  dU: (j: number, v: CVec) => CVec
  dUdag: (j: number, v: CVec) => CVec
  d2U: (j: number, v: CVec) => CVec
  rotate: (v: CVec) => CVec
}

// ---- the quarter turn of the (0, 1) plane ----

// g e_0 = e_1, g e_1 = -e_0 (columns are images), the turn matching-table's spinZ lifts
export const QUARTER: readonly (readonly number[])[] = [
  [0, -1, 0, 0],
  [1, 0, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
]

export function slotTurn(): Int32Array {
  const key = (r: readonly number[]): string => r.join(',')
  const index = new Map(DOCK_ROOTS.map((r, d) => [key(r), d]))

  return Int32Array.from(DOCK_ROOTS, r => {
    const gr = [0, 1, 2, 3].map(j =>
      [0, 1, 2, 3].reduce((s, i) => s + QUARTER[j]![i]! * r[i]!, 0),
    )
    const d = index.get(key(gr))

    if (d === undefined) {
      throw new Error('the quarter turn left the roots')
    }

    return d
  })
}

// L(s) on the even register, and the same left multiplication on the odd register
export function turnRegister(): { even: number[][]; odd: number[][]; s: number[] } {
  const { s } = spinLift(QUARTER)
  const even = leftMultiplication(s)
  const S = evenElement(s)
  const odd = Array.from({ length: REG }, () => Array<number>(REG).fill(0))

  for (let c = 0; c < REG; c++) {
    const y = multiply(S, bladeElement(ODD[c]!))

    for (let r = 0; r < REG; r++) {
      odd[r]![c] = y[REG + r]!
    }
  }

  return { even, odd, s }
}

// a register matrix cut to one sector half: basis rows half * 4 .. half * 4 + 3
export function halfBlock(
  M: readonly (readonly number[])[],
  basis: readonly (readonly number[])[],
  half: 0 | 1,
): number[][] {
  return Array.from({ length: HALF_REG }, (_, x) =>
    Array.from({ length: HALF_REG }, (_, y) => {
      const bx = basis[half * HALF_REG + x]!
      const by = basis[half * HALF_REG + y]!

      let s = 0

      for (let a = 0; a < REG; a++) {
        for (let b = 0; b < REG; b++) {
          s += bx[a]! * M[a]![b]! * by[b]!
        }
      }

      return s
    }),
  )
}

// ---- the slab ----

export type SlabSpec = {
  slab: Slab
  sets: HalfSet[]
  sR: number[][]
  dR: number[][]
  basis: number[][]
  half: 0 | 1
}

export const wallSpec = (cs: ChiralSlab, half: 0 | 1 = 0): SlabSpec => ({
  slab: cs.slab,
  sets: cs.sets[half]!,
  sR: cs.ranges[half]!.sR,
  dR: cs.ranges[half]!.dR,
  basis: cs.basis,
  half,
})

// the bulk register member at mass m (E-SPN-0160's schedule, u = e^(i (pi + 2m))) on one D4 class: no walls, no folding
export function bulkSpec(u: readonly [number, number], half: 0 | 1 = 0): SlabSpec {
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const basis = sectorBasis(volumeRight())
  const trivial = wilsonSchedule(qS, qD, [u[0], u[1]], { wilson: false })
  const rangeOf = (q: Float64Array): number[][] =>
    rangeBasis(
      sectorBlock({ re: q, im: new Float64Array(q.length) }, basis, half).block.re,
      HALF_MODES,
    )

  return {
    slab: { L: 1, qa: 1, p: 0, profile: [0] },
    sets: [{ pieces: halfPieces(trivial, basis, half).pieces }],
    sR: rangeOf(qS),
    dR: rangeOf(qD),
    basis,
    half,
  }
}

export type SlabOpsWitness = {
  // the largest distance of a read displacement from an integer
  dispGap: number
  // max |slabStream(0) - 1| of the phases (no field, no gauge)
  phaseGap: number
}

export function slabOps(spec: SlabSpec): { ops: CycleOps; witness: SlabOpsWitness; leak: number } {
  const { slab: s, sets } = spec
  const roots = DOCK_ROOTS
  const nc = s.qa * s.L
  const N = nc * HALF_MODES
  const st = slabStream(s, [0, 0, 0, 0], roots)
  let phaseGap = 0

  for (let i = 0; i < N; i++) {
    phaseGap = Math.max(phaseGap, Math.hypot(st.re[i]! - 1, st.im[i]!))
  }

  // disp_j of every source mode, read from the stream's phase at K = t e_j (phase = -t disp_j)
  const t = 0.5
  let dispGap = 0
  const disp = [0, 1].map(j => {
    const K = [0, 0, 0, 0]

    K[j] = t

    const sj = slabStream(s, K, roots)

    return Float64Array.from({ length: N }, (_, i) => {
      const x = -Math.atan2(sj.im[i]!, sj.re[i]!) / t
      const r = Math.round(x)

      dispGap = Math.max(dispGap, Math.abs(x - r))

      return r
    })
  })
  const S = (v: CVec): CVec => {
    const out = newVec(N)

    for (let i = 0; i < N; i++) {
      out.re[st.to[i]!] = v.re[i]!
      out.im[st.to[i]!] = v.im[i]!
    }

    return out
  }
  const Sdag = (v: CVec): CVec => {
    const out = newVec(N)

    for (let i = 0; i < N; i++) {
      out.re[i] = v.re[st.to[i]!]!
      out.im[i] = v.im[st.to[i]!]!
    }

    return out
  }
  // D_j^p v, D_j = diag(-i disp_j)
  const Dj = (j: number, v: CVec, p = 1): CVec => {
    const out = newVec(N)
    const d = disp[j]!

    for (let i = 0; i < N; i++) {
      const x = d[i]!

      if (p === 1) {
        out.re[i] = x * v.im[i]!
        out.im[i] = -x * v.re[i]!
      } else {
        out.re[i] = -x * x * v.re[i]!
        out.im[i] = -x * x * v.im[i]!
      }
    }

    return out
  }
  const P = (beat: number, v: CVec, dag: boolean): CVec => {
    const out = newVec(N)
    const m = HALF_MODES

    for (let a = 0; a < s.qa; a++) {
      for (let c = 0; c < s.L; c++) {
        const M: CMatrix = sets[s.profile[c]!]!.pieces[beat]!
        const off = (a * s.L + c) * m

        for (let i = 0; i < m; i++) {
          let yr = 0
          let yi = 0

          for (let j = 0; j < m; j++) {
            const pr = dag ? M.re[j * m + i]! : M.re[i * m + j]!
            const pi = dag ? -M.im[j * m + i]! : M.im[i * m + j]!

            if (pr === 0 && pi === 0) {
              continue
            }

            yr += pr * v.re[off + j]! - pi * v.im[off + j]!
            yi += pr * v.im[off + j]! + pi * v.re[off + j]!
          }

          out.re[off + i] = yr
          out.im[off + i] = yi
        }
      }
    }

    return out
  }
  const U = (v: CVec): CVec => S(P(1, S(P(0, v, false)), false))
  const dU = (j: number, v: CVec): CVec =>
    add(S(Dj(j, P(1, S(P(0, v, false)), false))), S(P(1, S(Dj(j, P(0, v, false))), false)))
  // (S D P1 S P0)^dag = P0^dag S^dag P1^dag D^dag S^dag, D^dag = -D
  const dUdag = (j: number, v: CVec): CVec =>
    scale(
      add(P(0, Sdag(P(1, Dj(j, Sdag(v)), true)), true), P(0, Dj(j, Sdag(P(1, Sdag(v), true))), true)),
      -1,
    )
  const d2U = (j: number, v: CVec): CVec => {
    const p0 = P(0, v, false)
    const a = S(Dj(j, P(1, S(p0), false), 2))
    const b = scale(S(Dj(j, P(1, S(Dj(j, p0)), false))), 2)
    const c = S(P(1, S(Dj(j, p0, 2)), false))

    return add(add(a, b), c)
  }

  // the quarter turn: slot d -> turn[d], register L(s) on the half
  const turn = slotTurn()
  const Ls = halfBlock(turnRegister().even, spec.basis, spec.half)
  const rotate = (v: CVec): CVec => {
    const out = newVec(N)

    for (let cls = 0; cls < nc; cls++) {
      for (let d = 0; d < SLOTS; d++) {
        const from = cls * HALF_MODES + d * HALF_REG
        const to = cls * HALF_MODES + turn[d]! * HALF_REG

        for (let x = 0; x < HALF_REG; x++) {
          let r = 0
          let i = 0

          for (let y = 0; y < HALF_REG; y++) {
            r += Ls[x]![y]! * v.re[from + y]!
            i += Ls[x]![y]! * v.im[from + y]!
          }

          out.re[to + x] = r
          out.im[to + x] = i
        }
      }
    }

    return out
  }

  const red = slabReduced(s, sets, [0, 0, 0, 0], roots, spec.sR, spec.dR)
  const e = unitaryEigen(red.U, red.d)
  const vecs = Array.from({ length: red.d }, (_, k) => {
    const x = newVec(N)

    for (let j = 0; j < red.d; j++) {
      axpy(x, [e.vre[j * red.d + k]!, e.vim[j * red.d + k]!], red.basis[j]!)
    }

    return x
  })

  return {
    ops: { N, vecs, phases: e.phases, flat: true, U, dU, dUdag, d2U, rotate },
    witness: { dispGap, phaseGap },
    leak: red.leak,
  }
}

// the slab's own (U(K + h) - U(K - h)) v / 2h through wilson-register's slabApply, for the analytic derivative's witness
export function slabCentral(spec: SlabSpec, j: number, h: number, v: CVec): CVec {
  const at = (x: number): CVec => {
    const K = [0, 0, 0, 0]

    K[j] = x

    return slabApply(spec.slab, spec.sets, slabStream(spec.slab, K, DOCK_ROOTS), v)
  }

  return scale(add(at(h), at(-h), -1), 1 / (2 * h))
}

// the in-gap eigenphases of the slab at tangent momentum K (reduced, for the M2 witness)
export function slabPhases(spec: SlabSpec, K: readonly number[]): number[] {
  const red = slabReduced(spec.slab, spec.sets, K, DOCK_ROOTS, spec.sR, spec.dR)

  return unitaryEigen(red.U, red.d).phases
}

// ---- a small dense cycle ----

export type DenseCycle = (K: readonly number[]) => Dense

export function denseOps(
  cycle: DenseCycle,
  n: number,
  rotate: (v: CVec) => CVec,
  h = 1e-3,
): CycleOps {
  const U0 = cycle([0, 0, 0, 0])
  const e = unitaryEigen(U0, n)
  const vecs = Array.from({ length: n }, (_, k) => ({
    re: Float64Array.from({ length: n }, (_, j) => e.vre[j * n + k]!),
    im: Float64Array.from({ length: n }, (_, j) => e.vim[j * n + k]!),
  }))
  const at = (j: number, x: number): Dense => {
    const K = [0, 0, 0, 0]

    K[j] = x

    return cycle(K)
  }
  const stencil = [0, 1].map(j => {
    const m2 = at(j, -2 * h)
    const m1 = at(j, -h)
    const p1 = at(j, h)
    const p2 = at(j, 2 * h)
    const first: Dense = { re: new Float64Array(n * n), im: new Float64Array(n * n) }
    const second: Dense = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

    for (let i = 0; i < n * n; i++) {
      first.re[i] = (m2.re[i]! - 8 * m1.re[i]! + 8 * p1.re[i]! - p2.re[i]!) / (12 * h)
      first.im[i] = (m2.im[i]! - 8 * m1.im[i]! + 8 * p1.im[i]! - p2.im[i]!) / (12 * h)
      second.re[i] =
        (-m2.re[i]! + 16 * m1.re[i]! - 30 * U0.re[i]! + 16 * p1.re[i]! - p2.re[i]!) / (12 * h * h)
      second.im[i] =
        (-m2.im[i]! + 16 * m1.im[i]! - 30 * U0.im[i]! + 16 * p1.im[i]! - p2.im[i]!) / (12 * h * h)
    }

    return { first, second }
  })
  const apply = (M: Dense, v: CVec, dag: boolean): CVec => {
    const out = newVec(n)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const mr = dag ? M.re[j * n + i]! : M.re[i * n + j]!
        const mi = dag ? -M.im[j * n + i]! : M.im[i * n + j]!

        out.re[i]! += mr * v.re[j]! - mi * v.im[j]!
        out.im[i]! += mr * v.im[j]! + mi * v.re[j]!
      }
    }

    return out
  }

  return {
    N: n,
    vecs,
    phases: e.phases,
    flat: false,
    U: v => apply(U0, v, false),
    dU: (j, v) => apply(stencil[j]!.first, v, false),
    dUdag: (j, v) => apply(stencil[j]!.first, v, true),
    d2U: (j, v) => apply(stencil[j]!.second, v, false),
    rotate,
  }
}

// THE CONTROL WALK. A scalar hop with the member's band to second order: U = -(sqrt(1 - s^2) - i S), S = [[sin M, kappa
// c], [kappa conj c, -sin M]] (x) 1 on (a, b) (x) the even register, c = (s_0 + i s_1) / 2 the scalar hop, s^2 = sin^2 M +
// kappa^2 |c|^2, so U is unitary with levels +-E, sin E = s. kappa^2 = 4 cos^2(M / 2) cos M gives the member's M1 = M and
// E'' (cos E = cos M - 2 cos^2(M / 2) g^2 with |c| = g on the (0, 1) plane). M = 2m per cycle
export function scalarWalk(m: number): DenseCycle {
  const M = 2 * m
  const kappa = 2 * Math.cos(M / 2) * Math.sqrt(Math.cos(M))
  const n = 2 * REG

  return K => {
    const s = structureVector(K)
    const cr = (kappa * s[0]!) / 2
    const ci = (kappa * s[1]!) / 2
    const sm = Math.sin(M)
    const root = Math.sqrt(1 - sm * sm - cr * cr - ci * ci)
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)

    for (let x = 0; x < REG; x++) {
      const a = x
      const b = REG + x

      // -(root - i S): diagonal -(root -+ i sin M), off-diagonal i S_ab
      re[a * n + a] = -root
      im[a * n + a] = sm
      re[b * n + b] = -root
      im[b * n + b] = -sm
      // i (cr + i ci) = -ci + i cr at [a][b]; i (cr - i ci) = ci + i cr at [b][a]
      re[a * n + b] = -ci
      im[a * n + b] = cr
      re[b * n + a] = ci
      im[b * n + a] = cr
    }

    return { re, im }
  }
}

// the quarter turn on the control's (a, b): L(s) of the even register on both
export function pairTurn(): (v: CVec) => CVec {
  const t = turnRegister()
  const A = t.even
  const B = t.even

  return v => {
    const out = newVec(2 * REG)

    for (let x = 0; x < REG; x++) {
      for (let y = 0; y < REG; y++) {
        out.re[x]! += A[x]![y]! * v.re[y]!
        out.im[x]! += A[x]![y]! * v.im[y]!
        out.re[REG + x]! += B[x]![y]! * v.re[REG + y]!
        out.im[REG + x]! += B[x]![y]! * v.im[REG + y]!
      }
    }

    return out
  }
}

// ---- the reader ----

// E = -wrap(phase - pi): V = -U = e^(-i E)
export const levelOf = (phase: number): number => -wrap(phase - Math.PI)

export type MemberRead = {
  // the level (mean E over D), its states and their spread
  eps: number
  states: number
  spread: number
  // E'' along axes 0 and 1 (mean eigenvalue), its anisotropy and non-Hermitian part, and the first-order term in D
  curvature: [number, number]
  M2: number
  firstOrder: number
  antiHermitian: number
  // the moment-over-J ratio c (mu = c J_z), for E_flat = +pi, -pi and their mean, and the fit's residual
  cPlus: number
  cMinus: number
  c: number
  fitResidual: number
  // mu's spin-blind part per state over the Zeeman amplitude |c| / 2, and the residual once it is removed (over |c|)
  scalar: number
  rest: number
  // the imaginary part of c (0 for a Hermitian mu)
  cImag: number
  // J_z eigenvalues on D and the turn's invariance residual on D
  jz: number[]
  turnResidual: number
  // the flat states' share of mu: |c_+ - c_-| / |c|
  branch: number
  g: number
  gPlus: number
  gMinus: number
}

// which Hermitian function of V the reader treats as the Hamiltonian: 'log' is the brief's H = i log V (levels E),
// 'sin' is (i / 2)(V - V^dag) = sin H (levels sin E: no cut, the flat states at 0)
export type Reader = 'log' | 'sin'

// D = the states whose level lies within tol of `target`
export function readMember(
  ops: CycleOps,
  target: number,
  tol = 1e-7,
  kind: Reader = 'log',
): MemberRead {
  const E0 = ops.phases.map(levelOf)
  const F = (x: number): number => (kind === 'log' ? x : Math.sin(x))
  const lam: C[] = ops.phases.map(p => [-Math.cos(p), -Math.sin(p)])
  const D = E0.map((x, k) => ({ x, k })).filter(z => Math.abs(z.x - target) < tol).map(z => z.k)
  const E = E0.map(F)
  const nD = D.length
  const inD = new Set(D)
  const eps0 = D.reduce((s, k) => s + E0[k]!, 0) / nD
  const eps = D.reduce((s, k) => s + E[k]!, 0) / nD
  const spread = Math.max(...D.map(k => E0[k]!)) - Math.min(...D.map(k => E0[k]!))
  const lamD: C = [Math.cos(eps0), -Math.sin(eps0)]
  const nV = ops.vecs.length
  // dV = -dU
  const y = [0, 1].map(j => D.map(b => scale(ops.dU(j, ops.vecs[b]!), -1)))
  const z = [0, 1].map(j => D.map(a => scale(ops.dUdag(j, ops.vecs[a]!), -1)))
  const w = [0, 1].map(j => D.map(b => scale(ops.d2U(j, ops.vecs[b]!), -1)))
  // cy[j][b][n] = <n| y_jb>, cz[j][a][n] = <n| z_ja>
  const cy = y.map(row => row.map(v => ops.vecs.map(n => inner(n, v))))
  const cz = z.map(row => row.map(v => ops.vecs.map(n => inner(n, v))))
  // <z_ia| Q y_jb>, Q the projector on the flat states
  const flatPair = (i: number, a: number, j: number, b: number): C => {
    if (!ops.flat) {
      return [0, 0]
    }

    const full = inner(z[i]![a]!, y[j]![b]!)

    let r = full[0]
    let m = full[1]

    for (let n = 0; n < nV; n++) {
      const p = cm(cj(cz[i]![a]![n]!), cy[j]![b]![n]!)

      r -= p[0]
      m -= p[1]
    }

    return [r, m]
  }

  // ---- E'' ----
  let firstOrder = 0
  let antiHermitian = 0
  const curvature: [number, number] = [0, 0]

  for (const j of [0, 1]) {
    const Epp: C[][] = []

    for (let a = 0; a < nD; a++) {
      Epp.push([])

      for (let b = 0; b < nD; b++) {
        const v1 = cj(cz[j]![a]![D[b]!]!)

        firstOrder = Math.max(firstOrder, Math.hypot(v1[0], v1[1]))

        const half = inner(ops.vecs[D[a]!]!, w[j]![b]!)
        let W: C = [half[0] / 2, half[1] / 2]

        for (let n = 0; n < nV; n++) {
          if (inD.has(n)) {
            continue
          }

          const t = cdiv(cm(cj(cz[j]![a]![n]!), cy[j]![b]![n]!), [lamD[0] - lam[n]![0], lamD[1] - lam[n]![1]])

          W = [W[0] + t[0], W[1] + t[1]]
        }

        const f = cdiv(flatPair(j, a, j, b), [lamD[0] + 1, lamD[1]])

        W = [W[0] + f[0], W[1] + f[1]]

        // E'' = 2 i W / lambda
        const q = cdiv(cm([0, 2], W), lamD)

        Epp[a]!.push(q)
      }
    }

    let tr = 0

    for (let a = 0; a < nD; a++) {
      tr += Epp[a]![a]![0]

      for (let b = 0; b < nD; b++) {
        antiHermitian = Math.max(
          antiHermitian,
          Math.hypot(Epp[a]![b]![0] - Epp[b]![a]![0], Epp[a]![b]![1] + Epp[b]![a]![1]) / 2,
        )
      }
    }

    curvature[j] = tr / nD
  }

  // E'' of the level; the 'sin' reader's level sin E has (sin E)'' = cos E E'' at the band edge
  const M2 = 2 / (curvature[0] + curvature[1]) / (kind === 'log' ? 1 : Math.cos(eps0))

  // ---- mu ----
  const h = (i: number, a: number, n: number): C =>
    // H'_an = V'_an (E_a - E_n) / (lambda_a - lambda_n), V'_an = conj <n| z_ia>
    cm(cj(cz[i]![a]![n]!), cdiv([E[D[a]!]! - E[n]!, 0], [lam[D[a]!]![0] - lam[n]![0], lam[D[a]!]![1] - lam[n]![1]]))
  const hk = (j: number, b: number, n: number): C =>
    cm(cy[j]![b]![n]!, cdiv([E[n]! - E[D[b]!]!, 0], [lam[n]![0] - lam[D[b]!]![0], lam[n]![1] - lam[D[b]!]![1]]))
  const muOf = (sign: number): C[][] => {
    const Ef = kind === 'log' ? sign * Math.PI : 0
    const mu: C[][] = []

    for (let a = 0; a < nD; a++) {
      mu.push([])

      for (let b = 0; b < nD; b++) {
        let s: C = [0, 0]

        for (let n = 0; n < nV; n++) {
          if (inD.has(n)) {
            continue
          }

          const x = cm(h(0, a, n), hk(1, b, n))
          const yv = cm(h(1, a, n), hk(0, b, n))

          s = [s[0] + (x[0] - yv[0]) / (E[n]! - eps), s[1] + (x[1] - yv[1]) / (E[n]! - eps)]
        }

        if (ops.flat) {
          const Ea = E[D[a]!]!
          const Eb = E[D[b]!]!
          const la = lam[D[a]!]!
          const lb = lam[D[b]!]!
          const fa = cdiv([Ea - Ef, 0], [la[0] + 1, la[1]])
          const fb = cdiv([Ef - Eb, 0], [-1 - lb[0], -lb[1]])
          const p01 = flatPair(0, a, 1, b)
          const p10 = flatPair(1, a, 0, b)
          const f = cm(cm(fa, fb), [p01[0] - p10[0], p01[1] - p10[1]])

          s = [s[0] + f[0] / (Ef - eps), s[1] + f[1] / (Ef - eps)]
        }

        // mu = (i / 2) s, q = 1
        mu[a]!.push([-s[1] / 2, s[0] / 2])
      }
    }

    return mu
  }

  // ---- J_z from the quarter turn ----
  const R: Dense = { re: new Float64Array(nD * nD), im: new Float64Array(nD * nD) }
  let turnResidual = 0

  for (let b = 0; b < nD; b++) {
    const rb = ops.rotate(ops.vecs[D[b]!]!)
    const res = { re: Float64Array.from(rb.re), im: Float64Array.from(rb.im) }

    for (let a = 0; a < nD; a++) {
      const p = inner(ops.vecs[D[a]!]!, rb)

      R.re[a * nD + b] = p[0]
      R.im[a * nD + b] = p[1]
      axpy(res, [-p[0], -p[1]], ops.vecs[D[a]!]!)
    }

    turnResidual = Math.max(turnResidual, norm(res))
  }

  const re = unitaryEigen(R, nD)
  const jz = re.phases.map(p => (-2 * p) / Math.PI)
  const J: C[][] = Array.from({ length: nD }, (_, a) =>
    Array.from({ length: nD }, (_, b) => {
      let r = 0
      let i = 0

      for (let k = 0; k < nD; k++) {
        const va: C = [re.vre[a * nD + k]!, re.vim[a * nD + k]!]
        const vb: C = [re.vre[b * nD + k]!, -re.vim[b * nD + k]!]
        const p = cm(va, vb)

        r += jz[k]! * p[0]
        i += jz[k]! * p[1]
      }

      return [r, i] as C
    }),
  )
  const fit = (
    mu: C[][],
  ): { c: number; cImag: number; residual: number; scalar: number; rest: number } => {
    // c = Tr(mu J) / Tr(J J)
    let nr = 0
    let ni = 0
    let dd = 0

    for (let a = 0; a < nD; a++) {
      for (let b = 0; b < nD; b++) {
        const p = cm(mu[a]![b]!, J[b]![a]!)

        nr += p[0]
        ni += p[1]
        dd += cm(J[a]![b]!, J[b]![a]!)[0]
      }
    }

    const c = nr / dd
    // the spin-blind part: mu's trace per state (J_z is traceless on a doublet set)
    const s0 = mu.reduce((s, row, a) => s + row[a]![0], 0) / nD
    let residual = 0
    let rest = 0

    for (let a = 0; a < nD; a++) {
      for (let b = 0; b < nD; b++) {
        const dr = mu[a]![b]![0] - c * J[a]![b]![0]
        const di = mu[a]![b]![1] - c * J[a]![b]![1]

        residual = Math.max(residual, Math.hypot(dr, di))
        rest = Math.max(rest, Math.hypot(dr - (a === b ? s0 : 0), di))
      }
    }

    return {
      c,
      cImag: ni / dd,
      residual: residual / Math.abs(c),
      scalar: s0 / (Math.abs(c) / 2),
      rest: rest / Math.abs(c),
    }
  }
  const muP = muOf(1)
  const muM = muOf(-1)
  const muMean = muP.map((row, a) =>
    row.map((x, b) => [(x[0] + muM[a]![b]![0]) / 2, (x[1] + muM[a]![b]![1]) / 2] as C),
  )
  const fP = fit(muP)
  const fM = fit(muM)
  const f0 = fit(muMean)

  return {
    eps: eps0,
    states: nD,
    spread,
    curvature,
    M2,
    firstOrder,
    antiHermitian,
    cPlus: fP.c,
    cMinus: fM.c,
    c: f0.c,
    fitResidual: f0.residual,
    scalar: f0.scalar,
    rest: f0.rest,
    cImag: f0.cImag,
    jz: [...jz].sort((a, b) => a - b),
    turnResidual,
    branch: Math.abs(fP.c - fM.c) / Math.abs(f0.c),
    g: 2 * M2 * f0.c,
    gPlus: 2 * M2 * fP.c,
    gMinus: 2 * M2 * fM.c,
  }
}

// ---- the wall pair ----

export type PairLevels = {
  // in-gap levels (|E| < window), the pair's upper and lower level, delta and Lambda
  inGap: number[]
  upper: number
  lower: number
  delta: number
  Lambda: number
}

export function pairLevels(ops: CycleOps, window = 0.1): PairLevels {
  const E = ops.phases.map(levelOf)
  const inGap = E.filter(x => Math.abs(x) < window).sort((a, b) => a - b)
  const up = inGap.filter(x => x > 0)
  const lo = inGap.filter(x => x <= 0)
  const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length
  const upper = mean(up)
  const lower = mean(lo)
  const bulk = E.filter(x => Math.abs(x) >= window)
  const Lambda = Math.min(...bulk.map(x => Math.abs(x - upper)), ...bulk.map(x => Math.abs(x - lower)))

  return { inGap, upper, lower, delta: (upper - lower) / 2, Lambda }
}

// U(0) commutes with the turn: max over D-like vectors of |R U v - U R v|
export function turnCommutator(ops: CycleOps, vs: readonly CVec[]): number {
  return Math.max(...vs.map(v => norm(add(ops.rotate(ops.U(v)), ops.U(ops.rotate(v)), -1))))
}

export { norm as vecNorm, add as vecAdd }

// ==== THE LANDAU READER (decision 007) ====
//
// g is a property of the walk's quasienergies in a uniform field with exact Peierls phases on every hop, so it is read
// from the zero Landau level, never from U(k). The slab (or one bulk class) sits in F01 = B = 2 pi p / qa in the tangent
// (0, 1) plane: wilson-register's slabStream magnetic cell (qa classes along x0, Landau gauge A1 = B x0, its own phases),
// with the class pieces applied exactly as slabApply does. The eigen read is iterative on the full stream:
//
//   fieldOps      V = -U, V^dag, X = (V + V^dag) / 2 = cos H and Y = (i / 2)(V - V^dag) = sin H on the full stream, the
//                 pieces held as their nonzero entries (the same numbers slabApply multiplies)
//   topLevels     Chebyshev-filtered subspace iteration on X (its top is the zero level, the flat states sit at X = -1),
//                 Rayleigh-Ritz each pass, then V resolved on the converged span by the Hermitian pencil Y + gamma X
//                 (V is normal, so X and Y share eigenvectors): E = atan2(<Y>, <X>), the residual |V y - e^(-iE) y|
//                 returned and gated
//   landauStart   the deterministic start: B = 0 vectors on one x0 class times a Gaussian (and its first Hermite partner)
//                 of width sqrt(qa / 2 pi p) about each of the p orbit centres, then fixed trigonometric fillers so a
//                 valley the B = 0 vectors miss is still in the block
//   spinOf        <Sigma> = <i L(b)> on the register, L(s) = (1 + L(b)) / sqrt 2 the spinor lift of the quarter turn of
//                 the (0, 1) plane: labels E(0, -) against E(1, +) in the spin pair

type Sparse = { row: Int32Array; col: Int32Array; re: Float64Array; im: Float64Array }

const sparseCache = new WeakMap<CMatrix, Sparse>()

function sparseOf(M: CMatrix): Sparse {
  const hit = sparseCache.get(M)

  if (hit) {
    return hit
  }

  const m = HALF_MODES
  const row: number[] = []
  const col: number[] = []
  const re: number[] = []
  const im: number[] = []

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      const r = M.re[i * m + j]!
      const x = M.im[i * m + j]!

      if (r !== 0 || x !== 0) {
        row.push(i)
        col.push(j)
        re.push(r)
        im.push(x)
      }
    }
  }

  const out = {
    row: Int32Array.from(row),
    col: Int32Array.from(col),
    re: Float64Array.from(re),
    im: Float64Array.from(im),
  }

  sparseCache.set(M, out)

  return out
}

export type FieldOps = {
  N: number
  slab: Slab
  V: (v: CVec) => CVec
  Vdag: (v: CVec) => CVec
  X: (v: CVec) => CVec
  Y: (v: CVec) => CVec
}

export function fieldOps(slab: Slab, sets: readonly HalfSet[], K: readonly number[]): FieldOps {
  const st = slabStream(slab, K, DOCK_ROOTS)
  const nc = slab.qa * slab.L
  const N = nc * HALF_MODES
  const S = (v: CVec): CVec => {
    const out = newVec(N)

    for (let i = 0; i < N; i++) {
      const j = st.to[i]!
      const cr = st.re[i]!
      const ci = st.im[i]!

      out.re[j] = cr * v.re[i]! - ci * v.im[i]!
      out.im[j] = cr * v.im[i]! + ci * v.re[i]!
    }

    return out
  }
  const Sdag = (v: CVec): CVec => {
    const out = newVec(N)

    for (let i = 0; i < N; i++) {
      const j = st.to[i]!
      const cr = st.re[i]!
      const ci = -st.im[i]!

      out.re[i] = cr * v.re[j]! - ci * v.im[j]!
      out.im[i] = cr * v.im[j]! + ci * v.re[j]!
    }

    return out
  }
  const sparse = [0, 1].map(beat => sets.map(set => sparseOf(set.pieces[beat]!)))
  // the adjoint's entries: row and column swapped, imaginary part negated
  const sparseDag = sparse.map(row =>
    row.map(sp => ({ row: sp.col, col: sp.row, re: sp.re, im: sp.im.map(x => -x) })),
  )
  const P = (beat: number, v: CVec, dag: boolean): CVec => {
    const out = newVec(N)
    const ore = out.re
    const oim = out.im
    const vre = v.re
    const vim = v.im
    const table = dag ? sparseDag[beat]! : sparse[beat]!

    for (let a = 0; a < slab.qa; a++) {
      for (let c = 0; c < slab.L; c++) {
        const sp = table[slab.profile[c]!]!
        const off = (a * slab.L + c) * HALF_MODES
        const rows = sp.row
        const cols = sp.col
        const pre = sp.re
        const pim = sp.im
        const n = rows.length

        for (let k = 0; k < n; k++) {
          const i = off + rows[k]!
          const j = off + cols[k]!
          const pr = pre[k]!
          const pi = pim[k]!
          const xr = vre[j]!
          const xi = vim[j]!

          ore[i]! += pr * xr - pi * xi
          oim[i]! += pr * xi + pi * xr
        }
      }
    }

    return out
  }
  // U = S P1 S P0, V = -U; U^dag = P0^dag S^dag P1^dag S^dag
  const V = (v: CVec): CVec => scale(S(P(1, S(P(0, v, false)), false)), -1)
  const Vdag = (v: CVec): CVec => scale(P(0, Sdag(P(1, Sdag(v), true)), true), -1)
  const X = (v: CVec): CVec => {
    const a = V(v)
    const b = Vdag(v)

    for (let i = 0; i < N; i++) {
      a.re[i] = (a.re[i]! + b.re[i]!) / 2
      a.im[i] = (a.im[i]! + b.im[i]!) / 2
    }

    return a
  }
  // (i / 2)(a - b): re = -(a.im - b.im) / 2, im = (a.re - b.re) / 2
  const Y = (v: CVec): CVec => {
    const a = V(v)
    const b = Vdag(v)
    const out = newVec(N)

    for (let i = 0; i < N; i++) {
      out.re[i] = -(a.im[i]! - b.im[i]!) / 2
      out.im[i] = (a.re[i]! - b.re[i]!) / 2
    }

    return out
  }

  return { N, slab, V, Vdag, X, Y }
}

// modified Gram-Schmidt, twice; columns below `drop` of their norm are dropped
function orthonormal(vs: readonly CVec[], drop = 1e-10): CVec[] {
  const out: CVec[] = []

  for (const g of vs) {
    const v = { re: Float64Array.from(g.re), im: Float64Array.from(g.im) }
    const n0 = norm(v)

    for (let pass = 0; pass < 2; pass++) {
      for (const b of out) {
        const p = inner(b, v)

        axpy(v, [-p[0], -p[1]], b)
      }
    }

    const n = norm(v)

    if (n0 === 0 || n < drop * n0) {
      continue
    }

    out.push(scale(v, 1 / n))
  }

  return out
}

// the Hermitian matrix <a_i| b_j> as a ComplexMatrix, symmetrized
function gram(as: readonly CVec[], bs: readonly CVec[]): ReturnType<typeof makeComplexMatrix> {
  const n = as.length
  const G = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const p = inner(as[i]!, bs[j]!)

      G.re[i * n + j] = p[0]
      G.im[i * n + j] = p[1]
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const r = (G.re[i * n + j]! + G.re[j * n + i]!) / 2
      const x = (G.im[i * n + j]! - G.im[j * n + i]!) / 2

      G.re[i * n + j] = r
      G.im[i * n + j] = x
      G.re[j * n + i] = r
      G.im[j * n + i] = -x
    }
  }

  return G
}

// cyclic complex Jacobi on a small Hermitian matrix, to full double precision (the pencil's near-degenerate clusters,
// split by 1e-11, need it: a tolerance-1e-10 solver leaves V residuals of 1e-9). Returns ascending values and the
// eigenvectors as columns [a * n + k]
export function jacobiHermitian(
  M: { re: Float64Array; im: Float64Array },
  n: number,
): { values: number[]; vre: Float64Array; vim: Float64Array } {
  const ar = Float64Array.from(M.re)
  const ai = Float64Array.from(M.im)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)

  for (let k = 0; k < n; k++) {
    vr[k * n + k] = 1
  }

  const scaleOf = Math.sqrt(ar.reduce((s, x, k) => s + x * x + ai[k]! * ai[k]!, 0)) || 1

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += ar[p * n + q]! ** 2 + ai[p * n + q]! ** 2
      }
    }

    if (Math.sqrt(off) <= 1e-17 * scaleOf) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const br = ar[p * n + q]!
        const bi = ai[p * n + q]!
        const mag = Math.hypot(br, bi)

        if (mag === 0) {
          continue
        }

        // e^(i phi) = b / |b|; G = D R, D = diag(1, e^(-i phi)), R the real rotation of [[a, mag], [mag, d]]
        const er = br / mag
        const ei = bi / mag
        const a = ar[p * n + p]!
        const d = ar[q * n + q]!
        const tau = (d - a) / (2 * mag)
        const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c
        // G_pp = c, G_pq = s, G_qp = -s e^(-i phi), G_qq = c e^(-i phi)
        const gpp: C = [c, 0]
        const gpq: C = [s, 0]
        const gqp: C = [-s * er, s * ei]
        const gqq: C = [c * er, -c * ei]

        // columns: A <- A G, V <- V G
        for (const [xr, xi] of [
          [ar, ai],
          [vr, vi],
        ] as const) {
          for (let k = 0; k < n; k++) {
            const xp: C = [xr[k * n + p]!, xi[k * n + p]!]
            const xq: C = [xr[k * n + q]!, xi[k * n + q]!]
            const np = [cm(xp, gpp)[0] + cm(xq, gqp)[0], cm(xp, gpp)[1] + cm(xq, gqp)[1]]
            const nq = [cm(xp, gpq)[0] + cm(xq, gqq)[0], cm(xp, gpq)[1] + cm(xq, gqq)[1]]

            xr[k * n + p] = np[0]!
            xi[k * n + p] = np[1]!
            xr[k * n + q] = nq[0]!
            xi[k * n + q] = nq[1]!
          }
        }

        // rows: A <- G^dag A
        for (let k = 0; k < n; k++) {
          const xp: C = [ar[p * n + k]!, ai[p * n + k]!]
          const xq: C = [ar[q * n + k]!, ai[q * n + k]!]
          const np = [cm(cj(gpp), xp)[0] + cm(cj(gqp), xq)[0], cm(cj(gpp), xp)[1] + cm(cj(gqp), xq)[1]]
          const nq = [cm(cj(gpq), xp)[0] + cm(cj(gqq), xq)[0], cm(cj(gpq), xp)[1] + cm(cj(gqq), xq)[1]]

          ar[p * n + k] = np[0]!
          ai[p * n + k] = np[1]!
          ar[q * n + k] = nq[0]!
          ai[q * n + k] = nq[1]!
        }

        ar[p * n + q] = 0
        ai[p * n + q] = 0
        ar[q * n + p] = 0
        ai[q * n + p] = 0
        ai[p * n + p] = 0
        ai[q * n + q] = 0
      }
    }
  }

  const order = Array.from({ length: n }, (_, k) => k).sort((x, y) => ar[x * n + x]! - ar[y * n + y]!)
  const ore = new Float64Array(n * n)
  const oim = new Float64Array(n * n)

  order.forEach((k, kk) => {
    for (let a = 0; a < n; a++) {
      ore[a * n + kk] = vr[a * n + k]!
      oim[a * n + kk] = vi[a * n + k]!
    }
  })

  return { values: order.map(k => ar[k * n + k]!), vre: ore, vim: oim }
}

// the columns sum_a vs[a] c[a][k]
function rotateBasis(vs: readonly CVec[], vre: Float64Array, vim: Float64Array, n: number): CVec[] {
  const N = vs[0]!.re.length

  return Array.from({ length: n }, (_, k) => {
    const x = newVec(N)

    for (let a = 0; a < n; a++) {
      axpy(x, [vre[a * n + k]!, vim[a * n + k]!], vs[a]!)
    }

    return x
  })
}

export type TopLevels = {
  // the converged states, by descending X: E (V = e^(-iE)), their X Ritz values, vectors
  E: number[]
  X: number[]
  vecs: CVec[]
  // |V y - e^(-iE) y| per resolved state
  residuals: number[]
  // max |X y - theta y| over the wanted states, and max |V y - e^(-iE) y| over them after the V resolution
  xResidual: number
  vResidual: number
  passes: number
  applies: number
  // the lowest Ritz value of the block (the filter's upper damping edge)
  floor: number
}

// tol on the first `want` states; V is resolved on the first `resolve` (default want); the rest of the block is buffer
export type TopOptions = {
  tol?: number
  vTol?: number
  maxPass?: number
  cap?: number
  maxDegree?: number
  resolve?: number
}

// GAMMA: the pencil Y + gamma X separates states of equal sin E and different cos E (deterministic, irrational)
const GAMMA = 0.3819660112501051

export function topLevels(
  ops: FieldOps,
  start: readonly CVec[],
  want: number,
  opts: TopOptions = {},
): TopLevels {
  const tol = opts.tol ?? 3e-12
  const vTol = opts.vTol ?? 2e-11
  const maxPass = opts.maxPass ?? 60
  const cap = opts.cap ?? 1e8
  const maxDegree = opts.maxDegree ?? 120
  let Y = orthonormal(start)
  let applies = 0
  let passes = 0
  let theta: number[] = []
  let XY: CVec[] = []
  let xResidual = Infinity

  const rr = (): void => {
    XY = Y.map(v => ops.X(v))
    applies += Y.length

    const e = eigHermitian({ matrix: gram(Y, XY) })
    const n = Y.length
    // descending
    const order = Array.from({ length: n }, (_, k) => n - 1 - k)
    const vre = new Float64Array(n * n)
    const vim = new Float64Array(n * n)

    order.forEach((k, kk) => {
      for (let a = 0; a < n; a++) {
        vre[a * n + kk] = e.vectorsRe[a * n + k]!
        vim[a * n + kk] = e.vectorsIm[a * n + k]!
      }
    })
    Y = rotateBasis(Y, vre, vim, n)
    XY = rotateBasis(XY, vre, vim, n)
    theta = order.map(k => e.values[k]!)
  }

  // V resolved on the first `resolve` states: the pencil Y + gamma X diagonalized in the span by full-precision Jacobi,
  // each state's E = atan2(<Y>, <X>) and |V z - e^(-iE) z|, sorted by descending X
  const resolveV = (): Omit<TopLevels, 'xResidual' | 'passes' | 'applies' | 'floor'> => {
    const n = Math.min(Math.max(opts.resolve ?? want, want), Y.length)
    const Yk = Y.slice(0, n)
    const XYk = XY.slice(0, n)
    const YYk = Yk.map(v => ops.Y(v))

    applies += n

    const PY = YYk.map((v, k) => add(v, scale(XYk[k]!, GAMMA)))
    const e = jacobiHermitian(gram(Yk, PY), n)
    const Z = rotateBasis(Yk, e.vre, e.vim, n)
    const E: number[] = []
    const Xs: number[] = []
    const res: number[] = []

    for (const z of Z) {
      const vz = ops.V(z)
      const sinE = inner(z, ops.Y(z))[0]
      const cosE = inner(z, ops.X(z))[0]
      const level = Math.atan2(sinE, cosE)
      const r = add(vz, { re: z.re.map(() => 0), im: z.im.map(() => 0) })

      // V z - e^(-i E) z
      axpy(r, [-Math.cos(level), Math.sin(level)], z)
      res.push(norm(r))
      E.push(level)
      Xs.push(cosE)
      applies += 3
    }

    const order = E.map((_, k) => k).sort((p, q) => Xs[q]! - Xs[p]!)

    return {
      E: order.map(k => E[k]!),
      X: order.map(k => Xs[k]!),
      vecs: order.map(k => Z[k]!),
      residuals: order.map(k => res[k]!),
      vResidual: Math.max(...order.slice(0, want).map(k => res[k]!)),
    }
  }

  // STOP: once X's residual is below `tol` the span is resolved and V's residual read; the run stops when V's residual
  // is below vTol, or when a further pass no longer halves X's residual (the floor of double precision at this N), or
  // at maxPass. A tighter X alone cannot be asked for: its floor grows with N (about 1e-14 at N 9,216)
  let resolved: ReturnType<typeof resolveV> | undefined
  let previous = Infinity

  for (;;) {
    rr()
    passes++
    xResidual = 0

    for (let k = 0; k < Math.min(want, Y.length); k++) {
      xResidual = Math.max(xResidual, norm(add(XY[k]!, scale(Y[k]!, theta[k]!), -1)))
    }

    if (xResidual <= tol) {
      resolved = resolveV()

      if (resolved.vResidual <= vTol || xResidual > previous / 2) {
        break
      }
    }

    if (passes >= maxPass) {
      break
    }

    previous = xResidual

    // Chebyshev filter on [-1, a], a the block's lowest Ritz value; degree so the top grows at most `cap` a pass
    const a = Math.max(theta[theta.length - 1]!, -0.5)
    const c = (a - 1) / 2
    const h = (a + 1) / 2
    const t1 = (theta[0]! - c) / h
    const degree = Math.max(
      4,
      Math.min(maxDegree, Math.ceil(Math.log(2 * cap) / Math.acosh(Math.max(t1, 1 + 1e-12)))),
    )
    const step = (v: CVec): CVec => {
      applies++

      return scale(add(ops.X(v), scale(v, c), -1), 1 / h)
    }

    Y = Y.map(y0 => {
      let prev = y0
      let cur = step(y0)

      for (let k = 1; k < degree; k++) {
        const next = add(scale(step(cur), 2), prev, -1)

        prev = cur
        cur = next
      }

      return cur
    })
    Y = orthonormal(Y)
  }

  const out = resolved ?? resolveV()

  return {
    ...out,
    xResidual,
    passes,
    applies,
    floor: theta[theta.length - 1]!,
  }
}

// the deterministic start on the magnetic cell (slab.qa, slab.p) from B = 0 vectors on one x0 class (length L * 96)
export function landauStart(
  slab: Slab,
  base: readonly CVec[],
  hermite: number,
  fill: number,
): CVec[] {
  const N = slab.qa * slab.L * HALF_MODES
  const ell = Math.sqrt(slab.qa / (2 * Math.PI * Math.max(slab.p, 1)))
  const centres = Array.from({ length: Math.max(slab.p, 1) }, (_, j) => (j * slab.qa) / Math.max(slab.p, 1))
  const out: CVec[] = []

  for (const x0 of centres) {
    for (let order = 0; order <= hermite; order++) {
      for (const b of base) {
        const v = newVec(N)

        for (let a = 0; a < slab.qa; a++) {
          let d = (((a - x0) % slab.qa) + slab.qa) % slab.qa

          if (d > slab.qa / 2) {
            d -= slab.qa
          }

          const u = d / ell
          const w = Math.exp((-u * u) / 2) * (order === 0 ? 1 : order === 1 ? 2 * u : 4 * u * u - 2)

          for (let k = 0; k < slab.L * HALF_MODES; k++) {
            v.re[a * slab.L * HALF_MODES + k] = w * b.re[k]!
            v.im[a * slab.L * HALF_MODES + k] = w * b.im[k]!
          }
        }

        out.push(v)
      }
    }
  }

  for (let j = 0; j < fill; j++) {
    const v = newVec(N)

    for (let i = 0; i < N; i++) {
      v.re[i] = Math.cos(0.6180339887498949 * (i + 1) * (j + 1) + 0.5 * j)
      v.im[i] = Math.sin(0.4142135623730951 * (i + 1) * (j + 2) + 0.25 * j)
    }

    out.push(v)
  }

  return out
}

// <Sigma> = <i L(b)> per class and slot on the register half, L(b) = sqrt 2 L(s) - 1
export function spinOf(spec: SlabSpec, slab: Slab, v: CVec): number {
  const Ls = halfBlock(turnRegister().even, spec.basis, spec.half)
  const nc = slab.qa * slab.L
  const Lb = Ls.map((row, x) => row.map((y, z) => Math.SQRT2 * y - (x === z ? 1 : 0)))
  let s = 0
  let w = 0

  for (let cls = 0; cls < nc; cls++) {
    for (let d = 0; d < SLOTS; d++) {
      const off = cls * HALF_MODES + d * HALF_REG

      for (let x = 0; x < HALF_REG; x++) {
        // (i Lb v)_x = i sum_y Lb[x][y] v_y; <v| i Lb v> real part
        let yr = 0
        let yi = 0

        for (let y = 0; y < HALF_REG; y++) {
          yr += -Lb[x]![y]! * v.im[off + y]!
          yi += Lb[x]![y]! * v.re[off + y]!
        }

        s += v.re[off + x]! * yr + v.im[off + x]! * yi
        w += v.re[off + x]! ** 2 + v.im[off + x]! ** 2
      }
    }
  }

  return s / w
}

// the weight of v on the depth classes in `depths` (every x0 class)
export function depthShare(slab: Slab, v: CVec, depths: ReadonlySet<number>): number {
  let on = 0
  let all = 0

  for (let a = 0; a < slab.qa; a++) {
    for (let c = 0; c < slab.L; c++) {
      const off = (a * slab.L + c) * HALF_MODES
      let x = 0

      for (let i = 0; i < HALF_MODES; i++) {
        x += v.re[off + i]! ** 2 + v.im[off + i]! ** 2
      }

      all += x

      if (depths.has(c)) {
        on += x
      }
    }
  }

  return on / all
}

// ---- the zero-level read at one field and one K2 ----

export type ZeroRead = {
  B: number
  K2: number
  // the zero-level pair: the least positive and the greatest negative level (among states with wall weight >= minWall),
  // the states within `same` of each, and eps0 = half the gap between them
  upper: number
  lower: number
  upperStates: number
  lowerStates: number
  eps0: number
  // the next positive cluster above the zero level (the first Landau rung): its least level, states and spread
  E1: number
  E1States: number
  E1Spread: number
  // the wall weight of the least-weighted zero-level state (1 with no depth set)
  wallWeight: number
  // CONTINUITY (with labels): the zero-level states' mean weight on the B = 0 +delta and -delta sets (dressed by the
  // start's Gaussian), [upper on +, upper on -, lower on +, lower on -], and the signed half gap: (E(+delta's level) -
  // E(-delta's level)) / 2, negative once the pair has crossed; equal to eps0 with no labels
  labelWeights: number[]
  signed: number
  xResidual: number
  vResidual: number
  passes: number
  applies: number
  levels: number[]
}

export type ZeroOptions = TopOptions & {
  // the Bloch momentum along x1 (the guiding centre), 0 by default
  K1?: number
  depths?: ReadonlySet<number>
  minWall?: number
  same?: number
  // orthonormal sets standing for the B = 0 +delta and -delta levels in the field cell
  labels?: readonly [readonly CVec[], readonly CVec[]]
}

// the weight of v on an orthonormal set
const setWeight = (set: readonly CVec[], v: CVec): number =>
  set.reduce((s, b) => {
    const p = inner(b, v)

    return s + p[0] * p[0] + p[1] * p[1]
  }, 0)

// the label sets: the B = 0 vectors of positive and of negative level, each dressed by the order-0 Gaussian of the cell
// and orthonormalized
export function labelSets(
  slab: Slab,
  base: readonly CVec[],
  levels: readonly number[],
): [CVec[], CVec[]] {
  const dress = (vs: CVec[]): CVec[] => orthonormal(landauStart(slab, vs, 0, 0))

  return [
    dress(base.filter((_, k) => levels[k]! > 0)),
    dress(base.filter((_, k) => levels[k]! <= 0)),
  ]
}

export function zeroLevel(
  slab: Slab,
  sets: readonly HalfSet[],
  K2: number,
  start: readonly CVec[],
  want: number,
  opts: ZeroOptions = {},
): { read: ZeroRead; vecs: CVec[] } {
  const ops = fieldOps(slab, sets, [0, opts.K1 ?? 0, K2, 0])
  const t = topLevels(ops, start, want, opts)
  const same = opts.same ?? 1e-8
  const minWall = opts.minWall ?? 0.9
  const weight = t.vecs.map(v => (opts.depths ? depthShare(slab, v, opts.depths) : 1))
  // only the converged states take part
  const idx = t.E.map((_, k) => k).filter(k => k < want && weight[k]! >= minWall)
  const pos = idx.filter(k => t.E[k]! > 0)
  const neg = idx.filter(k => t.E[k]! <= 0)
  const upper = Math.min(...pos.map(k => t.E[k]!))
  const lower = Math.max(...neg.map(k => t.E[k]!))
  const zero = idx.filter(k => Math.abs(t.E[k]! - upper) <= same || Math.abs(t.E[k]! - lower) <= same)
  // the first rung: resolved positive states above the zero level, clustered by `same` relative to the rung's gap
  const above = t.E.map((E, k) => ({ E, k }))
    .filter(x => x.E > upper + 1e-6 && x.k < t.residuals.length)
    .sort((a, b) => a.E - b.E)
  const E1 = above.length > 0 ? above[0]!.E : Number.NaN
  const rung = above.filter(x => x.E - E1 <= 1e-6)
  const ups = pos.filter(k => Math.abs(t.E[k]! - upper) <= same)
  const downs = neg.filter(k => Math.abs(t.E[k]! - lower) <= same)
  const mean = (ks: number[], set: readonly CVec[]): number =>
    ks.reduce((s, k) => s + setWeight(set, t.vecs[k]!), 0) / ks.length
  const labelWeights = opts.labels
    ? [mean(ups, opts.labels[0]), mean(ups, opts.labels[1]), mean(downs, opts.labels[0]), mean(downs, opts.labels[1])]
    : []
  // crossed: the upper level carries the -delta character and the lower the +delta
  const crossed =
    labelWeights.length === 4 && labelWeights[1]! > labelWeights[0]! && labelWeights[2]! > labelWeights[3]!

  return {
    read: {
      B: (2 * Math.PI * slab.p) / slab.qa,
      K2,
      upper,
      lower,
      upperStates: pos.filter(k => Math.abs(t.E[k]! - upper) <= same).length,
      lowerStates: neg.filter(k => Math.abs(t.E[k]! - lower) <= same).length,
      eps0: (upper - lower) / 2,
      E1,
      E1States: rung.length,
      E1Spread: rung.length > 0 ? Math.max(...rung.map(x => x.E)) - E1 : Number.NaN,
      wallWeight: Math.min(...zero.map(k => weight[k]!)),
      labelWeights,
      signed: crossed ? -(upper - lower) / 2 : (upper - lower) / 2,
      xResidual: t.xResidual,
      vResidual: t.vResidual,
      passes: t.passes,
      applies: t.applies,
      levels: t.E,
    },
    vecs: t.vecs,
  }
}

// eps0 minimized over K2: K2 = 0 and +-h; symmetric to 1e-12 takes K2 = 0, else the parabola's least value
export function minimizeK2(e: { minus: number; zero: number; plus: number }, h: number): {
  eps0: number
  symmetric: boolean
  at: number
} {
  if (Math.abs(e.plus - e.minus) <= 1e-12) {
    return { eps0: e.zero, symmetric: true, at: 0 }
  }

  const b = (e.plus - e.minus) / (2 * h)
  const c = (e.plus + e.minus - 2 * e.zero) / (2 * h * h)

  return { eps0: e.zero - (b * b) / (4 * c), symmetric: false, at: -b / (2 * c) }
}

// one field: the read at K2 = 0 from the deterministic start, then at K2 = +-h warm-started from its converged states
export type FieldRead = {
  qa: number
  p: number
  B: number
  zero: ZeroRead
  minus: ZeroRead
  plus: ZeroRead
  eps0: number
  symmetric: boolean
  at: number
  seconds: number
}

export function fieldRead(
  slab: Slab,
  sets: readonly HalfSet[],
  base: readonly CVec[],
  want: number,
  opts: ZeroOptions & { fill?: number; h?: number } = {},
): FieldRead {
  const t0 = Date.now()
  const h = opts.h ?? 1e-3
  const fill = opts.fill ?? 8
  const start = landauStart(slab, base, 1, fill)
  const z = zeroLevel(slab, sets, 0, start, want, opts)
  const warm = [...z.vecs.slice(0, want), ...landauStart(slab, [], 0, fill)]
  const lo = zeroLevel(slab, sets, -h, warm, want, opts)
  const hi = zeroLevel(slab, sets, h, warm, want, opts)
  // the signed half gap (the levels continuous with +-delta), which is eps0 itself until the pair crosses
  const k = minimizeK2({ minus: lo.read.signed, zero: z.read.signed, plus: hi.read.signed }, h)

  return {
    qa: slab.qa,
    p: slab.p,
    B: (2 * Math.PI * slab.p) / slab.qa,
    zero: z.read,
    minus: lo.read,
    plus: hi.read,
    eps0: k.eps0,
    symmetric: k.symmetric,
    at: k.at,
    seconds: (Date.now() - t0) / 1000,
  }
}

// the B -> 0 intercepts of y(B) through three fields: the parabola's, and the line's through the two weakest
export function intercepts(Bs: readonly number[], ys: readonly number[]): { quad: number; lin: number; spread: number } {
  const [x0, x1, x2] = Bs as [number, number, number]
  const [y0, y1, y2] = ys as [number, number, number]
  const l0 = (x1 * x2) / ((x0 - x1) * (x0 - x2))
  const l1 = (x0 * x2) / ((x1 - x0) * (x1 - x2))
  const l2 = (x0 * x1) / ((x2 - x0) * (x2 - x1))
  const quad = y0 * l0 + y1 * l1 + y2 * l2
  // the two weakest: the two largest qa
  const idx = [0, 1, 2].sort((p, q) => Bs[p]! - Bs[q]!)
  const [i, j] = [idx[0]!, idx[1]!]
  const lin = ys[i]! - (Bs[i]! * (ys[j]! - ys[i]!)) / (Bs[j]! - Bs[i]!)

  return { quad, lin, spread: Math.abs(quad - lin) }
}
