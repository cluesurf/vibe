// The acceptance battery on the folded round robin, with and without steering, against the color turn
// weave and the committed knit.
//
// E-FRC-0152 found the schedule a knit could carry and still let every line meet every other: the round
// robin folded into the 24-beat palindrome, on the color turn weave's table and swap order. It checked CPT
// only on single docks with fixed string patterns. Here the whole battery of E-FRC-0125 is asked of it.
//
// Five rules:
// - committed: the committed turning weave (code/rule/collision, turningWeave, pair table)
// - colorTurn: the color turn weave (code/rule/color-turn-weave, E-FRC-0136), the candidate knit
// - folded: the color turn weave's table on the folded round robin, no steering
// - foldedLone: folded with lone steering (E-FRC-0152, 0153: two lines traded whole where together they hold
//   one charge and the charge's slot and the matching slot differ in string)
// - foldedLine: folded with line steering: the same trade where the two lines carry string on different
//   numbers of their two links. It reads string per line, not per slot
// The first three are collisions of one dock's 24 slots and run through code/measure/weave-acceptance. The
// steered two read the flux on the links, which a dock collision cannot see, so they run through
// code/measure/steered-acceptance, the same questions asked of the whole box with the flux carried. As the
// check that the two agree, steered-acceptance runs the unsteered folded rule too, and must reproduce
// weave-acceptance's line components, travel and dressing on it exactly.
//
// Measured for every rule where it applies:
// - reversal and charge (side 5, one period)
// - CPT: at the dock level (weave-acceptance), and for the flux-carrying rules on the full side-5 box with
//   the flux evolving (steered-acceptance: charge negation, every dock to its negative, flux carried to the
//   image link with a sign, the backward trajectory a forward one at mirror phase c)
// - the vacuum's period with the flux over six periods (side 7), and its first return to empty
// - line-graph components on the vacuum and on a dense background (side 5)
// - superposition (side 11) and walls (side 9)
// - travellers and mean reach (side 13)
// - dressing of a love and of a fear, largest support in each of four periods, at sides 7, 9 and 11
// - color leaks: the knit's collision (colorLocalLeaks) and the steering step with role points riding
//
// Gates, fixed before any of these numbers were run for the folded rules (the only folded numbers seen
// before were E-FRC-0152's, and a side-5 probe, tmp/probe-box-cpt, that found lone steering loses full-box
// CPT and line steering keeps it):
// - steered-acceptance agrees with weave-acceptance on the unsteered folded rule: components, travel, and
//   the dressing at side 7
// - folded, unsteered: reverses, keeps charge, CPT at a mirror phase, superposition exact, walls quantized,
//   no more line components than the color turn weave on the vacuum and on the dense background, no color
//   leaks, and a love's and a fear's dressing no larger than the committed knit's in every period at every
//   side
// - both steered rules: reverse exactly and keep charge with the flux, and line steering keeps full-box CPT
// Everything else is reported, every difference from the color turn weave and the committed knit included.
//
// Depth L2: constructed rules against the stated battery.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  additivityWorst,
  cptMirrorPhase,
  dressing,
  lineComponents,
  reversalAndCharge,
  travel,
  vacuumPeriod,
  walls,
  type ScheduledRule,
} from '@/code/measure/weave-acceptance'
import {
  boxCptPhase,
  denseKnitState,
  steeredAdditivity,
  steeredComponents,
  steeredDressing,
  steeredReversal,
  steeredTravel,
  steeredVacuum,
  steeredWalls,
  type SteeredRule,
} from '@/code/measure/steered-acceptance'
import { turningWeave, PAIR_FORWARD } from '@/code/rule/collision'
import { COLOR_TURN_SPEC, colorTurnWeave } from '@/code/rule/color-turn-weave'
import { colorLocalCollision, colorLocalLeaks, colorLocalSpec, makeColorLocalWeave } from '@/code/rule/color-local-weave'
import { foldRoundRobin, makeSteeredKnit, partitionAt, steerDock, type KnitSteer } from '@/code/rule/steered-knit'

const SIDES = [7, 9, 11]
const PERIODS = 4
const GOLDEN = (Math.sqrt(5) - 1) / 2
const mod3 = (x: number): number => ((x % 3) + 3) % 3

const FOLDED_SPEC = foldRoundRobin(COLOR_TURN_SPEC)

const RULES: Readonly<Record<'committed' | 'colorTurn' | 'folded', ScheduledRule>> = {
  committed: (opposite, forward) => turningWeave({ opposite, forward }),
  colorTurn: (opposite, forward) => colorTurnWeave({ opposite, forward }),
  folded: (opposite, forward) => colorLocalCollision({ spec: FOLDED_SPEC, opposite, forward }),
}

