// E-MTR-0007. The covalent bond with STAND-INS: H2+ as two fixed stand-in nuclei and one stand-in electron on
// the husk. The stand-in electron is the fear walk's charged token (E-FRC-0176), its band the walk's own along
// every husk link direction (code/measure/standin-chemistry, choice 1), in the husk lattice Coulomb potential
// of two fixed charges +1 (huskCoulomb's Green's function, E-FRC-0179). It is not the electron and the
// nuclei are not protons: the model has neither yet. What it tests is everything downstream of them: does
// one shared stand-in bind two sources, where, and how deeply, against the continuum molecule.
//
// Method. Exact diagonalization of the one-body Hamiltonian H = T + V_A + V_B on a periodic 32^3 husk box
// (Chebyshev-filtered subspace iteration, residual 1e-7), nuclei on one husk axis at separation R (integer
// husk spacings, placed about the box center), R from 1 to 3 a0. The Born-Oppenheimer energy is
// E(R) = e_0(R) + kappa G(R), the second term the nuclei's own husk Coulomb repulsion. The stand-in Bohr
// radius a0 = 1 / (m alpha) is CHOSEN (the model fixes no alpha): a0 = 2, 3, 4 husk spacings, so the lattice
// error can be watched falling, and the continuum value is read by Richardson extrapolation in 1 / a0^2 from
// a0 = 3 and 4, X = (16 X(4) - 9 X(3)) / 7. The dissociation reference is the same lattice's one-nucleus
// ground state E_H, so D_e = E_H - min E.
//
// The husk lattice core is large at these a0: a solver probe on one stand-in hydrogen (tmp/standin-probe.ts,
// before any run of this file) found E_1s = -1.553 Ry at a0 = 3, the lattice Green's function at the
// nucleus, 24 pi G(0) = 3.98, deeper than a continuum cell's average of 1 / r, and the bounded band costing a
// localized stand-in less than a parabola. That probe and a machine load near 560 moved this file from a
// 64^3 box at a0 = 3, 4, 6 with gates on a0 = 6 to what follows, before its first run.
//
// The continuum references (Born-Oppenheimer, nonrelativistic, infinite nuclear mass):
//   R_e = 1.9972 a0, E(R_e) = -0.602634 E_h, so D_e = 0.102634 E_h = 0.205268 Ry = 2.7928 eV
//   (Bates, Ledsham and Stewart, Phil. Trans. R. Soc. A 246, 215 (1953); Madsen and Peek, Atomic Data 2, 171
//   (1971)). The roadmap's 2.65 eV is D_0, which subtracts the zero-point vibration (not modeled, the nuclei
//   are fixed). The brief's "0.1026 Ry" is 0.1026 hartree: in Rydbergs the depth is 0.2053.
//
// Gates, fixed before the first run:
// 1. BINDS: at a0 = 4 the energy curve has an interior minimum below E_H (D_e > 0)
// 2. WHERE: the extrapolated R_e / a0 within 5 percent of 1.9972 (each R_e from a parabola through the three
//    lowest lattice separations)
// 3. HOW DEEP: the extrapolated D_e / Ry within 10 percent of 0.205268
// 4. CONVERGES: the raw errors of R_e and D_e are each smaller at a0 = 4 than at a0 = 2
// 5. CONTROL, THE ANTIBONDING STATE: the lowest state odd under the mirror through the bond's midplane
//    (sigma_u, projected exactly) stays above E_H at every scanned R, for all three a0: one shared stand-in
//    in the odd state does not bind
// Pass: all five. Partial: gates 1 and 5 hold and a quantitative gate fails. Fail: otherwise.
// Reported, not gated: the bond along a husk face diagonal (the husk's own anisotropy of the bond), the
// lattice hydrogen energy against -1 Ry, and the deepest potential against the band gap 2 pi / 3.
//
// Depth L2: a one-body Schrodinger problem on a lattice, with a stand-in charge and a chosen coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BAND_TOP, externalPotential, greenInfinite, lowestStates, makeGrid, minOf, nuclearRepulsion, standinUnits, type Nucleus, type Point } from '@/code/measure/standin-chemistry'

