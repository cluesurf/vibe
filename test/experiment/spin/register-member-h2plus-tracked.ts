// H2+ WITH ONE REGISTER MEMBER, THE BONDING LEVEL TRACKED BY ITS OVERLAP (E-SPN-0203, roadmap item 7, atoms;
// routes/matter-forces-numbers.md section E, chemical bonds, the row "H2+ with one register member": H2+ binds at 2.0 a_B
// with a depth about 0.205 of the atom's E_b; killed by no minimum, or a minimum away from 2 a_B that does not move toward
// it as a_B grows). E-SPN-0190 (spin/register-member-h2plus) put E-SPN-0160's light register member (u = ringUnit(-5,
// 1), m 0.427029) on two fixed sources of the husk light's Coulomb law and failed on its own tracking rule: it read the
// genuine line (|modulus - 1| under 1e-4) of largest weight; the bonding line, at |modulus - 1| 2e-5 to 1e-4 at N 700
// to 1,000, fell outside that cut at 7 of 16 separations and the read jumped to deep core lines of weight under 0.02.
// Its stated remedy: overlap tracking against the fixed start (as spin/register-coulomb-track does), N at least doubled,
// and a check that the core lines stay light. This file is that rerun. E-SPN-0190's file is not changed.
//
// WHAT IS RUN. Everything of E-SPN-0190 except the read: the same member engine (code/measure/register-member-field,
// the vector form, beat 1 = 1 + (w1 - 1) Q_S, beat 2 = 1 + (w2 - 1) Q_D', w1 = u e^(i phi), w2 = conj(u) e^(i phi)),
// the same field phi(y) = alpha sum_k G(y - X_k) (G the infinite husk Green's function), the same mass mu = 4 tan m,
// alpha = 24 pi / (mu a_B), E_b = 1 / (2 mu a_B^2), the same region (docks within 4.5 a_B of the segment, absorbing
// edge), the same start (the LCAO profile exp(-r1 / a_B) + p exp(-r2 / a_B), p = +1 gerade and -1 ungerade, in the D
// coordinates, register label 0, unit in the metric G), and the same harmonic inversion of c_l = <G v | U^l v>, read
// at binding b = E - (pi - M0). The total energy in the atom's units is e(R) = (-b(R) + alpha G(R)) / b_atom.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE OVERLAP. c is the start's own autocorrelation with no filter, so a line's weight from harmonicLines is its
//    overlap with the start, |<psi_j | G v>|^2 (v unit): the quantity spin/register-coulomb-track tracks. The start is
//    the same function of R / a_B and y / a_B at every point, so the tracked level is the line the fixed start
//    overlaps most, not the heaviest line among those that pass a modulus cut.
// 2. THE BONDING LEVEL IS A MULTIPLET, SO ITS READ IS A CENTROID (probes 1 and 2). At a_B 3 the start's bonding weight
//    sits on a cluster of lines within 0.15 E_b: at R 5 docks a resolved pair 2.509 and 2.545 E_b (overlaps 0.26 and
//    0.30, the same at N 2,000, 3,000, 4,000 to 0.005 E_b); at R 6 docks a cluster 2.31 to 2.45 E_b that the inversion
//    splits differently at each N (largest line 2.313, 2.327, 2.315 at N 4,000, 3,000, 2,000 with overlap 0.26, 0.19,
//    0.31). The one-source atom is a single clean line (E-SPN-0190 probe 3). Which member of the cluster carries the
//    most overlap is set by the resolution, so the level read is the overlap-weighted centroid of the genuine lines
//    within BAND = 0.2 E_b of the largest-overlap line: b = sum w_j b_j / sum w_j. That centroid moved by 0.002 E_b
//    from N 3,000 to 4,000 at R 6 and by 0.001 at R 5 (a_B 3), and by 0.0014 from N 1,500 to 2,000 at a_B 2.5, R 5;
//    from N 1,000 to 2,000 at a_B 3, R 6 it moved by 0.016. A line is counted as genuine at |modulus - 1| under 1e-3
//    (the cluster's lines sit at 2e-6 to 3e-4; the S-branch alias lies far outside the window).
// 3. THE WINDOW. b in [-0.5, 6] E_b: it holds the bonding cluster (b 2.3 to 2.6), the antibonding level (above 1) and
//    the cores' deep lines that carry weight 1e-3 or more (3.4 to 5.2 E_b in probe 2); one deeper core line (21 to 26
//    E_b, overlap under 0.012, |modulus - 1| 1e-2 to 0.3 at these N) lies outside and is not counted. L = ceil(width /
//    (2 pi / N)) + 1 basis phases.
// 4. THE CORE LINES. The core weight is the summed overlap of the window's lines deeper than the tracked line by more
//    than 0.5 E_b (probe 2 at a_B 3: 0.015 at R 6, 0.025 at R 5; probe 3 at a_B 2.5, R 5: 0.040, largest single 0.016).
// 5. THE RESOLUTION. N 2,000 at a_B 3 and 1,600 at a_B 2.5 (E-SPN-0190's 1,000 and 700, doubled and more; the bin 2 pi
//    / N is 0.103 and 0.089 E_b). The read is repeated from the first 3N / 4 lags of the same correlation; the
//    centroids must agree.
// 6. THE MINIMUM, as E-SPN-0190 point 4: the scan's lowest e interior, R_min and e_min from the parabola through it and
//    its two neighbours, D = -1 - e_min. Continuum (Burrau; Bates, Ledsham and Stewart): R_min 1.997 a_B, D 0.2053.
//
// PROBES BEFORE THE GATES (tmp/h2-probe1.ts; logs tmp/h2-probe1-3-6.log, h2-probe2-3-6.log, h2-probe2-3-5.log,
// h2-probe3-g.log, h2-probe3-u.log; no other two-source reads):
//   1 a_B 3, R 6, gerade, N 2,000 and 1,000, window to 25 E_b: the cluster of point 2 and the core lines of points 3 and
//     4; 32 ms a cycle on 13,857 docks with the machine quiet, 70 to 76 when loaded
//   2 a_B 3, R 6 and R 5, gerade, N 4,000, 3,000, 2,000, window to 8 E_b: the centroids of point 2 (R 6: 2.3379,
//     2.3399, 2.3374; R 5: 2.5219, 2.5229, 2.5210 at N 4,000, 3,000, 2,000)
//   3 a_B 2.5, R 5 (2 a_B), N 2,000, 1,500, 1,000: gerade centroid 2.3425, 2.3439, 2.3429 E_b, overlap in the band 0.64,
//     core weight 0.040. Ungerade: the start spreads over a smear of lines from 0.8 to 2.0 E_b, the largest overlap
//     0.084 (1.874 E_b), its band centroid 1.907, 1.906, 1.895 at N 2,000, 1,500, 1,000: the antibonding level is not
//     one resolved line at this N, so the control below reads a centroid of a smear and is not a hard gate
//   From these probes e(R) at a_B 3 near 2 a_B is about -1.13 to -1.14 (D about 0.13 to 0.14, under H1's band) and at
//   a_B 2.5, 2 a_B about -1.18. The bands below are the route's, as E-SPN-0190 fixed them, not moved to the probes.
//
// HYPOTHESES AND GATES (fixed before the gate run; PLAN: a_B 2.5, N 1,600, gerade at R = 3, 4, 5, 6, 7, 9 docks
// (1.2 to 3.6 a_B), the ungerade control at R = 3, 5, 8; a_B 3, N 2,000, gerade at R = 4, 5, 6, 7, 8, 9, 11 (1.33 to
// 3.67 a_B); the atom at both; thirteen two-source reads and two atoms, sized for the loaded machine)
//   I1 the instrument (hard): E-SPN-0190's, the field-free cycle on a Bloch state equals memberCycle(u, K) within
//      1e-13, and the D branch's kinetic mass from diracPhase within 1e-3 of 4 tan m
//   T1 the tracking (hard): at both atoms and every gerade point the largest-overlap line has overlap at least 0.2,
//      the band around it holds overlap at least 0.4, and the core weight is at most 0.1
//   T2 the resolution (not hard): at every gerade point and both atoms the centroid from 3N / 4 lags within 0.01 E_b
//      of the centroid from N
//   C1 the control (not hard): the ungerade centroid at a_B 2.5 gives e(R) falling strictly over R = 3, 5, 8
//   H1 the route's hypothesis, at a_B 3: e(R) has an interior minimum with R_min / a_B in [1.7, 2.3] and D in [0.16,
//      0.25]
//   H2 the trend (not hard): from a_B 2.5 to 3, |R_min / a_B - 2| does not grow by more than 0.05 and |D - 0.2053| not
//      by more than 0.005
//   P1 the falsifier (the route's kill): no interior minimum at a_B 3, or R_min / a_B outside [1.7, 2.3] at a_B 3 and
//      no closer to 2 than at a_B 2.5
// VERDICT: fail if I1 or T1 fails, or P1 holds, or H1 fails; partial if H1 holds and T2, C1 or H2 fails; pass
// otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether the register member, run exactly on the rule's pieces, has a
// bonding level on two fixed husk-Coulomb charges whose total energy has a minimum, where it lies in a_B, and how
// deep it is in the lattice atom's units, at two couplings, with the level identified by its overlap with a fixed
// start and its core admixture measured. The read is the centroid of a multiplet the inversion does not split stably,
// so a structure inside it (the register's) is not read. It cannot show anything about nuclei the rule makes (the
// sources are fixed and put in by hand, labeled stand-in) or about the nuclei's motion, and two couplings at which
// the lattice atom is 13 to 17 percent overbound are not the a_B -> infinity limit.
//
// FIRST RUN 2026-10-02 (tmp/h2-run1.log, 1,053 s on the loaded machine): FAIL (T1; T2 and H2 not met; I1, H1 and C1
// hold, P1 does not).
//   I1 pass: the field-free cycle against memberCycle 7.0e-16; mu 1.820204 on the axis and the face against 4 tan m
//      1.820121
//   a_B 3, N 2,000, every point held T1 and T2 (largest overlap 0.24 to 0.55, band 0.47 to 0.76, core weight 0.013 to
//      0.026, the 3N / 4 centroid within 0.006 E_b). b (E_b) and e at R 4, 5, 6, 7, 8, 9, 11 docks: 2.8134 -1.15838,
//      2.5229 -1.16653, 2.3372 -1.17909, 2.1706 -1.15817, 2.0546 -1.15030, 1.9368 -1.11995, 1.7740 -1.08328. The
//      minimum is interior at R 6: R_min 1.958 a_B, e_min -1.17935, D 0.1793 (continuum 1.997 and 0.2053). H1 holds
//   a_B 2.5, N 1,600: R 3, 4, 5, 6, 7, 9: b 2.8653, 2.5750, 2.3411, 2.2547, 2.0227, 1.8269; e -1.01274, -1.11859,
//      -1.13204, -1.19969, -1.10437, -1.07311. T1 FAILS at two points: R 4 (largest overlap 0.176) and R 6 (0.172, band
//      0.352); R 6 also fails T2 (its centroid moved by 0.068 E_b from 3N / 4 to N, the next largest drift 0.004). The
//      curve's lowest point is that failed R 6 point, so its minimum (2.366 a_B, D 0.2003) rests on a read the gates
//      reject. H2 fails: R_min moves toward 2 a_B (|R_min / a_B - 2| 0.366 to 0.042) but |D - 0.2053| grows from 0.005
//      to 0.026
//   C1 holds as written (ungerade e -0.4820, -0.8105, -0.9240 at R 3, 5, 8), but on reads the probe already showed to
//      be centroids of a smear: largest overlap 0.057 and 0.072 at R 3 and 5, and at R 3 the 3N / 4 centroid sits at
//      1.213 E_b against 2.237 from N. It is not evidence that the instrument reads "no minimum"
//   A DEFECT OF POINT 2, seen in the run: the atoms are not single lines inside the band. The largest-overlap atom line
//      is 1.1715 E_b at a_B 3 (overlap 0.551, E-SPN-0190's line) and 1.1337 at a_B 2.5 (0.306, E-SPN-0190's 1.134),
//      but the 0.2 E_b band pulls in neighbours, so the centroids that normalize e are 1.1341 and 1.1848: 3.2 percent
//      below and 4.5 percent above the main lines. Normalized by the main lines instead (after the run, not a gate),
//      D would be 0.142 at a_B 3 and 0.254 at a_B 2.5. So the depth here carries a normalization error of a few
//      percent of e, larger than the gap between D and the continuum's 0.205; R_min does not depend on it.
//   What this run reads: at a_B 3, with the level identified by its overlap and the core lines light (under 0.03), the
//      bonding level's total energy has an interior minimum near 2 a_B (1.96). What it does not read: a depth to better
//      than the atom normalization's few percent, or a trend with a_B, since the a_B 2.5 curve fails its own tracking
//      gate at two of six points. A rerun needs the atom's normalization read by the same rule as the clean line (a
//      band that holds only the main line, or the main line itself) and a_B 2.5 at larger N or a third a_B above 3.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import {
  greenAt,
  huskGreenTable,
  type GreenTable,
} from '@/code/measure/husk-meson'
import { huskR, huskRelBall } from '@/code/measure/register-coulomb'
import { memberCycle } from '@/code/measure/register-meson'
import {
  capsuleBall,
  memberAutocorrelation,
  memberEngine,
  memberFieldCycle,
  memberNorm2,
  newMember,
  scaleMember,
} from '@/code/measure/register-member-field'
import { harmonicLines } from '@/code/measure/register-reduced'
import { diracPhase } from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const LIGHT: readonly [number, number] = [-5, 1]
const REGION = 4.5
const WINDOW: readonly [number, number] = [-0.5, 6]
const GENUINE = 1e-3
const BAND = 0.2
const CORE_GAP = 0.5
const TRACK_TOP = 0.2
const TRACK_BAND = 0.4
const CORE_MAX = 0.1
const RESOLVE = 0.01
const CONTINUUM = { Rmin: 1.997, D: 0.2053 }
const HBAND = { R: [1.7, 2.3], D: [0.16, 0.25] } as const

