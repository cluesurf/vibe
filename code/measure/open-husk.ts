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

import { newStepTally, type StepRule, type StepTally } from '@/code/rule/step-depth'
import { applyOpenPath, duplicateOpen, emptyOpen, HUSK_LATERAL, openBeat, openBeatBack, openDepth, openFittingPath, openHopPaths, openScratch, placeOpenLines, sameOpen, type OpenMesh, type OpenPath, type OpenState } from '@/code/rule/open-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export const huskDock = (mesh: OpenMesh, v: readonly number[]): number => {
  const s = mesh.side

  return mod(v[0]!, s) + s * mod(v[1]!, s) + s * s * mod(v[2]!, s)
}

export const huskCoord = (mesh: OpenMesh, y: number): number[] => [y % mesh.side, Math.floor(y / mesh.side) % mesh.side, Math.floor(y / (mesh.side * mesh.side))]

export function huskDistance(mesh: OpenMesh, y: number, center: readonly number[]): number {
  const p = huskCoord(mesh, y)
  const s = mesh.side

  return Math.sqrt(p.reduce((t, v, i) => t + Math.min(mod(v - center[i]!, s), mod(center[i]! - v, s)) ** 2, 0))
}

// a content map on the husk: units at each `at` (and minus that at `to`, when given)
export type OpenPlaced = { at: readonly number[]; units: number; to?: readonly number[] }

export function openContent(mesh: OpenMesh, sources: readonly OpenPlaced[]): Int32Array {
  const rho = new Int32Array(mesh.docks)

  for (const s of sources) {
    rho[huskDock(mesh, s.at)]! += s.units
    if (s.to) rho[huskDock(mesh, s.to)]! -= s.units
  }

  return rho
}

export function previousOpenStep(mesh: OpenMesh, rule: StepRule, s: OpenState): Float64Array {
  const out = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    const z = mesh.head[m]!

    out[m] = mod(s.step[m]! - mesh.weight[m]! * (s.rate[mesh.tail[m]!]! - (z >= 0 ? s.rate[z]! : 0)) + rule.top, rule.span) - rule.top
  }

  return out
}

export type OpenEnergy = { energy: number; free: number; huskFree: number; sourceFound: number; sourceLocal: number; curl: number }

export function openEnergy(mesh: OpenMesh, rule: StepRule, s: OpenState, rho: Int32Array): OpenEnergy {
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
    const k = (s.rate[y]! / u) ** 2

    kinetic += k
    if (y < mesh.huskDocks) huskKinetic += k
    if (rho[y] !== 0) sourceFound += (rho[y]! * (d1.twice[y]! + d0.twice[y]!)) / (4 * u)
  }

  for (let m = 0; m < mesh.links; m++) {
    const g = mesh.weight[m]!
    const p = ((s.step[m]! / u) * (f0[m]! / u)) / g

    links += p
    if (mesh.kind[m] === HUSK_LATERAL) huskLinks += p
    if (s.line[m] !== 0) sourceLocal += (s.line[m]! * (s.step[m]! + f0[m]!)) / (2 * u * g)
  }

  const scale = Math.PI / rule.depth
  const free = scale * (kinetic / (2 * kappa) + links / 2)

  return { energy: free - scale * sourceFound, free, huskFree: scale * (huskKinetic / (2 * kappa) + huskLinks / 2), sourceFound, sourceLocal, curl: d1.curl + d0.curl }
}

// the depth found by summing a real step field from the ground (in whole steps)
export function realDepth(mesh: OpenMesh, step: Float64Array): Float64Array {
  return openDepth(mesh, step).twice.map(t => t / 2)
}

// the static functional (pi / D)(1/2 sum F^2 / g - rho . x) at a real step field
export function openStaticFunctional(mesh: OpenMesh, rule: StepRule, step: Float64Array, rho: Int32Array): number {
  const x = realDepth(mesh, step)
  let quad = 0
  let source = 0

  for (let m = 0; m < mesh.links; m++) quad += step[m]! ** 2 / mesh.weight[m]!
  for (let y = 0; y < mesh.docks; y++) if (rho[y] !== 0) source += rho[y]! * x[y]!

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
  beats: number
}

export const newOpenRecord = (): OpenRecord => ({ runs: 0, reversed: true, gaussOff: 0, gaussChecks: 0, curl: 0, curlChecks: 0, wraps: newStepTally(), maxStep: 0, maxRate: 0, maxRest: 0, beats: 0 })

function observe(rule: StepRule, s: OpenState, record: OpenRecord): void {
  for (let m = 0; m < s.step.length; m++) record.maxStep = Math.max(record.maxStep, Math.abs(s.step[m]!) / rule.unit)
  for (let y = 0; y < s.rate.length; y++) {
    record.maxRate = Math.max(record.maxRate, Math.abs(s.rate[y]!) / rule.unit)
    record.maxRest = Math.max(record.maxRest, Math.abs(s.rest[y]!))
  }
}

// Gauss after a beat: the beat computed div f from the lines it read, and a beat never changes a line, so its scratch
// holds the lines' divergence now; the docks where it differs from the content
function gaussAfterBeat(scratch: { divLine: Float64Array }, rho: Int32Array): number {
  let off = 0

  for (let y = 0; y < rho.length; y++) if (scratch.divLine[y] !== rho[y]) off++

  return off
}

