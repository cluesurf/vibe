// The discrete C, P, T operations on the lattice gas, and the CPT theorem. The committed knit (collide then stream) is
// a reversible cellular automaton, and these are the three discrete symmetry operations whose combination is the
// discrete CPT theorem.
//
//   - CHARGE CONJUGATION C, negate every ternary tone (+1 <-> -1). The knit treats the two tone signs symmetrically,
//     so C commutes with the forward rule.
//   - PARITY P, a spatial reflection, reflect one coordinate of the cell and the matching component of each direction.
//     The knit is built from the symmetric 24-cell, so P commutes with the forward rule.
//   - TIME REVERSAL T, velocity reversal, move each slot's tone to its opposite direction. This conjugates the forward
//     rule to the backward rule (streaming reversed), so a velocity-reversed state runs backward.
//
// Each is a symmetry of the knit (C and P commute with the forward step, T reverses it), so the combined CPT is a
// symmetry of the dynamics, CPT(forward(s)) = backward(CPT(s)).

import { Will } from '@/code/tone/will'

// charge conjugation, negate every tone
export function chargeConjugate(will: Will): Will {
  const data = new Int8Array(will.data.length)
  for (let i = 0; i < data.length; i++) {
    data[i] = -(will.data[i] ?? 0) as -1 | 0 | 1
  }

  return { mesh: will.mesh, data }
}

// time reversal, velocity reversal, each slot's tone moves to the opposite-direction slot of the same cell. This
// conjugates the forward rule to the backward rule.
export function timeReverse(will: Will): Will {
  const mesh = will.mesh
  const degree = mesh.degree
  const data = new Int8Array(will.data.length)
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * degree
    for (let direction = 0; direction < degree; direction++) {
      data[base + mesh.opposite(direction)] =
        will.data[base + direction] ?? 0
    }
  }

  return { mesh, data }
}

// parity, reflect one spatial axis. The cell coordinate along the axis is reflected (modulo the side, on the d4 torus)
// and each direction's component along that axis is negated, so a direction maps to its mirror. Assumes the d4Mesh
// coordinate layout cell = x + side*y + side^2*z + side^3*w.
export function parityReflect(input: {
  will: Will
  directions: number[][]
  side: number
  axis: number
}): Will {
  const { will, directions, side, axis } = input
  const mesh = will.mesh
  const degree = mesh.degree
  const key = (v: number[]): string => v.join(',')
  const directionIndex = new Map(directions.map((v, i) => [key(v), i]))
  // the direction permutation under the reflection of the chosen axis
  const reflectedDirection = directions.map(v => {
    const w = [...v]
    w[axis] = -w[axis]!

    return directionIndex.get(key(w))!
  })
  const coordinate = (cell: number, ax: number): number =>
    Math.floor(cell / side ** ax) % side
  const reflectedCell = (cell: number): number => {
    let result = 0
    for (let ax = 0; ax < 4; ax++) {
      const c =
        ax === axis
          ? (side - coordinate(cell, ax)) % side
          : coordinate(cell, ax)
      result += c * side ** ax
    }

    return result
  }

  const data = new Int8Array(will.data.length)
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    for (let direction = 0; direction < degree; direction++) {
      data[
        reflectedCell(cell) * degree + reflectedDirection[direction]!
      ] = will.data[cell * degree + direction] ?? 0
    }
  }

  return { mesh, data }
}

// the combined CPT operation, charge conjugation then parity then time reversal
export function chargeParityTime(input: {
  will: Will
  directions: number[][]
  side: number
  axis: number
}): Will {
  return chargeConjugate(
    parityReflect({ ...input, will: timeReverse(input.will) }),
  )
}
