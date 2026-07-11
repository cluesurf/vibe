import { csrDistances } from '@/code/tool/graph'

// The connected two-point correlation C(r) = <s_x s_y> - <s>^2 binned by GRAPH
// DISTANCE r, estimated from BFS balls around `samples` random source cells. The
// vacuum / field correlator on an irregular substrate where there is no momentum
// space: pick a source, walk out to maxRadius, accumulate (s_src - mean)(s_i - mean)
// into the bin for the source-to-i distance, average per bin. C[0] is the on-site
// variance; C[1] the nearest-neighbour pair correlation.
export function connectedCorrelationByDistance(input: {
  tone: ArrayLike<number>
  offsets: Int32Array
  adj: Int32Array
  size: number
  maxRadius: number
  samples: number
  rng: { next: () => number }
}): number[] {
  const { tone, offsets, adj, size, maxRadius, samples, rng } = input

  let mean = 0

  for (let i = 0; i < size; i++) mean += tone[i]!

  mean /= size

  const sums = new Float64Array(maxRadius + 1)
  const counts = new Float64Array(maxRadius + 1)

  for (let s = 0; s < samples; s++) {
    const src = Math.floor(rng.next() * size)
    const dist = csrDistances({
      offsets,
      adj,
      size,
      source: src,
      maxRadius,
    })

    for (let i = 0; i < size; i++) {
      const r = dist[i]!

      if (r >= 0 && r <= maxRadius) {
        sums[r]! += (tone[src]! - mean) * (tone[i]! - mean)
        counts[r]!++
      }
    }
  }

  const c: number[] = []

  for (let r = 0; r <= maxRadius; r++)
    c.push(counts[r]! > 0 ? sums[r]! / counts[r]! : 0)

  return c
}

// The time-and-space-averaged connected equal-time correlation C(r) = <s_x s_{x+r}> - <s>^2 of a
// ternary field on a PERIODIC ring, over `beats` beats of an evolving dynamics. Each beat the current
// state is accumulated (mean and the lag products for r = 0..maxR) then advanced by `relax`. The mean
// and lag sums are averaged over both the ring and the beats. The static correlator of the conserving
// ring field, whose decay range (and correlationLengthFromDecay) say whether the field is gapless.
export function timeAveragedRingCorrelation(input: {
  tone: Int8Array
  length: number
  maxR: number
  beats: number
  relax: () => void
}): number[] {
  const { tone, length: L, maxR, beats, relax } = input
  const sumCC = new Float64Array(maxR + 1)

  let sumC = 0

  for (let t = 0; t < beats; t++) {
    for (let x = 0; x < L; x++) {
      sumC += tone[x]!

      for (let r = 0; r <= maxR; r++)
        sumCC[r]! += tone[x]! * tone[(x + r) % L]!
    }

    relax()
  }

  const mean = sumC / (L * beats)
  const c: number[] = []

  for (let r = 0; r <= maxR; r++)
    c.push(sumCC[r]! / (L * beats) - mean * mean)

  return c
}

// Correlation length xi from exponential decay |C(r)| ~ exp(-r / xi): a least-squares
// line through (r, log|C(r)|) over the inclusive window [rLo, rHi] (skipping zero /
// negative magnitudes), xi = -1 / slope. A non-decaying (slope >= 0) correlator has
// infinite range, so xi = Infinity.
export function correlationLengthFromDecay(input: {
  correlation: ArrayLike<number>
  rLo: number
  rHi: number
}): number {
  const { correlation, rLo, rHi } = input

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0

  for (let r = rLo; r <= rHi; r++) {
    const ac = Math.abs(correlation[r]!)

    if (ac <= 1e-9) continue

    const y = Math.log(ac)

    sx += r
    sy += y
    sxx += r * r
    sxy += r * y
    m++
  }

  const slope = m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0

  return slope < 0 ? -1 / slope : Infinity
}
