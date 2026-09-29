// The polaron frame of the atom-light rule (E-FRC-0238 to 0240). Measurement (floats): the harmonic reading of
// the loop-register light (code/rule/loop-ring) with a STAND-IN atom on link 0, as in code/measure/few-quanta,
// seen in a frame that displaces the light by the charge's field.
//
// THE FRAME. The rule's coupling is the cross term of the drift on link 0, e^(-i g x R), g = 4 pi c / M: in the
// harmonic reading a displacement D(x alpha) of the light's normal modes, alpha_k = -i g u_k, applied every beat
// on the x = 1 branch. A charge held at x = 1 therefore dresses the light with the fixed point of
// b -> e^(-i omega)(b + alpha), the static field
//     beta_k = alpha_k / (e^(i omega_k) - 1),       |beta_k| = g u_k / (2 sin(omega_k / 2)).
// The frame is psi = D(x gamma) psi', gamma_k = lambda_k beta_k, an x-diagonal Weyl displacement (a unitary, so
// the frame is exact for every lambda). Conjugating the beat U = P D(x alpha) Phi V (hop V, the atom's drift phase
// Phi on x = 1, the kick, the light's free phases P), with x^2 = x and the Weyl algebra
// D(A) D(B) = e^(i Im(A.conj B)) D(A + B), P D(A) P^-1 = D(e^(-i omega) A):
//     U' = e^(i x chi) D(x kappa) P Phi Vt,
//     Vt = a + b D((1 - 2x) gamma) T           (the hop, dressed: T flips x, then the displacement reads the new x)
//     kappa_k = e^(-i omega_k)(alpha_k + gamma_k) - gamma_k = (1 - lambda_k) e^(-i omega_k) alpha_k
//     chi = Im sum alpha.conj(gamma) - Im sum gamma.conj(e^(-i omega)(alpha + gamma))   (the polaron shift)
// With lambda = 1 (the charge's whole static field, Lang-Firsov) the kick is gone: the light is free and every
// coupling sits in the hop, whose amplitude |b| = sin(theta / 2) is small when the gap theta is. With lambda = 0
// the frame is the lab.
//
// THE RESTRICTION. As in code/measure/few-quanta: the light held to at most two quanta, every displacement's
// matrix elements taken exactly within that sector (normal ordered, no rotating-wave cut), what it sends to three
// quanta dropped and measured. The lab-frame population is read back exactly: P_e = |e0|^2 |psi'_0|^2 +
// |e1|^2 |psi'_1|^2 + 2 Re(e0 conj(e1) <psi'_0 | D(gamma) psi'_1>), and the last inner product needs only the
// two-quanta part of D(gamma) psi'_1 because psi'_0 lies in it.

export type FrameInput = {
  readonly omega: ArrayLike<number>
  readonly u: ArrayLike<number>
  readonly g: number
  readonly hop: number
  readonly drift: number
  readonly root: number
  readonly lambda: ArrayLike<number>
}

export type Frame = {
  readonly modes: number
  readonly dim: number
  readonly omega: Float64Array
  readonly u: Float64Array
  readonly g: number
  readonly lambda: Float64Array
  readonly alphaRe: Float64Array
  readonly alphaIm: Float64Array
  readonly betaRe: Float64Array
  readonly betaIm: Float64Array
  readonly gammaRe: Float64Array
  readonly gammaIm: Float64Array
  readonly kappaRe: Float64Array
  readonly kappaIm: Float64Array
  // sum |gamma|^2 (the dressed hop's Debye-Waller exponent) and sum |kappa|^2
  readonly W: number
  readonly K: number
  readonly chi: number
  readonly hopA: readonly [number, number]
  readonly hopB: readonly [number, number]
  readonly atomPhase: number
  readonly pairStart: Int32Array
}

