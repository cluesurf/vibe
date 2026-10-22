// QUADRATURE FROM SELF PORTS (E-MTR-0027). Does the lazy root token's weight on the ports that copy nowhere carry
// its clock, as an internal speed in quadrature with the motion (Vx^2 + Vy^2 + Vz^2 + Vs^2 = c^2)?
//
// THE QUESTION. The "matter as machine" picture puts rest mass in an internal loop whose speed Vs adds to the motion
// in quadrature, Vs / c = sqrt(1 - v^2 / c^2). The lazy root token (code/rule/lazy-root-token, a STAND-IN) has the
// right place for such a loop: of its Q = 9 (2D + 1) ports, 24 copy along their husk shadows and Q - 24 copy nowhere
// (self ports). Its band is cos E = cos(mu) (1 - L(k) / Q), mu = phi / 2 the coin-phase mass, massless speed
// c0^2 = 12 / Q, the photon's (E-MTR-0023). This file reads, at each K, the band eigenvector's weight on self ports.
//
// DERIVED before the first run (Szegedy's two-dimensional span {a, S a}, a the column's zero-momentum state, S a = a on
// every self port): the band eigenvector is a - lambda S a with lambda = e^(i (mu + E)), so the self share is
//   share_self = (1 - 24 / Q) cos(mu) tan((mu + E) / 2) / sin(E)
// (1 - 24 / Q at rest, (1 - 24 / Q) / (1 + cos E) when massless). For a light mass (mu, E << 1) it is
// (1 - 24 / Q) (1 + mu / E) / 2: the self share's excess over its massless value, normalized at rest,
//   x = 2 share_self / (1 - 24 / Q) - 1 = mu / E = sqrt(1 - v^2 / c0^2),
// which is the quadrature x^2 + (v / c0)^2 = 1 with x standing for Vs / c. It is NOT share = mu^2 / E^2 (the share
// tends to half its rest value, not zero, as v -> c0), and it is not linear in v. For a heavy mass the share RISES
// with K: d log(share) / dE at rest is -cot(2 mu), positive at mu = pi / 3, so there is no quadrature at the coin's
// own phase. Every reading is a function of E alone, so as a function of E there is no direction dependence; as a
// function of v the band's W(F4) k^4 anisotropy enters.
//
// GATES, fixed before the first run:
//  S1 the closed form: the measured self share (eigenvector by inverse iteration on the measured eigenvalue,
//     code/measure/self-port-share) equals (1 - 24 / Q) cos(mu) tan((mu + E) / 2) / sin(E) within 1e-7 relative, at
//     D = 1 .. 4, 13 husk directions, mu in {pi / M (M = 2 (2D + 1)^2, the light mass), pi / 3} with c0 K / mu = 0.25,
//     0.5, 1, and mu = 0 with c0 K = 0.0125, 0.025, 0.05
//  S2 the quadrature at the light mass: D = 2 .. 6, 13 directions, c0 K / mu = 0.25, 0.5, 1: |x^2 + (v / c0)^2 - 1|
//     <= 0.01, v the measured group speed along the direction
//  S3 no direction dependence: at each (D, c0 K / mu) the spread of x^2 + (v / c0)^2 over the 13 directions <= 1e-3
//  S4 not linear: at c0 K / mu = 1, |x - (1 - v / c0)| >= 0.1 at every D and direction (a linear share is excluded)
//  S5 heavy mass, no quadrature: at mu = pi / 3, D = 1 .. 4, c0 K / mu = 0.25 and 0.5, every direction, the self share
//     exceeds its rest value and |x^2 + (v / c0)^2 - 1| >= 0.05
//  C1 control, the whole-copy token (the lone vibe's walk: c0 = 1, mu = pi / 3, read off one walk beat): it has no
//     self port, so its self share is 0 at every K, while its own clock mu / E runs from 1 to 2 / 3 over q in
//     [0, pi / 2]: the self share cannot stand for its Vs (the quadrature with x = -1 misses by v^2 >= 0.0625 at
//     v = c* / 2)
// Verdict: fail if S1 or C1 fails (the closed form or the control); pass if every gate holds; partial otherwise.
// Reported, never gated: share / rest against mu^2 / E^2 (the brief's first guess), the massless x (should be near 0),
// the D = 1 light-mass quadrature (mu = pi / 18 is not light), x against mu / E directly.
//
// PROBE before this file, disclosed: tmp/mtr-probe-clock.ts (D = 1, 2, 4, two directions: the closed form to 1e-8;
// light mass x^2 + (v / c0)^2 = 1.0010 at D = 2, 1.00002 at D = 4, 1.014 at D = 1; mu = pi / 3 share / rest 1.012 to
// 1.22, quadrature 1.07 to 2.2; mu^2 / E^2 0.50 where share / rest is 0.855).
//
// FIRST RUN (2026-10-19, 22.7 s): PASS, every gate held, no gate moved; the title was written after the run. The
// closed form to 6.0e-15 over 468 cases; the light-mass quadrature 1.04e-3 worst (D = 2), 5e-5 by D = 4; at D = 1
// the light mass pi / 18 reads 1.014 (reported). BEARING: a quadrature of the MaM kind exists in this token only for
// a mass light against the beat; at mu = pi / 3 the self share grows with motion, the same regime where c_rest^2 =
// c0^2 mu cot mu falls to 0.6046 c0^2 (E-MTR-0024), so a member of that mass carries no internal clock in quadrature.
//
// DETERMINISM: no random number; floats in the symbol's spectrum (measurement). Depth L2 at most: the token is a
// stand-in, and the closed form is Szegedy's (L1).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { portCount } from '@/code/rule/lazy-root-token'
import { huskLightSpeed } from '@/code/measure/one-light-speed'
import {
  lazyGroupSpeed,
  selfPortShare,
} from '@/code/measure/self-port-share'
import {
  bandClock,
  lineBand,
  lineKernel,
  momentumOfSpeed,
  topSpeedMomentum,
} from '@/code/measure/counting-clock'
import { FEAR_COIN } from '@/code/rule/fear-walk'

