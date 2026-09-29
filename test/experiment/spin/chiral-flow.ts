// E-SPN-0165 NO GAUGE WINDING CHANGES A CHIRAL HALF'S MEMBER NUMBER (the member-number anomaly test). E-SPN-0164 left one
// Sakharov condition missing: every piece keeps each half's member number, N+ and N-. In the Standard Model baryon number
// is not broken by an added piece but by the anomaly: a gauge field's winding moves chiral levels through the Dirac sea
// (spectral flow, the index theorem, the sphaleron). The model has both ingredients, E-SPN-0160's Cl+(4) register with
// E-FRC-0258's two halves (J, right multiplication by vol) and gauge fields on the links. This experiment couples the
// register member's hop to a link field and reads what a winding does to each half.
//
// DERIVATION (written before the gate run):
//  1. THE COUPLING. The stream is where a member meets a link: a slot takes its neighbor's value, so a link field enters
//     as a phase on the taken value, the Peierls phase of E-FRC-0252 (a uniform potential is a shift of the Bloch
//     momentum; a uniform field F01 = B in the Landau gauge A1 = B x0 is the straight-line integral B r1 (x0 + r0 / 2) on
//     a hop by r from x). The phase multiplies all 8 register components alike: the coupled stream is register-blind.
//     It is exact in the ring for B = 2 pi p / 3 (every phase a sixth root of unity, in Z[omega]); B = pi would need i,
//     which Q(omega) lacks, so the magnetic supercell is q = 3.
//  2. THEOREM 1 (no member-number change, any gauge history). Every piece commutes with J: the mixers are E-SPN-0160's
//     (E-FRC-0258 checked them), and the coupled stream is register-blind. So each half's one-member space is invariant,
//     and by Cauchy-Binet (E-SPN-0163's Gaussian lift Gamma) the many-body rule commutes with N+ and N- separately, for
//     every link-field history, winding or not. A finite, exactly number-conserving unitary rule has no room for an
//     anomalous change of N+: the index theorem's "change" can only be a flow of levels relative to a reference phase.
//  3. THEOREM 2 (no flow in either half). For a unitary, the net number of levels crossing ANY reference phase along a
//     closed path of the field is one number, the winding of det U (the flow through two phases differs by the change in
//     the levels between them, which a closed path returns). det of one half's cycle is det(pieces) times the stream's,
//     and the stream's det is sign(perm) times the product of every mode's phase. Threading a flux along the husk
//     direction z shifts K_z, which enters only through exp(-i K_z r_z) summed over the half's modes: sum over 24 slots
//     x 4 register components of r_z = 4 sum_d r_d,z = 0, because every root comes with its opposite. The magnetic
//     field's phases do not depend on K_z. So det is constant on every loop, with any field: the net flow in each half
//     is 0. The opposite slot is the doubler: this is Nielsen-Ninomiya in Floquet form, with no Hamiltonian needed.
//  4. THEOREM 3 (no escape through the husk as a domain wall, at a uniform mass). A 4 + 1 d bulk with a 3 + 1 d boundary
//     (the model's bulk and husk) carries one chiral Weyl species per unit of the bulk's second Chern number C2, and the
//     boundary's chiral anomaly is fed by the bulk (Callan-Harvey). For a massive lattice Dirac operator, C2 = (1/2) sum
//     over the zeros of the Dirac vector s(K) = sum_r r sin(K . r) of sign(det ds/dK) sign(m). E-SPN-0160's band has the
//     same mass M at every zero (E = acos(cos M - 2 cos^2(M/2) g^2) is M exactly where s = 0), so C2 = (sign M / 2) times
//     the sum of the indices, which is 0 by Poincare-Hopf (the Euler characteristic of the 4-torus). So the flat bulk is
//     trivial and no protected chiral mode sits on a boundary. PREDICTED: gates F1-F3 and Z hold, G (a nonzero flow in a
//     half) is false.
//  5. THE ESCAPE (read). A mass that depends on K, m(K) = M + w W(K) with W(K) = sum_r (1 - cos K . r) (Wilson's), flips
//     the sign at the zeros where W is large. If every zero but K = 0 flips, C2 = (1/2)(chi_0 - sum of the rest) = +-1: a
//     single Weyl species per half on the husk, whose member number then changes under husk E . B while the bulk keeps
//     the total (anomaly inflow). With E-SPN-0164's C and CP violation, that is all three Sakharov conditions on the
//     husk. The Wilson mass is not a piece of the rule: whether it can be built covariant, exact and reversible is the
//     next step, so point 5 is read, not gated.
//
// GATES (fixed before the gate run):
//  F1 THE HALVES STAY APART. The rotated pieces leave weight 0 between the halves, and the union of the two halves' cycle
//     phases equals the 192-mode cycle's at 3 momenta (to 1e-10).
//  F2 NO FLOW, THREADED FLUX. Per half, the det winding along K_z in [0, 2 pi] is 0 at 4 transverse momenta (K4 = 0 and
//     pi, the husk quotient's two depth momenta), read with two step counts (48 and 97, so no winding can alias to 0 at
//     both), and arg det departs from its start by at most 1e-9 at every step.
//  F3 NO FLOW, E . B. The same on the magnetic supercell q = 3 with p = 1 and 2 (B = 2 pi / 3, 4 pi / 3), at 3
//     transverse momenta, steps 24 and 37.
//  Z THE DOUBLERS. The zeros of s(K) found on grids 12, 16 and 24 agree (count and classes), the 16 half-periods are all
//     zeros, and the indices sum to 0, so the uniform-mass C2 is 0.
//  G A MEMBER-NUMBER FLOW (predicted false). A nonzero winding in either half.
//  Instrument. I1 the positive control: identity pieces with every root turned to r_z >= 0 (a chiral stream) must wind
//     by -96 exactly (4 x 12 modes with r_z = 1, two beats), read at 480 and 481 steps. I2 the LU determinant's phase
//     equals the eigenvalue product's at one cycle (to 1e-10).
//  Controls. C1 E-SPN-0160: each half's cycle has 4 levels on pi + E(K), 4 on pi - E(K) and 88 flat at 0 at 64 momenta
//     (tolerance 1e-10, E from diracPhase), and 2M reproduces the recorded B* = 0.760502413. C2 a pure gauge (a phase per
//     supercell class) leaves the q = 3 spectrum unchanged (1e-11). C3 E-SPN-0164's A_S(1) = -3047158125 /
//     10851569165584 exactly, from its own pieces (the rest sector, where no link enters). C4 the supercell builder: at
//     p = 0 the q = 3 spectrum is the plain spectrum folded at K, K + G, K + 2G, G = (2 pi / 3, 0, 0, 0) (1e-10).
//  READ, gating nothing: the Wilson staircase C2(w) over the scanned zeros, and the zero classes.
//
// PROBES, disclosed: tmp/cflow-probe1.log: the leak (0), the halves' bands (4 + 4 + 88), plain and magnetic windings
//  (all below 1e-15), the half-periods' Jacobians (index sum -8 over the 16), and a grid-10 zero scan (62 zeros, index
//  sum 10: unconverged). It also found the positive control read 0 at 48 steps: aliasing (a winding of 96 in 48
//  steps), an instrument flaw, fixed before the gate run by the 480 and 481 step reading. tmp/cflow-probe2.log: the
//  positive control at -96.0000 at both step counts; the zero scan on grids 12, 16 and 24: 72 zeros each time, index sum
//  0 (the classes: K = 0 det 20736; 12 half-periods det -768 W 24; 3 half-periods det 256 W 32; 24 zeros det -256 W 28;
//  32 zeros det 324 W 27); the Wilson C2 = 1 for w/M <= -0.05 and 0 for w/M >= -0.02. tmp/cflow-smoke.log: every code
//  path on a small plan (steps 12 and 17, 8 and 11, 4 band momenta, grid 12), all as predicted; no gate changed after it.
//
// FIRST RUN (tmp/cflow-exp-run1.log, 30 s): partial, as derived. F1 leak 0, union of halves against the 192-mode cycle
//  8.9e-16. F2 16 threaded loops and F3 24 E . B loops (q = 3, p = 1 and 2): every half's winding 0 (largest 1.1e-15),
//  arg det departing at most 5.0e-14. Z 72 zeros on grids 12, 16 and 24 (1 at K = 0 det 20736; 12 half-periods det
//  -768; 3 half-periods det 256; 24 det -256 W 28; 32 det 324 W 27), index sum 0, uniform-mass C2 0. G false. I1 the
//  chiral stream winds -96.0000 at 480 and 481 steps; I2 2.2e-16. C1 band 4 + 4 + 88 per half at 64 momenta (gap
//  1.5e-15), 2M 0.760502413; C2 pure gauge 1.8e-15; C3 A_S(1) = -3047158125 / 10851569165584 exactly; C4 fold 1.8e-15.
//  Read: the Wilson staircase C2 = 0 (w/M > -1/32), -3 (-1/28 < w/M < -1/32), 21 (-1/27 < w/M < -1/28), -11 (-1/24 <
//  w/M < -1/27), 1 (w/M < -1/24).
//
// DETERMINISM: no random numbers (grids and Weyl sequences). Floats as measurement, the Jacobians integers, E-SPN-0164's
// control in exact Eisenstein rationals. NOTHING MOVES: a slot takes its neighbor's value, and the link field is the phase
// that taking carries.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cyclePhases } from '@/code/measure/swap-cone'
import {
  DOCK_ROOTS,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  diracPhase,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  sectorBasis,
  trimaximal,
  volumeRight,
} from '@/code/measure/chiral-register'
import {
  chernFromZeros,
  complexDeterminant,
  halfCycle,
  halfPeriods,
  halfPieces,
  halfPhases,
  scanZeros,
  windingOfDet,
  type Field,
  type Zero,
} from '@/code/measure/chiral-flow'
import {
  qw,
  qwAdd,
  qwDiag,
  qwFromEisQMatrix,
  qwFromUnit,
  qwIsZero,
  qwMul,
  qwSub,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  exchangeCount,
  fockGamma,
  fockStates,
  qwMatMulSq,
  unitPower,
} from '@/code/measure/register-many-body'
import {
  branchBeat,
  holeImage,
  pairRate,
  type FockVector,
} from '@/code/measure/sea-conjugation'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

