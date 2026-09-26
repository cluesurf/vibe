// Triples of vibes on the lines of a zero-sum triangle (E-FRC-0170, E-FRC-0171, E-FRC-0172).
//
// The hypothesis under test reads a fermion as three vibes, one on each of the three lines of an A2 plane
// of the coin, with love +1/3, calm 0 and fear -1/3 of the unit charge, so Q = (love - fear) / 3. That is
// the Harari-Shupe rishon model (1979) with T = love, V = calm and anti-T = fear: TTT the positron, TTV the
// up quark in three arrangements (the colors), TVV the anti-down, VVV the neutrino, and the conjugates.
//
// This module holds the geometry and the bookkeeping the three experiments share:
// - the 16 A2 planes of the coin, each with its two zero-sum triangles (the triangle and the antitriangle,
//   which sit on the same three lines, one slot of each), and the 18 other directions sorted into the
//   three triplet and three antitriplet copies of E-FRC-0106, each copy's three directions ordered by the
//   triangle direction each one leans toward (the color weight it projects to)
// - the 27 triples of vibes on three ordered places, with their charge, their arrangement orbits under the
//   triangle's symmetric group S3 and under its rotations Z3, and their Harari-Shupe name
// - a dock state holding a triple

import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'

export const ROOTS: readonly (readonly number[])[] = rootsD4()
export const OPPOSITE: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
// +1 on the first slot of a line, -1 on the second: the sign a calm slot's role point carries (code/rule/color-weave)
export const SIDE: readonly number[] = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

export type A2Plane = {
  // the zero-sum triangle, in increasing direction order, and its antitriangle (each direction's opposite)
  readonly triangle: readonly [number, number, number]
  readonly anti: readonly [number, number, number]
  // the three triplet copies and three antitriplet copies, each three directions, the k-th leaning toward
  // triangle[k] (dot product +1 with it)
  readonly triplets: readonly (readonly [number, number, number])[]
  readonly antitriplets: readonly (readonly [number, number, number])[]
}

export function a2Planes(): A2Plane[] {
  const triangles = zeroSumTriangles({ directions: ROOTS.map(r => [...r]) })
  const planes: A2Plane[] = []
  const done = new Set<string>()

  for (const t of triangles) {
    const triangle = [...t].sort((a, b) => a - b) as [number, number, number]
    const anti = triangle.map(d => OPPOSITE[d] ?? d) as [number, number, number]
    const key = [...triangle, ...anti].sort((a, b) => a - b).join(',')

    if (done.has(key)) {
      continue
    }

    done.add(key)

    const inPlane = new Set([...triangle, ...anti])
    const e = triangle.map(d => ROOTS[d] ?? [])
    const groups = new Map<string, number[]>()

    for (let d = 0; d < 24; d++) {
      if (inPlane.has(d)) {
        continue
      }

      // the component orthogonal to the plane: r minus its projection on span(e0, e1)
      const r = ROOTS[d] ?? []
      const a = e[0] ?? []
      const b = e[1] ?? []
      const gaa = dot(a, a)
      const gab = dot(a, b)
      const gbb = dot(b, b)
      const det = gaa * gbb - gab * gab
      const x = (gbb * dot(r, a) - gab * dot(r, b)) / det
      const y = (gaa * dot(r, b) - gab * dot(r, a)) / det
      const rest = r.map((v, k) => v - x * (a[k] ?? 0) - y * (b[k] ?? 0))
      const shadow = rest.map(v => v.toFixed(6)).join(',')

      groups.set(shadow, [...(groups.get(shadow) ?? []), d])
    }

    const triplets: [number, number, number][] = []
    const antitriplets: [number, number, number][] = []

    for (const group of groups.values()) {
      const ordered: number[] = [-1, -1, -1]
      const chiralities = new Set<number>()

      for (const d of group) {
        const dots = e.map(v => dot(ROOTS[d] ?? [], v))
        const plus = dots.indexOf(1)
        const minus = dots.indexOf(-1)

        ordered[plus] = d
        chiralities.add((((minus - plus) % 3) + 3) % 3)
      }

      const chirality = [...chiralities][0] ?? 0

      if (ordered.some(d => d < 0) || group.length !== 3 || chiralities.size !== 1) {
        throw new Error('a copy is not three directions leaning toward three distinct triangle directions')
      }

      ;(chirality === 1 ? triplets : antitriplets).push(ordered as [number, number, number])
    }

    planes.push({ triangle, anti, triplets, antitriplets })
  }

  return planes
}

