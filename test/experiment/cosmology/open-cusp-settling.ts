// Open problem 4 (dynamical settling into the cusp): we know the cusp IS flat 3D space and matter is
// stable, but do we ever see matter DYNAMICALLY concentrate onto the flat horospherical layer from generic
// initial conditions, using only the base rule? This runs the actual second-order mod-3 wave rule on the
// {3,4,3,4} bulk from random initial tone, and measures whether the activity concentrates toward the cusp
// (low Busemann) over time, or stays uniform (churn). An honest test, reported either way.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/open-cusp-settling.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'

function main(): void {
  console.log('Open problem 4: does matter settle onto the cusp from generic init (the pure rule)?')
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 20000 })
  const n = g.cellCount

  // Busemann toward the farthest cell's ideal point: low |b| ~ near the cusp layer, high |b| ~ deep bulk.
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  let far = 0
  let fr = -1
  for (let i = 0; i < n; i++) { const r = norm(g.coords[i]!); if (r > fr) { fr = r; far = i } }
  const xi = g.coords[far]!.map((v) => v / norm(g.coords[far]!))
  const bus = g.coords.map((x) => {
    let d2 = 0
    for (let k = 0; k < x.length; k++) d2 += (x[k]! - xi[k]!) ** 2
    return Math.log(d2 / Math.max(1e-12, 1 - x.reduce((s, v) => s + v * v, 0)))
  })
  // the cusp band = cells with |Busemann - level| < half (a flat horospherical slab)
  const half = 0.4
  const inBand = (i: number): boolean => Math.abs(bus[i]! - 0) < half
  const bandCount = bus.filter((_, i) => inBand(i)).length
  const bandShare = bandCount / n

  // second-order mod-3 wave rule, random initial tone, run and measure activity per region over time
  const cur = new Int8Array(n)
  const prev = new Int8Array(n)
  const rng = makeRng({ seed: 7 })
  for (let i = 0; i < n; i++) { cur[i] = rng.nextInt({ max: 3 }) as 0 | 1 | 2; prev[i] = rng.nextInt({ max: 3 }) as 0 | 1 | 2 }

  const off = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[n]!)
  { let p = 0; for (let i = 0; i < n; i++) for (const w of g.neighbors[i]!) adj[p++] = w }

  // activity = excitation (current != 0). measure the band's SHARE of total activity vs its share of cells.
  // ratio > 1 and rising => matter concentrates on the cusp (settling); ratio ~ 1 => uniform (churn).
  const bandActivityRatio = (): number => {
    let bandAct = 0
    let totalAct = 0
    for (let i = 0; i < n; i++) { const a = cur[i] !== 0 ? 1 : 0; totalAct += a; if (inBand(i)) bandAct += a }
    return totalAct > 0 ? bandAct / totalAct / bandShare : 1
  }

  const r0 = bandActivityRatio()
  const beats = 400
  for (let t = 0; t < beats; t++) {
    const next = new Int8Array(n)
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let p = off[i]!; p < off[i + 1]!; p++) s += cur[adj[p]!]!
      next[i] = ((s + 27 - prev[i]!) % 3) as 0 | 1 | 2
    }
    prev.set(cur)
    cur.set(next)
  }
  const r1 = bandActivityRatio()

  console.log(`\n  cusp band: ${bandCount}/${n} cells (${(100 * bandShare).toFixed(1)}% of the bulk)`)
  console.log(`  band activity ratio (band's share of activity / band's share of cells):`)
  console.log(`    t=0   : ${r0.toFixed(3)}`)
  console.log(`    t=${beats} : ${r1.toFixed(3)}`)
  console.log(`  (ratio ~ 1 => activity stays UNIFORM, no concentration; ratio rising > 1 => settling onto cusp)`)

  const settled = r1 > 1.3 * r0 && r1 > 1.3
  console.log(`\nVerdict: matter ${settled ? 'CONCENTRATES on the cusp' : 'does NOT settle, it CHURNS (activity stays uniform)'}.`)
  if (!settled) {
    console.log('  This is the HONEST NEGATIVE expected for a single reversible conserving rule: with no')
    console.log('  dissipation it cannot concentrate energy from equilibrium init. Dynamical settling onto')
    console.log('  the cusp would need either special (low-entropy) initial conditions OR the candidate')
    console.log('  fifth ingredient (higher-order binding, open problem 3). So problems 3 and 4 share a root.')
    console.log('  The theory REFUSES to add a fifth thing, so this stays an honest open gap, not a patched result.')
  }
  console.log('See note/research/vibe/notes/theory-v0.6.0/paper/draft-v1/25-open-problems.md')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
