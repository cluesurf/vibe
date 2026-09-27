// Matter reads the light (E-FRC-0252): the minimal coupling by which a charged vibe's hop picks up the husk
// light's own compact angle as a Peierls phase, exactly, and whether a test charge is then pushed by a source's
// Coulomb field. E-GRV-0059 found the light carries a knot's charge outward as an exact 1/r field while the hop
// that moves matter (code/rule/trit-hop) never reads it: this is the missing half of electromagnetism.
//
// THE LIGHT. The shaped husk light (code/rule/trit-husk-shaped: three levels, cyclic potential, the husk
// integer form of the bulk trit light, equal to it bit for bit by E-FRC-0219 and 0220), D = 32 (angles cycle
// mod 4D = 128), side 24. A source of charge +4 sits at the husk origin and its partner -4 at (12, 12, 12),
// joined by strings of 2 units run each way round the torus, so the strings wind no net flux (no harmonic
// field). The start is relaxed (code/measure/trit-kinetic-light relaxStart: CONSTRUCTION from reals, disclosed)
// so the shadow flux starts at the lattice Coulomb field. The light never reads the test vibe.
//
// THE COUPLING (code/rule/husk-peierls-walk). A test vibe of charge q on the husk line (x, 0, 0), a ring of 24
// docks, hops by 2 V = (zeta + 1/zeta) + (zeta - 1/zeta) T with zeta = zeta_1024 (theta = 2 pi / 1024, band
// mass 1 / (2 theta) = 81.5 in beats^2 per dock^2 at hbar = 1), T the gauge-covariant swap whose hop from x to
// x + 1 carries zeta_128^(-q A_x), A_x the light's INTEGER axis angle on that link, read after each light beat.
// Every amplitude lives in Z[zeta_1024] (512 BigInt coefficients). The sign of the phase is derived (the rule's
// angle is minus the textbook potential), not fitted, and puts a love in an outward field accelerating outward.
// A STAND-IN, disclosed: the test vibe reads the light and does not source it, and it hops only along one line.
// The start is a binomial packet C(16, x - r + 8), real and at rest (k = 0), at r = 4 .. 8 docks from the source.
// Each run is 512 beats.
//
// READINGS. Delta x = the centroid's move over 512 beats (measurement in doubles from the exact amplitudes).
// The electric part (Delta x(+1) - Delta x(-1)) / 2; the charge-blind part (Delta x(+1) + Delta x(-1)) / 2 -
// Delta x(0). Two float REFERENCES run the same walk with continuous phases: the static reference reads the
// relaxed start's static field, A(t) = t E_static (the lattice Coulomb field of E-FRC-0241, whose tail is
// 1 / (24 pi r^2) per unit charge in these units), and the shadow reference reads the light's own shadow angle
// A~ = A + C^T f (the carries included, code/rule/trit-kinetic fieldNumerators).
//
// PROBES BEFORE THE GATES, disclosed (tmp/frc252-probe1.log .. probe3.log). (1) On E-GRV-0059's one-level trit
// light (side 12, D 4) the placed strings' light is hot: the summed flux on the test line wanders by 50 to 316
// units against a Coulomb drift of 0.06 to 3. (2, 3) On the shaped light with a relaxed start, D 4 is hot too
// (every axis angle wanders the full window by beat 16), while at D 32 the shadow angle tracks t E_static to
// 8.5e-5 over 48 beats and the INTEGER angle on the test line stays 0 at every r = 1 .. 6 for all 48 beats (the
// weak field is held in the carries; worst integer lag anywhere 3.98 units). So D 32 was chosen, and the gates
// below ask whether the integer-angle coupling reads the field over a run long enough for the shadow to move by
// several units (512 beats: about 4.6 units at r = 4 and 1.7 at r = 8 on side 24, an estimate from the probes).
//
// Gates, fixed before the first run of this file:
//  P1 exact: the light keeps Gauss on every husk dock at every beat and runs back to its start exactly; every
//     exact walker's norm trace (the sum of its squared coefficients) equals 4^hops times the start's; two
//     walkers (q = +1 at r = 4, q = -1 at r = 6) run back 512 beats to exactly 4^1024 times their start
//  P2 gauge covariant: under the gauge map eta(a, b, c) = (3 a + 5 b + 7 c + a b) mod 64 (axis angles move by
//     2 d eta, diagonal angles by d eta, so every plaquette field is unchanged) the gauged light's angles equal
//     the ungauged ones plus the map, wrapped, on every link at every beat, every other light array equal; and
//     the walkers q = +1 and -1 at r = 6 reading the gauged angles end exactly at zeta_128^(-2 q eta) psi
//  P3 the push: at every r = 4 .. 8 the love moves away from the +4 source (Delta x(+1) - Delta x(0) > 0), the
//     fear toward it (Delta x(-1) - Delta x(0) < 0), and the electric part is within [0.8, 1.25] of the static
//     reference's electric part
// Verdict: pass if all hold; fail if P1 and P2 hold and P3 fails; partial if P1 or P2 fails.
//
// FIRST RUN (tmp/frc0252-run1.log, 406 s, the record): pass, no gate moved. P1 and P2 exact (Gauss 0 failures,
// the light and both walkers reversed, every norm trace exact, gauged light 0 links and 0 other entries off, gauged
// walkers exact). The electric move is 0.568, 0.435, 0.317, 0.205, 0.121 docks at r = 4 .. 8 against the static
// reference 0.538, 0.387, 0.270, 0.185, 0.126 (ratio 1.056, 1.124, 1.173, 1.108, 0.959); the love moves away and
// the fear toward at every r. The shadow reference equals the static one to 2e-8: the carries hold the field
// exactly. POST-RUN PROBE (tmp/frc252-post1.log, disclosed, gates unchanged): (a) the integer angle on the line
// is nonzero on 207 to 507 of 512 beats and its time mean follows the shadow's (r = 4: 1.480 against 1.348, r = 8:
// 0.254 against 0.306); it reads 0 at beat 512 at every r = 4 .. 8 by its own oscillation (range -2 .. 6), so the
// 48-beat probe's zeros were early beats, not a blind coupling. (b) The charge-blind part of the walk (0.314 at r =
// 4 to 0.017 at r = 8) is in the float static reference too (0.323 to 2.9e-4): the band's non-parabolic response,
// even in q E, of a test vibe in a smooth field, not a force from neutral content. r^2 times the electric move is
// 9.1, 10.9, 11.4, 10.0, 7.7: the packet (width 2 docks) averages a field that varies as 1/r^2 over it, and the
// torus field turns over at r = 12, so the reference, not Newton at the center, is the gate. Title written after
// the run.
//
// Reported, not gated: the shadow reference's electric part; Newton's q (2 pi / 128) E_static(r) T^2 / (2 m)
// beside it; r^2 times the electric part; the charge-blind part; the integer angle's lag behind the shadow on the
// line. DETERMINISM: no start is drawn. Depth: L2 for P3 (the rule's own light against the lattice Coulomb
// field), L1 for P1 and P2 (identities of the construction, checked exactly on the run).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addCurrent, huskGeometry, makeHuskEngine } from '@/code/rule/trit-husk'
import { copyShaped, emptyShaped, makeShapedScratch, shapedArrays, shapedBeat, shapedBeatBack } from '@/code/rule/trit-husk-shaped'
import { huskGaussFailures, relaxStart } from '@/code/measure/trit-kinetic-light'
import { fieldNumerators, makeFieldScratch, makeMatter } from '@/code/rule/trit-kinetic'
import { dockAt } from '@/code/measure/trit-hop-light'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { copyWalk, gaugeWalk, makeWalk, sameWalk, walkBeat, type PeierlsWalk } from '@/code/rule/husk-peierls-walk'
import { exactWalkRun, floatWalkRun, packetAt, type PeierlsSetting } from '@/code/measure/peierls-reading'

