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
    if (neighbors[i]!.length > neighbors[center]!.length) {
      center = i
    }
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
  for (let k = 0; k < SELF_SIZE && k < order.length; k++) {
    inSelf[order[k]!] = 1
  }

  for (let k = 0; k < CORE_SIZE && k < order.length; k++) {
    inCore[order[k]!] = 1
  }

  let selfSize = 0
  for (let i = 0; i < n; i++) {
    if (inSelf[i]) {
      selfSize++
    }
  }

  const coreCharge = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) {
      if (inCore[i]) {
        s += t[i]!
      }
    }

    return s
  }

  const reserve = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) {
      if (inSelf[i]) {
        s += t[i]!
      }
    }

    return s
  }

  // initial state: the self is full of pleasure (its reserve), everything else is at peace
  function makeSelf(): Int8Array {
    const t = new Int8Array(n)
    for (let i = 0; i < n; i++) {
      if (inSelf[i]) {
        t[i] = 1
      }
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
  title:
    'a charge reserve depletes when a self pumps against a draining field',
  category: 'selves',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = willpowerGrounded()
    const ok = r.solved

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self holding a reserve of charge depletes that reserve while pumping against a draining field, a stronger field drains it faster, pumping prolongs the hold, and total charge is conserved exactly',
      metrics: {
        reserveStart: r.reserveStart,
        reserveEndPumped: r.reserveEndPumped,
        enduranceWeakField: r.enduranceWeakField,
        enduranceStrongField: r.enduranceStrongField,
        enduranceNoPump: r.enduranceNoPump,
      },
      control: {
        weakFieldEndurance: r.enduranceWeakField,
        strongFieldEndurance: r.enduranceStrongField,
        noPumpEndurance: r.enduranceNoPump,
      },
      notes:
        'L1, not base-emergent. Charge is conserved, but the dynamics inject a PUMP, a hand-set bias of interior hops toward the center, and a field-leak parameter. The pump is an added ingredient beyond the five base things, so this models willpower as a reserve but does not show the bias emerging from the bare rule. It also relies on a pseudo-random hop schedule. The field-strength and pump-vs-no-pump comparisons are the controls.',
    })
  },
})
