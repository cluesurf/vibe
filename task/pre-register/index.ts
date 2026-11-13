// Pre-registration for Vibe board experiments: the only way a board experiment runs.
//
// A board experiment is a checklist item under note/project/vibe/roadmap/. Its gates (each number and
// tolerance) go into the item's `what` before any code, with
//
//   pnpm --silent --dir <cluesurf> checklist set vibe/roadmap/<project> <id> --set what="..." --commit
//
// which appends a hashed, dated line to the checklist.ledger.jsonl beside it. This tool then runs every probe:
//
//   pnpm call task/pre-register/index.ts gate <id>                 print the gate line in force and its what
//   pnpm call task/pre-register/index.ts run <id> -- <probe...>    run a probe, log it, record or refuse its verdict
//   pnpm call task/pre-register/index.ts history <id>              every probe of the item and its verdict
//
// A probe is an experiment file (test/experiment/... runs through task/run-experiment.ts), any other .ts file
// (run with tsx), or any command. Its verdict is the `verdict` field of the JSON it prints, or its last
// `verdict: <text>` line. Each probe appends one line to test/probe-log/<id>.jsonl. A verdict is refused
// (exit 3) when any probe of the item predates the gate line, or ran under a different gate hash, so a gate
// changed after a probe taints the item for good.
//
// Options: --repo <cluesurf dir> (default: found above this file), --log-dir <dir> (default: test/probe-log).

import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { findGate, findRepoBase } from './gate'
import { readProbes } from './probe-log'
import { runProbe } from './probe'

const deck = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

function usage(): never {
  console.error('usage: pre-register gate <id> | run <id> -- <probe...> | history <id> [--repo dir] [--log-dir dir]')
  process.exit(2)
}

const argv = process.argv.slice(2)
const split = argv.indexOf('--')
const own = split === -1 ? argv : argv.slice(0, split)
const probe = split === -1 ? [] : argv.slice(split + 1)

const flags = new Map<string, string>()
const words: string[] = []
for (let i = 0; i < own.length; i++) {
  const word = own[i]!
  if (word.startsWith('--')) {
    const value = own[i + 1]
    if (value === undefined) {
      usage()
    }
    flags.set(word.slice(2), value)
    i++
  } else {
    words.push(word)
  }
}

const [verb, item] = words
if (!verb || !item) {
  usage()
}

const repo = flags.get('repo') ? resolve(flags.get('repo')!) : findRepoBase()
const roadmap = join(repo, 'note', 'project', 'vibe', 'roadmap')
const logDir = flags.get('log-dir') ? resolve(flags.get('log-dir')!) : join(deck, 'test', 'probe-log')

if (verb === 'gate') {
  const lookup = findGate(item, roadmap)
  if (!lookup.ok) {
    console.error(lookup.reason)
    process.exit(3)
  }
  const { gate } = lookup
  console.log(`gate ${gate.hash} set ${gate.at}\nchecklist ${gate.checklist}\nwhat ${gate.what}`)
} else if (verb === 'run') {
  const result = await runProbe({ item, command: probe, roadmap, logDir, cwd: deck })
  if (result.code === 0) {
    console.log(result.message)
  } else {
    console.error(result.message)
  }
  process.exit(result.code)
} else if (verb === 'history') {
  const probes = readProbes(logDir, item)
  if (probes.length === 0) {
    console.log(`no probes of ${item} in ${logDir}`)
  }
  for (const line of probes) {
    const state = line.recorded ? 'recorded' : `REFUSED (${line.refused.join('; ')})`
    console.log(
      `${line.at}  gate ${line.gate.hash} ${line.gate.at}  exit ${line.exit}  verdict ${line.verdict ?? '-'}  ${state}\n    ${line.command.join(' ')}`,
    )
  }
} else {
  usage()
}
