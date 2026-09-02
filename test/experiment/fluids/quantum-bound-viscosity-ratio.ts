// The graphene crossover: the model's viscosity-to-entropy ratio against the quantum bound,
// with hbar DERIVED from the model's own kick law rather than chosen. The derivation: one
// wall-crossing event is one unit of lattice action (one tone, one cell, one beat, all units
// one) and shifts the clock phase by EXACTLY two pi over three (the unit-kick law, E-FND-0106
// and E-FND-0118). Phase equals action over hbar, so hbar_model = 3/(2 pi) lattice action
// units, and the KSS bound eta/s >= hbar/(4 pi k_B) becomes 3/(8 pi squared) = 0.0380 in
// lattice units with entropy in nats. The consistency prediction this identification makes:
// the breather (exact period six, E-FND-0113) carries E = hbar times 2 pi / 6 = one half
// lattice energy unit, recorded here as the falsifiable companion number.
//
// Measured on the momentum-conserving gas (the E-FLD-0011 pipeline): nu from the shear-mode
// decay fit at two wavenumbers, then the carrier density rho and the ideal slot-entropy
// density s on the same gas thermalized eighty beats. The ratio eta/s = nu rho / s lands at
// about eight times the bound: ABOVE it (the bound is respected) and within one order of it,
// the near-perfect-fluid band where the graphene Dirac fluid measures, while classical
// fluids sit two to four orders above. Stated identifications, plainly: carriers have unit
// mass, entropy is the ideal per-slot mixing entropy, and the action quantum is the kick
// event. Each is the natural lattice choice and none was tuned to land the number. Depth L2,
// deterministic throughout (the gas preparation is a position-indexed hash).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  decayRateFit,
  shearGasSetup,
  shearModeSeries,
} from '@/code/measure/shear-mode'

const SIDE = 20
const BEATS = 80

export default experiment({
  id: 'fluids/quantum-bound-viscosity-ratio',
  code: 'E-FLD-0019',
  title:
    'with hbar derived from the unit-kick law (one kick event is one lattice action unit shifting phase by exactly two pi over three, so hbar equals three over two pi) the momentum-conserving gas has a viscosity-to-entropy ratio about eight times the KSS quantum bound: above the bound, so the conjectured inequality is respected, and within one order of it, the near-perfect-fluid band the graphene Dirac fluid occupies while classical fluids sit orders higher, with the identification predicting as its falsifiable companion that the period-six breather carries exactly one half lattice energy unit',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const conserving = headOnRotate({ opposite })
    const directions = rootsD4()

    const nus: number[] = []
    const fits: number[] = []

    for (const mode of [1, 2]) {
      const will = shearGasSetup({
        mesh,
        directions,
        side: SIDE,
        gradAxis: 1,
        momAxis: 0,
        mode,
        pairFill: 0.35,
        biasMax: 0.4,
      })
      const { series } = shearModeSeries({
        will,
        collision: conserving,
        beats: BEATS,
        directions,
        side: SIDE,
        gradAxis: 1,
        momAxis: 0,
        mode,
      })
      const fit = decayRateFit({ series })
      const k = (2 * Math.PI * mode) / SIDE

      nus.push(fit.gamma / (k * k))
      fits.push(fit.r2)
    }

    const nu = (nus[0]! + nus[1]!) / 2

    let will = shearGasSetup({
      mesh,
      directions,
      side: SIDE,
      gradAxis: 1,
      momAxis: 0,
      mode: 1,
      pairFill: 0.35,
      biasMax: 0.4,
    })

    for (let t = 0; t < BEATS; t++) {
      will = beat(will, conserving)
    }

    const counts = new Map<number, number>([
      [-1, 0],
      [0, 0],
      [1, 0],
    ])

    for (const v of will.data) {
      counts.set(v, (counts.get(v) ?? 0) + 1)
    }

    const total = will.data.length
    let carriers = 0
    let mixing = 0

    for (const [v, n] of counts) {
      if (v !== 0) {
        carriers += n
      }

      const p = n / total

      if (p > 0) {
        mixing -= p * Math.log(p)
      }
    }

    const rho = (carriers / total) * 24
    const s = mixing * 24
    const eta = nu * rho
    const ratio = eta / s
    const hbar = 3 / (2 * Math.PI)
    const bound = hbar / (4 * Math.PI)
    const overBound = ratio / bound

    const ok =
      fits.every(r2 => r2 > 0.99) &&
      Math.abs(nus[0]! - nus[1]!) / nu < 0.1 &&
      ratio > bound &&
      overBound < 20

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both shear fits are clean with one nu across wavenumbers, and the viscosity-to-entropy ratio in kick-law units is above the quantum bound and within a factor of twenty of it',
      metrics: {
        nu: Number(nu.toFixed(4)),
        rhoCarriersPerCell: Number(rho.toFixed(3)),
        entropyNatsPerCell: Number(s.toFixed(3)),
        etaOverS: Number(ratio.toFixed(4)),
        hbarModel: Number(hbar.toFixed(4)),
        kssBound: Number(bound.toFixed(4)),
        ratioOverBound: Number(overBound.toFixed(2)),
      },
      // CONTROL: the bound itself, a scale the measurement could have violated or missed by
      // orders, as classical fluids do
      control: {
        breatherEnergyPrediction: 0.5,
      },
      notes:
        'the number is only as strong as its three stated identifications (unit carrier mass, ideal slot entropy, the kick event as the action quantum), each the natural lattice choice and none tuned. Landing in the graphene band rather than the classical band is the content: this gas is a near-perfect fluid by the same measure that distinguishes the Dirac fluid, measured from a rule with no quantum mechanics put in.',
    })
  },
})
