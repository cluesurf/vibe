// ONE-LINE SCATTERING OF BARE U: THE MOMENTUM-RESOLVED TWO-BODY S-MATRIX AND THREE-BODY FACTORIZATION (item
// vibe-computation-models-0049, Q3b; decision 004 of vibe/computation/models). Built on code/compute/quantum/routing
// (lineFrame, lineVibe, coinElement) and code/rule/bare-beat (applyBeat), none edited. Every coefficient is read off
// the beat; nothing is typed in.
//
// The line problem. On one mesh line a vibe is (k, slot, species), slot forward (moves to k + 1) or backward. A lone
// vibe runs the line coin C (read off one beat, coinElement) and the stream. Two vibes interact only when they share a
// dock on its two line slots (a contact; Q2, Q3); at odd separation they never meet. In the even sector, line order
// (left vibe L, right vibe R, the forward one first inside a contact dock) and n = (k_R - k_L) / 2 >= 0 describe a pair.
//
// Plane waves. psi_t(k) = lambda^t a^k v with C v = lambda diag(a, 1/a) v: a = e^(ip) = r + i s (r = cos p), and
// lambda = zeta6 mu with mu + 1/mu = r, so mu = r/2 + i band sqrt(4 - r^2)/2. v = (C_fb, lambda a - C_ff). The group
// velocity is the current (|v_f|^2 - |v_b|^2) / (|v_f|^2 + |v_b|^2) (the coin keeps |v_f| and |v_b|), checked equal to
// -band s / sqrt(4 - r^2) up to a sign that the exact equality decides. Rational cosines with sin p rational and
// 4 - r^2 in {1, 3, 91, 273} times a square put a, lambda and v in K = Q(zeta_9)(i, sqrt 91) (ninth-extension).
//
// The two-body S-matrix (line-order frame). Incoming: L carries mode 1 (a1), R mode 2 (a2), v1 > v2, word c_in over
// (species of L, species of R); outgoing: L carries mode 2, R mode 1, word c_out. With E = lambda1 lambda2, y = a2/a1
// and T the contact block read off one beat (contact word (forward, backward) to the word at (-1 backward, +1 forward)),
// the eigen-equation of the beat at the contact gives chi = v1f v2b c_in + v2f v1b c_out (the free ansatz continued to
// n = 0) and at (n = 1, slots b f) gives T chi = E (y v1b v2f c_in + y^-1 v2b v1f c_out), so
//     S = (v2f v1b T - E y^-1 v1f v2b I)^-1 (E y v1b v2f I - v1f v2b T).
// For three vibes the Bethe ansatz is Psi(config) = sum_pi A_pi(word) prod_j a_pi(j)^k_j v_pi(j)(s_j), one formula on
// every configuration (contacts included), with A_(pi s_j) = S_j(pi(j), pi(j+1)) A_pi for a colliding pair. It is an
// eigenvector of the beat iff the amplitudes reached along the two collision orders agree, i.e. the Yang-Baxter
// equation; eigenAnsatzDefects applies bare U to Psi on a window and counts the interior configurations where U Psi !=
// E Psi.
//
// DETERMINISM: no random numbers, no floating point in any decision, no host Math call.

import { type Ninth, ONE as NINTH_ONE, OMEGA, add as addNinth, scale as scaleNinth } from '@/code/algebra/ninth-field'
import {
  type Extension,
  type Num,
  type NumMatrix,
  add,
  asRational,
  conj,
  dagger,
  equals,
  extension,
  fromNinth,
  generator,
  identity,
  isZero,
  matInverse,
  matMul,
  mul,
  neg,
  power,
  rational,
  scale,
  sameMatrix,
  sub,
  div,
  zeroOf,
} from '@/code/compute/quantum/ninth-extension'
import type { Species } from '@/code/compute/quantum/particles'
import { type LineFrame, coinElement, lineVibe, readLine } from '@/code/compute/quantum/routing'
import {
  type BeatState,
  type Vibe,
  Z9_OMEGA,
  amplitudeOf,
  applyBeat,
  decodeConfig,
  encodeConfig,
  mapConfigurations,
  mulZ9,
  superpose,
} from '@/code/rule/bare-beat'

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

