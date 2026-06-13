import { allExperiments, runSuite } from '@/test/scaffold/suite'
import '@/test/experiment/foundations/hamiltonian'
import '@/test/experiment/gauge/gauge-fermion'
import '@/test/experiment/geometry/hauptvermutung'
import '@/test/experiment/quantum/path-integral'
import '@/test/experiment/selves/integration'
import '@/test/experiment/spin/spinor'
import '@/test/experiment/addressing/addressing-3434'
import '@/test/experiment/foundations/law'
import '@/test/experiment/foundations/validation'
import '@/test/experiment/quantum/quantum-walk'
const results = runSuite(allExperiments(), { seed: 1 })
for (const { id, verdict } of results) console.log(`  ${verdict.status.padEnd(7)} ${id}`)
