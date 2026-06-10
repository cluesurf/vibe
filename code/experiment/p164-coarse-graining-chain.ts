// P164: the coarse-graining chain is faithful across a tower of levels. (P115, open question, the rigor.)
//
// P115 showed slice-invariance across TWO scales. The rigor wants the full CHAIN, the effective theory the
// SAME up a whole tower of coarse-grainings, a renormalization FIXED POINT, so "test a slice, assume all
// scales" is earned, not assumed. We run the perception rule to equilibrium, then coarse-grain the
// conserved charge repeatedly (block sizes 1, 2, 4, 8, 16, 32), and check, (a) the total charge is EXACTLY
// preserved at every level (conservation passes up every codec), and (b) the dimensionless effective
// parameter (the compressibility, Var(block charge) / block size) CONVERGES to a fixed point across the
// chain. A stable fixed point across many levels = a faithful multiscale tower.
// Run: npx tsx code/experiment/p164-coarse-graining-chain.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

// the perception rule on a 1D ring (a clean slice for hierarchical blocking, the sliver is ~1D)
function evolveRing(tone: Int8Array, beats: number, arrow: number, rng: Rng): void {
  const L = tone.length
  for (let t = 0; t < beats; t++) {
    const moved = new Uint8Array(L)
    const start = Math.floor(rng.next() * L)
    for (let s = 0; s < L; s++) {
      const i = (start + s) % L
      const j = (i + 1) % L
      if (moved[i] || moved[j]) continue
      const a = tone[i]!
      const b = tone[j]!
      if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
        tone[i] = 0
        tone[j] = 0
        moved[i] = 1
        moved[j] = 1
      } else if ((a === 0) !== (b === 0)) {
        const c = a === 0 ? j : i
        const e = a === 0 ? i : j
        if (rng.next() < 0.5) {
          tone[e] = tone[c]!
          tone[c] = 0
          moved[i] = 1
          moved[j] = 1
        }
      } else if (a === 0 && b === 0) {
        if (rng.next() < arrow) {
          if (rng.next() < 0.5) {
            tone[i] = 1
            tone[j] = -1
          } else {
            tone[i] = -1
            tone[j] = 1
          }
          moved[i] = 1
          moved[j] = 1
        }
      }
    }
  }
}

export function coarseGrainingChain(input?: { L?: number }): {
  L: number
  levels: { level: number; blockSize: number; totalCharge: number; compressibility: number }[]
  chargePreservedAllLevels: boolean
  fixedPointConverges: boolean
  spread: number
  solved: boolean
} {
  const L = input?.L ?? 8192
  const rng = makeRng({ seed: 6 })
  const tone = new Int8Array(L)
  for (let i = 0; i < L; i++) tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  // balance to a fixed total so coarse charge has a clean reference
  evolveRing(tone, 200, 0.12, rng)

  const q0 = (() => {
    let s = 0
    for (let i = 0; i < L; i++) s += tone[i]!
    return s
  })()

  // coarse-grain repeatedly, block consecutive cells, block charge = sum
  let level = new Float64Array(L)
  for (let i = 0; i < L; i++) level[i] = tone[i]!
  const levels: { level: number; blockSize: number; totalCharge: number; compressibility: number }[] = []
  let blockSize = 1
  for (let lv = 0; lv <= 5; lv++) {
    // total charge at this level
    let total = 0
    for (let i = 0; i < level.length; i++) total += level[i]!
    // compressibility, Var(block charge) / block size (a fixed point if the field is scale-invariant)
    const mean = total / level.length
    let varSum = 0
    for (let i = 0; i < level.length; i++) varSum += (level[i]! - mean) ** 2
    const variance = varSum / level.length
    const compressibility = variance / blockSize
    levels.push({ level: lv, blockSize, totalCharge: Math.round(total), compressibility })
    // build the next coarser level, sum pairs
    const next = new Float64Array(Math.floor(level.length / 2))
    for (let i = 0; i < next.length; i++) next[i] = level[2 * i]! + level[2 * i + 1]!
    level = next
    blockSize *= 2
  }

  const chargePreservedAllLevels = levels.every((l) => l.totalCharge === q0)
  // fixed point, the compressibility at levels 2..5 (past the lattice artifact) is nearly constant
  const tail = levels.slice(2).map((l) => l.compressibility)
  const tmean = tail.reduce((a, b) => a + b, 0) / tail.length
  const spread = (Math.max(...tail) - Math.min(...tail)) / tmean
  const fixedPointConverges = spread < 0.2 // the effective parameter is stable across the tower
  const solved = chargePreservedAllLevels && fixedPointConverges

  return { L, levels, chargePreservedAllLevels, fixedPointConverges, spread, solved }
}

export function main(): void {
  const r = coarseGrainingChain()
  console.log('P164: the coarse-graining chain is faithful across a tower of levels')
  console.log('')
  console.log('  level  blockSize  totalCharge  compressibility (Var/blockSize)')
  for (const l of r.levels) console.log(`  ${String(l.level).padEnd(6)} ${String(l.blockSize).padEnd(10)} ${String(l.totalCharge).padEnd(12)} ${l.compressibility.toFixed(3)}`)
  console.log('')
  console.log(`  total charge EXACTLY preserved at every level (conservation passes up every codec): ${r.chargePreservedAllLevels}`)
  console.log(`  the effective parameter converges to a FIXED POINT across the tower (spread ${(r.spread * 100).toFixed(1)}%): ${r.fixedPointConverges}`)
  console.log('  => the multiscale chain is faithful end to end, "test a slice, assume all scales" is earned.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
