// The seam of the linear light is compact U(1), and E-FRC-0185 reads it off the light (E-FRC-0244).
//
// E-FRC-0185's wave-shaped light failed only its S gate: its shadow E~ = E + C^T (u_(t-1) - u_(t-2)) left the
// linear leapfrog by 1,096 flux units on the E-FRC-0164 start, where plaquettes crossed the force table's seam at
// |B| = N / 2. The question is what that departure IS.
//
// THE CIRCLE IS FORCED. Every stored angle is a residue mod N: a husk integer is a column sum of trits held in a
// column of 2D + 1 values (E-FRC-0207), and a wrap is the only saturation that keeps a bounded column a bijection
// (E-FRC-0208: 0 collisions against 6 for a cap). So the force on a plaquette can only be a function of its flux on
// the circle Z_N, and the linear one is the sawtooth kappa (B - N n), n the branch that brings B into (-N/2, N/2].
// That is the Villain form of compact U(1). A branch change is a Dirac string moving through the plaquette, which
// compact U(1) has and noncompact Maxwell does not.
//
// THE THEOREM (code/rule/photon-circle, code/measure/photon-circle). From a zero carried start, with the shadow
// angle A~ integrated from the shadow flux (A~_t = A~_(t-1) + E~_(t-1), unwrapped from the centered start angles),
// the wave form obeys, EXACTLY,
//
//   E~_t - E~_(t-1) = -kappa C^T (C A~_t - N n_t) - C^T r_t,     r_t = (q V_t - p S_t) / q^2,  |r_t| <= 1 / (2 q),
//
// with n_t = (C A~_t - S_t / q - F_t) / N an integer, F_t the centered raw flux the table read, S_t = C C^T U_(t-1).
// Proof: the kick pays q f_t = p F_t + V_t + U_t - 2 U_(t-1) + U_(t-2), so E~_t - E~_(t-1) = -C^T (kappa F_t + V_t /
// q), and C A~_t = C A_t + S_t / q with C A_t = F_t + N n_t. So the shadow IS compact U(1) light, the linear leapfrog
// plus the string term kappa N C^T n_t. But its branch is read on the raw flux C A~_t - S_t / q, not on the light's own
// flux C A~_t: the seam sits where the carried integers put it, up to |S_t| / q flux units off.
//
// Every quantity in the check is a binary fraction of 2^-32 or coarser below 2^40, so float64 holds it EXACTLY and the
// law's residual is measured with no error of its own.
//
// Protocol: the photon start family (code/measure/photon-circle photonFamily: 16 hashed E-FRC-0164 starts on the side-4
// bulk box, member 0 E-FRC-0164's own, and the E-FRC-0165 hot start on side 8), E-FRC-0185's rule and constants (N =
// 8192, K = 80, p / q = 4021 / 65536), zero carried start, 2,000 beats each (E-FRC-0185 S's length). Float references
// from the same integer start: the noncompact linear leapfrog (E-FRC-0185 S's reference) and the compact Villain
// leapfrog with its own branch.
//
// Gates, fixed before the first run:
// L1 the law: on every member, link and beat, the residual is at most (plaquettes per link) / (2 q)
// L2 the branch: n_t is an integer (off by under 1e-9) on every plaquette-beat that is not an exact half turn (where
//    E-FRC-0185's table reads 0, not N / 2); the half turns are counted
// L3 the departure is strings and nothing else: on every member, the shadow leaves the noncompact linear leapfrog by
//    more than 0.01 flux units exactly when the rule's own branch moves at least once (both directions)
// L4 the seam is off the light: on at least one member the rule's branch differs from the Villain branch of its own
//    shadow on some plaquette-beat (the dither's offset decides a crossing)
// Informative: at least one member has a string move, and at least one has none.
// Status: pass if L1 to L4 hold and the family is informative, fail otherwise.
//
// Depth L2: an exact identity of the integer rule, checked exactly, over a family of starts.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { curlCurlMax, photonFamily, readMember, type MemberReading } from '@/code/measure/photon-circle'
import { photonLatticeD4 } from '@/code/rule/photon-links'

const BEATS = 2000
const TRACK = 0.01
const INTEGER = 1e-9

