// IS THERE A STRING IN THE KEPT 2I VACUUM, AND WHAT DOES IT COST A LINK (E-SPN-0186, OPEN-STR-02)? E-SPN-0154 kept the
// ordered vacuum of H = H_E + 8 H_B on a husk tetrahedron under a small-angle beat, and E-SPN-0185 asks the same on a
// 4-loop patch. Neither reads the string: "every pair of the tetrahedron's docks is one link apart, so a static pair has
// one separation only", and E-SPN-0154's "Next" (3) was "put a static 2 at two docks of the kept vacuum and read the
// energy against separation on a strip, which needs a truncation or a tensor-network state". This file is that read. The
// machinery is code/measure/gauss-orbit: the register stored on its Gauss orbits, a static pair as one quaternion a
// configuration, and a TRUNCATION of every plaquette to the classes nearest the identity.
//
// DERIVED BEFORE THE RUN.
// 1. THE STRIP (prethermal-patch huskStrip(k)): k equilateral husk triangles in a row, docks 0 .. k + 1, the even docks
//    0, 2, 4, .. on one line one face diagonal apart. The tree is the zigzag path (i, i + 1), so the non-tree link
//    (i, i + 2) closes exactly triangle i and its digit IS that triangle's holonomy. On strip-5 the line holds docks 0, 2,
//    4, 6: separations 1, 2, 3, each spanned by triangles. (E-SPN-0154 named a 6-loop strip; 5 loops already hold the
//    three separations, since the line's four docks need only five triangles between them.)
// 2. THE STATIC PAIR. A fundamental 2 at dock a and its conjugate at dock b. The SU(2) subgroup 2I acts on H = C^2 by
//    left multiplication and 2 x 2 of G x G is real, so a charged state is one quaternion a configuration with psi(g c
//    g^-1) = q_g psi(c) qbar_g; a tree link's move (the gauge transformation h on its child's subtree) multiplies by
//    qbar_h on the left if a is in the subtree and by q_h on the right if b is. Then the Wilson line q_W(a -> b) has no
//    flux on any tree link and costs n_2 = d^2 - 1 = 3 on each of the R links of the line, so at r = 0 the pair costs
//    exactly 3R, the strong-coupling string. V(R) = E(pair) - E(vacuum), each the lowest state by restarted Lanczos from
//    the Wilson line (the constant state for the vacuum).
// 3. THE TRUNCATION, AND WHY IT IS NEEDED. Strip-5 has 120^5 = 2.5e10 configurations and about 4.1e8 Gauss orbits, past
//    any exact method. In the ordered vacuum the plaquettes sit near the identity (E-SPN-0154: <q0> 0.856 at r = 8), and
//    in the zigzag gauge a digit IS a plaquette, so keep each digit in B_k = {x : n_B(x) <= k}, a union of classes: B_2
//    = 13 elements (q0 >= 0.809), B_5 = 33 (q0 >= 0.5), B_7 = 45, B_10 = 75 (q0 >= 0). The operator is P H P, so every
//    energy is an upper bound on the untruncated one; V is a difference and has no bound, so the truncation is
//    CALIBRATED: against the exact answer on strip-3 (120^3, 29,288 orbits) and against the finer truncation on strip-4.
//    Strip-5 is read at B_5 (33^5 = 3.9e7 configurations).
// 4. WHAT THE STRIP CAN AND CANNOT SAY. A strip one triangle wide is a one-dimensional chain of plaquettes, where every
//    compact gauge group confines. So a linear V here does NOT say the bulk husk confines (E-SPN-0153 puts the bulk
//    tension at 1.6e-18 of its strong-coupling value at 2I's freezing point). It says whether the kept vacuum of r = 8
//    carries a string at the patch scale, and how far its tension has loosened from the strong-coupling 3.
//
// HYPOTHESES, written before any r > 0 energy of 2I was computed (the gates, fixed).
//  H1 A STRING IN THE KEPT VACUUM: on strip-5 at B_5, r = 8: 0 < V(0,2) < V(0,4) < V(0,6).
//  H2 IT IS LINEAR at the patch scale: the increments dV2 = V(0,4) - V(0,2) and dV3 = V(0,6) - V(0,4) agree to 15%:
//     |dV3/dV2 - 1| <= 0.15.
//  H3 IT HAS LOOSENED: the tension sigma(8) = (dV2 + dV3)/2 is below the strong-coupling 3.
//  P  FALSIFIER: H1 or H2 fails (no string, or not linear, at the kept coupling).
// CALIBRATION (a failure makes the verdict partial: the truncated read is not trusted).
//  K1 on strip-3, B_5's V(0,2) and V(0,4) lie within 5% of the untruncated ones.
//  K2 on strip-4, B_5's V(0,2) and V(0,4) lie within 5% of B_10's.
// CONTROLS (a failure makes the verdict partial; each could fail).
//  C1 STRONG COUPLING: at r = 0 on the untruncated strip-3 the vacuum is 0 and V(0,2), V(0,4) are 3 and 6, to 1e-9.
//  C2 THE CONVENTION IS WHAT MAKES 3R: with the charge factors reversed (q_h on the left, qbar_h on the right) or
//     dropped, the same r = 0 runs miss 3R by at least 1 for some pair.
//  C3 A PAIR AT ONE DOCK IS NO PAIR: a = b = 2 at r = 8 on the untruncated strip-3 has the vacuum's energy, to 1e-8
//     (2 x 2bar holds the singlet).
// INSTRUMENT (a failure makes the verdict partial).
//  I1 THE UNFIXED REGISTER: for Q8 on strip-3 at r = 8 (every link free, 8^7 configurations, the Gauss law projected at
//     every dock with the charges at a and b), the vacuum's and the pairs (0,2) and (0,4)'s lowest energies equal the
//     orbit register's to 1e-8.
//  I2 EXACT TABLES: orbits equal Burnside on every register; n_B is constant on every orbit (every configuration of
//     strip-3's registers, every 997th elsewhere); the 2I quaternions multiply as the table does (1e-12).
//  I3 Lanczos residuals <= 1e-6 on every energy, and the final charged states covariant (projection change <= 1e-10).
//  I4 THE START DOES NOT CHOOSE THE STATE: on the untruncated strip-3 at r = 8, the lowest vacuum, (0,2) and (0,4)
//     energies from a start that breaks every symmetry (the Weyl stream, made covariant) equal those from the Wilson line
//     to 1e-8.
// READ (gating nothing): the middle pair V(2,4) against the end pair V(0,2) on strips 3, 4, 5 (the end effect); V(0,2) and
// V(0,4) at r = 0, 1, 2, 4, 8 on the untruncated strip-3 (how the tension loosens with r); every truncation's numbers.
// VERDICT, fixed before the run: PARTIAL if a control, the instrument or the calibration fails; else FAIL if H1 or H2
// fails; else PASS if H3 holds, PARTIAL if it does not.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/st-probe4.log: the 2I quaternion table (1.7e-16), strip-3's register (29,288
// orbits = Burnside), and at r = 0 only: vacuum 0, pairs 3 and 6 with the Wilson convention, 6 and 54 reversed, 9 and 18
// dropped; Q8 on strip-3 at r = 8 (orbit register: vacuum 41.158, pairs 41.339 and 41.519) against the unfixed
// register. tmp/st-probe5.log: the truncated registers' sizes and the cost of one charged application (no energy read).
// No 2I energy at r > 0 was computed before the gates above were written.
//
// Depth L2 (the static potential of a finite-group lattice gauge theory on a husk strip, Hamiltonian, truncated and
// calibrated; the register is hand-built, not the rule). DETERMINISM: no random numbers; the Lanczos starts are the
// constant state, the Wilson line and the Weyl stream; results are the same bit for bit at any thread count. NOTHING
// MOVES: a link holds a value, a plaquette reads the product around it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  binaryIcosahedral,
  conjugacyClasses,
  qmul,
  quaternionEight,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'