// the battery through weave-acceptance, for a dock collision
function dockBattery(rule: ScheduledRule): Record<string, number> {
  const { reverses, chargeKept } = reversalAndCharge(rule)
  const wall = walls(rule)
  const moving = travel(rule)
  const out: Record<string, number> = {
    reverses: reverses ? 1 : 0,
    chargeKept: chargeKept ? 1 : 0,
    cptPhase: cptMirrorPhase(rule),
    vacuumPeriodUpTo24: vacuumPeriod(rule),
    vacuumComponents: lineComponents(rule, false),
    denseComponents: lineComponents(rule, true),
    additivityWorst: additivityWorst(rule),
    wallQuantized: wall.quantized ? 1 : 0,
    wallMax: wall.settledMax,
    travellers: moving.travellers,
    meanReach: moving.meanReach,
  }

  for (const side of SIDES) {
    for (const [name, tone] of [
      ['Love', 1],
      ['Fear', -1],
    ] as const) {
      dressing(rule, { side, tone, periods: PERIODS }).periodLargest.forEach((x, p) => (out[`dressing${name}Side${side}Period${p + 1}`] = x))
    }
  }

  return out
}

// the battery through steered-acceptance, for a flux-carrying rule; `full` adds the costly items
function boxBattery(rule: SteeredRule, full: boolean): Record<string, number> {
  const { reverses, chargeKept } = steeredReversal(rule)
  const cpt = boxCptPhase(rule)
  const vacuum = steeredVacuum(rule, 6)
  const moving = steeredTravel(rule)
  const out: Record<string, number> = {
    reverses: reverses ? 1 : 0,
    chargeKept: chargeKept ? 1 : 0,
    boxCptPhase: cpt.phase,
    boxCptFluxSign: cpt.sign,
    vacuumPeriod: vacuum.period,
    vacuumFirstEmpty: vacuum.firstEmpty,
    vacuumComponents: steeredComponents(rule, false),
    denseComponents: steeredComponents(rule, true),
    travellers: moving.travellers,
    meanReach: moving.meanReach,
  }

  for (const side of full ? SIDES : [7]) {
    for (const [name, tone] of [
      ['Love', 1],
      ['Fear', -1],
    ] as const) {
      if (!full && tone < 0) {
        continue
      }

      steeredDressing(rule, { side, tone, periods: PERIODS }).forEach((x, p) => (out[`dressing${name}Side${side}Period${p + 1}`] = x))
    }
  }

  if (full) {
    const wall = steeredWalls(rule)

    out.additivityWorst = steeredAdditivity(rule)
    out.wallQuantized = wall.quantized ? 1 : 0
    out.wallMax = wall.settledMax
  }

  return out
}

// cells whose color the steering step changes, role points riding, over one period of a dense start
function steeringColorLeaks(steer: KnitSteer): number {
  const knit = makeSteeredKnit({ side: 3, spec: FOLDED_SPEC, steer })
  const state = denseKnitState(knit)
  const role = Int8Array.from({ length: state.vibe.length }, (_, i) => Math.floor(((i + 3) * GOLDEN * 9 * 1.37) % 9))
  const sign = Array.from({ length: 24 }, (_, d) => (d < (knit.opposite[d] ?? d) ? 1 : -1))
  const content = (x: number): string => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = state.vibe[x * 24 + d] ?? 0
      const weight = v !== 0 ? v : (sign[d] ?? 1)
      const p = role[x * 24 + d] ?? 0

      w += weight
      qx += weight * (p % 3)
      qy += weight * Math.floor(p / 3)
    }

    return `${mod3(w)},${mod3(qx)},${mod3(qy)}`
  }

  let leaks = 0

  for (let t = 0; t < 24; t++) {
    const couples = partitionAt(FOLDED_SPEC, t)

    for (let x = 0; x < knit.mesh.cellCount; x++) {
      const before = content(x)
      const string = (d: number): boolean => mod3(state.flux[knit.edgeOf[x * 24 + d] ?? 0] ?? 0) !== 0

      steerDock({ knit, slots: state.vibe, base: x * 24, string, t, role, couples })
      leaks += content(x) === before ? 0 : 1
    }
  }

  return leaks
}

function knitColorLeaks(): number {
  const weave = makeColorLocalWeave({ side: 3, spec: FOLDED_SPEC })
  const knit = makeSteeredKnit({ side: 3, spec: FOLDED_SPEC, steer: false })
  const dense = denseKnitState(knit)
  const state = {
    vibe: dense.vibe,
    role: Int8Array.from({ length: dense.vibe.length }, (_, i) => Math.floor(((i + 3) * GOLDEN * 9 * 1.37) % 9)),
    flow: new Int32Array(dense.vibe.length),
  }

  let total = 0

  for (let t = 0; t < 24; t++) {
    total += colorLocalLeaks(weave, state, t)
  }

  return total
}

