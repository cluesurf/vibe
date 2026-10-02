// The first law from numbers on hand (E-GRV-0151), route H10a (note/research/vibe/roadmap/routes/
// gravity-cosmos-heat-classical.md, H · Hawking radiation): "dM = T dS ties Hawking's T to Bekenstein's S. The membrane
// gives S per cut link (18.18 nats, E-GRV-0131) and the headroom horizon gives T·M flat to 1.7% (E-GRV-0123). Check
// whether T dS/dM = 1 across the existing M, with no new run." Kill, in the route's words: "T dS/dM is far from 1 and not
// a function of C alone."
//
// WHAT IS RUN. No light and no beat. The quantities are recomputed with the two experiments' own instruments, which are
// cheap: the box-free unit profile (side 64, E-GRV-0118/0122/0123/0131 all build it the same way), the room horizon on
// E-GRV-0131's husk mesh (side 48, 2 layers, centered) and its membrane plan (the cut links), at E-GRV-0131's nine
// horizons r_h = 3.5 .. 20.5.
//
// WHAT M, T AND S ARE, AND IN WHICH UNITS.
//  - M. In both experiments M = CAP / profile(r_h), CAP = 1.5: the source strength, in units of the unit profile's
//    source, at which the placed potential e = M profile(r) fills the register's capacity at r_h. E-GRV-0123 computes
//    `CAP / profile.at(rh)` (code line `const m = ...`), E-GRV-0131 the same expression, on the same profile. So the two
//    M are THE SAME OBJECT, one function of r_h; their ranges do not overlap (E-GRV-0131 M 502 .. 2955, E-GRV-0123 M
//    115372 .. 230672). Neither experiment gives M an energy unit. E-GRV-0131 defines G by r_h = 2 G M, 1 / 4G = CAP /
//    (2 k_u), k_u = r_h profile(r_h), in docks per unit of M.
//  - T. E-GRV-0123's T is kappa / 2 pi: the light's measured e-folding rate in the band, and beside it the profile's
//    kappa = c0 s / (2 r_h) (code/measure/headroom-horizon profileKappa, s the profile's log slope), in inverse beats at
//    D0 = 2 (c0 = 0.2309 docks a beat). A beat's length depends on D0 (the gauge resolution), so a T in inverse beats is
//    not a property of the horizon. Here T is the profile's kappa / 2 pi with c0 = 1: inverse docks, the light's time
//    for one dock as the unit (c = 1, hbar = k_B = 1). E-GRV-0123's light read 1.7 and 3.3 percent under the profile at
//    its deep r_h; at E-GRV-0131's small r_h the light's T M spread 0.127 (E-GRV-0122), so the light is not a usable
//    thermometer there and the profile's kappa is the only T on hand at these M.
//  - S. E-GRV-0131's S = T_cut ln(span): every cut-link step register is hidden and takes every one of span = 3 x 297^3
//    values; ln(span) = 18.18 nats. Dimensionless.
//  - THE UNIT OF M. T dS/dM has the unit of T over the unit of M. It is a pure number only if a unit of M is an energy;
//    the convention here, the one under which E-GRV-0131 compared S / A with 1 / 4G, is that one unit of M is one inverse
//    dock (hbar = c = 1 in dock units). If a unit of M carried energy eps instead, T dS/dM reads 1 / eps times what is
//    reported. So "T dS/dM = 1" is a statement in that convention; "T dS/dM constant across M" is not convention bound.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE SLOPE CANCELS. dM/dr_h = M s / r_h and T = s / (4 pi r_h), so T dS/dM = (dS/dr_h) / (4 pi M) exactly, whatever
//    the profile's slope. With S = sigma 4 pi r_h^2 and r_h = 2 G M this is 4 G sigma = (S / A) / (1 / 4G): the first-law
//    reading and E-GRV-0131's reported S / A against 1/4G (1.439 .. 1.472) are the same number up to how sigma and G vary
//    with r_h. Predicted: T dS/dM near 1.45 at every M.
// 2. THE REGISTER C DOES NOT ENTER. The room is C - floor(C e / CAP), zero exactly when e >= CAP, so the horizon's docks,
//    T_cut and kappa do not depend on C (243 in E-GRV-0131, 1539 in E-GRV-0123); S depends on the step register's span
//    only, linearly in ln(span). So at fixed registers T dS/dM = ln(span) / l with l = ln(span) / (T dS/dM) the nats a
//    cut link would need; l is a lattice number (cut links per area) times 1/4G. If T dS/dM is constant across M it is a
//    function of the registers alone; if it varies with M at fixed registers it is not.
// 3. THE READING. T_cut is a lattice count, so a finite difference between neighbouring horizons is a staircase. dS/dM is
//    read from a least-squares power law S = a M^p over the nine horizons (E-GRV-0131's exponent in r_h was 1.994), at
//    each M: T dS/dM = T(M) p a M^(p - 1). The neighbour and the centered differences are reported beside.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/fl-probe1.ts, 13 s). At 17 radii 3.5 .. 20.5 (the nine and eight between) it
//  printed M, T_cut, |H|, the profile slope, T M in inverse docks (11.82 at r_h 3.5, 11.47 from r_h 14.5 on), S / A over
//  1 / 4G (1.389 .. 1.472 on all 17, 1.439 .. 1.472 on the nine), the neighbour differences (1.16 .. 1.81) and centered
//  ones (1.39 .. 1.55), T_cut equal at C = 243 and 1539 everywhere, and the profile T M at E-GRV-0123's r_h at D0 = 2
//  (2.6487 at both). So H1 below was seen to miss before the gates were written; the gates hold the route to its words.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: the recomputation reads what the two experiments read. At E-GRV-0131's nine r_h: S / T_cut = ln(span)
//     = 18.1798 to 1e-4; T_cut 882, 8010, 30306 at r_h 3.5, 10.5, 20.5; M 502 and 2955 at the ends (to 1); S / (4 pi
//     r_h^2) over 1 / 4G within 0.001 of 1.439 at its least and 1.472 at its most. At E-GRV-0123's r_h 800.5 and
//     1600.5: M 115372 and 230672 (to 1) from the same expression, and the profile's T M at c0 = roomSpeed(2) is 2.649 at
//     both (to 1e-3), E-GRV-0123's "profile's 2.649".
//  I2 C does not enter: at each of the nine r_h the horizon and T_cut at C = 1539 equal those at C = 243.
//  C1 CONTROL, the other outcome: the same reading on E-GRV-0124's held-tear count (the volume law, S = 9 |H| ln(3 span)
//     + T_cut (ln span - ln 3) / 2, which E-GRV-0131's C1 reproduced to 2e-16) varies across the nine M by more than 10
//     percent (max / min - 1): the reading can see a T dS/dM that is not constant.
//  C2 CONTROL, the reading can read 1: on S_B = A / 4G with E-GRV-0131's own G at each r_h (S_B = 4 pi r_h^2 CAP / (2
//     k_u)), the same fitted reading is within 5 percent of 1 at every M (derived: (s + 1) / 2 for the exact derivative,
//     s = 0.989 .. 1.036 here).
//  H1 THE FIRST LAW, in the convention above: T dS/dM within 10 percent of 1 at every one of the nine M.
//  P1 FALSIFIER, the route's kill: T dS/dM off 1 by more than 10 percent at some M AND varying across the nine M by more
//     than 10 percent (max / min - 1), i.e. not fixed by the registers at fixed registers.
// VERDICT: pass if I1, I2, C1, C2 and H1 hold; partial if I1, I2, C1, C2 hold, H1 fails and P1 does not fire (the first
// law holds up to one constant set by the registers, the route survives in that form); fail if P1 fires or an
// instrument or control gate fails.
// REPORTED: per M, T, S, T dS/dM (fitted, neighbour, centered), l = ln(span) / (T dS/dM) against 4 pi, the energy of one
// unit of M that the first law would ask (eps = T dS/dM inverse docks), and the light's T (E-GRV-0123: 0.983 and 0.967
// of the profile's at its deep M, carried as stated numbers, not recomputed: that run takes 886 s).
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether Hawking's T (the profile's surface gravity) and the membrane's S
// obey dM = T dS across E-GRV-0131's M, in a stated unit of M, and whether the mismatch is a single constant. It cannot
// fix the unit of M: no experiment on hand gives M an energy, so a constant mismatch is equivalently a statement about
// that unit or about the nats a cut link holds. It does not test the light's T at these M, and it says nothing at
// E-GRV-0123's M, where no membrane was built (the meshes do not reach r_h 800). The horizon is placed, not formed.
//
// FIRST RUN 2026-10-02 (tmp/fl-run1.log, 18 s): PARTIAL, as the probe showed: I1, I2, C1, C2 hold, H1 fails, P1 does not
// fire; no gate moved.
//  - I1: S / T_cut = 18.1798 at all nine; T_cut 882, 8010, 30306; M 502.1 .. 2954.6; S / A over 1/4G 1.4389 .. 1.4717;
//    E-GRV-0123's M 115372.0 and 230672.0 and its profile T M 2.6487 a beat at D0 2 (11.4691 a dock), from the same
//    expression on the same profile. I2: the horizon and T_cut are the same at C = 243 and 1539 at every r_h.
//  - THE READING: S = a M^p with p = 1.9940; T dS/dM = 1.5015, 1.4831, 1.4699, 1.4589, 1.4463, 1.4382, 1.4316, 1.4431,
//    1.4412 at M 502 .. 2955 (mean 1.4571, spread 0.0488); neighbour differences 1.402 .. 1.532, centered 1.438 ..
//    1.562. The drift is T M's (11.82 at r_h 3.5 to 11.36 at 12.5, then 11.47 where the profile is 1 / r): the
//    profile's own surface gravity is not quite 1 / 4GM at the smallest horizons.
//  - C1: the held tear's volume law reads 5.16 .. 24.3 (spread 3.71): the reading sees a non-constant T dS/dM. C2:
//    A / 4G reads 0.988 .. 1.029 (worst 0.029): the reading reads 1 where it should.
//  - So dM = T dS holds across E-GRV-0131's M up to one constant factor 1.457 (to 5 percent), the same number as
//    E-GRV-0131's S / A over 1/4G, as derived. In the stated unit of M a cut link would need 12.477 nats, 0.993 of 4 pi,
//    against the 18.180 it holds; equivalently one unit of M would carry 1.457 inverse docks. With the light's T in place
//    of the profile's (E-GRV-0123's 0.983 and 0.967, read at its own deep M) the factor would be about 1.41 .. 1.43.
//    At these numbers the membrane's register (18.18 nats a link) is not the one the first law asks for (12.48, near
//    4 pi); the headroom register C does not enter the reading at all, so in this reading the e^(4 pi) coincidence
//    concerns the cut-link register's span, not C.
//
// Depth L2: arithmetic on a float profile and exact lattice counts; the reading is a fitted derivative.
// DETERMINISM: nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lapseLinks, openMesh, warpClock } from '@/code/rule/open-husk'
import { horizonRule } from '@/code/rule/horizon-husk'
import { stepRule } from '@/code/rule/step-depth'
import { membranePlan } from '@/code/rule/membrane-horizon'
import { stackModes } from '@/code/measure/open-husk'
import {
  boxFreeExcess,
  unitProfile,
} from '@/code/measure/horizon-temperature'
import {
  profileKappa,
  roomOf,
  roomSpeed,
} from '@/code/measure/headroom-horizon'
import { roomHorizon } from '@/code/measure/horizon-entropy'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const CAP = 1.5
const BASE = 243
const BASE_DEEP = 1539
const SIDE = 48
const LAYERS = 2
const R_H: readonly number[] = [
  3.5, 4.5, 5.5, 6.5, 8.5, 10.5, 12.5, 16.5, 20.5,
]
const R_DEEP: readonly number[] = [800.5, 1600.5]
const M_DEEP: readonly number[] = [115372, 230672]
const TM_DEEP = 2.649
const D0_DEEP = 2
const T_CUT_KNOWN: ReadonlyMap<number, number> = new Map([
  [3.5, 882],
  [10.5, 8010],
  [20.5, 30306],
])
const RATIO_LOW = 1.439
const RATIO_HIGH = 1.472
const LIGHT_OVER_PROFILE: readonly number[] = [0.983, 0.967]
const H1_TOLERANCE = 0.1
const P1_SPREAD = 0.1
const C1_SPREAD = 0.1
const C2_TOLERANCE = 0.05

