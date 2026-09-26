// The static determinism audit: does any source file reach for a random number? Since 2026-09-25 the rule
// is that nothing in code/, test/ or research/ calls Math.random, imports the retired seeded generator
// code/tool/rng, imports the retired hash generator hashRand, carries the constants of a known
// pseudo-random generator, or draws from a hand-rolled hash (scanHashDraw). Every spread-out value comes
// from code/tool/weyl instead.
//
// This is a text scan of the source, the only witness that sees a file no experiment happens to run. It
// reads code lines only (a line whose first non-space characters are // is skipped), so a comment that
// names the old generator is not a finding, and a string that calls it is.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export type DeterminismFinding = {
  file: string
  line: number
  kind: 'math-random' | 'retired-module' | 'retired-hash' | 'generator-constant' | 'hash-draw'
  text: string
}

// The retired generator and its old conformance file, exempt until deleted by hand, and the two files that
// have to spell the forbidden patterns out to look for them.
export const DETERMINISM_EXEMPT = [
  'code/tool/rng.ts',
  'test/code/tool/rng.ts',
  'code/check/determinism.ts',
  'test/experiment/method/no-random-anywhere.ts',
]

// the patterns, assembled from pieces so this file is not its own finding when read as text
const MATH_RANDOM = new RegExp(['\\bMath', '\\.random\\s*\\('].join(''))
const RETIRED_MODULE = new RegExp(
  [
    "(from\\s+|import\\s*\\(\\s*|import\\s+)['\"]",
    '(@/code/tool/|(\\.\\.?/)+(code/)?tool/|\\./tool/)',
    'rng',
    "['\"]",
  ].join(''),
)
const RETIRED_CONFORMANCE = new RegExp(["['\"]@/test/code/tool/", "rng['\"]"].join(''))
const RETIRED_HASH = new RegExp(['\\bhash', 'Rand\\b'].join(''))

// mulberry32, the Numerical Recipes and ANSI C linear congruential generators, Knuth's MMIX (also PCG's
// multiplier), and the java.util.Random multiplier
const GENERATOR_CONSTANTS = [
  ['0x6d2b', '79f5'],
  ['16645', '25'],
  ['10139', '04223'],
  ['11035', '15245'],
  ['636413622', '3846793005'],
  ['0x5deec', 'e66d'],
].map(([a, b]) => new RegExp(`\\b${a}${b}\\b`, 'i'))

// A hand-rolled hash used as a draw (added 2026-09-26, after code/coarse/knit-boltzmann drew its product
// measure from a chained lowbias32 finalizer that no import or constant above could see). A hash is a
// pseudo-random generator whose counter is its input, so a file that both MIXES an integer and NORMALIZES
// an integer into [0, 1) is drawing from one. Mixing is an xorshift (h ^ (h >>> k), or h ^= h >>> k, k > 0)
// or a known finalizer or spatial-hash multiplier; normalizing is a division by 2^32 (or a multiplication
// by 2^-32). code/tool/weyl normalizes but never mixes (its only shift is >>> 0), and a hash that only keys
// a table mixes but never normalizes, so neither is a finding. Reported at the first mixing line.
const XORSHIFT = [
  /\b(\w+)\s*\^\s*\(?\s*\1\s*>>>?\s*[1-9]\d*/,
  /\b\w+\s*\^=\s*\(?\s*\w+\s*>>>?\s*[1-9]\d*/,
]
// murmur3 fmix32, lowbias32, the splitmix64 steps, and the multipliers of the retired hashRand
const FINALIZER_CONSTANTS = [
  ['0x85eb', 'ca6b'],
  ['0xc2b2', 'ae35'],
  ['0x7feb', '352d'],
  ['0x846c', 'a68b'],
  ['0xbf58476d', '1ce4e5b9'],
  ['0x94d049bb', '133111eb'],
  ['738', '56093'],
  ['193', '49663'],
  ['834', '92791'],
  ['12741', '26177'],
].map(([a, b]) => new RegExp(`\\b${a}${b}\\b`, 'i'))
const NORMALIZE = [
  new RegExp(['/\\s*', '(4294967296|0x100000000|2\\s*\\*\\*\\s*32|4\\.294967296e9)', '\\b'].join('')),
  new RegExp(['\\*\\s*', '2\\.3283064365386963e-10'].join('')),
]

// Every finding in one file's text. `file` is the path relative to the repo root.
export function scanSource(file: string, text: string): DeterminismFinding[] {
  const findings: DeterminismFinding[] = [...scanHashDraw(file, text)]
  const lines = text.split('\n')

  let importBlock = ''
  let importStart = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }

    const record = (kind: DeterminismFinding['kind']): void => {
      findings.push({ file, line: i + 1, kind, text: trimmed.slice(0, 160) })
    }

    if (MATH_RANDOM.test(line)) {
      record('math-random')
    }

    if (RETIRED_MODULE.test(line) || RETIRED_CONFORMANCE.test(line)) {
      record('retired-module')
    }

    if (GENERATOR_CONSTANTS.some(pattern => pattern.test(line))) {
      record('generator-constant')
    }

    // an import of the retired hash can span lines: gather the statement, test it at its end
    if (/^import\b/.test(trimmed)) {
      importBlock = ''
      importStart = i
    }

    if (importStart >= 0) {
      importBlock += `${line}\n`

      if (/from\s+['"][^'"]+['"]/.test(line)) {
        if (RETIRED_HASH.test(importBlock) && /conserving-sweep['"]/.test(importBlock)) {
          findings.push({
            file,
            line: importStart + 1,
            kind: 'retired-hash',
            text: importBlock.replace(/\s+/g, ' ').trim().slice(0, 160),
          })
        }

        importStart = -1
      }
    }
  }

  return findings
}

// the hash-draw finding of one file: at most one, at its first mixing line, when the file also normalizes
export function scanHashDraw(file: string, text: string): DeterminismFinding[] {
  const lines = text.split('\n')
  const code = (line: string): boolean => {
    const trimmed = line.trim()

    return !(trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))
  }

  const mixing = lines.findIndex(
    line => code(line) && (XORSHIFT.some(p => p.test(line)) || FINALIZER_CONSTANTS.some(p => p.test(line))),
  )
  const normalizes = lines.some(line => code(line) && NORMALIZE.some(p => p.test(line)))

  if (mixing < 0 || !normalizes) {
    return []
  }

  return [{ file, line: mixing + 1, kind: 'hash-draw', text: (lines[mixing] ?? '').trim().slice(0, 160) }]
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

// Scan code/, test/ and research/ under `base`. Returns every finding and the number of files read.
export function scanRepository(base: string): {
  files: number
  findings: DeterminismFinding[]
} {
  const paths: string[] = []

  for (const top of ['code', 'test', 'research']) {
    walk(join(base, top), paths)
  }

  const findings: DeterminismFinding[] = []

  let files = 0

  for (const path of paths) {
    const file = path.slice(base.length + 1)

    if (DETERMINISM_EXEMPT.includes(file) || file.startsWith('test/site/')) {
      continue
    }

    files++
    findings.push(...scanSource(file, readFileSync(path, 'utf8')))
  }

  return { files, findings }
}
