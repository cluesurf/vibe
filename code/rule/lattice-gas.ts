import { Will } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'

// The directional lattice gas, the committed rule, as a reusable engine over any
// Mesh. A beat is two steps, stream then collide. The engine is generic in the
// mesh degree, so it runs the 2D four-direction toy and the {3,4,3,4}
// twenty-four-direction rule through the same code.

// STREAM: each slot moves to the neighbour it points at. The new value in slot
// `direction` of a cell is the value the back-neighbour was sending forward along
// that same line, out(v, c) = in(neighbour(v, opposite(c)), c). A bijection.
export function stream(will: Will): Will {
  const mesh = will.mesh
  const degree = mesh.degree
  const input = will.data
  const output = new Int8Array(input.length)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      const source = mesh.neighbour(cell, mesh.opposite(direction))

      output[base + direction] = input[source * degree + direction] ?? 0
    }
  }

  return { mesh, data: output }
}

// the inverse of stream: each slot moves back the way it came.
export function streamInverse(will: Will): Will {
  const mesh = will.mesh
  const degree = mesh.degree
  const input = will.data
  const output = new Int8Array(input.length)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      const source = mesh.neighbour(cell, direction)

      output[base + direction] = input[source * degree + direction] ?? 0
    }
  }

  return { mesh, data: output }
}

// COLLIDE: apply the local collision at every cell at once, in place.
export function collide(will: Will, collision: Collision): void {
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    collision(will.data, cell * degree, degree)
  }
}

// one beat, collide then stream. Returns the new will, since stream allocates.
export function beat(will: Will, collision: Collision): Will {
  collide(will, collision)

  return stream(will)
}

// Precompute the STREAM gather table once for a mesh. table[base + direction] is the flat slot index that
// slot (cell, direction) reads from, source * degree + direction with source = neighbour(cell, opposite(
// direction)). With this, a stream is a flat gather (output[i] = input[table[i]]) with no per-slot neighbour
// or opposite calls and no modulo, the same result as stream(). The mesh adjacency is static, so the table is
// valid for the life of the mesh, and it is cached per mesh so experiments that call run() many times on one
// mesh build it only once.
const streamTableCache = new WeakMap<Mesh, Int32Array>()

export function streamSourceTable(mesh: Mesh): Int32Array {
  const cached = streamTableCache.get(mesh)

  if (cached) {
    return cached
  }

  const degree = mesh.degree
  const table = new Int32Array(mesh.cellCount * degree)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      const source = mesh.neighbour(cell, mesh.opposite(direction))

      table[base + direction] = source * degree + direction
    }
  }

  streamTableCache.set(mesh, table)

  return table
}

// one beat, in place and allocation-free, using a precomputed stream table and a double buffer. Collides src
// (in place) then gathers into dst via the table, no Will is allocated. The caller ping-pongs src and dst,
// the dst becomes the new state. Identical result to beat(), but the hot inner loop is a flat gather instead
// of millions of neighbour/opposite closure calls, and there is no per-beat allocation. The collided src is
// stale after the call (it is reused as the next dst).
export function beatInto(input: {
  src: Will
  dst: Will
  table: Int32Array
  collision: Collision
}): void {
  const { src, dst, table, collision } = input

  collide(src, collision)

  const sd = src.data
  const dd = dst.data

  for (let i = 0; i < table.length; i++) {
    dd[i] = sd[table[i]!] ?? 0
  }
}

// one inverse beat, un-stream then collide, since the collision is an involution.
export function inverseBeat(will: Will, collision: Collision): Will {
  const back = streamInverse(will)

  collide(back, collision)

  return back
}

// run the rule forward for `beats` beats. Buffered and allocation-free, two buffers ping-ponged through a
// precomputed stream table, the same result as chaining beat() but without allocating a Will per beat or
// calling neighbour/opposite per slot. The input will is copied, so it is left untouched.
export function run(
  will: Will,
  collision: Collision,
  beats: number,
): Will {
  if (beats <= 0) {
    return will
  }

  const table = streamSourceTable(will.mesh)

  let a: Will = { mesh: will.mesh, data: Int8Array.from(will.data) }
  let b: Will = {
    mesh: will.mesh,
    data: new Int8Array(will.data.length),
  }

  for (let step = 0; step < beats; step++) {
    beatInto({ src: a, dst: b, table, collision })

    const swap = a

    a = b
    b = swap
  }

  return a
}

// one beat with the collision applied only where `born` admits the cell, then a full stream. This is the
// growing-mesh picture at the lattice-gas level: an unborn cell holds peace and does not collide (so the
// charge rule's create move does not fire there), while streaming passes through it untouched, which is
// how the interior's flash reaches a newborn region as a physical contact wave. From its birth beat on, a
// cell joins the collision and its create-flip-annihilate cycle starts THEN, offset from the interior
// clock by its birth beat. Reversible from birth: on the active set the map is the committed bijection.
export function beatWhere(
  will: Will,
  collision: Collision,
  active: (cell: number) => boolean,
): Will {
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    if (active(cell)) {
      collision(will.data, cell * degree, degree)
    }
  }

  return stream(will)
}

// The stream with a reflecting frontier: cells outside `active` do not exist yet, so a value that would
// enter one bounces back along its own line instead. The inflow into slot (cell, direction) normally
// comes from source = neighbour(cell, opposite(direction)); the bounce into that same slot comes from
// this cell's own opposite slot pointing at that same source, so the two cases are exclusive and the map
// stays a bijection on the active region's slots:
//
//   out(cell, d) = in(source, d)              if source is active
//                = in(cell, opposite(d))      if source is unborn (the wall)
//
export function streamReflecting(
  will: Will,
  active: (cell: number) => boolean,
): Will {
  const mesh = will.mesh
  const degree = mesh.degree
  const input = will.data
  const output = new Int8Array(input.length)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (!active(cell)) {
      continue
    }

    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      const source = mesh.neighbour(cell, mesh.opposite(direction))

      output[base + direction] = active(source)
        ? (input[source * degree + direction] ?? 0)
        : (input[base + mesh.opposite(direction)] ?? 0)
    }
  }

  return { mesh, data: output }
}

// one beat of the growing lattice gas: collide on the born cells, then stream with the frontier
// reflecting. A cell born at beat b holds peace until then (nothing reaches it through the wall), starts
// its create-flip-annihilate cycle at its first collided beat, and so runs the vacuum clock offset by b.
// On the born region the map is a bijection, so the growing gas is exactly reversible from birth.
export function growingBeat(
  will: Will,
  collision: Collision,
  active: (cell: number) => boolean,
): Will {
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    if (active(cell)) {
      collision(will.data, cell * degree, degree)
    }
  }

  return streamReflecting(will, active)
}
