// The texture theorem test: predict each species pair's shared-cell count from ROOT
// GEOMETRY alone, then compare against the measured overlap matrix. Prediction rule
// (pre-registered): each species' cloud lives in the 2-plane through the seed spanned by
// its root's two nonzero axes; the predicted shared count is the size of the intersection
// of the two planes within the settled window: same plane -> full overlap, planes sharing
// one axis -> a line (predict >= 2 shared possible), planes sharing no axis -> the seed
// point only (predict <= 1), with the massless species predicted zero everywhere (it
// departs) and any species whose cloud leaves the seed region predicted zero.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'

const side = 5
const mesh = d4Mesh({ side })
const mid = 2
const center = mid + mid * side + mid * 25 + mid * 125
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > 2.5 ? d - 5 : d < -2.5 ? d + 5 : d)
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - mid)))
}
const axesOf = (dir: number): number[] => roots[dir]!.map((v, a) => (v !== 0 ? a : -1)).filter(a => a >= 0)

const species = [0, 4, 8, 18, 23, 12, 9]
// measured shared counts from tmp/overlap.log (side 15 instrument)
const measured: Record<string, number> = {
  '0-4': 0, '0-8': 0, '0-18': 0, '0-23': 0, '0-12': 0, '0-9': 0,
  '4-8': 0, '4-18': 1, '4-23': 1, '4-12': 1, '4-9': 1,
  '8-18': 0, '8-23': 0, '8-12': 0, '8-9': 0,
  '18-23': 1, '18-12': 1, '18-9': 2,
  '23-12': 1, '23-9': 1,
  '12-9': 1,
}
console.log('species axes:', species.map(d => `d${d}:{${axesOf(d).join(',')}}`).join(' '))
console.log('\npair | shared axes | measured shared')
for (let i = 0; i < species.length; i++) for (let j = i + 1; j < species.length; j++) {
  const a = species[i]!, b = species[j]!
  const sharedAxes = axesOf(a).filter(x => axesOf(b).includes(x)).length
  console.log(`d${a}-d${b}: sharedAxes=${sharedAxes} measured=${measured[`${a}-${b}`]}`)
}
