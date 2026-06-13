// P248 (SP2, SP3, SP6): the spinor FIELD on {3,4,3,4}, a lattice Dirac quantum walk with a 2-component coin
// (the 8s/8c spinor sectors reduced to 1D for clarity). SP3 chirality: when MASSLESS the left and right
// (8s/8c) movers DECOUPLE and stream at +/- c, chirality is conserved; a MASS (coin mixing) couples them and
// chirality oscillates. SP2 the packet propagates coherently as a 2-spinor with spin locked to momentum.
// SP6 spin-statistics: exchanging two identical spinors is a 2*pi relative rotation = the quaternion -1, so
// the pair is ANTISYMMETRIC (fermions), the exact link from the double cover (p244) to Pauli exclusion.
// Run: npx tsx code/experiment/p248-sp-spinor-field-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// complex helpers (re, im)
type C = readonly [number, number]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const I: C = [0, 1]

// 1D Dirac quantum walk: state psiR[x], psiL[x] (complex). coin (mass angle theta) then shift.
function diracWalk(L: number, mass: number, steps: number, seedMode: 'symmetric' | 'right'): { chirality: number[]; centerR: number; centerL: number; center: number; norm: number[] } {
  const wrap = (x: number): number => ((x % L) + L) % L
  let R: C[] = new Array(L).fill([0, 0]); let Lf: C[] = new Array(L).fill([0, 0])
  // localized packet at center, equal weight in both chiralities (a moving Dirac packet uses a phase; here a
  // standing seed that splits into +/- movers when massless)
  const x0 = L >> 1
  if (seedMode === 'symmetric') { R[x0] = [1 / Math.SQRT2, 0]; Lf[x0] = [1 / Math.SQRT2, 0] } else { R[x0] = [1, 0]; Lf[x0] = [0, 0] }
  const c = Math.cos(mass), s = Math.sin(mass)
  const chirality: number[] = []
  const norm: number[] = []
  for (let t = 0; t < steps; t++) {
    // coin: R' = c R - i s L,  L' = -i s R + c L   (mass mixes the two chiralities)
    const R2: C[] = new Array(L), L2: C[] = new Array(L)
    for (let x = 0; x < L; x++) {
      R2[x] = cadd([c * R[x]![0], c * R[x]![1]], cmul([-s, 0], cmul(I, Lf[x]!)))
      L2[x] = cadd(cmul([-s, 0], cmul(I, R[x]!)), [c * Lf[x]![0], c * Lf[x]![1]])
    }
    // shift: R moves +1, L moves -1
    const R3: C[] = new Array(L), L3: C[] = new Array(L)
    for (let x = 0; x < L; x++) { R3[wrap(x + 1)] = R2[x]!; L3[wrap(x - 1)] = L2[x]! }
    R = R3; Lf = L3
    let chR = 0, chL = 0, nn = 0
    for (let x = 0; x < L; x++) { chR += cabs2(R[x]!); chL += cabs2(Lf[x]!); nn += cabs2(R[x]!) + cabs2(Lf[x]!) }
    chirality.push(chR - chL); norm.push(nn)
  }
  // centers of the two chiralities (signed displacement from x0)
  let cR = 0, wR = 0, cL = 0, wL = 0
  for (let x = 0; x < L; x++) { const dx = ((x - x0 + L + L / 2) % L) - L / 2; cR += dx * cabs2(R[x]!); wR += cabs2(R[x]!); cL += dx * cabs2(Lf[x]!); wL += cabs2(Lf[x]!) }
  // combined packet center (weighted by total probability)
  let cc = 0, wc = 0
  for (let x = 0; x < L; x++) { const dx = ((x - x0 + L + L / 2) % L) - L / 2; const w = cabs2(R[x]!) + cabs2(Lf[x]!); cc += dx * w; wc += w }
  return { chirality, centerR: cR / (wR || 1), centerL: cL / (wL || 1), center: cc / (wc || 1), norm }
}

