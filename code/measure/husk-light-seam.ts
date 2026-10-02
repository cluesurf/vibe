// Measurement for the seam of the quantum light in its harmonic (Gaussian) reading (the experiment in
// test/experiment/gauge/husk-light-seam, E-FRC-0282): each register's vacuum variance from the leapfrog's
// invariant two-point function, its Gaussian weight past the column's seam at +-D, and the first-order shift that
// the seam's non-quadratic phase gives one quantum against the vacuum. Doubles throughout (a symbol on a grid of
// wave vectors, a cyclic Jacobi eigensolver, sums over integers), no draw.
//
// THE HARMONIC VACUUM OF A LINEAR LIGHT. A light of code/measure/husk-balance's form (links with weights w, plaquettes
// with multiplicities n, curl C) runs y' = y + s pi, pi' = pi - f A y' with y = W^(1/2) x, pi = W^(1/2) e and
// A(k) = W^(1/2) C^dag N C W^(1/2). Per eigenmode (A v = lambda v, lambda > 0) the beat is [[1, s], [-f lambda,
// 1 - s f lambda]], 2 - 2 cos omega = s f lambda, with invariant form [[f lambda, f lambda s / 2], [f lambda s / 2,
// s]] (determinant sin^2 omega), so its invariant Gaussian (the harmonic vacuum, hbar = N / (2 pi)) has
//   <|y|^2> = (hbar / 2) s / sin omega,   <|pi|^2> = (hbar / 2) f lambda / sin omega.
// A mode then puts on link l the variance c_l = (hbar / 2) (f lambda / sin omega) |v_l|^2 / w_l and on plaquette P
// c_P = (hbar / 2) (s / sin omega) |(C W^(1/2) v)_P|^2; a register's variance is the average of its c over the box's
// momenta and modes. On the ladder (w = n = 1, A = K) this is quantum-ladder's harmonicTwoPoint register by register.
//
// THE SEAM. A register holds an integer mod N = 2D + 1 read balanced, and its quadratic phase is
// exp(-i pi q bal(x)^2 / N), q = s w_l on a link (the drift) and f n_P on a plaquette (the force). The harmonic field
// is the unwrapped integer x, so the beat is the harmonic one times 1 + Delta, Delta(x) = exp(-i pi q (bal(x)^2 -
// x^2) / N) - 1, which vanishes for |x| <= D. In a Gaussian state a one-quantum state |1> of a mode carrying the
// variance c of a register X of variance sigma^2 has X's marginal p_0(x) (1 + beta (x^2 / sigma^2 - 1)), beta =
// c / sigma^2 (the characteristic function <1|exp(itX)|1> = chi_0(t) (1 - t^2 c)). So to first order in Delta:
//   the band shift of |1> against the vacuum   Im sum_registers beta a,   a = E_0[(x^2 / sigma^2 - 1) Delta(x)]
//   the quantum's excess seam kick per beat     sum_registers beta b,      b = E_0[(x^2 / sigma^2 - 1) |Delta(x)|^2]
// with E_0 the Gaussian p_0(x) ~ exp(-x^2 / (2 sigma^2)) over the integers.

import {
  jacobiEigen,
  curlAt,
  type LightSymbol,
} from '@/code/measure/husk-balance'

export type Light = { light: LightSymbol; w: number[]; n: number[] }

export type Split = { s: number; f: number; n: number }

/** One mode of the light: its momentum, lambda, omega, and the variance it puts on each register type. */
export type Mode = {
  k: number[]
  lambda: number
  omega: number
  // per link type, then per plaquette type
  link: number[]
  plaquette: number[]
}

