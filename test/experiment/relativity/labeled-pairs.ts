// A pair move that never flips a sign: every token carries a latent sign (E-RLT-0068).
//
// THE QUESTION. The alternative to E-RLT-0067's store return: a pair's love and fear are made and unmade only in
// their own orientation, so no token ever changes sign between meetings, and the antisymplectic rewrite of
// E-QTM-0123 never arises. The least rule that says it: every token carries a latent sign, its label (a held
// token's label is its sign, a calm token keeps the label it had), and the pair move acts on a line only where the
// two tokens that are or would be held carry the signs they have or would get (code/rule/token-store-knit,
// 'labeled'). The tokens stay on the slots, as in E-RLT-0066.
//
// WHAT IS KNOWN BEFORE RUNNING. With no flip the whole only ever takes Clifford moves and comoving kernels, so it is
// covariant and keeps states (E-QTM-0123), whatever the tokens do. The labels say nothing about the role points, so
// a pair made from two calm tokens with different points still makes color from nothing, as the plain move does
// (E-RLT-0066: 1,530 dock-beats). PREDICTION: every gate of E-RLT-0067 holds but the held color, which FAILS (more
// than 0 changes); with the neutral veto added ('labeled-neutral', a reading) every gate holds.
//
// COST, stated before running: the label is one latent sign on every calm slot, beside its three trits, so the slot
// holds two states per role point when calm. E-RLT-0067's store return keeps the slot at three trits and instead
// gives each line two store places (a token and its role point each) beside its store trit.
//
// Gates, fixed before the first run, for 'labeled': G1 and G3 to G10 exactly as E-RLT-0067 registers them (frame
// covariance with the test's sensitivity and the swap-phase control, the held color with the plain move as control,
// the fermion number, W(F4), reversal and CPT, the laws with 0 sign flips, states, blindness, determinism); G2 the
// flip control: the plain move (E-RLT-0066's) gives more than 0 frame mismatches and more than 0 sign flips.
// Verdict: pass if all hold, fail otherwise. Predicted: fail on G3 alone.
//
// Depth L2. DETERMINISM: Kronecker trits, Weyl points, labels and frames, no draw. The husk is not read.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { heldColor, storeStudy, type StoreStudy } from '@/code/measure/token-store-gates'

export default experiment({
  id: 'relativity/labeled-pairs',
  code: 'E-RLT-0068',
  title:
    'a pair move that never flips a sign, by a latent sign on every token, fail on the held color as predicted: no flip in 148,611 meetings (the plain move 31,798), frame covariance 0 mismatches (plain 130,910, swap-phase control 116,970), fermion number 108 of 108, W(F4) and CPT 0 failures, 0 non-states, but pairs made from calm tokens with different points change the held color on 1,286 of 3,888 dock-beats; with the neutral veto added every gate holds (0 held-color changes, 334 pairs made, 0 mismatches)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const candidate = storeStudy('labeled')
    const again = storeStudy('labeled')
    const flip = storeStudy('plain')
    const neutral = storeStudy('labeled-neutral')
    const deterministic = JSON.stringify(candidate.metrics) === JSON.stringify(again.metrics)
    const held = heldColor('labeled')
    const plain = heldColor('plain')
    const heldNeutral = heldColor('labeled-neutral')
    const gatesOf = (s: StoreStudy, h: { heldChanges: number; made: number }, det: boolean): Record<string, boolean> => {
      const g = s.gates

      return {
        G1: !!(g.frameCovariant && g.frameTestSensitive && g.swapControlBites),
        G2: (flip.metrics.frameMismatch ?? 0) > 0 && (flip.metrics.searchSignFlips ?? 0) > 0,
        G3: h.heldChanges === 0 && h.made > 0 && plain.heldChanges > 0,
        G4: !!(g.fermionKept && g.fermionControlBreaks),
        G5: !!g.wf4,
        G6: !!g.reversalAndCpt,
        G7: !!(g.laws && g.noFlips),
        G8: !!g.states,
        G9: !!g.blind,
        G10: det,
      }
    }
    const gates = gatesOf(candidate, held, deterministic)
    const neutralGates = gatesOf(neutral, heldNeutral, true)
    const ok = Object.values(gates).every(Boolean)
    const metrics: Record<string, number> = {
      deterministic: deterministic ? 1 : 0,
      heldChanges: held.heldChanges,
      dockBeats: held.dockBeats,
      pairsMade: held.made,
      pairsUnmade: held.unmade,
      plainHeldChanges: plain.heldChanges,
      plainMade: plain.made,
      labeledNeutralHeldChanges: heldNeutral.heldChanges,
      labeledNeutralMade: heldNeutral.made,
      labeledNeutralAllGates: Object.values(neutralGates).every(Boolean) ? 1 : 0,
      seconds: 0,
    }
    const add = (s: StoreStudy, name: string): void => {
      for (const [k, v] of Object.entries(s.metrics)) metrics[`${name}_${k}`] = v
      for (const [k, v] of Object.entries(s.gates)) metrics[`${name}_gate_${k}`] = v ? 1 : 0
    }

    add(candidate, 'labeled')
    add(flip, 'plain')
    add(neutral, 'labeledNeutral')
    metrics.seconds = (Date.now() - started) / 1000

    const c = candidate.metrics
    const f = flip.metrics
    const n = neutral.metrics

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `a latent sign on every token stops every flip (${c.searchSignFlips} in ${c.searchMeetings} meetings, the plain move ${f.searchSignFlips}): frame covariance ${c.frameMismatch} whole and ${c.classicalMismatch} classical mismatches over ${c.openPairs} open pairs x 480 beats (${c.frameLoveFearMeetings} love-fear meetings, ${c.framePassages} passages; the swap-phase control ${c.swapControlMismatch}, the plain move ${f.frameMismatch}), the fermion number kept at ${c.fermionKept} of ${c.fermionMeetings}, W(F4) ${(c.coinMapFailures ?? 0) + (c.boxCoinMapFailures ?? 0)} and CPT ${(c.motionReversalFailures ?? 0) + (c.cptFailures ?? 0)} failures, ${c.nonStates} non-states of ${c.wholesRead}; but the held color changes on ${held.heldChanges} of ${held.dockBeats} dock-beats (${held.made} pairs made), since a label says nothing of the points; with the neutral veto added the held color changes on ${heldNeutral.heldChanges} (${heldNeutral.made} pairs made) and frame covariance reads ${n.frameMismatch}`,
      metrics,
      control: { swapPhaseMismatch: c.swapControlMismatch ?? -1, plainMismatch: f.frameMismatch ?? -1, plainHeldChanges: plain.heldChanges },
      notes: `L2. Gates: ${JSON.stringify(gates)}; labeled-neutral (reading) ${JSON.stringify(neutralGates)}; candidate study gates ${JSON.stringify(candidate.gates)}; plain ${JSON.stringify(flip.gates)}. Open pairs: ${JSON.stringify(candidate.pairs)}. First run recorded as is.`,
    })
  },
})
