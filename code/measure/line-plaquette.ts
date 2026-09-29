// Measurement for E-GRV-0130: code/rule/line-plaquette driven by a source's own energy lines, read as a depth the way
// E-GRV-0127 read the bare lines. Real numbers live here only.
//
// THE DRIVE. The rule's drag is whole lines per entry; a ring form's EXPECTED register (E-GRV-0127's lines, weighted by
// amplitude) is a float. The plaquette rule takes whole register units, so an arm is fed a target field each beat and
// drags round(U target) - round(U previous target): the rounding is carried (the running sum of the drag is round(U
// target) exactly), the drive is off the expectation by under half a register unit per link, and given that drive the
// rule is integers and runs back bit for bit. A drive that is already whole lines (E-GRV-0107's pair) is not rounded.
//
// THE REGISTER CARRIED MOD 3. The drift cost's string is the energy register mod 3 (E-GRV-0127, residue 0 on every
// link, entry and beat), in balanced form bal(L) in {-1, 0, 1}. `expectedString` is its expectation, the source of the
// mod-3 arm.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES.

import { divergence } from '@/code/rule/step-depth'
import { radionWeight, type RadionMesh } from '@/code/rule/trit-radion'
import {
  duplicatePlaquette,
  emptyPlaquette,
  faceCurl,
  plaquetteBeat,
  plaquetteBeatBack,
  plaquetteScratch,
  samePlaquette,
  type HuskFaces,
  type PlaquetteRule,
  type PlaquetteScratch,
  type PlaquetteState,
  type PlaquetteTally,
} from '@/code/rule/line-plaquette'
import { staticDepth } from '@/code/measure/energy-lines'
import {
  gaussLines,
  type Sectors,
} from '@/code/measure/trio-energy-lines'

type C = [number, number]

const weightOf = (a: C): number => a[0] ** 2 + a[1] ** 2
const mod = (a: number, m: number): number => ((a % m) + m) % m

// the balanced residue of an integer mod 3
export const balanced3 = (v: number): number => mod(v + 1, 3) - 1

// the expected balanced mod-3 register on the ring's links (E-GRV-0127's gauge: L(k) = Q(k) - N - n [k >= s])
export function expectedString(
  L: number,
  s: number,
  state: Sectors,
): Float64Array {
  const out = new Float64Array(L)
  const g = new Int32Array(L)

  for (const [N, st] of state) {
    for (const { ts, amp } of st.values()) {
      const w = weightOf(amp)

      gaussLines(L, s, ts, N, g)

      for (let k = 0; k < L; k++) {
        out[k]! += w * balanced3(g[k]!)
      }
    }
  }

  return out
}

// ---- an arm: one plaquette register fed a target field beat by beat ----

// one beat's drag, the links it touches and by how much
export type SparseDrag = { at: Int32Array; value: Float64Array }

export type PlaquetteArm = {
  readonly rule: PlaquetteRule
  readonly moving: boolean
  readonly state: PlaquetteState
  readonly start: PlaquetteState
  // the running sum of the drag (the register with no move), whole register units
  readonly bare: Float64Array
  readonly drags: SparseDrag[]
  readonly tally: PlaquetteTally
  // docks where div E differs from div of the bare register, summed over beats (P1: exactly 0), and where it differs
  // modulo the window (a register carried mod 3 keeps Gauss mod 3)
  gaussOff: number
  gaussOffWindow: number
  beats: number
}

// an arm whose beat-0 register is round(U start), in whole register units
export function plaquetteArm(
  mesh: RadionMesh,
  faces: HuskFaces,
  rule: PlaquetteRule,
  start: Float64Array,
  moving: boolean,
): PlaquetteArm {
  const state = emptyPlaquette(mesh, faces)

  for (let l = 0; l < start.length; l++) {
    state.line[l] = Math.round(rule.unit * start[l]!)
  }

  return {
    rule,
    moving,
    state,
    start: duplicatePlaquette(state),
    bare: Float64Array.from(state.line),
    drags: [],
    tally: { lineWraps: 0, faceWraps: 0 },
    gaussOff: 0,
    gaussOffWindow: 0,
    beats: 0,
  }
}

export type ArmScratch = {
  plaquette: PlaquetteScratch
  divA: Float64Array
  divB: Float64Array
}

export const armScratch = (
  mesh: RadionMesh,
  faces: HuskFaces,
): ArmScratch => ({
  plaquette: plaquetteScratch(mesh, faces),
  divA: new Float64Array(mesh.docks),
  divB: new Float64Array(mesh.docks),
})

// one beat toward the target field (whole lines per husk link)
export function feedArm(
  mesh: RadionMesh,
  faces: HuskFaces,
  arm: PlaquetteArm,
  target: Float64Array,
  scratch: ArmScratch,
): void {
  const drag = new Float64Array(target.length)

  for (let l = 0; l < target.length; l++) {
    const next = Math.round(arm.rule.unit * target[l]!)

    drag[l] = next - arm.bare[l]!
    arm.bare[l] = next
  }

  const at: number[] = []

  for (let l = 0; l < drag.length; l++) {
    if (drag[l] !== 0) {
      at.push(l)
    }
  }

  arm.drags.push({
    at: Int32Array.from(at),
    value: Float64Array.from(at, l => drag[l]!),
  })

  plaquetteBeat(
    faces,
    arm.rule,
    arm.state,
    drag,
    scratch.plaquette,
    arm.tally,
    arm.moving,
  )
  arm.beats++

  divergence(mesh, arm.state.line, scratch.divA)
  divergence(mesh, arm.bare, scratch.divB)

  for (let y = 0; y < mesh.docks; y++) {
    const gap = scratch.divA[y]! - scratch.divB[y]!

    if (gap !== 0) {
      arm.gaussOff++
    }

    if (mod(gap, arm.rule.span) !== 0) {
      arm.gaussOffWindow++
    }
  }
}

