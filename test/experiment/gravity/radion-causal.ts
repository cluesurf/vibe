// The radion, moving (E-GRV-0080): does the depth's wave (E-GRV-0079, code/rule/trit-radion) carry its pull at a finite
// speed, pull a light and a heavy lump alike, and bend light?
//
// WHY. E-GRV-0076 to 0078 made the vector even field attract by counting its static energy negative, and it passed every
// gate but one: when a source hops, its pull changes at once at every distance (E-GRV-0077 R: E_L by 1.4e-2 to 3.1e-4
// at d = 2 .. 7 on beat 0), because in a vector field the static part's instant change is cancelled only by the
// radiating part, and negating one of the two breaks the cancellation. A scalar has no constraint: its static field is
// not solved at each beat but built by the waves themselves, so its change must travel.
//
// THE READINGS (code/measure/radion, fixed before the gated run; no probe of this file's readings was run):
//  C1 causal: a source of content 4 (sink at (8, 8, 8), side 16, D 16) and the same source one dock along x, each from
//     zero field, run 64 beats side by side. At (0, d, 0), d = 2 .. 7: the first beat at which ANY integer register there
//     differs, and the first beat at which the change of x there reaches half its final static change 4 (G_T(y - e_x) -
//     G_T(y)) (the arrival of the pull's change). GATES: nothing differs at d >= 2 after beat 1 (the instant change is 0)
//     and no register differs before beat d (the mesh's own cone: the rule reads only the 18 neighbors each beat); the
//     half arrivals, fitted as t = t0 + rho / v on d = 3 .. 7 with rho = sqrt(d^2 + 1/4) (from the hop's midpoint),
//     give v within 10 percent of the scalar's c_s = c(16) = 2 / sqrt(99) = 0.20101.
//  C2 fall alike: the neutral source (2 love, 2 fear: content 4) and a test lump of 1 love (content 1) or of 3 fear
//     (content 3) at r = 3 and 5 (six configurations each, as E-GRV-0079); the force at 4 is -(W(5) - W(3)) / 2 and the
//     acceleration a = F / content. INERTIA IS A STAND-IN (content), as in E-GRV-0077, so this is the universality of
//     the pull per unit content, not an equivalence of inertial and gravitational mass. GATES: both a < 0 (toward),
//     alike to 1e-6 relative, each within 1e-3 of the closed form -4 (pi / D)(Delta(5) - Delta(3)) / 2 (Delta the torus
//     Green's difference); a zero source gives |a| < 1e-12. CONTROL: E-GRV-0077 recorded the vector even field's
//     acceleration with its static part negated at -6.41986e-4 and unmodified at +6.42e-4 (it repels); the scalar,
//     whose static energy is minus the vector's by derivation, must give -6.41986e-4 to 1e-5.
//  C3 light (REPORTED, not gated). The scalar sets the light's depth: D = D0 + n, n the count of half-level thresholds
//     its static field crosses (+j at x >= j - 1/2; the value the rule's own phi register holds there, its fraction in
//     -1/2 .. 1/2 carried). A point lump's lens cannot be read here: E-GRV-0075's packet (16 docks) read 20 docks behind
//     its lens sat in one Fresnel zone, sqrt(16 x 20) = 17.9 docks, and a 1/b deflection read beyond that scale is under
//     1e-3 rad for any lump this box holds. So the reduced run is a SLAB: a sheet of content 1 per dock at x = 90 with
//     its sink sheet 128 away on a 256 x 2 x 2 line (a plane wave through a planar lens is one-dimensional, so no Fresnel
//     scale enters). The field is the rule's time average (16384 beats); the light (one-level husk rule, E-GRV-0070's
//     packet: D 16, amplitude 12, 16 docks) crosses it, and the delay between x = 60 and 120 against a uniform run is
//     compared with the eikonal sum of 1 / c(D) - 1 / c(D0). THE NEWTONIAN COUNT: a unit of content at x has energy
//     -(pi / D) x in the field, so with inertia 1 per unit content (the stand-in) the potential is Phi_N = -(pi / D) x,
//     and the index a potential alone gives light is 1 - Phi_N / c0^2 (the Newtonian falling-light count; general
//     relativity doubles it, Nordstrom's scalar gravity gives no bending at all). The factor reported is the measured
//     delay over the count's. In the weak field it is (dn/dx) c0^2 / (pi / D) = 4 D / (3 pi (2D + 1)^2) = 0.00624 at D 16.
//     Also reported: the point-lump eikonal alpha(b) = M / (12 pi (2D0 + 1) b) for M = 28.
// Instrument: exact reversal of every scalar run and of the light runs, Gauss 0 on the light. Verdict: pass if C1 and C2
// hold with their control; partial if the instrument or the control fails; fail otherwise.
//
// ABORTED RUN (tmp/grv80-run1.log): the lens's negative threshold count looped forever (a sign slip in the count, fixed
// before any reading); it printed only two timings and no verdict.
// FIRST RUN (tmp/grv80-run2.log, 64 s, the record): fail on C1's speed, no gate moved. C1: nothing changes at d = 2 .. 7
// on beat 1 (the change there is exactly 0), and the first register changes at beats 3, 4, 5, 7, 10, 14, inside the
// mesh's cone and never at once; but the change of x reaches half its final static size at beats 9, 12, 16, 20, 24, 29,
// a front at 0.2367 = 1.18 c_s against the 10 percent gate. C2 holds: -6.419860e-4 and -6.419860e-4 per unit content,
// alike to 8.7e-12, the closed form to 1.6e-9, E-GRV-0077's negated vector to 2e-8; a zero source gives exactly 0. C3:
// the scalar deepens the slab to D 21 and shallows its sink to D 11; the light is delayed 34.474 beats between x = 60
// and 120 against the eikonal 34.431 (0.13 percent), 0 wraps; the Newtonian count is 5922.9 beats, so the factor is
// 0.00582 (weak field 0.00624). POST RUN (tmp/rad-post80.ts, read by no gate): the change at d is not a step but a
// pulse (the retarded dipole's front term, p . r-hat delta(t - r / c) / (4 pi r c), spread by the mesh) whose peak is 5
// to 6 times the final change, so the gated reading, half the FINAL change, fires on the pulse's leading edge. The
// pulse's own half-peak arrives at beats 16, 20, 25, 30, 35 at d = 3 .. 7 against rho / c_s = 15.1, 20.1, 25.0, 30.0,
// 34.9: the pull's change travels at c_s (a fit gives 1.04 c_s). The gate asked the wrong size of the right front.
//
// Depth L2: a known construction run as the rule's own dynamics, with closed forms that could fail. DETERMINISM:
// every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule; the
// hop is a scheduled change of the source map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import {
  FALL_R,
  FALL_SOURCE,
  HOP_D,
  LENS_DETECTORS,
  radionCausalSurvey,
  RADION_DEPTH,
  STATIC_SIDE,
} from '@/code/measure/radion'

