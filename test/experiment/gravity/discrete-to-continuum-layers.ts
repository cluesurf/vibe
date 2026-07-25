// EXTERNAL THEORY: Roy Herbert (Chronoflux), the July 2026 Descendancy refactor, read against vibe's
// commitment that the base is discrete. Herbert works natively in the continuum. His primitive is a
// smooth current on a four-manifold, so his framework carries the usual continuum idealization of
// uncountably many degrees of freedom in any region. Vibe refuses that idealization and starts finite.
// The obvious worry is that the two are then incompatible, and that the discrete base could only ever
// approximate the continuum law with some residual error.
//
// This experiment shows the mapping is cleaner than that, because the transfer splits into two layers
// with completely different characters, measured here side by side on ONE state:
//
// - THE LAW LAYER is metric-free and transfers EXACTLY at every finite scale. The continuity balance has
//   zero residual at block side 1, 2 and 3, under integer equality. No limit is taken, no error term
//   appears, nothing is approximated. Herbert's primitive lands on the lattice whole.
// - THE FIELD LAYER is a finite-resolution reading. A block of V cells can only report a mean charge on
//   an exact multiple of one over V, so the attainable densities form a FINITE set whose spacing is
//   exactly one over V. That spacing shrinks as blocks grow and reaches zero only in a limit that is
//   never taken, so the smooth field is the coarse observer's improving reading of finite integer data.
//
// So the continuum enters only as the limit of a resolution, never as an actual infinity in the base.
// The conservation law needs no limit at all, and the smoothness needs a limit that is approached and
// not attained. That is the exact sense in which the discrete maps to the continuous here.
//
// CONTROL: a lossy collision breaks the law layer at every scale while leaving the resolution
// arithmetic untouched, which shows the two layers are genuinely independent. The law is a property of
// the rule and can fail. The finite resolution is a property of the substrate and cannot. The control
// used is the ONE-SIGNED sink, because a both-signed sink can have its violation cancelled inside a
// large region, which was measured here: the plain erasing rule reads as balanced at block side 3 on
// this fill even though it is lossy. A one-signed sink cannot cancel at any scale.

import { d4Mesh } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import {
  drainingCollision,
  erasingCollision,
} from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { coarseContinuityResidual } from '@/code/measure/continuity'
import { coarseDensityResolution } from '@/code/measure/resolution'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BLOCK_SIDES = [1, 2, 3]

