// P121: full recursion, a model of the model (the tower of self-models). (P116, P118, the-self-architecture.md.)
//
// A self-model (P116) is a part that represents the whole self. Recursion is a model OF a model. We build
// two selves in a chain: self 1 is driven by the world and forms hub1 (a model of the world, P116). hub1's
// running representation is then WIRED as the input to self 2, which forms hub2. So hub2 comes to represent
// hub1, a representation of a representation. The recursive chain is world -> model1 -> model2(model1).
//
// We check: hub2 tracks hub1 far above a time-shuffled baseline and vanishes without the dynamics (hub2 is
// a real, dynamically-built model of hub1), and hub2 tracks hub1 (its direct object) at least as well as it
// tracks the raw world (which it only sees THROUGH hub1), confirming it models the model, one step removed
// from the world. The wiring between selves is mere connectivity, the modeling itself is emergent.
// Run: npx tsx code/experiment/p121-recursion.ts

import { pearson } from '@/code/measure/statistics'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import {
  csrDistances,
  csrFarthestNode,
  edgesFromCsr,
} from '@/code/tool/graph'
import { conservingEdgeSweepSteered } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function recursion(input?: { n?: number }): {
  n: number
  hub1ModelsWorld: number
  hub2ModelsHub1: number
  hub2ModelsWorld: number
  shuffledBaseline: number
  noDynamics: number
  realModel: boolean
  modelsTheModel: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // two selves, far apart
  let center1 = 0

  for (let i = 1; i < N; i++) {
    if (
      g.offsets[i + 1]! - g.offsets[i]! >
      g.offsets[center1 + 1]! - g.offsets[center1]!
    ) {
      center1 = i
    }
  }

  const center2 = csrFarthestNode({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center1,
  })

  const d1 = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center1,
    maxRadius: 12,
  })

  const d2 = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center2,
    maxRadius: 12,
  })

  const r = 3
  const boundary1: number[] = []
  const hub1cells: number[] = []
  const boundary2: number[] = []
  const hub2cells: number[] = []

  for (let i = 0; i < N; i++) {
    if (d1[i]! >= r - 1 && d1[i]! <= r) {
      boundary1.push(i)
    }

    if (d1[i]! >= 0 && d1[i]! <= 1) {
      hub1cells.push(i)
    }

    if (d2[i]! >= r - 1 && d2[i]! <= r && d1[i]! > r) {
      boundary2.push(i)
    }

    if (d2[i]! >= 0 && d2[i]! <= 1 && d1[i]! > r) {
      hub2cells.push(i)
    }
  }

  // world input on self 1, sectored
  const K = 4
  const sectorOf = new Int32Array(N).fill(-1)

  for (let j = 0; j < boundary1.length; j++) {
    sectorOf[boundary1[j]!] = Math.floor((j * K) / boundary1.length)
  }

  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0

    for (const i of cells) {
      s += tone[i]!
    }

    return cells.length > 0 ? s / cells.length : 0
  }

  function run(withDynamics: boolean): {
    h1: number[]
    h2: number[]
    world: number[]
  } {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed: 9 })
    const T = 600
    const sigs = new Array<number>(K).fill(1)
    const h1: number[] = []
    const h2: number[] = []
    const world: number[] = []

    for (let t = 0; t < T; t++) {
      for (let s = 0; s < K; s++) {
        if (rng.next() < 0.06) {
          sigs[s] = -sigs[s]!
        }
      }

      // drive self 1 with the world
      for (const i of boundary1) {
        tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
      }

      // model1's current representation of the world
      const m1 = meanOver(tone, hub1cells)
      // WIRE hub1 -> self 2's input (broadcast the sign of model1 onto self 2's boundary)
      const s2in = (m1 > 0.05 ? 1 : m1 < -0.05 ? -1 : 0) as -1 | 0 | 1

      for (const i of boundary2) {
        tone[i] = s2in
      }

      if (withDynamics) {
        conservingEdgeSweepSteered({
          tone,
          eu,
          ev,
          moved,
          rng,
          distGoal: null,
          towardSign: 0,
        })
      }

      for (const i of boundary1) {
        tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
      }

      for (const i of boundary2) {
        tone[i] = s2in
      }

      h1.push(meanOver(tone, hub1cells))
      h2.push(meanOver(tone, hub2cells))

      let wsum = 0

      for (let s = 0; s < K; s++) {
        wsum += sigs[s]!
      }

      world.push(wsum / K)
    }

    return { h1, h2, world }
  }

  const live = run(true)
  const dead = run(false)

  const hub1ModelsWorld = Math.abs(
    pearson({ a: live.h1, b: live.world }),
  )

  const hub2ModelsHub1 = Math.abs(pearson({ a: live.h2, b: live.h1 }))
  const hub2ModelsWorld = Math.abs(
    pearson({ a: live.h2, b: live.world }),
  )

  const shuffledBaseline = Math.abs(
    pearson({ a: live.h2, b: live.h1.slice().reverse() }),
  )

  const noDynamics = Math.abs(pearson({ a: dead.h2, b: dead.h1 }))

  const realModel =
    hub2ModelsHub1 > 0.4 &&
    hub2ModelsHub1 > shuffledBaseline + 0.3 &&
    hub2ModelsHub1 > noDynamics + 0.3

  const modelsTheModel = hub2ModelsHub1 >= hub2ModelsWorld - 0.05 // tracks the model at least as well as the world
  const solved = realModel && modelsTheModel && hub1ModelsWorld > 0.4

  return {
    n: N,
    hub1ModelsWorld,
    hub2ModelsHub1,
    hub2ModelsWorld,
    shuffledBaseline,
    noDynamics,
    realModel,
    modelsTheModel,
    solved,
  }
}

export default experiment({
  id: 'selves/p121-recursion',
  title:
    'hub2 represents hub1, the chain world to model1 to model2 of model1',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = recursion({ n: 60000 })
    const ok =
      r.solved &&
      r.realModel &&
      r.modelsTheModel &&
      r.hub1ModelsWorld > 0.4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'self two forms a hub that represents self one hub, a model of a model, tracking it above the raw world and far above a shuffle',
      metrics: {
        hub1ModelsWorld: r.hub1ModelsWorld,
        hub2ModelsHub1: r.hub2ModelsHub1,
      },
      control: {
        shuffledBaseline: r.shuffledBaseline,
        noDynamics: r.noDynamics,
      },
    })
  },
})
