// DOES THE STRING ALONE, WITH NO CONTACT, BIND A COMPOSITE THAT WIDENS AS THE STRING LOOSENS AND WHOSE INERTIA GOES TO
// ITS ENERGY? (E-SPN-0112)
// E-SPN-0111 found the held trio contact bound: 2.2 docks across at every D 3 to 6, R = (m*/E_rest)/(tan m/m) 4.2 to
// 5.1, and light loves (n 2) unbound. A wide, covariant composite needs a binding that is not the full-dock contact.
// note/research/vibe/roadmap/remaining-pieces.md, section 1, "1a, the looser string" (as corrected by E-SPN-0111),
// ideas 1b and 1c. Two routes, one file.
//
// (A) THE STRING-ONLY TRIO. code/measure/coined-line-bloch's three loves on one bulk line ('fermion', flavors
//     [0, 0, 0], fine 1) with the contact unit 4 (code/measure/string-binding FREE_UNIT): the full dock keeps det C
//     alone, which is two free fermions on the dock's two slots, so the only binding is the drift cost's string,
//     pi/N per link of span, N = 2D + 1. Boxes 2N (14, 18, 22 at D 3, 4, 5); the eigensolve grows as box^6, so D 6 (box
//     26, dim 2,704) is past this run's budget. Levels are read by string-binding lineLevelsNear: every level whose
//     span tail beyond N is at most 0.1 is read in full (branch reading, unwrapping), the rest are skipped (a probe
//     checked it gives lineLevels' numbers to every printed digit at D 3).
// (B) THE MESON. A love and a fear under C, the locked pair stand-in of code/measure/drift-cost-bloch (E-SPN-0076,
//     0077, 0086, 0087) with the fine coin (string-binding pairColumn; at fine 1 it equals flux-store-bloch's
//     blochColumn, checked below). Unlike 'knit': a love and a fear on one dock pass with no meeting, so the meson is
//     string only as well. Its relative space is 1d, and the parity of d is kept by every beat, so the beat is two
//     blocks (even d, which reaches contact, and odd d, which never does). Box 2N, D up to 30 (box 122).
//
// THE FAMILIES (E-SPN-0111's lesson: a family is followed, never the lowest level under a threshold). Every particle
// level (branch reading at least 1/2 even) is ranked by its UNWRAPPED energy (to the representative nearest kinetic +
// sigma <span> + contact energy, which is 0 on both routes). The trio's families are its ranks 0 to 3; the meson's
// are ranks 0 and 1 within each parity block, named e0, e1 (even d) and o0, o1 (odd d). Every family is reported at
// every D with its energy, tail beyond N, mean span and contact weight, so a change of kind shows as a jump in span
// or contact. THE GATE FAMILY is the ground: the trio's rank 0 and the meson's e0. It is taken whatever its tail, and
// is HELD iff its tail beyond N is at most 1e-3 AND its band followed from K = 0 to 2 pi/32 in steps of pi/64 keeps
// every consecutive overlap at least 0.99 (E-SPN-0111's reading). A ground past the cut is NOT HELD at that D; the
// next level is never substituted. m* = 1/E''(0) (second difference, d = 1e-2), E_rest = (bodies) pi/(3n) + E(0)
// with E(0) the unwrapped energy, R = (m*/E_rest)/(tan m/m), m = pi/(3n) (1.654 at n = 1, 1.1027 at 2, 1.0235 at 4).
//
// THE DERIVED EXPONENT (stated before any gate was read). A pair (or trio) of lattice walkers, each with rest energy
// m and inertia m*_1 = tan m (the lone walk: m*/E_rest = tan m/m), bound by a potential sigma |d|, is in the
// non-relativistic regime when its binding is small against m. Its only length is then l = (m*_1 sigma)^(-1/3)
// (the scale of -phi''/(2 mu) + sigma |d| phi; Pauli adds no length), so every span scales as sigma^(-1/3), and with
// sigma = pi/N as N^(1/3): slope 1/3 of ln <span> against ln N. The binding scales as sigma^(2/3), so R - 1 -> 0 as D
// grows (the sign is not predicted: non-relativistically m* is the sum of the constituents' inertia and R < 1, the
// meson probe below reads R > 1).
//
// GATES, fixed before the first run of this file. Each route separately.
//  G1 a held ground at every D: (A) D 3, 4, 5 at n = 1; (B) D 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30 at n = 1. Where
//     none is held the D is named.
//  G2 the ground's mean span rises strictly with D over the held D, and the least-squares slope of ln <span> against
//     ln N over the held D (at least three) is within 0.1 of 1/3.
//  G3 R at the largest held D is within 0.2 of 1, and |R - 1| there is less than at the smallest held D.
//  G4 (B only) at fine n = 2 and n = 4, D 3, 6, 12, 20, 30: the ground is held at D 30, R there is within 0.2 of 1, and
//     |R - 1| at D 30 is less than at the smallest held D.
//  (A) passes iff G1, G2, G3; (B) passes iff G1, G2, G3, G4.
// CONTROLS (a failed control makes the verdict partial).
//  C1 the trio with the contact on (unit 0, E-SPN-0111's reading: the least-energy level inside) at D 3 box 12
//     reproduces E-SPN-0105/0111: E 0.33001851839229945 within 1e-12, m* 24.116350860705534 within 1e-9 relative, R
//     4.200 within 1e-3 relative.
//  C2 the contact is off: one beat of the unit-4 ring form on a Slater determinant of three Weyl orbitals (ring 8)
//     equals the determinant of the three orbitals each run alone, to 1e-12, at fine 1 and 2; unit 0 differs by at
//     least 1e-3 (the check can fail).
//  C3 the instruments: pairColumn equals blochColumn at fine 1 (D 3, box 14, K 0, 0.3, 1.1) to 1e-12; the pair
//     reader equals flux-store-bloch's branchReader on the meson's D 3 ground (even and kinetic) to 1e-9; the parity
//     blocks leak nothing (1e-15); the meson's D 12 ground is the same on boxes 50 and 60 (energy 1e-9).
//  C4 with no drift cost the level is unbound: the meson at D 3 (box 14) and D 12 (box 50) with the cost off has no
//     particle level with tail beyond N at most 1e-3; the trio's D 3 ground vector run 4N beats under the beat with
//     the cost off reaches a weight at least 0.1 on spans of N or more.
//
// PREDICTED (written after the disclosed probes, before run 1). (B) holds G1, G2 (slope about 0.36), G3 (R 1.19,
// 1.08, 1.04 at D 3, 6, 12); G4 unknown. (A) fails G1 at D 3 (the ground's tail is 2.2e-2) and G2 (its span 2.33 at
// D 3 and 2.35 at D 4 hardly moves).
//
// DISCLOSED PROBES (tmp/meson-probe1.ts, instrument and families only, no gate read). tmp/meson-probe1-check.log:
// unit 4 Slater gap 4e-15 (fine 1), 6e-15 (fine 2); unit 0 11.2, unit 3 6.5; pairColumn against blochColumn 9e-16.
// tmp/meson-probe1-meson1.log (whole basis): the meson ground at D 3, 6, 12, 30: E 0.475, 0.319, 0.208, 0.116, mean
// span 0.679, 0.855, 1.084, 1.484, contact 0.67 to 0.40; the odd ground beside it (mean 1.20 to 1.76, contact 0).
// tmp/meson-probe1-mass1.log: R of the even ground 1.186, 1.084, 1.042 at D 3, 6, 12, of the odd 0.993, 1.000, 1.006.
// tmp/meson-probe1-trio3.log and -near3.log: the string-only trio at D 3 box 14: rank 0 E 1.409 tail 2.2e-2 mean
// 2.33 contact 0.23; the one level inside is E 2.077 tail 4.0e-4 mean 2.89 contact 0.63 (both readers agree).
// tmp/meson-probe1-near4.log: at D 4 box 18 rank 0 is E 1.183 tail 3.3e-5 mean 2.35 contact 0.20 (246 s).
//
// RUN 1 (924 s, tmp/meson-run1.log, the record): fail on (A) G1 and G2 and on (B) G4, no gate moved; every control
// holds. (A) the string-only trio (ground: rank 0):
//   D 3 (14)  NOT held (tail 2.15e-2, overlap 0.971)  E 1.409  span 2.332  contact 0.230  m* 8.456  R 1.123
//   D 4 (18)  held                                    E 1.183  span 2.346  contact 0.199  m* 7.811  R 1.092
//   D 5 (22)  held                                    E 1.030  span 2.481  contact 0.172  m* 7.438  R 1.078
//   The string alone binds three free fermions (held at D 4, 5; C4: with no cost the D 3 level spreads to 0.97 past
//   N). G2 cannot be read (two held D; the two-point slope is 0.28). G3 holds: R 1.078 at D 5, nearer 1 than at D 4.
//   Its span (2.3 to 2.5) is set by Pauli more than by the string: two loves fill one dock and the third sits beside.
// (B) the meson at n = 1, the ground e0 held at every D 3 to 30:
//   D     3      4      5      6      8      10     12     15     20     25     30
//   span  0.679  0.746  0.803  0.855  0.943  1.018  1.084  1.170  1.291  1.394  1.484
//   E(0)  0.475  0.404  0.355  0.319  0.268  0.233  0.208  0.181  0.151  0.131  0.116
//   R     1.186  1.131  1.102  1.084  1.062  1.050  1.042  1.034  1.026  1.021  1.018
//   slope of ln span on ln N 0.361 (G2 holds), R 1.186 to 1.018 (G3 holds). The odd ground o0 (never at contact) is
//   held at every D too, span 1.20 to 1.76, R 0.993 to 1.007.
// G4: n = 2 holds (e0 not held at D 3, 6, 12: tails 1.7e-3, 1.0e-3, and at D 12 the band follow lost the level,
// overlap 0.065; held at D 20 R 1.010 and D 30 R 1.008, span 2.12, 2.35). n = 4 fails: e0 is held at no D (tails
// 0.43, 0.12, 6e-4 with overlap 0.73, 8e-3, 8.8e-2; the D 30 e0 has span 18.0 and m* 0.14), so the light meson is not
// a string-bound level at D up to 30. Controls: C1 E 0.33001851839229956, m* 24.116350860705534, R 4.199992; C2
// Slater gaps 4.1e-15, 5.6e-15, unit 0 11.2; C3 column 9.2e-16, reader 2.2e-16, block leak 0, box gap 0; C4 meson
// with no cost has nothing inside (least tails 0.44, 0.41), the trio spreads to 0.97.
//
// Depth L2: lattice Dirac walks bound by a linear string on one line, a known construction ('t Hooft, Schwinger); what
// could fail is whether the string alone holds them and whether the held level widens and grows covariant.
// DETERMINISM: no random numbers (the Slater orbitals are Weyl sequences). NOTHING MOVES: the coin and the cost write
// amplitudes on a dock's own line; the stream copies. HUSK FIRST: one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineImage, wholeBasis, type LineLevel, type LineSector } from '@/code/measure/coined-line-bloch'
import { lightN } from '@/code/measure/drift-cost-bloch'
import { blochColumn, branchReader } from '@/code/measure/flux-store-bloch'
import { bandCurvature, followLevel, type BandPoint } from '@/code/measure/moving-level'
import {
  FREE_UNIT,
  followPair,
  lineLevelsNear,
  meson,
  pairColumn,
  pairCurvature,
  pairLevels,
  pairReader,
  slaterGap,
  spanTail,
  type Meson,
  type PairLevel,
} from '@/code/measure/string-binding'

