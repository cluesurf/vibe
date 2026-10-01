// LAUE'S THEOREM FOR THE LIGHT REGISTER PAIR (E-RLT-0111, OPEN-MOT-01, route "Laue's theorem for R" in ledger B). The
// tracked scan (spin/register-coulomb-track, run in this worktree) reads the inertia over rest energy R of one bound
// level of the light register pair: R 2.719 at a_B 6 and 1.528 at a_B 8, against tan m / m 1.0656. Von Laue (1911): a
// closed body at rest has inertia equal to its energy (R = 1) exactly when the space integral of its stress vanishes,
// and in a Lorentz-covariant theory the boosted momentum is P = v (E + integral T^xx), so R - 1 = integral T^xx / E. The
// classical electron's 4/3 is this: the field alone carries a stress. This file asks whether the pair's excess inertia
// is that stress. It computes on the scan's own pair states (no new scan): the tracked levels, rebuilt by one filter.
//
// DERIVED BEFORE ANY RUN.
// 1. THE STRESS, FROM THE RULE'S OWN QUANTITIES. The pair is two members at relative coordinate y held by the count's
//    pair phase, V(y) = -theta n(y) a cycle, n = floor(alpha G(y) / theta) (register-coulomb; probe 2 reads G(y) =
//    0.013263 / |y| to 1e-4 from |y| 3 outward, so V is a staircase of -alpha_eff / |y|, alpha_eff = 1 / (mu a_B)). The
//    integrated stress tensor of such a pair at rest is the virial tensor W^ij = sum_a <p_a^i v_a^j> - <y^i d_j V(y)>
//    (each member's momentum flux, and the binding's: the force on member 1 is -grad V). Its isotropic part, one third
//    of the trace, splits into
//      SIGMA_KIN  = (1/3) sum_a <p_a . v_a>   the members' momentum flux (a pressure, positive)
//      SIGMA_BIND = -(1/3) <y . grad V>      the binding's (a tension, negative for a pull)
//    and SIGMA = SIGMA_KIN + SIGMA_BIND. SIGMA_BIND is read on the level's coordinate density (the per-representative
//    weight times the orbit, register-reduced repWeights), with the count's own symmetric difference along the three
//    husk axes, d_i V(y) = (V(y + e_i) - V(y - e_i)) / 2 (every husk triple is a ball point, probe 2); the smooth form
//    -alpha G(y) is read beside it.
// 2. LAUE'S OWN STRESS IS ZERO HERE, EXACTLY. A tracked level is an eigenvector of the closed cycle, so every expectation
//    value is the same after every cycle; in particular the second moment <|y|^2>, whose second time derivative is the
//    trace of W (Lagrange and Jacobi: (1/2) d^2/dt^2 sum m x^2 = 2T + <y . F>). So SIGMA = 0 for every stationary level,
//    and SIGMA_KIN = -SIGMA_BIND. On the cycle this is read as the one-cycle change of <|y|^2> on the rebuilt level, which
//    is 0 for a pure level and measures what the filter left in.
// 3. THE HYPOTHESES (predicted before any run, never moved).
//    H1 (Laue, as the route states): R - 1 = SIGMA / E within 0.05 at the clear points a_B 6 and 8 (the tracked line
//       holds at least twice the next line's overlap there; a_B 10 does not, 0.304 against 0.290, and a_B 12 has no
//       motion read yet). With SIGMA = 0 this says R = 1 within 0.05.
//    H1b (the uncompensated binding stress, the 4/3 problem's reading: the excess is the binding's stress alone, as if the
//       members' pressure were not carried with the boost): R - 1 = -SIGMA_BIND / E within 0.05.
//    H1c (H1b on top of the member's own lattice excess): R - tan m / m = -SIGMA_BIND / E within 0.05.
//    PREDICTED SIGN AND SIZE. For a 1/|y| pull y . grad V = -V, so SIGMA_BIND = (1/3) <V>, negative, and the virial gives
//    <V> about -2 E_b. With the tracked cycle bindings E_b = 2M - E of 0.0675 (a_B 6), 0.0332 (8) and 0.0125 (12) and E
//    about 1.64 to 1.70, -SIGMA_BIND / E is about +0.027, +0.013 and +0.005: the right SIGN for an excess, and 60 and 40
//    times too SMALL. Every stress the pair holds is bounded by its binding scale E_b / E, 0.041, 0.020 and 0.0074, while
//    R - 1 is 1.72 and 0.53. PREDICTION: H1, H1b and H1c all fail at both clear points (P holds).
//    THE CROSSING. Laue's own reading (SIGMA = 0) puts R = 1 at every a_B, so it predicts no crossing: R should already
//    be 1. H1b's puts R - 1 at -SIGMA_BIND / E, falling as 1 / a_B^2, under 0.01 from about a_B 10 (read on the
//    reference at a_B 6 to 16 below and fitted).
// 4. THE LEVELS. Each tracked level is rebuilt from the scan's own reference (reducedHydrogenStart, Gram-normalized) by
//    one Blackman-Harris filter of S = 8192 cycles centred on the recorded tracked phase (the scan's E to 16 digits). The
//    filter's share of the tracked line, from the scan's recorded lines (overlap times transfer, probe 3), is 1.000
//    (a_B 6), 0.976 (8) and 0.966 (12). a_B 12 is read for its prediction only: its R is not yet measured.
// 5. R. The scan's tracked R_static (the pull-only engine's inertia over energy, c*^2 / (2 a E)) from its finished parts
//    (tmp/mw-part-motion-a6.json and -a8.json, copied by the scan agent): 2.7194742442590423 and 1.528335665339038, and its
//    R_full (with the Darwin exchange) 2.610854368064847 and 1.4757983092114777. Both are tested; R_static is the one the
//    stress of the pull-only engine should explain.
//
// GATES (fixed in this header before the gate run).
//   H1, H1b, H1c as above, hard: the experiment PASSES only if H1 holds at a_B 6 and 8 (with R_static). P, the falsifier:
//   H1 fails at both clear points. H1b and H1c are read as further hypotheses (each reported true or false), not gates.
//   I1 the filter's share of the tracked line (from the recorded lines) at least 0.95 at every point
//   I2 the rebuilt level's mean phase (reducedRead) within 1e-3 of the tracked line, and its residual under 1e-3
//   I3 stationarity: the one-cycle change of <|y|^2> under 1e-3 of <|y|^2> (SIGMA's own read)
//   C1 the control that could fail: on the reference at every a_B, the staircase's SIGMA_BIND within 5% of (1/3) <V>
//      (the 1/|y| identity; it fails if the difference stencil or the count's shape is not what point 1 says)
// Verdict: fail if H1 fails at either clear point; partial if it holds and an instrument or the control fails; pass
// otherwise.
//
// PROBES BEFORE THE GATE RUN (no stress and no R read against a hypothesis): tmp/lx-probe1 (the member's rest gap M0
// 0.854058, curvature 0.27471, tan m / m 1.065572), tmp/lx-probe2 (G(y) |y| = 0.013263 from |y| 3 outward, n 181 at
// contact at a_B 8, every integer triple in the ball a point), tmp/lx-probe3 (the filter shares of point 4).
//
// DETERMINISM: no random numbers; the native kernel (byte for byte the JavaScript path, task/kernel/check.ts).
//
// FIRST RUN (tmp/lx-laue-gate.log: a_B 6 and 8 on this machine, 1,015 s and 1,843 s; a_B 12 moved to a 32-core droplet
// when the machine was needed, 10,630 s, the same file and the same gate script, which reuses saved levels): FAIL, as
// predicted. No gate moved and none was rerun.
//  - H1 fails at both clear points. R_static - 1 is 1.7195 (a_B 6) and 0.5283 (a_B 8), R_full - 1 1.6109 and 0.4758,
//    against Laue's SIGMA / E = 0. The stress Laue would need, (R - 1) E, is 2.821 and 0.885, 41.8 and 26.7 times the
//    binding E_b (0.06746 and 0.03315). P holds.
//  - H1b and H1c fail. -SIGMA_BIND / E is 0.0298 (a_B 6), 0.0145 (8) and 0.0060 (12): the predicted sign and size
//    (0.027, 0.013, 0.005), 58 and 36 times smaller than R - 1. The staircase and the smooth form agree to 1% on the
//    levels (-4.895e-2 against -4.844e-2 at a_B 6), and <V> / E_b is -1.98, -2.06 and -2.21, the virial's -2.
//  - Instrument holds: filter shares 1.000, 0.976, 0.966; phases within 2.1e-5 of the scan's lines, residuals at most
//    1.5e-4; <|y|^2> moves by at most 1.2e-5 over a cycle, so SIGMA's own read is 0 to that.
//  - Control C1 FAILS (not hard): on the hydrogenic references the staircase's SIGMA_BIND is 1.030 (a_B 6) to 1.634
//    (a_B 16) of (1/3) <V>, not within 5%. The cause, read after the run and not tested: the floor in n(y) lowers |V|
//    by up to theta where alpha G is near theta, which is the reference's far tail at large a_B, while the difference
//    stencil is blind to that offset only where the steps are dense. So the 1/|y| identity is not a property of the
//    staircase count on a wide reference. On the tracked levels the two forms agree, so the H1b numbers stand.
//  - The crossing. Laue's reading puts R = 1 at every a_B, so it predicts none. H1b's falls as 0.43 / a_B^2 per 2M,
//    under 0.01 already from a_B 6.6, and predicts R(a_B 12) - 1 = 0.006 for the tracked scan.
// So the pair's excess inertia is not stress. Its stationary level holds Laue's condition exactly and still has R - 1 of
// 0.5 to 1.7. What fails is Laue's other premise, that the pair's energy and momentum move together as a tensor under a
// boost, which on the lattice is the dispersion and the instantaneous pull, not a stress.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  canonicalGreen,
  cloneState,
  filterTransfer,
  normalizeState,
  reducedCounts,
  reducedCycle,
  reducedEngine,
  reducedFilter,
  reducedHydrogenStart,
  reducedRead,
  repWeights,
  sector,
  type RState,
  type Sector,
} from '@/code/measure/register-reduced'
import { setup, type Setup } from '@/test/experiment/spin/register-coulomb-weak'
import { alphaOf, radiusOf } from '@/test/experiment/spin/register-coulomb-track'
import type { KernelOptions } from '@/code/kernel/index'

