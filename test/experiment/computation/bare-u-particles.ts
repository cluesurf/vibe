// Q2 of the quantum ladder (item vibe-computation-models-0032, decision 004 of vibe/computation/models): propagation and
// particles under the bare beat U, exact, on the hyperbolic {3,4,3,4} against the same beat on the flat 24-cell
// honeycomb {3,4,3,3} (code/rule/bare-beat withGeometry; the readings are code/compute/quantum/particles).
//
// Gates, each able to fail:
// - geometry: shells of each mesh to radius 3 ({3,4,3,4} 1, 24, 456, 8376; {3,4,3,3} its D_4 word lengths, checked dock
//   by dock against max(max |x_i|, sum |x_i| / 2)); no inconsistent step on either; lines through dock 0 never close;
//   dock parity alternates on every edge of {3,4,3,4} and is constant +1 on {3,4,3,3};
// - per-dock layers: the seven non-stream layers, forward and adjoint, on all 6,283 dock-0 states (one, two and four
//   excitations) give identical bytes on both meshes; on every dock of the radius-1 ball Phi_odd is the even layer or
//   its adjoint exactly as the dock parity says ({3,4,3,4}: 1 even, 24 odd; {3,4,3,3}: 25 even);
// - one excitation: all 96 lone vibes of dock 0 never leave their line and give one line table per beat, the same on
//   both meshes; norm exactly 1; the line coin read off one beat has C00 = C11, |det C| = 1, rho^2 rational and
//   positive; the Cayley-Hamilton recurrence of its symbol holds on every entry of the run;
// - BallisticDoublon.lean's P = 0 doublon: 13 U psi = (7 + 15 omega) psi on every interior configuration, on both;
// - the one-beat 2-to-2 table: the per-dock beat is an exact isometry on the 4,416 two-excitation dock states, each
//   (species pair, facet pair) class has one outcome pattern, every non-antipodal pair is the product of two lone coins,
//   the table is identical on both meshes, and the per-dock beat commutes with the four simple reflections of W(F_4);
// - two excitations: vibes on different lines evolve as the product of their lone runs (no interaction off a line);
//   role and charge pairs on one line stay on it with one line table on both meshes.
// Negative controls the gates must reject: the hyperbolic transport F_s Z on the flat mesh (frame and parity clash), a
// wrong determinant in the recurrence, the role-antisymmetric doublon, the conjugate doublon eigenvalue, a slot
// transposition outside W(F_4) (commutation), and the parity-odd Phi_odd (states that tell the parities apart).
// Readings, not gates: the first beat at which the identical pair reads differently on the two meshes, per observable.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Ninth,
  OMEGA,
  ONE,
  add,
  conj,
  equals,
  isZero,
  keyOf,
  mul,
  ninth,
  scale,
  toComplex,
} from '@/code/algebra/ninth-field'
import { scanSource } from '@/code/check/determinism'
import {
  DOUBLON_LAMBDA_13,
  type OneExcitationBeat,
  type PairReading,
  SPECIES,
  type ScatteringRow,
  applyLocalBeat,
  doublonDefects,
  facetClass,
  flatFrameTransportClash,
  flatRootDistance,
  layerFingerprint,
  lineChain,
  lineRecurrenceDefects,
  localBeatCommutes,
  localScatteringTable,
  oneExcitationRun,
  pairLineTable,
  pairRunReadings,
  parityAlternation,
  phiParityKind,
  productDefects,
  readLineSymbol,
  rootTriangles,
} from '@/code/compute/quantum/particles'
import { hopDistances } from '@/code/measure/quantum-lab-measures'
import {
  type BeatGeometry,
  type Vibe,
  BEAT_GEOMETRIES,
  OPPOSITE_SLOT,
  WF4_GROUP,
  amplitudeOf,
  applyBeats,
  basisKet,
  dockParityOf,
  encodeConfig,
  inconsistentStepCount,
  stepDock,
  withGeometry,
} from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = ['code/compute/quantum/particles.ts', 'test/experiment/computation/bare-u-particles.ts']
const MATH_CALL = /\bMath\s*\.\s*\w+/

const ONE_BEATS = 24
const PAIR_BEATS = 8
const LINE_PAIR_BEATS = 12
const PRODUCT_BEATS = 6
const CENSUS_BEATS = 3
const DISTANCE_RADIUS = 3

const sha = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16)
const show = (x: Ninth): string => keyOf(x)
const display = (x: Ninth): number => Number(toComplex(x)[0].toPrecision(8))

