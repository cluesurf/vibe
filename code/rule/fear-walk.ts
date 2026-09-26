// The fear walk: the cube-root swap phase on WHERE a lone vibe is, carried exactly in whole numbers.
//
// On one line of the committed rule a lone vibe beside calm hops to the other slot every beat, the pair
// table's (v, 0) -> (0, v), and then streams: the right slot one cell right, the left slot one cell left.
// The hop is the exchange of the line's two slots, so the one-third turn on it is the swap phase on the
// vibe's slot, U = a + b HOP with a = (1 + omega) / 2 and b = (1 - omega) / 2. At phi = pi it is the hop
// (the committed table, which pins a lone vibe between two cells), at phi = 0 it is no hop (the bind
// table, which lets it stream).
//
// Both 2 a = 1 + omega and 2 b = 1 - omega are Eisenstein integers, whole numbers m + n omega. So the weight
// of the vibe on each slot is a pair of whole numbers, the beat multiplies every weight by 2 and nothing
// is ever rounded: after t beats the weights are Eisenstein integers over 2^t, and the chance on a slot is
// |m + n omega|^2 / 4^t = (m^2 - m n + n^2) / 4^t, a whole number over 4^t. An Eisenstein integer is a signed
// count of the three cube roots 1, omega, omega^2, with 1 + omega + omega^2 = 0 a calm triple: this is a
// weight with three signs, not two. A real signed weight (a Wigner function, loves and fears) on position
// is what cannot be had with classical streaming, measured in E-QTM-0103.
//
// This is the one-vibe sector of a line, on a ring of cells with no vacuum: the committed rule's vacuum
// makes pairs from calm everywhere, so a lone vibe there is never alone (E-FND-0080).

export type Eisenstein = readonly [bigint, bigint]

// the walk's state: the weight on the right-moving and left-moving slot of each cell, over 2^t
export type WalkState = {
  readonly right: readonly Eisenstein[]
  readonly left: readonly Eisenstein[]
  readonly t: number
}

export const ZERO: Eisenstein = [0n, 0n]
// 2 a = 1 + omega, 2 b = 1 - omega, and their conjugates 1 + omega^2 = -omega, 1 - omega^2 = 2 + omega
export const TWO_A: Eisenstein = [1n, 1n]
export const TWO_B: Eisenstein = [1n, -1n]
export const TWO_A_BAR: Eisenstein = [0n, -1n]
export const TWO_B_BAR: Eisenstein = [2n, 1n]
export const TWO: Eisenstein = [2n, 0n]

export function times(p: Eisenstein, q: Eisenstein): Eisenstein {
  // (p0 + p1 w)(q0 + q1 w) = p0 q0 - p1 q1 + (p0 q1 + p1 q0 - p1 q1) w, since w^2 = -1 - w
  return [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0] - p[1] * q[1]]
}

export function plus(p: Eisenstein, q: Eisenstein): Eisenstein {
  return [p[0] + q[0], p[1] + q[1]]
}

export function norm(p: Eisenstein): bigint {
  return p[0] * p[0] - p[0] * p[1] + p[1] * p[1]
}

// multiply by omega^k
export function turn(p: Eisenstein, k: number): Eisenstein {
  let out = p

  for (let i = 0; i < ((k % 3) + 3) % 3; i++) {
    out = [-out[1], out[0] - out[1]]
  }

  return out
}

// a coin on one cell, as whole numbers over 2: [keep, reverse]
export type Coin = readonly [Eisenstein, Eisenstein]

export const FEAR_COIN: Coin = [TWO_A, TWO_B]
export const FEAR_COIN_BACK: Coin = [TWO_A_BAR, TWO_B_BAR]
export const HOP_COIN: Coin = [ZERO, TWO]
export const STAY_COIN: Coin = [TWO, ZERO]

// one beat on a ring: the coin of each cell on its two slots, then stream
export function walkBeat(state: WalkState, coinAt: (cell: number) => Coin): WalkState {
  const n = state.right.length
  const right: Eisenstein[] = new Array<Eisenstein>(n).fill(ZERO)
  const left: Eisenstein[] = new Array<Eisenstein>(n).fill(ZERO)

  for (let x = 0; x < n; x++) {
    const [keep, reverse] = coinAt(x)
    const r = state.right[x] ?? ZERO
    const l = state.left[x] ?? ZERO

    right[(x + 1) % n] = plus(times(keep, r), times(reverse, l))
    left[(x - 1 + n) % n] = plus(times(reverse, r), times(keep, l))
  }

  return { right, left, t: state.t + 1 }
}

// the exact inverse of walkBeat for the conjugate coin: unstream, then the coin's inverse (which is its
// conjugate, the coin being unitary up to its factor 2); the weights come back multiplied by 4
export function walkBeatBack(state: WalkState, coinAt: (cell: number) => Coin): WalkState {
  const n = state.right.length
  const right: Eisenstein[] = new Array<Eisenstein>(n).fill(ZERO)
  const left: Eisenstein[] = new Array<Eisenstein>(n).fill(ZERO)

  for (let x = 0; x < n; x++) {
    const [keep, reverse] = coinAt(x)
    const r = state.right[(x + 1) % n] ?? ZERO
    const l = state.left[(x - 1 + n) % n] ?? ZERO

    right[x] = plus(times(keep, r), times(reverse, l))
    left[x] = plus(times(reverse, r), times(keep, l))
  }

  return { right, left, t: state.t + 1 }
}