const LIGHT: readonly [number, number] = [-1, 4]
const RECORDED_2M = 0.760502413
const RECORDED_AS1 = qw(-3047158125n, 0n, 10851569165584n)
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [2, 2],
  [-1, 4],
  [-4, 0],
]
const VERTEX: readonly [number, number] = [2, 0]
const H_VALUES: readonly number[] = [0, 2, 3, 4, 6, 8, 12]
const TRANSVERSE: readonly (readonly [number, number, number])[] = [
  [0.3, 0.1, 0],
  [1.1, -0.7, Math.PI],
  [2.3, 0.4, 0],
  [-0.6, 1.9, Math.PI],
]
const MAG_TRANSVERSE: readonly (readonly [number, number, number])[] = [
  [0.2, 0.1, 0],
  [0.9, -0.5, Math.PI],
  [-0.4, 1.3, 0],
]
const PHASE_TOLERANCE = 1e-10
const FLAT_TOLERANCE = 1e-8
const SPREAD_TOLERANCE = 1e-9
const GAUGE_TOLERANCE = 1e-11
const LEAK_TOLERANCE = 1e-15
const WILSON_TABLE: readonly number[] = [
  -1, -0.05, -0.04, -0.037, -0.036, -0.034, -0.03, -0.02, 0, 0.05, 1,
]

