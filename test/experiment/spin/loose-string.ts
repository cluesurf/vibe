// DOES A LOOSER STRING, SET BY THE LIGHT'S OWN D, BRING THE HELD TRIO'S INERTIA TO ITS ENERGY (E-SPN-0111)?
// RENUMBERED: run 1 was made under E-SPN-0110 and its log (tmp/loose-run1.log) prints that code; 0110 was registered
// meanwhile by spin/crossing-lines, so this file took 0111 before registering. Nothing else changed.
// E-SPN-0105's held three-love level has m*/E_rest 6.947 against the lone love's tan m/m 1.654 (R 4.200, E-SPN-0106,
// 0108). It is 2.2 docks across, at the cutoff. The drift cost is zeta_(2N)^(-span), a tension sigma = pi/N per link
// with N = 2D + 1 and D the light's trit-column depth (code/measure/drift-cost-bloch lightN), so the string's tension is
// the light's resolution and loosening it adds no number. A linear potential of tension sigma binds a pair of mass m
// into a state of size about (sigma m)^(-1/3): a smaller sigma gives a wider state, deeper in the long-wavelength regime
// where the walk is covariant, so R should fall toward 1 as D grows. note/research/vibe/roadmap/remaining-pieces.md,
// ideas 1a (the loose string) and 1b (light loves with it, the Schwinger regime).
//
// THE READING (tmp/loose-probe1.ts, unchanged). The stand-in (code/measure/coined-line-bloch: three loves on one bulk
// line, fermion statistics, unit 0, the fine coin n) at depth D and box S, whole basis, K = 0. Among the particle levels
// whose weight beyond N is at most 1e-3, the one of least quasi-energy is the candidate (none: not held). Its band is
// followed from K = 0 in steps of pi/64 to 2 pi/32 (followLevel); the level is HELD iff that band's least consecutive
// overlap is at least 0.99 (E-SPN-0108's F1 without the ring run). m* = 1/E''(0) (bandCurvature, d = 1e-2),
// E_rest = 3 pi/(3n) + E(0) (three lone half-gaps plus the level's energy, E-SPN-0106's walk terms), ratio m*/E_rest,
// and R = ratio / (tan m/m), m = pi/(3n), the lone love's own ratio. The tail beyond N needs span room past N, so every
// box is at least 2N (the instrument refuses a smaller one): box 12 at D 6 read every level 'inside' (probe, below).
//
// THE POINTS. n = 1: D 3 at box 14, D 4 at box 18, D 5 at box 22, D 6 at box 26 (2N each). The eigensolve grows as
// box^6, so box independence is read at ONE point, D 4 on boxes 18 and 20. n = 2: D 4 at box 18, D 5 at box 22.
//
// GATES, fixed before the first run of this file.
//  L1 a level is held at every D in {3, 4, 5, 6} at n = 1 (D 6 was judged affordable, one eigensolve at dim 2,704), and
//     at D 4 the candidate's energy on boxes 18 and 20 agrees within 1e-3.
//  L2 L1 holds and R falls strictly with D over 3, 4, 5, 6.
//  L3 R at the largest D is recorded; R - 1 is fitted against 1/N by least squares over the held D (at least three), and
//     L3 holds iff the fitted intercept (R - 1 at 1/N = 0) lies within 0.2 of 0.
//  L4 (idea 1b) at n = 2 a level is held at D 4 and at D 5; R (over tan(pi/6)/(pi/6) = 1.1027) is recorded where held.
//  FAMILY (measurement, no gate): per point, the candidate's energy, contact weight (full docks) and mean span, the
//     inside levels, and the inside level of LARGEST contact. The candidate 'is the contact family' iff it is that
//     level; where it is not, the contact-family level's band and R are read as well, so a jump in R can be told apart
//     from a change of which level is the lowest inside.
//  SIGMA/ALPHA (arithmetic, no gate): sigma = pi/N here and alpha = sqrt(3)/(48 D) (E-FRC-0256's measured closed form),
//     sigma/alpha = 16 sqrt(3) pi D/(2D + 1) -> 24 pi/sqrt(3) = 43.53. Both are closed forms in the same D; this run
//     measures neither (sigma is the stand-in's input), so the ratio is recorded as a consequence, not a result. Note the
//     roots differ: the drift cost is zeta_(4D+2), the Peierls phase of E-FRC-0256 zeta_(4D).
//  CONTROLS. (a) D 3, n 1, box 12 reproduces E-SPN-0105/0108: the candidate's E 0.33001851839229945 within 1e-12, m*
//     24.116350860705534 within 1e-9 relative, R 4.200 within 1e-3 relative. (b) the unbound unit (unit 3, the bounce's
//     -1 on a full line) holds nothing at D 3 on boxes 12 and 14. Verdict: partial if a control fails; pass if L1, L2,
//     L3 and L4 hold; fail otherwise.
// PREDICTED (written after the probes, before run 1): L1 held at D 3, 4, 5, D 6 uncertain; R falls (4.2 to 1.75 from D
// 3 to 4 in the probe); L3 fails, since the two probe points alone put the intercept near -7.8, far below 0, so R is
// not falling as 1/N; L4 unknown (at D 3 box 12 n = 2 held nothing); the candidate changes family between D 3 and 4.
//
// DISCLOSED PROBES (tmp/loose-probe1.ts, instrument only, no gate read on them). tmp/loose-a.log: D 3 n 1 box 12 R 4.200,
// mean 2.19; D 3 n 2 box 12 none inside (least tail 0.22); D 6 on box 12 'inside 311' with E -3.13 and R 1255, the box
// smaller than N, unreadable. tmp/loose-b.log: D 4 n 1 box 18 (337 s) inside 9, E 0.49877, mean 1.85, contact 0.413, m*
// 10.542, R 1.751. The D 4 candidate's contact (0.41 against 0.92 at D 3) and smaller mean are why FAMILY is read.
//
// RUN 1 (4587 s, tmp/loose-run1.log, the record): fail on L2, L3 and L4, no gate moved; L1 and both controls hold.
// n = 1, per D (box, candidate E, mean span, contact, m*, E_rest, R, family):
//   D 3 (14)  0.330018   2.188  0.918  24.117  3.4716  4.200  the contact family
//   D 4 (18)  0.498769   1.847  0.413  10.542  3.6404  1.751  NOT the contact family (largest contact inside 0.481, R 2.820)
//   D 5 (22)  -0.025833  2.197  0.911  25.697  3.1158  4.986  the contact family
//   D 6 (26)  -0.122469  2.204  0.907  25.290  3.0191  5.065  the contact family
// L1: held at every D (band overlap at least 0.9995); box 20 at D 4 gives the same candidate, E gap 7.6e-10. L2: R does
// not fall (4.200, 1.751, 4.986, 5.065). L3: R at D 6 5.065; R - 1 = 5.145 - 20.34/N, intercept 5.1, worst residual
// 2.1. L4: no level inside at n = 2 (least tail 0.117 at D 4, 0.029 at D 5). The contact family's mean span stays
// 2.19 to 2.20 at every D: the looser string does not widen it, and its R RISES slowly (4.20, 4.99, 5.06), since E(0)
// falls (0.330, -0.026, -0.122) and so E_rest falls while m* holds near 25. sigma/alpha 37.31, 38.69, 39.57, 40.18.
// Controls: (a) E 0.33001851839229956, m* 24.116350860705534, R 4.199992; (b) the unbound unit has nothing inside at
// boxes 12 and 14 (least tail 1.57e-3).
// PROBE AFTER RUN 1 (tmp/loose-family-probe.ts, tmp/loose-family1.log, disclosed, no gate read on it): at D 4 box 18
// the contact family IS present, E 0.112933, mean 2.255, contact 0.910, but its tail beyond N is 1.76e-3, over the
// 1e-3 cut (D 3 5.6e-4, D 5 1.4e-6, D 6 3.0e-8), so the reading rule took the next level; R 1.751 at D 4 is a change of
// family, not a looser string lightening the trio. Its energy fits the family's run (0.330, 0.113, -0.026, -0.122).
//
// Depth L2: a lattice Dirac walk bound by a linear string on the rule's own line, a known construction; what could fail
// is whether the looser string's level is held and grows covariant. DETERMINISM: no random numbers; the band and every
// reading are float measurement of the stand-in, whose ring form E-SPN-0104/0105 checked against the exact rule at D 3.
// NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLevels, wholeBasis, type LineLevel, type LineSector } from '@/code/measure/coined-line-bloch'
import { lightN } from '@/code/measure/drift-cost-bloch'
import { bandCurvature, followLevel, type BandPoint } from '@/code/measure/moving-level'

