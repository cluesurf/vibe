// E-MTR-0034's verdict from the saved reads (no engine run); the gates are test/record/E-MTR-0034/gates.json
// usage: mtr034-combine.ts
import { runSizeFade } from '@/test/experiment/matter/light-pair-size-fade'

const v = runSizeFade()

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
process.exit(0)
