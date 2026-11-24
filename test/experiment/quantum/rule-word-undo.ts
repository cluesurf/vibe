// THE RULE-WORD UNDO (E-QTM-0201, item vibe-roadmap-grounding-0049, decision 012, research 21 brief B2). E-QTM-0200
// copied a friend's record to k = 0 to 5 further loves and read the best undo by ANY unitary on system and friend, which
// stayed 39/64 for every k >= 1 because the best act uses the branch where the record LEFT the friend (T-0003a). A being
// in the husk acts only through the rule, so this file reads the best undo the rule's own gates on A and F can perform:
// every word of length 0 to 6 over 8 letters, and asks whether that undo falls strictly as copies are added.
//
// THE CIRCUIT: exactly E-QTM-0200's (code/measure/record-copies on code/measure/rule-gates, exact in Q(w)): the coin on
// start R with points (0, 1, 2, .., k + 1), F records (the line of two on A and F, arm R), then k copies by the same
// meeting, STAR (gated) or CHAIN (reported).
//
// THE WORDS (code/measure/rule-words): the coin C; the line of two of A and F on arm R, L and both (U_R, U_L, U); the
// arm phases w and w^2 on R and L (P_R1, P_R2, P_L1, P_L2). W_m is every word of length 0 to m; W_6 is gated. A word
// acts on A and F alone, so it is one exact 4 x 4 matrix on (direction) x (which of its two points A holds), the same in
// every pair, and its readings are exact quadratic forms on the state's A-F blocks. Words are enumerated as distinct
// matrices up to a unit, breadth first, which reaches exactly the matrices of every word of length 0 to 6.
//
// READINGS, each k and schedule: F_w the fidelity of A and F with the no-friend final state (exact, the quantity of
// E-QTM-0200's F_rule by fidelityAF), P_w = P(F reads 1), B_W = the max of F_w over W_6 (exact), the argmax word (the
// shortlex-least word reaching it). Reported: B_W over W_m for m = 0 to 6, the argmax and its P_w, every chain reading,
// the redundancy curve (R_delta at delta 0.05, 0.1, 0.2; the least and largest I(S : X) / H(S) by fragment size), and a
// sizing of the chain at k = 6, 7, 8 (labels, seconds, bytes) that takes no reading.
//
// GATES, set in the item's what before any probe (gate 628f09bc13ca): J0 E-QTM-0200's G0, I1, I2, I3, I4, C1 and its
// star values (P_mem 1, 91/256, 199/1024, 631/4096, 2359/16384, 9271/65536, F_rule 4^-k, B_SF 1 then 39/64); J1 the
// source word's F_w equals F_rule exactly, every k and schedule; J2 B_W <= B_SF + 1e-12; J3 B_W(0) = 1 exactly; J4 total
// weight exactly 1 after every word; M2 B_W falls strictly in k on the star, k = 0 to 5, each step by more than 1e-9.
// Verdict: open on an instrument fail or the smoke setting (k to 2), fail if M2 fails, partial if every gate holds (one
// vibe point as the friend, an arranged schedule). B_SF is a float spectrum, so "equal exactly" reads as: 39/64 (or 1)
// an exact eigenvalue of the A-F state (det(B - lambda I) = 0 on a pair block, in Q(w)) and the float max within 1e-12.
//
// DETERMINISM: exact in Q(w) except the spectra (floats, Householder and QL); no random number, every word and every
// fragment enumerated. NOTHING MOVES: every gate is a take within one line of one dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  eq,
  float,
  gatesOnFamily,
  isRational,
  lessThan,
  ONE,
  pointsOf,
  qw,
  show,
  sub,
  weightWhere,
  ZERO,
  type Qw,
} from '@/code/measure/rule-gates'
import {
  copiedRecord,
  copiedState,
  fidelityAF,
  FRIEND,
  redundancyCurve,
  redundancySizing,
  type CopiedRecord,
  type RedundancyCurve,
  type Schedule,
} from '@/code/measure/record-copies'
import {
  afBlocks,
  applyWord,
  isExactEigenvalue,
  readWord,
  SOURCE_WORD,
  wordClasses,
  wordName,
  type WordClasses,
} from '@/code/measure/rule-words'

const MAX_LENGTH = 6
const DELTAS = [0.05, 0.1, 0.2]
// the direct path (gates on the whole state) is checked against the 4 x 4 path on every word class up to this length
const DIRECT_LENGTH = 2
const SIZING_K = [6, 7, 8]

// E-QTM-0200's recorded star values
const STAR_P_MEM = [
  qw(1n),
  qw(91n, 0n, 256n),
  qw(199n, 0n, 1024n),
  qw(631n, 0n, 4096n),
  qw(2359n, 0n, 16384n),
  qw(9271n, 0n, 65536n),
]
const B_SF_COPIED = qw(39n, 0n, 64n)

type Case = {
  rec: CopiedRecord
  curve: RedundancyCurve
  // B_W over W_m, m = 0 .. MAX_LENGTH, and the argmax class at each
  best: { f: Qw; at: number }[]
  argmaxP: Qw
  sourceF: Qw
  weightsExact: boolean
  rationalF: boolean
  // the 4 x 4 path against the direct path on short words: classes checked and mismatches
  directChecked: number
  directMismatch: number
  bSFExact: boolean
}