const TOLERANCE = 0.05
const SHARE = 0.95
const PHASE = 1e-3
const RESIDUAL = 1e-3
const STATIONARY = 1e-3
const IDENTITY = 0.05
const FILTER = 8192

// the default logger: the experiment suite prints only the verdict
const quiet = (what: string): void => void what

type Recorded = {
  name: string
  aB: number
  // the scan's tracked line and the recorded lines within 0.01 of it (phase, overlap with the reference)
  E: number
  lines: [number, number][]
  Rstatic: number | null
  Rfull: number | null
}

// the tracked scan's finished parts (tmp/mw-part-zero-a*.json and tmp/mw-part-motion-a*.json)
export const RECORDED: Recorded[] = [
  {
    name: 'a6',
    aB: 6,
    E: 1.6406597988563882,
    lines: [
      [1.6406597988563882, 0.2676752332958895],
      [1.6430606402003138, 0.045845633576436555],
      [1.6487592221225384, 0.004223559378950268],
      [1.6508993539161205, 0.12474883829768324],
    ],
    Rstatic: 2.7194742442590423,
    Rfull: 2.610854368064847,
  },
  {
    name: 'a8',
    aB: 8,
    E: 1.6749643732189499,
    lines: [
      [1.6684004549406555, 0.03194126723001011],
      [1.6699672983819813, 0.001060689089094459],
      [1.6740684973185458, 0.034710819474314515],
      [1.6749643732189499, 0.4922508876324112],
      [1.677937606845964, 0.0036619616084497884],
      [1.6800758925365136, 0.013969624527389386],
      [1.6811880153066747, 0.021180402101302395],
      [1.68459607713617, 0.006552027632844732],
    ],
    Rstatic: 1.528335665339038,
    Rfull: 1.4757983092114777,
  },
  {
    name: 'a12',
    aB: 12,
    E: 1.6956141144709893,
    lines: [
      [1.6868560262966215, 0.003268679723474355],
      [1.6916439267884542, 0.002458656433475897],
      [1.6939924782500912, 0.003212789531247318],
      [1.694509339559751, 0.014654172219860635],
      [1.6951282287155844, 0.013215251597806517],
      [1.6951905289360014, 0.0040902250055412665],
      [1.6956141144709893, 0.5971837097525717],
      [1.6967152509737844, 0.026667480902829735],
      [1.6975522015981994, 0.001345528853610087],
      [1.6985016899833505, 0.001577588030365713],
      [1.699250959748645, 0.008478610987480255],
      [1.7001685328553136, 0.0018750966419869464],
      [1.7008328576925589, 0.0010759640105408353],
      [1.704398718581413, 0.0015257627193002838],
    ],
    Rstatic: null,
    Rfull: null,
  },
]