const SIDE = 32
const CENTER = SIDE / 2
const A0S = [2, 3, 4]
const FINE = 4
const MIDDLE = 3
const COARSE = 2
const R_MIN = 1
const R_MAX = 3
const REFERENCE_RE = 1.9972
const REFERENCE_DE = 0.205268
const TOLERANCE = 1e-7

type Curve = { r: number[]; energy: number[] }

// the minimum of a sampled curve by a parabola through its lowest point and neighbors
function minimum(curve: Curve): { r: number; energy: number; interior: boolean } {
  const i = curve.energy.indexOf(Math.min(...curve.energy))

  if (i <= 0 || i >= curve.energy.length - 1) {
    return { r: curve.r[i] ?? Number.NaN, energy: curve.energy[i] ?? Number.NaN, interior: false }
  }

  const [x0, x1, x2] = [curve.r[i - 1] ?? 0, curve.r[i] ?? 0, curve.r[i + 1] ?? 0]
  const [y0, y1, y2] = [curve.energy[i - 1] ?? 0, curve.energy[i] ?? 0, curve.energy[i + 1] ?? 0]
  const denominator = (x0 - x1) * (x0 - x2) * (x1 - x2)
  const a = (x2 * (y1 - y0) + x1 * (y0 - y2) + x0 * (y2 - y1)) / denominator
  const b = (x2 * x2 * (y0 - y1) + x1 * x1 * (y2 - y0) + x0 * x0 * (y1 - y2)) / denominator
  const c = (x1 * x2 * (x1 - x2) * y0 + x2 * x0 * (x2 - x0) * y1 + x0 * x1 * (x0 - x1) * y2) / denominator
  const r = -b / (2 * a)

  return { r, energy: c - (b * b) / (4 * a), interior: true }
}

function scan(a0: number, direction: Point, steps: number[]): { bonding: Curve; antibonding: Curve; hydrogen: number; deepest: number } {
  const grid = makeGrid(SIDE)
  const units = standinUnits(a0)
  const center: Point = [CENTER, CENTER, CENTER]
  const hydrogenPotential = externalPotential({ grid, units, nuclei: [{ at: center, charge: 1 }] })
  const hydrogen = lowestStates({ grid, potential: hydrogenPotential, count: 1, extra: 3, tolerance: TOLERANCE }).values[0] ?? Number.NaN
  const bonding: Curve = { r: [], energy: [] }
  const antibonding: Curve = { r: [], energy: [] }
  const length = Math.hypot(...direction)

  let deepest = 0
  let evenStart: Float64Array[] | undefined
  let oddStart: Float64Array[] | undefined

  for (const m of steps) {
    const shift = Math.floor(m / 2)
    const a: Point = [CENTER - shift * direction[0], CENTER - shift * direction[1], CENTER - shift * direction[2]]
    const b: Point = [a[0] + m * direction[0], a[1] + m * direction[1], a[2] + m * direction[2]]
    const nuclei: Nucleus[] = [
      { at: a, charge: 1 },
      { at: b, charge: 1 },
    ]
    const potential = externalPotential({ grid, units, nuclei })
    const repulsion = nuclearRepulsion(units, nuclei)
    // the mirror through the bond's midplane: x -> a + b - x along the bond, the other coordinates kept, for
    // an axis bond; for a face-diagonal bond the mirror swaps the two diagonal coordinates about the midpoint
    const mirror = (i: number): number => {
      const x = i % SIDE
      const y = Math.floor(i / SIDE) % SIDE
      const z = Math.floor(i / (SIDE * SIDE))
      const wrap = (v: number): number => ((v % SIDE) + SIDE) % SIDE

      if (direction[1] === 0) {
        return wrap(a[0] + b[0] - x) + SIDE * (y + SIDE * z)
      }

      // the plane normal to (1, 1, 0) through the midpoint: (x, y) -> (s - y, s - x) with s the midpoint sum
      const s = (a[0] + b[0] + a[1] + b[1]) / 2

      return wrap(s - y) + SIDE * (wrap(s - x) + SIDE * z)
    }
    const odd = (v: Float64Array): void => {
      const copy = Float64Array.from(v)

      for (let i = 0; i < v.length; i++) {
        v[i] = ((copy[i] ?? 0) - (copy[mirror(i)] ?? 0)) / 2
      }
    }
    const even = lowestStates({ grid, potential, count: 1, extra: 3, start: evenStart, tolerance: TOLERANCE })

    evenStart = even.vectors
    bonding.r.push((m * length) / a0)
    bonding.energy.push((even.values[0] ?? 0) + repulsion)
    deepest = Math.min(deepest, minOf(potential))

    if (direction[1] === 0) {
      const oddStates = lowestStates({ grid, potential, count: 1, extra: 3, start: oddStart, project: odd, tolerance: TOLERANCE })

      oddStart = oddStates.vectors
      antibonding.r.push((m * length) / a0)
      antibonding.energy.push((oddStates.values[0] ?? 0) + repulsion)
    }
  }

  return { bonding, antibonding, hydrogen, deepest }
}

