// Run the committed vibe rule (ternary signed-majority, symmetric fills) on a substrate, the top
// rung of the integer ladder. Returns whether it is reproducible (determined) and that it evolves
// (the model actually runs, not a trivial fixed point from the start).

import { makeRng } from '@/code/tool/rng'
import { Graph } from '@/code/tool/graph'

export function runModel(
  g: Graph,
  seed: number,
): {
  deterministic: boolean
  evolves: boolean
  nonzeroFraction: number
} {
  const rng = makeRng({ seed })
  const indexOf = g.neighbors.map(row => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }

    return m
  })
  const fills = g.neighbors.map(row => new Int8Array(row.length))
  for (let v = 0; v < g.size; v++) {
    const fv = fills[v]
    const row = g.neighbors[v] ?? new Uint32Array(0)
    if (!fv) {
      continue
    }

    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (w > v) {
        const f = rng.nextInt({ max: 3 }) - 1
        fv[k] = f
        const fw = fills[w]
        const kk = indexOf[w]?.get(v)
        if (fw && kk !== undefined) {
          fw[kk] = f
        }
      }
    }
  }

  const init = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) {
    init[i] = rng.nextInt({ max: 3 }) - 1
  }

  const run = (): Int8Array => {
    let tone = Int8Array.from(init)
    for (let b = 0; b < 30; b++) {
      const next = new Int8Array(g.size)
      for (let v = 0; v < g.size; v++) {
        const nb = g.neighbors[v] ?? new Uint32Array(0)
        const fl = fills[v] ?? new Int8Array(0)
        let h = 0
        for (let k = 0; k < nb.length; k++) {
          h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
        }

        next[v] = h > 0 ? 1 : h < 0 ? -1 : 0
      }

      tone = next
    }

    return tone
  }

  const a = run()
  const b = run()
  let deterministic = true
  let evolves = false
  let nonzero = 0
  for (let i = 0; i < g.size; i++) {
    if (a[i] !== b[i]) {
      deterministic = false
    }

    if (a[i] !== init[i]) {
      evolves = true
    }

    if (a[i] !== 0) {
      nonzero++
    }
  }

  return { deterministic, evolves, nonzeroFraction: nonzero / g.size }
}
