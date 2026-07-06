import { conservingRingSweepTunable } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

// The quantum-Zeno holding measure (Stapp). A localized packet of charge on a ring diffuses under
// the committed conserving transport (the hop rule), so left alone it spreads out. An "effort"
// re-imposes the template at a tunable rate: each beat, with probability `rate`, every out-of-place
// charge takes ONE conserving step back toward the template center (a hop into an adjacent rest
// cell, so charge is exactly conserved, never added). The time-averaged spread of the charge
// distribution is the observable. Higher re-imposition rate holds the packet tighter (smaller
// spread). Rate zero is the free-diffusion control. This is Stapp's claim that attention holds a
// state in place by re-imposing it, with effort measured as the rate of re-imposition, realized as
// a conservation-respecting restoring nudge on the substrate rather than a full state reset.

// The population standard deviation of the occupied (non-zero) cell positions on the ring, the
// spatial spread of the packet. Zero when a single cell is occupied.
export function chargeSpread(tone: Int8Array): number {
  let count = 0
  let sum = 0
  let sumSquares = 0

  for (let i = 0; i < tone.length; i++) {
    if (tone[i] !== 0) {
      count++
      sum += i
      sumSquares += i * i
    }
  }

  if (count === 0) {
    return 0
  }

  const mean = sum / count
  const variance = Math.max(0, sumSquares / count - mean * mean)

  return Math.sqrt(variance)
}

// The holding spread averaged over an ensemble of ring sizes at a fixed re-imposition rate. The
// region is a fixed fraction of the ring, centered. Averaging over sizes (not seeds) smooths the
// single-realization diffusion noise into the underlying holding law, per the deterministic
// methodology (vary size, never seeds).
export function zenoHoldSpreadOverSizes(input: {
  sizes: number[]
  regionFraction: number
  beats: number
  rate: number
  seed: number
}): number {
  const { sizes, regionFraction, beats, rate, seed } = input

  let total = 0

  for (const length of sizes) {
    const center = Math.round(length / 2)
    const half = Math.round(length * regionFraction * 0.5)

    total += zenoHoldSpread({
      length,
      regionStart: center - half,
      regionEnd: center + half,
      center,
      beats,
      rate,
      seed,
    })
  }

  return total / sizes.length
}

// Run the diffusion-plus-restoring dynamics and return the time-averaged spread. `rate` is the
// re-imposition rate (the effort). `rate` zero is free diffusion.
export function zenoHoldSpread(input: {
  length: number
  regionStart: number
  regionEnd: number
  center: number
  beats: number
  rate: number
  seed: number
}): number {
  const { length, regionStart, regionEnd, center, beats, rate, seed } =
    input

  const tone = new Int8Array(length)

  for (let i = regionStart; i < regionEnd; i++) {
    tone[i] = 1
  }

  const moved = new Uint8Array(length)
  const rng = makeRng({ seed })

  let spreadSum = 0

  for (let t = 0; t < beats; t++) {
    // the committed conserving transport spreads the packet
    conservingRingSweepTunable({
      tone,
      length,
      moved,
      rng,
      arrow: 0,
      share: 0,
      hop: 0.5,
    })

    // the effort: with probability `rate`, each out-of-place charge steps one cell toward the
    // template center into an adjacent rest cell, a conservation-respecting restoring hop
    for (let i = 0; i < length; i++) {
      if (tone[i] !== 0 && i !== center && rng.next() < rate) {
        const direction = center > i ? 1 : -1
        const target = i + direction

        if (target >= 0 && target < length && tone[target] === 0) {
          tone[target] = tone[i]!
          tone[i] = 0
        }
      }
    }

    spreadSum += chargeSpread(tone)
  }

  return spreadSum / beats
}
