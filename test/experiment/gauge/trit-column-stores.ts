// Can the cold weave's integer stores be column sums of trits (E-FRC-0209)?
//
// E-FRC-0207 holds light's integers as column sums: each HUSK object (a husk link, a husk triangle) owns a
// column of D bulk objects down the depth, so D trits per husk integer. The cold weave (code/rule/cold-weave,
// E-FLD-0032) carries three other integers, all on BULK objects: a kinetic store on every slot (24 per dock,
// streaming with its tone), a line counter (demon) per line (12 per dock), and, with roles, a flow per slot
// (flow <- flow + vibe, the running sum E-FRC-0175 read as the U(1) angle).
//
// The counting argument, fixed before any run. A column sum turns one husk integer into D bulk trits. A bulk
// object's integer has no depth fiber of its own: the D bulk docks over a husk dock are D DIFFERENT docks,
// each with its own slots, tones and stores. So a store can be a column sum only if the column over its
// slot holds nothing else, i.e. one tone per husk column-slot, which is the weave read on the husk; and the
// only trits a column-slot owns are its bulk tones' vibes. Two readings of a store as those vibes:
//   stack      a husk tone with store s is s + 1 bulk tones of its sign in its column-slot: the tone count is
//              the energy, but the charge is (1 + s) times the sign, not the sign
//   pair stack a husk tone with store s is one tone plus s love-fear pairs: the charge is right, but the
//              threshold move (two stores each give up 1, a pair is made on the wire) removes 4 bulk tones and
//              makes 2, so the tone count is not the energy
// Predictions: stores and demons are bounded by the energy (E = sum (1 + store) + sum demons is conserved),
// so their range fits a modest column; column-slots are shared by several tones on every busy beat; and both
// stack readings break a conservation law on every threshold move.
//
// Gates, fixed before the first run:
// Q1 range: every store, demon and |flow| reached in the runs fits a column of D = 16 trits (|value| <= 16),
//    and every store and demon is at most the conserved energy minus one
// Q2 fiber: no husk column-slot (husk dock, husk direction of the slot's root) ever holds two tones in the D4
//    box runs (the condition for a store to own its column)
// Q3 readings: exhaustive over the threshold move with stores 1 to 4 on each head-on tone, both signs: the
//    stack reading keeps charge and the pair-stack reading keeps the tone count on every case
// Status: pass if Q1, Q2 and Q3 pass, partial if Q1 passes, fail otherwise. The prediction is partial.
//
// Runs: the cold weave on the HEAD_TURN spec as E-FLD-0032 builds it, (a) the D4 box side 4 from a golden
// Weyl start (fill 0.6, stores 0 to 2), 48 beats, (b) a momentum wave (d4 box side 6, fill 0.2, bias 0.4),
// 96 beats, (c) the role run of E-FLD-0032 (side 3, flows), 48 beats.
//
// Depth L1: a counting argument with an exhaustive check and a census.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { coldBeat, coldEnergy, makeColdWeave, type ColdState } from '@/code/rule/cold-weave'
import { momentumWaveStart } from '@/code/measure/momentum-transport'
import { makeHusk } from '@/code/measure/photon-husk'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()

function spec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// the husk column-slot of slot i: its dock's husk column and its root's husk shadow (18 signed directions)
function columnSlots(side: number): Int32Array {
  const husk = makeHusk(photonLatticeD4({ side }))
  const shadowKey = ROOTS.map(r => (r[0] ?? 0) + 1 + 3 * ((r[1] ?? 0) + 1) + 9 * ((r[2] ?? 0) + 1))
  const cells = husk.column.length

  return Int32Array.from({ length: cells * 24 }, (_, i) => (husk.column[Math.floor(i / 24)] ?? 0) * 27 + (shadowKey[i % 24] ?? 0))
}

type Census = { maxStore: number; maxDemon: number; energy: number; sharedBeats: number; beats: number; sharedSlots: number; occupiedSlots: number }

