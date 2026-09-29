// The linear light on the circle: E-FRC-0185's test rerun with the seam read on the light (E-FRC-0245).
//
// E-FRC-0244 showed the wave-shaped light's shadow is compact U(1) light exactly, with one flaw: the branch of its
// sawtooth force is read on the raw integer flux C A, which the carried integers offset from the light's own flux
// C A~ = C A + S / q. The fix with the fewest parts (code/rule/photon-circle) adds nothing: the kick already computes
// S = C C^T U_(t-1) for its spatial term, so it takes the branch n with q (B - N n) + S in (-q N / 2, q N / 2] and pays
// p (B - N n) + round(p S / q) + the taps. By E-FRC-0244's theorem the shadow then obeys
//
//   E~_t - E~_(t-1) = -kappa C^T [C A~_t]_N - C^T r_t,     |r_t| <= 1 / (2 q),
//
// the compact (Villain) leapfrog of its own flux: linear light wherever no plaquette's flux reaches N / 2, and a
// Dirac string, not an error, where one does. The alternatives were weighed and refused:
// - an energy bound (wraps only above the column's capacity): the leapfrog's conserved form gives |B_p|^2 <= H /
//   (kappa (1 - kappa lambda_max / 4)), so no plaquette reaches N / 2 while H < kappa (1 - kappa lambda_max / 4) (N /
//   2)^2. True, but it is the energy of ONE plaquette at the seam, and a hot field or the E-FRC-0164 start holds
//   hundreds of times more spread over thousands of plaquettes (reported below as start over seam energy): it
//   forbids nothing the test meets
// - a carry into a second column: a longer column moves the seam, it does not remove it, and adds a register
// So the seam stays, as compact U(1)'s own, and the test is whether the integer rule IS that theory.
//
// Protocol: E-FRC-0244's (the 17-member photon start family, E-FRC-0185's constants, zero carried start, 2,000 beats).
// The references are float, from the same integer start: the compact Villain leapfrog with its own branch, and the
// noncompact linear leapfrog of E-FRC-0185's S.
//
// Gates, fixed before the first run:
// A  exact reversal: 2,000 beats forward and back return every angle, flux and carried integer (0 mismatches) on
//    hashed+0 and hot, angles moved, and Gauss's law holds at the far end (0 violations)
// L  the law: residual at most (plaquettes per link) / (2 q) on every member, link and beat, and the rule's branch is
//    the Villain branch of its own shadow on every plaquette-beat (0 off the light)
// S  E-FRC-0185's S rerun on the circle: the shadow tracks the compact Villain leapfrog within 0.01 flux units on every
//    link and beat, 2,000 beats, on all 17 members
// I  informative: at least one member's reference moves a string (the seam is met)
// Control, predicted, not a gate: E-FRC-0185's wave rule departs from the same Villain reference by more than 0.01 on
// at least one member that moves a string, and the noncompact linear leapfrog departs on every member that does.
// Status: pass if A, L, S and I hold, fail otherwise.
//
// Depth L2: an exact rule, an exact law, and a float reference of the theory the law names.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  curlCurlMax,
  photonFamily,
  readMember,
  reverseMember,
  type MemberReading,
} from '@/code/measure/photon-circle'
import { photonLatticeD4 } from '@/code/rule/photon-links'

const BEATS = 2000
const TRACK = 0.01

