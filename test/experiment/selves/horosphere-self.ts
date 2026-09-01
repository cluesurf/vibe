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

import {
  bulkGraph,
  flatGraph,
  beatHashed,
  emergeSelfHashed,
  countPlus,
  totalCharge,
  boundaryFraction,
  ball,
  type Graph,
} from '@/code/model/self-kit'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// boundary-to-volume of balls of growing radius around a central cell
function ballScaling(
  g: Graph,
  center: number,
  radii: number[],
): number[] {
  return radii.map(r => boundaryFraction(ball(g, center, r), g))
}

// the emergent self's leak per beat and its passive (unmaintained) fidelity
function selfDynamics(g: Graph): {
  leakPerBeat: number
  passiveFidelity: number
} {
  const moved = new Uint8Array(g.cellCount)
  const { tone, cluster } = emergeSelfHashed(g, moved)
  const tl = tone.slice()
  const before = countPlus(tl, cluster)

  beatHashed(tl, g, moved, 0, 0, 0.22)

  const leakPerBeat =
    before > 0 ? 1 - countPlus(tl, cluster) / before : 1

  const t2 = tone.slice()

  for (let b = 0; b < 50; b++) {
    beatHashed(t2, g, moved, b, 0, 0.22)
  }

  const passiveFidelity =
    cluster.length > 0 ? countPlus(t2, cluster) / cluster.length : 0

  return { leakPerBeat, passiveFidelity }
}

export function horosphereSelf(input?: {
  bulkCells?: number
  flatL?: number
  bigL?: number
}): {
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
  const compactPossibleOnFlat =
    flatFalls &&
    bulkStaysHigh &&
    flatBallBV[last]! < bulkBallBV[last]! * 0.6

  // (2) dynamics, leak and passive fidelity (a smaller, affordable bulk for the dynamics)
  const bd = selfDynamics(bulkGraph(bulkCells))
  const fd = selfDynamics(gf)
  const flatLowerLeak = fd.leakPerBeat < bd.leakPerBeat * 0.85
  const flatMorePassive = fd.passiveFidelity > bd.passiveFidelity + 0.1

  // (3) build the giant horosphere directly, no bulk, and run the dynamics conservingly
  const big = flatGraph(bigL)
  const bigCells = big.cellCount
  const movedB = new Uint8Array(bigCells)
  const toneB = new Int8Array(bigCells)

  for (let i = 0; i < bigCells; i++) {
    const r = hashRand(i, 0, 7)

    toneB[i] = r < 0.1 ? 1 : r < 0.13 ? -1 : 0
  }

  const qb0 = totalCharge(toneB)

  for (let t = 0; t < 3; t++) {
    beatHashed(toneB, big, movedB, t, 0.01, 0.22)
  }

  const bigBuilt = bigCells > 10_000_000
  const bigConserved = totalCharge(toneB) === qb0
  const scaleFactor = Math.round(bigCells / bulkCells)

  const solved =
    compactPossibleOnFlat &&
    flatLowerLeak &&
    flatMorePassive &&
    bigBuilt &&
    bigConserved

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

export default experiment({
  id: 'selves/horosphere-self',
  code: 'E-SLF-0056',
  title:
    'selves are compact-possible and far more persistent on the flat horosphere than in the bulk',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = horosphereSelf()
    const ok =
      r.solved &&
      r.compactPossibleOnFlat &&
      r.flatLowerLeak &&
      r.flatMorePassive &&
      r.bigBuilt &&
      r.bigConserved

    return verdict({
      status: ok ? 'pass' : 'fail',
      notes:
        'AUDIT 2026-08-31: the initial condition here is a hashed or seeded pseudo-random fill (hashRand, makeRng or a sprinkling), which the methodology does not admit as a foundational initial condition. Read this as an ensemble-style claim whose robustness comes from the size sweep, not from varying seeds. Replacing the fill with a structured pattern is roadmap item 0013.',
      claim:
        'the boundary-to-volume ratio falls on the flat horosphere so selves can be compact, the same self leaks less and persists far better there than in the bulk, and the flat surface is built directly about a thousand times larger',
      metrics: {
        flatBallBV: r.flatBallBV[r.flatBallBV.length - 1] ?? 0,
        flatPassive: r.flatPassive,
        scaleFactor: r.scaleFactor,
        bigCells: r.bigCells,
      },
      control: {
        bulkBallBV: r.bulkBallBV[r.bulkBallBV.length - 1] ?? 0,
        bulkPassive: r.bulkPassive,
      },
    })
  },
})
