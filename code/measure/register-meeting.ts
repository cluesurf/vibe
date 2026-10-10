// A MEETING'S EFFECT ON THE MEMBER SPIN (item 0036 of moving-matter, E-SLF-0180, decision 004). On R* the binding
// content of E-QTM-0154 is read on a hole's own internal degree, its spin under the adopted spinor lift L(s): does a
// meeting of two holes move one hole's spin onto the other, and at one rate for every axis?
//
// THE SYMMETRY ON THE TORUS. W(F4) acts on a member's 192 modes by the spinor lift L(s) = (slot permutation) (x) (left
// multiplication by the rotor s on the register), s the rotor of a rotation g (register-symmetry's spinLift). The
// register rule commutes with it at every dock (E-SPN-0191, 4.4e-16). On the L-torus only the rotations that map the
// torus's sites to sites are symmetries (the half-integer ones of W(F4) do not keep L Z^4), and a Bloch vector at class q
// goes to one at g q, so the rotations fixing a class q act on that class's fiber, rho_q(g) = W(q)^dag L(s) W(q).
//
// THE MEMBER DOUBLET D. Left multiplication by the rotor on half + (J = +1, the run's half) is the doublet of one SU(2)
// factor of Spin(4), with multiplicity 2 (the right multiplications, which commute with the rule, act on the
// multiplicity). D is fixed once, on the register: the +1 eigenspace of i R(e01) inside half +, in the basis where the
// generators S_a = (i / 2) L(e_0a) (a = 1, 2, 3, the lift's generators on half +) are the Pauli matrices over 2. Its
// character is Tr_D g = tr(rho_D(g)), rho_D(g) the rotor's left action on that eigenspace.
//
// A HOLE'S SPIN. At a class q the fiber carries the representation rho_q of the class's stabilizer. Its D-copies are the
// intertwiners T (8 x 2, rho_q(g) T = T rho_D(g) for every g, T^dag T = 1), found by averaging; the spin along a unit
// axis n on the fiber is Sigma_n = sum over copies T_i (n . sigma) T_i^dag (the polarization operator of every D-copy in
// the fiber), and a hole polarized along n in band copy T is T |+n>.
//
// THE FRAME POTENTIAL. F2(G) = mean over g in G of |Tr_D g|^4 (the sign of the rotor drops out). F2 = 2 exactly when G's
// image in SU(2) is a unitary 2-design on D (binary tetrahedral, octahedral, icosahedral); then by Schur's lemma a
// G-covariant meeting has one retention for every axis.
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces, as in register-holes.

import { volumeRight } from '@/code/measure/chiral-register'
import { type CMatrix } from '@/code/measure/dock-mixer'
import { type Torus } from '@/code/measure/register-sea'
import {
  type HoleEngine,
  type HoleFrame,
  type Holes,
  type TorusFourier,
  type Vec,
  vec,
} from '@/code/measure/register-holes'
import {
  evenBlade,
  leftMultiplication,
  rightMultiplication,
  spinLift,
} from '@/code/measure/register-symmetry'
import { f4Group, type GroupElement } from '@/code/measure/spinor-register'

const REG = 8
const SLOTS = 24
const MODES = SLOTS * REG

// ---- small complex matrices, row-major ----

export type CM = { rows: number; cols: number; re: Float64Array; im: Float64Array }

export const cm = (rows: number, cols: number): CM => ({
  rows,
  cols,
  re: new Float64Array(rows * cols),
  im: new Float64Array(rows * cols),
})

export function cmMul(a: CM, b: CM): CM {
  const out = cm(a.rows, b.cols)

  for (let i = 0; i < a.rows; i++) {
    for (let k = 0; k < a.cols; k++) {
      const xr = a.re[i * a.cols + k]!
      const xi = a.im[i * a.cols + k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let j = 0; j < b.cols; j++) {
        const yr = b.re[k * b.cols + j]!
        const yi = b.im[k * b.cols + j]!

        out.re[i * b.cols + j]! += xr * yr - xi * yi
        out.im[i * b.cols + j]! += xr * yi + xi * yr
      }
    }
  }

  return out
}

