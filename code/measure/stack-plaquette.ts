// Measurement for code/rule/stack-plaquette: an arm of the stack's plaquette rule driven by a husk target field (the way
// code/measure/line-plaquette drives the husk's), the stack's own gradient field (a Poisson solve on husk and bulk),
// the wave energy that is not that gradient, split by region, and the operator's largest stiffness. Real numbers live
// here only.
//
// THE DRIVE: as code/measure/line-plaquette feedArm, on the husk's links only: round(U target) - round(U previous
// target), the rounding carried, zero on every bulk link.
//
// DETERMINISM: nothing is drawn (the power iteration starts from a Weyl sequence). NOTHING MOVES.

import { greenSolve, linkLapse } from '@/code/measure/open-husk'
import { openDivergence, type OpenMesh } from '@/code/rule/open-husk'
import type { PlaquetteRule, PlaquetteTally } from '@/code/rule/line-plaquette'
import { FACE_HUSK, FACE_VERTICAL, addStackBoundary, duplicateStackPlaquette, emptyStackPlaquette, sameStackPlaquette, stackFaceCurl, stackPlaquetteBeat, stackPlaquetteBeatBack, stackPlaquetteScratch, type StackFaces, type StackPlaquetteScratch, type StackPlaquetteState } from '@/code/rule/stack-plaquette'

export type StackDrag = { at: Int32Array; value: Float64Array }

export type StackArm = {
  readonly rule: PlaquetteRule
  readonly state: StackPlaquetteState
  readonly start: StackPlaquetteState
  // the running sum of the drag (the register with no move), whole register units, on every stack link
  readonly bare: Float64Array
  readonly drags: StackDrag[]
  readonly tally: PlaquetteTally
  // docks of husk and bulk where the stack divergence of E differs from the bare register's, summed over beats (exactly
  // 0 by the algebra)
  gaussOff: number
  // the largest |husk-only divergence of E - that of the bare register| over docks and beats, in whole lines: the lines
  // gone down the verticals (0 on a stack of no layers)
  huskGap: number
  largestLine: number
  largestTurn: number
  beats: number
}

// an arm whose beat-0 register is round(U start) on the husk's links, 0 in the bulk
export function stackArm(mesh: OpenMesh, faces: StackFaces, rule: PlaquetteRule, start: Float64Array): StackArm {
  const state = emptyStackPlaquette(mesh, faces)

  for (let l = 0; l < start.length; l++) state.line[l] = Math.round(rule.unit * start[l]!)

  return { rule, state, start: duplicateStackPlaquette(state), bare: Float64Array.from(state.line), drags: [], tally: { lineWraps: 0, faceWraps: 0 }, gaussOff: 0, huskGap: 0, largestLine: 0, largestTurn: 0, beats: 0 }
}

export type StackArmScratch = { plaquette: StackPlaquetteScratch; drag: Float64Array; divA: Float64Array; divB: Float64Array }

export const stackArmScratch = (mesh: OpenMesh, faces: StackFaces): StackArmScratch => ({ plaquette: stackPlaquetteScratch(mesh, faces), drag: new Float64Array(mesh.links), divA: new Float64Array(mesh.docks), divB: new Float64Array(mesh.docks) })

// the divergence over the husk's lateral links alone, at husk docks
function huskDivergence(mesh: OpenMesh, field: ArrayLike<number>, out: Float64Array): void {
  out.fill(0, 0, mesh.huskDocks)
  for (let l = 0; l < mesh.huskDocks * 9; l++) {
    const v = field[l]!

    if (v === 0) continue
    out[mesh.tail[l]!] = out[mesh.tail[l]!]! + v
    out[mesh.head[l]!] = out[mesh.head[l]!]! - v
  }
}

// one beat toward the target field (whole lines per husk link)
export function feedStackArm(mesh: OpenMesh, faces: StackFaces, arm: StackArm, target: Float64Array, scratch: StackArmScratch): void {
  const { drag } = scratch
  const at: number[] = []

  drag.fill(0)
  for (let l = 0; l < target.length; l++) {
    const next = Math.round(arm.rule.unit * target[l]!)

    drag[l] = next - arm.bare[l]!
    arm.bare[l] = next
    if (drag[l] !== 0) at.push(l)
  }

  arm.drags.push({ at: Int32Array.from(at), value: Float64Array.from(at, l => drag[l]!) })
  stackPlaquetteBeat(faces, arm.rule, arm.state, drag, scratch.plaquette, arm.tally)
  arm.beats++

  openDivergence(mesh, arm.state.line, scratch.divA)
  openDivergence(mesh, arm.bare, scratch.divB)
  for (let y = 0; y < mesh.docks; y++) if (scratch.divA[y] !== scratch.divB[y]) arm.gaussOff++

  huskDivergence(mesh, arm.state.line, scratch.divA)
  huskDivergence(mesh, arm.bare, scratch.divB)
  for (let y = 0; y < mesh.huskDocks; y++) arm.huskGap = Math.max(arm.huskGap, Math.abs(scratch.divA[y]! - scratch.divB[y]!) / arm.rule.unit)

  for (const v of arm.state.line) arm.largestLine = Math.max(arm.largestLine, Math.abs(v) / arm.rule.unit)
  for (const v of arm.state.face) arm.largestTurn = Math.max(arm.largestTurn, Math.abs(v) / arm.rule.unit)
}