// the static field of a charge held at x = 1: beta = alpha / (e^(i omega) - 1), alpha = -i g u
export function staticField(
  omega: number,
  u: number,
  g: number,
): [number, number] {
  const dr = Math.cos(omega) - 1
  const di = Math.sin(omega)
  const d2 = dr * dr + di * di
  // alpha = (0, -g u); alpha / d = alpha conj(d) / |d|^2
  const ar = 0
  const ai = -g * u

  return [(ar * dr + ai * di) / d2, (ai * dr - ar * di) / d2]
}

export function buildFrame(input: FrameInput): Frame {
  const M = input.omega.length
  const omega = Float64Array.from(input.omega)
  const u = Float64Array.from(input.u)
  const lambda = Float64Array.from(input.lambda)
  const alphaRe = new Float64Array(M)
  const alphaIm = new Float64Array(M)
  const betaRe = new Float64Array(M)
  const betaIm = new Float64Array(M)
  const gammaRe = new Float64Array(M)
  const gammaIm = new Float64Array(M)
  const kappaRe = new Float64Array(M)
  const kappaIm = new Float64Array(M)

  let W = 0
  let K = 0
  let chi = 0

  for (let k = 0; k < M; k++) {
    const [br, bi] = staticField(omega[k]!, u[k]!, input.g)

    alphaIm[k] = -input.g * u[k]!
    betaRe[k] = br
    betaIm[k] = bi
    gammaRe[k] = lambda[k]! * br
    gammaIm[k] = lambda[k]! * bi

    // s = alpha + gamma, rotated: r = e^(-i omega) s
    const sr = alphaRe[k]! + gammaRe[k]!
    const si = alphaIm[k]! + gammaIm[k]!
    const c = Math.cos(omega[k]!)
    const s = Math.sin(omega[k]!)
    const rr = c * sr + s * si
    const ri = c * si - s * sr

    kappaRe[k] = rr - gammaRe[k]!
    kappaIm[k] = ri - gammaIm[k]!
    W += gammaRe[k]! ** 2 + gammaIm[k]! ** 2
    K += kappaRe[k]! ** 2 + kappaIm[k]! ** 2
    // Im(alpha conj gamma) - Im(gamma conj r)
    chi +=
      alphaIm[k]! * gammaRe[k]! -
      alphaRe[k]! * gammaIm[k]! -
      (gammaIm[k]! * rr - gammaRe[k]! * ri)
  }

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
    omega,
    u,
    g: input.g,
    lambda,
    alphaRe,
    alphaIm,
    betaRe,
    betaIm,
    gammaRe,
    gammaIm,
    kappaRe,
    kappaIm,
    W,
    K,
    chi,
    hopA: [(1 + Math.cos(z)) / 2, Math.sin(z) / 2],
    hopB: [(1 - Math.cos(z)) / 2, -Math.sin(z) / 2],
    atomPhase: (-2 * Math.PI * input.drift) / input.root,
    pairStart,
  }
}

// ---------------------------------------------------------------------------------------------------------
// a displacement D(sign d) on one Fock block (offset), truncated at two quanta, d complex per mode:
// D(d) = e^(-|d|^2 / 2) e^(d b^dag) e^(-conj(d) b); returns the weight it sent past two quanta (the dropped part,
// measured before the truncation from the block's norm, which D keeps)

export type Scratch = {
  r1: Float64Array
  i1: Float64Array
  cr: Float64Array
  ci: Float64Array
  dr: Float64Array
  di: Float64Array
}

export function makeScratch(modes: number): Scratch {
  return {
    r1: new Float64Array(modes),
    i1: new Float64Array(modes),
    cr: new Float64Array(modes),
    ci: new Float64Array(modes),
    dr: new Float64Array(modes),
    di: new Float64Array(modes),
  }
}

const SQRT2 = Math.SQRT2

