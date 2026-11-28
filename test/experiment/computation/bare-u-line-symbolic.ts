// Q3b symbolic: the one-line S-matrix of
// bare U as an identity in the momenta. The proof is Lean (code/proof/Vibe/LineScattering.lean, core only, grind's
// commutative-ring solver): over any commutative ring with omega, i and a half, every mode is an exact coin eigenvector,
// the like-tone S is (W P - i D) / (W + i D) in line order, i.e. Yang's R(theta1 - theta2) in the particle frame,
// opposite tones give S = -1, the spectator-stopped identical pair (w - i) / (w + i), the braid Yang-Baxter equation
// holds for one tone on words over any alphabet, and a like pair beside an opposite tone misses it by exactly
// -x y (x + y) (I + P) in numerators. This experiment ties each Lean object to bare U. Library:
// code/compute/quantum/line-symbolic (on line-scattering and ninth-extension, neither edited).
//
// Hypotheses, fixed before the run and gated below, on {3,4,3,4} and {3,4,3,3}:
// - the coin read off one beat is Lean's [[zeta6, 1 - omega], [1 - omega, zeta6]] / 2; the like-tone contact block is
//   Lean's keep -i sqrt3 / 2, swap -1/2; the opposite-tone block is -omega I; the identical pair with a spectator stays
//   with omega^2 and never turns;
// - at the 20 exact modes of E-CMP-0045 the dispersion 2 mu^2 - (a + 1/a) mu + 2 = 0 holds, Lean's mode vector equals
//   makeMode's, and Lean's rapNum / rapDen equals E-CMP-0045's rapidity (2 / sqrt3) Im(lambda) / Im(a);
// - on all 164 ordered pairs, sMatrix (left^-1 right with the block read off the beat) equals Lean's closed S, det(left)
//   is nonzero (so the S that the Lean equation pins down is unique there), the spectator S is (W - i D) / (W + i D) and
//   the opposite S is -1;
// - on all 704 ordered triples, first minus second order of yangBaxterDefects on the word (+1 r0, +1 r1, -1 r0) is
//   exactly Lean's defect -x y (x + y) / ((x + i)(y + i)(x + y + i)) on the two words of the like pair and 0 elsewhere,
//   nonzero on every triple; one tone and opposite-between give 0;
// - the Lean module states every named theorem and has no sorry, axiom or native_decide outside comments.
// Controls: a rapidity with 1 in place of sqrt3 must miss sMatrix; the defect with its sign flipped must miss; a contact
// block with keep and swap exchanged must give an S other than Lean's.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import { type Mode, type ModeSpec, LINE_FIELD, contactWords, faster, lineCoin, makeMode, pairSFrom, sMatrix, sqrtRational, yangBaxterDefects } from '@/code/compute/quantum/line-scattering'
import {
  SYM_I,
  SYM_OMEGA,
  closedCoin,
  closedContact,
  closedS,
  closedVector,
  dispersionResidue,
  leftDeterminant,
  mixedDefect,
  rapidityDifferenceParts,
  rapidityParts,
} from '@/code/compute/quantum/line-symbolic'
import { type Num, add, conj, div, equals, fromNinth, isZero, keyOf, mul, neg, rational, sameMatrix, scale, sub } from '@/code/compute/quantum/ninth-extension'
import type { Species } from '@/code/compute/quantum/particles'
import { lineFrame, routerElement } from '@/code/compute/quantum/routing'
import { type BeatGeometry, type Vibe, LINE_OF_SLOT, withGeometry } from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = ['code/compute/quantum/line-symbolic.ts', 'test/experiment/computation/bare-u-line-symbolic.ts']
const LEAN_FILE = 'code/proof/Vibe/LineScattering.lean'
const LEAN_THEOREMS = [
  'thm_line_mode_eigenvector',
  'thm_line_s_is_yang',
  'thm_line_opposite_reflects',
  'thm_line_spectator_symmetric',
  'thm_line_yang_baxter_one_tone',
  'thm_line_mixed_tone_defect',
  'thm_line_opposite_between_factorizes',
]
const MATH_CALL = /\bMath\s*\.\s*\w+/

const SLOT = 0
const REACH = 12
// a spectator in dock 0 on another line than slot 0's (E-CMP-0040)
const SPECTATOR_SLOT = 5
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

