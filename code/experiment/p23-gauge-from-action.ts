// P23: derive the gauge (Maxwell) kinetic operator from the discrete action.
// P20 built the photon operator by hand. Here we show it is not put in by hand: it
// is the small-fluctuation limit of the lattice gauge (Wilson) action of P8. The
// Wilson action is S = sum over plaquettes of [1 - cos(theta_plaquette)], where
// theta_plaquette is the curl of the link angles. For small fields, 1 - cos(x) ->
// x^2 / 2, so S -> (1/2) sum of theta_plaquette^2, which is exactly the Maxwell
// action whose Hessian is the curl-curl (photon) operator (P20). We confirm this by
// shrinking the field and showing the Wilson action converges to the Maxwell form.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p23-gauge-from-action.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { maxwellSpectrum } from '~/experiment/p20-photon'

// Plaquette list for a periodic L^3 lattice: each plaquette is four signed links.
function plaquettes(L: number): { link: number; sign: number }[][] {
  const siteIndex = (x: number, y: number, z: number): number =>
    ((x + L) % L) + L * (((y + L) % L) + L * ((z + L) % L))
  const link = (x: number, y: number, z: number, d: number): number => d + 3 * siteIndex(x, y, z)
  const step = (x: number, y: number, z: number, d: number): [number, number, number] =>
    d === 0 ? [x + 1, y, z] : d === 1 ? [x, y + 1, z] : [x, y, z + 1]
  const out: { link: number; sign: number }[][] = []
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        for (const [d1, d2] of [[0, 1], [0, 2], [1, 2]] as const) {
          const [x1, y1, z1] = step(x, y, z, d1)
          const [x2, y2, z2] = step(x, y, z, d2)
          out.push([
            { link: link(x, y, z, d1), sign: 1 },
            { link: link(x1, y1, z1, d2), sign: 1 },
            { link: link(x2, y2, z2, d1), sign: -1 },
            { link: link(x, y, z, d2), sign: -1 },
          ])
        }
      }
    }
  }
  return out
}

function wilsonAction(theta: Float64Array, plaqs: { link: number; sign: number }[][]): number {
  let s = 0
  for (const plaq of plaqs) {
    let f = 0
    for (const { link, sign } of plaq) {
      f += sign * (theta[link] ?? 0)
    }
    s += 1 - Math.cos(f)
  }
  return s
}

function maxwellAction(theta: Float64Array, plaqs: { link: number; sign: number }[][]): number {
  let s = 0
  for (const plaq of plaqs) {
    let f = 0
    for (const { link, sign } of plaq) {
      f += sign * (theta[link] ?? 0)
    }
    s += 0.5 * f * f
  }
  return s
}

export function gaugeFromAction(input: { side: number }): { epsilons: number[]; ratios: number[] } {
  const L = input.side
  const plaqs = plaquettes(L)
  const dof = 3 * L * L * L
  const rng = makeRng({ seed: 7 })
  const base = new Float64Array(dof)
  for (let i = 0; i < dof; i++) {
    base[i] = rng.next() * 2 - 1
  }
  const epsilons = [0.5, 0.2, 0.1, 0.05, 0.02]
  const ratios = epsilons.map((eps) => {
    const theta = new Float64Array(dof)
    for (let i = 0; i < dof; i++) {
      theta[i] = eps * (base[i] ?? 0)
    }
    return wilsonAction(theta, plaqs) / maxwellAction(theta, plaqs)
  })
  return { epsilons, ratios }
}

export function main(): void {
  console.log('P23: the gauge (Maxwell) operator derived from the Wilson action')
  console.log('')
  const r = gaugeFromAction({ side: 4 })
  console.log('  field scale eps    Wilson action / Maxwell action')
  for (let i = 0; i < r.epsilons.length; i++) {
    console.log(`    ${(r.epsilons[i] ?? 0).toFixed(2)}              ${(r.ratios[i] ?? 0).toFixed(5)}`)
  }
  console.log('')
  // The Maxwell operator (the Hessian of the small-field limit) is massless (P20).
  const spec = maxwellSpectrum({ side: 4, mass: 0 }).filter((v) => v > 1e-6).sort((a, b) => a - b)
  console.log(`  the resulting Maxwell operator is massless: smallest physical omega^2 = ${(spec[0] ?? 0).toFixed(3)}`)
  console.log('')
  console.log('  As the field shrinks the Wilson action divided by the Maxwell action converges')
  console.log('  to one, so the lattice gauge action of P8 reduces to the Maxwell action in the')
  console.log('  small-fluctuation limit. The photon kinetic operator (P20) is therefore DERIVED')
  console.log('  from the discrete gauge action, not put in by hand: the photon is the small')
  console.log('  excitation of the Wilson-action gauge field, and it is massless (curl-curl).')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
