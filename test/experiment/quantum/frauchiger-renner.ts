// The Frauchiger-Renner chain on four loves, with the rule's own gates (route "the Frauchiger-Renner chain").
//
// THE QUESTION (routes/quantum-relativity-light-computation, Wigner's friend, row 2). Four agents with records, where
// each superobserver's reversal is a concrete beat word because the rule runs back exactly ((w U)^3 = I, E-QTM-0162).
// The row's test: the protocol on four loves, the contradiction's probability (1/12 in the textbook), exact; it is
// killed if the probability is not 1/12, which the row calls an instrument check before anything else.
//
// THE TEXTBOOK CHAIN (Frauchiger and Renner 2018). A coin r is h with weight 1/3, t with 2/3. Fbar reads r into her
// memory and prepares S as down (h) or (down + up)/sqrt 2 (t); F reads S into his memory. Wbar reads Fbar's lab in a
// basis containing okbar = (h - t)/sqrt 2 (after undoing her record), W reads F's lab in a basis containing ok. The
// agents' certainties: (i) Fbar reading t => W reads fail; (ii) F reading up => Fbar read t; (iii) Wbar reading okbar
// => F read up. Chained, okbar => fail, yet P(okbar, ok) = 1/12. Each certainty is a zero probability:
//  (i) P(Fbar = t, W = ok) = 0, (ii) P(F = up, Fbar != t) = 0, (iii) P(Wbar = okbar, F != up) = 0, and (iv) P(Wbar =
//  okbar, W = ok) > 0 in the protocol's order. This file checks exactly these four numbers.
//
// WHAT IS RUN. (1) The textbook circuit, exact in Q(w, sqrt 2) (r's amplitudes (1 + 2w)/3 and sqrt 2 (1 + 2w)/3, of
// squared modulus 1/3 and 2/3; perfect records; Hadamards with 1/sqrt 2). (2) The same circuit with F's perfect record
// replaced by the rule's one-way record (the like meeting w U: keep w k, exchange -w x, E-QTM-0162's friend). (3) Words
// of the rule's like meetings on three loves, to length 8: does any act as a perfect record (a permutation of the
// points up to a phase)? (4) The chain on four loves with the rule's gates (code/measure/rule-gates: the coin
// C = [[k, x], [x, k]], k = (1 + w)/2, x = (1 - w)/2, and the line of two w U): love A's direction is r, love B's point
// is Fbar's memory (B on A's arm Y), love C's direction is S (C shares a line with A's arm X, so C's coin acts only
// when A is elsewhere: Fbar's preparation), love D's point is F's memory (D on C's arm Z). Wbar undoes Fbar's record by
// two more meetings, then applies a word in the coin and the arm phases w, w^2 to A and reads A's direction; W the same
// on C and D. Searched: X, Y, Z in {R, L}, C's point equal to A's or not, r prepared by every word to length 3, Wbar's
// and W's words to length 4, every choice of the four outcome values.
//
// DERIVED BEFORE THE GATE RUN.
//  (a) The rule's gates have amplitudes in Z[w][1/2] (k, x, w), so from a label start every amplitude is in Z[w][1/2]
//      and every Born weight is N / 4^n with N a norm: a dyadic rational. 1/12 is not dyadic, so no circuit of the
//      rule's gates from label starts gives the textbook probability. The textbook's squared moduli 2/3 and 1/2 are not
//      squared moduli in Z[w][1/2] (2 is inert in Z[w], so a norm has an even power of 2), so its state is not
//      reachable either.
//  (b) No perfect record from like meetings: w U_ij acts on three distinct points as left multiplication in C[S3];
//      a word of length n is w^n (k - x)^n = w^(2n) on the trivial irrep and w^n (k + x)^n = w^n on the sign irrep. A
//      phase times a transposition needs the two to differ by -1, impossible for cube roots of unity; a 3-cycle is not
//      excluded by this and is searched. E-QTM-0154 (B) already shows no single meeting premeasures.
//  (c) A one-way record breaks (iii) for any Wbar. If F's certain reading is the exchange (D took C's point, so S was
//      on arm Z), then F's other reading also occurs on arm Z (the keep, amplitude w k, nonzero), with the same state of
//      Wbar's lab, since F's record does not touch it. (iii) forces okbar orthogonal to that state, so P(okbar, F = up)
//      = 0 as well, hence P(okbar) = 0 and (iv) = 0. If F's certain reading is the keep, (ii) needs every keep branch
//      to carry one Fbar reading, which the rule's arrangement does not make. So the chain is predicted not to close.
//
// PROBES BEFORE THE GATES (disclosed): tmp/fr-probe1 (words of w U_ij on three distinct points to length 9, 10,032
// distinct words at length 9): no word is a permutation other than the identity up to a phase. Nothing else was run.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  I1 instrument: the textbook circuit gives (i), (ii), (iii) exactly 0 and P(okbar, ok) exactly 1/12.
//  C1 control, the checker can read a broken chain: with F's record replaced by the rule's one-way record, the same
//     checker finds (iii) nonzero for the textbook's Wbar.
//  D1 (a) read: every amplitude of every rule circuit computed in (4) has a power-of-two denominator.
//  D2 (b) read: no word of like meetings on three loves to length 8 is a permutation of the points other than the
//     identity, up to a phase.
//  H1 the route: some arrangement in (4) closes the chain ((i), (ii), (iii) zero, premises possible) with P(okbar, ok)
//     = 1/12.
//  P1 the kill, as the row words it: no arrangement gives 1/12. Predicted to fire, by (a); and by (c), no arrangement
//     closes the chain at any probability.
// VERDICT: fail if I1, C1, D1 or D2 fails (the instrument or a derivation), or if P1 fires (the kill); pass if H1
// holds. Readings: how many arrangements close the chain at any probability (predicted 0), how many satisfy each of
// (i), (ii), (iii) alone, the control's (iii) and its P(okbar, ok).
//
// WHAT THIS CAN AND CANNOT SHOW. It poses FR with the gates E-QTM-0158 to E-QTM-0162 read off the working rule (coin
// and like meeting) from label starts, words to the stated lengths. It does not use the love-fear meeting, a SUM from
// the link flow, role stabilizer states as starts (amplitudes 1 / sqrt 3), or longer words; the friends are single
// vibes' points, not selves, and the schedule is arranged, as in E-QTM-0162.
//
// FIRST RUN 2026-10-02 (tmp/fr-run1.log, 45 s): FAIL, the row's kill fires, every gate as registered, no gate moved.
//  - I1: the textbook chain reads (i) 0, (ii) 0, (iii) 0 and P(okbar, ok) = 1/12 exactly.
//  - C1: with F's record the rule's one-way like meeting, (iii) reads 1/24 (P(okbar, ok) still 1/12): the chain is
//    broken at Wbar's certainty, as (c) says, and the checker sees it.
//  - D1: every amplitude of every rule circuit has a power-of-two denominator. D2: 5,791 distinct words of like
//    meetings on three loves to length 8, none a permutation of the points other than the identity up to a phase.
//  - H1 fails, P1 fires: 2,704 arrangements (arms, C's point, r's preparation word, outcome values) with every Wbar and
//    W word to length 4; (ii) holds with possible premises on 576, reader words pass (i) 84,768 times and (iii) with
//    okbar possible 67,200 times, but no arrangement closes the chain at any probability (0), so none at 1/12.
//  So the textbook contradiction is not posed by the rule's coin and like meeting: its probability is not dyadic, and
//  without a perfect record the friends' certainties do not chain.
//
// Depth L1 (exact algebra over Q(w) and Q(w, sqrt 2), exhaustive enumeration). No random numbers, no start family:
// the gates are E-QTM-0162's, read there on 17 of 17 starts.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  add as qadd,
  conj as qconj,
  isZero as qzero,
  K,
  mul as qmul,
  neg as qneg,
  ONE as QONE,
  qw,
  show as qshow,
  W,
  X,
  ZERO as QZERO,
  type Qw,
} from '@/code/measure/rule-gates'

