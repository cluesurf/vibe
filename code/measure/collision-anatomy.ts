// The anatomy of a collision, read off the collision function itself and not off its source: which
// slots of a cell interact (the interaction blocks), the exact local map on each block, and which
// triangles of directions (three coin directions summing to zero, the shape an epsilon-type
// three-body vertex needs) ever fall inside one block.
//
// A collision is a map on the 3^degree tone states of one cell. It is too large to tabulate, so the
// blocks are found by probing: slot i influences slot j when changing the input tone at i changes the
// output tone at j for some probe configuration. Blocks are the connected components of that
// influence graph. On each block the collision is then an exact permutation of the 3^size local
// states (the other slots cannot reach it), tabulated in full. `blocksReproduceCollision` checks the
// decomposition back against the collision on every probe, so a missed influence cannot pass silently.

import { Collision } from '@/code/rule/collision'

// A deterministic probe set over `degree` slots: the empty cell, every single nonzero slot, every
// pair of nonzero slots (all four sign combinations), and a family of dense structured fills. The
// sparse probes catch conditional moves (a swap that fires only beside an empty line), the dense ones
// catch moves that need crowding.
export function probeConfigurations(input: { degree: number }): Int8Array[] {
  const { degree } = input
  const probes: Int8Array[] = [new Int8Array(degree)]

  for (let i = 0; i < degree; i++) {
    for (const s of [-1, 1]) {
      const p = new Int8Array(degree)

      p[i] = s
      probes.push(p)
    }
  }

  for (let i = 0; i < degree; i++) {
    for (let j = i + 1; j < degree; j++) {
      for (const si of [-1, 1]) {
        for (const sj of [-1, 1]) {
          const p = new Int8Array(degree)

          p[i] = si
          p[j] = sj
          probes.push(p)
        }
      }
    }
  }

  for (let a = 1; a <= 7; a++) {
    for (let b = 0; b < 5; b++) {
      const p = new Int8Array(degree)

      for (let d = 0; d < degree; d++) {
        p[d] = ((d * a + b + ((d * d * (a + b)) % 3)) % 3) - 1
      }

      probes.push(p)
    }
  }

  return probes
}

function applyCollision(input: {
  collision: Collision
  state: Int8Array
}): Int8Array {
  const out = input.state.slice()

  input.collision(out, 0, out.length)

  return out
}

// The interaction blocks of a collision: connected components of the slot influence graph, each a
// sorted list of slot indices. Singletons are slots nothing else touches.
export function interactionBlocks(input: {
  collision: Collision
  degree: number
  probes: readonly Int8Array[]
}): number[][] {
  const { collision, degree, probes } = input
  const parent = Array.from({ length: degree }, (_, i) => i)
  const find = (i: number): number => {
    let root = i

    while (parent[root] !== root) {
      root = parent[root] ?? root
    }

    return root
  }
  const join = (a: number, b: number): void => {
    const ra = find(a)
    const rb = find(b)

    if (ra !== rb) {
      parent[ra] = rb
    }
  }

  for (const probe of probes) {
    const base = applyCollision({ collision, state: probe })

    for (let i = 0; i < degree; i++) {
      for (const shift of [1, 2]) {
        const changed = probe.slice()

        changed[i] = ((((changed[i] ?? 0) + 1 + shift) % 3) - 1) as number
        const out = applyCollision({ collision, state: changed })

        for (let j = 0; j < degree; j++) {
          if (j !== i && out[j] !== base[j]) {
            join(i, j)
          }
        }
      }
    }
  }

  const groups = new Map<number, number[]>()

  for (let i = 0; i < degree; i++) {
    const root = find(i)
    const list = groups.get(root) ?? []

    list.push(i)
    groups.set(root, list)
  }

  return [...groups.values()]
    .map(block => block.sort((a, b) => a - b))
    .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0))
}

// Encode the tones on a block (in the block's slot order) as a base-three index, tone t as digit t + 1.
export function blockIndex(input: { tones: ArrayLike<number> }): number {
  let index = 0

  for (let k = input.tones.length - 1; k >= 0; k--) {
    index = index * 3 + ((input.tones[k] ?? 0) + 1)
  }

  return index
}

export function blockTones(input: { index: number; size: number }): number[] {
  const out: number[] = []

  let rest = input.index

  for (let k = 0; k < input.size; k++) {
    out.push((rest % 3) - 1)
    rest = Math.floor(rest / 3)
  }

  return out
}

// The exact map of a collision on one block, as a permutation of the 3^size local states: map[x] is
// the image of local state x. The slots outside the block are held at zero, which cannot matter
// because no outside slot influences the block.
export function blockMap(input: {
  collision: Collision
  degree: number
  block: readonly number[]
}): number[] {
  const { collision, degree, block } = input
  const size = block.length
  const states = 3 ** size
  const map: number[] = []

  for (let x = 0; x < states; x++) {
    const tones = blockTones({ index: x, size })
    const state = new Int8Array(degree)

    block.forEach((slot, k) => {
      state[slot] = tones[k] ?? 0
    })

    const out = applyCollision({ collision, state })

    map.push(blockIndex({ tones: block.map(slot => out[slot] ?? 0) }))
  }

  return map
}

// Does the product of the block maps reproduce the collision on every probe? The check that the
// block decomposition is the collision, not an approximation of it.
export function blocksReproduceCollision(input: {
  collision: Collision
  degree: number
  blocks: readonly (readonly number[])[]
  maps: readonly (readonly number[])[]
  probes: readonly Int8Array[]
}): boolean {
  for (const probe of input.probes) {
    const direct = applyCollision({ collision: input.collision, state: probe })
    const assembled = new Int8Array(input.degree)

    input.blocks.forEach((block, b) => {
      const local = blockIndex({ tones: block.map(slot => probe[slot] ?? 0) })
      const image = blockTones({ index: input.maps[b]?.[local] ?? 0, size: block.length })

      block.forEach((slot, k) => {
        assembled[slot] = image[k] ?? 0
      })
    })

    for (let d = 0; d < input.degree; d++) {
      if (assembled[d] !== direct[d]) {
        return false
      }
    }
  }

  return true
}

// Every unordered triple of directions that sums to the zero vector, a closed triangle of the coin.
// For the D4 roots each is a pair of roots and minus their sum, and each A2 subsystem holds two.
export function zeroSumTriangles(input: { directions: readonly number[][] }): number[][] {
  const { directions } = input
  const out: number[][] = []

  for (let a = 0; a < directions.length; a++) {
    for (let b = a + 1; b < directions.length; b++) {
      for (let c = b + 1; c < directions.length; c++) {
        const va = directions[a] ?? []
        const vb = directions[b] ?? []
        const vc = directions[c] ?? []

        if (va.every((x, k) => x + (vb[k] ?? 0) + (vc[k] ?? 0) === 0)) {
          out.push([a, b, c])
        }
      }
    }
  }

  return out
}

// How many of the triangles lie entirely inside one interaction block.
export function trianglesInsideBlocks(input: {
  triangles: readonly (readonly number[])[]
  blocks: readonly (readonly number[])[]
}): number {
  const blockOf = new Map<number, number>()

  input.blocks.forEach((block, b) => {
    for (const slot of block) {
      blockOf.set(slot, b)
    }
  })

  return input.triangles.filter(triangle => {
    const first = blockOf.get(triangle[0] ?? -1)

    return triangle.every(slot => blockOf.get(slot) === first)
  }).length
}
