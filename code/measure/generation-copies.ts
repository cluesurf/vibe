// The three copies of a quark triplet in the coin, and the instruments that ask whether a rule tells
// them apart.
//
// Around an A2 plane of the coin (a zero-sum triangle with its opposites, the six directions a color
// triality fixes) the other 18 directions cast shadows on the A2 plane at the three triplet weights and
// the three antitriplet weights, three directions on each, and shadows on the orthogonal plane at six
// points, three directions on each (E-FRC-0106). A line holds a direction and its opposite, so one of
// its two slots is a triplet direction and the other an antitriplet direction. Read per line:
//
// - color: the triplet weight its triplet slot casts on the A2 plane
// - copy: the point its triplet slot casts on the orthogonal plane. Three such points, 120 degrees apart,
//   each holding one line of each color
//
// A color triality fixes the A2 plane pointwise and turns the orthogonal plane by a third of a turn, so it
// keeps a line's color and moves its copy to the next. The copies are numbered so that the triality sends
// copy g to copy g + 1. The six A2 directions make three lines of their own, the gluon lines.
//
// The measurement instrument, for any rule on the D4 box: a lone tone on one slot of one cell, run beside
// the vacuum, and at every beat the charge the seeded run holds above the vacuum on each line, summed over
// the box, with the number of slots that differ and how far the farthest differing cell is from the seed.
// Charge is conserved, so the excess sums to the seed's tone at every beat, and the share on each copy's
// lines is where the tone has gone: a transition count between copies read from the rule itself.

import { dotVec } from '@/code/algebra/group/root-system'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { type Collision } from '@/code/rule/collision'
import { makeWill, type Will } from '@/code/tone/will'
import { type Mesh } from '@/code/tool/mesh'
import { d4BoxDistance } from '@/code/substrate/d4-box'
import { type TrialityWeaveLayout } from '@/code/rule/triality-weave'

export type CopyLayout = {
  // the 12 lines as [lower, higher] direction pairs, in order of the lower direction
  readonly lines: readonly (readonly [number, number])[]
  // per line: -1 for a gluon line, else its copy 0, 1, 2
  readonly copy: readonly number[]
  // per line: -1 for a gluon line, else its color 0, 1, 2
  readonly color: readonly number[]
  // per line: the slot (direction) that is its triplet direction, -1 for a gluon line
  readonly triplet: readonly number[]
  // the triality as a permutation of lines
  readonly lineImage: readonly number[]
  // checks: each copy holds one line of each color, and the triality sends copy g to g + 1 keeping color
  readonly regular: boolean
}

function projection(
  a: readonly number[],
  b: readonly number[],
  v: readonly number[],
): { inPlane: number[]; rest: number[] } {
  const gaa = dotVec([...a], [...a])
  const gab = dotVec([...a], [...b])
  const gbb = dotVec([...b], [...b])
  const det = gaa * gbb - gab * gab
  const x = (gbb * dotVec([...v], [...a]) - gab * dotVec([...v], [...b])) / det
  const y = (gaa * dotVec([...v], [...b]) - gab * dotVec([...v], [...a])) / det
  const inPlane = v.map((_, k) => x * (a[k] ?? 0) + y * (b[k] ?? 0))

  return { inPlane, rest: v.map((value, k) => value - (inPlane[k] ?? 0)) }
}

const pointKey = (v: readonly number[]): string =>
  v.map(x => (Math.abs(x) < 1e-9 ? 0 : x).toFixed(6)).join(',')

