// The g of a spinor token's schedule, EXACT, in integers: the second-order band of code/measure/token-g-analytic
// reduced to Eisenstein arithmetic at the model coin, and the census tools E-SPN-0079 runs over every schedule.
// (The token is a STAND-IN, code/rule/spinor-token.)
//
// THE REDUCTION. At the model coin mu = pi / 3 the coin C = e^(i mu) e^(-i mu tau_x) has C^3 = 1. Moving every coin
// of a period to the front, U = C^N P(pi), and the stream of the j-th beat is seen in the coin frame
// z_j = omega^(-n_j), n_j the number of coins applied before it (its own beat's included) and omega = e^(2 pi i / 3).
// Only n_j mod 3 (the stream's FRAME) and N mod 3 enter. On the particle band (tau_x = +1), second order in the
// kinetic momenta gives, per plane (a, b) with the field along the third axis,
//
//   H = (kappa / 2) w^dagger w - (i / 2) T,     w = Z_a sigma_a pi_a + Z_b sigma_b pi_b,  Z_a = sum of z_j over the
//                                                a streams,  kappa = cot(pi N / 3) = eps / sqrt 3,  eps = +1 (N = 1
//                                                mod 3), -1 (N = 2 mod 3), massless when N = 0 mod 3,
//
// and T the ORDERING term: over pairs of streams, later minus earlier, of zbar_l z_j sigma_l sigma_j pi_l pi_j. The
// first part is the Pauli square (sigma . pi)^2 in the coin frame, which alone gives g = 2. Every coefficient is an
// Eisenstein integer, so with A = (sqrt 3 / 6) a, B = (sqrt 3 / 6) b, C = c / 4 and Zeeman (sqrt 3 / 12) z, the four
// numbers a, b, c, z are INTEGERS:
//
//   a = eps |Z_a|^2 + 3 sum over a-pairs (later l, earlier j) m(n_l - n_j)
//   c = -eps sum_(j in a, l in b) m(n_j - n_l) + sum_(a later, b earlier) r(n_l - n_j) - sum_(b later, a earlier) r(..)
//   z = -eps sum_(j in a, l in b) r(n_j - n_l) - 3 sum over cross pairs (later l, earlier j) m(n_l - n_j)
//
// with m(k) = 0, 1, -1 and r(k) = 2, -1, -1 for k = 0, 1, 2 mod 3 (Im omega^k in units of sqrt 3 / 2 and 2 Re
// omega^k). The band is a bowl exactly when 4ab > 3c^2, and then
//
//   g^2 = 4 z^2 / (4 a b - 3 c^2),     so g = 2 EXACTLY when z^2 = 4ab - 3c^2.
//
// Checks carried in the derivation (E-SPN-0079 G1 holds it to the float perturbation theory): the token x, y, z,
// up, down reads a = b = -1, c = 0, z = -4, g = 4 (E-MTR-0016); x, y, y, x reads a = b = 4, c = 0, z = 4, g = 1
// (E-SPN-0065); the nested palindrome reads a = b = 4, c = 0, z = -8, g = 2 (E-MTR-0017).
//
// THEOREM A (the Dirac square root). If the streams, read in order with their frames (axis_j, n_j mod 3), form a
// palindrome, every pair (l, j) has its mirror with the same frame difference and the opposite order, so T = 0: the
// band is exactly (kappa / 2) w^dagger w, rank one, and g = 2 in every plane that is a bowl. This is Strang's
// symmetric splitting, with the frames as part of the letters.
//
// Integer arithmetic only. A word is a string over 'x', 'y', 'z' (a stream) and '0' (a beat with the coin and no
// net husk motion: a depth pair's half, or an axis stream whose momentum is zero in the plane read).

export type Axis = 0 | 1 | 2

// the three planes, each right-handed: (x, y), (y, z), (z, x), the field along the third axis
export const PLANES: readonly (readonly [Axis, Axis])[] = [
  [0, 1],
  [1, 2],
  [2, 0],
]