import { icosianCharacters } from '@/code/measure/gauge-window'
import {
  cayleyKernel,
  electricKernel,
  huskStrip,
  magneticExponents,
} from '@/code/measure/prethermal-patch'
import {
  chargeFlags,
  chargedLowest,
  freeCharged,
  orbitEngine,
  orbitMagnetic,
  orbitRegister,
  projectCovariant,
  vacuumLowest,
  wilsonLine,
  type OrbitEngine,
  type OrbitRegister,
} from '@/code/measure/gauss-orbit'
import { lowestPair } from '@/code/algebra/linear/eig-lanczos-restart'
import { makeWeyl } from '@/code/tool/weyl'

const R = 8
const READ_COUPLINGS = [0, 1, 2, 4, 8]
const STRONG = 3
const LINEAR = 0.15
const CALIBRATE = 0.05
const EXACT = 1e-9
const SAME = 1e-8
const MISS = 1
const RESIDUAL = 1e-6
const COVARIANT = 1e-10
const QUATERNION = 1e-12
const SAMPLE = 997
const STEPS = 30
const CYCLES = 40
const TOL = 1e-9
const FREE_STEPS = 20
const FREE_TOL = 1e-8
const THREADS = Math.max(1, Number(process.env.THREADS ?? 4))

export type StringPlan = {
  threads: number
  // the truncations (n_B cut) read on each strip; null is the whole group
  strip3: (number | null)[]
  strip4: number[]
  strip5: number[]
}