const TAIL = 1e-3
const HOLD = 0.99
const STEP = Math.PI / 64
const HOLD_KS: readonly number[] = [0, (2 * Math.PI) / 32]
const CURVE_D = 1e-2
const LOOSE: readonly { D: number; box: number }[] = [
  { D: 3, box: 14 },
  { D: 4, box: 18 },
  { D: 5, box: 22 },
  { D: 6, box: 26 },
]
const SECOND_BOX = { D: 4, box: 20 }
const BOX_SAME = 1e-3
const LIGHT: readonly { D: number; box: number }[] = [
  { D: 4, box: 18 },
  { D: 5, box: 22 },
]
const INTERCEPT = 0.2
const MIN_FIT = 3
const RECORDED = { box: 12, energy: 0.33001851839229945, mass: 24.116350860705534, R: 4.2 }
const EXACT = 1e-12
const SAME = 1e-9
const R_SAME = 1e-3
const UNBOUND_BOXES: readonly number[] = [12, 14]
const SHOWN = 6

type Read = { K0: LineLevel; band: BandPoint[]; overlap: number; mass: number; eRest: number; ratio: number; R: number }
type Point = { D: number; n: number; box: number; unit: number; dim: number; inside: LineLevel[]; least: LineLevel; candidate?: Read; family?: LineLevel; familyRead?: Read; held: boolean; seconds: number }

