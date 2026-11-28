// Does every experiment's `substrates` label name a substrate its code actually touches?
//
// The label is what a reader of the catalog uses to decide whether a result is about the committed
// {3,4,3,4} base. On 2026-08-31, 166 of 817 experiments declared ['3434'] with nothing {3,4,3,4}-related
// in their import graph or their own source. This check walks each experiment's transitive `@/code/...`
// imports and its own body for substrate evidence, and reports every label the evidence contradicts.
//
// Since 2026-11-15 the evidence is the mesh the code builds (task/mesh-reach): a 3434 claim
// holds only when the experiment builds a ball, a cusp or a quotient of the honeycomb. A D4 import, the D4 roots or a
// rule module no longer count, because the flat D4 box has the same 24 directions and passed as the honeycomb.
//
// Reports by default. Rewrites the contradicted labels to 'any' only with --commit.
//
//   pnpm check:labels            report
//   pnpm check:labels --commit   rewrite
//   pnpm check:labels --all      also list the experiments whose label is consistent

import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, relative } from 'node:path'
import { MeshReader } from './mesh-reach'

//   pnpm check:labels --strict   exit 1 while any contradicted label remains

const root = process.cwd()
const commit = process.argv.includes('--commit')
const showAll = process.argv.includes('--all')
const strict = process.argv.includes('--strict')

// modules that build or run a substrate, a rule, or the coin's algebra
const SUBSTRATE_MODULES =
  /code\/(substrate\/|rule\/|tool\/mesh|tone\/will|model\/vibe|dynamics\/genesis|algebra\/group\/|operator\/dirac-skyrmion|measure\/tessellation)/

// modules that compute the octonion algebra without any mesh, the held-for-review class
const ALGEBRA_MODULES =
  /code\/(algebra\/octonion|measure\/division-algebra|measure\/quaternionic-generations|measure\/octonion-fermions)/

// identifiers or literals in an experiment's own CODE (strings and comments stripped, so the label and the
// id do not count as their own evidence) that mean it hardcodes {3,4,3,4} structure rather than importing it
const INLINE_3434 =
  /rootsD4|D4_ROOTS|D4_OPPOSITE|d4Mesh|\[3, 4, 3, 4\]|\[3,4,3,4\]|binaryTetrahedral|coxeterCellFrame|buildAddressing/

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

function importsOf(file: string): string[] {
  let source = ''

  try {
    source = readFileSync(file, 'utf8')
  } catch {
    return []
  }

  return [...source.matchAll(/from '@\/(code\/[^']+)'/g)].map(
    match => `${root}/${match[1]}.ts`,
  )
}

// strip comments and string literals so a mention in prose, a title, or the label itself does not count
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
}