export const REFERENCE_AB: readonly number[] = [6, 7, 8, 9, 10, 11, 12, 14, 16]

// ---- the binding stress of a coordinate density ----

export type Stress = {
  // -(1/3) <y . grad V>, the staircase count's and the smooth form's, and (1/3) <V> for each
  bind: number
  bindSmooth: number
  thirdV: number
  thirdVSmooth: number
  meanR2: number
}

// V(y) = -theta n(y) a cycle (the count's own pair phase), and its smooth form -alpha G(y)
export function bindingStress(
  su: Setup,
  s: Sector,
  alpha: number,
  w: Float64Array,
): Stress {
  const g = (a: number, b: number, c: number): number =>
    canonicalGreen(su.table, a, b, c)
  const V = (a: number, b: number, c: number): number =>
    -su.theta * Math.floor((alpha * g(a, b, c)) / su.theta)
  const Vs = (a: number, b: number, c: number): number => -alpha * g(a, b, c)

  let t = 0
  let bind = 0
  let bindSmooth = 0
  let v = 0
  let vs = 0
  let r2 = 0

  for (let i = 0; i < s.count; i++) {
    const x = w[i]! * s.orbit[i]!
    const a = s.reps[3 * i]!
    const b = s.reps[3 * i + 1]!
    const c = s.reps[3 * i + 2]!
    // y . grad V by the symmetric difference along each axis
    const dot = (f: (a: number, b: number, c: number) => number): number =>
      (a * (f(a + 1, b, c) - f(a - 1, b, c)) +
        b * (f(a, b + 1, c) - f(a, b - 1, c)) +
        c * (f(a, b, c + 1) - f(a, b, c - 1))) /
      2

    t += x
    bind += x * dot(V)
    bindSmooth += x * dot(Vs)
    v += x * V(a, b, c)
    vs += x * Vs(a, b, c)
    r2 += x * (a * a + b * b + c * c)
  }

  return {
    bind: -bind / (3 * t),
    bindSmooth: -bindSmooth / (3 * t),
    thirdV: v / (3 * t),
    thirdVSmooth: vs / (3 * t),
    meanR2: r2 / t,
  }
}

