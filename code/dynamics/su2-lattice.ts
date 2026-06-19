// Non-Abelian SU(2) lattice gauge theory on a periodic hypercubic lattice.
// Stage C of the gauge ladder (P8): past the U(1) Stages A and B toward the
// strong force. SU(2) elements are unit quaternions. The Wilson action is
// S = beta * sum over plaquettes of (1 - (1/2) Tr U_plaq). Confinement shows up
// as an area law for Wilson loops, measured by the Creutz ratio (the string
// tension).

import { Rng } from '@/code/tool/rng'

// An SU(2) element as a unit quaternion (q0 + q1 i + q2 j + q3 k). The matrix is
// q0 I + i (q . sigma), so (1/2) Tr U = q0.
export type Quat = readonly [number, number, number, number]

const IDENTITY: Quat = [1, 0, 0, 0]

function qmul(a: Quat, b: Quat): Quat {
  const a0 = a[0]
  const a1 = a[1]
  const a2 = a[2]
  const a3 = a[3]
  const b0 = b[0]
  const b1 = b[1]
  const b2 = b[2]
  const b3 = b[3]
  return [
    a0 * b0 - a1 * b1 - a2 * b2 - a3 * b3,
    a0 * b1 + a1 * b0 + a2 * b3 - a3 * b2,
    a0 * b2 - a1 * b3 + a2 * b0 + a3 * b1,
    a0 * b3 + a1 * b2 - a2 * b1 + a3 * b0,
  ]
}

function qdag(a: Quat): Quat {
  return [a[0], -a[1], -a[2], -a[3]]
}

function qadd(a: Quat, b: Quat): Quat {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]]
}

function halfTrace(a: Quat): number {
  return a[0]
}

function normalize(a: Quat): Quat {
  const n = Math.hypot(a[0], a[1], a[2], a[3]) || 1
  return [a[0] / n, a[1] / n, a[2] / n, a[3] / n]
}

// A random SU(2) near the identity: identity perturbed by a small rotation. eps
// sets the Metropolis step size.
function randomNear(input: { eps: number; rng: Rng }): Quat {
  const e = input.eps
  return normalize([
    1,
    e * input.rng.nextGaussian(),
    e * input.rng.nextGaussian(),
    e * input.rng.nextGaussian(),
  ])
}

function randomSu2(input: { rng: Rng }): Quat {
  return normalize([
    input.rng.nextGaussian(),
    input.rng.nextGaussian(),
    input.rng.nextGaussian(),
    input.rng.nextGaussian(),
  ])
}

export interface Su2Lattice {
  readonly form: 'su2-lattice'
  readonly dim: number
  readonly length: number // sites per axis
  readonly sites: number
  readonly stride: ReadonlyArray<number>
  // links[(site * dim + mu) * 4 + c]
  readonly links: Float64Array
}

export function makeSu2Lattice(input: {
  dim: number
  length: number
  hot: boolean
  rng: Rng
}): Su2Lattice {
  const dim = input.dim
  const L = input.length
  let sites = 1
  const stride: number[] = []
  for (let mu = 0; mu < dim; mu++) {
    stride.push(sites)
    sites *= L
  }
  const links = new Float64Array(sites * dim * 4)
  for (let s = 0; s < sites; s++) {
    for (let mu = 0; mu < dim; mu++) {
      const q = input.hot ? randomSu2({ rng: input.rng }) : IDENTITY
      const o = (s * dim + mu) * 4
      links[o] = q[0]
      links[o + 1] = q[1]
      links[o + 2] = q[2]
      links[o + 3] = q[3]
    }
  }
  return { form: 'su2-lattice', dim, length: L, sites, stride, links }
}

function stepPlus(
  lat: Su2Lattice,
  input: { site: number; mu: number },
): number {
  const st = lat.stride[input.mu] ?? 1
  const c = Math.floor(input.site / st) % lat.length
  return c === lat.length - 1
    ? input.site - (lat.length - 1) * st
    : input.site + st
}

function stepMinus(
  lat: Su2Lattice,
  input: { site: number; mu: number },
): number {
  const st = lat.stride[input.mu] ?? 1
  const c = Math.floor(input.site / st) % lat.length
  return c === 0 ? input.site + (lat.length - 1) * st : input.site - st
}

function getLink(
  lat: Su2Lattice,
  input: { site: number; mu: number },
): Quat {
  const o = (input.site * lat.dim + input.mu) * 4
  return [
    lat.links[o] ?? 0,
    lat.links[o + 1] ?? 0,
    lat.links[o + 2] ?? 0,
    lat.links[o + 3] ?? 0,
  ]
}

function setLink(
  lat: Su2Lattice,
  input: { site: number; mu: number; q: Quat },
): void {
  const o = (input.site * lat.dim + input.mu) * 4
  lat.links[o] = input.q[0]
  lat.links[o + 1] = input.q[1]
  lat.links[o + 2] = input.q[2]
  lat.links[o + 3] = input.q[3]
}