// K = Q(zeta_9)(i, sqrt 91)
export const LINE_FIELD: Extension = extension([-1n, 91n])

const I = generator(LINE_FIELD, 0)
// sqrt 3 = -i (2 omega + 1)
const SQRT3 = neg(mul(LINE_FIELD, I, fromNinth(LINE_FIELD, addNinth(scaleNinth(OMEGA, 2), NINTH_ONE))))
const SQRT91 = generator(LINE_FIELD, 1)

const K_ONE = rational(LINE_FIELD, 1)
const kmul = (a: Num, b: Num): Num => mul(LINE_FIELD, a, b)
const kconj = (a: Num): Num => conj(LINE_FIELD, a)
const kdiv = (a: Num, b: Num): Num => div(LINE_FIELD, a, b)
const kweight = (a: Num): Num => kmul(a, kconj(a))
const kn = (x: Ninth): Num => fromNinth(LINE_FIELD, x)

function squarefreeSplit(n: bigint): readonly [square: bigint, free: bigint] {
  let m = n
  let root = 1n
  let free = 1n

  for (let p = 2n; p * p <= m; p++) {
    while (m % (p * p) === 0n) {
      m /= p * p
      root *= p
    }

    if (m % p === 0n) {
      m /= p
      free *= p
    }
  }

  return [root, free * m]
}

// sqrt(numerator / denominator) in K, for a nonnegative rational whose square-free part is 1, 3, 91 or 273
export function sqrtRational(numerator: bigint, denominator: bigint): Num {
  assertExact(numerator >= 0n && denominator > 0n, 'sqrt of a negative rational')

  if (numerator === 0n) {
    return zeroOf(LINE_FIELD)
  }

  const [root, free] = squarefreeSplit(numerator * denominator)
  const unit =
    free === 1n ? K_ONE : free === 3n ? SQRT3 : free === 91n ? SQRT91 : free === 273n ? kmul(SQRT3, SQRT91) : undefined

  assertExact(unit !== undefined, `sqrt of ${numerator}/${denominator} is not in K (square-free part ${free})`)

  return scale(unit!, root, denominator)
}

// ---------------------------------------------------------------------------------------------------------------------
// One vibe: plane-wave modes of the line walk
// ---------------------------------------------------------------------------------------------------------------------

export type ModeSpec = {
  readonly name: string
  // cos p = cosNumerator / cosDenominator
  readonly cos: readonly [bigint, bigint]
  readonly sinSign: 1 | -1
  readonly band: 1 | -1
}

export type Mode = {
  readonly spec: ModeSpec
  readonly a: Num
  readonly lambda: Num
  // v = (v_f, v_b)
  readonly vf: Num
  readonly vb: Num
  // group velocity: sign, and its square (rational)
  readonly velocitySign: 1 | -1
  readonly velocitySquared: readonly [bigint, bigint]
  readonly velocity: Num
}

export type LineCoin = { readonly ff: Num; readonly fb: Num; readonly bf: Num; readonly bb: Num }

export function lineCoin(frame: LineFrame): LineCoin {
  const c = coinElement(frame)

  assertExact(c.unitary && isZero(kn(c.leakage)), 'the line coin read off one beat is unitary and lossless')

  return { ff: kn(c.matrix[0]![0]!), fb: kn(c.matrix[0]![1]!), bf: kn(c.matrix[1]![0]!), bb: kn(c.matrix[1]![1]!) }
}

