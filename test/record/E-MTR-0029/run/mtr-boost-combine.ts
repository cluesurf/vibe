// MTR builder combine for E-MTR-0029: the verdict from the saved K reads and E-SPN-0206's recorded K = 0 read
// usage: mtr-boost-combine.ts <K,K,...>
import { readFileSync } from 'node:fs'
import { combineBoost, recordedZero } from '@/test/experiment/matter/composite-dispersion'

const RECORD = `${import.meta.dirname}/..`
const list = (process.argv[2] ?? '').split(',').map(Number)
const { base } = recordedZero(`${RECORD}/../E-SPN-0206/spn-core-soften-a8.json`)
const reads = list.map(K => JSON.parse(readFileSync(`${RECORD}/mtr-boost-K${K}.json`, 'utf8')))
const v = combineBoost({ base, reads })

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
