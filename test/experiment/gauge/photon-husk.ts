// The U(1) link sector read on the husk: the leapfrog of code/rule/photon-links run in the 4D bulk (the D4
// box, the flat model of the {3,4,3,4} cusp region) and projected onto the 3D husk (code/measure/photon-husk).
// Physical space is the husk, the horosphere round an ideal vertex of {3,4,3,4}, tiled by the cubic
// honeycomb {4,3,4} that is the honeycomb's vertex figure (E-GMT-0002: the cusp is a flat 3D sheet). The bulk
// is the substrate the rule runs on. What of the bulk's field reaches the husk is set by the projection,
// and this experiment defines it and checks that it carries the structure a physical field needs.
//
// The projection, fixed before the run: the depth is the axis e4 toward the ideal vertex, each husk dock
// is the column of bulk docks over it (D4 casts exactly Z^3 when x4 is dropped, the box's periods L D4
// casting L Z^3), and a husk link carries the SUM over the column of the bulk links between its two
// columns. The alternative, restricting to one sheet (x4 in {0, 1}, one bulk dock per column and one bulk
// link per husk link), is the control.
//
// Gates, fixed before the run. The side-8 D4 box (4,096 docks, husk 8^3 = 512 docks, columns of 8),
// N = 8192, K = 80 as in E-FRC-0164, 48 beats, from love and fear pairs joined by unit flux, hashed angles
// within 512, a hashed transverse flux within 181, demons hashed to 4,096, vibes hopping:
// 1. husk Gauss's law: the projected flux's divergence equals the column charge at every husk dock on every
//    beat (0 violations), while the sheet restriction breaks it (more than 0)
// 2. husk gauge covariance: a bulk frame change chi, run for 48 beats, projects to the husk frame change by
//    the column sum of chi, each husk link weighted by its multiplicity (0 mismatches on angles and flux)
// 3. an exact 3D rule: a start that is the same all along every column (angles and flux copied along the
//    depth, the flux the curl of plaquette integers hashed by column) stays so for 200 beats (0 docks
//    differ from their depth translate), while the generic start does not
// 4. which polarizations reach the husk, from the bulk curl-curl operator at k4 = 0 (linear algebra, L1),
//    at husk wave vectors (1,0,0), (1,1,0), (2,1,0), (1,1,1), (3,0,0) in units of 2 pi / 8: of the 3 bulk
//    photon polarizations the projection keeps exactly 2 (Gram eigenvalues above 0.1, the third below 1e-9 of
//    the largest), and the one it kills is odd under the depth reflection x4 -> -x4 (odd part above
//    1 - 1e-9). Its overlap with the depth-polarized plane wave, and how many of the 8 massive bulk
//    branches reach the husk, are reported
//
// Depth L2 for 1 to 3 (a construction and its exact checks), L1 for 4.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  changePhotonFrame,
  copyPhotonState,
  emptyPhotonState,
  fillHashedDemons,
  makePhotonRule,
  photonBeatInPlace,
  photonLatticeD4,
  photonLink,
  setHashedAngles,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import {
  changeHuskFrame,
  columnSum,
  huskGaussViolations,
  makeHusk,
  polarizationSurvival,
  projectAngles,
  projectLinks,
  restrictLinks,
  type Husk,
} from '@/code/measure/photon-husk'

const SIDE = 8
const N = 8192
const K = 80
const CAPACITY = 4096
const BEATS = 48
const UNIFORM_BEATS = 200
const GOLDEN = (Math.sqrt(5) - 1) / 2
const WAVES = [
  [1, 0, 0],
  [1, 1, 0],
  [2, 1, 0],
  [1, 1, 1],
  [3, 0, 0],
]

