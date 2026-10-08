// A horizon whose interior holds no state of its own (E-GRV-0131). note/project/vibe/roadmap/research/remaining-pieces.md, 7,
// "What an area law would need": E-GRV-0124 found the torn headroom horizon's hidden count to be a volume law on the husk,
// S = 9 |H| ln(3 span) + T_cut (ln span - ln 3) / 2, because every interior link tears and keeps its value unread; the
// only area-law piece was the cut links, T_cut ~ r_h^1.994, 8.4 percent of the count. HYPOTHESIS: an area law needs the
// interior to hold NO state, every torn value carried exactly and reversibly onto a bounded counter on the nearest
// surface dock, so the only hidden registers are the surface's; and a reversible rule can do that only while the
// infall fits on the surface, which is Bekenstein's bound as a rule of the dynamics.
//
// THE RULE (code/rule/membrane-horizon, derived there): at formation every torn register (the step of each link with an
// end on H, the line of each link with both ends on H) is pushed with carry, n <- n r + v, onto the counter of its
// nearest surface dock; the counter is the dock's own c_s cut-link step registers read as one balanced base-span number,
// so NO register is added. If every counter fits, the interior is set to 0 and the digits written; else the horizon is
// held from forming and nothing changes (reversible: the horizon's bit records the branch; wrapping the counter would
// not be). Between events the beat is E-GRV-0113's count rule, unchanged.
//
// DERIVED BEFORE ANY RUN.
//  - EXACT AND REVERSIBLE: n r + v with v balanced in radix r is a bijection; the digits hold it in integers under 2^53.
//  - THE CAPACITY: a surface dock holds c_s ln(span) nats, span = 3 Q^L = 3 x 297^3, ln(span) = 18.18; the surface holds
//    T_cut ln(span), exactly E-GRV-0124's cut part. From E-GRV-0124's counts at r_h 20.5 (T_cut 30306 over 6450 surface
//    docks) that is 4.70 cut links, 85.4 nats, a surface dock.
//  - THE COUNT after formation: the interior holds 0 on every formed state, each digit any of span values, so
//    S = T_cut ln(span) and S / T_cut = ln(span) at every M. A1 is therefore BOOKKEEPING once A2 and X hold (L1): it
//    records that the rule put the only hidden registers on the cut links, which the rule was built to do.
//  - AGAINST S = A / 4G (not gated): with 1 / 4G = cap / (2 k_u) = 72.1 per dock^2 (E-GRV-0124), Bekenstein's law asks
//    (1 / 4G) A / T_cut nats of each cut link: 12.6 at r_h 20.5 (T_cut / 4 pi r_h^2 = 5.74), against the 18.18 the
//    register holds, so S / A is predicted near 104, 1.45 times 1 / 4G, and nearly flat in r_h (T_cut ~ r_h^1.994); a
//    surface dock would need 59 .. 67 nats (E-GRV-0124's "ln C required"), against 85 it holds.
//  - A GENERIC INFALL CANNOT FORM ANY OF THESE HORIZONS: it carries E-GRV-0124's whole count, 12 .. 5 times the capacity
//    (the cut part is 8.4 .. 27 percent of it), so the pigeonhole bound refuses it at every M. A horizon forms here only
//    from an infall of at most T_cut ln(span) nats, and only if no dock's share exceeds its own c_s ln(span).
//  - NEAREST IS UNEVEN. The breadth-first owner of the deep interior is whichever surface dock's wave arrives first, so a
//    fixed ball of infall at the center lands on a few surface docks. Predicted: the r = 3.5 ball of infall (reported,
//    not gated) is refused at every M even where the whole surface could hold it.
//
// THE STARTS, per horizon, all from E-GRV-0124's generic state outside (a Weyl pattern, code/measure/horizon-entropy
// genericStart), the torn registers set by code/measure/membrane-horizon:
//  P0 the vacuum infall (every torn register 0); P1, P2 the FILL of 1 at two Weyl phases (on each surface dock, its least
//  significant items, the deepest, set to Weyl values over their whole window while their radices' logs sum to at most
//  c_s ln(span): the most a dock can take, always fitting); W a formed state with every counter digit a Weyl value;
//  FILLS 0, 0.5, 1, 1.25, 2 (phase 0); the GENERIC infall (E-GRV-0124's own start); the BALL infall (every torn register
//  of the links within 3.5 of the center a Weyl value, the rest 0).
//
// GATES, fixed before the first run of this file.
//  X   for every horizon, on the formed P1: every counter digit and every interior register changed together leaves every
//      other register equal on every one of BEATS beats and the changed registers are never rewritten (hidden, E-GRV-0124's
//      ask); a surface-crossing line (V1), a live step one dock out (V2) and a horizon dock's rate (V3) are each seen; and
//      the formed P1 and the unformed P1 give the same outside on every beat (the push changes nothing outside).
//  A1  (the area) P0, P1 and P2 form at all nine horizons, and the hidden count S (every register the ask found hidden
//      that takes more than one value across the formed P0, P1, P2 after BEATS beats and W, each over its window) is
//      proportional to T_cut with R^2 >= 0.99 and S / T_cut constant to 10 percent (max over min less 1 <= 0.10):
//      E-GRV-0124's E1b, now meant to pass.
//  A2  (no interior register) at every horizon no interior step or line takes more than one value across those states:
//      the interior count is 0.
//  A3  (capacity) at every horizon: every start's formation agrees with the BigInt witness (forms exactly when every
//      dock's |n| <= (span^c_s - 1) / 2, that is ln(2 |n| + 1) <= c_s ln(span)); fills 0, 0.5 and 1 form; fill 2 and the
//      generic infall are refused; and a refused formation leaves the state bit for bit unchanged. Reported: where it
//      refuses, as the largest dock infall over its capacity and the share of docks that overflow.
//  A4  (exact reversal) for P0, P1, P2 at every horizon: form, BEATS beats, BEATS back, unform returns the start bit for
//      bit; and W unformed and formed again returns W.
//  C1  E-GRV-0124's rule (the torn registers held, not pushed) on the same horizons, from the generic start and the same
//      with every torn register moved: S equals E-GRV-0124's closed form to 1e-12 at every horizon, is proportional to
//      |H| (R^2 >= 0.99) and its S / T_cut spreads more than 10 percent: the volume law reproduced.
//  C2  no horizon (the same docks, nothing torn): X's change is seen, at every horizon, so a lump with no horizon hides
//      nothing of it.
// Verdict: pass if X, A1, A2, A3, A4, C1 and C2 all hold; fail otherwise.
// REPORTED (not gated): S / A against 1 / 4G = cap / (2 k_u) (A = 4 pi r_h^2), the G that S = A / 4G would imply, the
// nats a cut link and a surface dock would need for Bekenstein's coefficient against those the rule holds, the
// exponents in r_h, and the ball infall's fate.
//
// FIRST RUN (tmp/surf-run1.log, the record, 197 s; no gate moved): PASS on every gate.
//  - X holds at all nine horizons: every counter digit and every interior register changed together is unseen for 48
//    beats and never rewritten; V1, V2, V3 are seen on beat 1; the formed and the unformed P1 give the same outside on
//    every beat (the push is invisible outside). C2: with no horizon the same change is seen on beat 1.
//  - A2: 0 interior registers vary across the formed states at every horizon (E-GRV-0124's rule: all of them do).
//  - A1: S = T_cut ln(span) at every horizon, 18.1798 nats a cut link, R^2 1, spread 0 (every one of the T_cut digits
//    varies); exponent in r_h 1.994, the cut links'. Bookkeeping, as derived.
//  - A3: every start agrees with the BigInt witness; fills 0, 0.5, 1 form, fill 1.25, fill 2 and the generic infall are
//    refused, and a refusal changes nothing. WHERE: the largest fitting dock sits at 0.99999844 of its capacity and the
//    smallest overflowing at 1.0000425, over every start and horizon; at fill 1.25, 90 .. 98 percent of the docks
//    overflow. The generic infall is 2.4 (r_h 3.5) .. 11.8 (r_h 20.5) times the whole surface's capacity, its worst dock
//    21 .. 311 times its own: no headroom horizon here can swallow E-GRV-0124's generic state. (The derived "12 .. 5
//    times" above misread E-GRV-0124: its cut part is 41.5 percent of its count at r_h 3.5 and 8.4 at 20.5, so 2.4 .. 11.8
//    is the right range; the gate asked only for refusal.)
//  - THE BALL (reported): refused at every M, as predicted, even at r_h 20.5 where its 22856 nats are 4 percent of the
//    surface's 550957: 1.8 percent of the docks overflow, the worst 24 times over. Nearest-dock ownership piles the deep
//    infall onto a few surface docks, so the bound this rule enforces is per dock, not per horizon.
//  - A4: every formation reverses bit for bit through 48 beats and back, and W unforms and forms back to itself.
//  - C1: E-GRV-0124's rule gives its own counts to 2e-16 (38590 .. 6528810 nats), R^2 0.99989 against |H|, spread 3.92,
//    exponent 2.89: the volume law, reproduced.
//  - AGAINST A / 4G (reported): S / 4 pi r_h^2 = 104.2 .. 106.6 against 1 / 4G = 71.7 .. 72.5, a ratio of 1.439 .. 1.472
//    at every M (E-GRV-0124: 3.5 .. 17.2, growing as r_h). One G fits to 2 percent: G = 2.35e-3 .. 2.40e-3 in dock units,
//    against k_u / (2 cap) = 3.47e-3. Bekenstein's coefficient would need 12.35 .. 12.63 nats a cut link (a register of
//    about e^12.5 = 2.7e5 values, against span = 7.9e7) or 59 .. 76 a surface dock (the rule holds 85 .. 111).
//
// Depth L2: a known construction (the membrane or stretched horizon, information stored on the surface; the counting of
// microstates an exterior cannot distinguish) on an exact integer reversible rule; the tear, the headroom criterion and
// the nearest-dock push order are stand-ins added by hand, and A1 is bookkeeping once A2 and X hold. What is measured is
// that the rule does what it claims exactly, and where the capacity refuses. No collapse is run: the horizon is placed
// at each M, as in E-GRV-0124.
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  duplicateOpen,
  lapseLinks,
  openMesh,
  sameOpen,
  warpClock,
  HUSK_LATERAL,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonRule } from '@/code/rule/horizon-husk'
