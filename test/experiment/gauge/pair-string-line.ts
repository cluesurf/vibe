// E-FRC-0189. Does the line's paid string, once its demons can pay for a pair, sample the measure E-FRC-0188 solved?
// The E-FRC-0129 line rule (code/rule/string-line), unchanged, with mass 2, tension 3 and demon capacity 14, twice
// the pair cost 2 mass + tension = 7, so calm makes a love-fear pair wherever a demon holds 7 (E-SPN-0050's pair
// making at the rest energy). The mass and tension are chosen so a string's break costs energy (2 mass - tension =
// 1 > 0: no free string breaking) and a charge is not negligible against a link (y = x^(2/3)).
//
// E-FRC-0188 solved the canonical measure of this rule exactly on the line: a cell's transfer matrix over the flux
// mod 3, T(e, e') = y^([e' != e]) x^([e' != 0]), x = e^(-beta tension), y = e^(-beta mass). If the deterministic rule
// samples it, three numbers of the vacuum are fixed by beta alone, which the demons measure (their mean, through
// code/dynamics/finite-kinetic unitDemonBeta):
// - the charge density, the chance a cell holds a love or a fear: sum over e != e' of l_e T(e, e') r_e' / lambda0 (l.r)
// - the paid fraction, the chance a link's flux is not 0 mod 3: sum over e != 0 of l_e r_e / (l.r)
// - the meson profile, the chance per cell that a piece of paid flux holds exactly a love and a fear d cells apart
//   with no charge between: 2 l_0 (y x) x^(d - 1) y r_0 / (lambda0^(d + 1) l.r), falling at ln(lambda0 / x) per cell
//
// Run: a ring of 512 cells, demons started at whole values by the silver Weyl sequence from the truncated geometric
// law q^d with q = 0.35, no charges seeded (the vacuum makes its own), 400,000 beats after 20,000 settling, read every
// 4th beat. Control: the same start with capacity 6, below the pair cost: no pair can ever be made.
//
// Gates, fixed before the first run:
// G0 energy and Gauss's law exact on every read beat, and the run reverses to its start exactly; the control makes 0
//    charges
// G1 the charge density within 5 percent of the transfer matrix's at the demons' beta
// G2 the paid fraction within 5 percent
// G3 the meson profile at d = 1, 2, 3 within 10 percent each, and its rate over d = 1 to 5 within 5 percent of
//    ln(lambda0 / x)
// Pass: all four. Partial: G0 and two of G1 to G3. Fail: otherwise (a rule that does not sample its measure makes
// E-FRC-0188's static potentials a statement about the measure only).
//
// Depth L2: a constructed rule's dynamics against its own exact measure.
//
// The first run, recorded as it came out (11.4 s, tmp/frc0189.log): fail. With no charge seeded the vacuum made
// NOTHING in 420,000 beats: 0 charges at any beat, at capacity 14 as at capacity 6, the demons' beta 1.0515 (x =
// 0.0427, y = 0.122), where the measure asks for a charge density of 2.67e-3 and a paid fraction of 1.40e-3. The
// reason is the rule, not the start: a line demon only swings between two links (right on even beats, left on odd)
// and never trades with another demon, so energy moves only through matter, and a vacuum with no matter keeps each
// demon's start forever; the golden-sequence start put no demon at the pair cost 7 on a link whose two cells were
// calm. So the calm line never samples its pair measure: E-SPN-0050's pair making needs the energy to move, and the
// line's demons do not move it. Changed after that run, disclosed: 32 mesons are seeded (a love and a fear on
// neighboring cells at golden Weyl positions), so matter carries energy between demons from the first beat; G0 now
// asks the control to keep exactly its 64 seeded charges and the paired run to change its count at least once. No
// threshold moved.
//
// The second run (17.5 s, tmp/frc0189-second.log): fail, on G1, G2 and G3. The rule makes and unmakes pairs (0 to 66
// charges; the control keeps 64 to 64), energy, Gauss and reversal exact, beta 0.7331 (x = 0.1109, y = 0.2308). Every
// density is HALF the transfer matrix's: charge density 1.358e-2 against 2.657e-2 (0.511), paid fraction 7.66e-3
// against 1.51e-2 (0.506), the profile 0.53 to 0.56 of it at d = 1 to 4, while its RATE is 2.264 against 2.213
// (2.3 percent). The third run added the share of reads with no charge (1.7 percent, first at beat 21,660), which
// rules out a frozen vacuum as the cause. THE CAUSE, derived after that run and added as reported metrics (the
// fourth run), not gated: the rule's pair move is (0, 0) -> (1, -1) on a link oriented rightward, so a pair is born
// love-left, charges never pass on the line, and the integer flux, 0 at the start, stays at least 0 on every link
// (each move keeps it: a love hopping right takes 1 from a link it left at E_(i-1) + 1 >= 1, a fear hopping left
// takes 1 from a link at E_i + 1 >= 1, and every other move adds or removes at least 0). The fear-left meson, flux -1
// between a fear and a love, is unreachable from the calm start, and the mod-3 transfer matrix counts it: that is
// the factor 2. The rule's own measure is flux paths E >= 0 pinned at the start's level (code/measure/pair-string
// orderedLineMeasure; levels 0 to 3, the range the run's flux reads, 0 to 3): charge density 0.013579 against
// 0.013585 measured, paid fraction 7.741e-3 against 7.661e-3, profile 5.78e-3 against 6.01e-3 at d = 1. With levels
// to 4 or more the ordered measure's Perron vector climbs to the vacuum at level 3, where both orientations live,
// and returns the mod-3 numbers: the pinned level is a slow mode of the ring, not a property of the measure.
// So E-FRC-0188's line potentials are those of the mod-3 measure; the rule's own ordered measure is read here for the
// same static mesons (orderedStaticConnected, reported).
// The fifth run (tmp/frc0189-fifth.log), the same gates and the same dynamics to the last digit: fail as registered.
// Against the ordered measure the dynamics reads 1.0004 (charge density), 0.990 (paid fraction) and 1.04, 1.08, 1.03,
// 1.07 (profile, d = 1 to 4; 0.78 at d = 5 on 10^-6 counts): THE LINE RULE SAMPLES ITS OWN ORDERED MEASURE, and not
// the mod-3 one. The ordered measure's static potential between two static love-left mesons is NOT a string's: its
// connected ratio is 0.997 at contact and still 0.968 at gap 8, falling at 3.7e-4 per cell. On the line every flux
// level 0 mod 3 is a vacuum and a static meson costs nothing inside flux 2 (2 -> 3 -> 2), so two static mesons are
// correlated through the level sector (a domain of another vacuum between them costs its two walls, whatever its
// length), and the cap at level 3 makes even that an artifact. The line's static question in the rule's own measure
// is the level sector's; the string's Yukawa of E-FRC-0188 is a statement about the mod-3 measure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gaussHolds, stringBeat, stringBeatBack, stringEnergy, type StringLine, type StringState } from '@/code/rule/string-line'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { GOLDEN, SILVER } from '@/code/tool/weyl'
import { freeCell, orderedLineMeasure, perron } from '@/code/measure/pair-string'

