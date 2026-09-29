// THE PATH INTEGRAL ON THE WORKING RULE (E-QTM-0158). The ledger row "the path integral" (amplitudes as a sum over take
// histories, stationary action in the classical limit) was none: E-QTM-0018 is a textbook discrete path integral, not
// the rule. This file asks it of the working rule itself.
//
// THE RULE: the working rule as it stands (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the
// pass contact), exact and superposed, on the empty box (no stored pair), loves only.
//
// DERIVED, before this file's first run:
//  - The rule is a product of local splittings (the coin on a lone open vibe's line, the meeting on a line of two like
//    open vibes) and relabellings (the stream's take, the link's point move, the pass contact's kept slots). So its
//    state after T beats is the sum, over every sequence of choices, of the product of the choices' coefficients,
//    placed where that sequence leads: a path integral with a finite sum and exact weights. What can fail is that the
//    rule holds anything else (a piece acting between the splittings, a merge rule, a sign) that the sum leaves out;
//    code/measure/history-sum enumerates the histories explicitly, one by one, without calling the rule's beat, and
//    compares term for term.
//  - The sum is coherent: histories that reach one configuration add as amplitudes. First at beat 3 for a lone vibe
//    (two ends each reached by two histories: keep-cross-keep and cross-cross-cross in the ratio 1 : -3, and
//    keep-cross-cross and cross-cross-keep equally), so the incoherent sum differs from beat 3 on.
//  - The classical limit is stationary phase. A history's weight is a product of k = e^(i pi/3)/2 and x = sqrt 3
//    e^(-i pi/6)/2; summed, the long-time amplitude at x = vT comes from the momenta q where the phase kx - W(q)T is
//    stationary, x/T = W'(q), with cos W = cos q / 2 read off the symbol (E-QTM-0157). So the weight concentrates on
//    |v| <= max |W'| = 1/2 (the top group speed), peaks at the caustic |v| = 1/2, and its second moment converges to
//    (1/2 pi) int W'(q)^2 dq, the same for both bands, so independent of the start: 1 - sqrt(1 - |k|^2) = 1 - sqrt 3/2
//    = 0.1339746 (Konno's limit for this coin). The dephased sum (chances in place of amplitudes, keep 1/4, reverse
//    3/4) is a persistent random walk: E[v^2] = 1/(3T) -> 0, a diffusion, no classical ray at all.
//
// GATES, fixed before the first run:
//  per start of E-MTH-0028's 17, side 8, the empty box:
//  H0 one love (center, first slot, point 3): at every beat 1..12 the rule's state equals the history sum term for term
//     (0 mismatches: every branch is a nonzero sum with its exact amplitude, every nonzero sum a branch)
//  H1 two loves on one line (center first slot point 0; two docks along the line, second slot, point 1): at every beat
//     1..8, 0 mismatches, meetings, exchanges and link point moves included
//  C1 control, the instrument can fail: the history sum with the meeting left out mismatches the two-love rule at some
//     beat 1..8, on every start whose run has an unequal-point meeting (AMENDED after the first run, see below: as first
//     registered it read "on 17 of 17", which a start whose meetings all have equal points cannot meet, since there the
//     meeting is the phase w alone and leaving it out changes nothing; the starts with no unequal-point meeting are
//     counted and reported)
//  H2 the sum is coherent: the one love's L1 between |sum|^2 and sum |amplitude|^2 is 0 at beats 1 and 2 and > 0 at
//     beat 3 (as derived), and > 0 at every beat 3..12
//  start-independent (trivial links, the line walk):
//  H3a calibration: on side 16 with every link the identity, the rule's lone love on its line has the fear walk's
//     chances exactly at every beat 1..7 (E-QTM-0157 E0, rechecked here), so the walk below is the rule's own
//  H3b stationary phase: the walk's exact E[v^2] at T = 64, 128, 256, 512, 1024 moves monotonically toward the
//     stationary-phase integral I = (1/2 pi) int W'^2 dq computed from the rule's coin, within 1e-5 at T = 1024; and I
//     equals 1 - sqrt 3/2 within 1e-9
//  H3c the dephased sum is a diffusion: T E[v^2] within 2% of 1/3 at T = 1024
//  H3d the caustic: the exact distribution's maximum sits at |v| >= 0.49 at T = 1024, below max |W'| = 1/2
// Verdict: fail if H0, H1, C1 or H3a fails (the identity or the instrument); pass if every gate holds; partial otherwise.
// Reported, never gated: history counts against configurations, the two-love coherence, the T = 3 shares (each
// history's amplitude over its end's total: the weak values of "this history"), the weight beyond |v| > 1/2 by T.
//
// PROBES before this file, disclosed: tmp/qf-probe1 (the gates read on integer+0 and golden), tmp/qf-probe2 (side 8,
// integer+0: one love to beat 10 and two loves to beat 8, 0 mismatches; coherence L1 0, 0, 0.5625 at beats 1..3; the
// T = 3 shares 1 : -3 and 1 : 1), tmp/qf-probe3 (the walk to T = 512: E[v^2] 0.13445, 0.13411, 0.13400, 0.13398,
// 0.13398 at T = 32..512 against I = 0.1339746; dephased T E[v^2] 0.347 to 0.334; argmax v 0.4375 to 0.492).
//
// FIRST RUN (78 s, tmp/qf-exp-history-run1.log): FAIL on C1 as then registered; every other gate held. H0 and H1 held on
// 17 of 17 (0 mismatches), H2, H3a to H3d held. C1 found the meeting-free sum mismatching on 15 of 17 starts; on
// integer+9 and golden it matched, and tmp/qf-probe4 (after the run) found why: on those two starts all 23 meetings in 8
// beats have equal points (0 unequal), so the meeting is the phase w alone and the control has no power there. The
// control was amended as stated at C1 (the identity gates H0, H1 were not touched) and the file run again.
// SECOND RUN (78 s, tmp/qf-exp-history-run2.log): pass, every gate held, title written after the run. C1: the
// meeting-free sum mismatches on 15 of the 15 starts with an unequal-point meeting; the 2 without one (integer+9, golden)
// are reported. OPEN: the motion is along one line (the line law, E-SPN-0098), so the classical limit shown is 1d.
//
// DETERMINISM: no random number; the start family is E-MTH-0028's; the histories are enumerated. The rule and the sums
// are exact in Z[w][1/2]; floats appear only in E[v^2], the symbol integral and printed readings. Depth L2 with an exact
// identity (L1): the rule measured against its own history expansion, with a control that fails. NOTHING MOVES: a
// history is a sequence of takes.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import {
  coherenceL1,
  compareWithRule,
  enumerateHistories,
  historyShares,
  type Vibe,
} from '@/code/measure/history-sum'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedState,
  lockedTables,
  newTally,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  chanceBeat,
  FEAR_COIN,
  norm as walkNorm,
  walkBeat,
  walkChances,
  walkStart,
  type ChanceState,
} from '@/code/rule/fear-walk'