/** Every mode with lambda > 0 at the momenta 2 pi (j + offset) / g per axis. */
export function lightModes(
  { light, w, n }: Light,
  split: Split,
  g: number,
  offset: number,
): { modes: Mode[]; points: number } {
  const L = w.length
  const P = n.length
  const hbar = split.n / (2 * Math.PI)
  const sw = w.map(Math.sqrt)
  const points = g ** light.dims
  const modes: Mode[] = []

  for (let i = 0; i < points; i++) {
    let rest = i

    const k: number[] = []

    for (let d = 0; d < light.dims; d++) {
      k.push((2 * Math.PI * ((rest % g) + offset)) / g)
      rest = Math.floor(rest / g)
    }

    const { re, im } = curlAt(light, k)
    // A = W^(1/2) C^dag N C W^(1/2) in its real embedding [[Re, -Im], [Im, Re]]
    const a = Array.from({ length: 2 * L }, () =>
      new Array<number>(2 * L).fill(0),
    )

    for (let r = 0; r < L; r++) {
      for (let c = 0; c < L; c++) {
        let sr = 0
        let si = 0

        for (let t = 0; t < P; t++) {
          sr +=
            n[t]! * (re[t]![r]! * re[t]![c]! + im[t]![r]! * im[t]![c]!)

          si +=
            n[t]! * (re[t]![r]! * im[t]![c]! - im[t]![r]! * re[t]![c]!)
        }

        const x = sw[r]! * sw[c]!

        a[r]![c] = x * sr
        a[r + L]![c + L] = x * sr
        a[r]![c + L] = -x * si
        a[r + L]![c] = x * si
      }
    }

    const { values, vectors } = jacobiEigen(a)
    const top = Math.max(1, ...values.map(Math.abs))

    values.forEach((lambda, j) => {
      if (lambda <= 1e-9 * top) {
        return
      }

      const omega = Math.acos(1 - (split.s * split.f * lambda) / 2)
      const sin = Math.sin(omega)
      const vr = vectors.slice(0, L).map(row => row[j]!)
      const vi = vectors.slice(L).map(row => row[j]!)
      const link = vr.map(
        (x, l) =>
          ((hbar / 2) *
            ((split.f * lambda) / sin) *
            (x * x + vi[l]! ** 2)) /
          w[l]!,
      )
      const plaquette = re.map((row, t) => {
        let ar = 0
        let ai = 0

        for (let l = 0; l < L; l++) {
          // (C W^(1/2) v)_t with v = vr + i vi
          ar += sw[l]! * (row[l]! * vr[l]! - im[t]![l]! * vi[l]!)
          ai += sw[l]! * (row[l]! * vi[l]! + im[t]![l]! * vr[l]!)
        }

        return (hbar / 2) * (split.s / sin) * (ar * ar + ai * ai)
      })

      modes.push({ k, lambda, omega, link, plaquette })
    })
  }

  return { modes, points }
}

/**
 * The register variances: each mode is listed twice by the real embedding (v and i v), so the average over the
 * box's momenta is the sum over listed modes divided by twice the number of momenta.
 */
export function registerVariances(
  modes: readonly Mode[],
  points: number,
): { link: number[]; plaquette: number[] } {
  const link = new Array<number>(modes[0]!.link.length).fill(0)
  const plaquette = new Array<number>(modes[0]!.plaquette.length).fill(
    0,
  )

  for (const m of modes) {
    m.link.forEach((c, l) => (link[l] = link[l]! + c / (2 * points)))
    m.plaquette.forEach(
      (c, t) => (plaquette[t] = plaquette[t]! + c / (2 * points)),
    )
  }

  return { link, plaquette }
}

const balOf = (x: number, n: number): number => {
  const m = ((x % n) + n) % n

  return m > (n - 1) / 2 ? m - n : m
}

/** The continuous Gaussian weight past the seam, P(|x| > D + 1/2), by the complementary error function. */
export function seamWeight(sigma2: number, depth: number): number {
  return erfc((depth + 0.5) / Math.sqrt(2 * sigma2))
}

