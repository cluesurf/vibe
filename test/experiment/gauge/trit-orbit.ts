// The Lorentz force and the first atom on trits (E-FRC-0216): the kinetic trit charge of E-FRC-0215 in a
// uniform magnetic field, and a love and a fear released on a circular orbit about each other, in the
// three-level light of E-FRC-0214 (D = 32, cyclic potential).
//
// The rule, code/rule/trit-kinetic: a crossing along axis i turns every other momentum by the shadow angle's
// circulation around the two squares beside the crossed link, K_j <- K_j + sigma e Phi^_ij. In a uniform field
// of circulation beta per (x, y) square (the Landau gauge, code/measure/trit-kinetic-light) a crossing along x
// adds 2 q^3 beta to K_y and one along y takes it from K_x, so with crossings at the rates K / M the momentum
// turns at omega = 2 q^3 beta / M and the charge circles at radius K / (2 q^3 beta). THE INERTIA IS A STAND-IN
// (the fine position and momentum registers of E-FRC-0215), and so is everything built on it here, the atom
// included: a classical Kepler orbit of two point charges, not quantum hydrogen.
//
// Derived before any run:
// - the rule's cyclotron frequency is 2 q^3 beta / M; the field is static (A uniform in time, B = C W A uniform,
//   no curl of B), the potential U climbs n p B / q a beat forever, which the cyclic potential makes harmless
// - THE LANDAU GATE AS POSED IS NOT REGISTERED: a classical charge circles at a frequency and has no levels.
//   The fear walk's exact Landau spacings sit 0.77 to 0.91 of the continuum 2 q B because of the walk's band
//   (E-FRC-0182, Onsager to 0.09 percent), and this charge's band is Galilean (velocity K / M), so it circles at
//   the continuum frequency by construction; its frequency is compared with the walk's spacing in the notes
// - E-FRC-0215 measured that each crossing creates the transverse energy of the unit it drops and gives the
//   charge a net FORWARD self-impulse. An orbit with a few dozen crossings a period gains that energy each
//   crossing; the hop energy is about 16 r times the Coulomb binding at separation r at any depth, so the
//   prediction for the atom is that it does NOT stay bound unless the charges are so heavy that a period is
//   millions of beats
//
// DISCLOSED: probes ran before these gates (tmp/force-probe1, 3.log): a heavy love at beta = 8 turned its
// momentum once in about 1,900 beats against 2 pi / omega = 1,885, its kinetic energy rising 2.4-fold in
// 2,000 beats; the atom at r = 4, v = 0.01 (M = 78 q^3) came apart within 200 beats, the light's energy rising
// 17,000-fold. The gates are the caller's and are kept.
//
// Gates, fixed before the first run of this file:
// B  Lorentz: a heavy love (side 16, beta = 8, K = 48 q^3, M = K / 0.01, its fear pinned at (8, 8, 8)) over
//    2,000 beats: the unwrapped angle of its momentum in the (x, y) plane advances at a rate within 3 percent
//    of 2 q^3 beta / M, in the sense e v x B gives; Gauss exact every beat; the last 50 beats run back exactly
// A  the atom: a love and a fear 4 docks apart (side 16), both moving, started mid-dock with opposite momenta
//    for a circular orbit under the static force the start holds (v = 0.01): over two predicted periods the
//    separation stays within 2 to 8 docks, and the separation vector turns at a rate within 10 percent of the
//    circular prediction; Gauss exact; the last 50 beats run back exactly
// Reported: the charge's kinetic energy over the cyclotron run, its drift along z, a heavier atom (M 10 times,
//   one predicted period), the light's energy in each run.
// Status: pass if both pass, partial if B passes, fail otherwise.
//
// Depth L2 (B), and a stand-in (A).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addStringPath, relaxStart, runKinetic, setLandauAngles, staticForce, type KineticRun } from '@/code/measure/trit-kinetic-light'
import { makeMatter } from '@/code/rule/trit-kinetic'
import { huskGeometry, makeHuskEngine } from '@/code/rule/trit-husk'
import { emptyShaped } from '@/code/rule/trit-husk-shaped'

const LEVELS = 3
const DEPTH = 32
const SIDE = 16
const OPTIONS = { levels: LEVELS, cyclic: true }
const Q = 2 * DEPTH + 1

// the least-squares slope of y on t
function rate(t: number[], y: number[]): number {
  const n = t.length
  const mt = t.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0

  t.forEach((v, i) => {
    num += (v - mt) * ((y[i] ?? 0) - my)
    den += (v - mt) ** 2
  })

  return num / den
}