const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, 1, 1],
]
const RATIOS = [0.25, 0.5, 1]
const MASSLESS_CK = [0.0125, 0.025, 0.05]

const unitOf = (d: readonly number[]): number[] => {
  const n = Math.hypot(...d)

  return d.map(x => x / n)
}

const lightMass = (D: number): number => Math.PI / (2 * (2 * D + 1) ** 2)

function reading(input: {
  D: number
  mu: number
  direction: readonly number[]
  K: number
}): {
  share: number
  rest: number
  closed: number
  x: number
  v: number
  quadrature: number
  energy: number
} {
  const Q = portCount(input.D)
  const phi = 2 * input.mu
  const c0 = huskLightSpeed(input.D)
  const u = unitOf(input.direction)
  const s = selfPortShare(
    Q,
    phi,
    u.map(t => t * input.K),
  )
  const rest = 1 - 24 / Q
  const closed =
    (rest * Math.cos(input.mu) * Math.tan((input.mu + s.energy) / 2)) /
    Math.sin(s.energy)
  const v = lazyGroupSpeed({ Q, phi, direction: u, K: input.K })
  const x = (2 * s.self) / rest - 1

  return {
    share: s.self,
    rest,
    closed,
    x,
    v: v / c0,
    quadrature: x * x + (v / c0) ** 2,
    energy: s.energy,
  }
}

