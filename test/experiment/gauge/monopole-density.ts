// THE COULOMB PHASE BY MONOPOLE COUNT (E-FRC-0283, OPEN-LGT-12, the route "the Coulomb phase by monopole count" in
// routes/quantum-relativity-light-computation.md, section "D · a massless photon"). The light is compact U(1)
// (E-FRC-0244): the seam's jumps are Dirac strings, so their ends are monopoles. Compact U(1) in four dimensions keeps
// a massless photon while monopoles are rare and heavy and loses it when they proliferate (Polyakov 1977, Guth 1980).
// The route asks for the monopole density of the trit rule's light at the vacuum's temperature, side 8 to 16 husk,
// exact counts, killed if the density is high enough to put the light in the confining phase.
//
// WHAT IS RUN.
//  The light is E-FRC-0207's trit rule read on the husk: angles A_l in their windows (axis -2D .. 2D - 1, diagonal
//  -D .. D - 1), the triangle field B_P = sum C(P, l) w_l A_l centered mod N_B = 4D, kappa = 2 / (2D + 1). The husk
//  integer rule equals the trit rule bit for bit (E-FRC-0207 A, rechecked here as I1d), so the counts are read on
//  the husk integers (code/measure/monopole-count).
//  (a) THE SEAM INTEGER of every husk triangle, n_P = (raw_P - B_P) / N_B, the branch the rule's own huskField takes:
//      E-FRC-0244's Villain integer n_t read on the trit rule's light.
//  (b) THE CUBES. Each husk dock is the low corner of a unit cube; each of its six square faces is the two husk
//      triangles cut by the face's rising diagonal ((1,1,0), (0,1,1) or (1,0,1)). A cube's charge is Q = sum of its
//      12 triangles' seam integers with outward signs; a monopole is a cube with Q != 0, counted |Q| times. The
//      density is sum |Q| over cubes per cube (one cube per dock) per time slice.
//  (c) THE VACUUM. The rule's linear beat has a harmonic vacuum (the beat-invariant Gaussian of every mode, point 1);
//      field configurations are drawn from it with Kronecker normal deviates (code/tool/weyl), rounded to integers
//      and put in their windows, and counted exactly. Sides 8, 12, 16 (32, 12 and 8 slices: 16,384, 20,736 and
//      32,768 cubes per point), D = 4, 5, 6, 8, 10, 12, 16.
//  (d) THE CONTROLS on the same counter: random flux (every angle spread over its window, infinite temperature);
//      the same Gaussian at strong coupling (every mode variance scaled so the square-face angle variance is 3 rad^2);
//      a smooth field (a transverse wave below the seam) under a large gauge rotation that winds the angles round
//      their windows (strings everywhere, no ends).
//  (e) READ, not gated: the coupling ladder (side 16, D = 4 and 16, every mode variance times 1, 2, 4, 8, 16, 32,
//      4 slices each), the same count on the unrounded real field and with every face cut by its falling diagonal
//      instead (the two differ by the charges of the flat closed surfaces the two splits of a square make), and the rule's own run from a vacuum-drawn angle
//      field with zero flux (a quench to half the vacuum's energy), 64 beats at side 8.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE VACUUM AND ITS HBAR. In y = W^(1/2) A, eta = W^(1/2) E the beat is y' = y + eta, eta' = eta - f A0 y', A0(k)
//    = W^(1/2) C^dag N C W^(1/2), f = p / q (the kick pays n_P p B_P / q), so 2 - 2 cos omega = f lambda and the
//    invariant Gaussian has <|y|^2> = (hbar / 2) / sin omega per mode (code/measure/husk-light-seam with s = 1). The
//    flux E_l is an integer and is the conjugate of the compact phase phi_l = 2 pi w_l A_l / N_B: the rule's beat is
//    the flow of H = (2 pi / N_B)(sum w E^2 / 2 + (p / 2q) sum n B^2) in (phi, E), so [A_l, w_l E_l] = i N_B / (2 pi)
//    on every link: hbar = N_B / (2 pi) = 2D / pi. This is compact U(1)'s own quantization (integer electric flux).
//    The vacuum is the zero point, T = 0: the notes fix no other temperature for the light's vacuum (step-back.md
//    names the vacuum's temperature as unread), so the hotter vacua are read by the coupling ladder, (e).
// 2. THE COUNT IS A TOPOLOGICAL INTEGER. Over a closed surface every link is counted twice with opposite signs, so
//    sum eps raw_P = 0 and Q = -(1 / N_B) sum eps B_P exactly; a wrap of one angle by its window (N_B / w_l) moves
//    seam integers on its triangles and no Q. Faces shared by two cubes enter with opposite signs, so sum_c Q_c = 0.
// 3. THE CRITERION, fixed before the gate run. Two readings, both from the same run.
//    (i) DENSITY, in units of the counter's own random-flux density rho_rand (C1a), since a cube of 12 triangles and
//        a D4 tetrahedron count differently: E-FRC-0173 read the same kind of count on this model's D4 bulk light,
//        whose classical thermal state is 4D Euclidean compact U(1), with 0.0085 per tetrahedron the most on the
//        Coulomb side (beta 0.68), 0.040 at the transition's edge (beta 0.60) and about 0.265 at strong coupling
//        (beta <= 0.34). So: COULOMB if rho <= 0.03 rho_rand, CONFINING if rho >= 0.15 rho_rand.
//    (ii) COUPLING. The 4D Villain model's transition is at beta_V near 0.643 on the hypercubic lattice (the Wilson
//        1.011 maps to 0.626 through I1 / I0), where the plaquette's spin-wave variance is 1 / (2 beta_V) = 0.778 rad^2
//        (3 transverse modes a site over 6 plaquettes). The husk's unit square (a cube face, two triangles) is the
//        hypercubic plaquette's shape; its vacuum flux variance sigma_sq^2 gives beta_eff = 1 / (2 sigma_sq^2).
//        COULOMB if beta_eff > 0.643.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/mp-probe1.ts: the trit light at side 8 builds in 0.9 s (20 husk triangles a
//    dock), the cubes in 0.05 s, every cube face triangle is a husk triangle consistently oriented; on one
//    random-flux configuration at side 8, D = 4: 0.727 monopoles per cube, net 0, 0 identity failures, 853 exact half
//    turns. lambda_max of A0 is 32 (as E-FRC-0282). The vacuum's analytic flux variances (rad^2), square face then
//    the triangles (n_P = 1 types, n_P = 2 types): D = 4: 0.887, 1.266, 0.856; D = 5: 0.685, 0.991, 0.659; D = 6:
//    0.580; D = 8: 0.464; D = 10: 0.397; D = 12: 0.353; D = 16: 0.296, 0.429, 0.279. So beta_eff is 0.564 at D = 4
//    (below 0.643) and 0.730 at D = 5, KNOWN BEFORE the coupling criterion was written: the criterion was taken from
//    the Villain value, not from these numbers, and D = 4 stays inside H1. One side-8 float sample at D = 4 gave a
//    mean triangle variance 6.50 against 6.61 analytic (integer-rounded 7.11). Timing: the side-16 modes 3.6 s, a
//    side-16 sample 0.07 s. tmp/mp-probe2.ts, tmp/mp-probe3.ts (instrument only): the smooth gauged control reads 0
//    monopoles with seam integers on 27 and 29 percent of the triangles (side 8, D = 4 and 16); a first planted pair,
//    a Dirac sheet on one triangle of each face solved by least squares, read no monopole, because one triangle of a
//    face is not a closed sheet on the husk's smaller cells (the two splits of a square, the tetrahedra), so it was
//    replaced by the line-integrated Dirac potentials, which read +1 at (1,3,3) and -1 at (5,3,3), 0 elsewhere, at
//    D = 4 and 16. tmp/mp-probe4.ts: the falling-split cubes build consistently oriented and read 0.730 per cube on
//    the probe-1 random-flux configuration, net 0. No monopole count on any vacuum sample was printed before the gates.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: (a) on every configuration counted, sum_c Q_c = 0 and Q = -(1 / N_B) sum eps B_P on every cube (0
//     failures); (b) gauge: shifting every third link of a vacuum sample by its window (side 16, D = 4 and 16) changes
//     0 cube charges; (c) a planted pair: the line-integrated Dirac potentials of a monopole at (1.5, 3.5, 3.2071) and
//     an antimonopole at (5.5, 3.5, 3.2071) joined by a string along x (side 8, D = 16; the string pierces each face
//     0.207 from every link), rounded, read exactly Q = +1 at cube (1,3,3), -1 at (5,3,3) and 0 on every other cube; (d) the
//     trit rule's columns equal the husk integer rule on every value for 20 beats from a vacuum-drawn start (side 8,
//     D = 4 and 16), and the cube charges read from the columns equal those from the husk integers; (e) the sampler:
//     the analytic triangle variances equal husk-light-seam's lightModes within 1e-9 relative (side 8, D = 4 and 16),
//     and the float samples' mean triangle variance is within 3 percent of the analytic (side 16, D = 4 and 16).
//  C1 THE COUNTER READS PROLIFERATION: (a) random flux, rho_rand >= 0.3 per cube on every side; (b) the Gaussian at
//     strong coupling (sigma_sq^2 = 3 rad^2, side 16, D = 16): rho >= 0.15 rho_rand.
//  C2 THE COUNTER READS ABSENCE: the smooth wave under the large gauge rotation (every side, D = 4 and 16): 0
//     monopoles, with seam integers on at least 5 percent of the triangles.
//  H1 THE ROUTE, the light is in the Coulomb phase: at every D = 4 .. 16 and every side, the vacuum's rho <= 0.03
//     rho_rand (its own side's), beta_eff > 0.643 at every D, and on side 16 rho does not rise from one D to the next.
//  P1 THE FALSIFIER (the route's kill): at D = 16 on side 16, the weakest coupling in the window, rho >= 0.15 rho_rand
//     or beta_eff <= 0.643: the light confines at every depth the window holds.
// READ: D_c, the least D from which every deeper D is Coulomb by (i) on every side, and the depth where beta_eff
//    crosses 0.643; the ladder's scale where rho crosses 0.03 and 0.15 rho_rand; the unrounded count; half turns and
//    string counts; the quench run's density per beat.
// VERDICT: fail if I1, C1 or C2 fails, or P1 holds; pass if I1, C1, C2 and H1 hold; partial otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. Exact: every count, given its configuration (integers, the identity of point 2
// checked on every cube). Sampled: the vacuum is the HARMONIC (spin-wave) vacuum of the rule's linear beat, drawn by
// a Kronecker stream, so the densities carry sampling spread, and the slices are independent draws of a state the
// linear beat keeps (not a run of the rule; the quench READ is the one run). The harmonic vacuum is the Gaussian
// reading of compact U(1): it holds the Dirac strings and monopoles a Gaussian field makes when wrapped, not the
// non-Gaussian weight of the compact vacuum near its transition, which raises the density there; so a Coulomb reading
// far from the criterion is robust and one near it is not. The criterion carries two comparisons from other lattices:
// E-FRC-0173's D4 ratios (a different cell) and the hypercubic Villain coupling (a different lattice; the husk's
// transition coupling is not computed here). Integer rounding of the angles adds about w^2 / 12 per link to every
// flux; the unrounded count is read beside it. Nothing here runs the quantum light, which does not exist in 3D.
//
// Depth L2: exact integer counts on configurations drawn from the harmonic vacuum of the rule's linear beat.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  copyHuskLight,
  emptyHuskLight,
  emptyTritState,
  huskLightBeat,
  makeTritLight,
  readHusk,
  tritLightBeat,
  writeHusk,
  type HuskLightState,
  type TritLight,
} from '@/code/rule/trit-column'
import {
  cubeCharges,
  dipoleAngles,
  huskCubes,
  integerAngles,
  realCubeMonopoles,
  sampleVacuum,
  vacuumBox,
  vacuumFluxVariances,
  type Cubes,
  type VacuumBox,
} from '@/code/measure/monopole-count'
import { huskLight } from '@/code/measure/husk-balance'
import {
  lightModes,
  registerVariances,
} from '@/code/measure/husk-light-seam'
import { makeWeyl } from '@/code/tool/weyl'

