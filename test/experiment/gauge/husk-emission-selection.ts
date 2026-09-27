// E-FRC-0191. Dipole selection rules on the husk: which transitions of the STAND-IN hydrogen emit into the exactly
// linear husk light (E-FRC-0179's linear rule), against the rule the husk's point group gives. The atom is a
// STAND-IN (E-MTR-0001); nothing here is L3.
//
// PREDICTION, written before the first run. The husk's point group about the source is O_h (48 elements), the
// photon's dipole transforms as T1u, so a transition i -> f is dipole-allowed exactly when the O_h product
// Gamma_i x T1u contains Gamma_f (computed from the characters, code/measure/stand-in-atom). In continuum language
// that is Delta l = +-1 with a parity change; O_h adds its own: T1u x T1u holds Eg, so a p level may fall to the
// Eg half of a d level. A forbidden transition can still emit through the higher multipoles the full current
// carries (every multipole is kept here), suppressed by powers of (photon wave number x atom size), and a 0 -> 0
// transition (A1g -> A1g) is forbidden in the continuum at every multipole order, so only the lattice's cubic
// anisotropy could make it emit at all.
//
// Method: the stand-in atom at a = 3 on a side-64 husk torus: A1g levels 1s, 2s, 3s, T1u levels 2p, 3p, and the
// lowest Eg and T2g levels (3d). For every pair, upper to lower, the golden rule of E-FRC-0190 with the full
// transition current (lifted onto the husk links, 16 x 32 rays), summed over the lower multiplet's O_h partners,
// against the same golden rule with the current's k = 0 value alone (the dipole). CONTROL: a uniform field
// eps x (eps = 1e-4 per dock) breaks the x reflection; the 2s-like level then mixes with 2p and its fall to the
// ground level must switch on. No random numbers anywhere.
//
// Gates, fixed before the first run:
// 1. ALLOWED: every O_h dipole-allowed transition emits, its full rate within 10 percent of its dipole rate
// 2. FORBIDDEN: every O_h dipole-forbidden transition emits at under 1e-2 of the 2p -> 1s rate, and every
//    A1g -> A1g transition under 1e-4 of it
// 3. CONTROL: with the field, the 2s-like level's fall to the ground level rises to over 1e-2 of the 2p -> 1s rate
// Pass: all three. Partial: 1 and 3. Fail: otherwise.
//
// Depth L2: group theory (L1) confirmed on a stand-in atom's full lattice current.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { huskSymbolizer, readHuskStencil, sphereGrid } from '@/code/measure/husk-emission'
import { bandGradient, currentAmplitude, goldenRuleCurrents, transitionCurrent, type VectorAmplitude } from '@/code/measure/stand-in-light'
import { HUSK_ATOM, OH, ROWS, character, coulombBox, irrepWeight, lowestLevels, makeAtom, multipletBasis, type Atom, type Irrep, type Row } from '@/code/measure/stand-in-atom'

const SIDE = 64
const A = 3
const FIELD = 1e-4

type Level = { readonly name: string; readonly irrep: Irrep; readonly energy: number; readonly vector: Float64Array }

// the multiplicity of f in i x T1u
function allowed(i: Irrep, f: Irrep): boolean {
  let s = 0

  for (const g of OH) {
    s += character(i, g) * character('T1u', g) * character(f, g)
  }

  return Math.round(s / 48) > 0
}

// the full and dipole rates of upper -> each vector of `lower`
function rates(input: { atom: Atom; upper: Float64Array; lower: Float64Array[]; omega: number; symbol: ReturnType<typeof huskSymbolizer>; grid: ReturnType<typeof sphereGrid> }): { full: number; dipole: number } {
  const { atom, upper, lower, omega, symbol, grid } = input
  const gradient = bandGradient(atom)
  const full: ((k: readonly number[]) => VectorAmplitude)[] = []
  const dipole: ((k: readonly number[]) => VectorAmplitude)[] = []

  for (const f of lower) {
    const amplitude = currentAmplitude(SIDE, transitionCurrent(atom, gradient, f, upper))
    const zero = amplitude([0, 0, 0])

    full.push(amplitude)
    dipole.push(() => zero)
  }

  const r = goldenRuleCurrents({ symbol, currents: [...full, ...dipole], omega, grid, lift: 6 }).rates

  return {
    full: r.slice(0, lower.length).reduce((s, v) => s + v, 0),
    dipole: r.slice(lower.length).reduce((s, v) => s + v, 0),
  }
}

