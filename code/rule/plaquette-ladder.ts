// The plaquette ladder (E-FRC-0230 to 0233): a propagating quantum light on husk squares. Kogut-Susskind's Z_N
// lattice gauge theory (code/rule/lattice-qed, E-FRC-0227) on a periodic two-leg ladder of L squares, every flux
// register a column of D trits read as its column sum (N = 2D + 1 values, E-FRC-0207), and every factor an exact
// unitary over the cyclotomic integers Z[zeta_M].
//
// THE LADDER. Docks: a bottom rail b_0 .. b_(L-1) and a top rail t_0 .. t_(L-1), periodic. Links: bottom rail
// b_p -> b_(p+1), top rail t_p -> t_(p+1), rung j: b_j -> t_j. Square p is bounded by bottom rail p (+), rung p + 1
// (+), top rail p (-) and rung p (-). With no charge the Gauss sector is spanned by the squares' loop values m_p
// (the circulation, U_p shifts m_p by one) and a winding flux around the ring that no factor changes (held at 0):
//   bottom rail p   e = m_p          top rail p   e = -m_p          rung j   e = m_(j-1) - m_j
// A STAND-IN charge (an electron with its nucleus of +1 at b_0) may sit at b_0 (x = 0) or t_0 (x = 1); at t_0 its
// string adds x to rung 0's flux. That is the whole sector: index = x N^L + sum_p m_p N^p.
//
// THE LINK AS A RELATION OF SLOTS (E-FRC-0229). A link's flux is not stored on the link: its tail slot holds a port
// register u and its head slot w, with e = u and u + w = 0 kept by every factor, each a column of D bulk trits in
// the thermometer code (value v: the first |v| trits are sign v, the rest 0). The husk reads the column sum.
// Nothing moves: the loop shift and the recorded hop copy one unit of count from one port column to another.
//
// THE BEAT, every factor exact, every exponent an integer mod M (a cycling counter, never a rounded real):
//   hop       (1 + z)/2 + (1 - z)/2 T with T the RECORDED hop across rung 0 (x -> 1 - x, the rung's flux records
//             it), z = zeta_M^hop: a STAND-IN atom, entries in (1/2) Z[zeta_M]
//   drift     zeta_M^(-c sum_links bal(e)^2), diagonal in the fluxes
//   force     per square f(U_p) = sum_B zeta_M^(-r bal(B)^2) Pi_B, the loop step of lattice-qed: entries in
//             (1/N) Z[zeta_M], diagonal in the square's angle B (the conjugate of m_p)
// In the harmonic reading (fields far from the column's seam at +-D) the drift turns each square's angle by
// s K m and the force turns its loop by -f B, with s = 2 N c / M and f = 2 N r / M: the leapfrog of the classical
// light with kappa = s f and the ladder's curl-curl K(k) = 4 - 2 cos k, so 2 - 2 cos omega = kappa K(k).
// kappa = 2 / (2D + 1), the inverse depth, is the choice c r = M^2 / (2 N^3); the split between s and f is free
// in the classical light and is NOT free in the quantum one (E-FRC-0230).

import { bal, mod, type Step } from '@/code/rule/lattice-qed'

export type LadderSpec = {
  // the register modulus N = 2D + 1
  readonly n: number
  // the number of squares L (periodic)
  readonly plaquettes: number
  // M: every phase is a power of zeta_M (a multiple of 2 N)
  readonly root: number
  // c and r: the drift and force exponents
  readonly drift: number
  readonly force: number
  // a STAND-IN electron on rung 0, hopping with z = zeta_M^hop (absent: the light alone)
  readonly hop?: number
}

// kappa = 2 / N with the two splits the experiments compare: `drift` carries the 2/N (c = 2, r = N: s = 2/N, f = 1)
// or `force` carries it (c = N, r = 2: s = 1, f = 2/N, the classical light's own split, E-FRC-0207)
export function inverseDepthSpec(n: number, plaquettes: number, carrier: 'drift' | 'force', hop?: number): LadderSpec {
  const root = 2 * n * n
  const [drift, force] = carrier === 'drift' ? [2, n] : [n, 2]

  return hop === undefined ? { n, plaquettes, root, drift, force } : { n, plaquettes, root, drift, force, hop }
}

