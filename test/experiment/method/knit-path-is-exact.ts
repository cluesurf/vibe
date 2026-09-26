// E-MTH-0027: the committed knit's path, construction and starts included, holds no continuity. The user's
// rule of 2026-09-26 is that the base uses only finite discrete data: trits, integers, finite groups,
// cycling numbers and exact algebraic integers held as integers, with no real number and no rounding.
// E-MTH-0025 found the knit's steps clean but 32 offenses on its path, all in construction or a start: the D4
// roots and box basis in half-integer coordinates with sqrt, hypot and a rounding back to integers
// (code/algebra/group/root-system, code/substrate/d4-box), a golden-ratio Weyl start of the grid moves
// (code/rule/vibe-weave), and two exact integer divisions written with / (code/rule/scatter-weave, the demon
// index, and code/tool/mesh, squareMesh).
//
// The fix: the root systems held as integers, the half-integer ones in doubled coordinates, with an exact
// integer reflection (code/algebra/group/integer-roots); the box built in integers with its basis inverted
// by its integer adjugate (determinant 2) and W(F4) held doubled (code/substrate/d4-box-integer); the grid-move
// start an integer Weyl sequence w = (i + 1) * 40503 mod 2^16 scaled to the 216 moves by a shift; the two
// divisions as integer quotients. The knit's path imports the integer files. root-system and d4-box remain as
// the REAL faces, for measurement (half-integers as floats, Euclidean lengths), off the knit's path.
//
// This experiment is the gate that keeps it so. The knit's path is the value-import closure of the four knit
// entries of code/check/continuity (collision, lattice-gas, vibe-weave, combined-knit), scanned with the
// E-MTH-0025 scanner. It reads text, so it sees a real reached through an import but not a real table handed
// to the knit as data (the fear beat's kernels, built by code/measure/fear-port: E-FRC-0206 rebuilds them
// exactly and the switch is the adoption agent's).
//
// Gates, fixed before the first run:
// G1 the planted control: (a) one planted line per offense kind (trig, transcendental, two roundings, a
//    fractional literal, a float array, a division, an angle, a measurement import) appended to the text of
//    a knit-path file is caught, each as its own kind, while that file's own text has 0 offenses; (b) the
//    five constructions this fix replaced, written as they were (the half-integer inverse row, its rounding,
//    the golden rate, the golden start, the two divisions), are each caught; (c) a planted value import of
//    the real face code/algebra/group/root-system resolves into the closure and brings offenses with it
// G2 the committed knit's path: 0 offenses (integer-divisions are reported, not counted)
// G3 the integer constructions are the objects they replace, checked here without the replaced code: the
//    adjugate times the basis is 2 I; on the side-5 box every neighbour of every dock differs from it by
//    that direction's root modulo 5 D4 (the lattice relation, read through exact coordinates); doubled
//    F4, E8 (the reflection closure, 240 roots), the spinor and half-integer weights equal twice the real
//    face's floats entry for entry; the W(F4) closure of the doubled F4 simple reflections acting on the 24
//    D4 roots has 1,152 elements, each linear, and each permutes the side-3 box's 81 docks
// G4 the integer start: w = (i + 1) * 40503 mod 2^16 visits all 65,536 residues in one period, scaling by
//    216 hits every move 303 or 304 times per period, and on the side-3 and side-5 weaves every link holds a
//    move in [0, 216) inverse to its reverse link's
// Status: pass if every gate passes, fail otherwise. Predicted pass.
//
// The exhaustive equality of every public output against the replaced half-integer code (591,759 checks on
// roots, coordinates, the neighbour tables at sides 1 to 9, distances, and W(F4) maps; 2,350,360 on the two
// divisions and the D4 and B4 meshes; 0 failures) ran once before callers were switched, against verbatim
// copies of the old files, and is recorded in the notes. It is not repeated here since the old code is gone.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { CONTINUITY_OFFENSES, KNIT_ENTRIES, importClosure, importsOf, scanContinuity } from '@/code/check/continuity'
import {
  cartanMatrixInteger,
  doubledE8SimpleRoots,
  doubledHalfIntegerWeights,
  doubledRootsE8,
  doubledRootsF4,
  doubledSpinorWeightsDn,
  reflectInteger,
  rootsD4,
} from '@/code/algebra/group/integer-roots'
import {
  D4_ADJUGATE,
  boxCellMapDoubled,
  d4BoxCoordinates,
  d4BoxMesh,
  d4Coordinates,
  d4Vector,
  linearMapOfDoubled,
} from '@/code/substrate/d4-box-integer'
import { e8SimpleRoots, halfIntegerWeights, rootsE8, rootsF4, spinorWeightsDn } from '@/code/algebra/group/root-system'
import { LINK_START_RATE, linkStart, makeVibeWeave } from '@/code/rule/vibe-weave'