const meanR2 = (s: Sector, w: Float64Array): number => {
  let t = 0
  let r2 = 0

  for (let i = 0; i < s.count; i++) {
    const x = w[i]! * s.orbit[i]!
    const a = s.reps[3 * i]!
    const b = s.reps[3 * i + 1]!
    const c = s.reps[3 * i + 2]!

    t += x
    r2 += x * (a * a + b * b + c * c)
  }

  return r2 / t
}

// the filter's share of the tracked line, from the recorded lines
export const filterShare = (p: Recorded, S: number): number => {
  let all = 0
  let mine = 0

  for (const [E, o] of p.lines) {
    const x = o * filterTransfer(E, p.E, S)

    all += x

    if (E === p.E) {
      mine += x
    }
  }

  return mine / all
}

// ---- the reads ----

export type ReferenceRead = { aB: number; R: number; stress: Stress }

export function referenceRead(su: Setup, aB: number): ReferenceRead {
  const R = radiusOf(aB)
  const s = sector(su.group, [...su.group.elements.keys()], R)
  const r = reducedHydrogenStart(s, aB)

  return { aB, R, stress: bindingStress(su, s, alphaOf(su, aB), repWeights(s, r)) }
}

export type LevelRead = {
  name: string
  aB: number
  R: number
  reps: number
  E: number
  share: number
  phase: number
  residual: number
  stress: Stress
  r2After: number
  seconds: number
}

