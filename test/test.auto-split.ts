// Test auto-split peace system
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { autoSplitPeace } from '../code/code'

console.log('='.repeat(60))
console.log('Auto-Split Peace System')
console.log('When all children reach Peace, each splits into 8')
console.log('='.repeat(60))

const root: Vibe = { tone: 0, nest: [] }
splitVibe(root, 'all-peace') // Start with all Peace to trigger split quickly

console.log('\nInitial State (all Peace):')
printVibe(root)

// Run for several moves to see the splitting behavior
for (let move = 1; move <= 1000; move++) {
  advanceVibe(root, autoSplitPeace)
  console.log(`\nMove ${move}:`)
  printVibe(root)

  // Count total vibes in the system
  let totalVibes = 1 // root
  const countVibes = (vibe: Vibe) => {
    totalVibes += vibe.nest.length
    for (const child of vibe.nest) {
      if (child.nest.length > 0) countVibes(child)
    }
  }
  countVibes(root)

  console.log(`  Total vibes in system: ${totalVibes}`)

  // Stop if system gets too large
  if (totalVibes > 100) {
    console.log('  (Stopping - system growing exponentially)')
    break
  }
}
