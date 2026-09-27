// Measurement for the bounded depth field (E-GRV-0090, 0091): code/rule/step-depth. Real numbers live here only.
//
// THE ENERGY. The rule's shadow is the radion's leapfrog (code/rule/step-depth header), so it keeps the radion's
// invariant (code/measure/radion), written in steps and rates: with F1 the step now, F0 the step one beat before (F1 less
// g times the difference of the rates) and x1, x0 the depths found by summing F1 / g and F0 / g,
//   E = (pi / D) [ 1/2 sum_docks v^2 / kappa + 1/2 sum_links F1 F0 / g - sum_docks rho (x1 + x0) / 2 ]
// the radion's energy E = 1/2 sum steps^2 - sum content . depth with its kinetic part, on the scale pi / D of E-GRV-0079
// (so every number here is comparable with that code's). rho . x uses the depth FOUND by summation; the local form sum
// f F / g (lines times steps) is the same number when F has no curl, and is reported as a check.
//
// THE STATIC READING, as E-GRV-0079: from zero field with the lines placed, T beats, the Hann-weighted time average F_bar
// of the steps (the depth x_bar found by summing it), E(F_bar) = (pi / D)(1/2 sum F_bar^2 / g - rho . x_bar).
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { emptyRadion, radionBeat, radionMesh, radionRule, radionScratch, radionWeight, type RadionMesh } from '@/code/rule/trit-radion'
import { shadow } from '@/code/measure/radion'
import { applyPath, duplicateStep, emptyStep, fittingPath, gaussOff, hopPaths, incidence, newStepTally, placeLines, sameStep, stepBeat, stepBeatBack, stepDepth, stepRule, stepScratch, type LinePath, type StepRule, type StepState, type StepTally } from '@/code/rule/step-depth'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export const kappaOfStep = (rule: StepRule): number => rule.a / rule.q

export function dockAt(mesh: RadionMesh, v: readonly number[]): number {
  const [sx, sy, sz] = mesh.sides

  return mod(v[0]!, sx) + sx * mod(v[1]!, sy) + sx * sy * mod(v[2]!, sz)
}

export const coordOf = (mesh: RadionMesh, y: number): number[] => [y % mesh.sides[0], Math.floor(y / mesh.sides[0]) % mesh.sides[1], Math.floor(y / (mesh.sides[0] * mesh.sides[1]))]

// the torus distance between two docks
export function torusDistance(mesh: RadionMesh, y: number, center: readonly number[]): number {
  const p = coordOf(mesh, y)

  return Math.sqrt(p.reduce((s, v, i) => s + Math.min(mod(v - center[i]!, mesh.sides[i]!), mod(center[i]! - v, mesh.sides[i]!)) ** 2, 0))
}

// a content map: `units` at each `at` and minus that at `to`
export type Placed = { at: readonly number[]; to: readonly number[]; units: number }

export function contentOf(mesh: RadionMesh, sources: readonly Placed[]): Int32Array {
  const rho = new Int32Array(mesh.docks)

  for (const s of sources) {
    rho[dockAt(mesh, s.at)] = rho[dockAt(mesh, s.at)]! + s.units
    rho[dockAt(mesh, s.to)] = rho[dockAt(mesh, s.to)]! - s.units
  }

  return rho
}

// the previous beat's steps, recovered from the state: F0 = wrap(F1 - g (v_tail - v_head))
export function previousStep(mesh: RadionMesh, rule: StepRule, s: StepState): Float64Array {
  const out = new Float64Array(s.step.length)

  for (let y = 0; y < mesh.docks; y++) {
    for (let h = 0; h < 9; h++) {
      const l = y * 9 + h

      out[l] = mod(s.step[l]! - radionWeight(h) * (s.rate[y]! - s.rate[mesh.neighbour[l]!]!) + rule.top, rule.span) - rule.top
    }
  }

  return out
}

export type StepEnergy = { energy: number; free: number; sourceFound: number; sourceLocal: number; curl: number }