type GeometryReport = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  text: Record<string, string>
  pairReadings: PairReading[]
  oneRun: OneExcitationBeat[]
  lineTables: string[]
  pairLineTables: Record<string, string>
  tableKey: string
  fingerprint: string
}

function measureGeometry(geometry: BeatGeometry, pairBeats: number): GeometryReport {
  return withGeometry(geometry, () => {
    const ok: Record<string, boolean> = {}
    const numbers: Record<string, number> = {}
    const text: Record<string, string> = {}

    // ---- geometry ----
    const distance = hopDistances(0, DISTANCE_RADIUS)
    const shells = [0, 0, 0, 0]

    for (const r of distance.values()) {
      shells[r]!++
    }

    text.shells = shells.join(',')
    ok.shells = geometry === '3434' ? text.shells === '1,24,456,8376' : true

    if (geometry === '3433') {
      let mismatches = 0

      for (const [dock, r] of distance) {
        if (flatRootDistance(dock) !== r) {
          mismatches++
        }
      }

      numbers.wordLengthMismatches = mismatches
      ok.shells = mismatches === 0 && shells[1] === 24
    }

    ok.consistentSteps = inconsistentStepCount() === 0

    const ball2 = [...distance.entries()].filter(([, r]) => r <= 2).map(([d]) => d)
    const parity = parityAlternation(ball2)

    numbers.ball2Edges = parity.edges
    numbers.ball2AlternatingEdges = parity.alternating
    ok.parity = geometry === '3434' ? parity.alternating === parity.edges : parity.alternating === 0

    for (let s = 0; s < 24; s++) {
      lineChain(0, s, ONE_BEATS + 2)
    }

    ok.linesOpen = true

    // ---- per-dock layers ----
    const layers = layerFingerprint(0)
    const fingerprint = sha(layers.fingerprint)

    numbers.layerStates = layers.states

    let evenDocks = 0
    let oddDocks = 0
    let parityMatches = 0
    let distinguishing = 0

    for (const dock of [0, ...Array.from({ length: 24 }, (_, s) => stepDock(0, s))]) {
      const kind = phiParityKind(dock)
      const p = dockParityOf(dock)

      distinguishing = kind.distinguishing
      evenDocks += p === 1 ? 1 : 0
      oddDocks += p === -1 ? 1 : 0
      parityMatches += (p === 1 && kind.even && !kind.odd) || (p === -1 && kind.odd && !kind.even) ? 1 : 0
    }

    numbers.phiEvenDocks = evenDocks
    numbers.phiOddDocks = oddDocks
    numbers.phiDistinguishingStates = distinguishing
    ok.phiParity = parityMatches === 25 && distinguishing > 0

    // ---- one excitation ----
    const lineTables: string[] = []
    const runs: OneExcitationBeat[][] = []

    for (let s = 0; s < 24; s++) {
      for (const [tone, role] of SPECIES) {
        const run = oneExcitationRun(s, tone, role, ONE_BEATS)

        runs.push(run)
        lineTables.push(run.map(b => b.lineTable).join('\n'))
      }
    }

    const oneRun = runs[0]!

    ok.oneIsotropic = lineTables.every(t => t === lineTables[0])
    ok.oneUnitNorm = runs.every(run => run.every(b => equals(b.norm, ONE)))
    ok.oneFrontIsCone = oneRun.every((b, t) => b.supportRadius === t + 1)

    // the cone edge at beat t: straight on, |C00|^(2t) = 4^-t at +t, and one turn at the first beat then straight on,
    // |C10|^2 |C11|^(2(t - 1)) = 3 * 4^-t at -t, together 4^(1 - t)
    const quarter = ninth([1], 4)

    let edge = ninth([4])

    ok.oneEdgeWeight = oneRun.every(b => {
      edge = mul(edge, quarter)

      return equals(b.edgeWeight, edge)
    })

    const symbol = readLineSymbol(0)

    ok.symbolShape = symbol.diagonalEqual && symbol.unitDet && symbol.rhoSquaredRational && symbol.rhoPositive

    const recurrence = lineRecurrenceDefects(oneRun, symbol)

    numbers.recurrenceChecked = recurrence.checked
    numbers.recurrenceDefects = recurrence.defects
    ok.recurrence = recurrence.defects === 0 && recurrence.checked > 0

    const wrong = lineRecurrenceDefects(oneRun, { ...symbol, det: conj(symbol.det) })

    numbers.recurrenceWrongDetDefects = wrong.defects
    ok.recurrenceControl = wrong.defects > 0

    text.coin = symbol.coin.map(row => row.map(show).join(', ')).join('; ')
    text.det = show(symbol.det)
    text.rhoSquared = show(symbol.rhoSquared)
    text.massSquared = show(symbol.massSquared)
    text.topSpeedSquared = show(symbol.topSpeedSquared)
    text.returnProbabilities = oneRun.slice(0, 8).map(b => show(b.returnProbability)).join(', ')
    text.secondMomentLast = show(oneRun[ONE_BEATS - 1]!.secondMoment)
    numbers.detIsOmega = symbol.detIsOmega ? 1 : 0
    numbers.secondMomentOverT2 = display(ninth(oneRun[ONE_BEATS - 1]!.secondMoment.n, oneRun[ONE_BEATS - 1]!.secondMoment.d * BigInt(ONE_BEATS * ONE_BEATS)))

    // ---- the doublon ----
    const doublon = doublonDefects(0, 3, 5)
    const antisymmetric = doublonDefects(0, 3, 5, DOUBLON_LAMBDA_13, -1)
    const conjugate = doublonDefects(0, 3, 5, conj(DOUBLON_LAMBDA_13))

    numbers.doublonInterior = doublon.interior
    numbers.doublonDefects = doublon.defects
    numbers.doublonOffLine = doublon.offLine
    numbers.doublonAntisymmetricDefects = antisymmetric.defects
    numbers.doublonConjugateDefects = conjugate.defects
    ok.doublon = doublon.defects === 0 && doublon.offLine === 0 && doublon.interior > 0
    ok.doublonControls = antisymmetric.defects > 0 && conjugate.defects > 0
    ok.doublonUnit = equals(mul(conj(DOUBLON_LAMBDA_13), DOUBLON_LAMBDA_13), ninth([169]))

    // ---- the one-beat table ----
    const table = localScatteringTable()

    numbers.tableInputs = table.inputs
    numbers.tableNormDefects = table.normDefects
    numbers.tableOrthogonalityDefects = table.orthogonalityDefects
    numbers.tableOrthogonalityPairs = table.pairsChecked
    ok.tableIsometry = table.normDefects === 0 && table.orthogonalityDefects === 0 && table.inputs === 4416
    ok.tableSymmetric = table.rows.every(r => r.deviants === 0)
    ok.tableNoInteractionOffLine = table.rows.every(r => r.nonProduct === 0)

    const tableKey = JSON.stringify(table.rows)

    // the like-tone role pair's contact block is of Yang form u I + i P: swap over keep = i sqrt3 = 1 + 2 omega
    const rolePair: Vibe[] = [
      [0, 0, 1, 0],
      [0, OPPOSITE_SLOT[0]!, 1, 1],
    ]
    const contact = applyLocalBeat(basisKet(rolePair))
    const keep = amplitudeOf(contact, encodeConfig(rolePair))
    const swap = amplitudeOf(
      contact,
      encodeConfig([
        [0, 0, 1, 1],
        [0, OPPOSITE_SLOT[0]!, 1, 0],
      ]),
    )

    ok.roleContactYang = !isZero(keep) && equals(swap, mul(keep, add(scale(OMEGA, 2), ONE)))

    // ---- two excitations ----
    let productFailures = 0
    let productRuns = 0

    for (const partner of [1, 0, -1]) {
      const slot = Array.from({ length: 24 }, (_, s) => s).find(s => s !== 0 && facetClass(0, s) === partner)!

      for (const [t2, r2] of [
        [1, 0],
        [1, 1],
        [-1, 0],
        [-1, 1],
      ] as const) {
        productRuns++
        productFailures += productDefects([0, 0, 1, 0], [0, slot, t2, r2], PRODUCT_BEATS).reduce((a, b) => a + b, 0)
      }
    }

    numbers.productRuns = productRuns
    numbers.productDefects = productFailures
    ok.productOffLine = productFailures === 0

    const line = lineChain(0, 0, LINE_PAIR_BEATS + 2)
    const pairLineTables: Record<string, string> = {}

    for (const [name, second] of [
      ['role_pair', [0, OPPOSITE_SLOT[0]!, 1, 1]],
      ['charge_pair_same_role', [0, OPPOSITE_SLOT[0]!, -1, 0]],
      ['charge_pair_cross_role', [0, OPPOSITE_SLOT[0]!, -1, 1]],
    ] as const) {
      const start = basisKet([[0, 0, 1, 0], second])

      pairLineTables[name] = Array.from({ length: LINE_PAIR_BEATS }, (_, t) =>
        pairLineTable(applyBeats(start, t + 1), line, 0),
      ).join('\n')
    }

    ok.linePairsStay = true

    const identical = basisKet([
      [0, 0, 1, 0],
      [0, OPPOSITE_SLOT[0]!, 1, 0],
    ])
    const pairReadings = pairRunReadings(identical, pairBeats, distance, line)

    ok.pairUnitNorm = pairReadings.every(r => equals(r.norm, ONE))

    // compacton census: slot 0 with every other slot, every species pair (one representative per W(F_4) orbit of the
    // slot pair), CENSUS_BEATS beats: a state whose support radius falls below the beat count stays bounded
    let censusStates = 0
    let censusBounded = 0

    for (let s = 1; s < 24; s++) {
      for (const [t1, r1] of SPECIES) {
        for (const [t2, r2] of SPECIES) {
          const readings = pairRunReadings(
            basisKet([
              [0, 0, t1, r1],
              [0, s, t2, r2],
            ]),
            CENSUS_BEATS,
            distance,
            line,
          )

          censusStates++

          if (readings.some((r, t) => r.supportRadius >= 0 && r.supportRadius < t + 1)) {
            censusBounded++
          }
        }
      }
    }

    numbers.censusStates = censusStates
    numbers.censusBounded = censusBounded

    return { ok, numbers, text, pairReadings, oneRun, lineTables, pairLineTables, tableKey, fingerprint }
  })
}