const M = [0, 1, -1]
const R = [2, -1, -1]
const mod3 = (k: number): number => ((k % 3) + 3) % 3

export type PlaneInvariants = {
  readonly a: number
  readonly b: number
  readonly c: number
  readonly z: number
  // the ordering term's share of each, zero exactly when T = 0 in this plane
  readonly aT: number
  readonly bT: number
  readonly cT: number
  readonly zT: number
}

// eps: +1 for N = 1 mod 3, -1 for N = 2 mod 3, 0 massless
export function epsilonOf(total: number): number {
  const k = mod3(total)

  return k === 1 ? 1 : k === 2 ? -1 : 0
}

// |Z|^2 of the streams of one axis: n0^2 + n1^2 + n2^2 - n0 n1 - n1 n2 - n2 n0 over the frame counts
function normOf(
  axis: ArrayLike<number>,
  beat: ArrayLike<number>,
  count: number,
  which: number,
): number {
  const n = [0, 0, 0]

  for (let j = 0; j < count; j++) {
    if (axis[j] === which) {
      n[mod3(beat[j]!)]! += 1
    }
  }

  const [n0, n1, n2] = n as [number, number, number]

  return n0 * n0 + n1 * n1 + n2 * n2 - n0 * n1 - n1 * n2 - n2 * n0
}

// sum over same-axis pairs, later l, earlier j (beats increase with the index), of m(n_l - n_j)
function sameOrdering(
  axis: ArrayLike<number>,
  beat: ArrayLike<number>,
  count: number,
  which: number,
): number {
  let s = 0

  for (let l = 0; l < count; l++) {
    if (axis[l] !== which) {
      continue
    }

    for (let j = 0; j < l; j++) {
      if (axis[j] === which) {
        s += M[mod3(beat[l]! - beat[j]!)]!
      }
    }
  }

  return s
}

// The four integers of one plane. Streams are listed in time order (beat increasing); beat[j] is n_j.
export function planeInvariants(input: {
  axis: ArrayLike<number>
  beat: ArrayLike<number>
  count: number
  eps: number
  plane: readonly [Axis, Axis]
}): PlaneInvariants {
  const { axis, beat, count, eps, plane } = input
  const [p, q] = plane
  const sameA = sameOrdering(axis, beat, count, p)
  const sameB = sameOrdering(axis, beat, count, q)

  let pSum = 0
  let rr = 0
  let rab = 0
  let rba = 0
  let mc = 0

  for (let l = 0; l < count; l++) {
    const al = axis[l]!

    if (al !== p && al !== q) {
      continue
    }

    for (let j = 0; j < l; j++) {
      const aj = axis[j]!

      if (aj === al || (aj !== p && aj !== q)) {
        continue
      }

      // a cross pair, l later, j earlier
      const later = mod3(beat[l]! - beat[j]!)

      mc += M[later]!

      if (al === p) {
        rab += R[later]!
        // j in b, l in a: m(n_a - n_b) = m(n_l - n_j)
        pSum += M[later]!
        rr += R[later]!
      } else {
        rba += R[later]!
        // j in a, l in b: m(n_a - n_b) = m(n_j - n_l)
        pSum += M[mod3(-later)]!
        rr += R[mod3(-later)]!
      }
    }
  }

  return {
    a: eps * normOf(axis, beat, count, p) + 3 * sameA,
    b: eps * normOf(axis, beat, count, q) + 3 * sameB,
    c: -eps * pSum + rab - rba,
    z: -eps * rr - 3 * mc,
    aT: 3 * sameA,
    bT: 3 * sameB,
    cT: rab - rba,
    zT: -3 * mc,
  }
}

export const isBowl = (v: PlaneInvariants): boolean =>
  4 * v.a * v.b > 3 * v.c * v.c
export const isDirac = (v: PlaneInvariants): boolean =>
  isBowl(v) && v.z * v.z === 4 * v.a * v.b - 3 * v.c * v.c
