// Q6 of the quantum ladder (item vibe-computation-models-0033, decision 004 of vibe/computation/models): the boundary
// between the bare beat U and the 24 classical pair rules of M1. Exact over Q(zeta_9), no floats, no random numbers.
//
// What it measures (code/compute/quantum/classical-boundary.ts):
// - which of the 8 layers are monomial on one dock: every basis state of the base dock with 1, 2 and 3 excitations, and
//   the declared 4-excitation family (Phi_odd acts only from 4), with the stated predicate of each mixing layer checked
//   against the computed images state by state;
// - the sectors (charge, excitation count) on which the whole beat is monomial: how many start states stay a single
//   basis state under U, U^2, U^3 (every 1-, 2- and 3-excitation state of the base dock), and for every sector with
//   1 to 8 excitations a state U mixes (one excitation on each of n lines), plus the 12-excitation one;
// - whether a dock-local change of basis could hide a permutation in the one-excitation sector: the exact two-term
//   structure of U on every one-excitation state, the only vectors whose image lies in one dock, and their second image;
// - the dephased beat P_ij = |U_ij|^2 as exact real cyclotomic numbers: for L (the seven per-dock layers, U = S o L) on
//   the closed base-dock sectors of 1, 2 and 3 excitations (finite, square, doubly stochastic), for U on the
//   one-excitation states of the radius-1 ball and the two-excitation states of the base dock (column sums 1, row sums
//   1 wherever the preimage lies inside), its support graph, and P_U = Pi_S P_L column by column;
// - coarse-graining: the four tone maps declared in classical-boundary.ts BEFORE the first run (netSign, netResidue,
//   pairedSign, lowestSlotTone) applied to the dephased support of U, of L, of S and of U^2 and U^3: deterministic or
//   not, with the first witness; a deterministic map is matched against the 24 pair rules on a declared edge.
// Gates: Lean names thm_q_dephased_unitary_doubly_stochastic and thm_q_dephased_line_coin (Vibe.QuantumBoundary).
// Negative and positive controls: a planted non-unitary branching op (column sums, determinism), the stream alone (a
// monomial layer that tone maps still cannot follow: lump witness), K o S (the census must read it monomial at every
// beat), the 24 pair rules on an abstract edge (the matcher must return each rule alone), and a planted Math call (source
// scan). Two runs give identical bytes.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  type CoarseConfig,
  type CoarseVerdict,
  DECLARED_TONE_MAPS,
  type Operator,
  applyDockLayers,
  applyDockLayersInverse,
  beatMonomialCensus,
  coarseRelation,
  dephasedFactorMismatches,
  dephasedMatrix,
  dockConfigs,
  layerCensus,
  loneWitness,
  matchPairRules,
  oneExcitationDisguise,
  pairRuleClassOf,
  quadrupleFamily,
  streamIsLastLayer,
  streamOnly,
} from '@/code/compute/quantum/classical-boundary'
import {
  type BeatState,
  type Vibe,
  LINES,
  applyBeat,
  applyBeatInverse,
  applyBeats,
  applyOppositeSignBounce,
  applyStream,
  basisKet,
  dockCenterKey,
  stepDock,
  withFreshMesh,
} from '@/code/rule/bare-beat'
import { pairIndex, pairRulesFromFibers, pairTones } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULE = 'code/compute/quantum/classical-boundary.ts'
const MATH_CALL = /\bMath\s*\.\s*\w+/
const LEAN_FILE = 'code/proof/Vibe/QuantumBoundary.lean'
const LEAN_NAMES = ['thm_q_dephased_unitary_doubly_stochastic', 'thm_q_dephased_line_coin']
const WITNESS_MAX = 8

const TONE_ROLES: readonly (readonly [1 | -1, number])[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, 1],
]

function singlesOf(docks: readonly number[]): Vibe[][] {
  return docks.flatMap(dock => dockConfigs(dock, 1))
}