export const splitOf = (spec: LadderSpec): { s: number; f: number; kappa: number } => {
  const s = (2 * spec.n * spec.drift) / spec.root
  const f = (2 * spec.n * spec.force) / spec.root

  return { s, f, kappa: s * f }
}

export const ladderSize = (spec: LadderSpec): number => (spec.hop === undefined ? 1 : 2) * spec.n ** spec.plaquettes

// the loop values m_p and the charge position x of an index
export function digitsOf(spec: LadderSpec, i: number): { x: number; m: number[] } {
  const { n, plaquettes: L } = spec
  const m = new Array<number>(L)
  let rest = i

  for (let p = 0; p < L; p++) {
    m[p] = rest % n
    rest = Math.floor(rest / n)
  }

  return { x: rest, m }
}

// the link fluxes of an index: bottom rails 0..L-1, top rails L..2L-1, rungs 2L..3L-1
export function fluxesOf(spec: LadderSpec, i: number): number[] {
  const { n, plaquettes: L } = spec
  const { x, m } = digitsOf(spec, i)
  const e = new Array<number>(3 * L)

  for (let p = 0; p < L; p++) {
    e[p] = m[p]!
    e[L + p] = mod(-m[p]!, n)
    e[2 * L + p] = mod(m[mod(p - 1, L)]! - m[p]! + (p === 0 ? x : 0), n)
  }

  return e
}

// sum over links of bal(e)^2 (for L = 1 the rung is shared by the square with itself and carries 0)
export function electricOf(spec: LadderSpec, i: number): number {
  const { n } = spec

  return fluxesOf(spec, i).reduce((s, e) => s + bal(e, n) ** 2, 0)
}

// ---------------------------------------------------------------------------------------------------------
// the exact steps (lattice-qed's Step, run by its exact and float engines)

export function ladderSteps(spec: LadderSpec): Step[] {
  const { n, plaquettes: L } = spec
  const size = ladderSize(spec)
  const electric = Int32Array.from({ length: size }, (_, i) => electricOf(spec, i))
  const exponents = Array.from({ length: n }, (_, B) => -spec.force * bal(B, n) ** 2)
  const steps: Step[] = []

  if (spec.hop !== undefined) {
    const half = n ** L

    steps.push({ kind: 'hop', move: i => (i < half ? i + half : i - half), z: spec.hop })
  }

  steps.push({ kind: 'phase', exponent: i => -spec.drift * electric[i]! })

  for (let p = 0; p < L; p++) {
    const stride = n ** p

    steps.push({
      kind: 'loop',
      shift: i => {
        const d = Math.floor(i / stride) % n

        return i + (mod(d + 1, n) - d) * stride
      },
      exponents,
      n,
    })
  }

  return steps
}

// ---------------------------------------------------------------------------------------------------------
// the full register space: every link's flux a register (the tail slot's port column; the head slot's is its
// negative), the STAND-IN electron at b_0 or t_0. Index = x N^(3L) + sum_l e_l N^l, links numbered as fluxesOf.
// Gauss at each dock: out-flux minus in-flux minus the charge (nucleus +1 at b_0, electron -1 where it sits).

export type FullLadder = {
  readonly spec: LadderSpec
  readonly size: number
  gauss(i: number): number[]
  embed(sectorIndex: number): number
  steps(recorded: boolean): Step[]
  hopMove(recorded: boolean): (i: number) => number
  loopShift(p: number): (i: number) => number
}

