// SPN builder: E-SPN-0211's verdict from the saved parts (test/record/E-SPN-0211/spn-mass-<name>.json), through its own combineMass
import { readFileSync } from 'node:fs'
import { combineMass, MEMBERS, type MassPart } from '@/test/experiment/spin/register-pair-mass-scan'

const T = `${import.meta.dirname}/..`
const parts: MassPart[] = MEMBERS.map(x => JSON.parse(readFileSync(`${T}/spn-mass-${x.name}.json`, 'utf8')))
const v = combineMass(parts)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