function start(rule: PhotonRule, scale: number): PhotonState {
  const { lattice } = rule
  const s = emptyPhotonState(rule)

  for (let x = 0; x < lattice.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
    const y = lattice.neighbour[x * lattice.degree + d] ?? 0

    if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
      const v = u < 0.15 ? 1 : -1
      const [l, sign] = photonLink(lattice, x, d)

      s.vibe[x] = v
      s.vibe[y] = -v
      s.flux[l] = (s.flux[l] ?? 0) + sign * v
    }
  }

  setHashedAngles(rule, s, 512, 3.7 * scale)
  addHashedCurl(rule, s, 181, 5.3 * scale)
  fillHashedDemons(s, rule.capacity, 2.9 * scale)

  return s
}

// the same all along every column: every quantity hashed by (column, direction) or (column, plaquette slot)
function uniformStart(rule: PhotonRule, husk: Husk): PhotonState {
  const { lattice } = rule
  const f = lattice.firsts.length
  const perDock = lattice.plaquetteCount / lattice.cells
  const size = lattice.plaquetteSize
  const s = emptyPhotonState(rule)
  const hash = (i: number, h: number, top: number): number => Math.floor((((i + 7) * GOLDEN * h) % 1) * (2 * top + 1)) - top

  for (let x = 0; x < lattice.cells; x++) {
    const c = husk.column[x] ?? 0

    for (let k = 0; k < f; k++) {
      s.angle[x * f + k] = ((hash(c * f + k, 3.7, 512) % N) + N) % N
    }

    for (let j = 0; j < perDock; j++) {
      const p = x * perDock + j
      const h = hash(c * perDock + j, 5.3, 181)

      for (let e = 0; e < size; e++) {
        const l = lattice.plaquetteLinks[p * size + e] ?? 0

        s.flux[l] = (s.flux[l] ?? 0) + (lattice.plaquetteSigns[p * size + e] ?? 0) * h
      }
    }
  }

  return s
}

// docks whose links differ from their depth translate's
function depthMismatches(rule: PhotonRule, husk: Husk, s: PhotonState): number {
  const f = rule.lattice.firsts.length

  let n = 0

  for (let x = 0; x < rule.lattice.cells; x++) {
    const y = husk.along[x] ?? 0

    for (let k = 0; k < f; k++) {
      if (s.angle[x * f + k] !== s.angle[y * f + k] || s.flux[x * f + k] !== s.flux[y * f + k]) {
        n += 1

        break
      }
    }
  }

  return n
}

const differ = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += Math.abs((a[i] ?? 0) - (b[i] ?? 0)) > 1e-9 ? 1 : 0
  }

  return n
}

