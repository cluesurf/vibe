// WHY THE BOUND CLOCK TICKS FASTER WHEN IT MOVES (E-SPN-0207). E-MTR-0025 T2 found that the beat between the two lowest
// levels of the flux-string bound state (three locked loves on one husk line, a STAND-IN) RISES with momentum at D = 2,
// 3, 4 (alpha -0.10, -0.078, -0.083 per K^2, against relativity's +0.0084 to +0.0063): the moving clock ticks faster.
// A two-level clock dilates as relativity says only when both levels have inertia equal to their energy with one c,
// that is, the same own speed c_i^2 = 2 b_i E_i (E_i(K) = E_i + b_i K^2). A beat that rises means the LOWER level is
// the heavier per unit energy (b_lo < b_hi). This file asks which property of a level makes it heavy, and tests one
// answer: the "matter as machine" reading that inertia is the states that must be updated for the whole to move. A
// bound level that is mostly a KNOT (two tokens on one dock, held by the meeting's phase -2 pi / 3 on their
// antisymmetric pair) has to undo the knot to move, since a token can step only off the shared dock, so it moves at
// second order and is heavy; a level held by the string alone moves token by token.
//
// HOW, AND THE ORDER. A PROBE ran first (tmp/spn-clock-probe.log, 2026-10-19), reading every number below on the same
// code. The gates were then written from the hypothesis, before this file's run, and the probe's numbers are disclosed
// as the reason for each threshold. So the gates are post-probe: this is a diagnosis, graded L2, not a prediction.
//
//   READ, for the lowest four particle-sector levels at D = 1 .. 4, with the meeting on (the rule of E-MTR-0025) and
//   off (spec.meet false, the CONTROL: the same tokens, string and cost, no meeting phase): each level's E0, b, c^2 =
//   2 b E0, contact weight, meeting share and mean string (code/measure/level-contact), and the clock's alpha between
//   the two lowest levels against relativity's c_photon^2 / (2 E1 E2).
//
// GATES (D = 2, 3, 4; D = 1 is read and not gated, since with the meeting off its tracking falls to overlap 0.74 and
// two of its four levels have no curvature):
//   K1 THE KNOT: with the meeting on, the lowest level's contact weight is at least 0.8 and the next level's at most 0.5
//   K2 THE KNOT IS HEAVY: with the meeting on, the lowest level's c^2 is at most half the next level's
//   K3 THE CONTROL REMOVES IT: with the meeting off, the lowest level's contact weight is at most 0.4, and its c^2 is
//      at least 0.9 of the next level's (no knot, no heavy ground)
//   K4 THE SIGN: with the meeting on alpha is negative (the clock ticks faster), with it off alpha is positive (it
//      dilates)
//   READ, gating nothing: alpha with the meeting off against relativity's (whether the size is right as well as the
//   sign)
// Verdict: pass if K1 to K4 hold at D = 2, 3, 4; fail otherwise.
//
// FIRST RUN (below, after the run).
//
// Depth L2: the tokens are E-SPN-0077's locked STAND-INS on one husk line. DETERMINISM: no random numbers; exact
// diagonalization of the Bloch beat at each K.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { threeLoves } from '@/code/measure/bound-dispersion'
import {
  clockAlpha,
  levelInertia,
  type LevelInertiaRead,
} from '@/code/measure/level-contact'
import { huskLightSpeed } from '@/code/measure/one-light-speed'

const LEVELS = 4
const KNOT = 0.8
const LOOSE = 0.5
const HEAVY = 0.5
const UNKNOT = 0.4
const EVEN = 0.9
const GATED = [2, 3, 4]