// The copy layout of the plane a triality fixes.
export function copyLayout(input: {
  roots: readonly (readonly number[])[]
  opposite: readonly number[]
  triality: readonly number[]
}): CopyLayout {
  const { roots, opposite, triality } = input
  const fixed = triality
    .map((image, d) => (image === d ? d : -1))
    .filter(d => d >= 0)
  const a = roots[fixed[0] ?? 0] ?? []
  const b =
    roots[
      fixed.find(
        d =>
          d !== fixed[0] &&
          d !== opposite[fixed[0] ?? 0] &&
          Math.abs(dotVec([...(roots[d] ?? [])], [...a])) > 1e-9,
      ) ?? 0
    ] ?? []
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const isFixed = new Set(fixed)
  // the triplet weights: the in-plane shadow of the first non-gluon direction, and the shadows at 120
  // degrees from it
  const first = [...Array(roots.length).keys()].find(d => !isFixed.has(d)) ?? 0
  const w0 = projection(a, b, roots[first] ?? []).inPlane
  const isTriplet = (d: number): boolean => {
    const w = projection(a, b, roots[d] ?? []).inPlane

    if (pointKey(w) === pointKey(w0)) {
      return true
    }

    const negative = w0.map(x => -x)

    return dotVec(w, w0) < -1e-9 && pointKey(w) !== pointKey(negative)
  }

  const weights: string[] = []
  const points: string[] = []
  const triplet: number[] = []
  const colorKey: string[] = []
  const pointOf: string[] = []

  for (const [p, q] of lines) {
    if (isFixed.has(p)) {
      triplet.push(-1)
      colorKey.push('')
      pointOf.push('')
      continue
    }

    const t = isTriplet(p) ? p : q
    const { inPlane, rest } = projection(a, b, roots[t] ?? [])

    triplet.push(t)
    colorKey.push(pointKey(inPlane))
    pointOf.push(pointKey(rest))

    if (!weights.includes(pointKey(inPlane))) {
      weights.push(pointKey(inPlane))
    }
  }

  const lineOf = (d: number): number =>
    lines.findIndex(([p, q]) => p === d || q === d)
  const lineImage = lines.map(([p]) => lineOf(triality[p] ?? p))

  // number the copies so the triality moves copy g to g + 1: start from the first non-gluon line
  const start = triplet.findIndex(t => t >= 0)
  const order: string[] = []

  let line = start

  for (let k = 0; k < 3; k++) {
    order.push(pointOf[line] ?? '')
    line = lineImage[line] ?? line
  }

  points.push(...order)

  const copy = pointOf.map(key => (key === '' ? -1 : points.indexOf(key)))
  const color = colorKey.map(key => (key === '' ? -1 : weights.indexOf(key)))
  const regular =
    new Set(points).size === 3 &&
    weights.length === 3 &&
    copy.every((g, l) => (triplet[l] ?? -1) < 0 || g >= 0) &&
    [0, 1, 2].every(g =>
      [0, 1, 2].every(
        c => copy.filter((x, l) => x === g && color[l] === c).length === 1,
      ),
    ) &&
    copy.every((g, l) => {
      if (g < 0) {
        return copy[lineImage[l] ?? l] === -1
      }

      const image = lineImage[l] ?? l

      return copy[image] === (g + 1) % 3 && color[image] === color[l]
    })

  return { lines, copy, color, triplet, lineImage, regular }
}

// The triality weave with every orbit listed from its copy-0 line, keeping triality order. The weave's
// swaps pair orbit r with orbit r + 1 position by position, so the listing decides which copy a swap lands
// a tone on, and trialityWeaveLayout lists an orbit from its lowest line index.
export function alignedLayout(input: {
  layout: TrialityWeaveLayout
  copies: CopyLayout
}): TrialityWeaveLayout {
  const { layout, copies } = input

  return {
    lines: layout.lines,
    color: layout.color,
    orbits: layout.orbits.map(orbit => {
      const start = orbit.findIndex(l => copies.copy[l] === 0)

      return [0, 1, 2].map(k => orbit[(start + k) % 3] ?? 0)
    }),
  }
}

// A rule whose collision at beat t is looked up by the cell's 24 tones, computed once per distinct state.
// The collisions here act on one cell alone and depend only on its state and t, so the lookup gives the
// same result as the rule, and it is fast because almost every cell of a lone run is in the vacuum state
// shared by every run at that beat. The cache is kept per beat index, so t must name the same collision
// every time it is asked for.
export function memoizedRule(
  rule: (t: number) => Collision,
): (t: number) => Collision {
  const caches = new Map<
    number,
    { collision: Collision; table: Map<number, Int8Array> }
  >()

  return t => {
    let entry = caches.get(t)

    if (entry === undefined) {
      entry = { collision: rule(t), table: new Map() }
      caches.set(t, entry)
    }

    const { collision, table } = entry

    return (slots, base, degree) => {
      let key = 0

      for (let k = 0; k < degree; k++) {
        key = key * 3 + (slots[base + k] ?? 0) + 1
      }

      const hit = table.get(key)

      if (hit !== undefined) {
        slots.set(hit, base)

        return
      }

      collision(slots, base, degree)
      table.set(key, slots.slice(base, base + degree))
    }
  }
}

