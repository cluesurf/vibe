// Q3b of the quantum ladder (item vibe-computation-models-0049, decision 004 of vibe/computation/models): the
// momentum-resolved two-body S-matrix of bare U on one mesh line, per species pair, and a three-body factorization
// (Yang-Baxter) test, exact over K = Q(zeta_9)(i, sqrt 91), on {3,4,3,4} against the flat {3,4,3,3}. Library:
// code/compute/quantum/line-scattering (on routing, particles and bare-beat, none edited).
//
// Hypotheses, fixed after one exploratory probe (W/tmp/q3b-probe.ts) and gated below:
// - every plane-wave mode (20 modes, cos p in {0, +-3/5, +-8/17}, both signs of sin p, both bands) is an exact eigenvector
//   of the line coin read off the beat, and its current equals -sin p / (2 sin W);
// - like tone, distinct roles: S is unitary and in the particle frame EQUALS Yang's R(w) = (w I - i P) / (w + i), prefactor
//   exactly 1, at w = theta_1 - theta_2 with the rapidity theta = (2 / sqrt 3) Im(lambda) / Im(a), on every ordered pair;
// - opposite tones: S = -1 on the kept word (total reflection, momentum-independent phase);
// - identical pair: alone the line block is lossy (it turns onto other lines), so the line S is not unitary on any pair;
//   with the turn switched off (block omega^2, a spectator) it is the symmetric channel (w - i) / (w + i) exactly;
// - the one-beat contact block is omega R(-1/sqrt 3), momentum-independent (Q2's u = 1/sqrt 3 in the u I + i P reading);
// - the 2-string theta = +-i/2 at total momentum 0 has beat eigenvalue (7 + 15 omega)/13 and |a|^2 = 1/13: Q2's P = 0
//   doublon, so Q1's u* = -sqrt3/2 is a pulse-doublon rapidity difference inside this same R;
// - Yang-Baxter: holds on every ordered triple for three roles of one tone; fails for a like pair next to an opposite
//   tone (the opposite tone reflects, so the like pair meets twice at the wrong rapidity differences), holds trivially
//   when the opposite tone sits between the like pair;
// - factorization under bare U itself: the Bethe ansatz built from the two-body S is an exact eigenvector of the beat on
//   a window (0 defects) for one tone, and is not for the mixed adjacent case;
// - the two meshes give identical bytes.
// Controls: a planted genuine three-body phase (omega on three vibes within two coordinates) must break the ansatz; the
// particle-frame S used as if it were the line-frame S must break the two-body ansatz; a constant braid matrix I + P
// must fail Yang-Baxter.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OMEGA, add as addNinth, equals as equalsNinth, ninth, scale as scaleNinth, mul as mulNinth } from '@/code/algebra/ninth-field'
import { scanSource } from '@/code/check/determinism'
import {
  type Mode,
  type ModeSpec,
  type PairS,
  type WordVectorK,
  LINE_FIELD,
  betheAmplitudes,
  contactWords,
  eigenAnsatzDefects,
  faster,
  isUnitaryK,
  lineCoin,
  makeMode,
  pairSFrom,
  particleFrame,
  plantedThreeBodyBeat,
  sMatrix,
  sqrtRational,
  yangBaxterDefects,
  yangR,
} from '@/code/compute/quantum/line-scattering'
import {
  type Num,
  add,
  conj,
  div,
  equals,
  fromNinth,
  generator,
  keyOf,
  mul,
  neg,
  rational,
  sameMatrix,
  scale,
  sub,
  toComplexDisplay,
} from '@/code/compute/quantum/ninth-extension'
import { DOUBLON_LAMBDA_13, type Species } from '@/code/compute/quantum/particles'
import { lineFrame } from '@/code/compute/quantum/routing'
import { type BeatGeometry, withGeometry } from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = [
  'code/compute/quantum/ninth-extension.ts',
  'code/compute/quantum/line-scattering.ts',
  'test/experiment/computation/bare-u-line-scattering.ts',
]
const MATH_CALL = /\bMath\s*\.\s*\w+/

