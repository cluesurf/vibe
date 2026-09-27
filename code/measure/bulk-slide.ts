// The dock slide in D spacetime dimensions at cubic order, in the continuum, on the covariant metric perturbation
// (E-GRV-0143's theory): every O_h-symmetric local two-derivative action quadratic plus cubic in H_MN, the ones the
// slide leaves unchanged to that order, their quadratic kernel, and the static exchange that kernel gives. D = 4 is
// the husk (a second route to E-GRV-0141, in covariant rather than ADM variables); D = 5 adds the bulk's depth w as a
// fifth coordinate. Theory only: exact ranks over GF(p), no rule state.
//
// THE FIELDS. g_MN = eta_MN + H_MN in the physical coordinates X = (c t, x, y, z, b w), eta = diag(-1, 1, .., 1), with
// D_M = d / dX^M = (1 / s_M) d_M (s = c on time, b on depth, 1 on the husk's space). The components are ordered as
// tensor-stack's symmetricComponents(D). In five dimensions they split, along the depth, into
//   H_mn (m, n < 4)   the husk metric (the 4d graviton's field: E-GRV-0141's h_ij, N_i = H_0i, H_00 = -2n to first order)
//   A_m = H_m4        the graviphoton
//   phi = H_44        the radion
// These are the axial variables: RS's axial gauge sets A = phi = 0. Covariant rather than ADM variables are used
// because the slide acts on them EXACTLY linearly (next paragraph); the two differ by a field redefinition H = F(h, N, n)
// that is quadratic at most, which maps a cubic-order Noether solution onto one, so they span the same family.
//
// THE SLIDE. The Lie derivative of the whole metric, delta g = xi . D g + g D xi + (D xi)^T g, is linear in g, so on
// H it is exact at every order:
//   delta H_MN = eta_NN D_M xi^N + eta_MM D_N xi^M                       (delta0, field independent)
//              + xi^R D_R H_MN + H_RN D_M xi^R + H_MR D_N xi^R            (delta1, linear in H)
// A 5d slide carries xi^4 (the depth component) with the rest. Its delta0 on the depth components is
//   delta A_m = D_m xi^4 + eta_mm D_4 xi^m,   delta phi = 2 D_4 xi^4,
// so at zero depth momentum A shifts like a Maxwell field by D_m xi^4 (the graviphoton's own gauge) and phi is inert
// (a massless scalar, the radion); at depth momentum k_4 != 0 both are pure gauge (xi^m and xi^4 set them to zero).
// Kinds:
//   full              every xi^M(X)
//   husk              xi^4 = 0: the husk's slide only, depending on the depth (the control: only the 4d slide)
//   depth-foliation   xi^4 = f(w): the depth analogue of Horava's foliation-preserving slide (reported only)
// For D = 4 the last axis is z, a husk axis, and only 'full' is meaningful.
//
// THE CONDITIONS (the Noether procedure, as in cubic-slide). With S = S2 + S3:
//   order 1   delta0 S2 = total derivative
//   order 2   delta0 S3 + delta1 S2 = total derivative
// decided exactly by the Euler derivative in xi (code/algebra/jet-space); delta1 S3 is quartic, not tested.
//
// THE ANSATZ. The O_h-invariant sums of dH dH (quadratic) and H dH dH (cubic). O_h acts on the husk's three space
// axes only: t and w are left alone, so neither isotropy between the husk and the depth, nor w -> -w, nor time
// reversal is put in. The depth stiffness (the w-gradient's coefficient) is a free coupling of the ansatz.
//
// THE EXPECTATION, derived before computing. Linearized Einstein-Hilbert in D dimensions (Fierz-Pauli) is the unique
// two-derivative kernel whose linearized gauge symmetry is delta0 (Deser 1970, Wald 1986): the order-1 condition
// alone leaves a larger family (in D = 4, E-GRV-0139's free speed), and the order-2 condition ties it. In D = 5 with the
// depth an ADM "time" of its own, the w-w block on the husk metric is -(1/2) (H'.H' - lambda_5 (tr H')^2) and
// lambda_5 = 1 is forced exactly as lambda is along t. Read from that kernel, a conserved static source T_00 at
// 5-momentum (0, p, 0, 0, m) exchanges W with tensor factor 1 - (tr T)^2 / ((D - 2) T.T) = 2/3 at D = 5 for every m,
// which is the massive 4d Fierz-Pauli graviton's (vDVZ); at m = 0 the same 2/3 is the naive zero mode, its extra 1/6
// over 4d's 1/2 carried by the radion.
//
// WHAT IS NOT HERE. The warp. On AdS the background is a(w)^2 eta: the coefficients of the action depend on w and a
// zero-derivative term (the bulk cosmological constant with the brane tension) enters, which an ansatz of constant
// coefficient two-derivative terms cannot hold. This is the flat-bulk limit: the lattice's local slide, at momenta
// far above the AdS curvature.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import { addScaled, addTerm, monoKey, monomial, multiply, norm, parseMono, substitute, type Poly } from '@/code/algebra/jet-polynomial'
import { jetSpace, type JetSpace } from '@/code/algebra/jet-space'
import { dyadicMod, inverseMod, mod, mulMod } from '@/code/algebra/linear/modular-linear'
import { cubeGroup, kernelKey } from '@/code/measure/cubic-slide'
import { eta, solveMod, sourceVector, symmetricComponents, type Tensor } from '@/code/measure/tensor-stack'

