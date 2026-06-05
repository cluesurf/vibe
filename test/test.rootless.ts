// Test rootless peace systems
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { rootlessPeace, rootlessPeaceGradual } from '../code/code'

const systems = [
  { code: rootlessPeace, name: 'Rootless Peace (Immediate)' },
  { code: rootlessPeaceGradual, name: 'Rootless Peace (Gradual)' },
]

for (const { code, name } of systems) {
  console.log('\n' + '='.repeat(60))
  console.log(name)
  console.log('Root (no parent) forced to Peace, children follow rules')
  console.log('='.repeat(60))

  const root: Vibe = { tone: 0, nest: [] }
  splitVibe(root, 'alternating')

  console.log('\nInitial State:')
  printVibe(root)

  // Run for 10 moves
  for (let move = 1; move <= 10; move++) {
    advanceVibe(root, code)
    console.log(`\nMove ${move}:`)
    printVibe(root)

    // Check if pattern stabilized
    if (move > 2) {
      const allPeace = root.nest.every(c => c.tone === 0)
      const oscillating =
        root.nest.filter((c, i) =>
          i % 2 === 0 ? c.tone === -1 : c.tone === 1,
        ).length === 8

      if (allPeace) {
        console.log('  → All converged to Peace')
        break
      } else if (oscillating) {
        console.log('  → Stable oscillation pattern')
      }
    }
  }
}