// ---- Q(w, sqrt 2): a + b sqrt 2, a and b in Q(w) ----

type F = { readonly a: Qw; readonly b: Qw }

const f = (a: Qw, b: Qw = QZERO): F => ({ a, b })
const F0 = f(QZERO)
const F1 = f(QONE)
const fadd = (p: F, q: F): F => f(qadd(p.a, q.a), qadd(p.b, q.b))
const fmul = (p: F, q: F): F =>
  f(
    qadd(qmul(p.a, q.a), qmul(qw(2n), qmul(p.b, q.b))),
    qadd(qmul(p.a, q.b), qmul(p.b, q.a)),
  )
const fconj = (p: F): F => f(qconj(p.a), qconj(p.b))
const fzero = (p: F): boolean => qzero(p.a) && qzero(p.b)
const fnorm = (p: F): F => fmul(p, fconj(p))
const fshow = (p: F): string =>
  qzero(p.b) ? qshow(p.a) : `${qshow(p.a)} + (${qshow(p.b)}) sqrt2`
const fdyadic = (p: F): boolean =>
  [p.a.d, p.b.d].every(d => (d & (d - 1n)) === 0n)

// ---- circuits: a label is a register tuple, a state a sparse sum ----

type State = Map<string, F>
type Gate = (r: number[]) => [number[], F][]

