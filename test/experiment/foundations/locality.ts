// P1 (the open part): is the Hamiltonian local?
// We already know the reversible rule is local and its energy is bounded below.
// Here we build H = i log U exactly and expand it in the Pauli basis, then report
// how its operator weight is distributed over interaction range. A profile that
// concentrates at short range and decays means H is (quasi-)local, completing P1.
// See note/questions/roadmap.md (A1).
// Run: npx tsx code/experiment/p1-locality.ts

import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import {
  makeStateSpace,
  permutationOfRule,
} from '@/code/operator/evolution'
import {
  hamiltonianMatrix,
  pauliLocalityProfile,
} from '@/code/operator/ca-hamiltonian'
import { Alphabet } from '@/code/tone/alphabet'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Positive control: flip a single cell (s -> s XOR 1). The principal-branch log
// is H = (pi/2)(I - X_0), whose only non-identity term is X_0, range 1. The
// profile must come out entirely at range 1, validating that the measure detects
// locality. (Flipping ALL cells would instead give the nonlocal n-body term
// (pi/2)(I - X^{tensor n}), a useful reminder that the log of a local U is not
// automatically local.)
function controlLocality(cells: number): {
  fractions: Float64Array
  localityLength: number
} {
  const n = 1 << cells
  const perm = new Int32Array(n)

  for (let s = 0; s < n; s++) {
    perm[s] = s ^ 1
  }

  const profile = pauliLocalityProfile({
    matrix: hamiltonianMatrix({ perm }),
    cells,
  })

  return {
    fractions: profile.weightByRange,
    localityLength: profile.localityLength,
  }
}

function localityOf(cells: number): {
  cells: number
  fractions: Float64Array
  localityLength: number
} {
  const substrate = lattice({
    dimension: 1,
    extent: cells,
    signature: 'riemannian',
  })

  const alphabet: Alphabet = { form: 'boolean' }
  const space = makeStateSpace({ cells, alphabet })
  const rule = reversibleEvenOdd({
    name: 'xor-parity',
    local: ({ self, neighborhood }) => {
      let parity = 0

      for (const t of neighborhood) {
        parity ^= t & 1
      }

      return (self ^ parity) & 1
    },
  })

  const perm = permutationOfRule({ rule, substrate, space })
  const h = hamiltonianMatrix({ perm })
  const profile = pauliLocalityProfile({ matrix: h, cells })

  return {
    cells,
    fractions: profile.weightByRange,
    localityLength: profile.localityLength,
  }
}

export default experiment({
  id: 'foundations/locality',
  code: 'E-FND-0032',
  title:
    'the Pauli locality profile of a reversible Hamiltonian, validated by a provable control',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const control = controlLocality(6)
    const xor = localityOf(8)
    const ok = Math.abs(control.localityLength - 1) < 1e-6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the locality measure returns range one for the single-cell flip whose log is provably range one, validating the profile, and reports the spread of the XOR-parity Hamiltonian',
      metrics: {
        controlLength: control.localityLength,
        xorLength: xor.localityLength,
      },
      notes:
        'L2, this validates the locality measure against a control with a known answer (range one) and reports the XOR-parity spread, it does not by itself establish a quasi-local Hamiltonian for a propagating rule',
    })
  },
})
