// Sensory dissonance of a set of partials, the Plomp-Levelt / Helmholtz roughness model. Two nearby
// partials beat, and the beating is maximally rough near a quarter of the critical bandwidth. The
// dissonance of a musical interval is the summed roughness over every pair of partials of the two
// tones. Simple frequency ratios (the octave 2:1, the fifth 3:2) line their partials up, so the
// roughness cancels into a consonance valley; irrational ratios leave the partials beating. This is
// the acoustic face of the Symmetry Theory of Valence: a more symmetric (more consonant) resonant
// structure carries a more positive valence.

// The Plomp-Levelt roughness of a single pair of partials, amplitudes weighted.
function pairRoughness(input: {
  freqLow: number
  freqHigh: number
  ampLow: number
  ampHigh: number
}): number {
  const { freqLow, freqHigh, ampLow, ampHigh } = input
  const difference = Math.abs(freqHigh - freqLow)
  const minimum = Math.min(freqLow, freqHigh)

  // the critical-band scaling of the Plomp-Levelt curve
  const s = 0.24 / (0.0207 * minimum + 18.96)
  const x = s * difference

  return ampLow * ampHigh * (Math.exp(-3.5 * x) - Math.exp(-5.85 * x))
}

// A harmonic complex tone: `partials` harmonics of `fundamental`, amplitudes falling as 1/n.
export function harmonicTone(input: {
  fundamental: number
  partials: number
}): { freq: number; amp: number }[] {
  const { fundamental, partials } = input
  const tone: { freq: number; amp: number }[] = []

  for (let n = 1; n <= partials; n++) {
    tone.push({ freq: fundamental * n, amp: 1 / n })
  }

  return tone
}

// A single pure sine partial, no overtones. The control tone with no harmonic structure to align.
export function pureTone(
  fundamental: number,
): { freq: number; amp: number }[] {
  return [{ freq: fundamental, amp: 1 }]
}

// The total sensory dissonance of two tones sounded together, summed over every pair of partials.
export function intervalDissonance(
  toneA: { freq: number; amp: number }[],
  toneB: { freq: number; amp: number }[],
): number {
  const all = [...toneA, ...toneB]

  let dissonance = 0

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i]!
      const b = all[j]!
      const low = a.freq <= b.freq ? a : b
      const high = a.freq <= b.freq ? b : a

      dissonance += pairRoughness({
        freqLow: low.freq,
        freqHigh: high.freq,
        ampLow: low.amp,
        ampHigh: high.amp,
      })
    }
  }

  return dissonance
}
