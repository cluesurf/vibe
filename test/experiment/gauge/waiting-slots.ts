// The waiting-slot rule the path argued for, built and measured: exact in every structural gate, and unable
// to pay for its moves.
//
// note/experiment/gauge/what-the-base-needs ends with an argued derivation: moving binding in the committed
// slot architecture (every moving slot streams every beat) needs two waiting slots per cell, one per sign
// class, and a returning orientation of the lines (one of the 3,904 of 4,096 whose plus class holds a
// zero-sum triangle, E-FRC-0130), with the clock and the paid move written as conditional involutions. This
// builds that rule (code/rule/waiting-slots) and measures it on its own terms.
//
// 1. The orientation: the returning one nearest the committed (fewest lines flipped, then the lowest mask),
//    and the zero-sum triangles inside its plus class against the committed class's.
// 2. Structural gates on the side-3 D4 box, a dense fixed start (golden-ratio fill, every slot, demons 0 to
//    2), tension 1, mass 4, 48 beats: exact reversal of vibes, roles, flux and demons, charge every beat,
//    energy to the unit every beat, Gauss's law at every cell every beat, the color of every cell unchanged
//    by every collision (the E-FRC-0124 instrument, calm counted with its slot's sign), and a change of role
//    frame in every cell commuting with the rule for 24 beats. Controls: the same rule with each waiting slot
//    trading with the other side's moving slots must leak color, and its paid clock must actually fire.
// 3. The cell where nothing can be paid: flux 0 and demons 0 around a cell, so every one of the 12
//    directions of a lone charge's side costs tension and none can be paid. For each of the 13 places the
//    lone charge can be in before the collision (its 12 moving slots, its waiting slot), where it is after.
//    A rule that runs backward sends these 13 states to 13 different states. Only its one waiting slot is
//    paid for, so at least 12 of them must end in a moving slot and cross unpaid. Adding waiting slots adds
//    as many states before the step as after it, so the 12 does not shrink for any number of them. The gate
//    is that the rule meets this bound exactly, for a love and a fear and for both orders of its passes, and
//    that with no tension none crosses unpaid.
// 4. Does a lone part come back: a lone love with no tension, from each of its 12 directions, followed for
//    480 beats on side 5, under the returning and the committed orientation.
// 5. Debt in motion: the unpaid crossings of the dense run.
//
// Depth L2: a constructed rule against stated gates, with the bound in 3 an exact count. Every number here is
// integer and deterministic, with no random number anywhere.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  SLOTS,
  WAIT_MINUS,
  WAIT_PLUS,
  canPay,
  emptyWaitingState,
  makeWaitingSlots,
  nearestReturningOrientation,
  plusTriangles,
  waitingBeat,
  waitingBeatBack,
  waitingCollide,
  waitingColorLeaks,
  waitingEnergy,
  waitingGaussHolds,
  type BeatLog,
  type PassOrder,
  type WaitingSlots,
  type WaitingState,
} from '@/code/rule/waiting-slots'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BEATS = 48
const LONE_BEATS = 480

const same = (a: WaitingState, b: WaitingState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) &&
  a.role.every((v, i) => v === b.role[i]) &&
  a.tag.every((v, i) => v === b.tag[i]) &&
  a.flux.every((v, i) => v === b.flux[i]) &&
  a.demon.every((v, i) => v === b.demon[i])