function census(side: number, start: ColdState, beats: number): Census {
  const weave = makeColdWeave({ mesh: d4BoxMesh({ side }), spec: spec() })
  const slot = columnSlots(side)
  const count = new Int32Array(Math.max(...slot) + 1)
  const out: Census = { maxStore: 0, maxDemon: 0, energy: coldEnergy(start), sharedBeats: 0, beats: 0, sharedSlots: 0, occupiedSlots: 0 }

  let s = start

  for (let t = 0; t <= beats; t++) {
    count.fill(0)

    for (let i = 0; i < s.vibe.length; i++) {
      if (s.vibe[i] !== 0) {
        count[slot[i] ?? 0] = (count[slot[i] ?? 0] ?? 0) + 1
        out.maxStore = Math.max(out.maxStore, s.store[i] ?? 0)
      }
    }

    let shared = 0

    for (const c of count) {
      out.occupiedSlots += c > 0 ? 1 : 0
      shared += c > 1 ? 1 : 0
    }

    out.sharedSlots += shared
    out.sharedBeats += shared > 0 ? 1 : 0
    out.beats++
    out.maxDemon = Math.max(out.maxDemon, ...s.demon)

    if (t < beats) {
      s = coldBeat(weave, s, t)
    }
  }

  return out
}

function weylStart(side: number): ColdState {
  const mesh = d4BoxMesh({ side })
  const n = mesh.cellCount * 24
  const vibe = Int8Array.from({ length: n }, (_, i) => {
    const u = weyl(i + 1)

    return u < 0.3 ? -1 : u < 0.6 ? 1 : 0
  })

  return {
    vibe,
    store: Int32Array.from({ length: n }, (_, i) => (vibe[i] === 0 ? 0 : Math.floor(weyl(i + 7, Math.SQRT2 - 1) * 3))),
    demon: new Int32Array(mesh.cellCount * 12),
  }
}