export function displaceBlock(
  q: Frame,
  dRe: Float64Array,
  dIm: Float64Array,
  sign: number,
  re: Float64Array,
  im: Float64Array,
  offset: number,
  scratch: Scratch,
): number {
  const M = q.modes
  const { r1, i1, cr, ci, dr, di } = scratch

  let A = 0
  let before = 0

  for (let j = offset; j < offset + q.dim; j++) {
    before += re[j]! ** 2 + im[j]! ** 2
  }

  for (let a = 0; a < M; a++) {
    dr[a] = sign * dRe[a]!
    di[a] = sign * dIm[a]!
    // c = -conj(d)
    cr[a] = -dr[a]!
    ci[a] = di[a]!
    A += dr[a]! ** 2 + di[a]! ** 2
  }

  // step 1: e^(c b), c = -conj(d)
  let c0r = re[offset]!
  let c0i = im[offset]!

  for (let a = 0; a < M; a++) {
    r1[a] = re[offset + 1 + a]!
    i1[a] = im[offset + 1 + a]!
  }

  for (let a = 0; a < M; a++) {
    const car = cr[a]!
    const cai = ci[a]!
    const xr = re[offset + 1 + a]!
    const xi = im[offset + 1 + a]!

    // c0 += c_a c1_a
    c0r += car * xr - cai * xi
    c0i += car * xi + cai * xr

    const base = offset + q.pairStart[a]!
    const pr = re[base]!
    const pi = im[base]!
    // c0 += c_a^2 / sqrt2 c2_aa ; c1_a += sqrt2 c_a c2_aa
    const sqr = car * car - cai * cai
    const sqi = 2 * car * cai

    c0r += (sqr * pr - sqi * pi) / SQRT2
    c0i += (sqr * pi + sqi * pr) / SQRT2
    r1[a] = r1[a]! + SQRT2 * (car * pr - cai * pi)
    i1[a] = i1[a]! + SQRT2 * (car * pi + cai * pr)

    for (let b = a + 1; b < M; b++) {
      const cbr = cr[b]!
      const cbi = ci[b]!
      const qr = re[base + (b - a)]!
      const qi = im[base + (b - a)]!
      // c0 += c_a c_b c2_ab
      const abr = car * cbr - cai * cbi
      const abi = car * cbi + cai * cbr

      c0r += abr * qr - abi * qi
      c0i += abr * qi + abi * qr
      // c1_a += c_b c2_ab ; c1_b += c_a c2_ab
      r1[a] = r1[a]! + (cbr * qr - cbi * qi)
      i1[a] = i1[a]! + (cbr * qi + cbi * qr)
      r1[b] = r1[b]! + (car * qr - cai * qi)
      i1[b] = i1[b]! + (car * qi + cai * qr)
    }
  }

  // step 2: e^(d b^dag), truncated
  for (let a = 0; a < M; a++) {
    const dar = dr[a]!
    const dai = di[a]!
    const base = offset + q.pairStart[a]!
    // c2_aa += sqrt2 d_a c1_a + d_a^2 / sqrt2 c0
    const sqr = dar * dar - dai * dai
    const sqi = 2 * dar * dai

    re[base] =
      re[base]! +
      SQRT2 * (dar * r1[a]! - dai * i1[a]!) +
      (sqr * c0r - sqi * c0i) / SQRT2

    im[base] =
      im[base]! +
      SQRT2 * (dar * i1[a]! + dai * r1[a]!) +
      (sqr * c0i + sqi * c0r) / SQRT2

    for (let b = a + 1; b < M; b++) {
      const dbr = dr[b]!
      const dbi = di[b]!
      const j = base + (b - a)
      // c2_ab += d_a c1_b + d_b c1_a + d_a d_b c0
      const abr = dar * dbr - dai * dbi
      const abi = dar * dbi + dai * dbr

      re[j] =
        re[j]! +
        (dar * r1[b]! - dai * i1[b]!) +
        (dbr * r1[a]! - dbi * i1[a]!) +
        (abr * c0r - abi * c0i)

      im[j] =
        im[j]! +
        (dar * i1[b]! + dai * r1[b]!) +
        (dbr * i1[a]! + dbi * r1[a]!) +
        (abr * c0i + abi * c0r)
    }
  }

  const damp = Math.exp(-A / 2)

  re[offset] = damp * c0r
  im[offset] = damp * c0i

  for (let a = 0; a < M; a++) {
    // c1_a = c1'_a + d_a c0
    re[offset + 1 + a] = damp * (r1[a]! + dr[a]! * c0r - di[a]! * c0i)
    im[offset + 1 + a] = damp * (i1[a]! + dr[a]! * c0i + di[a]! * c0r)
  }

  for (let j = offset + 1 + M; j < offset + q.dim; j++) {
    re[j] = damp * re[j]!
    im[j] = damp * im[j]!
  }

  let after = 0

  for (let j = offset; j < offset + q.dim; j++) {
    after += re[j]! ** 2 + im[j]! ** 2
  }

  return before - after
}

