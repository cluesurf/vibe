// H2+ WITH ONE REGISTER MEMBER (E-SPN-0187, roadmap item 7, atoms; routes/matter-forces-numbers.md section E, chemical
// bonds, the row "H2+ with one register member": one member and two fixed charges, energy against separation; H2+ binds
// at 2.0 a_B with a depth about 0.205 of the atom's E_b; killed by no minimum, or a minimum away from 2 a_B that does not
// move toward it as a_B grows). The bond rows so far are stand-ins (E-MTR-0007: a fear-walk stand-in electron on two
// fixed stand-in nuclei, bond at 1.57 a0 at a0 = 4 docks) or textbook (E-SPN-0023). This file puts E-SPN-0160's register
// member itself, the light member of E-SPN-0173 (u = ringUnit(-5, 1), m 0.427029), on two fixed sources of the husk
// light's Coulomb law, exactly in its moving block, and reads the bonding level against the separation.
//
// WHY THIS ROW AND NOT THE STARK ROW (the item names both). The linear Stark row needs the n = 2 levels resolved to a
// fraction of the 2s-2p gap on a register atom, which the only register-atom engine (the pair, spin/register-coulomb-weak,
// -track) reaches only in hours a point, and whose levels are register multiplets. H2+ needs only the bonding ground
// level, isolated by about 1.5 E_b from the next level of its parity, on a one-body engine: minutes a separation.
//
// WHAT IS RUN (code/measure/register-member-field, written for this file). One member in W = S + T D (16 coordinates a
// dock) on the husk quotient (docks Z^3), the cycle beat 1 = 1 + (w1 - 1) Q_S, beat 2 = 1 + (w2 - 1) Q_D', with w1(x) = u
// e^(i phi(x)) and w2(y) = conj(u) e^(i phi(y)): the vector form of a static potential (the same phase on both sectors),
// each beat 1 plus orthogonal projectors times a phase minus 1, so exactly unitary and exactly inside W. phi(y) = alpha
// sum_k G(y - X_k), G the infinite husk Green's function (E-FRC-0241, register-coulomb's table: 1 / (24 pi r) + A / r^5,
// G(0) = 0.052831), X_k the fixed sources on the x axis, R docks apart. The region: the docks within 4.5 a_B of the
// segment between the sources (absorbing edge). The level is read by harmonic inversion (register-reduced's
// harmonicLines) of c_l = <G v | U^l v>, v a start with the gerade LCAO profile exp(-r1 / a_B) + exp(-r2 / a_B) in the D
// coordinates (register label 0) and nothing in S.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE MEMBER'S TWO BRANCHES. At K = 0 the overlap C(0) = sum_d C(r_d) vanishes (the roots sum to zero), so the free
//    cycle is diag(u, conj u): the S coordinates carry the branch at phase theta0 = -2.287534 and the D coordinates the
//    branch at pi - M0 = +2.287534 (M0 0.854058). A vector potential adds phi to both; phi > 0 lifts the D branch into
//    the gap (bound, phase above pi - M0) and pushes the S branch into its own continuum. So the start lives in D and a
//    bound line's binding is b = E - (pi - M0).
// 2. THE MASS. The D branch's phase is pi - E(K), E the member's Dirac phase (spinor-register diracPhase): its curvature
//    gives the kinetic mass per cycle in husk docks, mu = 4 tan m = 1.820121 (probe 4; twice the 2 tan m the pair files
//    use for one member's share of their reduced mass, because the pair's relative coordinate is that file's unit). The
//    Coulomb scale is set as continuum hydrogen with this mass: alpha = 24 pi / (mu a_B), E_b = 1 / (2 mu a_B^2), the
//    contact phase alpha G(0) = 2.1890 / a_B rad a cycle (0.73 at a_B 3), alpha' = 1 / (mu a_B) = 0.18 at a_B 3 (the
//    Dirac correction to E_b about alpha'^2 / 4, under 1 percent).
// 3. THE TOTAL ENERGY. e(R) = (-b(R) + alpha G(R)) / b_atom, b_atom the one-source binding read the same way at the same
//    a_B and region rule: the source-source repulsion is the same husk law. Continuum H2+ (Burrau 1927; Bates, Ledsham
//    and Stewart 1953): e_min = -1.2053 at R = 1.997 a_B, so the depth D = -1 - e_min = 0.2053; the antibonding sigma_u
//    level gives e(R) falling monotonically to -1 over R 1 to 4 a_B (its van der Waals minimum sits near 12.5 a_B).
// 4. THE READING OF THE MINIMUM. The scan's lowest e must be interior; R_min and e_min come from the parabola through it
//    and its two neighbours.
// 5. THE TRACKING RULE (the core states of probe 3). The level read is the genuine line (|modulus - 1| under 1e-4) of
//    largest weight in the window b in [-0.3, 8] E_b. Lines deeper than the window exist: a core-bound line at 20.5 E_b
//    (weight 0.009) at a_B 3; lines at 2.686 and 4.108 E_b of weight 0.010 and 0.002 lie inside the window but carry a
//    fiftieth of the main line's weight. The hydrogenic level is the one the hydrogenic start overlaps most.
//
// PROBES BEFORE THE GATES (tmp/at-probe1.ts, at-probe2.ts, at-disp.ts; one source only, no two-source run was made):
//   1 the instrument (free cycle on a Bloch state at K = (0.3, 0.1, -0.2) against memberCycle, 7.0e-16) and the cost
//     (5 to 6 us a dock a cycle on the loaded machine). An S-coordinate start: its weight sits on the S branch, which is
//     how point 1 was found
//   2 a_B "5" with the wrong mass (2 tan m, so a true a_B 2.5): an unresolved blob of lines at 0.4 to 2.8 E_b at N 400
//   3, 4 the atom at a_B 3, mass 4 tan m, region 4.5 a_B (10,395 docks): at N 1,000 the main line at phase 2.3232759 to
//     2.3232797 over three windows (b 1.1710 to 1.1711 E_b, weight 0.55 to 0.57, |modulus - 1| 5e-6 to 2e-5); at N 500
//     1.1821. So the lattice atom is bound 17 percent more than continuum hydrogen at a_B 3, and N 1,000 fixes its line
//     to about 1e-4 E_b. 60 ms a cycle there
//   dispersion: mu from diracPhase at K 0.01 on the axis and the face diagonal 1.820204 and 1.820204 (4 tan m 1.820121)
//
// HYPOTHESES AND GATES (fixed before the gate run; PLAN: a_B 3 at R = 3, 4, 5, 6, 7, 8, 9, 10, 12 docks with N 1,000;
// a_B 2.5 at R = 3, 4, 5, 6, 7, 8, 10 with N 700; the atoms at both; the sigma_u control at a_B 2.5, R = 3, 4, 5, 7, 10)
//   I1 the instrument (hard): the field-free cycle on a Bloch state equals memberCycle(u, K) within 1e-13 on docks five
//      links inside a ball of 8, and the D branch's kinetic mass from diracPhase within 1e-3 of 4 tan m
//   T1 the tracking (hard): at every gerade point and both atoms the tracked line exists with weight at least 0.2
//   C1 the control (not hard): the sigma_u start (profile exp(-r1 / a_B) - exp(-r2 / a_B)) at a_B 2.5 gives e(R)
//      falling monotonically over its five separations: the instrument can read "no minimum"
//   H1 the route's hypothesis, at a_B 3: e(R) has an interior minimum with R_min / a_B in [1.7, 2.3] and D in [0.16,
//      0.25]
//   H2 the trend (not hard): from a_B 2.5 to 3, |R_min / a_B - 2| does not grow by more than 0.05 and |D - 0.2053| not
//      by more than 0.005
//   P1 the falsifier (the route's kill): no interior minimum at a_B 3, or R_min / a_B outside [1.7, 2.3] at a_B 3 and no
//      closer to 2 than at a_B 2.5
// VERDICT: fail if I1 or T1 fails, or P1 holds, or H1 fails; partial if H1 holds and C1 or H2 fails; pass otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show that the register member, run exactly on the rule's pieces, binds two fixed
// husk-Coulomb charges into a molecule ion with the continuum's bond length and depth to within the lattice term at
// a_B 3 (where the atom itself is 17 percent too bound). It cannot show anything about nuclei the rule makes (the
// sources are fixed and put in by hand, labeled stand-in), about the Born-Oppenheimer motion of the nuclei, or about
// a_B large against the lattice: a_B 4 costs about four times a_B 3 a point and is not run here.

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
const WINDOW: readonly [number, number] = [-0.3, 8]
const GENUINE = 1e-4
const TRACK_WEIGHT = 0.2
const CONTINUUM = { Rmin: 1.997, D: 0.2053 }
const BAND = { R: [1.7, 2.3], D: [0.16, 0.25] } as const

