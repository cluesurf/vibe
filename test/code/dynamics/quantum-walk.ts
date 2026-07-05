// Conformance for code/dynamics/quantum-walk: the discrete- and continuous-time coined quantum walk.
// Invariants:
//   - UNITARITY: the Dirac quantum walk conserves total norm (= 1) at every beat.
//   - CHIRALITY conservation in the MASSLESS walk: |R|^2 - |L|^2 is constant (a symmetric seed keeps
//     chirality 0, a pure right-mover keeps it +1).
//   - DISPERSION closed form omega(k) = arccos(cos(theta) cos(k)): omega(theta,0)=theta, massless omega=|k|.
//   - continuous-time walks at t=0 have zero MSD (the amplitude is the orthonormal-basis delta).
//   - the discrete coined walk spreads BALLISTICALLY (MSD exponent > 1.5), faster than diffusive.
//   - singleParticle massless packet moves at ~ the light speed; a massive one is slower.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  diracQuantumWalk,
  coinedWalkDispersion,
  continuousQuantumWalkMsd,
  continuousClassicalWalkMsd,
  coinedWalkMSD,
  singleParticleQuantumWalk,
} from '@/code/dynamics/quantum-walk'

suite('dynamics/quantum-walk: unitarity and chirality', [
  check('the Dirac walk conserves total norm = 1 every beat', () => {
    const out = diracQuantumWalk({
      size: 64,
      mass: 0.4,
      steps: 40,
      seedMode: 'symmetric',
    })

    for (const n of out.norm) {
      close(n, 1, 1e-9, 'norm stays 1')
    }
  }),
  check('massless symmetric seed keeps chirality at 0', () => {
    const out = diracQuantumWalk({
      size: 64,
      mass: 0,
      steps: 30,
      seedMode: 'symmetric',
    })

    for (const c of out.chirality) {
      close(c, 0, 1e-9, 'chirality conserved at 0')
    }
  }),
  check('massless right-mover keeps chirality at +1', () => {
    const out = diracQuantumWalk({
      size: 64,
      mass: 0,
      steps: 30,
      seedMode: 'right',
    })

    for (const c of out.chirality) {
      close(c, 1, 1e-9, 'chirality conserved at +1')
    }
  }),
  check('a mass makes the chirality oscillate (not constant)', () => {
    const out = diracQuantumWalk({
      size: 64,
      mass: 0.6,
      steps: 30,
      seedMode: 'right',
    })

    let spread = 0

    for (const c of out.chirality) {
      spread = Math.max(spread, Math.abs(c - out.chirality[0]!))
    }

    ok(spread > 0.05, 'massive chirality varies')
  }),
])

suite('dynamics/quantum-walk: dispersion', [
  check('omega(theta, 0) = theta (the mass gap)', () => {
    for (const theta of [0.1, 0.5, 1.0]) {
      close(
        coinedWalkDispersion({ theta, k: 0 }),
        theta,
        1e-12,
        `gap at theta=${theta}`,
      )
    }
  }),
  check('massless dispersion omega(0, k) = |k| (the lightcone)', () => {
    for (const k of [0.2, 0.7, 1.3]) {
      close(
        coinedWalkDispersion({ theta: 0, k }),
        Math.abs(k),
        1e-12,
        `lightcone at k=${k}`,
      )
    }
  }),
])

suite('dynamics/quantum-walk: continuous-time t=0 limit', [
  check(
    'continuous quantum and classical MSD are zero at t=0 (orthonormal basis)',
    () => {
      // a 3x3 orthonormal eigenbasis (the identity), so the heat/quantum kernel at t=0 is a delta
      const n = 3
      const vectors = Float64Array.from([1, 0, 0, 0, 1, 0, 0, 0, 1])
      const eig = { values: [0.5, 1.0, 2.0], vectors }
      close(
        continuousQuantumWalkMsd({ eig, n, center: 1, t: 0 }),
        0,
        1e-12,
        'quantum MSD(0)=0',
      )
      close(
        continuousClassicalWalkMsd({ eig, n, center: 1, t: 0 }),
        0,
        1e-12,
        'classical MSD(0)=0',
      )
    },
  ),
])

suite('dynamics/quantum-walk: ballistic spreading', [
  check(
    'the coined walk MSD grows super-linearly (exponent > 1.5)',
    () => {
      const { msd } = coinedWalkMSD({
        size: 201,
        steps: 60,
        theta: Math.PI / 4,
      })

      // log-log slope of MSD vs t over the pre-saturation window
      let sx = 0,
        sy = 0,
        sxx = 0,
        sxy = 0,
        m = 0

      for (let t = 10; t <= 50; t++) {
        if (msd[t]! <= 0) {
          continue
        }

        const x = Math.log(t)
        const y = Math.log(msd[t]!)
        sx += x
        sy += y
        sxx += x * x
        sxy += x * y
        m++
      }

      const exponent = (m * sxy - sx * sy) / (m * sxx - sx * sx)
      ok(exponent > 1.5, `ballistic exponent ${exponent} > 1.5`)
    },
  ),
  check(
    'a massless single particle drifts at ~ the light speed, a massive one slower',
    () => {
      const massless = singleParticleQuantumWalk({
        mass: 0,
        momentum: 0.8,
        size: 240,
        steps: 80,
      })

      const massive = singleParticleQuantumWalk({
        mass: 0.7,
        momentum: 0.8,
        size: 240,
        steps: 80,
      })

      close(massless.speed, 1, 0.05, 'massless speed ~ 1')
      ok(massive.massive, 'massive flag set')
      ok(massive.speed < massless.speed, 'massive slower than massless')
      ok(massless.linearR2 > 0.99, 'massless centroid moves linearly')
    },
  ),
])
