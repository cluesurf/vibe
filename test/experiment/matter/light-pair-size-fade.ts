// DOES THE LIGHT PAIR'S EXTRA QUARTIC FADE AS THE PAIR GROWS? (E-MTR-0034, OPEN-MOT-01, vibe-roadmap-moving-matter-0002)
// E-MTR-0033 read the light register pair's quartic fraction rho, from level-group centroids, at m 0.284 a_B 12
// (2.192 +- 0.009), m 0.380 a_B 10 (3.241 +- 0.018) and m 0.427 a_B 7.5 (4.49 +- 0.11), against the lone member's 1.770,
// 2.414 and 2.808: binding adds an excess Delta = rho - rho_member of 0.42, 0.83 and 1.68 that grows with the lattice
// term x = (tan m / m - 1) / a_B, while a straight line in x was rejected (chi^2 7.4). E-SPN-0218 showed the Breit
// exchange moves rho only slightly (2.19 to 2.29), so the excess is the static engine's lattice binding. Those three
// points move m and a_B together; this file holds the member fixed and grows the pair.
//
// THE DESIGN. At fixed m the member's band is fixed (rho_member 1.770 at P1's four K), and as a_B grows the binding
// fades: the pair becomes two free members at K / 2 each, whose band IS the member's, so Delta -> 0 must hold in the
// limit a_B -> infinity for any law that is not broken. What a third size can tell is HOW it fades:
//   lattice term   Delta ~ x ~ 1 / a_B       (E-MTR-0033's reading)        p = 1
//   square         Delta ~ (h / a_B)^2         (a lattice error of the pull) p = 2
//   persistent     Delta independent of a_B   (an excess the size does not touch, over this range) p = 0
// with p = ln(Delta_12 / Delta_16) / ln(16 / 12). a_B 16 at m 0.284 (ringUnit(-7, 2), ball 72, x 0.00173, below every
// point read so far): the forms' ratios Delta_16 / Delta_12 are 0.75, 0.56 and 1, apart by 8 sigma at the errors P1
// reached (0.009 on rho). a_B 14 would part them by under 4 sigma; a_B 19 (ball 86) would cost 1.7 times more for little more.
// The member, the count and the start are E-MTR-0031's, only a_B and the ball change. The K reads are 0.35, 0.5 and
// 1.0 (E-MTR-0031's less K 0.2, which resolves rho poorly, per K 2.68 against 2.20, 2.19, 2.19, and would cost a
// quarter of the run); P1 is compared on the same three K. The run (test/record/E-MTR-0034/run/mtr034-part.ts): K = 0
// identity read, O_h, N 8192; K reads in the C4v sector, 4,400 lags each.
//
// THE INSTRUMENT. The 1s group's centroid (code/measure/level-group), E-MTR-0033's group rules (lowest peak of weight
// >= 0.1, window from 0.02 under it to `edge` of the way to the next peak of weight >= 0.03, or 0.01 above), at sigma
// 1.05e-3, 1.25e-3, 1.48e-3, edges 0.5 and 0.4, with the lag taper cut at 1e-4 (E-SPN-0219's instrument: the 2s
// group's half-spread falls 6 to 8 times at the same lags, and the cut read agrees with the full-length 1e-12 read to
// under 1e-6 on the three saved K = 0 correlations). The fit is E-MTR-0033's: E0 the K = 0 centroid at the same
// setting, (a, rho) by quarticFractionFit with sigma_E the largest per-K half-spread (floor 1e-6), sigma_rho the fit
// error and the settings' half-spread of rho in quadrature. P1 (a_B 12) is RE-READ with the same instrument, so the
// ratio compares like with like.
//
// GATES (frozen in test/record/E-MTR-0034/gates.json, 2026-10-23, before the a_B 16 run was launched and before P1
// was read at the new settings):
//   R0  CONTROL: the same code at E-MTR-0033's settings (sigma 2e-3, 2.5e-3, 3e-3, floor 1e-12) and its four K gives
//       back P1's recorded rho within 1e-9
//   W   WITNESS: at both points the K = 0 centroid (main setting) within 1e-4 of the recorded ground (P1 1.1141074420;
//       a_B 16 its own identity read's tracked line), and the floor-1e-4 read of the K = 0 correlation cut to the K
//       reads' length within 5e-6 of the full-length floor-1e-12 read at sigma sqrt(2 ln 1e12) / (n - 1)
//   I   at every K of both points: group weight at least 0.2, centroid half-spread over the six settings at most 5e-5
//   FORMS  a form survives when |p - p_form| <= 2 sigma_p, sigma_p = hypot(s_12 / Delta_12, s_16 / Delta_16) / ln(4/3)
//   FADE   the excess falls with size: p > 3 sigma_p
//   LIMIT  the slowest lattice law, a line in 1 / a_B through the two sizes, leaves no positive continuum excess:
//          C = (16 Delta_16 - 12 Delta_12) / 4 <= 2 sigma_C, sigma_C = hypot(4 s_16, 3 s_12)
//   Verdict: fail if R0, W or I fails; pass if FADE and LIMIT; partial if FADE alone; fail otherwise.
//   Since rho_member -> 1 as 1 + 9.4 m^2 (E-MTR-0033's M, exact band), a pass means rho -> 1 in the joint limit.
// PREDICTED (from E-MTR-0033's recorded P1 numbers before any a_B 16 read): p = 1 (the lattice term), in [0.7, 1.6];
// rho at a_B 16 2.087 (lattice), 2.007 (square), 2.192 (persistent); predicted band [2.03, 2.12].
//
// Depth L2 (a two-body quantum walk on the husk quotient; the lone member's band is the control). DETERMINISM: no random
// numbers; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { groupOverSettings, type Correlation, type GroupSetting } from '@/code/measure/level-group'
import { memberQuarticFraction, quarticFractionFit, thresholdRise } from '@/code/measure/pair-boost'
import { setupFor, type Setup } from '@/code/measure/register-track'
import { readVerdictLog } from '@/code/tool/verdict-log'

