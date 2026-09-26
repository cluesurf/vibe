// Fear in the sparse living vacuum, E-RLT-0078.
//
// THE QUESTION. On the living-pair knit's hot vacuum (E-RLT-0074) a vacuum pair meets only its own partner, through a
// link and then its inverse, so the love-fear kernel cycles its whole with period 3 and the fear beat makes no fear in
// the vacuum. On the sparse vacuum of E-RLT-0077 (one line per dock), can vacuum tokens meet OTHER units' tokens with
// transport that does not cancel, so that the fear beat makes fear in the vacuum?
//
// DERIVED FIRST (code/measure/sparse-living-vacuum's header):
//  (a) On any vacuum meeting condition (Z), every collision a vacuum vibe meets is the -1 coin map, which keeps the
//      line, so every vacuum token stays on its own line and returns home each three beats through a link and its
//      inverse: the whole state (tokens, places and points) repeats after 6 beats, and two tokens of different lines
//      never meet (a meeting is the two slots of one line of one dock).
//  (b) So any TWO-token vacuum whole evolves each period by one fixed map. A unit's own two tokens meet on beats 2 and
//      5, each time at identity net transport, so the map is K^2 with K the love-fear kernel I + (omega - 1) P, and
//      K^3 = I. Two neighbouring units' tokens (the fear of unit x and the love of unit x + 2r, which share dock x + r
//      on beat 1) meet once a period at a fixed transport, so the map is a conjugate of K. Every two-token vacuum whole
//      visits at most 3 distinct wholes at its meetings, whatever the sparse pattern: the answer to the question, for
//      two tokens, is NO.
//  (c) A whole of MORE tokens is not so bound. The ring of two neighbouring units (A_x, B_x, A_y, B_y with y = x + 2r)
//      meets six times a period: B_x with A_y on beat 1, A_x with B_x and A_y with B_y on beats 2 and 5, A_x with B_y on
//      beat 4. Four kernels on overlapping pairs need not commute, so the ring's period map need not have finite order,
//      and it may carry negative weight.
//  (d) A passing lone vibe breaks (Z) at the docks it crosses, so it can knock a vacuum unit's tokens off their line
//      and give them transport that does not cancel; a two-token vacuum whole on its path is no longer bound by (b).
//
// Gates, fixed before the first run (side 3, the color weave's links, the one-line vacuum of E-RLT-0077, the fear beat
// with E-FRC-0159's exact kernels, comoving, every whole started from the basis start with every role digit 0):
//  F1 THE STRUCTURE (a): with every token open, the one-line vacuum's full state after 6 beats equals its start
//     (tokens, places, points), and every meeting in 24 beats is between two tokens of line-0 units
//  F2 THE OWN PAIR (b): dock 0's unit's two tokens meet 160 times in 480 beats, visit at most 3 distinct wholes at
//     their meetings, and carry no fear
//  F3 THE CROSS PAIR (b): the fear of dock 0's unit and the love of the unit two docks along the line meet 80 times in
//     480 beats and visit at most 3 distinct wholes
//  F4 THE RING (c): the four tokens of those two units, with the fear beat on, carry fear at some meeting in 480 beats;
//     with the fear beat off, none
// Verdict: pass if F1 to F4 hold; fail if F1 to F3 hold and F4 does not; partial otherwise.
//
// PREDICTED: F1 to F3 pass (derived). F4 is the open question; the prediction is that it passes (four non-commuting
// kernels).
//
// Reported, not gated: the fear share (fears over loves plus fears) of each whole, its largest, its value per 48-beat
// window (the vacuum's fear share over time), the distinct wholes the ring visits, the fears the cross pair carries, and
// (d): dock 0's own pair with a lone love at 60 degrees to the line crossing dock 0 on beat 1.
//
// DISCLOSED: no probe of these wholes ran before this file.
//
// FIRST RUN (2.1 s): pass, recorded as is. Not predicted: the cross pair, bound to 3 wholes as derived, carries fear
// from the basis start (share 0.271): the order-3 bound limits how many wholes a two-token vacuum whole visits, not
// whether one of them is negative. E-RLT-0074's "no fear in the vacuum" holds for a unit's OWN pair only. The ring's
// fear share (0.43) is above the 1/3 that E-FRC-0159's battery gates on two-token knots; the bound for four tokens was
// not registered. Title rewritten after the run; no logic changed.
//
// Depth L2. DETERMINISM: the vacuum and its layout are fixed, no draw. The husk is not read (a whole's weights are the
// quantum layer of the bulk slots).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { livingBeat, makeLivingKnit, separatedLayout } from '@/code/rule/living-pair-knit'
import { sameStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'
import { advanceWhole, reduceWhole, wholeLovesAndFears, wholeUnits, type Whole } from '@/code/rule/fear-weave'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'
import { angleClass, boxStore, ONE_LINE, sparseLivingState } from '@/code/measure/sparse-living-vacuum'

const SIDE_LENGTH = 3
const BEATS = 480
const WINDOW = 48

const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
const cells = weave.mesh.cellCount
const slots = cells * 24
const tokens = slots * 2
const layout = separatedLayout(weave)
const store = boxStore(cells, ONE_LINE)
const knit = makeLivingKnit(weave)
const F0 = LINE_FIRSTS[0] as number

const vacuum = (): TokenStoreState => sparseLivingState({ vibe: new Int8Array(slots), point: new Int8Array(slots), store, layout })
// a unit's love token and fear token: its line-0 place tokens (a made pair takes the love from the first place)
const loveOf = (x: number): number => slots + x * 24
const fearOf = (x: number): number => slots + x * 24 + 1

function basisWhole(list: readonly number[]): Whole {
  const n = list.length
  const weight = new Array<bigint>(9 ** n).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    let zero = true

    for (let c = 0; c < n; c++) zero = zero && Math.floor((Math.floor(i / 9 ** (n - 1 - c)) % 9) / 3) === 0

    weight[i] = zero ? 1n : 0n
  }

  return { tokens: list, weight }
}

