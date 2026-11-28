// The qutrit toric code under the bare beat U on closed quotients (Q4 follow-up).
//
// Q4 (E-CMP-0038) could not run the toric code: it holds logical qutrits only on a closed space and the beat library had
// none. code/rule/bare-beat.ts now runs U on closed quotients (withClosedMesh): the {3,4,3,4} congruence quotients K mod
// (sqrt 2)^m at levels 4 and 5 (2,048 and 16,384 docks, the levels code/substrate/tiling-quotient.ts keeps under its cap)
// and the flat D_4 tori {3,4,3,3} of sides 4 and 8 (128 and 2,048 docks; side 8 is level 4's partner of equal size).
// Library: code/compute/quantum/toric-memory. Prior art for the code: E-QTM-0095 (Kitaev 1997, Dennis, Kitaev, Landahl,
// Preskill 2002 for Z_d codes).
//
// The code: one qutrit per facet on the first slot of its line (the embedding that keeps one slot per line, so the
// stream S maps it to itself as a facet permutation pi), value = tone, role 0; X checks on docks, Z checks around each
// triangle 2-cell (a 4-cycle of docks on {3,4,3,4}, a 3-cycle on {3,4,3,3}).
//
// HYPOTHESES, fixed after the probes tmp/toric-probe*.ts and before this file's first run:
//   H1  layers: K, M_pair and M_meet are the identity on the embedding and keep the code space; D does not (it moves a
//       facet's tone to the antipodal slot, the line coin over a beat keeps it with weight 1/4); S does not (pi(delta e_v)
//       has a nonzero circulation on some plaquette); Phi_odd does not (a coboundary delta g whose Phi_odd phase is not
//       the vacuum's, found by a declared search; the star delta e_v alone has chi = 0)
//   H2  fidelity leaves 1 at T = 1 for every logical and Fourier state, lab frame and co-moving alike: F(1) <=
//       (4/9)^(V - 1); the weight still in the embedding after one beat <= (1/2)^(V - 1)
//   H3  plaquettes after one beat (erasure read as 0): co-moving <Z_p> = (3/4)^m + (1/4)^m, 41/128 on {3,4,3,4} (m = 4)
//       and 7/16 on {3,4,3,3} (m = 3); lab (3/4)^m, 81/256 and 27/64 (every sheared plaquette a forest); the end-to-end
//       check with the library's own layers reads exactly these, Phi_odd acting
//   H4  the smallest error U makes is weight 1 (one facet), below every quotient's systole and code distance
//   (no hypothesis on the number of logical qutrits of the hyperbolic quotients: reported as found)
// GATES, fixed before the first run:
//   G0  quotients: bare-beat's closed meshes have the dock counts of tiling-quotient (levels 4, 5) and side^4 / 2, no
//       inconsistent step, distinct neighbours, and equal code/substrate's tables dock for dock under one slot
//       permutation (congruence-3434 enumerateFrames by residue frame; d4-torus buildD4Torus by center)
//   G1  complex: 24 V plaquettes on {3,4,3,4} and 32 V on {3,4,3,3}, every walk closes, signed facets match the walk
//       (checks commute), delta e_v has circulation 0 everywhere (control for the stream witness); the other geometry's
//       plaquette rule closes no walk (negative control)
//   G2  logical qutrits: 4 on both flat tori by two routes (rank of the plaquette rows; cocycles on a spanning tree),
//       E-QTM-0095's known value; the cocycle route from a second root and order agrees on level 4
//   G3  the reduction of the seven per-dock layers on the embedding, on the declared word family at a dock of each
//       parity: K, M_pair, M_meet change nothing, <x|L|x> = zeta6^(2 p chi) (zeta6/2)^n, no weight on another embedded
//       configuration, each output weight (1/4)^(n - |F|) (3/4)^|F|, norm 1, some words chiral
//   G4  negative controls of the plaquette check: without the two coin layers <Z_p> = 1; a start that is not a code
//       state (all facet values) reads (3/4)^m co-moving
//   G5  source scan: no host Math call and no generator in toric-memory.ts or bare-beat.ts; a planted line is caught
//   G6  identical bytes: the whole computation run twice gives the same report
// Verdict: fail if a gate fails; pass if H1 to H4 hold as written; partial otherwise, naming what read differently.
//
// WHAT IT MEANS. The toric code does not survive one beat of bare U on any closed quotient, hyperbolic or flat. The
// in-dock coin D erases every facet independently (it moves the tone to the antipodal slot with weight 3/4 per beat), a
// weight-1 error on every qutrit at once; Phi_odd adds a configuration-dependent phase that is not constant on the
// coboundaries; the stream shears the code into another (pi does not map coboundaries to cocycles). Only K, M_pair and
// M_meet keep it, because the embedding never fills a line. Curvature enters only through the plaquette length (4 cells
// around a triangle against 3), which sets how much syndrome information survives a beat; the fidelity bound and the
// error weight are the same in kind on both. The hyperbolic quotients carry many more logical qutrits than the flat
// tori, but their systole is 1: short loops sit next to every dock, so a count of logical qutrits says nothing of
// protection there.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ClosedBeatMesh, OPPOSITE_SLOT } from '@/code/rule/bare-beat'
import {
  type ToricComplex,
  ballSystole,
  checkCommutation,
  coboundaryCirculations,
  declaredWords,
  dockResidues,
  gateLayersOnEmbedding,
  logicalQutrits,
  logicalQutritsByCocycles,
  oneBeatBounds,
  phiWitness,
  plaquetteCount,
  plaquetteOneBeat,
  predictedPlaquette,
  searchPhiWitness,
  shearedForests,
  showNinth,
  streamWitness,
  toricComplex,
  withToricMesh,
} from '@/code/compute/quantum/toric-memory'
import { equals, ONE } from '@/code/algebra/ninth-field'
import { honeycombQuotient3434 } from '@/code/substrate/tiling-quotient'
import { enumerateFrames } from '@/code/substrate/coxeter/congruence-3434'
import { buildD4Torus } from '@/code/substrate/d4-torus'

