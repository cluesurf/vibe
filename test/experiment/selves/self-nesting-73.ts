// P203: selves and nesting on the {7,3} 2D hyperbolic bulk. Like every hyperbolic BULK ({5,3,4}, {3,4,3,4}),
// radial coarse-graining LEAKS (the space is all-boundary), so the form-coherence persistence FALLS with scale
// and loses to a shuffle null, NO nesting tower in the bulk. And {7,3}'s flat layer is a 1D horocycle, too
// low-dimensional to host skyrmion-selves. So {7,3} is poor for selfhood, the opposite of its strength
// (computation, P204). Ported to {7,3}. Run: npx tsx code/experiment/p203-self-nesting-73.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

export function selfNesting73(): { tower: boolean; real: number[]; nul: number[] } {
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 16000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  // BFS tree (radial), parent + shell
  const dist = new Int32Array(N).fill(-1), par = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; par[w] = u; nf.push(w) } } fr = nf }
  // run the mod-3 wave from a seeded patch, then measure radial-cone coherence at several cone depths
  let cur = new Int8Array(N), prev = new Int8Array(N), nxt = new Int8Array(N)
  let rng = 9; const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  for (let i = 0; i < N; i++) if (dist[i]! < 4) cur[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1
  const series: Int8Array[] = []
  for (let b = 0; b < 40; b++) { for (let i = 0; i < N; i++) { let s = 0; for (let q = off[i]!; q < off[i + 1]!; q++) s += cur[adj[q]!]!; nxt[i] = ((((s - prev[i]!) % 3) + 3) % 3) as 0 | 1 | 2 } const t = prev; prev = cur; cur = nxt; nxt = t; if (b >= 10) series.push(cur.slice()) }
  // coarse-grain by ancestor at depth k (radial cone), net charge per cone; lag autocorrelation
  const ancestorAt = (i: number, depth: number): number => { let u = i; while (dist[u]! > depth) u = par[u]!; return u }
  const coarse = (t: Int8Array, depth: number): Map<number, number> => { const m = new Map<number, number>(); for (let i = 0; i < N; i++) { if (t[i] === 0) continue; const a = ancestorAt(i, depth); m.set(a, (m.get(a) ?? 0) + t[i]!) } return m }
  const corr = (a: Map<number, number>, b: Map<number, number>): number => { const keys = new Set([...a.keys(), ...b.keys()]); let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0; for (const k of keys) { const x = a.get(k) ?? 0, y = b.get(k) ?? 0; n++; sa += x; sb += y } const ma = sa / n, mb = sb / n; for (const k of keys) { const x = (a.get(k) ?? 0) - ma, y = (b.get(k) ?? 0) - mb; saa += x * x; sbb += y * y; sab += x * y } return saa > 1e-9 && sbb > 1e-9 ? sab / Math.sqrt(saa * sbb) : 0 }
  const depths = [2, 4, 6, 8], LAG = 8
  const persist = (depth: number, shuffle: boolean): number => {
    let acc = 0, c = 0
    for (let t = 0; t + LAG < series.length; t++) {
      let A = series[t]!, B = series[t + LAG]!
      if (shuffle) { const s = A.slice(); for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tt = s[i]!; s[i] = s[j]!; s[j] = tt } A = s }
      acc += corr(coarse(A, depth), coarse(B, depth)); c++
    }
    return Math.round((acc / c) * 100) / 100
  }
  const real = depths.map((d) => persist(d, false)), nul = depths.map((d) => persist(d, true))
  // a tower would RISE toward coarse (small depth); on the hyperbolic bulk it FALLS / loses to null
  const tower = real[0]! > real[real.length - 1]! + 0.15 && real[0]! > (nul[0]! ?? 0) + 0.2
  return { tower, real, nul }
}

export default defineExperiment({
  id: 'selves/self-nesting-73',
  title: 'the {7,3} hyperbolic bulk has no radial nesting tower',
  category: 'selves',
  substrates: ['73'],
  depth: 'L2',
  paper: false,
  run() {
    const r = selfNesting73()
    const realCoarse = r.real[0] ?? 0
    const realFine = r.real[r.real.length - 1] ?? 0
    const nullCoarse = r.nul[0] ?? 0
    const ok = !r.tower
    return verdict({
      status: ok ? 'pass' : 'partial',
      claim:
        'radial coarse-grained coherence on the {7,3} hyperbolic bulk does not rise toward coarse scales nor beat a shuffle null, so there is no nesting tower, the same as the other hyperbolic bulks',
      metrics: {
        coherenceCoarse: realCoarse,
        coherenceFine: realFine,
        nullCoarse,
        tower: r.tower ? 1 : 0,
      },
      control: {
        realCoarse,
        shuffledNullCoarse: nullCoarse,
      },
      notes:
        'L2 with a shuffle null control. The honest finding is the expected negative, no bulk nesting, because the hyperbolic bulk is all-boundary and the {7,3} flat layer is only 1D. Relies on a pseudo-random initial fill, so it is an ensemble statement, not a property of the deterministic rule.',
    })
  },
})
