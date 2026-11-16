// The probe log of one board experiment, and the rule that judges a verdict against its gate.
//
// One JSON line per probe in `<log dir>/<item id>.jsonl`, appended and never rewritten. A verdict is recorded
// only when every earlier probe of the item ran after the gate line and under the same gate hash. Otherwise
// the gate may have been chosen after seeing a number, and the verdict is refused.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Gate } from './gate'

export type ProbeLine = {
  // ISO time the probe started
  at: string
  item: string
  // the command as run, argument by argument
  command: string[]
  // the gate line in force when the probe started
  gate: { hash: string; at: string }
  // the probe's exit code, null when it died on a signal
  exit: number | null
  // the verdict the probe printed, null when it printed none
  verdict: string | null
  // true when the verdict counts, false when it was refused
  recorded: boolean
  // why the verdict was refused, empty when recorded
  refused: string[]
}

export function logPath(logDir: string, item: string): string {
  return join(logDir, `${item}.jsonl`)
}

export function readProbes(logDir: string, item: string): ProbeLine[] {
  const path = logPath(logDir, item)
  if (!existsSync(path)) {
    return []
  }
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line) as ProbeLine)
}

export function appendProbe(logDir: string, line: ProbeLine): void {
  mkdirSync(logDir, { recursive: true })
  appendFileSync(logPath(logDir, line.item), `${JSON.stringify(line)}\n`)
}

// Every reason a verdict under `gate`, from a probe started at `at`, cannot be recorded.
export function judge(gate: Gate, earlier: ProbeLine[], at: string): string[] {
  const reasons: string[] = []
  const gateTime = Date.parse(gate.at)
  if (Date.parse(at) < gateTime) {
    reasons.push(`this probe at ${at} predates the gate line at ${gate.at}`)
  }
  for (const probe of earlier) {
    if (Date.parse(probe.at) < gateTime) {
      reasons.push(`probe at ${probe.at} predates the gate line ${gate.hash} at ${gate.at}`)
    }
    if (probe.gate.hash !== gate.hash) {
      reasons.push(
        `probe at ${probe.at} ran under gate ${probe.gate.hash} (${probe.gate.at}), and what changed after it to ${gate.hash} (${gate.at})`,
      )
    }
  }
  return reasons
}

// The verdict a probe printed: a JSON object with a `verdict` field (task/run-experiment.ts prints one, and its
// `status` is taken when present), or else the last line of the form `verdict: <text>`.
export function readVerdict(stdout: string): string | null {
  const text = stdout.trim()
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text) as { verdict?: unknown }
      if (parsed && 'verdict' in parsed) {
        const verdict = parsed.verdict as { status?: unknown } | null
        if (verdict && typeof verdict === 'object' && typeof verdict.status === 'string') {
          return verdict.status
        }
        return JSON.stringify(parsed.verdict)
      }
    } catch {
      // not one JSON object, fall through to the line form
    }
  }
  let found: string | null = null
  for (const line of text.split('\n')) {
    const match = /^verdict:\s*(.+)$/i.exec(line.trim())
    if (match?.[1]) {
      found = match[1].trim()
    }
  }
  return found
}
