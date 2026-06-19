// Scan reporter. Writes a machine JSON and a human-readable markdown table for a
// ScanResult, both stamped with the seed. Per the house rule, the markdown uses
// human framing and never raw ISO timestamps.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ScanResult } from '@/test/scaffold/runner'

// Collect every metric key that appears across all scan points, in first-seen
// order, so the markdown table has one stable column per metric.
function metricKeysOf(result: ScanResult): string[] {
  const keys: string[] = []
  const seen = new Set<string>()

  for (const point of result.points) {
    for (const key of Object.keys(point.mean)) {
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
  }

  return keys
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value)
  }

  // Compact fixed precision keeps the table readable.
  return value.toFixed(4)
}

export function writeReport(input: {
  result: ScanResult
  outDir: string
  parameterLabels?: readonly string[]
}): { json: string; markdown: string } {
  mkdirSync(input.outDir, { recursive: true })

  const result = input.result
  const jsonPath = join(
    input.outDir,
    `${result.name}-${result.seed}.json`,
  )

  const markdownPath = join(
    input.outDir,
    `${result.name}-${result.seed}.md`,
  )

  // Machine output: the full ScanResult verbatim.
  writeFileSync(jsonPath, JSON.stringify(result, null, 2))

  // Human output: a readable table, one row per parameter point.
  const metricKeys = metricKeysOf(result)
  const lines: string[] = []
  lines.push(`# Scan: ${result.name}`)
  lines.push('')
  lines.push(
    `Seed ${result.seed}. ${result.points.length} parameter points.`,
  )
  lines.push('')
  lines.push(
    'Each metric cell shows the mean across repeats with its standard deviation.',
  )
  lines.push('')

  const header = ['parameter', ...metricKeys]
  lines.push(`| ${header.join(' | ')} |`)
  lines.push(`| ${header.map(() => '---').join(' | ')} |`)

  for (const point of result.points) {
    const label =
      input.parameterLabels?.[point.parameterIndex] ??
      String(point.parameterIndex)

    const cells = [label]

    for (const key of metricKeys) {
      const mean = point.mean[key] ?? 0
      const std = point.std[key] ?? 0
      cells.push(`${formatNumber(mean)} ± ${formatNumber(std)}`)
    }

    lines.push(`| ${cells.join(' | ')} |`)
  }

  lines.push('')
  writeFileSync(markdownPath, lines.join('\n'))

  return { json: jsonPath, markdown: markdownPath }
}
