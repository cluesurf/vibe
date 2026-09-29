// The continuous bald horizon (E-GRV-0115): the clock horizon of code/rule/clock-horizon with a tear that does not jolt
// and a horizon that trades its source over its own surface as a reversible wave (note/research/vibe/roadmap/
// discrete-gravity.md, "Measured, the no-hair horizon": "Next: a tear that is continuous as well as bald"). A STAND-IN,
// as the torn husk is: nothing in the model makes the depth read any state (E-GRV-0071).
//
// WHAT WENT WRONG BEFORE. The held tear (E-GRV-0112, code/rule/horizon-husk) keeps each torn link's step in the beat as
// a fixed source: continuous, but the source is frozen at the moment of the tear, so the field outside keeps the growth
// history (36 percent off the placed lump's). The count tear (E-GRV-0113, code/rule/count-horizon) drops every torn link
// from the beat and spreads the count evenly: bald, but a jolt: the outside docks lose the torn links' flux in one beat,
// the leapfrog has no damping, and the horizon runs away (2,154 docks against 779).
//
// THE RULE. Between events the horizon H (one bit a husk dock) is fixed. Three changes to code/rule/horizon-husk's beat.
//  1. WHICH LINKS TEAR: only a husk lateral link with BOTH ends on H (an INNER link, innerLink). A link from a horizon
//     dock to a dock outside stays live: it is where the horizon's field meets the outside. (Tearing it, as E-GRV-0112
//     and 0113 do, cannot be continuous at its OUTER end: the outside dock loses the link's flux at once unless something
//     outside the horizon keeps it, and keeping it is the hair.)
//  2. EACH HORIZON DOCK HOLDS A SHARE sigma_y (register units), and its source is S_y = Q^L div f_y + sigma_y; off H,
//     S_z = Q^L div f_z and sigma_z = 0. THE HANDOVER (at the first beat after a join, sync): for each link m that has
//     just become inner, with step F_m, sigma_tail -= F_m and sigma_head += F_m, and the link leaves the beat (its register
//     keeps F_m, unread). Its flow J_m and carry C_m start at 0.
//  3. THE HORIZON WAVE on the inner links, a leapfrog on (sigma, J): with x the found depth,
//       kick  J_m <- J_m + mu g_m [ lambda (S_tail - S_head) - (x_tail - x_head) ]   (carried, divisor 2 Q)
//       drift sigma_tail -= J_m, sigma_head += J_m
//     mu = kappa = a / Q, the rate's own kick (no new mobility), lambda = LAMBDA (a stated stiffness, see BOUNDED).
//     x_tail - x_head for two horizon docks is read LOCALLY: down the tail's vertical, across the one bulk link joining
//     the two parents (or none when they share one), up the head's vertical (wavePaths). Adjacent husk docks differ by at
//     most one per axis and in at most two axes, so their parents in layer 1 are the same dock or neighbors.
//
// DERIVED, before the code.
//  - NO JOLT, EXACTLY. A dock's rate reads X_y = a (S_y - div' F_y), div' over live links. At a handover of link m
//    (tail t, head h), div' F_t loses +F_m and sigma_t loses F_m, so S_t - div' F_t is the same integer; div' F_h loses
//    -F_m and sigma_h gains F_m, the same. No other dock reads m. So EVERY dock's X, on the beat after the join, is the
//    integer it would have been with the link live: the source the outside sees is the same the beat before and after.
//    What changes is later: the torn link takes no new value, and its flux, now in sigma, moves only by the wave, which
//    starts from J = 0, so sigma changes by at most one kick's worth on the first beat (second order in time).
//  - GAUSS EXACT. Every handover and every drift adds to one end what it takes from the other, so sum over H of sigma is
//    0 on every beat, exactly, and sum over H of S is Q^L N with N the content inside: the lines keep div f = rho, and
//    the horizon presents exactly its content. (Per connected piece of H, the same: a handover joins what it links.)
//  - REVERSIBLE. The beat is (kick J and v from positions at n) then (drift F and sigma from momenta at n + 1). Undone
//    in reverse: sigma += div J, F -= g grad v, then J and v unkicked from the restored positions, each carry inverted as
//    the rate's is. The handover is undone when the join is: sync in reverse gives each link back its flux from sigma,
//    and the link's J and C are 0 there because every beat since has been undone.
//  - THE ENERGY. The beat is a kick-drift leapfrog for H = T(p) + V(q) with q = (x, sigma), p = (v / kappa, J / (mu g))
//    and V = 1/2 x A x - S . x + 1/2 lambda sum_H S^2 (A the live links' weighted Laplacian). For such a leapfrog
//    E = T(p_{n+1}) + 1/2 q_{n+1} A q_n + b (q_{n+1} + q_n) / 2 is kept exactly (A symmetric), which here is
//      E = (pi / D) [ sum m v^2 / 2 kappa + sum_inner J^2 / 2 mu g + 1/2 sum_live F1 F0 / g + 1/2 lambda sum_H S1 S0
//                     - 1/2 sum (S1 x0 + S0 x1) ]
//    kept between events to the carry level (code/measure/wave-horizon waveEnergy). The wave's own part is its first
//    two sums on the inner links and the lambda sum.
//  - BOUNDED. The wave is stable when V is positive on the moves sigma can make (sum 0 on each piece of H): lambda must
//    exceed the largest eigenvalue of G_HH (the live mesh's Green's function between horizon docks) on that subspace. A
//    horizon dock with no outer link is a leaf on its vertical (g = 1), so G_yy >= 1; LAMBDA = 4 leaves room for the
//    smooth part (the placed statics' fixed point converges at a ratio that measures it, code/measure/wave-horizon).
//    Then E bounds every register: |J_m| <= sqrt(2 mu g E_excess) and the sigma excursions likewise. The leapfrog is
//    stable when mu lambda Lambda_max < 4 with Lambda_max <= 2 sum g = 48 on the 18-link husk graph: (2/297) 4 48 = 1.3.
//    The registers are held in the bulk's window (81 whole steps), and a wrap is counted (the gate asks for none).
//  - WHAT THE WAVE CAN AND CANNOT DO. It is linear and closed: it does not damp. The static state it oscillates about
//    (J = 0, lambda S - x the same on each piece of H, sum S = Q^L N) depends on the content inside only through N, and
//    on H; every mode about it with a nonzero frequency averages out over a window long against its period. So what is
//    tested is DEPHASING: a time average over a stated window, not a decay. A zero mode would keep history: the sum on
//    each piece of H (kept by rule, and it is the content) and J's circulation round a loop of inner links (it moves no
//    sigma, so no source).
//  - MEASURED (E-GRV-0115): the handover, Gauss, the reversal and the local path hold exactly, and no share or flow
//    register wraps; but the BOUNDARY links (horizon to outside, live here) carry the rim's shares at the trit window's
//    edge and slip from the 81st horizon dock on (10,321 wraps), which breaks the curl and the energy and feeds the wave.
//  - WHAT IS STORED beyond code/rule/horizon-husk's: sigma per husk dock (0 off H), J and C per husk lateral link (0 off
//    the inner links). The torn links keep their steps unread: the history is kept and hidden, as in E-GRV-0113.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import {
  HUSK_LATERAL,
  openRestLow,
  VERTICAL,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import type { StepTally } from '@/code/rule/step-depth'
