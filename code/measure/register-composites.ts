// TWO COMPOSITES OF TWO HOLES EACH, READ IN SITE SPACE (E-FND-0166). E-FND-0158 showed a two-member composite turns and
// exchanges as a boson kinematically. This module holds what a dynamical read of that needs, on four holes of the register
// rule in E-FND-0163's sorted store and on two holes in E-FND-0161's dense engine.
//
// THE COMPOSITE. Two holes on one site, both in the beat's sector: fiber indices 0 .. 3 of a half are the sector states
// S themselves, the same 192-vectors at every momentum (register-holes' frame), so a hole in sector state a at site x is
// exactly c+(x, a) = N^(-1/2) sum_q e^(-i q . x) c+(q, a), and a composite of internal state (a, b), a < b, is
// c+(x, a) c+(x, b). E-FND-0166 measures that the rule keeps such a pair on one site and the free rule does not.
//
// THE READ. With holes 1 and 2 at site R in sector states (a, b) and holes 3 and 4 at site 0 in (c, d), the amplitude is
// amp(R) = N^(-2) sum over momenta (sum 0) of e^(i (q1 + q2) . R) psi(q; a, b, c, d) = N^(-3/2) toSites(S)(R), where
// S(K) = sum over q1 + q2 = K of psi. At total momentum 0 the state is translation invariant, and swapping the two
// composites is the even permutation (13)(24), so for one internal state on both (a, b) = (c, d), amp(R) = amp(-R)
// exactly: the composites' relative wavefunction is even (L1). At a separation R* with R* = -R* on the torus (a fixed
// point of exchange) that is no constraint for an even function and forces 0 for an odd one.
//
// WHY THE FIXED POINTS SEPARATE THE STATISTICS (L1, the Hanbury Brown and Twiss counting). A state spread uniformly over
// the relative functions allowed puts, per site, twice the weight at a fixed point as at a non-fixed site for an even
// function (the basis (delta_R + delta_-R) / sqrt 2 spends half its weight on each site, delta_R* all on one), the same
// weight for a function with no symmetry (distinguishable composites, or two composites in orthogonal internal states),
// and none for an odd one (fermions). So the ratio of the fixed-point weight to the non-fixed weight at the same V,
// taken for equal internal states over the same ratio for disjoint ones, reads 2 for bosons, 1 for no statistics and 0
// for fermions, with the geometry's own bias cancelled by the disjoint channel (polarizers parallel and crossed).
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces.

import { lineScratch, toSites, type HoleEngine, type Holes } from '@/code/measure/register-holes'
import { newSorted, sortedNorm, type Sorted, type SortedEngine } from '@/code/measure/register-sorted-holes'
import { type Torus } from '@/code/measure/register-sea'

// the sites R != 0 with -R = R on the torus: the fixed points of exchanging two composites
export const fixedSites = (t: Torus): number[] =>
  t.sites.map((_, i) => i).filter(i => i !== t.origin && t.neg[i] === i)

// the four-hole state sum over X of c+(X + R0, a) c+(X + R0, b) c+(X, c) c+(X, d) |0>, total momentum 0, normalized:
// two contact composites of internal states (a, b) and (c, d) at separation R0, with every fiber a sector state
export function compositeStart(
  e: SortedEngine,
  t: Torus,
  R0: number,
  A: readonly [number, number],
  B: readonly [number, number],
): Sorted {
  if (e.n !== 4) {
    throw new Error('register-composites: two composites are four holes')
  }

  const F = e.frame.fourier
  const f = e.frame.fiber
  const L = t.L
  const y = t.sites[R0]!
  const b = [A[0], A[1], B[0], B[1]]
  const out = newSorted(e)
  // the phase -(q1 + q2) . R0 in units of 2 pi / L, from integer momenta
  const dot = (j: number): number => F.ints[j]!.reduce((x, k, m) => x + k * y[m]!, 0)

  for (let r = 0; r < e.rows; r++) {
    const m = e.mom.subarray(r * 4, r * 4 + 4)

    for (const pi of e.perms) {
      // the assignment: stored member k holds particle pi[k]; particles 0 and 1 form the composite at R0
      let c = 0
      let phase = 0
      let sign = 1

      for (let k = 0; k < 4; k++) {
        c = c * f + b[pi[k]!]!

        if (pi[k]! < 2) {
          phase += dot(m[k]!)
        }
      }

      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (pi[i]! > pi[j]!) {
            sign = -sign
          }
        }
      }

      const th = (-2 * Math.PI * (((phase % L) + L) % L)) / L

      out.re[r * e.block + c]! += sign * Math.cos(th)
      out.im[r * e.block + c]! += sign * Math.sin(th)
    }
  }

  const nrm = Math.sqrt(sortedNorm(e, out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! /= nrm
    out.im[k]! /= nrm
  }

  return out
}

