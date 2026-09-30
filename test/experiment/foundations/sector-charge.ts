// IS THE SECTOR IMBALANCE A CHARGE THE RULE COULD GAUGE? (E-FND-0167, OPEN-FND-14, OPEN-FND-15, OPEN-GRV-02,
// OPEN-GRV-13). The split between the S sector (beat 1) and the D sector (beat 2) blocks three results:
//  - E-FND-0159: the capped sector string charges S and D oppositely, so the ledger is E = E1 + (n_S - n_D)(4W - 6),
//    W = sum_r min(V(r), 8) over the box, and an imbalanced sea's energy is not extensive;
//  - E-GRV-0147: the gravity piece pairs S with S in beat 1 and D with D in beat 2, so it acts as two fields, and a hole
//    falls toward a hole of its own band and at most 0.082 as strongly toward the other band;
//  - E-FRC-0273: the only gauge invariant join takes an S pair to a D pair, chiral, with no mass.
// The guess tested here: n_S - n_D is a conserved charge the model treats as long-range without gauging it (a charge
// whose energy grows with the box is what an ungauged charge looks like). Gauged, with a Gauss law on the D4 links,
// (a) only neutral seas would be physical and the ledger extensive, (b) gravity might become one field, (c) the join
// might be the field's charged matter. The derivation is note/research/vibe/roadmap/remaining-pieces.md, "Is the
// sector imbalance a charge?".
//
// DERIVED BEFORE THE GATE RUN (code/measure/sector-charge; E-SPN-0160's pieces, E-SPN-0175's many-body rule,
// E-SPN-0180's Jordan law).
// 1. WHAT n_S - n_D IS (L1). The ledger reads n_S at the start of beat 1 and n_D at the start of beat 2, so the
//    operator is O2 = Q_S - B1^dag Q_D B1, B1 = V M1 the first beat (V = S(K) X, the swap coin with the stream, an
//    involution; M1 = 1 + (u - 1) Q_S). Many-body it is dGamma(O2): every piece of R* is Gaussian (E-SPN-0163), and a
//    pair piece is a phase diagonal in the counts of the stage it acts at, so it commutes with n_S at beat 1 and with
//    n_D at beat 2 and changes neither. In the one-hole sector the pair pieces are the identity (counted from the sea),
//    so the charge is conserved by the many-body rule only if dGamma(O2) commutes with the one-body cycle
//    U = V M2 V M1.
// 2. IT IS NOT CONSERVED, AND THE HOP BREAKS IT (L1). M1 = 1 + (u - 1) Q_S and M2 = 1 + (conj u - 1) Q_D commute with
//    Q_S and Q_D (Q_S Q_D = 0). The coin with the stream does not: it carries S into D through the covariant Clifford
//    hop C = Q_D V Q_S (E-SPN-0180), ||C||_F^2 = 8 g^2 with g^2 = |s(K)|^2 / 4. In each of E-SPN-0180's 8 Jordan blocks
//    of Q_S and P = V Q_D V (principal angle mu = g^2), write a for the S state and b for the P state: then
//    O2 = |a><a| - |b'><b'| with b' = M1^dag b, so O2^2 = (1 - g^2) on the block and O2^3 = (1 - g^2) O2. Its diagonal
//    in U's bands is s - d = +p (band A) and -p (band B), p = sin M (1 - g^2) / sin E (E-GRV-0147's passive charge), so
//    its off-diagonal weight is (1 - g^2) - p^2 per block and, with the two bands at -e^(+-iE),
//      ||[U, O2]||_F = 8 |sin E| sqrt(1 - g^2 - p^2),
//    zero exactly at K = 0 (g = 0, E = M, p = 1) and nowhere else in the moving band. So n_S - n_D is Dirac's scalar
//    density psi-bar psi, which the mass (the mixers, diagonal in S and D) keeps and the kinetic hop (off-diagonal)
//    breaks. It oscillates at the band gap 2E: the zitterbewegung of the charge.
// 3. NO SUBGROUP SURVIVES, SO THERE IS NOTHING TO GAUGE (L1). The one-frame charge O1 = Q_S - Q_D has integer spectrum
//    {-1, 0, 1}, so R(alpha) = e^(i alpha O1) is a U(1) candidate. M1, M2 commute with it. Under R, the hop C picks up
//    e^(-2 i alpha) and V's leak from S out of S + D picks up e^(-i alpha), and ||(1 - Q_S - Q_D) V Q_S||_F^2 =
//    8 (1 - |gamma(K)|^2 - g^2) > 0 away from K = 0. So no alpha other than 2 pi Z keeps U: not U(1), and no Z_n for
//    n = 2 .. 12. The two-frame O2 is worse: its spectrum +-sqrt(1 - g^2) is not quantized, so e^(i alpha O2) has no
//    period at all. A Gauss law needs a local conserved charge with integer values; the rule has none here. Its band
//    diagonal part (the time average of O2, +-p per hole) IS conserved, as every time average is, but it is m / E: a
//    velocity-dependent scalar, not a gauge charge.
// 4. THE CAPPED STRING IS NOT A GAUGE FIELD IN AXIAL GAUGE (L1, read off code/measure/energy-ledger seaLedger). Its direct
//    term is -k_string W (n_S^2 - n_D^2) / 2 a dock, k_string = -2: W (n_S^2 - n_D^2) = W (n_S - n_D)(n_S + n_D), with
//    n_S + n_D = 4 on E-FND-0159's band seas, hence its 4W (n_S - n_D). A gauge field of charge q = n_S - n_D, integrated
//    out, gives W q^2 = W (n_S^2 - 2 n_S n_D + n_D^2): even under q -> -q, with S-D cross terms. The string's term is
//    odd (E-FND-0159's band seas read +3,121.8 and -3,121.8) and has no cross term, because it pairs S with S in beat 1
//    and D with D in beat 2. So gauging would be a new piece, not a reading of the string, and there is no charge for it.
//    What (a) asked is already true without it: n_S = n_D makes the direct term 0 for every W, so a neutral sea is
//    extensive (every sea filling both bands equally at each K is neutral, since s - d is +p in band A and -p in B).
//    What a gauge field would add is the rule that ONLY neutral seas are physical, and that needs the charge conserved.
// 5. (b) ONE FIELD NEEDS THE OTHER COMBINATION (L1, then run). Every field of this form acts on a probe hole as a mass
//    shift (a phase +phi on S at beat 1 and -phi on D at beat 2 moves theta, and both bands' E rise with M), so the
//    probe's band does not matter at rest. What matters is how the SOURCE counts. With the source counted as
//    n_S - n_D (the S-D field) a band-A source at rest has charge +1 and a band-B source -1, so a band-B hole PUSHES
//    every hole away while a band-A hole pulls every hole in. A band-A hole is pushed from a band-B hole and the band-B
//    hole is pulled toward it: the pull depends on the source's band alone, not action equal to reaction. The combination
//    that treats both bands alike is n_S + n_D, the active charge E-GRV-0147 read as exactly 1 for every state (s + d =
//    1): the moving-hole NUMBER, which is conserved (N and N_F are). A field sourced by it pulls every hole alike by
//    construction. But written as a pair piece at one stage, it needs the D count and the S count carried to that stage
//    (V Q_S V at beat 2) at once, and those do not commute where the hop acts: ||[Q_D, V Q_S V]||_F^2 = 16 g^2 (1 - g^2),
//    0 only at K = 0. So one field is blocked by the same hop, in a different place.
// 6. (c) THE JOIN IS THE HOP'S PAIR FORM, NOT CHARGED MATTER (L1). E-FRC-0273's join takes two holes that sat in S at
//    the beat-1 stage to two holes in D at the beat-2 stage: under the two-frame count it moves the pair's n_S - n_D
//    from +2 toward -2, as C moves one member's. So it is a second piece that breaks the would-be charge, and with no
//    U(1) or Z_n (point 3) there is no field for it to be charged under.
//
// PREDICTED VERDICT: FAIL, on H alone, as derived: n_S - n_D is not conserved, and the stream's hop is the piece that
// breaks it.
//
// GATES, fixed before the gate run. The rule is R*'s one-member cycle (the member mixers at the light unit
// ringUnit(-1, 4), M = 0.380251). The momenta: K = k u, u along (1,0,0,0), (1,1,0,0)/sqrt 2, (1,1,1,1)/2,
// k in 0.2, 0.8, 1.6, and K = 0.
//  D1 THE LAW: at every momentum ||[U, O2]||_F^2 equals 64 sin^2 E (1 - g^2 - p^2) within 1e-9, with g^2 = ||C||_F^2 / 8
//     and E, p from E-SPN-0160's closed band (diracPhase); at K = 0 ||[U, O2]||_F <= 1e-12.
//  D2 THE PIECES: at every momentum ||Q_S Q_D||_F, ||[M1, O1]||_F and ||[M2, O1]||_F <= 1e-12, and ||C||_F^2 equals
//     8 g^2 (g^2 from structureVector) within 1e-12; ||[V, O1]||_F >= 0.1 at every K != 0 and <= 1e-12 at K = 0.
//  D3 NOT QUANTIZED: ||O2^3 - (1 - g^2) O2||_F <= 1e-11 and |Tr O2| <= 1e-12 at every momentum; ||O2^3 - O2||_F
//     >= 0.01 at every K != 0 (the spectrum is +-sqrt(1 - g^2), not +-1).
//  D4 NO SUBGROUP: for R = e^(2 pi i O1 / n), ||R U R^dag - U||_F <= 1e-12 at n = 1 and at K = 0 for every n, and
//     >= 0.1 for every n = 2 .. 12 at every K != 0.
//  D5 IN REAL SPACE: one member started as S_0 on the origin of the L = 4 torus under the real-space rule, 32 cycles:
//     the two-frame charge n_S - n_D spans more than 0.1 (largest minus least).
//  D6 THE ONE-FIELD SOURCE: ||[Q_D, V Q_S V]||_F^2 equals 16 g^2 (1 - g^2) within 1e-12 at every momentum (0 at K = 0).
//  B1 THE S-D FIELD ON THE SLAB (E-GRV-0147's slab: side 40, r 10, sigma 3, T 8, the pair unit 0.28670 times the husk
//     kernel): with the source counted as n_S - n_D (both stages' angles times sigma_S - sigma_D), a band-A hole's pull
//     toward a band-B source is negative at every cycle 1 .. T; the band-B hole's pull toward the band-B source equals
//     it within 1e-9 relative, and both bands' pulls toward a band-A source are equal (within 1e-9 relative) and
//     positive at cycle T.
//  H THE CHARGE IS CONSERVED (predicted FAIL): ||[U, O2]||_F <= 1e-12 at every momentum.
// CONTROLS (a failure makes the verdict partial at best).
//  C1 A START WITH NOTHING TO BREAK: S_0 on every dock (K = 0) under the same run: n_S - n_D within 1e-12 of 1 at every
//     cycle of the 32.
//  C2 E-GRV-0147 REPRODUCED: the two-field piece on the same slab: the like pull A|A after T cycles within 1e-3 relative
//     of 2.1739e-2 and the largest cross pull A|B over the cycles below 0.2 of it.
// INSTRUMENT (a failure makes the verdict partial at best). ||V^2 - 1||_F and ||B1 - V M1||_F <= 1e-12 at every
//  momentum; the real-space charge equals the Bloch sum over the torus's 128 momenta within 1e-10 at every cycle; the
//  norm within 1e-10 in every run.
// READ, gating nothing: the charge's series and n_S + n_D (the frame count, not conserved either, while the moving
//  number is); the gaps per n; |gamma|^2 and the leak; the pulls of the S+D field (the same array for both source bands,
//  so cross = like by construction); the S-D field's push against the like pull.
// Verdict: fail if D1 to D6, B1 or H fails (H is predicted to); partial if a control or the instrument fails; pass
//  otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run).
//  tmp/sd-probe1.log: at K = 0, (0.2,0,0,0), (0.8,0,0,0), (1.6,0,0,0), (0.4,0.4,0.4,0.4): ||[U, O2]||_F 1.5e-15, 1.07836,
//  3.66134, 4.77152, 3.66134, each on the law to 1e-12; O2^3 = (1 - g^2) O2 to 1.2e-13; ||C||^2 / 8 = g^2; the Z_n gaps
//  0.74 to 7.5 away from K = 0, below 5e-14 at K = 0; [Q_D, V Q_S V] on 16 g^2 (1 - g^2); on the L = 4 torus the
//  origin start's charge reads 0.958, 0.591, 0.318, 0.515, 0.743 ... over 8 cycles, the real-space run equal to the Bloch
//  sum to every printed digit, the uniform start 1 to 4e-15.
//  tmp/sd-probe2.log (slab side 20, r 6, sigma 2, T 4): under the S-D field A|B and B|B read -2.2e-5, -3.2e-4, -1.5e-3,
//  -4.6e-3 (pushed) while A|A and B|A read +1.2e-2 at T = 4; the push is smaller than the pull because the negative
//  field lowers the local rest gap toward 0 (M - 0.2867 k), which is nonlinear; the two-field piece reproduces
//  E-GRV-0147's probe (cross 0.33 of like at sigma 2). B1 was worded on sign and the band mirror for that reason.
//
// DETERMINISM: no random numbers; every start is a fixed mode or packet. EXACT: the projectors are integer matrices over
// 24 and 48, the coin a permutation; every product and norm is float measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { diracPhase, structureVector } from '@/code/measure/spinor-register'
import { sectorBases, torus } from '@/code/measure/register-sea'
import {
  columnKernel,
  oneTorus,
  packetRun,
  type OneTorus,
} from '@/code/measure/register-count'
import {
  blochChargeSeries,
  chargeReading,
  holeChargeSeries,
  Z_ORDERS,
  type ChargeReading,
} from '@/code/measure/sector-charge'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0, 0],
  [1 / Math.SQRT2, 1 / Math.SQRT2, 0, 0],
  [0.5, 0.5, 0.5, 0.5],
]
const MAGNITUDES: readonly number[] = [0.2, 0.8, 1.6]
const EXACT = 1e-12
const LAW = 1e-9
const CUBIC = 1e-11
const BROKEN = 0.1
const NOT_INTEGER = 0.01
const SPAN = 0.1
const FLOAT = 1e-10
const MIRROR = 1e-9
const LIKE_0147 = 2.1739e-2
const LIKE_TOLERANCE = 1e-3
const CROSS_LIMIT = 0.2

