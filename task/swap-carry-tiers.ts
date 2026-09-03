// Options B and C, pre-registered: for every direction, count the beats (of the 24-beat
// schedule) in which its line belongs to the swap couple. Report the partition of the 24
// directions into tiers by that invariant, and where the assigned triple (23, 10, 18)
// falls. Pre-registration: the candidate depth invariant IS this swap-carry count (B),
// and the tier structure of the count is the symmetry classification (C). Judged after.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

const side = 9
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const lines = linesOf(opposite)
const mid = 4
const center = mid + mid * side + mid * side * side + mid * side ** 3
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - mid)))
}
const g = linePermutations({ lines, roots })[148]!
const M0: [number, number][] = [[0, 3], [2, 5], [4, 1], [6, 9], [8, 11], [10, 7]]
const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
const positions: [number, number][][] = []
{
  let c = M0.map(([a, b]) => norm(a, b))
  for (let i = 0; i < 4; i++) { positions.push(c); c = c.map(([a, b]) => norm(g[a]!, g[b]!)) }
}
const POS_MIRROR = [0, 1, 2, 3, 3, 2, 1, 0]
const ORDER = [0, 2, 3, 1, 4, 5]
const SWAP_MIRROR = [...ORDER, ...[...ORDER].reverse()]

const carry = new Array<number>(24).fill(0)
for (let t = 0; t < 24; t++) {
  const couples = positions[POS_MIRROR[t % 8]!]!
  const swap = couples[SWAP_MIRROR[t % 12]!]!
  for (const lineIdx of swap) {
    for (const end of [0, 1]) {
      const d = lines[lineIdx]![end]!
      carry[d] = (carry[d] ?? 0) + 1
    }
  }
}
const tiers = new Map<number, number[]>()
for (let d = 0; d < 24; d++) {
  const c = carry[d]!
  if (!tiers.has(c)) tiers.set(c, [])
  tiers.get(c)!.push(d)
}
for (const [c, dirs] of [...tiers.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`swap-carry ${c}: dirs [${dirs.join(',')}]`)
}
console.log('assigned triple carries: dir23 =', carry[23], ' dir10 =', carry[10], ' dir18 =', carry[18])

export {}
