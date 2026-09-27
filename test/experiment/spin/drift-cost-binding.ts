// The string paid by the light's drift ALONE, with no store (code/rule/drift-cost-line), on LOCKED STAND-IN tokens:
// the rule as a theorem, then the love-fear pair on one husk line.
//
// WHY. Every placement of a hard count pays (E-SPN-0081, 0084, 0085): at a port it reads 2D docks away, on a
// token's own column it is a flavor, at the ends it pins, and the light's own columns carry no count. The count may
// be the wrong object. Real confinement is by ENERGY, and here the string's energy is already the light's own drift
// phase, zeta_(2N)^(-l), pi / N per flux link per beat (E-SPN-0076 found the lightest level's size set by this cost,
// not by the wall). So: drop the store, keep the cost, and ask what the cost alone does.
//
// THE THEOREM (proved here in words, each clause checked below).
// (1) Husk-local. The beat is cost . meeting . coin . stream. The cost is a product over links of
//     zeta_(2N)^(-bal(f_l)^2), each factor diagonal on ONE link's flux trit. The meeting reads one dock, the coin one
//     token, the stream copies each token by its own label and records the copy on the one link it crosses. So each
//     link's new flux reads only that link's window: its trit and the tokens on its two docks.
// (2) Reversible. With no store there is no bounce: every copy is made, so the stream is a permutation of EVERY
//     register configuration (its inverse copies each token back and undoes the record), and every other piece is
//     unitary with an exact inverse (the conjugate phase, the adjoint meeting and coin).
// (3) Integer. Every piece is an element of Z[zeta_K], K = lcm(2 N^2, 3), times a uniform integer (2^n for the coins,
//     the meetings' 2, 1 or 3): the rule is exact over Z[zeta_K] with no rounding, as E-SPN-0075, 0076 were.
// (4) Gauss exact. Each copy records -q forward and +q back on the crossed link, so f_x - f_(x-1) = charge(x) mod 3
//     is kept by every copy (the recorded hop, E-FRC-0230).
// (5) Nothing is pinned. The beat commutes with the translation of every token and every link by one dock, so the
//     total quasi-momentum K is kept, and the cost reads only the string, a function of the RELATIVE positions. So
//     the cost can localize only relative coordinates. E-SPN-0085's end store kept x_left - rL and pinned the
//     cluster; this rule keeps no position at all.
// (6) The wrap. zeta_(2N)^(-l) has exact order 2N in l: the first l > 0 with no cost is l = 2N, the compact light's
//     circle (E-FRC-0245). For a love and a fear under C (their meeting is the identity) the relative beat at
//     separations d >= 0 is invariant under d -> d + 2N. So past contact the pair's relative spectrum is a BAND
//     spectrum, one band per level of one period (the BROKEN STRING: the far pair's energy returns every 2N), and
//     the cost can never confine strictly: a level at contact is exactly bound only when its quasi-energy lies in a
//     gap of those bands. E-SPN-0074's phase string failed because omega repeats at l = 3; here the repeat is 2N.
// (7) Wannier-Stark, why the bands are narrow and the string is frozen. One locked token's beat U(k) = S(k) C has
//     det U = det C = omega, U(0) = C (phases 0 and -2 pi / 3) and U(k + pi) = -U(k), so the particle branch E_B(k)
//     runs over [0, pi / 3] and the other branch is -2 pi / 3 - E_B(k). A particle-sector pair's relative kinetic
//     energy therefore spans a band of width W = 2 pi / 3, and a pair with one token in each branch is exactly flat
//     at K = 0 (E-SPN-0076's comoving string states, -2 pi / 3 + pi l / N). Under a ramp of pi / N per link a pair
//     at quasi-energy E can only be where E - pi l / N lies in the band: a stretch of W / (pi / N) = 2N / 3 links in
//     every period of 2N. Between two such stretches lie about 4N / 3 forbidden links (the flat level in their
//     middle). So (a) a pair made at contact never stretches past about 2N / 3, (b) a pair made far apart never
//     comes back to contact (a Bloch oscillation at fixed length: the string neither contracts nor breaks), and (c)
//     the broken-string bands, which need a tunnel through ~4N / 3 forbidden links, are exponentially narrow in N.
//     This is a lattice fact (bounded kinetic band) and holds in discrete time because the ramp is a phase.
// (8) What the cost does not forbid: travel. The ramp acts on relative coordinates only (5), so a bound level is a
//     Bloch wave in the centre with a band E(K), which (7) does not flatten.
//
// PREDICTIONS, written before this file ran. Two timing probes (tmp/cost-probe1, sizes and seconds only) and two
// instrument probes of the band tracker (tmp/cost-probe2, 3: residuals, overlaps, and the pair's lightest label and
// parity weights at D = 1) ran first; no energy, size, band or tail was printed.
// P1 The rule. Over every register configuration of a pair on a ring of 8 and three loves on a ring of 6: the
//    stream hits no image twice, back . stream is the identity, Gauss is kept on every Gauss configuration, each
//    link's new flux reads its window only (0 conflicts), and the beat commutes with the translation. Exact:
//    the pair (ring 16, D = 2) and three loves (ring 11, D = 1) equal the float runner (no wall, the cost as a phase)
//    to 1e-12 over 4 and 2 beats (no string past half the ring), with the norm identity, the exact reversal and Gauss
//    on every supported register over 12 and 8 beats (strings may wind).
// P2 The wrap. For the pair at D = 1 .. 8, K = 0 and 0.7, the beat at d and at d + 2N agree for d = 0 .. 2N - 1
//    to 1e-12.
// P3 The broken string is narrow. The largest band width of one period (16 twists, K = 0) falls at every step from
//    D = 2 to D = 8, and is below 1e-3 at D = 8.
// P4 Bound and compact. For the pair under C at D = 2, 3, 4, 6, 8 the lightest level (E-SPN-0076's definition) is
//    the same on the boxes S = 3N and S = 4N (both past the wrap): energies within 1e-9, overlap at least
//    1 - 1e-9. Its weight on strings of N links or more is at most 1e-4 at D = 3 .. 8. At D = 4, 6, 8 it equals
//    E-SPN-0076's level (the store's box, S = 2D) to 1e-4 in energy: the store did no work on it.
// P5 Frozen strings (Bloch oscillation), 1000 beats, K = 0, box 4N, D = 4, 6, 8: a pair made at contact (labels
//    0, 1) never has mean length above 2N / 3 + 1, and never more than 1e-6 of its weight past 4N / 3; a pair made at
//    2N never has more than 1e-6 of its weight under 2N / 3.
// P6 It travels. The pair's lightest level followed from K = 0 to pi in 12 steps (box 3N) at D = 2, 3, 4 has a band
//    at least 0.01 wide, a group velocity reaching 0.02 docks per beat, consecutive overlaps at least 0.5.
// P7 The instruments. lightestStreaming equals lightestUnwrapped (the pair at D = 2 on box 3N, three loves at D = 1
//    on box 8) to 1e-12, and the inverse-iteration tracker equals the full-spectrum tracker on the pair at D = 3
//    (13 energies to 1e-8).
//
// Gates, fixed with the predictions: G1 = P1, G2 = P2, G3 = P3, G4 = P4, G5 = P5, G6 = P6, G7 = P7. Pass if all hold.
// REPORTED: the lightest's energy, <l>, tail and next level by depth, D = 1 on its own, the broken-band widths and
// flat-band counts, the store's numbers beside the cost's.
// THE BOX IS MEASUREMENT: the relative space is cut at l <= S and reflected there only to diagonalize; the rule has
// no wall. HUSK: one husk line, every number a husk number. THE FEAR'S SIGN: C (the user's choice).
//
// Depth L2: a constructed stand-in (locked tokens on one line); the cost is the model's own drift term.
//
// FIRST RUN (recorded, no gate moved): FAIL on G5 and G6, every theorem holding. G1 to G4 and G7 pass: the rule
// census is clean on 3,779,136 and 4,251,528 configurations, the pair's beat is exactly 2N-periodic past contact,
// the broken-string bands narrow as e^(-0.82 N) (8.4e-2 at N = 3 to 9.0e-7 at N = 17), and the pair's lightest level
// is box independent past the wrap and equal to the store's level at D >= 4 (7e-8 or better). G5 fails on its
// thresholds at small depth only: the frozen-string leaks do fall exponentially, but at D = 4 they are 1.3e-4 (past
// 4N / 3 from contact) and 1.9e-4 (under 2N / 3 from 2N), and at D = 6 the second is 3.2e-6, against the 1e-6
// predicted; D = 8 passes (1.7e-9, 2.9e-9). The mean length from contact never passes 2.7, 3.2, 3.8, far inside 2N / 3.
// G6 fails on one clause at one depth: the pair travels at every depth (bands 0.46, 0.57, 0.64 wide, velocity 0.23,
// 0.28, 0.31), but at D = 2 the inverse-iteration tracker lost the level at one step (min overlap 0.093, residual
// 1.6e-3, a near degeneracy); D = 3 and 4 hold (0.97, 0.95).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { ruleCensus, driftExactCheck } from '@/code/measure/drift-cost-exact'
import {
  boxSpec,
  brokenBands,
  build,
  crossBoxOverlap,
  followBand,
  followBandFull,
  lightestReference,
  lightestStreaming,
  lightN,
  pairInTime,
  pairPeriodGap,
  tailWeight,
  type Lightest,
} from '@/code/measure/drift-cost-bloch'
import { stringMoments, type Bloch } from '@/code/measure/flux-store-bloch'
import { antisymmetrized } from '@/code/measure/locked-run'
import { type DriftCostSpec } from '@/code/rule/drift-cost-line'

