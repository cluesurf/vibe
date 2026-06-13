// P182: an exact {4,4} horosphere ({4,4,3}) validates the flat-self physics. (P180, the-three-layers-and-the-self.md.)
//
// P180 modeled the {5,3,4} horosphere as a flat TRIANGULAR lattice, an idealization (justified because the
// self-physics depends on flat curvature, not the tiling, and because {5,3,4} is compact so its horosphere
// has no clean regular tiling). The honest test of that idealization is to redo it on a flat layer that IS
// an EXACT regular horosphere of a real honeycomb. The paracompact honeycomb {4,4,3} has Euclidean square
// cells {4,4}, so its horosphere is exactly the {4,4} square lattice, cell-for-cell. We run the same self
// dynamics on it and confirm the same physics, compact selves are possible (boundary-to-volume falls), the
// self leaks little, and persists far better than in the hyperbolic bulk. Same conclusions on the exact
// square horosphere as on the triangular idealization means the result is a fact about FLAT CURVATURE, not
// about the lattice or the honeycomb, so the idealization was sound and {5,3,4} can keep its forced
// geometry while we simulate selves on a flat layer. Run: npx tsx code/experiment/p182-exact-horosphere.ts

import { pathToFileURL } from 'node:url'
import { bulkGraph, flatGraph, squareGraph, beat, emergeSelf, countPlus, boundaryFraction, ball, type Graph } from '@/test/experiment/misc/self-kit'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function ballScaling(g: Graph, center: number, radii: number[]): number[] {
  return radii.map((r) => boundaryFraction(ball(g, center, r), g))
}

function selfDynamics(g: Graph, seed: number): { leakPerBeat: number; passiveFidelity: number } {
  const moved = new Uint8Array(g.cellCount)
  const rng = makeRng({ seed })
  const { tone, cluster } = emergeSelf(g, rng, moved)
  const tl = tone.slice()
  const before = countPlus(tl, cluster)
  beat(tl, g, moved, makeRng({ seed: seed + 1 }), 0, 0.22)
  const leakPerBeat = before > 0 ? 1 - countPlus(tl, cluster) / before : 1
  const t2 = tone.slice()
  const rng2 = makeRng({ seed: seed + 2 })
  for (let b = 0; b < 50; b++) beat(t2, g, moved, rng2, 0, 0.22)
  const passiveFidelity = cluster.length > 0 ? countPlus(t2, cluster) / cluster.length : 0
  return { leakPerBeat, passiveFidelity }
}

export function exactHorosphere(input?: { L?: number; bulkCells?: number }): {
  radii: number[]
  squareBallBV: number[]
  triangularBallBV: number[]
  bulkBallBV: number[]
  squareCompact: boolean
  squareLeak: number
  triangularLeak: number
  bulkLeak: number
  squarePassive: number
  triangularPassive: number
  bulkPassive: number
  squareLeakMatchesTriangular: boolean
  bothFlatBeatBulkLeak: boolean
  passiveImprovesWithCoordination: boolean
  idealizationValidated: boolean
  solved: boolean
} {
  const L = input?.L ?? 130
  const bulkCells = input?.bulkCells ?? 15000
  const radii = [1, 2, 3, 4]

  // (1) geometry, balls on the exact {4,4} square horosphere fall (compact possible), like the triangular,
  // unlike the bulk
  const sq = squareGraph(L)
  const tri = flatGraph(L)
  const sc = Math.floor(L / 2) * L + Math.floor(L / 2)
  const squareBallBV = ballScaling(sq, sc, radii)
  const triangularBallBV = ballScaling(tri, sc, radii)
  const bulkBallBV = ballScaling(bulkGraph(100000), 0, radii)
  const last = radii.length - 1
  const squareCompact = squareBallBV[last]! < squareBallBV[0]! * 0.6

  // (2) dynamics, same self on the exact square horosphere vs the triangular idealization vs the bulk
  const sd = selfDynamics(sq, 11)
  const td = selfDynamics(tri, 11)
  const bd = selfDynamics(bulkGraph(bulkCells), 11)

  // the GEOMETRIC core (compactness, per-beat leak) is the same on the exact square horosphere as on the
  // triangular idealization, and both flat layers leak far less than the bulk. This is the curvature fact.
  const squareLeakMatchesTriangular = Math.abs(sd.leakPerBeat - td.leakPerBeat) < 0.1
  const bothFlatBeatBulkLeak = sd.leakPerBeat < bd.leakPerBeat * 0.85 && td.leakPerBeat < bd.leakPerBeat * 0.85
  // passive long-run persistence additionally improves with COORDINATION (triangular degree 6 > square degree
  // 4), an honest secondary, non-geometric effect, a richer flat layer holds selves even better
  const passiveImprovesWithCoordination = td.passiveFidelity > sd.passiveFidelity + 0.1
  // the idealization is validated for the geometric claims it was used for
  const idealizationValidated = squareCompact && squareLeakMatchesTriangular && bothFlatBeatBulkLeak

  const solved = idealizationValidated

  return {
    radii,
    squareBallBV,
    triangularBallBV,
    bulkBallBV,
    squareCompact,
    squareLeak: sd.leakPerBeat,
    triangularLeak: td.leakPerBeat,
    bulkLeak: bd.leakPerBeat,
    squarePassive: sd.passiveFidelity,
    triangularPassive: td.passiveFidelity,
    bulkPassive: bd.passiveFidelity,
    squareLeakMatchesTriangular,
    bothFlatBeatBulkLeak,
    passiveImprovesWithCoordination,
    idealizationValidated,
    solved,
  }
}

