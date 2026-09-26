// Moving binding in the committed slot architecture, where every moving slot moves on every beat: the
// waiting-slot rule of E-FRC-0132 against a no-tension control, and the one change found that binds.
//
// E-FRC-0131 bound a meson and a baryon on the D4 lattice with matter that waits in cells. The committed
// rule's slots all stream, and the path argued that two waiting slots per cell and a returning orientation
// would carry the same binding there. E-FRC-0132 showed that rule cannot pay for its moves: a charge with
// no direction it can pay for must still cross, in debt. This measures what that does to binding, and then
// measures the smallest change that removes the debt, code/rule/reflecting-slots: a crossing that cannot be
// paid bounces the two contents of its link back into their own cells, on the opposite slot of the line,
// and the sign of a calm slot's color rides with what the slot holds. There every content still moves on
// every beat, across or back, no demon ever goes below zero, and no waiting slot or special orientation is
// needed.
//
// Side-7 D4 box (2,401 cells, 28,812 links), mass 4, tension 1, 600 beats, the demon energy set by the share
// of links holding one unit, each rule also run with no tension as the control. The seeds are E-FRC-0131's:
// a meson (a love and a fear in neighboring cells, flux 1 between) and a baryon beside its antibaryon (three
// loves and three fears in a row, fluxes 1 2 3 2 1). In the waiting-slot rule every charge starts in the
// waiting slot of its sign. In the reflecting rule each starts in a moving slot of its own line, none of them
// the line of the string, so no motion is put in by hand. Positions are followed by tag, hop by hop,
// unwrapped, in true D4 distance.
//
// Gates, set after the probes in tmp/probe-waiting, tmp/probe-reflect and tmp/probe-reflect-scan:
// - every run keeps Gauss's law and the energy exact on every beat and reverses to the bit
// - waiting slots do not bind: at the coldest fill the meson's mean gap is more than a tenth of its
//   control's (E-FRC-0131's bound meson was under a tenth), and more of its string crossings are unpaid
//   than paid
// - reflecting slots bind when cold: the meson's mean gap under 4 and under a tenth of its control's, the
//   baryon's spread under a tenth of its control's, and melt when warm: the meson's mean gap at the
//   hottest fill more than ten times the coldest
// - reflecting slots keep color local: the turning step and the line trades change no cell's color with
//   the sign carried, over 48 beats of a dense side-3 start, and the same steps read with the sign fixed by
//   the slot (E-FRC-0124's reading) must change some. A change of role frame in every cell commutes
// - and what does not hold, gated as measured: the bound meson of the reflecting rule is stuck when cold,
//   travelling under 10 in 600 beats, against 34 for E-FRC-0131's
//
// Depth L2: constructed rules on the D4 lattice against stated gates, exact integers, no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  SLOTS,
  WAIT_MINUS,
  WAIT_PLUS,
  copyWaitingState,
  emptyWaitingState,
  makeWaitingSlots,
  nearestReturningOrientation,
  waitingBeat,
  waitingBeatBack,
  waitingEnergy,
  waitingGaussHolds,
  type BeatLog,
  type PassOrder,
} from '@/code/rule/waiting-slots'
import {
  copyReflectingState,
  emptyReflectingState,
  makeReflectingSlots,
  reflectBeat,
  reflectBeatBack,
  reflectColorLeaks,
  reflectEnergy,
  reflectGaussHolds,
  type ReflectLog,
  type ReflectingSlots,
  type ReflectingState,
} from '@/code/rule/reflecting-slots'

const SIDE = 7
const BEATS = 600
const WAIT_FILLS = [0.02, 0.05, 0.1, 0.2]
const REFLECT_FILLS = [0.02, 0.05, 0.1, 0.2, 0.35, 0.5, 1]
const GOLDEN = (Math.sqrt(5) - 1) / 2
const MESON = { signs: [1, -1], fluxes: [1], slots: [5, 14] }
const BARYONS = { signs: [1, 1, 1, -1, -1, -1], fluxes: [1, 2, 3, 2, 1], slots: [5, 9, 14, 18, 7, 20] }

