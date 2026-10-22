// A LAUGHLIN PUMP ON THE COLOURED WALL SLAB (moving-matter item 0053, decision 011 point 3). The slab of E-FRC-0294
// (code/measure/color-slab: 8^3 x L, D4 modulo 8 D3 and L e_3) with every link multiplied by one colour-singlet U(1)
// phase: a uniform field with exactly one flux quantum through the transverse (0, 1) torus, and a flat twist e^(i theta)
// on the links that wrap the x2 period. Along the closed loop theta = 0 .. 2 pi each chiral wall member's lowest Landau
// branch moves by one x2 momentum step, so a topological wall pumps an integer number of its levels across pi and a
// trivial one pumps none. The count is an index: no box size or disorder can fake it.
//
// THE FIELD. In the cover the potential is A = B x0 dx1, the hop r from x carrying B r1 (x0 + r0 / 2) (the midpoint rule:
// a triangle x, x + r, x + r + s then holds exactly B (r0 s1 - r1 s0) / 2, its projected (0, 1) area times B). The slab's
// transverse periods are T0 = side (1, 0, 1), T1 = side (0, 1, 1), T2 = side (0, 0, 2); the (0, 1) projection of T0 ^ T1
// is side^2, so one flux quantum is B = 2 pi / side^2, and T0 ^ T2, T1 ^ T2 carry none. A hop whose end is reduced by
// q0 T0 + q1 T1 + q2 T2 takes the transition -B side q0 y1 (y1 the end's x1, defined modulo side since B side^2 = 2 pi)
// and the twist theta q2 (flat: the q decomposition is linear, so q2 sums to 0 on every contractible loop).
//
//   slabCoords        the slab box's dock coordinates (x0, x1, x2, c), color-slab slabBox's own map, re-derived here and
//                     witnessed against box.nb on every slot
//   pumpPhases        the U(1) angle of every link slot (flux quanta, twist theta)
//   phaseWitness      every triangle's holonomy against B times its projected area, the reverse of every slot, and the
//                     straight T2 loop's holonomy against theta (all to 1e-12)
//   probeLinks        a colour field times the U(1) phases
//   principalLinks    the colour-strength path g_t = exp(t log g) (principal log, an eigenphase pi taken as +pi) on the
//                     met-first slot of each link, its reverse the dagger (so a reverse is exactly the inverse)
//   pumpRead          one step of the loop: every level within the window, each with its wall weights; Lanczos first when
//                     the window is expected empty (complete only from a Krylov search, traps.md E-FRC-0294), else the
//                     Chebyshev block read, either confirmed or replaced by the other
//   pumpFlow          the signed crossings of pi per wall over the loop (wilson-register wallCrossings, as wall-stream
//                     wallFlowOn pairs them)
//
// DETERMINISM: no random numbers. A gauge transform is an integer Weyl stream; start vectors fixed patterns. The phases are
// exact multiples of 2 pi / (side^2 16) and 2 pi / 16 up to the float of cos and sin.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { unitaryEigen, type FlowCount } from '@/code/measure/wilson-register'
import {
  colorCluster,
  colorLevelsNearPi,
  depthShare,
  dockWeights,
  fullVector,
  type ClusterOptions,
  type ColorBox,
  type ColorLinks,
  type ColorOp,
} from '@/code/measure/color-slab'

const SLOTS = 24

const mod = (v: number, m: number): number => ((v % m) + m) % m

// ---- the box coordinates ----

export function slabCoords(box: ColorBox, side: number): Int32Array {
  const out = new Int32Array(box.cells * 4)

  for (let x = 0; x < box.cells; x++) {
    const m = x % side
    const x1 = Math.floor(x / side) % side
    const x0 = Math.floor(x / side ** 2) % side
    const c = Math.floor(x / side ** 3)

    out[4 * x] = x0
    out[4 * x + 1] = x1
    out[4 * x + 2] = 2 * m + mod(x0 + x1 + c, 2)
    out[4 * x + 3] = c
  }

  return out
}