const TAIL = 1e-3
const READ_TAIL = 0.1
const HOLD = 0.99
const STEP = Math.PI / 64
const HOLD_KS: readonly number[] = [0, (2 * Math.PI) / 32]
const CURVE_D = 1e-2
const TRIO_D: readonly number[] = [3, 4, 5]
const MESON_D: readonly number[] = [3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]
const FINE_D: readonly number[] = [3, 6, 12, 20, 30]
const FINES: readonly number[] = [2, 4]
const SLOPE = 1 / 3
const SLOPE_TOL = 0.1
const R_TOL = 0.2
const MIN_FIT = 3
const TRIO_SHOWN = 4
const RECORDED = { D: 3, box: 12, energy: 0.33001851839229945, mass: 24.116350860705534, R: 4.2 }
const EXACT = 1e-12
const SAME = 1e-9
const R_SAME = 1e-3
const SLATER_RING = 8
const CONTACT_ON = 1e-3
const COLUMN_KS: readonly number[] = [0, 0.3, 1.1]
const READER_SAME = 1e-9
const BLOCK_LEAK = 1e-15
const BOX_CHECK = { D: 12, boxes: [50, 60] }
const FREE_D: readonly number[] = [3, 12]
const SPREAD = 0.1
const SPREAD_BEATS = 4

