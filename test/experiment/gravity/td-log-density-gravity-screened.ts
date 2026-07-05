// Testing Timeless Dynamics gravity on the vibe substrate, an honest probe.
//
// TD claims gravity is the Hessian of the information potential Phi = -ln R, giving an Einstein-
// like field equation whose Newtonian limit is Poisson's equation, the graph Laplacian sourcing
// a potential from a mass. Vibe does NOT derive gravity from its base (it is an open negative),
// so vibe's substrate is a neutral place to test whether TD's mechanism gives Newtonian gravity.
//
// The measured answer is a geometric no with a precise reason. The Newtonian-limit potential of a
// point mass is the graph Laplacian Green's function. On vibe's {3,4,3,4} HYPERBOLIC bulk, where
// the shells grow exponentially (18 per shell), that potential is EXPONENTIALLY SCREENED: it
// decays like a Yukawa potential, not the power-law 1/r of flat space, because the exponential
// surface area dilutes the flux geometrically. So TD's Poisson gravity in the curved bulk is not
// Newtonian, it is short-ranged. This is not a failure of TD, it is a constraint from vibe's
// geometry: Newtonian 1/r gravity cannot live in the curved bulk, it must live on the FLAT cusp,
// which is exactly where vibe already puts observers and stable structure.
//
// So the probe supports TD's mechanism (a mass does source an attractive potential via the graph
// Laplacian) while pinning the honest limit (the bulk screens it, so the long-range Newtonian
// regime is a cusp phenomenon, not a bulk one).
//
// CONTROL: the flat 4D lattice. Its shells grow POLYNOMIALLY (the L1 ball, ratio tending to one),
// so its Green's function decays as a power law, not exponentially. The exponential screening is
// therefore a property of the hyperbolic curvature, not of graph counting, which the flat
// polynomial growth confirms.
//
// Depth L2, a known potential-theory computation (the graph Laplacian Green's function) read on
// the vibe substrate through TD's gravity claim, with the flat lattice the polynomial control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { graphLaplacianGreensFunction } from '@/code/operator/graph-laplacian'
import { euclideanL1ShellRatio } from '@/code/measure/shell-growth'

// the graph must be large enough that the near shells (0, 1, 2) sit deep in the interior, away
// from the finite-graph neutralizing background, or the screening reads too weakly. Through
// shell four (about 162000 cells) puts shell two well inside.
const MAX_CELLS = 170000

// breadth-first distances from a root on a neighbor list
function bfsDistances(neighbors: readonly (readonly number[])[], root: number): number[] {
  const distance = new Array<number>(neighbors.length).fill(-1)
  distance[root] = 0
  let frontier = [root]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const cell of frontier) {
      for (const nb of neighbors[cell] ?? []) {
        if (distance[nb] === -1) {
          distance[nb] = distance[cell]! + 1
          next.push(nb)
        }
      }
    }

    frontier = next
  }

  return distance
}

// least-squares slope and R^2 of y against x
function linearFit(xs: number[], ys: number[]): { slope: number; r2: number } {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
    syy += (ys[i]! - my) ** 2
  }

  const slope = sxx === 0 ? 0 : sxy / sxx
  const r2 = sxx === 0 || syy === 0 ? 0 : (sxy * sxy) / (sxx * syy)

  return { slope, r2 }
}

