// The spin-2 field in the layered bulk (E-GRV-0142's theory and readings): the Fierz-Pauli (linearized
// Einstein-Hilbert) form in D dimensions, its static exchange between conserved sources, its transverse traceless
// block on the layered stack, and the brane-to-brane tensor kernel. Theory only, no rule state. Real numbers live here.
//
// THE FORM. With D_l H_mn the derivatives of a symmetric H and eta = diag(-1, 1, .., 1),
//   L = -(1/2) dH_mn dH^mn + dH^ml d^n H_nl - dH^mn d_n H + (1/2) dH d H   (- (1/2) m^2 (H.H - a (tr H)^2))
// It is transcribed from cubic-slide's fierzPauli, the kernel E-GRV-0141 found to be the unique slide-invariant metric
// kernel, and compared to it exactly (fierzPauliKernelKeys). The mass term with a = 1 is Fierz and Pauli's.
//
// THE EXCHANGE. With the source coupling (1/2) H_mn T^mn, a quadratic form h^T M h in the independent components, and
// J_c = (1/2) sum over the ordered pairs of c of T^mn, the stationary value is W = -(1/4) J^T M^-1 J. The massless
// form is singular along its D gauge directions k_m xi_n + k_n xi_m; a conserved source is orthogonal to every one of
// them (gaugeLeak), so W does not depend on how they are fixed, and they are fixed by adding the de Donder term
// -g (D^m H_mn - (1/2) D_n H)^2 (g = 1 and 2 must agree). WHY NOT A PSEUDO-INVERSE: a massive Fierz-Pauli form at
// m << p has its helicity-0 direction at an eigenvalue of order m^4 / p^2 (the longitudinal gauge mode k k costs
// neither kinetic nor Fierz-Pauli mass energy), which carries the whole vDVZ part of W; a float eigensolver cuts or
// mixes it (E-GRV-0142's first run read 1/2 there). So W is also computed EXACTLY over GF(p) (exactExchange), where
// no direction can be lost. The TENSOR FACTOR of a source T is W(T) / (T.T) over the same for a
// transverse traceless source T' (T'_23 = T'_32 = 1), so it is 1 - (tr T)^2 / ((D - 2) T.T) for the massless form and
// 1 - (tr T)^2 / (3 T.T) for the massive one: for a static T_00 that is 1/2 (D = 4), 2/3 (D = 5, and every massive
// Fierz-Pauli graviton), and their ratio is Garriga and Tanaka's 4/3.
//
// THE TT BLOCK ON THE STACK. In the rescaled perturbation (delta g_mn = a(y)^2 h_mn) the stack's slab j carries
// s_j times the 4d form at momentum k and its vertical link c_j times the 5d form's y-derivative part in axial gauge
// (H_m5 = 0): -(1/2) H'.H' + (1/2) (tr H')^2. On the transverse traceless polarizations the 4d form is -(1/2) k^2 G and
// the y part -(1/2) G, G the Gram matrix of H.H; so the stack's tensor operator is the scalar depth's operator times G,
// and its tower (masses and brane residues) is the scalar's, once per polarization. ttBlock returns the two ratios
// G^-1 A / (-(1/2) k^2) and G^-1 B / (-(1/2)), which that statement says are the identity.
//
// WHAT IS NOT HERE: the background's own terms (the bulk cosmological constant and the brane tension, which cancel on
// TT in the continuum) and the brane's bending (which turns the zero mode's naive five-dimensional 1/3 into 1/2).
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import { solveLinearSystem, makeDense } from '@/code/algebra/linear/dense'
import { dyadicMod, inverseMod, mod, mulMod } from '@/code/algebra/linear/modular-linear'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { hField, kernelKey, LAPSE, SHIFT } from '@/code/measure/cubic-slide'
import { type StackMode } from '@/code/measure/open-husk'
import { type Layering } from '@/code/measure/rs-layering'

export const eta = (mu: number): number => (mu === 0 ? -1 : 1)

export type Tensor = number[][]