const RECORD = `${import.meta.dirname}/../../record`
const GATES = JSON.parse(readFileSync(`${RECORD}/E-MTR-0034/gates.json`, 'utf8'))
const INS = GATES.instrument
const BAND_LOG = `${RECORD}/E-MTR-0033/mtr-band-final.log`
const FINE_REACH = Math.sqrt(2 * Math.log(1e12))
const SIGMA_FLOOR = 1e-6

type Instrument = { settings: GroupSetting[]; least: number; next: number; below: number; above: number }

const RULES = { least: INS.least as number, next: INS.next as number, below: INS.below as number, above: INS.above as number }
export const FINE: Instrument = {
  settings: (INS.sigmaFactors as number[]).flatMap(f => (INS.edges as number[]).map(edge => ({ sigma: INS.sigmaMain * f, edge, floor: INS.taperFloor }))),
  ...RULES,
}
// E-MTR-0033's own instrument (the control R0)
export const OLD: Instrument = {
  settings: [0.002, 0.0025, 0.003].flatMap(sigma => [0.5, 0.4].map(edge => ({ sigma, edge }))),
  ...RULES,
}

const flag = (b: boolean): number => (b ? 1 : 0)
const load = (path: string, pick: (j: any) => Correlation): Correlation | null =>
  existsSync(path) ? pick(JSON.parse(readFileSync(path, 'utf8'))) : null
const cut = (x: Correlation, n: number): Correlation => ({ re: Array.from(x.re).slice(0, n), im: Array.from(x.im).slice(0, n) })
const spread = (xs: number[]): number => (Math.max(...xs) - Math.min(...xs)) / 2

type Point = { name: string; unit: readonly [number, number]; aB: number; E0ref: () => number; zero: () => Correlation | null; file: (K: number) => string }

const NEW_ZERO = `${RECORD}/E-MTR-0034/mtr034-zero.json`

export const POINTS: readonly Point[] = [
  {
    name: 'm0284a12',
    unit: [-7, 2],
    aB: 12,
    E0ref: () => GATES.reference.E0ref,
    zero: () => load(`${RECORD}/E-SPN-0212/spn-light-m0284-a12.json`, j => j.zero.x),
    file: K => `${RECORD}/E-MTR-0031/mtr-light-K${K}.json`,
  },
  {
    name: 'm0284a16',
    unit: [-7, 2],
    aB: 16,
    E0ref: () => (existsSync(NEW_ZERO) ? (JSON.parse(readFileSync(NEW_ZERO, 'utf8')).tracked.E as number) : NaN),
    zero: () => load(NEW_ZERO, j => j.x),
    file: K => `${RECORD}/E-MTR-0034/mtr034-K${K}.json`,
  },
]