// ---------------------------------------------------------------------------------------------------------
// the restricted beat in the frame: Vt, the x = 1 phase (atom drift and chi), the free phases, D(x kappa)

export type FrameRun = {
  re: Float64Array
  im: Float64Array
  tRe: Float64Array
  tIm: Float64Array
  scratch: Scratch
  phaseRe: Float64Array
  phaseIm: Float64Array
  // the weight dropped past two quanta, summed over the run
  dropped: number
}

export function frameRun(q: Frame): FrameRun {
  const phaseRe = new Float64Array(q.dim)
  const phaseIm = new Float64Array(q.dim)

  phaseRe[0] = 1

  for (let a = 0; a < q.modes; a++) {
    phaseRe[1 + a] = Math.cos(-q.omega[a]!)
    phaseIm[1 + a] = Math.sin(-q.omega[a]!)

    for (let b = a; b < q.modes; b++) {
      const t = -(q.omega[a]! + q.omega[b]!)
      const j = q.pairStart[a]! + (b - a)

      phaseRe[j] = Math.cos(t)
      phaseIm[j] = Math.sin(t)
    }
  }

  return {
    re: new Float64Array(2 * q.dim),
    im: new Float64Array(2 * q.dim),
    tRe: new Float64Array(2 * q.dim),
    tIm: new Float64Array(2 * q.dim),
    scratch: makeScratch(q.modes),
    phaseRe,
    phaseIm,
    dropped: 0,
  }
}

// the lab state atom (x) vacuum, carried into the frame: psi'_0 = e0 |0>, psi'_1 = e1 D(-gamma)|0> (truncated;
// returns the start's dropped weight)
export function frameStart(
  q: Frame,
  run: FrameRun,
  atom: readonly [number, number, number, number],
): number {
  run.re.fill(0)
  run.im.fill(0)
  run.re[0] = atom[0]
  run.im[0] = atom[1]
  run.re[q.dim] = 1

  const lost = displaceBlock(
    q,
    q.gammaRe,
    q.gammaIm,
    -1,
    run.re,
    run.im,
    q.dim,
    run.scratch,
  )

  for (let j = q.dim; j < 2 * q.dim; j++) {
    const xr = run.re[j]!
    const xi = run.im[j]!

    run.re[j] = atom[2] * xr - atom[3] * xi
    run.im[j] = atom[2] * xi + atom[3] * xr
  }

  run.dropped = 0

  return lost * (atom[2] ** 2 + atom[3] ** 2)
}

