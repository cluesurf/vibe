// E-MTR-0008. Exchange with STAND-INS: two stand-in electrons (charged fear-walk tokens, E-FRC-0176) and two
// fixed stand-in nuclei on the husk, the H2 molecule, in the spatially symmetric (singlet) and antisymmetric
// (triplet) states. Nothing here is the electron or the proton; the stand-ins test what exchange does to a
// bond once something carries it.
//
// Method. At each separation R the one-body Hamiltonian h = T + V_A + V_B of E-MTR-0007 is diagonalized on
// a periodic 32^3 husk box (a0 = 4), and its K = 8 lowest orbitals are the basis. Every two-body integral
// (ij|kl) is computed exactly on the lattice, the husk Green's function convolved with open boundaries
// (code/measure/standin-chemistry). The two-stand-in Hamiltonian in the K^2 product basis is then
// diagonalized three ways: on all of it (stand-ins that can be told apart), on the symmetric subspace
// psi(x1, x2) = psi(x2, x1), and on the antisymmetric one psi(x1, x2) = -psi(x2, x1). This is full
// configuration interaction within the basis, not a mean field. E(R) adds the nuclei's repulsion; the
// dissociation reference is 2 E_H, E_H the same lattice's one-nucleus ground state.
//
// HOW ANTISYMMETRY IS IMPOSED: by hand, by restricting to the -1 eigenspace of the swap of the two
// stand-ins' coordinates. The stand-in has no spin, so a fermion pair in the spatially symmetric state needs
// an internal label that is antisymmetric. Can the model supply it itself? E-SPN-0045 put exclusion in the
// signed weight: two fermions on the role grid (a qutrit) are 72 loves and 18 fears, with zero chance of a
// shared role. So the role is a label the model has, but it is three-valued, not two: the antisymmetric part
// of two roles has dimension 3 and the symmetric part 6, where a spin-one-half pair has 1 and 3. With the
// role as the label, the bonding (symmetric) state is threefold and the antibonding sixfold. That count is
// computed here and its consequence for shells is E-MTR-0012. The sign itself the committed knit does not
// produce (E-FND-0080: no amplitudes), so the dynamics does not supply antisymmetry, the signed weight does.
//
// Continuum references: H2 X 1Sigma_g+ R_e = 1.4011 a0, E = -1.174475 E_h, D_e = 0.174475 E_h = 0.348950 Ry =
// 4.7477 eV (Kolos and Wolniewicz, J. Chem. Phys. 49, 404 (1968)); the b 3Sigma_u+ triplet is repulsive at
// every chemical separation (Kolos and Wolniewicz, J. Chem. Phys. 43, 2429 (1965)), its van der Waals well of
// a few cm^-1 near 7.8 a0 lies beyond this scan.
//
// Gates, fixed before the first run of this file (K = 8, R = 3 to 12 husk spacings, 0.75 to 3 a0). The basis,
// a0 and R list were cut from K = 16, a0 = 3 before any run, when a one-stand-in hydrogen probe showed the
// husk lattice core binds a0 = 3 hydrogen at -1.55 Ry and the machine ran at a load near 560:
// 1. THE SINGLET BINDS: the symmetric ground state has an interior minimum below 2 E_H
// 2. THE TRIPLET DOES NOT: the antisymmetric ground state lies above 2 E_H at every scanned R
// 3. WHERE AND HOW DEEP: the singlet R_e / a0 within 15 percent of 1.4011 and D_e / Ry within 25 percent of
//    0.34895 (a finite basis underbinds, and a0 = 4 is a coarse lattice)
// 4. CONSISTENCY: the ground state of two stand-ins that can be told apart equals the symmetric ground state
//    to 1e-9 of its size at every R (a theorem: the ground state of a symmetric two-body Hamiltonian is
//    spatially symmetric), and the triplet is never below it
// Pass: all four. Partial: gates 1, 2 and 4 hold and gate 3 fails. Fail: otherwise.
// Reported: K = 2 (the minimal basis), the exchange splitting E_T - E_S at R_e, the label counts.
//
// Depth L2: exact two-body quantum mechanics on a lattice with stand-in charges and a chosen coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  externalPotential,
  lowestStates,
  makeGrid,
  makePoisson,
  nuclearRepulsion,
  pairIntegrals,
  standinUnits,
  twoBodySpectrum,
  type Nucleus,
  type Point,
} from '@/code/measure/standin-chemistry'

const SIDE = 32
const CENTER = SIDE / 2
const A0 = 4
const BASIS = 8
const SMALLER = [2]
const SEPARATIONS = [3, 4, 5, 6, 7, 8, 10, 12]
const REFERENCE_RE = 1.4011
const REFERENCE_DE = 0.34895

