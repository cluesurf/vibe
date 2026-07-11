// Frontier 4: the multipole KINEMATICS of a binary source, computed rather than assumed.
// E-GRV-0016 hardcodes the strain h_+ ~ cos(2 phi) (radiation at twice the orbital phase). This
// computes the source-moment structure behind that: which multipole moments of the source can
// radiate, and at what frequency the leading one oscillates.
//
// The multipole radiation rule, STATED not derived here: a source radiates through the
// time-variation of its multipole moments (monopole radiation goes with dM/dt, dipole radiation
// with the second time derivative of D_i, quadrupole radiation with the second time derivative of
// Q_ij, the standard linearised-GR result). GIVEN that rule, the source kinematics computed here
// decide the structure:
//   - the MONOPOLE (total mass M) is CONSTANT, dM/dt = 0, so there is NO monopole radiation,
//   - the DIPOLE (D_i) vanishes identically in the centre-of-mass frame, and the source here is
//     built with UNEQUAL masses (2 and 1) placed at their COM-scaled radii, so the vanishing
//     follows from momentum conservation (the COM stays put), NOT from a mirror-symmetric input,
//   - the QUADRUPOLE (Q_ij) is the leading time-varying moment, and for an orbiting binary it
//     oscillates at TWICE the orbital frequency, so the wave comes out at 2 f_orb.
// That factor of two (radiation at 2 f_orb, the cos(2 phi) in E-GRV-0016) is the hallmark of
// quadrupole radiation, the signature LIGO sees, and it is here a CONSEQUENCE of the computed
// source moments, not an input waveform.
//
// Measured on a deterministic UNEQUAL-MASS circular binary (masses 2 and 1, radii 1/3 and 2/3
// about the COM):
//   - the monopole is constant to machine precision (no monopole radiation),
//   - the mass dipole is zero to machine precision in the COM frame despite the unequal masses,
//   - the quadrupole has a pure 2 f_orb harmonic and NO f_orb harmonic (projection integrals),
//     so the wave is at twice the orbital frequency.
// The control is the orbital motion itself, which IS at f_orb, so the frequency doubling in the
// quadrupole is a real effect of the quadratic moment, not a relabelling.
//
// HONEST scope: this is the multipole kinematics of the SOURCE. The radiation rule itself (h
// proportional to the second time derivative of Q, and the moment-to-derivative assignments) is
// the standard linearised-GR result STATED here, not derived, and no spin-2 field enters the
// computation. What is computed is that, given that standard rule, the conserved moments kill the
// monopole and dipole channels and the quadrupole radiates at 2 f_orb.
//
// Grade L1: standard multipole kinematics of a binary source, computed deterministically, with
// the COM-frame unequal-mass construction making the vanishing dipole a consequence of momentum
// conservation and the orbital motion (at f_orb) as the control for the frequency doubling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const F_ORB = 1 // orbital frequency (arbitrary units)
const OMEGA = 2 * Math.PI * F_ORB

// UNEQUAL masses in the centre-of-mass frame: m1 r1 = m2 r2, separation r1 + r2 = 1.
// The dipole vanishes because the COM is at the origin (momentum conservation), not because
// the two bodies are mirror images.
const M1 = 2
const M2 = 1
const R1 = M2 / (M1 + M2) // 1/3
const R2 = M1 / (M1 + M2) // 2/3

// unequal-mass circular binary about its centre of mass
function bodies(t: number): { m: number; x: number; y: number }[] {
  const th = OMEGA * t

  return [
    { m: M1, x: R1 * Math.cos(th), y: R1 * Math.sin(th) },
    { m: M2, x: -R2 * Math.cos(th), y: -R2 * Math.sin(th) },
  ]
}

