// MIXED STATES AND POVMS FROM ANCILLA VIBES (E-QTM-0161). The ledger row "mixed states and POVMs" (general readings, not
// only projective ones) was none. On the rule every reading is a reading of configurations, which is projective on the
// whole; a general reading of one part arises when that part is coupled to ancilla vibes and only the ancillas are read
// (Naimark's dilation). This file builds one from the rule's own gates (code/measure/rule-gates, read bit for bit on the
// start family) and measures what it is.
//
// THE DEVICE: the system is a love A's direction (R or L, a qubit). Two ancilla loves B and C, points 1 and 2 (A's is 0):
//   1. on arm R, A shares its line with B: the line of two, w U on points (A, B)
//   2. the coin on A (so the next coupling asks about a DIFFERENT direction basis)
//   3. on arm R, A shares its line with C: w U on points (A, C)
// Then the three points are read and A's direction is discarded. The reading's outcomes are the point configurations; its
// effects are E_o = sum over A's final direction of K_o^dag K_o, 2x2 matrices over Q(w).
//
// DERIVED, before this file's first run:
//  - sum E_o = I (the device is unitary and the readout complete)
//  - more than 2 outcomes carry nonzero effects (the exchanges record which couplings acted: none, B, C, and B then C)
//  - an effect is not a projector (a meeting records only 3/4 of the time)
//  - two effects do not commute, because the coin between the couplings turns the second one's basis: so the reading is
//    not a projective measurement with its outcomes shuffled by classical noise, which is the non-trivial kind of POVM
//  - Born's rule on the part: each outcome's probability on an input equals <psi|E_o|psi> exactly
//  - A's state after coupling 1 alone, the ancilla traced, is mixed: purity < 1 (46/64 for the input C|R>, the
//    coherence cut by the marker overlap 1/2), while the whole (A and B) stays pure
//
// GATES, fixed before the first run:
//  G0 the three splittings read on the working rule on 17 of 17 starts
//  M1 sum E_o = I exactly
//  M2 at least 3 outcomes with nonzero effect
//  M3 at least one effect with E^2 != E
//  M4 at least one pair of effects that do not commute
//  M5 Born on the part: for the inputs R, L, C|R>, C|L> and C|R> with w on L, every outcome's probability from the
//     device equals <psi|E_o|psi> exactly
//  M6 mixed from pure: after coupling 1 on the input C|R>, A's reduced purity is 46/64 < 1 while the whole's norm is 1
//  C1 control, equal points (0, 0, 0): exactly one outcome, with effect I (nothing is recorded)
// Reported: whether the effects span all 2x2 Hermitian matrices (informational completeness).
// Verdict: fail if G0 or C1 fails; partial if every gate holds (the gates are the rule's, the schedule is arranged);
// fail otherwise.
//
// PROBES before this file, disclosed: tmp/qf-probe1 (the gates on integer+0 and golden, and w U's action).
// tmp/qf-smoke-povm.log ran this file as written with its placeholder title; the gates did not move after it.
//
// FIRST RUN (1.9 s, tmp/qf-exp-povm-run1.log): partial as derived, every gate held, title written after the run.
// Effects (A's point, B's, C's): 0,1,2 [[13/64, -(3 + 6w)/32], [(3 + 6w)/32, 7/16]], 2,1,0 [[3/64, (3 + 6w)/32],
// [-(3 + 6w)/32, 9/16]], 1,0,2 diag(39/64, 0), 2,0,1 diag(9/64, 0). Hermitian rank 3: not informationally complete.
//
// DETERMINISM: exact in Q(w); no random number. Depth L2: a POVM by Naimark dilation (known physics) from the rule's
// measured gates, with a control that records nothing. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { add, apply, coinGate, conj, dirOf, eq, gatesOnFamily, IDENTITY, isZero, label, lineOfTwo, m2, m2add, m2eq, m2isZero, m2mul, m2show, mul, norm, ONE, pointsOf, qw, show, weightWhere, ZERO, type M2, type Qw, type State } from '@/code/measure/rule-gates'

const DIRS = ['R', 'L'] as const

// the device on a start state
function device(s: State): State {
  let t = apply(s, lineOfTwo(0, 1, 'R'))

  t = apply(t, coinGate)

  return apply(t, lineOfTwo(0, 2, 'R'))
}

