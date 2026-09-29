// A LOCAL LINK-FLUX STRING ON THE SWAP-COIN RULE: DOES GAUSS'S LAW CLOSE THE FLIPPED-MEMBER LEAK AND BIND LIGHT MEMBERS
// (E-SPN-0150)? E-SPN-0146 to 0148 bound the love-fear pair on the empty mesh with a separation cost read from both
// charges at once (d4Steps of their separation) and found two limits that cross: binding needs heavy members (m0 >
// arctan(1/3), the flipped-member channels top out at pi - 2 m0), R -> 1 needs light ones. E-SPN-0149 showed that on a
// line a local link flux IS the instantaneous cost. This file puts the local string on the 4d rule: a Z3 flux on every
// link, changed by -q along its motion by each charge that crosses it, one phase per link holding flux per beat
// (code/measure/link-flux), in place of E-SPN-0146's d4Steps phase.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/link-flux wordSpace, fluxBeat, treeBeat, radialBeat,
// ruleVacuumFlux; energies eps in E-SPN-0146's units, the pair's eps the sum of its members').
// 1. EXACT, REACH, VACUUM. The register is integers mod 3 and its cost an integer count, and the string's unit is a norm-
//    one element of Z[w][1/42] (E-SPN-0146 point 3), so the string's factor is exact on every branch. The register moves
//    nothing: the stream's front stays one root a beat (reach <= c). The swap coin's c* bound (E-SPN-0143 U1) is a
//    theorem about bands on D4, and point 3 shows the tied pair does not walk on D4, so no theorem here keeps a part under
//    c*; only c. THE VACUUM IS INERT: on the empty mesh no charge moves and no link is touched; on the love sea every link
//    is crossed once each way every beat (every slot full), so every change cancels (checked on the rule's own branch).
// 2. GAUSS'S LAW DOES NOT CLOSE THE LEAK. The channel that sank E-SPN-0146 is a member dropping into its own flat partner
//    multiplet (D and the 11 F-) with the string paying 2 m0: the member keeps its charge, so the flux pattern and Gauss's
//    law are the same before and after. Gauss's law sees charge, never the internal band. The many-body reading, string
//    breaking by a pair from the flat multiplet, is absent on the empty mesh (the rule makes no vibes) and would be
//    Gauss-legal anyway: the new fear ends the old love's flux and the new love starts the flux to the old fear, each
//    segment neutral. NO SELECTION RULE FROM GAUSS'S LAW REMOVES THE CHANNEL, for any local string of this kind.
// 3. WHAT THE LOCAL STRING DOES INSTEAD: THE TREE. With the love as the origin the register is the reduced word of roots
//    from the love to the fear (a love that hops by s prepends s^-1, a fear that hops by t appends t, a hop back cancels),
//    so the pair lives on the 24-regular tree (the Cayley tree of the free group on the 12 line generators, the universal
//    cover of the D4 root graph), not on D4: two histories that reach one dock leave two patterns and never interfere
//    again. Checked exactly (I1): every word's pattern is Gauss-legal with the fear at the word's vector sum, no two words
//    of length <= 4 leave one pattern (a pattern is shared only by a closed loop run three times, 9 links), and the cost
//    falls below the length only on the 24 x 8 = 192 words a b c a with r_b + r_c = -r_a (each root is the sum of two
//    roots in 8 ordered ways), where the first link is run twice and holds flux 2.
//    A MEMBER TIED TO A FIXED CHARGE is a flip-flop walk (the slot a vibe arrived in is the edge it came by, X sends it
//    back) with a coin I + beta 1 1^T symmetric in the 24 edges, on the tree; the root-fixing automorphisms commute with it,
//    so its symmetric sector is a two-component chain (radialBeat, exact at sigma = 0 at every depth to 8 and at sigma !=
//    0 through depth 3). Its moving spectrum is E-SPN-0143's sin w = sin(theta/2) g with g in the tree's adjacency
//    spectrum over 24, the Kesten interval |g| <= rho = 2 sqrt(23)/24 = 0.3997, not D4's g in [-1/3, 1]. So a tied member
//    has eps >= pi/2 - arcsin(rho cos m0) >= 1.1593 at EVERY m0 (1.1675 at m0 = 0.190, 1.2174 at pi/6): THE REST ENERGY m0
//    IS NOT REACHABLE ONCE THE MEMBER IS TIED. D4's band bottom eps = m0 is the interference of every path to a dock, and
//    the register forbids it. A light member is not light under this string.
// 4. THE PAIR. The singlet pair (both members on the tree) sits at eps >= 2 x 1.16 + string, above every channel with a
//    flat member (a flat member bounces across one link and retraces, so its register returns each beat and it keeps eps
//    = -m0 or pi - m0 at any separation): the singlet composite, if it forms, is in the flipped channels' continuum, the
//    E-SPN-0146 situation made worse. What the singlet start finds instead sits near contact, where the pair shares a dock
//    and the contact map (store and release) acts. The window: a tied member's radial levels at a strong string (sigma =
//    alpha) put 3.5e-2 of their weight at depth 2 and 1.2e-3 at depth 3 (tmp/lflux-probe2.log), and the pair's word
//    length is the sum of its two ends' depths, so absorption at the box of word length L falls roughly as the depth-L/2
//    weight squared per end: the H witness (1e-9 absorbed in 256 beats) needs L of about 10, 24 x 23^9 = 4e13 words.
//    The largest affordable box is L = 4 (292,561 words x 576 slot pairs + 2,257 contact words x 24 stores, 2.7 GB a state).
// 5. THE TWO-BEAT ESCAPE (E-SPN-0148's next step), derived, not run: for a cycle U2 = T P2 T P1 the zone mean of tr U2
//    keeps the terms r_d' = -r_d, sum_d (P2)_(d,-d) (P1)_(-d,d) = 24 c1 c2 (1 + beta1)(1 + beta2) for swap-coin docks, so
//    the cycle's bands are not forced to average to zero and the F- pinning of the band-sum rule does not bind a schedule
//    whose two docks differ. It concerns the D4 route (E-SPN-0147's mass string); under the link flux the members are not
//    on D4 at all (point 3), so no dock schedule restores their D4 band.
//
// PREDICTED: I1 to I5 hold; T1 holds (the tied member's spectrum starts at the Kesten floor at all four m0); L5 holds;
// L3 FAILS (the level at the largest peak absorbs well over 1e-9 in 256 beats at L = 4, less than at L = 2); L4 FAILS
// (R not within 0.05 of 1: the tied pair moves only by retracing, R far above 1); C1 holds (sigma 0 absorbs more); C2
// holds bit for bit. Verdict fail on L3 and L4.
//
// GATES, fixed before the gate run. The light point: the mixer unit u = ringUnit(-1, 4) (m0 = 0.190126 < arctan(1/3)),
// the string alpha = arccos(11/14) = 0.666946 a link (ringUnit(1, 0)) with the cost's sign (E-SPN-0146 point 3). THE
// PROCEDURE on the word box L: the start (both members in the singlet mode, weight exp(-L_w^(3/2)) on word length L_w,
// fluxStart ell 1); its spectrum under U2 over 128 two-beats (Hann, 720 phases); the largest peak; the filter S 64 there,
// then S 64 at the read phase; the level v.
//  T1 THE KESTEN FLOOR: at m0 = pi/6, 0.190126, 0.143348, 0.046778 (units (0,4), (-1,4), (2,2), (-3,5)) the tied member's
//     spectral density (radial chain, sigma 0, from the root's 24 edges alike, 4,096 beats, Hann, 2,048 phases) is above
//     1e-3 of its peak only at |eps| >= floor - 5e-3, and its lowest such |eps| is within 5e-3 of the floor.
//  L3 A LIGHT COMPOSITE HOLDS, at L = 4: over 256 beats from v the fidelity >= 1 - 1e-3 at every even beat, the weight
//     absorbed at the box <= 1e-9 in all, the weight at word length 4 <= 1e-6; AND isotropic: the K^2 coefficient (K = 0.04
//     u and 0.02 u, Richardson, the filter S 64 from v at its phase) along the axis, face, body and generic directions
//     within 1e-6 of the axis's (relative).
//  L4 ITS R: c*^2 / (2 a E_rest), E_rest the level's eps, within 0.05 of 1.
//  L5 THE VACUUM IS INERT AND GAUSS IS EXACT: the exact rule with the register on the empty box (sides 4, 8) and the love
//     sea (side 4), 128 beats, at the light unit and at w^2: one branch equal to the vacuum every beat and no link ever
//     holding flux (with the sea's 24 x cells crossings a beat counted); and I1.
// INSTRUMENT (a failure makes the verdict partial). I1 wordSpace(4): every pattern Gauss-legal, all distinct, the cost
//  below the length on exactly 192 words. I2 the register's own update (patternNext) equals the word rule (next) on every
//  transition at L = 2 and at every 97th word at L = 4. I3 the flux beat summed over the words of each relative position
//  equals swap-string's meson beat on a 6-ball at sigma 0, both parities, K = (0.3, -0.1, 0.2, 0.05), from a Weyl state on
//  the words of length <= 2, to 1e-14. I4 the meson beat against the exact rule at the light unit (swap-string boxCheck,
//  side-4 box, every 50th live contact state and every 24th slot pair one root apart, both parities): 1e-12, every
//  division exact, no stray branch. I5 the radial chain equals the one-member word engine (treeBeat, radialOf) at sigma 0
//  over 4 beats to 1e-13 with no spread, and at sigma alpha through 3 beats.
// CONTROLS (a failure makes the verdict partial). C1 the witness can fail on the flux space: with the string off (sigma 0)
//  the procedure's level at L = 4 absorbs more than 1e-3 in 256 beats. C2 the nonlocal string at E-SPN-0146's point
//  reproduces: E-SPN-0148's C1 procedure (ball 15, 12 threads) gives the absorbed weight 0.0043274899380355315 exactly.
// READ, gating nothing: the same procedure at L = 2 (the window trend), at E-SPN-0146's point (w^2, sigma 0.093556) at L = 4
//  (the same pair under the local string), each level's eps, |lambda2|, singlet share and word-length profile.
// Verdict: partial if the instrument or a control fails; pass if T1, L3, L4 and L5 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/lflux-probe1-2.log: the radial chain's spectral
//  support at sigma 0 starts at |eps| 1.2170 (pi/6), 1.1688 (0.190) against the derived 1.2174, 1.1675. A first flux
//  space keyed by patterns (a BFS over flux patterns of cost <= 4) grew past 18 GB and was stopped: patterns of bounded
//  cost include words of unbounded length (a pair circling a triangle), so the box is set by WORD LENGTH, not cost.
//  tmp/lflux-probe2.log: a tied member's radial levels near the root (point 4's window numbers). tmp/lflux-probe3-2.log
//  and -4.log: wordSpace(4) 305,281 words, 292,561 even, 2,257 contact, Gauss, distinct, 192 below length, built in 4 s;
//  patternNext agrees on 144,905 sampled transitions; the radial chain equals the word engine to 1.1e-15 (sigma alpha:
//  spread 1.1e-2 at beat 4, where the Z3 cost of the a b c a words breaks the tree symmetry, so I5 reads 3 beats there);
//  the projected flux beat equals the meson beat to 8.9e-16; one flux beat at L = 4 takes 0.4 to 1.4 s. tmp/lflux-probe4-*:
//  the procedure at the light point: at L = 2 the largest peak's level (eps 0.322) keeps 0.69 of its fidelity over 64
//  beats and absorbs 0.31; at L = 4 (sigma alpha) the start's spectrum peaks at eps 1.998, the level there has
//  |lambda2| 0.99729, weight 5.4e-4, 0.505, 0.494 at word lengths 0, 2, 4, and absorbs 0.159 in 64 beats (828 s). At
//  sigma = 2 sigma_146 and L = 2 it absorbs 0.10 in 64 beats. These set the prediction that L3 fails.
//
// FIRST RUN (tmp/lflux-4d-exp-run1.log, 5,062 s): FAIL on L3 and L4, as predicted. T1 and L5 hold, the instrument and
//  both controls hold. No gate moved and none was rerun.
//  - T1 holds: the tied member's spectrum starts at |eps| 1.2170, 1.1688, 1.1636, 1.1604 at m0 0.524, 0.190, 0.143,
//    0.047, against the Kesten floors 1.2174, 1.1675, 1.1641, 1.1601 (within the 2,048-phase grid, none below). A tied
//    member at m0 = 0.047 costs 1.160, 25 times its free rest energy.
//  - L3 FAILS: at L = 4 the procedure's level (the start's largest peak) sits at eps 1.999584 (in the flipped channels'
//    range, as point 4 said), |lambda2| 0.99729, weight 5.4e-4 / 0.505 / 0.494 at word lengths 0 / 2 / 4, and over 256
//    beats keeps fidelity 0.501 and loses 0.499 at the box. Isotropy alone holds (5.1e-7: the word space keeps W(F4)).
//    At L = 2 the same procedure loses 0.778: the box's loss falls only from 0.78 to 0.50 as L doubles, the trend point
//    4 predicted (the weight sits at the box edge, not in a decaying tail).
//  - L4 FAILS: the K^2 coefficient is -8.3164e-4 in all four directions, so R = -150: the level's eps FALLS with K. It is
//    not a massive particle's band bottom but a band maximum of a flipped-channel mixture; no positive inertia exists to
//    compare with E_rest.
//  - L5 holds: the rule with the register on the empty boxes (sides 4, 8) and the love sea (side 4), 128 beats, at the
//    light unit and at w^2: one branch, exact, no link ever holding flux, 786,432 sea crossings cancelled pairwise.
//  - C1 holds on its letter (no string: 0.255 absorbed) but reads against the string: WITHOUT the string the box loses
//    LESS than with it (0.255 against 0.499). The local string at alpha does not hold the pair nearer contact at L = 4.
//  - C2 holds BIT FOR BIT: the nonlocal phase string at E-SPN-0146's point, ball 15, absorbs 0.0043274899380355315,
//    eps 1.565757, fidelity 0.979730 (E-SPN-0146's and E-SPN-0148 C1's numbers).
//  - Read: the heavy point (w^2, sigma 0.0936) under the local string at L = 4 lands on eps 0.2796 (not E-SPN-0146's
//    1.5658) and loses 0.724; the heavy pair that the nonlocal string bound to a 4e-3 resonance is not bound at all here.
//  - Instrument: I1 305,281 words, 2,257 contact, Gauss and distinctness exact, 192 below length; I2 171,401 transitions
//    agree; I3 8.9e-16; I4 72 box starts, worst 1.4e-17, 0 inexact, 0 stray; I5 8.9e-16 and 1.1e-16.
// NEXT. Neither a nonlocal cost (not boost covariant, leaks for light members) nor a local electric-only flux (records
//  the path, lifts every tied member to the Kesten floor) gives a light, relativistic composite on this rule. The string
//  needs its own dynamics: a magnetic (plaquette) term that lets flux patterns differing by a closed loop interfere, which
//  both restores the members' D4 interference (removing the tree) and gives the string the transverse inertia E-SPN-0149
//  point 2 derives as the missing (2 - 2/d) T. The first check is one member tied to a fixed charge with a plaquette
//  phase on the triangle loops: does its spectrum come back down from the Kesten floor toward eps = m0.
//
// Depth L1 (Gauss's law, the free group's tree and Kesten's spectral radius are mathematics) and L2 (a coined walk on a
// tree, a lattice gauge string with no magnetic term). DETERMINISM: no random numbers; placed starts, Weyl states.
// NOTHING MOVES: the pieces hand values between slots of one dock, the stream takes each slot's value one dock along, the
// register is a value on a link changed by the charges that cross it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { singletLevel } from '@/code/measure/singlet-kinematics'
import { d4Ball, flatBoxTables } from '@/code/measure/swap-sector'
import { centerOf } from '@/code/measure/wall-reading'
import { rootIndex } from '@/code/measure/crossing-lines'
import { shareSpace, threadEngine } from '@/code/measure/meson-pool'
import {
  boxCheck,
  boxStarts,
  buildLevel,
  contactDockExact,
  CONTACT_STATES,
  linearWell,
  mesonBeat,
  mesonSpace,
  mesonStart,
  newMeson,
  overEmpty,
  ringUnit,
  setString,
  sparseOf,
  STORE_BASE,
  stringKappa,
  unitAngle,
  vibeDockExact,
  vibeShape,
  watchLevel,
  type MesonState,
  type Sparse,
  type VibeShape,
} from '@/code/measure/swap-string'
import {
  fluxBeat,
  fluxBuild,
  fluxMeson,
  fluxProfile,
  fluxSingletShare,
  fluxSpectrum,
  fluxStart,
  fluxWatch,
  KESTEN,
  newFluxState,
  patternIndex,
  patternNext,
  radialBeat,
  radialOf,
  ruleVacuumFlux,
  setFluxMomentum,
  treeBeat,
  wordSpace,
  type FluxMeson,
  type FluxState,
  type WordSpace,
} from '@/code/measure/link-flux'

