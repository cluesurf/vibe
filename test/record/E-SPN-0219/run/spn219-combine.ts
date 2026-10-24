// E-SPN-0219's verdict from the saved solves (no engine run); the gates are the experiment file's frozen header
// usage: spn219-combine.ts [1|2]   (the stage; 1 by default)
import { runClockFine } from '@/test/experiment/spin/register-pair-clock-fine'

const v = runClockFine(process.argv[2] === '2' ? 2 : 1)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
process.exit(0)
