/**
 * The determinism scan every intelligence experiment runs: every source file
 * under code/intelligence (the evaluator, the interfaces, the solvers,
 * learners, discoverers and benchmarks) plus the experiment's own files,
 * checked for a random number source (code/check/determinism, plus crypto's
 * getRandomValues, randomUUID and randomBytes, and Math's generator reached by
 * a computed key) and for a clock (Date called with or without new,
 * Date.now, performance.now, process.hrtime), which no result here may read.
 * Candidates run with no clock and no random source at all (the sandbox
 * removes both from their realm); this scan covers the evaluator side too.
 * Evaluator side: it reads the disk, so no candidate may import it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { scanSource } from '@/code/check/determinism'

const CLOCK = /\bDate\.now\s*\(|\bnew\s+Date\s*\(|(?<![\w.])Date\s*\(|\bperformance\.now\s*\(|\bprocess\.hrtime\b/

/** random sources the shared determinism scan does not name: crypto, and Math's generator reached by a computed key */
const RANDOM = new RegExp(
  [['getRandom', 'Values'].join(''), ['random', 'UUID'].join(''), ['random', 'Bytes'].join(''), ['Math\\s*\\[\\s*[\'"`]ran', 'dom'].join('')].join('|'),
)

function walk(base: string, directory: string, out: string[]): void {
  for (const name of readdirSync(join(base, directory)).sort()) {
    const path = `${directory}/${name}`

    if (statSync(join(base, path)).isDirectory()) {
      walk(base, path, out)
    } else if (name.endsWith('.ts')) {
      out.push(path)
    }
  }
}

export interface SourceFinding { file: string; line: number; kind: string }

/** The files scanned and every finding, for code/intelligence plus `extra` package-relative files. */
export function scanIntelligenceSources(base: string, extra: readonly string[]): { files: string[]; findings: SourceFinding[] } {
  const files: string[] = []

  walk(base, 'code/intelligence', files)
  files.push(...extra)

  const findings: SourceFinding[] = []

  for (const file of files) {
    const text = readFileSync(join(base, file), 'utf8')

    for (const finding of scanSource(file, text)) {
      findings.push({ file, line: finding.line, kind: finding.kind })
    }

    text.split('\n').forEach((line, index) => {
      if (/^\s*(\/\/|\*)/.test(line)) {
        return
      }

      if (CLOCK.test(line)) {
        findings.push({ file, line: index + 1, kind: 'clock' })
      }

      if (RANDOM.test(line)) {
        findings.push({ file, line: index + 1, kind: 'crypto-or-computed-random' })
      }
    })
  }

  return { files, findings }
}
