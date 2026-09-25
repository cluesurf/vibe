// Results, by code: list them, check the database, reproduce one, or audit one.
//
//   pnpm result list
//   pnpm result check                        the database against itself and the registry
//   pnpm result reproduce R-HLG-0001         run the result's experiments, hold each check
//   pnpm result audit R-HLG-0001 [--out f]   reproduce, plus environment, file hashes, every
//                                            metric, written as result.json
//   pnpm result audit R-HLG-0001 --commit    the same, frozen as research/capsule/R-HLG-0001.json
//
// A capsule is the record of one audited run: the commit, the environment, the hash of every
// experiment file, and each experiment's full verdict and time. The site reads the capsules, so
// an experiment page shows the last recorded output and how long the run took, and a reader can
// compare their own run against it. Capsules are only written on `--commit`.
//
// A result's `checks` in research/result.ts are what it claims in numbers. Reproduce runs the
// experiments at seed 1, reads each named metric from the verdict, and compares it to the
// recorded expectation within the recorded tolerance, so a record that drifts from the code
// fails here rather than on a web page. The exit status is 1 when any check fails.

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { allExperiments, runSuite } from '@/test/scaffold/suite'
import type { Verdict } from '@/test/scaffold/verdict'
import { RESULTS, dangling, refusals, NODES, challengeId } from '@/research/index'
import type { Check, Result } from '@/research/index'
import '@/test/experiment/all'

const SEED = 1

const [command, ...rest] = process.argv.slice(2)

type Observed = {
  check: Check
  observed: number | string | null
  passed: boolean
}

const CAPSULE_DIRECTORY = 'research/capsule'

function findResult(code: string | undefined): Result {
  const wanted = (code ?? '').toUpperCase()
  const result = RESULTS.find(r => r.code === wanted)

  if (!result) {
    console.error(`no result with the code ${code ?? '(none given)'}. Run pnpm result list`)
    process.exit(1)
  }

  return result
}

// Run each distinct experiment of a result once, and return its verdict by code.
function runExperiments(result: Result): Map<string, { verdict: Verdict; seconds: number }> {
  const byCode = new Map(
    allExperiments()
      .filter(e => e.code !== undefined)
      .map(e => [e.code!, e]),
  )
  const verdicts = new Map<string, { verdict: Verdict; seconds: number }>()

  for (const { code } of result.experiments) {
    if (verdicts.has(code)) {
      continue
    }

    const experiment = byCode.get(code)

    if (!experiment) {
      console.error(`${code} is in the record but not in the registry`)
      process.exit(1)
    }

    const started = Date.now()
    const [run] = runSuite([experiment], { seed: SEED })

    verdicts.set(code, { verdict: run!.verdict, seconds: (Date.now() - started) / 1000 })
    console.log(`  ran ${code}  ${((Date.now() - started) / 1000).toFixed(1)}s`)
  }

  return verdicts
}

function hold(check: Check, verdict: Verdict): Observed {
  if (check.from === 'status') {
    return { check, observed: verdict.status, passed: verdict.status === check.expected }
  }

  const value = (check.from === 'metrics' ? verdict.metrics : verdict.control)?.[check.metric]

  if (value === undefined) {
    return { check, observed: null, passed: false }
  }

  const passed =
    typeof check.expected === 'number'
      ? Math.abs(value - check.expected) <= check.tolerance
      : String(value) === check.expected

  return { check, observed: value, passed }
}