// E-CMP-0045's rapidity, (2 / sqrt 3) Im(lambda) / Im(a)
function q3bRapidity(m: Mode): Num {
  const imLambda = sub(m.lambda, conj(K, m.lambda))
  const imA = sub(m.a, conj(K, m.a))

  return kdiv(scale(kdiv(imLambda, imA), 2), sqrtRational(3n, 1n))
}

const theta = (m: Mode): Num => {
  const { num, den } = rapidityParts(m)

  return kdiv(num, den)
}

// control: the same rapidity with 1 in place of sqrt3 (theta' = (cos p / 2 + sin W) / sin p)
function wrongTheta(m: Mode): Num {
  const ab = conj(K, m.a)
  const cosP = scale(add(m.a, ab), 1, 2)
  const mu = kdiv(m.lambda, add(ONE, SYM_OMEGA))
  // sin W = (2 mu - cos p) / (2 i), sin p = (a - ab) / (2 i)
  const sinW = kdiv(sub(scale(mu, 2), cosP), scale(SYM_I, 2))
  const sinP = kdiv(sub(m.a, ab), scale(SYM_I, 2))

  return kdiv(add(scale(cosP, 1, 2), sinW), sinP)
}

const yangLine = (w: Num): Num[][] => {
  const den = add(w, SYM_I)
  const keep = kdiv(neg(SYM_I), den)
  const swap = kdiv(w, den)

  return [
    [keep, swap],
    [swap, keep],
  ]
}

type MeshReading = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  fingerprint: string
}

