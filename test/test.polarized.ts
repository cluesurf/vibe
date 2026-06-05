// Test polarized split system
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { polarizedSplit } from '../code/code'

console.log('='.repeat(60))
console.log('Polarized Split System')
console.log(
  'When all children are Peace: parent→Pain, children→Pleasure',
)
console.log('='.repeat(60))

const root: Vibe = { tone: 0, nest: [] }
splitVibe(root, 'all-peace') // Start with all Peace

console.log('\nInitial State (all Peace):')
printVibe(root)

// Run for 20 moves to see the balancing behavior
for (let move = 1; move <= 20; move++) {
  advanceVibe(root, polarizedSplit)
  console.log(`\nMove ${move}:`)
  printVibe(root)

  // Analyze the state
  const counts = { pain: 0, peace: 0, pleasure: 0 }
  const analyze = (vibe: Vibe) => {
    if (vibe.tone === -1) counts.pain++
    else if (vibe.tone === 0) counts.peace++
    else counts.pleasure++
    for (const child of vibe.nest) analyze(child)
  }
  analyze(root)

  console.log(
    `  Total: ${counts.pain} Pain, ${counts.peace} Peace, ${counts.pleasure} Pleasure`,
  )

  // Check for interesting patterns
  if (root.nest.length > 0) {
    const allChildrenSame = root.nest.every(
      c => c.tone === root.nest[0]!.tone,
    )
    if (allChildrenSame && root.nest[0]!.tone === 0) {
      console.log('  → All children returned to Peace!')
    }
  }
}
