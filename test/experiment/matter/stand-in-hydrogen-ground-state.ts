// E-MTR-0004. STAND-IN hydrogen on the husk: is the ground state bounded below, does it converge to -Ry as the
// lattice refines, and does it keep its size rather than collapse onto the source dock? The charge is a STAND-IN
// (E-MTR-0001's band-projected fear-walk token); nothing here is graded L3.
//
// Uncertainty against Coulomb: in the continuum the kinetic cost 1 / (2 m r^2) beats -alpha / r at small r and
// the ground state is -Ry at radius a. On the lattice the kinetic energy is BOUNDED (the fear band tops out at
// 2 pi / 3 per line), so the lattice, not uncertainty, is what stops a collapse at small a, and the question is
// whether the ground state leaves that regime as a grows.
//
// THE BOUND, exact: e1(q) = arccos(cos q / 2) - pi / 3 >= 0 for every q, so T >= 0 and every level is at least
// min V = V(source) = -alpha 24 pi G(0). A bound below is guaranteed; the measurement is how the ground state
// sits against it and against -Ry.
//
// THE CONTROL: the other single token the husk offers, the 18-slot token with one coin mixing every husk
// direction (U = S C, C = omega + (1 - omega) |s><s|, code/measure/stand-in-hydrogen husk18, the D4 token at
// k4 = 0). Its exact particle band (the secular root of code/measure/stand-in-atom carried out along each ray)
// is predicted to come back below its own bottom somewhere in the zone, because its 18 poles spread round the
// whole circle: then a bound level near E = -Ry is degenerate with that token's far-zone states and has no
// bottom to sit on. That is why the stand-in is the gapped band.
//
// Method: the ground state (lowest A1g) on a side-64 husk torus at a = 2, 3, 4, 6, 8, and at a = 4 also on a
// side-32 torus. No random numbers anywhere.
//
// Gates, fixed before the first run of this file. A feasibility probe (tmp/atom-probe3.ts) had read the ground
// state at a = 2, 3, 4, 6 (-3.422, -1.553, -1.184, -1.059 Ry) before these were written; a = 8 and the box check
// had not run, and the 18-slot band minimum had been read once (-1.34 on a side-32 grid, tmp/atom-probe1.ts):
// 1. BOUNDED: every ground level lies above min V
// 2. CONVERGES: r(a) = |E_1s / (-Ry) - 1| falls strictly over a = 2, 3, 4, 6, 8, r(8) < 0.05, and the fitted
//    exponent of r over a = 4, 6, 8 is at least 2 (the first-order lattice shift is a^-2)
// 3. NO COLLAPSE: <r>_1s / (1.5 a) within 5 percent of 1 at a = 8
// 4. THE BOX: at a = 4 the side-32 and side-64 ground levels agree to 1e-4 of the level
// 5. CONTROL: the 18-slot token's particle band has its minimum over the side-32 zone below -0.5 (it is not
//    bounded near its own bottom), where the stand-in's band minimum is 0 (to 1e-12, at k = 0)
// Pass: all five. Partial: 1, 3, 4, 5 with 2 failing only on the exponent. Fail: otherwise.
//
// Depth L2: lattice quantum mechanics of a chosen stand-in; the control is a measured negative.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HUSK_ATOM, ROWS, bandGrid, kindBandGrid, lowestLevels, makeAtom, radial } from '@/code/measure/stand-in-atom'
import { husk18 } from '@/code/measure/stand-in-hydrogen'

const RADII = [2, 3, 4, 6, 8]

