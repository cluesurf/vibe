import { allExperiments } from '@/test/scaffold/suite'
import '@/test/experiment/selves/coarse-spectral-gap'
import '@/test/experiment/selves/coarse-causal-emergence'
import '@/test/experiment/selves/coarse-commuting-square'
import '@/test/experiment/selves/renormalization-tower'

const ids = [
  'selves/coarse-spectral-gap',
  'selves/coarse-causal-emergence',
  'selves/coarse-commuting-square',
  'selves/renormalization-tower',
]
for (const e of allExperiments()) {
  if (!ids.includes(e.id)) continue
  const v = e.run({ seed: 1 })
  console.log(e.id, '=>', v.status, JSON.stringify(v.metrics))
  if (v.control) console.log('   control:', JSON.stringify(v.control))
  if (v.notes) console.log('   notes:', v.notes)
}
