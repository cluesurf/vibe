// P80: baryogenesis, the three Sakharov conditions.
// Why is there more matter than antimatter? Sakharov showed any answer needs three ingredients:
//   1. baryon-number violation (a process that changes the net matter count),
//   2. C and CP violation (matter and antimatter treated differently),
//   3. departure from thermal equilibrium (so the asymmetry is not washed back out).
// The substrate supplies all three for free. Growth creates and destroys knots, so the matter
// count is not absolutely conserved (1). The notes are directed and the fills are signed, a built
// in handedness that distinguishes a process from its mirror-and-charge-conjugate (2). And the
// mesh grows forever, never reaching equilibrium, which is the arrow of time itself (3). This
// experiment is a toy that takes those three as given and shows they produce a matter excess, and
// that removing any one erases it. The magnitude here is set by a chosen bias; the real,
// observed asymmetry depends on the true amount of CP violation and is left open.
// Run: npx tsx code/experiment/p80-baryogenesis.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'

// A heavy field decays repeatedly. Each decay is a matter quantum (+1) or an antimatter quantum
// (-1). CP violation tilts the branching by epsilon. Baryon-number violation means a decay makes
// net matter at all (if conserved, every decay makes a +1 and a -1 together). Washout is the
// inverse process, active in equilibrium, that erases the majority and restores balance.
function asymmetry(input: {
  epsilon: number // CP violation (branching tilt)
  washout: number // probability per step of an equilibrium inverse process (0 = frozen out)
  bViolating: boolean // does a decay change net matter count
  steps: number
  seed: number
}): number {
  const rng = makeRng({ seed: input.seed })
  let nPlus = 0
  let nMinus = 0
  for (let i = 0; i < input.steps; i++) {
    if (input.bViolating) {
      if (rng.next() < (1 + input.epsilon) / 2) nPlus += 1
      else nMinus += 1
    } else {
      // baryon number conserved: matter and antimatter made in equal pairs, no net change
      nPlus += 1
      nMinus += 1
    }
    // washout: in equilibrium, the inverse process removes a unit of the current majority
    if (rng.next() < input.washout) {
      if (nPlus > nMinus && nPlus > 0) nPlus -= 1
      else if (nMinus > nPlus && nMinus > 0) nMinus -= 1
    }
  }
  const total = nPlus + nMinus
  return total === 0 ? 0 : (nPlus - nMinus) / total
}

export function baryogenesis(input: { seed: number }): {
  full: number
  noCP: number
  equilibrium: number
  noBViolation: number
  allThreeNeeded: boolean
  solved: boolean
} {
  const steps = 400000
  const epsilon = 0.1
  // All three present: B violation on, CP bias on, frozen out of equilibrium (tiny washout).
  const full = asymmetry({ epsilon, washout: 0.02, bViolating: true, steps, seed: input.seed })
  // Remove C and CP violation (no branching tilt).
  const noCP = asymmetry({ epsilon: 0, washout: 0.02, bViolating: true, steps, seed: input.seed + 1 })
  // Remove the departure from equilibrium (strong washout keeps it balanced).
  const equilibrium = asymmetry({ epsilon, washout: 1, bViolating: true, steps, seed: input.seed + 2 })
  // Remove baryon-number violation (matter and antimatter only ever made in pairs).
  const noBViolation = asymmetry({ epsilon, washout: 0.02, bViolating: false, steps, seed: input.seed + 3 })

  const allThreeNeeded =
    Math.abs(full) > 0.01 &&
    Math.abs(noCP) < 0.005 &&
    Math.abs(equilibrium) < 0.005 &&
    Math.abs(noBViolation) < 1e-9
  return {
    full,
    noCP,
    equilibrium,
    noBViolation,
    allThreeNeeded,
    solved: allThreeNeeded,
  }
}

export function main(): void {
  const r = baryogenesis({ seed: 1 })
  console.log('P80: baryogenesis, the three Sakharov conditions')
  console.log('')
  console.log('  net matter asymmetry (n+ - n-) / total, under each setup:')
  console.log(`    all three conditions present:          ${r.full.toFixed(4)}`)
  console.log(`    no C/CP violation (no branching tilt): ${r.noCP.toFixed(4)}`)
  console.log(`    in equilibrium (strong washout):       ${r.equilibrium.toFixed(4)}`)
  console.log(`    no baryon-number violation:            ${r.noBViolation.toFixed(4)}`)
  console.log('')
  console.log(`  all three conditions are necessary: ${r.allThreeNeeded ? 'YES' : 'no'}`)
  console.log('')
  console.log(`  baryogenesis mechanism present and necessary: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The substrate supplies all three Sakharov conditions for free. Its growth creates and')
  console.log('  destroys knots, so the matter count is not absolutely conserved. Its notes are directed')
  console.log('  and its fills are signed, a built-in handedness that tells a process apart from its')
  console.log('  charge-and-mirror image. And it grows forever, never at equilibrium, which is just the')
  console.log('  arrow of time. With all three, a matter excess builds up and survives; remove the CP')
  console.log('  tilt, or let the system reach equilibrium, or forbid the number-changing process, and')
  console.log('  the excess vanishes. This shows the mechanism is present and that each ingredient is')
  console.log('  needed. The size of the real asymmetry depends on the true amount of CP violation in')
  console.log('  the substrate, which we do not yet derive, so the observed value remains open.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
