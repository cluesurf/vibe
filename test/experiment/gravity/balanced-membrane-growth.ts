// A membrane horizon with ONE counter for its whole surface, grown stage by stage (E-GRV-0135). E-GRV-0131 carried
// every torn value onto its NEAREST surface dock's counter and found an exact area law, with two caveats
// (note/project/vibe/roadmap/research/remaining-pieces.md, 7, the membrane horizon): (a) the bound was enforced per dock, so a
// compact deep infall piled on a few docks and was refused at 4 percent of the surface's capacity; (b) the horizon was
// placed at each M, not formed. HYPOTHESIS: reading the whole surface as one mixed-radix number removes (a) exactly, and
// the same push, applied at each join of a horizon that grows with its lump, keeps (b)'s horizon exact, reversible and
// an area law at every stage.
//
// THE RULE (code/rule/balanced-membrane, derived there). The surface's T_cut cut-link step registers are one balanced
// base-span number N, digit j on the j-th cut link in link order. A stage H_old -> H_new pushes its items (the steps
// the join tears, the lines it makes interior; cut steps first, then by depth, deepest last) into a number V with carry
// and sets N_new = V span^T_old + N_old: forms iff |N_new| <= (span^T_new - 1) / 2, else the join is held and nothing
// changes. A placed horizon is one stage from nothing.
//
// DERIVED BEFORE ANY RUN.
//  - A PLACED horizon forms iff its whole infall, as one number, fits the whole surface: ln(2 |V| + 1) <= T_cut ln(span).
//    No dock has a share. The order still sets which infalls those are: leading zeros are free and everything after the
//    first nonzero item costs its radix, so a compact infall at the center costs about its own size (the deep items
//    are least significant), one near the surface nearly everything deeper than it.
//  - A GROWING horizon's stage forms iff its own infall fits its new digits, ln(2 |V| + 1) <= (T_new - T_old) ln(span):
//    the old counter rides in the low digits, re-laid by significance on the new cut links. A quiet join is free. The
//    differential bound dS_in <= dA ln(span); the growth's total is still exactly span^T_K formed histories.
//  - THE COUNT at every stage: interior registers all 0 on every formed state, every counter digit free over span:
//    S_k = T_cut,k ln(span). Bookkeeping once the rule holds, as E-GRV-0131's A1 was.
//  - A GENERIC exterior cannot feed a growing horizon: a shell of |J| joined docks tears about 9 |J| steps and makes
//    about 9 |J| lines interior, far more than its new cut links. So the growth needs a quiet neighborhood, and where
//    the exterior's waves reach the growing edge the joins are held.
//
// THE HORIZONS. As E-GRV-0124 and 0131: the headroom register (C 243, cap 3/2) on the box-free unit profile, the room
// read at the periodic distance on the side-48 husk over a 2-layer shrinking stack under the warped clock (D 16, L 3,
// bulk window 81). PLACED at r_h 3.5 .. 20.5. GROWN: the lump's M rises through M(r) for r = 3.5, 4, .. 10.5 (15
// stages); at each the docks whose register has reached its cap join (room 0), so the horizon grows by the headroom
// criterion as the lump accretes; 1 beat of the count rule between joins and 32 after the last.
//
// THE STARTS. Placed, per horizon, from E-GRV-0124's generic state with every item register cleared: FILLS 0, 0.5, 1,
// 1.25, 2 of the TOTAL capacity T_cut ln(span) (the least significant items set to Weyl values), the GENERIC infall
// (E-GRV-0124's own start), the BALL (every item register of a link with both ends within 3.5 of the center a Weyl
// value), and the SHALLOW ball (reported: within 2 of a point r_h - 2.5 out along x); W (a formed state with Weyl
// digits). Grown, from the QUIET start (E-GRV-0124's generic state, every register within 24 of the center at rest,
// every layer by its place):
//  G0  no infall.
//  G1  stage 1's least significant items fed Weyl values up to its whole capacity, nothing after.
//  G2  every stage fed, before its join, up to half its new digits' capacity (a feed is a scheduled event that ADDS its
//      values, as a unit of content added in E-GRV-0112, undone by subtracting).
//  GX  (reported) G2 with stage 8 fed 1.25 times its new capacity.
//  GN  (reported) G0 from a start quiet only within 16: the exterior's waves reach the growing edge during the growth.
//  W_k the G0 state at the end of stage k with every counter digit a Weyl value.
//
// GATES, fixed before the first run of this file. A timing probe (tmp/memb2-probe2, 3) ran the placed rule at r_h 12.5
// and 20.5 and a short growth before they were written; it compared nothing to them.
//  B1  (total capacity, the witness) every placed start at every horizon forms exactly when the BigInt witness says its
//      number fits (|V| <= (span^T_cut - 1) / 2); fills 0, 0.5, 1 form, fill 2 and the generic infall are refused, and a
//      refused formation leaves the state bit for bit; every stage of every grown run (G0, G1, G2, GX, GN) forms
//      exactly when the witness says |V span^T_old + N_old| fits T_new digits.
//  B2  (area law through the growth) G0, G1, G2 form at all 15 stages; at every stage no interior register varies
//      across G0, G1, G2 and W_k (the interior count 0), and the hidden count S_k (the torn registers that vary, each
//      over its window) is proportional to T_cut,k with R^2 >= 0.99 over the growth; and on G2's final state every
//      torn register changed together leaves every other register equal for 48 beats and is never rewritten, while a
//      surface-crossing line changed is seen (E-GRV-0131's X, at the grown horizon).
//  B3  (exact reversal) G0, G1, G2, GX, GN each run back through settle, beats, joins and feeds to the start bit for
//      bit; at every stage k, W_k unwound to the start and grown again forms every stage and returns W_k bit for bit;
//      placed at r_h <= 12.5, fill 1 unforms to its start and W unforms and forms back to itself.
//  B4  (the pushes are invisible outside) each grown run beside the UNPUSHED run (E-GRV-0124's rule: the same joins and
//      feeds, the torn registers held where they were): every register but the torn ones equal after every join and
//      every beat, bit for bit.
//  C1  (control) at every placed horizon where the balanced rule forms the ball, E-GRV-0131's nearest-dock rule refuses
//      it (and agrees with its own witness), and there is at least one such horizon.
// Verdict: pass if B1, B2, B3, B4 and C1 all hold; fail otherwise.
// REPORTED: the fit and overflow margins (counter over capacity), the ball's and the shallow ball's cost against the
// capacity, where GN's joins are held and by how much, GX's refused stage, S_k / T_cut,k and its exponent in r.
//
// FIRST RUN (tmp/memb2-run1.log, the record, 190 s, run under the code E-GRV-0134 before another file was found to
// claim it; no gate moved): PASS on every gate.
//  - B1: every placed start at all nine horizons, and every stage of all five grown runs, forms exactly when the BigInt
//    witness says it fits. The largest fitting counter sits at 0.9999985 of capacity, the smallest refused at 1.0242.
//    Fills 0, 0.5, 1 form and 1.25, 2 are refused everywhere; the generic infall is 2.41 (r_h 3.5) .. 11.85 (20.5)
//    times the whole surface and refused; a refusal changes nothing.
//  - C1, THE PER-DOCK PILE IS GONE: the 3.5 ball forms at r_h 6.5 .. 20.5 (0.59 .. 0.042 of capacity at 20.5, 23076 of
//    550957 nats), where E-GRV-0131's nearest-dock rule refuses it at every horizon (worst dock 14 .. 47 times its own
//    capacity). At 3.5, 4.5 and 5.5 the ball is refused by the balanced rule too, at 1.41, 1.87 and 1.05 of the WHOLE
//    surface: there its number exceeds the total.
//  - THE ORDER DEPENDENCE REMAINS, as derived: the ball's cost is 23076 .. 50490 nats by horizon, not its own register
//    count, because every zero item after its first nonzero costs its radix; the shallow ball (2 docks, near the
//    surface) costs 17041 .. 4438856 nats, growing with the volume behind it, and forms only at 5.5.
//  - B2: G0, G1, G2 form all 15 stages (r 3.5 .. 10.5, |H| 179 .. 4945, T_cut 882 .. 8010); 0 interior registers vary at
//    every stage; S_k = T_cut,k ln(span) = 18.1798 nats a cut link at every stage (R^2 1, spread 0, exponent in r 2.014,
//    T_cut's). Bookkeeping, as derived. At the grown horizon every torn register changed together is unseen for 48
//    beats and kept; a surface-crossing line is seen on beat 1.
//  - B3: all five grown runs run back bit for bit through 62 ticks (15 joins, 47 beats, the feeds); W_k unwinds to a start
//    and grows back to itself at all 15 stages; placed fill 1 and W reverse at r_h <= 12.5.
//  - B4: every grown run's outside equals the unpushed run's on all 62 ticks, bit for bit.
//  - REPORTED: G2's stages each swallow 0.497 .. 0.500 of their new digits and form. GX's stage 8, fed 1.25 times, is
//    refused, and every later join too (infall 6.4 .. 7.8 times the new room): the fed registers stay live, spread, and
//    are swallowed with the next shell. GN, quiet only within 16, grows 10 stages and is held from stage 11 (r 8.5) on,
//    infall 6.4 .. 8.2 times the new room: when the exterior's waves reach the growing edge, each shell carries far more
//    than its area increase, as derived, and the horizon stops growing.
//
// Depth L2: a known construction (the stretched horizon, information on the surface; the first law dS = dA / 4G read as
// a bound on each join) on an exact integer reversible rule; the tear, the headroom criterion, the push order and the
// feeds are stand-ins added by hand, and B2's count is bookkeeping once the interior is empty and nothing outside reads
// the counter. The horizon grows by the headroom criterion on a scheduled M, not by a lump the rule itself collapses.
// DETERMINISM: every start and feed is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a feed is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  duplicateOpen,
  lapseLinks,
  openMesh,
  sameOpen,
  warpClock,
  type OpenState,
} from '@/code/rule/open-husk'
import { horizonRule } from '@/code/rule/horizon-husk'
import { stepRule } from '@/code/rule/step-depth'
import {
  membraneForm,
  membranePlan,
} from '@/code/rule/membrane-horizon'
import {
  stageForm,
  stagePlan,
  stageUnform,
  type StagePlan,
} from '@/code/rule/balanced-membrane'
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
  infallWitness,
  weylStep,
} from '@/code/measure/membrane-horizon'
import {
  applyFeed,
  ballStart,
  clearStage,
  grow,
  growBack,
  outsideAgainstHeld,
  quietStart,
  regrowStages,
  stageFeed,
  stageWitness,
  tornValues,
  tornVarietyOf,
  unwindStages,
  type Feed,
  type GrowSpec,
  type TornValues,
} from '@/code/measure/balanced-membrane'

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
const REVERSE_UP_TO = 12.5
const FILLS: readonly number[] = [0, 0.5, 1, 1.25, 2]
const BALL = 3.5
const SHALLOW = 2
const GROW_FROM = 3.5
const GROW_TO = 10.5
const GROW_STEP = 0.5
const BETWEEN = 1
const SETTLE = 32
const QUIET = 24
const NOISY = 16
const FEED = 0.5
const OVER_STAGE = 8
const OVER_FEED = 1.25
const R2_GATE = 0.99

