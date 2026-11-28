/**
 * check:layers - the lab layers import strictly downward, and no candidate
 * reaches what it is graded by or the world it must learn through the
 * meter. Fail-closed. This is the static first line; at run time every
 * candidate runs isolated, from a bundle the sandbox refuses when it reaches
 * past the candidate folders (code/intelligence/sandbox/bundle.ts).
 *
 *   layer 1  simulation core    code/{substrate,tone,rule,measure,check,tool,proof}
 *   layer 2  computation lab    code/compute/lab, code/compute/quantum
 *   layer 3  intelligence lab   code/intelligence
 *
 * Rules:
 *
 * 1. Layer 1 never imports layers 2 or 3; layer 2 never imports layer 3.
 * 2. Candidates (code/intelligence/{solver,operator,experience,genome,
 *    improve,control}, except improve/judge and the split builder) never
 *    reach, through any chain, the evaluator, the judge, the sandbox, the
 *    benchmark (its hop-distance oracle included), the split builder, the
 *    substrate, geometry, tool, rule, the computation labs, the `@/code`
 *    barrel, or any node builtin (audit 2, J1: a solver rebuilding the world
 *    and the oracle is refused like a learner).
 * 3. Learners and discoverers (experience/learner, operator/discovery) also
 *    never reach the improve loop.
 * 4. An import whose target cannot be resolved to a file, and a dynamic
 *    import or require whose target is not a plain string literal, are
 *    violations in every layer: what cannot be read cannot be checked.
 *    Calls are found in the TypeScript syntax tree, never by line prefix, so
 *    code after a comment on the same line is read.
 * 5. Candidate files may not build code from strings or reach the runtime
 *    behind the module system: any `eval` (direct or not), `Function` called
 *    or constructed, a `.constructor(...)` call, `getBuiltinModule`,
 *    `process.binding`, `_linkedBinding` or `dlopen`.
 * 6. A symbolic link under code/ is a violation, and so is an import that
 *    resolves through one: the path a rule checks must be the file that runs.
 *
 * Imports are resolved for real: `@/` and relative specifiers are
 * normalized (./ and ../ collapse), extensions and index files are tried,
 * and rules 2 and 3 follow the whole import graph (a barrel that re-exports
 * the substrate is the substrate). Every import form counts: static,
 * type-only, side-effect, re-export, dynamic `import('...')`, `require('...')`.
 *
 * Before scanning, the checker runs on an in-memory tree with violations of
 * every kind (the bypasses of both 2026-11-26 audits among them) and exits 1
 * unless it flags exactly the files it should, so a broken resolver can never
 * pass the real tree.
 *
 * Usage:
 *   pnpm check:layers                 scan this package's code/
 *   pnpm check:layers --root <dir>    scan <dir>/code/ instead (a fixture tree); imports
 *                                     that are not in the fixture resolve against this package
 *
 * Exit 0 clean, 1 on any violation, a failed self-test, or a tree with no
 * layer 1 files (nothing scanned is never a pass).
 */

