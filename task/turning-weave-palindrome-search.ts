// Sweep the palindromic turning weave's design space: position walk phase a (8), swap
// walk phase b (12), and the swap visiting order (all 720 orders of the six couples,
// mirrored). Gates: connected 12-node swap-edge graph AND a CPT survivor.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { PAIR_FORWARD, PAIR_INVERSE } from '@/code/rule/collision'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

type Tone = -1 | 0 | 1
const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)
type Beat = { couples: [number, number][]; swapIdx: number }

const SIDE = 5
const mesh = d4Mesh({ side: SIDE })
const opposite = meshOpposites(mesh)
const lines = linesOf(opposite)
const mid = 2
const center = mid + mid * SIDE + mid * 25 + mid * 125
const coord = (c: number, a: number): number => Math.floor(c / SIDE ** a) % SIDE
const wrap = (d: number): number => (d > 2.5 ? d - 5 : d < -2.5 ? d + 5 : d)
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - coord(center, a))))
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

const applyBeat = (b: Beat, forward: boolean, v: Int8Array): Int8Array => {
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneAway = (x: Tone, y: Tone): boolean => x === 0 && y !== 0
  const empty = (x: Tone, y: Tone): boolean => x === 0 && y === 0
  const s = Int8Array.from(v)
  for (let k = 0; k < 6; k++) {
    const line = lines[b.couples[k]![0]!]!
    const wire = lines[b.couples[k]![1]!]!
    const swap = (): void => {
      const a0 = s[line[0]]! as Tone, a1 = s[line[1]]! as Tone
      const w0 = s[wire[0]]! as Tone, w1 = s[wire[1]]! as Tone
      if ((loneAway(a0, a1) && empty(w0, w1)) || (loneAway(w0, w1) && empty(a0, a1))) {
        s[line[0]] = w0; s[line[1]] = w1; s[wire[0]] = a0; s[wire[1]] = a1
      }
    }
    const clock = (): void => {
      const image = table[pairKey(s[wire[0]]! as Tone, s[wire[1]]! as Tone)]!
      s[wire[0]] = image[0]; s[wire[1]] = image[1]
    }
    if (k === b.swapIdx) { swap(); clock(); swap() } else { clock() }
  }
  return s
}
const sample = (n: number): Int8Array => {
  const v = new Int8Array(24)
  for (let i = 0; i < 24; i++) v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1
  return v
}

const connectedEdges = (beats: Beat[]): boolean => {
  const edges = new Set<string>()
  for (const b of beats) edges.add(b.couples[b.swapIdx]!.join('-'))
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)))
  const nodes = new Set<number>()
  for (const e of edges) {
    const [a, b] = e.split('-').map(Number)
    nodes.add(a!).add(b!)
    parent[find(a!)] = find(b!)
  }
  return nodes.size === 12 && new Set(Array.from({ length: 12 }, (_, i) => find(i))).size === 1
}

const cptSurvives = (beats: Beat[]): boolean => {
  const T = beats.length
  for (let c = 0; c < T; c++) {
    let ok = true
    outer: for (let t = 0; t < T && ok; t++) {
      const sigma = ((c - t) % T + T) % T
      for (let n = 0; n < 20; n++) {
        const v = sample(n * T + t)
        const rhs = applyBeat(beats[t]!, true, v)
        const w = Int8Array.from(v, x => -x as Tone)
        const m2 = applyBeat(beats[sigma]!, false, w)
        for (let d = 0; d < 24; d++) if (-m2[d]! !== rhs[d]!) { ok = false; break outer }
      }
    }
    if (ok) return true
  }
  return false
}

// enumerate palindromic swap orders: order o of the six couples, mirrored
const orders: number[][] = []
{
  const build = (acc: number[], rest: number[]): void => {
    if (rest.length === 0) { orders.push(acc); return }
    for (let i = 0; i < rest.length; i++) build([...acc, rest[i]!], rest.filter((_, j) => j !== i))
  }
  build([], [0, 1, 2, 3, 4, 5])
}

let found: { oi: number; a: number; b: number }[] = []
for (let oi = 0; oi < orders.length && found.length < 5; oi++) {
  const o = orders[oi]!
  const swapMirror = [...o, ...[...o].reverse()]
  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 12; b++) {
      const beats: Beat[] = []
      for (let t = 0; t < 24; t++) {
        beats.push({
          couples: positions[POS_MIRROR[(t + a) % 8]!]!,
          swapIdx: swapMirror[(t + b) % 12]!,
        })
      }
      if (!connectedEdges(beats)) continue
      if (!cptSurvives(beats)) continue
      found.push({ oi, a, b })
      if (found.length >= 5) break
    }
    if (found.length >= 5) break
  }
}
console.log('winners (order index, pos phase, swap phase):', found)
if (found.length > 0) {
  const { oi, a, b } = found[0]!
  console.log('winning order:', orders[oi])
}