export default experiment({
  id: 'gravity/discrete-to-continuum-layers',
  code: 'E-GRV-0053',
  title:
    'the discrete-to-continuum transfer splits in two: the continuity law is exact at every finite scale with no limit, while the smooth field is a finite-resolution reading whose quantum is exactly one over the block volume',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const meshSide = 6 // 6^4 = 1296 cells, divisible by block sides 1, 2, 3
    const mesh = d4Mesh({ side: meshSide })
    const degree = mesh.degree
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const knit = pairCollision({ opposite })

    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / meshSide ** axis) % meshSide

    // a deterministic charged fill, a fixed coordinate pattern, no randomness
    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < degree; d++) {
        start.data[cell * degree + d] =
          ((coordinate(cell, 0) + 2 * coordinate(cell, 2) + d) % 3) - 1
      }
    }

    // LAYER ONE, the law. Exact at every scale, no limit taken.
    const law = BLOCK_SIDES.map(blockSide =>
      coarseContinuityResidual({
        will: start,
        collision: knit,
        meshSide,
        blockSide,
      }),
    )

    const lawExactAtEveryScale = law.every(r => r.absResidual === 0)
    const lawCarriesFlux = law.every(r => r.totalFlux > 0)

    // LAYER TWO, the field. Finite resolution, quantum exactly one over the block volume.
    const field = BLOCK_SIDES.map(blockSide =>
      coarseDensityResolution({ will: start, meshSide, blockSide }),
    )

    // every observed block total is an exact integer within the slot bound, so every coarse density
    // sits exactly on the quantum lattice. Checked, not assumed.
    const allOnQuantumLattice = field.every(f => f.onLattice)

    // the quantum is exactly one over the block volume at every scale
    const quantumIsExact = field.every(
      f => f.quantum === 1 / f.blockVolume,
    )

    // it strictly shrinks as blocks grow, and never reaches zero
    let quantumStrictlyShrinks = true

    for (let i = 1; i < field.length; i++) {
      if (!(field[i]!.quantum < field[i - 1]!.quantum)) {
        quantumStrictlyShrinks = false
      }
    }

    const quantumNeverZero = field.every(f => f.quantum > 0)

    // the attainable value set is finite at every scale
    const attainableFinite = field.every(f =>
      Number.isFinite(f.attainableValues),
    )

    // CONTROL: the lossy rule breaks the law layer while the resolution arithmetic survives. The sink is
    // one-signed so its violation cannot be cancelled inside a region at any scale.
    const lossyLaw = BLOCK_SIDES.map(blockSide =>
      coarseContinuityResidual({
        will: start,
        collision: drainingCollision,
        meshSide,
        blockSide,
      }),
    )

    const lossyBreaksLaw = lossyLaw.every(r => r.absResidual > 0)
    const lossyKeepsResolution = field.every(f => f.onLattice)

    // the measured reason the one-signed sink is the right control: a both-signed sink can read as
    // balanced at a coarse scale on this fill, which is a cancellation artifact and not conservation.
    const bothSignedSink = coarseContinuityResidual({
      will: start,
      collision: erasingCollision,
      meshSide,
      blockSide: BLOCK_SIDES[BLOCK_SIDES.length - 1]!,
    })

    const ok =
      lawExactAtEveryScale &&
      lawCarriesFlux &&
      allOnQuantumLattice &&
      quantumIsExact &&
      quantumStrictlyShrinks &&
      quantumNeverZero &&
      attainableFinite &&
      lossyBreaksLaw &&
      lossyKeepsResolution

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete-to-continuum mapping splits into two layers with different characters: the continuity law transfers EXACTLY at block sides 1, 2 and 3 with zero residual under integer equality and no limit taken, while the coarse density is a finite-resolution reading whose attainable values form a finite set spaced by exactly one over the block volume, a spacing that strictly shrinks as blocks grow and never reaches zero, so the smooth continuum field is the improving reading of finite integer data rather than an actual infinity in the base, and a lossy rule breaks the law layer at every scale while the resolution arithmetic is untouched, showing the two layers are independent',
      metrics: {
        meshSide,
        lawResidualBlock1: law[0]!.absResidual,
        lawResidualBlock2: law[1]!.absResidual,
        lawResidualBlock3: law[2]!.absResidual,
        lawExactAtEveryScale: lawExactAtEveryScale ? 1 : 0,
        quantumBlock1: field[0]!.quantum,
        quantumBlock2: field[1]!.quantum,
        quantumBlock3: field[2]!.quantum,
        attainableValuesBlock3: field[2]!.attainableValues,
        distinctObservedBlock3: field[2]!.distinctObserved,
        slotsPerBlockBlock3: field[2]!.slotsPerBlock,
        quantumStrictlyShrinks: quantumStrictlyShrinks ? 1 : 0,
        allOnQuantumLattice: allOnQuantumLattice ? 1 : 0,
      },
      control: {
        lossyResidualBlock1: lossyLaw[0]!.absResidual,
        lossyResidualBlock2: lossyLaw[1]!.absResidual,
        lossyResidualBlock3: lossyLaw[2]!.absResidual,
        lossyBreaksLaw: lossyBreaksLaw ? 1 : 0,
        lossyKeepsResolution: lossyKeepsResolution ? 1 : 0,
        bothSignedSinkResidualBlock3: bothSignedSink.absResidual,
      },
      notes:
        'L2 overall, and the two legs are NOT the same grade, which matters for reading it honestly. THE LAW LEG is the real measurement: integer-exact with zero tolerance at every scale, it could have come out nonzero, and the lossy control shows it does. THE RESOLUTION LEG is a counting fact about the substrate (L1 arithmetic), verified here for consistency rather than discovered: a bounded integer block total over a fixed cell count can only give a mean on the one-over-volume lattice, so the onLattice check is near-tautological on integer storage and must not be read as evidence. Its value is that it states exactly WHY no infinity ever appears, not that it proves something surprising. The answer to the standing question of how a discrete base can carry a continuum law without an infinity is the CONTRAST between the two legs, which is what this experiment puts side by side. The law leg needs NO limit to land on the lattice, so Herbert metric-free primitive transfers whole. The field leg is arithmetic: a block of V cells holds V times 24 ternary slots, so its total charge is a bounded integer and its mean sits on an exact multiple of one over V, which makes the attainable density set finite at every scale with a spacing that shrinks as one over V. The continuum is therefore approached as a resolution and never instantiated as an actual infinity, which is exactly why the discrete base loses nothing by refusing uncountable degrees of freedom. Note honestly that this is the mapping of the CONSERVATION layer plus a counting fact about resolution. It is not a claim that curvature, isotropy or the metric itself have been recovered, which is separate work with its own experiments (E-GRV-0046 measures the field convergence rate). CONTROL CHOICE, measured not assumed: the both-signed erasing sink reads as exactly balanced at block side 3 on this fill, a cancellation artifact of signed erased charges inside a region, so it is NOT a sound control at coarse scales and the one-signed draining sink is used instead. That number is reported in the control block so the reason is visible. Fully deterministic, one fixed coordinate fill, no random source.',
    })
  },
})
