// E-MTR-0001. STAND-IN hydrogen on the husk: the bound spectrum against -Ry / n^2, with the Rydberg and the Bohr
// radius predicted from the fear walk's own mass before any level is solved. The charge is a STAND-IN (a fear-
// walk token, E-FRC-0176's charged token, band-projected), because the model has no electron yet (roadmap rung
// 3); nothing here is graded L3.
//
// The stand-in (code/measure/stand-in-atom): kinetic quasi-energy T(k) = (1/12) sum over the D4 roots of
// e1(k . r), e1 the fear walk's band cos W = cos k / 2, read on the husk (k4 = 0), where it is
// (1/6) sum_h w_h e1(k . u_h) with the husk weights of E-FRC-0179. The source is one unit charge fixed at a husk
// dock, its potential the husk lattice Green's function (huskCoulomb's, E-FRC-0179: -alpha 24 pi G, far field
// -alpha / r). The coupling is chosen through the Bohr radius a.
//
// PREDICTIONS, written before the first run:
//   m = tan(pi / 3) = sqrt 3 (the line's kinetic mass; sum over roots of (k . r)^2 = 12 |k|^2 keeps it)
//   Ry = m alpha^2 / 2 = 1 / (2 sqrt 3 a^2),   <r>_nl = (a / 2)(3 n^2 - l (l + 1))
//   the first lattice correction for l >= 1 (kineticShift): T = k^2 / (2 m) - k^4 / (12 sqrt 3), the
//   relativistic p^4 term with c^2 = 1/2, so E_nl / Ry = -1 / n^2 - (4 n / (l + 1/2) - 3) / (6 a^2 n^4):
//     2p at a = 2.5:        -0.25 - 0.003889 = -0.253889  (a shift of 1.56 percent)
//     3d at a = 1.5:        -0.111111 - 0.001646 = -0.112757  (1.48 percent), the same for Eg and T2g
//   s levels carry a large extra shift from the lattice core (a contact term and the band's flattening at large
//   k), so they are read as a Rydberg series with a quantum defect, E = -Ry / (n - delta)^2, delta the same
//   along the series (Rydberg and Ritz), and the p defect far smaller
//
// Method: side-64 husk torus, levels by LOBPCG in one row of an O_h irrep (A1g for s, T1u for p, Eg and T2g for
// d), exact to a residual of 1e-7. No random numbers anywhere.
//
// Gates, fixed before the first run of this file. Before it, a feasibility probe (tmp/atom-probe3.ts) had
// solved the same Hamiltonian at a = 2, 3, 4 (2p at a = 2 read -0.256009 against the prediction -0.256076):
// the gates below are at a = 2.5 and a = 1.5, which no probe ran, and the predictions above are from the
// formula, not from those numbers.
// 1. THE 2p LEVEL: at a = 2.5, E_2p / Ry within 0.5 percent of -0.253889, and the lattice shift
//    E_2p / (-Ry / 4) - 1 within 30 percent of its predicted 0.015556 (so the p^4 term, not only Ry, is seen)
// 2. THE 3d LEVELS: at a = 1.5, both the Eg and the T2g level within 1 percent of -0.112757
// 3. THE BOHR RADIUS: <r>_2p within 5 percent of 5 a at a = 2.5, and <r>_3d within 5 percent of 10.5 a at
//    a = 1.5 (both rows)
// 4. THE RYDBERG SERIES: at a = 1.5, the s defects of 2s and 3s agree within 0.1, and the p defects of 2p and
//    3p are each under a tenth of the 2s defect
// Pass: all four. Partial: gates 1 and 3 hold. Fail: otherwise.
//
// Reported: every level and radius, the chance beyond the box's inner edge, the 1s level at a = 2.5 (the
// lattice core, E-MTR-0004), and the bulk mass beside the husk one (the bulk band of the same form has the
// same mass sqrt 3; the bulk's Coulomb field falls as 1 / r^2, E-FRC-0165, which has no Rydberg series, so
// there is no bulk hydrogen to put beside this one).
//
// Depth L2: lattice quantum mechanics of a chosen stand-in charge in the husk's own Coulomb field.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HUSK_ATOM, ROWS, bandMass, bulkBand, huskBand, hydrogenRadius, kineticShift, lowestLevels, makeAtom, quantumDefect, radial } from '@/code/measure/stand-in-atom'

const SIDE = 64

