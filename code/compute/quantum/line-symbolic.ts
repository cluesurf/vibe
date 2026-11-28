// THE CLOSED FORMS BEHIND THE SYMBOLIC LINE S-MATRIX OF BARE U (item vibe-computation-models-0055, Q3b symbolic;
// decision 004 of vibe/computation/models). Each function here mirrors one definition of code/proof/Vibe/LineScattering
// .lean, evaluated in K = Q(zeta_9)(i, sqrt 91) (line-scattering LINE_FIELD), so an experiment can check that the Lean
// objects are the ones bare U produces: the coin and the contact blocks read off the beat, the mode vectors makeMode
// builds, the S-matrix sMatrix solves for, and the Yang-Baxter vectors yangBaxterDefects returns. Built on
// code/compute/quantum/line-scattering and ninth-extension, neither edited.
//
// Lean names (same symbols): zeta6 = 1 + omega, sqrt3 = -i (2 omega + 1), coinKeep = h zeta6, coinFlip = h (1 - omega),
// lam = zeta6 mu, vf = coinFlip, vb = lam a - coinKeep, contactKeep = -h i sqrt3, contactSwap = -h, cosP = h (a + ab),
// rapNum = i sqrt3 cosP + 2 mu - cosP, rapDen = sqrt3 (a - ab), rapW = rapNum1 rapDen2 - rapNum2 rapDen1,
// rapD = rapDen1 rapDen2 (so theta = rapNum / rapDen and theta1 - theta2 = rapW / rapD), and the claimed S in line
// order (W P - i D I) / (W + i D). The mixed-tone Yang-Baxter defect is -x y (x + y) / ((x + i)(y + i)(x + y + i)) on
// each of the two words the like pair spans.
//
// DETERMINISM: exact arithmetic only, no random numbers, no floating point, no host Math call.

import { ONE as NINTH_ONE, OMEGA } from '@/code/algebra/ninth-field'
import { type LineCoin, type Mode, LINE_FIELD } from '@/code/compute/quantum/line-scattering'
import { type Num, add, conj, div, fromNinth, generator, mul, neg, rational, sub } from '@/code/compute/quantum/ninth-extension'

const K = LINE_FIELD
const kmul = (a: Num, b: Num): Num => mul(K, a, b)
const kdiv = (a: Num, b: Num): Num => div(K, a, b)

export const SYM_I = generator(K, 0)
export const SYM_OMEGA = fromNinth(K, OMEGA)
export const SYM_ONE = fromNinth(K, NINTH_ONE)
export const SYM_HALF = rational(K, 1, 2)
// zeta6 = 1 + omega
export const SYM_ZETA6 = add(SYM_ONE, SYM_OMEGA)
// sqrt3 = -i (2 omega + 1)
export const SYM_SQRT3 = neg(kmul(SYM_I, add(kmul(rational(K, 2), SYM_OMEGA), SYM_ONE)))

// the line coin C = [[zeta6, 1 - omega], [1 - omega, zeta6]] / 2
export function closedCoin(): LineCoin {
  const keep = kmul(SYM_HALF, SYM_ZETA6)
  const flip = kmul(SYM_HALF, sub(SYM_ONE, SYM_OMEGA))

  return { ff: keep, fb: flip, bf: flip, bb: keep }
}

// the like-tone contact block on line-order words: keep -i sqrt3 / 2, swap -1/2
export function closedContact(): { readonly keep: Num; readonly swap: Num } {
  return { keep: neg(kmul(kmul(SYM_HALF, SYM_I), SYM_SQRT3)), swap: neg(SYM_HALF) }
}

// mu = e^(iW) of a mode, from its beat eigenvalue lambda = zeta6 mu
export const muOf = (m: Mode): Num => kdiv(m.lambda, SYM_ZETA6)

// 2 mu^2 - (a + ab) mu + 2, the dispersion polynomial (zero on every mode), ab = 1 / a = conj(a)
export function dispersionResidue(m: Mode): Num {
  const mu = muOf(m)
  const ab = conj(K, m.a)

  return add(sub(kmul(rational(K, 2), kmul(mu, mu)), kmul(add(m.a, ab), mu)), rational(K, 2))
}

// the Lean mode vector (vf, vb) = (coinFlip, lam a - coinKeep)
export function closedVector(m: Mode): { readonly vf: Num; readonly vb: Num } {
  const coin = closedCoin()

  return { vf: coin.fb, vb: sub(kmul(kmul(SYM_ZETA6, muOf(m)), m.a), coin.ff) }
}

// theta = rapNum / rapDen
export function rapidityParts(m: Mode): { readonly num: Num; readonly den: Num } {
  const ab = conj(K, m.a)
  const cosP = kmul(SYM_HALF, add(m.a, ab))
  const num = sub(add(kmul(kmul(SYM_I, SYM_SQRT3), cosP), kmul(rational(K, 2), muOf(m))), cosP)

  return { num, den: kmul(SYM_SQRT3, sub(m.a, ab)) }
}

export function rapidityDifferenceParts(m1: Mode, m2: Mode): { readonly w: Num; readonly d: Num } {
  const p1 = rapidityParts(m1)
  const p2 = rapidityParts(m2)

  return { w: sub(kmul(p1.num, p2.den), kmul(p2.num, p1.den)), d: kmul(p1.den, p2.den) }
}

// the claimed S in line order on words (lo, hi), (hi, lo): (W P - i D I) / (W + i D)
export function closedS(m1: Mode, m2: Mode): Num[][] {
  const { w, d } = rapidityDifferenceParts(m1, m2)
  const den = add(w, kmul(SYM_I, d))
  const keep = kdiv(neg(kmul(SYM_I, d)), den)
  const swap = kdiv(w, den)

  return [
    [keep, swap],
    [swap, keep],
  ]
}

// det of left = vf vb1 T - E y^-1 vf vb2 I for a 2 x 2 contact block T (the S of line-scattering is left^-1 right)
export function leftDeterminant(m1: Mode, m2: Mode, contact: readonly (readonly Num[])[]): Num {
  const e = kmul(m1.lambda, m2.lambda)
  const yInverse = kdiv(m1.a, m2.a)
  const p = kmul(m2.vf, m1.vb)
  const q = kmul(kmul(e, yInverse), kmul(m1.vf, m2.vb))
  const l00 = sub(kmul(p, contact[0]![0]!), q)
  const l11 = sub(kmul(p, contact[1]![1]!), q)
  const l01 = kmul(p, contact[0]![1]!)
  const l10 = kmul(p, contact[1]![0]!)

  return sub(kmul(l00, l11), kmul(l01, l10))
}

// the mixed-tone Yang-Baxter defect (first order minus second, per word of the like pair):
// -x y (x + y) / ((x + i)(y + i)(x + y + i)), x = theta_a - theta_b, y = theta_b - theta_c
export function mixedDefect(x: Num, y: Num): Num {
  const s = add(x, y)
  const numerator = neg(kmul(kmul(x, y), s))
  const denominator = kmul(kmul(add(x, SYM_I), add(y, SYM_I)), add(s, SYM_I))

  return kdiv(numerator, denominator)
}