const C_STAR = Math.SQRT2 / 2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRECTIONS: readonly { name: string; u: number[] }[] = [
  { name: 'axis', u: [1, 0, 0, 0] },
  { name: 'face', u: [s2, s2, 0, 0] },
  { name: 'body', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]
// the light unit, the heavy (E-SPN-0146) unit, the four Kesten points, the strings
const LIGHT: readonly [number, number] = [-1, 4]
const HEAVY: readonly [number, number] = [0, 4]
const KESTEN_POINTS: readonly (readonly [number, number])[] = [
  [0, 4],
  [-1, 4],
  [2, 2],
  [-3, 5],
]
const ALPHA: readonly [number, number] = [1, 0]
const PHASE_STRING: readonly [number, number] = [3, 4]
const ELL = 1
const ELL_PHASE = 2.5
const HOLD = 1e-3
const ABSORB = 1e-9
const EDGE = 1e-6
const KAPPA = 0.04
const ISOTROPY = 1e-6
const R_TOLERANCE = 0.05
const FREE_ABSORB = 1e-3
const FLOOR_TOLERANCE = 5e-3
const FLOOR_DENSITY = 1e-3
const RECORDED_C1_ABSORBED = 0.0043274899380355315
const GAUSS_WORDS = 192
const SAMPLE_STRIDE = 97
const PROJECT_TOLERANCE = 1e-14
const BOX_TOLERANCE = 1e-12
const RADIAL_TOLERANCE = 1e-13
const K_PROJECT = [0.3, -0.1, 0.2, 0.05]
const BOX_SIDE = 4
const CHECK_BALL = 3

export type LinkFluxPlan = {
  box: number
  small: number
  spectrumT: number
  grid: number
  S: number
  sMove: number
  holdBeats: number
  vacuumBeats: number
  vacuumSides: readonly number[]
  radialBeats: number
  radialGrid: number
  liveStride: number
  pairStride: number
  reproduce: boolean
  heavy: boolean
  moves: boolean
  ball: number
  threads: number
  sFirst: number
  sSecond: number
}

export const GATE_PLAN: LinkFluxPlan = {
  box: 4,
  small: 2,
  spectrumT: 128,
  grid: 720,
  S: 64,
  sMove: 64,
  holdBeats: 256,
  vacuumBeats: 128,
  vacuumSides: [4, 8],
  radialBeats: 4096,
  radialGrid: 2048,
  liveStride: 50,
  pairStride: 24,
  reproduce: true,
  heavy: true,
  moves: true,
  ball: 15,
  threads: 12,
  sFirst: 256,
  sSecond: 128,
}

export default experiment({
  id: 'spin/swap-link-flux',
  code: 'E-SPN-0150',
  title:
    'a local Z3 link-flux string on the swap-coin rule cannot close the flipped-member leak (Gauss sees charge, not the member band) and binds no light composite, fail (L3, L4): the register records the path, so the pair walks on the 24-regular tree, where a tied member sits above the Kesten floor pi/2 - arcsin(rho cos m0) (measured 1.2170, 1.1688, 1.1636, 1.1604 at m0 0.524, 0.190, 0.143, 0.047); on the word box of length 4 the light level loses 0.499 in 256 beats (0.255 with no string) and its K^2 coefficient is negative (R -150), isotropic to 5e-7; the vacuum is exact with no flux, Gauss exact on every word, and the nonlocal E-SPN-0146 level reproduces bit for bit',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return swapLinkFluxRun(GATE_PLAN)
  },
})

