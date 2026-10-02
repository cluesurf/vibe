// EMISSION SETS THE SHARE? (E-FRC-0288, OPEN-LGT-02; the route "emission sets the share" in roadmap/routes/mind-whole-
// engine-techniques.md, section "Q · no free parameters"). The light's split rho = f / s (the force's share over the
// drift's at fixed coupling kappa = s f) is undecided between the average reading 0.4613818 and the worst-register
// reading 0.4146386 (E-FRC-0269). For the free light the split is a constant change of units (E-FRC-0276): the beat at
// one split is the beat at the other conjugated by one fixed matrix, and the split moves only a mode's e / x share, by
// exactly rho1 / rho2 = 1.1127. The route: with matter coupled, the share the matter emits into is fixed by the
// member, not by units, so the split at which the emitted share and the vacuum's share agree is chosen by the coupled
// system. Its kill: the emitted share scales with rho exactly as the vacuum's does.
//
// WHAT IS RUN. A STAND-IN emitter, a harmonic oscillator of gap delta per beat (the single-excitation reading of a
// two-level member, exact for a harmonic one), coupled at one husk link (dock 0, axis 0) to the linear husk light on a
// side-12 husk torus (code/measure/emission-share; the light is E-FRC-0276's beat x <- x + s e, e <- e - f C^T N C W x
// in real space, 15,552 links and 34,560 triangles), kappa = 1/16 in G's units (kappa mu_max = 2, stable). The member
// starts excited, (q, p) = (0, 1), the light empty. How matter couples in the code:
//  - through the field E: the ladder's STAND-IN atom (code/rule/plaquette-ladder, E-FRC-0233) couples in the drift
//    phase zeta^(-c bal(x + R)^2), a complete square in the rung's field R whose strength g = 4 pi c / M carries the
//    drift exponent, so g is proportional to s. Here: the link's energy completed to (s w / 2)(e + gE q / (s w))^2,
//    H = gE q e + gE^2 q^2 / (2 s w), with gE split-free ("E fixed") or gE proportional to s ("E drift", the ladder's).
//  - through the potential A: the register member's covariant Clifford hop H = M beta + K alpha (OPEN-LGT-12,
//    E-SPN-0180) carries the link field as a phase on the hop, the Peierls coupling, whose charge (1/3) does not
//    depend on the split. Here: minimal coupling of the emitter, delta ((p - gA x)^2 + q^2) / 2, gA split-free
//    ("A fixed"). A bare gA p x without the A^2 term is unbounded below and runs away (probe 1).
//  - both at once with split-free weights ("mixed").
// Every coupling step is its own exact time-one flow (a shear), so the coupled beat is exactly symplectic.
//
// THE SHARE. As E-FRC-0269 reads a fill: sigma = (mean over links of e^2) / (mean over triangles of B^2), B = C W x,
// averaged over beats 200 to 399 of a 400-beat run, on the whole box and on the far field (docks beyond distance 3 of
// the emitter: the radiated light, without the emitter's bound near field). The emitted light's own balance is
// rho_em = rho / sigma, the split at which the emitted light would fill link and plaquette registers alike. The
// vacuum's share is sigma_vac = rho / rho_vac, rho_vac the vacuum's balance on the box's own momenta (E-FRC-0269's
// average, husk-balance averageFills). The route's agreement is sigma = sigma_vac, that is rho_em = rho_vac. The
// departure read at the two splits is D = (sigma(rho1) / sigma(rho2)) / (rho1 / rho2) - 1: D = 0 is the kill.
//
// DERIVED BEFORE THE GATE RUN.
//  1. THE COUPLED UNIT CHANGE. With x = sqrt(s) a and e = b / sqrt(s) (a canonical change: (x, W e) to (a, W b)) the
//     light's energy is kappa-only. The E coupling becomes (gE / sqrt s) q b + (gE / sqrt s)^2 q^2 / (2 w) and the A
//     coupling delta ((p - gA sqrt(s) a)^2 + q^2) / 2: each keeps its form, with its strength rescaled. So the coupled
//     beat at rho1 with (gE, gA) equals diag(1, M) times the coupled beat at rho2 with (gE sqrt(s2 / s1), gA sqrt(s1 /
//     s2)) times diag(1, M)^-1, M = diag(sqrt(s1 / s2), sqrt(s2 / s1)) on (x, e), exactly, at every beat. The same
//     holds for the quantum light: the change is a squeeze that maps the light's vacuum at fixed kappa to itself.
//  2. ONE FIELD ONLY: CARRIED ALONG. A coupling through E alone or A alone is, at the other split, the same coupling
//     with a different strength (canonical strength gE / sqrt s, or gA sqrt s). At first order in the strength the
//     emitted light is that strength times a response with no rho in it, and sigma, a ratio of two quadratics, is rho
//     times a rho-free number: D = 0 at first order, BY THEOREM, for every member. What is left is the strength's
//     change between the splits (canonical strength squared moves by s2 / s1 = 1.0549 for E fixed, by s1 / s2 for A
//     fixed and E drift), which enters only through the member's back-reaction (decay, level shift): D = O(g^2), of
//     opposite sign for E fixed and E drift. A coupling written in the rescaled units (gE proportional to sqrt s, or
//     gA to 1 / sqrt s) has one canonical strength at both splits, so D = 0 at every order, at every beat: the brief's
//     control.
//  3. TWO FIELDS: NOT CARRIED. A coupling through E and A with split-free weights changes its canonical E / A mix by
//     s1 / s2 = 0.948 between the splits, so its first-order response is not one rho-free response and D need not
//     vanish as g -> 0. But a free mode of frequency omega shares its fill as the free light does (E-FRC-0276), so the
//     radiated part (the far field) can depart only through the spectrum it is emitted into, which the gap fixes; the
//     near field, bound to the member, can depart at first order.
//  4. SO THE ROUTE DIES BY THEOREM for every single-field coupling, and both couplings the code has (the ladder's
//     drift-phase dipole, the Clifford hop's Peierls phase) are single-field: at the two splits the emitted share
//     moves by rho1 / rho2 as the vacuum's does, up to an O(g^2) term that is a change of coupling strength, not an
//     agreement. The agreement rho_em = rho_vac then holds at both splits or at neither: it is a condition on the
//     member (its gap), not on the split.
// PREDICTED: the kill fires (D = O(g^2) for E fixed, E drift, A fixed; D at roundoff for the rescaled control).
//
// PROBES BEFORE THE GATES (disclosed; tmp/em-probe1.ts to em-probe3.ts, with logs em-probe2.log, em-probe3.log).
//  - Probe 1 (side 12, 200 beats): a bare A coupling gA p x ran away (emitter energy 3e7): the gauge line of x has no
//    stiffness, so the A^2 term is required; the bare E coupling (no self-energy) gave departures of 1e-3 to 4e-2 that
//    did not fall with g, from its order-g^2 level shift (gE^2 f K_ll / w, a few percent of delta) dephasing the two
//    splits over the run. Both couplings were then written as complete squares (above).
//  - Probe 2 (400 beats, delta = 0.5, g = 0.2 to 0.025), with the complete squares: E fixed D (whole, far) = -4.6e-4,
//    -9.1e-5 at g = 0.05 and -1.2e-4, -2.3e-5 at 0.025 (each a quarter); A fixed 2.3e-5, 1.0e-5 and 6.0e-6, 2.5e-6;
//    E drift the mirror of E fixed; the rescaled control at 1e-12; mixed whole 1.8e-3 and 2.1e-3 (not falling), far
//    -1.1e-4 and -5.6e-5.
//  - Probe 3: the far-field rho_em at rho1, E fixed g = 0.05: 0.495, 0.493, 0.486, 0.465, 0.385, 0.406 at delta =
//    0.25, 0.5, 0.6, 0.75, 1.0, 1.25; the vacuum balance on the side-12 box's momenta 0.4613753 (0.4613818 on the
//    midpoint grids).
//
// HYPOTHESES AND GATES, fixed before the gate run (delta = 0.5 unless stated; g = 0.1, 0.05, 0.025).
//  I1 THE INSTRUMENT, THE CONJUGATION: for E fixed, A fixed and mixed at g = 0.05, the run at rho1 and the run at rho2
//     with (gE sqrt(s2 / s1), gA sqrt(s1 / s2)) agree through diag(1, M): max |x1 - sqrt(s1 / s2) x2| / max |x1| and
//     the same for e are <= 1e-9, and the emitters' final energies agree to 1e-9.
//  I2 EMISSION HAPPENS: at g = 0.1 the emitter's final energy is at most 0.9 of its start for E fixed, A fixed and
//     mixed, at both splits.
//  C0 THE BRIEF'S CONTROL (a coupling in the rescaled units: gE = g sqrt(s / s1), and gA = g sqrt(s1 / s)): |D| <=
//     1e-10, whole and far, at every g.
//  C1 THE INSTRUMENT READS THE OTHER OUTCOME: a member whose gap moves with the split (E rescaled, g = 0.05, delta =
//     0.5 at rho1 and 0.75 at rho2): |D_far| >= 1e-2.
//  H1 THE ROUTE: for some single-field split-free coupling (E fixed, E drift, A fixed) the share does not follow rho:
//     |D| >= 1e-3 at g = 0.025 (whole or far), or |D(0.025)| > 0.5 |D(0.05)| with |D(0.05)| >= 1e-6.
//  P1 THE FALSIFIER (the kill): for E fixed, E drift and A fixed, |D| <= 2e-3 at every g, whole and far, and it falls
//     as g^2: |D(0.025)| <= 0.35 |D(0.05)| (or both below 1e-9), whole and far; and for mixed, |D_far| <= 2e-3 at
//     every g.
//  M1 REPORTED, NOT IN THE VERDICT (item 3): mixed's whole-box D does not fall as g^2 (|D(0.025)| > 0.35 |D(0.05)|).
// READ: rho_em (far) at both splits over the gaps delta = 0.25, 0.5, 0.75, 1.0, 1.25 (E fixed, g = 0.05), and where it
// meets 0.4614 and 0.4146 (linear interpolation in delta): the gap at which the emitted light balances as each
// candidate does.
// VERDICT, fixed before the gate run: FAIL (as derived, the route killed) when I1, I2, C0, C1 and P1 hold; PASS when
// I1, I2, C0, C1 and H1 hold and P1 does not; PARTIAL otherwise (an instrument or control gate failing, or neither
// H1 nor P1 holding).
//
// WHAT THIS CAN AND CANNOT SHOW. It can show that on the linear husk light no coupling through one field moves the
// emitted share off rho's own scaling, which is what the kill names, and it reads the size of the strength term. It
// cannot speak for the integer rule: there the registers have a capacity and a seam, a change of units does not map
// integers to integers, and the split is a statement about where a register wraps (E-FRC-0269, E-FRC-0286), which no
// linear reading touches. The emitter is a STAND-IN (a harmonic oscillator on one link), not the register member, so
// the member's own gap, and with it its rho_em, is not read. Depth L2: float dynamics, residuals reported.
//
// DETERMINISM: no random numbers; every run starts from the same state.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  emissionBox,
  runEmission,
  type EmissionRead,
} from '@/code/measure/emission-share'
import { averageFills, huskLight } from '@/code/measure/husk-balance'

