// E-MTR-0006. The classical limit of the STAND-IN charge: Ehrenfest (a wide token in a smooth field follows the
// classical path of its own band) and correspondence (the stand-in atom's high level spacings tend to the Kepler
// orbit frequency). The charge is a STAND-IN (the fear-walk token and its band-projected husk form); nothing here
// is graded L3.
//
// A trajectory with no mover. The token is a pattern of values the stream copies one dock along each beat; its
// CENTER moves, and no vibe does. Ehrenfest's theorem is a statement about that center.
//
// PREDICTIONS, written before the first run:
//   the line (the true fear-walk token, two slots, cos W = cos k / 2) under a uniform force F (the potential's
//     phase e^(i F x) each beat): each beat adds F to the carrier, so a packet in the particle band follows the
//     discrete classical path x(t) = x0 + sum_(tau < t) e1'(tau F), which is a BLOCH OSCILLATION of amplitude
//     e1(pi) / F = (pi / 3) / F that returns to x0 after 2 pi / F beats. Early on x = F t (t - 1) / (2 sqrt 3):
//     Newton with the mass sqrt 3
//   the husk (the band stand-in, e^(-i T(p)) e^(-i V) each beat): x(t) = sum_(tau = 1..t) grad T(tau F n) along a
//     generic direction n = (1, 2, 0) / sqrt 5. T's mass tensor is isotropic, and by the W(F4) law (E-MTR-0002)
//     so is its quartic term, so the path's drift across n is of relative order k^4 on the husk and k^2 on the
//     plain cubic control
//   correspondence: for the stand-in atom's p series at a = 0.5, the spacing E_(n+1) - E_n against the Kepler
//     frequency 2 |E_mid|^(3/2) / sqrt(Ry) at the midpoint energy (Ry = 1 / (2 sqrt 3 a^2), predicted, not
//     fitted) equals the Rydberg series' own ratio at the measured effective quantum number nu = sqrt(Ry / |E|),
//     and tends to 1 as n grows
//
// Method: float walks. The line: code/measure/stand-in-hydrogen's walk on a 4096-dock torus, a width-32 packet
// on the particle band at k = 0 (s times a Gaussian), F = 0.01, 640 beats (one Bloch period is 628.3). The husk:
// code/measure/stand-in-atom's band beat on a 32^3 torus, width 3, F = 0.004, 50 beats, the husk and the cubic
// control. Correspondence: LOBPCG in the T1u row on a side-64 husk torus at a = 0.5, five levels. No random
// numbers anywhere.
//
// Gates, fixed before the first run:
// 1. BLOCH: the line's center stays within 2 percent of the amplitude (pi / 3) / F of the classical path for the
//    whole period, and is back within 2 percent of the amplitude at t = 628
// 2. NEWTON: the mass fitted to x(t) = F t (t - 1) / (2 m) over t <= 20 is sqrt 3 within 1 percent
// 3. THE HUSK PATH: on both lattices the 3D center after 50 beats is within 1 percent of the classical path
//    (length of the difference over length of the path); the drift across n is under 1e-3 of the path on the
//    husk and over 1e-3 on the control
// 4. CORRESPONDENCE: for the pairs (3, 4) and (4, 5) of the p series the ratio is within 0.02 of the Rydberg
//    series' ratio at the measured nu, and |1 - ratio| falls from (3, 4) to (4, 5)
// Pass: all four. Partial: 1 and 2 with one of 3 or 4. Fail: otherwise.
//
// Depth L2: known semiclassics (Ehrenfest, Bloch, Bohr correspondence) on the stand-in token.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { CUBIC_ATOM, HUSK_ATOM, ROWS, bandBeat, bandGradientAt, centerOf, fearBand, lowestLevels, makeAtom, makeBandWalk, type AtomKind } from '@/code/measure/stand-in-atom'
import { beat, emptyWalkOn, line2, makeTorus, meanPosition, phaseOf, scalarState } from '@/code/measure/stand-in-hydrogen'

const LINE_FORCE = 0.01
const LINE_BEATS = 640
const HUSK_FORCE = 0.004
const HUSK_BEATS = 50
const DIRECTION = [1 / Math.sqrt(5), 2 / Math.sqrt(5), 0]

// the fear band's slope
const slopeOf = (q: number): number => Math.sin(q) / Math.sqrt(4 - Math.cos(q) ** 2)

