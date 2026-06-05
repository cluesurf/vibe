// Demonstration of Rootless Peace system
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { rootlessPeace } from '../code/code'

console.log('='.repeat(60))
console.log('Rootless Peace - Extended Demo')
console.log('Root stays at Peace (no parent) while children oscillate')
console.log('='.repeat(60))

const root: Vibe = { tone: 0, nest: [] }
splitVibe(root, 'alternating')

console.log('\nInitial State:')
printVibe(root)

// Run for 20 moves to see the pattern
for (let move = 1; move <= 20; move++) {
  advanceVibe(root, rootlessPeace)
  console.log(`\nMove ${move}:`)
  printVibe(root)

  // Show a summary of the state distribution
  const children = root.nest
  const counts = { pain: 0, peace: 0, pleasure: 0 }
  for (const child of children) {
    if (child.tone === -1) counts.pain++
    else if (child.tone === 0) counts.peace++
    else counts.pleasure++
  }
  console.log(
    `  Distribution: ${counts.pain} pain, ${counts.peace} peace, ${counts.pleasure} pleasure`,
  )
}
