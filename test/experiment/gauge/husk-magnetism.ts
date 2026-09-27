// Magnetism on the husk. The leapfrog U(1) sector (code/rule/photon-links) runs in the D4 bulk, and every
// field here is read on its projection onto the husk, the cubic horosphere of the {3,4,3,4} cusp
// (code/measure/photon-husk, E-FRC-0168): a husk link carries the column sum of the bulk links, and the
// husk's magnetic field is the circulation of those projected angles round a husk square
// (code/measure/photon-magnetism).
//
// Gates, all fixed before the run:
// 1. Ampere and Biot-Savart. The empty bulk box side 12 (husk 12^3), N = 8192, K = 80. A steady current of
//    I = 8 flux units per beat round a square loop of side 4 in the husk's xy plane (the bulk path alternating
//    the roots (1,0,0,1) and (1,0,0,-1) along x, (0,1,0,1) and (0,1,0,-1) along y, at depth 0 and 1), added
//    to the loop's links every beat: what a ring of vibes of charge 8, each hopping one link per beat, does
//    to the flux. 3,000 beats, the husk field averaged over beats 600 to 3,000, at the 4 husk squares round the
//    loop's center and the 4 above it at heights z = 1 to 5. Against the lattice Biot-Savart law, the linear
//    static angles kappa curl^T curl A = -I J solved on the bulk and projected the same way:
//    1a the measured field is within 10 percent of the law at z = 0, 1, 2 and 3
//    1b it falls monotonically with z from 0 to 5
//    The continuum Biot-Savart ratio for a square loop, B(z) / B(0), is reported beside it, not gated (a
//    periodic box of side 12 around a loop of side 4)
// 2. The Lorentz force, a negative fixed in advance. A vibe carries no Z_N phase in this rule: its hop is
//    paid in E^2 and never reads an angle, so B can reach a vibe only by first changing E. On the bulk box
//    side 8 with vibes hopping, a uniform husk field (angles (N / 8) x on the sheet links casting husk y, so
//    B_z = N / 8 on every husk xy square, periodic) is added to the same start. With the kick off (K = 0),
//    so that nothing turns B into E, the gate: vibes, flux and demons are the same, dock for dock and link for
//    link, on every one of 100 beats: no sideways deflection and no cyclotron motion. With K = 80 the runs
//    are reported, where they differ through E. Where the hop does feel the angles is the walker's phase,
//    part 3
// 3. Aharonov-Bohm, with the fear walk (code/rule/fear-walk, E-QTM-0103) as the charge. N = 8190, divisible
//    by 3, so a flux of N / 3 is a phase omega exactly and the walk stays in Eisenstein integers. On the
//    bulk box side 12, a thin flux tube along the husk's z axis through the square at x = 0, y = 0 (and its
//    return at x = 6), made by angles of N / 3 on the sheet link of the husk y-links crossing x = 1 to 6 at
//    y = 0 (a Dirac cut). The walk goes round husk loops in the plane z = 0, with the swap phase at cell 0
//    and free streaming elsewhere, each step weighted by omega^(3 q A / N):
//    3a the husk field is 0 on every husk square that has a loop link on its edge (B = 0 on the path)
//    3b round a loop of 12 cells enclosing the tube, the chances on every cell after 13 beats equal, exactly,
//       those of the same loop with a phase plate omega on one step and no flux, and differ from those with
//       no plate (a fringe shift)
//    3c a charge 2 walker equals the plate omega^2, exactly
//    3d a loop of 12 cells beside the tube, which crosses the cut twice, equals no plate, exactly
//    3e a bulk frame change by multiples of N / 3 in every dock changes the link phases the walker picks up,
//       and leaves every chance exactly as it was
// 4. Monopoles against beta. The bulk box side 6 (husk 6^3), N = 8192, K = 80, from ordered starts (angles
//    0) at target beta 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2 and disordered ones (angles over all of Z_N) at
//    0.4 and 0.2, 800 beats settling and 1,200 measured, counted every 20 beats. The bulk counts monopoles in
//    the D4 tetrahedra, the husk in its cubes. With beta measured from the flux:
//    4a bulk: under 0.01 monopoles per tetrahedron at every point with beta at least 0.65 (the Coulomb side of
//       the transition near 0.55 to 0.60), and over 0.05 at every point with beta at most 0.45
//    4b the same ordering on the husk: every point with beta at most 0.45 has more monopoles per cube than
//       every point with beta at least 0.65
//
// Depth L2: lattice magnetostatics, the Peierls phase and DeGrand-Toussaint monopoles are textbook. What is
// measured is that the beats and the projection carry them.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  changePhotonFrame,
  copyPhotonState,
  emptyPhotonState,
  fillHashedDemons,
  magneticSum,
  makePhotonRule,
  pathLinks,
  photonBeatInPlace,
  photonLatticeD4,
  photonLink,
  setHashedAngles,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import { HUSK_VECTORS, makeHusk, projectAngles, projectLinks, type Husk } from '@/code/measure/photon-husk'