function walk(dock: number, slot: number, hops: number): number {
  let d = dock

  for (let k = 0; k < hops; k++) {
    d = stepDock(d, slot)
  }

  return d
}

// Two excitations `hops` docks away on opposite sides of the base dock, each pointing at it: if both keep their slot
// for `hops` beats (weight (1/4)^(2 hops)) they fill one line of the base dock together. hops = 1: the head-on pairs.
function approachPairs(hops: number): Vibe[][] {
  const out: Vibe[][] = []

  for (const [s, opp] of LINES) {
    for (const [t1, r1] of TONE_ROLES) {
      for (const [t2, r2] of TONE_ROLES) {
        out.push([
          [walk(0, opp, hops), s, t1, r1],
          [walk(0, s, hops), opp, t2, r2],
        ])
      }
    }
  }

  return out
}

// One excitation on the base dock and one on its neighbour across slot 0.
function crossPairs(): Vibe[][] {
  const n1 = stepDock(0, 0)
  const out: Vibe[][] = []

  for (const [a] of dockConfigs(0, 1)) {
    for (const [b] of dockConfigs(n1, 1)) {
      out.push([a!, b!])
    }
  }

  return out
}

function brief(v: CoarseVerdict): Omit<CoarseVerdict, 'table'> {
  return {
    map: v.map,
    sources: v.sources,
    pairs: v.pairs,
    coarseSources: v.coarseSources,
    multivalued: v.multivalued,
    deterministic: v.deterministic,
    branchWitness: v.branchWitness,
    lumpWitness: v.lumpWitness,
  }
}

function core(): Record<string, unknown> & { serialized: string } {
  return withFreshMesh(() => {
    const neighbours = Array.from({ length: 24 }, (_, s) => stepDock(0, s))
    const n1 = dockConfigs(0, 1)
    const n2 = dockConfigs(0, 2)
    const n3 = dockConfigs(0, 3)
    const q4 = quadrupleFamily(0)
    const ballSingles = singlesOf([0, ...neighbours])

    // 1. layers on one dock
    const layers = [
      ...[n1, n2, n3].flatMap((configs, k) => Array.from({ length: 8 }, (_, p) => layerCensus(p, configs, k + 1))),
      ...Array.from({ length: 8 }, (_, p) => layerCensus(p, q4, 4)),
    ]

    // 2. the whole beat by sector
    const census = beatMonomialCensus([...n1, ...n2, ...n3], 3)
    const witnesses: { charge: number; excitations: number; image: number }[] = []

    for (let n = 1; n <= WITNESS_MAX; n++) {
      for (let q = -n; q <= n; q += 2) {
        witnesses.push({ charge: q, excitations: n, image: applyBeat(basisKet(loneWitness(0, q, n))).amp.size })
      }
    }

    // 3. a dock-local disguise of a permutation in the one-excitation sector, at the base dock and at a neighbour
    const disguise = [oneExcitationDisguise(0), oneExcitationDisguise(neighbours[0]!)]

    // 4. dephased matrices
    const dephasedL = [n1, n2, n3].map(s => dephasedMatrix(applyDockLayers, applyDockLayersInverse, s))
    const dephasedU = [ballSingles, n2].map(s => dephasedMatrix(applyBeat, applyBeatInverse, s))
    const factorMismatches = dephasedFactorMismatches([...ballSingles, ...n2])

    // 5. coarse-graining
    const sources = [[], ...ballSingles, ...n2, ...approachPairs(1), ...crossPairs()]
    const coarse = (op: Operator, set: Vibe[][]): CoarseVerdict[] =>
      DECLARED_TONE_MAPS.map(map => coarseRelation(op, set, map))
    const coarseU = coarse(applyBeat, sources)
    const coarseL = coarse(applyDockLayers, sources)
    const coarseS = coarse(streamOnly, sources)
    const coarseU2 = coarse(s => applyBeats(s, 2), [[], ...n1, ...approachPairs(2)])
    const coarseU3 = coarse(s => applyBeats(s, 3), [[], ...n1, ...approachPairs(3)])
    const edge = [dockCenterKey(0), dockCenterKey(neighbours[0]!)] as const
    const matchL = coarseL.map(v => {
      if (!v.deterministic) {
        return { map: v.map, deterministic: false, coveredPairs: [] as number[], matching: [] as string[], classes: [] as string[] }
      }

      const m = matchPairRules([...v.table.values()], edge)

      return {
        map: v.map,
        deterministic: true,
        coveredPairs: [...m.coveredPairs],
        offEdgeChanges: m.offEdgeChanges,
        matching: m.matching.map(r => r.name),
        classes: [...m.classes],
      }
    })

    const out = {
      layers,
      census,
      witnesses,
      disguise,
      dephasedL: dephasedL.map(d => ({ ...d, columns: undefined })),
      dephasedU: dephasedU.map(d => ({ ...d, columns: undefined })),
      factorMismatches,
      coarseU: coarseU.map(brief),
      coarseL: coarseL.map(brief),
      coarseS: coarseS.map(brief),
      coarseU2: coarseU2.map(brief),
      coarseU3: coarseU3.map(brief),
      matchL,
    }

    return { ...out, serialized: JSON.stringify(out) }
  })
}

