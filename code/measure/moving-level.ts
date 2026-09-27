// THE BOUND LEVEL AT MOMENTUM K, AND HOW IT MOVES (E-SPN-0105, E-GRV-0121). E-SPN-0104 held E-SPN-0093's three-love level
// in one frame on the working rule, at rest (its K = 0 part). A particle must also carry momentum as a unit: a band
// E(K) with the level intact at every K. This module builds the boosted level and reads it.
//
// THE BAND (the stand-in's, code/measure/coined-line-bloch). The stand-in's one-line operator is translation invariant,
// so the centroid momentum K is conserved and at each K it has a Bloch operator U(K) on the relative configurations
// (least position 0). The level at K, phi_K, is the eigenvector followed from the K = 0 level by inverse iteration in
// small steps (followLevel), its quasi-energy E(K) unwrapped by continuity; the group velocity is dE/dK (a symmetric
// difference of eigenvalues, bandSlope) and the effective mass m* = 1 / E''(0) (bandCurvature).
//
// WHY dE/dK IS A VELOCITY (Floquet Hellmann-Feynman). U(K) = sum_s e^(-iKs) U_s, s the shift of the least position in
// one beat. From U psi = e^(-iE) psi: <psi| U^dagger dU/dK |psi> = -i dE/dK, and U^dagger dU/dK = -i U^dagger S U with S
// the shift, so dE/dK is the expected shift per beat of an eigenstate, and for a stationary relative state the expected
// shift is the expected step of the centroid. The step of the centroid in one beat is exact on every branch: the stream
// moves each love one position, label 0 forward and label 1 back, and the labels the stream reads are the ones the
// branch carries after the beat, so the centroid's step is (n0 - n1) / 3 (transport). The velocity read here is the
// rule's own; the one predicted is a derivative of the stand-in's eigenvalues.
//
// THE COVER. The transport along the working vacuum's axis line is flat except for the ring's holonomy h (E-SPN-0104).
// A love placed in one frame, point T(0 -> x)(0) at x, that goes once round the ring comes back with point
// T(0 -> x)(h(0)). The orbit of point 0 under h has length m, so the sector of clusters held in one frame lives on a
// cover of m L positions: lifted position y sits at ring position y mod L with point T(0 -> y mod L)(h^s(0)), s the
// sheet floor(y / L) mod m. The translation by one position (with its transport) is a symmetry of the rule on this
// sector, so K is conserved in steps of 2 pi / (m L).
//
// THE BOOSTED LEVEL (blochEntries): sum over lifted anchors Y of e^(iKY) |Y + phi_K>, each love at its lifted position
// in the cover's frame, normalized, rounded into Z[w] / 2^P (the rounding is the start's alone). The cut trit c of the
// drift cost's register is the one that keeps the string inside the cluster (the flux on the link before the anchor
// 0): c = -(the loves at ring positions below the anchor's) mod 3. For three loves the reordering sign between the
// stand-in's order (lifted) and the ring's order (from the cut) is a cyclic shift, even: no sign.
//
// NOTHING MOVES: the placement writes a start; the rule takes every value. The floats are measurement.

import { lineReduced, type LineBasis, type LineLevel, type SubBasis } from '@/code/measure/coined-line-bloch'
import { inverseIterate } from '@/code/measure/drift-cost-bloch'
import { type Vec } from '@/code/measure/quantum-ladder'
import { cloneConfiguration, mergeBranches, type Branch, type Configuration } from '@/code/rule/doublet-locked-knit'
import { type BoundState } from '@/code/rule/bound-line-pieces'
import { eisenstein, eisensteinValue, type AxisRing, type PointLove } from '@/code/measure/held-cluster'
import { pointKeyOf, type CutState } from '@/code/measure/bound-line'
import { type LineGauge } from '@/code/measure/permutation-meeting'

type C = [number, number]

// ---- the band ----

export type BandPoint = { K: number; energy: number; vector: Vec; residual: number; overlap: number }