type Point = {
  name: string
  u: ReturnType<typeof ringUnit>
  shape: VibeShape
  contact: [Sparse, Sparse]
  m0: number
  mid: number
  sign: number
  sigma: number
}

function pointOf(
  name: string,
  unit: readonly [number, number],
  string: readonly [number, number] | null,
): Point {
  const u = ringUnit(unit[0], unit[1])
  const A = overEmpty(vibeDockExact(1, 0, u), u)
  const lv = singletLevel(A, DOCK_ROOTS, 12)
  const sigma = string
    ? lv.sign * Math.abs(unitAngle(ringUnit(string[0], string[1])))
    : 0
  const contact: [Sparse, Sparse] = [
    sparseOf(overEmpty(contactDockExact(0, u), u)),
    sparseOf(overEmpty(contactDockExact(1, u), u)),
  ]

  return {
    name,
    u,
    shape: vibeShape(A),
    contact,
    m0: lv.m,
    mid: lv.midPhase,
    sign: lv.sign,
    sigma,
  }
}

type PairRead = {
  name: string
  L: number
  eps: number
  lambda: number
  residual: number
  share: number
  profile: number[]
  fidelity: number
  absorbed: number
  edge: number
  spectrumAbsorbed: number
  peaks: string
  holds: boolean
  a: number[]
  isotropy: number
  R: number
  seconds: number
}

