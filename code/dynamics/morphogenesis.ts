// Deterministic morphogenesis: a discrete activator-inhibitor rule on a ring that forms a stable, regular striped
// pattern from a fixed structured seed, with no randomness. Each cell looks at a short-range activation (a small
// neighbourhood, which it wants to agree with) minus a long-range inhibition (a wider neighbourhood, which it
// wants to oppose), and takes the sign. Short activation plus long inhibition is the Turing mechanism: it picks
// out a finite wavelength, so the ring settles into evenly spaced stripes. Equal ranges (no differential) just
// coarsen to a near-uniform field, the control. Reused by the morphogenesis experiment, so it stays thin.

// a fixed, structured (non-random) seed: a busy deterministic pattern with no built-in wavelength
function seedPattern(n: number): Int8Array {
  const a = new Int8Array(n)

  for (let i = 0; i < n; i++) a[i] = (i * 73 + 17) % 31 < 16 ? 1 : -1

  return a
}

// the mean tone over the wrapped window of radius r around i (includes i)
function windowMean(a: Int8Array, i: number, r: number): number {
  const n = a.length

  let sum = 0

  for (let d = -r; d <= r; d++) sum += a[(((i + d) % n) + n) % n]!

  return sum / (2 * r + 1)
}

// one synchronous beat of the activator-inhibitor rule
function step(
  a: Int8Array,
  activateRadius: number,
  inhibitRadius: number,
  inhibition: number,
): Int8Array {
  const n = a.length
  const next = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    const field =
      windowMean(a, i, activateRadius) -
      inhibition * windowMean(a, i, inhibitRadius)

    next[i] = field > 0 ? 1 : field < 0 ? -1 : a[i]!
  }

  return next
}

// the number of domain walls (sign changes) around the ring: 0 is uniform, a striped pattern has many, regular ones
function domainWalls(a: Int8Array): number {
  const n = a.length

  let walls = 0

  for (let i = 0; i < n; i++) {
    if (a[i] !== a[(i + 1) % n]) {
      walls++
    }
  }

  return walls
}

// the coefficient of variation of the wall spacings: low means the stripes are evenly spaced (a regular pattern)
function wallSpacingRegularity(a: Int8Array): number {
  const n = a.length
  const positions: number[] = []

  for (let i = 0; i < n; i++) {
    if (a[i] !== a[(i + 1) % n]) positions.push(i)
  }

  if (positions.length < 2) return 1

  const gaps = positions.map((p, k) => {
    const next = positions[(k + 1) % positions.length]!

    return (next - p + n) % n || n
  })

  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length
  const variance =
    gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length

  return mean > 0 ? Math.sqrt(variance) / mean : 1
}

// run the rule to convergence from the fixed seed and report the pattern's structure
export function morphogenesis(input: {
  n: number
  activateRadius: number
  inhibitRadius: number
  inhibition: number
  beats: number
}): {
  walls: number
  regularity: number
  stable: boolean
  balanced: boolean
} {
  let a = seedPattern(input.n)

  let previous = a

  for (let b = 0; b < input.beats; b++) {
    previous = a
    a = step(
      a,
      input.activateRadius,
      input.inhibitRadius,
      input.inhibition,
    )
  }

  // stable: the last beat changed nothing
  let stable = true

  for (let i = 0; i < input.n; i++) {
    if (a[i] !== previous[i]) stable = false
  }

  // balanced: not collapsed to a single sign (a real pattern has both)
  let plus = 0

  for (let i = 0; i < input.n; i++) {
    if (a[i] === 1) {
      plus++
    }
  }

  const fraction = plus / input.n

  return {
    walls: domainWalls(a),
    regularity: wallSpacingRegularity(a),
    stable,
    balanced: fraction > 0.3 && fraction < 0.7,
  }
}