type Seed = { signs: number[]; fluxes: number[]; slots: number[] }

type Run = {
  exact: boolean
  reverses: boolean
  meanGap: number
  meanSpread: number
  travel: number
  paid: number
  unpaid: number
  lowestDemon: number
  // pairs the waiting line's paid clock made from calm
  created: number
}

const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))
const mean = (ps: number[][]): number[] => [0, 1, 2, 3].map(i => ps.reduce((s, p) => s + (p[i] ?? 0), 0) / ps.length)
const demonFill = (links: number, fill: number): Int32Array => Int32Array.from({ length: links }, (_, l) => (((l + 1) * GOLDEN) % 1 < fill ? 1 : 0))

// follows tagged charges hop by hop and gathers the gap, spread and travel
function tracker(input: { signs: number[]; cells: number[]; neighbour: Int32Array; slots: number }): {
  step: (tag: Int32Array) => void
  result: () => { meanGap: number; meanSpread: number; travel: number }
} {
  const { signs, neighbour, slots } = input
  const roots = rootsD4()
  const at = input.cells.map((_, k) => (roots[0] ?? []).map(x => x * k))
  const origin = mean(at)

  let cells = [...input.cells]
  let gapSum = 0
  let spreadSum = 0
  let travel = 0
  let beats = 0

  const step = (tag: Int32Array): void => {
    const now = signs.map((_, k) => Math.floor(tag.indexOf(k + 1) / slots))

    now.forEach((cell, k) => {
      if (cell !== cells[k]) {
        const d = Array.from({ length: 24 }, (_, i) => i).find(i => neighbour[(cells[k] ?? 0) * 24 + i] === cell) ?? -1

        at[k] = (at[k] ?? []).map((x, i) => x + (roots[d]?.[i] ?? Number.NaN))
      }
    })
    cells = now

    const loves = at.filter((_, k) => (signs[k] ?? 0) > 0)
    const fears = at.filter((_, k) => (signs[k] ?? 0) < 0)

    gapSum += dist(mean(loves), mean(fears))
    spreadSum += Math.max(...loves.map(p => Math.max(...loves.map(q => dist(p, q)))))
    travel = Math.max(travel, dist(mean(at), origin))
    beats += 1
  }

  return { step, result: () => ({ meanGap: gapSum / beats, meanSpread: spreadSum / beats, travel }) }
}

function row(neighbour: Int32Array, count: number, center: number): number[] {
  const cells = [center]

  for (let k = 1; k < count; k++) {
    cells.push(neighbour[(cells[k - 1] ?? 0) * 24] ?? 0)
  }

  return cells
}

function waitRun(input: { tension: number; fill: number; order: PassOrder; seed: Seed }): Run {
  const { tension, fill, order, seed } = input
  const rule = makeWaitingSlots({ side: SIDE, orientation: nearestReturningOrientation(), mass: 4, tension, order })
  const cells = row(rule.neighbour, seed.signs.length, Math.floor(rule.mesh.cellCount / 2))
  const start = emptyWaitingState(rule)

  cells.forEach((c, k) => {
    const slot = c * SLOTS + ((seed.signs[k] ?? 0) > 0 ? WAIT_PLUS : WAIT_MINUS)

    start.vibe[slot] = seed.signs[k] ?? 0
    start.tag[slot] = k + 1
  })
  seed.fluxes.forEach((e, k) => (start.flux[rule.edgeOf[(cells[k] ?? 0) * 24] ?? 0] = e))
  start.demon.set(demonFill(rule.edges.length, fill))

  const e0 = waitingEnergy(rule, start)
  const follow = tracker({ signs: seed.signs, cells, neighbour: rule.neighbour, slots: SLOTS })
  const log: BeatLog = { paid: 0, unpaid: 0, created: 0, annihilated: 0 }

  let s = copyWaitingState(start)
  let exact = waitingGaussHolds(rule, start, start)
  let lowestDemon = 0

  for (let t = 0; t < BEATS; t++) {
    s = waitingBeat(rule, s, t, log)
    exact = exact && waitingGaussHolds(rule, start, s) && waitingEnergy(rule, s) === e0
    lowestDemon = Math.min(lowestDemon, ...s.demon)
    follow.step(s.tag)
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = waitingBeatBack(rule, s, t)
  }

  const reverses =
    s.vibe.every((v, i) => v === start.vibe[i]) &&
    s.tag.every((v, i) => v === start.tag[i]) &&
    s.flux.every((v, i) => v === start.flux[i]) &&
    s.demon.every((v, i) => v === start.demon[i])

  return { exact, reverses, ...follow.result(), paid: log.paid, unpaid: log.unpaid, lowestDemon, created: log.created }
}

