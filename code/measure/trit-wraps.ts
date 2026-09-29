// Measurement for the trit rule's own wraps (the experiment in test/experiment/gauge/trit-rule-wraps): which of
// the trit light's register wraps are physical seams and which are bookkeeping, read by running the rule itself
// (code/rule/trit-column) from hot deterministic starts. Integers only in the rule; the tallies are counts.
//
// THE FOUR WRAPS. A beat of the trit light (code/rule/trit-column) can wrap four kinds of column:
//   the angle      A_l cycles in its window (4D on an axis, 2D on a diagonal). The force reads B = C W A mod 4D,
//                  and w A moves by exactly 4D when A wraps, so the wrap changes no B, no counter, no flux
//   the plaquette  B_P is centered mod 4D, the seam at 2D. This is the compact U(1) seam (E-FRC-0244, 0245)
//   the potential  U_P cycles in -n_P D .. n_P D. The flux is e = S - C^T U, so U is read only through C^T U,
//                  and a vector g with C^T g = 0 changes no flux. The wrap check reads U itself, so the timing
//                  of a potential wrap depends on a part of U that nothing else reads
//   the counter    its wrap is the unit of force, by design
// So the electric side has no window of its own: the drift reads e raw.

import {
  copyHuskLight,
  emptyTally,
  huskCurlWeighted,
  huskField,
  huskFlux,
  huskLightBeat,
  readHusk,
  type HuskLightState,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { makeWeyl } from '@/code/tool/weyl'

const mod = (x: number, m: number): number => ((x % m) + m) % m

/**
 * A hot husk start from the Kronecker stream at `start`: every angle uniform over `fraction` of its window, every
 * potential over `fraction` of its window, every counter (the three per triangle) over its full range -D .. D.
 * Strings and charges are 0, so Gauss's law holds for any potentials (the flux is a curl's transpose).
 */
export function hotHuskStart(
  light: TritLight,
  start: number,
  fraction: number,
): HuskLightState {
  const { bulk } = light
  const stream = makeWeyl({ start })
  const d = bulk.depth
  const angle = new Int32Array(bulk.huskLinks)
  const potential = new Int32Array(bulk.huskTriangles)
  const counter = new Int32Array(bulk.huskTriangles)
  const lag = new Int32Array(bulk.huskTriangles)
  const spatial = new Int32Array(bulk.huskTriangles)

  for (let l = 0; l < bulk.huskLinks; l++) {
    const half = (light.window[l % 9] ?? 0) / 2
    const reach = Math.floor(half * fraction)

    angle[l] = stream.nextInt({ max: 2 * reach + 1 }) - reach
  }

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const reach = Math.floor((light.potentialWindow[p] ?? 0) * fraction)

    potential[p] = stream.nextInt({ max: 2 * reach + 1 }) - reach
    counter[p] = stream.nextInt({ max: 2 * d + 1 }) - d
    lag[p] = stream.nextInt({ max: 2 * d + 1 }) - d
    spatial[p] = stream.nextInt({ max: 2 * d + 1 }) - d
  }

  return {
    angle,
    potential,
    counter,
    lag,
    spatial,
    string: new Int32Array(bulk.huskLinks),
  }
}

/**
 * An integer potential g with C^T g = 0 on the husk, supported on the four husk triangles of the flat tetrahedron
 * on docks 0, x, y and x + y (each of its six edges a husk link): the two ways of cutting that square into two
 * triangles bound the same loop, so T1 + T2 - T3 - T4 has no boundary. Found by testing every sign pattern on the
 * triangles whose three links all lie on those six edges; throws if none cancels.
 */
