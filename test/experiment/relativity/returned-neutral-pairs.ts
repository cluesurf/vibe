// The neutral pair move on own points, with open tokens, and the store that gives a remade token its point back
// (E-RLT-0067).
//
// THE QUESTION. E-RLT-0066 left one fork: the plain covariant pair move makes color from nothing and breaks frame
// covariance where a token unmade into the store is remade with the other sign, while the neutral move (pairs only
// between equal role points) keeps the held color but was tested with closed tokens only. Does a neutral move
// built on each token's OWN point, with the tokens of an unmade pair kept by the store and handed back when it is
// remade, keep frame covariance, the held color, the fermion number, W(F4) and CPT with OPEN tokens, and still make
// pairs?
//
// WHAT IS KNOWN BEFORE RUNNING. E-QTM-0123 proved that the only permutation of the 9 role points commuting with all
// 216 grid moves is the identity, and that the identity at a flip (no rewrite) is the partial conjugation that
// leaves non-states. So at a sign flip the whole is either not covariant (with the rewrite) or not a state (without
// it): no rule that lets a token change sign can pass both gates. The neutral veto alone does not stop flips: two
// calm tokens with one point can be made into a pair in either orientation. So the prediction is:
//  - 'neutral' (the neutral veto on own points, tokens left on their slots, E-RLT-0066's layout) makes pairs, keeps
//    the held color, and FAILS frame covariance, every mismatch on a pair whose tokens flipped
//  - 'returned-neutral' (the store keeps the unmade pair's two tokens in two store places and puts the same two
//    back, the love on the side the store's sign names, code/rule/token-store-knit) never flips a sign by
//    construction (a token is held with one sign, or stored with it, or calm, and never changes between these but
//    by the pair move, which keeps it), so every whole move is a Clifford move or a comoving kernel: covariant and
//    state-keeping. Its neutral veto (the pair's two tokens hold one point) keeps the held color.
//
// THE RULE, THE BOX, THE OPEN PAIRS AND THE WHOLE: code/measure/token-store-gates (the side-3 torus with the color
// weave's links, E-FRC-0159's golden frame per dock, Kronecker trits, Weyl points and labels, the comoving beat).
//
// Gates, fixed before the first run (for the candidate 'returned-neutral' unless named):
//  G1 frame covariance: on the chosen open pairs (the 3 most-met, the 2 with most love-fear meetings, the 2 most-met
//     whose tokens are both remade, and the 2 with most flips if any), 480 beats each, 0 mismatches of the whole
//     (weights and own points) and 0 of the classical layer (vibes, store, tokens, store places, points moved by the
//     frame); the test sees love-fear meetings and passages (a token held, not held, held again) on those pairs (more
//     than 0 of each); the swap phase at love-fear meetings (the control) gives more than 0 mismatches
//  G2 the flip control: 'neutral' gives more than 0 frame mismatches and more than 0 sign flips in its search run
//  G3 the held color: every token closed, 48 beats, the collision changes the held slots' content sum v (1, a, b)
//     mod 3 on 0 dock-beats while making more than 0 pairs; the plain move changes it on more than 0 (control)
//  G4 the fermion number (E-SPN-0059): at every meeting of the chosen pairs, three starts each, 480 beats, the kept
//     combination is kept (0 changes) and no number changes on a meeting-free beat; the fixed-frame beat breaks it at
//     more than 0 meetings
//  G5 W(F4): the dock collision commutes with all 1,152 coin maps and with charge conjugation on 243 docks from three
//     box states (0 failures) and is an involution there (0), and the beat on the side-3 box commutes with all 1,152
//     coin maps with their cell maps and carried links (0 failures)
//  G6 reversal and CPT: 96 beats forward and back in fixed units return the whole, its own points and the classical
//     state exactly with love minus fear kept on every beat (two pairs), the motion reversal C R turns the beat into
//     its inverse, and CPT (charge conjugation, the -1 map with x -> -x and its links, motion reversal) turns it
//     into its inverse, on three starts (0 failures)
//  G7 laws: charge, momentum and E = count + 2 sum |tau| exact on each of 96 beats; 0 sign flips at meetings in the
//     all-open search run
//  G8 states: every whole on every beat of G1 has least eigenvalue at or above -1e-9 and is pure (81 sum w^2 =
//     9 units^2)
//  G9 blind: opening every token changes no classical datum over 48 beats
//  G10 determinism: the candidate's study run twice gives identical numbers
// Verdict: pass if G1 to G10 hold, fail otherwise.
//
// Readings, not gated: 'returned' (store return without the veto), with its held color and the held plus stored
// color; 'neutral''s held color.
//
// Depth L2. DETERMINISM: Kronecker trits, Weyl points, labels and frames, no draw. The husk is not read: a law of
// the bulk role layer on the dock grid, stated as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { heldColor, storeStudy, type StoreStudy } from '@/code/measure/token-store-gates'