export type SectorChargePlan = {
  L: number
  cycles: number
  slabSide: number
  separation: number
  sigma: number
  slabCycles: number
}

export const GATE_PLAN: SectorChargePlan = {
  L: 4,
  cycles: 32,
  slabSide: 40,
  separation: 10,
  sigma: 3,
  slabCycles: 8,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/sector-charge',
  code: 'E-FND-0167',
  title:
    "the sector imbalance n_S - n_D that E-FND-0159's ledger, E-GRV-0147's two gravity fields and E-FRC-0273's join all turn on is not a charge the rule could gauge, fail as derived: it is Dirac's scalar density, kept by the mixers and broken by the stream's Clifford hop C = Q_D V Q_S, with ||[U, O2]||_F = 8 |sin E| sqrt(1 - g^2 - p^2) (0 only at rest); its spectrum is +-sqrt(1 - g^2), not quantized, and the integer one-frame Q_S - Q_D keeps no U(1) and no Z_n for n 2 to 12; on the L = 4 torus a hole's total n_S - n_D swings over cycles while a start at rest holds it at 1; the capped string's direct term is W (n_S^2 - n_D^2), odd in the charge and without S-D cross terms, so it is not a gauge field in axial gauge, and neutral seas are already extensive without one; a field sourced by n_S - n_D makes a band-B hole push every hole away, and the combination both bands share, n_S + n_D, is blocked as a one-stage pair piece by the same hop ([Q_D, V Q_S V] = 16 g^2 (1 - g^2))",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return sectorChargeRun(GATE_PLAN)
  },
})

