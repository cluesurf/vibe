// SPN builder: E-SPN-0214's verdict from the saved reads (test/record/E-SPN-0214/spn-cleanclock-zero-7.5.json, -motion-7.5.json)
import { readFileSync } from 'node:fs'
import { combineCleanClock } from '@/test/experiment/spin/register-pair-clean-clock'

const T = `${import.meta.dirname}/..`
const zero = JSON.parse(readFileSync(`${T}/spn-cleanclock-zero-7.5.json`, 'utf8'))
const motion = JSON.parse(readFileSync(`${T}/spn-cleanclock-motion-7.5.json`, 'utf8'))
const v = combineCleanClock([zero], zero, motion)

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