const MAX_DOCKS = 20000

type MeshReport = {
  name: string
  docks: number
  systole: number
  logical: number | null
  rows: Record<string, string | number | boolean>
  ok: Record<string, boolean>
}

const meshesFor = (scale: number): { mesh: ClosedBeatMesh; logical: boolean }[] => [
  { mesh: { kind: 'torus-3433', side: 4 }, logical: true },
  { mesh: { kind: 'torus-3433', side: 8 }, logical: true },
  { mesh: { kind: 'congruence-3434', twoPower: 4 }, logical: true },
  // the cocycle route on 16,384 docks needs more memory than a default heap holds: scale >= 2
  { mesh: { kind: 'congruence-3434', twoPower: 5 }, logical: scale >= 2 },
]

// bare-beat's closed mesh against code/substrate's table, dock for dock under one slot permutation
function substrateAgreement(c: ToricComplex): { sameDocks: boolean; mapped: boolean; reference: string } {
  const residues = dockResidues(c.mesh, MAX_DOCKS)

  let idOf: (d: number) => number
  let neighbourOf: (id: number, k: number) => number
  let refDocks: number

  if (c.mesh.kind === 'congruence-3434') {
    const e = enumerateFrames({ level: { twoPower: c.mesh.twoPower, odd: 1 }, maxDocks: MAX_DOCKS })

    refDocks = e.fits ? e.order : -1
    idOf = d => e.indexOf(Int32Array.from(residues[d]!, Number))
    neighbourOf = (id, k) => e.table[id * 24 + k]!
  } else {
    const t = buildD4Torus(c.mesh.side)

    refDocks = t.cells.length
    idOf = d => t.index.get(residues[d]!.map(Number).join(',')) ?? -1
    neighbourOf = (id, k) => t.neigh[id]![k]!
  }

  const ids = Array.from({ length: c.docks }, (_, d) => idOf(d))
  const bijective = ids.every(id => id >= 0) && new Set(ids).size === c.docks && refDocks === c.docks
  const sigma: number[] = []

  if (bijective) {
    for (let s = 0; s < 24; s++) {
      const target = ids[c.neighbors[s]!]!
      const k = Array.from({ length: 24 }, (_, j) => j).find(j => neighbourOf(ids[0]!, j) === target)

      sigma.push(k ?? -1)
    }
  }

  const sigmaOk = sigma.length === 24 && new Set(sigma).size === 24 && sigma.every(k => k >= 0)

  let mapped = bijective && sigmaOk

  for (let d = 0; mapped && d < c.docks; d++) {
    for (let s = 0; s < 24; s++) {
      if (neighbourOf(ids[d]!, sigma[s]!) !== ids[c.neighbors[d * 24 + s]!]) {
        mapped = false
        break
      }
    }
  }

  return {
    sameDocks: refDocks === c.docks,
    mapped,
    reference: c.mesh.kind === 'congruence-3434' ? 'congruence-3434 enumerateFrames' : 'd4-torus buildD4Torus',
  }
}

