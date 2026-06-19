// The coarse-grained (renormalized) signed-majority rule on a blocked graph. After a tone field
// is partitioned into clusters, the effective dynamics on the cluster (super) tones is again a
// signed-majority rule, but with renormalized couplings: a per-cluster SELF-coupling Jself (the
// cluster's internal cohesion, the inertia that holds its majority) and per-pair CROSS-couplings
// Jcross (the real summed fills between clusters, magnitude kept). The renormalized macro-step is
// the mean-field closure (a member is approximated by its cluster majority):
//   super'(c) = sign( Jself(c) * super(c) + sum_d Jcross(c,d) * super(d) )
// The naive macro-step keeps only the SIGN of the cross-coupling and drops the self-coupling, the
// lossy coarse rule it improves on.

import { Graph } from '@/code/tool/graph'

const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

export interface Effective {
  Jself: Float64Array
  nbr: number[][]
  Jcross: Float64Array[]
}

// Effective couplings on a clustered graph. Jself(c) = sum of intra-cluster fills (cohesion),
// Jcross(c,d) = real sum of cross-cluster fills (the renormalized coupling, magnitude kept).
export function effectiveCouplings(
  g: Graph,
  fills: Int8Array[],
  cl: Int32Array,
  K: number,
): Effective {
  const Jself = new Float64Array(K)
  const crossMap = new Map<string, number>()
  const nbrSet: Set<number>[] = Array.from(
    { length: K },
    () => new Set<number>(),
  )
  for (let v = 0; v < g.size; v++) {
    const cv = cl[v] ?? 0
    const row = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      const cw = cl[w] ?? 0
      const f = fl[k] ?? 0
      if (cv === cw) {
        Jself[cv] = (Jself[cv] ?? 0) + f
      } else {
        nbrSet[cv]?.add(cw)
        const key = `${cv},${cw}`
        crossMap.set(key, (crossMap.get(key) ?? 0) + f)
      }
    }
  }
  const nbr = nbrSet.map(s => [...s])
  const Jcross = nbr.map((row, c) =>
    Float64Array.from(row, d => crossMap.get(`${c},${d}`) ?? 0),
  )
  return { Jself, nbr, Jcross }
}

// The naive macro-rule (signed-majority on the SIGN of the cross-couplings, no self-coupling).
export function naiveMacroStep(
  superTone: Int8Array,
  eff: Effective,
): Int8Array {
  const K = superTone.length
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) {
    let h = 0
    const nb = eff.nbr[c] ?? []
    const jc = eff.Jcross[c] ?? new Float64Array(0)
    for (let k = 0; k < nb.length; k++) {
      h += sign(jc[k] ?? 0) * (superTone[nb[k] ?? 0] ?? 0)
    }
    out[c] = sign(h)
  }
  return out
}

// The renormalized macro-rule (signed-majority with self-coupling and real-magnitude cross-couplings).
export function renormMacroStep(
  superTone: Int8Array,
  eff: Effective,
): Int8Array {
  const K = superTone.length
  const out = new Int8Array(K)
  for (let c = 0; c < K; c++) {
    let h = (eff.Jself[c] ?? 0) * (superTone[c] ?? 0)
    const nb = eff.nbr[c] ?? []
    const jc = eff.Jcross[c] ?? new Float64Array(0)
    for (let k = 0; k < nb.length; k++) {
      h += (jc[k] ?? 0) * (superTone[nb[k] ?? 0] ?? 0)
    }
    out[c] = sign(h)
  }
  return out
}
