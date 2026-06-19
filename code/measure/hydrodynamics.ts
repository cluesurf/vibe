// Hydrodynamics on the committed D4 lattice gas. The knit is a lattice-gas cellular automaton (collide then
// stream), so coarse-graining it is the classic discrete route to fluid mechanics. These helpers build a
// deterministic transverse SHEAR (a sinusoidal momentum profile, no random anywhere), measure its Fourier
// amplitude, and run it forward to test whether the shear dissipates (viscosity) or recurs. The finding is that
// the reversible bulk does NOT viscously relax a shear (it recurs, Poincare recurrence on a closed system), while
// the open boundary (the bath) does, so momentum diffusion is bath-driven, the same arrow-from-the-wake principle.
// The functions assume the 4D d4Mesh coordinate layout, cell = x + side*y + side^2*z + side^3*w.

import { Will, makeWill, cloneWill, cellTone } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'

// Absorb the gradient-axis boundary slabs (the bath) in place, used by the open-mesh runs.
function absorbGradientBoundary(
  will: Will,
  side: number,
  gradAxis: number,
): void {
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const coordinate = coordAlong(cell, gradAxis, side)

    if (coordinate === 0 || coordinate === side - 1) {
      const base = cell * degree

      for (let direction = 0; direction < degree; direction++) {
        will.data[base + direction] = 0
      }
    }
  }
}

// the integer coordinate of a cell along one of the four d4 axes.
export function coordAlong(
  cell: number,
  axis: number,
  side: number,
): number {
  return Math.floor(cell / side ** axis) % side
}

// the net momentum of one cell along momAxis, the sum over its slots of tone times the slot direction's component.
export function cellMomentum(
  will: Will,
  cell: number,
  directions: number[][],
  momAxis: number,
): number {
  const degree = will.mesh.degree
  const base = cell * degree

  let momentum = 0

  for (let direction = 0; direction < degree; direction++) {
    momentum +=
      (will.data[base + direction] ?? 0) *
      (directions[direction]![momAxis] ?? 0)
  }

  return momentum
}

// A deterministic transverse shear, a dense thermal gas (collidable head-on pairs, with empty rotation targets)
// plus a sinusoidal momAxis-momentum bias varying along gradAxis. No random, the state is a fixed function of the
// cell coordinate. This is the lattice-gas analogue of a sheared fluid u_momAxis(gradAxis) = A sin(k gradAxis).
export function shearSetup(input: {
  mesh: Mesh
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  wavelength: number
}): Will {
  const { mesh, directions, side, gradAxis, momAxis, wavelength } =
    input

  const degree = mesh.degree
  const will = makeWill(mesh)
  const data = will.data
  const opposite: number[] = []

  for (let direction = 0; direction < degree; direction++) {
    opposite.push(mesh.opposite(direction))
  }

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const amplitude = Math.sin(
      (2 * Math.PI * coordAlong(cell, gradAxis, side)) / wavelength,
    )

    const base = cell * degree

    let noMomentumLine = 0

    for (let direction = 0; direction < degree; direction++) {
      const other = opposite[direction]!

      if (direction >= other) {
        continue
      }

      const component = directions[direction]![momAxis] ?? 0 // momAxis component of this line (other has the negative)

      if (component !== 0) {
        const positiveSlot = component > 0 ? direction : other
        const negativeSlot = component > 0 ? other : direction

        if (amplitude > 0.33) {
          data[base + positiveSlot] = 1
          data[base + negativeSlot] = 0
        } // net +momAxis flow
        else if (amplitude < -0.33) {
          data[base + negativeSlot] = 1
          data[base + positiveSlot] = 0
        } // net -momAxis flow
        else {
          data[base + direction] = 1
          data[base + other] = 1
        } // a thermal (zero-momentum) pair
      } else {
        // half the no-momentum lines are thermal pairs, half stay empty as rotation targets (deterministic)
        if (noMomentumLine % 2 === 0) {
          data[base + direction] = 1
          data[base + other] = 1
        }

        noMomentumLine++
      }
    }
  }

  return will
}