export const zeroTensor = (D: number): Tensor => Array.from({ length: D }, () => new Array<number>(D).fill(0))

// the independent components (m <= n) of a symmetric D x D tensor
export function symmetricComponents(D: number): [number, number][] {
  const out: [number, number][] = []

  for (let m = 0; m < D; m++) for (let n = m; n < D; n++) out.push([m, n])

  return out
}

export function tensorOf(D: number, h: readonly number[]): Tensor {
  const H = zeroTensor(D)

  symmetricComponents(D).forEach(([m, n], c) => {
    H[m]![n] = h[c]!
    H[n]![m] = h[c]!
  })

  return H
}

// H.K = H_mn K^mn and tr H = eta^mn H_mn
export const contract = (H: Tensor, K: Tensor): number => H.reduce((t, row, m) => t + row.reduce((u, v, n) => u + eta(m) * eta(n) * v * K[m]![n]!, 0), 0)
export const trace = (H: Tensor): number => H.reduce((t, row, m) => t + eta(m) * row[m]!, 0)

// the Fierz-Pauli Lagrangian from its derivatives dH(l, m, n) = D_l H_mn, in D dimensions
export function fierzPauliForm(D: number, dH: (l: number, m: number, n: number) => number): number {
  let q = 0

  for (let l = 0; l < D; l++) {
    for (let m = 0; m < D; m++) for (let n = 0; n < D; n++) q -= 0.5 * eta(l) * eta(m) * eta(n) * dH(l, m, n) ** 2

    let V = 0
    let T = 0

    for (let m = 0; m < D; m++) {
      V += eta(m) * dH(m, m, l)
      T += eta(m) * dH(l, m, m)
    }
    q += eta(l) * (V * V - V * T + 0.5 * T * T)
  }

  return q
}

// the symmetric matrix M of a quadratic form Q on R^n, Q(x) = x^T M x, by polarization
export function formMatrix(n: number, Q: (x: number[]) => number): number[][] {
  const e = (i: number, j = -1): number[] => Array.from({ length: n }, (_, k) => (k === i || k === j ? 1 : 0))
  const diag = Array.from({ length: n }, (_, i) => Q(e(i)))

  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? diag[i]! : (Q(e(i, j)) - diag[i]! - diag[j]!) / 2)))
}

export type FormSpec = {
  // the squared mass of the Fierz-Pauli-type term -(1/2) m^2 (H.H - a (tr H)^2), 0 for none
  readonly mass2?: number
  // a, 1 for Fierz and Pauli
  readonly traceWeight?: number
  // g of the de Donder term -g (D^m H_mn - (1/2) D_n H)^2, 0 for none
  readonly gauge?: number
}

// the momentum-space form on the independent components: D_l -> k_l
export function fierzPauliMatrix(D: number, k: readonly number[], spec: FormSpec = {}): number[][] {
  const { mass2 = 0, traceWeight = 1, gauge = 0 } = spec
  const n = symmetricComponents(D).length

  return formMatrix(n, h => {
    const H = tensorOf(D, h)
    const kinetic = fierzPauliForm(D, (l, m, r) => k[l]! * H[m]![r]!)
    const tr = trace(H)
    let fixing = 0

    for (let v = 0; v < D; v++) {
      let V = 0

      for (let m = 0; m < D; m++) V += eta(m) * k[m]! * H[m]![v]!
      fixing += eta(v) * (V - 0.5 * k[v]! * tr) ** 2
    }

    return kinetic - 0.5 * mass2 * (contract(H, H) - traceWeight * tr * tr) - gauge * fixing
  })
}

// J_c = (1/2) sum over the ordered pairs of c of T^mn, so the coupling (1/2) H_mn T^mn is sum_c h_c J_c
export const sourceVector = (D: number, T: Tensor): number[] => symmetricComponents(D).map(([m, r]) => (m === r ? 0.5 : 1) * eta(m) * eta(r) * T[m]![r]!)

