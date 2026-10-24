// SPN builder: E-SPN-0206's verdict from the saved parts (test/record/E-SPN-0206/spn-core-<form>-a<aB>.json), through its own combineCore
import { readFileSync } from 'node:fs'
import {
  combineCore,
  PLAN,
  type CorePart,
} from '@/test/experiment/spin/register-contact-core'
import { setup } from '@/code/measure/register-track'

const T = `${import.meta.dirname}/..`
const parts: CorePart[] = PLAN.map(p => {
  const j = JSON.parse(readFileSync(`${T}/spn-core-${p.form}-a${p.aB}.json`, 'utf8'))

  return { form: p.form, aB: p.aB, zero: j.zero, motion: j.motion }
})
const v = combineCore(setup(), parts)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
