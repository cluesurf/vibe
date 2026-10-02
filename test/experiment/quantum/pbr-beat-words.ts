// PBR AS STATED, WITH THE MODEL'S OWN READINGS (E-QTM-0180, route "run PBR as stated"). E-QTM-0170 showed no Clifford
// reading is a two-copy PBR reading, so in the model PBR can bite only through the fear beat. This file asks whether a
// word of the model's two-role beats (the links' Clifford letters on each role and the swap phase U, the like meeting,
// E-CMP-0020's letter set) followed by a computational readout implements PBR's reading for two roles prepared in
// |0> or |+> (overlap 1/3, a stabilizer overlap the ring allows).
//
// WHAT IS SEARCHED. Every word to length L over 9 letters: X, Z, S, F on role 1 and role 2, and U = ((1 + w) +
// (1 - w) SWAP) / 2 (UU skipped). A word W is a PBR reading when every one of the 9 readout outcomes j has probability
// exactly 0 on at least one of the four preparations W (psi_x (x) psi_y).
//
// DERIVED BEFORE THE GATE RUN.
// 1. A READING EXISTS. The four preparations span at most 4 of the 9 dimensions; 5 basis vectors orthogonal to all four
//    exclude trivially, and on the 4-dimensional span PBR's two-copy construction works when tan(theta / 2) >= sqrt 2 - 1,
//    theta the angle between the states: cos theta = 1/sqrt 3 gives tan(theta / 2) = 0.518. So the question is only
//    whether the model's words reach one exactly.
// 2. CLIFFORD WORDS CANNOT (E-QTM-0170). A word with U is needed. U and the links generate an infinite group
//    (E-CMP-0020), dense by E-QTM-0118's Lie rank; a dense set can approach a reading without hitting its exact zeros,
//    and exact zeros need an algebraic coincidence in Z[w][1/6].
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/pbr-probe2.ts): to L = 4, 5, 6 (565,282 words at 6) no word is a reading; the
//  best words with U exclude 8 of the 9 outcomes. The gate run extends to L = 7, which the probe did not reach, and reads
//  how close the words come.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every letter keeps the norm of every preparation to 1e-12 after every word (checked at the leaves).
//  C1 CONTROL (the zero test can say yes): PBR's qubit basis, embedded in the qutrit pair (|0>, |1> of each role) and
//     completed by the 5 vectors orthogonal to the embedded span, read by the same test for the preparations |0>, (|0> +
//     |1>) / sqrt 2: 9 of 9 outcomes excluded.
//  H1 THE ROUTE: some word to length 7 is an exact PBR reading.
//  P1 THE KILL, as the route words it: no word to length 7 implements the reading; PBR cannot then be posed exactly in
//     the model's own readings at that length.
//  R  READ: the most outcomes a word excludes, and eps(L), the least over words with U of the largest leftover
//     probability (max over outcomes of the least probability over the preparations), against L.
// VERDICT, fixed before the run: PASS when I1, C1 and H1 hold; FAIL when I1, C1 hold and P1 holds (the route's kill
//  fires: record it); PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. Words to length 7 only, and computational readouts; a longer word could still hit a
//  reading, and approximate PBR (eps small) is not PBR.
//
// FIRST RUN 2026-10-02 (tmp/pbr2-qtm-run1.log, 64 s): FAIL, the route's kill fires, every gate as registered. I1: norms
//  kept to 2.9e-15. C1: PBR's embedded qubit basis excludes 9 of 9. P1: 0 of 5,030,434 words to length 7 is a reading;
//  the best words with U exclude 8 of 9. eps(L), the least largest leftover probability over words with U, reads 0.111,
//  0.111, 0.083, 0.063, 0.028, 0.028, 0.021 at lengths 1 to 7: the words approach a reading and do not reach one. (A
//  type annotation in the control's construction was fixed after the run for the typecheck; no value changed.)
//
// Depth L1: exhaustive enumeration, floats on exact gates, the zero test at 1e-12.
// DETERMINISM: lexicographic depth-first enumeration; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type C = [number, number]

const mul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const ONE: C = [1, 0]
const NIL: C = [0, 0]
const W3: C = [-0.5, Math.sqrt(3) / 2]
const R3 = 1 / Math.sqrt(3)
const power = (k: number): C =>
  [ONE, W3, mul(W3, W3)][((k % 3) + 3) % 3]!