export function kernelPotential(light: TritLight): Int32Array {
  const { bulk } = light
  const side = bulk.side
  const dock = (a: number, b: number): number =>
    mod(a, side) + side * mod(b, side)
  const edges = new Set<number>()

  // the six edges as husk links (dock, direction): 0 -> x, 0 -> y, 0 -> x + y, x -> x + y, y -> x + y, and
  // x -> y (direction 4 is (1, -1, 0), so the link runs from y to x)
  edges.add(dock(0, 0) * 9 + 0)
  edges.add(dock(0, 0) * 9 + 1)
  edges.add(dock(0, 0) * 9 + 3)
  edges.add(dock(1, 0) * 9 + 1)
  edges.add(dock(0, 1) * 9 + 0)
  edges.add(dock(0, 1) * 9 + 4)

  const support: number[] = []

  for (let p = 0; p < bulk.huskTriangles; p++) {
    let inside = true

    for (let j = 0; j < 3; j++) {
      inside &&= edges.has(bulk.huskTriLinks[p * 3 + j] ?? -1)
    }

    if (inside) {
      support.push(p)
    }
  }

  const count = 3 ** support.length

  for (let code = 1; code < count; code++) {
    const g = new Int32Array(bulk.huskTriangles)

    let rest = code

    for (const p of support) {
      g[p] = (rest % 3) - 1
      rest = Math.floor(rest / 3)
    }

    const curl = new Int32Array(bulk.huskLinks)

    for (const p of support) {
      for (let j = 0; j < 3; j++) {
        const l = bulk.huskTriLinks[p * 3 + j] ?? 0

        curl[l] = (curl[l] ?? 0) + (bulk.huskTriSigns[p * 3 + j] ?? 0) * (g[p] ?? 0)
      }
    }

    if (curl.every(x => x === 0) && support.some(p => g[p] !== 0)) {
      return g
    }
  }

  throw new Error('no integer kernel vector of C^T on the flat tetrahedron')
}

/** The centered plaquette fields of every husk triangle. */
export function huskFields(
  light: TritLight,
  state: HuskLightState,
): Int32Array {
  return Int32Array.from({ length: light.bulk.huskTriangles }, (_, p) =>
    huskField(light, state.angle, p),
  )
}

