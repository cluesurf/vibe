// E-MTR-0033's verdict from the saved correlations (no engine run)
// usage: mtr-band-combine.ts
import { runDecomposition } from '@/test/experiment/matter/light-pair-band-decomposition'

const v = runDecomposition()

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
process.exit(0)
