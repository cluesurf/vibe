// SPN builder: E-SPN-0212's verdict from the saved read, through its own combineLightWeak
import { readFileSync } from 'node:fs'
import { combineLightWeak } from '@/test/experiment/spin/register-pair-light-weak'

const j = JSON.parse(
  readFileSync(`${import.meta.dirname}/../spn-light-m0284-a12.json`, 'utf8'),
)
const v = combineLightWeak(j)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