import { stepRule } from '@/code/rule/step-depth'
import {
  countBeat,
  countBeatBack,
  countScratch,
} from '@/code/rule/count-horizon'
import {
  membraneForm,
  membranePlan,
  membraneUnform,
  type MembranePlan,
} from '@/code/rule/membrane-horizon'
import { stackModes } from '@/code/measure/open-husk'
import { logLogSlope, proportionalFit } from '@/code/measure/regression'
import {
  boxFreeExcess,
  unitProfile,
} from '@/code/measure/horizon-temperature'
import { roomOf } from '@/code/measure/headroom-horizon'
import {
  ask,
  cycleLine,
  genericStart,
  noSkip,
  roomHorizon,
  shiftStep,
  type Skip,
} from '@/code/measure/horizon-entropy'
import {
  ballInfall,
  fillStart,
  infallWitness,
  tornVariety,
  varietyCount,
  weylCounters,
  type Witness,
} from '@/code/measure/membrane-horizon'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const CAP = 1.5
const BASE = 243
const SIDE = 48
const LAYERS = 2
const BEATS = 48
const R_H: readonly number[] = [
  3.5, 4.5, 5.5, 6.5, 8.5, 10.5, 12.5, 16.5, 20.5,
]
const FILLS: readonly number[] = [0, 0.5, 1, 1.25, 2]
const BALL = 3.5
const R2_GATE = 0.99
const AREA_SPREAD = 0.1
const FORMULA_OFF = 1e-12

