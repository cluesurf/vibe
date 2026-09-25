// Color charge as an exact local law in the three-trit model, and what it costs.
//
// E-FRC-0123 left one seam: a pair made from calm took the role points its two calm slots held, so color
// appeared from nothing. This asks which line tables allow color to be conserved cell by cell at all.
//
// The search, exhaustive: every bijection of a line's 9 vibe states that keeps the vibe sum (24 tables),
// every weight a calm slot's role point may carry (-1, 0 or +1 on each side of the line, 9 choices), and
// every role update that commutes with every frame change (each new point an affine combination of the
// two old ones, 9 per transition). A table admits local color when some choice conserves the line's color
// content, sum of weight times point with its total weight, on every transition, as a bijection.
// Found: the 16 tables that create pairs from calm admit local color only if they have no hop (a lone
// charge moved to the other slot of its line), and then only with the calm weights (+1, -1), a calm slot's
// role point counted as color signed by its side. The committed pair table has the hop and admits none.
//
// The rule (code/rule/color-weave): the turning weave's schedule on the hop-free table, role points moving
// with their slots, swapping where two vibes meet on a wire. Gates, side-3 D4 box, 48 beats, dense start:
// - color content of every cell unchanged by every collision: 0 leaks, and the committed table run
//   through the same code as the control, which must leak
// - charge exact, Gauss's law at every cell on every beat, 48 beats back restore everything
// - a change of role frame in every cell commutes with the rule
// Reported beside the committed table's: the empty vacuum's return beat, and how many of 24 directions a
// lone love's disturbance reaches distance 3 in within 6 beats on a side-5 box. That box wraps at distance
// 2.5 to 4 depending on direction, so the count is a crude one. It read 3 against the committed 5, which a
// first version called the cost of dropping the hop. E-FRC-0125 measures travel properly (true distance,
// side 13, where 6 beats cannot wrap) and finds the reverse: 15 directions against 12, mean reach 5.67
// against 4.32. So dropping the hop costs no travel.
//
// Depth L1 for the search (exact, exhaustive), L2 for the rule (constructed against stated gates).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { colorBeat, colorBeatBack, colorLeaks, makeColorWeave, type LineTable } from '@/code/rule/color-weave'
import { gaussHolds, type VibeState } from '@/code/rule/vibe-weave'
import { d4BoxDistance } from '@/code/substrate/d4-box'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const mod3 = (x: number): number => ((x % 3) + 3) % 3
const V = [-1, 0, 1]
const STATES: [number, number][] = V.flatMap(a => V.map(b => [a, b] as [number, number]))
const index = (a: number, b: number): number => STATES.findIndex(([c, d]) => c === a && d === b)
const AFFINE: [number, number][] = [
  [1, 0],
  [0, 1],
  [2, 2],
]

function sumKeepingTables(): number[][] {
  const classes = new Map<number, number[]>()

  STATES.forEach(([a, b], i) => classes.set(a + b, [...(classes.get(a + b) ?? []), i]))

  const perms = (xs: number[]): number[][] =>
    xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(r => [x, ...r]))

  let out: number[][] = [Array.from({ length: 9 }, () => -1)]

  for (const members of classes.values()) {
    out = out.flatMap(table =>
      perms(members).map(image => {
        const t = [...table]

        members.forEach((m, i) => (t[m] = image[i] ?? -1))

        return t
      }),
    )
  }

  return out
}