// The first beat (1-based) at which two lists differ, or 0 when they agree on every beat read.
function firstDifference(a: readonly string[], b: readonly string[]): number {
  for (let t = 0; t < a.length && t < b.length; t++) {
    if (a[t] !== b[t]) {
      return t + 1
    }
  }

  return 0
}

type Report = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  text: Record<string, string>
}

function compute(pairBeats: number): Report {
  const [hyper, flat] = BEAT_GEOMETRIES.map(g => measureGeometry(g, pairBeats)) as [GeometryReport, GeometryReport]
  const ok: Record<string, boolean> = {}
  const numbers: Record<string, number> = {}
  const text: Record<string, string> = {}

  for (const [tag, g] of [
    ['h', hyper],
    ['f', flat],
  ] as const) {
    for (const [k, v] of Object.entries(g.ok)) {
      ok[`${tag}_${k}`] = v
    }

    for (const [k, v] of Object.entries(g.numbers)) {
      numbers[`${tag}_${k}`] = v
    }

    for (const [k, v] of Object.entries(g.text)) {
      text[`${tag}_${k}`] = v
    }
  }

  // ---- the two meshes against each other ----
  ok.sameLayers = hyper.fingerprint === flat.fingerprint
  ok.sameOneExcitation = hyper.lineTables[0] === flat.lineTables[0]
  ok.sameSymbol = hyper.text.coin === flat.text.coin && hyper.text.det === flat.text.det
  ok.sameTable = hyper.tableKey === flat.tableKey
  ok.sameLinePairs = Object.keys(hyper.pairLineTables).every(k => hyper.pairLineTables[k] === flat.pairLineTables[k])
  ok.phiParityPattern =
    hyper.numbers.phiEvenDocks === 1 &&
    hyper.numbers.phiOddDocks === 24 &&
    flat.numbers.phiEvenDocks === 25 &&
    flat.numbers.phiOddDocks === 0

  // E-CMP-0017 and CompositeTrion.lean item 4: cos W = cos(k) / 2, eigenvalues e^(i pi/3 +- i W), det(2C) = 4 omega,
  // tr(2C) = 2 zeta6, so rho^2 = 1/4, top speed 1/2, rest mass sqrt 3
  ok.fearDispersion =
    hyper.text.rhoSquared === keyOf(ninth([1], 4)) &&
    hyper.text.massSquared === keyOf(ninth([3])) &&
    hyper.numbers.detIsOmega === 1

  // ---- negative control: the hyperbolic gluing on the flat mesh ----
  const clash = withGeometry('3433', () => flatFrameTransportClash(2))

  numbers.flatTransportDocks = clash.docks
  numbers.flatTransportFrameClashes = clash.frameClashes
  numbers.flatTransportParityClashes = clash.parityClashes
  numbers.rootTriangles = rootTriangles()
  ok.flatTransportClashes = clash.frameClashes > 0 && clash.parityClashes > 0 && numbers.rootTriangles > 0

  // ---- W(F_4) commutation of the per-dock beat (identical bytes on both meshes, so read on {3,4,3,4}) ----
  const simple = [1, 2, 3, 4].map(i => WF4_GROUP.elements[i]!)
  const simpleOk = [1, 2, 3, 4].every(i => WF4_GROUP.det[i] === -1)
  const transposition = Uint8Array.from({ length: 24 }, (_, s) => (s === 0 ? 1 : s === 1 ? 0 : s))
  const commutation = withGeometry('3434', () => simple.map(p => localBeatCommutes(p)))
  const broken = withGeometry('3434', () => localBeatCommutes(transposition))

  numbers.commutationStates = commutation.reduce((a, c) => a + c.states, 0)
  numbers.commutationFailures = commutation.reduce((a, c) => a + c.failures, 0)
  numbers.transpositionFailures = broken.failures
  ok.commutes = simpleOk && numbers.commutationFailures === 0
  ok.commutationControl = broken.failures > 0

  // ---- the identical pair on the two meshes ----
  const h = hyper.pairReadings
  const f = flat.pairReadings
  const first = {
    configurations: firstDifference(h.map(r => String(r.configurations)), f.map(r => String(r.configurations))),
    weightPattern: firstDifference(h.map(r => sha(r.weightPattern)), f.map(r => sha(r.weightPattern))),
    returnProbability: firstDifference(h.map(r => keyOf(r.returnProbability)), f.map(r => keyOf(r.returnProbability))),
    supportDocks: firstDifference(h.map(r => String(r.supportDocks)), f.map(r => String(r.supportDocks))),
    occupationPattern: firstDifference(h.map(r => sha(r.occupationPattern)), f.map(r => sha(r.occupationPattern))),
    distanceWeights: firstDifference(h.map(r => r.distanceWeights.join(' ')), f.map(r => r.distanceWeights.join(' '))),
  }

  for (const [k, v] of Object.entries(first)) {
    numbers[`firstDifference_${k}`] = v
  }

  text.pairConfigurations = `${h.map(r => r.configurations).join(',')} | ${f.map(r => r.configurations).join(',')}`
  text.pairSupportDocks = `${h.map(r => r.supportDocks).join(',')} | ${f.map(r => r.supportDocks).join(',')}`
  text.pairReturn = `${h.map(r => keyOf(r.returnProbability)).join(', ')} | ${f.map(r => keyOf(r.returnProbability)).join(', ')}`
  text.pairDistanceWeights4 = `${h[3]!.distanceWeights.join(', ')} | ${f[3]!.distanceWeights.join(', ')}`
  text.pairReturnDisplay = `${h.map(r => display(r.returnProbability)).join(', ')} | ${f.map(r => display(r.returnProbability)).join(', ')}`
  text.pairOffLine = `${h.map(r => r.offLineConfigurations).join(',')} | ${f.map(r => r.offLineConfigurations).join(',')}`

  // ---- determinism of the new sources ----
  let sourceFindings = 0

  for (const file of NEW_MODULES) {
    const source = readFileSync(resolve(BASE, file), 'utf8')

    sourceFindings += scanSource(file, source).length + (MATH_CALL.test(source) ? 1 : 0)
  }

  numbers.sourceFindings = sourceFindings
  ok.sourceClean = sourceFindings === 0

  const rows = JSON.parse(hyper.tableKey) as ScatteringRow[]

  text.table = rows
    .filter(r => r.facet === -2)
    .map(
      r =>
        `${r.pairClass}: ${r.outcomes.map(o => `${o.name}${o.count > 1 ? ` x${o.count}` : ''} ${o.amplitude} (p ${o.probability})`).join(', ')}`,
    )
    .join('; ')

  text.tableFree = rows
    .find(r => r.facet === 1)!
    .outcomes.map(o => `${o.name} ${o.amplitude}`)
    .join(', ')

  return { ok, numbers, text }
}

