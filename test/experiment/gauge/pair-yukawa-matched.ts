// E-FRC-0217. The matched Yukawa test: the residual between two static color singlets (STAND-INS for nucleons) of
// the paid Z3 string on the D4 box, read on the husk and in the bulk, with the vacuum's pair move on, and a control
// identical in every respect except that the pair move is off.
//
// E-FRC-0188 proved that pair making turns the string's residual into one-meson exchange, exactly (the 3-state Potts
// model in a field; on the line the static potential falls at ln(lambda0 / lambda1)). E-FRC-0200 put it on D4 and
// failed on its control: a capacity of 6 against a pair-from-calm cost of 7 still paid the pair move on a flux-2 link
// (a string's break, 2 mass - tension = 1) and on a flux-1 link (2 mass = 4), so the control made pairs too.
//
// THE COUPLING THE TASK ASKED FOR DOES NOT EXIST, and the header says so before any run: a pair move is payable when
// its cost is at most the capacity, the pair from calm costs 2 mass + tension and a string's break 2 mass - tension,
// so for any positive tension every capacity that pays the pair from calm pays the break. No capacity separates them
// (code/measure/matched-yukawa's header). What does separate the vacuum with pairs from the one without is the one
// move itself, so the control here is the SAME rule with that move switched off (in both directions, on every flux),
// at the same mass, tension, capacity, seeds, demon start, box, schedule and reading. In the canonical measure that is
// y = 0 against y = e^(-beta mass), which is E-FRC-0188's comparison exactly. The coupling is E-FRC-0200's, mass 2,
// tension 3, capacity 14, so the ONE change from E-FRC-0200 is the control; there a string's break costs 1 > 0.
//
// THE STATIC SINGLETS WITHOUT PINNING. In the measure P(A and B) / (P(A) P(B)) = Z_AB Z_0 / (Z_A Z_B) for two charge
// patterns A, B (a charged free dock weighs y, a static one 1, under the same Gauss constraint), so the pair
// correlation of the pattern "a love and a fear on the two ends of one link" is the connected ratio of two static
// mesons, e^(-beta V) (code/measure/matched-yukawa). Read against box translations class by class, per batch.
//
// The runs (code/measure/matched-yukawa): side-9 D4 box (6,561 docks, 78,732 links), 24 mesons and 4 baryon pairs
// seeded (code/measure/nucleon-gas seedGas), demons from the silver Weyl sequence through q^d, q = 0.35; 4,000
// settling beats, then 160,000 beats read every 4th in 20 batches.
// P  pairs on
// C  pairs off, the same start: the control
// D  pairs off, started from P's last state: a DENSITY-MATCHED no-pair run (as many charges as P's vacuum made),
//    reported, not gated
//
// Read: g(R) - 1 of the pattern pairs per midpoint shell (bulk, and husk with the depth dropped, the column reading
// of code/measure/photon-husk), its error the spread of the 20 batch ratios; the meson mass m1 SEPARATELY, from the
// love-fear displacement of every piece holding exactly one love and one fear (E-FRC-0200's profile, Ornstein-Zernike
// form, bulk power 3/2, husk power 1, shells with 50 counts or more to R 4.5).
//
// Gates, fixed before the first run:
// G0 every run keeps energy and Gauss's law exactly on its reads; the switched kernel with pairs on agrees with
//    graphBeat bit for bit over 40 beats, and both switches reverse exactly over 40 beats; P's charge count changes,
//    C's and D's never do
// G1 YUKAWA, HUSK: P's pooled g - 1 over husk R 2 to 4.5 is positive at more than 3 errors, at least 3 shells stand
//    above 2 errors, and their fitted e^(-m r) / r rate is within 25 percent of P's husk m1
// G2 YUKAWA, BULK: the same in the bulk (power 3/2) against the bulk m1
// G3 CONTROL: C's pooled husk g - 1 over R 2 to 4.5 is within 3 errors of 0, and P's exceeds it by more than 3
//    combined errors
// G4 DEUTERON CONTACT: P's pooled bulk g - 1 over the contact shells (R < 2) is positive at more than 3 errors and
//    exceeds C's by more than 3 combined errors
// Pass: all five. Partial: G0, G1 and G3. Fail: otherwise.
//
// PREDICTION for D, written before the first run: canonical and grand-canonical measures agree locally, so a vacuum
// holding as many free charges without making them should show the same residual: D's pooled husk g - 1 over R 2 to
// 4.5 within 3 combined errors of P's. If it holds, the Yukawa residual comes from free charges and the pair from calm
// matters as their source; if D reads like C, the making itself matters.
//
// Depth L2: a constructed rule's dynamics with stand-in nucleons (color singlets, no three quarks, no spin), read on
// the husk.
//
// DISCLOSED: a probe before the gates were written (tmp/py-probe-coupling.ts, tmp/py-probe-coupling.log) printed
// beta, x, y, charge density, pattern count and timing at five couplings, no residual; it set the coupling back to
// E-FRC-0200's, where the pattern count keeps a read cheap.
// The first run, recorded as it came out (359.1 s, tmp/frc0217.log): fail, on G1, G3 and G4, with G0 and G2 passing.
// P: beta 1.137 (x 0.0330, y 0.1029), 0.0838 charges per dock, 316 patterns per read; husk g - 1 over R 2 to 4.5 FLAT at
// 1.24e-2 +- 4e-5 (48 shells above two errors, fitted rate -0.11 against m1 = 1.282), bulk 2.18e-4 +- 6.8e-5 (15
// shells, rate 1.839 against m1 = 1.511, within 25 percent); C: 72 charges held, 9.5 patterns per read, husk -1.95e-2
// +- 1.2e-3; D: 580 charges held, husk 1.25e-2 +- 4e-5 (the prediction held), bulk 8.7e-4 +- 6.7e-5; contact (bulk
// R < 2) 0.137 +- 5e-4 (P), 0.233 +- 1.2e-2 (C), 0.132 +- 4e-4 (D). THE FLAT HUSK EXCESS WAS THE ESTIMATOR, found
// after that run (tmp/py-probe-keys.ts): code/measure/pair-string midpointKeys takes the minimal image of the two
// links' first docks, so swapping its two links changes the key for 58,880 of 472,392 link pairs (bulk) and 67,472
// (husk) on the side-9 box, and the run counted each real pair twice at the key of its lower link index while the
// reference counts every ordered pair at its own key. Fixed in code/measure/matched-yukawa (each order at its own
// key); no gate, window or setting moved. The same asymmetry sits in E-FRC-0200 to 0202's real-pair counts (index
// order) against their mixed events, and may be their flat husk excess of 1.8e-2.
// The second run (469.7 s, tmp/frc0217-second.log): fail as registered, on G1, G3 and G4; G0 and G2 pass. With each
// order at its own key the husk residual is no longer flat: it falls from 3.6e-2 at husk R 1 through 1.1e-2 at R 2 and
// 0 at R 2.5 to a NEGATIVE PLATEAU near -7.5e-3 from R 3.5 on (bulk the same shape, 0.27 at R 1, 0 at R 3.3, -6e-3 at
// R 4.4). The plateau is the per-read reference's sum rule on a side-9 box (each read's pattern pairs are
// normalized to its own n (n - 1), so the integral of g - 1 over the box is held near 0 and a strong short-range excess
// pushes every far shell down by the same amount), so the window R 2 to 4.5 straddles the zero crossing: husk pooled
// -4.83e-3 +- 4e-5, 8 shells above two errors, fitted rate 3.05 against m1 1.282 (G1 fails); bulk 2.2e-4 +- 6.8e-5,
// 15 shells, rate 1.84 against 1.511 (G2 passes). C (pairs off, 72 charges, 9.5 patterns per read): husk -3.75e-2
// +- 1.2e-3, the same sum rule at 30 times fewer patterns, so G3 fails on its first clause. Contact (bulk R < 2): P
// 0.137 +- 5e-4, C 0.233 +- 1.2e-2 (G4 fails: the dilute control's contact excess is larger). D (pairs off, P's 580
// charges): husk -5.07e-3 +- 4e-5, 2.4e-4 below P, 4.2 combined errors, so the registered D prediction fails narrowly,
// while shell by shell D tracks P to within 10 to 15 percent of P's excess everywhere (3.35e-2 against 3.65e-2 at R 1,
// 9.6e-3 against 1.07e-2 at R 2). REPORTED, NOT GATED, a reading after both runs: measured from the far plateau
// (-7.5e-3), P's husk excess times r is 0.044, 0.048, 0.036, 0.019, 0.014 at R 1, 1.5, 2, 2.5, 3, a rate of about 0.9
// over R 2 to 3 against m1 = 1.28; the plateau is an estimate, so this is not a Yukawa measurement. A box large enough
// that the sum rule's shift is small against the residual at R 3 is what the gate needs.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dockShells, ornsteinZernikeRate, type LengthHistogram } from '@/code/measure/nucleon-gas'
import { leadingProfile } from '@/code/measure/pair-string'
import { seededStart, switchChecks, yukawaBox, yukawaRun, yukawaShells, type YukawaBox, type YukawaRun, type YukawaSetup, type YukawaShell } from '@/code/measure/matched-yukawa'

