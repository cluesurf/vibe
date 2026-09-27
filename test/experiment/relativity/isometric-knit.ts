// A knit whose symmetry is W(F4) by construction, and what it keeps (E-RLT-0061).
//
// THE QUESTION. E-RLT-0058 found that a knit whose symmetry is W(F4) gets husk diffusion and sound isotropic
// through k^4 and the husk shear to k^2, and E-RLT-0059 that the committed and combined knits, with only
// {I, -I}, are anisotropic at leading order. Is there a knit with W(F4) as its exact symmetry, and what does
// it keep: reversal, charge, count (energy), momentum, every direction touched, CPT, exact local color?
//
// WHAT THE THEOREMS ALLOW, worked out before building. A collision that is a function of W(F4)-invariant data
// is exactly a bijection C with C g = g C for every coin map g. Such a C touches every direction as soon as it
// touches one (W(F4) is transitive on the 24 slots). Take C coin-map valued, C(x) = w(x) x: then charge and
// count are kept, and C commutes with g exactly when w(g x) = g w(x) g^-1. Momentum is kept exactly when w(x)
// fixes P(x), so w(x) lies in the stabilizer of P, which by Steinberg's theorem is the Weyl group of the F4
// roots orthogonal to P. The one element of that group every coin map carries to its counterpart is -1 on
// the span of those roots and +1 on its complement, when the group holds it: the isometric knit
// (code/rule/isometric-knit). It keeps P, so the same w applies again: it is an involution, exactly
// reversible. A coin map commutes with charge conjugation C_c, and C = C^-1, so C_c C C_c = C^-1: CPT, and C and
// PT separately. E-RLT-0048 to 0050 do not forbid it: they close schedules of the couple architecture (lines
// paired into couples), and this collision reads all 24 slots at once and has period one. E-RLT-0051 closes
// exact local color: a knit whose period group acts irreducibly keeps P and every image of the side sum D, and
// under all of W(F4) that span is all 12 line momenta, so a W(F4) knit with exact color may never move a line
// momentum. The isometric knit moves them, so it gives exact local color up (E-RLT-0063 builds the
// color-exact variant and measures what freezing all 12 costs). The orbit knit of E-RLT-0048 differs in every
// respect that matters here: a 24-beat schedule of couple beats conjugated by one glide, an irreducible glide
// group of order 24 that forces rank 2 only, and no CPT partner; this knit has period one, the full 1,152, CPT.
//
// THE MEASUREMENT. The collision depends on the dock only through its twelve line momenta, so its linearized
// collision at the uniform background is an exact sum over the 3^12 line-momentum vectors
// (code/measure/line-momentum-linearization); the husk transport exponents follow as in E-RLT-0059
// (code/measure/husk-transport-exponents, the same directions, ladder k_c / 4 to k_c / 256 with
// k_c = sqrt(Gamma_gap / D_max), fit over the five longest). The CONTROL is the first-mirror knit: the
// reflection in the first F4 root orthogonal to P in index order. It has the same conservation, involution
// and CPT, and only its symmetry differs. The positive control is the first-mirror matrix averaged over
// W(F4), as in E-RLT-0059.
//
// Gates, fixed before the first run of this file (a probe, tmp/iso-transport-probe.ts, had computed the three
// sets of exponents; the thresholds are E-RLT-0058's predictions and E-RLT-0059's control windows, unchanged):
//  X1 exactness: the enumeration reproduces the constant inversion (w = -1 on every dock) exactly (1e-15);
//     the exact matrix agrees with a 200,000-state Kronecker estimate from the collision function to 0.02;
//     on every lone and two-vibe dock and 20,000 Kronecker docks the collision is an involution and keeps
//     charge, count and P with 0 failures; the exact matrix commutes with all 1,152 coin maps to 1e-12, and
//     the control's does not (defect over 1e-3); the rule's table is kept by all 1,152 exhaustively; the ledger
//     over 1,152 coin maps and 6 vibe maps finds all 1,152 as glides and CPT (identity coin map, C_c) as a
//     reversal; every one of the 24 slots is changed on some state
//  X2 invariants and controls: the knit and the control keep exactly 6 invariants (charge, count, P) with 6
//     unit eigenvalues of M(0); the averaged control's husk charge and trace exponents are 4 +- 0.5
//  X3 every husk fit resolved: standard error under 0.3
// HYPOTHESIS H (E-RLT-0058's prediction for a W(F4) knit): the knit's husk charge, trace and sound exponents
// are at least 3.5, its husk shear exponent is 2 +- 0.5, and the control's husk charge exponent is under 1.
// Verdict: pass if X1, X2, X3 and H hold; fail if X1, X2, X3 hold and H does not; partial otherwise.
// Reported, not gated: the bulk exponents, the transport coefficients, dressing, vacuum, travel, the line
// momenta and side sum moved (exact color), and how much of the dock the collision acts on.
//
// DETERMINISM: exact counts, Kronecker test states, golden-spiral directions. Depth L2: the construction is
// the FCHC isometric lattice gas made covariant (Henon 1987), its exact linear transport is known physics on
// this substrate. The husk reading is the physics, the bulk beside it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { groupTable, forcedForms } from '@/code/measure/color-isotropy-bound'
import { isometricKnit, lineMomentumCollision, lineMomentumRule, OPPOSITE } from '@/code/rule/isometric-knit'
import { momentumRuleStabilizer } from '@/code/rule/conjugate-schedule'
import { equivarianceDefect, lineMomentumLinearization, sampledLinearization } from '@/code/measure/line-momentum-linearization'
import { dockAudit, kroneckerDockState, sparseDockStates } from '@/code/measure/dock-conservation'
import { exponentsOf, readTransport, spectrumOf, type Exponent } from '@/code/measure/husk-transport-exponents'
import { bulkDirections, huskDirections, invariantBasis } from '@/code/measure/husk-transport-order'
import { symmetrize } from '@/code/measure/exact-linear-collision'
import { CHARGE_CONJUGATION, symmetryLedger } from '@/code/measure/rule-symmetry-ledger'
import { dressing, travel, vacuumPeriod, type ScheduledRule } from '@/code/measure/weave-acceptance'

