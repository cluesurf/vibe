// Is a relabelling of the three tone values a symmetry of a rule, measured by running it. The six
// permutations of (-1, 0, +1) are the symmetric group S3, which is also the Weyl group of SU(3): the
// discrete skeleton any SU(3) acting on the tone as a triplet would have to contain. A relabelling is
// a symmetry when running the rule from the relabelled start gives the relabelled run, at every beat,
// for every start tried. The run uses the full engine (collide then stream on a mesh), with a
// collision that may change from beat to beat (a schedule).
//
// The relabelling may differ between the two ends of a line: `leading` acts on every direction that
// is the lower index of its opposite pair and `trailing` on the other, so a triplet at one end and an
// antitriplet (or any relabelled triplet) at the other is tested too, not only the same relabelling
// everywhere. Streaming keeps a tone on its direction, so this is consistent across cells.

import { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { Will, cloneWill } from '@/code/tone/will'

type Relabel = readonly [number, number, number]

// The six permutations of the tone values, each as the image of (-1, 0, +1).
export const TONE_PERMUTATIONS: readonly Relabel[] = [
  [-1, 0, 1],
  [1, 0, -1],
  [0, -1, 1],
  [-1, 1, 0],
  [0, 1, -1],
  [1, -1, 0],
]

export type LineRelabelling = {
  readonly leading: Relabel
  readonly trailing: Relabel
}

// All 36 line relabellings, every pair (leading, trailing).
export function lineRelabellings(): LineRelabelling[] {
  return TONE_PERMUTATIONS.flatMap(leading =>
    TONE_PERMUTATIONS.map(trailing => ({ leading, trailing })),
  )
}

export function relabelWill(input: {
  will: Will
  relabelling: LineRelabelling
}): Will {
  const out = cloneWill(input.will)
  const { mesh } = out
  const degree = mesh.degree

  for (let k = 0; k < out.data.length; k++) {
    const direction = k % degree
    const map =
      direction < mesh.opposite(direction)
        ? input.relabelling.leading
        : input.relabelling.trailing

    out.data[k] = map[(out.data[k] ?? 0) + 1] ?? 0
  }

  return out
}

// The first beat at which the relabelled run and the relabelling of the run disagree, or -1 when
// they agree at every one of `beats` beats.
export function firstRelabellingFailure(input: {
  start: Will
  relabelling: LineRelabelling
  schedule: (beatIndex: number) => Collision
  beats: number
}): number {
  let plain = cloneWill(input.start)
  let relabelled = relabelWill({
    will: input.start,
    relabelling: input.relabelling,
  })

  for (let t = 0; t < input.beats; t++) {
    const collision = input.schedule(t)

    plain = beat(plain, collision)
    relabelled = beat(relabelled, collision)

    const expected = relabelWill({
      will: plain,
      relabelling: input.relabelling,
    })

    for (let k = 0; k < expected.data.length; k++) {
      if (expected.data[k] !== relabelled.data[k]) {
        return t
      }
    }
  }

  return -1
}

// Which of the 36 line relabellings commute with the rule on every start and every beat.
export function commutingLineRelabellings(input: {
  starts: readonly Will[]
  schedule: (beatIndex: number) => Collision
  beats: number
}): LineRelabelling[] {
  return lineRelabellings().filter(relabelling =>
    input.starts.every(
      start =>
        firstRelabellingFailure({
          start,
          relabelling,
          schedule: input.schedule,
          beats: input.beats,
        }) === -1,
    ),
  )
}
