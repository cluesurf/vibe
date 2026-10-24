// E-SPN-0218's verdict: the light's kernels, each level's S, and the re-reads of E-SPN-0217's clock and E-MTR-0033's
// band (no engine run). Writes its log to the path given, refusing to overwrite a record.
// usage: breit-run.ts <out.log>
import { existsSync, writeFileSync } from 'node:fs'
import { breitRun, GATE_PLAN } from '@/test/experiment/spin/light-breit-exchange'

const out = process.argv[2]

if (!out) throw new Error('usage: breit-run.ts <out.log>')
if (existsSync(out)) throw new Error(`refusing to overwrite ${out}`)

const v = breitRun(GATE_PLAN)
const lines = [`status ${v.status}`, `claim ${v.claim}`]

for (const [k, x] of Object.entries(v.metrics)) lines.push(`  ${k} ${x}`)
for (const [k, x] of Object.entries(v.control ?? {})) lines.push(`  control_${k} ${x}`)
lines.push(`notes ${v.notes}`)
writeFileSync(out, `${lines.join('\n')}\n`)
console.log(lines.slice(0, 2).join('\n'))