const SIDE = 8
const LONE_BEATS = 12
const TWO_BEATS = 8
const WALK_SIDE = 16
const WALK_BEATS = 7
const LONG = [64, 128, 256, 512, 1024]
const SLOT = 0
const BACK = OPPOSITE[SLOT]!

type Fresh = ReturnType<typeof contactFresh>

const emptyOf = (f: Fresh): Configuration =>
  toWords(
    vacuumConfiguration(
      {
        cells: f.cells,
        store: new Int8Array(f.store.length),
        layout: f.layout,
      },
      'none',
    ),
  )

function place(f: Fresh, vibes: readonly Vibe[]): Configuration {
  const c = emptyOf(f)

  for (const v of vibes) {
    c.vibe[v.slot] = 1
    c.point[v.slot] = v.point
    c.open[v.slot] = 1
  }

  return c
}

// ---- the stationary-phase integral from the coin's own numbers ----
type Cx = { re: number; im: number }

const cm = (a: Cx, b: Cx): Cx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
})
const ca = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im })
const OMEGA: Cx = { re: -0.5, im: Math.sqrt(3) / 2 }
const KEEP: Cx = { re: (1 + OMEGA.re) / 2, im: OMEGA.im / 2 }
const CROSS: Cx = { re: (1 - OMEGA.re) / 2, im: -OMEGA.im / 2 }

// the two eigenphases of U(q) = S(q) C, C = [[keep, cross], [cross, keep]], S(q) = diag(e^(-iq), e^(iq))
function eigenphases(q: number): [number, number] {
  const e1: Cx = { re: Math.cos(q), im: -Math.sin(q) }
  const e2: Cx = { re: Math.cos(q), im: Math.sin(q) }
  const a = cm(e1, KEEP)
  const b = cm(e1, CROSS)
  const c = cm(e2, CROSS)
  const d = cm(e2, KEEP)
  const tr = ca(a, d)
  const det = ca(cm(a, d), cm({ re: -b.re, im: -b.im }, c))
  const disc = ca(cm(tr, tr), { re: -4 * det.re, im: -4 * det.im })
  const r = Math.sqrt(Math.hypot(disc.re, disc.im))
  const th = Math.atan2(disc.im, disc.re) / 2
  const s: Cx = { re: r * Math.cos(th), im: r * Math.sin(th) }

  return [
    Math.atan2((tr.im + s.im) / 2, (tr.re + s.re) / 2),
    Math.atan2((tr.im - s.im) / 2, (tr.re - s.re) / 2),
  ]
}