// does the table conserve color content with calm weights (s0, s1), for some frame-free role update
function admitsLocalColor(table: number[], s0: number, s1: number): boolean {
  const weight = (v: number, s: number): number => (v !== 0 ? v : s)

  return STATES.every(([a, b], i) => {
    const [c, d] = STATES[table[i] ?? 0] ?? [0, 0]
    const w0 = [weight(a, s0), weight(b, s1)] as const
    const w1 = [weight(c, s0), weight(d, s1)] as const

    if (mod3(w0[0] + w0[1] - w1[0] - w1[1]) !== 0) {
      return false
    }

    return AFFINE.some(q0 =>
      AFFINE.some(
        q1 =>
          mod3(w1[0] * q0[0] + w1[1] * q1[0] - w0[0]) === 0 &&
          mod3(w1[0] * q0[1] + w1[1] * q1[1] - w0[1]) === 0 &&
          mod3(q0[0] * q1[1] - q0[1] * q1[0]) !== 0,
      ),
    )
  })
}

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

const empty = (slots: number): VibeState => ({ vibe: new Int8Array(slots), role: new Int8Array(slots), flow: new Int32Array(slots) })

const same = (a: VibeState, b: VibeState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) && a.role.every((v, i) => v === b.role[i]) && a.flow.every((v, i) => v === b.flow[i])