const SETUP: YukawaSetup = { side: 9, mass: 2, tension: 3, capacity: 14, q: 0.35, mesons: 24, baryons: 4, settle: 4000, beats: 160000, every: 4, batches: 20 }
const R_LOW = 2
const R_HIGH = 4.5
const CONTACT = 2
const SIGMAS = 2
const POOLED_SIGMAS = 3
const TOLERANCE = 0.25
const PROFILE_MIN_COUNT = 50
const REACH = 7
const CHECK_BEATS = 40

type Pooled = { pooled: number; error: number; shells: number; rate: number }

function pooled(shells: readonly YukawaShell[], low: number, high: number, power: number): Pooled {
  const window = shells.filter(s => s.r >= low - 1e-9 && s.r < high + 1e-9 && s.sigma > 0)
  const weight = window.reduce((a, s) => a + 1 / s.sigma ** 2, 0)
  const above = window.filter(s => s.g - 1 > SIGMAS * s.sigma).map(s => ({ r: s.r, value: s.g - 1, count: ((s.g - 1) / s.sigma) ** 2 }))

  return {
    pooled: window.reduce((a, s) => a + (s.g - 1) / s.sigma ** 2, 0) / Math.max(1e-300, weight),
    error: 1 / Math.sqrt(Math.max(1e-300, weight)),
    shells: above.length,
    rate: ornsteinZernikeRate({ points: above, power }),
  }
}