const SLOT = 0
const REACH = 12
const WINDOW = 5
const COSINES: readonly (readonly [bigint, bigint])[] = [
  [0n, 1n],
  [3n, 5n],
  [-3n, 5n],
  [8n, 17n],
  [-8n, 17n],
]
// species indices: 0 = (+1, role 0), 1 = (+1, role 1), 2 = (-1, role 0), 3 = (+1, role 2)
const SPECIES: readonly Species[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [1, 2],
]
const ONE_TONE = [0, 1, 3]
const MIXED_ADJACENT = [0, 1, 2]
const MIXED_SEPARATED = [0, 2, 1]

const K = LINE_FIELD
const kmul = (a: Num, b: Num): Num => mul(K, a, b)
const kdiv = (a: Num, b: Num): Num => div(K, a, b)
const I = generator(K, 0)
const ONE = rational(K, 1)

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

const display = (x: Num): string => {
  const [re, im] = toComplexDisplay(K, x)

  return `${re.toFixed(6)}${im < 0 ? '-' : '+'}${(im < 0 ? -im : im).toFixed(6)}i`
}

// theta = (2 / sqrt 3) Im(lambda) / Im(a)
function rapidity(m: Mode): Num {
  const imLambda = sub(m.lambda, conj(K, m.lambda))
  const imA = sub(m.a, conj(K, m.a))

  return kdiv(scale(kdiv(imLambda, imA), 2), sqrtRational(3n, 1n))
}