type Study = { meetings: number; fearsMax: number; shareMax: number; distinct: number; pure: boolean; windows: number[]; shareLast: number }

function study(list: readonly number[], mode: 'on' | 'off', start: TokenStoreState = vacuum()): Study {
  const kernels = exactFearKernels({ like: mode === 'on' ? 1 : 0, unlike: mode === 'on' ? 1 : 0, likeExchanged: false })
  const open = new Uint8Array(tokens)

  for (const t of list) open[t] = 1

  const n = list.length
  let whole = basisWhole(list)
  let s = start
  let meetings = 0
  let fearsMax = 0n
  let shareMax = 0
  let shareLast = 0
  let pure = true
  const seen = new Set<string>()
  const windows = new Array<number>(BEATS / WINDOW).fill(0)

  for (let t = 0; t < BEATS; t++) {
    const r = livingBeat(knit, s, open, t)

    whole = advanceWhole({ weave, whole, record: r.record, kernel4: [], color: kernels, fixed: false, forward: true }) as Whole

    if (r.record.meetings.length > 0) {
      whole = reduceWhole(whole)
      meetings += r.record.meetings.length

      const { loves, fears } = wholeLovesAndFears(whole)
      const share = Number(fears) / Number(loves + fears)
      const units = wholeUnits(whole)

      fearsMax = fears > fearsMax ? fears : fearsMax
      shareMax = Math.max(shareMax, share)
      shareLast = share
      windows[Math.floor(t / WINDOW)] = Math.max(windows[Math.floor(t / WINDOW)] ?? 0, share)
      pure = pure && 9n ** BigInt(n) * whole.weight.reduce((a, w) => a + w * w, 0n) === 3n ** BigInt(n) * units * units
      seen.add(whole.weight.join(','))
    }

    s = r.state
  }

  return { meetings, fearsMax: fearsMax > 0n ? 1 : 0, shareMax, distinct: seen.size, pure, windows, shareLast }
}

// F1
function structure(): { returns: boolean; meetings: number; offLine: number } {
  const all = new Uint8Array(tokens).fill(1)
  const start = vacuum()
  let s = start
  let returns = false
  let meetings = 0
  let offLine = 0
  const lineZero = (tk: number): boolean => tk >= slots && (tk - slots) % 24 < 2

  for (let t = 0; t < 24; t++) {
    const r = livingBeat(knit, s, all, t)

    for (const [a, b] of r.record.meetings) {
      meetings++
      offLine += lineZero(a) && lineZero(b) ? 0 : 1
    }

    s = r.state

    if (t === 5) returns = sameStoreState(s, start)
  }

  return { returns, meetings, offLine }
}