const initial = (amps: Partial<Record<(typeof DIRS)[number], Qw>>, points: number[]): State => {
  const s: State = new Map()

  for (const d of DIRS) if (amps[d] && !isZero(amps[d] as Qw)) s.set(label(d, points), amps[d] as Qw)

  return s
}

// the effects: outcome (points) -> 2x2 (rows and columns R, L)
function effects(points: number[]): Map<string, M2> {
  const out = new Map<string, M2>()
  const columns = DIRS.map(d => device(initial({ [d]: ONE }, points)))
  const outcomes = new Set<string>()

  for (const c of columns) for (const l of c.keys()) outcomes.add(pointsOf(l).join(','))

  for (const o of outcomes) {
    const k = (d: number, final: string): Qw => (columns[d] as State).get(label(final, o.split(',').map(Number))) ?? ZERO
    const entry = (e: number, d: number): Qw => DIRS.reduce((s, f) => add(s, mul(conj(k(e, f)), k(d, f))), ZERO)

    out.set(o, m2(entry(0, 0), entry(0, 1), entry(1, 0), entry(1, 1)))
  }

  return out
}

// <psi|E|psi>
const expectation = (e: M2, psi: [Qw, Qw]): Qw => {
  let s = ZERO

  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) s = add(s, mul(mul(conj(psi[i] as Qw), (e[i] as [Qw, Qw])[j] as Qw), psi[j] as Qw))

  return s
}

// the rank of a set of Hermitian 2x2 matrices as real 4-vectors (E_RR, E_LL, and E_RL's two real parts, with sqrt 3
// divided out of the imaginary one), by exact Gaussian elimination
function hermitianRank(list: M2[]): number {
  type F = { n: bigint; d: bigint }
  const f = (n: bigint, d: bigint): F => (d < 0n ? { n: -n, d: -d } : { n, d })
  const sub2 = (a: F, b: F): F => f(a.n * b.d - b.n * a.d, a.d * b.d)
  const mul2 = (a: F, b: F): F => f(a.n * b.n, a.d * b.d)
  const div2 = (a: F, b: F): F => f(a.n * b.d, a.d * b.n)
  const rows: F[][] = list.map(e => {
    const rl = (e[0] as [Qw, Qw])[1] as Qw

    return [f(e[0][0].a, e[0][0].d), f(e[1][1].a, e[1][1].d), f(2n * rl.a - rl.b, 2n * rl.d), f(rl.b, 2n * rl.d)]
  })
  let rank = 0

  for (let c = 0; c < 4 && rank < rows.length; c++) {
    const p = rows.findIndex((r, i) => i >= rank && (r[c] as F).n !== 0n)

    if (p < 0) continue
    ;[rows[rank], rows[p]] = [rows[p] as F[], rows[rank] as F[]]

    for (let i = 0; i < rows.length; i++) {
      if (i === rank || (rows[i] as F[])[c]!.n === 0n) continue

      const factor = div2((rows[i] as F[])[c] as F, (rows[rank] as F[])[c] as F)

      rows[i] = (rows[i] as F[]).map((x, k) => sub2(x, mul2(factor, (rows[rank] as F[])[k] as F)))
    }

    rank++
  }

  return rank
}