const SIDES = [8, 12, 16] as const
const SLICES: Record<number, number> = { 8: 32, 12: 12, 16: 8 }
const DEPTHS = [4, 5, 6, 8, 10, 12, 16] as const
const COULOMB = 0.03
const CONFINING = 0.15
const BETA_VILLAIN = 0.643
const STRONG_SQUARE = 3
const LADDER = [1, 2, 4, 8, 16, 32] as const
const RANDOM_SLICES = 4

const toRad = (units: number, depth: number): number =>
  units * ((2 * Math.PI) / (4 * depth)) ** 2

// the husk reading of a depth-2 trit light at depth D: only the husk structures, N_B = 4D and the windows are used
function huskAt(base: TritLight, depth: number): TritLight {
  return {
    ...base,
    q: 2 * depth + 1,
    nb: 4 * depth,
    window: Int32Array.from({ length: 9 }, (_, h) =>
      h < 3 ? 4 * depth : 2 * depth,
    ),
  }
}

type Tally = {
  monopoles: number
  cubes: number
  netFailures: number
  identityFailures: number
  halfTurns: number
  strings: number
  triangles: number
}

const emptyTally = (): Tally => ({
  monopoles: 0,
  cubes: 0,
  netFailures: 0,
  identityFailures: 0,
  halfTurns: 0,
  strings: 0,
  triangles: 0,
})