const BASE = resolve(import.meta.dirname, '../../..')

// each forbidden form spelled from pieces so this file reads clean to a scanner of its own kind
const M = ['Ma', 'th'].join('')
const PLANTED: readonly [string, string][] = [
  ['trig', `const f = k * ${M}.cos(b)`],
  ['transcendental', `const g = ${M}.sqrt(5)`],
  ['rounding', `force[b] = ${M}.round(k * s)`],
  ['rounding', `const r = ${M}.floor(((i + 1) * GOLDEN) % 1 * q)`],
  ['float-literal', 'const kappa = 0.0614'],
  ['float-array', `const w = new Float${'64'}Array(n)`],
  ['division', 'const kappa = p / q'],
  ['angle', 'const theta = step * turn'],
  ['measure-import', `import { husk } from '@/code/${'measure'}/photon-husk'`],
]
// the constructions this fix replaced, as they were written
const REPLACED: readonly [string, string][] = [
  ['float-literal', `  [${'0.5'}, 0.5, 0.5, -0.5],`],
  ['rounding', `    ${M}.round(row.reduce((sum, x, k) => sum + x * (vector[k] ?? 0), 0)),`],
  ['transcendental', `const GOLDEN = (${M}.sqrt(5) - 1) / 2`],
  ['rounding', `const g = ${M}.floor((((x * 24 + d + 1) * GOLDEN * 7.31) % 1) * moves.act.length)`],
  ['division', 'const y = (cell - x) / side'],
  ['division', 'const demon = counters ? { counters, at: (base / 24) * 12 + (couples[k]?.[1] ?? 0) } : undefined'],
]

const twice = (rows: number[][]): number[][] => rows.map(r => r.map(x => 2 * x))
const equal = (a: number[][], b: number[][]): boolean => a.length === b.length && a.every((r, i) => r.length === (b[i]?.length ?? -1) && r.every((x, k) => x === b[i]?.[k]))

