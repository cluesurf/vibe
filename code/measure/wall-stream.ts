// THE LEAST-ROUGH ABELIAN SIGMA(648) FIELDS ON THE WALL SLAB (E-FRC-0291 STEP 4, moving-matter item 0029, decision 008).
// The walk samples the Landau potential at integer and half-integer x0 (a hop r from x0 = a has its midpoint at a + r0 / 2),
// so a field whose links are h^(r1 G(a + r0 / 2)), G any integer function there, is group-valued. Colour component c
// (theta_c an eigenphase of h, in turns) then sees the U(1) stream phase 2 pi theta_c r1 G(a + r0 / 2) in place of
// slabStream's B r1 (a + r0 / 2); the cell from a to a + 1 carries theta_c (G(a + 1) - G(a)).
//
//   gStream          slabStream with the exponent function G (a copy of its Bloch and gauge parts, the field phase read
//                    in exact turns: theta_c r1 G reduced modulo the denominator)
//   uniformG         G(x) = 2 x, the STEP 3 pattern h^(r1 (2 a + r0)) (cell holonomy h^2)
//   sheetG           G(a + 1/2) = G(a) + 1 when a = 0 mod s, else G constant: h on one strip of every s-th column, cell
//                    holonomy h there and 1 elsewhere; s = 1 is the lumpy field, s = 2, 3, 4 the dilute sheets
//   levelsNearPiOn   wall-face's levelsNearPi with the stream as a parameter (a COPY of its Lanczos, decision 008 Why (b):
//                    dropped at merge once wall-face takes a stream); the equivalence control E feeds it slabStream's own
//                    stream and must reproduce wallFlow exactly
//   wallFlowOn       wall-face's wallFlow pairing on levelsNearPiOn, the stream built per k2 by the caller; an optional
//                    list of longer Krylov sizes reruns a loop step whose search stalled (at L 16 the near-degenerate
//                    wall pairs at pi stall Lanczos 80 and complete at 160), never a step that completed
//   gLinkCheck       every link h^(r1 G) read from the product table: a group element, its complex trace the sum of the
//                    component phases the U(1) slabs carry, and the period closing (h^(G(x + Q) - G(x)) = 1)
//   gBulkWindow      the two-class bulk slabs (all Wilson, all E-SPN-0160) in one component's G field
//   gComponentFlow   one component's wall flow at depth L (wall-index componentFlow with the G stream)
//
// G is passed as a function of n = 2 x (an integer), so no half-integer is ever a float key.
//
// DETERMINISM: no random numbers. EXACT: links are product-table indices, the field phases exact fractions of a turn; the
// spectra are floats, as measurement.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import type { FiniteGroup } from '@/code/dynamics/finite-gauge'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import {
  slabApply,
  slabClasses,
  unitaryEigen,
  wallCrossings,
  type CVec,
  type Dense,
  type FlowCount,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import {
  applyUdag,
  weightOnDepths,
  type FlowStep,
  type NearPi,
  type WallFlow,
} from '@/code/measure/wall-face'
import {
  fracText,
  power,
  traceIm,
  type Frac,
  type Momentum,
} from '@/code/measure/wall-index'

type Roots = readonly (readonly number[])[]

export type Stream = { to: Int32Array; re: Float64Array; im: Float64Array }

// the exponent function, of n = 2 x
export type ExponentG = (n: number) => number

const SLOTS = 24
const HALF_REG = 4
const HALF_MODES = SLOTS * HALF_REG

const rep = (a: number, c: number): number[] => [a, (a + c) % 2, 0, c]
const dot4 = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

// ---- the exponent functions ----

export const uniformG: ExponentG = n => n

export const sheetG =
  (s: number): ExponentG =>
  n =>
    Math.floor((n - 1 + 2 * s) / (2 * s))

