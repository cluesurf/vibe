// E-MTR-0009. Stability of matter with STAND-INS: N stand-in electrons (charged fear-walk tokens, E-FRC-0176)
// and N fixed stand-in nuclei of charge +1 on the husk, as fermions (one stand-in per orbital) and as bosons
// (all in one orbital). Dyson and Lenard (1967) and Lieb and Thirring (1975) proved that fermions with
// Coulomb forces have a ground-state energy of at least -C N: matter is stable, and it is exclusion that
// makes it so. Bosons with fixed nuclei have no such bound: their energy falls as -N^(5/3) (Lieb, Phys. Lett.
// A 70, 71 (1979)), and with mobile charges as -N^(7/5) (Dyson 1967; Lieb and Solovej 2004). This is the
// sharpest test of why exclusion matters, and the stand-in cannot pass it by construction: it differs
// between the two cases only in how many stand-ins one orbital may hold.
//
// Method, deterministic throughout. The nuclei sit on a cluster of husk docks at spacing s: one dock (N = 1),
// a pair along a husk axis (2), a square (4), a cube (8), and for bosons also the 3 x 3 x 3 and 4 x 4 x 4
// cubes (27, 64), in a periodic 32^3 husk box with a0 = 3. For each N and s the stand-ins' orbitals are made
// self-consistent in the Fermi-Amaldi mean field, whose density is the stand-ins' own scaled by (N - 1) / N:
//   bosons: all N stand-ins in the lowest orbital. The mean-field energy is then EXACTLY the energy of the
//     product state, N <h> + N (N - 1) / 2 J, a variational upper bound on the boson ground state
//   fermions: one stand-in per orbital, and the energy reported is the exact Hartree-Fock energy of the
//     determinant of the N lowest orbitals (every exchange integral computed), an upper bound on the fermion
//     ground state. The determinant takes the first N orbitals in solver order when a level is degenerate
// E_min(N) is the least over the scanned spacings (fermions s = 4, 6, 8, 1.3 to 2.7 a0; bosons s = 1 to 4).
// A falling boson upper bound proves collapse. A linear fermion upper bound shows only that no collapse
// was found: a numerical upper bound cannot prove the Lieb-Thirring lower bound, and this says so.
//
// Gates, fixed before the first run of this file (the sizes were cut from N = 1, 8, 27 before any run, after
// a one-stand-in hydrogen probe and at a machine load near 560):
// 1. FERMIONS ARE EXTENSIVE: the exponent p of |E_min(N)| ~ N^p over N = 1, 2, 4, 8 lies in [0.85, 1.15]
// 2. BOSONS COLLAPSE: the same exponent is at least 1.3 over N = 1, 2, 4, 8 (continuum 5/3)
// 3. THE GAP GROWS WITH N: the boson-to-fermion ratio of E_min / N exceeds 1 at N = 4 and is larger at 8
// 4. CONTROL: at N = 1 the fermion and boson energies agree to 1e-9 (the same one-body problem)
// Pass: all four. Partial: gates 1 and 4 hold and a boson gate fails. Fail: otherwise.
// Reported: every energy, the optimal spacings (a boson optimum at s = 1 is the lattice stopping the
// collapse, not the physics), the boson exponent with N = 27 and 64 included, and the deepest potential
// against the band gap 2 pi / 3.
//
// Depth L2: mean-field quantum mechanics on a lattice with stand-in charges and a chosen coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BAND_TOP, hartreeFockEnergy, makeGrid, makePoisson, selfConsistent, standinUnits, type Nucleus } from '@/code/measure/standin-chemistry'

const SIDE = 32
const A0 = 3
const FERMION_SPACINGS = [4, 6, 8]
const BOSON_SPACINGS = [1, 2, 3, 4]
const FERMION_SIZES = [1, 2, 4, 8]
const BOSON_SIZES = [1, 2, 4, 8, 27, 64]