function runCase(k: number, schedule: Schedule, words: WordClasses): Case {
  const rec = copiedRecord(k, schedule)
  const curve = redundancyCurve(rec.copied, k, rec.all, DELTAS)
  const blocks = afBlocks(rec.copied, rec.noFriendAF)
  const best: Case['best'] = []
  let weightsExact = true
  let rationalF = true
  let top = { f: ZERO, at: -1 }
  let length = 0
  let argmaxP = ZERO
  let directChecked = 0
  let directMismatch = 0

  for (let c = 0; c < words.classes.length; c++) {
    const w = words.classes[c]!

    // classes come in length order: close the lengths below this one
    while (w.word.length > length) {
      best.push(top)
      length++
    }

    const r = readWord(w.matrix, blocks)

    weightsExact &&= eq(r.weight, ONE)
    rationalF &&= isRational(r.f) && isRational(r.p)

    if (top.at < 0 || lessThan(top.f, r.f)) {
      top = { f: r.f, at: c }
      argmaxP = r.p
    }

    if (w.word.length <= DIRECT_LENGTH) {
      const after = applyWord(rec.copied, w.word)
      const f = fidelityAF(after, rec.noFriendAF, rec.all)
      const p = weightWhere(after, l => pointsOf(l)[FRIEND] === 1)

      directChecked++

      if (!eq(f, r.f) || !eq(p, r.p)) {
        directMismatch++
      }
    }
  }

  while (best.length <= MAX_LENGTH) {
    best.push(top)
  }

  const sourceF = readWord(words.classes[words.classOf(SOURCE_WORD)]!.matrix, blocks).f
  const bSFExact =
    k === 0
      ? Math.abs(rec.bSF - 1) <= 1e-12 && isExactEigenvalue(blocks, ONE)
      : Math.abs(rec.bSF - float(B_SF_COPIED).re) <= 1e-12 && isExactEigenvalue(blocks, B_SF_COPIED)

  return {
    rec,
    curve,
    best,
    argmaxP,
    sourceF,
    weightsExact,
    rationalF,
    directChecked,
    directMismatch,
    bSFExact,
  }
}

type Sizing = {
  k: number
  labels: number
  seconds: number
  bytes: number
  largest: number
  spectra: number
  // fragment spectra whose eigen solver did not converge (counted, not read)
  failed: number
}

// the chain at k: its state's labels and the cost of every fragment spectrum, no reading kept or printed
function sizeChain(k: number): Sizing {
  const started = Date.now()
  const { state, all } = copiedState(k, 'chain')
  const cost = redundancySizing(state, k, all)

  return {
    k,
    labels: state.size,
    seconds: (Date.now() - started) / 1000,
    bytes: cost.bytes,
    largest: cost.largest,
    spectra: cost.built,
    failed: cost.failed,
  }
}

const fmt = (x: number): string => x.toFixed(6)
const fq = (x: Qw): string => `${show(x)} (${fmt(float(x).re)})`

