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

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Acceleration of a test mass under gravity in d spatial dimensions: a = -k r / |r|^d
// (so the force magnitude is k / |r|^(d-1), the Gauss-law inverse-(d-1) power law).
function accel(x: number, y: number, d: number): [number, number] {
  const r = Math.hypot(x, y)
  const f = -1 / Math.pow(r, d) // k = 1
  return [f * x, f * y]
}

// Integrate a planar orbit with RK4 from a perturbed-circular start, and report whether it stays
// bound and stable, and how much the perihelion precesses per orbit (0 means a closed ellipse).
function integrateOrbit(d: number): { stable: boolean; closed: boolean; precessionPerOrbit: number; orbits: number } {
  const dt = 0.0005
  const maxSteps = 400000
  let x = 1
  let y = 0
  let vx = 0
  let vy = 0.8 // below circular speed (= 1 here), so an ellipse, to expose precession
  const deriv = (s: [number, number, number, number]): [number, number, number, number] => {
    const [px, py, pvx, pvy] = s
    const [ax, ay] = accel(px, py, d)
    return [pvx, pvy, ax, ay]
  }
  let cumAngle = 0
  let prevTheta = Math.atan2(y, x)
  let rPrev = Math.hypot(x, y)
  let rPrevPrev = rPrev
  let rMin = rPrev
  let rMax = rPrev
  const periapsisAngles: number[] = []
  for (let step = 0; step < maxSteps; step++) {
    const s: [number, number, number, number] = [x, y, vx, vy]
    const k1 = deriv(s)
    const k2 = deriv([x + (dt / 2) * k1[0], y + (dt / 2) * k1[1], vx + (dt / 2) * k1[2], vy + (dt / 2) * k1[3]])
    const k3 = deriv([x + (dt / 2) * k2[0], y + (dt / 2) * k2[1], vx + (dt / 2) * k2[2], vy + (dt / 2) * k2[3]])
    const k4 = deriv([x + dt * k3[0], y + dt * k3[1], vx + dt * k3[2], vy + dt * k3[3]])
    x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    vx += (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
    vy += (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])

    const r = Math.hypot(x, y)
    rMin = Math.min(rMin, r)
    rMax = Math.max(rMax, r)
    if (r > 20 || r < 0.05) {
      return { stable: false, closed: false, precessionPerOrbit: NaN, orbits: 0 } // escaped or plunged
    }
    // unwrap cumulative angle
    const theta = Math.atan2(y, x)
    let dtheta = theta - prevTheta
    if (dtheta > Math.PI) dtheta -= 2 * Math.PI
    if (dtheta < -Math.PI) dtheta += 2 * Math.PI
    cumAngle += dtheta
    prevTheta = theta
    // periapsis: local minimum of r
    if (rPrev < rPrevPrev && rPrev <= r && periapsisAngles.length < 12) {
      periapsisAngles.push(cumAngle)
    }
    rPrevPrev = rPrev
    rPrev = r
  }
  // precession per orbit from consecutive periapsis angles
  const advances: number[] = []
  for (let i = 1; i < periapsisAngles.length; i++) advances.push((periapsisAngles[i] ?? 0) - (periapsisAngles[i - 1] ?? 0))
  const meanAdvance = advances.length ? advances.reduce((a, b) => a + b, 0) / advances.length : NaN
  const precessionPerOrbit = meanAdvance - 2 * Math.PI
  const stable = rMax / rMin < 6 // stayed in a bounded band
  const closed = stable && Number.isFinite(precessionPerOrbit) && Math.abs(precessionPerOrbit) < 0.15
  return { stable, closed, precessionPerOrbit, orbits: advances.length }
}

export function dimensionSelection(input: Record<string, never> = {}): {
  byDimension: { dimension: number; apsidalAngleDeg: number; stable: boolean; closed: boolean; precessionPerOrbit: number; cleanWaves: boolean }[]
  selected: number[]
  solved: boolean
} {
  void input
  const byDimension = [2, 3, 4, 5].map((d) => {
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
  const selected = byDimension.filter((r) => r.closed).map((r) => r.dimension)
  return {
    byDimension,
    selected,
    // Solved: exactly one dimension in the allowed window has stable closed orbits, and it is 3.
    solved: selected.length === 1 && selected[0] === 3,
  }
}

export function main(): void {
  const r = dimensionSelection()
  console.log('P68: dimension selection (why three, of two, three, four)')
  console.log('')
  console.log('  Gravitational orbits in d spatial dimensions (force ~ 1 / r^(d-1)):')
  console.log('')
  console.log('  d | apsidal angle | stable orbit | closed orbit | precession/orbit | clean waves (Huygens)')
  for (const row of r.byDimension) {
    const ap = Number.isNaN(row.apsidalAngleDeg) ? '   n/a' : `${row.apsidalAngleDeg.toFixed(0)} deg`
    const pr = Number.isNaN(row.precessionPerOrbit) ? ' unstable' : `${row.precessionPerOrbit.toFixed(2)} rad`
    console.log(`  ${row.dimension} |   ${ap.padStart(7)}   |     ${row.stable ? 'yes' : 'NO '}     |     ${row.closed ? 'yes' : 'NO '}     |    ${pr.padStart(9)}    |        ${row.cleanWaves ? 'yes' : 'no'}`)
  }
  console.log('')
  console.log(`  dimension(s) with stable closed orbits: ${r.selected.join(', ')}`)
  console.log(`  dimension selection solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Among the allowed window {2, 3, 4} (P62), three spatial dimensions is uniquely')
  console.log('  selected. Two dimensions gives bound but PRECESSING orbits (the apsidal angle is')
  console.log('  128 degrees, not 180, so the orbit never closes, no stable repeating structure).')
  console.log('  Three dimensions gives the inverse-square law, stable CLOSED ellipses (atoms, solar')
  console.log('  systems, lasting structure), the apsidal angle exactly 180 degrees, zero precession.')
  console.log('  Four dimensions and up give no stable bound orbit at all (the test mass spirals in or')
  console.log('  escapes). Clean, wake-free wave propagation (Huygens) independently selects odd')
  console.log('  dimensions, and three is the only odd one in the window. Two criteria, one answer:')
  console.log('  of the dimensions a crystal substrate can exist in, only three supports stable matter')
  console.log('  and clean signals, so the universe we can live in is three-dimensional in space.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'cosmology/dimension-selection',
  title: 'only d=3 gives stable closed orbits (d=2 precesses, d>=4 unstable)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = dimensionSelection()
    const d3 = r.byDimension.find((x) => x.dimension === 3)
    const d2 = r.byDimension.find((x) => x.dimension === 2)
    const d4 = r.byDimension.find((x) => x.dimension === 4)
    const ok =
      r.solved && r.selected.length === 1 && r.selected[0] === 3 &&
      (d3?.closed ?? false) && !(d2?.closed ?? true) && !(d4?.stable ?? true)
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