// the level followed from K = 0 by inverse iteration in steps of at most `step`, read at each K of `ks` (increasing, the
// first 0 or more): energy unwrapped by continuity, the vector in the configuration basis (whole basis), the least
// consecutive overlap on the way
export function followLevel(basis: LineBasis, sub: SubBasis, start: LineLevel, ks: readonly number[], step: number): BandPoint[] {
  const dim = sub.vectors.length
  let prev: Vec = { re: Float64Array.from(start.cre), im: Float64Array.from(start.cim) }
  let K = 0
  let energy = start.unwrapped
  let leastOverlap = 1
  let residual = 0
  const out: BandPoint[] = []

  if (dim !== basis.configs.length) throw new Error('moving-level: followLevel reads the whole basis')

  for (const target of ks) {
    while (K < target - 1e-15) {
      const next = Math.min(target, K + step)
      const it = inverseIterate(lineReduced(basis, sub, next), prev, 6)
      let r = 0
      let i = 0
      let n1 = 0
      let n2 = 0

      for (let a = 0; a < dim; a++) {
        r += (prev.re[a] as number) * (it.vector.re[a] as number) + (prev.im[a] as number) * (it.vector.im[a] as number)
        i += (prev.re[a] as number) * (it.vector.im[a] as number) - (prev.im[a] as number) * (it.vector.re[a] as number)
        n1 += (prev.re[a] as number) ** 2 + (prev.im[a] as number) ** 2
        n2 += (it.vector.re[a] as number) ** 2 + (it.vector.im[a] as number) ** 2
      }

      leastOverlap = Math.min(leastOverlap, Math.hypot(r, i) / Math.sqrt(n1 * n2))
      residual = Math.max(residual, it.residual)
      energy = it.energy + 2 * Math.PI * Math.round((energy - it.energy) / (2 * Math.PI))
      prev = it.vector
      K = next
    }

    out.push({ K, energy, vector: { re: Float64Array.from(prev.re), im: Float64Array.from(prev.im) }, residual, overlap: leastOverlap })
  }

  return out
}

// the level's energy at K + d from its vector at K (one inverse iteration), unwrapped nearest E(K)
function energyNear(basis: LineBasis, sub: SubBasis, at: BandPoint, K: number): number {
  const it = inverseIterate(lineReduced(basis, sub, K), at.vector, 6)

  return it.energy + 2 * Math.PI * Math.round((at.energy - it.energy) / (2 * Math.PI))
}

// dE/dK at a band point, a symmetric difference of eigenvalues
export function bandSlope(basis: LineBasis, sub: SubBasis, at: BandPoint, d: number): number {
  return (energyNear(basis, sub, at, at.K + d) - energyNear(basis, sub, at, at.K - d)) / (2 * d)
}

// E''(K) at a band point, a second difference of eigenvalues
export function bandCurvature(basis: LineBasis, sub: SubBasis, at: BandPoint, d: number): number {
  return (energyNear(basis, sub, at, at.K + d) + energyNear(basis, sub, at, at.K - d) - 2 * at.energy) / (d * d)
}

// ---- the cover and the boosted placement ----

// the orbit of point 0 under the ring's holonomy: [0, h(0), h(h(0)), ...]
export function pointOrbit(gauge: LineGauge): number[] {
  const orbit = [0]

  for (;;) {
    const next = gauge.holonomy[orbit[orbit.length - 1] as number] as number

    if (next === 0) return orbit
    orbit.push(next)
  }
}

// the cut trit that keeps the string inside the cluster, anchored at ring position `anchor`
export function tightCut(xs: readonly number[], anchor: number): number {
  const below = xs.filter(x => x < anchor).length

  return (3 - (below % 3)) % 3
}

export type Entry = { ts: PointLove[]; c: number; a: bigint; b: bigint }

export type Boosted = { entries: Entry[]; cover: number; dropped: number; weight: number }

