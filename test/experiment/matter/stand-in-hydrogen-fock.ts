// E-MTR-0003. STAND-IN hydrogen on the husk: does the lattice break Fock's S^3 symmetry to a four-dimensional
// finite group (the binary tetrahedral 2T, W(D4) or W(F4), the model's own), or only to the husk's cubic group?
// The charge is a STAND-IN (E-MTR-0001's band-projected fear-walk token); nothing here is graded L3.
//
// Fock (1935): hydrogen's shell n is the space of degree n - 1 harmonics on the three-sphere S^3 of momentum
// space, dimension n^2, carried by the hidden SO(4). The model's bulk is 4D and its turn group is the 24 Hurwitz
// units, a finite subgroup of the unit quaternions, which ARE S^3. The roadmap asks whether the husk's
// degeneracies break as restricting SO(4) to 2T or to a D4 group predicts.
//
// PREDICTIONS, written before the hydrogen levels are solved. The shell sizes under each group are computed by
// code/measure/fock-pattern with no character table (a generic real symmetric operator averaged over the group:
// the lattice Hamiltonian is real, time-reversal even, so its invariant operators are real symmetric, and a
// quaternionic irrep counts once at its real size). A machinery probe (tmp/atom-fock-probe.ts) ran the four
// groups before this file was written; it corrected one hand prediction (2T on the n = 2 shell is one real
// quadruplet, not 2 + 2, the complex count) and is disclosed:
//   the husk's own O_h, acting on Fock's (xi1, xi2, xi3) and fixing xi4:  n = 2: 1 + 3     n = 3: 1 + 2 + 3 + 3
//   2T by left multiplication:                                             n = 2: 4         n = 3: 3 + 3 + 3
//   W(D4):                                                                 n = 2: 4         n = 3: 3 + 3 + 3
//   W(F4):                                                                 n = 2: 4         n = 3: 9
// So a 4D residual symmetry has one measurable signature on the husk: 2s level with 2p (every 4D group), and
// 3s level with the Eg half of 3d (2T and W(D4); with everything for W(F4)). The husk Hamiltonian is O_h
// symmetric by construction, so O_h's multiplets are guaranteed; the question is only whether any EXTRA
// degeneracy survives.
//
// THE NULL. The one number compared with a named prediction goes through E-MTH-0010's discipline. The first-order
// lattice shift (E-MTR-0001's kineticShift, no fitted number) names E_3p - E_3d = -3.2 / (6 a^2 81) Ry =
// -0.0029264 Ry at a = 1.5 in advance. It is admitted as identified only if the miss is under 10 percent AND its
// named-form chance (the chance a value uniform in +-10 percent of the target lands as close) is under 0.1.
//
// Method: side-64 husk torus with the spherical cavity of E-MTR-0002 (radius 31), a = 1.5, levels by LOBPCG in
// the rows A1g (3), T1u (2), Eg (1), T2g (1). No random numbers anywhere.
//
// Gates, fixed before the first run:
// 1. THE GROUP PREDICTIONS: the computed shell sizes equal the table above for all four groups
// 2. NO 4D REMNANT: at a = 1.5, |E_2s - E_2p|, |E_3s - E_Eg| and every other gap between two O_h levels of one
//    shell exceed 1e-4 Ry (a thousand times the solver's precision), so the observed pattern is O_h's and no
//    listed 4D group's
// 3. THE NAMED SIZE: E_3p - (E_Eg + E_T2g)/2 within 10 percent of -0.0029264 Ry with named-form chance under 0.1
// Pass: all three. Partial: gates 1 and 2. Fail: otherwise.
//
// Depth L2: the patterns are group theory (L1); the comparison is a measurement on the stand-in atom.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HUSK_ATOM, ROWS, kineticShift, lowestLevels, makeAtom } from '@/code/measure/stand-in-atom'
import { group2T, groupOh3, groupWD4, groupWF4, multipletSizes } from '@/code/measure/fock-pattern'
import { namedFormChance } from '@/code/measure/integer-relation'

const SIDE = 64
const WALL = 31
const A = 1.5

const PREDICTED: Record<string, [string, string]> = {
  Oh3: ['1+3', '1+2+3+3'],
  '2T': ['4', '3+3+3'],
  WD4: ['4', '3+3+3'],
  WF4: ['4', '9'],
}

