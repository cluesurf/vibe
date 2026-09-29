// Measurement for the torn husk (E-GRV-0108, 0109): code/rule/horizon-husk. Real numbers live here only.
//
// THE ENERGY is code/measure/open-husk's with the torn links' held steps counted as content: with F1 the step now, F0
// one beat before (a torn link's is its held value), x1 and x0 the depths found by summing over the live links,
//   E = (pi / D) [ 1/2 sum_docks m_y v^2 / kappa + 1/2 sum_live F1 F0 / g - sum_docks rho'_y (x1 + x0) / 2 ],
// rho' = div f - div F_torn: between events the beat is the open husk's leapfrog on the live links with the source
// rho', so this is its invariant, kept to the carry levels.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import { newStepTally, type StepTally } from '@/code/rule/step-depth'
import {
  duplicateOpen,
  emptyOpen,
  HUSK_LATERAL,
  layerOf,
  openDivisor,
  openRestLow,
  sameOpen,
  VERTICAL,
  type OpenMesh,
  type OpenPath,
  type OpenState,
} from '@/code/rule/open-husk'
import {
  horizonBeat,
  horizonBeatBack,
  horizonDepth,
  horizonOf,
  horizonScratch,
  joinHorizon,
  leaveHorizon,
  tornLink,
  type HorizonRule,
  type HorizonScratch,
} from '@/code/rule/horizon-husk'
import { huskDistance, type StackMode } from '@/code/measure/open-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export function horizonEnergy(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
): { energy: number; curl: number } {
  const u = rule.unit
  const f0 = new Float64Array(mesh.links)
  const torn = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) {
      f0[m] = s.step[m]!
      torn[m] = s.step[m]!
      continue
    }

    const z = mesh.head[m]!
    const raw =
      s.step[m]! -
      mesh.weight[m]! *
        (s.rate[mesh.tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))
    const [span, top] =
      mesh.kind[m] === HUSK_LATERAL
        ? [rule.span, rule.top]
        : [rule.bulkSpan, rule.bulkTop]

    f0[m] = mod(raw + top, span) - top
  }

  const d1 = horizonDepth(mesh, s.step, horizon)
  const d0 = horizonDepth(mesh, f0, horizon)
  const source = new Float64Array(mesh.docks)

  // rho' = div f - div F_torn, in whole units
  for (let m = 0; m < mesh.links; m++) {
    const v = s.line[m]! - torn[m]! / u

    if (v === 0) {
      continue
    }

    source[mesh.tail[m]!] = source[mesh.tail[m]!]! + v

    if (mesh.head[m]! >= 0) {
      source[mesh.head[m]!] = source[mesh.head[m]!]! - v
    }
  }

  const kappa = rule.a / rule.q

  let kinetic = 0
  let links = 0
  let src = 0

  for (let y = 0; y < mesh.docks; y++) {
    kinetic +=
      (s.rate[y]! / u) ** 2 * (mesh.inertia ? mesh.inertia[y]! : 1)

    if (source[y] !== 0) {
      src += (source[y]! * (d1.twice[y]! + d0.twice[y]!)) / (4 * u)
    }
  }

  for (let m = 0; m < mesh.links; m++) {
    if (!tornLink(mesh, horizon, m)) {
      links += ((s.step[m]! / u) * (f0[m]! / u)) / mesh.weight[m]!
    }
  }

  return {
    energy:
      (Math.PI / rule.depth) *
      (kinetic / (2 * kappa) + links / 2 - src),
    curl: d1.curl + d0.curl,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the running record

export type HorizonRecord = {
  runs: number
  reversed: boolean
  beats: number
  gaussOff: number
  gaussChecks: number
  curl: number
  curlChecks: number
  // live links checked for curl over all checks, and of them vertical
  liveChecked: number
  verticalChecked: number
  wraps: StepTally
  restOff: number
  // largest |F| (whole steps): husk lateral, vertical, bulk lateral by layer; largest |v|: husk off the horizon, other
  huskStep: number
  verticalStep: number
  bulkStep: number[]
  huskRate: number
  bulkRate: number
  // the largest |E(t) - E(event)| over every check, and the static energy scale it is read against
  energyDrift: number
  energyChecks: number
}

export const newHorizonRecord = (): HorizonRecord => ({
  runs: 0,
  reversed: true,
  beats: 0,
  gaussOff: 0,
  gaussChecks: 0,
  curl: 0,
  curlChecks: 0,
  liveChecked: 0,
  verticalChecked: 0,
  wraps: newStepTally(),
  restOff: 0,
  huskStep: 0,
  verticalStep: 0,
  bulkStep: [],
  huskRate: 0,
  bulkRate: 0,
  energyDrift: 0,
  energyChecks: 0,
})

function observe(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  record: HorizonRecord,
): void {
  for (let m = 0; m < mesh.links; m++) {
    const F = Math.abs(s.step[m]!) / rule.unit

    if (mesh.kind[m] === HUSK_LATERAL) {
      record.huskStep = Math.max(record.huskStep, F)
    } else if (mesh.kind[m] === VERTICAL) {
      record.verticalStep = Math.max(record.verticalStep, F)
    } else {
      const k = layerOf(mesh, mesh.tail[m]!)

      record.bulkStep[k] = Math.max(record.bulkStep[k] ?? 0, F)
    }
  }

  for (let y = 0; y < mesh.docks; y++) {
    const v = Math.abs(s.rate[y]!) / rule.unit
    const q = openDivisor(mesh, rule, y)
    const low = openRestLow(q)

    if (y < mesh.huskDocks && horizon[y] === 0) {
      record.huskRate = Math.max(record.huskRate, v)
    } else {
      record.bulkRate = Math.max(record.bulkRate, v)
    }

    if (
      s.rest[y]! < -low ||
      s.rest[y]! > q - 1 - low ||
      !Number.isInteger(s.rest[y]!)
    ) {
      record.restOff++
    }
  }
}

function checkDepth(
  mesh: OpenMesh,
  s: OpenState,
  horizon: Uint8Array,
  record: HorizonRecord,
): void {
  const d = horizonDepth(mesh, s.step, horizon)

  record.curl += d.curl
  record.curlChecks++
  record.liveChecked += d.checked

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] === VERTICAL) {
      record.verticalChecked++
    }
  }
}