const X: C[][] = [
  [NIL, NIL, ONE],
  [ONE, NIL, NIL],
  [NIL, ONE, NIL],
]
const Z: C[][] = [
  [ONE, NIL, NIL],
  [NIL, W3, NIL],
  [NIL, NIL, mul(W3, W3)],
]
const S: C[][] = [
  [ONE, NIL, NIL],
  [NIL, ONE, NIL],
  [NIL, NIL, W3],
]
const F: C[][] = [0, 1, 2].map(j =>
  [0, 1, 2].map(k => {
    const p = power(j * k)

    return [p[0] * R3, p[1] * R3] as C
  }),
)
const LOCAL = [X, Z, S, F]
const NAMES = ['X1', 'Z1', 'S1', 'F1', 'X2', 'Z2', 'S2', 'F2', 'U']

function applyLocal(g: C[][], role: number, v: C[]): C[] {
  const out: C[] = Array.from({ length: 9 }, () => [0, 0] as C)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const x = v[a * 3 + b]!

      if (!x[0] && !x[1]) {
        continue
      }

      for (let c = 0; c < 3; c++) {
        const m = role === 0 ? g[c]![a]! : g[c]![b]!

        if (!m[0] && !m[1]) {
          continue
        }

        const t = mul(m, x)
        const at = role === 0 ? c * 3 + b : a * 3 + c

        out[at] = [out[at]![0] + t[0], out[at]![1] + t[1]]
      }
    }
  }

  return out
}

const KEEP: C = [(1 + W3[0]) / 2, W3[1] / 2]
const SWAP: C = [(1 - W3[0]) / 2, -W3[1] / 2]

const applyU = (v: C[]): C[] =>
  v.map((_, i) => {
    const swapped = (i % 3) * 3 + Math.floor(i / 3)
    const a = mul(KEEP, v[i]!)
    const b = mul(SWAP, v[swapped]!)

    return [a[0] + b[0], a[1] + b[1]] as C
  })

const prob = (x: C): number => x[0] * x[0] + x[1] * x[1]
const product = (a: C[], b: C[]): C[] =>
  a.flatMap(x => b.map(y => mul(x, y)))

// excluded outcomes and the largest leftover probability
function readOut(states: C[][]): {
  excluded: number
  leftover: number
} {
  let excluded = 0
  let leftover = 0

  for (let j = 0; j < states[0]!.length; j++) {
    const least = Math.min(...states.map(v => prob(v[j]!)))

    if (least < 1e-12) {
      excluded++
    }

    leftover = Math.max(leftover, least)
  }

  return { excluded, leftover }
}

