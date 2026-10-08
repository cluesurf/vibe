// DOES KEEPING THE FULL DOCK'S CONTACT AT w, WHILE A LONE LOVE TAKES THE FINE COIN, HOLD A LIGHT TRIO (E-SPN-0108)?
// E-SPN-0107's fine coin (zeta = e^(2 pi i/(3n))) makes a lone love light (m*/E_rest 1.006, top speed 0.991 at n = 8),
// but it also turns a full dock's det C from w to zeta, and no three-love level held at n >= 2. E-SPN-0104's level sits
// 92 percent on full docks, whose phase (det C times the meeting's w) is the contact that bound it. This separates the
// mass from the contact. note/project/vibe/roadmap/research/discrete-gravity.md, "Measured, a light walk (E-SPN-0107 ...)".
//
// THE CORRECTION, DERIVED (code/rule/fine-coin header, `fullDock`). A line holding two open vibes takes det C: w under
// the working coin, zeta under the fine coin. The full-dock correction is the diagonal phase
//     D = (w zeta^(-1))^F = zeta^((n - 1) F),   F = the number of lines holding two open vibes,
// taken with the coin, so a full line's total is zeta (w zeta^(-1)) = w, the working contact, on the channel that bound
// the level (the meeting's w and the fermion sign are untouched), and a lone love keeps the fine coin.
//   - diagonal: F is read off the occupation, and D changes no vibe, point or open flag.
//   - exact: on the count u in Z_n it is n - 1 further steps per full line, so with the coin's own step a full line
//     steps u by n, one whole wrap: the amplitude takes w (zeta^n = w) and u is where it was. A carry, no rounding.
//   - unitary and reversible: a phase of modulus 1; D^(-1) is n steps back per full line, one borrow taking w^2.
//   - vacuum and lone love untouched: F = 0 on both (the vacuum has no open vibe, a lone love fills no line). At n = 1
//     w zeta^(-1) = 1, so D is the identity and the rule is the working rule bit for bit.
//   - line law and light cone: the coin keeps every line's occupation, so D commutes with it and moves nothing; every
//     love's position and every line's charge are the fine coin's, which keeps both (E-SPN-0107 control b).
//
// WHAT m*/E_rest SHOULD BECOME, DERIVED BEFORE THE RUN.
//   - The walk part: three free loves sharing K have m* = 3 tan m and rest energy 3m (m = pi/(3n)), ratio tan m/m:
//     1.6540, 1.1027, 1.0235, 1.0058 at n = 1, 2, 4, 8. The correction does not touch a lone love, so this part goes to
//     1 as for the lone love (E-SPN-0107 W1).
//   - The binding part (E-SPN-0106's further 4.2 at n = 1): the level sits on full docks, the stream splits every full
//     dock, and the level re-forms only when a split love turns round. The correction restores the contact's PHASE but
//     not the turn: a lone love turns with amplitude |(1 - zeta)/2| = sin(pi/(3n)) = 0.866, 0.500, 0.259, 0.131. The
//     drift cost is a phase diagonal in the configuration, and a diagonal phase cannot turn a love (on the massless walk
//     each love keeps its direction): a linear potential grips a Dirac particle only through its mass (the Klein
//     effect; a Dirac particle in a linear vector potential has resonances, not bound states). So I expect the
//     binding to loosen as n grows whatever the contact's phase, the pair flying about 1/sin(pi/(3n)) ~ 3n/pi docks
//     apart between contacts (the Compton length, 1.0, 1.9, 3.8, 7.6 docks), and the binding part NOT to go to 1 on
//     its own: where a level is held its inertia should fall with n (a wider state hops more easily), but no closed
//     form for the binding energy of such a state is in hand, so no target is derived and none is gated.
//
// THE RUNS. The stand-in (code/measure/coined-line-bloch, box 12, three loves on one bulk line, fermion statistics,
// unit 0 = the fermion sign on the flip) with `fine` n and `fullDock`, and the ring form (code/measure/bound-line
// pointBeatWith, the working split meeting, the drift cost and the fermion sign, the side-16 axis line's 32-position
// cover) at n = 1, 2, 4, 8.
//
// GATES, fixed before the first run of this file.
//  F1 at each n a level holds, by E-SPN-0107's W3 reading rule unchanged: among the stand-in's particle levels whose
//     weight beyond N is at most 1e-3, the one of least quasi-energy is the candidate (none: not held); its band
//     followed from K = 0 in steps of pi/64 to 2 pi/32 keeps a least consecutive overlap of at least 0.99; its Bloch
//     state on the ring at K = 0 keeps fidelity at least 0.99 at every beat 1 .. 128. F1 holds iff held at every n.
//  F2 at each held n: m* = 1/E''(0) (bandCurvature, d = 1e-2), E_rest = 3 pi/(3n) + E(0) (the lone half-gap, measured
//     equal to pi/(3n) to 1e-15 in E-SPN-0107, plus the ring's K = 0 energy), the ratio m*/E_rest, and R = that ratio
//     over the lone love's tan m/m. F2 holds iff F1 holds and R falls strictly with n. No target within 20 percent of 1
//     is gated (none derived, above).
//  F3 (measurement, no gate): the level's top group velocity at each held n, the largest |transported centroid step|
//     over 128 beats on the ring at K = 0, pi/16, pi/8, pi/4, 3pi/8, pi/2, with the stand-in's dE/dK beside it.
//  M  (measurement, no gate): the corrected stand-in's least weight beyond N at boxes 12, 16, 20 per n: is a missing
//     level wider than the box, or not held at all.
//  CONTROLS. (a) n = 1 reproduces E-SPN-0105: the candidate is its level (E 0.33001851839229945 within 1e-12), m*
//     24.116350860705534 within 1e-9 (relative), R 4.2000 within 1e-3 (E-SPN-0107 read R 4.199993 over the MEASURED lone
//     ratio; here the closed form), and the exact rule with fine = 1 and fullDock equals the working rule bit for bit on
//     the trio window. (b) the fine coin WITHOUT the correction reproduces E-SPN-0107's empty W3: at n = 2, 4, 8 no level
//     inside, least tails 0.22285364400810195, 0.18927228196350146, 0.09437235837021223 within 1e-9. (c) the unbound
//     unit (unit 3, the bounce's -1 on a full line) with the correction fails F1 at every n. (d) the exact window: the
//     piece of E-SPN-0105's boosted level (the n = 1 band at K = pi/2, on the anchor just before the cut on sheet 0 of
//     the side-8 cover, so the cluster straddles the cut, cut to its 8 heaviest configurations, 4 of them full docks;
//     see RUN 1 and probe 3 for why), 1 beat of the exact rule with fine n and fullDock at n = 2, 4, 8, equals the ring
//     form (points and energy per husk column within 1e-12), keeps the norm, runs back exactly, leaks nothing, disturbs
//     no vacuum branch, breaks no mesh line, puts no love outside the cone; and the correction is exercised there (the
//     ring form with and without it differ, overlap squared at most 1 - 1e-3 after the beat). Control (a)'s bit for
//     bit runs the same piece 2 beats. (e) the lone love untouched: a lone
//     love at one dock of the side-8 ring, 4 beats of the exact rule at n = 2, 4, 8, is the same with and without the
//     correction bit for bit every beat, and the corrected window keeps the norm, disturbs no vacuum branch and reaches
//     t docks at beat t. Verdict: partial if a control fails; pass if F1 and F2 hold; fail otherwise.
// PREDICTED (written after probes 1 and 2, before run 1): fail on F1 (probe 1: no level inside box 12 at n = 2, 4, 8
// with the correction), F2 unread; every control holds.
//
// DISCLOSED PROBES (instrument only, no gate read on them). tmp/fdock-probe1.log: the corrected stand-in at box 12: n = 1
// is E-SPN-0104's level (E 0.330019, m* 24.1164, R 4.2000); at n = 2, 4, 8 no level inside (least tail 0.187, 0.197,
// 0.050, mean string 5.0, 6.6, 4.2, contact 0.23, 0.08, 0.06; the unbound unit holds none at any n).
// tmp/fdock-probe2.log: the same at box 16 (stopped before box 20 for load): n = 1 the same level, n = 2, 4, 8 none
// inside (least tail 0.31, 0.34, 0.24, larger than at box 12).
//
// RUN 1 (tmp/fdock-run1.log, STOPPED, no verdict printed and no gate read): the stand-in, box scan and controls a to c
// ran; the trio window's every-sheet piece reached 9.3 GB of memory in the n = 8 window (the fine count multiplies the
// slices), over the load limit, and the run was stopped there. tmp/fdock-probe3.log (instrument, disclosed): one sheet's
// piece (112 entries) still peaked at 29 GB over 2 beats at n = 8 (2,420 branches, the ring form matched to 7e-17 and
// it ran back); its 8 heaviest entries peaked at 12.7 GB over 2 beats and at most 2.3 GB over 1 (72 branches). Control
// (d) was then cut to that piece and 1 beat. No gate and no reading rule changed.
//
// RUN 2 (1917 s, tmp/fdock-run2.log, the record): fail on F1, as predicted, F2 therefore false, no gate moved; every
// control holds. F1: n = 1 held (E 0.330019, band overlap 0.9995, ring least fidelity 0.99999); n = 2, 4, 8 no particle
// level inside the box (least tail 0.187, 0.197, 0.050; mean string 5.0, 6.6, 4.2; contact 0.23, 0.08, 0.06). F2 at
// n = 1 only: m* 24.1164, E_rest 3.4716, m*/E_rest 6.9467 against tan m/m 1.6540, R 4.2000. F3 at n = 1 only: top
// speed 0.02965 on the ring (band 0.02966). M: the least tail at boxes 12, 16, 20 is 0.19, 0.31, 0.24 (n = 2), 0.20,
// 0.34, 0.58 (n = 4), 0.05, 0.24, 0.59 (n = 8): the candidate spreads to fill a larger box, so it is not a level wider
// than box 12 but no bound level. Controls: (a) E 0.3300185183922997, m* 24.116350864579758 (1.6e-10 off), R
// 4.199993, bit for bit true; (b) uncorrected tails 0.22285364400810195, 0.18927228196350146, 0.09437235837021223, as
// recorded; (c) the unbound unit has no level inside at any n; (d) point gap 3.5e-18, energy gap 2.1e-17, reversed, and
// the correction exercised (1 - overlap^2 = 0.999 at every n); (e) the lone love the same bit for bit with and without
// the correction. Title written after the run. No GRV check was run: no light trio held.
//
// Depth L2: the lattice Dirac walk's mass and a contact phase on the rule's own line, a known construction; what could
// fail is whether a bound level survives the separation. DETERMINISM: no random numbers. The rule is exact per count in
// Z[w][1/2]; the band, the placement's floats and every reading are measurement. NOTHING MOVES: the coin and the
// correction write amplitudes on a dock's own line. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLevels,
  wholeBasis,
  type LineLevel,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  pointBeatWith,
  cutDensity,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  runWindow,
  windowContext,
} from '@/code/measure/permutation-meeting'
import {
  bandCurvature,
  bandSlope,
  blochEntries,
  boostedRun,
  cutStart as cutOf,
  exactStart,
  followLevel,
  overlap,
  pointOrbit,
  type BandPoint,
  type BoostedRun,
  type Entry,
} from '@/code/measure/moving-level'
import {
  heaviestEntries,
  sameBoundState,
} from '@/code/measure/fine-coin'
import {
  boundBeat,
  type BoundOptions,
} from '@/code/rule/bound-line-pieces'

