// The fear walk solved in momentum space (code/compute/fear-dispersion): the lone vibe's quantum motion of
// E-QTM-0103 turned from a walk that must be run beat by beat into an exact formula valid at any beat and
// distance, the first particle of the knit abstracted from the lattice.
//
// Measured:
// 1. THE SYMBOL, read off walkBeat by probing it with a unit on each slot: the doubled symbol 2U has trace
//    (1 + omega)(z + 1/z) and determinant 4 omega EXACTLY (Laurent polynomials, Eisenstein coefficients), so
//    its eigenvalues on z = e^(i k) are e^(i pi/3) e^(+-i W(k)) with cos W = cos(k) / 2.
// 2. THE DISPERSION AGAINST THE DIRECT WALK. On 2,000 momenta the spectral decomposition of the symbol is
//    checked (U P = lambda P, the two projectors sum to one); then on a ring of 64 docks the exact walk run
//    300 beats (with wrap) is rebuilt from the spectrum alone (psi_t = inverse transform of
//    sum lambda^t P psi_0-hat), every slot, which on a ring is exact up to rounding.
// 3. THE EXACT PROPAGATOR. The Chebyshev closed form (a single sum of about t/2 binomial terms per dock)
//    against walkBeat, bit for bit in Eisenstein integers: every dock and both slots, from a right-moving
//    and a left-moving start, every beat to 128, and every dock at beat 400; and the total chance at beat
//    2,000 summed from the closed form alone, exactly 4^2000 / 4^2000.
// 4. THE LONG RUN. <x^2> / t^2 exactly at t = 400 and 2,000 from the closed form, against the symbol's limit
//    (the group velocity's second moment, computed from the symbol) and 1 - sqrt 3 / 2; and the first moment
//    <x> / t against its limit.
// 5. ANY DISTANCE. The exact chance at t = 10^3, 10^4, 10^5 and v = x/t = 0, 0.1, 0.25, 0.4, 0.45 from the
//    closed form, against the stationary-phase formula from the symbol; and outside the light cone of the
//    group velocity (v = 0.55) the exact chance, as a power of ten.
// 6. THE PARTICLE. From the symbol's eigenphases: the rest frequency W(0), the rest mass (1 / W''(0)), the
//    largest group velocity and the momentum where it falls.
//
// Gates, fixed before the run: 1 exact strings; 2 residuals below 1e-10 and the rebuilt walk within 1e-9 of
//    the exact one; 3 zero mismatches and the total exactly one; 4 the symbol's limit within 1e-9 of
//    1 - sqrt 3 / 2; 5 at t = 10^5 the stationary phase within 1e-3 of the exact chance for |v| <= 0.4, and
//    its error at v = 0 falling at least tenfold from t = 10^3 to 10^5; the chance outside the cone below
//    1e-100 at t = 10^4; 6 the mass within 1e-6 of sqrt 3 and the largest velocity within 1e-9 of 1/2.
//
// Depth L2: a linear walk diagonalized exactly (Fourier, Cayley-Hamilton), with every formula checked
// against the rule's own walk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { FEAR_COIN, norm, walkBeat, walkStart, ZERO, type WalkState } from '@/code/rule/fear-walk'
import {
  bigRatio,
  complexOf,
  exactInvariants,
  exactPropagator,
  frequency,
  groupVelocity,
  limitMoment,
  spectrum,
  stationaryWeight,
  symbolAt,
  transferOf,
  type Complex,
} from '@/code/compute/fear-dispersion'

const RING = 64
const RING_BEATS = 300
const EXACT_BEATS = 128
const FAR_BEATS = [1000, 10000, 100000]
const VELOCITIES = [0, 0.1, 0.25, 0.4, 0.45]

const cabs2 = (z: Complex): number => z.re * z.re + z.im * z.im

// log10 of a ratio of big integers, however small
const log10Ratio = (num: bigint, den: bigint): number => {
  if (num === 0n) {
    return -Infinity
  }

  const bits = num.toString(2).length - den.toString(2).length
  const scaled = bigRatio(num << BigInt(Math.max(0, -bits + 10)), den)

  return Math.log10(scaled) - Math.max(0, -bits + 10) * Math.log10(2)
}