const spreadOf = (xs: readonly number[]): number =>
  Math.max(...xs) / Math.min(...xs) - 1

export default experiment({
  id: 'gravity/balanced-membrane-growth',
  code: 'E-GRV-0135',
  title:
    "a membrane horizon whose whole surface is one mixed-radix counter refuses exactly at total capacity and grows by the headroom criterion as an exact area law, pass (B2 bookkeeping): placed at r_h 3.5 .. 20.5 every start forms exactly when the BigInt witness says the infall's one number fits T_cut base-span digits (largest fitting 0.9999985, smallest refused 1.024), fills to capacity form and 1.25 and 2 times are refused, and the 3.5-dock ball that E-GRV-0131's nearest-dock rule refuses at every horizon forms from r_h 6.5 up (4.2 percent of capacity at 20.5); grown over 15 joins (r 3.5 .. 10.5, T_cut 882 .. 8010) with the old counter kept in the low digits and re-laid on the new cut links, each stage forms iff its own infall fits its new digits, 0 interior registers vary, S = T_cut ln(span) at every stage (R^2 1, exponent 2.014), every run reverses bit for bit through joins, beats and feeds, and the outside equals the unpushed run's on every tick; a noisy exterior stops the growth at r 8.5 (each shell 6.4 .. 8.2 times its area increase), and an infall's cost still depends on its depth (a shallow 2-dock ball costs the volume behind it)",
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
    const massAt = (r: number): number => CAP / profile.at(r)
    const horizonAt = (r: number): Uint8Array =>
      roomHorizon(mesh, center, roomOf(profile, massAt(r), CAP, BASE))

    const formedCopy = (
      plan: StagePlan,
      s: OpenState,
    ): { s: OpenState; ok: boolean } => {
      const c = duplicateOpen(s)

      return { s: c, ok: stageForm(rule, plan, c).formed }
    }

    // ---------------------------------------------------------------------------------------------------------
    // PLACED: B1's scan, B3's placed reversal, C1

    const placed = R_H.map(rh => {
      const horizon = horizonAt(rh)
      const plan = stagePlan(mesh, empty, horizon)
      const tCut = plan.newCut.length
      const capacity = tCut * lnSpan
      const cleared = duplicateOpen(base)

      clearStage(plan, cleared)

      const filled = (fill: number, phase: number): OpenState => {
        const s = duplicateOpen(cleared)

        applyFeed(
          rule,
          stageFeed(rule, plan, fill, capacity, phase),
          s,
          1,
        )

        return s
      }

      const shallowCenter = [
        center[0]! + rh - 2.5,
        center[1]!,
        center[2]!,
      ]
      const starts = [
        ...FILLS.map(fill => ({
          name: `fill ${fill}`,
          start: filled(fill, 0),
        })),
        { name: 'generic', start: base },
        {
          name: 'ball',
          start: ballStart(mesh, rule, plan, base, center, BALL, 0),
        },
        {
          name: 'shallow',
          start: ballStart(
            mesh,
            rule,
            plan,
            base,
            shallowCenter,
            SHALLOW,
            0,
          ),
        },
      ]
      const scan = starts.map(c => {
        const w = stageWitness(rule, plan, c.start)
        const f = formedCopy(plan, c.start)

        return {
          name: c.name,
          ok: f.ok,
          witness: w,
          agree: f.ok === w.fits,
          unchanged: f.ok || sameOpen(f.s, c.start),
          formedState: f.s,
          start: c.start,
        }
      })
      const byName = (name: string): (typeof scan)[number] =>
        scan.find(c => c.name === name)!
      const b1 =
        scan.every(c => c.agree && c.unchanged) &&
        FILLS.filter(f => f <= 1).every(f => byName(`fill ${f}`).ok) &&
        !byName('fill 2').ok &&
        !byName('generic').ok

      // B3 placed: fill 1 unformed, and W unformed and formed back
      let reversed = true
      let onto = true

      if (rh <= REVERSE_UP_TO) {
        const f1 = byName('fill 1')
        const back = duplicateOpen(f1.formedState)

        if (f1.ok) {
          stageUnform(rule, plan, back)
        }

        reversed = f1.ok && sameOpen(back, f1.start)

        const w = duplicateOpen(cleared)

        plan.newCut.forEach(m => (w.step[m] = weylStep(rule, m, 3)))

        const wBack = duplicateOpen(w)

        stageUnform(rule, plan, wBack)

        const again = formedCopy(plan, wBack)

        onto = again.ok && sameOpen(again.s, w)
      }

      // C1: E-GRV-0131's nearest-dock rule on the same ball
      const ball = byName('ball')
      const mplan = membranePlan(mesh, horizon)
      const nearState = duplicateOpen(ball.start)
      const nearFormed = membraneForm(
        mesh,
        rule,
        mplan,
        nearState,
      ).formed
      const nearWitness = infallWitness(rule, mplan, ball.start)

      let nearWorst = 0

      nearWitness.nats.forEach(
        (n, k) =>
          (nearWorst = Math.max(
            nearWorst,
            n / nearWitness.capacity[k]!,
          )),
      )

      // drop the formed copies before the next horizon
      const kept = scan.map(
        ({ formedState: _f, start: _s, ...rest }) => rest,
      )

      log(`placed r_h ${rh}`)

      return {
        rh,
        m: massAt(rh),
        docks: horizon.reduce((t, v) => t + v, 0),
        tCut,
        capacity,
        items: plan.items.length,
        scan: kept,
        b1,
        reversed,
        onto,
        nearFormed,
        nearAgree: nearFormed === nearWitness.fits,
        nearWorst,
      }
    })

    // ---------------------------------------------------------------------------------------------------------
    // GROWN

    const radii: number[] = []

    for (let r = GROW_FROM; r <= GROW_TO + 1e-9; r += GROW_STEP) {
      radii.push(r)
    }

    const targets = radii.map(horizonAt)
    const plans = targets.map((h, i) =>
      stagePlan(mesh, i === 0 ? empty : targets[i - 1]!, h),
    )
    const cuts = plans.map(p => p.newCut.length)
    const roomOfPlan = (p: StagePlan): number =>
      Math.max(p.newCut.length - p.oldCut.length, 0) * lnSpan
    const quiet = quietStart(mesh, rule, center, QUIET)
    const noisy = quietStart(mesh, rule, center, NOISY)
    const specOf = (
      feed?: (k: number, p: StagePlan) => Feed | null,
    ): GrowSpec => ({
      targets,
      plans,
      between: BETWEEN,
      settle: SETTLE,
      pushed: true,
      feed,
    })
    const families = [
      { name: 'G0', start: quiet, spec: specOf() },
      {
        name: 'G1',
        start: quiet,
        spec: specOf((k, p) =>
          k === 1 ? stageFeed(rule, p, 1, roomOfPlan(p), 0) : null,
        ),
      },
      {
        name: 'G2',
        start: quiet,
        spec: specOf((_, p) =>
          stageFeed(rule, p, FEED, roomOfPlan(p), 7),
        ),
      },
      {
        name: 'GX',
        start: quiet,
        spec: specOf((k, p) =>
          stageFeed(
            rule,
            p,
            k === OVER_STAGE ? OVER_FEED : FEED,
            roomOfPlan(p),
            7,
          ),
        ),
      },
      { name: 'GN', start: noisy, spec: specOf() },
    ]

    log('growth plans')

    // B4 and B3 (runs back), and B1's growth half, per family
    const grown = families.map(fam => {
      const side = outsideAgainstHeld(mesh, rule, fam.start, fam.spec)
      const s = side.final

      growBack(mesh, rule, s, fam.spec, side.pushed)

      const reversed = sameOpen(s, fam.start)

      log(`grown ${fam.name}`)

      return {
        name: fam.name,
        record: side.pushed,
        ticks: side.ticks,
        differ: side.differ,
        reversed,
      }
    })

    // B2: the torn registers at the end of each stage's beats, G0 G1 G2
    const at: TornValues[][] = []

    let g2Final: OpenState | null = null

    const ends: OpenState[] = []

    families.slice(0, 3).forEach((fam, i) => {
      const s = duplicateOpen(fam.start)
      const values: TornValues[] = []

      grow(mesh, rule, s, fam.spec, (tick, st) => {
        if (tick.beat !== BETWEEN) {
          return
        }

        values.push(tornValues(mesh, targets[tick.stage - 1]!, st))

        if (i === 0) {
          ends.push(duplicateOpen(st))
        }
      })
      at.push(values)

      if (fam.name === 'G2') {
        g2Final = s
      }
    })

    log('stage values')

    // W_k: G0's state at the end of stage k with Weyl digits; unwound and grown again (B3), its torn values (B2)
    const wRows = ends.map((end, i) => {
      const k = i + 1
      const w = duplicateOpen(end)

      plans[i]!.newCut.forEach(m => (w.step[m] = weylStep(rule, m, 3)))

      const s = duplicateOpen(w)

      unwindStages(mesh, rule, s, families[0]!.spec, k)

      const regrown = regrowStages(mesh, rule, s, families[0]!.spec, k)

      return {
        values: tornValues(mesh, targets[i]!, w),
        onto: regrown && sameOpen(s, w),
      }
    })

    log('W unwound and grown again')

    const stages = radii.map((r, i) => {
      const variety = tornVarietyOf(rule, [
        at[0]![i]!,
        at[1]![i]!,
        at[2]![i]!,
        wRows[i]!.values,
      ])

      return {
        r,
        m: massAt(r),
        docks: targets[i]!.reduce((t, v) => t + v, 0),
        tCut: cuts[i]!,
        joined: plans[i]!.joined.length,
        items: plans[i]!.items.length,
        variety,
        s: variety.nats,
      }
    })

    // X at the grown horizon, on G2's final state
    const finalH = targets[targets.length - 1]!
    const finalPlan = membranePlan(mesh, finalH)
    const skip: Skip = noSkip(mesh)

    for (const l of finalPlan.cut) {
      skip.step[l] = 1
    }

    for (const l of finalPlan.interior) {
      skip.step[l] = 1
      skip.line[l] = 1
    }

    const moveAll = (s: OpenState): void => {
      for (const l of finalPlan.cut) {
        s.step[l] = shiftStep(rule, s.step[l]!)
      }

      for (const l of finalPlan.interior) {
        s.step[l] = shiftStep(rule, s.step[l]!)
        s.line[l] = cycleLine(s.line[l]!)
      }
    }

    const g2 = g2Final as OpenState | null

    if (!g2) {
      throw new Error('G2 did not run')
    }

    const hidden = ask(mesh, rule, finalH, g2, moveAll, skip, BEATS)
    const cutLink = finalPlan.cut[0]!
    const v1Skip: Skip = {
      ...skip,
      line: Uint8Array.from(skip.line, (v, l) =>
        l === cutLink ? 1 : v,
      ),
    }
    const v1 = ask(
      mesh,
      rule,
      finalH,
      g2,
      s => void (s.line[cutLink] = cycleLine(s.line[cutLink]!)),
      v1Skip,
      BEATS,
    )

    log('asks')

    // ---------------------------------------------------------------------------------------------------------
    // the gates

    const growthAgree = grown.every(g => g.record.agree.every(v => v))
    const b1 = placed.every(p => p.b1) && growthAgree
    const allFormed = grown
      .slice(0, 3)
      .every(g => g.record.formed.every(v => v))
    const fit = proportionalFit({
      xs: stages.map(s => s.tCut),
      ys: stages.map(s => s.s),
    })
    const interiorVarying = stages.map(
      s => s.variety.interiorStep + s.variety.interiorLine,
    )
    const b2 =
      allFormed &&
      interiorVarying.every(v => v === 0) &&
      fit.r2 >= R2_GATE &&
      hidden.first === 0 &&
      hidden.kept &&
      v1.first !== 0
    const b3 =
      grown.every(g => g.reversed) &&
      wRows.every(w => w.onto) &&
      placed.every(p => p.reversed && p.onto)
    const b4 = grown.every(g => g.differ === 0 && g.ticks > 0)
    const ballFormedAt = placed.filter(
      p => p.scan.find(c => c.name === 'ball')!.ok,
    )
    const c1 =
      ballFormedAt.length > 0 &&
      ballFormedAt.every(p => !p.nearFormed) &&
      placed.every(p => p.nearAgree)
    const status = b1 && b2 && b3 && b4 && c1 ? 'pass' : 'fail'

    // ---------------------------------------------------------------------------------------------------------
    // reported

    let fitMax = 0
    let overMin = Infinity

    placed.forEach(p =>
      p.scan.forEach(c => {
        const ratio = c.witness.counter / c.witness.capacity

        if (c.ok) {
          fitMax = Math.max(fitMax, ratio)
        } else {
          overMin = Math.min(overMin, ratio)
        }
      }),
    )

    grown.forEach(g =>
      g.record.witness.forEach((w, i) => {
        if (w.capacity === 0) {
          return
        }

        const ratio = w.counter / w.capacity

        if (g.record.formed[i]) {
          fitMax = Math.max(fitMax, ratio)
        } else {
          overMin = Math.min(overMin, ratio)
        }
      }),
    )

    const perCut = stages.map(s => s.s / s.tCut)
    const sExp = logLogSlope(
      stages.map(s => s.r),
      stages.map(s => s.s),
    )
    const cutExp = logLogSlope(
      stages.map(s => s.r),
      stages.map(s => s.tCut),
    )
    const held = (name: string): number[] =>
      grown
        .find(g => g.name === name)!
        .record.formed.map((v, i) => (v ? -1 : i + 1))
        .filter(v => v > 0)
    const infallRatio = (name: string): string =>
      grown
        .find(g => g.name === name)!
        .record.witness.map(w =>
          w.room > 0
            ? (w.infall / w.room).toFixed(3)
            : w.infall > 0
              ? 'inf'
              : '0',
        )
        .join(' ')

    placed.forEach(p => {
      const key = `rh${p.rh}`
      const ball = p.scan.find(c => c.name === 'ball')!
      const shallow = p.scan.find(c => c.name === 'shallow')!

      metrics[`${key}_mass`] = p.m
      metrics[`${key}_horizonDocks`] = p.docks
      metrics[`${key}_cutLinks`] = p.tCut
      metrics[`${key}_items`] = p.items
      metrics[`${key}_capacity`] = p.capacity
      p.scan.forEach(c => {
        const name = c.name.replace(' ', '').replace('.', 'p')

        metrics[`${key}_${name}_formed`] = c.ok ? 1 : 0
        metrics[`${key}_${name}_overCapacity`] =
          c.witness.counter / c.witness.capacity
      })
      metrics[`${key}_ball_nats`] = ball.witness.infall
      metrics[`${key}_nearest_ball_formed`] = p.nearFormed ? 1 : 0
      metrics[`${key}_nearest_ball_worstDock`] = p.nearWorst
      lines.push(
        `placed r_h ${p.rh} (M ${p.m.toFixed(1)}): |H| ${p.docks}, T_cut ${p.tCut}, ${p.items} items, capacity ${p.capacity.toFixed(0)} nats; ${p.scan.map(c => `${c.name} ${c.ok ? 'forms' : 'refused'} (witness ${c.witness.fits ? 'fits' : 'over'}, ${(c.witness.counter / c.witness.capacity).toFixed(6)} of capacity${c.unchanged ? '' : ', CHANGED'})`).join(', ')}; ball ${ball.witness.infall.toFixed(0)} nats, nearest-dock rule ${p.nearFormed ? 'forms' : 'refuses'} it (worst dock ${p.nearWorst.toFixed(2)} of its own); shallow ball ${shallow.witness.infall.toFixed(0)} nats; reversed ${p.reversed}, onto ${p.onto}`,
      )
    })

    stages.forEach((s, i) => {
      const key = `stage${i + 1}`

      metrics[`${key}_r`] = s.r
      metrics[`${key}_horizonDocks`] = s.docks
      metrics[`${key}_cutLinks`] = s.tCut
      metrics[`${key}_S`] = s.s
      metrics[`${key}_interiorVarying`] = interiorVarying[i]!
      metrics[`${key}_cutVarying`] = s.variety.cut
      metrics[`${key}_Wonto`] = wRows[i]!.onto ? 1 : 0
      lines.push(
        `stage ${i + 1} r ${s.r} (M ${s.m.toFixed(1)}): |H| ${s.docks} (${s.joined} joined, ${s.items} items), T_cut ${s.tCut}, S ${s.s.toFixed(1)} (cut digits varying ${s.variety.cut}, interior varying ${interiorVarying[i]}), S / T_cut ${(s.s / s.tCut).toFixed(4)}, W onto ${wRows[i]!.onto}`,
      )
    })

    grown.forEach(g => {
      metrics[`${g.name}_stagesFormed`] = g.record.formed.filter(
        v => v,
      ).length

      metrics[`${g.name}_witnessAgree`] = g.record.agree.every(v => v)
        ? 1
        : 0
      metrics[`${g.name}_ticks`] = g.ticks
      metrics[`${g.name}_outsideDiffer`] = g.differ
      metrics[`${g.name}_reversed`] = g.reversed ? 1 : 0
      lines.push(
        `${g.name}: formed ${g.record.formed.map(v => (v ? 1 : 0)).join('')}, witness agrees ${g.record.agree.every(v => v)}, infall over room by stage ${infallRatio(g.name)}; outside against the unpushed run differs on ${g.differ} of ${g.ticks} ticks; reversed ${g.reversed}`,
      )
    })

    metrics.gate_B1 = b1 ? 1 : 0
    metrics.gate_B2 = b2 ? 1 : 0
    metrics.gate_B3 = b3 ? 1 : 0
    metrics.gate_B4 = b4 ? 1 : 0
    metrics.control_C1 = c1 ? 1 : 0
    metrics.B2R2 = fit.r2
    metrics.B2Slope = fit.slope
    metrics.B2Spread = spreadOf(perCut)
    metrics.SExponent = sExp
    metrics.cutExponent = cutExp
    metrics.lnSpan = lnSpan
    metrics.hiddenFirst = hidden.first
    metrics.hiddenKept = hidden.kept ? 1 : 0
    metrics.v1First = v1.first
    metrics.largestFitting = fitMax
    metrics.smallestOverflowing = Number.isFinite(overMin)
      ? overMin
      : -1
    metrics.ballFormedHorizons = ballFormedAt.length
    metrics.GNHeldFrom = held('GN')[0] ?? 0
    metrics.GXHeldFrom = held('GX')[0] ?? 0
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `balanced membrane: placed at r_h ${R_H.join(', ')} every start agrees with the BigInt witness (${b1}), the largest fitting counter at ${fitMax.toFixed(7)} of capacity and the smallest refused at ${overMin.toFixed(7)}; the 3.5 ball forms at r_h ${ballFormedAt.map(p => p.rh).join(', ') || 'none'} where the nearest-dock rule refuses it ${ballFormedAt.every(p => !p.nearFormed)}; grown over ${stages.length} stages r ${GROW_FROM} .. ${GROW_TO}: interior varying ${interiorVarying.join(', ')}, S against T_cut R^2 ${fit.r2.toFixed(5)}, S / T_cut spread ${spreadOf(perCut).toFixed(4)}, exponent ${sExp.toFixed(3)} (T_cut ${cutExp.toFixed(3)}); reversal ${b3}; outside against the unpushed run ${grown.map(g => `${g.name} ${g.differ}`).join(', ')} differing ticks; GN held from stage ${held('GN')[0] ?? 'none'}, GX from ${held('GX')[0] ?? 'none'}`,
      metrics,
      control: {
        c1: c1 ? 1 : 0,
        ballFormedHorizons: ballFormedAt.length,
      },
      notes: `L2. B1 ${b1}, B2 ${b2}, B3 ${b3}, B4 ${b4}, C1 ${c1}. Hidden at the grown horizon: first ${hidden.first}, kept ${hidden.kept}; V1 ${v1.first}. ${lines.join('. ')}.`,
    })
  },
})