function stationaryPhase(points: number): {
  integral: number
  top: number
} {
  let integral = 0
  let top = 0

  for (let j = 0; j < points; j++) {
    const q = ((j + 0.5) * 2 * Math.PI) / points
    const h = 1e-6

    let d = eigenphases(q + h)[0] - eigenphases(q - h)[0]

    if (d > Math.PI) {
      d -= 2 * Math.PI
    }

    if (d < -Math.PI) {
      d += 2 * Math.PI
    }

    const v = d / (2 * h)

    integral += v * v
    top = Math.max(top, Math.abs(v))
  }

  return { integral: integral / points, top }
}

// the walk to T on a ring that never wraps: E[v^2], the dephased E[v^2], the argmax |v|, the weight beyond |v| > 1/2
function longWalk(T: number): {
  ev2: number
  dephased: number
  argmax: number
  beyond: number
  normExact: boolean
} {
  const n = 2 * T + 3

  let s = walkStart(n, 0, true)
  let c: ChanceState = {
    right: s.right.map((_, i) => (i === 0 ? 1n : 0n)),
    left: s.left.map(() => 0n),
  }

  for (let t = 0; t < T; t++) {
    s = walkBeat(s, () => FEAR_COIN)
    c = chanceBeat(c, 1n, 3n)
  }

  const pos = (i: number): number => (i > n / 2 ? i - n : i)

  let m2 = 0n
  let m2c = 0n
  let total = 0n
  let beyond = 0n
  let best = -1n
  let arg = 0

  for (let i = 0; i < n; i++) {
    const p = walkNorm(s.right[i]!) + walkNorm(s.left[i]!)
    const pc = c.right[i]! + c.left[i]!
    const xx = BigInt(pos(i))

    total += p
    m2 += p * xx * xx
    m2c += pc * xx * xx

    if (2 * Math.abs(pos(i)) > T) {
      beyond += p
    }

    if (p > best) {
      best = p
      arg = pos(i)
    }
  }

  const unit = 4n ** BigInt(T)
  const shift = BigInt(Math.max(0, unit.toString(2).length - 60))
  const read = (v: bigint): number =>
    Number(v >> shift) / Number(unit >> shift)

  return {
    ev2: read(m2) / (T * T),
    dephased: read(m2c) / (T * T),
    argmax: Math.abs(arg) / T,
    beyond: read(beyond),
    normExact: total === unit,
  }
}

// H3a: the rule's lone love on its line against the walk's chances, trivial links, side 16, beats 1..7
function walkCalibration(): boolean {
  const f = contactFresh(WALK_SIDE, 'pass')
  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(f.cells * 24).fill(f.weave.moves.identity),
  )
  const center = centerOf(WALK_SIDE)
  const cell = new Map<number, number>()

  let x = center
  let n = 0

  do {
    cell.set(x, n)
    x = f.weave.mesh.neighbour(x, SLOT)
    n++
  } while (x !== center && n < 1024)

  let s: LockedState = lockedState(
    place(f, [{ slot: center * 24 + SLOT, point: 0 }]),
  )
  let walk = walkStart(n, 0, true)
  let ok = true

  for (let t = 1; t <= WALK_BEATS; t++) {
    s = coinedVetoBeat('none', tables, s, t - 1)
    walk = walkBeat(walk, () => FEAR_COIN)

    const chances = walkChances(walk)
    const rule = new Map<number, bigint>()

    for (const b of s.branches) {
      const slot = b.vibe.findIndex(v => v !== 0)
      const at = cell.get(Math.floor(slot / 24))

      if (
        at === undefined ||
        (slot % 24 !== SLOT && slot % 24 !== BACK)
      ) {
        ok = false
      } else {
        rule.set(
          at,
          (rule.get(at) ?? 0n) +
            (b.a * b.a - b.a * b.b + b.b * b.b) *
              (1n << BigInt(2 * (t - b.k))),
        )
      }
    }

    chances.forEach((p, i) => {
      if ((rule.get(i) ?? 0n) !== p) {
        ok = false
      }
    })
  }

  return ok
}

