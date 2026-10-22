// THE LIGHT'S OWN QUANTUM SECTOR ON THE WHOLE HUSK, WITH MATTER COUPLED, AND AN ENERGY LEDGER FOR THE CASIMIR ROW
// (E-FRC-0292, moving-matter item 0013, OPEN-LGT-12, OPEN-LGT-22, pieces "Order of work" step 6). Adopted rule R* with
// the spinor lift (moving-matter decision 0006). Gates fixed by the 0010 lead on 2026-10-08, never moved.
//
// WHAT CANNOT BE RUN, SAID FIRST. The exact compact light is out of reach. The side-8 husk has V = 512 docks, 4,608
// link registers and 10,240 triangle registers of N = 2D + 1 states each; with Gauss's law about N^(8V) states remain,
// 17^4096 ~ 1e5040 at D = 8. The exact engine holds about 1e9 complex amplitudes (16 GB), and one husk dock's 9 links
// alone are 17^9 = 1.2e11. No box, not one dock, runs exactly. So the verdict on the whole husk is OPEN whatever the
// slice reads, and this file runs the largest honest slice:
//
// THE SLICE. Away from each register's seam at +-D the rule's drift and force phases are exact quadratic (metaplectic)
// maps (E-FRC-0231, 0282), so there the quantum light IS the linear light quantized: per eigenmode of the husk symbol
// A(k) = W^(1/2) C^dag N C W^(1/2) (code/measure/husk-balance huskLight), the leapfrog M = [[1, s], [-f lambda,
// 1 - s f lambda]] with 2 - 2 cos omega = s f lambda. Everything below is exact in that sector, on the whole husk at
// sides 8 and 16 (and as a Brillouin-zone integral); what the seams add is E-FRC-0282's seam reading, which falls with D
// and is not redone. THE LEDGER: H = sum omega (a^dag a + 1/2). Because s f lambda < 4 (s f = 1/N, lambda_max = 32),
// every omega is in (0, pi), so the ledger never takes a log of the beat: it is the seam criterion that does not unwrap
// Floquet energies (E-FRC-0269, 0270, 0275 unwrapped and failed; E-FRC-0282 failed its own control). The split rho = f/s
// does not enter omega (only s f does), so OPEN-LGT-02 is untouched by reads 1, 2 and 4 and enters read 3 only at the
// seam. MATTER: the R* register member (u = ringUnit(-5, 1), M = pi - |arg u| = 0.85406 per cycle, its band E(K) =
// acos(cos M - 2 cos^2(M/2) g^2(K)), E-SPN-0160), coupled minimally by the Peierls shift K -> K + q A; H = M beta +
// K . alpha is that band's Clifford form. The coupling q is not fixed by the rule yet, so the sea's photon mass is read
// as the coupling-free ratio of its stiffness to its diamagnetic scale.
//
// DERIVED BEFORE THE GATE RUN.
// R1 COMMUTATION. a = l1 y + l2 pi with l M = e^(-i omega) l, l2 = l1 (1 - e^(-i omega)) / (f lambda), scaled to
//    [a, a^dag] = 1 (2 hbar Im l2 = 1 at l1 = 1, hbar = N / (2 pi)). [a_i(k), a_j(k)^dag] = delta_ij and [a_i(k),
//    a_j(-k)] = 0 follow from the orthonormal eigenvectors and the shared l on a degenerate pair, so the residual is
//    rounding. On one register the Weyl pair Z X = zeta X Z, Z^N = X^N = 1 holds exactly (integers); the Heisenberg
//    form [x, p] = i hbar cannot (Tr [x, p] = 0 on Z_N), and its vacuum deficit is the seam's: read, not gated.
// R2 DISPERSION. Two degenerate photon branches, lambda = (4/3) k^2 + O(k^4), so omega -> 0 as k -> 0 (the probe saw
//    them); the six massive branches at 24. On a side-L box the smallest photon omega is at |k| = 2 pi / L, so it halves
//    from L = 8 to 16. Cubic symmetry makes the k^2 term isotropic; anisotropy enters at k^4. The sea adds m^2 = q^2
//    sum_K E''(K) / V, a grid sum of a periodic function's second derivative: zero up to aliasing, which falls
//    exponentially with L while the band's gap stays open; a metal keeps the Fermi surface's Drude term.
// R3 PLANCK. In the ledger's thermal state Gamma_T = coth(omega / 2T) Gamma_0 (beat-invariant) the occupation is
//    1 / (e^(omega/T) - 1) by construction, so the occupation alone is an identity (checked, instrument). The read with
//    content is the spectrum: u(T) = int d^3k / (2 pi)^3 sum omega n(omega) against Stefan-Boltzmann pi^2 T^4 /
//    (15 c0^3), true only with exactly two massless polarizations at one isotropic speed c0. The classical light
//    (equipartition, T a mode) gives u = 8 T a dock, Rayleigh-Jeans, and must fail.
// R4 CASIMIR. Plates hold their in-plane links at zero (tangential E = 0). In a z-periodic box of Lz = 32 layers with
//    two plates d and Lz - d apart, bulk and faces are the same at every d, so E_0(d) = a + C (d^p + (Lz - d)^p); the
//    continuum's perfect-conductor law is p = -3, C = -pi^2 c0 / 720 (hbar = 1). Matter is left out of the plates' energy:
//    a gapped sea's d-dependence falls exponentially (as R2's aliasing), not as a power.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/hlq-probe.ts, tmp/hlq-probe.log): the symbol's eigenvalues at k = 0.01 and 0.3
//    along x and y (one gauge zero, two photons 1.3333e-4 and 0.1197 doubly degenerate, six at 24; three zeros at k = 0),
//    the member cycle's trace against diracPhase (equal at M = pi - |arg u| at three K, 9 digits), the Weyl count at
//    N = 9, 17, 33 (0), one thermal mode's invariance (2.5e-17) and occupation (0.21438 against Bose 0.2146), one slab's
//    size (208 links at Lz 24) and time (about 60 ms a transverse point). No anisotropy, stiffness ratio, Stefan-Boltzmann
//    ratio or Casimir exponent was printed before the gates.
//
// GATES (the lead's, 2026-10-08), with how each is read here:
//  G1 commutation exact: mode commutators on the side-8 box at D = 8 within 1e-12 ([a, a^dag] - 1, [a_k, a_-k], and
//     the a' = e^(-i omega) a law), and 0 Weyl failures at N = 9, 17, 33.
//  G2 the gap at k -> 0 shrinks with box size toward 0: the smallest photon omega on the side-16 box at most 0.55 of the
//     side-8 box's, AND the sea's stiffness ratio at L = 16 at most max(1/10 of L = 8's, 1e-12). KILL (a massive
//     photon): the smallest omega at 16 above 0.9 of 8's, or the sea ratio at 16 above half of 8's.
//  G3 speed isotropic within 2%: omega / |k| of both photon branches at |k| = 2 pi / L along (1,0,0), (1,1,0), (1,1,1),
//     max / min - 1 <= 0.02 at L = 8 AND 16. KILL: above 0.10 at either. (Equal |k|, so dispersion does not pose as
//     anisotropy; the on-grid speeds at the three smallest box momenta per direction are read too.)
//  G4 Planck within 5%: |u(T*) / u_SB(T*) - 1| <= 0.05 at T* = 0.0709 c0 (thermal photon k 2.82 T / c0 = 0.2), with
//     the occupation identity within 1e-12 at five modes. Failing alone: partial.
//  G5 Casimir: the fitted p within 10% of -3, p in [-3.3, -2.7], on d = 4, 6, 8, 12 at Lz = 32, transverse grid 48.
//     Failing alone: partial. Read: C against -pi^2 c0 / 720, and the fit on a transverse grid of 32.
//  CONTROLS (any miss makes the verdict open on the instrument): C1 the classical light misses Stefan-Boltzmann by more
//     than 5% at T* (Rayleigh-Jeans); C2 the metal (the band filled to the midpoint of its range) keeps its stiffness,
//     ratio at L = 16 at least 1/3 of L = 8's and at least 1e-2; C3 the plates' fit C is negative (attraction).
// VERDICT: fail if a KILL fires; else open, with the slice's reads (pass of G1 to G5 on the slice cannot pass the
//    whole husk, whose compact sector no engine holds); partial if G4 or G5 fails alone.
//
// FIRST RUN 2026-10-08 (tmp/hlq.log, about 25 min; an earlier start crashed before any gate, its c0 read at k = 1e-4
// fell under the gauge cut, fixed to 1e-3, no gate moved): PARTIAL by the verdict rule, and that partial is a defect of
// G4's instrument clause, not of the light. G1 held: commutators 4.2e-15 and 6.4e-15, beat law 4.6e-16 over 4,094 modes,
// Weyl 0 failures; the Heisenberg deficit of the largest register falls 8.8e-2, 5.7e-4, 2.4e-8 at D = 4, 8, 16. G2 held
// and no KILL: least photon omega 0.21848 (L 8), 0.10980 (L 16), ratio 0.5025; the R* sea's stiffness ratio 2.2e-4 to
// 2.3e-8 (L 8 to 16), the metal 0.470 to 0.484 (C2 held). G3 held: anisotropy 1.6e-4 (L 8), 9.8e-6 (L 16), c0 0.280056.
// G4's spectrum held, u / u_SB 1.0051 at T* = 0.01986 (1.0003 to 1.0217 over T* / 4 to 2 T*; classical 1.8e4, C1 held),
// but its occupation clause failed: the identity's RELATIVE error is 3.7e-10 at lambda 12, where n = 3.6e-11 is read as
// a difference of order 1/2 (absolute error about 1e-20); every mode with n above 1e-4 is within 1.4e-14. The gate was
// written relative and stays so. G5 held: p -3.0046 (grid 48), -3.0399 (grid 32), C -3.866e-3 against the continuum's
// -pi^2 c0 / 720 = -3.839e-3 (0.7 percent), C3 held. Seam temperature at D 8: 0.80, 40 times T*.
//
// Depth L2: exact quadratic quantization of the rule's husk light on symbol grids and slab boxes, doubles with
// residuals, an analytic band for the sea.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { huskLight } from '@/code/measure/husk-balance'
import {
  lightModes,
  registerVariances,
  seamWeight,
} from '@/code/measure/husk-light-seam'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  casimirFit,
  heisenbergDeficit,
  modeCommutators,
  photonAt,
  seaStiffness,
  slabZeroPoint,
  thermalEnergy,
  thermalGrid,
  thermalMode,
  weylFailures,
  type Light,
} from '@/code/measure/husk-light-quantum'

