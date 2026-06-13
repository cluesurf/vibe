// Avalanche sizes by damage spreading. Take a settled background state, seed a
// single perturbation, and relax both copies under the same dynamics with matched
// RNG streams. The damage (Hamming distance between the two copies) is the
// avalanche. `mode` selects whether the avalanche size is the FINAL damage (a
// fixed-window cascade) or the PEAK damage with early-termination when it heals (a
// terminating excursion, the directed-percolation observable). Returns the sorted
// sizes plus the background nonzero density.

export function toneDensity(t: Int8Array): number {
  let nz = 0
  for (let i = 0; i < t.length; i++) if (t[i] !== 0) nz++
  return nz / t.length
}

export function avalancheSizes<R extends { next: () => number }>(input: {
  base: Int8Array
  steps: number
  trials: number
  perturbSeed: number
  streamSeed: number
  makeRng: (seed: number) => R
  relax: (state: Int8Array, rng: R) => void
  mode: 'final' | 'peak'
}): number[] {
  const { base, steps, trials, perturbSeed, streamSeed, makeRng, relax, mode } = input
  const N = base.length
  const sizes: number[] = []
  for (let tr = 0; tr < trials; tr++) {
    const s = base.slice()
    const s2 = base.slice()
    const pr = makeRng(perturbSeed + tr)
    const cell = Math.floor(pr.next() * N)
    s2[cell] = (s2[cell]! === 0 ? 1 : 0) as -1 | 0 | 1
    const ra = makeRng(streamSeed + tr)
    const rb = makeRng(streamSeed + tr)
    let peak = 0
    for (let t = 0; t < steps; t++) {
      relax(s, ra)
      relax(s2, rb)
      let diff = 0
      for (let i = 0; i < N; i++) if (s[i] !== s2[i]) diff++
      if (diff > peak) peak = diff
      if (mode === 'peak' && diff === 0) break
    }
    if (mode === 'final') {
      let diff = 0
      for (let i = 0; i < N; i++) if (s[i] !== s2[i]) diff++
      sizes.push(diff)
    } else {
      sizes.push(peak)
    }
  }
  return sizes.sort((a, b) => a - b)
}
