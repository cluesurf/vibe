// THE REGISTER RULE IN REAL SPACE, ON ANY LABELLED REGION (the true mesh or the flat box). E-SPN-0160's member and
// E-FRC-0258's chiral mass were read as Bloch bands, which need a Brillouin torus; the true mesh {3,4,3,4} has none.
// This module runs the same rule dock by dock on a finite labelled region, so it can be read on the true mesh near a
// cusp, and it builds the operator of a mesh symmetry, so a symmetry can be tested by the dynamics themselves.
//
//   the state          (dock, slot, register) amplitudes, index (x * 24 + d) * 8 + a, as two Float64Arrays
//   PieceSpec          P = X (1 + (u+ - 1) Q P+ + (u- - 1) Q P-), Q the singlet projector Q_S or the Clifford partner
//                      Q_D of code/measure/spinor-register, P+- = (1 +- J) / 2 the chiral halves of
//                      code/measure/chiral-register, X the slot reversal. u+ = u- is E-SPN-0160's piece; u+ != u- is
//                      E-FRC-0258's chiral mass. Applied STRUCTURALLY (Q_S is a slot average; Q_D is
//                      (1/48) sum_ij r_i r'_j gamma_i^T gamma_j, applied through the 4 x 8 root moments), about 3,000
//                      multiplications a dock instead of the dense 192 x 192; `denseAgreement` checks it against the
//                      dense matrices the Bloch readings use
//   registerBeat       one beat: every dock's piece (chosen per beat and per dock CLASS, so a rule may read a dock
//                      property such as its frame's orientation), then the stream: slot d of dock x to slot d of its
//                      neighbour across label d. Where that neighbour is outside the region the frontier either
//                      REFLECTS (into slot -d of the same dock, a bijection, so the beat stays unitary) or ABSORBS (the
//                      amplitude is removed and its weight returned per dock)
//   imageOperator      a mesh symmetry as an operator: slot d of dock x goes to slot s(d) of dock g(x), the register
//                      turned by the minors of s (the W(F4) element with that slot action)
//   symmetryDefect     || U^t M psi - M U^t psi || / || psi || for t = 1 .. T: 0 for an exact symmetry up to rounding
//   weylState          a deterministic spread test vector (Weyl phases of the mode index), no random numbers
//
// DETERMINISM: no random numbers. EXACT where it can be: the projectors and group actions are integer or dyadic; the
// amplitudes are floats, as measurement. NOTHING MOVES: a piece hands values between slots and register components of
// one dock, and the stream takes each slot's value one dock along.

import {
  EVEN,
  gammaMatrices,
  registerPiece,
  singletProjector24,
  partnerProjector48,
  scaled,
  type GroupElement,
} from '@/code/measure/spinor-register'
import {
  chiralPiece,
  chirality2,
  volumeRight,
} from '@/code/measure/chiral-register'
import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG

export type Unit = readonly [number, number]

export type PieceSpec = {
  sector: 'S' | 'D'
  plus: Unit
  minus: Unit
}

export type State = { re: Float64Array; im: Float64Array }

export const newState = (cells: number): State => ({
  re: new Float64Array(cells * MODES),
  im: new Float64Array(cells * MODES),
})

export const cloneState = (s: State): State => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

// ---- the structured projectors ----

const J = volumeRight()
const GAMMA = gammaMatrices()
// G[i][j][a][b] = (gamma_i^T gamma_j)_(a b), on the even forms
const G: number[][][][] = [0, 1, 2, 3].map(i =>
  [0, 1, 2, 3].map(j =>
    Array.from({ length: REG }, (_, a) =>
      Array.from({ length: REG }, (_, b) =>
        GAMMA[i]!.reduce((s, row, eta) => s + row[a]! * GAMMA[j]![eta]![b]!, 0),
      ),
    ),
  ),
)
const ROOT_FLAT = Float64Array.from(DOCK_ROOTS.flat())
// scratch buffers, reused dock after dock (the walk is single threaded)
const SCRATCH = {
  vRe: new Float64Array(4 * REG),
  vIm: new Float64Array(4 * REG),
  wRe: new Float64Array(4 * REG),
  wIm: new Float64Array(4 * REG),
  yRe: new Float64Array(MODES),
  yIm: new Float64Array(MODES),
  pRe: new Float64Array(MODES),
  pIm: new Float64Array(MODES),
}

