// MTR builder combine for E-MTR-0031: the verdict from the saved K correlations and E-SPN-0212's K = 0 correlation
// usage: mtr-light-combine.ts [K,K,...]   (no list: the witness alone)
import { readFileSync } from 'node:fs'
import { combineLight, recordedZeroCorrelation } from '@/test/experiment/matter/light-pair-dispersion'

const RECORD = `${import.meta.dirname}/..`
const arg = process.argv[2]
const list = arg ? arg.split(',').map(Number) : []
const reads = list.map(K => JSON.parse(readFileSync(`${RECORD}/mtr-light-K${K}.json`, 'utf8')))
const v = combineLight({ zero: recordedZeroCorrelation()!, reads })

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
