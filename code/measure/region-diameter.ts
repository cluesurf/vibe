// The two navigation regimes of the substrate, read as diameters. The same substrate carries two
// kinds of region. The hyperbolic BULK grows exponentially: a ball of N cells has diameter of order
// log N, so everything is a few hops from everything, the regime of associative recall where any
// memory is reachable from any other in logarithmic time. The flat CUSP (a three-dimensional
// slice) grows polynomially: a ball of N cells has diameter of order N to the one third, genuine
// locality, the regime of physics where signals crawl at a bounded speed. The split of one
// substrate into a logarithmic-diameter bulk and a polynomial-diameter cusp is the division between
// mind (fast global access) and physics (slow local dynamics), made a measured law.

// The diameter of a balanced tree of branching b holding roughly N cells: the tree has depth
// log_b(N (b-1) + 1) - 1 and diameter twice the depth, which grows as log N. Returns the diameter.
export function bulkDiameter(input: {
  branching: number
  cellCount: number
}): number {
  const { branching, cellCount } = input
  // N = (b^(D+1) - 1) / (b - 1) cells in a full tree of depth D, so solve for D
  const depth = Math.floor(
    Math.log(cellCount * (branching - 1) + 1) / Math.log(branching) - 1,
  )

  return 2 * Math.max(0, depth)
}

// The diameter of a d-dimensional cubic ball of roughly N cells: a cube of side L in d dimensions
// holds L^d cells with diameter of order d times L, so the diameter grows as N to the one over d.
// Returns the diameter of the flat cusp region.
export function cuspDiameter(input: {
  dimension: number
  cellCount: number
}): number {
  const { dimension, cellCount } = input
  const side = Math.round(Math.pow(cellCount, 1 / dimension))

  return dimension * (side - 1)
}

// The exponent of the diameter-versus-size scaling, estimated from two sizes: the slope of log
// diameter against log cell count. Near zero for the logarithmic bulk (diameter barely grows), near
// one over the dimension for the polynomial cusp.
export function diameterExponent(input: {
  diameterSmall: number
  diameterLarge: number
  countSmall: number
  countLarge: number
}): number {
  const { diameterSmall, diameterLarge, countSmall, countLarge } = input

  if (diameterSmall <= 0 || diameterLarge <= 0) return 0

  return (
    (Math.log(diameterLarge) - Math.log(diameterSmall)) /
    (Math.log(countLarge) - Math.log(countSmall))
  )
}