const keyOf = (r: readonly number[]): string => r.join(',')
const regsOf = (k: string): number[] => k.split(',').map(Number)

function apply(s: State, g: Gate): State {
  const out: State = new Map()

  for (const [k, a] of s) {
    for (const [r, c] of g(regsOf(k))) {
      const key = keyOf(r)
      const v = fadd(out.get(key) ?? F0, fmul(a, c))

      if (fzero(v)) {
        out.delete(key)
      } else {
        out.set(key, v)
      }
    }
  }

  return out
}

const run = (s: State, gates: readonly Gate[]): State =>
  gates.reduce(apply, s)

function weight(s: State, keep: (r: number[]) => boolean): F {
  let total = F0

  for (const [k, a] of s) {
    if (keep(regsOf(k))) {
      total = fadd(total, fnorm(a))
    }
  }

  return total
}

const set = (r: number[], i: number, v: number): number[] => {
  const o = [...r]

  o[i] = v

  return o
}

// ---- the textbook circuit: registers r, b (Fbar), z, d (F); bits ----

const R2 = f(QZERO, QONE)
const HALF_R2 = f(QZERO, qw(1n, 0n, 2n))
const I3 = f(qw(1n, 2n, 3n)) // (1 + 2w) / 3, squared modulus 1/3

const cnot =
  (c: number, t: number): Gate =>
  r =>
    r[c] === 1 ? [[set(r, t, 1 - r[t]!), F1]] : [[r, F1]]
const hadamard =
  (i: number): Gate =>
  r => [
    [set(r, i, 0), HALF_R2],
    [set(r, i, 1), r[i] === 1 ? fmul(f(qw(-1n)), HALF_R2) : HALF_R2],
  ]
// Fbar's preparation: z = down (0) if r = h (0), (down + up) / sqrt 2 if r = t (1); z starts at 0
const prepareS: Gate = r =>
  r[0] === 0
    ? [[r, F1]]
    : [
        [set(r, 2, 0), HALF_R2],
        [set(r, 2, 1), HALF_R2],
      ]
// the rule's one-way record of z = up into d: keep w k, exchange -w x (d goes 0 -> 1 only on the exchange); it is
// w U on the two values of d, so applying it twice more undoes it ((w U)^3 = I)
const oneWay: Gate = r =>
  r[2] === 1
    ? [
        [r, f(qmul(W, K))],
        [set(r, 3, 1 - r[3]!), f(qneg(qmul(W, X)))],
      ]
    : [[r, F1]]

type Chain = {
  i: F
  ii: F
  iii: F
  iv: F
  premises: boolean
}