import { bulkMonopoles, d4Tetrahedra, huskMonopoles, huskSquare, loopWalk, magnetostaticAngles } from '@/code/measure/photon-magnetism'
import { FEAR_COIN, walkChances, type WalkState } from '@/code/rule/fear-walk'

const N = 8192
const AB_N = 8190
const K = 80
const CURRENT = 8
const LOOP = 4
const GOLDEN = (Math.sqrt(5) - 1) / 2
const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const modulo = (x: number, m: number): number => ((x % m) + m) % m

const rootOf = (lattice: PhotonLattice, v: number[]): number => lattice.vectors.findIndex(r => r.every((x, i) => x === v[i]))

// the bulk path of `steps` husk steps along husk axis u (0 or 1), sign s, alternating depth up and down
function huskAxisPath(lattice: PhotonLattice, u: number, s: number, steps: number, startUp: boolean): number[] {
  return Array.from({ length: steps }, (_, i) => {
    const v = [0, 0, 0, 0]

    v[u] = s
    v[3] = (i % 2 === 0) === startUp ? 1 : -1

    return rootOf(lattice, v)
  })
}

// the husk dock at husk coordinates
const huskDock = (husk: Husk, x: number, y: number, z: number): number =>
  modulo(x, husk.side) + husk.side * modulo(y, husk.side) + husk.side * husk.side * modulo(z, husk.side)

function biotSavart(): Record<string, number> & { ok: number } {
  const lattice = photonLatticeD4({ side: 12 })
  const husk = makeHusk(lattice)
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false })
  // the loop from bulk dock 0 (husk (0,0,0), depth 0): +x, +y, -x, -y, 4 steps each, depth 0, 1, 0, 1, 0
  const dirs = [
    ...huskAxisPath(lattice, 0, 1, LOOP, true),
    ...huskAxisPath(lattice, 1, 1, LOOP, true),
    ...huskAxisPath(lattice, 0, -1, LOOP, true),
    ...huskAxisPath(lattice, 1, -1, LOOP, true),
  ]
  const links = pathLinks(lattice, 0, dirs)
  const current = new Float64Array(lattice.links)

  for (const [l, s] of links) {
    current[l] = (current[l] ?? 0) + s * CURRENT
  }

  const predicted = projectLinks(husk, magnetostaticAngles(rule, current))
  // the 4 husk xy squares round the loop's center (2, 2) at height z: corners at (1..2, 1..2)
  const squares = (z: number): number[] => [
    huskDock(husk, 1, 1, z),
    huskDock(husk, 2, 1, z),
    huskDock(husk, 1, 2, z),
    huskDock(husk, 2, 2, z),
  ]
  const heights = [0, 1, 2, 3, 4, 5]
  const law = heights.map(z => mean(squares(z).map(y => huskSquare(husk, predicted, y, 0, 1))))
  const s = emptyPhotonState(rule)
  const sums = heights.map(() => 0)
  const settle = 600
  const beats = 3000

  for (let t = 0; t < beats; t++) {
    photonBeatInPlace(rule, s, t)

    for (const [l, sign] of links) {
      s.flux[l] = (s.flux[l] ?? 0) - sign * CURRENT
    }

    if (t >= settle) {
      const angle = projectAngles(husk, s.angle, N)

      heights.forEach((z, i) => {
        sums[i] = (sums[i] ?? 0) + mean(squares(z).map(y => huskSquare(husk, angle, y, 0, 1, N)))
      })
    }
  }

  const measured = sums.map(v => v / (beats - settle))
  const ratios = measured.map((b, i) => b / (law[i] ?? 1))
  const continuum = (z: number): number => {
    const a = LOOP

    return 1 / ((z * z + (a * a) / 4) * Math.sqrt(z * z + (a * a) / 2))
  }
  const monotone = measured.every((b, i) => i === 0 || Math.abs(b) < Math.abs(measured[i - 1] ?? 0))
  const ok = [0, 1, 2, 3].every(i => Math.abs((ratios[i] ?? 0) - 1) < 0.1) && monotone
  const metrics: Record<string, number> = {}

  heights.forEach((z, i) => {
    metrics[`biotSavartZ${z}Measured`] = measured[i] ?? 0
    metrics[`biotSavartZ${z}Law`] = law[i] ?? 0
    metrics[`biotSavartZ${z}Ratio`] = ratios[i] ?? 0
    metrics[`biotSavartZ${z}ShapeMeasured`] = (measured[i] ?? 0) / (measured[0] ?? 1)
    metrics[`biotSavartZ${z}ShapeContinuum`] = continuum(z) / continuum(0)
  })

  return { ...metrics, ok: ok ? 1 : 0 }
}