export function cmDag(a: CM): CM {
  const out = cm(a.cols, a.rows)

  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      out.re[j * a.rows + i] = a.re[i * a.cols + j]!
      out.im[j * a.rows + i] = -a.im[i * a.cols + j]!
    }
  }

  return out
}

// the largest entry of |a - b|
export function cmGap(a: CM, b: CM): number {
  let x = 0

  for (let k = 0; k < a.re.length; k++) {
    x = Math.max(x, Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!))
  }

  return x
}

export const cmIdentity = (n: number): CM => {
  const out = cm(n, n)

  for (let i = 0; i < n; i++) {
    out.re[i * n + i] = 1
  }

  return out
}

const fromReal = (m: readonly (readonly number[])[]): CM => {
  const out = cm(m.length, m[0]!.length)

  m.forEach((row, i) => row.forEach((x, j) => (out.re[i * out.cols + j] = x)))

  return out
}

const fromC = (m: CMatrix, n: number): CM => ({ rows: n, cols: n, re: Float64Array.from(m.re), im: Float64Array.from(m.im) })

const scale = (a: CM, sr: number, si = 0): CM => {
  const out = cm(a.rows, a.cols)

  for (let k = 0; k < a.re.length; k++) {
    out.re[k] = sr * a.re[k]! - si * a.im[k]!
    out.im[k] = sr * a.im[k]! + si * a.re[k]!
  }

  return out
}

const add = (a: CM, b: CM): CM => {
  const out = cm(a.rows, a.cols)

  for (let k = 0; k < a.re.length; k++) {
    out.re[k] = a.re[k]! + b.re[k]!
    out.im[k] = a.im[k]! + b.im[k]!
  }

  return out
}

const trace = (a: CM): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.rows; k++) {
    r += a.re[k * a.cols + k]!
    i += a.im[k * a.cols + k]!
  }

  return [r, i]
}

const column = (a: CM, c: number): Vec => {
  const v = vec(a.rows)

  for (let r = 0; r < a.rows; r++) {
    v.re[r] = a.re[r * a.cols + c]!
    v.im[r] = a.im[r * a.cols + c]!
  }

  return v
}

