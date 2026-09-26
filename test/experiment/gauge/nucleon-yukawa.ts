// The Yukawa test for two color singlets (STAND-INS for two nucleons): does the residual interaction between
// two singlets of the paid-string rule fall as e^(-m r) / r, with m the meson's own mass?
//
// The rule is code/rule/string-graph on the D4 box (E-FRC-0129 line, E-FRC-0131: matter waits in docks, a hop
// pays the string, mass 4, tension 1, demon capacity 4), unchanged. A singlet here is a meson, a love and a fear
// joined by paid flux. It is a stand-in for a nucleon: it is a color singlet as a nucleon is, but it is not a
// three-quark state and it carries no spin. Nothing in this file is graded as an L3 derivation of the nuclear
// force.
//
// Static sources cannot be run in this rule, and that is a theorem, not a limitation of the code: with the
// demon capacity (4) below the pair cost (2 x mass = 8) no pair is ever made or unmade, the flux changes only when
// a charge hops, so two pinned singlets and nothing else never change at all. The residual is therefore read
// between DYNAMICAL singlets, from the equilibrium the demons impose, which by the duality of E-FRC-0195 is the
// same object the static potential is built from (the connected four-point function of the dual 3-state Potts
// model).
//
// What the history of the string predicts, written before this file was run (E-FRC-0195 derives it):
// - the string is pure history (E-FRC-0175): the flux on a link is the net count of charges the stream has
//   copied across it, mod 3 all the rule reads. Summed over histories with the demons' weight x per paid link,
//   a singlet's love-fear profile is the 3-state Potts spin correlator, so it falls as e^(-m1 r) / r^(3/2) in
//   the bulk and, column-summed, as e^(-m1 r) / r on the husk: the YUKAWA SHAPE IS THE MESON'S OWN PROFILE
// - a singlet has net flux 0 mod 3, so no single string can join two singlets (Gauss's law): anything that
//   couples them carries at least two strings, a closed flux loop through both. The residual is the Potts
//   energy-energy correlator, the two-string threshold, e^(-2 m1 r) / r^3 in the bulk and e^(-2 m1 r) / r^(5/2)
//   on the husk: TWICE the meson's mass, not once. One-meson exchange would need a pair made from calm, which
//   the rule forbids
//
// Measured, on the side-9 box (6,561 docks, 78,732 links), 32 mesons, fills 0.025 and 0.03 (confined: E-FRC-0195
// puts the transition near x = 0.042, about fill 0.045), 40,000 beats after 500 settling, every 4th beat read:
// - the meson profile: every piece of paid flux holding exactly one love and one fear (code/measure/nucleon-gas)
//   gives its love-fear displacement. Per dock (bulk) and per column dock (husk) it is fitted to the
//   Ornstein-Zernike form, bulk power 3/2 and husk power 1, over r from sqrt 2 (bulk) or 1 (husk) to 4.5, shells
//   with at least 50 counts, for m1
// - the residual: the compact isolated singlets (a piece that is one paid link between a love and a fear) are
//   paired, and g(R) is their midpoint pair count over the ideal count for links sharing no dock. The excess
//   g - 1 is fitted over R from 2 to 4.5 on the shells where it exceeds twice its Poisson error, twice: in the
//   Yukawa form (power 1 on the husk, 3/2 in the bulk) for mY, and in the history form (power 5/2 on the husk,
//   3 in the bulk) for mH
//
// Gates, fixed before the run:
// - G0: every checked snapshot keeps the energy and Gauss's law exact, the fast kernel equals graphBeat bit for
//   bit from each start, and at each fill isolated mesons hold at least 0.9 of the charges (confined)
// - Yukawa (husk): mY within 25 percent of m1 at both fills
// - history (husk): mH within 25 percent of 2 m1 at both fills
// Status: pass if G0 and the Yukawa gate hold, partial if G0 and the history gate hold instead (the residual is
// read, and its mass is not the meson's), fail otherwise, including a residual too weak to fit (fewer than three
// shells). The bulk rates are reported beside the husk ones and not gated.
//
// Depth L2: a constructed rule, measured, with stand-in nucleons.
//
// The first run, recorded as it came out (1,164 s): fail. G0 failed at fill 0.03 on the confined share (0.862
// against 0.9, more strings merge there). The meson rates were m1 = 1.534 (husk) and 1.807 (bulk) at fill 0.025,
// 1.304 and 1.538 at 0.03. The bulk showed no shell in R 2 to 4.5 with an excess over twice its error at either
// fill, so no bulk residual could be fitted. The husk showed 14 and 7 such shells, but both fitted rates came out
// NEGATIVE (the excess rising with R), the sign of the estimator, not of the physics: g(R) was normalized to the
// whole box, so any deficit at contact lifts every other shell by the same small amount, and with 957,658 and
// 551,584 pairs that offset clears two errors. The contact g was 0.98 and 1.08 (husk), 1.11 and 1.06 (bulk).
// The ESTIMATOR was changed after that run, disclosed here: g(R) is now normalized on the far shells (R at
// least 5), and the pooled excess over the window with its error is reported whatever its sign. No gate moved.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { makeStringGraph } from '@/code/rule/string-graph'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  addTo,
  boxDisplacement,
  bulkLength,
  dockShells,
  huskLength,
  lengthKey,
  linkPairShells,
  makeBoxGeometry,
  midpointDisplacement,
  ornsteinZernikeRate,
  runGas,
  singletPieces,
  type LengthHistogram,
} from '@/code/measure/nucleon-gas'