// the unwrapped angle of a sequence of 2D vectors
function unwrappedAngles(v: [number, number][]): number[] {
  const out: number[] = []
  let last = 0

  for (const [x, y] of v) {
    const a = Math.atan2(y, x)

    if (out.length === 0) {
      last = a
    } else {
      last += ((a - last + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
    }

    out.push(last)
  }

  return out
}

function sectionB(): { omega: number; predicted: number; run: KineticRun; kineticRatio: number; zDrift: number } {
  const beta = 8
  const k = 48 * Q ** 3
  const mass = Math.round(k / 0.01)
  const half = Math.floor(mass / 2)
  const matter = makeMatter({ mass, charges: [{ charge: 1, moving: true, dock: [0, 0, 0], offset: [half, half, half], momentum: [k, 0, 0] }, { charge: -1, moving: false, dock: [8, 8, 8] }] })
  const run = runKinetic({
    side: SIDE,
    depth: DEPTH,
    options: OPTIONS,
    matter,
    setup: (s, g) => {
      addStringPath(s, g, [0, 0, 0], [8, 8, 8], 1)
      setLandauAngles(s, g, DEPTH, beta)

      return undefined
    },
    beats: 2000,
    every: 100,
    reverse: 50,
  })
  const angles = unwrappedAngles(run.momenta.map(m => [m[0]?.[0] ?? 0, m[0]?.[1] ?? 0]))
  const t = angles.map((_, i) => i)

  return {
    omega: rate(t, angles),
    predicted: (2 * Q ** 3 * beta) / mass,
    run,
    kineticRatio: (run.kinetic[run.kinetic.length - 1] ?? 0) / (run.kinetic[0] ?? 1),
    zDrift: (run.positions[run.positions.length - 1]?.[0]?.[2] ?? 0) - (run.positions[0]?.[0]?.[2] ?? 0),
  }
}

function sectionA(scale: number, periods: number): { turn: number; predicted: number; minSeparation: number; maxSeparation: number; run: KineticRun; period: number } {
  const r0 = 4
  const g = huskGeometry(SIDE)
  const e = makeHuskEngine(g, DEPTH)
  const probe = makeMatter({ mass: 1, charges: [{ charge: 1, moving: true, dock: [0, 0, 0] }, { charge: -1, moving: true, dock: [r0, 0, 0] }] })
  const s = emptyShaped(g, LEVELS)

  addStringPath(s, g, [0, 0, 0], [r0, 0, 0], 1)

  const { field } = relaxStart(e, s, probe)
  const force = staticForce(e, probe, 0, LEVELS, field)[0] ?? 0
  const v = 0.01
  const mass = Math.round(((force * r0) / (2 * v * v)) * scale)
  const k = Math.round(Math.sqrt((force * mass * r0) / 2))
  const half = Math.floor(mass / 2)
  const period = (2 * Math.PI * (r0 / 2) * mass) / k
  const beats = Math.round(periods * period)
  const matter = makeMatter({
    mass,
    charges: [
      { charge: 1, moving: true, dock: [0, 0, 0], offset: [half, half, half], momentum: [0, -k, 0] },
      { charge: -1, moving: true, dock: [r0, 0, 0], offset: [half, half, half], momentum: [0, k, 0] },
    ],
  })
  const run = runKinetic({ side: SIDE, depth: DEPTH, options: OPTIONS, matter, setup: (st, geometry) => (addStringPath(st, geometry, [0, 0, 0], [r0, 0, 0], 1), undefined), beats, every: Math.max(1, Math.round(beats / 20)), reverse: 50 })
  const separations = run.positions.map(p => [0, 1, 2].map(i => (p[1]?.[i] ?? 0) - (p[0]?.[i] ?? 0)))
  const angles = unwrappedAngles(separations.map(d => [d[0] ?? 0, d[1] ?? 0]))
  const lengths = separations.map(d => Math.hypot(d[0] ?? 0, d[1] ?? 0, d[2] ?? 0))

  return {
    turn: rate(angles.map((_, i) => i), angles),
    predicted: k / mass / (r0 / 2),
    minSeparation: Math.min(...lengths),
    maxSeparation: Math.max(...lengths),
    run,
    period,
  }
}

export default experiment({
  id: 'gauge/trit-orbit',
  code: 'E-FRC-0216',
  title:
    'the Lorentz force and the first atom on trits: a heavy trit charge with a stand-in inertia circles in a uniform husk magnetic field at the rule\'s cyclotron frequency, the magnetic turn taken one crossing at a time from the swept plaquette, but a love and a fear set on a circular orbit about each other do not stay bound: every crossing creates more energy than the orbit\'s binding',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const b = sectionB()
    const atom = sectionA(1, 2)
    const heavy = sectionA(10, 1)
    const metrics: Record<string, number> = {
      b_omega: b.omega,
      b_predicted: b.predicted,
      b_ratio: b.omega / b.predicted,
      b_kineticRatio: b.kineticRatio,
      b_zDrift: b.zDrift,
      b_crossings: b.run.crossings,
      b_gauss: b.run.gaussFailures,
      b_back: b.run.back,
      b_lightStart: b.run.light[0] ?? 0,
      b_lightEnd: b.run.light[b.run.light.length - 1] ?? 0,
    }

    for (const [name, a] of [['atom', atom], ['heavy', heavy]] as const) {
      metrics[`${name}_turn`] = a.turn
      metrics[`${name}_predicted`] = a.predicted
      metrics[`${name}_ratio`] = a.turn / a.predicted
      metrics[`${name}_minSeparation`] = a.minSeparation
      metrics[`${name}_maxSeparation`] = a.maxSeparation
      metrics[`${name}_period`] = a.period
      metrics[`${name}_crossings`] = a.run.crossings
      metrics[`${name}_gauss`] = a.run.gaussFailures
      metrics[`${name}_back`] = a.run.back
      metrics[`${name}_lightStart`] = a.run.light[0] ?? 0
      metrics[`${name}_lightEnd`] = a.run.light[a.run.light.length - 1] ?? 0
      metrics[`${name}_kineticStart`] = a.run.kinetic[0] ?? 0
      metrics[`${name}_kineticEnd`] = a.run.kinetic[a.run.kinetic.length - 1] ?? 0
    }

    const gates = {
      B: Math.abs(b.omega / b.predicted - 1) <= 0.03 && b.run.gaussFailures === 0 && b.run.back === 0,
      A: atom.minSeparation >= 2 && atom.maxSeparation <= 8 && Math.abs(atom.turn / atom.predicted - 1) <= 0.1 && atom.run.gaussFailures === 0 && atom.run.back === 0,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = gates.A && gates.B ? 'pass' : gates.B ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a heavy trit charge in a uniform husk magnetic field (beta = 8, D = 32) turns its momentum at ${metrics.b_ratio?.toFixed(4)} of the rule's 2 q^3 beta / M over 2,000 beats, reversibly and with Gauss exact, while its kinetic energy grows ${b.kineticRatio.toFixed(2)}-fold; a love and a fear on a circular orbit 4 docks apart reach separations ${atom.minSeparation.toFixed(1)} to ${atom.maxSeparation.toFixed(1)} over two predicted periods (${atom.run.crossings} crossings, the light's energy ${((metrics.atom_lightEnd ?? 0) / (metrics.atom_lightStart ?? 1)).toFixed(0)} times its start), and ten times heavier ${heavy.minSeparation.toFixed(1)} to ${heavy.maxSeparation.toFixed(1)} over one`,
      metrics,
      control: { cyclotronPredicted: b.predicted },
      notes:
        'L2 (B) and STAND-IN (A: the inertia registers and the classical orbit). Three-level light, D = 32, cyclic potential, relaxed starts from reals (construction). FIRST RUN 2026-09-26 (tmp/frc0216.log, 151.5 s), PARTIAL: B passes, A fails as predicted, no gate moved. B, THE LORENTZ FORCE: the heavy love\'s momentum turns at 0.9955 of the rule\'s 2 q^3 beta / M (0.003318 against 0.003333 a beat) over 2,000 beats and 30 crossings, in the sense e v x B gives, with Gauss exact and the last 50 beats reversing to 0 mismatches. The turn is taken one crossing at a time from the plaquette the crossing sweeps, so the magnetic force appears from the same threshold rule as the electric one. But energy is not kept: the kinetic energy grows 2.17-fold in 2,000 beats and the charge drifts 0.56 docks along z, the created hop energy and forward self-impulse of E-FRC-0215 acting on the orbit. THE LANDAU GATE WAS NOT REGISTERED (disclosed in the header): this charge has a frequency, not levels, and its band is Galilean, so it circles at the continuum frequency (0.9955), where the fear walk\'s exact spacings sit at 0.77 to 0.91 of the continuum from its own band (E-FRC-0182). Landau levels need the walk\'s band and its amplitudes, which a classical trit charge does not carry. A, THE ATOM, FAILS: set on a circular orbit 4 docks apart (v = 0.01, predicted period 1,257 beats), the love and fear come apart: separation 4.0 to 1,172.6 docks over two periods, 2,248 crossings, the separation turning at 0.037 of the orbital rate, the light\'s energy 9,965 times its start and the kinetic energy 3,500 times. Ten times heavier (period 3,974): 4.0 to 228.9 docks over one period, 310 crossings, light 1,140 times its start. THE REASON, measured in E-FRC-0215: each crossing creates about 0.021 of transverse light energy at D = 32, against a binding of 1 / (24 D r) = 0.0003 at r = 4 (the ratio is about 16 r at any depth), and it gives the charge a forward self-impulse of about 0.6 q^3, comparable to the orbit\'s whole momentum (0.8 q^3 here). A classical point charge that moves by whole-unit crossings cannot hold an orbit on this light. What the pieces need for an atom: a charge whose crossings are spread so the transverse energy of each is small against the binding (a charge spread over many docks, which is what the quantum wave of the stand-in hydrogen is, a = 150 to 890 docks at the depth-set coupling, E-FRC-0211), or quantum matter whose amplitudes, not whole units, carry the current.',
    })
  },
})