// the largest |J . h| over the gauge directions h = k xi + xi k, xi each unit vector: 0 for a conserved source
export function gaugeLeak(D: number, k: readonly number[], T: Tensor): number {
  const J = sourceVector(D, T)
  let worst = 0

  for (let a = 0; a < D; a++) {
    const h = symmetricComponents(D).map(([m, r]) => (m === r ? 2 * k[m]! * (m === a ? 1 : 0) : k[m]! * (r === a ? 1 : 0) + k[r]! * (m === a ? 1 : 0)))

    worst = Math.max(worst, Math.abs(h.reduce((t, v, c) => t + v * J[c]!, 0)))
  }

  return worst
}

// W = -(1/4) J^T M^-1 J, in floating point
export function exchange(D: number, M: number[][], T: Tensor): number {
  const J = sourceVector(D, T)
  const x = solveLinearSystem({ matrix: M.map(r => [...r]), rightHandSide: J })

  return -0.25 * x.reduce((t, v, i) => t + v * J[i]!, 0)
}

// W as a residue mod p: every entry of M and J is a dyadic rational (integer momenta and squared masses), read exactly
export function exactExchange(D: number, M: number[][], T: Tensor, p: number): number {
  const J = sourceVector(D, T).map(v => dyadicMod(v, p))
  const x = solveMod(
    M.map(r => r.map(v => dyadicMod(v, p))),
    J,
    p,
  )
  const s = x.reduce((t, v, i) => mod(t + mulMod(v, J[i]!, p), p), 0)

  return mulMod(mod(-s, p), inverseMod(4, p), p)
}

// solve A x = b mod p by Gauss-Jordan with a nonzero pivot searched in each column (throws if A is singular mod p;
// modular-linear's inverseMatrixMod reads a column-permuted echelon form as singular)
export function solveMod(A: readonly (readonly number[])[], b: readonly number[], p: number): number[] {
  const n = b.length
  const m = A.map((row, i) => [...row.map(v => mod(v, p)), mod(b[i]!, p)])

  for (let col = 0; col < n; col++) {
    const pivot = m.findIndex((row, r) => r >= col && row[col] !== 0)

    if (pivot < 0) throw new Error('solveMod: singular mod p')
    ;[m[col], m[pivot]] = [m[pivot]!, m[col]!]

    const scale = inverseMod(m[col]![col]!, p)

    m[col] = m[col]!.map(v => mulMod(v, scale, p))
    for (let r = 0; r < n; r++) {
      const f = m[r]![col]!

      if (r !== col && f !== 0) m[r] = m[r]!.map((v, c) => mod(v - mulMod(f, m[col]![c]!, p), p))
    }
  }

  return m.map(row => row[n]!)
}

// a static unit source T_00 = 1, and the transverse traceless reference T'_23 = T'_32 = 1 (k must have no 2 or 3 part)
export function staticSource(D: number): Tensor {
  const T = zeroTensor(D)

  T[0]![0] = 1

  return T
}

export function referenceSource(D: number): Tensor {
  const T = zeroTensor(D)

  T[2]![3] = 1
  T[3]![2] = 1

  return T
}

export type TensorFactor = { factor: number; reference: number; leak: number }

// the tensor factor of a static source at momentum k: W(T) / T.T over W(T') / T'.T'; `reference` is W(T') / T'.T'
export function tensorFactor(D: number, k: readonly number[], spec: FormSpec = {}): TensorFactor {
  const M = fierzPauliMatrix(D, k, spec)
  const T = staticSource(D)
  const R = referenceSource(D)
  const reference = exchange(D, M, R) / contract(R, R)

  return { factor: exchange(D, M, T) / contract(T, T) / reference, reference, leak: Math.max(gaugeLeak(D, k, T), gaugeLeak(D, k, R)) }
}

export type ExactFactor = { factor: number; staticW: number; referenceW: number }

// the same, as residues mod p (T.T = 1 for the static source, 2 for the reference)
export function exactTensorFactor(D: number, k: readonly number[], spec: FormSpec, p: number): ExactFactor {
  const M = fierzPauliMatrix(D, k, spec)
  const staticW = exactExchange(D, M, staticSource(D), p)
  const referenceW = exactExchange(D, M, referenceSource(D), p)
  const reference = mulMod(referenceW, inverseMod(2, p), p)

  return { factor: mulMod(staticW, inverseMod(reference, p), p), staticW, referenceW }
}