function mesonRate(run: YukawaRun, box: YukawaBox, which: 'bulk' | 'husk'): number {
  const shells = dockShells(box.geometry)[which]
  const histogram: LengthHistogram = run.profile[which]
  const points = [...histogram.entries()]
    .map(([key, count]) => ({ r: Math.sqrt(key / 4), count, value: count / (shells.get(key) ?? 1) }))
    .filter(p => p.r >= (which === 'bulk' ? Math.SQRT2 : 1) - 1e-9 && p.r <= R_HIGH + 1e-9 && p.count >= PROFILE_MIN_COUNT)

  return ornsteinZernikeRate({ points, power: which === 'bulk' ? 1.5 : 1 })
}

export default experiment({
  id: 'gauge/pair-yukawa-matched',
  code: 'E-FRC-0217',
  title:
    'the matched Yukawa test: the residual between two static color singlets (stand-ins for nucleons) of the paid Z3 string on the D4 box, read on the husk, with the vacuum\'s pair move on and a control identical except that the move is off, against e^(-m r) / r at the separately measured meson mass, and the deuteron contact',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const box = yukawaBox(SETUP)
    const start = seededStart(box, SETUP)
    const checks = switchChecks(box.graph, start, CHECK_BEATS)
    const p = yukawaRun({ box, setup: SETUP, start, pairs: true })
    const c = yukawaRun({ box, setup: SETUP, start, pairs: false })
    const d = yukawaRun({ box, setup: SETUP, start: p.final, pairs: false })
    const shells = (run: YukawaRun, which: 'bulk' | 'husk'): YukawaShell[] => yukawaShells({ run, box, which })
    const pHusk = shells(p, 'husk')
    const pBulk = shells(p, 'bulk')
    const cHusk = shells(c, 'husk')
    const cBulk = shells(c, 'bulk')
    const dHusk = shells(d, 'husk')
    const dBulk = shells(d, 'bulk')
    const yukawaHusk = pooled(pHusk, R_LOW, R_HIGH, 1)
    const yukawaBulk = pooled(pBulk, R_LOW, R_HIGH, 1.5)
    const controlHusk = pooled(cHusk, R_LOW, R_HIGH, 1)
    const controlBulk = pooled(cBulk, R_LOW, R_HIGH, 1.5)
    const matchedHusk = pooled(dHusk, R_LOW, R_HIGH, 1)
    const matchedBulk = pooled(dBulk, R_LOW, R_HIGH, 1.5)
    const contact = pooled(pBulk, 0, CONTACT - 1e-6, 1.5)
    const controlContact = pooled(cBulk, 0, CONTACT - 1e-6, 1.5)
    const matchedContact = pooled(dBulk, 0, CONTACT - 1e-6, 1.5)
    const contactHusk = pooled(pHusk, 0, CONTACT - 1e-6, 1)
    const controlContactHusk = pooled(cHusk, 0, CONTACT - 1e-6, 1)
    const m1Husk = mesonRate(p, box, 'husk')
    const m1Bulk = mesonRate(p, box, 'bulk')
    const profile = leadingProfile({ x: p.x, reach: REACH })
    const inWindow = (s: { r: number }): boolean => s.r >= R_LOW - 1e-9 && s.r <= R_HIGH + 1e-9
    const mPredBulk = ornsteinZernikeRate({ points: profile.bulk.filter(inWindow), power: 1.5 })
    const mPredHusk = ornsteinZernikeRate({ points: profile.husk.filter(inWindow), power: 1 })
    const within = (a: number, b: number): boolean => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a / b - 1) < TOLERANCE
    const g0 =
      checks.agrees &&
      checks.reverses &&
      checks.reversesOff &&
      p.exact &&
      c.exact &&
      d.exact &&
      p.fewestCharges !== p.mostCharges &&
      c.fewestCharges === c.mostCharges &&
      d.fewestCharges === d.mostCharges
    const yukawa = (r: Pooled, m1: number): boolean => r.pooled > POOLED_SIGMAS * r.error && r.shells >= 3 && within(r.rate, m1)
    const g1 = yukawa(yukawaHusk, m1Husk)
    const g2 = yukawa(yukawaBulk, m1Bulk)
    const g3 = Math.abs(controlHusk.pooled) < POOLED_SIGMAS * controlHusk.error && yukawaHusk.pooled - controlHusk.pooled > POOLED_SIGMAS * Math.hypot(yukawaHusk.error, controlHusk.error)
    const g4 = contact.pooled > POOLED_SIGMAS * contact.error && contact.pooled - controlContact.pooled > POOLED_SIGMAS * Math.hypot(contact.error, controlContact.error)
    const matchedHolds = Math.abs(matchedHusk.pooled - yukawaHusk.pooled) < POOLED_SIGMAS * Math.hypot(matchedHusk.error, yukawaHusk.error)
    const status = g0 && g1 && g2 && g3 && g4 ? 'pass' : g0 && g1 && g3 ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      beta: p.beta,
      x: p.x,
      y: p.y,
      chargesPerDock: p.chargesPerDock,
      fewestCharges: p.fewestCharges,
      mostCharges: p.mostCharges,
      patternsPerRead: p.patternsPerRead,
      reads: p.reads,
      m1Husk,
      m1Bulk,
      mPredHusk,
      mPredBulk,
      huskPooled: yukawaHusk.pooled,
      huskError: yukawaHusk.error,
      huskShellsAbove: yukawaHusk.shells,
      huskRate: yukawaHusk.rate,
      huskRateOverMeson: yukawaHusk.rate / m1Husk,
      bulkPooled: yukawaBulk.pooled,
      bulkError: yukawaBulk.error,
      bulkShellsAbove: yukawaBulk.shells,
      bulkRate: yukawaBulk.rate,
      bulkRateOverMeson: yukawaBulk.rate / m1Bulk,
      controlBeta: c.beta,
      controlChargesPerDock: c.chargesPerDock,
      controlPatternsPerRead: c.patternsPerRead,
      controlHuskPooled: controlHusk.pooled,
      controlHuskError: controlHusk.error,
      controlBulkPooled: controlBulk.pooled,
      controlBulkError: controlBulk.error,
      controlM1Husk: mesonRate(c, box, 'husk'),
      matchedBeta: d.beta,
      matchedChargesPerDock: d.chargesPerDock,
      matchedPatternsPerRead: d.patternsPerRead,
      matchedHuskPooled: matchedHusk.pooled,
      matchedHuskError: matchedHusk.error,
      matchedHuskShellsAbove: matchedHusk.shells,
      matchedHuskRate: matchedHusk.rate,
      matchedBulkPooled: matchedBulk.pooled,
      matchedBulkError: matchedBulk.error,
      matchedM1Husk: mesonRate(d, box, 'husk'),
      contactBulkPooled: contact.pooled,
      contactBulkError: contact.error,
      contactHuskPooled: contactHusk.pooled,
      contactHuskError: contactHusk.error,
      controlContactBulkPooled: controlContact.pooled,
      controlContactBulkError: controlContact.error,
      controlContactHuskPooled: controlContactHusk.pooled,
      controlContactHuskError: controlContactHusk.error,
      matchedContactBulkPooled: matchedContact.pooled,
      matchedContactBulkError: matchedContact.error,
      matchedPredictionHolds: matchedHolds ? 1 : 0,
      gateExact: g0 ? 1 : 0,
      gateYukawaHusk: g1 ? 1 : 0,
      gateYukawaBulk: g2 ? 1 : 0,
      gateControl: g3 ? 1 : 0,
      gateContact: g4 ? 1 : 0,
    }

    for (const [name, list] of [
      ['pairsHusk', pHusk],
      ['pairsBulk', pBulk],
      ['controlHusk', cHusk],
      ['matchedHusk', dHusk],
    ] as const) {
      list
        .filter(s => s.r <= R_HIGH + 1e-9)
        .forEach(s => {
          metrics[`${name}GMinusOneR${s.r.toFixed(3)}`] = s.g - 1
          metrics[`${name}ErrorR${s.r.toFixed(3)}`] = s.sigma
        })
    }

    return verdict({
      status,
      claim: `pairs on (beta ${p.beta.toFixed(3)}, x = ${p.x.toFixed(4)}, y = ${p.y.toFixed(4)}, ${p.chargesPerDock.toFixed(4)} charges per dock): the static-meson residual over husk R 2 to 4.5 pools to ${yukawaHusk.pooled.toExponential(2)} +- ${yukawaHusk.error.toExponential(1)} (${yukawaHusk.shells} shells above two errors, rate ${yukawaHusk.rate.toFixed(3)} against the husk meson's ${m1Husk.toFixed(3)}), bulk ${yukawaBulk.pooled.toExponential(2)} +- ${yukawaBulk.error.toExponential(1)} (rate ${yukawaBulk.rate.toFixed(3)} against ${m1Bulk.toFixed(3)}); the same rule with the pair move off reads ${controlHusk.pooled.toExponential(2)} +- ${controlHusk.error.toExponential(1)} on the husk; a no-pair run holding P's charges reads ${matchedHusk.pooled.toExponential(2)} +- ${matchedHusk.error.toExponential(1)}; contact (bulk R < 2) ${contact.pooled.toExponential(2)} +- ${contact.error.toExponential(1)} against ${controlContact.pooled.toExponential(2)} +- ${controlContact.error.toExponential(1)} without pairs`,
      metrics,
      control: {
        controlFewestCharges: c.fewestCharges,
        controlMostCharges: c.mostCharges,
        matchedCharges: d.mostCharges,
      },
      notes:
        'L2, stand-ins (color singlets for nucleons). Exact integers and exact reversal, no random numbers: the starts are golden and silver Weyl sequences. The requested control (string breaking above the capacity, the pair from calm payable) is impossible in this rule for any positive tension, so the control switches the pair move off and changes nothing else. A pattern is read afresh from each read: nothing moves. The static residual is read as the pattern pair correlation, which equals the static ratio Z_AB Z_0 / (Z_A Z_B) of the measure exactly. The reference is box translations per link-direction class, per read, so a batch has no free normalization. Errors are the spread over 20 batches.',
    })
  },
})