export const orderingVanishes = (v: PlaneInvariants): boolean =>
  v.aT === 0 && v.bT === 0 && v.cT === 0 && v.zT === 0

// g^2 as an exact fraction [numerator, denominator], both positive, reduced; undefined when not a bowl
export function gSquared(
  v: PlaneInvariants,
): [number, number] | undefined {
  if (!isBowl(v)) {
    return undefined
  }

  const num = 4 * v.z * v.z
  const den = 4 * v.a * v.b - 3 * v.c * v.c
  const gcd = (x: number, y: number): number =>
    y === 0 ? Math.abs(x) : gcd(y, x % y)
  const d = gcd(num, den) || 1

  return [num / d, den / d]
}

// the streams of a word, in time order: axis and n (1-indexed beat = coins applied so far)
export function streamsOf(word: string): {
  axis: Int8Array
  beat: Int32Array
  count: number
  total: number
} {
  const axis: number[] = []
  const beat: number[] = []

  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    const a = ch === 'x' ? 0 : ch === 'y' ? 1 : ch === 'z' ? 2 : -1

    if (a >= 0) {
      axis.push(a)
      beat.push(i + 1)
    }
  }

  return {
    axis: Int8Array.from(axis),
    beat: Int32Array.from(beat),
    count: axis.length,
    total: word.length,
  }
}

export type WordReading = {
  readonly eps: number
  readonly planes: readonly PlaneInvariants[]
  // a_x = a_y = a_z, every c = 0, a bowl
  readonly isotropic: boolean
  // isotropic and |z| equal in the three planes: one g for a field along any axis
  readonly isotropicG: boolean
  // g = 2 exactly in all three planes
  readonly dirac: boolean
  // T = 0 in all three planes
  readonly orderingFree: boolean
  // the streams with their frames read the same backward
  readonly labeledPalindrome: boolean
}

export function readStreams(input: {
  axis: ArrayLike<number>
  beat: ArrayLike<number>
  count: number
  total: number
}): WordReading {
  const eps = epsilonOf(input.total)
  const planes = PLANES.map(plane =>
    planeInvariants({ ...input, eps, plane }),
  )
  const [xy, yz, zx] = planes as [
    PlaneInvariants,
    PlaneInvariants,
    PlaneInvariants,
  ]
  const isotropic =
    eps !== 0 &&
    xy.a !== 0 &&
    xy.a === yz.a &&
    yz.a === zx.a &&
    xy.c === 0 &&
    yz.c === 0 &&
    zx.c === 0
  const isotropicG =
    isotropic &&
    Math.abs(xy.z) === Math.abs(yz.z) &&
    Math.abs(yz.z) === Math.abs(zx.z)

  let labeledPalindrome = input.count > 0

  for (let j = 0, k = input.count - 1; j < k; j++, k--) {
    if (
      input.axis[j] !== input.axis[k] ||
      mod3(input.beat[j]!) !== mod3(input.beat[k]!)
    ) {
      labeledPalindrome = false
      break
    }
  }

  return {
    eps,
    planes,
    isotropic,
    isotropicG,
    dirac: eps !== 0 && planes.every(isDirac),
    orderingFree: planes.every(orderingVanishes),
    labeledPalindrome,
  }
}

export const readWord = (word: string): WordReading =>
  readStreams(streamsOf(word))

// the husk's axis permutations acting on the letters (each is a turn, with the spin turned along)
export const AXIS_PERMUTATIONS: readonly (readonly [
  string,
  string,
  string,
])[] = [
  ['x', 'y', 'z'],
  ['y', 'z', 'x'],
  ['z', 'x', 'y'],
  ['y', 'x', 'z'],
  ['x', 'z', 'y'],
  ['z', 'y', 'x'],
]