function lorentz(): Record<string, number> & { ok: number } {
  const lattice = photonLatticeD4({ side: 8 })
  const husk = makeHusk(lattice)
  const off = lorentzRun(lattice, husk, 0)
  const on = lorentzRun(lattice, husk, K)

  return {
    ok: off.vibes === 0 && off.flux === 0 && off.demons === 0 && off.huskB !== 0 ? 1 : 0,
    lorentzHuskField: off.huskB,
    lorentzKickOffVibeDifferences: off.vibes,
    lorentzKickOffFluxDifferences: off.flux,
    lorentzKickOffDemonDifferences: off.demons,
    lorentzKickOnVibeDifferences: on.vibes,
    lorentzKickOnFluxDifferences: on.flux,
  }
}

function lorentzRun(lattice: PhotonLattice, husk: Husk, k: number): { vibes: number; flux: number; demons: number; huskB: number } {
  const rule = makePhotonRule({ lattice, n: N, k, capacity: 4096 })
  const start = (): PhotonState => {
    const s = emptyPhotonState(rule)

    for (let x = 0; x < lattice.cells; x++) {
      const u = ((x + 1) * GOLDEN * 1.37) % 1
      const d = Math.floor(((x + 2) * GOLDEN * 1.37 * 24) % 24)
      const y = lattice.neighbour[x * lattice.degree + d] ?? 0

      if (u < 0.2 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
        const [l, sign] = photonLink(lattice, x, d)

        s.vibe[x] = 1
        s.vibe[y] = -1
        s.flux[l] = (s.flux[l] ?? 0) + sign
      }
    }

    addHashedCurl(rule, s, 90, 5.3)
    fillHashedDemons(s, rule.capacity, 2.9)

    return s
  }
  const plain = start()
  const field = start()
  const b0 = N / 8
  const f = lattice.firsts.length

  // A = b0 x1 on the sheet link casting husk y at each column: the husk y-link carries b0 x1, B_z = b0
  for (let l = 0; l < lattice.links; l++) {
    if (husk.sheet[l] === 1 && husk.shadow[l % f] === 1) {
      const x1 = (husk.column[Math.floor(l / f)] ?? 0) % husk.side

      field.angle[l] = modulo((field.angle[l] ?? 0) + b0 * x1, N)
    }
  }

  const huskB = huskSquare(husk, projectAngles(husk, field.angle, N), huskDock(husk, 2, 3, 1), 0, 1, N)

  let vibes = 0
  let flux = 0
  let demons = 0

  for (let t = 0; t < 100; t++) {
    photonBeatInPlace(rule, plain, t)
    photonBeatInPlace(rule, field, t)

    for (let x = 0; x < lattice.cells; x++) {
      vibes += plain.vibe[x] !== field.vibe[x] ? 1 : 0
    }

    for (let l = 0; l < lattice.links; l++) {
      flux += plain.flux[l] !== field.flux[l] ? 1 : 0
      demons += plain.demon[l] !== field.demon[l] ? 1 : 0
    }
  }

  return { vibes, flux, demons, huskB }
}