type Row = {
  K: number[]
  rest: boolean
  g2: number
  E: number
  p: number
  r: ChargeReading
  lawSquared: number
}

// the pull of a column packet toward a static source on column 0 whose stage weights are (wS, wD) (the S unit's extra
// angle unit k wS, the D unit's -unit k wD), against the free packet
function pull(input: {
  o: OneTorus
  k: Float64Array
  band: 'A' | 'B'
  w: readonly [number, number]
  r: number
  sigma: number
  cycles: number
  theta: number
  unit: number
  free: number[] | null
}): { x: number[]; drift: number } {
  const { o, k, w, unit } = input
  const run = packetRun({
    ...input,
    angleS: Float64Array.from(o.column, c => unit * k[c]! * w[0]),
    angleD: Float64Array.from(o.column, c => -unit * k[c]! * w[1]),
    bases: sectorBases(),
  })

  return {
    x: input.free ? run.x.map((v, i) => -(v - input.free![i]!)) : run.x,
    drift: run.drift,
  }
}

export function sectorChargeRun(plan: SectorChargePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const unit = -unitAngle(ringUnit(STRING[0], STRING[1]))
  const M = Math.PI - Math.abs(th)

  // ---------------- D1 .. D4, D6, H: the one-member readings ----------------
  const momenta: { K: number[]; rest: boolean }[] = [
    { K: [0, 0, 0, 0], rest: true },
    ...DIRECTIONS.flatMap(u =>
      MAGNITUDES.map(k => ({ K: u.map(x => x * k), rest: false })),
    ),
  ]
  const rows: Row[] = momenta.map(({ K, rest }) => {
    const r = chargeReading(th, K)
    const g2 = structureVector(K).reduce((a, x) => a + x * x, 0) / 4
    const E = diracPhase(K, M)
    const p = (Math.sin(M) * (1 - g2)) / Math.sin(E)

    return { K, rest, g2, E, p, r, lawSquared: 64 * Math.sin(E) ** 2 * (1 - g2 - p * p) }
  })
  const moving = rows.filter(x => !x.rest)
  const rest = rows.find(x => x.rest)!

  log('the one-member readings')

  const lawWorst = Math.max(...rows.map(x => Math.abs(x.r.commO2 ** 2 - x.lawSquared)))
  const D1 = lawWorst <= LAW && rest.r.commO2 <= EXACT
  const piecesWorst = Math.max(
    ...rows.map(x => Math.max(x.r.sectorOverlap, x.r.commM1, x.r.commM2)),
  )
  const hopWorst = Math.max(...rows.map(x => Math.abs(x.r.hop2 - 8 * x.g2)))
  const hopLeast = Math.min(...moving.map(x => x.r.commV))
  const D2 =
    piecesWorst <= EXACT &&
    hopWorst <= EXACT &&
    hopLeast >= BROKEN &&
    rest.r.commV <= EXACT
  const cubicWorst = Math.max(...rows.map(x => x.r.cubic))
  const traceWorst = Math.max(...rows.map(x => Math.abs(x.r.traceO2)))
  const integerLeast = Math.min(...moving.map(x => x.r.cubicInteger))
  const D3 = cubicWorst <= CUBIC && traceWorst <= EXACT && integerLeast >= NOT_INTEGER
  const zTrivialWorst = Math.max(
    ...rows.map(x => x.r.zGap[0]!),
    ...rest.r.zGap,
  )
  const zLeast = Math.min(...moving.flatMap(x => x.r.zGap.slice(1)))
  const D4 = zTrivialWorst <= EXACT && zLeast >= BROKEN
  const stageWorst = Math.max(
    ...rows.map(x => Math.abs(x.r.stageComm2 - 16 * x.g2 * (1 - x.g2))),
  )
  const D6 = stageWorst <= EXACT
  const H = rows.every(x => x.r.commO2 <= EXACT)
  const instrumentPieces = Math.max(...rows.map(x => Math.max(x.r.involution, x.r.order)))

  // ---------------- D5, C1: the charge of one member in real space ----------------
  const o4 = oneTorus(plan.L)
  const t4 = torus(plan.L)
  const bases = sectorBases()
  const real = holeChargeSeries({ o: o4, bases, theta: th, a: 0, cycles: plan.cycles, uniform: false })
  const uniform = holeChargeSeries({ o: o4, bases, theta: th, a: 0, cycles: plan.cycles, uniform: true })

  log('the real-space runs')

  const bloch = blochChargeSeries(th, t4.momenta, 0, plan.cycles)

  log('the Bloch sum')

  const span = Math.max(...real.charge) - Math.min(...real.charge)
  const D5 = span > SPAN
  const uniformWorst = Math.max(...uniform.charge.map(q => Math.abs(q - 1)))
  const C1 = uniformWorst <= EXACT
  const blochWorst = Math.max(...real.charge.map((q, i) => Math.abs(q - bloch.charge[i]!)))
  const normWorstReal = Math.max(real.drift, uniform.drift)

  // ---------------- B1, C2: the pulls on the slab ----------------
  const o = oneTorus(plan.slabSide, 2)
  const { column: k } = columnKernel(plan.slabSide)
  const common = {
    o,
    k,
    r: plan.separation,
    sigma: plan.sigma,
    cycles: plan.slabCycles,
    theta: th,
    unit,
  }
  const freeA = pull({ ...common, band: 'A', w: [0, 0], free: null })
  const freeB = pull({ ...common, band: 'B', w: [0, 0], free: null })
  const free = { A: freeA.x, B: freeB.x }
  // the source's stage counts at rest: band A (1, 0), band B (0, 1); the S-D field weights both stages by
  // sigma_S - sigma_D (+1 for A, -1 for B), the S+D field by sigma_S + sigma_D (1 for both), the two-field piece
  // (E-GRV-0147) by (sigma_S, sigma_D)
  const cases: { name: string; band: 'A' | 'B'; w: [number, number] }[] = [
    { name: 'two A|A', band: 'A', w: [1, 0] },
    { name: 'two A|B', band: 'A', w: [0, 1] },
    { name: 'diff A|A', band: 'A', w: [1, 1] },
    { name: 'diff B|A', band: 'B', w: [1, 1] },
    { name: 'diff A|B', band: 'A', w: [-1, -1] },
    { name: 'diff B|B', band: 'B', w: [-1, -1] },
  ]
  const pulls = cases.map(c => {
    const p = pull({ ...common, band: c.band, w: c.w, free: free[c.band] })

    log(`${c.name}: ${p.x.map(v => v.toExponential(3)).join(' ')}`)

    return { ...c, x: p.x, drift: p.drift }
  })
  const series = (name: string): number[] => pulls.find(p => p.name === name)!.x
  const lastOf = (name: string): number => {
    const x = series(name)

    return x[x.length - 1]!
  }
  const like = lastOf('two A|A')
  const crossLargest = Math.max(...series('two A|B').map(Math.abs))
  const C2 =
    Math.abs(like / LIKE_0147 - 1) <= LIKE_TOLERANCE && crossLargest < CROSS_LIMIT * like
  const pushAB = series('diff A|B')
  const pushBB = series('diff B|B')
  const pullAA = lastOf('diff A|A')
  const pullBA = lastOf('diff B|A')
  const relative = (a: number, b: number): number => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b))
  const mirrorPush = Math.max(...pushAB.map((v, i) => relative(v, pushBB[i]!)))
  const mirrorPull = relative(pullAA, pullBA)
  const B1 =
    pushAB.every(v => v < 0) &&
    mirrorPush <= MIRROR &&
    mirrorPull <= MIRROR &&
    pullAA > 0
  const normWorstSlab = Math.max(freeA.drift, freeB.drift, ...pulls.map(p => p.drift))

  log('the slab')

  // ---------------- verdict ----------------
  const I = instrumentPieces <= EXACT && blochWorst <= FLOAT && Math.max(normWorstReal, normWorstSlab) <= FLOAT
  const hard = D1 && D2 && D3 && D4 && D5 && D6 && B1 && H
  const status = !hard ? 'fail' : !C1 || !C2 || !I ? 'partial' : 'pass'
  const e3 = (v: number): string => v.toExponential(3)
  const f6 = (v: number): string => v.toFixed(6)
  const metrics: Record<string, number> = {
    D1: flag(D1),
    D2: flag(D2),
    D3: flag(D3),
    D4: flag(D4),
    D5: flag(D5),
    D6: flag(D6),
    B1: flag(B1),
    H: flag(H),
    C1: flag(C1),
    C2: flag(C2),
    I: flag(I),
    restGap: M,
    lawWorst,
    restCommutator: rest.r.commO2,
    piecesWorst,
    hopWorst,
    hopLeast,
    cubicWorst,
    traceWorst,
    integerLeast,
    zTrivialWorst,
    zLeast,
    stageWorst,
    instrumentPieces,
    span,
    uniformWorst,
    blochWorst,
    normWorstReal,
    normWorstSlab,
    like,
    crossLargest,
    crossRatio: crossLargest / like,
    pullAA,
    pullBA,
    pushAB: pushAB[pushAB.length - 1]!,
    pushBB: pushBB[pushBB.length - 1]!,
    pushOverPull: pushAB[pushAB.length - 1]! / pullAA,
    mirrorPush,
    mirrorPull,
    seconds: (Date.now() - started) / 1000,
  }

  rows.forEach((x, i) => {
    metrics[`K${i}_commO2`] = x.r.commO2
    metrics[`K${i}_g2`] = x.g2
    metrics[`K${i}_p`] = x.p
    metrics[`K${i}_leak2`] = x.r.leak2
    metrics[`K${i}_stay2`] = x.r.stay2
    Z_ORDERS.forEach((n, j) => (metrics[`K${i}_z${n}`] = x.r.zGap[j]!))
  })
  real.charge.forEach((q, i) => (metrics[`charge_cycle${i}`] = q))
  real.number.forEach((q, i) => (metrics[`number_cycle${i}`] = q))

  const rowText = rows
    .map(x => `K (${x.K.map(v => v.toFixed(3)).join(',')}): g^2 ${f6(x.g2)}, p ${f6(x.p)}, ||[U,O2]|| ${f6(x.r.commO2)} (law ${f6(Math.sqrt(Math.max(0, x.lawSquared)))}), ||[V,O1]|| ${f6(x.r.commV)}, leak^2 ${f6(x.r.leak2)}, Z gaps n 2..12 ${x.r.zGap.slice(1).map(v => v.toFixed(3)).join(' ')}`)
    .join('; ')
  const pullText = pulls.map(p => `${p.name} ${p.x.map(e3).join(' ')}`).join('; ')

  return verdict({
    status,
    claim: `D1 ${D1} (||[U, O2]||^2 on 64 sin^2 E (1 - g^2 - p^2) within ${e3(lawWorst)}, at rest ${e3(rest.r.commO2)}); D2 ${D2} (Q_S Q_D, [M1, O1], [M2, O1] at most ${e3(piecesWorst)}, ||C||^2 = 8 g^2 within ${e3(hopWorst)}, ||[V, O1]|| at least ${f6(hopLeast)} away from rest, ${e3(rest.r.commV)} at rest); D3 ${D3} (O2^3 = (1 - g^2) O2 within ${e3(cubicWorst)}, trace ${e3(traceWorst)}, O2^3 - O2 at least ${f6(integerLeast)}); D4 ${D4} (trivial ${e3(zTrivialWorst)}, least gap for n 2..12 away from rest ${f6(zLeast)}); D5 ${D5} (the charge spans ${f6(span)} over ${plan.cycles} cycles on L ${plan.L}); D6 ${D6} ([Q_D, V Q_S V]^2 on 16 g^2 (1 - g^2) within ${e3(stageWorst)}); B1 ${B1} (S-D field: A|B ${pushAB.map(e3).join(' ')}, B|B equal within ${e3(mirrorPush)}, A|A ${e3(pullAA)} and B|A equal within ${e3(mirrorPull)}); H ${H}; controls C1 ${C1} (rest start within ${e3(uniformWorst)} of 1) C2 ${C2} (two-field like ${e3(like)}, cross at most ${f6(crossLargest / like)} of it); instrument ${I} (pieces ${e3(instrumentPieces)}, Bloch against real ${e3(blochWorst)}, norms ${e3(Math.max(normWorstReal, normWorstSlab))})`,
    metrics,
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(I) },
    notes: `L1 (the charge, the law, the group, the string's form) and L2 (the pulls, one hole in a static source's field on the slab of side ${plan.slabSide}). Rest gap M ${f6(M)}. ${rowText}. Charge by cycle ${real.charge.map(q => q.toFixed(6)).join(' ')}; n_S + n_D by cycle ${real.number.map(q => q.toFixed(6)).join(' ')}. Pulls by cycle: ${pullText}. The S+D field weights both stages by 1 for either source band, so its cross pull is the like pull by construction (diff A|A and diff B|A above are that field). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
