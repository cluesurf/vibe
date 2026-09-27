// E-MTR-0019. The H2 molecule with STAND-IN electrons that carry the doublet label, the exchange sector supplied by
// the exclusion rule of E-MTR-0018 rather than by hand. A redo of E-MTR-0008 at a0 = 8, where E-MTR-0007's
// follow-up put stand-in H2+ within 1.2 percent of the continuum.
//
// E-MTR-0008 found the H2 bond with two stand-ins, but imposed antisymmetry by hand and had no two-valued label: the
// model's role is three-valued (E-MTR-0012). E-SPN-0066 makes a moving token's label the doublet, and E-MTR-0018
// measured what the slot keeps for two moving doublet tokens: read with each label component its own slot and the
// label turned by the motion through every husk axis, every antisymmetric state is kept and the only symmetric states
// kept are the ones that never meet (read with one vibe per slot whatever its label, the model's own reading, the
// slot also removes antisymmetric states at contact; that difference is a contact term, and is reported here as the
// ground state's chance of contact).
//
// Method (code/measure/doublet-chemistry). At each separation R, the K = 8 lowest one-body orbitals of the husk
// stand-in in the field of two fixed stand-in nuclei (code/measure/standin-chemistry, a0 = 8 husk spacings, the
// periodic 64^3 husk box), every two-body integral exact on the lattice, a two-valued label on each electron: the
// (2K)^2 = 256 two-electron states. The KEPT states are the null space of the exclusion in every frame: no amplitude
// on two electrons at one dock in one label state, for each label state of the frames the motion turns it through.
// No antisymmetrizer is applied. The label-blind Hamiltonian is diagonalized on the kept space, and each level read
// for its exchange sign and its label spin.
//
// Continuum references: H2 X 1Sigma_g+ R_e = 1.4011 a0, D_e = 0.34895 Ry (Kolos and Wolniewicz 1968); the b
// 3Sigma_u+ triplet is repulsive at every chemical separation.
//
// PREDICTIONS, written before the run: the kept space holds the whole antisymmetric sector (120 of 120 states for K
// = 8) plus the 28 states with the label a singlet and the orbital pair antisymmetric (they never meet, so no
// exclusion can see them); so the lowest level is the label singlet with a symmetric orbital pair, alone, and the
// lowest level with an antisymmetric orbital pair is fourfold (the triplet's three and the never-meeting singlet).
//
// Gates, fixed before the first run (K = 8, a0 = 8, R = 8 to 20 husk spacings, 1.0 to 2.5 a0):
// G1 THE SECTOR: at every R the kept space holds all 120 antisymmetric states, and its symmetric part is only the
//    never-meeting label singlets (28)
// G2 THE SINGLET BINDS: the kept ground state has an interior minimum below 2 E_H, and at the minimum it is a single
//    level (the next level at least 1e-6 Ry above), exchange-antisymmetric, label spin 0
// G3 THE TRIPLET DOES NOT: the lowest kept level with label spin 1 lies above 2 E_H at every R
// G4 WHERE AND HOW DEEP: R_e within 10 percent of 1.4011 a0 and D_e within 15 percent of 0.34895 Ry
// Pass: all four. Partial: G1 to G3 hold and G4 fails. Fail: otherwise.
// Reported: the multiplicity of the lowest level with an antisymmetric orbital pair, the form's gap (largest kept
// eigenvalue of the exclusion form against the smallest removed), the ground state's contact chance, the lattice
// residuals, and E-MTR-0008's a0 = 4 numbers beside these.
//
// Depth L2: exact two-body quantum mechanics on a lattice with stand-in charges, a chosen coupling and a label taken
// from E-SPN-0066, with the exchange sector read from an exclusion rule, not imposed.
//
// DISCLOSED: before the first run, an unregistered probe (tmp/bind-h2-probe.ts, R = 11 only, timings and sector
// counts) found the kept space 148 = 120 + 28 and showed that the first spectrum routine, diagonalizing the whole kept
// space at once, mixed the exchange sectors inside the degenerate fourfold level (<X> = 0.318); the spectrum is now
// taken one exchange sector at a time. No energy was read against a gate before the run.
// The first run, recorded as it came out (2,414.8 s, tmp/mtr0019.log): partial, G4 failing on the depth alone. At
// every R the kept space is all 120 antisymmetric states plus the 28 never-meeting label singlets (G1). The ground
// state is a single level, exchange -1 to 1e-12, label spin 0 (G2), bound with an interior minimum. The lowest label
// triplet lies 0.17 to 0.66 Ry above two atoms at every R (G3). R_e = 1.454 a0 (3.8 percent long), D_e = 0.2920 Ry
// (16.3 percent shallow, gate 15 percent): a K = 8 basis underbinds. The lowest level with an antisymmetric orbital
// pair is fourfold as predicted: the triplet's three and one never-meeting label singlet, a bosonic state the
// exclusion cannot see, degenerate with the triplet. The ground state's chance of contact is 6.6e-5 at R_e.

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
  type Nucleus,
  type Point,
} from '@/code/measure/standin-chemistry'
import { contactChance, keptSpectrum, keptTwoBody, labeledHamiltonian, parabolaMinimum, productOverlaps, type Level } from '@/code/measure/doublet-chemistry'