type Reduced = { y: number[]; q: number[] }

// the end of hop r from canonical p: its canonical coordinates and the periods (q0, q1, q2) removed
function reduce(p: readonly number[], r: readonly number[], side: number, L: number): Reduced {
  let x0 = p[0]! + r[0]!
  let x1 = p[1]! + r[1]!
  let x2 = p[2]! + r[2]!
  const c = mod(p[3]! + r[3]!, L)
  const q0 = Math.floor(x0 / side)

  x0 -= q0 * side
  x2 -= q0 * side

  const q1 = Math.floor(x1 / side)

  x1 -= q1 * side
  x2 -= q1 * side

  const q2 = Math.floor(x2 / (2 * side))

  x2 -= q2 * 2 * side

  return { y: [x0, x1, x2, c], q: [q0, q1, q2] }
}

const indexOf = (y: readonly number[], side: number): number =>
  ((y[3]! * side + y[0]!) * side + y[1]!) * side + Math.floor(y[2]! / 2)

// ---- the U(1) probe ----

export type PumpField = { side: number; quanta: number; theta: number }

// the angle of every link slot x * 24 + d
export function pumpPhases(box: ColorBox, f: PumpField): Float64Array {
  const { side, quanta, theta } = f
  const B = (2 * Math.PI * quanta) / side ** 2
  const co = slabCoords(box, side)
  const out = new Float64Array(box.cells * SLOTS)

  for (let x = 0; x < box.cells; x++) {
    const p = [co[4 * x]!, co[4 * x + 1]!, co[4 * x + 2]!, co[4 * x + 3]!]

    for (let d = 0; d < SLOTS; d++) {
      const r = DOCK_ROOTS[d]!
      const { y, q } = reduce(p, r, side, box.L)

      out[x * SLOTS + d] = B * r[1]! * (p[0]! + r[0]! / 2) - B * side * q[0]! * y[1]! + theta * q[2]!
    }
  }

  return out
}

export type PhaseWitness = {
  // the re-derived coordinates reproduce box.nb on every slot
  coordsExact: boolean
  triangles: number
  // max |holonomy - B area| (mod 2 pi) over every triangle x, x + r, x + r + s
  triangle: number
  // max |phi(x, d) + phi(x + r_d, -d)| (mod 2 pi)
  reverse: number
  // the straight T2 loop (+(1,0,1,0), +(-1,0,1,0)) x side from every dock against theta, and the T0 ^ T1 flux in quanta
  // read as the T0 loop's change from x1 to x1 + 1 times side
  t2Loop: number
  quantaRead: number
}

