// WEAK VALUES AND A WEAK POINTER ON THE RULE (E-QTM-0160). The ledger row "weak measurement and weak values" (a reading
// that disturbs little and averages to anomalous values) was none.
//
// ON THE RULE ITSELF: the weak value of "the history went this way", between a start and a reached end, is that
// history's share of the end's amplitude. The working rule's lone vibe reaches two ends at beat 3 by two histories each
// (code/measure/history-sum, E-QTM-0158): keep-cross-keep and cross-cross-cross in the ratio 1 : -3, so their shares
// are -1/2 and 3/2, outside the range [0, 1] a probability of passage could take.
//
// ON THE RULE'S GATES (code/measure/rule-gates, read bit for bit on the start family), a two-coin interferometer: a love
// A from direction R, the coin (arm R keep k, arm L cross x), a phase w^j on arm L, the coin, A's direction f read (the
// post-selection). The weak value of the arm projector is (Pi_L)_w = <f|C Pi_L C|R> / <f|C C|R>.
//
// THE WEAK POINTER: a love B on arm L's line, present there at that beat only through its keep-every-beat history from n
// docks away, so with amplitude k^n (|k|^2n = 4^-n); every other history of B is elsewhere. Where A is on arm L and B is
// there, the line of two acts (w U on their points 0 and 1: exchange with -w x). The pointer is B's point: B holds 0
// (exchanged) only if A passed on L while B was there. Because the coupling is I + Pi_L (w U - I) on the present part,
// the post-selected pointer is EXACTLY A_fi (1 + (Pi_L)_w (w U - I)) on it, at any strength, and as 4^-n -> 0 the
// exchange count conditioned on f, per unit of 4^-n |x|^2, tends to |(Pi_L)_w|^2.
//
// DERIVED, before this file's first run (tmp/qf-probe1): at j = 0, f = R, (Pi_R)_w = -1/2, (Pi_L)_w = 3/2; at f = L,
// j = 1 and 2, (Pi_R)_w = -w and 1 + w (unit size, not real); (Pi_R)_w + (Pi_L)_w = 1 always. So the weak pointer at
// j = 0, f = R reads 9/4 in the limit: more exchange than a definite passage on L could ever give (1 per unit), an
// anomalous weak value read on a pointer, while A's own statistics are disturbed by O(4^-n).
//
// GATES, fixed before the first run:
//  G0 the three splittings read on the working rule on 17 of 17 starts
//  W1 on the rule, per start (side 8, one love, beat 3): every end reached by two histories has shares summing to 1, and
//     the shares -1/2 and 3/2 (keep-cross-keep, cross-cross-cross) appear, on 17 of 17
//  W2 the interferometer's weak values, exact: (Pi_R)_w + (Pi_L)_w = 1 at every (f, j) with a nonzero denominator; one
//     real value outside [0, 1] ((Pi_L)_w = 3/2 at j 0, f R) and one non-real value
//  W3 the weak pointer at j 0, f R, n = 0 .. 12: the response R_n = P(exchange | f) / (4^-n |x|^2) exact, |R_n - 9/4|
//     strictly decreasing, below 1e-6 at n = 12, and R_n > 1 for every n >= 1
//  W4 the pointer is weak: A's disturbance |P(f) - P0(f)| / P0(f) strictly decreasing in n, below 1e-6 at n = 12
//  C1 control, no post-selection: the response summed over f is exactly 3/4 at every n (the pointer counts A's arm-L
//     probability |x|^2 = 3/4, which is inside the range [0, 1])
//  C2 control, A dephased between the coins (the arms added as chances): the post-selected response is at most 1 at
//     every n and f
// Verdict: fail if G0 or W1 fails; partial if every gate holds (W1 is on the rule itself; W2 to W4 use the rule's gates
// in an arranged schedule, and B's presence amplitude k^n is its keep history, not a mesh run); fail otherwise.
//
// PROBES before this file, disclosed: tmp/qf-probe1 (the weak values at every (f, j)), tmp/qf-probe2 (the T = 3 shares on
// integer+0: 1 + 2w and -3(1 + 2w) at one end, 3 and 3 at the other). tmp/qf-smoke-weak.log ran this file as written with
// its placeholder title; the gates did not move after it.
//
// FIRST RUN (3.6 s, tmp/qf-exp-weak-run1.log): partial as derived, every gate held, title written after the run. The
// response is exactly 9 4^n / (4^(n+1) + 9): 9/13, 36/25, 144/73, 576/265 ... 150994944/67108873 at n = 0 .. 12,
// the disturbance 9/4 4^-n. At full strength (n = 0) the pointer reads 9/13 < 1: the anomaly needs the weakness.
//
// DETERMINISM: no random number; exact in Q(w); floats only in printed readings. Depth L2 (weak values, known physics,
// on the rule's measured numbers) with W1 on the rule itself. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { historyShares, type Vibe } from '@/code/measure/history-sum'
import { add, apply, armPhase, coinGate, dirOf, div, eq, float, gatesOnFamily, isRational, isZero, K, lineOfTwo, mul, norm, ONE, pointsOf, qw, show, start, sub, weightWhere, wPow, X, ZERO, type Qw } from '@/code/measure/rule-gates'