const vdot = (a: Vec, b: Vec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

// orthonormalize candidates (complex vectors), keeping those whose residual norm exceeds tol
function orthonormal(cands: readonly Vec[], tol: number): Vec[] {
  const out: Vec[] = []

  for (const c of cands) {
    const v = { re: Float64Array.from(c.re), im: Float64Array.from(c.im) }

    for (let pass = 0; pass < 2; pass++) {
      for (const b of out) {
        const [r, i] = vdot(b, v)

        for (let k = 0; k < v.re.length; k++) {
          v.re[k]! -= r * b.re[k]! - i * b.im[k]!
          v.im[k]! -= r * b.im[k]! + i * b.re[k]!
        }
      }
    }

    const n = Math.sqrt(vdot(v, v)[0])

    if (n > tol) {
      for (let k = 0; k < v.re.length; k++) {
        v.re[k]! /= n
        v.im[k]! /= n
      }

      out.push(v)
    }
  }

  return out
}

// ---- the member doublet on the register ----

export type Doublet = {
  // 8 x 2: the columns |up>, |down> of D inside the register
  basis: CM
  // the convention sign: S_a = sign (i / 2) L(e_0a) satisfies [S_x, S_y] = i S_z on half +
  sign: 1 | -1
  // the largest departure of S_a on D from sigma_a / 2, and of [S_x, S_y] - i S_z on half +
  pauliGap: number
  algebraGap: number
}

export function memberDoublet(): Doublet {
  const J = fromReal(volumeRight())
  const half = scale(add(cmIdentity(REG), J), 0.5)
  const G = [1, 2, 3].map(b => fromReal(leftMultiplication(evenBlade(b))))
  const R = fromReal(rightMultiplication(evenBlade(1)))
  const spinOf = (sign: number): CM[] => G.map(g => cmMul(half, cmMul(scale(g, 0, sign / 2), half)))
  const comm = (a: CM, b: CM): CM => add(cmMul(a, b), scale(cmMul(b, a), -1))
  const algebra = (S: CM[]): number => cmGap(comm(S[0]!, S[1]!), scale(S[2]!, 0, 1))
  const sign: 1 | -1 = algebra(spinOf(1)) <= algebra(spinOf(-1)) ? 1 : -1
  const S = spinOf(sign)
  // the +1 eigenspace of i R(e01) in half +: (1 + i R) / 2 times the half projector
  const Q = cmMul(scale(add(cmIdentity(REG), scale(R, 0, 1)), 0.5), half)
  const span = orthonormal(
    Array.from({ length: REG }, (_, c) => column(Q, c)),
    1e-9,
  )

  if (span.length !== 2) {
    throw new Error(`register-meeting: the doublet has dimension ${span.length}`)
  }

  // S_z on the span, its +1/2 eigenvector, and S_- of it
  const B0 = cm(REG, 2)

  span.forEach((v, c) => {
    for (let r = 0; r < REG; r++) {
      B0.re[r * 2 + c] = v.re[r]!
      B0.im[r * 2 + c] = v.im[r]!
    }
  })

  const z = cmMul(cmDag(B0), cmMul(S[2]!, B0))
  const a = z.re[0]!
  const br = z.re[1]!
  const bi = z.im[1]!
  const lam = Math.hypot(a, Math.hypot(br, bi))
  // eigenvector of [[a, b], [conj b, -a]] at +lam: (b, lam - a) or (lam + a, conj b)
  const cand = a >= 0 ? [lam + a, 0, br, -bi] : [br, bi, lam - a, 0]
  const nn = Math.hypot(...cand)
  const upC = { re: [cand[0]! / nn, cand[2]! / nn], im: [cand[1]! / nn, cand[3]! / nn] }
  const up = vec(REG)

  for (let r = 0; r < REG; r++) {
    for (let c = 0; c < 2; c++) {
      up.re[r]! += B0.re[r * 2 + c]! * upC.re[c]! - B0.im[r * 2 + c]! * upC.im[c]!
      up.im[r]! += B0.re[r * 2 + c]! * upC.im[c]! + B0.im[r * 2 + c]! * upC.re[c]!
    }
  }

  const minus = add(S[0]!, scale(S[1]!, 0, -1))
  const dn = vec(REG)

  for (let r = 0; r < REG; r++) {
    for (let c = 0; c < REG; c++) {
      const mr = minus.re[r * REG + c]!
      const mi = minus.im[r * REG + c]!

      dn.re[r]! += mr * up.re[c]! - mi * up.im[c]!
      dn.im[r]! += mr * up.im[c]! + mi * up.re[c]!
    }
  }

  const dnn = Math.sqrt(vdot(dn, dn)[0])
  const basis = cm(REG, 2)

  for (let r = 0; r < REG; r++) {
    basis.re[r * 2] = up.re[r]!
    basis.im[r * 2] = up.im[r]!
    basis.re[r * 2 + 1] = dn.re[r]! / dnn
    basis.im[r * 2 + 1] = dn.im[r]! / dnn
  }

  const pauli = PAULI.map(p => scale(p, 0.5))
  const pauliGap = Math.max(...S.map((s, k) => cmGap(cmMul(cmDag(basis), cmMul(s, basis)), pauli[k]!)))

  return { basis, sign, pauliGap, algebraGap: algebra(S) }
}

const pauli = (re: number[], im: number[]): CM => ({ rows: 2, cols: 2, re: Float64Array.from(re), im: Float64Array.from(im) })

export const PAULI: readonly CM[] = [
  pauli([0, 1, 1, 0], [0, 0, 0, 0]),
  pauli([0, 0, 0, 0], [0, -1, 1, 0]),
  pauli([1, 0, 0, -1], [0, 0, 0, 0]),
]

// n . sigma for a unit axis n
export const axisPauli = (n: readonly number[]): CM =>
  add(add(scale(PAULI[0]!, n[0]!), scale(PAULI[1]!, n[1]!)), scale(PAULI[2]!, n[2]!))

// |+n> or |-n> in D's (up, down) basis
export function axisState(n: readonly number[], sign: 1 | -1): CM {
  const th = Math.acos(Math.max(-1, Math.min(1, n[2]!)))
  const ph = Math.atan2(n[1]!, n[0]!)
  const out = cm(2, 1)

  if (sign > 0) {
    out.re[0] = Math.cos(th / 2)
    out.re[1] = Math.cos(ph) * Math.sin(th / 2)
    out.im[1] = Math.sin(ph) * Math.sin(th / 2)
  } else {
    out.re[0] = Math.sin(th / 2)
    out.re[1] = -Math.cos(ph) * Math.cos(th / 2)
    out.im[1] = -Math.sin(ph) * Math.cos(th / 2)
  }

  return out
}

// ---- the torus's rotations ----

export type TorusRotation = {
  g: GroupElement
  // the rotor's left action on the register (8 x 8) and on D (2 x 2)
  left: CM
  onD: CM
  // Tr_D g
  traceD: number
  // site i goes to siteMap[i], class j to classMap[j]
  siteMap: Int32Array
  classMap: Int32Array
}

const det4 = (m: readonly (readonly number[])[]): number => {
  const minor = (rows: number[], cols: number[]): number =>
    rows.length === 1
      ? m[rows[0]!]![cols[0]!]!
      : cols.reduce(
          (s, c, k) =>
            s + (k % 2 === 0 ? 1 : -1) * m[rows[0]!]![c]! * minor(rows.slice(1), cols.filter(x => x !== c)),
          0,
        )

  return minor([0, 1, 2, 3], [0, 1, 2, 3])
}

const mod = (x: number, L: number): number => ((x % L) + L) % L

export type RotationSet = {
  rotations: TorusRotation[]
  // the W(F4) rotations kept and dropped (not a symmetry of the torus's sites)
  kept: number
  dropped: number
  // the largest |V(g x) - V(x)| over kept rotations and sites, and the largest rotor norm gap
  vGap: number
  rotorGap: number
  doublet: Doublet
}

// the rotations of W(F4) (det +1) that map the torus's sites to sites, with their class maps and rotor actions
export function torusRotations(t: Torus, F: TorusFourier): RotationSet {
  const L = t.L
  const doublet = memberDoublet()
  const rotations: TorusRotation[] = []

  let dropped = 0
  let vGap = 0
  let rotorGap = 0

  for (const g of f4Group()) {
    if (Math.abs(det4(g.matrix) - 1) > 1e-9) {
      continue
    }

    const apply = (x: readonly number[]): number[] =>
      [0, 1, 2, 3].map(i => g.matrix[i]!.reduce((s, y, k) => s + y * x[k]!, 0))
    const siteMap = new Int32Array(t.sites.length)
    // g must map the torus's periods L e_i to periods, or x -> g x is not a map of the torus at all (a half-integer
    // rotation sends L e_1 to (L / 2)(+-1, +-1, +-1, +-1), a site but not a period)
    let ok = [0, 1, 2, 3].every(i =>
      apply([0, 1, 2, 3].map(k => (k === i ? L : 0))).every(v => Math.abs(v - Math.round(v)) <= 1e-9 && mod(Math.round(v), L) === 0),
    )

    for (let i = 0; i < t.sites.length && ok; i++) {
      const y = apply(t.sites[i]!)

      if (y.some(v => Math.abs(v - Math.round(v)) > 1e-9)) {
        ok = false
        break
      }

      const at = t.index.get(y.map(v => mod(Math.round(v), L)).join(','))

      if (at === undefined) {
        ok = false
        break
      }

      siteMap[i] = at
    }

    if (!ok || new Set(siteMap).size !== t.sites.length) {
      dropped++
      continue
    }

    const classMap = new Int32Array(F.N)

    for (let j = 0; j < F.N; j++) {
      const y = apply(F.ints[j]!).map(v => mod(Math.round(v), L))

      classMap[j] = F.classOfGrid[((y[0]! * L + y[1]!) * L + y[2]!) * L + y[3]!]!
    }

    for (let i = 0; i < t.sites.length; i++) {
      vGap = Math.max(vGap, Math.abs(t.V[siteMap[i]!]! - t.V[i]!))
    }

    const lift = spinLift(g.matrix)
    const left = fromReal(leftMultiplication(lift.s))
    const onD = cmMul(cmDag(doublet.basis), cmMul(left, doublet.basis))

    rotorGap = Math.max(rotorGap, lift.normGap, cmGap(cmMul(onD, cmDag(onD)), cmIdentity(2)))
    rotations.push({ g, left, onD, traceD: trace(onD)[0], siteMap, classMap })
  }

  return { rotations, kept: rotations.length, dropped, vGap, rotorGap, doublet }
}

// the rotations fixing every class in `classes`
export const stabilizer = (set: RotationSet, classes: readonly number[]): TorusRotation[] =>
  set.rotations.filter(r => classes.every(j => r.classMap[j] === j))

// mean over G of |Tr_D g|^4
export const framePotential = (G: readonly TorusRotation[]): number =>
  G.reduce((s, r) => s + r.traceD ** 4, 0) / G.length

export type F2Row = {
  order: number
  F2: number
  pairs: number
  // the first pair in index order with this stabilizer
  first: [number, number]
}

// the F2 table over every unordered pair of distinct classes: one row per distinct stabilizer
export function f2Table(set: RotationSet, N: number): F2Row[] {
  const R = set.rotations.length
  const words = Math.ceil(R / 32)
  const fix = new Uint32Array(N * words)

  set.rotations.forEach((r, k) => {
    for (let j = 0; j < N; j++) {
      if (r.classMap[j] === j) {
        fix[j * words + (k >> 5)]! |= 1 << (k & 31)
      }
    }
  })

  const rows = new Map<string, F2Row>()
  const m = new Uint32Array(words)

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      for (let w = 0; w < words; w++) {
        m[w] = fix[a * words + w]! & fix[b * words + w]!
      }

      const key = m.join(',')
      const row = rows.get(key)

      if (row) {
        row.pairs++
        continue
      }

      const G = set.rotations.filter((_, k) => (m[k >> 5]! >>> (k & 31)) & 1)

      rows.set(key, { order: G.length, F2: framePotential(G), pairs: 1, first: [a, b] })
    }
  }

  return [...rows.values()].sort((x, y) => y.order - x.order || x.F2 - y.F2)
}

