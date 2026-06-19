// Anyon braiding, the mutual statistics of a Z_n gauge theory. A charge transported around a Z_n flux (a vortex of
// the tone read as a Z_n clock) accumulates the Aharonov-Bohm holonomy 2 pi / n, the braiding phase. For n = 2 this
// is pi (a fermion), for n = 1 it is zero (a boson), and for n greater than 2 it is a FRACTIONAL phase, the hallmark
// of an ANYON. The ternary tone is Z_3, so it hosts anyons with braiding phase 2 pi / 3. The phase is TOPOLOGICAL,
// any loop that encloses the flux once gives it, any loop that does not encloses it gives zero.

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

// a square loop of half-size `radius` centered at (cx, cy), as a list of lattice points traversed counterclockwise
export function squareLoop(input: {
  radius: number
  cx: number
  cy: number
}): Array<[number, number]> {
  const { radius: r, cx, cy } = input
  const points: Array<[number, number]> = []
  for (let x = cx - r; x < cx + r; x++) {
    points.push([x, cy - r])
  }
  for (let y = cy - r; y < cy + r; y++) {
    points.push([cx + r, y])
  }
  for (let x = cx + r; x > cx - r; x--) {
    points.push([x, cy + r])
  }
  for (let y = cy + r; y > cy - r; y--) {
    points.push([cx - r, y])
  }
  return points
}

// the holonomy (braiding phase) a charge accumulates traversing `loop` around a Z_n flux at (fluxX, fluxY). The Z_n
// vortex gauge link from site a to site b is (1/n) of the wrapped change in the polar angle about the flux, so the
// loop holonomy is (1/n) times the total winding of the polar angle, which is 2 pi / n for a single enclosure and
// zero otherwise.
export function zNVortexHolonomy(input: {
  states: number
  loop: ReadonlyArray<[number, number]>
  fluxX: number
  fluxY: number
}): number {
  const { states: n, loop, fluxX, fluxY } = input
  const angle = (x: number, y: number): number =>
    Math.atan2(y - fluxY, x - fluxX)
  let sum = 0
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]!
    const b = loop[(i + 1) % loop.length]!
    sum += (1 / n) * wrap(angle(b[0], b[1]) - angle(a[0], a[1]))
  }
  return wrap(sum)
}
