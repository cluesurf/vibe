// THE OPPOSITE-TONE BOX: WHERE THREE-BODY DIFFRACTION ON ONE LINE OF BARE U VANISHES (item vibe-computation-models-0056,
// Q3c door B; decision 007 of vibe/computation/models). Built on code/compute/quantum/line-scattering, ninth-extension,
// routing and code/rule/bare-beat, none edited.
//
// The question. A like pair next to an opposite tone fails Yang-Baxter (Q3b): along the two collision orders the like
// pair's symmetric channel collects -sigma(x) sigma(y) and sigma(x + y), sigma(u) = (u - i)/(u + i), x = theta_a -
// theta_b, y = theta_b - theta_c, and the two orders differ by -x y (x + y)(I + P)/((x + i)(y + i)(x + y + i)) (Lean,
// item 0055). Where that vanishes no Bethe state is inconsistent and the triple does not diffract. This module supplies
// the exact pieces that decide on which momenta that happens and what the like pair's role register gets there.
//
//   rapidity            theta = (2 / sqrt 3) Im(lambda) / Im(a), as Q3b
//   rapidityResidue     4 Im(lambda) Im(zeta6 lambda) + Im(a)^2, zero on every mode: so theta^2 = -Im(lambda) / (3
//                       Im(zeta6 lambda)) is a function of the beat eigenvalue alone
//   pairResidue         Im(l1) Im(zeta6 l2) - Im(l2) Im(zeta6 l1) - (sqrt 3 / 2) Im(l1 conj l2), zero for unit l1, l2: so
//                       theta_1^2 = theta_2^2 iff l2 = +-l1
//   samePhysicalMode    (a2, l2) = (a1, l1) or (-a1, -l1): the second is the first times (-1)^(k + t), a constant on
//                       the one parity class x + t mod 2 a vibe lives on
//   orderMismatch       |first - second|^2 in the like pair's symmetric channel = 4 x^2 y^2 (x + y)^2 / ((x^2 + 1)(y^2
//                       + 1)((x + y)^2 + 1)), exact in K
//   coincidentKernel    two vibes of one mode in contact need (T - lambda^2) c = 0 for the contact block T: the kernel
//   plantedTripleBeat   a genuine three-body phase (omega when three vibes adjacent in line order span at most two
//                       coordinates), the instrument control for words of any length
//   wordRun             an exact time run of a line word under bare U: tone word in line order, roles per position,
//                       off-line weight
//
// DETERMINISM: exact arithmetic only, no random numbers, no floating point in any decision, no host Math call.

import { ONE as NINTH_ONE, OMEGA } from '@/code/algebra/ninth-field'
import { type Mode, LINE_FIELD, sqrtRational } from '@/code/compute/quantum/line-scattering'
import { type Num, type NumMatrix, add, conj, div, equals, fromNinth, generator, isZero, mul, neg, rational, sub } from '@/code/compute/quantum/ninth-extension'
import { type LineFrame, type LineVibe, lineVibe, readLine } from '@/code/compute/quantum/routing'
import { type BeatState, Z9_OMEGA, applyBeat, basisKet, decodeConfig, mapConfigurations, mulZ9 } from '@/code/rule/bare-beat'

const K = LINE_FIELD
const kmul = (a: Num, b: Num): Num => mul(K, a, b)
const kdiv = (a: Num, b: Num): Num => div(K, a, b)
const kconj = (a: Num): Num => conj(K, a)
const I = generator(K, 0)
const ONE = rational(K, 1)
const OMEGA_K = fromNinth(K, OMEGA)
// zeta6 = 1 + omega
const ZETA6 = add(fromNinth(K, NINTH_ONE), OMEGA_K)
const SQRT3 = sqrtRational(3n, 1n)

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

// Im(x) = (x - conj x) / (2 i), a real element of K
export const imaginary = (x: Num): Num => kdiv(sub(x, kconj(x)), kmul(rational(K, 2), I))

export const isReal = (x: Num): boolean => equals(x, kconj(x))

// theta = (2 / sqrt 3) Im(lambda) / Im(a)
export function rapidity(m: Mode): Num {
  return kdiv(kmul(rational(K, 2), imaginary(m.lambda)), kmul(SQRT3, imaginary(m.a)))
}

// 4 Im(lambda) Im(zeta6 lambda) + Im(a)^2: zero on every mode (cos W = cos p / 2)
export function rapidityResidue(m: Mode): Num {
  const ia = imaginary(m.a)

  return add(kmul(rational(K, 4), kmul(imaginary(m.lambda), imaginary(kmul(ZETA6, m.lambda)))), kmul(ia, ia))
}

// theta^2 read from the beat eigenvalue alone: -Im(lambda) / (3 Im(zeta6 lambda))
export const rapiditySquaredFromEnergy = (m: Mode): Num =>
  neg(kdiv(imaginary(m.lambda), kmul(rational(K, 3), imaginary(kmul(ZETA6, m.lambda)))))

// Im(l1) Im(zeta6 l2) - Im(l2) Im(zeta6 l1) - (sqrt 3 / 2) Im(l1 conj l2): zero for unit l1, l2
export function pairResidue(m1: Mode, m2: Mode): Num {
  const l1 = m1.lambda
  const l2 = m2.lambda
  const cross = sub(kmul(imaginary(l1), imaginary(kmul(ZETA6, l2))), kmul(imaginary(l2), imaginary(kmul(ZETA6, l1))))

  return sub(cross, kmul(kdiv(SQRT3, rational(K, 2)), imaginary(kmul(l1, kconj(l2)))))
}