// the steps of a husk loop in the plane z = 0 from corner (x0, y0), w wide and h high, counterclockwise,
// as (husk link, orientation)
function huskLoop(husk: Husk, x0: number, y0: number, w: number, h: number): [number, number][] {
  const hv = HUSK_VECTORS.length
  const out: [number, number][] = []
  const step = (x: number, y: number, u: number, s: number): [number, number] =>
    s > 0 ? [huskDock(husk, x, y, 0) * hv + u, 1] : [huskDock(husk, u === 0 ? x - 1 : x, u === 1 ? y - 1 : y, 0) * hv + u, -1]

  for (let i = 0; i < w; i++) out.push(step(x0 + i, y0, 0, 1))
  for (let i = 0; i < h; i++) out.push(step(x0 + w, y0 + i, 1, 1))
  for (let i = 0; i < w; i++) out.push(step(x0 + w - i, y0 + h, 0, -1))
  for (let i = 0; i < h; i++) out.push(step(x0, y0 + h - i, 1, -1))

  return out
}

function aharonovBohm(): Record<string, number> & { ok: number } {
  const lattice = photonLatticeD4({ side: 12 })
  const husk = makeHusk(lattice)
  const flux = AB_N / 3
  const f = lattice.firsts.length
  const tube: PhotonState = emptyPhotonState(makePhotonRule({ lattice, n: AB_N, k: K, capacity: 0, hop: false }))

  // the Dirac cut: the sheet bulk link of each husk y-link at y = 0, x = 1..6, every z
  for (let l = 0; l < lattice.links; l++) {
    if (husk.sheet[l] !== 1 || husk.shadow[l % f] !== 1) {
      continue
    }

    const column = husk.column[Math.floor(l / f)] ?? 0
    const x = column % husk.side
    const y = Math.floor(column / husk.side) % husk.side

    if (y === 0 && x >= 1 && x <= 6) {
      tube.angle[l] = flux
    }
  }

  const angle = projectAngles(husk, tube.angle, AB_N)
  const around = huskLoop(husk, -1, -1, 3, 3)
  const beside = huskLoop(husk, 2, -1, 3, 3)
  const beats = around.length + 1
  const chances = (w: WalkState): bigint[] => walkChances(w)
  const walk = (steps: [number, number][], field: ArrayLike<number>, charge: number): bigint[] =>
    chances(loopWalk({ steps, angle: field, n: AB_N, charge, splitter: FEAR_COIN, beats }))
  const plate = (k: number): bigint[] => {
    const field = new Int32Array(angle.length)
    const [l, s] = around[5] ?? [0, 1]

    field[l] = modulo(s * k * flux, AB_N)

    return walk(around, field, 1)
  }
  const same = (a: bigint[], b: bigint[]): boolean => a.length === b.length && a.every((v, i) => v === b[i])
  const withTube = walk(around, angle, 1)
  const charge2 = walk(around, angle, 2)
  const besideTube = walk(beside, angle, 1)
  const chi = Array.from({ length: lattice.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * 3) * flux)
  const gauged = projectAngles(husk, changePhotonFrame(makePhotonRule({ lattice, n: AB_N, k: K, capacity: 0, hop: false }), copyPhotonState(tube), chi).angle, AB_N)
  const withGauge = walk(around, gauged, 1)
  const phasesChanged = around.filter(([l]) => angle[l] !== gauged[l]).length

  // B = 0 on the path: every husk square with a loop link on its edge, in all three planes
  const hv = HUSK_VECTORS.length
  const touched = new Set<number>()

  for (const [l] of [...around, ...beside]) {
    const y = Math.floor(l / hv)
    const u = l % hv

    for (const v of [0, 1, 2].filter(a => a !== u)) {
      touched.add(y * 9 + u * 3 + v)
      touched.add((husk.lattice.neighbour[y * husk.lattice.degree + 2 * v + 1] ?? 0) * 9 + u * 3 + v)
    }
  }

  let pathField = 0

  for (const key of touched) {
    const y = Math.floor(key / 9)
    const u = Math.floor((key % 9) / 3)
    const v = key % 3

    pathField += Math.abs(huskSquare(husk, angle, y, u, v, AB_N))
  }

  const tubeField = huskSquare(husk, angle, huskDock(husk, 0, 0, 0), 0, 1, AB_N)
  const fringe = (c: bigint[]): number => Number(((c[1] ?? 0n) * 1000000n) / c.reduce((a, b) => a + b, 0n)) / 1e6
  const p0 = plate(0)
  const p1 = plate(1)
  const p2 = plate(2)
  const ok = pathField === 0 && same(withTube, p1) && !same(withTube, p0) && same(charge2, p2) && same(besideTube, p0) && same(withGauge, withTube) && phasesChanged > 0

  return {
    ok: ok ? 1 : 0,
    abTubeField: tubeField,
    abFieldOnPath: pathField,
    abTubeEqualsPlateOmega: same(withTube, p1) ? 1 : 0,
    abTubeDiffersFromNoPlate: same(withTube, p0) ? 0 : 1,
    abChargeTwoEqualsPlateOmega2: same(charge2, p2) ? 1 : 0,
    abBesideEqualsNoPlate: same(besideTube, p0) ? 1 : 0,
    abGaugeUnchanged: same(withGauge, withTube) ? 1 : 0,
    abPhasesChangedByGauge: phasesChanged,
    abFringeNoFlux: fringe(p0),
    abFringeFlux: fringe(withTube),
    abFringeChargeTwo: fringe(charge2),
  }
}