function gaussAfterBeat(
  divLine: Float64Array,
  rho: Int32Array,
): number {
  let off = 0

  for (let y = 0; y < rho.length; y++) {
    if (divLine[y] !== rho[y]) {
      off++
    }
  }

  return off
}

// ---------------------------------------------------------------------------------------------------------
// the static run: from zero field with the lines placed, T beats (the Hann average of the steps), the energy checked
// every `every` beats against its start, then T back and compared bit for bit

export type HorizonStatic = {
  mean: Float64Array
  horizon: Uint8Array
  energy0: number
  energyEnd: number
  joins: number
  joinedBeats: number[]
  finalStep: Float64Array
}

// a placed start (E-GRV-0111): the state and horizon to begin from instead of zero field and the lines' horizon, and a
// read after every beat that may join docks (code/rule/clock-horizon clockJoin); a join is an event for the energy, its
// docks recorded by beat and cleared when that beat is undone
export type PlacedStart = {
  state: OpenState
  horizon: Uint8Array
  afterBeat?: (s: OpenState, horizon: Uint8Array) => number[]
}

export function horizonStaticRun(
  mesh: OpenMesh,
  rule: HorizonRule,
  rho: Int32Array,
  line: Int8Array,
  beats: number,
  record: HorizonRecord,
  every = 64,
  tear = true,
  placed?: PlacedStart,
): HorizonStatic {
  const s = placed ? duplicateOpen(placed.state) : emptyOpen(mesh)

  s.line.set(line)

  const horizon = placed
    ? Uint8Array.from(placed.horizon)
    : tear
      ? horizonOf(mesh, s.line)
      : new Uint8Array(mesh.huskDocks)
  const startHorizon = Uint8Array.from(horizon)
  const start = duplicateOpen(s)
  const scratch = horizonScratch(mesh)
  const mean = new Float64Array(mesh.links)
  const e0 = horizonEnergy(mesh, rule, s, horizon).energy
  const joinedAfter = new Map<number, number[]>()

  let eRef = e0
  let eEnd = e0
  let weight = 0
  let joins = 0

  for (let t = 1; t <= beats; t++) {
    horizonBeat(mesh, rule, s, horizon, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussAfterBeat(scratch.divLine, rho)
    record.gaussChecks++

    if (t % every === 0 || t === beats) {
      checkDepth(mesh, s, horizon, record)
      observe(mesh, rule, s, horizon, record)
      eEnd = horizonEnergy(mesh, rule, s, horizon).energy
      record.energyDrift = Math.max(
        record.energyDrift,
        Math.abs(eEnd - eRef),
      )
      record.energyChecks++
    }

    if (placed?.afterBeat) {
      const before = Uint8Array.from(horizon)
      const joined = placed.afterBeat(s, horizon)

      if (joined.length > 0) {
        joinedAfter.set(t, joined)
        joins += joined.length
        // the energy is kept between joins: read just before the join against its value after the last one
        record.energyDrift = Math.max(
          record.energyDrift,
          Math.abs(horizonEnergy(mesh, rule, s, before).energy - eRef),
        )
        eRef = horizonEnergy(mesh, rule, s, horizon).energy
      }
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

  const finalStep = Float64Array.from(s.step)

  for (let t = beats; t >= 1; t--) {
    leaveHorizon(horizon, joinedAfter.get(t) ?? [])
    horizonBeatBack(mesh, rule, s, horizon, scratch)
  }

  for (let m = 0; m < mean.length; m++) {
    mean[m] = mean[m]! / weight
  }

  record.runs++
  record.reversed =
    record.reversed &&
    sameOpen(s, start) &&
    horizon.every((v, y) => v === startHorizon[y])

  const finalHorizon = Uint8Array.from(startHorizon)

  for (const joined of joinedAfter.values()) {
    for (const y of joined) {
      finalHorizon[y] = 1
    }
  }

  return {
    mean,
    horizon: finalHorizon,
    energy0: e0,
    energyEnd: eEnd,
    joins,
    joinedBeats: [...joinedAfter.keys()],
    finalStep,
  }
}

// the depth found by summing a real step field over the live links (whole steps)
export const realHorizonDepth = (
  mesh: OpenMesh,
  step: Float64Array,
  horizon: Uint8Array,
): Float64Array =>
  horizonDepth(mesh, step, horizon).twice.map(t => t / 2)

// ---------------------------------------------------------------------------------------------------------
// the growing lump: units of content added by scheduled events

// one unit added: +1 at `at`, -1 at the sink the path ends at, the line along the path (husk lateral links, each with
// the sign of its change), applied after beat `beat`
export type Addition = {
  beat: number
  at: number
  sink: number
  path: OpenPath
}

export type GrowthSample = {
  beat: number
  units: number
  horizonDocks: number
  horizonRadius: number
  huskStep: number
  verticalStep: number
  downFlux: number
  upFlux: number
}

export type GrowthRun = {
  final: OpenState
  horizon: Uint8Array
  rho: Int32Array
  reversed: boolean
  samples: GrowthSample[]
  eventEnergy: number[]
}

// the beat a growth run drives, its inverse and its kept energy, for a fixed horizon (the torn husk's by default; the
// horizon with no hair's is code/measure/count-horizon countEngine). The scratch's divLine holds div f after a beat.
export type HorizonEngine<S extends HorizonScratch = HorizonScratch> = {
  scratch(): S
  beat(
    s: OpenState,
    horizon: Uint8Array,
    scratch: S,
    tally?: StepTally,
  ): void
  back(s: OpenState, horizon: Uint8Array, scratch: S): void
  energy(s: OpenState, horizon: Uint8Array): number
}

export const tornEngine = (
  mesh: OpenMesh,
  rule: HorizonRule,
): HorizonEngine => ({
  scratch: () => horizonScratch(mesh),
  beat: (s, horizon, scratch, tally) =>
    horizonBeat(mesh, rule, s, horizon, scratch, tally),
  back: (s, horizon, scratch) =>
    horizonBeatBack(mesh, rule, s, horizon, scratch),
  energy: (s, horizon) => horizonEnergy(mesh, rule, s, horizon).energy,
})

// from zero field with no content, `beats` beats; each addition applied after its beat, the horizon read from the lines
// after every event; the energy checked on EVERY beat against its value just after the last event (the beat keeps it
// between events); then every beat and event undone back to the start and compared bit for bit. With `afterBeat` (the
// clock horizon, code/rule/clock-horizon clockJoin) the horizon is ALSO read after every beat, the docks it joins
// recorded by beat and cleared when that beat is undone; a join is an event for the energy (its jump is recorded).
// `engine` is the beat driven (the torn husk's by default).
export function growthRun(
  mesh: OpenMesh,
  rule: HorizonRule,
  additions: readonly Addition[],
  beats: number,
  record: HorizonRecord,
  center: readonly number[],
  sampleEvery: number,
  keep?: (
    t: number,
    s: OpenState,
    horizon: Uint8Array,
    rho: Int32Array,
  ) => void,
  tear = true,
  afterBeat?: (s: OpenState, horizon: Uint8Array) => number[],
  engine: HorizonEngine = tornEngine(mesh, rule),
): GrowthRun {
  const s = emptyOpen(mesh)
  const start = duplicateOpen(s)
  const scratch = engine.scratch()
  const rho = new Int32Array(mesh.docks)
  const horizon = new Uint8Array(mesh.huskDocks)
  const startHorizon = Uint8Array.from(horizon)

  let eRef = engine.energy(s, horizon)

  const samples: GrowthSample[] = []
  const eventEnergy: number[] = []
  // the docks each event's beat set in the horizon (undone with it), by beat
  const joinedAt = new Map<number, number[]>()
  // the docks the read after beat t joined
  const joinedAfter = new Map<number, number[]>()

  let next = 0
  let units = 0

  const sample = (t: number): void => {
    let docks = 0
    let radius = 0
    let husk = 0
    let vertical = 0
    let down = 0
    let up = 0

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (horizon[y]) {
        ;(docks++,
          (radius = Math.max(radius, huskDistance(mesh, y, center))))
      }
    }

    for (let m = 0; m < mesh.links; m++) {
      const F = s.step[m]! / rule.unit

      if (mesh.kind[m] === HUSK_LATERAL) {
        husk = Math.max(husk, Math.abs(F))
      } else if (mesh.kind[m] === VERTICAL) {
        vertical = Math.max(vertical, Math.abs(F))

        if (mesh.tail[m]! < mesh.huskDocks && horizon[mesh.tail[m]!]) {
          F > 0 ? (down += F) : (up -= F)
        }
      }
    }

    samples.push({
      beat: t,
      units,
      horizonDocks: docks,
      horizonRadius: radius,
      huskStep: husk,
      verticalStep: vertical,
      downFlux: down,
      upFlux: up,
    })
  }

  for (let t = 1; t <= beats; t++) {
    let changed = false

    while (next < additions.length && additions[next]!.beat === t - 1) {
      const add = additions[next]!

      for (const [l, sg] of add.path) {
        s.line[l] = s.line[l]! + sg
      }

      rho[add.at]!++
      rho[add.sink]!--
      units++
      next++
      changed = true
    }

    if (changed) {
      eventEnergy.push(engine.energy(s, horizon) - eRef)

      if (tear) {
        joinedAt.set(t, joinHorizon(mesh, s.line, horizon))
      }

      eRef = engine.energy(s, horizon)
    }

    engine.beat(s, horizon, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussAfterBeat(scratch.divLine, rho)
    record.gaussChecks++

    const e = { energy: engine.energy(s, horizon) }

    record.energyDrift = Math.max(
      record.energyDrift,
      Math.abs(e.energy - eRef),
    )
    record.energyChecks++

    if (afterBeat) {
      const joined = afterBeat(s, horizon)

      if (joined.length > 0) {
        joinedAfter.set(t, joined)

        const after = engine.energy(s, horizon)

        eventEnergy.push(after - e.energy)
        eRef = after
      }
    }

    if (t % sampleEvery === 0 || t === beats) {
      checkDepth(mesh, s, horizon, record)
      observe(mesh, rule, s, horizon, record)
      sample(t)
    }

    keep?.(t, s, horizon, rho)
  }

  const final = duplicateOpen(s)
  const finalHorizon = Uint8Array.from(horizon)
  const finalRho = Int32Array.from(rho)

  next = additions.length - 1

  for (let t = beats; t >= 1; t--) {
    leaveHorizon(horizon, joinedAfter.get(t) ?? [])
    engine.back(s, horizon, scratch)

    while (next >= 0 && additions[next]!.beat === t - 1) {
      const add = additions[next]!

      for (const [l, sg] of add.path) {
        s.line[l] = s.line[l]! - sg
      }

      rho[add.at]!--
      rho[add.sink]!++
      next--
    }

    leaveHorizon(horizon, joinedAt.get(t) ?? [])
  }

  const reversed =
    sameOpen(s, start) && horizon.every((v, i) => v === startHorizon[i])

  record.runs++
  record.reversed = record.reversed && reversed

  return {
    final,
    horizon: finalHorizon,
    rho: finalRho,
    reversed,
    samples,
    eventEnergy,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the prediction: where the demanded husk step reaches the window's edge (theory, not the rule)
//
// A lump of M seen from outside is a point source: the husk's depth is M G(r), and the steepest husk step is on an
// axis link (weight 2, one dock long), F = 2 M |G'(r)|. The horizon's radius is where that reaches the window's edge
// `window` (3/2 for the trit). On the husk alone G = 1 / (24 pi r) (its L = 6 p^2), so 2 M / (24 pi r^2) = window gives
//   r = sqrt(M / (12 pi window)) = sqrt(M / (18 pi)) for the trit,
// a radius that goes as sqrt(M), the area law: the bound is on the step (the field), so the horizon is where M over the
// area reaches it. On a stack G = sum_n w_n e^(-m_n r) / (4 pi r) (code/measure/open-husk stackGreen), the same as the
// husk alone's at r << 1 / m_n (sum w_n = 1 / 6), and smaller beyond, so the stack's radius is at or under the husk's.
export const huskWindowRadius = (m: number, window: number): number =>
  Math.sqrt(m / (12 * Math.PI * window))

export function stackWindowRadius(
  modes: readonly StackMode[],
  m: number,
  window: number,
): number {
  const slope = (r: number): number =>
    (2 *
      m *
      modes.reduce(
        (t, mode) =>
          t +
          mode.weight * Math.exp(-mode.mass * r) * (1 + mode.mass * r),
        0,
      )) /
    (4 * Math.PI * r * r)

  let lo = 0.05
  let hi = 200

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    if (slope(mid) >= window) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return lo
}

// the vertical link of each husk dock (the one link from it to layer 1), -1 with no bulk
export function verticalOf(mesh: OpenMesh): Int32Array {
  const out = new Int32Array(mesh.huskDocks).fill(-1)

  for (let y = 0; y < mesh.huskDocks; y++) {
    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      if (mesh.kind[mesh.incLink[j]!] === VERTICAL) {
        out[y] = mesh.incLink[j]!
      }
    }
  }

  return out
}

// the field energy held by the horizon's own docks and their vertical links (the leaves the tear left): their
// kinetic part and their vertical links' part, on the scale pi / D
export function horizonLeafEnergy(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  vertical: Int32Array,
): number {
  const u = rule.unit
  const kappa = rule.a / rule.q

  let e = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (!horizon[y]) {
      continue
    }

    const m = vertical[y]!
    const f1 = s.step[m]!
    const f0 =
      f1 - mesh.weight[m]! * (s.rate[y]! - s.rate[mesh.head[m]!]!)

    e +=
      ((s.rate[y]! / u) ** 2 * (mesh.inertia ? mesh.inertia[y]! : 1)) /
        (2 * kappa) +
      ((f1 / u) * (f0 / u)) / (2 * mesh.weight[m]!)
  }

  return (Math.PI / rule.depth) * e
}

// the mesh with the torn links' weights 0 (for the linear solve of the torn statics, a second method)
export function tornMesh(
  mesh: OpenMesh,
  horizon: Uint8Array,
): OpenMesh {
  const weight = Int8Array.from(mesh.weight)

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) {
      weight[m] = 0
    }
  }

  return { ...mesh, weight }
}
