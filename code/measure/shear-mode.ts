// The shear-mode toolkit, the measured-viscosity half of the hydrodynamics story. A
// transverse shear mode is a momAxis-momentum profile varying sinusoidally along
// gradAxis. The key structural fact of the head-on-rotate collision is that it moves
// only zero-momentum head-on pairs between lines, so it NEVER changes the momentum
// imbalance of any line at any cell. Momentum therefore travels only by streaming, and
// momAxis momentum on a line whose root has ZERO gradAxis component never leaves its
// gradAxis slab, an exact spurious invariant (the D4 generalization of the HPP
// per-row-momentum invariant, and the whole story on the 4-direction square coin,
// where no direction carries both components, so a transverse shear is exactly
// frozen). The relaxing shear mode lives on the GRADIENT-COUPLED lines, the roots
// with both a momAxis and a gradAxis component. There a carrier streams across slabs,
// and a collision with a counter-moving background charge hands its momentum to a
// hole advecting the other way, a genuine scattering that diffuses momentum. These
// helpers prepare that state (a hash-disordered pair background plus carriers on the
// chosen lines), measure the mode amplitude, run the series, extract the exponential
// decay rate, and read the exactly-conserved decoupled slab momentum.

import { Will, makeWill } from '@/code/tone/will'
import { Mesh, meshOpposites } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { coordAlong } from '@/code/measure/hydrodynamics'
import { coinLines } from '@/code/measure/sound-wave'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { pairGasFill } from '@/code/measure/density-front'
import { linearFit } from '@/code/measure/regression'

// the fixed hash salt for carrier placement, distinct from the background pair salt
export const CARRIER_SALT = 97

// which lines carry the initial momentum: 'coupled' places carriers only on lines
// whose root has BOTH a momAxis and a gradAxis component (the transport-capable
// momentum), 'carrying' places them on every line with a momAxis component (which on
// the square coin is the x line alone, the exactly frozen case)
export type CarrierLines = 'coupled' | 'carrying'

// A deterministic disordered shear gas: the hash pair background (zero momentum,
// collidable) plus lone momentum carriers whose per-slab count tracks
// biasMax * sin(2 pi mode y / side) along gradAxis, placed where a second
// position-indexed hash falls below the local bias. A carrier line is overwritten to
// hold a single charge at the end whose momAxis component matches the bias sign.
// Fully deterministic, a fixed function of the slot index, no random anywhere.
export function shearGasSetup(input: {
  mesh: Mesh
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  mode: number
  pairFill: number
  biasMax: number
  carrierLines?: CarrierLines
}): Will {
  const {
    mesh,
    directions,
    side,
    gradAxis,
    momAxis,
    mode,
    pairFill,
    biasMax,
  } = input

  const carrierLines = input.carrierLines ?? 'coupled'
  const will = makeWill(mesh)

  pairGasFill({ will, pairFill })

  const lines = coinLines(meshOpposites(mesh))

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const y = coordAlong(cell, gradAxis, side)
    const bias = biasMax * Math.sin((2 * Math.PI * mode * y) / side)
    const base = cell * mesh.degree

    for (let line = 0; line < lines.length; line++) {
      const [a, o] = lines[line]!
      const momComponent = directions[a]![momAxis] ?? 0
      const gradComponent = directions[a]![gradAxis] ?? 0
      const eligible =
        momComponent !== 0 &&
        (carrierLines === 'carrying' || gradComponent !== 0)

      if (
        eligible &&
        hashRand(cell, line, CARRIER_SALT) < Math.abs(bias)
      ) {
        const positiveSlot = momComponent > 0 ? a : o
        const negativeSlot = momComponent > 0 ? o : a

        will.data[base + positiveSlot] = bias > 0 ? 1 : 0
        will.data[base + negativeSlot] = bias > 0 ? 0 : 1
      }
    }
  }

  return will
}

// which direction slots enter the mode projection
export type ShearLineFilter = 'all' | 'coupled' | 'decoupled'

function directionIncluded(input: {
  directions: number[][]
  direction: number
  momAxis: number
  gradAxis: number
  lines: ShearLineFilter
}): boolean {
  const { directions, direction, momAxis, gradAxis, lines } = input
  const momComponent = directions[direction]![momAxis] ?? 0

  if (momComponent === 0) return false

  const gradComponent = directions[direction]![gradAxis] ?? 0

  if (lines === 'coupled') return gradComponent !== 0

  if (lines === 'decoupled') return gradComponent === 0

  return true
}

