// A U(1) gauge field on a 2D periodic square lattice, stored as link phases. Ax[x][y] is the phase on
// the horizontal link (x, y) -> (x+1, y) and Ay[x][y] on the vertical link (x, y) -> (x, y+1). The
// gauge-invariant content is the plaquette flux (curl A = the field strength F) and the Wilson loop
// (the holonomy / Aharonov-Bohm phase around a rectangle). A gauge transformation A -> A + d(lambda)
// shifts every link by the lambda difference across it and leaves all fluxes and loops unchanged.

export interface GridGauge {
  Ax: number[][]
  Ay: number[][]
}

export function makeGridGrid(side: number): number[][] {
  return Array.from({ length: side }, () =>
    new Array<number>(side).fill(0),
  )
}

// The plaquette flux (curl A) at the cell with lower-left corner (x, y), on a torus of the given side.
export function plaquetteFlux(
  g: GridGauge,
  input: { x: number; y: number; side: number },
): number {
  const { x, y, side } = input
  return (
    g.Ax[x]![y]! +
    g.Ay[(x + 1) % side]![y]! -
    g.Ax[x]![(y + 1) % side]! -
    g.Ay[x]![y]!
  )
}

// The Wilson loop (sum of A around the rectangle [x0,x1] x [y0,y1]) = the enclosed flux.
export function gridWilsonLoop(
  g: GridGauge,
  input: { x0: number; x1: number; y0: number; y1: number },
): number {
  const { x0, x1, y0, y1 } = input
  let s = 0
  for (let x = x0; x < x1; x++) {
    s += g.Ax[x]![y0]!
  }
  for (let y = y0; y < y1; y++) {
    s += g.Ay[x1]![y]!
  }
  for (let x = x1 - 1; x >= x0; x--) {
    s -= g.Ax[x]![y1]!
  }
  for (let y = y1 - 1; y >= y0; y--) {
    s -= g.Ay[x0]![y]!
  }
  return s
}

// A gauge transformation A_link -> A + lambda(end) - lambda(start), with periodic wraparound. The
// fluxes and Wilson loops are invariant under this.
// A single-vortex U(1) gauge field on the side x side grid: the link phases are the lattice
// gradient of the angle around the flux center (fx + 1/2, fy + 1/2), scaled so the curl is the
// total flux through that one plaquette and zero everywhere else. A Wilson loop enclosing the
// center returns exactly `flux`. The Aharonov-Bohm / emergent-EM input.
export function vortexGaugeField(input: {
  side: number
  flux: number
  centerX: number
  centerY: number
}): GridGauge {
  const { side: L, flux: Phi, centerX: fx, centerY: fy } = input
  const Ax = makeGridGrid(L)
  const Ay = makeGridGrid(L)
  const wrap = (d: number): number =>
    d - 2 * Math.PI * Math.round(d / (2 * Math.PI))
  const theta = (px: number, py: number): number =>
    Math.atan2(py - (fy + 0.5), px - (fx + 0.5))
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      Ax[x]![y] =
        (Phi / (2 * Math.PI)) * wrap(theta(x + 1, y) - theta(x, y))
      Ay[x]![y] =
        (Phi / (2 * Math.PI)) * wrap(theta(x, y + 1) - theta(x, y))
    }
  }
  return { Ax, Ay }
}

export function gridGaugeTransform(
  g: GridGauge,
  lambda: number[][],
  side: number,
): GridGauge {
  const Ax = makeGridGrid(side)
  const Ay = makeGridGrid(side)
  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      Ax[x]![y] =
        g.Ax[x]![y]! + lambda[(x + 1) % side]![y]! - lambda[x]![y]!
      Ay[x]![y] =
        g.Ay[x]![y]! + lambda[x]![(y + 1) % side]! - lambda[x]![y]!
    }
  }
  return { Ax, Ay }
}
