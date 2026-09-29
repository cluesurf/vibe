// The bounded depth field, moving (E-GRV-0091): on the registers of code/rule/step-depth (no depth stored, a line trit
// and a step of a trit and three digits per link, a rate and a remainder per dock), does the radion's dynamics survive:
// exact reversal, a pull that changes at a finite speed when a source hops, a light and a heavy lump falling alike, and
// a kept energy?
//
// THE HOP. A unit of content hopping from dock y to a neighbor z adds a unit line from z to y along the first path of one
// or two links that keeps every line a trit (code/rule/step-depth hopPaths): the lines' divergence moves with the content
// and no other register changes at that moment, so the change can only spread through the beat, which reads each dock's
// links. Gauss's law holds on every beat through the hop. The path is part of the scheduled event, so it reverses.
//
// DISCLOSED PROBE (tmp/bound-probe1.log, side 8, instrument only): the depth found by summation equals E-GRV-0079's
// integer radion's x to 5.6e-17 over 64 beats; a hop of 4 units runs and reverses exactly with Gauss 0 off; covariant
// under x <-> y; the energy on a content-4 lump wanders by about 1e-6 over 256 beats. No gate below was set from a
// reading of this file.
//
// GATES, fixed before the first run of this file (D 16, three digits, kappa = 2 / 297, c(16) = 2 / sqrt(99) = 0.20101):
//  D1 exact: (a) a content-4 source on side 12 (sink (6, 6, 6)) hopping one dock along x and back every 256 beats (15
//     hops of 4 units each) over 4096 beats: Gauss 0 off on every beat, curl 0 on every check, 0 wraps, and the run
//     reverses to its start bit for bit, lines included; (b) the dense lump of E-GRV-0090 (M = 400 at its lines'
//     capacity, side 16, 512 beats), wraps and all, reverses bit for bit; (c) covariance: a source at (1, 2, 0) on side 16
//     (sink (8, 8, 8)) and its images under x <-> y and x -> -x, 64 beats: the steps, rates and remainders are the images
//     of each other bit for bit (the lines routed afresh); (d) the depth found by summation equals E-GRV-0079's integer
//     radion's x (relative to dock 0) to 1e-12 on every dock of every one of 256 beats (side 8, content 4).
//  D2 causal: a content-4 source at the origin (sink (8, 8, 8), side 16) from zero field; in one run it hops to (1, 0, 0)
//     after beat 32, in the other it stays; compared for 96 beats after the hop at (0, d, 0), d = 2 .. 7: (a) no register
//     there (rate, remainder, the nine out-links' steps and lines) differs after the first beat following the hop (the
//     instant change is 0); (b) none differs before beat d after the hop (the mesh's cone); (c) the change of the radial
//     step (the out-link along +y) arrives as a pulse whose half-peak beat, fitted as t0 + rho / v on d = 3 .. 7 (rho from
//     the hop's midpoint to the link's), gives v within 10 percent of c(16). (E-GRV-0080 gated the half of the FINAL
//     change and read its pulse's half-peak only after the run, at 1.04 c; this gate asks for the pulse from the start.)
//     REPORTED: the Gauss-projected depth (the content solved at once, as tmp/step-field-probe) changes at every d on the
//     hop beat by 4 |G(y - e_x) - G(y)|, and the found depth's own pulse at (0, d, 0) against the sink's.
//  D3 fall alike: E-GRV-0080's readings on this rule: the neutral source (2 love, 2 fear: content 4) and a test lump of
//     1 love or 3 fear at r = 3 and 5 through E-GRV-0079's six configurations, a = -(W(5) - W(3)) / 2 / content (INERTIA
//     IS A STAND-IN: content). Gates: both a < 0, alike to 1e-6, each within 1e-3 of -4 (pi / D)(Delta(5) - Delta(3)) / 2;
//     a zero source gives |a| < 1e-12. CONTROL: E-GRV-0080's recorded -6.41986e-4 to 1e-5.
//  D4 energy: a content-4 lump on side 8 (at (2, 2, 2), sink (6, 6, 6)) from zero field, 4096 beats, E every 64 (depth
//     found by summation): at three digits max |E - E(0)| is at most 1e-4 of the lump's static energy's size, and it falls
//     at every added digit from one to three; the field part (E less the source term) is >= 0 at every sample; the found
//     and local source terms agree to 1e-9. REPORTED: four digits.
// Verdict: pass if D1 to D4 and the control hold; partial if the control fails; fail otherwise.
//
// FIRST RUN (tmp/grv91-run1.log, 89 s, the record): fail on D1 (a) and D2 (c), no gate moved. D1: the long hopping run
// keeps Gauss (0 off on 4,096 beats), curl 0, and reverses bit for bit, lines included, but its steps WRAP 30 times
// (largest 1.476): the gate asked for 0; the dense lump reverses through 125,296 step and 494 rate wraps; covariant
// under x <-> y and x -> -x bit for bit; the found depth equals E-GRV-0079's radion to 5.6e-17 (depths to 0.342) on
// every dock of 256 beats. D2: nothing changes at d = 2 .. 7 on the beat after the hop, and the first register changes
// 2, 3, 4, 6, 9, 12 beats after (inside the cone), where the content-solved depth would change at once by 2.7e-3 to
// 7.9e-5; but the radial step's half-peak beats read 30, 28, 33, 25, 30, 46, no front (fit 1.50 c). D3 holds: -6.41986e-4
// per unit content for a 1-love and a 3-fear lump, alike to 8.8e-12, E-GRV-0080's to the digit. D4 holds: drift 33.9,
// 6.7e-3, 1.9e-5, 9.2e-8 of the static energy at 1 .. 4 digits (a factor near Q = 297 a digit), field part >= 0, found
// and local source terms 4.4e-16 apart.
// POST RUN (tmp/bound-post91.ts, read by no gate): (1) the hop's radial-step difference does not settle: it rings for
// the whole window and the box's own returns (side 16) exceed the first pulse, so the half-of-maximum reading fired on
// the returns (peaks at beats 95, 93, 48, 44, 58); the leading edge travels: the first beat at 10 percent of the maximum
// is 13, 17, 20, 24, 30 at d = 3 .. 7 (about 0.24 docks a beat, 1.2 c, the lattice's leading edge, as E-GRV-0080's
// 1.18) and at 25 percent 15, 19, 23, 27, 34 (about 1.08 c). (2) the wraps are the hops' radiation piling up in a closed
// box that nothing damps: the largest |F| per 256 beats is 0.63 then about 0.44 with no hops, and climbs 0.63, 1.00,
// 1.06, 1.05, 1.22 .. 1.50 over 15 hops of 4 units each, until the steps wrap. A bounded window needs its radiation to
// leave (an open box) or the source to move gently; a periodic box keeps every kick. Title written after the run.
//
// Depth L2: the radion's known construction on bounded registers, with closed forms and a record that could fail.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a hop is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { radionMesh } from '@/code/rule/trit-radion'
import {
  emptyStep,
  placeLines,
  stepBeat,
  stepDepth,
  stepRule,
  stepScratch,
  type StepState,
} from '@/code/rule/step-depth'
import {
  contentOf,
  dockAt,
  horizonRun,
  hopRun,
  newRecord,
  pairStep,
  radionEquivalence,
  sameUnder,
  staticStepRun,
  stepEnergy,
  type Hop,
} from '@/code/measure/step-depth'