const groupAt = (su: Setup, x: Correlation, K: number, ins: Instrument) => {
  const rise = thresholdRise(su, K)

  return groupOverSettings({ x, lo: 2 * su.M0 - 0.08 + 0.3 * rise, hi: 2 * su.M0 + 1.2 * rise + 0.03, ...ins })
}

export type SizeRead = {
  name: string
  aB: number
  rho: number
  sigmaRho: number
  rhoMember: number
  delta: number
  W: boolean
  I: boolean
  metrics: Record<string, number>
}

function rhoOf(su: Setup, zero: Correlation, xs: { K: number; x: Correlation }[], ins: Instrument) {
  const g0 = groupAt(su, zero, 0, ins)
  const groups = xs.map(r => ({ K: r.K, g: groupAt(su, r.x, r.K, ins) }))
  const sigmaE = Math.max(SIGMA_FLOOR, g0.half, ...groups.map(r => r.g.half))
  const a0 = thresholdRise(su, 0.2) / 0.04
  const fits = ins.settings.map((_, s) =>
    quarticFractionFit({ E0: g0.reads[s]?.centroid ?? NaN, points: groups.map(({ K, g }) => ({ K, E: g.reads[s]?.centroid ?? NaN })), a0, sigma: sigmaE }),
  )
  const main = fits[0]!

  return { g0, groups, sigmaE, rho: main.rho, sigmaRho: Math.hypot(main.sigmaRho, spread(fits.map(f => f.rho))), a: main.a, perK: main.perK }
}

export function readSize(p: Point): SizeRead | null {
  const su = setupFor(p.unit)
  const zero = p.zero()
  const momenta: number[] = GATES.point.momenta

  if (!zero || !momenta.every(K => existsSync(p.file(K)))) return null

  const xs = momenta.map(K => ({ K, x: load(p.file(K), j => j)! }))
  const nK = Math.min(...xs.map(r => r.x.re.length))
  const fine = rhoOf(su, zero, xs, FINE)
  const E0 = fine.g0.main?.centroid ?? NaN
  const E0ref = p.E0ref()
  const cutRead = groupAt(su, cut(zero, nK), 0, { ...FINE, settings: [FINE.settings[0]!] })
  const full = groupAt(su, zero, 0, { ...FINE, settings: [{ sigma: (FINE_REACH / (zero.re.length - 1)) * 1.0001, edge: 0.5 }] })
  const offCut = (cutRead.main?.centroid ?? NaN) - (full.main?.centroid ?? NaN)
  const W = Math.abs(E0 - E0ref) <= GATES.W.ground && Math.abs(offCut) <= GATES.W.cut
  const I = fine.groups.every(({ g }) => g.main !== null && g.main.weight >= GATES.I.weight && g.half <= GATES.I.stable)
  const rhoMember = momenta.reduce((s, K) => s + memberQuarticFraction(su, K), 0) / momenta.length
  const metrics: Record<string, number> = { nK, E0, E0ref, E0_off: E0 - E0ref, offCut, W: flag(W), I: flag(I), sigmaE: fine.sigmaE }

  for (const { K, g } of fine.groups) {
    metrics[`K${K}_c`] = g.main?.centroid ?? NaN
    metrics[`K${K}_W`] = g.main?.weight ?? NaN
    metrics[`K${K}_width`] = g.main?.width ?? NaN
    metrics[`K${K}_half`] = g.half
  }
  for (const q of fine.perK) metrics[`K${q.K}_rho`] = q.rho
  Object.assign(metrics, { rho: fine.rho, sigmaRho: fine.sigmaRho, a: fine.a, R: 0.5 / (2 * fine.a * E0), rhoMember, delta: fine.rho - rhoMember })

  return { name: p.name, aB: p.aB, rho: fine.rho, sigmaRho: fine.sigmaRho, rhoMember, delta: fine.rho - rhoMember, W, I, metrics }
}

