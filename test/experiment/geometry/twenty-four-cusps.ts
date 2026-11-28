// READING ONE BULK STATE TOWARD ALL 24 CUSPS OF A DOCK (E-GMT-0045).
// Constructs all 24 exact ideal cusp vertices of the base 24-cell in Z[sqrt 2] and reads 4 evolved states (present
// minus empty vacuum V1) toward all 24 cusps on the exact R = 2 ball (split coin, bare and F-G).
//
// Depth L2: exact Z[sqrt 2] cusp geometry + exact Z[w][1/2] working rule on the exact ball. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runTwentyFourCusps } from '@/code/measure/twenty-four-cusps'

export default experiment({
  id: 'geometry/twenty-four-cusps',
  code: 'E-GMT-0045',
  title:
    'One bulk state read toward all 24 cusps of the base 24-cell: scalar agreement, symmetric invariance, and seed-driven cusp breaking',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runTwentyFourCusps()
    const ci = res.cuspInfo

    const i0 =
      ci.count === 24 && ci.allNull && ci.equalBasePairing && ci.allSixLayerNeighbors
    const i1 = res.readings.every(r => r.qSpread <= 1e-12)

    const s0Bare = res.readings.find(r => r.name === 'S0_star24' && r.rule === 'bare')!
    const s0Fg = res.readings.find(r => r.name === 'S0_star24' && r.rule === 'fg')!
    const i2 =
      s0Bare.qLayerSpread <= 1e-12 &&
      s0Bare.depthSpread <= 1e-12 &&
      s0Fg.qLayerSpread <= 1e-12 &&
      s0Fg.depthSpread <= 1e-12

    const s1Bare = res.readings.find(r => r.name === 'S1_lone' && r.rule === 'bare')!
    const s1Fg = res.readings.find(r => r.name === 'S1_lone' && r.rule === 'fg')!
    const s3Bare = res.readings.find(r => r.name === 'S3_chiralX1' && r.rule === 'bare')!
    const s3Fg = res.readings.find(r => r.name === 'S3_chiralX1' && r.rule === 'fg')!

    const g1 = s1Bare.distinctOrbits >= 2 && s1Bare.depthSpread > 0.1 && s1Fg.distinctOrbits >= 2
    const g2 =
      s3Bare.qLayerSpread > 0.05 &&
      s3Bare.depthSpread > 0.05 &&
      s3Fg.qLayerSpread > 0.05 &&
      s3Fg.depthSpread > 0.05

    const ok = i0 && i1 && i2 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `24 exact Z[sqrt 2] cusps (6 layer neighbors each): total charge Q agrees to 0 across all 24 cusps on every start; ` +
        `W(F4)-symmetric S0 has 0 spread across all 24 cusps; lone love S1 splits cusps into ${s1Bare.distinctOrbits} orbits ` +
        `(bare depth spread ${s1Bare.depthSpread.toFixed(4)}, F-G ${s1Fg.depthSpread.toFixed(4)}); ` +
        `chiral X1 splits into ${s3Bare.distinctOrbits} (bare) / ${s3Fg.distinctOrbits} (F-G) profiles ` +
        `(Q_layer spread ${s3Bare.qLayerSpread.toFixed(4)} / ${s3Fg.qLayerSpread.toFixed(4)})`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        i2: i2 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        cuspCount: ci.count,
        s0BareDepthSpread: s0Bare.depthSpread,
        s1BareOrbits: s1Bare.distinctOrbits,
        s1BareDepthSpread: s1Bare.depthSpread,
        s1FgOrbits: s1Fg.distinctOrbits,
        s1FgDepthSpread: s1Fg.depthSpread,
        s3BareOrbits: s3Bare.distinctOrbits,
        s3BareQLayerSpread: s3Bare.qLayerSpread,
        s3BareDepthSpread: s3Bare.depthSpread,
        s3FgOrbits: s3Fg.distinctOrbits,
        s3FgQLayerSpread: s3Fg.qLayerSpread,
        s3FgDepthSpread: s3Fg.depthSpread,
      },
    })
  },
})
