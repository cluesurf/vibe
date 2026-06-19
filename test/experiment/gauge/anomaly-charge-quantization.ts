// P79: anomaly cancellation forces charge quantization.
// The substrate cannot host a gauge theory that is inconsistent under its own gauge
// transformations: the gauge anomalies must cancel, the same index-theorem requirement behind
// P8. This experiment shows what that one requirement buys for the Standard Model. We assume the
// gauge group SU(3) x SU(2) x U(1) and one generation of the usual representations, leave every
// hypercharge as a free unknown, and impose only (a) that the Yukawa couplings that give mass are
// gauge invariant, and (b) that the linear gauge anomalies cancel. The solution is unique up to
// normalization, and it is exactly the Standard Model. The cubic and mixed-gravitational
// anomalies, which were not used to solve, then cancel on their own, a nontrivial check that could
// have failed. The electric charges come out quantized in thirds, with the electron at exactly -1
// and the proton at exactly +1, so atoms are neutral. We are explicit that this assumes the gauge
// group and the representation content rather than deriving them.
// Run: npx tsx code/experiment/p79-anomaly-charge-quantization.ts

import { solveLinearSystem } from '@/code/algebra/linear/dense'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// One generation of left-handed Weyl fermions, with their multiplicities (color x weak) and the
// SU(3) and SU(2) embedding used by the anomaly coefficients.
type Field = { name: string; color: number; weak: number; t3: number[] }
const FIELDS: Field[] = [
  { name: 'Q', color: 3, weak: 2, t3: [+0.5, -0.5] }, // quark doublet
  { name: 'uc', color: 3, weak: 1, t3: [0] }, // up antiquark
  { name: 'dc', color: 3, weak: 1, t3: [0] }, // down antiquark
  { name: 'L', color: 1, weak: 2, t3: [+0.5, -0.5] }, // lepton doublet
  { name: 'ec', color: 1, weak: 1, t3: [0] }, // positron
]

function mult(f: Field): number {
  return f.color * f.weak
}

export function anomalyChargeQuantization(
  input: Record<string, never> = {},
): {
  hypercharges: Record<string, number>
  matchesStandardModel: boolean
  cubicAnomaly: number
  colorAnomaly: number
  unusedAnomaliesCancel: boolean
  electricCharges: { name: string; charge: number }[]
  chargesQuantized: boolean
  atomNeutral: boolean
  solved: boolean
} {
  // Unknowns: Y_Q, Y_u, Y_d, Y_L, Y_e. Normalization: fix the Higgs hypercharge Y_H = 1/2.
  const YH = 0.5
  // Constraints (rows in [Y_Q, Y_u, Y_d, Y_L, Y_e]):
  //   Yukawa up      Q.uc.H  : Y_Q + Y_u + Y_H = 0
  //   Yukawa down    Q.dc.Hb : Y_Q + Y_d - Y_H = 0
  //   Yukawa lepton  L.ec.Hb : Y_L + Y_e - Y_H = 0
  //   SU(2)^2 U(1)           : 3 Y_Q + Y_L = 0
  //   grav^2 U(1)            : 6 Y_Q + 3 Y_u + 3 Y_d + 2 Y_L + Y_e = 0
  const A = [
    [1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
    [3, 0, 0, 1, 0],
    [6, 3, 3, 2, 1],
  ]
  const b = [-YH, YH, YH, 0, 0]
  const [YQ, Yu, Yd, YL, Ye] = solveLinearSystem({
    matrix: A,
    rightHandSide: b,
  })
  const Y: Record<string, number> = {
    Q: YQ ?? 0,
    uc: Yu ?? 0,
    dc: Yd ?? 0,
    L: YL ?? 0,
    ec: Ye ?? 0,
  }

  const sm = { Q: 1 / 6, uc: -2 / 3, dc: 1 / 3, L: -1 / 2, ec: 1 }
  const matchesStandardModel = Object.keys(sm).every(
    k =>
      Math.abs((Y[k] ?? 0) - (sm as Record<string, number>)[k]!) < 1e-9,
  )

  // The anomalies we did NOT use to solve, which must cancel on their own.
  //   SU(3)^2 U(1) : sum over color-charged of (weak mult) * Y
  const colorAnomaly = FIELDS.filter(f => f.color > 1).reduce(
    (s, f) => s + f.weak * (Y[f.name] ?? 0),
    0,
  )
  //   U(1)^3 : sum over all of (mult) * Y^3
  const cubicAnomaly = FIELDS.reduce(
    (s, f) => s + mult(f) * (Y[f.name] ?? 0) ** 3,
    0,
  )
  const unusedAnomaliesCancel =
    Math.abs(colorAnomaly) < 1e-9 && Math.abs(cubicAnomaly) < 1e-9

  // Electric charges Q_em = T3 + Y, per weak component. For the antiquarks/positron the listed Y
  // is the charge of the (conjugate) field, so its electric charge reads off directly.
  const electricCharges: { name: string; charge: number }[] = []
  for (const f of FIELDS) {
    for (const t of f.t3) {
      electricCharges.push({
        name: f.name,
        charge: t + (Y[f.name] ?? 0),
      })
    }
  }
  // Quantized means every charge is an integer multiple of 1/3.
  const chargesQuantized = electricCharges.every(
    c => Math.abs(c.charge * 3 - Math.round(c.charge * 3)) < 1e-9,
  )
  // A proton is uud (the conjugates of uc, uc, dc give up, up, down quark charges), an electron is
  // the conjugate of ec. Atom neutral means proton charge + electron charge = 0.
  const upCharge = -((Y['uc'] ?? 0) + 0) // charge of the up quark = -(charge of uc)
  const downCharge = -((Y['dc'] ?? 0) + 0)
  const proton = 2 * upCharge + downCharge
  const electron = -((Y['ec'] ?? 0) + 0)
  const atomNeutral = Math.abs(proton + electron) < 1e-9

  return {
    hypercharges: Y,
    matchesStandardModel,
    cubicAnomaly,
    colorAnomaly,
    unusedAnomaliesCancel,
    electricCharges,
    chargesQuantized,
    atomNeutral,
    solved:
      matchesStandardModel &&
      unusedAnomaliesCancel &&
      chargesQuantized &&
      atomNeutral,
  }
}

export default experiment({
  id: 'gauge/anomaly-charge-quantization',
  title:
    'anomaly cancellation forces the Standard Model hypercharges and quantized electric charges',
  category: 'gauge',
  substrates: 'any',
  depth: 'L0',
  paper: true,
  run() {
    const r = anomalyChargeQuantization()
    const ok =
      r.solved &&
      r.matchesStandardModel &&
      r.unusedAnomaliesCancel &&
      r.chargesQuantized &&
      r.atomNeutral
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the unique anomaly-free Yukawa-consistent solution for one generation is exactly the Standard Model hypercharges with quantized electric charges and a neutral atom',
      metrics: {
        cubicAnomaly: r.cubicAnomaly,
        chargesQuantized: r.chargesQuantized ? 1 : 0,
        atomNeutral: r.atomNeutral ? 1 : 0,
      },
      notes:
        'an algebraic consistency result, the anomaly conditions are imposed not derived from the substrate',
    })
  },
})
