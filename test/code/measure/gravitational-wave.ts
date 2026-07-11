// Conformance for code/measure/gravitational-wave: the textbook circular-binary GW formulas.
// Kepler's law (omega^2 a^3 = M), the equal-mass chirp mass (m / 2^(1/5)), the quadrupole
// strain amplitude with its frequency-doubling (cos(2 phi), period = half an orbit), the two
// equivalent forms of the radiated power, and the Peters inspiral chirp slope -3/8 are all
// re-derived independently and checked.

import { suite, check, close, ok, allFinite } from '@/test/code/harness'
import {
  keplerFrequency,
  chirpMass,
  binaryQuadrupoleStrain,
  quadrupoleRadiatedPower,
  petersInspiralTrack,
} from '@/code/measure/gravitational-wave'

const TOL = 1e-9

suite('measure/gravitational-wave: Kepler and chirp mass', [
  // omega = sqrt(M / a^3), so omega^2 a^3 = M.
  check('Kepler frequency satisfies omega^2 a^3 = M', () => {
    const omega = keplerFrequency({ totalMass: 4, separation: 2 })

    close(omega * omega * 2 ** 3, 4, TOL)
  }),
  // Equal masses m: M_c = (m^2)^(3/5) / (2m)^(1/5) = m * 2^(-1/5).
  check('equal-mass chirp mass is m / 2^(1/5)', () => {
    close(
      chirpMass({ mass1: 10, mass2: 10 }),
      10 * Math.pow(2, -1 / 5),
      TOL,
    )
  }),
  // Symmetric in its two arguments.
  check('chirp mass is symmetric in the two masses', () => {
    close(
      chirpMass({ mass1: 3, mass2: 7 }),
      chirpMass({ mass1: 7, mass2: 3 }),
      TOL,
    )
  }),
])

suite('measure/gravitational-wave: quadrupole strain', [
  // amp = 4 mu omega^2 a^2 / r; the n=0 sample has phi=0 so h_+ = -amp, h_x = 0.
  check('strain amplitude and the t=0 sample', () => {
    const m1 = 1
    const m2 = 1
    const a = 10
    const r = 100
    const s = binaryQuadrupoleStrain({
      mass1: m1,
      mass2: m2,
      separation: a,
      distance: r,
      samples: 24,
      samplesPerOrbit: 12,
    })

    const mu = (m1 * m2) / (m1 + m2)
    const omega = keplerFrequency({ totalMass: m1 + m2, separation: a })
    const amp = (4 * mu * omega ** 2 * a ** 2) / r

    close(s.omega, omega, TOL)
    close(s.hplus[0]!, -amp, TOL)
    close(s.hcross[0]!, 0, TOL)
  }),
  // h ~ cos(2 phi): the GW repeats every HALF orbit, i.e. every 6 of 12 samples per orbit.
  check(
    'the strain doubles the orbital frequency (period = 6 samples)',
    () => {
      const s = binaryQuadrupoleStrain({
        mass1: 1,
        mass2: 2,
        separation: 8,
        distance: 50,
        samples: 25,
        samplesPerOrbit: 12,
      })

      close(s.hplus[0]!, s.hplus[6]!, 1e-9)
      close(s.hplus[6]!, s.hplus[12]!, 1e-9)
      close(s.hcross[0]!, s.hcross[6]!, 1e-9)
    },
  ),
])

suite('measure/gravitational-wave: radiated power', [
  // P = (32/5) m1^2 m2^2 (m1+m2) / a^5 equals (32/5) mu^2 a^4 omega^6.
  check('the two power forms agree', () => {
    const m1 = 1
    const m2 = 2
    const a = 5
    const P = quadrupoleRadiatedPower({
      mass1: m1,
      mass2: m2,
      separation: a,
    })

    close(P, ((32 / 5) * (m1 ** 2 * m2 ** 2 * (m1 + m2))) / a ** 5, TOL)

    const mu = (m1 * m2) / (m1 + m2)
    const omega = keplerFrequency({ totalMass: m1 + m2, separation: a })

    close(P, (32 / 5) * mu ** 2 * a ** 4 * omega ** 6, TOL)
  }),
])

suite('measure/gravitational-wave: Peters inspiral', [
  // da/dt = -(64/5) m1 m2 M / a^3, so a^4 = a0^4 - 4 K t (K = (64/5) m1 m2 M) and the binary reaches
  // a=0 at the TRUE coalescence t_c = a0^4 / (4K). Then f ~ omega ~ a^(-3/2) ~ (t_c - t)^(-3/8). The
  // true coalescence is computed analytically here (the returned coalescenceTime is the a=floor stop,
  // not the asymptotic merger).
  check('the chirp slope d ln f / d ln(t_c - t) is -3/8', () => {
    const m1 = 1
    const m2 = 1
    const a0 = 8
    const track = petersInspiralTrack({
      mass1: m1,
      mass2: m2,
      separation: a0,
      floor: 1.5,
      step: 1e-3,
    })

    allFinite(track.gwFrequencies)

    const K = (64 / 5) * m1 * m2 * (m1 + m2)
    const tc = a0 ** 4 / (4 * K)
    // fit over the late half of the track, where the near-coalescence power law is clean
    const n = track.times.length

    ok(n > 50, `track too short: ${n}`)

    const lo = Math.floor(n / 2)
    const xs: number[] = []
    const ys: number[] = []

    for (let i = lo; i < n - 1; i++) {
      const gap = tc - track.times[i]!

      if (gap > 0 && track.gwFrequencies[i]! > 0) {
        xs.push(Math.log(gap))
        ys.push(Math.log(track.gwFrequencies[i]!))
      }
    }

    const m = xs.length
    const mx = xs.reduce((s, v) => s + v, 0) / m
    const my = ys.reduce((s, v) => s + v, 0) / m

    let cov = 0
    let varx = 0

    for (let i = 0; i < m; i++) {
      cov += (xs[i]! - mx) * (ys[i]! - my)
      varx += (xs[i]! - mx) ** 2
    }

    const slope = cov / varx

    close(slope, -3 / 8, 0.01)
  }),
])
