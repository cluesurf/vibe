// "Mass makes the column deeper, and depth slows light" (E-GRV-0070, E-GRV-0071): can the husk light of code/rule/
// trit-column run with a depth that varies from column to column, and does a deep patch then act on light as a
// medium of index n(D) = c(D0) / c(D) would?
//
// THE RULE. The husk integer rule of code/rule/trit-husk (fastBeat, the wave form), which equals the trit rule bit
// for bit at one depth (E-FRC-0207, 0210). Every place the depth D enters that rule is a parameter of ONE husk
// object, so the per-column rule is the same beat with each parameter read from its own object's column:
//   a husk link      its angle window, 4D on an axis and 2D on a diagonal, from the column of the dock it starts at
//   a husk triangle  q = 2D + 1 (the counter's column range), h = D (the counter's centering), the field modulus
//                    N_B = 4D, the potential window n_P D, all from the column of its FIRST link's start dock (the
//                    triangle's anchor: a boundary choice, disclosed)
// so kappa_P = 2p / q_P per triangle, and c(D) = sqrt(2 kappa / 3) = 2 / sqrt(3 (2D + 1)) inside a region of one
// depth. With every column at one depth the beat IS fastBeat (checked bit for bit by the callers).
//
// WHAT THE BOUNDARY NEEDS (stated, not hidden). The beat stays a bijection whatever the depths, since every step
// is per object given what it reads (the drift a shear, each counter update invertible given the field and the lag,
// every wrap a cycling number), so exact reversal and Gauss (the flux S - C^T U has no divergence for any U) hold
// with no new machinery. Two things do not carry over:
//   1. the wave form's spatial term reads the NEIGHBORS' counters D_P' through C W C^T and divides by the triangle's
//      own q_P, where the shadow that makes the wave form the exact linear leapfrog needs D_P' / q_P'. Away from a
//      boundary the two agree; on a boundary triangle they differ by a bounded amount each beat (a carry error, not
//      a growing one). Making it exact needs a counter of modulus lcm(q_P, q_P') q_P, which is not its column's
//      own range: new machinery. The runs measure what the bounded error costs
//   2. the compact wraps: a boundary triangle's field modulus 4 D_P and its links' windows 4 D or 2 D of other
//      columns do not nest, so the angle seam is a choice. Every run counts its wraps; a run with none never
//      exercises the choice
// And in the BULK, a varying depth is not the existing lattice at all: the D4 bulk has period 2D along x4, and a
// root e_i +- e4 joins level m of one column to level m or m +- 1 of the next, so two columns of different period
// have no consistent joining at their wrap. The trit rule itself would need a seam in the bulk. So this medium is
// the husk integer rule with per-column parameters, a STAND-IN for a variable-depth bulk that does not exist.
//
// THE PACKET. A plane wave of polarization y moving along x, uniform in y and z: the line integral of a(x) y-hat
// along each link, with the diagonal's weight w = 2 (a diagonal husk angle is half its line integral, so a uniform
// vector potential has zero plaquette field on every triangle: checked). On a half grid u = 2x (u = 2x + 1 at a
// link's midpoint in x), G(u) = floor(amp (W^2 - (u - u0)^2)^2 / W^4) for |u - u0| < W and 0 outside, integers
// only. Axis y links get 2 G(2x), the (0, 1, +-1) diagonals G(2x), the (1, 1, 0) diagonal G(2x + 1), the (1, -1, 0)
// diagonal -G(2x + 1), every other link 0. E starts at 0, so the packet splits into halves moving along +x and -x.
//
// THE READING (floats, measurement only). At a detector dock, r(t) = the sum over its 9 out-links of A^2 after beat
// t. Its ARRIVAL is the centroid sum t r / sum r over the beats of 1 .. window where r is at least half its largest
// value (the window ends before the -x half comes round the torus). The half-maximum cut keeps the small integer
// residue the counters leave behind a packet out of the centroid (disclosed probe: tmp/grv70-probe1.ts, where the
// whole-window centroid read D = 16 at 0.238 and 0.218 against c = 0.201). A speed is a distance over the
// difference of two arrivals.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { fastBeat, geometryOfBulk, huskGeometryBox, makeHuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { bulkFlux, bulkGaussViolations, columnSumLinks, emptyTritState, huskGaussViolations, makeTritLight, readHusk, tritLightBeat, type HuskLightState } from '@/code/rule/trit-column'
import { BEATS, CONFIGS, DEPTH, PULSE, REACH, SIDE, huskDock, kick, placeLump, type LumpConfig } from '@/code/measure/depth-lump'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export const lightSpeed = (d: number): number => 2 / Math.sqrt(3 * (2 * d + 1))

