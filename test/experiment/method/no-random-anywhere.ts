// E-MTH-0015: the model is 100 percent deterministic, with no random number and no seed anywhere. A result
// that depends on a seed is a statement about a draw, not about the deterministic knit, and a seeded
// generator is reproducible randomness, randomness all the same. Since 2026-09-25 every spread-out value
// (a start, a fill, a null set, a solver's start vector, a sampler's schedule) is read off a Weyl or
// Kronecker sequence in code/tool/weyl.
//
// This is the permanent gate that the rule cannot regress. It scans every file under code/, test/ and
// research/ (code lines, not comments) for four things: a call to Math.random, an import of the retired
// seeded generator code/tool/rng (or its old conformance file), an import of the retired hash generator
// hashRand, and the constants of a known pseudo-random generator. It also reads the lint configuration to
// confirm the same rule is wired into eslint, since the typecheck cannot see any of it.
//
// The control is a planted battery: the same scanner run on six small texts, four that each commit one of
// the four offenses and two that must stay clean (the Weyl replacement, and a comment that only names the
// old generator). The gate is only believed if it catches all four and flags neither clean text.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { scanRepository, scanSource } from '@/code/check/determinism'

const BASE = resolve(import.meta.dirname, '../../..')

// the planted battery, each forbidden form spelled from pieces so this file is not its own finding
const PLANTED_DIRTY = [
  `const x = ${'Math'}.${'random'}()`,
  `import { make${'Rng'} } from '@/code/tool/${'rng'}'`,
  `import { hash${'Rand'} } from '@/code/dynamics/conserving-sweep'`,
  `s = (Math.imul(s, ${'16645'}${'25'}) + 1013904223) >>> 0`,
]
const PLANTED_CLEAN = [
  "import { makeWeyl } from '@/code/tool/weyl'\nconst v = makeWeyl({ start: 1 }).next()",
  `// the old ${'Math'}.${'random'}() and tool/${'rng'} are gone`,
]

export default experiment({
  id: 'method/no-random-anywhere',
  code: 'E-MTH-0015',
  title:
    'no file in code, test or research calls Math.random, imports the retired seeded generator or hash, or carries a pseudo-random generator constant, and the lint enforces the same rule',
  category: 'method',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const { files, findings } = scanRepository(BASE)
    const count = (kind: string): number =>
      findings.filter(f => f.kind === kind).length

    const caught = PLANTED_DIRTY.filter(
      text => scanSource('planted.ts', text).length > 0,
    ).length
    const falseAlarms = PLANTED_CLEAN.filter(
      text => scanSource('planted.ts', text).length > 0,
    ).length
    const controlHolds =
      caught === PLANTED_DIRTY.length && falseAlarms === 0

    const lint = readFileSync(resolve(BASE, 'eslint.config.ts'), 'utf8')
    const lintWired =
      lint.includes("property: 'random'") &&
      lint.includes("'@/code/tool/rng'") &&
      lint.includes("importNames: ['hashRand']")

    const offenders = [...new Set(findings.map(f => f.file))].sort()
    const ok = findings.length === 0 && lintWired && controlHolds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: ok
        ? `no source file under code, test or research reaches for a random number: 0 findings over ${files} files, the lint rule is wired, and the scanner caught ${caught} of ${PLANTED_DIRTY.length} planted offenses with ${falseAlarms} false alarms`
        : `${findings.length} findings in ${offenders.length} files over ${files} scanned (the rule is that there be none), lint wired ${lintWired ? 'yes' : 'no'}, planted control ${caught} of ${PLANTED_DIRTY.length} caught with ${falseAlarms} false alarms: ${offenders.join(', ')}`,
      metrics: {
        filesScanned: files,
        findings: findings.length,
        offendingFiles: offenders.length,
        mathRandom: count('math-random'),
        retiredModule: count('retired-module'),
        retiredHash: count('retired-hash'),
        generatorConstant: count('generator-constant'),
        lintWired: lintWired ? 1 : 0,
      },
      control: {
        plantedCaught: caught,
        plantedOffenses: PLANTED_DIRTY.length,
        cleanFalseAlarms: falseAlarms,
      },
      notes: `A static text scan of code lines (comments skipped), exempting only the retired generator code/tool/rng.ts and its old conformance test/code/tool/rng.ts, both unused and awaiting deletion, and the scanner's own two files. The typecheck cannot see a random call, so the rule is also an eslint rule (no-restricted-properties on Math.random, no-restricted-imports on tool/rng and hashRand, in eslint.config.ts), and this experiment checks that the rule is present. What it cannot see: a generator written from scratch with new constants and no import, which only a reader catches. Findings: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join('; ') || 'none'}.`,
    })
  },
})
