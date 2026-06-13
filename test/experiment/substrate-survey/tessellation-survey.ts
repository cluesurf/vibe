// THE cross-tessellation survey: run the same battery against the whole catalog of regular hyperbolic
// tessellations (code/substrate/tessellation-catalog), so every one is measured identically and comparably.
// One reusable module (code/measure/tessellation-battery) measures each from its Schläfli symbol, building
// the Coxeter reflection-group mesh, so 2D tilings through 5D pentacombs are all handled the same way.
//
// The headline cross-tessellation facts this verifies:
//   - EVERY buildable regular hyperbolic tessellation builds and is hyperbolic (curvature, the Gram
//     signature is Lorentzian).
//   - A Kahler-Dirac fermion PROPAGATES on every one tested (matter is universal to hyperbolic geometry,
//     not special to {5,3,4} or {3,4,3,4}).
//   - The native SPINOR COIN (the 24-cell / D4 [3,4,3] directions) appears in EXACTLY the 24-cell-faceted
//     tessellations, the 4D {3,4,3,4} and {4,3,4,3} and the five 5D pentacombs, and these are EXACTLY the
//     ones that are crystallographic AND spinor-carrying together. {5,3,4}, the vibe pick, does NOT have the
//     coin, it gets spin from its form complex and defects (see matter-on-534).
//
// The full sweep with the propagation column is in `note/research/vibe/notes/theory-v0.7.0/paper/tessellations.csv`.
// The propagation here runs on a representative subset to keep the suite fast, the full sweep is in the CSV.

import { TESSELLATIONS } from '@/code/substrate/tessellation-catalog'
import { measureTessellation } from '@/code/measure/tessellation-battery'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PROPAGATION_SUBSET = ['{7,3}', '{5,3,4}', '{3,5,3}', '{5,3,3,4}', '{3,4,3,4}', '{3,4,3,3,4}']

export function tessellationSurvey(): {
  buildableCount: number
  allBuildAndHyperbolic: boolean
  spinorHookSymbols: string[]
  spinorHookIsTwentyFourCellFaceted: boolean
  spinorHookEqualsCrystallographicSpinor: boolean
  fermionPropagatesOnSubset: boolean
} {
  const buildable = TESSELLATIONS.filter((t) => t.buildable)
  const measured = buildable.map((t) => ({ t, m: measureTessellation({ schlafli: t.schlafli, maxCells: 1500 }) }))

  const allBuildAndHyperbolic = measured.every((x) => x.m.cells > 500 && x.m.hyperbolic)

  // the spinor hook appears in exactly the [3,4,3]-faceted (24-cell) tessellations
  const spinorHookSymbols = measured.filter((x) => x.m.spinorHook).map((x) => x.t.symbol)
  const expected = ['{4,3,4,3}', '{3,4,3,4}', '{4,3,3,4,3}', '{3,4,3,3,4}', '{3,3,4,3,3}', '{3,4,3,3,3}', '{3,3,3,4,3}']
  const spinorHookIsTwentyFourCellFaceted =
    spinorHookSymbols.length === expected.length && expected.every((s) => spinorHookSymbols.includes(s))
  // and the spinor-hook set equals the crystallographic-AND-spinor set (the 24-cell directions are 3,4-fold)
  const crystallographicAndSpinor = measured.filter((x) => x.m.crystallographic && x.m.spinorHook).map((x) => x.t.symbol)
  const spinorHookEqualsCrystallographicSpinor =
    crystallographicAndSpinor.length === spinorHookSymbols.length &&
    spinorHookSymbols.every((s) => crystallographicAndSpinor.includes(s))

  // a fermion propagates on every tessellation in the representative subset (one per dimension plus the coins)
  const subset = TESSELLATIONS.filter((t) => PROPAGATION_SUBSET.includes(t.symbol))
  const fermionPropagatesOnSubset = subset.every(
    (t) => measureTessellation({ schlafli: t.schlafli, maxCells: 1500, withPropagation: true }).fermionPropagates === true,
  )

  return {
    buildableCount: buildable.length,
    allBuildAndHyperbolic,
    spinorHookSymbols,
    spinorHookIsTwentyFourCellFaceted,
    spinorHookEqualsCrystallographicSpinor,
    fermionPropagatesOnSubset,
  }
}

export default defineExperiment({
  id: 'substrate-survey/tessellation-survey',
  title: 'one battery across the whole regular hyperbolic catalog: matter propagates on every one, the spinor coin is exactly the 24-cell-faceted few',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = tessellationSurvey()
    const ok =
      r.allBuildAndHyperbolic &&
      r.spinorHookIsTwentyFourCellFaceted &&
      r.spinorHookEqualsCrystallographicSpinor &&
      r.fermionPropagatesOnSubset
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'running one reusable battery against the whole catalog of regular hyperbolic tessellations, every buildable one is hyperbolic and a Kahler-Dirac fermion propagates on every one tested, while the native 24-cell / D4 spinor coin appears in exactly the seven [3,4,3]-faceted tessellations (the 4D {3,4,3,4} and {4,3,4,3} and the five 5D pentacombs), which are also exactly the crystallographic-and-spinor ones, so matter is universal to hyperbolic geometry but the spinor coin is rare and dimension-gated',
      metrics: {
        buildableCount: r.buildableCount,
        allBuildAndHyperbolic: r.allBuildAndHyperbolic ? 1 : 0,
        spinorHookCount: r.spinorHookSymbols.length,
        spinorHookIsTwentyFourCellFaceted: r.spinorHookIsTwentyFourCellFaceted ? 1 : 0,
        spinorHookEqualsCrystallographicSpinor: r.spinorHookEqualsCrystallographicSpinor ? 1 : 0,
        fermionPropagatesOnSubset: r.fermionPropagatesOnSubset ? 1 : 0,
      },
      control: {
        // the discriminator: the spinor hook is NOT universal (unlike propagation). It appears in exactly 7
        // of the 42 buildable tessellations, the 24-cell-faceted ones, so the survey separates a universal
        // property (matter propagates) from a rare one (the native spinor coin).
        spinorHookCount: r.spinorHookSymbols.length,
        buildableCount: r.buildableCount,
      },
      notes:
        'L2, a comparative survey across the full enumerated catalog (42 buildable of 45 cataloged, the regular hyperbolic tessellations being a finite set up to 4D compact and 5D paracompact). One reusable battery (code/measure/tessellation-battery) measures each from its Schläfli symbol via the Coxeter reflection-group mesh. The universal result, a propagating Kahler-Dirac fermion on every one, says matter lives on any hyperbolic substrate. The rare result, the spinor coin only in the 24-cell-faceted few, is why the geometry decision matters. The full sweep with the propagation column per tessellation is in paper/tessellations.csv. Propagation here runs on a representative subset to keep the suite fast.',
    })
  },
})
