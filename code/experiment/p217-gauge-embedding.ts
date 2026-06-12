// P217 (upper half, gauge): does the Standard-Model gauge algebra su(3) x su(2) x u(1) fit inside D4 = so(8),
// the {3,4,3,4} coin symmetry? The SM semisimple part is the root system A2 (+) A1 (su(3) x su(2)). It embeds
// iff D4 contains an A2 sub-root-system PLUS a root orthogonal to all of it (the commuting A1). We test D4
// against D5 = so(10) (the minimal SO(N) GUT). Clean finite root-system computation.
// Run: npx tsx code/experiment/p217-gauge-embedding.ts

import { pathToFileURL } from 'node:url'

// D_n roots: all +-e_i +-e_j (i<j), norm^2 = 2
function dnRoots(n: number): number[][] {
  const R: number[][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const si of [1, -1]) for (const sj of [1, -1]) {
    const v = new Array<number>(n).fill(0); v[i] = si; v[j] = sj; R.push(v)
  }
  return R
}
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)
const eq = (a: number[], b: number[]): boolean => a.every((x, i) => x === b[i])
const has = (R: number[][], v: number[]): boolean => R.some((r) => eq(r, v))

// does D_n contain A2 (+) A1 (su(3) x su(2)), i.e. an A2 with a root orthogonal to all of it?
function smEmbeds(n: number): { a2: boolean; a2a1: boolean; example?: string } {
  const R = dnRoots(n)
  let a2Found = false
  for (const a of R) for (const b of R) {
    if (dot(a, b) !== -1) continue // 120 degrees -> A2 generator pair
    const ab = a.map((x, i) => x + b[i]!)
    if (!has(R, ab)) continue // a+b must be a root (A2 closes)
    a2Found = true
    // look for an A1 orthogonal to the whole A2 (orthogonal to a and b => to a+b too)
    for (const c of R) {
      if (dot(c, a) === 0 && dot(c, b) === 0) {
        return { a2: true, a2a1: true, example: `A2={+-(${a.join('')}),+-(${b.join('')}),...}  orthogonal A1=+-(${c.join('')})` }
      }
    }
  }
  return { a2: a2Found, a2a1: false }
}

export function gaugeEmbedding(): { d4: boolean; d5: boolean } {
  console.log('P217 gauge embedding, does su(3)xsu(2)xu(1) (= A2 (+) A1 (+) u(1)) fit in the coin symmetry?')
  const r4 = smEmbeds(4), r5 = smEmbeds(5)
  console.log(`  D4 = so(8)  ({3,4,3,4} coin): ${dnRoots(4).length} roots, has A2 = ${r4.a2}, has A2(+)A1 (the SM) = ${r4.a2a1}`)
  console.log(`  D5 = so(10) (minimal GUT):    ${dnRoots(5).length} roots, has A2 = ${r5.a2}, has A2(+)A1 (the SM) = ${r5.a2a1}`)
  if (r5.example) console.log(`    so(10) example: ${r5.example}`)
  console.log('')
  console.log('Reading:')
  console.log(' - D4 has an A2 (su(3)) but NO root orthogonal to it, so su(3) x su(2) does NOT embed in so(8).')
  console.log('   (D4 roots have exactly two non-zero entries, so none is orthogonal to a full A2.) So the')
  console.log('   STANDARD MODEL gauge group does NOT fit in the {3,4,3,4} coin symmetry alone. Rank-matching (4=4)')
  console.log('   was necessary but not sufficient. An honest NEGATIVE for "gauge from D4/triality alone".')
  console.log(' - D5 = so(10) DOES contain su(3) x su(2) x u(1) (the minimal SO(N) GUT). And D4 (+) one node = D5,')
  console.log('   so the constructive path is to ENLARGE the coin from D4 to D5, then so(10) -> SM. Triality (the')
  console.log('   three 8-reps of D4) remains a suggestive hint for THREE generations, but the gauge GROUP needs D5.')
  return { d4: r4.a2a1, d5: r5.a2a1 }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gaugeEmbedding()
  console.log(`SOLVED: SM fits in D4=so(8) ${r.d4} (NO), in D5=so(10) ${r.d5} (YES). The coin symmetry must grow D4->D5 for the SM.`)
}