type Plan = {
  aB: number
  N: number
  gerade: number[]
  ungerade: number[]
}

const PLAN: readonly Plan[] = [
  { aB: 2.5, N: 1600, gerade: [3, 4, 5, 6, 7, 9], ungerade: [3, 5, 8] },
  { aB: 3, N: 2000, gerade: [4, 5, 6, 7, 8, 9, 11], ungerade: [] },
]

type Lines = { E: number; weight: number; modulus: number }[]

type Read = {
  // the band centroid's binding (phase units) from N and from 3N / 4 lags, in E_b units
  b: number
  bE: number
  bThree: number
  top: number
  topB: number
  band: number
  core: number
  coreTop: number
  windowSum: number
  docks: number
}

type Setup = {
  u: [number, number]
  M0: number
  edge: number
  mu: number
  g0: number
  table: GreenTable
}

const greenOf = (
  s: Setup,
  dx: number,
  dy: number,
  dz: number,
): number => s.g0 - greenAt(s.table, dx, dy, dz)

// the tracked level from one correlation length: the largest-overlap genuine line in the window, the overlap-weighted
// centroid of the genuine lines within BAND of it, and the core weight below it
function tracked(
  s: Setup,
  c: { re: Float64Array; im: Float64Array },
  n: number,
  Eb: number,
): {
  b: number
  top: number
  topB: number
  band: number
  core: number
  coreTop: number
  windowSum: number
} {
  const cut = { re: c.re.slice(0, n + 1), im: c.im.slice(0, n + 1) }
  const spacing = (2 * Math.PI) / n
  const center = s.edge + ((WINDOW[0] + WINDOW[1]) / 2) * Eb
  const L = Math.ceil(((WINDOW[1] - WINDOW[0]) * Eb) / spacing) + 1
  const lines: Lines = harmonicLines(cut, center, L, spacing)
    .filter(l => Math.abs(l.modulus - 1) < GENUINE)
    .map(l => ({ ...l, E: (l.E - s.edge) / Eb }))
    .filter(l => l.E >= WINDOW[0] && l.E <= WINDOW[1])

  if (lines.length === 0) {
    return {
      b: NaN,
      top: 0,
      topB: NaN,
      band: 0,
      core: NaN,
      coreTop: NaN,
      windowSum: 0,
    }
  }

  const top = lines.reduce((x, y) => (y.weight > x.weight ? y : x))
  const inBand = lines.filter(l => Math.abs(l.E - top.E) <= BAND)
  const band = inBand.reduce((t, l) => t + l.weight, 0)
  const core = lines.filter(l => l.E > top.E + CORE_GAP)

  return {
    b: inBand.reduce((t, l) => t + l.weight * l.E, 0) / band,
    top: top.weight,
    topB: top.E,
    band,
    core: core.reduce((t, l) => t + l.weight, 0),
    coreTop: core.reduce((t, l) => Math.max(t, l.weight), 0),
    windowSum: lines.reduce((t, l) => t + l.weight, 0),
  }
}

