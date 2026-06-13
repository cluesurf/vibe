// P23: derive the gauge (Maxwell) kinetic operator from the discrete action.
// P20 built the photon operator by hand. Here we show it is not put in by hand: it
// is the small-fluctuation limit of the lattice gauge (Wilson) action of P8. The
// Wilson action is S = sum over plaquettes of [1 - cos(theta_plaquette)], where
// theta_plaquette is the curl of the link angles. For small fields, 1 - cos(x) ->
// x^2 / 2, so S -> (1/2) sum of theta_plaquette^2, which is exactly the Maxwell
// action whose Hessian is the curl-curl (photon) operator (P20). We confirm this by
// shrinking the field and showing the Wilson action converges to the Maxwell form.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p23-gauge-from-action.ts

import { makeRng } from '@/code/tool/rng'
import { maxwellSpectrum } from '@/test/experiment/gauge/photon'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

export default defineExperiment({
  id: 'gauge/gauge-from-action',
  title:
    'the Maxwell operator is derived from the Wilson gauge action in the small-field limit',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = gaugeFromAction({ side: 4 })
    const last = r.ratios[r.ratios.length - 1] ?? 0
    const ok = last > 0.999 && last < 1.001
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ratio of the Wilson action to the Maxwell action converges to one as the field shrinks, so the Maxwell operator follows from the Wilson action',
      metrics: {
        wilsonMaxwellRatio: last,
      },
    })
  },
})