// the rational n / q (q <= maxDenominator) a double is, to `tolerance`, or undefined
export function smallRational(x: number, maxDenominator = 64, tolerance = 1e-9): [number, number] | undefined {
  for (let q = 1; q <= maxDenominator; q++) if (Math.abs(x * q - Math.round(x * q)) <= tolerance * q) return [Math.round(x * q), q]

  return undefined
}

// ---------------------------------------------------------------------------------------------------------
// the exact comparison with E-GRV-0141's kernel

// the 4d form at x^0 = c t, c = 1, on the ADM fields (H_00 = -2 n, H_0i = N_i, H_ij = h_ij) as a real kernel keyed as
// cubic-slide's quadraticKernel keys it: kernelKey(f, g, axis, axis) -> the coefficient of D_axis phi_f D_axis phi_g
export function fierzPauliKernelKeys(): Map<string, number> {
  const fields = LAPSE + 1
  const width = fields * 4
  const loading = (m: number, n: number): [number, number] => {
    if (m === 0 && n === 0) return [LAPSE, -2]
    if (m === 0 || n === 0) return [SHIFT[m + n - 1]!, 1]

    return [hField(m - 1, n - 1), 1]
  }
  const B = formMatrix(width, X =>
    fierzPauliForm(4, (l, m, n) => {
      const [f, s] = loading(m, n)

      return s * X[f * 4 + l]!
    }),
  )
  const out = new Map<string, number>()

  for (let a = 0; a < width; a++) {
    for (let b = 0; b < width; b++) {
      if (B[a]![b] === 0) continue

      const key = kernelKey(Math.floor(a / 4), Math.floor(b / 4), a % 4, b % 4)

      out.set(key, (out.get(key) ?? 0) + B[a]![b]!)
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the transverse traceless block

const invert = (A: number[][]): number[][] => {
  const n = A.length
  const cols = Array.from({ length: n }, (_, j) => solveLinearSystem({ matrix: A, rightHandSide: Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)) }))

  return Array.from({ length: n }, (_, i) => cols.map(c => c[i]!))
}

const times = (A: number[][], B: number[][]): number[][] => A.map(row => B[0]!.map((_, j) => row.reduce((t, v, k) => t + v * B[k]![j]!, 0)))
const sandwich = (E: number[][], M: number[][]): number[][] => times(times(E[0]!.map((_, j) => E.map(r => r[j]!)), M), E)
export const offIdentity = (A: number[][], scale = 1): number => Math.max(...A.flatMap((row, i) => row.map((v, j) => Math.abs(v / scale - (i === j ? 1 : 0)))))

// an orthonormal basis (columns, in the 4d components) of the transverse traceless tensors at 4-momentum k
export function ttBasis(k: readonly number[]): number[][] {
  const comps = symmetricComponents(4)
  const n = comps.length
  const rows: number[][] = []

  // row r: eta^mm k_m H_mr, H_ms = H_sm read from the component (m, s)
  for (let r = 0; r < 4; r++) rows.push(comps.map(([m, s]) => (s === r ? eta(m) * k[m]! : 0) + (m === r && m !== s ? eta(s) * k[s]! : 0)))
  rows.push(comps.map(([m, s]) => (m === s ? eta(m) : 0)))

  const gram = makeDense({ rows: n, cols: n })

  for (const row of rows) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) gram.data[i * n + j] = gram.data[i * n + j]! + row[i]! * row[j]!

  const eig = eigSymmetric({ matrix: gram })
  const top = Math.max(...Array.from(eig.values, Math.abs))
  const keep: number[] = []

  for (let j = 0; j < n; j++) if (Math.abs(eig.values[j]!) <= 1e-12 * top) keep.push(j)

  return Array.from({ length: n }, (_, i) => keep.map(j => eig.vectors[i * n + j]!))
}

