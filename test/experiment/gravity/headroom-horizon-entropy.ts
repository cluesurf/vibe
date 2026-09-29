// How much state does a headroom horizon hide, and does it go as the horizon's area (E-GRV-0124)? note/research/vibe/
// roadmap/remaining-pieces.md, 7: "the hidden state is bounded by the horizon's dock count times ln(states per dock)";
// S = A / (4G) with G = k_u / (2 cap) (E-GRV-0122) would then tie the states per dock to the cap.
//
// WHAT IS COUNTED, AND WHY. The macrostate is the OUTSIDE: every register a dock off the horizon can ever come to depend
// on. The hidden state is the number of complete register states that agree with a given one on every such register
// for all time, under the rule: the microstates the outside cannot tell apart. The rule is a bijection, so a register
// that no outside update ever reads can hold ANY value of its window and the outside's whole history is unchanged; the
// count is then the product of those windows, S_hidden = sum over hidden registers of ln(window). Which registers are
// hidden is not assumed: it is ASKED of the rule (code/measure/horizon-entropy ask), by running the rule from one state
// and from the same state with every candidate changed, and demanding every other register equal on every beat. Not
// counted: a register the outside reads (it is part of the macrostate), and the horizon's shape (it sets the outside's
// field, so it is part of the macrostate too).
//
// THE TWO KINDS OF REGISTER THE TASK NAMES.
//  - THE FULL REGISTER (E-GRV-0122's headroom register, room k = C - floor(C e / cap)). Full means k = 0, which a
//    register bounded to 0 .. C holds in exactly ONE value, whatever C is: it hides ln 1 = 0. The found excess above the
//    cap is not stored anywhere (it is found from the steps), so a full register keeps no record of how full. Derived,
//    not run: C does not enter the hidden count at all.
//  - THE TORN REGISTERS (E-GRV-0113, code/rule/count-horizon, the rule that makes the outside a function of the count
//    and the horizon alone). Every husk lateral link with an end on the horizon is torn: its step, a trit and L base-Q
//    digits (span = 3 Q^L values), is read by no dock and rewritten by none. A line on a link with BOTH ends on the
//    horizon changes only the content of horizon docks, and the rule reads only their sum N (an interior line adds to
//    one end what it takes from the other): a trit each. A line with one end off the horizon sets that dock's content:
//    seen. Every rate and remainder, the horizon docks' own included (a horizon dock's rate drives its vertical): seen.
//
// DERIVED BEFORE ANY COUNT. Each husk dock has 18 lateral links, so with |H| horizon docks and T_cut links crossing its
// husk surface, T_int = (18 |H| - T_cut) / 2 interior links, and
//   S_hidden = (T_int + T_cut) ln(span) + T_int ln 3 = 9 |H| ln(3 span) + T_cut (ln(span) - ln 3) / 2.
// On the husk |H| is a VOLUME (the ball r < r_h, ~ 4 pi r_h^3 / 3 docks) and T_cut an AREA (~ r_h^2): the torn husk
// tears every lateral link of every horizon dock, interior ones included, so the count is a volume law on the husk with
// an area correction, 9 ln(3 span) = 9 ln(9 Q^L) nats a horizon dock (173.5 at D 16, L 3, with the step rule's
// Q = 9 (2 D + 1) = 297; first written here as 114.2 from Q = 33, a slip in the arithmetic, not in the formula, fixed
// after the first run, which compares the count to the formula and not to this number). It is an area law only in
// the BULK reading of code/rule/count-horizon, where the horizon's surface is its docks' vertical links, |H| of them: a
// 3-surface of the 4d bulk, the 4+1 form of Bekenstein's law. So E1 (as posed, against |H|) is predicted to pass and E1b
// (against the husk's own 2d surface) to fail.
//
// THE HORIZONS. The box-free unit profile of E-GRV-0118 / 0122 (lapse stack of 1 layer, side 64). Nine horizons
// r_h = 3.5 .. 20.5, half a dock off the grid: M = cap / unit(r_h), the room of E-GRV-0122's register (C = 243, cap 3/2)
// read at the periodic distance on a husk of side 48 (the count rule's mesh: a shrinking stack of 2 layers under the
// warped clock, E-GRV-0113's step rule D 16, L 3, bulk window 81). k_u = r_h unit(r_h), the profile's local 1 / r
// coefficient, so G = k_u / (2 cap) and r_h = 2 G M as in E-GRV-0122.
//
// THE ASK, per horizon, from a generic start (a Weyl pattern of line trits and steps within half a step; the claim is
// about which registers the rule reads, so it must hold on any state, not only on a lump's):
//  hidden   every torn step moved by one whole step, every interior line cycled: every other register equal on every
//           one of BEATS beats, and the changed registers never rewritten.
//  seen     V1 one line crossing the surface cycled, V2 one live husk step one dock outside moved, V3 one horizon dock's
//           rate moved by one register unit: each changes some other register within BEATS beats.
//  K2       NO HORIZON (the same ball of docks, the cap never reached): the same change as `hidden` is seen.
//  reverse  the count rule run BEATS beats and back returns the start bit for bit.
//
// GATES, fixed before the first count of this file (the timing probe tmp/ent-probe1 ran 32 beats and compared nothing).
//  X   for every horizon: hidden holds (0 differences over BEATS beats, the changed registers kept), V1, V2, V3 are seen,
//      and the rule reverses.
//  E1  (as posed) S_hidden proportional to the horizon's dock count |H|: the fit through the origin over the nine
//      horizons has R^2 >= 0.99.
//  E1b (the husk's area, Bekenstein's in 3+1) S_hidden / T_cut constant across the nine horizons to 10 percent (max over
//      min less 1 <= 0.10).
//  K1  THE VOLUME CONTROL: every register of the same balls with no horizon, each over its whole window
//      (code/measure/horizon-entropy ballCount), is proportional to the ball's dock count (R^2 >= 0.99) and E1b's test
//      REFUSES it (its ratio to T_cut spreads more than 10 percent): the area test can tell a volume.
//  K2  with no horizon the same change is seen at every radius: the count is the horizon's doing.
// Verdict: pass if X, E1, E1b, K1 and K2 all hold; fail otherwise.
// REPORTED (E2, not gated): S / A against 1 / (4G) = cap / (2 k_u) in dock units (A = 4 pi r_h^2), the G and the cap
// that S = A / (4G) would imply from the measured count, and the C it would need were a full register to keep its
// overflow in C values on each surface dock (ln C = (cap / 2 k_u) A / surface docks); the log-log exponents of S, |H|
// and T_cut against r_h; the count against the closed form above.
//
// FIRST RUN (tmp/ent-run1.log, the record, 89 s; no gate moved): FAIL on E1b, as derived.
//  - X holds at all nine horizons: changing every torn step (by a whole step) and every interior line leaves every
//    other register equal on all 48 beats and the changed registers are never rewritten; V1 (a surface-crossing line),
//    V2 (a live step one dock out) and V3 (a horizon dock's rate) are each seen on beat 1; the rule reverses bit for bit.
//  - E1 holds: S against |H| R^2 0.99989, slope 181.4 nats a dock (S / |H| falls 215.6 .. 180.7 toward the derived
//    limit 173.5 as the surface's share shrinks); the count equals the closed form to 2e-16 at every horizon.
//  - E1b FAILS: S per cut link rises 43.8 .. 215.4 (spread 3.92, gate 0.10). The exponents in r_h are S 2.892, |H|
//    2.988, T_cut 1.994: on the husk the hidden count is a volume law. The torn steps are 94.8 percent of S at the
//    largest horizon (6.19e6 of 6.53e6 nats), the interior lines 5.2, and the part on the cut links alone (the only
//    area-law piece) 8.4 percent.
//  - K1 holds: the ball's full register count goes as its dock count (R^2 0.99989) and E1b refuses it (spread 3.93),
//    the same spread as the horizon's: the area test cannot tell this horizon from a volume of husk. K2 holds: with no
//    horizon the same change is seen on beat 1 at every radius.
//  - E2 (reported): 1 / (4G) = cap / (2 k_u) = 71.7 .. 72.5 per dock^2 (k_u 0.01035 .. 0.01046); the count per
//    4 pi r_h^2 is 251 .. 1236, 3.5 .. 17.2 times Bekenstein's and growing as r_h. Read as S = A / (4G) at each M it
//    would put G at 1.0e-3 .. 2.0e-4 (cap 5.2 .. 25.7 for the measured k_u): no single G. A full register that kept its
//    overflow in C values on each surface dock would need ln C = 59 .. 76 (C ~ e^60 .. e^76) for Bekenstein's
//    coefficient, drifting with r_h because surface docks per 4 pi r^2 are not constant on the lattice; the register
//    of E-GRV-0122 (C = 243, ln C 5.5) keeps no overflow and hides nothing.
//
// Depth L2: a known construction (counting the microstates an exterior cannot distinguish, a horizon's hidden registers)
// on an exact integer reversible rule; the tear and the headroom criterion are stand-ins added by hand (E-GRV-0113,
// 0122), and the counting is combinatorics once the rule has said which registers are hidden. No Page curve is run.
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lapseLinks,
  openMesh,
  warpClock,
  HUSK_LATERAL,
} from '@/code/rule/open-husk'
import { horizonRule } from '@/code/rule/horizon-husk'
import { stepRule } from '@/code/rule/step-depth'
import { stackModes } from '@/code/measure/open-husk'
import { logLogSlope, proportionalFit } from '@/code/measure/regression'
import {
  boxFreeExcess,
  unitProfile,
} from '@/code/measure/horizon-temperature'
import { roomOf } from '@/code/measure/headroom-horizon'
import {
  ask,
  ballCount,
  ballDocks,
  cycleLine,
  genericStart,
  hiddenCount,
  noSkip,
  reverses,
  roomHorizon,
  shiftStep,
  tornSets,
  type Skip,
} from '@/code/measure/horizon-entropy'

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
const R2_GATE = 0.99
const AREA_SPREAD = 0.1