function meshReport(mesh: ClosedBeatMesh, withLogical: boolean): MeshReport {
  const c = toricComplex(mesh, MAX_DOCKS)
  const V = c.docks
  const hyperbolic = mesh.kind === 'congruence-3434'
  const m = c.plaquetteLength
  const ok: Record<string, boolean> = {}
  const rows: Record<string, string | number | boolean> = {}

  // G0
  const expectedDocks = hyperbolic ? (honeycombQuotient3434({ twoPower: mesh.twoPower, maxDocks: MAX_DOCKS })?.docks ?? -1) : mesh.side ** 4 / 2
  const agreement = substrateAgreement(c)

  let distinct = true
  let involution = true

  for (let d = 0; d < V; d++) {
    const seen = new Set<number>()

    for (let s = 0; s < 24; s++) {
      const e = c.neighbors[d * 24 + s]!

      distinct &&= e !== d && !seen.has(e)
      seen.add(e)
      involution &&= c.neighbors[e * 24 + OPPOSITE_SLOT[s]!] === d
    }
  }

  ok.docks = V === expectedDocks
  ok.consistent = c.inconsistentSteps === 0
  ok.distinctNeighbours = distinct
  ok.involution = involution
  ok.substrateAgrees = agreement.mapped

  // G1
  const wrongRule = toricComplex(mesh, MAX_DOCKS, hyperbolic ? 'triangle' : 'square')

  ok.plaquetteCount = plaquetteCount(c) === (hyperbolic ? 24 : 32) * V
  ok.walksClose = c.openWalks === 0
  ok.commute = checkCommutation(c) === 0
  ok.coboundaryClosed = coboundaryCirculations(c, 0) === 0
  ok.wrongRuleOpen = plaquetteCount(wrongRule) === 0 && wrongRule.openWalks === 96 * V

  // G2 and the count
  let logical: number | null = null

  if (withLogical) {
    const cocycles = logicalQutritsByCocycles(c)

    logical = cocycles.logical
    rows.cocycleSymbols = cocycles.symbols
    rows.cocycleConstraintRank = cocycles.constraintRank

    if (!hyperbolic) {
      const rank = logicalQutrits(c)

      ok.flatFour = rank.logical === 4 && cocycles.logical === 4
      rows.plaquetteRank = rank.plaquetteRank
    } else {
      const second = logicalQutritsByCocycles(c, V - 1, true)

      ok.secondRouteAgrees = second.logical === cocycles.logical
      rows.secondRouteSymbols = second.symbols
    }
  }

  const systole = ballSystole(c, hyperbolic ? 2 : 3)

  if (hyperbolic) {
    const ref = honeycombQuotient3434({ twoPower: mesh.twoPower, maxDocks: MAX_DOCKS })

    ok.systoleAgrees = ref !== null && (ref.systole > 2 ? 2 : ref.systole) === systole.systole
  }

  // H1 witnesses
  const neighbour = c.neighbors[0]!
  const star = phiWitness(c, 0)
  const searches = [searchPhiWitness(c, 0), searchPhiWitness(c, neighbour)]
  const stream = streamWitness(c, 0)

  rows.chiStar = star.chiStar
  rows.chiAntiStar = star.chiAntiStar
  rows.phiWitness = searches.map(s => (s.witness ? `${JSON.stringify(s.witness)} exponent ${s.exponent}` : 'none')).join('; ')
  rows.streamNonzeroCirculations = stream.nonzeroCirculations
  ok.h1Phi = searches.every(s => s.witness !== null)
  ok.h1Stream = stream.nonzeroCirculations > 0

  // H2
  const bounds = oneBeatBounds(c)

  rows.fidelityBound = `${bounds.fidelityBound} < 10^-${bounds.fidelityBelowTenTo}`
  rows.embeddingBound = `${bounds.embeddingBound} < 10^-${bounds.embeddingBelowTenTo}`
  ok.h2 = bounds.treeFacets === V - 1 && bounds.fidelityBelowTenTo > 0

  // G3, G4, H3 with the library's own layers
  const forests = shearedForests(c)
  const predicted = predictedPlaquette(m)

  ok.forests = forests.forests === forests.total

  withToricMesh(c, () => {
    const gates = [gateLayersOnEmbedding(0, declaredWords()), gateLayersOnEmbedding(neighbour, declaredWords())]

    ok.layers = gates.every(
      g =>
        g.passiveLayerDefects === 0 &&
        g.diagonalDefects === 0 &&
        g.offDiagonalEmbedded === 0 &&
        g.flipWeightDefects === 0 &&
        g.normDefects === 0,
    )
    ok.chiralWordsTested = gates.every(g => g.chiralWords > 0)
    rows.layerWords = gates[0]!.words
    rows.chiralWords = gates.map(g => g.chiralWords).join(', ')

    const picks = [0, (plaquetteCount(c) / 2) | 0]
    const readings = picks.map(p => plaquetteOneBeat(c, p, 3))
    const free = plaquetteOneBeat(c, 0, 3, 'free')

    ok.h3 = readings.every(
      r =>
        equals(r.comovingPerDock, predicted.comoving) &&
        equals(r.comovingBeat, predicted.comoving) &&
        equals(r.lab, predicted.lab),
    )
    ok.phiActsInCheck = readings.some(r => r.phiActs)
    ok.noCoinControl = readings.every(r => equals(r.withoutCoin, ONE))
    ok.freeStartControl = equals(free.comovingPerDock, predicted.lab)
    rows.comovingZ = showNinth(readings[0]!.comovingPerDock)
    rows.labZ = showNinth(readings[0]!.lab)
    rows.comovingProjector = showNinth(predicted.comovingProjector)
    rows.labProjector = showNinth(predicted.labProjector)
    rows.freeStartZ = showNinth(free.comovingPerDock)
  })

  // H4: one facet's flip is an error by itself (each output weight factors per facet, G3), weight 1
  ok.h4 = ok.layers! && systole.systole >= 1

  return { name: c.name, docks: V, systole: systole.systole, logical, rows, ok }
}