// the cluster of N nuclei at spacing s, centered in the box
function cluster(n: number, s: number): Nucleus[] {
  const shape: [number, number, number] = n === 1 ? [1, 1, 1] : n === 2 ? [2, 1, 1] : n === 4 ? [2, 2, 1] : [Math.round(Math.cbrt(n)), Math.round(Math.cbrt(n)), Math.round(Math.cbrt(n))]
  const base = shape.map(k => SIDE / 2 - Math.floor(((k - 1) * s) / 2))
  const out: Nucleus[] = []

  for (let z = 0; z < shape[2]; z++) {
    for (let y = 0; y < shape[1]; y++) {
      for (let x = 0; x < shape[0]; x++) {
        out.push({ at: [(base[0] ?? 0) + x * s, (base[1] ?? 0) + y * s, (base[2] ?? 0) + z * s], charge: 1 })
      }
    }
  }

  return out
}

// the least-squares slope of log |E| against log N
function exponent(n: number[], e: number[]): number {
  const x = n.map(Math.log)
  const y = e.map(v => Math.log(Math.abs(v)))
  const mx = x.reduce((a, b) => a + b, 0) / x.length
  const my = y.reduce((a, b) => a + b, 0) / y.length

  return x.reduce((s, xi, i) => s + (xi - mx) * ((y[i] ?? 0) - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0)
}

export default experiment({
  id: 'quantum/standin-stability',
  code: 'E-MTR-0009',
  title:
    'stability of matter with stand-ins: N stand-in electrons and N fixed stand-in nuclei on the husk, as fermions and as bosons, the two differing only in how many stand-ins one orbital holds, read for how the least energy grows with N',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const grid = makeGrid(SIDE)
    const poisson = makePoisson(SIDE)
    const units = standinUnits(A0)
    const metrics: Record<string, number> = {}
    const fermion: { n: number; energy: number; spacing: number }[] = []
    const boson: { n: number; energy: number; spacing: number }[] = []

    let deepest = 0
    let unconverged = 0

    for (const n of FERMION_SIZES) {
      let best = { energy: Number.POSITIVE_INFINITY, spacing: 0 }
      let start: Float64Array[] | undefined

      for (const s of n === 1 ? [0] : FERMION_SPACINGS) {
        const nuclei = cluster(n, s)
        const scf = selfConsistent({ grid, poisson, units, nuclei, electrons: n, capacity: 1, field: 'fermi-amaldi', spare: 2, buffer: 4, start })

        start = scf.block
        unconverged += scf.converged ? 0 : 1
        deepest = Math.min(deepest, scf.deepest)

        const hf = hartreeFockEnergy({ grid, poisson, units, external: scf.external, nuclear: scf.nuclear, orbitals: scf.orbitals.slice(0, n) })

        metrics[`fermionN${n}S${s}Rydberg`] = hf.total / units.rydberg
        metrics[`fermionN${n}S${s}ExchangeRydberg`] = hf.exchange / units.rydberg

        if (hf.total < best.energy) {
          best = { energy: hf.total, spacing: s }
        }
      }

      fermion.push({ n, ...best })
    }

    for (const n of BOSON_SIZES) {
      let best = { energy: Number.POSITIVE_INFINITY, spacing: 0 }
      let start: Float64Array[] | undefined

      for (const s of n === 1 ? [0] : BOSON_SPACINGS) {
        const nuclei = cluster(n, s)
        const scf = selfConsistent({ grid, poisson, units, nuclei, electrons: n, capacity: n, field: 'fermi-amaldi', spare: 2, buffer: 3, start })

        start = scf.block
        unconverged += scf.converged ? 0 : 1
        deepest = Math.min(deepest, scf.deepest)
        metrics[`bosonN${n}S${s}Rydberg`] = scf.energy / units.rydberg

        if (scf.energy < best.energy) {
          best = { energy: scf.energy, spacing: s }
        }
      }

      boson.push({ n, ...best })
    }

    const fermionExponent = exponent(
      fermion.map(f => f.n),
      fermion.map(f => f.energy),
    )
    const small = boson.filter(b => FERMION_SIZES.includes(b.n))
    const bosonExponent = exponent(
      small.map(b => b.n),
      small.map(b => b.energy),
    )
    const bosonExponentAll = exponent(
      boson.map(b => b.n),
      boson.map(b => b.energy),
    )
    const perParticle = (list: typeof fermion, n: number): number => (list.find(x => x.n === n)?.energy ?? Number.NaN) / n
    const ratio = (n: number): number => perParticle(boson, n) / perParticle(fermion, n)
    const control = Math.abs(perParticle(boson, 1) - perParticle(fermion, 1)) / Math.abs(perParticle(fermion, 1))

    fermion.forEach(f => {
      metrics[`fermionMinN${f.n}PerParticleRydberg`] = f.energy / f.n / units.rydberg
      metrics[`fermionMinN${f.n}SpacingOverA0`] = f.spacing / A0
    })
    boson.forEach(b => {
      metrics[`bosonMinN${b.n}PerParticleRydberg`] = b.energy / b.n / units.rydberg
      metrics[`bosonMinN${b.n}SpacingOverA0`] = b.spacing / A0
    })

    const gate1 = fermionExponent >= 0.85 && fermionExponent <= 1.15
    const gate2 = bosonExponent >= 1.3
    const gate3 = ratio(4) > 1 && ratio(8) > ratio(4)
    const gate4 = control < 1e-9
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate4 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `N stand-in fermions with N fixed stand-in nuclei on the husk have a least energy growing as N^${fermionExponent.toFixed(3)} over N = 1 to 8, and N stand-in bosons as N^${bosonExponent.toFixed(3)} (N^${bosonExponentAll.toFixed(3)} to N = 64), the two differing only in how many share an orbital`,
      metrics: {
        ...metrics,
        fermionExponent,
        bosonExponent,
        bosonExponentTo64: bosonExponentAll,
        bosonOverFermionPerParticleN2: ratio(2),
        bosonOverFermionPerParticleN4: ratio(4),
        bosonOverFermionPerParticleN8: ratio(8),
        deepestPotentialOverBandGap: -deepest / BAND_TOP,
        unconvergedRuns: unconverged,
        gateFermionsExtensive: gate1 ? 1 : 0,
        gateBosonsCollapse: gate2 ? 1 : 0,
        gateGapGrows: gate3 ? 1 : 0,
        gateControl: gate4 ? 1 : 0,
      },
      control: { oneParticleFermionAgainstBoson: control },
      notes:
        'L2, stand-ins throughout (charged fear-walk electrons, fixed husk charges, alpha chosen through a0 = 3), band-projected stand-in band. Mean field: Fermi-Amaldi orbitals; bosons are the exact product-state energy (an upper bound), fermions the exact Hartree-Fock energy of the determinant (an upper bound). An upper bound proves boson collapse but cannot prove fermion stability, which is a lower bound. The stand-ins are spinless: one fermion per orbital, not two, so two stand-in fermions do not pair in a bond (E-MTR-0008: the antisymmetric state does not bind). First run, 2026-09-25, status pass. Fermion E_min / N reads -1.553, -1.462, -1.407, -1.325 Ry for N = 1, 2, 4, 8, exponent 0.926, all at the widest spacing scanned (2.67 a0), so the fermion minimum is at or past the scan edge and the stand-in fermions barely bind to each other (spinless: no pairing). Boson E_min / N reads -1.553, -1.835, -2.427, -3.709, -6.18, -7.59 Ry for N = 1 to 64, exponent 1.417 to N = 8 and 1.410 to 64, every optimum at s = 1 husk spacing from N = 4 on: the collapse runs to the lattice spacing and the lattice stops it, so the continuum 5/3 is not reached and N = 27 to 64 is already lattice-limited. Disclosed: 6 of the mean-field runs did not meet the density tolerance in 40 cycles, and one of them, bosons at N = 64 and s = 4, reads +1137 Ry, a failed run rather than an energy; it is not a minimum and changes no gate. The control agrees to 6e-15.',
    })
  },
})