type Read = { energy: number; tail: number; mean: number; contact: number; overlap: number; mass: number; eRest: number; R: number; held: boolean }
type Row = { D: number; n: number; box: number; dim: number; ground: Read; families: string[]; seconds: number }

const half = (n: number): number => Math.PI / (3 * n)
const loneRatio = (n: number): number => Math.tan(half(n)) / half(n)

// least squares of y on x
function fit(xs: readonly number[], ys: readonly number[]): { slope: number; intercept: number } {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length
  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i]! - my)
    sxx += (x - mx) ** 2
  })

  return { slope: sxy / sxx, intercept: my - (sxy / sxx) * mx }
}

// G1 to G3 over one route's rows (ascending D)
function gates(rows: readonly Row[], wanted: readonly number[]): { g1: boolean; g2: boolean; g3: boolean; slope: number; rises: boolean; missing: number[]; largestR: number; smallestR: number } {
  const held = rows.filter(r => r.ground.held)
  const missing = wanted.filter(D => !held.some(r => r.D === D))
  const rises = held.length >= 2 && held.every((r, i) => i === 0 || r.ground.mean > held[i - 1]!.ground.mean)
  const slope = held.length >= MIN_FIT ? fit(held.map(r => Math.log(lightN(r.D))), held.map(r => Math.log(r.ground.mean))).slope : Number.NaN
  const g2 = rises && held.length >= MIN_FIT && Math.abs(slope - SLOPE) <= SLOPE_TOL
  const largestR = held.length > 0 ? held[held.length - 1]!.ground.R : Number.NaN
  const smallestR = held.length > 0 ? held[0]!.ground.R : Number.NaN
  const g3 = held.length >= 2 && Math.abs(largestR - 1) <= R_TOL && Math.abs(largestR - 1) < Math.abs(smallestR - 1)

  return { g1: missing.length === 0, g2, g3, slope, rises, missing, largestR, smallestR }
}