// ---------------------------------------------------------------------------------------------------------
// the frame

export type BulkFrame = {
  readonly D: number
  readonly space: JetSpace
  readonly comps: [number, number][]
  // the number of metric components
  readonly F: number
  // the gauge fields xi^0 .. xi^(D-1)
  readonly xi: number[]
  readonly index: (m: number, n: number) => number
}

export function bulkFrame(D: number): BulkFrame {
  const comps = symmetricComponents(D)
  const F = comps.length
  const index = (m: number, n: number): number => comps.findIndex(([a, b]) => a === Math.min(m, n) && b === Math.max(m, n))

  return { D, space: jetSpace(D), comps, F, xi: Array.from({ length: D }, (_, a) => F + a), index }
}

const unit = (D: number, axis: number): number[] => Array.from({ length: D }, (_, a) => (a === axis ? 1 : 0))

// the depth components of a five-dimensional frame: A_m = H_m4 (m < 4) and phi = H_44
export const depthFields = (frame: BulkFrame): number[] => (frame.D === 5 ? frame.comps.flatMap(([m, n], f) => (n === 4 ? [f] : [])) : [])
export const huskFields = (frame: BulkFrame): number[] => frame.comps.flatMap(([m, n], f) => (m < 4 && n < 4 ? [f] : []))

// ---------------------------------------------------------------------------------------------------------
// the slide

export type BulkKind = 'full' | 'husk' | 'depth-foliation'

export type BulkSpec = { readonly kind: BulkKind; readonly scales: readonly number[]; readonly p: number }

// delta H_MN for every component, as polynomials linear in the xi jets (mod p)
export function bulkSlideAction(frame: BulkFrame, spec: BulkSpec): Poly[] {
  const { D, space, F, xi, index } = frame
  const { p } = spec
  const inv = spec.scales.map(s => inverseMod(s, p))
  const out: Poly[] = Array.from({ length: F }, () => new Map())
  const depthXi = xi[D - 1]!
  const add = (f: number, c: number, jets: number[]): void => {
    if (spec.kind === 'husk' && jets.some(j => space.field(j) === depthXi)) return
    addTerm(out[f]!, monoKey([...jets].sort((a, b) => a - b)), norm(c, p), p)
  }
  const d = (f: number, axis: number): number => space.jet(f, unit(D, axis))
  const z = (f: number): number => space.jet(f)

  frame.comps.forEach(([M, N], f) => {
    add(f, eta(N) * inv[M]!, [d(xi[N]!, M)])
    add(f, eta(M) * inv[N]!, [d(xi[M]!, N)])
    for (let R = 0; R < D; R++) {
      add(f, inv[R]!, [z(xi[R]!), d(f, R)])
      add(f, inv[M]!, [z(index(R, N)), d(xi[R]!, M)])
      add(f, inv[N]!, [z(index(M, R)), d(xi[R]!, N)])
    }
  })

  return out
}