// Q psi on one dock (192 values at offset o) into y
function applyQ(
  sector: 'S' | 'D',
  re: Float64Array,
  im: Float64Array,
  o: number,
  yRe: Float64Array,
  yIm: Float64Array,
): void {
  if (sector === 'S') {
    for (let a = 0; a < REG; a++) {
      let sr = 0
      let si = 0

      for (let e = 0; e < SLOTS; e++) {
        sr += re[o + e * REG + a]!
        si += im[o + e * REG + a]!
      }

      sr /= SLOTS
      si /= SLOTS

      for (let d = 0; d < SLOTS; d++) {
        yRe[d * REG + a] = sr
        yIm[d * REG + a] = si
      }
    }

    return
  }

  // v[j][b] = sum_e r_e,j psi(e, b)
  const vRe = SCRATCH.vRe.fill(0)
  const vIm = SCRATCH.vIm.fill(0)

  for (let e = 0; e < SLOTS; e++) {
    for (let j = 0; j < 4; j++) {
      const r = ROOT_FLAT[e * 4 + j]!

      if (r === 0) {
        continue
      }

      for (let b = 0; b < REG; b++) {
        vRe[j * REG + b]! += r * re[o + e * REG + b]!
        vIm[j * REG + b]! += r * im[o + e * REG + b]!
      }
    }
  }

  // w[i][a] = sum_j sum_b G_ij[a][b] v[j][b] / 48
  const wRe = SCRATCH.wRe.fill(0)
  const wIm = SCRATCH.wIm.fill(0)

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const g = G[i]![j]!

      for (let a = 0; a < REG; a++) {
        const row = g[a]!

        for (let b = 0; b < REG; b++) {
          const x = row[b]!

          if (x === 0) {
            continue
          }

          wRe[i * REG + a]! += x * vRe[j * REG + b]!
          wIm[i * REG + a]! += x * vIm[j * REG + b]!
        }
      }
    }
  }

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < 4; i++) {
        const r = ROOT_FLAT[d * 4 + i]!

        sr += r * wRe[i * REG + a]!
        si += r * wIm[i * REG + a]!
      }

      yRe[d * REG + a] = sr / 48
      yIm[d * REG + a] = si / 48
    }
  }
}

// P+ y = (y + J y) / 2 on each slot, in place into p (from y)
function plusHalf(
  yRe: Float64Array,
  yIm: Float64Array,
  pRe: Float64Array,
  pIm: Float64Array,
): void {
  for (let d = 0; d < SLOTS; d++) {
    const o = d * REG

    for (let a = 0; a < REG; a++) {
      let sr = yRe[o + a]!
      let si = yIm[o + a]!
      const row = J[a]!

      for (let b = 0; b < REG; b++) {
        const x = row[b]!

        if (x !== 0) {
          sr += x * yRe[o + b]!
          si += x * yIm[o + b]!
        }
      }

      pRe[o + a] = sr / 2
      pIm[o + a] = si / 2
    }
  }
}

// out = X (t + (u+ - 1) Q P+ t + (u- - 1) Q P- t) on one dock; t read from (re, im) at offset o
export function applyPiece(
  spec: PieceSpec,
  re: Float64Array,
  im: Float64Array,
  o: number,
  outRe: Float64Array,
  outIm: Float64Array,
): void {
  const { yRe, yIm, pRe, pIm } = SCRATCH

  applyQ(spec.sector, re, im, o, yRe, yIm)
  plusHalf(yRe, yIm, pRe, pIm)

  const ap = spec.plus[0] - 1
  const bp = spec.plus[1]
  const am = spec.minus[0] - 1
  const bm = spec.minus[1]

  for (let d = 0; d < SLOTS; d++) {
    const from = OPPOSITE[d]! * REG

    for (let a = 0; a < REG; a++) {
      const k = from + a
      const pr = pRe[k]!
      const pi = pIm[k]!
      const mr = yRe[k]! - pr
      const mi = yIm[k]! - pi

      outRe[d * REG + a] =
        re[o + k]! + ap * pr - bp * pi + am * mr - bm * mi
      outIm[d * REG + a] =
        im[o + k]! + ap * pi + bp * pr + am * mi + bm * mr
    }
  }
}