export default experiment({
  id: 'spin/moving-binding',
  code: 'E-SPN-0112',
  title:
    'the drift cost alone, with no contact at a full dock, binds a love-fear meson that widens as N^(1/3) and whose inertia goes to its energy, fail on the trio route and on the lightest meson: the meson (no meeting, string only) is held at every D 3 to 30 at n = 1, its mean span 0.679 to 1.484 with ln-ln slope 0.361 against the 1/3 derived, and R = (m*/E_rest)/(tan m/m) falls 1.186 to 1.018; at fine n = 2 it is held at D 20 and 30 with R 1.010 and 1.008, at n = 4 at no D up to 30; the string-only trio (contact unit 4, exactly free fermions, a Slater check to 6e-15) is held at D 4 and 5 but not 3 (tail 2.2e-2), its span 2.33 to 2.48 set by Pauli, R 1.123 to 1.078; E-SPN-0111 reproduced, and with no cost nothing is held',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const secs = (): number => Math.round((Date.now() - started) / 1000)
    const f3 = (x: number): string => x.toFixed(3)
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e2 = (x: number): string => x.toExponential(2)
    const log = (s: string): void => console.error(`${s}; at ${secs()} s`)

    // ---- (A) the trio ----
    const trioSector = (D: number, box: number, unit: number): LineSector => ({ flavors: [0, 0, 0], statistics: 'fermion', D, box, unit, fine: 1 })
    const trioRead = (basis: ReturnType<typeof lineBasis>, level: LineLevel, energy: number): Read => {
      const sub = wholeBasis(basis)
      const band = followLevel(basis, sub, level, HOLD_KS, STEP)
      const mass = 1 / bandCurvature(basis, sub, band[0] as BandPoint, CURVE_D)
      const eRest = 3 * half(1) + energy
      const overlap = (band[band.length - 1] as BandPoint).overlap

      return { energy, tail: level.tailN, mean: level.mean, contact: level.contact, overlap, mass, eRest, R: mass / eRest / loneRatio(1), held: level.tailN <= TAIL && overlap >= HOLD }
    }
    const trioVectors = new Map<number, { basis: ReturnType<typeof lineBasis>; level: LineLevel }>()
    const trio: Row[] = TRIO_D.map(D => {
      const t0 = Date.now()
      const box = 2 * lightN(D)
      const basis = lineBasis(trioSector(D, box, FREE_UNIT))
      const r = lineLevelsNear(basis, READ_TAIL)
      const ranked = r.levels.slice().sort((a, b) => a.unwrapped - b.unwrapped)
      const g = ranked[0] as LineLevel
      const ground = trioRead(basis, g, g.unwrapped)
      const families = ranked.slice(0, TRIO_SHOWN).map((l, k) => `rank ${k} E ${f6(l.unwrapped)} tail ${e2(l.tailN)} mean ${f3(l.mean)} contact ${f3(l.contact)}`)
      const row: Row = { D, n: 1, box, dim: basis.configs.length, ground, families, seconds: (Date.now() - t0) / 1000 }

      trioVectors.set(D, { basis, level: g })
      log(`trio D ${D} box ${box} dim ${row.dim} (${r.skipped} of ${r.all} skipped): ground held ${ground.held} overlap ${f4(ground.overlap)} m* ${f4(ground.mass)} E_rest ${f4(ground.eRest)} R ${f4(ground.R)}; ${families.join(' | ')}; ${row.seconds.toFixed(0)} s`)

      return row
    })
    const A = gates(trio, TRIO_D)

    // ---- (B) the meson ----
    const pairRead = (m: Meson, level: PairLevel, n: number): Read => {
      const band = followPair(m, level, HOLD_KS, STEP)
      const mass = 1 / pairCurvature(m, level.parity, band[0]!, CURVE_D)
      const eRest = 2 * half(n) + level.unwrapped
      const overlap = band[band.length - 1]!.overlap

      return { energy: level.unwrapped, tail: level.tailN, mean: level.mean, contact: level.contact, overlap, mass, eRest, R: mass / eRest / loneRatio(n), held: level.tailN <= TAIL && overlap >= HOLD }
    }
    const pairRow = (D: number, n: number): Row & { odd: Read } => {
      const t0 = Date.now()
      const box = 2 * lightN(D)
      const m = meson(D, box, n)
      const r = pairLevels(m)
      const by = (p: 0 | 1): PairLevel[] => r.levels.filter(l => l.parity === p).sort((a, b) => a.unwrapped - b.unwrapped)
      const even = by(0)
      const odd = by(1)
      const ground = pairRead(m, even[0]!, n)
      const oddRead = pairRead(m, odd[0]!, n)
      const fam = (name: string, l: PairLevel | undefined): string => (l === undefined ? `${name} none` : `${name} E ${f6(l.unwrapped)} tail ${e2(l.tailN)} mean ${f3(l.mean)} contact ${f3(l.contact)}`)
      const families = [fam('e0', even[0]), fam('e1', even[1]), fam('o0', odd[0]), fam('o1', odd[1])]
      const lowest = r.levels.reduce((a, b) => (b.unwrapped < a.unwrapped ? b : a))
      const row = { D, n, box, dim: r.dim, ground, odd: oddRead, families, seconds: (Date.now() - t0) / 1000 }

      log(`meson n ${n} D ${D} box ${box} dim ${r.dim} leak ${e2(r.leak)}: e0 held ${ground.held} overlap ${f4(ground.overlap)} m* ${f4(ground.mass)} E_rest ${f4(ground.eRest)} R ${f4(ground.R)}; o0 held ${oddRead.held} m* ${f4(oddRead.mass)} R ${f4(oddRead.R)}; lowest is e0 ${lowest === even[0]}; ${families.join(' | ')}; ${row.seconds.toFixed(0)} s`)

      return row
    }
    const mesons = MESON_D.map(D => pairRow(D, 1))
    const B = gates(mesons, MESON_D)
    const fines = FINES.map(n => {
      const rows = FINE_D.map(D => pairRow(D, n))
      const held = rows.filter(r => r.ground.held)
      const last = rows[rows.length - 1]!
      const first = held[0]
      const g4 = last.ground.held && Math.abs(last.ground.R - 1) <= R_TOL && first !== undefined && first !== last && Math.abs(last.ground.R - 1) < Math.abs(first.ground.R - 1)

      return { n, rows, g4, missing: FINE_D.filter(D => !held.some(r => r.D === D)) }
    })
    const g4 = fines.every(f => f.g4)

    // ---- controls ----
    // C1: the contact on, E-SPN-0111's reading
    const c1 = ((): { ok: boolean; energy: number; mass: number; R: number } => {
      const basis = lineBasis(trioSector(RECORDED.D, RECORDED.box, 0))
      const inside = lineLevelsNear(basis, READ_TAIL).levels.filter(l => l.tailN <= TAIL).sort((a, b) => a.energy - b.energy)
      const first = inside[0]

      if (first === undefined) return { ok: false, energy: Number.NaN, mass: Number.NaN, R: Number.NaN }

      const rd = trioRead(basis, first, first.energy)

      return { ok: rd.overlap >= HOLD && Math.abs(first.energy - RECORDED.energy) <= EXACT && Math.abs(rd.mass / RECORDED.mass - 1) <= SAME && Math.abs(rd.R / RECORDED.R - 1) <= R_SAME, energy: first.energy, mass: rd.mass, R: rd.R }
    })()

    log(`C1 contact on: E ${c1.energy} m* ${c1.mass} R ${c1.R} ok ${c1.ok}`)

    // C2: the contact off
    const slater = [1, 2].map(fine => slaterGap({ ...trioSector(3, 12, FREE_UNIT), fine }, SLATER_RING).gap)
    const slaterOn = slaterGap(trioSector(3, 12, 0), SLATER_RING).gap
    const c2 = slater.every(g => g <= EXACT) && slaterOn >= CONTACT_ON

    log(`C2 Slater gaps unit ${FREE_UNIT} ${slater.map(e2).join(', ')}, unit 0 ${e2(slaterOn)}: ${c2}`)

    // C3: the instruments
    const probe = meson(3, 2 * lightN(3), 1)
    let columnGap = 0

    for (const K of COLUMN_KS) {
      for (let col = 0; col < probe.b.size; col++) {
        const acc = new Map<number, [number, number]>()
        const a = blochColumn(probe.b, K, col)
        const b = pairColumn(probe, K, col)

        a.idx.forEach((i, k) => acc.set(i, [(acc.get(i)?.[0] ?? 0) + a.re[k]!, (acc.get(i)?.[1] ?? 0) + a.im[k]!]))
        b.idx.forEach((i, k) => acc.set(i, [(acc.get(i)?.[0] ?? 0) - b.re[k]!, (acc.get(i)?.[1] ?? 0) - b.im[k]!]))
        for (const v of acc.values()) columnGap = Math.max(columnGap, Math.hypot(v[0], v[1]))
      }
    }

    const probeGround = pairLevels(probe)
      .levels.filter(l => l.parity === 0)
      .sort((a, b) => a.unwrapped - b.unwrapped)[0]!
    const mine = pairReader(probe, 2 * probe.box + 6)(probeGround.vector)
    const theirs = branchReader(probe.b, 2 * probe.box + 6)(probeGround.vector)
    const readerGap = Math.max(Math.abs(mine.even - theirs.even), Math.abs(mine.kinetic - theirs.kinetic))
    const boxEnergies = BOX_CHECK.boxes.map(box => {
      const m = meson(BOX_CHECK.D, box, 1)

      return pairLevels(m)
        .levels.filter(l => l.parity === 0)
        .sort((a, b) => a.unwrapped - b.unwrapped)[0]!.unwrapped
    })
    const boxGap = Math.abs(boxEnergies[0]! - boxEnergies[1]!)
    const blockLeak = Math.max(...[probe, meson(BOX_CHECK.D, BOX_CHECK.boxes[0]!, 1)].map(m => pairLevels(m).leak))
    const c3 = columnGap <= EXACT && readerGap <= READER_SAME && blockLeak <= BLOCK_LEAK && boxGap <= SAME

    log(`C3 column gap ${e2(columnGap)}, reader gap ${e2(readerGap)}, block leak ${e2(blockLeak)}, box gap ${e2(boxGap)}: ${c3}`)

    // C4: no drift cost
    const freeMeson = FREE_D.map(D => {
      const m = meson(D, 2 * lightN(D), 1)
      const levels = pairLevels(m, false).levels
      const inside = levels.filter(l => l.tailN <= TAIL)
      const least = Math.min(...levels.map(l => l.tailN))

      return { D, inside: inside.length, least }
    })
    const trio3 = trioVectors.get(TRIO_D[0]!)!
    const N3 = lightN(TRIO_D[0]!)
    let cre = Float64Array.from(trio3.level.cre)
    let cim = Float64Array.from(trio3.level.cim)
    let spread = 0

    for (let t = 0; t < SPREAD_BEATS * N3; t++) {
      const next = lineImage(trio3.basis, 0, cre, cim, false)

      cre = next.re
      cim = next.im
      spread = Math.max(spread, spanTail(trio3.basis, cre, cim, N3))
    }

    const c4 = freeMeson.every(f => f.inside === 0) && spread >= SPREAD

    log(`C4 no cost: meson ${freeMeson.map(f => `D ${f.D} inside ${f.inside} least tail ${e2(f.least)}`).join(', ')}; trio spread ${e2(spread)}: ${c4}`)

    const control = c1.ok && c2 && c3 && c4
    const passA = A.g1 && A.g2 && A.g3
    const passB = B.g1 && B.g2 && B.g3 && g4
    const status = !control ? 'partial' : passA && passB ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      A_G1: A.g1 ? 1 : 0,
      A_G2: A.g2 ? 1 : 0,
      A_G3: A.g3 ? 1 : 0,
      A_slope: A.slope,
      B_G1: B.g1 ? 1 : 0,
      B_G2: B.g2 ? 1 : 0,
      B_G3: B.g3 ? 1 : 0,
      B_G4: g4 ? 1 : 0,
      B_slope: B.slope,
      control: control ? 1 : 0,
      C1: c1.ok ? 1 : 0,
      C2: c2 ? 1 : 0,
      C3: c3 ? 1 : 0,
      C4: c4 ? 1 : 0,
      C1_energy: c1.energy,
      C1_mass: c1.mass,
      C1_R: c1.R,
      slaterFree: Math.max(...slater),
      slaterOn,
      columnGap,
      readerGap,
      blockLeak,
      boxGap,
      trioSpread: spread,
      seconds: (Date.now() - started) / 1000,
    }
    const put = (k: string, g: Read): void => {
      metrics[`${k}_held`] = g.held ? 1 : 0
      metrics[`${k}_energy`] = g.energy
      metrics[`${k}_tail`] = g.tail
      metrics[`${k}_mean`] = g.mean
      metrics[`${k}_contact`] = g.contact
      metrics[`${k}_overlap`] = g.overlap
      metrics[`${k}_mass`] = g.mass
      metrics[`${k}_R`] = g.R
    }

    for (const r of trio) put(`trio_D${r.D}`, r.ground)
    for (const r of mesons) {
      put(`meson_n1_D${r.D}`, r.ground)
      put(`meson_n1_D${r.D}_odd`, r.odd)
    }
    for (const f of fines) for (const r of f.rows) put(`meson_n${f.n}_D${r.D}`, r.ground)
    for (const f of freeMeson) metrics[`free_D${f.D}_inside`] = f.inside

    const row = (r: Row): string => `D ${r.D}: ${r.ground.held ? 'held' : 'NOT held'} E ${f4(r.ground.energy)} tail ${e2(r.ground.tail)} span ${f3(r.ground.mean)} contact ${f3(r.ground.contact)} m* ${f3(r.ground.mass)} R ${f3(r.ground.R)}`
    const g = (x: boolean): string => (x ? 'holds' : 'fails')

    return verdict({
      status,
      claim: `(A) string-only trio: ${trio.map(row).join('; ')}; G1 ${g(A.g1)}${A.missing.length > 0 ? ` (none held at D ${A.missing.join(', ')})` : ''}, G2 ${g(A.g2)} (slope ${f3(A.slope)}), G3 ${g(A.g3)}. (B) meson n = 1: ${mesons.map(row).join('; ')}; G1 ${g(B.g1)}${B.missing.length > 0 ? ` (none held at D ${B.missing.join(', ')})` : ''}, G2 ${g(B.g2)} (slope ${f3(B.slope)}), G3 ${g(B.g3)} (R ${f3(B.smallestR)} to ${f3(B.largestR)}); ${fines.map(f => `n = ${f.n}: ${f.rows.map(row).join('; ')}`).join('. ')}; G4 ${g(g4)}. Controls: C1 ${c1.ok}, C2 ${c2}, C3 ${c3}, C4 ${c4}`,
      metrics,
      control: { C1: c1.ok ? 1 : 0, C2: c2 ? 1 : 0, C3: c3 ? 1 : 0, C4: c4 ? 1 : 0 },
      notes: `L2. Families: trio ${trio.map(r => `D ${r.D} [${r.families.join(' | ')}]`).join('; ')}. Meson ${[...mesons, ...fines.flatMap(f => f.rows)].map(r => `n ${r.n} D ${r.D} dim ${r.dim} [${r.families.join(' | ')}] ${r.seconds.toFixed(0)} s`).join('; ')}. Odd ground (n 1): ${mesons.map(r => `D ${r.D} held ${r.odd.held} span ${f3(r.odd.mean)} R ${f3(r.odd.R)}`).join(', ')}. No cost: ${freeMeson.map(f => `D ${f.D} least tail ${e2(f.least)}`).join(', ')}, trio spread ${e2(spread)}. ${secs()} s.`,
    })
  },
})
