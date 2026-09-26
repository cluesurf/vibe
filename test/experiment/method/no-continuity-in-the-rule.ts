// E-MTH-0025: no continuity and no rounding at the base. The user's rule of 2026-09-26: the RULE uses only
// finite discrete data, trits, integers, finite groups, cycling numbers (an integer mod N, allowed the same
// day) and exact algebraic integers held as integers. No floats, no sin, cos or sqrt, no angles or real
// parameters, and never a fractional coupling rounded: a coupling is 1/Q, paid by a counter that carries.
// Measurement may use reals.
//
// This is the static gate, modeled on E-MTH-0015 (code/check/determinism). code/check/continuity scans every
// rule file (code/rule/**) and the value-import closure of those files (the code a rule's step can call,
// code/measure excepted, since measurement is exempt and a rule importing it is itself a finding) for eight
// offenses: trig, a transcendental function or real constant, a rounding (Math.round, or a floor, ceil or
// trunc of an argument holding a real), a fractional literal, a Float32 or Float64 array, a / outside a floor
// of integers, an identifier named for a real angle, and an import from code/measure. A floor of a quotient
// of integers (a digit read such as Math.floor(k / 3)) is reported as integer-division and not counted: a
// text scan cannot tell whether the operands are integers or whether the remainder is kept, so a reader
// confirms it.
//
// The committed knit's path is the import closure of code/rule/collision (the turning weave), lattice-gas,
// vibe-weave and combined-knit (which carries the fear beat adopted 2026-09-25 and 2026-09-26).
//
// The control is a planted battery: one text per offense, which the scanner must catch, and look-alikes it
// must pass (a counter written with shifts and masks, a digit read, a comment and a string that name the
// forbidden calls, a graph degree, the integer Z_N "angle" of photon-links).
//
// Gates, fixed before the first run (a probe of the scan ran first and is disclosed: it showed the photon
// rules' sine tables and the knit path's construction-time reals):
// G1 the planted control: every planted offense caught, no look-alike flagged
// G2 the whole rule layer: 0 offenses
// G3 the committed knit's path: 0 offenses
// G4 the counted light rule code/rule/photon-count and its value imports: 0 findings of any kind, integer
//    divisions included
// Status: pass if every gate passes, partial if G1 and G4 pass, fail otherwise. Predicted partial: G2 fails
// on the photon rules and others, G3 on construction-time reals of the D4 box and a Weyl start.

import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { CONTINUITY_KINDS, CONTINUITY_OFFENSES, importClosure, scanContinuity, scanRules } from '@/code/check/continuity'

const BASE = resolve(import.meta.dirname, '../../..')

// each forbidden form spelled from pieces so this file reads clean to a scanner of its own kind
const M = ['Ma', 'th'].join('')
const PLANTED_DIRTY: readonly [string, string][] = [
  ['trig', `const f = k * ${M}.sin(b)`],
  ['transcendental', `const g = ${M}.sqrt(5)`],
  ['transcendental', `const w = 2 * ${M}.PI * k`],
  ['rounding', `force[b] = ${M}.round(k * s)`],
  ['rounding', `const r = ${M}.floor(((i + 1) * GOLDEN) % 1 * q)`],
  ['float-literal', 'const kappa = 0.0614'],
  ['float-array', `const w = new Float${'64'}Array(n)`],
  ['division', 'const kappa = p / q'],
  ['angle', 'const theta = step * turn'],
  ['measure-import', `import { husk } from '@/code/${'measure'}/photon-husk'`],
]
const PLANTED_CLEAN: readonly string[] = [
  'const f = (r + b) >> 4\nconst next = (r + b) & 15',
  'const y = Math.floor(p / 3)',
  `// the old ${M}.sin table and its ${M}.round are gone`,
  `const note = 'kappa = p / q = 0.0614, ${M}.sin'`,
  'for (let d = 0; d < degree; d++) {}',
  'angle[l] = (angle[l] + flux[l]) & mask',
]