export function fullLadder(spec: LadderSpec): FullLadder {
  const { n, plaquettes: L } = spec
  const links = 3 * L
  const flux = n ** links
  const size = 2 * flux
  // link l: [tail dock, head dock]; docks b_p = p, t_p = L + p
  const ends: [number, number][] = []

  for (let p = 0; p < L; p++) ends.push([p, (p + 1) % L])

  for (let p = 0; p < L; p++) ends.push([L + p, L + ((p + 1) % L)])

  for (let p = 0; p < L; p++) ends.push([p, L + p])

  const digit = (i: number, l: number): number => Math.floor((i % flux) / n ** l) % n
  const withDigit = (i: number, l: number, value: number): number => i + (mod(value, n) - digit(i, l)) * n ** l

  const gauss = (i: number): number[] => {
    const x = Math.floor(i / flux)
    const g = new Array<number>(2 * L).fill(0)

    ends.forEach(([a, b], l) => {
      const e = digit(i, l)

      g[a] = g[a]! + e
      g[b] = g[b]! - e
    })

    g[0] = g[0]! - 1
    g[x === 0 ? 0 : L] = g[x === 0 ? 0 : L]! + 1

    return g.map(v => mod(v, n))
  }

  const embed = (s: number): number => {
    const { x } = digitsOf(spec, s)
    const e = fluxesOf(spec, s)
    let i = x * flux

    for (let l = 0; l < links; l++) i += e[l]! * n ** l

    return i
  }

  const hopMove = (recorded: boolean) => (i: number): number => {
    const x = Math.floor(i / flux)
    const moved = x === 0 ? i + flux : i - flux

    return recorded ? withDigit(moved, 2 * L, digit(i, 2 * L) + (x === 0 ? 1 : -1)) : moved
  }

  // square p: bottom rail p (+), rung p + 1 (+), top rail p (-), rung p (-)
  const loopShift = (p: number) => (i: number): number => {
    let j = withDigit(i, p, digit(i, p) + 1)

    j = withDigit(j, L + p, digit(j, L + p) - 1)

    if (L > 1) {
      j = withDigit(j, 2 * L + ((p + 1) % L), digit(j, 2 * L + ((p + 1) % L)) + 1)
      j = withDigit(j, 2 * L + p, digit(j, 2 * L + p) - 1)
    }

    return j
  }

  const steps = (recorded: boolean): Step[] => {
    const exponents = Array.from({ length: n }, (_, B) => -spec.force * bal(B, n) ** 2)
    const out: Step[] = [{ kind: 'hop', move: hopMove(recorded), z: spec.hop ?? 0 }]

    out.push({
      kind: 'phase',
      exponent: i => {
        let s = 0

        for (let l = 0; l < links; l++) s += bal(digit(i, l), n) ** 2

        return -spec.drift * s
      },
    })

    for (let p = 0; p < L; p++) out.push({ kind: 'loop', shift: loopShift(p), exponents, n })

    return out
  }

  return { spec, size, gauss, embed, steps, hopMove, loopShift }
}

// ---------------------------------------------------------------------------------------------------------
// the fast float beat (measurement): the same factors, the force as a DFT on each square's digit

export type LadderKernel = {
  readonly spec: LadderSpec
  readonly size: number
  readonly driftRe: Float64Array
  readonly driftIm: Float64Array
  readonly forceRe: Float64Array
  readonly forceIm: Float64Array
  readonly twRe: Float64Array
  readonly twIm: Float64Array
  readonly hopA: readonly [number, number]
  readonly hopB: readonly [number, number]
  readonly scratchRe: Float64Array
  readonly scratchIm: Float64Array
}