// the dense piece the Bloch readings use, for the agreement check
export function densePiece(spec: PieceSpec): CMatrix {
  const q =
    spec.sector === 'S'
      ? scaled(singletProjector24(), 24)
      : scaled(partnerProjector48(), 48)

  if (spec.plus[0] === spec.minus[0] && spec.plus[1] === spec.minus[1]) {
    return registerPiece(q, spec.plus)
  }

  const P2 = chirality2(J, 1)
  const M2 = chirality2(J, -1)
  const mul = (a: Float64Array, b: Float64Array): Float64Array => {
    const o = new Float64Array(MODES * MODES)

    for (let i = 0; i < MODES; i++) {
      for (let k = 0; k < MODES; k++) {
        const x = a[i * MODES + k]!

        if (x === 0) {
          continue
        }

        for (let j = 0; j < MODES; j++) {
          o[i * MODES + j]! += x * b[k * MODES + j]!
        }
      }
    }

    return o
  }

  return chiralPiece(
    scaled(mul(q, P2), 2),
    scaled(mul(q, M2), 2),
    spec.plus,
    spec.minus,
  )
}

// the largest gap between the structured and the dense piece over the 192 unit vectors and one spread vector
export function denseAgreement(spec: PieceSpec): number {
  const P = densePiece(spec)
  const re = new Float64Array(MODES)
  const im = new Float64Array(MODES)
  const oRe = new Float64Array(MODES)
  const oIm = new Float64Array(MODES)

  let worst = 0

  for (let j = 0; j <= MODES; j++) {
    re.fill(0)
    im.fill(0)

    if (j < MODES) {
      re[j] = 1
    } else {
      for (let k = 0; k < MODES; k++) {
        re[k] = Math.cos(2.399963 * k)
        im[k] = Math.sin(1.618034 * k)
      }
    }

    applyPiece(spec, re, im, 0, oRe, oIm)

    for (let i = 0; i < MODES; i++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < MODES; k++) {
        const a = P.re[i * MODES + k]!
        const b = P.im[i * MODES + k]!

        sr += a * re[k]! - b * im[k]!
        si += a * im[k]! + b * re[k]!
      }

      worst = Math.max(worst, Math.abs(sr - oRe[i]!), Math.abs(si - oIm[i]!))
    }
  }

  return worst
}

// ---- the beat ----

export type Walk = {
  cells: number
  neighbour: Int32Array
  // the dock class that picks the piece (0 when the rule reads nothing of the dock)
  classOf: Int8Array
  // schedule[beat][class]
  schedule: PieceSpec[][]
  frontier: 'reflect' | 'absorb'
}

// one beat (index `beat` into the schedule, cyclic); returns the new state and the weight absorbed at each dock
export function registerBeat(
  walk: Walk,
  s: State,
  beat: number,
): { state: State; lost: Float64Array } {
  const { cells, neighbour, classOf, schedule, frontier } = walk
  const pieces = schedule[beat % schedule.length]!
  const out = newState(cells)
  const lost = new Float64Array(cells)
  const pRe = new Float64Array(MODES)
  const pIm = new Float64Array(MODES)

  for (let x = 0; x < cells; x++) {
    const o = x * MODES

    let any = false

    for (let k = 0; k < MODES; k++) {
      if (s.re[o + k] !== 0 || s.im[o + k] !== 0) {
        any = true
        break
      }
    }

    if (!any) {
      continue
    }

    applyPiece(pieces[classOf[x]!]!, s.re, s.im, o, pRe, pIm)

    for (let d = 0; d < SLOTS; d++) {
      const n = neighbour[x * SLOTS + d]!

      let to: number

      if (n >= 0) {
        to = (n * SLOTS + d) * REG
      } else if (frontier === 'reflect') {
        to = (x * SLOTS + OPPOSITE[d]!) * REG
      } else {
        for (let a = 0; a < REG; a++) {
          lost[x]! += pRe[d * REG + a]! ** 2 + pIm[d * REG + a]! ** 2
        }

        continue
      }

      for (let a = 0; a < REG; a++) {
        out.re[to + a] = pRe[d * REG + a]!
        out.im[to + a] = pIm[d * REG + a]!
      }
    }
  }

  return { state: out, lost }
}