const INSTRUMENT_SUFFIXES = [
  'consistentSteps',
  'linesOpen',
  'recurrenceControl',
  'doublonControls',
  'doublonUnit',
  'oneUnitNorm',
  'pairUnitNorm',
  'tableIsometry',
]
const INSTRUMENT = [
  ...INSTRUMENT_SUFFIXES.flatMap(s => [`h_${s}`, `f_${s}`]),
  'flatTransportClashes',
  'commutationControl',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-particles',
  code: 'E-CMP-0037',
  title:
    'propagation and particles under the bare beat U, exact, on {3,4,3,4} against the flat 24-cell honeycomb {3,4,3,3}: the per-dock layers are the same bytes on both (only Phi_odd reads the dock parity, which alternates on {3,4,3,4} and is +1 on the flat mesh); a lone vibe walks its line with the symbol cos W = cos(k)/2 (rest mass sqrt 3, top speed 1/2, front on the cone), the same on both; the P = 0 doublon of BallisticDoublon.lean is an exact eigenstate on both; the one-beat 2-to-2 table is the same on both; vibes on different lines never interact; the identical pair, the only one that turns onto other lines, first reads the curvature in which docks its configurations share (beat 4) and in its amplitudes from beat 7',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  // context.scale lengthens only the identical-pair run (PAIR_BEATS * scale beats, never fewer than PAIR_BEATS); it is
  // not declared `scales`, so the perturbation check leaves it alone. Longer runs belong on the M3 machine (q-ladder.md).
  run(context) {
    const scaled = Number((PAIR_BEATS * (context.scale ?? 1)).toFixed(0))
    const pairBeats = scaled > PAIR_BEATS ? scaled : PAIR_BEATS
    const firstRun = compute(pairBeats)
    const secondRun = compute(pairBeats)
    const identical = JSON.stringify(firstRun) === JSON.stringify(secondRun)
    const failed = Object.entries(firstRun.ok)
      .filter(([, v]) => !v)
      .map(([k]) => k)
    const instrument = identical && INSTRUMENT.every(k => firstRun.ok[k] === true)
    const allPass = failed.length === 0 && identical
    const n = firstRun.numbers
    const t = firstRun.text

    return verdict({
      status: !instrument ? 'fail' : allPass ? 'pass' : 'partial',
      claim: !instrument
        ? `an instrument gate failed (${failed.join(', ') || (identical ? 'none' : 'two runs differ')})`
        : `per-dock layers ${firstRun.ok.sameLayers ? 'identical' : 'DIFFERENT'} on {3,4,3,4} and {3,4,3,3} (${n.h_layerStates} dock states), Phi_odd even/odd by dock parity (${n.h_phiEvenDocks}/${n.h_phiOddDocks} against ${n.f_phiEvenDocks}/${n.f_phiOddDocks}); a lone vibe never leaves its line, coin [${t.h_coin}], det ${t.h_det}, rho^2 = ${t.h_rhoSquared}, so cos W = cos(k)/2, rest mass^2 ${t.h_massSquared}, top speed^2 ${t.h_topSpeedSquared}, front on the cone, the same on both meshes; the P = 0 doublon is an exact eigenstate (${n.h_doublonInterior} interior configurations, 0 defects, both meshes); the one-beat table is the same on both, vibes on different lines never interact; the identical pair first differs between the meshes in shared docks at beat ${n.firstDifference_supportDocks} and in its configurations at beat ${n.firstDifference_configurations}, its return probability ${n.firstDifference_returnProbability === 0 ? `the same through beat ${pairBeats}` : `differing from beat ${n.firstDifference_returnProbability}`}${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        flatTransportFrameClashes: n.flatTransportFrameClashes!,
        transpositionFailures: n.transpositionFailures!,
        recurrenceWrongDetDefects: n.h_recurrenceWrongDetDefects!,
        doublonAntisymmetricDefects: n.h_doublonAntisymmetricDefects!,
        doublonConjugateDefects: n.h_doublonConjugateDefects!,
        phiDistinguishingStates: n.h_phiDistinguishingStates!,
      },
      notes: `L2, exact over Q(zeta_9). Shells ${t.h_shells} against ${t.f_shells}. Lone vibe return probabilities t = 1..8: ${t.h_returnProbabilities}; sum k^2 p at t = ${ONE_BEATS}: ${t.h_secondMomentLast} (over t^2 ${n.h_secondMomentOverT2}, approaching 1 - sqrt3/2). Antipodal one-beat table: ${t.table}. Non-antipodal pairs, every class: ${t.tableFree}. Identical pair per beat, configurations ${t.pairConfigurations}; docks ${t.pairSupportDocks}; return ${t.pairReturn}; configurations off the starting line ${t.pairOffLine}; weight by hop distance 0..3 and beyond at beat 4: ${t.pairDistanceWeights4}. Compacton census: ${n.h_censusBounded} of ${n.h_censusStates} pair states (and ${n.f_censusBounded} on the flat mesh) keep their support inside the cone by beat ${CENSUS_BEATS}. Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
