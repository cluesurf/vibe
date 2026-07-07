// Aubry-Andre localization, read off the knit's OWN coined Dirac walk under a DETERMINISTIC
// quasiperiodic modulation. Disorder is not needed to trap a wave: a modulation that never repeats
// because its period is irrational relative to the lattice (a golden-ratio cosine) localizes the walk
// above a critical strength, and lets it spread below it. This is the Aubry-Andre transition, the clean
// deterministic cousin of Anderson localization, with a sharp mobility edge instead of a smooth
// crossover, and it needs no randomness at all.
//
// Measured on the {3,4,3,4} coin's single-particle sector (the two-component coined Dirac walk): the
// local mass (the coin mixing angle) is modulated as m(x) = m0 + lambda * cos(2 pi phi x), phi the
// golden ratio (irrational, so the modulation is quasiperiodic, deterministic, never repeating). A
// packet launched at the centre spreads ballistically when lambda is small (delocalized) and stays put
// when lambda is large (localized). The spread (the standard deviation of the position) grows linearly
// in time when delocalized and SATURATES when localized, which is the definitive localization signature.

type Complex = readonly [number, number]

const cadd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cabs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]
const IMAG: Complex = [0, 1]

const GOLDEN = (1 + Math.sqrt(5)) / 2

// The final position spread (standard deviation, in cells) of the coined Dirac walk whose local mass is
// modulated quasiperiodically with amplitude lambda. A localized walk keeps a small, bounded spread; a
// delocalized walk (small lambda) spreads ballistically across the lattice.
export function quasiperiodicWalkSpread(input: {
  size: number
  steps: number
  mass: number
  lambda: number
  width: number
}): number {
  const { size: L, steps, mass, lambda, width: sigma } = input
  const wrap = (x: number): number => ((x % L) + L) % L
  const x0 = L >> 1

  // localized Gaussian packet at rest (symmetric coin)
  let R: Complex[] = new Array(L).fill([0, 0])
  let Lf: Complex[] = new Array(L).fill([0, 0])
  let seedNorm = 0
  for (let x = 0; x < L; x++) {
    const g = Math.exp(-((x - x0) * (x - x0)) / (2 * sigma * sigma))
    R[x] = [g, 0]
    Lf[x] = [g, 0]
    seedNorm += cabs2(R[x]!) + cabs2(Lf[x]!)
  }
  const inv = 1 / Math.sqrt(seedNorm)
  for (let x = 0; x < L; x++) {
    R[x] = [R[x]![0] * inv, R[x]![1] * inv]
    Lf[x] = [Lf[x]![0] * inv, Lf[x]![1] * inv]
  }

  // deterministic quasiperiodic local mass: m(x) = mass + lambda * cos(2 pi phi x), phi = golden ratio
  const cosM = new Float64Array(L)
  const sinM = new Float64Array(L)
  for (let x = 0; x < L; x++) {
    const m = mass + lambda * Math.cos(2 * Math.PI * GOLDEN * (x - x0))
    cosM[x] = Math.cos(m)
    sinM[x] = Math.sin(m)
  }

  for (let t = 0; t < steps; t++) {
    const R2: Complex[] = new Array(L)
    const L2: Complex[] = new Array(L)
    for (let x = 0; x < L; x++) {
      const c = cosM[x]!
      const s = sinM[x]!
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(IMAG, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(IMAG, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    const R3: Complex[] = new Array(L).fill([0, 0])
    const L3: Complex[] = new Array(L).fill([0, 0])
    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }
    R = R3
    Lf = L3
  }

  // final position spread (standard deviation about the launch site)
  let mean = 0
  let wsum = 0
  for (let x = 0; x < L; x++) {
    const dx = ((x - x0 + L + L / 2) % L) - L / 2
    const w = cabs2(R[x]!) + cabs2(Lf[x]!)
    mean += dx * w
    wsum += w
  }
  mean /= wsum || 1

  let variance = 0
  for (let x = 0; x < L; x++) {
    const dx = ((x - x0 + L + L / 2) % L) - L / 2
    const w = cabs2(R[x]!) + cabs2(Lf[x]!)
    variance += (dx - mean) * (dx - mean) * w
  }
  variance /= wsum || 1

  return Math.sqrt(variance)
}