const CELLS = 512
const MASS = 2
const TENSION = 3
const CAPACITY = 2 * (2 * MASS + TENSION)
const CONTROL_CAPACITY = 2 * MASS + TENSION - 1
const Q = 0.35
const SETTLE = 20000
const BEATS = 400000
const EVERY = 4
const PROFILE = 5
const SEEDS = 32
// flux levels kept in the ordered measure: 0 to 3, the range the run's flux reads (see the header)
const ORDERED_LEVELS = 3
const ORDERED_GAPS = 8

const mod3 = (e: number): number => ((e % 3) + 3) % 3

type Run = {
  exact: boolean
  reverses: boolean
  meanDemon: number
  charges: number
  paid: number
  profile: number[]
  madeCharges: number
  fewestCharges: number
  emptyShare: number
  firstEmpty: number
  smallestFlux: number
  largestFlux: number
}

function run(capacity: number): Run {
  const line: StringLine = { cells: CELLS, mass: MASS, tension: TENSION, capacity }
  const weights = Array.from({ length: capacity + 1 }, (_, d) => Q ** d)
  const total = weights.reduce((a, b) => a + b, 0)
  const cumulative = weights.map((_, d) => weights.slice(0, d + 1).reduce((a, b) => a + b, 0) / total)
  const demon = Int32Array.from({ length: CELLS }, (_, i) => cumulative.findIndex(c => ((i + 1) * SILVER) % 1 < c))
  // the seeded mesons (added after the first run, see the header): a love and a fear on neighboring cells at golden
  // Weyl positions, each moved on to the next place whose three cells are free
  const vibe = new Int8Array(CELLS)
  const flux = new Int32Array(CELLS)

  for (let k = 0; k < SEEDS; k++) {
    let i = Math.floor((((k + 1) * GOLDEN) % 1) * CELLS)

    while (vibe[i] !== 0 || vibe[(i + 1) % CELLS] !== 0 || vibe[(i + 2) % CELLS] !== 0 || vibe[(i - 1 + CELLS) % CELLS] !== 0) {
      i = (i + 1) % CELLS
    }

    vibe[i] = 1
    vibe[(i + 1) % CELLS] = -1
    flux[i] = 1
  }

  const start: StringState = { vibe, flux, demon }
  const e0 = stringEnergy(line, start)

  let s = start
  let exact = gaussHolds(line, start)
  let demonSum = 0
  let charges = 0
  let paid = 0
  let samples = 0
  let empty = 0
  let firstEmpty = Infinity
  let smallestFlux = Infinity
  let largestFlux = -Infinity
  let madeCharges = 0
  let fewestCharges = Infinity
  const profile = new Array<number>(PROFILE + 1).fill(0)

  for (let t = 0; t < SETTLE + BEATS; t++) {
    s = stringBeat(line, s, t)

    if (t >= SETTLE && (t - SETTLE) % EVERY === 0) {
      exact = exact && stringEnergy(line, s) === e0 && gaussHolds(line, s)
      samples++

      let here = 0

      for (let i = 0; i < CELLS; i++) {
        demonSum += s.demon[i] as number
        charges += s.vibe[i] !== 0 ? 1 : 0
        here += s.vibe[i] !== 0 ? 1 : 0
        paid += mod3(s.flux[i] as number) !== 0 ? 1 : 0
        smallestFlux = Math.min(smallestFlux, s.flux[i] as number)
        largestFlux = Math.max(largestFlux, s.flux[i] as number)
      }

      // reads with no charge at all, and the first such read (a report added after the second run)
      if (here === 0) {
        empty++
        firstEmpty = Math.min(firstEmpty, t)
      }

      // one-love-one-fear pieces: an unpaid link, a charge, d paid links with no charge between, the opposite
      // charge, an unpaid link. The piece starts at cell i (its first charge), link i - 1 unpaid
      for (let i = 0; i < CELLS; i++) {
        const q = s.vibe[i] as number

        if (q === 0 || mod3(s.flux[(i - 1 + CELLS) % CELLS] as number) !== 0) {
          continue
        }

        let d = 1

        while (d <= PROFILE + 1 && s.vibe[(i + d) % CELLS] === 0 && mod3(s.flux[(i + d - 1) % CELLS] as number) !== 0) {
          d++
        }

        const end = (i + d) % CELLS

        if (d <= PROFILE && s.vibe[end] === -q && mod3(s.flux[(i + d - 1) % CELLS] as number) !== 0 && mod3(s.flux[end] as number) === 0) {
          profile[d] = (profile[d] as number) + 1
        }
      }
    }

    const count = s.vibe.reduce((a, v) => a + (v !== 0 ? 1 : 0), 0)

    madeCharges = Math.max(madeCharges, count)
    fewestCharges = Math.min(fewestCharges, count)
  }

  let back = s

  for (let t = SETTLE + BEATS - 1; t >= 0; t--) {
    back = stringBeatBack(line, back, t)
  }

  const reverses = back.vibe.every((v, i) => v === start.vibe[i]) && back.flux.every((v, i) => v === start.flux[i]) && back.demon.every((v, i) => v === start.demon[i])

  return {
    exact,
    reverses,
    meanDemon: demonSum / (samples * CELLS),
    charges: charges / (samples * CELLS),
    paid: paid / (samples * CELLS),
    profile: profile.map(p => p / (samples * CELLS)),
    madeCharges,
    fewestCharges,
    emptyShare: empty / samples,
    firstEmpty,
    smallestFlux,
    largestFlux,
  }
}

