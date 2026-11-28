// The drift gate of the TypeScript-to-Lean link. Fail-closed:
//
// 1. reruns every exporter of task/lean-export.ts into tmp/lean-export/ and compares each file byte for byte
//    with the committed code/proof/Vibe/Generated/ copy, so a source change without regeneration fails
// 2. fails on a file in Generated/ that no exporter writes
// 3. requires every generated file to have its bridge theorems in REQUIRED_THEOREMS of task/check-lean.ts,
//    declared as `theorem` in the bridge module, which imports the generated module and is imported by Vibe.lean
//
// check-lean.ts calls `checkLeanLink` with its own REQUIRED_THEOREMS. Run alone, the gate reads that list from
// the check-lean.ts source.
//
//   tsx --tsconfig tsconfig.json task/check-lean-link.ts
//   tsx --tsconfig tsconfig.json task/check-lean-link.ts --generated DIR   compare DIR instead of Generated/

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GENERATED_DIR,
  generatedModule,
  LEAN_EXPORTS,
  WORKTREE_ROOT,
  writeLeanExports,
} from './lean-export'

export const LEAN_EXPORT_SCRATCH = join(WORKTREE_ROOT, 'tmp', 'lean-export')

const proofDir = join(WORKTREE_ROOT, 'code', 'proof')

export type LeanLinkResult = {
  failures: string[]
  lines: string[]
}

function moduleFile(module: string): string {
  return join(proofDir, `${module.split('.').join('/')}.lean`)
}

function importsModule(source: string, module: string): boolean {
  const escaped = module.replace(/\./g, '\\.')

  return new RegExp(`^import\\s+${escaped}\\s*$`, 'm').test(source)
}

function firstDifference(x: string, y: string): number {
  const a = x.split('\n')
  const b = y.split('\n')
  const n = Math.max(a.length, b.length)

  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      return i + 1
    }
  }

  return 0
}

export function checkLeanLink(input: {
  requiredTheorems: readonly string[]
  generatedDir?: string
  scratchDir?: string
}): LeanLinkResult {
  const generatedDir = input.generatedDir ?? GENERATED_DIR
  const scratchDir = input.scratchDir ?? LEAN_EXPORT_SCRATCH
  const required = new Set(input.requiredTheorems)
  const failures: string[] = []
  const lines: string[] = []

  const rendered = writeLeanExports(scratchDir)
  const expected = new Set(rendered.map(r => r.file))

  for (const r of rendered) {
    const committedPath = join(generatedDir, r.file)

    if (!existsSync(committedPath)) {
      failures.push(`link: ${r.file} is not committed in ${generatedDir}`)
      continue
    }

    const committed = readFileSync(committedPath)
    const fresh = readFileSync(join(scratchDir, r.file))

    if (!committed.equals(fresh)) {
      failures.push(
        `link: ${r.file} drifted from its source (first difference at line ${firstDifference(committed.toString('utf8'), fresh.toString('utf8'))}): run task/lean-export.ts --commit`,
      )
    } else {
      lines.push(`link: ${r.file} identical to a fresh export (${fresh.length} bytes)`)
    }
  }

  if (existsSync(generatedDir)) {
    for (const file of readdirSync(generatedDir).sort()) {
      if (file.endsWith('.lean') && !expected.has(file)) {
        failures.push(`link: ${file} in Generated/ has no exporter in LEAN_EXPORTS`)
      }
    }
  }

  const vibeLean = readFileSync(join(proofDir, 'Vibe.lean'), 'utf8')

  for (const e of LEAN_EXPORTS) {
    if (e.bridges.length === 0) {
      failures.push(`link: ${e.name} declares no bridge theorem`)
    }

    for (const name of e.bridges) {
      if (!required.has(name)) {
        failures.push(`link: bridge theorem ${name} of ${e.name} is not in REQUIRED_THEOREMS`)
      }
    }

    const bridgePath = moduleFile(e.bridgeModule)

    if (!existsSync(bridgePath)) {
      failures.push(`link: bridge module ${e.bridgeModule} of ${e.name} does not exist`)
      continue
    }

    const bridgeSource = readFileSync(bridgePath, 'utf8')

    if (!importsModule(bridgeSource, generatedModule(e.name))) {
      failures.push(`link: ${e.bridgeModule} does not import ${generatedModule(e.name)}`)
    }

    if (!importsModule(vibeLean, e.bridgeModule)) {
      failures.push(`link: Vibe.lean does not import ${e.bridgeModule}`)
    }

    for (const name of e.bridges) {
      if (!new RegExp(`^theorem\\s+${name}\\b`, 'm').test(bridgeSource)) {
        failures.push(`link: ${e.bridgeModule} does not declare theorem ${name}`)
      }
    }

    lines.push(
      `link: ${e.name} bridged by ${e.bridgeModule} (${e.bridges.join(', ')})`,
    )
  }

  return { failures, lines }
}

// REQUIRED_THEOREMS read from the check-lean.ts source, for running this gate alone.
export function requiredTheoremsFromSource(source: string): string[] {
  const block = /const REQUIRED_THEOREMS = \[([\s\S]*?)\] as const/.exec(source)

  if (!block) {
    throw new Error('REQUIRED_THEOREMS not found in check-lean.ts')
  }

  const names: string[] = []

  for (const line of block[1]!.split('\n')) {
    const m = /^\s*'([^']+)',?\s*$/.exec(line)

    if (m) {
      names.push(m[1]!)
    }
  }

  return names
}

function main(): void {
  const args = process.argv.slice(2)
  const generatedIndex = args.indexOf('--generated')
  const generatedDir =
    generatedIndex >= 0 ? resolve(args[generatedIndex + 1] ?? '') : undefined
  const requiredTheorems = requiredTheoremsFromSource(
    readFileSync(join(WORKTREE_ROOT, 'task', 'check-lean.ts'), 'utf8'),
  )
  const result = checkLeanLink({ requiredTheorems, generatedDir })

  for (const line of result.lines) {
    console.log(`check:lean-link  ${line}`)
  }

  if (result.failures.length > 0) {
    for (const f of result.failures) {
      console.error(`  FAIL  ${f}`)
    }

    process.exit(1)
  }

  console.log(
    `check:lean-link  PASS (${LEAN_EXPORTS.length} generated file(s), all identical to a fresh export and bridged)`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
