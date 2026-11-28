/**
 * A candidate's bundle: its module and every module it reaches, transpiled
 * and closed over, with nothing outside. It is the only code an isolated
 * context runs, so what a candidate can do is exactly what its bundle holds.
 *
 * Fail-closed, at the moment a candidate is about to run (check:layers is
 * the static first line; this is the line at run time):
 *
 * - every module must resolve to a real file inside this package; a package,
 *   a builtin (node:fs, node:module, worker_threads ...) or a missing file
 *   refuses the bundle;
 * - every module must sit in a candidate folder (solver, operator,
 *   experience, genome, improve, control, and the problem and state
 *   interfaces), never the evaluator, the judge, the sandbox, the benchmark,
 *   the split builder, the substrate, geometry, tool or rule;
 * - a symbolic link anywhere on a module's path refuses it (the real path
 *   must be the path);
 * - a dynamic import or a require with a target that is not a plain string
 *   refuses it.
 *
 * Evaluator side: it reads the disk.
 */

import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

/** this package's root, by its real path */
export const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'))

const BRIDGE = 'code/intelligence/sandbox/bridge.ts'
const PROTOCOL = 'code/intelligence/sandbox/protocol.ts'
const HOST = 'code/intelligence/sandbox/worker-host.ts'

/** Where candidate code may live. */
const CANDIDATE_PREFIXES = [
  'code/intelligence/solver/',
  'code/intelligence/operator/',
  'code/intelligence/experience/',
  'code/intelligence/genome/',
  'code/intelligence/improve/',
  'code/intelligence/control/',
]
const CANDIDATE_FILES = [
  'code/intelligence/problem/problem.ts',
  'code/intelligence/problem/state.ts',
  'code/intelligence/problem/candidate.ts',
]
/** Evaluator-side files inside candidate folders. */
const REFUSED_PREFIXES = ['code/intelligence/improve/judge/']
const REFUSED_FILES = ['code/intelligence/experience/learner/navigation-split.ts']

export type CandidateKind = 'solver' | 'learner' | 'object'

export interface Bundle {
  /** a stable id: module, export and kind */
  id: string
  /** the script text, a function of the shared buffer */
  code: string
  /** every module in it, package-relative */
  modules: string[]
}

export type BundleResult = { ok: true; bundle: Bundle } | { ok: false; reason: string }

function candidateFile(path: string): boolean {
  if (REFUSED_FILES.includes(path) || REFUSED_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return false
  }

  return CANDIDATE_FILES.includes(path) || CANDIDATE_PREFIXES.some(prefix => path.startsWith(prefix))
}

/**
 * Where module files are read: this package, or first a fixture tree laid
 * out like it (the audit probes), whose imports of real modules fall back to
 * this package.
 */
interface Tree { roots: readonly string[] }

/** The full path of a package-relative file in the first root holding it, or null. */
function locate(tree: Tree, path: string): string | null {
  for (const root of tree.roots) {
    const full = join(root, path)

    if (existsSync(full)) {
      return full
    }
  }

  return null
}

/** The file a package-relative target names (extension or index tried), or null. */
function resolveFile(tree: Tree, target: string): string | null {
  const bare = target.replace(/\.ts$/, '')

  for (const candidate of [`${bare}.ts`, `${bare}/index.ts`]) {
    const full = locate(tree, candidate)

    if (full !== null && statSync(full).isFile()) {
      return candidate
    }
  }

  return null
}

/** Refuse a path holding a symbolic link anywhere along it: its real path must be its path. */
function linkFree(tree: Tree, path: string): boolean {
  const full = locate(tree, path)

  if (full === null) {
    return false
  }

  const root = tree.roots.find(candidate => full.startsWith(candidate))!

  return !lstatSync(full).isSymbolicLink() && realpathSync(full) === join(realpathSync(root), path)
}

function resolveSpecifier(tree: Tree, from: string, specifier: string): string | null {
  let target: string | null = null

  if (specifier.startsWith('@/')) {
    target = posix.normalize(specifier.slice(2))
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    target = posix.normalize(posix.join(posix.dirname(from), specifier))
  }

  return target === null || target.startsWith('..') ? null : resolveFile(tree, target)
}

const COMPILER: ts.CompilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
  removeComments: true,
  esModuleInterop: false,
  sourceMap: false,
}

interface Module { path: string; js: string; requires: Map<string, string> }