export function relabel(
  word: string,
  image: readonly [string, string, string],
): string {
  return Array.from(word, ch =>
    ch === 'x'
      ? image[0]
      : ch === 'y'
        ? image[1]
        : ch === 'z'
          ? image[2]
          : ch,
  ).join('')
}

export function rotations(word: string): string[] {
  return Array.from(
    { length: word.length },
    (_, s) => word.slice(s) + word.slice(0, s),
  )
}

// the least rotation of a word: its class as a period, whose origin is a choice
export function necklace(word: string): string {
  return rotations(word).reduce(
    (best, w) => (w < best ? w : best),
    word,
  )
}

// the least word over rotations and axis permutations: its class up to the husk's turns
export function turnClass(word: string): string {
  return AXIS_PERMUTATIONS.map(p => necklace(relabel(word, p))).reduce(
    (best, w) => (w < best ? w : best),
  )
}

// THEOREM B, checked exhaustively. A turn of the husk acts on a word by permuting its letters (a 3-fold turn about
// a body diagonal cycles x -> y -> z, a 4-fold turn about an axis swaps the other two; the spin turns along, so each
// letter's stream is carried to a stream). A schedule is COVARIANT under the turn when the permuted word is the same
// period, up to its origin (a rotation) and, allowing time reversal, its direction (a reflection). The rotations and
// reflections of a period of N beats form the dihedral group D_N, in which an element of order 3 is a rotation by N/3,
// so a schedule covariant under a 3-fold turn has N = 0 mod 3, C^N = 1, and no rest gap: it is MASSLESS.
export type CovarianceCount = {
  length: number
  words: number
  withStreams: number
  covariantThreeFold: number
  covariantAllTurns: number
  covariantMassive: number
}

export function covarianceCensus(maxLength: number): CovarianceCount[] {
  const out: CovarianceCount[] = []
  const letters = ['0', 'x', 'y', 'z']
  const cycle = (w: string): string => relabel(w, ['y', 'z', 'x'])
  const swap = (w: string): string => relabel(w, ['y', 'x', 'z'])

  for (let length = 1; length <= maxLength; length++) {
    let withStreams = 0
    let covariantThreeFold = 0
    let covariantAllTurns = 0
    let covariantMassive = 0

    const total = 4 ** length

    for (let code = 0; code < total; code++) {
      let w = ''

      for (
        let k = 0, c = code;
        k < length;
        k++, c = Math.floor(c / 4)
      ) {
        w += letters[c % 4]
      }

      if (!/[xyz]/.test(w)) {
        continue
      }

      withStreams++

      const doubled = w + w
      const reversed = [...w].reverse().join('')
      const doubledReversed = reversed + reversed
      const inDihedral = (v: string): boolean =>
        doubled.includes(v) || doubledReversed.includes(v)

      if (inDihedral(cycle(w))) {
        covariantThreeFold++
        covariantMassive += length % 3 === 0 ? 0 : 1

        if (inDihedral(swap(w))) {
          covariantAllTurns++
        }
      }
    }

    out.push({
      length,
      words: total,
      withStreams,
      covariantThreeFold,
      covariantAllTurns,
      covariantMassive,
    })
  }

  return out
}

// THE WORD CENSUS, exhaustive over beats. Every word of N beats over {filler, x, y, z} for each massive N up to
// maxLength (N != 0 mod 3), with an even number of fillers (depth pairs), whose first beat is an x stream: every
// period is a rotation and a husk-turn relabeling of one of these, so every class is reached. A word is kept when it
// is isotropic in its kinetic term (a_x = a_y = a_z != 0, every c = 0) AND in its g (|z| equal in the three planes).
// The kept words are reported by class, with g^2 and whether the class is time-reversal symmetric.
export type IsotropicClass = {
  length: number
  word: string
  g2: string
  timeSymmetric: boolean
  labeledPalindrome: boolean
  orderingFree: boolean
}

export type WordCensus = {
  maxLength: number
  examined: number
  massiveEven: number
  isotropic: number
  classes: IsotropicClass[]
}

