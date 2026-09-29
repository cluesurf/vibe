// THREE HOLES ON A SLAB OF THE HUSK: DOES THE STRING HOLD THEM WHILE THEY TURN (E-SPN-0135)? note/research/vibe/roadmap/
// remaining-pieces.md, "The Pauli-blocked mixer (E-SPN-0130)" and "The link holonomy (E-SPN-0132)". The candidate rule
// for 3d motion is flat links, the filled love sea as the vacuum and E-SPN-0130's fermionic frame mixer at the working
// angle: a lone hole then moves freely and isotropically (inverse mass -0.2887 I). E-SPN-0132 found the sea's smallest
// string-bound neutral composite is THREE HOLES, the particle-hole image of E-SPN-0104's three-love level, and left Q3b
// open because its 4d window is 2.8e9 amplitudes. This file decides Q3b on the smallest geometry that still tests
// TURNING.
//
// DERIVED BEFORE THE RUN.
// 1. THE SMALLEST GEOMETRY. A vibe keeps its frame forever (the mixer turns it among its frame's slots, the coin on its
//    line, the stream along its slot's root), so each hole walks the frame lattice Z^4 of four orthogonal roots
//    (E-SPN-0121/0131). One line gives motion along one direction. A turn needs a second line of the SAME frame, since no
//    piece moves a vibe between frames, and two lines of one frame are orthogonal roots, so two independent directions.
//    The smallest geometry is therefore a SLAB: two lines of one frame (the plane of two line classes, positions on Z^2),
//    four slots a dock, and the frame mixer M = exp(i theta N_u) with u uniform over those four slots, so that it turns
//    only within the plane. It is a reduced model, not a cut of the 4d one: the 4d mixer's uniform mode spans eight
//    slots, so the slab's hop amplitude is |e^(i theta) - 1| / 4 = 0.433 at the working angle against 0.217 in 4d,
//    turning HARDER per beat, and a lone hole's inverse mass is c/2 I in the slab against c/4 I in 4d (c one line's).
//    WINDOW (route-free, the Steiner length V at most w; per axis a triple of spread s is 1 way for s = 0 and 6 s
//    otherwise, code/measure/slab-holes steinerWindow): the slab at w = 12 is 36,973 anchored position triples x 4^3 slot
//    triples = 2,366,272 first-quantized amplitudes (about a sixth of them independent after antisymmetry); at w = 10,
//    E-SPN-0132's reach, 18,481 x 64; the 4d window there is 5,482,753 x 512 (2.8e9); the one line at w = 12 is 469 x 8.
// 2. THE PARTICLE-HOLE IMAGE (code/measure/slab-holes header, derived there and executed by holeDock): relative to the
//    full sea a hole evolves under sigma_z u sigma_z / phi2 (u the coin, phi2 a full line's phase w^2), two holes on a
//    line take the loves' own contact g = phi2 / det u = w, and a hole under the mixer takes conj(M_theta) = I +
//    (e^(-i theta) - 1) J / 4, one-body. So the three-hole beat on one line with the mixer off is phi2^(-3) G U_love G^-1
//    = G U_love G^-1 (phi2^3 = w^6 = 1), G the sign (-1)^(holes on a back slot): E-SPN-0104's level carried by G is an
//    eigenvector of the holes' beat with the same energy 0.33002, and its band is E-SPN-0105's, so m*/E_rest is 73.
//    E-SPN-0115's meson has NO image here: the love sea holds no opposite charge of a hole (E-SPN-0132 B0), so the
//    one-line limit reproduces E-SPN-0104 and 0105, and carries over only E-SPN-0115's way of reading m*/E_rest.
//    The reflecting box E-SPN-0104's operator uses flips every label, which changes G by (-1)^3, so the one-line
//    comparison uses that wall carried through G (code/measure/slab-holes 'reflect').
// 3. THE COST: ROUTE-FREE (the Steiner length), not the recorded register. E-SPN-0131 found the recorded register
//    unbinds a turned pair at every angle (a route record decoheres the interference that binds) and the route-free
//    cost nearly holds at small angles. For three Z3 charges of -1 the fewest links a Gauss-fixed string needs is the
//    Steiner tree joining the three docks (the baryon's Y), which for three points on a hypercubic lattice is the
//    bounding box's half perimeter, and on one line the span: E-SPN-0104's cost exactly. N = 2 D + 1 = 7 (D = 3, E-SPN-
//    0104's), so a link costs pi/7 a beat, twice E-SPN-0131's pi/13. The price is E-SPN-0131's: the phase is read from
//    all three positions at once.
// 4. A LONE HOLE IN THE SLAB (the calibration): at K = 0 each line's symmetric state sits at the coin's eigenvalue and
//    the mixer moves only their uniform sum, so to second order in K the edge level is c (K_a^2 + K_b^2) / 2 on the one
//    state orthogonal to the uniform one: the tensor is (c/2) I, c = one line's curvature (-1/sqrt 3 per dock step for a
//    hole), -0.288675 I, isotropic at every theta other than 0.
//
// THE READING. The level: the start is E-SPN-0104's level (code/measure/coined-line-bloch lineLightest, box 12) carried
// by G onto each of the slab's two lines, summed and normalized. The Ritz levels of the beat at K = 0 are read from the
// start's autocorrelation over 120 beats (code/measure/frame-meson ritzLevels, as E-SPN-0131), the dominant one by start
// weight, its vector built, and evolved. The curvature: second differences of the dominant Ritz energy at +-kappa,
// T = 240 beats, the level vector as the start. Calibrated on the one line before any gated run (tmp/holes3-probe3.log):
// on the exact reflecting box, T = 120 reads E''(0) 1% low (0.04097) and T = 240 reads 0.041426 at pi/64 and 0.041305
// at pi/32, Richardson 0.041466, E-SPN-0105's number; through an absorbing window of 12 the step pi/64 reads 3% high
// (leak) and pi/32 0.4%, so H2 reads at kappa = pi/32 on the w = 12 window and H3 reads Richardson on the exact box.
//
// GATES, fixed before the gated run. Window w = 12 (absorbing, escaped weight counted), D = 3, the passing contact.
//  H1 at the working angle (rate 3, theta = 2 pi / 3): the dominant level, evolved 128 beats, keeps fidelity
//     |<v|U^t v>|^2 >= 0.99 AND tail (escaped + weight at V >= 10) <= 1e-3 at EVERY beat. If it fails, the rates 2, 1,
//     1/2, 1/4, 1/8, 1/16 are run in that order and the first that holds is reported as the largest angle that holds.
//  H2 (only if H1 holds at rate 3): the 2 x 2 inverse mass tensor d2E/dK_a dK_b (kappa pi/32, T 240, along e_x, e_y,
//     (e_x + e_y)/sqrt 2) has both eigenvalues of one sign, each at least 0.1 x |c_1| / 2 in size (c_1 H3's one-line
//     curvature; 1/2 the lone hole's share of the line in the slab, point 4). Tensor and isotropy lambda_min/lambda_max
//     reported.
//  H3 one line, mixer off, E-SPN-0104's box (the reflecting wall through G): the carried level's residual under the
//     holes' beat <= 1e-12 and its energy within 1e-9 of 0.33001851839229945; its Richardson curvature (kappa pi/64,
//     T 240) equals the loves' read the same way on coined-line-bloch's operator to 1e-6 relative, and m* = 1/E'' is
//     within 0.01 of E-SPN-0105's 24.12; m*/E_rest reported.
// CONTROLS (a failed control makes the verdict partial).
//  CN the cost off (V read as 0): the H1 procedure does NOT hold, at rate 0 and at the reported rate (rate 3 if H1
//     holds, else the largest held rate, if any).
//  C0 the mixer off (rate 0), the slab, the start on ONE line: its weight off that line stays <= 1e-14 at every beat,
//     the dominant level holds by H1's criteria, its energy equals the one-line window's (w = 12, absorbing) to 1e-12,
//     and its curvature across the line is 0 to 1e-9: the trio is a one-line level.
// CHECKS (a failed check makes the verdict partial): held + escaped = 1 to 1e-10 and antisymmetry under every exchange
// of hole labels to 1e-12 at the end of every hold; the holes' contact equals the loves' to 1e-15; the lone hole's
// one-line curvature is -1/sqrt 3 to 1e-5 and its slab tensor at rate 3 is c/2 I to 1e-5 relative; the enumerated
// windows equal steinerWindow at w = 12 (slab, line) and steinerWindow(4, 10) equals E-SPN-0132's 5,482,753.
// READ, NOT GATED: the level's energy, start weight, residual, Steiner shells, mean Steiner length and weight off one
// line; the tensor at the largest held rate if H1 fails at rate 3; the tensor at kappa pi/64 beside pi/32.
// Verdict: partial if a control or check fails; pass if H1, H2 and H3 hold; fail otherwise.
//
// DISCLOSED PROBES (instrument only): tmp/holes3-probe1.log (the carried level's energy 0.33001851839229807 against the
// record; the window counts; one slab beat's cost; and, unplanned, 10 beats at rate 3 from a one-line start with
// escaped weight 0.44, seen after H1's thresholds, which the task fixed, and before this file); tmp/holes3-probe2.log
// (the wall through G, residual 3e-14; hole and love curvature equal to 2e-8 at T 120; the lone hole -0.577341 on a
// line, -0.288676 isotropic in the slab at rates 3 and 1; the placed image holds only 0.014 of its weight on the
// line-antisymmetric states, so a branch argument about it was dropped from the module); tmp/holes3-probe3.log (the
// curvature reading above).
//
// FIRST RUN (tmp/holes3-exp-run1.log, 581 s): PARTIAL, no gate moved. H1 and H2 fail, H3 and C0 hold, CN and one check
// fail as written.
//  - H1: at the working angle nothing holds. The dominant Ritz reading is not a level (start weight 0.040, residual
//    0.83, E 2.57), fidelity 0.297 after one beat and 0.00455 by beat 8, tail 0.32 after one beat and 1.00 by beat 64,
//    82% of its weight off one line. The ladder: no rate down to 1/16 holds. Least fidelity and largest tail over 128
//    beats: rate 2 (theta 90 deg) 1e-6 / 0.999, rate 1 (60 deg) 1e-4 / 0.79, 1/2 (41 deg) 0.014 / 0.37, 1/4 (29 deg)
//    0.017 / 0.17, 1/8 (20 deg) 0.18 / 0.079, 1/16 (14.4 deg) 0.69 / 0.033. So no angle tested holds; the smallest,
//    1/16, still loses 31% of the fidelity and puts 3.3% of the weight past Steiner length 10.
//  - H2: not read (no held level); fails with H1.
//  - H3: the carried E-SPN-0104 level is an eigenvector of the holes' one-line beat (residual 2.9e-14), E
//    0.33001851839229795 against 0.33001851839229945; curvature 0.0414669316 (holes) and 0.0414669316 (loves, 1e-11
//    apart), m* 24.1156 against E-SPN-0105's 24.12, m*/E_rest 73.07. The particle-hole image is exact (L1).
//  - C0: with the mixer off the slab start stays on its line exactly (off-line weight 0, curvature across 0), holds
//    (fidelity 0.99999, tail 4.5e-5) and equals the one-line window's level (E 0.3300172637 both; the absorbing window
//    shifts E by 1.3e-6 from the box's).
//  - CN FAILS: with the cost off at rate 0 a level still holds (start weight 0.916, E -0.667, fidelity 0.999999, tail
//    6e-6, mean Steiner 2.33, only even Steiner lengths). Read after the run (tmp/holes3-probe4.log, no gate moved): it
//    is the same at cuts 12, 20, 28 and over 512 beats, and 84% of its weight is two holes on one line-dock with the
//    third two docks away. So the passing contact binds three holes on one line with no string at all, and "cost off,
//    nothing held" is not true there. This does not rescue H1 (at rate 3 nothing holds WITH the cost), but it means the
//    control as written cannot separate the string's binding from the contact's at rate 0. The cost-off control at a
//    held rate was not run, since no rate held.
//  - CHECKS: norm 1.2e-12, antisymmetry 1.2e-14, contact 2.5e-16, phi2^3 = 1, windows as counted (36,973; 18,481 at 10;
//    469; 4d 5,482,753), the slab lone hole -0.288680 and -0.288673, isotropic to 2.5e-5 and half the line's. But the
//    lone-hole line curvature -0.5773406 misses -1/sqrt 3 by 1.7e-5 relative against a 1e-5 tolerance. Read after the
//    run: at kappa 0.005 and 0.0025 it reads -0.5773479 and -0.5773497, so the miss is the second difference's kappa^2
//    term, a tolerance set too tight, not a defect. The check fails as written.
//  So Q3b on the slab: NO. The route-free string at pi/7 a link does not hold three holes that the mixer turns in the
//  plane, at the working angle or at any angle down to 14 degrees. The slab turns harder per beat than 4d (point 1), so
//  this is the stronger mixer's answer; 4d stays unrun. Taken with E-SPN-0131, a string with no route record binds a
//  turned composite only at small angles, and here not even there.
//
// Depth L2: a stand-in (floats, the holes' beat derived from the rule's pieces with the register replaced by the
// Steiner length and the geometry cut to a slab), with controls that can fail. DETERMINISM: no random numbers; every
// start is placed. NOTHING MOVES: the cost is a phase, the coin, the contact and the mixer hand values between slots of
// one dock, the stream takes each value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import { ritzLevels, type Ritz } from '@/code/measure/frame-meson'
import { steinerOffsetPairs } from '@/code/measure/link-holonomy'
import {
  addSlab,
  emptyState,
  energyAtSlab,
  holdLevel,
  holeDock,
  innerSlab,
  loveDock,
  loveLineEnergy,
  normalizedSlab,
  offLineSlab,
  placeLine,
  richardsonCurvature,
  slabBeat,
  slabSpace,
  slabTensor,
  steinerWindow,
  thetaOfRate,
  type SlabHold,
  type SlabSpace,
  type SlabSpec,
  type SlabState,
} from '@/code/measure/slab-holes'