function count(
  tally: Tally,
  light: TritLight,
  cubes: Cubes,
  angle: Int32Array,
): Int32Array {
  const r = cubeCharges(light, cubes, angle)

  tally.monopoles += r.monopoles
  tally.cubes += r.charges.length
  tally.netFailures += r.net === 0 ? 0 : 1
  tally.identityFailures += r.identityFailures
  tally.halfTurns += r.halfTurns
  tally.strings += r.strings
  tally.triangles += light.bulk.huskTriangles

  return r.charges
}

const density = (t: Tally): number => t.monopoles / Math.max(1, t.cubes)

function randomFlux(light: TritLight, start: number): Int32Array {
  const stream = makeWeyl({ start })

  return Int32Array.from({ length: light.bulk.huskLinks }, (_, l) => {
    const n = light.window[l % 9] ?? 1

    return Math.floor(stream.next() * n) - n / 2
  })
}

// a transverse wave below the seam (line integrals of a = (amp sin(2 pi y / L), 0, 0)) under the gauge rotation
// chi = 2 round(G sin(2 pi (x + 2y + 3z) / L)) with G = 3D, which winds the angles round their windows
function smoothGauged(light: TritLight, amp: number): Int32Array {
  const { bulk } = light
  const side = bulk.side
  const depth = light.nb / 4
  const vectors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
  ]
  const kk = (2 * Math.PI) / side
  const chi = (x: number, y: number, z: number): number =>
    2 * Math.round(3 * depth * Math.sin(kk * (x + 2 * y + 3 * z)))
  const out = new Int32Array(bulk.huskLinks)

  for (let d = 0; d < bulk.huskDocks; d++) {
    const x = d % side
    const y = Math.floor(d / side) % side
    const z = Math.floor(d / (side * side))

    for (let h = 0; h < 9; h++) {
      const u = vectors[h]!
      const w = bulk.weight[h] ?? 1
      // the line integral of a along the link, x-component of the step times the mean of sin over the step
      const dy = u[1]!
      const integral =
        u[0] === 0
          ? 0
          : dy === 0
            ? amp * Math.sin(kk * y)
            : (amp * (Math.cos(kk * y) - Math.cos(kk * (y + dy)))) /
              (kk * dy)
      const gauge =
        chi(x + u[0]!, y + u[1]!, z + u[2]!) - chi(x, y, z)
      const n = light.window[h] ?? 1
      const v = Math.round(integral / w) + gauge / w

      out[d * 9 + h] = ((((v + n / 2) % n) + n) % n) - n / 2
    }
  }

  return out
}

