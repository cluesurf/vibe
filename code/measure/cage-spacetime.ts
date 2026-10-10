// A SPACETIME Z3 CAGE: CENTRE PHASES THAT DEPEND ON THE HALF-BEAT (moving-matter item 0081, research/outside-the-box.md
// 3.1). A uniform centre field puts omega^(c(d)) times 1 on slot d at every dock. Decision 017's cf0 used one pattern for
// both hops of the cycle, so a link and the hop that undoes it are inverse and the out-and-back loops (slot d, then -d on
// the next half-beat) are flat. Here every half-beat h of a period carries its own odd pattern c_h, so the out-and-back
// loop of slot d between half-beats h and h + 1 carries omega^(c_(h+1)(d) - c_h(d)): a Z3 "electric" flux the static
// field cannot have. Explores whether any such uniform one-dock field could stop a lone third exactly.
//
// THE CYCLE. A half-beat h is a piece then the stream: v -> T'_h G_(h mod 2) v, with G = 1 + E (g - 1) E^T (E real, the
// piece's range, g its r x r unit) and T'_h = T_h X (slot d of dock x - r_d, slot -d, carried to slot d of dock x with
// the link omega^(c_h(d))). A period of 2P half-beats is one supercycle; P = 1 is item 0074's cycle B = T P_D T P_S when
// c_0 = c_1. Each c_h is odd (c(-d) = -c(d)), so every T'_h is a Hermitian involution, as in 0074.
//
// THE BLOCK. Uniform fields keep the one-dock translation symmetry, so the supercycle is block diagonal in the box
// momentum theta (basis coordinates, as cage-velocity): T'_h(theta) on slot d is ph_(h,d) = omega^(c_h(d)) e^(-i theta .
// m_d) times the slot swap. The start's span (the slot-uniform register states of the dock, every one of them, so the
// read does not depend on which register state a third carries) generates a Krylov space K(theta), invariant under the
// supercycle, of dimension at most 3 x 16 for P = 1 (the slot classes of c_1 - c_0) and at most the block for P = 3. The
// spectrum and band velocities the start sees are read on K exactly: C = Q^dag U Q, and dC_a = Q^dag dU_a Q with dU
// accumulated half-beat by half-beat (dT'_h = D_a T'_h, D_a = -i sum_j M[a][j] m_dj on slot d, cage-velocity's units).
// v_inf^2 = mean over theta of sum over clusters sum_a |P (dU_a) P s|^2 (Hellmann-Feynman, as cage-velocity's
// denseVelocity, one eigensolve for every start).
//
// DETERMINISM: no random numbers; momenta are fixed Kronecker points or grids. FLOAT: measurement.

import { OPPOSITE } from '@/code/rule/isometric-knit'
import { unitaryEigenHouseholder } from '@/code/measure/spectral-flow'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { colorPieces } from '@/code/measure/color-slab'
import { rhombicBlock, type CageGeometry } from '@/code/measure/cage-velocity'
import { ADDITIVE, POSITIVE_SLOTS, ROTATIONS, rotatePattern, triangleFlux } from '@/code/measure/center-flux'

const TAU = 2 * Math.PI
const SLOTS = 24
const mod3 = (v: number): number => ((v % 3) + 3) % 3

export type Vec = { re: Float64Array; im: Float64Array }
export type CMat = { re: Float64Array; im: Float64Array }

const newVec = (n: number): Vec => ({ re: new Float64Array(n), im: new Float64Array(n) })

// ---- the engines ----

export type Piece = { r: number; E: Float64Array; gm1Re: Float64Array; gm1Im: Float64Array }

export type Engine = {
  name: string
  modes: number
  reg: number
  pieces: [Piece, Piece]
  // full-space unit start vectors, real
  starts: Float64Array[]
  m: Int32Array
  // gax[a * 24 + d] = sum_j metric[a][j] m[d][j]: slot d's root along Z^4 axis a
  gax: Float64Array
}

function gaxOf(geo: CageGeometry): Float64Array {
  const gax = new Float64Array(4 * SLOTS)

  for (let a = 0; a < 4; a++) {
    for (let d = 0; d < SLOTS; d++) {
      let g = 0

      for (let j = 0; j < 4; j++) {
        g += geo.metric[a]![j]! * geo.m[d * 4 + j]!
      }

      gax[a * SLOTS + d] = g
    }
  }

  return gax
}

