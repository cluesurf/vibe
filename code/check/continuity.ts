// The static continuity audit (E-MTH-0025): does any RULE reach for a real number? Since 2026-09-26 the rule
// is that the base uses only finite discrete data: trits, integers, finite groups, cycling numbers (an
// integer mod N), exact algebraic integers held as integers. No floats, no sin, cos or sqrt, no angles or
// real parameters, and never a fractional coupling rounded. A coupling is 1/Q, paid by an integer counter
// that takes the integer drive and emits one unit per threshold Q crossed, keeping the rest: carry, never
// round. Measurement may use reals, so code/measure/** is exempt, but a rule may not import from it.
//
// This is a text scan of code lines (a line whose first non-space characters are //, * or /* is skipped,
// and a trailing // comment and the insides of string literals are blanked), modeled on the determinism
// audit code/check/determinism.ts. What it finds, per line:
// - trig             Math.sin, cos, tan and their inverses and hyperbolics
// - transcendental   Math.sqrt, cbrt, exp, log, pow, hypot, a real constant (Math.PI, Math.E, ...), or a
//                    power with a fractional exponent
// - rounding         Math.round or fround, or a floor, ceil or trunc whose argument holds a real (a
//                    fractional literal, a real function or constant, x % 1, a named Weyl rate)
// - float-literal    a numeric literal with a fractional part or a negative exponent
// - float-array      a Float32Array or Float64Array
// - division         the / operator outside a floor of integers, which in this language yields a real
// - angle            an identifier named for a real angle: radian(s), theta
// - measure-import   an import from code/measure (the exempt layer), which puts measurement in the step
// - integer-division (reported, not an offense) a floor, ceil or trunc of a quotient with no real in it, such
//                    as the digit read Math.floor(k / 3). A text scan cannot tell whether both operands
//                    are integers, or whether the remainder is kept (a carry) or dropped (a rounding), so a
//                    reader confirms it. A rule that carries can write the quotient as a shift or a counter
//                    mod Q, which is not flagged at all
// Integer-safe calls are not findings: Math.abs, min, max, sign, imul, clz32, and bit operations.
//
// What it cannot see: a real reached through a helper outside the scanned files (the import closure is
// followed, so a helper under code/ is scanned), a division hidden in a template string, or a float that
// arrives as an argument. It reads text, not values.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

export type ContinuityKind = 'trig' | 'transcendental' | 'rounding' | 'float-literal' | 'float-array' | 'division' | 'angle' | 'measure-import' | 'integer-division'

export const CONTINUITY_KINDS: readonly ContinuityKind[] = ['trig', 'transcendental', 'rounding', 'float-literal', 'float-array', 'division', 'angle', 'measure-import', 'integer-division']

// every kind but integer-division is an offense: a floor, ceil or trunc of a quotient with no real in its
// argument is reported, for a reader to confirm both operands are integers, and not counted
export const CONTINUITY_OFFENSES: readonly ContinuityKind[] = CONTINUITY_KINDS.filter(k => k !== 'integer-division')

export type ContinuityFinding = {
  file: string
  line: number
  kind: ContinuityKind
  text: string
}