// R0: E-MTR-0033's instrument through this file's code at P1
export function controlRho(): number {
  const p = POINTS[0]!
  const su = setupFor(p.unit)
  const xs = (GATES.point.controlMomenta as number[]).map(K => ({ K, x: load(p.file(K), j => j)! }))

  return rhoOf(su, p.zero()!, xs, OLD).rho
}

export function runSizeFade(): Verdict {
  const band = readVerdictLog(BAND_LOG)
  const [small, large] = POINTS.map(p => readSize(p))

  if (!band || !small) return verdict({ status: 'open', claim: 'E-MTR-0033 verdict log or P1 reads missing', metrics: {} })

  const R0 = Math.abs(controlRho() - band.metrics.m0284a12_rho!) <= GATES.R0.control

  if (!large) {
    return verdict({
      status: 'open',
      claim: `the a_B 16 reads have not all landed; P1 re-read at the new settings: rho ${small.rho.toFixed(4)} +- ${small.sigmaRho.toFixed(4)} (R0 ${R0})`,
      metrics: { R0: flag(R0), ...Object.fromEntries(Object.entries(small.metrics).map(([k, v]) => [`${small.name}_${k}`, v])) },
    })
  }

  const ln = Math.log(large.aB / small.aB)
  const p = Math.log(small.delta / large.delta) / ln
  const sigmaP = Math.hypot(small.sigmaRho / small.delta, large.sigmaRho / large.delta) / ln
  const forms = GATES.forms
  const survives = (q: number): boolean => Math.abs(p - q) <= forms.survive * sigmaP
  const FADE = p > GATES.FADE.sigmas * sigmaP
  const C = (large.aB * large.delta - small.aB * small.delta) / (large.aB - small.aB)
  const sigmaC = Math.hypot((large.aB * large.sigmaRho) / (large.aB - small.aB), (small.aB * small.sigmaRho) / (large.aB - small.aB))
  const LIMIT = C <= GATES.LIMIT.sigmas * sigmaC
  const instrument = R0 && small.W && small.I && large.W && large.I
  const status: Verdict['status'] = !instrument ? 'fail' : FADE && LIMIT ? 'pass' : FADE ? 'partial' : 'fail'
  const metrics: Record<string, number> = {}

  for (const r of [small, large]) for (const [k, v] of Object.entries(r.metrics)) metrics[`${r.name}_${k}`] = v
  Object.assign(metrics, {
    R0: flag(R0),
    p,
    sigmaP,
    persistent: flag(survives(forms.persistent)),
    lattice: flag(survives(forms.lattice)),
    square: flag(survives(forms.square)),
    FADE: flag(FADE),
    C,
    sigmaC,
    LIMIT: flag(LIMIT),
    ratio: large.delta / small.delta,
  })

  return verdict({
    status,
    claim: `at fixed member m 0.284 the light pair's quartic fraction is ${small.rho.toFixed(4)} +- ${small.sigmaRho.toFixed(4)} at a_B 12 and ${large.rho.toFixed(4)} +- ${large.sigmaRho.toFixed(4)} at a_B 16 (member ${large.rhoMember.toFixed(4)}), the excess ${small.delta.toFixed(4)} -> ${large.delta.toFixed(4)} (ratio ${(large.delta / small.delta).toFixed(3)}), falling as a_B^-p with p ${p.toFixed(3)} +- ${sigmaP.toFixed(3)} (forms surviving: persistent ${survives(forms.persistent)}, lattice 1 / a_B ${survives(forms.lattice)}, (h / a_B)^2 ${survives(forms.square)}); FADE ${FADE}; the 1 / a_B line leaves a continuum excess ${C.toFixed(4)} +- ${sigmaC.toFixed(4)} (LIMIT ${LIMIT}); R0 ${R0}, W ${small.W}/${large.W}, I ${small.I}/${large.I}`,
    metrics,
    control: { rhoMember: large.rhoMember },
    notes: 'L2.',
  })
}

export default experiment({
  id: 'matter/light-pair-size-fade',
  code: 'E-MTR-0034',
  title:
    "explores whether the light register pair's extra quartic fades as the pair grows at fixed member mass (m 0.284, a_B 12 to 16), against pre-registered laws for a lattice artifact (1 / a_B, 1 / a_B^2) and a persistent excess: pending, the run is on the work droplet",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return runSizeFade()
  },
})
