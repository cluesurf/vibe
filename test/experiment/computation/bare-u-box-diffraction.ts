// Q3c door B of the quantum ladder: the
// opposite-tone box. Does three-body diffraction on one line of bare U vanish on some set of momenta, and if so, does the
// like pair inside a box (tone word -, +, +, -) get a fixed nontrivial gate from repeated bounces? Exact over K =
// Q(zeta_9)(i, sqrt 91) at Q3b's 20 sample modes, on {3,4,3,4} against the flat {3,4,3,3}. Library:
// code/compute/quantum/box-diffraction (on line-scattering, ninth-extension, routing, bare-beat, none edited).
//
// Declared before the run: diffraction zero on an open set or curve of incoming momenta would make the box a
// multi-pass ball machine (escalate); bounded below at every sample records door B as scrambling. Hypotheses, fixed after
// one exploratory probe (W/tmp/q3c-box/probe.ts) and gated below:
// - the two collision orders of a like pair beside an opposite tone differ by exactly D(x, y) (I + P) (Lean),
//   on both orientations (+, +, -) and (-, +, +), so the antisymmetric role channel never diffracts and the symmetric
//   channel diffracts unless x y (x + y) = 0, i.e. two rapidities coincide;
// - theta^2 = -Im(lambda) / (3 Im(zeta6 lambda)) on every mode, and theta_1 = theta_2 for two modes iff they are the same
//   physical wave (a2, l2) = +-(a1, l1): coincident rapidities are coincident modes;
// - two vibes of one mode in contact are a plane-wave eigenstate only when lambda^2 is an eigenvalue of the contact block,
//   which happens only at cos p = 0 (lambda^2 = -omega), and for the like pair only in the antisymmetric role channel;
// - so on the whole zero-diffraction set the like pair's role register is the antisymmetric word, where every like
//   contact is the phase -1: no gate. Under bare U the Bethe ansatz is an exact eigenvector on the coincident triple and
//   the coincident box with antisymmetric roles, and fails with symmetric roles;
// - the box seals its roles: under bare U the tone word in line order never changes, wall roles never move, and roles
//   never cross a wall, while in a one-tone word they do (control).
// Controls: (-, +, -) and (-, +, -, +) factorize at generic momenta (pure reflection), a planted three-body phase breaks
// the latter, symmetric inputs break the coincident ansatz, two runs and the two meshes give identical bytes.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OMEGA } from '@/code/algebra/ninth-field'
import { scanSource } from '@/code/check/determinism'
import {
  coincidentKernel,
  isReal,
  orderMismatch,
  pairResidue,
  partnerVectorsAgree,
  plantedTripleBeat,
  rapidity,
  rapidityResidue,
  rapiditySquaredFromEnergy,
  samePhysicalMode,
  wordRun,
} from '@/code/compute/quantum/box-diffraction'
import {
  type Mode,
  type ModeSpec,
  type WordVectorK,
  LINE_FIELD,
  betheAmplitudes,
  contactWords,
  eigenAnsatzDefects,
  faster,
  lineCoin,
  makeMode,
  pairSFrom,
  yangBaxterDefects,
} from '@/code/compute/quantum/line-scattering'
import { type Num, add, div, equals, fromNinth, generator, isZero, keyOf, mul, neg, rational, sub, toComplexDisplay } from '@/code/compute/quantum/ninth-extension'
import type { Species } from '@/code/compute/quantum/particles'
import { type LineVibe, lineFrame } from '@/code/compute/quantum/routing'
import { type BeatGeometry, withGeometry } from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = ['code/compute/quantum/box-diffraction.ts', 'test/experiment/computation/bare-u-box-diffraction.ts']
const MATH_CALL = /\bMath\s*\.\s*\w+/

const SLOT = 0
const REACH = 12
const WINDOW_THREE = 5
const WINDOW_FOUR = 4
const RUN_BEATS = 6
const COSINES: readonly (readonly [bigint, bigint])[] = [
  [0n, 1n],
  [3n, 5n],
  [-3n, 5n],
  [8n, 17n],
  [-8n, 17n],
]
// species indices: 0 = (+1, role 0), 1 = (+1, role 1), 2 = (-1, role 0), 3 = (+1, role 2), 4 = (-1, role 1)
const SPECIES: readonly Species[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [1, 2],
  [-1, 1],
]
const LIKE_LIKE_OPPOSITE = [0, 1, 2]
const OPPOSITE_LIKE_LIKE = [2, 0, 1]
const BOX = [2, 0, 1, 4]
const REFLECT_THREE = [2, 0, 4]
const ALTERNATING = [2, 0, 4, 1]

