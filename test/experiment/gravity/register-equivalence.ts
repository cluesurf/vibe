// THE EQUIVALENCE PRINCIPLE UNDER THE REGISTER COUNT (E-GRV-0147). E-GRV-0146 wrote gravity's count field under the
// many-body register rule: the source is one hole's sector count counted from the sea, and the depth acts back as a sector
// pair piece with the husk depth's kernel. It read the hole's beat-averaged charge as 0.524 and left open whether that is
// the hole's inertia (OPEN-GRV-02, pieces idea 1d). This file asks it: is the gravitational charge the inertial mass, in
// one unit, and if not, is the ratio at least the same for every hole (the weak, universal form)? Ledger H "the
// equivalence principle" (stand-in).
//
// DERIVED BEFORE THE GATE RUN (code/measure/register-count bandCharges, oneBeat's static field).
// 1. THREE CHARGES OF ONE STATE (L1). A moving hole's 16 states at momentum K are two bands of 8: band A with cycle
//    phase below 0 (E_A = pi + phase, rest phase theta), band B above (E_B = pi - phase). For a band state let s be its
//    weight in Q_S at the start of beat 1 and d its weight in Q_D at the start of beat 2. Then
//     - the ACTIVE charge E-GRV-0146 read (the sector count at each beat's stage, beat-averaged) is (s + d) / 2 a beat;
//     - the PASSIVE charge, how the band's energy moves when the pair piece shifts its mixer angle, is s - d for band A
//       (d - s for B): Hellmann-Feynman on U = U2 U1 gives dphase = s dS - d dD for the S unit u e^(i dS) and the D
//       unit conj(u) e^(-i dD), and the gravity piece shifts theta, so dS = dD;
//     - the INERTIA is the band's curvature, m = 1 / E''(0). E-SPN-0160's closed band cos E = cos M - (1 + cos M) g^2,
//       g^2 = K^2 / 8 near 0, gives m = 4 tan(M / 2) = 0.76979 in cycles and coordinate units (the rest energy is
//       M = 0.38025, and a relativistic band would give M / v^2 = 2M = 0.76050, so R = 1.0122, E-SPN-0160's tan m / m).
//    The same closed band gives the passive charge exactly: dE/dM = sin M (1 - g^2) / sin E, 1 at rest (the premise of
//    E-GRV-0146's sign, slope +1), falling as the state moves, the lattice form of a scalar density M / E.
// 2. THE SUM RULE. S lies in W at every K (E-SPN-0175), so Tr(Q_S P_W) = 8 splits between the bands: s_A + s_B = 1.
//    Read on the band phases before this header was fixed (tmp/eq-probe1, disclosed): d_A = s_B, so s + d = 1 for
//    every state of both bands at every K. So the active charge is exactly 1/2 a beat (one hole a cycle) for every state:
//    a NUMBER charge, blind to momentum, while the energy rises (E = 0.812 at |K| = 1.6) and the passive charge falls
//    (0.447 there). No one unit makes active = passive = energy for moving holes, and at rest the charge is 1 a cycle
//    while M is 0.380 and m 0.770: they are not the same number. PREDICTION: the strong form fails, by construction of
//    the sector count.
// 3. THE 0.524. With s + d = 1 the beat-averaged charge of any hole tends to 1/2; the rest is the band-mixing beat (the
//    zitterbewegung) of a point start. E-GRV-0146 averaged 17 beats, 9 S stages against 8 D stages, from a start wholly in
//    S. PREDICTION: over 16 beats, either phase, the mean is within 0.01 of 1/2.
// 4. CHARGE IS NOT MASS ACROSS MASSES. At rest s_A = 1 whatever the angle (the slope dM/dtheta = 1 on the whole massive
//    range), so a hole's charge is 1 a cycle at every rest gap M. A heavier species would carry the same charge and fall
//    as 1 / m: the charge counts holes. The rule has one mass, so this is read on the angle family, not on a species.
// 5. THE PIECE IS TWO FIELDS, NOT ONE. The pair piece is e^(+i phi) on Q_S (x) Q_S in beat 1 and e^(-i phi) on
//    Q_D (x) Q_D in beat 2. A hole in the field of a static source whose stage counts are (sigma_S, sigma_D) takes the
//    extra angle phi sigma_S on its S unit and phi sigma_D on its D unit, so its energy moves by
//      band A: phi (s sigma_S - d sigma_D)      band B: phi (d sigma_D - s sigma_S).
//    A band-A source at rest is (1, 0), a band-B source (0, 1). So at rest a hole falls toward a source of its own band
//    with charge 1 and does not feel a source of the other band at all: the pair energy is phi (s s' - d d'), not a
//    product of one charge. The weak form fails between the hole's two bands, although they have one mass. Only a
//    band-mixed source (1/2, 1/2) pulls both bands alike (phi p / 2 each). PREDICTION, run on column packets (below):
//    the like pulls A|A and B|B are equal (the band mirror) and attractive, and each cross pull is below 0.2 of the like
//    pull (what is left comes from the packet's spread of momenta, d_A about 0.85 K^2 with <K^2> = 3 / (4 sigma^2)).
// 6. THE TONES. C*'s fear-sea hole is the love-sea hole with a tone label: every orbital piece acts as R* (x) 1 on role
//    and tone (E-FND-0160, construction point 1), so its s, d, E and m are the love-sea hole's to the bit and its ratio is
//    the same. That is algebra, stated, not run. The two bands are the species that discriminate.
// 7. THE LOCAL MASS (read). k is 0 at contact and about 1.29 far away, so a hole with another anywhere on the torus has
//    its S angle shifted by 0.2867 k, and its rest gap is M + 0.2867 k(r), about 0.75, not 0.380: E-GRV-0146's "light
//    by construction" holds for one hole alone. The fall should follow the local mass, m = 4 tan((M + phi) / 2).
//
// THE RUNS. The slab: the D4 torus of side L in the husk coordinates and side 2 in the fourth (code/measure/register-
// count oneTorus): a packet uniform down each column is kept exactly, and the husk's kernel is a function of the column.
// One hole starts as a column packet, amplitude e^(-rho^2 / (4 sigma^2)) around column (r, 0, 0), times the sector state
// S_0 at the start of beat 1 (band A at rest) or D_0 at the start of beat 2 (band B at rest, the run starting with beat
// 2). The source is static on column 0 with stage counts (sigma_S, sigma_D). The pull is the packet's mean offset along
// the axis, toward the source, against the free packet after T cycles. The members' image is the same piece reversed.
//
// GATES, fixed before the gate run.
//  G1 THE SUM RULE: on K = k u, u along (1,0,0,0), (1,1,0,0)/sqrt 2, (1,1,1,1)/2, k in 0, 0.05, 0.1, 0.2, 0.4, 0.8, 1.2,
//     1.6: every band holds 8 states (176 flats), and |s + d - 1| <= 1e-8 in both bands.
//  G2 THE PASSIVE CHARGE: s_A - d_A equals sin M (1 - g^2) / sin E within 1e-6 at every K of G1, s_A = 1 and d_A = 0
//     within 1e-8 at rest, and s_A - d_A <= 0.5 at k = 1.6 on the axis (the passive charge is not the number).
//  G3 THE WINDOW: one hole from S_0 on the origin of the L = 16 torus (E-GRV-0146's run): the sector charge averaged over
//     beats 0 .. 15 and over beats 1 .. 16 is within 0.01 of 1/2.
//  G4 CHARGE AT EVERY MASS: s_A = 1 within 1e-8 at rest for the rest gaps M = 0.1, 0.38025, 1.0, 2.0.
//  G5 THE TWO BANDS: slab side 40, r = 10, sigma 3, T = 8: the like pull A|A after T cycles is positive and B|B equals
//     it within 1e-9 relative, and the cross pulls A|B and B|A stay below 0.2 of that like pull in size at every cycle
//     1 .. T.
// INSTRUMENT (a failure makes the verdict partial at best). I1 the band energies equal E-SPN-0160's closed band
//  (diracPhase) within 1e-9 and each band is degenerate within 1e-9. I2 the curvature of E_A along the axis, from
//  k = 0.01, 0.02, 0.03 (a quadratic in k^2), is 1 / (4 tan(M / 2)) within 1e-4 relative. I3 every packet run keeps its
//  norm within 1e-10. I4 the free packet's mean offset (the torus wrap of its tails) stays below 0.01 of the like pull.
// CONTROL (a failure makes the verdict partial at best). CM THE MEMBERS: the same piece reversed (members on an empty
//  mesh, E-GRV-0146 CA) pushes the band-A packet away from a band-A source: its pull is negative.
// READ, gating nothing: the mixed source's pulls; the pulls against the local and the bare mass; the cross pull's odd and
//  even parts; the rest gap beside a far hole; the charges and energies at every K; the angle family's M.
// Verdict: fail if G1 to G5 fails; partial if all hold and the instrument or the control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them).
//  tmp/eq-probe1: the band charges at the K of G1 (s + d = 1 to 6 digits in both bands, s_A 1, 0.968534, 0.723694 at
//  k 0, 0.2, 1.6 on the axis, the energies on diracPhase to 6 digits).
//  tmp/eq-probe2 (L 20, r 6, sigma 2, T 4, and L 40, r 10, sigma 3 and 4, T 8): A|A and B|B agree to every printed digit,
//  so do A|B and B|A; at sigma 2 the cross pull is 0.33 of the like pull at T = 4; at sigma 3 the cross pull swings
//  about 0 (largest 1.8e-3) while the like pull grows to 2.17e-2 by T = 8 (sigma 4: the same shape, but the free packet's
//  wrapped tails drift 2.7e-4, so sigma 3 was kept); the reversed piece pushes. G5 was worded on the largest cross pull
//  over the cycles after this probe, since the cross pull changes sign.
//
// Depth: L1 for the charges, the sum rule and the window (algebra read off exact pieces); L2 for the band pulls (one hole
// in a static source's field, the test-particle limit of E-GRV-0146's pair piece; the kernel is the depth register's
// float stand-in). DETERMINISM: no random numbers; every start is a fixed packet. NOTHING MOVES: the pieces act inside a
// dock and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { diracPhase, structureVector } from '@/code/measure/spinor-register'
import { sectorBases } from '@/code/measure/register-sea'
import {
  bandCharges,
  columnKernel,
  newOne,
  oneBeat,
  oneTorus,
  packetRun,
  sectorCount,
  singletStart,
  type OneTorus,
} from '@/code/measure/register-count'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0, 0],
  [1 / Math.SQRT2, 1 / Math.SQRT2, 0, 0],
  [0.5, 0.5, 0.5, 0.5],
]
const MAGNITUDES: readonly number[] = [0, 0.05, 0.1, 0.2, 0.4, 0.8, 1.2, 1.6]
const FAMILY_M: readonly number[] = [0.1, 0.38025, 1.0, 2.0]
const CURVE_K: readonly number[] = [0.01, 0.02, 0.03]
const FD_STEP = 1e-5
const SUM_TOLERANCE = 1e-8
const PASSIVE_TOLERANCE = 1e-6
const REST_TOLERANCE = 1e-8
const PASSIVE_FAST = 0.5
const WINDOW_TOLERANCE = 0.01
const MIRROR = 1e-9
const CROSS_LIMIT = 0.2
const ENERGY_TOLERANCE = 1e-9
const CURVE_TOLERANCE = 1e-4
const EXACT = 1e-10
const FREE_LIMIT = 1e-2