// the same physical wave on one parity class: (a, lambda) or (-a, -lambda)
export const samePhysicalMode = (m1: Mode, m2: Mode): boolean =>
  (equals(m1.a, m2.a) && equals(m1.lambda, m2.lambda)) || (equals(m1.a, neg(m2.a)) && equals(m1.lambda, neg(m2.lambda)))

// the parity partner is the same wave times (-1)^(k + t): its vector v = (C_fb, lambda a - C_ff) is the same
export const partnerVectorsAgree = (m1: Mode, m2: Mode): boolean => equals(m1.vf, m2.vf) && equals(m1.vb, m2.vb)

// sigma(u) = (u - i) / (u + i), the symmetric-channel eigenvalue of the like S (line frame)
export const sigma = (u: Num): Num => kdiv(sub(u, I), add(u, I))

// |(-sigma(x) sigma(y)) - sigma(x + y)|^2 and its closed form 4 x^2 y^2 (x + y)^2 / ((x^2 + 1)(y^2 + 1)((x + y)^2 + 1))
export function orderMismatch(x: Num, y: Num): { readonly direct: Num; readonly closed: Num } {
  const s = add(x, y)
  const d = sub(neg(kmul(sigma(x), sigma(y))), sigma(s))
  const sq = (u: Num): Num => kmul(u, u)
  const closed = kdiv(kmul(rational(K, 4), kmul(kmul(sq(x), sq(y)), sq(s))), kmul(kmul(add(sq(x), ONE), add(sq(y), ONE)), add(sq(s), ONE)))

  return { direct: kmul(d, kconj(d)), closed }
}

// Two vibes of one mode in contact: the plane wave A a^(kL + kR) v(sL) v(sR) is an eigenvector of the beat at the contact
// iff (T - E) c = 0 with E = lambda^2 (the two terms of the two-body ansatz merge at y = 1). Returns det(T - E) and, for
// a 2 x 2 block, whether the antisymmetric word (1, -1) and the symmetric word (1, 1) lie in the kernel.
export function coincidentKernel(
  m: Mode,
  block: NumMatrix,
): { readonly determinant: Num; readonly antisymmetric: boolean; readonly symmetric: boolean } {
  const e = kmul(m.lambda, m.lambda)

  if (block.length === 1) {
    const d = sub(block[0]![0]!, e)

    return { determinant: d, antisymmetric: false, symmetric: isZero(d) }
  }

  const t00 = sub(block[0]![0]!, e)
  const t11 = sub(block[1]![1]!, e)
  const t01 = block[0]![1]!
  const t10 = block[1]![0]!
  const killed = (u: Num, v: Num): boolean => isZero(add(kmul(t00, u), kmul(t01, v))) && isZero(add(kmul(t10, u), kmul(t11, v)))

  return { determinant: sub(kmul(t00, t11), kmul(t01, t10)), antisymmetric: killed(ONE, neg(ONE)), symmetric: killed(ONE, ONE) }
}

// -omega, the antisymmetric eigenvalue of the like block and the whole opposite block
export const MINUS_OMEGA = neg(OMEGA_K)

// A planted genuine three-body phase for words of any length: omega on every configuration where three vibes adjacent
// in line order span at most two coordinates, after the beat. Every two-body process is unchanged.
export function plantedTripleBeat(frame: LineFrame): (state: BeatState) => BeatState {
  return state =>
    mapConfigurations(applyBeat(state), (vibes, amp) => {
      const line = readLine(frame, vibes)
      const close = line?.some((v, j) => j + 2 < line.length && line[j + 2]![0] - v[0] <= 2) === true

      return [vibes, close ? mulZ9(Z9_OMEGA, amp) : amp]
    })
}

export type WordRunBeat = {
  readonly beat: number
  readonly configurations: number
  // configurations with a vibe off the frame line or a changed vibe count
  readonly offLine: number
  // configurations whose tone word in line order differs from the start's
  readonly toneWordDefects: number
  // per line position: configurations whose role there differs from the start's
  readonly roleMoved: readonly number[]
  // per line position j and start role r: configurations where position j holds the vibe of start position r's
  // species (tone and role), as counts [j][r]
  readonly speciesAt: readonly (readonly number[])[]
}

// An exact run of a line word under bare U (no window cut: the state is carried whole). The start lists the vibes in
// line order; every species must be distinct (an identical pair leaves the line).
export function wordRun(frame: LineFrame, start: readonly LineVibe[], beats: number): WordRunBeat[] {
  const species = start.map(([, , tone, role]) => `${tone}:${role}`)

  assertExact(new Set(species).size === species.length, 'a word run needs distinct species')

  const tones = start.map(v => v[2]).join(',')
  const out: WordRunBeat[] = []

  let state = basisKet(start.map(v => lineVibe(frame, v)))

  for (let beat = 1; beat <= beats; beat++) {
    state = applyBeat(state)

    let offLine = 0
    let toneWordDefects = 0

    const roleMoved = start.map(() => 0)
    const speciesAt = start.map(() => start.map(() => 0))

    for (const key of state.amp.keys()) {
      const line = readLine(frame, decodeConfig(key))

      if (line?.length !== start.length) {
        offLine++
        continue
      }

      if (line.map(v => v[2]).join(',') !== tones) {
        toneWordDefects++
      }

      line.forEach((v, j) => {
        if (v[3] !== start[j]![3]) {
          roleMoved[j]!++
        }

        const r = species.indexOf(`${v[2]}:${v[3]}`)

        if (r >= 0) {
          speciesAt[j]![r]!++
        }
      })
    }

    out.push({ beat, configurations: state.amp.size, offLine, toneWordDefects, roleMoved, speciesAt })
  }

  return out
}
