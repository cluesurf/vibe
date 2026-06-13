// P111: signaling between distant selves, the field beneath. (Ties to P91 holography shortcuts.)
//
// The hyperbolic {5,3,4} has a LOGARITHMIC diameter: two selves separated by a huge VOLUME of cells are
// only a few HOPS apart through the bulk (the shortcut, the field beneath). So a signal from one self
// reaches a far self fast, crossing an enormous volume in a few graph steps. This measures the diameter
// (small, about log of the cell count) and shows a charge signal injected at one self reaches a
// maximally-distant self, while a control with no signal shows nothing there.
// Run: npx tsx code/experiment/p111-signaling.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrEccentricity, edgesFromCsr } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// conserved hop diffusion of a signal (no arrow, no opposite charge, so the pulse just spreads)
function hopBeat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 0) !== (b === 0)) {
      if (rng.next() < 0.5) {
        const t = tone[v]!
        tone[v] = tone[w]!
        tone[w] = t
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

export function signaling(input?: { n?: number }): {
  n: number
  eccentricity: number
  logN: number
  diameterIsLogarithmic: boolean
  signalAtFar: number
  controlAtFar: number
  signalReachesFar: boolean
  fieldBeneath: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const { dist, far } = csrEccentricity({ offsets: g.offsets, adj: g.adj, size: N, source: 0 })
  const ecc = dist[far]!
  const logN = Math.log2(N)
  const diameterIsLogarithmic = ecc < 3 * logN // a few hops, not order N

  // a far self = a small ball around the farthest cell. measure charge arriving there
  const farBall: number[] = []
  for (let i = 0; i < N; i++) if (dist[i]! >= ecc - 1) farBall.push(i)
  const moved = new Uint8Array(N)

  // SIGNAL: inject a + pulse at self A (node 0 and neighbors), diffuse, measure arrival at the far self
  const sig = new Int8Array(N)
  let injected = 0
  for (let i = 0; i < N && injected < 400; i++) if (dist[i]! <= 4) {
    sig[i] = 1
    injected++
  }
  const rng = makeRng({ seed: 3 })
  for (let b = 0; b < 4 * ecc; b++) hopBeat(sig, eu, ev, moved, rng)
  const signalAtFar = farBall.filter((i) => sig[i] === 1).length

  // CONTROL: no signal injected
  const ctrl = new Int8Array(N)
  const rng2 = makeRng({ seed: 3 })
  for (let b = 0; b < 4 * ecc; b++) hopBeat(ctrl, eu, ev, moved, rng2)
  const controlAtFar = farBall.filter((i) => ctrl[i] === 1).length

  const signalReachesFar = signalAtFar > 0 && controlAtFar === 0
  const fieldBeneath = diameterIsLogarithmic && signalReachesFar
  const solved = fieldBeneath

  return {
    n: N,
    eccentricity: ecc,
    logN,
    diameterIsLogarithmic,
    signalAtFar,
    controlAtFar,
    signalReachesFar,
    fieldBeneath,
    solved,
  }
}

export default defineExperiment({
  id: 'holography/signaling',
  title: 'a signal crosses the whole universe through the bulk to a far self',
  category: 'holography',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = signaling({ n: 60000 })
    const ok = r.solved && r.fieldBeneath && r.diameterIsLogarithmic && r.signalReachesFar
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic mesh has a logarithmic diameter so a signal injected at one self reaches a maximally distant self through the bulk where the control shows none',
      metrics: {
        eccentricity: r.eccentricity,
        logN: r.logN,
        signalAtFar: r.signalAtFar,
        controlAtFar: r.controlAtFar,
      },
      control: { controlAtFar: r.controlAtFar },
    })
  },
})
