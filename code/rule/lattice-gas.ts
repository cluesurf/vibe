import { Will } from '@/code/tone/will'
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

// one inverse beat, un-stream then collide, since the collision is an involution.
export function inverseBeat(will: Will, collision: Collision): Will {
  const back = streamInverse(will)
  collide(back, collision)
  return back
}

// run the rule forward for `beats` beats.
export function run(will: Will, collision: Collision, beats: number): Will {
  let current = will
  for (let step = 0; step < beats; step++) current = beat(current, collision)
  return current
}
