// The scatter weave: a four-line binary scattering block that lets momentum pass between lines, on a
// momentum-keeping color-local base, with every exact law the knit keeps.
//
// E-FLD-0022 proved that in the turning weave's family keeping the particle momentum P means keeping each
// of the twelve line momenta, and that a block of four lines with e_u + e_v = e_w + e_x is the smallest one
// whose moves leave P as the only free momentum invariant. code/rule/scatter-weave adds that block: two
// lone tones on u and v, with the lines of w and x wholly calm, move to w and x and back (an involution),
// on a fixed 24-beat schedule over the 144 scatterings that keep each slot's side, placed on both sides of
// the base collision around the base's CPT mirror phase.
//
// The bases. The color turn weave (code/rule/color-turn-weave) is the likely new knit, color-local and
// passing the committed dressing, but its lone-away exchange turns a lone tone between lines, so it does
// not keep P (E-FLD-0021 on the bind table): no block added to it can make P exact, and it is run here as
// the control on which P drifts. A momentum-keeping base has to change the exchange. The selection:
// 0. every distinct momentum-keeping member of E-FLD-0022 (1,345, negation-symmetric conditions on the
//    bind, bind-reverse, flip and identity tables, palindromic or not) under the committed schedule and
//    under the color turn schedule, staged through the gates: a lone love's dressing no larger than the
//    committed rule's in any period, CPT, the vacuum period, vacuum line components and dense line
//    components no more than the committed 3 and 1, travel at least 12 of 24. The members that fail only
//    the dense line graph are then run again with the block, which couples lines, through the whole
//    battery. The one that passes is the head-on turn weave (code/rule/scatter-weave HEAD_TURN_SPEC): the
//    color turn schedule, the bind table, and the exchange of a like head-on pair with a calm line (the
//    HPP and FHP rotation). The momentum turn weave (the color turn schedule with E-FLD-0023's widened
//    exchange) keeps P too and passes every gate but dressing; it is run beside it.
//
// Measured, on each base with the block on:
// 1. the census: 216 scatterings, 144 keeping sides, 24 quadruples of six, 6 partitions, 3 disjoint pairs;
// 2. the block switched off reproduces colorLocalBeat bit for bit, vibes and role points (side 3, 48 beats);
// 3. charge every beat, P and the twelve line momenta over 48 beats on a dense state (side 3), reversal
//    of vibes, role points and flows, Gauss's law at every dock every beat, color leaks from no dock on any
//    beat, and a change of role frame in every dock (links changed to match) commuting with the rule;
// 4. CPT: the mirror phase searched as E-FND-0117 and E-FRC-0125 do, over all 24 phases;
// 5. the Smith form of the block's line-momentum changes: which invariants are left. Expected before the
//    run: P alone, as for all 216 scatterings (E-FLD-0022). Measured: P and the sum of the twelve line
//    momenta, which the side-keeping restriction local color asks for keeps exactly;
// 6. the lattice symmetries (of the 384 signed axis permutations, with any time map) the knit keeps at the
//    dock, and the ones the scatter weave keeps: at least the same set;
// 7. the acceptance battery (code/measure/weave-acceptance) against the committed rule: reversal, charge,
//    CPT, the vacuum period, line components on the vacuum and a dense background, travel,
//    superposition, walls, and a lone love's dressing, gated at least as good (as E-FRC-0125 gates); a
//    lone fear's dressing reported beside the committed one.
// Control: the lone-tone condition switched to "any two tones" makes the vacuum's own pairs scatter, which
// is reported (its vacuum period and dressing), and the color turn base, on which P drifts.
//
// Depth L2: a constructed rule measured against stated gates, with exact conservation checked, not assumed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BIND_MOVE_FORWARD, type Collision, turningWeave } from '@/code/rule/collision'
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { colorLocalBeat, colorLocalCollision, colorLocalSpec, makeColorLocalWeave, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import {
  acceptance,
  type Acceptance,
  cptMirrorPhase,
  dressing,
  lineComponents,
  type ScheduledRule,
  travel,
  vacuumPeriod,
} from '@/code/measure/weave-acceptance'
import { latticeQuotient } from '@/code/measure/integer-lattice'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { gaussHolds, type VibeState } from '@/code/rule/vibe-weave'
import {
  BIND_REVERSE_TABLE,
  FLIP_TABLE,
  IDENTITY_TABLE,
  lineMomenta,
  momentumOf,
  momentumWeave,
  type MomentumWeaveSpec,
  negationSymmetricMembers,
} from '@/code/rule/momentum-weave'
import {
  allScatterings,
  lineOfSlot,
  HEAD_TURN_SPEC,
  makeScatterWeave,
  MOMENTUM_TURN_SPEC,
  scatterBeat,
  scatterBeatBack,
  scatterCollision,
  scatterLeaks,
  scatterPartitions,
  scatterQuads,
  scatterSchedule,
  SIDE,
  type ScatterWeaveSpec,
} from '@/code/rule/scatter-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BEATS = 48
const PERIOD = 24


const baseRule =
  (spec: ColorLocalSpec): ScheduledRule =>
  (opposite, forward) =>
    colorLocalCollision({ spec, opposite, forward })
const scatterRule =
  (spec: ScatterWeaveSpec): ScheduledRule =>
  (opposite, forward) =>
    scatterCollision({ spec, opposite, forward })

function dense(slots: number, scale: number): VibeState {
  const vibe = new Int8Array(slots)
  const role = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    role[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
  }

  return { vibe, role, flow: new Int32Array(slots) }
}

const same = (a: VibeState, b: VibeState): boolean =>
  a.vibe.every((x, i) => x === b.vibe[i]) && a.role.every((x, i) => x === b.role[i]) && a.flow.every((x, i) => x === b.flow[i])

// the exact laws on one base with the block on (side 3, dense, 48 beats)
function laws(spec: ScatterWeaveSpec) {
  const weave = makeScatterWeave({ side: 3, spec })
  const slots = weave.mesh.cellCount * 24
  const start = dense(slots, 1.37)
  const charge = (s: VibeState): number => s.vibe.reduce((a, b) => a + b, 0)
  const p0 = momentumOf(start.vibe).p
  const n0 = lineMomenta(start.vibe, weave.opposite)

  let s = start
  let chargeKept = true
  let gauss = true
  let leaks = 0
  let pDrift = 0
  let lineDrift = 0
  let lineSumDrift = 0

  const sum0 = n0.reduce((a, b) => a + b, 0)

  for (let t = 0; t < BEATS; t++) {
    leaks += scatterLeaks(weave, s, t)
    s = scatterBeat(weave, s, t)
    chargeKept = chargeKept && charge(s) === charge(start)
    gauss = gauss && gaussHolds(weave, start, s)
    pDrift = Math.max(pDrift, ...momentumOf(s.vibe).p.map((x, k) => Math.abs(x - (p0[k] ?? 0))))

    const n = lineMomenta(s.vibe, weave.opposite)

    lineDrift = Math.max(lineDrift, ...n.map((x, k) => Math.abs(x - (n0[k] ?? 0))))
    lineSumDrift = Math.max(lineSumDrift, Math.abs(n.reduce((a, b) => a + b, 0) - sum0))
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = scatterBeatBack(weave, s, t)
  }

  const reverses = same(s, start)

  // a change of role frame in every dock, links changed to match
  const { mesh, moves } = weave
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const links = new Int16Array(weave.links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      links[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, weave.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged = { ...weave, links }
  const gaugeRoles = (state: VibeState): VibeState => ({
    ...state,
    role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0),
  })

  let a = dense(slots, 2.11)
  let b = gaugeRoles(a)
  let frameFree = true

  for (let t = 0; t < PERIOD; t++) {
    a = scatterBeat(weave, a, t)
    b = scatterBeat(gauged, b, t)
    frameFree = frameFree && same(gaugeRoles(a), b)
  }

  return { chargeKept, gauss, leaks, pDrift, lineDrift, lineSumDrift, reverses, frameFree, cpt: cptMirrorPhase(scatterRule(spec)) }
}

// the block switched off is the base, vibes and role points
function offIsBase(base: ColorLocalSpec, mirror: number): boolean {
  const w0 = makeColorLocalWeave({ side: 3, spec: base })
  const w1 = makeScatterWeave({ side: 3, spec: { base, mirror, sets: [] } })

  let a = dense(w0.mesh.cellCount * 24, 1.37)
  let b = dense(w0.mesh.cellCount * 24, 1.37)
  let equal = true

  for (let t = 0; t < BEATS; t++) {
    a = colorLocalBeat(w0, a, t)
    b = scatterBeat(w1, b, t)
    equal = equal && same(a, b)
  }

  return equal
}

// how many of the 384 signed axis permutations a rule keeps at the dock, with any time map
function keptSymmetries(rule: (t: number) => Collision): number {
  const roots = rootsD4()
  const index = new Map(roots.map((r, i) => [r.join(','), i]))
  const permutations = (xs: number[]): number[][] =>
    xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(r => [x, ...r]))
  const states: Int8Array[] = Array.from({ length: 60 }, (_, n) =>
    Int8Array.from({ length: 24 }, (_, i) => {
      const u = (((n + 1) * 24 + i + 1) * GOLDEN * 3.7) % 1

      return n % 3 === 0 ? (u < 0.15 ? 1 : u < 0.3 ? -1 : 0) : u < 0.33 ? -1 : u < 0.66 ? 0 : 1
    }),
  )
  const apply = (c: Collision, v: Int8Array): Int8Array => {
    const out = Int8Array.from(v)

    c(out, 0, 24)

    return out
  }
  const images = Array.from({ length: PERIOD }, (_, t) => states.map(v => apply(rule(t), v)))

  let kept = 0

  for (const axes of permutations([0, 1, 2, 3])) {
    for (let signs = 0; signs < 16; signs++) {
      const g = roots.map(r => {
        const v = [0, 0, 0, 0]

        axes.forEach((to, from) => (v[to] = (r[from] ?? 0) * ((signs >> from) & 1 ? -1 : 1)))

        return index.get(v.join(',')) ?? 0
      })
      const act = (v: Int8Array): Int8Array => {
        const out = new Int8Array(24)

        g.forEach((to, d) => (out[to] = v[d] ?? 0))

        return out
      }

      let ok = true

      for (let t = 0; t < PERIOD && ok; t++) {
        let found = false

        for (let s = 0; s < PERIOD && !found; s++) {
          found = states.every((v, i) => {
            const lhs = apply(rule(s), act(v))
            const rhs = act(images[t]?.[i] ?? v)

            return lhs.every((x, k) => x === rhs[k])
          })
        }

        ok = found
      }

      kept += ok ? 1 : 0
    }
  }

  return kept
}

// every gate of E-FRC-0125 against the committed rule, a lone love's dressing included
function passesCommitted(a: Acceptance, committed: Acceptance): boolean {
  const atLeast = (ok: boolean, reference: boolean): boolean => ok || !reference

  return (
    atLeast(a.reverses, committed.reverses) &&
    atLeast(a.chargeKept, committed.chargeKept) &&
    atLeast(a.cptPhase >= 0, committed.cptPhase >= 0) &&
    atLeast(a.vacuumPeriod > 0, committed.vacuumPeriod > 0) &&
    a.vacuumComponents <= committed.vacuumComponents &&
    a.denseComponents <= committed.denseComponents &&
    atLeast(a.additivityWorst < 1e-9, committed.additivityWorst < 1e-9) &&
    atLeast(a.wallQuantized && a.wallMax > 0, committed.wallQuantized && committed.wallMax > 0) &&
    a.travellers >= committed.travellers &&
    a.love.periodLargest.every((x, p) => x <= (committed.love.periodLargest[p] ?? 0))
  )
}

const STAGES = ['dressing', 'cpt', 'vacuumPeriod', 'vacuumComponents', 'denseComponents', 'travel', 'none'] as const

// The selection: every distinct negation-symmetric momentum-keeping member under two schedules, staged
// through the gates cheapest-deciding first, then the members that fail only the dense line graph run
// again with the block through the whole battery
function select(committed: Acceptance): { metrics: Record<string, number>; passing: string[]; selectedPasses: boolean } {
  const members = negationSymmetricMembers([
    ['bind', BIND_MOVE_FORWARD],
    ['bind-reverse', BIND_REVERSE_TABLE],
    ['flip', FLIP_TABLE],
    ['identity', IDENTITY_TABLE],
  ])
  const schedules: [string, { turn?: readonly number[]; swapAt?: readonly number[] }][] = [
    ['committedSchedule', {}],
    ['colorTurnSchedule', { turn: COLOR_TURN_SPEC.turn, swapAt: COLOR_TURN_SPEC.swapAt }],
  ]
  const metrics: Record<string, number> = {}
  const passing: string[] = []

  let selectedPasses = false

  for (const [name, schedule] of schedules) {
    const counts: Record<string, number> = Object.fromEntries(STAGES.map(s => [s, 0]))
    const denseOnly: { id: string; spec: MomentumWeaveSpec }[] = []

    for (const m of members) {
      const spec: MomentumWeaveSpec = { ...m.spec, ...schedule }
      const rule: ScheduledRule = (o, f) => momentumWeave({ spec, opposite: o, forward: f })
      let stage: (typeof STAGES)[number] = 'none'

      if (dressing(rule, { tone: 1, caps: committed.love.periodLargest }).overCapAt >= 0) stage = 'dressing'
      else if (cptMirrorPhase(rule) < 0) stage = 'cpt'
      else if (vacuumPeriod(rule) <= 0) stage = 'vacuumPeriod'
      else if (lineComponents(rule, false) > committed.vacuumComponents) stage = 'vacuumComponents'
      else if (lineComponents(rule, true) > committed.denseComponents) stage = 'denseComponents'
      else if (travel(rule).travellers < committed.travellers) stage = 'travel'

      counts[stage] = (counts[stage] ?? 0) + 1

      if (stage === 'denseComponents') {
        denseOnly.push({ id: m.id, spec })
      }
    }

    STAGES.forEach(s => (metrics[`${name}_firstFailure_${s}`] = counts[s] ?? 0))
    metrics[`${name}_denseOnlyFailures`] = denseOnly.length

    for (const { id, spec } of denseOnly) {
      const fires = spec.fires
      const base = colorLocalSpec({
        tables: [spec.table],
        turn: spec.turn,
        swapAt: spec.swapAt,
        positionAt: spec.positionAt,
        palindrome: spec.palindrome,
        swapWhen: (l, w) => fires[l * 9 + w] === 1,
      })
      const mirror = cptMirrorPhase(baseRule(base))
      const withBlock = acceptance(scatterRule({ base, mirror, sets: scatterSchedule() }))

      if (passesCommitted(withBlock, committed)) {
        passing.push(`${name}:${id}`)

        const headOn = Array.from({ length: 81 }, (_, x) => (HEAD_TURN_SPEC.swapWhen(Math.floor(x / 9), x % 9) || HEAD_TURN_SPEC.swapWhen(x % 9, Math.floor(x / 9)) ? 1 : 0))

        selectedPasses =
          selectedPasses ||
          (name === 'colorTurnSchedule' && spec.table === BIND_MOVE_FORWARD && spec.palindrome && headOn.every((f, x) => f === fires[x]))
      }
    }
  }

  return { metrics, passing, selectedPasses }
}

export default experiment({
  id: 'fluids/scatter-weave',
  code: 'E-FLD-0024',
  title:
    'a four-line binary scattering block (two lone tones on u and v leave on w and x when e_u + e_v = e_w + e_x, an involution on a fixed 24-beat schedule placed around the CPT mirror phase) makes the twelve line momenta exchange while charge, P, reversal, Gauss, local color, the frame change and CPT stay exact; local color leaves one more invariant than P, the sum of the twelve line momenta, since a dock counts its calm slots by side and every binary scattering that changes that sum changes it by 2, not a multiple of 3, so the 144 color-keeping scatterings of the 216 leave five free invariants where all 216 leave four; on the head-on turn weave (the color turn schedule with the FHP rotation of a like head-on pair as its exchange), the one momentum-keeping base a search of 2,690 finds that the block carries through every committed acceptance gate, a lone love dressing no more than the committed rule, the block joining the three dense line components the base leaves into one',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. census
    const all = allScatterings()
    const quads = scatterQuads()
    const partitions = scatterPartitions(quads)
    const sets = scatterSchedule()
    const setsDisjoint = sets.every(set => new Set(set.flat()).size === 4 * set.length)
    const census =
      all.length === 216 &&
      quads.length * 6 === all.filter(s => s.sideKept).length &&
      quads.every(q => q.scatterings.length === 6 && q.pairs.length === 3) &&
      setsDisjoint

    // 0. the selection, against the committed rule's own numbers
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const committed = acceptance(committedRule)
    const selection = select(committed)

    // 2 to 4, on each base
    const opposite = rootsD4().map((r, _, all4) => all4.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
    const bases: [string, ColorLocalSpec][] = [
      ['headTurn', HEAD_TURN_SPEC],
      ['momentumTurn', MOMENTUM_TURN_SPEC],
      ['colorTurn', COLOR_TURN_SPEC],
    ]
    const results = bases.map(([name, base]) => {
      const mirror = cptMirrorPhase(baseRule(base))
      const spec: ScatterWeaveSpec = { base, mirror, sets }

      return { name, base, mirror, spec, off: offIsBase(base, mirror), ...laws(spec) }
    })
    const [turn, weave, control] = results

    // 5. the Smith form of the block's moves in line space
    const rows = all
      .filter(s => s.sideKept)
      .map(({ scattering: [u, v, w, x] }) => {
        const row = new Array<number>(12).fill(0)

        for (const [d, sign] of [
          [u, -1],
          [v, -1],
          [w, 1],
          [x, 1],
        ] as const) {
          row[lineOfSlot(d)] = (row[lineOfSlot(d)] ?? 0) + sign * (SIDE[d] ?? 0)
        }

        return row
      })
    const blockQuotient = latticeQuotient(rows, 12)
    // every binary scattering, sides kept or not, and the sum of the twelve line momenta: the side-keeping
    // ones keep it exactly, the others change it by 2 or 4, which a dock's color weight (calm slots counted
    // by side) cannot absorb mod 3
    const rowOf = ([u, v, w, x]: readonly number[]): number[] => {
      const row = new Array<number>(12).fill(0)

      for (const [d, sign] of [
        [u ?? 0, -1],
        [v ?? 0, -1],
        [w ?? 0, 1],
        [x ?? 0, 1],
      ] as const) {
        row[lineOfSlot(d)] = (row[lineOfSlot(d)] ?? 0) + sign * (SIDE[d] ?? 0)
      }

      return row
    }
    const lineSum = (row: number[]): number => row.reduce((s, x) => s + x, 0)
    const allQuotient = latticeQuotient(all.map(s => rowOf(s.scattering)), 12)
    const keptKeepSum = all.filter(s => s.sideKept).every(s => lineSum(rowOf(s.scattering)) === 0)
    const otherChangeSum = all.filter(s => !s.sideKept).map(s => Math.abs(lineSum(rowOf(s.scattering))))
    const otherNotMultipleOf3 = otherChangeSum.every(x => x !== 0 && x % 3 !== 0)
    // the FHP triples: three tones on three lines with e_a + e_b + e_c = 0 reverse
    const roots4 = rootsD4()
    const tripleChanges: number[] = []

    for (let a = 0; a < 24; a++) {
      for (let b = a + 1; b < 24; b++) {
        for (let c = b + 1; c < 24; c++) {
          const distinct = new Set([lineOfSlot(a), lineOfSlot(b), lineOfSlot(c)]).size === 3
          const closes = [0, 1, 2, 3].every(k => (roots4[a]?.[k] ?? 0) + (roots4[b]?.[k] ?? 0) + (roots4[c]?.[k] ?? 0) === 0)

          if (distinct && closes) {
            tripleChanges.push(-2 * ((SIDE[a] ?? 0) + (SIDE[b] ?? 0) + (SIDE[c] ?? 0)))
          }
        }
      }
    }

    const triplesChangeByTwo = tripleChanges.length === 32 && tripleChanges.every(x => Math.abs(x) === 2)

    // 6. symmetries, at the dock
    const mainSpec: ScatterWeaveSpec = turn?.spec ?? { base: HEAD_TURN_SPEC, mirror: 23, sets }
    const knitSymmetries = keptSymmetries(colorLocalCollision({ spec: COLOR_TURN_SPEC, opposite }))
    const baseSymmetries = keptSymmetries(colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite }))
    const scatterSymmetries = keptSymmetries(scatterCollision({ spec: mainSpec, opposite }))
    const committedSymmetries = keptSymmetries(turningWeave({ opposite }))

    // 7. the battery, the scatter weave on the head-on turn base against the committed rule
    const battery = acceptance(scatterRule(mainSpec))
    const baseBattery = acceptance(baseRule(HEAD_TURN_SPEC))
    const momentumTurnBattery = acceptance(scatterRule(weave?.spec ?? { base: MOMENTUM_TURN_SPEC, mirror: 23, sets }))
    const passes = (a: Acceptance): boolean => passesCommitted(a, committed)
    const structural = passes(battery)
    const fearNoMore = battery.fear.periodLargest.every((x, p) => x <= (committed.fear.periodLargest[p] ?? 0))

    // control: any two tones scatter, the vacuum's pairs included
    const anyTones = acceptance(scatterRule({ ...mainSpec, lone: false }))

    const exact = (r: (typeof results)[number] | undefined): boolean =>
      r !== undefined && r.off && r.chargeKept && r.gauss && r.leaks === 0 && r.reverses && r.frameFree && r.cpt === r.mirror && r.cpt >= 0

    const ok =
      census &&
      partitions.length === 6 &&
      exact(turn) &&
      exact(weave) &&
      exact(control) &&
      (turn?.pDrift ?? 1) === 0 &&
      (weave?.pDrift ?? 1) === 0 &&
      (turn?.lineDrift ?? 0) > 0 &&
      (weave?.lineDrift ?? 0) > 0 &&
      (control?.pDrift ?? 0) > 0 &&
      blockQuotient.free === 5 &&
      blockQuotient.torsion.length === 0 &&
      allQuotient.free === 4 &&
      allQuotient.torsion.join(',') === '2' &&
      keptKeepSum &&
      otherNotMultipleOf3 &&
      triplesChangeByTwo &&
      (turn?.lineSumDrift ?? 1) === 0 &&
      scatterSymmetries >= knitSymmetries &&
      structural &&
      !passes(baseBattery) &&
      !passes(momentumTurnBattery) &&
      selection.selectedPasses &&
      selection.passing.length > 0 &&
      selection.passing.every(p => p.includes(':palindrome:'))

    const perBase: Record<string, number> = {}

    for (const r of results) {
      perBase[`${r.name}BaseMirror`] = r.mirror
      perBase[`${r.name}Cpt`] = r.cpt
      perBase[`${r.name}OffIsBase`] = r.off ? 1 : 0
      perBase[`${r.name}ChargeKept`] = r.chargeKept ? 1 : 0
      perBase[`${r.name}Gauss`] = r.gauss ? 1 : 0
      perBase[`${r.name}ColorLeaks`] = r.leaks
      perBase[`${r.name}Reverses`] = r.reverses ? 1 : 0
      perBase[`${r.name}FrameFree`] = r.frameFree ? 1 : 0
      perBase[`${r.name}MomentumDrift`] = r.pDrift
      perBase[`${r.name}LineMomentumDrift`] = r.lineDrift
    }

    const flat = (prefix: string, a: typeof battery): Record<string, number> => ({
      [`${prefix}Reverses`]: a.reverses ? 1 : 0,
      [`${prefix}ChargeKept`]: a.chargeKept ? 1 : 0,
      [`${prefix}CptMirrorPhase`]: a.cptPhase,
      [`${prefix}VacuumPeriod`]: a.vacuumPeriod,
      [`${prefix}VacuumLineComponents`]: a.vacuumComponents,
      [`${prefix}DenseLineComponents`]: a.denseComponents,
      [`${prefix}AdditivityWorst`]: a.additivityWorst,
      [`${prefix}WallQuantized`]: a.wallQuantized ? 1 : 0,
      [`${prefix}WallSettledMax`]: a.wallMax,
      [`${prefix}Travellers`]: a.travellers,
      ...Object.fromEntries(a.love.periodLargest.map((x, p) => [`${prefix}LoveSupportPeriod${p + 1}`, x])),
      ...Object.fromEntries(a.fear.periodLargest.map((x, p) => [`${prefix}FearSupportPeriod${p + 1}`, x])),
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the census is as stated; with the block off the rule is its base bit for bit; on both momentum-keeping bases the scatter weave keeps charge, P, Gauss, reversal, local color, the frame change and CPT at the base mirror phase exactly while the line momenta change, and on the color turn base P drifts; the block leaves P and the sum of the line momenta free (all 216 scatterings would leave P alone, with charge parity), every color-keeping scattering keeps that sum and every other changes it by 2, which local color cannot absorb, as do all 32 FHP triples, and the sum is exact on a run; it keeps every dock symmetry the knit keeps; the selection finds members that pass every gate only with the block, all palindromic, the head-on turn weave among them; the scatter weave on it is at least as good as the committed rule on every E-FRC-0125 gate, a lone love\'s dressing included, where the head-on turn weave without the block and the momentum turn weave with it are not',
      metrics: {
        scatterings: all.length,
        sideKeptScatterings: all.filter(s => s.sideKept).length,
        quadruples: quads.length,
        partitions: partitions.length,
        scatteringsPerBeat: sets[0]?.length ?? 0,
        ...perBase,
        blockRank: blockQuotient.rank,
        blockFree: blockQuotient.free,
        blockTorsionOrder: blockQuotient.torsion.reduce((s, x) => s * x, 1),
        allScatteringsRank: allQuotient.rank,
        allScatteringsFree: allQuotient.free,
        allScatteringsTorsionOrder: allQuotient.torsion.reduce((s, x) => s * x, 1),
        sideKeptKeepLineSum: keptKeepSum ? 1 : 0,
        otherScatteringsLineSumChangeSmallest: Math.min(...otherChangeSum),
        otherScatteringsLineSumChangeLargest: Math.max(...otherChangeSum),
        headTurnLineSumDrift: turn?.lineSumDrift ?? -1,
        fhpTriples: tripleChanges.length,
        fhpTriplesChangingSumByTwo: tripleChanges.filter(x => Math.abs(x) === 2).length,
        knitDockSymmetries: knitSymmetries,
        baseDockSymmetries: baseSymmetries,
        scatterDockSymmetries: scatterSymmetries,
        committedDockSymmetries: committedSymmetries,
        ...selection.metrics,
        selectedPasses: selection.selectedPasses ? 1 : 0,
        passingWithBlock: selection.passing.length,
        ...flat('scatter', battery),
        fearNoMoreThanCommitted: fearNoMore ? 1 : 0,
      },
      control: {
        ...flat('committed', committed),
        ...flat('headTurnWithoutBlock', baseBattery),
        ...flat('momentumTurnWithBlock', momentumTurnBattery),
        ...flat('anyTones', anyTones),
      },
      notes:
        'L2, exact, no random numbers. The block scatters lone tones only (the opposite slots of all four calm): letting any two tones scatter makes the head-on pairs of the vacuum scatter too, which the anyTones control shows costs the vacuum its 24-beat period and spreads a lone tone over two thirds of the side-9 box in the first period. The color turn weave cannot carry exact P under any added block, since its lone-away exchange turns a lone tone between lines (E-FLD-0021). Among momentum-keeping bases the dressing and the line graph pull against each other: every member that dresses a lone love no more than the committed rule either never couples lines (12 vacuum components under the committed schedule) or, under the color turn schedule, leaves the dense background in two or three pieces; the block couples lone tones across lines and joins those pieces, and that is what reaches every gate at once. A lone fear on the head-on turn scatter weave dresses 33 slots in the first period against the committed 27 (a love 33 against 33), reported and not gated, as in E-FRC-0125. At the dock the committed rule, the knit and the scatter weave each keep only the identity among the 384 signed axis permutations, even allowing a time map, so "the same symmetries" is the identity plus the 24-beat period and CPT. The side-keeping restriction (144 of 216) is what local color asks: a calm role point is counted by its side, and a scattering moves calm role points from w and x to u and v. ITS COST: the first run gated the block to leave P as the only invariant, as all 216 scatterings do, and failed: the 144 leave one more, the sum of the twelve line momenta (tones on first slots minus tones on second slots). It is forced, not chosen: the weight part of a dock\'s color is the vibe sum plus the side sum of its calm slots, which with charge kept is minus that line-momentum sum, so local color keeps the sum mod 3 per dock, and a binary scattering changes it by 0 or 2 (the 72 that do not keep sides all by 2). So no color-local binary block exchanges momentum fully. The FHP triple does not help: its 32 moves change the sum by 2 in size (measured here, 16 each way). Every momentum-keeping move of two or three tones changes the sum by 0 or 2, so a color-local rule that removes this invariant has to change it by 6 in one act: three such moves fired together as one conditional move, a block of at least six tones. The dressing and the transport physics are E-FLD-0025.',
    })
  },
})