// item 0074's engine: 192 modes, P_S = 1 + (u - 1) S S^T then P_D = 1 + (conj u - 1) E E^T, start S e_0 (dockStart)
export function cageEngine(geo: CageGeometry): Engine {
  const reg = 8
  const modes = SLOTS * reg
  const S = new Float64Array(modes * reg)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < reg; a++) {
      S[(d * reg + a) * reg + a] = 1 / Math.sqrt(SLOTS)
    }
  }

  const [ur, ui] = geo.u
  const scalar = (re: number, im: number): { gm1Re: Float64Array; gm1Im: Float64Array } => {
    const gm1Re = new Float64Array(reg * reg)
    const gm1Im = new Float64Array(reg * reg)

    for (let i = 0; i < reg; i++) {
      gm1Re[i * reg + i] = re - 1
      gm1Im[i * reg + i] = im
    }

    return { gm1Re, gm1Im }
  }
  const start = new Float64Array(modes)

  for (let d = 0; d < SLOTS; d++) {
    start[d * reg] = 1 / Math.sqrt(SLOTS)
  }

  return {
    name: 'cage',
    modes,
    reg,
    pieces: [
      { r: reg, E: S, ...scalar(ur, ui) },
      { r: reg, E: Float64Array.from(geo.E), ...scalar(ur, -ui) },
    ],
    starts: [start],
    m: geo.m,
    gax: gaxOf(geo),
  }
}

export type HalfEngines = { plain: Engine; wilson: Engine; sRank: number; pieceGap: number; orthoGap: number; r: number }

// E-FRC-0267's sets on half + (chiralSlab half 0, as center-flux centerBands reads it): 96 modes, start span the 4
// slot-uniform register states of the half (colorPieces puts the Q_S range first)
export function halfEngines(geo: CageGeometry): HalfEngines {
  const cs = chiralSlab(8)
  const { sR, dR } = cs.ranges[0]!
  const pieces = colorPieces(cs.sets[0]!, sR, dR)
  const r = pieces.r
  const reg = 4
  const modes = SLOTS * reg
  const starts = Array.from({ length: sR.length }, (_, i) => Float64Array.from({ length: modes }, (_, x) => pieces.E[x * r + i]!))
  const make = (set: number, name: string): Engine => ({
    name,
    modes,
    reg,
    pieces: [0, 1].map(beat => {
      const g = pieces.g[set]![beat]!

      return {
        r,
        E: pieces.E,
        gm1Re: Float64Array.from(g.re, (v, i) => v - (i % (r + 1) === 0 ? 1 : 0)),
        gm1Im: Float64Array.from(g.im),
      }
    }) as [Piece, Piece],
    starts,
    m: geo.m,
    gax: gaxOf(geo),
  })

  return {
    plain: make(0, 'plain'),
    wilson: make(1, 'wilson'),
    sRank: sR.length,
    pieceGap: pieces.pieceGap,
    orthoGap: pieces.orthoGap,
    r,
  }
}

// ---- the Bloch supercycle ----

// the patterns of the half-beats of one period, c_h[d] in {0, 1, 2}, each odd
export type Schedule = readonly Int8Array[]

export function phasesAt(engine: Engine, schedule: Schedule, theta: readonly number[]): { re: Float64Array; im: Float64Array } {
  const H = schedule.length
  const re = new Float64Array(H * SLOTS)
  const im = new Float64Array(H * SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    let t = 0

    for (let j = 0; j < 4; j++) {
      t -= theta[j]! * engine.m[d * 4 + j]!
    }

    for (let h = 0; h < H; h++) {
      const a = t + (TAU * schedule[h]![d]!) / 3

      re[h * SLOTS + d] = Math.cos(a)
      im[h * SLOTS + d] = Math.sin(a)
    }
  }

  return { re, im }
}

