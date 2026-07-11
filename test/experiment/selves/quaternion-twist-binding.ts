// The DM stabilizer as a pure QUATERNION ROTATION (the coin's handedness), no real coupling D. The earlier DM used
// a real strength D in a linearized cross-product term (selves/dm-skyrmion-bound-self). Here the DM is exactly a
// fixed ROTATION by a twist angle theta per bond, "rotate the neighbour by theta, then align with it". That is
// twisted exchange, and it is the quaternion handedness, a fixed group rotation, with the STRENGTH being the
// rotation angle theta (which a quaternion group element quantizes), not a separate real number. The only couplings
// are J (alignment, a count) and theta (the twist, a group angle).
//
// Measured, with a fixed twist theta (no real D), the field relaxes to an ISOLATED bound Skyrmion (degree minus
// one at a fixed small radius), it is STABLE under reversible precession (degree conserved, radius steady), and the
// degree SURVIVES a perturbation. So the stabilizer is fully on the quaternion base, a rotation by a twist angle,
// the coin's own handedness, no real coupling.
//
// Honest notes, this is the reduced continuous model of the mechanism (the discrete realization snaps theta to a
// group angle and the directions to the 24-cell). The 24-cell's coarsest twist (120 degrees) gives a sub-lattice
// Skyrmion, a SMOOTH multi-cell soliton wants a small effective twist, which emerges at coarse-graining (or with a
// finer group like the 600-cell). And full radiative self-repair needs longer evolution (a symplectic integrator),
// so we test stability, size-fixing, and perturbation-robustness, which hold.
//
// Depth L2, the DM stabilizer as a pure quaternion rotation (a twist angle, the coin's handedness), no real coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeSkyrmionField,
  skyrmionDegree,
  skyrmionRadius,
  type Spin,
} from '@/code/dynamics/skyrmion-field'

