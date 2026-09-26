// 2p -> 1s on trits, semiclassically (E-FRC-0222): the quantum atom of E-FRC-0221 (a STAND-IN fear-walk
// electron, Z = 74, a = 3.00 docks, D = 16, five shaped levels, side 32) radiating into the trit light.
//
// WHAT A SEMICLASSICAL ATOM DOES, derived before any run. The light sees the expectation of the electron's
// string, so it radiates only while the expectation dipole oscillates. With psi = sqrt(1 - P) |1s> + sqrt(P)
// |2p>, the dipole's amplitude is 2 d sqrt(P (1 - P)), and a classical dipole p0 cos(omega t) in the husk light
// (norm 24 pi, E-FRC-0211) radiates omega^4 p0^2 / (72 pi c^3) times pi / D, so energy balance gives
//   dP / dt = - Gamma P (1 - P),   Gamma = omega^3 d^2 / (18 D c^3)
// (E-FRC-0211's dipole rate in trit units). So: a pure 2p (P = 1) never starts to decay (its expectation
// dipole is zero, and by parity nothing in the coupled run can mix 1s into it: the source of an odd state's
// density is even), a half-and-half state loses P at Gamma / 4, and a 90 percent state at 0.09 Gamma, so the
// slopes stand in the ratio 4 x 0.9 x 0.1 = 0.36. A fully quantum (signed) decay would give dP / dt = -Gamma
// P: ratio 1.8, and a pure 2p decaying at Gamma. The atom is not small against its light (k a = 0.66), so
// the rate is Gamma times the source's own retardation factor R = <|P_T(k n)|^2> / <|P_T(0)|^2>, the
// direction average of the transverse part of the Fourier transform of the path polarization the light
// actually receives (the transition density's), at k = omega / c: E-FRC-0211's full-current factor, computed
// for this lattice atom instead of the continuum one.
//
// THE BOX. The torus returns the atom's own radiation (and its images') after L / c = 159 beats at side 32,
// so a rate is read only before that, over two thirds of one transition period; an exponential decay at
// Gamma would need a box holding the whole emitted train, c / Gamma docks (reported).
//
// DISCLOSED: tmp/compact-atom-probe2c.log (the E-FRC-0221 probe) showed the half-and-half P_2p falling from 0.5
// to 0.4961 in 300 beats (about 5e-5 per beat of Gamma over the whole 300, box return included) before these
// gates were written; R was not computed before.
//
// Gates:
// D1 THE GATE: from (1s + 2p) / sqrt 2, the fit P_2p(t) = c0 + c1 t + A cos 2 omega t + B sin 2 omega t over
//    beats 10 to 155 gives -4 c1 within 0.8 to 1.25 of Gamma R
// D2 the semiclassical law: the same fit from sqrt 0.1 |1s> + sqrt 0.9 |2p> gives c1 at 0.36 +- 0.06 of the
//    half-and-half c1 (an exponential, fully quantum law would give 1.8)
// D3 a pure 2p does not start to decay: P_1s stays at most 1e-10 over 160 beats
// Reported: Gamma, R, k a, the one-way control's P_2p (no back-action), the half-and-half run to 600 beats
// (the box's return), and the box an exponential decay would need.
// Status: pass if every gate passes, partial if D2 and D3 pass, fail otherwise.
//
// Depth L2, STAND-IN electron and nucleus, semiclassical coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { atomBeat, atomLevels, makeQuantumAtom, overlap, polarization, setWalk } from '@/code/measure/trit-quantum-atom'

const SIDE = 32
const DEPTH = 16
const LEVELS = 5
const CHARGE = 74
const WINDOW: [number, number] = [10, 155]

function series(start: number, coupled: boolean, beats: number): { p2: number[]; p1: number[]; omega: number } {
  const atom = makeQuantumAtom({ side: SIDE, depth: DEPTH, levels: LEVELS, charge: CHARGE, coupled })
  const lv = atomLevels(atom)
  const re = new Float64Array(SIDE ** 3)
  const im = new Float64Array(SIDE ** 3)
  const a = Math.sqrt(1 - start)
  const b = Math.sqrt(start)

  for (let i = 0; i < re.length; i++) re[i] = a * lv.s[i]! + b * lv.p[i]!

  setWalk(atom, re, im)

  const p2 = [overlap(atom, lv.p)]
  const p1 = [overlap(atom, lv.s)]

  for (let t = 1; t <= beats; t++) {
    atomBeat(atom)
    p2.push(overlap(atom, lv.p))
    p1.push(overlap(atom, lv.s))
  }

  return { p2, p1, omega: lv.omega }
}