export function pbrBeatWordsRun(L = 7): Verdict {
  const started = Date.now()
  const zero: C[] = [ONE, NIL, NIL]
  const plus: C[] = [
    [R3, 0],
    [R3, 0],
    [R3, 0],
  ]
  const preps = [
    product(zero, zero),
    product(zero, plus),
    product(plus, zero),
    product(plus, plus),
  ]
  const epsByLength = new Array<number>(L + 1).fill(
    Number.POSITIVE_INFINITY,
  )

  let words = 0
  let readings = 0
  let bestExcluded = 0
  let worstNorm = 0
  let first = ''

  const walk = (states: C[][], word: number[], hasU: boolean): void => {
    words++

    const r = readOut(states)

    if (hasU) {
      bestExcluded = Math.max(bestExcluded, r.excluded)
      epsByLength[word.length] = Math.min(
        epsByLength[word.length]!,
        r.leftover,
      )
    }

    if (r.excluded === 9) {
      readings++
      first ||= word.map(i => NAMES[i]).join(' ')
    }

    if (word.length === L) {
      for (const v of states) {
        worstNorm = Math.max(
          worstNorm,
          Math.abs(v.reduce((s, x) => s + prob(x), 0) - 1),
        )
      }

      return
    }

    for (let l = 0; l < 9; l++) {
      if (l === 8 && word[word.length - 1] === 8) {
        continue
      }

      walk(
        states.map(v =>
          l === 8
            ? applyU(v)
            : applyLocal(LOCAL[l % 4]!, l < 4 ? 0 : 1, v),
        ),
        [...word, l],
        hasU || l === 8,
      )
    }
  }

  walk(preps, [], false)

  // C1: PBR's qubit basis embedded in the qutrit pair, completed by the orthogonal complement of its span
  const s = Math.SQRT1_2

  const e = (a: number, b: number): C[] => {
    const v: C[] = Array.from({ length: 9 }, () => [0, 0] as C)

    v[a * 3 + b] = ONE

    return v
  }

  const lin = (terms: [number, C[]][]): C[] =>
    Array.from({ length: 9 }, (_, i) =>
      terms.reduce(
        (acc, [c, v]) =>
          [acc[0] + c * v[i]![0], acc[1] + c * v[i]![1]] as C,
        [0, 0] as C,
      ),
    )
  const xi = [
    lin([
      [s, e(0, 1)],
      [s, e(1, 0)],
    ]),
    lin([
      [0.5, e(0, 0)],
      [-0.5, e(0, 1)],
      [0.5, e(1, 0)],
      [0.5, e(1, 1)],
    ]),
    lin([
      [0.5, e(0, 1)],
      [0.5, e(1, 1)],
      [0.5, e(0, 0)],
      [-0.5, e(1, 0)],
    ]),
    lin(
      [
        [0.5, e(0, 0)],
        [-0.5, e(0, 1)],
        [0.5, e(1, 0)],
        [-0.5, e(1, 1)],
        [0.5, e(0, 0)],
        [0.5, e(0, 1)],
        [-0.5, e(1, 0)],
        [-0.5, e(1, 1)],
      ].map(t => [(t[0] as number) * s, t[1] as C[]] as [number, C[]]),
    ),
  ]
  const complement = [e(0, 2), e(1, 2), e(2, 0), e(2, 1), e(2, 2)]
  const basis = [...xi, ...complement]
  const plus2: C[] = [
    [s, 0],
    [s, 0],
    [0, 0],
  ]
  const controlPreps = [
    product(zero, zero),
    product(zero, plus2),
    product(plus2, zero),
    product(plus2, plus2),
  ]
  const amplitudes = controlPreps.map(p =>
    basis.map(b =>
      b.reduce(
        (acc, x, i) =>
          [
            acc[0] + x[0] * p[i]![0] + x[1] * p[i]![1],
            acc[1] + x[0] * p[i]![1] - x[1] * p[i]![0],
          ] as C,
        [0, 0] as C,
      ),
    ),
  )
  const control = readOut(amplitudes)
  const c1 = control.excluded === 9
  const i1 = worstNorm < 1e-12
  const h1 = readings > 0
  const p1 = readings === 0
  const status =
    i1 && c1 && h1 ? 'pass' : i1 && c1 && p1 ? 'fail' : 'partial'
  const eps = epsByLength.map(v => (Number.isFinite(v) ? v : NaN))

  return verdict({
    status,
    claim: `${p1 ? "no word of the model's two-role beats to length " + L + ' is an exact PBR reading' : "a word of the model's beats is a PBR reading"}: over ${words} words of the links' Clifford letters and the swap phase U, applied to |0> and |+> on two roles (overlap 1/3) with a computational readout, ${readings} exclude a preparation with every outcome; the best words with U exclude ${bestExcluded} of 9, and the least largest leftover probability falls ${eps
      .slice(1)
      .map(v => (Number.isFinite(v) ? v.toFixed(4) : '-'))
      .join(
        ', ',
      )} at lengths 1 to ${L}; the same zero test reads PBR's embedded qubit basis as a reading (${control.excluded} of 9)`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      words,
      readings,
      bestExcluded,
      worstNorm,
      ...Object.fromEntries(eps.map((v, l) => [`eps_L${l}`, v])),
      seconds: (Date.now() - started) / 1000,
    },
    control: { pbrQubitExcluded: control.excluded },
    notes: `L1. Gates I1 ${i1} (norm ${worstNorm.toExponential(1)}), C1 ${c1}, H1 ${h1}, P1 ${p1}. First reading: ${first || 'none'}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/pbr-beat-words',
  code: 'E-QTM-0180',
  title:
    "PBR as stated cannot be posed exactly in the model's own readings to length 7, fail as the route words it: over 5,030,434 words of the links' Clifford letters and the swap phase U on two roles prepared in |0> or |+> (overlap 1/3), with a computational readout, none excludes a preparation with every outcome, though such a reading exists for this overlap; the best words exclude 8 of 9, and the least largest leftover probability falls 0.111, 0.083, 0.063, 0.028, 0.021 as the words lengthen, so the dense beat group approaches PBR's reading without reaching it; the same zero test reads PBR's embedded qubit basis as a reading",
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    return pbrBeatWordsRun(7)
  },
})