function pairLevel(
  space: WordSpace,
  p: Point,
  plan: LinkFluxPlan,
  moves: boolean,
  log: (s: string) => void,
): PairRead {
  const started = Date.now()
  const epsOf = (phase: number): number =>
    p.sign * -wrap(phase - 2 * p.mid)
  const fm: FluxMeson = fluxMeson(
    space,
    p.shape,
    p.contact,
    p.sigma,
    [0, 0, 0, 0],
  )
  const start = fluxStart(space, ELL)
  const spec = fluxSpectrum(fm, start, plan.spectrumT, plan.grid)
  const n = spec.density.length
  const peaks = spec.density
    .map((d, g) => ({ d, g }))
    .filter(
      ({ d, g }) =>
        d > spec.density[(g + n - 1) % n]! &&
        d >= spec.density[(g + 1) % n]!,
    )
    .sort((a, b) => b.d - a.d)
  const top = peaks[0] as { d: number; g: number }
  const level = fluxBuild(fm, start, spec.phase2[top.g]! / 2, plan.S, 2)
  const profile = fluxProfile(fm, level.v)
  const watch = fluxWatch(fm, level.v, plan.holdBeats, space.maxLength)
  const edge = profile[space.maxLength]!
  const holds =
    watch.leastFidelity >= 1 - HOLD &&
    watch.absorbed <= ABSORB &&
    edge <= EDGE
  const eps0 = epsOf(level.read.phase)

  log(
    `${p.name} L ${space.maxLength}: level eps ${eps0.toFixed(6)} |lambda2| ${Math.hypot(...level.read.lambda2).toFixed(10)} absorbed ${watch.absorbed.toExponential(2)}`,
  )

  let a: number[] = []
  let isotropy = NaN
  let R = NaN

  if (moves) {
    const energyAt = (K: readonly number[]): number => {
      setFluxMomentum(fm, K)

      return epsOf(
        fluxBuild(fm, level.v, level.read.phase, plan.sMove, 1).read
          .phase,
      )
    }

    const zero = energyAt([0, 0, 0, 0])

    a = DIRECTIONS.map(d => {
      const d1 = energyAt(d.u.map(x => x * KAPPA)) - zero
      const d2 = energyAt(d.u.map(x => (x * KAPPA) / 2)) - zero

      log(`${p.name} L ${space.maxLength} K ${d.name}`)

      return (16 * d2 - d1) / (3 * KAPPA * KAPPA)
    })
    setFluxMomentum(fm, [0, 0, 0, 0])

    const a0 = a[0]!

    isotropy = Math.max(...a.map(x => Math.abs(x / a0 - 1)))
    R = (C_STAR * C_STAR) / (2 * a0 * zero)
  }

  return {
    name: p.name,
    L: space.maxLength,
    eps: eps0,
    lambda: Math.hypot(...level.read.lambda2),
    residual: level.read.residual,
    share: fluxSingletShare(fm, level.v),
    profile,
    fidelity: watch.leastFidelity,
    absorbed: watch.absorbed,
    edge,
    spectrumAbsorbed: spec.absorbed,
    peaks: peaks
      .slice(0, 5)
      .map(
        x =>
          `eps ${epsOf(spec.phase2[x.g]! / 2).toFixed(4)} (density ${x.d.toExponential(2)})`,
      )
      .join(', '),
    holds,
    a,
    isotropy,
    R,
    seconds: (Date.now() - started) / 1000,
  }
}

