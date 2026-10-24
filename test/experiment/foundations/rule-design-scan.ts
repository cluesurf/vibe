// A SURVEY OF THE CANDIDATE RULE'S DISCRETE DESIGN CHOICES (E-FND-0177). The candidate rule for moving matter (readme,
// open problem 1) fixed four discrete choices one at a time: the swap coin (E-SPN-0143), one new prime, 7, for the mass
// angle (E-SPN-0143), the one-beat schedule, and an 8-value Cl+(4) register per member (E-SPN-0160). This file reads a
// small grid of the alternatives the experiments themselves name, all on the same cheap one-body reads, with every
// scoring rule fixed here before the run. It is a design-space survey: it reports every variant's numbers and adopts
// nothing.
//
// THE GRID (code/measure/rule-design-scan; one body, K in D4 coordinates, c = sqrt 2):
//  coin    phi = pi/3, 2pi/3 (n = 1, E-SPN-0142's), 5pi/6, 11pi/12, pi (the swap): the plane E-SPN-0143 reported
//  mass    the mixer angle theta = phi + delta, delta from the ring: IN-RING delta = pi/3 (Z[w][1/6], m = pi/6 at the
//          swap); for each split prime of norm q = 7, 13, 19, 31 (p = 3 + w, 4 + w, 5 + 2w, 6 + w; code/measure/swap-cone
//          ringAngle) the k = 1 point (the least exponent) and the lightest |delta| over k = 1 .. 8
//  schedule one beat [theta]; two beats [phi, theta] (E-SPN-0143 U4a's form); three beats [phi, phi, theta] (its
//          period-3 read)
//  register none (24 slots), or Cl+(4) (8 values, E-SPN-0160's two-beat S / D schedule at theta = pi + |delta|, the swap
//          coin built in, so the register is read at the swap coin and one schedule only)
// 5 coins x 9 masses x 3 schedules = 135 slot variants, plus 9 register variants: 144.
// NOT RUN, and why: the 16-value register (the whole Clifford algebra) has no band code (code/measure/register-graviton
// holds only its capture); a 2-value register cannot be exact in the ring (E-SPN-0160 point 1); a staggered sea keeps no
// W(F4) (the D4 root graph has triangles, E-SPN-0143 point 7). The love is read for the slot top speed only (the
// register pieces are written for the hole).
//
// THE SCORES, fixed before the run:
//  S1 (relativity of a lone member) the largest |R / (tan m / m) - 1| over the four directions (axis, face, body,
//     generic), R = c0^2 / c^2, c0 the variant's own massless speed (the one-beat pair at theta = phi, or the register's
//     massless twin), c^2 the K^2 coefficient of the singlet's per-beat eps^2 (scales 0.1 .. 0.5 m), m the per-beat
//     mass. PASS at <= 1e-3.
//  S2 (leading-order isotropy) the largest |c^2(u) / c^2(axis) - 1| over the four directions. PASS at <= 1e-6.
//  A variant with no singlet at K = 0 fails both.
//  THE SCORED SET: the variants passing S1 and S2.
// THE HELD-OUT CHECK, never used to score: ONE LIGHT SPEED (E-SPN-0143 U1, E-SPN-0160 F1 d). The largest group speed per
//  beat over every band, hole and love, at 1,024 Weyl momenta plus 20 radial ones (|K| 1e-3 to 1 on the four directions),
//  for the variant AND its massless twin, at most c0 (1 + 1e-6). (Register: the derived Dirac band, checked against the
//  full cycle's Hellmann-Feynman speed at 8 momenta.)
// INSTRUMENT (a failure makes the verdict open): I1 the swap coin's one-beat point at q = 7, k = 3 reproduces E-SPN-0143's
//  R* = 1.0007300338253453 to 1e-12 relative and its c0 = c / 2 to 1e-9; I2 the register's c0 = c / 4 to 1e-9 at every
//  mass, and its derived speed equals the Hellmann-Feynman speed to 1e-6.
// VERDICT: open if the instrument fails; pass if the scored set is not empty and every scored variant passes the held-out
//  check (the two scores, read alone, already pick variants that keep one light speed); partial if some scored
//  variants pass it and some fail (the scores over-select: they cannot tell the coins apart on their own); fail if no
//  scored variant passes it.
//
// PREDICTED (from E-SPN-0143's derivations and plane, E-SPN-0160 point 5), before the run: S2 holds for every variant
//  with a singlet (the K^2 form of a W(F4)-invariant walk is isotropic by symmetry, so S2 cannot discriminate); S1 holds
//  for every one-beat slot variant at every coin (E-SPN-0143 reported R = tan m / m at every phi) and for the register,
//  and FAILS for the two- and three-beat schedules (R = tan(b m) / (b m) for b beats: the kick sets R, not its rate);
//  the held-out check fails for every coin but the swap (the massless pair tops c0 by 2 gamma K, gamma = cot(phi/2)/8).
//  So the predicted verdict is PARTIAL, and the variants passing everything are the swap coin's one-beat walk and the
//  register, at every mass, whatever the prime: the prime 7 is not singled out by these scores (it is the least split
//  prime, which sets the least exponent of a light mass, a cost these scores do not see).
//
// FIRST RUN (2026-10-20, test/record/E-FND-0177/fnd177-run.log, 1,468 s, one thread): PARTIAL, as predicted, with one prediction wrong. No
//  probe read any score before this header was written (tmp/fnd177-time.ts timed one variant of each kind and printed
//  only seconds).
//  - Instrument: I1 R* = 1.0007300338253453 bit for bit, c0 = c / 2; I2 c0 = c / 4 at every mass, HF gap within 1e-6.
//  - Mass points (delta): in-ring 1.047198; q 7: k 1 0.380251, k 3 0.093556; q 13: k 1 0.485128, k 2 0.076942; q 19:
//    k 1 0.229922, k 5 0.102412; q 31: k 1 0.312354, k 7 0.092081.
//  - S2 holds for every variant with a singlet (at most 3e-10; one variant, phi 5pi/6 in-ring two beats, has no
//    singlet), as predicted: isotropy cannot discriminate.
//  - S1 holds for every one-beat slot variant at every coin (at most 6e-11) and for every register variant (at most
//    4e-11), as predicted. THE PREDICTION THAT MISSED: the two- and three-beat schedules fail S1 only at the heavier
//    masses (in-ring 0.077 and 0.091, q 7 k 1 0.0092 and 0.0109); at the light points (k 2 to 7, per-beat m 0.012 to
//    0.026) their defect, tan(b m) / (b m) against tan m / m, is 5.5e-4 to 6.5e-4, under the 1e-3 tolerance. So S1 at
//    1e-3 does not separate the schedules from the one-beat walk below m of about 0.05; the defect is real and grows as
//    m^2. (One read, phi 11pi/12 q 7 k 1 two beats, S1 3.68, takes a level other than the light singlet.)
//  - 94 of 144 variants are scored; 26 of them pass the held-out check and 68 fail it. The 26: the swap coin, one beat,
//    at all 9 masses; the swap coin's two- and three-beat schedules at the 4 light points; the register at all 9
//    masses. The 68: every scored variant of every other coin. The one-beat swap walk's top speed is 0.713 to 0.981 c0,
//    its massless twin 0.99999994 c0; the register's 0.290 to 0.902 c0 and 1.000000 c0. The other coins' massless twins
//    read 1.0084 c0 (11pi/12) to 1.160 c0 (2pi/3) (the massless pair's 2 gamma K), so the held-out check fails there
//    even where the massive variant itself sits under c0 (11pi/12 at q 7 k 3, 0.997 c0).
//  - So the two scores alone select every coin, and the held-out one light speed is what singles out the swap coin.
//    Neither score nor the held-out check prefers 7: R tracks the mass only (R 1.000730 at q 7 k 3, 1.000494 at q 13
//    k 2, 1.000875 at q 19 k 5, 1.000707 at q 31 k 7). Read, not scored: the least-exponent (k 1) masses are 0.190 (7),
//    0.243 (13), 0.115 (19) and 0.156 (31), so 19 gives a lighter member at k 1 than 7 does, and 13 reaches m 0.038 at
//    k 2 where 7 needs k 3 for 0.047.
//
// Depth L2 (band kinematics of coined walks, read off existing exact pieces). DETERMINISM: no random numbers; Weyl
// sequences and fixed directions.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { ringAngle, type Eis } from '@/code/measure/swap-cone'
import {
  isotropyOf,
  registerDesignRead,
  slotDesignRead,
  type DesignRead,
} from '@/code/measure/rule-design-scan'