// ---------------------------------------------------------------- controls

function controls(): Record<string, boolean> {
  return withFreshMesh(() => {
    const n1 = dockConfigs(0, 1)
    const n2 = dockConfigs(0, 2)

    // a planted op: every basis state goes to itself plus its streamed copy, amplitude 1 each (not unitary)
    const planted: Operator = (s: BeatState) => {
      const moved = applyStream(s, false)
      const amp = new Map(s.amp)

      for (const [k, z] of moved.amp) {
        amp.set(k, z)
      }

      return { amp, den: s.den }
    }

    const plantedMatrix = dephasedMatrix(planted, s => s, n1)
    const plantedCoarse = coarseRelation(planted, [[], ...n1], DECLARED_TONE_MAPS[0]!)

    // K o S is monomial: the census must read every state monomial at every beat
    const ks: Operator = s => applyStream(applyOppositeSignBounce(s), false)
    const ksCensus = beatMonomialCensus([...n1, ...n2], 3, ks)
    const ksAllMonomial = ksCensus.every(row => row.monomialAfter.every(c => c === row.states))

    // the stream alone is monomial, and netSign still cannot follow it (two slots of one dock, one coarse source)
    const streamCoarse = coarseRelation(streamOnly, [[], ...n1], DECLARED_TONE_MAPS[0]!)

    // the matcher returns each of the 24 pair rules alone on an abstract edge covering all 9 pairs
    const rules = pairRulesFromFibers()

    const toConfig = (a: number, b: number): CoarseConfig => {
      const m = new Map<string, -1 | 1>()

      if (a !== 0) {
        m.set('a', a as -1 | 1)
      }

      if (b !== 0) {
        m.set('b', b as -1 | 1)
      }

      return m
    }

    const matcherExact = rules.every(rule => {
      const entries = Array.from({ length: 9 }, (_, p) => {
        const [a, b] = pairTones(p)
        const [x, y] = pairTones(rule.table[pairIndex(a, b)]!)

        return { source: toConfig(a, b), image: toConfig(x, y) }
      })
      const m = matchPairRules(entries, ['a', 'b'])

      return m.matching.length === 1 && m.matching[0]!.name === rule.name && m.classes[0] === pairRuleClassOf(rule)
    })
    // and refuses a coarse map that changes a dock off the edge
    const offEdgeRefused =
      matchPairRules([{ source: toConfig(1, 0), image: new Map([['c', 1 as const]]) }], ['a', 'b']).matching.length === 0

    // planted Math call and generator import the source scan must see
    const text = `const x = Math.floor(2.5)\nimport { makeRng } from '@/code/tool/${'rng'}'\n`
    const plantedMath = text.split('\n').filter(line => MATH_CALL.test(line)).length === 1
    const plantedGenerator = scanSource('planted.ts', text).length > 0

    return {
      plantedColumnsRejected: plantedMatrix.unitColumns === 0,
      plantedBranchCaught: !plantedCoarse.deterministic && plantedCoarse.branchWitness !== null,
      ksAllMonomial,
      streamLumpCaught: !streamCoarse.deterministic && streamCoarse.lumpWitness !== null && streamCoarse.branchWitness === null,
      matcherExact,
      offEdgeRefused,
      plantedMath,
      plantedGenerator,
      streamIsLast: streamIsLastLayer(),
    }
  })
}