const NS: readonly number[] = [1, 2, 4, 8]
const BOX = 12
const BOXES: readonly number[] = [12, 16, 20]
const SIDE = 16
const P = 40
const BEATS = 128
const STEP = Math.PI / 64
const CURVE_D = 1e-2
const SLOPE_D = 1e-3
const TAIL = 1e-3
const HOLD = 0.99
const HOLD_KS: readonly number[] = [0, (2 * Math.PI) / 32]
const BAND_KS: readonly number[] = [0, 1, 2, 4, 6, 8].map(
  s => (2 * Math.PI * s) / 32,
)
const EXACT = 1e-12
const SAME = 1e-9
const R_ONE = 1e-3
const EXERCISED = 1e-3
const RECORDED = {
  energy: 0.33001851839229945,
  mass: 24.116350860705534,
  R: 4.2,
  tails: new Map<number, number>([
    [2, 0.22285364400810195],
    [4, 0.18927228196350146],
    [8, 0.09437235837021223],
  ]),
}
const TRIO_WINDOW = { side: 8, beats: 1, same: 2 }
const PIECE = 8
const LONE_WINDOW = { side: 8, beats: 4 }

type Level = {
  basis: ReturnType<typeof lineBasis>
  levels: LineLevel[]
  inside: LineLevel[]
  candidate: LineLevel
  least: LineLevel
}