// least squares of y = c0 + c1 t + A cos(2 w t) + B sin(2 w t) over [from, to]
function fitSlope(y: number[], omega: number, from: number, to: number): number {
  const rows: number[][] = []
  const rhs: number[] = []

  for (let t = from; t <= to; t++) {
    rows.push([1, t, Math.cos(2 * omega * t), Math.sin(2 * omega * t)])
    rhs.push(y[t]!)
  }

  const n = 4
  const m = Array.from({ length: n }, () => new Array<number>(n + 1).fill(0))

  rows.forEach((r, k) => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) m[i]![j] = m[i]![j]! + r[i]! * r[j]!
      m[i]![n] = m[i]![n]! + r[i]! * rhs[k]!
    }
  })

  for (let i = 0; i < n; i++) {
    let p = i

    for (let r = i + 1; r < n; r++) if (Math.abs(m[r]![i]!) > Math.abs(m[p]![i]!)) p = r

    const tmp = m[i]!

    m[i] = m[p]!
    m[p] = tmp

    for (let r = 0; r < n; r++) {
      if (r === i) continue

      const f = m[r]![i]! / m[i]![i]!

      for (let c = i; c <= n; c++) m[r]![c] = m[r]![c]! - f * m[i]![c]!
    }
  }

  return m[1]![n]! / m[1]![1]!
}

// R: the transverse part of the transition polarization's Fourier transform at k = omega / c, direction
// averaged (golden-angle directions), over its value at k = 0
function retardation(k: number): { ratio: number; dipole: number } {
  const atom = makeQuantumAtom({ side: SIDE, depth: DEPTH, levels: LEVELS, charge: CHARGE })
  const lv = atomLevels(atom)
  const rho = Float64Array.from(lv.s, (v, i) => v * lv.p[i]!)
  const pol = new Float64Array(SIDE ** 3 * 9)
  const h = SIDE / 2

  polarization(SIDE, rho, pol)

  const directions = 400
  const golden = Math.PI * (3 - Math.sqrt(5))
  const transverse = (kk: number): number => {
    let sum = 0

    for (let j = 0; j < directions; j++) {
      const z = 1 - (2 * j + 1) / directions
      const r = Math.sqrt(1 - z * z)
      const n = [r * Math.cos(golden * j), r * Math.sin(golden * j), z]
      const fr = [0, 0, 0]
      const fi = [0, 0, 0]

      for (let y = 0; y < SIDE ** 3; y++) {
        const c = [(y % SIDE) - h, (Math.floor(y / SIDE) % SIDE) - h, Math.floor(y / (SIDE * SIDE)) - h]

        for (let i = 0; i < 3; i++) {
          const v = pol[y * 9 + i]!

          if (v === 0) continue

          const pos = [c[0]!, c[1]!, c[2]!]

          pos[i] = pos[i]! + 0.5

          const phase = kk * (n[0]! * pos[0]! + n[1]! * pos[1]! + n[2]! * pos[2]!)

          fr[i] = fr[i]! + v * Math.cos(phase)
          fi[i] = fi[i]! + v * Math.sin(phase)
        }
      }

      const dr = n[0]! * fr[0]! + n[1]! * fr[1]! + n[2]! * fr[2]!
      const di = n[0]! * fi[0]! + n[1]! * fi[1]! + n[2]! * fi[2]!

      sum += fr[0]! ** 2 + fr[1]! ** 2 + fr[2]! ** 2 + fi[0]! ** 2 + fi[1]! ** 2 + fi[2]! ** 2 - dr * dr - di * di
    }

    return sum / directions
  }

  return { ratio: transverse(k) / transverse(0), dipole: Math.abs(lv.dipole) }
}

