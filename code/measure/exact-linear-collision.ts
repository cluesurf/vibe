// The linearized collision of a knit, computed exactly: no draws, no hash, no sampling (E-RLT-0059).
//
// code/coarse/knit-boltzmann estimates the 48 by 48 linearized collision of a dock over an ensemble of product
// draws. At the uniform background (every slot fear, calm or love with chance 1/3 each) the estimate can be
// replaced by an exact count, because that background is the uniform measure on the 3^24 dock states and
// every dock collision is a bijection, so it is invariant, and the derivative of the mean output of slot e
// with respect to the one-body chance of slot d is a joint count:
//
//   A[(e, b), (d, a)] = 3 (P(x_d = a, C(x)_e = b) - P(x_d = calm, C(x)_e = b)),  a, b in {love, fear}
//
// with P the uniform measure. Enumerating 3^24 states is out of reach. What makes it exact and cheap is that
// every knit here is a short product of LAYERS, each a set of disjoint slot blocks acting as bijections: the
// committed turning weave is one layer of six couples (four slots each), the combined knit is scatter set,
// base, scatter set (quads of eight slots, couples of four, quads of eight). Under the uniform measure a
// block no tracked slot enters maps uniform to uniform, so only the slots correlated with x_d need a joint
// table, and only the slots the chosen output block will read need to be kept. The count is a small tensor
// contraction: track (the label x_d, the correlated slots) as a dense table, expand it by a block's
// untracked slots at chance 1/3, permute it by the block's map, and sum out the slots no later block that
// reaches the output reads. Tables stay under 3^14 entries for the combined knit.
//
// The layers are read off the collision functions themselves (code/measure/collision-anatomy: influence
// probes find the blocks, the block map is tabulated in full), and composeMismatches checks the composed
// layers against the knit's own dock collision state by state, so the factorization cannot be assumed.
//
// Layout as code/coarse/knit-boltzmann: index d * 2 + (0 love, 1 fear), rows the output, columns the input.

import { type Collision } from '@/code/rule/collision'
import { blockMap, interactionBlocks, probeConfigurations } from '@/code/measure/collision-anatomy'

// a set of slots and the permutation of their 3^size local states (digit k is slot k's vibe + 1)
export type SlotBlock = { readonly slots: readonly number[]; readonly map: Int32Array }

// disjoint blocks covering every slot of the dock (singletons included)
export type Layer = readonly SlotBlock[]

const LABEL = -1
const FEAR = 0
const CALM = 1
const LOVE = 2

// the layer of a collision: its interaction blocks and each block's exact map
export function layerOf(input: { collision: Collision; degree: number; probes?: readonly Int8Array[] }): Layer {
  const { collision, degree } = input
  const probes = input.probes ?? probeConfigurations({ degree })
  const blocks = interactionBlocks({ collision, degree, probes })

  return blocks.map(slots => ({ slots, map: Int32Array.from(blockMap({ collision, degree, block: slots })) }))
}

// apply one layer to a dock state in place
export function applyLayer(layer: Layer, state: Int8Array): void {
  for (const block of layer) {
    let local = 0

    for (let k = block.slots.length - 1; k >= 0; k--) {
      local = local * 3 + ((state[block.slots[k] ?? 0] ?? 0) + 1)
    }

    let image = block.map[local] ?? local

    for (let k = 0; k < block.slots.length; k++) {
      state[block.slots[k] ?? 0] = (image % 3) - 1
      image = Math.floor(image / 3)
    }
  }
}

// how many of the given dock states the composed layers send somewhere other than the collision does
export function composeMismatches(input: { layers: readonly Layer[]; collision: Collision; states: readonly Int8Array[] }): number {
  let mismatches = 0

  for (const state of input.states) {
    const direct = Int8Array.from(state)
    const composed = Int8Array.from(state)

    input.collision(direct, 0, direct.length)

    for (const layer of input.layers) {
      applyLayer(layer, composed)
    }

    mismatches += direct.every((v, i) => v === composed[i]) ? 0 : 1
  }

  return mismatches
}

// ---- the tensor of the tracked slots ----

type Table = { vars: number[]; data: Float64Array }

function expand(table: Table, slot: number): Table {
  const n = table.data.length
  const data = new Float64Array(n * 3)

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < n; i++) {
      data[j * n + i] = (table.data[i] ?? 0) / 3
    }
  }

  return { vars: [...table.vars, slot], data }
}

function marginalize(table: Table, slot: number): Table {
  const p = table.vars.indexOf(slot)

  if (p < 0) {
    return table
  }

  const stride = 3 ** p
  const n = table.data.length / 3
  const data = new Float64Array(n)

  for (let i = 0; i < table.data.length; i++) {
    const low = i % stride
    const high = Math.floor(i / (stride * 3))

    data[high * stride + low] = (data[high * stride + low] ?? 0) + (table.data[i] ?? 0)
  }

  return { vars: table.vars.filter((_, k) => k !== p), data }
}

function applyBlock(table: Table, block: SlotBlock): Table {
  const strides = block.slots.map(s => 3 ** table.vars.indexOf(s))
  const size = block.slots.length
  const data = new Float64Array(table.data.length)
  const digits = new Int32Array(size)

  for (let i = 0; i < table.data.length; i++) {
    const value = table.data[i] ?? 0

    if (value === 0) {
      continue
    }

    let local = 0
    let rest = i

    for (let k = size - 1; k >= 0; k--) {
      const digit = Math.floor(i / (strides[k] ?? 1)) % 3

      digits[k] = digit
      local = local * 3 + digit
    }

    let image = block.map[local] ?? local

    for (let k = 0; k < size; k++) {
      rest += ((image % 3) - (digits[k] ?? 0)) * (strides[k] ?? 1)
      image = Math.floor(image / 3)
    }

    data[rest] = value
  }

  return { vars: table.vars, data }
}

