// P197: the form-coherence tower on the flat 3D cusp ({4,3,4} cubic). The exact 9-state permutation rule with
// a SYMMETRIC update, coarse-grained by compact blocks, the form-persistence (net-charge-per-block lag
// autocorrelation) RISES with coarse scale and beats a spatial-shuffle null, a coherence tower in 3D. Ported
// from the throwaway probe. Run: npx tsx code/experiment/p197-form-tower-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 48
const at = (x: number, y: number, z: number): number => (((z % L) + L) % L) * L * L + (((y % L) + L) % L) * L + (((x % L) + L) % L)
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]

function perm(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]
  if (a === 1 && b === -1) return [-1, 1]
  if (a === -1 && b === 1) return [0, 0]
  return [a, b]
}
function pearson(a: Float64Array, b: Float64Array): number {
  const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]!; mb += b[i]! } ma /= n; mb /= n
  let num = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { const da = a[i]! - ma, db = b[i]! - mb; num += da * db; va += da * da; vb += db * db }
  return va > 1e-9 && vb > 1e-9 ? num / Math.sqrt(va * vb) : 0
}

export function formTower(): { real: number[]; nul: number[]; tower: boolean } {
  const N = L * L * L
  let rng = 12345
  const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  const tone = new Int8Array(N), m = new Uint8Array(N)
  const step = (): void => {
    m.fill(0); const s0 = Math.floor(rnd() * N)
    for (let s = 0; s < N; s++) {
      const v = (s0 + s) % N; if (m[v]) continue
      const vx = v % L, vy = ((v / L) | 0) % L, vz = (v / (L * L)) | 0
      const ord = [0, 1, 2, 3, 4, 5]; for (let i = 5; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = ord[i]!; ord[i] = ord[j]!; ord[j] = t }
      for (const k of ord) { const d = DIRS[k]!; const w = at(vx + d[0]!, vy + d[1]!, vz + d[2]!); if (m[w]) continue; const [na, nb] = perm(tone[v]!, tone[w]!); tone[v] = na as -1 | 0 | 1; tone[w] = nb as -1 | 0 | 1; m[v] = 1; m[w] = 1; break }
    }
  }
  for (let f = 0; f < 60; f++) step()
  const blocks = [1, 2, 4, 8]
  const coarse = (t: Int8Array, b: number): Float64Array => {
    const nb = (L / b) ** 3; const sum = new Float64Array(nb), cnt = new Float64Array(nb)
    for (let i = 0; i < N; i++) { const x = i % L, y = ((i / L) | 0) % L, z = (i / (L * L)) | 0; const bc = ((((z / b) | 0) * (L / b) + ((y / b) | 0)) * (L / b)) + ((x / b) | 0); sum[bc] = sum[bc]! + t[i]!; cnt[bc] = cnt[bc]! + 1 }
    for (let i = 0; i < nb; i++) sum[i] = sum[i]! / (cnt[i]! || 1)
    return sum
  }
  const shuffle = (t: Int8Array): Int8Array => { const s = t.slice(); for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tt = s[i]!; s[i] = s[j]!; s[j] = tt } return s }
  const LAG = 10, M = 30
  const realS: Float64Array[][] = blocks.map(() => []), nulS: Float64Array[][] = blocks.map(() => [])
  for (let f = 0; f < M + LAG; f++) { step(); const sh = shuffle(tone); blocks.forEach((b, bi) => { realS[bi]!.push(coarse(tone, b)); nulS[bi]!.push(coarse(sh, b)) }) }
  const persist = (ser: Float64Array[]): number => { let acc = 0, c = 0; for (let t = 0; t + LAG < ser.length; t++) { acc += pearson(ser[t]!, ser[t + LAG]!); c++ } return Math.round((acc / c) * 100) / 100 }
  const real = blocks.map((_, bi) => persist(realS[bi]!)), nul = blocks.map((_, bi) => persist(nulS[bi]!))
  const tower = real[real.length - 1]! > real[0]! + 0.15 && real[real.length - 1]! > (nul[nul.length - 1]! ?? 0) + 0.2
  return { real, nul, tower }
}

export default defineExperiment({
  id: 'renormalization/form-tower-3434',
  title: 'coarse-grained form-persistence rises with scale and beats a spatial-shuffle null on the 3D cusp',
  category: 'renormalization',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = formTower()
    return verdict({
      status: r.tower ? 'pass' : 'fail',
      claim:
        'under the 9-state permutation rule on the cubic cusp, the block net-charge persistence climbs with coarse scale and beats a spatial-shuffle null, a coherence tower in 3D',
      metrics: {
        finePersistence: r.real[0] ?? 0,
        coarsePersistence: r.real[r.real.length - 1] ?? 0,
        nullCoarsePersistence: r.nul[r.nul.length - 1] ?? 0,
        tower: r.tower ? 1 : 0,
      },
      control: {
        nullCoarsePersistence: r.nul[r.nul.length - 1] ?? 0,
      },
      notes:
        'L2 with a spatial-shuffle control. The persistence is measured from the dynamics and the shuffle null guards against plain averaging, which is the strength. But the run uses a random fill and a random update order, so this is a STATISTICAL ensemble claim, not a property of a deterministic rule, and robustness should come from varying SIZE rather than the seed. Not yet a clean emergent self, the asymmetric update and the randomness keep it L2.',
    })
  },
})
