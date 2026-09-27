// Do the links hold the bosons? The thermal spectrum of the link field on the flat husk, against Planck.
//
// THE HYPOTHESIS (the coordinator's, 2026-09-26): Bose-Einstein never arose in E-SPN-0048 and 0050 because
// those excitations live in slots, and a slot holds one trit, so it is exclusive. A link's flux is an
// unbounded integer history (E-FRC-0175) whose modes can hold any occupation, so the force quanta should be
// bosons: at equilibrium the husk photon modes should follow Bose-Einstein and the energy per mode Planck's
// law, epsilon(omega) = omega / (e^(omega / T) - 1) (the ledger's blackbody_planck_spectrum row), with
// Maxwell-Boltzmann and Fermi-Dirac as controls. If so, matter (slots, exclusive) and force (links,
// histories) would split as fermions and bosons.
//
// WHAT WAS EXPECTED, from the construction, before any run: the link sector is a classical field. Its
// equilibrium, if it reaches one, is the Gibbs measure of H = sum E^2 / 2 + (kappa / 2) sum B^2, which gives
// every transverse mode T / 2 in its electric part and T / 2 in its magnetic part, whatever its frequency:
// Rayleigh-Jeans, the classical limit of Bose-Einstein, with no quantum of action to cut off the high
// frequencies. The integer flux is a quantum of E on each link, not of a mode's energy, and the mode's
// energy is a sum over many links, so it should not bend the spectrum until T is far below one flux unit.
//
// THE SET-UP (code/measure/link-spectrum). A STAND-IN, labeled so: the husk is the flat cubic torus of side 8
// (512 docks, 1,536 links, three squares per dock: the flat 3D space of the horosphere, whose transverse
// branches are the two photon branches of E-FRC-0179's husk, without its massive ones), the U(1) link sector
// of code/rule/photon-links in its DEMON form (exact integer energy, each move paid by its link's demon), and
// the demons stand in for the cold vacuum's stores (both are integer kinetic stores; a coupling of the link
// sector to the vibe gas's stores is not built). No vibes, so Gauss's law makes E transverse. The linear
// leapfrog of E-FRC-0179 and the carried remainder of E-FRC-0181 have no bath and are linear to a
// remainder, so their modes do not exchange energy; the demon form is the one that can equilibrate.
// Z_N with N = 256, kappa = 2 pi K / N at 1/3 and at 1 (omega_max = sqrt(12 kappa) = 2 and 3.46), and
// omega(k) = sqrt(kappa lambda(k)), lambda(k) = 4 sum sin^2(k_i / 2), the Hamiltonian frequency. Starts:
// demons filled by the golden sequence to a top of 1 or 8 (half units), angles by the golden sequence within
// +-1 (a probe found that from all-zero angles the link reflections never move an angle, so the magnetic
// sector must be seeded). 4,000 beats; beats 2,000 to 4,000 read every 10th. T is read off the demons: ln of
// the count of each demon energy against the energy is a line of slope -1 / (2 T) (half units).
//
// Gates, fixed before the first run of this file (a probe, tmp/hidden-link-probe.ts, had run the kappa = 1/3
// cases and seen a flat spectrum):
//   G1 the rule: the integer energy is the same at the start and every sampled beat, Gauss's law has 0
//      violations, in every run.
//   G2 the bath: the demon histogram is Boltzmann, R^2 >= 0.99 over the energies with at least 50 counts.
//   G3 THE HYPOTHESIS: in every run and every omega bin (8 bins to omega_max, bins with a mode), the energy
//      per polarization over T is within 10 percent of Planck's (omega / T) / (e^(omega / T) - 1).
//      PREDICTED TO FAIL.
//   G4 the classical alternative, Rayleigh-Jeans: in every run and bin the energy per polarization over T is
//      within 10 percent of 1, and the electric part alone within 10 percent of 1/2.
//   G5 the mode statistics: the energy of a mode k (both polarizations, electric and magnetic) has relative
//      variance var / mean^2 within 0.05 of 1/4 in the top bin of each run, averaged over the modes with
//      k != -k (the classical Gibbs measure: two polarizations, each a complex electric and a complex
//      magnetic amplitude, eight independent Gaussian coordinates, chi-square with 8 degrees of freedom).
//      Bose-Einstein occupations, one geometric count per polarization, would give (1 + 1/n) / 2 there, n
//      the Planck occupation (reported).
// Reported: per bin, the energy over T with the Planck, Maxwell-Boltzmann (omega / T) e^(-omega / T) and
// Fermi-Dirac (omega / T) / (e^(omega / T) + 1) predictions, and each law's worst relative miss.
//
// Depth L2: the equilibrium statistics of the model's own link sector, read on the flat husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { emptyPhotonState, fillHashedDemons, makePhotonRule, photonBeatInPlace, photonGaussViolations, photonLatticeCubic, photonLevelEnergy, setHashedAngles } from '@/code/rule/photon-links'
import { demonTemperature, modeEnergies, torusModes } from '@/code/measure/link-spectrum'