export default experiment({
  id: 'gauge/pair-string-line',
  code: 'E-FRC-0189',
  title:
    'does the paid string on the E-FRC-0129 line, with demons that can pay for a pair, sample its own exact measure: the vacuum\'s charge density, paid fraction and meson profile against the transfer matrix at the demons\' temperature',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const paired = run(CAPACITY)
    const control = run(CONTROL_CAPACITY)
    const beta = unitDemonBeta({ meanDemon: paired.meanDemon, capacity: CAPACITY })
    const x = Math.exp(-beta * TENSION)
    const y = Math.exp(-beta * MASS)
    const t = freeCell(x, y)
    const { left, right, value } = perron(t)
    const lr = [0, 1, 2].reduce((a, e) => a + (left[e] as number) * (right[e] as number), 0)
    let chargePredicted = 0

    for (let e = 0; e < 3; e++) {
      for (let f = 0; f < 3; f++) {
        if (e !== f) {
          chargePredicted += ((left[e] as number) * (t[e * 3 + f] as number) * (right[f] as number)) / (value * lr)
        }
      }
    }

    const paidPredicted = [1, 2].reduce((a, e) => a + (left[e] as number) * (right[e] as number), 0) / lr
    // a love from flux 0 to 1, d - 1 more paid links at flux 1, a fear back to 0; and the mirror (fear first)
    const profilePredicted = Array.from({ length: PROFILE + 1 }, (_, d) =>
      d === 0 ? 0 : (2 * (left[0] as number) * (y * x) * x ** (d - 1) * y * (right[0] as number)) / (value ** (d + 1) * lr),
    )
    const rateOf = (p: number[]): number => {
      const points = p.map((v, d) => ({ d, v })).filter(q => q.d >= 1 && q.v > 0)
      const mx = points.reduce((a, q) => a + q.d, 0) / points.length
      const my = points.reduce((a, q) => a + Math.log(q.v), 0) / points.length
      const sxy = points.reduce((a, q) => a + (q.d - mx) * (Math.log(q.v) - my), 0)
      const sxx = points.reduce((a, q) => a + (q.d - mx) ** 2, 0)

      return -sxy / sxx
    }
    const rate = rateOf(paired.profile)
    const ordered = orderedLineMeasure({ x, y, levels: ORDERED_LEVELS, profile: PROFILE, gaps: ORDERED_GAPS })
    const rateExpected = Math.log(value / x)
    const within = (a: number, b: number, tolerance: number): boolean => Number.isFinite(a) && b > 0 && Math.abs(a / b - 1) < tolerance
    // the control can neither make nor unmake a pair (capacity below the pair cost), so it keeps its seeded charges;
    // the paired run must change its charge count at least once
    const g0 =
      paired.exact &&
      paired.reverses &&
      control.exact &&
      control.reverses &&
      control.madeCharges === 2 * SEEDS &&
      control.fewestCharges === 2 * SEEDS &&
      (paired.madeCharges !== 2 * SEEDS || paired.fewestCharges !== 2 * SEEDS)
    const g1 = within(paired.charges, chargePredicted, 0.05)
    const g2 = within(paired.paid, paidPredicted, 0.05)
    const g3 = [1, 2, 3].every(d => within(paired.profile[d] as number, profilePredicted[d] as number, 0.1)) && within(rate, rateExpected, 0.05)
    const passed = [g1, g2, g3].filter(Boolean).length
    const status = g0 && passed === 3 ? 'pass' : g0 && passed >= 2 ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      meanDemon: paired.meanDemon,
      beta,
      x,
      y,
      lambda0: value,
      chargeDensity: paired.charges,
      chargeDensityPredicted: chargePredicted,
      paidFraction: paired.paid,
      paidFractionPredicted: paidPredicted,
      profileRate: rate,
      profileRatePredicted: rateExpected,
      mostChargesAtOnce: paired.madeCharges,
      fewestChargesAtOnce: paired.fewestCharges,
      emptyReadShare: paired.emptyShare,
      firstEmptyBeat: paired.firstEmpty,
      // the densities over the reads that hold a charge (reported, not gated)
      chargeDensityLive: paired.charges / Math.max(1e-300, 1 - paired.emptyShare),
      paidFractionLive: paired.paid / Math.max(1e-300, 1 - paired.emptyShare),
      mesonProfileD1Live: (paired.profile[1] as number) / Math.max(1e-300, 1 - paired.emptyShare),
      // the rule's own ordered measure (integer flux at least 0, added after the second run, reported, not gated)
      smallestFluxRead: paired.smallestFlux,
      largestFluxRead: paired.largestFlux,
      chargeDensityOrderedPredicted: ordered.charges,
      paidFractionOrderedPredicted: ordered.paid,
      chargeOverOrdered: paired.charges / ordered.charges,
      paidOverOrdered: paired.paid / ordered.paid,
      ...Object.fromEntries([1, 2, 3, 4, 5].map(d => [`mesonProfileD${d}OverOrdered`, (paired.profile[d] as number) / (ordered.profile[d] as number)])),
      ...Object.fromEntries(ordered.connected.map((c, gap) => [`orderedStaticConnectedGap${gap}`, c])),
      ...Object.fromEntries(ordered.connected.slice(0, -1).map((c, gap) => [`orderedStaticRateGap${gap}`, Math.log(c / (ordered.connected[gap + 1] as number))])),
      bareStringRate: Math.log(ordered.lambda0 / x),
      controlMostChargesAtOnce: control.madeCharges,
      controlFewestChargesAtOnce: control.fewestCharges,
      controlMeanDemon: control.meanDemon,
      gateExactAndControl: g0 ? 1 : 0,
      gateChargeDensity: g1 ? 1 : 0,
      gatePaidFraction: g2 ? 1 : 0,
      gateMesonProfile: g3 ? 1 : 0,
    }

    for (let d = 1; d <= PROFILE; d++) {
      metrics[`mesonProfileD${d}`] = paired.profile[d] as number
      metrics[`mesonProfileD${d}Predicted`] = profilePredicted[d] as number
    }

    return verdict({
      status,
      claim: `the line's paid string with demons of capacity ${CAPACITY}, ${SEEDS} mesons seeded, holds ${paired.fewestCharges} to ${paired.madeCharges} charges (${control.fewestCharges} to ${control.madeCharges} with capacity ${CONTROL_CAPACITY}); at the demons' beta ${beta.toFixed(4)} (x = ${x.toFixed(4)}, y = ${y.toFixed(4)}) its charge density is ${paired.charges.toExponential(3)} against ${chargePredicted.toExponential(3)}, its paid fraction ${paired.paid.toExponential(3)} against ${paidPredicted.toExponential(3)}, and its meson profile falls at ${rate.toFixed(3)} per cell against ln(lambda0 / x) = ${rateExpected.toFixed(3)}`,
      metrics,
      control: { capacity: CONTROL_CAPACITY, madeCharges: control.madeCharges },
      notes:
        'L2. Exact integers and exact reversal, no random numbers: the demons start from the silver Weyl sequence through the truncated geometric law, and no charge is seeded. The line rule streams its demons right on even beats and left on odd ones, so a demon visits two links; energy travels only through the matter it pays for, which is what this test puts to the measure.',
    })
  },
})