// v += E (g - 1) E^T v, in place
function pieceApply(p: Piece, modes: number, v: Vec, yr: Float64Array, yi: Float64Array): void {
  const r = p.r

  yr.fill(0)
  yi.fill(0)

  for (let x = 0; x < modes; x++) {
    const vr = v.re[x]!
    const vi = v.im[x]!

    if (vr === 0 && vi === 0) {
      continue
    }

    for (let i = 0; i < r; i++) {
      const e = p.E[x * r + i]!

      if (e !== 0) {
        yr[i]! += e * vr
        yi[i]! += e * vi
      }
    }
  }

  const zr = new Float64Array(r)
  const zi = new Float64Array(r)

  for (let i = 0; i < r; i++) {
    let sr = 0
    let si = 0

    for (let j = 0; j < r; j++) {
      const gr = p.gm1Re[i * r + j]!
      const gi = p.gm1Im[i * r + j]!

      sr += gr * yr[j]! - gi * yi[j]!
      si += gr * yi[j]! + gi * yr[j]!
    }

    zr[i] = sr
    zi[i] = si
  }

  for (let x = 0; x < modes; x++) {
    let sr = 0
    let si = 0

    for (let i = 0; i < r; i++) {
      const e = p.E[x * r + i]!

      if (e !== 0) {
        sr += e * zr[i]!
        si += e * zi[i]!
      }
    }

    v.re[x]! += sr
    v.im[x]! += si
  }
}

// out = T'_h v: slot d of out takes ph_(h,d) times slot -d of v
function streamApply(engine: Engine, ph: { re: Float64Array; im: Float64Array }, h: number, v: Vec, out: Vec): void {
  const reg = engine.reg

  for (let d = 0; d < SLOTS; d++) {
    const pr = ph.re[h * SLOTS + d]!
    const pi = ph.im[h * SLOTS + d]!
    const from = OPPOSITE[d]! * reg

    for (let a = 0; a < reg; a++) {
      const vr = v.re[from + a]!
      const vi = v.im[from + a]!

      out.re[d * reg + a] = pr * vr - pi * vi
      out.im[d * reg + a] = pr * vi + pi * vr
    }
  }
}

// the supercycle on v and its four Z^4-axis derivatives (forward accumulation)
export function cycleApply(
  engine: Engine,
  schedule: Schedule,
  ph: { re: Float64Array; im: Float64Array },
  v: Vec,
  derivative: boolean,
): { u: Vec; du: Vec[] } {
  const n = engine.modes
  const reg = engine.reg
  const yr = new Float64Array(16)
  const yi = new Float64Array(16)

  let cur: Vec = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }
  let du: Vec[] = derivative ? [0, 1, 2, 3].map(() => newVec(n)) : []

  for (let h = 0; h < schedule.length; h++) {
    const p = engine.pieces[h % 2]!

    pieceApply(p, n, cur, yr, yi)

    const next = newVec(n)

    streamApply(engine, ph, h, cur, next)

    if (derivative) {
      du = du.map((dv, a) => {
        pieceApply(p, n, dv, yr, yi)

        const o = newVec(n)

        streamApply(engine, ph, h, dv, o)

        for (let d = 0; d < SLOTS; d++) {
          const g = engine.gax[a * SLOTS + d]!

          if (g === 0) {
            continue
          }

          for (let b = 0; b < reg; b++) {
            const i = d * reg + b

            // -i g x
            o.re[i]! += g * next.im[i]!
            o.im[i]! -= g * next.re[i]!
          }
        }

        return o
      })
    }

    cur = next
  }

  return { u: cur, du }
}

const dot = (x: Vec, y: Vec): [number, number] => {
  let r = 0
  let s = 0

  for (let i = 0; i < x.re.length; i++) {
    r += x.re[i]! * y.re[i]! + x.im[i]! * y.im[i]!
    s += x.re[i]! * y.im[i]! - x.im[i]! * y.re[i]!
  }

  return [r, s]
}

export type Compressed = {
  m: number
  C: CMat
  dC: CMat[]
  // the starts in the Krylov basis
  starts: Vec[]
  // max |U q - Q C e| over the basis (K invariant) and the starts' norm lost in the basis
  krylovResidual: number
  startLoss: number
}

const KRYLOV_TOL = 1e-8

