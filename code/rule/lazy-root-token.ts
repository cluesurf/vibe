// The LAZY ROOT TOKEN (E-MTR-0023 to 0025): a STAND-IN token on the husk whose copy is the light's own fraction,
// so its light speed is the photon's at every depth. Exact integers in Z[omega].
//
// WHY. The light's leapfrog copies a fraction of its field across a link each beat: 2 - 2 cos omega = kappa lambda,
// kappa = 2 / (2D + 1), and on the husk lambda -> L / 9 at long wavelength (L the husk Laplacian, whose 9 link
// directions weigh 2, 2, 2, 1, 1, 1, 1, 1, 1), so c^2 = 2 kappa / 3 = 12 / (9 (2D + 1)). A token that copies its
// WHOLE amplitude one dock per beat has a massless slope of exactly 1 per copy (E-MTR-0023's theorem), which no
// integer schedule turns into sqrt(4 / (3 (2D + 1))). This token copies the same fraction the light does.
//
// THE REGISTERS. A token is a relation held at a dock: its dock x on the husk torus Z_L^3 and its PORT p in
// 0 .. Q - 1, Q = 9 N, N = 2D + 1 (one column of N values per husk link direction, the columns the light's drift
// reads). Ports 0 .. 23 are the 24 D4 roots, each cast on the husk as its shadow s_r (drop the depth): an axis is
// cast by 2 roots each way, a face diagonal by 1. Ports 24 .. Q - 1 are SELF ports: they copy nowhere.
//
// ONE BEAT, W = S R:
//   R  the coin: the reflection about the column's zero-momentum state a = (1, .., 1) / sqrt Q, with a phase
//      e^(i phi) on a: R = -1 + (1 + e^(i phi)) |a><a|. Scaled by Q it is integer: Q R = (1 + e^(i phi)) J - Q.
//      phi = 0 (massless) and phi = 2 pi / 3 (1 + e^(i phi) = 1 + omega) are the two phases held here exactly.
//   S  the stream: the token at port r of dock x is copied to port -r of dock x + s_r (the other end of the same
//      link); a self port stays. S is a permutation and its own inverse. Nothing moves: a copy per beat.
// The inverse beat is R^dagger S, with Q R^dagger = conj(1 + e^(i phi)) J - Q.
//
// THE SPECTRUM (Szegedy's theorem, checked in E-MTR-0023): on the span of a and S a at each k the beat has
// eigenvalues e^(i phi / 2) e^(+- i E), cos E = cos(phi / 2) (1 - L(k) / Q), L(k) = sum_r (1 - cos k . s_r) the
// husk Laplacian; the other Q - 2 eigenvalues are +-1 (flat, a token that never leaves). So E^2 -> (12 / Q) k^2 at
// phi = 0: c^2 = 12 / (9 N) = 2 kappa / 3, the photon's, for every D. A token started in the coin state a has no
// weight on the flat bands.
//
// Index: dock (x + L (y + L z)) Q + p. Amplitudes a + b omega as two bigint arrays, with a common denominator.

export type LazyPhase = 'none' | 'omega'

export type LazySpec = {
  readonly side: number
  readonly depth: number
  readonly phase: LazyPhase
}

export type LazyState = {
  readonly spec: LazySpec
  a: bigint[]
  b: bigint[]
  denominator: bigint
}

// the 24 D4 roots +-e_i +-e_j (i < j) in integers
export const ROOTS: readonly (readonly number[])[] = (() => {
  const out: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const s of [1, -1]) {
        for (const t of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[i] = s
          r[j] = t
          out.push(r)
        }
      }
    }
  }

  return out
})()

export const OPPOSITE: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(s => s.every((x, i) => x === -(r[i] ?? 0))),
)

export const portCount = (depth: number): number => 9 * (2 * depth + 1)

const mod = (a: number, m: number): number => ((a % m) + m) % m

// (x + y omega)(u + v omega) with omega^2 = -1 - omega
const mulA = (x: bigint, y: bigint, u: bigint, v: bigint): bigint =>
  x * u - y * v