export const GATE_PLAN: StringPlan = {
  threads: THREADS,
  strip3: [null, 5, 7, 10],
  strip4: [5, 7, 10],
  strip5: [5],
}

export default experiment({
  id: 'spin/icosian-strip-string',
  code: 'E-SPN-0186',
  title:
    'the static 2I pair on a husk strip of 3 to 5 triangles at the kept coupling, truncated near the identity and calibrated: pending the gate run',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return stringRun(GATE_PLAN)
  },
})

type Strip = {
  name: string
  reg: OrbitRegister
  engine: OrbitEngine
  energy: Float64Array
  mismatches: number
  checked: number
}

function stripOf(
  g: GaugeGroup,
  k: number,
  alphabet: number[] | null,
  e: Float64Array,
  nB: Int32Array,
  threads: number,
): Strip {
  const reg = orbitRegister(g, huskStrip(k), conjugacyClasses(g), alphabet, true)
  const mag = orbitMagnetic(reg, nB, reg.size <= 2e6 ? 1 : SAMPLE)
  const engine = orbitEngine(reg, { threads, slots: 2, width: 4, kernels: 1 })

  engine.kernels[0]!.set(e)

  return {
    name: `strip-${k} ${alphabet ? `B${reg.base}` : 'whole'}`,
    reg,
    engine,
    energy: mag.energy,
    mismatches: mag.mismatches,
    checked: mag.checked,
  }
}

const OPTS = { steps: STEPS, tolerance: TOL, cycles: CYCLES }

function setCoupling(s: Strip, r: number): void {
  for (let o = 0; o < s.reg.orbits; o++) {
    s.engine.diag[o] = r * s.energy[o]!
  }
}

type Level = { value: number; residual: number; drift: number; applications: number }

function vacuum(s: Strip, start?: Float64Array): Level {
  const res = vacuumLowest(
    s.engine,
    0,
    start ?? new Float64Array(s.reg.orbits).fill(1),
    OPTS,
  )

  return { value: res.value, residual: res.residual, drift: 0, applications: res.applications }
}

const linePath = (a: number, b: number): number[] => {
  const out: number[] = []

  for (let d = a; d <= b; d += 2) {
    out.push(d)
  }

  return out
}

function pair(
  s: Strip,
  a: number,
  b: number,
  sign: 1 | 0 | -1 = 1,
  start?: Float64Array,
): Level {
  s.engine.flags.set(chargeFlags(s.reg.patch, a, b, sign))

  const res = chargedLowest(s.engine, 0, start ?? wilsonLine(s.reg, linePath(a, b)), OPTS)

  return { value: res.value, residual: res.residual, drift: res.drift, applications: res.applications }
}

const f6 = (x: number): string => x.toFixed(6)

