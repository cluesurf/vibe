// Superfluid measurements. A superfluid has two signatures the substrate can be tested for. The LANDAU CRITICAL
// VELOCITY, the smallest phase velocity of its excitations, v_c = min over k of omega(k)/k, below which a flow
// cannot create excitations and so is dissipationless. A linear (sound) dispersion omega = c k gives v_c = c, a
// finite critical velocity, the superfluid, while a diffusive dispersion omega proportional to k squared gives v_c
// = 0, no critical velocity, a normal fluid that always dissipates. And the QUANTIZED CIRCULATION, the circulation
// of the condensate velocity (the gradient of the phase) around a vortex is quantized in integer multiples of 2 pi
// (the Onsager-Feynman quantization), because the phase is single-valued.

// the Landau critical velocity of a dispersion, the minimum of omega(k)/k over k in (0, kMax]
export function landauCriticalVelocity(input: {
  dispersion: (k: number) => number
  kMax?: number
  steps?: number
}): number {
  const kMax = input.kMax ?? Math.PI
  const steps = input.steps ?? 2000
  let vc = Infinity
  for (let i = 1; i <= steps; i++) {
    const k = (i / steps) * kMax
    vc = Math.min(vc, input.dispersion(k) / k)
  }

  return vc
}

const wrap = (x: number): number => {
  let v = x
  while (v > Math.PI) {
    v -= 2 * Math.PI
  }

  while (v <= -Math.PI) {
    v += 2 * Math.PI
  }

  return v
}

// the circulation of the condensate velocity (the gradient of the phase theta = winding * polar angle) around a
// loop enclosing a vortex of the given integer winding, which is 2 pi times the winding (the Onsager-Feynman
// quantization). Summed over `points` segments of a circle.
export function vortexCirculation(input: {
  winding: number
  points?: number
}): number {
  const points = input.points ?? 400
  const m = input.winding
  let sum = 0
  for (let i = 0; i < points; i++) {
    const a = (2 * Math.PI * i) / points
    const b = (2 * Math.PI * (i + 1)) / points
    sum += wrap(m * b - m * a)
  }

  return sum
}