const PAIR = ['love', 'fear'] as const
const DEPTHS = [1, 2, 3, 4, 6, 8] as const

type PairRow = { D: number; S: number; bloch: Bloch; lp: Lightest; mean: number; tail: number }

function pairLightest(D: number, S: number): PairRow {
  const bu = build(boxSpec(PAIR, D, S), 0)
  const lp = lightestStreaming(bu, 2 * S + 6)

  return { D, S, bloch: bu.bloch, lp, mean: stringMoments(bu.bloch, lp.level.vector).mean, tail: tailWeight(bu.bloch, lp.level.vector, lightN(D)) }
}

export default experiment({
  id: 'spin/drift-cost-binding',
  code: 'E-SPN-0086',
  title: "the string paid by the light's drift alone, with no store, a STAND-IN on locked tokens: husk-local, reversible, exact over Z[zeta_K] and Gauss exact by construction; the cost keeps K and reads only relative positions, so nothing is pinned; its phase returns at l = 2N, so past contact the pair's relative beat is 2N-periodic and the far pair carries narrow bands (the broken string); a linear phase ramp freezes a string's length (Bloch oscillation), binds the pair at contact in a compact level that no box past the wrap moves, and lets it travel",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- G1: the rule ----
    const pairRule: DriftCostSpec = { ring: 8, kinds: [...PAIR], convention: 'C', unlike: 'knit', cost: 5, root: 50 }
    const threeRule: DriftCostSpec = { ring: 6, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', cost: 3, root: 18 }
    const censuses = [ruleCensus(pairRule), ruleCensus(threeRule)]
    const censusOk = censuses.every(c => c.collisions === 0 && c.inverseFailures === 0 && c.gaussBreaks === 0 && c.gaussStates > 0 && c.linkConflicts === 0 && c.translationBreaks === 0)
    const e1 = driftExactCheck({ ring: 16, kinds: [...PAIR], convention: 'C', unlike: 'knit', cost: 5, root: 50 }, [{ x: [8, 8], j: [0, 1], amp: [1, 0] }], 4, 12)
    const e2 = driftExactCheck({ ring: 11, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', cost: 3, root: 18 }, antisymmetrized({ x: [5, 5, 6], j: [0, 1, 0] }), 2, 8)
    const exactOk = [e1, e2].every(e => e.gap < 1e-12 && e.norm && e.reverses && e.gauss)
    const g1 = censusOk && exactOk

    log('g1')

    // ---- G2: the wrap ----
    const periodGaps = [1, 2, 3, 4, 5, 6, 7, 8].flatMap(D => [0, 0.7].map(K => pairPeriodGap(D, K, 0, 2 * lightN(D) - 1)))
    const g2 = periodGaps.every(g => g < 1e-12)

    log('g2')

    // ---- G3: the broken string ----
    const broken = [1, 2, 3, 4, 5, 6, 7, 8].map(D => ({ D, ...brokenBands(D, 0, 16) }))
    let g3 = broken.find(b => b.D === 8)!.largest < 1e-3

    for (let D = 3; D <= 8; D++) if (!(broken[D - 1]!.largest < broken[D - 2]!.largest)) g3 = false

    log('g3')

    // ---- G4: bound and compact ----
    const rows = DEPTHS.map(D => {
      const N = lightN(D)
      const a = pairLightest(D, 3 * N)
      const b = pairLightest(D, 4 * N)
      const store = pairLightest(D, 2 * D)

      log(`g4 D ${D}`)

      return { D, a, b, store, dE: Math.abs(a.lp.unwrapped - b.lp.unwrapped), ov: crossBoxOverlap(a.bloch, a.lp.level.vector, b.bloch, b.lp.level.vector), dStore: Math.abs(a.lp.unwrapped - store.lp.unwrapped) }
    })
    const gated = rows.filter(r => r.D >= 2)
    const g4 = gated.every(r => r.dE <= 1e-9 && r.ov >= 1 - 1e-9) && rows.filter(r => r.D >= 3).every(r => r.a.tail <= 1e-4) && rows.filter(r => r.D >= 4).every(r => r.dStore <= 1e-4)

    // ---- G5: frozen strings ----
    const frozen = [4, 6, 8].map(D => {
      const N = lightN(D)
      const fromContact = pairInTime(D, 4 * N, 0, 0, [0, 1], 1000, 0, (4 * N) / 3)
      const fromFar = pairInTime(D, 4 * N, 0, 2 * N, [0, 1], 1000, (2 * N) / 3, 4 * N)

      return { D, N, fromContact, fromFar }
    })
    const g5 = frozen.every(f => f.fromContact.maxMean <= (2 * f.N) / 3 + 1 && f.fromContact.farWeight <= 1e-6 && f.fromFar.nearWeight <= 1e-6)

    log('g5')

    // ---- G6: it travels ----
    const bands = [2, 3, 4].map(D => {
      const N = lightN(D)
      const start = rows.find(r => r.D === D)!.a

      return { D, ...followBand(boxSpec(PAIR, D, 3 * N), start.lp.level, 12) }
    })
    const g6 = bands.every(b => b.bandwidth >= 0.01 && b.velocity >= 0.02 && b.minOverlap >= 0.5)

    log('g6')

    // ---- G7: the instruments ----
    const refPair = lightestReference(build(boxSpec(PAIR, 2, 15), 0), 36)
    const streamPair = rows.find(r => r.D === 2)!.a.lp
    const threeBu = build(boxSpec(['love', 'love', 'love'], 1, 8), 0)
    const refThree = lightestReference(threeBu, 22)
    const streamThree = lightestStreaming(threeBu, 22)
    const trackerStart = rows.find(r => r.D === 3)!.a.lp.level
    const fast = followBand(boxSpec(PAIR, 3, 21), trackerStart, 12)
    const full = followBandFull(boxSpec(PAIR, 3, 21), trackerStart, 12)
    const trackerGap = Math.max(...fast.energies.map((e, k) => Math.abs(e - full.energies[k]!)))
    const instrumentGap = Math.max(Math.abs(refPair.unwrapped - streamPair.unwrapped), Math.abs(refThree.unwrapped - streamThree.unwrapped))
    const g7 = instrumentGap <= 1e-12 && trackerGap <= 1e-8

    log('g7')

    const ok = g1 && g2 && g3 && g4 && g5 && g6 && g7
    const d = (r: (typeof rows)[number]): string =>
      `D ${r.D}: E ${r.a.lp.unwrapped.toFixed(5)} (box 3N) vs ${r.b.lp.unwrapped.toFixed(5)} (4N), dE ${r.dE.toExponential(1)}, overlap ${r.ov.toFixed(10)}, <l> ${r.a.mean.toFixed(3)}, tail at l >= N ${r.a.tail.toExponential(1)}, next +${(r.a.lp.nextUnwrapped - r.a.lp.unwrapped).toFixed(4)}, store (box 2D) E ${r.store.lp.unwrapped.toFixed(5)} <l> ${r.store.mean.toFixed(3)} (dE ${r.dStore.toExponential(1)})`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with no store the drift's cost alone is a rule: over every register configuration (${censuses.map(c => c.states.toLocaleString('en-US')).join(' and ')}) the stream is a permutation with its inverse, Gauss kept, each link's new flux read from its own window and the beat translation covariant (0 exceptions each); exact over Z[zeta_K] (${e1.gap.toExponential(1)}, ${e2.gap.toExponential(1)}, norm, reversal); the pair's beat past contact is 2N-periodic (${Math.max(...periodGaps).toExponential(1)}), so the far pair carries bands, largest width ${broken.map(b => b.largest.toExponential(1)).join(', ')} at D = 1 to 8; a string's length is frozen (from contact the mean never passes ${frozen.map(f => f.fromContact.maxMean.toFixed(2)).join(', ')} at D = 4, 6, 8, from 2N the weight under 2N/3 stays ${frozen.map(f => f.fromFar.nearWeight.toExponential(1)).join(', ')}); the pair's lightest level is the same on boxes 3N and 4N (dE ${gated.map(r => r.dE.toExponential(1)).join(', ')} at D = 2 to 8), <l> ${rows.map(r => r.a.mean.toFixed(2)).join(', ')} at D = 1 to 8, equal to the store's level at D >= 4 (${rows.filter(r => r.D >= 4).map(r => r.dStore.toExponential(1)).join(', ')}), and travels (band ${bands.map(b => b.bandwidth.toFixed(3)).join(', ')}, velocity ${bands.map(b => b.velocity.toFixed(3)).join(', ')} at D = 2, 3, 4)`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        gate_G6: g6 ? 1 : 0,
        gate_G7: g7 ? 1 : 0,
        ...Object.fromEntries(censuses.flatMap((c, k) => [[`census${k}_states`, c.states], [`census${k}_collisions`, c.collisions], [`census${k}_inverseFailures`, c.inverseFailures], [`census${k}_gaussBreaks`, c.gaussBreaks], [`census${k}_gaussStates`, c.gaussStates], [`census${k}_linkConflicts`, c.linkConflicts], [`census${k}_translationBreaks`, c.translationBreaks]])),
        exactPairGap: e1.gap,
        exactPairNorm: e1.norm ? 1 : 0,
        exactPairReverses: e1.reverses ? 1 : 0,
        exactPairGauss: e1.gauss ? 1 : 0,
        exactThreeGap: e2.gap,
        exactThreeNorm: e2.norm ? 1 : 0,
        exactThreeReverses: e2.reverses ? 1 : 0,
        exactThreeGauss: e2.gauss ? 1 : 0,
        periodGapWorst: Math.max(...periodGaps),
        ...Object.fromEntries(broken.flatMap(b => [[`broken_D${b.D}_largestWidth`, b.largest], [`broken_D${b.D}_flatBands`, b.flatBands], [`broken_D${b.D}_bands`, b.widths.length]])),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`pair_D${r.D}_energy`, r.a.lp.unwrapped],
            [`pair_D${r.D}_energyBox4N`, r.b.lp.unwrapped],
            [`pair_D${r.D}_boxEnergyGap`, r.dE],
            [`pair_D${r.D}_boxOverlap`, r.ov],
            [`pair_D${r.D}_meanString`, r.a.mean],
            [`pair_D${r.D}_tailAtN`, r.a.tail],
            [`pair_D${r.D}_gapNext`, r.a.lp.nextUnwrapped - r.a.lp.unwrapped],
            [`pair_D${r.D}_evenShare`, r.a.lp.reading.even],
            [`pair_D${r.D}_dim`, r.a.lp.dim],
            [`pair_D${r.D}_eigenResidual`, r.a.lp.residual],
            [`pair_D${r.D}_storeEnergy`, r.store.lp.unwrapped],
            [`pair_D${r.D}_storeMeanString`, r.store.mean],
            [`pair_D${r.D}_storeGap`, r.dStore],
          ]),
        ),
        ...Object.fromEntries(frozen.flatMap(f => [[`frozen_D${f.D}_contactMaxMean`, f.fromContact.maxMean], [`frozen_D${f.D}_contactFarWeight`, f.fromContact.farWeight], [`frozen_D${f.D}_farNearWeight`, f.fromFar.nearWeight], [`frozen_D${f.D}_farMinMean`, f.fromFar.minMean], [`frozen_D${f.D}_farMaxMean`, f.fromFar.maxMean]])),
        ...Object.fromEntries(bands.flatMap(b => [[`band_D${b.D}_width`, b.bandwidth], [`band_D${b.D}_velocity`, b.velocity], [`band_D${b.D}_minOverlap`, b.minOverlap]])),
        instrumentGap,
        trackerGap,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        pairD1_boxEnergyGap: rows[0]!.dE,
        pairD1_boxOverlap: rows[0]!.ov,
        pairD1_storeGap: rows[0]!.dStore,
        fullTrackerMinOverlap: full.minOverlap,
      },
      notes: `L2, a STAND-IN. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}, G6 ${g6}, G7 ${g7}. Pair lightest by depth: ${rows.map(d).join('; ')}. Broken-string bands (one period, K = 0): ${broken.map(b => `D ${b.D} largest ${b.largest.toExponential(2)}, ${b.flatBands} flat of ${b.widths.length}`).join('; ')}. Frozen strings (1000 beats): ${frozen.map(f => `D ${f.D}: from contact <l> up to ${f.fromContact.maxMean.toFixed(3)} (2N/3 = ${((2 * f.N) / 3).toFixed(2)}), weight past 4N/3 ${f.fromContact.farWeight.toExponential(1)}; from 2N <l> ${f.fromFar.minMean.toFixed(2)} to ${f.fromFar.maxMean.toFixed(2)}, weight under 2N/3 ${f.fromFar.nearWeight.toExponential(1)}`).join('; ')}. Bands (K = 0 to pi, 12 steps, box 3N): ${bands.map(b => `D ${b.D}: ${b.energies.map(e => e.toFixed(3)).join(' ')} (min overlap ${b.minOverlap.toFixed(3)}, worst residual ${b.worstResidual.toExponential(1)})`).join('; ')}. Instruments: streaming vs reference lightest ${instrumentGap.toExponential(1)}, inverse-iteration vs full tracker ${trackerGap.toExponential(1)} (full tracker min overlap ${full.minOverlap.toFixed(3)}). DISCLOSED: two timing probes and two tracker probes ran before the gates (tmp/cost-probe1 to 3); they printed no energy, size, band or tail, but probe 3 printed the D = 1 pair lightest's label weights (0.29, 0.21, 0.21, 0.29) and parity (all even). THE BOX is measurement, not rule.`,
    })
  },
})