// the tied member's spectrum at sigma 0 on the radial chain, from the root's 24 edges alike: its |eps| support
function kestenFloor(
  unit: readonly [number, number],
  beats: number,
  grid: number,
): { m0: number; floor: number; lowest: number; below: number } {
  const u = ringUnit(unit[0], unit[1])
  const A = overEmpty(vibeDockExact(1, 0, u), u)
  const sh = vibeShape(A)
  const lv = singletLevel(A, DOCK_ROOTS, 12)
  const depth = beats + 2

  let pr = new Float64Array(depth + 1)
  let pi = new Float64Array(depth + 1)
  let cr = new Float64Array(depth + 1)
  let ci = new Float64Array(depth + 1)

  cr[0] = 1

  const auto: [number, number][] = []

  for (let t = 0; t < beats; t++) {
    auto.push([cr[0]!, ci[0]!])

    const r = radialBeat(sh.c, sh.beta, 0, depth, pr, pi, cr, ci)

    pr = r.pr
    pi = r.pi
    cr = r.cr
    ci = r.ci
  }

  const dens: { e: number; d: number }[] = []

  for (let g = 0; g < grid; g++) {
    const ph = -Math.PI + (2 * Math.PI * g) / grid

    let re = 0

    for (let t = 0; t < beats; t++) {
      const w = 0.5 + 0.5 * Math.cos((Math.PI * t) / beats)
      const [a, b] = auto[t]!

      re +=
        (t === 0 ? 1 : 2) *
        w *
        (a * Math.cos(ph * t) + b * Math.sin(ph * t))
    }

    dens.push({
      e: Math.abs(lv.sign * -wrap(ph - lv.midPhase)),
      d: re / (2 * Math.PI),
    })
  }

  const peak = Math.max(...dens.map(x => x.d))
  const floor = Math.PI / 2 - Math.asin(KESTEN * Math.cos(lv.m))
  const support = dens.filter(x => x.d > FLOOR_DENSITY * peak)

  return {
    m0: lv.m,
    floor,
    lowest: Math.min(...support.map(x => x.e)),
    below: support.filter(x => x.e < floor - FLOOR_TOLERANCE).length,
  }
}