export default experiment({
  id: 'spin/loose-string',
  code: 'E-SPN-0111',
  title:
    "loosening the string with the light's own D does not bring the held trio's inertia toward its energy, fail on L2, L3 and L4: with the drift cost's tension pi/(2D + 1) a three-love level is held at every D 3 to 6 (boxes 14, 18, 22, 26; box 20 at D 4 gives the same level to 8e-10), but its mean span stays 2.19 to 2.20 and R = (m*/E_rest)/(tan m/m) reads 4.200, 1.751, 4.986, 5.065, not falling; R - 1 fitted on 1/N has intercept 5.1, not 0; the 1.751 at D 4 is a change of level, the contact family (contact 0.91) there having tail 1.8e-3 beyond N, just over the 1e-3 cut, so the next level (contact 0.41) was taken; at fine n = 2 no level is held at D 4 or 5 (least tail 0.117, 0.029); sigma/alpha is 37.3 to 40.2, a consequence of two closed forms in D; E-SPN-0105's R 4.200 reproduced and the unbound unit holds nothing",
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
    const half = (n: number): number => Math.PI / (3 * n)
    const loneRatio = (n: number): number => Math.tan(half(n)) / half(n)

    // the band, m* and R of one level
    const readLevel = (basis: ReturnType<typeof lineBasis>, sub: ReturnType<typeof wholeBasis>, level: LineLevel, n: number): Read => {
      const band = followLevel(basis, sub, level, HOLD_KS, STEP)
      const mass = 1 / bandCurvature(basis, sub, band[0] as BandPoint, CURVE_D)
      const eRest = 3 * half(n) + level.energy
      const ratio = mass / eRest

      return { K0: level, band, overlap: (band[band.length - 1] as BandPoint).overlap, mass, eRest, ratio, R: ratio / loneRatio(n) }
    }

    const levelRow = (l: LineLevel): string => `E ${f6(l.energy)} tail ${e2(l.tailN)} mean ${f3(l.mean)} contact ${f3(l.contact)}`

    // `family` reads the contact family; a gate point (family true) must have its box at least 2N, the controls
    // reproduce the recorded box 12 at D 3 (N 7, so the tail beyond N still has 5 docks of room)
    const point = (D: number, n: number, box: number, unit: number, family: boolean): Point => {
      const t0 = Date.now()

      if (family && box < 2 * lightN(D)) throw new Error(`loose-string: box ${box} is under 2N = ${2 * lightN(D)} at D ${D}`)

      const sector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D, box, unit, fine: n }
      const basis = lineBasis(sector)
      const sub = wholeBasis(basis)
      const levels = lineLevels(basis, sub).levels
      const inside = levels.filter(l => l.tailN <= TAIL).sort((a, b) => a.energy - b.energy)
      const least = levels.reduce((a, b) => (b.tailN < a.tailN ? b : a))
      const out: Point = { D, n, box, unit, dim: basis.configs.length, inside, least, held: false, seconds: 0 }

      if (inside.length > 0) {
        const candidate = readLevel(basis, sub, inside[0] as LineLevel, n)

        out.candidate = candidate
        out.held = candidate.overlap >= HOLD

        if (family) {
          const top = inside.reduce((a, b) => (b.contact > a.contact ? b : a))

          out.family = top
          if (top !== inside[0]) out.familyRead = readLevel(basis, sub, top, n)
        }
      }

      out.seconds = (Date.now() - t0) / 1000

      const c = out.candidate
      console.error(
        `D ${D} n ${n} box ${box} unit ${unit} dim ${out.dim}: inside ${inside.length}` +
          (c === undefined ? `, least tail ${e2(least.tailN)} mean ${f3(least.mean)} contact ${f3(least.contact)}` : `, candidate ${levelRow(c.K0)} overlap ${f4(c.overlap)} m* ${f4(c.mass)} E_rest ${f4(c.eRest)} ratio ${f4(c.ratio)} R ${f4(c.R)} held ${out.held}`) +
          (out.family === undefined ? '' : `; contact family ${out.family === inside[0] ? 'is the candidate' : `${levelRow(out.family)}${out.familyRead === undefined ? '' : ` overlap ${f4(out.familyRead.overlap)} m* ${f4(out.familyRead.mass)} R ${f4(out.familyRead.R)}`}`}`) +
          `; inside ${inside.slice(0, SHOWN).map(levelRow).join(' | ')}; ${out.seconds.toFixed(0)} s, at ${secs()} s`,
      )

      return out
    }

    // ---- controls first (cheap): (a) E-SPN-0105's level at box 12, (b) the unbound unit ----
    const recorded = point(3, 1, RECORDED.box, 0, false)
    const rc = recorded.candidate
    const controlRecorded = recorded.held && rc !== undefined && Math.abs(rc.K0.energy - RECORDED.energy) <= EXACT && Math.abs(rc.mass / RECORDED.mass - 1) <= SAME && Math.abs(rc.R / RECORDED.R - 1) <= R_SAME
    const unbound = UNBOUND_BOXES.map(box => point(3, 1, box, 3, false))
    const controlUnbound = unbound.every(p => !p.held)
    const control = controlRecorded && controlUnbound

    // ---- L1, L2, L3: n = 1 over D ----
    const loose = LOOSE.map(({ D, box }) => point(D, 1, box, 0, true))
    const second = point(SECOND_BOX.D, 1, SECOND_BOX.box, 0, true)
    const first = loose.find(p => p.D === SECOND_BOX.D) as Point
    const boxGap = first.candidate !== undefined && second.candidate !== undefined ? Math.abs(first.candidate.K0.energy - second.candidate.K0.energy) : Number.POSITIVE_INFINITY
    const boxSame = boxGap <= BOX_SAME
    const l1 = loose.every(p => p.held) && boxSame
    const held = loose.filter(p => p.held)
    const falls = held.length >= 2 && held.every((p, i) => i === 0 || (p.candidate as Read).R < ((held[i - 1] as Point).candidate as Read).R)
    const l2 = l1 && falls

    // least squares of R - 1 on 1/N over the held D
    const fit = ((): { intercept: number; slope: number; worst: number } => {
      if (held.length < MIN_FIT) return { intercept: Number.NaN, slope: Number.NaN, worst: Number.NaN }

      const xs = held.map(p => 1 / lightN(p.D))
      const ys = held.map(p => (p.candidate as Read).R - 1)
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length
      const my = ys.reduce((a, b) => a + b, 0) / ys.length
      let sxy = 0
      let sxx = 0

      xs.forEach((x, i) => {
        sxy += (x - mx) * ((ys[i] as number) - my)
        sxx += (x - mx) ** 2
      })

      const slope = sxy / sxx
      const intercept = my - slope * mx
      const worst = Math.max(...xs.map((x, i) => Math.abs(intercept + slope * x - (ys[i] as number))))

      return { intercept, slope, worst }
    })()
    const l3 = held.length >= MIN_FIT && Math.abs(fit.intercept) <= INTERCEPT
    const largest = held[held.length - 1]

    // ---- L4: n = 2 ----
    const light = LIGHT.map(({ D, box }) => point(D, 2, box, 0, true))
    const l4 = light.every(p => p.held)

    // ---- sigma / alpha ----
    const ratios = LOOSE.map(({ D }) => {
      const sigma = Math.PI / lightN(D)
      const alpha = Math.sqrt(3) / (48 * D)

      return { D, sigma, alpha, ratio: sigma / alpha }
    })
    const limit = (24 * Math.PI) / Math.sqrt(3)

    const status = !control ? 'partial' : l1 && l2 && l3 && l4 ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      gate_L1: l1 ? 1 : 0,
      gate_L2: l2 ? 1 : 0,
      gate_L3: l3 ? 1 : 0,
      gate_L4: l4 ? 1 : 0,
      control: control ? 1 : 0,
      controlRecorded: controlRecorded ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      boxGap,
      fitIntercept: fit.intercept,
      fitSlope: fit.slope,
      fitWorst: fit.worst,
      seconds: (Date.now() - started) / 1000,
    }
    const tag = (p: Point): string => `D${p.D}_n${p.n}_box${p.box}${p.unit === 0 ? '' : `_unit${p.unit}`}`

    for (const p of [recorded, ...unbound, ...loose, second, ...light]) {
      const k = tag(p)

      metrics[`${k}_held`] = p.held ? 1 : 0
      metrics[`${k}_inside`] = p.inside.length
      metrics[`${k}_leastTail`] = p.least.tailN
      if (p.candidate !== undefined) {
        metrics[`${k}_energy`] = p.candidate.K0.energy
        metrics[`${k}_mean`] = p.candidate.K0.mean
        metrics[`${k}_contact`] = p.candidate.K0.contact
        metrics[`${k}_overlap`] = p.candidate.overlap
        metrics[`${k}_mass`] = p.candidate.mass
        metrics[`${k}_eRest`] = p.candidate.eRest
        metrics[`${k}_R`] = p.candidate.R
      }
      if (p.family !== undefined) metrics[`${k}_familyIsCandidate`] = p.family === p.inside[0] ? 1 : 0
      if (p.familyRead !== undefined) {
        metrics[`${k}_familyEnergy`] = p.familyRead.K0.energy
        metrics[`${k}_familyContact`] = p.familyRead.K0.contact
        metrics[`${k}_familyMean`] = p.familyRead.K0.mean
        metrics[`${k}_familyR`] = p.familyRead.R
      }
    }

    for (const r of ratios) metrics[`D${r.D}_sigmaOverAlpha`] = r.ratio

    const row = (p: Point): string => {
      const c = p.candidate

      if (c === undefined) return `D ${p.D} n ${p.n} box ${p.box}: none inside (least tail ${e2(p.least.tailN)}, mean ${f3(p.least.mean)})`

      const fam = p.family === undefined ? '' : p.family === p.inside[0] ? ', the contact family' : `, not the contact family (${levelRow(p.family)}${p.familyRead === undefined ? '' : `, R ${f3(p.familyRead.R)}`})`

      return `D ${p.D} n ${p.n} box ${p.box}: ${p.held ? 'held' : 'not held'}, E ${f6(c.K0.energy)} mean ${f3(c.K0.mean)} contact ${f3(c.K0.contact)} m* ${f3(c.mass)} E_rest ${f4(c.eRest)} R ${f3(c.R)}${fam}`
    }

    return verdict({
      status,
      claim: `n = 1: ${loose.map(row).join('; ')}; box ${SECOND_BOX.box} at D ${SECOND_BOX.D}: E gap ${e2(boxGap)}; L1 ${l1}, L2 ${l2} (falls ${falls}), L3 ${l3} (R - 1 = ${f3(fit.intercept)} + ${f3(fit.slope)}/N over ${held.length} D, R at D ${largest?.D ?? 'none'} ${largest?.candidate === undefined ? 'none' : f3(largest.candidate.R)}); n = 2: ${light.map(row).join('; ')}; L4 ${l4}; sigma/alpha ${ratios.map(r => `D ${r.D} ${f3(r.ratio)}`).join(', ')} (limit ${f3(limit)}); controls: recorded ${controlRecorded}, unbound ${controlUnbound}`,
      metrics,
      control: { recorded: controlRecorded ? 1 : 0, unbound: controlUnbound ? 1 : 0 },
      notes: `L2. Points (${[recorded, ...unbound, ...loose, second, ...light].map(p => `D ${p.D} n ${p.n} box ${p.box} unit ${p.unit} dim ${p.dim} inside ${p.inside.length} [${p.inside.slice(0, SHOWN).map(levelRow).join(' | ')}]${p.candidate === undefined ? ` least tail ${e2(p.least.tailN)}` : ` overlap ${f4(p.candidate.overlap)} band ${p.candidate.band.map(b => `K ${f4(b.K)} E ${f6(b.energy)}`).join(' ')}`} ${p.seconds.toFixed(0)} s`).join('; ')}). Control (a) E ${rc === undefined ? 'none' : `${rc.K0.energy} m* ${rc.mass} R ${rc.R}`}. Fit worst residual ${e2(fit.worst)}. sigma ${ratios.map(r => `D ${r.D} ${f6(r.sigma)} alpha ${f6(r.alpha)}`).join(', ')}. ${secs()} s.`,
    })
  },
})
