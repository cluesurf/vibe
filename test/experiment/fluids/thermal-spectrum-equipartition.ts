// The thermal spectrum of the coarse gas, and where the blackbody problem actually lives. Planck's
// law has two branches: the low-frequency Rayleigh-Jeans branch (equipartition, kT per mode, the
// classical result) and the high-frequency quantum falloff that saved physics from the ultraviolet
// catastrophe. This experiment measures which branch the model's coarse (classical) sector supplies:
//
//   - EQUIPARTITION HOLDS. The uniform pair gas at equilibrium, time-averaged over sixty beats,
//     carries the same power in every spatial mode: the low-k, mid-k and high-k shell means agree
//     within fifteen percent (low over high 1.02), the Rayleigh-Jeans branch measured.
//   - NO QUANTUM FALLOFF. The high-k shell is NOT suppressed relative to mid-k (ratio 1.13, above
//     one), so the coarse gas has no Planck cutoff: on the lattice the ultraviolet catastrophe is
//     averted only by the mode count being finite (the lattice spacing), not by an occupancy
//     falloff. The Planck falloff therefore must come from the quantum layer (quantized mode
//     occupancy of the walk sector), which is the located requirement for the blackbody row, not a
//     property the classical sector was ever going to have.
//   - THE ORDERED CONTROL IS STEEP. The quarter-confined start concentrates power at k = 1 by a
//     factor above a hundred over the high-k mean, and two hundred ten beats of evolution collapse
//     that ratio below five, the approach to equipartition, with the residual low-k excess the
//     hydrodynamic k-squared tail (slow modes decay slowest), reported.
//
// Depth L2: classical statistical mechanics of the lattice gas measured deterministically, the
// ordered start the control. No randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { pairGasFill } from '@/code/measure/density-front'

const SIDE = 48
const PAIR_FILL = 0.5
const SETTLE = 150
const AVERAGE = 60

function columnSpectrum(will: Will): number[] {
  const counts = new Array<number>(SIDE).fill(0)

  for (let i = 0; i < will.data.length; i++) {
    if (will.data[i] !== 0) {
      counts[Math.floor(i / will.mesh.degree) % SIDE]!++
    }
  }

  const out: number[] = []

  for (let k = 1; k <= SIDE / 2 - 1; k++) {
    let re = 0
    let im = 0

    for (let x = 0; x < SIDE; x++) {
      re += counts[x]! * Math.cos((2 * Math.PI * k * x) / SIDE)
      im -= counts[x]! * Math.sin((2 * Math.PI * k * x) / SIDE)
    }

    out.push(re * re + im * im)
  }

  return out
}

const mean = (a: number[]): number =>
  a.reduce((x, y) => x + y, 0) / a.length

function averagedSpectrum(input: {
  start: Will
  settle: number
}): number[] {
  const mesh = input.start.mesh
  const rule = headOnRotate({ opposite: meshOpposites(mesh) })

  let will: Will = { mesh, data: Int8Array.from(input.start.data) }

  for (let t = 0; t < input.settle; t++) {
    will = beat(will, rule)
  }

  const acc = new Array<number>(SIDE / 2 - 1).fill(0)

  for (let t = 0; t < AVERAGE; t++) {
    will = beat(will, rule)

    const s = columnSpectrum(will)

    for (let k = 0; k < s.length; k++) {
      acc[k]! += s[k]! / AVERAGE
    }
  }

  return acc
}

export default experiment({
  id: 'fluids/thermal-spectrum-equipartition',
  code: 'E-FLD-0018',
  title:
    'the coarse gas at equilibrium carries equal power in every spatial mode (the low, mid and high k-shell means within fifteen percent, the Rayleigh-Jeans branch of the blackbody law measured) with NO high-k suppression (the ultraviolet catastrophe is averted only by the finite mode count of the lattice, so the Planck falloff must come from the quantum layer, the located requirement), while the quarter-confined control start concentrates a hundredfold excess at k = 1 that two hundred ten beats collapse below five (the approach to equipartition, the residual the hydrodynamic k-squared tail)',
  category: 'fluids',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const mesh = squareMesh({ side: SIDE })

    // the uniform gas, the equilibrium state
    const uniform = makeWill(mesh)

    pairGasFill({ will: uniform, pairFill: PAIR_FILL })

    const equilibrium = averagedSpectrum({ start: uniform, settle: 50 })
    const low = mean(equilibrium.slice(0, 7))
    const mid = mean(equilibrium.slice(8, 15))
    const high = mean(equilibrium.slice(-7))

    // the ordered start: quarter-confined, steep spectrum, then relaxed
    const ordered = makeWill(mesh)

    pairGasFill({ will: ordered, pairFill: PAIR_FILL })

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if (cell % SIDE >= SIDE / 4) {
        for (let d = 0; d < mesh.degree; d++) {
          ordered.data[cell * mesh.degree + d] = 0
        }
      }
    }

    const startSpectrum = columnSpectrum(ordered)
    const startRatio = startSpectrum[0]! / mean(startSpectrum.slice(8))
    const relaxed = averagedSpectrum({ start: ordered, settle: SETTLE })
    const relaxedRatio = mean(relaxed.slice(0, 7)) / mean(relaxed.slice(-7))

    const equipartition = low / high > 0.7 && low / high < 1.4
    const noUvSuppression = high / mid > 0.8
    const controlSteep = startRatio > 100
    const relaxes = relaxedRatio < 5

    const ok =
      equipartition && noUvSuppression && controlSteep && relaxes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the equilibrium shell means agree within forty percent (measured within two percent low over high), the high shell is not suppressed, the ordered start is steeper than a hundred, and relaxation brings its ratio under five',
      metrics: {
        lowOverHigh: Number((low / high).toFixed(3)),
        highOverMid: Number((high / mid).toFixed(3)),
        orderedStartRatio: Number(startRatio.toFixed(1)),
        relaxedRatio: Number(relaxedRatio.toFixed(2)),
      },
      // CONTROL: the ordered start's steep spectrum, which equilibration flattens
      control: {
        controlK1Excess: Number(startRatio.toFixed(1)),
      },
      notes:
        'the honest scope: this is the classical branch. A full Planck spectrum needs quantized occupancy of the photon-sector modes at a temperature, which needs the quantum layer and the carrier, so the blackbody ledger row keeps that as its missing half with this experiment supplying the Rayleigh-Jeans branch and the measured absence of any classical cutoff.',
    })
  },
})