export default experiment({
  id: 'gauge/folded-acceptance',
  code: 'E-FRC-0156',
  title:
    "the folded round robin fails the acceptance battery: it keeps reversal, charge, CPT, superposition, walls and local color, but a lone tone's disturbance grows from about 100 slots to 15,000 on side 7 in four periods (the committed knit 1,204, the color turn weave 319) and its line graph splits into 3 and 4 components; steering then fills the box, lone steering loses CPT on a full box with the flux evolving, and line steering keeps it but loses superposition",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const committed = dockBattery(RULES.committed)
    const colorTurn = dockBattery(RULES.colorTurn)
    const folded = dockBattery(RULES.folded)
    const committedBox = boxBattery({ spec: colorLocalSpec({ tables: [PAIR_FORWARD] }), steer: false }, false)
    const colorTurnBox = boxBattery({ spec: COLOR_TURN_SPEC, steer: false }, false)
    const foldedBox = boxBattery({ spec: FOLDED_SPEC, steer: false }, false)
    const lone = boxBattery({ spec: FOLDED_SPEC, steer: 'lone' }, true)
    const line = boxBattery({ spec: FOLDED_SPEC, steer: 'line' }, true)
    const leaks = { knit: knitColorLeaks(), lone: steeringColorLeaks('lone'), line: steeringColorLeaks('line') }

    const dressingKeys = SIDES.flatMap(side =>
      ['Love', 'Fear'].flatMap(name => Array.from({ length: PERIODS }, (_, p) => `dressing${name}Side${side}Period${p + 1}`)),
    )
    const agree =
      foldedBox.vacuumComponents === folded.vacuumComponents &&
      foldedBox.denseComponents === folded.denseComponents &&
      foldedBox.travellers === folded.travellers &&
      Math.abs((foldedBox.meanReach ?? 0) - (folded.meanReach ?? 0)) < 1e-9 &&
      [1, 2, 3, 4].every(p => foldedBox[`dressingLoveSide7Period${p}`] === folded[`dressingLoveSide7Period${p}`])
    const foldedPasses =
      folded.reverses === 1 &&
      folded.chargeKept === 1 &&
      (folded.cptPhase ?? -1) >= 0 &&
      (folded.additivityWorst ?? 1) < 1e-9 &&
      folded.wallQuantized === 1 &&
      (folded.vacuumComponents ?? 99) <= (colorTurn.vacuumComponents ?? 0) &&
      (folded.denseComponents ?? 99) <= (colorTurn.denseComponents ?? 0) &&
      leaks.knit === 0 &&
      dressingKeys.every(k => (folded[k] ?? Infinity) <= (committed[k] ?? 0))
    const steeredExact = [lone, line].every(r => r.reverses === 1 && r.chargeKept === 1)

    const ok = agree && foldedPasses && steeredExact && (line.boxCptPhase ?? -1) >= 0

    const prefix = (name: string, values: Record<string, number>): [string, number][] =>
      Object.entries(values).map(([k, v]) => [`${name}${k.charAt(0).toUpperCase()}${k.slice(1)}`, v])

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the whole-box instruments agree with the dock instruments on the unsteered fold; the unsteered fold reverses, keeps charge and CPT, superposes exactly, quantizes walls, has no more line components than the color turn weave, leaks no color, and dresses no more than the committed knit at sides 7, 9 and 11 for a love and a fear; both steered folds reverse and keep charge with the flux, and line steering keeps CPT on the full box",
      metrics: {
        instrumentsAgree: agree ? 1 : 0,
        foldedPassesBattery: foldedPasses ? 1 : 0,
        ...Object.fromEntries(prefix('folded', folded)),
        ...Object.fromEntries(prefix('foldedBox', foldedBox)),
        ...Object.fromEntries(prefix('lone', lone)),
        ...Object.fromEntries(prefix('line', line)),
        knitColorLeaks: leaks.knit,
        loneSteeringColorLeaks: leaks.lone,
        lineSteeringColorLeaks: leaks.line,
      },
      control: {
        ...Object.fromEntries(prefix('committed', committed)),
        ...Object.fromEntries(prefix('committedBox', committedBox)),
        ...Object.fromEntries(prefix('colorTurn', colorTurn)),
        ...Object.fromEntries(prefix('colorTurnBox', colorTurnBox)),
      },
      notes:
        "L2, exact integers, no random numbers. weave-acceptance's vacuum period looks only up to 24 beats and reads 0 beyond; the box instrument looks up to 72, with the flux. Full-box CPT uses the map that makes the stream its own mirror (every dock to its negative, every slot on its own direction, which is spatial inversion and velocity reversal together); the dock-level CPT of weave-acceptance is that map's collision half. Under it a slot's link becomes the link of the opposite slot of its line, so a steering rule that reads string per slot (lone) sees a different pattern at the mirror image, and one that reads it per line (line) does not. The coarse isotropy of the fold is another agent's question and is not asked here. What failed, as measured: the fold's dressing, which grows about tenfold each period at every side (side 11, a love: 119, 2,626, 17,835, 75,050), and its line components, 3 on the vacuum and 4 on the dense background against the color turn weave's 2 and 1. So the round robin that lets every line meet every other also lets a lone tone's disturbance spread without bound, and E-FRC-0153's binding does not come with a schedule the knit can adopt as it stands. Steering adds to it: with either steering a lone tone's disturbance fills most of the box within two periods.",
    })
  },
})
