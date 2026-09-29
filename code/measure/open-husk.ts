// Measurement for the open husk (E-GRV-0094, 0095): code/rule/open-husk. Real numbers live here only.
//
// THE ENERGY is code/measure/step-depth's on every dock and link of husk and bulk (the ground holds no register and
// adds nothing): with F1 the step now, F0 the step one beat before, x1 and x0 the depths found by summing from the
// ground,
//   E = (pi / D) [ 1/2 sum_docks v^2 / kappa + 1/2 sum_links F1 F0 / g - sum_docks rho (x1 + x0) / 2 ].
// The HUSK'S SHARE of the field part (E less the source term) is its docks' kinetic part and its lateral links' part;
// the vertical links from the husk down belong to the bulk in this count.
//
// THE STATIC READING, as E-GRV-0079 and E-GRV-0090: from zero field with the lines placed, T beats, the Hann-weighted
// time average of the steps; the depth found by summing it. BESIDE IT (a second method, not the rule): the static field
// solved outright, the weighted Laplacian L x = rho with x = 0 at the ground, by conjugate gradients.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import {
  newStepTally,
  type StepRule,
  type StepTally,
} from '@/code/rule/step-depth'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { linearFit } from '@/code/measure/regression'
import {
  applyOpenPath,
  duplicateOpen,
  emptyOpen,
  HUSK_LATERAL,
  huskOnly,
  openBeat,
  openBeatBack,
  openDepth,
  openDivisor,
  openFittingPath,
  openRestLow,
  openHopPaths,
  openScratch,
  placeOpenLines,
  sameOpen,
  type LinkAllow,
  type OpenMesh,
  type OpenPath,
  type OpenState,
} from '@/code/rule/open-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export const huskDock = (
  mesh: OpenMesh,
  v: readonly number[],
): number => {
  const s = mesh.side

  return mod(v[0]!, s) + s * mod(v[1]!, s) + s * s * mod(v[2]!, s)
}

export const huskCoord = (mesh: OpenMesh, y: number): number[] => [
  y % mesh.side,
  Math.floor(y / mesh.side) % mesh.side,
  Math.floor(y / (mesh.side * mesh.side)),
]

export function huskDistance(
  mesh: OpenMesh,
  y: number,
  center: readonly number[],
): number {
  const p = huskCoord(mesh, y)
  const s = mesh.side

  return Math.sqrt(
    p.reduce(
      (t, v, i) =>
        t +
        Math.min(mod(v - center[i]!, s), mod(center[i]! - v, s)) ** 2,
      0,
    ),
  )
}

// a content map on the husk: units at each `at` (and minus that at `to`, when given)
export type OpenPlaced = {
  at: readonly number[]
  units: number
  to?: readonly number[]
}

export function openContent(
  mesh: OpenMesh,
  sources: readonly OpenPlaced[],
): Int32Array {
  const rho = new Int32Array(mesh.docks)

  for (const s of sources) {
    rho[huskDock(mesh, s.at)]! += s.units

    if (s.to) {
      rho[huskDock(mesh, s.to)]! -= s.units
    }
  }

  return rho
}

export function previousOpenStep(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
): Float64Array {
  const out = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    const z = mesh.head[m]!

    out[m] =
      mod(
        s.step[m]! -
          mesh.weight[m]! *
            (s.rate[mesh.tail[m]!]! - (z >= 0 ? s.rate[z]! : 0)) +
          rule.top,
        rule.span,
      ) - rule.top
  }

  return out
}

// the lapse in the links (code/rule/open-husk lapseLinks): a link's weight is its mesh weight times 2^-e, a dock's
// kinetic weight is its clock's divisor multiple times 2^-e (1 on both without a lapse)
export const linkLapse = (mesh: OpenMesh, m: number): number =>
  mesh.lapse ? 2 ** -mesh.lapse.link[m]! : 1
export const dockLapse = (mesh: OpenMesh, y: number): number =>
  mesh.lapse ? 2 ** -mesh.lapse.dock[y]! : 1