// ---- a hole's spin at a class ----

// rho_q(g) = X^dag L X for a 192 x f basis X (the class's W or W2)
function onBasis(X: Vec, f: number, r: TorusRotation): CM {
  const out = cm(f, f)
  const slots = r.g.slots
  const Lre = r.left.re
  const v = vec(MODES)

  for (let b = 0; b < f; b++) {
    v.re.fill(0)
    v.im.fill(0)

    for (let d = 0; d < SLOTS; d++) {
      const to = slots[d]! * REG

      for (let a = 0; a < REG; a++) {
        let xr = 0
        let xi = 0

        for (let c = 0; c < REG; c++) {
          const l = Lre[a * REG + c]!

          if (l !== 0) {
            xr += l * X.re[(d * REG + c) * f + b]!
            xi += l * X.im[(d * REG + c) * f + b]!
          }
        }

        v.re[to + a] = xr
        v.im[to + a] = xi
      }
    }

    for (let b2 = 0; b2 < f; b2++) {
      let sr = 0
      let si = 0

      for (let m = 0; m < MODES; m++) {
        const wr = X.re[m * f + b2]!
        const wi = -X.im[m * f + b2]!

        sr += wr * v.re[m]! - wi * v.im[m]!
        si += wr * v.im[m]! + wi * v.re[m]!
      }

      out.re[b2 * f + b] = sr
      out.im[b2 * f + b] = si
    }
  }

  return out
}

