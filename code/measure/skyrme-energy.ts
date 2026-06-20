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

function normalize3(v: Vector3): Vector3 {
  const m = Math.hypot(v[0], v[1], v[2]) || 1

  return [v[0] / m, v[1] / m, v[2] / m]
}

// A localized 3D hedgehog texture of size R on an M^3 grid: the direction winds radially with a
// linear profile that goes from pi at the center to 0 at radius R, tilted so both the exchange
// (gradient) energy and the topological-current density are nonzero. Outside R the field relaxes
// to the +z vacuum. The Derrick-scaling input behind directionFieldEnergy3d.
export function hedgehogTexture3d(input: {
  size: number
  radius: number
}): Vector3[][][] {
  const { size: M, radius: R } = input
  const c = M / 2
  const field: Vector3[][][] = Array.from({ length: M }, () =>
    Array.from({ length: M }, () =>
      Array.from({ length: M }, () => [0, 0, 1] as Vector3),
    ),
  )

  for (let x = 0; x < M; x++) {
    for (let y = 0; y < M; y++) {
      for (let z = 0; z < M; z++) {
        const dx = x - c,
          dy = y - c,
          dz = z - c,
          rho = Math.hypot(dx, dy, dz)

        const prof = Math.PI * Math.max(0, 1 - rho / R)
        const rhat: Vector3 =
          rho > 1e-6 ? [dx / rho, dy / rho, dz / rho] : [0, 0, 1]

        field[x]![y]![z] = normalize3([
          Math.sin(prof) * rhat[0],
          Math.sin(prof) * rhat[1],
          Math.cos(prof) + 0.6 * Math.sin(prof) * rhat[2],
        ])
      }
    }
  }

  return field
}

// A blank N x N 2D direction field, every site pointing to the +z vacuum.
export function blankDirectionField2d(size: number): Vector3[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => [0, 0, 1] as Vector3),
  )
}

// Superpose a charge-`charge` skyrmion of radius R centered at (cx, cy) onto a 2D direction
// field. The texture is the standard winding profile: polar angle times the winding number for
// the in-plane direction, a linear radial profile from pi at the core to 0 at radius R. Only the
// core (where the new texture tilts further from +z than what is there) overwrites, so several
// solitons coexist on one field. The interaction-energy and additive-mass input for soliton matter.
export function placeSkyrmion2d(input: {
  field: Vector3[][]
  centerX: number
  centerY: number
  radius: number
  charge: number
  // internal iso-rotation of the in-plane direction (radians). A relative phase between
  // two skyrmions selects the interaction channel: 0 is the repulsive (same-orientation)
  // channel, pi is the attractive channel where two same-charge skyrmions bind (the
  // deuteron analog). Defaults to 0.
  phase?: number
}): void {
  const {
    field,
    centerX: cx,
    centerY: cy,
    radius: R,
    charge: ch,
    phase = 0,
  } = input

  const N = field.length

  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      const r = Math.hypot(x - cx, y - cy)

      if (r > 2.2 * R) {
        continue
      }

      const phi = Math.atan2(y - cy, x - cx) * ch + phase,
        fr = Math.PI * Math.max(0, 1 - r / R)

      const nv = normalize3([
        Math.sin(fr) * Math.cos(phi),
        Math.sin(fr) * Math.sin(phi),
        Math.cos(fr),
      ])

      if (1 - field[x]![y]![2] < 1 - nv[2]) {
        field[x]![y] = nv
      }
    }
  }
}

// Exchange and Skyrme energy of a 2D direction field f[x][y]. Exchange sums (1 - n.n') over the
// two forward bonds per site; Skyrme sums the squared single-triangle current per plaquette.
export function directionFieldEnergy2d(field: Vector3[][]): {
  exchange: number
  skyrme: number
} {
  const nx = field.length
  const ny = field[0]?.length ?? 0

  let exchange = 0
  let skyrme = 0

  for (let x = 0; x < nx - 1; x++) {
    for (let y = 0; y < ny - 1; y++) {
      const n = field[x]![y]!,
        right = field[x + 1]![y]!,
        up = field[x]![y + 1]!

      exchange += 1 - dot3(n, right) + (1 - dot3(n, up))

      const q = sphericalTriangleArea(n, right, up)
      skyrme += q * q
    }
  }

  return { exchange, skyrme }
}

// Total Derrick energy of a 2D direction field: exchange + kappa Skyrme.
export function directionFieldDerrickEnergy2d(
  field: Vector3[][],
  kappa: number,
): number {
  const { exchange, skyrme } = directionFieldEnergy2d(field)

  return exchange + kappa * skyrme
}

// The skyrmion number of a 2D direction field, the summed plaquette solid angle (two triangles per
// plaquette) over 4 pi, rounded to the nearest integer.
export function skyrmionCharge2d(field: Vector3[][]): number {
  const nx = field.length
  const ny = field[0]?.length ?? 0

  let q = 0

  for (let x = 0; x < nx - 1; x++) {
    for (let y = 0; y < ny - 1; y++) {
      const a = field[x]![y]!,
        b = field[x + 1]![y]!,
        c = field[x + 1]![y + 1]!,
        d = field[x]![y + 1]!

      q +=
        sphericalTriangleArea(a, b, c) + sphericalTriangleArea(a, c, d)
    }
  }

  return Math.round(q / (4 * Math.PI))
}

// Exchange and Skyrme energy of a 3D direction field f[x][y][z]. Exchange sums (1 - n.n') over the
// three forward bonds per site; Skyrme sums the squared current over the three plaquettes meeting
// at each site (xy, yz, zx).
export function directionFieldEnergy3d(field: Vector3[][][]): {
  exchange: number
  skyrme: number
} {
  const nx = field.length
  const ny = field[0]?.length ?? 0
  const nz = field[0]?.[0]?.length ?? 0

  let exchange = 0
  let skyrme = 0

  for (let x = 0; x < nx - 1; x++) {
    for (let y = 0; y < ny - 1; y++) {
      for (let z = 0; z < nz - 1; z++) {
        const n = field[x]![y]![z]!,
          rx = field[x + 1]![y]![z]!,
          ry = field[x]![y + 1]![z]!,
          rz = field[x]![y]![z + 1]!

        exchange +=
          1 - dot3(n, rx) + (1 - dot3(n, ry)) + (1 - dot3(n, rz))

        const qxy = sphericalTriangleArea(n, rx, ry),
          qyz = sphericalTriangleArea(n, ry, rz),
          qzx = sphericalTriangleArea(n, rz, rx)

        skyrme += qxy * qxy + qyz * qyz + qzx * qzx
      }
    }
  }

  return { exchange, skyrme }
}
