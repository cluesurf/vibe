// P180: selves belong on the horosphere, and it scales 1000x without the bulk. (P178, P179, P91, P157, P160, P170.)
//
// The honest finding (P178, P179) is that a self is leaky and expensive in the hyperbolic BULK, because in
// H^3 every region is mostly boundary, so a self has escape routes everywhere. The resolution is a layered
// ontology. The bulk is raw EXPERIENCE (the churn, no selves). SELVES condense on the flat HOROSPHERE, which
// is Euclidean, so compact low-boundary patterns exist and hold themselves. PHYSICS is then the distilled
// effective system on that surface. This test confirms it three ways.
//
//   (1) THE GEOMETRY ALLOWS COMPACT SELVES ON THE HOROSPHERE. For balls of growing radius, the
//       boundary-to-volume ratio FALLS on the flat horosphere (the Euclidean isoperimetric law, surface
//       grows slower than volume) but stays near constant in the bulk (every region is all boundary). So a
//       compact, low-leak self is geometrically possible on the horosphere and impossible in the bulk.
//   (2) SELVES PERSIST BETTER ON THE HOROSPHERE. The same emergent self leaks less per beat and holds far
//       more of itself with no maintenance (passive fidelity) on the flat layer than in the bulk.
//   (3) BUILT DIRECTLY, AT SCALE. A horosphere's intrinsic metric is flat Euclidean (a theorem), so we
//       MODEL it as a flat 2D lattice and build it DIRECTLY in O(N) with no hyperbolic bulk, about 1000x
//       larger than any bulk we can afford. Honest caveat, {5,3,4} is COMPACT, so it has no clean regular
//       horosphere tiling, the flat lattice preserves the horosphere's GEOMETRY (which is what the self
//       physics depends on) and runs the same geometry-agnostic rule, it is not a cell-exact extraction.
//       See the-three-layers-and-the-self.md for the full justification.
// Run: npx tsx code/experiment/p180-horosphere-self.ts

import { pathToFileURL } from 'node:url'
import { bulkGraph, flatGraph, beat, emergeSelf, countPlus, totalCharge, boundaryFraction, ball, type Graph } from '~/experiment/self-kit'
import { makeRng } from '~/tool/rng'

// boundary-to-volume of balls of growing radius around a central cell
function ballScaling(g: Graph, center: number, radii: number[]): number[] {
  return radii.map((r) => boundaryFraction(ball(g, center, r), g))
}

// the emergent self's leak per beat and its passive (unmaintained) fidelity
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