// the four numbers of the chain for given states and outcome predicates
function chain(input: {
  afterFriends: State
  wbar: readonly Gate[]
  w: readonly Gate[]
  fbarReads: (r: number[]) => boolean
  fReads: (r: number[]) => boolean
  okbar: (r: number[]) => boolean
  ok: (r: number[]) => boolean
}): Chain {
  const s0 = input.afterFriends
  const s1 = run(s0, input.w)
  const s2 = run(s0, input.wbar)
  const s3 = run(s2, input.w)

  return {
    i: weight(s1, r => input.fbarReads(r) && input.ok(r)),
    ii: weight(s0, r => input.fReads(r) && !input.fbarReads(r)),
    iii: weight(s2, r => input.okbar(r) && !input.fReads(r)),
    iv: weight(s3, r => input.okbar(r) && input.ok(r)),
    premises:
      !fzero(weight(s0, input.fbarReads)) &&
      !fzero(weight(s0, input.fReads)),
  }
}

function textbook(oneWayRecord: boolean): Chain {
  const start: State = new Map([
    [keyOf([0, 0, 0, 0]), fmul(I3, F1)],
    [keyOf([1, 0, 0, 0]), fmul(I3, R2)],
  ])
  const afterFriends = run(start, [
    cnot(0, 1),
    prepareS,
    oneWayRecord ? oneWay : cnot(2, 3),
  ])

  return chain({
    afterFriends,
    wbar: [cnot(0, 1), hadamard(0)],
    w: oneWayRecord
      ? [oneWay, oneWay, hadamard(2)]
      : [cnot(2, 3), hadamard(2)],
    fbarReads: r => r[1] === 1,
    fReads: r => r[3] === 1,
    okbar: r => r[0] === 1,
    ok: r => r[2] === 1,
  })
}

// ---- the rule's gates on four loves: registers dA, dC (0 = R, 1 = L), pA, pB, pC, pD ----

const DA = 0
const DC = 1
const PA = 2
const PB = 3
const PC = 4
const PD = 5

const coin =
  (dir: number): Gate =>
  r => [
    [r, f(K)],
    [set(r, dir, 1 - r[dir]!), f(X)],
  ]
const armPhase =
  (dir: number, n: number): Gate =>
  r =>
    r[dir] === 0 ? [[r, f(n === 1 ? W : qmul(W, W))]] : [[r, F1]]

// the line of two: points i and j meet (w U) when the direction register `dir` is on `arm`
const meet =
  (i: number, j: number, dir: number, arm: number): Gate =>
  r => {
    if (r[dir] !== arm) {
      return [[r, F1]]
    }

    if (r[i] === r[j]) {
      return [[r, f(qmul(W, W))]]
    }

    const q = set(set(r, i, r[j]!), j, r[i]!)

    return [
      [r, f(qmul(W, K))],
      [q, f(qneg(qmul(W, X)))],
    ]
  }

// Fbar's preparation: C shares a line with A's arm X; there A and C meet (a line of two), elsewhere C's coin acts
const prepareC =
  (x: number): Gate =>
  r =>
    r[DA] === x ? meet(PA, PC, DA, x)(r) : coin(DC)(r)

const LETTERS = (dir: number): Gate[] => [
  coin(dir),
  armPhase(dir, 1),
  armPhase(dir, 2),
]

function words(length: number): number[][] {
  const out: number[][] = [[]]

  let level: number[][] = [[]]

  for (let n = 1; n <= length; n++) {
    level = level.flatMap(w => [0, 1, 2].map(c => [...w, c]))
    out.push(...level)
  }

  return out
}