export type FlowPlan = {
  steps: readonly number[]
  magSteps: readonly number[]
  controlSteps: readonly number[]
  bandMomenta: number
  grids: readonly number[]
}

export const GATE_PLAN: FlowPlan = {
  steps: [48, 97],
  magSteps: [24, 37],
  controlSteps: [480, 481],
  bandMomenta: 64,
  grids: [12, 16, 24],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/chiral-flow',
  code: 'E-SPN-0165',
  title:
    "no gauge winding changes a chiral half's member number, partial (the member-number Sakharov condition stays missing; a Wilson mass on the register would open a single-Weyl domain-wall phase): the link field enters the register member only as a register-blind phase on the stream, so each half is invariant and the many-body rule keeps N+ and N- exactly under every gauge history; each half's net spectral flow along any closed field path is the winding of its det, which is constant because every root comes with its opposite (sum of r over a half is 0, Nielsen-Ninomiya in Floquet form), measured 0 with a threaded flux and under E . B on a magnetic supercell exact in Z[omega]; the Dirac vector s(K) has 72 zeros whose indices sum to 0, so at E-SPN-0160's uniform mass the bulk second Chern number is 0 and the husk carries no protected chiral mode; a Wilson mass flipping every zero but K = 0 gives C2 = 1, one Weyl species per half on the husk, the domain-wall route to member-number violation (read)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return chiralFlowRun(GATE_PLAN)
  },
})