// the Fourier amplitude of the shear mode, the momAxis momentum projected onto sin(k gradAxis).
export function shearAmplitude(input: {
  will: Will
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  wavelength: number
}): number {
  const { will, directions, side, gradAxis, momAxis, wavelength } =
    input

  let amplitude = 0

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    amplitude +=
      cellMomentum(will, cell, directions, momAxis) *
      Math.sin(
        (2 * Math.PI * coordAlong(cell, gradAxis, side)) / wavelength,
      )
  }

  return amplitude
}

// Run the shear forward and return the amplitude series RELATIVE to the start. If `open`, the gradAxis boundary
// slabs are absorbed each beat (the bath), otherwise the mesh is the closed periodic torus.
export function shearAmplitudeSeries(input: {
  will: Will
  collision: Collision
  beats: number
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  wavelength: number
  open: boolean
}): number[] {
  const {
    collision,
    beats,
    directions,
    side,
    gradAxis,
    momAxis,
    wavelength,
    open,
  } = input

  // allocation-free double buffer, the in-place beat (same result as beat(), far fewer allocations)
  const table = streamSourceTable(input.will.mesh)

  let current = cloneWill(input.will)
  let scratch = makeWill(input.will.mesh)

  const measure = (w: Will) =>
    shearAmplitude({
      will: w,
      directions,
      side,
      gradAxis,
      momAxis,
      wavelength,
    })

  const start = measure(current)
  const series = [1]

  for (let step = 0; step < beats; step++) {
    beatInto({ src: current, dst: scratch, table, collision })
    ;[current, scratch] = [scratch, current]

    if (open) {
      absorbGradientBoundary(current, side, gradAxis)
    }

    series.push(start === 0 ? 0 : measure(current) / start)
  }

  return series
}

// A deterministic CHARGE-density wave, the net cell charge following sin(k gradAxis). The committed pair-table's
// create move is charge-neutral per cell, so the net-cell-charge field is clean of vacuum churn, the charge mode is
// measurable directly. Used to test whether the conserved charge diffuses (it does not in the reversible bulk, it
// recurs, the same bath-driven story as the momentum shear).
export function chargeWaveSetup(input: {
  mesh: Mesh
  side: number
  gradAxis: number
  wavelength: number
  band?: number
}): Will {
  const { mesh, side, gradAxis, wavelength } = input
  const band = input.band ?? 6
  const degree = mesh.degree
  const will = makeWill(mesh)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const amplitude = Math.sin(
      (2 * Math.PI * coordAlong(cell, gradAxis, side)) / wavelength,
    )

    const base = cell * degree

    if (amplitude > 0.33) {
      for (let direction = 0; direction < band; direction++) {
        will.data[base + direction] = 1
      }
    } else if (amplitude < -0.33) {
      for (let direction = 0; direction < band; direction++) {
        will.data[base + direction] = -1
      }
    }
  }

  return will
}

// the Fourier amplitude of the charge-density wave, the net cell charge projected onto sin(k gradAxis).
export function chargeWaveAmplitude(input: {
  will: Will
  side: number
  gradAxis: number
  wavelength: number
}): number {
  const { will, side, gradAxis, wavelength } = input

  let amplitude = 0

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    amplitude +=
      cellTone(will, cell) *
      Math.sin(
        (2 * Math.PI * coordAlong(cell, gradAxis, side)) / wavelength,
      )
  }

  return amplitude
}

// run the charge wave forward, return the amplitude series relative to the start. `open` absorbs the gradAxis
// boundary slabs (the bath).
export function chargeWaveSeries(input: {
  will: Will
  collision: Collision
  beats: number
  side: number
  gradAxis: number
  wavelength: number
  open: boolean
}): number[] {
  const { collision, beats, side, gradAxis, wavelength, open } = input
  // allocation-free double buffer, the in-place beat (same result as beat(), far fewer allocations)
  const table = streamSourceTable(input.will.mesh)

  let current = cloneWill(input.will)
  let scratch = makeWill(input.will.mesh)

  const measure = (w: Will) =>
    chargeWaveAmplitude({ will: w, side, gradAxis, wavelength })

  const start = measure(current)
  const series = [1]

  for (let step = 0; step < beats; step++) {
    beatInto({ src: current, dst: scratch, table, collision })
    ;[current, scratch] = [scratch, current]

    if (open) {
      absorbGradientBoundary(current, side, gradAxis)
    }

    series.push(start === 0 ? 0 : measure(current) / start)
  }

  return series
}
