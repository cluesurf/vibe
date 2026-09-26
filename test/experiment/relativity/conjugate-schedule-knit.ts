// Symmetry by schedule: one collision cycled through its conjugates by a transversal of W(F4) (E-RLT-0062).
//
// THE QUESTION. Instead of building a collision that commutes with W(F4) (E-RLT-0061), take one that does
// not and run its conjugates g C g^-1 on successive beats, g over a transversal of W(F4) over C's stabilizer.
// If the period's transport were the group average of the beat's, the W(F4)-averaged matrix of E-RLT-0059
// says the husk diffusion and sound would be isotropic through k^4. Is it, and what happens to CPT?
//
// WHAT THE THEOREMS SAY FIRST. A schedule's exact symmetry is its period group: the coin maps h that carry
// the sequence of beats to a shift of itself (glides) or to its reverse (reversals). Two beats are the same
// collision exactly when their elements share a left coset of the stabilizer, so the period group is coset
// combinatorics (code/rule/conjugate-schedule): a glide maps coset T to coset T + s for every T, and the maps
// that do form an extension of a cyclic group of shifts by the common stabilizer. With every coset visited
// once, nothing larger than the stabilizer and one cyclic shift can survive, so the exact period group of a
// transversal schedule is not W(F4), and by E-RLT-0058 it forces nothing. E-RLT-0048 and 0049 reach the same
// place for the couple architecture (no irreducible period group, any motif, any period); this is the general
// form, for any base collision. So the k^4 law, if it came, would come from the transport alone, not from a
// symmetry. The period's transport tensor is the sum over beats of one-beat terms, which average over the
// group exactly, plus the correlations between a beat and the ones after it, which depend on consecutive
// pairs g_T^-1 g_(T+1) and do not average. The first are the group average; the second are the anisotropy
// that is left at leading order.
//
// CPT. The base here is the first-mirror knit of E-RLT-0061 (the reflection in the first F4 root orthogonal to
// the dock's momentum, in index order): an involution that keeps charge, count and P, with stabilizer {I, -I}
// and CPT beat by beat (C_c C_T C_c = C_T = C_T^-1). The ledger's CPT needs C_T = C_(m - T) for one mirror m,
// which a transversal visiting each coset once cannot give, and which running it forward then backward (the
// palindrome, period 2N, mirror 2N - 1) gives exactly. Both orders are measured.
//
// THE MEASUREMENT. Each beat's exact linearized collision is the base's (code/measure/line-momentum-
// linearization) conjugated by its coin map; the convention is checked against the enumeration of the
// conjugated rule itself. The period map of 1,152 (palindrome) or 576 (plain) beats is read as in E-RLT-0059
// (code/measure/husk-transport-exponents) with one change fixed here: the ladder is k_top / 2^j, j = 0 to 6,
// with k_top = pi / (2 sqrt 2 x period), so no mode's phase can turn more than a quarter per period (the
// E-RLT-0059 ladder, k_c / 4 down, would alias every sound mode many times over a thousand beats), fit over
// the five largest. The comparison: the base knit, and the base averaged over W(F4) (the group average the
// schedule is hoped to reach), read on their own E-RLT-0059 ladders.
//
// Gates, fixed before the first run (a probe, tmp/iso-schedule-probe.ts, had found the stabilizer, the coset
// count, the two period groups and the conjugation check, and timed one period map; it computed no exponent):
//  X1 exactness: the base's stabilizer is {I, -I} exhaustively over every reachable momentum, 576 cosets; the
//     conjugated matrix equals the enumeration of the conjugated rule (1e-15) for two coset representatives;
//     every beat is an involution keeping charge, count and P on 256 Kronecker docks (0 failures); the
//     palindrome's only identity mirror is 1,151 and the plain order has none, by the cosets, and the
//     collisions agree on 64 docks at every beat
//  X2 both schedules keep exactly 6 invariants with 6 unit eigenvalues of M(0); and (ADDED after the first
//     run stopped in the QR iteration of the 1,152-beat map, before any exponent was printed) the
//     Rayleigh-Ritz reading used for the schedules agrees with the full eigen-decomposition to 1e-8 on the base
//     knit and on a 24-beat piece of the palindrome
//  X3 every husk fit resolved (standard error under 0.3)
// HYPOTHESIS H (the hope under test): the palindromic schedule's husk charge and trace exponents are at least
// 3.5, the group-average law. Predicted to fail (the correlation term above).
// Verdict: pass if X1, X2, X3 and H hold; fail if X1, X2, X3 hold and H does not; partial otherwise.
//
// DETERMINISM: exact counts, coset combinatorics, Kronecker test states. Depth L2. Husk only: the schedule's
// bulk reading is substrate and was not run, to keep the run inside the shared machine's budget.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { conjugateRule, lineMomentumCollision, lineMomentumRule } from '@/code/rule/isometric-knit'
import { cosetPeriodGroup, leftTransversal, momentumRuleStabilizer, palindrome } from '@/code/rule/conjugate-schedule'
import { lineMomentumLinearization } from '@/code/measure/line-momentum-linearization'
import { conjugateBySlots, symmetrize } from '@/code/measure/exact-linear-collision'
import { dockAudit, kroneckerDockState } from '@/code/measure/dock-conservation'
import { exponentsOf, readTransport, slowModes, spectrumOf, type Exponent } from '@/code/measure/husk-transport-exponents'
import { huskDirections, invariantBasis } from '@/code/measure/husk-transport-order'
import { forcedIsotropic, matrixOfPermutation } from '@/code/measure/husk-transport-symmetry'
import { conjugateCollision } from '@/code/measure/rule-symmetry-ledger'

