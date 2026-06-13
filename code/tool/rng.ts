// Seeded deterministic PRNG. Reproducibility is a hard requirement of the
// testbed: the whole system is a pure function of (seed, parameters).

export interface Rng {
  // float in [0, 1)
  next(): number
  // integer in [0, max)
  nextInt(input: { max: number }): number
  // standard normal sample
  nextGaussian(): number
}

// mulberry32: small, fast, good enough for sprinkling and Monte Carlo.
export function makeRng(input: { seed: number }): Rng {
  let a = input.seed >>> 0

  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  let spare: number | undefined

  return {
    next,
    nextInt: ({ max }) => Math.floor(next() * max),
    nextGaussian: () => {
      if (spare !== undefined) {
        const s = spare
        spare = undefined
        return s
      }
      let u = 0
      let v = 0
      let s = 0
      do {
        u = next() * 2 - 1
        v = next() * 2 - 1
        s = u * u + v * v
      } while (s >= 1 || s === 0)
      const f = Math.sqrt((-2 * Math.log(s)) / s)
      spare = v * f
      return u * f
    },
  }
}

// A genuine Poisson(lambda) draw by Knuth's algorithm, valid for moderate lambda (e^-lambda must be
// representable). This is the actual element-count distribution of a causal-set sprinkling at expected
// count lambda.
export function poissonSample(input: { lambda: number; rng: Rng }): number {
  const L = Math.exp(-input.lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= input.rng.next()
  } while (p > L)
  return k - 1
}

// Fair categorical sampling. Draw `draws` items uniformly from a flat population of
// `sum(counts)` members partitioned into bins of size counts[k], and return the
// empirical frequency of each bin (hits / draws). With enough draws this converges
// to counts[k] / total, the fair-sampling probability of bin k.
export function sampleEmpiricalFrequencies(input: {
  counts: number[]
  draws: number
  rng: Rng
}): number[] {
  const { counts, draws, rng } = input
  const cumulative: number[] = []
  let acc = 0
  for (const c of counts) {
    acc += c
    cumulative.push(acc)
  }
  const total = acc
  const hits = new Array<number>(counts.length).fill(0)
  for (let d = 0; d < draws; d++) {
    const u = rng.nextInt({ max: total })
    let k = 0
    while (k < cumulative.length && u >= (cumulative[k] ?? 0)) k++
    hits[k] = (hits[k] ?? 0) + 1
  }
  return hits.map((h) => h / draws)
}

// Derive a child seed deterministically, so a scan reconstructs from one number.
export function deriveSeed(input: { base: number; index: number }): number {
  let h = (input.base ^ (input.index * 0x9e3779b9)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}
