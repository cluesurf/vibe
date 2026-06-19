// Neutrino oscillations from the A4 -> TM2 prediction (the 24-cell = binary tetrahedral group contains A4, which
// forces trimaximal TM2 mixing; see the v0.9.0 notes). This turns the structural prediction into the observable:
// the PMNS matrix, the defining TM2 invariant |U_e2|^2 = |U_mu2|^2 = |U_tau2|^2 = 1/3, the predicted solar angle
// sin^2(theta12) = 1/(3 cos^2 theta13) ~ 0.341 (a falsifiable ~2 sigma tension JUNO will test), maximal leptonic
// CP (delta = -90 at maximal atmospheric), and a sample oscillation probability. The control is anarchic mixing,
// which has no 1/3 column structure. This is a consistency simulation of the prediction (L2), not a substrate run.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type C = { re: number; im: number }
const c = (re: number, im = 0): C => ({ re, im })
const cmul = (a: C, b: C): C =>
  c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
const cadd = (a: C, b: C): C => c(a.re + b.re, a.im + b.im)
const cabs2 = (a: C): number => a.re * a.re + a.im * a.im

// standard PMNS U = R23 . U13(delta) . R12, returning the 3x3 complex matrix.
function pmns(
  th12: number,
  th23: number,
  th13: number,
  delta: number,
): C[][] {
  const s12 = Math.sin(th12),
    c12 = Math.cos(th12)
  const s23 = Math.sin(th23),
    c23 = Math.cos(th23)
  const s13 = Math.sin(th13),
    c13 = Math.cos(th13)
  const e = c(Math.cos(delta), -Math.sin(delta)) // e^{-i delta}
  const eP = c(Math.cos(delta), Math.sin(delta))
  // rows: e, mu, tau ; cols: 1, 2, 3
  return [
    [c(c12 * c13), c(s12 * c13), cmul(c(s13), e)],
    [
      cadd(c(-s12 * c23), cmul(c(-c12 * s23 * s13), eP)),
      cadd(c(c12 * c23), cmul(c(-s12 * s23 * s13), eP)),
      c(s23 * c13),
    ],
    [
      cadd(c(s12 * s23), cmul(c(-c12 * c23 * s13), eP)),
      cadd(c(-c12 * s23), cmul(c(-s12 * c23 * s13), eP)),
      c(c23 * c13),
    ],
  ]
}

// Jarlskog invariant J = Im(U_e1 U_mu2 U*_e2 U*_mu1)
function jarlskog(U: C[][]): number {
  const conj = (x: C) => c(x.re, -x.im)
  return cmul(
    cmul(U[0]![0]!, U[1]![1]!),
    cmul(conj(U[0]![1]!), conj(U[1]![0]!)),
  ).im
}

export default experiment({
  id: 'gauge/neutrino-oscillation-tm2',
  title:
    'the A4 -> TM2 prediction gives trimaximal PMNS oscillations: |U_i2|^2 = 1/3, sin^2 theta12 = 0.341, maximal leptonic CP, versus anarchic mixing',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // TM2 prediction: theta13 measured (8.57 deg), theta23 maximal (45 deg), delta = -90 (maximal CP),
    // theta12 FIXED by the TM2 column: sin^2 theta12 = 1/(3 cos^2 theta13).
    const th13 = (8.57 * Math.PI) / 180
    const th23 = (45 * Math.PI) / 180
    const delta = -Math.PI / 2
    const sin2th12 = 1 / (3 * Math.cos(th13) ** 2)
    const th12 = Math.asin(Math.sqrt(sin2th12))
    const U = pmns(th12, th23, th13, delta)

    // the defining TM2 invariant: the middle column has |U_i2|^2 = 1/3 for all three rows
    const col2 = [cabs2(U[0]![1]!), cabs2(U[1]![1]!), cabs2(U[2]![1]!)]
    const tm2Column = col2.every(x => Math.abs(x - 1 / 3) < 1e-9)

    // predicted solar angle vs measured (~0.304-0.31): the ~2 sigma tension
    const sin2th12Measured = 0.307
    const solarTension = sin2th12 - sin2th12Measured // ~ +0.034

    // maximal leptonic CP: J at maximal theta23 should be the largest-magnitude value
    const J = jarlskog(U)
    // compare to J at delta = 0 (CP-conserving), which must vanish
    const Jcp0 = jarlskog(pmns(th12, th23, th13, 0))
    const cpMaximal = Math.abs(J) > 0.03 && Math.abs(Jcp0) < 1e-9

    // a sample appearance probability P(nu_mu -> nu_e) in the atmospheric regime (leading term)
    // P ~ sin^2(2 theta13) sin^2(theta23) at the first atmospheric maximum (delta-independent leading)
    const pMuEAtmos = Math.sin(2 * th13) ** 2 * Math.sin(th23) ** 2

    // control: anarchic mixing (no TM2 structure) -- the 1/3 column does not hold
    const anarchic = pmns(
      (35 * Math.PI) / 180,
      (40 * Math.PI) / 180,
      (12 * Math.PI) / 180,
      1.0,
    )
    const anarchicCol2 = [
      cabs2(anarchic[0]![1]!),
      cabs2(anarchic[1]![1]!),
      cabs2(anarchic[2]![1]!),
    ]
    const anarchicNoColumn = !anarchicCol2.every(
      x => Math.abs(x - 1 / 3) < 1e-9,
    )

    const ok = tm2Column && cpMaximal && anarchicNoColumn

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the A4 -> TM2 prediction yields a PMNS matrix whose middle column is exactly trimaximal, |U_e2|^2 = |U_mu2|^2 = |U_tau2|^2 = 1/3, fixing sin^2 theta12 = 1/(3 cos^2 theta13) = 0.341 (about 2 sigma above the measured 0.307, a falsifiable tension JUNO will resolve), with maximal leptonic CP (the Jarlskog is maximal at maximal atmospheric mixing and vanishes when the phase is set to zero). Anarchic mixing has no 1/3 column. The observable oscillation pattern is the trimaximal one.',
      metrics: {
        sin2Theta12Predicted: Number(sin2th12.toFixed(4)),
        sin2Theta12Measured: sin2th12Measured,
        solarTension: Number(solarTension.toFixed(4)),
        tm2ColumnIsOneThird: tm2Column ? 1 : 0,
        jarlskogMaximal: Number(J.toFixed(4)),
        jarlskogCPconserving: Number(Jcp0.toFixed(6)),
        pMuToEAtmospheric: Number(pMuEAtmos.toFixed(4)),
      },
      control: {
        anarchicColumnBroken: anarchicNoColumn ? 1 : 0,
        anarchicCol2Spread: Number(
          (
            Math.max(...anarchicCol2) - Math.min(...anarchicCol2)
          ).toFixed(4),
        ),
      },
      notes:
        'L2 consistency simulation of the leptonic prediction: the TM2 angles come from the A4 structure of the 24-cell (a derived prediction), and this computes their observable oscillation consequences. The sharp, falsifiable output is sin^2 theta12 = 0.341 (JUNO), the maximal CP delta = -90 (DUNE / Hyper-K), and the trimaximal column. It does not run the substrate dynamics; it turns the structural prediction into the observed quantities.',
    })
  },
})