export type EquivalencePlan = {
  windowSide: number
  windowBeats: number
  slabSide: number
  separation: number
  sigma: number
  cycles: number
}

export const GATE_PLAN: EquivalencePlan = {
  windowSide: 16,
  windowBeats: 16,
  slabSide: 40,
  separation: 10,
  sigma: 3,
  cycles: 8,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gravity/register-equivalence',
  code: 'E-GRV-0147',
  title: 'PLACEHOLDER',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return equivalenceRun(GATE_PLAN)
  },
})

type Band = 'A' | 'B'

// one hole from a column packet of the given band in the field of a static source on column 0 with stage counts
// (sigma_S, sigma_D), the pair angle scaled by `sign` (+1 holes, -1 the members' image, 0 free)
function sourceRun(input: {
  o: OneTorus
  k: Float64Array
  band: Band
  source: readonly [number, number]
  sign: number
  r: number
  sigma: number
  cycles: number
  theta: number
  unit: number
}): { x: number[]; drift: number } {
  const { o, k, source, sign, unit } = input

  return packetRun({
    ...input,
    angleS: Float64Array.from(o.column, c => sign * unit * k[c]! * source[0]),
    angleD: Float64Array.from(o.column, c => -sign * unit * k[c]! * source[1]),
    bases: sectorBases(),
  })
}

