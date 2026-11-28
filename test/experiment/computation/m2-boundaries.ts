// M9 slice 2 (item vibe-computation-models-0058). Algebra: spin-one tones; the Z3-linear rules read them as residues
// mod 3. Self-maintaining boundaries under the M2 rules (Z3-linear pair rules on matchings, the Q2R / Blume-Capel rule on
// independent vertex sets) and the M1 classes at start size 3: every in-place structure from starts of up to three
// cells is perturbed at every phase of its period (single hits on its region B, two-cell hits on the cells it holds,
// contacts on B's rim) and left to the forward rule. A structure keeps its boundary when every hit is repaired and every
// contact is kept; a repaired hit on a HELD cell is self-maintenance, and orbit and transit repairs are reported apart.
//
// Declared before the first run (m9-boundaries.md, slice 2). This file runs the laptop size (the line and the three
// degree-matched 2D pairs, both colorings of each family, start sizes up to 3; widened after a timing probe, before the
// first run); task/m3/m2-boundaries.ts runs the same code at the M3 size (adds the 4D pair). Library: code/compute/lab/boundary-m2.ts and boundary-m2-lab.ts (boundary.ts unchanged).
// Gates (each can fail): rule censuses (24 M1 rules in 12 classes, 48 Z3 rules in 26 classes); every kept quantity kept
// in every run; per structure and phase the finals pairwise distinct; every repaired hit exports exactly its change of
// every kept quantity and the distinct exterior count equals the ensemble; Z3 superposition on every Z3 run; the D
// theorem (no repaired hit with delta D <= 0 under a positive D-keeping ledger); every repaired reading replays on a
// freshly built box through addresses; each Q2R coloring proper on the radius-4 ball; slice 1 reproduced on {6,4}
// lifted-0 id.ACB.swap b-1 with at least one repair; no inverse round in the library; identical bytes over two runs; no
// random number. Negative controls: the M1 and Z3 identities repair nothing and keep every contact; the phase-ahead
// predicate misreads every structure with period above 1; the Q2R D-kept control repairs no hit with delta D <= 0.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  Cell,
  LAPTOP_SIZES,
  StructureResult,
  boundarySlice,
  entropyOf,
  familyTotals,
  isQ2rControl,
  reproduceSlice1,
} from '@/code/compute/lab/boundary-m2-lab'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LIBRARIES = ['code/compute/lab/boundary-m2.ts', 'code/compute/lab/boundary-m2-lab.ts']
const LAB_FILES = [...LIBRARIES, 'test/experiment/computation/m2-boundaries.ts']

export function m2Boundaries(): ReturnType<typeof boundarySlice> {
  return boundarySlice(LAPTOP_SIZES)
}