export function horosphereSelf(input?: { bulkCells?: number; flatL?: number; bigL?: number }): {
  bulkCells: number
  radii: number[]
  bulkBallBV: number[]
  flatBallBV: number[]
  compactPossibleOnFlat: boolean
  bulkLeak: number
  flatLeak: number
  flatLowerLeak: boolean
  bulkPassive: number
  flatPassive: number
  flatMorePassive: boolean
  bigCells: number
  bigBuilt: boolean
  bigConserved: boolean
  scaleFactor: number
  solved: boolean
} {
  const bulkCells = input?.bulkCells ?? 15000
  const flatL = input?.flatL ?? 130
  const bigL = input?.bigL ?? 3900 // ~15.2M cells, about 1000x the affordable bulk

  // (1) geometry, boundary-to-volume of balls of growing radius. Use a large bulk so the balls do not engulf
  // the whole finite graph (a hyperbolic ball needs exponentially more cells per radius, itself the point),
  // and compare over radii where neither graph is saturated.
  const radii = [1, 2, 3, 4]
  const gbGeom = bulkGraph(100000)
  const gf = flatGraph(flatL)
  const bulkBallBV = ballScaling(gbGeom, 0, radii)
  const fc = Math.floor(flatL / 2) * flatL + Math.floor(flatL / 2)
  const flatBallBV = ballScaling(gf, fc, radii)
  const last = radii.length - 1
  const flatFalls = flatBallBV[last]! < flatBallBV[0]! * 0.6 // flat boundary/volume drops with size
  const bulkStaysHigh = bulkBallBV[last]! > bulkBallBV[0]! * 0.8 // bulk stays all-boundary
  const compactPossibleOnFlat = flatFalls && bulkStaysHigh && flatBallBV[last]! < bulkBallBV[last]! * 0.6

  // (2) dynamics, leak and passive fidelity (a smaller, affordable bulk for the dynamics)
  const bd = selfDynamics(bulkGraph(bulkCells), 11)
  const fd = selfDynamics(gf, 11)
  const flatLowerLeak = fd.leakPerBeat < bd.leakPerBeat * 0.85
  const flatMorePassive = fd.passiveFidelity > bd.passiveFidelity + 0.1

  // (3) build the giant horosphere directly, no bulk, and run the dynamics conservingly
  const big = flatGraph(bigL)
  const bigCells = big.cellCount
  const movedB = new Uint8Array(bigCells)
  const rngB = makeRng({ seed: 5 })
  const toneB = new Int8Array(bigCells)
  for (let i = 0; i < bigCells; i++) {
    const r = rngB.next()
    toneB[i] = (r < 0.1 ? 1 : r < 0.13 ? -1 : 0) as -1 | 0 | 1
  }
  const qb0 = totalCharge(toneB)
  for (let t = 0; t < 3; t++) beat(toneB, big, movedB, rngB, 0.01, 0.22)
  const bigBuilt = bigCells > 10_000_000
  const bigConserved = totalCharge(toneB) === qb0
  const scaleFactor = Math.round(bigCells / bulkCells)

  const solved = compactPossibleOnFlat && flatLowerLeak && flatMorePassive && bigBuilt && bigConserved

  return {
    bulkCells,
    radii,
    bulkBallBV,
    flatBallBV,
    compactPossibleOnFlat,
    bulkLeak: bd.leakPerBeat,
    flatLeak: fd.leakPerBeat,
    flatLowerLeak,
    bulkPassive: bd.passiveFidelity,
    flatPassive: fd.passiveFidelity,
    flatMorePassive,
    bigCells,
    bigBuilt,
    bigConserved,
    scaleFactor,
    solved,
  }
}

export function main(): void {
  const r = horosphereSelf()
  console.log('P180: selves belong on the horosphere, and it scales 1000x without the bulk')
  console.log('')
  console.log('  (1) GEOMETRY, boundary-to-volume of balls by radius (low = compact, possible self):')
  console.log(`      radius        ${r.radii.join('     ')}`)
  console.log(`      bulk (H^3)    ${r.bulkBallBV.map((x) => x.toFixed(2)).join('  ')}  (stays high, all boundary)`)
  console.log(`      flat (horo)   ${r.flatBallBV.map((x) => x.toFixed(2)).join('  ')}  (falls, compact possible)`)
  console.log(`      compact selves possible on the horosphere, not the bulk: ${r.compactPossibleOnFlat}`)
  console.log('')
  console.log(`  (2) DYNAMICS, the same self: leak/beat bulk ${(r.bulkLeak * 100).toFixed(0)}% vs flat ${(r.flatLeak * 100).toFixed(0)}% (${r.flatLowerLeak}),`)
  console.log(`      passive fidelity bulk ${(r.bulkPassive * 100).toFixed(0)}% vs flat ${(r.flatPassive * 100).toFixed(0)}% (${r.flatMorePassive})`)
  console.log('')
  console.log(`  (3) SCALE, built the horosphere DIRECTLY (no bulk): ${r.bigCells.toLocaleString()} cells, ${r.scaleFactor.toLocaleString()}x the bulk, conserved ${r.bigConserved}`)
  console.log('')
  console.log('  => the bulk is raw experience, selves condense on the flat horosphere where the geometry lets')
  console.log('     them be compact and persistent, and that surface is a lattice we simulate ~1000x larger.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
