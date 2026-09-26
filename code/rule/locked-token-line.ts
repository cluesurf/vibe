// Two LOCKED STAND-IN tokens on a husk line, in exact Eisenstein integers (E-SPN-0072, E-SPN-0074).
//
// E-SPN-0066: a token that moves covariantly lives in its role's spinor doublet, and the role's scalar line cannot
// be streamed. So the token's slot IS its doublet component: the doublet vector e0 (= |0>) is copied one dock
// forward, e1 (= (|1> + |2>) / sqrt 2) one dock back, and the line o (= (|1> - |2>) / sqrt 2) is not copied at all
// (no covariant stream copies it; a love or fear on the line stays on its dock). The rule works in the basis
// (e0, e1, o), labels 0, 1, 2: that basis is a real orthogonal change of the role basis, so the fear beat keeps its
// form there (U = P_sym + omega P_anti commutes with O (x) O, and Phi = sum_k |k k> / sqrt 3 is the same in any real
// orthonormal basis), and every number the rule uses is in Z[omega][1/6]. The sqrt 2 lives only in the embedding,
// which is measurement.
//
// A fear holds an antirole, the conjugate. Its stream generator must be covariant under conj(rho), which allows
// conj(sigma_a) or -conj(sigma_a):
//   'C'       the fear runs the love's rule in its own (conjugate) coordinates: label 0 forward, 1 back
//   'Cprime'  the other covariant sign: label 1 forward, 0 back
// 'C' adds no choice beyond the conjugation that defines an antirole everywhere else, so it is the primary rule;
// 'Cprime' is the variant.
//
// One beat on a ring of L docks:
//   0. (optional) the phase string: the amplitude times omega^span, span the pair's ring distance (one center flux
//      unit per link between them, read as a phase)
//   1. meeting of the two tokens on one dock:
//        like vibes  2U on the 9 role pairs (on exchange-antisymmetric states, the only ones two identical fermions
//                    hold on one dock, this is 2 omega)
//        a love and a fear, 'knit'  the knit's meeting, on the opposite-slot states only; under 'C' those states
//                    are orthogonal to Phi, so V is 1 there and the meeting is the identity (scale 1); under
//                    'Cprime' the opposite-slot states are not closed under V, and 'knit' is refused
//        a love and a fear, 'dock'  3V on all 9 role pairs whenever the two share a dock
//   2. coin: 2C on each token's (0, 1) labels, 2C = [[1 + omega, 1 - omega], [1 - omega, 1 + omega]], and 2 on label 2
//   3. stream: each label copied by its step; with a wall S (the paid string with a store of S units, E-FRC-0133's
//      bounce): a joint copy that would put the pair more than S apart is not made, both tokens stay and their
//      slots flip (0 <-> 1, 2 stays), which is a permutation of the allowed configurations
// Every piece multiplies by a uniform integer, so the common denominator grows by 4 x (2, 3 or 1) per beat.
//
// Index: ((x1 L + x2) 9 + 3 j1 + j2).

export type Vibe = 'love' | 'fear'
export type Convention = 'C' | 'Cprime'
export type UnlikeMeeting = 'knit' | 'dock'

export type LockedPairOptions = {
  readonly ring: number
  readonly kinds: readonly [Vibe, Vibe]
  readonly convention: Convention
  readonly unlike: UnlikeMeeting
  // no meeting at all (the control)
  readonly meet?: boolean
  readonly wall?: number
  readonly phaseString?: boolean
}

export type LockedPairState = LockedPairOptions & { a: bigint[]; b: bigint[]; denominator: bigint }

// the step of each label for a vibe under a convention
export function stepTable(kind: Vibe, convention: Convention): readonly [number, number, number] {
  if (kind === 'fear' && convention === 'Cprime') return [-1, 1, 0]

  return [1, -1, 0]
}

export const lockedIndex = (ring: number, x1: number, x2: number, j1: number, j2: number): number => (x1 * ring + x2) * 9 + 3 * j1 + j2

// (a + b w)(c + d w) = ac - bd + (ad + bc - bd) w
const mulA = (a: bigint, b: bigint, c: bigint, d: bigint): bigint => a * c - b * d
const mulB = (a: bigint, b: bigint, c: bigint, d: bigint): bigint => a * d + b * c - b * d
const conjA = (a: bigint, b: bigint): bigint => a - b
const conjB = (b: bigint): bigint => -b

export const ringDistance = (L: number, x1: number, x2: number): number => {
  const d = Math.abs(x1 - x2) % L

  return Math.min(d, L - d)
}

