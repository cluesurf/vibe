// Exchange and Skyrme energies, and the topological (skyrmion) charge, of a unit-vector
// (direction) field on a 2D or 3D lattice. The exchange (gradient) energy is the sum of
// (1 - n.n') over nearest-neighbour bonds. The Skyrme (fourth-order) energy is the sum of the
// squared topological-current density, the squared spherical-triangle area swept by each
// plaquette (the discrete (grad n x grad n).n). The total Derrick energy is exchange +
// kappa Skyrme. The skyrmion number is the summed plaquette solid angle over 4 pi.

import { sphericalTriangleArea } from '@/code/measure/topological-charge'

type Vector3 = [number, number, number]

function dot3(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

// Exchange and Skyrme energy of a 2D direction field f[x][y]. Exchange sums (1 - n.n') over the
// two forward bonds per site; Skyrme sums the squared single-triangle current per plaquette.
export function directionFieldEnergy2d(field: Vector3[][]): { exchange: number; skyrme: number } {
  const nx = field.length
  const ny = field[0]?.length ?? 0
  let exchange = 0
  let skyrme = 0
  for (let x = 0; x < nx - 1; x++) for (let y = 0; y < ny - 1; y++) {
    const n = field[x]![y]!, right = field[x + 1]![y]!, up = field[x]![y + 1]!
    exchange += (1 - dot3(n, right)) + (1 - dot3(n, up))
    const q = sphericalTriangleArea(n, right, up)
    skyrme += q * q
  }
  return { exchange, skyrme }
}

// Total Derrick energy of a 2D direction field: exchange + kappa Skyrme.
export function directionFieldDerrickEnergy2d(field: Vector3[][], kappa: number): number {
  const { exchange, skyrme } = directionFieldEnergy2d(field)
  return exchange + kappa * skyrme
}

// The skyrmion number of a 2D direction field, the summed plaquette solid angle (two triangles per
// plaquette) over 4 pi, rounded to the nearest integer.
export function skyrmionCharge2d(field: Vector3[][]): number {
  const nx = field.length
  const ny = field[0]?.length ?? 0
  let q = 0
  for (let x = 0; x < nx - 1; x++) for (let y = 0; y < ny - 1; y++) {
    const a = field[x]![y]!, b = field[x + 1]![y]!, c = field[x + 1]![y + 1]!, d = field[x]![y + 1]!
    q += sphericalTriangleArea(a, b, c) + sphericalTriangleArea(a, c, d)
  }
  return Math.round(q / (4 * Math.PI))
}

// Exchange and Skyrme energy of a 3D direction field f[x][y][z]. Exchange sums (1 - n.n') over the
// three forward bonds per site; Skyrme sums the squared current over the three plaquettes meeting
// at each site (xy, yz, zx).
export function directionFieldEnergy3d(field: Vector3[][][]): { exchange: number; skyrme: number } {
  const nx = field.length
  const ny = field[0]?.length ?? 0
  const nz = field[0]?.[0]?.length ?? 0
  let exchange = 0
  let skyrme = 0
  for (let x = 0; x < nx - 1; x++) for (let y = 0; y < ny - 1; y++) for (let z = 0; z < nz - 1; z++) {
    const n = field[x]![y]![z]!, rx = field[x + 1]![y]![z]!, ry = field[x]![y + 1]![z]!, rz = field[x]![y]![z + 1]!
    exchange += (1 - dot3(n, rx)) + (1 - dot3(n, ry)) + (1 - dot3(n, rz))
    const qxy = sphericalTriangleArea(n, rx, ry), qyz = sphericalTriangleArea(n, ry, rz), qzx = sphericalTriangleArea(n, rz, rx)
    skyrme += qxy * qxy + qyz * qyz + qzx * qzx
  }
  return { exchange, skyrme }
}