export function stepEnergy(mesh: RadionMesh, rule: StepRule, s: StepState, rho: Int32Array): StepEnergy {
  const u = rule.unit
  const f0 = previousStep(mesh, rule, s)
  const d1 = stepDepth(mesh, s.step)
  const d0 = stepDepth(mesh, f0)
  const kappa = kappaOfStep(rule)
  let kinetic = 0
  let links = 0
  let sourceFound = 0
  let sourceLocal = 0

  for (let y = 0; y < mesh.docks; y++) {
    kinetic += (s.rate[y]! / u) ** 2
    sourceFound += (rho[y]! * (d1.twice[y]! + d0.twice[y]!)) / (4 * u)

    for (let h = 0; h < 9; h++) {
      const l = y * 9 + h
      const g = radionWeight(h)

      links += (s.step[l]! / u) * (f0[l]! / u) / g
      sourceLocal += (s.line[l]! * (s.step[l]! + f0[l]!)) / (2 * u * g)
    }
  }

  const scale = Math.PI / rule.depth
  const free = scale * (kinetic / (2 * kappa) + links / 2)

  return { energy: free - scale * sourceFound, free, sourceFound, sourceLocal, curl: d1.curl + d0.curl }
}

// the static functional at a real step field (depth found by summation, in reals)
export function staticStepFunctional(mesh: RadionMesh, rule: StepRule, step: Float64Array, rho: Int32Array): number {
  const [sx, sy, sz] = mesh.sides
  const x = new Float64Array(mesh.docks)

  for (let c = 0; c < sz; c++) {
    for (let b = 0; b < sy; b++) {
      for (let a = 0; a < sx; a++) {
        const y = a + sx * (b + sy * c)

        if (a > 0) x[y] = x[y - 1]! - step[(y - 1) * 9]! / 2
        else if (b > 0) x[y] = x[y - sx]! - step[(y - sx) * 9 + 1]! / 2
        else if (c > 0) x[y] = x[y - sx * sy]! - step[(y - sx * sy) * 9 + 2]! / 2
      }
    }
  }

  let quad = 0
  let source = 0

  for (let y = 0; y < mesh.docks; y++) {
    source += rho[y]! * x[y]!
    for (let h = 0; h < 9; h++) quad += step[y * 9 + h]! ** 2 / radionWeight(h)
  }

  return (Math.PI / rule.depth) * (quad / 2 - source)
}

// ---------------------------------------------------------------------------------------------------------
// the instrument's running record

export type StepRecord = {
  runs: number
  reversed: boolean
  // Gauss: docks where lines out minus lines in differ from the content, summed over every check
  gaussOff: number
  gaussChecks: number
  // links where the found depth is not the same along every path, summed over every check
  curl: number
  curlChecks: number
  wraps: StepTally
  // the largest |F|, |v| (in whole steps) and |R| seen
  maxStep: number
  maxRate: number
  maxRest: number
  // beats run forward
  beats: number
}

export const newRecord = (): StepRecord => ({ runs: 0, reversed: true, gaussOff: 0, gaussChecks: 0, curl: 0, curlChecks: 0, wraps: newStepTally(), maxStep: 0, maxRate: 0, maxRest: 0, beats: 0 })

function observe(rule: StepRule, s: StepState, record: StepRecord): void {
  for (let l = 0; l < s.step.length; l++) record.maxStep = Math.max(record.maxStep, Math.abs(s.step[l]!) / rule.unit)
  for (let y = 0; y < s.rate.length; y++) {
    record.maxRate = Math.max(record.maxRate, Math.abs(s.rate[y]!) / rule.unit)
    record.maxRest = Math.max(record.maxRest, Math.abs(s.rest[y]!))
  }
}

export type StaticStep = { mean: Float64Array; energy: number; tension: number }