function sourceFindings(): string[] {
  const out: string[] = []
  const text = readFileSync(resolve(BASE, NEW_MODULE), 'utf8')

  text.split('\n').forEach((line, i) => {
    if (!/^\s*\/\//.test(line) && MATH_CALL.test(line)) {
      out.push(`${NEW_MODULE}:${i + 1} Math call`)
    }
  })

  for (const f of scanSource(NEW_MODULE, text)) {
    out.push(`${f.file}:${f.line} ${f.kind}`)
  }

  const lean = readFileSync(resolve(BASE, LEAN_FILE), 'utf8')

  for (const name of LEAN_NAMES) {
    if (!new RegExp(`^theorem ${name}\\b`, 'm').test(lean)) {
      out.push(`${LEAN_FILE}: theorem ${name} missing`)
    }
  }

  if (/\bsorry\b|\baxiom\b|\bnative_decide\b/.test(lean.replace(/--.*$/gm, '').replace(/\/-[\s\S]*?-\//g, ''))) {
    out.push(`${LEAN_FILE}: forbidden token`)
  }

  return out
}

type Layer = ReturnType<typeof layerCensus>

const MONOMIAL_POSITIONS = [0, 2, 6, 7]
const MIXING_POSITIONS = [1, 3, 4, 5]

export default experiment({
  id: 'computation/bare-u-classical-boundary',
  code: 'E-CMP-0036',
  title:
    'the boundary between the bare beat U and the classical pair rules: monomial layers, the vacuum as the only monomial sector, no dock-local disguise, the dephased beat as an exact doubly stochastic process, and no tone map that turns it into a pair rule',
  category: 'computation',
  substrates: ['{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = core()
    const again = core()
    const identicalBytes = r.serialized === again.serialized
    const twelve = withFreshMesh(() => applyBeat(basisKet(loneWitness(0, 0, 12))).amp.size)
    const control = controls()
    const findings = sourceFindings()

    const layers = r.layers as Layer[]
    const census = r.census as ReturnType<typeof beatMonomialCensus>
    const witnesses = r.witnesses as { charge: number; excitations: number; image: number }[]
    const disguise = r.disguise as ReturnType<typeof oneExcitationDisguise>[]
    const dephasedL = r.dephasedL as Omit<ReturnType<typeof dephasedMatrix>, 'columns'>[]
    const dephasedU = r.dephasedU as Omit<ReturnType<typeof dephasedMatrix>, 'columns'>[]
    const coarseU = r.coarseU as ReturnType<typeof brief>[]
    const coarseU2 = r.coarseU2 as ReturnType<typeof brief>[]
    const coarseU3 = r.coarseU3 as ReturnType<typeof brief>[]
    const coarseL = r.coarseL as ReturnType<typeof brief>[]
    const coarseS = r.coarseS as ReturnType<typeof brief>[]
    const matchL = r.matchL as { map: string; deterministic: boolean; matching: string[]; classes: string[]; coveredPairs: number[] }[]

    // gates
    const monomialLayersOk = layers.filter(l => MONOMIAL_POSITIONS.includes(l.position)).every(l => l.mixed === 0)
    const mixingLayersMix = MIXING_POSITIONS.every(p => layers.some(l => l.position === p && l.mixed > 0))
    const predicatesOk = layers.every(l => l.predicateDisagreements === null || l.predicateDisagreements === 0)
    const phiActs = layers.some(l => l.position === 0 && l.excitations === 4 && l.phased > 0)
    const noMonomialSectorAfterTwo = census.every(row => row.monomialAfter[1] === 0)
    const witnessesMix = witnesses.every(w => w.image >= 2) && twelve >= 2
    const disguiseOk = disguise.every(
      d =>
        d.structureHolds &&
        d.distinctTargetDocks === 24 &&
        d.determinantNonzero &&
        d.landingSingle === d.landingVectors &&
        d.landingVectors === 192 &&
        d.secondImageOneDock === 0,
    )
    const closedDoublyStochastic = dephasedL.every(
      d =>
        d.unitColumns === d.sources &&
        d.closedRows === d.targets &&
        d.closedUnitRows === d.targets &&
        d.targets === d.sources &&
        d.nonRealEntries === 0 &&
        d.nonPositiveEntries === 0,
    )
    const ballStochastic = dephasedU.every(
      d =>
        d.unitColumns === d.sources &&
        d.closedUnitRows === d.closedRows &&
        d.closedRows > 0 &&
        d.openRowViolations === 0 &&
        d.nonRealEntries === 0 &&
        d.nonPositiveEntries === 0,
    )
    const walkOk =
      dephasedU[0]!.entryValues.length === 2 &&
      dephasedU[0]!.entryValues[0]![0] === '1 0 0 0 0 0/4' &&
      dephasedU[0]!.entryValues[1]![0] === '3 0 0 0 0 0/4'
    const factorOk = r.factorMismatches === 0
    const noGoU = [...coarseU, ...coarseU2, ...coarseU3].every(v => !v.deterministic)
    // L under the primary declared map netSign must read as exactly one pair rule with all 9 pairs on the edge covered
    // (pairedSign sees no lone excitation, so its domain cannot separate A from C on the edge: reported, not gated)
    const lNet = matchL.find(m => m.map === 'netSign')
    const lClassified =
      lNet !== undefined && lNet.deterministic && lNet.matching.length === 1 && lNet.coveredPairs.length === 9
    const controlsOk = Object.values(control).every(Boolean)

    const ok =
      monomialLayersOk &&
      mixingLayersMix &&
      predicatesOk &&
      phiActs &&
      noMonomialSectorAfterTwo &&
      witnessesMix &&
      disguiseOk &&
      closedDoublyStochastic &&
      ballStochastic &&
      walkOk &&
      factorOk &&
      lClassified &&
      noGoU &&
      identicalBytes &&
      findings.length === 0 &&
      controlsOk

    const failures = [
      ...(monomialLayersOk ? [] : ['a monomial layer mixed']),
      ...(mixingLayersMix ? [] : ['a mixing layer never mixed']),
      ...(predicatesOk ? [] : ['a mixing predicate disagreed']),
      ...(phiActs ? [] : ['Phi_odd never phased the 4-excitation family']),
      ...(noMonomialSectorAfterTwo ? [] : ['some start stayed monomial for two beats']),
      ...(witnessesMix ? [] : ['a sector witness did not mix']),
      ...(disguiseOk ? [] : [`disguise test: ${JSON.stringify(disguise)}`]),
      ...(closedDoublyStochastic ? [] : ['P_L not doubly stochastic']),
      ...(ballStochastic ? [] : ['P_U sums wrong']),
      ...(walkOk ? [] : ['one-excitation P_U is not the 1/4, 3/4 walk']),
      ...(factorOk ? [] : [`${String(r.factorMismatches)} columns differ from Pi_S P_L`]),
      ...(lClassified ? [] : ['L not classified as one pair rule']),
      ...(noGoU ? [] : ['a declared tone map made the coarse dephased beat deterministic']),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings,
      ...Object.entries(control)
        .filter(([, v]) => !v)
        .map(([k]) => `control ${k} failed`),
    ]

    const sectorLine = census
      .map(row => `(q ${row.charge}, n ${row.excitations}) ${row.monomialAfter.join('/')} of ${row.states}`)
      .join('; ')
    const coarseLine = coarseU
      .map(
        v =>
          `${v.map}: ${v.deterministic ? 'deterministic' : `not a function (${v.multivalued} of ${v.coarseSources} coarse sources multivalued; ${v.branchWitness ? 'branch' : 'lump'} witness)`}`,
      )
      .join('; ')
    const lLine = matchL
      .map(m => `${m.map}: ${m.deterministic ? `deterministic, rules ${m.matching.join(',')} class ${m.classes.join(',')}` : 'not a function'}`)
      .join('; ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'Phi_odd, K and S are monomial on every checked dock state and D, M_pair and M_meet mix exactly the states their predicates name; no start state with an excitation stays a single basis state for two beats and every sector (q, n) with n >= 1 holds a state U mixes, so U is monomial only on the vacuum; no dock-local basis hides a permutation in the one-excitation sector; the dephased beat is an exact doubly stochastic process over the real cyclotomic field (one excitation: forward 1/4, back 3/4 along its line); and no declared tone map makes the coarse dephased beat deterministic, so no coarse-graining tested turns U into an M1 pair rule',
      metrics: {
        layerStatesChecked: layers.reduce((s, l) => s + l.states, 0),
        dockFourFamily: layers.find(l => l.position === 0 && l.excitations === 4)?.states ?? 0,
        phiPhasedFour: layers.find(l => l.position === 0 && l.excitations === 4)?.phased ?? 0,
        censusStarts: census.reduce((s, row) => s + row.states, 0),
        monomialOneBeat: census.reduce((s, row) => s + row.monomialAfter[0]!, 0),
        monomialTwoBeats: census.reduce((s, row) => s + row.monomialAfter[1]!, 0),
        sectorWitnesses: witnesses.length + 1,
        landingVectors: disguise.reduce((s, d) => s + d.landingVectors, 0),
        secondImageOneDock: disguise.reduce((s, d) => s + d.secondImageOneDock, 0),
        dephasedLSources: dephasedL.reduce((s, d) => s + d.sources, 0),
        dephasedLComponentsOne: dephasedL[0]!.components,
        dephasedLComponentsTwo: dephasedL[1]!.components,
        dephasedLComponentsThree: dephasedL[2]!.components,
        dephasedUClosedRowsSingles: dephasedU[0]!.closedRows,
        dephasedUClosedRowsPairs: dephasedU[1]!.closedRows,
        factorMismatches: r.factorMismatches as number,
        coarseDeterministicU: [...coarseU, ...coarseU2, ...coarseU3].filter(v => v.deterministic).length,
        coarseDeterministicL: coarseL.filter(v => v.deterministic).length,
        coarseDeterministicS: coarseS.filter(v => v.deterministic).length,
        noGo: noGoU ? 1 : 0,
        identicalBytes: identicalBytes ? 1 : 0,
        sourceFindings: findings.length,
      },
      control: Object.fromEntries(Object.entries(control).map(([k, v]) => [k, v ? 1 : 0])),
      notes:
        `L2 boundary map (Q6). Sectors (monomial after 1/2/3 beats): ${sectorLine}. One-excitation coefficients keep ${disguise[0]?.keep}, flip ${disguise[0]?.flip}. P_L entry values n=2: ${dephasedL[1]!.entryValues.map(([k, c]) => `${k} x${c}`).join(', ')}. Coarse U: ${coarseLine}. U^2, U^3 deterministic under ${[...coarseU2, ...coarseU3].filter(v => v.deterministic).length} of 8. L: ${lLine}. ${noGoU ? 'No-go: no declared tone map makes the dephased beat a function.' : 'A declared tone map made the dephased beat deterministic.'} ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