const K = LINE_FIELD
const kmul = (a: Num, b: Num): Num => mul(K, a, b)
const kdiv = (a: Num, b: Num): Num => div(K, a, b)
const I = generator(K, 0)
const ONE = rational(K, 1)
const ZERO = rational(K, 0)

const SPECS: ModeSpec[] = COSINES.flatMap(cos =>
  ([1, -1] as const).flatMap(sinSign =>
    ([1, -1] as const).map(band => ({
      name: `${cos[0]}/${cos[1]}${sinSign > 0 ? '+' : '-'}${band > 0 ? 'u' : 'd'}`,
      cos,
      sinSign,
      band,
    })),
  ),
)

const display = (x: Num): string => toComplexDisplay(K, x)[0].toExponential(4)

// -x y (x + y) / ((x + i)(y + i)(x + y + i)), Lean's mixed-tone defect, recomputed here
function mixedDefect(x: Num, y: Num): Num {
  const s = add(x, y)

  return kdiv(neg(kmul(kmul(x, y), s)), kmul(kmul(add(x, I), add(y, I)), add(s, I)))
}

const vector = (entries: readonly (readonly [readonly number[], number])[]): WordVectorK =>
  new Map(entries.map(([w, v]) => [w.join(','), rational(K, v)] as const))

// the like pair's two words of a letter word (letters 0 and 1 swapped), with signs
const withSwap = (letters: readonly number[], sign: number): WordVectorK =>
  vector([
    [letters, 1],
    [letters.map(l => (l === 0 ? 1 : l === 1 ? 0 : l)), sign],
  ])

type MeshReading = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  text: Record<string, string>
  fingerprint: string
}

