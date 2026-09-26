// The acceptance battery of E-FRC-0125 (code/measure/weave-acceptance) asked of a knit that carries flux on
// its links, as code/rule/steered-knit does. Steering reads the flux, so a steered knit is not a collision
// of the 24 slots of one dock alone and the instruments of weave-acceptance cannot run it. Each item here
// is that instrument's question, asked by running the whole box, vibes and flux together, with the same
// sizes, seeds and beat counts. Run on an unsteered knit, each reproduces weave-acceptance's number, which
// is how the two are checked against each other (E-FRC-0156).
//
// Also here, what weave-acceptance cannot ask at all: CPT on a full box with the flux evolving. The map is
// charge negation with every dock sent to its negative and every slot kept on its direction (spatial
// inversion and velocity reversal together), and each link's flux carried to the image link with a sign.
// It holds at mirror phase c when, for every beat t of a run from a dense start,
//
//   theta(s_t) = collide(c - t) of stream of theta(s_(t+1)),
//
// the trajectory run backward being a trajectory of the same rule.

import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { knitCollide, knitStream, makeSteeredKnit, type KnitState, type SteeredKnit, type KnitSteer } from '@/code/rule/steered-knit'
import { type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { d4BoxCell, d4BoxCoordinates, d4BoxDistance } from '@/code/substrate/d4-box'

export const STEERED_PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2
const TRAVEL_BEATS = 6

export type SteeredRule = { readonly spec: ColorLocalSpec; readonly steer: KnitSteer }

const KNITS = new Map<string, SteeredKnit>()

function knitOf(rule: SteeredRule, side: number): SteeredKnit {
  const key = `${side}|${String(rule.steer)}|${JSON.stringify(rule.spec, (_, v: unknown) => (typeof v === 'function' ? String(v) : v))}`
  const cached = KNITS.get(key)

  if (cached) {
    return cached
  }

  const knit = makeSteeredKnit({ side, spec: rule.spec, steer: rule.steer })

  KNITS.set(key, knit)

  return knit
}

const empty = (knit: SteeredKnit): KnitState => ({ vibe: new Int8Array(knit.mesh.cellCount * 24), flux: new Int32Array(knit.edges.length) })

// weave-acceptance's dense vibes, with a dense flux beside them
export function denseKnitState(knit: SteeredKnit): KnitState {
  return {
    vibe: Int8Array.from({ length: knit.mesh.cellCount * 24 }, (_, i) => {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      return u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    }),
    flux: Int32Array.from({ length: knit.edges.length }, (_, l) => Math.floor(((l + 1) * GOLDEN * 5.3) % 5) - 2),
  }
}

function step(knit: SteeredKnit, s: KnitState, t: number): KnitState {
  const work = { vibe: Int8Array.from(s.vibe), flux: Int32Array.from(s.flux) }

  knitCollide(knit, work, t, true)

  return knitStream(knit, work, true)
}

function stepBack(knit: SteeredKnit, s: KnitState, t: number): KnitState {
  const work = knitStream(knit, s, false)

  knitCollide(knit, work, t, false)

  return work
}

const same = (a: KnitState, b: KnitState): boolean => a.vibe.every((v, i) => v === b.vibe[i]) && a.flux.every((v, i) => v === b.flux[i])

const differing = (a: Int8Array, b: Int8Array): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

// side 5, a dense start with flux, one period forward and back, charge every beat
export function steeredReversal(rule: SteeredRule): { reverses: boolean; chargeKept: boolean } {
  const knit = knitOf(rule, 5)
  const start = denseKnitState(knit)
  const charge = (s: KnitState): number => s.vibe.reduce((a, b) => a + b, 0)

  let s = start
  let chargeKept = true

  for (let t = 0; t < STEERED_PERIOD; t++) {
    s = step(knit, s, t)
    chargeKept = chargeKept && charge(s) === charge(start)
  }

  for (let t = STEERED_PERIOD - 1; t >= 0; t--) {
    s = stepBack(knit, s, t)
  }

  return { reverses: same(s, start), chargeKept }
}

function theta(knit: SteeredKnit, s: KnitState, sign: number): KnitState {
  const side = Math.round(knit.mesh.cellCount ** 0.25)
  const neg = (x: number): number => d4BoxCell({ coordinates: d4BoxCoordinates({ cell: x, side }).map(c => -c), side })
  const edgeIndex = new Map(knit.edges.map(([a, , d], l) => [a * 24 + d, l]))
  const vibe = new Int8Array(s.vibe.length)
  const flux = new Int32Array(s.flux.length)

  for (let x = 0; x < knit.mesh.cellCount; x++) {
    const y = neg(x)

    for (let d = 0; d < 24; d++) {
      vibe[y * 24 + d] = -(s.vibe[x * 24 + d] ?? 0)
    }
  }

  knit.edges.forEach(([, b, d], l) => {
    flux[edgeIndex.get(neg(b) * 24 + d) ?? 0] = sign * (s.flux[l] ?? 0)
  })

  return { vibe, flux }
}

// the first mirror phase and flux sign at which CPT holds on the full side-5 box over one period from a
// dense start with flux, as 'phase' (0 to 23) and 'sign' (+1 or -1), or phase -1
export function boxCptPhase(rule: SteeredRule): { phase: number; sign: number } {
  const knit = knitOf(rule, 5)
  const states: KnitState[] = [denseKnitState(knit)]

  for (let t = 0; t < STEERED_PERIOD; t++) {
    states.push(step(knit, states[t] ?? states[0]!, t))
  }

  for (const sign of [1, -1]) {
    for (let c = 0; c < STEERED_PERIOD; c++) {
      let holds = true

      for (let t = 0; t < STEERED_PERIOD && holds; t++) {
        const image = knitStream(knit, theta(knit, states[t + 1] ?? states[0]!, sign), true)

        knitCollide(knit, image, (((c - t) % STEERED_PERIOD) + STEERED_PERIOD) % STEERED_PERIOD, true)
        holds = same(image, theta(knit, states[t] ?? states[0]!, sign))
      }

      if (holds) {
        return { phase: c, sign }
      }
    }
  }

  return { phase: -1, sign: 0 }
}

// the empty vacuum's period with the flux, on side 7 over `periods` periods, and its first return to empty
export function steeredVacuum(rule: SteeredRule, periods: number): { period: number; firstEmpty: number } {
  const knit = knitOf(rule, 7)
  const states: string[] = []

  let s = empty(knit)
  let firstEmpty = -1

  for (let t = 0; t < periods * STEERED_PERIOD; t++) {
    states.push(`${s.vibe.join('')}|${s.flux.join(',')}`)
    s = step(knit, s, t)
    firstEmpty = firstEmpty < 0 && s.vibe.every(v => v === 0) ? t + 1 : firstEmpty
  }

  for (let p = 1; p <= (periods * STEERED_PERIOD) / 2; p++) {
    if (states.every((x, t) => t + p >= states.length || x === states[t + p])) {
      return { period: p, firstEmpty }
    }
  }

  return { period: 0, firstEmpty }
}

// line-graph components on side 5, the vacuum or the dense start with flux, as weave-acceptance counts them
export function steeredComponents(rule: SteeredRule, withDense: boolean): number {
  const knit = knitOf(rule, 5)
  const lineOf = Array.from({ length: 24 }, (_, d) => knit.lines.findIndex(([a, b]) => a === d || b === d))
  const center = 2 * (1 + 5 + 25 + 125)
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))
  const background: KnitState[] = [withDense ? denseKnitState(knit) : empty(knit)]

  for (let t = 0; t < STEERED_PERIOD; t++) {
    background.push(step(knit, background[t] ?? background[0]!, t))
  }

  for (let direction = 0; direction < 24; direction++) {
    const touched = new Set<number>()
    const slot = center * 24 + direction
    const start = background[0]!
    const vibe = Int8Array.from(start.vibe)

    vibe[slot] = vibe[slot] === 1 ? -1 : 1

    let s: KnitState = { vibe, flux: Int32Array.from(start.flux) }

    for (let t = 0; t < STEERED_PERIOD; t++) {
      s = step(knit, s, t)

      const b = background[t + 1]!

      for (let i = 0; i < s.vibe.length; i++) {
        if (s.vibe[i] !== b.vibe[i]) {
          touched.add(lineOf[i % 24] ?? 0)
        }
      }
    }

    for (const line of touched) {
      parent[find(line)] = find(lineOf[direction] ?? 0)
    }
  }

  return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
}