type Point = { beta: number; cos: number; bulk: number; husk: number; start: string }

function monopoles(): Record<string, number> & { ok: number } {
  const lattice = photonLatticeD4({ side: 6 })
  const husk = makeHusk(lattice)
  const rule: PhotonRule = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false })
  const tetrahedra = d4Tetrahedra(lattice)
  const runs: [number, 'ordered' | 'disordered'][] = [
    [1.0, 'ordered'],
    [0.8, 'ordered'],
    [0.7, 'ordered'],
    [0.6, 'ordered'],
    [0.5, 'ordered'],
    [0.4, 'ordered'],
    [0.3, 'ordered'],
    [0.2, 'ordered'],
    [0.4, 'disordered'],
    [0.2, 'disordered'],
  ]
  const points: Point[] = runs.map(([target, start]) => {
    const s = emptyPhotonState(rule)
    const t0 = (K * N) / (2 * Math.PI * target)

    addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * t0) / (start === 'ordered' ? 4 : 8)))), 5.3)

    if (start === 'disordered') {
      setHashedAngles(rule, s, N / 2, 3.7)
    }

    const temps: number[] = []
    const cos: number[] = []
    const bulk: number[] = []
    const huskCounts: number[] = []

    for (let t = 0; t < 2000; t++) {
      photonBeatInPlace(rule, s, t)

      if (t < 800 || t % 20 !== 0) {
        continue
      }

      temps.push(s.flux.reduce((a, b) => a + b * b, 0) / (lattice.links - lattice.cells + 1))
      cos.push(magneticSum(rule, s.angle).meanCos)
      bulk.push(bulkMonopoles(tetrahedra, s.angle, N) / tetrahedra.count)

      const m = huskMonopoles(husk, projectAngles(husk, s.angle, N), N)

      huskCounts.push(m.total / m.cubes)
    }

    return { beta: (K * N) / (2 * Math.PI * mean(temps)), cos: mean(cos), bulk: mean(bulk), husk: mean(huskCounts), start }
  })
  const coulomb = points.filter(p => p.beta >= 0.65)
  const confined = points.filter(p => p.beta <= 0.45)
  const ok =
    coulomb.length > 0 &&
    confined.length > 0 &&
    coulomb.every(p => p.bulk < 0.01) &&
    confined.every(p => p.bulk > 0.05) &&
    Math.min(...confined.map(p => p.husk)) > Math.max(...coulomb.map(p => p.husk))
  const metrics: Record<string, number> = { monopoleTetrahedra: tetrahedra.count, monopoleTetrahedraPerDock: tetrahedra.count / lattice.cells }

  points.forEach((p, i) => {
    const tag = `monopole${i}${p.start === 'ordered' ? 'Ordered' : 'Disordered'}`

    metrics[`${tag}Beta`] = p.beta
    metrics[`${tag}MeanCos`] = p.cos
    metrics[`${tag}BulkPerTetrahedron`] = p.bulk
    metrics[`${tag}HuskPerCube`] = p.husk
  })

  return { ...metrics, ok: ok ? 1 : 0 }
}