const sameArray = (a: ArrayLike<number>, b: ArrayLike<number>): boolean => {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

/** Do the trit state's column sums equal the husk integers, on every value? */
export function tritMatchesHusk(
  light: TritLight,
  trits: TritState,
  husk: HuskLightState,
): boolean {
  const read = readHusk(light, trits)

  return (
    sameArray(read.angle, husk.angle) &&
    sameArray(read.potential, husk.potential) &&
    sameArray(read.counter, husk.counter) &&
    sameArray(read.lag, husk.lag) &&
    sameArray(read.spatial, husk.spatial) &&
    sameArray(read.string, husk.string)
  )
}

/** Every stored trit of two trit states equal? */
export function sameTrits(a: TritState, b: TritState): boolean {
  return (
    sameArray(a.vibe, b.vibe) &&
    sameArray(a.angle, b.angle) &&
    sameArray(a.string, b.string) &&
    sameArray(a.potential, b.potential) &&
    sameArray(a.counter, b.counter) &&
    sameArray(a.lag, b.lag) &&
    sameArray(a.spatial, b.spatial)
  )
}

/** The dynamical readings of two husk states: the flux and the three counters (what the next beat reads). */
export function dynamicalMatch(
  light: TritLight,
  a: HuskLightState,
  b: HuskLightState,
): boolean {
  return (
    sameArray(huskFlux(light, a), huskFlux(light, b)) &&
    sameArray(a.counter, b.counter) &&
    sameArray(a.lag, b.lag) &&
    sameArray(a.spatial, b.spatial)
  )
}

/**
 * The force every husk triangle takes on the next beat from `state`, read exactly by running the beat on a copy
 * under a light whose potential windows are too wide to wrap (the window enters only the potential's wrap).
 */
export function forcesOf(
  light: TritLight,
  state: HuskLightState,
): Int32Array {
  const wide: TritLight = {
    ...light,
    potentialWindow: new Int32Array(light.bulk.huskTriangles).fill(1 << 28),
  }
  const copy = copyHuskLight(state)

  huskLightBeat(wide, copy)

  return Int32Array.from(
    copy.potential,
    (u, p) => u - (state.potential[p] ?? 0),
  )
}

/** Which triangles' potentials wrapped on a beat from `before`, given the forces of that beat and the result. */
function potentialWrapped(
  before: ArrayLike<number>,
  force: ArrayLike<number>,
  after: ArrayLike<number>,
  p: number,
): boolean {
  return (after[p] ?? 0) !== (before[p] ?? 0) + (force[p] ?? 0)
}

/** A variant of a light with its angle windows scaled by `windows` and its plaquette modulus by `field`. */
export function widenedLight(
  light: TritLight,
  windows: number,
  field: number,
): TritLight {
  return {
    ...light,
    window: Int32Array.from(light.window, w => w * windows),
    nb: light.nb * field,
  }
}

/** Per-class tallies of one husk run: wraps and seam crossings, by link class and by triangle class. */
export type WrapTally = {
  beats: number
  /** angle wraps, axis links and diagonal links */
  angleAxis: number
  angleDiagonal: number
  /** potential wraps, triangles with n_P = 1 and n_P = 2 */
  potentialOne: number
  potentialTwo: number
  /** plaquette seam crossings (|B_(t+1) - B_t| > 2D), triangles with n_P = 1 and n_P = 2 */
  seamOne: number
  seamTwo: number
  /** link-beats with |e| > D (beyond the seam a Weyl light of this depth would have), and the largest |e| */
  fluxBeyond: number
  fluxLargest: number
  /** the rule's own totals (code/rule/trit-column's tally), which the classed counts must sum to */
  ruleAngleWraps: number
  rulePotentialWraps: number
  links: number
  trianglesOne: number
  trianglesTwo: number
}

/** Run the husk integer rule `beats` beats from a copy of `start`, tallying every wrap by class. */
export function tallyRun(
  light: TritLight,
  start: HuskLightState,
  beats: number,
): WrapTally {
  const { bulk } = light
  const state = copyHuskLight(start)
  const d = bulk.depth
  const n = bulk.multiplicity
  const out: WrapTally = {
    beats,
    angleAxis: 0,
    angleDiagonal: 0,
    potentialOne: 0,
    potentialTwo: 0,
    seamOne: 0,
    seamTwo: 0,
    fluxBeyond: 0,
    fluxLargest: 0,
    ruleAngleWraps: 0,
    rulePotentialWraps: 0,
    links: bulk.huskLinks,
    trianglesOne: Array.from(n).filter(x => x === 1).length,
    trianglesTwo: Array.from(n).filter(x => x === 2).length,
  }

  const rule = emptyTally()

  let fields = huskFields(light, state)

  for (let t = 0; t < beats; t++) {
    const e = huskFlux(light, state)

    for (let l = 0; l < bulk.huskLinks; l++) {
      const v = Math.abs(e[l] ?? 0)

      out.fluxLargest = Math.max(out.fluxLargest, v)
      out.fluxBeyond += v > d ? 1 : 0

      const raw = (state.angle[l] ?? 0) + (e[l] ?? 0)
      const half = (light.window[l % 9] ?? 0) / 2

      if (raw < -half || raw >= half) {
        if (l % 9 < 3) {
          out.angleAxis++
        } else {
          out.angleDiagonal++
        }
      }
    }

    const before = Int32Array.from(state.potential)
    const force = forcesOf(light, state)

    huskLightBeat(light, state, rule)

    const next = huskFields(light, state)

    for (let p = 0; p < bulk.huskTriangles; p++) {
      const one = n[p] === 1

      if (potentialWrapped(before, force, state.potential, p)) {
        if (one) {
          out.potentialOne++
        } else {
          out.potentialTwo++
        }
      }

      // B moves by C W e mod 4D; the multiples of 4D it lost are its seam crossings
      const crossings = Math.abs(
        ((fields[p] ?? 0) + huskCurlWeighted(light, e, p) - (next[p] ?? 0)) /
          light.nb,
      )

      if (one) {
        out.seamOne += crossings
      } else {
        out.seamTwo += crossings
      }
    }

    fields = next
  }

  out.ruleAngleWraps = rule.wraps
  out.rulePotentialWraps = rule.potentialWraps

  return out
}

/** What a paired run found: the first beat each kind of reading differed (-1 if never), and the wrap totals. */
export type PairedRun = {
  /** the flux or a counter differs */
  firstDynamical: number
  /** a centered plaquette field differs (each state read with its own light) */
  firstField: number
  /** a potential wrapped in one run and not the other */
  firstWrapDifference: number
  /** an angle of a differs from b's modulo a's window */
  firstAngleIncongruent: number
  angleWrapsA: number
  angleWrapsB: number
  potentialWrapsA: number
  potentialWrapsB: number
}

/**
 * Two runs of the husk integer rule beat by beat, state a under light a and state b under light b (the same
 * lattice), from copies of the given starts.
 */
export function compareRuns(
  lightA: TritLight,
  a0: HuskLightState,
  lightB: TritLight,
  b0: HuskLightState,
  beats: number,
): PairedRun {
  const a = copyHuskLight(a0)
  const b = copyHuskLight(b0)
  const { bulk } = lightA
  const ta = emptyTally()
  const tb = emptyTally()
  const out: PairedRun = {
    firstDynamical: dynamicalMatch(lightA, a, b) ? -1 : 0,
    firstField: -1,
    firstWrapDifference: -1,
    firstAngleIncongruent: -1,
    angleWrapsA: 0,
    angleWrapsB: 0,
    potentialWrapsA: 0,
    potentialWrapsB: 0,
  }

  const fieldsDiffer = (): boolean =>
    !sameArray(huskFields(lightA, a), huskFields(lightB, b))
  const incongruent = (): boolean => {
    for (let l = 0; l < bulk.huskLinks; l++) {
      if (
        mod((a.angle[l] ?? 0) - (b.angle[l] ?? 0), lightA.window[l % 9] ?? 1) !== 0
      ) {
        return true
      }
    }

    return false
  }

  if (fieldsDiffer()) {
    out.firstField = 0
  }

  if (incongruent()) {
    out.firstAngleIncongruent = 0
  }

  for (let t = 1; t <= beats; t++) {
    const pa = Int32Array.from(a.potential)
    const pb = Int32Array.from(b.potential)
    const fa = out.firstWrapDifference < 0 ? forcesOf(lightA, a) : pa
    const fb = out.firstWrapDifference < 0 ? forcesOf(lightB, b) : pb

    huskLightBeat(lightA, a, ta)
    huskLightBeat(lightB, b, tb)

    // a wrap on one triangle in one run and not the other
    if (out.firstWrapDifference < 0) {
      for (let p = 0; p < bulk.huskTriangles; p++) {
        if (
          potentialWrapped(pa, fa, a.potential, p) !==
          potentialWrapped(pb, fb, b.potential, p)
        ) {
          out.firstWrapDifference = t
          break
        }
      }
    }

    if (out.firstDynamical < 0 && !dynamicalMatch(lightA, a, b)) {
      out.firstDynamical = t
    }

    if (out.firstField < 0 && fieldsDiffer()) {
      out.firstField = t
    }

    if (out.firstAngleIncongruent < 0 && incongruent()) {
      out.firstAngleIncongruent = t
    }
  }

  out.angleWrapsA = ta.wraps
  out.angleWrapsB = tb.wraps
  out.potentialWrapsA = ta.potentialWraps
  out.potentialWrapsB = tb.potentialWraps

  return out
}

/**
 * The occupancy of each depth position of the angle columns: the mean over links and beats of |trit| at the i-th
 * position of the column (depth order), for axis columns (2D positions) and diagonal columns (D positions). A bulk
 * register that filled like every other would read one value at every position.
 */
export function angleOccupancy(
  light: TritLight,
  trits: TritState,
): { axis: number[]; diagonal: number[] } {
  const { bulk } = light
  const axis = new Array<number>(2 * bulk.depth).fill(0)
  const diagonal = new Array<number>(bulk.depth).fill(0)

  for (let i = 0; i < bulk.huskLinks; i++) {
    const start = bulk.linkColumnStart[i] ?? 0
    const length = (bulk.linkColumnStart[i + 1] ?? 0) - start
    const target = i % 9 < 3 ? axis : diagonal

    for (let k = 0; k < length; k++) {
      target[k] =
        (target[k] ?? 0) +
        Math.abs(trits.angle[bulk.linkColumn[start + k] ?? 0] ?? 0)
    }
  }

  const axisLinks = bulk.huskDocks * 3
  const diagonalLinks = bulk.huskDocks * 6

  return {
    axis: axis.map(x => x / axisLinks),
    diagonal: diagonal.map(x => x / diagonalLinks),
  }
}