export function wordCensus(maxLength: number): WordCensus {
  const letters = new Int8Array(maxLength)
  const position = [
    new Int32Array(maxLength),
    new Int32Array(maxLength),
    new Int32Array(maxLength),
  ]
  const count = new Int32Array(3)
  const seen = new Map<string, IsotropicClass>()

  let examined = 0
  let massiveEven = 0
  let isotropic = 0

  const axisA = (p: number, eps: number): number => {
    const pos = position[p] as Int32Array
    const k = count[p]!
    const n = [0, 0, 0]

    let same = 0

    for (let l = 0; l < k; l++) {
      n[mod3(pos[l]!)]! += 1

      for (let j = 0; j < l; j++) {
        same += M[mod3(pos[l]! - pos[j]!)]!
      }
    }

    const [n0, n1, n2] = n as [number, number, number]

    return (
      eps *
        (n0 * n0 + n1 * n1 + n2 * n2 - n0 * n1 - n1 * n2 - n2 * n0) +
      3 * same
    )
  }

  // c and z of the plane (p, q), p the x role
  const cross = (
    p: number,
    q: number,
    eps: number,
  ): [number, number] => {
    const pp = position[p] as Int32Array
    const qq = position[q] as Int32Array

    let pSum = 0
    let rr = 0
    let rab = 0
    let rba = 0
    let mc = 0

    for (let i = 0; i < count[p]!; i++) {
      for (let j = 0; j < count[q]!; j++) {
        const np = pp[i]!
        const nq = qq[j]!
        const d = mod3(np - nq)

        pSum += M[d]!
        rr += R[d]!

        if (np > nq) {
          rab += R[d]!
          mc += M[d]!
        } else {
          rba += R[mod3(nq - np)]!
          mc += M[mod3(nq - np)]!
        }
      }
    }

    return [-eps * pSum + rab - rba, -eps * rr - 3 * mc]
  }

  for (let length = 1; length <= maxLength; length++) {
    const eps = epsilonOf(length)

    if (eps === 0) {
      continue
    }

    const total = 4 ** (length - 1)

    for (let code = 0; code < total; code++) {
      letters[0] = 1

      let fillers = 0

      for (let k = 1, c = code; k < length; k++, c >>= 2) {
        letters[k] = c & 3
        fillers += letters[k] === 0 ? 1 : 0
      }

      examined++

      if (fillers % 2 !== 0) {
        continue
      }

      massiveEven++
      count.fill(0)

      for (let k = 0; k < length; k++) {
        const a = letters[k]! - 1

        if (a >= 0) {
          ;(position[a] as Int32Array)[count[a]!] = k + 1
          count[a] = count[a]! + 1
        }
      }

      if (count[1] === 0 || count[2] === 0) {
        continue
      }

      const ax = axisA(0, eps)

      if (ax === 0 || axisA(1, eps) !== ax || axisA(2, eps) !== ax) {
        continue
      }

      const [cxy, zxy] = cross(0, 1, eps)

      if (cxy !== 0) {
        continue
      }

      const [cyz, zyz] = cross(1, 2, eps)
      const [czx, zzx] = cross(2, 0, eps)

      if (
        cyz !== 0 ||
        czx !== 0 ||
        Math.abs(zxy) !== Math.abs(zyz) ||
        Math.abs(zyz) !== Math.abs(zzx)
      ) {
        continue
      }

      isotropic++

      const word = Array.from(
        letters.subarray(0, length),
        v => '0xyz'[v]!,
      ).join('')
      const key = turnClass(word)

      if (!seen.has(key)) {
        const reading = readWord(word)
        const g2 = gSquared(reading.planes[0]!)

        seen.set(key, {
          length,
          word: key,
          g2: g2 ? `${g2[0]}/${g2[1]}` : 'saddle',
          timeSymmetric: timeSymmetric(word),
          labeledPalindrome: rotations(word).some(
            w => readWord(w).labeledPalindrome,
          ),
          orderingFree: rotations(word).some(
            w => readWord(w).orderingFree,
          ),
        })
      }
    }
  }

  return {
    maxLength,
    examined,
    massiveEven,
    isotropic,
    classes: [...seen.values()].sort(
      (p, q) => p.length - q.length || (p.word < q.word ? -1 : 1),
    ),
  }
}