// The joint distribution of (x_d, output slots of one block of the last layer), as J[a][e][b]: the chance
// that slot d held value a (digit) and output slot e holds b, for e in the target block's slots.
// Exposed for the toy brute-force check.
export function jointToTarget(input: { layers: readonly Layer[]; d: number; target: SlotBlock }): Map<number, Float64Array> {
  const { layers, d, target } = input
  const n = layers.length
  // relevant[l]: the slots at the input of layer l that the target can depend on
  const relevant: Set<number>[] = new Array(n)

  relevant[n - 1] = new Set(target.slots)

  for (let l = n - 2; l >= 0; l--) {
    const out = relevant[l + 1] ?? new Set<number>()
    const inputs = new Set<number>()

    for (const block of layers[l] ?? []) {
      if (block.slots.some(s => out.has(s))) {
        block.slots.forEach(s => inputs.add(s))
      }
    }

    relevant[l] = inputs
  }

  const result = new Map<number, Float64Array>()
  const uniform = (): Float64Array => Float64Array.from({ length: 9 }, () => 1 / 9)

  if (!(relevant[0] ?? new Set()).has(d)) {
    target.slots.forEach(e => result.set(e, uniform()))

    return result
  }

  let table: Table = { vars: [LABEL, d], data: new Float64Array(9) }

  for (let a = 0; a < 3; a++) {
    table.data[a + 3 * a] = 1 / 3
  }

  for (let l = 0; l < n; l++) {
    const blocks = l === n - 1 ? [target] : (layers[l] ?? [])
    const keep = l === n - 1 ? new Set(target.slots) : (relevant[l + 1] ?? new Set<number>())

    for (const block of blocks) {
      const touched = block.slots.filter(s => table.vars.includes(s))

      if (touched.length === 0) {
        continue
      }

      if (!block.slots.some(s => keep.has(s))) {
        for (const s of touched) {
          table = marginalize(table, s)
        }

        continue
      }

      for (const s of block.slots) {
        if (!table.vars.includes(s)) {
          table = expand(table, s)
        }
      }

      table = applyBlock(table, block)

      for (const s of block.slots) {
        if (!keep.has(s)) {
          table = marginalize(table, s)
        }
      }
    }
  }

  for (const e of target.slots) {
    const p = table.vars.indexOf(e)
    const joint = new Float64Array(9)

    for (let i = 0; i < table.data.length; i++) {
      const a = i % 3
      const b = p < 0 ? -1 : Math.floor(i / 3 ** p) % 3

      if (b < 0) {
        for (let c = 0; c < 3; c++) {
          joint[a * 3 + c] = (joint[a * 3 + c] ?? 0) + (table.data[i] ?? 0) / 3
        }
      } else {
        joint[a * 3 + b] = (joint[a * 3 + b] ?? 0) + (table.data[i] ?? 0)
      }
    }

    result.set(e, joint)
  }

  return result
}

// The exact linearized collision of a product of layers at the uniform background, 2 degree by 2 degree
export function exactLinearization(input: { layers: readonly Layer[]; degree: number }): Float64Array {
  const { layers, degree } = input
  const n = 2 * degree
  const matrix = new Float64Array(n * n)
  const last = layers[layers.length - 1] ?? []
  const valueRow = (digit: number): number => (digit === LOVE ? 0 : 1)

  for (let d = 0; d < degree; d++) {
    for (const target of last) {
      const joints = jointToTarget({ layers, d, target })

      for (const [e, joint] of joints) {
        for (const a of [LOVE, FEAR]) {
          for (const b of [LOVE, FEAR]) {
            const value = 3 * ((joint[a * 3 + b] ?? 0) - (joint[CALM * 3 + b] ?? 0))

            matrix[(e * 2 + valueRow(b)) * n + d * 2 + valueRow(a)] = value
          }
        }
      }
    }
  }

  return matrix
}

// The layers of a knit's dock collision at one beat, given the collision of each layer as a function.
// Each factor's blocks are found by influence probes; the caller checks the product against the knit.
export function layersOf(input: { factors: readonly Collision[]; degree: number; probes?: readonly Int8Array[] }): Layer[] {
  return input.factors.map(collision => layerOf({ collision, degree: input.degree, probes: input.probes }))
}

// ---- symmetrization, for the controls ----

// conjugate a one-body matrix by a slot permutation (slot d goes to perm[d], the vibe kept)
export function conjugateBySlots(matrix: Float64Array, perm: readonly number[]): Float64Array {
  const n = perm.length * 2
  const out = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    const pr = (perm[Math.floor(r / 2)] ?? 0) * 2 + (r % 2)

    for (let c = 0; c < n; c++) {
      const pc = (perm[Math.floor(c / 2)] ?? 0) * 2 + (c % 2)

      out[pr * n + pc] = matrix[r * n + c] ?? 0
    }
  }

  return out
}

// the average of a one-body matrix over a group of slot permutations
export function symmetrize(matrix: Float64Array, group: readonly (readonly number[])[]): Float64Array {
  const out = new Float64Array(matrix.length)

  for (const g of group) {
    const c = conjugateBySlots(matrix, g)

    for (let i = 0; i < out.length; i++) {
      out[i] = (out[i] ?? 0) + (c[i] ?? 0) / group.length
    }
  }

  return out
}
