// P248 (SP2, SP3, SP6): the spinor FIELD on {3,4,3,4}, a lattice Dirac quantum walk with a 2-component coin
// (the 8s/8c spinor sectors reduced to 1D for clarity). SP3 chirality: when MASSLESS the left and right
// (8s/8c) movers DECOUPLE and stream at +/- c, chirality is conserved; a MASS (coin mixing) couples them and
// chirality oscillates. SP2 the packet propagates coherently as a 2-spinor with spin locked to momentum.
// SP6 spin-statistics: exchanging two identical spinors is a 2*pi relative rotation = the quaternion -1, so
// the pair is ANTISYMMETRIC (fermions), the exact link from the double cover (p244) to Pauli exclusion.
// Run: npx tsx code/experiment/p248-sp-spinor-field-3434.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracQuantumWalk } from '@/code/dynamics/quantum-walk'

// 1D Dirac quantum walk: state psiR[x], psiL[x] (complex). coin (mass angle theta) then shift.
const diracWalk = (
  L: number,
  mass: number,
  steps: number,
  seedMode: 'symmetric' | 'right',
): {
  chirality: number[]
  centerR: number
  centerL: number
  center: number
  norm: number[]
} => diracQuantumWalk({ size: L, mass, steps, seedMode })

export function spSpinorField(): {
  chiralityConservedMassless: boolean
  chiralityMixesMassive: boolean
  lightSpeedMassless: boolean
  subluminalMassive: boolean
  normConserved: boolean
  fermionExchange: boolean
} {
  const L = 201,
    steps = 60
  // SP3 massless: chirality conserved, each chirality streams at +/- c = 1
  const m0 = diracWalk(L, 0, steps, 'symmetric')
  const chiralityConservedMassless = m0.chirality.every(
    c => Math.abs(c - m0.chirality[0]!) < 1e-9,
  )
  const lightSpeedMassless =
    Math.abs(m0.centerR - steps) < 1 && Math.abs(m0.centerL + steps) < 1

  // SP3/SP2 massive: chirality oscillates (mass couples L,R), packet is subluminal
  const mm = diracWalk(L, 0.5, steps, 'right')
  const range = Math.max(...mm.chirality) - Math.min(...mm.chirality)
  const chiralityMixesMassive = range > 0.3
  const subluminalMassive = Math.abs(mm.center) < steps - 5

  // norm (probability) conserved = unitary walk
  const normConserved =
    m0.norm.every(n => Math.abs(n - 1) < 1e-9) &&
    mm.norm.every(n => Math.abs(n - 1) < 1e-9)

  // SP6 spin-statistics: exchanging two identical spinors = a 2*pi rotation of the relative coordinate.
  // the spinor exchange amplitude is the quaternion 2*pi rotation overlap = cos(pi) = -1 => antisymmetric => fermion.
  const exchangeSign = Math.cos(Math.PI) // 2*pi rotation, half-angle pi
  const fermionExchange = Math.abs(exchangeSign - -1) < 1e-12

  return {
    chiralityConservedMassless,
    chiralityMixesMassive,
    lightSpeedMassless,
    subluminalMassive,
    normConserved,
    fermionExchange,
  }
}

export default experiment({
  id: 'spin/sp-spinor-field-3434',
  title:
    'a 2-component Dirac walk on {3,4,3,4} streams chirality at the light speed and mixes it under a mass',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = spSpinorField()
    const ok =
      r.chiralityConservedMassless &&
      r.chiralityMixesMassive &&
      r.lightSpeedMassless &&
      r.subluminalMassive &&
      r.normConserved
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a unitary two-component Dirac quantum walk propagates a spinor packet coherently, conserving chirality and streaming each chirality at the light speed when massless, while a mass term couples the two chiralities and makes the packet subluminal, with total probability conserved throughout',
      metrics: {
        chiralityConservedMassless: r.chiralityConservedMassless
          ? 1
          : 0,
        lightSpeedMassless: r.lightSpeedMassless ? 1 : 0,
        chiralityMixesMassive: r.chiralityMixesMassive ? 1 : 0,
        subluminalMassive: r.subluminalMassive ? 1 : 0,
        normConserved: r.normConserved ? 1 : 0,
      },
      control: {
        // the massless run is the control for the massive run: chirality is exactly
        // conserved (range 0) with no mass, and oscillates only when the mass term is
        // switched on.
        masslessChiralityConserved: r.chiralityConservedMassless
          ? 1
          : 0,
        massiveChiralityMixes: r.chiralityMixesMassive ? 1 : 0,
      },
      notes:
        'L2, known physics (the Dirac quantum walk, the QCA-to-Dirac program). The massless-vs-massive comparison is a genuine internal control. The fermion-exchange line (cos(pi) = -1) is NOT measured from an adiabatic exchange, it just restates the 2pi double-cover sign, so it is excluded from the verdict booleans and left as an analytic remark. This is a 1D reduction of the spinor sectors, not the full 24-direction coin dynamics.',
    })
  },
})