const C = Math.SQRT2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
  GENERIC,
]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const MOMENTA = 1024
const HF_MOMENTA = 8
const K_MAX = 8
const S1_TOLERANCE = 1e-3
const S2_TOLERANCE = 1e-6
const SPEED_TOLERANCE = 1e-6
const I1_R = 1.0007300338253453
const I1_TOLERANCE = 1e-12
const C0_TOLERANCE = 1e-9
const HF_TOLERANCE = 1e-6

const COINS: readonly { name: string; phi: number }[] = [
  { name: 'phi1/3', phi: Math.PI / 3 },
  { name: 'phi2/3', phi: (2 * Math.PI) / 3 },
  { name: 'phi5/6', phi: (5 * Math.PI) / 6 },
  { name: 'phi11/12', phi: (11 * Math.PI) / 12 },
  { name: 'swap', phi: Math.PI },
]
const PRIMES: readonly { q: number; p: Eis }[] = [
  { q: 7, p: [3n, 1n] },
  { q: 13, p: [4n, 1n] },
  { q: 19, p: [5n, 2n] },
  { q: 31, p: [6n, 1n] },
]
const SCHEDULES: readonly { name: string; angles: (phi: number, theta: number) => number[] }[] = [
  { name: 'beat1', angles: (_, t) => [t] },
  { name: 'beat2', angles: (phi, t) => [phi, t] },
  { name: 'beat3', angles: (phi, t) => [phi, phi, t] },
]

