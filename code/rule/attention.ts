import { Will, cloneWill } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'

// Information routing on the reversible rule engine, stated in the plain terms a
// transformer borrows: attention, embeddings, logits. The point is that the rule is
// already a SPARSE LOCAL routing, not a global all-pairs interaction, and naming the
// pieces makes the optimization explicit.
//
// EMBEDDING. A cell's state is its degree-many ternary slots. Pack them into one
// integer key (base 3 per slot, shifted to 0..2). That key is the cell's token, a
// compact embedding of its local configuration, useful for detecting which cells are
// non-vacuum without rescanning every slot.
//
// ATTENTION. In the stream, each output slot reads exactly one input slot, its source
// along the same line. So the "attention matrix" of the bulk update is one-hot per
// row, maximally sparse: an O(cells x degree) gather, not an O(cells^2) all-pairs
// sweep. The stream source table IS that attention pattern, precomputed once.
//
// LOGITS. The collided slots, the raw output of the local rule before the stream
// moves them, are the pre-routing values. They are the logits of the step, what each
// cell would emit before the routing collapses them onto their destinations.

// The token (embedding key) of one cell: its slots read as a base-3 integer. Two
// cells with the same key hold the same local configuration. The all-zero (vacuum)
// cell has key 0.
export function cellToken(will: Will, cell: number): number {
  const degree = will.mesh.degree
  const base = cell * degree
  let key = 0

  for (let direction = 0; direction < degree; direction++) {
    key = key * 3 + ((will.data[base + direction] ?? 0) + 1)
  }

  return key
}

// True when the stream attention pattern is one-hot per output slot, every input slot
// read exactly once (a permutation). This is what makes the routing sparse: one source
// per destination, so the update is a linear-cost gather rather than a quadratic sweep.
export function isOneHotRouting(mesh: Mesh): boolean {
  const table = streamSourceTable(mesh)
  const seen = new Uint8Array(table.length)

  for (let i = 0; i < table.length; i++) {
    const source = table[i]!

    if (source < 0 || source >= table.length || seen[source]) {
      return false
    }

    seen[source] = 1
  }

  return true
}

// True when the vacuum (an all-zero cell) is a fixed point of the collision. Only
// then is activity pruning exact, because skipping the collide on a vacuum cell
// leaves it identical to having collided it. The committed creating rule fails this
// (peace creates a pair), which is reported honestly, not hidden.
export function vacuumIsFixed(collision: Collision, degree: number): boolean {
  const slots = new Int8Array(degree)
  collision(slots, 0, degree)

  for (let direction = 0; direction < degree; direction++) {
    if (slots[direction] !== 0) {
      return false
    }
  }

  return true
}

// The active cells: those holding any nonzero slot. For a vacuum-fixed rule these are
// the only cells whose collide can change anything, so the collide work prunes to this
// set. The scan is O(cells) here for measurement; a production engine maintains the
// active frontier incrementally as charges stream.
export function activeCells(will: Will): number[] {
  const degree = will.mesh.degree
  const data = will.data
  const active: number[] = []

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      if (data[base + direction] !== 0) {
        active.push(cell)
        break
      }
    }
  }

  return active
}

// One beat with attention routing: collide only the active cells, then stream through
// the one-hot attention pattern. For a vacuum-fixed collision this is bit-identical to
// beat(), since the skipped (vacuum) cells are fixed points. Returns the new will and
// the number of cells actually collided, the cost the pruning pays.
export function attentionBeat(input: {
  will: Will
  collision: Collision
  active?: number[]
}): { will: Will; collideOps: number } {
  const { will, collision } = input
  const mesh = will.mesh
  const degree = mesh.degree
  const table = streamSourceTable(mesh)
  const active = input.active ?? activeCells(will)

  // collide only the active cells, in a copy so the input is untouched
  const collided = cloneWill(will)

  for (const cell of active) {
    collision(collided.data, cell * degree, degree)
  }

  // stream: gather through the one-hot attention pattern
  const source = collided.data
  const out = new Int8Array(source.length)

  for (let i = 0; i < out.length; i++) {
    out[i] = source[table[i]!] ?? 0
  }

  return { will: { mesh, data: out }, collideOps: active.length }
}