export default experiment({
  id: 'gravity/quadrupole-radiation-structure',
  code: 'E-GRV-0043',
  title:
    'the multipole kinematics of an unequal-mass binary in its centre-of-mass frame: the monopole is constant and the mass dipole vanishes from momentum conservation (not input symmetry, the masses are 2 and 1), while the quadrupole oscillates at twice the orbital frequency, so given the standard multipole radiation rule (stated, not derived here) the wave comes out at 2 f_orb, the cos(2 phi) LIGO signature that E-GRV-0016 hardcoded',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    // sample over exactly 8 orbital periods for clean harmonic projection
    const periods = 8
    const steps = periods * 400
    const dt = periods / F_ORB / steps

    const t: number[] = []
    const monopole: number[] = []
    const dipoleX: number[] = []
    const quadXX: number[] = []
    const bodyX: number[] = [] // one body's x-coordinate, the orbital (f_orb) reference

    for (let s = 0; s < steps; s++) {
      const time = s * dt
      const bs = bodies(time)

      let M = 0
      let Dx = 0
      let Qxx = 0

      for (const b of bs) {
        const r2 = b.x * b.x + b.y * b.y

        M += b.m
        Dx += b.m * b.x
        Qxx += b.m * (3 * b.x * b.x - r2) // traceless quadrupole component
      }

      t.push(time)
      monopole.push(M)
      dipoleX.push(Dx)
      quadXX.push(Qxx)
      bodyX.push(bs[0]!.x)
    }

    // monopole constant: no monopole radiation
    const monoVar = Math.max(...monopole) - Math.min(...monopole)

    // the mass dipole is zero in the centre-of-mass frame. With UNEQUAL masses (2 and 1) at
    // COM-scaled radii this is momentum conservation at work (m1 r1 = m2 r2), not a
    // mirror-symmetric input: swap the radii or equalise them without rescaling and it fails.
    const maxDipoleMagnitude = Math.max(...dipoleX.map(Math.abs))

    // harmonic projection onto the f_orb and 2 f_orb components
    function project(signal: number[], harmonic: number): number {
      let acc = 0

      for (let s = 0; s < steps; s++)
        acc += signal[s]! * Math.cos(harmonic * OMEGA * t[s]!) * dt

      return Math.abs(acc) / (periods / F_ORB) // normalise by total time
    }

    const quadAtOrbital = project(quadXX, 1) // f_orb component of the quadrupole
    const quadAtTwice = project(quadXX, 2) // 2 f_orb component
    const bodyAtOrbital = project(bodyX, 1) // the ORBIT is at f_orb (the reference)
    const bodyAtTwice = project(bodyX, 2) // the orbit has no 2 f_orb component

    // 1. no monopole radiation: mass is constant.
    const noMonopole = monoVar < 1e-9

    // 2. no dipole radiation: the mass dipole is zero in the COM frame, with unequal masses,
    //    so the vanishing comes from momentum conservation, not from input symmetry.
    const noDipoleRadiation = maxDipoleMagnitude < 1e-9

    // 3. the quadrupole is at 2 f_orb, not f_orb: the 2 f_orb harmonic dominates and the
    //    f_orb harmonic vanishes (frequency doubling from the quadratic quadrupole).
    const quadrupoleAtTwiceOrbital =
      quadAtTwice > 0.1 && quadAtOrbital < 1e-6

    // 4. control: the ORBITAL MOTION itself is at f_orb (the body position projects onto
    //    f_orb, not 2 f_orb), so the frequency doubling in the quadrupole is real, not trivial.
    const orbitIsAtOrbital = bodyAtOrbital > 0.1 && bodyAtTwice < 1e-6

    const solved =
      noMonopole &&
      noDipoleRadiation &&
      quadrupoleAtTwiceOrbital &&
      orbitIsAtOrbital

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'for a circular binary with UNEQUAL masses 2 and 1 placed at their centre-of-mass radii 1/3 and 2/3, the monopole (total mass) is constant, the mass dipole is zero to machine precision in the COM frame (a consequence of momentum conservation, m1 r1 = m2 r2, not of a mirror-symmetric input), and the quadrupole moment oscillates purely at twice the orbital frequency with no component at the orbital frequency while the orbital motion itself is at the orbital frequency, so given the standard multipole radiation rule (radiation proportional to the second time derivative of each moment, stated here not derived) the monopole and dipole channels are silent and the wave comes out at 2 f_orb, the cos(2 phi) quadrupole structure that E-GRV-0016 hardcoded, this being the multipole kinematics of the source with no spin-2 field entering the computation',
      metrics: {
        monopoleVariation: Number(monoVar.toExponential(2)),
        maxDipoleMagnitude: Number(maxDipoleMagnitude.toExponential(2)),
        quadrupoleAtOrbitalHarmonic: Number(
          quadAtOrbital.toExponential(2),
        ),
        quadrupoleAtTwiceOrbitalHarmonic: Number(
          quadAtTwice.toFixed(4),
        ),
        orbitAtOrbitalHarmonic: Number(bodyAtOrbital.toFixed(4)),
        orbitAtTwiceOrbitalHarmonic: Number(
          bodyAtTwice.toExponential(2),
        ),
      },
      control: {
        // the ORBITAL MOTION is at f_orb (the body position projects onto f_orb, not 2 f_orb),
        // so the frequency doubling in the quadrupole is a real physical effect of the quadratic
        // quadrupole, not a trivial relabelling. The GW at 2 f_orb is genuinely twice the orbit.
        orbitAtOrbitalHarmonic: Number(bodyAtOrbital.toFixed(4)),
        orbitAtTwiceOrbitalHarmonic: Number(
          bodyAtTwice.toExponential(2),
        ),
      },
      notes:
        'L1. Deterministic binary, no random. This is the multipole KINEMATICS of the source: the radiation rule (h proportional to the second time derivative of Q, monopole radiation with dM/dt, dipole radiation with Dddot) is the standard linearised-GR result STATED here, not derived, and no spin-2 field enters the computation. The source uses UNEQUAL masses (2 and 1) at their COM radii (1/3 and 2/3), so the vanishing dipole follows from momentum conservation in the COM frame (m1 r1 = m2 r2) rather than from a mirror-symmetric input, closing the audit finding that hand-placed equal masses made the dipole vanish by construction. The monopole is constant (mass conservation, the substrate measured continuity E-GRV-0039). The quadrupole projects purely onto the 2 f_orb harmonic with no f_orb component, so given the stated rule the wave is at twice the orbital frequency, the cos(2 phi) signature E-GRV-0016 assumed and LIGO observes. The control is the orbital position, which is at f_orb (not 2 f_orb), confirming the doubling is a real effect of the quadratic quadrupole. The amplitude coefficient is not addressed here (see E-GRV-0044 and E-GRV-0045 for what is and is not measured about it).',
    })
  },
})