/** The seam moments of one register: a (complex, the band) and b (the excess kick), and the seam weight. */
export function seamMoments(
  sigma2: number,
  q: number,
  n: number,
): { aRe: number; aIm: number; b: number; weight: number } {
  const sigma = Math.sqrt(sigma2)
  const reach = Math.ceil((n - 1) / 2 + 40 * sigma + 2)

  let z = 0
  let aRe = 0
  let aIm = 0
  let b = 0
  let weight = 0

  for (let x = -reach; x <= reach; x++) {
    const p = Math.exp(-(x * x) / (2 * sigma2))

    z += p

    const bal = balOf(x, n)

    if (bal === x) {
      continue
    }

    const phase = (-Math.PI * q * (bal * bal - x * x)) / n
    const dRe = Math.cos(phase) - 1
    const dIm = Math.sin(phase)
    const u = (x * x) / sigma2 - 1

    weight += p
    aRe += p * u * dRe
    aIm += p * u * dIm
    b += p * u * (dRe * dRe + dIm * dIm)
  }

  return { aRe: aRe / z, aIm: aIm / z, b: b / z, weight: weight / z }
}

/** erfc by its continued-fraction-free Chebyshev form (Numerical Recipes erfcc, relative error under 1.2e-7). */
export function erfc(x: number): number {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t *
                                      (-0.82215223 +
                                        t * 0.17087277)))))))),
    )

  return x >= 0 ? r : 2 - r
}

export type SeamReading = {
  variances: { link: number[]; plaquette: number[] }
  // per register type: seam weight (continuous Gaussian), and the discrete seam moments
  linkWeight: number[]
  plaquetteWeight: number[]
  // the largest per-mode relative band shift |Im sum beta a| / omega, and the largest excess kick sum beta b
  band: number
  leak: number
  // the expected number of registers past the seam per dock (sum of the weights) and the largest weight
  seamPerDock: number
  seamMax: number
  // the mode the band and the leak peak at
  bandMode: Mode
  leakMode: Mode
}

/**
 * The seam reading of a light at a split: register variances on the box (momenta 2 pi j / g), the seam weights,
 * and over the box's modes with k != 0 (kept: every mode with lambda > 0) the largest band shift and excess kick.
 * `modeFilter` restricts which modes the band and leak maxima run over (default all).
 */
export function seamReading(
  light: Light,
  split: Split,
  g: number,
  offset = 0,
  modeFilter: (m: Mode) => boolean = () => true,
): SeamReading {
  const { modes, points } = lightModes(light, split, g, offset)
  const variances = registerVariances(modes, points)
  const depth = (split.n - 1) / 2
  const linkQ = light.w.map(w => split.s * w)
  const plaqQ = light.n.map(n => split.f * n)
  const linkMom = variances.link.map((v, l) =>
    seamMoments(v, linkQ[l]!, split.n),
  )
  const plaqMom = variances.plaquette.map((v, t) =>
    seamMoments(v, plaqQ[t]!, split.n),
  )
  const linkWeight = variances.link.map(v => seamWeight(v, depth))
  const plaquetteWeight = variances.plaquette.map(v =>
    seamWeight(v, depth),
  )

  let band = 0
  let leak = 0
  let bandMode = modes[0]!
  let leakMode = modes[0]!

  for (const m of modes) {
    if (!modeFilter(m)) {
      continue
    }

    let im = 0
    let kick = 0

    m.link.forEach((c, l) => {
      const beta = c / variances.link[l]!

      im += beta * linkMom[l]!.aIm
      kick += beta * linkMom[l]!.b
    })

    m.plaquette.forEach((c, t) => {
      const beta = c / variances.plaquette[t]!

      im += beta * plaqMom[t]!.aIm
      kick += beta * plaqMom[t]!.b
    })

    const shift = Math.abs(im) / m.omega

    if (shift > band) {
      band = shift
      bandMode = m
    }

    if (kick > leak) {
      leak = kick
      leakMode = m
    }
  }

  const all = [...linkWeight, ...plaquetteWeight]

  return {
    variances,
    linkWeight,
    plaquetteWeight,
    band,
    leak,
    seamPerDock: all.reduce((x, y) => x + y, 0),
    seamMax: Math.max(...all),
    bandMode,
    leakMode,
  }
}