export default experiment({
  id: 'gauge/photon-seam-law',
  code: 'E-FRC-0244',
  title:
    "the linear light's seam is compact U(1): E-FRC-0185's shadow obeys the Villain leapfrog exactly, E~_t - E~_(t-1) = -kappa C^T (C A~_t - N n_t) up to its 1/(2q) rounding, with n_t an integer string field, so every departure from the noncompact leapfrog is a Dirac string moving; but the rule reads the branch on the raw flux, off its own light by the carried integers' offset",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lambdaMax = curlCurlMax(photonLatticeD4({ side: 4 }))
    const readings: MemberReading[] = photonFamily().map(member => readMember({ member, kind: 'wave', beats: BEATS, lambdaMax }))
    const l1 = readings.every(r => r.lawResidual <= r.lawRoundingBound)
    const l2 = readings.every(r => r.branchNonInteger < INTEGER)
    const l3 = readings.every(r => r.shadowFromLinear > TRACK === r.ruleStringMoves > 0)
    const offLight = readings.filter(r => r.branchOffLight > 0).length
    const l4 = offLight > 0
    const withStrings = readings.filter(r => r.ruleStringMoves > 0).length
    const informative = withStrings > 0 && withStrings < readings.length
    const ok = l1 && l2 && l3 && l4 && informative
    const metrics: Record<string, number> = {
      members: readings.length,
      beats: BEATS,
      gateL1: l1 ? 1 : 0,
      gateL2: l2 ? 1 : 0,
      gateL3: l3 ? 1 : 0,
      gateL4: l4 ? 1 : 0,
      gateInformative: informative ? 1 : 0,
      membersWithStringMoves: withStrings,
      membersReadingOffTheLight: offLight,
      worstLawResidual: Math.max(...readings.map(r => r.lawResidual)),
      lawRoundingBound: readings[0]?.lawRoundingBound ?? NaN,
      worstBranchNonInteger: Math.max(...readings.map(r => r.branchNonInteger)),
      halfTurns: readings.reduce((s, r) => s + r.halfTurns, 0),
      lambdaMaxSide4: lambdaMax,
    }

    for (const r of readings) {
      const tag = r.member.replace('+', '')

      metrics[`${tag}_ruleStringMoves`] = r.ruleStringMoves
      metrics[`${tag}_referenceStringMoves`] = r.referenceStringMoves
      metrics[`${tag}_branchOffLight`] = r.branchOffLight
      metrics[`${tag}_shadowFromLinear`] = r.shadowFromLinear
      metrics[`${tag}_shadowFromVillain`] = r.shadowFromVillain
      metrics[`${tag}_peakShadowFlux`] = r.peakShadowFlux
      metrics[`${tag}_startOverSeamEnergy`] = r.startEnergy / r.seamEnergy
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `over ${readings.length} starts and ${BEATS} beats E-FRC-0185's shadow obeys the Villain leapfrog with residual at most ${metrics['worstLawResidual']?.toExponential(2)} against the rounding bound ${metrics['lawRoundingBound']?.toExponential(2)}, its string field integer to ${metrics['worstBranchNonInteger']?.toExponential(1)} (${metrics['halfTurns']} exact half turns); the shadow leaves the noncompact linear leapfrog by more than ${TRACK} on exactly the ${withStrings} members whose string field moves (${l3 ? 'both directions hold' : 'NOT on every member'}); on ${offLight} members the rule's branch differs from the Villain branch of its own shadow`,
      metrics,
      control: {
        noncompactDepartureMembers: readings.filter(r => r.shadowFromLinear > TRACK).length,
        villainDepartureMembers: readings.filter(r => r.shadowFromVillain > TRACK).length,
      },
      notes:
        'L2, exact integers in the rule and exact binary fractions in the check, deterministic (hashed and Weyl-scaled starts, zero carried start, no seeds). The law is a theorem of the rule, so L1 and L2 check the derivation and the code, not physics. What is physics: every departure of E-FRC-0185 from linear light is a Dirac string of compact U(1), which the circle Z_N forces, and the strings are counted, not errors. What is wrong with E-FRC-0185 is where it reads the branch: on the raw flux, which the carried integers offset from the light, so the seam jitters with the dither. E-FRC-0245 moves the branch onto the light and reruns the test. FIRST RUN 2026-09-26 (tmp/base-frc244.log, 76 s): FAIL on L4 alone, a wrong prediction. L1 (residual 5.66e-5 against the bound 6.10e-5), L2 (the string field integer exactly, 0 half turns) and L3 (the shadow leaves the noncompact leapfrog by more than 0.01 on exactly the 2 members whose string field moves: hashed+0 with 3 moves, 1,096 flux units off, E-FRC-0185\'s own failure; hashed+13 with 26 moves, 1,552 off; the other 15 stay within 2.2e-3) all pass, and the shadow stays within 2.2e-3 of the float Villain reference on all 17. But on 0 of 17 members does the rule\'s branch differ from the Villain branch of its own shadow: the offset S / q is a few flux units and every crossing met passed through it within one beat. So E-FRC-0185\'s S failure was not a defect of the rule at all on this family: it was a reference that took the noncompact theory for the compact one. The branch-offset flaw is real in the algebra and unmet in 34,000 beats. The starts carry 327 to 4,612 times the energy of one plaquette at the seam, so an energy bound excludes nothing here.',
    })
  },
})
