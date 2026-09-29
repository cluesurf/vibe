// The ring's exact register rule on its physical sector (E-FRC-0238, 0239). Measurement kernel (floats) of the
// rule of code/rule/loop-ring, cut down to the states the closed surface allows.
//
// On the closed strip a uniform shift of every loop register is no change, so the physical states are the ones it
// leaves alone: psi(m) = phi(d) / sqrt N with d_p = m_p - m_0 mod N, p = 1 .. L - 1. That is N^(L-1) values per atom
// site instead of N^L, the sector the rule conserves (E-FRC-0235 M4: the beat commutes with the shift exactly).
//   drift   reads only differences: rung 0 carries bal(d_(L-1) + x), rung p carries bal(d_(p-1) - d_p), d_0 = 0
//   force   the forward DFT of psi over all L digits is delta(sum B = 0) times the DFT of phi over its L - 1
//           digits, so the force is diagonal in (B_1 .. B_(L-1)) with B_0 = -sum B_p mod N:
//           F = zeta_M^(-r (bal(B_0)^2 + sum_p bal(B_p)^2))
//   hop     as in the full rule (x -> 1 - x, recorded by rung 0's flux)
// Every table holds the rule's integer exponents mod M, turned into a phase only at measurement.

import { bal, mod } from '@/code/rule/lattice-qed'
import type { LoopSpec } from '@/code/rule/loop-ring'

export type ReducedKernel = {
  readonly spec: LoopSpec
  // light values per atom site, N^(L-1), and the full size (2 per site with an atom)
  readonly half: number
  readonly size: number
  readonly digits: number
  readonly driftRe: Float64Array
  readonly driftIm: Float64Array
  readonly forceRe: Float64Array
  readonly forceIm: Float64Array
  readonly twRe: Float64Array
  readonly twIm: Float64Array
  readonly hopA: readonly [number, number]
  readonly hopB: readonly [number, number]
  readonly starts: Int32Array[]
  readonly scratchRe: Float64Array
  readonly scratchIm: Float64Array
}

// the reduced digits d_1 .. d_(L-1) of a light index (d_0 = 0 prepended)
export function reducedDigits(
  n: number,
  L: number,
  r: number,
  out: Int32Array,
): Int32Array {
  out[0] = 0

  let rest = r

  for (let p = 1; p < L; p++) {
    out[p] = rest % n
    rest = Math.floor(rest / n)
  }

  return out
}

// sum over the ring's rungs of bal(e)^2, x added to rung 0
export function reducedElectric(
  n: number,
  L: number,
  d: Int32Array,
  x: number,
): number {
  let s = bal(d[L - 1]! + x, n) ** 2

  for (let p = 1; p < L; p++) {
    s += bal(d[p - 1]! - d[p]!, n) ** 2
  }

  return s
}

export function reducedKernel(
  spec: LoopSpec,
  options: { withAtom: boolean },
): ReducedKernel {
  const { n, squares: L, root } = spec
  const digits = L - 1
  const half = n ** digits
  const size = (options.withAtom ? 2 : 1) * half
  const driftRe = new Float64Array(size)
  const driftIm = new Float64Array(size)
  const forceRe = new Float64Array(half)
  const forceIm = new Float64Array(half)
  const d = new Int32Array(L)

  for (let i = 0; i < size; i++) {
    const x = Math.floor(i / half)

    reducedDigits(n, L, i % half, d)

    const t =
      (-2 *
        Math.PI *
        mod(spec.drift * reducedElectric(n, L, d, x), root)) /
      root

    driftRe[i] = Math.cos(t)
    driftIm[i] = Math.sin(t)
  }

  for (let i = 0; i < half; i++) {
    reducedDigits(n, L, i, d)

    let sum = 0
    let e = 0

    for (let p = 1; p < L; p++) {
      sum += d[p]!
      e += bal(d[p]!, n) ** 2
    }

    e += bal(-sum, n) ** 2

    const t = (-2 * Math.PI * mod(spec.force * e, root)) / root

    forceRe[i] = Math.cos(t)
    forceIm[i] = Math.sin(t)
  }

  const twRe = new Float64Array(n * n)
  const twIm = new Float64Array(n * n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const t = (-2 * Math.PI * ((a * b) % n)) / n

      twRe[a * n + b] = Math.cos(t) / Math.sqrt(n)
      twIm[a * n + b] = Math.sin(t) / Math.sqrt(n)
    }
  }

  const starts: Int32Array[] = []

  for (let p = 0; p < digits; p++) {
    const stride = n ** p
    const list = new Int32Array(half / n)

    let k = 0

    for (let base = 0; base < half; base++) {
      if (Math.floor(base / stride) % n === 0) {
        list[k++] = base
      }
    }

    starts.push(list)
  }

  const z = ((spec.hop ?? 0) * 2 * Math.PI) / root

  return {
    spec,
    half,
    size,
    digits,
    driftRe,
    driftIm,
    forceRe,
    forceIm,
    twRe,
    twIm,
    hopA: [(1 + Math.cos(z)) / 2, Math.sin(z) / 2],
    hopB: [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2],
    starts,
    scratchRe: new Float64Array(n),
    scratchIm: new Float64Array(n),
  }
}

