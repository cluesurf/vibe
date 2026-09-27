// A force on matter (E-FRC-0215): a trit charge on the husk that reads the light and is pushed by it, with
// the three-level light of E-FRC-0214 (D = 32, cyclic potential).
//
// The rule, code/rule/trit-kinetic. The charge's crossings are the husk current of code/rule/trit-hop's trit
// crossings (E-FRC-0210); WHEN a crossing is taken is decided by a STAND-IN FOR INERTIA the knit has not
// produced: a fine position X_i in 0 .. M - 1 and an integer momentum K_i per axis. Each beat: X_i <- X_i + K_i,
// and each multiple of M carried out of X_i is a crossing (a threshold, no rounding), which pays the husk
// string (Gauss exact) and turns the other momenta by the plaquette circulation it sweeps (Lorentz, tested in
// E-FRC-0216); the light beat; K_i <- K_i + e (E^ on the dock's two axis links), E^ = q^3 E~ the shadow flux
// as an integer sum of the light's counters. A leapfrog in integers, run backward beat by beat.
//
// Derived before any run:
// - in a uniform field the kick is the same every beat, so x(t) = a0 t (t - 1) / 2 exactly for a test charge,
//   a0 = 4 q^3 e0 / M (two links, each q^3 2 e0); the charge's own field enters only through its hops
// - at rest the charge reads the light's shadow flux, whose mean is the static field the start holds: the
//   lattice Coulomb field of the charges PLUS the string's harmonic part (a string between charges winds net
//   flux d / V around the torus; no potential can remove it, Ewald's surface term)
// - THE HOP'S ENERGY. A crossing drops one unit of flux on one link; the longitudinal part is the charge's
//   new static field at once (Gauss), and the rest, the transverse part, is free light of energy (pi / D)(1/2)
//   (1/2 - 2 (G(0) - G(e1))) (code/measure/trit-hop-light's Green's function, E-FRC-0211's per-hop number).
//   Nothing in the rule makes the charge pay it, so each crossing CREATES that energy in the light: energy is
//   not conserved, and the claim below measures by how much. And the light's own energy is conserved only in
//   its shadow (E-FRC-0204: no bounded integer state is an exactly linear photon), so no coupling to it can
//   conserve energy exactly. The caller's gate asked for exact conservation; it is kept, and predicted to fail
// - the ratio of that hop energy to the Coulomb energy 1 / (24 D r) at separation r is about 16 r at any depth
//   (both scale as 1 / D): a hopping point charge pays or creates far more per hop than its binding
//
// DISCLOSED: probes ran before these gates (tmp/force-probe1..3.log): at D = 32 the uniform-field charge moved
// 3.996 docks in 300 beats against a0 t (t - 1) / 2 = 3.992, and reversed exactly; a pinned pair's read force
// averaged 552.76 against a static 552.95 (sd 13.8); the first relaxed start solved the unweighted problem and
// left a curl that grew B (fixed: the solve is C W C^T u = C W t); a pair falling from rest at r = 6 fell,
// passed through each other and flew apart with energy rising 300-fold; one charge started on a dock boundary
// crosses at once, so starts sit mid-dock. The H gate was written before its probe (tmp/force-probe4.log) was
// read.
//
// Gates, fixed before the first run of this file:
// A  uniform field: a heavy love (a0 = 8.9e-5) from rest mid-dock in e0 = +1 and -1 along x (side 16, D = 32,
//    300 beats; its fear pinned at (8, 8, 8)): the fit of x(t) - x(0) against t (t - 1) / 2 gives a within 1
//    percent of +a0 and -a0
// C  reading at rest: a pinned pair 6 docks apart (side 16, D = 32): the love's read force averaged over 400
//    beats within 1 percent of the static field's (Coulomb plus harmonic)
// F  the fall: the pair released from rest mid-dock (M from a = 1.5e-5 at the static force): over the first
//    100 beats (before any crossing) the love's acceleration within 5 percent of the static prediction
// G  husk Gauss exact (0 failures) on every beat of every run
// R  every run's last beats run back to 0 mismatches (trits, counters and the matter's registers)
// H  the hop's energy: a heavy free love at v = 0.02 (side 16, D = 32 and 16, 500 beats): the light's energy
//    rises per crossing by the transverse hop energy above within 15 percent
// E  energy (the caller's gate): light plus kinetic energy at the end of the uniform run within 1 percent of
//    the kinetic energy gained, of its start
// Reported: the fall past its first crossings (energy, separation), the net self-impulse per hop, the
//   harmonic part of the static force.
// Status: pass if every gate passes, partial if A, C, G and R pass, fail otherwise.
//
// Depth L2: a stand-in inertia on the model's own light; the force law is put in (e E and e v x B) and the
// test is whether the integer light delivers it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { addStringPath, addUniformField, relaxStart, runKinetic, staticForce, uniformFlux, type KineticRun } from '@/code/measure/trit-kinetic-light'
import { fieldNumerators, kineticBeat, makeFieldScratch, makeMatter } from '@/code/rule/trit-kinetic'
import { huskGeometry, makeHuskEngine } from '@/code/rule/trit-husk'
import { emptyShaped, makeShapedScratch } from '@/code/rule/trit-husk-shaped'
import { dockAt } from '@/code/measure/trit-hop-light'