export function phaseWitness(box: ColorBox, f: PumpField, phases: Float64Array): PhaseWitness {
  const { side, quanta, theta } = f
  const B = (2 * Math.PI * quanta) / side ** 2
  const co = slabCoords(box, side)
  const rootIndex = new Map(DOCK_ROOTS.map((r, d) => [r.join(','), d]))

  let coordsExact = true
  let triangles = 0
  let triangle = 0
  let reverse = 0

  for (let x = 0; x < box.cells; x++) {
    const p = [co[4 * x]!, co[4 * x + 1]!, co[4 * x + 2]!, co[4 * x + 3]!]

    for (let d = 0; d < SLOTS; d++) {
      const r = DOCK_ROOTS[d]!
      const y = box.nb[x * SLOTS + d]!

      coordsExact = coordsExact && indexOf(reduce(p, r, side, box.L).y, side) === y
      reverse = Math.max(
        reverse,
        Math.abs(wrap(phases[x * SLOTS + d]! + phases[y * SLOTS + OPPOSITE[d]!]!)),
      )

      for (let e = 0; e < SLOTS; e++) {
        const s = DOCK_ROOTS[e]!
        const t = r.map((v, k) => -(v + s[k]!))
        const g = rootIndex.get(t.join(','))

        if (g === undefined) {
          continue
        }

        const z = box.nb[y * SLOTS + e]!
        const hol = phases[x * SLOTS + d]! + phases[y * SLOTS + e]! + phases[z * SLOTS + g]!
        const area = (r[0]! * s[1]! - r[1]! * s[0]!) / 2

        triangles++
        triangle = Math.max(triangle, Math.abs(wrap(hol - B * area)))
      }
    }
  }

  const dUp = rootIndex.get('1,0,1,0')!
  const dBack = rootIndex.get('-1,0,1,0')!

  let t2Loop = 0

  for (let x0 = 0; x0 < box.cells; x0++) {
    let x = x0
    let hol = 0

    for (let i = 0; i < side; i++) {
      hol += phases[x * SLOTS + dUp]!
      x = box.nb[x * SLOTS + dUp]!
      hol += phases[x * SLOTS + dBack]!
      x = box.nb[x * SLOTS + dBack]!
    }

    t2Loop = Math.max(t2Loop, Math.abs(wrap(hol - theta)), x === x0 ? 0 : Infinity)
  }

  // the T0 loop (+(1,0,1,0)) x side from dock (0, x1, parity, 0): its holonomy changes by the T0 ^ T1 flux per unit x1
  const t0Loop = (x1: number): number => {
    let x = indexOf([0, x1, mod(x1, 2), 0], side)
    let hol = 0

    for (let i = 0; i < side; i++) {
      hol += phases[x * SLOTS + dUp]!
      x = box.nb[x * SLOTS + dUp]!
    }

    return hol
  }
  // per unit x1 the strip carries -B side (the loop runs +x0); the torus holds side strips
  const quantaRead = (-wrap(t0Loop(1) - t0Loop(0)) * side) / (2 * Math.PI)

  return {
    coordsExact,
    triangles,
    triangle,
    reverse,
    t2Loop,
    quantaRead,
  }
}

// a colour field times the U(1) phases
export function probeLinks(links: ColorLinks, phases: Float64Array): ColorLinks {
  const k = links.k
  const w = 2 * k * k
  const m = new Float64Array(links.m.length)

  for (let l = 0; l < phases.length; l++) {
    const c = Math.cos(phases[l]!)
    const s = Math.sin(phases[l]!)

    for (let i = 0; i < k * k; i++) {
      const re = links.m[l * w + 2 * i]!
      const im = links.m[l * w + 2 * i + 1]!

      m[l * w + 2 * i] = c * re - s * im
      m[l * w + 2 * i + 1] = c * im + s * re
    }
  }

  return { k, m }
}

// ---- the colour-strength path ----

// exp(t log g) of a k x k unitary (18 floats at k 3), the principal log with an eigenphase within 1e-9 of pi taken as +pi
export function principalPower(g: Float64Array, k: number, t: number): Float64Array {
  const U = {
    re: Float64Array.from({ length: k * k }, (_, i) => g[2 * i]!),
    im: Float64Array.from({ length: k * k }, (_, i) => g[2 * i + 1]!),
  }
  const e = unitaryEigen(U, k)
  const out = new Float64Array(2 * k * k)

  e.phases.forEach((ph0, c) => {
    let ph = wrap(ph0)

    if (Math.abs(ph) > Math.PI - 1e-9) {
      ph = Math.PI
    }

    const cr = Math.cos(t * ph)
    const ci = Math.sin(t * ph)

    for (let i = 0; i < k; i++) {
      const vir = e.vre[i * k + c]!
      const vii = e.vim[i * k + c]!

      for (let j = 0; j < k; j++) {
        // v_i conj(v_j)
        const vjr = e.vre[j * k + c]!
        const vji = -e.vim[j * k + c]!
        const pr = vir * vjr - vii * vji
        const pi = vir * vji + vii * vjr

        out[2 * (i * k + j)]! += cr * pr - ci * pi
        out[2 * (i * k + j) + 1]! += cr * pi + ci * pr
      }
    }
  })

  return out
}

