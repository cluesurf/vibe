// Size scaling for the perturbation check. An experiment that declares `scales: true` multiplies its
// lattice sizes by context.scale through these helpers, so task/check-perturbation.ts can rerun it at
// half and one and a half times its size without editing the file. The default scale is 1, which
// returns every size unchanged, so the suite's own run is untouched.

// a cell count, vertex count or length, scaled and kept at least one
export function scaled(size: number, scale: number | undefined): number {
  return Math.max(1, Math.round(size * (scale ?? 1)))
}

// a periodic side, scaled with its PARITY kept: d4Mesh on an even side is two disconnected lattices
// (see the PARITY note on d4Mesh), so an odd side must stay odd and an even one even, and the smallest
// side is three
export function scaledSide(side: number, scale: number | undefined): number {
  let result = Math.max(3, Math.round(side * (scale ?? 1)))

  if (result % 2 !== side % 2) {
    result++
  }

  return result
}
