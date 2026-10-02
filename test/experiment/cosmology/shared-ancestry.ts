// RIPPLES FROM SHARED ANCESTRY (E-CSM-0061, OPEN-CSM-04, route I8b). Every husk dock the seed reaches shares a causal
// past with every other (E-CSM-0058). The route reads the fraction of shared ancestors against separation as the
// initial correlation function of the ripples (OPEN-MTH-05's exponent), and names its kill in advance: "the correlation
// is flat or exponential (no scale)".
//
// WHAT IS COUNTED. On the husk the seed's reach at beat tau is exactly the cubic l1 ball of radius tau (E-CSM-0058,
// 0059). A dock x reached at beat t has as ancestors every event (tau, y) with |y|_1 <= tau (y was reached at tau) and
// |x - y|_1 <= t - tau (y lies in x's past cone). For two docks x, x' at beat t the shared fraction is
// f = |A cap A'| / sqrt(|A| |A'|). The pairs are placed symmetrically about the seed on one husk axis, x = -d/2, x' =
// +d/2, d even, so |A| = |A'|.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE CONE'S SIZE. For x at the seed, |A| = sum over tau of b(min(tau, t - tau)), b(r) = (2r + 1)(2r^2 + 2r + 3) / 3
//    the l1 ball (41 at t = 4).
// 2. A SCALE IS BUILT IN. The only lengths are the lattice step and the reach t, so for d >> 1 the fraction is a
//    function of d / t: self-similar in the horizon, not a power of d alone. At d = 2t the cones meet only near the
//    segment through the seed, so f(2t) falls about as 1 / t: every pair keeps the seed in common, and little else.
//
// PROBE BEFORE THE GATES, DISCLOSED (scratchpad anc.py, Python, seconds): t = 4, 8, 12 with cone sizes 41, 321, 1289;
//  f at d = 0, 2, 4, ... 2t: t = 8 1, 0.686, 0.506, 0.367, 0.291, 0.211, 0.177, 0.125, 0.111; t = 12 1, 0.758, 0.596,
//  0.469, 0.384, 0.304, 0.254, 0.199, 0.170, 0.129, 0.114, 0.083, 0.077. So P1 and P2 below were seen at t <= 12; the
//  gates read t = 16 and 24, which the probe did not.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: |A| for x at the seed equals point 1's sum at every t read; the symmetric pair's cones have equal size.
//  H1 THE ROUTE (a scale-free spectrum): at t = 24 the local log-log slope of f against d is one constant over d = 6 to
//     24 (every local slope within 10 percent of their mean).
//  P1 THE HORIZON SCALE (point 2): f_16(d) and f_24(1.5 d) agree within 0.04 at d = 4, 8, 12, 16 (a function of d / t).
//  P2 THE EDGE (point 2): t f_t(2t) lies in [0.6, 1.2] at t = 16 and 24.
//  K THE ROUTE'S KILL, as written: the correlation is flat (f(t) > 0.9) or exponential (ln f linear in d over d = 2 to
//     2t at t = 24, every local decay rate within 10 percent of their mean).
// VERDICT, fixed before the run: PASS when I1 holds, K does not fire and H1 holds; FAIL when K fires; otherwise PARTIAL
//  (a scale is present, the route's power law is not), with P1 and P2 saying which scale.
// WHAT THIS CAN AND CANNOT SHOW. It counts causal pasts on the seed's husk reach; nothing of the rule runs, and
//  "shared ancestry is the ripple correlation" stays the route's reading.
//
// FIRST RUN 2026-10-02 (tmp/sa-csm-run1.log, 0.2 s): PARTIAL, as the verdict rule reads it, every gate as registered.
//  I1 holds (cone sizes 41, 321, 1289, ... equal to point 1's sum). K does not fire: f is not flat (0.448 at d = t = 24)
//  and not exponential (decay rates 0.020 to 0.141 a dock). H1 fails: the local log-log slopes run -0.44 to -1.34 over d =
//  6 to 24. P1 holds: f_16(d) and f_24(1.5 d) agree within 0.011 to 0.017. P2 holds: t f(2t) = 0.941 and 0.960. At t = 24
//  f reads 1, 0.858, 0.745, 0.650, 0.573, 0.504, 0.448, ... 0.040 at d = 2, 4, ... 48. So the correlation has a scale, and
//  the scale is the horizon: a function of d / t, not a power of d.
//
// Depth L1: exact counts.
// DETERMINISM: fixed geometry; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const ballSize = (r: number): number =>
  ((2 * r + 1) * (2 * r * r + 2 * r + 3)) / 3