function meshReading(geometry: BeatGeometry): MeshReading {
  return withGeometry(geometry, () => {
    const ok: Record<string, boolean> = {}
    const numbers: Record<string, number> = {}
    const fingerprint: string[] = []
    const frame = lineFrame(SLOT, REACH)
    const coin = lineCoin(frame)
    const closed = closedCoin()
    const omegaSquared = kmul(SYM_OMEGA, SYM_OMEGA)

    // ---- the Lean constants are the beat's ----
    ok.coinIsLean = equals(coin.ff, closed.ff) && equals(coin.fb, closed.fb) && equals(coin.bf, closed.bf) && equals(coin.bb, closed.bb)

    const like = contactWords(frame, SPECIES, 0, 1)
    const opposite = contactWords(frame, SPECIES, 0, 2)
    const { keep, swap } = closedContact()

    ok.likeBlockIsLean =
      sameMatrix(like.block, [
        [keep, swap],
        [swap, keep],
      ]) && like.leakage.every(isZero)

    ok.oppositeBlockIsLean =
      sameMatrix(opposite.block, [
        [neg(SYM_OMEGA), ZERO],
        [ZERO, neg(SYM_OMEGA)],
      ]) && opposite.leakage.every(isZero)

    const spectator: Vibe = [frame.dockAt.get(0)!, SPECTATOR_SLOT, -1, 0]
    const router = routerElement(frame, [1, 0], spectator)

    ok.spectatorOffLine = LINE_OF_SLOT[SPECTATOR_SLOT] !== LINE_OF_SLOT[SLOT]
    ok.spectatorBlockIsLean =
      equals(fromNinth(K, router.stay), omegaSquared) &&
      router.turns.every(t => isZero(fromNinth(K, t))) &&
      router.factorDefects === 0 &&
      router.otherConfigurations === 0
    fingerprint.push([like, opposite].map(c => c.block.flat().map(keyOf).join(',')).join(';'), keyOf(fromNinth(K, router.stay)))

    // ---- modes ----
    const modes = SPECS.map(s => makeMode(coin, s))

    numbers.modes = modes.length
    ok.dispersionHolds = modes.every(m => isZero(dispersionResidue(m)))
    ok.vectorsAreLean = modes.every(m => {
      const v = closedVector(m)

      return equals(v.vf, m.vf) && equals(v.vb, m.vb)
    })
    ok.rapidityIsLean = modes.every(m => equals(theta(m), q3bRapidity(m)))
    ok.rapidityReal = modes.every(m => equals(theta(m), conj(K, theta(m))))
    fingerprint.push(modes.map(m => keyOf(theta(m))).join(';'))

    // ---- every ordered pair ----
    const minusOne = [
      [neg(ONE), ZERO],
      [ZERO, neg(ONE)],
    ]
    const swappedBlock = [
      [swap, keep],
      [keep, swap],
    ]

    let pairs = 0
    let likeLean = 0
    let leftInvertible = 0
    let spectatorLean = 0
    let oppositeLean = 0
    let wrongRapidityMatches = 0
    let swappedBlockMatches = 0

    for (const x of modes) {
      for (const y of modes) {
        if (!faster(x, y)) {
          continue
        }

        pairs++

        const sLike = sMatrix(x, y, like.block)
        const lean = closedS(x, y)
        const { w, d } = rapidityDifferenceParts(x, y)
        const spectatorS = sMatrix(x, y, [[omegaSquared]])

        likeLean += sameMatrix(sLike, lean) ? 1 : 0
        leftInvertible += !isZero(leftDeterminant(x, y, like.block)) ? 1 : 0
        spectatorLean += equals(spectatorS[0]![0]!, kdiv(sub(w, kmul(SYM_I, d)), add(w, kmul(SYM_I, d)))) ? 1 : 0
        oppositeLean += sameMatrix(sMatrix(x, y, opposite.block), minusOne) ? 1 : 0
        wrongRapidityMatches += sameMatrix(sLike, yangLine(sub(wrongTheta(x), wrongTheta(y)))) ? 1 : 0
        swappedBlockMatches += sameMatrix(sMatrix(x, y, swappedBlock), lean) ? 1 : 0
        fingerprint.push(`${x.spec.name}|${y.spec.name}:${keyOf(sLike[0]![0]!)}:${keyOf(sLike[1]![0]!)}`)
      }
    }

    numbers.pairs = pairs
    numbers.likeLean = likeLean
    numbers.leftInvertible = leftInvertible
    numbers.wrongRapidityMatches = wrongRapidityMatches
    numbers.swappedBlockMatches = swappedBlockMatches
    ok.likeIsLean = likeLean === pairs && pairs > 0
    ok.leftInvertible = leftInvertible === pairs
    ok.spectatorIsLean = spectatorLean === pairs
    ok.oppositeIsLean = oppositeLean === pairs
    ok.wrongRapidityMisses = wrongRapidityMatches === 0
    ok.swappedBlockMisses = swappedBlockMatches === 0

    // ---- every ordered triple: the exact Yang-Baxter defect ----
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

    const unit = (word: readonly number[]): Map<string, Num> => new Map([[word.join(','), ONE]])
    const likeWords = ['0,1,2', '1,0,2']

    let defectExact = 0
    let defectNonzero = 0
    let flippedMatches = 0
    let oneToneFailures = 0
    let separatedFailures = 0

    for (const t of triples) {
      const [a, b, c] = t
      const x = sub(theta(a), theta(b))
      const y = sub(theta(b), theta(c))
      const want = mixedDefect(x, y)
      const { first, second } = yangBaxterDefects(pairS, t, unit(MIXED_ADJACENT))
      const keys = new Set([...first.keys(), ...second.keys(), ...likeWords])
      const diff = (k: string): Num => sub(first.get(k) ?? ZERO, second.get(k) ?? ZERO)

      defectExact += [...keys].every(k => equals(diff(k), likeWords.includes(k) ? want : ZERO)) ? 1 : 0
      defectNonzero += !isZero(want) ? 1 : 0
      flippedMatches += likeWords.every(k => equals(diff(k), neg(want))) ? 1 : 0
      oneToneFailures += yangBaxterDefects(pairS, t, unit(ONE_TONE)).defects > 0 ? 1 : 0
      separatedFailures += yangBaxterDefects(pairS, t, unit(MIXED_SEPARATED)).defects > 0 ? 1 : 0
      fingerprint.push(keyOf(want))
    }

    numbers.defectExact = defectExact
    numbers.defectNonzero = defectNonzero
    numbers.flippedMatches = flippedMatches
    numbers.oneToneFailures = oneToneFailures
    numbers.separatedFailures = separatedFailures
    ok.defectIsLean = defectExact === triples.length && triples.length > 0
    ok.defectNonzero = defectNonzero === triples.length
    ok.flippedDefectMisses = flippedMatches === 0
    ok.oneToneYangBaxter = oneToneFailures === 0
    ok.separatedYangBaxter = separatedFailures === 0

    return { ok, numbers, fingerprint: createHash('sha256').update(fingerprint.join('\n')).digest('hex') }
  })
}

