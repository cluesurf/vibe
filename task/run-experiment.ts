// Run one experiment by its file and print its verdict as JSON, with the seconds it took.
//
//   pnpm call task/run-experiment.ts test/experiment/gauge/two-alphas.ts
//
// The suite (test/run.ts) runs every experiment; this runs the one a note's proof names, so a reader can rerun a
// single result without the whole registry.

import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const file = process.argv[2]

if (!file) {
  throw new Error('give an experiment file, e.g. test/experiment/gauge/two-alphas.ts')
}

const loaded = (await import(pathToFileURL(resolve(file)).href)) as {
  default: { code?: string; run: (context: object) => unknown }
}
const started = Date.now()
const verdict = loaded.default.run({})

console.log(
  JSON.stringify(
    {
      code: loaded.default.code,
      seconds: (Date.now() - started) / 1000,
      verdict,
    },
    null,
    2,
  ),
)