const spreadOf = (xs: readonly number[]): number =>
  Math.max(...xs) / Math.min(...xs) - 1

export default experiment({
  id: 'gravity/headroom-horizon-entropy',
  code: 'E-GRV-0124',
  title:
    "the headroom horizon hides exactly its torn registers, and their count goes as the horizon's dock count but not as its husk area, fail on E1b: at r_h = 3.5 .. 20.5 (M 502 .. 2955) the count rule, asked from a generic state, leaves every other register equal for 48 beats when every torn step and interior line is changed, sees a surface line, a live step and a horizon rate on beat 1, and sees the same change with no horizon; a full headroom register holds one value and hides nothing, so S = 9 |H| ln(3 span) + T_cut (ln span - ln 3) / 2 exactly, R^2 0.99989 against |H| (181 nats a dock, limit 173.5) but 43.8 .. 215.4 nats per cut link (gate 10 percent), exponents in r_h 2.89 (S), 2.99 (|H|), 1.99 (cut); a no-horizon ball's full count spreads the same 3.93, so the area test cannot tell this horizon from a volume; per 4 pi r_h^2 the count is 3.5 .. 17.2 times 1/4G = cap / 2 k_u = 72, so no single G or C fits S = A / 4G",
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

    // the measured profile (E-GRV-0118's box-free reading, E-GRV-0122's)
    const lapse = lapseLinks(openMesh(64, 1, 'shrink'))
    const modes = stackModes(lapse.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(lapse, modes), modes)

    log('profile')

    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = horizonRule(stepRule(DEPTH, LEVELS), BULK)
    const center = [SIDE / 2, SIDE / 2, SIDE / 2]
    const start = genericStart(mesh, rule)
    const empty = new Uint8Array(mesh.huskDocks)

    const rows = R_H.map(rh => {
      const m = CAP / profile.at(rh)
      const ku = rh * profile.at(rh)
      const horizon = roomHorizon(
        mesh,
        center,
        roomOf(profile, m, CAP, BASE),
      )
      const ball = ballDocks(mesh, center, rh)
      const sameAsBall = horizon.every((v, y) => v === ball[y])
      const sets = tornSets(mesh, horizon)
      const count = hiddenCount(rule, sets)
      const skip: Skip = noSkip(mesh)

      for (const l of [...sets.interior, ...sets.cut]) {
        skip.step[l] = 1
      }

      for (const l of sets.interior) {
        skip.line[l] = 1
      }

      const hideAll = (s: {
        step: Float64Array
        line: Int8Array
      }): void => {
        for (const l of [...sets.interior, ...sets.cut]) {
          s.step[l] = shiftStep(rule, s.step[l]!)
        }

        for (const l of sets.interior) {
          s.line[l] = cycleLine(s.line[l]!)
        }
      }

      const hidden = ask(
        mesh,
        rule,
        horizon,
        start,
        hideAll,
        skip,
        BEATS,
      )

      // V1: a line crossing the surface; V2: a live husk step one dock outside; V3: a horizon dock's rate
      const cut = sets.cut[0]!
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
      const k2 = ask(mesh, rule, empty, start, hideAll, skip, BEATS)
      const reversed = reverses(mesh, rule, horizon, start, BEATS)
      const formula =
        9 * sets.docks * Math.log(3 * rule.span) +
        (sets.cut.length * (Math.log(rule.span) - Math.log(3))) / 2
      const area = 4 * Math.PI * rh * rh
      const inverse4G = CAP / (2 * ku)

      log(`r_h ${rh}`)

      return {
        rh,
        m,
        ku,
        sets,
        count,
        sameAsBall,
        hidden,
        v1,
        v2,
        v3,
        k2,
        reversed,
        formulaOff: Math.abs(count.total / formula - 1),
        ball: ballCount(rule, tornSets(mesh, ball)),
        area,
        inverse4G,
        sigma: count.total / area,
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
        r.reversed,
    )
    const docks = rows.map(r => r.sets.docks)
    const totals = rows.map(r => r.count.total)
    const e1Fit = proportionalFit({ xs: docks, ys: totals })
    const e1 = e1Fit.r2 >= R2_GATE
    const perCut = rows.map(r => r.count.total / r.sets.cut.length)
    const e1b = spreadOf(perCut) <= AREA_SPREAD
    const ballFit = proportionalFit({
      xs: docks,
      ys: rows.map(r => r.ball),
    })
    const ballPerCut = rows.map(r => r.ball / r.sets.cut.length)
    const k1 =
      ballFit.r2 >= R2_GATE && spreadOf(ballPerCut) > AREA_SPREAD
    const k2 = rows.every(r => seen(r.k2))
    const status = x && e1 && e1b && k1 && k2 ? 'pass' : 'fail'
    const rhs = rows.map(r => r.rh)
    const sExp = logLogSlope([...rhs], [...totals])
    const hExp = logLogSlope([...rhs], [...docks])
    const cutExp = logLogSlope(
      [...rhs],
      rows.map(r => r.sets.cut.length),
    )
    const perDockLimit = 9 * Math.log(3 * rule.span)

    rows.forEach(r => {
      const key = `rh${r.rh}`
      const cImplied = (r.inverse4G * r.area) / r.sets.surface

      metrics[`${key}_mass`] = r.m
      metrics[`${key}_ku`] = r.ku
      metrics[`${key}_horizonDocks`] = r.sets.docks
      metrics[`${key}_surfaceDocks`] = r.sets.surface
      metrics[`${key}_interiorLinks`] = r.sets.interior.length
      metrics[`${key}_cutLinks`] = r.sets.cut.length
      metrics[`${key}_S`] = r.count.total
      metrics[`${key}_SSteps`] = r.count.steps
      metrics[`${key}_SLines`] = r.count.lines
      metrics[`${key}_SCutPart`] = r.count.cutPart
      metrics[`${key}_SPerDock`] = r.count.perDock
      metrics[`${key}_SPerCut`] = r.count.total / r.sets.cut.length
      metrics[`${key}_SPerArea`] = r.sigma
      metrics[`${key}_inverse4G`] = r.inverse4G
      metrics[`${key}_SOverBekenstein`] = r.sigma / r.inverse4G
      metrics[`${key}_GImplied`] = 1 / (4 * r.sigma)
      metrics[`${key}_capImplied`] = 2 * r.ku * r.sigma
      metrics[`${key}_lnCRequired`] = cImplied
      metrics[`${key}_ballS`] = r.ball
      metrics[`${key}_formulaOff`] = r.formulaOff
      metrics[`${key}_hiddenFirst`] = r.hidden.first
      metrics[`${key}_v1First`] = r.v1.first
      metrics[`${key}_v2First`] = r.v2.first
      metrics[`${key}_v3First`] = r.v3.first
      metrics[`${key}_k2First`] = r.k2.first
      lines.push(
        `r_h ${r.rh} (M ${r.m.toFixed(1)}, k_u ${r.ku.toFixed(5)}, ball ${r.sameAsBall}): |H| ${r.sets.docks}, surface docks ${r.sets.surface}, T_int ${r.sets.interior.length}, T_cut ${r.sets.cut.length}; S ${r.count.total.toFixed(1)} (steps ${r.count.steps.toFixed(1)}, lines ${r.count.lines.toFixed(1)}, cut part ${r.count.cutPart.toFixed(1)}), per dock ${r.count.perDock.toFixed(3)}, per cut ${(r.count.total / r.sets.cut.length).toFixed(3)}, per 4 pi r^2 ${r.sigma.toFixed(2)} against 1/4G ${r.inverse4G.toFixed(2)} (ratio ${(r.sigma / r.inverse4G).toFixed(3)}), G implied ${(1 / (4 * r.sigma)).toExponential(3)}, cap implied ${(2 * r.ku * r.sigma).toFixed(3)}, ln C required ${cImplied.toFixed(2)}; closed form off ${r.formulaOff.toExponential(1)}; ball count ${r.ball.toFixed(1)}; hidden first ${r.hidden.first} kept ${r.hidden.kept}, V1 ${r.v1.first}, V2 ${r.v2.first}, V3 ${r.v3.first}, K2 ${r.k2.first}, reversed ${r.reversed}`,
      )
    })

    metrics.gate_X = x ? 1 : 0
    metrics.gate_E1 = e1 ? 1 : 0
    metrics.gate_E1b = e1b ? 1 : 0
    metrics.control_K1 = k1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.E1R2 = e1Fit.r2
    metrics.E1Slope = e1Fit.slope
    metrics.E1bSpread = spreadOf(perCut)
    metrics.K1R2 = ballFit.r2
    metrics.K1Spread = spreadOf(ballPerCut)
    metrics.SExponent = sExp
    metrics.horizonExponent = hExp
    metrics.cutExponent = cutExp
    metrics.perDockLimit = perDockLimit
    metrics.span = rule.span
    metrics.fullRegisterStates = 1
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `hidden state behind the headroom horizon (torn steps over the trit window of ${rule.span} values, interior lines a trit each; a full register holds 1 value) at r_h = ${R_H.join(', ')}: S against |H| R^2 ${e1Fit.r2.toFixed(5)} (slope ${e1Fit.slope.toFixed(2)} nats a dock, limit ${perDockLimit.toFixed(2)}); S per cut link spreads ${spreadOf(perCut).toFixed(3)} (gate ${AREA_SPREAD}); exponents in r_h: S ${sExp.toFixed(3)}, |H| ${hExp.toFixed(3)}, T_cut ${cutExp.toFixed(3)}; hidden set confirmed by the rule ${x}; no-horizon control seen ${k2}; volume control R^2 ${ballFit.r2.toFixed(5)}, spread ${spreadOf(ballPerCut).toFixed(3)}`,
      metrics,
      control: {
        k1: k1 ? 1 : 0,
        k2: k2 ? 1 : 0,
        ballR2: ballFit.r2,
        ballSpread: spreadOf(ballPerCut),
      },
      notes: `L2. X ${x}, E1 ${e1}, E1b ${e1b}, K1 ${k1}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