// the husk (or control) center path and its classical prediction
function huskPath(kind: AtomKind): { measured: number[]; classical: number[] } {
  const side = 32
  const h = side / 2
  const potential = new Float64Array(side ** 3)
  const re = new Float64Array(side ** 3)
  const im = new Float64Array(side ** 3)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)

        potential[i] = -HUSK_FORCE * (DIRECTION[0]! * (x - h) + DIRECTION[1]! * (y - h) + DIRECTION[2]! * (z - h))
        re[i] = Math.exp(-((x - h) ** 2 + (y - h) ** 2 + (z - h) ** 2) / (2 * 9))
      }
    }
  }

  const walk = makeBandWalk({ kind, side, potential })
  const start = centerOf(side, re, im)

  for (let t = 0; t < HUSK_BEATS; t++) {
    bandBeat(walk, re, im)
  }

  const end = centerOf(side, re, im)
  const classical = [0, 0, 0]

  for (let t = 1; t <= HUSK_BEATS; t++) {
    const g = bandGradientAt(
      kind.band,
      DIRECTION.map(d => d * HUSK_FORCE * t),
    )

    for (let a = 0; a < 3; a++) {
      classical[a] = classical[a]! + g[a]!
    }
  }

  return { measured: end.map((v, a) => v - start[a]!), classical }
}

