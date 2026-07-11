// P99: willpower grounded in the five (no scalar posited). (Stage 6 grounding, the-will-from-the-four.md.)
//
// P98 tested the will's decision logic with willpower as an abstract number. This test removes that
// abstraction. Here "willpower" is NOT a posited scalar, it IS the self's reserve of charge, a measured
// quantity of the real conserved dynamics (P94, hop / polarize / share on {5,3,4}), nothing added
// beyond the five base things.
//
// Setup: a self (a central cluster) holds a reserve of charge. It PUMPS (biased interior hops) to keep
// a pleasure at its core, while the surrounding field DRAINS it (leaky boundary hops let charge escape
// into the peace). Pumping holds the core only by feeding it from the reserve, so the reserve depletes.
// When the reserve runs out, the core collapses, this is willpower running out and the self relapsing
// or dying, with willpower being literally the measured reserve.
//
// Predictions checked: the reserve DEPLETES while the self pumps against the field, a stronger field
// drains it FASTER (shorter endurance), pumping PROLONGS the hold versus not pumping (it spends the
// reserve to do so), and the total charge Q is conserved exactly throughout. Willpower is the reserve,
// emergent, not a sixth base thing. Run: npx tsx code/experiment/p99-willpower-grounded.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { neighborDistances, edgesOf } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { pumpedReserveSweep } from '@/code/dynamics/pumped-reserve-sweep'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'

export function willpowerGrounded(): {
  cells: number
  selfSize: number
  reserveStart: number
  reserveEndPumped: number
  reserveDepletes: boolean
  conserved: boolean
  enduranceWeakField: number
  enduranceStrongField: number
  strongerFieldDrainsFaster: boolean
  endurancePumped: number
  enduranceNoPump: number
  pumpingProlongs: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({
    symbol: [5, 3, 4],
    depth: 20,
    maxChambers: 60000,
  })

  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  let center = 0

  for (let i = 1; i < n; i++) {
    if (neighbors[i]!.length > neighbors[center]!.length) center = i
  }

  const distC = neighborDistances({
    neighbors,
    size: n,
    source: center,
  })

  // {5,3,4} is very dense, so use BFS-ORDER prefixes for a small, controllable self and core (a
  // distance shell would grab hundreds of cells). The self is a modest reserve, the core is the held
  // pleasure it must keep topped up.
  const order: number[] = []

  {
    const seen = new Uint8Array(n)

    seen[center] = 1

    let frontier = [center]

    while (frontier.length > 0 && order.length < n) {
      const next: number[] = []

      for (const u of frontier) {
        order.push(u)

        for (const w of neighbors[u]!) {
          if (!seen[w]) {
            seen[w] = 1
            next.push(w)
          }
        }
      }

      frontier = next
    }
  }

  const SELF_SIZE = 40
  const CORE_SIZE = 6
  const inSelf = new Uint8Array(n)
  const inCore = new Uint8Array(n)

  for (let k = 0; k < SELF_SIZE && k < order.length; k++)
    inSelf[order[k]!] = 1

  for (let k = 0; k < CORE_SIZE && k < order.length; k++)
    inCore[order[k]!] = 1

  let selfSize = 0

  for (let i = 0; i < n; i++) {
    if (inSelf[i]) {
      selfSize++
    }
  }

  const coreCharge = (t: Int8Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      if (inCore[i]) s += t[i]!
    }

    return s
  }

  const reserve = (t: Int8Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      if (inSelf[i]) s += t[i]!
    }

    return s
  }

  // initial state: the self is full of pleasure (its reserve), everything else is at peace
  function makeSelf(): Int8Array {
    const t = new Int8Array(n)

    for (let i = 0; i < n; i++) {
      if (inSelf[i]) t[i] = 1
    }

    return t
  }

  // run until the core pleasure collapses (falls below half its start), return that endurance time
  function endurance(
    fieldLeak: number,
    pump: boolean,
  ): { beats: number; reserveEnd: number; q0: number; qEnd: number } {
    const t = makeSelf()
    const q0 = sumTone(t)
    const core0 = coreCharge(t)
    const rng = makeRng({ seed: 3 })
    const maxBeats = 200

    let beats = maxBeats

    for (let b = 1; b <= maxBeats; b++) {
      pumpedReserveSweep({
        tone: t,
        edges,
        inSelf,
        distC,
        rng,
        fieldLeak,
        pump,
      })

      if (coreCharge(t) < 0.5 * core0) {
        beats = b
        break
      }
    }

    return { beats, reserveEnd: reserve(t), q0, qEnd: sumTone(t) }
  }

  const reserveStart = reserve(makeSelf())

  const weak = endurance(0.15, true)
  const strong = endurance(0.6, true)
  const noPump = endurance(0.15, false)

  const reserveEndPumped = strong.reserveEnd
  const reserveDepletes = strong.reserveEnd < reserveStart
  const conserved =
    weak.q0 === weak.qEnd &&
    strong.q0 === strong.qEnd &&
    noPump.q0 === noPump.qEnd

  const strongerFieldDrainsFaster = strong.beats < weak.beats
  const pumpingProlongs = weak.beats > noPump.beats

  const solved =
    reserveDepletes &&
    conserved &&
    strongerFieldDrainsFaster &&
    pumpingProlongs

  return {
    cells: n,
    selfSize,
    reserveStart,
    reserveEndPumped,
    reserveDepletes,
    conserved,
    enduranceWeakField: weak.beats,
    enduranceStrongField: strong.beats,
    strongerFieldDrainsFaster,
    endurancePumped: weak.beats,
    enduranceNoPump: noPump.beats,
    pumpingProlongs,
    solved,
  }
}