export type BulkContext = {
  readonly frame: BulkFrame
  readonly spec: BulkSpec
  readonly maxOrder: 1 | 2
  readonly action: Poly[]
  readonly derived: Map<number, Poly>
}

export function bulkContext(frame: BulkFrame, spec: BulkSpec, maxOrder: 1 | 2): BulkContext {
  return { frame, spec, maxOrder, action: bulkSlideAction(frame, spec), derived: new Map() }
}

// D^alpha (delta H_a), with xi^depth's derivatives off the depth axis dropped for a depth-foliation slide
function derivedAction(ctx: BulkContext, id: number): Poly {
  const hit = ctx.derived.get(id)

  if (hit) return hit

  const { space, D, xi } = ctx.frame
  const raw = space.deriveBy(ctx.action[space.field(id)]!, space.orders(id), ctx.spec.p)
  let out = raw

  if (ctx.spec.kind === 'depth-foliation') {
    out = new Map()
    for (const [k, c] of raw) {
      const x = parseMono(k).find(j => space.field(j) === xi[D - 1])

      if (x === undefined || space.orders(x).slice(0, D - 1).every(n => n === 0)) out.set(k, c)
    }
  }
  ctx.derived.set(id, out)

  return out
}

// the invariance rows one monomial of the action contributes: key -> coefficient (mod p)
export function bulkMonomialRows(ctx: BulkContext, mono: readonly number[]): Poly {
  const { p } = ctx.spec
  const { space, F, D, xi } = ctx.frame
  const isField = (f: number): boolean => f < F
  const variation: Poly = new Map()

  mono.forEach((id, i) => {
    const rest = mono.filter((_, j) => j !== i)

    for (const [k, c] of derivedAction(ctx, id)) {
      const m = [...rest, ...parseMono(k)].sort((a, b) => a - b)

      if (space.count(m, isField) <= ctx.maxOrder) addTerm(variation, monoKey(m), c, p)
    }
  })

  const rows: Poly = new Map()
  const moving = Array.from({ length: D - 1 }, (_, a) => a)

  for (const [f, e] of space.gaugeEuler(variation, g => g >= F, p)) {
    if (f === xi[D - 1] && ctx.spec.kind === 'depth-foliation') for (const [k, c] of space.partialEuler(e, moving, p)) addTerm(rows, `F|${k}`, c, p)
    else for (const [k, c] of e) addTerm(rows, `${f}|${k}`, c, p)
  }

  return rows
}

// ---------------------------------------------------------------------------------------------------------
// the ansatz: O_h on the husk's space axes (1, 2, 3) only

type Signed = { readonly perm: readonly number[]; readonly signs: readonly number[] }

const moveAxis = (g: Signed, a: number): number => (a >= 1 && a <= 3 ? g.perm[a - 1]! + 1 : a)
const axisSign = (g: Signed, a: number): number => (a >= 1 && a <= 3 ? g.signs[a - 1]! : 1)

function jetImage(frame: BulkFrame, g: Signed, id: number): Poly {
  const { space, D } = frame
  const f = space.field(id)
  const o = space.orders(id)
  const orders = new Array<number>(D).fill(0)
  let sign = 1

  o.forEach((n, a) => {
    orders[moveAxis(g, a)] = n
    if (n % 2 === 1) sign *= axisSign(g, a)
  })

  const [m, n] = frame.comps[f]!

  return new Map([[monoKey([space.jet(frame.index(moveAxis(g, m), moveAxis(g, n)), orders)]), sign * axisSign(g, m) * axisSign(g, n)]])
}

export type BulkAnsatz = { readonly columns: Poly[]; readonly quadratic: boolean[] }