export function makeMode(coin: LineCoin, spec: ModeSpec): Mode {
  const [rn, rd] = spec.cos

  assertExact(rn * rn < rd * rd, 'a mode needs |cos p| < 1')

  const r = rational(LINE_FIELD, rn, rd)
  const s = scale(sqrtRational(rd * rd - rn * rn, rd * rd), spec.sinSign)
  const a = add(r, kmul(I, s))
  const root = sqrtRational(4n * rd * rd - rn * rn, rd * rd)
  const mu = add(scale(r, 1, 2), scale(kmul(I, root), spec.band, 2))
  // zeta6 = e^(i pi / 3) = -omega^2 = -conj(omega)
  const zeta6 = neg(kconj(kn(OMEGA)))
  const lambda = kmul(zeta6, mu)

  assertExact(equals(kmul(zeta6, zeta6), kn(OMEGA)), 'zeta6^2 = omega')
  assertExact(equals(kweight(a), K_ONE), 'a has unit modulus')
  assertExact(equals(kweight(lambda), K_ONE), 'lambda has unit modulus')

  const aInverse = kconj(a)
  const vf = coin.fb
  const vb = sub(kmul(lambda, a), coin.ff)
  // C v = lambda diag(a, 1/a) v, exactly, with C read off the beat
  const cvf = add(kmul(coin.ff, vf), kmul(coin.fb, vb))
  const cvb = add(kmul(coin.bf, vf), kmul(coin.bb, vb))

  assertExact(equals(cvf, kmul(kmul(lambda, a), vf)), `mode ${spec.name}: C v = lambda a v on the forward slot`)
  assertExact(equals(cvb, kmul(kmul(lambda, aInverse), vb)), `mode ${spec.name}: C v = lambda / a v on the backward slot`)

  const wf = kweight(vf)
  const wb = kweight(vb)
  const velocity = kdiv(sub(wf, wb), add(wf, wb))
  const expected = kdiv(scale(s, -spec.band), root)
  const sign: 1 | -1 | 0 = equals(velocity, expected) ? 1 : equals(velocity, neg(expected)) ? -1 : 0

  assertExact(sign !== 0, `mode ${spec.name}: the current equals +-s / sqrt(4 - r^2)`)

  const squared = asRational(kmul(velocity, velocity))

  assertExact(squared !== undefined, `mode ${spec.name}: velocity squared is rational`)

  // the sign of expected: -band * sinSign (s and root are positive multiples of the sign written)
  const expectedSign = (-spec.band * spec.sinSign) as 1 | -1

  return {
    spec,
    a,
    lambda,
    vf,
    vb,
    velocitySign: (sign * expectedSign) as 1 | -1,
    velocitySquared: squared!,
    velocity,
  }
}

// v_x > v_y, exactly (signs, then rational squares)
export function faster(x: Mode, y: Mode): boolean {
  if (x.velocitySign !== y.velocitySign) {
    return x.velocitySign > y.velocitySign
  }

  const [xn, xd] = x.velocitySquared
  const [yn, yd] = y.velocitySquared
  const cmp = xn * yd - yn * xd

  return x.velocitySign > 0 ? cmp > 0n : cmp < 0n
}

// ---------------------------------------------------------------------------------------------------------------------
// The contact block, read off one beat, on line-order words
// ---------------------------------------------------------------------------------------------------------------------

export type ContactWords = {
  // words over species indices, in the block's basis
  readonly words: readonly (readonly [number, number])[]
  // block[j][i]: contact word i (forward species, backward species) to the word at (-1 backward, +1 forward)
  readonly block: Num[][]
  // weight leaving the two-word register (off the line, or other configurations), per input word
  readonly leakage: Num[]
}

const speciesIndexOf = (species: readonly Species[], tone: number, role: number): number =>
  species.findIndex(([t, r]) => t === tone && r === role)

