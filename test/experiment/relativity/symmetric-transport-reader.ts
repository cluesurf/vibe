// A symmetry-adapted reader of the exact periodic husk transport, gated on the isometric hub before it reads the lone
// bounce knit (E-RLT-0086).
//
// THE PROBLEM (E-RLT-0085). The exact periodic transport of the side-4 hub periodic box read charge 4.00 and sound 4.01
// but trace 0.06 and shear -0.26, and the isometric hub, whose point group forces both (E-RLT-0080), read -0.06 and
// -0.82 with the same reader: the periodic box folds 12 staggered invariants onto k = 0 and a content threshold did not separate
// them from the transverse momentum.
//
// THE READER (code/measure/symmetry-transport). The 18 left invariants of the period map in closed form: the 6
// physical ones (charge, energy, four momenta) repeated on every dock, and 12 STAGGERED ones, one per line w of the 24
// minimal vectors of D4* (the three triality frames), e^(i pi w . x) (w . r_d), kept because one beat multiplies them
// by -1. The Bloch effective operator H(k) = (L M(k) V)(L V)^-1 on the exact slow subspace V(k) (subspace iteration)
// has the slow eigenvalues and names every mode by its coordinates on L. Every element of the vacuum's 576-element
// group maps physical invariants to physical ones and staggered to staggered, so H_PP(k), the physical block, is a
// G-covariant 6 x 6 function of k and the forcing theorems of a six-mode medium apply to it as they stand: charge,
// trace and sound through k^4, the shear at leading order. The physical quantities are read from H_PP: charge = the
// mode holding the charge most, sound = the two fastest of the rest, depth = the transverse mode holding the depth
// momentum most, shear = the other two. Beside them the whole 18-mode block gives slowTrace (G-invariant) and
// mixedShear (the two modes of the whole block holding the most shear, which is what an eigenvalue reader that ignores
// the staggered block sees).
//
// THE REPRESENTATION, exact. The characters of the physical (chi_P = 2 + tr R) and staggered (chi_S = the signed count
// of dual lines R keeps) representations of the 576 elements: <chi_P, chi_S> > 0 means symmetry cannot forbid a
// physical-staggered coupling, so the separation must come from the invariants themselves, not from irreducibles.
//
// Gates, fixed before this file ran:
//  U  the uniform medium: the reader's charge, shear and sound at kc / 4 on the first axis equal the 72-index slow
//     modes to 1e-8 relative, and the physical-staggered coupling is below 1e-8
//  I  on both hub media the 18 closed-form left vectors are kept (residual below 1e-9), every 37th group element
//     commutes with M0 (below 1e-12) and its matrix on the invariants is block diagonal (below 1e-8)
//  P  perturbation theory agrees: on the first axis at kc / 16 the physical block's charge and shear Gamma / k^2 from
//     I - i k H1 - k^2 H2 (H1, H2 by the reduced resolvent) equal the Bloch reader's to 5e-2 relative
//  HC the control: on the isometric hub the physical-block exponents of charge, trace and sound are at least 3.5 and
//     the shear 2 +- 0.5
//  HT the candidate: the same on the lone bounce knit's hub
// Verdict: pass if U, I, P, HC and HT hold; fail if U, I, P, HC hold and HT does not; partial otherwise.
//
// PREDICTED before running (from probes, disclosed): HC holds (a four-direction probe of the isometric hub read
// charge 4.00, trace 4.10, sound 4.03, shear 2.03, while mixedShear read -0.27, reproducing E-RLT-0085's failure), and
// the physical-staggered coupling is NOT zero (about 0.05 k^2 against a transverse-staggered splitting of about
// 0.05 k^2): symmetry allows it (<chi_P, chi_S> > 0 predicted from Frobenius reciprocity: the momentum irreducible sits
// inside the staggered representation). NOT predicted: HT.
//
// DISCLOSED: two probes (tmp/sym-probe1.ts, tmp/sym-probe2.ts) measured the invariants, the coupling and four
// directions of the isometric hub before this file was written.
//
// FIRST RUN (884 s): pass, every gate, recorded as is, no gate moved. Title written after the run. U to 4e-11,
// <chi_P, chi_S> = 1 exactly (the momentum irreducible occurs once in the staggered representation), coupling 0.049 to
// 0.077 k^2 on both hubs. CAVEAT, stated plainly: the physical block H_PP is the transport of the physical densities
// with the staggered channel projected out, not six exact eigenvalues of M(k); the exact eigenvalues mix the two
// families at relative size 0.05 / 0.6 in the transverse sector, which is why mixedShear (-0.27, -0.26) reproduces
// E-RLT-0085's failure. slowTrace, a G-invariant function of the whole 18-mode block that needs no naming, reads 4.13
// on both, so the whole slow block is isotropic through k^4 in its trace.
//
// Depth L2. DETERMINISM: exact left invariants, a start block from the k = 0 right invariants, fixed directions
// (the 13 symmetric husk directions and 3 golden ones), no draw. Physics read on the husk: every direction has k4 = 0.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { boxMaps, coinData, orientedHub, orientedHubStore } from '@/code/measure/varying-vacuum'
import { dockMatrices, periodicMedium } from '@/code/measure/bounce-transport'
import { weaveOf } from '@/code/measure/varying-living-battery'
import { familiesOf, invariantsOf, slowModes } from '@/code/measure/store-transport'
import { NAMED, ORIENTED, SPACE } from '@/code/measure/varying-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'
import { matrixOfPermutation } from '@/code/measure/husk-transport-symmetry'
import { bounceLinearization } from '@/code/measure/bounce-linearization'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { weyl } from '@/code/tool/weyl'
import {
  actOn,
  cellOps,
  cellSymmetry,
  commutationDefect,
  effectiveMatrices,
  invariantCharacters,
  leftInvariants,
  leftResidual,
  namedDockInvariants,
  outsideSpan,
  physicalQuantities,
  readSymmetricTransport,
  reduced,
  rightInvariants,
  type SymmetricReading,
} from '@/code/measure/symmetry-transport'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { type PeriodicMedium } from '@/code/measure/bounce-transport'