export default experiment({
  id: 'spin/clock-contact-knot',
  code: 'E-SPN-0207',
  title:
    'the bound clock ticks faster when it moves because its lower level is a contact knot: three locked loves (a STAND-IN) held mostly on one dock by the meeting move about three times more heavily per unit energy than the string-held level above, and with the meeting off the knot and the wrong sign both go',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}
    const reads = new Map<string, LevelInertiaRead>()

    for (const meet of [true, false]) {
      for (let D = 1; D <= 4; D++) {
        const read = levelInertia({ ...threeLoves(D), meet }, LEVELS, 4 * D + 6)
        const tag = `${meet ? 'on' : 'off'}_D${D}`
        const c = huskLightSpeed(D)
        const [lo, hi] = [read.levels[0]!, read.levels[1]!]

        reads.set(tag, read)
        read.levels.forEach((l, i) => {
          metrics[`${tag}_L${i}_c2`] = l.c2
          metrics[`${tag}_L${i}_contact`] = l.contact
          metrics[`${tag}_L${i}_participation`] = l.participation
        })
        metrics[`${tag}_alpha`] = clockAlpha(lo, hi)
        metrics[`${tag}_alphaSR`] = (c * c) / (2 * lo.E0 * hi.E0)
        metrics[`${tag}_minOverlap`] = read.minOverlap
      }
    }

    const at = (meet: boolean, D: number): LevelInertiaRead =>
      reads.get(`${meet ? 'on' : 'off'}_D${D}`)!
    const gate = (f: (D: number) => boolean): boolean => GATED.every(f)
    const K1 = gate(
      D =>
        at(true, D).levels[0]!.contact >= KNOT &&
        at(true, D).levels[1]!.contact <= LOOSE,
    )
    const K2 = gate(
      D => at(true, D).levels[0]!.c2 <= HEAVY * at(true, D).levels[1]!.c2,
    )
    const K3 = gate(
      D =>
        at(false, D).levels[0]!.contact <= UNKNOT &&
        at(false, D).levels[0]!.c2 >= EVEN * at(false, D).levels[1]!.c2,
    )
    const K4 = gate(
      D => metrics[`on_D${D}_alpha`]! < 0 && metrics[`off_D${D}_alpha`]! > 0,
    )

    for (const [g, ok] of Object.entries({ K1, K2, K3, K4 })) {
      metrics[`gate${g}`] = ok ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const ok = K1 && K2 && K3 && K4
    const row = (meet: boolean, D: number): string => {
      const r = at(meet, D)
      const tag = `${meet ? 'on' : 'off'}_D${D}`

      return `D ${D}: ${r.levels.map(l => `E0 ${l.E0.toFixed(4)} c^2 ${l.c2.toFixed(4)} contact ${l.contact.toFixed(3)} string ${l.string.toFixed(2)} states ${l.participation.toFixed(1)}`).join('; ')}; alpha ${metrics[`${tag}_alpha`]!.toExponential(3)} against ${metrics[`${tag}_alphaSR`]!.toExponential(3)} (min overlap ${r.minOverlap.toFixed(3)})`
    }
    const ratio = (D: number): string =>
      (at(true, D).levels[1]!.c2 / at(true, D).levels[0]!.c2).toFixed(2)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with the meeting on, the flux-string bound state's lowest level sits ${GATED.map(D => at(true, D).levels[0]!.contact.toFixed(2)).join(', ')} at contact (a knot) and the next ${GATED.map(D => at(true, D).levels[1]!.contact.toFixed(2)).join(', ')} at D = 2, 3, 4, and the knot is ${GATED.map(ratio).join(', ')} times heavier per unit energy (its own c^2 ${GATED.map(D => at(true, D).levels[0]!.c2.toFixed(3)).join(', ')} against ${GATED.map(D => at(true, D).levels[1]!.c2.toFixed(3)).join(', ')}), so the moving clock ticks faster; with the meeting off the lowest level sits ${GATED.map(D => at(false, D).levels[0]!.contact.toFixed(2)).join(', ')} at contact, its c^2 ${GATED.map(D => at(false, D).levels[0]!.c2.toFixed(3)).join(', ')} at least the next level's, and the clock dilates (alpha ${GATED.map(D => metrics[`off_D${D}_alpha`]!.toExponential(2)).join(', ')}), but ${GATED.map(D => (metrics[`off_D${D}_alpha`]! / metrics[`off_D${D}_alphaSR`]!).toFixed(1)).join(', ')} times relativity's`,
      metrics,
      control: Object.fromEntries(
        GATED.map(D => [`off_D${D}_L0_contact`, at(false, D).levels[0]!.contact]),
      ),
      notes: `L2, a diagnosis with post-probe gates (the probe tmp/spn-clock-probe.log read these numbers first). Gates K1 ${K1}, K2 ${K2}, K3 ${K3}, K4 ${K4}. Meeting on: ${[1, 2, 3, 4].map(D => row(true, D)).join(' | ')}. Meeting off: ${[1, 2, 3, 4].map(D => row(false, D)).join(' | ')}. MEANING: inertia here is the states that must change for the whole to move. A knot (two tokens on one dock under the meeting's phase) can move only by undoing itself, so its band is flat, as a tightly bound lattice pair's is (hopping squared over the well). The clock's wrong sign is that one level is a knot and the other is not. With the knot gone the sign is right but the size is still ${GATED.map(D => (metrics[`off_D${D}_alpha`]! / metrics[`off_D${D}_alphaSR`]!).toFixed(1)).join(', ')} times relativity's, and the higher levels (longer strings) are heavier per unit energy than the lower: on locked tokens of mass pi / 3 against a beat, no level is light enough for inertia to equal energy (E-MTR-0024). The same reading applies to the register pair on the candidate rule (E-SPN-0206): its contact well is the knot.`,
    })
  },
})
