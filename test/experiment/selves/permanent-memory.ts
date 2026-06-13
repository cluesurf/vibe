// P107: permanent memory by active maintenance, the conservation-versus-healing resolution.
// (holographic-memory.md, the-perception-rule.md, willpower in P99.)
//
// Under strict conservation a defect cannot be passively healed (cohesion repels from holes, and share
// annihilates a defect along with a good cell, leaving holes that conservation cannot refill), so any
// passive memory erodes. The resolution is ACTIVE MAINTENANCE: a self periodically re-stamps its
// codeword by CONSERVING SWAPS (pair a cell that drifted the wrong way with one that drifted the other
// way, and swap, fixing both while preserving Q). This is exactly a self spending work to hold itself
// together, the will (P99), and the cost is the number of swaps. Maintained, the memory is permanent.
//
// Predictions checked: an UNMAINTAINED spatial codeword decays toward peace (fidelity falls), while a
// MAINTAINED one stays high indefinitely, at a measured maintenance cost, and charge Q is conserved
// throughout (the maintenance is conserving). Run: npx tsx code/experiment/p107-permanent-memory.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { targetFidelity } from '@/code/measure/agreement'
import { conservingMaintainToTarget } from '@/code/operator/maintain-to-target'
import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const beat = (tone: Int8Array, eu: Int32Array, ev: Int32Array, offsets: Int32Array, adj: Int32Array, moved: Uint8Array, rng: Rng): void =>
  cohesiveEdgeSweep({ tone, eu, ev, offsets, adj, moved, rng, annihilate: true, arrow: 0 })

export function permanentMemory(input?: { n?: number }): {
  n: number
  beats: number
  unmaintainedFidelity: number
  maintainedFidelity: number
  maintenanceSwaps: number
  conserved: boolean
  permanentWithMaintenance: boolean
  decaysWithout: boolean
  solved: boolean
} {
  const n = input?.n ?? 30000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  // a spatial codeword that genuinely erodes: a balanced random +/- pattern (Q = 0), full of opposite
  // adjacencies that the share move annihilates, so without maintenance it collapses toward peace
  const target = new Int8Array(N)
  const rngT = makeRng({ seed: 2 })
  for (let i = 0; i < N; i++) target[i] = rngT.next() < 0.5 ? 1 : -1
  // balance to Q = 0
  let q = sumTone(target)
  for (let i = 0; i < N && q !== 0; i++) {
    if (q > 0 && target[i] === 1) {
      target[i] = -1
      q -= 2
    } else if (q < 0 && target[i] === -1) {
      target[i] = 1
      q += 2
    }
  }

  const beats = 150
  const moved = new Uint8Array(N)

  // UNMAINTAINED
  const a = target.slice()
  const qa = sumTone(a)
  const rngA = makeRng({ seed: 4 })
  for (let b = 0; b < beats; b++) beat(a, eu, ev, g.offsets, g.adj, moved, rngA)
  const unmaintainedFidelity = targetFidelity(a, target)
  const conservedA = sumTone(a) === qa

  // MAINTAINED: re-stamp every 10 beats
  const bm = target.slice()
  const qb = sumTone(bm)
  const rngB = makeRng({ seed: 4 })
  let maintenanceSwaps = 0
  for (let b = 0; b < beats; b++) {
    beat(bm, eu, ev, g.offsets, g.adj, moved, rngB)
    if ((b + 1) % 10 === 0) maintenanceSwaps += conservingMaintainToTarget(bm, target, N)
  }
  const maintainedFidelity = targetFidelity(bm, target)
  const conservedB = sumTone(bm) === qb

  const conserved = conservedA && conservedB
  const permanentWithMaintenance = maintainedFidelity > 0.85
  const decaysWithout = unmaintainedFidelity < 0.5
  const solved = conserved && permanentWithMaintenance && decaysWithout

  return {
    n: N,
    beats,
    unmaintainedFidelity,
    maintainedFidelity,
    maintenanceSwaps,
    conserved,
    permanentWithMaintenance,
    decaysWithout,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/permanent-memory',
  title: 'maintained codeword stays at full fidelity where unmaintained erodes, conserving, at a cost',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = permanentMemory({ n: 30000 })
    const ok =
      r.solved && r.conserved && r.permanentWithMaintenance && r.decaysWithout
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an actively maintained spatial codeword stays at full fidelity indefinitely while an unmaintained one erodes, conserving charge, at a measured maintenance cost',
      metrics: {
        maintainedFidelity: r.maintainedFidelity,
        maintenanceSwaps: r.maintenanceSwaps,
      },
      control: { unmaintainedFidelity: r.unmaintainedFidelity },
    })
  },
})