const RHO1 = 0.4613818491
const RHO2 = 0.4146386
const KAPPA = 1 / 16
const SIDE = 12
const BEATS = 400
const WINDOW: readonly [number, number] = [200, 400]
const FAR = 3
const DELTA = 0.5
const STRENGTHS = [0.1, 0.05, 0.025]
const GAPS = [0.25, 0.5, 0.75, 1.0, 1.25]

const flag = (b: boolean): number => (b ? 1 : 0)
const sOf = (rho: number): number => Math.sqrt(KAPPA / rho)

type Coupling = {
  name: string
  // the couplings (gE, gA) at a split, from the base strength g
  at: (rho: number, g: number) => [number, number]
}

const COUPLINGS: Coupling[] = [
  { name: 'E fixed', at: (_rho, g) => [g, 0] },
  { name: 'E drift', at: (rho, g) => [(g * sOf(rho)) / sOf(RHO1), 0] },
  { name: 'A fixed', at: (_rho, g) => [0, g] },
  { name: 'mixed', at: (_rho, g) => [g, g] },
  {
    name: 'E rescaled',
    at: (rho, g) => [g * Math.sqrt(sOf(rho) / sOf(RHO1)), 0],
  },
  {
    name: 'A rescaled',
    at: (rho, g) => [0, g * Math.sqrt(sOf(RHO1) / sOf(rho))],
  },
]

