// Robustness pass: every remaining L3 whose main function takes a size is
// called at its default, at half, and at one and a half times, and the verdict boolean is printed at each.
// A verdict that flips with size is a knife edge. Run: pnpm check:perturbation. Sizes are half, default, one and a half.
// Pass experiment ids (or any substring of one) to run only the matching scale-aware experiments and skip phase 1.
import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/all'
import { bulkNonlocality } from '@/test/experiment/holography/bulk-nonlocality'
import { holographicMemory } from '@/test/experiment/holography/holographic-memory'
import { signaling } from '@/test/experiment/holography/signaling'
import { horosphereFlat } from '@/test/experiment/geometry/horosphere-flat'
import { renormalization } from '@/test/experiment/renormalization/renormalization'
import { memoryVsConservation } from '@/test/experiment/selves/memory-vs-conservation'
import { metacognition } from '@/test/experiment/selves/metacognition'
import { recursion } from '@/test/experiment/selves/p121-recursion'
import { permanentMemory } from '@/test/experiment/selves/permanent-memory'
import { persistentSelf } from '@/test/experiment/selves/persistent-self'
import { selfMaintenance } from '@/test/experiment/selves/self-maintenance'
import { selvesInteracting } from '@/test/experiment/selves/selves-interacting'
import { associativeSpreadingActivation } from '@/test/experiment/associative/spreading-activation'
import { emergentMacroRule } from '@/test/experiment/renormalization/emergent-macro-rule'
import { rarityMeasures } from '@/test/experiment/cosmology/rarity-measures'
import { emergentSelfRobust } from '@/test/experiment/selves/emergent-self-robust'
import { growingCode } from '@/test/experiment/holography/growing-code'

type Probe = { id: string; sizes: number[]; run: (size: number) => Record<string, unknown> }

const probes: Probe[] = [
  { id: 'holography/bulk-nonlocality', sizes: [20000, 40000, 60000], run: n => bulkNonlocality({ n }) },
  { id: 'holography/holographic-memory', sizes: [15000, 30000, 45000], run: n => holographicMemory({ n }) },
  { id: 'holography/signaling', sizes: [30000, 60000, 90000], run: n => signaling({ n }) },
  { id: 'geometry/horosphere-flat', sizes: [7000, 14000, 21000], run: n => horosphereFlat({ maxCells: n }) },
  { id: 'renormalization/renormalization-keystone', sizes: [10000, 20000, 30000], run: n => renormalization({ small: n, large: 3 * n }) },
  { id: 'selves/memory-vs-conservation', sizes: [15000, 30000, 45000], run: n => memoryVsConservation({ n }) },
  { id: 'selves/metacognition', sizes: [30000, 60000, 90000], run: n => metacognition({ n }) },
  { id: 'selves/p121-recursion', sizes: [30000, 60000, 90000], run: n => recursion({ n }) },
  { id: 'selves/permanent-memory', sizes: [15000, 30000, 45000], run: n => permanentMemory({ n }) },
  { id: 'selves/persistent-self', sizes: [10000, 20000, 30000], run: n => persistentSelf({ n }) },
  { id: 'selves/self-maintenance', sizes: [15000, 30000, 45000], run: n => selfMaintenance({ n }) },
  { id: 'selves/selves-interacting', sizes: [30000, 60000, 90000], run: n => selvesInteracting({ n }) },
  { id: 'associative/spreading-activation', sizes: [750, 1500, 3000], run: n => associativeSpreadingActivation({ maxCells: n }) },
  { id: 'renormalization/emergent-macro-rule', sizes: [750, 1500, 3000], run: n => emergentMacroRule({ count: n, seed: 1 }) },
  { id: 'cosmology/rarity-measures', sizes: [100, 200, 300], run: n => rarityMeasures({ L: n }) },
  { id: 'selves/emergent-self-robust', sizes: [10000, 20000, 40000], run: n => emergentSelfRobust({ n }) },
  { id: 'holography/growing-code', sizes: [100000, 200000, 300000], run: n => growingCode({ n }) },
]

// Phase 2: every registered experiment that declares `scales: true` is run through its own run() at
// context.scale 0.5, 1 and 1.5. A verdict status that changes with the scale is a knife edge.
const SCALES = [0.5, 1, 1.5]
const only = process.argv.slice(2).filter(a => !a.startsWith('--'))

let scaledExperiments = 0
let scaledFlips = 0

for (const candidate of allExperiments()) {
  if (!candidate.scales || (only.length > 0 && !only.some(o => candidate.id.includes(o)))) {
    continue
  }

  scaledExperiments++

  const statuses: string[] = []

  for (const scale of SCALES) {
    const started = Date.now()

    try {
      const v = candidate.run({ seed: 1, scale })

      statuses.push(`${scale}: ${v.status} ${Date.now() - started}ms`)
    } catch (error) {
      statuses.push(`${scale}: CRASH ${(error as Error).message}`)
    }
  }

  const distinct = new Set(statuses.map(s => s.split(' ')[1]))

  if (distinct.size > 1) {
    scaledFlips++
  }

  console.log(`${candidate.id}  [${candidate.depth}, scales]`)

  for (const s of statuses) {
    console.log(`  ${s}`)
  }
}

console.log(
  `\ncheck:perturbation phase 2  ${scaledExperiments} scale-aware experiments, ${scaledFlips} with a status that changes across scales 0.5, 1, 1.5\n`,
)

for (const probe of only.length > 0 ? [] : probes) {
  const verdicts: string[] = []

  for (const size of probe.sizes) {
    const started = Date.now()

    try {
      const r = probe.run(size)
      const solved = 'solved' in r ? r.solved : '?'
      const booleans = Object.entries(r)
        .filter(([, v]) => typeof v === 'boolean')
        .map(([k, v]) => `${k}=${v ? 1 : 0}`)
        .join(' ')

      verdicts.push(`${size}: solved=${String(solved)} [${booleans}] ${Date.now() - started}ms`)
    } catch (error) {
      verdicts.push(`${size}: CRASH ${(error as Error).message}`)
    }
  }

  console.log(probe.id)

  for (const v of verdicts) {
    console.log(`  ${v}`)
  }
}