export type LoneRun = {
  // support[t], the number of slots that differ from the vacuum after beat t + 1
  readonly support: readonly number[]
  // lineCharge[t][line], the charge above the vacuum on each line after beat t + 1, over the whole box
  readonly lineCharge: readonly (readonly number[])[]
  // the largest distance from the seed cell to a cell that differs from the vacuum, after reachBeats
  readonly reach: number
}

// The vacuum's states for `beats` beats from the given start, kept so every lone run compares against the
// same sequence without re-running it.
export function vacuumSequence(input: {
  mesh: Mesh
  rule: (t: number) => Collision
  beats: number
  start?: Int8Array
}): Int8Array[] {
  const { mesh, rule, beats } = input
  const table = streamSourceTable(mesh)

  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)

  if (input.start !== undefined) {
    src.data.set(input.start)
  }

  const out: Int8Array[] = []

  for (let t = 0; t < beats; t++) {
    beatInto({ src, dst, table, collision: rule(t) })
    out.push(Int8Array.from(dst.data))
    ;[src, dst] = [dst, src]
  }

  return out
}

// A lone tone on slot `direction` of `cell`, run beside the stored vacuum.
export function loneRun(input: {
  mesh: Mesh
  side: number
  rule: (t: number) => Collision
  vacuum: readonly Int8Array[]
  cell: number
  direction: number
  tone: 1 | -1
  lines: readonly (readonly [number, number])[]
  reachBeats: number
  start?: Int8Array
}): LoneRun {
  const { mesh, side, rule, vacuum, cell, direction, tone, lines, reachBeats } = input
  const table = streamSourceTable(mesh)
  const degree = mesh.degree
  const lineOfSlot = new Int8Array(degree)

  lines.forEach(([p, q], l) => {
    lineOfSlot[p] = l
    lineOfSlot[q] = l
  })

  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)

  if (input.start !== undefined) {
    src.data.set(input.start)
  }

  src.data[cell * degree + direction] =
    (src.data[cell * degree + direction] ?? 0) + tone

  if (Math.abs(src.data[cell * degree + direction] ?? 0) > 1) {
    throw new Error('the seed slot is already occupied by the same tone')
  }

  const support: number[] = []
  const lineCharge: number[][] = []

  let reach = 0

  for (let t = 0; t < vacuum.length; t++) {
    beatInto({ src, dst, table, collision: rule(t) })

    const v = vacuum[t] ?? new Int8Array(0)
    const d = dst.data
    const charge = new Array<number>(lines.length).fill(0)

    let differ = 0

    for (let i = 0; i < d.length; i++) {
      const diff = (d[i] ?? 0) - (v[i] ?? 0)

      if (diff !== 0) {
        differ += 1

        const l = lineOfSlot[i % degree] ?? 0

        charge[l] = (charge[l] ?? 0) + diff
      }
    }

    support.push(differ)
    lineCharge.push(charge)

    if (t + 1 === reachBeats) {
      for (let c = 0; c < mesh.cellCount; c++) {
        for (let k = 0; k < degree; k++) {
          if (d[c * degree + k] !== v[c * degree + k]) {
            reach = Math.max(reach, d4BoxDistance({ a: c, b: cell, side }))
            break
          }
        }
      }
    }

    ;[src, dst] = [dst, src]
  }

  return { support, lineCharge, reach }
}

export type CopyStatistics = {
  // per copy, the mean over its lone runs
  readonly reach: readonly number[]
  readonly finalSupport: readonly number[]
  // mixing[g][h]: the charge share on copy h's lines, time averaged over the run, for a tone seeded on
  // copy g (sign divided out), averaged over that copy's seeds. Column 3 is the gluon lines
  readonly mixing: readonly (readonly number[])[]
  // the same at the last beat
  readonly finalMixing: readonly (readonly number[])[]
  // the largest charge, summed in magnitude line by line, held off the seeded copy at any beat of any run
  readonly leak: number
}