const FIT = 5
const LADDER = [4, 8, 16, 32, 64, 128, 256]

type Reading = { husk: Record<string, Exponent>; invariants: number; unit: number; ks: readonly number[]; means: Record<string, number> }

function read(matrices: readonly Float64Array[], ladder: 'schedule' | 'knit'): Reading {
  const invariants = invariantBasis(matrices)
  const method = ladder === 'schedule' ? 'ritz' : 'full'
  const s = spectrumOf({ matrices, invariants, method })
  const top = ladder === 'schedule' ? Math.PI / (2 * Math.SQRT2 * matrices.length) : Math.sqrt(s.gap / s.dMax) / 4
  const ks = ladder === 'schedule' ? [0, 1, 2, 3, 4, 5, 6].map(j => top / 2 ** j) : LADDER.map(r => (top * 4) / r)
  const reading = readTransport({ matrices, invariants, ks, directions: huskDirections(24), husk: true, method })

  return { husk: exponentsOf(reading, FIT), invariants: invariants.length, unit: s.unitEigenvalues, ks, means: reading.means }
}

export default experiment({
  id: 'relativity/conjugate-schedule-knit',
  code: 'E-RLT-0062',
  title: 'symmetry by schedule',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const table = groupTable()
    const permutations = weylF4DirectionPermutations({ directions: rootsD4() })
    const base = lineMomentumRule('first-mirror')
    const stabilizer = momentumRuleStabilizer({ rule: base, table })
    const { representatives, cosetOf } = leftTransversal({ table, stabilizer })
    const plain = representatives.map((_, i) => i)
    const pal = palindrome(plain)
    const elementOf = (coset: number): readonly number[] => table.permutations[representatives[coset] ?? 0] ?? []

    // X1: the conjugation convention on two cosets
    const A = lineMomentumLinearization({ rule: base }).matrix
    let conventionWorst = 0

    for (const coset of [1, 287]) {
      const g = elementOf(coset)
      const direct = lineMomentumLinearization({ rule: conjugateRule(base, g) }).matrix
      const conj = conjugateBySlots(A, g)

      for (let i = 0; i < 48 * 48; i++) conventionWorst = Math.max(conventionWorst, Math.abs((direct[i] ?? 0) - (conj[i] ?? 0)))
    }

    // X1: every beat, dock by dock
    const collision = lineMomentumCollision(base)
    const beats = plain.map(c => conjugateCollision({ collision, permutation: elementOf(c) }))
    const states = Array.from({ length: 256 }, (_, m) => kroneckerDockState(50_000 + m))
    let beatFailures = 0

    for (const beat of beats) {
      const a = dockAudit({ collision: beat, inverse: beat, states })

      beatFailures += a.involutionFailures + a.chargeChanges + a.countChanges + a.momentumChanges
    }

    // X1: the period groups and CPT, by cosets and by collisions
    const palGroup = cosetPeriodGroup({ table, schedule: pal, cosetOf })
    const plainGroup = cosetPeriodGroup({ table, schedule: plain, cosetOf })
    const probeStates = states.slice(0, 64)
    const sameOn = (a: (typeof beats)[number], b: (typeof beats)[number]): boolean =>
      probeStates.every(x => {
        const u = Int8Array.from(x)
        const v = Int8Array.from(x, y => -y)

        a(u, 0, 24)
        // C_c b C_c x
        b(v, 0, 24)

        return u.every((y, i) => y === -(v[i] ?? 0))
      })
    const mirrorsHolding = (schedule: readonly number[]): number[] => {
      const out: number[] = []

      for (let m = 0; m < schedule.length; m++) {
        let holds = true

        for (let T = 0; T < schedule.length && holds; T++) {
          holds = sameOn(beats[schedule[T] ?? 0]!, beats[schedule[(((m - T) % schedule.length) + schedule.length) % schedule.length] ?? 0]!)
        }

        if (holds) out.push(m)
      }

      return out
    }
    const palMirrors = mirrorsHolding(pal)
    const plainMirrors = mirrorsHolding(plain)
    const palMembers = [...new Set([...palGroup.glides, ...palGroup.reversals])]
    const palMatrices = palMembers.map(i => matrixOfPermutation(table.permutations[i] ?? []))
    const forcesScalar2 = forcedIsotropic({ group: palMatrices, kind: 'scalar', degree: 2, husk: true }).forced
    const forcesScalar4 = forcedIsotropic({ group: palMatrices, kind: 'scalar', degree: 4, husk: true }).forced

    const exact =
      stabilizer.length === 2 &&
      stabilizer.includes(table.minus) &&
      representatives.length === 576 &&
      conventionWorst < 1e-15 &&
      beatFailures === 0 &&
      palGroup.identityMirrors.length === 1 &&
      palGroup.identityMirrors[0] === 1151 &&
      plainGroup.identityMirrors.length === 0 &&
      palMirrors.length === 1 &&
      palMirrors[0] === 1151 &&
      plainMirrors.length === 0

    // the Rayleigh-Ritz reading against the full eigen-decomposition (added after the first run stopped in
    // the QR iteration): the base knit at the E-RLT-0059 k_c / 4, and the first 24 beats of the palindrome at
    // their own k_top, along a husk axis, a face diagonal and a body diagonal
    const conjugated = plain.map(c => conjugateBySlots(A, elementOf(c)))
    const ritzWorst = (() => {
      let worst = 0
      const cases: [Float64Array[], number][] = [
        [[A], 0.17],
        [pal.slice(0, 24).map(c => conjugated[c]!), Math.PI / (2 * Math.SQRT2 * 24)],
      ]

      for (const [matrices, k] of cases) {
        const invariants = invariantBasis(matrices)

        for (const u of [
          [1, 0, 0, 0],
          [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
          [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 0],
        ]) {
          const wave = u.map(x => x * k)
          const full = slowModes({ matrices, wave, count: invariants.length, families: {}, method: 'full' })
          const ritz = slowModes({ matrices, wave, count: invariants.length, families: {}, method: 'ritz', starts: invariants })
          const key = (m: { gamma: number; omega: number }): number => m.gamma * 1e3 + m.omega
          const a = [...full].sort((x, y) => key(x) - key(y))
          const b = [...ritz].sort((x, y) => key(x) - key(y))

          a.forEach((m, i) => {
            worst = Math.max(worst, Math.abs(m.gamma - (b[i]?.gamma ?? 0)) / Math.max(m.gamma, 1e-300), Math.abs(m.omega - (b[i]?.omega ?? 0)) / k)
          })
        }
      }

      return worst
    })()

    // transport
    const palReading = read(pal.map(c => conjugated[c]!), 'schedule')
    const plainReading = read(conjugated, 'schedule')
    const baseReading = read([A], 'knit')
    const averagedReading = read([symmetrize(A, permutations)], 'knit')
    const invariantsOk = [palReading, plainReading].every(r => r.invariants === 6 && r.unit === 6) && ritzWorst < 1e-8
    const resolved = [palReading, plainReading].every(r => Object.values(r.husk).every(e => e.error < 0.3))
    const hypothesis = (palReading.husk.charge?.slope ?? 0) >= 3.5 && (palReading.husk.trace?.slope ?? 0) >= 3.5

    const metrics: Record<string, number> = {
      ritzAgainstFullWorst: ritzWorst,
      stabilizerOrder: stabilizer.length,
      cosets: representatives.length,
      conventionWorst,
      beatFailures,
      palindromeGlides: palGroup.glides.length,
      palindromeReversals: palGroup.reversals.length,
      palindromePeriodGroupOrder: palMembers.length,
      palindromeIdentityMirror: palGroup.identityMirrors[0] ?? -1,
      palindromeMirrorsByCollision: palMirrors.length,
      plainGlides: plainGroup.glides.length,
      plainReversals: plainGroup.reversals.length,
      plainIdentityMirrors: plainGroup.identityMirrors.length,
      plainMirrorsByCollision: plainMirrors.length,
      periodGroupForcesHuskScalar2: forcesScalar2 ? 1 : 0,
      periodGroupForcesHuskScalar4: forcesScalar4 ? 1 : 0,
    }

    for (const [name, r] of Object.entries({ palindrome: palReading, plain: plainReading, base: baseReading, averaged: averagedReading })) {
      metrics[`${name}Invariants`] = r.invariants
      metrics[`${name}UnitEigenvalues`] = r.unit
      metrics[`${name}LargestK`] = r.ks[0] ?? Number.NaN

      for (const [q, e] of Object.entries(r.husk)) {
        metrics[`${name}_husk_${q}_exponent`] = Number(e.slope.toFixed(4))
        metrics[`${name}_husk_${q}_error`] = Number(e.error.toFixed(4))
        metrics[`${name}_husk_${q}_anisotropyAtLargestK`] = e.atLargestK
        metrics[`${name}_husk_${q}_anisotropyAtSmallestK`] = e.atSmallestK
      }

      for (const [q, v] of Object.entries(r.means)) if (Number.isFinite(v)) metrics[`${name}_husk_${q}_mean`] = v
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = exact && invariantsOk && resolved ? (hypothesis ? 'pass' : 'fail') : 'partial'
    const list = (r: Reading): string => ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${r.husk[q]?.slope.toFixed(2)} (anisotropy ${r.husk[q]?.atSmallestK.toExponential(2)})`).join(', ')

    return verdict({
      status,
      claim: `palindromic W(F4) schedule of the first-mirror knit (period ${pal.length}, exact period group of order ${palMembers.length}, CPT at mirror ${palGroup.identityMirrors[0] ?? -1}): ${list(palReading)}; plain order (no CPT): ${list(plainReading)}; base ${list(baseReading)}; W(F4) average ${list(averagedReading)}`,
      metrics,
      control: {
        averagedHuskChargeExponent: averagedReading.husk.charge?.slope ?? Number.NaN,
        baseHuskChargeExponent: baseReading.husk.charge?.slope ?? Number.NaN,
      },
      notes: `L2. Gates: X1 exact ${exact}, X2 invariants ${invariantsOk}, X3 resolved ${resolved}, H ${hypothesis}.`,
    })
  },
})