export default experiment({
  id: 'matter/stand-in-classical-limit',
  code: 'E-MTR-0006',
  title:
    'the classical limit of the stand-in: the fear-walk token under a uniform force follows its band classically through a full Bloch oscillation with Newton mass sqrt 3 at the start, the husk band stand-in follows its classical path isotropically where the cubic control drifts sideways, and the stand-in atom level spacings approach the Kepler frequency',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // the line
    const line = makeTorus(line2(), 4096)
    const potential = new Float64Array(4096)

    for (let x = 0; x < 4096; x++) {
      potential[x] = -LINE_FORCE * (x - 2048)
    }

    const phase = phaseOf(potential)
    let w = scalarState(line, x => [Math.exp(-((x[0]! / 32) ** 2) / 2), 0])
    let spare = emptyWalkOn(line)
    const x0 = meanPosition(line, w)[0]!
    const amplitude = fearBand(Math.PI) / LINE_FORCE
    let classical = 0
    let worst = 0
    const early: [number, number][] = []
    let returned = 0

    for (let t = 1; t <= LINE_BEATS; t++) {
      beat(line, w, spare, phase)
      ;[w, spare] = [spare, w]
      classical += slopeOf((t - 1) * LINE_FORCE)

      const x = meanPosition(line, w)[0]! - x0

      worst = Math.max(worst, Math.abs(x - classical))

      if (t <= 20) {
        early.push([t, x])
      }

      if (t === 628) {
        returned = x
      }
    }

    // x = F t (t - 1) / (2 m): least squares for 1 / m through the origin
    const num = early.reduce((s, [t, x]) => s + x * ((LINE_FORCE * t * (t - 1)) / 2), 0)
    const den = early.reduce((s, [t]) => s + ((LINE_FORCE * t * (t - 1)) / 2) ** 2, 0)
    const newtonMass = den / num

    metrics.blochAmplitude = amplitude
    metrics.blochWorstMissOverAmplitude = worst / amplitude
    metrics.blochReturnOverAmplitude = Math.abs(returned) / amplitude
    metrics.newtonMass = newtonMass
    metrics.newtonMassMiss = Math.abs(newtonMass / Math.sqrt(3) - 1)

    // the husk and the control
    const paths = { husk: huskPath(HUSK_ATOM), cubic: huskPath(CUBIC_ATOM) }
    let gate3 = true

    for (const [name, p] of Object.entries(paths)) {
      const length = Math.hypot(...p.classical)
      const miss = Math.hypot(...p.measured.map((v, a) => v - p.classical[a]!)) / length
      const along = p.measured.reduce((s, v, a) => s + v * DIRECTION[a]!, 0)
      const across = Math.hypot(...p.measured.map((v, a) => v - along * DIRECTION[a]!)) / Math.abs(along)

      metrics[`${name}_pathLength`] = length
      metrics[`${name}_pathMiss`] = miss
      metrics[`${name}_acrossOverAlong`] = across
      metrics[`${name}_classicalAcrossOverAlong`] =
        Math.hypot(...p.classical.map((v, a) => v - p.classical.reduce((s, c, b) => s + c * DIRECTION[b]!, 0) * DIRECTION[a]!)) /
        Math.abs(p.classical.reduce((s, c, b) => s + c * DIRECTION[b]!, 0))
      gate3 = gate3 && miss <= 0.01
    }

    gate3 = gate3 && metrics.husk_acrossOverAlong! < 1e-3 && metrics.cubic_acrossOverAlong! > 1e-3

    // correspondence
    const atom = makeAtom({ kind: HUSK_ATOM, side: 64, a: 0.5 })
    const levels = lowestLevels({ atom, row: ROWS.T1u!, count: 5 }).values.map(v => v / atom.rydberg)
    const rydbergRatio = (nu: number): number => (1 / nu ** 2 - 1 / (nu + 1) ** 2) / (2 * ((1 / nu ** 2 + 1 / (nu + 1) ** 2) / 2) ** 1.5)
    const ratios: number[] = []
    const expected: number[] = []

    for (let i = 0; i + 1 < levels.length; i++) {
      const mid = (levels[i]! + levels[i + 1]!) / 2
      const ratio = (levels[i + 1]! - levels[i]!) / (2 * Math.abs(mid) ** 1.5)
      const nu = 1 / Math.sqrt(-levels[i]!)

      ratios.push(ratio)
      expected.push(rydbergRatio(nu))
      metrics[`p${i + 2}_EOverRy`] = levels[i]!
      metrics[`pair${i + 2}${i + 3}_ratio`] = ratio
      metrics[`pair${i + 2}${i + 3}_rydbergSeriesRatio`] = rydbergRatio(nu)
      metrics[`pair${i + 2}${i + 3}_nu`] = nu
    }

    metrics[`p${levels.length + 1}_EOverRy`] = levels[levels.length - 1]!

    const gate1 = worst / amplitude <= 0.02 && Math.abs(returned) / amplitude <= 0.02
    const gate2 = metrics.newtonMassMiss <= 0.01
    const gate4 = Math.abs(ratios[1]! - expected[1]!) <= 0.02 && Math.abs(ratios[2]! - expected[2]!) <= 0.02 && Math.abs(1 - ratios[2]!) < Math.abs(1 - ratios[1]!)
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 && (gate3 || gate4) ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the fear-walk token's center under a uniform force stays within ${((worst / amplitude) * 100).toFixed(2)} percent of the amplitude of its classical Bloch path over a full period (Newton mass ${newtonMass.toFixed(4)} at the start, sqrt 3 = 1.7321), the husk band stand-in's center follows its classical path to ${(metrics.husk_pathMiss! * 100).toFixed(3)} percent drifting across the force ${metrics.husk_acrossOverAlong!.toExponential(1)} of the way against ${metrics.cubic_acrossOverAlong!.toExponential(1)} on the cubic control, and the p-series spacings over the Kepler frequency read ${ratios.map(r => r.toFixed(4)).join(', ')}`,
      metrics: {
        ...metrics,
        gateBloch: gate1 ? 1 : 0,
        gateNewton: gate2 ? 1 : 0,
        gateHuskPath: gate3 ? 1 : 0,
        gateCorrespondence: gate4 ? 1 : 0,
      },
      notes:
        'L2. The line is the true fear-walk token; the husk runs the band stand-in (E-MTR-0001) and the plain cubic control. The token\'s center moves and returns; no vibe moves, the stream copies each slot one dock along each beat. Husk first; the bulk band has the same mass sqrt 3 and the same W(F4) isotropy. FIRST RUN (2026-09-26), status fail. Gates 1 and 2 passed: the true token follows its classical Bloch path to 0.06 percent of the amplitude over a full period and returns to 2e-5, Newton mass 1.747. Gate 3 failed on a harness defect: the width-3 packet spreads across the 32^3 torus in 50 beats, and centerOf has no wrap correction, so even with no force the center moves (-0.199, -0.199, -0.199) (tmp/atom-path-probe.ts); on a 64^3 torus at width 6 the center moves (1.2797, 2.5593, 0.0000) against the classical (1.3080, 2.6160, 0), a 2.2 percent Ehrenfest miss of the width order and no drift across the force. Gate 4 failed on a design error: the T1u row holds the l = 3 series as well as l = 1 (4f has a T1u part), so the "p series" read 2p, 3p, 4p, then a 4f-like level at -0.0672 Ry (4f is -0.0625), and the pair (4, 5) is not a Rydberg neighbor; the true p pairs (2, 3) and (3, 4) read 0.788 and 0.866 against the series values 0.889 and 0.940.',
    })
  },
})
