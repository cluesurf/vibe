// The free-space (infinite-volume) cubic-lattice Green's function of the discrete Laplacian, evaluated
// in momentum space. The 3D lattice Coulomb/Newton potential is
//   G(r) = (1/(2 pi)^3) integral cos(k.r) / [2 (3 - cos kx - cos ky - cos kz)] d^3k,
// whose continuum limit is 1/(4 pi r). We work with the DIFFERENCE G(r) - G(r0) along the x-axis: the
// integrand [cos(k r) - cos(k r0)] / (2 D(k)) is regular at k = 0 (the cosine difference cancels the
// 1/k^2 singularity), so the Brillouin-zone grid sum is clean with no excluded mode and no box artifact
// (unlike a finite Dirichlet solve, whose image charges steepen the falloff).

export function latticeGreenDifferenceX(input: {
  r: number
  r0: number
  gridPoints: number
}): number {
  const M = input.gridPoints
  const dk = (2 * Math.PI) / M
  let s = 0
  for (let a = 0; a < M; a++) {
    const kx = -Math.PI + a * dk
    const ckx = Math.cos(kx)
    const drx = Math.cos(kx * input.r) - Math.cos(kx * input.r0)
    for (let b = 0; b < M; b++) {
      const cky = Math.cos(-Math.PI + b * dk)
      for (let c = 0; c < M; c++) {
        const kz = -Math.PI + c * dk
        const ckz = Math.cos(kz)
        const den = 3 - ckx - cky - ckz
        if (den < 1e-12) {
          continue
        } // k=0: the cosine-difference integrand goes to 0 here anyway
        s += drx / (2 * den)
      }
    }
  }
  return s / (M * M * M)
}
