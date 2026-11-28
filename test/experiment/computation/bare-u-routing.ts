// Q3 of the quantum ladder (item vibe-computation-models-0035, decision 004 of vibe/computation/models): interference
// routing and gates found in the bare beat U, not hand-placed, exact, on the hyperbolic {3,4,3,4} against the flat
// 24-cell honeycomb {3,4,3,3} (code/rule/bare-beat withGeometry; the readings are code/compute/quantum/routing). Only the
// initial state is chosen; the excitation layout (line, coordinates, directions, species, a spectator vibe) is declared
// structure. No layer is edited, no gate inserted, no schedule beyond the beat.
//
// Hypotheses, fixed after one exploratory probe (W/tmp/q3-probe.ts) and gated below:
// - E1 wire: a lone vibe of any species never leaves its line, its line table does not depend on the species, its norm
//   is 1 and its cone-front weight is 4^(1 - t);
// - E2 splitter: the line coin on the two direction ports is an exact unitary with zero leakage and order 3;
// - E3 entangler with a spectator: a head-on contact of two like-tone vibes, roles 0 and 1, with a third vibe in the dock
//   on another line, acts on the two role qubits as exactly omega M (Q1's meeting gate), fidelity 1, leakage 0, and the
//   spectator factors out;
// - E4 entangler alone: without the spectator the unequal-role block is the same and lossless, the equal-role inputs leak
//   by turning (11 (2 + z^4 + z^5) / 144 each);
// - E5 tone-parity splitter: tones 0/1 role-labelled, the contact block on (tone pair, which side) is unitary, lossless,
//   and its equal-tone and opposite-tone blocks are not proportional (a controlled operation);
// - E6 router: an identical pair turns onto each of the other 11 lines with one amplitude; a spectator stops the turn;
// - E7 parity switch: on one line, two vibes at odd separation evolve exactly as the product of their lone runs; at even
//   separation they do not;
// - scheduled meeting: two vibes released at -d and +d share a dock after d beats with weight exactly 16^-d;
// - every run keeps the species multiset; the two meshes give identical bytes for every element.
// Universality, from the found blocks themselves: each found exchange block, lifted to one triple, has a rational
// non-integer 2 cos(theta) and a non-commuting conjugate (dense in PU(2) on the triple), and the triple generators span
// su(9) on the S = 1 sector of six (Q1's Lie closure, recomputed). Controls: plain swaps (finite), and the cursor
// instrument on synthetic history states (one passes, one mixed fails).
// Readings, not gates: the Feynman-cursor history fraction per beat, the best single-dock delivery of a lone vibe.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Ninth,
  type NinthMatrix,
  OMEGA,
  ONE,
  ZERO,
  add,
  conj,
  dagger,
  equals,
  identityMatrix,
  isZero,
  keyOf,
  matMul,
  mul,
  ninth,
  sameMatrix,
  scale,
  scaleMatrix,
  toComplex,
} from '@/code/algebra/ninth-field'
import { scanSource } from '@/code/check/determinism'
import {
  isExactlyUnitary,
  lieClosureDimension,
  meetGate,
  spinSector,
  swapGate,
  tripleDensityWitness,
  tripleGenerators,
} from '@/code/compute/quantum/gate-set'
import type { Species } from '@/code/compute/quantum/particles'
import {
  type CursorBeat,
  type LineFrame,
  type PortPair,
  type WordGate,
  type WordVector,
  averageGateFidelity,
  coinElement,
  contactBlock,
  contactWordGate,
  cursorRun,
  historyFraction,
  lineFrame,
  lineKet,
  liftPairToSector,
  parityPassDefects,
  routerElement,
  scheduledMeeting,
  wireRun,
  wordGate,
} from '@/code/compute/quantum/routing'
import {
  type BeatGeometry,
  type Vibe,
  LINE_OF_SLOT,
  amplitudeOf,
  applyBeat,
  encodeConfig,
  withGeometry,
} from '@/code/rule/bare-beat'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_MODULES = ['code/compute/quantum/routing.ts', 'test/experiment/computation/bare-u-routing.ts']
const MATH_CALL = /\bMath\s*\.\s*\w+/