export type Medium = {
  readonly geometry: HuskGeometry
  readonly sides: readonly [number, number, number]
  readonly dockDepth: Int32Array
  readonly linkWindow: Int32Array
  readonly triDepth: Int32Array
  readonly p: number
  readonly flux: Int32Array
  readonly field: Int32Array
  readonly curl: Int32Array
}

export type Wraps = { angle: number; field: number; potential: number }

export const noWraps = (): Wraps => ({ angle: 0, field: 0, potential: 0 })

export function makeMedium(sides: readonly [number, number, number], depthAt: (x: number, y: number, z: number) => number, p = 1, given?: HuskGeometry): Medium {
  const [sx, sy, sz] = sides
  const geometry = given ?? huskGeometryBox(sx, sy, sz)
  const dockDepth = new Int32Array(geometry.huskDocks)

  for (let y = 0; y < geometry.huskDocks; y++) {
    dockDepth[y] = depthAt(y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy)))
  }

  const linkWindow = Int32Array.from({ length: geometry.huskLinks }, (_, l) => (l % 9 < 3 ? 4 : 2) * dockDepth[Math.floor(l / 9)]!)
  const triDepth = Int32Array.from({ length: geometry.triangles }, (_, t) => dockDepth[Math.floor(geometry.triLinks[t * 3]! / 9)]!)

  return {
    geometry,
    sides,
    dockDepth,
    linkWindow,
    triDepth,
    p,
    flux: new Int32Array(geometry.huskLinks),
    field: new Int32Array(geometry.triangles),
    curl: new Int32Array(geometry.huskLinks),
  }
}

export function emptyState(m: Medium): HuskLightState {
  const g = m.geometry

  return {
    angle: new Int32Array(g.huskLinks),
    potential: new Int32Array(g.triangles),
    counter: new Int32Array(g.triangles),
    lag: new Int32Array(g.triangles),
    spatial: new Int32Array(g.triangles),
    string: new Int32Array(g.huskLinks),
  }
}

export function copyState(s: HuskLightState): HuskLightState {
  return {
    angle: Int32Array.from(s.angle),
    potential: Int32Array.from(s.potential),
    counter: Int32Array.from(s.counter),
    lag: Int32Array.from(s.lag),
    spatial: Int32Array.from(s.spatial),
    string: Int32Array.from(s.string),
  }
}

const FIELDS = ['angle', 'potential', 'counter', 'lag', 'spatial', 'string'] as const

export const sameState = (a: HuskLightState, b: HuskLightState): boolean => FIELDS.every(f => a[f].every((v, i) => v === b[f][i]))

// out = S - C^T U
function flux(m: Medium, s: HuskLightState): void {
  const g = m.geometry
  const out = m.flux

  out.set(s.string)

  for (let t = 0; t < g.triangles; t++) {
    const u = s.potential[t]!

    if (u === 0) continue

    for (let j = t * 3; j < t * 3 + 3; j++) {
      out[g.triLinks[j]!] = out[g.triLinks[j]!]! - g.triSigns[j]! * u
    }
  }
}

function curlWeighted(g: HuskGeometry, x: Int32Array, t: number): number {
  const b = t * 3
  const l0 = g.triLinks[b]!
  const l1 = g.triLinks[b + 1]!
  const l2 = g.triLinks[b + 2]!

  return g.triSigns[b]! * g.weight[l0 % 9]! * x[l0]! + g.triSigns[b + 1]! * g.weight[l1 % 9]! * x[l1]! + g.triSigns[b + 2]! * g.weight[l2 % 9]! * x[l2]!
}