// Per-copy statistics from lone runs indexed by [direction][sign index] (sign index 0 for +1, 1 for -1).
export function copyStatistics(input: {
  layout: CopyLayout
  runs: readonly (readonly (LoneRun | undefined)[])[]
}): CopyStatistics {
  const { layout, runs } = input
  const reach = [0, 0, 0]
  const finalSupport = [0, 0, 0]
  const mixing = [0, 1, 2].map(() => [0, 0, 0, 0])
  const finalMixing = [0, 1, 2].map(() => [0, 0, 0, 0])
  const counts = [0, 0, 0]

  let leak = 0

  const groupOf = (l: number): number => {
    const g = layout.copy[l] ?? -1

    return g < 0 ? 3 : g
  }

  layout.lines.forEach(([p, q], l) => {
    const g = layout.copy[l] ?? -1

    if (g < 0) {
      return
    }

    for (const d of [p, q]) {
      for (let s = 0; s < 2; s++) {
        const run = runs[d]?.[s]
        const sign = s === 0 ? 1 : -1

        if (run === undefined) {
          continue
        }

        counts[g] = (counts[g] ?? 0) + 1
        reach[g] = (reach[g] ?? 0) + run.reach
        finalSupport[g] = (finalSupport[g] ?? 0) + (run.support.at(-1) ?? 0)

        const row = mixing[g] ?? []
        const last = finalMixing[g] ?? []

        run.lineCharge.forEach((charge, t) => {
          let off = 0

          charge.forEach((value, line) => {
            off += groupOf(line) === g ? 0 : Math.abs(value)
          })
          leak = Math.max(leak, off)

          charge.forEach((value, line) => {
            const h = groupOf(line)

            row[h] = (row[h] ?? 0) + (sign * value) / run.lineCharge.length

            if (t === run.lineCharge.length - 1) {
              last[h] = (last[h] ?? 0) + sign * value
            }
          })
        })
      }
    }
  })

  return {
    reach: reach.map((x, g) => x / Math.max(1, counts[g] ?? 0)),
    finalSupport: finalSupport.map((x, g) => x / Math.max(1, counts[g] ?? 0)),
    mixing: mixing.map((row, g) => row.map(x => x / Math.max(1, counts[g] ?? 0))),
    finalMixing: finalMixing.map((row, g) =>
      row.map(x => x / Math.max(1, counts[g] ?? 0)),
    ),
    leak,
  }
}

// Every seed on a copy line against its triality image: the support at every beat, the reach, and the
// line charges carried line to line by the triality must agree exactly. The count of seeds that do not.
// Only seeds present in both are compared, and a seed whose image is missing counts as an exception.
export function degeneracyExceptions(input: {
  copies: CopyLayout
  sigma: readonly number[]
  runs: readonly (readonly (LoneRun | undefined)[])[]
  // only seeds on this copy, against their images on the next
  onCopy?: number
}): number {
  const { copies, sigma, runs, onCopy } = input

  let exceptions = 0

  copies.lines.forEach(([p, q], l) => {
    const g = copies.copy[l] ?? -1

    if (g < 0 || (onCopy !== undefined && g !== onCopy)) {
      return
    }

    for (const d of [p, q]) {
      for (let s = 0; s < 2; s++) {
        const a = runs[d]?.[s]
        const b = runs[sigma[d] ?? d]?.[s]

        if (a === undefined) {
          continue
        }

        if (b === undefined) {
          exceptions += 1
          continue
        }

        // reach is a length computed by hypot from rotated vectors, equal lengths can differ in the last
        // bit, so it is compared to 1e-9. Support and charges are integers and compared exactly
        const same =
          Math.abs(a.reach - b.reach) < 1e-9 &&
          a.support.every((x, t) => x === b.support[t]) &&
          a.lineCharge.every((charge, t) =>
            charge.every(
              (value, line) =>
                value === b.lineCharge[t]?.[copies.lineImage[line] ?? line],
            ),
          )

        exceptions += same ? 0 : 1
      }
    }
  })

  return exceptions
}

// How far a 3 x 3 block of a mixing table is from circulant, the form a symmetry that turns copy g into
// g + 1 forces: the largest |m[g][h] - m[g + 1][h + 1]|.
export function circulantDefect(mixing: readonly (readonly number[])[]): number {
  let worst = 0

  for (let g = 0; g < 3; g++) {
    for (let h = 0; h < 3; h++) {
      worst = Math.max(
        worst,
        Math.abs(
          (mixing[g]?.[h] ?? 0) - (mixing[(g + 1) % 3]?.[(h + 1) % 3] ?? 0),
        ),
      )
    }
  }

  return worst
}
