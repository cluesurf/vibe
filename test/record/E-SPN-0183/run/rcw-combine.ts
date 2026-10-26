// rcw combine: the verdict from the parts' JSON reads (test/record/E-SPN-0183/rcw-part-<name>.json and rcw-part-witness.json), by the
// same combine() that run() calls
import { readFileSync } from 'node:fs'
import { setup } from '@/code/measure/register-track'
import { combine, GATE_PLAN, type Parts, type PointRead } from '@/test/experiment/spin/register-coulomb-weak'

const RECORD = `${import.meta.dirname}/..`

const reads = GATE_PLAN.points.map(p => JSON.parse(readFileSync(`${RECORD}/rcw-part-${p.name}.json`, 'utf8')) as PointRead)

for (const r of reads) {
  // JSON drops NaN as null: restore the reads that are NaN by design
  if (r.recordedR === null) r.recordedR = NaN
  if (r.isotropy === null) r.isotropy = NaN
}

const parts = JSON.parse(readFileSync(`${RECORD}/rcw-part-witness.json`, 'utf8')) as Parts

console.log(JSON.stringify(combine(reads, parts, GATE_PLAN, setup().tanOver), null, 1))
