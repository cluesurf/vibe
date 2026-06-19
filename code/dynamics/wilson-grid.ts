// The Wilson lattice gauge action on a periodic L^3 cubic lattice, in the link-index representation
// (link variables theta[d + 3 * site]). A plaquette is four signed links tracing a unit square. The
// Wilson action is sum over plaquettes of [1 - cos(F)], F the curl of the link angles, and the Maxwell
// action is its small-field limit (1/2) sum F^2 (since 1 - cos(x) -> x^2 / 2). The ratio of the two
// converges to one as the field shrinks, so the Maxwell (curl-curl) operator follows from the Wilson
// action.

export interface PlaquetteLink {
  link: number
  sign: number
}

// Every plaquette of a periodic L^3 lattice, each as four signed links.
export function gridPlaquettes(L: number): PlaquetteLink[][] {
  const siteIndex = (x: number, y: number, z: number): number =>
    ((x + L) % L) + L * (((y + L) % L) + L * ((z + L) % L))
  const link = (x: number, y: number, z: number, d: number): number =>
    d + 3 * siteIndex(x, y, z)
  const step = (
    x: number,
    y: number,
    z: number,
    d: number,
  ): [number, number, number] =>
    d === 0 ? [x + 1, y, z] : d === 1 ? [x, y + 1, z] : [x, y, z + 1]
  const out: PlaquetteLink[][] = []
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        for (const [d1, d2] of [
          [0, 1],
          [0, 2],
          [1, 2],
        ] as const) {
          const [x1, y1, z1] = step(x, y, z, d1)
          const [x2, y2, z2] = step(x, y, z, d2)
          out.push([
            { link: link(x, y, z, d1), sign: 1 },
            { link: link(x1, y1, z1, d2), sign: 1 },
            { link: link(x2, y2, z2, d1), sign: -1 },
            { link: link(x, y, z, d2), sign: -1 },
          ])
        }
      }
    }
  }

  return out
}

function plaquetteCurl(
  theta: Float64Array,
  plaq: PlaquetteLink[],
): number {
  let f = 0
  for (const { link, sign } of plaq) {
    f += sign * (theta[link] ?? 0)
  }

  return f
}

// The Wilson action sum over plaquettes of [1 - cos(F)].
export function gridWilsonAction(
  theta: Float64Array,
  plaqs: PlaquetteLink[][],
): number {
  let s = 0
  for (const plaq of plaqs) {
    s += 1 - Math.cos(plaquetteCurl(theta, plaq))
  }

  return s
}

// The Maxwell action sum over plaquettes of (1/2) F^2, the small-field limit of the Wilson action.
export function gridMaxwellAction(
  theta: Float64Array,
  plaqs: PlaquetteLink[][],
): number {
  let s = 0
  for (const plaq of plaqs) {
    const f = plaquetteCurl(theta, plaq)
    s += 0.5 * f * f
  }

  return s
}