const spreadOf = (xs: readonly number[]): number =>
  Math.max(...xs) / Math.min(...xs) - 1

export default experiment({
  id: 'gravity/membrane-horizon-entropy',
  code: 'E-GRV-0131',
  title:
    "a headroom horizon whose tear carries every torn value onto its surface's cut-link registers holds no interior state, and its hidden count is an area law, pass (A1 bookkeeping): at r_h = 3.5 .. 20.5 (M 502 .. 2955) the push n <- n r + v with carry forms exactly when every surface dock's number fits its c_s base-span digits (BigInt witness agrees; the largest fitting dock at 0.9999984 of capacity, the smallest refused at 1.0000425), fills to capacity form and 1.25 and 2 times are refused, and a refused formation changes nothing; 0 interior registers vary, S = T_cut ln(span) = 18.18 nats a cut link (R^2 1, spread 0, exponent 1.994); the outside is bit for bit the unformed state's, every formation reverses bit for bit; E-GRV-0124's held tear reproduces its volume law (R^2 0.99989 against |H|, spread 3.92); E-GRV-0124's generic infall is 2.4 .. 11.8 times the surface's capacity and never forms, and a 3.5-dock ball of infall is refused at every M because nearest-dock ownership piles it on a few docks; S / 4 pi r_h^2 is 1.44 .. 1.47 times 1/4G at every M, so one G (2.4e-3) fits to 2 percent where E-GRV-0124's ran 3.5 .. 17.2",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    const lapse = lapseLinks(openMesh(64, 1, 'shrink'))
    const modes = stackModes(lapse.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(lapse, modes), modes)

    log('profile')

    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = horizonRule(stepRule(DEPTH, LEVELS), BULK)
    const center = [SIDE / 2, SIDE / 2, SIDE / 2]
    const base = genericStart(mesh, rule)
    const empty = new Uint8Array(mesh.huskDocks)
    const lnSpan = Math.log(rule.span)
    const scratch = countScratch(mesh)

    const run = (
      s: OpenState,
      horizon: Uint8Array,
      beats: number,
      back = false,
    ): void => {
      for (let t = 0; t < beats; t++) {
        ;(back ? countBeatBack : countBeat)(
          mesh,
          rule,
          s,
          horizon,
          scratch,
        )
      }
    }

    // form on a copy: the formed state and whether the rule formed it
    const formed = (
      plan: MembranePlan,
      start: OpenState,
    ): { s: OpenState; ok: boolean } => {
      const s = duplicateOpen(start)

      return { s, ok: membraneForm(mesh, rule, plan, s).formed }
    }

    // the most any dock's infall fills its capacity, and the share of docks that overflow
    const where = (
      w: Witness,
    ): {
      worst: number
      share: number
      fitMax: number
      overMin: number
    } => {
      let worst = 0
      let over = 0
      let fitMax = 0
      let overMin = Infinity

      w.nats.forEach((n, k) => {
        const ratio = n / w.capacity[k]!

        worst = Math.max(worst, ratio)

        if (w.dockFits[k]) {
          fitMax = Math.max(fitMax, ratio)
        } else {
          over++
          overMin = Math.min(overMin, ratio)
        }
      })

      return { worst, share: over / w.nats.length, fitMax, overMin }
    }

    const rows = R_H.map(rh => {
      const m = CAP / profile.at(rh)
      const ku = rh * profile.at(rh)
      const horizon = roomHorizon(
        mesh,
        center,
        roomOf(profile, m, CAP, BASE),
      )
      const plan = membranePlan(mesh, horizon)
      const tCut = plan.cut.length
      const tInt = plan.interior.length

      // the registers the tear takes: every counter digit, every interior step and line
      const skip: Skip = noSkip(mesh)

      for (const l of plan.cut) {
        skip.step[l] = 1
      }

      for (const l of plan.interior) {
        skip.step[l] = 1
        skip.line[l] = 1
      }

      const moveAll = (s: OpenState): void => {
        for (const l of plan.cut) {
          s.step[l] = shiftStep(rule, s.step[l]!)
        }

        for (const l of plan.interior) {
          s.step[l] = shiftStep(rule, s.step[l]!)
          s.line[l] = cycleLine(s.line[l]!)
        }
      }

      // the family
      const p = [
        fillStart(rule, plan, base, 0, 0),
        fillStart(rule, plan, base, 1, 0),
        fillStart(rule, plan, base, 1, 7),
      ]
      const pForm = p.map(start => formed(plan, start))
      const familyFormed = pForm.every(f => f.ok)

      // A4 and the states for the count: form, BEATS beats (kept), BEATS back, unform
      const after: OpenState[] = []

      let reversed = true

      pForm.forEach((f, i) => {
        if (!f.ok) {
          reversed = false

          return
        }

        const s = duplicateOpen(f.s)

        run(s, horizon, BEATS)
        after.push(duplicateOpen(s))
        run(s, horizon, BEATS, true)
        membraneUnform(rule, plan, s)
        reversed = reversed && sameOpen(s, p[i]!)
      })

      // W: generic counters, unformed and formed again
      const w = weylCounters(rule, plan, base, 3)
      const wBack = duplicateOpen(w)

      membraneUnform(rule, plan, wBack)

      const wAgain = formed(plan, wBack)
      const onto = wAgain.ok && sameOpen(wAgain.s, w)

      after.push(w)

      const variety = tornVariety(plan, after)
      const sPush = varietyCount(rule, variety)
      const interiorVarying =
        variety.interiorSteps + variety.interiorLines

      log(`r_h ${rh} family`)

      // X on the formed P1
      const start = pForm[1]!.s
      const hidden = ask(
        mesh,
        rule,
        horizon,
        start,
        moveAll,
        skip,
        BEATS,
      )
      const cut = plan.cut[0]!
      const v1Skip: Skip = {
        ...skip,
        line: Uint8Array.from(skip.line, (v, l) => (l === cut ? 1 : v)),
      }
      const v1 = ask(
        mesh,
        rule,
        horizon,
        start,
        s => void (s.line[cut] = cycleLine(s.line[cut]!)),
        v1Skip,
        BEATS,
      )
      const outsideDock = horizon[mesh.tail[cut]!]
        ? mesh.head[cut]!
        : mesh.tail[cut]!

      let live = -1

      for (let l = 0; l < mesh.links && live < 0; l++) {
        if (
          mesh.kind[l] === HUSK_LATERAL &&
          !skip.step[l] &&
          (mesh.tail[l] === outsideDock || mesh.head[l] === outsideDock)
        ) {
          live = l
        }
      }

      const v2Skip: Skip = {
        ...skip,
        step: Uint8Array.from(skip.step, (v, l) =>
          l === live ? 1 : v,
        ),
      }
      const v2 = ask(
        mesh,
        rule,
        horizon,
        start,
        s => void (s.step[live] = shiftStep(rule, s.step[live]!)),
        v2Skip,
        BEATS,
      )
      const inside = horizon.indexOf(1)
      const v3Skip: Skip = {
        ...skip,
        dock: Uint8Array.from(skip.dock, (v, y) =>
          y === inside ? 1 : v,
        ),
      }
      const v3 = ask(
        mesh,
        rule,
        horizon,
        start,
        s => void (s.rate[inside] = s.rate[inside]! + 1),
        v3Skip,
        BEATS,
      )
      const outside = ask(
        mesh,
        rule,
        horizon,
        start,
        s => membraneUnform(rule, plan, s),
        skip,
        BEATS,
      )
      const c2 = ask(mesh, rule, empty, start, moveAll, skip, BEATS)

      log(`r_h ${rh} asks`)

      // C1: E-GRV-0124's rule, the torn registers held, from the generic start and the same with every one moved
      const g0 = duplicateOpen(base)
      const g1 = duplicateOpen(base)

      moveAll(g1)
      run(g0, horizon, BEATS)
      run(g1, horizon, BEATS)

      const sHold = varietyCount(rule, tornVariety(plan, [g0, g1]))
      const formula =
        9 * plan.docks * Math.log(3 * rule.span) +
        (tCut * (Math.log(rule.span) - Math.log(3))) / 2

      // A3: the fills, the generic infall and the ball
      const scan = [
        ...FILLS.map(fill => ({
          name: `fill ${fill}`,
          fill,
          start: fillStart(rule, plan, base, fill, 0),
        })),
        { name: 'generic', fill: NaN, start: base },
        {
          name: 'ball',
          fill: NaN,
          start: ballInfall(mesh, rule, plan, base, center, BALL, 0),
        },
      ].map(c => {
        const witness = infallWitness(rule, plan, c.start)
        const f = formed(plan, c.start)
        const unchanged = f.ok || sameOpen(f.s, c.start)
        const total = witness.nats.reduce((t, v) => t + v, 0)

        return {
          ...c,
          witness,
          ok: f.ok,
          agree: f.ok === witness.fits,
          unchanged,
          total,
          where: where(witness),
        }
      })
      const byName = (name: string): (typeof scan)[number] =>
        scan.find(c => c.name === name)!
      const a3 =
        scan.every(c => c.agree && c.unchanged) &&
        FILLS.filter(f => f <= 1).every(f => byName(`fill ${f}`).ok) &&
        !byName('fill 2').ok &&
        !byName('generic').ok

      log(`r_h ${rh} scan`)

      return {
        rh,
        m,
        ku,
        plan,
        tCut,
        tInt,
        familyFormed,
        reversed,
        onto,
        variety,
        sPush,
        interiorVarying,
        hidden,
        v1,
        v2,
        v3,
        outside,
        c2,
        sHold,
        formulaOff: Math.abs(sHold / formula - 1),
        scan,
        a3,
        area: 4 * Math.PI * rh * rh,
        inverse4G: CAP / (2 * ku),
      }
    })

    const seen = (a: { first: number }): boolean => a.first !== 0
    const x = rows.every(
      r =>
        r.hidden.first === 0 &&
        r.hidden.kept &&
        seen(r.v1) &&
        seen(r.v2) &&
        seen(r.v3) &&
        r.outside.first === 0,
    )
    const cuts = rows.map(r => r.tCut)
    const docks = rows.map(r => r.plan.docks)
    const pushed = rows.map(r => r.sPush)
    const a1Fit = proportionalFit({ xs: cuts, ys: pushed })
    const perCut = rows.map(r => r.sPush / r.tCut)
    const a1 =
      rows.every(r => r.familyFormed) &&
      a1Fit.r2 >= R2_GATE &&
      spreadOf(perCut) <= AREA_SPREAD
    const a2 = rows.every(r => r.interiorVarying === 0)
    const a3 = rows.every(r => r.a3)
    const a4 = rows.every(r => r.reversed && r.onto)
    const holdFit = proportionalFit({
      xs: docks,
      ys: rows.map(r => r.sHold),
    })
    const holdPerCut = rows.map(r => r.sHold / r.tCut)
    const c1 =
      rows.every(r => r.formulaOff <= FORMULA_OFF) &&
      holdFit.r2 >= R2_GATE &&
      spreadOf(holdPerCut) > AREA_SPREAD
    const c2 = rows.every(r => seen(r.c2))
    const status =
      x && a1 && a2 && a3 && a4 && c1 && c2 ? 'pass' : 'fail'
    const rhs = rows.map(r => r.rh)
    const sExp = logLogSlope([...rhs], [...pushed])
    const cutExp = logLogSlope([...rhs], [...cuts])
    const holdExp = logLogSlope(
      [...rhs],
      rows.map(r => r.sHold),
    )
    const ballFormed = rows
      .filter(r => r.scan.find(c => c.name === 'ball')!.ok)
      .map(r => r.rh)

    rows.forEach(r => {
      const key = `rh${r.rh}`
      const sigma = r.sPush / r.area
      const surface = r.plan.surface.length
      const needCut = (r.inverse4G * r.area) / r.tCut
      const needDock = (r.inverse4G * r.area) / surface
      const scanText = r.scan
        .map(
          c =>
            `${c.name} ${c.ok ? 'forms' : 'refused'} (witness ${c.witness.fits ? 'fits' : 'over'}, infall ${c.total.toFixed(0)} of ${(r.tCut * lnSpan).toFixed(0)} nats, worst dock ${c.where.worst.toFixed(3)}, largest fitting dock ${c.where.fitMax.toFixed(4)}, smallest overflowing ${c.where.overMin.toFixed(4)}, docks over ${(100 * c.where.share).toFixed(1)} percent)`,
        )
        .join(', ')

      metrics[`${key}_mass`] = r.m
      metrics[`${key}_ku`] = r.ku
      metrics[`${key}_horizonDocks`] = r.plan.docks
      metrics[`${key}_surfaceDocks`] = surface
      metrics[`${key}_interiorLinks`] = r.tInt
      metrics[`${key}_cutLinks`] = r.tCut
      metrics[`${key}_S`] = r.sPush
      metrics[`${key}_SPerCut`] = r.sPush / r.tCut
      metrics[`${key}_SHold`] = r.sHold
      metrics[`${key}_holdFormulaOff`] = r.formulaOff
      metrics[`${key}_interiorVarying`] = r.interiorVarying
      metrics[`${key}_cutVarying`] = r.variety.cutSteps
      metrics[`${key}_SPerArea`] = sigma
      metrics[`${key}_inverse4G`] = r.inverse4G
      metrics[`${key}_SOverBekenstein`] = sigma / r.inverse4G
      metrics[`${key}_GImplied`] = 1 / (4 * sigma)
      metrics[`${key}_natsPerCutNeeded`] = needCut
      metrics[`${key}_natsPerSurfaceDockNeeded`] = needDock
      metrics[`${key}_natsPerSurfaceDockHeld`] =
        (r.tCut * lnSpan) / surface

      r.scan.forEach(c => {
        const name = c.name.replace(' ', '').replace('.', 'p')

        metrics[`${key}_${name}_formed`] = c.ok ? 1 : 0
        metrics[`${key}_${name}_infallOverCapacity`] =
          c.total / (r.tCut * lnSpan)
        metrics[`${key}_${name}_worstDock`] = c.where.worst
        metrics[`${key}_${name}_docksOver`] = c.where.share
      })

      lines.push(
        `r_h ${r.rh} (M ${r.m.toFixed(1)}, k_u ${r.ku.toFixed(5)}): |H| ${r.plan.docks}, surface docks ${surface}, T_int ${r.tInt}, T_cut ${r.tCut}; family formed ${r.familyFormed}; S ${r.sPush.toFixed(1)} (cut digits varying ${r.variety.cutSteps} of ${r.tCut}, interior varying ${r.interiorVarying}), per cut ${(r.sPush / r.tCut).toFixed(4)}; hold S ${r.sHold.toFixed(1)} (closed form off ${r.formulaOff.toExponential(1)}), per cut ${(r.sHold / r.tCut).toFixed(3)}; per 4 pi r^2 ${sigma.toFixed(2)} against 1/4G ${r.inverse4G.toFixed(2)} (ratio ${(sigma / r.inverse4G).toFixed(3)}), G implied ${(1 / (4 * sigma)).toExponential(3)}, Bekenstein needs ${needCut.toFixed(2)} nats a cut link (holds ${lnSpan.toFixed(2)}) and ${needDock.toFixed(2)} a surface dock (holds ${((r.tCut * lnSpan) / surface).toFixed(2)}); hidden first ${r.hidden.first} kept ${r.hidden.kept}, V1 ${r.v1.first}, V2 ${r.v2.first}, V3 ${r.v3.first}, outside vs unformed ${r.outside.first}, no horizon ${r.c2.first}; reversed ${r.reversed}, onto ${r.onto}; scan: ${scanText}`,
      )
    })

    metrics.gate_X = x ? 1 : 0
    metrics.gate_A1 = a1 ? 1 : 0
    metrics.gate_A2 = a2 ? 1 : 0
    metrics.gate_A3 = a3 ? 1 : 0
    metrics.gate_A4 = a4 ? 1 : 0
    metrics.control_C1 = c1 ? 1 : 0
    metrics.control_C2 = c2 ? 1 : 0
    metrics.A1R2 = a1Fit.r2
    metrics.A1Slope = a1Fit.slope
    metrics.A1Spread = spreadOf(perCut)
    metrics.C1R2 = holdFit.r2
    metrics.C1Spread = spreadOf(holdPerCut)
    metrics.SExponent = sExp
    metrics.cutExponent = cutExp
    metrics.holdExponent = holdExp
    metrics.A3LargestFittingDock = Math.max(
      ...rows.flatMap(r => r.scan.map(c => c.where.fitMax)),
    )

    metrics.A3SmallestOverflowingDock = Math.min(
      ...rows.flatMap(r =>
        r.scan.map(c =>
          Number.isFinite(c.where.overMin) ? c.where.overMin : 1e9,
        ),
      ),
    )
    metrics.lnSpan = lnSpan
    metrics.ballFormedCount = ballFormed.length
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `membrane tear at r_h = ${R_H.join(', ')}: S against T_cut R^2 ${a1Fit.r2.toFixed(5)}, S / T_cut spread ${spreadOf(perCut).toFixed(4)} (gate ${AREA_SPREAD}), exponent ${sExp.toFixed(3)} (T_cut ${cutExp.toFixed(3)}); interior registers varying ${rows.map(r => r.interiorVarying).join(', ')}; capacity agrees with the witness ${a3}; reversal ${a4}; hold control R^2 ${holdFit.r2.toFixed(5)} against |H|, spread ${spreadOf(holdPerCut).toFixed(3)}, exponent ${holdExp.toFixed(3)}; ball infall formed at ${ballFormed.length ? ballFormed.join(', ') : 'none'}`,
      metrics,
      control: {
        c1: c1 ? 1 : 0,
        c2: c2 ? 1 : 0,
        holdR2: holdFit.r2,
        holdSpread: spreadOf(holdPerCut),
      },
      notes: `L2. X ${x}, A1 ${a1}, A2 ${a2}, A3 ${a3}, A4 ${a4}, C1 ${c1}, C2 ${c2}. ${lines.join('. ')}.`,
    })
  },
})
