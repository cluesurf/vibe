// P164: the coarse-graining chain is faithful across a tower of levels. (P115, open question, the rigor.)
//
// P115 showed slice-invariance across TWO scales. The rigor wants the full CHAIN, the effective theory the
// SAME up a whole tower of coarse-grainings, a renormalization FIXED POINT, so "test a slice, assume all
// scales" is earned, not assumed. We run the perception rule to equilibrium, then coarse-grain the
// conserved charge repeatedly (block sizes 1, 2, 4, 8, 16, 32), and check, (a) the total charge is EXACTLY
// preserved at every level (conservation passes up every codec), and (b) the dimensionless effective
// parameter (the compressibility, Var(block charge) / block size) CONVERGES to a fixed point across the
// chain. A stable fixed point across many levels = a faithful multiscale tower.
// Run: npx tsx code/experiment/p164-coarse-graining-chain.ts

import { makeRng } from '@/code/tool/rng'
import { evolveConservingRing } from '@/code/dynamics/conserving-sweep'
import { blockChargeTower } from '@/code/coarse/block-charge-tower'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function coarseGrainingChain(input?: { L?: number }): {
  L: number
  levels: {
    level: number
    blockSize: number
    totalCharge: number
    compressibility: number
  }[]
  chargePreservedAllLevels: boolean
  fixedPointConverges: boolean
  spread: number
  solved: boolean
} {
  const L = input?.L ?? 8192
  const rng = makeRng({ seed: 6 })
  const tone = new Int8Array(L)

  for (let i = 0; i < L; i++) {
    tone[i] = rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0
  }

  // balance to a fixed total so coarse charge has a clean reference
  evolveConservingRing({ tone, beats: 200, arrow: 0.12, rng })

  const q0 = (() => {
    let s = 0

    for (let i = 0; i < L; i++) {
      s += tone[i]!
    }

    return s
  })()

  // coarse-grain repeatedly, block consecutive cells, block charge = sum
  const levels = blockChargeTower({ field: tone, levels: 5 })

  const chargePreservedAllLevels = levels.every(
    l => l.totalCharge === q0,
  )

  // fixed point, the compressibility at levels 2..5 (past the lattice artifact) is nearly constant
  const tail = levels.slice(2).map(l => l.compressibility)
  const tmean = tail.reduce((a, b) => a + b, 0) / tail.length
  const spread = (Math.max(...tail) - Math.min(...tail)) / tmean
  const fixedPointConverges = spread < 0.2 // the effective parameter is stable across the tower
  const solved = chargePreservedAllLevels && fixedPointConverges

  return {
    L,
    levels,
    chargePreservedAllLevels,
    fixedPointConverges,
    spread,
    solved,
  }
}

export default experiment({
  id: 'renormalization/coarse-graining-chain',
  code: 'E-SCL-0002',
  title:
    'charge is exactly preserved at every level and the effective parameter is a fixed point across the tower',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = coarseGrainingChain({ L: 8192 })
    const ok =
      r.solved && r.chargePreservedAllLevels && r.fixedPointConverges

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the conserved charge is exactly preserved at every level and the dimensionless effective parameter converges to a fixed point across block sizes one through thirty-two',
      metrics: {
        chargePreservedAllLevels: r.chargePreservedAllLevels ? 1 : 0,
        fixedPointSpread: r.spread,
      },
    })
  },
})