export function frameBeat(q: Frame, run: FrameRun): void {
  const { re, im, tRe, tIm } = run
  const d = q.dim
  const [ar, ai] = q.hopA
  const [br, bi] = q.hopB

  // Vt: new psi0 = a psi0 + b D(gamma) psi1 ; new psi1 = a psi1 + b D(-gamma) psi0
  tRe.set(re)
  tIm.set(im)
  run.dropped +=
    Math.abs(
      displaceBlock(
        q,
        q.gammaRe,
        q.gammaIm,
        1,
        tRe,
        tIm,
        d,
        run.scratch,
      ),
    ) *
    (br * br + bi * bi)

  run.dropped +=
    Math.abs(
      displaceBlock(
        q,
        q.gammaRe,
        q.gammaIm,
        -1,
        tRe,
        tIm,
        0,
        run.scratch,
      ),
    ) *
    (br * br + bi * bi)

  for (let i = 0; i < d; i++) {
    const x0r = re[i]!
    const x0i = im[i]!
    const x1r = re[d + i]!
    const x1i = im[d + i]!
    // t[d + i] holds D(gamma) psi1, t[i] holds D(-gamma) psi0
    const y1r = tRe[d + i]!
    const y1i = tIm[d + i]!
    const y0r = tRe[i]!
    const y0i = tIm[i]!

    re[i] = ar * x0r - ai * x0i + br * y1r - bi * y1i
    im[i] = ar * x0i + ai * x0r + br * y1i + bi * y1r
    re[d + i] = ar * x1r - ai * x1i + br * y0r - bi * y0i
    im[d + i] = ar * x1i + ai * x1r + br * y0i + bi * y0r
  }

  // the x = 1 phase: the atom's drift and the polaron shift
  const t = q.atomPhase + q.chi
  const cr = Math.cos(t)
  const ci = Math.sin(t)

  for (let i = d; i < 2 * d; i++) {
    const xr = re[i]!
    const xi = im[i]!

    re[i] = xr * cr - xi * ci
    im[i] = xr * ci + xi * cr
  }

  // the free phases
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

  // the residual kick on x = 1
  if (q.K > 0) {
    run.dropped += Math.abs(
      displaceBlock(q, q.kappaRe, q.kappaIm, 1, re, im, d, run.scratch),
    )
  }
}

// the atom's lab-frame density matrix rho[x][x'] = <psi_x' | psi_x> (lab psi_0 = psi'_0, psi_1 = D(gamma) psi'_1),
// as [re00, re01, im01, re11]: rho_10 = conj(rho_01)
export function frameAtomMatrix(
  q: Frame,
  run: FrameRun,
): { r00: number; r11: number; r01Re: number; r01Im: number } {
  const d = q.dim

  let n0 = 0
  let n1 = 0

  for (let i = 0; i < d; i++) {
    n0 += run.re[i]! ** 2 + run.im[i]! ** 2
    n1 += run.re[d + i]! ** 2 + run.im[d + i]! ** 2
  }

  run.tRe.set(run.re)
  run.tIm.set(run.im)
  displaceBlock(
    q,
    q.gammaRe,
    q.gammaIm,
    1,
    run.tRe,
    run.tIm,
    d,
    run.scratch,
  )

  // rho_01 = <psi_1 | psi_0> = conj(<psi_0 | psi_1>)
  let sr = 0
  let si = 0

  for (let i = 0; i < d; i++) {
    const ar = run.re[i]!
    const ai = run.im[i]!
    const br = run.tRe[d + i]!
    const bi = run.tIm[d + i]!

    // <psi_0|psi_1> = sum conj(a) b
    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }

  return { r00: n0, r11: n1, r01Re: sr, r01Im: -si }
}

// <s| rho |t> for atom states s, t on (x = 0, 1)
export function atomElement(
  rho: { r00: number; r11: number; r01Re: number; r01Im: number },
  s: readonly [number, number, number, number],
  t: readonly [number, number, number, number],
): [number, number] {
  // rho as complex 2x2: [[r00, r01], [conj r01, r11]]
  const R: [number, number][][] = [
    [
      [rho.r00, 0],
      [rho.r01Re, rho.r01Im],
    ],
    [
      [rho.r01Re, -rho.r01Im],
      [rho.r11, 0],
    ],
  ]

  let re = 0
  let im = 0

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      // conj(s_x) R_xy t_y
      const sr = s[2 * x]!
      const si = -s[2 * x + 1]!
      const tr = t[2 * y]!
      const ti = t[2 * y + 1]!
      const [rr, ri] = R[x]![y]!
      const ar = sr * rr - si * ri
      const ai = sr * ri + si * rr

      re += ar * tr - ai * ti
      im += ar * ti + ai * tr
    }
  }

  return [re, im]
}

