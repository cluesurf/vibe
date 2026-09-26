// The low-excitation restriction of the atom-light rule (E-FRC-0236, 0237): a STAND-IN atom on link 0 of a strip
// of husk squares (code/rule/loop-ring) and the strip's light held to its vacuum, its one-quantum and its
// two-quantum states. Measurement (floats): the harmonic reading of the rule, restricted.
//
// WHAT IS EXACT AND WHAT IS NOT. The rule's beat is hop, drift, force. The drift's link-0 phase
// zeta^(-c bal(R + x)^2), R = the link's own field, is zeta^(-c R^2) (the light) times zeta^(-c x) (the atom) times
// e^(-i g x R), g = 4 pi c / M (the coupling), exactly while |R + x| stays inside the column. In the harmonic
// reading the light's beat (drift then force) is metaplectic, so the Fock states of its normal modes are its
// exact eigenstates: the light alone keeps every number of quanta EXACTLY, and the restriction to at most two
// quanta is exact for it. The coupling e^(-i g x R) is a displacement D(alpha), alpha_k = -i g u_k with u_k the
// mode amplitude of R at the start of the beat (|u_k|^2 = (4 sin^2(k/2) / L)(hbar / 2) f / sin omega_k,
// hbar = N / 2 pi, E-FRC-0233); its matrix elements between states of at most two quanta are taken EXACTLY
// (the normal-ordered exponentials, no rotating-wave cut: the counter-rotating terms and the atom-diagonal
// part of x are kept), and what it would send to three quanta is dropped. That dropped weight is the one
// approximation of the restriction besides the harmonic reading itself, and it is measured every beat.
//
// Layout: a Fock index 0 (vacuum), 1 + a (one quantum in mode a), then 1 + M + pair(a, b) for a <= b (two
// quanta, a = b the doubly occupied mode); the atom's site x in {0, 1} doubles it: index = x * dim + fock.

import { ringOmega, ringSpec, splitNear, type LoopSpec } from '@/code/rule/loop-ring'

// the ring with a STAND-IN atom whose gap sits at the ring symbol's omega(k*): hop = round(omega* M / 2 pi), an
// integer exponent (the choice uses a real once, at construction; the rule holds only the integer), split f / s
// near 1 (one link per square)
export function ringAtomSpec(n: number, L: number, kStar = Math.PI / 3): LoopSpec {
  const split = splitNear(n, 1)
  const hop = Math.round((ringOmega(2 / n, kStar) * split.root) / (2 * Math.PI))

  return ringSpec(n, L, split, hop)
}

export type FewQuanta = {
  readonly modes: number
  readonly dim: number
  readonly omega: Float64Array
  readonly u: Float64Array
  readonly g: number
  // the atom's bare hop and drift: V = [[a, b], [b, a]], then row x = 1 times zeta^(-c)
  readonly hopA: readonly [number, number]
  readonly hopB: readonly [number, number]
  readonly atomPhase: number
  readonly pairStart: Int32Array
}

export function fewQuanta(input: { omega: ArrayLike<number>; u: ArrayLike<number>; g: number; hop: number; drift: number; root: number }): FewQuanta {
  const M = input.omega.length
  const pairStart = new Int32Array(M)
  let at = 1 + M

  for (let a = 0; a < M; a++) {
    pairStart[a] = at
    at += M - a
  }

  const z = (input.hop * 2 * Math.PI) / input.root

  return {
    modes: M,
    dim: at,
    omega: Float64Array.from(input.omega),
    u: Float64Array.from(input.u),
    g: input.g,
    hopA: [(1 + Math.cos(z)) / 2, Math.sin(z) / 2],
    hopB: [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2],
    atomPhase: (-2 * Math.PI * input.drift) / input.root,
    pairStart,
  }
}

export const pairIndex = (q: FewQuanta, a: number, b: number): number => (a <= b ? q.pairStart[a]! + (b - a) : q.pairStart[b]! + (a - b))

// the modes of a strip's light for the restriction: k_j = 2 pi j / L for j in `js`, omega_j from the symbol,
// u_j the rung-0 amplitude
export function stripModes(input: { n: number; squares: number; f: number; js: readonly number[]; omegaOf: (k: number) => number }): { omega: Float64Array; u: Float64Array } {
  const hbar = input.n / (2 * Math.PI)
  const omega = new Float64Array(input.js.length)
  const u = new Float64Array(input.js.length)

  input.js.forEach((j, a) => {
    const k = (2 * Math.PI * j) / input.squares

    omega[a] = input.omegaOf(k)
    u[a] = Math.sqrt(((4 * Math.sin(k / 2) ** 2) / input.squares) * (hbar / 2) * (input.f / Math.sin(omega[a]!)))
  })

  return { omega, u }
}

const SQRT2 = Math.SQRT2