const DEPTH = 16
const LEVELS = 3
const LONG_SIDE = 12
const LONG_BEATS = 4096
const LONG_EVERY = 256
const HOP_SIDE = 16
const HOP_AT = 32
const HOP_WINDOW = 96
const HOP_D: readonly number[] = [2, 3, 4, 5, 6, 7]
const SOURCE = 4
const FALL_R: readonly number[] = [3, 5]
const RECORDED_0080 = -6.41986e-4
const ENERGY_SIDE = 8
const ENERGY_BEATS = 4096
const ENERGY_EVERY = 64
const STATIC_BEATS = 1024

type Watch = {
  v: number
  r: number
  steps: number[]
  lines: number[]
  radial: number
  depth: number
}

function watch(
  s: StepState,
  found: { twice: Float64Array },
  y: number,
  reference: number,
): Watch {
  return {
    v: s.rate[y]!,
    r: s.rest[y]!,
    steps: Array.from({ length: 9 }, (_, h) => s.step[y * 9 + h]!),
    lines: Array.from({ length: 9 }, (_, h) => s.line[y * 9 + h]!),
    radial: s.step[y * 9 + 1]!,
    depth: (found.twice[y]! - found.twice[reference]!) / 2,
  }
}

const differs = (a: Watch, b: Watch): boolean =>
  a.v !== b.v ||
  a.r !== b.r ||
  a.steps.some((x, i) => x !== b.steps[i]) ||
  a.lines.some((x, i) => x !== b.lines[i])

