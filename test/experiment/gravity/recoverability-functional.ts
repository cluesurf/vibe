// EXTERNAL THEORY: Roy Herbert (Chronoflux), recovering-relativity-from-temporal-continuity, with Fields
// (observer boundary) and Hoel (effective information) behind it (author-bridges/roy-herbert.md point 14,
// chronoflux-bridge/). Herbert's recoverability functional R = accessible / total is his single currency for
// three things at once: thermodynamics (entropy is lost recoverability), decoherence (recoverability flows into
// the environment), and horizons (recoverability bleeds across a boundary). The bridge claim is that one
// functional on vibe's conserved substrate reproduces all three, framed as how much of the base tone-structure
// a limited observer can recover.
//
// Tested on the committed knit on a periodic {3,4,3,4} d4 mesh, with a localized deterministic signal at the
// centre and vacuum outside. The same R = accessible / total is read by three observers: the unrestricted
// observer (rGlobal), a fixed central window (rWindow, the horizon regime), and a block-averaging observer
// (rCoarse, the decoherence regime). Under the reversible conserving knit rGlobal stays exactly 1 at every beat
// (the L1 structure is conserved, nothing destroyed), while rWindow falls as structure streams out of the window
// and rCoarse falls as the signal fragments into sign-mixed blocks. CONTROL: the erasing (lossy) rule destroys
// structure, so its rGlobal drops below 1, the discriminator that the reversible base loses nothing globally and
// a limited observer's loss is access, not destruction.

import { d4Mesh } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { recoverabilityTrace } from '@/code/measure/recoverability'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gravity/recoverability-functional',
  code: 'E-GRV-0040',
  title:
    "Herbert's recoverability functional R = accessible / total unifies horizons, decoherence, and conservation on vibe's reversible substrate, with a lossy control losing it globally",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const meshSide = 10 // 10^4 = 10000 cells, divisible by block side 2
    const mesh = d4Mesh({ side: meshSide })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++)
      opposite.push(mesh.opposite(d))

    const collision = headOnRotate({ opposite })
    const degree = mesh.degree
    const beats = 5
    const windowRadius = 2
    const blockSide = 2

    // a deterministic localized signal: a structured ternary fill in the central core (Chebyshev radius 1),
    // vacuum everywhere else. The core sits inside the radius-2 window, so rWindow starts at 1.
    const center = Math.floor(meshSide / 2)
    const area = meshSide * meshSide
    const volume = area * meshSide
    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = cell % meshSide
      const y = Math.floor(cell / meshSide) % meshSide
      const z = Math.floor(cell / area) % meshSide
      const w = Math.floor(cell / volume) % meshSide
      const cheby = Math.max(
        Math.abs(x - center),
        Math.abs(y - center),
        Math.abs(z - center),
        Math.abs(w - center),
      )

      if (cheby <= 1) {
        for (let d = 0; d < degree; d++)
          start.data[cell * degree + d] = ((x + 2 * y + d) % 3) - 1
      }
    }

    // REAL: the conserving reversible knit.
    const real = recoverabilityTrace({
      will: start,
      collision,
      meshSide,
      windowRadius,
      blockSide,
      beats,
    })

    // CONTROL: the erasing (lossy) rule.
    const lossy = recoverabilityTrace({
      will: start,
      collision: erasingCollision,
      meshSide,
      windowRadius,
      blockSide,
      beats,
    })

    const first = real[0]!
    const last = real[real.length - 1]!
    const coarseMax = Math.max(...real.map(p => p.rCoarse))

    // the reversible knit conserves L1 structure exactly: rGlobal is 1 (to floating-point) at every beat.
    const rGlobalExact = real.every(p => Math.abs(p.rGlobal - 1) < 1e-9)
    // the horizon regime: structure bleeds out of the fixed window even though it is never destroyed.
    const windowBleeds = last.rWindow < first.rWindow * 0.5
    // the decoherence regime: the block-averaging observer recovers only a small fraction of the structure that
    // is still fully present, because sign cancellation inside blocks hides the fine tone-current from it.
    const coarseLimited = coarseMax < 0.5
    // CONTROL: the lossy rule destroys structure, so even the unrestricted observer recovers less than all.
    const lossyGlobalLost = lossy[lossy.length - 1]!.rGlobal < 0.99

    const ok =
      rGlobalExact && windowBleeds && coarseLimited && lossyGlobalLost

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "one functional R = accessible / total reproduces three regimes on vibe's reversible substrate: the unrestricted observer keeps R exactly 1 at every beat (structure conserved, nothing destroyed), a fixed window loses R as structure streams across its boundary (the horizon regime, information beyond reach but not gone), and a block-averaging observer recovers only a small fraction of the still-present structure (the decoherence regime, fine tone-current hidden by within-block sign cancellation), while a lossy rule drops the global R below 1, showing a limited observer's loss is lost access and not lost structure",
      metrics: {
        meshSide,
        beats,
        rGlobalFirst: first.rGlobal,
        rGlobalLast: last.rGlobal,
        rWindowFirst: first.rWindow,
        rWindowLast: last.rWindow,
        rCoarseMax: coarseMax,
        rCoarseLast: last.rCoarse,
        rGlobalExact: rGlobalExact ? 1 : 0,
      },
      control: {
        lossyGlobalFirst: lossy[0]!.rGlobal,
        lossyGlobalLast: lossy[lossy.length - 1]!.rGlobal,
        lossyGlobalLost: lossyGlobalLost ? 1 : 0,
      },
      notes:
        "L2, Herbert's recoverability functional realized on the lattice. Total is the L1 tone-structure of a deterministic central signal, accessible is what each observer can recover. The reversible knit conserves L1 exactly, so the unrestricted R is 1 to floating point at every beat. The window R is the horizon face (structure crosses a boundary the observer cannot see past). The coarse R is the decoherence face: a block-averaging observer recovers only a small fraction (under a half) of the structure that is still completely present, because the fine signed tone-current cancels inside blocks. The lossy control destroys structure outright, so its global R falls below 1. Fully deterministic, vacuum outside the signal, size varied not seeds.",
    })
  },
})