export default experiment({
  id: 'relativity/sparse-vacuum-fear',
  code: 'E-RLT-0078',
  title:
    "fear in the sparse living vacuum, pass: on the one-line vacuum every vacuum token stays on its line and the state repeats every 6 beats (0 of 1,296 meetings off the line), so a unit's own two tokens meet 160 times in 480 beats through 3 wholes with no fear (the love-fear kernel squared each period, cube the identity), but two NEIGHBORING units' tokens (sharing a dock one beat after the making) meet once a period through a conjugated kernel, still 3 wholes, and already carry fear (share 0.271); the ring of the two units' four tokens meets 480 times through 320 distinct wholes, stays pure, and holds a steady fear share of 0.43 from the first 48 beats (0.429 to 0.432 in every window; none with the fear beat off); a passing lone love gives dock 0's own pair fear (share up to 0.306) and breaks its cycle (11 meetings in 480 beats)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const x = 0
    const y = weave.mesh.neighbour(weave.mesh.neighbour(x, F0), F0)
    const own = [loveOf(x), fearOf(x)]
    const cross = [fearOf(x), loveOf(y)]
    const ring = [loveOf(x), fearOf(x), loveOf(y), fearOf(y)]
    const f1 = structure()
    const ownOn = study(own, 'on')
    const crossOn = study(cross, 'on')
    const ringOn = study(ring, 'on')
    const ringOff = study(ring, 'off')
    // (d): a lone love at 60 degrees to line 0 placed one dock back along its direction, so it reaches dock 0 on beat 1
    const d = Array.from({ length: 24 }, (_, e) => e).find(e => angleClass(e, 0) === 1) as number
    const passing = vacuum()
    const back = weave.mesh.neighbour(x, OPPOSITE[d] as number)

    passing.vibe[back * 24 + d] = 1

    const hitOn = study(own, 'on', passing)
    const hitOff = study(own, 'off', passing)

    const g1 = f1.returns && f1.offLine === 0 && f1.meetings > 0
    const g2 = ownOn.meetings === 160 && ownOn.distinct <= 3 && ownOn.fearsMax === 0
    const g3 = crossOn.meetings === 80 && crossOn.distinct <= 3
    const g4 = ringOn.fearsMax > 0 && ringOff.fearsMax === 0
    const status = g1 && g2 && g3 ? (g4 ? 'pass' : 'fail') : 'partial'
    const seconds = (Date.now() - started) / 1000
    const w = (xs: readonly number[]): string => xs.map(v => v.toFixed(4)).join(', ')
    const metrics: Record<string, number> = {
      vacuumReturnsAfter6: f1.returns ? 1 : 0,
      allOpenMeetings24: f1.meetings,
      meetingsOffLine0: f1.offLine,
      ownMeetings: ownOn.meetings,
      ownDistinct: ownOn.distinct,
      ownFears: ownOn.fearsMax,
      ownShareMax: ownOn.shareMax,
      crossMeetings: crossOn.meetings,
      crossDistinct: crossOn.distinct,
      crossFears: crossOn.fearsMax,
      crossShareMax: crossOn.shareMax,
      ringMeetings: ringOn.meetings,
      ringDistinct: ringOn.distinct,
      ringFears: ringOn.fearsMax,
      ringShareMax: ringOn.shareMax,
      ringShareLast: ringOn.shareLast,
      ringPure: ringOn.pure ? 1 : 0,
      ringFearsOff: ringOff.fearsMax,
      ...Object.fromEntries(ringOn.windows.map((v, i) => [`ringShareWindow${i + 1}`, v])),
      passingDirection: d,
      passingMeetings: hitOn.meetings,
      passingDistinct: hitOn.distinct,
      passingFears: hitOn.fearsMax,
      passingShareMax: hitOn.shareMax,
      passingFearsOff: hitOff.fearsMax,
      ...Object.fromEntries(hitOn.windows.map((v, i) => [`passingShareWindow${i + 1}`, v])),
      seconds,
    }

    return verdict({
      status,
      claim: `on the one-line living vacuum every vacuum token stays on its line and the state repeats after 6 beats (${f1.returns ? 'yes' : 'no'}; ${f1.offLine} of ${f1.meetings} meetings off line 0), so a unit's own pair meets ${ownOn.meetings} times in 480 beats through ${ownOn.distinct} wholes with ${ownOn.fearsMax ? 'fear' : 'no fear'}, the cross pair of two neighbouring units meets ${crossOn.meetings} times through ${crossOn.distinct} wholes (largest fear share ${crossOn.shareMax.toFixed(4)}), and the ring of those two units' four tokens meets ${ringOn.meetings} times through ${ringOn.distinct} wholes with the largest fear share ${ringOn.shareMax.toFixed(4)} (${ringOff.fearsMax ? 'fear' : 'none'} with the fear beat off); a passing lone love gives dock 0's own pair ${hitOn.distinct} wholes and fear share up to ${hitOn.shareMax.toFixed(4)}`,
      metrics,
      notes: `L2. Gates: F1 ${g1}, F2 ${g2}, F3 ${g3}, F4 ${g4}. The ring's largest fear share per 48-beat window: ${w(ringOn.windows)}; the own pair's with a passing love (direction ${d}): ${w(hitOn.windows)}; with the fear beat off the passing case carries ${hitOff.fearsMax ? 'fear' : 'no fear'}. Ring pure at every meeting: ${ringOn.pure}. ${seconds.toFixed(1)} s.`,
    })
  },
})
