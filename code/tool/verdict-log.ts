// A saved verdict log (test/record/<code>/*.log, the combine runners' output): its status line and its metric lines,
// "  <name> <number>", read back so a later experiment can re-read recorded parts without importing the experiment
// that wrote them.

import { existsSync, readFileSync } from 'node:fs'

export type VerdictLog = { status: string; metrics: Record<string, number> }

export function readVerdictLog(path: string): VerdictLog | null {
  if (!existsSync(path)) return null

  const metrics: Record<string, number> = {}
  let status = ''

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('status ')) status = line.slice(7).trim()

    const m = /^ {2}(\S+) (\S+)$/.exec(line)

    if (m && m[2] !== undefined && m[1] !== undefined) {
      const x = Number(m[2])

      if (!Number.isNaN(x) || m[2] === 'NaN') metrics[m[1]] = x
    }
  }

  return { status, metrics }
}