// the supercycle compressed on the Krylov space of the start span, with its derivatives
export function compressAt(engine: Engine, schedule: Schedule, theta: readonly number[], derivative = true): Compressed {
  const n = engine.modes
  const ph = phasesAt(engine, schedule, theta)
  const Q: Vec[] = []
  const UQ: Vec[] = []
  const DQ: Vec[][] = []
  const queue: Vec[] = engine.starts.map(s => ({ re: Float64Array.from(s), im: new Float64Array(n) }))

  while (queue.length > 0) {
    const v = queue.shift()!

    for (let pass = 0; pass < 2; pass++) {
      for (const q of Q) {
        const [cr, ci] = dot(q, v)

        for (let i = 0; i < n; i++) {
          v.re[i]! -= cr * q.re[i]! - ci * q.im[i]!
          v.im[i]! -= cr * q.im[i]! + ci * q.re[i]!
        }
      }
    }

    const nv = Math.sqrt(dot(v, v)[0])

    if (nv <= KRYLOV_TOL || Q.length >= n) {
      continue
    }

    for (let i = 0; i < n; i++) {
      v.re[i]! /= nv
      v.im[i]! /= nv
    }

    const { u, du } = cycleApply(engine, schedule, ph, v, derivative)

    Q.push(v)
    UQ.push(u)
    DQ.push(du)
    queue.push({ re: Float64Array.from(u.re), im: Float64Array.from(u.im) })
  }

  const m = Q.length
  const proj = (X: Vec[]): CMat => {
    const re = new Float64Array(m * m)
    const im = new Float64Array(m * m)

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        const [r, s] = dot(Q[i]!, X[j]!)

        re[i * m + j] = r
        im[i * m + j] = s
      }
    }

    return { re, im }
  }
  const C = proj(UQ)
  const dC = derivative ? [0, 1, 2, 3].map(a => proj(DQ.map(x => x[a]!))) : []

  // residual of U Q = Q C
  let krylovResidual = 0

  for (let j = 0; j < m; j++) {
    const r = Float64Array.from(UQ[j]!.re)
    const s = Float64Array.from(UQ[j]!.im)

    for (let i = 0; i < m; i++) {
      const cr = C.re[i * m + j]!
      const ci = C.im[i * m + j]!

      for (let x = 0; x < n; x++) {
        r[x]! -= cr * Q[i]!.re[x]! - ci * Q[i]!.im[x]!
        s[x]! -= cr * Q[i]!.im[x]! + ci * Q[i]!.re[x]!
      }
    }

    let e = 0

    for (let x = 0; x < n; x++) {
      e += r[x]! ** 2 + s[x]! ** 2
    }

    krylovResidual = Math.max(krylovResidual, Math.sqrt(e))
  }

  let startLoss = 0
  const starts = engine.starts.map(s0 => {
    const sv: Vec = { re: Float64Array.from(s0), im: new Float64Array(n) }
    const c = newVec(m)

    let kept = 0

    for (let i = 0; i < m; i++) {
      const [r, s] = dot(Q[i]!, sv)

      c.re[i] = r
      c.im[i] = s
      kept += r * r + s * s
    }

    startLoss = Math.max(startLoss, Math.abs(1 - kept))

    return c
  })

  return { m, C, dC, starts, krylovResidual, startLoss }
}

// ---- the velocity function: one eigensolve, every start ----

export type SpectralRead = {
  // cluster mean phases, ascending, and each cluster's weight for every start
  phases: number[]
  weights: number[][]
  // sum over clusters of sum_a |P dU_a P s|^2, a start each (Z^4 units a supercycle, squared)
  v2: number[]
  residual: number
  unitarity: number
}

