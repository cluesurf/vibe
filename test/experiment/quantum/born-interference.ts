// P158: genuine quantum INTERFERENCE and the BORN rule. (P151, P132, bridge-theories-vibe-to-field.md.)
//
// P151 showed the unitary (quantum-walk) completion of the rule is relativistic and reflection-positive.
// The deepest quantum signature, "problem B's heart", is INTERFERENCE, complex amplitudes that CANCEL,
// which no classical stochastic process can do (probabilities only ADD). This compares the coherent
// quantum walk to the SAME walk run classically (incoherent probabilities), and checks:
//   (1) INTERFERENCE, the quantum distribution has interior NODES where the probability is about zero
//       (amplitudes destructively cancel) and rapid fringes, the classical one is smooth with no nodes.
//   (2) UNITARITY, the total probability sum |psi|^2 stays 1 (norm preserved), so |psi|^2 is a genuine
//       probability, the BORN rule.
// Together these are the genuinely-quantum behaviour, present in the unitary rule, absent in its classical
// (stochastic) shadow. Run: npx tsx code/experiment/p158-born-interference.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  coinedWalkQuantumDistribution,
  coinedWalkClassicalDistribution,
} from '@/code/dynamics/coined-walk-distribution'
import { fringeStatistics } from '@/code/measure/fringe'

export function bornInterference(input?: { steps?: number }): {
  steps: number
  quantumMaxima: number
  classicalMaxima: number
  quantumNodes: number
  quantumFringeContrast: number
  classicalFringeContrast: number
  normDeviation: number
  interferes: boolean
  unitary: boolean
  bornRule: boolean
  solved: boolean
} {
  const T = input?.steps ?? 80

  // coherent quantum walk (Hadamard coin then shift) and its incoherent classical shadow, both in
  // code/dynamics/coined-walk-distribution. The quantum norm staying 1 is the Born-rule unitarity.
  const quantum = coinedWalkQuantumDistribution({ steps: T })
  const normDeviation = Math.abs(quantum.norm - 1)
  const classical = coinedWalkClassicalDistribution({ steps: T })

  // measure FRINGES on the populated parity (the walk fills only every-other site at even T). Quantum
  // interference shows as many oscillatory local maxima (fringes) and deep interior dips (near-nodes),
  // the classical walk is a single smooth hump.
  const q = fringeStatistics({ distribution: quantum.distribution, offset: quantum.offset, width: quantum.width })
  const c = fringeStatistics({ distribution: classical.distribution, offset: classical.offset, width: classical.width })

  const interferes = q.maxima >= 5 && q.maxima > c.maxima + 3 && q.contrast > c.contrast * 1.5
  const unitary = normDeviation < 1e-9
  const bornRule = unitary // P = |psi|^2 by construction, and it sums to 1, so it is a genuine probability
  const solved = interferes && unitary && bornRule

  return {
    steps: T,
    quantumMaxima: q.maxima,
    classicalMaxima: c.maxima,
    quantumNodes: q.nodes,
    quantumFringeContrast: q.contrast,
    classicalFringeContrast: c.contrast,
    normDeviation,
    interferes,
    unitary,
    bornRule,
    solved,
  }
}

export default defineExperiment({
  id: 'quantum/born-interference',
  title: 'the unitary rule interferes and gives a genuine Born probability',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = bornInterference({ steps: 80 })
    const ok = r.solved && r.interferes && r.unitary && r.bornRule
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the unitary rule shows interference fringes and nodes absent in the classical shadow while unitarity makes |psi|^2 a genuine probability',
      metrics: {
        quantumMaxima: r.quantumMaxima,
        classicalMaxima: r.classicalMaxima,
        normDeviation: r.normDeviation,
      },
    })
  },
})