export default experiment({
  id: 'method/no-continuity-in-the-rule',
  code: 'E-MTH-0025',
  title:
    'no continuity and no rounding at the base: no rule file, and no code a rule imports, calls trig, a transcendental function or a rounding, holds a fractional literal, a float array or a real angle, divides into a real, or imports measurement code; the counted light rule is clean and the committed knit path is audited',
  category: 'method',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const scan = scanRules(BASE)
    const offenses = scan.findings.filter(f => CONTINUITY_OFFENSES.includes(f.kind))
    const knitOffenses = offenses.filter(f => scan.knitPath.has(f.file))
    const caught = PLANTED_DIRTY.filter(([kind, text]) => scanContinuity('planted.ts', text).some(f => f.kind === kind)).length
    const falseAlarms = PLANTED_CLEAN.filter(text => scanContinuity('planted.ts', text).some(f => CONTINUITY_OFFENSES.includes(f.kind))).length
    const controlHolds = caught === PLANTED_DIRTY.length && falseAlarms === 0
    const counted = importClosure(BASE, ['code/rule/photon-count.ts'])
    const countedFindings = [...counted.keys()].flatMap(file => scanContinuity(file, readFileSync(resolve(BASE, file), 'utf8')))
    const gates = {
      G1: controlHolds ? 1 : 0,
      G2: offenses.length === 0 ? 1 : 0,
      G3: knitOffenses.length === 0 ? 1 : 0,
      G4: countedFindings.length === 0 ? 1 : 0,
    }
    const byFile = new Map<string, Record<string, number>>()

    for (const f of scan.findings) {
      const row = byFile.get(f.file) ?? {}

      row[f.kind] = (row[f.kind] ?? 0) + 1
      byFile.set(f.file, row)
    }

    const listing = [...byFile.entries()]
      .sort((a, b) => Number(scan.knitPath.has(b[0])) - Number(scan.knitPath.has(a[0])) || a[0].localeCompare(b[0]))
      .map(([file, row]) => `${scan.knitPath.has(file) ? '[knit] ' : ''}${file}: ${CONTINUITY_KINDS.filter(k => row[k]).map(k => `${k} ${row[k]}`).join(', ')}`)
    const metrics: Record<string, number> = {
      filesScanned: scan.files.length,
      knitPathFiles: scan.knitPath.size,
      findings: scan.findings.length,
      offenses: offenses.length,
      offendingFiles: new Set(offenses.map(f => f.file)).size,
      knitOffenses: knitOffenses.length,
      knitOffendingFiles: new Set(knitOffenses.map(f => f.file)).size,
      countedFiles: counted.size,
      countedFindings: countedFindings.length,
    }

    for (const kind of CONTINUITY_KINDS) {
      metrics[`kind_${kind}`] = scan.findings.filter(f => f.kind === kind).length
    }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    return verdict({
      status: Object.values(gates).every(x => x === 1) ? 'pass' : gates.G1 && gates.G4 ? 'partial' : 'fail',
      claim: `${offenses.length} offenses in ${metrics['offendingFiles']} of ${scan.files.length} rule-path files (the rule is that there be none), ${knitOffenses.length} of them in ${metrics['knitOffendingFiles']} of the ${scan.knitPath.size} files on the committed knit's path; the counted light rule has ${countedFindings.length} findings; the planted control caught ${caught} of ${PLANTED_DIRTY.length} offenses with ${falseAlarms} false alarms`,
      metrics,
      control: { plantedCaught: caught, plantedOffenses: PLANTED_DIRTY.length, cleanFalseAlarms: falseAlarms },
      notes: `L1, a static text scan, deterministic. First run 2026-09-26 (tmp/mth0025.log, 0.1 s), PARTIAL as predicted: G1 (10 of 10 planted offenses caught, 0 of 6 look-alikes flagged) and G4 (code/rule/photon-count: 1 file, 0 findings) pass; G2 (467 offenses in 48 of 80 rule-path files; 466 in 48 of 81 on a rerun minutes later, as other agents' files changed and the clean code/rule/fear-kernel-exact was added) and G3 (32 offenses in 5 of the 15 knit-path files) fail. Read by a person, the knit path's 32 are all construction or starts, none in a step: the D4 roots and box basis in half-integer coordinates with sqrt, hypot and a rounding back to integers (root-system, d4-box), a golden-ratio Weyl start of the grid moves (vibe-weave), and two exact integer divisions written with / (scatter-weave 458, mesh 156). The knit's steps hold only digit reads (37 integer-divisions on the path, such as Math.floor(p / 3) of a grid point), which are exact. The scan's path follows value imports, so a table handed to the knit as data is missed: the fear beat's kernels, built by code/measure/fear-port through fear-weave's cos, sin and rounding, are the one real-number construction feeding a knit step (E-FRC-0206 rebuilds them exactly). Off the path, the light sector (photon-links, photon-remainder, photon-shaped) and the token and SU(3) rules (spinor-token, comoving-token, sigma-links through su3-subgroups, finite-gauge) carry trig and float state in their steps. Findings by file: ${listing.join('; ')}. Knit-path offenses: ${knitOffenses.map(f => `${f.file}:${f.line} ${f.kind}`).join('; ') || 'none'}.`,
    })
  },
})