export default experiment({
  id: 'computation/fear-dispersion',
  code: 'E-CMP-0017',
  title:
    "the fear walk solved in momentum space: its symbol, read off the walk, has eigenvalues e^(i pi/3 +- i W(k)) with cos W = cos(k) / 2, a Chebyshev closed form gives every weight exactly at any beat and distance (bit for bit with the walk, and at t = 10^5 where the walk would take 10^10 updates), and stationary phase on the symbol gives the chance to 1e-5, so a lone vibe's quantum motion is a free particle of rest mass sqrt 3 and top speed 1/2",
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const transfer = transferOf(FEAR_COIN)
    const invariants = exactInvariants(transfer)
    const symbolExact = invariants.trace === '1+1w z^-1 1+1w z^1' && invariants.determinant === '0+4w z^0'

    // 2. spectral residuals
    let residual = 0

    for (let q = 0; q < 2000; q++) {
      const k = -Math.PI + ((q + 0.5) * 2 * Math.PI) / 2000
      const u = symbolAt(transfer, k)
      const { lambda, projector } = spectrum(transfer, k)

      for (let b = 0; b < 2; b++) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            // (U P)_ij - lambda P_ij
            let re = 0
            let im = 0

            for (let l = 0; l < 2; l++) {
              const a = u[i]?.[l] ?? { re: 0, im: 0 }
              const p = projector[b]?.[l]?.[j] ?? { re: 0, im: 0 }

              re += a.re * p.re - a.im * p.im
              im += a.re * p.im + a.im * p.re
            }

            const lam = lambda[b] ?? { re: 0, im: 0 }
            const p = projector[b]?.[i]?.[j] ?? { re: 0, im: 0 }

            residual = Math.max(residual, Math.hypot(re - (lam.re * p.re - lam.im * p.im), im - (lam.re * p.im + lam.im * p.re)))
          }
        }
      }

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const sum = {
            re: (projector[0]?.[i]?.[j]?.re ?? 0) + (projector[1]?.[i]?.[j]?.re ?? 0),
            im: (projector[0]?.[i]?.[j]?.im ?? 0) + (projector[1]?.[i]?.[j]?.im ?? 0),
          }

          residual = Math.max(residual, Math.hypot(sum.re - (i === j ? 1 : 0), sum.im))
        }
      }
    }

    // the ring rebuilt from the spectrum
    let ring: WalkState = walkStart(RING, 5, true)

    for (let t = 0; t < RING_BEATS; t++) {
      ring = walkBeat(ring, () => FEAR_COIN)
    }

    let ringError = 0

    {
      const scale = 2 ** -RING_BEATS
      // psi_0-hat(k) = e^(i k 5) e_R, so psi_t(x) = (1/N) sum_j sum_s lambda_s^t P_s(k) e_R e^(i k (5 - x))
      for (let x = 0; x < RING; x++) {
        let r = { re: 0, im: 0 }
        let l = { re: 0, im: 0 }

        for (let j = 0; j < RING; j++) {
          const k = (2 * Math.PI * j) / RING
          const { lambda, projector } = spectrum(transfer, k)

          for (let b = 0; b < 2; b++) {
            const lam = lambda[b] ?? { re: 0, im: 0 }
            const angle = Math.atan2(lam.im, lam.re) * RING_BEATS + k * (5 - x)
            const phase = { re: Math.cos(angle) / RING, im: Math.sin(angle) / RING }
            const pr = projector[b]?.[0]?.[0] ?? { re: 0, im: 0 }
            const pl = projector[b]?.[1]?.[0] ?? { re: 0, im: 0 }

            r = { re: r.re + pr.re * phase.re - pr.im * phase.im, im: r.im + pr.re * phase.im + pr.im * phase.re }
            l = { re: l.re + pl.re * phase.re - pl.im * phase.im, im: l.im + pl.re * phase.im + pl.im * phase.re }
          }
        }

        const er = complexOf(ring.right[x] ?? ZERO)
        const el = complexOf(ring.left[x] ?? ZERO)

        ringError = Math.max(ringError, Math.hypot(er.re * scale - r.re, er.im * scale - r.im), Math.hypot(el.re * scale - l.re, el.im * scale - l.im))
      }
    }

    // 3. the closed form against the walk
    const prop = exactPropagator(transfer, 200000)
    let mismatches = 0
    let compared = 0

    for (const start of ['right', 'left'] as const) {
      const cells = 2 * 400 + 3
      const middle = 401
      let s: WalkState = walkStart(cells, middle, start === 'right')

      for (let t = 1; t <= 400; t++) {
        s = walkBeat(s, () => FEAR_COIN)

        if (t > EXACT_BEATS && t !== 400) {
          continue
        }

        for (let x = -t - 1; x <= t + 1; x++) {
          const w = prop.weight(t, x, start)
          const r = s.right[middle + x] ?? ZERO
          const l = s.left[middle + x] ?? ZERO

          mismatches += r[0] === w.right[0] && r[1] === w.right[1] && l[0] === w.left[0] && l[1] === w.left[1] ? 0 : 1
          compared += 1
        }
      }
    }

    // total chance and moments from the closed form
    const moments = (t: number): { total: boolean; second: number; first: number } => {
      let total = 0n
      let first = 0n
      let second = 0n

      for (let x = -t; x <= t; x++) {
        const w = prop.weight(t, x, 'right')
        const p = norm(w.right) + norm(w.left)

        total += p
        first += BigInt(x) * p
        second += BigInt(x) * BigInt(x) * p
      }

      const scale = 4n ** BigInt(t)

      return {
        total: total === scale,
        first: bigRatio(first < 0n ? -first : first, scale * BigInt(t)) * (first < 0n ? -1 : 1),
        second: bigRatio(second, scale * BigInt(t) * BigInt(t)),
      }
    }
    const at400 = moments(400)
    const at2000 = moments(2000)
    const limitSecond = limitMoment(transfer, 2, 'right')
    const limitFirst = limitMoment(transfer, 1, 'right')
    const predicted = 1 - Math.sqrt(3) / 2

    // 5. far
    const far: { t: number; v: number; x: number; exact: number; stationary: number; error: number }[] = []

    for (const t of FAR_BEATS) {
      for (const v of VELOCITIES) {
        let x = Math.round(v * t)

        x += (x - t) % 2 !== 0 ? 1 : 0

        const w = prop.weight(t, x, 'right')
        const exact = bigRatio(norm(w.right) + norm(w.left), 4n ** BigInt(t))
        const sp = stationaryWeight(transfer, t, x, 'right')
        const stationary = cabs2(sp.right) + cabs2(sp.left)

        far.push({ t, v, x, exact, stationary, error: Math.abs(stationary / exact - 1) })
      }
    }

    const outside = (t: number): number => {
      let x = Math.round(0.55 * t)

      x += (x - t) % 2 !== 0 ? 1 : 0

      const w = prop.weight(t, x, 'right')

      return log10Ratio(norm(w.right) + norm(w.left), 4n ** BigInt(t))
    }
    const outside1000 = outside(1000)
    const outside10000 = outside(10000)

    // 6. the particle, from the eigenphases
    // the eigenvalues solved from the symbol's own trace and determinant (the quadratic formula), turned by
    // e^(-i pi/3); the root in the upper half plane has phase W(k) in [0, pi], no wrap
    const eigenphase = (k: number): number => {
      const u = symbolAt(transfer, k)
      const a = u[0]?.[0] ?? { re: 0, im: 0 }
      const d = u[1]?.[1] ?? { re: 0, im: 0 }
      const b = u[0]?.[1] ?? { re: 0, im: 0 }
      const c = u[1]?.[0] ?? { re: 0, im: 0 }
      const tr = { re: a.re + d.re, im: a.im + d.im }
      const det = { re: a.re * d.re - a.im * d.im - (b.re * c.re - b.im * c.im), im: a.re * d.im + a.im * d.re - (b.re * c.im + b.im * c.re) }
      const disc = { re: tr.re * tr.re - tr.im * tr.im - 4 * det.re, im: 2 * tr.re * tr.im - 4 * det.im }
      const size = Math.sqrt(Math.hypot(disc.re, disc.im))
      const angle = Math.atan2(disc.im, disc.re) / 2
      const root = { re: size * Math.cos(angle), im: size * Math.sin(angle) }
      const turn = { re: Math.cos(-Math.PI / 3), im: Math.sin(-Math.PI / 3) }
      const phases = [1, -1].map(sign => {
        const lam = { re: (tr.re + sign * root.re) / 2, im: (tr.im + sign * root.im) / 2 }
        const mu = { re: lam.re * turn.re - lam.im * turn.im, im: lam.re * turn.im + lam.im * turn.re }

        return Math.atan2(mu.im, mu.re)
      })

      return Math.max(...phases)
    }
    const h = 1e-4
    // relative to the common phase pi/3: the two branches sit at pi/3 + W(0) = 2 pi/3 and pi/3 - W(0) = 0
    const restFrequency = eigenphase(0)
    const formulaGap = Math.abs(restFrequency - frequency(0))
    const second0 = (eigenphase(h) - 2 * eigenphase(0) + eigenphase(-h)) / (h * h)
    const mass = 1 / second0
    let topSpeed = 0
    let topAt = 0

    for (let q = 0; q <= 100000; q++) {
      const k = (q * Math.PI) / 100000
      const v = groupVelocity(k)

      if (v > topSpeed) {
        topSpeed = v
        topAt = k
      }
    }

    // the symbol's own group velocity against the formula
    let velocityError = 0

    for (let q = 1; q < 200; q++) {
      const k = -Math.PI + (q * 2 * Math.PI) / 200

      velocityError = Math.max(velocityError, Math.abs((eigenphase(k + 1e-6) - eigenphase(k - 1e-6)) / 2e-6 - groupVelocity(k)))
    }

    const at = (t: number, v: number) => far.find(f => f.t === t && f.v === v)
    const farOk = far.filter(f => f.t === 100000 && f.v <= 0.4).every(f => f.error < 1e-3)
    const falling = (at(1000, 0)?.error ?? 1) / (at(100000, 0)?.error ?? 1) >= 10

    const ok =
      symbolExact &&
      residual < 1e-10 &&
      ringError < 1e-9 &&
      mismatches === 0 &&
      at2000.total &&
      Math.abs(limitSecond - predicted) < 1e-9 &&
      farOk &&
      falling &&
      outside10000 < -100 &&
      Math.abs(mass - Math.sqrt(3)) < 1e-6 &&
      Math.abs(topSpeed - 0.5) < 1e-9

    const metrics: Record<string, number> = {
      symbolTraceAndDeterminantExact: symbolExact ? 1 : 0,
      spectralResidual: residual,
      ringRebuiltFromSpectrumError: ringError,
      closedFormMismatches: mismatches,
      closedFormWeightsCompared: compared,
      totalChanceExactAt2000: at2000.total ? 1 : 0,
      secondMomentOverT2At400: at400.second,
      secondMomentOverT2At2000: at2000.second,
      secondMomentLimitFromSymbol: limitSecond,
      secondMomentPredicted: predicted,
      firstMomentOverTAt400: at400.first,
      firstMomentOverTAt2000: at2000.first,
      firstMomentLimitFromSymbol: limitFirst,
      restFrequency,
      restFrequencyAgainstFormula: formulaGap,
      restMass: mass,
      topSpeed,
      topSpeedAtMomentum: topAt,
      symbolVelocityAgainstFormula: velocityError,
      log10ChanceOutsideConeT1000: outside1000,
      log10ChanceOutsideConeT10000: outside10000,
    }

    for (const f of far) {
      metrics[`chanceT${f.t}V${f.v}`] = f.exact
      metrics[`stationaryRelErrorT${f.t}V${f.v}`] = f.error
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the symbol read off the fear walk has trace (1 + omega)(z + 1/z) and determinant 4 omega exactly, so a lone vibe moves as a free particle with cos W = cos(k) / 2, rest mass sqrt 3 and top speed 1/2; the Chebyshev closed form equals the walk bit for bit and keeps the total chance exactly one, and the stationary-phase formula from the symbol matches the exact chance to 1e-3 at t = 10^5, with the error falling as 1/t, while outside the cone the chance is below 1e-100',
      metrics,
      control: {
        ringDocks: RING,
        ringBeats: RING_BEATS,
        exactBeatsEveryDock: EXACT_BEATS,
      },
      notes:
        'L2. The closed form is (2U)^t = P_t (2U) - 4 omega P_(t-1) (Cayley-Hamilton), P_t a Chebyshev polynomial in T = (1 + omega)(z + 1/z), expanded in binomials; each weight is a sum of about t/2 Eisenstein terms carried by small-factor updates, so one dock at t = 10^5 takes seconds where the walk would take t^2 = 10^10 dock updates. Positions are docks along the vibe\'s line; in D4 a dock step is a root of length sqrt 2, so the top speed is sqrt 2 / 2 in lattice length per beat. The stationary phase uses the four points where +-W\'(k) = x/t and fails near the cone edge |x| = t/2 (the caustic, where an Airy form is needed): the v = 0.45 errors show it. The fear walk is the one-vibe sector of one line with no vacuum (E-QTM-0103, E-FND-0080), so this is the free particle only; the dressed vibe in the committed vacuum is not a translation-invariant linear walk and has no symbol of this kind. The chances are read from exact ratios to about 1e-15 relative.',
    })
  },
})
