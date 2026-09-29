// THE REGISTER RESULTS READ ON THE HUSK, NOT IN THE BULK (E-SPN-0167). Physics is read on the husk: the bulk is the
// projector, the husk the screen. E-SPN-0160 (the band, c/4, R = tan m/m, isotropy, the census B* = 2M), E-GRV-0145 (the
// graviton at c/4), E-FRC-0258 (P and CP from the two chiral halves), E-FRC-0259 (three flavors) and E-SPN-0164 (C_b
// and CP at rest) were read in the bulk's 4d momentum space. This file reads each on the husk and gates whether it
// survives the projection.
//
// DERIVED BEFORE THE RUN (code/measure/husk-reading, code/measure/spinor-register; D4 coordinates, depth along e4; the
// light point u = ringUnit(-1, 4), m 0.190126, M = 2m).
// 1. WHICH READING IS PHYSICAL FOR A BAND. Three husk readings exist. (i) The geometric shadow along the cusp (E-SPN-0158:
//    linear and odd, the physical reading on the true mesh). On the flat D4 mesh with the depth along e4 it is pi(x) =
//    (x1, x2, x3). (ii) The quotient of depth period 2 (E-SPN-0155), where pi makes the docks exactly Z^3: it is the
//    shadow on the thinnest column. (iii) The true horosphere {4,3,4} (E-SPN-0156): it has no Brillouin torus, so a band
//    cannot be read there, and it is out of this file's reach (stated). So the physical reading of a member's band is the
//    SHADOW, and on the flat mesh a husk observable sees the member's husk momentum q (the dual of pi) with K4 a depth
//    label. On the thinnest column K4 is 0 or pi, and (q, pi) = (q + (pi, pi, pi), 0) because D4's dual holds
//    (pi, pi, pi, pi): THE HUSK BAND IS THE BULK BAND ON THE SLICE K = (q, 0), exactly. A column of period 2L adds depth
//    copies K4 = pi j / L; with the depth translations a symmetry of the column, depth momentum is conserved.
// 2. THE BAND ON THE SLICE. E depends on K only through |s(K)|^2, s = sum_r r sin(K . r) / sqrt 288. On the slice
//    s4 = sum_r r4 sin(q . r) = 0 (the roots +-e_i +- e4 come in r4 = +-1 pairs at one husk step) and ds/dK4 = sum_r r r4
//    cos(K . r) / sqrt 288 lies along e4, so d|s|^2 / dK4 = 2 s . ds/dK4 = 0: THE GROUP VELOCITY ON THE SLICE HAS NO DEPTH
//    PART, and the husk group velocity is the whole of it. Small q: s = q / sqrt 2 + O(q^3), the 24 roots a 5-design in 4d
//    and so in every 3d slice: the K^2 coefficient is isotropic, c0 = c/4 and R = tan m/m hold on the husk EXACTLY as in
//    the bulk. The slice's top speed is at most the bulk's, since the slice is part of the zone. PREDICTED: survives.
//    UNITS. The husk lattice's coordinates are (x1, x2, x3), so c* = sqrt 2 / 4 = 0.353553 husk docks a beat, the same
//    in every husk direction. "c/4" is a bulk label: c = sqrt 2 is the 4d root's length, and the stream's own husk front
//    is not a sphere. Along a husk direction u it reaches max_r pi(r) . u: 1 along an axis, sqrt 2 along a face diagonal,
//    2/sqrt 3 along a body diagonal. So on the husk the one speed is sqrt 2 / 4 docks a beat, isotropic, while the stream
//    that carries it is anisotropic.
// 3. THE CENSUS ON THE HUSK. A husk pair at total husk momentum 0 is (q, k1) and (-q, k2). With depth momentum conserved
//    (a periodic column), a composite at depth momentum 0 decays only to k2 = -k1, which is a 4d pair at total K = 0: a
//    subset of the bulk census. On the slice S + D = 0 at every q, so B* = 2M; the flats sit at eps pi. The depth copies
//    open no channel. PREDICTED: survives, B* = 2M, no crossing, on the thinnest column and on the period-4 column.
//    READ, NOT GATED: if depth momentum is NOT conserved (the true mesh, which has no depth translations), pairs with
//    k1 != -k2 enter. With the bands S at +E in [M, Smax], D at -E and the flats at pi, the nearest is S(k1) + D(k2) =
//    E1 - E2, at most Smax - M, so B* falls to 3M - Smax (0.303 with the bulk Smax 0.8377), and the census stays closed iff
//    Smax < 3M. At the light point it does, but the binding room shrinks from 0.761 to about 0.30.
// 4. THE GRAVITON (E-GRV-0145). Its slide is carried at the largest group speed over all bands. On the slice that is the
//    husk's (point 2), with its top c/4 reached as q -> 0 (massless) and the 176 flats at speed 0. The slide's tie is
//    K-free algebra. PREDICTED: survives, the graviton at sqrt 2 / 4 husk docks a beat, the same number as the member.
// 5. PARITY ON THE HUSK. Two elements of W(F4) invert the husk: -I (a rotation, det +1, the identity on the register, so
//    it keeps each chiral half) and P_imp = diag(-1, -1, -1, 1) (a reflection, det -1, which swaps the halves). They
//    differ by the depth reflection R4 = diag(1, 1, 1, -1), which fixes every husk point. On the quotient column R4 is a
//    geometric symmetry, since d and -d have one parity. The chiral mass of E-FRC-0258 commutes with -I exactly (it is
//    covariant under the rotations). So ON THE QUOTIENT AN EXACT HUSK PARITY EXISTS, -I, AND P IS NOT VIOLATED THERE: the
//    two halves are two species of different mass, each its own mirror image under husk inversion. E-FRC-0258's P
//    violation is the statement that P_imp is broken, and P_imp is THE husk parity only when the depth has a direction:
//    the true mesh's cusp, or a slab with one husk face, where -I is not a symmetry of the geometry. PREDICTED: CHANGES.
//    P violation is not visible on the quotient, and needs an oriented depth, which is not run here.
// 6. C_b AND CP AT REST (E-SPN-0164) AND THE FLAVORS (E-FRC-0259). The asymmetries are read on the rest beat (K = 0,
//    in every reading) over internal modes (tone, flavor, register), and E-FRC-0259's removability and commutant theorems
//    are algebra on the register and flavor spaces. On the quotient the husk CP is C_b (-I), and -I is the register's
//    identity, so it is E-SPN-0164's C_b P_rot, which breaks together with C_b. PREDICTED: survives.
//
// PREDICTED VERDICT: PARTIAL. Every band, census and speed result survives the projection exactly, and the CP and C_b
// results survive, but P violation does not survive on the quotient (point 5).
//
// GATES, fixed before the gate run (the plan: GATE_PLAN).
//  H1 THE BAND ON THE HUSK (the slice). (a) the full cycle at `bandCheck` slice momenta: 176 flat at 0 (1e-8) and 8 + 8
//     on pi +- E(q, 0) (1e-10); (b) the closed-form s4 and d|s|^2 / dK4 exactly 0 on every slice momentum, and the full
//     cycle's Hellmann-Feynman velocities at `hfMomenta` slice momenta with |v4| <= 1e-10 on every band; (c) the massless
//     twin along the 6 husk directions: 16 states, c0 / (sqrt 2 / 4) within 1e-9 of 1, |gamma| / c0 <= 1e-9; (d) the
//     singlet along the 6 husk directions: |R - tan m/m| <= 1e-9, K^2 coefficients within 1e-6 of the axis's; (e) the
//     husk top speed over `sliceMomenta` slice momenta and 6 x 5 radial ones at most c/4 (1 + 1e-6), massive and
//     massless, and the massless top at least 1 - 1e-5 (reached as q -> 0).
//  H2 THE CENSUS ON THE HUSK. (a) the thinnest column: the 6 husk directions x `censusSteps` steps to 3 pi and
//     `weylExtra` slice momenta: no crossing, |B* - 2M| <= 1e-6; (b) the period-4 column with depth momentum conserved,
//     the members at (q, pi/2) and (-q, -pi/2): the 6 directions x `columnSteps` steps at K4 = pi/2 and the slice
//     momenta shifted to K4 = pi/2: no crossing, |B* - 2M| <= 1e-6.
//  H3 THE GRAVITON: H1 (b) and (e), and the 176 flats at speed at most 1e-10 at the `hfMomenta` points.
//  H4 PARITY ON THE HUSK. Exact: -I (det +1, register identity), P_imp (det -1) and R4 (det -1) in W(F4); -I and P_imp
//     send every root's husk step to its negative, R4 fixes it; R4 keeps the quotient's depth parity on every point of a
//     radius-6 husk ball; the chiral pieces commute with -I exactly and P_imp maps the + pieces onto the - pieces
//     exactly. Spectral, at `symmetryMomenta` slice momenta with E-FRC-0258's chiral mass: P_rot (+ at q against + at
//     -q, and - likewise) <= 1e-9, P_imp (+ at q against - at -q, rephased) > 1e-3. Holding H4 means the derived CHANGE:
//     P is exact on the quotient.
//  H5 CP AT REST: -I's register action is the 8 x 8 identity exactly, so the quotient's husk CP is E-SPN-0164's C_b
//     P_rot.
// INSTRUMENT (a failure makes the verdict partial). I1 the derived speed equals the full cycle's Hellmann-Feynman top
//  speed at the `hfMomenta` slice points to 1e-6.
// CONTROLS (a failure makes the verdict partial). K1 THE BULK READING REPRODUCES E-SPN-0160 BIT FOR BIT: its c0 / c
//  0.2500000000006183, R defect 8.027356557249732e-12, isotropy 1.05494502022907e-11, top 0.6066521753746141, massless
//  top 0.9999995625189857, g max 0.3667882424043842, and the census B* 0.7605024133858624 with 0 crossings, each from its
//  own momenta through this file's readers. K2 E-SPN-0155'S QUOTIENT LAPLACIAN: the 4d root sum at (q, 0) equals
//  husk-meson's huskSymbol and E-FRC-0241's weighted husk symbol to 1e-12, on 256 husk momenta. K3 THE BULK
//  PARITY REPRODUCES E-FRC-0258 BIT FOR BIT: P_imp (rephased) 0.17999253343088784 and P_rot 1.3322676295501878e-15 on
//  its 64 bulk momenta, with gK = (-q, K4).
// READ, gating nothing: the loose census (point 3), the slice's and the bulk's Smax, the stream's husk front along the 6
//  directions, the slice's massive top against the bulk's.
// Verdict: fail if H1, H2, H3, H4 or H5 fails (a derivation refuted); partial if the instrument or a control fails, or if
// every gate holds but a result changes on the husk (H4 holding means it does); pass if every result survives.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/hsk-probe1.log (closed-form band only, no eigensolves): M 0.380251, 3M
//  1.140754; Smax on 4,096 slice momenta 0.837565 against 0.837692 on 4,096 bulk momenta; the slice's massive top
//  0.607432 of c/4 (the bulk sample's 0.606652 is below it: the bulk sample missed the maximum, both under 1); the
//  massless top 0.988 on the slice without small momenta (so the gate adds radial ones); s4 and d|s|^2/dK4 exactly 0 on
//  every slice momentum; the stream's husk front 1, 1.414214, 1.154701 along the axis, face and body; the loose census on
//  a 12^3 grid, B* 0.7605 on one depth and 0.3277 over four (the pair D at -0.3945, S at 0.8273); -I, P_imp and R4 all in
//  W(F4) with dets 1, -1, -1, -I and P_imp inverting every husk step and R4 fixing it. The first loose census also
//  flagged "reaches the threshold", which is S + S at rest, the continuum's own floor, not a channel below it: that
//  flag was removed before the gate run. tmp/hsk-smoke.log: every code path on a small plan (83 s; gating nothing):
//  H1 to H5 and I1 held as derived, H4's husk P_imp 0.184 and P_rot 1.8e-15; K1 matched E-SPN-0160's recorded c0/c, R
//  defect, isotropy, massless top, g max and census B* bit for bit but not the massive top (which needs the gate's 4,096
//  momenta), K3 needs the gate's 64 momenta, and K2 failed as first written: it demanded the root sum equal huskSymbol
//  BIT FOR BIT, and the two modules list the roots in different orders, so the float sums differ by 1.8e-14 (tmp/
//  hsk-probe2.log: 144 of 256 equal, largest gap 1.8e-14; the weighted symbol also 1.8e-14). CORRECTED BEFORE THE GATE
//  RUN: K2 reads both to 1e-12. No other gate moved.
//
// FIRST RUN (tmp/hsk-exp-run1.log, 823 s): PARTIAL, as predicted: H1 to H5, the instrument and K1 to K3 all hold, and
//  H4 holding is the derived change. No gate moved and none was rerun.
//  - H1: 176 + 8 + 8 on 64 slice momenta (gap 2.3e-15); depth slope exactly 0, full-cycle |v4| at most 1.4e-16; massless
//    pairs of 16 along 6 husk directions, c0 / (sqrt 2 / 4) 1 to 8e-12, |gamma| / c0 at most 2.6e-11; R - tan m/m at most
//    8.0e-12, isotropy 1.1e-11; husk top 0.607432 massive, 0.99999956 massless, of c/4.
//  - H2: thin column B* 0.760502413 = 2M, 0 crossings; period-4 column (K4 = pi/2) B* 0.760502413, 0 crossings.
//  - H3: the 176 flats at speed 1.2e-16.
//  - H4: -I, P_imp, R4 exact as derived; the quotient's depth parity kept on the radius-6 ball; the chiral pieces commute
//    with -I and P_imp swaps them; husk P_rot 1.8e-15 (exact), husk P_imp 0.184 (broken): the husk sees an exact parity.
//  - H5 holds; I1 1.4e-16; K1 reproduces E-SPN-0160 bit for bit (top 0.6066521753746141, census B* 0.7605024133858624);
//    K2 to 1e-12; K3 reproduces E-FRC-0258 bit for bit (P_imp 0.17999253343088784, P_rot 1.3322676295501878e-15).
//  - Read: loose census on a 16^3 grid and 4 depths B* 0.320294, against 3M - Smax 0.303062 (the pair D at -0.392, S at
//    0.832): closed, with the room cut from 0.761 to about 0.32.
// NEXT. (1) Read P on a geometry with an oriented depth (a slab with one husk face, or the true cusp), where -I is not a
//  symmetry: that is where E-FRC-0258's P violation can be physical. E-SPN-0166's domain wall is exactly such a slab.
//  (2) The true horosphere, where depth momentum is not conserved: the loose census's 3M - Smax is the binding room a
//  light member keeps there. (3) Every c/4 in the notes is a bulk label: on the husk the one speed is sqrt 2 / 4 husk
//  docks a beat, isotropic, while the stream's husk front runs from 1 to sqrt 2.
//
// Depth L1 (the slice, the depth slope and the parity lifts are algebra) and L2 (the bands, speeds and censuses read
// off the exact register pieces). DETERMINISM: no random numbers; Weyl sequences, grids and fixed paths. NOTHING MOVES:
// the pieces hand values between slots and register components of one dock, and the stream takes each slot's value one
// dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { cycleBand, cyclePhases } from '@/code/measure/swap-cone'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { radialPaths, restFrame, type Census } from '@/code/measure/two-beat'
import {
  commutesExactly,
  cycleMasslessPairN,
  diracPhase,
  diracSpeed,
  f4Group,
  frameRN,
  matMul,
  pairCensusN,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  scaled,
  singletProjector24,
  structureVector,
  weylDirections,
} from '@/code/measure/spinor-register'
import { chiralPiece, chirality2, det4, intertwinesExactly, phaseMismatch, SECTOR_ROOTS, sectorBasis, sectorBlock, volumeRight } from '@/code/measure/chiral-register'
import { huskPoint, huskSymbol } from '@/code/measure/husk-meson'
import { symbolAt } from '@/code/measure/husk-coulomb'
import { depthSlope, HUSK_DIRS, huskGrid, huskSymbolFromRoots, largestE, looseCensus, onSlice, sliceMomenta, streamFront } from '@/code/measure/husk-reading'