export function contactWords(frame: LineFrame, species: readonly Species[], x: number, y: number): ContactWords {
  const words: (readonly [number, number])[] = x === y ? [[x, x]] : [[x, y], [y, x]]
  const block = words.map(() => words.map(() => zeroOf(LINE_FIELD)))
  const leakage: Num[] = []

  words.forEach(([f, b], i) => {
    const [tf, rf] = species[f]!
    const [tb, rb] = species[b]!
    const next = applyBeat(superpose([[[lineVibe(frame, [0, true, tf, rf]), lineVibe(frame, [0, false, tb, rb])], NINTH_ONE]]))

    let leak = zeroOf(LINE_FIELD)

    for (const key of next.amp.keys()) {
      const amp = kn(amplitudeOf(next, key))
      const line = readLine(frame, decodeConfig(key))
      const shape = line?.length === 2 && line[0]![0] === -1 && !line[0]![1] && line[1]![0] === 1 && line[1]![1]
      const j = shape
        ? words.findIndex(
            ([l, r]) =>
              l === speciesIndexOf(species, line[0]![2], line[0]![3]) && r === speciesIndexOf(species, line[1]![2], line[1]![3]),
          )
        : -1

      if (j < 0) {
        leak = add(leak, kweight(amp))
      } else {
        block[j]![i] = add(block[j]![i]!, amp)
      }
    }

    leakage.push(leak)
  })

  return { words, block, leakage }
}

// ---------------------------------------------------------------------------------------------------------------------
// The two-body S-matrix
// ---------------------------------------------------------------------------------------------------------------------

// S on the contact block's words: in-word (L, R) with L carrying m1, R carrying m2, to out-word (L, R) with L carrying
// m2 and R carrying m1. Requires v1 > v2.
export function sMatrix(m1: Mode, m2: Mode, contact: NumMatrix): Num[][] {
  assertExact(faster(m1, m2), `S(${m1.spec.name}, ${m2.spec.name}) needs the left vibe faster`)

  const n = contact.length
  const e = kmul(m1.lambda, m2.lambda)
  const y = kdiv(m2.a, m1.a)
  const yInverse = kdiv(m1.a, m2.a)
  const id = identity(LINE_FIELD, n)
  const scaled = (m: NumMatrix, s: Num): Num[][] => m.map(row => row.map(x => kmul(x, s)))
  const minus = (p: NumMatrix, q: NumMatrix): Num[][] => p.map((row, i) => row.map((x, j) => sub(x, q[i]![j]!)))
  const left = minus(scaled(contact, kmul(m2.vf, m1.vb)), scaled(id, kmul(kmul(e, yInverse), kmul(m1.vf, m2.vb))))
  const right = minus(scaled(id, kmul(kmul(e, y), kmul(m1.vb, m2.vf))), scaled(contact, kmul(m1.vf, m2.vb)))

  return matMul(LINE_FIELD, matInverse(LINE_FIELD, left), right)
}

export const isUnitaryK = (m: NumMatrix): boolean =>
  sameMatrix(matMul(LINE_FIELD, dagger(LINE_FIELD, m), m), identity(LINE_FIELD, m.length))

// the particle frame: P S (the out-word read by momentum instead of by position)
export const particleFrame = (s: NumMatrix): Num[][] => (s.length === 1 ? s.map(r => [...r]) : [s[1]!, s[0]!].map(r => [...r]))

export type YangReading = {
  // S_part = alpha I + beta P (true when S commutes with the swap)
  readonly swapSymmetric: boolean
  // Q1's convention R(w) = (w I - i P) / (w + i): w = -i alpha / beta (undefined when beta = 0)
  readonly w: Num | undefined
  readonly wReal: boolean
  // S_part / R(w): the overall scalar, (w + i) alpha / w
  readonly prefactor: Num | undefined
  // the symmetric and antisymmetric eigenvalues of S_part
  readonly symmetric: Num
  readonly antisymmetric: Num
}

export function yangReading(sLine: NumMatrix): YangReading {
  assertExact(sLine.length === 2, 'a Yang reading needs two words')

  const p = particleFrame(sLine)
  const swapSymmetric = equals(p[0]![0]!, p[1]![1]!) && equals(p[0]![1]!, p[1]![0]!)
  const alpha = p[0]![0]!
  const beta = p[0]![1]!
  const w = isZero(beta) ? undefined : neg(kdiv(kmul(I, alpha), beta))

  return {
    swapSymmetric,
    w,
    wReal: w !== undefined && equals(w, kconj(w)),
    prefactor: w === undefined || isZero(w) ? undefined : kdiv(kmul(add(w, I), alpha), w),
    symmetric: add(alpha, beta),
    antisymmetric: sub(alpha, beta),
  }
}