function reflectRun(input: { tension: number; fill: number; seed: Seed }): Run {
  const { tension, fill, seed } = input
  const rule = makeReflectingSlots({ side: SIDE, mass: 4, tension, turn: true })
  const cells = row(rule.neighbour, seed.signs.length, Math.floor(rule.mesh.cellCount / 2))
  const start = emptyReflectingState(rule, 0)

  cells.forEach((c, k) => {
    const slot = c * 24 + (seed.slots[k] ?? 0)

    start.vibe[slot] = seed.signs[k] ?? 0
    start.sign[slot] = seed.signs[k] ?? 0
    start.tag[slot] = k + 1
  })
  seed.fluxes.forEach((e, k) => (start.flux[rule.edgeAt[(cells[k] ?? 0) * 24] ?? 0] = e))
  start.demon.set(demonFill(rule.edges.length, fill))

  const e0 = reflectEnergy(rule, start)
  const follow = tracker({ signs: seed.signs, cells, neighbour: rule.neighbour, slots: 24 })
  const log: ReflectLog = { crossed: 0, bounced: 0 }

  let s = copyReflectingState(start)
  let exact = true
  let lowestDemon = 0

  for (let t = 0; t < BEATS; t++) {
    s = reflectBeat(rule, s, t, log)
    exact = exact && reflectGaussHolds(rule, start, s) && reflectEnergy(rule, s) === e0
    lowestDemon = Math.min(lowestDemon, ...s.demon)
    follow.step(s.tag)
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = reflectBeatBack(rule, s, t)
  }

  const reverses =
    s.vibe.every((v, i) => v === start.vibe[i]) &&
    s.sign.every((v, i) => v === start.sign[i]) &&
    s.tag.every((v, i) => v === start.tag[i]) &&
    s.flux.every((v, i) => v === start.flux[i]) &&
    s.demon.every((v, i) => v === start.demon[i])

  return { exact, reverses, ...follow.result(), paid: log.crossed, unpaid: 0, lowestDemon, created: 0 }
}