const LEVELS = 3
const DEPTH = 32
const SIDE = 16
const OPTIONS = { levels: LEVELS, cyclic: true }

// fit y = a s over the points (s, y), least squares through the origin
function slope(s: number[], y: number[]): number {
  let num = 0
  let den = 0

  s.forEach((v, i) => {
    num += v * (y[i] ?? 0)
    den += v * v
  })

  return num / den
}

function sectionA(e0: number): { a: number; a0: number; run: KineticRun } {
  const q = 2 * DEPTH + 1
  const mass = Math.round((4 * q ** 3) / 8.9e-5)
  const half = Math.floor(mass / 2)
  const matter = makeMatter({ mass, charges: [{ charge: 1, moving: true, dock: [0, 0, 0], offset: [half, half, half] }, { charge: -1, moving: false, dock: [8, 8, 8] }] })
  const run = runKinetic({
    side: SIDE,
    depth: DEPTH,
    options: OPTIONS,
    matter,
    setup: (s, g) => {
      addStringPath(s, g, [0, 0, 0], [8, 8, 8], 1)
      addUniformField(s, g, e0, 0)

      return uniformFlux(g, e0, 0)
    },
    beats: 300,
    every: 300,
    reverse: 50,
  })
  const ts = run.positions.map((_, t) => (t * (t - 1)) / 2)
  const xs = run.positions.map(p => (p[0]?.[0] ?? 0) - (run.positions[0]?.[0]?.[0] ?? 0))

  return { a: slope(ts, xs), a0: (4 * q ** 3 * e0) / mass, run }
}

function sectionC(): { read: number; sd: number; staticTotal: number; coulomb: number; gauss: number } {
  const g = huskGeometry(SIDE)
  const e = makeHuskEngine(g, DEPTH)
  const m = makeMatter({ mass: 1e12, charges: [{ charge: 1, moving: false, dock: [0, 0, 0] }, { charge: -1, moving: false, dock: [6, 0, 0] }] })
  const s = emptyShaped(g, LEVELS)

  addStringPath(s, g, [0, 0, 0], [6, 0, 0], 1)

  const { field } = relaxStart(e, s, m)
  const scratch = makeShapedScratch(g, LEVELS)
  const f = makeFieldScratch(e)
  const here = dockAt(SIDE, 0, 0, 0) * 9
  const back = dockAt(SIDE, -1, 0, 0) * 9
  let sum = 0
  let sumsq = 0
  const n = 400

  for (let t = 0; t < n; t++) {
    kineticBeat(e, s, m, OPTIONS, scratch, f)
    fieldNumerators(e, s, OPTIONS, f)

    const x = (f.eHat[here] ?? 0) + (f.eHat[back] ?? 0)

    sum += x
    sumsq += x * x
  }

  const read = sum / n

  return { read, sd: Math.sqrt(sumsq / n - read * read), staticTotal: staticForce(e, m, 0, LEVELS, field)[0] ?? 0, coulomb: staticForce(e, m, 0, LEVELS)[0] ?? 0, gauss: 0 }
}