export default experiment({
  id: 'matter/stand-in-hydrogen-fock',
  code: 'E-MTR-0003',
  title:
    'stand-in hydrogen on the husk against Fock S^3: the shells split as the husk cubic group O_h predicts (1 + 3 and 1 + 2 + 3 + 3), with no remnant of 2T, W(D4) or W(F4), whose restrictions would keep 2s with 2p or 3s with the Eg half of 3d',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const groups = { Oh3: groupOh3(), '2T': group2T(), WD4: groupWD4(), WF4: groupWF4() }
    let gate1 = true

    for (const [name, group] of Object.entries(groups)) {
      const one = multipletSizes(group, 1).join('+')
      const two = multipletSizes(group, 2).join('+')
      const match = one === PREDICTED[name]![0] && two === PREDICTED[name]![1]

      metrics[`group_${name}_order`] = group.length
      metrics[`group_${name}_matchesPrediction`] = match ? 1 : 0
      gate1 = gate1 && match
    }

    const atom = makeAtom({ kind: HUSK_ATOM, side: SIDE, a: A, wall: WALL })
    const s = lowestLevels({ atom, row: ROWS.A1g!, count: 3 }).values.map(v => v / atom.rydberg)
    const p = lowestLevels({ atom, row: ROWS.T1u!, count: 2 }).values.map(v => v / atom.rydberg)
    const eg = lowestLevels({ atom, row: ROWS.Eg!, count: 1 }).values[0]! / atom.rydberg
    const t2g = lowestLevels({ atom, row: ROWS.T2g!, count: 1 }).values[0]! / atom.rydberg
    const shell2 = [s[1]!, p[0]!]
    const shell3 = [s[2]!, p[1]!, eg, t2g]
    const gaps: number[] = []

    for (const shell of [shell2, shell3]) {
      for (let i = 0; i < shell.length; i++) {
        for (let j = i + 1; j < shell.length; j++) {
          gaps.push(Math.abs(shell[i]! - shell[j]!))
        }
      }
    }

    metrics.E1sOverRy = s[0]!
    metrics.E2sOverRy = s[1]!
    metrics.E2pOverRy = p[0]!
    metrics.E3sOverRy = s[2]!
    metrics.E3pOverRy = p[1]!
    metrics.E3dEgOverRy = eg
    metrics.E3dT2gOverRy = t2g
    metrics.gap2s2p = Math.abs(s[1]! - p[0]!)
    metrics.gap3sEg = Math.abs(s[2]! - eg)
    metrics.smallestShellGap = Math.min(...gaps)

    const named = kineticShift(3, 1, A) - kineticShift(3, 2, A)
    const measured = p[1]! - (eg + t2g) / 2
    const miss = Math.abs(measured / named - 1)
    const chance = namedFormChance(named, Math.abs(measured - named))

    metrics.named3pMinus3d = named
    metrics.measured3pMinus3d = measured
    metrics.namedMiss = miss
    metrics.namedFormChance = chance

    const gate2 = Math.min(...gaps) > 1e-4
    const gate3 = miss < 0.1 && chance < 0.1
    const status = gate1 && gate2 && gate3 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the stand-in's n = 2 and n = 3 shells on the husk split as O_h alone predicts: 2s - 2p = ${(s[1]! - p[0]!).toFixed(4)} Ry and 3s - 3d(Eg) = ${(s[2]! - eg).toFixed(4)} Ry at a = 1.5, where a 2T, W(D4) or W(F4) remnant of Fock's S^3 would hold them equal; the first-order p - d gap reads ${measured.toFixed(5)} Ry against the named ${named.toFixed(5)} (miss ${(miss * 100).toFixed(1)} percent, named-form chance ${chance.toFixed(3)})`,
      metrics: {
        ...metrics,
        gateGroupPredictions: gate1 ? 1 : 0,
        gateNo4dRemnant: gate2 ? 1 : 0,
        gateNamedSize: gate3 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN charge and source. The shell patterns are group theory computed without a character table (tmp/atom-fock-probe.ts ran them first, disclosed). A 4D residual symmetry is the one reading of the roadmap question that the husk could show and does not. The husk Hamiltonian commutes with O_h by construction, so the O_h multiplets are not a finding; the absence of the extra 4D degeneracies is. FIRST RUN (2026-09-26), status fail. Gate 1 passed (all four patterns as predicted). Gate 2 failed on a gate written wrongly: it required EVERY gap within a shell to exceed 1e-4 Ry, and the Eg - T2g gap of 3d is 1.46e-5 Ry, the husk near-degeneracy that the W(F4) law predicts (E-MTR-0002) and that no listed 4D group requires; the two gaps a 4D remnant would close are open by 0.317 Ry (2s - 2p) and 0.081 Ry (3s - Eg), 3,000 and 800 times the tolerance. Gate 3 failed: the p - d gap reads -0.00050 Ry against the named -0.00293, an 83 percent miss (the kinetic p^4 term alone does not predict the lattice atom at a = 1.5, where the lattice potential and the cavity also act). So: no 4D remnant, and the first-order formula is not identified.',
    })
  },
})