export type LightQuantumPlan = {
  depth: number
  rho: number
  boxes: readonly number[]
  directions: readonly (readonly number[])[]
  commutatorBox: number
  weylNs: readonly number[]
  deficitDepths: readonly number[]
  seaBoxes: readonly number[]
  thermal: { kMax: number; nk: number; nt: number; np: number; kT: number }
  plates: { Lz: number; ds: readonly number[]; grid: number; checkGrid: number }
}

export const LIGHT_QUANTUM_PLAN: LightQuantumPlan = {
  depth: 8,
  rho: 0.4613818,
  boxes: [8, 16],
  directions: [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
  ],
  commutatorBox: 8,
  weylNs: [9, 17, 33],
  deficitDepths: [4, 8, 16],
  seaBoxes: [8, 16],
  thermal: { kMax: Math.PI, nk: 96, nt: 24, np: 48, kT: 0.2 },
  plates: { Lz: 32, ds: [4, 6, 8, 12], grid: 48, checkGrid: 32 },
}

const splitAt = (depth: number, rho: number) => {
  const n = 2 * depth + 1
  const sf = 1 / n

  return { s: Math.sqrt(sf / rho), f: Math.sqrt(sf * rho), n }
}

const flag = (b: boolean): number => (b ? 1 : 0)
const e = (x: number, d = 2): string => x.toExponential(d)