import type { HorizonScratch } from '@/code/rule/horizon-husk'
import type { ClockHorizonRule } from '@/code/rule/clock-horizon'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type WaveHorizonRule = ClockHorizonRule & {
  // 2 lambda (lambda a multiple of 1 / 2)
  readonly stiffTwice: number
  // the kick's divisor 2 Q (mu = a / Q, the rate's), and its carry window's low end
  readonly waveDivisor: number
  readonly waveLow: number
}

export const LAMBDA = 4

export function waveHorizonRule(
  rule: ClockHorizonRule,
  lambda = LAMBDA,
): WaveHorizonRule {
  if (!Number.isInteger(2 * lambda) || lambda <= 0) {
    throw new Error(
      'waveHorizonRule: lambda is a positive multiple of 1 / 2',
    )
  }

  const waveDivisor = 2 * rule.q

  return {
    ...rule,
    stiffTwice: 2 * lambda,
    waveDivisor,
    waveLow: openRestLow(waveDivisor),
  }
}

// an inner link: husk lateral with both ends on the horizon (the only links this rule tears)
export const innerLink = (
  mesh: OpenMesh,
  horizon: Uint8Array,
  m: number,
): boolean =>
  mesh.kind[m] === HUSK_LATERAL &&
  horizon[mesh.tail[m]!] === 1 &&
  horizon[mesh.head[m]!] === 1

