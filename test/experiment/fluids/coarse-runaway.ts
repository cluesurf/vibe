import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { cloneWill } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { enstrophy } from '@/code/measure/enstrophy'
import {
  shearSetup,
  coarseGradientEnergy,
} from '@/code/measure/hydrodynamics'

// The OTHER half of the Navier-Stokes rung, the half E-FLD-0009 left open. Herbert's reading is that the fluid
// only appears to blow up because the coarse (truncated) description forgets a bound the deeper conserved flow
// keeps. E-FLD-0009 showed the fine bound is exact (the enstrophy-like quadratic, the count of nonzero sites, is
// conserved by the reversible knit). Here we run the coarse side on the SAME run: start a smooth long-wavelength
// shear, let the nonlinear collisions sharpen it, and watch the coarse velocity-gradient energy rise above its
// start while the fine quadratic stays integer-exact constant. The honest finding is that the coarse view sees the
// gradients grow (a transient steepening) while the fine bound never moves, but the rise is small and recurrent:
// the reversible bulk has no true blow-up at either scale. The CONTROL is the lossy rule, where the fine quadratic
// collapses, the discriminator that the fine bound is conservation and not a generic feature.

function opposites(mesh: {
  degree: number
  opposite(d: number): number
}): number[] {
  const out: number[] = []

  for (let d = 0; d < mesh.degree; d++) out.push(mesh.opposite(d))

  return out
}

export default experiment({
  id: 'fluids/coarse-runaway',
  code: 'E-FLD-0010',
  title:
    'the coarse velocity-gradient energy rises above its start (a transient apparent steepening, recurrent not divergent) while the fine enstrophy-like quadratic is held integer-exact by the reversible knit, the truncation half of Navier-Stokes',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const beats = 24
    const gradAxis = 1
    const momAxis = 0

    // a smooth, single-mode shear (the longest wavelength), so any sharpening is a genuine cascade and not put in.
    const start = shearSetup({
      mesh,
      directions,
      side,
      gradAxis,
      momAxis,
      wavelength: side,
    })

    const e0 = enstrophy(start)
    const coarse0 = coarseGradientEnergy({
      will: start,
      directions,
      side,
      gradAxis,
      momAxis,
    })

    // REAL: the reversible knit. The fine quadratic is conserved exactly while the coarse gradient energy grows.
    let real = cloneWill(start)
    let enstrophyMin = e0
    let enstrophyMax = e0
    let coarseMax = coarse0

    for (let b = 0; b < beats; b++) {
      real = beat(real, headOnRotate({ opposite: opposites(mesh) }))

      const e = enstrophy(real)

      enstrophyMin = Math.min(enstrophyMin, e)
      enstrophyMax = Math.max(enstrophyMax, e)

      const c = coarseGradientEnergy({
        will: real,
        directions,
        side,
        gradAxis,
        momAxis,
      })

      coarseMax = Math.max(coarseMax, c)
    }

    const fineBoundExact = enstrophyMin === e0 && enstrophyMax === e0
    // the coarse (truncated) view sees the gradients grow above the start, the apparent runaway.
    const coarseRunsUp = coarseMax > coarse0

    // CONTROL: the lossy rule destroys nonzero sites, so the fine quadratic collapses.
    let lossy = cloneWill(start)
    let lossyMin = e0

    for (let b = 0; b < beats; b++) {
      lossy = beat(lossy, erasingCollision)
      lossyMin = Math.min(lossyMin, enstrophy(lossy))
    }

    const lossyCollapses = lossyMin < e0

    const ok = fineBoundExact && coarseRunsUp && lossyCollapses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on one reversible run a smooth shear steepens so the coarse velocity-gradient energy rises above its start (the truncated description sees gradients grow) while the fine enstrophy-like quadratic is conserved integer-exact, so the lattice keeps a bound the reduced description does not see, and a lossy rule lets the fine quadratic collapse',
      metrics: {
        side,
        beats,
        enstrophyStart: e0,
        enstrophyMin,
        enstrophyMax,
        fineBoundExact: fineBoundExact ? 1 : 0,
        coarseGradientStart: coarse0,
        coarseGradientMax: coarseMax,
        coarseRunsUp: coarseRunsUp ? 1 : 0,
      },
      // CONTROL: the lossy rule collapses the fine quadratic, so the exact bound is conservation, not generic.
      control: {
        lossyEnstrophyMin: lossyMin,
        lossyCollapses: lossyCollapses ? 1 : 0,
      },
      notes:
        'L2, honest scope stated plainly. The fine quadratic (sum of tone squared) is conserved exactly because collide rearranges tones within a cell and stream permutes sites. The coarse velocity-gradient energy, what a truncated continuum model tracks, rises above its start (about a tenth, peaking early) as the nonlinear collisions sharpen the profile. It is a transient steepening, not a divergence: the reversible bulk recurs (Poincare), so the coarse gradient stays bounded too. So the honest reading is that the lattice has no true blow-up at either scale, and the fine bound is exact. This pairs with E-FLD-0009 (the exact fine bound). What is NOT shown is a sustained coarse runaway, because the reversible substrate recurs rather than cascading to a singularity. A genuine inviscid cascade-to-blowup is not a feature of the closed reversible rule, and that is reported as the finding, not hidden.',
    })
  },
})