// the reflecting rule's local laws on a dense side-3 start: color with the sign carried and fixed, and a
// change of role frame in every cell
function reflectLocal(): { leaks: number; fixedLeaks: number; cellSteps: number; frameFree: boolean } {
  const rule = makeReflectingSlots({ side: 3, mass: 4, tension: 1, turn: true })
  const dense = (scale: number): ReflectingState => {
    const s = emptyReflectingState(rule, 0)

    for (let i = 0; i < s.vibe.length; i++) {
      const u = ((i + 1) * GOLDEN * scale) % 1

      s.vibe[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
      s.role[i] = Math.floor(((i + 3) * GOLDEN * 9 * scale) % 9)
    }

    s.demon.set(Int32Array.from({ length: s.demon.length }, (_, l) => Math.floor(((l + 1) * GOLDEN * 3.1) % 3)))

    return s
  }
  const sides = Int8Array.from({ length: 24 }, (_, d) => (d < (rule.opposite[d] ?? d) ? 1 : -1))

  let s = dense(1.37)
  let leaks = 0
  let fixedLeaks = 0

  for (let t = 0; t < 48; t++) {
    leaks += reflectColorLeaks({ rule, state: s, t })
    fixedLeaks += reflectColorLeaks({ rule, state: s, t, fixed: sides })
    s = reflectBeat(rule, s, t)
  }

  const { moves, mesh, neighbour } = rule
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const links = new Int16Array(rule.links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      links[x * 24 + d] = moves.compose(
        moves.compose(frame[neighbour[x * 24 + d] ?? 0] ?? moves.identity, rule.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged: ReflectingSlots = { ...rule, links }
  const gauge = (state: ReflectingState): ReflectingState => ({
    ...state,
    role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0),
  })

  let a = dense(2.11)
  let b = gauge(a)
  let frameFree = true

  for (let t = 0; t < 24; t++) {
    a = reflectBeat(rule, a, t)
    b = reflectBeat(gauged, b, t)

    const g = gauge(a)

    frameFree = frameFree && g.role.every((p, i) => p === b.role[i]) && a.vibe.every((v, i) => v === b.vibe[i])
  }

  return { leaks, fixedLeaks, cellSteps: 48 * 2 * mesh.cellCount, frameFree }
}

export default experiment({
  id: 'gauge/slot-binding',
  code: 'E-FRC-0133',
  title:
    'moving binding in the committed slot architecture: waiting slots do not bind, since most of their string crossings go unpaid, while a crossing that bounces when it cannot be paid, with the sign of a calm slot carried by what it holds, binds a meson and a baryon when cold and melts when warm, keeping color local, but the bound pair is stuck where E-FRC-0131 moved',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const waitScan = WAIT_FILLS.map(fill => ({
      fill,
      meson: waitRun({ tension: 1, fill, order: 'leave-first', seed: MESON }),
      baryon: waitRun({ tension: 1, fill, order: 'leave-first', seed: BARYONS }),
    }))
    const waitCold = waitScan[0]!
    const waitMesonControl = waitRun({ tension: 0, fill: waitCold.fill, order: 'leave-first', seed: MESON })
    const waitBaryonControl = waitRun({ tension: 0, fill: waitCold.fill, order: 'leave-first', seed: BARYONS })
    const waitFirst = waitRun({ tension: 1, fill: waitCold.fill, order: 'wait-first', seed: MESON })

    const reflectScan = REFLECT_FILLS.map(fill => ({
      fill,
      meson: reflectRun({ tension: 1, fill, seed: MESON }),
      baryon: reflectRun({ tension: 1, fill, seed: BARYONS }),
    }))
    const reflectCold = reflectScan[0]!
    const reflectHot = reflectScan[reflectScan.length - 1]!
    const reflectMesonControl = reflectRun({ tension: 0, fill: reflectCold.fill, seed: MESON })
    const reflectBaryonControl = reflectRun({ tension: 0, fill: reflectCold.fill, seed: BARYONS })
    const local = reflectLocal()

    const all = [
      ...waitScan.flatMap(s => [s.meson, s.baryon]),
      waitMesonControl,
      waitBaryonControl,
      waitFirst,
      ...reflectScan.flatMap(s => [s.meson, s.baryon]),
      reflectMesonControl,
      reflectBaryonControl,
    ]
    const exact = all.every(r => r.exact && r.reverses)
    const reflectNeverInDebt = [...reflectScan.flatMap(s => [s.meson, s.baryon]), reflectMesonControl, reflectBaryonControl].every(r => r.lowestDemon >= 0)

    const ok =
      exact &&
      reflectNeverInDebt &&
      waitCold.meson.meanGap > waitMesonControl.meanGap / 10 &&
      waitCold.meson.unpaid > waitCold.meson.paid &&
      reflectCold.meson.meanGap < 4 &&
      reflectCold.meson.meanGap < reflectMesonControl.meanGap / 10 &&
      reflectCold.baryon.meanSpread < reflectBaryonControl.meanSpread / 10 &&
      reflectHot.meson.meanGap > 10 * reflectCold.meson.meanGap &&
      local.leaks === 0 &&
      local.fixedLeaks > 0 &&
      local.frameFree &&
      reflectCold.meson.travel < 10

    const key = (fill: number): string => String(fill).replace('.', '_')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "every run keeps Gauss's law and the energy exact and reverses to the bit; with waiting slots the coldest meson's mean gap is more than a tenth of the tensionless control's and its unpaid string crossings outnumber its paid ones, so it is not bound; with reflecting slots no demon goes below zero, the coldest meson's mean gap is under 4 and under a tenth of its control's, the baryon's spread under a tenth of its control's, the hottest meson's gap more than ten times the coldest, color stays local where the fixed-sign reading leaks, a frame change commutes, and the cold bound meson travels under 10",
      metrics: {
        exactAndReversible: exact ? 1 : 0,
        reflectNeverInDebt: reflectNeverInDebt ? 1 : 0,
        ...Object.fromEntries(
          waitScan.flatMap(s => [
            [`waitMesonMeanGapFill${key(s.fill)}`, s.meson.meanGap],
            [`waitMesonTravelFill${key(s.fill)}`, s.meson.travel],
            [`waitMesonUnpaidFill${key(s.fill)}`, s.meson.unpaid],
            [`waitMesonPaidFill${key(s.fill)}`, s.meson.paid],
            [`waitMesonLowestDemonFill${key(s.fill)}`, s.meson.lowestDemon],
            [`waitBaryonSpreadFill${key(s.fill)}`, s.baryon.meanSpread],
            [`waitBaryonTravelFill${key(s.fill)}`, s.baryon.travel],
          ]),
        ),
        waitFirstMesonMeanGap: waitFirst.meanGap,
        waitFirstMesonUnpaid: waitFirst.unpaid,
        waitFirstMesonPaid: waitFirst.paid,
        ...Object.fromEntries(
          reflectScan.flatMap(s => [
            [`reflectMesonMeanGapFill${key(s.fill)}`, s.meson.meanGap],
            [`reflectMesonTravelFill${key(s.fill)}`, s.meson.travel],
            [`reflectBaryonSpreadFill${key(s.fill)}`, s.baryon.meanSpread],
            [`reflectBaryonTravelFill${key(s.fill)}`, s.baryon.travel],
            [`reflectBaryonAntibaryonGapFill${key(s.fill)}`, s.baryon.meanGap],
          ]),
        ),
        reflectColorLeaks: local.leaks,
        reflectCellSteps: local.cellSteps,
        reflectFrameFree: local.frameFree ? 1 : 0,
      },
      control: {
        waitTensionlessMesonMeanGap: waitMesonControl.meanGap,
        waitTensionlessMesonTravel: waitMesonControl.travel,
        waitTensionlessBaryonSpread: waitBaryonControl.meanSpread,
        reflectTensionlessMesonMeanGap: reflectMesonControl.meanGap,
        reflectTensionlessMesonTravel: reflectMesonControl.travel,
        reflectTensionlessBaryonSpread: reflectBaryonControl.meanSpread,
        reflectFixedSignColorLeaks: local.fixedLeaks,
        waitColdMesonPairsCreated: waitCold.meson.created,
        cells: SIDE ** 4,
      },
      notes:
        "L2, exact integers, no random numbers. Distances in the D4 lattice's own units (a root has length sqrt 2), unwrapped hop by hop. For comparison, E-FRC-0131 recorded at its coldest fill a meson mean gap of 1.72 while travelling 34, against 122 with no tension, and a baryon spread of 2.7 against 228, melting between the fills 0.05 and 0.1. Waiting slots: a charge with no direction it can pay for must cross in debt (E-FRC-0132), so the string is mostly paid for by debt and binds nothing, whichever pass runs first. Reflecting slots: nothing crosses unpaid, and the paid move binds, but what it does when it cannot pay is reverse the charge, so a cold neutral pair settles in one cell and every way out of it costs a unit of tension that a cold demon rarely has. It moves only as it melts, between the fills 0.2 and 0.35 (a finer probe read mean gap 4.6 with travel 8 at 0.22 and gap 9.8 with travel 12 at 0.32, over 1,200 beats). At fill 1, where every link starts with a unit, no crossing ever bounces and the meson separates exactly as its control does. With waiting slots the tensionless baryon stays together (its three loves turn in step), and the debt spreads it: the spread with tension is larger than without. Without the turning step the cold meson does not move at all (travel 0, tmp/probe-reflect). So moving binding in the slot architecture is not shown: E-FRC-0131's cells, where a charge that cannot pay stays where it is, remain the only rule measured here in which a bound pair travels.",
    })
  },
})