const SIDE = 24
const DEPTH = 32
const LEVELS = 3
const OPTIONS = { levels: LEVELS, cyclic: true }
const ORDER = 1024
const BEATS = 512
const RS = [4, 5, 6, 7, 8]
const SOURCE = 4
const PACK = 16
const mod = (x: number, m: number): number => ((x % m) + m) % m

type LightRecord = {
  // per beat t = 1 .. BEATS, the integer angle and the shadow angle on the line's 24 x-links
  line: Int32Array[]
  shadow: Float64Array[]
  gaugedLine: Int32Array[]
  staticLine: Float64Array
  gaussFailures: number
  reversed: boolean
  gaugeLinkOff: number
  gaugeOtherOff: number
  seconds: number
}

const eta = (a: number, b: number, c: number): number => mod(3 * a + 5 * b + 7 * c + a * b, 64)

function runLight(): LightRecord {
  const started = Date.now()
  const g = huskGeometry(SIDE)
  const e = makeHuskEngine(g, DEPTH)
  const s = emptyShaped(g, LEVELS)
  const strung = (dir: number, units: number): void => {
    const at = [0, 0, 0]

    for (let axis = 0; axis < 3; axis++) {
      for (let i = 0; i < SIDE / 2; i++) {
        const tail = dir > 0 ? [...at] : at.map((v, k) => (k === axis ? v - 1 : v))

        addCurrent(s, dockAt(SIDE, tail[0]!, tail[1]!, tail[2]!) * 9 + axis, -dir * units)
        at[axis] = mod(at[axis]! + dir, SIDE)
      }
    }
  }

  strung(1, SOURCE / 2)
  strung(-1, SOURCE / 2)

  const far = SIDE / 2
  const m = makeMatter({
    mass: 1,
    charges: [
      ...Array.from({ length: SOURCE }, () => ({ charge: 1, moving: false, dock: [0, 0, 0] })),
      ...Array.from({ length: SOURCE }, () => ({ charge: -1, moving: false, dock: [far, far, far] })),
    ],
  })
  const { field } = relaxStart(e, s, m)
  const lineLinks = Array.from({ length: SIDE }, (_, x) => dockAt(SIDE, x, 0, 0) * 9)
  const staticLine = Float64Array.from(lineLinks, l => field[l]!)

  // the gauge map on every link
  const gauge = new Int32Array(g.huskLinks)

  for (let y = 0; y < g.huskDocks; y++) {
    const a = y % SIDE
    const b = Math.floor(y / SIDE) % SIDE
    const c = Math.floor(y / (SIDE * SIDE))

    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h]!
      const d = eta(mod(a + u[0]!, SIDE), mod(b + u[1]!, SIDE), mod(c + u[2]!, SIDE)) - eta(a, b, c)

      gauge[y * 9 + h] = h < 3 ? 2 * d : d
    }
  }

  const wrap = (v: number, h: number): number => {
    const n = h < 3 ? 4 * DEPTH : 2 * DEPTH

    return mod(v + n / 2, n) - n / 2
  }
  const start = copyShaped(s)
  const gs = copyShaped(s)

  for (let l = 0; l < g.huskLinks; l++) gs.angle[l] = wrap(gs.angle[l]! + gauge[l]!, l % 9)

  const scratch = makeShapedScratch(g, LEVELS)
  const scratch2 = makeShapedScratch(g, LEVELS)
  const f = makeFieldScratch(e)
  const flux = new Int32Array(g.huskLinks)
  const scale = e.q ** LEVELS
  const line: Int32Array[] = []
  const shadow: Float64Array[] = []
  const gaugedLine: Int32Array[] = []
  let gaussFailures = huskGaussFailures(e, s, m, true, flux)
  let gaugeLinkOff = 0
  let gaugeOtherOff = 0

  for (let t = 1; t <= BEATS; t++) {
    shapedBeat(e, s, scratch, OPTIONS)
    shapedBeat(e, gs, scratch2, OPTIONS)
    gaussFailures += huskGaussFailures(e, s, m, true, flux)
    fieldNumerators(e, s, OPTIONS, f)
    line.push(Int32Array.from(lineLinks, l => s.angle[l]!))
    shadow.push(Float64Array.from(lineLinks, l => s.angle[l]! + f.aShift[l]! / scale))
    gaugedLine.push(Int32Array.from(lineLinks, l => gs.angle[l]!))

    for (let l = 0; l < g.huskLinks; l++) if (gs.angle[l] !== wrap(s.angle[l]! + gauge[l]!, l % 9)) gaugeLinkOff++

    const a = shapedArrays(s)
    const b = shapedArrays(gs)

    for (let k = 1; k < a.length; k++) {
      const x = a[k]!
      const y = b[k]!

      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) gaugeOtherOff++
    }
  }

  for (let t = 0; t < BEATS; t++) shapedBeatBack(e, s, scratch, OPTIONS)

  const a = shapedArrays(s)
  const b = shapedArrays(start)
  const reversed = a.every((x, k) => x.every((v, i) => v === b[k]![i]))

  return { line, shadow, gaugedLine, staticLine, gaussFailures, reversed, gaugeLinkOff, gaugeOtherOff, seconds: (Date.now() - started) / 1000 }
}

