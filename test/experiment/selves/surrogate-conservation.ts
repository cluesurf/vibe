// MS5 of the multiscale-self program, the conservation-preserving surrogate. The base beat conserves the
// total charge EXACTLY (integer, zero drift over a long run), so the charge is a hard invariant any faithful
// surrogate must preserve. But a self's LOCAL cluster plus-count fluctuates with the vacuum churn, so a
// surrogate that re-estimates the charge from the local cluster drifts. And a deliberately leaking rule
// destroys the charge outright. The lesson, a conservation-preserving surrogate must CARRY the exactly
// conserved charge as a hard label, not re-read it locally, and conservation is a real property of the rule
// that a broken rule loses. Depth L2, exact integer conservation with a leaking control and the local
// re-estimation failure. Spec: note theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS5).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  flatGraph,
  emergeSelf,
  beat,
  totalCharge,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/coarse/self-trajectory'

const L = 64
const beats = 2000

// the local re-estimate must fluctuate by at least this fraction (so it is clearly unreliable). The measured
// value is near 0.3, so the bound sits well clear of the knife edge.
const LOCAL_DRIFT_MIN = 0.1

function localPlus(tone: Int8Array, cells: number[]): number {
  let n = 0
  for (const c of cells) if (tone[c] === 1) n++
  return n
}

export default experiment({
  id: 'selves/surrogate-conservation',
  title:
    'the base conserves total charge exactly, the local re-estimate drifts, a leaking rule breaks it',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const graph = flatGraph(L)
    const rng = makeRng(56789)
    const moved = new Uint8Array(graph.cellCount)
    const { tone, cluster } = emergeSelf(graph, rng, moved, {
      beats: 60,
      density: 0.1,
    })
    const globalStart = totalCharge(tone)
    const localStart = localPlus(tone, cluster)

    // the conserving run, track the exact global charge (carried as a label) and the local cluster plus-count
    // (re-estimated each beat).
    const conserving = tone.slice()
    let globalDrift = 0
    let localDriftRelative = 0
    for (let i = 0; i < beats; i++) {
      beat(conserving, graph, moved, rng, 0.01, 0.22)
      globalDrift = Math.max(
        globalDrift,
        Math.abs(totalCharge(conserving) - globalStart),
      )
      localDriftRelative = Math.max(
        localDriftRelative,
        Math.abs(localPlus(conserving, cluster) - localStart) /
          Math.max(localStart, 1),
      )
    }

    // the leaking control, the same run with a deterministic charge leak each beat (zero the first plus cell),
    // which breaks conservation.
    const leaking = tone.slice()
    const leakRng = makeRng(56789)
    let leakDrift = 0
    for (let i = 0; i < beats; i++) {
      beat(leaking, graph, moved, leakRng, 0.01, 0.22)
      for (let c = 0; c < leaking.length; c++) {
        if (leaking[c] === 1) {
          leaking[c] = 0
          break
        }
      }
      leakDrift = Math.max(
        leakDrift,
        Math.abs(totalCharge(leaking) - globalStart),
      )
    }

    // the carried charge is exactly conserved (integer equality, not a tolerance), the local re-estimate is
    // clearly unreliable, and the leaking control destroys the charge.
    const ok =
      globalDrift === 0 &&
      localDriftRelative > LOCAL_DRIFT_MIN &&
      leakDrift > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the base beat conserves the total charge exactly (zero drift) so it is a hard label a surrogate can carry, while a self local cluster plus-count fluctuates (re-estimation drifts) and a leaking rule destroys the charge, so a conservation-preserving surrogate must carry the conserved charge rather than re-estimate it',
      metrics: {
        globalDrift,
        localDriftRelative,
        leakDrift,
        globalStart,
        localStart,
      },
      control: { leakDrift, localDriftRelative },
      notes:
        'charge conservation is asserted as exact integer equality, the leaking control shows conservation is a real rule property, the local-drift shows re-estimation is unreliable so the label must be carried',
    })
  },
})