const C = Math.SQRT2
const C_QUARTER = C / 4
const BULK_DIRS: readonly number[][] = HUSK_DIRS.slice(0, 4)
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const LIGHT: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const MASSLESS: readonly [number, number] = [0, 3]
const FLAT_TOLERANCE = 1e-8
const BAND_TOLERANCE = 1e-10
const DEPTH_TOLERANCE = 1e-10
const GAMMA_TOLERANCE = 1e-9
const SPEED_TOLERANCE = 1e-6
const MASSLESS_REACH = 1e-5
const R_EXACT = 1e-9
const ISOTROPY = 1e-6
const BSTAR_TOLERANCE = 1e-6
const SYMMETRY_HOLDS = 1e-9
const SYMMETRY_BREAKS = 1e-3
const HF_TOLERANCE = 1e-6
const SYMBOL_TOLERANCE = 1e-12
const PAIR_KAPPA = 0.01
const BALL = 6
const COLUMN_DEPTH = Math.PI / 2
const REC = {
  c0OverC: 0.2500000000006183,
  Rdefect: 8.027356557249732e-12,
  isotropy: 1.05494502022907e-11,
  top: 0.6066521753746141,
  topMassless: 0.9999995625189857,
  gMax: 0.3667882424043842,
  censusBstar: 0.7605024133858624,
  Pimp: 0.17999253343088784,
  Prot: 1.3322676295501878e-15,
}