type Mass = { name: string; delta: number; k: number }

function massPoints(): Mass[] {
  const out: Mass[] = [{ name: 'ring6', delta: Math.PI / 3, k: 0 }]

  for (const { q, p } of PRIMES) {
    const table = Array.from({ length: K_MAX }, (_, i) => ringAngle(p, i + 1))
    const light = table.reduce((b, r) =>
      Math.abs(r.delta) < Math.abs(b.delta) ? r : b,
    )

    out.push({ name: `q${q}k1`, delta: table[0]!.delta, k: 1 })
    out.push({ name: `q${q}k${light.k}`, delta: light.delta, k: light.k })
  }

  return out
}

type Row = {
  name: string
  read: DesignRead
  s1: number
  s2: number
  scored: boolean
  heldOut: boolean
}

const score = (name: string, read: DesignRead): Row => {
  const s1 = read.ratio.length
    ? Math.max(...read.ratio.map(x => Math.abs(x - 1)))
    : Number.NaN
  const s2 = isotropyOf(read.c2)
  const scored = s1 <= S1_TOLERANCE && s2 <= S2_TOLERANCE
  const heldOut =
    read.topOverC0 <= 1 + SPEED_TOLERANCE &&
    read.masslessTopOverC0 <= 1 + SPEED_TOLERANCE

  return { name, read, s1, s2, scored, heldOut }
}