import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { dirname, join, posix, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CORE = ['substrate', 'tone', 'rule', 'measure', 'check', 'tool', 'proof'].map(name => `code/${name}/`)
const COMPUTATION_LAB = 'code/compute/lab/'
const QUANTUM_LAB = 'code/compute/quantum/'
const INTELLIGENCE_LAB = 'code/intelligence/'
const EVALUATOR = 'code/intelligence/problem/evaluate'
const JUDGE = 'code/intelligence/improve/judge/'
const SANDBOX = 'code/intelligence/sandbox/'
const SPLIT = 'code/intelligence/experience/learner/navigation-split'
const BARREL = 'code/index'

const CANDIDATES = ['solver', 'operator', 'experience', 'genome', 'improve', 'control'].map(name => `code/intelligence/${name}/`)
const LEARNERS = ['code/intelligence/experience/learner/', 'code/intelligence/operator/discovery/']

/** Evaluator-side files inside candidate folders: the split builder and the judge. */
function exempt(path: string): boolean {
  return stripExtension(path) === SPLIT || path.startsWith(JUDGE)
}

/** A target a rule forbids: a directory prefix, one module (matched without extension), or any builtin. */
interface Forbidden { prefix?: string; module?: string; builtins?: boolean; name: string }

const CANDIDATE_FORBIDDEN: Forbidden[] = [
  { module: EVALUATOR, name: 'the evaluator' },
  { prefix: JUDGE, name: 'the judge' },
  { prefix: SANDBOX, name: 'the sandbox' },
  { prefix: 'code/intelligence/benchmark/', name: 'the benchmark (its oracle included)' },
  { module: SPLIT, name: 'the split builder' },
  { prefix: 'code/substrate/', name: 'the substrate' },
  { prefix: 'code/geometry/', name: 'the geometry' },
  { prefix: 'code/tool/', name: 'code/tool (graph, mesh, substrate)' },
  { prefix: 'code/rule/', name: 'the rules' },
  { prefix: COMPUTATION_LAB, name: 'the computation lab' },
  { prefix: QUANTUM_LAB, name: 'the quantum lab' },
  { module: BARREL, name: 'the @/code barrel' },
  { builtins: true, name: 'a node builtin' },
]

const LEARNER_FORBIDDEN: Forbidden[] = [{ prefix: 'code/intelligence/improve/', name: 'the improve loop' }]

type Layer = 1 | 2 | 3

const LAYER_NAME: Record<Layer, string> = {
  1: 'simulation core',
  2: 'computation lab',
  3: 'intelligence lab',
}

function layerOf(path: string): Layer | null {
  if (CORE.some(prefix => path.startsWith(prefix))) {
    return 1
  }
  if (path.startsWith(COMPUTATION_LAB) || path.startsWith(QUANTUM_LAB)) {
    return 2
  }
  if (path.startsWith(INTELLIGENCE_LAB)) {
    return 3
  }
  return null
}

function stripExtension(path: string): string {
  return path.replace(/\.(d\.ts|ts|tsx|mts|cts|js|mjs|cjs|json)$/, '')
}

/** Source access: a package-relative posix path to its text (null when absent) and whether it is a symbolic link. */
export interface Tree {
  read: (path: string) => string | null
  isLink: (path: string) => boolean
}

const EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.d.ts', '.js', '.mjs', '.cjs', '.json']

/** The file an import names, tried with each extension and as a directory index, or null. */
function resolveFile(tree: Tree, target: string): string | null {
  const bare = stripExtension(target)
  const candidates = [
    target,
    ...EXTENSIONS.map(extension => `${bare}${extension}`),
    ...EXTENSIONS.map(extension => `${target}/index${extension}`),
  ]
  for (const candidate of candidates) {
    if (tree.read(candidate) !== null) {
      return candidate
    }
  }
  return null
}

type Resolved =
  | { kind: 'file'; path: string }
  | { kind: 'missing'; path: string }
  | { kind: 'builtin'; name: string }
  | { kind: 'package' }

const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'crypto', 'dgram', 'dns', 'events', 'fs', 'fs/promises', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'readline', 'repl', 'stream',
  'timers', 'tls', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
])

/** Resolve one specifier from a package-relative file. */
function resolveSpecifier(tree: Tree, fromPath: string, specifier: string): Resolved {
  let target: string | null = null
  if (specifier.startsWith('@/')) {
    target = posix.normalize(specifier.slice(2))
  } else if (specifier === '.' || specifier === '..' || specifier.startsWith('./') || specifier.startsWith('../')) {
    target = posix.normalize(posix.join(posix.dirname(fromPath), specifier))
  }
  if (target === null) {
    const name = specifier.replace(/^node:/, '')
    return NODE_BUILTINS.has(name) || specifier.startsWith('node:') ? { kind: 'builtin', name } : { kind: 'package' }
  }
  target = target.replace(/\/$/, '')
  const file = resolveFile(tree, target)
  return file === null ? { kind: 'missing', path: target } : { kind: 'file', path: file }
}