function curlT(m: Medium, x: Int32Array): void {
  const g = m.geometry

  m.curl.fill(0)

  for (let t = 0; t < g.triangles; t++) {
    const v = x[t]!

    if (v === 0) continue

    for (let j = t * 3; j < t * 3 + 3; j++) {
      m.curl[g.triLinks[j]!] = m.curl[g.triLinks[j]!]! + g.triSigns[j]! * v
    }
  }
}

function fields(m: Medium, s: HuskLightState, wraps?: Wraps): void {
  const g = m.geometry

  for (let t = 0; t < g.triangles; t++) {
    const nb = 4 * m.triDepth[t]!
    const raw = curlWeighted(g, s.angle, t)
    const v = mod(raw + nb / 2, nb) - nb / 2

    if (wraps && v !== raw) wraps.field++
    m.field[t] = v
  }
}

// one beat of the wave form with per-column depth, in place
export function mediumBeat(m: Medium, s: HuskLightState, wraps?: Wraps): void {
  const g = m.geometry
  const pp = m.p

  flux(m, s)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = m.linkWindow[l]!
    const raw = s.angle[l]! + m.flux[l]!
    const v = mod(raw + n / 2, n) - n / 2

    if (wraps && v !== raw) wraps.angle++
    s.angle[l] = v
  }

  fields(m, s, wraps)
  curlT(m, s.counter)

  for (let t = 0; t < g.triangles; t++) {
    const h = m.triDepth[t]!
    const q = 2 * h + 1
    const n = g.multiplicity[t]!
    const sp = n * pp * curlWeighted(g, m.curl, t)
    const v = floorDiv(sp + s.spatial[t]! + h, q)

    s.spatial[t] = sp + s.spatial[t]! - q * v

    const rest = n * pp * m.field[t]! - 2 * s.counter[t]! + s.lag[t]! + v
    const k = floorDiv(rest + h, q)

    s.lag[t] = s.counter[t]!
    s.counter[t] = q * k - rest

    const w = n * h
    const raw = s.potential[t]! + k
    const u = mod(raw + w, 2 * w + 1) - w

    if (wraps && u !== raw) wraps.potential++
    s.potential[t] = u
  }
}

// the inverse beat
export function mediumBeatBack(m: Medium, s: HuskLightState): void {
  const g = m.geometry
  const pp = m.p

  fields(m, s)
  curlT(m, s.lag)

  for (let t = 0; t < g.triangles; t++) {
    const h = m.triDepth[t]!
    const q = 2 * h + 1
    const n = g.multiplicity[t]!
    const sp = n * pp * curlWeighted(g, m.curl, t)
    const r2 = s.spatial[t]!
    const v = floorDiv(sp - r2 + h, q)

    s.spatial[t] = r2 - sp + q * v

    const next = s.counter[t]!
    const now = s.lag[t]!
    const y = -next - n * pp * m.field[t]! + 2 * now - v
    const k = floorDiv(h - y, q)

    s.counter[t] = now
    s.lag[t] = q * k + y

    const w = n * h

    s.potential[t] = mod(s.potential[t]! - k + w, 2 * w + 1) - w
  }

  flux(m, s)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = m.linkWindow[l]!

    s.angle[l] = mod(s.angle[l]! - m.flux[l]! + n / 2, n) - n / 2
  }
}

// husk docks where the divergence of the flux S - C^T U is not the charge (zero here: no strings are placed)
export function gaussViolations(m: Medium, s: HuskLightState): number {
  const g = m.geometry

  flux(m, s)

  const div = new Int32Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    const a = Math.floor(l / 9)
    const b = g.huskNeighbour[l]!

    div[a] = div[a]! + m.flux[l]!
    div[b] = div[b]! - m.flux[l]!
  }

  return div.reduce((c, v) => c + (v === 0 ? 0 : 1), 0)
}