export default experiment({
  id: 'quantum/rule-word-undo',
  code: 'E-QTM-0201',
  title:
    "the best undo of Wigner's friend by the rule's own words, partial (gates set before the run, every gate holds; one vibe point as the friend and an arranged schedule): over all 299,593 words of length up to 6 (1,979 classes) on system and friend, the best undo of the friend record copied to k = 0 to 5 further loves on the star falls strictly as 1, 1/4, 1/16, 1/64, 1/256, 1/1024, exactly the source's own undo (the best word is U_R U_R C at every k), while the all-unitary bound stays 39/64 from k = 1 (E-QTM-0200's pinned value), so the rule's own reach makes the record harder to undo with every copy; on the chain the best word stays 1/4 at every k (only the nearest copy is reachable) and R_0.1 reaches 2 at k = 4 and 5",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const full = process.env.RULE_WORD_SWEEP === 'full'
    const kMax = full ? 5 : 2
    const gates = gatesOnFamily()
    const words = wordClasses(MAX_LENGTH)
    const wordSeconds = (Date.now() - started) / 1000
    const cases: Case[] = []

    for (const schedule of ['star', 'chain'] as const) {
      for (let k = 0; k <= kMax; k++) {
        cases.push(runCase(k, schedule, words))
      }
    }

    const caseSeconds = (Date.now() - started) / 1000 - wordSeconds
    const sizing = SIZING_K.map(sizeChain)
    const star = cases.filter(c => c.rec.schedule === 'star')
    const k0 = star[0]!.rec
    const k1 = star[1]!.rec
    const bW = (c: Case): Qw => c.best[MAX_LENGTH]!.f
    const g = {
      J0:
        gates.passing === gates.of &&
        eq(k1.pMem, qw(91n, 0n, 256n)) &&
        eq(k1.l1, qw(27n, 0n, 64n)) &&
        eq(k0.pMem, ONE) &&
        eq(k0.l1, ZERO) &&
        cases.every(c => c.rec.globalUndo && c.rec.weightExact) &&
        Math.abs(k0.bSF - 1) <= 1e-12 &&
        cases.every(c => c.rec.boundOk && c.rec.spectralOk && c.curve.spectralOk) &&
        cases.every(c => Math.abs(c.rec.bSNoRecord - 1) <= 1e-12) &&
        star.every(
          c =>
            eq(c.rec.pMem, STAR_P_MEM[c.rec.k]!) &&
            eq(c.rec.fRule, qw(1n, 0n, 4n ** BigInt(c.rec.k))) &&
            c.bSFExact,
        ),
      J1: cases.every(c => eq(c.sourceF, c.rec.fRule) && !lessThan(bW(c), c.rec.fRule)),
      J2: cases.every(c => float(bW(c)).re <= c.rec.bSF + 1e-12),
      J3: cases.filter(c => c.rec.k === 0).every(c => eq(bW(c), ONE)),
      J4: cases.every(c => c.weightsExact && c.rationalF),
      M2: star.every((c, i) => i === 0 || float(sub(bW(star[i - 1]!), bW(c))).re > 1e-9),
    }
    const instruments = g.J0 && g.J1 && g.J2 && g.J3 && g.J4
    const status = !full || !instruments ? 'open' : !g.M2 ? 'fail' : 'partial'
    const metrics: Record<string, number> = {
      startsReadingTheGates: gates.passing,
      starts: gates.of,
      wordClasses: words.classes.length,
      words: words.wordsAt.reduce((t, x) => t + x, 0),
    }

    for (const c of cases) {
      const p = `${c.rec.schedule}${c.rec.k}`

      metrics[`${p}_bW`] = float(bW(c)).re
      metrics[`${p}_bW5`] = float(c.best[5]!.f).re
      metrics[`${p}_argmaxLength`] = words.classes[c.best[MAX_LENGTH]!.at]!.word.length
      metrics[`${p}_argmaxP`] = float(c.argmaxP).re
      metrics[`${p}_fRule`] = float(c.rec.fRule).re
      metrics[`${p}_pMem`] = float(c.rec.pMem).re
      metrics[`${p}_bSF`] = c.rec.bSF
      metrics[`${p}_bS`] = c.rec.bS
      metrics[`${p}_hS`] = c.curve.hS

      for (const r of c.curve.r) {
        metrics[`${p}_R${r.delta}`] = r.r
      }

      metrics[`${p}_directMismatch`] = c.directMismatch
    }

    for (const s of sizing) {
      metrics[`size_chain${s.k}_labels`] = s.labels
      metrics[`size_chain${s.k}_seconds`] = s.seconds
      metrics[`size_chain${s.k}_bytes`] = s.bytes
      metrics[`size_chain${s.k}_unconverged`] = s.failed
    }

    for (const [key, v] of Object.entries(g)) {
      metrics[`gate_${key}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const rows = cases.map(c => {
      const arg = words.classes[c.best[MAX_LENGTH]!.at]!

      return `${c.rec.schedule} k ${c.rec.k}: B_W ${fq(bW(c))} by ${wordName(arg.word)} (P_w ${fq(c.argmaxP)}), B_W by m ${c.best.map(b => fmt(float(b.f).re)).join(' ')}, source F_w ${show(c.sourceF)}, F_rule ${show(c.rec.fRule)}, P_mem ${show(c.rec.pMem)}, B_SF ${fmt(c.rec.bSF)}, B_S ${fmt(c.rec.bS)}, H(S) ${fmt(c.curve.hS)}, ${c.curve.r.map(r => `R_${r.delta} ${r.r}`).join(' ')}, I/H by size ${c.curve.bySize.map(b => `${b.size}: ${fmt(b.least)}..${fmt(b.largest)}`).join(' ')}, direct ${c.directChecked - c.directMismatch}/${c.directChecked}`
    })
    const sizes = sizing.map(
      s =>
        `chain k ${s.k}: ${s.labels} labels, ${s.spectra} spectra (${s.failed} did not converge in the tridiagonal QL), largest ${s.largest} rows (${s.bytes} bytes), ${s.seconds.toFixed(2)} s`,
    )

    return verdict({
      status,
      claim: `the friend record of E-QTM-0162 copied to k = 0 to ${kMax} further loves (star): the best undo by the rule's own words of length up to ${MAX_LENGTH} on system and friend reads ${star.map(c => show(bW(c))).join(', ')}, against the source undo's ${star.map(c => show(c.rec.fRule)).join(', ')} and the all-unitary bound ${star.map(c => fmt(c.rec.bSF)).join(', ')}`,
      metrics,
      notes: `L2. ${full ? 'full' : 'smoke (open by rule)'}. Gates ${Object.entries(g)
        .map(([key, v]) => `${key} ${v}`)
        .join(', ')}. Words: ${words.classes.length} classes up to a unit, new by length ${words.newAt.join(' ')}, in ${wordSeconds.toFixed(1)} s; cases ${caseSeconds.toFixed(1)} s. ${rows.join('; ')}. Sizing (no reading): ${sizes.join('; ')}. The schedule is arranged and the friend is one vibe point. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