export default experiment({
  id: 'quantum/standin-h2-plus',
  code: 'E-MTR-0007',
  title:
    'the covalent bond with stand-ins: one stand-in electron (the charged fear walk) shared by two fixed stand-in nuclei in the husk lattice Coulomb potential binds, and its bond length and depth in stand-in Bohr radii and Rydbergs are read against the continuum H2+ values 1.997 a0 and 0.2053 Ry',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const results = A0S.map(a0 => {
      const steps = Array.from({ length: Math.round((R_MAX - R_MIN) * a0) + 1 }, (_, i) => Math.round(R_MIN * a0) + i)
      const run = scan(a0, [1, 0, 0], steps)
      const units = standinUnits(a0)
      const min = minimum(run.bonding)
      const re = min.r
      const de = (run.hydrogen - min.energy) / units.rydberg
      const antibondingAbove = run.antibonding.energy.every(e => e > run.hydrogen)

      metrics[`a0${a0}HydrogenOverRydberg`] = run.hydrogen / units.rydberg
      metrics[`a0${a0}BondLengthOverA0`] = re
      metrics[`a0${a0}DepthOverRydberg`] = de
      metrics[`a0${a0}Interior`] = min.interior ? 1 : 0
      metrics[`a0${a0}AntibondingLowestAboveHydrogenRydberg`] = (Math.min(...run.antibonding.energy) - run.hydrogen) / units.rydberg
      metrics[`a0${a0}DeepestPotentialOverBandGap`] = -run.deepest / BAND_TOP
      run.bonding.r.forEach((r, i) => (metrics[`a0${a0}CurveR${r.toFixed(3)}Rydberg`] = ((run.bonding.energy[i] ?? 0) - run.hydrogen) / units.rydberg))

      return { a0, re, de, interior: min.interior, antibondingAbove }
    })
    const fine = results.find(r => r.a0 === FINE)
    const middle = results.find(r => r.a0 === MIDDLE)
    const coarse = results.find(r => r.a0 === COARSE)
    // Richardson in 1 / a0^2 from a0 = 3 and 4
    const extrapolate = (a: number, b: number): number => (FINE ** 2 * a - MIDDLE ** 2 * b) / (FINE ** 2 - MIDDLE ** 2)
    const limit = { re: extrapolate(fine?.re ?? Number.NaN, middle?.re ?? Number.NaN), de: extrapolate(fine?.de ?? Number.NaN, middle?.de ?? Number.NaN) }
    // the bond along a face diagonal at a0 = 4, separations m sqrt 2 about the axis minimum
    const diagonal = scan(FINE, [1, 1, 0], [4, 5, 6, 7])
    const diagonalMin = minimum(diagonal.bonding)
    const units = standinUnits(FINE)

    metrics['a0' + FINE + 'DiagonalBondLengthOverA0'] = diagonalMin.r
    metrics['a0' + FINE + 'DiagonalDepthOverRydberg'] = (diagonal.hydrogen - diagonalMin.energy) / units.rydberg
    metrics['greenAtZeroTimes24Pi'] = 24 * Math.PI * greenInfinite(0, 0, 0)

    const reError = (r: typeof fine): number => Math.abs((r?.re ?? Number.NaN) / REFERENCE_RE - 1)
    const deError = (r: typeof fine): number => Math.abs((r?.de ?? Number.NaN) / REFERENCE_DE - 1)
    const gate1 = (fine?.interior ?? false) && (fine?.de ?? 0) > 0
    const gate2 = Math.abs(limit.re / REFERENCE_RE - 1) < 0.05
    const gate3 = Math.abs(limit.de / REFERENCE_DE - 1) < 0.1
    const gate4 = reError(fine) < reError(coarse) && deError(fine) < deError(coarse)
    const gate5 = results.every(r => r.antibondingAbove)
    const status = gate1 && gate2 && gate3 && gate4 && gate5 ? 'pass' : gate1 && gate5 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `one stand-in electron shared by two fixed stand-in nuclei on the husk ${gate1 ? 'binds' : 'does not bind'}: at a0 = ${FINE} the bond sits at ${fine?.re.toFixed(3)} a0 with depth ${fine?.de.toFixed(4)} Ry, extrapolated ${limit.re.toFixed(3)} a0 and ${limit.de.toFixed(4)} Ry (continuum 1.997 and 0.2053), and the antibonding state ${gate5 ? 'never binds' : 'binds somewhere'}`,
      metrics: {
        ...metrics,
        gateBinds: gate1 ? 1 : 0,
        gateBondLength: gate2 ? 1 : 0,
        gateDepth: gate3 ? 1 : 0,
        gateConverges: gate4 ? 1 : 0,
        gateAntibonding: gate5 ? 1 : 0,
        extrapolatedBondLengthOverA0: limit.re,
        extrapolatedDepthOverRydberg: limit.de,
        bondLengthError: reError(fine),
        depthError: deError(fine),
        bondLengthErrorCoarse: reError(coarse),
        depthErrorCoarse: deError(coarse),
      },
      control: {
        antibondingMinusHydrogenRydbergA0Fine: metrics[`a0${FINE}AntibondingLowestAboveHydrogenRydberg`] ?? Number.NaN,
      },
      notes:
        'L2, stand-ins throughout: the electron is the charged fear walk (not the electron, which the model has not produced), the nuclei are fixed husk charges, and alpha is chosen through a0. The stand-in band is the fear walk band along each husk link direction weighed by the husk weights (mass sqrt 3), band-projected: the walk\'s second band and its quasi-energy wrap are left out. Exact diagonalization, no mean field. The continuum H2+ depth is 0.1026 hartree = 0.2053 Ry (the brief\'s "0.1026 Ry" is in hartree); the roadmap\'s 2.65 eV is D_0 with zero-point vibration, not modeled here. First run, 2026-09-25, status partial, and the failures stand. The bond forms and the antibonding state never binds (sigma_u above E_H by 0.23 Ry at its lowest, a0 = 4), and the raw errors fall from a0 = 2 to 4 (R_e 50 to 21 percent, D_e 132 to 26 percent). But at a0 = 4 the bond sits at 1.577 a0 with depth 0.259 Ry, and at a0 = 2 and 3 the minimum is not interior (the energy is still falling at R = 1 a0). The Richardson extrapolation from a0 = 3 and 4 is meaningless for that reason (2.32 a0, 0.057 Ry): a0 = 3 has no minimum to extrapolate. The cause is the husk lattice core: one stand-in hydrogen binds at -3.42, -1.55, -1.19 Ry for a0 = 2, 3, 4, against -1, because 24 pi G(0) = 3.98 and the bounded band make the nucleus\'s own dock a deep well. A continuum H2+ needs a0 well above 4 husk spacings, which this machine load did not allow. Along a face diagonal the bond reads 1.41 a0 (the edge of that scan) and 0.254 Ry, within 2 percent of the axis depth.',
    })
  },
})