export function swapLinkFluxRun(plan: LinkFluxPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const e2 = (x: number): string => x.toExponential(2)
  const light = pointOf('light', LIGHT, ALPHA)
  const heavy = pointOf('heavy', HEAVY, PHASE_STRING)
  const free = { ...light, name: 'light, no string', sigma: 0 }

  // ---------------- C2: E-SPN-0146's level under the nonlocal string, E-SPN-0148's C1 procedure ----------------
  let c2 = {
    absorbed: NaN,
    eps: NaN,
    fidelity: NaN,
    window: NaN,
    lambda: NaN,
  }

  if (plan.reproduce) {
    const ball = d4Ball(plan.ball)
    const space = shareSpace(
      mesonSpace(ball, heavy.shape, heavy.contact, 0, [0, 0, 0, 0]),
    )
    const engine = threadEngine(space, plan.threads, 3)
    const phaseOf = (eps: number): number =>
      wrap(2 * heavy.mid - heavy.sign * eps)
    const epsOf = (phase: number): number =>
      heavy.sign * -wrap(phase - 2 * heavy.mid)
    const sigma = Math.abs(
      unitAngle(ringUnit(PHASE_STRING[0], PHASE_STRING[1])),
    )
    const kap = stringKappa(24)
    const eps4 = linearWell(24, 24000)
    const F = sigma * kap.mean
    const predicted =
      2 * heavy.m0 +
      eps4 * F * (1 / (2 * Math.tan(heavy.m0) * F)) ** (1 / 3)

    setString(space, heavy.sign * sigma)

    const s0 = mesonStart(ball, ELL_PHASE)
    const f = buildLevel(engine, s0, phaseOf(predicted), plan.sFirst, 1)
    const lv = buildLevel(engine, f.v, f.read.phase, plan.sSecond, 1)
    const h = watchLevel(engine, lv.v, plan.holdBeats, 14)

    c2 = {
      absorbed: h.absorbed,
      eps: epsOf(lv.read.phase),
      fidelity: h.leastFidelity,
      window: h.leastWindow,
      lambda: Math.hypot(...lv.read.lambda2),
    }
    engine.close()
    log(`C2 ${JSON.stringify(c2)}`)
  }

  const C2 = !plan.reproduce || c2.absorbed === RECORDED_C1_ABSORBED

  // ---------------- L5: the register on the rule's vacuum ----------------
  const vacuum = [light, heavy].flatMap(p =>
    [
      ...plan.vacuumSides.map(side => ({ side, sea: 0 })),
      { side: BOX_SIDE, sea: 1 },
    ].map(({ side, sea }) => ({
      point: p.name,
      side,
      sea,
      ...ruleVacuumFlux(p.u, side, sea, plan.vacuumBeats),
    })),
  )
  const seaCrossings = vacuum
    .filter(v => v.sea === 1)
    .every(v => v.crossings === 24 * v.cells * plan.vacuumBeats)

  log(`L5 vacuum ${JSON.stringify(vacuum)}`)

  // ---------------- I1, I2: the word spaces ----------------
  const small = wordSpace(plan.small)
  const big = wordSpace(plan.box)
  const I1 =
    big.gauss &&
    big.distinct &&
    big.costBelowLength === GAUSS_WORDS &&
    small.gauss &&
    small.distinct

  let agree = 0
  let disagree = 0

  for (const [s, stride] of [
    [small, 1],
    [big, SAMPLE_STRIDE],
  ] as const) {
    const index = patternIndex(s)

    for (let e = 0; e < s.size; e += stride) {
      for (let k = 0; k < 576; k++) {
        const t = s.next[e * 576 + k]!

        if (t < 0) {
          continue
        }

        if (
          patternNext(s, index, e, Math.floor(k / 24), k % 24) === t
        ) {
          agree++
        } else {
          disagree++
        }
      }
    }
  }

  const I2 = disagree === 0 && agree > 0

  log(
    `I1 ${I1} (${big.words} words, ${big.size} even, ${big.contacts} contact, cost below length ${big.costBelowLength}); I2 agree ${agree} disagree ${disagree}`,
  )

  // ---------------- I3: the projected flux beat against the meson beat ----------------
  let projectGap = 0

  {
    const ball = d4Ball(plan.box + 2)
    const fm = fluxMeson(big, light.shape, light.contact, 0, K_PROJECT)
    const ms = mesonSpace(
      ball,
      light.shape,
      light.contact,
      0,
      K_PROJECT,
    )
    const psi = newFluxState(big)
    const g = 0.6180339887498949

    for (let e = 0; e < big.size; e++) {
      if (big.length[big.even[e]!]! > plan.box - 2) {
        continue
      }

      const contactWord = big.contactIndex[e]! >= 0

      for (let k = 0; k < 576; k++) {
        if (contactWord && Math.floor(k / 24) === k % 24) {
          continue
        }

        psi.re[e * 576 + k] = (((e * 576 + k) * g) % 1) - 0.5
        psi.im[e * 576 + k] = (((e * 576 + k) * g * g) % 1) - 0.5
      }

      const ci = big.contactIndex[e]!

      if (ci >= 0) {
        for (let j = 0; j < 24; j++) {
          psi.re[big.size * 576 + ci * 24 + j] = ((j * g) % 1) - 0.5
        }
      }
    }

    const project = (x: FluxState): MesonState => {
      const m = newMeson(ball)
      const nb = ball.points.length

      for (let e = 0; e < big.size; e++) {
        const i = big.even[e]!
        const y = [0, 1, 2, 3].map(a => -big.vector[i * 4 + a]!)
        const p = ball.index.get(y.join(','))!

        for (let k = 0; k < 576; k++) {
          m.re[p * 576 + k] = m.re[p * 576 + k]! + x.re[e * 576 + k]!
          m.im[p * 576 + k] = m.im[p * 576 + k]! + x.im[e * 576 + k]!
        }

        const ci = big.contactIndex[e]!

        if (ci >= 0) {
          for (let j = 0; j < 24; j++) {
            m.re[nb * 576 + j] =
              m.re[nb * 576 + j]! + x.re[big.size * 576 + ci * 24 + j]!

            m.im[nb * 576 + j] =
              m.im[nb * 576 + j]! + x.im[big.size * 576 + ci * 24 + j]!
          }
        }
      }

      return m
    }

    for (const beat of [0, 1]) {
      const out = newFluxState(big)

      fluxBeat(fm, psi, out, beat)

      const a = project(out)
      const b = newMeson(ball)

      mesonBeat(ms, project(psi), b, beat)

      for (let k = 0; k < a.re.length; k++) {
        projectGap = Math.max(
          projectGap,
          Math.abs(a.re[k]! - b.re[k]!),
          Math.abs(a.im[k]! - b.im[k]!),
        )
      }
    }
  }

  const I3 = projectGap <= PROJECT_TOLERANCE

  log(`I3 ${projectGap}`)

  // ---------------- I4: the meson beat against the exact rule at the light unit ----------------
  const box = flatBoxTables(BOX_SIDE)
  const X = centerOf(BOX_SIDE)
  const Xf1 = Math.floor(
    box.target[X * 24 + rootIndex([1, 1, 0, 0])]! / 24,
  )
  const checkSpace = mesonSpace(
    d4Ball(CHECK_BALL),
    light.shape,
    light.contact,
    0,
    [0, 0, 0, 0],
  )
  const live = [...Array(CONTACT_STATES).keys()].filter(
    i => i >= STORE_BASE || Math.floor(i / 24) !== i % 24,
  )
  const liveSubset = live.filter((_, i) => i % plan.liveStride === 0)
  const pairSubset = boxStarts([], X, Xf1, [-1, -1, 0, 0]).filter(
    (_, i) => i % plan.pairStride === 0,
  )
  const box0 = boxCheck(
    box,
    boxStarts(liveSubset, X, X, [0, 0, 0, 0]).slice(
      0,
      liveSubset.length,
    ),
    checkSpace,
    () => light.u,
    BOX_TOLERANCE,
  )
  const box1 = boxCheck(
    box,
    pairSubset,
    checkSpace,
    () => light.u,
    BOX_TOLERANCE,
  )
  const I4 =
    box0.differ + box1.differ === 0 &&
    box0.inexact + box1.inexact === 0 &&
    box0.stray + box1.stray === 0

  log(`I4 ${JSON.stringify(box0)} ${JSON.stringify(box1)}`)

  // ---------------- I5: the radial chain against the one-member word engine ----------------
  const radial = [0, light.sigma].map(sigma => {
    const beats = sigma === 0 ? plan.box : plan.box - 1
    const table = Float64Array.from([
      light.shape.c[0],
      light.shape.c[1],
      light.shape.beta[0],
      light.shape.beta[1],
    ])

    let re = new Float64Array(big.words * 24)
    let im = new Float64Array(big.words * 24)
    let pr = new Float64Array(plan.box + 1)
    let pi = new Float64Array(plan.box + 1)
    let cr = new Float64Array(plan.box + 1)
    let ci = new Float64Array(plan.box + 1)
    let gap = 0
    let spread = 0

    for (let d = 0; d < 24; d++) {
      re[d] = 1 / Math.sqrt(24)
    }

    cr[0] = 1

    for (let t = 1; t <= beats; t++) {
      const ore = new Float64Array(big.words * 24)
      const oim = new Float64Array(big.words * 24)

      treeBeat(big, table, sigma, re, im, ore, oim)
      re = ore
      im = oim

      const r = radialBeat(
        light.shape.c,
        light.shape.beta,
        sigma,
        plan.box,
        pr,
        pi,
        cr,
        ci,
      )

      pr = r.pr
      pi = r.pi
      cr = r.cr
      ci = r.ci

      const got = radialOf(big, re, im)

      spread = Math.max(spread, got.spread)

      for (let l = 0; l <= plan.box; l++) {
        gap = Math.max(
          gap,
          Math.abs(got.pr[l]! - pr[l]!),
          Math.abs(got.pi[l]! - pi[l]!),
          Math.abs(got.cr[l]! - cr[l]!),
          Math.abs(got.ci[l]! - ci[l]!),
        )
      }
    }

    return { sigma, beats, gap, spread }
  })
  const I5 = radial.every(
    r => r.gap <= RADIAL_TOLERANCE && r.spread <= RADIAL_TOLERANCE,
  )

  log(`I5 ${JSON.stringify(radial)}`)

  // ---------------- T1: the Kesten floor ----------------
  const floors = KESTEN_POINTS.map(u => ({
    unit: u,
    ...kestenFloor(u, plan.radialBeats, plan.radialGrid),
  }))
  const T1 = floors.every(
    f =>
      f.below === 0 && Math.abs(f.lowest - f.floor) <= FLOOR_TOLERANCE,
  )

  log(`T1 ${JSON.stringify(floors)}`)

  const L5 =
    I1 &&
    vacuum.every(v => v.exact && v.worstLinks === 0) &&
    seaCrossings

  // ---------------- the pair: L3, L4, the window trend, C1, the heavy point ----------------
  const smallRead = pairLevel(small, light, plan, false, log)
  const bigRead = pairLevel(big, light, plan, plan.moves, log)
  const freeRead = pairLevel(big, free, plan, false, log)
  const heavyRead = plan.heavy
    ? pairLevel(big, heavy, plan, false, log)
    : null
  const L3 = bigRead.holds && bigRead.isotropy <= ISOTROPY
  const L4 = Math.abs(bigRead.R - 1) <= R_TOLERANCE
  const C1 = freeRead.absorbed > FREE_ABSORB
  const instrument = I1 && I2 && I3 && I4 && I5
  const controls = C1 && C2
  const status =
    !instrument || !controls
      ? 'partial'
      : T1 && L3 && L4 && L5
        ? 'pass'
        : 'fail'
  const pairLine = (r: PairRead | null): string =>
    r
      ? `${r.name} L ${r.L}: eps ${r.eps.toFixed(6)}, |lambda2| ${r.lambda.toFixed(10)}, residual ${e2(r.residual)}, singlet share ${r.share.toFixed(4)}, profile ${r.profile.map(e2).join(' ')}, fidelity ${r.fidelity.toFixed(6)}, absorbed ${e2(r.absorbed)}, edge ${e2(r.edge)}, holds ${r.holds}; spectrum absorbed ${e2(r.spectrumAbsorbed)}, peaks ${r.peaks}${r.a.length ? `; K^2 coefficients ${r.a.map(x => x.toExponential(6)).join(' ')}, isotropy ${e2(r.isotropy)}, R ${r.R.toFixed(5)}` : ''} (${r.seconds.toFixed(0)} s)`
      : 'not run'

  return verdict({
    status,
    claim: `T1 ${T1} (the tied member's spectrum from ${floors.map(f => `${f.lowest.toFixed(4)} at m0 ${f.m0.toFixed(4)} (floor ${f.floor.toFixed(4)})`).join(', ')}); L3 ${L3} (light composite at L = ${plan.box}: absorbed ${e2(bigRead.absorbed)}, fidelity ${bigRead.fidelity.toFixed(6)}, edge ${e2(bigRead.edge)}, isotropy ${e2(bigRead.isotropy)}); L4 ${L4} (R ${bigRead.R.toFixed(5)}); L5 ${L5}; controls C1 ${C1} (no string: absorbed ${e2(freeRead.absorbed)}) C2 ${C2} (${c2.absorbed}); instrument I1 ${I1} I2 ${I2} I3 ${I3} I4 ${I4} I5 ${I5}`,
    metrics: {
      T1: T1 ? 1 : 0,
      L3: L3 ? 1 : 0,
      L4: L4 ? 1 : 0,
      L5: L5 ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      I4: I4 ? 1 : 0,
      I5: I5 ? 1 : 0,
      words: big.words,
      contacts: big.contacts,
      costBelowLength: big.costBelowLength,
      projectGap,
      lightEps: bigRead.eps,
      lightAbsorbed: bigRead.absorbed,
      lightFidelity: bigRead.fidelity,
      lightShare: bigRead.share,
      lightR: bigRead.R,
      lightIsotropy: bigRead.isotropy,
      smallAbsorbed: smallRead.absorbed,
      freeAbsorbed: freeRead.absorbed,
      heavyEps: heavyRead ? heavyRead.eps : NaN,
      heavyAbsorbed: heavyRead ? heavyRead.absorbed : NaN,
      c2Absorbed: c2.absorbed,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      instrument: instrument ? 1 : 0,
    },
    notes: `L1 and L2. Light point m0 ${light.m0.toFixed(6)}, sigma ${light.sigma.toFixed(6)}; heavy (E-SPN-0146) m0 ${heavy.m0.toFixed(6)}, sigma ${heavy.sigma.toFixed(6)}. Pair: ${pairLine(bigRead)} | ${pairLine(smallRead)} | ${pairLine(freeRead)} | ${pairLine(heavyRead)}. T1 ${JSON.stringify(floors)}. I1 ${big.words} words (${big.size} even, ${big.contacts} contact), cost below length ${big.costBelowLength}; I2 agree ${agree}, disagree ${disagree}; I3 ${e2(projectGap)}; I4 ${JSON.stringify(box0)} ${JSON.stringify(box1)}; I5 ${JSON.stringify(radial)}. L5 ${JSON.stringify(vacuum)}. C2 ${JSON.stringify(c2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