// the trit rule against the husk integer rule from a vacuum-drawn angle field, and the cube charges from both
function tritCheck(
  depth: number,
  box: VacuumBox,
  beats: number,
  quenchBeats: number,
): { mismatches: number; chargeMismatches: number; quench: Tally } {
  const light = makeTritLight({ side: 8, depth })
  const cubes = huskCubes(light)
  const husk = emptyHuskLight(light)

  husk.angle.set(
    integerAngles(
      light,
      sampleVacuum(box, { depth, start: 777000 + depth }),
    ),
  )

  const trit = emptyTritState(light)

  writeHusk(light, trit, husk)

  const ref: HuskLightState = copyHuskLight(husk)

  let mismatches = 0
  let chargeMismatches = 0

  for (let t = 0; t < beats; t++) {
    huskLightBeat(light, ref)
    tritLightBeat(light, trit)

    const read = readHusk(light, trit)

    for (const key of [
      'angle',
      'potential',
      'counter',
      'lag',
      'spatial',
      'string',
    ] as const) {
      for (let i = 0; i < read[key].length; i++) {
        mismatches += read[key][i] === ref[key][i] ? 0 : 1
      }
    }

    const a = cubeCharges(light, cubes, read.angle).charges
    const b = cubeCharges(light, cubes, ref.angle).charges

    for (let c = 0; c < a.length; c++) {
      chargeMismatches += a[c] === b[c] ? 0 : 1
    }
  }

  // the quench: the husk integer rule continued, every beat counted from the first
  const quench = emptyTally()
  const run = copyHuskLight(husk)

  for (let t = 0; t < quenchBeats; t++) {
    huskLightBeat(light, run)
    count(quench, light, cubes, run.angle)
  }

  return { mismatches, chargeMismatches, quench }
}