export default experiment({
  id: 'selves/quaternion-twist-binding',
  code: 'E-SLF-0098',
  title:
    'the DM stabilizer is a pure quaternion rotation (a twist angle, the coin handedness), no real coupling: it binds a stable Skyrmion',
  category: 'selves',
  substrates: ['spin-field'],
  depth: 'L2',
  paper: true,
  run() {
    const L = 44
    const J = 1
    const theta = 0.6 // the twist angle, the handedness, in the discrete model a quaternion group angle
    const B = 0.45 // the perpendicular field that holds the uniform background (a uniform tone bias)
    const dt = 0.008
    const relaxSteps = 2000
    const precessSteps = 800

    const idx = (x: number, y: number): number =>
      ((y + L) % L) * L + ((x + L) % L)

    const cross = (a: Spin, b: Spin): Spin => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ]

    const dot = (a: Spin, b: Spin): number =>
      a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

    const unit = (a: Spin): Spin => {
      const n = Math.hypot(a[0], a[1], a[2]) || 1

      return [a[0] / n, a[1] / n, a[2] / n]
    }

    const rotateBy = (v: Spin, axis: Spin, ang: number): Spin => {
      const u = unit(axis)
      const c = Math.cos(ang),
        s = Math.sin(ang),
        kxv = cross(u, v),
        kdv = dot(u, v)

      return [
        v[0] * c + kxv[0] * s + u[0] * kdv * (1 - c),
        v[1] * c + kxv[1] * s + u[1] * kdv * (1 - c),
        v[2] * c + kxv[2] * s + u[2] * kdv * (1 - c),
      ]
    }

    // bonds with their twist axes (interfacial form for the 2D reduced model; the 4D form uses the bond/quaternion
    // direction directly, with handedness from the group).
    const bonds: [number, number, Spin][] = [
      [1, 0, [0, 1, 0]],
      [-1, 0, [0, -1, 0]],
      [0, 1, [-1, 0, 0]],
      [0, -1, [1, 0, 0]],
    ]

    // twisted-exchange field: rotate each neighbour by theta about the bond axis, then align. No real coupling D.
    const field = (s: Spin[], x: number, y: number): Spin => {
      const h: Spin = [0, 0, B]

      for (const [dx, dy, ax] of bonds) {
        const r = rotateBy(s[idx(x + dx, y + dy)]!, ax, theta)

        h[0] += J * r[0]
        h[1] += J * r[1]
        h[2] += J * r[2]
      }

      return h
    }

    const pinEdge = (out: Spin[]): void => {
      for (let i = 0; i < L; i++) {
        out[idx(i, 0)] = [0, 0, 1]
        out[idx(i, L - 1)] = [0, 0, 1]
        out[idx(0, i)] = [0, 0, 1]
        out[idx(L - 1, i)] = [0, 0, 1]
      }
    }

    const relaxStep = (s: Spin[], a: number): Spin[] => {
      const out: Spin[] = new Array(L * L)

      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          const c = s[idx(x, y)]!
          const h = field(s, x, y)

          out[idx(x, y)] = unit([
            c[0] + a * h[0],
            c[1] + a * h[1],
            c[2] + a * h[2],
          ])
        }
      }

      pinEdge(out)

      return out
    }

    const precessStep = (s: Spin[], open: boolean): Spin[] => {
      const out: Spin[] = new Array(L * L)

      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          const h = field(s, x, y)

          out[idx(x, y)] = unit(
            rotateBy(
              s[idx(x, y)]!,
              [h[0], h[1], h[2]],
              Math.hypot(h[0], h[1], h[2]) * dt,
            ),
          )
        }
      }

      if (open) pinEdge(out)

      return out
    }

    let spins = makeSkyrmionField({ size: L, coreRadius: 4 })

    for (let t = 0; t < relaxSteps; t++) spins = relaxStep(spins, 0.08)

    const relaxedQ = skyrmionDegree(spins, L)
    const relaxedRadius = skyrmionRadius(spins, L)
    const relaxed = spins.map(v => [...v] as Spin)

    let minQ = relaxedQ,
      maxQ = relaxedQ

    for (let t = 0; t < precessSteps; t++) {
      spins = precessStep(spins, false)

      const q = skyrmionDegree(spins, L)

      if (q < minQ) minQ = q

      if (q > maxQ) maxQ = q
    }

    const precessedRadius = skyrmionRadius(spins, L)

    let pert = relaxed.map(v => [...v] as Spin)

    for (let y = 18; y < 21; y++) {
      for (let x = 26; x < 29; x++) {
        const n = Math.hypot(1, 0, 0.2)

        pert[idx(x, y)] = [1 / n, 0, 0.2 / n]
      }
    }

    for (let t = 0; t < precessSteps; t++)
      pert = precessStep(pert, false)

    const perturbedQ = skyrmionDegree(pert, L)

    const boundExists =
      Math.abs(relaxedQ + 1) < 0.1 &&
      relaxedRadius > 1.5 &&
      relaxedRadius < 8

    const stableUnderReversible =
      Math.abs(minQ + 1) < 0.1 &&
      Math.abs(maxQ + 1) < 0.1 &&
      Math.abs(precessedRadius - relaxedRadius) < 1.2

    const chargeRobust = Math.abs(perturbedQ + 1) < 0.1
    const ok = boundExists && stableUnderReversible && chargeRobust

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the DM stabilizer is a pure quaternion rotation (the coin handedness), not a real coupling, expressed as twisted exchange (rotate the neighbour by a fixed twist angle theta, then align), with a fixed theta and NO real strength D the field relaxes to an isolated bound Skyrmion (degree minus one at a fixed small radius), which is stable under reversible precession (degree conserved, radius steady) and whose degree survives a perturbation, so the binding stabilizer is fully on the quaternion base, a rotation by a twist angle that a group element quantizes, the only couplings are alignment (a count) and the twist angle (a group angle)',
      metrics: {
        twistAngleDeg: Math.round((theta * 180) / Math.PI),
        relaxedDegreeTimes100: Math.round(relaxedQ * 100),
        relaxedRadiusTimes100: Math.round(relaxedRadius * 100),
        precessMinQTimes100: Math.round(minQ * 100),
        precessMaxQTimes100: Math.round(maxQ * 100),
        precessedRadiusTimes100: Math.round(precessedRadius * 100),
        perturbedDegreeTimes100: Math.round(perturbedQ * 100),
        boundExists: boundExists ? 1 : 0,
        stableUnderReversible: stableUnderReversible ? 1 : 0,
        chargeRobust: chargeRobust ? 1 : 0,
        precessSteps,
      },
      control: {
        relaxedDegreeTimes100: Math.round(relaxedQ * 100),
        precessMinQTimes100: Math.round(minQ * 100),
      },
      notes:
        'the DM made minimal, a pure rotation (the quaternion handedness), no real coupling D. The strength is the twist angle, which a quaternion group element quantizes. The 24-cell coarsest twist gives a sub-lattice Skyrmion, smooth ones emerge at coarse-graining or with a finer group. Reduced continuous model, the discrete realization snaps theta to a group angle and the directions to the 24-cell. With the winding identity and the soft-mode-plus-bath agency, the binding stabilizer is now on the quaternion base',
    })
  },
})