// ---- symmetry operators ----

export type ImageOperator = {
  cellMap: Int32Array
  slots: Int32Array
  register: number[][]
}

export function imageOperator(
  cellMap: Int32Array,
  element: GroupElement,
): ImageOperator {
  return { cellMap, slots: element.slots, register: element.register }
}

export function applyImage(op: ImageOperator, s: State): State {
  const cells = op.cellMap.length
  const out = newState(cells)

  for (let x = 0; x < cells; x++) {
    const y = op.cellMap[x]!

    for (let d = 0; d < SLOTS; d++) {
      const from = (x * SLOTS + d) * REG
      const to = (y * SLOTS + op.slots[d]!) * REG

      for (let a = 0; a < REG; a++) {
        let sr = 0
        let si = 0
        const row = op.register[a]!

        for (let b = 0; b < REG; b++) {
          const w = row[b]!

          if (w !== 0) {
            sr += w * s.re[from + b]!
            si += w * s.im[from + b]!
          }
        }

        out.re[to + a] = sr
        out.im[to + a] = si
      }
    }
  }

  return out
}

export const norm2 = (s: State): number => {
  let t = 0

  for (let k = 0; k < s.re.length; k++) {
    t += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  return t
}

export function gap2(a: State, b: State): number {
  let t = 0

  for (let k = 0; k < a.re.length; k++) {
    t += (a.re[k]! - b.re[k]!) ** 2 + (a.im[k]! - b.im[k]!) ** 2
  }

  return t
}

// || U^t M psi - M U^t psi || / || psi || for t = 1 .. beats
export function symmetryDefect(
  walk: Walk,
  op: ImageOperator,
  psi: State,
  beats: number,
): number[] {
  const n0 = Math.sqrt(norm2(psi))
  const out: number[] = []

  let a = applyImage(op, psi)
  let b = psi

  for (let t = 0; t < beats; t++) {
    a = registerBeat(walk, a, t).state
    b = registerBeat(walk, b, t).state
    out.push(Math.sqrt(gap2(a, applyImage(op, b))) / n0)
  }

  return out
}

// the same defect for many symmetries at once: U^t psi is evolved once and shared
export function symmetryDefects(
  walk: Walk,
  ops: readonly ImageOperator[],
  psi: State,
  beats: number,
): number[][] {
  const n0 = Math.sqrt(norm2(psi))
  const plain: State[] = []

  let b = psi

  for (let t = 0; t < beats; t++) {
    b = registerBeat(walk, b, t).state
    plain.push(b)
  }

  return ops.map(op => {
    const out: number[] = []

    let a = applyImage(op, psi)

    for (let t = 0; t < beats; t++) {
      a = registerBeat(walk, a, t).state
      out.push(Math.sqrt(gap2(a, applyImage(op, plain[t]!))) / n0)
    }

    return out
  })
}

// a spread deterministic test vector: Weyl phases of the mode index
export function weylState(cells: number): State {
  const s = newState(cells)
  const a1 = (Math.sqrt(5) - 1) / 2
  const a2 = Math.SQRT2 - 1

  for (let k = 0; k < s.re.length; k++) {
    const p = 2 * Math.PI * ((k * a1) % 1)
    const q = 2 * Math.PI * ((k * a2) % 1)

    s.re[k] = Math.cos(p) + 0.5 * Math.cos(q)
    s.im[k] = Math.sin(p) - 0.5 * Math.sin(q)
  }

  return s
}

// THE UPPER-BAND MEMBER AT A MOMENTUM K: the spectral projection of S (x) scalar onto the eigenvalue e^(i (pi + E)) of
// the dense cycle U(K) (cycle order: the schedule's pieces, each followed by the stream), when U(K)'s spectrum is the
// three clusters {1, e^(i (pi + E)), e^(i (pi - E))} of E-SPN-0160's schedule (176 flat, 8 + 8 on the band):
//     P_up v = (U - 1)(U - e^(i (pi - E))) v / ((e^(i (pi + E)) - 1)(e^(i (pi + E)) - e^(i (pi - E)))),
// normalized. Returns the vector, the weight of S (x) scalar in the band (before normalizing) and the eigen residual
// |U p - e^(i (pi + E)) p|, which is 0 exactly when the three-cluster premise holds.
export function upperBandMember(
  cycle: CMatrix,
  E: number,
): { re: Float64Array; im: Float64Array; weight: number; residual: number } {
  const n = MODES
  const apply = (
    vr: Float64Array,
    vi: Float64Array,
    shift: Unit,
  ): [Float64Array, Float64Array] => {
    const or = new Float64Array(n)
    const oi = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let sr = -shift[0] * vr[i]! + shift[1] * vi[i]!
      let si = -shift[0] * vi[i]! - shift[1] * vr[i]!

      for (let k = 0; k < n; k++) {
        const a = cycle.re[i * n + k]!
        const b = cycle.im[i * n + k]!

        sr += a * vr[k]! - b * vi[k]!
        si += a * vi[k]! + b * vr[k]!
      }

      or[i] = sr
      oi[i] = si
    }

    return [or, oi]
  }
  const up: Unit = [Math.cos(Math.PI + E), Math.sin(Math.PI + E)]
  const dn: Unit = [Math.cos(Math.PI - E), Math.sin(Math.PI - E)]
  const vr = new Float64Array(n)
  const vi = new Float64Array(n)

  for (let d = 0; d < SLOTS; d++) {
    vr[d * REG] = 1 / Math.sqrt(SLOTS)
  }

  const [ar, ai] = apply(vr, vi, [1, 0])
  const [br, bi] = apply(ar, ai, dn)
  // den = (up - 1)(up - dn)
  const p: Unit = [up[0] - 1, up[1]]
  const q: Unit = [up[0] - dn[0], up[1] - dn[1]]
  const den: Unit = [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]]
  const dd = den[0] ** 2 + den[1] ** 2
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  let weight = 0

  for (let i = 0; i < n; i++) {
    re[i] = (br[i]! * den[0] + bi[i]! * den[1]) / dd
    im[i] = (bi[i]! * den[0] - br[i]! * den[1]) / dd
    weight += re[i]! ** 2 + im[i]! ** 2
  }

  const scale = 1 / Math.sqrt(weight)

  for (let i = 0; i < n; i++) {
    re[i]! *= scale
    im[i]! *= scale
  }

  const [cr, ci] = apply(re, im, up)

  let residual = 0

  for (let i = 0; i < n; i++) {
    residual += cr[i]! ** 2 + ci[i]! ** 2
  }

  return { re, im, weight, residual: Math.sqrt(residual) }
}

