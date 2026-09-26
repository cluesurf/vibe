// Two STAND-IN tokens on a husk line meeting through the fear beat, in exact Eisenstein integers (E-SPN-0069).
//
// A token is the fear walk (code/rule/fear-walk) with a role riding along: a slot (0 copied one dock forward,
// 1 copied one dock back) and a role (a qutrit; for a fear, an antirole). One beat, on a ring of L docks:
//   1. meeting: tokens on one dock in opposite slots (both slots of the dock's line held) meet through the fear
//      beat on their roles: like vibes U = P_sym + omega P_anti, a love and a fear V = 1 + (omega - 1) Phi Phi^+
//   2. coin: C = [[a, b], [b, a]], 2a = 1 + omega, 2b = 1 - omega, on each token's slots
//   3. stream: slot 0 copied forward, slot 1 back
// This is the one place the rule is written as the base must hold it: every amplitude is an Eisenstein integer
// (a + b omega, a and b bigints) over one common denominator. Each beat multiplies the denominator by 4 (two coins)
// and by 2 (U) or 3 (V): the meeting matrix is applied as 2U or 3V on meeting states and as 2 or 3 times the
// identity on every other state, so the denominator stays uniform. No angle, no square root, no rounding: a
// sum, a product and a relabeling. The beat's exact inverse (the adjoints in the reverse order) is given too.
//
// Index of an amplitude: ((x1 L + x2) 4 + 2 c1 + c2) 9 + 3 j1 + j2.

export type Kind = 'like' | 'unlike'

export type ExactPairState = {
  readonly ring: number
  readonly kind: Kind
  // numerators, re part a and omega part b, one per amplitude
  a: bigint[]
  b: bigint[]
  // the common denominator
  denominator: bigint
}

const STEP = [1, -1] as const

// (a + b w)(c + d w) = ac - bd + (ad + bc - bd) w
const mulA = (a: bigint, b: bigint, c: bigint, d: bigint): bigint => a * c - b * d
const mulB = (a: bigint, b: bigint, c: bigint, d: bigint): bigint => a * d + b * c - b * d

// 2C entries: diagonal 1 + omega, off-diagonal 1 - omega (and their conjugates for the inverse)
const COIN2: readonly (readonly [bigint, bigint])[][] = [
  [
    [1n, 1n],
    [1n, -1n],
  ],
  [
    [1n, -1n],
    [1n, 1n],
  ],
]

// conj(a + b w) = (a - b) - b w
const conjA = (a: bigint, b: bigint): bigint => a - b
const conjB = (b: bigint): bigint => -b

export function exactPairState(input: { ring: number; kind: Kind; start: readonly { index: number; a: bigint; b: bigint }[] }): ExactPairState {
  const size = input.ring * input.ring * 36
  const a: bigint[] = new Array<bigint>(size).fill(0n)
  const b: bigint[] = new Array<bigint>(size).fill(0n)

  for (const s of input.start) {
    a[s.index] = s.a
    b[s.index] = s.b
  }

  return { ring: input.ring, kind: input.kind, a, b, denominator: 1n }
}

export const pairIndex = (ring: number, x1: number, x2: number, c1: number, c2: number, j1: number, j2: number): number => ((x1 * ring + x2) * 4 + 2 * c1 + c2) * 9 + 3 * j1 + j2

// the meeting on the 9 role amplitudes of one meeting state, scaled (2U or 3V), or its adjoint
function meetRoles(kind: Kind, a: bigint[], b: bigint[], base: number, adjoint: boolean): void {
  const ra = a.slice(base, base + 9)
  const rb = b.slice(base, base + 9)

  if (kind === 'like') {
    // 2U |ij> = (1 + w)|ij> + (1 - w)|ji>; the adjoint uses the conjugates (1 + w^2) = -w and (1 - w^2)
    const d: [bigint, bigint] = adjoint ? [conjA(1n, 1n), conjB(1n)] : [1n, 1n]
    const o: [bigint, bigint] = adjoint ? [conjA(1n, -1n), conjB(-1n)] : [1n, -1n]

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const p = 3 * i + j
        const q = 3 * j + i
        const x = ra[p] as bigint
        const y = rb[p] as bigint
        const u = ra[q] as bigint
        const v = rb[q] as bigint

        a[base + p] = mulA(d[0], d[1], x, y) + mulA(o[0], o[1], u, v)
        b[base + p] = mulB(d[0], d[1], x, y) + mulB(o[0], o[1], u, v)
      }
    }

    return
  }

  // 3V = 3 + (w - 1) J, J the all-ones matrix on the three |jj>; the adjoint uses conj(w - 1) = w^2 - 1 = -2 - w
  const f: [bigint, bigint] = adjoint ? [-2n, -1n] : [-1n, 1n]
  let sa = 0n
  let sb = 0n

  for (let j = 0; j < 3; j++) {
    sa += ra[4 * j] as bigint
    sb += rb[4 * j] as bigint
  }

  for (let p = 0; p < 9; p++) {
    a[base + p] = 3n * (ra[p] as bigint)
    b[base + p] = 3n * (rb[p] as bigint)
  }

  for (let j = 0; j < 3; j++) {
    a[base + 4 * j] = (a[base + 4 * j] as bigint) + mulA(f[0], f[1], sa, sb)
    b[base + 4 * j] = (b[base + 4 * j] as bigint) + mulB(f[0], f[1], sa, sb)
  }
}

