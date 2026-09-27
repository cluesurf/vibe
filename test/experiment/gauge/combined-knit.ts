// The combined knit, built and checked piece by piece: one rule carrying the head-on turn base, the four-line
// scatter block, the folded round robin with steering as an option, and the fear beat's color mode
// (code/rule/combined-knit).
//
// Each piece is owned by another experiment. Switched on alone, each must reproduce that experiment's own
// rule bit for bit, on a side-3 D4 box, from deterministic golden-ratio fills:
// 1. the base alone is the head-on turn weave: vibes equal colorLocalCollision(HEAD_TURN_SPEC) through the
//    lattice gas and role points equal colorLocalBeat, every slot, 48 beats; and the dock collision equals
//    colorLocalCollision on 400 sample states per beat (E-FLD-0024's base)
// 2. with the scatter block, vibes and role points equal scatterBeat (code/rule/scatter-weave, the head-on
//    turn base, mirror 23, scatterSchedule), 48 beats, and the dock collision equals scatterCollision
//    (E-FLD-0024)
// 3. folded with lone steering and no block, on the color turn base, vibes and flux equal knitBeat
//    (code/rule/steered-knit, E-FRC-0152 and E-FRC-0153's rule), 48 beats from steered-acceptance's dense
//    state; the same on the head-on base
// 4. the fear beat's records on the color turn base with no block: every meeting, its two vibes' signs,
//    every crossing, every token, vibe and classical role point equal fearBeat with colorLocalKnit
//    (E-QTM-0109's knit), dock 0's 24 tokens open, 96 beats on E-QTM-0109's matter fill (scale 2.11); and
//    the whole advanced in color mode over the two record lists is the same whole
// 5. the classical layer never reads the whole: the same run with every dock-0 token open and with none open
//    gives the same vibes, tokens and flux at every beat, with every piece on
// 6. everything on at once (head-on base, folded, block, lone steering, dock 0 open), 48 beats forward and
//    back restore vibes, tokens, role points and flux exactly, and the whole of the matter pair in fixed
//    units returns to its start
// Controls: the block, the fold and steering each change the vibes of the same fill within 48 beats, so the
// agreements are not vacuous.
// Also measured and printed: the CPT mirror phase of the head-on base unfolded and folded, and of the
// combined knit (block on) with the block placed at that phase, since the block's placement needs it.
//
// Depth L2: a constructed rule checked against the rules it combines.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type Collision } from '@/code/rule/collision'
import { collide, stream } from '@/code/rule/lattice-gas'
import { colorLocalBeat, colorLocalCollision, makeColorLocalWeave } from '@/code/rule/color-local-weave'
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { HEAD_TURN_SPEC, makeScatterWeave, scatterBeat, scatterCollision, scatterSchedule } from '@/code/rule/scatter-weave'
import { foldRoundRobin, knitBeat, makeSteeredKnit, type KnitState } from '@/code/rule/steered-knit'
import { advanceWhole, colorLocalKnit, fearBeat, fearKernels, makeLattice, type BeatRecord, type Whole } from '@/code/rule/fear-weave'
import {
  combinedBeat,
  combinedBeatBack,
  combinedCollision,
  combinedState,
  makeCombinedKnit,
  rolesOf,
  type CombinedKnitSpec,
  type CombinedState,
} from '@/code/rule/combined-knit'
import { denseKnitState } from '@/code/measure/steered-acceptance'
import { cptMirrorPhase, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { type VibeState } from '@/code/rule/vibe-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 48
const FEAR_BEATS = 96
const SAMPLES = 400
const MATTER_SCALE = 2.11

function golden(slots: number, scale: number): { vibe: Int8Array; point: Int8Array } {
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    point[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
  }

  return { vibe, point }
}

function sampleVector(n: number): Int8Array {
  const v = new Int8Array(24)

  for (let i = 0; i < 24; i++) {
    v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1
  }

  return v
}

const applyCell = (collision: Collision, v: Int8Array): Int8Array => {
  const out = Int8Array.from(v)

  collision(out, 0, 24)

  return out
}

// dock-level: two collision factories agree on every sample state at every beat, forward and back
function docksAgree(a: (forward: boolean) => (t: number) => Collision, b: (forward: boolean) => (t: number) => Collision): number {
  let mismatches = 0

  for (const forward of [true, false]) {
    const fa = a(forward)
    const fb = b(forward)

    for (let t = 0; t < 24; t++) {
      for (let n = 0; n < SAMPLES; n++) {
        const v = sampleVector(n * 13 + t)

        mismatches += applyCell(fa(t), v).every((x, d) => x === applyCell(fb(t), v)[d]) ? 0 : 1
      }
    }
  }

  return mismatches
}

const differ = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

const noneOpen = (slots: number): Uint8Array => new Uint8Array(slots)

export default experiment({
  id: 'gauge/combined-knit',
  code: 'E-FRC-0158',
  title:
    'one knit carrying the head-on turn base, the four-line scatter block, the folded round robin with lone steering, and the fear beat in color mode: each piece switched on alone reproduces the rule of the experiment that owns it bit for bit, the classical layer is the same whether or not tokens are open, and with everything on the rule reverses exactly with the whole',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const probe = makeCombinedKnit({ side: SIDE, spec: { base: HEAD_TURN_SPEC, fold: false, scatter: false, mirror: 23, steer: false } })
    const { mesh, opposite } = probe.weave
    const slots = mesh.cellCount * 24
    const dense = golden(slots, 1.37)

    // the mirror phases
    const specRule = (spec: CombinedKnitSpec): ScheduledRule => (o, forward) => combinedCollision({ spec, opposite: o, forward })
    const baseMirror = cptMirrorPhase(specRule({ base: HEAD_TURN_SPEC, fold: false, scatter: false, mirror: 23, steer: false }))
    const foldedMirror = cptMirrorPhase(specRule({ base: HEAD_TURN_SPEC, fold: true, scatter: false, mirror: 23, steer: false }))
    const combinedMirror = cptMirrorPhase(specRule({ base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: baseMirror, steer: false }))
    const combinedFoldedMirror = cptMirrorPhase(specRule({ base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: foldedMirror, steer: false }))

    // run a combined knit and a reference side by side from the same fill, comparing vibes and role points
    const againstRoles = (spec: CombinedKnitSpec, reference: (s: VibeState, t: number) => VibeState): number => {
      const knit = makeCombinedKnit({ side: SIDE, spec })
      let a: CombinedState = combinedState(knit, dense)
      let b: VibeState = { vibe: Int8Array.from(dense.vibe), role: Int8Array.from(dense.point), flow: new Int32Array(slots) }
      let mismatches = 0

      for (let t = 0; t < BEATS; t++) {
        a = combinedBeat(knit, a, noneOpen(slots), t).state
        b = reference(b, t)
        mismatches += differ(a.vibe, b.vibe) + differ(rolesOf(a), b.role)
      }

      return mismatches
    }

    // 1. the base alone
    const baseSpec: CombinedKnitSpec = { base: HEAD_TURN_SPEC, fold: false, scatter: false, mirror: baseMirror, steer: false }
    const baseWeave = makeColorLocalWeave({ side: SIDE, spec: HEAD_TURN_SPEC })
    const baseRoles = againstRoles(baseSpec, (s, t) => colorLocalBeat(baseWeave, s, t))
    const baseVibes = (() => {
      const knit = makeCombinedKnit({ side: SIDE, spec: baseSpec })
      const rule = colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite })
      let a = combinedState(knit, dense)
      let will = { mesh, data: Int8Array.from(dense.vibe) }
      let mismatches = 0

      for (let t = 0; t < BEATS; t++) {
        a = combinedBeat(knit, a, noneOpen(slots), t).state
        collide(will, rule(t))
        will = stream(will)
        mismatches += differ(a.vibe, will.data)
      }

      return mismatches
    })()
    const baseDock = docksAgree(
      forward => combinedCollision({ spec: baseSpec, opposite, forward }),
      forward => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite, forward }),
    )

    // 2. the scatter block
    const scatterSpec: CombinedKnitSpec = { ...baseSpec, scatter: true, mirror: 23 }
    const scatterWeave = makeScatterWeave({ side: SIDE, spec: { base: HEAD_TURN_SPEC, mirror: 23, sets: scatterSchedule() } })
    const scatterRoles = againstRoles(scatterSpec, (s, t) => scatterBeat(scatterWeave, s, t))
    const scatterDock = docksAgree(
      forward => combinedCollision({ spec: scatterSpec, opposite, forward }),
      forward => scatterCollision({ spec: { base: HEAD_TURN_SPEC, mirror: 23, sets: scatterSchedule() }, opposite, forward }),
    )

    // 3. the fold with lone steering, against knitBeat, on the color turn base and on the head-on base
    const steering = (base: typeof HEAD_TURN_SPEC): number => {
      const spec: CombinedKnitSpec = { base, fold: true, scatter: false, mirror: 23, steer: 'lone' }
      const knit = makeCombinedKnit({ side: SIDE, spec })
      const reference = makeSteeredKnit({ side: SIDE, spec: foldRoundRobin(base), steer: 'lone' })
      const start = denseKnitState(reference)
      let a = combinedState(knit, { vibe: start.vibe, point: dense.point, flux: start.flux })
      let b: KnitState = start
      let mismatches = 0

      for (let t = 0; t < BEATS; t++) {
        a = combinedBeat(knit, a, noneOpen(slots), t).state
        b = knitBeat(reference, b, t)
        mismatches += differ(a.vibe, b.vibe) + differ(a.flux, b.flux)
      }

      return mismatches
    }
    const steeringColorTurn = steering(COLOR_TURN_SPEC)
    const steeringHeadOn = steering(HEAD_TURN_SPEC)

    // controls: each piece does something, so the agreements above are not vacuous. The same fill run with
    // the piece on and off must differ somewhere within 48 beats
    const pieceMatters = (on: CombinedKnitSpec, off: CombinedKnitSpec, flux?: Int32Array): number => {
      const a = makeCombinedKnit({ side: SIDE, spec: on })
      const b = makeCombinedKnit({ side: SIDE, spec: off })
      let sa = combinedState(a, { ...dense, flux })
      let sb = combinedState(b, { ...dense, flux })
      let differing = 0

      for (let t = 0; t < BEATS; t++) {
        sa = combinedBeat(a, sa, noneOpen(slots), t).state
        sb = combinedBeat(b, sb, noneOpen(slots), t).state
        differing += differ(sa.vibe, sb.vibe)
      }

      return differing
    }
    const steerFlux = denseKnitState(makeSteeredKnit({ side: SIDE, spec: foldRoundRobin(HEAD_TURN_SPEC), steer: 'lone' })).flux
    const scatterMatters = pieceMatters(scatterSpec, baseSpec)
    const foldMatters = pieceMatters({ ...baseSpec, fold: true }, baseSpec)
    const steerMatters = pieceMatters({ ...baseSpec, fold: true, steer: 'lone' }, { ...baseSpec, fold: true }, steerFlux)

    // 4. the fear beat's records against fearBeat on the color turn base
    const matter = golden(slots, MATTER_SCALE)
    const dock0 = new Uint8Array(slots)

    for (let s = 0; s < 24; s++) {
      dock0[s] = 1
    }

    const fearKnit = colorLocalKnit({
      opposite,
      couplesZero: COLOR_TURN_SPEC.couplesZero,
      turn: COLOR_TURN_SPEC.turn,
      positionAt: COLOR_TURN_SPEC.positionAt,
      swapAt: COLOR_TURN_SPEC.swapAt,
      table: COLOR_TURN_SPEC.tables[0] ?? [],
      swapWhen: COLOR_TURN_SPEC.swapWhen,
    })
    const on = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    const back = fearKernels({ like: -OMEGA, unlike: -OMEGA, likeExchanged: false })!
    const turnKnit = makeCombinedKnit({ side: SIDE, spec: { base: COLOR_TURN_SPEC, fold: false, scatter: false, mirror: 23, steer: false } })

    let recordMismatch = 0
    let latticeMismatch = 0
    let meetingsChecked = 0

    const combinedRecords: BeatRecord[] = []
    const fearRecords: BeatRecord[] = []

    {
      let a = combinedState(turnKnit, matter)
      let lattice = makeLattice(matter)

      for (let t = 0; t < FEAR_BEATS; t++) {
        const ra = combinedBeat(turnKnit, a, dock0, t)
        const rb = fearBeat({ weave: turnKnit.weave, links: turnKnit.weave.links, lattice, open: dock0, t, knit: fearKnit })

        a = ra.state
        lattice = rb.lattice
        combinedRecords.push(ra.record)
        fearRecords.push(rb.record)
        meetingsChecked += ra.record.meetings.length

        const flat = (r: BeatRecord): string => JSON.stringify([r.meetings, r.signs, r.crossings])

        recordMismatch += flat(ra.record) === flat(rb.record) ? 0 : 1
        latticeMismatch += differ(a.vibe, lattice.vibe) + differ(a.token, lattice.token) + differ(a.point, lattice.point)
      }
    }

    // the whole of the most-meeting pair of dock 0, advanced over each record list
    const counts = new Map<string, number>()

    for (const r of combinedRecords) {
      for (const [x, y] of r.meetings) {
        const key = `${Math.min(x, y)},${Math.max(x, y)}`

        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }

    const pair = ([...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0]?.[0] ?? '0,1').split(',').map(Number)
    // the two tokens at role 0 each: the 9 joint points whose roles are both 0 carry one unit each
    const basis = (tokens: number[]): Whole => ({
      tokens,
      weight: Array.from({ length: 81 }, (_, i) => (Math.floor(i / 27) === 0 && Math.floor((i % 9) / 3) === 0 ? 1n : 0n)),
    })
    const pairOpen = new Uint8Array(slots)

    for (const tk of pair) {
      pairOpen[tk] = 1
    }

    const evolve = (records: BeatRecord[]): Whole => {
      let whole: Whole = basis(pair)

      for (const record of records) {
        const inside = {
          meetings: record.meetings.filter(([x, y]) => pairOpen[x] === 1 && pairOpen[y] === 1),
          signs: (record.signs ?? []).filter((_, k) => pairOpen[record.meetings[k]?.[0] ?? -1] === 1 && pairOpen[record.meetings[k]?.[1] ?? -1] === 1),
          crossings: record.crossings.filter(([tk]) => pairOpen[tk] === 1),
        }

        whole = advanceWhole({ weave: turnKnit.weave, whole, record: inside, kernel4: [], color: on, fixed: false, forward: true })!
      }

      return whole
    }
    const wholeA = evolve(combinedRecords)
    const wholeB = evolve(fearRecords)
    const wholeSame = wholeA.weight.every((w, i) => w === wholeB.weight[i])

    // 5 and 6: everything on
    const allSpec: CombinedKnitSpec = { base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: foldedMirror, steer: 'lone' }
    const all = makeCombinedKnit({ side: SIDE, spec: allSpec })
    const allStart = (() => {
      const k = makeSteeredKnit({ side: SIDE, spec: foldRoundRobin(HEAD_TURN_SPEC), steer: 'lone' })
      const s = denseKnitState(k)

      return combinedState(all, { vibe: matter.vibe, point: matter.point, flux: s.flux })
    })()

    let openBlind = 0
    let closedRun = allStart
    let openRun = allStart
    const allRecords: BeatRecord[] = []

    for (let t = 0; t < BEATS; t++) {
      closedRun = combinedBeat(all, closedRun, noneOpen(slots), t).state

      const r = combinedBeat(all, openRun, dock0, t)

      openRun = r.state
      allRecords.push(r.record)
      openBlind += differ(closedRun.vibe, openRun.vibe) + differ(closedRun.token, openRun.token) + differ(closedRun.flux, openRun.flux)
    }

    // reversal with the whole of the pair in fixed units
    const units = 9n * 4n ** 60n * 3n ** 60n
    const allPairCounts = new Map<string, number>()

    for (const r of allRecords) {
      for (const [x, y] of r.meetings) {
        const key = `${Math.min(x, y)},${Math.max(x, y)}`

        allPairCounts.set(key, (allPairCounts.get(key) ?? 0) + 1)
      }
    }

    const allPair = ([...allPairCounts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0]?.[0] ?? '0,1').split(',').map(Number)
    const allPairOpen = new Uint8Array(slots)

    for (const tk of allPair) {
      allPairOpen[tk] = 1
    }

    const whole0: Whole = { tokens: allPair, weight: Array.from({ length: 81 }, (_, i) => (Math.floor(i / 27) === 2 && Math.floor((i % 9) / 3) === 0 ? units / 9n : 0n)) }

    let whole: Whole | null = whole0
    let state = allStart
    let allMeetings = 0

    for (let t = 0; t < BEATS; t++) {
      const r = combinedBeat(all, state, allPairOpen, t)

      state = r.state
      allMeetings += r.record.meetings.length
      whole = whole ? advanceWhole({ weave: all.weave, whole, record: r.record, kernel4: [], color: on, fixed: true, forward: true }) : null
    }

    for (let t = BEATS - 1; t >= 0; t--) {
      const r = combinedBeatBack(all, state, allPairOpen, t)

      state = r.state
      whole = whole ? advanceWhole({ weave: all.weave, whole, record: r.record, kernel4: [], color: back, fixed: true, forward: false }) : null
    }

    const allReverses =
      differ(state.vibe, allStart.vibe) + differ(state.token, allStart.token) + differ(state.point, allStart.point) + differ(state.flux, allStart.flux) === 0
    const wholeReturns = whole !== null && whole.weight.every((w, i) => w === whole0.weight[i])

    const ok =
      baseVibes === 0 &&
      baseRoles === 0 &&
      baseDock === 0 &&
      scatterRoles === 0 &&
      scatterDock === 0 &&
      steeringColorTurn === 0 &&
      steeringHeadOn === 0 &&
      recordMismatch === 0 &&
      latticeMismatch === 0 &&
      meetingsChecked > 0 &&
      wholeSame &&
      openBlind === 0 &&
      scatterMatters > 0 &&
      foldMatters > 0 &&
      steerMatters > 0 &&
      allReverses &&
      wholeReturns &&
      allMeetings > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the base alone is the head-on turn weave, the block on is the scatter weave, the fold with lone steering is the steered knit on both bases, and the fear beat records exactly what fearBeat records on the color turn knit, every slot and every beat; opening tokens changes no vibe, token or flux; and with every piece on the rule and the whole reverse exactly',
      metrics: {
        baseVibeMismatches: baseVibes,
        baseRoleMismatches: baseRoles,
        baseDockMismatches: baseDock,
        scatterMismatches: scatterRoles,
        scatterDockMismatches: scatterDock,
        steeringColorTurnMismatches: steeringColorTurn,
        steeringHeadOnMismatches: steeringHeadOn,
        fearRecordMismatches: recordMismatch,
        fearLatticeMismatches: latticeMismatch,
        fearMeetingsChecked: meetingsChecked,
        fearWholeSame: wholeSame ? 1 : 0,
        openingTokensChangesClassical: openBlind,
        allOnReverses: allReverses ? 1 : 0,
        allOnWholeReturns: wholeReturns ? 1 : 0,
        allOnPairMeetings: allMeetings,
        headOnMirror: baseMirror,
        headOnFoldedMirror: foldedMirror,
        withBlockMirror: combinedMirror,
        withBlockFoldedMirror: combinedFoldedMirror,
      },
      control: {
        scatterOnAgainstOffDiffering: scatterMatters,
        foldOnAgainstOffDiffering: foldMatters,
        steerOnAgainstOffDiffering: steerMatters,
        samplesPerBeat: SAMPLES,
        beats: BEATS,
        fearBeats: FEAR_BEATS,
      },
      notes:
        'L2, exact, no random numbers. The dock collision and the beat are written once in code/rule/combined-knit; the base clock and exchange are copies of code/rule/color-local-weave\'s private collision with fear-weave\'s meeting record added, the block a copy of scatter-weave\'s private scatter, and steering is steerDock itself run on a scratch dock whose role points are the slot indices. The checks here are what licenses those copies. Steering reads the flux, so a steered knit has no dock-level collision and runs only through combinedBeat. The mirror phases are measured at the dock level, where the block is placed; box-level CPT of lone steering is E-FRC-0156\'s question and is not re-asked here.',
    })
  },
})
