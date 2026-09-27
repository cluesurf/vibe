// E-MTR-0005. Zitterbewegung of the fear-walk token: it trembles at twice its rest energy, and the chord of that
// angle is its rest mass sqrt 3 = |1 - omega|. The token is the STAND-IN charge's own walk (the fear walk on a line,
// and the 18-slot token on the husk, the D4 token at k4 = 0); nothing here is graded L3.
//
// A Dirac particle's velocity trembles at 2E, the beat between its positive- and negative-energy parts. The fear
// walk on a line has two bands, eigenphases pi / 3 -+ W with cos W = cos k / 2, so a token that holds both bands
// at carrier k trembles at the angle between them.
//
// PREDICTIONS, written before the first run:
//   the line: Omega(k) = 2 W(k) = 2 arccos(cos k / 2); at k = 0, 2 pi / 3, twice the rest energy m0 = pi / 3
//     (cos W = cos m0 cos k is a Dirac walk of mass angle m0 = pi / 3)
//   the chord: 2 sin(Omega(0) / 2) = |1 - omega| = sqrt 3, which is also the kinetic mass tan(pi / 3). So "the rest
//     mass sqrt 3" is the CHORD of the trembling angle, and the continuum Dirac relation (trembling at twice the
//     kinetic mass) fails on the lattice: tan(m0) / m0 = 1.654, not 1
//   the husk token: its coin's rest eigenvalues are 1 and omega whatever the number of slots, so at k = 0 it
//     trembles at 2 pi / 3 too
//   CONTROL: a token started wholly in the particle band (its eigenvector at the carrier) holds one band and does
//     not tremble
//
// Method: float walks from code/measure/stand-in-hydrogen (makeTorus, beat, no potential). The line: an 8192-dock
// torus, a Gaussian packet of width 256 on the right-moving slot with carrier k, 512 beats. The husk: a 32^3 torus,
// width 4 on the +x axis slot, 192 beats. The velocity series v(t) = <x>(t + 1) - <x>(t) (the center moves; no
// vibe does: the stream copies each slot one dock along) is searched for its dominant tone
// (code/measure/dominant-frequency) and the tone refined by least squares (refineTone). No random numbers.
//
// Gates, fixed before the first run:
// 1. THE LINE LAW: Omega(k) within 1e-4 (relative) of 2 arccos(cos k / 2) at k = 0, 0.5, 1, 1.5
// 2. THE CHORD: 2 sin(Omega(0) / 2) within 1e-4 of sqrt 3
// 3. THE HUSK TOKEN: Omega within 1e-3 of 2 pi / 3
// 4. CONTROL: the particle-band start's tone amplitude is under 1e-3 of the slot start's on the line (k = 0.5,
//    width 256, so the band eigenvector is one vector across the packet to 1e-5). On the husk the width-4
//    packet's k spread (0.3) bends the eigenvector enough that s times a Gaussian is not one band, so the husk
//    ratio is reported, not gated
// Pass: all four. Partial: 1 and 2. Fail: otherwise.
//
// Depth L2: a known quantum-walk effect read on the model's own coin.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dominantAngularFrequency } from '@/code/measure/dominant-frequency'
import { refineTone } from '@/code/measure/stand-in-atom'
import { beat, emptyWalkOn, freeSymbol, husk18, line2, makeTorus, meanPosition, scalarState, slotState, unitaryPhases, zeroPhase, type Torus, type Walk } from '@/code/measure/stand-in-hydrogen'

// the velocity series along axis 0
function velocities(torus: Torus, start: Walk, beats: number): number[] {
  const phase = zeroPhase(torus.docks)
  let w = Float64Array.from(start)
  let spare = emptyWalkOn(torus)
  const xs: number[] = []

  for (let t = 0; t <= beats; t++) {
    xs.push(meanPosition(torus, w)[0]!)
    beat(torus, w, spare, phase)
    ;[w, spare] = [spare, w]
  }

  return xs.slice(1).map((x, t) => x - xs[t]!)
}