// the patterns, assembled from pieces so this file reads as clean as it can when it scans itself
const M = ['\\bMa', 'th\\.'].join('')
const TRIG = new RegExp(`${M}(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh)\\s*\\(`)
const TRANSCENDENTAL = [
  new RegExp(`${M}(sqrt|cbrt|exp|expm1|log|log2|log10|log1p|pow|hypot)\\s*\\(`),
  new RegExp(`${M}(PI|E|SQRT2|SQRT1_2|LN2|LN10|LOG2E|LOG10E)\\b`),
  /\*\*\s*\(?\s*-?\d*\.\d/,
  /\*\*\s*\(?\s*-?\d+\s*\/\s*\d+/,
]
const ALWAYS_ROUNDING = new RegExp(`${M}(round|fround)\\s*\\(`)
const QUOTIENT = new RegExp(`${M}(floor|ceil|trunc)\\s*\\(`, 'g')
// an argument that holds a real: a fractional literal, a real function or constant, the fractional-part
// idiom x % 1, or a named irrational (the Weyl rates)
const REAL_ARGUMENT = [
  /(?<![\w.$])\d+\.\d+|(?<![\w.$])\.\d+|\d+e-\d+/i,
  new RegExp(`${M}(sin|cos|tan|asin|acos|atan|atan2|sqrt|cbrt|exp|log|log2|log10|pow|hypot|PI|E|SQRT2)\\b`),
  /%\s*1\s*\)/,
  /\b(GOLDEN|SILVER|PHI|PLASTIC|TAU|PI)\b/,
]

// the arguments of every floor, ceil or trunc call on the line, and the line with those calls cut out
function quotients(line: string): { args: string[]; rest: string } {
  const args: string[] = []
  let rest = ''
  let at = 0

  QUOTIENT.lastIndex = 0

  for (let m = QUOTIENT.exec(line); m; m = QUOTIENT.exec(line)) {
    const open = m.index + m[0].length - 1
    let depth = 0
    let close = open

    for (let i = open; i < line.length; i++) {
      depth += line[i] === '(' ? 1 : line[i] === ')' ? -1 : 0

      if (depth === 0) {
        close = i

        break
      }
    }

    args.push(line.slice(open + 1, close))
    rest += `${line.slice(at, m.index)} q `
    at = close + 1
    QUOTIENT.lastIndex = close + 1
  }

  return { args, rest: rest + line.slice(at) }
}
const FLOAT_LITERAL = [/(?<![\w.$])\d+\.\d+(e[+-]?\d+)?(?![\w.])/i, /(?<![\w.$])\.\d+(?![\w.])/, /(?<![\w.$])\d+e-\d+(?![\w.])/i]
const FLOAT_ARRAY = new RegExp(['\\bFloat', '(32|64)Array\\b'].join(''))
// a / that is not a comment opener: the character before is not / or *, the character after is not / or *
const DIVISION = /(^|[^/*])\/(?![/*])/
// (not "degree", which in this package is a graph's degree, and not "angle", which photon-links uses for its
// integer Z_N link variable)
const ANGLE = /\b(radians?|theta|toRadians|deg2rad|degToRad)\b/i
const MEASURE_IMPORT = [/from\s+['"]@\/code\/measure\//, /import\s*\(\s*['"]@\/code\/measure\//, /from\s+['"](\.\.\/)+measure\//]

// blank the insides of string and template literals and cut a trailing // comment, so neither is read as code
export function codeOf(line: string): string {
  let out = ''
  let quote = ''

  for (let i = 0; i < line.length; i++) {
    const c = line[i] as string

    if (quote) {
      if (c === '\\') {
        i += 1
        out += '  '

        continue
      }

      if (c === quote) {
        quote = ''
        out += c
      } else {
        out += ' '
      }

      continue
    }

    if (c === "'" || c === '"' || c === '`') {
      quote = c
      out += c

      continue
    }

    if (c === '/' && line[i + 1] === '/') {
      break
    }

    out += c
  }

  return out
}

const isComment = (trimmed: string): boolean => trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')

// Every finding in one file's text. `file` is the path relative to the repository base.
export function scanContinuity(file: string, text: string): ContinuityFinding[] {
  const findings: ContinuityFinding[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] as string
    const trimmed = raw.trim()

    if (isComment(trimmed)) {
      continue
    }

    const record = (kind: ContinuityKind): void => {
      findings.push({ file, line: i + 1, kind, text: trimmed.slice(0, 160) })
    }

    // an import's path is a string, so the measure-import test reads the raw line
    if (MEASURE_IMPORT.some(p => p.test(raw))) {
      record('measure-import')
    }

    const line = codeOf(raw)

    if (/^\s*(import|export)\b.*\bfrom\s+['"]/.test(line) || /^\s*}\s*from\s+['"]/.test(line)) {
      continue
    }

    if (TRIG.test(line)) {
      record('trig')
    }

    if (TRANSCENDENTAL.some(p => p.test(line))) {
      record('transcendental')
    }

    const { args, rest } = quotients(line)
    const realQuotient = args.some(a => REAL_ARGUMENT.some(p => p.test(a)))

    if (ALWAYS_ROUNDING.test(line) || realQuotient) {
      record('rounding')
    } else if (args.length > 0) {
      record('integer-division')
    }

    if (FLOAT_LITERAL.some(p => p.test(line))) {
      record('float-literal')
    }

    if (FLOAT_ARRAY.test(line)) {
      record('float-array')
    }

    // a / inside a floor of integers is that quotient, already recorded; any other / is a real
    if (DIVISION.test(realQuotient ? line : rest)) {
      record('division')
    }

    if (ANGLE.test(line)) {
      record('angle')
    }
  }

  return findings
}

// the value imports of a file (type-only imports call no code and are not followed), resolved to paths
// relative to base, only those under code/
export function importsOf(base: string, file: string, text: string): string[] {
  const out: string[] = []
  const statements = text.match(/import\s+(type\s+)?[^;]*?from\s+['"][^'"]+['"]|import\s*\(\s*['"][^'"]+['"]\s*\)/g) ?? []

  for (const statement of statements) {
    if (/^import\s+type\b/.test(statement)) {
      continue
    }

    // an import of named bindings only, every one of them a type
    const named = statement.match(/^import\s*\{([^}]*)\}\s*from/)

    if (named) {
      const parts = (named[1] ?? '').split(',').map(x => x.trim()).filter(x => x.length > 0)

      if (parts.length > 0 && parts.every(x => x.startsWith('type '))) {
        continue
      }
    }

    const target = statement.match(/['"]([^'"]+)['"]/)?.[1] ?? ''
    let path = ''

    if (target.startsWith('@/')) {
      path = join(base, target.slice(2))
    } else if (target.startsWith('.')) {
      path = join(base, dirname(file), target)
    } else {
      continue
    }

    for (const candidate of [`${path}.ts`, join(path, 'index.ts')]) {
      if (existsSync(candidate)) {
        const rel = relative(base, candidate)

        if (rel.startsWith('code/')) {
          out.push(rel)
        }

        break
      }
    }
  }

  return out
}

// the transitive value-import closure of the entry files, not entering code/measure (which is exempt: an
// import of it is a finding in the importer), with, for each file reached, the file that first reached it
export function importClosure(base: string, entries: readonly string[]): Map<string, string> {
  const reached = new Map<string, string>()
  const queue: string[] = []

  for (const entry of entries) {
    if (!reached.has(entry)) {
      reached.set(entry, '')
      queue.push(entry)
    }
  }

  while (queue.length > 0) {
    const file = queue.shift() as string

    let text = ''

    try {
      text = readFileSync(join(base, file), 'utf8')
    } catch {
      continue
    }

    for (const next of importsOf(base, file, text)) {
      if (next.startsWith('code/measure/') || reached.has(next)) {
        continue
      }

      reached.set(next, file)
      queue.push(next)
    }
  }

  return reached
}

function walk(dir: string, out: string[]): void {
  let names: string[]

  try {
    names = readdirSync(dir)
  } catch {
    return
  }

  for (const name of names) {
    if (name === 'node_modules' || name === 'host' || name === 'tmp' || name.startsWith('.')) {
      continue
    }

    const path = join(dir, name)

    if (statSync(path).isDirectory()) {
      walk(path, out)
    } else if (name.endsWith('.ts')) {
      out.push(path)
    }
  }
}

// every rule file: code/rule/**
export function ruleFiles(base: string): string[] {
  const paths: string[] = []

  walk(join(base, 'code', 'rule'), paths)

  return paths.map(p => relative(base, p)).sort()
}

// The committed knit is the turning weave (code/rule/collision, stepped by code/rule/lattice-gas and
// code/rule/vibe-weave), and the fear beat adopted into it on 2026-09-25 and 2026-09-26 is carried by
// code/rule/combined-knit. Its path is the import closure of those four.
export const KNIT_ENTRIES = ['code/rule/collision.ts', 'code/rule/lattice-gas.ts', 'code/rule/vibe-weave.ts', 'code/rule/combined-knit.ts']

export type ContinuityScan = {
  // every file scanned: the rule files and their import closure
  files: string[]
  findings: ContinuityFinding[]
  // the files on the committed knit's path, each with the knit-path file that first imported it
  knitPath: Map<string, string>
  // for each file, the rule-path file that first imported it ('' for a rule file)
  reachedFrom: Map<string, string>
}

export function scanRules(base: string): ContinuityScan {
  const closure = importClosure(base, ruleFiles(base))
  const knit = importClosure(base, KNIT_ENTRIES)
  const files = [...closure.keys()].sort()
  const findings: ContinuityFinding[] = []

  for (const file of files) {
    if (file === 'code/check/continuity.ts') {
      continue
    }

    findings.push(...scanContinuity(file, readFileSync(join(base, file), 'utf8')))
  }

  return { files, findings, knitPath: knit, reachedFrom: closure }
}