// D(alpha) = e^(-A/2) e^(alpha b^dag) e^(-conj(alpha) b), alpha_a = -i g u_a (u real), on one Fock block in place
// (offset into re, im), truncated at two quanta
function displace(q: FewQuanta, re: Float64Array, im: Float64Array, offset: number, scratch: { r1: Float64Array; i1: Float64Array }): void {
  const M = q.modes
  const g = q.g
  // alpha_a = -i g u_a: (0, -g u_a); beta_a = conj(alpha_a) = (0, g u_a)
  let A = 0

  for (let a = 0; a < M; a++) A += (g * q.u[a]!) ** 2

  // step 1: e^(-beta b), beta_a = i g u_a =: i t_a
  // c0' = c0 - sum beta_a c1_a + sum_(a<b) beta_a beta_b c2_ab + sum_a beta_a^2 / sqrt2 c2_aa
  // c1'_a = c1_a - sum_(b != a) beta_b c2_ab - sqrt2 beta_a c2_aa
  // beta_a beta_b = - t_a t_b
  let c0r = re[offset]!
  let c0i = im[offset]!
  const r1 = scratch.r1
  const i1 = scratch.i1

  for (let a = 0; a < M; a++) {
    r1[a] = re[offset + 1 + a]!
    i1[a] = im[offset + 1 + a]!
  }

  for (let a = 0; a < M; a++) {
    const ta = g * q.u[a]!
    const xr = re[offset + 1 + a]!
    const xi = im[offset + 1 + a]!

    // - beta_a c1_a = - i t_a (xr + i xi) = t_a xi - i t_a xr
    c0r += ta * xi
    c0i -= ta * xr

    const base = offset + q.pairStart[a]!
    const daR = re[base]!
    const daI = im[base]!

    // a = b: beta_a^2 / sqrt2 c2_aa = - t_a^2 / sqrt2 c2_aa; c1'_a -= sqrt2 beta_a c2_aa = - i sqrt2 t_a c2_aa
    c0r += (-ta * ta * daR) / SQRT2
    c0i += (-ta * ta * daI) / SQRT2
    r1[a] = r1[a]! + SQRT2 * ta * daI
    i1[a] = i1[a]! - SQRT2 * ta * daR

    for (let b = a + 1; b < M; b++) {
      const tb = g * q.u[b]!
      const pr = re[base + (b - a)]!
      const pi = im[base + (b - a)]!

      // + beta_a beta_b c2_ab = - t_a t_b c2_ab
      c0r -= ta * tb * pr
      c0i -= ta * tb * pi
      // c1'_a -= i t_b c2_ab ; c1'_b -= i t_a c2_ab
      r1[a] = r1[a]! + tb * pi
      i1[a] = i1[a]! - tb * pr
      r1[b] = r1[b]! + ta * pi
      i1[b] = i1[b]! - ta * pr
    }
  }

  // step 2: e^(alpha b^dag), alpha_a = - i t_a, truncated
  // c1''_a = c1'_a + alpha_a c0'
  // c2''_ab = c2_ab + alpha_a alpha_b c0' + alpha_b c1'_a + alpha_a c1'_b      (a < b), alpha_a alpha_b = - t_a t_b
  // c2''_aa = c2_aa + alpha_a^2 / sqrt2 c0' + sqrt2 alpha_a c1'_a
  for (let a = 0; a < M; a++) {
    const ta = g * q.u[a]!
    const base = offset + q.pairStart[a]!

    // alpha_a^2 = - t_a^2 ; sqrt2 alpha_a c1'_a = - i sqrt2 t_a c1'_a
    re[base] = re[base]! + (-ta * ta * c0r) / SQRT2 + SQRT2 * ta * i1[a]!
    im[base] = im[base]! + (-ta * ta * c0i) / SQRT2 - SQRT2 * ta * r1[a]!

    for (let b = a + 1; b < M; b++) {
      const tb = g * q.u[b]!
      const j = base + (b - a)

      // - t_a t_b c0' - i t_b c1'_a - i t_a c1'_b
      re[j] = re[j]! - ta * tb * c0r + tb * i1[a]! + ta * i1[b]!
      im[j] = im[j]! - ta * tb * c0i - tb * r1[a]! - ta * r1[b]!
    }
  }

  const damp = Math.exp(-A / 2)

  re[offset] = damp * c0r
  im[offset] = damp * c0i

  for (let a = 0; a < M; a++) {
    const ta = g * q.u[a]!

    // c1''_a = c1'_a - i t_a c0'
    re[offset + 1 + a] = damp * (r1[a]! + ta * c0i)
    im[offset + 1 + a] = damp * (i1[a]! - ta * c0r)
  }

  for (let j = offset + 1 + M; j < offset + q.dim; j++) {
    re[j] = damp * re[j]!
    im[j] = damp * im[j]!
  }
}

export type FewQuantaRun = { re: Float64Array; im: Float64Array; scratch: { r1: Float64Array; i1: Float64Array }; phaseRe: Float64Array; phaseIm: Float64Array }