// Sum of the staples around link (site, mu): the product of the other three
// links of each plaquette containing it (forward and backward in each other
// direction). The plaquette-sum action of the link is (1/2) Tr(U_mu(site) * A).
function staple(
  lat: Su2Lattice,
  input: { site: number; mu: number },
): Quat {
  const mu = input.mu
  const x = input.site
  let a: Quat = [0, 0, 0, 0]
  for (let nu = 0; nu < lat.dim; nu++) {
    if (nu === mu) {
      continue
    }
    const xMu = stepPlus(lat, { site: x, mu })
    const xNu = stepPlus(lat, { site: x, mu: nu })
    // forward staple: U_nu(x+mu) U_mu(x+nu)^dag U_nu(x)^dag
    const forward = qmul(
      qmul(
        getLink(lat, { site: xMu, mu: nu }),
        qdag(getLink(lat, { site: xNu, mu })),
      ),
      qdag(getLink(lat, { site: x, mu: nu })),
    )
    // backward staple: U_nu(x+mu-nu)^dag U_mu(x-nu)^dag U_nu(x-nu)
    const xMuMnu = stepMinus(lat, { site: xMu, mu: nu })
    const xMnu = stepMinus(lat, { site: x, mu: nu })
    const backward = qmul(
      qmul(
        qdag(getLink(lat, { site: xMuMnu, mu: nu })),
        qdag(getLink(lat, { site: xMnu, mu })),
      ),
      getLink(lat, { site: xMnu, mu: nu }),
    )
    a = qadd(a, qadd(forward, backward))
  }
  return a
}

// One Metropolis sweep over every link at inverse coupling beta. Returns the
// acceptance rate.
export function metropolisSweep(input: {
  lattice: Su2Lattice
  beta: number
  eps: number
  rng: Rng
}): number {
  const lat = input.lattice
  let accepted = 0
  let proposed = 0
  for (let s = 0; s < lat.sites; s++) {
    for (let mu = 0; mu < lat.dim; mu++) {
      const u = getLink(lat, { site: s, mu })
      const a = staple(lat, { site: s, mu })
      const r = randomNear({ eps: input.eps, rng: input.rng })
      const uNew = qmul(r, u)
      // S contribution ~ beta * (const - (1/2)Tr(U A)); dS = -beta * dTr.
      const dTr = halfTrace(qmul(uNew, a)) - halfTrace(qmul(u, a))
      const dS = -input.beta * dTr
      proposed += 1
      if (dS <= 0 || input.rng.next() < Math.exp(-dS)) {
        setLink(lat, { site: s, mu, q: uNew })
        accepted += 1
      }
    }
  }
  return proposed === 0 ? 0 : accepted / proposed
}

// Average plaquette (1/2)Tr U_plaq over the whole lattice. Near 0 in the
// disordered (strong-coupling) phase, near 1 in the ordered (weak-coupling) one.
export function averagePlaquette(input: {
  lattice: Su2Lattice
}): number {
  const lat = input.lattice
  let total = 0
  let count = 0
  for (let s = 0; s < lat.sites; s++) {
    for (let mu = 0; mu < lat.dim; mu++) {
      for (let nu = mu + 1; nu < lat.dim; nu++) {
        const xMu = stepPlus(lat, { site: s, mu })
        const xNu = stepPlus(lat, { site: s, mu: nu })
        const plaq = qmul(
          qmul(
            getLink(lat, { site: s, mu }),
            getLink(lat, { site: xMu, mu: nu }),
          ),
          qmul(
            qdag(getLink(lat, { site: xNu, mu })),
            qdag(getLink(lat, { site: s, mu: nu })),
          ),
        )
        total += halfTrace(plaq)
        count += 1
      }
    }
  }
  return count === 0 ? 0 : total / count
}

// Average R-by-T Wilson loop (1/2)Tr over all base sites and all planes.
export function wilsonLoop(input: {
  lattice: Su2Lattice
  r: number
  t: number
}): number {
  const lat = input.lattice
  let total = 0
  let count = 0
  for (let mu = 0; mu < lat.dim; mu++) {
    for (let nu = 0; nu < lat.dim; nu++) {
      if (nu === mu) {
        continue
      }
      for (let s = 0; s < lat.sites; s++) {
        let u: Quat = IDENTITY
        let p = s
        for (let i = 0; i < input.r; i++) {
          u = qmul(u, getLink(lat, { site: p, mu }))
          p = stepPlus(lat, { site: p, mu })
        }
        for (let i = 0; i < input.t; i++) {
          u = qmul(u, getLink(lat, { site: p, mu: nu }))
          p = stepPlus(lat, { site: p, mu: nu })
        }
        for (let i = 0; i < input.r; i++) {
          p = stepMinus(lat, { site: p, mu })
          u = qmul(u, qdag(getLink(lat, { site: p, mu })))
        }
        for (let i = 0; i < input.t; i++) {
          p = stepMinus(lat, { site: p, mu: nu })
          u = qmul(u, qdag(getLink(lat, { site: p, mu: nu })))
        }
        total += halfTrace(u)
        count += 1
      }
    }
  }
  return count === 0 ? 0 : total / count
}

// The Creutz ratio chi(r, t) = -ln[ W(r,t) W(r-1,t-1) / (W(r-1,t) W(r,t-1)) ].
// In the continuum limit it tends to the string tension. A positive,
// scale-stable value is the signature of confinement (an area law).
export function creutzRatio(input: {
  lattice: Su2Lattice
  r: number
  t: number
}): number {
  const w = (r: number, t: number): number =>
    wilsonLoop({ lattice: input.lattice, r, t })
  const a = w(input.r, input.t)
  const b = w(input.r - 1, input.t - 1)
  const c = w(input.r - 1, input.t)
  const d = w(input.r, input.t - 1)
  const numerator = a * b
  const denominator = c * d
  if (numerator <= 0 || denominator <= 0) {
    return 0
  }
  return -Math.log(numerator / denominator)
}
