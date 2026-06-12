// P220 (gauge path): can any honeycomb coin realize D5 = so(10) (the root system the Standard Model needs,
// p217)? {3,4,3,4}'s coin is 24 directions = the 24-cell = D4 roots, the ONE place a honeycomb's neighbours form
// a root system, because the 24-cell is the unique non-simplex REGULAR polytope that is a root polytope, and it
// exists ONLY in 4D (the source of triality). We check, (a) the 24-cell vertices are closed under reflections
// (a genuine root system = D4), (b) D5 has 40 roots but the 5D regular polytopes have 6 / 32 / 10 vertices, none
// is 40, so NO regular honeycomb coin can carry D5. Run: npx tsx code/experiment/p220-d5-coin-search.ts

import { pathToFileURL } from 'node:url'

// 24-cell vertices = D4 roots: all +-e_i +-e_j (i<j) in 4D
function cell24(): number[][] { const R: number[][] = []; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = [0, 0, 0, 0]; v[i] = si; v[j] = sj; R.push(v) } return R }
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)
const eq = (a: number[], b: number[]): boolean => a.every((x, i) => x === b[i])
// reflection of v in the hyperplane perpendicular to root a: v - 2 (v.a)/(a.a) a
function reflect(v: number[], a: number[]): number[] { const f = (2 * dot(v, a)) / dot(a, a); return v.map((x, i) => x - f * a[i]!) }
function isRootSystem(R: number[][]): boolean {
  for (const a of R) for (const v of R) { const w = reflect(v, a); if (!R.some((r) => eq(r, w))) return false }
  return true
}

export function d5CoinSearch(): { cell24IsD4: boolean; d5RootCount: number; anyRegular5DHas40: boolean } {
  const R = cell24()
  const cell24IsD4 = isRootSystem(R) && R.length === 24
  console.log('P220 D5-coin search (the gauge path):')
  console.log(`  {3,4,3,4} coin = 24-cell vertices (24): closed under reflections (a genuine root system, = D4)? ${cell24IsD4}`)
  // D_n root count = 2n(n-1); regular polytope vertex counts by dimension
  const dRoots = (n: number): number => 2 * n * (n - 1)
  const d5RootCount = dRoots(5) // 40
  console.log(`  D5 = so(10) root count = ${d5RootCount} (the SM needs this, p217)`)
  // 5D regular polytopes: 5-simplex (6 vertices), 5-cube (32), 5-orthoplex (10). NONE has 40.
  const regular5D = [{ name: '5-simplex {3,3,3,3}', v: 6 }, { name: '5-cube {4,3,3,3}', v: 32 }, { name: '5-orthoplex {3,3,3,4}', v: 10 }]
  console.log('  5D regular polytopes (the only candidate honeycomb coins in 5D):')
  for (const p of regular5D) console.log(`    ${p.name}: ${p.v} vertices`)
  const anyRegular5DHas40 = regular5D.some((p) => p.v === d5RootCount)
  console.log(`  any 5D regular polytope with ${d5RootCount} vertices (= D5)? ${anyRegular5DHas40}`)
  console.log('')
  console.log('Reading:')
  console.log(' - The 24-cell (D4) is the UNIQUE non-simplex regular polytope that is a root system, and it exists')
  console.log('   ONLY in 4D (it is what gives triality). In 5D the regular polytopes are just simplex / cube /')
  console.log('   orthoplex (6 / 32 / 10 vertices), none is the 40-vertex D5 root polytope (which is not regular).')
  console.log(' - So NO regular honeycomb coin can carry D5 = so(10). The geometric coin family TOPS OUT at D4.')
  console.log('   The gauge path "grow the coin D4 -> D5" is BLOCKED in the honeycomb geometry, the Standard-Model')
  console.log('   gauge group is NOT reachable from a regular-honeycomb coin alone, it needs structure beyond the')
  console.log('   coin (a composite / internal index, or a non-regular substrate). Triality (D4, 4D-special) is the')
  console.log('   ceiling of what the geometry gives for free.')
  return { cell24IsD4, d5RootCount, anyRegular5DHas40 }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = d5CoinSearch()
  console.log(`SOLVED: 24-cell is D4 ${r.cell24IsD4}; no 5D regular polytope has ${r.d5RootCount} vertices (${r.anyRegular5DHas40}) -> no D5 coin, the honeycomb family tops out at D4.`)
}