export default experiment({
  id: 'gauge/husk-magnetism',
  code: 'E-FRC-0173',
  title:
    "magnetism on the husk: a steady current loop's projected field against the lattice Biot-Savart law, no Lorentz force on the knit's phaseless vibes, an exact Aharonov-Bohm fringe shift for the fear walk round a thin flux tube where the husk field on its path is zero, and monopoles rare in the Coulomb phase and dense past the transition, in the bulk and on the husk",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const sections = { biotSavart: biotSavart(), lorentz: lorentz(), aharonovBohm: aharonovBohm(), monopoles: monopoles() }
    const oks = Object.values(sections).map(s => s.ok)
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'ok'))

    return verdict({
      status: oks.every(x => x === 1) ? 'pass' : oks.some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "on the husk projection, the averaged field of a steady current loop follows the lattice Biot-Savart law within 10 percent up to three squares above it and falls monotonically, a uniform field leaves the knit's hopping vibes exactly where they were (they carry no phase), the fear walk round a thin flux tube shifts its fringe exactly as a phase plate of charge times flux would while the husk field on its path is zero, beside the tube and under a frame change nothing moves, and monopoles stay under 0.01 per tetrahedron in the Coulomb phase and pass 0.05 past the transition, with the husk ordered the same way",
      metrics: {
        ...strip(sections.biotSavart),
        ...strip(sections.lorentz),
        ...strip(sections.aharonovBohm),
        ...strip(sections.monopoles),
        sectionBiotSavart: sections.biotSavart.ok,
        sectionLorentz: sections.lorentz.ok,
        sectionAharonovBohm: sections.aharonovBohm.ok,
        sectionMonopoles: sections.monopoles.ok,
      },
      notes:
        'L2, deterministic. The knit carries no Lorentz force here, by construction and by measurement: its vibes have no phase, so the coupling to B exists only for a charge that carries one, the walker of part 3. A cyclotron orbit needs such a walker in two dimensions, which is not built. The Aharonov-Bohm part is exact only for fluxes in thirds of N, because the fear walk carries cube roots of unity; the Biot-Savart law is the lattice one on a periodic box, not the continuum formula, which is reported beside it. First run, 2026-09-25, status partial, and the failures stand: (1) the field is within 10 percent of the lattice law at z = 0, 1, 2 (1.047, 1.043, 0.928) and falls monotonically, but reads 0.815 of it at z = 3; (4) the bulk gates pass (0 to 0.0085 monopoles per tetrahedron at beta 1.24 to 0.68, then 0.040 at 0.60, 0.141 at 0.54 and 0.25 to 0.28 at beta 0.34 and below), but the husk reads 0.42 to 0.48 per cube at every beta, Coulomb or confined: the thermal circulation of a column sum of 2 x 6 bulk angles spreads over all of Z_N, so a husk cube reads the mod-N wrapping of that sum, not a monopole of the husk field.',
    })
  },
})