export function levelRead(
  su: Setup,
  p: Recorded,
  opts: KernelOptions,
  log: (what: string) => void = quiet,
): LevelRead {
  const started = Date.now()
  const R = radiusOf(p.aB)
  const alpha = alphaOf(su, p.aB)
  const s = sector(su.group, [...su.group.elements.keys()], R)
  const count = reducedCounts(s, su.table, alpha, su.theta)
  const e = reducedEngine(s, su.u, [0, 0, 0, 0], count, 'vector', opts)
  const r = reducedHydrogenStart(s, p.aB)

  normalizeState(e, r)
  log(`${p.name}: ${s.count} representatives, filtering ${FILTER} cycles`)

  const v: RState = reducedFilter(e, r, p.E, FILTER)

  normalizeState(e, v)

  const read = reducedRead(e, v)
  const stress = bindingStress(su, s, alpha, repWeights(s, v))
  const u = cloneState(v)

  reducedCycle(e, u)

  const r2After = meanR2(s, repWeights(s, u))

  log(`${p.name}: phase ${read.phase} residual ${read.residual} bind ${stress.bind}`)

  return {
    name: p.name,
    aB: p.aB,
    R,
    reps: s.count,
    E: p.E,
    share: filterShare(p, FILTER),
    phase: read.phase,
    residual: read.residual,
    stress,
    r2After,
    seconds: (Date.now() - started) / 1000,
  }
}

