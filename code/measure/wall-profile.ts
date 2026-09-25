// The column profile of a staggered-birth wall. A lattice gas starts empty. The cells a `late` predicate
// names are born `lateBy` beats after the rest: before their birth they do not collide, and the frontier
// they form reflects (growingBeat's rule). From then on the rule runs everywhere.
//
// Far from the boundary each region is just the vacuum, started at its own birth beat, so the two regions
// hold vacua at different points of the clock. Counting slots that differ from the uniformly born run
// counts that whole phase domain, which fills the late region and says nothing about where the WALL is.
// So the reference here is the piecewise vacuum: an early cell is compared with the vacuum born at beat
// zero and a late cell with the vacuum born at beat `lateBy`. A uniform state streams onto itself, so
// each vacuum is one cell's 24 slots run through the collisions alone. What differs from the piecewise
// vacuum is the defect the stagger made: the wall itself and anything it radiated.
//
// When the late region is a union of whole columns (a column is every cell with one value of a chosen
// coordinate), the setup is invariant under the translations that keep the column coordinate, so every
// cell of a column differs in the same number of slots. The profile records that number, the differing
// slots of the column divided by the cells in it, per column and per beat. `divisible` says whether
// every column's count was an exact multiple of its cell count, which is that invariance checked rather
// than assumed.
//
// The engine is growingBeat and beat, rewritten over one precomputed stream table so a large box runs at
// gather speed. The reflecting stream is the same rule as streamReflecting in code/rule/lattice-gas: a
// slot whose source is unborn takes this cell's own opposite slot.

import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'

export type WallProfile = {
  // profile[t][x], the slots per cell of column x that differ from the piecewise vacuum after beat t
  readonly profile: number[][]
  readonly divisible: boolean
}

export function wallProfile(input: {
  mesh: Mesh
  rule: (beatIndex: number) => Collision
  late: (cell: number) => boolean
  lateBy: number
  beats: number
  columns: number
  column: (cell: number) => number
}): WallProfile {
  const { mesh, rule, late, lateBy, beats, columns, column } = input
  const degree = mesh.degree
  const cells = mesh.cellCount
  const table = streamSourceTable(mesh)
  const opposite = Array.from({ length: degree }, (_, d) =>
    mesh.opposite(d),
  )
  const isLate = new Uint8Array(cells)
  const columnOf = new Int32Array(cells)
  const perColumn = new Array<number>(columns).fill(0)

  for (let c = 0; c < cells; c++) {
    isLate[c] = late(c) ? 1 : 0
    columnOf[c] = column(c)
    perColumn[columnOf[c]!] = (perColumn[columnOf[c]!] ?? 0) + 1
  }

  const early = new Int8Array(degree)
  const lateVacuum = new Int8Array(degree)

  let state = new Int8Array(cells * degree)
  let spare = new Int8Array(cells * degree)

  const profile: number[][] = []

  let divisible = true

  for (let t = 0; t < beats; t++) {
    const collision = rule(t)
    const born = t >= lateBy

    collision(early, 0, degree)

    if (born) {
      collision(lateVacuum, 0, degree)
    }

    for (let c = 0; c < cells; c++) {
      if (born || isLate[c] === 0) {
        collision(state, c * degree, degree)
      }
    }

    if (born) {
      for (let i = 0; i < table.length; i++) {
        spare[i] = state[table[i]!] ?? 0
      }
    } else {
      for (let c = 0; c < cells; c++) {
        const base = c * degree

        if (isLate[c] === 1) {
          for (let d = 0; d < degree; d++) {
            spare[base + d] = 0
          }

          continue
        }

        for (let d = 0; d < degree; d++) {
          const from = table[base + d]!
          const source = Math.floor(from / degree)

          spare[base + d] =
            isLate[source] === 1
              ? (state[base + opposite[d]!] ?? 0)
              : (state[from] ?? 0)
        }
      }
    }

    const swap = state

    state = spare
    spare = swap

    const counts = new Array<number>(columns).fill(0)

    for (let c = 0; c < cells; c++) {
      const base = c * degree
      const vacuum = isLate[c] === 1 ? lateVacuum : early

      let n = 0

      for (let d = 0; d < degree; d++) {
        n += state[base + d] === vacuum[d] ? 0 : 1
      }

      counts[columnOf[c]!] = (counts[columnOf[c]!] ?? 0) + n
    }

    profile.push(
      counts.map((n, x) => {
        const size = perColumn[x] ?? 1

        if (n % size !== 0) {
          divisible = false
        }

        return n / size
      }),
    )
  }

  return { profile, divisible }
}

export type WallShape = {
  // differing slots per transverse cell, summed over columns
  readonly content: number
  // the share of the content in the columns touching a wall plane (depth zero)
  readonly coreShare: number
  // the share at depth two or more
  readonly farShare: number
  // the content-weighted mean depth, and the deepest column that differs at all
  readonly meanDepth: number
  readonly reach: number
  // how many columns differ at all
  readonly width: number
}

// The shape of one beat's profile, given each column's depth (its distance in columns from the nearest
// wall plane, zero for a column touching one).
export function wallShape(input: {
  profile: readonly number[]
  depth: readonly number[]
}): WallShape {
  const { profile, depth } = input

  let content = 0
  let core = 0
  let far = 0
  let weighted = 0
  let reach = 0
  let width = 0

  profile.forEach((p, x) => {
    const k = depth[x] ?? 0

    content += p
    weighted += p * k

    if (p > 0) {
      width++
      reach = Math.max(reach, k)
    }

    if (k === 0) {
      core += p
    }

    if (k >= 2) {
      far += p
    }
  })

  return {
    content,
    coreShare: content > 0 ? core / content : 0,
    farShare: content > 0 ? far / content : 0,
    meanDepth: content > 0 ? weighted / content : 0,
    reach,
    width,
  }
}

// The depth of every column of a periodic box of `columns` columns whose late region is the columns
// from `lateFrom` to the end: the walls are the planes between lateFrom - 1 and lateFrom and between
// the last column and the first, and a column's depth is its distance in columns from the nearer one.
export function columnDepths(input: {
  columns: number
  lateFrom: number
}): number[] {
  const { columns, lateFrom } = input
  const planes = [lateFrom - 0.5, columns - 0.5]

  return Array.from({ length: columns }, (_, x) => {
    const distances = planes.map(h => {
      const d = Math.abs(x - h) % columns

      return Math.min(d, columns - d)
    })

    return Math.min(...distances) - 0.5
  })
}