const mulB = (x: bigint, y: bigint, u: bigint, v: bigint): bigint =>
  x * v + y * u - y * v

// 1 + e^(i phi) as an Eisenstein integer, and its conjugate
function coinWeight(
  phase: LazyPhase,
  adjoint: boolean,
): [bigint, bigint] {
  if (phase === 'none') {
    return [2n, 0n]
  }

  // 1 + omega; its conjugate 1 + omega^2 = -omega
  return adjoint ? [0n, -1n] : [1n, 1n]
}

export function lazyState(
  spec: LazySpec,
  start: readonly {
    dock: readonly number[]
    port: number
    a: bigint
    b: bigint
  }[],
): LazyState {
  const Q = portCount(spec.depth)
  const size = spec.side ** 3 * Q
  const a = new Array<bigint>(size).fill(0n)
  const b = new Array<bigint>(size).fill(0n)

  for (const s of start) {
    const d =
      mod(s.dock[0] ?? 0, spec.side) +
      spec.side *
        (mod(s.dock[1] ?? 0, spec.side) +
          spec.side * mod(s.dock[2] ?? 0, spec.side))

    a[d * Q + s.port] = (a[d * Q + s.port] ?? 0n) + s.a
    b[d * Q + s.port] = (b[d * Q + s.port] ?? 0n) + s.b
  }

  return { spec, a, b, denominator: 1n }
}

function coin(s: LazyState, adjoint: boolean): void {
  const Q = portCount(s.spec.depth)
  const q = BigInt(Q)
  const [cu, cv] = coinWeight(s.spec.phase, adjoint)
  const docks = s.spec.side ** 3

  for (let d = 0; d < docks; d++) {
    let sa = 0n
    let sb = 0n

    for (let p = 0; p < Q; p++) {
      sa += s.a[d * Q + p]!
      sb += s.b[d * Q + p]!
    }

    const ta = mulA(cu, cv, sa, sb)
    const tb = mulB(cu, cv, sa, sb)

    for (let p = 0; p < Q; p++) {
      s.a[d * Q + p] = ta - q * s.a[d * Q + p]!
      s.b[d * Q + p] = tb - q * s.b[d * Q + p]!
    }
  }
}

// the stream as a permutation of indices (its own inverse)
export function lazyStreamMap(spec: LazySpec): Int32Array {
  const Q = portCount(spec.depth)
  const L = spec.side
  const to = new Int32Array(L ** 3 * Q)

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const d = x + L * (y + L * z)

        for (let p = 0; p < Q; p++) {
          if (p >= 24) {
            to[d * Q + p] = d * Q + p
            continue
          }

          const r = ROOTS[p]!
          const e =
            mod(x + r[0]!, L) +
            L * (mod(y + r[1]!, L) + L * mod(z + r[2]!, L))

          to[d * Q + p] = e * Q + OPPOSITE[p]!
        }
      }
    }
  }

  return to
}

function stream(s: LazyState, map: Int32Array): void {
  const na = new Array<bigint>(s.a.length)
  const nb = new Array<bigint>(s.b.length)

  for (let i = 0; i < map.length; i++) {
    na[map[i]!] = s.a[i]!
    nb[map[i]!] = s.b[i]!
  }

  s.a = na
  s.b = nb
}

export function lazyBeat(s: LazyState, map: Int32Array): void {
  coin(s, false)
  stream(s, map)
  s.denominator *= BigInt(portCount(s.spec.depth))
}

export function lazyBeatBack(s: LazyState, map: Int32Array): void {
  stream(s, map)
  coin(s, true)
  s.denominator *= BigInt(portCount(s.spec.depth))
}

// sum of N(a + b omega) = a^2 - ab + b^2
export function lazyNormSum(s: LazyState): bigint {
  let t = 0n

  for (let i = 0; i < s.a.length; i++) {
    const x = s.a[i]!
    const y = s.b[i]!

    t += x * x - x * y + y * y
  }

  return t
}