function sectionF(): { a: number; predicted: number; run: KineticRun } {
  const g = huskGeometry(SIDE)
  const e = makeHuskEngine(g, DEPTH)
  const probe = makeMatter({ mass: 1, charges: [{ charge: 1, moving: true, dock: [0, 0, 0] }, { charge: -1, moving: true, dock: [6, 0, 0] }] })
  const s = emptyShaped(g, LEVELS)

  addStringPath(s, g, [0, 0, 0], [6, 0, 0], 1)

  const { field } = relaxStart(e, s, probe)
  const force = staticForce(e, probe, 0, LEVELS, field)[0] ?? 0
  const mass = Math.round(force / 1.5e-5)
  const half = Math.floor(mass / 2)
  const matter = makeMatter({
    mass,
    charges: [
      { charge: 1, moving: true, dock: [0, 0, 0], offset: [half, half, half] },
      { charge: -1, moving: true, dock: [6, 0, 0], offset: [half, half, half] },
    ],
  })
  const run = runKinetic({ side: SIDE, depth: DEPTH, options: OPTIONS, matter, setup: (st, geometry) => (addStringPath(st, geometry, [0, 0, 0], [6, 0, 0], 1), undefined), beats: 600, every: 100, reverse: 50 })
  const early = run.positions.slice(0, 101)
  const ts = early.map((_, t) => (t * (t - 1)) / 2)
  const xs = early.map(p => (p[0]?.[0] ?? 0) - (early[0]?.[0]?.[0] ?? 0))

  return { a: slope(ts, xs), predicted: force / mass, run }
}

function sectionH(depth: number): { perHop: number; predicted: number; hops: number; selfImpulsePerHop: number; run: KineticRun } {
  const q = 2 * depth + 1
  const mass = 1e4 * q ** 3
  const k = Math.round(0.02 * mass)
  const half = Math.floor(mass / 2)
  const matter = makeMatter({ mass, charges: [{ charge: 1, moving: true, dock: [0, 0, 0], offset: [half, half, half], momentum: [k, 0, 0] }, { charge: -1, moving: false, dock: [8, 8, 8] }] })
  const run = runKinetic({ side: SIDE, depth, options: OPTIONS, matter, setup: (s, g) => (addStringPath(s, g, [0, 0, 0], [8, 8, 8], 1), undefined), beats: 500, every: 500, reverse: 20 })
  const rise = (run.light[run.light.length - 1] ?? 0) - (run.light[0] ?? 0)
  const predicted = (Math.PI / depth) * 0.5 * (0.5 - 2 * huskGreenDifference(SIDE, [1, 0, 0]))
  const dk = (run.momenta[run.momenta.length - 1]?.[0]?.[0] ?? 0) - k

  return { perHop: rise / Math.max(1, run.crossings), predicted, hops: run.crossings, selfImpulsePerHop: dk / Math.max(1, run.crossings) / q ** 3, run }
}