// D2: words of like meetings on three distinct points, a nontrivial permutation up to a phase?
function permutationWords(maxLength: number): {
  words: number
  permutations: number
} {
  const pairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
  ]
  const starts = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const always: Gate[] = pairs.map(
    ([i, j]): Gate =>
      r => {
        if (r[i] === r[j]) {
          return [[r, f(qmul(W, W))]]
        }

        return [
          [r, f(qmul(W, K))],
          [set(set(r, i, r[j]!), j, r[i]!), f(qneg(qmul(W, X)))],
        ]
      },
  )
  const seen = new Set<string>()

  let frontier: State[][] = [
    starts.map(p => new Map([[keyOf(p), F1]]) as State),
  ]
  let count = 0
  let permutations = 0

  for (let n = 1; n <= maxLength; n++) {
    const next: State[][] = []

    for (const states of frontier) {
      for (const g of always) {
        const image = states.map(s => apply(s, g))
        const key = image
          .map(s =>
            [...s]
              .map(([k, a]) => `${k}:${fshow(a)}`)
              .sort()
              .join(';'),
          )
          .join('#')

        if (seen.has(key)) {
          continue
        }

        seen.add(key)
        count++
        next.push(image)

        if (image.every(s => s.size === 1)) {
          const moved = image.some(
            (s, m) => [...s.keys()][0] !== keyOf(starts[m]!),
          )

          permutations += moved ? 1 : 0
        }
      }
    }

    frontier = next
  }

  return { words: count, permutations }
}

