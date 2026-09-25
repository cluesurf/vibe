// The exact finite symmetry of a collision schedule on the D4 coin. The 24-cell symmetry group W(F4),
// order 1152, acts on the 24 coin directions by permutation. An element sigma is a symmetry of a
// schedule C_0, C_1, ..., C_{period - 1} with twist s when conjugating by sigma turns every beat's
// collision into the collision s beats later,
//
//   sigma C_t sigma^-1 = C_{t + s}   for every t,
//
// so s = 0 is an ordinary symmetry and a nonzero s is a symmetry that also shifts time (the turning
// schedule precesses under a 24-cell element, so such twists are expected). The check is exact: every
// collision is decomposed into its interaction blocks (collision-anatomy), sigma must carry each block
// of C_t onto a block of C_{t+s}, and the two block maps must agree on all 3^size local states.

import { Collision } from '@/code/rule/collision'
import { reflectRoot, rootsF4 } from '@/code/algebra/group/root-system'
import {
  blockIndex,
  blockMap,
  blockTones,
  interactionBlocks,
  probeConfigurations,
} from '@/code/measure/collision-anatomy'

// Every element of W(F4) as a permutation of the given directions (the 24 D4 roots in mesh order),
// perm[d] = the index of the image of direction d. Built as the closure of the 48 root reflections.
export function weylF4DirectionPermutations(input: {
  directions: readonly number[][]
}): number[][] {
  const { directions } = input
  const key = (v: readonly number[]): string => v.map(x => Math.round(x)).join(',')
  const index = new Map(directions.map((v, i) => [key(v), i]))
  const generators = rootsF4().map(root =>
    directions.map(v => {
      const image = index.get(key(reflectRoot([...v], root)))

      if (image === undefined) {
        throw new Error('an F4 reflection left the D4 root set')
      }

      return image
    }),
  )
  const identity = directions.map((_, i) => i)
  const seen = new Map<string, number[]>([[identity.join(','), identity]])
  const queue = [identity]

  while (queue.length > 0) {
    const current = queue.pop() ?? identity

    for (const generator of generators) {
      const next = current.map(d => generator[d] ?? d)
      const k = next.join(',')

      if (!seen.has(k)) {
        seen.set(k, next)
        queue.push(next)
      }
    }
  }

  return [...seen.values()]
}

export function permutationOrder(input: { permutation: readonly number[] }): number {
  const { permutation } = input

  let order = 1
  let current = [...permutation]

  while (!current.every((value, i) => value === i)) {
    current = current.map(d => permutation[d] ?? d)
    order += 1
  }

  return order
}

type Anatomy = { blocks: number[][]; maps: number[][]; blockOfSlot: number[] }

// The block anatomy of every beat of a schedule.
export function scheduleAnatomy(input: {
  schedule: (beatIndex: number) => Collision
  period: number
  degree: number
}): Anatomy[] {
  const probes = probeConfigurations({ degree: input.degree })

  return Array.from({ length: input.period }, (_, t) => {
    const collision = input.schedule(t)
    const blocks = interactionBlocks({ collision, degree: input.degree, probes })
    const maps = blocks.map(block => blockMap({ collision, degree: input.degree, block }))
    const blockOfSlot = new Array<number>(input.degree).fill(-1)

    blocks.forEach((block, b) => {
      for (const slot of block) {
        blockOfSlot[slot] = b
      }
    })

    return { blocks, maps, blockOfSlot }
  })
}

// A relabelling of the tone values on the two ends of every line (the leading end is the lower index
// of an opposite pair), each as the image of (-1, 0, +1). The identity leaves tones alone.
export type ToneRelabelling = {
  readonly leading: readonly [number, number, number]
  readonly trailing: readonly [number, number, number]
}

export const IDENTITY_RELABELLING: ToneRelabelling = {
  leading: [-1, 0, 1],
  trailing: [-1, 0, 1],
}

