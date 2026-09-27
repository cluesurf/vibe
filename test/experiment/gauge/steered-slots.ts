// The reflecting slots of E-FRC-0133 with two additions tried for moving binding, checked on every local law.
//
// E-FRC-0133 bound a pair in the committed slot architecture (every content moves on every beat, across its
// link or bounced back) but the cold pair was stuck. Two additions to code/rule/reflecting-slots were built
// to free it, and this checks that neither breaks anything the rule had:
// - steering: the turning step becomes a trade, on couples of lines (every pair of lines in turn, the 11
//   matchings of a round robin, or the turning weave's own couples), of each slot with the matching slot of
//   the other line, where exactly one of the two holds a
//   charge and exactly one of the two links they point along carries string. A charge turns onto its
//   string or off it. It is its own inverse, reads only the flux, and moves whole contents
// - a carried store: every slot's contents carry a store of energy. A lone charge crossing a link pays the
//   change in string energy from its own store and is paid into it, and every few beats (the contact
//   period) a lone charge on a link trades its store with that link's demon. A link with two charges on it
//   still pays from the demon
// Gates, on the side-3 D4 box, a dense fixed start (golden-ratio fill of vibes, role points and demons, and
// stores of 0 to 2 on every charge), tension 1, mass 4, 48 beats, for the round-robin steered rule, the
// weave-steered rule, the round-robin rule with stores and contact every 4 beats, and with stores and no
// contact:
// - exact reversal of vibes, roles, signs, tags, flux, demons and stores
// - charge, energy to the unit and Gauss's law at every cell on every beat, and no demon or store below zero
// - color: the cell steps (contact, steering, the line trades) change no cell's color with the sign carried,
//   and the same steps read with the sign fixed by the slot must change some (the control)
// - a change of role frame in every cell, links changed to match, commutes for 24 beats
// - and the additions act: the steered run's vibes differ from the unsteered one's, and the carried run's
//   stores change
//
// Depth L2: constructed rules against stated gates, exact integers, no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  emptyReflectingState,
  makeReflectingSlots,
  reflectBeat,
  reflectBeatBack,
  reflectColorLeaks,
  reflectEnergy,
  reflectGaussHolds,
  type ReflectingSlots,
  type ReflectingState,
} from '@/code/rule/reflecting-slots'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BEATS = 48

const same = (a: ReflectingState, b: ReflectingState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) &&
  a.role.every((v, i) => v === b.role[i]) &&
  a.sign.every((v, i) => v === b.sign[i]) &&
  a.tag.every((v, i) => v === b.tag[i]) &&
  a.flux.every((v, i) => v === b.flux[i]) &&
  a.demon.every((v, i) => v === b.demon[i]) &&
  a.store.every((v, i) => v === b.store[i])

function dense(rule: ReflectingSlots, scale: number): ReflectingState {
  const s = emptyReflectingState(rule, 0)

  for (let i = 0; i < s.vibe.length; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1
    const v = u < 0.2 ? -1 : u < 0.8 ? 0 : 1

    s.vibe[i] = v
    s.role[i] = Math.floor(((i + 3) * GOLDEN * 9 * scale) % 9)
    s.tag[i] = i
    s.store[i] = v !== 0 ? Math.floor(((i + 7) * GOLDEN * 3 * scale) % 3) : 0
  }

  s.demon.set(Int32Array.from({ length: s.demon.length }, (_, l) => Math.floor(((l + 1) * GOLDEN * 3.1) % 3)))

  return s
}