export type OpenEnergy = {
  energy: number
  free: number
  huskFree: number
  sourceFound: number
  sourceLocal: number
  curl: number
}

export function openEnergy(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
  rho: Int32Array,
): OpenEnergy {
  const u = rule.unit
  const f0 = previousOpenStep(mesh, rule, s)
  const d1 = openDepth(mesh, s.step)
  const d0 = openDepth(mesh, f0)
  const kappa = rule.a / rule.q

  let kinetic = 0
  let huskKinetic = 0
  let links = 0
  let huskLinks = 0
  let sourceFound = 0
  let sourceLocal = 0

  for (let y = 0; y < mesh.docks; y++) {
    // the warped clock's dock carries kappa / 4^k: its kinetic part is 4^k v^2 / kappa (with the lapse in the links
    // too, 2^k v^2 / kappa: code/rule/open-husk lapseLinks)
    const k =
      (s.rate[y]! / u) ** 2 *
      (mesh.inertia ? mesh.inertia[y]! : 1) *
      dockLapse(mesh, y)

    kinetic += k

    if (y < mesh.huskDocks) {
      huskKinetic += k
    }

    if (rho[y] !== 0) {
      sourceFound += (rho[y]! * (d1.twice[y]! + d0.twice[y]!)) / (4 * u)
    }
  }

  for (let m = 0; m < mesh.links; m++) {
    const g = mesh.weight[m]!
    // a lapsed link stores F~ = 2^e F against a weight g 2^-e: F F / (g 2^-e) = F~ F~ 2^-e / g
    const p =
      (((s.step[m]! / u) * (f0[m]! / u)) / g) * linkLapse(mesh, m)

    links += p

    if (mesh.kind[m] === HUSK_LATERAL) {
      huskLinks += p
    }

    if (s.line[m] !== 0) {
      sourceLocal += (s.line[m]! * (s.step[m]! + f0[m]!)) / (2 * u * g)
    }
  }

  const scale = Math.PI / rule.depth
  const free = scale * (kinetic / (2 * kappa) + links / 2)

  return {
    energy: free - scale * sourceFound,
    free,
    huskFree: scale * (huskKinetic / (2 * kappa) + huskLinks / 2),
    sourceFound,
    sourceLocal,
    curl: d1.curl + d0.curl,
  }
}

// the depth found by summing a real step field from the ground (in whole steps)
export function realDepth(
  mesh: OpenMesh,
  step: Float64Array,
): Float64Array {
  return openDepth(mesh, step).twice.map(t => t / 2)
}

// the static functional (pi / D)(1/2 sum F^2 / g - rho . x) at a real step field
export function openStaticFunctional(
  mesh: OpenMesh,
  rule: StepRule,
  step: Float64Array,
  rho: Int32Array,
): number {
  const x = realDepth(mesh, step)

  let quad = 0
  let source = 0

  for (let m = 0; m < mesh.links; m++) {
    quad += (step[m]! ** 2 / mesh.weight[m]!) * linkLapse(mesh, m)
  }

  for (let y = 0; y < mesh.docks; y++) {
    if (rho[y] !== 0) {
      source += rho[y]! * x[y]!
    }
  }

  return (Math.PI / rule.depth) * (quad / 2 - source)
}

// ---------------------------------------------------------------------------------------------------------
// the running record

export type OpenRecord = {
  runs: number
  reversed: boolean
  gaussOff: number
  gaussChecks: number
  curl: number
  curlChecks: number
  wraps: StepTally
  maxStep: number
  maxRate: number
  maxRest: number
  // dock checks where the remainder lay outside its own window (its divisor's, code/rule/open-husk openDivisor)
  restOff: number
  beats: number
}

export const newOpenRecord = (): OpenRecord => ({
  runs: 0,
  reversed: true,
  gaussOff: 0,
  gaussChecks: 0,
  curl: 0,
  curlChecks: 0,
  wraps: newStepTally(),
  maxStep: 0,
  maxRate: 0,
  maxRest: 0,
  restOff: 0,
  beats: 0,
})