// the component's flux integer over the magnetic period Q: theta (G(x + Q) - G(x)), checked the same at every x0 sample
export function periodFlux(theta: Frac, Q: number, G: ExponentG): number {
  const jumps = new Set<number>()

  for (let n = -1; n < 2 * Q; n++) {
    jumps.add(G(n + 2 * Q) - G(n))
  }

  if (jumps.size !== 1) {
    throw new Error(`G is not periodic up to a constant over ${Q}`)
  }

  const p = (theta.num * [...jumps][0]!) / theta.den

  if (!Number.isInteger(p)) {
    throw new Error(
      `component ${fracText(theta)}: flux ${p} over period ${Q} is not an integer`,
    )
  }

  return p
}

// ---- the stream ----

// slabStream's permutation with the field phase 2 pi theta r1 G(a + r0 / 2) (exact turns), the Bloch phase -K . disp and
// the optional pure-gauge chi as slabStream has them; s.qa is the magnetic period Q
export function gStream(
  s: Slab,
  K: readonly number[],
  roots: Roots,
  theta: Frac,
  G: ExponentG,
): Stream {
  const nc = slabClasses(s)
  const N = nc * HALF_MODES
  const to = new Int32Array(N)
  const re = new Float64Array(N)
  const im = new Float64Array(N)

  for (let a = 0; a < s.qa; a++) {
    for (let c = 0; c < s.L; c++) {
      const cls = a * s.L + c
      const p0 = rep(a, c)

      for (let d = 0; d < SLOTS; d++) {
        const r = roots[d]!
        const a2 = (((a + r[0]!) % s.qa) + s.qa) % s.qa
        const c2 = (((c + r[3]!) % s.L) + s.L) % s.L
        const p1 = rep(a2, c2)
        const disp = [0, 1, 2, 3].map(k => p0[k]! + r[k]! - p1[k]!)
        const cls2 = a2 * s.L + c2
        const gauge = s.chi ? s.chi[cls2]! - s.chi[cls]! : 0
        const m = theta.num * r[1]! * G(2 * a + r[0]!)
        const turn = (((m % theta.den) + theta.den) % theta.den) / theta.den
        const phase = 2 * Math.PI * turn - dot4(K, disp) + gauge

        for (let x = 0; x < HALF_REG; x++) {
          const from = cls * HALF_MODES + d * HALF_REG + x

          to[from] = cls2 * HALF_MODES + d * HALF_REG + x
          re[from] = Math.cos(phase)
          im[from] = Math.sin(phase)
        }
      }
    }
  }

  return { to, re, im }
}

// ---- the links ----

export type GLinkCheck = {
  links: number
  worstTrace: number
  inGroup: boolean
  closes: boolean
}

export function gLinkCheck(
  group: FiniteGroup,
  h: number,
  phases: readonly Frac[],
  Q: number,
  G: ExponentG,
): GLinkCheck {
  let links = 0
  let worstTrace = 0
  let inGroup = true
  let closes = true

  for (const r of DOCK_ROOTS) {
    for (let a = 0; a < Q; a++) {
      const n = 2 * a + r[0]!
      const m = r[1]! * G(n)
      const g = power(group, h, m)

      inGroup = inGroup && Number.isInteger(g) && g >= 0 && g < group.order

      let re = 0
      let im = 0

      for (const f of phases) {
        const ph = (2 * Math.PI * f.num * m) / f.den

        re += Math.cos(ph)
        im += Math.sin(ph)
      }

      worstTrace = Math.max(
        worstTrace,
        Math.hypot(group.trace[g]! - re, traceIm(group, g) - im),
      )
      closes =
        closes && power(group, h, G(n + 2 * Q) - G(n)) === group.identity
      links++
    }
  }

  return { links, worstTrace, inGroup, closes }
}

// ---- matrix-free: the levels nearest pi (a copy of wall-face levelsNearPi, the stream a parameter) ----