// the largest plaquette field any triangle holds for a uniform y vector potential of size a (0: the discretization
// is curl free, the check that the diagonal takes half its line integral)
export function uniformCurl(m: Medium, a: number): number {
  const s = emptyState(m)
  const g = m.geometry

  for (let y = 0; y < g.huskDocks; y++) {
    const at = y * 9

    s.angle[at + 1] = 2 * a
    s.angle[at + 3] = a
    s.angle[at + 4] = -a
    s.angle[at + 7] = a
    s.angle[at + 8] = a
  }

  let top = 0

  for (let t = 0; t < g.triangles; t++) top = Math.max(top, Math.abs(curlWeighted(g, s.angle, t)))

  return top
}

// G(u) on the half grid, integers only
export function profile(u: number, u0: number, amp: number, w: number): number {
  const d = u - u0

  if (Math.abs(d) >= w) return 0

  return floorDiv(amp * (w * w - d * d) ** 2, w ** 4)
}

// the plane packet centered at x0 (half grid u0 = 2 x0)
export function planarPacket(m: Medium, x0: number, amp: number, w: number): HuskLightState {
  const s = emptyState(m)
  const [sx] = m.sides
  const g = m.geometry

  for (let y = 0; y < g.huskDocks; y++) {
    const x = y % sx
    const at = y * 9
    const even = profile(2 * x, 2 * x0, amp, w)
    const odd = profile(2 * x + 1, 2 * x0, amp, w)

    s.angle[at + 1] = 2 * even
    s.angle[at + 7] = even
    s.angle[at + 8] = even
    s.angle[at + 3] = odd
    s.angle[at + 4] = -odd
  }

  return s
}

export const dockAt = (m: Medium, x: number, y: number, z: number): number => {
  const [sx, sy, sz] = m.sides

  return mod(x, sx) + sx * mod(y, sy) + sx * sy * mod(z, sz)
}

export function dockWeight(s: HuskLightState, dock: number): number {
  let v = 0

  for (let h = 0; h < 9; h++) v += s.angle[dock * 9 + h]! ** 2

  return v
}

// the centroid in time over the beats where r is at least half its largest value (NaN if r is never above 0)
export function halfMaxCentroid(r: Float64Array): number {
  const top = r.reduce((a, v) => Math.max(a, v), 0)
  let st = 0
  let s = 0

  for (let t = 0; t < r.length; t++) {
    if (top > 0 && r[t]! >= top / 2) {
      st += t * r[t]!
      s += r[t]!
    }
  }

  return s > 0 ? st / s : Number.NaN
}

export type Run = {
  // per detector, the arrival centroid in beats
  readonly arrival: number[]
  // per detector, the total weight read (for the reader's own sanity)
  readonly weight: number[]
  readonly wraps: Wraps
  readonly gauss: number
  readonly reversed: boolean
  readonly minDepth: number
  readonly seconds: number
}

// run a planar packet forward `window` beats, reading every detector dock after each beat, then run it back to
// the start and compare bit for bit; Gauss is counted every `gaussEvery` beats
export function runPacket(m: Medium, start: HuskLightState, detectors: readonly number[], window: number, gaussEvery = 1): Run {
  const t0 = Date.now()
  const s = copyState(start)
  const wraps = noWraps()
  const trace = detectors.map(() => new Float64Array(window + 1))
  let gauss = gaussViolations(m, s)

  for (let t = 1; t <= window; t++) {
    mediumBeat(m, s, wraps)

    detectors.forEach((d, i) => {
      trace[i]![t] = dockWeight(s, d)
    })

    if (t % gaussEvery === 0) gauss += gaussViolations(m, s)
  }

  for (let t = 0; t < window; t++) mediumBeatBack(m, s)

  return {
    arrival: trace.map(halfMaxCentroid),
    weight: trace.map(r => r.reduce((a, v) => a + v, 0)),
    wraps,
    gauss,
    reversed: sameState(s, start),
    minDepth: m.dockDepth.reduce((a, v) => Math.min(a, v), Infinity),
    seconds: (Date.now() - t0) / 1000,
  }
}