export function chiralFlowRun(plan: FlowPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const theta = unitAngle(u)
  const uv: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const m = wrap(theta - Math.PI) / 2
  const M = 2 * m
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const P192: CMatrix[] = [
    registerPiece(qS, uv),
    registerPiece(qD, [uv[0], -uv[1]]),
  ]
  const basis = sectorBasis(volumeRight())
  const halves = [
    halfPieces(P192, basis, 0),
    halfPieces(P192, basis, 1),
  ] as const
  const plain: Field = { q: 1, p: 0 }

  // ---------------- F1: the halves stay apart ----------------
  const leak = Math.max(halves[0].leak, halves[1].leak)

  let unionGap = 0

  for (const K of [
    [0.3, 0.1, 0.2, 0],
    [0.7, -0.4, 1.1, Math.PI],
    [1.3, 0.9, -0.2, 0.5],
  ]) {
    const full = [...cyclePhases(P192, REGISTER_ROOTS, K)].sort(
      (a, b) => a - b,
    )
    const split = [
      ...halfPhases(halves[0].pieces, plain, K),
      ...halfPhases(halves[1].pieces, plain, K),
    ].sort((a, b) => a - b)

    unionGap = Math.max(
      unionGap,
      ...full.map((x, i) => Math.abs(wrap(x - split[i]!))),
    )
  }

  const F1 = leak <= LEAK_TOLERANCE && unionGap <= PHASE_TOLERANCE

  log('F1')

  // ---------------- F2 and F3: the windings ----------------
  type Reading = {
    half: number
    field: string
    at: string
    steps: number
    winding: number
    spread: number
    maxStep: number
  }

  const readings: Reading[] = []

  const loop = (
    field: Field,
    t: readonly [number, number, number],
    steps: number,
    half: 0 | 1,
  ): Reading => {
    const w = windingOfDet(
      s =>
        halfCycle(halves[half].pieces, field, [
          t[0],
          t[1],
          2 * Math.PI * s,
          t[2],
        ]),
      steps,
    )

    return {
      half,
      field: `q${field.q}p${field.p}`,
      at: t.map(x => x.toFixed(2)).join(','),
      steps,
      winding: w.winding,
      spread: w.spread,
      maxStep: w.maxStep,
    }
  }

  for (const t of TRANSVERSE) {
    for (const steps of plan.steps) {
      for (const half of [0, 1] as const) {
        readings.push(loop(plain, t, steps, half))
      }
    }
  }

  log('F2')

  for (const p of [1, 2]) {
    for (const t of MAG_TRANSVERSE) {
      for (const steps of plan.magSteps) {
        for (const half of [0, 1] as const) {
          readings.push(loop({ q: 3, p }, t, steps, half))
        }
      }
    }
  }

  log('F3')

  const zeroFlow = (r: Reading): boolean =>
    Math.abs(r.winding) < 0.25 && r.spread <= SPREAD_TOLERANCE
  const threaded = readings.filter(r => r.field === 'q1p0')
  const magnetic = readings.filter(r => r.field !== 'q1p0')
  const F2 =
    threaded.length === TRANSVERSE.length * plan.steps.length * 2 &&
    threaded.every(zeroFlow)
  const F3 =
    magnetic.length ===
      2 * MAG_TRANSVERSE.length * plan.magSteps.length * 2 &&
    magnetic.every(zeroFlow)
  const G = readings.some(r => Math.round(r.winding) !== 0)
  const maxWinding = Math.max(...readings.map(r => Math.abs(r.winding)))
  const maxSpread = Math.max(...readings.map(r => r.spread))

  // ---------------- Z: the doublers ----------------
  const scans = plan.grids.map(g => scanZeros(g))

  const classKey = (zs: readonly Zero[]): string => {
    const c = new Map<string, number>()

    for (const z of zs) {
      const k = `${Math.round(z.det)}/${z.wilson.toFixed(3)}/${z.halfPeriod}`

      c.set(k, (c.get(k) ?? 0) + 1)
    }

    return [...c.entries()]
      .sort()
      .map(([k, n]) => `${k}x${n}`)
      .join(' ')
  }

  const finest = scans[scans.length - 1] as { zeros: Zero[] }
  const scansAgree = scans.every(
    s =>
      s.zeros.length === finest.zeros.length &&
      classKey(s.zeros) === classKey(finest.zeros),
  )
  const indexSum = finest.zeros.reduce(
    (s, z) => s + Math.sign(z.det),
    0,
  )
  const hp = halfPeriods()
  const halfOk =
    hp.length === 16 &&
    hp.every(x => x.sZero && x.det !== 0) &&
    finest.zeros.filter(z => z.halfPeriod).length === 16
  const uniformC2 = chernFromZeros(
    finest.zeros,
    finest.zeros.map(() => M),
  )
  const Z = scansAgree && indexSum === 0 && halfOk && uniformC2 === 0

  log('Z')

  // ---------------- instrument ----------------
  const ident = (n: number): CMatrix => {
    const re = new Float64Array(n * n)

    for (let i = 0; i < n; i++) {
      re[i * n + i] = 1
    }

    return { re, im: new Float64Array(n * n) }
  }

  const chiralRoots = DOCK_ROOTS.map(r =>
    r[2]! < 0 ? r.map(x => -x) : [...r],
  )
  const positive = plan.controlSteps.map(
    steps =>
      windingOfDet(
        s =>
          halfCycle(
            [ident(96), ident(96)],
            plain,
            [0.3, 0.1, 2 * Math.PI * s, 0],
            chiralRoots,
          ),
        steps,
      ).winding,
  )
  const I1 = positive.every(w => Math.abs(w + 96) < 1e-6)
  const test = halfCycle(halves[0].pieces, plain, [0.4, -0.2, 0.9, 0])
  const e = complexEigenvalues({
    re: test.U.re,
    im: test.U.im,
    n: test.n,
  })
  const eigPhase = e.re.reduce(
    (s, x, i) => s + Math.atan2(e.im[i]!, x),
    0,
  )
  const detGap = Math.abs(
    wrap(complexDeterminant(test.U, test.n).phase - eigPhase),
  )
  const I2 = detGap <= 1e-10

  // ---------------- controls ----------------
  // C1: E-SPN-0160's band in each half, and its recorded 2M
  let bandOk = true
  let bandGap = 0

  for (const K of weylMomenta(plan.bandMomenta)) {
    const E = diracPhase(K, M)

    for (const h of halves) {
      const ph = halfPhases(h.pieces, plain, K)
      const up = ph.filter(
        x => Math.abs(wrap(x - Math.PI - E)) <= PHASE_TOLERANCE,
      ).length
      const down = ph.filter(
        x => Math.abs(wrap(x - Math.PI + E)) <= PHASE_TOLERANCE,
      ).length
      const flat = ph.filter(
        x => Math.abs(wrap(x)) <= FLAT_TOLERANCE,
      ).length

      if (up !== 4 || down !== 4 || flat !== 88) {
        bandOk = false
      }

      bandGap = Math.max(
        bandGap,
        ...ph.map(x =>
          Math.min(
            Math.abs(wrap(x)),
            Math.abs(wrap(x - Math.PI - E)),
            Math.abs(wrap(x - Math.PI + E)),
          ),
        ),
      )
    }
  }

  const C1 = bandOk && Math.abs(2 * M - RECORDED_2M) < 5e-10

  // C2: a pure gauge on the supercell leaves the spectrum
  const Kg = [0.35, -0.15, 0.8, 0]
  const sortedPhases = (f: Field): number[] =>
    [...halfPhases(halves[0].pieces, f, Kg)].sort((a, b) => a - b)
  const bare = sortedPhases({ q: 3, p: 1 })
  const gauged = sortedPhases({ q: 3, p: 1, chi: [0, 0.7, 1.9] })
  const gaugeGap = Math.max(
    ...bare.map((x, i) => Math.abs(wrap(x - gauged[i]!))),
  )
  const C2 = gaugeGap <= GAUGE_TOLERANCE

  // C3: E-SPN-0164's A_S(1), from its own pieces
  const D = qwDiag(
    FLAVOR_UNITS.map(([k, j]) => qwFromUnit(ringUnit(k, j))),
  )
  const V = qwFromEisQMatrix(trimaximal())
  const v = qwFromUnit(ringUnit(VERTEX[0], VERTEX[1]))
  const Hx = exchangeCount(2, 3)
  const four = fockStates(6, 4)
  const P = (unitPower(Hx, H_VALUES, v) as { U: QWMatrix }).U
  const US = qwMatMulSq(
    qwMatMulSq(P, fockGamma(branchBeat(V, D, 'S'))),
    P,
  )

  const dense =
    (U: QWMatrix, block: readonly number[]) =>
    (x: FockVector): FockVector => {
      const out: FockVector = new Map()

      for (const to of block) {
        let s = QW_ZERO

        for (const [from, a] of x) {
          const w = (U[to] as QW[])[from]!

          if (!qwIsZero(w)) {
            s = qwAdd(s, qwMul(w, a))
          }
        }

        if (!qwIsZero(s)) {
          out.set(to, s)
        }
      }

      return out
    }

  const rate = (a: number, b: number): QW[] =>
    pairRate(dense(US, four), x => holeImage(x, 6), -1, a, b, 1)
  const AS1 = qwSub(rate(0, 1)[0]!, rate(1, 0)[0]!)
  const C3 = qwIsZero(qwSub(AS1, RECORDED_AS1))

  // C4: the supercell at p = 0 is the plain band folded three times
  const Kc = [0.35, -0.15, 0.8, 0]
  const folded = [0, 1, 2]
    .flatMap(n =>
      halfPhases(halves[0].pieces, plain, [
        Kc[0]! + (2 * Math.PI * n) / 3,
        Kc[1]!,
        Kc[2]!,
        Kc[3]!,
      ]),
    )
    .sort((a, b) => a - b)
  const super0 = [
    ...halfPhases(halves[0].pieces, { q: 3, p: 0 }, Kc),
  ].sort((a, b) => a - b)
  const foldGap = Math.max(
    ...folded.map((x, i) => Math.abs(wrap(x - super0[i]!))),
  )
  const C4 =
    folded.length === super0.length && foldGap <= PHASE_TOLERANCE

  log('controls')

  // ---------------- reads ----------------
  const staircase = WILSON_TABLE.map(w => ({
    w,
    c2: chernFromZeros(
      finest.zeros,
      finest.zeros.map(z => M + w * M * z.wilson),
    ),
  }))

  const instrument = I1 && I2
  const controls = C1 && C2 && C3 && C4
  const hard = F1 && F2 && F3 && Z
  const status =
    !hard || !instrument || !controls ? 'fail' : G ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `F1 ${F1} (leak ${leak.toExponential(1)}, union of halves against the 192-mode cycle ${unionGap.toExponential(1)}); F2 ${F2} (threaded flux, ${threaded.length} loops, every half's winding 0); F3 ${F3} (E . B on the q = 3 supercell, p = 1 and 2, ${magnetic.length} loops); largest |winding| ${maxWinding.toExponential(1)}, largest arg det departure ${maxSpread.toExponential(1)}; Z ${Z} (${finest.zeros.length} zeros of s on grids ${plan.grids.join(', ')}, index sum ${indexSum}, uniform-mass C2 ${uniformC2}); G ${G} (a member-number flow in a half: predicted false); instrument I1 ${I1} (chiral stream ${positive.map(w => w.toFixed(4)).join(', ')}) I2 ${I2}; controls C1 ${C1} C2 ${C2} C3 ${C3} C4 ${C4}; read: Wilson C2 ${staircase.map(s => `${s.w}: ${s.c2}`).join(', ')}`,
    metrics: {
      F1: flag(F1),
      F2: flag(F2),
      F3: flag(F3),
      Z: flag(Z),
      G: flag(G),
      I1: flag(I1),
      I2: flag(I2),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      leak,
      unionGap,
      maxWinding,
      maxSpread,
      zeros: finest.zeros.length,
      indexSum,
      uniformC2,
      wilsonC2: (staircase[0] as { c2: number }).c2,
      bandGap,
      gaugeGap,
      foldGap,
      detGap,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      instrument: flag(instrument),
    },
    notes: `L1. Light u = ringUnit(${LIGHT.join(', ')}), m ${m.toFixed(6)}, M ${M.toFixed(9)} (2M ${(2 * M).toFixed(9)}). Zero classes (det/W/half-period x count): ${classKey(finest.zeros)}; the 16 half-periods' dets ${hp.map(x => x.det).join(' ')}. Windings (half field at steps: winding, spread): ${readings.map(r => `${r.half ? '-' : '+'} ${r.field} [${r.at}] ${r.steps}: ${r.winding.toExponential(1)}, ${r.spread.toExponential(1)}`).join('; ')}. Band gap ${bandGap.toExponential(2)}, pure gauge ${gaugeGap.toExponential(2)}, fold ${foldGap.toExponential(2)}, LU against eigenvalues ${detGap.toExponential(2)}. E-SPN-0164 A_S(1) ${AS1.a} / ${AS1.d}. Wilson staircase ${staircase.map(s => `w/M ${s.w}: C2 ${s.c2}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
