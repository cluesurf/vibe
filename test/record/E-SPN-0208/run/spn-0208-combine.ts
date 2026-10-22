// SPN builder: E-SPN-0208's verdict from the saved part (test/record/E-SPN-0208/spn-core-soften-a12.json), through its own combineWeak
import { readFileSync } from 'node:fs'
import { combineWeak } from '@/test/experiment/spin/register-contact-weak'
import { setup } from '@/code/measure/register-track'

const j = JSON.parse(
  readFileSync(`${import.meta.dirname}/../spn-core-soften-a12.json`, 'utf8'),
)
const v = combineWeak(setup(), { zero: j.zero, motion: j.motion })

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