function leanReading(): { ok: Record<string, boolean>; numbers: Record<string, number> } {
  const source = readFileSync(resolve(BASE, LEAN_FILE), 'utf8')
  const code = source.replace(/\/-[\s\S]*?-\//g, '').replace(/--.*$/gm, '')
  const stated = LEAN_THEOREMS.filter(name => new RegExp(`\\btheorem\\s+${name}\\b`).test(code))
  const banned = (code.match(/\bsorry\b|\baxiom\b|\bnative_decide\b|\badmit\b/g) ?? []).length
  const vibe = readFileSync(resolve(BASE, 'code/proof/Vibe.lean'), 'utf8')

  return {
    ok: {
      leanTheoremsStated: stated.length === LEAN_THEOREMS.length,
      leanNoBannedTokens: banned === 0,
      leanImported: /^import Vibe\.LineScattering$/m.test(vibe),
    },
    numbers: { leanTheorems: stated.length, leanBannedTokens: banned },
  }
}

function compute(): { ok: Record<string, boolean>; numbers: Record<string, number> } {
  const hyper = meshReading('3434')
  const flat = meshReading('3433')
  const lean = leanReading()
  const ok: Record<string, boolean> = { ...lean.ok }
  const numbers: Record<string, number> = { ...lean.numbers }

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
  }

  ok.sameBytes = hyper.fingerprint === flat.fingerprint

  let sourceFindings = 0

  for (const file of NEW_MODULES) {
    const source = readFileSync(resolve(BASE, file), 'utf8')

    sourceFindings += scanSource(file, source).length + (MATH_CALL.test(source) ? 1 : 0)
  }

  numbers.sourceFindings = sourceFindings
  ok.sourceClean = sourceFindings === 0

  return { ok, numbers }
}

const INSTRUMENT = [
  'h_wrongRapidityMisses',
  'f_wrongRapidityMisses',
  'h_swappedBlockMisses',
  'f_swappedBlockMisses',
  'h_flippedDefectMisses',
  'f_flippedDefectMisses',
  'h_spectatorOffLine',
  'f_spectatorOffLine',
  'leanTheoremsStated',
  'leanNoBannedTokens',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-line-symbolic',
  code: 'E-CMP-0049',
  title:
    'the one-line S-matrix of the bare beat U as an identity in the momenta: Lean proves (core only, every momentum, any commutative ring with omega, i and a half) that the like-tone S is Yang\'s R(theta_1 - theta_2), opposite tones give S = -1, the spectator-stopped identical pair (w - i)/(w + i), Yang-Baxter holds for one tone, and a like pair beside an opposite tone misses it by exactly -x y (x + y)/((x + i)(y + i)(x + y + i)) (I + P); this experiment ties every Lean object to bare U on {3,4,3,4} and {3,4,3,3}',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L3',
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

    return verdict({
      status: !instrument ? 'fail' : allPass ? 'pass' : 'partial',
      claim: !instrument
        ? `an instrument gate failed (${failed.join(', ') || (identical ? 'none' : 'two runs differ')})`
        : `Lean (Vibe.LineScattering, ${n.leanTheorems} theorems, ${n.leanBannedTokens} banned tokens) proves the one-line S-matrix of bare U symbolically; tied to the beat on both meshes, same bytes ${firstRun.ok.sameBytes ? 'yes' : 'NO'}: coin, like block, opposite block and spectator block equal Lean's (${['coinIsLean', 'likeBlockIsLean', 'oppositeBlockIsLean', 'spectatorBlockIsLean'].every(k => firstRun.ok[`h_${k}`]) ? 'yes' : 'NO'}); ${n.h_modes} modes satisfy the dispersion with Lean's vectors and rapidity; sMatrix equals Lean's closed S on ${n.h_likeLean} of ${n.h_pairs} pairs with det(left) nonzero on ${n.h_leftInvertible}; mixed-tone Yang-Baxter defect equals -x y (x + y)/((x + i)(y + i)(x + y + i)) on the like pair's two words on ${n.h_defectExact} of ${n.h_triples} triples, nonzero on ${n.h_defectNonzero}; one tone ${n.h_oneToneFailures} and opposite-between ${n.h_separatedFailures} failures; controls: wrong rapidity ${n.h_wrongRapidityMatches}, swapped block ${n.h_swappedBlockMatches}, flipped defect ${n.h_flippedMatches} matches${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        wrongRapidityMatches: n.h_wrongRapidityMatches ?? -1,
        swappedBlockMatches: n.h_swappedBlockMatches ?? -1,
        flippedDefectMatches: n.h_flippedMatches ?? -1,
      },
      notes: `L3: the identities are Lean theorems in the momenta (check:lean builds them and audits their axioms); the run checks that the Lean coin, blocks, vectors, rapidity, S and defect are bare U's, at the 20 exact modes of E-CMP-0045 in K = Q(zeta_9)(i, sqrt 91). Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