const SIDE = 64
const CENTER = SIDE / 2
const A0 = 8
const BASIS = 8
const SEPARATIONS = [8, 10, 11, 12, 13, 14, 16, 20]
const REFERENCE_RE = 1.4011
const REFERENCE_DE = 0.34895
const RE_TOLERANCE = 0.1
const DE_TOLERANCE = 0.15
const DEGENERATE = 1e-6

export default experiment({
  id: 'matter/doublet-h2',
  code: 'E-MTR-0019',
  title:
    'H2 with stand-in electrons that carry the doublet label, at a0 = 8: the exchange sector read from the exclusion rule of E-MTR-0018 (no antisymmetrizer), the singlet bond and the repulsive triplet against Kolos and Wolniewicz',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const grid = makeGrid(SIDE)
    const poisson = makePoisson(SIDE)
    const units = standinUnits(A0)
    const center: Point = [CENTER, CENTER, CENTER]
    const hydrogen = lowestStates({ grid, potential: externalPotential({ grid, units, nuclei: [{ at: center, charge: 1 }] }), count: 1, extra: 3, tolerance: 1e-7, maxIterations: 400 }).values[0] ?? Number.NaN
    const metrics: Record<string, number> = {}
    const ground: number[] = []
    const triplet: number[] = []

    let sectorOk = true
    let groundSingle = true
    let groundAntisymmetric = true
    let groundSinglet = true
    let tripletAbove = true
    let antisymmetricOrbitalMultiplicity = 0
    let worstFormGap = Infinity
    let contact = Number.NaN
    let start: Float64Array[] | undefined

    for (const m of SEPARATIONS) {
      const t0 = Date.now()
      const shift = Math.floor(m / 2)
      const nuclei: Nucleus[] = [
        { at: [CENTER - shift, CENTER, CENTER], charge: 1 },
        { at: [CENTER - shift + m, CENTER, CENTER], charge: 1 },
      ]
      const states = lowestStates({ grid, potential: externalPotential({ grid, units, nuclei }), count: BASIS, extra: 6, start, tolerance: 1e-6, maxIterations: 400 })

      start = states.vectors

      const orbitals = states.vectors.slice(0, BASIS)
      const integrals = pairIntegrals(poisson, orbitals, units.kappa)
      const overlaps = productOverlaps(orbitals)
      const kept = keptTwoBody({ k: BASIS, overlaps })
      const levels = keptSpectrum({ k: BASIS, kept, hamiltonian: labeledHamiltonian({ k: BASIS, oneBody: states.values.slice(0, BASIS), integrals }) })
      const repulsion = nuclearRepulsion(units, nuclei)
      const first = levels[0] as Level
      const second = levels[1] as Level
      const lowestTriplet = levels.find(l => Math.abs(l.spin - 1) < 1e-3)
      // the lowest level whose orbital pair is antisymmetric: exchange -1 with spin 1, or exchange +1 with spin 0
      const orbitalOdd = levels.filter(l => (l.exchange < 0 && l.spin > 0.5) || (l.exchange > 0 && l.spin < 0.5))
      const oddFloor = orbitalOdd[0]?.energy ?? Number.NaN
      const oddMultiplicity = orbitalOdd.filter(l => Math.abs(l.energy - oddFloor) < 1e-7 * Math.abs(oddFloor)).length
      const keptValues = kept.formValues.slice(0, kept.basis.length)
      const removedValues = kept.formValues.slice(kept.basis.length)
      const formGap = Math.min(...removedValues) / Math.max(1e-300, Math.max(...keptValues.map(Math.abs)))

      sectorOk = sectorOk && kept.antisymmetricKept === kept.antisymmetricDimension && kept.symmetricKept === (BASIS * (BASIS - 1)) / 2
      worstFormGap = Math.min(worstFormGap, formGap)
      ground.push(first.energy + repulsion)
      triplet.push((lowestTriplet?.energy ?? Number.NaN) + repulsion)
      tripletAbove = tripletAbove && (lowestTriplet?.energy ?? Number.NEGATIVE_INFINITY) + repulsion > 2 * hydrogen

      const key = `r${(m / A0).toFixed(3)}`

      metrics[`${key}GroundRydberg`] = (first.energy + repulsion - 2 * hydrogen) / units.rydberg
      metrics[`${key}TripletRydberg`] = ((lowestTriplet?.energy ?? Number.NaN) + repulsion - 2 * hydrogen) / units.rydberg
      metrics[`${key}GroundExchange`] = first.exchange
      metrics[`${key}GroundSpin`] = first.spin
      metrics[`${key}GapToNextRydberg`] = (second.energy - first.energy) / units.rydberg
      metrics[`${key}KeptDimension`] = kept.basis.length
      metrics[`${key}KeptAntisymmetric`] = kept.antisymmetricKept
      metrics[`${key}KeptSymmetric`] = kept.symmetricKept
      metrics[`${key}OrbitalOddMultiplicity`] = oddMultiplicity
      metrics[`${key}FormGap`] = formGap
      metrics[`${key}WorstOrbitalResidual`] = Math.max(...states.residuals)
      metrics[`${key}GroundContactChance`] = contactChance({ k: BASIS, vector: first.vector, overlaps })
      metrics[`${key}Seconds`] = (Date.now() - t0) / 1000
      antisymmetricOrbitalMultiplicity = Math.max(antisymmetricOrbitalMultiplicity, oddMultiplicity)
    }

    const r = SEPARATIONS.map(m => m / A0)
    const bond = parabolaMinimum(r, ground)
    const de = (2 * hydrogen - bond.energy) / units.rydberg
    const nearest = r.reduce((best, x, i) => (Math.abs(x - bond.r) < Math.abs((r[best] ?? 0) - bond.r) ? i : best), 0)

    // the ground state at the sampled separation nearest the minimum
    groundSingle = (metrics[`r${(r[nearest] ?? 0).toFixed(3)}GapToNextRydberg`] ?? 0) * units.rydberg > DEGENERATE * units.rydberg
    groundAntisymmetric = (metrics[`r${(r[nearest] ?? 0).toFixed(3)}GroundExchange`] ?? 0) < -0.99
    groundSinglet = Math.abs(metrics[`r${(r[nearest] ?? 0).toFixed(3)}GroundSpin`] ?? 1) < 1e-3
    contact = metrics[`r${(r[nearest] ?? 0).toFixed(3)}GroundContactChance`] ?? Number.NaN

    const g1 = sectorOk
    const g2 = bond.interior && de > 0 && groundSingle && groundAntisymmetric && groundSinglet
    const g3 = tripletAbove
    const g4 = Math.abs(bond.r / REFERENCE_RE - 1) < RE_TOLERANCE && Math.abs(de / REFERENCE_DE - 1) < DE_TOLERANCE
    const status = g1 && g2 && g3 && g4 ? 'pass' : g1 && g2 && g3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `two stand-in electrons with the doublet label, sector read from the exclusion in every frame (${g1 ? 'all 120 antisymmetric states kept and only the 28 never-meeting symmetric ones' : 'NOT the predicted sector'}): the kept ground state is ${g2 ? 'a single antisymmetric label-singlet level that binds' : 'NOT a single binding antisymmetric singlet'}, at ${bond.r.toFixed(3)} a0 with depth ${de.toFixed(4)} Ry (continuum 1.401 a0, 0.3490 Ry; E-MTR-0008 at a0 = 4: 1.076, 0.406), the triplet ${g3 ? 'lies above two atoms at every separation' : 'binds somewhere'}, and the lowest level with an antisymmetric orbital pair is ${antisymmetricOrbitalMultiplicity}-fold`,
      metrics: {
        ...metrics,
        hydrogenOverRydberg: hydrogen / units.rydberg,
        bondLengthOverA0: bond.r,
        depthOverRydberg: de,
        bondLengthError: bond.r / REFERENCE_RE - 1,
        depthError: de / REFERENCE_DE - 1,
        orbitalOddMultiplicity: antisymmetricOrbitalMultiplicity,
        worstFormGap,
        groundContactChanceNearBond: contact,
        gateSector: g1 ? 1 : 0,
        gateSingletBinds: g2 ? 1 : 0,
        gateTripletDoesNot: g3 ? 1 : 0,
        gateBondValues: g4 ? 1 : 0,
      },
      control: {
        tripletAboveTwoAtomsAtEveryR: g3 ? 1 : 0,
        e0008BondLengthA0Four: 1.076,
        e0008DepthA0Four: 0.406,
      },
      notes:
        'L2, stand-ins throughout (the husk stand-in electron of code/measure/standin-chemistry, fixed husk charges for nuclei, alpha chosen through a0 = 8 husk spacings, a two-valued label from E-SPN-0066). The exchange sector is the null space of the exclusion form, not an antisymmetrizer. The exclusion is the component reading of E-MTR-0018 turned through the frames (the reading under which that experiment found Pauli\'s sign); the model\'s own slot reading also removes antisymmetric states at contact, which a K = 8 orbital basis cannot represent (any amplitude at contact is spread over every product of orbitals), so its size is reported as the ground state\'s chance of contact, and the energy it costs is not computed. The K = 8 basis underbinds.',
    })
  },
})