const SOURCE_FILES = ['../../../code/compute/quantum/toric-memory.ts', '../../../code/rule/bare-beat.ts']
const FORBIDDEN = /\bMath\.|crypto\.random|makeRng|Date\.now/

function sourceScan(): { clean: boolean; plantedCaught: boolean } {
  const here = fileURLToPath(import.meta.url)
  const clean = SOURCE_FILES.every(rel => !FORBIDDEN.test(readFileSync(new URL(rel, `file://${here}`), 'utf8')))
  const plantedCaught = FORBIDDEN.test('const x = Math.floor(1)')

  return { clean, plantedCaught }
}

function compute(scale: number): { meshes: MeshReport[]; scan: { clean: boolean; plantedCaught: boolean } } {
  return {
    meshes: meshesFor(scale).map(({ mesh, logical }) => meshReport(mesh, logical)),
    scan: sourceScan(),
  }
}

const INSTRUMENT = [
  'docks',
  'consistent',
  'distinctNeighbours',
  'involution',
  'substrateAgrees',
  'plaquetteCount',
  'walksClose',
  'commute',
  'coboundaryClosed',
  'wrongRuleOpen',
  'flatFour',
  'secondRouteAgrees',
  'systoleAgrees',
  'forests',
  'layers',
  'chiralWordsTested',
  'phiActsInCheck',
  'noCoinControl',
  'freeStartControl',
]
const HYPOTHESES = ['h1Phi', 'h1Stream', 'h2', 'h3', 'h4']