export function bulkAnsatz(frame: BulkFrame, withCubic: boolean): BulkAnsatz {
  const { space, D, F } = frame
  const group = cubeGroup()
  const first: number[] = []
  const zero: number[] = []

  for (let f = 0; f < F; f++) {
    zero.push(space.jet(f))
    for (let a = 0; a < D; a++) first.push(space.jet(f, unit(D, a)))
  }

  const covered = new Set<string>()
  const seen = new Set<string>()
  const columns: Poly[] = []
  const quadratic: boolean[] = []
  const consider = (m: number[]): void => {
    const key = monoKey(m)

    if (covered.has(key)) return

    const sum: Poly = new Map()

    for (const g of group) addScaled(sum, substitute(monomial(m), id => jetImage(frame, g, id), 0), 1, 0)
    for (const k of sum.keys()) covered.add(k)
    covered.add(key)
    if (sum.size === 0) return

    const canonical = canonicalString(sum)

    if (seen.has(canonical)) return
    seen.add(canonical)
    columns.push(sum)
    quadratic.push(m.length === 2)
  }

  for (let a = 0; a < first.length; a++) for (let b = a; b < first.length; b++) consider([first[a]!, first[b]!])
  if (withCubic) for (const z of zero) for (let a = 0; a < first.length; a++) for (let b = a; b < first.length; b++) consider([z, first[a]!, first[b]!].sort((x, y) => x - y))

  return { columns, quadratic }
}

function canonicalString(poly: Poly): string {
  const terms = [...poly].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
  const g = terms.reduce((t, [, c]) => gcd(t, c), 0)
  const s = Math.sign(terms[0]![1]) * g

  return terms.map(([k, c]) => `${k}:${c / s}`).join(';')
}

// ---------------------------------------------------------------------------------------------------------
// the quadratic kernel, keyed as cubic-slide keys it: kernelKey(a, b, mu, nu) -> coefficient of D_mu H_a D_nu H_b (raw
// derivatives d_mu, not the scaled D_mu)

export function bulkKernel(frame: BulkFrame, poly: Poly, p: number): Poly {
  const { space } = frame
  const out: Poly = new Map()

  for (const [k, c] of poly) {
    const m = parseMono(k)

    if (m.length !== 2 || m.some(id => space.degree(id) !== 1)) continue

    const axis = (id: number): number => space.orders(id).findIndex(x => x === 1)

    addTerm(out, kernelKey(space.field(m[0]!), space.field(m[1]!), axis(m[0]!), axis(m[1]!)), c, p)
  }

  return out
}

// the Fierz-Pauli Lagrangian in D dimensions on the covariant H, with D_l = (1 / s_l) d_l (mod p):
//   -(1/2) dH_mn dH^mn + dH^ml d^n H_nl - dH^mn d_n H + (1/2) dH d H
export function bulkFierzPauli(frame: BulkFrame, scales: readonly number[], p: number): Poly {
  const { D, space, index } = frame
  const inv = scales.map(s => inverseMod(s, p))
  const half = inverseMod(2, p)
  const dH = (l: number, m: number, n: number): Poly => new Map([[monoKey([space.jet(index(m, n), unit(D, l))]), inv[l]!]])
  const sum = (terms: Poly[], signs: number[]): Poly => {
    const out: Poly = new Map()

    terms.forEach((t, i) => addScaled(out, t, norm(signs[i]!, p), p))

    return out
  }
  const range = Array.from({ length: D }, (_, a) => a)
  const V = (l: number): Poly => sum(range.map(m => dH(m, m, l)), range.map(eta))
  const T = (l: number): Poly => sum(range.map(m => dH(l, m, m)), range.map(eta))
  const out: Poly = new Map()

  for (const l of range) {
    for (const m of range) for (const n of range) addScaled(out, multiply(dH(l, m, n), dH(l, m, n), p), norm(-half * eta(l) * eta(m) * eta(n), p), p)
    addScaled(out, multiply(V(l), V(l), p), norm(eta(l), p), p)
    addScaled(out, multiply(V(l), T(l), p), norm(-eta(l), p), p)
    addScaled(out, multiply(T(l), T(l), p), norm(half * eta(l), p), p)
  }

  return out
}

