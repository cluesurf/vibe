// The paid string is a 3-state Potts model: the duality behind the nuclei experiments (E-FRC-0195 to 0199).
//
// The paid-string rule (code/rule/string-graph) reads its flux only mod 3 and weighs a history, in the canonical
// measure its demons impose, by x^(paid links), x = exp(-beta tension). So the equilibrium weight of a set of
// charges rho (+1 a love, -1 a fear) is the sum over Z3 1-chains E with divergence rho mod 3:
//
//   Z(rho) = sum over E with div E = rho (mod 3) of  prod over links  w(E_l),   w(0) = 1, w(1) = w(2) = x
//
// Writing each dock's constraint as (1/3) sum over theta_x in Z3 of omega^(theta_x (div E_x - rho_x)) and
// summing each link's value on its own gives, with omega = e^(2 pi i / 3):
//
//   Z(rho) = 3^(-V) sum over theta of  omega^(-sum_x theta_x rho_x)  prod over links (a, b)  f(theta_a - theta_b)
//   f(0) = 1 + 2x,   f(1) = f(2) = 1 - x
//
// which is the 3-state Potts model at coupling K = ln((1 + 2x) / (1 - x)), each love an insertion of
// omega^(-theta) and each fear of omega^(theta). The meson's weight is the Potts spin-spin correlator, a singlet
// pair's is its energy-energy correlator. The string rule's history sum is the high-temperature (strong
// coupling) expansion of that model, and the rule's dynamics is a deterministic worm algorithm for it.
//
// Both sides are computed here by brute force on a small graph, for an exact check of the identity.

export type SmallGraph = {
  readonly docks: number
  readonly links: readonly (readonly [number, number])[]
}

// every Z3 chain on the graph: for each divergence pattern (as a key), the chain weight sum at x, the smallest
// support, and how many chains have that smallest support
export function chainSums(graph: SmallGraph, x: number): Map<string, { weight: number; least: number; atLeast: number }> {
  const { docks, links } = graph
  const out = new Map<string, { weight: number; least: number; atLeast: number }>()
  const total = 3 ** links.length
  const value = new Int8Array(links.length)
  const divergence = new Int32Array(docks)

  for (let code = 0; code < total; code++) {
    let c = code
    let support = 0

    divergence.fill(0)

    for (let l = 0; l < links.length; l++) {
      value[l] = c % 3
      c = Math.floor(c / 3)

      const [a, b] = links[l] ?? [0, 0]
      const v = value[l] ?? 0

      if (v !== 0) {
        support += 1
      }

      divergence[a] = (divergence[a] ?? 0) + v
      divergence[b] = (divergence[b] ?? 0) - v
    }

    const key = Array.from(divergence, d => ((d % 3) + 3) % 3).join('')
    const entry = out.get(key) ?? { weight: 0, least: Infinity, atLeast: 0 }

    entry.weight += x ** support

    if (support < entry.least) {
      entry.least = support
      entry.atLeast = 1
    } else if (support === entry.least) {
      entry.atLeast += 1
    }

    out.set(key, entry)
  }

  return out
}

// the Potts side: 3^(-V) sum over theta of omega^(-theta . rho) prod f(theta_a - theta_b), real part and
// imaginary part, for a charge pattern given mod 3 (1 a love, 2 a fear)
export function pottsSum(graph: SmallGraph, x: number, rho: readonly number[]): { re: number; im: number } {
  const { docks, links } = graph
  const total = 3 ** docks
  const theta = new Int8Array(docks)

  let re = 0
  let im = 0

  for (let code = 0; code < total; code++) {
    let c = code

    for (let d = 0; d < docks; d++) {
      theta[d] = c % 3
      c = Math.floor(c / 3)
    }

    let weight = 1

    for (const [a, b] of links) {
      weight *= theta[a] === theta[b] ? 1 + 2 * x : 1 - x
    }

    let phase = 0

    for (let d = 0; d < docks; d++) {
      phase -= (theta[d] ?? 0) * (rho[d] ?? 0)
    }

    const angle = (2 * Math.PI * (((phase % 3) + 3) % 3)) / 3

    re += weight * Math.cos(angle)
    im += weight * Math.sin(angle)
  }

  return { re: re / total, im: im / total }
}