export type OpenStatic = { mean: Float64Array; depth: Float64Array; energy: number }

// from zero field with the lines placed (routed to the ground, or to the sinks given), T beats forward (the Hann
// average of the steps), then T back, compared bit for bit
export function openStaticRun(mesh: OpenMesh, rule: StepRule, rho: Int32Array, beats: number, record: OpenRecord): OpenStatic {
  const s = emptyOpen(mesh)

  s.line.set(placeOpenLines(mesh, rho))

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
      observe(rule, s, record)
    }

    const w = Math.sin((Math.PI * t) / beats) ** 2

    if (w === 0) continue
    for (let m = 0; m < mean.length; m++) mean[m] = mean[m]! + (w * s.step[m]!) / rule.unit
    weight += w
  }

  for (let t = 0; t < beats; t++) openBeatBack(mesh, rule, s, scratch)

  for (let m = 0; m < mean.length; m++) mean[m] = mean[m]! / weight

  record.runs++
  record.reversed = record.reversed && sameOpen(s, start)

  return { mean, depth: realDepth(mesh, mean), energy: openStaticFunctional(mesh, rule, mean, rho) }
}

// ---------------------------------------------------------------------------------------------------------
// the static field solved outright (a second method): L x = rho, L the weighted Laplacian (x = 0 at the ground), by
// conjugate gradients. With no ground the content must sum to zero and x is returned with x[0] = 0.

export function greenSolve(mesh: OpenMesh, rho: ArrayLike<number>, tolerance = 1e-13, limit = 20000): { x: Float64Array; iterations: number; residual: number } {
  const n = mesh.docks
  const apply = (p: Float64Array, out: Float64Array): void => {
    out.fill(0)

    for (let m = 0; m < mesh.links; m++) {
      const z = mesh.head[m]!
      const d = mesh.weight[m]! * (p[mesh.tail[m]!]! - (z >= 0 ? p[z]! : 0))

      out[mesh.tail[m]!] = out[mesh.tail[m]!]! + d
      if (z >= 0) out[z] = out[z]! - d
    }
  }
  const x = new Float64Array(n)
  const r = Float64Array.from({ length: n }, (_, i) => rho[i]!)
  const p = Float64Array.from(r)
  const ap = new Float64Array(n)
  const dot = (a: Float64Array, b: Float64Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) s += a[i]! * b[i]!

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

    for (let i = 0; i < n; i++) p[i] = r[i]! + (next / rr) * p[i]!
    rr = next
    it++
  }

  if (!mesh.hasGround) {
    const x0 = x[0]!

    for (let i = 0; i < n; i++) x[i] = x[i]! - x0
  }

  return { x, iterations: it, residual: Math.sqrt(rr) / norm0 }
}

// ---------------------------------------------------------------------------------------------------------
// runs with hops

export type OpenHop = { beat: number; from: readonly number[]; to: readonly number[]; units: number }

export type OpenHopRun = { final: OpenState; paths: OpenPath[][]; reversed: boolean }

// from zero field with the lines of rho0 placed, `beats` beats; each hop applied after beat hop.beat, unit by unit along
// the first fitting path; Gauss checked on every dock of husk and bulk after every beat; then everything undone back to
// the start and compared bit for bit. `keep` sees the state after each beat.
export function openHopRun(mesh: OpenMesh, rule: StepRule, rho0: Int32Array, hops: readonly OpenHop[], beats: number, record: OpenRecord, keep?: (t: number, s: OpenState, rho: Int32Array) => void): OpenHopRun {
  const s = emptyOpen(mesh)

  s.line.set(placeOpenLines(mesh, rho0))

  const start = duplicateOpen(s)
  const scratch = openScratch(mesh)
  const rho = Int32Array.from(rho0)
  const paths: OpenPath[][] = []

  keep?.(0, s, rho)

  for (let t = 1; t <= beats; t++) {
    for (const hop of hops) {
      if (hop.beat !== t - 1) continue

      const y = huskDock(mesh, hop.from)
      const z = huskDock(mesh, hop.to)
      const candidates = openHopPaths(mesh, y, z)
      const used: OpenPath[] = []

      for (let k = 0; k < hop.units; k++) {
        const i = openFittingPath(s.line, candidates)

        if (i < 0) throw new Error(`openHopRun: no fitting path at beat ${t}`)
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
      observe(rule, s, record)
    }
    keep?.(t, s, rho)
  }

  const final = duplicateOpen(s)
  let hopIndex = paths.length - 1

  for (let t = beats; t >= 1; t--) {
    openBeatBack(mesh, rule, s, scratch)

    for (let k = hops.length - 1; k >= 0; k--) {
      if (hops[k]!.beat !== t - 1) continue

      for (const p of [...paths[hopIndex]!].reverse()) applyOpenPath(s.line, p, -1)
      hopIndex--
    }
  }

  const reversed = sameOpen(s, start)

  record.runs++
  record.reversed = record.reversed && reversed

  return { final, paths, reversed }
}

// the largest |F| (whole steps) over the husk's lateral links
export function huskMaxStep(mesh: OpenMesh, rule: StepRule, s: OpenState): number {
  let top = 0

  for (let m = 0; m < mesh.huskDocks * 9; m++) top = Math.max(top, Math.abs(s.step[m]!))

  return top / rule.unit
}