function dense(rule: WaitingSlots, scale: number): WaitingState {
  const s = emptyWaitingState(rule)

  for (let i = 0; i < s.vibe.length; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    s.vibe[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    s.role[i] = Math.floor(((i + 3) * GOLDEN * 9 * scale) % 9)
    s.tag[i] = i
  }

  for (let l = 0; l < s.demon.length; l++) {
    s.demon[l] = Math.floor(((l + 1) * GOLDEN * 3.1) % 3)
  }

  return s
}

function structure(rule: WaitingSlots): {
  reverses: boolean
  chargeKept: boolean
  energyKept: boolean
  gauss: boolean
  leaks: number
  cellBeats: number
  frameFree: boolean
  log: BeatLog
} {
  const start = dense(rule, 1.37)
  const charge = (s: WaitingState): number => s.vibe.reduce((a, b) => a + b, 0)
  const e0 = waitingEnergy(rule, start)
  const log: BeatLog = { paid: 0, unpaid: 0, created: 0, annihilated: 0 }

  let s = start
  let leaks = 0
  let chargeKept = true
  let energyKept = true
  let gauss = true

  for (let t = 0; t < BEATS; t++) {
    leaks += waitingColorLeaks(rule, s, t)
    s = waitingBeat(rule, s, t, log)
    chargeKept = chargeKept && charge(s) === charge(start)
    energyKept = energyKept && waitingEnergy(rule, s) === e0
    gauss = gauss && waitingGaussHolds(rule, start, s)
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = waitingBeatBack(rule, s, t)
  }

  // a change of role frame in every cell, links changed to match
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

  const gauged: WaitingSlots = { ...rule, links }
  const gauge = (state: WaitingState): WaitingState => ({
    ...state,
    role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / SLOTS)] ?? moves.identity]?.[p] ?? 0),
  })

  let a = dense(rule, 2.11)
  let b = gauge(a)
  let frameFree = true

  for (let t = 0; t < 24; t++) {
    a = waitingBeat(rule, a, t)
    b = waitingBeat(gauged, b, t)
    frameFree = frameFree && same(gauge(a), b)
  }

  return { reverses: same(s, start), chargeKept, energyKept, gauss, leaks, cellBeats: BEATS * mesh.cellCount, frameFree, log }
}

// the cell where nothing can be paid: how many of the 13 places of a lone charge end in a moving slot it
// cannot pay for, and whether the 13 end in 13 different places
function blocked(input: { orientation: number; order: PassOrder; tension: number; sign: number }): { places: number; unpaid: number; distinct: number } {
  const { orientation, order, tension, sign } = input
  const rule = makeWaitingSlots({ side: 3, orientation, mass: 4, tension, order })
  const x = Math.floor(rule.mesh.cellCount / 2)
  const places = [...(rule.classes[sign > 0 ? 0 : 1] ?? []), sign > 0 ? WAIT_PLUS : WAIT_MINUS]
  const ends = places.map(p => {
    const s = emptyWaitingState(rule)

    s.vibe[x * SLOTS + p] = sign
    waitingCollide(rule, s, 0)

    const at = s.vibe.findIndex(v => v !== 0)

    return { slot: at - x * SLOTS, unpaid: at - x * SLOTS < 24 && !canPay(rule, s, x, at - x * SLOTS, sign) }
  })

  return { places: places.length, unpaid: ends.filter(e => e.unpaid).length, distinct: new Set(ends.map(e => e.slot)).size }
}

// a lone love with no tension from each of its directions: how many come back to their start, and how far
// they are after the run
function lone(orientation: number): { returning: number; meanDistance: number } {
  const roots = rootsD4()
  const rule = makeWaitingSlots({ side: 5, orientation, mass: 4, tension: 0 })
  const x = Math.floor(rule.mesh.cellCount / 2)
  const runs = (rule.classes[0] ?? []).map(h => {
    let s = emptyWaitingState(rule)

    s.vibe[x * SLOTS + h] = 1
    s.tag[x * SLOTS + h] = 1

    let at = [0, 0, 0, 0]
    let cell = x
    let moved = false
    let returned = false

    for (let t = 0; t < LONE_BEATS; t++) {
      s = waitingBeat(rule, s, t)

      const now = Math.floor(s.tag.indexOf(1) / SLOTS)

      if (now !== cell) {
        const d = Array.from({ length: 24 }, (_, i) => i).find(i => rule.neighbour[cell * 24 + i] === now) ?? -1

        at = at.map((v, i) => v + (roots[d]?.[i] ?? Number.NaN))
        cell = now
      }

      moved = moved || at.some(v => v !== 0)
      returned = returned || (moved && at.every(v => v === 0))
    }

    return { returned, distance: Math.hypot(...at) }
  })

  return { returning: runs.filter(r => r.returned).length, meanDistance: runs.reduce((a, r) => a + r.distance, 0) / runs.length }
}

