// P1 (the open part): is the Hamiltonian local?
// We already know the reversible rule is local and its energy is bounded below.
// Here we build H = i log U exactly and expand it in the Pauli basis, then report
// how its operator weight is distributed over interaction range. A profile that
// concentrates at short range and decays means H is (quasi-)local, completing P1.
// See note/questions/roadmap.md (A1).
// Run: npx tsx code/experiment/p1-locality.ts

import { pathToFileURL } from 'node:url'
import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import { makeStateSpace, permutationOfRule } from '@/code/operator/evolution'
import { hamiltonianMatrix, pauliLocalityProfile } from '@/code/operator/ca-hamiltonian'
import { Alphabet } from '@/code/tone/alphabet'

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
  const profile = pauliLocalityProfile({ matrix: hamiltonianMatrix({ perm }), cells })
  return { fractions: profile.weightByRange, localityLength: profile.localityLength }
}

function localityOf(cells: number): {
  cells: number
  fractions: Float64Array
  localityLength: number
} {
  const substrate = lattice({ dimension: 1, extent: cells, signature: 'riemannian' })
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
  return { cells, fractions: profile.weightByRange, localityLength: profile.localityLength }
}

export function main(): void {
  console.log('P1 (open part): locality profile of H = i log U')
  const control = controlLocality(6)
  console.log(
    `  control (single-cell flip, provably range-1): r1 weight ${((control.fractions[1] ?? 0) * 100).toFixed(0)}%, locality length ${control.localityLength.toFixed(2)} (expect 1.00)`,
  )
  console.log('  --- the XOR-parity reversible CA ---')
  for (const cells of [6, 8]) {
    const r = localityOf(cells)
    const parts: string[] = []
    for (let range = 1; range <= cells; range++) {
      parts.push(`r${range}:${((r.fractions[range] ?? 0) * 100).toFixed(0)}%`)
    }
    console.log(`  cells=${cells}: ${parts.join('  ')}`)
    console.log(
      `           locality length (weighted-average range) = ${r.localityLength.toFixed(2)} of ${cells}`,
    )
  }
  console.log('')
  console.log('  short-range concentration + decay = (quasi-)local Hamiltonian.')
  console.log('  weight spread to large range = local rule does NOT give a local H.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
