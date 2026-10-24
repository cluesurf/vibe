// SPN builder: E-SPN-0213's verdict from the saved read, through its own combineClock
import { readFileSync } from 'node:fs'
import { combineClock } from '@/test/experiment/spin/register-pair-clock'

const j = JSON.parse(
  readFileSync(`${import.meta.dirname}/../spn-clock-a7.json`, 'utf8'),
)
const v = combineClock(j)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