export default experiment({
  id: 'quantum/frauchiger-renner',
  code: 'E-QTM-0177',
  title:
    "the Frauchiger-Renner chain does not close on the rule's own gates, fail as the row's kill words it: the textbook chain reads 1/12 exactly in Q(w, sqrt 2), but every Born weight of the coin and the like meeting is dyadic, no like-meeting word on three loves to length 8 is a perfect record, and of 2,704 arrangements on four loves (reader words to length 4) none closes the chain at any probability; a one-way record breaks Wbar's certainty ((iii) 1/24 in the control)",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()

    // I1 and C1
    const book = textbook(false)
    const control = textbook(true)
    const i1 =
      fzero(book.i) &&
      fzero(book.ii) &&
      fzero(book.iii) &&
      book.premises &&
      fzero(fadd(book.iv, f(qw(-1n, 0n, 12n))))
    const c1 = !fzero(control.iii)

    // D2
    const perm = permutationWords(8)
    const d2 = perm.permutations === 0

    // the rule's arrangements
    let d1 = true
    let arrangements = 0
    let passI = 0
    let passII = 0
    let passIII = 0
    let closes = 0
    let twelfth = 0

    const probabilities = new Set<string>()
    const preps = words(3)
    const readers = words(4)

    const dyadicCheck = (s: State): void => {
      for (const a of s.values()) {
        if (!fdyadic(a)) {
          d1 = false
        }
      }
    }

    for (const x of [0, 1]) {
      for (const y of [0, 1]) {
        for (const z of [0, 1]) {
          for (const pc of [0, 2]) {
            for (const prep of preps) {
              const start: State = new Map([
                [keyOf([0, 0, 0, 1, pc, 3]), F1],
              ])
              const s0 = run(start, [
                ...prep.map(c => LETTERS(DA)[c]!),
                meet(PA, PB, DA, y),
                prepareC(x),
                meet(PC, PD, DC, z),
              ])

              dyadicCheck(s0)

              const fbarValues = [
                ...new Set([...s0.keys()].map(k => regsOf(k)[PB]!)),
              ]
              const fValues = [
                ...new Set([...s0.keys()].map(k => regsOf(k)[PD]!)),
              ]
              const wbarStates = readers.map(word => {
                const s = run(s0, [
                  meet(PA, PB, DA, y),
                  meet(PA, PB, DA, y),
                  ...word.map(c => LETTERS(DA)[c]!),
                ])

                dyadicCheck(s)

                return s
              })
              const wGates = readers.map(word => [
                meet(PC, PD, DC, z),
                meet(PC, PD, DC, z),
                ...word.map(c => LETTERS(DC)[c]!),
              ])
              const wStates = wGates.map(g => {
                const s = run(s0, g)

                dyadicCheck(s)

                return s
              })

              for (const fb of fbarValues) {
                for (const fv of fValues) {
                  arrangements++

                  const fbarReads = (r: number[]): boolean =>
                    r[PB] === fb
                  const fReads = (r: number[]): boolean => r[PD] === fv
                  const ii = weight(s0, r => fReads(r) && !fbarReads(r))
                  const premises =
                    !fzero(weight(s0, fbarReads)) &&
                    !fzero(weight(s0, fReads))

                  if (fzero(ii) && premises) {
                    passII++
                  }

                  for (const okbarValue of [0, 1]) {
                    for (const okValue of [0, 1]) {
                      const okbar = (r: number[]): boolean =>
                        r[DA] === okbarValue
                      const ok = (r: number[]): boolean =>
                        r[DC] === okValue
                      const wOk = wStates.map(s =>
                        fzero(weight(s, r => fbarReads(r) && ok(r))),
                      )
                      const wbarOk = wbarStates.map(
                        s =>
                          fzero(
                            weight(s, r => okbar(r) && !fReads(r)),
                          ) && !fzero(weight(s, okbar)),
                      )

                      passI += wOk.filter(Boolean).length
                      passIII += wbarOk.filter(Boolean).length

                      if (!fzero(ii) || !premises) {
                        continue
                      }

                      wbarStates.forEach((s2, m) => {
                        if (!wbarOk[m]) {
                          return
                        }

                        wGates.forEach((g, n) => {
                          if (!wOk[n]) {
                            return
                          }

                          const iv = weight(
                            run(s2, g),
                            r => okbar(r) && ok(r),
                          )

                          if (fzero(iv)) {
                            return
                          }

                          closes++
                          probabilities.add(fshow(iv))

                          if (fzero(fadd(iv, f(qw(-1n, 0n, 12n))))) {
                            twelfth++
                          }
                        })
                      })
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const h1 = twelfth > 0
    const p1 = !h1
    const status =
      !i1 || !c1 || !d1 || !d2 ? 'fail' : h1 ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `the textbook Frauchiger-Renner chain, exact in Q(w, sqrt 2), gives certainties (i) ${fshow(book.i)}, (ii) ${fshow(book.ii)}, (iii) ${fshow(book.iii)} and P(okbar, ok) = ${fshow(book.iv)}; with F's record the rule's one-way like meeting, (iii) reads ${fshow(control.iii)}; no word of like meetings on three loves to length 8 (${perm.words} distinct) is a nontrivial permutation (${perm.permutations} found), and every amplitude of the rule's circuits is dyadic (${d1}); over ${arrangements} arrangements of the chain on four loves with the rule's gates, ${closes} close it at any probability and ${twelfth} at 1/12`,
      metrics: {
        textbookIv: Number(book.iv.a.a) / Number(book.iv.a.d),
        controlIii: Number(control.iii.a.a) / Number(control.iii.a.d),
        controlIv: Number(control.iv.a.a) / Number(control.iv.a.d),
        meetingWords: perm.words,
        meetingPermutations: perm.permutations,
        arrangements,
        passI,
        passII,
        passIII,
        closes,
        twelfth,
        gate_I1: i1 ? 1 : 0,
        gate_C1: c1 ? 1 : 0,
        gate_D1: d1 ? 1 : 0,
        gate_D2: d2 ? 1 : 0,
        gate_H1: h1 ? 1 : 0,
        gate_P1_fires: p1 ? 1 : 0,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        oneWayIii: Number(control.iii.a.a) / Number(control.iii.a.d),
      },
      notes: `L1, exact. Textbook (i) ${fshow(book.i)}, (ii) ${fshow(book.ii)}, (iii) ${fshow(book.iii)}, (iv) ${fshow(book.iv)}. One-way control (i) ${fshow(control.i)}, (ii) ${fshow(control.ii)}, (iii) ${fshow(control.iii)}, (iv) ${fshow(control.iv)}. Rule arrangements (X, Y, Z arms, C's point, prep words to 3, reader words to 4, outcome values): (ii) with possible premises ${passII}; reader words passing (i) ${passI}, passing (iii) with okbar possible ${passIII} (summed over arrangements and values); chains closed ${closes}; probabilities seen ${[...probabilities].join(', ') || 'none'}.`,
    })
  },
})
