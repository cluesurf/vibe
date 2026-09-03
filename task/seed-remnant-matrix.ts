// The full 24-species overlap matrix: compute every settled field (union window), then
// every pairwise shared count. Test the seed-remnant theorem: keeper pairs share the seed;
// count any exceptions in both directions. Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 15
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const mid = 7
const seedCell = mid + mid * side + mid * side * side + mid * side ** 3

const fields: Set<number>[] = []
for (let dir = 0; dir < 24; dir++) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const acc = new Set<number>()
  for (let t = 0; t < 34; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === 20) {
      const slot = seedCell * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= 28) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) acc.add(Math.floor(i / 24))
      }
    }
  }
  fields.push(acc)
  process.stdout.write(`d${dir}:${acc.has(seedCell) ? 'K' : 'l'}${acc.size} `)
}
console.log()
const keeper = fields.map(f => f.has(seedCell))
let kkPairs = 0, kkWithSeed = 0, lPairs = 0, lZero = 0
const exceptions: string[] = []
for (let a = 0; a < 24; a++) for (let b = a + 1; b < 24; b++) {
  let shared = 0
  for (const c of fields[a]!) if (fields[b]!.has(c)) shared++
  if (keeper[a] && keeper[b]) {
    kkPairs++
    if (shared >= 1 && fields[a]!.has(seedCell) && fields[b]!.has(seedCell)) kkWithSeed++
  } else {
    lPairs++
    if (shared === 0) lZero++
    else exceptions.push(`d${a}-d${b}:${shared}`)
  }
}
console.log(`keeper-keeper pairs: ${kkPairs}, all sharing the seed: ${kkWithSeed}`)
console.log(`leaver-involving pairs: ${lPairs}, exactly zero: ${lZero}`)
console.log(`exceptions (leaver pairs with overlap): ${exceptions.length ? exceptions.join(' ') : 'NONE'}`)