const scaleOf = (kind: Kind): bigint => (kind === 'like' ? 2n : 3n)

// the meeting piece on the whole state (meeting states get 2U or 3V, every other state 2 or 3 times itself)
function meetingPiece(s: ExactPairState, adjoint: boolean): void {
  const L = s.ring
  const a = s.a as bigint[]
  const b = s.b as bigint[]
  const scale = scaleOf(s.kind)

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      for (let c = 0; c < 4; c++) {
        const base = pairIndex(L, x1, x2, c >> 1, c & 1, 0, 0)

        if (x1 === x2 && c >> 1 !== (c & 1)) meetRoles(s.kind, a, b, base, adjoint)
        else
          for (let p = 0; p < 9; p++) {
            a[base + p] = scale * (a[base + p] as bigint)
            b[base + p] = scale * (b[base + p] as bigint)
          }
      }
    }
  }
}

// 2C on each token's slots (or the adjoint, the entrywise conjugate since 2C is symmetric)
function coinPiece(s: ExactPairState, adjoint: boolean): void {
  const L = s.ring
  const a = s.a as bigint[]
  const b = s.b as bigint[]
  const coin = COIN2.map(row => row.map(([x, y]) => (adjoint ? ([conjA(x, y), conjB(y)] as const) : ([x, y] as const))))

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      for (let r = 0; r < 9; r++) {
        const at = (c: number): number => pairIndex(L, x1, x2, c >> 1, c & 1, 0, 0) + r
        const va = [0, 1, 2, 3].map(c => a[at(c)] as bigint)
        const vb = [0, 1, 2, 3].map(c => b[at(c)] as bigint)

        for (let c = 0; c < 4; c++) {
          const c1 = c >> 1
          const c2 = c & 1
          let ta = 0n
          let tb = 0n

          for (let d = 0; d < 4; d++) {
            const d1 = d >> 1
            const d2 = d & 1
            const [p, q] = coin[c1]![d1]!
            const [u, v] = coin[c2]![d2]!
            // (p + q w)(u + v w)
            const ea = mulA(p, q, u, v)
            const eb = mulB(p, q, u, v)

            ta += mulA(ea, eb, va[d] as bigint, vb[d] as bigint)
            tb += mulB(ea, eb, va[d] as bigint, vb[d] as bigint)
          }

          a[at(c)] = ta
          b[at(c)] = tb
        }
      }
    }
  }
}

// the stream (or its inverse): slot 0 forward, slot 1 back
function streamPiece(s: ExactPairState, inverse: boolean): void {
  const L = s.ring
  const a = s.a as bigint[]
  const b = s.b as bigint[]
  const na: bigint[] = new Array<bigint>(a.length).fill(0n)
  const nb: bigint[] = new Array<bigint>(a.length).fill(0n)
  const sign = inverse ? -1 : 1

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      for (let c = 0; c < 4; c++) {
        const c1 = c >> 1
        const c2 = c & 1
        const y1 = (((x1 + sign * STEP[c1]) % L) + L) % L
        const y2 = (((x2 + sign * STEP[c2]) % L) + L) % L
        const from = pairIndex(L, x1, x2, c1, c2, 0, 0)
        const to = pairIndex(L, y1, y2, c1, c2, 0, 0)

        for (let r = 0; r < 9; r++) {
          na[to + r] = a[from + r] as bigint
          nb[to + r] = b[from + r] as bigint
        }
      }
    }
  }

  s.a = na
  s.b = nb
}

// one beat forward: meeting, coin, stream; the denominator grows by 4 x (2 or 3)
export function exactPairBeat(s: ExactPairState): void {
  meetingPiece(s, false)
  coinPiece(s, false)
  streamPiece(s, false)
  s.denominator *= 4n * scaleOf(s.kind)
}

// the exact inverse: unstream, adjoint coin, adjoint meeting; the denominator grows by the same factor, so a beat
// and its inverse return the start times the square of the factor
export function exactPairBeatBack(s: ExactPairState): void {
  streamPiece(s, true)
  coinPiece(s, true)
  meetingPiece(s, true)
  s.denominator *= 4n * scaleOf(s.kind)
}

// sum of the norms of the numerators, N(a + b w) = a^2 - ab + b^2: unitarity says it equals denominator^2 times
// the start's
export function exactNormSum(s: ExactPairState): bigint {
  let total = 0n

  for (let i = 0; i < s.a.length; i++) {
    const x = s.a[i] as bigint
    const y = s.b[i] as bigint

    total += x * x - x * y + y * y
  }

  return total
}