// every beat back through the recorded drags; true if the register returns to its start bit for bit
export function reverseArm(
  faces: HuskFaces,
  arm: PlaquetteArm,
  scratch: ArmScratch,
): boolean {
  const s = duplicatePlaquette(arm.state)
  const drag = new Float64Array(s.line.length)

  for (let t = arm.drags.length - 1; t >= 0; t--) {
    const d = arm.drags[t]!

    drag.fill(0)
    d.at.forEach((l, i) => (drag[l] = d.value[i]!))
    plaquetteBeatBack(
      faces,
      arm.rule,
      s,
      drag,
      scratch.plaquette,
      arm.moving,
    )
  }

  return samePlaquette(s, arm.start)
}

// the register in whole lines
export const wholeLines = (arm: PlaquetteArm): Float64Array =>
  Float64Array.from(arm.state.line, v => v / arm.rule.unit)

// ---- readings ----

// the sum of (C M E)^2 over faces whose first corner is within `radius` of the source column, and over all faces, in
// whole lines
export function curlEnergy(
  faces: HuskFaces,
  line: Float64Array,
  dist: Int32Array,
  radius: number,
  out: Float64Array,
): { inside: number; total: number; meanRadius: number } {
  faceCurl(faces, line, out)

  let inside = 0
  let total = 0
  let moment = 0

  for (let f = 0; f < faces.count; f++) {
    const c2 = out[f]! ** 2
    const r = dist[faces.dock[f]!]!

    total += c2
    moment += r * c2

    if (r <= radius) {
      inside += c2
    }
  }

  return { inside, total, meanRadius: total > 0 ? moment / total : 0 }
}

// the field's energy 1/2 sum E^2 / g, its gradient part's (the Poisson solve of its own divergence) and the rest
// (the curl and the winding): the two are orthogonal in this metric, so they add
export function fieldSplit(
  mesh: RadionMesh,
  side: number,
  line: Float64Array,
  dist: Int32Array,
  radius: number,
): {
  energy: number
  gradient: number
  rest: number
  restInside: number
} {
  const div = new Float64Array(mesh.docks)

  divergence(mesh, line, div)

  const grad = staticDepth(side, div).flux

  let energy = 0
  let gradient = 0
  let restInside = 0

  for (let l = 0; l < line.length; l++) {
    const g = radionWeight(l % 9)
    const e = line[l]!
    const d = grad[l]!

    energy += (e * e) / (2 * g)
    gradient += (d * d) / (2 * g)

    if (dist[Math.floor(l / 9)]! <= radius) {
      restInside += ((e - d) * (e - d)) / (2 * g)
    }
  }

  return { energy, gradient, rest: energy - gradient, restInside }
}

// idea 3c: how much of the field sits on the source's own husk line (`on`, the ring's husk links), and the largest line
// off it (a string bent off the line keeps whole lines along its new path; a field spread by the move does not)
export function lineShare(
  line: Float64Array,
  on: Set<number>,
): { onShare: number; onMax: number; offMax: number } {
  let onE = 0
  let all = 0
  let onMax = 0
  let offMax = 0

  for (let l = 0; l < line.length; l++) {
    const e = line[l]!
    const w = (e * e) / radionWeight(l % 9)

    all += w

    if (on.has(l)) {
      onE += w
      onMax = Math.max(onMax, Math.abs(e))
    } else {
      offMax = Math.max(offMax, Math.abs(e))
    }
  }

  return { onShare: all > 0 ? onE / all : 0, onMax, offMax }
}

// Gauss through husk balls about `col` (0127's G1): the largest |outflow - content inside| over radii 0 .. `top`, the
// balls holding the sink skipped, and the balls off by more than `relativeTolerance` of their content or `floor`
export function ballGauss(
  mesh: RadionMesh,
  line: Float64Array,
  content: Float64Array,
  dist: Int32Array,
  sinkCol: number,
  top: number,
  relativeTolerance: number,
  floor: number,
): { gap: number; relative: number; off: number } {
  const div = new Float64Array(mesh.docks)

  divergence(mesh, line, div)

  let gap = 0
  let relative = 0
  let off = 0

  for (let rad = 0; rad <= top; rad++) {
    if (dist[sinkCol]! <= rad) {
      continue
    }

    let out = 0
    let inside = 0

    for (let c = 0; c < mesh.docks; c++) {
      if (dist[c]! > rad) {
        continue
      }

      out += div[c]!
      inside += content[c]!
    }

    gap = Math.max(gap, Math.abs(out - inside))

    if (Math.abs(inside) > 1e-9) {
      relative = Math.max(
        relative,
        Math.abs(out - inside) / Math.abs(inside),
      )
    }

    if (
      Math.abs(out - inside) >
      Math.max(relativeTolerance * Math.abs(inside), floor)
    ) {
      off++
    }
  }

  return { gap, relative, off }
}
