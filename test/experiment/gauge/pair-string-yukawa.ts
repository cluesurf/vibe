// E-FRC-0200. The Yukawa test again, now that the vacuum makes pairs: the residual between compact color singlets
// (STAND-INS for nucleons) of the paid Z3 string on the D4 box, whose demons can pay for a pair.
//
// E-FRC-0196 read the residual of the paid string with no pair making and found none (bulk under 0.006 at R 2 to 4.5)
// where the history of the string predicted two strings, e^(-2 m r). E-FRC-0188 derived what pair making changes:
// the dual Potts model gets a field, one string can join two singlets, and the residual becomes one-meson exchange,
// e^(-m r) / r on the husk, with m the meson's own rate. E-FRC-0189 found that the line rule samples its own ordered
// measure rather than the mod-3 one; on D4 charges pass one another, so no such order is kept, and this file reads
// the rule directly.
//
// The runs (code/measure/pair-string PAIR_VACUUM, shared with E-FRC-0201 and 0202): the rule code/rule/string-graph,
// unchanged, mass 2, tension 3, on the side-9 D4 box (6,561 docks); the pair run's demons hold up to 14, twice the
// pair cost 7; the control's hold 6 and can make no pair. 24 mesons and 4 baryon-antibaryon pairs seeded, demons from
// the silver Weyl sequence through q^d, q = 0.35; 40,000 beats after 2,000, read every 4th.
//
// Read (code/measure/pair-string pairVacuumRun):
// - the meson profile: every piece holding exactly one love and one fear gives its love-fear displacement, per dock
//   (bulk) and per column dock (husk), fitted in the Ornstein-Zernike form (bulk power 3/2 from sqrt 2, husk power 1
//   from 1, to R 4.5, shells with 50 counts or more) for m1, as E-FRC-0196 did
// - the residual: compact mesons (one paid link between a love and a fear) paired within each read, against MIXED
//   EVENTS (the same read's mesons paired with those 250 reads earlier), so g(R) = real / mixed with every geometric
//   factor of the box divided out and no shell forced to 1. g - 1 over R 2 to 4.5, shells above twice their error,
//   fitted in the Yukawa form (bulk 3/2, husk 1)
// - the prediction of E-FRC-0188: m_pred from the leading-order one-string profile at the run's own x, over R 2 to 4.5
//
// Gates, fixed before the first run:
// G0 both runs keep energy and Gauss's law exact, the fast kernel agrees with graphBeat, the pair run's charge count
//    changes (pairs are made and unmade) and the control's never does
// G1 YUKAWA, BULK: the pair run's pooled excess over R 2 to 4.5 is positive at more than 3 errors, at least 3 shells
//    stand above 2 errors, and their fitted rate is within 25 percent of the bulk m1
// G2 YUKAWA, HUSK: the same on the husk against the husk m1
// G3 CONTROL: the control's pooled bulk excess over R 2 to 4.5 is within 3 errors of 0
// G4 THE PREDICTED m: the measured m1 within 25 percent of m_pred, bulk and husk
// Pass: all five. Partial: G0, G1 and G3 (the bulk residual is one-meson exchange) with G2 or G4 failing. Fail:
// otherwise, including a residual too weak to fit.
//
// Depth L2: a constructed rule's dynamics, with stand-in nucleons (color singlets without three quarks or spin).
//
// DISCLOSED: before the first run, a probe at a tenth of the length (tmp/bind-vacuum-probe.ts) printed timing, beta
// and counts only. Earlier probes (tmp/bind-d4-probe-*.log) found that nucleon-gas runGas starts every demon at 0 or 1,
// so the vacuum can never gather a pair's cost; runPairGas starts demons from q^d instead.
// The first run, recorded as it came out (61.8 s, tmp/frc0200.log): fail, and the CONTROL IS BROKEN BY DESIGN. G0
// failed because the control, with demons of capacity 6 below the pair-from-calm cost 7, held 642 charges against
// its 72 seeded: the same pair move on a link whose flux is 2 mod 3 BREAKS a string, and costs 2 mass - tension = 1,
// so with mass 2 and tension 3 every run breaks strings and makes pairs whatever the capacity. A no-pair control with
// hops needs 2 mass - tension above the capacity, which is E-FRC-0196's mass 4, tension 1, a different coupling. The
// two runs read the same on every number: beta 1.1369 and 1.1380, compact mesons 32.53 and 32.67 per read, bulk
// pooled excess over R 2 to 4.5 of 3.5e-3 +- 1.4e-3 in both (2.5 errors, 3 shells above two errors), husk 1.82e-2 and
// 1.88e-2 +- 1.0e-3, and the residual RISES with R in both (fitted rates -0.14 bulk, -0.11 husk), so no Yukawa rate is
// read and what excess there is does not come from the capacity. The meson profile gives m1 = 1.511 (bulk) and 1.283
// (husk); E-FRC-0188's leading-order prediction at the run's x = 0.0330 is 1.629 and 1.687 (G4 holds within 25
// percent, bulk 7 percent, husk 24 percent). At this coupling the pair from calm (cost 7, y^2 x = 3.5e-4 per link) is
// the only difference the capacity makes, and it changes nothing measurable; string breaking (cost 1) is present in
// both and gives no one-meson residual either.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dockShells, ornsteinZernikeRate, type LengthHistogram } from '@/code/measure/nucleon-gas'
import { correlationShells, leadingProfile, pairVacuumPair, PAIR_VACUUM, type PairVacuum, type Shell } from '@/code/measure/pair-string'

