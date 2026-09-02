// Two-clock schedule: partition at beat t = g^t(M0), swap couple = the ((t mod 6))-th
// couple of that partition (couples enumerated in M0 order, transported by g). Over
// period lcm(p,6) collect the swap edges; need connectivity over all 12 lines.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

const mesh = d4Mesh({ side: 5 })
const opposite = meshOpposites(mesh)
const lines = linesOf(opposite)
const mid = 2
const center = mid + mid * 5 + mid * 25 + mid * 125
const coord = (c: number, a: number): number => Math.floor(c / 5 ** a) % 5
const wrap = (d: number): number => (d > 2.5 ? d - 5 : d < -2.5 ? d + 5 : d)
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - coord(center, a))))
}
const perms = linePermutations({ lines, roots })
const M0: [number, number][] = [[0, 3], [2, 5], [4, 1], [6, 9], [8, 11], [10, 7]]
const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
const key = (m: [number, number][]): string =>
  m.map(([a, b]) => norm(a, b).join('-')).sort().join(',')

type Hit = { gi: number; p: number; edges: number; nodes: number; connected: boolean }
const hits: Hit[] = []

for (let gi = 0; gi < perms.length; gi++) {
  const g = perms[gi]!
  // matching period p
  let m = M0.map(([a, b]) => norm(a, b))
  let p = 0
  for (let t = 1; t <= 24; t++) {
    m = m.map(([a, b]) => norm(g[a]!, g[b]!))
    if (key(m) === key(M0)) { p = t; break }
  }
  if (p === 0) continue
  const period = (p * 6) / (p % 2 === 0 && 6 % 2 === 0 ? 2 : 1) === 0 ? 0 : lcm(p, 6)
  function lcm(a: number, b: number): number {
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
    return (a * b) / gcd(a, b)
  }
  // ordered couples transported by g each beat: couples_t = g^t applied to M0 in order
  let couples = M0.map(([a, b]) => norm(a, b))
  const edges = new Set<string>()
  const nodes = new Set<number>()
  const T = lcm(p, 6)
  for (let t = 0; t < T; t++) {
    const swap = couples[t % 6]!
    edges.add(swap.join('-'))
    nodes.add(swap[0]).add(swap[1])
    couples = couples.map(([a, b]) => norm(g[a]!, g[b]!))
  }
  // connectivity over swap edges only, all 12 nodes required
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)))
  for (const e of edges) {
    const [a, b] = e.split('-').map(Number)
    parent[find(a!)] = find(b!)
  }
  const connected =
    nodes.size === 12 &&
    new Set(Array.from({ length: 12 }, (_, i) => find(i))).size === 1
  hits.push({ gi, p, edges: edges.size, nodes: nodes.size, connected })
}

const profiles = new Map<string, number>()
for (const h of hits) {
  const s = `p=${h.p} T=${h.p % 6 === 0 ? h.p : (h.p * 6) / [6, 1, 2, 3, 2, 1, 6][Math.min(h.p, 6)]!} edges=${h.edges} nodes=${h.nodes} connected=${h.connected}`
  profiles.set(s, (profiles.get(s) ?? 0) + 1)
}
for (const [s, n] of [...profiles.entries()].sort()) console.log(`${s}  x${n}`)
const winners = hits.filter(h => h.connected)
console.log('\nconnected winners:', winners.length)
console.log(winners.slice(0, 6))
