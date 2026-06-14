// A reduced continuous spin field that hosts a DM-stabilized bound Skyrmion, the reduced model of localized
// REVERSIBLE TOPOLOGICAL BINDING (the binding half of the self). Each cell carries a unit spin (a direction on S2,
// the coarse-grained tone-direction). Exchange wants alignment, a Dzyaloshinskii-Moriya (DM) term fixes the twist
// rate (so the Skyrmion SIZE, the stabilizer that exchange alone lacks, Derrick), and a perpendicular field B keeps
// the background uniform. The topological charge Q (the Skyrmion degree) is an integer, the self's identity, bound
// at a fixed size by the DM stabilizer. Reversible precession (rotate each spin around its local field) preserves
// the spin length and is reversible. This is the continuous mechanism, the discrete realization is at the 24-cell
// resolution (see topological-winding-identity). Real numbers here are a measurement of the emergent mechanism, the
// base stays the ternary tone.

export type Spin = [number, number, number]

const cross = (a: Spin, b: Spin): Spin => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: Spin, b: Spin): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const unit = (a: Spin): Spin => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n] }
const rotate = (v: Spin, k: Spin): Spin => {
  const angle = Math.hypot(k[0], k[1], k[2])
  if (angle < 1e-12) return v
  const u: Spin = [k[0] / angle, k[1] / angle, k[2] / angle]
  const c = Math.cos(angle), s = Math.sin(angle), kxv = cross(u, v), kdv = dot(u, v)
  return [v[0] * c + kxv[0] * s + u[0] * kdv * (1 - c), v[1] * c + kxv[1] * s + u[1] * kdv * (1 - c), v[2] * c + kxv[2] * s + u[2] * kdv * (1 - c)]
}
// the four bonds with their interfacial DM vectors (Dhat = zhat cross rhat).
const BONDS: Array<[number, number, Spin]> = [[1, 0, [0, 1, 0]], [-1, 0, [0, -1, 0]], [0, 1, [-1, 0, 0]], [0, -1, [1, 0, 0]]]

export type SkyrmionParams = { size: number; exchange: number; dm: number; field: number }

const at = (size: number, x: number, y: number): number => ((y + size) % size) * size + ((x + size) % size)

// the local effective field, exchange + DM + perpendicular field.
function localField(spins: Spin[], params: SkyrmionParams, x: number, y: number): Spin {
  const { size, exchange, dm, field } = params
  const h: Spin = [0, 0, field]
  for (const [dx, dy, dh] of BONDS) {
    const nb = spins[at(size, x + dx, y + dy)]!
    h[0] += exchange * nb[0]; h[1] += exchange * nb[1]; h[2] += exchange * nb[2]
    const c = cross(nb, dh)
    h[0] -= dm * c[0]; h[1] -= dm * c[1]; h[2] -= dm * c[2]
  }
  return h
}
function pinEdge(out: Spin[], size: number): void {
  for (let i = 0; i < size; i++) { out[at(size, i, 0)] = [0, 0, 1]; out[at(size, i, size - 1)] = [0, 0, 1]; out[at(size, 0, i)] = [0, 0, 1]; out[at(size, size - 1, i)] = [0, 0, 1] }
}

// one DAMPED relaxation step (gradient descent on energy), finds the metastable bound Skyrmion.
export function relaxSpins(input: { spins: Spin[]; params: SkyrmionParams; rate: number }): Spin[] {
  const { spins, params, rate } = input
  const out: Spin[] = new Array(params.size * params.size)
  for (let y = 0; y < params.size; y++) for (let x = 0; x < params.size; x++) {
    const c = spins[at(params.size, x, y)]!
    const h = localField(spins, params, x, y)
    out[at(params.size, x, y)] = unit([c[0] + rate * h[0], c[1] + rate * h[1], c[2] + rate * h[2]])
  }
  pinEdge(out, params.size)
  return out
}
// one REVERSIBLE precession step (rotate each spin around its local field, preserves length, reversible).
export function precessSpins(input: { spins: Spin[]; params: SkyrmionParams; dt: number; open: boolean }): Spin[] {
  const { spins, params, dt, open } = input
  const out: Spin[] = new Array(params.size * params.size)
  for (let y = 0; y < params.size; y++) for (let x = 0; x < params.size; x++) {
    const h = localField(spins, params, x, y)
    out[at(params.size, x, y)] = unit(rotate(spins[at(params.size, x, y)]!, [h[0] * dt, h[1] * dt, h[2] * dt]))
  }
  if (open) pinEdge(out, params.size) // the bath, edge spins held at the vacuum so spin-waves leave
  return out
}

// the topological degree (the Skyrmion charge), the signed solid angle summed over the lattice triangles, an integer.
export function skyrmionDegree(spins: Spin[], size: number): number {
  const solid = (a: Spin, b: Spin, c: Spin): number => {
    const num = dot(a, cross(b, c)), den = 1 + dot(a, b) + dot(b, c) + dot(c, a)
    return 2 * Math.atan2(num, den)
  }
  let q = 0
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
    const a = spins[at(size, x, y)]!, b = spins[at(size, x + 1, y)]!, c = spins[at(size, x + 1, y + 1)]!, d = spins[at(size, x, y + 1)]!
    q += solid(a, b, c) + solid(a, c, d)
  }
  return q / (4 * Math.PI)
}
// the soliton radius (the spread of the down-tilted region), to check it holds a fixed size.
export function skyrmionRadius(spins: Spin[], size: number): number {
  let m = 0, sr = 0
  const c = size / 2
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const w = 1 - spins[at(size, x, y)]![2]; if (w > 0.1) { m += w; sr += w * Math.hypot(x - c, y - c) } }
  return m > 0 ? sr / m : 0
}
// a Neel Skyrmion initial condition (radial in-plane component, up background), degree minus one.
export function makeSkyrmionField(input: { size: number; coreRadius: number }): Spin[] {
  const { size, coreRadius } = input
  const spins: Spin[] = new Array(size * size)
  const c = size / 2
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = x - c, dy = y - c, r = Math.hypot(dx, dy), phi = Math.atan2(dy, dx)
    const theta = r < coreRadius ? Math.PI * (1 - r / coreRadius) : 0
    spins[at(size, x, y)] = unit([Math.cos(phi) * Math.sin(theta), Math.sin(phi) * Math.sin(theta), Math.cos(theta)])
  }
  return spins
}