// the boosted level on a ring of `gauge.L`: sum over the cover's anchors Y of e^(iKY) phi(config), each love in the
// cover's frame, normalized over the cover; configurations with two loves on one slot of the ring are dropped (their
// weight reported), coincident ones added, then every amplitude rounded into Z[w] / 2^P. `anchors` keeps only those
// anchors (a piece of the Bloch state, for an exact window small enough to run), each times its `envelope` weight when
// one is given (a packet: the level at K under an envelope over the anchors, not normalized)
export function blochEntries(gauge: LineGauge, basis: LineBasis, vector: Vec, K: number, P: number, anchors?: readonly number[], envelope?: readonly number[]): Boosted {
  const L = gauge.L
  const orbit = pointOrbit(gauge)
  const cover = orbit.length * L
  const scale = 1 / Math.sqrt(cover)
  const acc = new Map<string, { ts: PointLove[]; c: number; amp: C }>()
  let dropped = 0

  for (const [n, Y] of (anchors ?? [...Array(cover).keys()]).entries()) {
    const g = envelope === undefined ? scale : (envelope[n] as number)
    const cos = Math.cos(K * Y) * g
    const sin = Math.sin(K * Y) * g

    basis.configs.forEach((config, i) => {
      const zr = vector.re[i] as number
      const zi = vector.im[i] as number

      if (zr === 0 && zi === 0) return

      const ts = config.map(t => {
        const y = Y + t.x
        const x = y % L
        const sheet = Math.floor(y / L) % orbit.length

        return { x, j: t.j, p: (gauge.to[x] as number[])[orbit[sheet] as number] as number }
      })
      const amp: C = [zr * cos - zi * sin, zr * sin + zi * cos]

      if (new Set(ts.map(t => 2 * t.x + t.j)).size !== ts.length) {
        dropped += amp[0] ** 2 + amp[1] ** 2
        return
      }

      const c = tightCut(
        ts.map(t => t.x),
        Y % L,
      )
      const key = `${pointKeyOf(ts)}#${c}`
      const o = acc.get(key)

      if (o) o.amp = [o.amp[0] + amp[0], o.amp[1] + amp[1]]
      else acc.set(key, { ts, c, amp })
    })
  }

  const entries: Entry[] = []
  let weight = 0

  for (const { ts, c, amp } of acc.values()) {
    const { a, b } = eisenstein(amp[0], amp[1], P)

    if (a === 0n && b === 0n) continue
    entries.push({ ts, c, a, b })

    const v = eisensteinValue(a, b, P)

    weight += v[0] ** 2 + v[1] ** 2
  }

  return { entries, cover, dropped, weight }
}

// the entries as the ring form's state
export function cutStart(entries: readonly Entry[], P: number): CutState {
  const out: CutState = new Map()

  for (const { ts, c, a, b } of entries) {
    const key = `${pointKeyOf(ts)}#${c}`
    const v = eisensteinValue(a, b, P)
    const o = out.get(key)

    if (o) o.amp = [o.amp[0] + v[0], o.amp[1] + v[1]]
    else out.set(key, { ts: ts.map(t => ({ ...t })), c, amp: v })
  }

  return out
}

// the entries as the exact rule's state on a base configuration: one slice per cut trit, clock count 0
export function exactStart(base: Configuration, ring: AxisRing, entries: readonly Entry[], P: number): BoundState {
  const bySlice = new Map<number, Branch[]>()

  for (const { ts, c, a, b } of entries) {
    const conf = cloneConfiguration(base)

    for (const t of ts) {
      const slot = (ring.docks[t.x] as number) * 24 + (t.j === 0 ? ring.first : ring.second)

      if (conf.vibe[slot] !== 0) throw new Error('moving-level: a placed love lands on a held slot')
      conf.vibe[slot] = 1
      conf.point[slot] = t.p
      conf.open[slot] = 1
    }

    const list = bySlice.get(c) ?? []

    list.push({ ...conf, a, b, k: P })
    bySlice.set(c, list)
  }

  const out: BoundState = new Map()

  for (const [c, list] of [...bySlice].sort((u, v) => u[0] - v[0])) out.set(`0,${c}`, { e: 0, c, branches: mergeBranches(list) })

  return out
}

// ---- readings of a ring-form state ----

// <a|b> over the full keys (positions, labels, points, cut trit)
export function overlap(a: CutState, b: CutState): C {
  let re = 0
  let im = 0

  for (const [k, x] of a) {
    const y = b.get(k)

    if (!y) continue
    re += x.amp[0] * y.amp[0] + x.amp[1] * y.amp[1]
    im += x.amp[0] * y.amp[1] - x.amp[1] * y.amp[0]
  }

  return [re, im]
}

export function weightOf(s: CutState): number {
  let w = 0

  for (const { amp } of s.values()) w += amp[0] ** 2 + amp[1] ** 2

  return w
}

// the centroid's expected step in the beat that produced this state: (n0 - n1) / n on every branch, n the loves
export function transport(s: CutState): number {
  let v = 0
  let w = 0

  for (const { ts, amp } of s.values()) {
    const p = amp[0] ** 2 + amp[1] ** 2
    const n0 = ts.filter(t => t.j === 0).length

    v += (p * (2 * n0 - ts.length)) / ts.length
    w += p
  }

  return v / w
}

// the sum of two ring-form states (a packet of two momenta), each scaled by `scale`
export function sumStates(a: CutState, b: CutState, scale: number): CutState {
  const out: CutState = new Map()

  for (const s of [a, b]) {
    for (const [k, x] of s) {
      const o = out.get(k)

      if (o) o.amp = [o.amp[0] + scale * x.amp[0], o.amp[1] + scale * x.amp[1]]
      else out.set(k, { ts: x.ts, c: x.c, amp: [scale * x.amp[0], scale * x.amp[1]] })
    }
  }

  return out
}