const unitVector = (word: readonly number[]): WordVectorK => new Map([[word.join(','), ONE]])

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

    numbers.modes = modes.length
    fingerprint.push(modes.map(m => `${m.spec.name}:${keyOf(m.lambda)}:${m.velocitySign}`).join(';'))

    // ---- contact blocks read off one beat ----
    const like = contactWords(frame, SPECIES, 0, 1)
    const opposite = contactWords(frame, SPECIES, 0, 2)
    const identical = contactWords(frame, SPECIES, 0, 0)
    const z = (k: number): Num => fromNinth(K, ninth([0, 0, 0, 0, 0, 0].map((_, j) => (j === k ? 1 : 0))))
    const turnLeak = scale(add(add(rational(K, 2), z(4)), z(5)), 11, 144)
    const omega = fromNinth(K, OMEGA)
    const rootThree = sqrtRational(3n, 1n)

    ok.likeLossless = like.leakage.every(l => equals(l, rational(K, 0)))
    ok.oppositeLossless = opposite.leakage.every(l => equals(l, rational(K, 0)))
    ok.identicalTurnLeak = equals(identical.leakage[0]!, turnLeak)
    // the one-beat block, particle frame: omega R(-1/sqrt 3)
    ok.contactIsOmegaYang = sameMatrix(
      particleFrame(like.block),
      yangR(neg(kdiv(ONE, rootThree))).map(row => row.map(x => kmul(omega, x))),
    )

    ok.oppositeBlockMirror = sameMatrix(opposite.block, [
      [neg(omega), rational(K, 0)],
      [rational(K, 0), neg(omega)],
    ])
    fingerprint.push([like, opposite, identical].map(c => c.block.flat().map(keyOf).join(',')).join(';'))
    text.likeBlock = like.block.map(r => r.map(display).join(' ')).join(' ; ')
    text.identicalStay = display(identical.block[0]![0]!)

    // ---- two-body S-matrices on every ordered pair ----
    let pairs = 0
    let likeUnitary = 0
    let likeYang = 0
    let oppositeReflect = 0
    let identicalLossy = 0
    let spectatorSymmetric = 0

    const thetas = new Map(modes.map(m => [m.spec.name, rapidity(m)] as const))
    const samples: string[] = []

    for (const x of modes) {
      for (const y of modes) {
        if (!faster(x, y)) {
          continue
        }

        pairs++

        const w = sub(thetas.get(x.spec.name)!, thetas.get(y.spec.name)!)
        const sLike = sMatrix(x, y, like.block)
        const sOpposite = sMatrix(x, y, opposite.block)
        const sAlone = sMatrix(x, y, identical.block)
        const sSpectator = sMatrix(x, y, [[kmul(omega, omega)]])

        likeUnitary += isUnitaryK(sLike) ? 1 : 0
        likeYang += sameMatrix(particleFrame(sLike), yangR(w)) ? 1 : 0
        oppositeReflect += sameMatrix(sOpposite, [
          [neg(ONE), rational(K, 0)],
          [rational(K, 0), neg(ONE)],
        ])
          ? 1
          : 0
        identicalLossy += !isUnitaryK(sAlone) ? 1 : 0
        spectatorSymmetric += equals(sSpectator[0]![0]!, kdiv(sub(w, I), add(w, I))) ? 1 : 0

        if (samples.length < 3 && x.velocitySign !== y.velocitySign) {
          const loss = sub(ONE, kmul(sAlone[0]![0]!, conj(K, sAlone[0]![0]!)))

          samples.push(
            `(${x.spec.name}, ${y.spec.name}): w ${display(w)}, S_like keep ${display(sLike[0]![0]!)} swap ${display(sLike[1]![0]!)}, identical alone ${display(sAlone[0]![0]!)} (loss ${display(loss)})`,
          )
        }

        fingerprint.push(`${x.spec.name}|${y.spec.name}:${keyOf(sLike[0]![0]!)}:${keyOf(sLike[1]![0]!)}:${keyOf(sAlone[0]![0]!)}`)
      }
    }

    numbers.pairs = pairs
    ok.likeUnitary = likeUnitary === pairs
    ok.likeIsYang = likeYang === pairs
    ok.oppositeReflects = oppositeReflect === pairs
    ok.identicalLossy = identicalLossy === pairs
    ok.spectatorSymmetric = spectatorSymmetric === pairs
    numbers.likeYang = likeYang
    text.samples = samples.join('; ')
    text.thetas = modes
      .filter((_, i) => i % 4 === 0)
      .map(m => `${m.spec.name} ${display(thetas.get(m.spec.name)!)}`)
      .join(', ')

    // ---- the 2-string at total momentum 0 is Q2's doublon ----
    // theta = -i/2 forces a = -2 sin W / sqrt 3; with cos W = (a + 1/a)/4 this gives 208 s^4 - 168 s^2 + 9 = 0 for
    // s = sin W, the bound root s^2 = 3/52; then cos 2W = 1 - 2 s^2, sin 2W = -(4 s^2 + 3) / (4 sqrt 3), and the second
    // constituent (theta = +i/2, a2 = 1/a1) has the same mu, so E = omega mu^2.
    const s2 = ninth([3], 52)
    const quartic = addNinth(addNinth(scaleNinth(mulNinth(s2, s2), 208), scaleNinth(s2, -168)), ninth([9]))
    const cos2W = addNinth(ninth([1]), scaleNinth(s2, -2))
    // i sin 2W = -(4 s^2 + 3) i / (4 sqrt 3) = -(4 s^2 + 3)(2 omega + 1) / 12
    const iSin2W = mulNinth(scaleNinth(addNinth(scaleNinth(s2, 4), ninth([3])), -1, 12), addNinth(scaleNinth(OMEGA, 2), ninth([1])))
    const muSquared = addNinth(cos2W, iSin2W)
    const stringE = mulNinth(OMEGA, muSquared)

    ok.stringIsDoublon =
      quartic.n.every(c => c === 0n) && equalsNinth(stringE, scaleNinth(DOUBLON_LAMBDA_13, 1, 13)) && equalsNinth(scaleNinth(s2, 4, 3), ninth([1], 13))

    // ---- Yang-Baxter on every ordered triple ----
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

    const ybeFailures = (letters: readonly number[], s: PairS = pairS): number =>
      triples.filter(t => yangBaxterDefects(s, t, unitVector(letters)).defects > 0).length

    numbers.ybeOneTone = ybeFailures(ONE_TONE)
    numbers.ybeMixedAdjacent = ybeFailures(MIXED_ADJACENT)
    numbers.ybeMixedSeparated = ybeFailures(MIXED_SEPARATED)
    ok.ybeOneTone = numbers.ybeOneTone === 0
    ok.ybeMixedAdjacentFails = numbers.ybeMixedAdjacent === triples.length
    ok.ybeMixedSeparated = numbers.ybeMixedSeparated === 0

    const constantBraid: PairS = () => ({ keep: ONE, swap: ONE })

    numbers.ybeConstantControl = ybeFailures(ONE_TONE, constantBraid)
    ok.ybeConstantControlFails = numbers.ybeConstantControl === triples.length

    // ---- factorization under bare U: the Bethe ansatz on a window ----
    const sorted = [...modes].sort((p, q) => (faster(p, q) ? -1 : faster(q, p) ? 1 : 0))
    // velocities +1/2, +0.42, -0.45 and +0.45, -0.42, -1/2 (two triples spanning both bands and signs)
    const chosen: [Mode, Mode, Mode][] = [
      [sorted[0]!, sorted[8]!, sorted[14]!],
      [sorted[2]!, sorted[12]!, sorted[19]!],
    ]

    chosen.forEach((t, i) => assertOrdered(t, `triple ${i}`))

    const eigen = (modesUsed: readonly Mode[], letters: readonly number[], beat?: Parameters<typeof eigenAnsatzDefects>[6], s: PairS = pairS) => {
      const amplitudes = betheAmplitudes(s, modesUsed, unitVector(letters))

      return eigenAnsatzDefects(frame, SPECIES, modesUsed, amplitudes, letters, WINDOW, beat)
    }

    let oneToneDefects = 0
    let mixedAdjacentDefects = 0
    let mixedSeparatedDefects = 0
    let plantedDefects = 0
    let stray = 0
    let interior = 0

    for (const t of chosen) {
      const a = eigen(t, ONE_TONE)
      const b = eigen(t, MIXED_ADJACENT)
      const c = eigen(t, MIXED_SEPARATED)
      const planted = eigen(t, ONE_TONE, plantedThreeBodyBeat(frame))

      oneToneDefects += a.defects
      mixedAdjacentDefects += b.defects
      mixedSeparatedDefects += c.defects
      plantedDefects += planted.defects
      stray += a.strayConfigurations + b.strayConfigurations + c.strayConfigurations
      interior += a.interior
    }

    const twoBody = [sorted[0]!, sorted[19]!]
    const likeTwo = eigen(twoBody, [0, 1])
    const oppositeTwo = eigen(twoBody, [0, 2])
    const wrongFrame = eigen(twoBody, [0, 1], undefined, pairSFrom(frame, SPECIES, (x, y, c) => particleFrame(sMatrix(x, y, c))))

    numbers.threeBodyInterior = interior
    numbers.oneToneDefects = oneToneDefects
    numbers.mixedAdjacentDefects = mixedAdjacentDefects
    numbers.mixedSeparatedDefects = mixedSeparatedDefects
    numbers.plantedDefects = plantedDefects
    numbers.twoBodyInterior = likeTwo.interior
    numbers.wrongFrameDefects = wrongFrame.defects
    ok.factorizesOneTone = oneToneDefects === 0 && interior > 0
    ok.mixedAdjacentDoesNotFactorize = mixedAdjacentDefects > 0
    ok.mixedSeparatedFactorizes = mixedSeparatedDefects === 0
    ok.plantedThreeBodyFails = plantedDefects > 0
    ok.twoBodyEigen = likeTwo.defects === 0 && oppositeTwo.defects === 0 && likeTwo.interior > 0
    ok.wrongFrameFails = wrongFrame.defects > 0
    ok.noStray = stray === 0 && likeTwo.strayConfigurations === 0 && oppositeTwo.strayConfigurations === 0

    fingerprint.push(`${oneToneDefects}:${mixedAdjacentDefects}:${mixedSeparatedDefects}:${plantedDefects}:${wrongFrame.defects}`)

    return { ok, numbers, text, fingerprint: createHash('sha256').update(fingerprint.join('\n')).digest('hex') }
  })
}

