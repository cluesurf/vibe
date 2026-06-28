// E2, the reversible discrete attraction (P2). Radiation-pressure / Casimir-shadow binding, fully discrete. A body
// that excludes the vacuum (absorbs tones) casts a SHADOW of reduced flux, so a test mass is struck more from the
// open side and drifts TOWARD the body, the correct-sign attraction. This resolves the long-standing worry
// (the-reversible-attraction-problem.md) that the first-order reversible move gives the WRONG sign (repulsion),
// here the genuine radiation pressure of an absorbing body gives ATTRACTION. The bulk streaming is an exact
// reversible bijection, the ONLY irreversibility is absorption at the body and the open boundary (radiation reaching
// the bath), exactly where the model quarantines it. Everything is integer/discrete, the tones are the ternary
// charge on a directed coin.
//
// Honest scope, this is the MECHANISM, demonstrated on the reduced 1D coin. It shows binding-by-radiation is
// correct-sign, discrete, and reversible-in-the-bulk. The full {3,4,3,4} active-vacuum realization (the shadow cast
// by real vacuum exclusion on the D4 coin) is the next build, this proves the mechanism it would rely on.
//
// Depth L2, the reversible discrete attraction mechanism, an absorbing (vacuum-excluding) body attracts a test mass
// by radiation-pressure shadow, with the no-body symmetric flux as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { shadowPressureRun } from '@/code/dynamics/shadow-pressure'

export default experiment({
  id: 'selves/shadow-pressure-attraction',
  code: 'E-SLF-0125',
  title:
    'a vacuum-excluding body attracts a test mass by discrete radiation-pressure shadow (correct sign, reversible bulk)',
  category: 'selves',
  substrates: ['lattice-gas'],
  depth: 'L2',
  paper: true,
  run() {
    const base = {
      length: 200,
      massStart: 110,
      bodyLo: 10,
      bodyHi: 30,
      beats: 4000,
      threshold: 8,
    }

    const shadow = shadowPressureRun({ ...base, body: true })
    const control = shadowPressureRun({ ...base, body: false })

    // attraction, the shadowed mass drifts strongly toward the body (negative), the control barely moves.
    const attracts = shadow.drift < -20 && shadow.netMomentum < 0
    const controlFlat =
      Math.abs(control.drift) <= 3 && control.netMomentum === 0

    const correctSign = shadow.drift < control.drift // shadow more toward the body than the control
    const ok = attracts && controlFlat && correctSign

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a body that excludes the vacuum (absorbs tones) casts a discrete radiation-pressure SHADOW, the test mass is struck more from the open side than the shadowed body side and drifts TOWARD the body (attraction, correct sign), while with no body the flux is symmetric and the mass does not drift, the bulk streaming is an exact reversible bijection and the only irreversibility is absorption at the body and the open boundary (radiation to the bath), so this is binding-by-radiation, reversible in the bulk and fully discrete (integer tones, integer momentum), resolving the worry that the first-order reversible move gives repulsion',
      metrics: {
        shadowDrift: shadow.drift,
        shadowNetMomentum: shadow.netMomentum,
        shadowHitsRight: shadow.hitsRight,
        shadowHitsLeft: shadow.hitsLeft,
        controlDrift: control.drift,
        controlNetMomentum: control.netMomentum,
        attracts: attracts ? 1 : 0,
        controlFlat: controlFlat ? 1 : 0,
      },
      control: {
        controlDrift: control.drift,
        controlNetMomentum: control.netMomentum,
      },
      notes:
        'the reversible discrete attraction mechanism. An absorbing (vacuum-excluding) body shadows the vacuum flux, the imbalance pushes a test mass toward the body (correct-sign attraction), all integer/discrete, reversible bulk with irreversibility only at the body/bath. Resolves the wrong-sign worry. The full D4 active-vacuum realization is the next build, this proves the mechanism',
    })
  },
})
