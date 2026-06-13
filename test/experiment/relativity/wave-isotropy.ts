// P150: wave-speed ISOTROPY on the {5,3,4} (the Lorentz rung for the deterministic wave). (P124, P148, P149.)
//
// With a deterministic reversible rule the dynamics is a WAVE (P148, P149, ballistic z=1). For special
// relativity the wave SPEED must be the same in every direction (isotropic c). We run a second-order
// reversible wave on the {5,3,4}, s(t+1)[i] = (sum of neighbours s(t) - s(t-1)[i]) mod 3, send out a
// perturbation from the centre, and measure the wavefront speed (hyperbolic distance reached, per beat) in
// every direction. Low anisotropy = an emergent isotropic light speed, the rotational half of Lorentz, now
// for the WAVE rather than the diffusion tensor (P124). Run: npx tsx code/experiment/p150-wave-isotropy.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { norm } from '@/code/algebra/vector'
import { poincareDistance } from '@/code/geometry/distance'
import { reversibleWaveStep } from '@/code/dynamics/reversible-wave'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function waveIsotropy(input?: { maxCells?: number; beats?: number }): {
  cells: number
  beats: number
  frontSpeeds: number[]
  meanSpeed: number
  anisotropy: number
  isotropic: boolean
  reversible: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 13000
  const beats = input?.beats ?? 4
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const N = g.cellCount
  const coords = g.coords
  const dim = coords[0]!.length

  // the 12 face directions = unit vectors toward the neighbours of the centre cell (cell 0 at the origin)
  const dirs: number[][] = g.neighbors[0]!.map((j) => {
    const c = coords[j]!
    const n = norm(c)
    return c.map((v) => v / Math.max(1e-12, n))
  })

  // second-order reversible wave on the crystal, s in {0,1,2}, perturbation at the centre
  const stepWave = (prev: Uint8Array, cur: Uint8Array, next: Uint8Array): void => {
    reversibleWaveStep({ neighbors: g.neighbors, previous: prev, current: cur, next, modulus: 3 })
  }
  let prev = new Uint8Array(N)
  let cur = new Uint8Array(N)
  cur[0] = 1 // the perturbation
  const prev0 = prev.slice()
  const cur0 = cur.slice()
  for (let t = 0; t < beats; t++) {
    const next = new Uint8Array(N)
    stepWave(prev, cur, next)
    prev = cur
    cur = next
  }

  // reversibility check (the same symmetric step run backward recovers the start)
  let pr = prev.slice()
  let cu = cur.slice()
  for (let t = 0; t < beats; t++) {
    const back = new Uint8Array(N)
    stepWave(cu, pr, back)
    cu = pr
    pr = back
  }
  let reversible = true
  for (let i = 0; i < N; i++) if (pr[i] !== prev0[i] || cu[i] !== cur0[i]) {
    reversible = false
    break
  }

  // the wave SPEED in each of the 12 face-directions = the farthest activated cell in that direction's
  // angular sector, in hyperbolic distance, per beat. Isotropy = low spread of the speed across directions.
  const frontDist = new Array<number>(dirs.length).fill(0)
  for (let i = 1; i < N; i++) {
    if (cur[i] === 0) continue
    const c = coords[i]!
    const n = norm(c)
    if (n < 1e-9) continue
    // nearest face-direction by angle
    let bd = 0
    let bdot = -Infinity
    for (let m = 0; m < dirs.length; m++) {
      let dot = 0
      for (let k = 0; k < dim; k++) dot += (c[k]! / n) * dirs[m]![k]!
      if (dot > bdot) {
        bdot = dot
        bd = m
      }
    }
    const d = poincareDistance(coords[0]!, c)
    if (d > frontDist[bd]!) frontDist[bd] = d
  }
  const frontSpeeds = frontDist.filter((d) => d > 0).map((d) => d / beats)
  const meanSpeed = frontSpeeds.reduce((s, x) => s + x, 0) / Math.max(1, frontSpeeds.length)
  let mn = Infinity
  let mx = -Infinity
  for (const v of frontSpeeds) {
    if (v < mn) mn = v
    if (v > mx) mx = v
  }
  const anisotropy = frontSpeeds.length > 1 ? (mx - mn) / meanSpeed : 1

  const isotropic = frontSpeeds.length >= 12 && anisotropy < 0.25 // a nearly uniform wave speed
  const solved = isotropic && reversible

  return {
    cells: N,
    beats,
    frontSpeeds,
    meanSpeed,
    anisotropy,
    isotropic,
    reversible,
    solved,
  }
}

export default defineExperiment({
  id: 'relativity/wave-isotropy',
  title: 'the deterministic reversible wave on the dodecagrid has an isotropic speed',
  category: 'relativity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = waveIsotropy({ maxCells: 13000 })
    const ok = r.solved && r.isotropic && r.reversible
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a second-order reversible wave reaches the same hyperbolic distance per beat in all 12 face directions, an emergent isotropic light speed',
      metrics: {
        meanSpeed: r.meanSpeed,
        anisotropy: r.anisotropy,
      },
    })
  },
})