export function stringRun(plan: StringPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const g = binaryIcosahedral()
  const chars = icosianCharacters(g)
  const eH = electricKernel(g, chars, chars.dims.map(d => d * d - 1))
  const nB = magneticExponents(g)

  if (!nB) {
    throw new Error('E-SPN-0186: 2I magnetic exponents not integral')
  }

  const cut = (k: number | null): number[] | null =>
    k === null ? null : [...Array(g.order).keys()].filter(x => nB[x]! <= k)
  const levels: Level[] = []

  const keep = (l: Level): Level => {
    levels.push(l)

    return l
  }

  // ---------------- I2: the quaternion table ----------------
  let qerr = 0

  for (let x = 0; x < g.order; x++) {
    for (let y = 0; y < g.order; y++) {
      const p = qmul(g.quat![x]!, g.quat![y]!)
      const z = g.table[x * g.order + y]!

      for (let k = 0; k < 4; k++) {
        qerr = Math.max(qerr, Math.abs(p[k]! - g.quat![z]![k]!))
      }
    }
  }

  // ---------------- strip-3: controls, I4, the couplings, K1 ----------------
  const s3 = plan.strip3.map(k => stripOf(g, 3, cut(k), eH, nB, plan.threads))
  const whole = s3[plan.strip3.indexOf(null)]!

  for (const s of s3) {
    log(`${s.name}: configurations ${s.reg.size}, orbits ${s.reg.orbits} (Burnside ${s.reg.burnside}), stabilized ${s.reg.stabilized.length}, n_B mismatches ${s.mismatches} of ${s.checked}`)
  }

  setCoupling(whole, 0)

  const v0 = keep(vacuum(whole))
  const strong = [
    [0, 2],
    [0, 4],
  ].map(([a, b]) => ({
    a: a!,
    b: b!,
    R: (b! - a!) / 2,
    right: keep(pair(whole, a!, b!, 1)).value,
    reversed: keep(pair(whole, a!, b!, -1)).value,
    dropped: keep(pair(whole, a!, b!, 0)).value,
  }))
  const C1 =
    Math.abs(v0.value) <= EXACT &&
    strong.every(s => Math.abs(s.right - v0.value - STRONG * s.R) <= EXACT)
  const C2 =
    strong.some(s => Math.abs(s.reversed - v0.value - STRONG * s.R) >= MISS) &&
    strong.some(s => Math.abs(s.dropped - v0.value - STRONG * s.R) >= MISS)

  log(`C1 ${C1}, C2 ${C2}: r 0 vacuum ${v0.value.toExponential(2)}; ${strong.map(s => `(${s.a}, ${s.b}): Wilson ${f6(s.right)}, reversed ${f6(s.reversed)}, dropped ${f6(s.dropped)}`).join('; ')}`)

  // the couplings, READ (r = 8 is the gate coupling)
  const byCoupling = READ_COUPLINGS.map(r => {
    setCoupling(whole, r)

    const vac = keep(vacuum(whole))
    const v1 = keep(pair(whole, 0, 2)).value - vac.value
    const v2 = keep(pair(whole, 0, 4)).value - vac.value
    const mid = keep(pair(whole, 2, 4)).value - vac.value

    return { r, vac: vac.value, v1, v2, mid }
  })

  for (const c of byCoupling) {
    log(`READ strip-3 whole r ${c.r}: vacuum ${f6(c.vac)}, V(0,2) ${f6(c.v1)}, V(0,4) ${f6(c.v2)}, V(2,4) ${f6(c.mid)}, dV ${f6(c.v2 - c.v1)}`)
  }

  setCoupling(whole, R)

  const at8 = byCoupling.find(c => c.r === R)!
  const C3 = Math.abs(keep(pair(whole, 2, 2)).value - at8.vac) <= SAME

  log(`C3 ${C3}: a pair at one dock against the vacuum ${f6(at8.vac)}: ${f6(levels[levels.length - 1]!.value)}`)

  // I4: symmetry-breaking starts
  const weyl = makeWeyl({ start: 0 })
  const weylVac = keep(vacuum(whole, Float64Array.from({ length: whole.reg.orbits }, () => weyl.next() - 0.5)))
  const weylPairs = [
    [0, 2],
    [0, 4],
  ].map(([a, b]) => {
    const start = Float64Array.from({ length: whole.reg.orbits * 4 }, () => weyl.next() - 0.5)

    projectCovariant(whole.reg, start)

    return keep(pair(whole, a!, b!, 1, start)).value - at8.vac
  })
  const I4 =
    Math.abs(weylVac.value - at8.vac) <= SAME &&
    Math.abs(weylPairs[0]! - at8.v1) <= SAME &&
    Math.abs(weylPairs[1]! - at8.v2) <= SAME

  log(`I4 ${I4}: Weyl starts: vacuum ${f6(weylVac.value)} (Wilson ${f6(at8.vac)}), V(0,2) ${f6(weylPairs[0]!)}, V(0,4) ${f6(weylPairs[1]!)}`)

  // the truncations of strip-3, K1
  const series = (s: Strip): { vac: number; v1: number; v2: number; mid: number; v3?: number } => {
    setCoupling(s, R)

    const vac = keep(vacuum(s)).value
    const v1 = keep(pair(s, 0, 2)).value - vac
    const v2 = keep(pair(s, 0, 4)).value - vac
    const mid = keep(pair(s, 2, 4)).value - vac
    const v3 = s.reg.patch.docks.length > 6 ? keep(pair(s, 0, 6)).value - vac : undefined

    log(`${s.name} r ${R}: vacuum ${f6(vac)}, V(0,2) ${f6(v1)}, V(2,4) ${f6(mid)}, V(0,4) ${f6(v2)}${v3 === undefined ? '' : `, V(0,6) ${f6(v3)}`}`)

    return { vac, v1, v2, mid, v3 }
  }

  const s3Series = s3.map(s => (s === whole ? { vac: at8.vac, v1: at8.v1, v2: at8.v2, mid: at8.mid } : series(s)))
  const b5of3 = s3Series[plan.strip3.indexOf(5)]!
  const K1 =
    Math.abs(b5of3.v1 - at8.v1) <= CALIBRATE * at8.v1 &&
    Math.abs(b5of3.v2 - at8.v2) <= CALIBRATE * at8.v2

  log(`K1 ${K1}: strip-3 B5 against whole: V(0,2) ${f6(b5of3.v1)} / ${f6(at8.v1)}, V(0,4) ${f6(b5of3.v2)} / ${f6(at8.v2)}`)

  for (const s of s3) {
    s.engine.close()
  }

  // ---------------- strip-4: K2 ----------------
  const s4Series = plan.strip4.map(k => {
    const s = stripOf(g, 4, cut(k), eH, nB, plan.threads)

    log(`${s.name}: configurations ${s.reg.size}, orbits ${s.reg.orbits} (Burnside ${s.reg.burnside}), n_B mismatches ${s.mismatches} of ${s.checked}`)

    const out = { k, burnside: s.reg.orbits === s.reg.burnside && s.mismatches === 0, ...series(s) }

    s.engine.close()

    return out
  })
  const b5of4 = s4Series.find(s => s.k === 5)!
  const b10of4 = s4Series.find(s => s.k === 10)!
  const K2 =
    Math.abs(b5of4.v1 - b10of4.v1) <= CALIBRATE * b10of4.v1 &&
    Math.abs(b5of4.v2 - b10of4.v2) <= CALIBRATE * b10of4.v2

  log(`K2 ${K2}: strip-4 B5 against B10: V(0,2) ${f6(b5of4.v1)} / ${f6(b10of4.v1)}, V(0,4) ${f6(b5of4.v2)} / ${f6(b10of4.v2)}`)

  // ---------------- strip-5: the read ----------------
  const s5Series = plan.strip5.map(k => {
    const s = stripOf(g, 5, cut(k), eH, nB, plan.threads)

    log(`${s.name}: configurations ${s.reg.size}, orbits ${s.reg.orbits} (Burnside ${s.reg.burnside}), n_B mismatches ${s.mismatches} of ${s.checked}`)

    const out = { k, burnside: s.reg.orbits === s.reg.burnside && s.mismatches === 0, ...series(s) }

    s.engine.close()

    return out
  })
  const main = s5Series.find(s => s.k === 5)!
  const v3 = main.v3!
  const dV2 = main.v2 - main.v1
  const dV3 = v3 - main.v2
  const H1 = main.v1 > 0 && main.v2 > main.v1 && v3 > main.v2
  const H2 = H1 && Math.abs(dV3 / dV2 - 1) <= LINEAR
  const sigma = (dV2 + dV3) / 2
  const H3 = sigma < STRONG

  log(`H1 ${H1}, H2 ${H2}, H3 ${H3}: strip-5 B5 V(0,2) ${f6(main.v1)}, V(0,4) ${f6(main.v2)}, V(0,6) ${f6(v3)}; dV2 ${f6(dV2)}, dV3 ${f6(dV3)} (ratio ${(dV3 / dV2).toFixed(4)}), sigma ${f6(sigma)} = ${(sigma / STRONG).toFixed(4)} of strong coupling; READ V(2,4) ${f6(main.mid)}`)

  // ---------------- I1: Q8, the unfixed register ----------------
  const q8 = quaternionEight()
  const q8e = cayleyKernel(q8)
  const q8B = magneticExponents(q8)!
  const q8s = stripOf(q8, 3, null, q8e, q8B, plan.threads)

  setCoupling(q8s, R)

  const q8Orbit = [keep(vacuum(q8s)).value, keep(pair(q8s, 0, 2)).value, keep(pair(q8s, 0, 4)).value]

  q8s.engine.close()

  const q8Free = (
    [
      [-1, -1, [0]],
      [0, 2, [0, 2]],
      [0, 4, [0, 2, 4]],
    ] as const
  ).map(([a, b, path]) => {
    const f = freeCharged(q8, huskStrip(3), q8e, q8B, R, a, b)
    const start = f.line(path)
    const res = lowestPair({
      size: f.size,
      apply: f.apply,
      inner: f.inner,
      project: f.project,
      start,
      steps: FREE_STEPS,
      tolerance: FREE_TOL,
      cycles: CYCLES,
    })

    return res
  })
  const I1 = q8Free.every((res, i) => Math.abs(res.value - q8Orbit[i]!) <= SAME && res.residual <= RESIDUAL)

  log(`I1 ${I1}: Q8 strip-3 orbit ${q8Orbit.map(f6).join(', ')} against unfixed ${q8Free.map(r => f6(r.value)).join(', ')} (residuals ${q8Free.map(r => r.residual.toExponential(1)).join(', ')})`)

  const I2 =
    qerr <= QUATERNION &&
    s3.every(s => s.reg.orbits === s.reg.burnside && s.mismatches === 0) &&
    s4Series.every(s => s.burnside) &&
    s5Series.every(s => s.burnside)
  const I3 = levels.every(l => l.residual <= RESIDUAL && l.drift <= COVARIANT)

  log(`I2 ${I2} (quaternion table ${qerr.toExponential(2)}), I3 ${I3} (largest residual ${Math.max(...levels.map(l => l.residual)).toExponential(2)}, largest drift ${Math.max(...levels.map(l => l.drift)).toExponential(2)}, ${levels.length} levels)`)

  const controls = C1 && C2 && C3
  const instrument = I1 && I2 && I3 && I4
  const calibration = K1 && K2
  const status =
    !controls || !instrument || !calibration
      ? 'partial'
      : !H1 || !H2
        ? 'fail'
        : H3
          ? 'pass'
          : 'partial'

  return verdict({
    status,
    claim: `H1 ${H1}, H2 ${H2}, H3 ${H3}: strip-5 B5 at r ${R}: V(0,2) ${f6(main.v1)}, V(0,4) ${f6(main.v2)}, V(0,6) ${f6(v3)}, increments ${f6(dV2)} and ${f6(dV3)}, sigma ${f6(sigma)} (strong coupling 3); calibration K1 ${K1}, K2 ${K2}; controls ${controls}; instrument ${instrument}`,
    metrics: {
      H1: H1 ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      V1: main.v1,
      V2: main.v2,
      V3: v3,
      sigma,
      ratio: dV3 / dV2,
      middle: main.mid,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      I4: I4 ? 1 : 0,
      K1: K1 ? 1 : 0,
      K2: K2 ? 1 : 0,
    },
    notes: `L2. strip-3 whole by r: ${byCoupling.map(c => `r ${c.r}: V1 ${f6(c.v1)} V2 ${f6(c.v2)} mid ${f6(c.mid)}`).join(' | ')}. strip-3 truncations: ${s3Series.map((s, i) => `${plan.strip3[i] ?? 'whole'}: V1 ${f6(s.v1)} V2 ${f6(s.v2)}`).join(', ')}. strip-4: ${s4Series.map(s => `B${s.k}: V1 ${f6(s.v1)} V2 ${f6(s.v2)} mid ${f6(s.mid)}`).join(', ')}. strip-5: ${s5Series.map(s => `B${s.k}: V1 ${f6(s.v1)} V2 ${f6(s.v2)} V3 ${f6(s.v3!)} mid ${f6(s.mid)}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s on ${plan.threads} threads.`,
  })
}