const SLOT = 0
const REACH = 12
const WIRE_BEATS = 8
const PARITY_BEATS = 6
const MEET_DISTANCES = [1, 2, 3, 4]
const CURSOR_BEATS = 8
const WIRE_SPECIES: readonly Species[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, 1],
  [1, 2],
]
// a spectator in dock 0 on another line than slot 0's
const SPECTATOR_SLOT = 5
const QUBITS: readonly PortPair[] = [
  [
    [1, 0],
    [1, 0],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
]
// (tone of the role-0 vibe, tone of the role-1 vibe, which one came from the left)
const TONE_REGISTER: readonly PortPair[] = ([1, -1] as const).flatMap(t0 =>
  ([1, -1] as const).flatMap(t1 => [
    [
      [t0, 0],
      [t1, 1],
    ] as PortPair,
    [
      [t1, 1],
      [t0, 0],
    ] as PortPair,
  ]),
)
const CURSOR = { cursor: [0, true, 1] as const, registerRoles: [0, 1], program: [[2, false, 1, 2], [4, false, 1, 3]] as const }

const sha = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16)
const show = (x: Ninth): string => keyOf(x)
const display = (x: Ninth): number => Number(toComplex(x)[0].toPrecision(6))
const showMatrix = (m: NinthMatrix): string => m.map(r => r.map(show).join(', ')).join('; ')
const weight = (a: Ninth): Ninth => mul(a, conj(a))
const fourPower = (e: number): Ninth => (e >= 0 ? ninth([4n ** BigInt(e)]) : ninth([1], 4n ** BigInt(-e)))

// the word gate as a 4 x 4 matrix on two two-level letters (index a * 2 + b): unequal letters keep or swap, equal letters
// take `equal`
function wordGateMatrix(gate: WordGate, equal: Ninth): Ninth[][] {
  const m = identityMatrix(4).map(r => r.map(() => ZERO))

  m[0]![0] = equal
  m[3]![3] = equal
  m[1]![1] = gate.keep
  m[2]![1] = gate.swap
  m[2]![2] = gate.keep
  m[1]![2] = gate.swap

  return m
}

const proportional = (a: NinthMatrix, b: NinthMatrix): boolean => {
  let ab = ZERO
  let aa = ZERO
  let bb = ZERO

  a.forEach((row, i) =>
    row.forEach((x, j) => {
      ab = add(ab, mul(conj(x), b[i]![j]!))
      aa = add(aa, weight(x))
      bb = add(bb, weight(b[i]![j]!))
    }),
  )

  return equals(weight(ab), mul(aa, bb))
}

const subBlock = (m: NinthMatrix, rows: readonly number[]): Ninth[][] => rows.map(i => rows.map(j => m[i]![j]!))

type GeometryReport = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  text: Record<string, string>
  spectatorBlock: Ninth[][]
  bareBlock: Ninth[][]
  word: WordGate
  cursor: CursorBeat[]
  fingerprint: string
}

function cursorIdeal(gate: WordGate): WordVector[][] {
  const inputs = CURSOR.registerRoles.map(r => new Map([[`${r},2,3`, ONE]]) as WordVector)
  const p1 = inputs.map(v => wordGate(gate, 0, v))
  const p2 = p1.map(v => wordGate(gate, 1, v))

  return [inputs, p1, p2]
}

