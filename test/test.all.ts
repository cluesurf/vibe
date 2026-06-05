// Test different rule systems

import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'

import {
  immediateAdoption,
  gradualTransition,
  gradualWithMerge,
  stagnationBreaker,
  faceToFace,
  cyclingTones,
  peaceBiased,
  balancedChildren,
  naturalBalance,
  type Code,
} from '../code/code'

function runSimulation(
  system: Code,
  initialPattern:
    | 'alternating'
    | 'all-pain'
    | 'all-pleasure'
    | 'all-peace',
  moves: number,
) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`System: ${system.name}`)
  console.log(`Initial Pattern: ${initialPattern}`)
  console.log(`${'='.repeat(60)}\n`)

  const root: Vibe = { tone: 0, nest: [] }
  splitVibe(root, initialPattern)

  console.log('Initial State:')
  printVibe(root)

  for (let move = 1; move <= moves; move++) {
    advanceVibe(root, system)
    console.log(`\nAfter move ${move}:`)
    printVibe(root)

    // Stop if converged to single state
    if (root.nest.length === 0) {
      console.log('(Converged to single vibe)')
      break
    }
  }
}

// Test configurations
const systems: Code[] = [
  immediateAdoption,
  gradualTransition,
  gradualWithMerge,
  stagnationBreaker,
  faceToFace,
  cyclingTones,
  peaceBiased,
  balancedChildren,
  naturalBalance,
]

const patterns: ('alternating' | 'all-pain')[] = ['alternating']

// Run tests
for (const pattern of patterns) {
  for (const system of systems) {
    runSimulation(system, pattern, 10)
  }
}