// Yang's R(w) = (w I - i P) / (w + i) on two words, Q1's convention
export function yangR(w: Num): Num[][] {
  const d = add(w, I)

  return [
    [kdiv(w, d), kdiv(neg(I), d)],
    [kdiv(neg(I), d), kdiv(w, d)],
  ]
}

// ---------------------------------------------------------------------------------------------------------------------
// Three letters: the braid form of the Yang-Baxter equation on line-order words
// ---------------------------------------------------------------------------------------------------------------------

export type PairS = (x: Mode, y: Mode, u: number, v: number) => { keep: Num; swap: Num }

// The two-body S for letters (u, v) in positions (L, R), as amplitudes to keep the word and to swap it, from S matrices
// on the contact basis of each unordered species pair.
export function pairSFrom(
  frame: LineFrame,
  species: readonly Species[],
  sOf: (x: Mode, y: Mode, contact: NumMatrix) => Num[][] = sMatrix,
): PairS {
  const contacts = new Map<string, ContactWords>()
  const cache = new Map<string, Num[][]>()

  return (x, y, u, v) => {
    assertExact(u !== v, 'pairS is for distinct letters')

    const lo = u < v ? u : v
    const hi = u < v ? v : u
    const key = `${lo},${hi}`

    if (!contacts.has(key)) {
      contacts.set(key, contactWords(frame, species, lo, hi))
    }

    const sKey = `${x.spec.name}|${y.spec.name}|${key}`

    if (!cache.has(sKey)) {
      cache.set(sKey, sOf(x, y, contacts.get(key)!.block))
    }

    const s = cache.get(sKey)!
    // basis 0 = (lo, hi), 1 = (hi, lo)
    const column = u === lo ? 0 : 1

    return { keep: s[column]![column]!, swap: s[1 - column]![column]! }
  }
}

export type WordVectorK = Map<string, Num>

const wordKey = (w: readonly number[]): string => w.join(',')

// Ř_j(x, y) on a word vector: positions j, j + 1 hold modes x (left) and y (right)
export function applyPairS(pairS: PairS, x: Mode, y: Mode, j: number, vector: WordVectorK): WordVectorK {
  const out: WordVectorK = new Map()

  const put = (w: readonly number[], amp: Num): void => {
    const k = wordKey(w)
    const next = add(out.get(k) ?? zeroOf(LINE_FIELD), amp)

    if (isZero(next)) {
      out.delete(k)
    } else {
      out.set(k, next)
    }
  }

  for (const [k, amp] of vector) {
    const w = k.split(',').map(Number)
    const { keep, swap } = pairS(x, y, w[j]!, w[j + 1]!)
    const swapped = [...w]

    swapped[j] = w[j + 1]!
    swapped[j + 1] = w[j]!
    put(w, kmul(keep, amp))
    put(swapped, kmul(swap, amp))
  }

  return out
}

export const sameVector = (a: WordVectorK, b: WordVectorK): boolean =>
  [...new Set([...a.keys(), ...b.keys()])].every(k => equals(a.get(k) ?? zeroOf(LINE_FIELD), b.get(k) ?? zeroOf(LINE_FIELD)))

// Both collision orders of three modes a > b > c (velocities) from an in-vector on words of three letters. Returns the
// out-vectors of order 1 (12, 23, 12) and order 2 (23, 12, 23) and the number of words where they differ.
export function yangBaxterDefects(
  pairS: PairS,
  [a, b, c]: readonly [Mode, Mode, Mode],
  input: WordVectorK,
): { first: WordVectorK; second: WordVectorK; defects: number } {
  assertExact(faster(a, b) && faster(b, c), 'Yang-Baxter needs v_a > v_b > v_c')

  const first = applyPairS(pairS, b, c, 0, applyPairS(pairS, a, c, 1, applyPairS(pairS, a, b, 0, input)))
  const second = applyPairS(pairS, a, b, 1, applyPairS(pairS, a, c, 0, applyPairS(pairS, b, c, 1, input)))
  const keys = new Set([...first.keys(), ...second.keys()])

  let defects = 0

  for (const k of keys) {
    if (!equals(first.get(k) ?? zeroOf(LINE_FIELD), second.get(k) ?? zeroOf(LINE_FIELD))) {
      defects++
    }
  }

  return { first, second, defects }
}