const daggerOf = (a: Float64Array, k: number): Float64Array => {
  const out = new Float64Array(2 * k * k)

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      out[2 * (i * k + j)] = a[2 * (j * k + i)]!
      out[2 * (i * k + j) + 1] = -a[2 * (j * k + i) + 1]!
    }
  }

  return out
}

// g_t on every link: the met-first slot (box order) takes exp(t log g), its reverse the dagger; `power1` is the largest
// |g_1 - g| over the 648 elements' powers at t = 1 (the path ends at the rule's field)
export function principalLinks(
  box: ColorBox,
  role: { k: number; mats: readonly Float64Array[]; link: Int32Array },
  t: number,
): { links: ColorLinks; power1: number } {
  const k = role.k
  const w = 2 * k * k
  const cache = new Map<number, Float64Array>()
  const powerOf = (e: number): Float64Array => {
    if (!cache.has(e)) {
      cache.set(e, principalPower(role.mats[e]!, k, t))
    }

    return cache.get(e)!
  }
  const m = new Float64Array(box.cells * SLOTS * w)
  const done = new Uint8Array(box.cells * SLOTS)

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d

      if (done[l]) {
        continue
      }

      const back = box.nb[l]! * SLOTS + OPPOSITE[d]!
      const g = powerOf(role.link[l]!)

      m.set(g, l * w)
      m.set(daggerOf(g, k), back * w)
      done[l] = 1
      done[back] = 1
    }
  }

  let power1 = 0

  role.mats.forEach(g => {
    const p = principalPower(g, k, 1)

    for (let i = 0; i < w; i++) {
      power1 = Math.max(power1, Math.abs(p[i]! - g[i]!))
    }
  })

  return { links: { k, m }, power1 }
}

// ---- one step of the loop ----

export type PumpLevel = {
  offset: number
  // weight on the six-class wall-A window, the six-class wall-B window, their union, and on wall A's half (wall-stream
  // wallADepths: the label, above 1/2 is wall A)
  windowA: number
  windowB: number
  wall: number
  half: number
}

export type PumpReadOptions = {
  window: number
  krylov: number
  cluster: Omit<ClusterOptions, 'window'>
  expectEmpty: boolean
  windows: { a: ReadonlySet<number>; b: ReadonlySet<number> }
  halfA: ReadonlySet<number>
  eigenTol: number
}

export type PumpStepRead = {
  // the wall states (wallStates) and the eigenlevels' own offsets
  levels: PumpLevel[]
  raw: number[]
  complete: boolean
  // which reads ran and what each saw
  krylov?: { count: number; complete: boolean; rounds: number; nearest: number; nearestResidual: number; eigenResidual: number; seconds: number }
  block?: { count: number; complete: boolean; passes: number; aboveCut: number; guard: number; eigenResidual: number; seconds: number }
  agree: boolean
}