export default experiment({
  id: 'method/knit-path-is-exact',
  code: 'E-MTH-0027',
  title:
    "the committed knit's path, construction and starts included, holds no continuity: the D4 roots and box in integers (half-integers doubled, the basis inverted by its integer adjugate), an integer Weyl start of the grid moves, the divisions as integer quotients, and the E-MTH-0025 scanner finds 0 offenses on the path with a planted control",
  category: 'method',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // G2: the knit's path
    const path = [...importClosure(BASE, KNIT_ENTRIES).keys()].sort()
    const findings = path.flatMap(file => scanContinuity(file, readFileSync(resolve(BASE, file), 'utf8')))
    const offenses = findings.filter(f => CONTINUITY_OFFENSES.includes(f.kind))
    const integerDivisions = findings.filter(f => f.kind === 'integer-division').length

    // G1 (a): planted lines appended to a knit-path file
    const host = 'code/rule/vibe-weave.ts'
    const hostText = readFileSync(resolve(BASE, host), 'utf8')
    const hostOffenses = scanContinuity(host, hostText).filter(f => CONTINUITY_OFFENSES.includes(f.kind)).length
    const hostLines = hostText.split('\n').length
    const plantedCaught = PLANTED.filter(([kind, line]) =>
      scanContinuity(host, `${hostText}\n${line}`).some(f => f.kind === kind && f.line === hostLines + 1),
    ).length
    // G1 (b): the replaced constructions
    const replacedCaught = REPLACED.filter(([kind, line]) => scanContinuity('replaced.ts', line).some(f => f.kind === kind)).length
    // G1 (c): a planted import of the real face enters the closure with its offenses
    const plantedImport = `import { rootsF4 } from '@/code/algebra/group/root-system'`
    const reached = importsOf(BASE, host, plantedImport)
    const plantedClosure = [...importClosure(BASE, reached).keys()]
    const importOffenses = plantedClosure
      .flatMap(file => scanContinuity(file, readFileSync(resolve(BASE, file), 'utf8')))
      .filter(f => CONTINUITY_OFFENSES.includes(f.kind)).length
    const importCaught = reached.includes('code/algebra/group/root-system.ts') && importOffenses > 0

    // G3: the integer constructions
    const basis = [
      [1, -1, 0, 0],
      [0, 1, -1, 0],
      [0, 0, 1, -1],
      [0, 0, 1, 1],
    ]
    const adjugateHolds = [0, 1, 2, 3].every(i =>
      [0, 1, 2, 3].every(j => [0, 1, 2, 3].reduce((s, k) => s + (D4_ADJUGATE[i]?.[k] ?? 0) * (basis[j]?.[k] ?? 0), 0) === (i === j ? 2 : 0)),
    )
    const roots = rootsD4()
    const side = 5
    const mesh = d4BoxMesh({ side })
    let neighbourChecks = 0
    let neighbourFailures = 0

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const v = d4Vector(d4BoxCoordinates({ cell, side }))

      for (let d = 0; d < 24; d++) {
        const w = d4Vector(d4BoxCoordinates({ cell: mesh.neighbour(cell, d), side }))
        const offset = d4Coordinates(w.map((x, k) => x - (v[k] ?? 0) - (roots[d]?.[k] ?? 0)))

        neighbourChecks += 1
        neighbourFailures += offset.every(c => c % side === 0) ? 0 : 1
      }
    }

    const doubledMatches = {
      f4: equal(doubledRootsF4(), twice(rootsF4())),
      e8: equal(doubledRootsE8(), twice(rootsE8())) && doubledRootsE8().length === 240,
      e8Simple: equal(doubledE8SimpleRoots(), twice(e8SimpleRoots())),
      weights: [1, 2, 3, 4, 5, 6, 7, 8].every(n => equal(doubledHalfIntegerWeights(n), twice(halfIntegerWeights(n))) && equal(doubledSpinorWeightsDn(n), twice(spinorWeightsDn(n)))),
    }
    const e8Cartan = cartanMatrixInteger(doubledE8SimpleRoots())
    const e8CartanDiagonal = e8Cartan.every((row, i) => row[i] === 2)
    // W(F4) on the 24 D4 roots, from the doubled F4 simple reflections
    const f4Simple = [
      [0, 2, -2, 0],
      [0, 0, 2, -2],
      [0, 0, 0, 2],
      [1, -1, -1, -1],
    ]
    const indexOf = (v: readonly number[]): number => roots.findIndex(r => r.every((x, k) => 2 * x === v[k]))
    const generators = f4Simple.map(a => roots.map(r => indexOf(reflectInteger(r.map(x => 2 * x), a))))
    const group = new Map<string, number[]>([[roots.map((_, i) => i).join(','), roots.map((_, i) => i)]])
    let frontier = [...group.values()]

    while (frontier.length > 0) {
      const next: number[][] = []

      for (const p of frontier) {
        for (const g of generators) {
          const q = p.map(i => g[i] ?? 0)
          const key = q.join(',')

          if (!group.has(key)) {
            group.set(key, q)
            next.push(q)
          }
        }
      }

      frontier = next
    }

    let linear = 0
    let boxMaps = 0

    for (const p of group.values()) {
      const doubled = linearMapOfDoubled(p)

      if (doubled) {
        linear += 1
        boxMaps += boxCellMapDoubled({ doubled, side: 3 }) ? 1 : 0
      }
    }

    // G4: the integer start
    const residues = new Uint8Array(65536)
    const moveCounts = new Int32Array(216)

    for (let i = 0; i < 65536; i++) {
      residues[Math.imul(i + 1, LINK_START_RATE) & 0xffff] = 1
      moveCounts[linkStart(i, 216)] = (moveCounts[linkStart(i, 216)] ?? 0) + 1
    }

    const fullPeriod = residues.every(x => x === 1)
    const countLow = Math.min(...moveCounts)
    const countHigh = Math.max(...moveCounts)
    let linkChecks = 0
    let linkFailures = 0

    for (const weaveSide of [3, 5]) {
      const weave = makeVibeWeave({ side: weaveSide })

      for (let x = 0; x < weave.mesh.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          const g = weave.links[x * 24 + d] ?? -1
          const y = weave.mesh.neighbour(x, d)
          const back = weave.links[y * 24 + (weave.opposite[d] ?? d)] ?? -1

          linkChecks += 1
          linkFailures += g >= 0 && g < 216 && weave.moves.compose(g, back) === weave.moves.identity ? 0 : 1
        }
      }
    }

    const gates = {
      G1: plantedCaught === PLANTED.length && hostOffenses === 0 && replacedCaught === REPLACED.length && importCaught ? 1 : 0,
      G2: offenses.length === 0 ? 1 : 0,
      G3:
        adjugateHolds && neighbourFailures === 0 && Object.values(doubledMatches).every(Boolean) && e8CartanDiagonal && group.size === 1152 && linear === 1152 && boxMaps === 1152 ? 1 : 0,
      G4: fullPeriod && countLow === 303 && countHigh === 304 && linkFailures === 0 ? 1 : 0,
    }
    const metrics: Record<string, number> = {
      knitPathFiles: path.length,
      knitOffenses: offenses.length,
      knitIntegerDivisions: integerDivisions,
      plantedCaught,
      planted: PLANTED.length,
      hostOffenses,
      replacedCaught,
      replaced: REPLACED.length,
      plantedImportOffenses: importOffenses,
      adjugateHolds: adjugateHolds ? 1 : 0,
      neighbourChecks,
      neighbourFailures,
      doubledF4: doubledMatches.f4 ? 1 : 0,
      doubledE8: doubledMatches.e8 ? 1 : 0,
      doubledWeights: doubledMatches.weights ? 1 : 0,
      wf4Order: group.size,
      wf4Linear: linear,
      wf4BoxMaps: boxMaps,
      startFullPeriod: fullPeriod ? 1 : 0,
      startMoveCountLow: countLow,
      startMoveCountHigh: countHigh,
      linkChecks,
      linkFailures,
    }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    return verdict({
      status: Object.values(gates).every(x => x === 1) ? 'pass' : 'fail',
      claim: `${offenses.length} offenses on the ${path.length} files of the committed knit's path (${integerDivisions} exact integer divisions reported); the planted control caught ${plantedCaught} of ${PLANTED.length} planted offenses and ${replacedCaught} of ${REPLACED.length} replaced constructions, and a planted import of the real face brought ${importOffenses}; W(F4) from doubled integer reflections has ${group.size} elements, all linear and all box maps; the integer start covers all 65,536 residues and hits each of the 216 moves ${countLow} to ${countHigh} times a period`,
      metrics,
      control: { plantedCaught, planted: PLANTED.length, replacedCaught, plantedImportOffenses: importOffenses },
      notes: `L1, static scan plus exact construction checks, deterministic. First run 2026-09-26 (tmp/mth0027.log, 0.2 s), PASS as predicted, every gate on the first run, no gate moved. The equality proof before callers were switched (tmp/exact-equal.ts, tmp/exact-equal-divisions.ts, against verbatim copies of the old files): 591,759 checks on the roots (D_n, A_n to n = 10, D4, B4 identical; F4, E8 in closure order, the half-integer and spinor weights to n = 10 and the F4 and E8 Cartan matrices equal to twice or once the old floats), d4Coordinates on every D4 vector in [-6, 6]^4, the neighbour and opposite tables, cell indexing and distances at sides 1 to 9 (every pair at sides 1 to 4, fractional first arguments included), linearMapOf on all 1,152 W(F4) permutations, all 276 transpositions and 1,152 composites, boxCellMap on 4,632 (matrix, side) cases; and 2,350,360 on squareMesh, the D4 and B4 meshes and the demon index: 0 failures. The one change of behavior: d4Coordinates now REFUSES a vector outside D4 (all 14,280 odd-sum vectors of the box tested) where the old code rounded it. The Euclidean readout d4BoxDistance stays in code/substrate/d4-box with hypot, since the square root of the exact squared distance differs from hypot in the last bit on 3,988 of 15,333 pairs. The start is a change, not a refactor: 59 experiments build a vibe weave (traced by running all 122 whose imports reach code/rule/vibe-weave), each rerun with the old golden start and then the integer one: 8 status flips (E-QTM-0140 partial to fail, E-QTM-0105 fail to pass, E-QTM-0109 pass to fail, E-QTM-0100 fail to pass, E-RLT-0055 pass to fail, E-SPN-0063 pass to fail, E-RLT-0056 partial to fail, E-FRC-0159 pass to fail), 35 moved with the same status, 16 identical (tmp/exact-compare.md). Knit-path offenses: ${offenses.map(f => `${f.file}:${f.line} ${f.kind}`).join('; ') || 'none'}. Knit path: ${path.join(', ')}.`,
    })
  },
})