// the dominant tone, refined within one bin
function tone(series: number[]): { omega: number; amplitude: number } {
  const coarse = dominantAngularFrequency({ trace: series })
  const bin = (2 * Math.PI) / series.length

  return refineTone(series, coarse - 2 * bin, coarse + 2 * bin)
}

// a packet on the line's particle band at carrier k: its eigenvector of U(k) times the Gaussian
function bandPacket(torus: Torus, k: number, sigma: number): Walk {
  const u = unitaryPhases(freeSymbol(line2(), [k]), 2)
  // the particle band's eigenphase is -e1(k), the one nearest 0
  const column = Math.abs(u.phases[0]!) < Math.abs(u.phases[1]!) ? 0 : 1
  const w = emptyWalkOn(torus)
  const h = torus.side / 2
  let norm = 0

  for (let x = 0; x < torus.side; x++) {
    const g = Math.exp(-(((x - h) / sigma) ** 2) / 2)
    const cr = g * Math.cos(k * (x - h))
    const ci = g * Math.sin(k * (x - h))

    for (let d = 0; d < 2; d++) {
      const vr = u.vectorsRe[d * 2 + column]!
      const vi = u.vectorsIm[d * 2 + column]!

      w[2 * (x * 2 + d)] = cr * vr - ci * vi
      w[2 * (x * 2 + d) + 1] = cr * vi + ci * vr
      norm += (cr * cr + ci * ci) * (vr * vr + vi * vi)
    }
  }

  for (let i = 0; i < w.length; i++) {
    w[i] = w[i]! / Math.sqrt(norm)
  }

  return w
}