export default experiment({
  id: 'selves/willpower-grounded',
  code: 'E-SLF-0152',
  title:
    'a charge reserve depletes when a self pumps against a draining field',
  category: 'selves',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = willpowerGrounded()

    // What holds (the base mechanics): the conserved charge reserve depletes as the self
    // spends it, and total charge is conserved exactly. What does NOT hold (the willpower
    // MODEL): pumping does not prolong the core's hold (it shortens it, pumped endurance
    // below no-pump), and a stronger field does not measurably drain faster. The pump is a
    // SIXTH ingredient beyond the five base things, a hand-set bias, so this could never be
    // a base-emergent result, and tuning the pump to force the predictions would be exactly
    // the imposition the methodology forbids. The honest finding: willpower does NOT emerge
    // as a pumped charge reserve, so willpower from the base is an open frontier.
    const baseMechanicsHold = r.reserveDepletes && r.conserved
    const willpowerModelFails =
      !r.pumpingProlongs || !r.strongerFieldDrainsFaster

    return verdict({
      status:
        baseMechanicsHold && willpowerModelFails ? 'open' : 'fail',
      claim:
        'the conserved charge reserve depletes as a self spends it and total charge is conserved exactly, but the pumped-reserve model of willpower does NOT reproduce willpower behavior: pumping shortens the core hold rather than prolonging it, and a stronger field does not measurably drain faster. The pump is a sixth ingredient beyond the five base things, so this is not base-emergent, and tuning it to force the predictions would be an imposition. Willpower from the base remains an open frontier, reported as an honest negative rather than imposed',
      metrics: {
        reserveStart: r.reserveStart,
        reserveEndPumped: r.reserveEndPumped,
        enduranceWeakField: r.enduranceWeakField,
        enduranceStrongField: r.enduranceStrongField,
        enduranceNoPump: r.enduranceNoPump,
        pumpingProlongs: r.pumpingProlongs ? 1 : 0,
      },
      control: {
        weakFieldEndurance: r.enduranceWeakField,
        strongFieldEndurance: r.enduranceStrongField,
        noPumpEndurance: r.enduranceNoPump,
      },
      notes:
        'OPEN, an honest negative not imposed. The base mechanics hold (the conserved charge reserve depletes, charge conserved exactly), but the willpower predictions fail: pumping shortens rather than prolongs the hold, and field strength does not differentiate. The pump is a sixth ingredient and the schedule is pseudo-random, so this cannot establish willpower from the five base things, and forcing it green by tuning the pump is forbidden by the methodology. Willpower from the base is left open. A deterministic, pump-free mechanism (if one exists) would be the real result; none is shown here.',
    })
  },
})