const R_LOW = 2
const R_HIGH = 4.5
const SIGMAS = 2
const POOLED_SIGMAS = 3
const TOLERANCE = 0.25
const PROFILE_MIN_COUNT = 50
const REACH = 7

type Reading = { pooled: number; pooledError: number; shells: number; rate: number; nearest: Shell | undefined }

function residual(run: PairVacuum, which: 'bulk' | 'husk'): Reading {
  const shells = correlationShells(run.mesonPairs, which)
  const window = shells.filter(s => s.r >= R_LOW - 1e-9 && s.r <= R_HIGH + 1e-9)
  const weight = window.reduce((a, s) => a + 1 / s.sigma ** 2, 0)
  const pooled = window.reduce((a, s) => a + (s.g - 1) / s.sigma ** 2, 0) / Math.max(1e-300, weight)
  const above = window.filter(s => s.g - 1 > SIGMAS * s.sigma).map(s => ({ r: s.r, value: s.g - 1, count: ((s.g - 1) / s.sigma) ** 2 }))

  return {
    pooled,
    pooledError: 1 / Math.sqrt(Math.max(1e-300, weight)),
    shells: above.length,
    rate: ornsteinZernikeRate({ points: above, power: which === 'bulk' ? 1.5 : 1 }),
    nearest: window[0],
  }
}

function mesonRate(run: PairVacuum, which: 'bulk' | 'husk'): number {
  const shells = dockShells(run.geometry)[which]
  const histogram: LengthHistogram = run.profile[which]
  const points = [...histogram.entries()]
    .map(([key, count]) => ({ r: Math.sqrt(key / 4), count, value: count / (shells.get(key) ?? 1) }))
    .filter(p => p.r >= (which === 'bulk' ? Math.SQRT2 : 1) - 1e-9 && p.r <= R_HIGH + 1e-9 && p.count >= PROFILE_MIN_COUNT)

  return ornsteinZernikeRate({ points, power: which === 'bulk' ? 1.5 : 1 })
}