export default experiment({
  id: 'quantum/husk-light-quantum',
  code: 'E-FRC-0292',
  title:
    "explores whether the husk light's own quantum sector, with the R* member coupled by its Peierls shift, is a massless isotropic photon with Planck's spectrum and a Casimir force, on the largest slice an engine holds: the light's exact quadratic sector on the whole husk; the compact sector (about N^(8V) states) is out of reach, so the whole-husk verdict stays open",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskLightQuantumRun(LIGHT_QUANTUM_PLAN)
  },
})

export function huskLightQuantumRun(
  plan: LightQuantumPlan,
  log: (line: string) => void = () => {},
): Verdict {
  const started = Date.now()
  const husk: Light = huskLight()
  const split = splitAt(plan.depth, plan.rho)
  const sf = split.s * split.f

  // ---- R1 commutation ----
  const comm = modeCommutators(husk, split, plan.commutatorBox)
  const weyl = plan.weylNs.map(weylFailures)
  const deficits = plan.deficitDepths.map(D => {
    const sp = splitAt(D, plan.rho)
    const { modes, points } = lightModes(husk, sp, 8, 0)
    const v = registerVariances(modes, points)
    const sigma2 = Math.max(...v.link, ...v.plaquette)

    return { D, sigma2, deficit: heisenbergDeficit(sp.n, sigma2), seam: seamWeight(sigma2, D) }
  })
  const G1 =
    comm.normal <= 1e-12 &&
    comm.anomalous <= 1e-12 &&
    comm.evolution <= 1e-12 &&
    weyl.every(x => x === 0)

  log(`R1 ${JSON.stringify({ comm, weyl, deficits })}`)

  // ---- R2 dispersion and the gap ----
  // k = 1e-3: at 1e-4 the photon's lambda (1.3e-8) falls under the gauge cut 1e-9 x 24 (the first run's crash)
  const c0 = photonAt(husk, [1e-3, 0, 0], sf).photons[0]!.speed
  const boxes = plan.boxes.map(L => {
    const kmin = (2 * Math.PI) / L
    // equal |k| along each direction
    const equal = plan.directions.map(dir => {
      const n = Math.hypot(...dir)
      const { photons } = photonAt(
        husk,
        dir.map(x => (x * kmin) / n),
        sf,
      )

      return photons.map(p => p.speed)
    })
    const speeds = equal.flat()
    const anisotropy = Math.max(...speeds) / Math.min(...speeds) - 1
    // on the grid: the three smallest box momenta per direction
    const grid = plan.directions.map(dir =>
      [1, 2, 3].map(j => {
        const k = dir.map(x => x * j * kmin)
        const { photons, massive, gauge } = photonAt(husk, k, sf)

        return {
          k: Math.hypot(...k),
          omega: photons.map(p => p.omega),
          speed: photons.map(p => p.speed),
          massive,
          gauge,
        }
      }),
    )
    // the smallest positive photon omega over the whole box
    let least = Infinity

    for (let i = 1; i < L ** 3; i++) {
      const k = [i % L, Math.floor(i / L) % L, Math.floor(i / L / L)].map(
        j => (2 * Math.PI * j) / L,
      )
      const { photons } = photonAt(husk, k, sf)

      for (const p of photons) {
        least = Math.min(least, p.omega)
      }
    }

    return { L, anisotropy, equal, grid, least }
  })

  const u = ringUnit(-5, 1)
  const M = Math.PI - Math.abs(unitAngle(u))
  const sea = plan.seaBoxes.map(L => seaStiffness(M, L, 0))
  // the metal: the band filled to the midpoint of its range on the side-8 grid (fixed before the run)
  const fermi = (sea[0]!.low + sea[0]!.high) / 2
  const metal = plan.seaBoxes.map(L => seaStiffness(M, L, 0, fermi))
  const [b8, b16] = boxes as [(typeof boxes)[0], (typeof boxes)[0]]
  const [s8, s16] = sea as [(typeof sea)[0], (typeof sea)[0]]
  const [m8, m16] = metal as [(typeof metal)[0], (typeof metal)[0]]
  const gapShrink = b16.least / b8.least
  const G2 =
    gapShrink <= 0.55 && s16.ratio <= Math.max(s8.ratio / 10, 1e-12)
  const killGap = gapShrink > 0.9 || s16.ratio > s8.ratio / 2
  const C2 = m16.ratio >= m8.ratio / 3 && m16.ratio >= 1e-2
  const G3 = boxes.every(b => b.anisotropy <= 0.02)
  const killSpeed = boxes.some(b => b.anisotropy > 0.1)

  log(
    `R2 ${JSON.stringify({ c0, M, fermi, boxes: boxes.map(b => ({ L: b.L, anisotropy: b.anisotropy, equal: b.equal, least: b.least, grid: b.grid })), sea, metal })}`,
  )

  // ---- R3 Planck ----
  const occupations = [0.05, 0.3, 1, 3, 12].map(lambda => {
    const T = 0.05
    const r = thermalMode(lambda, split.s, split.f, split.n / (2 * Math.PI), T)
    const bose = 1 / Math.expm1(r.omega / T)

    return { lambda, invariance: r.invariance, error: Math.abs(r.occupation - bose) / Math.max(bose, 1e-300) }
  })
  const occupationOk = occupations.every(o => o.invariance <= 1e-12 && o.error <= 1e-12)
  const tg = thermalGrid(
    husk,
    sf,
    plan.thermal.kMax,
    plan.thermal.nk,
    plan.thermal.nt,
    plan.thermal.np,
  )
  const sb = (T: number): number => (Math.PI ** 2 * T ** 4) / (15 * c0 ** 3)
  const tStar = (plan.thermal.kT * c0) / 2.82
  const ladder = [0.25, 0.5, 1, 2].map(x => {
    const T = x * tStar

    return { T, quantum: thermalEnergy(tg, T, true) / sb(T), classical: thermalEnergy(tg, T, false) / sb(T) }
  })
  const star = ladder[2]!
  const G4 = Math.abs(star.quantum - 1) <= 0.05 && occupationOk
  const C1 = Math.abs(star.classical - 1) > 0.05
  // the seam temperature at D: where the largest register's thermal seam weight reaches 1e-3 (side-8 box modes)
  const { modes: m8modes, points: p8 } = lightModes(husk, split, 8, 0)
  const seamAt = (T: number): number => {
    let worst = 0
    const L = m8modes[0]!.link.length
    const P = m8modes[0]!.plaquette.length

    for (let r = 0; r < L + P; r++) {
      let v = 0

      for (const m of m8modes) {
        const c = r < L ? m.link[r]! : m.plaquette[r - L]!

        v += (c / (2 * p8)) / Math.tanh(m.omega / (2 * T))
      }

      worst = Math.max(worst, seamWeight(v, plan.depth))
    }

    return worst
  }
  let lo = 1e-4
  let hi = 10

  for (let it = 0; it < 60; it++) {
    const mid = Math.sqrt(lo * hi)

    if (seamAt(mid) < 1e-3) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const tSeam = lo

  log(`R3 ${JSON.stringify({ tStar, ladder, occupations, tSeam, seamAtStar: seamAt(tStar) })}`)

  // ---- R4 Casimir ----
  const plates = (G: number) => {
    const es = plan.plates.ds.map(d => {
      const t = Date.now()
      const r = slabZeroPoint(husk, sf, plan.plates.Lz, [0, d], G)

      log(`plates G ${G} d ${d}: E0 ${r.energy.toPrecision(16)} gauge ${r.gauge} modes ${r.modes} (${((Date.now() - t) / 1000).toFixed(0)} s)`)

      return r
    })
    const fit = casimirFit(
      plan.plates.ds,
      es.map(x => x.energy),
      plan.plates.Lz,
    )

    return { es, fit }
  }
  const main = plates(plan.plates.grid)
  const check = plates(plan.plates.checkGrid)
  const continuumC = -(Math.PI ** 2) * c0 / 720
  const G5 = main.fit.p >= -3.3 && main.fit.p <= -2.7
  const C3 = main.fit.C < 0

  log(`R4 ${JSON.stringify({ main: main.fit, check: check.fit, continuumC })}`)

  // ---- verdict ----
  const controls = C1 && C2 && C3
  const kill = killGap || killSpeed
  const status: Verdict['status'] = kill
    ? 'fail'
    : !controls || !G1
      ? 'open'
      : G4 && G5
        ? 'open'
        : 'partial'
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `${kill ? `KILL (${killGap ? 'massive photon' : ''}${killSpeed ? ' anisotropic speed' : ''}). ` : ''}On the husk light's exact quadratic sector (the compact sector, about N^(8V) states, is out of reach, so the whole husk stays open): R1 commutators ${e(comm.normal)} normal, ${e(comm.anomalous)} anomalous, beat law ${e(comm.evolution)} over ${comm.modes} modes on the side-${plan.commutatorBox} box, Weyl failures ${weyl.join(', ')}; Heisenberg deficit of the largest register ${deficits.map(d => `${e(d.deficit)} at D ${d.D}`).join(', ')}. R2 smallest photon omega ${b8.least.toFixed(5)} (L 8), ${b16.least.toFixed(5)} (L 16), ratio ${gapShrink.toFixed(4)}; c0 ${c0.toFixed(6)}; anisotropy at |k| = 2 pi / L ${e(b8.anisotropy)} (L 8), ${e(b16.anisotropy)} (L 16); the R* sea's stiffness ratio ${e(s8.ratio)} (L 8), ${e(s16.ratio)} (L 16), metal ${e(m8.ratio)}, ${e(m16.ratio)}. R3 u / u_SB at T* = ${tStar.toFixed(5)}: ${star.quantum.toFixed(5)} (classical ${star.classical.toExponential(3)}); occupation identity ${occupationOk}; seam temperature at D ${plan.depth} ${tSeam.toFixed(4)}. R4 Casimir p ${main.fit.p.toFixed(4)} (grid ${plan.plates.grid}), ${check.fit.p.toFixed(4)} (grid ${plan.plates.checkGrid}), C ${e(main.fit.C, 3)} against continuum ${e(continuumC, 3)}.`,
    metrics: {
      commNormal: comm.normal,
      commAnomalous: comm.anomalous,
      commEvolution: comm.evolution,
      modes: comm.modes,
      weylFailures: weyl.reduce((a, b) => a + b, 0),
      deficitD4: deficits[0]!.deficit,
      deficitD8: deficits[1]!.deficit,
      deficitD16: deficits[2]!.deficit,
      c0,
      leastOmega8: b8.least,
      leastOmega16: b16.least,
      gapShrink,
      anisotropy8: b8.anisotropy,
      anisotropy16: b16.anisotropy,
      seaRatio8: s8.ratio,
      seaRatio16: s16.ratio,
      memberM: M,
      tStar,
      planckRatio: star.quantum,
      tSeam,
      casimirP: main.fit.p,
      casimirPCheck: check.fit.p,
      casimirC: main.fit.C,
      continuumC,
      casimirResidual: main.fit.residual,
      G1: flag(G1),
      G2: flag(G2),
      G3: flag(G3),
      G4: flag(G4),
      G5: flag(G5),
      seconds,
    },
    control: {
      classicalPlanckRatio: star.classical,
      metalRatio8: m8.ratio,
      metalRatio16: m16.ratio,
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
    },
    notes: `L2, the quadratic sector only. Ledger omega in (0, pi), no unwrap. Split rho ${plan.rho} enters only the seam temperature. Matter coupling q not fixed by the rule: the sea's mass read as a ratio. Plates: in-plane links frozen, Lz ${plan.plates.Lz}, d ${plan.plates.ds.join(', ')}. ${seconds.toFixed(0)} s.`,
  })
}