export default experiment({
  id: 'computation/bare-u-toric',
  code: 'E-CMP-0042',
  title:
    'the qutrit toric code under the bare beat U on closed quotients: on the {3,4,3,4} congruence quotients of 2,048 and 16,384 docks and the flat D4 tori of 128 and 2,048 docks it leaves at T = 1 for every logical and Fourier state (F(1) <= (4/9)^(V - 1)), since the coin D erases every facet with weight 3/4 (a weight-1 error everywhere at once), Phi_odd puts a phase that is not constant on the coboundaries and the stream shears the code; only K, M_pair and M_meet keep it; curvature shows only in the plaquette length, co-moving syndromes 41/128 against 7/16',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L1',
  paper: false,
  run(context) {
    const scale = context.scale ?? 1
    const first = compute(scale)
    const second = compute(scale)
    const identical = JSON.stringify(first) === JSON.stringify(second)
    const all = (name: string): boolean => first.meshes.every(r => r.ok[name] === undefined || r.ok[name])
    const instrument = INSTRUMENT.every(all) && first.scan.clean && first.scan.plantedCaught && identical
    const hyp = HYPOTHESES.map(all)
    const failed = first.meshes.flatMap(r =>
      Object.entries(r.ok)
        .filter(([, v]) => !v)
        .map(([k]) => `${r.name}:${k}`),
    )
    const status = !instrument ? 'fail' : hyp.every(Boolean) ? 'pass' : 'partial'
    const line = (r: MeshReport): string =>
      `${r.name} (V = ${r.docks}, systole ${r.systole}, logical qutrits ${r.logical ?? 'not computed'}): F(1) <= ${r.rows.fidelityBound}, embedding weight <= ${r.rows.embeddingBound}, <Z_p> co-moving ${r.rows.comovingZ} lab ${r.rows.labZ}`
    const metrics: Record<string, number> = {}

    for (const r of first.meshes) {
      const key = r.name.replace(/-/g, '_')

      metrics[`${key}_docks`] = r.docks
      metrics[`${key}_systole`] = r.systole

      if (r.logical !== null) {
        metrics[`${key}_logical`] = r.logical
      }

      metrics[`${key}_streamWitnessPlaquettes`] = Number(r.rows.streamNonzeroCirculations)
    }

    return verdict({
      status,
      claim: !instrument
        ? `an instrument gate failed (${failed.join(', ') || (identical ? 'source scan' : 'two runs differ')})`
        : `the qutrit toric code leaves at T = 1 for every logical and Fourier state on every closed quotient: ${first.meshes.map(line).join('; ')}. K, M_pair, M_meet keep the code space (identity on the embedding); D does not (each facet kept with weight 1/4 per beat, a weight-1 error on every facet at once); Phi_odd does not (${hyp[0] ? 'a coboundary with a phase other than the vacuum' : 'no witness found'}); S does not (${hyp[1] ? 'pi of a star is not a cocycle' : 'no witness'})${hyp.every(Boolean) ? '' : ` (read differently: ${HYPOTHESES.filter((_, i) => !hyp[i]).join(', ')})`}`,
      metrics,
      control: {
        identicalBytes: identical ? 1 : 0,
        sourceClean: first.scan.clean ? 1 : 0,
        plantedCaught: first.scan.plantedCaught ? 1 : 0,
        instrumentGatesFailed: failed.filter(f => INSTRUMENT.some(g => f.endsWith(`:${g}`))).length,
      },
      notes: `L1, exact over Q(zeta_9). Per mesh: ${first.meshes.map(r => `${r.name}: ${JSON.stringify(r.rows)}`).join(' | ')}. The fidelity bound and the plaquette readings are the same for |0_L>, |1_L>, |2_L> and the three Fourier states (a logical shift is a fixed circulation-zero vector, so every marginal used is the same). Failed checks: ${failed.join(', ') || 'none'}. Not run: F(T) past T = 1 (exact sums of Potts type with interference); the logical count of level 5 below scale 2 (memory).`,
    })
  },
})
