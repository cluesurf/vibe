// The g of a spinor token in the slow, weak-field limit, read off the period's symbol to second order in the
// momentum, with no lattice and no field. Used by E-MTR-0016 and E-MTR-0017. (The token is a STAND-IN, see
// code/rule/spinor-token.)
//
// THE WALK. Four components per dock, index 2 slot + spin. Every beat applies the coin C = e^(i mu) e^(-i mu
// tau_x) (the model's fear coin SWAP^(2/3) at mu = pi / 3) and then its stream. An in-plane stream along axis a
// (x or y) is e^(-i pi_a Gamma), Gamma = sigma_a (tau_z cos psi + tau_y sin psi); psi = 0 is code/rule/
// spinor-token's 'locked' mode (Gamma = tau_z sigma_a), and psi is the LOCK ANGLE, the slot combination the spin
// steers. A beat with no in-plane stream (a z beat or a depth beat at k_z = 0) is the coin alone. pi_x and pi_y
// are the kinetic momenta, operators with [pi_x, pi_y] = i beta, beta the charge times the field.
//
// THE METHOD. The period is expanded to second order in (pi_x, pi_y) with the products kept in order:
// U = U0 + sum_a pi_a U_a + sum_(a, b) pi_a pi_b U_ab, with 4 x 4 matrix coefficients (the pi commute with the
// matrices, not with each other). U0 = C^N has eigenvalue lambda_P = 1 on the particle band P (tau_x = +1) and
// lambda_Q = e^(2 i N mu) on the antiparticle band Q. Second-order degenerate perturbation theory (Brillouin-
// Wigner at lambda_P) gives the particle band's effective unitary U_P = lambda_P (1 - i H) with
//
//   H = sum_(a, b) pi_a pi_b K_ab,   K_ab = (i / lambda_P) (P U_ab P + P U_a Q U_b P / (lambda_P - lambda_Q)),
//
// each K_ab a 2 x 2 matrix on the spin of P. For in-plane streams each is diagonal in sigma_z, so in the sector
// sigma_z = s the Hamiltonian is A pi_x^2 + B pi_y^2 + 2 C sym(pi_x pi_y) + Z beta with A = K_xx, B = K_yy,
// C = (K_xy + K_yx) / 2 and Z = i (K_xy - K_yx) / 2. Its Landau levels are 2 sqrt(AB - C^2) |beta| (n + 1/2)
// (a bowl when AB > C^2), shifted by Z beta, so
//
//   g = 4 |Z| / (2 sqrt(AB - C^2)) = |K_xy - K_yx| / sqrt(AB - C^2),
//
// the Dirac value 2 when the spin-favored level sits exactly at the rest energy. The consistency checks the
// method carries: the first-order term P U_a P vanishes, H is Hermitian (its anti-Hermitian part, a norm loss,
// cancels at this order), and the two sectors share one cyclotron frequency.
//
// For a period with one x stream and one y stream, the closed form (derived in E-MTR-0016's header) is
//   g = 2 |X| / sqrt(X^2 - 1),   X = cos(delta - phi / 2) / sin(phi / 2),
// delta = the frame angle between the two streams (2 mu per coin between them, plus psi_y - psi_x) and phi =
// 2 N mu the rest gap per period; the band is a bowl exactly when X^2 > 1.
//
// Floating point on 4 x 4 matrices, deterministic.

export type TokenStep = { readonly axis: 'x' | 'y' | 'none'; readonly lock?: number }

type Mat = { re: Float64Array; im: Float64Array }

const zero = (): Mat => ({ re: new Float64Array(16), im: new Float64Array(16) })

function identity(): Mat {
  const m = zero()

  for (let i = 0; i < 4; i++) {
    m.re[i * 5] = 1
  }

  return m
}

function mul(a: Mat, b: Mat): Mat {
  const out = zero()

  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      const ar = a.re[i * 4 + k] ?? 0
      const ai = a.im[i * 4 + k] ?? 0

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < 4; j++) {
        const br = b.re[k * 4 + j] ?? 0
        const bi = b.im[k * 4 + j] ?? 0

        out.re[i * 4 + j] = (out.re[i * 4 + j] ?? 0) + ar * br - ai * bi
        out.im[i * 4 + j] = (out.im[i * 4 + j] ?? 0) + ar * bi + ai * br
      }
    }
  }

  return out
}

function add(a: Mat, b: Mat): Mat {
  return { re: a.re.map((x, i) => x + (b.re[i] ?? 0)), im: a.im.map((x, i) => x + (b.im[i] ?? 0)) }
}

// s a, s = sr + i si
function scale(a: Mat, sr: number, si: number): Mat {
  return { re: a.re.map((x, i) => x * sr - (a.im[i] ?? 0) * si), im: a.im.map((x, i) => (a.re[i] ?? 0) * si + x * sr) }
}

