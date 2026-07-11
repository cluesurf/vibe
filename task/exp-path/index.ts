// Look up an experiment's source file from its code. Vibe experiment codes are
// E-<ARENA>-<NNNN>, and the registry (test/registry.csv) maps every code to its file.
// This resolves a code to its path and exports the whole map for other tools. The note
// linkifier uses it to turn every E-... code in the docs into a link to its source.
//
// Run:
//   pnpm call task/exp-path/index.ts E-SLF-0008
//   pnpm call task/exp-path/index.ts E-SLF-0008 E-QTM-0092
//   pnpm call task/exp-path/index.ts --json E-FND-0051

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const packageRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
)
const CODE_PATTERN = /^E-[A-Z]{3}-\d{4}$/

// Map every experiment code to its source file, read from the registry. The code is the
// first CSV column and the file is the last. The file path has no comma, so taking the
// last comma-separated field is safe even when the title column contains commas.
export function loadExperimentPaths(): Map<string, string> {
  const map = new Map<string, string>()
  const text = readFileSync(
    resolve(packageRoot, 'test/registry.csv'),
    'utf8',
  )

  const lines = text.split('\n')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim()

    if (!line) continue

    const parts = line.split(',')
    const code = parts[0]!.trim()
    const file = parts[parts.length - 1]!.trim()

    if (CODE_PATTERN.test(code) && file.endsWith('.ts'))
      map.set(code, file)
  }

  return map
}

// The source file for one code, or undefined if the registry does not list it.
export function experimentPath(code: string): string | undefined {
  return loadExperimentPaths().get(code)
}

// The CLI runs only when this file is the entry point, not when imported by a tool.
const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  const { values, positionals } = parseArgs({
    options: { json: { type: 'boolean' } },
    allowPositionals: true,
  })

  const paths = loadExperimentPaths()
  const results = positionals.map(code => ({
    code,
    file: paths.get(code) ?? null,
  }))

  if (values.json) console.log(JSON.stringify(results, null, 2))
  else {
    for (const { code, file } of results)
      console.log(file ? `${code}\t${file}` : `${code}\t(unknown)`)
  }

  if (results.some(result => !result.file)) process.exit(1)
}