function reproduce(result: Result) {
  console.log(`\n${result.code}  ${result.title}`)
  console.log(`${challengeId(result.code)}  version ${result.version}\n`)

  const verdicts = runExperiments(result)
  const observed = result.checks.map(check => hold(check, verdicts.get(check.code)!.verdict))

  console.log('')

  for (const { check, observed: value, passed } of observed) {
    const name = check.from === 'status' ? `${check.code} status` : `${check.code} ${check.from}.${check.metric}`
    const tolerance = typeof check.expected === 'number' ? `  tolerance ${check.tolerance}` : ''

    console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}  expected ${check.expected}  observed ${value ?? 'missing'}${tolerance}`)
  }

  const failed = observed.filter(o => !o.passed).length

  console.log(`\n${observed.length - failed} of ${observed.length} checks pass`)

  return { verdicts, observed, failed }
}

function audit({ result, out, commit }: { result: Result; out: string | undefined; commit: boolean }) {
  const { verdicts, observed, failed } = reproduce(result)

  const git = (args: string[]) => {
    try {
      return execFileSync('git', args).toString().trim()
    } catch {
      return null
    }
  }

  const files = [...new Set(result.experiments.map(e => e.file))]

  const record = {
    result: result.code,
    challenge: challengeId(result.code),
    version: result.version,
    audited: new Date().toISOString().slice(0, 10),
    commit: git(['rev-parse', 'HEAD']),
    dirty: (git(['status', '--porcelain', '--', ...files]) ?? '') !== '',
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    inputs: { seed: SEED, scale: 1 },
    files: files.map(file => ({
      file,
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    })),
    expected: Object.fromEntries(
      observed.map(o => [`${o.check.code} ${o.check.from}.${o.check.metric}`, o.check.expected]),
    ),
    observed: Object.fromEntries(
      observed.map(o => [`${o.check.code} ${o.check.from}.${o.check.metric}`, o.observed]),
    ),
    checks: observed.map(o => ({ ...o.check, observed: o.observed, passed: o.passed })),
    verdicts: Object.fromEntries(
      [...verdicts].map(([code, { verdict, seconds }]) => [code, { seconds, ...verdict }]),
    ),
    passed: failed === 0,
  }

  const json = JSON.stringify(record, null, 2)

  if (commit) {
    const path = `${CAPSULE_DIRECTORY}/${result.code}.json`

    mkdirSync(CAPSULE_DIRECTORY, { recursive: true })
    writeFileSync(path, `${json}\n`)
    console.log(`wrote ${path}`)
  }

  if (out) {
    writeFileSync(out, `${json}\n`)
    console.log(`wrote ${out}`)
  }

  if (!commit && !out) {
    console.log(`\n${json}`)
  }

  return failed
}

// Every string inside a record, at any depth, with the path that reaches it.
function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') {
    return [{ path, text: value }]
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, path ? `${path}.${key}` : key))
  }

  return []
}

// The database against itself and against the registry.
function check(): number {
  const problems: string[] = []
  const codes = new Set(allExperiments().map(e => e.code))

  for (const { node, missing } of dangling()) {
    problems.push(`${node} rests on ${missing}, which names no node`)
  }

  for (const { prediction, unmet } of refusals()) {
    problems.push(`${prediction} is a prediction row whose result fails ${unmet.join(', ')}`)
  }

  for (const result of RESULTS) {
    const own = new Set(result.experiments.map(e => e.code))

    for (const { code, file } of result.experiments) {
      if (!codes.has(code)) {
        problems.push(`${result.code} names ${code}, which is not registered`)
      }

      try {
        readFileSync(file)
      } catch {
        problems.push(`${result.code} names ${file}, which does not exist`)
      }
    }

    for (const c of result.checks) {
      if (!own.has(c.code)) {
        problems.push(`${result.code} checks ${c.code}, which is not one of its experiments`)
      }
    }

    if (!/^R-[A-Z]{3}-\d{4}$/.test(result.code)) {
      problems.push(`${result.code} is not shaped R-<arena>-<NNNN>`)
    }

    // An unbalanced dollar leaves a formula open to the end of the string on every page.
    for (const { path, text } of strings(result)) {
      if ((text.split('$').length - 1) % 2 === 1) {
        problems.push(`${result.code} ${path} has an unbalanced $`)
      }
    }
  }

  const seen = new Set<string>()

  for (const { code } of RESULTS) {
    if (seen.has(code)) {
      problems.push(`${code} is used by two results`)
    }

    seen.add(code)
  }

  for (const line of problems) {
    console.log(line)
  }

  console.log(`${NODES.size} nodes, ${RESULTS.length} results, ${problems.length} problems`)

  return problems.length
}

if (command === 'list') {
  for (const r of RESULTS) {
    console.log(`${r.code}  ${r.category.padEnd(12)}  ${r.status.join(', ').padEnd(22)}  ${r.title}`)
  }
} else if (command === 'check') {
  process.exit(check() > 0 ? 1 : 0)
} else if (command === 'reproduce') {
  process.exit(reproduce(findResult(rest[0])).failed > 0 ? 1 : 0)
} else if (command === 'audit') {
  const outIndex = rest.indexOf('--out')
  const failed = audit({
    result: findResult(rest[0]),
    out: outIndex >= 0 ? rest[outIndex + 1] : undefined,
    commit: rest.includes('--commit'),
  })

  process.exit(failed > 0 ? 1 : 0)
} else {
  console.error('pnpm result list | check | reproduce <code> | audit <code> [--out <file>] [--commit]')
  process.exit(1)
}