export default experiment({
  id: 'matter/stand-in-hydrogen-ground-state',
  code: 'E-MTR-0004',
  title:
    'stand-in hydrogen on the husk, the ground state: bounded below exactly by the source potential since the fear band is non-negative, lattice-bound on the source dock at small Bohr radius, and converging to -Ry and to radius 1.5 a as the lattice refines, where the 18-slot husk token has no bottom',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const rows = RADII.map(a => {
      const atom = makeAtom({ kind: HUSK_ATOM, side: 64, a })
      const level = lowestLevels({ atom, row: ROWS.A1g!, count: 1 })
      const e = level.values[0]! / atom.rydberg
      const r = radial(64, level.vectors[0]!)
      const floor = atom.potential.reduce((m, v) => Math.min(m, v), Infinity) / atom.rydberg
      const source = level.vectors[0]![32 + 64 * (32 + 64 * 32)]! ** 2

      metrics[`a${a}_E1sOverRy`] = e
      metrics[`a${a}_minVOverRy`] = floor
      metrics[`a${a}_r1sOverA`] = r.meanR / a
      metrics[`a${a}_chanceOnSourceDock`] = source
      metrics[`a${a}_beyondEdge`] = r.beyond

      return { a, e, floor, r: r.meanR, miss: Math.abs(e / -1 - 1) }
    })
    const exponent = (() => {
      const tail = rows.slice(2)
      const lx = tail.map(t => Math.log(t.a))
      const ly = tail.map(t => Math.log(t.miss))
      const mx = lx.reduce((s, v) => s + v, 0) / lx.length
      const my = ly.reduce((s, v) => s + v, 0) / ly.length

      return -lx.reduce((s, v, i) => s + (v - mx) * (ly[i]! - my), 0) / lx.reduce((s, v) => s + (v - mx) ** 2, 0)
    })()
    const small = makeAtom({ kind: HUSK_ATOM, side: 32, a: 4 })
    const e32 = lowestLevels({ atom: small, row: ROWS.A1g!, count: 1 }).values[0]! / small.rydberg
    const e64 = rows.find(r => r.a === 4)!.e
    const token = bandGrid(husk18(), 32)
    const standIn = kindBandGrid(HUSK_ATOM, 32)
    let tokenMin = Infinity
    let belowZero = 0

    for (const v of token) {
      tokenMin = Math.min(tokenMin, v)
      belowZero += v < 0 ? 1 : 0
    }

    metrics.convergenceExponent = exponent
    metrics.a4_side32E1sOverRy = e32
    metrics.boxDifference = Math.abs(e32 / e64 - 1)
    metrics.tokenBandMinimum = tokenMin
    metrics.tokenZoneShareBelowZero = belowZero / token.length
    metrics.standInBandMinimum = standIn.reduce((m, v) => Math.min(m, v), Infinity)

    const gate1 = rows.every(r => r.e > r.floor)
    const gate2Order = rows.every((r, i) => i === 0 || r.miss < rows[i - 1]!.miss) && rows[rows.length - 1]!.miss < 0.05
    const gate2 = gate2Order && exponent >= 2
    const gate3 = Math.abs(rows[rows.length - 1]!.r / (1.5 * 8) - 1) <= 0.05
    const gate4 = metrics.boxDifference <= 1e-4
    const gate5 = tokenMin < -0.5 && Math.abs(metrics.standInBandMinimum) < 1e-12
    const status = gate1 && gate2 && gate3 && gate4 && gate5 ? 'pass' : gate1 && gate2Order && gate3 && gate4 && gate5 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the stand-in's ground level on the husk reads ${rows.map(r => r.e.toFixed(4)).join(', ')} Ry at a = ${RADII.join(', ')} (lattice-bound, ${metrics.a2_chanceOnSourceDock!.toFixed(3)} of it on the source dock, at a = 2), converging to -Ry as a^-${exponent.toFixed(2)} with <r> / 1.5 a = ${(rows[rows.length - 1]!.r / 12).toFixed(4)} at a = 8, while the 18-slot husk token's band falls to ${tokenMin.toFixed(3)} below its own bottom`,
      metrics: {
        ...metrics,
        gateBounded: gate1 ? 1 : 0,
        gateConverges: gate2 ? 1 : 0,
        gateNoCollapse: gate3 ? 1 : 0,
        gateBox: gate4 ? 1 : 0,
        gateTokenControl: gate5 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN charge and source. The bound is exact (T >= 0); what the lattice does is make the small-a ground state a single-dock state, the stand-in atom behaving like an alkali core with a large s quantum defect (E-MTR-0001). A feasibility probe had read a = 2 to 6 before the gates (disclosed in the header). The first launch (2026-09-26) crashed before any gate was read (Math.min over a 262,144-entry array overflowed the call stack); the two minima were rewritten as loops, nothing else changed, and the run below is the first complete one. FIRST COMPLETE RUN (2026-09-26), status fail on one gate: bounded, converging (a^-2.10) and not collapsing (<r> = 1.039 x 1.5 a at a = 8), and the band of the 18-slot token falls to -1.34 below its own bottom (0.13 percent of its zone below zero), but the box gate failed: at a = 4 the side-32 and side-64 ground levels differ by 7.1e-3 of the level against a 1e-4 gate. The side-32 box is too small at a = 4 (the ground state reaches 1.24 a = 5 docks, and the minimum-image potential on side 32 differs from side 64 in its tail), so the gate tested the small box, not the atom; the side-64 levels are the ones reported.',
    })
  },
})