const SIDE = 8
const N = 256
const BEATS = 4000
const READ_FROM = 2000
const EVERY = 10
const BINS = 8
const CASES = [
  { kappa: 1 / 3, top: 1 },
  { kappa: 1 / 3, top: 8 },
  { kappa: 1, top: 1 },
  { kappa: 1, top: 8 },
]

type Bin = { omega: number; modes: number; electric: number; magnetic: number; relativeVariance: number }
type Run = { kappa: number; top: number; t: number; r2: number; energyExact: boolean; gauss: number; bins: Bin[] }

const planck = (x: number): number => x / Math.expm1(x)
const boltzmann = (x: number): number => x * Math.exp(-x)
const fermi = (x: number): number => x / (Math.exp(x) + 1)

function run(kappa: number, top: number): Run {
  const lattice = photonLatticeCubic({ side: SIDE })
  const rule = makePhotonRule({ lattice, mode: 'demon', n: N, k: (kappa * N) / (2 * Math.PI), capacity: 4 * top + 64, hop: false })
  const s = emptyPhotonState(rule)

  fillHashedDemons(s, top, 1.37)
  setHashedAngles(rule, s, 1, 2.71)

  const e0 = photonLevelEnergy(rule, s)
  const { lambda } = torusModes(SIDE)
  const modes = lambda.length
  const sum = new Float64Array(modes)
  const square = new Float64Array(modes)
  const sumE = new Float64Array(modes)
  const sumB = new Float64Array(modes)
  const hist = new Float64Array(4 * top + 65)
  let samples = 0
  let energyExact = true
  let gauss = 0

  for (let t = 0; t < BEATS; t++) {
    photonBeatInPlace(rule, s, t)

    if (t + 1 > READ_FROM && (t + 1) % EVERY === 0) {
      const m = modeEnergies(rule, s, SIDE)

      for (let i = 0; i < modes; i++) {
        const e = m.electric[i] ?? 0
        const b = m.magnetic[i] ?? 0
        const both = 2 * (e + b)

        sumE[i] = (sumE[i] ?? 0) + e
        sumB[i] = (sumB[i] ?? 0) + b
        sum[i] = (sum[i] ?? 0) + both
        square[i] = (square[i] ?? 0) + both * both
      }

      s.demon.forEach(d => {
        hist[d] = (hist[d] ?? 0) + 1
      })
      samples++
      energyExact = energyExact && photonLevelEnergy(rule, s) === e0
      gauss += photonGaussViolations(rule, s)
    }
  }

  const temp = demonTemperature(hist, 50)
  const omegaMax = Math.sqrt(12 * kappa)
  const acc = Array.from({ length: BINS }, () => ({ e: 0, b: 0, rv: 0, n: 0, generic: 0 }))
  const { n: waves } = torusModes(SIDE)

  lambda.forEach((l, i) => {
    const w = Math.sqrt(kappa * l)
    const k = Math.min(BINS - 1, Math.floor((w / omegaMax) * BINS))
    const a = acc[k]!
    const mean = (sum[i] ?? 0) / samples
    // k = -k on the torus when every component is 0 or L / 2
    const selfConjugate = (waves[i] ?? []).every(x => x === 0 || 2 * x === SIDE)

    a.e += (sumE[i] ?? 0) / samples
    a.b += (sumB[i] ?? 0) / samples
    a.n++

    if (!selfConjugate) {
      a.rv += ((square[i] ?? 0) / samples - mean * mean) / (mean * mean)
      a.generic++
    }
  })

  return {
    kappa,
    top,
    t: 1 / temp.beta,
    r2: temp.r2,
    energyExact,
    gauss,
    bins: acc.map((a, k) => ({
      omega: ((k + 0.5) / BINS) * omegaMax,
      modes: a.n,
      electric: a.n > 0 ? a.e / a.n : Number.NaN,
      magnetic: a.n > 0 ? a.b / a.n : Number.NaN,
      relativeVariance: a.generic > 0 ? a.rv / a.generic : Number.NaN,
    })),
  }
}

