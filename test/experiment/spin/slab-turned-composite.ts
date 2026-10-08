// THE TURNED COMPOSITE: DOES THE TRUE 2D THREE-HOLE LEVEL HOLD UNDER THE MIXER, AND WITH WHAT INERTIA (E-SPN-0144)?
// note/project/vibe/roadmap/research/remaining-pieces.md, "Three holes on a 2d slab (E-SPN-0135)". E-SPN-0141 (test/experiment/
// spin/slab-string-break) found the slab composite's loss under the frame mixer is neither shaking against the one-line
// gap nor string breaking: the fidelity to the RATE-0 line level beats rather than decays, the leaked weight is the same
// three holes bent, and the followed vector was not an eigenvector (Ritz residual 0.07 at D 3, a partner 0.002 rad away
// at D 6). So the reference was wrong. This experiment builds the level the mixer itself makes, at each rate, and asks
// whether THAT level holds, and then how it moves.
//
// DERIVED BEFORE THE RUN (code/measure/slab-turned-level header; probes at rate 0 only, disclosed below).
// 1. THE MIXER IS exp(-i theta N_u). On a hole the frame mixer is I + (e^(-i theta) - 1) J/4 = exp(-i theta P), P = J/4
//    the projector on the dock's uniform slot mode, and the holes' P commute, so the beat at rate n is U(n) = U(0)
//    exp(-i theta N_u), N_u the number of holes in the uniform mode. Exactly, not to first order. So a level's slope is
//    dE/dtheta = <v|N_u|v> (Hellmann-Feynman for this product), and first-order perturbation theory about the rate-0
//    levels is diagonalizing theta N_u within a family of near-degenerate rate-0 levels.
// 2. THE SECTOR. Every piece of the beat at K = 0 commutes with the square's reflections and the axis swap (the coin is
//    k I + c X, symmetric under its line's swap; the cost reads the Steiner length; the mixer reads the slot sum; the
//    window is symmetric). The line level is even under the reflection of its own axis (probe: character 1.000000) and
//    trivially under the other, so the x-line plus the y-line is A1 (x 1, y 1, swap 1) and the x-line minus the y-line
//    B1 (swap -1). The mixer never leaves a sector. E-SPN-0141's placed start was A1 already, so the B1 partner is NOT
//    what beat against it. At rate 0 the two sectors are isospectral (a swap maps a configuration of k x-holes to one of
//    3 - k, never to itself for three holes), and N_u couples an x-line only to one hole turned, so A1 and B1 split at
//    third order in theta (three turns). The level followed is the A1 one; the B1 one is followed at D 3 for its split.
// 3. THE FAMILY (probes tmp/turn-probe1-3.log, turn-probe2-3.log, turn-probe1-6-16.log, turn-probe2-6-16.log). In A1, a
//    Blackman-Harris filter of 512 beats (half width 0.049 rad) around the line level passes, of the first-order push
//    N_u v0, nothing but v0 itself: no rate-0 A1 level within about 0.03 rad is coupled to it. v0 is exact (residual
//    2.6e-8 at D 3, 2.3e-9 at D 6 on w 16, |lambda| 1 - 4e-8 and 1 - 1e-12), <N_u> = 0.6928 (D 3) and 0.6495 (D 6), and
//    the off-diagonal push |(1 - P0) N_u v0|^2 = 0.413 and 0.394 is spread over many bent levels, none carrying more
//    than |g| = 0.066. Over +-0.4 rad (filter 64 beats, start N_u N_u v0, Krylov 400 beats) the long-lived bent A1 levels
//    at D 3 with coupling |g| >= 0.01 are, by Rayleigh distance dE, coupling g and |lambda|:
//      -0.2185 0.066 0.999985   -0.0523 0.021 0.999956   -0.0402 0.037 0.999946   +0.0528 0.010 0.999967 (on line)
//      +0.0717 0.022 0.999993   +0.1745 0.046 0.999867   +0.2417 0.010 0.999798
//    and one uncoupled bent level at +0.0135 (g 3e-4). DISCLOSED: these family vectors are mixtures (residuals 1.6e-3 to
//    2e-2), so each number is good to a factor of a few, and the run recomputes them.
//    D 6 (w 16): v0 exact (missed per hole 7e-6), and 20 bent A1 levels within 0.4 rad, 12 with |g| >= 0.01, the
//    nearest at +0.0420 (g 0.014, |lambda| 0.999912), then -0.0457, -0.0783, -0.0873, +0.0964, +0.1036; they are wider
//    and leakier than D 3's (mean Steiner 7 to 8 against 4 to 6, missed per hole at R 4 0.015 to 0.10, |lambda| 0.9992
//    to 0.99993): the weaker string holds its bent levels less well.
// 4. THE PREDICTION. The A1 level is NONDEGENERATE within its coupled family: the gap to the next coupled 2d level is
//    0.040 rad at D 3 (an xxy level, one hole turned), not the one-line gap 0.35 and not 0.002. Its slope 0.69 against
//    the neighbors' 0.57 to 0.71 gives no first-order crossing below theta 2 rad, so it continues smoothly, E(theta) =
//    E0 + 0.6928 theta + O(theta^2). It dresses: weight (theta g_k / dE_k)^2 from each bent level, and with it that
//    level's absorption through the window over the hold, 1 - |lambda_k|^256. Summed, the hold's loss is L theta^2 with
//    L = 0.0165 at D 3 (the -0.040 level carries 0.0116 of it), so the eigen clause (1e-3) fails at theta_c = 0.246,
//    RATE_C = 0.060 = 1/16.6: PREDICTED held at D 3 on 1/1024 .. 1/32, failing at 1/16. The window clause is predicted
//    to hold wherever the eigen clause does (the bent levels' missed register per hole is 2e-4 to 7e-3, weighted by
//    their admixture). E-SPN-0141's failures are then the reference's, not the composite's.
//    D 6: gap 0.042, slope 0.649, L = 0.0216, theta_c 0.215, RATE_C 0.046 = 1/21.7; and here the WINDOW clause binds
//    nearly as soon: the admixed bent levels miss 0.019 theta^2 per hole, reaching 1e-3 at rate 1/19. PREDICTED held at
//    D 6 on 1/1024 .. 1/32, failing at 1/16, on w 16. The rule for both D, fixed now: holds wherever the predicted loss
//    L theta^2 and window term are under 1e-3, so the five gate rates hold at both D and the scan stops at 1/16.
//    H3 predicted: the A1 level's tensor is isotropic at K^2 by the square symmetry (a nondegenerate level of a
//    D4-invariant beat has a D4-invariant, hence scalar, inverse-mass tensor), so isotropy is a check of the instrument,
//    not physics; the content is m*/E_rest. At small theta the A1 level is the average of an x-line (1/m 0.0415 along,
//    E-SPN-0135) and a y-line (about 0 across, since crossing needs turning): 1/m* about 0.021, m* about 48, m*/E_rest
//    about 145 at D 3. PREDICTED H3 FAILS, by a factor near 70, falling only as turning grows.
//
// THE WITNESS (fixed before the run). A composite HOLDS at a rate iff, over 128 beats of the beat AT THAT RATE from its
// level vector v (built at that rate), (eigen) the fidelity |<v|U^t v>|^2 stays >= 0.999 at every beat (a beating
// superposition or a leaking level fails it), AND (window) the register missed per hole outside the Chebyshev radius 4
// around the holes' centroid, plus every hole of the escaped weight (code/measure/slab-string-break registerMissed, as
// E-SPN-0141 T3), stays <= 1e-3 at every beat. Radius 4 is E-SPN-0141's, read from the rate-0 levels.
// THE LEVEL. At each rate: code/measure/slab-turned-level followLevel from the previous rate's vector (the rate-0 level
// first): a Blackman-Harris filter of 512 beats centered at E_prev + <N_u>_prev (theta - theta_prev), the Toeplitz Ritz
// levels of the filtered start over 240 beats, the level of largest overlap with the previous vector, projected on A1;
// a second pass from it iff its explicit residual |U v - <v|U v> v| exceeds 1e-4. Energies are explicit Rayleigh
// quotients (the Toeplitz Ritz energy of a filtered start is off by up to 3e-1, probe).
//
// GATES, fixed before the run.
//  H1 at D 3 (w 12, 36,973 x 64 amplitudes, 78 ms a beat) the A1 level HOLDS at every rate 1/1024, 1/512, 1/256, 1/128,
//     1/64. If so the scan continues at 1/32, 1/16, 1/8, 1/4, 1/2, 1, 2, 3 and stops at the first rate that does not
//     hold; the highest held rate is reported.
//  H2 at D 6 on the ENLARGED window w 16 (111,793 x 64 = 7,154,752 amplitudes, 3.0x w 12, 265 ms a beat, 115 MB a
//     vector): the window is ADEQUATE iff every gate level's weight at Steiner length >= 14 is <= 1e-4, and H2 holds iff
//     adequate AND the A1 level holds at all five gate rates (continued as H1 if so). D 6 on w 12, read the same way, is
//     reported beside it (not gated), to show what the window did to E-SPN-0141's D 6.
//  H3 (read at the held points among D 3: 1/1024, 1/256, 1/64; D 6: 1/1024, 1/64) the inverse-mass tensor
//     (code/measure/slab-turned-level turnedTensor, kappa pi/32, 240 beats a read, energies explicit): one sign, isotropy
//     lambda_min / lambda_max >= 0.8, and m*/E_rest within a factor 2 of 1 (m* = 1 / d2E/dKx2 Richardson-extrapolated,
//     E_rest = |E|, E-SPN-0139's convention) at every such point. Along versus across: the A1 level carries both
//     orientations, so the along/across split is the A1-B1 split, reported at D 3 (not gated).
//  H4 (fallback, only if H1 fails) a corner cost on the Steiner string splitting bent from straight, the smallest cost
//     that isolates a level, and H1 retested. Not run unless H1 fails.
// CONTROLS (a failed control makes the verdict partial).
//  CR the rate-0 A1 level at D 3 and D 6 has explicit residual <= 1e-6, energy equal to the one-line level's
//     (code/measure/coined-line-bloch lineLightest) to 1e-5, and holds by the witness.
//  CN the witness can fail: the RATE-0 level watched under the beat at 1/64 (E-SPN-0141's reading) does not hold.
// CHECKS: each symmetry commutes with one beat at 1/64 to 1e-12; every followed vector, BEFORE its projection, has
//  characters equal to its sector's to 1e-9; antisymmetry of every level to 1e-10.
// Verdict: partial if a control or check fails; pass if H1, H2 and H3 hold; fail otherwise.
// PREDICTED: fail, on H3 (m*/E_rest near 145); H1 and H2 hold on the gate rates, the highest held rate 1/32 at both D.
// PROBES, disclosed: tmp/turn-time.log (the beat's cost), tmp/turn-probe1-3.log, turn-probe1-6-16.log (characters, the
// narrow family), tmp/turn-probe2-3.log, turn-probe2-3-odd.log, turn-probe2-6-16.log (the wide family). All at rate 0;
// nothing at a mixer rate was run before the gates were fixed.
//
// FIRST RUN (tmp/turn-exp-run1.log, 8,659 s): FAIL, no gate moved. Controls and checks hold: CR (E 0.33001837939 and
// -0.12246903431 against the line's 0.33001851839 and -0.12246902105, residuals 2.6e-8 and 2.3e-9, both held), CN (the
// rate-0 level watched at 1/64: least fidelity 0.908, not held), symmetry 1.6e-16, character before projection 2.2e-15,
// antisymmetry 2.5e-13. The families recomputed in the run agree with the probes (D 3 gap 0.0402, L 0.0166, RATE_C
// 1/16.7; D 6 gap 0.0420, L 0.0217, RATE_C 1/21.8).
//                          rate:  1/1024     1/512      1/256      1/128      1/64
//   D 3 w 12 least fidelity       0.99972 H  0.83414    0.89969    0.98112    0.99519
//            missed / hole        3.9e-4     2.5e-3     1.9e-3     1.3e-3     1.4e-3
//            residual             1.1e-4     3.5e-3     2.9e-3     1.1e-3     5.7e-4
//            off line             0.012      0.325      0.379      0.106      0.053
//   D 6 w 16 least fidelity       0.99993 H  0.99989 H  0.79136    0.89984    0.96279
//            missed / hole        9.0e-5     2.1e-4     1.6e-2     5.6e-3     2.5e-2
//            residual             7.7e-5     8.4e-5     4.0e-3     3.0e-3     1.8e-3
//            edge (V >= 14)       6.8e-6     1.8e-5     1.2e-3     5.4e-4     1.3e-3
//   D 6 w 12 least fidelity       0.99781    0.99538    0.95698    0.97510    0.93071   (not gated)
//            missed / hole        2.2e-3     4.7e-3     1.1e-2     2.5e-2     7.4e-2
//  - H1 FAILS: D 3 holds at 1/1024 only. The level built with the mixer on holds where E-SPN-0141's rate-0 reference
//    failed (0.99972 against 0.98983 at 1/1024), and its slope is the derived <N_u> (0.6939 against 0.6928). From 1/512
//    up the follower never reaches an eigenlevel (residual 1e-3 to 4e-3 after the second pass), and what it returns is
//    a line-bent hybrid (11 to 38 percent off the line). The prediction (nondegenerate, smooth to rate 1/16) is WRONG.
//  - H2 FAILS: on w 16 D 6 holds at 1/1024 and 1/512 (the window is adequate there, edge 7e-6 and 2e-5), and fails from
//    1/256 on the same two clauses, where the edge weight also passes 1e-4 (not adequate). On w 12 D 6 holds nowhere,
//    on the window clause (missed 2.2e-3 already at 1/1024): enlarging the window is what made the D 6 level hold at all.
//  - H3 FAILS. D 6 at 1/1024: xx 0.02115 (Richardson), yy 0.01881, m* 47.3, E_rest 0.1021, m*/E_rest 463, isotropy 0.896
//    against the exact 1 the square symmetry requires (the single-kappa reads carry a 10 percent K^4 error). D 3 at
//    1/1024: the K-shifted reads are not levels (worst residual 0.62, least weight 0.59), so its numbers (m* 0.33) are
//    not a measurement. No other tensor rate held.
//  - THE PARTNER. A1 and B1 split by 2.7e-6 at 1/1024 (third order, as derived) and by 1.3e-5 and 2.4e-5 at 1/128 and
//    1/64; at 1/512 and 1/256, where the A1 follower failed, the split reads 3e-4 and 8e-4 (the two followers returned
//    different hybrids). The B1 level fails every rate but 1/1024 too (least fidelity 0.994, 0.984, 0.996, 0.981).
//  - H4 was triggered (H1 failed) and was NOT run in this experiment: a corner cost changes the beat and needs its own
//    derivation and gates. DISCLOSED as a deviation from the gate list above; it is the next experiment.
// PROBE AFTER THE RUN STARTED (diagnostic, gates nothing): tmp/turn-probe3-512.log. At D 3, 1/512, from the held 1/1024
// level, a 2048-beat filter (half width 0.012) and a 600-beat Krylov find one Ritz level within 0.06, and its vector
// still has residual 4.2e-4, 24 percent off the line, least fidelity 0.9959 and missed 2.7e-3 per hole. So the failure
// is not the 512-beat filter alone: at 1/512 the composite sits within about 0.01 rad of a bent level (or several) that
// the rate-0 family, read with a 64-beat filter and weights above 1e-5, did not show. The true 2d composite at 1/512 is
// either a hybrid that is wider than radius 4, or a pair closer than 2 pi / 2048 = 0.003 rad that nothing here resolves.
//
// Depth L2: a stand-in (floats, the holes' beat derived from the rule's pieces, the register replaced by the Steiner
// length, the geometry cut to a slab). DETERMINISM: no random numbers; every start is placed, filtered or followed.
// NOTHING MOVES: the cost is a phase, the coin, the contact and the mixer hand values between slots of one dock, the
// stream takes each value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import { ritzLevels, type Ritz } from '@/code/measure/frame-meson'
import {
  addSlab,
  antisymmetryGap,
  innerSlab,
  offLineSlab,
  placeLine,
  slabBeat,
  slabLevelVector,
  slabSpace,
  steinerShells,
  thetaOfRate,
  weightOfSlab,
  type SlabSpace,
  type SlabSpec,
  type SlabState,
} from '@/code/measure/slab-holes'
import {
  holesOutside,
  registerMissed,
  watchHold,
} from '@/code/measure/slab-string-break'
import {
  actSymmetry,
  characterOf,
  followLevel,
  levelResidual,
  normalizeSlab,
  sectorProject,
  slabPerms,
  turnedTensor,
  uniformCount,
  type SlabPerms,
  type SlabSector,
} from '@/code/measure/slab-turned-level'