function meshReading(geometry: BeatGeometry): MeshReading {
  return withGeometry(geometry, () => {
    const ok: Record<string, boolean> = {}
    const numbers: Record<string, number> = {}
    const text: Record<string, string> = {}
    const fingerprint: string[] = []
    const frame = lineFrame(SLOT, REACH)
    const coin = lineCoin(frame)
    const modes = SPECS.map(s => makeMode(coin, s))
    const theta = new Map(modes.map(m => [m, rapidity(m)] as const))

    numbers.modes = modes.length

    // ---- one mode: the rapidity is a function of the beat eigenvalue ----
    ok.rapidityResidueZero = modes.every(m => isZero(rapidityResidue(m)))
    ok.rapidityFromEnergy = modes.every(m => equals(kmul(theta.get(m)!, theta.get(m)!), rapiditySquaredFromEnergy(m)))
    ok.rapidityRealNonzero = modes.every(m => isReal(theta.get(m)!) && !isZero(theta.get(m)!))
    fingerprint.push(modes.map(m => `${m.spec.name}:${keyOf(theta.get(m)!)}`).join(';'))

    // ---- two modes: equal rapidity iff the same physical wave ----
    let orderedPairs = 0
    let pairResidueZero = 0
    let equalRapidity = 0
    let equalAndPartner = 0
    let partnerAndEqual = 0
    let partners = 0
    let partnersAgree = 0

    for (const a of modes) {
      for (const b of modes) {
        if (a === b) {
          continue
        }

        orderedPairs++
        pairResidueZero += isZero(pairResidue(a, b)) ? 1 : 0

        const same = equals(theta.get(a)!, theta.get(b)!)
        const partner = samePhysicalMode(a, b)

        equalRapidity += same ? 1 : 0
        equalAndPartner += same && partner ? 1 : 0
        partners += partner ? 1 : 0
        partnerAndEqual += partner && same ? 1 : 0
        partnersAgree +=
          partner &&
          partnerVectorsAgree(a, b) &&
          a.velocitySign === b.velocitySign &&
          a.velocitySquared[0] * b.velocitySquared[1] === b.velocitySquared[0] * a.velocitySquared[1]
            ? 1
            : 0
      }
    }

    numbers.orderedPairs = orderedPairs
    numbers.equalRapidity = equalRapidity
    numbers.partners = partners
    ok.pairResidueZero = pairResidueZero === orderedPairs
    ok.equalRapidityIsPartner = equalRapidity === equalAndPartner && partners === partnerAndEqual && partners > 0
    ok.partnersSameWave = partnersAgree === partners

    // ---- two vibes of one mode in contact: only at cos p = 0, only in the -omega channel ----
    const like = contactWords(frame, SPECIES, 0, 1)
    const opposite = contactWords(frame, SPECIES, 0, 2)
    const minusOmega = neg(fromNinth(K, OMEGA))

    let likeCoincident = 0
    let likeAntisymmetric = 0
    let likeSymmetric = 0
    let oppositeCoincident = 0
    let coincidentAtCosZero = 0
    let cosZero = 0

    for (const m of modes) {
      const l = coincidentKernel(m, like.block)
      const o = coincidentKernel(m, opposite.block)
      const isCosZero = m.spec.cos[0] === 0n

      cosZero += isCosZero ? 1 : 0
      likeCoincident += isZero(l.determinant) ? 1 : 0
      likeAntisymmetric += l.antisymmetric ? 1 : 0
      likeSymmetric += l.symmetric ? 1 : 0
      oppositeCoincident += isZero(o.determinant) ? 1 : 0
      coincidentAtCosZero +=
        isCosZero && isZero(l.determinant) && isZero(o.determinant) && l.antisymmetric && equals(kmul(m.lambda, m.lambda), minusOmega)
          ? 1
          : 0
    }

    numbers.likeCoincident = likeCoincident
    numbers.oppositeCoincident = oppositeCoincident
    numbers.likeSymmetricCoincident = likeSymmetric
    ok.coincidenceOnlyAtCosZero =
      likeCoincident === cosZero && oppositeCoincident === cosZero && coincidentAtCosZero === cosZero && cosZero > 0
    ok.coincidentLikeIsAntisymmetric = likeAntisymmetric === cosZero && likeSymmetric === 0

    // ---- every velocity-ordered triple: the two orders differ by D (I + P), never zero ----
    const pairS = pairSFrom(frame, SPECIES)
    const triples: [Mode, Mode, Mode][] = []

    for (const a of modes) {
      for (const b of modes) {
        for (const c of modes) {
          if (faster(a, b) && faster(b, c)) {
            triples.push([a, b, c])
          }
        }
      }
    }

    numbers.triples = triples.length

    let defectFormula = 0
    let defectNonzero = 0
    let antisymmetricClean = 0
    let mismatchClosed = 0
    let mismatchNonzero = 0
    let mismatchLow: Num | undefined
    let mismatchHigh: Num | undefined
    let lowLabel = ''

    for (const t of triples) {
      const [a, b, c] = t
      const x = sub(theta.get(a)!, theta.get(b)!)
      const y = sub(theta.get(b)!, theta.get(c)!)
      const d = mixedDefect(x, y)

      for (const [letters, sign] of [
        [LIKE_LIKE_OPPOSITE, 1],
        [OPPOSITE_LIKE_LIKE, -1],
      ] as const) {
        const swapped = letters.map(l => (l === 0 ? 1 : l === 1 ? 0 : l))
        const single = yangBaxterDefects(pairS, t, vector([[letters, 1]]))
        const diffAt = (w: readonly number[]): Num => sub(single.first.get(w.join(',')) ?? ZERO, single.second.get(w.join(',')) ?? ZERO)
        const want = sign > 0 ? d : neg(d)

        defectFormula += equals(diffAt(letters), want) && equals(diffAt(swapped), want) ? 1 : 0
        defectNonzero += single.defects > 0 ? 1 : 0
        antisymmetricClean += yangBaxterDefects(pairS, t, withSwap(letters, -1)).defects === 0 ? 1 : 0
      }

      const m = orderMismatch(x, y)

      mismatchClosed += equals(m.direct, m.closed) ? 1 : 0
      mismatchNonzero += isZero(m.closed) ? 0 : 1

      // display-only extremes (no verdict reads them)
      const value = toComplexDisplay(K, m.closed)[0]

      if (mismatchLow === undefined || value < toComplexDisplay(K, mismatchLow)[0]) {
        mismatchLow = m.closed
        lowLabel = `${a.spec.name}, ${b.spec.name}, ${c.spec.name}`
      }

      if (mismatchHigh === undefined || value > toComplexDisplay(K, mismatchHigh)[0]) {
        mismatchHigh = m.closed
      }
    }

    numbers.defectFormula = defectFormula
    numbers.defectNonzero = defectNonzero
    numbers.antisymmetricClean = antisymmetricClean
    numbers.mismatchNonzero = mismatchNonzero
    ok.defectIsLeanFormula = defectFormula === 2 * triples.length
    ok.diffractsOnEveryTriple = defectNonzero === 2 * triples.length && mismatchNonzero === triples.length
    ok.antisymmetricNeverDiffracts = antisymmetricClean === 2 * triples.length
    ok.mismatchClosedForm = mismatchClosed === triples.length
    text.mismatchRange = `${display(mismatchLow!)} (${lowLabel}) to ${display(mismatchHigh!)}`

    // ---- under bare U: the Bethe ansatz on windows ----
    const kp = modes.find(m => m.spec.cos[0] === 0n && m.velocitySign > 0)!
    const km = modes.find(m => m.spec.cos[0] === 0n && m.velocitySign < 0)!
    const q = modes.find(m => m.spec.name === '3/5+u')!
    const sorted = [...modes].sort((p, r) => (faster(p, r) ? -1 : faster(r, p) ? 1 : 0))
    const generic: Mode[] = [sorted[0]!, sorted[6]!, sorted[12]!, sorted[19]!]

    ok.layoutOrdered =
      faster(q, km) &&
      faster(kp, q) &&
      faster(kp, km) &&
      generic.every((m, i) => i === 0 || faster(generic[i - 1]!, m)) &&
      !samePhysicalMode(kp, km)

    const eigen = (
      used: readonly Mode[],
      letters: readonly number[],
      input: WordVectorK,
      reach: number,
      beat?: Parameters<typeof eigenAnsatzDefects>[6],
    ) => eigenAnsatzDefects(frame, SPECIES, used, betheAmplitudes(pairS, used, input), letters, reach, beat)

    const runs = {
      tripleAntisymmetric: eigen([q, km, km], LIKE_LIKE_OPPOSITE, withSwap(LIKE_LIKE_OPPOSITE, -1), WINDOW_THREE),
      tripleSymmetric: eigen([q, km, km], LIKE_LIKE_OPPOSITE, withSwap(LIKE_LIKE_OPPOSITE, 1), WINDOW_THREE),
      mirrorAntisymmetric: eigen([kp, kp, q], OPPOSITE_LIKE_LIKE, withSwap(OPPOSITE_LIKE_LIKE, -1), WINDOW_THREE),
      mirrorSymmetric: eigen([kp, kp, q], OPPOSITE_LIKE_LIKE, withSwap(OPPOSITE_LIKE_LIKE, 1), WINDOW_THREE),
      boxCoincidentAntisymmetric: eigen([kp, kp, km, km], BOX, withSwap(BOX, -1), WINDOW_FOUR),
      boxCoincidentSymmetric: eigen([kp, kp, km, km], BOX, withSwap(BOX, 1), WINDOW_FOUR),
      boxGenericWord: eigen(generic, BOX, vector([[BOX, 1]]), WINDOW_FOUR),
      boxGenericAntisymmetric: eigen(generic, BOX, withSwap(BOX, -1), WINDOW_FOUR),
      reflectThree: eigen(generic.slice(0, 3), REFLECT_THREE, vector([[REFLECT_THREE, 1]]), WINDOW_THREE),
      alternating: eigen(generic, ALTERNATING, vector([[ALTERNATING, 1]]), WINDOW_FOUR),
      alternatingPlanted: eigen(generic, ALTERNATING, vector([[ALTERNATING, 1]]), WINDOW_FOUR, plantedTripleBeat(frame)),
    }

    for (const [k, r] of Object.entries(runs)) {
      numbers[`${k}Defects`] = r.defects
      numbers[`${k}Interior`] = r.interior
    }

    const clean = (k: keyof typeof runs): boolean => runs[k].defects === 0 && runs[k].interior > 0
    const broken = (k: keyof typeof runs): boolean => runs[k].defects > 0

    ok.coincidentTripleFactorizes = clean('tripleAntisymmetric') && clean('mirrorAntisymmetric')
    ok.coincidentSymmetricFails = broken('tripleSymmetric') && broken('mirrorSymmetric')
    ok.coincidentBoxFactorizes = clean('boxCoincidentAntisymmetric')
    ok.coincidentBoxSymmetricFails = broken('boxCoincidentSymmetric')
    ok.genericBoxDiffracts = broken('boxGenericWord')
    ok.genericBoxAntisymmetricClean = clean('boxGenericAntisymmetric')
    ok.reflectionControls = clean('reflectThree') && clean('alternating')
    ok.plantedFails = broken('alternatingPlanted')
    ok.noStray = Object.values(runs).every(r => r.strayConfigurations === 0)
    fingerprint.push(Object.values(runs).map(r => `${r.defects}/${r.interior}`).join(','))

    // ---- what the coincident box does to its roles: one scalar on the antisymmetric word ----
    const boxAmplitudes = betheAmplitudes(pairS, [kp, kp, km, km], withSwap(BOX, -1))
    const swappedBox = BOX.map(l => (l === 0 ? 1 : l === 1 ? 0 : l)).join(',')
    const antisymmetricEverywhere = [...boxAmplitudes.values()].every(
      v => v.size === 2 && equals(v.get(BOX.join(',')) ?? ZERO, neg(v.get(swappedBox) ?? ZERO)),
    )
    const sortedOut = [...boxAmplitudes.keys()].find(k => k === '2,3,0,1')
    const scalar = sortedOut === undefined ? undefined : boxAmplitudes.get(sortedOut)!.get(BOX.join(','))

    numbers.boxArrangements = boxAmplitudes.size
    ok.coincidentBoxIsScalar = antisymmetricEverywhere && scalar !== undefined && equals(kmul(scalar, scalar), ONE)
    text.boxScalar = scalar === undefined ? 'none' : keyOf(scalar)
    fingerprint.push(text.boxScalar)

    // ---- the box seals its roles (bare U, exact runs) ----
    const box: LineVibe[] = [
      [-3, true, -1, 0],
      [-1, true, 1, 0],
      [1, false, 1, 1],
      [3, false, -1, 1],
    ]
    const sealed: LineVibe[] = [
      [-3, true, 1, 0],
      [-1, false, -1, 0],
      [1, true, 1, 1],
      [3, false, 1, 2],
    ]
    const oneTone: LineVibe[] = [
      [-3, true, 1, 0],
      [-1, false, 1, 1],
      [1, false, 1, 2],
    ]
    const boxRun = wordRun(frame, box, RUN_BEATS)
    const sealedRun = wordRun(frame, sealed, RUN_BEATS)
    const oneToneRun = wordRun(frame, oneTone, RUN_BEATS)
    const lineClean = (run: typeof boxRun): boolean => run.every(b => b.offLine === 0 && b.toneWordDefects === 0)
    const moved = (run: typeof boxRun, j: number): number => run.reduce((s, b) => s + b.roleMoved[j]!, 0)

    numbers.boxRunConfigurations = boxRun[RUN_BEATS - 1]!.configurations
    numbers.boxWallMoved = moved(boxRun, 0) + moved(boxRun, 3)
    numbers.boxLikeMoved = moved(boxRun, 1) + moved(boxRun, 2)
    numbers.sealedAcrossWall = moved(sealedRun, 0) + moved(sealedRun, 1)
    numbers.sealedInside = moved(sealedRun, 2) + moved(sealedRun, 3)
    numbers.oneToneFirstMoved = moved(oneToneRun, 0)
    // role 0 reaching the far end of the one-tone word (the control that the check can fire)
    numbers.oneToneFarReach = oneToneRun.reduce((s, b) => s + b.speciesAt[2]![0]!, 0)
    ok.boxSealsRoles =
      lineClean(boxRun) && lineClean(sealedRun) && numbers.boxWallMoved === 0 && numbers.boxLikeMoved > 0 && numbers.sealedAcrossWall === 0 && numbers.sealedInside > 0
    ok.oneToneControlMoves = lineClean(oneToneRun) && numbers.oneToneFirstMoved > 0 && numbers.oneToneFarReach > 0
    fingerprint.push(JSON.stringify([boxRun, sealedRun, oneToneRun]))

    // display only: the two rapidities of the cos p = 0 modes
    text.cosZeroRapidities = `${display(theta.get(kp)!)}, ${display(theta.get(km)!)}`

    return { ok, numbers, text, fingerprint: createHash('sha256').update(fingerprint.join('\n')).digest('hex') }
  })
}