const SIDE = 8
const N_MAX = 12

// the interferometer's arm amplitudes at f (A from R): arm R C_fR k, arm L C_fL x w^j
function arms(f: string, j: number): { r: Qw; l: Qw } {
  return { r: mul(f === 'R' ? K : X, K), l: mul(mul(f === 'R' ? X : K, X), wPow(j)) }
}

// the circuit with B present on arm L (points 0 = A, 1 = B): P(f, exchanged) and P(f, not exchanged)
function present(f: string, j: number): { ex: Qw; no: Qw } {
  let s = start('R', [0, 1])

  s = apply(s, coinGate)
  s = apply(s, lineOfTwo(0, 1, 'L'))
  s = apply(s, armPhase('L', j))
  s = apply(s, coinGate)

  return { ex: weightWhere(s, l => dirOf(l) === f && pointsOf(l)[1] === 0), no: weightWhere(s, l => dirOf(l) === f && pointsOf(l)[1] === 1) }
}

// P0(f): no pointer
function bare(f: string, j: number): Qw {
  let s = start('R', [0])

  s = apply(s, coinGate)
  s = apply(s, armPhase('L', j))
  s = apply(s, coinGate)

  return weightWhere(s, l => dirOf(l) === f)
}

const inUnit = (v: Qw): boolean => isRational(v) && v.a >= 0n && v.a <= v.d