const dotC = (a: CVec, b: CVec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    const ar = a.re[k]!
    const ai = a.im[k]!
    const br = b.re[k]!
    const bi = b.im[k]!

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

function axpyC(y: CVec, cr: number, ci: number, x: CVec): void {
  for (let k = 0; k < y.re.length; k++) {
    const xr = x.re[k]!
    const xi = x.im[k]!

    y.re[k]! += cr * xr - ci * xi
    y.im[k]! += cr * xi + ci * xr
  }
}

const MAX_ROUNDS = 24
const MAX_STALLED = 3
const BREAKDOWN = 1e-8

// wall-face levelsNearPi, line for line, with `st` given instead of built from (K, roots)
export function levelsNearPiOn(
  s: Slab,
  sets: readonly HalfSet[],
  st: Stream,
  window: number,
  steps: number,
  accept = 1e-9,
): NearPi {
  const N = slabClasses(s) * HALF_MODES

  const applyA = (x: CVec): CVec => {
    const u = slabApply(s, sets, st, x)
    const w = applyUdag(s, sets, st, x)
    const out: CVec = {
      re: new Float64Array(N),
      im: new Float64Array(N),
    }

    for (let k = 0; k < N; k++) {
      out.re[k] = -(u.re[k]! + w.re[k]!) / 2
      out.im[k] = -(u.im[k]! + w.im[k]!) / 2
    }

    return out
  }

  const threshold = Math.cos(window)
  const found: CVec[] = []

  const deflate = (w: CVec): void => {
    for (let pass = 0; pass < 2; pass++) {
      for (const b of found) {
        const [cr, ci] = dotC(b, w)

        axpyC(w, -cr, -ci, b)
      }
    }
  }

  let ritzResidual = 0
  let unconverged = 0
  let totalSteps = 0
  let rounds = 0
  let complete = false
  let stalled = 0

  for (let round = 0; round < MAX_ROUNDS; round++) {
    rounds++

    let v: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let k = 0; k < N; k++) {
      v.re[k] =
        Math.cos((1.3 + 0.17 * round) * k + 0.7) +
        0.5 * Math.sin((0.37 + 0.05 * round) * k)

      v.im[k] =
        Math.sin((2.1 - 0.13 * round) * k + 0.2) -
        0.3 * Math.cos(0.91 * k)
    }

    deflate(v)

    const nrm = Math.sqrt(dotC(v, v)[0])

    for (let k = 0; k < N; k++) {
      v.re[k]! /= nrm
      v.im[k]! /= nrm
    }

    const basis: CVec[] = []
    const alpha: number[] = []
    const beta: number[] = []

    for (let j = 0; j < steps; j++) {
      basis.push(v)

      const w = applyA(v)
      const a = dotC(v, w)[0]

      alpha.push(a)
      deflate(w)

      for (let pass = 0; pass < 2; pass++) {
        for (const b of basis) {
          const [cr, ci] = dotC(b, w)

          axpyC(w, -cr, -ci, b)
        }
      }

      const bj = Math.sqrt(dotC(w, w)[0])

      if (j === steps - 1 || bj < BREAKDOWN) {
        break
      }

      beta.push(bj)
      v = { re: w.re.map(x => x / bj), im: w.im.map(x => x / bj) }
    }

    const k = alpha.length

    totalSteps += k

    const T = makeComplexMatrix({ rows: k, cols: k })

    for (let i = 0; i < k; i++) {
      T.re[i * k + i] = alpha[i]!

      if (i + 1 < k) {
        T.re[i * k + i + 1] = beta[i]!
        T.re[(i + 1) * k + i] = beta[i]!
      }
    }

    const te = eigHermitian({ matrix: T })

    let above = 0
    let pending = 0
    let accepted = 0

    for (let c = 0; c < k; c++) {
      const theta = te.values[c]!

      if (theta <= threshold || theta > 1 + 1e-9) {
        continue
      }

      above++

      const y: CVec = {
        re: new Float64Array(N),
        im: new Float64Array(N),
      }

      for (let j = 0; j < k; j++) {
        axpyC(
          y,
          te.vectorsRe[j * k + c]!,
          te.vectorsIm[j * k + c]!,
          basis[j]!,
        )
      }

      deflate(y)

      const yn = Math.sqrt(dotC(y, y)[0])

      if (yn < 1e-8) {
        continue
      }

      for (let q = 0; q < N; q++) {
        y.re[q]! /= yn
        y.im[q]! /= yn
      }

      const Ay = applyA(y)

      let r2 = 0

      for (let q = 0; q < N; q++) {
        r2 +=
          (Ay.re[q]! - theta * y.re[q]!) ** 2 +
          (Ay.im[q]! - theta * y.im[q]!) ** 2
      }

      const res = Math.sqrt(r2)

      if (res > accept) {
        pending++
        continue
      }

      ritzResidual = Math.max(ritzResidual, res)
      found.push(y)
      accepted++
    }

    unconverged = pending

    if (above === 0) {
      complete = true
      break
    }

    if (accepted === 0) {
      stalled++

      if (stalled >= MAX_STALLED) {
        break
      }
    }
  }

  const Y = found
  const m = Y.length

  if (m === 0) {
    return {
      levels: [],
      steps: totalSteps,
      ritzResidual,
      subspace: 0,
      eigenResidual: 0,
      unconverged,
      rounds,
      complete,
    }
  }

  const UY = Y.map(y => slabApply(s, sets, st, y))
  const Gm: Dense = {
    re: new Float64Array(m * m),
    im: new Float64Array(m * m),
  }

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = dotC(Y[a]!, UY[b]!)

      Gm.re[a * m + b] = r
      Gm.im[a * m + b] = i
    }
  }

  const e = unitaryEigen(Gm, m)

  let eigenResidual = 0

  const levels = e.phases.map((ph, c) => {
    const x: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let a = 0; a < m; a++) {
      axpyC(x, e.vre[a * m + c]!, e.vim[a * m + c]!, Y[a]!)
    }

    const Ux = slabApply(s, sets, st, x)
    const cr = Math.cos(ph)
    const ci = Math.sin(ph)

    let r2 = 0

    for (let q = 0; q < N; q++) {
      const xr = x.re[q]!
      const xi = x.im[q]!

      r2 +=
        (Ux.re[q]! - (cr * xr - ci * xi)) ** 2 +
        (Ux.im[q]! - (cr * xi + ci * xr)) ** 2
    }

    eigenResidual = Math.max(eigenResidual, Math.sqrt(r2))

    return { offset: wrap(ph - Math.PI), vector: x }
  })

  return {
    levels,
    steps: totalSteps,
    ritzResidual,
    subspace: m,
    eigenResidual,
    unconverged,
    rounds,
    complete,
  }
}