// a kernel's keys moved to a smaller frame: the components and axes both below `to.D`, renumbered; others dropped
export function restrictKernel(from: BulkFrame, to: BulkFrame, kernel: Poly, p: number): Poly {
  const out: Poly = new Map()

  for (const [key, c] of kernel) {
    const [pair, axes] = key.split('|') as [string, string]
    const [a, b] = pair.split(',').map(Number) as [number, number]
    const [mu, nu] = [Number(axes[0]), Number(axes[1])]
    const [am, an] = from.comps[a]!
    const [bm, bn] = from.comps[b]!

    if (Math.max(am, an, bm, bn, mu, nu) >= to.D) continue
    addTerm(out, kernelKey(to.index(am, an), to.index(bm, bn), mu, nu), c, p)
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the kernel as a momentum-space form, and the static exchange it gives (all residues mod p)

// M with Q(h) = h^T M h = sum over keys q k_mu k_nu h_a h_b, the raw momenta k (d_mu -> k_mu)
export function kernelMatrix(frame: BulkFrame, kernel: Poly, k: readonly number[], p: number): number[][] {
  const M = Array.from({ length: frame.F }, () => new Array<number>(frame.F).fill(0))
  const half = inverseMod(2, p)

  for (const [key, c] of kernel) {
    const [pair, axes] = key.split('|') as [string, string]
    const [a, b] = pair.split(',').map(Number) as [number, number]
    const v = mulMod(mulMod(c, mod(k[Number(axes[0])]!, p), p), mod(k[Number(axes[1])]!, p), p)

    if (a === b) M[a]![a] = mod(M[a]![a]! + v, p)
    else {
      const w = mulMod(v, half, p)

      M[a]![b] = mod(M[a]![b]! + w, p)
      M[b]![a] = mod(M[b]![a]! + w, p)
    }
  }

  return M
}

// the de Donder form sum_v eta_vv (D^m H_mv - (1/2) D_v H)^2 at the physical momenta K (residues)
export function deDonderMatrix(frame: BulkFrame, K: readonly number[], p: number): number[][] {
  const { D, F, index } = frame
  const half = inverseMod(2, p)
  const G = Array.from({ length: F }, () => new Array<number>(F).fill(0))

  for (let v = 0; v < D; v++) {
    const L = new Array<number>(F).fill(0)

    for (let m = 0; m < D; m++) {
      const at = index(m, v)

      L[at] = mod(L[at]! + eta(m) * mod(K[m]!, p), p)
      L[index(m, m)] = mod(L[index(m, m)]! - mulMod(mulMod(half, mod(K[v]!, p), p), mod(eta(m), p), p), p)
    }
    for (let a = 0; a < F; a++) for (let b = 0; b < F; b++) G[a]![b] = mod(G[a]![b]! + eta(v) * mulMod(L[a]!, L[b]!, p), p)
  }

  return G
}

// W = -(1/4) J^T M^-1 J for the coupling (1/2) H_MN T^MN
export function bulkExchange(frame: BulkFrame, M: readonly (readonly number[])[], T: Tensor, p: number): number {
  const J = sourceVector(frame.D, T).map(v => dyadicMod(v, p))
  const x = solveMod(M, J, p)
  const s = x.reduce((t, v, i) => mod(t + mulMod(v, J[i]!, p), p), 0)

  return mulMod(mod(-s, p), inverseMod(4, p), p)
}

export type KernelExchange = { factor: number; staticW: number; referenceW: number }

// the tensor factor of a static T_00 at raw momentum k: W(T) / T.T over W(T') / T'.T', T'_23 = T'_32 = 1, with the de
// Donder term at weight g added to the kernel's form (k must have no 2 or 3 part and no time part)
export function kernelExchange(frame: BulkFrame, kernel: Poly, k: readonly number[], scales: readonly number[], g: number, p: number): KernelExchange {
  const K = k.map((v, a) => mulMod(mod(v, p), inverseMod(scales[a]!, p), p))
  const A = kernelMatrix(frame, kernel, k, p)
  const G = deDonderMatrix(frame, K, p)
  const M = A.map((row, a) => row.map((v, b) => mod(v - g * G[a]![b]!, p)))
  const T = Array.from({ length: frame.D }, () => new Array<number>(frame.D).fill(0))
  const R = Array.from({ length: frame.D }, () => new Array<number>(frame.D).fill(0))

  T[0]![0] = 1
  R[2]![3] = 1
  R[3]![2] = 1

  const staticW = bulkExchange(frame, M, T, p)
  const referenceW = bulkExchange(frame, M, R, p)
  // T.T = 1, T'.T' = 2
  const reference = mulMod(referenceW, inverseMod(2, p), p)

  return { factor: mulMod(staticW, inverseMod(reference, p), p), staticW, referenceW }
}