type Plan = { aB: number; N: number; gerade: number[]; ungerade: number[] }

const PLAN: readonly Plan[] = [
  { aB: 2.5, N: 700, gerade: [3, 4, 5, 6, 7, 8, 10], ungerade: [3, 4, 5, 7, 10] },
  { aB: 3, N: 1000, gerade: [3, 4, 5, 6, 7, 8, 9, 10, 12], ungerade: [] },
]

type Read = { b: number; weight: number; modulus: number; docks: number }

type Setup = {
  u: [number, number]
  M0: number
  edge: number
  mu: number
  g0: number
  table: GreenTable
}

const greenOf = (s: Setup, dx: number, dy: number, dz: number): number =>
  s.g0 - greenAt(s.table, dx, dy, dz)

// the tracked line for nuclei on the x axis (one at 0 for the atom), parity +1 (gerade) or -1 (ungerade)
function readLevel(
  s: Setup,
  aB: number,
  N: number,
  R: number | null,
  parity: 1 | -1,
): Read {
  const nuclei = R === null ? [0] : [-Math.floor(R / 2), R - Math.floor(R / 2)]
  const ball = capsuleBall(
    Math.min(...nuclei),
    Math.max(...nuclei),
    REGION * aB,
  )
  const alpha = (24 * Math.PI) / (s.mu * aB)
  const Eb = 1 / (2 * s.mu * aB * aB)
  const phi = ball.points.map(p =>
    nuclei.reduce((t, x) => t + alpha * greenOf(s, p[0]! - x, p[1]!, p[2]!), 0),
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
  const spacing = (2 * Math.PI) / N
  const center = s.edge + ((WINDOW[0] + WINDOW[1]) / 2) * Eb
  const L = Math.ceil(((WINDOW[1] - WINDOW[0]) * Eb) / spacing) + 1
  const lines = harmonicLines(c, center, L, spacing).filter(
    l =>
      Math.abs(l.modulus - 1) < GENUINE &&
      (l.E - s.edge) / Eb >= WINDOW[0] &&
      (l.E - s.edge) / Eb <= WINDOW[1],
  )

  if (lines.length === 0) {
    return { b: NaN, weight: 0, modulus: NaN, docks: ball.points.length }
  }

  const top = lines.reduce((x, y) => (y.weight > x.weight ? y : x))

  return {
    b: top.E - s.edge,
    weight: top.weight,
    modulus: top.modulus,
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
      `a_B ${plan.aB} ${parity > 0 ? 'g' : 'u'} R ${R}: b ${read.b.toFixed(9)} w ${read.weight.toFixed(4)} |u|-1 ${(read.modulus - 1).toExponential(2)} docks ${read.docks} e ${e.toFixed(6)}`,
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

export function registerMemberH2plusRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
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

  // ---------------- I1: the instrument ----------------
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
    log(
      `a_B ${plan.aB} atom: b ${atom.b.toFixed(9)} (${(atom.b * 2 * mu * plan.aB * plan.aB).toFixed(5)} E_b) w ${atom.weight.toFixed(4)} docks ${atom.docks}`,
    )
    curves.push(curve(s, plan, plan.gerade, 1, atom, log))

    if (plan.ungerade.length > 0) {
      control = curve(s, plan, plan.ungerade, -1, atom, log)
    }
  }

  const [weak, main] = curves as [Curve, Curve]
  const T1 =
    atoms.every(a => a.weight >= TRACK_WEIGHT) &&
    curves.every(c => c.points.every(p => p.read.weight >= TRACK_WEIGHT))
  const ues = control!.points.map(p => p.e)
  const C1 = ues.every((x, k) => k === 0 || x < ues[k - 1]!)
  const inBand = (c: Curve): boolean =>
    c.interior &&
    c.Rmin >= BAND.R[0] &&
    c.Rmin <= BAND.R[1] &&
    c.D >= BAND.D[0] &&
    c.D <= BAND.D[1]
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
    ((main.Rmin < BAND.R[0] || main.Rmin > BAND.R[1]) &&
      !(weak.interior && offR(main) < offR(weak)))
  const status =
    !I1 || !T1 || P1 || !H1 ? 'fail' : !C1 || !H2 ? 'partial' : 'pass'

  log(
    `status ${status}: I1 ${I1} T1 ${T1} C1 ${C1} H1 ${H1} H2 ${H2} P1 ${P1}; a_B 3 R_min ${main.Rmin.toFixed(4)} a_B D ${main.D.toFixed(5)}; a_B 2.5 R_min ${weak.Rmin.toFixed(4)} D ${weak.D.toFixed(5)}`,
  )

  const metrics: Record<string, number> = {
    instrumentCycle: i1,
    muAxis,
    muFace,
    muExpected: mu,
  }

  curves.forEach(c => {
    const t = `aB${c.aB}`

    metrics[`${t}_atomBindingOverEb`] = c.atom.b * 2 * mu * c.aB * c.aB
    metrics[`${t}_atomWeight`] = c.atom.weight
    metrics[`${t}_interior`] = c.interior ? 1 : 0
    metrics[`${t}_RminOverAB`] = c.Rmin
    metrics[`${t}_emin`] = c.emin
    metrics[`${t}_depth`] = c.D
    c.points.forEach(p => {
      metrics[`${t}_e_R${p.R}`] = p.e
      metrics[`${t}_w_R${p.R}`] = p.read.weight
    })
  })
  control!.points.forEach(p => {
    metrics[`ungerade_e_R${p.R}`] = p.e
  })

  return verdict({
    status,
    claim: `one register member on two fixed husk-Coulomb sources: at a_B 3 the bonding level's total energy has ${main.interior ? `a minimum at R = ${main.Rmin.toFixed(3)} a_B with depth ${main.D.toFixed(4)} of the atom's binding` : 'no interior minimum'} (continuum ${CONTINUUM.Rmin} and ${CONTINUUM.D}), at a_B 2.5 ${weak.interior ? `${weak.Rmin.toFixed(3)} a_B and ${weak.D.toFixed(4)}` : 'no interior minimum'}; the antibonding control ${C1 ? 'falls monotonically' : 'does not fall monotonically'}`,
    metrics,
    control: {
      continuumRmin: CONTINUUM.Rmin,
      continuumDepth: CONTINUUM.D,
      ungerademonotone: C1 ? 1 : 0,
    },
    notes: `L2. I1 ${I1}, T1 ${T1}, C1 ${C1}, H1 ${H1}, H2 ${H2}, P1 ${P1}. The light member m ${m.toFixed(6)} (u = ringUnit(${LIGHT.join(', ')})), mu = 4 tan m, the vector form, fixed sources (stand-in nuclei) on the husk quotient, harmonic inversion of the autocorrelation.`,
  })
}

export default experiment({
  id: 'spin/register-member-h2plus',
  code: 'E-SPN-0187',
  title:
    'H2+ with one register member on two fixed husk-Coulomb sources (not yet run)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerMemberH2plusRun()
  },
})