function measureGeometry(geometry: BeatGeometry): GeometryReport {
  return withGeometry(geometry, () => {
    const ok: Record<string, boolean> = {}
    const numbers: Record<string, number> = {}
    const text: Record<string, string> = {}
    const frame: LineFrame = lineFrame(SLOT, REACH)
    const spectator: Vibe = [frame.dockAt.get(0)!, SPECTATOR_SLOT, -1, 0]

    ok.spectatorOffLine = LINE_OF_SLOT[SPECTATOR_SLOT] !== LINE_OF_SLOT[SLOT]

    // ---- E1 the wire ----
    const wire = wireRun(frame, WIRE_SPECIES, WIRE_BEATS)

    ok.wireOnLine = wire.every(w => w.offLine === 0)
    ok.wireSpeciesBlind = wire.every(w => w.speciesTableDefects === 0)
    ok.wireUnitNorm = wire.every(w => equals(w.norm, ONE))
    ok.wireFront = wire.every(w => equals(w.front, fourPower(1 - w.beat)))
    text.wireBest = wire.map(w => `${show(w.best)}@${w.bestK}`).join(', ')
    text.wireBestDisplay = wire.map(w => display(w.best)).join(', ')
    text.wireFront = wire.map(w => show(w.front)).join(', ')

    // translation: the beat at coordinate 3 is the beat at 0 shifted by 3 (the coin is the same on every dock)
    const at0 = applyBeat(lineKet(frame, [[0, true, 1, 0]]))
    const at3 = applyBeat(lineKet(frame, [[3, true, 1, 0]]))

    ok.wireTranslation =
      equals(
        amplitudeOf(at0, encodeConfig([[frame.dockAt.get(1)!, SLOT, 1, 0]])),
        amplitudeOf(at3, encodeConfig([[frame.dockAt.get(4)!, SLOT, 1, 0]])),
      ) && at0.amp.size === at3.amp.size

    // ---- E2 the splitter ----
    const coin = coinElement(frame)

    ok.coinUnitary = coin.unitary && isZero(coin.leakage)
    ok.coinOrderThree = coin.order === 3
    text.coin = showMatrix(coin.matrix)
    text.coinWeights = coin.matrix.map(r => r.map(x => show(weight(x))).join(', ')).join('; ')

    // ---- E3 and E4 the entangler, with and without a spectator ----
    const target = scaleMatrix(meetGate(2), OMEGA)
    const withSpectator = contactBlock(frame, QUBITS, spectator)
    const alone = contactBlock(frame, QUBITS)

    ok.spectatorIsOmegaMeet =
      sameMatrix(withSpectator.block, target) &&
      withSpectator.leakage.every(isZero) &&
      withSpectator.factorDefects === 0 &&
      withSpectator.leakConfigurations === 0
    ok.spectatorFidelityOne = equals(averageGateFidelity(withSpectator.block, target), ONE)
    ok.aloneUnequalLossless =
      isZero(alone.leakage[1]!) &&
      isZero(alone.leakage[2]!) &&
      sameMatrix(subBlock(alone.block, [1, 2]), subBlock(target, [1, 2]))

    const turnLeak = scale(ninth([22, 0, 0, 0, 11, 11]), 1, 144)

    ok.aloneEqualLeak = equals(alone.leakage[0]!, turnLeak) && equals(alone.leakage[3]!, turnLeak)

    const fidelityAlone = averageGateFidelity(alone.block, target)

    text.aloneFidelity = show(fidelityAlone)
    text.aloneLeakage = show(alone.averageLeakage)
    text.aloneStay = show(alone.block[0]![0]!)
    numbers.aloneFidelity = display(fidelityAlone)
    numbers.aloneLeakage = display(alone.averageLeakage)
    numbers.contactSpeciesDefects = withSpectator.speciesDefects + alone.speciesDefects

    // ---- E5 the tone-parity splitter ----
    const tone = contactBlock(frame, TONE_REGISTER)
    const blocks = [0, 2, 4, 6].map(i => subBlock(tone.block, [i, i + 1]))

    ok.toneUnitary = isExactlyUnitary(tone.block) && tone.leakage.every(isZero)
    // order (t0, t1): (+,+), (+,-), (-,+), (-,-); equal tones 0 and 3, opposite 1 and 2
    ok.toneControlled =
      sameMatrix(blocks[0]!, blocks[3]!) &&
      sameMatrix(blocks[1]!, blocks[2]!) &&
      !proportional(blocks[0]!, blocks[1]!)
    text.toneEqualBlock = showMatrix(blocks[0]!)
    text.toneOppositeBlock = showMatrix(blocks[1]!)
    numbers.toneSpeciesDefects = tone.speciesDefects

    // ---- E6 the router ----
    const router = routerElement(frame, [1, 0])
    const routerStopped = routerElement(frame, [1, 0], spectator)

    ok.routerIsotropic =
      router.turns.length === 11 && router.isotropic && router.otherConfigurations === 0 && equals(router.turnWeight, turnLeak)

    ok.routerStopped =
      routerStopped.turns.length === 0 && equals(weight(routerStopped.stay), ONE) && routerStopped.factorDefects === 0
    text.routerStay = show(router.stay)
    text.routerTurn = show(router.turns[0]!)
    text.routerStoppedStay = show(routerStopped.stay)

    // ---- E7 the parity switch and the scheduled meeting ----
    const odd = [1, 3].map(s => parityPassDefects(frame, s, [1, 0], [1, 1], PARITY_BEATS))
    const even = parityPassDefects(frame, 2, [1, 0], [1, 1], PARITY_BEATS)
    const oddIdentical = parityPassDefects(frame, 1, [1, 0], [1, 0], PARITY_BEATS)

    ok.parityOddFree = odd.every(run => run.every(d => d === 0)) && oddIdentical.every(d => d === 0)
    ok.parityEvenInteracts = even.some(d => d > 0)
    text.parityEven = even.join(',')

    const meetings = MEET_DISTANCES.map(d => scheduledMeeting(frame, d, [1, 0], [1, 1]))

    ok.scheduledMeeting = meetings.every((m, i) => equals(m, fourPower(-2 * MEET_DISTANCES[i]!)))
    text.scheduledMeeting = meetings.map(show).join(', ')

    // ---- the word gate and the Feynman cursor ----
    const word = contactWordGate(frame, 1, 0, 2)
    const wordBack = contactWordGate(frame, 1, 2, 0)
    const wordOther = contactWordGate(frame, 1, 1, 3)

    ok.wordGateUniform =
      isZero(word.leak) &&
      [wordBack, wordOther].every(g => equals(g.keep, word.keep) && equals(g.swap, word.swap) && isZero(g.leak))
    text.wordKeep = show(word.keep)
    text.wordSwap = show(word.swap)

    const cursor = cursorRun(frame, CURSOR, cursorIdeal(word), CURSOR_BEATS)

    ok.cursorOnLine = cursor.every(c => c.offLine === 0 && c.speciesDefects === 0 && equals(c.total, ONE))
    text.cursorHistory = cursor.map(c => show(c.history)).join(', ')
    text.cursorHistoryDisplay = cursor.map(c => display(c.history)).join(', ')
    text.cursorPrefixes = cursor.map(c => c.prefixWeights.map(display).join('/')).join(', ')
    text.cursorConfigurations = cursor.map(c => c.configurations).join(',')

    const fingerprint = sha(
      JSON.stringify({
        wire: wire.map(w => [w.table, show(w.best), w.bestK]),
        coin: text.coin,
        spectator: showMatrix(withSpectator.block),
        alone: showMatrix(alone.block),
        tone: showMatrix(tone.block),
        router: [text.routerStay, text.routerTurn, text.routerStoppedStay],
        parity: text.parityEven,
        meetings: text.scheduledMeeting,
        word: [text.wordKeep, text.wordSwap],
        cursor: [text.cursorHistory, text.cursorPrefixes, text.cursorConfigurations],
      }),
    )

    return {
      ok,
      numbers,
      text,
      spectatorBlock: withSpectator.block,
      bareBlock: alone.block,
      word,
      cursor,
      fingerprint,
    }
  })
}