export type ClassSpin = {
  j: number
  // the D-copies in the up band and in the whole fiber (8 x 2 each, T^dag T = 1)
  upCopies: CM[]
  fiberCopies: CM[]
  // the instrument: the largest |rho rho^dag - 1|, |[rho, U]|, |[rho, P_sector]| in both frames, |A1 rho - rho2 A1|, and
  // the largest |T^dag T - 1| and |rho T - T rho_D|
  unitary: number
  cycle: number
  sector: number
  transfer: number
  copies: number
}

export function classSpin(fr: HoleFrame, G: readonly TorusRotation[], j: number): ClassSpin {
  const f = fr.fiber
  const A1 = fromC(fr.A1[j]!, f)
  const A2 = fromC(fr.A2[j]!, f)
  const U = cmMul(A2, A1)
  const up = fromC(fr.up[j]!, f)
  const Psec = cm(f, f)

  for (let b = 0; b < f; b++) {
    Psec.re[b * f + b] = fr.sector[b]!
  }

  const comm = (a: CM, b: CM): number => cmGap(cmMul(a, b), cmMul(b, a))
  const rho = G.map(r => onBasis(fr.W[j]!, f, r))
  const rho2 = G.map(r => onBasis(fr.W2[j]!, f, r))

  let unitary = 0
  let cycle = 0
  let sector = 0
  let transfer = 0

  rho.forEach((p, k) => {
    const p2 = rho2[k]!

    unitary = Math.max(unitary, cmGap(cmMul(p, cmDag(p)), cmIdentity(f)), cmGap(cmMul(p2, cmDag(p2)), cmIdentity(f)))
    cycle = Math.max(cycle, comm(p, U))
    sector = Math.max(sector, comm(p, Psec), comm(p2, Psec))
    transfer = Math.max(transfer, cmGap(cmMul(A1, p), cmMul(p2, A1)), cmGap(cmMul(A2, p2), cmMul(p, A2)))
  })

  // the intertwiners from D: the average of rho X rho_D^dag over G, X = P E_(i b)
  const copiesIn = (P: CM): CM[] => {
    const cands: Vec[] = []

    for (let i = 0; i < f; i++) {
      for (let b = 0; b < 2; b++) {
        const X = cm(f, 2)

        for (let r = 0; r < f; r++) {
          X.re[r * 2 + b] = P.re[r * f + i]!
          X.im[r * 2 + b] = P.im[r * f + i]!
        }

        let T = cm(f, 2)

        G.forEach((g, k) => {
          T = add(T, cmMul(rho[k]!, cmMul(X, cmDag(g.onD))))
        })

        T = scale(T, 1 / G.length)

        // flatten to a 2f-vector for the Hilbert-Schmidt Gram-Schmidt
        cands.push({ re: Float64Array.from(T.re), im: Float64Array.from(T.im) })
      }
    }

    return orthonormal(cands, 1e-7).map(v => {
      // a unit HS vector T has T^dag T = (1/2) 1 for an irreducible D, so scale by sqrt 2
      const T = cm(f, 2)

      T.re.set(v.re.map(x => x * Math.SQRT2))
      T.im.set(v.im.map(x => x * Math.SQRT2))

      return T
    })
  }

  const upCopies = copiesIn(up)
  const fiberCopies = copiesIn(cmIdentity(f))

  let copies = 0

  for (const T of fiberCopies) {
    copies = Math.max(copies, cmGap(cmMul(cmDag(T), T), cmIdentity(2)))
    G.forEach((g, k) => {
      copies = Math.max(copies, cmGap(cmMul(rho[k]!, T), cmMul(T, g.onD)))
    })
  }

  return { j, upCopies, fiberCopies, unitary, cycle, sector, transfer, copies }
}