type C = [number, number]

const CUT: Record<number, number> = { 3: 12, 6: 16 }
const CUT_SMALL = 12
const GATE_RATES = [1 / 1024, 1 / 512, 1 / 256, 1 / 128, 1 / 64]
const MORE_RATES = [1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 3]
const TENSOR_RATES: Record<number, number[]> = {
  3: [1 / 1024, 1 / 256, 1 / 64],
  6: [1 / 1024, 1 / 64],
}
const FILTER_T = 512
const RITZ_T = 240
const FAMILY_FILTER_T = 64
const FAMILY_RITZ_T = 400
const FAMILY_BAND = 0.4
const FAMILY_WEIGHT = 1e-5
const REFINE = 1e-4
const HOLD_BEATS = 128
const FIDELITY = 0.999
const WINDOW = 1e-3
const RADIUS = 4
const EDGE = 2
const ADEQUATE = 1e-4
const COUPLED = 0.01
const DISTINCT = 1e-3
const KAPPA = Math.PI / 32
const TENSOR_T = 240
const ISOTROPY = 0.8
const ENERGY_FACTOR = 2
const LINE_SAME = 1e-5
const REST_RESIDUAL = 1e-6
const SYMMETRY_SAME = 1e-12
const CHARACTER_SAME = 1e-9
const ANTI_SAME = 1e-10
const HOLES = 3
const A1: SlabSector = { x: 1, y: 1, swap: 1 }
const B1: SlabSector = { x: 1, y: 1, swap: -1 }