/** Transpile one module and find what it requires; null with a reason when it cannot be checked. */
function transpile(tree: Tree, path: string, builtins: boolean): { module: Module | null; reason: string | null; targets: string[] } {
  const text = readFileSync(locate(tree, path)!, 'utf8')
  const js = ts.transpileModule(text, { compilerOptions: COMPILER, fileName: path }).outputText
  const requires = new Map<string, string>()
  const targets: string[] = []

  // every require must name a plain string; a dynamic import cannot be closed over
  if (/\bimport\s*\(/.test(js)) {
    return { module: null, reason: `${path} has a dynamic import`, targets }
  }

  const all = [...js.matchAll(/\brequire\s*\(/g)].length
  const literal = [...js.matchAll(/\brequire\s*\(\s*"([^"]+)"\s*\)/g)]

  if (all !== literal.length) {
    return { module: null, reason: `${path} has a require with a target that is not a plain string`, targets }
  }

  for (const match of literal) {
    const specifier = match[1]!

    if (builtins && specifier.startsWith('node:')) {
      continue
    }

    const resolved = resolveSpecifier(tree, path, specifier)

    if (resolved === null) {
      return { module: null, reason: `${path} reaches ${specifier}, which is not a file of this package`, targets }
    }

    requires.set(specifier, resolved)
    targets.push(resolved)
  }

  // every import of the source counts, a type-only or unused one the transpiler drops included: a candidate's
  // modules may name only candidate modules
  for (const reference of ts.preProcessFile(text, true, true).importedFiles) {
    const specifier = reference.fileName

    if (builtins && specifier.startsWith('node:')) {
      continue
    }

    const resolved = resolveSpecifier(tree, path, specifier)

    if (resolved === null) {
      return { module: null, reason: `${path} imports ${specifier}, which is not a file of this package`, targets }
    }

    if (!targets.includes(resolved)) {
      targets.push(resolved)
    }
  }

  return { module: { path, js, requires }, reason: null, targets }
}

/** Every module reached from `entries`, checked by `allowed`; a reason when any is refused. */
function closure(
  tree: Tree,
  entries: readonly string[],
  allowed: (path: string) => boolean,
  builtins: boolean,
): { modules: Module[] } | { reason: string } {
  const seen = new Set<string>()
  const modules: Module[] = []
  const queue = [...entries]

  for (const path of queue) {
    if (seen.has(path)) {
      continue
    }

    seen.add(path)

    if (!allowed(path)) {
      return { reason: `the bundle reaches ${path}, outside the candidate folders` }
    }

    if (!linkFree(tree, path)) {
      return { reason: `${path} is reached through a symbolic link` }
    }

    const { module, reason, targets } = transpile(tree, path, builtins)

    if (module === null) {
      return { reason: reason! }
    }

    modules.push(module)
    queue.push(...targets)
  }

  return { modules }
}

function assemble(modules: readonly Module[], body: string, parameter: string): string {
  const definitions = modules
    .map(module => `${JSON.stringify(module.path)}: function (exports, require, module) {\n${module.js}\n}`)
    .join(',\n')
  const maps = modules.map(module => `${JSON.stringify(module.path)}: ${JSON.stringify(Object.fromEntries(module.requires))}`).join(',\n')

  return `(function (${parameter}) {
'use strict';
var definitions = {${definitions}};
var maps = {${maps}};
var cache = Object.create(null);
function load(path) {
  var hit = cache[path];
  if (hit !== undefined) { return hit.exports; }
  var module = { exports: {} };
  cache[path] = module;
  definitions[path](module.exports, function (specifier) {
    var to = maps[path][specifier];
    if (to === undefined) { return outside(specifier); }
    return load(to);
  }, module);
  return module.exports;
}
${body}
})`
}

const cache = new Map<string, BundleResult>()

/**
 * The bundle of one candidate factory: `module` (package-relative, no
 * extension needed) and its export `name`. `root` reads modules from a
 * fixture tree first (probes of the audits); the sandbox's own two files
 * always come from this package.
 */
export function candidateBundle(module: string, name: string, kind: CandidateKind, root?: string): BundleResult {
  const id = `${root ?? ''}:${module}#${name}#${kind}`
  const known = cache.get(id)

  if (known !== undefined) {
    return known
  }

  const tree: Tree = { roots: root === undefined ? [PACKAGE] : [resolve(root), PACKAGE] }
  const entry = resolveFile(tree, posix.normalize(module.replace(/^@\//, '')))
  let result: BundleResult

  if (entry === null) {
    result = { ok: false, reason: `no candidate module ${module}` }
  } else if (root !== undefined && (locate(tree, BRIDGE) !== join(PACKAGE, BRIDGE) || locate(tree, PROTOCOL) !== join(PACKAGE, PROTOCOL))) {
    result = { ok: false, reason: 'a fixture tree may not replace the sandbox bridge' }
  } else {
    const found = closure(tree, [BRIDGE, entry], path => path === BRIDGE || path === PROTOCOL || candidateFile(path), false)

    if ('reason' in found) {
      result = { ok: false, reason: found.reason }
    } else {
      const body = `function outside(specifier) { throw new Error('no module ' + specifier); }
load(${JSON.stringify(BRIDGE)}).install(buffer, function () {
  var factory = load(${JSON.stringify(entry)})[${JSON.stringify(name)}];
  if (typeof factory !== 'function') { throw new Error(${JSON.stringify(`${module} exports no function ${name}`)}); }
  return factory;
});`

      result = { ok: true, bundle: { id, code: assemble(found.modules, body, 'buffer'), modules: found.modules.map(m => m.path) } }
    }
  }

  cache.set(id, result)

  return result
}

/** The worker host, bundled with the protocol; it alone may require node builtins (vm, worker_threads). */
export function hostScript(): string {
  const found = closure({ roots: [PACKAGE] }, [HOST], path => path === HOST || path === PROTOCOL, true)

  if ('reason' in found) {
    throw new Error(`sandbox: the worker host cannot be bundled: ${found.reason}`)
  }

  return `${assemble(found.modules, `function outside(specifier) { return realRequire(specifier); }\nload(${JSON.stringify(HOST)});`, 'realRequire')}(require);`
}