export default experiment({
  id: 'gauge/waiting-slots',
  code: 'E-FRC-0132',
  title:
    "the waiting-slot rule built as the path argued it (two waiting slots per cell, a returning orientation, local color, a paid clock and a paid move) is exact in every structural gate, but a charge that cannot pay cannot wait: in a cell where no direction can be paid, 12 of the 13 places a lone charge can be in must cross unpaid, for any number of waiting slots, so its demons go into debt",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const orientation = nearestReturningOrientation()
    const triangles = plusTriangles(orientation).length
    const committedTriangles = plusTriangles(0).length

    const rule = makeWaitingSlots({ side: 3, orientation, mass: 4, tension: 1 })
    const crossed = makeWaitingSlots({ side: 3, orientation, mass: 4, tension: 1, pairing: 'crossed' })
    const main = structure(rule)
    const control = structure(crossed)

    const cases = (['leave-first', 'wait-first'] as PassOrder[]).flatMap(order =>
      [1, -1].map(sign => ({ order, sign, paid: blocked({ orientation, order, tension: 1, sign }), free: blocked({ orientation, order, tension: 0, sign }) })),
    )
    const places = cases.map(c => c.paid.places)
    const blockedUnpaid = cases.map(c => c.paid.unpaid)
    const freeUnpaid = cases.map(c => c.free.unpaid)
    const distinct = cases.map(c => c.paid.distinct)

    const returning = lone(orientation)
    const committed = lone(0)

    const ok =
      triangles > 0 &&
      committedTriangles === 0 &&
      main.reverses &&
      main.chargeKept &&
      main.energyKept &&
      main.gauss &&
      main.leaks === 0 &&
      main.frameFree &&
      main.log.created > 0 &&
      control.leaks > 0 &&
      // the bound: of the places a lone charge can be in, all but its one waiting slot must cross unpaid
      blockedUnpaid.every((n, k) => n === (places[k] ?? 0) - 1) &&
      distinct.every((n, k) => n === places[k]) &&
      freeUnpaid.every(n => n === 0) &&
      main.log.unpaid > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the returning orientation's plus class holds zero-sum triangles where the committed one holds none, the rule reverses exactly, keeps charge, energy and Gauss's law on every beat, leaks no color from any cell on any collision (the crossed control leaks), commutes with a frame change in every cell, and fires its paid clock, while in a cell where no direction can be paid exactly 12 of the 13 places of a lone love or fear end in a moving slot it cannot pay for, the fewest any reversible rule allows, in both pass orders, none with no tension, and the dense run crosses unpaid",
      metrics: {
        orientation,
        plusTriangles: triangles,
        reversesExactly: main.reverses ? 1 : 0,
        chargeConserved: main.chargeKept ? 1 : 0,
        energyConserved: main.energyKept ? 1 : 0,
        gaussEveryCellEveryBeat: main.gauss ? 1 : 0,
        colorLeaks: main.leaks,
        cellBeats: main.cellBeats,
        frameFree: main.frameFree ? 1 : 0,
        pairsCreated: main.log.created,
        pairsAnnihilated: main.log.annihilated,
        blockedPlaces: Math.min(...places),
        blockedUnpaidLoveLeaveFirst: blockedUnpaid[0] ?? -1,
        blockedUnpaidFearLeaveFirst: blockedUnpaid[1] ?? -1,
        blockedUnpaidLoveWaitFirst: blockedUnpaid[2] ?? -1,
        blockedUnpaidFearWaitFirst: blockedUnpaid[3] ?? -1,
        blockedDistinctEnds: Math.min(...distinct),
        denseCrossingsPaid: main.log.paid,
        denseCrossingsUnpaid: main.log.unpaid,
        loneReturningStarts: returning.returning,
        loneMeanDistance: returning.meanDistance,
      },
      control: {
        committedPlusTriangles: committedTriangles,
        crossedPairingColorLeaks: control.leaks,
        freeUnpaid: Math.max(...freeUnpaid),
        committedLoneReturningStarts: committed.returning,
        committedLoneMeanDistance: committed.meanDistance,
        loneBeats: LONE_BEATS,
      },
      notes:
        'L2, exact integers, no random numbers. The derivation was right that color allows a charge to trade only with a waiting slot of its own sign (the crossed control leaks), and that a returning orientation puts triangles in a class. It was wrong that waiting rescues the paid move: the stream moves every charge in a moving slot, so a charge that cannot pay must be in a waiting slot afterwards whether it just arrived or was already waiting, and a reversible rule cannot send both there. The count is 12 unpaid places of 13 for one waiting slot per side and stays 12 for any number, since each waiting slot adds a place before the step and after it. So the demons are allowed below zero (a debt, counted) or the rule would not run backward. A lone love with no tension does not come back under either orientation: the rule turns it through its class in a fixed order and it drifts, so a returning orientation makes a return possible without making this rule take it. E-FRC-0133 measures what the debt does to binding, and what works instead.',
    })
  },
})