function compute(): { ok: Record<string, boolean>; numbers: Record<string, number>; text: Record<string, string> } {
  const hyper = meshReading('3434')
  const flat = meshReading('3433')
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

  ok.sameBytes = hyper.fingerprint === flat.fingerprint

  let sourceFindings = 0

  for (const file of NEW_MODULES) {
    const source = readFileSync(resolve(BASE, file), 'utf8')

    sourceFindings += scanSource(file, source).length + (MATH_CALL.test(source) ? 1 : 0)
  }

  numbers.sourceFindings = sourceFindings
  ok.sourceClean = sourceFindings === 0

  return { ok, numbers, text }
}

const INSTRUMENT = [
  'h_rapidityResidueZero',
  'f_rapidityResidueZero',
  'h_defectIsLeanFormula',
  'f_defectIsLeanFormula',
  'h_coincidentSymmetricFails',
  'f_coincidentSymmetricFails',
  'h_reflectionControls',
  'f_reflectionControls',
  'h_plantedFails',
  'f_plantedFails',
  'h_oneToneControlMoves',
  'f_oneToneControlMoves',
  'h_noStray',
  'f_noStray',
  'h_layoutOrdered',
  'f_layoutOrdered',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-box-diffraction',
  code: 'E-CMP-0054',
  title:
    'the opposite-tone box under the bare beat U (Q3c door B), exact over Q(zeta_9)(i, sqrt 91) on {3,4,3,4} against {3,4,3,3}: three-body diffraction of a like pair beside an opposite tone is D(x, y) (I + P), zero only in the antisymmetric role channel or where two rapidities coincide; theta^2 is a function of the beat eigenvalue, so coincident rapidities are one physical mode, and two vibes of one mode in contact exist only at cos p = 0 and, for the like pair, only with antisymmetric roles; so wherever nothing diffracts the like pair carries one word on which every contact is the phase -1, and no gate; the box seals its two roles',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    const firstRun = compute()
    const secondRun = compute()
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
        : `opposite-tone box under bare U, the same bytes on {3,4,3,4} and {3,4,3,3} (${firstRun.ok.sameBytes ? 'yes' : 'NO'}), ${n.h_modes} exact modes: theta^2 = -Im(lambda)/(3 Im(zeta6 lambda)) on all; equal rapidity on ${n.h_equalRapidity} of ${n.h_orderedPairs} ordered pairs, every one a parity partner (the same wave); two vibes of one mode in contact only at cos p = 0 (${n.h_likeCoincident} modes, like pair antisymmetric only). Over ${n.h_triples} triples and both orientations the two collision orders differ by Lean's D(x, y)(I + P) on ${n.h_defectFormula}, diffract on ${n.h_defectNonzero}, antisymmetric roles clean on ${n.h_antisymmetricClean}; symmetric-channel mismatch ${t.h_mismatchRange} (display). Bethe ansatz under bare U: coincident triple antisymmetric ${n.h_tripleAntisymmetricDefects} defects of ${n.h_tripleAntisymmetricInterior}, symmetric ${n.h_tripleSymmetricDefects}; coincident box antisymmetric ${n.h_boxCoincidentAntisymmetricDefects} of ${n.h_boxCoincidentAntisymmetricInterior}, symmetric ${n.h_boxCoincidentSymmetricDefects}; generic box ${n.h_boxGenericWordDefects}, its antisymmetric channel ${n.h_boxGenericAntisymmetricDefects}; (-,+,-) ${n.h_reflectThreeDefects}, (-,+,-,+) ${n.h_alternatingDefects}, planted ${n.h_alternatingPlantedDefects}; the coincident box maps its role word to ${firstRun.ok.h_coincidentBoxIsScalar ? 'a unit scalar times itself' : 'NOT a scalar'}. Box runs to beat ${RUN_BEATS}: walls' roles moved ${n.h_boxWallMoved}, like roles ${n.h_boxLikeMoved}, across a wall ${n.h_sealedAcrossWall}, one-tone control ${n.h_oneToneFirstMoved}${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        plantedFails: firstRun.ok.h_plantedFails ? 1 : 0,
        coincidentSymmetricFails: firstRun.ok.h_coincidentSymmetricFails ? 1 : 0,
        reflectionControls: firstRun.ok.h_reflectionControls ? 1 : 0,
        oneToneControlMoves: firstRun.ok.h_oneToneControlMoves ? 1 : 0,
      },
      notes: `L2, exact over K = Q(zeta_9)(i, sqrt 91). The defect formula is Lean's (every momentum); the rapidity identities are checked at the ${n.h_modes} sample modes and follow by hand for every momentum (Q3c door B). cos p = 0 rapidities ${t.h_cosZeroRapidities}. Coincident box scalar ${t.h_boxScalar}. Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