// the events (tau, y) in x's past cone at beat t that the seed reached, encoded as integers
function cone(x: readonly number[], t: number): Set<number> {
  const out = new Set<number>()
  const span = 2 * t + 1
  const key = (tau: number, a: number, b: number, c: number): number =>
    ((tau * span + (a + t)) * span + (b + t)) * span + (c + t)

  for (let tau = 0; tau <= t; tau++) {
    const r = t - tau

    for (let a = -r; a <= r; a++) {
      for (let b = -(r - Math.abs(a)); b <= r - Math.abs(a); b++) {
        const left = r - Math.abs(a) - Math.abs(b)

        for (let c = -left; c <= left; c++) {
          const y0 = x[0]! + a
          const y1 = x[1]! + b
          const y2 = x[2]! + c

          if (Math.abs(y0) + Math.abs(y1) + Math.abs(y2) <= tau) {
            out.add(key(tau, y0, y1, y2))
          }
        }
      }
    }
  }

  return out
}

function shared(
  t: number,
  d: number,
): { f: number; size: number; sizes: boolean } {
  const A = cone([-d / 2, 0, 0], t)
  const B = cone([d / 2, 0, 0], t)

  let both = 0

  for (const e of A) {
    if (B.has(e)) {
      both++
    }
  }

  return {
    f: both / Math.sqrt(A.size * B.size),
    size: A.size,
    sizes: A.size === B.size,
  }
}

export function sharedAncestryRun(): Verdict {
  const started = Date.now()
  const beats = [4, 8, 12, 16, 24]
  const profiles = new Map<number, number[]>()

  let i1 = true

  for (const t of beats) {
    let expected = 0

    for (let tau = 0; tau <= t; tau++) {
      expected += ballSize(Math.min(tau, t - tau))
    }

    i1 &&= cone([0, 0, 0], t).size === expected

    const row: number[] = []

    for (let d = 0; d <= 2 * t; d += 2) {
      const s = shared(t, d)

      i1 &&= s.sizes
      row.push(s.f)
    }

    profiles.set(t, row)
  }

  const f = (t: number, d: number): number => profiles.get(t)![d / 2]!
  // H1: local log-log slopes at t = 24 over d = 6 .. 24
  const slopes: number[] = []

  for (let d = 6; d < 24; d += 2) {
    slopes.push(
      Math.log(f(24, d + 2) / f(24, d)) / Math.log((d + 2) / d),
    )
  }

  const meanSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length
  const h1 = slopes.every(s => Math.abs(s / meanSlope - 1) < 0.1)
  // P1
  const p1Gaps = [4, 8, 12, 16].map(d =>
    Math.abs(f(16, d) - f(24, 1.5 * d)),
  )
  const p1 = p1Gaps.every(g => g < 0.04)
  // P2
  const edge = [16, 24].map(t => t * f(t, 2 * t))
  const p2 = edge.every(e => e >= 0.6 && e <= 1.2)
  // K
  const rates: number[] = []

  for (let d = 2; d < 48; d += 2) {
    rates.push(Math.log(f(24, d) / f(24, d + 2)) / 2)
  }

  const meanRate = rates.reduce((a, b) => a + b, 0) / rates.length
  const exponential = rates.every(r => Math.abs(r / meanRate - 1) < 0.1)
  const flat = f(24, 24) > 0.9
  const k = flat || exponential

  const status = !i1 ? 'partial' : k ? 'fail' : h1 ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `${k ? 'the shared-ancestry correlation has no scale' : h1 ? 'the shared-ancestry correlation is a power law' : 'the shared-ancestry correlation has the horizon as its scale'}: on the seed's husk reach the fraction of shared causal ancestors of two docks at separation d falls from 1 at d = 0 to ${f(24, 48).toFixed(4)} at d = 2t (t = 24), not flat and not exponential (decay rates ${Math.min(...rates).toFixed(3)} to ${Math.max(...rates).toFixed(3)}), and not one power of d (local slopes ${Math.min(...slopes).toFixed(3)} to ${Math.max(...slopes).toFixed(3)}); it is a function of d / t (t = 16 against 24 within ${Math.max(...p1Gaps).toFixed(3)}), with the edge share near 1 / t (t f(2t) = ${edge.map(e => e.toFixed(3)).join(', ')})`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      gate_P2: p2 ? 1 : 0,
      gate_K: k ? 1 : 0,
      meanSlope,
      meanRate,
      ...Object.fromEntries(
        beats.map(t => [`cone_t${t}`, cone([0, 0, 0], t).size]),
      ),
      ...Object.fromEntries(
        [16, 24].flatMap(t =>
          profiles.get(t)!.map((v, i) => [`f_t${t}_d${2 * i}`, v]),
        ),
      ),
      seconds: (Date.now() - started) / 1000,
    },
    notes: `L1. Gates I1 ${i1}, H1 ${h1}, P1 ${p1} (gaps ${p1Gaps.map(g => g.toFixed(4)).join(', ')}), P2 ${p2}, K ${k} (flat ${flat}, exponential ${exponential}). Profiles (d = 0, 2, ...): ${beats
      .map(
        t =>
          `t ${t}: ${profiles
            .get(t)!
            .map(v => v.toFixed(4))
            .join(' ')}`,
      )
      .join('; ')}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
  })
}

export default experiment({
  id: 'cosmology/shared-ancestry',
  code: 'E-CSM-0061',
  title:
    'ripples from shared ancestry on the seed’s husk reach (route I8b)',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return sharedAncestryRun()
  },
})