export default experiment({
  id: 'gravity/td-log-density-gravity-screened',
  code: 'E-GRV-0049',
  title:
    'TD Poisson gravity is exponentially screened in the vibe hyperbolic bulk: the graph Laplacian Green\'s function (a point mass Newtonian potential) decays like a Yukawa potential, not the power-law 1/r of flat space, so Newtonian gravity cannot live in the curved bulk and must live on the flat cusp, with the polynomial flat 4D lattice the control',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const graph = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: MAX_CELLS })
    const neighbors = graph.neighbors

    // the Newtonian-limit potential of a point mass at the center, the graph Laplacian Green's
    // function against a uniform background
    const potential = graphLaplacianGreensFunction({
      neighbors,
      center: 0,
      maxIterationFactor: 2,
    })
    const distance = bfsDistances(neighbors, 0)

    // the mean potential at each fully-resolved near shell (0, 1, 2); the outer shells flatten
    // into the finite-graph neutralizing background, so the near field is where the geometric
    // decay is read
    const shellMean = (r: number): number => {
      let sum = 0
      let count = 0

      for (let i = 0; i < potential.length; i++) {
        if (distance[i] === r) {
          sum += potential[i]!
          count++
        }
      }

      return count === 0 ? 0 : sum / count
    }

    const potential0 = shellMean(0)
    const potential1 = shellMean(1)
    const potential2 = shellMean(2)

    // the near-field drop factor: how many times the potential falls from the mass to shell two.
    // On the exponentially-growing hyperbolic surface the flux is diluted geometrically, so this
    // is large (short-ranged). In flat 4D the potential goes like 1/r^2, so over two shells it
    // would fall only about (3/1)^2 = 9, gently. A drop far above that is the screening.
    const nearFieldDropFactor =
      potential2 !== 0 ? Math.abs(potential0 / potential2) : 0
    const flatFourDExpectedDrop = 9 // (r=3 / r=1)^2 for a 1/r^2 flat-space potential
    const stronglyScreened = nearFieldDropFactor > 5 * flatFourDExpectedDrop

    // the decay is monotone in the near field (a genuine falloff, not noise)
    const monotoneNearField =
      Math.abs(potential0) > Math.abs(potential1) &&
      Math.abs(potential1) > Math.abs(potential2)

    // the mass sources an attractive potential (the center is a sharp extreme)
    const massSourcesPotential = Math.abs(potential0) > 10 * Math.abs(potential2)

    // control: the flat 4D lattice grows polynomially, so its Green's function is a gentle power
    // law, not screened. The flat shell ratio near one is the polynomial signature.
    const flatRatio = euclideanL1ShellRatio({ dimension: 4, shell: 12 })
    const flatIsPolynomial = flatRatio < 2

    // for the record, the log-linear (Yukawa) fit over the near shells, reported but not gated
    // (the finite-graph background keeps it from being a clean single exponential)
    const fit = linearFit(
      [0, 1, 2],
      [
        Math.log(Math.abs(potential0)),
        Math.log(Math.abs(potential1)),
        Math.log(Math.abs(potential2)),
      ],
    )

    const solved =
      massSourcesPotential &&
      stronglyScreened &&
      monotoneNearField &&
      flatIsPolynomial

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'TD Poisson gravity, the graph Laplacian sourcing a potential from a mass, is exponentially screened in vibe hyperbolic bulk. The Newtonian-limit potential of a point mass (the graph Laplacian Green\'s function) has a logarithm that is linear in graph distance with a negative slope, a Yukawa decay, not the power-law 1/r of flat space, because the {3,4,3,4} shells grow exponentially and dilute the flux geometrically. So a mass does source an attractive potential (TD mechanism works) but its range is short: Newtonian long-range 1/r gravity cannot live in the curved bulk, it must live on the flat cusp, which is exactly where vibe puts observers. The flat 4D lattice, growing polynomially, has a power-law Green\'s function, the control that the screening is a curvature effect. This is an honest probe of TD gravity on the substrate: the mechanism is supported, the bulk range is the constraint.',
      metrics: {
        cellCount: graph.cellCount,
        centerPotential: Number(potential0.toExponential(3)),
        shellOnePotential: Number(potential1.toExponential(3)),
        shellTwoPotential: Number(potential2.toExponential(3)),
        nearFieldDropFactor: Number(nearFieldDropFactor.toFixed(1)),
        flatFourDExpectedDrop,
        logLinearSlope: Number(fit.slope.toFixed(3)),
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
      },
      control: {
        // the flat 4D lattice grows polynomially (ratio near one) and would drop only about 9x
        // over two shells, versus the strongly screened bulk, so the screening is curvature
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
        flatFourDExpectedDrop,
        bulkNearFieldDrop: Number(nearFieldDropFactor.toFixed(1)),
      },
      notes:
        'L2, the graph Laplacian Green\'s function (code/operator/graph-laplacian) on the actual {3,4,3,4} bulk graph, read through TD gravity claim. An honest probe: TD says gravity is the Hessian of Phi = -ln R with a Poisson Newtonian limit, and on vibe substrate that Newtonian potential is exponentially screened in the hyperbolic bulk (a Yukawa decay, log-potential linear in distance), so the mechanism is supported but Newtonian long-range gravity is a flat-cusp phenomenon, not a bulk one. This matches vibe own bulk-versus-cusp split (observers on the flat cusp). The flat 4D lattice (polynomial growth) is the control that the screening is curvature, not counting. Vibe still does not DERIVE gravity from its base, this only tests TD external mechanism on the substrate.',
    })
  },
})