function conjugates(input: {
  permutation: readonly number[]
  relabelling: ToneRelabelling
  opposite: readonly number[]
  from: Anatomy
  to: Anatomy
}): boolean {
  const { permutation, relabelling, opposite, from, to } = input
  // the tone relabelling as it lands on a destination slot
  const relabel = (slot: number, tone: number): number => {
    const map = slot < (opposite[slot] ?? slot) ? relabelling.leading : relabelling.trailing

    return map[tone + 1] ?? tone
  }

  for (let b = 0; b < from.blocks.length; b++) {
    const block = from.blocks[b] ?? []
    const image = block.map(slot => permutation[slot] ?? slot)
    const target = to.blockOfSlot[image[0] ?? 0] ?? -1
    const targetBlock = to.blocks[target] ?? []

    if (targetBlock.length !== block.length || !image.every(slot => to.blockOfSlot[slot] === target)) {
      return false
    }

    // position of each source slot's image inside the target block's own slot order, and the tone
    // relabelled as it arrives there
    const position = image.map(slot => targetBlock.indexOf(slot))
    const carry = (tones: readonly number[]): number[] => {
      const out = new Array<number>(block.length).fill(0)

      position.forEach((p, k) => {
        out[p] = relabel(image[k] ?? 0, tones[k] ?? 0)
      })

      return out
    }
    const sourceMap = from.maps[b] ?? []
    const targetMap = to.maps[target] ?? []

    for (let x = 0; x < sourceMap.length; x++) {
      const tones = blockTones({ index: x, size: block.length })
      const moved = blockIndex({ tones: carry(tones) })
      const imageOfMoved = targetMap[moved] ?? -1
      const movedImage = blockIndex({
        tones: carry(blockTones({ index: sourceMap[x] ?? 0, size: block.length })),
      })

      if (imageOfMoved !== movedImage) {
        return false
      }
    }
  }

  return true
}

export type ScheduleSymmetry = {
  permutation: readonly number[]
  relabelling: ToneRelabelling
  twist: number
}

// Every (sigma, relabelling, twist) that is an exact symmetry of the schedule: sigma permutes the
// directions, the relabelling renames tones on the two ends of each line, and the twist shifts the
// beat. Without `relabellings` only the identity relabelling is tried.
export function scheduleSymmetries(input: {
  anatomy: readonly Anatomy[]
  permutations: readonly (readonly number[])[]
  opposite: readonly number[]
  relabellings?: readonly ToneRelabelling[]
}): ScheduleSymmetry[] {
  const period = input.anatomy.length
  const relabellings = input.relabellings ?? [IDENTITY_RELABELLING]
  const out: ScheduleSymmetry[] = []

  for (const permutation of input.permutations) {
    for (const relabelling of relabellings) {
      for (let twist = 0; twist < period; twist++) {
        const holds = input.anatomy.every((from, t) =>
          conjugates({
            permutation,
            relabelling,
            opposite: input.opposite,
            from,
            to: input.anatomy[(t + twist) % period] ?? from,
          }),
        )

        if (holds) {
          out.push({ permutation, relabelling, twist })
        }
      }
    }
  }

  return out
}

// The order of a symmetry as a combined operation: the smallest k with sigma^k the identity, the
// relabelling applied k times the identity on both line ends, and k twists a whole number of periods.
// Needed because a direction permutation of order 2 combined with a tone 3-cycle has order 6.
export function symmetryOrder(input: {
  symmetry: ScheduleSymmetry
  period: number
  opposite: readonly number[]
}): number {
  const { symmetry, period, opposite } = input
  const sigma = symmetry.permutation
  const identityDirections = sigma.map((_, i) => i)

  // a line end is carried to a line end; track (direction, accumulated tone map) per direction
  let directions = [...identityDirections]
  let toneMaps = identityDirections.map(() => [-1, 0, 1])

  for (let k = 1; k <= 10000; k++) {
    toneMaps = toneMaps.map((map, d) => {
      const landing = sigma[directions[d] ?? d] ?? d
      const relabel =
        landing < (opposite[landing] ?? landing)
          ? symmetry.relabelling.leading
          : symmetry.relabelling.trailing

      return map.map(tone => relabel[tone + 1] ?? tone)
    })
    directions = directions.map(d => sigma[d] ?? d)

    const directionsBack = directions.every((d, i) => d === i)
    const tonesBack = toneMaps.every(map => map[0] === -1 && map[1] === 0 && map[2] === 1)

    if (directionsBack && tonesBack && (k * symmetry.twist) % period === 0) {
      return k
    }
  }

  return -1
}
