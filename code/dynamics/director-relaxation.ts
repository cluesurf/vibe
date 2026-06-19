// Nematic director relaxation on a ring: heat flow (gradient descent of the
// Frank elastic energy) on the director angle, respecting the headless n ~ -n
// identification (angles compared mod pi). Each beat moves every angle toward its
// two neighbours by the mod-pi-folded difference, scaled by `dt`. A topological
// disclination's half-integer winding is conserved under this relaxation, so the
// defect persists rather than smoothing away.

// Fold an angle difference into (-pi/2, pi/2], the nematic (mod-pi) range.
function foldModPi(angle: number): number {
  let d = angle

  while (d > Math.PI / 2) {
    d -= Math.PI
  }

  while (d < -Math.PI / 2) {
    d += Math.PI
  }

  return d
}

export function relaxDirector(input: {
  phi: ReadonlyArray<number>
  steps: number
  dt: number
}): number[] {
  const { phi, steps, dt } = input
  const length = phi.length

  let current = phi.slice()

  for (let t = 0; t < steps; t++) {
    const next = current.map((p, i) => {
      const right = foldModPi(current[(i + 1) % length]! - p)
      const left = foldModPi(current[(i + length - 1) % length]! - p)

      return p + dt * (right + left) // diffuse toward neighbours (mod pi)
    })

    current = next
  }

  return current
}