export default experiment({
  id: 'gauge/emission-share',
  code: 'E-FRC-0288',
  title: 'emission sets the share (pending the first run)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return emissionShareRun()
  },
})

function emissionShareRun(): Verdict {
  const started = Date.now()
  const box = emissionBox(SIDE)
  const L = box.bulk.huskLinks
  const P = box.bulk.huskTriangles
  const farLinks = Array.from(box.linkDistance).filter(d => d > FAR).length
  const farTriangles = Array.from(box.triangleDistance).filter(
    d => d > FAR,
  ).length

  const run = (
    rho: number,
    gE: number,
    gA: number,
    delta = DELTA,
  ): EmissionRead => {
    const s = sOf(rho)

    return runEmission(box, {
      s,
      f: KAPPA / s,
      delta,
      gE,
      gA,
      beats: BEATS,
      window: WINDOW,
      far: FAR,
    })
  }

  const shares = (r: EmissionRead): { whole: number; far: number } => ({
    whole: r.linkFill / L / (r.plaquetteFill / P),
    far: r.farLinkFill / farLinks / (r.farPlaquetteFill / farTriangles),
  })

  const departure = (
    a: EmissionRead,
    b: EmissionRead,
  ): { whole: number; far: number } => {
    const sa = shares(a)
    const sb = shares(b)
    const ratio = RHO1 / RHO2

    return {
      whole: sa.whole / sb.whole / ratio - 1,
      far: sa.far / sb.far / ratio - 1,
    }
  }

  // ---------------- the vacuum's balance on the box's own momenta ----------------
  const husk = huskLight()
  const fills = averageFills(husk.light, SIDE, { w: husk.w, n: husk.n }, 0)
  const mean = (xs: number[]): number =>
    xs.reduce((x, y) => x + y, 0) / xs.length
  const rhoVac =
    mean(fills.Pi.map((x, t) => x / husk.n[t]!)) /
    mean(fills.pi.map((x, l) => x / husk.w[l]!))

  // ---------------- every coupling at both splits and every strength ----------------
  type Row = {
    name: string
    g: number
    a: EmissionRead
    b: EmissionRead
    D: { whole: number; far: number }
  }

  const rows: Row[] = []

  for (const c of COUPLINGS) {
    for (const g of STRENGTHS) {
      const a = run(RHO1, ...c.at(RHO1, g))
      const b = run(RHO2, ...c.at(RHO2, g))

      rows.push({ name: c.name, g, a, b, D: departure(a, b) })
    }
  }

  const row = (name: string, g: number): Row =>
    rows.find(r => r.name === name && r.g === g)!

  // ---------------- I1: the conjugation ----------------
  const s1 = sOf(RHO1)
  const s2 = sOf(RHO2)
  const conjugation: Record<string, number> = {}

  let I1 = true

  for (const [name, gE, gA] of [
    ['E fixed', 0.05, 0],
    ['A fixed', 0, 0.05],
    ['mixed', 0.05, 0.05],
  ] as const) {
    const a = run(RHO1, gE, gA)
    const b = run(RHO2, gE * Math.sqrt(s2 / s1), gA * Math.sqrt(s1 / s2))
    const rel = (u: Float64Array, v: Float64Array, k: number): number => {
      let top = 0
      let diff = 0

      for (let i = 0; i < u.length; i++) {
        top = Math.max(top, Math.abs(u[i]!))
        diff = Math.max(diff, Math.abs(u[i]! - k * v[i]!))
      }

      return diff / top
    }
    const dx = rel(a.x, b.x, Math.sqrt(s1 / s2))
    const de = rel(a.e, b.e, Math.sqrt(s2 / s1))
    const dm = Math.abs(a.emitterEnd - b.emitterEnd)

    conjugation[`${name} x`] = dx
    conjugation[`${name} e`] = de
    conjugation[`${name} emitter`] = dm
    I1 &&= dx <= 1e-9 && de <= 1e-9 && dm <= 1e-9
  }

  // ---------------- I2: emission happens ----------------
  let I2 = true

  for (const name of ['E fixed', 'A fixed', 'mixed']) {
    const r = row(name, 0.1)

    I2 &&= r.a.emitterEnd <= 0.9 * 0.5 && r.b.emitterEnd <= 0.9 * 0.5
  }

  // ---------------- C0: the rescaled couplings ----------------
  let C0 = true
  let c0Worst = 0

  for (const name of ['E rescaled', 'A rescaled']) {
    for (const g of STRENGTHS) {
      const { D } = row(name, g)

      c0Worst = Math.max(c0Worst, Math.abs(D.whole), Math.abs(D.far))
    }
  }

  C0 = c0Worst <= 1e-10

  // ---------------- C1: a gap that moves with the split ----------------
  const c1 = departure(
    run(RHO1, ...COUPLINGS[4]!.at(RHO1, 0.05), 0.5),
    run(RHO2, ...COUPLINGS[4]!.at(RHO2, 0.05), 0.75),
  )
  const C1 = Math.abs(c1.far) >= 1e-2

  // ---------------- H1 and P1 ----------------
  const single = ['E fixed', 'E drift', 'A fixed']
  const parts = ['whole', 'far'] as const

  let H1 = false
  let P1 = true
  let p1Worst = 0
  let p1Fall = 0

  for (const name of single) {
    for (const part of parts) {
      const d05 = Math.abs(row(name, 0.05).D[part])
      const d025 = Math.abs(row(name, 0.025).D[part])

      if (d025 >= 1e-3 || (d025 > 0.5 * d05 && d05 >= 1e-6)) {
        H1 = true
      }

      for (const g of STRENGTHS) {
        const d = Math.abs(row(name, g).D[part])

        p1Worst = Math.max(p1Worst, d)
        P1 &&= d <= 2e-3
      }

      const falls = d025 <= 0.35 * d05 || (d025 <= 1e-9 && d05 <= 1e-9)

      p1Fall = Math.max(p1Fall, d05 > 0 ? d025 / d05 : 0)
      P1 &&= falls
    }
  }

  let mixedFar = 0

  for (const g of STRENGTHS) {
    mixedFar = Math.max(mixedFar, Math.abs(row('mixed', g).D.far))
  }

  P1 &&= mixedFar <= 2e-3

  const mixedWhole05 = Math.abs(row('mixed', 0.05).D.whole)
  const mixedWhole025 = Math.abs(row('mixed', 0.025).D.whole)
  const M1 = mixedWhole025 > 0.35 * mixedWhole05

  // ---------------- READ: rho_em over the gaps ----------------
  const scan = GAPS.map(delta => {
    const a = shares(run(RHO1, 0.05, 0, delta))
    const b = shares(run(RHO2, 0.05, 0, delta))

    return {
      delta,
      em1: RHO1 / a.far,
      em2: RHO2 / b.far,
      whole1: RHO1 / a.whole,
    }
  })
  const crossing = (target: number): number[] => {
    const out: number[] = []

    for (let i = 0; i + 1 < scan.length; i++) {
      const u = scan[i]!.em1 - target
      const v = scan[i + 1]!.em1 - target

      if (u === 0 || u * v < 0) {
        out.push(
          scan[i]!.delta +
            ((scan[i + 1]!.delta - scan[i]!.delta) * u) / (u - v),
        )
      }
    }

    return out
  }
  const crossAverage = crossing(RHO1)
  const crossWorst = crossing(RHO2)

  const gates = I1 && I2 && C0 && C1
  const status: Verdict['status'] = !gates
    ? 'partial'
    : P1
      ? 'fail'
      : H1
        ? 'pass'
        : 'partial'
  const e = (x: number): string => x.toExponential(2)
  const seconds = (Date.now() - started) / 1000
  const rowText = (r: Row): string =>
    `${r.name} g ${r.g}: D whole ${e(r.D.whole)} far ${e(r.D.far)}, rho_em far ${(RHO1 / shares(r.a).far).toFixed(5)} / ${(RHO2 / shares(r.b).far).toFixed(5)}, emitter end ${r.a.emitterEnd.toFixed(3)} / ${r.b.emitterEnd.toFixed(3)}`
  const metrics: Record<string, number> = {
    I1: flag(I1),
    I2: flag(I2),
    C0: flag(C0),
    C1: flag(C1),
    H1: flag(H1),
    P1: flag(P1),
    M1: flag(M1),
    rhoVac,
    c0Worst,
    c1Far: c1.far,
    p1Worst,
    p1Fall,
    mixedFar,
    mixedWhole05,
    mixedWhole025,
    conjugationWorst: Math.max(...Object.values(conjugation)),
    seconds,
  }

  for (const r of rows) {
    const key = `${r.name.replace(' ', '')}_g${r.g}`

    metrics[`${key}_Dwhole`] = r.D.whole
    metrics[`${key}_Dfar`] = r.D.far
  }

  scan.forEach(x => {
    metrics[`rhoEm_far_d${x.delta}_avg`] = x.em1
    metrics[`rhoEm_far_d${x.delta}_worst`] = x.em2
  })

  return verdict({
    status,
    claim: `I1 ${I1} (conjugated runs agree to ${e(Math.max(...Object.values(conjugation)))}); I2 ${I2}; C0 ${C0} (rescaled couplings |D| <= ${e(c0Worst)}); C1 ${C1} (gap moved with the split: D far ${e(c1.far)}); H1 ${H1}; P1 ${P1} (single-field |D| <= ${e(p1Worst)}, D(0.025) / D(0.05) <= ${p1Fall.toFixed(3)}; mixed far |D| <= ${e(mixedFar)}); M1 ${M1} (mixed whole |D| ${e(mixedWhole05)} at 0.05, ${e(mixedWhole025)} at 0.025); vacuum balance on the box ${rhoVac.toFixed(7)}`,
    metrics,
    control: { c0Worst, c1Far: c1.far },
    notes: `L2. Side ${SIDE} husk torus (${L} links, ${P} triangles; far field ${farLinks} links, ${farTriangles} triangles beyond distance ${FAR}), kappa ${KAPPA}, delta ${DELTA}, ${BEATS} beats, fills averaged over beats ${WINDOW[0]} to ${WINDOW[1] - 1}. D = (sigma(rho1) / sigma(rho2)) / (rho1 / rho2) - 1. ${rows.map(rowText).join('; ')}. Conjugation: ${Object.entries(
      conjugation,
    )
      .map(([k, v]) => `${k} ${e(v)}`)
      .join(', ')}. Gap scan (E fixed, g 0.05), rho_em far at avg / worst split (whole at avg): ${scan
      .map(
        x =>
          `delta ${x.delta}: ${x.em1.toFixed(5)} / ${x.em2.toFixed(5)} (${x.whole1.toFixed(5)})`,
      )
      .join('; ')}. rho_em far meets 0.4614 at delta ${crossAverage.map(x => x.toFixed(3)).join(', ') || 'none'} and 0.4146 at delta ${crossWorst.map(x => x.toFixed(3)).join(', ') || 'none'}. ${seconds.toFixed(0)} s.`,
  })
}