function observe(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
  record: OpenRecord,
): void {
  for (let m = 0; m < s.step.length; m++) {
    record.maxStep = Math.max(
      record.maxStep,
      Math.abs(s.step[m]!) / rule.unit,
    )
  }

  for (let y = 0; y < s.rate.length; y++) {
    const q = openDivisor(mesh, rule, y)
    const low = openRestLow(q)

    record.maxRate = Math.max(
      record.maxRate,
      Math.abs(s.rate[y]!) / rule.unit,
    )
    record.maxRest = Math.max(record.maxRest, Math.abs(s.rest[y]!))

    if (
      s.rest[y]! < -low ||
      s.rest[y]! > q - 1 - low ||
      !Number.isInteger(s.rest[y]!)
    ) {
      record.restOff++
    }
  }
}

// Gauss after a beat: the beat computed div f from the lines it read, and a beat never changes a line, so its scratch
// holds the lines' divergence now; the docks where it differs from the content
function gaussAfterBeat(
  scratch: { divLine: Float64Array },
  rho: Int32Array,
): number {
  let off = 0

  for (let y = 0; y < rho.length; y++) {
    if (scratch.divLine[y] !== rho[y]) {
      off++
    }
  }

  return off
}

export type OpenStatic = {
  mean: Float64Array
  depth: Float64Array
  energy: number
}

