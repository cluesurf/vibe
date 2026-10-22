// The taxicab control (E-RLT-0113): how anisotropic a particle is when it is a looped list of unit axis steps,
// the cyclic machine of the "Matter As Machine" model, against the direction set Vibe's light moves on.
//
// THE CONTROL (code/control/cyclic-step-machine, an EXTERNAL comparison model, not a Vibe base thing). A particle
// is a loop of N instructions, each a unit step along +-x, +-y or +-z, executed one a beat and repeated. Its
// velocity is the loop's net step count over N. Its top speed in a direction u is reached by a loop with no
// cancelling pairs, built here by machineToward (largest-remainder shares of the N steps over the axes, evenly
// interleaved), and run: the speed is |displacement| / beats after 3 whole loops, read off the integer path.
// The prediction, derived before the run: |v| = |n|_2 / |n|_1, which for a unit u tends to 1 / |u|_1, so the
// axis moves at 1, a face diagonal at 1 / sqrt 2 and a body diagonal at 1 / sqrt 3, at every loop length. The
// spread does not depend on any wavelength, so its order is 0: anisotropic at leading order.
//
// VIBE'S SIDE, read with the same spread (max - min) / mean of the phase speed over the same 37 husk directions
// (code/measure/husk-transport-order huskDirections: 3 axes, 6 face and 4 body diagonals, 24 golden-spiral):
// - the husk photon of the trit-column light at D 16 (code/measure/one-light-speed: omega from
//   2 - 2 cos omega = kappa lambda(k), lambda the husk symbol's transverse eigenvalue), over |k| = 0.8 .. 0.025
// - the 24-direction D4 set's lattice dispersion against a hypercubic set's (code/measure/dispersion
//   anisotropySpreadOrder, the reading of E-RLT-0023, recomputed here)
//
// PROBE BEFORE THE GATES, disclosed (tmp/rlt113-probe1.ts): the photon's spread read 1.7e-4 at |k| = 0.8 and
// 1.6e-10 at 0.025, slope 4.00; D4 order 4.04, hypercubic 2.01; the taxicab spread 0.603 to 0.605 at N = 12 to
// 768. The gates below were written after that probe and leave room on every number it read.
//
// Gates:
//  T1 the machine is what it says: every machine's displacement after 3 loops equals 3 times its net step
//     counts exactly (integers), the model's own examples RRRR and RRRRLLL move at exactly 1 and 1/7, and each
//     top speed equals |n|_2 / |n|_1 of its own counts to 1e-12
//  T2 leading order: the taxicab spread is at least 0.3 at every N = 12, 48, 192, 768, and its log slope against
//     1 / N lies within 0.1 of 0
//  T3 the D4 set's spread order is at least 3.5 and the hypercubic control's at most 2.5
//  T4 the husk photon's spread order over |k| = 0.2 .. 0.025 is at least 3.5 with standard error under 0.1, and
//     its spread at |k| = 0.025 is below 1e-6 of the taxicab's
// Verdict: pass if all hold; fail if T1 holds and T2, T3 or T4 fails; partial if T1 fails.
//
// REPORTED, not gated: the photon's spread at each |k|, the |k| at which its order-4 law reaches 1e-18 (about
// the bound on the anisotropy of light speed from rotating resonator tests), the taxicab spread over that
// bound, the taxicab law's fit residual, and the machine's own clock law: a loop with a cancelling share s
// moves at v with |v|_1 + s = 1 exactly, so along an axis its internal rate is 1 - v, first order in v, where
// a Lorentz clock is sqrt(1 - v^2).
//
// FIRST RUN (2026-10-19, 0.2 s): pass on every gate, none moved. Taxicab spread 0.6032, 0.6049, 0.6045, 0.6045
// at N = 12 .. 768 (slope -0.0004), axis 1, body diagonal 0.5774; photon order 4.001 +- 6e-4, spread 1.74e-4 at
// |k| = 0.8 and 1.58e-10 at 0.025; D4 4.04, hypercubic 2.01. After that run the note's bound sentence was
// reworded (a wavelength, not a dock count); no number changed.
//
// WHAT THIS DOES NOT SAY. The photon is Vibe's light on the husk. Vibe's matter on the working rule moves only
// along its twelve line classes, and E-SPN-0126 reads that as anisotropic at leading order too (a massless
// average 0.354 to 0.441 c by direction), the same class of failure as the taxicab machine; E-RLT-0059 reads
// the committed knits' transport anisotropy at exponent 0. Only the candidate rule's register (not adopted)
// moves a hole the same way in every direction. So this result clears Vibe's light, not its matter.
//
// DETERMINISM: integer machines, fixed directions; no random numbers. Depth L1 (T1, T2: the control's
// arithmetic; T3: a known lattice fact) and L2 (T4: the model's own light read on the husk).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  machineFromLetters,
  machineToward,
  measuredDisplacement,
  stepCounts,
  type CyclicMachine,
} from '@/code/control/cyclic-step-machine'
import {
  huskPhotonLambda,
  kappaOf,
  photonOmega,
} from '@/code/measure/one-light-speed'
import {
  huskDirections,
  logSlope,
  spread,
} from '@/code/measure/husk-transport-order'
import { anisotropySpreadOrder } from '@/code/measure/dispersion'
import {
  hypercubicAxes,
  probeDirections4D,
  rootsD4,
} from '@/code/algebra/group/root-system'