export default experiment({
  id: 'quantum/povm-from-an-ancilla',
  code: 'E-QTM-0161',
  title:
    "mixed states and a POVM from ancilla vibes on the rule's own gates, partial: two ancilla loves meeting one arm with a coin between give 4 outcomes whose effects sum to I exactly, are not projectors and do not commute (not a sharp reading shuffled by noise), and give Born's probabilities on the part exactly on 5 inputs; not informationally complete (the effects span 3 of 4 real dimensions); one coupling leaves the part mixed (purity 23/32) inside a pure whole; with equal points nothing is recorded; gates read bit for bit on 17 of 17 starts, the schedule arranged",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const gates = gatesOnFamily()
    const e = effects([0, 1, 2])
    const list = [...e.entries()].filter(([, m]) => !m2isZero(m))
    const total = list.reduce<M2>((s, [, m]) => m2add(s, m), m2(ZERO, ZERO, ZERO, ZERO))
    const m1 = m2eq(total, IDENTITY)
    const m2count = list.length >= 3
    const m3 = list.some(([, m]) => !m2eq(m2mul(m, m), m))
    let m4 = false

    for (let i = 0; i < list.length && !m4; i++) for (let j = i + 1; j < list.length && !m4; j++) if (!m2eq(m2mul((list[i] as [string, M2])[1], (list[j] as [string, M2])[1]), m2mul((list[j] as [string, M2])[1], (list[i] as [string, M2])[1]))) m4 = true

    // M5: Born on the part
    const k = qw(1n, 1n, 2n)
    const x = qw(1n, -1n, 2n)
    const w = qw(0n, 1n)
    const inputs: { name: string; psi: [Qw, Qw] }[] = [
      { name: 'R', psi: [ONE, ZERO] },
      { name: 'L', psi: [ZERO, ONE] },
      { name: 'C|R>', psi: [k, x] },
      { name: 'C|L>', psi: [x, k] },
      { name: 'C|R> w on L', psi: [k, mul(w, x)] },
    ]
    let m5 = true
    const bornNotes: string[] = []

    for (const input of inputs) {
      const out = device(initial({ R: input.psi[0], L: input.psi[1] }, [0, 1, 2]))

      for (const [o, eff] of list) {
        const direct = weightWhere(out, l => pointsOf(l).join(',') === o)
        const predicted = expectation(eff, input.psi)

        m5 &&= eq(direct, predicted)
      }

      bornNotes.push(`${input.name}: ${list.map(([o, eff]) => `${o} ${show(expectation(eff, input.psi))}`).join(' ')}`)
    }

    // M6: mixed from pure
    let one = initial({ R: ONE }, [0, 1])

    one = apply(one, coinGate)
    one = apply(one, lineOfTwo(0, 1, 'R'))

    const rho = (a: string, b: string): Qw => {
      let s = ZERO

      for (const [l, amp] of one) {
        if (dirOf(l) !== a) continue

        const partner = one.get(label(b, pointsOf(l))) ?? ZERO

        s = add(s, mul(amp, conj(partner)))
      }

      return s
    }
    const r = m2(rho('R', 'R'), rho('R', 'L'), rho('L', 'R'), rho('L', 'L'))
    const purity = add(add(norm(r[0][0]), norm(r[1][1])), add(norm(r[0][1]), norm(r[1][0])))
    const wholeNorm = weightWhere(one, () => true)
    const m6 = eq(purity, qw(46n, 0n, 64n)) && eq(wholeNorm, ONE)

    // C1: equal points record nothing
    const plain = [...effects([0, 0, 0]).entries()].filter(([, m]) => !m2isZero(m))
    const c1 = plain.length === 1 && m2eq((plain[0] as [string, M2])[1], IDENTITY)

    const rank = hermitianRank(list.map(([, m]) => m))
    const g = { G0: gates.passing === gates.of, M1: m1, M2: m2count, M3: m3, M4: m4, M5: m5, M6: m6, C1: c1 }
    const status = !g.G0 || !g.C1 ? 'fail' : Object.values(g).every(Boolean) ? 'partial' : 'fail'
    const metrics: Record<string, number> = { startsReadingTheGates: gates.passing, starts: gates.of, outcomes: list.length, hermitianRank: rank, informationallyComplete: rank === 4 ? 1 : 0 }

    for (const [key, v] of Object.entries(g)) metrics[`gate_${key}`] = v ? 1 : 0
    metrics.purity = Number(purity.a) / Number(purity.d)
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a general reading of one vibe's direction from the working rule's own gates (read on ${gates.passing} of ${gates.of} starts), by Naimark's dilation: two ancilla loves meeting it on one arm, with a coin between, then read, give ${list.length} outcomes whose effects sum to the identity exactly, are not projectors, and do not commute (so not a sharp reading shuffled by noise), ${rank === 4 ? 'span every 2x2 Hermitian matrix (informationally complete)' : `span ${rank} of the 4 real dimensions`}, and give Born's probabilities on the part exactly on 5 inputs; one coupling leaves the part mixed (purity ${show(purity)}) while the whole stays pure; with the points equal the device records nothing (one outcome, effect I)`,
      metrics,
      control: { equalPointsOutcomes: plain.length },
      notes: `L2. Gates ${Object.entries(g)
        .map(([key, v]) => `${key} ${v}`)
        .join(', ')}. Effects: ${list.map(([o, m]) => `${o} ${m2show(m)}`).join('; ')}. Born on the part (predicted = device): ${bornNotes.join(' | ')}. Reduced state after one coupling: ${m2show(r)}. The schedule is arranged (which arm meets which ancilla, and the coin between); every gate is the rule's. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