// triangles whose spatial term reads a counter of a triangle at another depth (the boundary of item 1 above)
export function boundaryTriangles(m: Medium): number {
  const g = m.geometry
  const linkDepths = new Map<number, Set<number>>()

  for (let t = 0; t < g.triangles; t++) {
    for (let j = t * 3; j < t * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const set = linkDepths.get(l) ?? new Set<number>()

      set.add(m.triDepth[t]!)
      linkDepths.set(l, set)
    }
  }

  let count = 0

  for (let t = 0; t < g.triangles; t++) {
    let mixed = false

    for (let j = t * 3; j < t * 3 + 3; j++) {
      const set = linkDepths.get(g.triLinks[j]!)

      if (set && (set.size > 1 || !set.has(m.triDepth[t]!))) mixed = true
    }

    if (mixed) count++
  }

  return count
}

// ---------------------------------------------------------------------------------------------------------
// ray optics for a cylinder of radius R and relative index n (measurement): a ray parallel to x at impact b enters,
// refracts twice by Snell's law, and reaches the plane x = X (from the center). Returns the exit y, the extra time
// over the straight run at speed c0 (in beats), and the deflection angle (negative: toward the center for b > 0)

export function diskRay(b: number, r: number, n: number, x: number, c0: number): { y: number; delay: number; angle: number } {
  if (Math.abs(b) >= r) return { y: b, delay: 0, angle: 0 }

  const sign = Math.sign(b)
  const a = Math.abs(b)
  const ti = Math.asin(a / r)
  const tt = Math.asin(a / (n * r))
  const chord = 2 * r * Math.cos(tt)
  const x1 = -r * Math.cos(ti)
  const y1 = a
  const turn = ti - tt
  const x2 = x1 + chord * Math.cos(turn)
  const y2 = y1 - chord * Math.sin(turn)
  const delta = 2 * turn
  const rest = (x - x2) / Math.cos(delta)
  const yOut = y2 - (x - x2) * Math.tan(delta)
  const path = chord * n + rest
  const straight = x - x1

  return { y: sign * yOut, delay: (path - straight) / c0, angle: -sign * delta }
}