export default experiment({
  id: 'gauge/monopole-density',
  code: 'E-FRC-0283',
  title:
    'the Coulomb phase by monopole count: the monopole density of the trit rule light in its harmonic vacuum, side 8 to 16 husk, D = 4 to 16, exact counts against random-flux, strong-coupling and smooth controls',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const bases = new Map<number, TritLight>()
    const cubesOf = new Map<number, Cubes>()
    const fallingOf = new Map<number, Cubes>()
    const boxes = new Map<number, VacuumBox>()

    for (const side of SIDES) {
      const base = makeTritLight({ side, depth: 2 })

      bases.set(side, base)
      cubesOf.set(side, huskCubes(base))
      fallingOf.set(side, huskCubes(base, 'falling'))
      boxes.set(side, vacuumBox(side))
    }

    const box16 = boxes.get(16)!
    const box8 = boxes.get(8)!

    // the analytic variances and beta_eff per D (side 16)
    const squareRad = new Map<number, number>()
    const triangleUnits = new Map<number, number>()

    for (const d of DEPTHS) {
      const v = vacuumFluxVariances(box16, { depth: d })

      squareRad.set(d, toRad(v.square, d))
      triangleUnits.set(
        d,
        v.triangle.reduce((a, b) => a + b, 0) / v.triangle.length,
      )
      metrics[`D${d}_squareVarRad2`] = toRad(v.square, d)
      metrics[`D${d}_betaEff`] = 1 / (2 * toRad(v.square, d))
      metrics[`D${d}_triangleVarRad2_n1`] = toRad(v.triangle[0]!, d)
      metrics[`D${d}_triangleVarRad2_n2`] = toRad(v.triangle[2]!, d)
    }

    // I1e: the analytic triangle variances against husk-light-seam's lightModes
    let modesDiff = 0
    const hl = huskLight()

    for (const d of [4, 16]) {
      const mine = vacuumFluxVariances(box8, { depth: d }).triangle
      const { modes, points } = lightModes(
        hl,
        { s: 1, f: 1 / (2 * d + 1), n: 4 * d },
        8,
        0,
      )
      const ref = registerVariances(modes, points).plaquette

      mine.forEach((x, t) => {
        modesDiff = Math.max(modesDiff, Math.abs(x - ref[t]!) / ref[t]!)
      })
    }

    // I1e: float sample variance against the analytic (side 16)
    let sampleVarWorst = 0

    for (const d of [4, 16]) {
      const light = huskAt(bases.get(16)!, d)

      let s2 = 0
      let n = 0

      for (let j = 0; j < SLICES[16]!; j++) {
        const a = sampleVacuum(box16, {
          depth: d,
          start: 1600000 + d * 1000 + j,
        })

        for (let p = 0; p < light.bulk.huskTriangles; p++) {
          let b = 0

          for (let i = 0; i < 3; i++) {
            const l = light.bulk.huskTriLinks[p * 3 + i] ?? 0

            b +=
              (light.bulk.huskTriSigns[p * 3 + i] ?? 0) *
              (light.bulk.weight[l % 9] ?? 0) *
              (a[l] ?? 0)
          }

          s2 += b * b
          n++
        }
      }

      const ratio = s2 / n / triangleUnits.get(d)!

      metrics[`D${d}_sampleOverAnalyticTriangleVar`] = ratio
      sampleVarWorst = Math.max(sampleVarWorst, Math.abs(ratio - 1))
    }

    // the vacuum counts, and the real-field counts beside them
    const vacuum = new Map<string, Tally>()

    let netFailures = 0
    let identityFailures = 0

    for (const side of SIDES) {
      for (const d of DEPTHS) {
        const light = huskAt(bases.get(side)!, d)
        const cubes = cubesOf.get(side)!
        const t = emptyTally()
        const falling = emptyTally()

        let real = 0

        for (let j = 0; j < SLICES[side]!; j++) {
          const a = sampleVacuum(boxes.get(side)!, {
            depth: d,
            start: side * 100000 + d * 1000 + j,
          })

          const ints = integerAngles(light, a)

          count(t, light, cubes, ints)
          count(falling, light, fallingOf.get(side)!, ints)
          real += realCubeMonopoles(light, cubes, a)
        }

        vacuum.set(`${side}:${d}`, t)
        netFailures += t.netFailures
        identityFailures += t.identityFailures
        metrics[`side${side}_D${d}_density`] = density(t)
        metrics[`side${side}_D${d}_monopoles`] = t.monopoles
        metrics[`side${side}_D${d}_cubes`] = t.cubes
        metrics[`side${side}_D${d}_stringFraction`] =
          t.strings / t.triangles
        metrics[`side${side}_D${d}_halfTurns`] = t.halfTurns
        metrics[`side${side}_D${d}_realFieldDensity`] = real / t.cubes
        metrics[`side${side}_D${d}_fallingSplitDensity`] = density(falling)
        netFailures += falling.netFailures
        identityFailures += falling.identityFailures
      }
    }

    // C1a random flux, per side
    const rhoRand = new Map<number, number>()

    for (const side of SIDES) {
      const t = emptyTally()

      for (const d of [4, 16]) {
        const light = huskAt(bases.get(side)!, d)

        for (let j = 0; j < RANDOM_SLICES; j++) {
          count(
            t,
            light,
            cubesOf.get(side)!,
            randomFlux(light, 9100000 + side * 1000 + d * 10 + j),
          )
        }
      }

      rhoRand.set(side, density(t))
      netFailures += t.netFailures
      identityFailures += t.identityFailures
      metrics[`side${side}_randomFluxDensity`] = density(t)
    }

    const c1a = SIDES.every(s => (rhoRand.get(s) ?? 0) >= 0.3)

    // C1b strong coupling Gaussian, side 16, D = 16
    const strongScale = STRONG_SQUARE / squareRad.get(16)!
    const strong = emptyTally()

    for (let j = 0; j < SLICES[16]!; j++) {
      const light = huskAt(bases.get(16)!, 16)

      count(
        strong,
        light,
        cubesOf.get(16)!,
        integerAngles(
          light,
          sampleVacuum(box16, {
            depth: 16,
            scale: strongScale,
            start: 8800000 + j,
          }),
        ),
      )
    }

    netFailures += strong.netFailures
    identityFailures += strong.identityFailures

    const c1b = density(strong) >= CONFINING * rhoRand.get(16)!

    metrics.strongScale = strongScale
    metrics.strongDensity = density(strong)

    // C2 smooth wave under a large gauge rotation
    let c2 = true

    for (const side of SIDES) {
      for (const d of [4, 16]) {
        const light = huskAt(bases.get(side)!, d)
        const t = emptyTally()

        count(t, light, cubesOf.get(side)!, smoothGauged(light, d))
        netFailures += t.netFailures
        identityFailures += t.identityFailures
        metrics[`side${side}_D${d}_smoothMonopoles`] = t.monopoles
        metrics[`side${side}_D${d}_smoothStringFraction`] =
          t.strings / t.triangles
        c2 = c2 && t.monopoles === 0 && t.strings >= 0.05 * t.triangles
      }
    }

    // I1b gauge invariance
    let gaugeChanged = 0

    for (const d of [4, 16]) {
      const light = huskAt(bases.get(16)!, d)
      const a = integerAngles(
        light,
        sampleVacuum(box16, { depth: d, start: 5500000 + d }),
      )
      const b = Int32Array.from(a, (v, l) =>
        l % 3 === 0 ? v + (light.window[l % 9] ?? 0) : v,
      )
      const qa = cubeCharges(light, cubesOf.get(16)!, a).charges
      const qb = cubeCharges(light, cubesOf.get(16)!, b).charges

      for (let c = 0; c < qa.length; c++) {
        gaugeChanged += qa[c] === qb[c] ? 0 : 1
      }
    }

    // I1c a planted pair: a monopole at (1.5, 3.5, 3.2071) and an antimonopole at (5.5, 3.5, 3.2071), side 8, D = 16
    const pairLight = huskAt(bases.get(8)!, 16)
    const pairCubes = cubesOf.get(8)!
    const cubeAt = (x: number, y: number, z: number): number =>
      x + 8 * y + 64 * z
    const pairCharges = cubeCharges(
      pairLight,
      pairCubes,
      integerAngles(
        pairLight,
        dipoleAngles(pairLight, [1.5, 3.5, 3.2071], [5.5, 3.5, 3.2071], 400),
      ),
    )
    const plus = cubeAt(1, 3, 3)
    const minus = cubeAt(5, 3, 3)

    let pairOff = 0

    pairCharges.charges.forEach((q, c) => {
      const want = c === plus ? 1 : c === minus ? -1 : 0

      pairOff += q === want ? 0 : 1
    })

    // I1d the trit rule's columns against the husk integers
    const trit4 = tritCheck(4, box8, 20, 64)
    const trit16 = tritCheck(16, box8, 20, 64)

    // READ the coupling ladder, side 16
    const ladder = new Map<string, number>()

    for (const d of [4, 16]) {
      const light = huskAt(bases.get(16)!, d)

      for (const s of LADDER) {
        const t = emptyTally()

        for (let j = 0; j < 4; j++) {
          count(
            t,
            light,
            cubesOf.get(16)!,
            integerAngles(
              light,
              sampleVacuum(box16, {
                depth: d,
                scale: s,
                start: 4400000 + d * 1000 + s * 10 + j,
              }),
            ),
          )
        }

        netFailures += t.netFailures
        identityFailures += t.identityFailures
        ladder.set(`${d}:${s}`, density(t))
        metrics[`ladder_D${d}_scale${s}_density`] = density(t)
      }
    }

    for (const [d, r] of [
      [4, trit4],
      [16, trit16],
    ] as const) {
      netFailures += r.quench.netFailures
      identityFailures += r.quench.identityFailures
      metrics[`quench_D${d}_densityPerBeat`] = density(r.quench)
    }

    // gates
    const i1 =
      netFailures === 0 &&
      identityFailures === 0 &&
      gaugeChanged === 0 &&
      pairOff === 0 &&
      trit4.mismatches === 0 &&
      trit16.mismatches === 0 &&
      trit4.chargeMismatches === 0 &&
      trit16.chargeMismatches === 0 &&
      modesDiff <= 1e-9 &&
      sampleVarWorst <= 0.03
    const c1 = c1a && c1b
    const relative = (side: number, d: number): number =>
      density(vacuum.get(`${side}:${d}`)!) / rhoRand.get(side)!
    const coulombDensity = SIDES.every(s =>
      DEPTHS.every(d => relative(s, d) <= COULOMB),
    )
    const coulombCoupling = DEPTHS.every(
      d => 1 / (2 * squareRad.get(d)!) > BETA_VILLAIN,
    )
    const monotone = DEPTHS.slice(1).every(
      (d, i) =>
        density(vacuum.get(`16:${d}`)!) <=
        density(vacuum.get(`16:${DEPTHS[i]!}`)!),
    )
    const h1 = coulombDensity && coulombCoupling && monotone
    const p1 =
      relative(16, 16) >= CONFINING ||
      1 / (2 * squareRad.get(16)!) <= BETA_VILLAIN
    const status: 'pass' | 'fail' | 'partial' =
      !i1 || !c1 || !c2 || p1 ? 'fail' : h1 ? 'pass' : 'partial'

    // reads
    const dc =
      DEPTHS.find((d, i) =>
        DEPTHS.slice(i).every(e =>
          SIDES.every(s => relative(s, e) <= COULOMB),
        ),
      ) ?? NaN
    const betaAt = (d: number): number => 1 / (2 * squareRad.get(d)!)

    let betaCross = NaN

    for (let i = 0; i + 1 < DEPTHS.length; i++) {
      const a = DEPTHS[i]!
      const b = DEPTHS[i + 1]!

      if (betaAt(a) <= BETA_VILLAIN && betaAt(b) > BETA_VILLAIN) {
        betaCross =
          a + ((BETA_VILLAIN - betaAt(a)) * (b - a)) / (betaAt(b) - betaAt(a))
      }
    }

    for (const d of [4, 16]) {
      for (const [tag, level] of [
        ['Coulomb', COULOMB],
        ['Confining', CONFINING],
      ] as const) {
        const target = level * rhoRand.get(16)!
        const first = LADDER.find(s => (ladder.get(`${d}:${s}`) ?? 0) >= target)

        metrics[`ladder_D${d}_firstScaleAt${tag}`] = first ?? NaN
      }
    }

    Object.assign(metrics, {
      gateI1: i1 ? 1 : 0,
      gateC1: c1 ? 1 : 0,
      gateC2: c2 ? 1 : 0,
      gateH1: h1 ? 1 : 0,
      falsifierP1: p1 ? 1 : 0,
      c1aRandomFlux: c1a ? 1 : 0,
      c1bStrongCoupling: c1b ? 1 : 0,
      h1Density: coulombDensity ? 1 : 0,
      h1Coupling: coulombCoupling ? 1 : 0,
      h1Monotone: monotone ? 1 : 0,
      netFailures,
      identityFailures,
      gaugeChanged,
      pairOff,
      pairPlus: pairCharges.charges[plus] ?? NaN,
      pairMinus: pairCharges.charges[minus] ?? NaN,
      pairMonopoles: pairCharges.monopoles,
      trit4Mismatches: trit4.mismatches,
      trit16Mismatches: trit16.mismatches,
      trit4ChargeMismatches: trit4.chargeMismatches,
      trit16ChargeMismatches: trit16.chargeMismatches,
      modesRelativeDiff: modesDiff,
      sampleVarWorst,
      depthCoulombFrom: dc,
      depthBetaCross: betaCross,
      lambdaMax: box16.lambdaMax,
    })

    const fmt = (x: number): string => x.toPrecision(3)
    const row = (side: number): string =>
      DEPTHS.map(d => fmt(density(vacuum.get(`${side}:${d}`)!))).join(', ')

    return verdict({
      status,
      claim: `vacuum monopoles per cube per slice at D = ${DEPTHS.join(', ')}: side 8 ${row(8)}; side 12 ${row(12)}; side 16 ${row(16)}; random flux ${SIDES.map(s => fmt(rhoRand.get(s)!)).join(', ')}, so the Coulomb line 0.03 rho_rand is ${fmt(COULOMB * rhoRand.get(16)!)} on side 16; beta_eff ${DEPTHS.map(d => fmt(betaAt(d))).join(', ')} against 0.643; strong coupling ${fmt(density(strong))}, smooth gauged 0 expected (${c2 ? 'held' : 'FAILED'}); I1 ${i1 ? 'held' : 'FAILED'}, C1 ${c1 ? 'held' : 'FAILED'}, H1 ${h1 ? 'held' : 'failed'}, P1 ${p1 ? 'FIRED' : 'did not fire'}`,
      metrics,
      control: {
        randomFluxSide16: rhoRand.get(16)!,
        strongCouplingSide16D16: density(strong),
        smoothGaugedMonopoles: SIDES.reduce(
          (a, s) =>
            a +
            (metrics[`side${s}_D4_smoothMonopoles`] ?? 0) +
            (metrics[`side${s}_D16_smoothMonopoles`] ?? 0),
          0,
        ),
      },
      notes:
        'L2. Exact integer counts (Q = -(1/N_B) sum eps B_P checked on every cube) on configurations drawn from the harmonic vacuum of the trit rule light by a Kronecker stream (no seeds), hbar = N_B / (2 pi) from the integer flux being the compact phase conjugate. The vacuum is the Gaussian reading of compact U(1); the criterion borrows E-FRC-0173 D4 density ratios and the hypercubic Villain coupling.',
    })
  },
})