// the local path for each husk lateral link: its ends' vertical links with the sign that gives x_end - x_parent =
// sign F / g, and the bulk link joining the parents (-1 when they share one) with the sign that gives x_Ptail - x_Phead
export type WavePaths = {
  vt: Int32Array
  st: Int8Array
  vh: Int32Array
  sh: Int8Array
  bulk: Int32Array
  sb: Int8Array
}

export function wavePaths(mesh: OpenMesh): WavePaths {
  const huskLinks = mesh.huskDocks * 9
  const vertical = new Int32Array(mesh.huskDocks).fill(-1)
  const vsign = new Int8Array(mesh.huskDocks)
  const parent = new Int32Array(mesh.huskDocks)

  for (let y = 0; y < mesh.huskDocks; y++) {
    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (mesh.kind[m] !== VERTICAL) {
        continue
      }

      if (vertical[y] !== -1) {
        throw new Error('wavePaths: a husk dock with two verticals')
      }

      vertical[y] = m
      vsign[y] = mesh.incSign[j]!
      parent[y] = mesh.incSign[j]! > 0 ? mesh.head[m]! : mesh.tail[m]!
    }

    if (vertical[y] === -1) {
      throw new Error('wavePaths: a husk dock with no vertical')
    }
  }

  const out: WavePaths = {
    vt: new Int32Array(huskLinks),
    st: new Int8Array(huskLinks),
    vh: new Int32Array(huskLinks),
    sh: new Int8Array(huskLinks),
    bulk: new Int32Array(huskLinks).fill(-1),
    sb: new Int8Array(huskLinks),
  }

  for (let m = 0; m < huskLinks; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) {
      throw new Error('wavePaths: the husk lateral links are not first')
    }

    const t = mesh.tail[m]!
    const h = mesh.head[m]!
    const pt = parent[t]!
    const ph = parent[h]!

    out.vt[m] = vertical[t]!
    out.st[m] = vsign[t]!
    out.vh[m] = vertical[h]!
    out.sh[m] = vsign[h]!

    if (pt === ph) {
      continue
    }

    for (let j = mesh.incStart[pt]!; j < mesh.incStart[pt + 1]!; j++) {
      const b = mesh.incLink[j]!
      const other = mesh.incSign[j]! > 0 ? mesh.head[b]! : mesh.tail[b]!

      if (other === ph && mesh.kind[b] !== VERTICAL) {
        out.bulk[m] = b
        out.sb[m] = mesh.incSign[j]!
        break
      }
    }

    if (out.bulk[m] === -1) {
      throw new Error(
        'wavePaths: two neighboring husk docks whose parents are not neighbors',
      )
    }
  }

  return out
}

// 2 (x_tail - x_head) for husk lateral link m, read along its local path, in register units (an exact integer)
export function pathTwice(
  mesh: OpenMesh,
  paths: WavePaths,
  step: ArrayLike<number>,
  m: number,
): number {
  const w = mesh.weight
  const vt = paths.vt[m]!
  const vh = paths.vh[m]!
  const b = paths.bulk[m]!

  let d =
    (paths.st[m]! * 2 * step[vt]!) / w[vt]! -
    (paths.sh[m]! * 2 * step[vh]!) / w[vh]!

  if (b >= 0) {
    d += (paths.sb[m]! * 2 * step[b]!) / w[b]!
  }

  return d
}

export type WaveScratch = HorizonScratch & {
  // the wave's registers: sigma per husk dock, J and its carry per husk lateral link
  sigma: Float64Array
  flow: Float64Array
  carry: Float64Array
  // the horizon the handover has been made for
  known: Uint8Array
  // S per dock (register units) as the last beat read it
  source: Float64Array
  paths: WavePaths
  // wraps of the wave's own registers
  waveWraps: number
}

export const waveScratch = (
  mesh: OpenMesh,
  paths = wavePaths(mesh),
): WaveScratch => ({
  divLine: new Float64Array(mesh.docks),
  divStep: new Float64Array(mesh.docks),
  sigma: new Float64Array(mesh.huskDocks),
  flow: new Float64Array(mesh.huskDocks * 9),
  carry: new Float64Array(mesh.huskDocks * 9),
  known: new Uint8Array(mesh.huskDocks),
  source: new Float64Array(mesh.docks),
  paths,
  waveWraps: 0,
})