function assertOrdered([a, b, c]: readonly [Mode, Mode, Mode], label: string): void {
  if (!(faster(a, b) && faster(b, c))) {
    throw new Error(`FAIL: ${label} is not ordered by velocity`)
  }
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
  'h_likeLossless',
  'f_likeLossless',
  'h_twoBodyEigen',
  'f_twoBodyEigen',
  'h_plantedThreeBodyFails',
  'f_plantedThreeBodyFails',
  'h_wrongFrameFails',
  'f_wrongFrameFails',
  'h_ybeConstantControlFails',
  'f_ybeConstantControlFails',
  'h_noStray',
  'f_noStray',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-line-scattering',
  code: 'E-CMP-0045',
  title:
    'one-line scattering of the bare beat U, exact over Q(zeta_9)(i, sqrt 91), on {3,4,3,4} against {3,4,3,3}: for two roles of one tone the momentum-resolved S-matrix IS Yang\'s R(theta_1 - theta_2), prefactor 1, with rapidity theta = (2/sqrt 3) Im(lambda)/Im(a); opposite tones reflect with S = -1 at every momentum; an identical pair leaks off the line (lossy S) unless a spectator stops the turn; the 2-string theta = +-i/2 is the P = 0 doublon; Yang-Baxter and three-body factorization hold for one tone (the Bethe ansatz is an exact eigenvector of U) and fail when a like pair shares the line with an opposite tone next to it',
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
        : `one-line scattering of bare U, the same bytes on {3,4,3,4} and {3,4,3,3} (${firstRun.ok.sameBytes ? 'yes' : 'NO'}), ${n.h_modes} exact modes, ${n.h_pairs} ordered pairs: like tone distinct roles S unitary and equal to Yang R(theta_1 - theta_2) with prefactor 1 on ${n.h_likeYang} of ${n.h_pairs} (theta = (2/sqrt3) Im lambda / Im a); opposite tones S = -1 (reflection) on all; identical pair alone lossy on all, with the turn stopped it is (w - i)/(w + i) on all; one-beat contact block = omega R(-1/sqrt3) (${firstRun.ok.h_contactIsOmegaYang ? 'yes' : 'no'}); the 2-string +-i/2 at P = 0 is the doublon (7 + 15 omega)/13 with |a|^2 = 1/13 (${firstRun.ok.h_stringIsDoublon ? 'yes' : 'no'}). Yang-Baxter failures over ${n.h_triples} ordered triples: one tone ${n.h_ybeOneTone}, like pair next to an opposite tone ${n.h_ybeMixedAdjacent}, opposite tone between the like pair ${n.h_ybeMixedSeparated}, constant-braid control ${n.h_ybeConstantControl}. Bethe ansatz under bare U on ${n.h_threeBodyInterior} interior three-vibe configurations: one tone ${n.h_oneToneDefects} defects, mixed adjacent ${n.h_mixedAdjacentDefects}, mixed separated ${n.h_mixedSeparatedDefects}, planted three-body phase ${n.h_plantedDefects}; two-body ansatz 0 defects, wrong frame ${n.h_wrongFrameDefects}${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        plantedThreeBodyFails: firstRun.ok.h_plantedThreeBodyFails ? 1 : 0,
        wrongFrameFails: firstRun.ok.h_wrongFrameFails ? 1 : 0,
        constantBraidFails: firstRun.ok.h_ybeConstantControlFails ? 1 : 0,
      },
      notes: `L2, exact over K = Q(zeta_9)(i, sqrt 91); the verdicts hold at the ${n.h_modes} exact sample modes (cos p in {0, +-3/5, +-8/17}), not as a symbolic identity in p. Contact block (line order) [${t.h_likeBlock}], identical stay ${t.h_identicalStay}. Rapidities: ${t.h_thetas}. Samples: ${t.h_samples}. Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