export default experiment({
  id: 'gauge/photon-circle-light',
  code: 'E-FRC-0245',
  title:
    "the linear light on the circle: E-FRC-0185's wave-shaped light with the branch of its sawtooth read on the shadow's own flux (no new part) is compact U(1) exactly, E~_t - E~_(t-1) = -kappa C^T [C A~_t]_N to its 1/(2q) rounding, an exact integer bijection with Gauss exact, and its shadow tracks the float Villain leapfrog over the 17-member start family where E-FRC-0185 departs at the seam",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const family = photonFamily()
    const lambdaMax = curlCurlMax(photonLatticeD4({ side: 4 }))
    const reversal = [family[0]!, family[16]!].map(member => ({
      member: member.name,
      ...reverseMember({ member, kind: 'circle', beats: BEATS }),
    }))
    const circle: MemberReading[] = family.map(member =>
      readMember({ member, kind: 'circle', beats: BEATS, lambdaMax }),
    )
    const wave: MemberReading[] = family.map(member =>
      readMember({ member, kind: 'wave', beats: BEATS, lambdaMax }),
    )
    const a = reversal.every(
      r => r.mismatches === 0 && r.gauss === 0 && r.anglesMoved > 0,
    )
    const l = circle.every(
      r =>
        r.lawResidual <= r.lawRoundingBound && r.branchOffLight === 0,
    )
    const s = circle.every(r => r.shadowFromVillain <= TRACK)
    const withStrings = circle.filter(r => r.referenceStringMoves > 0)
    const informative = withStrings.length > 0
    const waveDeparts = wave.filter(
      (r, i) =>
        (circle[i]?.referenceStringMoves ?? 0) > 0 &&
        r.shadowFromVillain > TRACK,
    ).length
    const linearDeparts = circle.filter(
      r => r.referenceStringMoves > 0 && r.shadowFromLinear > TRACK,
    ).length
    const ok = a && l && s && informative
    const metrics: Record<string, number> = {
      members: family.length,
      beats: BEATS,
      gateA: a ? 1 : 0,
      gateL: l ? 1 : 0,
      gateS: s ? 1 : 0,
      gateI: informative ? 1 : 0,
      membersWithStringMoves: withStrings.length,
      referenceStringMovesTotal: circle.reduce(
        (t, r) => t + r.referenceStringMoves,
        0,
      ),
      worstShadowFromVillain: Math.max(
        ...circle.map(r => r.shadowFromVillain),
      ),
      worstLawResidual: Math.max(...circle.map(r => r.lawResidual)),
      lawRoundingBound: circle[0]?.lawRoundingBound ?? NaN,
      branchOffLightTotal: circle.reduce(
        (t, r) => t + r.branchOffLight,
        0,
      ),
      worstStartOverSeamEnergy: Math.max(
        ...circle.map(r => r.startEnergy / r.seamEnergy),
      ),
      leastStartOverSeamEnergy: Math.min(
        ...circle.map(r => r.startEnergy / r.seamEnergy),
      ),
      lambdaMaxSide4: lambdaMax,
    }

    for (const r of reversal) {
      metrics[`reverse_${r.member.replace('+', '')}_mismatches`] =
        r.mismatches
      metrics[`reverse_${r.member.replace('+', '')}_gauss`] = r.gauss
      metrics[`reverse_${r.member.replace('+', '')}_anglesMoved`] =
        r.anglesMoved
    }

    circle.forEach((r, i) => {
      const tag = r.member.replace('+', '')
      const w = wave[i]

      metrics[`${tag}_stringMoves`] = r.referenceStringMoves
      metrics[`${tag}_ruleStringMoves`] = r.ruleStringMoves
      metrics[`${tag}_shadowFromVillain`] = r.shadowFromVillain
      metrics[`${tag}_firstDeparture`] = r.firstDeparture
      metrics[`${tag}_shadowFromLinear`] = r.shadowFromLinear
      metrics[`${tag}_peakShadowFlux`] = r.peakShadowFlux
      metrics[`${tag}_waveFromVillain`] = w?.shadowFromVillain ?? NaN
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with the branch read on the light, the rule is an exact bijection (${reversal.map(r => `${r.member} ${r.mismatches} mismatches back, ${r.gauss} Gauss violations`).join(', ')}), its shadow obeys the Villain leapfrog to ${metrics.worstLawResidual?.toExponential(2)} (bound ${metrics.lawRoundingBound?.toExponential(2)}) with ${metrics.branchOffLightTotal} plaquette-beats off the light, and tracks the float Villain reference within ${metrics.worstShadowFromVillain?.toExponential(2)} flux units on ${circle.filter(r => r.shadowFromVillain <= TRACK).length} of ${family.length} members over ${BEATS} beats; ${withStrings.length} members move a string (${metrics.referenceStringMovesTotal} moves); control: E-FRC-0185's rule departs from the same reference on ${waveDeparts} of them, the noncompact leapfrog on ${linearDeparts}`,
      metrics,
      control: {
        waveDepartsOnStringMembers: waveDeparts,
        linearDepartsOnStringMembers: linearDeparts,
        worstWaveFromVillain: Math.max(
          ...wave.map(r => r.shadowFromVillain),
        ),
      },
      notes:
        "L2, exact integers in the rule, deterministic (hashed and Weyl-scaled starts, zero carried start, no seeds). The fix adds no register and no knob: the same sawtooth, its branch read on the flux the physics runs on. The rule is then compact U(1) (Villain) light exactly, to the rounding of one term: linear light below the seam, a Dirac string at it. The circle is forced (a bounded reversible column is Z_(2D+1)), so the seam is not removable, only placeable, and this places it on the light. What it does NOT settle: whether the model wants the strings (compact U(1) in 3+1 dimensions has a Coulomb phase at weak coupling and monopoles as heavy objects), and the raw flux still carries E-FRC-0185's dither (its B to E gates read raw flux and are not rerun here). FIRST RUN 2026-09-26 (tmp/base-frc245.log, 181 s): PASS. A (0 mismatches after 2,000 beats back on hashed+0 and hot, 3,068 and 49,074 angles moved, 0 Gauss violations), L (residual 5.66e-5 against 6.10e-5, 0 plaquette-beats off the light), S (within 2.23e-3 of the float Villain leapfrog on 17 of 17), I (hashed+0 and hashed+13 move 29 strings between them, where the noncompact leapfrog is off by 1,096 and 1,552). The control prediction FAILED: E-FRC-0185's rule also tracks the Villain reference on both string members (worst 2.23e-3), because its branch never left the light on this family (E-FRC-0244 L4). So on these 17 starts the fix changes no trajectory: what resolves E-FRC-0185's S is the reading (compact U(1), the circle), and the change of branch makes that reading exact by construction rather than by the luck of fast crossings.",
    })
  },
})
