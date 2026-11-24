// EXACT {3,4,3,4} SHELL GROWTH RECURRENCE (m-02) AND FRAME HOLONOMY GROUP (m-03) (E-GMT-0046).
// Depth L2: exact Z[sqrt 2] Coxeter arithmetic from exact-3434.ts. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runShellAndHolonomy } from '@/code/measure/shell-and-holonomy'

export default experiment({
  id: 'geometry/shell-and-holonomy',
  code: 'E-GMT-0046',
  title:
    'Exact {3,4,3,4} shell counts S(0)..S(3) recurrence check (m-02) and loop holonomy of transports vs facet reflections (m-03)',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runShellAndHolonomy()
    const ok =
      res.stabilizerOrder === 1152 &&
      res.transportLoopHolonomyOrder === 1 &&
      res.shells0to3[0] === 1 &&
      res.shells0to3[1] === 24 &&
      res.shells0to3[2] === 456 &&
      res.shells0to3[3] === 8376 &&
      res.recurrenceResidualAt3 === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Exact {3,4,3,4} cell shells S(0..3) = ${res.shells0to3.join(', ')} (exact residual S(3) - (18*S(2) + 7*S(1)) = ` +
        `${res.recurrenceResidualAt3}, showing why boundary numerator terms break the recurrence below shell 3/4, m-02); ` +
        `cell stabilizer |W(F4)| = ${res.stabilizerOrder}, antipodal transport k_a = F_a Z loop holonomy order = ` +
        `${res.transportLoopHolonomyOrder} (exact flat label transport), raw facet-reflection 4-cycle holonomy order = ` +
        `${res.faceReflectionLoopHolonomyOrder} (stabilizer-fixing subgroup order = ${res.evenFaceSquareOrder}, m-03)`,
      metrics: {
        s0: res.shells0to3[0]!,
        s1: res.shells0to3[1]!,
        s2: res.shells0to3[2]!,
        s3: res.shells0to3[3]!,
        recurrenceResidualAt3: res.recurrenceResidualAt3,
        stabilizerOrder: res.stabilizerOrder,
        transportLoopHolonomyOrder: res.transportLoopHolonomyOrder,
        faceReflectionLoopHolonomyOrder: res.faceReflectionLoopHolonomyOrder,
        evenFaceSquareOrder: res.evenFaceSquareOrder,
      },
    })
  },
})
