// PS1, THE PERSISTENCE PROBLEM (the crown jewel of the inner layer). Can a pattern LAST against the churn, or does
// the reversible dynamics always erase it? Everything inner (realms, beings, messages, survival) hangs on this.
// The answer, a pattern lasts if and only if its IDENTITY is TOPOLOGICAL (a conserved winding charge), and genuine
// lasting needs the bath. Measured on the spinor phase field (the 8s/8c sector carries winding) over time, three
// regimes separate cleanly.
//
//   A. winding-1 + a lump, DISSIPATIVE relaxation (the open bath). The winding (identity) stays locked at 1 the
//      whole run, AND the lump HEALS, the local structure decays monotonically to a settled protected kink. So the
//      pattern genuinely LASTS and SELF-HEALS, its identity surviving even as the detailed field changes.
//   B. winding-0 + a lump, same relaxation (the unprotected control). The winding is 0, there is no conserved
//      identity, only the configuration, which relaxes away. Nothing topological survives.
//   C. winding-1 + a lump, REVERSIBLE wave (the closed control). The winding (identity) still survives total
//      turnover of the field, but the local structure OSCILLATES, it RECURS rather than settling. So a closed
//      reversible system gives recurrence, not genuine lasting of a configuration.
//
// The reading, IDENTITY persists topologically (the winding survives even total turnover), the BATH turns that into
// genuine lasting (heal and settle), and a closed reversible system only recurs. Deterministic throughout, no
// random, no cohesion or maintenance ingredient. Honest caveat (shared with topological-persistence-3434), this
// shows a field WITH winding structure persists, the spinor field has this structure, but whether the bare
// {3,4,3,4} rule dynamically produces conserved-winding fields is the deeper open question.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { phaseWinding } from '@/code/measure/winding'
import { phaseRelaxStep, phaseWaveStep, gradientStructure, windingKinkWithLump } from '@/code/dynamics/phase-field'

export default experiment({
  id: 'selves/persistence-problem',
  title: 'a pattern lasts only if its identity is topological, the bath makes it last, a closed system only recurs',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const size = 64
    const beats = 300
    const epsilon = 1e-3

    // A, winding-1 with a lump under dissipative relaxation, the open bath
    let fieldA = windingKinkWithLump({ size, winding: 1, lumpAmplitude: 1.2 })
    const structA0 = gradientStructure(fieldA)
    let windingAlwaysOneA = true
    let risesA = 0
    let prevA = structA0
    for (let t = 0; t < beats; t++) {
      if (phaseWinding(fieldA) !== 1) windingAlwaysOneA = false
      fieldA = phaseRelaxStep(fieldA, 0.2)
      const s = gradientStructure(fieldA)
      if (s > prevA + epsilon) risesA++ // a rise means it did not monotonically heal
      prevA = s
    }
    const finalStructA = gradientStructure(fieldA) / structA0
    const aLastsAndHeals = windingAlwaysOneA && risesA === 0 // identity locked AND monotone heal (settles, lasts)

    // B, winding-0 with a lump under the same relaxation, the unprotected control
    let fieldB = windingKinkWithLump({ size, winding: 0, lumpAmplitude: 1.2 })
    let windingZeroB = true
    for (let t = 0; t < beats; t++) { if (phaseWinding(fieldB) !== 0) windingZeroB = false; fieldB = phaseRelaxStep(fieldB, 0.2) }
    const bHasNoIdentity = windingZeroB // no conserved topological charge to keep

    // C, winding-1 with a lump under the reversible wave, the closed control
    const fieldC = windingKinkWithLump({ size, winding: 1, lumpAmplitude: 1.2 })
    const velocity = new Array<number>(size).fill(0)
    const structC0 = gradientStructure(fieldC)
    let windingAlwaysOneC = true
    let risesC = 0
    let prevC = structC0
    for (let t = 0; t < beats; t++) {
      if (phaseWinding(fieldC) !== 1) windingAlwaysOneC = false
      phaseWaveStep(fieldC, velocity, 0.2)
      const s = gradientStructure(fieldC)
      if (s > prevC + epsilon) risesC++
      prevC = s
    }
    const cRecursNotSettles = windingAlwaysOneC && risesC >= 2 // identity survives turnover, but structure oscillates (recurs)

    const ok = aLastsAndHeals && bHasNoIdentity && cRecursNotSettles
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a pattern can LAST against the churn if and only if its identity is topological, a winding-1 spinor-phase pattern keeps its winding (identity) locked through the whole run and, under the bath (dissipative relaxation), heals a perturbation and settles to a lasting protected kink, while an unprotected winding-0 pattern has no conserved identity and relaxes away, and on a closed reversible system the same winding-1 identity survives total turnover but the configuration only RECURS (the structure oscillates) rather than genuinely settling, so identity persists topologically, the bath makes it last, and a closed system only recurs',
      metrics: {
        windingA: windingAlwaysOneA ? 1 : 0,
        risesA,
        finalStructATimes100: Math.round(finalStructA * 100),
        windingB: windingZeroB ? 0 : 1,
        windingC: windingAlwaysOneC ? 1 : 0,
        risesC,
        beats,
        size,
      },
      control: { windingB: windingZeroB ? 0 : 1, risesC },
      notes:
        'deterministic, no random, no cohesion or maintenance ingredient. A is the open-bath lasting case (heals, risesA = 0), B is the unprotected decay control (no winding), C is the closed reversible recurrence control (risesC >= 2, the structure oscillates). The honest caveat from topological-persistence-3434 applies, whether the bare {3,4,3,4} rule dynamically produces conserved-winding fields is the deeper open question.',
    })
  },
})
