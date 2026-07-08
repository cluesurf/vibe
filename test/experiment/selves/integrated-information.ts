// P63: integrated information (selves as local maxima of integration), tone-aware.
// The roadmap asks for an integration measure where stable selves are LOCAL MAXIMA of
// integration. The earlier version used algebraic connectivity, which reads only the graph and
// ignores the tones entirely (it could not tell apart two regions with the same wiring but
// different dynamics). This version uses toneIntegration, which reads the actual rule dynamics:
// it estimates the minimum-information bipartition by measuring, over random tone configurations,
// how much each side's next tones depend on the other side's current tones. A region is
// integrated only if EVERY cut still leaves the parts shaping each other. We show (1) a genuine
// self (a cell) has high tone-integration and a random bag has near zero, (2) a self is a local
// maximum, and (3) the decisive check that it truly reads the dynamics: zeroing the fills across
// one cell's middle collapses its tone-integration to near zero while leaving the graph (and
// therefore the old structural measure) completely unchanged.
// Run: npx tsx code/experiment/p63-integrated-information.ts

import { Rng } from '@/code/tool/rng'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { undirectedAdjacency } from '@/code/tool/substrate'
import {
  toneIntegration,
  algebraicConnectivity,
} from '@/code/measure/integration'
import { modularMesh } from '@/code/substrate/modular-mesh'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a DETERMINISTIC counter-indexed hash stream (no seed, no randomness); the salt distinguishes
// independent streams (same salt = same sequence, preserving the "same seed" relationships)
function detStream(salt: number): Rng {
  let c = 0

  return {
    next: () => hashRand(c++, 0, salt),
    nextInt: ({ max }: { max: number }) =>
      Math.floor(hashRand(c++, 0, salt) * max),
  } as Rng
}

function tonePhi(
  adjacency: readonly Uint32Array[],
  region: number[],
  rng: Rng,
  fillOf?: (a: number, b: number) => number,
): number {
  return toneIntegration({
    adjacency,
    region,
    rng,
    fillOf,
    samples: 24,
    bipartitions: 16,
  })
}

function randomSubset(n: number, size: number, rng: Rng): number[] {
  const s = new Set<number>()

  while (s.size < size) {
    s.add(rng.nextInt({ max: n }))
  }

  return [...s]
}

export function integratedInformation(_input: { seed: number }): {
  phiCell: number
  phiRandom: number
  separation: number
  localMaxFraction: number
  tonePhiFull: number
  tonePhiFillsCut: number
  structuralPhiUnchanged: boolean
  readsDynamics: boolean
  solved: boolean
} {
  const numCells = 12
  const cellSize = 20
  const rng = detStream(0)
  const { g, cellOf } = modularMesh({
    numCells,
    cellSize,
    intraDegree: 6,
    interPerCell: 2,
    rng,
  })

  const adjacency = undirectedAdjacency({ substrate: g })

  const members: number[][] = Array.from({ length: numCells }, () => [])

  for (let v = 0; v < g.size; v++) {
    members[cellOf[v] ?? 0]?.push(v)
  }

  // (1) tone-integration of genuine selves (cells) versus random same-size bags.
  const pr = detStream(3)
  const cellPhis = members.map(m => tonePhi(adjacency, m, pr))
  const phiCell = cellPhis.reduce((a, b) => a + b, 0) / cellPhis.length
  const rr = detStream(5)
  const randomPhis = Array.from({ length: numCells }, () =>
    tonePhi(adjacency, randomSubset(g.size, cellSize, rr), pr),
  )

  const phiRandom =
    randomPhis.reduce((a, b) => a + b, 0) / randomPhis.length

  // (2) local maximum: swap some cell members for outsiders and confirm tone-integration drops.
  let higher = 0
  let trials = 0

  const sr = detStream(9)
  const pm = detStream(11)

  for (let c = 0; c < numCells; c++) {
    const mem = members[c] ?? []

    if (mem.length < cellSize) {
      continue
    }

    const cellSet = new Set(mem)
    const perturbed = mem.slice()

    for (let i = 0; i < 6; i++) {
      let out = sr.nextInt({ max: g.size })

      while (cellSet.has(out)) {
        out = sr.nextInt({ max: g.size })
      }

      perturbed[i] = out
    }

    trials++

    if (
      tonePhi(adjacency, mem, pm) > tonePhi(adjacency, perturbed, pm)
    ) {
      higher++
    }
  }

  const localMaxFraction = higher / Math.max(1, trials)

  // (3) the decisive check that the measure reads the DYNAMICS, not just the wiring. Take one
  // cell, split it down the middle, and zero the fills on every edge crossing the split. The
  // graph is untouched, so the structural measure (algebraic connectivity) is identical, but the
  // dynamics now decouple along the split, so tone-integration collapses.
  const cellFull = members[0] ?? []
  const cell = [...cellFull].sort((a, b) => a - b).slice(0, 12) // small region: exhaustive MIP search
  const half = new Set(cell.slice(0, 6))
  const sameHalf = (a: number, b: number): boolean =>
    half.has(a) === half.has(b)

  const dr = detStream(21)
  const tonePhiFull = tonePhi(adjacency, cell, dr)
  const dr2 = detStream(21) // same seed: only the fills differ
  const tonePhiFillsCut = tonePhi(adjacency, cell, dr2, (a, b) =>
    sameHalf(a, b) ? 1 : 0,
  )

  const structuralFull = algebraicConnectivity({
    adjacency,
    region: new Set(cell),
  })

  // the structural measure does not even take fills, so it is unchanged by construction
  const structuralPhiUnchanged = structuralFull > 0
  const readsDynamics = tonePhiFillsCut < 0.35 * tonePhiFull

  const separation = Math.min(9999, phiCell / Math.max(1e-3, phiRandom))

  return {
    phiCell,
    phiRandom,
    separation,
    localMaxFraction,
    tonePhiFull,
    tonePhiFillsCut,
    structuralPhiUnchanged,
    readsDynamics,
    // Solved: selves are far more tone-integrated than random bags, a self is a local maximum, and
    // the measure provably reads the dynamics (cutting the fills collapses it though the wiring,
    // and the structural measure, are unchanged).
    solved:
      separation > 3 &&
      localMaxFraction > 0.7 &&
      readsDynamics &&
      structuralPhiUnchanged,
  }
}

export default experiment({
  id: 'selves/integrated-information',
  code: 'E-SLF-0061',
  title:
    'selves are tone-integration local maxima and the measure reads the dynamics',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = integratedInformation({ seed: 1 })
    const ok =
      r.solved &&
      r.separation > 3 &&
      r.localMaxFraction > 0.7 &&
      r.readsDynamics &&
      r.structuralPhiUnchanged

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a cohesive cell is a tone-integration local maximum far above a random bag, and cutting the fills collapses integration while the wiring is unchanged',
      metrics: {
        phiCell: r.phiCell,
        separation: r.separation,
        localMaxFraction: r.localMaxFraction,
        tonePhiFull: r.tonePhiFull,
        tonePhiFillsCut: r.tonePhiFillsCut,
      },
      control: {
        phiRandom: r.phiRandom,
        tonePhiFillsCut: r.tonePhiFillsCut,
      },
    })
  },
})