const LENGTHS = [12, 48, 192, 768]
const PERIODS = 3
const DEPTH = 16
const KS = [0.8, 0.4, 0.2, 0.1, 0.05, 0.025]
const FIT_FROM = 2
const SCALES = [0.25, 0.5, 1, 1.5, 2]
const BOUND = 1e-18
const REST_SHARES = [0, 12, 24, 36]

// the net step vector of a loop
function netSteps(machine: CyclicMachine): [number, number, number] {
  const n = stepCounts(machine)

  return [n[0]! - n[1]!, n[2]! - n[3]!, n[4]! - n[5]!]
}

export default experiment({
  id: 'relativity/taxicab-control-anisotropy',
  code: 'E-RLT-0113',
  title:
    "the taxicab control, pass: a particle that is a looped list of unit axis steps (the Matter As Machine model, built as an external control) has top speed 1 on an axis and 1 / sqrt 3 on a body diagonal at every loop length, spread 0.605 over 37 husk directions at N = 12 to 768, order 0, anisotropic at leading order; Vibe's husk photon on the same directions has spread 1.7e-4 at |k| = 0.8 falling as |k|^4.00 to 1.6e-10 at 0.025, the D4 set at order 4.04 against a hypercubic 2.01; this clears Vibe's light, while its matter on the working rule moves on lines and is anisotropic at leading order too (E-SPN-0126)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const directions = huskDirections(24)
    const metrics: Record<string, number> = {}

    // ---- T1 and T2: the control machine ----
    let exactMisses = 0
    let lawGap = 0
    let fitResidual = 0

    const spreads: number[] = []

    for (const N of LENGTHS) {
      const speeds: number[] = []

      for (const u of directions) {
        const machine = machineToward({ direction: u, length: N, rest: 0 })
        const { displacement, beats } = measuredDisplacement({
          machine,
          periods: PERIODS,
        })
        const net = netSteps(machine)

        if (displacement.some((x, i) => x !== PERIODS * net[i]!)) {
          exactMisses++
        }

        const speed = Math.hypot(...displacement) / beats
        const l1 = Math.abs(net[0]) + Math.abs(net[1]) + Math.abs(net[2])

        lawGap = Math.max(lawGap, Math.abs(speed - Math.hypot(...net) / l1))

        if (N === LENGTHS[LENGTHS.length - 1]) {
          const unitL1 = Math.abs(u[0]!) + Math.abs(u[1]!) + Math.abs(u[2]!)

          fitResidual = Math.max(fitResidual, Math.abs(speed * unitL1 - 1))
        }

        speeds.push(speed)
      }

      const s = spread(speeds)

      spreads.push(s)
      metrics[`taxicabSpread_N${N}`] = s
      metrics[`taxicabMin_N${N}`] = Math.min(...speeds)
      metrics[`taxicabMax_N${N}`] = Math.max(...speeds)
    }

    const examples = ['RRRR', 'RRRRLLL'].map(letters => {
      const { displacement, beats } = measuredDisplacement({
        machine: machineFromLetters(letters),
        periods: PERIODS,
      })

      return { x: displacement[0], beats }
    })
    const examplesExact =
      examples[0]!.x * 1 === examples[0]!.beats &&
      examples[1]!.x * 7 === examples[1]!.beats

    const taxicabSlope = logSlope(
      LENGTHS.map(N => 1 / N),
      spreads,
    )
    const t1 = exactMisses === 0 && examplesExact && lawGap <= 1e-12
    const t2 =
      spreads.every(s => s >= 0.3) && Math.abs(taxicabSlope.slope) <= 0.1

    metrics.machineExactMisses = exactMisses
    metrics.examplesExact = examplesExact ? 1 : 0
    metrics.taxicabLawGap = lawGap
    metrics.taxicabUnitL1FitResidual_N768 = fitResidual
    metrics.taxicabSlopeInverseN = taxicabSlope.slope
    metrics.taxicabSlopeError = taxicabSlope.error

    // the machine's clock law: a cancelling share s, |v|_1 + s = 1
    let clockGap = 0

    for (const rest of REST_SHARES) {
      for (const u of directions) {
        const machine = machineToward({ direction: u, length: 96, rest })
        const { displacement, beats } = measuredDisplacement({
          machine,
          periods: PERIODS,
        })
        const v1 = displacement.reduce((a, x) => a + Math.abs(x), 0) / beats

        clockGap = Math.max(clockGap, Math.abs(v1 + rest / 96 - 1))
      }
    }

    metrics.clockL1LawGap = clockGap

    // ---- T3: the D4 set against a hypercubic set ----
    const probes = probeDirections4D()
    const d4 = anisotropySpreadOrder({
      directions: rootsD4(),
      probes,
      scales: SCALES,
    })
    const cubic = anisotropySpreadOrder({
      directions: hypercubicAxes(4),
      probes,
      scales: SCALES,
    })
    const t3 = d4.order >= 3.5 && cubic.order <= 2.5

    metrics.d4Order = d4.order
    metrics.d4SpreadAtLowK = d4.spreads[0]!
    metrics.cubicOrder = cubic.order
    metrics.cubicSpreadAtLowK = cubic.spreads[0]!

    // ---- T4: the husk photon ----
    const kappa = kappaOf(DEPTH)
    const photon = KS.map(k =>
      spread(
        directions.map(
          u =>
            photonOmega(kappa, huskPhotonLambda(u.map(x => x * k))) / k,
        ),
      ),
    )
    const photonSlope = logSlope(KS.slice(FIT_FROM), photon.slice(FIT_FROM))
    const last = photon[photon.length - 1]!
    const taxicabLast = spreads[spreads.length - 1]!
    const t4 =
      photonSlope.slope >= 3.5 &&
      photonSlope.error < 0.1 &&
      last < 1e-6 * taxicabLast

    KS.forEach((k, i) => {
      metrics[`photonSpread_k${k}`] = photon[i]!
    })
    metrics.photonOrder = photonSlope.slope
    metrics.photonOrderError = photonSlope.error
    metrics.photonOverTaxicab_k0025 = last / taxicabLast

    // where the photon's order-4 law reaches the bound, in husk units of |k| (a dock is 1)
    const kAtBound =
      KS[KS.length - 1]! * (BOUND / last) ** (1 / photonSlope.slope)

    metrics.photonKAtBound = kAtBound
    metrics.taxicabOverBound = taxicabLast / BOUND

    const gates = { T1: t1, T2: t2, T3: t3, T4: t4 }

    for (const [g, ok] of Object.entries(gates)) {
      metrics[`gate${g}`] = ok ? 1 : 0
    }

    const status = !t1 ? 'partial' : t2 && t3 && t4 ? 'pass' : 'fail'

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `the cyclic step machine (an external control: a loop of unit axis steps) has top speed ${metrics[`taxicabMax_N768`]!.toFixed(4)} on an axis and ${metrics[`taxicabMin_N768`]!.toFixed(4)} on a body diagonal, spread ${spreads.map(s => s.toFixed(4)).join(', ')} over 37 husk directions at N = ${LENGTHS.join(', ')} (log slope against 1 / N ${taxicabSlope.slope.toFixed(4)}), equal to |n|_2 / |n|_1 to ${lawGap.toExponential(1)}: anisotropic at leading order; Vibe's husk photon at D ${DEPTH} has spread ${photon.map(s => s.toExponential(2)).join(', ')} at |k| = ${KS.join(', ')}, order ${photonSlope.slope.toFixed(3)} +- ${photonSlope.error.toExponential(1)}, ${(last / taxicabLast).toExponential(1)} of the taxicab's at the longest wave; D4 order ${d4.order.toFixed(2)} against hypercubic ${cubic.order.toFixed(2)}`,
      metrics,
      control: {
        taxicabSpread: taxicabLast,
        taxicabOrder: taxicabSlope.slope,
        hypercubicOrder: cubic.order,
      },
      notes: `L1 (T1 to T3) and L2 (T4). Gates ${Object.entries(gates)
        .map(([g, ok]) => `${g} ${ok}`)
        .join(', ')}. The taxicab spread sits ${(taxicabLast / BOUND).toExponential(1)} times above the about 1e-18 bound on light-speed anisotropy at every scale, because it has no scale; its speed times |u|_1 is 1 to ${fitResidual.toExponential(1)} at N = 768 (the direction rounding). The photon's order-4 law reaches 1e-18 at |k| = ${kAtBound.toExponential(2)} per dock, so the residual is below the bound for light of wavelength above about ${((2 * Math.PI) / kAtBound).toExponential(1)} docks. The machine's clock: |v|_1 + s = 1 to ${clockGap.toExponential(1)} on every loop with a cancelling share s, so at v = 1/2 on an axis its internal rate is 0.5 where Lorentz gives 0.866. VIBE'S OWN RESIDUAL: the light is isotropic through order 2 and anisotropic at order 4 (spread ${photon[0]!.toExponential(2)} at |k| = 0.8), but this is the light only. On the working rule matter moves along twelve line classes, and E-SPN-0126 reads a massless average at 0.354 to 0.441 c by direction, an order-0 anisotropy of the same class as the taxicab's (smaller, about 22 percent against ${(100 * taxicabLast).toFixed(0)}); E-RLT-0059 reads the committed knits' husk transport anisotropy at exponent 0. The candidate rule's register moves a hole isotropically (E-SPN-0145) but is not adopted. ${metrics.seconds.toFixed(1)} s.`,
    })
  },
})