// the angle of a ring density's first circular moment
export function circularAngle(density: Float64Array): number {
  const L = density.length
  let c = 0
  let s = 0

  density.forEach((v, x) => {
    c += v * Math.cos((2 * Math.PI * x) / L)
    s += v * Math.sin((2 * Math.PI * x) / L)
  })

  return Math.atan2(s, c)
}

// a ring density read at x + s for every x (s any real): the trigonometric interpolation of its Fourier series, the
// Nyquist term (even L) taken as its cosine so the result stays real. Measurement: the co-moving frame's reading
export function shiftRing(density: Float64Array, s: number): Float64Array {
  const L = density.length
  const out = new Float64Array(L)

  for (let q = 0; q <= Math.floor(L / 2); q++) {
    let re = 0
    let im = 0

    density.forEach((v, x) => {
      re += v * Math.cos((2 * Math.PI * q * x) / L)
      im -= v * Math.sin((2 * Math.PI * q * x) / L)
    })

    const both = q === 0 || 2 * q === L ? 1 : 2

    for (let x = 0; x < L; x++) {
      const th = (2 * Math.PI * q * (x + s)) / L

      out[x]! += (both * (re * Math.cos(th) - (2 * q === L ? 0 : im * Math.sin(th)))) / L
    }
  }

  return out
}

// the rms distance of a ring density from its circular center (the width of a lump on the line)
export function ringWidth(density: Float64Array): number {
  const L = density.length
  const center = ((circularAngle(density) * L) / (2 * Math.PI) + L) % L
  let m2 = 0
  let w = 0

  density.forEach((v, x) => {
    let d = (((x - center) % L) + L) % L

    if (d > L / 2) d -= L
    m2 += v * d * d
    w += v
  })

  return Math.sqrt(m2 / w)
}

// a sequence of angles unwrapped by continuity
export function unwrapAngles(angles: readonly number[]): number[] {
  const out: number[] = []

  for (const a of angles) {
    if (out.length === 0) {
      out.push(a)
      continue
    }

    const last = out[out.length - 1] as number

    out.push(a + 2 * Math.PI * Math.round((last - a) / (2 * Math.PI)))
  }

  return out
}