export function spectralRead(n: number, U: CMat, dU: readonly CMat[], starts: readonly Vec[], tol = 1e-8): SpectralRead {
  let unitarity = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let s = 0

      for (let l = 0; l < n; l++) {
        const ar = U.re[l * n + i]!
        const ai = -U.im[l * n + i]!
        const br = U.re[l * n + j]!
        const bi = U.im[l * n + j]!

        r += ar * br - ai * bi
        s += ar * bi + ai * br
      }

      unitarity = Math.max(unitarity, Math.hypot(r - (i === j ? 1 : 0), s))
    }
  }

  const eig = unitaryEigenHouseholder(n, U.re, U.im)
  const order = eig.phases.map((_, i) => i).sort((a, b) => eig.phases[a]! - eig.phases[b]!)
  const phase = order.map(i => eig.phases[i]!)
  const vecs = order.map(i => eig.vectors[i]!)
  const label = new Int32Array(n)

  for (let i = 1; i < n; i++) {
    label[i] = phase[i]! - phase[i - 1]! <= tol ? label[i - 1]! : label[i - 1]! + 1
  }

  if (n > 1 && phase[0]! + TAU - phase[n - 1]! <= tol) {
    const last = label[n - 1]!

    for (let i = 0; i < n; i++) {
      if (label[i] === last) {
        label[i] = 0
      }
    }
  }

  // w[i][j] = <v_i | s_j>
  const w = vecs.map(v => starts.map(s => dot(v, s)))
  const clusters = [...new Set(label)]
  const phases: number[] = []
  const weights: number[][] = []
  const v2 = starts.map(() => 0)

  for (const c of clusters) {
    const idx = phase.map((_, i) => i).filter(i => label[i] === c)
    const lam = idx.reduce<[number, number]>(
      (s, i) => [s[0] + Math.cos(phase[i]!) / idx.length, s[1] + Math.sin(phase[i]!) / idx.length],
      [0, 0],
    )

    phases.push(Math.atan2(lam[1], lam[0]))
    weights.push(starts.map((_, j) => idx.reduce((s, i) => s + w[i]![j]![0] ** 2 + w[i]![j]![1] ** 2, 0)))

    if (dU.length === 0) {
      continue
    }

    for (const D of dU) {
      // D v_i' for the cluster's members, then W[i][i'] = <v_i | D v_i'>
      const Dv = idx.map(ip => {
        const v = vecs[ip]!
        const o = newVec(n)

        for (let x = 0; x < n; x++) {
          let r = 0
          let s = 0

          for (let y = 0; y < n; y++) {
            const dr = D.re[x * n + y]!
            const di = D.im[x * n + y]!

            r += dr * v.re[y]! - di * v.im[y]!
            s += dr * v.im[y]! + di * v.re[y]!
          }

          o.re[x] = r
          o.im[x] = s
        }

        return o
      })
      const W = idx.map(i => Dv.map(x => dot(vecs[i]!, x)))

      starts.forEach((_, j) => {
        for (let a = 0; a < idx.length; a++) {
          let r = 0
          let s = 0

          for (let b = 0; b < idx.length; b++) {
            const [wr, wi] = W[a]![b]!
            const [pr, pi] = w[idx[b]!]![j]!

            r += wr * pr - wi * pi
            s += wr * pi + wi * pr
          }

          v2[j]! += r * r + s * s
        }
      })
    }
  }

  const sorted = phases.map((_, i) => i).sort((a, b) => phases[a]! - phases[b]!)

  return {
    phases: sorted.map(i => phases[i]!),
    weights: sorted.map(i => weights[i]!),
    v2,
    residual: eig.residual,
    unitarity,
  }
}

export type PointRead = SpectralRead & { m: number; krylovResidual: number; startLoss: number }

export function pointRead(engine: Engine, schedule: Schedule, theta: readonly number[], derivative = true): PointRead {
  const k = compressAt(engine, schedule, theta, derivative)
  const s = spectralRead(k.m, k.C, k.dC, k.starts)

  return { ...s, m: k.m, krylovResidual: k.krylovResidual, startLoss: k.startLoss }
}

// ---- the dense block: the full supercycle and its derivatives, no Krylov space (the instrument) ----

export function denseBlock(engine: Engine, schedule: Schedule, theta: readonly number[]): { U: CMat; dU: CMat[] } {
  const n = engine.modes
  const ph = phasesAt(engine, schedule, theta)
  const U = { re: new Float64Array(n * n), im: new Float64Array(n * n) }
  const dU = [0, 1, 2, 3].map(() => ({ re: new Float64Array(n * n), im: new Float64Array(n * n) }))

  for (let col = 0; col < n; col++) {
    const e = newVec(n)

    e.re[col] = 1

    const { u, du } = cycleApply(engine, schedule, ph, e, true)

    for (let i = 0; i < n; i++) {
      U.re[i * n + col] = u.re[i]!
      U.im[i * n + col] = u.im[i]!

      for (let a = 0; a < 4; a++) {
        dU[a]!.re[i * n + col] = du[a]!.re[i]!
        dU[a]!.im[i * n + col] = du[a]!.im[i]!
      }
    }
  }

  return { U, dU }
}

export function densePointRead(engine: Engine, schedule: Schedule, theta: readonly number[]): SpectralRead {
  const { U, dU } = denseBlock(engine, schedule, theta)
  const starts = engine.starts.map(s => ({ re: Float64Array.from(s), im: new Float64Array(engine.modes) }))

  return spectralRead(engine.modes, U, dU, starts)
}

// ---- grids ----

export type GridRead = {
  nk: number
  points: number
  // mean over the grid, a start each, and mixed over the start span
  v2: number[]
  v2Mixed: number
  // the mixed start's weight on the flat phases given (mean over the grid)
  flatWeight: number
  krylovResidual: number
  startLoss: number
  residual: number
  unitarity: number
  dimension: [number, number]
  seconds: number
}

