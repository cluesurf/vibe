// E-MTR-0002. STAND-IN hydrogen on the husk: the n^2 degeneracy and how the lattice splits it, against the
// E-MTH-0008 k^4 law. The charge is a STAND-IN (the band-projected fear-walk token of E-MTR-0001); nothing here
// is graded L3.
//
// The continuum hydrogen shell n holds n^2 states at one energy, the l = 0 ... n - 1 multiplets together, by
// Fock's hidden SO(4). A lattice splits it twice over:
//   BETWEEN l: the band's isotropic p^4 term and the potential's contact term move each l differently, at
//     relative order 1/a^2 on any cubic lattice (E-MTR-0001's kineticShift), and the lattice core moves s far
//     more (E-MTR-0004)
//   WITHIN l: a cubic lattice splits a d level (l = 2) into its O_h rows Eg (2) and T2g (3). That needs an
//     anisotropic term whose angular content reaches l = 4. On the plain cubic control the band's first
//     anisotropy is the quartic sum_i k_i^4, which holds an l = 4 cubic harmonic, so the split is first order in
//     k^4 against k^2: relative order 1/a^2. On the husk T is a W(F4)-invariant sum over the D4 roots, whose only
//     quartic is |k|^4 (E-MTH-0008), so the first anisotropy is sextic: sum_h w_h (k . u_h)^6 = 6 sum_i k_i^6 + 30
//     sum_(i != j) k_i^4 k_j^2, whose Laplacian (300 sum k^4 + 720 sum_(i<j) k_i^2 k_j^2) is not a multiple of
//     |k|^4, so it too holds an l = 4 harmonic, now at relative order k^4. The husk Laplacian follows the same
//     law (its symbol's k^4 term is 6 |k|^4 / 12 exactly). PREDICTION: the 3d split
//       S(a) = |E_T2g - E_Eg| / Ry  falls as a^-4 on the husk and as a^-2 on the cubic control
//
// Method: the same stand-in and source as E-MTR-0001 on a side-64 torus. The d levels are solved in a spherical
// cavity (every dock beyond r = 31 raised far above the band), because the torus's cube would itself split Eg
// from T2g (a 3d level at a = 2 reaches the box edge), while a sphere shifts both rows of one l alike up to its
// lattice roughness. The control is the plain cubic lattice with the fear walk along its 3 axes (the same mass
// sqrt 3) and the cubic lattice's own Green's function. LOBPCG in one row of each irrep. No random numbers.
//
// Gates, fixed before the first run of this file (a feasibility probe, tmp/atom-probe1 and 3, had read the band
// anisotropy slopes 3.99 and 2.00 and the torus levels at a = 2, 3, 4, so gates 1 and 2 are checks of numbers
// already seen; gate 3 is on cavity levels no probe solved):
// 1. THE BAND LAW: the relative anisotropy of T between an axis and the body diagonal, at q = 0.05 and 0.1,
//    has slope 4 +- 0.1 on the husk and 2 +- 0.1 on the control
// 2. THE SHELL CLOSES: D2(a) = (E_2p - E_2s) / Ry on the husk torus falls over a = 1.5, 2, 3, as a^-p with
//    p >= 2 between a = 2 and 3
// 3. THE 3d SPLIT: fitted over a = 1, 1.25, 1.5, 2, the slope of ln S against ln a lies in [-5.5, -3] on the husk
//    and in [-2.8, -1.2] on the control, and S_husk < S_control at every a
// Pass: all three. Partial: gates 1 and 2. Fail: otherwise.
//
// Depth L2: lattice quantum mechanics of a chosen stand-in charge; the within-l law is a prediction from the
// W(F4) invariant theory, which could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { CUBIC_ATOM, HUSK_ATOM, ROWS, cubicBand, huskBand, lowestLevels, makeAtom, type AtomKind } from '@/code/measure/stand-in-atom'

const SIDE = 64
const WALL = 31
const SPLIT_RADII = [1, 1.25, 1.5, 2]
const SHELL_RADII = [1.5, 2, 3]

// the relative anisotropy of a band between the axis and the body diagonal at |k| = q
function anisotropy(band: (k: readonly number[]) => number, q: number): number {
  const axis = band([q, 0, 0])
  const diagonal = band([q / Math.sqrt(3), q / Math.sqrt(3), q / Math.sqrt(3)])

  return Math.abs(axis - diagonal) / axis
}

// the least-squares slope of ln y against ln x
function slope(xs: number[], ys: number[]): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((s, v) => s + v, 0) / lx.length
  const my = ly.reduce((s, v) => s + v, 0) / ly.length

  return lx.reduce((s, v, i) => s + (v - mx) * (ly[i]! - my), 0) / lx.reduce((s, v) => s + (v - mx) ** 2, 0)
}

function dSplit(kind: AtomKind, a: number): { eg: number; t2g: number; split: number } {
  const atom = makeAtom({ kind, side: SIDE, a, wall: WALL })
  const eg = lowestLevels({ atom, row: ROWS.Eg!, count: 1 }).values[0]! / atom.rydberg
  const t2g = lowestLevels({ atom, row: ROWS.T2g!, count: 1 }).values[0]! / atom.rydberg

  return { eg, t2g, split: Math.abs(t2g - eg) }
}