// least squares y = a + b x
export function lineFit(xs: readonly number[], ys: readonly number[]): { a: number; b: number } {
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length
  const b = xs.reduce((s, v, i) => s + (v - mx) * ((ys[i] as number) - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0)

  return { a: my - b * mx, b }
}

// ---- one boosted run of the ring form (E-SPN-0105, E-SPN-0106) ----

export type BoostedRun = { K: number; fidelity: number[]; least: number; energy: number; velocity: number; angles: number[]; size: number }

// `beats` beats of `step` from s0: the fidelity with the start at every beat (every key), the energy (minus the slope of
// the start overlap's unwrapped phase, fitted linear over beats 0 .. beats), the transported centroid per beat, the
// density's circular angle unwrapped, the largest state
export function boostedRun(step: (s: CutState) => CutState, s0: CutState, K: number, beats: number, density: (s: CutState) => Float64Array): BoostedRun {
  let s = s0
  const w0 = weightOf(s0)
  const fidelity: number[] = []
  const phases: number[] = [0]
  const angles: number[] = [circularAngle(density(s0))]
  let X = 0
  let size = s0.size

  for (let t = 1; t <= beats; t++) {
    s = step(s)
    X += transport(s)
    size = Math.max(size, s.size)

    const o = overlap(s0, s)

    fidelity.push((o[0] ** 2 + o[1] ** 2) / (w0 * weightOf(s)))
    phases.push(Math.atan2(o[1], o[0]))
    angles.push(circularAngle(density(s)))
  }

  const u = unwrapAngles(phases)
  const fit = lineFit(
    u.map((_, t) => t),
    u,
  )

  return { K, fidelity, least: Math.min(...fidelity), energy: -fit.b, velocity: X / beats, angles: unwrapAngles(angles), size }
}

// E(K) - E(0) = alpha K^2 + beta K^4, least squares over the nonzero K (the first point is K = 0): m* = 1 / (2 alpha)
export function quarticMass(points: readonly { K: number; energy: number }[]): { mass: number; alpha: number; beta: number } {
  const e0 = (points[0] as { energy: number }).energy
  const rows = points.slice(1).map(r => ({ x2: r.K ** 2, x4: r.K ** 4, y: r.energy - e0 }))
  const s22 = rows.reduce((s, r) => s + r.x2 * r.x2, 0)
  const s24 = rows.reduce((s, r) => s + r.x2 * r.x4, 0)
  const s44 = rows.reduce((s, r) => s + r.x4 * r.x4, 0)
  const s2y = rows.reduce((s, r) => s + r.x2 * r.y, 0)
  const s4y = rows.reduce((s, r) => s + r.x4 * r.y, 0)
  const det = s22 * s44 - s24 * s24
  const alpha = (s2y * s44 - s4y * s24) / det
  const beta = (s22 * s4y - s24 * s2y) / det

  return { mass: 1 / (2 * alpha), alpha, beta }
}

// least squares y = a + k / r
export function inverseFit(rs: readonly number[], ys: readonly number[]): { a: number; k: number } {
  const f = lineFit(
    rs.map(r => 1 / r),
    ys,
  )

  return { a: f.a, k: f.b }
}

// ---- the lone love's band in closed form (the calibration) ----
//
// One love, no pieces: the coin keeps with (1 + w)/2 = e^(i pi/3)/2 and crosses with (1 - w)/2, then label 0 steps
// forward and label 1 back. On sum_X e^(iKX) (a0 |X, 0> + a1 |X, 1>) one beat is U(K) = diag(e^(-iK), e^(iK)) C, with
// trace e^(i pi/3) cos K and determinant det C = w, so its eigenvalues are e^(i(pi/3 +- eps)), cos eps = cos(K) / 2, and
// the quasi-energies (minus the phase) are -pi/3 -+ eps. The band through E = 0 at K = 0 is E(K) = eps(K) - pi/3,
// centered on -pi/3 with half-gap pi/3, curvature E''(0) = cot(pi/3) = 1/sqrt 3, so m* = tan(pi/3) = sqrt 3: the
// lattice Dirac walk's m* = tan(m) for half-gap m (m* -> m, the relativistic value, only as m -> 0).
export function loneBand(K: number): { energy: number; slope: number; vector: C[] } {
  const eps = Math.acos(Math.cos(K) / 2)
  const energy = eps - Math.PI / 3
  const slope = Math.sin(K) / 2 / Math.sin(eps)
  // eigenvector of U(K) for eigenvalue lambda = e^(-i energy): (U - lambda) v = 0 from the first row,
  // e^(-iK) (k0 a0 + c0 a1) = lambda a0, k0 = e^(i pi/3)/2, c0 = (1 - w)/2
  const lambda: C = [Math.cos(energy), -Math.sin(energy)]
  const k0: C = [0.25, Math.sqrt(3) / 4]
  const c0: C = [0.75, -Math.sqrt(3) / 4]
  const eK: C = [Math.cos(K), -Math.sin(K)]
  const cm = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
  // a1 = (lambda - e^(-iK) k0) / (e^(-iK) c0) a0, with a0 = e^(-iK) c0: a1 = lambda - e^(-iK) k0
  const a0 = cm(eK, c0)
  const ek = cm(eK, k0)
  const a1: C = [lambda[0] - ek[0], lambda[1] - ek[1]]
  const n = Math.sqrt(a0[0] ** 2 + a0[1] ** 2 + a1[0] ** 2 + a1[1] ** 2)

  return { energy, slope, vector: [[a0[0] / n, a0[1] / n], [a1[0] / n, a1[1] / n]] }
}

// the lone love's Bloch state on the ring's cover (no cost: the cut trit stays 0 and is carried as 0)
export function loneEntries(gauge: LineGauge, K: number, P: number): Entry[] {
  const L = gauge.L
  const orbit = pointOrbit(gauge)
  const cover = orbit.length * L
  const scale = 1 / Math.sqrt(cover)
  const { vector } = loneBand(K)
  const out: Entry[] = []

  for (let Y = 0; Y < cover; Y++) {
    const x = Y % L
    const p = (gauge.to[x] as number[])[orbit[Math.floor(Y / L) % orbit.length] as number] as number

    for (const j of [0, 1]) {
      const z = vector[j] as C
      const re = (z[0] * Math.cos(K * Y) - z[1] * Math.sin(K * Y)) * scale
      const im = (z[0] * Math.sin(K * Y) + z[1] * Math.cos(K * Y)) * scale
      const { a, b } = eisenstein(re, im, P)

      if (a !== 0n || b !== 0n) out.push({ ts: [{ x, j, p }], c: 0, a, b })
    }
  }

  return out
}