// from zero field with the lines placed (routed to the ground, or to the sinks given), T beats forward (the Hann
// average of the steps), then T back, compared bit for bit
export function openStaticRun(
  mesh: OpenMesh,
  rule: StepRule,
  rho: Int32Array,
  beats: number,
  record: OpenRecord,
  allow?: LinkAllow,
): OpenStatic {
  const s = emptyOpen(mesh)

  s.line.set(placeOpenLines(mesh, rho, 1, allow))

  const start = duplicateOpen(s)
  const scratch = openScratch(mesh)
  const mean = new Float64Array(mesh.links)

  let weight = 0

  for (let t = 1; t <= beats; t++) {
    openBeat(mesh, rule, s, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussAfterBeat(scratch, rho)
    record.gaussChecks++

    if (t % 64 === 0 || t === beats) {
      record.curl += openDepth(mesh, s.step).curl
      record.curlChecks++
      observe(mesh, rule, s, record)
    }

    const w = Math.sin((Math.PI * t) / beats) ** 2

    if (w === 0) {
      continue
    }

    for (let m = 0; m < mean.length; m++) {
      mean[m] = mean[m]! + (w * s.step[m]!) / rule.unit
    }

    weight += w
  }

  for (let t = 0; t < beats; t++) {
    openBeatBack(mesh, rule, s, scratch)
  }

  for (let m = 0; m < mean.length; m++) {
    mean[m] = mean[m]! / weight
  }

  record.runs++
  record.reversed = record.reversed && sameOpen(s, start)

  return {
    mean,
    depth: realDepth(mesh, mean),
    energy: openStaticFunctional(mesh, rule, mean, rho),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the static field solved outright (a second method): L x = rho, L the weighted Laplacian (x = 0 at the ground), by
// conjugate gradients. With no ground the content must sum to zero and x is returned with x[0] = 0.

export function greenSolve(
  mesh: OpenMesh,
  rho: ArrayLike<number>,
  tolerance = 1e-13,
  limit = 20000,
): { x: Float64Array; iterations: number; residual: number } {
  const n = mesh.docks

  const apply = (p: Float64Array, out: Float64Array): void => {
    out.fill(0)

    for (let m = 0; m < mesh.links; m++) {
      const z = mesh.head[m]!
      const d =
        mesh.weight[m]! *
        linkLapse(mesh, m) *
        (p[mesh.tail[m]!]! - (z >= 0 ? p[z]! : 0))

      out[mesh.tail[m]!] = out[mesh.tail[m]!]! + d

      if (z >= 0) {
        out[z] = out[z]! - d
      }
    }
  }

  const x = new Float64Array(n)
  const r = Float64Array.from({ length: n }, (_, i) => rho[i]!)
  const p = Float64Array.from(r)
  const ap = new Float64Array(n)

  const dot = (a: Float64Array, b: Float64Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      s += a[i]! * b[i]!
    }

    return s
  }

  const norm0 = Math.sqrt(dot(r, r))

  let rr = dot(r, r)
  let it = 0

  while (it < limit && Math.sqrt(rr) > tolerance * norm0) {
    apply(p, ap)

    const alpha = rr / dot(p, ap)

    for (let i = 0; i < n; i++) {
      x[i] = x[i]! + alpha * p[i]!
      r[i] = r[i]! - alpha * ap[i]!
    }

    const next = dot(r, r)

    for (let i = 0; i < n; i++) {
      p[i] = r[i]! + (next / rr) * p[i]!
    }

    rr = next
    it++
  }

  if (!mesh.hasGround) {
    const x0 = x[0]!

    for (let i = 0; i < n; i++) {
      x[i] = x[i]! - x0
    }
  }

  return { x, iterations: it, residual: Math.sqrt(rr) / norm0 }
}

// ---------------------------------------------------------------------------------------------------------
// runs with hops

export type OpenHop = {
  beat: number
  from: readonly number[]
  to: readonly number[]
  units: number
}

export type OpenHopRun = {
  final: OpenState
  paths: OpenPath[][]
  reversed: boolean
}

// from zero field with the lines of rho0 placed, `beats` beats; each hop applied after beat hop.beat, unit by unit along
// the first fitting path; Gauss checked on every dock of husk and bulk after every beat; then everything undone back to
// the start and compared bit for bit. `keep` sees the state after each beat.
export function openHopRun(
  mesh: OpenMesh,
  rule: StepRule,
  rho0: Int32Array,
  hops: readonly OpenHop[],
  beats: number,
  record: OpenRecord,
  keep?: (t: number, s: OpenState, rho: Int32Array) => void,
  allow?: LinkAllow,
): OpenHopRun {
  const s = emptyOpen(mesh)

  s.line.set(placeOpenLines(mesh, rho0, 1, allow))

  const start = duplicateOpen(s)
  const scratch = openScratch(mesh)
  const rho = Int32Array.from(rho0)
  const paths: OpenPath[][] = []

  keep?.(0, s, rho)

  for (let t = 1; t <= beats; t++) {
    for (const hop of hops) {
      if (hop.beat !== t - 1) {
        continue
      }

      const y = huskDock(mesh, hop.from)
      const z = huskDock(mesh, hop.to)
      const candidates = openHopPaths(mesh, y, z, allow)
      const used: OpenPath[] = []

      for (let k = 0; k < hop.units; k++) {
        const i = openFittingPath(s.line, candidates)

        if (i < 0) {
          throw new Error(`openHopRun: no fitting path at beat ${t}`)
        }

        applyOpenPath(s.line, candidates[i]!, 1)
        used.push(candidates[i]!)
        rho[y]!--
        rho[z]!++
      }

      paths.push(used)
    }

    openBeat(mesh, rule, s, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussAfterBeat(scratch, rho)
    record.gaussChecks++

    if (t % 64 === 0 || t === beats) {
      record.curl += openDepth(mesh, s.step).curl
      record.curlChecks++
      observe(mesh, rule, s, record)
    }

    keep?.(t, s, rho)
  }

  const final = duplicateOpen(s)

  let hopIndex = paths.length - 1

  for (let t = beats; t >= 1; t--) {
    openBeatBack(mesh, rule, s, scratch)

    for (let k = hops.length - 1; k >= 0; k--) {
      if (hops[k]!.beat !== t - 1) {
        continue
      }

      for (const p of [...paths[hopIndex]!].reverse()) {
        applyOpenPath(s.line, p, -1)
      }

      hopIndex--
    }
  }

  const reversed = sameOpen(s, start)

  record.runs++
  record.reversed = record.reversed && reversed

  return { final, paths, reversed }
}

// the largest |F| (whole steps) over the husk's lateral links
export function huskMaxStep(
  mesh: OpenMesh,
  rule: StepRule,
  s: OpenState,
): number {
  let top = 0

  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    top = Math.max(top, Math.abs(s.step[m]!))
  }

  return top / rule.unit
}

// the fewest links from any of `from` to every dock, over every link of husk and bulk (the one-link-a-beat cone of the
// rule: a value can differ at a dock no sooner than this many beats after a change at `from`)
export function linkDistance(
  mesh: OpenMesh,
  from: readonly number[],
): Int32Array {
  const dist = new Int32Array(mesh.docks).fill(-1)
  const queue = new Int32Array(mesh.docks)

  let tail = 0

  for (const y of from) {
    ;((dist[y] = 0), (queue[tail++] = y))
  }

  for (let at = 0; at < tail; at++) {
    const y = queue[at]!

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!
      const z = mesh.incSign[j]! > 0 ? mesh.head[m]! : mesh.tail[m]!

      if (z < 0 || dist[z] !== -1) {
        continue
      }

      dist[z] = dist[y]! + 1
      queue[tail++] = z
    }
  }

  return dist
}

// ---------------------------------------------------------------------------------------------------------
// the layered stack's husk Green's function, the prediction (theory, not the rule): each layer smooth in its plane,
// discrete in depth. Per husk dock, layer k has lateral stiffness s_k = 6 (docks_k / docks_0)(side_0 / side_k)^2 (the
// husk mesh's 6 |p|^2 on a mesh of spacing side_0 / side_k, at its dock density), and the vertical links between
// layer k and k + 1 give a conductance c_k = max(docks_k, docks_k+1) / docks_0 (one link a pair, g = 1). The static
// field of a unit on the husk at momentum p is [(p^2 S + C)^-1]_00 = sum_n w_n / (p^2 + m_n^2), so on the husk
//   G(r) = sum_n w_n e^(-m_n r) / (4 pi r),
// with m_0 = 0 and w_0 = 1 / sum_k s_k: the zero mode, whose share of the husk alone's 1/r is s_0 / sum_k s_k.

//
// THE WARP (E-GRV-0102, 0103). Per husk dock, layer k's lateral stiffness s_k, the vertical conductance c_k between k and
// k + 1, and the inertia m_k (the kinetic weight at the dock density, in units of the husk's 1 / kappa), with
// lambda_k = side_k / side_0 (2^-k on a shrinking stack):
//  'none'   every dock beats one clock: s_k = 6 lambda_k, c_k = lambda_k^3, m_k = lambda_k^3 (shrinking). The static
//           weights of hyperbolic 4-space (e^(-ky) laterally, e^(-3ky) vertically); layer k's waves run at 2^k c.
//  'clock'  the warped clock of code/rule/open-husk warpClock: m_k = lambda_k^3 / lambda_k^2 = lambda_k; s_k and c_k are
//           'none''s, so the STATICS ARE 'none''s. The inertia is now proportional to the stiffness layer by layer
//           (s_k = 6 m_k), so every mode of the stack obeys omega^2 = c^2 (p^2 + mass^2) with the static masses: the zero
//           mode runs at c exactly and every massive mode slower. No wave on the husk outruns light.
//  'lapse'  THEORY ONLY (no rule runs it): the lapse inside the link weights as well, as in Randall-Sundrum's action
//           sqrt(-g) g^ab: s_k = 6 lambda_k^2, c_k = lambda_k^3 (lambda_k lambda_k+1)^(1/2) (the lapse at the vertical
//           link's middle), m_k = lambda_k^2: AdS_5's static weights e^(-2ky), e^(-4ky), and s_k = 6 m_k again.
//  'lapse_upper'  the lapse in the links AS THE RULE BUILDS IT (code/rule/open-husk lapseLinks): 'lapse' with each
//           vertical link carrying its UPPER dock's lapse, c_k = lambda_k^3 lambda_k = 16^-k, since a weight of
//           2^-(k + 1/2) is not a ratio of integers. It is RS's profile e^(-2ky), e^(-4ky) sampled at the upper face of
//           each slab, with the one-clock stack's layer spacing sqrt 6 (warpedLayering below with one slab a doubling).
export type Warp = 'none' | 'clock' | 'lapse' | 'lapse_upper'

export type StackLayers = {
  stiff: number[]
  conduct: number[]
  inertia: number[]
}

export function stackLayers(
  sides: readonly number[],
  warp: Warp = 'none',
): StackLayers {
  const docks = sides.map(s => s ** 3)
  const lapse = sides.map(s => s / sides[0]!)

  if (
    warp !== 'none' &&
    lapse.some((l, k) => k > 0 && l >= lapse[k - 1]!)
  ) {
    throw new Error('stackLayers: a warp needs a shrinking stack')
  }

  const lapsed = warp === 'lapse' || warp === 'lapse_upper'
  const inLinks = lapsed ? lapse : lapse.map(() => 1)
  const vertical = (k: number): number =>
    warp === 'lapse_upper'
      ? inLinks[k]!
      : Math.sqrt(inLinks[k]! * inLinks[k + 1]!)
  const stiff = sides.map(
    (s, k) =>
      6 * (docks[k]! / docks[0]!) * (sides[0]! / s) ** 2 * inLinks[k]!,
  )
  const conduct = sides
    .slice(0, -1)
    .map(
      (_, k) =>
        (Math.max(docks[k]!, docks[k + 1]!) / docks[0]!) * vertical(k),
    )
  const inertia = sides.map(
    (_, k) =>
      (docks[k]! / docks[0]!) *
      (warp === 'clock'
        ? lapse[k]! ** -2
        : lapsed
          ? lapse[k]! ** -1
          : 1),
  )

  return { stiff, conduct, inertia }
}

// Randall-Sundrum's static profile cut into slabs (theory): lateral e^(-2 k y), vertical e^(-4 k y), sampled at each
// slab's upper face y_j = j l, with `perDoubling` slabs for each halving of the lateral scale (k l = ln 2 /
// perDoubling), down to where the lateral weight falls under `floor`. Isotropic at the husk: s_0 = 6 (the husk mesh's
// own) and c_0 = s_0 / l^2. With perDoubling = 1, curvature = ln 2 / sqrt 6 and five slabs it is stackLayers(sides,
// 'lapse_upper') exactly; as perDoubling grows at a fixed curvature it tends to the continuum RS II bulk.
export function warpedLayering(
  curvature: number,
  perDoubling: number,
  floor: number,
): { stiff: number[]; conduct: number[] } {
  const spacing = Math.LN2 / perDoubling / curvature
  const stiff: number[] = []
  const conduct: number[] = []

  for (
    let j = 0;
    Math.exp(-2 * curvature * j * spacing) >= floor;
    j++
  ) {
    stiff.push(6 * Math.exp(-2 * curvature * j * spacing))
  }

  for (let j = 0; j + 1 < stiff.length; j++) {
    conduct.push(
      (6 / spacing ** 2) * Math.exp(-4 * curvature * j * spacing),
    )
  }

  return { stiff, conduct }
}

// the continuum speeds, in units of the husk's c: each layer's lateral waves, sqrt(s_k / 6 m_k), and the zero mode
// (every layer moving together), sqrt(sum s_k / 6 sum m_k)
export function stackSpeeds(
  sides: readonly number[],
  warp: Warp = 'none',
): { layer: number[]; zeroMode: number } {
  const { stiff, inertia } = stackLayers(sides, warp)
  const sum = (x: readonly number[]): number =>
    x.reduce((a, v) => a + v, 0)

  return {
    layer: stiff.map((s, k) => Math.sqrt(s / (6 * inertia[k]!))),
    zeroMode: Math.sqrt(sum(stiff) / (6 * sum(inertia))),
  }
}

export type StackMode = { mass: number; weight: number }

export function stackModes(
  sides: readonly number[],
  warp: Warp = 'none',
): StackMode[] {
  const { stiff, conduct } = stackLayers(sides, warp)

  return layeredModes(stiff, conduct)
}

// the modes of any layered stack, from its per-husk-dock lateral stiffnesses and the vertical conductances between them
export function layeredModes(
  stiff: readonly number[],
  conduct: readonly number[],
): StackMode[] {
  const n = stiff.length
  // S^-1/2 C S^-1/2, symmetric
  const b = makeDense({ rows: n, cols: n })

  const add = (i: number, j: number, v: number): void => {
    b.data[i * n + j] =
      b.data[i * n + j]! + v / Math.sqrt(stiff[i]! * stiff[j]!)
  }

  conduct.forEach((c, k) => {
    add(k, k, c)
    add(k + 1, k + 1, c)
    add(k, k + 1, -c)
    add(k + 1, k, -c)
  })

  const eig = eigSymmetric({ matrix: b })

  return Array.from({ length: n }, (_, j) => ({
    mass: Math.sqrt(Math.max(0, eig.values[j]!)),
    weight: eig.vectors[j]! ** 2 / stiff[0]!,
  }))
}

export const stackGreen = (
  modes: readonly StackMode[],
  r: number,
): number =>
  modes.reduce((t, m) => t + m.weight * Math.exp(-m.mass * r), 0) /
  (4 * Math.PI * r)

// ---------------------------------------------------------------------------------------------------------
// THE ROD FRONT (E-GRV-0104): a witness for the speed of the pull that reads the husk alone at c.
//
// WHY A ROD. One unit hopping one dock is a dipole: at any dock its two fronts (the content leaving, the content
// arriving) are at most one dock (5 beats) apart, inside each other's smear, so no single threshold sees one front.
// A ROD of content along +x, every unit hopping one dock +x in the same beat, changes the content by -u at the rod's
// first dock and +u one past its last, and nothing between: by linearity the change behind the rod, at (-d, 0, 0), is
// one monopole front (the content leaving the origin) with the arriving front `rod` docks further off. Each hop is a
// neighbor hop of the rule; nothing is added.
//
// WHY ONE THIRD (the husk's dispersion). The husk's waves are subluminal at short wavelength (group velocity
// c cos(p / 2) along an axis to leading order, omega = c p (1 - gamma p^2)), so a front switched on at t0 reaches a
// dock at distance d smeared over a width sigma ~ (3 gamma d)^(1/3) that grows with d, its value at d the switched
// height times the integral of the Airy function up to (c (t - t0) - d) / sigma. At c (t - t0) = d that integral is
// exactly 1/3 whatever sigma is, so the time the change reaches ONE THIRD of the front's height is t0 + d / c with no
// term in sigma, and a line through those times reads c. Any other fraction x crosses at s_x sigma(d) off the cone, a
// d^(1/3) drift that a straight line reads as a speed: the fractions of a MAXIMUM of E-GRV-0101 and 0103 (1.17 c and
// 1.40 c on the husk alone) are that drift, on a near-field pulse whose maximum itself moves.
// THE HEIGHT is the husk's static field of the content that left, u / (24 pi d) in depth (the husk mesh's L = 6 p^2).
// On a stack the continuum argument (each mode's front sharp at c, its wake pulling the level down after it) says the
// height is the husk's too, BUT MEASURED (E-GRV-0104) the warped stack's level behind the front is only 0.55 .. 0.65 of
// the husk's: the wakes act within beats. A height off by a fraction e moves the crossing by about e sigma, so the
// stack's third reads about 2 percent slow; `plateau` reports the level so the reader can see it.
// THE READING: the change in depth at (-d, 0, 0) is the sum of the change in rate over the beats since the hop (the
// depth takes the rate each beat; both runs start from the same state), the crossing time is interpolated between
// beats, and v is 1 / the slope of those times against d.
export type RodFrontSpec = {
  rod: number
  units: number
  hopAt: number
  window: number
  distances: readonly number[]
  fit: readonly number[]
}

export type RodFront = {
  // beats after the hop at which |change| first reaches `share` of the height, per distance (interpolated), and v
  third: number[]
  half: number[]
  tenth: number[]
  speedThird: number
  speedHalf: number
  speedTenth: number
  // the fitted intercept of the third's line (beats after the hop)
  offset: number
  // the change in depth over the height, averaged over the 16 beats before the arriving front can reach the dock
  plateau: number[]
  // the change at each distance, per beat after the hop (for the notes)
  change: number[][]
  reversed: boolean
}

export function crossing(
  series: readonly number[],
  level: number,
): number {
  for (let t = 0; t < series.length; t++) {
    const now = Math.abs(series[t]!)

    if (now < level) {
      continue
    }

    if (t === 0) {
      return 1
    }

    const was = Math.abs(series[t - 1]!)

    return t + (level - was) / (now - was)
  }

  return NaN
}

export function rodFront(
  mesh: OpenMesh,
  rule: StepRule,
  spec: RodFrontSpec,
  record: OpenRecord,
  c: number,
): RodFront {
  const allow = huskOnly(mesh)
  const s = mesh.side
  const sink = [s / 2, s / 2, s / 2]
  const rho0 = openContent(
    mesh,
    Array.from({ length: spec.rod }, (_, i) => ({
      at: [i, 0, 0],
      units: spec.units,
      to: sink,
    })),
  )
  const docks = spec.distances.map(d => huskDock(mesh, [-d, 0, 0]))
  const beats = spec.hopAt + spec.window

  const trace = (
    hops: OpenHop[],
  ): { rates: number[][]; reversed: boolean } => {
    const rates: number[][] = []
    const run = openHopRun(
      mesh,
      rule,
      rho0,
      hops,
      beats,
      record,
      (t, st) => {
        if (t > spec.hopAt) {
          rates.push(docks.map(y => st.rate[y]!))
        }
      },
      allow,
    )

    return { rates, reversed: run.reversed }
  }

  const still = trace([])
  // the far end first, so each unit hops onto a dock its neighbor has just left
  const moved = trace(
    Array.from({ length: spec.rod }, (_, j) => ({
      beat: spec.hopAt,
      from: [spec.rod - 1 - j, 0, 0],
      to: [spec.rod - j, 0, 0],
      units: spec.units,
    })),
  )
  const change = spec.distances.map((_, i) => {
    let x = 0

    return still.rates.map(
      (r, k) => (x += (moved.rates[k]![i]! - r[i]!) / rule.unit),
    )
  })
  const height = spec.distances.map(
    d => spec.units / (24 * Math.PI * d),
  )
  const at = (share: number): number[] =>
    change.map((series, i) => crossing(series, share * height[i]!))
  const third = at(1 / 3)
  const half = at(1 / 2)
  const tenth = at(1 / 10)
  const fitIndex = spec.fit.map(d => spec.distances.indexOf(d))
  const line = (
    times: number[],
  ): { slope: number; intercept: number } =>
    linearFit({
      xs: fitIndex.map(i => spec.distances[i]!),
      ys: fitIndex.map(i => times[i]!),
    })
  const plateau = spec.distances.map((d, i) => {
    // the arriving front starts d + rod docks off; average the 16 beats before it could be within 2 sigma
    const end = Math.min(
      change[i]!.length,
      Math.floor((d + spec.rod - 2) / c),
    )
    const from = Math.max(0, end - 16)
    const slice = change[i]!.slice(from, end)

    return (
      slice.reduce((t, v) => t + Math.abs(v), 0) /
      Math.max(1, slice.length) /
      height[i]!
    )
  })

  return {
    third,
    half,
    tenth,
    speedThird: 1 / line(third).slope,
    speedHalf: 1 / line(half).slope,
    speedTenth: 1 / line(tenth).slope,
    offset: line(third).intercept,
    plateau,
    change,
    reversed: still.reversed && moved.reversed,
  }
}