export default experiment({
  id: 'gauge/husk-emission-selection',
  code: 'E-FRC-0191',
  title:
    'dipole selection rules on the husk: the stand-in hydrogen emits into the exactly linear husk light on exactly the transitions the husk point group O_h allows (Gamma_f in Gamma_i x T1u), forbidden ones only through weak higher multipoles, 0 -> 0 not measurably, and a field that breaks the reflection switches 2s -> 1s on',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const stencil = readHuskStencil(8)
    const symbol = huskSymbolizer(stencil)
    const grid = sphereGrid(16, 32)
    const atom = makeAtom({ kind: HUSK_ATOM, side: SIDE, a: A })
    const levels: Level[] = []
    const add = (irrep: Irrep, names: string[]): void => {
      const lv = lowestLevels({ atom, row: ROWS[irrep]!, count: names.length })

      names.forEach((name, i) => levels.push({ name, irrep, energy: lv.values[i]!, vector: lv.vectors[i]! }))
    }

    add('A1g', ['1s', '2s', '3s'])
    add('T1u', ['2p', '3p'])
    add('Eg', ['3dEg'])
    add('T2g', ['3dT2g'])
    levels.forEach(l => (metrics[`E_${l.name}_OverRy`] = l.energy / atom.rydberg))

    const bases = new Map(levels.map(l => [l.name, multipletBasis(l.vector, SIDE)]))
    const table: { from: string; to: string; allowed: boolean; full: number; dipole: number; zeroToZero: boolean }[] = []

    for (const upper of levels) {
      for (const lower of levels) {
        if (lower.energy >= upper.energy) {
          continue
        }

        const r = rates({ atom, upper: upper.vector, lower: bases.get(lower.name)!, omega: upper.energy - lower.energy, symbol, grid })

        table.push({ from: upper.name, to: lower.name, allowed: allowed(upper.irrep, lower.irrep), full: r.full, dipole: r.dipole, zeroToZero: upper.irrep === 'A1g' && lower.irrep === 'A1g' })
      }
    }

    const reference = table.find(t => t.from === '2p' && t.to === '1s')!.full
    let gate1 = true
    let gate2 = true

    for (const t of table) {
      const key = `${t.from}_to_${t.to}`

      metrics[`${key}_allowed`] = t.allowed ? 1 : 0
      metrics[`${key}_fullOverReference`] = t.full / reference
      metrics[`${key}_fullOverDipole`] = t.dipole > 0 ? t.full / t.dipole : 0

      if (t.allowed) {
        gate1 = gate1 && t.full > 0 && Math.abs(t.full / t.dipole - 1) <= 0.1
      } else {
        gate2 = gate2 && t.full / reference < (t.zeroToZero ? 1e-4 : 1e-2)
      }
    }

    // the control: a uniform field along x, the rows keep only the y and z reflections and the y-z swap
    const starkPotential = coulombBox(HUSK_ATOM, SIDE, atom.alpha)

    for (let z = 0; z < SIDE; z++) {
      for (let y = 0; y < SIDE; y++) {
        for (let x = 0; x < SIDE; x++) {
          starkPotential[x + SIDE * (y + SIDE * z)] = starkPotential[x + SIDE * (y + SIDE * z)]! + FIELD * (x - SIDE / 2)
        }
      }
    }

    const stark = makeAtom({ kind: HUSK_ATOM, side: SIDE, a: A, potential: starkPotential })
    const starkRow: Row = { irrep: 'A1g', parity: [0, 1, 1], permutation: { kind: 'swap', axes: [1, 2], sign: 1 }, angular: x => 1 + 0.3 * x }
    const starkLevels = lowestLevels({ atom: stark, row: starkRow, count: 3 })
    const weights = starkLevels.vectors.map(v => irrepWeight('A1g', v, SIDE))
    const twoS = weights[1]! >= weights[2]! ? 1 : 2
    const starkRate = rates({
      atom: stark,
      upper: starkLevels.vectors[twoS]!,
      lower: [starkLevels.vectors[0]!],
      omega: starkLevels.values[twoS]! - starkLevels.values[0]!,
      symbol,
      grid,
    }).full

    metrics.stark_twoSLikeA1gWeight = weights[twoS]!
    metrics.stark_twoSToGroundOverReference = starkRate / reference

    const gate3 = starkRate / reference > 1e-2
    const status = gate1 && gate2 && gate3 ? 'pass' : gate1 && gate3 ? 'partial' : 'fail'
    const forbidden = table.filter(t => !t.allowed)
    const worstForbidden = Math.max(...forbidden.map(t => t.full / reference))

    return verdict({
      status,
      claim: `of ${table.length} downward transitions of the stand-in hydrogen at a = 3, the ${table.length - forbidden.length} that O_h allows emit at full / dipole ${Math.min(...table.filter(t => t.allowed).map(t => t.full / t.dipole)).toFixed(3)} to ${Math.max(...table.filter(t => t.allowed).map(t => t.full / t.dipole)).toFixed(3)}, the ${forbidden.length} it forbids at most ${worstForbidden.toExponential(2)} of 2p -> 1s, and a field of 1e-4 per dock lifts 2s -> 1s to ${(starkRate / reference).toExponential(2)} of it`,
      metrics: {
        ...metrics,
        worstForbiddenOverReference: worstForbidden,
        gateAllowed: gate1 ? 1 : 0,
        gateForbidden: gate2 ? 1 : 0,
        gateFieldControl: gate3 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN atom in the LINEAR rule (the exactly linear husk leapfrog). The allowed set is computed from O_h characters before any rate. Husk only: the bulk has no hydrogen (its Coulomb field falls as 1 / r^2). FIRST RUN (2026-09-26), status fail. The O_h rule sorts the 21 transitions exactly at the dipole level (every forbidden dipole is zero to 1e-30 of the allowed), and the field control switches 2s -> 1s on (7.5e-2). But the full current carries the higher multipoles strongly, for the reason E-FRC-0190 found: the stand-in is not small against husk light (c = 0.2023, k a near 1 at a = 3). So allowed transitions ran at full / dipole 0.67 to 1.00 (gate 1 asked 10 percent), and forbidden ones reached 1.8e-2 of 2p -> 1s (3d -> 1s, quadrupole; gate 2 asked 1e-2), and A1g -> A1g 2s -> 1s emits at 2.0e-4 (asked 1e-4), a single-photon 0 -> 0 transition that the continuum forbids at every order and that only the lattice anisotropy permits. The selection rule holds as a symmetry; its suppression does not, at this ratio of atom to wavelength.',
    })
  },
})