export function equivalenceRun(plan: EquivalencePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const thG = -unitAngle(ringUnit(STRING[0], STRING[1]))
  const M = Math.PI - Math.abs(th)

  // ---------------- G1, G2, I1: the charges of the two bands ----------------
  const rows = DIRECTIONS.flatMap((u, di) =>
    MAGNITUDES.map(k => {
      const K = u.map(x => x * k)
      const c = bandCharges(th, K, FD_STEP)
      const closedE = diracPhase(K, M)
      const g2 = structureG2(K)
      const closedP = (Math.sin(M) * (1 - g2)) / Math.sin(closedE)

      return { di, k, c, closedE, closedP }
    }),
  )
  const sumWorst = Math.max(
    ...rows.map(r =>
      Math.max(
        Math.abs(r.c.s[0] + r.c.d[0] - 1),
        Math.abs(r.c.s[1] + r.c.d[1] - 1),
      ),
    ),
  )
  const countsOk = rows.every(
    r => r.c.counts[0] === 8 && r.c.counts[1] === 8 && r.c.counts[2] === 176,
  )
  const G1 = countsOk && sumWorst <= SUM_TOLERANCE
  const passiveWorst = Math.max(
    ...rows.map(r => Math.abs(r.c.s[0] - r.c.d[0] - r.closedP)),
  )
  const rest = rows.find(r => r.k === 0)!
  const fastAxis = rows.find(r => r.di === 0 && r.k === 1.6)!
  const passiveFast = fastAxis.c.s[0] - fastAxis.c.d[0]
  const G2 =
    passiveWorst <= PASSIVE_TOLERANCE &&
    Math.abs(rest.c.s[0] - 1) <= REST_TOLERANCE &&
    Math.abs(rest.c.d[0]) <= REST_TOLERANCE &&
    passiveFast <= PASSIVE_FAST
  const energyWorst = Math.max(
    ...rows.map(r =>
      Math.max(
        Math.abs(r.c.E[0] - r.closedE),
        Math.abs(r.c.E[1] - r.closedE),
        r.c.spread[0],
        r.c.spread[1],
      ),
    ),
  )
  const I1 = energyWorst <= ENERGY_TOLERANCE

  // I2: the curvature of E_A at rest along the axis, E = M + a k^2 + b k^4 through three points
  const curve = CURVE_K.map(k => bandCharges(th, [k, 0, 0, 0], FD_STEP).E[0] - M)
  const a = fitQuadratic(CURVE_K.map(k => k * k), curve)
  const mFit = 1 / (2 * a)
  const mClosed = 4 * Math.tan(M / 2)
  const I2 = Math.abs(mFit / mClosed - 1) <= CURVE_TOLERANCE

  log('G1 G2 I1 I2')

  // ---------------- G4: the charge at every rest gap ----------------
  const family = FAMILY_M.map(m => {
    const c = bandCharges(-(Math.PI - m), [0, 0, 0, 0], FD_STEP)

    return { M: m, s: c.s[0], d: c.d[0], E: c.E[0] }
  })
  const G4 = family.every(f => Math.abs(f.s - 1) <= REST_TOLERANCE)

  log('G4')

  // ---------------- G3: the window of E-GRV-0146's charge ----------------
  const w = oneTorus(plan.windowSide)
  const Bs = sectorBases()
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const charges: number[] = []

  let s = singletStart(w, w.origin, 0)
  let t = newOne(w)

  for (let b = 0; b <= plan.windowBeats; b++) {
    const beat1 = b % 2 === 0
    const E = beat1 ? Bs.S : Bs.D

    charges.push(sectorCount(w, E, s).reduce((acc, v) => acc + v, 0))

    if (b < plan.windowBeats) {
      oneBeat(w, E, beat1 ? u : [u[0], -u[1]], s, t)
      ;[s, t] = [t, s]
    }
  }

  const mean = (x: number[]): number => x.reduce((acc, v) => acc + v, 0) / x.length
  const windowOdd = mean(charges)
  const windowEven0 = mean(charges.slice(0, plan.windowBeats))
  const windowEven1 = mean(charges.slice(1))
  const G3 =
    Math.abs(windowEven0 - 0.5) <= WINDOW_TOLERANCE &&
    Math.abs(windowEven1 - 0.5) <= WINDOW_TOLERANCE

  log('G3')

  // ---------------- G5, CM: the two bands in a static source's field ----------------
  const o = oneTorus(plan.slabSide, 2)
  const { column: k } = columnKernel(plan.slabSide)
  const common = {
    o,
    k,
    r: plan.separation,
    sigma: plan.sigma,
    cycles: plan.cycles,
    theta: th,
    unit: thG,
  }
  const cases: {
    name: string
    band: Band
    source: [number, number]
  }[] = [
    { name: 'A|A', band: 'A', source: [1, 0] },
    { name: 'B|B', band: 'B', source: [0, 1] },
    { name: 'A|B', band: 'A', source: [0, 1] },
    { name: 'B|A', band: 'B', source: [1, 0] },
    { name: 'A|mix', band: 'A', source: [0.5, 0.5] },
    { name: 'B|mix', band: 'B', source: [0.5, 0.5] },
  ]
  const free = {
    A: sourceRun({ ...common, band: 'A', source: [0, 0], sign: 0 }),
    B: sourceRun({ ...common, band: 'B', source: [0, 0], sign: 0 }),
  }
  const pulls = cases.map(c => {
    const plus = sourceRun({ ...common, band: c.band, source: c.source, sign: 1 })
    const minus = sourceRun({ ...common, band: c.band, source: c.source, sign: -1 })
    const f = free[c.band].x
    const p = plus.x.map((v, i) => -(v - f[i]!))
    const m = minus.x.map((v, i) => -(v - f[i]!))

    log(`${c.name}: pull ${p.map(v => v.toExponential(3)).join(' ')}`)

    return {
      ...c,
      plus: p,
      minus: m,
      drift: Math.max(plus.drift, minus.drift),
    }
  })
  const last = (name: string, which: 'plus' | 'minus' = 'plus'): number => {
    const x = pulls.find(p => p.name === name)![which]

    return x[x.length - 1]!
  }
  const like = last('A|A')
  const largest = (name: string): number =>
    Math.max(...pulls.find(p => p.name === name)!.plus.map(Math.abs))
  const crossLargest = Math.max(largest('A|B'), largest('B|A'))
  const G5 =
    like > 0 &&
    Math.abs(last('B|B') - like) <= MIRROR * Math.abs(like) &&
    crossLargest < CROSS_LIMIT * like
  const CM = last('A|A', 'minus') < 0
  const I3 =
    pulls.every(p => p.drift <= EXACT) &&
    Math.max(free.A.drift, free.B.drift) <= EXACT
  const freeWorst = Math.max(...[...free.A.x, ...free.B.x].map(Math.abs))
  const I4 = freeWorst <= FREE_LIMIT * Math.abs(like)

  // the fall against the local and the bare mass: x = F T^2 / (2 m), F = thG (-dk/dr) at r
  const r = plan.separation
  const grad = (k[r + 1]! - k[r - 1]!) / 2
  const force = thG * grad
  const Mlocal = M + thG * k[r]!
  const T = plan.cycles
  const predictLocal = (force * T * T) / (2 * 4 * Math.tan(Mlocal / 2))
  const predictBare = (force * T * T) / (2 * mClosed)
  const farGap = M + thG * k[plan.slabSide / 2]!

  log('G5')

  // ---------------- verdict ----------------
  const hard = G1 && G2 && G3 && G4 && G5
  const instrument = I1 && I2 && I3 && I4
  const status = !hard ? 'fail' : !instrument || !CM ? 'partial' : 'pass'
  const f6 = (v: number): string => v.toFixed(6)
  const e3 = (v: number): string => v.toExponential(3)
  const metrics: Record<string, number> = {
    G1: flag(G1),
    G2: flag(G2),
    G3: flag(G3),
    G4: flag(G4),
    G5: flag(G5),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    CM: flag(CM),
    restGap: M,
    gravityUnit: thG,
    sumWorst,
    passiveWorst,
    energyWorst,
    passiveFast,
    kineticMass: mFit,
    kineticMassClosed: mClosed,
    windowOdd,
    windowEven0,
    windowEven1,
    likePull: like,
    likePullB: last('B|B'),
    crossPullAB: last('A|B'),
    crossPullBA: last('B|A'),
    crossRatio: last('A|B') / like,
    crossLargest,
    crossLargestRatio: crossLargest / like,
    mixPullA: last('A|mix'),
    mixPullB: last('B|mix'),
    memberPull: last('A|A', 'minus'),
    crossMinus: last('A|B', 'minus'),
    predictLocal,
    predictBare,
    fallOverLocal: like / predictLocal,
    fallOverBare: like / predictBare,
    localGap: Mlocal,
    farGap,
    freeWorst,
    seconds: (Date.now() - started) / 1000,
  }

  rows
    .filter(r => r.di === 0)
    .forEach(r => {
      metrics[`axis_k${r.k}_sA`] = r.c.s[0]
      metrics[`axis_k${r.k}_dA`] = r.c.d[0]
      metrics[`axis_k${r.k}_E`] = r.c.E[0]
      metrics[`axis_k${r.k}_passive`] = r.c.s[0] - r.c.d[0]
    })
  family.forEach(f => {
    metrics[`family_M${f.M}_s`] = f.s
  })
  charges.forEach((q, b) => (metrics[`charge_beat${b}`] = q))

  const axisText = rows
    .filter(r => r.di === 0)
    .map(r => `k ${r.k}: E ${r.c.E[0].toFixed(5)}, s ${r.c.s[0].toFixed(5)}, d ${r.c.d[0].toFixed(5)}, passive ${(r.c.s[0] - r.c.d[0]).toFixed(5)}`)
    .join('; ')
  const pullText = pulls
    .map(p => `${p.name} ${p.plus.map(v => v.toExponential(3)).join(' ')} (reversed ${e3(p.minus[p.minus.length - 1]!)})`)
    .join('; ')

  return verdict({
    status,
    claim: `G1 ${G1} (s + d - 1 at most ${e3(sumWorst)} over ${rows.length} momenta, bands 8 + 8 + 176 flats ${countsOk}); G2 ${G2} (passive against sin M (1 - g^2) / sin E within ${e3(passiveWorst)}, rest s ${rest.c.s[0].toFixed(10)} d ${e3(rest.c.d[0])}, passive at k 1.6 ${f6(passiveFast)}); G3 ${G3} (16-beat means ${f6(windowEven0)} and ${f6(windowEven1)}, the 17-beat mean ${f6(windowOdd)}); G4 ${G4} (rest s ${family.map(f => `${f.s.toFixed(10)} at M ${f.M}`).join(', ')}); G5 ${G5} (after ${T} cycles at r ${r}: A|A ${e3(like)}, B|B ${e3(last('B|B'))}, A|B ${e3(last('A|B'))}, B|A ${e3(last('B|A'))}, largest cross over the cycles ${e3(crossLargest)}, ${(crossLargest / like).toFixed(4)} of the like pull); instrument I1 ${I1} (${e3(energyWorst)}) I2 ${I2} (m ${f6(mFit)} against 4 tan(M/2) ${f6(mClosed)}) I3 ${I3} I4 ${I4} (free ${e3(freeWorst)}); control CM ${CM} (reversed ${e3(last('A|A', 'minus'))})`,
    metrics,
    control: { CM: flag(CM), instrument: flag(instrument) },
    notes: `L1 (the charges, the sum rule, the window) and L2 (the band pulls, a hole in a static source's field on the slab of side ${plan.slabSide}, sigma ${plan.sigma}). Rest gap M ${f6(M)}, kinetic mass ${f6(mFit)}, active charge 1/2 a beat at every K. Axis: ${axisText}. Pulls by cycle: ${pullText}. The fall of A|A ${e3(like)} against ${e3(predictLocal)} with the local mass (M + 0.2867 k(r) = ${f6(Mlocal)}) and ${e3(predictBare)} with the bare mass. A hole beside another at the antipode has rest gap ${f6(farGap)}. Charges by beat ${charges.map(q => q.toFixed(4)).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

// g^2 = |s(K)|^2 / 4 (code/measure/spinor-register structureVector), as diracPhase reads it
const structureG2 = (K: readonly number[]): number =>
  structureVector(K).reduce((acc, x) => acc + x * x, 0) / 4

// y = a x + b x^2 + 0 through the points (least squares on two unknowns, intercept already removed)
function fitQuadratic(xs: readonly number[], ys: readonly number[]): number {
  let sxx = 0
  let sxy = 0
  let sx3 = 0
  let sx4 = 0
  let sx2y = 0

  xs.forEach((x, i) => {
    sxx += x * x
    sxy += x * ys[i]!
    sx3 += x ** 3
    sx4 += x ** 4
    sx2y += x * x * ys[i]!
  })

  const det = sxx * sx4 - sx3 * sx3

  return (sxy * sx4 - sx3 * sx2y) / det
}
