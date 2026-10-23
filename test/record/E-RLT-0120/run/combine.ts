// Rebuild E-RLT-0120's verdict from the recorded parts, read with the FROZEN gates file (test/record/E-RLT-0120/
// rlt120-gates.json, which must hash to the experiment's GATES_SHA256), and print it with the gates file's hash. With
// `--write` it also writes test/record/E-RLT-0120/rlt120-verdict.log (or `--write <name>.log`), refusing to overwrite one
// that exists. With --smoke it reads the smoke parts in the package's tmp/rlt120-smoke/ with run/smoke-gates.json
// instead (no hash check, nothing written to the record).
//
//   node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json test/record/E-RLT-0120/run/combine.ts [--write [name]] [--smoke]

import { existsSync, writeFileSync } from 'node:fs'
import {
  GATES_PATH,
  GATES_SHA256,
  PARTS,
  RECORD,
  SMOKE_GATES_PATH,
  SMOKE_PARTS,
  SMOKE_STAGE,
  STAGE,
  sha256,
  sizeVerdict,
} from '@/test/experiment/relativity/bound-pair-size-isotropy'

const smoke = process.argv.includes('--smoke')
const at = process.argv.indexOf('--write')
const named = at >= 0 ? process.argv[at + 1] : undefined
const name = named && !named.startsWith('--') ? named : 'rlt120-verdict.log'

if (!/^[a-z0-9-]+\.log$/.test(name)) {
  throw new Error(`combine: a verdict name is a plain file name ending .log, not ${name}`)
}

const gatesPath = smoke ? SMOKE_GATES_PATH : GATES_PATH
const v = smoke
  ? sizeVerdict({
      dir: `${import.meta.dirname}/../../../../tmp/rlt120-smoke`,
      gatesPath,
      plans: SMOKE_PARTS,
      frozen: false,
      aB: SMOKE_STAGE.aB,
    })
  : sizeVerdict({ dir: RECORD, gatesPath, plans: PARTS, frozen: true, aB: STAGE.aB })
const text = JSON.stringify({ gates: gatesPath, sha256: sha256(gatesPath), frozenSha256: GATES_SHA256, ...v }, null, 2)

console.log(text)

if (at >= 0 && !smoke) {
  const out = `${RECORD}/${name}`

  if (existsSync(out)) {
    throw new Error(`combine: ${out} exists; refusing to overwrite it`)
  }

  writeFileSync(out, `${text}\n`)
}