const spreadOf = (xs: readonly number[]): number =>
  Math.max(...xs) / Math.min(...xs) - 1

// least squares ln y = ln a + p ln x
function powerFit(
  xs: readonly number[],
  ys: readonly number[],
): { a: number; p: number } {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const n = lx.length
  const mx = lx.reduce((s, v) => s + v, 0) / n
  const my = ly.reduce((s, v) => s + v, 0) / n

  let cov = 0
  let varx = 0

  for (let i = 0; i < n; i++) {
    cov += (lx[i]! - mx) * (ly[i]! - my)
    varx += (lx[i]! - mx) ** 2
  }

  const p = cov / varx

  return { a: Math.exp(my - p * mx), p }
}

export default experiment({
  id: 'gravity/first-law-check',
  code: 'E-GRV-0151',
  title:
    'the first law dM = T dS on the membrane horizon holds up to one constant, partial (H1 fails, the kill does not fire): with M = CAP / profile(r_h), the same object in E-GRV-0123 and 0131, T the profile kappa / 2 pi in inverse docks and S = T_cut ln(span), T dS/dM reads 1.432 .. 1.502 over M 502 .. 2955 (spread 4.9 percent, from the profile T M; neighbour differences 1.40 .. 1.53), the S / A over 1/4G of E-GRV-0131 as derived; a cut link would need 12.48 nats (0.993 of 4 pi) against 18.18, or a unit of M 1.457 inverse docks; the headroom register C does not enter (the horizon is the same at C 243 and 1539); the held tear reads 5.2 .. 24.3 and A / 4G within 0.029 of 1',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    const lapse = lapseLinks(openMesh(64, 1, 'shrink'))
    const modes = stackModes(lapse.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(lapse, modes), modes)
    const mesh = warpClock(openMesh(SIDE, LAYERS, 'shrink'))
    const rule = horizonRule(stepRule(DEPTH, LEVELS), BULK)
    const center = [SIDE / 2, SIDE / 2, SIDE / 2]
    const lnSpan = Math.log(rule.span)

    const rows = R_H.map(rh => {
      const m = CAP / profile.at(rh)
      const ku = rh * profile.at(rh)
      const horizon = roomHorizon(
        mesh,
        center,
        roomOf(profile, m, CAP, BASE),
      )
      const deep = roomHorizon(
        mesh,
        center,
        roomOf(profile, m, CAP, BASE_DEEP),
      )
      const plan = membranePlan(mesh, horizon)
      const planDeep = membranePlan(mesh, deep)
      const sameHorizon =
        horizon.every((v, i) => v === deep[i]) &&
        plan.cut.length === planDeep.cut.length
      const tCut = plan.cut.length
      const s = tCut * lnSpan
      const sHold =
        9 * plan.docks * Math.log(3 * rule.span) +
        (tCut * (Math.log(rule.span) - Math.log(3))) / 2
      const inverse4G = CAP / (2 * ku)
      const sB = 4 * Math.PI * rh * rh * inverse4G
      const k = profileKappa(profile, rh, 1)

      return {
        rh,
        m,
        ku,
        tCut,
        docks: plan.docks,
        s,
        sHold,
        sB,
        inverse4G,
        sameHorizon,
        t: k.temperature,
        slope: k.slope,
        ratio: s / (4 * Math.PI * rh * rh) / inverse4G,
      }
    })

    // the fitted reading T dS/dM = T p a M^(p - 1)
    const reading = (ss: readonly number[]): number[] => {
      const fit = powerFit(
        rows.map(r => r.m),
        ss,
      )

      return rows.map(r => r.t * fit.p * fit.a * r.m ** (fit.p - 1))
    }

    const fitS = powerFit(
      rows.map(r => r.m),
      rows.map(r => r.s),
    )
    const first = reading(rows.map(r => r.s))
    const hold = reading(rows.map(r => r.sHold))
    const bek = reading(rows.map(r => r.sB))
    const neighbour = rows.slice(1).map((r, i) => {
      const p = rows[i]!
      const t = profileKappa(
        profile,
        Math.sqrt(p.rh * r.rh),
        1,
      ).temperature

      return (t * (r.s - p.s)) / (r.m - p.m)
    })
    const centered = rows
      .slice(1, -1)
      .map(
        (r, i) =>
          (r.t * (rows[i + 2]!.s - rows[i]!.s)) /
          (rows[i + 2]!.m - rows[i]!.m),
      )

    // E-GRV-0123's M and its profile T M at D0 = 2
    const deepRows = R_DEEP.map(rh => {
      const m = CAP / profile.at(rh)

      return {
        rh,
        m,
        tm:
          profileKappa(profile, rh, roomSpeed(D0_DEEP)).temperature * m,
        tmDock: profileKappa(profile, rh, 1).temperature * m,
      }
    })

    // THE GATES
    const ratios = rows.map(r => r.ratio)
    const i1 =
      rows.every(r => Math.abs(r.s / r.tCut - 18.1798) <= 1e-4) &&
      [...T_CUT_KNOWN].every(
        ([rh, n]) => rows.find(r => r.rh === rh)!.tCut === n,
      ) &&
      Math.abs(rows[0]!.m - 502) <= 1 &&
      Math.abs(rows[rows.length - 1]!.m - 2955) <= 1 &&
      Math.abs(Math.min(...ratios) - RATIO_LOW) <= 0.001 &&
      Math.abs(Math.max(...ratios) - RATIO_HIGH) <= 0.001 &&
      deepRows.every(
        (d, i) =>
          Math.abs(d.m - M_DEEP[i]!) <= 1 &&
          Math.abs(d.tm - TM_DEEP) <= 1e-3,
      )
    const i2 = rows.every(r => r.sameHorizon)
    const c1 = spreadOf(hold) > C1_SPREAD
    const c2 = bek.every(v => Math.abs(v - 1) <= C2_TOLERANCE)
    const h1 = first.every(v => Math.abs(v - 1) <= H1_TOLERANCE)
    const p1 =
      first.some(v => Math.abs(v - 1) > H1_TOLERANCE) &&
      spreadOf(first) > P1_SPREAD
    const status =
      !(i1 && i2 && c1 && c2) || p1 ? 'fail' : h1 ? 'pass' : 'partial'

    const mean = first.reduce((a, b) => a + b, 0) / first.length
    const need = lnSpan / mean

    rows.forEach((r, i) => {
      const key = `r${r.rh}`

      metrics[`${key}_M`] = r.m
      metrics[`${key}_T`] = r.t
      metrics[`${key}_TM`] = r.t * r.m
      metrics[`${key}_Tcut`] = r.tCut
      metrics[`${key}_S`] = r.s
      metrics[`${key}_SoverAover4G`] = r.ratio
      metrics[`${key}_TdSdM`] = first[i]!
      metrics[`${key}_holdTdSdM`] = hold[i]!
      metrics[`${key}_bekTdSdM`] = bek[i]!
      lines.push(
        `r_h ${r.rh}: M ${r.m.toFixed(2)}, slope ${r.slope.toFixed(4)}, T ${r.t.toExponential(4)} /dock (T M ${(r.t * r.m).toFixed(4)}), T_cut ${r.tCut}, |H| ${r.docks}, S ${r.s.toFixed(1)}, S/A over 1/4G ${r.ratio.toFixed(4)}; T dS/dM ${first[i]!.toFixed(4)} (held tear ${hold[i]!.toFixed(4)}, A/4G ${bek[i]!.toFixed(4)})${i > 0 ? `, neighbour ${neighbour[i - 1]!.toFixed(4)}` : ''}${i > 0 && i < rows.length - 1 ? `, centered ${centered[i - 1]!.toFixed(4)}` : ''}`,
      )
    })

    deepRows.forEach((d, i) => {
      lines.push(
        `E-GRV-0123 r_h ${d.rh}: M ${d.m.toFixed(1)}, profile T M ${d.tm.toFixed(4)} /beat at D0 ${D0_DEEP} (${d.tmDock.toFixed(4)} /dock), light T M ${(d.tm * LIGHT_OVER_PROFILE[i]!).toFixed(4)} /beat as E-GRV-0123 stated`,
      )
    })

    metrics.gate_I1 = i1 ? 1 : 0
    metrics.gate_I2 = i2 ? 1 : 0
    metrics.control_C1 = c1 ? 1 : 0
    metrics.control_C2 = c2 ? 1 : 0
    metrics.gate_H1 = h1 ? 1 : 0
    metrics.falsifier_P1 = p1 ? 1 : 0
    metrics.lnSpan = lnSpan
    metrics.exponentSinM = fitS.p
    metrics.TdSdMMin = Math.min(...first)
    metrics.TdSdMMax = Math.max(...first)
    metrics.TdSdMMean = mean
    metrics.TdSdMSpread = spreadOf(first)
    metrics.holdSpread = spreadOf(hold)
    metrics.bekWorst = Math.max(...bek.map(v => Math.abs(v - 1)))
    metrics.neighbourMin = Math.min(...neighbour)
    metrics.neighbourMax = Math.max(...neighbour)
    metrics.centeredMin = Math.min(...centered)
    metrics.centeredMax = Math.max(...centered)
    metrics.natsNeededPerCut = need
    metrics.natsNeededOver4Pi = need / (4 * Math.PI)
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `with M = CAP / profile(r_h) (the same object in E-GRV-0123 and 0131), T the profile's kappa / 2 pi in inverse docks and S = T_cut ln(span), T dS/dM over E-GRV-0131's nine M (${rows[0]!.m.toFixed(0)} .. ${rows[rows.length - 1]!.m.toFixed(0)}) reads ${Math.min(...first).toFixed(4)} .. ${Math.max(...first).toFixed(4)} (spread ${spreadOf(first).toFixed(4)}; neighbour differences ${Math.min(...neighbour).toFixed(3)} .. ${Math.max(...neighbour).toFixed(3)}); a cut link would need ${need.toFixed(3)} nats (${(need / (4 * Math.PI)).toFixed(4)} of 4 pi) against ${lnSpan.toFixed(3)}; held tear spread ${spreadOf(hold).toFixed(3)}, A/4G within ${Math.max(...bek.map(v => Math.abs(v - 1))).toFixed(4)} of 1`,
      metrics,
      control: {
        c1: c1 ? 1 : 0,
        c2: c2 ? 1 : 0,
        holdSpread: spreadOf(hold),
        bekWorst: Math.max(...bek.map(v => Math.abs(v - 1))),
      },
      notes: `L2. I1 ${i1}, I2 ${i2}, C1 ${c1}, C2 ${c2}, H1 ${h1}, P1 ${p1}. ${lines.join('. ')}.`,
    })
  },
})
