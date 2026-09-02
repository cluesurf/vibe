// The Kac telegraph mass: the general solution to the cloud-dominated dispersion problem,
// and the model's first NUMERICAL masses. The insight: the bare quantum's velocity is
// always exactly plus or minus the light speed with only the sign flipping (E-FND-0133),
// which is a TELEGRAPH PROCESS, and Kac's classical result identifies the mass of the
// emerging relativistic wave equation with the flip rate: m equals hbar gamma over c
// squared. That converts band-curvature resolution (needing enormous time windows the
// cloud drowns) into flip COUNTING (needing only sign statistics), with the kick-law
// hbar (E-FLD-0019) supplying the constant. Measured over forty-seven steps:
//
//   - the massless control's only sign flips are the wrap-seam artifacts, exactly one per
//     lattice lap (spaced exactly seventeen beats on the side-seventeen torus, each a
//     single isolated beat), so its true flip rate is zero and its Kac mass zero,
//   - the middleweight species flips at rate zero point four three per beat, Kac mass
//     zero point one zero lattice units,
//   - the heavy species flips at zero point five seven per beat, Kac mass zero point one
//     four, heavier than the middleweight as its slower transport requires,
//   - and the telegraph sign fraction approximately reproduces the composite speeds
//     (v equals c times one minus twice the backward fraction, within fifteen percent of
//     light speed of the E-FND-0129 centroid values), tying the counting statistics back
//     to the independently measured transport.
//
// Depth L2, deterministic, the massless lap-artifact analysis the control that the
// counter counts physics and not seams.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 17
const BEATS = 48

export default experiment({
  id: 'foundations/kac-telegraph-mass',
  code: 'E-FND-0134',
  title:
    'the Kac telegraph instrument yields the model first numerical masses: the bare quantum velocity is a telegraph process (always exactly the light speed, only the sign flips), Kac identifies mass with hbar times the flip rate over c squared, and counting flips over forty-seven steps gives the massless control zero (its only flips are the entry and exit of isolated lap-spaced wrap dips), the middleweight zero point one zero and the heavy zero point one four lattice units in the right order, with the telegraph sign fraction reproducing the independently measured composite speeds within fifteen percent of light speed',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const wrapOf = (d: number): number =>
      d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d
    const mid = 8
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
    const roots: number[][] = []

    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(center, d)

      roots.push(
        [0, 1, 2, 3].map(a => wrapOf(coordinate(to, a) - mid)),
      )
    }

    const telegraph = (
      dir: number,
    ): { signs: number[]; flips: number[]; backwardFraction: number } => {
      const axis = roots[dir]!.map(v => v / Math.SQRT2)
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      let prevPos: number[] | null = null
      const signs: number[] = []
      const flips: number[] = []

      for (let t = 0; t < BEATS; t++) {
        vacuum = beat(vacuum, rule(t % 24))
        seeded = beat(seeded, rule(t % 24))

        const cells: number[] = []

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          if (
            seeded.data[cell * 24 + dir] !==
            vacuum.data[cell * 24 + dir]
          ) {
            cells.push(cell)
          }
        }

        if (cells.length === 0) {
          prevPos = null
          continue
        }

        const pos = [0, 1, 2, 3].map(a => {
          let s = 0

          for (const c of cells) {
            s += wrapOf(coordinate(c, a) - mid)
          }

          return s / cells.length
        })

        if (prevPos) {
          let step = 0

          for (let a = 0; a < 4; a++) {
            step += (pos[a]! - prevPos[a]!) * axis[a]!
          }

          const sign = Math.sign(Math.round(step * 100) / 100)

          if (
            signs.length > 0 &&
            sign !== 0 &&
            signs[signs.length - 1]! !== 0 &&
            sign !== signs[signs.length - 1]!
          ) {
            flips.push(signs.length)
          }

          signs.push(sign)
        }

        prevPos = pos
      }

      const backward = signs.filter(s => s < 0).length

      return {
        signs,
        flips,
        backwardFraction: backward / signs.length,
      }
    }

    const massless = telegraph(0)
    const middleweight = telegraph(4)
    const heavy = telegraph(8)

    // the massless flips must all be lap artifacts: isolated single-beat backward dips
    // (each contributing an entry flip and an exit flip), with the dips spaced in whole
    // lattice laps
    const dips: number[] = []
    let masslessArtifactsOnly = true

    for (let i = 0; i < massless.signs.length; i++) {
      if (massless.signs[i] === -1) {
        if (massless.signs[i - 1] === -1) {
          masslessArtifactsOnly = false
        } else {
          dips.push(i)
        }
      }
    }

    for (let i = 1; i < dips.length; i++) {
      if ((dips[i]! - dips[i - 1]!) % SIDE !== 0) {
        masslessArtifactsOnly = false
      }
    }

    if (massless.flips.length !== 2 * dips.length) {
      masslessArtifactsOnly = false
    }

    const hbar = 3 / (2 * Math.PI)
    const gammaMiddleweight =
      middleweight.flips.length / middleweight.signs.length
    const gammaHeavy = heavy.flips.length / heavy.signs.length
    const massMiddleweight = (hbar * gammaMiddleweight) / 2
    const massHeavy = (hbar * gammaHeavy) / 2

    const vMiddleweight = 1 - 2 * middleweight.backwardFraction
    const vHeavy = 1 - 2 * heavy.backwardFraction

    const ok =
      masslessArtifactsOnly &&
      dips.length <= 3 &&
      middleweight.flips.length >= 15 &&
      heavy.flips.length >= 20 &&
      massHeavy > massMiddleweight &&
      Math.abs(vMiddleweight - 0.272) < 0.15 &&
      Math.abs(vHeavy - 0.156) < 0.15

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the massless flips pair into isolated single-beat lap dips spaced in whole laps, both interacting species flip at genuine telegraph rates with the heavy mass above the middleweight, and the telegraph sign fractions reproduce both measured composite speeds within fifteen percent of light speed',
      metrics: {
        gammaMiddleweight: Number(gammaMiddleweight.toFixed(3)),
        gammaHeavy: Number(gammaHeavy.toFixed(3)),
        massMiddleweight: Number(massMiddleweight.toFixed(4)),
        massHeavy: Number(massHeavy.toFixed(4)),
        vFromSignsMiddleweight: Number(vMiddleweight.toFixed(3)),
        vFromSignsHeavy: Number(vHeavy.toFixed(3)),
        masslessLapDips: dips.length,
      },
      // CONTROL: the massless species through the identical counter, all flips accounted
      // for as lattice-lap seams
      control: {
        masslessArtifactsOnly: masslessArtifactsOnly ? 1 : 0,
      },
      notes:
        'the general lesson this experiment carries: when a slow background drowns a spectral band, convert the curvature question into counting statistics of an exact kinematic law. The masses here are lattice-unit numbers from one rule and one measured constant, and calibrating them against a physical species (the electron as the lightest charged dressed species) would set the lattice scale, the next step of the effective-theory programme.',
    })
  },
})