// `forceOff`: the CONTROL with the plaquette (force) step left out, a light whose loops only the drift reads
export function ladderKernel(spec: LadderSpec, options: { forceOff?: boolean } = {}): LadderKernel {
  const { n, plaquettes: L, root } = spec
  const size = ladderSize(spec)
  const half = n ** L
  const driftRe = new Float64Array(size)
  const driftIm = new Float64Array(size)
  const forceRe = new Float64Array(half)
  const forceIm = new Float64Array(half)

  for (let i = 0; i < size; i++) {
    const t = (-2 * Math.PI * ((spec.drift * electricOf(spec, i)) % root)) / root

    driftRe[i] = Math.cos(t)
    driftIm[i] = Math.sin(t)
  }

  for (let i = 0; i < half; i++) {
    let e = 0
    let rest = i

    for (let p = 0; p < L; p++) {
      e += bal(rest % n, n) ** 2
      rest = Math.floor(rest / n)
    }

    const t = options.forceOff ? 0 : (-2 * Math.PI * ((spec.force * e) % root)) / root

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

  const z = ((spec.hop ?? 0) * 2 * Math.PI) / root
  const hopA: [number, number] = [(1 + Math.cos(z)) / 2, Math.sin(z) / 2]
  const hopB: [number, number] = [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2]

  return {
    spec,
    size,
    driftRe,
    driftIm,
    forceRe,
    forceIm,
    twRe,
    twIm,
    hopA,
    hopB,
    scratchRe: new Float64Array(n),
    scratchIm: new Float64Array(n),
  }
}

// the DFT (sign -1: flux to angle) or its inverse on digit p of every index, in place, over one block of `half`
function transformDigit(k: LadderKernel, re: Float64Array, im: Float64Array, offset: number, p: number, inverse: boolean): void {
  const n = k.spec.n
  const half = n ** k.spec.plaquettes
  const stride = n ** p
  const sr = k.scratchRe
  const si = k.scratchIm
  const sign = inverse ? -1 : 1

  for (let base = 0; base < half; base++) {
    if (Math.floor(base / stride) % n !== 0) continue

    for (let b = 0; b < n; b++) {
      let ar = 0
      let ai = 0

      for (let a = 0; a < n; a++) {
        const j = offset + base + a * stride
        const wr = k.twRe[a * n + b]!
        const wi = sign * k.twIm[a * n + b]!

        ar += wr * re[j]! - wi * im[j]!
        ai += wr * im[j]! + wi * re[j]!
      }

      sr[b] = ar
      si[b] = ai
    }

    for (let b = 0; b < n; b++) {
      re[offset + base + b * stride] = sr[b]!
      im[offset + base + b * stride] = si[b]!
    }
  }
}

// a vector in the angle basis of every square (the forward transform on each digit), a copy
export function toAngleBasis(k: LadderKernel, re: Float64Array, im: Float64Array): { re: Float64Array; im: Float64Array } {
  const half = k.spec.n ** k.spec.plaquettes
  const out = { re: Float64Array.from(re), im: Float64Array.from(im) }

  for (let offset = 0; offset < k.size; offset += half) {
    for (let p = 0; p < k.spec.plaquettes; p++) transformDigit(k, out.re, out.im, offset, p, false)
  }

  return out
}

export function fromAngleBasis(k: LadderKernel, re: Float64Array, im: Float64Array): { re: Float64Array; im: Float64Array } {
  const half = k.spec.n ** k.spec.plaquettes
  const out = { re: Float64Array.from(re), im: Float64Array.from(im) }

  for (let offset = 0; offset < k.size; offset += half) {
    for (let p = 0; p < k.spec.plaquettes; p++) transformDigit(k, out.re, out.im, offset, p, true)
  }

  return out
}

// one beat in place: hop, drift, force
export function ladderBeat(k: LadderKernel, re: Float64Array, im: Float64Array): void {
  const { n, plaquettes: L } = k.spec
  const half = n ** L

  if (k.spec.hop !== undefined) {
    const [ar, ai] = k.hopA
    const [br, bi] = k.hopB

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

  for (let i = 0; i < k.size; i++) {
    const xr = re[i]!
    const xi = im[i]!

    re[i] = xr * k.driftRe[i]! - xi * k.driftIm[i]!
    im[i] = xr * k.driftIm[i]! + xi * k.driftRe[i]!
  }

  for (let offset = 0; offset < k.size; offset += half) {
    for (let p = 0; p < L; p++) transformDigit(k, re, im, offset, p, false)

    for (let i = 0; i < half; i++) {
      const j = offset + i
      const xr = re[j]!
      const xi = im[j]!

      re[j] = xr * k.forceRe[i]! - xi * k.forceIm[i]!
      im[j] = xr * k.forceIm[i]! + xi * k.forceRe[i]!
    }

    for (let p = 0; p < L; p++) transformDigit(k, re, im, offset, p, true)
  }
}

// the inverse beat in place (measurement: two-sided spectral filters): force^-1, drift^-1, hop^-1
export function ladderInverseBeat(k: LadderKernel, re: Float64Array, im: Float64Array): void {
  const { n, plaquettes: L } = k.spec
  const half = n ** L

  for (let offset = 0; offset < k.size; offset += half) {
    for (let p = 0; p < L; p++) transformDigit(k, re, im, offset, p, false)

    for (let i = 0; i < half; i++) {
      const j = offset + i
      const xr = re[j]!
      const xi = im[j]!

      re[j] = xr * k.forceRe[i]! + xi * k.forceIm[i]!
      im[j] = -xr * k.forceIm[i]! + xi * k.forceRe[i]!
    }

    for (let p = 0; p < L; p++) transformDigit(k, re, im, offset, p, true)
  }

  for (let i = 0; i < k.size; i++) {
    const xr = re[i]!
    const xi = im[i]!

    re[i] = xr * k.driftRe[i]! + xi * k.driftIm[i]!
    im[i] = -xr * k.driftIm[i]! + xi * k.driftRe[i]!
  }

  if (k.spec.hop !== undefined) {
    // the hop's inverse: conjugate coefficients (it is symmetric)
    const [ar, ai] = k.hopA
    const [br, bi] = k.hopB

    for (let i = 0; i < half; i++) {
      const xr = re[i]!
      const xi = im[i]!
      const yr = re[i + half]!
      const yi = im[i + half]!

      re[i] = ar * xr + ai * xi + br * yr + bi * yi
      im[i] = ar * xi - ai * xr + br * yi - bi * yr
      re[i + half] = br * xr + bi * xi + ar * yr + ai * yi
      im[i + half] = br * xi - bi * xr + ar * yi - ai * yr
    }
  }
}

// the energies each beat approximates (units of radians per beat): the drift's (2 pi c / M) sum bal(e)^2 and the
// force's (2 pi r / M) sum bal(B)^2, the second read in the angle basis
export function ladderEnergies(k: LadderKernel, re: Float64Array, im: Float64Array): { electric: number; magnetic: number; perSquare: Float64Array } {
  const { n, plaquettes: L, root } = k.spec
  const half = n ** L
  const perSquare = new Float64Array(L)
  let electric = 0
  let magnetic = 0
  const wr = Float64Array.from(re)
  const wi = Float64Array.from(im)

  for (let i = 0; i < k.size; i++) {
    const w = re[i]! ** 2 + im[i]! ** 2

    if (w === 0) continue

    const e = fluxesOf(k.spec, i)

    electric += w * e.reduce((s, x) => s + bal(x, n) ** 2, 0)

    // each square takes its two rails and half of each of its rungs
    for (let p = 0; p < L; p++) {
      const own = bal(e[p]!, n) ** 2 + bal(e[L + p]!, n) ** 2 + (bal(e[2 * L + p]!, n) ** 2 + bal(e[2 * L + ((p + 1) % L)]!, n) ** 2) / 2

      perSquare[p] = perSquare[p]! + (w * own * 2 * Math.PI * k.spec.drift) / root
    }
  }

  for (let offset = 0; offset < k.size; offset += half) {
    for (let p = 0; p < L; p++) transformDigit(k, wr, wi, offset, p, false)

    for (let i = 0; i < half; i++) {
      const w = wr[offset + i]! ** 2 + wi[offset + i]! ** 2
      let rest = i

      for (let p = 0; p < L; p++) {
        const b2 = bal(rest % n, n) ** 2

        magnetic += w * b2
        perSquare[p] = perSquare[p]! + (w * b2 * 2 * Math.PI * k.spec.force) / root
        rest = Math.floor(rest / n)
      }
    }
  }

  return { electric: (electric * 2 * Math.PI * k.spec.drift) / root, magnetic: (magnetic * 2 * Math.PI * k.spec.force) / root, perSquare }
}

// ---------------------------------------------------------------------------------------------------------
// the classical light on the same ladder (the E~ leapfrog's symbol, E-FRC-0179 / 0185 / 0207)

export const curlCurl = (k: number, plaquettes: number): number => (plaquettes === 1 ? 2 : 4 - 2 * Math.cos(k))

export function classicalOmega(kappa: number, k: number, plaquettes: number): number {
  return Math.acos(1 - (kappa * curlCurl(k, plaquettes)) / 2)
}

// group velocity d omega / dk in squares per beat
export function classicalVelocity(kappa: number, k: number, plaquettes: number): number {
  if (plaquettes === 1) return 0

  return (kappa * Math.sin(k)) / Math.sin(classicalOmega(kappa, k, plaquettes))
}

// ---------------------------------------------------------------------------------------------------------
// the column: a register value v in -D .. D as D trits in the thermometer code, and back

export function thermometer(v: number, depth: number): Int8Array {
  const t = new Int8Array(depth)
  const s = Math.sign(v)

  for (let d = 0; d < Math.abs(v); d++) t[d] = s

  return t
}

export const columnSum = (t: ArrayLike<number>): number => {
  let s = 0

  for (let d = 0; d < t.length; d++) s += t[d]!

  return s
}