// from zero field with the lines placed, T beats forward (Hann average of the steps), then T back, compared bit for bit
export function staticStepRun(mesh: RadionMesh, rule: StepRule, rho: Int32Array, beats: number, record: StepRecord): StaticStep {
  const s = emptyStep(mesh)

  s.line.set(placeLines(mesh, rho))

  const start = duplicateStep(s)
  const scratch = stepScratch(mesh)
  const mean = new Float64Array(s.step.length)
  let weight = 0

  for (let t = 1; t <= beats; t++) {
    stepBeat(mesh, rule, s, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussOff(mesh, s.line, rho)
    record.gaussChecks++
    if (t % 64 === 0 || t === beats) {
      record.curl += stepDepth(mesh, s.step).curl
      record.curlChecks++
      observe(rule, s, record)
    }

    const w = Math.sin((Math.PI * t) / beats) ** 2

    if (w === 0) continue
    for (let l = 0; l < mean.length; l++) mean[l] = mean[l]! + (w * s.step[l]!) / rule.unit
    weight += w
  }

  for (let t = 0; t < beats; t++) stepBeatBack(mesh, rule, s, scratch)

  for (let l = 0; l < mean.length; l++) mean[l] = mean[l]! / weight

  record.runs++
  record.reversed = record.reversed && sameStep(s, start)

  let tension = 0

  for (let l = 0; l < s.line.length; l++) tension += Math.abs(s.line[l]!)

  return { mean, energy: staticStepFunctional(mesh, rule, mean, rho), tension }
}

export type PairStep = { w: number; tensionW: number }

// E-GRV-0079's six configurations (code/measure/radion pairEnergy): sa at a = 0 and sb at b = (r, 0, 0), compensated at
// Z1 = (0, h, h), Z2 = (r, h, h), h = side / 2; the same combination of the lines' step counts (tension alone) beside it
export function pairStep(mesh: RadionMesh, rule: StepRule, r: number, sa: number, sb: number, beats: number, record: StepRecord): PairStep {
  const h = mesh.sides[0] / 2
  const a = [0, 0, 0]
  const b = [r, 0, 0]
  const z1 = [0, h, h]
  const z2 = [r, h, h]
  const u = (sources: Placed[]): StaticStep => staticStepRun(mesh, rule, contentOf(mesh, sources), beats, record)
  const c4 = u([
    { at: a, to: z1, units: sa },
    { at: b, to: z2, units: sb },
  ])
  const ca = u([{ at: a, to: z1, units: sa }])
  const cb = u([{ at: b, to: z2, units: sb }])
  const c12 = u([{ at: z1, to: z2, units: 1 }])
  const ca2 = u([{ at: a, to: z2, units: 1 }])
  const cb1 = u([{ at: b, to: z1, units: 1 }])
  const combine = (k: (c: StaticStep) => number): number => k(c4) - k(ca) - k(cb) + sa * sb * (k(c12) - k(ca2) - k(cb1))

  return { w: combine(c => c.energy), tensionW: combine(c => c.tension / 2) }
}

// ---------------------------------------------------------------------------------------------------------
// the densest lump the lines allow

// the links crossing the sphere of radius r about `center` (one end at distance <= r, the other beyond), the net lines
// leaving through them, and the content inside
export type Shell = { r: number; crossing: number; outward: number; inside: number }

export function shells(mesh: RadionMesh, line: Int8Array, content: Int32Array, center: readonly number[], radii: readonly number[]): Shell[] {
  const dist = Float64Array.from({ length: mesh.docks }, (_, y) => torusDistance(mesh, y, center))

  return radii.map(r => {
    let crossing = 0
    let outward = 0
    let inside = 0

    for (let y = 0; y < mesh.docks; y++) {
      if (dist[y]! <= r) inside += content[y]!

      for (let h = 0; h < 9; h++) {
        const l = y * 9 + h
        const z = mesh.neighbour[l]!
        const yin = dist[y]! <= r
        const zin = dist[z]! <= r

        if (yin === zin) continue
        crossing++
        outward += yin ? line[l]! : -line[l]!
      }
    }

    return { r, crossing, outward, inside }
  })
}

// each unit in the order it was placed: its dock, the sink its line ends at, and the line's links with the sign each
// changed by (applied in order from no lines, they give `line`: the lump grown one unit at a time, E-GRV-0109)
export type CompressedUnit = { at: number; sink: number; path: [number, number][] }

export type Compressed = { content: Int32Array; line: Int8Array; seconds: number; units: CompressedUnit[] }

// M units placed one at a time, each at the dock nearest the center (ties by dock index) from which a unit line can still
// reach a sink with room (breadth first backward over the links with room), and routed there: the densest lump the lines'
// capacity allows. The sinks: the M docks farthest from the center, one unit each (tmp/step-field-probe), or the M docks
// given (one unit each: E-GRV-0111's sinks spread over the far husk, spreadSinks)
export function compressLump(mesh: RadionMesh, center: readonly number[], m: number, capacity: number, sinks?: readonly number[]): Compressed {
  const t0 = Date.now()
  const inc = incidence(mesh)
  const dist = Float64Array.from({ length: mesh.docks }, (_, y) => torusDistance(mesh, y, center))
  const order = Array.from({ length: mesh.docks }, (_, y) => y).sort((p, q) => dist[p]! - dist[q]! || p - q)
  const content = new Int32Array(mesh.docks)
  const line = new Int8Array(mesh.docks * 9)
  const demand = new Int32Array(mesh.docks)
  const sink = new Uint8Array(mesh.docks)

  if (sinks && sinks.length !== m) throw new Error('compressLump: one sink a unit')
  for (const y of sinks ?? order.slice(mesh.docks - m)) (demand[y] = 1), (sink[y] = 1), (content[y] = -1)

  const reach = new Uint8Array(mesh.docks)
  const queue = new Int32Array(mesh.docks)
  const prev = new Int32Array(mesh.docks)
  const units: CompressedUnit[] = []
  const other = (l: number, sg: number): number => (sg > 0 ? mesh.neighbour[l]! : Math.floor(l / 9))

  for (let unit = 0; unit < m; unit++) {
    // backward: every dock that can send a unit to a sink with demand left
    reach.fill(0)

    let tail = 0

    for (let y = 0; y < mesh.docks; y++) if (demand[y]! > 0) (reach[y] = 1), (queue[tail++] = y)

    for (let head = 0; head < tail; head++) {
      const q = queue[head]!

      for (let k = 0; k < 18; k++) {
        const l = inc.link[q * 18 + k]!
        const sq = inc.sign[q * 18 + k]!
        const p = other(l, sq)

        // p sends to q along l: p's sign is -sq
        if (reach[p] || -sq * line[l]! >= capacity) continue
        reach[p] = 1
        queue[tail++] = p
      }
    }

    const from = order.find(y => reach[y] && !sink[y])

    if (from === undefined) throw new Error(`compressLump: unit ${unit} of ${m} has nowhere to go`)

    // forward: the nearest sink with demand from `from`
    prev.fill(-2)
    prev[from] = -1
    tail = 0
    queue[tail++] = from

    let found = -1

    for (let head = 0; head < tail && found < 0; head++) {
      const y = queue[head]!

      for (let k = 0; k < 18; k++) {
        const l = inc.link[y * 18 + k]!
        const sg = inc.sign[y * 18 + k]!

        if (sg * line[l]! >= capacity) continue

        const z = other(l, sg)

        if (prev[z] !== -2) continue
        prev[z] = y * 18 + k
        if (demand[z]! > 0) {
          found = z
          break
        }
        queue[tail++] = z
      }
    }

    let z = found
    const path: [number, number][] = []

    while (prev[z] !== -1) {
      const y = Math.floor(prev[z]! / 18)
      const k = prev[z]! % 18

      line[inc.link[y * 18 + k]!] = line[inc.link[y * 18 + k]!]! + inc.sign[y * 18 + k]!
      path.push([inc.link[y * 18 + k]!, inc.sign[y * 18 + k]!])
      z = y
    }

    demand[found]!--
    content[from]!++
    units.push({ at: from, sink: found, path })
  }

  return { content, line, seconds: (Date.now() - t0) / 1000, units }
}

// the distinct torus distances of docks from `center` up to `limit`, ascending
export function distinctRadii(mesh: RadionMesh, center: readonly number[], limit: number): number[] {
  const set = new Set<number>()

  for (let y = 0; y < mesh.docks; y++) {
    const d = torusDistance(mesh, y, center)

    if (d <= limit) set.add(Math.round(d * 1e9) / 1e9)
  }

  return [...set].sort((a, b) => a - b)
}

// the mean over directions of sum_h |u_h . n|: the links crossing a unit of area (the continuum count)
export const CROSSING_DENSITY = (3 + 6 * Math.SQRT2) / 2

// ---------------------------------------------------------------------------------------------------------
// runs with hops

export type Hop = { beat: number; from: readonly number[]; to: readonly number[]; units: number }

export type HopRun = {
  // per beat (1 .. beats), the state after the beat
  states?: StepState[]
  final: StepState
  // the paths each hop's units took, in order
  paths: LinePath[][]
  reversed: boolean
}

// from zero field with the lines of `rho0` placed, `beats` beats; each hop is applied before beat hop.beat + 1 (after beat
// hop.beat), unit by unit along the first fitting path; every beat Gauss's law is checked against the moving content;
// then everything is undone back to the start and compared bit for bit
export function hopRun(mesh: RadionMesh, rule: StepRule, rho0: Int32Array, hops: readonly Hop[], beats: number, record: StepRecord, keep?: (t: number, s: StepState) => void): HopRun {
  const s = emptyStep(mesh)

  s.line.set(placeLines(mesh, rho0))

  const start = duplicateStep(s)
  const scratch = stepScratch(mesh)
  const rho = Int32Array.from(rho0)
  const paths: LinePath[][] = []

  keep?.(0, s)

  for (let t = 1; t <= beats; t++) {
    for (const hop of hops) {
      if (hop.beat !== t - 1) continue

      const y = dockAt(mesh, hop.from)
      const z = dockAt(mesh, hop.to)
      const candidates = hopPaths(mesh, y, z)
      const used: LinePath[] = []

      for (let k = 0; k < hop.units; k++) {
        const i = fittingPath(s.line, candidates)

        if (i < 0) throw new Error(`hopRun: no fitting path at beat ${t}`)
        applyPath(s.line, candidates[i]!, 1)
        used.push(candidates[i]!)
        rho[y]!--
        rho[z]!++
      }

      paths.push(used)
    }

    stepBeat(mesh, rule, s, scratch, record.wraps)
    record.beats++
    record.gaussOff += gaussOff(mesh, s.line, rho)
    record.gaussChecks++
    if (t % 64 === 0 || t === beats) {
      record.curl += stepDepth(mesh, s.step).curl
      record.curlChecks++
      observe(rule, s, record)
    }
    keep?.(t, s)
  }

  const final = duplicateStep(s)
  let hopIndex = paths.length - 1

  for (let t = beats; t >= 1; t--) {
    stepBeatBack(mesh, rule, s, scratch)

    for (let k = hops.length - 1; k >= 0; k--) {
      if (hops[k]!.beat !== t - 1) continue

      for (const p of [...paths[hopIndex]!].reverse()) applyPath(s.line, p, -1)
      hopIndex--
    }
  }

  const reversed = sameStep(s, start)

  record.runs++
  record.reversed = record.reversed && reversed

  return { final, paths, reversed }
}

// ---------------------------------------------------------------------------------------------------------
// covariance: the image of a link under a symmetry S of the husk mesh (an integer 3x3 matrix)

export function linkImage(mesh: RadionMesh, matrix: readonly (readonly number[])[], l: number): [number, number] {
  const y = Math.floor(l / 9)
  const h = l % 9
  const p = coordOf(mesh, y)
  const u = TRIT_HUSK_VECTORS[h]!
  const apply = (v: readonly number[]): number[] => matrix.map(row => row[0]! * v[0]! + row[1]! * v[1]! + row[2]! * v[2]!)
  const su = apply(u)
  const sp = apply(p)

  for (let k = 0; k < 9; k++) {
    const w = TRIT_HUSK_VECTORS[k]!

    if (w.every((c, i) => c === su[i])) return [dockAt(mesh, sp) * 9 + k, 1]
    if (w.every((c, i) => c === -su[i]!)) return [dockAt(mesh, sp.map((c, i) => c + su[i]!)) * 9 + k, -1]
  }

  throw new Error('linkImage: not a symmetry of the husk directions')
}

// the steps, rates and rests of b equal a's carried by S, bit for bit (the lines are bookkeeping, routed afresh)
export function sameUnder(mesh: RadionMesh, matrix: readonly (readonly number[])[], a: StepState, b: StepState): boolean {
  for (let l = 0; l < a.step.length; l++) {
    const [m, sg] = linkImage(mesh, matrix, l)

    if (b.step[m] !== sg * a.step[l]! && !(a.step[l] === 0 && b.step[m] === 0)) return false
  }

  for (let y = 0; y < mesh.docks; y++) {
    const p = coordOf(mesh, y)
    const z = dockAt(mesh, matrix.map(row => row[0]! * p[0]! + row[1]! * p[1]! + row[2]! * p[2]!))

    if (b.rate[z] !== a.rate[y] || b.rest[z] !== a.rest[y]) return false
  }

  return true
}

// ---------------------------------------------------------------------------------------------------------
// the radion beside it: the depth found by summation against E-GRV-0079's integer depth, beat for beat

export type Equivalence = { beats: number; largestDepth: number; largestDifference: number }

export function radionEquivalence(side: number, depth: number, levels: number, rho: Int32Array, beats: number): Equivalence {
  const mesh = radionMesh([side, side, side])
  const rr = radionRule(depth, 3)
  const sr = stepRule(depth, levels)
  const r = emptyRadion(mesh, rr.levels)
  const rs = radionScratch(mesh, rr.levels)
  const s = emptyStep(mesh)
  const ss = stepScratch(mesh)

  s.line.set(placeLines(mesh, rho))

  let largestDepth = 0
  let largestDifference = 0

  for (let t = 1; t <= beats; t++) {
    radionBeat(mesh, rr, r, rho, rs)
    stepBeat(mesh, sr, s, ss)

    const x = shadow(rr, r, 'now')
    const found = stepDepth(mesh, s.step)

    for (let y = 0; y < mesh.docks; y++) {
      const mine = found.twice[y]! / (2 * sr.unit)
      const theirs = x[y]! - x[0]!

      largestDepth = Math.max(largestDepth, Math.abs(theirs))
      largestDifference = Math.max(largestDifference, Math.abs(mine - theirs))
    }
  }

  return { beats, largestDepth, largestDifference }
}

// ---------------------------------------------------------------------------------------------------------
// the horizon: a lump at its lines' capacity, run on the trit window and on a wide one (the linear radion) side by side

export type HorizonRun = {
  m: number
  // the trit run: wraps of rates and of steps, the first beat any register wrapped and the distances (link midpoints to
  // the center) of the links that wrapped then
  vWraps: number
  fWraps: number
  firstWrap: number
  firstWrapDistances: number[]
  // the largest distance of any link that wrapped over the run
  farthestWrap: number
  reversed: boolean
  // the wide run (whole = WIDE): the largest |F| over the run, and the farthest link where |F| ever passed 3/2
  wideMax: number
  wideFarthestOver: number
  // its Hann average (the static field): largest |F_bar|, and the farthest link where |F_bar| passes 3/2 and 3/4
  staticMax: number
  staticFarthestOver: number
  staticFarthestHalf: number
  // the trit run's energy (depth found by summation, and the local form) at the start and the end
  energyStart: number
  energyEnd: number
  sourceGap: number
  seconds: number
}

export const WIDE = 2187

export function horizonRun(side: number, depth: number, levels: number, m: number, beats: number): HorizonRun {
  const t0 = Date.now()
  const mesh = radionMesh([side, side, side])
  const center = [side / 2, side / 2, side / 2]
  const lump = compressLump(mesh, center, m, 1)
  const trit = stepRule(depth, levels)
  const wide = stepRule(depth, levels, WIDE)
  const a = emptyStep(mesh)
  const b = emptyStep(mesh)

  a.line.set(lump.line)
  b.line.set(lump.line)

  const start = duplicateStep(a)
  const sa = stepScratch(mesh)
  const sb = stepScratch(mesh)
  const tally = newStepTally()
  const midpoint = (l: number): number => {
    const y = Math.floor(l / 9)
    const p = coordOf(mesh, y)
    const u = TRIT_HUSK_VECTORS[l % 9]!

    return Math.sqrt(p.reduce((s, v, i) => s + (Math.min(mod(v + u[i]! / 2 - center[i]!, side), mod(center[i]! - v - u[i]! / 2, side))) ** 2, 0))
  }
  const mean = new Float64Array(a.step.length)
  let weight = 0
  let firstWrap = 0
  let firstWrapDistances: number[] = []
  let farthestWrap = 0
  let wideMax = 0
  let wideFarthestOver = 0
  const energyStart = stepEnergy(mesh, trit, a, lump.content).energy

  for (let t = 1; t <= beats; t++) {
    const before = tally.fWraps + tally.vWraps

    stepBeat(mesh, trit, a, sa, tally)
    stepBeat(mesh, wide, b, sb)

    const u = trit.unit

    for (let l = 0; l < b.step.length; l++) {
      const f = Math.abs(b.step[l]!) / u

      if (f > wideMax) wideMax = f
      if (f > 1.5) wideFarthestOver = Math.max(wideFarthestOver, midpoint(l))
    }

    if (tally.fWraps + tally.vWraps > before) {
      const wrapped: number[] = []

      for (let l = 0; l < a.step.length; l++) {
        // a link that wrapped this beat: its step moved by more than a half window from the last beat's value
        const last = a.step[l]! - radionWeight(l % 9) * (a.rate[Math.floor(l / 9)]! - a.rate[mesh.neighbour[l]!]!)

        if (Math.abs(last) > trit.top) wrapped.push(midpoint(l))
      }

      if (firstWrap === 0) (firstWrap = t), (firstWrapDistances = [...new Set(wrapped.map(d => Math.round(d * 100) / 100))].sort((p, q) => p - q))
      for (const d of wrapped) farthestWrap = Math.max(farthestWrap, d)
    }

    const w = Math.sin((Math.PI * t) / beats) ** 2

    for (let l = 0; l < mean.length; l++) mean[l] = mean[l]! + (w * b.step[l]!) / u
    weight += w
  }

  let staticMax = 0
  let staticFarthestOver = 0
  let staticFarthestHalf = 0

  for (let l = 0; l < mean.length; l++) {
    const f = Math.abs(mean[l]! / weight)

    staticMax = Math.max(staticMax, f)
    if (f > 1.5) staticFarthestOver = Math.max(staticFarthestOver, midpoint(l))
    if (f > 0.75) staticFarthestHalf = Math.max(staticFarthestHalf, midpoint(l))
  }

  const end = stepEnergy(mesh, trit, a, lump.content)

  for (let t = 0; t < beats; t++) stepBeatBack(mesh, trit, a, sa)

  return {
    m,
    vWraps: tally.vWraps,
    fWraps: tally.fWraps,
    firstWrap,
    firstWrapDistances,
    farthestWrap,
    reversed: sameStep(a, start),
    wideMax,
    wideFarthestOver,
    staticMax,
    staticFarthestOver,
    staticFarthestHalf,
    energyStart,
    energyEnd: end.energy,
    sourceGap: Math.abs(end.sourceFound - end.sourceLocal),
    seconds: (Date.now() - t0) / 1000,
  }
}