export default experiment({
  id: 'gauge/photon-husk',
  code: 'E-FRC-0168',
  title:
    "the U(1) link sector read on the husk, the cubic horosphere of the {3,4,3,4} cusp: summing the bulk links over each column of the depth keeps Gauss's law on the husk with the column charge at every dock and beat, turns a bulk frame change into a husk frame change, and is run by an exact 3D rule on fields constant along the depth, while restricting to one sheet breaks Gauss's law; of the bulk's 3 photon polarizations it keeps 2 and kills the one odd under the depth reflection",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lattice = photonLatticeD4({ side: SIDE })
    const husk = makeHusk(lattice)
    const rule = makePhotonRule({ lattice, n: N, k: K, capacity: CAPACITY })

    // 1. husk Gauss's law, projection against sheet
    const s = start(rule, 1.37)

    let gauss = 0
    let sheetGauss = 0

    for (let t = 0; t < BEATS; t++) {
      photonBeatInPlace(rule, s, t)

      const charge = columnSum(husk, s.vibe)

      gauss += huskGaussViolations(husk, projectLinks(husk, s.flux), charge)
      sheetGauss += huskGaussViolations(husk, restrictLinks(husk, s.flux), charge)
    }

    // 2. husk gauge covariance
    const chi = Array.from({ length: lattice.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * N))
    const huskChi = columnSum(husk, chi)
    const a = start(rule, 1.7)
    const b = changePhotonFrame(rule, copyPhotonState(a), chi)

    let frame = 0

    for (let t = 0; t < BEATS; t++) {
      photonBeatInPlace(rule, a, t)
      photonBeatInPlace(rule, b, t)
      frame += differ(projectAngles(husk, b.angle, N), changeHuskFrame(husk, projectAngles(husk, a.angle, N), huskChi, N))
      frame += differ(projectLinks(husk, b.flux), projectLinks(husk, a.flux))
    }

    // 3. an exact 3D rule on column-constant fields
    const free = makePhotonRule({ lattice, n: N, k: K, capacity: CAPACITY, hop: false })
    const uniform = uniformStart(free, husk)
    const generic = start(free, 2.3)
    const uniformAtStart = depthMismatches(free, husk, uniform)

    let uniformLater = 0
    let genericLater = 0

    for (let t = 0; t < UNIFORM_BEATS; t++) {
      photonBeatInPlace(free, uniform, t)
      photonBeatInPlace(free, generic, t)
      uniformLater += depthMismatches(free, husk, uniform)
    }

    genericLater = depthMismatches(free, husk, generic)

    // 4. which polarizations survive
    const survival = WAVES.map(m => polarizationSurvival(husk, m))
    const kept = survival.every(sv => {
      const [g0 = 0, g1 = 0, g2 = 0] = sv.photonGram

      return g0 > 0.1 && g1 > 0.1 && g2 < 1e-9 * g0 && sv.killedOdd > 1 - 1e-9
    })

    const ok = gauss === 0 && sheetGauss > 0 && frame === 0 && uniformAtStart === 0 && uniformLater === 0 && genericLater > 0 && kept

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on the side-8 D4 box, the column-summed projection keeps Gauss's law on the 8^3 husk with the column charge at every dock and beat while vibes hop, a bulk frame change projects to the husk frame change by the column-summed frame with 0 mismatches, and fields constant along the depth stay so for 200 beats, an exact 3D rule, while the one-sheet restriction breaks Gauss's law and a generic start does not stay constant; at five husk wave vectors the projection keeps exactly 2 of the 3 bulk photon polarizations and kills the one odd under the depth reflection",
      metrics: {
        huskGaussViolations: gauss,
        huskFrameMismatches: frame,
        uniformMismatchesAtStart: uniformAtStart,
        uniformMismatchesOver200Beats: uniformLater,
        ...Object.fromEntries(
          survival.flatMap((sv, i) => {
            const tag = `k${(WAVES[i] ?? []).join('')}`

            return [
              [`${tag}PhotonGramKept1`, sv.photonGram[0] ?? 0],
              [`${tag}PhotonGramKept2`, sv.photonGram[1] ?? 0],
              [`${tag}PhotonGramKilled`, sv.photonGram[2] ?? 0],
              [`${tag}KilledOddPart`, sv.killedOdd],
              [`${tag}KilledDepthOverlap`, sv.killedDepthOverlap],
              [`${tag}MassiveBranchesReaching`, sv.massiveRank],
            ]
          }),
        ),
      },
      control: {
        sheetRestrictionGaussViolations: sheetGauss,
        genericStartDepthMismatches: genericLater,
      },
      notes:
        "L2 construction with exact checks, L1 linear algebra for the polarizations. The husk's Gauss's law follows because no D4 root points along the depth alone, so every flux crosses between columns or stays inside one. On the periodic box the column sum is the depth's zero mode k4 = 0, which is why fields constant along the depth are run by an exact 3D rule. The flat box is a model of the cusp region: in the hyperbolic bulk the columns shrink with depth by the warp factor, and a faithful projection would weight the sum by it. That is not done here. First run, 2026-09-25: gate 4 failed at (3,0,0), odd part 0.737, because code/algebra/linear/eig-hermitian keeps every second column of its real embedding and inside a degenerate eigenspace two kept columns can be one complex vector and its i-multiple, so the photon triplet came back spanning 2 dimensions. The instrument was fixed (hermitianEigen in code/measure/photon-modes, complex Gram-Schmidt over every column) and the gates were left as they were.",
    })
  },
})