// ---- the flow (wall-face wallFlow's pairing on levelsNearPiOn) ----

export function wallFlowOn(
  s: Slab,
  sets: readonly HalfSet[],
  streamAt: (K: readonly number[]) => Stream,
  k0: number,
  k1: number,
  k2Start: number,
  loopSteps: number,
  aDepths: ReadonlySet<number>,
  window: number,
  lanczosSteps: number,
  reach: number,
  retry: readonly number[] = [],
): WallFlow {
  const steps: FlowStep[] = []

  for (let t = 0; t <= loopSteps; t++) {
    const k2 = k2Start + (2 * Math.PI * t) / loopSteps
    const st = streamAt([k0, k1, k2, 0])

    let r = levelsNearPiOn(s, sets, st, window, lanczosSteps)

    // a search that stalls (near-degenerate wall pairs at pi converge slowly) is run again from scratch with a longer
    // Krylov space, in order; with `retry` empty this is wall-face wallFlow exactly (control E)
    for (const more of retry) {
      if (r.complete) {
        break
      }

      r = levelsNearPiOn(s, sets, st, window, more)
    }

    steps.push({
      k2,
      levels: r.levels.map(l => ({
        offset: l.offset,
        wallA: weightOnDepths(s, l.vector, aDepths),
      })),
      ritzResidual: r.ritzResidual,
      eigenResidual: r.eigenResidual,
      subspace: r.subspace,
      unconverged: r.unconverged,
      complete: r.complete,
    })
  }

  const sum = (a: FlowCount, b: FlowCount): FlowCount => ({
    up: a.up + b.up,
    down: a.down + b.down,
    entries: a.entries + b.entries,
    exits: a.exits + b.exits,
    unmatched: 0,
  })

  let A: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }
  let B: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }
  let ambiguous = 0

  for (let t = 0; t < loopSteps; t++) {
    const before = steps[t]!
    const after = steps[t + 1]!
    const pick = (x: FlowStep, onA: boolean): number[] =>
      x.levels
        .filter(l => l.wallA > 0.5 === onA)
        .map(l => Math.PI + l.offset)

    A = sum(
      A,
      wallCrossings(pick(before, true), pick(after, true), Math.PI, reach),
    )
    B = sum(
      B,
      wallCrossings(pick(before, false), pick(after, false), Math.PI, reach),
    )
    ambiguous += after.levels.filter(
      l => l.wallA > 0.2 && l.wallA < 0.8,
    ).length
  }

  return {
    steps,
    A,
    B,
    netA: A.up - A.down,
    netB: B.up - B.down,
    worstRitz: Math.max(...steps.map(x => x.ritzResidual)),
    worstEigen: Math.max(...steps.map(x => x.eigenResidual)),
    ambiguous,
  }
}