export type Triple = {
  // the vibe on each of the three ordered places
  readonly vibes: readonly [number, number, number]
  readonly loves: number
  readonly fears: number
  // 3 Q = love - fear
  readonly charge3: number
  // the multiset, e.g. love-love-calm
  readonly kind: string
  // the size of its orbit under S3 (all permutations of the three places)
  readonly arrangements: number
  // the size of its orbit under Z3 (the rotations alone)
  readonly rotations: number
  // the place of the odd vibe for a multiset with two alike and one odd, else -1
  readonly odd: number
  // the Harari-Shupe reading, love = T, calm = V, fear = anti-T; 'outside' when love and fear mix
  readonly harari: string
}

const NAME: Record<number, string> = { 1: 'love', 0: 'calm', [-1]: 'fear' }

const HARARI: Record<string, string> = {
  'love-love-love': 'positron',
  'love-love-calm': 'up',
  'love-calm-calm': 'anti-down',
  'calm-calm-calm': 'neutrino (and antineutrino, the same state)',
  'calm-calm-fear': 'down',
  'calm-fear-fear': 'anti-up',
  'fear-fear-fear': 'electron',
}

export const KIND_ORDER: readonly string[] = [
  'love-love-love',
  'love-love-calm',
  'love-calm-calm',
  'calm-calm-calm',
  'calm-calm-fear',
  'calm-fear-fear',
  'fear-fear-fear',
  'love-love-fear',
  'love-calm-fear',
  'love-fear-fear',
]

export function kindOf(vibes: readonly number[]): string {
  return [...vibes]
    .sort((a, b) => b - a)
    .map(v => NAME[v] ?? '?')
    .join('-')
}

function orbit(vibes: readonly number[], moves: readonly (readonly number[])[]): Set<string> {
  return new Set(moves.map(p => p.map(i => vibes[i] ?? 0).join(',')))
}

const S3 = [
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
  [0, 2, 1],
  [2, 1, 0],
  [1, 0, 2],
]
const Z3 = S3.slice(0, 3)

export const TRIPLES: readonly Triple[] = (() => {
  const out: Triple[] = []

  for (let n = 0; n < 27; n++) {
    const vibes = [0, 1, 2].map(k => (Math.floor(n / 3 ** k) % 3) - 1) as [number, number, number]
    const loves = vibes.filter(v => v === 1).length
    const fears = vibes.filter(v => v === -1).length
    const kind = kindOf(vibes)
    const counts = new Map<number, number>()

    vibes.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1))

    const oddValue = [...counts.entries()].find(([, c]) => c === 1 && counts.size === 2)?.[0]

    out.push({
      vibes,
      loves,
      fears,
      charge3: loves - fears,
      kind,
      arrangements: orbit(vibes, S3).size,
      rotations: orbit(vibes, Z3).size,
      odd: oddValue === undefined ? -1 : vibes.indexOf(oddValue),
      harari: HARARI[kind] ?? 'outside (love and fear mixed)',
    })
  }

  return out
})()

// the cold weave's spec, built as E-FLD-0032 builds it (the head-on turn base, its measured CPT mirror
// phase, two partitions of three matched scatterings a beat)
export function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// every W(F4) element that maps a zero-sum triangle onto itself as a 3-cycle of its directions, with the
// index of that triangle in a2Planes' order (triangle, antitriangle, plane by plane)
export function cyclingElements(): { permutation: number[]; triangle: number }[] {
  const permutations = weylF4DirectionPermutations({ directions: ROOTS.map(r => [...r]) })
  const triangles = a2Planes().flatMap(p => [p.triangle, p.anti])
  const out: { permutation: number[]; triangle: number }[] = []

  triangles.forEach((t, ti) => {
    const [a = 0, b = 0, c = 0] = t

    for (const p of permutations) {
      if ((p[a] === b && p[b] === c && p[c] === a) || (p[a] === c && p[c] === b && p[b] === a)) {
        out.push({ permutation: p, triangle: ti })
      }
    }
  })

  return out
}

// a dock with the given vibes on the given directions and calm elsewhere
export function tripleDock(directions: readonly number[], vibes: readonly number[]): Int8Array {
  const state = new Int8Array(24)

  directions.forEach((d, k) => {
    state[d] = vibes[k] ?? 0
  })

  return state
}