export type TTBlock = { k2: number; polarizations: number; lateral: number[][]; vertical: number[][]; gram: number[][]; lateralOff: number; verticalOff: number }

// the stack's tensor operator on the TT polarizations at 4-momentum k: lateral A = E^T M4(k) E, vertical B = the 5d
// form's y part (k = e_5) on the 4d components, G = E^T (H.H) E; the ratios G^-1 A / (-(1/2) k^2) and G^-1 B / (-(1/2))
export function ttBlock(k: readonly number[]): TTBlock {
  const E = ttBasis(k)
  const comps4 = symmetricComponents(4)
  const comps5 = symmetricComponents(5)
  const M4 = fierzPauliMatrix(4, k)
  const M5 = fierzPauliMatrix(5, [0, 0, 0, 0, 1])
  const index5 = comps4.map(([m, n]) => comps5.findIndex(([a, b]) => a === m && b === n))
  const My = index5.map(i => index5.map(j => M5[i]![j]!))
  const Gm = formMatrix(comps4.length, h => {
    const H = tensorOf(4, h)

    return contract(H, H)
  })
  const k2 = k.reduce((t, v, l) => t + eta(l) * v * v, 0)
  const lateral = sandwich(E, M4)
  const vertical = sandwich(E, My)
  const gram = sandwich(E, Gm)
  const gInv = invert(gram)

  return {
    k2,
    polarizations: E[0]!.length,
    lateral,
    vertical,
    gram,
    lateralOff: offIdentity(times(gInv, lateral), -0.5 * k2),
    verticalOff: offIdentity(times(gInv, vertical), -0.5),
  }
}

// the stack's brane kernel on the TT polarizations as a matrix, by the admittance from the bottom (blocks the size of
// the polarization space): with P = -2 A / k^2 (per unit p^2) and V = -2 B, the scalar's p^2 s_j and c_j become
//   Y_n = p^2 s_n P,  Y_j = p^2 s_j P + c_j V (c_j V + Y_(j+1))^-1 Y_(j+1),  K = Y_0^-1.
// If the tensor radial operator is the scalar's times G, K = K_scalar(p) G^-1. The block must be built at a
// spacelike k (a static exchange), where p^2 > 0.
export function tensorBraneKernel(layering: Layering, block: TTBlock, p: number): number[][] {
  const { stiff, conduct } = layering
  const P = block.lateral.map(r => r.map(v => (-2 * v) / block.k2))
  const V = block.vertical.map(r => r.map(v => -2 * v))
  const scaled = (A: number[][], s: number): number[][] => A.map(r => r.map(v => v * s))
  const plus = (A: number[][], B: number[][]): number[][] => A.map((r, i) => r.map((v, j) => v + B[i]![j]!))
  let Y = scaled(P, p * p * stiff[stiff.length - 1]!)

  for (let j = stiff.length - 2; j >= 0; j--) {
    const G = scaled(V, conduct[j]!)

    Y = plus(scaled(P, p * p * stiff[j]!), times(times(G, invert(plus(G, Y))), Y))
  }

  return invert(Y)
}

// max |K G / K_scalar - I| for a tensor kernel K and the scalar's kernel value at the same p
export const kernelOff = (K: number[][], gram: number[][], scalar: number): number => offIdentity(times(K, gram), scalar)

// ---------------------------------------------------------------------------------------------------------
// the tower reweighted: the zero mode (the lightest) kept, every massive mode's weight times `ratio`

export function reweightTower(modes: readonly StackMode[], ratio: number): StackMode[] {
  const lightest = modes.reduce((a, m) => (m.mass < a.mass ? m : a), modes[0]!)

  return modes.map(m => (m === lightest ? m : { mass: m.mass, weight: m.weight * ratio }))
}

export const zeroModeOnly = (modes: readonly StackMode[]): StackMode[] => {
  const lightest = modes.reduce((a, m) => (m.mass < a.mass ? m : a), modes[0]!)

  return [lightest]
}
