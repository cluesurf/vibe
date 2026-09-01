// Does the quantum coverage map agree with the catalog?
//
// note/experiment/quantum-coverage.md names experiments by code with a depth in parentheses, for example
// "QTM-0056 tunneling-law (L2 walk)". A map that names a code the registry does not have, or a depth the
// catalog no longer carries, is a map that has rotted. This check reads every "<ARENA>-<NNNN>" mention
// followed by a depth and compares it against test/catalog.csv.
//
// Reports only. pnpm check:coverage exits 1 on any mismatch.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const note = readFileSync(join(root, 'note', 'experiment', 'quantum-coverage.md'), 'utf8')
const catalog = readFileSync(join(root, 'test', 'catalog.csv'), 'utf8')
  .trim()
  .split('\n')
  .slice(1)

const depthByCode = new Map<string, string>()

for (const row of catalog) {
  const [code, , , depth] = row.split(',')

  if (code && depth) {
    depthByCode.set(code, depth)
  }
}

// a code mention: "QTM-0056" or "E-QTM-0056", optionally followed by a slug and then "(L2" or ", L2"
const MENTION = /\b(?:E-)?([A-Z]{3})-(\d{4})\b([^()\n|]*)(?:\((L[0-3])|,\s*(L[0-3]))?/g

let mentions = 0
let unknown = 0
let mismatched = 0

for (const match of note.matchAll(MENTION)) {
  const code = `E-${match[1]}-${match[2]}`
  const stated = match[4] ?? match[5]

  mentions++

  const actual = depthByCode.get(code)

  if (!actual) {
    unknown++
    console.log(`  unknown   ${code}  named in the coverage note, not in the catalog`)

    continue
  }

  if (stated && stated !== actual) {
    mismatched++
    console.log(`  depth     ${code}  note says ${stated}, catalog says ${actual}`)
  }
}

console.log(
  `\ncheck:coverage  ${mentions} code mentions, ${unknown} unknown, ${mismatched} depth mismatches`,
)

if (unknown > 0 || mismatched > 0) {
  process.exit(1)
}
