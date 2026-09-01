// Does any experiment's verdict rest on a constant someone typed?
//
// The methodology's own rule: a constant set by hand that then appears in the conclusion makes a test
// circular. On 2026-08-31, 24 such sites in 20 files printed PASSED (`const bosonShellsTouched = 1`,
// `const decaysWithoutLeptoquarks = false`, `const hasRouting = true`, and so on). This check finds every
// `const name = <literal boolean or small integer>` in an experiment and reports it when `name` reaches a
// verdict expression (`ok`, `solved`, `status`, or a boolean conjunction) anywhere else in the file.
//
// Reports only. There is no --commit, because the fix is a judgement (measure it, or move it out of the
// conjunction into notes as a stated assumption), never a rewrite.
//
//   pnpm check:constants

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()

// a typed literal that could stand in for a measurement
const TYPED = /^\s*const ([A-Za-z0-9_]+)\s*=\s*(true|false|-1|\+1|1|0)\s*(\/\/.*)?$/

// names that are plainly loop or index choices, never a claim
const HARMLESS = /^(dir|direction|axis|index|i|j|k|n|seed|slot|start|offset|step|count|depth|zero|one)$/

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)

    if (statSync(path).isDirectory()) {
      walk(path, found)
    } else if (name.endsWith('.ts') && !name.startsWith('all.')) {
      found.push(path)
    }
  }

  return found
}

const files = walk(join(root, 'test', 'experiment'))

let sites = 0

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')

  lines.forEach((line, index) => {
    const match = TYPED.exec(line)

    if (!match) {
      return
    }

    const name = match[1]!

    if (HARMLESS.test(name)) {
      return
    }

    const pattern = new RegExp(`\\b${name}\\b`)

    const feedsVerdict = lines.some((other, otherIndex) => {
      if (otherIndex === index || /^\s*\/\//.test(other)) {
        return false
      }

      if (!pattern.test(other)) {
        return false
      }

      // a use inside metrics, control, claim or notes is reporting, not deciding
      if (/metrics|control|claim|notes|title/.test(other)) {
        return false
      }

      return /\bok\b|solved|status|&&|\|\||!\s*\w/.test(other)
    })

    if (feedsVerdict) {
      sites++
      console.log(
        `  typed     ${relative(root, file)}:${index + 1}  ${line.trim().slice(0, 100)}`,
      )
    }
  })
}

console.log(
  `\ncheck:constants  ${sites} typed constant${sites === 1 ? '' : 's'} reaching a verdict`,
)

if (sites > 0) {
  process.exit(1)
}