export type HuskPlan = { sliceMomenta: number; bandCheck: number; hfMomenta: number; censusSteps: number; columnSteps: number; weylExtra: number; symmetryMomenta: number; looseGrid: number; bulkMomenta: number; bulkCensusSteps: number }

export const GATE_PLAN: HuskPlan = { sliceMomenta: 4096, bandCheck: 64, hfMomenta: 8, censusSteps: 600, columnSteps: 300, weylExtra: 256, symmetryMomenta: 64, looseGrid: 16, bulkMomenta: 4096, bulkCensusSteps: 600 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/husk-reading',
  code: 'E-SPN-0167',
  title:
    'the register results read on the husk, not in the bulk, partial (P violation does not survive on the quotient): on the flat mesh the physical husk reading is the shadow along the cusp, and on the thinnest column it is exactly the bulk band on the slice K = (q, 0), where the depth slope of the band vanishes, so the member band, c* = sqrt 2 / 4 husk docks a beat (c/4 is a bulk label: the stream\'s own husk front runs 1 to sqrt 2), R = tan m/m, isotropy, the census B* = 2M (also on a column with conserved depth momentum) and the graviton\'s speed all survive exactly, and C_b and CP at rest survive; but two W(F4) elements invert the husk, -I (keeping the chiral halves) and the depth-keeping reflection (swapping them), and on the quotient the rule keeps -I, so the husk sees an exact parity and E-FRC-0258\'s P violation needs an oriented depth (the cusp or a slab face); read: with depth momentum not conserved the census still closes but B* falls to 3M - Smax',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskReadingRun(GATE_PLAN)
  },
})