// Sigma_n on the fiber: sum over copies T (n . sigma) T^dag
export function spinOnFiber(copies: readonly CM[], n: readonly number[]): CM {
  const p = axisPauli(n)
  const f = copies[0]?.rows ?? 8

  let out = cm(f, f)

  for (const T of copies) {
    out = add(out, cmMul(T, cmMul(p, cmDag(T))))
  }

  return out
}

// a hole's fiber vector polarized along n (sign +1) or against it, in copy T
export function polarizedVector(T: CM, n: readonly number[], sign: 1 | -1): Vec {
  const x = cmMul(T, axisState(n, sign))

  return { re: Float64Array.from(x.re), im: Float64Array.from(x.im) }
}

// ---- reads on the two-hole store ----

// the one-body density at class k (f x f, trace = the expected number of holes at k) of a two-hole state
export function classDensity(e: HoleEngine, s: Holes, k: number): CM {
  const f = e.frame.fiber
  const N = e.frame.fourier.N
  const block = f * f
  const out = cm(f, f)

  if (e.n !== 2) {
    throw new Error('register-meeting: classDensity reads two holes')
  }

  for (let T = 0; T < N; T++) {
    const m0 = e.mom[T * 2]!
    const m1 = e.mom[T * 2 + 1]!
    const o = T * block

    if (m0 === k) {
      for (let b = 0; b < f; b++) {
        for (let b2 = 0; b2 < f; b2++) {
          let sr = 0
          let si = 0

          for (let c = 0; c < f; c++) {
            const xr = s.re[o + b * f + c]!
            const xi = s.im[o + b * f + c]!
            const yr = s.re[o + b2 * f + c]!
            const yi = -s.im[o + b2 * f + c]!

            sr += xr * yr - xi * yi
            si += xr * yi + xi * yr
          }

          out.re[b * f + b2]! += sr
          out.im[b * f + b2]! += si
        }
      }
    }

    if (m1 === k) {
      for (let b = 0; b < f; b++) {
        for (let b2 = 0; b2 < f; b2++) {
          let sr = 0
          let si = 0

          for (let c = 0; c < f; c++) {
            const xr = s.re[o + c * f + b]!
            const xi = s.im[o + c * f + b]!
            const yr = s.re[o + c * f + b2]!
            const yi = -s.im[o + c * f + b2]!

            sr += xr * yr - xi * yi
            si += xr * yi + xi * yr
          }

          out.re[b * f + b2]! += sr
          out.im[b * f + b2]! += si
        }
      }
    }
  }

  return out
}

export const averageDensity = (a: CM, b: CM): CM => scale(add(a, b), 0.5)

// tr(rho Sigma) / tr(rho), and the weight tr(rho)
export function polarization(rho: CM, sigma: CM): { P: number; weight: number } {
  const w = trace(rho)[0]
  const x = trace(cmMul(rho, sigma))[0]

  return { P: w > 0 ? x / w : 0, weight: w }
}

// the four axes of the read: x, y, z and the (1, 1, 1) diagonal
export const AXES: readonly { name: string; n: number[] }[] = [
  { name: 'x', n: [1, 0, 0] },
  { name: 'y', n: [0, 1, 0] },
  { name: 'z', n: [0, 0, 1] },
  { name: 'd', n: [1, 1, 1].map(x => x / Math.sqrt(3)) },
]