const halfPeak = (series: number[]): number => {
  const top = Math.max(...series.map(Math.abs))

  return series.findIndex(x => Math.abs(x) >= top / 2) + 1
}

export default experiment({
  id: 'gravity/step-depth-moving',
  code: 'E-GRV-0091',
  title:
    "the bounded depth field reverses exactly, never acts at once, falls alike and keeps its energy, but a hopping source's radiation fills the trit window in a closed box, fail on D1's wraps and D2's speed reading: the found depth equals E-GRV-0079's radion to 5.6e-17, covariant under reflections bit for bit, every run reverses; after a hop nothing changes at d = 2 .. 7 on the next beat and the first register changes 2 to 12 beats later, but the change rings in the periodic box so its half-of-maximum reading scatters (1.50 c; post run its leading edge travels at about 1.2 and 1.08 c); lumps fall at -6.41986e-4 per unit content, alike to 8.8e-12; energy drift 1.9e-5 of the static at three digits; 15 hops of 4 units pump the undamped field from 0.44 to 1.48 steps a link and 30 steps wrap",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // D1 (a): the long hopping run
    const longMesh = radionMesh([LONG_SIDE, LONG_SIDE, LONG_SIDE])
    const longRecord = newRecord()
    const hops: Hop[] = []

    for (let k = 1; k * LONG_EVERY < LONG_BEATS; k++) {
      hops.push({
        beat: k * LONG_EVERY,
        from: k % 2 === 1 ? [0, 0, 0] : [1, 0, 0],
        to: k % 2 === 1 ? [1, 0, 0] : [0, 0, 0],
        units: SOURCE,
      })
    }

    const longRun = hopRun(
      longMesh,
      rule,
      contentOf(longMesh, [
        {
          at: [0, 0, 0],
          to: [LONG_SIDE / 2, LONG_SIDE / 2, LONG_SIDE / 2],
          units: SOURCE,
        },
      ]),
      hops,
      LONG_BEATS,
      longRecord,
    )
    const longWraps = longRecord.wraps.fWraps + longRecord.wraps.vWraps
    const d1a =
      longRun.reversed &&
      longRecord.gaussOff === 0 &&
      longRecord.curl === 0 &&
      longWraps === 0

    log('long')

    // D1 (b): the dense lump through its wraps
    const horizon = horizonRun(HOP_SIDE, DEPTH, LEVELS, 400, 512)
    const d1b = horizon.reversed

    log('horizon')

    // D1 (c): covariance
    const mesh = radionMesh([HOP_SIDE, HOP_SIDE, HOP_SIDE])
    const sink = [HOP_SIDE / 2, HOP_SIDE / 2, HOP_SIDE / 2]
    const swap = [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ]
    const reflect = [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
    const covRecord = newRecord()
    const at = [1, 2, 0]
    const run64 = (p: readonly number[]): StepState =>
      hopRun(
        mesh,
        rule,
        contentOf(mesh, [{ at: p, to: sink, units: SOURCE }]),
        [],
        64,
        covRecord,
      ).final
    const base = run64(at)
    const swapped = sameUnder(mesh, swap, base, run64([2, 1, 0]))
    const reflected = sameUnder(mesh, reflect, base, run64([-1, 2, 0]))
    const d1c = swapped && reflected && covRecord.reversed

    // D1 (d): the radion beside it
    const eqMesh = radionMesh([ENERGY_SIDE, ENERGY_SIDE, ENERGY_SIDE])
    const lumpRho = contentOf(eqMesh, [
      { at: [2, 2, 2], to: [6, 6, 6], units: SOURCE },
    ])
    const equivalence = radionEquivalence(
      ENERGY_SIDE,
      DEPTH,
      LEVELS,
      lumpRho,
      256,
    )
    const d1d = equivalence.largestDifference <= 1e-12

    log('covariance and equivalence')

    // D2
    const hopRecord = newRecord()
    const rho0 = contentOf(mesh, [
      { at: [0, 0, 0], to: sink, units: SOURCE },
    ])
    const docks = HOP_D.map(d => dockAt(mesh, [0, d, 0]))
    const reference = dockAt(mesh, sink)
    const traceA: Watch[][] = []
    const traceB: Watch[][] = []
    const total = HOP_AT + HOP_WINDOW

    const keep =
      (trace: Watch[][]) =>
      (t: number, s: StepState): void => {
        if (t <= HOP_AT) {
          return
        }

        const found = stepDepth(mesh, s.step)

        trace.push(docks.map(y => watch(s, found, y, reference)))
      }

    hopRun(mesh, rule, rho0, [], total, hopRecord, keep(traceA))
    hopRun(
      mesh,
      rule,
      rho0,
      [{ beat: HOP_AT, from: [0, 0, 0], to: [1, 0, 0], units: SOURCE }],
      total,
      hopRecord,
      keep(traceB),
    )

    const firstChange = HOP_D.map(
      (_, i) =>
        traceA.findIndex((w, k) => differs(w[i]!, traceB[k]![i]!)) + 1,
    )
    const instant = HOP_D.map((_, i) =>
      differs(traceA[0]![i]!, traceB[0]![i]!),
    )
    const radialPulse = HOP_D.map((_, i) =>
      traceA.map(
        (w, k) => (traceB[k]![i]!.radial - w[i]!.radial) / rule.unit,
      ),
    )
    const depthPulse = HOP_D.map((_, i) =>
      traceA.map(
        (w, k) => (traceB[k]![i]!.depth - w[i]!.depth) / rule.unit,
      ),
    )
    const radialHalf = radialPulse.map(halfPeak)
    const depthHalf = depthPulse.map(halfPeak)
    const rho = HOP_D.map(d => Math.sqrt(0.25 + (d + 0.5) ** 2))
    const fitFrom = HOP_D.indexOf(3)

    const slopeOf = (ys: number[], xs: number[]): number => {
      const mx = xs.reduce((a, v) => a + v, 0) / xs.length
      const my = ys.reduce((a, v) => a + v, 0) / ys.length

      return (
        xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) /
        xs.reduce((a, v) => a + (v - mx) ** 2, 0)
      )
    }

    const frontSpeed =
      1 / slopeOf(radialHalf.slice(fitFrom), rho.slice(fitFrom))
    const depthSpeed =
      1 /
      slopeOf(
        depthHalf.slice(fitFrom),
        HOP_D.slice(fitFrom).map(d => Math.sqrt(d * d + 0.25)),
      )
    const projected = HOP_D.map(
      d =>
        SOURCE *
        Math.abs(
          huskGreenDifference(HOP_SIDE, [0, d, 0]) -
            huskGreenDifference(HOP_SIDE, [-1, d, 0]),
        ),
    )
    const noInstant = instant.every(x => !x)
    const cone = firstChange.every((k, i) => k === 0 || k >= HOP_D[i]!)
    const d2 =
      noInstant &&
      cone &&
      firstChange.every(k => k > 0) &&
      Math.abs(frontSpeed / c - 1) <= 0.1 &&
      hopRecord.reversed &&
      hopRecord.gaussOff === 0

    log('hop')

    // D3
    const fallRecord = newRecord()
    const light = FALL_R.map(
      r =>
        pairStep(mesh, rule, r, SOURCE, 1, STATIC_BEATS, fallRecord).w,
    )
    const heavy = FALL_R.map(
      r =>
        pairStep(mesh, rule, r, SOURCE, 3, STATIC_BEATS, fallRecord).w,
    )
    const zero = FALL_R.map(
      r => pairStep(mesh, rule, r, 0, 1, STATIC_BEATS, fallRecord).w,
    )
    const force = (w: number[]): number =>
      -(w[1]! - w[0]!) / (FALL_R[1]! - FALL_R[0]!)
    const aLight = force(light)
    const aHeavy = force(heavy) / 3
    const aZero = force(zero)
    const aWant =
      (-SOURCE *
        (Math.PI / DEPTH) *
        (huskGreenDifference(HOP_SIDE, [FALL_R[1]!, 0, 0]) -
          huskGreenDifference(HOP_SIDE, [FALL_R[0]!, 0, 0]))) /
      (FALL_R[1]! - FALL_R[0]!)
    const alike = Math.abs(aLight / aHeavy - 1)
    const d3 =
      aLight < 0 &&
      aHeavy < 0 &&
      alike <= 1e-6 &&
      Math.abs(aLight / aWant - 1) <= 1e-3 &&
      Math.abs(aHeavy / aWant - 1) <= 1e-3 &&
      Math.abs(aZero) < 1e-12 &&
      fallRecord.reversed
    const control = Math.abs(aLight / RECORDED_0080 - 1) <= 1e-5

    log('fall')

    // D4
    const staticEnergy = staticStepRun(
      eqMesh,
      rule,
      lumpRho,
      STATIC_BEATS,
      newRecord(),
    ).energy

    const energyRun = (
      levels: number,
    ): {
      drift: number
      leastFree: number
      sourceGap: number
      samples: number[]
    } => {
      const r = stepRule(DEPTH, levels)
      const s = emptyStep(eqMesh)
      const sc = stepScratch(eqMesh)

      s.line.set(placeLines(eqMesh, lumpRho))

      const samples: number[] = []

      let leastFree = Infinity
      let sourceGap = 0

      const sample = (): void => {
        const e = stepEnergy(eqMesh, r, s, lumpRho)

        samples.push(e.energy)
        leastFree = Math.min(leastFree, e.free)
        sourceGap = Math.max(
          sourceGap,
          Math.abs(e.sourceFound - e.sourceLocal) /
            Math.max(1e-300, Math.abs(e.sourceLocal)),
        )
      }

      sample()

      for (let t = 1; t <= ENERGY_BEATS; t++) {
        stepBeat(eqMesh, r, s, sc)

        if (t % ENERGY_EVERY === 0) {
          sample()
        }
      }

      return {
        drift:
          Math.max(...samples.map(x => Math.abs(x - samples[0]!))) /
          Math.abs(staticEnergy),
        leastFree,
        sourceGap,
        samples,
      }
    }

    const byLevel = [1, 2, 3, 4].map(energyRun)
    const three = byLevel[2]!
    const d4 =
      three.drift <= 1e-4 &&
      byLevel[0]!.drift > byLevel[1]!.drift &&
      byLevel[1]!.drift > three.drift &&
      three.leastFree >= 0 &&
      three.sourceGap <= 1e-9

    log('energy')

    const d1 = d1a && d1b && d1c && d1d
    const status = !control
      ? 'partial'
      : d1 && d2 && d3 && d4
        ? 'pass'
        : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_D1: d1 ? 1 : 0,
      gate_D2: d2 ? 1 : 0,
      gate_D3: d3 ? 1 : 0,
      gate_D4: d4 ? 1 : 0,
      control_D3: control ? 1 : 0,
      d1a: d1a ? 1 : 0,
      d1b: d1b ? 1 : 0,
      d1c: d1c ? 1 : 0,
      d1d: d1d ? 1 : 0,
      longBeats: LONG_BEATS,
      longHops: hops.length,
      longGaussOff: longRecord.gaussOff,
      longCurl: longRecord.curl,
      longWraps,
      longMaxStep: longRecord.maxStep,
      horizonFWraps: horizon.fWraps,
      horizonVWraps: horizon.vWraps,
      equivalenceDifference: equivalence.largestDifference,
      equivalenceDepth: equivalence.largestDepth,
      scalarSpeed: c,
      frontSpeed,
      frontSpeedRatio: frontSpeed / c,
      depthSpeed,
      depthSpeedRatio: depthSpeed / c,
      aLight,
      aHeavy,
      aWant,
      alike,
      aZero,
      staticEnergy,
      seconds: (Date.now() - started) / 1000,
    }

    HOP_D.forEach((d, i) => {
      metrics[`hopFirstChange_d${d}`] = firstChange[i]!
      metrics[`hopRadialHalfPeak_d${d}`] = radialHalf[i]!
      metrics[`hopDepthHalfPeak_d${d}`] = depthHalf[i]!
      metrics[`hopLightCone_d${d}`] = rho[i]! / c
      metrics[`hopProjectedInstant_d${d}`] = projected[i]!
    })

    byLevel.forEach((b, i) => {
      metrics[`energyDrift_L${i + 1}`] = b.drift
    })

    return verdict({
      status,
      claim: `the radion on bounded registers (no depth stored, D ${DEPTH}, ${LEVELS} digits): a source hopping 15 times over ${LONG_BEATS} beats keeps Gauss (${longRecord.gaussOff} off), curl ${longRecord.curl}, ${longWraps} wraps, and reverses: ${longRun.reversed}; the dense M = 400 lump reverses through ${horizon.fWraps} step and ${horizon.vWraps} rate wraps: ${horizon.reversed}; covariant under x <-> y ${swapped} and x -> -x ${reflected}; the found depth equals E-GRV-0079's radion to ${e(equivalence.largestDifference)} (depths to ${f(equivalence.largestDepth)}); when a source hops one dock nothing changes at d = ${HOP_D.join(', ')} on the next beat (${noInstant ? 'none' : 'SOME'}) and the first register changes ${firstChange.join(', ')} beats after, the radial step's pulse half-peak at ${radialHalf.join(', ')}, a front at ${f(frontSpeed)} (c = ${f(c)}, ratio ${f(frontSpeed / c)}), where the content-solved depth would change at once by ${projected.map(e).join(', ')}; a 1-love and a 3-fear lump fall at ${f(aLight)} and ${f(aHeavy)} per unit content (alike to ${e(alike)}, closed form ${f(aWant)}, E-GRV-0080 ${RECORDED_0080}; inertia a stand-in); the energy drifts ${byLevel.map(b => e(b.drift)).join(', ')} of the static ${f(staticEnergy)} at 1 .. 4 digits over ${ENERGY_BEATS} beats`,
      metrics,
      control: {
        recorded0080: RECORDED_0080,
        controlHolds: control ? 1 : 0,
      },
      notes: `L2. Gates D1 ${d1} (a ${d1a}, b ${d1b}, c ${d1c}, d ${d1d}), D2 ${d2} (instant ${noInstant}, cone ${cone}), D3 ${d3}, D4 ${d4}; control ${control}. Found-depth pulse half-peaks ${depthHalf.join(', ')} (speed ${f(depthSpeed)}); light-cone beats rho / c ${rho.map(r => (r / c).toFixed(1)).join(', ')}. Radial pulse peaks ${radialPulse.map(p => e(Math.max(...p.map(Math.abs)))).join(', ')}, final changes ${radialPulse.map(p => e(p[p.length - 1]!)).join(', ')}. W at r = ${FALL_R.join(', ')}: light ${light.map(x => x.toExponential(8)).join(' ')}, heavy ${heavy.map(x => x.toExponential(8)).join(' ')}, zero ${zero.join(' ')}. Energy at 3 digits (every 512): ${three.samples
        .filter((_, i) => i % 8 === 0)
        .map(x => x.toExponential(3))
        .join(
          ' ',
        )}; least field part ${e(three.leastFree)}; found against local source ${e(three.sourceGap)}. Horizon run energy ${e(horizon.energyStart)} to ${e(horizon.energyEnd)}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
