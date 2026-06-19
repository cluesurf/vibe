// A 2D tight-binding charged wavepacket evolved with Peierls phases in the Landau gauge
// A_y = B*x, so the y-hops carry a phase e^{i B x}. A packet launched with x-momentum
// deflects transversely, the lattice Lorentz force from the gauge coupling. Split-step
// free hops in x (no phase) and y (Peierls phase), renormalized each step. The complex
// amplitudes are kept as [re, im] tuples so the floating-point evolution is bit-for-bit
// the same as the inline magnetism probe. Returns the transverse drift <y - y0>.

type C = [number, number]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cscale = (a: C, s: number): C => [a[0] * s, a[1] * s]
const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const phase = (t: number): C => [Math.cos(t), Math.sin(t)]

export function peierlsWavepacketDrift(input: {
  field: number
  length: number
  steps: number
  momentum?: number
  width?: number
  hop?: number
}): number {
  const { field: B, length: L, steps } = input
  const kx = input.momentum ?? 1.0
  const w = input.width ?? 4
  const tau = input.hop ?? 0.35 // hop strength per step (small => semiclassical)
  const idx = (x: number, y: number): number => x * L + y
  const wrap = (a: number): number => ((a % L) + L) % L
  const x0 = L / 2
  const y0 = L / 2

  let psi: C[] = new Array(L * L).fill([0, 0])
  let nrm = 0

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      const g = Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * w * w))
      const ph = phase(kx * x)
      psi[idx(x, y)] = cscale(ph, g)
      nrm += g * g
    }
  }

  psi = psi.map(z => cscale(z, 1 / Math.sqrt(nrm)))

  for (let t = 0; t < steps; t++) {
    const next: C[] = psi.map(z => [...z] as C)

    for (let x = 0; x < L; x++) {
      for (let y = 0; y < L; y++) {
        const i = idx(x, y)

        // x-hops (no phase), y-hops with Peierls phase e^{i B x} (Landau gauge)
        const hop = (j: number, ph: C): void => {
          next[i] = cadd(next[i]!, cscale(cmul(psi[j]!, ph), tau))
        }

        hop(idx(wrap(x + 1), y), [1, 0])
        hop(idx(wrap(x - 1), y), [1, 0])
        hop(idx(x, wrap(y + 1)), phase(B * x))
        hop(idx(x, wrap(y - 1)), phase(-B * x))
      }
    }

    let n2 = 0

    for (const z of next) {
      n2 += cabs2(z)
    }

    psi = next.map(z => cscale(z, 1 / Math.sqrt(n2)))
  }

  let ybar = 0,
    wsum = 0

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      const p = cabs2(psi[idx(x, y)]!)
      ybar += (y - y0) * p
      wsum += p
    }
  }

  return ybar / wsum // transverse drift
}