export interface Violation {
  file: string
  line: string
  reason: string
}

interface Scan {
  /** every import specifier, any form */
  imports: string[]
  /** dynamic imports and requires whose target is not a plain string */
  uncheckable: string[]
  /** code from strings or the runtime behind the module system */
  escapes: string[]
}

const isPlainString = (node: ts.Node | undefined): boolean =>
  node !== undefined && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))

const ESCAPE_NAMES = new Set(['getBuiltinModule', '_linkedBinding', 'dlopen'])

/** Read a file's imports, unreadable calls and escape shapes from its syntax tree. */
export function scanText(path: string, text: string): Scan {
  const imports = ts.preProcessFile(text, true, true).importedFiles.map(reference => reference.fileName)
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const uncheckable: string[] = []
  const escapes: string[] = []
  const show = (node: ts.Node): string => node.getText(source).replace(/\s+/g, ' ').slice(0, 80)

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const isImport = callee.kind === ts.SyntaxKind.ImportKeyword
      const isRequire = ts.isIdentifier(callee) && callee.text === 'require'

      if ((isImport || isRequire) && !isPlainString(node.arguments[0])) {
        uncheckable.push(show(node))
      }

      if (ts.isIdentifier(callee) && callee.text === 'Function') {
        escapes.push(`Function called: ${show(node)}`)
      }

    }

    // a function's constructor is the Function constructor: reading it at all is the route, called now or later
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'constructor') {
      escapes.push(`a .constructor read: ${show(node)}`)
    }

    if (ts.isElementAccessExpression(node) && isPlainString(node.argumentExpression) && (node.argumentExpression as ts.StringLiteral).text === 'constructor') {
      escapes.push(`a ['constructor'] read: ${show(node)}`)
    }

    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Function') {
      escapes.push(`new Function: ${show(node)}`)
    }

    if (ts.isIdentifier(node)) {
      if (node.text === 'eval') {
        escapes.push(`eval: ${show(node.parent)}`)
      }

      if (ESCAPE_NAMES.has(node.text)) {
        escapes.push(`${node.text}: ${show(node.parent)}`)
      }

      // the process object holds the runtime behind the module system (binding, getBuiltinModule, dlopen)
      if (node.text === 'process' && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)) {
        escapes.push(`process: ${show(node.parent)}`)
      }
    }

    if (ts.isStringLiteral(node) && (ESCAPE_NAMES.has(node.text) || node.text === 'eval' || node.text === 'binding')) {
      const parent = node.parent

      if (ts.isElementAccessExpression(parent)) {
        escapes.push(`a computed ${node.text}: ${show(parent)}`)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(source)

  return { imports, uncheckable, escapes }
}

const scans = new Map<string, Scan>()

function scanOf(tree: Tree, path: string): Scan | null {
  const known = scans.get(path)
  if (known !== undefined) {
    return known
  }
  const text = tree.read(path)
  if (text === null) {
    return null
  }
  const scan = scanText(path, text)
  scans.set(path, scan)
  return scan
}

function forbids(rule: Forbidden, reached: Resolved): boolean {
  if (reached.kind === 'builtin') {
    return rule.builtins === true
  }
  if (reached.kind !== 'file' && reached.kind !== 'missing') {
    return false
  }
  const path = reached.path
  if (rule.prefix !== undefined) {
    return path.startsWith(rule.prefix) || `${stripExtension(path)}/` === rule.prefix
  }
  if (rule.module !== undefined) {
    const bare = stripExtension(path)
    return bare === rule.module || bare === `${rule.module}/index`
  }
  return false
}

/**
 * The first forbidden target any chain of imports from `start` reaches, with
 * the chain, or null. A forbidden file is reported, never walked through; a
 * file reached through a symbolic link is forbidden.
 */
function reachForbidden(tree: Tree, start: string, rules: readonly Forbidden[]): { rule: Forbidden; chain: string[] } | null {
  const seen = new Set<string>([start])
  const queue: { path: string; chain: string[] }[] = [{ path: start, chain: [start] }]
  const linked: Forbidden = { name: 'a file through a symbolic link' }
  for (const { path, chain } of queue) {
    const scan = scanOf(tree, path)
    if (scan === null) {
      continue
    }
    for (const specifier of scan.imports) {
      const reached = resolveSpecifier(tree, path, specifier)
      const label = reached.kind === 'builtin' ? `node:${reached.name}` : reached.kind === 'package' ? specifier : reached.path
      const rule = rules.find(candidate => forbids(candidate, reached))
      if (rule !== undefined) {
        return { rule, chain: [...chain, label] }
      }
      if (reached.kind === 'file' && tree.isLink(reached.path)) {
        return { rule: linked, chain: [...chain, label] }
      }
      if (reached.kind === 'file' && !seen.has(reached.path)) {
        seen.add(reached.path)
        queue.push({ path: reached.path, chain: [...chain, reached.path] })
      }
    }
  }
  return null
}

/** Check one file, `path` package-relative posix, reading its imports' sources through `tree`. */
export function checkFile(tree: Tree, path: string): Violation[] {
  const from = layerOf(path)
  const text = tree.read(path)
  if (from === null || text === null) {
    return []
  }
  const violations: Violation[] = []
  if (tree.isLink(path)) {
    violations.push({ file: path, line: '(symbolic link)', reason: 'a symbolic link under code/: the checked path must be the file that runs' })
  }
  const scan = scanOf(tree, path)!
  for (const specifier of scan.imports) {
    const reached = resolveSpecifier(tree, path, specifier)
    if (reached.kind === 'missing') {
      violations.push({ file: path, line: specifier, reason: 'an import that resolves to no file cannot be checked' })
      continue
    }
    if (reached.kind !== 'file') {
      continue
    }
    const to = layerOf(reached.path)
    if (to !== null && to > from) {
      violations.push({
        file: path,
        line: specifier,
        reason: `layer ${from} (${LAYER_NAME[from]}) imports layer ${to} (${LAYER_NAME[to]})`,
      })
    }
  }
  for (const line of scan.uncheckable) {
    violations.push({ file: path, line, reason: 'dynamic import or require with a non-literal target cannot be checked' })
  }
  if (exempt(path)) {
    return violations
  }
  const candidate = CANDIDATES.some(prefix => path.startsWith(prefix))
  if (candidate) {
    for (const line of scan.escapes) {
      violations.push({ file: path, line, reason: 'a candidate may not build code from strings or reach the runtime behind the module system' })
    }
  }
  const rules: [boolean, Forbidden[], string][] = [
    [candidate, CANDIDATE_FORBIDDEN, 'a candidate module reaches, instead of the meter,'],
    [LEARNERS.some(prefix => path.startsWith(prefix)), LEARNER_FORBIDDEN, 'a learner or discoverer reaches'],
  ]
  for (const [applies, forbidden, what] of rules) {
    if (!applies) {
      continue
    }
    const hit = reachForbidden(tree, path, forbidden)
    if (hit !== null) {
      violations.push({ file: path, line: hit.chain.join(' -> '), reason: `${what} ${hit.rule.name}` })
    }
  }
  return violations
}

// ---------------------------------------------------------------- self-test

/** Files the fixture tree needs to resolve against; none is expected to be flagged. */
const SUPPORT: [string, string][] = [
  ['code/index.ts', "export * from './tool/graph'\nexport * from './substrate/lab-geometry'\n"],
  ['code/tool/graph.ts', 'export const graph = 1\n'],
  ['code/tool/mesh.ts', 'export const mesh = 1\n'],
  ['code/tool/substrate.ts', "export * from '../substrate/lab-geometry'\n"],
  ['code/substrate/lab-geometry.ts', 'export const labGeometry = 1\n'],
  ['code/geometry/tiling.ts', 'export const tile = 1\n'],
  ['code/rule/partitioned-pair.ts', 'export const r = 1\n'],
  ['code/compute/lab/harness.ts', 'export const h = 1\n'],
  ['code/compute/lab/gates.ts', 'export const z = 1\n'],
  ['code/compute/quantum/gate-set.ts', "import { b } from '@/code/rule/partitioned-pair'\nexport const q = b\n"],
  ['code/intelligence/index.ts', 'export const i = 1\n'],
  ['code/intelligence/problem/problem.ts', 'export type Problem = 1\n'],
  ['code/intelligence/problem/evaluate.ts', "import { compose } from '@/code/intelligence/operator/operator'\nexport const evaluate = compose\n"],
  ['code/intelligence/sandbox/channel.ts', "import { Worker } from 'node:worker_threads'\nexport const c = Worker\n"],
  ['code/intelligence/solver/solver.ts', "import type { Problem } from '../problem/problem'\nexport type Solver = Problem\n"],
  ['code/intelligence/operator/operator.ts', 'export const compose = 1\n'],
  ['code/intelligence/experience/experience.ts', "import type { Solver } from '@/code/intelligence/solver/solver'\nexport type E = Solver\n"],
  ['code/intelligence/benchmark/navigation/maze.ts', "import { evaluate } from '@/code/intelligence/problem/evaluate'\nexport const maze = evaluate\n"],
  ['code/intelligence/benchmark/navigation/mesh-distance.ts', 'export const hopDistances = 1\n'],
  ['code/intelligence/experience/learner/navigation-split.ts', "import { maze } from '@/code/intelligence/benchmark/navigation/maze'\nimport { evaluate } from '@/code/intelligence/problem/evaluate'\nimport type { G } from '@/code/substrate/lab-geometry'\n"],
  ['code/intelligence/improve/judge/genome-judge.ts', "import { evaluate } from '@/code/intelligence/problem/evaluate'\nimport { maze } from '@/code/intelligence/benchmark/navigation/maze'\n"],
]

/** Paths of the self-test tree that are symbolic links (a link to the evaluator, as the second audit planted). */
const LINKS = new Set(['code/intelligence/solver/ev.ts'])

/** [path, source, should the checker flag it]. */
const FIXTURE: [string, string, boolean][] = [
  // layer direction
  ['code/rule/a.ts', "import { x } from '@/code/intelligence/problem/problem'\n", true],
  ['code/tone/b.ts', "import type { Y } from '../compute/lab/harness'\n", true],
  ['code/measure/c.ts', "export { z } from '@/code/compute/lab/gates.ts'\n", true],
  ['code/tool/d.ts', "const m = await import('@/code/intelligence/solver/solver')\n", true],
  ['code/check/e.ts', "const m = require('../intelligence')\n", true],
  ['code/substrate/f.ts', 'const m = await import(name)\n', true],
  ['code/compute/lab/g.ts', "import '@/code/intelligence/benchmark/navigation/maze'\n", true],
  ['code/rule/ok.ts', "import { y } from '@/code/tool/mesh'\nimport z from 'lodash'\n", false],
  ['code/compute/lab/ok.ts', "import { r } from '@/code/rule/partitioned-pair'\n", false],
  ['code/compute/railway.ts', "import { e } from '@/code/intelligence/problem/evaluate'\n", false],
  ['code/rule/reads-quantum.ts', "import { q } from '@/code/compute/quantum/gate-set'\n", true],
  ['code/compute/quantum/reads-intelligence.ts', "import type { Solver } from '@/code/intelligence/solver/solver'\n", true],
  ['code/compute/quantum/ok.ts', "import { q } from './gate-set'\nimport { h } from '@/code/compute/lab/harness'\n", false],
  ['code/rule/missing.ts', "import { gone } from '@/code/rule/no-such-file'\n", true],
  ['code/tool/template.ts', 'const m = await import(`@/code/${name}`)\n', true],
  ['code/tool/ok-template.ts', 'const m = await import(`@/code/tool/mesh`)\n', false],
  // candidates never reach the evaluator
  ['code/intelligence/solver/h.ts', "import { evaluate } from '@/code/intelligence/problem/evaluate'\n", true],
  ['code/intelligence/genome/i.ts', "import { evaluate } from '../problem/evaluate'\n", true],
  ['code/intelligence/solver/ok.ts', "import type { Problem } from '@/code/intelligence/problem/problem'\n", false],
  ['code/intelligence/solver/evaldot.ts', "import { evaluate } from '@/code/intelligence/solver/../problem/evaluate'\n", true],
  ['code/intelligence/solver/helper-reads-split.ts', "import { x } from '../experience/learner/navigation-split'\n", true],
  ['code/intelligence/solver/via-split.ts', "import { h } from './helper-reads-split'\n", true],
  ['code/intelligence/operator/via-benchmark.ts', "import { maze } from '@/code/intelligence/benchmark/navigation/maze'\n", true],
  ['code/intelligence/control/reads-sandbox.ts', "import { c } from '@/code/intelligence/sandbox/channel'\n", true],
  ['code/intelligence/control/ok.ts', "import type { Solver } from '@/code/intelligence/solver/solver'\n", false],
  // learners and discoverers learn through the meter only
  ['code/intelligence/experience/learner/j.ts', "import { labGeometry } from '@/code/substrate/lab-geometry'\n", true],
  ['code/intelligence/operator/discovery/k.ts', "import { tile } from '../../../geometry/tiling'\n", true],
  ['code/intelligence/operator/discovery/l.ts', "import type { Wall } from '@/code/intelligence/benchmark/navigation/maze'\n", true],
  ['code/intelligence/experience/learner/m.ts', "import { learningEnvironments } from './navigation-split'\n", true],
  ['code/intelligence/operator/discovery/n.ts', "const g = await import('@/code/tool/graph')\n", true],
  ['code/intelligence/experience/learner/barrel.ts', "import { labGeometry } from '@/code'\n", true],
  ['code/intelligence/experience/learner/dot.ts', "import { learningEnvironments } from '@/code/intelligence/experience/learner/./navigation-split'\n", true],
  ['code/intelligence/experience/learner/fs.ts', "import { readFileSync } from 'node:fs'\n", true],
  ['code/intelligence/experience/learner/rule.ts', "import { pairRulesFromFibers } from '@/code/rule/partitioned-pair'\n", true],
  ['code/intelligence/operator/discovery/tool.ts', "import { substrate } from '@/code/tool/substrate'\nimport { mesh } from '@/code/tool/mesh'\n", true],
  ['code/intelligence/operator/discovery/dyn.ts', "const name = '@/code/substrate/lab-geometry'\nconst m = await import(name)\n", true],
  ['code/intelligence/operator/discovery/evals.ts', "const f = new Function('return 1')\n", true],
  ['code/intelligence/experience/learner/child.ts', "import { exec } from 'child_process'\n", true],
  ['code/intelligence/experience/learner/reads-improve.ts', "import type { E } from '@/code/intelligence/improve/evaluation'\n", true],
  ['code/intelligence/operator/discovery/ok.ts', "import { compose } from '@/code/intelligence/operator/operator'\nimport type { E } from '@/code/intelligence/experience/experience'\n", false],
  // the genome and the improve loop: only improve/judge is evaluator side
  ['code/intelligence/improve/evaluator.ts', "import { evaluate } from '@/code/intelligence/problem/evaluate'\n", true],
  ['code/intelligence/improve/reads-judge.ts', "import { genomeJudge } from './judge/genome-judge'\n", true],
  ['code/intelligence/genome/reads-judge.ts', "import { genomeJudge } from '@/code/intelligence/improve/judge/genome-judge'\n", true],
  ['code/intelligence/genome/benchmark.ts', "import type { M } from '../benchmark/navigation/maze'\n", true],
  ['code/intelligence/improve/split.ts', "import { learningEnvironments } from '../experience/learner/navigation-split'\n", true],
  ['code/intelligence/genome/substrate.ts', "import type { G } from '@/code/substrate/lab-geometry'\n", true],
  ['code/intelligence/improve/geometry.ts', "import { tile } from '@/code/geometry/tiling'\n", true],
  ['code/intelligence/genome/tool.ts', "import { mesh } from '@/code/tool/mesh'\n", true],
  ['code/intelligence/improve/barrel.ts', "export * from '@/code'\n", true],
  ['code/intelligence/genome/fs.ts', "import { readFileSync } from 'fs'\n", true],
  ['code/intelligence/improve/child.ts', "import { spawn } from 'node:child_process'\n", true],
  ['code/intelligence/genome/module.ts', "import { createRequire } from 'node:module'\n", true],
  ['code/intelligence/improve/worker.ts', "import { Worker } from 'node:worker_threads'\n", true],
  ['code/intelligence/genome/ok.ts', "import type { Solver } from '@/code/intelligence/solver/solver'\nimport { compose } from '../operator/operator'\n", false],
  // the second audit's bypasses (audit-levels-1-3-improve.md, J1 and J2)
  ['code/intelligence/experience/learner/builtin.ts', "const fs = (process as any).getBuiltinModule('node:fs')\nexport const text = fs.readFileSync('x', 'utf8')\n", true],
  ['code/intelligence/operator/discovery/comment.ts', "const name = '@/code/substrate/lab-geometry'\n/**/ const m = await import(name)\nexport { m }\n", true],
  ['code/intelligence/genome/indirect-eval.ts', "const run = (0, eval)\nexport const x = run('1 + 1')\n", true],
  ['code/intelligence/improve/ctor.ts', "const F = (() => 0).constructor as FunctionConstructor\nexport const y = F('return 1')()\n", true],
  ['code/intelligence/solver/ev.ts', "import { compose } from '@/code/intelligence/operator/operator'\nexport const evaluate = compose\n", true],
  ['code/intelligence/solver/uses-ev.ts', "import { evaluate } from './ev'\nexport { evaluate }\n", true],
  ['code/intelligence/solver/oracle.ts', "import { hopDistances } from '@/code/intelligence/benchmark/navigation/mesh-distance'\nimport { labGeometry } from '@/code/substrate/lab-geometry'\nexport const s = [hopDistances, labGeometry]\n", true],
  ['code/intelligence/solver/template.ts', 'const m = await import(`@/code/intelligence/problem/evaluate`)\nexport { m }\n', true],
  ['code/intelligence/solver/binding.ts', "export const b = (process as any).binding('fs')\n", true],
  ['code/intelligence/solver/computed.ts', "export const g = (process as any)['getBuiltinModule']('node:fs')\n", true],
  ['code/intelligence/solver/ok-calls.ts', "export const n = [1].map(x => x + 1)\nexport const s = 'eval is a word'\n", false],
]

function selfTest(): string[] {
  const files = new Map<string, string>([...SUPPORT, ...FIXTURE.map(([path, text]) => [path, text] as [string, string])])
  const tree: Tree = { read: path => files.get(path) ?? null, isLink: path => LINKS.has(path) }
  const failures: string[] = []
  scans.clear()
  for (const [path] of SUPPORT) {
    const found = checkFile(tree, path)
    if (found.length > 0) {
      failures.push(`self-test support ${path}: flagged (${found[0]!.reason})`)
    }
  }
  for (const [path, , expected] of FIXTURE) {
    const found = checkFile(tree, path)
    if ((found.length > 0) !== expected) {
      failures.push(`self-test ${path}: expected ${expected ? 'a violation' : 'none'}, found ${found.length}${found[0] ? ` (${found[0].reason})` : ''}`)
    }
  }
  scans.clear()
  return failures
}

// ---------------------------------------------------------------- the real tree

/** Every source file under `directory`, symbolic links listed too (never followed). */
function walk(directory: string, out: string[]): void {
  for (const name of readdirSync(directory).sort()) {
    if (name === 'node_modules' || name === '.lake' || name === 'target') {
      continue
    }
    const full = join(directory, name)
    const stat = lstatSync(full)
    if (stat.isSymbolicLink()) {
      out.push(full)
    } else if (stat.isDirectory()) {
      walk(full, out)
    } else if (/\.(ts|tsx|mts|cts|js|mjs|cjs)$/.test(name)) {
      out.push(full)
    }
  }
}

/** Read from the scanned root first, then this package (so a fixture's imports of real modules resolve). */
function diskTree(roots: readonly string[]): Tree {
  const cache = new Map<string, { text: string | null; link: boolean }>()
  const find = (path: string): { text: string | null; link: boolean } => {
    const known = cache.get(path)
    if (known !== undefined) {
      return known
    }
    let found: { text: string | null; link: boolean } = { text: null, link: false }
    for (const root of roots) {
      const full = join(root, path)
      if (existsSync(full)) {
        const real = realpathSync(full)
        const link = lstatSync(full).isSymbolicLink() || real !== join(realpathSync(root), path)
        if (lstatSync(real).isFile()) {
          found = { text: readFileSync(full, 'utf8'), link }
          break
        }
      }
    }
    cache.set(path, found)
    return found
  }
  return { read: path => find(path).text, isLink: path => find(path).link }
}

function main(): number {
  const arguments_ = process.argv.slice(2)
  const rootIndex = arguments_.indexOf('--root')
  if (rootIndex !== -1 && arguments_[rootIndex + 1] === undefined) {
    console.error('check:layers: --root needs a directory')
    return 1
  }
  const root = rootIndex === -1 ? PACKAGE : resolve(arguments_[rootIndex + 1]!)

  const failures = selfTest()
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure)
    }
    console.error('check:layers: FAIL, the self-test did not flag exactly the fixture violations')
    return 1
  }

  const code = join(root, 'code')
  if (!existsSync(code)) {
    console.error(`check:layers: FAIL, no code/ under ${root}`)
    return 1
  }
  const files: string[] = []
  walk(code, files)
  const tree = diskTree(root === PACKAGE ? [PACKAGE] : [root, PACKAGE])
  const counts: Record<Layer, number> = { 1: 0, 2: 0, 3: 0 }
  const violations: Violation[] = []
  for (const file of files) {
    const path = relative(root, file).split(sep).join('/')
    const layer = layerOf(path)
    if (layer !== null) {
      counts[layer]++
    }
    violations.push(...checkFile(tree, path))
  }
  if (counts[1] === 0) {
    console.error(`check:layers: FAIL, no layer 1 files found under ${code}`)
    return 1
  }

  const summary = `layer 1: ${counts[1]} files, layer 2: ${counts[2]}, layer 3: ${counts[3]}`
  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`${violation.file}  ${violation.line}\n  ${violation.reason}`)
    }
    const flagged = new Set(violations.map(violation => violation.file)).size
    console.error(`check:layers: FAIL, ${violations.length} violation(s) in ${flagged} file(s) (${summary})`)
    return 1
  }
  console.log(`check:layers: ok, self-test ${FIXTURE.length + SUPPORT.length}/${FIXTURE.length + SUPPORT.length}, ${summary}, 0 violations`)
  return 0
}

process.exit(main())