// every beat back through the recorded drags; true if the register returns to its start bit for bit
export function reverseStackArm(faces: StackFaces, arm: StackArm, scratch: StackArmScratch): boolean {
  const s = duplicateStackPlaquette(arm.state)
  const { drag } = scratch

  for (let t = arm.drags.length - 1; t >= 0; t--) {
    const d = arm.drags[t]!

    drag.fill(0)
    d.at.forEach((l, i) => (drag[l] = d.value[i]!))
    stackPlaquetteBeatBack(faces, arm.rule, s, drag, scratch.plaquette)
  }

  return sameStackPlaquette(s, arm.start)
}

// the register in whole lines, every stack link
export const stackWholeLines = (arm: StackArm): Float64Array => Float64Array.from(arm.state.line, v => v / arm.rule.unit)

// the husk's lateral links of a stack field
export const huskLinks = (mesh: OpenMesh, line: Float64Array): Float64Array => line.slice(0, mesh.huskDocks * 9)

// THE STACK'S GRADIENT FIELD of a line field: its stack divergence rho, the Poisson solve L x = rho on the stack's
// weights (code/measure/open-husk greenSolve), and F = g (x_tail - x_head) on every link. The static field the rule
// relaxes toward (code/rule/stack-plaquette's header), curl free by construction, its stack divergence rho
export function stackGradient(mesh: OpenMesh, line: ArrayLike<number>, tolerance = 1e-11): { flux: Float64Array; x: Float64Array; residual: number } {
  const rho = new Float64Array(mesh.docks)

  openDivergence(mesh, line, rho)

  const solved = greenSolve(mesh, rho, tolerance)
  const flux = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) flux[m] = mesh.weight[m]! * linkLapse(mesh, m) * (solved.x[mesh.tail[m]!]! - solved.x[mesh.head[m]!]!)

  return { flux, x: solved.x, residual: solved.residual }
}

// the field energy 1/2 sum E^2 / g and its gradient part's, with the rest (E - F_grad, curl and winding, orthogonal to
// the gradient in this metric) split by region: husk links whose tail is within `radius` of the source (husk distance
// `dist`), the other husk links, and the bulk's links (bulk laterals and every vertical)
export type WaveSplit = { energy: number; gradient: number; rest: number; restInside: number; restHuskOutside: number; restBulk: number }

export function waveSplit(mesh: OpenMesh, line: Float64Array, gradient: Float64Array, dist: Int32Array, radius: number): WaveSplit {
  const out: WaveSplit = { energy: 0, gradient: 0, rest: 0, restInside: 0, restHuskOutside: 0, restBulk: 0 }
  const husk = mesh.huskDocks * 9

  for (let m = 0; m < mesh.links; m++) {
    const g = mesh.weight[m]!
    const e = line[m]!
    const d = gradient[m]!
    const r = ((e - d) * (e - d)) / (2 * g)

    out.energy += (e * e) / (2 * g)
    out.gradient += (d * d) / (2 * g)
    out.rest += r
    if (m >= husk) out.restBulk += r
    else if (dist[mesh.tail[m]!]! <= radius) out.restInside += r
    else out.restHuskOutside += r
  }

  return out
}

// the turns' energy B^2 / (4 kappa) in whole lines (the leapfrog's kept energy is E^2 / 2g + B^2 / 4 kappa in these
// units), split: husk faces within `radius`, other husk faces, the husk's vertical faces (the seam: each holds one husk
// link), and every deeper face
export type TurnSplit = { inside: number; huskOutside: number; seam: number; deep: number }

export function turnSplit(faces: StackFaces, face: Float64Array, rule: PlaquetteRule, dist: Int32Array, radius: number): TurnSplit {
  const out: TurnSplit = { inside: 0, huskOutside: 0, seam: 0, deep: 0 }
  const scale = rule.q / (4 * rule.a * rule.unit * rule.unit)

  for (let f = 0; f < faces.count; f++) {
    const e = face[f]! * face[f]! * scale

    if (faces.kind[f] === FACE_HUSK) {
      if (dist[faces.dock[f]!]! <= radius) out.inside += e
      else out.huskOutside += e
    } else if (faces.kind[f] === FACE_VERTICAL && faces.layer[f] === 0) out.seam += e
    else out.deep += e
  }

  return out
}

// the largest eigenvalue of M^(1/2) C^T C M^(1/2) (the leapfrog is stable for kappa times it under 4), by power
// iteration from a Weyl sequence; `beats` iterations
export function stackStiffness(faces: StackFaces, links: number, beats: number): number {
  const root = Float64Array.from(faces.metric, Math.sqrt)
  let v = Float64Array.from({ length: links }, (_, i) => ((i * 0.6180339887498949) % 1) - 0.5)
  const curl = new Float64Array(faces.count)
  const u = new Float64Array(links)
  let lambda = 0

  for (let it = 0; it < beats; it++) {
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

    for (let i = 0; i < links; i++) u[i] = (v[i]! / norm) * root[i]! / faces.metric[i]!
    // C M (M^-1/2 v) = C M^(1/2) v
    stackFaceCurl(faces, u, curl)

    const w = new Float64Array(links)

    addStackBoundary(faces, curl, w)
    for (let i = 0; i < links; i++) w[i] = w[i]! * root[i]!
    lambda = w.reduce((s, x, i) => s + x * (v[i]! / norm), 0)
    v = w
  }

  return lambda
}