// E-RLT-0085's crossover (the lone hub's periodic-box average), so both readings sit on the same rungs as E-RLT-0085
const KC = 0.2793069366894861
const RUNGS = [KC / 4, KC / 16]

export default experiment({
  id: 'relativity/symmetric-transport-reader',
  code: 'E-RLT-0086',
  title:
    "a symmetry-adapted reader of the exact periodic husk transport, pass: the side-4 periodic box's 18 slow invariants in closed form (6 physical, 12 staggered e^(i pi w . x)(w . r_d) over the 12 lines of D4*, kept to 1.7e-12), the Bloch effective operator in their coordinates, and the vacuum's 576 elements block diagonal on them (2e-11); the physical block reads the isometric hub at its forced exponents (charge 4.00, trace 4.10, sound 4.03, shear 2.02) and the lone bounce hub at 4.00, 4.10, 4.03, 2.02, where the eigenvalue reader of E-RLT-0085 reads shear -0.27 and -0.26 on the same solves; symmetry does not separate the families (<chi_P, chi_S> = 1) and the medium couples them at 0.05 to 0.08 k^2, so the physical block is the physical densities' transport with the staggered channel projected out; the whole 18-mode trace reads 4.13",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const table = groupTable()
    const coins = coinData(table)
    const mesh = weaveOf(4).mesh
    const named = namedDockInvariants()
    const directions = huskDirections(3)
    const axis = directions[0] as number[]

    // U: the uniform medium
    const uniformLaws = Array.from({ length: 12 }, () => [1 / 3, 1 / 3, 1 / 3] as const)
    const u = [bounceLinearization({ kind: 'lone', background: ORIENTED, mode: 'BP', laws: uniformLaws }), bounceLinearization({ kind: 'lone', background: ORIENTED, mode: 'PB', laws: uniformLaws })]
    const uInvariants = invariantsOf(SPACE, u)
    const uniformMedium = periodicMedium(mesh, Array.from({ length: 256 }, () => u[0]!), Array.from({ length: 256 }, () => u[1]!))
    const uniformOps = cellOps(uniformMedium)
    const uniformLeft = leftInvariants(uniformMedium, named).vectors
    const uniformRight = rightInvariants(uniformOps, uniformLeft)
    const uniformReading = readSymmetricTransport({ medium: uniformMedium, left: uniformLeft, right: uniformRight.vectors, directions: [axis], rungs: [KC / 4, KC / 16] })
    const reference = slowModes(SPACE, u, axis.map(x => (x * KC) / 4), 6, familiesOf(SPACE, NAMED, axis, uInvariants))
    const k4 = (KC / 4) ** 2
    const refCharge = (reference.find(m => m.family === 'charge')?.gamma ?? Number.NaN) / k4
    const refShear = (reference.find(m => m.family === 'shear')?.gamma ?? Number.NaN) / k4
    const refSound = Math.max(...reference.map(m => m.omega)) / (KC / 4)
    const rel = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b)
    const uCharge = uniformReading.values.charge![0]![0] ?? Number.NaN
    const uShear = Math.max(...uniformReading.values.shear![0]!.map(x => rel(x, refShear)))
    const uSound = uniformReading.values.sound![0]![0] ?? Number.NaN
    const uNamedOutside = outsideSpan(named, uInvariants)
    const gateU = rel(uCharge, refCharge) < 1e-8 && uShear < 1e-8 && rel(uSound, refSound) < 1e-8 && uniformReading.couplingPS < 1e-8 && uniformReading.couplingSP < 1e-8 && uNamedOutside < 1e-9

    log('U')

    // the representation, exact
    const hub = orientedHub(coins)
    const matrices = hub.group.map(g => matrixOfPermutation(table.permutations[g] as number[]))
    const characters = invariantCharacters(matrices)
    const box = boxMaps(coins, 4)
    const syms = hub.group.map(g => cellSymmetry(box.linear[g] as Int32Array, table.permutations[g] as number[], matrixOfPermutation(table.permutations[g] as number[])))
    const hubCell = orientedHubStore(coins, 4, [0, 0, 0, 0])
    const probes = [0, 1].map(b => Float64Array.from({ length: 256 * 72 }, (_, i) => weyl(i + 1 + 7919 * b) - 0.5))

    type MediumRead = {
      residual: number
      consistent: boolean
      commutation: number
      blockDiagonal: number
      namedOutside: number
      rightIterations: number
      reading: SymmetricReading
      perturbCharge: number
      perturbShear: number
      blochCharge: number
      blochShear: number
      resolventTerms: number
    }

    const readMedium = (kind: CollisionKind): MediumRead => {
      const docks = dockMatrices({ kind, store: hubCell, cells: 256, permutations: table.permutations })
      const medium: PeriodicMedium = periodicMedium(mesh, docks.even, docks.odd)
      const ops = cellOps(medium)
      const dockInvariants = invariantsOf(SPACE, [...new Set([...docks.even, ...docks.odd])])
      const { vectors: left, consistent } = leftInvariants(medium, named)
      const residual = leftResidual(ops, left)
      let commutation = 0
      let blockDiagonal = 0
      const right = rightInvariants(ops, left)

      for (let i = 0; i < syms.length; i += 37) {
        const g = syms[i]!

        commutation = Math.max(commutation, commutationDefect(ops, g, probes))

        const d = reduced(left, right.vectors, v => actOn(g, v))

        for (let r = 0; r < 18; r++) for (let c = 0; c < 18; c++) if (r < 6 !== c < 6) blockDiagonal = Math.max(blockDiagonal, Math.abs(d[r * 18 + c] as number))
      }

      log(`${kind}: invariants, group`)

      const reading = readSymmetricTransport({ medium, left, right: right.vectors, directions, rungs: RUNGS, log: what => log(`${kind} ${what}`) })

      // P: perturbation theory on the axis at kc / 16
      const e = effectiveMatrices(ops, left, right.vectors, axis)
      const k = KC / 16
      const re = new Float64Array(36)
      const im = new Float64Array(36)

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          re[i * 6 + j] = (i === j ? 1 : 0) - k * k * (e.h2[i * 18 + j] as number)
          im[i * 6 + j] = -k * (e.h1[i * 18 + j] as number)
        }
      }

      const ev = complexEigenvalues({ re, im, n: 6 })
      const modes = ev.re.map((r, i) => {
        const value: [number, number] = [r, ev.im[i] ?? 0]
        const y = complexEigenvector({ re, im, n: 6, value })
        const w = (j: number): number => (y.re[j] ?? 0) ** 2 + (y.im[j] ?? 0) ** 2
        const lr = [0, 1, 2, 3].reduce((s, a) => s + (axis[a] ?? 0) * (y.re[2 + a] ?? 0), 0)
        const li = [0, 1, 2, 3].reduce((s, a) => s + (axis[a] ?? 0) * (y.im[2 + a] ?? 0), 0)
        const longitudinal = lr * lr + li * li
        const momentum = w(2) + w(3) + w(4) + w(5)

        return {
          gamma: -Math.log(Math.hypot(value[0], value[1])) / 2,
          omega: Math.abs(Math.atan2(value[1], value[0])) / 2,
          weights: { charge: w(0), energy: w(1), longitudinal, shear: Math.max(0, momentum - longitudinal - w(5)), depth: w(5), staggered: 0 },
        }
      })
      const pq = physicalQuantities(modes, k)

      return {
        residual,
        consistent,
        commutation,
        blockDiagonal,
        namedOutside: outsideSpan(named, dockInvariants),
        rightIterations: right.iterations,
        reading,
        perturbCharge: pq.charge,
        perturbShear: Math.max(...pq.shear),
        blochCharge: reading.values.charge![1]![0] ?? Number.NaN,
        blochShear: Math.max(...reading.values.shear![1]!.slice(0, 2)),
        resolventTerms: e.terms,
      }
    }

    const iso = readMedium('isometric')

    log('isometric')

    const lone = readMedium('lone')

    log('lone')

    const gateI = [iso, lone].every(m => m.residual < 1e-9 && m.consistent && m.commutation < 1e-12 && m.blockDiagonal < 1e-8 && m.namedOutside < 1e-9)
    const gateP = [iso, lone].every(m => rel(m.perturbCharge, m.blochCharge) < 5e-2 && rel(m.perturbShear, m.blochShear) < 5e-2)
    const forced = (r: SymmetricReading): boolean =>
      (r.exponent.charge ?? 0) >= 3.5 && (r.exponent.trace ?? 0) >= 3.5 && (r.exponent.sound ?? 0) >= 3.5 && Math.abs((r.exponent.shear ?? 0) - 2) <= 0.5 && r.sectorsClean
    const gateHC = forced(iso.reading)
    const gateHT = forced(lone.reading)
    const instruments = gateU && gateI && gateP
    const status = instruments && gateHC ? (gateHT ? 'pass' : 'fail') : 'partial'
    const fmt = (r: SymmetricReading): string => ['charge', 'trace', 'sound', 'shear', 'depth', 'slowTrace', 'mixedShear'].map(q => `${q} ${(r.exponent[q] ?? Number.NaN).toFixed(2)}`).join(', ')
    const numbers = (prefix: string, m: MediumRead): Record<string, number> => ({
      ...Object.fromEntries(Object.entries(m.reading.exponent).map(([q, v]) => [`${prefix}_${q}_exponent`, v])),
      ...Object.fromEntries(Object.entries(m.reading.means).map(([q, v]) => [`${prefix}_${q}_mean`, v])),
      ...Object.fromEntries(Object.entries(m.reading.anisotropy).flatMap(([q, v]) => v.map((x, i) => [`${prefix}_${q}_anisotropy${i}`, x]))),
      [`${prefix}_couplingPS`]: m.reading.couplingPS,
      [`${prefix}_couplingSP`]: m.reading.couplingSP,
      [`${prefix}_leftResidual`]: m.residual,
      [`${prefix}_commutation`]: m.commutation,
      [`${prefix}_blockDiagonal`]: m.blockDiagonal,
      [`${prefix}_iterations`]: m.reading.iterations,
      [`${prefix}_worstChange`]: m.reading.worstChange,
      [`${prefix}_perturbCharge`]: m.perturbCharge,
      [`${prefix}_blochCharge`]: m.blochCharge,
      [`${prefix}_perturbShear`]: m.perturbShear,
      [`${prefix}_blochShear`]: m.blochShear,
    })

    return verdict({
      status: status as 'pass' | 'fail' | 'partial',
      claim: `the symmetry-adapted reader ${gateHC ? 'reads' : 'does not read'} the isometric hub at its forced exponents (${fmt(iso.reading)}) and reads the lone bounce knit's hub at ${fmt(lone.reading)}; the physical-staggered coupling is ${lone.reading.couplingPS.toExponential(2)} k^2 and symmetry allows it (<chi_P, chi_S> = ${characters.physicalStaggered})`,
      metrics: {
        gateU: gateU ? 1 : 0,
        gateI: gateI ? 1 : 0,
        gateP: gateP ? 1 : 0,
        gateHC: gateHC ? 1 : 0,
        gateHT: gateHT ? 1 : 0,
        uniformChargeRelative: rel(uCharge, refCharge),
        uniformShearRelative: uShear,
        uniformSoundRelative: rel(uSound, refSound),
        uniformCoupling: Math.max(uniformReading.couplingPS, uniformReading.couplingSP),
        characterPhysicalStaggered: characters.physicalStaggered,
        characterMomentumStaggered: characters.momentumStaggered,
        characterStaggeredSquare: characters.staggeredSquare,
        characterPhysicalSquare: characters.physicalSquare,
        groupOrder: hub.group.length,
        ...numbers('isometric', iso),
        ...numbers('lone', lone),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        isometricMixedShearExponent: iso.reading.exponent.mixedShear ?? Number.NaN,
        loneMixedShearExponent: lone.reading.exponent.mixedShear ?? Number.NaN,
      },
      notes: `L2. Gates: U ${gateU}, I ${gateI}, P ${gateP}, HC ${gateHC}, HT ${gateHT}. Uniform: charge ${uCharge} against the 72-index ${refCharge}, sound ${uSound} against ${refSound}, shear worst relative ${uShear.toExponential(2)}, coupling ${Math.max(uniformReading.couplingPS, uniformReading.couplingSP).toExponential(2)}. Characters over the ${hub.group.length} elements: <chi_P, chi_S> ${characters.physicalStaggered}, <chi_V, chi_S> ${characters.momentumStaggered}, <chi_S, chi_S> ${characters.staggeredSquare}, <chi_P, chi_P> ${characters.physicalSquare}. Isometric hub: ${fmt(iso.reading)}, anisotropy ${JSON.stringify(iso.reading.anisotropy)}, means ${JSON.stringify(iso.reading.means)}, coupling PS ${iso.reading.couplingPS.toExponential(3)} SP ${iso.reading.couplingSP.toExponential(3)} (per k^2), left residual ${iso.residual.toExponential(2)}, commutation ${iso.commutation.toExponential(2)}, block diagonal ${iso.blockDiagonal.toExponential(2)}, perturbation charge ${iso.perturbCharge} against ${iso.blochCharge}, shear ${iso.perturbShear} against ${iso.blochShear} (resolvent ${iso.resolventTerms} terms). Lone bounce hub: ${fmt(lone.reading)}, anisotropy ${JSON.stringify(lone.reading.anisotropy)}, means ${JSON.stringify(lone.reading.means)}, coupling PS ${lone.reading.couplingPS.toExponential(3)} SP ${lone.reading.couplingSP.toExponential(3)}, left residual ${lone.residual.toExponential(2)}, commutation ${lone.commutation.toExponential(2)}, block diagonal ${lone.blockDiagonal.toExponential(2)}, perturbation charge ${lone.perturbCharge} against ${lone.blochCharge}, shear ${lone.perturbShear} against ${lone.blochShear}. Sectors clean: isometric ${iso.reading.sectorsClean}, lone ${lone.reading.sectorsClean}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
