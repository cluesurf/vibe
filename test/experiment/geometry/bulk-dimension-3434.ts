// P195: spectral dimension of the {3,4,3,4} substrate. The 4D bulk reads ~4 at small scale (a genuine 4D
// hyperbolic bulk), calibrated against 4D and 3D grids; the cusp {4,3,4} is flat 3D. Ported from the
// throwaway probe. Run: npx tsx code/experiment/p195-bulk-dimension-3434.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type G = { N: number; off: Int32Array; adj: Int32Array }

function gridGraph(dims: number[]): G {
  const D = dims.length, N = dims.reduce((a, b) => a * b, 1)
  const idx = (c: number[]): number => { let i = 0; for (let d = 0; d < D; d++) i = i * dims[d]! + c[d]!; return i }
  const coord = (i: number): number[] => { const c = Array(D).fill(0); let r = i; for (let d = D - 1; d >= 0; d--) { c[d] = r % dims[d]!; r = (r / dims[d]!) | 0 } return c }
  const al: number[][] = Array.from({ length: N }, () => [])
  for (let i = 0; i < N; i++) { const c = coord(i); for (let d = 0; d < D; d++) for (const s of [-1, 1]) { const c2 = c.slice(); c2[d]! += s; if (c2[d]! >= 0 && c2[d]! < dims[d]!) al[i]!.push(idx(c2)) } }
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + al[i]!.length
  const adj = new Int32Array(off[N]!); let p = 0; for (let i = 0; i < N; i++) for (const w of al[i]!) adj[p++] = w
  return { N, off, adj }
}
function toG(symbol: number[], maxCells: number): G {
  const g = buildCellGraph({ symbol: symbol as never, maxCells })
  const off = new Int32Array(g.cellCount + 1); for (let i = 0; i < g.cellCount; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[g.cellCount]!); let p = 0; for (let i = 0; i < g.cellCount; i++) for (const w of g.neighbors[i]!) adj[p++] = w
  return { N: g.cellCount, off, adj }
}
function specDim(g: G, start: number, T: number): { t: number; ds: number }[] {
  let p = new Float64Array(g.N); p[start] = 1; let np = new Float64Array(g.N); const P: number[] = []
  for (let t = 0; t < T; t++) {
    P.push(p[start]!); np.fill(0)
    for (let i = 0; i < g.N; i++) { const pi = p[i]!; if (!pi) continue; const d = g.off[i + 1]! - g.off[i]!; const sh = (0.5 * pi) / d; np[i] = np[i]! + 0.5 * pi; for (let q = g.off[i]!; q < g.off[i + 1]!; q++) np[g.adj[q]!] = np[g.adj[q]!]! + sh }
    const tmp = p; p = np; np = tmp
  }
  const o: { t: number; ds: number }[] = []
  for (let t = 2; t < T - 2; t += 2) o.push({ t, ds: (-2 * (Math.log(P[t + 2]!) - Math.log(P[t - 2]!))) / (Math.log(t + 2) - Math.log(t - 2)) })
  return o
}
const show = (n: string, r: { t: number; ds: number }[]): string => `${n}: ` + r.filter((x) => [4, 8, 16].includes(x.t)).map((x) => `t${x.t}=${x.ds.toFixed(2)}`).join('  ')

export function bulkDimension(): { d4: number; d3: number; bulk: number } {
  const g4 = gridGraph([13, 13, 13, 13]), g3 = gridGraph([40, 40, 40])
  const r4 = specDim(g4, ((6 * 13 + 6) * 13 + 6) * 13 + 6, 24), r3 = specDim(g3, (20 * 40 + 20) * 40 + 20, 24)
  const g34 = toG([3, 4, 3, 4], 50000)
  let c = 0, best = -1; for (let i = 0; i < g34.N; i++) { const d = g34.off[i + 1]! - g34.off[i]!; if (d > best) { best = d; c = i } }
  const rb = specDim(g34, c, 24)
  const get = (r: { t: number; ds: number }[]): number => r.find((x) => x.t === 4)!.ds
  return { d4: get(r4), d3: get(r3), bulk: get(rb) }
}

// The {3,4,3,4} bulk is genuinely four dimensional. We measure the small-scale spectral
// dimension of the cell graph by a lazy random walk return probability, and it reads near
// 4, the same as a 4D grid and clearly above a 3D grid (the calibration controls). The 4D
// grid reading ~4 and the 3D grid reading ~3 are the controls that give the {3,4,3,4}
// number its meaning. This is a measured property of a known tessellation, an established
// mathematical fact, so L1.
export default defineExperiment({
  id: 'geometry/bulk-dimension-3434',
  title: 'the {3,4,3,4} bulk reads spectral dimension ~4, a genuine 4D substrate',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = bulkDimension()
    const calibrationOk = Math.abs(r.d4 - 4) < 0.6 && Math.abs(r.d3 - 3) < 0.6
    const bulkIs4D = Math.abs(r.bulk - 4) < 0.7
    const ok = calibrationOk && bulkIs4D
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the small-scale spectral dimension of the {3,4,3,4} bulk reads near 4, matching a 4D grid and above a 3D grid',
      metrics: {
        bulkDimension: r.bulk,
        grid4dDimension: r.d4,
        grid3dDimension: r.d3,
      },
      control: {
        grid4dDimension: r.d4,
        grid3dDimension: r.d3,
      },
      notes:
        'L1, the dimension of a known tessellation measured by a lazy-walk return exponent. The 4D and 3D grids are the calibration controls. Not a discovery, an established geometric fact.',
    })
  },
})