const unitValue = (u: RingUnit): [number, number] => {
  const t = unitAngle(u)

  return [Math.cos(t), Math.sin(t)]
}
const conj = (u: readonly [number, number]): [number, number] => [u[0], -u[1]]
const mOf = (u: RingUnit): number => wrap(unitAngle(u) - Math.PI) / 2
const eqM = (a: readonly (readonly number[])[], b: readonly (readonly number[])[]): boolean => a.every((r, i) => r.every((x, j) => x === (b[i] as number[])[j]))

export function huskReadingRun(plan: HuskPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const uM = ringUnit(MINUS[0], MINUS[1])
  const uZ = ringUnit(MASSLESS[0], MASSLESS[1])
  const thetaL = unitAngle(uL)
  const mL = mOf(uL)
  const ML = 2 * mL
  const qS = scaled(singletProjector24(), 24)
  const D48 = partnerProjector48()
  const qD = scaled(D48, 48)
  const schedule = (u: [number, number]): CMatrix[] => [registerPiece(qS, u), registerPiece(qD, conj(u))]
  const PL = schedule(unitValue(uL))
  const PZ = schedule(unitValue(uZ))
  const frameL = restFrame(thetaL, -thetaL, ML)
  const tanL = Math.tan(mL) / mL
  const slice = sliceMomenta(plan.sliceMomenta)
  const huskRadial = HUSK_DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))

  // ---------------- H1 (a): the band on the slice ----------------
  let bandGap = 0
  let bandCounts = true

  for (const K of slice.slice(0, plan.bandCheck)) {
    const ph = cyclePhases(PL, REGISTER_ROOTS, K)
    const E = diracPhase(K, ML)
    const up = ph.filter(x => Math.abs(wrap(x - Math.PI - E)) <= BAND_TOLERANCE).length
    const down = ph.filter(x => Math.abs(wrap(x - Math.PI + E)) <= BAND_TOLERANCE).length
    const flat = ph.filter(x => Math.abs(wrap(x)) <= FLAT_TOLERANCE).length

    if (up !== 8 || down !== 8 || flat !== 176) bandCounts = false
    bandGap = Math.max(bandGap, ...ph.map(x => Math.min(Math.abs(wrap(x)), Math.abs(wrap(x - Math.PI - E)), Math.abs(wrap(x - Math.PI + E)))))
  }

  const H1a = bandCounts
  log('H1 a')

  // ---------------- H1 (b), H3, I1: the depth slope and the full cycle's velocities ----------------
  const slopes = slice.map(depthSlope)
  const slopeMax = Math.max(...slopes.map(s => Math.max(Math.abs(s.s4), Math.abs(s.slope))))
  let v4Max = 0
  let flatSpeed = 0
  let hfGap = 0

  for (const K of slice.slice(0, plan.hfMomenta)) {
    const band = cycleBand(PL, REGISTER_ROOTS, K)

    band.velocity.forEach((v, i) => {
      v4Max = Math.max(v4Max, Math.abs(v[3] as number))
      if (Math.abs(wrap(band.phase[i] as number)) <= FLAT_TOLERANCE) flatSpeed = Math.max(flatSpeed, Math.hypot(...v))
    })
    hfGap = Math.max(hfGap, Math.abs(Math.max(...band.velocity.map(v => Math.hypot(...v))) - diracSpeed(K, ML)))
  }

  const H1b = slopeMax === 0 && v4Max <= DEPTH_TOLERANCE
  const I1 = hfGap <= HF_TOLERANCE
  log('H1 b, I1')

  // ---------------- H1 (c), (d): the massless twin and the singlet along husk directions ----------------
  const pairs = HUSK_DIRS.map(u => cycleMasslessPairN(PZ, Math.PI, u, PAIR_KAPPA, REGISTER_ROOTS))
  const H1c = pairs.every(x => x.size === 16 && Math.abs(x.gamma) / C_QUARTER <= GAMMA_TOLERANCE && Math.abs(x.c0 / C_QUARTER - 1) <= GAMMA_TOLERANCE)
  const fits = HUSK_DIRS.map(u => frameRN(PL, frameL, thetaL, u, C_QUARTER, SCALES, REGISTER_ROOTS))
  const huskIsotropy = Math.max(...fits.map(x => Math.abs(x.c2 / (fits[0] as { c2: number }).c2 - 1)))
  const huskRdefect = Math.max(...fits.map(x => Math.abs(x.R - tanL)))
  const H1d = huskRdefect <= R_EXACT && huskIsotropy <= ISOTROPY
  log('H1 c d')

  // ---------------- H1 (e): the husk top speed ----------------
  const speedSet = [...slice, ...huskRadial]
  const topHusk = Math.max(...speedSet.map(K => diracSpeed(K, ML))) / C_QUARTER
  const topHuskZ = Math.max(...speedSet.map(K => diracSpeed(K, 0))) / C_QUARTER
  const H1e = topHusk <= 1 + SPEED_TOLERANCE && topHuskZ <= 1 + SPEED_TOLERANCE && topHuskZ >= 1 - MASSLESS_REACH
  const H1 = H1a && H1b && H1c && H1d && H1e
  const H3 = H1b && H1e && flatSpeed <= DEPTH_TOLERANCE

  // ---------------- H2: the census on the husk ----------------
  const huskPaths = radialPaths(HUSK_DIRS, 3 * Math.PI, plan.censusSteps)
  const censusThin = pairCensusN(PL, frameL, huskPaths, slice.slice(0, plan.weylExtra), REGISTER_ROOTS)
  const H2a = censusThin.crossings === 0 && Math.abs(censusThin.Bstar - 2 * ML) <= BSTAR_TOLERANCE
  log('H2 a')

  const columnPaths = HUSK_DIRS.map(u => Array.from({ length: plan.columnSteps }, (_, j) => [...onSlice(u.map(x => (x * 3 * Math.PI * (j + 1)) / plan.columnSteps)).slice(0, 3), COLUMN_DEPTH]))
  const columnExtra = slice.slice(0, plan.weylExtra).map(K => [K[0] as number, K[1] as number, K[2] as number, COLUMN_DEPTH])
  const censusColumn = pairCensusN(PL, frameL, columnPaths, columnExtra, REGISTER_ROOTS)
  const H2b = censusColumn.crossings === 0 && Math.abs(censusColumn.Bstar - 2 * ML) <= BSTAR_TOLERANCE
  const H2 = H2a && H2b
  log('H2 b')

  // ---------------- H4, H5: parity on the husk ----------------
  const group = f4Group()
  const find = (d: readonly number[]) => group.find(e => e.matrix.every((r, i) => r.every((x, j) => Math.abs(x - (i === j ? (d[i] as number) : 0)) < 1e-12)))
  const minusI = find([-1, -1, -1, -1])
  const pImp = find([-1, -1, -1, 1])
  const r4 = find([1, 1, 1, -1])
  const act = (m: readonly (readonly number[])[], r: readonly number[]): number[] => m.map(row => row.reduce((s, x, k) => s + x * (r[k] as number), 0))
  const husk = (v: readonly number[]): number[] => [v[0] as number, v[1] as number, v[2] as number]
  const sendsHusk = (m: readonly (readonly number[])[], sign: number): boolean => DOCK_ROOTS.every(r => husk(act(m, r)).every((x, k) => x === sign * (husk(r)[k] as number)))
  const J = volumeRight()
  const I8 = J.map((_, i) => J.map((_, j) => (i === j ? 1 : 0)))
  let ballParity = true

  for (let a = -BALL; a <= BALL; a++) {
    for (let b = -BALL; b <= BALL; b++) {
      for (let c = -BALL; c <= BALL; c++) {
        if (a * a + b * b + c * c > BALL * BALL) continue

        const p = huskPoint(a, b, c)
        const image = r4 ? act(r4.matrix, p) : p

        if (((((image[3] as number) % 2) + 2) % 2) !== (p[3] as number) || husk(image).some((x, k) => x !== (husk(p)[k] as number))) ballParity = false
      }
    }
  }

  const S24 = singletProjector24()
  const P2 = chirality2(J, 1)
  const M2 = chirality2(J, -1)
  const S48p = matMul(S24, P2)
  const S48m = matMul(S24, M2)
  const D96p = matMul(D48, P2)
  const D96m = matMul(D48, M2)
  const H4exact =
    !!minusI &&
    !!pImp &&
    !!r4 &&
    det4(minusI.matrix) === 1 &&
    det4(pImp.matrix) === -1 &&
    det4(r4.matrix) === -1 &&
    eqM(minusI.register, I8) &&
    sendsHusk(minusI.matrix, -1) &&
    sendsHusk(pImp.matrix, -1) &&
    sendsHusk(r4.matrix, 1) &&
    ballParity &&
    [S48p, S48m, D96p, D96m].every(x => commutesExactly(minusI, x)) &&
    intertwinesExactly(pImp, S48p, S48m) &&
    intertwinesExactly(pImp, D96p, D96m)
  const H5 = !!minusI && eqM(minusI.register, I8)
  log('H4 exact')

  const qSp = scaled(S48p, 48)
  const qSm = scaled(S48m, 48)
  const qDp = scaled(D96p, 96)
  const qDm = scaled(D96m, 96)
  const chiral = [chiralPiece(qSp, qSm, unitValue(uL), unitValue(uM)), chiralPiece(qDp, qDm, conj(unitValue(uL)), conj(unitValue(uM)))]
  const basis = sectorBasis(J)
  const plus = chiral.map(P => sectorBlock(P, basis, 0).block)
  const minus = chiral.map(P => sectorBlock(P, basis, 1).block)
  const roots = SECTOR_ROOTS(DOCK_ROOTS)
  const parityReadings = (momenta: readonly (readonly number[])[], g: (K: readonly number[]) => number[]): { Pimp: number; Prot: number } => {
    const r = { Pimp: 0, Prot: 0 }

    for (const K of momenta) {
      const neg = K.map(x => -x)
      const pK = cyclePhases(plus, roots, K)
      const mK = cyclePhases(minus, roots, K)
      const mG = cyclePhases(minus, roots, g(K))
      const pN = cyclePhases(plus, roots, neg)
      const mN = cyclePhases(minus, roots, neg)

      r.Pimp = Math.max(r.Pimp, phaseMismatch(pK, mG, true))
      r.Prot = Math.max(r.Prot, phaseMismatch(pK, pN, false), phaseMismatch(mK, mN, false))
    }

    return r
  }
  const gK = (K: readonly number[]): number[] => [-(K[0] as number), -(K[1] as number), -(K[2] as number), K[3] as number]
  const huskParity = parityReadings(slice.slice(0, plan.symmetryMomenta), gK)
  const H4 = H4exact && huskParity.Prot <= SYMMETRY_HOLDS && huskParity.Pimp > SYMMETRY_BREAKS
  log('H4 spectral')

  // ---------------- K1: the bulk reading reproduces E-SPN-0160 ----------------
  const bulk = weylMomenta(plan.bulkMomenta)
  const bulkRadial = BULK_DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))
  const bulkPairs = BULK_DIRS.map(u => cycleMasslessPairN(PZ, Math.PI, u, PAIR_KAPPA, REGISTER_ROOTS))
  const bulkFits = BULK_DIRS.map(u => frameRN(PL, frameL, thetaL, u, C_QUARTER, SCALES, REGISTER_ROOTS))
  const bulkRdefect = Math.max(...bulkFits.map(x => Math.abs(x.R - tanL)))
  const bulkIsotropy = Math.max(...bulkFits.map(x => Math.abs(x.c2 / (bulkFits[0] as { c2: number }).c2 - 1)))
  const bulkTop = Math.max(...[...bulk, ...bulkRadial].map(K => diracSpeed(K, ML))) / C_QUARTER
  const bulkTopZ = Math.max(...[...bulk, ...bulkRadial].map(K => diracSpeed(K, 0))) / C_QUARTER
  let gMax = 0

  for (const u of weylDirections(2000)) for (let k = 0.05; k < 3.2; k += 0.05) gMax = Math.max(gMax, Math.hypot(...structureVector(u.map(x => x * k))) / 2)

  const bulkCensus: Census = pairCensusN(PL, frameL, radialPaths(BULK_DIRS, 3 * Math.PI, plan.bulkCensusSteps), bulk.slice(0, plan.weylExtra), REGISTER_ROOTS)
  const k1 = { c0OverC: (bulkPairs[0] as { c0: number }).c0 / C, Rdefect: bulkRdefect, isotropy: bulkIsotropy, top: bulkTop, topMassless: bulkTopZ, gMax, censusBstar: bulkCensus.Bstar }
  const K1 =
    k1.c0OverC === REC.c0OverC &&
    k1.Rdefect === REC.Rdefect &&
    k1.isotropy === REC.isotropy &&
    k1.top === REC.top &&
    k1.topMassless === REC.topMassless &&
    k1.gMax === REC.gMax &&
    k1.censusBstar === REC.censusBstar &&
    bulkCensus.crossings === 0
  log('K1')

  // ---------------- K2: the quotient Laplacian ----------------
  const huskSample = slice.slice(0, 256).map(K => [K[0] as number, K[1] as number, K[2] as number])
  const K2 = huskSample.every(q => Math.abs(huskSymbolFromRoots(q) - huskSymbol(q)) <= SYMBOL_TOLERANCE && Math.abs(huskSymbol(q) - symbolAt('husk', q)) <= SYMBOL_TOLERANCE)

  // ---------------- K3: the bulk parity reproduces E-FRC-0258 ----------------
  const bulkParity = parityReadings(weylMomenta(plan.symmetryMomenta), gK)
  const K3 = bulkParity.Pimp === REC.Pimp && bulkParity.Prot === REC.Prot
  log('K2 K3')

  // ---------------- reads ----------------
  const grid = huskGrid(plan.looseGrid)
  const looseThin = looseCensus(ML, grid, [0])
  const looseColumn = looseCensus(ML, grid, [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2])
  const smaxSlice = largestE(slice, ML)
  const smaxBulk = largestE(bulk, ML)
  const fronts = HUSK_DIRS.map(streamFront)

  const instrument = I1
  const controls = K1 && K2 && K3
  const derived = H1 && H2 && H3 && H4 && H5
  const changes = H4 // H4 holding is the derived change: P is exact on the quotient
  const status = !derived ? 'fail' : !instrument || !controls || changes ? 'partial' : 'pass'
  const f = (x: number, d = 9): string => x.toFixed(d)

  return verdict({
    status,
    claim: `H1 ${H1} (a ${H1a}: band gap ${bandGap.toExponential(2)}; b ${H1b}: closed-form depth slope max ${slopeMax}, full-cycle |v4| max ${v4Max.toExponential(2)}; c ${H1c}: c0 / (sqrt 2 / 4) ${pairs.map(x => f(x.c0 / C_QUARTER, 12)).join(' ')}; d ${H1d}: R - tan m/m max ${huskRdefect.toExponential(2)}, isotropy ${huskIsotropy.toExponential(2)}; e ${H1e}: husk top ${f(topHusk, 6)} massive, ${f(topHuskZ, 9)} massless, of c/4); H2 ${H2} (a ${H2a}: B* ${f(censusThin.Bstar)} x${censusThin.crossings}; b ${H2b}: period-4 column B* ${f(censusColumn.Bstar)} x${censusColumn.crossings}; 2M ${f(2 * ML)}); H3 ${H3} (flats' speed ${flatSpeed.toExponential(2)}); H4 ${H4} (exact ${H4exact}; husk P_rot ${huskParity.Prot.toExponential(2)}, husk P_imp ${f(huskParity.Pimp, 6)}: on the quotient -I is an exact husk parity, so P CHANGES); H5 ${H5}; instrument I1 ${I1} (HF gap ${hfGap.toExponential(2)}); controls K1 ${K1} K2 ${K2} K3 ${K3}; read: loose census B* ${f(looseColumn.Bstar, 6)} (formula 3M - Smax ${f(3 * ML - smaxBulk, 6)}), thin ${f(looseThin.Bstar, 6)}`,
    metrics: {
      H1: flag(H1),
      H1a: flag(H1a),
      H1b: flag(H1b),
      H1c: flag(H1c),
      H1d: flag(H1d),
      H1e: flag(H1e),
      H2: flag(H2),
      H2a: flag(H2a),
      H2b: flag(H2b),
      H3: flag(H3),
      H4: flag(H4),
      H5: flag(H5),
      instrument: flag(instrument),
      K1: flag(K1),
      K2: flag(K2),
      K3: flag(K3),
      mLight: mL,
      cStarHuskDocksPerBeat: C_QUARTER,
      bandGap,
      slopeMax,
      v4Max,
      flatSpeed,
      hfGap,
      huskRdefect,
      huskIsotropy,
      topHusk,
      topHuskMassless: topHuskZ,
      censusThinBstar: censusThin.Bstar,
      censusThinCrossings: censusThin.crossings,
      censusColumnBstar: censusColumn.Bstar,
      censusColumnCrossings: censusColumn.crossings,
      huskPimp: huskParity.Pimp,
      huskProt: huskParity.Prot,
      looseBstar: looseColumn.Bstar,
      looseThinBstar: looseThin.Bstar,
      smaxSlice,
      smaxBulk,
      seconds: (Date.now() - started) / 1000,
    },
    control: { K1: flag(K1), K2: flag(K2), K3: flag(K3), instrument: flag(instrument) },
    notes: `L1 and L2. Light m ${f(mL, 6)}, 2M ${f(2 * ML)}, 3M ${f(3 * ML)}. c* = sqrt 2 / 4 = ${f(C_QUARTER, 6)} husk docks a beat; the stream's husk front along the 6 husk directions ${fronts.map(x => f(x, 6)).join(' ')}. H1: 64 slice momenta 176 + 8 + 8 (gap ${bandGap.toExponential(2)}); massless pairs ${pairs.map(x => `size ${x.size} c0/(c/4) ${f(x.c0 / C_QUARTER, 12)} gamma ${(x.gamma / C_QUARTER).toExponential(2)}`).join(', ')}; R - tan m/m ${fits.map(x => (x.R - tanL).toExponential(2)).join(' ')} (tan m/m ${f(tanL)}); husk top ${f(topHusk, 9)} (bulk sample ${f(bulkTop, 9)}), massless ${f(topHuskZ, 9)}. H2: thin B* ${f(censusThin.Bstar)} x${censusThin.crossings}, nearest at |q| ${Math.hypot(...censusThin.at).toFixed(4)} (pair ${censusThin.pair.map(x => x.toFixed(4)).join(', ')}); column K4 = pi/2 B* ${f(censusColumn.Bstar)} x${censusColumn.crossings}. H4: -I det ${minusI ? det4(minusI.matrix) : 'none'}, P_imp det ${pImp ? det4(pImp.matrix) : 'none'}, R4 det ${r4 ? det4(r4.matrix) : 'none'}; ball parity ${ballParity}; husk P_rot ${huskParity.Prot.toExponential(2)}, P_imp ${f(huskParity.Pimp, 9)}. K1: c0/c ${k1.c0OverC}, R defect ${k1.Rdefect}, isotropy ${k1.isotropy}, top ${k1.top}, massless ${k1.topMassless}, g max ${k1.gMax}, census B* ${k1.censusBstar} x${bulkCensus.crossings}. K3: bulk P_imp ${bulkParity.Pimp}, P_rot ${bulkParity.Prot}. Read: loose census (depth momentum not conserved) over a ${plan.looseGrid}^3 grid and 4 depths B* ${f(looseColumn.Bstar, 6)} (pair ${looseColumn.pair.map(x => x.toFixed(4)).join(', ')}), one depth ${f(looseThin.Bstar, 6)}; Smax slice ${f(smaxSlice, 6)}, bulk ${f(smaxBulk, 6)}, 3M - Smax ${f(3 * ML - smaxBulk, 6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