// a 4 x 4 matrix from a slot (tau) 2 x 2 and a spin (sigma) 2 x 2, both complex [re, im] row-major
function kron(tau: readonly (readonly [number, number])[], sigma: readonly (readonly [number, number])[]): Mat {
  const m = zero()

  for (let t1 = 0; t1 < 2; t1++) {
    for (let t2 = 0; t2 < 2; t2++) {
      for (let s1 = 0; s1 < 2; s1++) {
        for (let s2 = 0; s2 < 2; s2++) {
          const [ar, ai] = tau[t1 * 2 + t2] ?? [0, 0]
          const [br, bi] = sigma[s1 * 2 + s2] ?? [0, 0]
          const at = (2 * t1 + s1) * 4 + (2 * t2 + s2)

          m.re[at] = ar * br - ai * bi
          m.im[at] = ar * bi + ai * br
        }
      }
    }
  }

  return m
}

const ONE2: [number, number][] = [[1, 0], [0, 0], [0, 0], [1, 0]]
const PX: [number, number][] = [[0, 0], [1, 0], [1, 0], [0, 0]]
const PY: [number, number][] = [[0, 0], [0, -1], [0, 1], [0, 0]]
const PZ: [number, number][] = [[1, 0], [0, 0], [0, 0], [-1, 0]]

// the coin e^(i mu) e^(-i mu tau_x) on the slots
export function coinOf(mu: number): Mat {
  const a: [number, number] = [(1 + Math.cos(2 * mu)) / 2, Math.sin(2 * mu) / 2]
  const b: [number, number] = [(1 - Math.cos(2 * mu)) / 2, -Math.sin(2 * mu) / 2]

  return kron([a, b, b, a], ONE2)
}

// Gamma = sigma_a (tau_z cos psi + tau_y sin psi)
export function streamGenerator(axis: 'x' | 'y', lock: number): Mat {
  const c = Math.cos(lock)
  const s = Math.sin(lock)
  const tau: [number, number][] = [
    [c, 0],
    [0, -s],
    [0, s],
    [-c, 0],
  ]

  return kron(tau, axis === 'x' ? PX : PY)
}

// a period's expansion: c0, c1[a], c2[a][b], a, b in {0: x, 1: y}
type Poly = { c0: Mat; c1: [Mat, Mat]; c2: [[Mat, Mat], [Mat, Mat]] }

function polyOf(c0: Mat): Poly {
  return { c0, c1: [zero(), zero()], c2: [[zero(), zero()], [zero(), zero()]] }
}

function polyMul(a: Poly, b: Poly): Poly {
  const out = polyOf(mul(a.c0, b.c0))

  for (let i = 0; i < 2; i++) {
    out.c1[i] = add(mul(a.c1[i] as Mat, b.c0), mul(a.c0, b.c1[i] as Mat))

    for (let j = 0; j < 2; j++) {
      out.c2[i]![j] = add(add(mul((a.c2[i] as [Mat, Mat])[j] as Mat, b.c0), mul(a.c1[i] as Mat, b.c1[j] as Mat)), mul(a.c0, (b.c2[i] as [Mat, Mat])[j] as Mat))
    }
  }

  return out
}

// the expansion of one beat: the coin, then e^(-i pi_a Gamma) = 1 - i pi_a Gamma - pi_a^2 / 2 (Gamma^2 = 1)
function beatPoly(step: TokenStep, coin: Mat): Poly {
  const coinPoly = polyOf(coin)

  if (step.axis === 'none') {
    return coinPoly
  }

  const a = step.axis === 'x' ? 0 : 1
  const stream = polyOf(identity())

  stream.c1[a] = scale(streamGenerator(step.axis, step.lock ?? 0), 0, -1)
  stream.c2[a]![a] = scale(identity(), -0.5, 0)

  return polyMul(stream, coinPoly)
}

export type TokenG = {
  // the rest phase of the antiparticle band per period, in (-pi, pi]
  restGap: number
  // per sector s = +1, -1 (sigma_z on the particle band): A, B, C and Z / beta
  sectors: { s: number; a: number; b: number; c: number; zeeman: number }[]
  // 2 sqrt(AB - C^2) per sector (the cyclotron frequency over |beta|), NaN where AB <= C^2
  cyclotron: number[]
  // |K_xy - K_yx| / sqrt(AB - C^2), from sector +1; NaN when not a bowl
  g: number
  bowl: boolean
  // consistency: the largest first-order particle-band entry, the anti-Hermitian residue, sigma_z off-diagonals
  firstOrder: number
  antiHermitian: number
  offDiagonal: number
}