export default experiment({
  id: 'matter/stand-in-zitterbewegung',
  code: 'E-MTR-0005',
  title:
    'the fear-walk token trembles at 2 arccos(cos k / 2), 2 pi / 3 at rest on the line and on the 18-slot husk token alike, twice its rest energy pi / 3, whose chord 2 sin(pi / 3) = |1 - omega| = sqrt 3 is its rest mass, and a start in one band does not tremble',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const line = makeTorus(line2(), 8192)
    const carriers = [0, 0.5, 1, 1.5]
    let gate1 = true
    let omega0 = 0

    for (const k of carriers) {
      const start = slotState(line, 0, x => {
        const g = Math.exp(-((x[0]! / 256) ** 2) / 2)

        return [g * Math.cos(k * x[0]!), g * Math.sin(k * x[0]!)]
      })
      const t = tone(velocities(line, start, 512))
      const predicted = 2 * Math.acos(Math.cos(k) / 2)
      const miss = Math.abs(t.omega / predicted - 1)

      metrics[`line_k${k}_omega`] = t.omega
      metrics[`line_k${k}_predicted`] = predicted
      metrics[`line_k${k}_relativeMiss`] = miss
      metrics[`line_k${k}_amplitude`] = t.amplitude
      gate1 = gate1 && miss <= 1e-4

      if (k === 0) {
        omega0 = t.omega
      }
    }

    const chord = 2 * Math.sin(omega0 / 2)
    const gate2 = Math.abs(chord - Math.sqrt(3)) <= 1e-4

    metrics.chordAtRest = chord
    metrics.restEnergy = omega0 / 2
    metrics.kineticOverRestRatio = Math.tan(omega0 / 2) / (omega0 / 2)

    const slotLine = tone(
      velocities(
        line,
        slotState(line, 0, x => {
          const g = Math.exp(-((x[0]! / 256) ** 2) / 2)

          return [g * Math.cos(0.5 * x[0]!), g * Math.sin(0.5 * x[0]!)]
        }),
        512,
      ),
    )
    const bandLineSeries = velocities(line, bandPacket(line, 0.5, 256), 512)
    const bandLine = refineTone(bandLineSeries, slotLine.omega - 1e-3, slotLine.omega + 1e-3)

    metrics.line_controlAmplitudeRatio = bandLine.amplitude / slotLine.amplitude

    // second run: a 64^3 torus and 40 beats, so the packet (speed near 0.8) never reaches the seam, and the
    // tone searched in the predicted band [1.9, 2.3] rather than at the strongest bin (see the notes)
    const husk = makeTorus(husk18(), 64)
    const huskSeries = velocities(husk, slotState(husk, 0, x => [Math.exp(-(x[0]! ** 2 + x[1]! ** 2 + x[2]! ** 2) / (2 * 16)), 0]), 40)
    const huskSlot = refineTone(huskSeries, 1.9, 2.3)
    const huskBandSeries = velocities(husk, scalarState(husk, x => [Math.exp(-(x[0]! ** 2 + x[1]! ** 2 + x[2]! ** 2) / (2 * 16)), 0]), 40)
    const huskBand = refineTone(huskBandSeries, huskSlot.omega - 1e-3, huskSlot.omega + 1e-3)

    metrics.husk_omega = huskSlot.omega
    metrics.husk_relativeMiss = Math.abs(huskSlot.omega / ((2 * Math.PI) / 3) - 1)
    metrics.husk_amplitude = huskSlot.amplitude
    metrics.husk_controlAmplitudeRatio = huskBand.amplitude / huskSlot.amplitude

    const gate3 = metrics.husk_relativeMiss <= 1e-3
    const gate4 = metrics.line_controlAmplitudeRatio < 1e-3
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the fear-walk token trembles at ${carriers.map(k => metrics[`line_k${k}_omega`]!.toFixed(6)).join(', ')} for k = ${carriers.join(', ')} (2 arccos(cos k / 2)), at ${huskSlot.omega.toFixed(6)} on the 18-slot husk token (2 pi / 3 = 2.094395), the chord 2 sin(Omega / 2) = ${chord.toFixed(6)} of sqrt 3, while a start in one band trembles ${metrics.line_controlAmplitudeRatio.toExponential(1)} and ${metrics.husk_controlAmplitudeRatio.toExponential(1)} as much`,
      metrics: {
        ...metrics,
        gateLineLaw: gate1 ? 1 : 0,
        gateChord: gate2 ? 1 : 0,
        gateHuskToken: gate3 ? 1 : 0,
        gateOneBandControl: gate4 ? 1 : 0,
      },
      notes:
        'L2. The token is the stand-in charge\'s walk; the band-projected stand-in of E-MTR-0001 holds one band by construction and so cannot tremble. The center of the token moves and trembles; no vibe moves, the stream copies each slot value one dock along. The husk token is the D4 token at k4 = 0 (depth24 = husk18), so the bulk token trembles at the same 2 pi / 3. FIRST RUN (2026-09-26), status partial: the line law and the chord passed (2.094400 against 2.094395, chord 1.732053); the husk tone read 0.197756 and the line control 1.1e-3 against its 1e-3 gate. A diagnostic probe (tmp/atom-zb-probe.ts) traced the husk reading to the harness, not the token: on the 32^3 torus the width-4 packet moves at about 0.75 per beat and wraps the torus every 32 beats, and meanPosition has no wrap correction, so the strongest tone was the wrap (2 pi / 32 = 0.196); the 2 pi / 3 tone was present at 2.106 with amplitude 0.078. SECOND RUN: 64^3 torus, 40 beats, the husk tone searched in the predicted band [1.9, 2.3] (a change of method, disclosed); the gates are unchanged. SECOND RUN result, status partial: the husk token trembles at 2.046 (2.3 percent below 2 pi / 3, against a 1e-3 gate; 40 beats resolve a tone only to about 2 pi / 40 and the token\'s 17 other bands spread off k = 0, so this is a resolution limit and a multi-band tone, not a measured shift), and the line control stays at 1.1e-3 against 1e-3: a knife-edge gate that failed. The one-band start on the husk trembles 1.3e-4 as much.',
    })
  },
})
