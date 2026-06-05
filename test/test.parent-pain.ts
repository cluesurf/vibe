// Test parent pain system
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { parentPain } from '../code/code'

console.log('='.repeat(60))
console.log('Parent Pain System')
console.log(
  'When all children are Peace: parent→Pain, children stay Peace',
)
console.log('='.repeat(60))

const root: Vibe = { tone: 0, nest: [] }
splitVibe(root, 'all-peace') // Start with all Peace

console.log('\nInitial State (all Peace):')
printVibe(root)

// Run for 15 moves to see the dynamics
for (let move = 1; move <= 15; move++) {
  advanceVibe(root, parentPain)
  console.log(`\nMove ${move}:`)
  printVibe(root)

  // Analyze the state
  const rootPeaceful = root.tone === 0
  const childrenPeaceful = root.nest.every(c => c.tone === 0)

  if (rootPeaceful && childrenPeaceful) {
    console.log('  → All peaceful, will trigger parent pain next move')
  } else if (root.tone === -1 && childrenPeaceful) {
    console.log('  → Pain parent with peaceful children')
  } else {
    const childTones = root.nest
      .map(c => (c.tone === -1 ? 'x' : c.tone === 0 ? 'y' : 'z'))
      .join('')
    console.log(
      `  → Mixed state: parent ${root.tone}, children [${childTones}]`,
    )
  }
}