export default experiment({
  id: 'matter/stand-in-hydrogen-degeneracy',
  code: 'E-MTR-0002',
  title:
    'stand-in hydrogen on the husk: the n^2 degeneracy closes as the lattice refines, and the 3d level splits into Eg and T2g as a^-4 on the husk (the W(F4) k^4 law) against a^-2 on the plain cubic control',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const huskSlope = Math.log(anisotropy(huskBand, 0.1) / anisotropy(huskBand, 0.05)) / Math.log(2)
    const cubicSlope = Math.log(anisotropy(cubicBand, 0.1) / anisotropy(cubicBand, 0.05)) / Math.log(2)

    metrics.bandAnisotropySlopeHusk = huskSlope
    metrics.bandAnisotropySlopeCubic = cubicSlope
    metrics.bandAnisotropyHuskAt01 = anisotropy(huskBand, 0.1)
    metrics.bandAnisotropyCubicAt01 = anisotropy(cubicBand, 0.1)

    const shell = SHELL_RADII.map(a => {
      const atom = makeAtom({ kind: HUSK_ATOM, side: SIDE, a })
      const s = lowestLevels({ atom, row: ROWS.A1g!, count: 2 }).values.map(v => v / atom.rydberg)
      const p = lowestLevels({ atom, row: ROWS.T1u!, count: 1 }).values[0]! / atom.rydberg

      metrics[`shell_a${a}_E2sOverRy`] = s[1]!
      metrics[`shell_a${a}_E2pOverRy`] = p
      metrics[`shell_a${a}_D2`] = p - s[1]!

      return p - s[1]!
    })
    const shellExponent = -Math.log(shell[2]! / shell[1]!) / Math.log(SHELL_RADII[2]! / SHELL_RADII[1]!)

    metrics.shellExponent2to3 = shellExponent

    const husk = SPLIT_RADII.map(a => dSplit(HUSK_ATOM, a))
    const cubic = SPLIT_RADII.map(a => dSplit(CUBIC_ATOM, a))

    SPLIT_RADII.forEach((a, i) => {
      metrics[`husk_a${a}_EgOverRy`] = husk[i]!.eg
      metrics[`husk_a${a}_T2gOverRy`] = husk[i]!.t2g
      metrics[`husk_a${a}_split`] = husk[i]!.split
      metrics[`cubic_a${a}_EgOverRy`] = cubic[i]!.eg
      metrics[`cubic_a${a}_T2gOverRy`] = cubic[i]!.t2g
      metrics[`cubic_a${a}_split`] = cubic[i]!.split
    })

    const huskSplitSlope = slope(
      SPLIT_RADII,
      husk.map(h => h.split),
    )
    const cubicSplitSlope = slope(
      SPLIT_RADII,
      cubic.map(c => c.split),
    )

    metrics.splitSlopeHusk = huskSplitSlope
    metrics.splitSlopeCubic = cubicSplitSlope

    const gate1 = Math.abs(huskSlope - 4) <= 0.1 && Math.abs(cubicSlope - 2) <= 0.1
    const gate2 = shell[0]! > shell[1]! && shell[1]! > shell[2]! && shellExponent >= 2
    const gate3 = huskSplitSlope >= -5.5 && huskSplitSlope <= -3 && cubicSplitSlope >= -2.8 && cubicSplitSlope <= -1.2 && husk.every((h, i) => h.split < cubic[i]!.split)
    const status = gate1 && gate2 && gate3 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the stand-in's n = 2 shell closes as the lattice refines (2p - 2s = ${shell.map(v => v.toFixed(4)).join(', ')} Ry at a = ${SHELL_RADII.join(', ')}), and its 3d level splits into Eg and T2g as a^${huskSplitSlope.toFixed(2)} on the husk against a^${cubicSplitSlope.toFixed(2)} on the plain cubic control, where the W(F4) law predicts a^-4 and a^-2`,
      metrics: {
        ...metrics,
        gateBandLaw: gate1 ? 1 : 0,
        gateShellCloses: gate2 ? 1 : 0,
        gateSplitLaw: gate3 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN charge and source. The between-l split is dominated by the lattice core in the s levels (E-MTR-0004). The within-l split is read in a spherical cavity of radius 31 so the torus cube does not split Eg from T2g; the cavity shifts both rows alike up to its lattice roughness. Husk first; the bulk has no Coulomb 1 / r and so no shell to split. FIRST RUN (2026-09-26), status partial: the band law holds (slopes 3.991 and 1.998) and the n = 2 shell closes (2p - 2s = 0.317, 0.252, 0.072 Ry at a = 1.5, 2, 3, exponent 3.08). The 3d split is 20 to 45 times smaller on the husk than on the control at every a (6.8e-5 against 1.5e-3 Ry at a = 1, 1.5e-5 against 5.7e-4 at a = 2), but its fitted slope is -2.15 against the predicted -4 (control -1.42 against -2): the husk split stops falling between a = 1.5 and 2 (1.46e-5, 1.50e-5), the mark of a floor, most likely the cavity wall of radius 31 whose lattice-sphere roughness splits Eg from T2g once the 3d state reaches it (at a = 2 its <r> is 21). The law is not confirmed at these sizes; a larger cavity is the next test.',
    })
  },
})