export default experiment({
  id: 'quantum/history-sum',
  code: 'E-QTM-0158',
  title:
    "the path integral on the working rule, pass: the rule's state IS the sum over take histories, enumerated one history at a time without the rule's beat, term for term (one love to beat 12, two loves with their meetings and link point moves to beat 8, 0 mismatches on 17 of 17 starts; the sum with the meeting left out fails on every start whose run has an unequal-point meeting, 15 of 17); the sum is coherent from beat 3 (L1 0.5625 against the incoherent sum); its long-time limit is stationary phase, E[v^2] 0.134112 to 0.133975 at T = 64 to 1024 against (1/2 pi) int W'^2 = 1 - sqrt 3/2, peaked at the caustic |v| = 0.494 below the top speed 1/2, where the dephased sum diffuses (T E[v^2] 0.334); one dimension, along a line",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)

    const perStart = family.map(member =>
      withStart(member, () => {
        const f = contactFresh(SIDE, 'pass')
        const center = centerOf(SIDE)
        const lone: Vibe[] = [{ slot: center * 24 + SLOT, point: 3 }]

        let s = lockedState(place(f, lone))

        const loneMismatch: number[] = []
        const loneL1: number[] = []
        const loneCounts: string[] = []

        for (let T = 1; T <= LONE_BEATS; T++) {
          s = coinedVetoBeat('none', f.tables, s, T - 1)

          const h = enumerateHistories(f.tables, lone, T)
          const c = compareWithRule(s, h)
          const co = coherenceL1(f.tables, lone, T)

          loneMismatch.push(c.mismatches)
          loneL1.push(Number(co.l1) / Number(co.unit))
          loneCounts.push(`${h.histories}/${c.nonzero}`)
        }

        let b = center

        for (let k = 0; k < 2; k++) {
          b = f.weave.mesh.neighbour(b, SLOT)
        }

        const two: Vibe[] = [
          { slot: center * 24 + SLOT, point: 0 },
          { slot: b * 24 + BACK, point: 1 },
        ]

        let s2 = lockedState(place(f, two))

        const twoMismatch: number[] = []
        const noMeetMismatch: number[] = []
        const tally = newTally()

        for (let T = 1; T <= TWO_BEATS; T++) {
          s2 = coinedVetoBeat('none', f.tables, s2, T - 1, tally)
          twoMismatch.push(
            compareWithRule(s2, enumerateHistories(f.tables, two, T))
              .mismatches,
          )

          noMeetMismatch.push(
            compareWithRule(
              s2,
              enumerateHistories(f.tables, two, T, false),
            ).mismatches,
          )
        }

        const twoL1 = coherenceL1(f.tables, two, TWO_BEATS)
        const shares = historyShares(f.tables, lone, 3)

        log(`start ${member.name}`)

        return {
          name: member.name,
          loneMismatch,
          loneL1,
          loneCounts,
          twoMismatch,
          noMeetMismatch,
          splits: tally.splitMeetings,
          phases: tally.phaseMeetings,
          twoL1: Number(twoL1.l1) / Number(twoL1.unit),
          shares,
        }
      }),
    )

    const calibrated = walkCalibration()

    log('H3a')

    const sp = stationaryPhase(400000)
    const long = LONG.map(T => ({ T, ...longWalk(T) }))

    log('long walk')

    type P = (typeof perStart)[number]

    const count = (test: (p: P) => boolean): number =>
      perStart.filter(test).length
    const all = (test: (p: P) => boolean): boolean =>
      count(test) === family.length
    const last = long[long.length - 1]!
    const gaps = long.map(r => Math.abs(r.ev2 - sp.integral))
    const g = {
      H0: all(p => p.loneMismatch.every(m => m === 0)),
      H1: all(p => p.twoMismatch.every(m => m === 0)),
      C1:
        all(p => p.splits === 0 || p.noMeetMismatch.some(m => m > 0)) &&
        count(p => p.splits > 0) > 0,
      H3a: calibrated,
    }
    const q = {
      H2: all(
        p =>
          p.loneL1[0] === 0 &&
          p.loneL1[1] === 0 &&
          p.loneL1.slice(2).every(x => x > 0),
      ),
      H3b:
        gaps.every((d, i) => i === 0 || d < gaps[i - 1]!) &&
        gaps[gaps.length - 1]! < 1e-5 &&
        Math.abs(sp.integral - (1 - Math.sqrt(3) / 2)) < 1e-9 &&
        long.every(r => r.normExact),
      H3c: Math.abs(last.dephased * last.T - 1 / 3) < (0.02 * 1) / 3,
      H3d: last.argmax >= 0.49 && last.argmax <= 0.5,
    }
    const instrument = Object.values(g).every(Boolean)
    const answered = Object.values(q).every(Boolean)
    const status = !instrument ? 'fail' : answered ? 'pass' : 'partial'
    const r6 = (x: number): string => x.toFixed(6)
    const metrics: Record<string, number> = { starts: family.length }

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    for (const [k, v] of Object.entries(q)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.stationaryIntegral = sp.integral
    metrics.topGroupSpeed = sp.top
    long.forEach(r => {
      metrics[`ev2_T${r.T}`] = r.ev2
      metrics[`dephasedTEv2_T${r.T}`] = r.dephased * r.T
      metrics[`argmax_T${r.T}`] = r.argmax
      metrics[`beyondHalf_T${r.T}`] = r.beyond
    })

    metrics.loneL1AtT12Min = Math.min(
      ...perStart.map(p => p.loneL1[LONE_BEATS - 1]!),
    )
    metrics.twoL1Min = Math.min(...perStart.map(p => p.twoL1))
    metrics.seconds = (Date.now() - started) / 1000

    const share = perStart[0]!.shares
      .map(
        s =>
          `${s.key}: ${s.words.map(w => `${w.word} ${w.amp.join(',')}`).join(' + ')} = ${s.total.join(',')}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `on the working rule the state is the sum over take histories term for term: one love to beat ${LONE_BEATS} on ${count(p => p.loneMismatch.every(m => m === 0))} of ${family.length} starts, two loves with their meetings to beat ${TWO_BEATS} on ${count(p => p.twoMismatch.every(m => m === 0))} of ${family.length} (the sum without the meeting fails on ${count(p => p.noMeetMismatch.some(m => m > 0))}); the sum is coherent from beat 3 (L1 against the incoherent sum ${p0(perStart, 2)}); in the long-time limit it concentrates on the stationary-phase rays: E[v^2] ${long.map(r => r6(r.ev2)).join(', ')} at T = ${LONG.join(', ')} against (1/2 pi) int W'^2 = ${r6(sp.integral)} (1 - sqrt 3/2), peak at |v| = ${last.argmax.toFixed(4)} (top group speed ${sp.top.toFixed(6)}), where the dephased sum diffuses (T E[v^2] = ${(last.dephased * last.T).toFixed(4)})`,
      metrics,
      control: {
        noMeetingMismatchStarts: count(p =>
          p.noMeetMismatch.some(m => m > 0),
        ),
        startsWithUnequalMeetings: count(p => p.splits > 0),
        dephasedTEv2: last.dephased * last.T,
      },
      notes: `L2 with an exact identity. Gates ${Object.entries({
        ...g,
        ...q,
      })
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. Per start: one-love mismatches ${perStart.map(p => `${p.name} [${p.loneMismatch.join('')}]`).join(' ')}; histories/ends by beat on ${perStart[0]!.name}: ${perStart[0]!.loneCounts.join(' ')}; coherence L1 by beat on ${perStart[0]!.name}: ${perStart[0]!.loneL1.map(x => x.toFixed(4)).join(' ')}; two-love mismatches all zero on ${count(p => p.twoMismatch.every(m => m === 0))}, without the meeting first mismatch at beat ${perStart.map(p => p.noMeetMismatch.findIndex(m => m > 0) + 1).join(',')} (0 = never); unequal-point (split) and equal-point (phase) meetings over the ${TWO_BEATS} beats ${perStart.map(p => `${p.name} ${p.splits}/${p.phases}`).join(' ')}; two-love coherence L1 at beat ${TWO_BEATS} ${perStart.map(p => p.twoL1.toFixed(4)).join(' ')}. T = 3 history shares on ${perStart[0]!.name} (numerators over 8): ${share}. Weight beyond |v| > 1/2: ${long.map(r => `T ${r.T} ${r.beyond.toFixed(4)}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})

function p0(perStart: { loneL1: number[] }[], at: number): string {
  const xs = perStart.map(p => p.loneL1[at]!)

  return Math.min(...xs) === Math.max(...xs)
    ? `${xs[0]}`
    : `${Math.min(...xs)} to ${Math.max(...xs)}`
}