// THE WALL STATES of one step. A wall-A level and a wall-B level at the same quasienergy are hybridized by the leak (at
// theta 0 the two chiral branches meet exactly at pi, and every level there is half A, half B), so an eigenlevel's own
// weight cannot label it. The wall-A half projector is diagonalized in the span of the window levels (d3Read's rule): its
// eigenvectors are the wall states, labelled by their projector eigenvalue, each with the quasienergy expectation
// sum |c|^2 offset (exact for a level that mixes with nothing). Levels far apart in quasienergy barely rotate.
export function wallStates(
  op: ColorOp,
  levels: readonly { offset: number; vector: Parameters<typeof dockWeights>[1] }[],
  windows: { a: ReadonlySet<number>; b: ReadonlySet<number> },
  halfA: ReadonlySet<number>,
): PumpLevel[] {
  const n = levels.length

  if (n === 0) {
    return []
  }

  const per = 96 * op.k
  const fulls = levels.map(l => fullVector(op, l.vector))
  const P = makeComplexMatrix({ rows: n, cols: n })

  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) {
      let r = 0
      let i = 0

      for (let y = 0; y < op.box.cells; y++) {
        if (!halfA.has(op.box.depth[y]!)) {
          continue
        }

        for (let q = y * per; q < (y + 1) * per; q++) {
          r += fulls[a]!.re[q]! * fulls[b]!.re[q]! + fulls[a]!.im[q]! * fulls[b]!.im[q]!
          i += fulls[a]!.re[q]! * fulls[b]!.im[q]! - fulls[a]!.im[q]! * fulls[b]!.re[q]!
        }
      }

      P.re[a * n + b] = r
      P.im[a * n + b] = i
      P.re[b * n + a] = r
      P.im[b * n + a] = -i
    }

    P.im[a * n + a] = 0
  }

  const e = eigHermitian({ matrix: P })
  const union = new Set([...windows.a, ...windows.b])
  const out: PumpLevel[] = []

  for (let c = 0; c < n; c++) {
    let energy = 0
    const v = { re: new Float64Array(op.box.cells * per), im: new Float64Array(op.box.cells * per) }

    for (let a = 0; a < n; a++) {
      const cr = e.vectorsRe[a * n + c]!
      const ci = e.vectorsIm[a * n + c]!
      const f = fulls[a]!

      energy += (cr * cr + ci * ci) * levels[a]!.offset

      for (let q = 0; q < v.re.length; q++) {
        v.re[q]! += cr * f.re[q]! - ci * f.im[q]!
        v.im[q]! += cr * f.im[q]! + ci * f.re[q]!
      }
    }

    const wts = new Float64Array(op.box.cells)

    for (let y = 0; y < op.box.cells; y++) {
      let s = 0

      for (let q = y * per; q < (y + 1) * per; q++) {
        s += v.re[q]! ** 2 + v.im[q]! ** 2
      }

      wts[y] = s
    }

    out.push({
      offset: energy,
      windowA: depthShare(op, wts, windows.a),
      windowB: depthShare(op, wts, windows.b),
      wall: depthShare(op, wts, union),
      half: depthShare(op, wts, halfA),
    })
  }

  return out.sort((x, y) => x.offset - y.offset)
}

export function pumpRead(op: ColorOp, o: PumpReadOptions): PumpStepRead {
  const states = (levels: readonly { offset: number; vector: Parameters<typeof dockWeights>[1] }[]) => ({
    levels: wallStates(op, levels, o.windows, o.halfA),
    raw: levels.map(l => l.offset).sort((x, y) => x - y),
  })

  const runKrylov = () => {
    const r = colorLevelsNearPi(op, o.window, o.krylov)

    return {
      r,
      meta: {
        count: r.levels.length,
        complete: r.complete && r.eigenResidual <= o.eigenTol,
        rounds: r.rounds,
        nearest: r.nearest,
        nearestResidual: r.nearestResidual,
        eigenResidual: r.eigenResidual,
        seconds: r.seconds,
      },
    }
  }
  const runBlock = () => {
    const c = colorCluster(op, { ...o.cluster, window: o.window })

    return {
      c,
      meta: {
        count: c.levels.length,
        complete: c.complete,
        passes: c.passes,
        aboveCut: c.aboveCut,
        guard: c.guard,
        eigenResidual: c.eigenResidual,
        seconds: c.seconds,
      },
    }
  }

  if (o.expectEmpty) {
    const k = runKrylov()

    if (k.meta.complete && k.meta.count === 0) {
      return { levels: [], raw: [], complete: true, krylov: k.meta, agree: true }
    }

    // levels found (or the search stalled): the block read resolves the cluster, the Krylov count must agree
    const b = runBlock()

    return {
      ...states(b.c.levels),
      complete: b.meta.complete && (!k.meta.complete || k.meta.count === b.meta.count),
      krylov: k.meta,
      block: b.meta,
      agree: k.meta.count === b.meta.count,
    }
  }

  const b = runBlock()

  if (b.meta.complete) {
    return { ...states(b.c.levels), complete: true, block: b.meta, agree: true }
  }

  // an empty or short block window is confirmed by Krylov (traps.md E-FRC-0294)
  const k = runKrylov()

  return {
    ...states(k.r.levels),
    complete: k.meta.complete,
    krylov: k.meta,
    block: b.meta,
    agree: k.meta.count === b.meta.count,
  }
}

