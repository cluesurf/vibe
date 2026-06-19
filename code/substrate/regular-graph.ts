import { Rng } from '@/code/tool/rng'

// A random degree-regular graph via the CONFIGURATION MODEL, returned as a flat
// edge list (eu, ev) plus CSR adjacency (offsets, adj). Every node starts with
// `degree` stubs; the stubs are shuffled (Fisher-Yates) and paired, self-loops
// dropped. Typed arrays only, so millions of nodes fit in a few hundred MB. The
// labeled hyperbolic-expander proxy used when the exact tiling caps out at scale:
// right local degree and expander character, no exact coordinates.
export function buildRegularGraph(input: {
  n: number
  degree: number
  rng: Rng
}): {
  eu: Int32Array
  ev: Int32Array
  offsets: Int32Array
  adj: Int32Array
} {
  const { n, degree, rng } = input
  const stubs = new Int32Array(n * degree)
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < degree; d++) {
      stubs[i * degree + d] = i
    }
  }

  for (let i = stubs.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const t = stubs[i]!
    stubs[i] = stubs[j]!
    stubs[j] = t
  }

  const m = Math.floor(stubs.length / 2)
  const eu = new Int32Array(m)
  const ev = new Int32Array(m)
  let e = 0
  const deg2 = new Int32Array(n)
  for (let k = 0; k < m; k++) {
    const a = stubs[2 * k]!
    const b = stubs[2 * k + 1]!
    if (a === b) {
      continue
    }

    eu[e] = a
    ev[e] = b
    e++
    deg2[a]!++
    deg2[b]!++
  }

  const euT = eu.slice(0, e)
  const evT = ev.slice(0, e)
  const offsets = new Int32Array(n + 1)
  for (let i = 0; i < n; i++) {
    offsets[i + 1] = offsets[i]! + deg2[i]!
  }

  const adj = new Int32Array(offsets[n]!)
  const cur = offsets.slice(0, n)
  for (let k = 0; k < e; k++) {
    const a = euT[k]!
    const b = evT[k]!
    adj[cur[a]!++] = b
    adj[cur[b]!++] = a
  }

  return { eu: euT, ev: evT, offsets, adj }
}
