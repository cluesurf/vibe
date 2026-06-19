// P68: dimension selection (why three, of the allowed two, three, four).
// P62 showed the crystal substrate can only exist in spatial dimensions 2, 3, 4. Which of those
// does the universe pick, and why three? The decisive criterion is Ehrenfest's (1917): only in
// three spatial dimensions do STABLE, CLOSED gravitational orbits exist. Gravity in d spatial
// dimensions is an inverse-(d-1) power force (the Gauss law), F ~ 1 / r^(d-1). For such a central
// force the circular orbit is stable only if d < 4, and the orbit is a CLOSED ellipse (no
// precession, Bertrand's theorem) only for the inverse-square law, which is exactly d = 3. So
// d = 2 gives stable but precessing (never-closing) orbits, d = 3 gives stable closed orbits
// (atoms, solar systems, stable structure), and d = 4 and up give no stable bound orbits at all.
// We confirm this by integrating real orbits in each dimension. Clean wave propagation (Huygens)
// independently also selects odd dimensions, of which 3 is the only one in the window.
// Run: npx tsx code/experiment/p68-dimension-selection.ts

import { integrateCentralForceOrbit } from '@/code/dynamics/central-force-orbit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Integrate a planar orbit in d spatial dimensions, reporting stability and perihelion precession.
function integrateOrbit(d: number): {
  stable: boolean
  closed: boolean
  precessionPerOrbit: number
  orbits: number
} {
  return integrateCentralForceOrbit({ dimension: d })
}

export function dimensionSelection(input: Record<string, never> = {}): {
  byDimension: {
    dimension: number
    apsidalAngleDeg: number
    stable: boolean
    closed: boolean
    precessionPerOrbit: number
    cleanWaves: boolean
  }[]
  selected: number[]
  solved: boolean
} {
  void input
  const byDimension = [2, 3, 4, 5].map(d => {
    const apsidal = 4 - d > 0 ? Math.PI / Math.sqrt(4 - d) : NaN // analytic apsidal angle pi/sqrt(3-(d-1))
    const o = integrateOrbit(d)

    return {
      dimension: d,
      apsidalAngleDeg: (apsidal * 180) / Math.PI,
      stable: o.stable,
      closed: o.closed,
      precessionPerOrbit: o.precessionPerOrbit,
      cleanWaves: d % 2 === 1, // Huygens: sharp, wake-free propagation only in odd spatial dimensions
    }
  })

  // The selected dimension(s): stable AND closed orbits (and, as a corroboration, clean waves).
  const selected = byDimension
    .filter(r => r.closed)
    .map(r => r.dimension)

  return {
    byDimension,
    selected,
    // Solved: exactly one dimension in the allowed window has stable closed orbits, and it is 3.
    solved: selected.length === 1 && selected[0] === 3,
  }
}

export default experiment({
  id: 'cosmology/dimension-selection',
  title:
    'only d=3 gives stable closed orbits (d=2 precesses, d>=4 unstable)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = dimensionSelection()
    const d3 = r.byDimension.find(x => x.dimension === 3)
    const d2 = r.byDimension.find(x => x.dimension === 2)
    const d4 = r.byDimension.find(x => x.dimension === 4)
    const ok =
      r.solved &&
      r.selected.length === 1 &&
      r.selected[0] === 3 &&
      (d3?.closed ?? false) &&
      !(d2?.closed ?? true) &&
      !(d4?.stable ?? true)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'integrating gravitational orbits selects only d=3 for stable closed orbits, d=2 precesses and d=4 is unstable',
      metrics: {
        selected: r.selected[0] ?? 0,
        apsidalAngle3d: d3?.apsidalAngleDeg ?? 0,
        closed3d: d3?.closed ? 1 : 0,
      },
      control: {
        apsidalAngle2d: d2?.apsidalAngleDeg ?? 0,
        closed2d: d2?.closed ? 1 : 0,
        stable4d: d4?.stable ? 1 : 0,
      },
    })
  },
})