// ---- the flow ----

// wallCrossings' greedy nearest-first pairing within `reach`, each matched pair contributing (s(after) - s(before)) / 2,
// s the sign of the offset with s = 0 within `zero` of pi: a branch that sits exactly at pi on a sample (the two walls'
// branches meet at pi at theta 0, where the wall state's quasienergy is 0 up to rounding) counts half on each side, so the
// loop's count does not depend on the rounding's sign. up and down are the positive and negative halves, as halves
export function halfCrossings(
  before: readonly number[],
  after: readonly number[],
  reach: number,
  zero: number,
): FlowCount {
  const pairs: { i: number; j: number; dist: number }[] = []

  before.forEach((a, i) => after.forEach((b, j) => pairs.push({ i, j, dist: Math.abs(wrap(b - a)) })))
  pairs.sort((x, y) => x.dist - y.dist)

  const usedA = new Set<number>()
  const usedB = new Set<number>()
  const s = (v: number): number => (Math.abs(v) <= zero ? 0 : Math.sign(v))

  let up = 0
  let down = 0

  for (const p of pairs) {
    if (p.dist > reach || usedA.has(p.i) || usedB.has(p.j)) {
      continue
    }

    usedA.add(p.i)
    usedB.add(p.j)

    const d = (s(after[p.j]!) - s(before[p.i]!)) / 2

    if (d > 0) {
      up += d
    } else {
      down -= d
    }
  }

  return { up, down, entries: after.length - usedB.size, exits: before.length - usedA.size, unmatched: 0 }
}

export type PumpFlow = {
  A: FlowCount
  B: FlowCount
  netA: number
  netB: number
  // levels in the window with wall weight under the bulk cut, over all steps
  bulk: number
  // levels whose half weight lies in (0.2, 0.8)
  ambiguous: number
  complete: boolean
  // the last step reproduces the first: max |offset difference| (matched in order), Infinity on a count change
  closure: number
}

export function pumpFlow(
  steps: readonly { levels: readonly PumpLevel[]; raw: readonly number[]; complete: boolean }[],
  reach: number,
  bulkCut: number,
  zero = 1e-8,
): PumpFlow {
  const sum = (a: FlowCount, b: FlowCount): FlowCount => ({
    up: a.up + b.up,
    down: a.down + b.down,
    entries: a.entries + b.entries,
    exits: a.exits + b.exits,
    unmatched: 0,
  })
  const pick = (s: { levels: readonly PumpLevel[] }, onA: boolean): number[] =>
    s.levels.filter(l => l.half > 0.5 === onA).map(l => l.offset)

  let A: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }
  let B: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }

  for (let t = 0; t + 1 < steps.length; t++) {
    A = sum(A, halfCrossings(pick(steps[t]!, true), pick(steps[t + 1]!, true), reach, zero))
    B = sum(B, halfCrossings(pick(steps[t]!, false), pick(steps[t + 1]!, false), reach, zero))
  }

  const first = [...steps[0]!.raw]
  const last = [...steps[steps.length - 1]!.raw]
  const closure =
    first.length !== last.length ? Infinity : first.reduce((m, x, i) => Math.max(m, Math.abs(x - last[i]!)), 0)

  return {
    A,
    B,
    netA: A.up - A.down,
    netB: B.up - B.down,
    bulk: steps.reduce((n, s) => n + s.levels.filter(l => l.wall < bulkCut).length, 0),
    ambiguous: steps.reduce((n, s) => n + s.levels.filter(l => l.half > 0.2 && l.half < 0.8).length, 0),
    complete: steps.every(s => s.complete),
    closure,
  }
}
