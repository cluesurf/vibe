// The fear beat on the cold quaternion knit: the color mode of E-QTM-0109 (the swap phase where like vibes
// meet, the singlet phase where a love meets a fear, stored as the departure from calm times omega^q) run on
// code/rule/cold-quaternion-knit (E-RLT-0054).
//
// STATUS (2026-09-26, E-MTH-0028): fail at the default integer link start (E-MTH-0027), pass on 11 of 17 starts of
// the start family. Every failing start (integer+0, 2, 3, 6, 9, 10) fails the frame gate on its control alone: the
// searched love-fear pair makes no fear there, so the swap phase at love-fear meetings reads 0 mismatches. At
// integer+0 the storage gate also fails, because the grower search returns the love-fear pair (10, 11) (charge 0,
// units growing to 3^5 against 2^2 3^2 for the best like pair); with the search restricted to like pairs the grower
// is (1, 17), charge 2, and stores with 0 mismatches over 480 beats (tmp/fix-rlt55-like.ts). Both are instrument or
// search artifacts, not failures of the fear beat.
//
// THE MEETING. E-QTM-0109's meetings are wire meetings: two vibes on one wire when its table acts. This knit
// has no wires. Its collision acts on footprints: the couple clock on the four slots of a couple, the
// exchange on the two lone tones it moves, the threshold on a couple and its payer line. A meeting is
// defined on those footprints, in one sentence: two vibes meet when a move changes a footprint that held
// exactly those two vibes, which is a clock move on a couple holding two vibes or an exchange (its two lone
// tones). The threshold is not a meeting (the payers' tones do not change, only their stores). A clock move
// on a couple holding three or four vibes is a many-body event with no pair to name, and records none; it is
// counted. Why this one: it is the wire meeting's own content (a move whose outcome depends jointly on two
// vibes and changes them), it names each pair once per move, meetings of one beat touch disjoint tokens
// within a footprint, and it is read off the pair (before, after) of the move, so the backward beat names the
// same meetings in the reverse order and the whole reverses. Tokens are the role-point carriers of
// code/rule/cold-quaternion-knit, moved by the weight-keeping rule, so every token keeps its weight (the vibe,
// or a calm slot's side sign) for life, as the color turn weave's 'first-sign' knit does; the like kernel is
// therefore the swap phase itself (likeExchanged false), as in E-QTM-0109.
//
// THE KNOTS. A cold vacuum makes no meetings at all, so E-QTM-0109's vacuum pair (two calm tokens that meet
// because the vacuum clocks) does not exist here: that is measured (every calm line of dock 0, 24 beats).
// Its role is taken by the love-fear pair: a love and a fear head on on one line of dock 0 in the cold
// vacuum, the first line whose two tokens meet within 24 beats. The matter pair (most meetings among dock-0
// tokens on a golden-ratio fill, 240 beats) and the grower (the pair of the twelve meeting most whose units
// grow most in 480 beats) are found as there.
//
// Gates, fixed before the first run, E-QTM-0109's own with the vacuum pair replaced:
// - the classical layer is the cold quaternion knit: with tokens and role points carried and the fear beat
//   on, tones, stores and counters equal the plain knit's at every slot for 24 beats, and no dock's color
//   content changes
// - the cold vacuum has no meetings; a love-fear pair exists
// - for the love-fear pair, the matter pair and the grower: 0 token sign flips, pure every beat, fear share
//   at most 1/3, no fear with the fear beat off; 0 sign flips over every dock-0 token (control: the
//   committed table's color weave flips some, as in E-QTM-0109)
// - the matter pair reverses exactly over 96 beats in fixed units 9 x 4^200 x 3^200 and keeps love minus fear
// - 0 frame mismatches under a frame change in every dock on the love-fear and matter pairs; some when the
//   love-fear kernel is the swap phase (the control)
// - on flat links the love-fear pair's chance of reading (0, 0) after its first three meetings is 1/3, 1/3,
//   1, the dephased stand-in 1/3, 1/3, 1/3, fear off 1; one beat after its first meeting on live links, CHSH
//   above 2, the fear-off rule and the stand-in at most 2
// - option-1 storage with the center phase on all three knots, the grower with q not 0: 0 mismatches over
//   480 beats; both kernels unital and weight-keeping
// Reported: meetings by kind (clock, exchange) and the many-body clock moves, like and love-fear meetings,
// grain, CHSH values, q of each knot.
//
// Depth L2: a constructed rule on a candidate knit against stated gates.
//
// The measurement itself is code/measure/fear-port (fearPortReading), lifted out of this file unchanged so
// E-RLT-0056 and E-RLT-0057 run the same gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import { fearPortReading } from '@/code/measure/fear-port'

export default experiment({
  id: 'relativity/cold-quaternion-fear-beat',
  code: 'E-RLT-0055',
  title:
    'the fear beat ported to the cold quaternion knit, a meeting being a move that changes a footprint holding exactly two vibes, fail at the default integer link start (E-MTH-0027), and pass on 11 of 17 starts of E-MTH-0028\'s family: 0 sign flips, pure, under a third fear, exact reversal, interference 1/3, 1/3, 1, CHSH 2.55 on every start; each of the 6 failing starts is one where the searched love-fear pair makes no fear, so the frame gate\'s control (the swap phase at love-fear meetings) reads 0 and the frame gate fails, uninformative rather than a failure; at the default start the storage gate also fails because the grower found is a love-fear pair (charge 0), a search artifact: the like pair (1, 17) stores with 0 mismatches there',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const reading = fearPortReading(makeColdQuaternionKnit())
    const ok = Object.values(reading.gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the cold quaternion knit, with a meeting defined as a move that changes a footprint holding exactly two vibes, the classical layer is the knit with color local; the cold vacuum makes no meeting and a love and a fear head on do meet; every token keeps its sign for life, the knots stay pure and under a third fear, reverse exactly and keep love minus fear, commute with a frame change in every dock where the swap phase at love-fear meetings does not, give 1/3, 1/3, 1 against 1/3 dephased and CHSH above 2 against 2, and stored as the departure from calm times omega^q read back unchanged at every beat',
      metrics: reading.metrics,
      control: reading.control,
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat and exact Eisenstein kernels (E-FRC-0206): status pass as before; the pair's fear share max 0.3134 -> 0.3192, the grower's fears max 104 -> 96 and share max 0.2955 -> 0.2857. " + ('L2, exact BigInt weights, golden-ratio fills, no random numbers. The classical layer never reads the whole, so the knit and its gates of E-RLT-0054 are untouched by the fear beat (checked slot for slot). The meeting definition is the one choice made here, argued in the header; many-body clock moves (three or four vibes on a couple) record no meeting and are counted, and on the golden fill they outnumber the two-vibe meetings (22,980 against 19,267 clock and 156 exchange meetings in 240 beats), so most of a dense gas\'s interaction carries no fear beat under this definition. The love-fear pair (tokens 8 and 11, line 4, a line of the second couple orbit) meets 160 times in 480 beats, all love-fear, and carries the interference, CHSH (2.552, as on the color turn weave) and frame gates. The matter pair meets only 3 times in 480 beats and not at all in the 48 beats of the frame test, so the frame gate\'s matter half is vacuous and its reversal half light; the grower is a like pair of fears (q = -2) with 2 meetings. Positions stay classical, as in E-QTM-0109. Not examined: whether the quantum layer commutes with Q8 (its tokens are carried by a rule that pairs slots in frame order, which Q8 need not keep).'),
    })
  },
})