export type Channel = { A: readonly [number, number]; B: readonly [number, number] }

// amp(R) for each channel, with holes 1 and 2 at R in A and holes 3 and 4 at 0 in B: { re, im } over the N sites
export function compositeAmplitudes(
  e: SortedEngine,
  s: Sorted,
  channels: readonly Channel[],
): { re: Float64Array; im: Float64Array }[] {
  if (e.n !== 4) {
    throw new Error('register-composites: two composites are four holes')
  }

  const F = e.frame.fourier
  const N = F.N
  const f = e.frame.fiber
  const tuples = N ** 3
  // for each channel and each stored permutation p, the fiber index of b o sigma_p
  const cOf = channels.map(ch => {
    const b = [ch.A[0], ch.A[1], ch.B[0], ch.B[1]]

    return Int32Array.from(e.perms, sigma => sigma.reduce((x, j) => x * f + b[j]!, 0))
  })
  const S = channels.map(() => ({ re: new Float64Array(N), im: new Float64Array(N) }))

  for (let T = 0; T < tuples; T++) {
    const q1 = Math.floor(T / (N * N))
    const q2 = Math.floor(T / N) % N
    const K = F.sum[q1 * N + q2]!
    const row = e.pair.rowOf[T]!
    const p = e.pair.permOf[T]!
    const sg = e.pair.psign[p]!

    for (let h = 0; h < channels.length; h++) {
      const at = row * e.block + cOf[h]![p]!

      S[h]!.re[K]! += sg * s.re[at]!
      S[h]!.im[K]! += sg * s.im[at]!
    }
  }

  const scratch = lineScratch(F)
  const k = N ** -1.5

  return S.map(x => {
    toSites(F, x.re, x.im, scratch)

    return { re: x.re.map(v => v * k), im: x.im.map(v => v * k) }
  })
}

// two holes at total momentum 0 (the dense engine's layout: member 0 at class j, member 1 at its negative), the amplitude
// of hole 1 at site R in fiber a and hole 2 at 0 in fiber c: N^(-1/2) toSites(psi(.; a, c))(R)
export function holePairAmplitude(
  e: HoleEngine,
  s: Holes,
  a: number,
  c: number,
): { re: Float64Array; im: Float64Array } {
  if (e.n !== 2 || e.total !== 0) {
    throw new Error('register-composites: the hole-pair read is two holes at total momentum 0')
  }

  const F = e.frame.fourier
  const N = F.N
  const f = e.frame.fiber
  const re = new Float64Array(N)
  const im = new Float64Array(N)

  for (let j = 0; j < N; j++) {
    re[j] = s.re[j * f * f + a * f + c]!
    im[j] = s.im[j * f * f + a * f + c]!
  }

  toSites(F, re, im, lineScratch(F))

  const k = N ** -0.5

  return { re: re.map(v => v * k), im: im.map(v => v * k) }
}

// the fixed-point bunching of a weight W(R) over sites: pooled over the V shells holding both fixed and non-fixed sites,
// sum over fixed R* of W(R*) divided by sum over the same R* of the mean W over the shell's non-fixed sites; also the
// shells used
export function fixedBunching(
  t: Torus,
  W: ArrayLike<number>,
): { ratio: number; shells: number[]; fixedWeight: number; expected: number } {
  const fixed = new Set(fixedSites(t))
  const vmax = Math.max(...t.V)

  let num = 0
  let den = 0

  const shells: number[] = []

  for (let v = 1; v <= vmax; v++) {
    const inShell = t.sites.map((_, i) => i).filter(i => i !== t.origin && t.V[i] === v)
    const fx = inShell.filter(i => fixed.has(i))
    const other = inShell.filter(i => !fixed.has(i))

    if (fx.length === 0 || other.length === 0) {
      continue
    }

    const mean = other.reduce((a, i) => a + W[i]!, 0) / other.length

    shells.push(v)
    num += fx.reduce((a, i) => a + W[i]!, 0)
    den += fx.length * mean
  }

  return { ratio: den > 0 ? num / den : NaN, shells, fixedWeight: num, expected: den }
}

// the largest |amp(R) - amp(-R)| over R, the exact evenness of a same-internal channel (odd: use +)
export function exchangeParity(
  t: Torus,
  a: { re: Float64Array; im: Float64Array },
  sign: 1 | -1,
): number {
  let worst = 0

  for (let i = 0; i < t.sites.length; i++) {
    const j = t.neg[i]!

    worst = Math.max(worst, Math.hypot(a.re[i]! - sign * a.re[j]!, a.im[i]! - sign * a.im[j]!))
  }

  return worst
}
