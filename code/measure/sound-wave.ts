// The emergent sound wave of the conserving lattice gas, MEASURED from the running dynamics (distinct from the
// analytic lattice dispersion in measure/dispersion.ts, which is computed from the direction set alone). We prepare
// a coarse-grained charge-density wave and watch it oscillate as the gas evolves. A GAPLESS (soft) mode has an
// oscillation period that grows with wavelength, its frequency goes to zero as the wavelength grows, the signature
// of sound. This is how a soft radiation field appears in a discrete substrate, not as a small per-cell amplitude
// (impossible with ternary tones) but as a long-wavelength COLLECTIVE mode of many tones (pure counting, no real
// numbers).

import { makeWill, type Will } from '@/code/tone/will'
import { type Mesh } from '@/code/tool/mesh'
import { chargeDensityProfile } from '@/code/measure/profile'

// the opposite-pair lines of a coin (each direction paired with its opposite). Filling BOTH ends of a line places
// a head-on pair, which carries zero net momentum and is collision-ready.
export function coinLines(opposite: number[]): [number, number][] {
  const lines: [number, number][] = []

  for (let direction = 0; direction < opposite.length; direction++) {
    const other = opposite[direction]!

    if (direction < other) {
      lines.push([direction, other])
    }
  }

  return lines
}

// a deterministic charge-density wave of period `lambda` along an axis. Cells in the high half of each period get
// `highTarget` of their lines filled, the low half `lowTarget`, chosen by a fixed hash so the gas is disordered
// (collisions occur) yet fully deterministic. Each filled line gets both ends set to +1, so net momentum is zero
// and the modulation is a pure density wave.
export function densityWaveAlongAxis(input: {
  mesh: Mesh
  lambda: number
  axisOf: (cell: number) => number
  highTarget: number
  lowTarget: number
  lines: [number, number][]
}): Will {
  const { mesh, lambda, axisOf, highTarget, lowTarget, lines } = input
  const will = makeWill(mesh)
  const degree = mesh.degree
  const lineCount = lines.length

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const high = axisOf(cell) % lambda < lambda / 2
    const target = high ? highTarget : lowTarget
    const base = cell * degree

    for (let line = 0; line < lineCount; line++) {
      const hash =
        (((cell * 73 + line * 149) % lineCount) + lineCount) % lineCount

      if (hash < target) {
        const [a, z] = lines[line]!

        will.data[base + a] = 1
        will.data[base + z] = 1
      }
    }
  }

  return will
}

// the coarse-grained density contrast of a period-`lambda` wave, the mean density in the high stripes minus the
// mean in the low stripes, read from the binned density profile. Oscillates as the density wave propagates.
export function stripeContrast(input: {
  will: Will
  lambda: number
  axisOf: (cell: number) => number
  bins: number
}): number {
  const { will, lambda, axisOf, bins } = input
  const profile = chargeDensityProfile({ will, binOf: axisOf, bins })

  let high = 0
  let low = 0
  let highCount = 0
  let lowCount = 0

  for (let x = 0; x < bins; x++) {
    if (x % lambda < lambda / 2) {
      high += profile[x]!
      highCount++
    } else {
      low += profile[x]!
      lowCount++
    }
  }

  return high / highCount - low / lowCount
}

// the time of the first minimum of a contrast trace, half the oscillation period of the wave. Used to read the
// dispersion, half-period versus wavelength.
export function firstMinimumTime(trace: readonly number[]): number {
  let timeOfMin = 0
  let valueOfMin = trace[0] ?? 0

  for (let t = 1; t < trace.length; t++) {
    if (trace[t]! < valueOfMin) {
      valueOfMin = trace[t]!
      timeOfMin = t
    } else if (trace[t]! > valueOfMin && timeOfMin > 0) {
      break
    }
  }

  return timeOfMin
}