export default experiment({
  id: 'matter/stand-in-hydrogen-spectrum',
  code: 'E-MTR-0001',
  title:
    'stand-in hydrogen on the husk: a fear-walk stand-in charge in the husk lattice Coulomb field, its levels against -Ry / n^2 with Ry, the Bohr radius and the first lattice shift predicted from the fear walk mass sqrt 3 before solving',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // a = 2.5: the 2p level and radius, and the 1s beside it
    const wide = makeAtom({ kind: HUSK_ATOM, side: SIDE, a: 2.5 })
    const p25 = lowestLevels({ atom: wide, row: ROWS.T1u!, count: 1 })
    const s25 = lowestLevels({ atom: wide, row: ROWS.A1g!, count: 1 })
    const e2p = p25.values[0]! / wide.rydberg
    const r2p = radial(SIDE, p25.vectors[0]!)
    const predicted2p = -0.25 + kineticShift(2, 1, 2.5)
    const shift2p = e2p / -0.25 - 1
    const predictedShift2p = predicted2p / -0.25 - 1

    metrics.a25_E2pOverRy = e2p
    metrics.a25_E2pPredicted = predicted2p
    metrics.a25_E2pRelativeMiss = Math.abs(e2p / predicted2p - 1)
    metrics.a25_shift2p = shift2p
    metrics.a25_shift2pPredicted = predictedShift2p
    metrics.a25_r2pOverA = r2p.meanR / 2.5
    metrics.a25_r2pBeyondEdge = r2p.beyond
    metrics.a25_E1sOverRy = s25.values[0]! / wide.rydberg
    metrics.a25_r1sOverA = radial(SIDE, s25.vectors[0]!).meanR / 2.5

    // a = 1.5: the 3d rows, the s and p series
    const tight = makeAtom({ kind: HUSK_ATOM, side: SIDE, a: 1.5 })
    const eg = lowestLevels({ atom: tight, row: ROWS.Eg!, count: 1 })
    const t2g = lowestLevels({ atom: tight, row: ROWS.T2g!, count: 1 })
    const sSeries = lowestLevels({ atom: tight, row: ROWS.A1g!, count: 3 })
    const pSeries = lowestLevels({ atom: tight, row: ROWS.T1u!, count: 2 })
    const predicted3d = -1 / 9 + kineticShift(3, 2, 1.5)
    const eEg = eg.values[0]! / tight.rydberg
    const eT2g = t2g.values[0]! / tight.rydberg
    const rEg = radial(SIDE, eg.vectors[0]!)
    const rT2g = radial(SIDE, t2g.vectors[0]!)

    metrics.a15_E3dEgOverRy = eEg
    metrics.a15_E3dT2gOverRy = eT2g
    metrics.a15_E3dPredicted = predicted3d
    metrics.a15_E3dEgRelativeMiss = Math.abs(eEg / predicted3d - 1)
    metrics.a15_E3dT2gRelativeMiss = Math.abs(eT2g / predicted3d - 1)
    metrics.a15_r3dEgOverA = rEg.meanR / 1.5
    metrics.a15_r3dT2gOverA = rT2g.meanR / 1.5
    metrics.a15_r3dBeyondEdge = Math.max(rEg.beyond, rT2g.beyond)

    const s = sSeries.values.map(v => v / tight.rydberg)
    const p = pSeries.values.map(v => v / tight.rydberg)
    const delta2s = quantumDefect(2, s[1]!)
    const delta3s = quantumDefect(3, s[2]!)
    const delta2p = quantumDefect(2, p[0]!)
    const delta3p = quantumDefect(3, p[1]!)

    s.forEach((v, i) => {
      metrics[`a15_E${i + 1}sOverRy`] = v
      metrics[`a15_r${i + 1}sOverA`] = radial(SIDE, sSeries.vectors[i]!).meanR / 1.5
      metrics[`a15_r${i + 1}sBeyondEdge`] = radial(SIDE, sSeries.vectors[i]!).beyond
    })
    p.forEach((v, i) => {
      metrics[`a15_E${i + 2}pOverRy`] = v
      metrics[`a15_r${i + 2}pBeyondEdge`] = radial(SIDE, pSeries.vectors[i]!).beyond
    })
    metrics.a15_delta1s = quantumDefect(1, s[0]!)
    metrics.a15_delta2s = delta2s
    metrics.a15_delta3s = delta3s
    metrics.a15_delta2p = delta2p
    metrics.a15_delta3p = delta3p
    metrics.huskMassAxis = bandMass(huskBand, [1, 0, 0])
    metrics.huskMassBodyDiagonal = bandMass(huskBand, [1, 1, 1])
    metrics.bulkMassBesideIt = bandMass(bulkBand, [1, 0, 0, 0])
    metrics.largestResidual = Math.max(...[p25, s25, eg, t2g, sSeries, pSeries].flatMap(l => l.residuals))

    const gate1 = metrics.a25_E2pRelativeMiss <= 0.005 && Math.abs(shift2p / predictedShift2p - 1) <= 0.3
    const gate2 = metrics.a15_E3dEgRelativeMiss <= 0.01 && metrics.a15_E3dT2gRelativeMiss <= 0.01
    const gate3 =
      Math.abs(r2p.meanR / (hydrogenRadius(2, 1, 2.5)) - 1) <= 0.05 &&
      Math.abs(rEg.meanR / hydrogenRadius(3, 2, 1.5) - 1) <= 0.05 &&
      Math.abs(rT2g.meanR / hydrogenRadius(3, 2, 1.5) - 1) <= 0.05
    const gate4 = Math.abs(delta3s - delta2s) <= 0.1 && Math.abs(delta2p) < 0.1 * Math.abs(delta2s) && Math.abs(delta3p) < 0.1 * Math.abs(delta2s)
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a stand-in fear-walk charge in the husk lattice Coulomb field has its 2p level at ${e2p.toFixed(6)} Ry (predicted ${predicted2p.toFixed(6)} from m = sqrt 3 and the band's p^4 term, a = 2.5), its 3d levels at ${eEg.toFixed(6)} and ${eT2g.toFixed(6)} Ry (predicted ${predicted3d.toFixed(6)}, a = 1.5), and an s series with quantum defects ${delta2s.toFixed(3)} and ${delta3s.toFixed(3)} against p defects ${delta2p.toFixed(4)} and ${delta3p.toFixed(4)}`,
      metrics: {
        ...metrics,
        gate2pLevel: gate1 ? 1 : 0,
        gate3dLevels: gate2 ? 1 : 0,
        gateBohrRadius: gate3 ? 1 : 0,
        gateRydbergSeries: gate4 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN charge (the band-projected fear-walk token, T(k) = (1/12) sum over D4 roots of the fear band) and a fixed stand-in source, alpha chosen through a. The husk number is the physics; the bulk band beside it has the same mass sqrt 3 and the bulk Coulomb field falls as 1 / r^2, so it has no hydrogen. Before this file ran, a feasibility probe (tmp/atom-probe3.ts, disclosed in the header) solved a = 2, 3, 4.',
    })
  },
})