// the integrals of the first k orbitals out of a K^4 table
function slice(table: Float64Array, big: number, k: number): Float64Array {
  const out = new Float64Array(k ** 4)

  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      for (let c = 0; c < k; c++) {
        for (let d = 0; d < k; d++) {
          out[((a * k + b) * k + c) * k + d] = table[((a * big + b) * big + c) * big + d] ?? 0
        }
      }
    }
  }

  return out
}

function minimum(r: number[], e: number[]): { r: number; energy: number; interior: boolean } {
  const i = e.indexOf(Math.min(...e))

  if (i <= 0 || i >= e.length - 1) {
    return { r: r[i] ?? Number.NaN, energy: e[i] ?? Number.NaN, interior: false }
  }

  const [x0, x1, x2] = [r[i - 1] ?? 0, r[i] ?? 0, r[i + 1] ?? 0]
  const [y0, y1, y2] = [e[i - 1] ?? 0, e[i] ?? 0, e[i + 1] ?? 0]
  const denominator = (x0 - x1) * (x0 - x2) * (x1 - x2)
  const a = (x2 * (y1 - y0) + x1 * (y0 - y2) + x0 * (y2 - y1)) / denominator
  const b = (x2 * x2 * (y0 - y1) + x1 * x1 * (y2 - y0) + x0 * x0 * (y1 - y2)) / denominator
  const c = (x1 * x2 * (x1 - x2) * y0 + x2 * x0 * (x2 - x0) * y1 + x0 * x1 * (x0 - x1) * y2) / denominator

  return { r: -b / (2 * a), energy: c - (b * b) / (4 * a), interior: true }
}

// the dimensions of the symmetric and antisymmetric parts of a pair of d-valued labels, by the swap's trace:
// dim(sym) - dim(anti) = tr(swap) = d, dim(sym) + dim(anti) = d^2
function labelCounts(d: number): { symmetric: number; antisymmetric: number } {
  let trace = 0

  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      // <ab | swap | ab> = [a == b]
      trace += a === b ? 1 : 0
    }
  }

  return { symmetric: (d * d + trace) / 2, antisymmetric: (d * d - trace) / 2 }
}