// the product (1 + 2x)^s (1 - x)^(n - s) as integer coefficients, lowest power first
function linkPolynomial(s: number, n: number): number[] {
  let poly = [1]

  const times = (factor: number[]): void => {
    const out = new Array<number>(poly.length + factor.length - 1).fill(0)

    poly.forEach((a, i) => factor.forEach((b, j) => (out[i + j] = (out[i + j] ?? 0) + a * b)))
    poly = out
  }

  for (let k = 0; k < s; k++) {
    times([1, 2])
  }

  for (let k = 0; k < n - s; k++) {
    times([1, -1])
  }

  return poly
}

// The duality as an identity of integer polynomials in x, with no rounding. For each charge pattern rho the
// chain side is sum_n c_n x^n, c_n the number of Z3 chains of support n with divergence rho. The Potts side
// splits the 3^V angle patterns by their phase class k = -theta . rho mod 3 and by the number s of links whose
// ends agree, P_k(x) = sum over them of (1 + 2x)^s (1 - x)^(L - s). Since cos(2 pi k / 3) is 1, -1/2, -1/2 and
// sin is 0, +-sqrt(3)/2, the identity is exactly 2 3^V c(x) = 2 P_0 - P_1 - P_2 with P_1 = P_2 (the imaginary
// part zero), coefficient by coefficient. Every coefficient stays below 2^53, so plain numbers are exact.
export function exactDuality(graph: SmallGraph): { patterns: number; mismatches: number; imaginaryMismatches: number } {
  const { docks, links } = graph
  const L = links.length
  const sums = chainCounts(graph)
  const polys = Array.from({ length: L + 1 }, (_, s) => linkPolynomial(s, L))
  const total = 3 ** docks
  const theta = new Int8Array(docks)

  let mismatches = 0
  let imaginaryMismatches = 0
  let patterns = 0

  for (const [key, counts] of sums) {
    const rho = key.split('').map(Number)
    const classes = [new Array<number>(L + 1).fill(0), new Array<number>(L + 1).fill(0), new Array<number>(L + 1).fill(0)]

    for (let code = 0; code < total; code++) {
      let c = code
      let phase = 0

      for (let d = 0; d < docks; d++) {
        theta[d] = c % 3
        c = Math.floor(c / 3)
        phase -= (theta[d] ?? 0) * (rho[d] ?? 0)
      }

      let s = 0

      for (const [a, b] of links) {
        s += theta[a] === theta[b] ? 1 : 0
      }

      const k = ((phase % 3) + 3) % 3
      const row = classes[k] ?? []

      row[s] = (row[s] ?? 0) + 1
    }

    const potts = classes.map(row => {
      const out = new Array<number>(L + 1).fill(0)

      row.forEach((count, s) => (polys[s] ?? []).forEach((coefficient, n) => (out[n] = (out[n] ?? 0) + count * coefficient)))

      return out
    })

    for (let n = 0; n <= L; n++) {
      const left = 2 * total * (counts[n] ?? 0)
      const right = 2 * (potts[0]?.[n] ?? 0) - (potts[1]?.[n] ?? 0) - (potts[2]?.[n] ?? 0)

      mismatches += left === right ? 0 : 1
      imaginaryMismatches += potts[1]?.[n] === potts[2]?.[n] ? 0 : 1
    }

    patterns += 1
  }

  return { patterns, mismatches, imaginaryMismatches }
}

// for each divergence pattern (as a key), the number of Z3 chains of each support 0 .. L
function chainCounts(graph: SmallGraph): Map<string, number[]> {
  const { docks, links } = graph
  const out = new Map<string, number[]>()
  const total = 3 ** links.length
  const divergence = new Int32Array(docks)

  for (let code = 0; code < total; code++) {
    let c = code
    let support = 0

    divergence.fill(0)

    for (let l = 0; l < links.length; l++) {
      const v = c % 3

      c = Math.floor(c / 3)

      const [a, b] = links[l] ?? [0, 0]

      support += v !== 0 ? 1 : 0
      divergence[a] = (divergence[a] ?? 0) + v
      divergence[b] = (divergence[b] ?? 0) - v
    }

    const key = Array.from(divergence, d => ((d % 3) + 3) % 3).join('')
    const row = out.get(key) ?? new Array<number>(links.length + 1).fill(0)

    row[support] = (row[support] ?? 0) + 1
    out.set(key, row)
  }

  return out
}
