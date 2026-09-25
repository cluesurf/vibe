// A knot's charge written into its stored weights: the departure from calm (code/rule/calm-weave) times a
// factor the knot's charge decides, read back by dividing the factor out.
//
// Three rules for the factor f, each a candidate for "the charge is the normalization":
// - sign: f = +1 for a love-knot and -1 for a fear-knot, its charge-conjugate mirror (every weight negated,
//   C on the grid). Two knots joining must give one knot whose stored weights are f_ab Delta_ab, and a
//   factor that must divide out has to be +1 or -1, so f_ab = f_a f_b: the signs multiply. The additive
//   ledger (the sum of every knot's sign) is kept only while no two knots join.
// - center: f = omega^q, q the knot's charge (loves minus fears among its vibes), omega = e^(2 pi i / 3),
//   stored as Eisenstein integers re + om omega, so still exact whole numbers. Joining multiplies the
//   factors and adds the charges, a pair made from calm has omega omega^2 = 1, charge conjugation is the
//   complex conjugate, and a knot (charge 0 mod 3) has real weights.
// - label: f = 1, with the charge kept beside the weights as an integer. Nothing in the weights knows it.
//
// A step never reads the factor: the kernel is real, so it moves re and om alike, and the units grow by the
// kernel's divisor at every meeting inside the knot and are reduced over both parts together.

import { type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { advanceDeparture, conjugateIndex, mergeDepartures, type Departure } from '@/code/rule/calm-weave'

export type KnotRule = 'sign' | 'center' | 'label'

// stored = (re + om omega) / units on the 9^k joint points; sign and charge are the knot's labels
export type SignedKnot = {
  readonly rule: KnotRule
  readonly tokens: readonly number[]
  readonly re: readonly bigint[]
  readonly om: readonly bigint[]
  readonly units: bigint
  readonly sign: number
  readonly charge: number
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

// (re + om omega) omega^q, exact: (a + b omega) omega = -b + (a - b) omega
export function timesOmega(re: readonly bigint[], om: readonly bigint[], q: number): { re: bigint[]; om: bigint[] } {
  let a = [...re]
  let b = [...om]

  for (let i = 0; i < mod3(q); i++) {
    const next = { re: b.map(x => -x), om: a.map((x, j) => x - (b[j] ?? 0n)) }

    a = next.re
    b = next.om
  }

  return { re: a, om: b }
}

function reduceKnot(k: SignedKnot): SignedKnot {
  const g = k.om.reduce((acc, x) => gcd(acc, x), k.re.reduce((acc, x) => gcd(acc, x), k.units))

  return g > 1n ? { ...k, re: k.re.map(x => x / g), om: k.om.map(x => x / g), units: k.units / g } : k
}

// store a departure under a rule
export function knotOf(input: { departure: Departure; rule: KnotRule; sign: number; charge: number }): SignedKnot {
  const { departure, rule, sign, charge } = input
  const zero = departure.delta.map(() => 0n)
  const stored =
    rule === 'sign'
      ? { re: departure.delta.map(x => BigInt(sign) * x), om: zero }
      : rule === 'center'
        ? timesOmega(departure.delta, zero, charge)
        : { re: [...departure.delta], om: zero }

  return { rule, tokens: departure.tokens, ...stored, units: departure.units, sign, charge }
}

// the departure a knot reads as: the factor divided out. null when what is left is not real (the stored
// weights do not carry the factor the labels name)
export function readKnot(k: SignedKnot): Departure | null {
  const plain =
    k.rule === 'sign'
      ? { re: k.re.map(x => BigInt(k.sign) * x), om: k.om.map(x => BigInt(k.sign) * x) }
      : k.rule === 'center'
        ? timesOmega(k.re, k.om, -k.charge)
        : { re: [...k.re], om: [...k.om] }

  return plain.om.every(x => x === 0n) ? { tokens: k.tokens, delta: plain.re, units: k.units } : null
}

// the sum of the stored weights, re + om omega, over the units
export function knotTotal(k: SignedKnot): { re: bigint; om: bigint } {
  return { re: k.re.reduce((a, b) => a + b, 0n), om: k.om.reduce((a, b) => a + b, 0n) }
}

// two knots joined: the tensor product of what each reads, stored under the joint labels. The sign rule's
// joint sign is the product (the only factor that still divides out); the charge adds
export function mergeKnots(a: SignedKnot, b: SignedKnot): SignedKnot | null {
  const da = readKnot(a)
  const db = readKnot(b)

  if (!da || !db) {
    return null
  }

  return knotOf({ departure: mergeDepartures(da, db), rule: a.rule, sign: a.sign * b.sign, charge: a.charge + b.charge })
}

// charge conjugation of a knot: C on every point, and the factor conjugated with the charge. sign: every
// weight negated and the sign flipped. center: the complex conjugate, (a + b omega)* = (a - b) - b omega.
// label: the charge negated
export function mirrorKnot(k: SignedKnot): SignedKnot {
  const n = k.tokens.length
  const moved = (w: readonly bigint[]): bigint[] => w.map((_, i) => w[conjugateIndex(i, n)] ?? 0n)
  const re = moved(k.re)
  const om = moved(k.om)

  if (k.rule === 'sign') {
    return { ...k, re: re.map(x => -x), om: om.map(x => -x), sign: -k.sign, charge: -k.charge }
  }

  if (k.rule === 'center') {
    return { ...k, re: re.map((x, i) => x - (om[i] ?? 0n)), om: om.map(x => -x), charge: -k.charge }
  }

  return { ...k, re, om, charge: -k.charge }
}

// one beat on a knot's stored weights, never reading its labels: the kernel's whole-number form applied to
// re and om alike, the units multiplied by the divisor at each meeting inside the knot (grain) or kept with
// a refusal where a fraction is needed (fixed)
export function advanceKnot(input: {
  weave: ColorWeave
  knot: SignedKnot
  record: BeatRecord
  kernel: readonly (readonly number[])[]
  divisor: number
  fixed: boolean
  forward: boolean
  moveOf?: (g: number) => ArrayLike<number>
}): SignedKnot | null {
  const { weave, knot, record, kernel, divisor, fixed, forward, moveOf } = input
  const inside = new Set(knot.tokens)
  const meetings = record.meetings.filter(([a, b]) => inside.has(a) && inside.has(b)).length
  const step = (w: readonly bigint[]): bigint[] | null =>
    advanceDeparture({ weave, departure: { tokens: knot.tokens, delta: w, units: 1n }, record, kernel, divisor: fixed ? divisor : 1, fixed: true, forward, moveOf })?.delta.slice() ?? null

  if (fixed) {
    const re = step(knot.re)
    const om = step(knot.om)

    return re && om ? { ...knot, re, om } : null
  }

  const re = step(knot.re)!
  const om = step(knot.om)!

  return reduceKnot({ ...knot, re, om, units: knot.units * BigInt(divisor) ** BigInt(meetings) })
}