function waveStart(side: number): ColdState {
  const mesh = d4BoxMesh({ side })
  const will = momentumWaveStart({ mesh, side, geometry: { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })

  return { vibe: will.data, store: new Int32Array(will.data.length), demon: new Int32Array(mesh.cellCount * 12) }
}

// the role run: flows grow as the running sum of each slot's vibe
function flowRun(): { maxFlow: number; beats: number } {
  const weave = makeColdWeave({ side: 3, spec: spec(), roles: true })
  const n = weave.mesh.cellCount * 24
  const vibe = Int8Array.from({ length: n }, (_, i) => {
    const u = weyl(i + 1)

    return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
  })

  let s: ColdState = {
    vibe,
    store: new Int32Array(n),
    demon: new Int32Array(weave.mesh.cellCount * 12),
    role: Int8Array.from({ length: n }, (_, i) => Math.floor(weyl(i + 3) * 9)),
    flow: new Int32Array(n),
  }
  let maxFlow = 0

  for (let t = 0; t < 48; t++) {
    s = coldBeat(weave, s, t)

    for (const f of s.flow ?? []) {
      maxFlow = Math.max(maxFlow, Math.abs(f))
    }
  }

  return { maxFlow, beats: 48 }
}

// the threshold move read through the two stack readings: two head-on tones of sign s with stores a, b >= 1
// and a calm wire become the same tones with stores a - 1, b - 1 and the pair (s, -s) on the wire
function readings(): { cases: number; stackChargeBroken: number; pairCountBroken: number } {
  let cases = 0
  let stackChargeBroken = 0
  let pairCountBroken = 0

  for (const s of [1, -1]) {
    for (let a = 1; a <= 4; a++) {
      for (let b = 1; b <= 4; b++) {
        cases++

        // the weave's own charge: s + s before, s + s + s - s after
        const charge = [2 * s, 2 * s]
        // stack: a tone with store x is x + 1 bulk tones of its sign
        const stack = [s * (a + 1) + s * (b + 1), s * a + s * b + s - s]
        // pair stack: one tone plus x neutral pairs, 1 + 2x bulk tones
        const count = [1 + 2 * a + (1 + 2 * b), 1 + 2 * (a - 1) + (1 + 2 * (b - 1)) + 2]

        stackChargeBroken += stack[0] === stack[1] && stack[0] === charge[0] && stack[1] === charge[1] ? 0 : 1
        pairCountBroken += count[0] === count[1] ? 0 : 1
      }
    }
  }

  return { cases, stackChargeBroken, pairCountBroken }
}

export default experiment({
  id: 'gauge/trit-column-stores',
  code: 'E-FRC-0209',
  title:
    "whether the cold weave's integer stores can be column sums of trits: their range fits a small column, but they live on bulk slots, whose depth fiber belongs to other docks, and reading them as stacks of the column's own vibes breaks charge or the energy count",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const a = census(4, weylStart(4), 48)
    const b = census(6, waveStart(6), 96)
    const f = flowRun()
    const r = readings()
    const okQ1 = Math.max(a.maxStore, a.maxDemon, b.maxStore, b.maxDemon, f.maxFlow) <= 16 && a.maxStore <= a.energy - 1 && b.maxStore <= b.energy - 1
    const okQ2 = a.sharedSlots === 0 && b.sharedSlots === 0
    const okQ3 = r.stackChargeBroken === 0 && r.pairCountBroken === 0
    const metrics: Record<string, number> = {
      aMaxStore: a.maxStore,
      aMaxDemon: a.maxDemon,
      aEnergy: a.energy,
      aSharedBeats: a.sharedBeats,
      aBeats: a.beats,
      aSharedSlotShare: a.sharedSlots / Math.max(1, a.occupiedSlots),
      bMaxStore: b.maxStore,
      bMaxDemon: b.maxDemon,
      bEnergy: b.energy,
      bSharedBeats: b.sharedBeats,
      bBeats: b.beats,
      bSharedSlotShare: b.sharedSlots / Math.max(1, b.occupiedSlots),
      flowMax: f.maxFlow,
      flowBeats: f.beats,
      readingCases: r.cases,
      stackChargeBroken: r.stackChargeBroken,
      pairCountBroken: r.pairCountBroken,
      bulkIntegersPerDock: 24 + 12 + 24,
      gateQ1: okQ1 ? 1 : 0,
      gateQ2: okQ2 ? 1 : 0,
      gateQ3: okQ3 ? 1 : 0,
    }

    return verdict({
      status: okQ1 && okQ2 && okQ3 ? 'pass' : okQ1 ? 'partial' : 'fail',
      claim:
        "the cold weave's stores, demons and flows fit a column of 16 trits in range, but they are integers of bulk slots and docks, whose depth columns hold other tones, and reading a store as a stack of the column's own vibes breaks charge (stacks) or the energy count (neutral-pair stacks)",
      metrics,
      notes:
        "L1, exact integers, deterministic (golden and silver Weyl starts). First run 2026-09-26 (tmp/frc0209.log, 0.6 s), FAIL by its status rule (Q1 fails on the flow alone). Q1: stores reach 5 (Weyl start, energy 7,370) and 2 (wave, energy 7,300), demons 10 and 6, all far under a 16-trit column and under the energy bound; but the flow reaches |38| in 48 beats, over 16: a flow is a running sum, unbounded, so as a column it can only be a cycling number, which is exactly what E-FRC-0207 makes the husk angle (the flow's physical role in E-FRC-0175). Q2: every beat of both runs has husk column-slots holding two or more tones (49 of 49 and 97 of 97 beats), 90 percent of occupied column-slots at fill 0.6 and 63 percent at fill 0.2: the depth column over a slot is shared by other docks' tones, so a slot's store cannot own it. Q3: on all 32 threshold cases the stack reading breaks charge (a stack of s + 1 same-sign tones carries charge (1 + s), and the move changes it by 2) and the pair-stack reading breaks the tone count (the move removes 4 bulk tones and makes 2). WHAT CANNOT BE A COLUMN AND WHY: a column sum turns ONE husk integer into D bulk trits. The cold weave's stores (24 per dock), demons (12 per dock) and flows (24 per dock), 60 integers per bulk dock, are integers of BULK objects, and a bulk object has no depth fiber of its own: the D docks under a husk dock are other docks with their own slots. So they can be columns only if the cold weave itself is read on the husk (one tone per husk column-slot, its store a husk integer held in D trits, as light's are), and even then a store is not a stack of the column's own vibes (Q3); it needs D store trits of its own per husk slot, like light's counters. As a bulk rule the cold weave's stores are irreducible integer registers.",
    })
  },
})