export default experiment({
  id: 'gauge/pair-string-yukawa',
  code: 'E-FRC-0200',
  title:
    'the Yukawa test with a pair-making vacuum: the residual between compact color singlets (stand-ins for nucleons) of the paid Z3 string on the D4 box, whose demons pay for pairs, against mixed events, on the husk and in the bulk, against the meson rate and E-FRC-0188\'s one-meson prediction',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const { paired, control } = pairVacuumPair()
    const seeded = 2 * PAIR_VACUUM.mesons + 6 * PAIR_VACUUM.baryons
    const bulk = residual(paired, 'bulk')
    const husk = residual(paired, 'husk')
    const controlBulk = residual(control, 'bulk')
    const controlHusk = residual(control, 'husk')
    const m1Bulk = mesonRate(paired, 'bulk')
    const m1Husk = mesonRate(paired, 'husk')
    const profile = leadingProfile({ x: paired.x, reach: REACH })
    const inWindow = (s: { r: number }): boolean => s.r >= R_LOW - 1e-9 && s.r <= R_HIGH + 1e-9
    const mPredBulk = ornsteinZernikeRate({ points: profile.bulk.filter(inWindow), power: 1.5 })
    const mPredHusk = ornsteinZernikeRate({ points: profile.husk.filter(inWindow), power: 1 })
    const within = (a: number, b: number): boolean => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a / b - 1) < TOLERANCE
    const g0 =
      paired.exact && paired.agrees && control.exact && control.agrees && paired.fewestCharges !== paired.mostCharges && control.fewestCharges === seeded && control.mostCharges === seeded
    const yukawa = (r: Reading, m1: number): boolean => r.pooled > POOLED_SIGMAS * r.pooledError && r.shells >= 3 && within(r.rate, m1)
    const g1 = yukawa(bulk, m1Bulk)
    const g2 = yukawa(husk, m1Husk)
    const g3 = Math.abs(controlBulk.pooled) < POOLED_SIGMAS * controlBulk.pooledError
    const g4 = within(m1Bulk, mPredBulk) && within(m1Husk, mPredHusk)
    const status = g0 && g1 && g2 && g3 && g4 ? 'pass' : g0 && g1 && g3 ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      beta: paired.beta,
      x: paired.x,
      y: paired.y,
      chargesPerDock: paired.chargesPerDock,
      fewestCharges: paired.fewestCharges,
      mostCharges: paired.mostCharges,
      compactMesonsPerRead: paired.compactMesonsPerRead,
      reads: paired.reads,
      m1Bulk,
      m1Husk,
      mPredBulk,
      mPredHusk,
      bulkPooledExcess: bulk.pooled,
      bulkPooledError: bulk.pooledError,
      bulkShellsAbove: bulk.shells,
      bulkResidualRate: bulk.rate,
      bulkRateOverMeson: bulk.rate / m1Bulk,
      huskPooledExcess: husk.pooled,
      huskPooledError: husk.pooledError,
      huskShellsAbove: husk.shells,
      huskResidualRate: husk.rate,
      huskRateOverMeson: husk.rate / m1Husk,
      controlBeta: control.beta,
      controlX: control.x,
      controlCompactMesonsPerRead: control.compactMesonsPerRead,
      controlBulkPooledExcess: controlBulk.pooled,
      controlBulkPooledError: controlBulk.pooledError,
      controlHuskPooledExcess: controlHusk.pooled,
      controlHuskPooledError: controlHusk.pooledError,
      controlM1Bulk: mesonRate(control, 'bulk'),
      gateExact: g0 ? 1 : 0,
      gateYukawaBulk: g1 ? 1 : 0,
      gateYukawaHusk: g2 ? 1 : 0,
      gateControl: g3 ? 1 : 0,
      gatePredictedMass: g4 ? 1 : 0,
    }

    for (const [name, run] of [
      ['paired', paired],
      ['control', control],
    ] as const) {
      for (const which of ['bulk', 'husk'] as const) {
        correlationShells(run.mesonPairs, which)
          .filter(s => s.r <= R_HIGH + 1e-9)
          .forEach(s => {
            metrics[`${name}${which === 'bulk' ? 'Bulk' : 'Husk'}GMinusOneR${s.r.toFixed(3)}`] = s.g - 1
            metrics[`${name}${which === 'bulk' ? 'Bulk' : 'Husk'}ErrorR${s.r.toFixed(3)}`] = s.sigma
          })
      }
    }

    return verdict({
      status,
      claim: `with the vacuum making pairs (beta ${paired.beta.toFixed(3)}, x = ${paired.x.toFixed(4)}, y = ${paired.y.toFixed(4)}, ${paired.chargesPerDock.toFixed(4)} charges per dock), the residual between compact singlets over R 2 to 4.5 pools to ${bulk.pooled.toExponential(2)} +- ${bulk.pooledError.toExponential(1)} (bulk) and ${husk.pooled.toExponential(2)} +- ${husk.pooledError.toExponential(1)} (husk), ${bulk.shells} and ${husk.shells} shells above two errors, fitted rates ${bulk.rate.toFixed(3)} and ${husk.rate.toFixed(3)} against the meson's ${m1Bulk.toFixed(3)} and ${m1Husk.toFixed(3)} (predicted ${mPredBulk.toFixed(3)} and ${mPredHusk.toFixed(3)}); without pair making the bulk pools to ${controlBulk.pooled.toExponential(2)} +- ${controlBulk.pooledError.toExponential(1)}`,
      metrics,
      control: {
        controlCapacity: PAIR_VACUUM.controlCapacity,
        controlCharges: control.mostCharges,
        seededCharges: seeded,
      },
      notes:
        'L2, exact integers, no random numbers: the starts are golden and silver Weyl sequences. The nucleons are stand-ins (color singlets without three quarks or spin). A singlet is read afresh from each read: nothing moves, a meson has no identity from one read to the next. The reference is mixed events 250 reads (1,000 beats) back, the only estimator here that divides out the box geometry, the minimal image near half a period and the husk projection at once, which E-FRC-0196\'s far-shell normalization could not. The control differs from the pair run in its demon capacity only, so its temperature and density are its own; it is the no-pair null, not a matched sample.',
    })
  },
})
