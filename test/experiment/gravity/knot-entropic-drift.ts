// Gravity from the second law, the profile and the drift: does a static knot on the adopted knit make a coarse-entropy
// gradient on the husk around it, and does a test population drift toward it (E-GRV-0056)? Verlinde's route, asked of
// the rule now that the coarse entropy rises on it (E-FND-0146) and the arrow is the start (E-FND-0147).
//
// THE KNIT. The coset-union vacuum under the lone bounce collision (E-RLT-0084, E-RLT-0093), side 24 (331,776 docks,
// a 24^3 husk of depth 24), run by the bounce kernel with the knot's own stream and its exact inverse
// (code/measure/held-knot).
//
// THE KNOT. A husk ball of radius 2 (33 columns) at full depth, 792 docks, HELD: its slots never stream and its docks
// never collide, so every trit inside is the same at every beat; a vibe outside whose stream would enter it takes the
// opposite slot of its own dock instead (bounce back). It holds a dense lump (every slot love or fear). This is the only
// reversible way to hold a lump: the knit cannot bind (E-SPN-0067), and a one-way surface is not a bijection. A STAND-IN
// for a knot, disclosed as one: the rule does not make it, the file imposes it.
//
// THE START (a Weyl family, no draw). The vacuum's stores; on every dock outside the knot a background gas with each slot
// held when its Weyl value is below 8/24, love or fear and a role point (of 9) by two more Weyl values; the lump inside.
// The no-knot control has the same gas on every dock, knot docks included, and the plain stream. Member k of the 17-start
// family (code/measure/start-ensemble) takes Weyl phase k.
//
// THE TEST POPULATION. A blob of extra vibes on the calm slots of the 7 husk columns within 1 of r0 e (full depth, 168
// docks, each calm slot held when its own Weyl value is below 4/24), for r0 = 4, 5, 6, 7, 8 and e = x, y, z. Its excess
// is the column energy of the run with the blob minus the run without it (the same gas, the same knot), so the gas's own
// motion cancels exactly and what remains is the blob and what it does to the gas. Its displacement toward the knot after
// 8 beats is the excess's first moment along -e, measured from its start column, divided by its (exactly conserved)
// excess energy. THE DRIFT is the knot run's displacement minus the no-knot run's (paired, same member and axis).
//
// THE PROFILE. The gas without the blob, settled for 48 beats; over beats 25 to 48 the slot trit entropy per slot and
// the energy per dock in each husk shell (rounded min-image distance to the knot's center column), pooled. The CONTRAST is
// knot minus no knot, per member. The entropy is the exclusive-slot trit entropy, the local form of the Gibbs law
// E-FND-0148 measured on this knit.
//
// Gates, fixed before the first run of this file:
//  G1 instrument: on all 17 members, energy and charge exact at every beat of every run; the gas run returns its start
//     bit for bit after 48 beats forward and 48 back; every knot trit is unchanged after 48 beats either way; and the
//     outside of the knot run is the same, slot by slot and line by line, whether the knot holds the dense lump or no
//     vibe at all, at every one of 48 beats (the knot's content is invisible, a theorem of the construction, checked)
//  G2 the gradient: the forward settled slot-entropy contrast differs from zero by at least 3 standard errors (over the
//     17 members) in at least 4 of the 8 shells r = 3 .. 10, all of those with one sign
//  G3 the drift toward the knot: the forward paired drift is positive and at least 3 standard errors (over 17 members
//     x 3 axes) at every r0 = 4 .. 8
//  G4 the no-knot control: the blob's own displacement in the no-knot run is within 3 standard errors of zero at every
//     r0, forward and backward
//  G5 the rule's exact inverse from the same start: forward minus backward paired drift within 3 standard errors of zero
//     at every r0. WHY THIS FORM: from a low-entropy slice the coarse entropy rises in both directions (E-FND-0146), so
//     anything the arrow makes is even in time about the slice; so is a pull on a body at rest. A drift that REVERSED
//     would be one the start carries in its momenta, odd in time, and not a force. The exact reversal itself (a run
//     retraced to its start) is G1.
// Verdict: pass if all hold; fail if G1 holds and any of G2 to G5 fails; partial if G1 fails.
//
// Reported, not gated: the energy contrast per shell, the backward profile, the first beat at which the knot changes the
// blob's excess at all (the knot and no-knot excess fields compared column by column, least over members and axes), and
// the gas temperature from the slot trits, p+ p- / p0^2 = e^(-2 beta).
//
// DISCLOSED: one probe before this file (tmp/knot-probe.ts) timed the build and a 10-beat run at sides 12 and 24 and
// checked the return, the knot's constancy and energy; it read no profile and no drift. A smoke run of the survey's code
// path (tmp/knot-smoke.ts: side 12, knot radius 1, 2 members, 6 beats) printed only the instrument booleans (all true)
// and that the reader returns finite numbers. Both after the gates above were written.
//
// FIRST RUN (3,052 s, the record): fail on G2, G3 and G5, recorded as is, no gate moved. G1 and G4 hold. The drift is
// a REPULSION at every r0, the excluded volume of a hard surface, not a pull. G5's one miss (r0 = 5, 3.1 errors) is in a
// repulsion that has the same sign both ways. Title written after the run.
//
// Depth L2: a measurement on the adopted knit's own gas, read on the husk, with a no-knot control and the exact inverse.
// DETERMINISM: Weyl fills and the 17 link starts; nothing is drawn. NOTHING MOVES: the stream copies, and a reflected vibe
// takes the opposite slot of its own dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  SURVEY,
  heldKnotSurvey,
  readSurvey,
} from '@/code/measure/held-knot'