function compute(): { ok: Record<string, boolean>; numbers: Record<string, number>; text: Record<string, string> } {
  const ok: Record<string, boolean> = {}
  const numbers: Record<string, number> = {}
  const text: Record<string, string> = {}
  const hyper = measureGeometry('3434')
  const flat = measureGeometry('3433')

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

  ok.sameElements = hyper.fingerprint === flat.fingerprint

  // ---- universality from the found blocks ----
  const three = spinSector(3, 1)
  const omegaSquared = mul(OMEGA, OMEGA)
  // g = B_01 B_12 on (1, 1, 1): the equal-role eigenvalue squared
  const trivial = mul(hyper.spectatorBlock[0]![0]!, hyper.spectatorBlock[0]![0]!)
  const particleWitness = tripleDensityWitness(
    liftPairToSector(hyper.spectatorBlock, three, 0, 1),
    liftPairToSector(hyper.spectatorBlock, three, 1, 2),
    trivial,
  )
  const wordMatrix = wordGateMatrix(hyper.word, hyper.spectatorBlock[0]![0]!)
  const wordWitness = tripleDensityWitness(
    liftPairToSector(wordMatrix, three, 0, 1),
    liftPairToSector(wordMatrix, three, 1, 2),
    trivial,
  )
  const swapWitness = tripleDensityWitness(
    liftPairToSector(swapGate(2), three, 0, 1),
    liftPairToSector(swapGate(2), three, 1, 2),
    ONE,
  )

  ok.equalPhaseOmegaSquared = equals(hyper.spectatorBlock[0]![0]!, omegaSquared)
  ok.particleFrameDense = particleWitness.irrationalAngle && particleWitness.nonCommutingConjugate && particleWitness.trivialEigenvalue
  ok.wordFrameDense = wordWitness.irrationalAngle && wordWitness.nonCommutingConjugate && wordWitness.trivialEigenvalue
  ok.swapControlFinite = !swapWitness.irrationalAngle
  ok.wordUnitary = isExactlyUnitary(wordMatrix)
  text.particleTwoCos = show(particleWitness.twoCos)
  text.wordTwoCos = show(wordWitness.twoCos)
  text.swapTwoCos = show(swapWitness.twoCos)

  const six = spinSector(6, 2)
  const lie = lieClosureDimension(tripleGenerators(six, 2), 200)

  numbers.lieDimension = lie.dimension
  ok.su9 = lie.dimension === 80 && lie.closed

  // ---- the cursor is not retracting: Feynman's backward hop applies the inverse, U's second contact the same gate ----
  const wordSquare = matMul(wordMatrix, wordMatrix)

  let wordPower: NinthMatrix = wordMatrix
  let wordOrder = 0

  for (let n = 1; n <= 12; n++) {
    if (sameMatrix(wordPower, identityMatrix(4))) {
      wordOrder = n
      break
    }

    wordPower = matMul(wordPower, wordMatrix)
  }

  numbers.wordOrder = wordOrder
  ok.cursorNotRetracting = !sameMatrix(wordSquare, identityMatrix(4)) && !sameMatrix(dagger(wordMatrix), wordMatrix)

  // ---- the cursor instrument on synthetic history states ----
  const ideal = cursorIdeal(hyper.word)
  const half = ninth([1], 2)
  const pure = new Map<string, WordVector[]>([
    ['x0', ideal[0]!.map(v => new Map([...v].map(([w, a]) => [w, mul(a, half)] as const)))],
    ['x2', ideal[2]!.map(v => new Map([...v].map(([w, a]) => [w, mul(a, ninth([0, 0, 0, 1], 2))] as const)))],
  ])
  const mixed = new Map<string, WordVector[]>([
    [
      'x',
      ideal[0]!.map((v, r) => {
        const out = new Map(v)

        for (const [w, a] of ideal[1]![r]!) {
          out.set(w, add(out.get(w) ?? ZERO, a))
        }

        return out
      }),
    ],
  ])
  const pureReading = historyFraction(pure, ideal)
  const mixedReading = historyFraction(mixed, ideal)

  ok.cursorInstrumentPure = equals(pureReading.history, pureReading.total) && !isZero(pureReading.total)
  ok.cursorInstrumentMixed = isZero(mixedReading.history) && !isZero(mixedReading.total)

  // ---- determinism of the new sources ----
  let sourceFindings = 0

  for (const file of NEW_MODULES) {
    const source = readFileSync(resolve(BASE, file), 'utf8')

    sourceFindings += scanSource(file, source).length + (MATH_CALL.test(source) ? 1 : 0)
  }

  numbers.sourceFindings = sourceFindings
  ok.sourceClean = sourceFindings === 0

  const firstBelow = hyper.cursor.find(c => !equals(c.history, c.total))

  numbers.cursorFirstBelowOne = firstBelow?.beat ?? 0
  numbers.cursorHistoryLast = display(hyper.cursor[hyper.cursor.length - 1]!.history)

  return { ok, numbers, text }
}