export default experiment({
  id: 'gauge/trit-quantum-decay',
  code: 'E-FRC-0222',
  title:
    '2p -> 1s on trits, semiclassically: the STAND-IN quantum atom radiates into the five-level trit light at a rate read before the torus returns its light, by the semiclassical law dP/dt = -Gamma P (1 - P), so a pure 2p never starts to decay',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const half = series(0.5, true, 600)
    const ninety = series(0.9, true, 160)
    const pure = series(1, true, 160)
    const oneWay = series(0.5, false, 160)
    const omega = half.omega
    const kappa = 2 / (2 * DEPTH + 1)
    const c = Math.sqrt((2 * kappa) / 3)
    const a = (24 * DEPTH) / (Math.sqrt(3) * CHARGE)
    const k = omega / c
    const r = retardation(k)
    const gamma = (omega ** 3 * r.dipole ** 2) / (18 * DEPTH * c ** 3)
    const predicted = gamma * r.ratio
    const slopeHalf = fitSlope(half.p2, omega, WINDOW[0], WINDOW[1])
    const slopeNinety = fitSlope(ninety.p2, omega, WINDOW[0], WINDOW[1])
    const slopeOneWay = fitSlope(oneWay.p2, omega, WINDOW[0], WINDOW[1])
    const measured = -4 * slopeHalf
    const ratio = slopeNinety / slopeHalf
    const pureMax = Math.max(...pure.p1)
    const metrics: Record<string, number> = {
      omega,
      dipole: r.dipole,
      c,
      ka: k * a,
      gammaDipole: gamma,
      retardation: r.ratio,
      gammaPredicted: predicted,
      gammaMeasured: measured,
      measuredOverPredicted: measured / predicted,
      measuredOverDipole: measured / gamma,
      slopeHalf,
      slopeNinety,
      slopeRatio: ratio,
      slopeOneWay,
      pureP1Max: pureMax,
      pureP2End: pure.p2[pure.p2.length - 1] ?? 0,
      halfP2At155: half.p2[155] ?? 0,
      halfP2At300: half.p2[300] ?? 0,
      halfP2At450: half.p2[450] ?? 0,
      halfP2At600: half.p2[600] ?? 0,
      halfP2Min: Math.min(...half.p2),
      returnBeats: SIDE / c,
      boxForExponential: c / predicted,
      lifetime: 1 / predicted,
    }

    const gates = {
      D1: measured / predicted >= 0.8 && measured / predicted <= 1.25,
      D2: Math.abs(ratio - 0.36) <= 0.06,
      D3: pureMax <= 1e-10,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.D2 && gates.D3 ? 'partial' : 'fail'
    const e = (x: number): string => x.toExponential(3)

    return verdict({
      status,
      claim: `the STAND-IN atom (omega ${e(omega)}, d ${r.dipole.toFixed(3)}, k a ${(k * a).toFixed(2)}) loses P_2p from half and half at ${e(measured)} per beat of Gamma (fit over beats ${WINDOW[0]} to ${WINDOW[1]}, before the torus returns its light at ${(SIDE / c).toFixed(0)}), ${(measured / predicted).toFixed(3)} of E-FRC-0211's rate with the source's own retardation (Gamma ${e(gamma)} times R ${r.ratio.toFixed(3)}); from 90 percent 2p its slope is ${ratio.toFixed(3)} of the half-and-half slope (semiclassical P (1 - P): 0.36, a quantum exponential: 1.8); a pure 2p never starts to decay (P_1s at most ${e(pureMax)}); an exponential decay would need a box of ${(c / predicted).toFixed(0)} docks`,
      metrics,
      control: { oneWaySlope: slopeOneWay },
      notes:
        'L2, STAND-IN electron and nucleus, semiclassical coupling. FIRST RUN 2026-09-26 (tmp/frc0222.log, 220 s), PARTIAL, no gate moved. D1 FAILS by 0.7 percent of its window: from half and half, P_2p falls at a fitted -4 c1 = 3.94e-5 per beat over beats 10 to 155, 0.793 of Gamma R = 4.97e-5 (the gate asked 0.8 to 1.25), 0.574 of the bare dipole rate Gamma = 6.86e-5; R = 0.724 is the transverse retardation of this lattice atom\'s own transition polarization at k a = 0.66. The window is two thirds of one transition period (period 142 beats, the torus returns the light at 159), which the fit spans with a 2 omega oscillation; the whole 600-beat run falls 0.5 -> 0.4910, 1.5e-5 per beat of P averaged, box return included. D2 PASSES: from 90 percent 2p the slope is 0.361 of the half-and-half slope, the semiclassical P (1 - P) law\'s 0.36 (a quantum exponential would give 1.8). D3 PASSES: a pure 2p never starts to decay, P_1s at most 1.5e-16 over 160 beats (P_2p 1 - 3.4e-8, the split beat\'s own breathing). The one-way control (no back-action) holds P_2p (slope -3e-11): the decay is the light acting back. An exponential 2p decay at this rate needs a box of about c / Gamma = 4,048 docks (lifetime 20,137 beats), far beyond side 32. SEMICLASSICAL, PLAINLY: the pure-2p result is the textbook failure of semiclassical radiation (no expectation dipole, no emission, no spontaneous decay); spontaneous emission needs the light sourced per history of the signed whole (each history a whole-unit string, its own light), with the outcome the net line count over histories.',
    })
  },
})