// the read for nuclei on the x axis (one at 0 for the atom), parity +1 (gerade) or -1 (ungerade)
function readLevel(
  s: Setup,
  aB: number,
  N: number,
  R: number | null,
  parity: 1 | -1,
): Read {
  const nuclei =
    R === null ? [0] : [-Math.floor(R / 2), R - Math.floor(R / 2)]
  const ball = capsuleBall(
    Math.min(...nuclei),
    Math.max(...nuclei),
    REGION * aB,
  )
  const alpha = (24 * Math.PI) / (s.mu * aB)
  const Eb = 1 / (2 * s.mu * aB * aB)
  const phi = ball.points.map(p =>
    nuclei.reduce(
      (t, x) => t + alpha * greenOf(s, p[0]! - x, p[1]!, p[2]!),
      0,
    ),
  )
  const e = memberEngine(ball, s.u, phi)
  const v = newMember(ball)

  ball.points.forEach((p, i) => {
    const f = nuclei.reduce(
      (t, x, k) =>
        t +
        (k === 0 ? 1 : parity) *
          Math.exp(-Math.hypot(p[0]! - x, p[1]!, p[2]!) / aB),
      0,
    )

    v.re[i * 16 + 8] = f
  })
  scaleMember(v, 1 / Math.sqrt(memberNorm2(e, v)))

  const c = memberAutocorrelation(e, v, N)
  const full = tracked(s, c, N, Eb)
  const three = tracked(s, c, (3 * N) / 4, Eb)

  return {
    b: full.b * Eb,
    bE: full.b,
    bThree: three.b,
    top: full.top,
    topB: full.topB,
    band: full.band,
    core: full.core,
    coreTop: full.coreTop,
    windowSum: full.windowSum,
    docks: ball.points.length,
  }
}

