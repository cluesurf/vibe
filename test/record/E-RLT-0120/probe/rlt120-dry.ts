// dry run of E-RLT-0120's combine with its gates file on E-RLT-0119's recorded parts (a_B 3.5): the instrument on real
// data at the other size, no a_B 4.5 K read (scratch, not a record)
import { readFileSync } from 'node:fs'
import type { BandPart } from '@/code/measure/band-curvature'
import { GATES_PATH, PARTS, sizeCombine, type Gates } from '@/test/experiment/relativity/bound-pair-size-isotropy'

const dir = `${import.meta.dirname}/../../E-RLT-0119`
const parts = ['axes', 'plane', 'generic'].map(n => JSON.parse(readFileSync(`${dir}/rlt119-${n}.json`, 'utf8')) as BandPart)
// E-RLT-0119's parts predate the recorded residual: its level's direct residual (E-RLT-0119 LEVEL_RESIDUAL)
for (const p of parts) p.residual = 0.0015231080722836088
const gates = JSON.parse(readFileSync(GATES_PATH, 'utf8')) as Gates
const v = sizeCombine({ parts, gates, plans: PARTS, hashOk: true, aB: 3.5 })

console.log(JSON.stringify({ status: v.status, claim: v.claim, notes: v.notes }, null, 2))