// the worst superposition defect of the clock amplitude, two lone loves far apart on side 11, 6 beats
export function steeredAdditivity(rule: SteeredRule): number {
  const knit = knitOf(rule, 11)
  const seedA = d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 })
  const seedB = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })
  const amplitude = (s: KnitState): readonly [number, number] => clockAmplitude({ mesh: knit.mesh, data: s.vibe })
  const branch = (seeds: number[]): [number, number][] => {
    let vac = empty(knit)
    let seeded = empty(knit)
    const out: [number, number][] = []

    for (const x of seeds) {
      seeded.vibe[x * 24] = 1
    }

    for (let t = 0; t < 6; t++) {
      vac = step(knit, vac, t)
      seeded = step(knit, seeded, t)

      const a = amplitude(seeded)
      const b = amplitude(vac)

      out.push([a[0] - b[0], a[1] - b[1]])
    }

    return out
  }
  const a = branch([seedA])
  const b = branch([seedB])
  const joint = branch([seedA, seedB])

  return Math.max(...joint.map((j, t) => Math.hypot(j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0), j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0))))
}

// walls on side 9: half the box born one beat late, as weave-acceptance's growing beat, with no flux
// crossing a link to an unborn dock; the settled difference from the uniform vacuum in whole sheets
export function steeredWalls(rule: SteeredRule): { quantized: boolean; settledMax: number } {
  const knit = knitOf(rule, 9)
  const late = (x: number): boolean => (d4BoxCoordinates({ cell: x, side: 9 })[0] ?? 0) >= 5
  const wall: number[] = []

  let uniform = empty(knit)
  let staggered = empty(knit)

  for (let t = 0; t < 8 * STEERED_PERIOD; t++) {
    if (t === 0) {
      // the first beat: only the early docks collide, and a slot streaming into a late dock bounces back
      const work = empty(knit)

      knitCollide(knit, work, 0, true)

      for (let x = 0; x < knit.mesh.cellCount; x++) {
        if (late(x)) {
          work.vibe.fill(0, x * 24, x * 24 + 24)
        }
      }

      const vibe = new Int8Array(work.vibe.length)
      const flux = Int32Array.from(work.flux)

      for (let x = 0; x < knit.mesh.cellCount; x++) {
        if (late(x)) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          const o = knit.opposite[d] ?? d
          const source = knit.neighbour[x * 24 + o] ?? 0

          vibe[x * 24 + d] = late(source) ? (work.vibe[x * 24 + o] ?? 0) : (work.vibe[source * 24 + d] ?? 0)
        }
      }

      knit.edges.forEach(([a, b, d], l) => {
        if (!late(a) && !late(b)) {
          flux[l] = (flux[l] ?? 0) + (work.vibe[b * 24 + (knit.opposite[d] ?? d)] ?? 0) - (work.vibe[a * 24 + d] ?? 0)
        }
      })

      staggered = { vibe, flux }
    } else {
      staggered = step(knit, staggered, t)
    }

    uniform = step(knit, uniform, t)
    wall.push(differing(staggered.vibe, uniform.vibe))
  }

  const settled = wall.slice(3 * STEERED_PERIOD)

  return { quantized: settled.every(x => x % 9 ** 3 === 0), settledMax: Math.max(...settled) }
}

