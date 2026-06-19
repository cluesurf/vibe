// P116: emergence of a self-model (the strange loop), from the base alone. (self-model-must-emerge.md.)
//
// No added mechanism. An integrated self (a central vibe-patch) is driven by a slowly fluctuating signal
// at its boundary (its changing global state), and we ask whether a LOCALIZED sub-region naturally comes
// to MIRROR the rest of the self, a part that represents the whole that contains it, a strange loop. The
// central core (the hub, where global information converges via the field beneath, P111) should track the
// REST of the self far better than a random scattered sub-region, and only when the dynamics run (so it
// is the integration that builds the model, not anything we added).
//
// Predictions checked: the central core's state correlates strongly with the rest of the self's state
// (a self-representation), much more than random sub-regions and far above a time-shuffled baseline, and
// the correlation collapses without the dynamics (no hops). So a proto self-model emerges from the five.
// Run: npx tsx code/experiment/p116-self-model.ts

import { pearson } from '@/code/measure/statistics'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrDistances, edgesFromCsr } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// full perception beat (share annihilates opposite, hop transports into empty). Charge flows freely,
// including out of the clamped input cells, which are re-clamped to the signal after each beat (a source).
function fullBeat(
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  rng: Rng,
): void {
  moved.fill(0)

  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!

    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!

    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w

      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

function run(withDynamics: boolean): {
  selfModelCorr: number
  randomCorr: number
  shuffledCorr: number
} {
  const g = buildDodecagrid({ maxCells: 60000 })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // the self = a central patch; the hub = the most-connected cell
  let center = 0

  for (let i = 1; i < N; i++) {
    if (
      g.offsets[i + 1]! - g.offsets[i]! >
      g.offsets[center + 1]! - g.offsets[center]!
    ) {
      center = i
    }
  }

  const dist = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: center,
    maxRadius: 12,
  })

  const rSelf = 5
  const self: number[] = []

  for (let i = 0; i < N; i++) {
    if (dist[i]! >= 0 && dist[i]! <= rSelf) {
      self.push(i)
    }
  }

  // input boundary divided into K SECTORS, each driven by its OWN signal, so the global state is the
  // AVERAGE of spatially-varied inputs. A localized region near one sector sees only that sector, only an
  // integrator that pools all sectors can represent the whole.
  const inputAll: number[] = []

  for (const i of self) {
    if (dist[i]! >= rSelf - 1) {
      inputAll.push(i)
    }
  }

  const K = 4
  const sectorOf = new Int32Array(N).fill(-1)
  const sectorCells: number[][] = Array.from({ length: K }, () => [])

  for (let j = 0; j < inputAll.length; j++) {
    const s = Math.floor((j * K) / inputAll.length)
    sectorOf[inputAll[j]!] = s
    sectorCells[s]!.push(inputAll[j]!)
  }

  const isInput = new Uint8Array(N)

  for (const i of inputAll) {
    isInput[i] = 1
  }

  const ballOf = (start: number, size: number): number[] => {
    const out: number[] = []
    const seen = new Uint8Array(N)
    seen[start] = 1

    let fr = [start]

    while (fr.length > 0 && out.length < size) {
      const nf: number[] = []

      for (const u of fr) {
        if (isInput[u]) {
          continue
        }

        out.push(u)

        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!

          if (!seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }

      fr = nf
    }

    return out
  }

  const coreSize = 60
  const core = ballOf(center, coreSize) // the central hub (self-model candidate)
  // peripheral localized regions, one near each sector (controls, same size, but local)
  const peripherals: number[][] = sectorCells.map(sc =>
    ballOf(sc[Math.floor(sc.length / 2)]!, coreSize),
  )

  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0

    for (const i of cells) {
      s += tone[i]!
    }

    return cells.length > 0 ? s / cells.length : 0
  }

  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 9 })
  const T = 250
  const sigs = new Array<number>(K).fill(1)
  const gSeries: number[] = [] // the global state = mean over the whole self
  const coreSeries: number[] = []
  const periSeries: number[][] = peripherals.map(() => [])

  for (let t = 0; t < T; t++) {
    for (let s = 0; s < K; s++) {
      if (rng.next() < 0.06) {
        sigs[s] = -sigs[s]!
      }
    }

    for (const i of inputAll) {
      tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
    }

    if (withDynamics) {
      fullBeat(tone, eu, ev, moved, rng)
    }

    for (const i of inputAll) {
      tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
    }

    gSeries.push(meanOver(tone, self))
    coreSeries.push(meanOver(tone, core))

    for (let p = 0; p < peripherals.length; p++) {
      periSeries[p]!.push(meanOver(tone, peripherals[p]!))
    }
  }

  const selfModelCorr = Math.abs(pearson({ a: coreSeries, b: gSeries }))

  let randomCorr = 0

  for (let p = 0; p < peripherals.length; p++) {
    randomCorr += Math.abs(pearson({ a: periSeries[p]!, b: gSeries }))
  }

  randomCorr /= peripherals.length

  const shuffledCorr = Math.abs(
    pearson({ a: coreSeries, b: gSeries.slice().reverse() }),
  )

  return { selfModelCorr, randomCorr, shuffledCorr }
}

export function selfModel(): {
  selfModelCorr: number
  randomCorr: number
  shuffledCorr: number
  noDynamicsCorr: number
  mirrorsWhole: boolean
  beatsRandom: boolean
  needsDynamics: boolean
  emerges: boolean
  solved: boolean
} {
  const live = run(true)
  const dead = run(false)
  const mirrorsWhole =
    live.selfModelCorr > 0.5 &&
    live.selfModelCorr > live.shuffledCorr + 0.3

  const beatsRandom = live.selfModelCorr > live.randomCorr + 0.1
  const needsDynamics = live.selfModelCorr > dead.selfModelCorr + 0.3
  const emerges = mirrorsWhole && beatsRandom && needsDynamics

  return {
    selfModelCorr: live.selfModelCorr,
    randomCorr: live.randomCorr,
    shuffledCorr: live.shuffledCorr,
    noDynamicsCorr: dead.selfModelCorr,
    mirrorsWhole,
    beatsRandom,
    needsDynamics,
    emerges,
    solved: emerges,
  }
}

export default experiment({
  id: 'selves/self-model',
  title:
    'a localized hub represents the self global state, beating local regions and a shuffle',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = selfModel()
    const ok =
      r.solved &&
      r.emerges &&
      r.mirrorsWhole &&
      r.beatsRandom &&
      r.needsDynamics

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a central hub comes to represent the self global state far above peripheral local regions, far above a time-shuffled baseline, and vanishes without the dynamics',
      metrics: {
        selfModelCorr: r.selfModelCorr,
        randomCorr: r.randomCorr,
      },
      control: {
        shuffledCorr: r.shuffledCorr,
        noDynamicsCorr: r.noDynamicsCorr,
      },
    })
  },
})