export default experiment({
  id: 'spin/link-thermal-spectrum',
  code: 'E-SPN-0058',
  title:
    'the link field at equilibrium with its stores on the flat husk is a classical field, not a Bose gas, fail as the hypothesis was gated: every photon mode holds T / 2 electric and T / 2 magnetic energy whatever its frequency (Rayleigh-Jeans, the classical limit of Bose-Einstein, within 7 percent from omega / T = 0.23 to 3.46, where Planck\'s law would give 0.11 of it), so the links carry unbounded occupations but no quantum of action',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const runs = CASES.map(c => run(c.kappa, c.top))
    const filled = (r: Run): Bin[] => r.bins.filter(b => b.modes > 0)
    const perPolarization = (b: Bin, t: number): number => (b.electric + b.magnetic) / t
    const miss = (law: (x: number) => number): number =>
      Math.max(...runs.flatMap(r => filled(r).map(b => Math.abs(perPolarization(b, r.t) / law(b.omega / r.t) - 1))))

    const g1 = runs.every(r => r.energyExact && r.gauss === 0)
    const g2 = runs.every(r => r.r2 >= 0.99)
    const g3 = runs.every(r => filled(r).every(b => Math.abs(perPolarization(b, r.t) / planck(b.omega / r.t) - 1) <= 0.1))
    const g4 = runs.every(r => filled(r).every(b => Math.abs(perPolarization(b, r.t) - 1) <= 0.1 && Math.abs(b.electric / r.t - 0.5) <= 0.05))
    const g5 = runs.every(r => {
      const b = filled(r)[filled(r).length - 1]

      return b !== undefined && Math.abs(b.relativeVariance - 0.25) <= 0.05
    })
    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5 }
    const rest = g1 && g2 && g4 && g5
    const status = rest && g3 ? 'pass' : 'fail'
    const metrics: Record<string, number> = {}

    runs.forEach(r => {
      const tag = `kappa${r.kappa === 1 ? '1' : '1over3'}top${r.top}`

      metrics[`${tag}_temperature`] = Number(r.t.toPrecision(5))
      metrics[`${tag}_demonR2`] = Number(r.r2.toPrecision(6))
      metrics[`${tag}_energyExact`] = r.energyExact ? 1 : 0
      metrics[`${tag}_gaussViolations`] = r.gauss
      filled(r).forEach(b => {
        const x = b.omega / r.t
        const k = r.bins.indexOf(b)

        metrics[`${tag}_bin${k}_omegaOverT`] = Number(x.toPrecision(4))
        metrics[`${tag}_bin${k}_energyOverT`] = Number(perPolarization(b, r.t).toPrecision(5))
        metrics[`${tag}_bin${k}_electricOverT`] = Number((b.electric / r.t).toPrecision(5))
        metrics[`${tag}_bin${k}_magneticOverT`] = Number((b.magnetic / r.t).toPrecision(5))
        metrics[`${tag}_bin${k}_planck`] = Number(planck(x).toPrecision(5))
        metrics[`${tag}_bin${k}_relativeVariance`] = Number(b.relativeVariance.toPrecision(4))
      })
    })

    return verdict({
      status,
      claim:
        'on the flat husk torus the link field in equilibrium with its own integer stores holds T / 2 electric and T / 2 magnetic energy in every photon mode at every frequency, omega / T from 0.23 to 3.46, with the classical mode statistics (relative variance 1/4, chi-square with 8 degrees): Rayleigh-Jeans within 7 percent, Planck missed by up to a factor of 9, Maxwell-Boltzmann and Fermi-Dirac likewise; the links carry unbounded occupations, the classical limit of Bose-Einstein, with no quantum of action, so the matter / force split is exclusive slots against a classical field, not fermions against bosons',
      metrics: {
        ...metrics,
        worstMissPlanck: Number(miss(planck).toPrecision(4)),
        worstMissRayleighJeans: Number(miss(() => 1).toPrecision(4)),
        worstMissMaxwellBoltzmann: Number(miss(boltzmann).toPrecision(4)),
        worstMissFermiDirac: Number(miss(fermi).toPrecision(4)),
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2. FIRST RUN (2026-09-26, 16 s): G1, G4, G5 pass, G2 and G3 fail, status fail. G3, the hypothesis, fails as predicted: the energy per polarization over T is 0.94 to 1.07 in every bin of every run (worst miss from Rayleigh-Jeans 0.069) while Planck\'s law asks for 0.11 to 0.89 (worst relative miss 8.3, Maxwell-Boltzmann 8.6, Fermi-Dirac 8.9); the electric half is 0.48 to 0.51 of T and the magnetic 0.46 to 0.57 (the magnetic level is a rounded cosine, above T / 2 by up to 14 percent at the coldest run); each mode\'s energy has relative variance 0.22 to 0.27 against the classical 1/4. G2 fails on one run: at kappa = 1 and demon top 1 the demon histogram is Boltzmann only to R^2 = 0.976 (the others 0.9988 to 0.9999), so that run\'s T is the least certain, but its electric half, which is a thermometer of its own, reads 0.48 to 0.50 of it. G5 was corrected before this file first ran (from 1/2 to 1/4, since a mode k carries two polarizations with complex electric and magnetic amplitudes, eight Gaussian coordinates); the probe that preceded it had run the kappa = 1/3 cases and seen the flat spectrum. WHY NOT PLANCK: the flux is an integer on each link, but a mode\'s energy is a quadratic form over many links, so the integer lattice of states is fine-grained on the scale of T here and the Gibbs measure is the classical one; nothing in the rule sets an energy omega per quantum of a mode. The occupations are unbounded, as the hypothesis said, but that makes the links a classical field, whose equilibrium is the classical (Rayleigh-Jeans) limit of Bose-Einstein. A second finding: from all-zero angles the link reflections never move an angle (reflecting 0 through a plaquette whose B is 0 gives 0), so the magnetic sector of this form must be seeded to thermalize.',
    })
  },
})
