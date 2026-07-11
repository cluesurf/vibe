// The topological winding number of a chiral walk, read off the walk's OWN dynamics by the mean chiral
// displacement. A single coin+shift (the substrate's Dirac-walk sector) mixes the two movers by one
// angle per step, and its Bloch vector stays in a plane, so it carries no winding. Apply the coin+shift
// TWICE per step with two different angles (a two-beat, split-step walk, the minimal chiral walk) and
// the band's Bloch vector can wind around the sphere an integer number of times as the momentum crosses
// the zone. That integer is the winding number, the bulk topological invariant, and it is what forces a
// bound edge state at an interface (the bulk-boundary correspondence, the same law behind the Jackiw-
// Rebbi state). The winding is NOT computed from an analytic band here: it is MEASURED from the real
// walk by the mean chiral displacement, which for a chiral walk converges to the winding number.
//
// Symmetric time frame U = R(θ1/2) T_up R(θ2) T_down R(θ1/2), R a coin rotation, T a spin-dependent
// shift (up +1, down -1). In this frame the walk has chiral symmetry with operator sigma_x, and the
// time-averaged mean chiral displacement 2<sigma_x * position> converges to the integer winding number.

type Complex = readonly [number, number]

// coin rotation R(theta) about the y axis, acting on the (up, down) spinor at a site
function coinRotate(
  up: Complex,
  down: Complex,
  theta: number,
): [Complex, Complex] {
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)
  const newUp: Complex = [
    c * up[0] - s * down[0],
    c * up[1] - s * down[1],
  ]

  const newDown: Complex = [
    s * up[0] + c * down[0],
    s * up[1] + c * down[1],
  ]

  return [newUp, newDown]
}

// The time-averaged mean chiral displacement of the split-step walk with coin angles (theta1, theta2).
// It converges to the integer winding number of the walk's band. The ring is taken large enough that
// the ballistically spreading packet never reaches the wrap seam within `steps`.
export function meanChiralDisplacement(input: {
  size: number
  steps: number
  theta1: number
  theta2: number
}): number {
  const { size: L, steps, theta1, theta2 } = input
  const wrap = (x: number): number => ((x % L) + L) % L
  const x0 = L >> 1

  // seed localized at the origin in the +1 eigenstate of the chiral operator sigma_x: (|up>+|down>)/sqrt2
  let up: Complex[] = new Array<Complex>(L).fill([0, 0])
  let down: Complex[] = new Array<Complex>(L).fill([0, 0])

  up[x0] = [1 / Math.SQRT2, 0]
  down[x0] = [1 / Math.SQRT2, 0]

  const applyCoin = (
    u: Complex[],
    d: Complex[],
    theta: number,
  ): [Complex[], Complex[]] => {
    const u2: Complex[] = new Array<Complex>(L)
    const d2: Complex[] = new Array<Complex>(L)

    for (let x = 0; x < L; x++) {
      const [nu, nd] = coinRotate(u[x]!, d[x]!, theta)

      u2[x] = nu
      d2[x] = nd
    }

    return [u2, d2]
  }

  const applyShift = (
    u: Complex[],
    d: Complex[],
  ): [Complex[], Complex[]] => {
    const u2: Complex[] = new Array<Complex>(L).fill([0, 0])
    const d2: Complex[] = new Array<Complex>(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      u2[wrap(x + 1)] = u[x]! // up-mover shifts +1
      d2[wrap(x - 1)] = d[x]! // down-mover shifts -1
    }

    return [u2, d2]
  }

  const displacements: number[] = []

  for (let t = 0; t < steps; t++) {
    // symmetric-frame split step: R(θ1/2) T R(θ2) T R(θ1/2)
    let [u, d] = applyCoin(up, down, theta1 / 2)

    ;[u, d] = applyShift(u, d)
    ;[u, d] = applyCoin(u, d, theta2)
    ;[u, d] = applyShift(u, d)
    ;[u, d] = applyCoin(u, d, theta1 / 2)
    up = u
    down = d

    // mean chiral displacement 2 * sum_x (x - x0) * <sigma_x>(x), with <sigma_x>(x) = 2 Re(up* . down)
    let chiral = 0

    for (let x = 0; x < L; x++) {
      const sigmaX =
        2 * (up[x]![0] * down[x]![0] + up[x]![1] * down[x]![1])

      chiral += (x - x0) * sigmaX
    }

    displacements.push(2 * chiral)
  }

  // time-average over the second half (the displacement oscillates around the winding number, the
  // oscillation decaying like 1/t, so the tail average converges to the integer invariant)
  const tail = displacements.slice(steps >> 1)

  return tail.reduce((a, b) => a + b, 0) / tail.length
}
