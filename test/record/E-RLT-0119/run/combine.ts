// Rebuild E-RLT-0119's verdict from the recorded parts and print it. With `--write` it also writes
// test/record/E-RLT-0119/rlt119-verdict.log, refusing to overwrite one that exists.
//
//   node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json test/record/E-RLT-0119/run/combine.ts [--write]

import { existsSync, writeFileSync } from 'node:fs'
import test from '@/test/experiment/relativity/bound-pair-band-isotropy'

const out = `${import.meta.dirname}/../rlt119-verdict.log`
const v = test.run({})
const text = JSON.stringify(v, null, 2)

console.log(text)

if (process.argv.includes('--write')) {
  if (existsSync(out)) {
    throw new Error(`combine: ${out} exists; refusing to overwrite it`)
  }

  writeFileSync(out, `${text}\n`)
}