export default experiment({
  id: 'quantum/weak-values',
  code: 'E-QTM-0160',
  title:
    'weak values on the rule, partial: the lone vibe\'s two histories to one end at beat 3 have shares -1/2 and 3/2 on 17 of 17 starts, outside [0, 1]; on the rule\'s gates a two-coin interferometer has (Pi_L)_w = 3/2 and non-real weak values -w, 1 + w; a pointer love present on the arm with amplitude k^n reads, post-selected, 9/13 at full strength, then 36/25, 144/73 ... -> |(Pi_L)_w|^2 = 9/4 > 1 exchanges per unit as n grows, while disturbing the love\'s statistics by 9/4 4^-n; unconditioned it reads the arm probability 3/4 and with the arms dephased at most 9/10; the schedule arranged',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const gates = gatesOnFamily()
    const family = startFamily(16)
    const notes: string[] = []

    // W1: the rule's own shares, per start
    const shares = family.map(member =>
      withStart(member, () => {
        const f = contactFresh(SIDE, 'pass')
        const lone: Vibe[] = [{ slot: centerOf(SIDE) * 24, point: 3 }]
        const groups = historyShares(f.tables, lone, 3)
        const values: string[] = []
        let sumsToOne = true
        let found = { minusHalf: false, threeHalves: false }

        for (const gr of groups) {
          const total = qw(gr.total[0], gr.total[1])
          let sum = ZERO

          for (const w of gr.words) {
            const share = div(qw(w.amp[0], w.amp[1]), total)

            sum = add(sum, share)
            values.push(`${w.word} ${show(share)}`)
            if (w.word === 'kxk' && eq(share, qw(-1n, 0n, 2n))) found = { ...found, minusHalf: true }
            if (w.word === 'xxx' && eq(share, qw(3n, 0n, 2n))) found = { ...found, threeHalves: true }
          }

          sumsToOne &&= eq(sum, ONE)
        }

        return { name: member.name, ok: sumsToOne && found.minusHalf && found.threeHalves, values }
      }),
    )

    // W2: the interferometer's weak values
    let w2Sum = true
    let realAnomalous = false
    let nonReal = false

    for (const f of ['R', 'L']) {
      for (let j = 0; j < 3; j++) {
        const { r, l } = arms(f, j)
        const total = add(r, l)

        if (isZero(total)) continue

        const wr = div(r, total)
        const wl = div(l, total)

        w2Sum &&= eq(add(wr, wl), ONE)
        if ((isRational(wr) && !inUnit(wr)) || (isRational(wl) && !inUnit(wl))) realAnomalous = true
        if (!isRational(wr) || !isRational(wl)) nonReal = true
        notes.push(`f ${f} j ${j}: (Pi_R)_w ${show(wr)}, (Pi_L)_w ${show(wl)}`)
      }
    }

    const target = arms('R', 0)
    const wl0 = div(target.l, add(target.r, target.l))
    const limit = norm(wl0)

    // W3, W4, C1, C2: the weak pointer
    const xx = norm(X)
    const rows: { n: number; response: Qw; disturbance: Qw; summed: Qw; dephased: Qw[] }[] = []

    for (let n = 0; n <= N_MAX; n++) {
      const beta2 = qw(1n, 0n, 4n ** BigInt(n))
      const rest = sub(ONE, beta2)
      const at = (f: string, j: number): { pf: Qw; ex: Qw; p0: Qw } => {
        const p = present(f, j)
        const p0 = bare(f, j)

        return { pf: add(mul(rest, p0), mul(beta2, add(p.ex, p.no))), ex: mul(beta2, p.ex), p0 }
      }
      const r = at('R', 0)
      const response = div(div(r.ex, r.pf), mul(beta2, xx))
      const disturbance = div(sub(r.pf, r.p0), r.p0)
      const both = ['R', 'L'].map(f => at(f, 0))
      const summed = div(add((both[0] as { ex: Qw }).ex, (both[1] as { ex: Qw }).ex), mul(beta2, xx))
      // A dephased: the arms added as chances; B present on L with amplitude beta: exchange weight beta^2 |x|^2 |a_L|^2
      const dephased = ['R', 'L'].map(f => {
        const { r: ar, l: al } = arms(f, 0)
        const pf = add(norm(ar), norm(al))
        const ex = mul(mul(beta2, xx), norm(al))

        return div(div(ex, pf), mul(beta2, xx))
      })

      rows.push({ n, response, disturbance, summed, dephased })
    }

    const gap = (v: Qw): number => Math.abs(float(v).re - float(limit).re)
    const abs = (v: Qw): number => Math.abs(float(v).re)
    const w3 = rows.every((r, i) => i === 0 || gap(r.response) < gap((rows[i - 1] as { response: Qw }).response)) && gap((rows[N_MAX] as { response: Qw }).response) < 1e-6 && rows.slice(1).every(r => float(r.response).re > 1)
    const w4 = rows.every((r, i) => i === 0 || abs(r.disturbance) < abs((rows[i - 1] as { disturbance: Qw }).disturbance)) && abs((rows[N_MAX] as { disturbance: Qw }).disturbance) < 1e-6
    const c1 = rows.every(r => eq(r.summed, xx))
    const c2 = rows.every(r => r.dephased.every(d => float(d).re <= 1 + 1e-15))

    const g = { G0: gates.passing === gates.of, W1: shares.every(s => s.ok), W2: w2Sum && realAnomalous && nonReal, W3: w3, W4: w4, C1: c1, C2: c2 }
    const status = !g.G0 || !g.W1 ? 'fail' : Object.values(g).every(Boolean) ? 'partial' : 'fail'
    const metrics: Record<string, number> = { starts: family.length, startsWithShares: shares.filter(s => s.ok).length, startsReadingTheGates: gates.passing, weakValueLimit: float(limit).re }

    for (const [k, v] of Object.entries(g)) metrics[`gate_${k}`] = v ? 1 : 0
    rows.forEach(r => {
      metrics[`response_n${r.n}`] = float(r.response).re
      metrics[`disturbance_n${r.n}`] = float(r.disturbance).re
    })
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `weak values on the working rule: the lone vibe's two histories to one end at beat 3 have shares -1/2 and 3/2 on ${shares.filter(s => s.ok).length} of ${family.length} starts, outside the range a passage probability could take; on the rule's gates (read on ${gates.passing} of ${gates.of}) a two-coin interferometer has (Pi_L)_w = ${show(wl0)} and non-real weak values -w and 1 + w, and a pointer love present on the arm only through its keep history (amplitude k^n) reads, post-selected, ${rows.slice(0, 4).map(r => float(r.response).re.toFixed(4)).join(', ')} ... ${float((rows[N_MAX] as { response: Qw }).response).re.toFixed(8)} exchanges per unit (n = 0 .. ${N_MAX}), converging to |(Pi_L)_w|^2 = ${show(limit)} > 1, while disturbing the love's statistics by ${abs((rows[N_MAX] as { disturbance: Qw }).disturbance).toExponential(2)} at n = ${N_MAX}; unconditioned the pointer reads exactly the arm-L probability 3/4, and with the arms dephased at most 1`,
      metrics,
      control: { unconditionedResponse: float(xx).re, dephasedResponseMax: Math.max(...rows.flatMap(r => r.dephased.map(d => float(d).re))) },
      notes: `L2 with W1 on the rule. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Weak values: ${notes.join('; ')}. Shares on ${shares[0]?.name}: ${shares[0]?.values.join(', ')}. Response exact by n: ${rows.map(r => show(r.response)).join(', ')}. The schedule is arranged (B's line on arm L at the coupling beat); B's presence amplitude k^n is its keep-every-beat history, argued, not run on the mesh. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