export default experiment({
  id: 'relativity/returned-neutral-pairs',
  code: 'E-RLT-0067',
  title:
    "the color fork of pair creation closes: with open tokens, the neutral pair move on own points plus a store that keeps the unmade pair's two tokens and hands them back (love on the side the store names) never flips a sign (0 in 308,765 meetings) and keeps frame covariance (0 whole and 0 classical mismatches over 7 open pairs x 480 beats with 24 love-fear meetings and 46 store passages, the swap-phase control 72,762), the held color (0 of 3,888 dock-beats, 1,994 pairs made), the fermion number (126 of 126 meetings), W(F4) (0 failures, 1,152 coin maps on docks and box), exact reversal, motion reversal and CPT (0), and states (0 non-states of 3,360 wholes); the neutral move with tokens left on the slots flips 3,226 signs and breaks covariance (90,298 mismatches, all on pairs whose tokens flipped), and the store return without the veto keeps covariance but moves the held color into the store (1,436 dock-beats held, 0 held plus stored): the return fixes covariance, the veto fixes color",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const candidate = storeStudy('returned-neutral')
    const again = storeStudy('returned-neutral')
    const flip = storeStudy('neutral')
    const returned = storeStudy('returned')
    const deterministic = JSON.stringify(candidate.metrics) === JSON.stringify(again.metrics)
    const held = heldColor('returned-neutral')
    const plain = heldColor('plain')
    const heldNeutral = heldColor('neutral')
    const heldReturned = heldColor('returned')
    const g = candidate.gates
    const gates: Record<string, boolean> = {
      G1: !!(g.frameCovariant && g.frameTestSensitive && g.swapControlBites),
      G2: (flip.metrics.frameMismatch ?? 0) > 0 && (flip.metrics.searchSignFlips ?? 0) > 0,
      G3: held.heldChanges === 0 && held.made > 0 && plain.heldChanges > 0,
      G4: !!(g.fermionKept && g.fermionControlBreaks),
      G5: !!g.wf4,
      G6: !!g.reversalAndCpt,
      G7: !!(g.laws && g.noFlips),
      G8: !!g.states,
      G9: !!g.blind,
      G10: deterministic,
    }
    const ok = Object.values(gates).every(Boolean)
    const metrics: Record<string, number> = {
      deterministic: deterministic ? 1 : 0,
      heldChanges: held.heldChanges,
      heldTotalChanges: held.totalChanges,
      dockBeats: held.dockBeats,
      pairsMade: held.made,
      pairsUnmade: held.unmade,
      plainHeldChanges: plain.heldChanges,
      plainMade: plain.made,
      neutralHeldChanges: heldNeutral.heldChanges,
      neutralMade: heldNeutral.made,
      returnedHeldChanges: heldReturned.heldChanges,
      returnedHeldAndStoredChanges: heldReturned.totalChanges,
      returnedMade: heldReturned.made,
      seconds: 0,
    }
    const add = (s: StoreStudy, name: string): void => {
      for (const [k, v] of Object.entries(s.metrics)) metrics[`${name}_${k}`] = v
      for (const [k, v] of Object.entries(s.gates)) metrics[`${name}_gate_${k}`] = v ? 1 : 0
    }

    add(candidate, 'returnedNeutral')
    add(flip, 'neutral')
    add(returned, 'returned')
    metrics.seconds = (Date.now() - started) / 1000

    const c = candidate.metrics
    const f = flip.metrics
    const r = returned.metrics

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with open tokens, the neutral pair move on own points with the store keeping the unmade pair's tokens and handing them back: frame covariance ${c.frameMismatch} whole and ${c.classicalMismatch} classical mismatches over ${c.openPairs} open pairs x 480 beats (${c.frameLoveFearMeetings} love-fear meetings, ${c.framePassages} passages, ${c.frameSignFlips} sign flips; the swap-phase control ${c.swapControlMismatch}), the held color changed on ${held.heldChanges} of ${held.dockBeats} dock-beats while ${held.made} pairs were made, the fermion number kept at ${c.fermionKept} of ${c.fermionMeetings} meetings (fixed-frame beat breaks ${c.fixedFrameBreaks}), W(F4) ${(c.coinMapFailures ?? 0) + (c.boxCoinMapFailures ?? 0)} failures over 1,152 coin maps on docks and box, reversal ${c.reverses ? 'exact' : 'broken'}, motion reversal and CPT ${(c.motionReversalFailures ?? 0) + (c.cptFailures ?? 0)} failures, ${c.nonStates} non-states of ${c.wholesRead} wholes, ${c.searchSignFlips} sign flips in ${c.searchMeetings} meetings; the neutral move with tokens left on the slots flips ${f.searchSignFlips} signs and breaks covariance (${f.frameMismatch} mismatches, ${f.frameMismatchOnFlipFreePairs} on flip-free pairs), and the store return without the veto keeps covariance (${r.frameMismatch}) but not the held color (${heldReturned.heldChanges} dock-beats; held plus stored ${heldReturned.totalChanges})`,
      metrics,
      control: { swapPhaseMismatch: c.swapControlMismatch ?? -1, neutralOnSlotsMismatch: f.frameMismatch ?? -1, plainHeldChanges: plain.heldChanges },
      notes: `L2. Gates: ${JSON.stringify(gates)}; candidate study gates ${JSON.stringify(candidate.gates)}; neutral-on-slots ${JSON.stringify(flip.gates)}; returned without the veto ${JSON.stringify(returned.gates)}. Open pairs of the candidate: ${JSON.stringify(candidate.pairs)}. First run recorded as is (731 s, pass). DISCLOSED: a classical rate probe (tmp/vac-probe-rates.ts, no whole, no gate) ran before this file was written, to size the runs (meetings, love-fear meetings, flips and pairs per variant over 480 all-open beats). Title rewritten after the run, no logic changed. Storage: the store places hold 24 role points per dock beside the 12 store trits; in this rule a calm token never becomes held (pairs are made only from the tokens the store holds), so the calm slots' role points are inert.`,
    })
  },
})
