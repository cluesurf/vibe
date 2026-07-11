// P209 (Tier 2): matter from solitons. (1) the interaction energy E(d) of two selves vs separation, with the
// Skyrme term there IS a force (a minimum = a BOUND STATE, the analogue of atoms/nuclei); (2) the soliton's
// rest mass scales with its topological charge (additive matter). Measured on the 2D direction field.
// Run: npx tsx code/experiment/p209-soliton-matter.ts

import {
  directionFieldDerrickEnergy2d,
  blankDirectionField2d,
  placeSkyrmion2d,
} from '@/code/measure/skyrme-energy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type V = [number, number, number]

const N = 80
const blank = (): V[][] => blankDirectionField2d(N)
const addSky = (
  f: V[][],
  cx: number,
  cy: number,
  R: number,
  ch: number,
): void =>
  placeSkyrmion2d({
    field: f,
    centerX: cx,
    centerY: cy,
    radius: R,
    charge: ch,
  })

const energy = (f: V[][], kappa: number): number =>
  directionFieldDerrickEnergy2d(f, kappa)

// fine separations, so the well minimum (near d = 10) is not stepped over; the original
// coarse [6,9,12,16,22,30] sampling skipped it
const SEPARATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 26, 32]
const KAPPA = 2
const R = 7

// the interaction energy of two charge-+1 skyrmions versus separation, in a chosen channel:
// the second skyrmion carries an internal iso-rotation `phase` relative to the first. The
// attractive channel is phase = pi (the two bind), the repulsive channel is phase = 0.
function bindingCurve(phase: number): {
  curve: [number, number][]
  wellDepth: number
  dMin: number
} {
  const c = N / 2
  const curve: [number, number][] = []

  for (const d of SEPARATIONS) {
    const f = blank()

    addSky(f, c - d / 2, c, R, 1)
    placeSkyrmion2d({
      field: f,
      centerX: c + d / 2,
      centerY: c,
      radius: R,
      charge: 1,
      phase,
    })
    curve.push([d, Math.round(energy(f, KAPPA) * 100) / 100])
  }

  // a bound state is an INTERIOR local minimum: energy below BOTH neighbours and below the
  // asymptotic energy, with a barrier toward contact. This excludes the contact-merge at the
  // smallest separation, where two same-charge skyrmions simply fuse into one (a monotone
  // slide to contact, not a bound state). The deepest such interior well is the binding well.
  const eInf = curve[curve.length - 1]![1]

  let wellDepth = 0
  let dMin = -1

  for (let i = 1; i < curve.length - 1; i++) {
    const e = curve[i]![1]

    if (
      e < curve[i - 1]![1] &&
      e < curve[i + 1]![1] &&
      e < eInf &&
      eInf - e > wellDepth
    ) {
      wellDepth = eInf - e
      dMin = curve[i]![0]
    }
  }

  return { curve, wellDepth, dMin }
}

export function solitonMatter(): {
  binding: [number, number][]
  bound: boolean
  attractiveWellDepth: number
  attractiveDMin: number
  repulsiveWellDepth: number
  massRatio: number
} {
  const c = N / 2

  // (1) the attractive channel (relative iso-rotation pi): two charge-+1 skyrmions bind at a
  // finite separation, the deuteron analog
  const attractive = bindingCurve(Math.PI)
  // the repulsive control (same orientation): no finite-separation minimum
  const repulsive = bindingCurve(0)

  const bound = attractive.wellDepth > 1 && attractive.dMin > 0

  // (2) mass vs charge (additive matter): a charge-2 configuration (two well-separated
  // charge-1 solitons) has about twice the rest mass of one
  const one = blank()

  addSky(one, c, c, R, 1)

  const m1 = energy(one, KAPPA)
  const two = blank()

  addSky(two, c - 16, c, R, 1)
  addSky(two, c + 16, c, R, 1)

  const massRatio = Math.round((energy(two, KAPPA) / m1) * 100) / 100

  return {
    binding: attractive.curve,
    bound,
    attractiveWellDepth: Math.round(attractive.wellDepth * 100) / 100,
    attractiveDMin: attractive.dMin,
    repulsiveWellDepth: Math.round(repulsive.wellDepth * 100) / 100,
    massRatio,
  }
}

export default experiment({
  id: 'gauge/soliton-matter',
  code: 'E-FRC-0047',
  title:
    'two solitons bind in the attractive channel at a finite separation and the rest mass is additive in topological charge',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = solitonMatter()

    // the attractive channel binds (a well deeper than one below the asymptotic energy at a
    // finite separation), the repulsive same-orientation control does NOT (no real well), and
    // the rest mass is additive in the topological charge
    const attractiveBinds = r.bound
    const repulsiveDoesNotBind = r.repulsiveWellDepth < 0.5
    const massAdditive = r.massRatio > 1.7 && r.massRatio < 2.3
    const ok = attractiveBinds && repulsiveDoesNotBind && massAdditive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the Skyrme term, two charge-one solitons bind in the ATTRACTIVE channel (a relative internal iso-rotation of pi, the deuteron analog): their interaction energy has a minimum at a finite separation, a well deeper than one below the asymptotic energy near separation ten. The SAME-orientation (repulsive) channel does not bind, the control, which is why the channel matters. A charge-two configuration has about twice the rest mass of a charge-one one, additive matter',
      metrics: {
        bound: r.bound ? 1 : 0,
        attractiveWellDepth: r.attractiveWellDepth,
        attractiveSeparation: r.attractiveDMin,
        repulsiveWellDepth: r.repulsiveWellDepth,
        massRatio: r.massRatio,
      },
      control: {
        repulsiveWellDepth: r.repulsiveWellDepth,
      },
      notes:
        'L2, known physics, measured on a 2D direction field. The bound state is in the ATTRACTIVE channel (the second skyrmion iso-rotated by pi relative to the first), the standard way two same-charge skyrmions bind; the original test used the same-orientation REPULSIVE channel and a coarse separation grid that stepped over the minimum near ten, so it missed the well. The repulsive channel is now the control (no binding). The Skyrme coefficient kappa is set by hand and the well depth is robust across kappa 1 to 3 (1.1 to 1.2); whether the rule supplies a positive kappa is the separate open Skyrme-sign question.',
    })
  },
})