export function lockedPairState(options: LockedPairOptions, start: readonly { index: number; a: bigint; b: bigint }[]): LockedPairState {
  const size = options.ring * options.ring * 9
  const a = new Array<bigint>(size).fill(0n)
  const b = new Array<bigint>(size).fill(0n)

  for (const s of start) {
    a[s.index] = s.a
    b[s.index] = s.b
  }

  if (options.kinds[0] !== options.kinds[1] && options.unlike === 'knit' && options.convention === 'Cprime') throw new Error('the knit meeting is not closed under V with the Cprime convention')

  return { ...options, a, b, denominator: 1n }
}

const meetingScale = (s: LockedPairState): bigint => {
  if (s.meet === false) return 1n
  if (s.kinds[0] === s.kinds[1]) return 2n

  return s.unlike === 'knit' ? 1n : 3n
}

// omega^k times (a + b w)
function rotate(a: bigint, b: bigint, k: number): [bigint, bigint] {
  let x = a
  let y = b

  for (let t = 0; t < ((k % 3) + 3) % 3; t++) {
    const nx = -y
    const ny = x - y

    x = nx
    y = ny
  }

  return [x, y]
}

function phasePiece(s: LockedPairState, adjoint: boolean): void {
  if (!s.phaseString) return

  const L = s.ring

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      const k = (adjoint ? -1 : 1) * ringDistance(L, x1, x2)

      for (let r = 0; r < 9; r++) {
        const i = lockedIndex(L, x1, x2, 0, 0) + r
        const [x, y] = rotate(s.a[i] as bigint, s.b[i] as bigint, k)

        s.a[i] = x
        s.b[i] = y
      }
    }
  }
}

function meetingPiece(s: LockedPairState, adjoint: boolean): void {
  const L = s.ring
  const scale = meetingScale(s)
  const like = s.kinds[0] === s.kinds[1]
  const identity = s.meet === false || (!like && s.unlike === 'knit')

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      const base = lockedIndex(L, x1, x2, 0, 0)

      if (x1 !== x2 || identity) {
        if (scale !== 1n) {
          for (let p = 0; p < 9; p++) {
            s.a[base + p] = scale * (s.a[base + p] as bigint)
            s.b[base + p] = scale * (s.b[base + p] as bigint)
          }
        }

        continue
      }

      const ra = s.a.slice(base, base + 9)
      const rb = s.b.slice(base, base + 9)

      if (like) {
        // 2U |ij> = (1 + w)|ij> + (1 - w)|ji>
        const d: [bigint, bigint] = adjoint ? [conjA(1n, 1n), conjB(1n)] : [1n, 1n]
        const o: [bigint, bigint] = adjoint ? [conjA(1n, -1n), conjB(-1n)] : [1n, -1n]

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const p = 3 * i + j
            const q = 3 * j + i

            s.a[base + p] = mulA(d[0], d[1], ra[p] as bigint, rb[p] as bigint) + mulA(o[0], o[1], ra[q] as bigint, rb[q] as bigint)
            s.b[base + p] = mulB(d[0], d[1], ra[p] as bigint, rb[p] as bigint) + mulB(o[0], o[1], ra[q] as bigint, rb[q] as bigint)
          }
        }

        continue
      }

      // 3V = 3 + (w - 1) J on the three |jj>
      const f: [bigint, bigint] = adjoint ? [-2n, -1n] : [-1n, 1n]
      let sa = 0n
      let sb = 0n

      for (let j = 0; j < 3; j++) {
        sa += ra[4 * j] as bigint
        sb += rb[4 * j] as bigint
      }

      for (let p = 0; p < 9; p++) {
        s.a[base + p] = 3n * (ra[p] as bigint)
        s.b[base + p] = 3n * (rb[p] as bigint)
      }

      for (let j = 0; j < 3; j++) {
        s.a[base + 4 * j] = (s.a[base + 4 * j] as bigint) + mulA(f[0], f[1], sa, sb)
        s.b[base + 4 * j] = (s.b[base + 4 * j] as bigint) + mulB(f[0], f[1], sa, sb)
      }
    }
  }
}