// a dock's 192 amplitudes set to c e^(i phase) times a given local vector
export function placeAt(
  s: State,
  x: number,
  local: { re: Float64Array; im: Float64Array },
  c: number,
  phase: number,
): void {
  const cr = c * Math.cos(phase)
  const ci = c * Math.sin(phase)

  for (let k = 0; k < MODES; k++) {
    s.re[x * MODES + k] = cr * local.re[k]! - ci * local.im[k]!
    s.im[x * MODES + k] = cr * local.im[k]! + ci * local.re[k]!
  }
}

// the member S (x) w at dock x: every slot carries the register vector w / sqrt 24
export function memberAt(
  s: State,
  x: number,
  w: readonly number[],
  phase: Unit = [1, 0],
  weight = 1,
): void {
  const c = weight / Math.sqrt(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      const k = (x * SLOTS + d) * REG + a

      s.re[k]! += c * w[a]! * phase[0]
      s.im[k]! += c * w[a]! * phase[1]
    }
  }
}

// weight per dock
export function dockWeights(s: State, cells: number): Float64Array {
  const w = new Float64Array(cells)

  for (let x = 0; x < cells; x++) {
    let t = 0

    for (let k = x * MODES; k < (x + 1) * MODES; k++) {
      t += s.re[k]! ** 2 + s.im[k]! ** 2
    }

    w[x] = t
  }

  return w
}

export const SCALAR_BLADE: readonly number[] = EVEN.map((b, k) =>
  k === 0 && b.length === 0 ? 1 : 0,
)