function transform(
  k: ReducedKernel,
  re: Float64Array,
  im: Float64Array,
  offset: number,
  p: number,
  inverse: boolean,
): void {
  const n = k.spec.n
  const stride = n ** p
  const sr = k.scratchRe
  const si = k.scratchIm
  const sign = inverse ? -1 : 1
  const list = k.starts[p]!

  for (const start of list) {
    const base = offset + start

    for (let b = 0; b < n; b++) {
      let ar = 0
      let ai = 0

      for (let a = 0; a < n; a++) {
        const j = base + a * stride
        const wr = k.twRe[a * n + b]!
        const wi = sign * k.twIm[a * n + b]!

        ar += wr * re[j]! - wi * im[j]!
        ai += wr * im[j]! + wi * re[j]!
      }

      sr[b] = ar
      si[b] = ai
    }

    for (let b = 0; b < n; b++) {
      re[base + b * stride] = sr[b]!
      im[base + b * stride] = si[b]!
    }
  }
}

function multiply(
  re: Float64Array,
  im: Float64Array,
  tr: Float64Array,
  ti: Float64Array,
  offset: number,
  count: number,
  conjugate: boolean,
): void {
  const s = conjugate ? -1 : 1

  for (let i = 0; i < count; i++) {
    const j = offset + i
    const xr = re[j]!
    const xi = im[j]!
    const c = tr[i]!
    const d = s * ti[i]!

    re[j] = xr * c - xi * d
    im[j] = xr * d + xi * c
  }
}

function hop(
  k: ReducedKernel,
  re: Float64Array,
  im: Float64Array,
  conjugate: boolean,
): void {
  if (k.size === k.half) {
    return
  }

  const half = k.half
  const s = conjugate ? -1 : 1
  const ar = k.hopA[0]
  const ai = s * k.hopA[1]
  const br = k.hopB[0]
  const bi = s * k.hopB[1]

  for (let i = 0; i < half; i++) {
    const xr = re[i]!
    const xi = im[i]!
    const yr = re[i + half]!
    const yi = im[i + half]!

    re[i] = ar * xr - ai * xi + br * yr - bi * yi
    im[i] = ar * xi + ai * xr + br * yi + bi * yr
    re[i + half] = br * xr - bi * xi + ar * yr - ai * yi
    im[i + half] = br * xi + bi * xr + ar * yi + ai * yr
  }
}

// one beat in place: hop, drift, force
export function reducedBeat(
  k: ReducedKernel,
  re: Float64Array,
  im: Float64Array,
): void {
  hop(k, re, im, false)
  multiply(re, im, k.driftRe, k.driftIm, 0, k.size, false)

  for (let offset = 0; offset < k.size; offset += k.half) {
    for (let p = 0; p < k.digits; p++) {
      transform(k, re, im, offset, p, false)
    }

    multiply(re, im, k.forceRe, k.forceIm, offset, k.half, false)

    for (let p = 0; p < k.digits; p++) {
      transform(k, re, im, offset, p, true)
    }
  }
}

export function reducedInverseBeat(
  k: ReducedKernel,
  re: Float64Array,
  im: Float64Array,
): void {
  for (let offset = 0; offset < k.size; offset += k.half) {
    for (let p = 0; p < k.digits; p++) {
      transform(k, re, im, offset, p, false)
    }

    multiply(re, im, k.forceRe, k.forceIm, offset, k.half, true)

    for (let p = 0; p < k.digits; p++) {
      transform(k, re, im, offset, p, true)
    }
  }

  multiply(re, im, k.driftRe, k.driftIm, 0, k.size, true)
  hop(k, re, im, true)
}

// the full-space vector of a reduced one (for the kernel check against code/rule/loop-ring on small boxes):
// psi(x, m) = phi(x, d(m)) / sqrt N
export function reducedToFull(
  spec: LoopSpec,
  re: Float64Array,
  im: Float64Array,
  sites: number,
): { re: Float64Array; im: Float64Array } {
  const { n, squares: L } = spec
  const fullHalf = n ** L
  const half = n ** (L - 1)
  const out = {
    re: new Float64Array(sites * fullHalf),
    im: new Float64Array(sites * fullHalf),
  }
  const scale = 1 / Math.sqrt(n)

  for (let x = 0; x < sites; x++) {
    for (let i = 0; i < fullHalf; i++) {
      const m0 = i % n

      let rest = Math.floor(i / n)
      let r = 0
      let stride = 1

      for (let p = 1; p < L; p++) {
        r += mod((rest % n) - m0, n) * stride
        rest = Math.floor(rest / n)
        stride *= n
      }

      out.re[x * fullHalf + i] = re[x * half + r]! * scale
      out.im[x * fullHalf + i] = im[x * half + r]! * scale
    }
  }

  return out
}

// the product trial of the light (every register in one register's harmonic ground state, E-FRC-0235's
// ringTrial) summed over the uniform shifts, as a reduced vector (light only)
export function reducedTrial(
  spec: LoopSpec,
  s: number,
  f: number,
): { re: Float64Array; im: Float64Array } {
  const { n, squares: L } = spec
  const half = n ** (L - 1)
  const width = (n / (2 * Math.PI)) * 0.5 * Math.sqrt(f / (2 * s))
  const g = Array.from({ length: n }, (_, v) =>
    Math.exp(-(bal(v, n) ** 2) / (4 * width)),
  )
  const out = { re: new Float64Array(half), im: new Float64Array(half) }
  const d = new Int32Array(L)

  let norm = 0

  for (let r = 0; r < half; r++) {
    reducedDigits(n, L, r, d)

    let sum = 0

    for (let m0 = 0; m0 < n; m0++) {
      let p = 1

      for (let q = 0; q < L; q++) {
        p *= g[mod(m0 + d[q]!, n)]!
      }

      sum += p
    }

    out.re[r] = sum
    norm += sum * sum
  }

  const scale = 1 / Math.sqrt(norm)

  for (let r = 0; r < half; r++) {
    out.re[r] = out.re[r]! * scale
  }

  return out
}