// The slow-limit g of a schedule (first step applied first) at coin angle mu.
export function tokenG(input: { schedule: readonly TokenStep[]; mu: number }): TokenG {
  const coin = coinOf(input.mu)
  let period = polyOf(identity())

  for (const step of input.schedule) {
    period = polyMul(beatPoly(step, coin), period)
  }

  // P = (1 + tau_x) / 2, Q = 1 - P
  const tauX = kron(PX, ONE2)
  const p = scale(add(identity(), tauX), 0.5, 0)
  const q = add(identity(), scale(p, -1, 0))
  const u0 = period.c0
  const trace = (m: Mat): [number, number] => {
    let re = 0
    let im = 0

    for (let i = 0; i < 4; i++) {
      re += m.re[i * 5] ?? 0
      im += m.im[i * 5] ?? 0
    }

    return [re, im]
  }
  const lp = trace(mul(p, u0)).map(x => x / 2) as [number, number]
  const lq = trace(mul(q, u0)).map(x => x / 2) as [number, number]
  const restGap = Math.atan2(lq[1] * lp[0] - lq[0] * lp[1], lq[0] * lp[0] + lq[1] * lp[1])
  // 1 / (lambda_P - lambda_Q) and i / lambda_P
  const dr = lp[0] - lq[0]
  const di = lp[1] - lq[1]
  const dd = dr * dr + di * di
  const inv: [number, number] = [dr / dd, -di / dd]
  const lpNorm = lp[0] * lp[0] + lp[1] * lp[1]
  const iOverLp: [number, number] = [lp[1] / lpNorm, lp[0] / lpNorm]
  const kernel: Mat[][] = [0, 1].map(a =>
    [0, 1].map(b => {
      const direct = mul(mul(p, (period.c2[a] as [Mat, Mat])[b] as Mat), p)
      const through = scale(mul(mul(mul(mul(p, period.c1[a] as Mat), q), period.c1[b] as Mat), p), inv[0], inv[1])

      return scale(add(direct, through), iOverLp[0], iOverLp[1])
    }),
  )
  let firstOrder = 0

  for (let a = 0; a < 2; a++) {
    const m = mul(mul(p, period.c1[a] as Mat), p)

    for (let i = 0; i < 16; i++) {
      firstOrder = Math.max(firstOrder, Math.hypot(m.re[i] ?? 0, m.im[i] ?? 0))
    }
  }

  // the particle band's basis: |+, s> = (|0 s> + |1 s>) / sqrt 2, index 2 slot + spin
  const element = (m: Mat, s1: number, s2: number): [number, number] => {
    let re = 0
    let im = 0

    for (const t1 of [0, 1]) {
      for (const t2 of [0, 1]) {
        re += (m.re[(2 * t1 + s1) * 4 + (2 * t2 + s2)] ?? 0) / 2
        im += (m.im[(2 * t1 + s1) * 4 + (2 * t2 + s2)] ?? 0) / 2
      }
    }

    return [re, im]
  }
  let offDiagonal = 0
  let antiHermitian = 0
  const sectors = [0, 1].map(spin => {
    const k = (a: number, b: number): [number, number] => element(kernel[a]?.[b] as Mat, spin, spin)
    const kxx = k(0, 0)
    const kyy = k(1, 1)
    const kxy = k(0, 1)
    const kyx = k(1, 0)

    offDiagonal = Math.max(offDiagonal, ...[0, 1].flatMap(a => [0, 1].map(b => Math.hypot(...element(kernel[a]?.[b] as Mat, spin, 1 - spin)))))
    // A, B and C must be real, Z = i (K_xy - K_yx) / 2 real
    antiHermitian = Math.max(antiHermitian, Math.abs(kxx[1]), Math.abs(kyy[1]), Math.abs(kxy[1] + kyx[1]), Math.abs(kxy[0] - kyx[0]))

    return { s: spin === 0 ? 1 : -1, a: kxx[0], b: kyy[0], c: (kxy[0] + kyx[0]) / 2, zeeman: -(kxy[1] - kyx[1]) / 2 }
  })
  const cyclotron = sectors.map(x => (x.a * x.b > x.c * x.c ? 2 * Math.sqrt(x.a * x.b - x.c * x.c) : NaN))
  const bowl = sectors.every(x => x.a * x.b > x.c * x.c && Math.sign(x.a) === Math.sign(sectors[0]?.a ?? 0))
  const first = sectors[0] ?? { a: 0, b: 0, c: 0, zeeman: 0 }
  const g = bowl ? (4 * Math.abs(first.zeeman)) / (cyclotron[0] ?? NaN) : NaN

  return { restGap, sectors, cyclotron, g, bowl, firstOrder, antiHermitian, offDiagonal }
}

// the closed form for one x stream and one y stream: X = cos(delta - phi / 2) / sin(phi / 2), g = 2 |X| /
// sqrt(X^2 - 1), NaN when X^2 <= 1 (a saddle)
export function twoStreamG(input: { delta: number; phi: number }): { x: number; g: number } {
  const x = Math.cos(input.delta - input.phi / 2) / Math.sin(input.phi / 2)

  return { x, g: x * x > 1 ? (2 * Math.abs(x)) / Math.sqrt(x * x - 1) : NaN }
}