// THE SCHEDULE CENSUS. Every stream sequence of r streams (axis and frame each, 9^r of them, all three axes present)
// at its shortest realization: first stream at beat 1, 2 or 3 by its frame, each next stream 1, 2 or 3 beats later
// by its frame difference, the period closed at the least N with the asked mass sign (N = 1 mod 3 for eps +1, 2 for
// eps -1). The husk realization fills the non-stream beats with depth pairs, which return every column only in
// pairs, so N - r must be even; when it is odd the period takes three more fillers (same frames, same invariants).
export type GSquared = {
  value: string
  count: number
  shortest: number
}

// one exact g^2 among the fully isotropic words: how many, the shortest even-filler period, and how many of them are
// time-reversal symmetric (the period's reverse is the same period), labeled palindromes, or free of the ordering term,
// with the husk-turn classes at the shortest period, each marked T when it is time-reversal symmetric
export type IsotropicGroup = {
  value: string
  count: number
  shortest: number
  timeSymmetric: number
  palindromes: number
  orderingFree: number
  classes: string[]
}

// a period is time-reversal symmetric when its reverse is one of its rotations: the time reversal i sigma_y K takes
// every Dirac beat to its inverse, so the reversed schedule runs the period backward (depth pairs reverse with their
// up and down exchanged, which a pair of fillers absorbs)
export function timeSymmetric(word: string): boolean {
  const reversed = [...word].reverse().join('')

  return (word + word).includes(reversed)
}

export type ScheduleCensus = {
  maxStreams: number
  sequences: number
  readings: number
  labeledPalindromes: number
  // theorem A: palindromes whose ordering term does not vanish, and palindrome bowl planes with g != 2 (both must be 0)
  palindromeOrderingViolations: number
  palindromeBowlPlanes: number
  palindromeNonDiracBowls: number
  orderingFreeNotPalindrome: number
  isotropic: number
  isotropicDirac: number
  isotropicNonDirac: number
  isotropicDiracOrderingNonzero: number
  isotropicDiracNotPalindrome: number
  // the shortest even-filler period of each class
  shortestIsotropicDirac: number
  shortestIsotropicNonDirac: number
  shortestIsotropicPalindrome: number
  shortestIsotropicDiracNotPalindrome: number
  // g^2 of isotropic words that are not Dirac, per exact value
  isotropicGSquared: GSquared[]
  // every isotropic word by its three planes' g^2 (sorted), so an isotropic g reads as three equal values
  isotropicTriples: GSquared[]
  // the words isotropic in their kinetic term AND their g, grouped by g^2
  isotropicG: IsotropicGroup[]
  // the words isotropic in their kinetic term that are time-reversal symmetric, by their three planes' g^2
  timeSymmetricTriples: GSquared[]
  // the husk-turn classes of the isotropic Dirac words at the shortest period, and of the isotropic palindromes there
  shortestDiracClasses: string[]
  shortestPalindromeClasses: string[]
}

const GAP = [3, 1, 2]

// the beat word: fillers everywhere, stream j at beat[j] (moved `pad` later when j >= at, so the pad sits before
// stream `at`; at = count puts it at the end, where the period already holds it)
function beatWordOf(
  axis: Int8Array,
  beat: Int32Array,
  count: number,
  total: number,
  pad: number,
  at: number,
): string {
  const chars: string[] = Array.from({ length: total }, () => '0')

  for (let j = 0; j < count; j++) {
    const position = beat[j]! + (at >= 0 && j >= at ? pad : 0)

    chars[position - 1] = 'xyz'[axis[j]!]!
  }

  return chars.join('')
}