// per direction, the farthest true distance a lone love's disturbance reaches in 6 beats on side 13
export function steeredTravel(rule: SteeredRule): { travellers: number; meanReach: number } {
  const knit = knitOf(rule, 13)
  const center = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 13 })
  const vacuum: KnitState[] = [empty(knit)]

  for (let t = 0; t < TRAVEL_BEATS; t++) {
    vacuum.push(step(knit, vacuum[t] ?? vacuum[0]!, t))
  }

  const reaches = Array.from({ length: 24 }, (_, direction) => {
    let s = empty(knit)

    s.vibe[center * 24 + direction] = 1

    for (let t = 0; t < TRAVEL_BEATS; t++) {
      s = step(knit, s, t)
    }

    const v = vacuum[TRAVEL_BEATS]!

    let farthest = 0

    for (let x = 0; x < knit.mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        if (s.vibe[x * 24 + d] !== v.vibe[x * 24 + d]) {
          farthest = Math.max(farthest, d4BoxDistance({ a: x, b: center, side: 13 }))
          break
        }
      }
    }

    return farthest
  })
  const free = Math.SQRT2 * TRAVEL_BEATS

  return { travellers: reaches.filter(r => r >= free / 2).length, meanReach: reaches.reduce((a, b) => a + b, 0) / reaches.length }
}

// the largest support of a lone tone's disturbance in each period, over every direction, from the center
// of a box of the given side, as weave-acceptance's dressing
export function steeredDressing(rule: SteeredRule, input: { side: number; tone: number; periods: number }): number[] {
  const { side, tone, periods } = input
  const knit = knitOf(rule, side)
  const middle = Math.floor(side / 2)
  const center = d4BoxCell({ coordinates: [middle, middle, middle, middle], side })
  const vacuum: Int8Array[] = []
  const largest = Array.from({ length: periods }, () => 0)

  let v = empty(knit)

  for (let t = 0; t < periods * STEERED_PERIOD; t++) {
    v = step(knit, v, t)
    vacuum.push(v.vibe)
  }

  for (let direction = 0; direction < 24; direction++) {
    let s = empty(knit)

    s.vibe[center * 24 + direction] = tone

    for (let t = 0; t < periods * STEERED_PERIOD; t++) {
      s = step(knit, s, t)

      const p = Math.floor(t / STEERED_PERIOD)

      largest[p] = Math.max(largest[p] ?? 0, differing(s.vibe, vacuum[t] ?? s.vibe))
    }
  }

  return largest
}