export default experiment({
  id: 'gauge/trit-force',
  code: 'E-FRC-0215',
  title:
    'a force on matter: a trit charge with a stand-in inertia crosses when its position counter passes a dock, reads the shaped light\'s shadow flux as an integer and is pushed by it: it accelerates exactly in a uniform husk field and reads the static Coulomb field to a tenth of a percent at rest, reversibly and with Gauss exact, but each crossing creates the transverse energy of the unit it drops (about 16 r times the Coulomb binding at any depth), so energy is not conserved and a released pair runs away',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const plus = sectionA(1)
    const minus = sectionA(-1)
    const c = sectionC()
    const f = sectionF()
    const h32 = sectionH(32)
    const h16 = sectionH(16)
    const runs = [plus.run, minus.run, f.run, h32.run, h16.run]
    const metrics: Record<string, number> = {
      a_plus: plus.a,
      a0_plus: plus.a0,
      a_plusRatio: plus.a / plus.a0,
      a_minus: minus.a,
      a0_minus: minus.a0,
      a_minusRatio: minus.a / minus.a0,
      c_read: c.read,
      c_sd: c.sd,
      c_static: c.staticTotal,
      c_coulombOnly: c.coulomb,
      c_harmonicShare: 1 - c.coulomb / c.staticTotal,
      c_ratio: c.read / c.staticTotal,
      f_a: f.a,
      f_predicted: f.predicted,
      f_ratio: f.a / f.predicted,
      f_crossings: f.run.crossings,
      f_separationEnd: Math.hypot(...[0, 1, 2].map(i => (f.run.positions[f.run.positions.length - 1]?.[1]?.[i] ?? 0) - (f.run.positions[f.run.positions.length - 1]?.[0]?.[i] ?? 0))),
      f_lightStart: f.run.light[0] ?? 0,
      f_lightEnd: f.run.light[f.run.light.length - 1] ?? 0,
      f_kineticEnd: f.run.kinetic[f.run.kinetic.length - 1] ?? 0,
      h32_perHop: h32.perHop,
      h32_predicted: h32.predicted,
      h32_ratio: h32.perHop / h32.predicted,
      h32_hops: h32.hops,
      h32_selfImpulsePerHopInQ3: h32.selfImpulsePerHop,
      h16_perHop: h16.perHop,
      h16_predicted: h16.predicted,
      h16_ratio: h16.perHop / h16.predicted,
      h16_hops: h16.hops,
      h16_selfImpulsePerHopInQ3: h16.selfImpulsePerHop,
    }

    // energy of the uniform run: light plus kinetic, start and end
    const energyStart = (plus.run.light[0] ?? 0) + (plus.run.kinetic[0] ?? 0)
    const energyEnd = (plus.run.light[plus.run.light.length - 1] ?? 0) + (plus.run.kinetic[plus.run.kinetic.length - 1] ?? 0)
    const gained = (plus.run.kinetic[plus.run.kinetic.length - 1] ?? 0) - (plus.run.kinetic[0] ?? 0)

    metrics.e_totalChange = energyEnd - energyStart
    metrics.e_kineticGained = gained
    metrics.e_ratio = (energyEnd - energyStart) / gained
    metrics.e_hops = plus.run.crossings

    runs.forEach((r, i) => {
      metrics[`run${i}_gauss`] = r.gaussFailures
      metrics[`run${i}_back`] = r.back
    })

    const gates = {
      A: Math.abs(plus.a / plus.a0 - 1) <= 0.01 && Math.abs(minus.a / minus.a0 - 1) <= 0.01,
      C: Math.abs(c.read / c.staticTotal - 1) <= 0.01,
      F: Math.abs(f.a / f.predicted - 1) <= 0.05,
      G: runs.every(r => r.gaussFailures === 0),
      R: runs.every(r => r.back === 0),
      H: Math.abs(h32.perHop / h32.predicted - 1) <= 0.15 && Math.abs(h16.perHop / h16.predicted - 1) <= 0.15,
      E: Math.abs(energyEnd - energyStart) <= 0.01 * gained,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.A && gates.C && gates.G && gates.R ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `at D = 32 a heavy trit charge accelerates at ${metrics.a_plusRatio?.toFixed(4)} and ${metrics.a_minusRatio?.toFixed(4)} of 4 q^3 e0 / M in e0 = +1 and -1, reads a partner 6 docks away at ${metrics.c_ratio?.toFixed(4)} of the static field in the mean (sd ${(c.sd / c.staticTotal * 100).toFixed(1)} percent a beat; ${(metrics.c_harmonicShare! * 100).toFixed(0)} percent of it the string's harmonic part), and a released pair starts falling at ${metrics.f_ratio?.toFixed(3)} of the static rate; Gauss is exact and every run reverses; each crossing raises the light's energy by ${metrics.h32_perHop?.toFixed(4)} and ${metrics.h16_perHop?.toFixed(4)} at D = 32 and 16, ${metrics.h32_ratio?.toFixed(2)} and ${metrics.h16_ratio?.toFixed(2)} of the transverse energy of the unit it drops, so the uniform run ends ${metrics.e_totalChange?.toFixed(3)} above its start against ${gained.toFixed(3)} gained, and the falling pair ends ${metrics.f_separationEnd?.toFixed(1)} docks apart with the light ${(metrics.f_lightEnd! / metrics.f_lightStart!).toFixed(0)} times its start`,
      metrics,
      control: { coulombOnlyForce: c.coulomb, staticForce: c.staticTotal },
      notes:
        'L2 with a STAND-IN inertia (the X, K registers); the light is the three-level shaped light of E-FRC-0214 at D = 32 with the cyclic potential; starts are relaxed from reals (construction, disclosed). FIRST RUN 2026-09-26 (tmp/frc0215.log, 47.0 s), PARTIAL: every gate but E passes, no gate moved. A: the heavy love accelerates at 1.0012 and 1.0018 of 4 q^3 e0 / M for e0 = +1 and -1 over 300 beats (4 crossings each). C: a pinned partner 6 docks away is read at 0.9997 of the static field in the mean over 400 beats, per-beat sd 2.5 percent; 49 percent of that force is the string\'s harmonic part (Coulomb alone 284.8 of 552.9), the torus\'s Ewald surface term, which the light cannot remove because no potential changes a harmonic flux. F: the released pair starts falling at 1.0002 of the static rate over its first 100 beats. G, R: Gauss exact on every beat of all five runs, and every run reverses to 0 mismatches. H, THE MECHANISM: a heavy free love at v = 0.02 raises the light\'s energy by 0.0198 per crossing at D = 32 and 0.0431 at D = 16, 0.96 and 1.05 of the transverse energy of one dropped unit, (pi / D)(1/2)(1/2 - 2 (G(0) - G(e1))) = 0.0206 and 0.0412, a prediction written before its run was read. E FAILS, as the header predicted: the uniform run ends 0.092 above its start against 0.395 of kinetic energy gained (0.23), which is its four crossings\' created energy (4 x 0.0198 = 0.079) plus the half dock of work the field has not yet paid (the charge reads E at its dock, and the field pays the work at the crossing). WHY THIS CANNOT BE FIXED BY BOOKKEEPING: the rule could make the charge pay each crossing\'s transverse energy, but that is a fixed cost per crossing, a friction of (pi / D) 0.21 per dock, about 16 r^2 times the Coulomb force 1 / (24 D r^2) at separation r (and 16 r times the Coulomb energy 1 / (24 D r)), at every depth (both scale as 1 / D); and the light itself conserves energy only in its shadow (E-FRC-0204). ALSO MEASURED: the net self-impulse of a crossing is FORWARD, +0.61 q^3 at D = 32 and +0.77 q^3 at D = 16 (K units): the charge\'s own field pushes it on after each crossing, an anti-drag, the lattice form of the Abraham-Lorentz runaway. A light charge runs away: the falling pair (M = 36.9 million, v up to about 0.03) passed through itself after 32 crossings and ended 22.6 docks apart, the light\'s energy 117 times its start. So the force on matter works where the charge is heavy and slow (A, C, F), and the point charge\'s crossings are what break energy: the atom needs a charge whose crossings do not each drop a whole unit on one link.',
    })
  },
})