const SIDE = 9
const MESONS = 32
const FILLS = [0.025, 0.03]
const SETTLE = 500
const BEATS = 40000
const EVERY = 4
const CAPACITY = 4
const PROFILE_MIN_COUNT = 50
const R_MAX = 4.5
const R_FAR = 5
const RESIDUAL_R_MIN = 2
const SIGMAS = 2
const TOLERANCE = 0.25
const CONFINED_SHARE = 0.9

type Side = {
  profile: number
  yukawa: number
  history: number
  contact: number
  points: number
  pooled: number
  pooledError: number
  nearest: { r: number; g: number; sigma: number }
}

export default experiment({
  id: 'gauge/nucleon-yukawa',
  code: 'E-FRC-0196',
  title:
    'the Yukawa test for two color singlets (stand-ins for nucleons) of the paid-string rule on the D4 box: the meson profile and the residual between compact singlets, fitted on the husk and in the bulk, against the prediction that the residual carries twice the meson mass',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: SIDE })
    const graph = makeStringGraph({ mesh, mass: 4, tension: 1, capacity: CAPACITY })
    const geometry = makeBoxGeometry(SIDE)
    const shells = dockShells(geometry)
    const pairs = linkPairShells(graph, geometry)

    const fills = FILLS.map(fill => {
      const profile = { bulk: new Map() as LengthHistogram, husk: new Map() as LengthHistogram }
      const dimers = { bulk: new Map() as LengthHistogram, husk: new Map() as LengthHistogram }

      let dimerPairs = 0
      let charges = 0
      let inMesons = 0

      const out = runGas({
        graph,
        mesons: MESONS,
        baryons: 0,
        fill,
        settle: SETTLE,
        beats: BEATS,
        every: EVERY,
        look: state => {
          const pieces = singletPieces(graph, state)
          const compact: number[] = []

          for (const p of pieces) {
            charges += p.loves.length + p.fears.length

            if (p.loves.length === 1 && p.fears.length === 1) {
              inMesons += 2

              const v = boxDisplacement(geometry, p.fears[0] ?? 0, p.loves[0] ?? 0)

              addTo(profile.bulk, lengthKey(bulkLength(v) ** 2))
              addTo(profile.husk, lengthKey(huskLength(v) ** 2))

              if (p.paid === 1) {
                compact.push(p.links[0] ?? 0)
              }
            }
          }

          for (let i = 0; i < compact.length; i++) {
            for (let j = i + 1; j < compact.length; j++) {
              const v = midpointDisplacement({ graph, geometry, first: compact[i] ?? 0, second: compact[j] ?? 0 })

              addTo(dimers.bulk, lengthKey(bulkLength(v) ** 2))
              addTo(dimers.husk, lengthKey(huskLength(v) ** 2))
              dimerPairs += 1
            }
          }
        },
      })

      const read = (which: 'bulk' | 'husk'): Side => {
        const profilePoints = [...(profile[which].entries() ?? [])]
          .map(([key, count]) => {
            const r = Math.sqrt(key / 4)

            return { r, count, value: count / (shells[which].get(key) ?? 1) }
          })
          .filter(p => p.r >= (which === 'bulk' ? Math.SQRT2 : 1) - 1e-9 && p.r <= R_MAX && p.count >= PROFILE_MIN_COUNT)
        // normalized on the far shells (R at least R_FAR), where the residual is taken to be gone
        const far = (h: LengthHistogram): number => [...h.entries()].filter(([key]) => Math.sqrt(key / 4) >= R_FAR).reduce((a, [, c]) => a + c, 0)
        const scale = far(dimers[which]) / Math.max(1, far(pairs[which]))
        const excess = [...pairs[which].entries()]
          .map(([key, reference]) => {
            const expected = scale * reference
            const observed = dimers[which].get(key) ?? 0
            const sigma = Math.sqrt(Math.max(observed, 1)) / expected

            return { r: Math.sqrt(key / 4), g: observed / expected, sigma }
          })
          .sort((a, b) => a.r - b.r)
        const tail = excess.filter(p => p.r >= RESIDUAL_R_MIN && p.r <= R_MAX && p.g - 1 > SIGMAS * p.sigma).map(p => ({ r: p.r, value: p.g - 1, count: ((p.g - 1) / p.sigma) ** 2 }))
        const contact = excess.find(p => p.r > 0)?.g ?? Number.NaN
        // the pooled excess and its error over the window R_MIN .. R_MAX, whatever its sign
        const window = excess.filter(p => p.r >= RESIDUAL_R_MIN && p.r <= R_MAX)
        const weight = window.reduce((a, p) => a + 1 / p.sigma ** 2, 0)
        const pooled = window.reduce((a, p) => a + (p.g - 1) / p.sigma ** 2, 0) / Math.max(1e-300, weight)

        return {
          pooled,
          pooledError: 1 / Math.sqrt(Math.max(1e-300, weight)),
          nearest: excess.filter(p => p.r >= RESIDUAL_R_MIN)[0] ?? { r: 0, g: 1, sigma: 0 },
          profile: ornsteinZernikeRate({ points: profilePoints, power: which === 'bulk' ? 1.5 : 1 }),
          yukawa: ornsteinZernikeRate({ points: tail, power: which === 'bulk' ? 1.5 : 1 }),
          history: ornsteinZernikeRate({ points: tail, power: which === 'bulk' ? 3 : 2.5 }),
          contact,
          points: tail.length,
        }
      }

      const beta = unitDemonBeta({ meanDemon: out.meanDemon, capacity: CAPACITY })

      return {
        fill,
        x: Math.exp(-beta),
        exact: out.exact,
        agrees: out.agrees,
        confinedShare: inMesons / Math.max(1, charges),
        dimerPairs,
        husk: read('husk'),
        bulk: read('bulk'),
      }
    })

    const g0 = fills.every(f => f.exact && f.agrees && f.confinedShare >= CONFINED_SHARE)
    const within = (a: number, b: number): boolean => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a / b - 1) < TOLERANCE
    const yukawa = fills.every(f => within(f.husk.yukawa, f.husk.profile))
    const history = fills.every(f => within(f.husk.history, 2 * f.husk.profile))
    const status = g0 && yukawa ? 'pass' : g0 && history ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        "with the energy and Gauss's law exact and the singlets confined, the residual between compact color singlets (stand-in nucleons) read on the husk is fitted in the Yukawa form against the meson's own mass m1 and in the history form against 2 m1, at two fills",
      metrics: Object.fromEntries<number>([
        ['energyGaussAndKernelExact', g0 ? 1 : 0],
        ['yukawaGate', yukawa ? 1 : 0],
        ['historyGate', history ? 1 : 0],
        ...fills.flatMap((f): [string, number][] => {
          const key = String(f.fill).replace('.', '_')

          return [
            [`xFill${key}`, f.x],
            [`energyAndGaussExactFill${key}`, f.exact ? 1 : 0],
            [`kernelAgreesFill${key}`, f.agrees ? 1 : 0],
            [`huskPooledExcessFill${key}`, f.husk.pooled],
            [`huskPooledExcessErrorFill${key}`, f.husk.pooledError],
            [`bulkPooledExcessFill${key}`, f.bulk.pooled],
            [`bulkPooledExcessErrorFill${key}`, f.bulk.pooledError],
            [`bulkNearestShellRFill${key}`, f.bulk.nearest.r],
            [`bulkNearestShellExcessFill${key}`, f.bulk.nearest.g - 1],
            [`bulkNearestShellErrorFill${key}`, f.bulk.nearest.sigma],
            [`huskNearestShellRFill${key}`, f.husk.nearest.r],
            [`huskNearestShellExcessFill${key}`, f.husk.nearest.g - 1],
            [`huskNearestShellErrorFill${key}`, f.husk.nearest.sigma],
            [`confinedShareFill${key}`, f.confinedShare],
            [`dimerPairsFill${key}`, f.dimerPairs],
            [`huskMesonRateFill${key}`, f.husk.profile],
            [`huskResidualYukawaRateFill${key}`, f.husk.yukawa],
            [`huskResidualHistoryRateFill${key}`, f.husk.history],
            [`huskYukawaOverMesonFill${key}`, f.husk.yukawa / f.husk.profile],
            [`huskHistoryOverTwiceMesonFill${key}`, f.husk.history / (2 * f.husk.profile)],
            [`huskResidualShellsFill${key}`, f.husk.points],
            [`huskContactGFill${key}`, f.husk.contact],
            [`bulkMesonRateFill${key}`, f.bulk.profile],
            [`bulkResidualYukawaRateFill${key}`, f.bulk.yukawa],
            [`bulkResidualHistoryRateFill${key}`, f.bulk.history],
            [`bulkYukawaOverMesonFill${key}`, f.bulk.yukawa / f.bulk.profile],
            [`bulkHistoryOverTwiceMesonFill${key}`, f.bulk.history / (2 * f.bulk.profile)],
            [`bulkResidualShellsFill${key}`, f.bulk.points],
            [`bulkContactGFill${key}`, f.bulk.contact],
          ]
        }),
      ]),
      control: {
        referenceLinkPairs: pairs.total,
        docks: mesh.cellCount,
        links: graph.links.length,
        mesons: MESONS,
      },
      notes:
        'L2, exact integers, no random numbers: starts and demon fills are golden and silver Weyl sequences. The nucleons are stand-ins (mesons: color singlets without three quarks or spin). Static sources are impossible in this rule (no pair is made, so pinned singlets freeze), so the residual is read between dynamical singlets. g(R) is normalized to the whole box, the ideal reference counts link pairs sharing no dock, and midpoint distances near half a period are read through one minimal-image rule for both. A singlet is read afresh from each snapshot: nothing moves, and no meson keeps its love from one beat to the next.',
    })
  },
})