// the parabola's vertex through three points
function vertex(
  xs: readonly number[],
  ys: readonly number[],
): { x: number; y: number } {
  const [x0, x1, x2] = xs as [number, number, number]
  const [y0, y1, y2] = ys as [number, number, number]
  const d1 = (y1 - y0) / (x1 - x0)
  const d2 = (y2 - y1) / (x2 - x1)
  const a = (d2 - d1) / (x2 - x0)
  const b = d1 - a * (x0 + x1)
  const x = -b / (2 * a)

  return { x, y: y0 + d1 * (x - x0) + a * (x - x0) * (x - x1) }
}

type Curve = {
  aB: number
  atom: Read
  points: { R: number; read: Read; e: number }[]
  interior: boolean
  Rmin: number
  emin: number
  D: number
}

const describe = (r: Read): string =>
  `b ${r.bE.toFixed(5)} E_b (3N/4 ${r.bThree.toFixed(5)}), top ${r.top.toFixed(4)} at ${r.topB.toFixed(4)}, band ${r.band.toFixed(4)}, core ${r.core.toFixed(4)} (largest ${r.coreTop.toFixed(4)}), window ${r.windowSum.toFixed(4)}, docks ${r.docks}`

function curve(
  s: Setup,
  plan: Plan,
  Rs: readonly number[],
  parity: 1 | -1,
  atom: Read,
  log: (w: string) => void,
): Curve {
  const alpha = (24 * Math.PI) / (s.mu * plan.aB)
  const points = Rs.map(R => {
    const read = readLevel(s, plan.aB, plan.N, R, parity)
    const e = (-read.b + alpha * greenOf(s, R, 0, 0)) / atom.b

    log(
      `a_B ${plan.aB} ${parity > 0 ? 'g' : 'u'} R ${R}: ${describe(read)}; e ${e.toFixed(6)}`,
    )

    return { R, read, e }
  })
  const es = points.map(p => p.e)
  const k = es.indexOf(Math.min(...es))
  const interior = k > 0 && k < es.length - 1
  const v = interior
    ? vertex(
        [Rs[k - 1]!, Rs[k]!, Rs[k + 1]!],
        [es[k - 1]!, es[k]!, es[k + 1]!],
      )
    : { x: Rs[k]!, y: es[k]! }

  return {
    aB: plan.aB,
    atom,
    points,
    interior,
    Rmin: v.x / plan.aB,
    emin: v.y,
    D: -1 - v.y,
  }
}