// the lab-frame population of `state` and the frame state's norm
export function frameRead(
  q: Frame,
  run: FrameRun,
  state: readonly [number, number, number, number],
): { population: number; norm: number; two: number } {
  const d = q.dim

  let n0 = 0
  let n1 = 0
  let two = 0

  for (let i = 0; i < d; i++) {
    const w0 = run.re[i]! ** 2 + run.im[i]! ** 2
    const w1 = run.re[d + i]! ** 2 + run.im[d + i]! ** 2

    n0 += w0
    n1 += w1

    if (i > q.modes) {
      two += w0 + w1
    }
  }

  // <psi0 | D(gamma) psi1>
  run.tRe.set(run.re)
  run.tIm.set(run.im)
  displaceBlock(
    q,
    q.gammaRe,
    q.gammaIm,
    1,
    run.tRe,
    run.tIm,
    d,
    run.scratch,
  )

  let sr = 0
  let si = 0

  for (let i = 0; i < d; i++) {
    const ar = run.re[i]!
    const ai = run.im[i]!
    const br = run.tRe[d + i]!
    const bi = run.tIm[d + i]!

    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }

  const [e0r, e0i, e1r, e1i] = state
  // e0 conj(e1)
  const pr = e0r * e1r + e0i * e1i
  const pi = e0i * e1r - e0r * e1i
  const population =
    (e0r ** 2 + e0i ** 2) * n0 +
    (e1r ** 2 + e1i ** 2) * n1 +
    2 * (pr * sr - pi * si)

  return { population, norm: n0 + n1, two }
}

// ---------------------------------------------------------------------------------------------------------
// the frame's zeroth order and its golden rule (the predictions, derived before any run)

type C = [number, number]

const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cscale = (a: C, s: number): C => [a[0] * s, a[1] * s]
const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cexp = (t: number): C => [Math.cos(t), Math.sin(t)]

function csqrt(a: C): C {
  const r = Math.sqrt(Math.hypot(a[0], a[1]))
  const t = Math.atan2(a[1], a[0]) / 2

  return [r * Math.cos(t), r * Math.sin(t)]
}

export type Dressed = {
  // the dressed gap (the zeroth order's quasi-energy difference) and the dressed states (normalized right
  // eigenvectors on x = 0, 1)
  gap: number
  ground: [number, number, number, number]
  excited: [number, number, number, number]
  // |eigenvalue| of the excited level (below 1: the zeroth order's leak into the light)
  modulus: number
}

// the zeroth order of the frame's beat: <0| U' |0> = e^(i x chi) e^(-x K / 2) Phi (a + b e^(-W/2) T)
export function dressedAtom(input: {
  hopA: readonly [number, number]
  hopB: readonly [number, number]
  atomPhase: number
  chi: number
  W: number
  K: number
}): Dressed {
  const a: C = [input.hopA[0], input.hopA[1]]
  const b = cscale(
    [input.hopB[0], input.hopB[1]],
    Math.exp(-input.W / 2),
  )
  const row1 = cscale(
    cexp(input.atomPhase + input.chi),
    Math.exp(-input.K / 2),
  )
  // A = [[a, b], [row1 b, row1 a]]
  const A00 = a
  const A01 = b
  const A10 = cmul(row1, b)
  const A11 = cmul(row1, a)
  const tr = cadd(A00, A11)
  const det = csub(cmul(A00, A11), cmul(A01, A10))
  const disc = csqrt(csub(cmul(tr, tr), cscale(det, 4)))
  const l1 = cscale(cadd(tr, disc), 0.5)
  const l2 = cscale(csub(tr, disc), 0.5)

  const vec = (l: C): [number, number, number, number] => {
    // (A00 - l) v0 + A01 v1 = 0 -> v = (A01, l - A00)
    let v0 = A01
    let v1 = csub(l, A00)

    const n = Math.sqrt(cabs2(v0) + cabs2(v1))

    v0 = cscale(v0, 1 / n)
    v1 = cscale(v1, 1 / n)

    return [v0[0], v0[1], v1[0], v1[1]]
  }

  const e1 = -Math.atan2(l1[1], l1[0])
  const e2 = -Math.atan2(l2[1], l2[0])
  const [g, e] = e1 < e2 ? [l1, l2] : [l2, l1]
  const gap =
    (((Math.atan2(g[1], g[0]) - Math.atan2(e[1], e[0])) %
      (2 * Math.PI)) +
      2 * Math.PI) %
    (2 * Math.PI)

  return {
    gap,
    ground: vec(g),
    excited: vec(e),
    modulus: Math.sqrt(cabs2(e)),
  }
}

