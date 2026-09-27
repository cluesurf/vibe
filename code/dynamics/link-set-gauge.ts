// Lattice gauge theory whose links take values in a finite SET of SU(3) matrices rather than a group.
// It measures how much non-classical ("magic") color a base would need. The set is a union of double
// cosets of a gauge group G, for example Sigma(648) and Sigma(648) T Sigma(648), with T a single
// non-Clifford element. Left and right multiplication by G maps the set to itself, so the theory is
// gauge invariant under G at every site even though the set is not closed under products.
//
// Each link holds an index into the list. The heatbath draws a link from exp(-S_local) over the whole
// set, S_local = -(beta / 3) Re Tr(U A) + mu [U is magic], A the sum of the six staples, computed as
// matrices. The cost mu is the dial: it sets how often a link carries a magic element, and
// mu = infinity recovers the gauge group alone.

import { Weyl } from '@/code/tool/weyl'
import { Hypercubic, makeHypercubic } from '@/code/tool/hypercubic'
import { Matrix3, multiply3 } from '@/code/dynamics/finite-gauge'

export type LinkSet = {
  readonly matrices: readonly Matrix3[]
  // 1 for an element outside the gauge group (a magic one), 0 for the group's own
  readonly magic: Uint8Array
}

export type LinkSetLattice = {
  readonly set: LinkSet
  readonly geometry: Hypercubic
  readonly links: Int32Array
}

function dagger(a: Matrix3): Matrix3 {
  const out = new Float64Array(18)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[2 * (3 * i + j)] = a[2 * (3 * j + i)] ?? 0
      out[2 * (3 * i + j) + 1] = -(a[2 * (3 * j + i) + 1] ?? 0)
    }
  }

  return out
}

function keyOf(a: Matrix3): string {
  return Array.from(a, x => Math.round(x * 1e6) || 0).join(',')
}

// The group's own elements (in their order, so the identity stays at index 0), then every element of
// the double cosets G x G for each extra x that is not already present, marked magic.
export function doubleCosetSet(input: {
  group: readonly Matrix3[]
  extras: readonly Matrix3[]
}): LinkSet {
  const matrices: Matrix3[] = [...input.group]
  const seen = new Set(matrices.map(keyOf))

  for (const extra of input.extras) {
    for (const a of input.group) {
      const ax = multiply3(a, extra)

      for (const b of input.group) {
        const element = multiply3(ax, b)
        const key = keyOf(element)

        if (!seen.has(key)) {
          seen.add(key)
          matrices.push(element)
        }
      }
    }
  }

  const magic = new Uint8Array(matrices.length)

  magic.fill(1, input.group.length)

  return { matrices, magic }
}

// Every link starts at element 0 (cold, the identity when the list begins with it) or at a seeded
// element (hot).
export function makeLinkSetLattice(input: {
  set: LinkSet
  lengths: readonly number[]
  start: 'cold' | 'hot'
  rng: Weyl
}): LinkSetLattice {
  const geometry = makeHypercubic({ lengths: input.lengths })
  const links = new Int32Array(geometry.sites * geometry.dim)

  if (input.start === 'hot') {
    for (let k = 0; k < links.length; k++) {
      links[k] = Math.floor(
        input.rng.next() * input.set.matrices.length,
      )
    }
  }

  return { set: input.set, geometry, links }
}

// magicCost is the extra action a link pays for holding a magic element, 0 by default.
export function linkSetHeatbathSweep(input: {
  lattice: LinkSetLattice
  beta: number
  magicCost?: number
  rng: Weyl
}): void {
  const { lattice, beta, rng, magicCost = 0 } = input
  const { set, geometry, links } = lattice
  const { dim, sites, up, down } = geometry
  const n = set.matrices.length
  const matrixOf = (s: number, d: number): Matrix3 =>
    set.matrices[links[s * dim + d] ?? 0] ?? new Float64Array(18)
  const staple = new Float64Array(18)
  const action = new Float64Array(n)
  const weights = new Float64Array(n)

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      staple.fill(0)

      const siteUp = up[site * dim + mu] ?? 0

      for (let nu = 0; nu < dim; nu++) {
        if (nu === mu) {
          continue
        }

        const forward = multiply3(
          multiply3(
            matrixOf(siteUp, nu),
            dagger(matrixOf(up[site * dim + nu] ?? 0, mu)),
          ),
          dagger(matrixOf(site, nu)),
        )
        const below = down[site * dim + nu] ?? 0
        const backward = multiply3(
          multiply3(
            dagger(matrixOf(down[siteUp * dim + nu] ?? 0, nu)),
            dagger(matrixOf(below, mu)),
          ),
          matrixOf(below, nu),
        )

        for (let k = 0; k < 18; k++) {
          staple[k] =
            (staple[k] ?? 0) + (forward[k] ?? 0) + (backward[k] ?? 0)
        }
      }

      let largest = Number.NEGATIVE_INFINITY

      for (let g = 0; g < n; g++) {
        const m = set.matrices[g]

        let sum = 0

        // Re Tr(U A) = sum_ij Re(U_ij A_ji)
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            sum +=
              (m?.[2 * (3 * i + j)] ?? 0) *
                (staple[2 * (3 * j + i)] ?? 0) -
              (m?.[2 * (3 * i + j) + 1] ?? 0) *
                (staple[2 * (3 * j + i) + 1] ?? 0)
          }
        }

        action[g] =
          (beta / 3) * sum - (set.magic[g] === 1 ? magicCost : 0)
        largest = Math.max(largest, action[g] ?? 0)
      }

      let total = 0

      for (let g = 0; g < n; g++) {
        const w = Math.exp((action[g] ?? 0) - largest)

        weights[g] = w
        total += w
      }

      let pick = rng.next() * total
      let chosen = 0

      while (chosen < n - 1 && pick > (weights[chosen] ?? 0)) {
        pick -= weights[chosen] ?? 0
        chosen += 1
      }

      links[site * dim + mu] = chosen
    }
  }
}

// The mean plaquette Re Tr U_p / 3.
export function linkSetPlaquette(input: {
  lattice: LinkSetLattice
}): number {
  const { set, geometry, links } = input.lattice
  const { dim, sites, up } = geometry
  const matrixOf = (s: number, d: number): Matrix3 =>
    set.matrices[links[s * dim + d] ?? 0] ?? new Float64Array(18)

  let sum = 0
  let count = 0

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        const p = multiply3(
          multiply3(
            multiply3(
              matrixOf(site, mu),
              matrixOf(up[site * dim + mu] ?? 0, nu),
            ),
            dagger(matrixOf(up[site * dim + nu] ?? 0, mu)),
          ),
          dagger(matrixOf(site, nu)),
        )

        sum += ((p[0] ?? 0) + (p[8] ?? 0) + (p[16] ?? 0)) / 3
        count += 1
      }
    }
  }

  return sum / count
}

// The share of links holding a magic element.
export function magicFraction(input: {
  lattice: LinkSetLattice
}): number {
  const { set, links } = input.lattice

  let count = 0

  for (const link of links) {
    count += set.magic[link] ?? 0
  }

  return count / links.length
}