const wrapTrit = (rule: WaveHorizonRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top
const wrapBulk = (rule: WaveHorizonRule, v: number): number =>
  mod(v + rule.bulkTop, rule.bulkSpan) - rule.bulkTop

function divergence(
  mesh: OpenMesh,
  field: ArrayLike<number>,
  out: Float64Array,
  horizon?: Uint8Array,
): void {
  out.fill(0)

  for (let m = 0; m < mesh.links; m++) {
    const v = field[m]!

    if (v === 0 || (horizon && innerLink(mesh, horizon, m))) {
      continue
    }

    out[mesh.tail[m]!] = out[mesh.tail[m]!]! + v

    if (mesh.head[m]! >= 0) {
      out[mesh.head[m]!] = out[mesh.head[m]!]! - v
    }
  }
}

// THE HANDOVER, one way or the other: sense +1 hands every link inner under `horizon` but not under `known` to the
// shares (horizon grown since the last beat); sense -1 hands every link inner under `known` but not under `horizon` back
// (horizon shrunk: a join undone). The sigma it would give is written to `sigma` (the scratch's, or a copy).
export function handover(
  mesh: OpenMesh,
  step: ArrayLike<number>,
  horizon: Uint8Array,
  known: Uint8Array,
  sigma: Float64Array,
  sense: 1 | -1,
): number {
  const [wide, narrow] = sense > 0 ? [horizon, known] : [known, horizon]

  let links = 0

  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    if (!innerLink(mesh, wide, m) || innerLink(mesh, narrow, m)) {
      continue
    }

    const F = step[m]!

    sigma[mesh.tail[m]!] = sigma[mesh.tail[m]!]! - sense * F
    sigma[mesh.head[m]!] = sigma[mesh.head[m]!]! + sense * F
    links++
  }

  return links
}

// bring the scratch's handover up to `horizon` (forward: it has only grown; backward: it has only shrunk)
function sync(
  mesh: OpenMesh,
  s: OpenState,
  horizon: Uint8Array,
  w: WaveScratch,
): void {
  let grown = false
  let shrunk = false

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (horizon[y] && !w.known[y]) {
      grown = true
    } else if (!horizon[y] && w.known[y]) {
      shrunk = true
    }
  }

  if (grown && shrunk) {
    throw new Error(
      'waveBeat: the horizon both grew and shrank between beats',
    )
  }

  if (grown) {
    handover(mesh, s.step, horizon, w.known, w.sigma, 1)
  }

  if (shrunk) {
    for (let m = 0; m < mesh.huskDocks * 9; m++) {
      if (
        innerLink(mesh, w.known, m) &&
        !innerLink(mesh, horizon, m) &&
        (w.flow[m] !== 0 || w.carry[m] !== 0)
      ) {
        throw new Error(
          'waveBeat: a handover undone with its flow still running',
        )
      }
    }

    handover(mesh, s.step, horizon, w.known, w.sigma, -1)

    for (let y = 0; y < mesh.huskDocks; y++) {
      if (!horizon[y] && w.sigma[y] !== 0) {
        throw new Error('waveBeat: a share left off the horizon')
      }
    }
  }

  w.known.set(horizon)
}

// S per dock in register units: Q^L div f, plus sigma on the horizon
function sources(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  horizon: Uint8Array,
  w: WaveScratch,
): void {
  for (let y = 0; y < mesh.docks; y++) {
    w.source[y] =
      rule.unit * w.divLine[y]! +
      (y < mesh.huskDocks && horizon[y] ? w.sigma[y]! : 0)
  }
}

// the kick's numerator for inner link m, from S and the steps at the same beat
const kickOf = (
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  w: WaveScratch,
  step: ArrayLike<number>,
  m: number,
): number =>
  rule.a *
  mesh.weight[m]! *
  (rule.stiffTwice *
    (w.source[mesh.tail[m]!]! - w.source[mesh.head[m]!]!) -
    pathTwice(mesh, w.paths, step, m))

const dockTrit = (
  mesh: OpenMesh,
  horizon: Uint8Array,
  y: number,
): boolean => y < mesh.huskDocks && horizon[y] === 0