const SETTING: PeierlsSetting = { side: SIDE, depth: DEPTH, order: ORDER, pack: PACK }
const startOf = (r: number): number[] => packetAt(SETTING, r)
const exactRun = (r: number, q: number, angles: Int32Array[], back = false): { move: number; normOk: boolean; backOk: boolean } => exactWalkRun(SETTING, r, q, angles, back)
const floatRun = (r: number, q: number, angle: (t: number, x: number) => number): number => floatWalkRun(SETTING, r, q, BEATS, angle)

export default experiment({
  id: 'gauge/peierls-test-charge',
  code: 'E-FRC-0252',
  title:
    "matter reads the light, pass: a test vibe whose hop carries the Peierls phase zeta_128^(-q A) of the shaped husk light's integer angle (D 32, side 24, exact over Z[zeta_1024], 512 beats) is pushed by a +4 source: the love moves away and the fear toward at every r = 4 .. 8, electric move 0.568, 0.435, 0.317, 0.205, 0.121 docks at 1.056, 1.124, 1.173, 1.108, 0.959 of the same walk in the static lattice Coulomb field; Gauss exact, the light and the walks reverse exactly, norms exact, and a gauge map moves the light's angles and the walker's phases exactly (0 entries off); the integer angle carries the field in its time mean, not in each beat; a test vibe does not source the light and hops on one husk line (stand-ins)",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const light = runLight()
    const moves = new Map<string, number>()
    let normOk = true
    let backOk = true

    for (const r of RS) {
      for (const q of [1, -1, 0]) {
        const back = (q === 1 && r === 4) || (q === -1 && r === 6)
        const x = exactRun(r, q, light.line, back)

        moves.set(`${q},${r}`, x.move)
        normOk &&= x.normOk
        backOk &&= x.backOk
      }
    }

    // gauge: the walkers reading the gauged angles end at zeta_128^(-2 q eta) psi
    let gaugeWalkOk = true
    const c = Array.from({ length: SIDE }, (_, x) => 2 * eta(x, 0, 0))

    for (const q of [1, -1]) {
      const a: PeierlsWalk = makeWalk({ order: ORDER, depth: DEPTH, sites: SIDE, start: startOf(6) })
      const b: PeierlsWalk = copyWalk(a)

      gaugeWalk(b, c, q)

      for (let t = 0; t < BEATS; t++) {
        walkBeat(a, light.line[t]!, q)
        walkBeat(b, light.gaugedLine[t]!, q)
      }

      gaugeWalk(a, c, q)
      gaugeWalkOk &&= sameWalk(b, a)
    }

    const g1 = light.gaussFailures === 0 && light.reversed && normOk && backOk
    const g2 = light.gaugeLinkOff === 0 && light.gaugeOtherOff === 0 && gaugeWalkOk
    const move = (q: number, r: number): number => moves.get(`${q},${r}`)!
    const electric = (r: number): number => (move(1, r) - move(-1, r)) / 2
    const blind = (r: number): number => (move(1, r) + move(-1, r)) / 2 - move(0, r)
    const staticRef = new Map<number, number>()
    const shadowRef = new Map<number, number>()

    for (const r of RS) {
      const st = (q: number): number => floatRun(r, q, (t, x) => (t + 1) * light.staticLine[x]!)
      const sh = (q: number): number => floatRun(r, q, (t, x) => light.shadow[t]![x]!)

      staticRef.set(r, (st(1) - st(-1)) / 2)
      shadowRef.set(r, (sh(1) - sh(-1)) / 2)
    }

    const ratio = (r: number): number => electric(r) / staticRef.get(r)!
    const g3 = RS.every(r => move(1, r) - move(0, r) > 0 && move(-1, r) - move(0, r) < 0 && ratio(r) >= 0.8 && ratio(r) <= 1.25)
    const status = !(g1 && g2) ? 'partial' : g3 ? 'pass' : 'fail'
    const mass = 1 / (2 * ((2 * Math.PI) / ORDER))
    const newton = (r: number): number => ((2 * Math.PI) / (4 * DEPTH)) * light.staticLine[r]! * BEATS ** 2 / (2 * mass)
    let lag = 0

    light.line.forEach((row, t) => row.forEach((v, x) => (lag = Math.max(lag, Math.abs(v - light.shadow[t]![x]!)))))

    const list = (f: (r: number) => number, d = 3): string => RS.map(r => f(r).toExponential(d)).join(', ')
    const metrics: Record<string, number> = {
      gate_P1: g1 ? 1 : 0,
      gate_P2: g2 ? 1 : 0,
      gate_P3: g3 ? 1 : 0,
      gaussFailures: light.gaussFailures,
      lightReversed: light.reversed ? 1 : 0,
      normExact: normOk ? 1 : 0,
      walkReversed: backOk ? 1 : 0,
      gaugeLinkOff: light.gaugeLinkOff,
      gaugeOtherOff: light.gaugeOtherOff,
      gaugeWalkExact: gaugeWalkOk ? 1 : 0,
      integerLagOnLine: lag,
      lightSeconds: light.seconds,
    }

    for (const r of RS) {
      metrics[`electric_r${r}`] = electric(r)
      metrics[`staticRef_r${r}`] = staticRef.get(r)!
      metrics[`shadowRef_r${r}`] = shadowRef.get(r)!
      metrics[`ratio_r${r}`] = ratio(r)
      metrics[`newton_r${r}`] = newton(r)
      metrics[`blind_r${r}`] = blind(r)
      metrics[`love_r${r}`] = move(1, r) - move(0, r)
      metrics[`fear_r${r}`] = move(-1, r) - move(0, r)
      metrics[`E_static_r${r}`] = light.staticLine[r]!
      metrics[`A_end_r${r}`] = light.line[BEATS - 1]![r]!
      metrics[`shadow_end_r${r}`] = light.shadow[BEATS - 1]![r]!
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a test vibe hopping on the husk line with the Peierls phase zeta_128^(-q A) of the shaped light's integer angle (D 32, side 24, 512 beats, a +4 source at r = 4 .. 8): electric move ${list(electric)} docks against the static-field reference ${list(r => staticRef.get(r)!)} (ratio ${RS.map(r => ratio(r).toFixed(3)).join(', ')}) and the shadow reference ${list(r => shadowRef.get(r)!)}; exact: Gauss ${light.gaussFailures} failures, light and walks reversed ${light.reversed && backOk}, norms ${normOk}, gauge ${g2}`,
      metrics,
      control: { neutralMoves: RS.reduce((a, r) => a + Math.abs(move(0, r)), 0) },
      notes: `L2 (P3), L1 (P1, P2). Gates P1 ${g1}, P2 ${g2}, P3 ${g3}. Per r = 4 .. 8: love move ${list(r => move(1, r) - move(0, r))}; fear move ${list(r => move(-1, r) - move(0, r))}; charge-blind ${list(blind)}; Newton q (2 pi / 128) E_static T^2 / (2 m) ${list(newton)}; r^2 times electric ${RS.map(r => (r * r * electric(r)).toFixed(3)).join(', ')}; E_static ${list(r => light.staticLine[r]!)}; integer angle at beat 512 ${RS.map(r => light.line[BEATS - 1]![r]).join(', ')} against the shadow ${RS.map(r => light.shadow[BEATS - 1]![r]!.toFixed(3)).join(', ')}; largest integer lag behind the shadow on the line ${lag.toFixed(3)}. Light ${light.seconds.toFixed(0)} s, total ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