// ---------------------------------------------------------------------------------------------------------------------
// The Bethe ansatz, checked against the beat itself
// ---------------------------------------------------------------------------------------------------------------------

// amplitudes A_pi for every ordering pi of the mode labels (0 .. n - 1, sorted fastest first), reached from the
// identity by colliding adjacent pairs (faster on the left) in a fixed order (lexicographic breadth-first, first path
// wins)
export function betheAmplitudes(pairS: PairS, modes: readonly Mode[], input: WordVectorK): Map<string, WordVectorK> {
  const out = new Map<string, WordVectorK>([[wordKey(modes.map((_, i) => i)), input]])
  const queue: number[][] = [modes.map((_, i) => i)]

  for (const pi of queue) {
    const amp = out.get(wordKey(pi))!

    for (let j = 0; j + 1 < pi.length; j++) {
      const x = modes[pi[j]!]!
      const y = modes[pi[j + 1]!]!

      if (!faster(x, y)) {
        continue
      }

      const next = [...pi]

      next[j] = pi[j + 1]!
      next[j + 1] = pi[j]!

      if (!out.has(wordKey(next))) {
        out.set(wordKey(next), applyPairS(pairS, x, y, j, amp))
        queue.push(next)
      }
    }
  }

  return out
}

// a line configuration in line order: [k, forward, species index]
export type LineSite = readonly [k: number, forward: boolean, letter: number]

// Psi(config) = sum_pi A_pi(word) prod_j a_pi(j)^k_j v_pi(j)(s_j)
export function betheValue(modes: readonly Mode[], amplitudes: ReadonlyMap<string, WordVectorK>, config: readonly LineSite[]): Num {
  const word = wordKey(config.map(s => s[2]))

  let total = zeroOf(LINE_FIELD)

  for (const [piKey, vector] of amplitudes) {
    const coefficient = vector.get(word)

    if (coefficient === undefined) {
      continue
    }

    const pi = piKey.split(',').map(Number)

    let term = coefficient

    config.forEach(([k, forward], j) => {
      const m = modes[pi[j]!]!

      term = kmul(term, kmul(power(LINE_FIELD, m.a, k), forward ? m.vf : m.vb))
    })
    total = add(total, term)
  }

  return total
}

// Every line configuration of `count` vibes with letters a permutation of `letters` (multiset), positions in [-reach,
// reach] of one parity class each (all pairs at even separation), in line order: separated vibes take either slot, a
// contact (two vibes in one dock) is forward then backward, never three in a dock.
export function evenSectorConfigurations(count: number, letters: readonly number[], reach: number): LineSite[][] {
  const words = new Set<string>()

  const permute = (rest: readonly number[], acc: number[]): void => {
    if (rest.length === 0) {
      words.add(acc.join(','))

      return
    }

    rest.forEach((l, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, l]))
  }

  permute(letters, [])

  const out: LineSite[][] = []

  for (const parity of [0, 1]) {
    const ks: number[] = []

    for (let k = -reach; k <= reach; k++) {
      if (((k % 2) + 2) % 2 === parity) {
        ks.push(k)
      }
    }

    const positions: number[][] = []

    const choose = (start: number, acc: number[]): void => {
      if (acc.length === count) {
        positions.push(acc)

        return
      }

      for (let i = start; i < ks.length; i++) {
        const k = ks[i]!
        const n = acc.length

        // at most two in a dock
        if (n >= 2 && acc[n - 1] === k && acc[n - 2] === k) {
          continue
        }

        choose(i, [...acc, k])
      }
    }

    choose(0, [])

    for (const pos of positions) {
      const slotOptions = pos.map((k, j) =>
        pos[j + 1] === k ? [true] : pos[j - 1] === k ? [false] : [true, false],
      )

      const slots: boolean[][] = [[]]

      for (const options of slotOptions) {
        const grown: boolean[][] = []

        for (const s of slots) {
          for (const o of options) {
            grown.push([...s, o])
          }
        }

        slots.splice(0, slots.length, ...grown)
      }

      for (const s of slots) {
        for (const w of words) {
          const letterOf = w.split(',').map(Number)

          out.push(pos.map((k, j) => [k, s[j]!, letterOf[j]!] as const))
        }
      }
    }
  }

  return out
}