const LADDER = [4, 8, 16, 32, 64, 128, 256]
const FIT = 5
const SAMPLES = 200_000
const DENSE = 20_000

type Reading = { husk: Record<string, Exponent>; bulk?: Record<string, Exponent>; invariants: number; unit: number; kc: number; means: Record<string, number>; axes: Record<string, number[]> }

function transport(matrix: Float64Array, bulk: boolean): Reading {
  const matrices = [matrix]
  const invariants = invariantBasis(matrices)
  const s = spectrumOf({ matrices, invariants })
  const kc = Math.sqrt(s.gap / s.dMax)
  const ks = LADDER.map(r => kc / r)
  const husk = readTransport({ matrices, invariants, ks, directions: huskDirections(24), husk: true })

  return {
    husk: exponentsOf(husk, FIT),
    bulk: bulk ? exponentsOf(readTransport({ matrices, invariants, ks, directions: bulkDirections(24), husk: false }), FIT) : undefined,
    invariants: invariants.length,
    unit: s.unitEigenvalues,
    kc,
    means: husk.means,
    axes: husk.axes,
  }
}

export default experiment({
  id: 'relativity/isometric-knit',
  code: 'E-RLT-0061',
  title:
    'a knit with W(F4) as its exact symmetry exists and keeps CPT: the isometric knit (each dock applies the one coin map that is -1 on the mirrors holding its momentum, the covariant FCHC isometric collision) is kept by all 1,152 coin maps (rule table exhaustively, exact linearization to 0), is an exact involution keeping charge, count and momentum (0 failures on 21,152 docks), has CPT, C and PT, acts on 57.5 percent of dock states and touches all 24 directions; its exact linear equation gives husk exponents 3.99 (charge diffusion), 3.98 (momentum-sector trace) and 3.96 (sound) and 2.01 (shear), where the first-mirror control with the same conservation and CPT gives 0.00 (charge anisotropy 0.68 at leading order); it gives up exact local color (the side sum changes on 5,273 docks, and under W(F4) exact color would freeze all 12 line momenta) and the clocking vacuum (count is kept, so the calm vacuum is still and a lone vibe stays lone, dressing 1, 24 of 24 travelling)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const permutations = weylF4DirectionPermutations({ directions: rootsD4() })
    const table = groupTable()
    const isometric = lineMomentumRule('isometric')
    const control = lineMomentumRule('first-mirror')
    const collision = lineMomentumCollision(isometric)

    // X1: the counting machinery on the constant inversion
    const minus = Int32Array.from(OPPOSITE)
    const inversion = lineMomentumLinearization({ rule: () => minus }).matrix
    let inversionWorst = 0

    for (let r = 0; r < 48; r++) {
      for (let c = 0; c < 48; c++) {
        const expected = r >> 1 === OPPOSITE[c >> 1] && (r & 1) === (c & 1) ? 1 : 0

        inversionWorst = Math.max(inversionWorst, Math.abs((inversion[r * 48 + c] ?? 0) - expected))
      }
    }

    // X1: the exact matrices, the sampled estimate, equivariance
    const exact = lineMomentumLinearization({ rule: isometric })
    const controlExact = lineMomentumLinearization({ rule: control })
    const sampled = sampledLinearization({ collision, samples: SAMPLES })
    let sampledWorst = 0

    for (let i = 0; i < 48 * 48; i++) sampledWorst = Math.max(sampledWorst, Math.abs((sampled[i] ?? 0) - (exact.matrix[i] ?? 0)))

    const defect = equivarianceDefect(exact.matrix, permutations)
    const controlDefect = equivarianceDefect(controlExact.matrix, permutations)
    const stabilizer = momentumRuleStabilizer({ rule: isometric, table }).length
    const controlStabilizer = momentumRuleStabilizer({ rule: control, table }).length

    // X1: dock by dock
    const states = [...sparseDockStates(), ...Array.from({ length: DENSE }, (_, m) => kroneckerDockState(m))]
    const audit = dockAudit({ collision, inverse: collision, states })
    const controlCollision = lineMomentumCollision(control)
    const controlAudit = dockAudit({ collision: controlCollision, inverse: controlCollision, states })

    // X1: the ledger
    const ledger = symmetryLedger({ forward: () => collision, inverse: () => collision, period: 1, permutations, degree: 24, quickDense: 64, thoroughDense: 1024 })
    const glides = ledger.filter(e => e.kind === 'forward')
    const glideCoinMaps = new Set(glides.map(e => e.p)).size
    const identity = permutations.findIndex(p => p.every((x, i) => x === i))
    const cpt = ledger.some(e => e.kind === 'reversal' && e.p === identity && e.tau === CHARGE_CONJUGATION)

    const exact1 =
      inversionWorst < 1e-15 &&
      sampledWorst < 0.02 &&
      audit.involutionFailures === 0 &&
      audit.chargeChanges === 0 &&
      audit.countChanges === 0 &&
      audit.momentumChanges === 0 &&
      defect < 1e-12 &&
      controlDefect > 1e-3 &&
      stabilizer === 1152 &&
      glideCoinMaps === 1152 &&
      cpt &&
      audit.slotChanges.every(x => x > 0)

    // X2, X3, H: transport
    const knit = transport(exact.matrix, true)
    const first = transport(controlExact.matrix, true)
    const averaged = transport(symmetrize(controlExact.matrix, permutations), false)
    const within = (e: Exponent | undefined, target: number): boolean => e !== undefined && Math.abs(e.slope - target) <= 0.5
    const controls = knit.invariants === 6 && knit.unit === 6 && first.invariants === 6 && first.unit === 6 && within(averaged.husk.charge, 4) && within(averaged.husk.trace, 4)
    const fits = [knit, first].flatMap(r => Object.values(r.husk))
    const resolved = fits.every(f => f.error < 0.3)
    const hypothesis =
      (knit.husk.charge?.slope ?? 0) >= 3.5 &&
      (knit.husk.trace?.slope ?? 0) >= 3.5 &&
      (knit.husk.sound?.slope ?? 0) >= 3.5 &&
      within(knit.husk.shear, 2) &&
      (first.husk.charge?.slope ?? 9) < 1

    // reported: color, the battery
    const colorForms = forcedForms(table, table.permutations.map((_, i) => i)).length
    const rule: ScheduledRule = () => isometricKnit('isometric')
    const love = dressing(rule, { tone: 1, side: 9 })
    const fear = dressing(rule, { tone: -1, side: 9 })
    const moving = travel(rule)
    const vacuum = vacuumPeriod(rule)

    const metrics: Record<string, number> = {
      inversionWorst,
      sampledWorst,
      equivarianceDefect: defect,
      controlEquivarianceDefect: controlDefect,
      ruleStabilizer: stabilizer,
      controlRuleStabilizer: controlStabilizer,
      ledgerEntries: ledger.length,
      glideCoinMaps,
      cpt: cpt ? 1 : 0,
      actingChance: exact.acting,
      actingLineMomentumVectors: exact.actingVectors,
      controlActingChance: controlExact.acting,
      auditStates: audit.states,
      changedStates: audit.changed,
      involutionFailures: audit.involutionFailures,
      chargeChanges: audit.chargeChanges,
      countChanges: audit.countChanges,
      momentumChanges: audit.momentumChanges,
      sideSumChanges: audit.sideSumChanges,
      lineMomentumChanges: audit.lineMomentumChanges,
      leastSlotChanges: Math.min(...audit.slotChanges),
      mostSlotChanges: Math.max(...audit.slotChanges),
      controlInvolutionFailures: controlAudit.involutionFailures,
      controlMomentumChanges: controlAudit.momentumChanges,
      controlLeastSlotChanges: Math.min(...controlAudit.slotChanges),
      colorFormsFrozenByWF4: colorForms,
      vacuumPeriod: vacuum,
      travellers: moving.travellers,
      meanReach: moving.meanReach,
      ...Object.fromEntries(love.periodLargest.map((x, p) => [`loveDressingPeriod${p + 1}`, x])),
      ...Object.fromEntries(fear.periodLargest.map((x, p) => [`fearDressingPeriod${p + 1}`, x])),
    }

    for (const [name, r] of Object.entries({ knit, firstMirror: first, averaged })) {
      metrics[`${name}Invariants`] = r.invariants
      metrics[`${name}UnitEigenvalues`] = r.unit
      metrics[`${name}Kc`] = r.kc

      for (const [region, fitsOf] of Object.entries({ husk: r.husk, bulk: r.bulk ?? {} })) {
        for (const [q, e] of Object.entries(fitsOf)) {
          metrics[`${name}_${region}_${q}_exponent`] = Number(e.slope.toFixed(4))
          metrics[`${name}_${region}_${q}_error`] = Number(e.error.toFixed(4))
          metrics[`${name}_${region}_${q}_anisotropyAtLargestK`] = e.atLargestK
          metrics[`${name}_${region}_${q}_anisotropyAtSmallestK`] = e.atSmallestK
        }
      }

      for (const [q, v] of Object.entries(r.means)) if (Number.isFinite(v)) metrics[`${name}_husk_${q}_mean`] = v

      for (const [q, vs] of Object.entries(r.axes)) vs.slice(0, 3).forEach((v, i) => (metrics[`${name}_huskAxis${i}_${q}`] = v))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = exact1 && controls && resolved ? (hypothesis ? 'pass' : 'fail') : 'partial'
    const list = (r: Reading): string => ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${r.husk[q]?.slope.toFixed(2)} +- ${r.husk[q]?.error.toFixed(2)}`).join(', ')

    return verdict({
      status,
      claim: `the isometric knit has W(F4) as its exact symmetry (the rule table kept by ${stabilizer} coin maps, the matrix by all to ${defect.toExponential(1)}, ${glideCoinMaps} glide coin maps), CPT ${cpt}, and is an exact involution keeping charge, count and P on ${audit.states} docks; husk exponents: ${list(knit)}; first-mirror control: ${list(first)}; W(F4)-averaged control charge ${averaged.husk.charge?.slope.toFixed(2)}, trace ${averaged.husk.trace?.slope.toFixed(2)}`,
      metrics,
      control: {
        firstMirrorHuskChargeExponent: first.husk.charge?.slope ?? Number.NaN,
        averagedHuskChargeExponent: averaged.husk.charge?.slope ?? Number.NaN,
        averagedHuskTraceExponent: averaged.husk.trace?.slope ?? Number.NaN,
      },
      notes: `L2. Gates: X1 exact ${exact1}, X2 invariants and controls ${controls}, X3 resolved ${resolved}, H ${hypothesis}. First run recorded as is, nothing moved; a probe (tmp/iso-transport-probe.ts) had computed the three sets of exponents before this file was written, and the thresholds are E-RLT-0058's predictions and E-RLT-0059's windows, unchanged. The law comes by construction, and that is the point: the linearization commutes with every coin map (defect exactly 0 over the 1,152, every one of the 24 input slots counted on its own, none filled in by symmetry), so the period map obeys M(gk) = g M(k) g^-1 and every husk transport scalar is a W(F4)-invariant function of k, whose only quartic is |k|^4 (E-MTH-0008). What the measurement adds is that a real knit (a deterministic reversible bijection, not an averaged matrix) reaches it, with magnitudes: husk charge D ${knit.means.charge?.toFixed(3)}, shear rate ${knit.means.shear?.toFixed(3)}, sound speed ${knit.means.sound?.toFixed(3)} per beat (the first-mirror control's charge D ${first.husk.charge ? first.means.charge?.toFixed(3) : 'n/a'} splits ${first.axes.charge?.slice(0, 3).map(x => x.toFixed(3)).join(', ')} over the three husk axes), k_c ${knit.kc.toFixed(3)} against the combined knit's 0.0027 (E-RLT-0059): it scatters on ${(100 * exact.acting).toFixed(1)} percent of dock states, where the committed knit leaves two directions untouched. The shear stays k^2, as E-RLT-0058 predicted: W(F4) does not force the sixth-degree shear term. The control's sound exponent is 2.01, not 0: the leading sound speed is fixed by the kept count and momentum and the D4 velocity moments alone, isotropic for any collision; only its k^2 correction reads the collision. Cost, measured: exact local color (side sum changed on ${audit.sideSumChanges} of ${audit.states} docks, line momenta on ${audit.lineMomentumChanges}; W(F4) freezes all ${colorForms} line-momentum forms under exact color, E-RLT-0051); the clocking vacuum (count is exact, so the calm dock is fixed, vacuum period ${vacuum}); dressing (a lone vibe has P = r_d and count 1, which no other state shares, so it never scatters: support 1 in every period, ${moving.travellers} of 24 travel at the free speed, against the committed knit's 33, 160, 565, 1,508 and 12 of 24 from E-RLT-0051). What it keeps that the fork said could not be kept together: W(F4) isotropy and CPT. E-RLT-0048 to 0050 exclude this pair only for schedules of the couple architecture; a period-one whole-dock collision is outside them. Prior art: the four-dimensional FCHC lattice gas and its isometric collision rules (Frisch et al. 1987, Henon 1987), which use random choices among stabilizer elements; the covariant deterministic choice (-1 on the span of the orthogonal roots, Steinberg's theorem for the stabilizer) is what makes the symmetry exact here.`,
    })
  },
})