// the ring's rung-0 amplitude and frequency at any k (the continuum of code/measure/few-quanta stripModes)
export function ringMode(
  n: number,
  L: number,
  f: number,
  kappa: number,
  k: number,
): { omega: number; u: number; velocity: number } {
  const hbar = n / (2 * Math.PI)
  const omega = Math.acos(1 - (kappa * (2 - 2 * Math.cos(k))) / 2)
  const u = Math.sqrt(
    ((4 * Math.sin(k / 2) ** 2) / L) *
      (hbar / 2) *
      (f / Math.sin(omega)),
  )

  return { omega, u, velocity: (kappa * Math.sin(k)) / Math.sin(omega) }
}

export type FramePrediction = {
  // the dressed gap, the resonant wave number, the golden rule in the frame and its parts
  gap: number
  k: number
  rate: number
  debyeWaller: number
  lambdaAtResonance: number
  dressed: Dressed
}

// the Floquet golden rule in the frame: Gamma = 2 L |<g_r| M(k*) |e_r>|^2 / v_g, omega(k*) = the dressed gap, with
//   M_k = e^(i x chi) e^(-x K/2) [ x kappa_k Phi (a + b e^(-W/2) T) + e^(-i omega_k) Phi b (1 - 2x) gamma_k e^(-W/2) T ]
// (the first order of the kick and of the dressed hop, the Debye-Waller factor e^(-W/2) carried by every term that
// passes through the dressed hop). `lambdaOf` gives lambda at the resonant k.
export function framePrediction(input: {
  n: number
  L: number
  f: number
  kappa: number
  g: number
  hopA: readonly [number, number]
  hopB: readonly [number, number]
  atomPhase: number
  chi: number
  W: number
  K: number
  lambdaOf: (omega: number) => number
}): FramePrediction {
  const dressed = dressedAtom(input)
  const target = (2 - 2 * Math.cos(dressed.gap)) / input.kappa

  let lo = 0
  let hi = Math.PI

  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2

    if (2 - 2 * Math.cos(mid) < target) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const k = (lo + hi) / 2
  const mode = ringMode(input.n, input.L, input.f, input.kappa, k)
  const lambda = input.lambdaOf(mode.omega)
  const [br, bi] = staticField(mode.omega, mode.u, input.g)
  const gamma: C = [lambda * br, lambda * bi]
  const alpha: C = [0, -input.g * mode.u]
  const kick = cscale(cmul(cexp(-mode.omega), alpha), 1 - lambda)
  const dw = Math.exp(-input.W / 2)
  const a: C = [input.hopA[0], input.hopA[1]]
  const b: C = [input.hopB[0], input.hopB[1]]
  const phi1 = cscale(
    cexp(input.atomPhase + input.chi),
    Math.exp(-input.K / 2),
  )
  // M as a 2x2 on (x = 0, x = 1): row x, column x'
  // term 1: x kappa Phi (a + b dw T): only row 1; Phi row 1 = phi1
  // term 2: e^(-i omega) Phi b (1 - 2x) gamma dw T: row x from column 1 - x, sign (1 - 2x)
  const t2 = cscale(cmul(cmul(cexp(-mode.omega), b), gamma), dw)
  const M00: C = [0, 0]
  const M01: C = t2
  const M10: C = cmul(phi1, cscale(cmul(kick, b), dw))
  const M11: C = cmul(phi1, cmul(kick, a))
  const M10b = cadd(M10, cscale(cmul(phi1, t2), -1))
  const [g0r, g0i, g1r, g1i] = dressed.ground
  const [e0r, e0i, e1r, e1i] = dressed.excited
  const e0: C = [e0r, e0i]
  const e1: C = [e1r, e1i]
  const Me0 = cadd(cmul(M00, e0), cmul(M01, e1))
  const Me1 = cadd(cmul(M10b, e0), cmul(M11, e1))
  // <g| M |e> = conj(g0) Me0 + conj(g1) Me1
  const amp = cadd(cmul([g0r, -g0i], Me0), cmul([g1r, -g1i], Me1))
  // |u|^2 carries 1 / L, so 2 L |amp|^2 / v is L-free
  const rate = (2 * input.L * cabs2(amp)) / mode.velocity

  return {
    gap: dressed.gap,
    k,
    rate,
    debyeWaller: dw * dw,
    lambdaAtResonance: lambda,
    dressed,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the two frames the experiments compare

// Lang-Firsov: the charge's whole static field, lambda = 1 on every mode
export const langFirsov = (omega: number): number => (omega > 0 ? 1 : 0)

// Silbey-Harris at zero temperature, transcribed to the beat: a mode follows the charge in proportion to its chord
// frequency against the dressed gap's, lambda = sin(omega / 2) / (sin(omega / 2) + sin(gap_r / 2)) (Hamiltonian
// form omega / (omega + Delta_r); the chord 2 sin(omega/2) = |e^(i omega) - 1| is the beat's own denominator),
// gap_r solved self-consistently from the frame's zeroth order
export const silbeyHarris =
  (gap: number) =>
  (omega: number): number =>
    Math.sin(omega / 2) / (Math.sin(omega / 2) + Math.sin(gap / 2))

export type FrameChoice = {
  frame: Frame
  prediction: FramePrediction
  iterations: number
}

export function chooseFrame(input: {
  n: number
  L: number
  f: number
  kappa: number
  g: number
  hop: number
  drift: number
  root: number
  omega: Float64Array
  u: Float64Array
  kind: 'lang-firsov' | 'silbey-harris' | 'lab'
  bareGap: number
}): FrameChoice {
  let gap = input.bareGap
  let iterations = 0
  let frame: Frame | undefined
  let prediction: FramePrediction | undefined

  for (let it = 0; it < 200; it++) {
    const lambdaOf =
      input.kind === 'lang-firsov'
        ? langFirsov
        : input.kind === 'lab'
          ? () => 0
          : silbeyHarris(gap)
    const lambda = Array.from(input.omega, w => lambdaOf(w))

    frame = buildFrame({
      omega: input.omega,
      u: input.u,
      g: input.g,
      hop: input.hop,
      drift: input.drift,
      root: input.root,
      lambda,
    })

    prediction = framePrediction({
      n: input.n,
      L: input.L,
      f: input.f,
      kappa: input.kappa,
      g: input.g,
      hopA: frame.hopA,
      hopB: frame.hopB,
      atomPhase: frame.atomPhase,
      chi: frame.chi,
      W: frame.W,
      K: frame.K,
      lambdaOf,
    })
    iterations = it + 1

    if (
      input.kind !== 'silbey-harris' ||
      Math.abs(prediction.gap - gap) < 1e-13
    ) {
      break
    }

    gap = prediction.gap
  }

  return { frame: frame!, prediction: prediction!, iterations }
}