export type EigenCheck = {
  readonly configurations: number
  readonly interior: number
  readonly defects: number
  // weight of U Psi on interior positions outside the even-sector register (off the line, three in a dock)
  readonly strayConfigurations: number
}

// Applies `beat` (bare U, or a planted variant) to Psi restricted to the window, coordinate by coordinate of K, and
// compares U Psi with E Psi on every configuration whose positions all lie within reach - 1 (all their sources lie in
// the window).
export function eigenAnsatzDefects(
  frame: LineFrame,
  species: readonly Species[],
  modes: readonly Mode[],
  amplitudes: ReadonlyMap<string, WordVectorK>,
  letters: readonly number[],
  reach: number,
  beat: (state: BeatState) => BeatState = applyBeat,
): EigenCheck {
  const configs = evenSectorConfigurations(modes.length, letters, reach)
  const toVibes = (config: readonly LineSite[]): Vibe[] =>
    config.map(([k, forward, letter]) => lineVibe(frame, [k, forward, species[letter]![0], species[letter]![1]]))
  const values = configs.map(c => betheValue(modes, amplitudes, c))
  const e = modes.reduce((s, m) => kmul(s, m.lambda), K_ONE)
  const images = new Map<string, Num>()

  for (let m = 0; m < LINE_FIELD.size; m++) {
    const terms: (readonly [Vibe[], Ninth])[] = []

    configs.forEach((c, i) => {
      const coordinate = values[i]!.c[m]!

      if (coordinate.n.some(x => x !== 0n)) {
        terms.push([toVibes(c), coordinate])
      }
    })

    if (terms.length === 0) {
      continue
    }

    const image = beat(superpose(terms))
    const unit: Num = { c: Array.from({ length: LINE_FIELD.size }, (_, j) => (j === m ? NINTH_ONE : zeroOf(LINE_FIELD).c[0]!)) }

    for (const key of image.amp.keys()) {
      images.set(key, add(images.get(key) ?? zeroOf(LINE_FIELD), kmul(unit, kn(amplitudeOf(image, key)))))
    }
  }

  const interiorKeys = new Map<string, Num>()

  configs.forEach((c, i) => {
    if (c.every(([k]) => k > -reach && k < reach)) {
      interiorKeys.set(encodeConfig(toVibes(c)), kmul(e, values[i]!))
    }
  })

  let defects = 0

  for (const [key, want] of interiorKeys) {
    if (!equals(images.get(key) ?? zeroOf(LINE_FIELD), want)) {
      defects++
    }
  }

  let strayConfigurations = 0

  for (const [key, amp] of images) {
    if (interiorKeys.has(key) || isZero(amp)) {
      continue
    }

    const line = readLine(frame, decodeConfig(key))

    if (line === undefined || line.every(([k]) => k > -reach + 1 && k < reach - 1)) {
      strayConfigurations++
    }
  }

  return { configurations: configs.length, interior: interiorKeys.size, defects, strayConfigurations }
}

// A planted genuine three-body phase: omega on every configuration of three vibes on the line spanning at most two
// coordinates, after the beat (a unitary that leaves every two-body process unchanged)
export function plantedThreeBodyBeat(frame: LineFrame): (state: BeatState) => BeatState {
  return state =>
    mapConfigurations(applyBeat(state), (vibes, amp) => {
      const line = readLine(frame, vibes)
      const close = line?.length === 3 && line[2]![0] - line[0]![0] <= 2

      return [vibes, close ? mulZ9(Z9_OMEGA, amp) : amp]
    })
}
