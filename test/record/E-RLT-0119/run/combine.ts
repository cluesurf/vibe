// Rebuild E-RLT-0119's verdict from the recorded parts and print it. With `--write` it also writes
// test/record/E-RLT-0119/rlt119-verdict.log (or, with `--write <name>`, test/record/E-RLT-0119/<name>), refusing to
// overwrite one that exists.
//
//   node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json test/record/E-RLT-0119/run/combine.ts [--write [name]]

import { existsSync, writeFileSync } from 'node:fs'
import test from '@/test/experiment/relativity/bound-pair-band-isotropy'

const named = process.argv[process.argv.indexOf('--write') + 1]
const name = named && !named.startsWith('--') && process.argv.includes('--write') ? named : 'rlt119-verdict.log'

if (!/^[a-z0-9-]+\.log$/.test(name)) {
  throw new Error(`combine: a verdict name is a plain file name ending .log, not ${name}`)
}

const out = `${import.meta.dirname}/../${name}`
const v = test.run({})
const text = JSON.stringify(v, null, 2)

console.log(text)

if (process.argv.includes('--write')) {
  if (existsSync(out)) {
    throw new Error(`combine: ${out} exists; refusing to overwrite it`)
  }

  writeFileSync(out, `${text}\n`)
}
