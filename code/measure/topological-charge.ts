// The lattice topological-charge density of a unit-vector (direction) field, via the signed solid angle
// subtended by a spherical triangle of three unit vectors. The Berg-Luscher formula
//   Omega(a, b, c) = 2 atan2( a . (b x c),  1 + a.b + b.c + c.a )
// gives the oriented area on the unit sphere swept by the triangle, the discrete (grad n x grad n) . n
// density. Summing over the plaquette triangles and dividing by 4 pi counts the skyrmion number; the
// square of the density is the Skyrme energy density.

type Vector3 = [number, number, number]

function dot3(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross3(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function sphericalTriangleArea(
  a: Vector3,
  b: Vector3,
  c: Vector3,
): number {
  return (
    2 *
    Math.atan2(
      dot3(a, cross3(b, c)),
      1 + dot3(a, b) + dot3(b, c) + dot3(c, a),
    )
  )
}