// 2C on labels 0, 1 of each token, 2 on label 2 (2C is symmetric, so its adjoint is the entrywise conjugate)
function coinPiece(s: LockedPairState, adjoint: boolean): void {
  const L = s.ring
  const diag: [bigint, bigint] = adjoint ? [conjA(1n, 1n), conjB(1n)] : [1n, 1n]
  const off: [bigint, bigint] = adjoint ? [conjA(1n, -1n), conjB(-1n)] : [1n, -1n]
  // the 3 x 3 scaled coin: entry (row, col)
  const entry = (row: number, col: number): [bigint, bigint] => {
    if (row === 2 || col === 2) return row === col ? [2n, 0n] : [0n, 0n]

    return row === col ? diag : off
  }

  for (let x = 0; x < L * L; x++) {
    const base = x * 9
    const va = s.a.slice(base, base + 9)
    const vb = s.b.slice(base, base + 9)

    for (let j1 = 0; j1 < 3; j1++) {
      for (let j2 = 0; j2 < 3; j2++) {
        let ta = 0n
        let tb = 0n

        for (let k1 = 0; k1 < 3; k1++) {
          const [p, q] = entry(j1, k1)

          if (p === 0n && q === 0n) continue

          for (let k2 = 0; k2 < 3; k2++) {
            const [u, v] = entry(j2, k2)

            if (u === 0n && v === 0n) continue

            const ea = mulA(p, q, u, v)
            const eb = mulB(p, q, u, v)

            ta += mulA(ea, eb, va[3 * k1 + k2] as bigint, vb[3 * k1 + k2] as bigint)
            tb += mulB(ea, eb, va[3 * k1 + k2] as bigint, vb[3 * k1 + k2] as bigint)
          }
        }

        s.a[base + 3 * j1 + j2] = ta
        s.b[base + 3 * j1 + j2] = tb
      }
    }
  }
}

const FLIP = [1, 0, 2] as const

// the stream as a permutation of (x1, x2, j1, j2), with the wall's bounce; its inverse is the inverse permutation
export function streamPermutation(options: LockedPairOptions): Int32Array {
  const L = options.ring
  const s1 = stepTable(options.kinds[0], options.convention)
  const s2 = stepTable(options.kinds[1], options.convention)
  const to = new Int32Array(L * L * 9).fill(-1)

  for (let x1 = 0; x1 < L; x1++) {
    for (let x2 = 0; x2 < L; x2++) {
      for (let j1 = 0; j1 < 3; j1++) {
        for (let j2 = 0; j2 < 3; j2++) {
          const y1 = (((x1 + (s1[j1] as number)) % L) + L) % L
          const y2 = (((x2 + (s2[j2] as number)) % L) + L) % L
          const from = lockedIndex(L, x1, x2, j1, j2)

          // with a wall, a configuration beyond it is not a state of the rule: it maps nowhere (its image would
          // collide with a bounce, and the rule is a permutation of the allowed configurations only)
          if (options.wall !== undefined && ringDistance(L, x1, x2) > options.wall) continue

          const blocked = options.wall !== undefined && ringDistance(L, y1, y2) > options.wall

          to[from] = blocked ? lockedIndex(L, x1, x2, FLIP[j1] as number, FLIP[j2] as number) : lockedIndex(L, y1, y2, j1, j2)
        }
      }
    }
  }

  return to
}

function streamPiece(s: LockedPairState, map: Int32Array, inverse: boolean): void {
  const na = new Array<bigint>(s.a.length).fill(0n)
  const nb = new Array<bigint>(s.a.length).fill(0n)

  for (let i = 0; i < map.length; i++) {
    const j = map[i] as number

    if (j < 0) continue

    if (inverse) {
      na[i] = s.a[j] as bigint
      nb[i] = s.b[j] as bigint
    } else {
      na[j] = s.a[i] as bigint
      nb[j] = s.b[i] as bigint
    }
  }

  s.a = na
  s.b = nb
}

// the meeting piece alone (its scale is not added to the denominator), for reading what one meeting does
export function lockedMeetingOnly(s: LockedPairState): void {
  meetingPiece(s, false)
}

export function lockedPairBeat(s: LockedPairState, map: Int32Array): void {
  phasePiece(s, false)
  meetingPiece(s, false)
  coinPiece(s, false)
  streamPiece(s, map, false)
  s.denominator *= 4n * meetingScale(s)
}

export function lockedPairBeatBack(s: LockedPairState, map: Int32Array): void {
  streamPiece(s, map, true)
  coinPiece(s, true)
  meetingPiece(s, true)
  phasePiece(s, true)
  s.denominator *= 4n * meetingScale(s)
}

// sum of N(numerator) = a^2 - ab + b^2 over every amplitude
export function lockedNormSum(s: LockedPairState): bigint {
  let total = 0n

  for (let i = 0; i < s.a.length; i++) {
    const x = s.a[i] as bigint
    const y = s.b[i] as bigint

    total += x * x - x * y + y * y
  }

  return total
}