const D = 3
const CUT = 12
const RATE = 3
const LADDER = [2, 1, 0.5, 0.25, 0.125, 0.0625]
const RITZ_T = 120
const CURVE_T = 240
const HOLD_BEATS = 128
const FIDELITY = 0.99
const TAIL = 1e-3
const TAIL_FROM = 10
const KAPPA_SLAB = Math.PI / 32
const KAPPA_LINE = Math.PI / 64
const E_REST = 0.33001851839229945
const M_STAR = 24.12
const M_STAR_SAME = 0.01
const ENERGY_SAME = 1e-9
const RESIDUAL = 1e-12
const CURVE_SAME = 1e-6
const CURVE_SHARE = 0.1
const OFF_LINE = 1e-14
const LEVEL_SAME = 1e-12
const ACROSS = 1e-9
const NORM_SAME = 1e-10
const ANTI_SAME = 1e-12
const CONTACT_SAME = 1e-15
const LONE_SAME = 1e-5
const LONE_KAPPA = 0.01
const REACH_4D = 10
const PAIRS_4D = 5482753

type C = [number, number]

const ritz = (c: readonly C[]): Ritz[] => ritzLevels(c)

export default experiment({
  id: 'spin/slab-three-holes',
  code: 'E-SPN-0135',
  title:
    "three holes in the flat love sea on a slab of the husk (two lines of one frame, the route-free Steiner string at pi/7 a link, the Pauli-blocked mixer turning in the plane) are not held at the working angle nor at any angle down to 14 degrees, partial (H1, H2 fail; CN and one check fail as written): the window is 36,973 x 64 amplitudes against 4d's 2.8e9; the one-line limit is E-SPN-0104's level exactly (residual 3e-14, E 0.3300185184, m* 24.116, m*/E_rest 73.07, the holes' and loves' curvature equal to 1e-11), and with the mixer off the slab trio stays a one-line level; at rate 3 the dominant reading is no level (start weight 0.04, fidelity 0.005 by beat 8, tail 1.00 by beat 64), and least fidelity over 128 beats is 1e-6, 1e-4, 0.014, 0.017, 0.18, 0.69 at rates 2, 1, 1/2, 1/4, 1/8, 1/16; with the cost off at rate 0 a contact-bound three-hole level holds (fidelity 0.999999, mean Steiner 2.33, the same at cuts 12 to 28), so the cost-off control does not read clean; the lone hole reads -0.28868 I in the slab, half its line's",
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
    const spec = (over: Partial<SlabSpec>): SlabSpec => ({
      holes: 3,
      axes: 2,
      cut: CUT,
      rate: RATE,
      D,
      cost: 'steiner',
      boundary: 'absorb',
      ...over,
    })
    const holdInput = {
      ritzBeats: RITZ_T,
      holdBeats: HOLD_BEATS,
      fidelity: FIDELITY,
      tail: TAIL,
      tailFrom: TAIL_FROM,
      ritz,
    }

    // ---- E-SPN-0104's level ----
    const sector: LineSector = {
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D,
      box: CUT,
      unit: 0,
    }
    const basis = lineBasis(sector)
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const entries = basis.configs.map((ts, i) => ({
      ts,
      amp: [level.cre[i]!, level.cim[i]!] as C,
    }))

    log('level')

    // ---- checks: the image's constants, the windows ----
    const hd = holeDock(0)
    const ld = loveDock(0)
    const contactGap = Math.hypot(
      hd.contact[0] - ld.contact[0],
      hd.contact[1] - ld.contact[1],
    )
    const phi3 = [hd.phi2[0], hd.phi2[1]] as C

    let phiCube: C = [1, 0]

    for (let k = 0; k < 3; k++) {
      phiCube = [
        phiCube[0] * phi3[0] - phiCube[1] * phi3[1],
        phiCube[0] * phi3[1] + phiCube[1] * phi3[0],
      ]
    }

    // ---- H3: one line, mixer off, E-SPN-0104's box ----
    const line = slabSpace(
      spec({ axes: 1, rate: 0, boundary: 'reflect' }),
    )
    const carried = placeLine(line, 0, entries)
    const once = slabBeat(
      line,
      [0, 0],
      {
        re: Float64Array.from(carried.re),
        im: Float64Array.from(carried.im),
      },
      { escaped: 0 },
    )
    const lam = innerSlab(carried, once)

    let residual = 0

    for (let k = 0; k < carried.re.length; k++) {
      residual +=
        (once.re[k]! -
          lam[0] * carried.re[k]! +
          lam[1] * carried.im[k]!) **
          2 +
        (once.im[k]! -
          lam[0] * carried.im[k]! -
          lam[1] * carried.re[k]!) **
          2
    }

    residual = Math.sqrt(residual)

    const e3 = -Math.atan2(lam[1], lam[0])
    const holeCurve = richardsonCurvature(
      K => energyAtSlab(line, [K, 0], carried, CURVE_T, ritz),
      KAPPA_LINE,
    )
    const loveCurve = richardsonCurvature(
      K =>
        loveLineEnergy(basis, K, level.cre, level.cim, CURVE_T, ritz),
      KAPPA_LINE,
    )
    const c1 = holeCurve.curvature
    const mStar = 1 / c1
    const H3 =
      residual <= RESIDUAL &&
      Math.abs(e3 - E_REST) <= ENERGY_SAME &&
      Math.abs(c1 - loveCurve.curvature) <=
        CURVE_SAME * Math.abs(loveCurve.curvature) &&
      Math.abs(mStar - M_STAR) <= M_STAR_SAME

    log('H3')

    // ---- the slab ----
    const startOf = (space: SlabSpace, both: boolean): SlabState =>
      both
        ? normalizedSlab(
            addSlab(
              placeLine(space, 0, entries),
              placeLine(space, 1, entries),
            ),
          )
        : normalizedSlab(placeLine(space, 0, entries))
    const slab = slabSpace(spec({}))
    const lineW = slabSpace(spec({ axes: 1, rate: 0 }))
    const windowsOk =
      slab.configs === steinerWindow(2, CUT) &&
      lineW.configs === steinerWindow(1, CUT) &&
      steinerWindow(4, REACH_4D) === steinerOffsetPairs(REACH_4D) &&
      steinerOffsetPairs(REACH_4D) === PAIRS_4D
    const withRate = (
      rate: number,
      cost: 'steiner' | 'none' = 'steiner',
    ): SlabSpace => ({ ...slab, spec: { ...slab.spec, rate, cost } })

    // H1 at the working angle
    const main = holdLevel(
      withRate(RATE),
      startOf(slab, true),
      holdInput,
    )
    const H1 = main.held

    log('H1')

    // the ladder, only if H1 fails
    const ladder: { rate: number; hold: SlabHold }[] = []

    let heldRate: number | undefined = H1 ? RATE : undefined

    if (!H1) {
      for (const rate of LADDER) {
        const h = holdLevel(
          withRate(rate),
          startOf(slab, true),
          holdInput,
        )

        ladder.push({ rate, hold: h })
        log(`ladder ${rate}`)

        if (h.held) {
          heldRate = rate
          break
        }
      }
    }

    // H2 at the working angle (only if H1 holds); the tensor at the held rate is read either way
    const tensorAt = (rate: number, hold: SlabHold, kappa: number) =>
      slabTensor(withRate(rate), hold.vector, kappa, CURVE_T, ritz)
    const heldHold =
      heldRate === undefined
        ? undefined
        : heldRate === RATE
          ? main
          : (
              ladder.find(x => x.rate === heldRate) as {
                hold: SlabHold
              }
            ).hold
    const tensor =
      heldHold && heldRate !== undefined
        ? tensorAt(heldRate, heldHold, KAPPA_SLAB)
        : undefined
    const tensorFine =
      heldHold && heldRate !== undefined
        ? tensorAt(heldRate, heldHold, KAPPA_SLAB / 2)
        : undefined
    const threshold = (CURVE_SHARE * Math.abs(c1)) / 2
    const sameSign =
      tensor !== undefined &&
      Math.sign(tensor.eigen[0]!) === Math.sign(tensor.eigen[1]!) &&
      tensor.eigen[0] !== 0
    const H2 =
      H1 &&
      tensor !== undefined &&
      sameSign &&
      tensor.eigen.every(x => Math.abs(x) >= threshold)
    const isotropy = tensor
      ? Math.min(...tensor.eigen.map(Math.abs)) /
        Math.max(...tensor.eigen.map(Math.abs))
      : Number.NaN

    log('H2')

    // ---- controls ----
    const cn0 = holdLevel(
      withRate(0, 'none'),
      startOf(slab, true),
      holdInput,
    )
    const cnHeld =
      heldRate !== undefined
        ? holdLevel(
            withRate(heldRate, 'none'),
            startOf(slab, true),
            holdInput,
          )
        : undefined
    const CN = !cn0.held && !cnHeld?.held

    log('CN')

    const off0 = withRate(0)
    const oneStart = startOf(slab, false)

    let s = {
      re: Float64Array.from(oneStart.re),
      im: Float64Array.from(oneStart.im),
    }
    let offMax = 0

    for (let t = 0; t < HOLD_BEATS; t++) {
      s = slabBeat(off0, [0, 0], s, { escaped: 0 })
      offMax = Math.max(offMax, offLineSlab(off0, s))
    }

    const c0 = holdLevel(off0, oneStart, holdInput)
    const lineHold = holdLevel(
      lineW,
      normalizedSlab(placeLine(lineW, 0, entries)),
      holdInput,
    )
    const e0 = energyAtSlab(off0, [0, 0], c0.vector, CURVE_T, ritz)
    const across =
      (energyAtSlab(off0, [0, KAPPA_SLAB], c0.vector, CURVE_T, ritz) +
        energyAtSlab(off0, [0, -KAPPA_SLAB], c0.vector, CURVE_T, ritz) -
        2 * e0) /
      (KAPPA_SLAB * KAPPA_SLAB)
    const C0 =
      offMax <= OFF_LINE &&
      c0.held &&
      Math.abs(c0.level.energy - lineHold.level.energy) <= LEVEL_SAME &&
      Math.abs(across) <= ACROSS

    log('C0')

    // ---- the lone hole ----
    const lone = (
      axes: 1 | 2,
      rate: number,
      amps: number[],
    ): { space: SlabSpace; start: SlabState } => {
      const space = slabSpace({
        holes: 1,
        axes,
        cut: 0,
        rate,
        D,
        cost: 'steiner',
        boundary: 'absorb',
      })
      const st = emptyState(space)

      amps.forEach((a, k) => (st.re[k] = a))

      return { space, start: normalizedSlab(st) }
    }

    const l1 = lone(1, 0, [1, 1])
    const le1 = (K: number): number =>
      energyAtSlab(l1.space, [K, 0], l1.start, RITZ_T, ritz)
    const loneLine =
      (le1(LONE_KAPPA) + le1(-LONE_KAPPA) - 2 * le1(0)) /
      LONE_KAPPA ** 2
    const l2 = lone(2, RATE, [1, 1, -1, -1])
    const loneSlab = slabTensor(
      l2.space,
      l2.start,
      LONE_KAPPA,
      RITZ_T,
      ritz,
    )
    const loneOk =
      Math.abs(loneLine + 1 / Math.sqrt(3)) <= LONE_SAME &&
      loneSlab.eigen.every(
        x =>
          Math.abs(x - loneLine / 2) <=
          LONE_SAME * Math.abs(loneLine / 2),
      )

    log('lone')

    const holds = [
      main,
      ...ladder.map(x => x.hold),
      cn0,
      ...(cnHeld ? [cnHeld] : []),
      c0,
      lineHold,
    ]
    const normGap = Math.max(...holds.map(h => h.normGap))
    const antiGap = Math.max(...holds.map(h => h.antisymmetry))
    const checked =
      normGap <= NORM_SAME &&
      antiGap <= ANTI_SAME &&
      contactGap <= CONTACT_SAME &&
      Math.hypot(phiCube[0] - 1, phiCube[1]) <= CONTACT_SAME * 10 &&
      loneOk &&
      windowsOk
    const status =
      !CN || !C0 || !checked
        ? 'partial'
        : H1 && H2 && H3
          ? 'pass'
          : 'fail'

    // ---- report ----
    const at = [1, 8, 32, 64, 128]
    const series = (xs: number[], f: (x: number) => string): string =>
      at.map(t => f(xs[t - 1]!)).join(' ')
    const describe = (name: string, h: SlabHold): string =>
      `${name}: held ${h.held}, level E ${h.level.energy.toFixed(6)} (start weight ${h.level.weight.toFixed(4)}, residual ${h.level.residual.toExponential(2)}), fidelity ${series(h.fidelity, x => x.toFixed(5))} (min ${h.minFidelity.toFixed(5)}), tail ${series(h.tail, x => x.toExponential(2))} (max ${h.maxTail.toExponential(2)}), mean Steiner ${h.meanSteiner.toFixed(3)}, off one line ${h.offLine.toFixed(4)}, shells ${h.shells.map(x => x.toExponential(1)).join('/')}`
    const tensorText = (
      t: ReturnType<typeof slabTensor> | undefined,
    ): string =>
      t
        ? `[[${t.tensor.map(r => r.map(x => x.toFixed(6)).join(', ')).join('], [')}]] eigenvalues ${t.eigen.map(x => x.toFixed(6)).join(', ')}`
        : 'not read'
    const theta = (r: number): string =>
      `${((thetaOfRate(r) * 180) / Math.PI).toFixed(2)} deg`

    const metrics: Record<string, number> = {
      H1: H1 ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      control_CN: CN ? 1 : 0,
      control_C0: C0 ? 1 : 0,
      checked: checked ? 1 : 0,
      heldRate: heldRate ?? -1,
      levelEnergy: main.level.energy,
      levelStartWeight: main.level.weight,
      levelResidual: main.level.residual,
      minFidelity: main.minFidelity,
      maxTail: main.maxTail,
      meanSteiner: main.meanSteiner,
      offLine: main.offLine,
      lineEnergy: e3,
      lineResidual: residual,
      lineCurvature: c1,
      lineCurvatureLove: loveCurve.curvature,
      lineCurvatureAtKappa: holeCurve.at,
      lineCurvatureAtDouble: holeCurve.atDouble,
      mStar,
      mStarOverERest: mStar / E_REST,
      curveThreshold: threshold,
      cnRate0MinFidelity: cn0.minFidelity,
      cnRate0MaxTail: cn0.maxTail,
      c0OffLineMax: offMax,
      c0Energy: c0.level.energy,
      c0LineEnergy: lineHold.level.energy,
      c0Across: across,
      loneLine,
      loneSlabMin: loneSlab.eigen[0]!,
      loneSlabMax: loneSlab.eigen[1]!,
      contactGap,
      normGap,
      antiGap,
      windowSlab: slab.configs,
      windowSlabAmplitudes: slab.configs * slab.block,
      windowSlab10: steinerWindow(2, REACH_4D),
      windowLine: lineW.configs,
      window4d: steinerWindow(4, REACH_4D),
      seconds: (Date.now() - started) / 1000,
    }

    if (tensor) {
      metrics.tensorXX = tensor.tensor[0]![0]!
      metrics.tensorXY = tensor.tensor[0]![1]!
      metrics.tensorYY = tensor.tensor[1]![1]!
      metrics.eigenMin = tensor.eigen[0]!
      metrics.eigenMax = tensor.eigen[1]!
      metrics.isotropy = isotropy
      metrics.tensorEnergy = tensor.energy
    }

    if (tensorFine) {
      metrics.eigenMinFine = tensorFine.eigen[0]!
      metrics.eigenMaxFine = tensorFine.eigen[1]!
    }

    if (cnHeld) {
      metrics.cnHeldMinFidelity = cnHeld.minFidelity
      metrics.cnHeldMaxTail = cnHeld.maxTail
    }

    for (const { rate, hold } of ladder) {
      metrics[`rate${rate}Held`] = hold.held ? 1 : 0
      metrics[`rate${rate}MinFidelity`] = hold.minFidelity
      metrics[`rate${rate}MaxTail`] = hold.maxTail
    }

    return verdict({
      status,
      claim: `three holes in the flat love sea on a slab (two lines of one frame, the Steiner string at pi/${2 * D + 1} a link, the mixer at rate ${RATE}): the dominant level keeps fidelity >= ${main.minFidelity.toFixed(5)} with tail <= ${main.maxTail.toExponential(2)} over ${HOLD_BEATS} beats (H1 ${H1}); largest rate held ${heldRate ?? 'none'}${heldRate !== undefined ? ` (theta ${theta(heldRate)})` : ''}; tensor ${tensorText(tensor)}, isotropy ${Number.isNaN(isotropy) ? 'not read' : isotropy.toFixed(4)} against ${threshold.toFixed(5)} (H2 ${H2}); one line, mixer off: E ${e3} (residual ${residual.toExponential(2)}), m* ${mStar.toFixed(4)}, m*/E_rest ${(mStar / E_REST).toFixed(3)} (H3 ${H3}); no cost: rate 0 fidelity ${cn0.minFidelity.toFixed(4)}${cnHeld ? `, rate ${heldRate} ${cnHeld.minFidelity.toFixed(4)}` : ''} (CN ${CN}); mixer off: off-line ${offMax.toExponential(1)}, across ${across.toExponential(1)} (C0 ${C0})`,
      metrics,
      control: {
        cnRate0MinFidelity: cn0.minFidelity,
        c0OffLineMax: offMax,
        c0Across: across,
        loneLine,
        loneSlabMin: loneSlab.eigen[0]!,
      },
      notes: `L2. ${describe(`rate ${RATE}`, main)}. Ladder: ${ladder.map(x => describe(`rate ${x.rate} (theta ${theta(x.rate)})`, x.hold)).join('; ') || 'not run'}. Tensor at kappa pi/32 ${tensorText(tensor)}, at pi/64 ${tensorText(tensorFine)}. H3: carried level E ${e3}, residual ${residual.toExponential(2)}; curvature holes ${c1} (at pi/64 ${holeCurve.at}, pi/32 ${holeCurve.atDouble}), loves ${loveCurve.curvature}. CN: ${describe('rate 0, no cost', cn0)}${cnHeld ? `; ${describe(`rate ${heldRate}, no cost`, cnHeld)}` : ''}. C0: ${describe('rate 0, one line in the slab', c0)}; ${describe('one-line window', lineHold)}; off-line max ${offMax}, across ${across}. Lone hole: line ${loneLine}, slab ${loneSlab.eigen.join(', ')}. Checks: norm ${normGap.toExponential(2)}, antisymmetry ${antiGap.toExponential(2)}, contact ${contactGap.toExponential(2)}, phi2^3 ${phiCube.map(x => x.toFixed(15)).join(', ')}, windows ${windowsOk} (slab ${slab.configs} x ${slab.block}, at 10 ${steinerWindow(2, REACH_4D)}, line ${lineW.configs}, 4d at 10 ${steinerWindow(4, REACH_4D)}). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