// the gates and the costs for one table
function runTable(table: LineTable): {
  leaks: number
  cellBeats: number
  chargeKept: boolean
  gauss: boolean
  reverses: boolean
  frameFree: boolean
  vacuumReturn: number
  travelling: number
} {
  const weave = makeColorWeave({ side: 3, table })
  const { mesh, moves } = weave
  const slots = mesh.cellCount * 24
  const start = dense(slots, 1.37)
  const charge = (s: VibeState): number => s.vibe.reduce((a, b) => a + b, 0)

  let s = start
  let leaks = 0
  let gauss = true
  let chargeKept = true

  for (let t = 0; t < 48; t++) {
    leaks += colorLeaks(weave, s, t)
    s = colorBeat(weave, s, t)
    gauss = gauss && gaussHolds(weave, start, s)
    chargeKept = chargeKept && charge(s) === charge(start)
  }

  for (let t = 47; t >= 0; t--) {
    s = colorBeatBack(weave, s, t)
  }

  const reverses = same(s, start)

  // a change of role frame in every cell, links changed to match
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const gaugedLinks = new Int16Array(weave.links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      gaugedLinks[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, weave.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged = { ...weave, links: gaugedLinks }
  const gaugeRoles = (state: VibeState): VibeState => ({
    ...state,
    role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0),
  })

  let a = dense(slots, 2.11)
  let b = gaugeRoles(a)
  let frameFree = true

  for (let t = 0; t < 24; t++) {
    a = colorBeat(weave, a, t)
    b = colorBeat(gauged, b, t)
    frameFree = frameFree && same(gaugeRoles(a), b)
  }

  // the empty vacuum's first return
  let v = empty(slots)
  let vacuumReturn = -1

  for (let t = 0; t < 48 && vacuumReturn < 0; t++) {
    v = colorBeat(weave, v, t)
    vacuumReturn = v.vibe.every(x => x === 0) ? t + 1 : -1
  }

  // a lone love per direction on a side-5 box: its disturbance reaching distance 3 within 6 beats
  const big = makeColorWeave({ side: 5, table })
  const bigSlots = big.mesh.cellCount * 24
  const center = Math.floor(big.mesh.cellCount / 2)

  let travelling = 0

  for (let d = 0; d < 24; d++) {
    let vacuum = empty(bigSlots)
    let seeded = empty(bigSlots)

    seeded.vibe[center * 24 + d] = 1

    let farthest = 0

    for (let t = 0; t < 6; t++) {
      vacuum = colorBeat(big, vacuum, t)
      seeded = colorBeat(big, seeded, t)

      for (let x = 0; x < big.mesh.cellCount; x++) {
        let diff = 0

        for (let e = 0; e < 24; e++) {
          diff += (seeded.vibe[x * 24 + e] ?? 0) - (vacuum.vibe[x * 24 + e] ?? 0)
        }

        if (diff !== 0) {
          farthest = Math.max(farthest, d4BoxDistance({ side: 5, a: center, b: x }))
        }
      }
    }

    travelling += farthest >= 3 ? 1 : 0
  }

  return { leaks, cellBeats: 48 * mesh.cellCount, chargeKept, gauss, reverses, frameFree, vacuumReturn, travelling }
}

export default experiment({
  id: 'gauge/color-is-local',
  code: 'E-FRC-0124',
  title:
    "color charge is an exact local law in the three-trit model if and only if the line table has no hop: of the 16 sum-keeping tables that create pairs from calm, only the hop-free ones admit it, with a calm slot's role point counted as color signed by its side, and the color weave built on one conserves every cell's color on every beat with charge, Gauss's law, reversal and frame change exact",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const tables = sumKeepingTables()
    const calm = index(0, 0)
    const creating = tables.filter(t => t[calm] !== calm)
    const hops = (t: number[]): boolean =>
      STATES.some(([a, b], i) => {
        const [c, d] = STATES[t[i] ?? 0] ?? [0, 0]

        return (a === 0) !== (b === 0) && a === d && b === c
      })
    const weights = V.flatMap(s0 => V.map(s1 => [s0, s1] as const))
    const localCreating = creating.filter(t => weights.some(([s0, s1]) => admitsLocalColor(t, s0, s1)))
    const localWithHop = localCreating.filter(hops).length
    const localWeightsOnlySigned = localCreating.every(t =>
      weights.every(([s0, s1]) => !admitsLocalColor(t, s0, s1) || (s0 === -s1 && s0 !== 0)),
    )
    const committed = STATES.map(([a, b]) => {
      if (a === 0 && b === 0) {
        return index(1, -1)
      }

      if (a === 1 && b === -1) {
        return index(-1, 1)
      }

      if (a === -1 && b === 1) {
        return index(0, 0)
      }

      return a === b ? index(a, b) : index(b, a)
    })
    const committedAdmits = weights.some(([s0, s1]) => admitsLocalColor(committed, s0, s1))

    const bind = runTable('bind')
    const pair = runTable('pair')

    const ok =
      localCreating.length > 0 &&
      localWithHop === 0 &&
      localWeightsOnlySigned &&
      !committedAdmits &&
      bind.leaks === 0 &&
      pair.leaks > 0 &&
      bind.chargeKept &&
      bind.gauss &&
      bind.reverses &&
      bind.frameFree

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'among sum-keeping line tables that create pairs from calm, local color exists exactly for the hop-free ones, with calm color signed by side, the committed table admits none, and the color weave on the hop-free table leaks no color from any cell on any beat while keeping charge, Gauss, reversal and frame change exact',
      metrics: {
        sumKeepingTables: tables.length,
        creatingTables: creating.length,
        creatingWithLocalColor: localCreating.length,
        localColorWithHop: localWithHop,
        calmWeightsSignedBySide: localWeightsOnlySigned ? 1 : 0,
        committedAdmitsLocalColor: committedAdmits ? 1 : 0,
        colorLeaks: bind.leaks,
        cellBeats: bind.cellBeats,
        chargeConserved: bind.chargeKept ? 1 : 0,
        gaussEveryCellEveryBeat: bind.gauss ? 1 : 0,
        reversesExactly: bind.reverses ? 1 : 0,
        frameFree: bind.frameFree ? 1 : 0,
        vacuumReturnBeat: bind.vacuumReturn,
        travellingDirections: bind.travelling,
      },
      control: {
        committedTableColorLeaks: pair.leaks,
        committedVacuumReturnBeat: pair.vacuumReturn,
        committedTravellingDirections: pair.travelling,
      },
      notes:
        'Exhaustive over 24 tables, 9 calm weightings and the 9 frame-free role updates per transition. The color weave is a candidate for the base, not the committed rule: dropping the hop is a change to the wire table. The travelling count here is a crude small-box one, kept for comparison only. The proper travel measure and the rest of the acceptance battery on this table are E-FRC-0125.',
    })
  },
})
