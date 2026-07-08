// P118: predictive metacognition, does the self-model PREDICT the self? (P116, P117.)
//
// The hub mirrors the self's current global state (P116). For metacognition it should also let the self
// PREDICT its own near future better than any local part can. Because the hub holds the integrated global
// state, and the global state is autocorrelated (it changes slowly), the hub's value at time t should
// predict the self's global state at t+1 far better than a peripheral region (which only knows its local
// sector). We measure that, plus the cross-correlation lag structure (mirror vs lead vs lag).
//
// Honest scope: this is a usable FORWARD MODEL (the self-model is the best internal predictor of the
// self). Full RECURSION (a model of the model) is noted as the further step, the onion has one hub, so a
// second-order model would need added structure. Run: npx tsx code/experiment/p118-metacognition.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrDistances, edgesFromCsr } from '@/code/tool/graph'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function fullBeat(
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  beat: number,
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

      if (hashRand(k, beat, 1) < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

function corrLag(x: number[], y: number[], lag: number): number {
  // corr(x(t), y(t+lag))
  const xs: number[] = []
  const ys: number[] = []

  for (let t = 0; t < x.length; t++) {
    const u = t + lag

    if (u >= 0 && u < y.length) {
      xs.push(x[t]!)
      ys.push(y[u]!)
    }
  }

  const n = xs.length

  let mx = 0
  let my = 0

  for (let i = 0; i < n; i++) {
    mx += xs[i]!
    my += ys[i]!
  }

  mx /= n
  my /= n

  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx
    const dy = ys[i]! - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }

  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0
}

export function metacognition(input?: { n?: number }): {
  n: number
  hubPredict: number
  peripheralPredict: number
  peakLag: number
  hubMirror: number
  predictsFuture: boolean
  beatsLocal: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

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

  const isInput = new Uint8Array(N)
  const inputAll: number[] = []

  for (const i of self) {
    if (dist[i]! >= rSelf - 1) {
      isInput[i] = 1
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

  const core = ballOf(center, 40)
  const peripherals = sectorCells.map(sc =>
    ballOf(sc[Math.floor(sc.length / 2)]!, 40),
  )

  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0

    for (const i of cells) {
      s += tone[i]!
    }

    return cells.length > 0 ? s / cells.length : 0
  }

  const tone = new Int8Array(N)
  const T = 300
  const sigs = new Array<number>(K).fill(1)
  const gSeries: number[] = []
  const coreSeries: number[] = []
  const periSeries: number[][] = peripherals.map(() => [])

  for (let t = 0; t < T; t++) {
    for (let s = 0; s < K; s++) {
      // deterministic square wave per sector at a distinct incommensurate period/phase (no randomness)
      sigs[s] = Math.floor((t + s * 7 + 3) / (17 + s * 4)) % 2 === 0 ? 1 : -1
    }

    for (const i of inputAll) {
      tone[i] = sigs[sectorOf[i]!]!
    }

    fullBeat(tone, eu, ev, moved, t)

    for (const i of inputAll) {
      tone[i] = sigs[sectorOf[i]!]!
    }

    gSeries.push(meanOver(tone, self))
    coreSeries.push(meanOver(tone, core))

    for (let p = 0; p < peripherals.length; p++) {
      periSeries[p]!.push(meanOver(tone, peripherals[p]!))
    }
  }

  // predictive power: does the hub at t predict the self's GLOBAL state at t+1
  const hubPredict = Math.abs(corrLag(coreSeries, gSeries, 1))

  let peripheralPredict = 0

  for (let p = 0; p < peripherals.length; p++) {
    peripheralPredict += Math.abs(corrLag(periSeries[p]!, gSeries, 1))
  }

  peripheralPredict /= peripherals.length

  const hubMirror = Math.abs(corrLag(coreSeries, gSeries, 0))

  // peak lag of hub vs global
  let peakLag = 0
  let best = -1

  for (let lag = -3; lag <= 3; lag++) {
    const c = Math.abs(corrLag(coreSeries, gSeries, lag))

    if (c > best) {
      best = c
      peakLag = lag
    }
  }

  const predictsFuture = hubPredict > 0.4
  const beatsLocal = hubPredict > peripheralPredict + 0.15
  const solved = predictsFuture && beatsLocal

  return {
    n: N,
    hubPredict,
    peripheralPredict,
    peakLag,
    hubMirror,
    predictsFuture,
    beatsLocal,
    solved,
  }
}

export default experiment({
  id: 'selves/metacognition',
  code: 'E-SLF-0073',
  title:
    'the self-model predicts the self next state, beating local regions',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = metacognition({ n: 60000 })
    const ok = r.solved && r.predictsFuture && r.beatsLocal

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hub at time t predicts the self next global state far better than any local region, a usable internal forward model',
      metrics: {
        hubPredict: r.hubPredict,
        peripheralPredict: r.peripheralPredict,
        peakLag: r.peakLag,
      },
      control: {
        peripheralPredict: r.peripheralPredict,
      },
      notes:
        'this is a usable forward model, full recursion (a model of the model) would need added structure',
    })
  },
})
