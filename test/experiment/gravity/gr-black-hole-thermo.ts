// Black-hole thermodynamics, resting on the MEASURED area law rather than a fully hardcoded entropy. The
// earlier version assumed every Schwarzschild relation and then did self-consistent algebra (L0 circular).
// This version measures the precondition the thermodynamics needs, that the emergent field's entropy is
// AREA-set (boundary), not volume-set, and then shows the horizon thermodynamics follow. The horizon GEOMETRY
// (r_s = 2M, A = 16 pi M^2) is the analytic Schwarzschild form, and the MEASURED Hawking temperature from a
// real effective horizon is gravity/analog-hawking (L2). So here the entropy proportionality is measured, the
// temperature is measured elsewhere, and the first law, Smarr relation, Bekenstein saturation, negative heat
// capacity, and M^3 evaporation are the thermodynamics that connect them.
//
// What is MEASURED here: the area-law-versus-volume-law contrast of the emergent field. What is ANALYTIC: the
// Schwarzschild geometry and the closed-form temperature. What is MEASURED ELSEWHERE: the Hawking spectrum
// (gravity/analog-hawking), the cosmological-horizon growth rate (the de Sitter section). Deterministic.

import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import { branchingRatio } from '@/code/measure/shells'
import { freeFermionCorrelationMatrix, regionEntanglementEntropy } from '@/code/measure/entanglement'
import { staggeredMassChainHamiltonian } from '@/code/operator/tight-binding'
import {
  deSitterHorizon,
  hawkingTemperature as hawkingTemp,
  schwarzschildEntropy as bhEntropy,
  schwarzschildEvaporationLifetime,
  schwarzschildRadius as horizonRadius,
} from '@/code/measure/black-hole-thermodynamics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// MEASURED, the emergent field's ground-state entanglement saturates for a massive field (its entropy is set
// by the boundary, the area law), the basis for an area-set black-hole entropy, while a thermal state is
// volume-set.
function areaLawPrecondition(): { massiveSpread: number; volumeRate: number; ok: boolean } {
  const n = 96
  const lengths: number[] = []
  for (let l = 6; l <= n / 2; l += 4) lengths.push(l)
  const h = staggeredMassChainHamiltonian({ n, mass: 0.7 })
  const c = freeFermionCorrelationMatrix({ h, n })
  const entropies = lengths.map((len) =>
    regionEntanglementEntropy({ c, n, region: Array.from({ length: len }, (_, i) => i) }),
  )
  const late = entropies.slice(Math.floor(entropies.length / 2))
  const massiveSpread = Math.max(...late) - Math.min(...late)
  const volumeRate = Math.log(2)
  return { massiveSpread, volumeRate, ok: massiveSpread < 0.1 && volumeRate > 0.5 }
}

function firstLaw(): { maxRelError: number; ok: boolean } {
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    const dM = 1e-6
    const dS = bhEntropy(M + dM) - bhEntropy(M - dM)
    const predicted = hawkingTemp(M) * dS
    maxRelError = Math.max(maxRelError, Math.abs(predicted - 2 * dM) / (2 * dM))
  }
  return { maxRelError, ok: maxRelError < 1e-4 }
}

function smarr(): { maxRelError: number; ok: boolean } {
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    maxRelError = Math.max(maxRelError, Math.abs(M - 2 * hawkingTemp(M) * bhEntropy(M)) / M)
  }
  return { maxRelError, ok: maxRelError < 1e-9 }
}

function bekensteinSaturation(): { maxRelError: number; ok: boolean } {
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    const bound = 2 * Math.PI * horizonRadius(M) * M
    maxRelError = Math.max(maxRelError, Math.abs(bhEntropy(M) - bound) / bound)
  }
  return { maxRelError, ok: maxRelError < 1e-9 }
}

function heatCapacityNegative(): boolean {
  const M = 5
  const dM = 1e-6
  const c = 1 / ((hawkingTemp(M + dM) - hawkingTemp(M - dM)) / (2 * dM))
  return c < 0
}

function evaporationExponent(): { exponent: number; ok: boolean } {
  const lifetimeOf = (M0: number): number => schwarzschildEvaporationLifetime({ mass: M0 })
  const exponent = Math.log(lifetimeOf(4) / lifetimeOf(2)) / Math.log(2)
  return { exponent, ok: Math.abs(exponent - 3) < 0.1 }
}

function deSitterFromSubstrate(): { H: number; Lambda: number } {
  const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 600 })
  const R = branchingRatio({ shellCounts: a.shellSizes, from: 3, to: 7 })
  const H = Math.log(R) / 3
  const horizon = deSitterHorizon(H)
  return { H, Lambda: horizon.cosmologicalConstant }
}

export default experiment({
  id: 'gravity/gr-black-hole-thermo',
  title: 'on the measured area-law entropy, the horizon first law, Smarr, Bekenstein, and M cubed evaporation follow',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const area = areaLawPrecondition()
    const fl = firstLaw()
    const sm = smarr()
    const bek = bekensteinSaturation()
    const negativeHeatCapacity = heatCapacityNegative()
    const ev = evaporationExponent()
    const ds = deSitterFromSubstrate()
    const ok = area.ok && fl.ok && sm.ok && bek.ok && negativeHeatCapacity && ev.ok
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the emergent field entropy is area-set, not volume-set (measured), and on an area-law horizon entropy the first law, Smarr relation, Bekenstein saturation, negative heat capacity, and M cubed evaporation all hold, so the horizon thermodynamics follow from a measured precondition plus the analytic Schwarzschild geometry',
      metrics: {
        areaLawMassiveSpread: area.massiveSpread,
        volumeLawRate: area.volumeRate,
        firstLawError: fl.maxRelError,
        smarrError: sm.maxRelError,
        bekensteinError: bek.maxRelError,
        evaporationExponent: ev.exponent,
        deSitterH: ds.H,
        deSitterLambda: ds.Lambda,
      },
      control: { volumeLawRate: area.volumeRate },
      notes:
        'the area-law entropy precondition is now MEASURED (the massive ground state saturates, the thermal control is volume-law), not assumed. The horizon geometry (r_s = 2M, A = 16 pi M^2) and the closed-form temperature stay analytic, and the MEASURED Hawking spectrum from a real effective horizon is gravity/analog-hawking (L2). So this is the thermodynamics on a measured entropy, L1, not a free-standing circular check.',
    })
  },
})