export default experiment({
  id: 'computation/m2-boundaries',
  code: 'E-CMP-0097',
  title:
    'M9 slice 2 self-maintaining boundaries: in-place structures of the Z3-linear pair rules, the reversible Blume-Capel (Q2R) rule and the M1 classes at start size 3, perturbed at every phase by one- and two-cell hits and rim contacts, forward rule only, open window and reflecting wall under two colorings of each family; which structures repair damage to cells they hold, and the exact entropy each repair exports',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = m2Boundaries()
    const twice = (): string => boundarySlice({ ...LAPTOP_SIZES, columns: ['line'], lineStart: 2 }).serialized
    const identicalBytes = twice() === twice()
    const repro = reproduceSlice1()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const libraryReverse = LIBRARIES.some(f => /inverse|reverse|backward/i.test(readFileSync(resolve(BASE, f), 'utf8')))
    const all = r.cells.flatMap(c => c.structures.map(s => ({ cell: c, s })))
    const sum = (f: (s: StructureResult) => number, xs = all): number => xs.reduce((t, x) => t + f(x.s), 0)
    const identity = all.filter(x => x.cell.identity)
    const repairedOf = (s: StructureResult): number => s.repaired.held + s.repaired.orbit + s.repaired.transit + s.repaired.double
    const identityBad = identity.filter(x => repairedOf(x.s) > 0 || x.s.immune > 0 || x.s.keptContacts !== x.s.contacts)
    const phaseTried = all.filter(x => x.s.period > 1)
    const phaseMissed = all.filter(x => x.s.phaseAheadMissed)
    const ledgerFailures = sum(s => s.ledgerFailures)
    const notDistinct = sum(s => s.notDistinctPhases)
    const exportMismatches = sum(s => s.exportMismatches)
    const superpositionChecked = sum(s => s.superpositionChecked)
    const superpositionFailures = sum(s => s.superpositionFailures)
    const theoremFailures = sum(s => s.theoremFailures)
    const replayFailures = sum(s => s.replayFailures)
    const coloringBad = r.coloringConflicts.filter(c => c.conflicts > 0)
    const control = all.filter(x => isQ2rControl(x.cell.rule))
    const controlRepaired = sum(repairedOf, control)
    const totals = { z3: familyTotals(r.cells, 'z3'), q2r: familyTotals(r.cells, 'q2r'), m1: familyTotals(r.cells, 'm1'), all: familyTotals(r.cells, 'all') }
    const live = all.filter(x => !x.cell.identity)
    const heldRepairs = live.filter(x => x.s.repaired.held + x.s.repaired.double > 0)
    const keeping = live.filter(x => x.s.keeps)
    const walledOrbitChanged = all.filter(x => x.s.walledOrbitSame === false).length
    const ok =
      r.m1RuleCount === 24 &&
      r.m1ClassCount === 12 &&
      r.z3RuleCount === 48 &&
      r.z3ClassCount === 26 &&
      repro.mismatches === 0 &&
      repro.repairs > 0 &&
      r.coloringConflicts.length > 0 &&
      coloringBad.length === 0 &&
      identity.length > 0 &&
      identityBad.length === 0 &&
      phaseTried.length > 0 &&
      phaseMissed.length === 0 &&
      ledgerFailures === 0 &&
      notDistinct === 0 &&
      exportMismatches === 0 &&
      superpositionChecked > 0 &&
      superpositionFailures === 0 &&
      theoremFailures === 0 &&
      replayFailures === 0 &&
      !libraryReverse &&
      identicalBytes &&
      findings.length === 0
    const failures = [
      ...(r.m1RuleCount === 24 && r.m1ClassCount === 12 ? [] : ['M1 census']),
      ...(r.z3RuleCount === 48 && r.z3ClassCount === 26 ? [] : [`Z3 census ${r.z3RuleCount}/${r.z3ClassCount}`]),
      ...(repro.mismatches === 0 && repro.repairs > 0 ? [] : [`slice-1 reproduction ${repro.mismatches} mismatches, ${repro.repairs} repairs`]),
      ...coloringBad.map(c => `coloring ${c.box}`),
      ...(identity.length > 0 ? [] : ['no identity structures']),
      ...identityBad.map(x => `identity ${x.cell.box} ${x.cell.rule} b${x.cell.background} ${x.s.start}`),
      ...(phaseTried.length > 0 ? [] : ['no period above 1']),
      ...phaseMissed.map(x => `phase ${x.cell.box} ${x.cell.rule} ${x.s.start}`),
      ...(ledgerFailures === 0 ? [] : [`ledger ${ledgerFailures}`]),
      ...(notDistinct === 0 ? [] : [`not distinct ${notDistinct}`]),
      ...(exportMismatches === 0 ? [] : [`export ${exportMismatches}`]),
      ...(superpositionChecked > 0 && superpositionFailures === 0 ? [] : [`superposition ${superpositionFailures} of ${superpositionChecked}`]),
      ...(theoremFailures === 0 ? [] : [`D theorem ${theoremFailures}`]),
      ...(replayFailures === 0 ? [] : [`replay ${replayFailures}`]),
      ...(libraryReverse ? ['library holds a reverse-time round'] : []),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]
    const describe = (x: { cell: Cell; s: StructureResult }): string =>
      `${x.cell.box} ${x.cell.rule} b${x.cell.background} [${x.s.start}] k${x.s.size} P${x.s.period} |B|=${x.s.regionSize}: repaired held ${x.s.repaired.held}/${x.s.hits.held}, orbit ${x.s.repaired.orbit}/${x.s.hits.orbit}, transit ${x.s.repaired.transit}/${x.s.hits.transit}, double ${x.s.repaired.double}/${x.s.hits.double}; ` +
      `repairs ${x.s.repairs.map(p => `ph${p.phase} ${p.cellClass} ${p.cells} last wrong ${p.lastWrong}`).join('/')}` +
      `; exports ${x.s.exports.map(e => `ph${e.phase} N=${e.ensemble} ${entropyOf(e.multiplicities).toFixed(3)} bits debris ${e.debris.join('/')}`).join(', ')}` +
      (x.s.walled.length > 0 ? `; walled rebroken ${x.s.walled.filter(w => w.rebroken).length}/${x.s.walled.length} (returned ${x.s.walled.map(w => w.returned).join('/')})` : '')
    const repairing = live.filter(x => repairedOf(x.s) > 0)
    const t = totals.all
    const fam = (name: string, f: typeof t): string =>
      `${name}: ${f.nonIdentityStructures} structures, ${f.keeping} keep, held hits repaired ${f.repaired.held} of ${f.hits.held}, two-cell ${f.repaired.double} of ${f.hits.double}, orbit ${f.repaired.orbit} of ${f.hits.orbit}, transit ${f.repaired.transit} of ${f.hits.transit}, budget ${f.budget}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${t.nonIdentityStructures} in-place structures of the M2 rules (Z3-linear, Q2R at Delta 1, 2 and the D-kept control) and the M1 classes at start size 3, on the line and the three degree-matched 2D pairs under two colorings each, perturbed at every phase (${t.hits.held + t.hits.orbit + t.hits.transit} single hits, ${t.hits.double} two-cell hits, ${t.contacts} contacts), forward rule only: ${keeping.length} keep their boundary, ${heldRepairs.length} repair damage to a cell they hold (held ${t.repaired.held} of ${t.hits.held}, two-cell ${t.repaired.double} of ${t.hits.double}), and orbit and transit repairs number ${t.repaired.orbit} and ${t.repaired.transit} (${fam('Z3', totals.z3)}; ${fam('Q2R', totals.q2r)}; ${fam('M1', totals.m1)}); ${repairing.length === 0 ? 'no repair to export' : `every repair exports exactly log2 N bits, the largest N = ${t.largestEnsemble} (${t.largestBits.toFixed(3)} bits)`}; Z3 superposition holds on ${superpositionChecked} runs; slice 1 reproduced (${repro.readings} readings, ${repro.repairs} repairs); behind the wall ${t.walledRebroken} of ${t.walled} open repairs are rebroken; ${r.credited.length === 0 ? 'nothing is credited to curvature' : `credited: ${r.credited.join(', ')}`}`,
      metrics: {
        cells: r.cells.length,
        structures: all.length,
        nonIdentityStructures: t.nonIdentityStructures,
        keeping: keeping.length,
        heldRepairStructures: heldRepairs.length,
        heldHits: t.hits.held,
        heldRepaired: t.repaired.held,
        doubleHits: t.hits.double,
        doubleRepaired: t.repaired.double,
        orbitHits: t.hits.orbit,
        orbitRepaired: t.repaired.orbit,
        transitHits: t.hits.transit,
        transitRepaired: t.repaired.transit,
        contacts: t.contacts,
        keptContacts: t.keptContacts,
        budget: t.budget,
        z3Structures: totals.z3.nonIdentityStructures,
        q2rStructures: totals.q2r.nonIdentityStructures,
        m1Structures: totals.m1.nonIdentityStructures,
        largestEnsemble: t.largestEnsemble,
        walledReadings: t.walled,
        walledRebroken: t.walledRebroken,
        walledReturned: t.walledReturned,
        walledBudget: t.walledBudget,
        walledOrbitChanged,
        curvatureFields: r.curvature.filter(c => c.reading === 'curvature').length,
        scheduleFields: r.curvature.filter(c => c.reading === 'schedule').length,
        creditedFields: r.credited.length,
        skippedBackgrounds: r.skipped.length,
        superpositionChecked,
        superpositionFailures,
        ledgerFailures,
        exportMismatches,
        theoremFailures,
        replayFailures,
        reproductionReadings: repro.readings,
        reproductionRepairs: repro.repairs,
        reproductionMismatches: repro.mismatches,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityStructures: identity.length,
        identityFailures: identityBad.length,
        phaseTried: phaseTried.length,
        phaseMissed: phaseMissed.length,
        q2rControlStructures: control.length,
        q2rControlRepaired: controlRepaired,
      },
      notes: `M9 slice 2 (item vibe-computation-models-0058). Repairing: ${repairing.slice(0, 30).map(describe).join(' || ') || 'none'}. Skipped (background not fixed): ${r.skipped.join('; ') || 'none'}. Curvature-sensitive: ${r.curvature.filter(c => c.reading === 'curvature').slice(0, 30).map(c => `${c.family} ${c.pair} ${c.rule} b${c.background} ${c.field} ${c.sign > 0 ? 'hyperbolic' : 'flat'} larger`).join('; ') || 'none'}. ${ok ? '' : `Failures: ${failures.slice(0, 16).join('; ')}`}`.trim(),
    })
  },
})