const holds = (r: Read): boolean =>
  r.top >= TRACK_TOP && r.band >= TRACK_BAND && r.core <= CORE_MAX

const resolved = (r: Read): boolean =>
  Math.abs(r.bThree - r.bE) <= RESOLVE

export function registerMemberH2plusTrackedRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const theta0 = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(theta0), Math.sin(theta0)]
  const M0 = wrap(theta0 - Math.PI)
  const m = M0 / 2
  const mu = 4 * Math.tan(m)
  const g0 = infiniteGreenZero('husk', 64).value
  const s: Setup = {
    u,
    M0,
    edge: Math.PI - M0,
    mu,
    g0,
    table: huskGreenTable(128, 16, g0),
  }

  // ---------------- I1: the instrument (E-SPN-0190's) ----------------
  const ball = huskRelBall(8)
  const e0 = memberEngine(ball, u, new Float64Array(ball.points.length))
  const K = [0.3, 0.1, -0.2, 0]
  const amp = Array.from({ length: 16 }, (_, k) => [
    Math.cos(0.7 * k + 0.1),
    Math.sin(1.3 * k),
  ])
  const st = newMember(ball)
  const phaseAt = (p: readonly number[]): number =>
    K[0]! * p[0]! + K[1]! * p[1]! + K[2]! * p[2]!

  ball.points.forEach((p, i) => {
    const c = Math.cos(phaseAt(p))
    const sn = Math.sin(phaseAt(p))

    amp.forEach(([r, im], k) => {
      st.re[i * 16 + k] = r! * c - im! * sn
      st.im[i * 16 + k] = r! * sn + im! * c
    })
  })
  memberFieldCycle(e0, st)

  const M = memberCycle(u, K)

  let i1 = 0

  ball.points.forEach((p, i) => {
    if (huskR(p) > 3) {
      return
    }

    const c = Math.cos(phaseAt(p))
    const sn = Math.sin(phaseAt(p))

    for (let k = 0; k < 16; k++) {
      let xr = 0
      let xi = 0

      amp.forEach(([r, im], j) => {
        const mr = M.re[k * 16 + j]!
        const mi = M.im[k * 16 + j]!

        xr += mr * r! - mi * im!
        xi += mr * im! + mi * r!
      })

      i1 = Math.max(
        i1,
        Math.hypot(
          xr * c - xi * sn - st.re[i * 16 + k]!,
          xr * sn + xi * c - st.im[i * 16 + k]!,
        ),
      )
    }
  })

  const kin = (d: readonly number[]): number => {
    const k = 0.01
    const E = diracPhase(
      d.map(x => x * k),
      M0,
    )

    return (k * k) / (2 * (E - M0))
  }

  const muAxis = kin([1, 0, 0, 0])
  const muFace = kin([Math.SQRT1_2, Math.SQRT1_2, 0, 0])
  const I1 =
    i1 < 1e-13 &&
    Math.abs(muAxis - mu) < 1e-3 &&
    Math.abs(muFace - mu) < 1e-3

  log(
    `I1 ${I1}: cycle ${i1.toExponential(2)}, mu ${muAxis.toFixed(6)} ${muFace.toFixed(6)} against ${mu.toFixed(6)}`,
  )

  // ---------------- the curves ----------------
  const curves: Curve[] = []
  const atoms: Read[] = []

  let control: Curve | null = null

  for (const plan of PLAN) {
    const atom = readLevel(s, plan.aB, plan.N, null, 1)

    atoms.push(atom)
    log(`a_B ${plan.aB} atom: ${describe(atom)}`)
    curves.push(curve(s, plan, plan.gerade, 1, atom, log))

    if (plan.ungerade.length > 0) {
      control = curve(s, plan, plan.ungerade, -1, atom, log)
    }
  }

  const [weak, main] = curves as [Curve, Curve]
  const gerade = curves.flatMap(c => c.points.map(p => p.read))
  const T1 = atoms.every(holds) && gerade.every(holds)
  const T2 = atoms.every(resolved) && gerade.every(resolved)
  const ues = control!.points.map(p => p.e)
  const C1 = ues.every((x, k) => k === 0 || x < ues[k - 1]!)
  const inBand = (c: Curve): boolean =>
    c.interior &&
    c.Rmin >= HBAND.R[0] &&
    c.Rmin <= HBAND.R[1] &&
    c.D >= HBAND.D[0] &&
    c.D <= HBAND.D[1]
  const H1 = inBand(main)
  const offR = (c: Curve): number => Math.abs(c.Rmin - 2)
  const offD = (c: Curve): number => Math.abs(c.D - CONTINUUM.D)
  const H2 =
    weak.interior &&
    main.interior &&
    offR(main) <= offR(weak) + 0.05 &&
    offD(main) <= offD(weak) + 0.005
  const P1 =
    !main.interior ||
    ((main.Rmin < HBAND.R[0] || main.Rmin > HBAND.R[1]) &&
      !(weak.interior && offR(main) < offR(weak)))
  const status =
    !I1 || !T1 || P1 || !H1
      ? 'fail'
      : !T2 || !C1 || !H2
        ? 'partial'
        : 'pass'

  log(
    `status ${status}: I1 ${I1} T1 ${T1} T2 ${T2} C1 ${C1} H1 ${H1} H2 ${H2} P1 ${P1}; a_B 3 R_min ${main.Rmin.toFixed(4)} a_B D ${main.D.toFixed(5)}; a_B 2.5 R_min ${weak.Rmin.toFixed(4)} D ${weak.D.toFixed(5)}`,
  )

  const metrics: Record<string, number> = {
    instrumentCycle: i1,
    muAxis,
    muFace,
    muExpected: mu,
    seconds: (Date.now() - started) / 1000,
  }

  curves.forEach(c => {
    const t = `aB${c.aB}`

    metrics[`${t}_atomBindingOverEb`] = c.atom.bE
    metrics[`${t}_atomTop`] = c.atom.top
    metrics[`${t}_interior`] = c.interior ? 1 : 0
    metrics[`${t}_RminOverAB`] = c.Rmin
    metrics[`${t}_emin`] = c.emin
    metrics[`${t}_depth`] = c.D
    c.points.forEach(p => {
      metrics[`${t}_e_R${p.R}`] = p.e
      metrics[`${t}_b_R${p.R}`] = p.read.bE
      metrics[`${t}_top_R${p.R}`] = p.read.top
      metrics[`${t}_band_R${p.R}`] = p.read.band
      metrics[`${t}_core_R${p.R}`] = p.read.core
      metrics[`${t}_drift_R${p.R}`] = p.read.bThree - p.read.bE
    })
  })

  control!.points.forEach(p => {
    metrics[`ungerade_e_R${p.R}`] = p.e
    metrics[`ungerade_top_R${p.R}`] = p.read.top
  })

  return verdict({
    status,
    claim: `one register member on two fixed husk-Coulomb sources, the bonding level tracked by its overlap with a fixed LCAO start: at a_B 3 the total energy has ${main.interior ? `a minimum at R = ${main.Rmin.toFixed(3)} a_B with depth ${main.D.toFixed(4)} of the lattice atom's binding` : 'no interior minimum'} (continuum ${CONTINUUM.Rmin} and ${CONTINUUM.D}), at a_B 2.5 ${weak.interior ? `${weak.Rmin.toFixed(3)} a_B and ${weak.D.toFixed(4)}` : 'no interior minimum'}; the antibonding control ${C1 ? 'falls monotonically' : 'does not fall monotonically'}`,
    metrics,
    control: {
      continuumRmin: CONTINUUM.Rmin,
      continuumDepth: CONTINUUM.D,
      ungerademonotone: C1 ? 1 : 0,
    },
    notes: `L2. I1 ${I1}, T1 ${T1}, T2 ${T2}, C1 ${C1}, H1 ${H1}, H2 ${H2}, P1 ${P1}. The light member m ${m.toFixed(6)} (u = ringUnit(${LIGHT.join(', ')})), mu = 4 tan m, the vector form, fixed sources (stand-in nuclei) on the husk quotient, harmonic inversion of the start's autocorrelation; the level read is the overlap-weighted centroid of the lines within ${BAND} E_b of the largest-overlap line.`,
  })
}

export default experiment({
  id: 'spin/register-member-h2plus-tracked',
  code: 'E-SPN-0203',
  title:
    'H2+ with one register member, the bonding level tracked by its overlap with a fixed start, fail on the tracking gate at a_B 2.5: at a_B 3 every separation held (overlap 0.24 to 0.55, core lines under 0.03) and the total energy has its minimum at 1.958 a_B with depth 0.179 of the atom read (continuum 1.997 and 0.205), but at a_B 2.5 the largest overlap fell to 0.17 at two of six separations, and the atom reads are band centroids 3 to 5 percent off their main lines, so the depth and the trend with a_B are not read',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerMemberH2plusTrackedRun()
  },
})