// wall A's labeling classes: E-SPN-0168's L / 2 classes about the wall between class L / 2 - 1 and L / 2 (as wall-index
// componentFlow)
export const wallADepths = (L: number): Set<number> =>
  new Set(
    Array.from(
      { length: L / 2 },
      (_, i) => (Math.round(L / 2 / 2) + i) % L,
    ),
  )

// ---- one component of a G field ----

export type GBulkRead = {
  count: number
  complete: boolean
  nearest: number
  worstEigen: number
}

// the two-class bulk slabs (L 2: all Wilson, all E-SPN-0160) in the component's G field at the given k2 values
export function gBulkWindow(
  sets: readonly HalfSet[],
  theta: Frac,
  Q: number,
  G: ExponentG,
  at: Momentum,
  k2s: readonly number[],
  window: number,
  lanczosSteps: number,
): GBulkRead {
  const p = periodFlux(theta, Q, G)

  let count = 0
  let complete = true
  let nearest = Infinity
  let worstEigen = 0

  for (const profile of [
    [1, 1],
    [0, 0],
  ]) {
    const slab: Slab = { L: 2, qa: Q, p, profile }

    for (const k2 of k2s) {
      const r = levelsNearPiOn(
        slab,
        sets,
        gStream(slab, [at.k0, at.k1, k2, 0], DOCK_ROOTS, theta, G),
        window,
        lanczosSteps,
      )

      count += r.levels.length
      complete = complete && r.complete
      worstEigen = Math.max(worstEigen, r.eigenResidual)

      for (const l of r.levels) {
        nearest = Math.min(nearest, Math.abs(l.offset))
      }
    }
  }

  return { count, complete, nearest, worstEigen }
}

export type GComponentFlow = {
  theta: Frac
  Q: number
  p: number
  L: number
  window: number
  flow: WallFlow
}

// the wall flow of one component (window and reach equal, as wall-index componentFlow)
export function gComponentFlow(
  sets: readonly HalfSet[],
  theta: Frac,
  Q: number,
  G: ExponentG,
  L: number,
  at: Momentum,
  loopSteps: number,
  window: number,
  lanczosSteps: number,
  retry: readonly number[] = [],
): GComponentFlow {
  const p = periodFlux(theta, Q, G)
  const wil = L / 2
  const slab: Slab = {
    L,
    qa: Q,
    p,
    profile: Array.from({ length: L }, (_, i) => (i < wil ? 1 : 0)),
  }
  const flow = wallFlowOn(
    slab,
    sets,
    K => gStream(slab, K, DOCK_ROOTS, theta, G),
    at.k0,
    at.k1,
    at.k2Start,
    loopSteps,
    wallADepths(L),
    window,
    lanczosSteps,
    window,
    retry,
  )

  return { theta, Q, p, L, window, flow }
}