const INSTRUMENT = [
  'h_spectatorOffLine',
  'f_spectatorOffLine',
  'h_wireUnitNorm',
  'f_wireUnitNorm',
  'h_cursorOnLine',
  'f_cursorOnLine',
  'swapControlFinite',
  'cursorInstrumentPure',
  'cursorInstrumentMixed',
  'sourceClean',
]

export default experiment({
  id: 'computation/bare-u-routing',
  code: 'E-CMP-0040',
  title:
    'interference routing and gates found in the bare beat U, exact, on {3,4,3,4} against {3,4,3,3}: lines are lossless wires that carry any species, the line coin is an order-3 beam splitter (1/4 : 3/4), a head-on like-tone contact with a spectator vibe in the dock is exactly omega times the meeting gate (fidelity 1, leakage 0) and leaks 11 (2 + z^4 + z^5)/144 on equal roles without one, opposite tones mirror, an identical pair is a 12-way line router a spectator switches off, odd separation switches interaction off; the found blocks are dense (su(9) on the S = 1 sector) only with the layout declared, a scheduled meeting lands with weight 16^-d, and the Feynman cursor fails because a second contact repeats the gate instead of undoing it',
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
        : `elements found in bare U, the same bytes on {3,4,3,4} and {3,4,3,3} (${firstRun.ok.sameElements ? 'yes' : 'NO'}): wire (lone vibe, off-line weight 0, species-blind, front 4^(1-t)); splitter (coin [${t.h_coin}], order 3, leakage 0); entangler with spectator = omega M exactly (fidelity 1, leakage 0); entangler alone fidelity ${t.h_aloneFidelity} (~${n.h_aloneFidelity}), average leakage ${t.h_aloneLeakage} (~${n.h_aloneLeakage}); tone-parity splitter unitary and controlled; router stay ${t.h_routerStay}, each of 11 turns ${t.h_routerTurn}, stopped by a spectator; odd separation never interacts; scheduled meeting ${t.h_scheduledMeeting} (16^-d). Universality with the layout declared: 2 cos theta ${t.particleTwoCos} (particle frame), ${t.wordTwoCos} (line-order frame), Lie dimension ${n.lieDimension} (su(9)); swap control ${t.swapTwoCos}. Feynman cursor: history fraction ${t.h_cursorHistoryDisplay} over beats 1..${CURSOR_BEATS}, first below 1 at beat ${n.cursorFirstBelowOne}; the line-order contact gate has order ${n.wordOrder} and is not an involution${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`,
      metrics: n,
      control: {
        identicalBytes: identical ? 1 : 0,
        swapControlIrrational: firstRun.ok.swapControlFinite ? 0 : 1,
        cursorInstrumentPure: firstRun.ok.cursorInstrumentPure ? 1 : 0,
        cursorInstrumentMixed: firstRun.ok.cursorInstrumentMixed ? 1 : 0,
        parityEvenInteracts: firstRun.ok.h_parityEvenInteracts ? 1 : 0,
      },
      notes: `L2, exact over Q(zeta_9). Lone-vibe best single-dock weight, beats 1..${WIRE_BEATS}: ${t.h_wireBest} (~${t.h_wireBestDisplay}); front ${t.h_wireFront}. Coin weights ${t.h_coinWeights}. Equal-role stay without spectator ${t.h_aloneStay}. Tone-parity splitter, equal tones [${t.h_toneEqualBlock}], opposite tones [${t.h_toneOppositeBlock}]. Even-separation product defects per beat ${t.h_parityEven}. Line-order contact keep ${t.h_wordKeep}, swap ${t.h_wordSwap}. Cursor (cursor role 0/1 at 0 forward, roles 2 and 3 at 2 and 4 backward, all tone +1): configurations ${t.h_cursorConfigurations}, history ${t.h_cursorHistory}, prefix weights P0/P1/P2 ${t.h_cursorPrefixes}. Failed checks: ${failed.join(', ') || 'none'}.`,
    })
  },
})