// one beat, in place, for the horizon `horizon` (fixed through the beat; the handover to it made first)
export function waveBeat(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  w: WaveScratch,
  tally?: StepTally,
): void {
  if (mesh.lapse) {
    throw new Error(
      'waveBeat: the lapse in the links is not carried here',
    )
  }

  sync(mesh, s, horizon, w)

  const { a, q, h } = rule
  const inertia = mesh.inertia
  const d = rule.waveDivisor

  divergence(mesh, s.line, w.divLine)
  sources(mesh, rule, horizon, w)
  divergence(mesh, s.step, w.divStep, horizon)

  // the kicks, both from the positions at n
  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    if (!innerLink(mesh, horizon, m)) {
      continue
    }

    const x = kickOf(mesh, rule, w, s.step, m)
    const k = floorDiv(x + w.carry[m]! + rule.waveLow, d)
    const raw = w.flow[m]! + k

    w.carry[m] = x + w.carry[m]! - d * k
    w.flow[m] = wrapBulk(rule, raw)

    if (w.flow[m] !== raw) {
      w.waveWraps++
    }
  }

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (w.source[y]! - w.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const k = floorDiv(
      x + s.rest[y]! + (inertia ? openRestLow(qy) : h),
      qy,
    )
    const raw = s.rate[y]! + k

    s.rest[y] = x + s.rest[y]! - qy * k
    s.rate[y] = dockTrit(mesh, horizon, y)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)

    if (tally && s.rate[y] !== raw) {
      tally.vWraps++
    }
  }

  // the drifts, both from the momenta at n + 1
  const { tail, head, weight, kind } = mesh

  for (let m = 0; m < mesh.links; m++) {
    if (innerLink(mesh, horizon, m)) {
      continue
    }

    const z = head[m]!
    const raw =
      s.step[m]! +
      weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] =
      kind[m] === HUSK_LATERAL
        ? wrapTrit(rule, raw)
        : wrapBulk(rule, raw)

    if (tally && s.step[m] !== raw) {
      tally.fWraps++
    }
  }

  drift(mesh, rule, horizon, w, 1)
}

function drift(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  horizon: Uint8Array,
  w: WaveScratch,
  sense: 1 | -1,
): void {
  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    if (!innerLink(mesh, horizon, m) || w.flow[m] === 0) {
      continue
    }

    const t = mesh.tail[m]!
    const hd = mesh.head[m]!
    const rt = w.sigma[t]! - sense * w.flow[m]!
    const rh = w.sigma[hd]! + sense * w.flow[m]!

    w.sigma[t] = wrapBulk(rule, rt)
    w.sigma[hd] = wrapBulk(rule, rh)

    if (w.sigma[t] !== rt || w.sigma[hd] !== rh) {
      w.waveWraps++
    }
  }
}

export function waveBeatBack(
  mesh: OpenMesh,
  rule: WaveHorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  w: WaveScratch,
): void {
  sync(mesh, s, horizon, w)

  const { a, q, h } = rule
  const { tail, head, weight, kind } = mesh
  const inertia = mesh.inertia
  const d = rule.waveDivisor

  drift(mesh, rule, horizon, w, -1)

  for (let m = 0; m < mesh.links; m++) {
    if (innerLink(mesh, horizon, m)) {
      continue
    }

    const z = head[m]!
    const raw =
      s.step[m]! -
      weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] =
      kind[m] === HUSK_LATERAL
        ? wrapTrit(rule, raw)
        : wrapBulk(rule, raw)
  }

  divergence(mesh, s.line, w.divLine)
  sources(mesh, rule, horizon, w)
  divergence(mesh, s.step, w.divStep, horizon)

  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    if (!innerLink(mesh, horizon, m)) {
      continue
    }

    const x = kickOf(mesh, rule, w, s.step, m)
    const k = floorDiv(x - w.carry[m]! + d - 1 - rule.waveLow, d)

    w.carry[m] = w.carry[m]! - x + d * k
    w.flow[m] = wrapBulk(rule, w.flow[m]! - k)
  }

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (w.source[y]! - w.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const k = floorDiv(
      x - s.rest[y]! + (inertia ? qy - 1 - openRestLow(qy) : h),
      qy,
    )
    const raw = s.rate[y]! - k

    s.rest[y] = s.rest[y]! - x + qy * k
    s.rate[y] = dockTrit(mesh, horizon, y)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)
  }
}