export default experiment({
  id: 'matter/self-port-quadrature',
  code: 'E-MTR-0027',
  title:
    "quadrature from the lazy root token's self ports (a STAND-IN), pass: the band eigenvector's weight on the ports that copy nowhere is exactly (1 - 24/Q) cos(mu) tan((mu + E)/2) / sin(E); at the light mass its excess over the massless half, normalized at rest, is mu / E, so x^2 + (v/c0)^2 = 1 to 1.04e-3 at D = 2 to 6 over 13 directions (spread 7.6e-7), not linear (miss 0.41) and not mu^2/E^2 (miss 0.35); at the coin's own phase mu = pi/3 the self share rises with speed (to 1.049 of rest) and the quadrature misses by 6.5 to 28 percent; the whole-copy token has no self port at all",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    // ---- S1: the closed form ----
    let closedGap = 0
    let s1Cases = 0

    for (let D = 1; D <= 4; D++) {
      const c0 = huskLightSpeed(D)
      const cases: { mu: number; K: number }[] = [
        ...RATIOS.map(r => ({ mu: lightMass(D), K: (r * lightMass(D)) / c0 })),
        ...RATIOS.map(r => ({ mu: Math.PI / 3, K: (r * Math.PI) / 3 / c0 })),
        ...MASSLESS_CK.map(ck => ({ mu: 0, K: ck / c0 })),
      ]

      for (const c of cases) {
        for (const d of DIRECTIONS) {
          const r = reading({ D, mu: c.mu, direction: d, K: c.K })

          closedGap = Math.max(closedGap, Math.abs(r.share / r.closed - 1))
          s1Cases++
        }
      }
    }

    // ---- S2, S3, S4: the light mass ----
    let quadratureGap = 0
    let spread = 0
    let linearMiss = Infinity
    let squareMiss = 0
    let xAgainstClock = 0

    const light: { D: number; ratio: number; mean: number }[] = []

    for (let D = 2; D <= 6; D++) {
      const c0 = huskLightSpeed(D)
      const mu = lightMass(D)

      for (const ratio of RATIOS) {
        const values = DIRECTIONS.map(d => {
          const r = reading({ D, mu, direction: d, K: (ratio * mu) / c0 })

          if (ratio === 1) {
            linearMiss = Math.min(linearMiss, Math.abs(r.x - (1 - r.v)))
          }

          squareMiss = Math.max(
            squareMiss,
            Math.abs((r.share / r.rest) - (mu * mu) / (r.energy * r.energy)),
          )
          xAgainstClock = Math.max(
            xAgainstClock,
            Math.abs(r.x - mu / r.energy),
          )

          return r.quadrature
        })

        quadratureGap = Math.max(
          quadratureGap,
          ...values.map(q => Math.abs(q - 1)),
        )
        spread = Math.max(spread, Math.max(...values) - Math.min(...values))
        light.push({
          D,
          ratio,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
        })
      }
    }

    // the D = 1 light mass, reported
    const d1 = RATIOS.map(ratio => {
      const mu = lightMass(1)

      return reading({
        D: 1,
        mu,
        direction: DIRECTIONS[0]!,
        K: (ratio * mu) / huskLightSpeed(1),
      }).quadrature
    })

    // massless x, reported
    let masslessX = 0

    for (let D = 2; D <= 6; D++) {
      const c0 = huskLightSpeed(D)

      for (const d of DIRECTIONS) {
        const r = reading({ D, mu: 0, direction: d, K: 0.0125 / c0 })

        masslessX = Math.max(masslessX, Math.abs(r.x))
      }
    }

    // ---- S5: the heavy mass ----
    let heavyRises = true
    let heavyMissMin = Infinity
    let heavyMissMax = 0
    let heavyShareMax = 0

    for (let D = 1; D <= 4; D++) {
      const c0 = huskLightSpeed(D)

      for (const ratio of [0.25, 0.5]) {
        for (const d of DIRECTIONS) {
          const r = reading({
            D,
            mu: Math.PI / 3,
            direction: d,
            K: (ratio * Math.PI) / 3 / c0,
          })
          const miss = Math.abs(r.quadrature - 1)

          if (r.share <= r.rest) {
            heavyRises = false
          }

          heavyMissMin = Math.min(heavyMissMin, miss)
          heavyMissMax = Math.max(heavyMissMax, miss)
          heavyShareMax = Math.max(heavyShareMax, r.share / r.rest)
        }
      }
    }

    // ---- C1: the whole-copy token ----
    const kernel = lineKernel(FEAR_COIN)
    const wholeRest = lineBand(kernel, 0)
    const qTop = topSpeedMomentum(kernel)
    const selfPorts = kernel.entries.filter(e => e.shift === 0).length
    const clockAtTop = wholeRest / bandClock(kernel, qTop).energy
    const half = bandClock(
      kernel,
      momentumOfSpeed(kernel, bandClock(kernel, qTop).speed / 2, qTop),
    )
    const controlMiss = half.speed * half.speed

    const g = {
      S1: closedGap <= 1e-7,
      C1: selfPorts === 0 && controlMiss >= 0.0625 - 1e-9 && clockAtTop < 0.7,
    }
    const q = {
      S2: quadratureGap <= 0.01,
      S3: spread <= 1e-3,
      S4: linearMiss >= 0.1,
      S5: heavyRises && heavyMissMin >= 0.05,
    }
    const instrument = Object.values(g).every(Boolean)
    const answered = Object.values(q).every(Boolean)
    const status = !instrument ? 'fail' : answered ? 'pass' : 'partial'

    for (const [k, v] of Object.entries({ ...g, ...q })) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.closedFormGap = closedGap
    metrics.closedFormCases = s1Cases
    metrics.lightQuadratureGap = quadratureGap
    metrics.lightDirectionSpread = spread
    metrics.lightLinearMissMin = linearMiss
    metrics.lightShareAgainstMuSquaredOverESquared = squareMiss
    metrics.lightXAgainstMuOverE = xAgainstClock
    light.forEach(r => {
      metrics[`lightQuadrature_D${r.D}_r${r.ratio}`] = r.mean
    })
    d1.forEach((v, i) => {
      metrics[`d1Quadrature_r${RATIOS[i]}`] = v
    })
    metrics.masslessXMax = masslessX
    metrics.heavyQuadratureMissMin = heavyMissMin
    metrics.heavyQuadratureMissMax = heavyMissMax
    metrics.heavyShareOverRestMax = heavyShareMax
    metrics.controlSelfPorts = selfPorts
    metrics.controlClockAtTop = clockAtTop
    metrics.controlMissAtHalf = controlMiss
    metrics.seconds = (Date.now() - started) / 1000

    const e = (x: number): string => x.toExponential(2)

    return verdict({
      status,
      claim: `the lazy root token's band (a STAND-IN) holds (1 - 24/Q) cos(mu) tan((mu + E)/2) / sin(E) of its weight on its self ports (to ${e(closedGap)} over ${s1Cases} cases); at the light mass the excess over the massless half, normalized at rest, is mu / E (to ${e(xAgainstClock)}), so it adds to the motion in quadrature, x^2 + (v/c0)^2 = 1 to ${e(quadratureGap)} at D = 2 to 6 over 13 directions (direction spread ${e(spread)}); it is not linear (miss at least ${linearMiss.toFixed(3)}) and the share is not mu^2/E^2 (miss up to ${squareMiss.toFixed(3)}); at mu = pi/3 the self share rises with speed (to ${heavyShareMax.toFixed(3)} of its rest value) and the quadrature misses by ${heavyMissMin.toFixed(3)} to ${heavyMissMax.toFixed(3)}; the whole-copy token has ${selfPorts} self ports while its clock mu / E falls to ${clockAtTop.toFixed(4)}`,
      metrics,
      control: {
        wholeCopySelfPorts: selfPorts,
        wholeCopyClockAtTop: clockAtTop,
        wholeCopyQuadratureMissAtHalf: controlMiss,
      },
      notes: `L2 (a stand-in; the closed form is Szegedy's, L1). Gates ${Object.entries(
        { ...g, ...q },
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Light-mass quadrature by D and c0 K / mu (mean over 13 directions): ${light.map(r => `D ${r.D} r ${r.ratio}: ${r.mean.toFixed(6)}`).join(', ')}. At D = 1 the light mass pi / 18 is not light: ${d1.map(v => v.toFixed(5)).join(', ')}. Massless x at c0 K = 0.0125 at most ${e(masslessX)} (the self share sits at half its rest value). MEANING: in this token the self ports do hold the clock, but as an amplitude, not a count: the share is (1 + mu / E) / 2 of its rest value, so it is the rest-normalized excess, not the share, that plays Vs / c, and only while the mass is light against the beat. At the coin's own phase pi / 3 (the working rule's lone-vibe mass) there is no quadrature at all. Seconds ${((Date.now() - started) / 1000).toFixed(1)}.`,
    })
  },
})