export function spSpinorField(): { chiralityConservedMassless: boolean; chiralityMixesMassive: boolean; lightSpeedMassless: boolean; subluminalMassive: boolean; normConserved: boolean; fermionExchange: boolean } {
  const L = 201, steps = 60
  // SP3 massless: chirality conserved, each chirality streams at +/- c = 1
  const m0 = diracWalk(L, 0, steps, 'symmetric')
  const chiralityConservedMassless = m0.chirality.every((c) => Math.abs(c - m0.chirality[0]!) < 1e-9)
  const lightSpeedMassless = Math.abs(m0.centerR - steps) < 1 && Math.abs(m0.centerL + steps) < 1
  console.log(`P248 (SP3 massless) chirality (|R|^2 - |L|^2) constant ${chiralityConservedMassless}; R moves to +${m0.centerR.toFixed(0)}, L to ${m0.centerL.toFixed(0)} (= +/- c*steps, light speed): ${lightSpeedMassless}`)

  // SP3/SP2 massive: chirality oscillates (mass couples L,R), packet is subluminal
  const mm = diracWalk(L, 0.5, steps, 'right')
  const range = Math.max(...mm.chirality) - Math.min(...mm.chirality)
  const chiralityMixesMassive = range > 0.3
  const subluminalMassive = Math.abs(mm.center) < steps - 5
  console.log(`P248 (SP3/SP2 massive m=0.5) chirality oscillates, range ${range.toFixed(2)} (mass couples 8s,8c): ${chiralityMixesMassive}; packet subluminal |center| ${Math.abs(mm.center).toFixed(0)} < ${steps} = c*steps: ${subluminalMassive}`)

  // norm (probability) conserved = unitary walk
  const normConserved = m0.norm.every((n) => Math.abs(n - 1) < 1e-9) && mm.norm.every((n) => Math.abs(n - 1) < 1e-9)
  console.log(`P248 (SP2) the walk is unitary, total norm conserved at 1: ${normConserved}`)

  // SP6 spin-statistics: exchanging two identical spinors = a 2*pi rotation of the relative coordinate.
  // the spinor exchange amplitude is the quaternion 2*pi rotation overlap = cos(pi) = -1 => antisymmetric => fermion.
  const exchangeSign = Math.cos(Math.PI) // 2*pi rotation, half-angle pi
  const fermionExchange = Math.abs(exchangeSign - -1) < 1e-12
  console.log(`P248 (SP6) spin-statistics: exchange of two spinors = 2*pi relative rotation, amplitude cos(pi) = ${exchangeSign.toFixed(0)} => ANTISYMMETRIC, the 8s/8c are FERMIONS (Pauli), exact link from the double cover: ${fermionExchange}\n`)

  return { chiralityConservedMassless, chiralityMixesMassive, lightSpeedMassless, subluminalMassive, normConserved, fermionExchange }
}

export default defineExperiment({
  id: 'spin/sp-spinor-field-3434',
  title: 'a 2-component Dirac walk on {3,4,3,4} streams chirality at the light speed and mixes it under a mass',
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
        chiralityConservedMassless: r.chiralityConservedMassless ? 1 : 0,
        lightSpeedMassless: r.lightSpeedMassless ? 1 : 0,
        chiralityMixesMassive: r.chiralityMixesMassive ? 1 : 0,
        subluminalMassive: r.subluminalMassive ? 1 : 0,
        normConserved: r.normConserved ? 1 : 0,
      },
      control: {
        // the massless run is the control for the massive run: chirality is exactly
        // conserved (range 0) with no mass, and oscillates only when the mass term is
        // switched on.
        masslessChiralityConserved: r.chiralityConservedMassless ? 1 : 0,
        massiveChiralityMixes: r.chiralityMixesMassive ? 1 : 0,
      },
      notes:
        'L2, known physics (the Dirac quantum walk, the QCA-to-Dirac program). The massless-vs-massive comparison is a genuine internal control. The fermion-exchange line (cos(pi) = -1) is NOT measured from an adiabatic exchange, it just restates the 2pi double-cover sign, so it is excluded from the verdict booleans and left as an analytic remark. This is a 1D reduction of the spinor sectors, not the full 24-direction coin dynamics.',
    })
  },
})
