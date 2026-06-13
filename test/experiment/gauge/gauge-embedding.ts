// P217 (upper half, gauge): does the Standard-Model gauge algebra su(3) x su(2) x u(1) fit inside D4 = so(8),
// the {3,4,3,4} coin symmetry? The SM semisimple part is the root system A2 (+) A1 (su(3) x su(2)). It embeds
// iff D4 contains an A2 sub-root-system PLUS a root orthogonal to all of it (the commuting A1). We test D4
// against D5 = so(10) (the minimal SO(N) GUT). Clean finite root-system computation.
// Run: npx tsx code/experiment/p217-gauge-embedding.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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
  const r4 = smEmbeds(4), r5 = smEmbeds(5)
  if (r5.example)   return { d4: r4.a2a1, d5: r5.a2a1 }
}

export default defineExperiment({
  id: 'gauge/gauge-embedding',
  title: 'the Standard Model algebra does not fit in D4 = so(8) but does fit in D5 = so(10)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = gaugeEmbedding()
    const ok = r.d4 === false && r.d5 === true
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Standard Model semisimple algebra A2 plus A1 has no embedding in the coin symmetry D4 = so(8) but does embed in D5 = so(10)',
      metrics: {
        fitsInD4: r.d4 ? 1 : 0,
        fitsInD5: r.d5 ? 1 : 0,
      },
      notes:
        'L1, known math, and an honest negative for the coin. Rank matching 4 = 4 was necessary but not sufficient. The {3,4,3,4} coin symmetry alone cannot carry the Standard Model gauge group, it must grow D4 to D5.',
    })
  },
})