const circ = (a: number, b: number): number => {
  const d = Math.abs(a - b) % TAU

  return Math.min(d, TAU - d)
}

export function gridRead(
  engine: Engine,
  schedule: Schedule,
  nk: number,
  flat: readonly number[] = [],
  part: [number, number] = [0, 1],
): GridRead {
  const started = Date.now()
  const points = nk ** 4
  const v2 = engine.starts.map(() => 0)

  let flatWeight = 0
  let krylovResidual = 0
  let startLoss = 0
  let residual = 0
  let unitarity = 0
  let counted = 0
  let lo = Infinity
  let hi = 0

  for (let k = part[0]; k < points; k += part[1]) {
    const theta = [0, 1, 2, 3].map(q => (TAU * (Math.floor(k / nk ** q) % nk)) / nk)
    const p = pointRead(engine, schedule, theta)

    counted++
    p.v2.forEach((v, j) => {
      v2[j]! += v
    })

    for (let c = 0; c < p.phases.length; c++) {
      if (flat.some(f => circ(f, p.phases[c]!) < 1e-9)) {
        flatWeight += p.weights[c]!.reduce((s, x) => s + x, 0) / engine.starts.length
      }
    }

    krylovResidual = Math.max(krylovResidual, p.krylovResidual)
    startLoss = Math.max(startLoss, p.startLoss)
    residual = Math.max(residual, p.residual)
    unitarity = Math.max(unitarity, p.unitarity)
    lo = Math.min(lo, p.m)
    hi = Math.max(hi, p.m)
  }

  const mean = v2.map(v => v / counted)

  return {
    nk,
    points: counted,
    v2: mean,
    v2Mixed: mean.reduce((s, v) => s + v, 0) / mean.length,
    flatWeight: flatWeight / counted,
    krylovResidual,
    startLoss,
    residual,
    unitarity,
    dimension: [lo, hi],
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the screen ----

// eight fixed generic momenta (Kronecker points of sqrt 2, 3, 5, 7, as cage-velocity samplePoints past its corners)
export function screenMomenta(count = 8): number[][] {
  const roots = [Math.SQRT2, Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)]

  return Array.from({ length: count }, (_, i) => roots.map(r => TAU * (((i + 1) * r) % 1)))
}

export const PRE_REJECT = 1e-12
export const WEIGHTED = 1e-10
export const SPREAD = 1e-9

export type ScreenRead = {
  pass: boolean
  // the start's largest band speed^2 at the first momentum (a pre-reject: a flat band has none)
  v2First: number
  // the weighted phases at the first momentum, and the largest distance from a weighted phase at one momentum to the
  // nearest weighted phase at another (only when the pre-reject passed)
  phases: number[]
  spread: number
  m: number
}

const weightedPhases = (p: SpectralRead): number[] =>
  p.phases.filter((_, c) => p.weights[c]!.reduce((s, x) => s + x, 0) > WEIGHTED)

export function screenClass(engine: Engine, schedule: Schedule, momenta: readonly (readonly number[])[]): ScreenRead {
  const first = pointRead(engine, schedule, momenta[0]!)
  const v2First = Math.max(...first.v2)
  const phases = weightedPhases(first)

  if (v2First > PRE_REJECT) {
    return { pass: false, v2First, phases, spread: NaN, m: first.m }
  }

  const sets = [phases, ...momenta.slice(1).map(t => weightedPhases(pointRead(engine, schedule, t, false)))]

  let spread = 0

  for (const A of sets) {
    for (const B of sets) {
      for (const a of A) {
        spread = Math.max(spread, B.length > 0 ? Math.min(...B.map(b => circ(a, b))) : Infinity)
      }
    }
  }

  return { pass: spread < SPREAD, v2First, phases, spread, m: first.m }
}

// ---- the classes ----

export const oddIndex = (c: Int8Array): number => POSITIVE_SLOTS.reduce((s, d, j) => s + c[d]! * 3 ** j, 0)

export function oddPattern(index: number): Int8Array {
  const c = new Int8Array(SLOTS)

  POSITIVE_SLOTS.forEach((d, j) => {
    const v = Math.floor(index / 3 ** j) % 3

    c[d] = v
    c[OPPOSITE[d]!] = mod3(-v)
  })

  return c
}

export const addPattern = (x: Int8Array, y: Int8Array, k = 1): Int8Array => Int8Array.from(x, (v, d) => mod3(v + k * y[d]!))
export const scalePattern = (x: Int8Array, q: number): Int8Array => Int8Array.from(x, v => mod3(q * v))

const fluxKey = (c: Int8Array): string => triangleFlux(c).join('')

export type Stabilizer = {
  // rotations g with g base ~ base, and the additive l_g = g base - base
  rotations: { index: number; shift: Int8Array }[]
  // every shift is additive
  additiveOk: boolean
}

export function stabilizerOf(base: Int8Array): Stabilizer {
  const key = fluxKey(base)
  const additive = new Set(ADDITIVE.map(a => a.join('')))
  const rotations: Stabilizer['rotations'] = []

  let additiveOk = true

  ROTATIONS.forEach((g, index) => {
    const r = rotatePattern(base, g)

    if (fluxKey(r) === key) {
      const shift = addPattern(r, base, -1)

      additiveOk &&= additive.has(shift.join(''))
      rotations.push({ index, shift })
    }
  })

  return { rotations, additiveOk }
}

// family 1 with c_f = base: the second pattern c_b free (3^12), modulo the base's stabilizer (gauge-corrected)
// family 2 with c_f = c_b = base: the cycling pattern a free, modulo the stabilizer (a carries no gauge correction)
export function classesUnder(stab: Stabilizer, gaugeCorrected: boolean): { indices: number[]; total: number } {
  const total = 3 ** POSITIVE_SLOTS.length
  const indices: number[] = []

  for (let i = 0; i < total; i++) {
    const c = oddPattern(i)

    let least = i

    for (const g of stab.rotations) {
      const r = rotatePattern(c, ROTATIONS[g.index]!)
      const j = oddIndex(gaugeCorrected ? addPattern(r, g.shift, -1) : r)

      if (j < least) {
        least = j
        break
      }
    }

    if (least === i) {
      indices.push(i)
    }
  }

  return { indices, total }
}

// family 1: [c_b, c_f]; family 2: [c_b + t a, c_f + t a] for t = 0, 1, 2
export const family1 = (cf: Int8Array, cb: Int8Array): Schedule => [cb, cf]
export const family2 = (cf: Int8Array, cb: Int8Array, a: Int8Array): Schedule =>
  [0, 1, 2].flatMap(t => [addPattern(cb, a, t), addPattern(cf, a, t)])

// the elementary spacetime loops: space triangles at every half-beat, and the out-and-back loop of every slot between
// consecutive half-beats (cyclic over the period), counted non-flat
export function loopCounts(schedule: Schedule): { triangles: number; trianglesNonflat: number; outBack: number; outBackNonflat: number } {
  let trianglesNonflat = 0
  let triangles = 0
  let outBack = 0
  let outBackNonflat = 0

  schedule.forEach((c, h) => {
    const f = triangleFlux(c)

    triangles += f.length
    trianglesNonflat += f.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0)

    const next = schedule[(h + 1) % schedule.length]!

    for (let d = 0; d < SLOTS; d++) {
      outBack++
      outBackNonflat += mod3(next[d]! - c[d]!) !== 0 ? 1 : 0
    }
  })

  return { triangles, trianglesNonflat, outBack, outBackNonflat }
}

// ---- the positive control through the same velocity function ----

export function chainControl(flux: number, nk: number): { flux: number; v2: number; flatWeight: number } {
  const start: Vec = { re: Float64Array.from([1, 0, 0]), im: new Float64Array(3) }
  const reads = Array.from({ length: nk }, (_, j) => {
    const { U, dU } = rhombicBlock(flux, (TAU * j) / nk)

    return spectralRead(3, U, dU, [start])
  })
  const v2 = reads.reduce((s, r) => s + r.v2[0]! / nk, 0)
  // the phases present at every k with weight are the flat ones
  const common = reads[0]!.phases.filter(p => reads.every(r => r.phases.some(q => circ(p, q) < 1e-9)))
  const flatWeight =
    reads.reduce(
      (s, r) => s + r.phases.reduce((t, p, c) => t + (common.some(q => circ(p, q) < 1e-9) ? r.weights[c]![0]! : 0), 0),
      0,
    ) / nk

  return { flux, v2, flatWeight }
}

export { circ }