const ritz = (c: readonly C[]): Ritz[] => ritzLevels(c)
const wrap = (x: number): number =>
  x - 2 * Math.PI * Math.round(x / (2 * Math.PI))
const at = (space: SlabSpace, rate: number): SlabSpace => ({
  ...space,
  spec: { ...space.spec, rate },
})
const scale = (s: SlabState, f: number): SlabState => ({
  re: s.re.map(v => v * f),
  im: s.im.map(v => v * f),
})

type Point = {
  D: number
  cut: number
  sector: string
  rate: number
  energy: number
  slope: number
  residual: number
  passes: number
  minFidelity: number
  maxMissed: number
  maxTail: number
  edge: number
  offLine: number
  restFidelity: number
  eigen: boolean
  window: boolean
  held: boolean
  characterGap: number
  antisymmetry: number
  gapNear: number
  vector: SlabState
}

type Family = {
  dE: number
  modulus: number
  slope: number
  coupling: number
  offLine: number
  missed: number
  residual: number
}

export default experiment({
  id: 'spin/slab-turned-composite',
  code: 'E-SPN-0144',
  title:
    "the mixer-on eigenlevel of three holes on the slab holds only at the smallest rates, fail (H1, H2, H3): the frame mixer is exactly exp(-i theta N_u), so the level's slope is <N_u> (0.693 at D 3, 0.649 at D 6, read back to 1e-3 at 1/1024); in the square's A1 sector the level built at each rate holds at D 3 on 1/1024 only (least fidelity 0.99972, missed register per hole 3.9e-4 at radius 4, where E-SPN-0141's rate-0 reference read 0.9898) and at D 6 on the enlarged w 16 window (7.2e6 amplitudes) at 1/1024 and 1/512 (0.99993, 0.99989), while on w 12 D 6 holds nowhere (missed 2.2e-3 and up); from 1/512 (D 3) and 1/256 (D 6) the follower returns no eigenlevel (residual 1e-3 to 4e-3 after two passes, 10 to 38 percent off the line, least fidelity 0.79 to 0.995), and a 2048-beat filter at D 3 1/512 still leaves residual 4e-4 and 24 percent off-line: the composite meets bent levels closer than 0.01 rad, which the rate-0 family (nearest coupled level 0.040 away, predicted smooth to rate 1/16) did not resolve; the A1 and B1 (swap-odd) levels split by 2.7e-6 at 1/1024, the third order predicted; at D 6 1/1024 the inertia is m* 47.3, m*/E_rest 463, isotropy 0.90 (D4 makes it 1 exactly), and the D 3 tensor read is not a level (residual 0.62); the rate-0 level watched at 1/64 fails the witness (0.908), so the witness can fail",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const points: Point[] = []
    const families: Record<number, Family[]> = {}
    const rest: Record<
      number,
      {
        energy: number
        line: number
        residual: number
        slope: number
        held: boolean
        vector: SlabState
      }
    > = {}
    const symmetryGaps: number[] = []

    let negative = { minFidelity: Number.NaN, held: true }

    // one level at one rate, read and watched
    const readLevel = (
      space: SlabSpace,
      perms: SlabPerms,
      sector: SlabSector,
      name: string,
      D: number,
      rate: number,
      start: SlabState,
      E: number,
      reference: SlabState,
      v0: SlabState,
      outside: Uint8Array,
    ): Point => {
      const s = at(space, rate)

      let f = followLevel(s, [0, 0], start, {
        E,
        filterBeats: FILTER_T,
        ritzBeats: RITZ_T,
        reference,
        ritz,
      })
      let v = normalizeSlab(sectorProject(perms, f.vector, sector))
      let r = levelResidual(s, [0, 0], v)
      let passes = 1

      if (r.residual > REFINE) {
        f = followLevel(s, [0, 0], v, {
          E: r.energy,
          filterBeats: FILTER_T,
          ritzBeats: RITZ_T,
          reference: v,
          ritz,
        })
        v = normalizeSlab(sectorProject(perms, f.vector, sector))
        r = levelResidual(s, [0, 0], v)
        passes = 2
      }

      const cut = space.spec.cut
      const w = watchHold(s, v, HOLD_BEATS, cut - EDGE, [outside])
      const missed = w.missed[0]!.map(m => m / HOLES)
      const shells = steinerShells(s, v)
      const [or, oi] = innerSlab(v0, v)
      const slope = innerSlab(v, uniformCount(s, v))[0]
      const minFidelity = Math.min(...w.fidelity)
      const maxMissed = Math.max(...missed)
      const eigen = minFidelity >= FIDELITY
      const window = maxMissed <= WINDOW
      const chosen = f.levels[f.chosen]
      const others = f.levels.filter(
        (l, k) =>
          k !== f.chosen &&
          l.weight > FAMILY_WEIGHT &&
          chosen !== undefined,
      )
      const gapNear =
        others.length === 0
          ? Number.NaN
          : Math.min(
              ...others.map(l =>
                Math.abs(
                  wrap(
                    l.energy - (chosen as { energy: number }).energy,
                  ),
                ),
              ),
            )
      // read on the followed vector BEFORE its projection: the beat must keep the sector by itself
      const raw = f.vector
      const characterGap = Math.max(
        Math.abs(characterOf(perms.x, raw)[0] - sector.x),
        Math.abs(characterOf(perms.y, raw)[0] - sector.y),
        sector.swap === undefined
          ? 0
          : Math.abs(characterOf(perms.swap, raw)[0] - sector.swap),
      )
      const p: Point = {
        D,
        cut,
        sector: name,
        rate,
        energy: r.energy,
        slope,
        residual: r.residual,
        passes,
        minFidelity,
        maxMissed,
        maxTail: Math.max(...w.tail),
        edge: shells.slice(cut - EDGE).reduce((x, y) => x + y, 0),
        offLine: offLineSlab(s, v),
        restFidelity: or * or + oi * oi,
        eigen,
        window,
        held: eigen && window,
        characterGap,
        antisymmetry: antisymmetryGap(s, v),
        gapNear,
        vector: v,
      }

      log(
        `D ${D} w ${cut} ${name} rate ${rate}: E ${r.energy} slope ${slope} residual ${r.residual.toExponential(2)} passes ${passes} fidelity ${minFidelity} missed ${maxMissed.toExponential(2)} edge ${p.edge.toExponential(2)} offline ${p.offLine.toFixed(4)} rest ${p.restFidelity.toFixed(5)} near ${gapNear}`,
      )

      return p
    }

    // follow a level up a list of rates from (v, E, slope) at rate r0; stop at the first non-held rate when asked
    const chain = (
      space: SlabSpace,
      perms: SlabPerms,
      sector: SlabSector,
      name: string,
      D: number,
      from: { v: SlabState; E: number; slope: number; rate: number },
      rates: readonly number[],
      stop: boolean,
      v0: SlabState,
      outside: Uint8Array,
    ): Point[] => {
      const out: Point[] = []

      let cur = from

      for (const rate of rates) {
        const E =
          cur.E +
          cur.slope * (thetaOfRate(rate) - thetaOfRate(cur.rate))
        const p = readLevel(
          space,
          perms,
          sector,
          name,
          D,
          rate,
          cur.v,
          E,
          cur.v,
          v0,
          outside,
        )

        out.push(p)
        cur = { v: p.vector, E: p.energy, slope: p.slope, rate }

        if (stop && !p.held) {
          break
        }
      }

      return out
    }

    const levelsAt = (
      D: number,
      cut: number,
    ): {
      space: SlabSpace
      perms: SlabPerms
      lx: SlabState
      ly: SlabState
      line: number
    } => {
      const spec: SlabSpec = {
        holes: HOLES,
        axes: 2,
        cut,
        rate: 0,
        D,
        cost: 'steiner',
        boundary: 'absorb',
      }
      const space = slabSpace(spec)
      const sector: LineSector = {
        flavors: [0, 0, 0],
        statistics: 'fermion',
        D,
        box: CUT_SMALL,
        unit: 0,
      }
      const basis = lineBasis(sector)
      const line = lineLightest(basis, wholeBasis(basis)).lightest
      const entries = basis.configs.map((ts, i) => ({
        ts,
        amp: [line.cre[i]!, line.cim[i]!] as C,
      }))

      return {
        space,
        perms: slabPerms(space),
        lx: placeLine(space, 0, entries),
        ly: placeLine(space, 1, entries),
        line: line.energy,
      }
    }

    const restLevel = (
      space: SlabSpace,
      perms: SlabPerms,
      sector: SlabSector,
      placed: SlabState,
      line: number,
    ): {
      v: SlabState
      energy: number
      residual: number
      slope: number
    } => {
      let f = followLevel(space, [0, 0], placed, {
        E: line,
        filterBeats: FILTER_T,
        ritzBeats: RITZ_T,
        reference: placed,
        ritz,
      })
      let v = normalizeSlab(sectorProject(perms, f.vector, sector))
      let r = levelResidual(space, [0, 0], v)

      if (r.residual > REFINE) {
        f = followLevel(space, [0, 0], v, {
          E: r.energy,
          filterBeats: FILTER_T,
          ritzBeats: RITZ_T,
          reference: v,
          ritz,
        })
        v = normalizeSlab(sectorProject(perms, f.vector, sector))
        r = levelResidual(space, [0, 0], v)
      }

      return {
        v,
        energy: r.energy,
        residual: r.residual,
        slope: innerSlab(v, uniformCount(space, v))[0],
      }
    }

    // the rate-0 family the mixer reaches from v0 to second order: long-lived levels in the band, their slopes and
    // couplings (the prediction's inputs, recomputed here as they were read before the run)
    const familyOf = (
      space: SlabSpace,
      perms: SlabPerms,
      v0: SlabState,
      E0: number,
      outside: Uint8Array,
    ): Family[] => {
      const s = normalizeSlab(
        sectorProject(
          perms,
          uniformCount(space, uniformCount(space, v0)),
          A1,
        ),
      )
      const f = followLevel(space, [0, 0], s, {
        E: E0,
        filterBeats: FAMILY_FILTER_T,
        ritzBeats: FAMILY_RITZ_T,
        reference: v0,
        ritz,
      })
      const Nv0 = uniformCount(space, v0)

      return f.levels
        .filter(
          l =>
            Math.abs(wrap(l.energy - E0)) < FAMILY_BAND &&
            l.weight > FAMILY_WEIGHT,
        )
        .map(l => {
          const v = slabLevelVector(
            space,
            [0, 0],
            f.filtered,
            l.coefficients,
          )
          const r = levelResidual(space, [0, 0], v)
          const g = innerSlab(v, Nv0)

          return {
            dE: wrap(r.energy - E0),
            modulus: Math.hypot(...r.lambda),
            slope: innerSlab(v, uniformCount(space, v))[0],
            coupling: Math.hypot(...g),
            offLine: offLineSlab(space, v),
            missed: registerMissed(space, v, outside) / HOLES,
            residual: r.residual,
          }
        })
        .sort((a, b) => a.dE - b.dE)
    }

    // nondegenerate perturbation theory within the family: the level takes weight (theta g_k / dE_k)^2 from each bent
    // level k, and with it that level's loss over the hold, 1 - |lambda_k|^(2 HOLD_BEATS); the hold's eigen clause fails
    // where the summed loss reaches 1 - FIDELITY. The gap is the nearest family level with coupling at least 0.01
    const predicted: Record<
      number,
      {
        gap: number
        lossCoefficient: number
        thetaC: number
        rateC: number
      }
    > = {}

    const predictionOf = (
      fam: readonly Family[],
    ): {
      gap: number
      lossCoefficient: number
      thetaC: number
      rateC: number
    } => {
      const coupled = fam.filter(
        f => f.coupling >= COUPLED && Math.abs(f.dE) > DISTINCT,
      )
      const lossCoefficient = coupled.reduce(
        (x, f) =>
          x +
          (f.coupling / f.dE) ** 2 *
            (1 - f.modulus ** (2 * HOLD_BEATS)),
        0,
      )
      const thetaC = Math.sqrt((1 - FIDELITY) / lossCoefficient)

      return {
        gap: Math.min(...coupled.map(f => Math.abs(f.dE))),
        lossCoefficient,
        thetaC,
        rateC: 2 - 2 * Math.cos(thetaC),
      }
    }

    const tensors: {
      D: number
      rate: number
      xx: number
      yy: number
      xy: number
      eigen: [number, number]
      mStar: number
      eRest: number
      ratio: number
      isotropy: number
      worstResidual: number
      leastWeight: number
    }[] = []
    const partner: { rate: number; split: number; held: boolean }[] = []
    const small: Point[] = []

    for (const D of [3, 6]) {
      const cut = CUT[D]!
      const { space, perms, lx, ly, line } = levelsAt(D, cut)
      const outside = holesOutside(space, RADIUS)
      const placedA = normalizeSlab(
        sectorProject(perms, addSlab(lx, ly), A1),
      )

      // symmetry check: each operation commutes with one beat at rate 1/64 on the placed x-line
      const s64 = at(space, 1 / 64)

      for (const g of [perms.x, perms.y, perms.swap]) {
        const a = actSymmetry(
          g,
          slabBeat(s64, [0, 0], normalizeSlab(lx), { escaped: 0 }),
        )
        const b = slabBeat(
          s64,
          [0, 0],
          actSymmetry(g, normalizeSlab(lx)),
          { escaped: 0 },
        )

        symmetryGaps.push(
          Math.sqrt(weightOfSlab(addSlab(a, scale(b, -1)))),
        )
      }

      const r0 = restLevel(space, perms, A1, placedA, line)
      const w0 = watchHold(space, r0.v, HOLD_BEATS, cut - EDGE, [
        outside,
      ])

      rest[D] = {
        energy: r0.energy,
        line,
        residual: r0.residual,
        slope: r0.slope,
        held:
          Math.min(...w0.fidelity) >= FIDELITY &&
          Math.max(...w0.missed[0]!) / HOLES <= WINDOW,
        vector: r0.v,
      }

      log(
        `D ${D} rest: E ${r0.energy} line ${line} residual ${r0.residual} slope ${r0.slope}`,
      )
      families[D] = familyOf(space, perms, r0.v, r0.energy, outside)
      predicted[D] = predictionOf(families[D])
      log(
        `D ${D} family ${JSON.stringify(families[D])} prediction ${JSON.stringify(predicted[D])}`,
      )

      if (D === 3) {
        // the negative control: the rate-0 level watched under the mixer at 1/64 is not a level there
        const wn = watchHold(s64, r0.v, HOLD_BEATS, cut - EDGE, [
          outside,
        ])

        negative = {
          minFidelity: Math.min(...wn.fidelity),
          held:
            Math.min(...wn.fidelity) >= FIDELITY &&
            Math.max(...wn.missed[0]!) / HOLES <= WINDOW,
        }
      }

      const gate = chain(
        space,
        perms,
        A1,
        'A1',
        D,
        { v: r0.v, E: r0.energy, slope: r0.slope, rate: 0 },
        GATE_RATES,
        false,
        r0.v,
        outside,
      )

      points.push(...gate)

      const last = gate[gate.length - 1]!

      if (gate.every(p => p.held)) {
        points.push(
          ...chain(
            space,
            perms,
            A1,
            'A1',
            D,
            {
              v: last.vector,
              E: last.energy,
              slope: last.slope,
              rate: last.rate,
            },
            MORE_RATES,
            true,
            r0.v,
            outside,
          ),
        )
      }

      // the swap-odd partner at D 3: its splitting from the A1 level
      if (D === 3) {
        const placedB = normalizeSlab(
          sectorProject(perms, addSlab(lx, scale(ly, -1)), B1),
        )
        const rb = restLevel(space, perms, B1, placedB, line)
        const odd = chain(
          space,
          perms,
          B1,
          'B1',
          D,
          { v: rb.v, E: rb.energy, slope: rb.slope, rate: 0 },
          GATE_RATES,
          false,
          rb.v,
          outside,
        )

        odd.forEach((p, k) =>
          partner.push({
            rate: p.rate,
            split: wrap(p.energy - gate[k]!.energy),
            held: p.held,
          }),
        )

        for (const p of odd) {
          p.vector = {
            re: new Float64Array(0),
            im: new Float64Array(0),
          }
        }
      }

      // H3: the inertia at the held tensor rates
      for (const rate of TENSOR_RATES[D]!) {
        const p = points.find(
          q =>
            q.D === D &&
            q.sector === 'A1' &&
            q.rate === rate &&
            q.cut === cut,
        )

        if (!p?.held) {
          continue
        }

        const t = turnedTensor(
          at(space, rate),
          p.vector,
          p.energy,
          KAPPA,
          TENSOR_T,
          ritz,
        )
        const mean = (t.xx + t.yy) / 2
        const mStar = 1 / Math.abs(t.xx)
        const eRest = Math.abs(p.energy)

        tensors.push({
          D,
          rate,
          xx: t.xx,
          yy: t.yy,
          xy: t.xy,
          eigen: t.eigen,
          mStar,
          eRest,
          ratio: mStar / eRest,
          isotropy:
            Math.min(Math.abs(t.eigen[0]), Math.abs(t.eigen[1])) /
            Math.max(Math.abs(t.eigen[0]), Math.abs(t.eigen[1])),
          worstResidual: t.worstResidual,
          leastWeight: t.leastWeight,
        })
        void mean
        log(
          `D ${D} tensor at ${rate}: ${JSON.stringify(tensors[tensors.length - 1])}`,
        )
      }

      for (const p of points) {
        if (p.D === D) {
          p.vector = {
            re: new Float64Array(0),
            im: new Float64Array(0),
          }
        }
      }

      rest[D].vector = {
        re: new Float64Array(0),
        im: new Float64Array(0),
      }

      // the w 12 window at D 6, read the same way, for the window's effect
      if (D === 6) {
        const sm = levelsAt(6, CUT_SMALL)
        const outSmall = holesOutside(sm.space, RADIUS)
        const placedSmall = normalizeSlab(
          sectorProject(sm.perms, addSlab(sm.lx, sm.ly), A1),
        )
        const rs = restLevel(
          sm.space,
          sm.perms,
          A1,
          placedSmall,
          sm.line,
        )

        small.push(
          ...chain(
            sm.space,
            sm.perms,
            A1,
            'A1',
            6,
            { v: rs.v, E: rs.energy, slope: rs.slope, rate: 0 },
            GATE_RATES,
            false,
            rs.v,
            outSmall,
          ),
        )

        for (const p of small) {
          p.vector = {
            re: new Float64Array(0),
            im: new Float64Array(0),
          }
        }
      }
    }

    // ---- gates ----
    const gatePoints = (D: number): Point[] =>
      points.filter(
        p =>
          p.D === D && p.sector === 'A1' && GATE_RATES.includes(p.rate),
      )
    const heldRates = (D: number): number[] =>
      points
        .filter(p => p.D === D && p.sector === 'A1' && p.held)
        .map(p => p.rate)

    const highest = (D: number): number => {
      const hs = heldRates(D)

      return hs.length === 0 ? Number.NaN : Math.max(...hs)
    }

    const H1 =
      gatePoints(3).length === GATE_RATES.length &&
      gatePoints(3).every(p => p.held)
    const adequate = gatePoints(6).every(p => p.edge <= ADEQUATE)
    const H2 =
      adequate &&
      gatePoints(6).length === GATE_RATES.length &&
      gatePoints(6).every(p => p.held)
    const H3 =
      tensors.length > 0 &&
      tensors.every(
        t =>
          t.eigen[0] * t.eigen[1] > 0 &&
          t.isotropy >= ISOTROPY &&
          t.ratio <= ENERGY_FACTOR &&
          t.ratio >= 1 / ENERGY_FACTOR,
      )

    // ---- controls and checks ----
    const CR = [3, 6].every(
      D =>
        Math.abs(
          (rest[D] as { energy: number }).energy -
            (rest[D] as { line: number }).line,
        ) <= LINE_SAME &&
        (rest[D] as { residual: number }).residual <= REST_RESIDUAL &&
        (rest[D] as { held: boolean }).held,
    )
    const CN = !negative.held
    const symmetryGap = Math.max(...symmetryGaps)
    const characterGap = Math.max(...points.map(p => p.characterGap))
    const antiGap = Math.max(...points.map(p => p.antisymmetry))
    const checked =
      symmetryGap <= SYMMETRY_SAME &&
      characterGap <= CHARACTER_SAME &&
      antiGap <= ANTI_SAME
    const status =
      !CR || !CN || !checked
        ? 'partial'
        : H1 && H2 && H3
          ? 'pass'
          : 'fail'

    // ---- report ----
    const rateName = (r: number): string =>
      r === 0 ? '0' : r >= 1 ? `${r}` : `1/${Math.round(1 / r)}`
    const pointText = (p: Point): string =>
      `D ${p.D} w ${p.cut} ${p.sector} rate ${rateName(p.rate)}: ${p.held ? 'HELD' : 'not held'} E ${p.energy.toFixed(6)} slope ${p.slope.toFixed(4)} residual ${p.residual.toExponential(2)} (${p.passes} pass) least fidelity ${p.minFidelity.toPrecision(6)} missed ${p.maxMissed.toExponential(2)} tail ${p.maxTail.toExponential(2)} edge ${p.edge.toExponential(2)} off line ${p.offLine.toFixed(4)} fidelity to rest ${p.restFidelity.toFixed(5)} nearest Ritz ${p.gapNear.toFixed(4)}`
    const metrics: Record<string, number> = {
      H1: H1 ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      adequateD6: adequate ? 1 : 0,
      highestHeldD3: highest(3),
      highestHeldD6: highest(6),
      control_CR: CR ? 1 : 0,
      control_CN: CN ? 1 : 0,
      negativeMinFidelity: negative.minFidelity,
      checked: checked ? 1 : 0,
      symmetryGap,
      characterGap,
      antiGap,
      seconds: (Date.now() - started) / 1000,
    }

    for (const D of [3, 6]) {
      const r = rest[D] as {
        energy: number
        slope: number
        residual: number
      }

      metrics[`restD${D}Energy`] = r.energy
      metrics[`restD${D}Slope`] = r.slope
      metrics[`restD${D}Residual`] = r.residual
      metrics[`familyD${D}Size`] = families[D]!.length
      metrics[`predictedD${D}Gap`] = predicted[D]!.gap
      metrics[`predictedD${D}LossCoefficient`] =
        predicted[D]!.lossCoefficient
      metrics[`predictedD${D}RateC`] = predicted[D]!.rateC
    }

    for (const p of [...points, ...small]) {
      const key = `D${p.D}w${p.cut}${p.sector}r${rateName(p.rate).replace('/', '_')}`

      metrics[`${key}Held`] = p.held ? 1 : 0
      metrics[`${key}Energy`] = p.energy
      metrics[`${key}Residual`] = p.residual
      metrics[`${key}MinFidelity`] = p.minFidelity
      metrics[`${key}Missed`] = p.maxMissed
      metrics[`${key}Edge`] = p.edge
      metrics[`${key}OffLine`] = p.offLine
    }

    for (const t of tensors) {
      const key = `tensorD${t.D}r${rateName(t.rate).replace('/', '_')}`

      metrics[`${key}Xx`] = t.xx
      metrics[`${key}Yy`] = t.yy
      metrics[`${key}Xy`] = t.xy
      metrics[`${key}MStar`] = t.mStar
      metrics[`${key}Ratio`] = t.ratio
      metrics[`${key}Isotropy`] = t.isotropy
    }

    for (const q of partner) {
      metrics[`splitD3r${rateName(q.rate).replace('/', '_')}`] = q.split
    }

    const heldMap = [3, 6]
      .map(
        D =>
          `D ${D}: ${points
            .filter(p => p.D === D && p.sector === 'A1')
            .map(p => `${rateName(p.rate)} ${p.held ? 'H' : '-'}`)
            .join(' ')}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `the mixer-on eigenlevel of three holes on the slab (A1 sector, followed from the line level): ${heldMap}; highest held rate D 3 ${rateName(highest(3))}, D 6 ${rateName(highest(6))} (w ${CUT[6]}, adequate ${adequate}); tensors ${tensors.map(t => `D ${t.D} ${rateName(t.rate)} m* ${t.mStar.toFixed(2)} m*/E ${t.ratio.toFixed(2)} isotropy ${t.isotropy.toFixed(3)}`).join(', ')}; H1 ${H1}, H2 ${H2}, H3 ${H3}; CR ${CR}, CN ${CN} (rate-0 level at 1/64 least fidelity ${negative.minFidelity.toFixed(4)})`,
      metrics,
      control: {
        negativeMinFidelity: negative.minFidelity,
        restD3Energy: (rest[3] as { energy: number }).energy,
        restD6Energy: (rest[6] as { energy: number }).energy,
      },
      notes: `L2. Points: ${[...points, ...small].map(pointText).join('; ')}. Families: ${[3, 6].map(D => `D ${D} ${families[D]!.map(f => `dE ${f.dE.toFixed(4)} |lam| ${f.modulus.toFixed(6)} slope ${f.slope.toFixed(3)} g ${f.coupling.toFixed(4)} off ${f.offLine.toFixed(3)} missed ${f.missed.toExponential(1)}`).join(', ')}`).join('; ')}. A1-B1 split at D 3: ${partner.map(q => `${rateName(q.rate)} ${q.split.toExponential(3)}${q.held ? ' H' : ''}`).join(', ')}. Checks: symmetry ${symmetryGap.toExponential(2)}, character ${characterGap.toExponential(2)}, antisymmetry ${antiGap.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