export function fewQuantaRun(q: FewQuanta): FewQuantaRun {
  const phaseRe = new Float64Array(q.dim)
  const phaseIm = new Float64Array(q.dim)

  phaseRe[0] = 1

  for (let a = 0; a < q.modes; a++) {
    phaseRe[1 + a] = Math.cos(-q.omega[a]!)
    phaseIm[1 + a] = Math.sin(-q.omega[a]!)

    for (let b = a; b < q.modes; b++) {
      const t = -(q.omega[a]! + q.omega[b]!)

      phaseRe[pairIndex(q, a, b)] = Math.cos(t)
      phaseIm[pairIndex(q, a, b)] = Math.sin(t)
    }
  }

  return {
    re: new Float64Array(2 * q.dim),
    im: new Float64Array(2 * q.dim),
    scratch: { r1: new Float64Array(q.modes), i1: new Float64Array(q.modes) },
    phaseRe,
    phaseIm,
  }
}

// the atom's state [g0r, g0i, g1r, g1i] times the light's vacuum
export function fewQuantaStart(q: FewQuanta, run: FewQuantaRun, atom: readonly [number, number, number, number]): void {
  run.re.fill(0)
  run.im.fill(0)
  run.re[0] = atom[0]
  run.im[0] = atom[1]
  run.re[q.dim] = atom[2]
  run.im[q.dim] = atom[3]
}

// one beat: hop, the atom's drift phase, the coupling on x = 1, the light's free phases
export function fewQuantaBeat(q: FewQuanta, run: FewQuantaRun): void {
  const { re, im } = run
  const d = q.dim
  const [ar, ai] = q.hopA
  const [br, bi] = q.hopB
  const cr = Math.cos(q.atomPhase)
  const ci = Math.sin(q.atomPhase)

  for (let i = 0; i < d; i++) {
    const xr = re[i]!
    const xi = im[i]!
    const yr = re[d + i]!
    const yi = im[d + i]!
    const nr = br * xr - bi * xi + ar * yr - ai * yi
    const ni = br * xi + bi * xr + ar * yi + ai * yr

    re[i] = ar * xr - ai * xi + br * yr - bi * yi
    im[i] = ar * xi + ai * xr + br * yi + bi * yr
    re[d + i] = nr * cr - ni * ci
    im[d + i] = nr * ci + ni * cr
  }

  displace(q, re, im, d, run.scratch)

  for (let x = 0; x < 2; x++) {
    for (let i = 0; i < d; i++) {
      const j = x * d + i
      const pr = run.phaseRe[i]!
      const pi = run.phaseIm[i]!
      const vr = re[j]!
      const vi = im[j]!

      re[j] = vr * pr - vi * pi
      im[j] = vr * pi + vi * pr
    }
  }
}

// P(atom in `state`) and the weights of zero, one and two quanta
export function fewQuantaRead(q: FewQuanta, run: FewQuantaRun, state: readonly [number, number, number, number]): { population: number; norm: number; two: number } {
  const d = q.dim
  let p = 0
  let norm = 0
  let two = 0

  for (let i = 0; i < d; i++) {
    const r = state[0] * run.re[i]! + state[1] * run.im[i]! + state[2] * run.re[d + i]! + state[3] * run.im[d + i]!
    const s = state[0] * run.im[i]! - state[1] * run.re[i]! + state[2] * run.im[d + i]! - state[3] * run.re[d + i]!
    const w = run.re[i]! ** 2 + run.im[i]! ** 2 + run.re[d + i]! ** 2 + run.im[d + i]! ** 2

    p += r * r + s * s
    norm += w

    if (i > q.modes) two += w
  }

  return { population: p, norm, two }
}

// the golden rule into a strip whose symbol is 2 - 2 cos omega = kappa K(k): Gamma = 2 pi sum over the two
// directions |g d u(k*)|^2 L / (2 pi v_g) = (2 N / pi) g^2 d^2 f sin^2(k*/2) / (kappa K'(k*) / 2) ... written out:
// Gamma = 4 g^2 d^2 hbar f sin^2(k*/2) / (sin(omega) v_g), v_g = kappa K'(k*) / (2 sin omega), K' = dK/dk
export function stripGoldenRule(input: { n: number; f: number; kappa: number; g: number; dipole: number; gap: number; curl: (k: number) => number; curlSlope: (k: number) => number }): { rate: number; k: number; velocity: number } {
  // k* by bisection on [0, pi]: kappa K(k) = 2 - 2 cos gap
  const target = (2 - 2 * Math.cos(input.gap)) / input.kappa
  let lo = 0
  let hi = Math.PI

  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2

    if (input.curl(mid) < target) lo = mid
    else hi = mid
  }

  const k = (lo + hi) / 2
  const hbar = input.n / (2 * Math.PI)
  const velocity = (input.kappa * input.curlSlope(k)) / (2 * Math.sin(input.gap))
  const rate = (4 * input.g ** 2 * input.dipole ** 2 * hbar * input.f * Math.sin(k / 2) ** 2) / (Math.sin(input.gap) * velocity)

  return { rate, k, velocity }
}
