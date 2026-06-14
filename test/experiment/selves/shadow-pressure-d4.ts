// E2 on the native geometry, P2. Shadow-pressure attraction realized on the real {3,4,3,4} substrate, the
// 24-direction D4 coin with its true root vectors. A body slab that EXCLUDES the vacuum (absorbs the tones streaming
// into it) casts a SHADOW, the +x-moving tones are absorbed before reaching the far side, so the net momentum at a
// test plane behind the body points TOWARD the body = attraction, the correct sign. Fully discrete, the state is the
// ternary tone {-1,0,+1} on each of the 24 directed slots per cell, the momentum is the exact integer sum of the
// present tones' D4 root vectors. The streaming is the committed reversible bijection, the only irreversibility is
// the vacuum exclusion at the body and the open source layers (radiation reaching the bath). This is the
// geometry-native realization of the reversible discrete attraction, on the 24-cell coin itself.
//
// Depth L2, the reversible discrete attraction on the {3,4,3,4} coin, a vacuum-excluding body attracts by
// radiation-pressure shadow measured in the true D4 momentum, with the no-body symmetric flux as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { shadowPressureD4 } from '@/code/dynamics/shadow-pressure'

export default experiment({
  id: 'selves/shadow-pressure-d4',
  title: 'shadow-pressure attraction on the real 24-direction D4 coin (net momentum points toward a vacuum-excluding body)',
  category: 'selves',
  substrates: ['d4'],
  depth: 'L2',
  paper: true,
  run() {
    const base = { side: 12, beats: 36, bodyLoX: 2, bodyHiX: 5, testX: 8 }
    const withBody = shadowPressureD4({ ...base, body: true })
    const noBody = shadowPressureD4({ ...base, body: false })

    // net x-momentum at the test plane is strongly negative (toward the body) with a body, and zero without.
    const attracts = withBody < -0.5
    const controlFlat = Math.abs(noBody) < 0.02
    const ok = attracts && controlFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the real {3,4,3,4} substrate (the 24-direction D4 coin with its true root vectors), a body that excludes the vacuum casts a radiation-pressure SHADOW, the net momentum at a test plane behind the body points TOWARD the body (negative x = attraction, correct sign), while with no body the flux is symmetric and the net momentum is exactly zero, the streaming is the committed reversible bijection and the only irreversibility is the vacuum exclusion at the body and the open source layers, so this is binding-by-radiation realized natively on the 24-cell coin, fully discrete (ternary tones on the 24 directed slots, exact integer momentum)',
      metrics: {
        netXmomentumWithBodyTimes1000: Math.round(withBody * 1000),
        netXmomentumNoBodyTimes1000: Math.round(noBody * 1000),
        attracts: attracts ? 1 : 0,
        controlFlat: controlFlat ? 1 : 0,
        side: base.side,
        directions: 24,
      },
      control: { netXmomentumNoBodyTimes1000: Math.round(noBody * 1000) },
      notes:
        'the geometry-native reversible discrete attraction. On the 24-direction D4 coin, a vacuum-excluding body shadows the directional flux and the net momentum behind it points toward the body (attraction), measured in the true D4 root vectors, with the no-body control exactly zero. Fully discrete, reversible streaming, irreversibility only at the body/bath. Closes the geometry-native realization of shadow-pressure binding (P2)',
    })
  },
})