// the shear-mode amplitude, the momAxis momentum of every cell projected onto
// sin(k y) with k = 2 pi mode / side along gradAxis, optionally restricted to the
// gradient-coupled or gradient-decoupled direction subset
export function shearModeAmplitude(input: {
  will: Will
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  mode: number
  lines?: ShearLineFilter
}): number {
  const { will, directions, side, gradAxis, momAxis, mode } = input
  const lines = input.lines ?? 'all'
  const mesh = will.mesh
  const degree = mesh.degree

  const weight: number[] = []

  for (let direction = 0; direction < degree; direction++) {
    weight.push(
      directionIncluded({
        directions,
        direction,
        momAxis,
        gradAxis,
        lines,
      })
        ? (directions[direction]![momAxis] ?? 0)
        : 0,
    )
  }

  const sinTable: number[] = []

  for (let slab = 0; slab < side; slab++)
    sinTable.push(Math.sin((2 * Math.PI * mode * slab) / side))

  let amplitude = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const projection = sinTable[coordAlong(cell, gradAxis, side)]!
    const base = cell * degree

    let momentum = 0

    for (let direction = 0; direction < degree; direction++) {
      const w = weight[direction]!

      if (w !== 0) momentum += (will.data[base + direction] ?? 0) * w
    }

    amplitude += momentum * projection
  }

  return amplitude
}

// run the gas forward and return the absolute mode-amplitude series (index 0 the
// initial state) plus the final state, so exact invariants can be checked on it
export function shearModeSeries(input: {
  will: Will
  collision: Collision
  beats: number
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
  mode: number
}): { series: number[]; final: Will } {
  const {
    collision,
    beats,
    directions,
    side,
    gradAxis,
    momAxis,
    mode,
  } = input

  const mesh = input.will.mesh
  const table = streamSourceTable(mesh)

  let current: Will = { mesh, data: input.will.data.slice() }
  let scratch = makeWill(mesh)

  const measure = (will: Will): number =>
    shearModeAmplitude({
      will,
      directions,
      side,
      gradAxis,
      momAxis,
      mode,
    })

  const series = [measure(current)]

  for (let step = 0; step < beats; step++) {
    beatInto({ src: current, dst: scratch, table, collision })
    ;[current, scratch] = [scratch, current]
    series.push(measure(current))
  }

  return { series, final: current }
}

// The momAxis momentum per gradAxis slab restricted to the gradient-DECOUPLED
// directions (zero gradAxis component), an integer vector. Under any collision that
// never changes per-line imbalances (head-on-rotate) this vector is EXACTLY conserved
// beat by beat, because its carriers stream inside their own slab, the spurious
// invariant measured as integer equality.
export function decoupledSlabMomentum(input: {
  will: Will
  directions: number[][]
  side: number
  gradAxis: number
  momAxis: number
}): number[] {
  const { will, directions, side, gradAxis, momAxis } = input
  const mesh = will.mesh
  const degree = mesh.degree
  const slab = new Array<number>(side).fill(0)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const y = coordAlong(cell, gradAxis, side)
    const base = cell * degree

    for (let direction = 0; direction < degree; direction++) {
      if ((directions[direction]![gradAxis] ?? 0) !== 0) continue

      const momComponent = directions[direction]![momAxis] ?? 0

      if (momComponent !== 0)
        slab[y]! += (will.data[base + direction] ?? 0) * momComponent
    }
  }

  return slab
}

// the largest absolute difference between two slab-momentum vectors, exactly 0 when
// the invariant holds (integer arithmetic, no tolerance)
export function slabMomentumMaxDelta(
  before: readonly number[],
  after: readonly number[],
): number {
  let worst = 0

  for (let slab = 0; slab < before.length; slab++) {
    worst = Math.max(
      worst,
      Math.abs((after[slab] ?? 0) - (before[slab] ?? 0)),
    )
  }

  return worst
}

// Fit the exponential decay rate of a mode-amplitude series. The window is the beats
// where the relative amplitude sits inside (floor, ceiling], entered from above (the
// leading transient above the ceiling is skipped) and left for good at the first beat
// at or below the floor, so the fit sees one clean decay stretch. Returns the rate
// gamma (positive for decay), the r2 of the log-linear fit, and the number of fitted
// points (0 when the series never presents a decay window, as for a rule whose mode
// does not decay).
export function decayRateFit(input: {
  series: readonly number[]
  floor?: number
  ceiling?: number
}): { gamma: number; r2: number; points: number } {
  const { series } = input
  const floor = input.floor ?? 0.05
  const ceiling = input.ceiling ?? 0.9
  const start = series[0] ?? 0

  if (start === 0) return { gamma: 0, r2: 0, points: 0 }

  const xs: number[] = []
  const ys: number[] = []

  for (let beat = 1; beat < series.length; beat++) {
    const relative = series[beat]! / start

    if (relative <= floor) break

    if (relative <= ceiling) {
      xs.push(beat)
      ys.push(Math.log(relative))
    }
  }

  if (xs.length < 2) return { gamma: 0, r2: 0, points: xs.length }

  const fit = linearFit({ xs, ys })

  return { gamma: -fit.slope, r2: fit.r2, points: xs.length }
}