function laws(rule: ReflectingSlots): {
  reverses: boolean
  chargeKept: boolean
  energyKept: boolean
  gauss: boolean
  nonNegative: boolean
  leaks: number
  fixedLeaks: number
  frameFree: boolean
  storeChanges: number
  end: ReflectingState
} {
  const start = dense(rule, 1.37)
  const charge = (s: ReflectingState): number => s.vibe.reduce((a, b) => a + b, 0)
  const e0 = reflectEnergy(rule, start)
  const sides = Int8Array.from({ length: 24 }, (_, d) => (d < (rule.opposite[d] ?? d) ? 1 : -1))

  let s = start
  let chargeKept = true
  let energyKept = true
  let gauss = true
  let nonNegative = true
  let leaks = 0
  let fixedLeaks = 0

  for (let t = 0; t < BEATS; t++) {
    leaks += reflectColorLeaks({ rule, state: s, t })
    fixedLeaks += reflectColorLeaks({ rule, state: s, t, fixed: sides })
    s = reflectBeat(rule, s, t)
    chargeKept = chargeKept && charge(s) === charge(start)
    energyKept = energyKept && reflectEnergy(rule, s) === e0
    gauss = gauss && reflectGaussHolds(rule, start, s)
    nonNegative = nonNegative && s.demon.every(x => x >= 0) && s.store.every(x => x >= 0)
  }

  const end = s
  const storeChanges = end.store.filter((k, i) => k !== start.store[i]).length

  for (let t = BEATS - 1; t >= 0; t--) {
    s = reflectBeatBack(rule, s, t)
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

  let a = dense(rule, 2.11)
  let b = gauge(a)
  let frameFree = true

  for (let t = 0; t < 24; t++) {
    a = reflectBeat(rule, a, t)
    b = reflectBeat(gauged, b, t)
    frameFree = frameFree && same(gauge(a), b)
  }

  return { reverses: same(s, start), chargeKept, energyKept, gauss, nonNegative, leaks, fixedLeaks, frameFree, storeChanges, end }
}

export default experiment({
  id: 'gauge/steered-slots',
  code: 'E-FRC-0146',
  title:
    'steering a charge onto or off its string, and letting each charge carry its own store of energy, keep every local law of the reflecting slots exact: reversal, charge, energy to the unit, Gauss, no demon or store below zero, local color with the sign carried, and a change of frame in every cell',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const shape = { side: 3, mass: 4, tension: 1, turn: false }
    const steered = laws(makeReflectingSlots({ ...shape, steer: 'round-robin' }))
    const weave = laws(makeReflectingSlots({ ...shape, steer: 'weave' }))
    const contact = laws(makeReflectingSlots({ ...shape, steer: 'round-robin', carry: true, contact: 4 }))
    const isolated = laws(makeReflectingSlots({ ...shape, steer: 'round-robin', carry: true, contact: 0 }))
    const straight = laws(makeReflectingSlots(shape))
    const runs = [steered, weave, contact, isolated]
    const steeringActs = steered.end.vibe.some((v, i) => v !== straight.end.vibe[i])

    const ok =
      runs.every(r => r.reverses && r.chargeKept && r.energyKept && r.gauss && r.nonNegative && r.leaks === 0 && r.fixedLeaks > 0 && r.frameFree) &&
      steeringActs &&
      contact.storeChanges > 0 &&
      isolated.storeChanges > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "for the steered rule, and for it with carried stores with and without contact, 48 beats reverse exactly, charge, energy and Gauss's law hold on every beat, no demon or store goes below zero, no cell step changes a cell's color with the sign carried while the fixed-sign reading does, a frame change in every cell commutes, steering changes the run and the stores move",
      metrics: {
        reversesExactly: runs.every(r => r.reverses) ? 1 : 0,
        chargeConserved: runs.every(r => r.chargeKept) ? 1 : 0,
        energyConserved: runs.every(r => r.energyKept) ? 1 : 0,
        gaussEveryCellEveryBeat: runs.every(r => r.gauss) ? 1 : 0,
        nothingBelowZero: runs.every(r => r.nonNegative) ? 1 : 0,
        steeredColorLeaks: steered.leaks,
        weaveSteeredColorLeaks: weave.leaks,
        carriedColorLeaks: contact.leaks,
        isolatedColorLeaks: isolated.leaks,
        frameFree: runs.every(r => r.frameFree) ? 1 : 0,
        vibesSteeringChanged: steered.end.vibe.filter((v, i) => v !== straight.end.vibe[i]).length,
        storesChangedWithContact: contact.storeChanges,
        storesChangedIsolated: isolated.storeChanges,
      },
      control: {
        steeredFixedSignColorLeaks: steered.fixedLeaks,
        weaveSteeredFixedSignColorLeaks: weave.fixedLeaks,
        carriedFixedSignColorLeaks: contact.fixedLeaks,
        isolatedFixedSignColorLeaks: isolated.fixedLeaks,
        straightReverses: straight.reverses ? 1 : 0,
      },
      notes:
        'L2, exact integers, no random numbers. A store belongs to what a slot holds and moves with it through every trade and bounce, so it never touches color or the frame. The steering condition reads only the flux, which no cell step changes, and the same pair of slots satisfies it before and after a trade, which is what makes it its own inverse. Steering replaces the turning weave\'s lone-charge turn rather than running beside it, so a charge with no string near it never turns and flies straight. E-FRC-0147 measures what each addition does to binding.',
    })
  },
})
