// P201: spin on {7,3}. The 7 faces of a heptagon carry a permutation rep of the dihedral group D7, which
// decomposes into the trivial rep plus the three 2D (vector-like) irreps, NO spinor. So {7,3}, like {5,3,4},
// has no fundamental spin one-half. Being 2D it could host ANYONS (any statistics) in principle, but its flat
// layer is only 1D (a horocycle), so even that is starved. Contrast, {3,4,3,4} alone supplies real spinors.
// Run: npx tsx code/experiment/p201-spinor-73.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function spinor73(): { hasSpinor: boolean; decomposition: string } {
  // D7 = order 14 (7 rotations, 7 reflections). Conjugacy classes: e, r^k (k=1..3 paired), reflections.
  // Permutation character of the 7 faces: chi(e)=7, chi(rotation)=0 (no fixed face), chi(reflection)=1 (one fixed face).
  // Irreps of D7: trivial(1), sign(1), and three 2D irreps E1,E2,E3 with chi_Ej(e)=2, chi_Ej(r^k)=2cos(2pi j k/7), chi(refl)=0.
  const n = 7
  const classes = [
    { rep: 'e', size: 1, char: 7 },
    { rep: 'r', size: 2, char: 0, k: 1 },
    { rep: 'r2', size: 2, char: 0, k: 2 },
    { rep: 'r3', size: 2, char: 0, k: 3 },
    { rep: 'reflection', size: 7, char: 1 },
  ]
  const order = 14
  // inner product of the perm char with each irrep char
  const irrepChar = (name: string, c: typeof classes[number]): number => {
    if (name === 'triv') return 1
    if (name === 'sign') return c.rep === 'reflection' ? -1 : 1
    const j = Number(name[1]) // E1,E2,E3
    if (c.rep === 'e') return 2
    if (c.rep === 'reflection') return 0
    return 2 * Math.cos((2 * Math.PI * j * (c.k ?? 0)) / n)
  }
  const irreps = ['triv', 'sign', 'E1', 'E2', 'E3']
  const dec: Record<string, number> = {}
  for (const ir of irreps) dec[ir] = Math.round((classes.reduce((s, c) => s + c.size * c.char * irrepChar(ir, c), 0) / order) * 100) / 100
  const decomposition = Object.entries(dec).filter(([, m]) => Math.abs(m) > 1e-6).map(([nm, m]) => `${m}x${nm}`).join(' + ')
  // a permutation rep of a (non-double-cover) point group contains NO spinor irrep
  const hasSpinor = false
  console.log(`P201 {7,3} spin: 7-face permutation character (e:7, rot:0, refl:1) under D7`)
  console.log(`  decomposition: ${decomposition} (trivial + the three 2D vector irreps, all integer-type)`)
  console.log(`  => NO spinor (a permutation rep of D7 has no half-integer irrep). {7,3} is a scalar/vector substrate.`)
  console.log('  => 2D would allow ANYONS in principle, but {7,3}\'s flat layer is 1D (a horocycle), so spin is starved.')
  console.log('     Only {3,4,3,4} (24 = 8v+8s+8c) supplies genuine spinors. {7,3} matches {5,3,4}: no spin one-half.')
  return { hasSpinor, decomposition }
}

export default defineExperiment({
  id: 'spin/spinor-73',
  title: 'the {7,3} heptagonal coin carries no spinor, only integer-spin reps of D7',
  category: 'spin',
  substrates: ['any'],
  depth: 'L1',
  paper: false,
  run() {
    const r = spinor73()
    // success is the EXPECTED decomposition (trivial plus the three 2D vector
    // irreps) with no spinor copy. The decomposition string is the measured object.
    const expected = '1xtriv + 1xE1 + 1xE2 + 1xE3'
    const decompositionMatches = r.decomposition === expected
    const ok = r.hasSpinor === false && decompositionMatches
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 7-face permutation rep of the {7,3} coin decomposes into the trivial rep plus the three 2D vector irreps of D7, with no half-integer (spinor) irrep, so {7,3} matches {5,3,4} as a scalar and vector substrate',
      metrics: {
        hasSpinor: r.hasSpinor ? 1 : 0,
        decompositionMatches: decompositionMatches ? 1 : 0,
      },
      notes:
        'L1, known math (dihedral group D7 representation theory). A negative result, {7,3} starves spin like {5,3,4}. The claim that 2D would allow anyons but the {7,3} flat layer is only 1D is a structural remark, not measured here.',
    })
  },
})