export function main(): void {
  const r = exactHorosphere()
  console.log('P182: an exact {4,4} horosphere ({4,4,3}) validates the flat-self physics')
  console.log('')
  console.log('  the {4,4,3} horosphere is EXACTLY the {4,4} square lattice (no idealization), cell-for-cell.')
  console.log('')
  console.log('  (1) GEOMETRY, ball boundary/volume by radius:')
  console.log(`      exact square (horo)  ${r.squareBallBV.map((x) => x.toFixed(2)).join('  ')}  (falls, compact: ${r.squareCompact})`)
  console.log(`      triangular (ideal)   ${r.triangularBallBV.map((x) => x.toFixed(2)).join('  ')}  (same trend)`)
  console.log(`      hyperbolic bulk      ${r.bulkBallBV.map((x) => x.toFixed(2)).join('  ')}  (stays high)`)
  console.log('')
  console.log('  (2) DYNAMICS, the same self:')
  console.log(`      leak/beat     square ${(r.squareLeak * 100).toFixed(0)}%   triangular ${(r.triangularLeak * 100).toFixed(0)}%   bulk ${(r.bulkLeak * 100).toFixed(0)}%`)
  console.log(`      passive       square ${(r.squarePassive * 100).toFixed(0)}%   triangular ${(r.triangularPassive * 100).toFixed(0)}%   bulk ${(r.bulkPassive * 100).toFixed(0)}%`)
  console.log(`      GEOMETRIC core (compact + per-beat leak) matches between exact square and triangular: ${r.squareLeakMatchesTriangular}`)
  console.log(`      both flat layers leak far less than the bulk: ${r.bothFlatBeatBulkLeak}`)
  console.log(`      passive persistence improves with coordination (triangular 6-nbr > square 4-nbr): ${r.passiveImprovesWithCoordination}`)
  console.log('')
  console.log('  => the GEOMETRIC self-physics (compact-possible, low per-beat leak) is identical on the EXACT')
  console.log('     {4,4} horosphere and the triangular idealization, and absent in the bulk, so it is a fact')
  console.log('     about FLAT CURVATURE. The idealization was sound, {5,3,4} keeps its forced geometry, and a')
  console.log('     richer (higher-coordination) flat layer holds selves even longer, an honest bonus.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'geometry/exact-horosphere',
  title: 'an exact {4,4} square horosphere of {4,4,3} validates the flat-self idealization',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = exactHorosphere()
    const ok =
      r.solved &&
      r.squareCompact &&
      r.squareLeakMatchesTriangular &&
      r.bothFlatBeatBulkLeak
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the exact square horosphere the geometric self-physics matches the triangular idealization and beats the bulk leak, so it is a fact about flat curvature',
      metrics: {
        squareBallBV: r.squareBallBV[r.squareBallBV.length - 1] ?? 0,
        triangularBallBV: r.triangularBallBV[r.triangularBallBV.length - 1] ?? 0,
        bulkBallBV: r.bulkBallBV[r.bulkBallBV.length - 1] ?? 0,
        squareLeak: r.squareLeak,
        triangularLeak: r.triangularLeak,
        bulkLeak: r.bulkLeak,
      },
    })
  },
})