// least squares y = c / a_B^2 through the origin
const inverseSquare = (pts: { aB: number; y: number }[]): number => {
  let num = 0
  let den = 0

  for (const p of pts) {
    const x = 1 / p.aB ** 2

    num += x * p.y
    den += x * x
  }

  return num / den
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combine(
  su: Setup,
  levels: LevelRead[],
  refs: ReferenceRead[],
): Verdict {
  const recordedOf = (name: string): Recorded =>
    RECORDED.find(p => p.name === name)!
  const clear = levels.filter(l => recordedOf(l.name).Rstatic !== null)
  const rows = clear.map(l => {
    const p = recordedOf(l.name)
    const Rs = p.Rstatic!
    const Rf = p.Rfull!
    const sigma = 0
    const lift = -l.stress.bind / l.E

    return {
      name: l.name,
      aB: l.aB,
      Rs,
      Rf,
      lift,
      need: (Rs - 1) * l.E,
      Eb: 2 * su.M0 - l.E,
      H1: Math.abs(Rs - 1 - sigma / l.E) <= TOLERANCE,
      H1full: Math.abs(Rf - 1 - sigma / l.E) <= TOLERANCE,
      H1b: Math.abs(Rs - 1 - lift) <= TOLERANCE,
      H1c: Math.abs(Rs - su.tanOver - lift) <= TOLERANCE,
    }
  })
  const H1 = rows.length === 2 && rows.every(r => r.H1)
  const P = rows.every(r => !r.H1)
  const H1b = rows.every(r => r.H1b)
  const H1c = rows.every(r => r.H1c)
  const I1 = levels.every(l => l.share >= SHARE)
  const I2 = levels.every(
    l => Math.abs(l.phase - l.E) <= PHASE && l.residual <= RESIDUAL,
  )
  const I3 = levels.every(
    l => Math.abs(l.r2After / l.stress.meanR2 - 1) <= STATIONARY,
  )
  const C1 = refs.every(
    r => Math.abs(r.stress.bind / r.stress.thirdV - 1) <= IDENTITY,
  )
  const fit = inverseSquare(
    refs.map(r => ({ aB: r.aB, y: -r.stress.bind / (2 * su.M0) })),
  )
  const crossing = Math.sqrt(fit / 0.01)
  const instrument = I1 && I2 && I3
  const status = !H1 ? 'fail' : !instrument || !C1 ? 'partial' : 'pass'
  const f4 = (x: number): string => x.toFixed(4)
  const e3 = (x: number): string => x.toExponential(3)
  const levelText = levels
    .map(
      l =>
        `a_B ${l.aB} (ball ${l.R}, ${l.reps} representatives, filter share ${f4(l.share)}): phase ${l.phase.toFixed(9)} against ${l.E.toFixed(9)}, residual ${e3(l.residual)}, E_b ${(2 * su.M0 - l.E).toFixed(5)}; SIGMA_BIND ${e3(l.stress.bind)} (smooth ${e3(l.stress.bindSmooth)}, (1/3) <V> ${e3(l.stress.thirdV)}), -SIGMA_BIND / E ${f4(-l.stress.bind / l.E)}, <V> / E_b ${f4((3 * l.stress.thirdV) / (2 * su.M0 - l.E))}; <|y|^2> ${l.stress.meanR2.toFixed(4)}, one cycle on ${e3(l.r2After / l.stress.meanR2 - 1)}; ${l.seconds.toFixed(0)} s`,
    )
    .join('. ')
  const rowText = rows
    .map(
      r =>
        `a_B ${r.aB}: R_static - 1 ${f4(r.Rs - 1)} (R_full - 1 ${f4(r.Rf - 1)}) against SIGMA / E 0 (H1 ${r.H1}, with R_full ${r.H1full}) and -SIGMA_BIND / E ${f4(r.lift)} (H1b ${r.H1b}; H1c, against R - tan m / m ${f4(r.Rs - su.tanOver)}, ${r.H1c}); the stress Laue would need, (R - 1) E, is ${f4(r.need)}, ${(r.need / r.Eb).toFixed(1)} times the binding E_b ${r.Eb.toFixed(5)}`,
    )
    .join('. ')
  const refText = refs
    .map(
      r =>
        `${r.aB}: ${f4(-r.stress.bind / (2 * su.M0))} (${f4(r.stress.bind / r.stress.thirdV)} of (1/3) <V>)`,
    )
    .join(', ')

  return verdict({
    status,
    claim: `H1 ${H1}; P ${P}; H1b ${H1b}; H1c ${H1c}. ${rowText}. Instrument I1 ${I1} I2 ${I2} I3 ${I3}; control C1 ${C1}. The crossing: Laue's reading puts R = 1 at every a_B; H1b's falls as ${f4(fit)} / a_B^2 and is under 0.01 from a_B ${crossing.toFixed(1)}`,
    metrics: {
      H1: flag(H1),
      P: flag(P),
      H1b: flag(H1b),
      H1c: flag(H1c),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      C1: flag(C1),
      liftFit: fit,
      crossing,
      ...Object.fromEntries(
        levels.flatMap(l => [
          [`${l.name}_bind`, l.stress.bind],
          [`${l.name}_lift`, -l.stress.bind / l.E],
          [`${l.name}_share`, l.share],
          [`${l.name}_residual`, l.residual],
        ]),
      ),
      ...Object.fromEntries(
        rows.flatMap(r => [
          [`${r.name}_Rstatic`, r.Rs],
          [`${r.name}_need`, r.need],
        ]),
      ),
    },
    control: { C1: flag(C1), instrument: flag(instrument) },
    notes: `L2. The tracked levels rebuilt by one ${FILTER}-cycle filter from the scan's reference on the native kernel. ${levelText}. On the hydrogenic reference, -SIGMA_BIND / 2M by a_B: ${refText}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

export function laueRun(log: (what: string) => void = quiet): Verdict {
  const su = setup()
  const refs = REFERENCE_AB.map(aB => referenceRead(su, aB))

  log('references read')

  const levels = RECORDED.map(p => levelRead(su, p, NATIVE, log))

  return combine(su, levels, refs)
}

export default experiment({
  id: 'relativity/laue-pair-stress',
  code: 'E-RLT-0111',
  title:
    "Laue's theorem for the light register pair, fail as predicted: the excess inertia is not stress. A tracked level is stationary, so its integrated stress is 0 exactly (its second moment moves under 1.2e-5 a cycle), yet R - 1 is 1.72 (a_B 6) and 0.53 (a_B 8); the binding's stress alone has the right sign and is 0.030, 0.015 and 0.006 of E (a_B 6, 8, 12), 58 and 36 times too small, and Laue would need a stress 42 and 27 times the binding; the reference control on the 1/r identity fails at large a_B (the count's floor)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return laueRun()
  },
})