// the ray-optics delay and angle at exit height y, by scanning impacts (the map b -> y is monotone before the focus)
export function diskEikonal(y: number, r: number, n: number, x: number, c0: number): { delay: number; angle: number; impact: number } {
  if (Math.abs(y) >= r) {
    // rays beside the disk are straight; the refracted fan stays inside |y| < r before the focus
    return { delay: 0, angle: 0, impact: y }
  }

  const steps = 20000
  let best = { delay: 0, angle: 0, impact: 0, gap: Infinity }

  for (let i = -steps + 1; i < steps; i++) {
    const b = (r * i) / steps
    const ray = diskRay(b, r, n, x, c0)
    const gap = Math.abs(ray.y - y)

    if (gap < best.gap) best = { delay: ray.delay, angle: ray.angle, impact: b, gap }
  }

  return { delay: best.delay, angle: best.angle, impact: best.impact }
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0070: the medium. Every number below was fixed before the first gated run; the uniform speeds and the
// amplitude per depth came from the disclosed probes (tmp/grv70-probe1.ts, tmp/grv70-probe2.ts, uniform depth only)

export const D0 = 16
export const D1 = 24
export const AMP = 12
export const HALF_WIDTH = 16 // in half steps: the packet's support is 16 docks
export const SOURCE_X = 40
// the line: a box long in x, 2 wide in y and z (the plane packet is uniform in y and z, so the short box runs it
// exactly as a wide one would)
export const LINE: readonly [number, number, number] = [192, 2, 2]
export const LINE_WINDOW = 490
export const SLAB: readonly [number, number] = [64, 88]
export const LINE_DETECTORS: readonly number[] = [60, 68, 84, 96, 100, 120]
// the disk: a cylinder along z of depth D1, radius R, in a D0 box
export const PLANE: readonly [number, number, number] = [192, 96, 2]
export const DISK_CENTER: readonly [number, number] = [76, 48]
export const DISK_RADIUS = 16
export const EXIT_X = 96
export const PLANE_WINDOW = 400
export const INSIDE: readonly number[] = [0, 4, 8, 12]
export const BESIDE: readonly number[] = [20, 24, 28]
// the stability edge, reported: D = 4 with a D = 8 slab
export const EDGE: readonly [number, number] = [4, 8]
export const EDGE_AMP = 3

const inDisk = (x: number, y: number): boolean => (x - DISK_CENTER[0]) ** 2 + (y - DISK_CENTER[1]) ** 2 <= DISK_RADIUS ** 2

export type MediumSurvey = {
  // mediumBeat against fastBeat at one depth, 64 beats, D0 and D1
  uniformEqualsFast: boolean[]
  uniformCurl: number
  u0: Run
  u1: Run
  slab: Run
  disk: Run
  diskBoundary: number
  slabBoundary: number
  edgeUniform: Run
  edgeSlab: Run
  seconds: number
}

let mediumCache: MediumSurvey | undefined

export function mediumSurvey(log?: (what: string) => void): MediumSurvey {
  if (mediumCache) return mediumCache

  const started = Date.now()
  const uniformEqualsFast = [D0, D1].map(d => {
    const m = makeMedium([16, 8, 2], () => d)
    const a = planarPacket(m, 8, AMP, HALF_WIDTH)
    const b = copyState(a)
    const e = makeHuskEngine(m.geometry, d)
    let same = true

    for (let t = 0; t < 64; t++) {
      mediumBeat(m, a)
      fastBeat(e, b)
      same = same && sameState(a, b)
    }

    return same
  })
  const lineRun = (depthAt: (x: number) => number, amp: number, window: number): { run: Run; medium: Medium } => {
    const m = makeMedium(LINE, x => depthAt(x))
    const run = runPacket(
      m,
      planarPacket(m, SOURCE_X, amp, HALF_WIDTH),
      LINE_DETECTORS.map(x => dockAt(m, x, 0, 0)),
      window,
    )

    return { run, medium: m }
  }
  const u0 = lineRun(() => D0, AMP, LINE_WINDOW).run

  log?.(`u0 ${u0.seconds}s`)

  const u1 = lineRun(() => D1, AMP, LINE_WINDOW).run
  const slabRun = lineRun(x => (x >= SLAB[0] && x < SLAB[1] ? D1 : D0), AMP, LINE_WINDOW)

  log?.(`slab ${slabRun.run.seconds}s`)

  const plane = makeMedium(PLANE, (x, y) => (inDisk(x, y) ? D1 : D0))
  const disk = runPacket(
    plane,
    planarPacket(plane, SOURCE_X, AMP, HALF_WIDTH),
    Array.from({ length: PLANE[1] }, (_, y) => dockAt(plane, EXIT_X, y, 0)),
    PLANE_WINDOW,
  )

  log?.(`disk ${disk.seconds}s`)

  const edgeUniform = lineRun(() => EDGE[0], EDGE_AMP, 233).run
  const edgeSlab = lineRun(x => (x >= SLAB[0] && x < SLAB[1] ? EDGE[1] : EDGE[0]), EDGE_AMP, 233).run

  mediumCache = {
    uniformEqualsFast,
    uniformCurl: uniformCurl(makeMedium([16, 8, 2], () => D0), AMP),
    u0,
    u1,
    slab: slabRun.run,
    disk,
    diskBoundary: boundaryTriangles(plane),
    slabBoundary: boundaryTriangles(slabRun.medium),
    edgeUniform,
    edgeSlab,
    seconds: (Date.now() - started) / 1000,
  }

  return mediumCache
}

// the arrival at line detector x of a line run
export const lineArrival = (run: Run, x: number): number => run.arrival[LINE_DETECTORS.indexOf(x)] ?? Number.NaN

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0071: does content set its column's depth? On the trit light (E-GRV-0062's light, lumps, pulse and beats:
// code/measure/depth-lump), the trit rule's husk angles are compared every beat with two husk media started from
// the same husk read: (i) every column at the bulk's depth D, and (ii) THE CANDIDATE, each column at D + k, k the
// number of vibes its bulk column holds (lump and partners: "a column's depth grows with the content it carries").
// If content set depth, the trit rule would follow (ii) and not (i).

export type SourceReading = {
  config: LumpConfig
  gauss: number
  lumpKept: boolean
  // the trit rule's husk angles equal medium (i)'s on every beat
  followsFixed: boolean
  // ... and medium (ii)'s on every beat
  followsCandidate: boolean
  // the first beat at which (i) and (ii) differ (BEATS + 1 if never): the candidate would have been seen
  candidateSeenAt: number
  // columns holding content, and the largest depth the candidate gives
  contentColumns: number
  candidateDepth: number
  // per beat, husk angle entries at which the trit rule differs from the empty configuration's
  mismatch: number[]
  // flipped configurations: the trit husk angles equal the unflipped configuration's on every beat
  sameAsUnflipped: boolean | undefined
}

export type SourceSurvey = { readings: SourceReading[]; seconds: number }

let sourceCache: SourceSurvey | undefined

export function sourceSurvey(log?: (what: string) => void): SourceSurvey {
  if (sourceCache) return sourceCache

  const started = Date.now()
  const light = makeTritLight({ side: SIDE, depth: DEPTH, form: 'wave' })
  const bulk = light.bulk
  const configs = CONFIGS.filter(c => c.form !== 'split')
  const traces = new Map<string, Int32Array[]>()
  const readings: SourceReading[] = []

  for (const config of configs) {
    const s = emptyTritState(light)

    placeLump(light, s, config)
    kick(light, s, huskDock(-REACH, 0, 0), 0, PULSE)

    const vibe = Int8Array.from(s.vibe)
    const content = new Int32Array(bulk.huskDocks)

    for (let x = 0; x < bulk.docks; x++) if (vibe[x] !== 0) content[bulk.column[x]!] = content[bulk.column[x]!]! + 1

    // on the bulk's OWN husk geometry (triangle orientations as the trit rule has them): the tiled geometry of
    // code/rule/trit-husk orients some triangles the other way, which the field's seam at -N_B / 2 does not forgive
    // at D = 4 with a pulse of 7 (first run of E-GRV-0071, tmp/grv71-diag.ts)
    const fixed = makeMedium([SIDE, SIDE, SIDE], () => DEPTH, 1, geometryOfBulk(bulk))
    const candidate = makeMedium([SIDE, SIDE, SIDE], (x, y, z) => DEPTH + content[x + SIDE * y + SIDE * SIDE * z]!, 1, geometryOfBulk(bulk))
    const husk = readHusk(light, s)
    const startOf = (m: Medium): HuskLightState => {
      const h = emptyState(m)

      h.angle.set(husk.angle)
      h.string.set(husk.string)

      return h
    }
    const a = startOf(fixed)
    const b = startOf(candidate)
    const trace: Int32Array[] = []
    let gauss = 0
    let followsFixed = true
    let followsCandidate = true
    let candidateSeenAt = BEATS + 1

    for (let t = 1; t <= BEATS; t++) {
      tritLightBeat(light, s)
      gauss += bulkGaussViolations(light, s) + huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
      mediumBeat(fixed, a)
      mediumBeat(candidate, b)

      const angle = readHusk(light, s).angle

      trace.push(angle)
      followsFixed = followsFixed && angle.every((v, i) => v === a.angle[i])
      followsCandidate = followsCandidate && angle.every((v, i) => v === b.angle[i])

      if (candidateSeenAt > BEATS && !a.angle.every((v, i) => v === b.angle[i])) candidateSeenAt = t
    }

    traces.set(config.name, trace)

    const empty = traces.get('empty')
    const unflipped = config.flip ? traces.get(config.name.replace('-flipped', '')) : undefined

    readings.push({
      config,
      gauss,
      lumpKept: s.vibe.every((v, i) => v === vibe[i]),
      followsFixed,
      followsCandidate,
      candidateSeenAt,
      contentColumns: content.reduce((c, v) => c + (v > 0 ? 1 : 0), 0),
      candidateDepth: candidate.dockDepth.reduce((m, v) => Math.max(m, v), 0),
      mismatch: trace.map((angle, t) => (empty ? angle.reduce((c, v, i) => c + (v === empty[t]![i] ? 0 : 1), 0) : 0)),
      sameAsUnflipped: unflipped ? trace.every((angle, t) => angle.every((v, i) => v === unflipped[t]![i])) : undefined,
    })
    log?.(`${config.name} ${Math.round((Date.now() - started) / 1000)}s`)
  }

  sourceCache = { readings, seconds: (Date.now() - started) / 1000 }

  return sourceCache
}