const RECORDED_0077 = -6.41986e-4
const LUMP_28 = 28
const IMPACTS: readonly number[] = [4, 8, 16, 32]

export default experiment({
  id: 'gravity/radion-causal',
  code: 'E-GRV-0080',
  title:
    "the depth field's pull is retarded where the negated vector's acted at once, lumps fall alike, and the light it deepens is delayed as its eikonal says, fail on C1's speed reading: when a source hops one dock nothing changes at d = 2 .. 7 on beat 1 (E-GRV-0077's proposal changed there at once by 1.4e-2 to 3.1e-4) and the first register changes at beats 3 to 14, but the change reaches half its final size at beats 9 to 29, a front at 1.18 c_s against a 10 percent gate, because it arrives as a pulse 5 to 6 times the final change (a post run reads the pulse's half-peak at beats 16 to 35 against rho / c_s = 15.1 to 34.9, 1.04 c_s); a 1-love and a 3-fear lump accelerate toward a neutral source at -6.41986e-4 per unit content, alike to 8.7e-12 (inertia a stand-in); a slab the field deepens to D 21 delays the light 34.47 beats against the eikonal 34.43, which is 0.0058 of the Newtonian falling-light count (general relativity 2, Nordstrom 0): the light is slowed where the field is deep, so it bends toward a lump and this is not Nordstrom's scalar, but the factor is a free ratio of the depth per content to the pull on matter (general relativity needs about 320 times this one), so the box cannot tell general relativity from Newton",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = radionCausalSurvey(what => console.error(what))
    const D = RADION_DEPTH
    const c = lightSpeed(D)

    // C1
    const hop = s.hop
    const rho = HOP_D.map(d => Math.sqrt(d * d + 0.25))
    const fitFrom = HOP_D.indexOf(3)
    const xs = rho.slice(fitFrom)
    const ys = hop.halfArrival.slice(fitFrom)
    const mx = xs.reduce((a, v) => a + v, 0) / xs.length
    const my = ys.reduce((a, v) => a + v, 0) / ys.length
    const slope =
      xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) /
      xs.reduce((a, v) => a + (v - mx) ** 2, 0)
    const frontSpeed = 1 / slope
    const noInstant = hop.instantChange.every(v => v === 0)
    const cone = hop.firstChange.every((t, i) => t >= HOP_D[i]!)
    const c1 = noInstant && cone && Math.abs(frontSpeed / c - 1) <= 0.1

    // C2
    const force = (w: number[]): number =>
      -(w[1]! - w[0]!) / (FALL_R[1]! - FALL_R[0]!)
    const aLight = force(s.fall.light) / 1
    const aHeavy = force(s.fall.heavy) / 3
    const aZero = force(s.fall.zero) / 1
    const aWant =
      (-FALL_SOURCE *
        (Math.PI / D) *
        (huskGreenDifference(STATIC_SIDE, [FALL_R[1]!, 0, 0]) -
          huskGreenDifference(STATIC_SIDE, [FALL_R[0]!, 0, 0]))) /
      (FALL_R[1]! - FALL_R[0]!)
    const alike = Math.abs(aLight / aHeavy - 1)
    const c2 =
      aLight < 0 &&
      aHeavy < 0 &&
      alike <= 1e-6 &&
      Math.abs(aLight / aWant - 1) <= 1e-3 &&
      Math.abs(aHeavy / aWant - 1) <= 1e-3 &&
      Math.abs(aZero) < 1e-12
    const control = Math.abs(aLight / RECORDED_0077 - 1) <= 1e-5

    // C3
    const lens = s.lens
    const factor = lens.measuredDelay / lens.newtonDelay
    const factorLinear = lens.linearDelay / lens.newtonDelay
    const factorWeak = (4 * D) / (3 * Math.PI * (2 * D + 1) ** 2)
    const fieldOff = Math.max(
      ...lens.field.map((v, i) => Math.abs(v - lens.closedField[i]!)),
    )
    const depthTop = Math.max(...lens.depth)
    const depthLow = Math.min(...lens.depth)
    const wraps = (w: {
      angle: number
      field: number
      potential: number
    }): number => w.angle + w.field + w.potential
    const pointLens = IMPACTS.map(
      b => LUMP_28 / (12 * Math.PI * (2 * D + 1) * b),
    )

    const instrument =
      hop.reversed &&
      s.fall.tally.reversed &&
      lens.fieldReversed &&
      lens.u0.reversed &&
      lens.lens.reversed &&
      lens.u0.gauss === 0 &&
      lens.lens.gauss === 0
    const status =
      !instrument || !control ? 'partial' : c1 && c2 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      control_C2: control ? 1 : 0,
      instrument: instrument ? 1 : 0,
      depth: D,
      scalarSpeed: c,
      frontSpeed,
      frontSpeedRatio: frontSpeed / c,
      aLight,
      aHeavy,
      aWant,
      alike,
      aZero,
      recorded0077: RECORDED_0077,
      lensMeasuredDelay: lens.measuredDelay,
      lensEikonalDelay: lens.eikonalDelay,
      lensLinearDelay: lens.linearDelay,
      lensNewtonDelay: lens.newtonDelay,
      lensFactor: factor,
      lensFactorLinear: factorLinear,
      lensFactorWeak: factorWeak,
      lensFieldOff: fieldOff,
      lensDepthTop: depthTop,
      lensDepthLow: depthLow,
      lensWraps: wraps(lens.lens.wraps),
      fresnel: Math.sqrt(16 * 20),
      seconds: s.seconds,
    }

    HOP_D.forEach((d, i) => {
      metrics[`hopFirstChange_d${d}`] = hop.firstChange[i]!
      metrics[`hopHalfArrival_d${d}`] = hop.halfArrival[i]!
      metrics[`hopFinalChange_d${d}`] = hop.finalChange[i]!
      metrics[`hopLightCone_d${d}`] = rho[i]! / c
    })

    IMPACTS.forEach((b, i) => {
      metrics[`pointLensAlpha_b${b}`] = pointLens[i]!
    })

    return verdict({
      status,
      claim: `the radion at D ${D}: when a source hops one dock, nothing changes at d = ${HOP_D.join(', ')} on beat 1 (${noInstant ? 'none' : 'SOME'}), the first register there changes at beats ${hop.firstChange.join(', ')} and the pull's change reaches half its final size at beats ${hop.halfArrival.join(', ')}, a front at ${f(frontSpeed)} (c_s = ${f(c)}, ratio ${f(frontSpeed / c)}); a 1-love and a 3-fear lump at r = 4 from a neutral source accelerate at ${f(aLight)} and ${f(aHeavy)} per unit content (alike to ${e(alike)}, the closed form ${f(aWant)}, E-GRV-0077's negated vector ${RECORDED_0077}), inertia a stand-in; a slab of content the scalar deepens to D ${depthTop} (and shallows its sink to ${depthLow}) delays the light between x = ${LENS_DETECTORS[0]} and ${LENS_DETECTORS[LENS_DETECTORS.length - 1]} by ${f(lens.measuredDelay)} beats against the eikonal ${f(lens.eikonalDelay)}, which is ${f(factor)} times the Newtonian falling-light count (${f(lens.newtonDelay)}; weak-field ${f(factorWeak)}; general relativity 2, Nordstrom 0)`,
      metrics,
      control: {
        recorded0077: RECORDED_0077,
        controlHolds: control ? 1 : 0,
        aZero,
      },
      notes: `L2. Gates C1 ${c1}, C2 ${c2}; control ${control}; instrument ${instrument}. Hop final changes ${hop.finalChange.map(e).join(', ')}; instant changes ${hop.instantChange.map(e).join(', ')}; light-cone beats rho / c_s ${rho.map(r => (r / c).toFixed(1)).join(', ')}. W at r = ${FALL_R.join(', ')}: light ${s.fall.light.map(x => x.toExponential(8)).join(' ')}, heavy ${s.fall.heavy.map(x => x.toExponential(8)).join(' ')}, zero ${s.fall.zero.join(' ')}. Lens field (rule average) against the closed tent to ${e(fieldOff)}; depth along x (every 8): ${lens.depth.filter((_, i) => i % 8 === 0).join(' ')}; light arrivals uniform ${lens.u0.arrival.map(x => x.toFixed(2)).join(' ')}, lens ${lens.lens.arrival.map(x => x.toFixed(2)).join(' ')} at x = ${LENS_DETECTORS.join(', ')}; lens wraps ${JSON.stringify(lens.lens.wraps)}. Linear-index delay ${f(lens.linearDelay)}. Point-lump eikonal alpha(b) for M = ${LUMP_28}: ${pointLens.map(e).join(', ')} rad at b = ${IMPACTS.join(', ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