export default experiment({
  id: 'gravity/knot-entropic-drift',
  code: 'E-GRV-0056',
  title:
    "no entropic pull toward a held knot on the adopted knit, fail on G2, G3 and G5: a husk ball of radius 2 held by a reflecting surface (side 24, gas 8 per dock, 17 starts) leaves the settled slot-entropy profile flat, knot minus none within 3 standard errors of zero on all 8 shells r = 3 to 10 (largest -2.1e-4 +- 1.3e-4 at r = 3), and pushes a test blob AWAY: after 8 beats its displacement toward the knot is -0.68, -0.27, -0.21, -0.11, -0.089 columns at r0 = 4 to 8 (each at least 3.8 standard errors), the same sign under the rule's exact inverse (-0.77 to -0.070; forward minus backward within 3 errors except r0 = 5, 3.1), while the blob with no knot stays put (every r0 within 1.4 errors); the knot first touches the blob at beat 1, 2, 3, 3, 4, a causal arrival; the lump inside is invisible from outside bit for bit at every beat, so no held knot on this rule has a mass the outside can feel; energy, charge, the held knot and the return exact",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const members = heldKnotSurvey(log)
    const read = readSurvey(members)
    const sig = (x: { mean: number; error: number }): boolean =>
      Math.abs(x.mean) >= 3 * x.error && x.mean !== 0
    const zero = (x: { mean: number; error: number }): boolean =>
      Math.abs(x.mean) <= 3 * x.error

    const g1 = members.every(
      m =>
        m.exact &&
        m.returns &&
        m.knotHeld &&
        m.lumpBlind &&
        m.lumpBlindBeats === SURVEY.settle,
    )
    const significant = read.entropyContrast.forward.filter(sig)
    const g2 =
      significant.length >= 4 &&
      (significant.every(x => x.mean > 0) ||
        significant.every(x => x.mean < 0))
    const g3 = read.drift.forward.every(
      x => x.mean > 0 && x.mean >= 3 * x.error,
    )
    const g4 =
      read.plain.forward.every(zero) && read.plain.backward.every(zero)
    const g5 = read.evenness.every(zero)
    const status = !g1
      ? 'partial'
      : g2 && g3 && g4 && g5
        ? 'pass'
        : 'fail'
    const f = (x: { mean: number; error: number }): string =>
      `${x.mean.toExponential(2)} +- ${x.error.toExponential(1)}`
    const list = <T>(xs: readonly T[], g: (x: T) => string): string =>
      xs.map(g).join(', ')

    return verdict({
      status,
      claim: `a held knot (husk radius 2, a dense lump) on the coset-union vacuum under the lone bounce collision (side 24, gas 8/24, 17 starts): settled slot-entropy contrast knot minus none at shells 3..10 ${list(read.entropyContrast.forward, x => f(x))}; paired drift of a test blob toward the knot after ${SURVEY.drift} beats at r0 = 4..8 forward ${list(read.drift.forward, x => f(x))}, backward ${list(read.drift.backward, x => f(x))}; no-knot displacement ${list(read.plain.forward, x => f(x))}; the knot's content is invisible outside (${members.every(m => m.lumpBlind) ? 'bit for bit' : 'NOT bit for bit'})`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        entropyShellsSignificant: significant.length,
        ...Object.fromEntries(
          SURVEY.shells.map((sh, i) => [
            `entropyContrastR${sh}`,
            read.entropyContrast.forward[i]!.mean,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.shells.map((sh, i) => [
            `entropyContrastErrorR${sh}`,
            read.entropyContrast.forward[i]!.error,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.shells.map((sh, i) => [
            `energyContrastR${sh}`,
            read.energyContrast.forward[i]!.mean,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.distances.map((r0, i) => [
            `driftR${r0}`,
            read.drift.forward[i]!.mean,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.distances.map((r0, i) => [
            `driftErrorR${r0}`,
            read.drift.forward[i]!.error,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.distances.map((r0, i) => [
            `driftBackR${r0}`,
            read.drift.backward[i]!.mean,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.distances.map((r0, i) => [
            `plainR${r0}`,
            read.plain.forward[i]!.mean,
          ]),
        ),
        ...Object.fromEntries(
          SURVEY.distances.map((r0, i) => [
            `arrivalR${r0}`,
            read.arrival.forward[i]!,
          ]),
        ),
        betaMin: read.beta.min,
        betaMax: read.beta.max,
        reflectedSlots: members[0]!.reflected,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        noKnotDisplacementZero: g4 ? 1 : 0,
        evenUnderInverse: g5 ? 1 : 0,
        lumpInvisible: members.every(m => m.lumpBlind) ? 1 : 0,
      },
      notes: `L2. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. Settled contrasts (knot minus none, mean +- standard error over 17 members), shells ${SURVEY.shells.join(', ')}: slot entropy forward ${list(read.entropyContrast.forward, x => f(x))}; backward ${list(read.entropyContrast.backward, x => f(x))}; energy per dock forward ${list(read.energyContrast.forward, x => f(x))}; backward ${list(read.energyContrast.backward, x => f(x))}. Paired drift toward the knot after ${SURVEY.drift} beats (columns; 51 samples), r0 ${SURVEY.distances.join(', ')}: forward ${list(read.drift.forward, x => f(x))}; backward ${list(read.drift.backward, x => f(x))}; forward minus backward ${list(read.evenness, x => f(x))}. No-knot displacement forward ${list(read.plain.forward, x => f(x))}; backward ${list(read.plain.backward, x => f(x))}. First beat the knot changes the blob's excess (least over members and axes; ${SURVEY.drift + 1} = never): forward ${read.arrival.forward.join(', ')}, backward ${read.arrival.backward.join(', ')}. Blob excess energy ${Math.min(...members.flatMap(m => m.blobEnergy.flat()))} to ${Math.max(...members.flatMap(m => m.blobEnergy.flat()))}. Gas slot beta ${read.beta.min.toFixed(4)} to ${read.beta.max.toFixed(4)}. Reflected slots ${members[0]!.reflected}. Per member seconds ${members.map(m => m.seconds.toFixed(0)).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