export default experiment({
  id: 'foundations/rule-design-scan',
  code: 'E-FND-0177',
  title:
    'a pre-registered survey of the candidate rule discrete choices, partial: of 144 variants (5 coins, the in-ring angle and 4 split primes at two exponents, 1 to 3 beat schedules, with and without the Cl+(4) register) 94 hold R = tan m / m to 1e-3 and K^2 isotropy to 1e-6, every coin among them, and only 26 keep the held-out one light speed: the swap coin (one beat at every mass, two and three beats at the light masses) and the register; no score prefers the prime 7, and the schedule defect hides under 1e-3 below m 0.05',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const radial = DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))
    const momenta = [...weylMomenta(MOMENTA), ...radial]
    const masses = massPoints()
    const rows: Row[] = []

    for (const coin of COINS) {
      for (const mass of masses) {
        for (const schedule of SCHEDULES) {
          const read = slotDesignRead({
            phi: coin.phi,
            angles: schedule.angles(coin.phi, coin.phi + mass.delta),
            dirs: DIRS,
            scales: SCALES,
            momenta,
          })

          rows.push(score(`${coin.name}_${mass.name}_${schedule.name}`, read))
        }
      }

      console.error(`${coin.name} ${Math.round((Date.now() - started) / 1000)}s`)
    }

    const registerReads = masses.map(mass => {
      const read = registerDesignRead({
        m: Math.abs(mass.delta) / 2,
        dirs: DIRS,
        scales: SCALES,
        momenta,
        hfMomenta: HF_MOMENTA,
      })

      rows.push(score(`reg8_${mass.name}_beat2`, read))

      return read
    })

    console.error(`register ${Math.round((Date.now() - started) / 1000)}s`)

    // ---------------- instrument ----------------
    const star = ringAngle(PRIMES[0]!.p, 3)
    const i1Read = slotDesignRead({
      phi: Math.PI,
      angles: [Math.PI + star.delta],
      dirs: DIRS.slice(0, 1),
      scales: SCALES,
      momenta: momenta.slice(0, 1),
    })
    const I1 =
      Math.abs(i1Read.R[0]! / I1_R - 1) <= I1_TOLERANCE &&
      Math.abs(i1Read.c0 / (C / 2) - 1) <= C0_TOLERANCE
    const I2 = registerReads.every(
      r =>
        Math.abs(r.c0 / (C / 4) - 1) <= C0_TOLERANCE &&
        r.hfGap <= HF_TOLERANCE,
    )
    const instrument = I1 && I2

    // ---------------- verdict ----------------
    const scoredRows = rows.filter(r => r.scored)
    const winners = scoredRows.filter(r => r.heldOut)
    const overSelected = scoredRows.filter(r => !r.heldOut)
    const status = !instrument
      ? 'open'
      : scoredRows.length > 0 && overSelected.length === 0
        ? 'pass'
        : winners.length > 0
          ? 'partial'
          : 'fail'

    const metrics: Record<string, number> = {
      instrument: instrument ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I1R: i1Read.R[0]!,
      variants: rows.length,
      scored: scoredRows.length,
      winners: winners.length,
      overSelected: overSelected.length,
    }

    for (const mass of masses) {
      metrics[`delta_${mass.name}`] = mass.delta
    }

    for (const r of rows) {
      metrics[`m_${r.name}`] = r.read.m
      metrics[`S1_${r.name}`] = r.s1
      metrics[`S2_${r.name}`] = r.s2
      metrics[`Raxis_${r.name}`] = r.read.R[0] ?? Number.NaN
      metrics[`top_${r.name}`] = r.read.topOverC0
      metrics[`masslessTop_${r.name}`] = r.read.masslessTopOverC0
      metrics[`gamma_${r.name}`] = r.read.gammaOverC0
      metrics[`c0OverC_${r.name}`] = r.read.c0 / C
    }

    metrics.seconds = (Date.now() - started) / 1000

    const names = (list: Row[]): string =>
      list.length ? list.map(r => r.name).join(', ') : 'none'
    const table = rows
      .map(
        r =>
          `${r.name}: sizes ${r.read.sizes}, m ${r.read.m.toFixed(6)}, R ${(r.read.R[0] ?? Number.NaN).toFixed(6)}, S1 ${r.s1.toExponential(2)}, S2 ${r.s2.toExponential(2)}, top ${r.read.topOverC0.toFixed(6)} c0, massless top ${r.read.masslessTopOverC0.toFixed(6)} c0, c0 ${(r.read.c0 / C).toFixed(6)} c${r.scored ? ' SCORED' : ''}${r.heldOut ? ' HELD' : ''}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `${rows.length} variants; ${scoredRows.length} pass S1 (R / (tan m / m) within ${S1_TOLERANCE}) and S2 (K^2 isotropic to ${S2_TOLERANCE}); of those ${winners.length} keep one light speed (held out) and ${overSelected.length} do not. Passing everything: ${names(winners)}. Scored but failing the held-out check: ${names(overSelected)}`,
      metrics,
      control: {
        I1: I1 ? 1 : 0,
        I2: I2 ? 1 : 0,
        I1R: i1Read.R[0]!,
      },
      notes: `L2. A survey, adopting nothing. Mass points (delta): ${masses.map(x => `${x.name} ${x.delta.toFixed(6)}`).join(', ')}. Every variant: ${table}. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