export default experiment({
  id: 'quantum/standin-h2-exchange',
  code: 'E-MTR-0008',
  title:
    'exchange with stand-ins: two stand-in electrons on two fixed stand-in nuclei on the husk, solved exactly in an 8-orbital lattice basis, bind in the spatially symmetric state and not in the antisymmetric one, with antisymmetry imposed by hand; the model\'s own label for it, the role, is three-valued',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const grid = makeGrid(SIDE)
    const poisson = makePoisson(SIDE)
    const units = standinUnits(A0)
    const center: Point = [CENTER, CENTER, CENTER]
    const hydrogen = lowestStates({ grid, potential: externalPotential({ grid, units, nuclei: [{ at: center, charge: 1 }] }), count: 1, extra: 3, tolerance: 1e-7 }).values[0] ?? Number.NaN
    const singlet: Record<number, number[]> = { 2: [], [BASIS]: [] }
    const triplet: Record<number, number[]> = { 2: [], [BASIS]: [] }
    const metrics: Record<string, number> = {}

    let consistency = 0
    let tripletBelow = 0
    let start: Float64Array[] | undefined

    for (const m of SEPARATIONS) {
      const shift = Math.floor(m / 2)
      const nuclei: Nucleus[] = [
        { at: [CENTER - shift, CENTER, CENTER], charge: 1 },
        { at: [CENTER - shift + m, CENTER, CENTER], charge: 1 },
      ]
      const potential = externalPotential({ grid, units, nuclei })
      const repulsion = nuclearRepulsion(units, nuclei)
      const states = lowestStates({ grid, potential, count: BASIS, extra: 6, start, tolerance: 1e-6 })

      start = states.vectors

      const orbitals = states.vectors.slice(0, BASIS)
      const table = pairIntegrals(poisson, orbitals, units.kappa)

      for (const k of [...SMALLER, BASIS]) {
        const spectrum = twoBodySpectrum({ oneBody: states.values.slice(0, k), integrals: k === BASIS ? table : slice(table, BASIS, k), k })
        const s = (spectrum.symmetric[0] ?? 0) + repulsion
        const t = (spectrum.antisymmetric[0] ?? 0) + repulsion

        singlet[k]?.push(s)
        triplet[k]?.push(t)

        if (k === BASIS) {
          const d = (spectrum.distinguishable[0] ?? 0) + repulsion

          consistency = Math.max(consistency, Math.abs(d - s) / Math.abs(s))
          tripletBelow += t < s ? 1 : 0
          metrics[`r${(m / A0).toFixed(3)}SingletRydberg`] = (s - 2 * hydrogen) / units.rydberg
          metrics[`r${(m / A0).toFixed(3)}TripletRydberg`] = (t - 2 * hydrogen) / units.rydberg
        }
      }

      metrics[`r${(m / A0).toFixed(3)}WorstOrbitalResidual`] = Math.max(...states.residuals)
    }

    const r = SEPARATIONS.map(m => m / A0)
    const bond = (k: number): { r: number; energy: number; interior: boolean } => minimum(r, singlet[k] ?? [])
    const full = bond(BASIS)
    const de = (2 * hydrogen - full.energy) / units.rydberg
    const tripletAbove = (triplet[BASIS] ?? []).every(t => t > 2 * hydrogen)
    const nearest = r.reduce((best, x, i) => (Math.abs(x - full.r) < Math.abs((r[best] ?? 0) - full.r) ? i : best), 0)
    const splitting = (((triplet[BASIS] ?? [])[nearest] ?? 0) - ((singlet[BASIS] ?? [])[nearest] ?? 0)) / units.rydberg
    const spin = labelCounts(2)
    const role = labelCounts(3)

    for (const k of SMALLER) {
      const b = bond(k)

      metrics[`basis${k}BondLengthOverA0`] = b.r
      metrics[`basis${k}DepthOverRydberg`] = (2 * hydrogen - b.energy) / units.rydberg
      metrics[`basis${k}TripletAbove`] = (triplet[k] ?? []).every(t => t > 2 * hydrogen) ? 1 : 0
    }

    const gate1 = full.interior && de > 0
    const gate2 = tripletAbove
    const gate3 = Math.abs(full.r / REFERENCE_RE - 1) < 0.15 && Math.abs(de / REFERENCE_DE - 1) < 0.25
    const gate4 = consistency < 1e-9 && tripletBelow === 0
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 && gate4 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `two stand-in electrons on two stand-in nuclei bind only when their spatial state is symmetric: the singlet sits at ${full.r.toFixed(3)} a0 with depth ${de.toFixed(4)} Ry (continuum 1.401 a0, 0.3490 Ry) and the triplet lies above two atoms at every separation; antisymmetry is imposed by hand, and the model's own label for it, the role, is three-valued`,
      metrics: {
        ...metrics,
        hydrogenOverRydberg: hydrogen / units.rydberg,
        bondLengthOverA0: full.r,
        depthOverRydberg: de,
        bondLengthError: full.r / REFERENCE_RE - 1,
        depthError: de / REFERENCE_DE - 1,
        exchangeSplittingAtBondRydberg: splitting,
        distinguishableAgainstSymmetric: consistency,
        tripletBelowSinglet: tripletBelow,
        spinPairSymmetric: spin.symmetric,
        spinPairAntisymmetric: spin.antisymmetric,
        rolePairSymmetric: role.symmetric,
        rolePairAntisymmetric: role.antisymmetric,
        gateSingletBinds: gate1 ? 1 : 0,
        gateTripletDoesNot: gate2 ? 1 : 0,
        gateBondValues: gate3 ? 1 : 0,
        gateConsistency: gate4 ? 1 : 0,
      },
      control: {
        tripletAboveTwoAtomsAtEveryR: tripletAbove ? 1 : 0,
        distinguishableAgainstSymmetric: consistency,
      },
      notes:
        'L2, stand-ins throughout (charged fear-walk electrons, fixed husk charges for nuclei, alpha chosen through a0 = 4 husk spacings). Full configuration interaction in the 8 lowest one-body lattice orbitals at each R, every two-body integral exact on the lattice with the husk Green\'s function and open boundaries. Antisymmetry is imposed by hand (the -1 eigenspace of the coordinate swap); the stand-in has no spin. With a two-valued label the symmetric (bonding) state is 1-fold and the antisymmetric 3-fold; with the role, the model\'s own three-valued label that carries exclusion in the signed weight (E-SPN-0045), 3-fold and 6-fold. The committed knit carries no amplitudes (E-FND-0080), so the sign is not supplied by the dynamics. First run, 2026-09-25, status partial, and gate 3 fails. The singlet binds (D_e 0.406 Ry at R_e 1.076 a0), the triplet lies above two atoms at every R (0.06 to 0.78 Ry), the distinguishable ground state equals the symmetric one to 7e-15 and the triplet is never below it, and the exchange splitting at R_e is 0.97 Ry. Against the continuum 1.401 a0 and 0.349 Ry the bond is 23 percent short and 16 percent deep: the lattice core that overbinds one stand-in hydrogen (-1.19 Ry at a0 = 4) pulls the nuclei in, the same shortening E-MTR-0007 shows. The minimal 2-orbital basis gives 1.253 a0 and 0.237 Ry. The label counts are printed with the swap trace: a two-valued label pair has 3 symmetric and 1 antisymmetric states, the role pair 6 and 3, so the spatially symmetric bond takes the antisymmetric label part: 1-fold with spin, 3-fold with the role.',
    })
  },
})