export default experiment({
  id: 'spin/full-dock-contact',
  code: 'E-SPN-0108',
  title:
    "keeping a full dock's contact at w while a lone love takes the fine coin does not hold a light trio, fail on F1: the full-dock correction D = (w zeta^(-1))^F (F the lines holding two open loves, one whole wrap of the fine count per full line) is exact, diagonal, unitary and reversible, the identity at n = 1 (the working rule bit for bit) and on a lone love (bit for bit at n = 2, 4, 8), and keeps the exact window equal to the ring form (2e-17) with nothing leaked or outside the cone; n = 1 is E-SPN-0105's level (m* 24.1164, E_rest 3.4716, m*/E_rest 6.947 against tan m/m 1.654, R 4.2000, top speed 0.0297), but at n = 2, 4, 8 no level is held in the box-12 stand-in (least tail 0.187, 0.197, 0.050, against 0.223, 0.189, 0.094 without the correction), and the least tail grows with the box (to 0.24, 0.58, 0.59 at box 20): restoring the contact's phase does not restore the turn, since a split love turns round only with sin(pi/(3n)) and the drift cost, a diagonal phase, cannot turn it; the unbound unit holds nothing at any n",
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
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e2 = (x: number): string => x.toExponential(2)
    const rest = (n: number): number => Math.PI / (3 * n)
    const loneRatio = (n: number): number => Math.tan(rest(n)) / rest(n)

    // the stand-in's levels and E-SPN-0107's W3 candidate
    const standIn = (
      n: number,
      fullDock: boolean,
      unit: number,
      box = BOX,
    ): Level => {
      const sector: LineSector = {
        flavors: [0, 0, 0],
        statistics: 'fermion',
        D: 3,
        box,
        unit,
        fine: n,
        ...(fullDock ? { fullDock } : {}),
      }
      const basis = lineBasis(sector)
      const levels = lineLevels(basis, wholeBasis(basis)).levels
      const inside = levels.filter(l => l.tailN <= TAIL)
      const least = levels.reduce((a, b) => (b.tailN < a.tailN ? b : a))
      const candidate =
        inside.length > 0
          ? inside.reduce((a, b) => (b.energy < a.energy ? b : a))
          : least

      return { basis, levels, inside, candidate, least }
    }

    const ctx = windowContext(SIDE)

    if (pointOrbit(ctx.gauge).length * ctx.L !== 32) {
      throw new Error(
        'full-dock-contact: the cover is not 32, the momenta were fixed for 32',
      )
    }

    const runOn = (
      options: PieceOptions,
      s0: CutState,
      K: number,
    ): BoostedRun =>
      boostedRun(
        s => pointBeatWith(options, ctx.f.tables, ctx.ring, s),
        s0,
        K,
        BEATS,
        s => cutDensity(ctx.L, s),
      )

    // F1 at one n for one unit: the candidate, its band to 2 pi/32 (to pi/2 when `full`), the ring run at K = 0
    const trioAt = (n: number, unit: number, full: boolean) => {
      const s = standIn(n, true, unit)
      const sub = wholeBasis(s.basis)

      if (s.inside.length === 0) {
        return {
          n,
          unit,
          s,
          band: [] as BandPoint[],
          rest0: undefined as BoostedRun | undefined,
          held: false,
        }
      }

      const band = followLevel(
        s.basis,
        sub,
        s.candidate,
        full ? BAND_KS : HOLD_KS,
        STEP,
      )
      const options: PieceOptions = {
        cost: true,
        sign: true,
        unit: unit === 3 ? 3 : 0,
        flat: false,
        fine: n,
        fullDock: true,
      }
      const rest0 = runOn(
        options,
        cutOf(
          blochEntries(ctx.gauge, s.basis, band[0]!.vector, 0, P)
            .entries,
          P,
        ),
        0,
      )
      const held = band[1]!.overlap >= HOLD && rest0.least >= HOLD

      return { n, unit, s, band, rest0, held }
    }

    const trios = NS.map(n => {
      const t = trioAt(n, 0, true)

      log(`trio n ${n}`)

      if (!t.held) {
        return {
          ...t,
          mass: Number.NaN,
          eRest: Number.NaN,
          ratio: Number.NaN,
          R: Number.NaN,
          slopes: [] as number[],
          runs: [] as BoostedRun[],
          top: Number.NaN,
          topBand: Number.NaN,
        }
      }

      const sub = wholeBasis(t.s.basis)
      const mass =
        1 / bandCurvature(t.s.basis, sub, t.band[0]!, CURVE_D)
      const eRest = 3 * rest(n) + t.rest0!.energy
      const ratio = mass / eRest
      const slopes = t.band.map(b =>
        bandSlope(t.s.basis, sub, b, SLOPE_D),
      )
      const options: PieceOptions = {
        cost: true,
        sign: true,
        unit: 0,
        flat: false,
        fine: n,
        fullDock: true,
      }
      const runs = t.band.map((b, i) =>
        i === 0
          ? t.rest0!
          : runOn(
              options,
              cutOf(
                blochEntries(ctx.gauge, t.s.basis, b.vector, b.K, P)
                  .entries,
                P,
              ),
              b.K,
            ),
      )
      const top = Math.max(...runs.map(r => Math.abs(r.velocity)))
      const topBand = Math.max(...slopes.map(Math.abs))

      log(`trio n ${n} band`)

      return {
        ...t,
        mass,
        eRest,
        ratio,
        R: ratio / loneRatio(n),
        slopes,
        runs,
        top,
        topBand,
      }
    })

    const f1 = trios.every(t => t.held)
    const falls = trios.every(
      (t, i) => i === 0 || t.R < trios[i - 1]!.R,
    )
    const f2 = f1 && falls

    // ---- M: the box ----
    const boxes = NS.filter(n => n > 1).map(n => ({
      n,
      tails: BOXES.map(box => {
        const s =
          box === BOX
            ? trios[NS.indexOf(n)]!.s
            : standIn(n, true, 0, box)

        log(`box ${box} n ${n}`)

        return {
          box,
          inside: s.inside.length,
          tail: s.least.tailN,
          mean: s.least.mean,
          contact: s.least.contact,
        }
      }),
    }))

    // ---- control (a): n = 1 is E-SPN-0105 ----
    const one = trios[0]!
    const wctx = windowContext(TRIO_WINDOW.side)

    const onePiece = (): Entry[] => {
      const b = one.band[one.band.length - 1]!
      // one anchor, sheet 0's just before the cut, and its heaviest configurations (run 1's every-sheet piece grew past
      // 9 GB at n = 8; probe 3 below)
      const anchors = [wctx.L - 1]

      return heaviestEntries(
        blochEntries(wctx.gauge, one.s.basis, b.vector, b.K, P, anchors)
          .entries,
        PIECE,
      )
    }

    const piece = one.held ? onePiece() : []
    const bitForBit = ((): boolean => {
      if (piece.length === 0) {
        return false
      }

      const plain: BoundOptions = { cost: true, sign: true }
      const fine1: BoundOptions = {
        cost: true,
        sign: true,
        fine: 1,
        fullDock: true,
      }

      let a = exactStart(wctx.vac, wctx.ring, piece, P)
      let b = a
      let same = true

      for (let t = 0; t < TRIO_WINDOW.same; t++) {
        a = boundBeat(plain, wctx.f.tables, wctx.ring, a, t)
        b = boundBeat(fine1, wctx.f.tables, wctx.ring, b, t)
        same &&= sameBoundState(a, b)
      }

      return same
    })()
    const controlOne =
      one.held &&
      Math.abs(one.s.candidate.energy - RECORDED.energy) <= EXACT &&
      Math.abs(one.mass / RECORDED.mass - 1) <= SAME &&
      Math.abs(one.R / RECORDED.R - 1) <= R_ONE &&
      bitForBit

    log('control a')

    // ---- control (b): the fine coin without the correction is E-SPN-0107's W3 ----
    const bare = NS.filter(n => n > 1).map(n => {
      const s = standIn(n, false, 0)

      log(`uncorrected n ${n}`)

      return { n, inside: s.inside.length, tail: s.least.tailN }
    })
    const controlBare = bare.every(
      b =>
        b.inside === 0 &&
        Math.abs(b.tail - RECORDED.tails.get(b.n)!) <= SAME,
    )

    // ---- control (c): the unbound unit fails F1 at every n ----
    const unbound = NS.map(n => {
      const t = trioAt(n, 3, false)

      log(`unbound n ${n}`)

      return t
    })
    const controlUnbound = unbound.every(t => !t.held)

    // ---- control (d): the exact window on the trio piece ----
    const trioWindows = NS.filter(n => n > 1).map(n => {
      if (piece.length === 0) {
        return { n, ok: false, exercised: 0, w: undefined }
      }

      const options: BoundOptions = {
        cost: true,
        sign: true,
        fine: n,
        fullDock: true,
      }
      const w = runWindow(
        options,
        wctx,
        exactStart(wctx.vac, wctx.ring, piece, P),
        cutOf(piece, P),
        TRIO_WINDOW.beats,
      )

      let a = cutOf(piece, P)
      let b = a

      for (let t = 0; t < TRIO_WINDOW.beats; t++) {
        a = pointBeatWith(
          {
            cost: true,
            sign: true,
            unit: 0,
            flat: false,
            fine: n,
            fullDock: true,
          },
          wctx.f.tables,
          wctx.ring,
          a,
        )

        b = pointBeatWith(
          { cost: true, sign: true, unit: 0, flat: false, fine: n },
          wctx.f.tables,
          wctx.ring,
          b,
        )
      }

      const o = overlap(a, b)
      const exercised = 1 - (o[0] ** 2 + o[1] ** 2)
      const ok =
        w.reversed &&
        w.beats.every(
          x =>
            x.normKept &&
            x.physicalNormOff <= EXACT &&
            x.leak === 0 &&
            x.disturbed === 0 &&
            x.pointGap <= EXACT &&
            x.energyGap <= EXACT &&
            x.toneBroken === 0 &&
            x.outsideCone === 0,
        )

      log(`trio window n ${n}`)

      return { n, ok, exercised, w }
    })
    const controlWindow = trioWindows.every(
      x => x.ok && x.exercised >= EXERCISED,
    )

    // ---- control (e): the lone love untouched ----
    const lctx = windowContext(LONE_WINDOW.side)
    const onePoint = lctx.gauge.to[0]![0]!
    const loneAt: Entry[] = [
      { ts: [{ x: 0, j: 0, p: onePoint }], c: 0, a: 1n, b: 0n },
    ]
    const lone = NS.filter(n => n > 1).map(n => {
      let a = exactStart(lctx.vac, lctx.ring, loneAt, 0)
      let b = a
      let same = true

      for (let t = 0; t < LONE_WINDOW.beats; t++) {
        a = boundBeat(
          { cost: false, sign: false, fine: n },
          lctx.f.tables,
          lctx.ring,
          a,
          t,
        )

        b = boundBeat(
          { cost: false, sign: false, fine: n, fullDock: true },
          lctx.f.tables,
          lctx.ring,
          b,
          t,
        )
        same &&= sameBoundState(a, b)
      }

      const w = runWindow(
        { cost: false, sign: false, fine: n, fullDock: true },
        lctx,
        exactStart(lctx.vac, lctx.ring, loneAt, 0),
        cutOf(loneAt, 0),
        LONE_WINDOW.beats,
      )
      const ok =
        same &&
        w.reversed &&
        w.beats.every(
          (x, t) =>
            x.normKept &&
            x.disturbed === 0 &&
            x.leak === 0 &&
            x.reach === t + 1,
        )

      log(`lone window n ${n}`)

      return { n, same, ok, w }
    })
    const controlLone = lone.every(x => x.ok)

    const control =
      controlOne &&
      controlBare &&
      controlUnbound &&
      controlWindow &&
      controlLone
    const status = !control ? 'partial' : f1 && f2 ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      control: control ? 1 : 0,
      controlOne: controlOne ? 1 : 0,
      controlBare: controlBare ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      controlWindow: controlWindow ? 1 : 0,
      controlLone: controlLone ? 1 : 0,
      bitForBit: bitForBit ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    for (const t of trios) {
      metrics[`trio${t.n}_held`] = t.held ? 1 : 0
      metrics[`trio${t.n}_levelsInside`] = t.s.inside.length
      metrics[`trio${t.n}_energy`] = t.s.candidate.energy
      metrics[`trio${t.n}_tail`] = t.s.candidate.tailN
      metrics[`trio${t.n}_leastTail`] = t.s.least.tailN
      metrics[`trio${t.n}_meanString`] = t.s.candidate.mean
      metrics[`trio${t.n}_contact`] = t.s.candidate.contact
      metrics[`trio${t.n}_mass`] = t.mass
      metrics[`trio${t.n}_eRest`] = t.eRest
      metrics[`trio${t.n}_ratio`] = t.ratio
      metrics[`trio${t.n}_loneRatio`] = loneRatio(t.n)
      metrics[`trio${t.n}_R`] = t.R
      metrics[`trio${t.n}_top`] = t.top
      metrics[`trio${t.n}_topBand`] = t.topBand

      if (t.band[1] !== undefined) {
        metrics[`trio${t.n}_overlap`] = t.band[1].overlap
      }

      if (t.rest0 !== undefined) {
        metrics[`trio${t.n}_ringLeast`] = t.rest0.least
      }
    }

    for (const b of boxes) {
      for (const x of b.tails) {
        metrics[`box${x.box}_n${b.n}_leastTail`] = x.tail
      }
    }

    for (const b of bare) {
      metrics[`uncorrected${b.n}_leastTail`] = b.tail
    }

    for (const t of unbound) {
      metrics[`unbound${t.n}_held`] = t.held ? 1 : 0
      metrics[`unbound${t.n}_levelsInside`] = t.s.inside.length

      if (t.rest0 !== undefined) {
        metrics[`unbound${t.n}_ringLeast`] = t.rest0.least
      }
    }

    for (const x of trioWindows) {
      metrics[`window${x.n}_exercised`] = x.exercised
    }

    const trioRow = (t: (typeof trios)[number]): string =>
      t.s.inside.length === 0
        ? `n ${t.n}: no level inside (least tail ${f4(t.s.least.tailN)}, mean string ${f4(t.s.least.mean)}, contact ${f4(t.s.least.contact)})`
        : !t.held
          ? `n ${t.n}: candidate E ${f6(t.s.candidate.energy)} not held (overlap ${f4(t.band[1]!.overlap)}, ring least fidelity ${f4(t.rest0!.least)})`
          : `n ${t.n}: E(0) ${f6(t.s.candidate.energy)}, m* ${f4(t.mass)}, E_rest ${f4(t.eRest)}, m*/E_rest ${f4(t.ratio)} against tan m/m ${f4(loneRatio(t.n))}, R ${f4(t.R)}, top speed ${f4(t.top)} (band ${f4(t.topBand)}), ring least fidelity ${f4(t.rest0!.least)}`

    return verdict({
      status,
      claim: `the fine coin with the full-dock correction D = (w zeta^(-1))^F, the drift cost, the fermion sign, the working split meeting: ${trios.map(trioRow).join('; ')}; F1 ${f1}, F2 ${f2}; box scan (least tail at boxes ${BOXES.join(', ')}): ${boxes.map(b => `n ${b.n} ${b.tails.map(x => e2(x.tail)).join(', ')}`).join('; ')}; controls: n = 1 ${controlOne} (bit for bit ${bitForBit}), uncorrected ${controlBare} (${bare.map(b => `n ${b.n} tail ${f4(b.tail)}`).join(', ')}), unbound ${controlUnbound}, trio window ${controlWindow}, lone ${controlLone}`,
      metrics,
      control: {
        one: controlOne ? 1 : 0,
        bare: controlBare ? 1 : 0,
        unbound: controlUnbound ? 1 : 0,
        window: controlWindow ? 1 : 0,
        lone: controlLone ? 1 : 0,
      },
      notes: `L2. F1 ${f1}, F2 ${f2} (falls ${falls}). Trio: ${trios.map(t => `n ${t.n} dim ${t.s.basis.configs.length} inside ${t.s.inside.length} [${t.s.inside.map(l => `E ${f6(l.energy)} tail ${e2(l.tailN)} mean ${f4(l.mean)} contact ${f4(l.contact)}`).join(', ')}] band ${t.band.map((b, i) => `K ${f4(b.K)} E ${f6(b.energy)} overlap ${f4(b.overlap)}${t.slopes[i] === undefined ? '' : ` dE/dK ${t.slopes[i].toExponential(3)}`}`).join(' ')} ring ${t.runs.map(r => `K ${f4(r.K)} least ${f6(r.least)} E ${f6(r.energy)} v ${r.velocity.toExponential(3)}`).join(' ')}`).join('; ')}. Box scan: ${boxes.map(b => `n ${b.n} ${b.tails.map(x => `box ${x.box} inside ${x.inside} least tail ${e2(x.tail)} mean ${f4(x.mean)} contact ${f4(x.contact)}`).join(', ')}`).join('; ')}. Unbound: ${unbound.map(t => `n ${t.n} inside ${t.s.inside.length} least tail ${e2(t.s.least.tailN)}${t.rest0 === undefined ? '' : ` overlap ${f4(t.band[1]!.overlap)} ring least ${f4(t.rest0.least)}`}`).join('; ')}. Trio windows (side ${TRIO_WINDOW.side}, ${TRIO_WINDOW.beats} beats, ${piece.length} placed entries): ${trioWindows.map(x => `n ${x.n} ok ${x.ok} exercised ${e2(x.exercised)}${x.w === undefined ? '' : ` ${x.w.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches, point gap ${e2(b.pointGap)}, energy gap ${e2(b.energyGap)}, physical ${e2(b.physicalNormOff)}`).join('; ')}, reversed ${x.w.reversed}`}`).join(' | ')}. Lone windows: ${lone.map(x => `n ${x.n} same ${x.same} ok ${x.ok}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