export function walkStart(cells: number, cell: number, rightMoving: boolean): WalkState {
  const one: Eisenstein = [1n, 0n]

  return {
    right: Array.from({ length: cells }, (_, x) => (x === cell && rightMoving ? one : ZERO)),
    left: Array.from({ length: cells }, (_, x) => (x === cell && !rightMoving ? one : ZERO)),
    t: 0,
  }
}

// the chance on each cell, as whole numbers over 4^t
export function walkChances(state: WalkState): bigint[] {
  return state.right.map((r, x) => norm(r) + norm(state.left[x] ?? ZERO))
}

// Role-phased counts (E-QTM-0107). A weight a + b omega + c omega^2 with a, b, c whole numbers of at least 0
// counts vibes by role: a in take (phase 1), b in hold (omega), c in free (omega^2). One of each is a knot,
// 1 + omega + omega^2 = 0, and adds nothing. The canonical count holds no knot: min(a, b, c) = 0.
export type Counts = readonly [bigint, bigint, bigint]

export function countsOf(z: Eisenstein): Counts {
  // m + n omega = (m - c) + (n - c) omega + c (1 + omega + omega^2) with c chosen to make every count >= 0
  const [m, n] = z
  const c = [0n, -m, -n].reduce((x, y) => (y > x ? y : x), 0n)

  return [m + c, n + c, c]
}

export function valueOf(k: Counts): Eisenstein {
  // a + b omega + c (-1 - omega)
  return [k[0] - k[2], k[1] - k[2]]
}

export function removeKnots(k: Counts): { counts: Counts; knots: bigint } {
  const knots = [k[0], k[1], k[2]].reduce((x, y) => (y < x ? y : x))

  return { counts: [k[0] - knots, k[1] - knots, k[2] - knots], knots }
}

// times omega: take -> hold -> free -> take, a turn of the roles
export function rollRoles(k: Counts, times: number): Counts {
  let out = k

  for (let i = 0; i < ((times % 3) + 3) % 3; i++) {
    out = [out[2], out[0], out[1]]
  }

  return out
}

const addCounts = (...ks: Counts[]): Counts => [
  ks.reduce((s, k) => s + k[0], 0n),
  ks.reduce((s, k) => s + k[1], 0n),
  ks.reduce((s, k) => s + k[2], 0n),
]

// the four coin weights as additions of rolled counts, nothing subtracted:
// 2 a = 1 + omega, 2 b = 1 - omega = 2 + omega^2, conj(2 a) = 1 + omega^2, conj(2 b) = 2 + omega
export const COUNT_COINS = {
  keep: (k: Counts): Counts => addCounts(k, rollRoles(k, 1)),
  reverse: (k: Counts): Counts => addCounts(k, k, rollRoles(k, 2)),
  keepBack: (k: Counts): Counts => addCounts(k, rollRoles(k, 2)),
  reverseBack: (k: Counts): Counts => addCounts(k, k, rollRoles(k, 1)),
}

export type CountState = { readonly right: readonly Counts[]; readonly left: readonly Counts[] }

// one beat on counts: every contribution is an addition, then each slot drops its knots. Returns the
// knots dropped, which is where two contributions of opposite phase cancelled
export function countBeat(state: CountState, forward: boolean, dropKnots: boolean): { state: CountState; knots: bigint } {
  const n = state.right.length
  const zero: Counts = [0n, 0n, 0n]
  const right: Counts[] = new Array<Counts>(n).fill(zero)
  const left: Counts[] = new Array<Counts>(n).fill(zero)
  const keep = forward ? COUNT_COINS.keep : COUNT_COINS.keepBack
  const reverse = forward ? COUNT_COINS.reverse : COUNT_COINS.reverseBack
  let knots = 0n

  for (let x = 0; x < n; x++) {
    // forward: coin at x then stream; back: unstream then the conjugate coin
    const r = forward ? (state.right[x] ?? zero) : (state.right[(x + 1) % n] ?? zero)
    const l = forward ? (state.left[x] ?? zero) : (state.left[(x - 1 + n) % n] ?? zero)
    let outR = addCounts(keep(r), reverse(l))
    let outL = addCounts(reverse(r), keep(l))

    if (dropKnots) {
      const a = removeKnots(outR)
      const b = removeKnots(outL)

      outR = a.counts
      outL = b.counts
      knots += a.knots + b.knots
    }

    if (forward) {
      right[(x + 1) % n] = outR
      left[(x - 1 + n) % n] = outL
    } else {
      right[x] = outR
      left[x] = outL
    }
  }

  return { state: { right, left }, knots }
}

// the classical stand-in: the swap phase's chances without its phases, keep 1/4 and reverse 3/4, as whole
// numbers over 4^t
export type ChanceState = { readonly right: readonly bigint[]; readonly left: readonly bigint[] }

export function chanceBeat(state: ChanceState, keep: bigint, reverse: bigint): ChanceState {
  const n = state.right.length
  const right = new Array<bigint>(n).fill(0n)
  const left = new Array<bigint>(n).fill(0n)

  for (let x = 0; x < n; x++) {
    const r = state.right[x] ?? 0n
    const l = state.left[x] ?? 0n

    right[(x + 1) % n] = keep * r + reverse * l
    left[(x - 1 + n) % n] = reverse * r + keep * l
  }

  return { right, left }
}
