// A periodic hypercubic lattice with its own length on every axis, the geometry of lattice gauge
// theory. Axis 0 varies fastest. The last axis is the time axis by convention, so a finite
// temperature lattice is an L^3 x N_t box with N_t short.
//
// Neighbour tables are precomputed once: up[site * dim + mu] is site + mu-hat, down[...] is
// site - mu-hat, both wrapping around.

export type Hypercubic = {
  readonly form: 'hypercubic'
  readonly dim: number
  readonly lengths: readonly number[]
  readonly sites: number
  readonly up: Int32Array
  readonly down: Int32Array
}

export function makeHypercubic(input: { lengths: readonly number[] }): Hypercubic {
  const lengths = input.lengths
  const dim = lengths.length
  const stride: number[] = []

  let sites = 1

  for (const length of lengths) {
    stride.push(sites)
    sites *= length
  }

  const up = new Int32Array(sites * dim)
  const down = new Int32Array(sites * dim)

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      const length = lengths[mu] ?? 1
      const step = stride[mu] ?? 1
      const coordinate = Math.floor(site / step) % length

      up[site * dim + mu] =
        coordinate === length - 1 ? site - (length - 1) * step : site + step

      down[site * dim + mu] =
        coordinate === 0 ? site + (length - 1) * step : site - step
    }
  }

  return { form: 'hypercubic', dim, lengths, sites, up, down }
}

// The coordinates of a site, axis 0 first.
export function siteCoordinates(input: {
  lattice: Hypercubic
  site: number
}): number[] {
  const out: number[] = []

  let rest = input.site

  for (const length of input.lattice.lengths) {
    out.push(rest % length)
    rest = Math.floor(rest / length)
  }

  return out
}

// The site at the given coordinates, each wrapped into range.
export function siteAt(input: {
  lattice: Hypercubic
  coordinates: readonly number[]
}): number {
  let site = 0
  let step = 1

  input.lattice.lengths.forEach((length, mu) => {
    const c = (((input.coordinates[mu] ?? 0) % length) + length) % length

    site += c * step
    step *= length
  })

  return site
}

// Walk `count` steps along +mu (a negative count walks along -mu).
export function shiftSite(input: {
  lattice: Hypercubic
  site: number
  mu: number
  count: number
}): number {
  const { lattice, mu } = input
  const table = input.count >= 0 ? lattice.up : lattice.down
  const steps = Math.abs(input.count)

  let site = input.site

  for (let i = 0; i < steps; i++) {
    site = table[site * lattice.dim + mu] ?? 0
  }

  return site
}