function touchesSubstrate(file: string): string[] {
  const seen = new Set<string>()
  const queue = importsOf(file)
  const evidence: string[] = []

  while (queue.length > 0) {
    const next = queue.shift()!

    if (seen.has(next)) {
      continue
    }

    seen.add(next)

    const rel = relative(root, next)

    if (SUBSTRATE_MODULES.test(rel)) {
      evidence.push(rel.replace(/^code\//, ''))
    }

    queue.push(...importsOf(next))
  }

  return evidence
}

function touchesAlgebra(file: string): boolean {
  const seen = new Set<string>()
  const queue = importsOf(file)

  while (queue.length > 0) {
    const next = queue.shift()!

    if (seen.has(next)) {
      continue
    }

    seen.add(next)

    if (ALGEBRA_MODULES.test(relative(root, next))) {
      return true
    }

    queue.push(...importsOf(next))
  }

  return false
}

const files = walk(join(root, 'test', 'experiment'))

const meshReader = new MeshReader(root)
let checked = 0
let contradicted = 0
let boxClaims = 0
let review = 0
let rewritten = 0

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const body = codeOnly(source)
  // the label is read from the raw source (the stripped body has no strings left)
  const labels = [...source.matchAll(/substrates: (\[[^\]]*\]|'any')/g)]

  if (labels.length === 0) {
    continue
  }

  checked++

  const claims3434 = labels.some(label => label[1]!.includes('3434'))

  if (!claims3434) {
    if (showAll) {
      console.log(
        `  ok        ${relative(root, file)}  (no 3434 claim)`,
      )
    }

    continue
  }

  // the claim holds only when the code builds the honeycomb itself (a ball, a cusp or a quotient). The D4 roots, a
  // D4 import, the flat D4 box or any rule module are NOT evidence: the box has the same 24 directions per dock and
  // is a stand-in (keys 6). The mesh comes from task/mesh-reach, which follows the code
  const reach = meshReader.read(relative(root, file))
  const honeycomb = reach.meshes.filter(m => m.startsWith('honeycomb-'))

  if (honeycomb.length > 0) {
    if (showAll) {
      console.log(
        `  ok        ${relative(root, file)}  ${honeycomb.join(' ')}`,
      )
    }

    continue
  }

  // a box run that claims 3434 is the case this check exists for, and is never held for review
  if (reach.meshes.includes('d4-box')) {
    contradicted++
    boxClaims++
    console.log(
      `  box       ${relative(root, file)}  declares 3434, builds ${reach.meshes.join(' ')}, no honeycomb`,
    )

    if (commit) {
      const fixed = source.replace(
        /substrates: \['3434'\]/g,
        "substrates: 'any'",
      )

      if (fixed !== source) {
        writeFileSync(file, fixed)
        rewritten++
      }
    }

    continue
  }

  // the old evidence (a substrate or rule import, inline D4 tokens) is kept only to tell the remaining cases apart
  const evidence = touchesSubstrate(file)
  const inline = INLINE_3434.test(body)

  if (evidence.length > 0 || inline) {
    contradicted++
    console.log(
      `  false     ${relative(root, file)}  declares 3434, builds ${reach.meshes.join(' ')} (imports ${inline ? 'inline D4 tokens' : evidence.slice(0, 2).join(' ')}, no honeycomb)`,
    )

    continue
  }

  // the octonion-algebra experiments run on no mesh but compute the algebra the paper says the mesh is
  // built from. Whether that earns the 3434 label is a judgement, so they are listed for review and never
  // rewritten by this script. (The 2026-08-31 sample of fourteen flagged files found exactly this class
  // borderline and everything else plainly false, which is why the class is held out.)
  if (touchesAlgebra(file)) {
    review++
    console.log(
      `  review    ${relative(root, file)}  declares 3434, runs on no mesh, computes the octonion algebra`,
    )

    continue
  }

  contradicted++
  console.log(
    `  false     ${relative(root, file)}  declares 3434, imports nothing substrate-related, no inline 3434 tokens`,
  )

  if (commit) {
    const fixed = source.replace(
      /substrates: \['3434'\]/g,
      "substrates: 'any'",
    )

    if (fixed !== source) {
      writeFileSync(file, fixed)
      rewritten++
    }
  }
}

// A registry row whose file the barrel never imports is an experiment that runs in no build and prints in
// no table. Four such rows were found on 2026-08-31 (one of them an L3 that had never executed).
const barrel = readFileSync(
  join(root, 'test', 'experiment', 'all.ts'),
  'utf8',
)
const registryRows = readFileSync(
  join(root, 'test', 'registry.csv'),
  'utf8',
)
  .trim()
  .split('\n')
  .slice(1)

let unimported = 0

for (const row of registryRows) {
  const file = row.slice(row.lastIndexOf(',') + 1).trim()
  const module = file.replace(/^test\//, '@/test/').replace(/\.ts$/, '')

  if (!barrel.includes(`'${module}'`)) {
    unimported++
    console.log(
      `  unimported ${file}  (in registry.csv, not in test/experiment/all.ts)`,
    )
  }
}

console.log(
  `\ncheck:labels  ${checked} labeled experiments, ${contradicted} contradicted 3434 labels (${boxClaims} of them box runs), ${review} held for review, ${unimported} registry rows not in the barrel${commit ? `, ${rewritten} rewritten to 'any'` : ' (pass --commit to rewrite the contradicted ones)'}`,
)

if (unimported > 0) {
  process.exit(1)
}

// --strict gates the build on the contradicted count. Without it the check reports and exits clean, so a
// list under review does not train people to ignore a permanently red check.
if (contradicted > 0 && strict) {
  process.exit(1)
}