export function scheduleCensus(maxStreams: number): ScheduleCensus {
  const axis = new Int8Array(maxStreams)
  const frame = new Int8Array(maxStreams)
  const beat = new Int32Array(maxStreams)
  const out: ScheduleCensus = {
    maxStreams,
    sequences: 0,
    readings: 0,
    labeledPalindromes: 0,
    palindromeOrderingViolations: 0,
    palindromeBowlPlanes: 0,
    palindromeNonDiracBowls: 0,
    orderingFreeNotPalindrome: 0,
    isotropic: 0,
    isotropicDirac: 0,
    isotropicNonDirac: 0,
    isotropicDiracOrderingNonzero: 0,
    isotropicDiracNotPalindrome: 0,
    shortestIsotropicDirac: Infinity,
    shortestIsotropicNonDirac: Infinity,
    shortestIsotropicPalindrome: Infinity,
    shortestIsotropicDiracNotPalindrome: Infinity,
    isotropicGSquared: [],
    isotropicTriples: [],
    isotropicG: [],
    timeSymmetricTriples: [],
    shortestDiracClasses: [],
    shortestPalindromeClasses: [],
  }
  const gValues = new Map<string, GSquared>()
  const triples = new Map<string, GSquared>()
  const symmetricTriples = new Map<string, GSquared>()
  const groups = new Map<
    string,
    Omit<IsotropicGroup, 'classes'> & {
      byLength: Map<number, Set<string>>
    }
  >()
  // candidate words for the shortest classes, keyed by period
  const diracWords = new Map<number, Set<string>>()
  const palindromeWords = new Map<number, Set<string>>()

  const remember = (
    store: Map<number, Set<string>>,
    total: number,
    words: string[],
  ): void => {
    const set = store.get(total) ?? new Set<string>()

    words.forEach(w => set.add(turnClass(w)))
    store.set(total, set)
  }

  for (let r = 3; r <= maxStreams; r++) {
    const count = 9 ** r

    for (let code = 0; code < count; code++) {
      let present = 0

      for (let j = 0, c = code; j < r; j++, c = Math.floor(c / 9)) {
        axis[j] = c % 3
        frame[j] = Math.floor(c / 3) % 3
        present |= 1 << axis[j]!
      }

      if (present !== 7) {
        continue
      }

      out.sequences++
      beat[0] = frame[0] === 0 ? 3 : frame[0]!

      for (let j = 1; j < r; j++) {
        beat[j] = beat[j - 1]! + GAP[mod3(frame[j]! - frame[j - 1]!)]!
      }

      const last = beat[r - 1]!

      for (const residue of [1, 2]) {
        let total = last + mod3(residue - last)
        let pad = 0

        if ((total - r) % 2 !== 0) {
          total += 3
          pad = 3
        }

        const reading = readStreams({ axis, beat, count: r, total })

        out.readings++

        if (reading.labeledPalindrome) {
          out.labeledPalindromes++
          out.palindromeOrderingViolations += reading.orderingFree
            ? 0
            : 1

          for (const v of reading.planes) {
            if (isBowl(v)) {
              out.palindromeBowlPlanes++
              out.palindromeNonDiracBowls += isDirac(v) ? 0 : 1
            }
          }
        } else if (reading.orderingFree) {
          out.orderingFreeNotPalindrome++
        }

        if (!reading.isotropic) {
          continue
        }

        out.isotropic++

        const triple = reading.planes
          .map(v => {
            const g2 = gSquared(v)

            return g2 ? `${g2[0]}/${g2[1]}` : 'saddle'
          })
          .sort()
          .join(' ')
        const tripleEntry = triples.get(triple) ?? {
          value: triple,
          count: 0,
          shortest: Infinity,
        }

        tripleEntry.count++
        tripleEntry.shortest = Math.min(tripleEntry.shortest, total)
        triples.set(triple, tripleEntry)

        const words =
          pad === 0
            ? [beatWordOf(axis, beat, r, total, 0, -1)]
            : Array.from({ length: r + 1 }, (_, at) =>
                beatWordOf(axis, beat, r, total, pad, at),
              )

        if (words.some(timeSymmetric)) {
          const entry = symmetricTriples.get(triple) ?? {
            value: triple,
            count: 0,
            shortest: Infinity,
          }

          entry.count++
          entry.shortest = Math.min(entry.shortest, total)
          symmetricTriples.set(triple, entry)
        }

        if (reading.isotropicG) {
          const g2 = gSquared(reading.planes[0]!)
          const key = g2 ? `${g2[0]}/${g2[1]}` : 'saddle'
          const group = groups.get(key) ?? {
            value: key,
            count: 0,
            shortest: Infinity,
            timeSymmetric: 0,
            palindromes: 0,
            orderingFree: 0,
            byLength: new Map<number, Set<string>>(),
          }
          const symmetric = timeSymmetric(words[0]!)

          group.count++
          group.shortest = Math.min(group.shortest, total)
          group.timeSymmetric += symmetric ? 1 : 0
          group.palindromes += reading.labeledPalindrome ? 1 : 0
          group.orderingFree += reading.orderingFree ? 1 : 0

          const set = group.byLength.get(total) ?? new Set<string>()

          words.forEach(w =>
            set.add(`${turnClass(w)}${timeSymmetric(w) ? ' T' : ''}`),
          )
          group.byLength.set(total, set)
          groups.set(key, group)
        }

        if (reading.labeledPalindrome) {
          out.shortestIsotropicPalindrome = Math.min(
            out.shortestIsotropicPalindrome,
            total,
          )

          if (total <= 20) {
            remember(palindromeWords, total, words)
          }
        }

        if (reading.dirac) {
          out.isotropicDirac++
          out.isotropicDiracOrderingNonzero += reading.orderingFree
            ? 0
            : 1

          out.shortestIsotropicDirac = Math.min(
            out.shortestIsotropicDirac,
            total,
          )

          if (!reading.labeledPalindrome) {
            out.isotropicDiracNotPalindrome++
            out.shortestIsotropicDiracNotPalindrome = Math.min(
              out.shortestIsotropicDiracNotPalindrome,
              total,
            )
          }

          if (total <= 20) {
            remember(diracWords, total, words)
          }
        } else {
          out.isotropicNonDirac++
          out.shortestIsotropicNonDirac = Math.min(
            out.shortestIsotropicNonDirac,
            total,
          )

          for (const v of reading.planes) {
            const g2 = gSquared(v)
            const key = g2 ? `${g2[0]}/${g2[1]}` : 'saddle'
            const entry = gValues.get(key) ?? {
              value: key,
              count: 0,
              shortest: Infinity,
            }

            entry.count++
            entry.shortest = Math.min(entry.shortest, total)
            gValues.set(key, entry)
          }
        }
      }
    }
  }

  out.isotropicGSquared = [...gValues.values()].sort(
    (p, q) => p.shortest - q.shortest || q.count - p.count,
  )

  out.isotropicTriples = [...triples.values()].sort(
    (p, q) => p.shortest - q.shortest || q.count - p.count,
  )

  out.timeSymmetricTriples = [...symmetricTriples.values()].sort(
    (p, q) => p.shortest - q.shortest || q.count - p.count,
  )

  out.isotropicG = [...groups.values()]
    .map(({ byLength, ...rest }) => ({
      ...rest,
      classes: [...(byLength.get(rest.shortest) ?? [])].sort(),
    }))
    .sort((p, q) => p.shortest - q.shortest)

  out.shortestDiracClasses = [
    ...(diracWords.get(out.shortestIsotropicDirac) ?? []),
  ].sort()

  out.shortestPalindromeClasses = [
    ...(palindromeWords.get(out.shortestIsotropicPalindrome) ?? []),
  ].sort()

  return out
}
