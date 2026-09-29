// THE LINE LAW ON THE TRUE MESH. Every motion no-go so far (the line law E-SPN-0098, the lineon results E-SPN-0116 to
// E-SPN-0120, the star theorem, the observational exclusion E-SPN-0126) ran on a flat periodic D4 box, a disclosed
// stand-in. The model's space is the hyperbolic honeycomb {3,4,3,4} of ideal 24-cells. The suspicion: in hyperbolic space
// there are no global parallel families of lines, so the line a vibe follows (take along its root, face to face) might
// not close into a straight line, the slot labels might carry holonomy around the mesh's cycles, and a lone vibe might
// come back on a different line. If so, the line law is broken by curvature and motion across lines comes from the
// geometry itself.
//
// DERIVATION, before any run.
//  (1) What a line is. The stream takes slot d of a dock from the dock across its facet -d (code/substrate/coxeter/
//      label-transport: labels antipodal inside a dock, d against -d across every shared facet). A vibe that keeps its
//      slot d therefore enters each dock through facet -d and leaves through the antipodal facet d. The composition of
//      the reflections in two antipodal facets of a centrally symmetric cell is a translation along their common
//      perpendicular, which passes through the cell's center and both facet centers, so the dock centers of a line lie
//      on ONE geodesic, equally spaced (predicted spacing s with cosh s = 3, s = ln(3 + 2 sqrt 2) = 1.7627, E-NVG-0014's
//      skin-1 distance). A line is a geodesic. Two lines of one label through neighboring docks are not parallel: they
//      diverge (reported, not gated).
//  (2) The labels have no holonomy. The antipodal transport tau_d = F_d Z sends the outer Coxeter generator to the point
//      inversion Z, a homomorphism phi of [3,4,3,4] onto [3,4,3] = W(F4) (Z is central and (r3 Z)^4 = 1 because the last
//      Coxeter label, 4, is even). phi(F_d) = Z for every facet reflection, so phi(tau_d) = 1: every tau lies in the
//      kernel K, which acts simply transitively on the docks, and the label a slot reads is phi of its frame. The label
//      holonomy of any closed walk is phi of a word equal to 1 in the group: the identity, for every cycle. The smallest
//      cycles are the four docks around a triangle (the edge figure of {3,4,3,4} is a square). For the triangle shared by
//      facets a and b of the base dock (a . b = 1, 96 of them), the next dock's frame is F_a Z, whose facet labelled e is
//      F_a F_(-e) F_a, so the triangle lies in its facet -b, and the loop is a, -b, a, -b.
//  (3) The geometry DOES have holonomy, and the labels absorb it. Relative to parallel transport, tau_d turns a frame by
//      sigma_d = -R_d (minus the mirror in d: fixes d, negates the three orthogonal directions). Around the triangle's
//      four docks the Levi-Civita holonomy is a rotation by the quadrilateral's area. Its interior angles are the angles
//      between facet normals sharing a triangle, 60 degrees, so the area is 2 pi - 4 pi / 3 = 2 pi / 3: an order-3
//      rotation in the (a, b) plane, the W(D4) element (R_a R_b)^(+-2), a genuine permutation of the slots. On the flat
//      {3,4,3,3} three docks meet around a triangle, the triangle of centers has angles summing to pi, area 0, and no
//      holonomy. The translation-like transport (F_d R_d, two mirrors perpendicular to d) IS parallel transport, so its
//      holonomy is exactly this rotation: it cannot label the honeycomb (E-NVG-0014's control), and its failure is the
//      curvature.
//  (4) So the line law survives. Along a line sigma_d fixes d: the label a vibe carries along its line agrees with the
//      parallel transport of its own direction. The stream keeps the pair {d, -d}; every other piece of the rule acts
//      inside one dock line except the isometric map K, which acts only on a dock holding two or more single lines. So a
//      line's tone is conserved on the true mesh exactly when it is on the flat box: K never fires. Nothing in the
//      geometry returns a vibe onto another line, on the ball or on any label-consistent quotient (a line there is a
//      coset of the cyclic group <tau_d>, which carries slot d to slot d).
//  (5) What curvature changes instead: the husk. The husk is the flat horosphere at a cusp (the cusp layer of one ideal
//      vertex, a cubic lattice). A geodesic meets a horosphere in at most two points, so a line meets the cusp layer in
//      at most two docks: at each layer dock, the 6 lines through its 6 layer facets hold exactly 2 layer docks and the
//      other 6 lines exactly 1. In the upper half space with the cusp at infinity a line is a semicircle, so its
//      horizontal shadow is bounded: near a foot the horizontal distance goes as the height squared, and the shadow
//      increments shrink by e^(-2 s) = (3 - 2 sqrt 2)^2 = 17 - 12 sqrt 2 = 0.0294 a step. A lone line-bound vibe moves at
//      most about one lattice unit on the husk, and then its shadow stops. The flat box, where half the lines lie in the
//      husk and run forever, is NOT a faithful stand-in for the husk reading of a line.
//
// GATES, fixed before the run, never moved.
//  H1 holonomy (exact where it can be). (a) On all 96 triangle loops of the base dock the labelled walk a, -b, a, -b
//     returns to the base dock through four distinct docks on the radius-3 ball's integer table, the geometric loop
//     walked by the antipodal transport uses exactly those labels and returns the identity frame (1e-9), and the balls of
//     radius 3 and 4 have zero inconsistent steps: the label holonomy group is trivial. (b) The Levi-Civita holonomy
//     (transvections, no labels) around every loop is a slot permutation of order 3 equal to the exact integer
//     (R_a R_b)^2 or its inverse, and equal (as a matrix, 1e-9) to the translation transport's returned frame; the
//     group the 96 generate is reported. (c) Every one of the 24 label chains from the base dock is a geodesic with
//     cosh s = 3: |c(n+1) + c(n-1) - 6 c(n)| under 1e-9 of |c(n)| for n = 1 to 6, and -<c0, c1> / -<c0, c0> = 3 to 1e-12.
//  H2 the rule on the true mesh (the working knit's pieces: the coin on the full key, the meeting, the pair move with no
//     veto, the 'pass' collision, the stream; no mixer; links the identity grid move), on balls of radius 3 (8,857
//     docks) and 4 (162,049 docks), the frontier reflecting, 48 beats. (a) Structure: no mesh line holds two dock lines
//     of one dock, on both balls and the flat box. (b) One lone love in an empty mesh, at every one of the 24 slots of
//     the base dock (radius 3, key offset 0) and at slot 0 on four key offsets (radius 4): 0 lines' tone ever changes
//     and K fires on 0 docks. (c) The same love in the saturated store vacuum (a stored pair on every dock line, signs by
//     the key): 0 lines, 0 K docks, 0 cross-line moves, at every slot (radius 3) and on four offsets (radius 4).
//     (d) Attribution: the sparse store vacuum (a quarter of dock lines stored) fails condition (Z) and must break lines
//     on the ball (radius 3) and on the flat box, every cross-line move made on a K dock, none on a B dock; the counted
//     collision equals the rule's own collideVeto bit for bit. Control: G (the frame mixer at 28/64) breaks at least one
//     line from the lone love on the radius-3 ball.
//  H3 only if H2 (b) or (c) fails: whether a lone vibe's husk motion covers directions across line classes, against the
//     curvature radius. Not reached otherwise, and then said so.
//  H3' the husk reading of a conserved line (derivation (5)). At every cusp-layer dock to skin 3 (63 docks): of its 12
//     lines, exactly 6 hold 2 layer docks and 6 hold 1 (traced 6 steps each way); every ray from a layer dock has its
//     shadow increments in ratio 17 - 12 sqrt 2 at steps 5 to 6, within 1e-4 relative. Reported: the largest shadow
//     extent of any line, in lattice units, and the number of distinct shadow directions.
//  H4 control: the flat box reproduces E-SPN-0098's L1, the tone conserved on 6,144 of 6,144 lines on side 8 over 48
//     beats on four full-key offsets and the old key, in the coset-union vacuum with the lone love.
//  Verdict: pass when H1, H2, H3' and H4 all hold; fail otherwise, with the failing gate named.
//
// PROBES: none of the gated quantities was read before this file. The only prior readings used are registered ones
// (E-NVG-0014's ball, shell counts and skin-1 distance 1.76; E-SPN-0098's 6,144). The first run crashed in the
// reporting step (a spread of 1.7 million line lengths into Math.max) before any verdict or metric was printed; the
// fix touched only that line, and the second run is the recorded one.
//
// RESULT (run 2, 72 s), recorded after the run; no gate moved. FAIL on H2c alone. Every other gate held.
//  - H1: 96 of 96 triangle loops close on the integer table as a, -b, a, -b and return the identity frame (worst gap
//    2.8e-12); 0 inconsistent steps on 8,857 and 162,049 docks. The Levi-Civita holonomy is an order-3 rotation equal to
//    the exact (R_a R_b)^2 on 96 of 96, the translation labelling carries exactly it on 96 of 96, and the 96 generate a
//    group of 96. cosh s = 3.0000000000000204, geodesic defect 1.7e-14. Two label-0 lines one dock apart diverge:
//    1.76, 4.25, 7.75, 11.27, 14.80, 18.32, 21.85 (a flat box keeps them 1 apart).
//  - H2: 0 merged lines on both balls and the flat box; the lone love in an empty mesh changes 0 lines with K on 0 docks
//    on 28 of 28 runs (every slot, radius 3; four keys, radius 4). H2c FAILED as written: the saturated store vacuum
//    changes 131,498 (radius 3, 24 runs) and 405,008 (radius 4, 4 runs) line readings, K firing on 608,448 and 1,881,064
//    docks. The derivation's claim that a saturated store keeps condition (Z) was wrong: the same recipe on the FLAT box
//    breaks all 6,144 lines with K on 108,629 docks. So the failure is the recipe (it makes singles by itself, as the
//    sparse one does), not the curvature, and it is recorded as a failure of that gate, not reinterpreted as a pass.
//    H2d held: sparse vacuum 5,299 of 95,316 lines on the ball and 6,144 of 6,144 on the flat box, every cross-line move
//    on a K dock (70,090 and 372,011), 0 on B docks, the counted collision equal to the rule's bit for bit; G breaks 8.
//  - H3 is triggered by the letter of its gate (H2c failed) and was NOT run. Its premise, that curvature moves a vibe off
//    its line, is refuted by H1, H2a and H2b, and H2c's breaks are K's on both meshes alike; that is stated, not graded.
//  - H3': 63 of 63 layer docks split 6 and 6; shadow increment ratio 17 - 12 sqrt 2 to 6.1e-6; largest shadow extent
//    1.4142 lattice units (sqrt 2, one face diagonal of the cubic husk); 18 distinct shadow directions over 756 lines.
//  - H4: 6,144 of 6,144 on four full-key offsets and the old key.
//
// Depth L1 for H1 (a homomorphism and a Gauss-Bonnet count, confirmed on the group's own matrices), L2 for H2 and H3'
// (the rule run on the true mesh, a conservation law read on its own runs). DETERMINISM: no random numbers; every fill
// and path choice is an integer Weyl number of (beat, dock, line). The rule runs in exact integers; the geometry is read
// in floats and every verdict drawn from it is a permutation or a count. NOTHING MOVES: each slot takes the value the
// stream hands it.
//
// TWO OTHER SUSPECTED FALSE ASSUMPTIONS, assessed (not run).
//  (a) That a particle must be one vibe or a rigid cluster. A collective wave of the sea (a density or phase pattern of
//      many vibes, each staying on its own line) can travel in any direction: a plane wave of line occupations whose
//      phase advances across lines moves at an angle no single line holds, as a sound wave does in a gas of particles
//      that each run straight. E-RLT-0094 already measured isotropic sound and shear in a lattice gas whose particles
//      are lineons, so the ingredient exists. What decides it: prepare a husk wavepacket of the vacuum's own modulation
//      (a smooth envelope times a plane wave across line classes) and measure its group velocity against direction and
//      its spreading, on the working rule, with a control that the same packet of independent lineons (no collision)
//      splits into twelve beams. A pass needs one group speed in every direction to the measured precision and a packet
//      that stays one packet; a bound, localized object carrying charge in that wave is the harder second step, since a
//      sound wave carries no conserved charge of its own. Derivation (5) sharpens this: on the true mesh no single vibe
//      travels on the husk at all, so any husk particle MUST be collective.
//  (b) That isotropy must be read in the 4d box. The model reads physics on the husk after projection from the curved
//      bulk. On the flat box both readings see the same twelve lines. On {3,4,3,4} they differ: every bulk line projects
//      to a bounded shadow of finite length, so the 4d box's line classes are not husk directions at all. What decides
//      whether the husk reading is isotropic: run the lone love (or a packet) in the bulk of a large ball, project every
//      dock to its horospherical shadow, and measure the husk-averaged displacement tensor and its fourth moment against
//      direction, with the flat box's twelve-line pattern (E-SPN-0126's M_6) as the control that must read anisotropic.
//      H3' reports the first two ingredients (bounded shadows, their direction count), which already show the line-class
//      anisotropy of E-SPN-0126 does not carry to the true husk unchanged.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { samePoints } from '@/code/measure/doublet-locked-readings'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  fullKey,
  fullPathKey,
  keyedRunner,
  lineCharges,
  meshLines,
  oldPathKey,
  pathOffset,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  buildHyperbolicBall,
  cuspLayer,
  labelTransports,
  labelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import {
  innerJ,
  matMul,
  matVec,
  identity,
  type Mat,
  type Vec,
} from '@/code/substrate/coxeter/minkowski'
import {
  addLove,
  ballTables,
  composePermutations,
  countingCollide,
  faceLoopPairs,
  horosphericalChart,
  inversePermutation,
  largestEntryGap,
  leviCivitaHolonomy,
  loopFrames,
  newCollideTally,
  permutationOrder,
  rootReflection,
  samePermutation,
  slotPermutation,
  vacuumFill,
  walkLabels,
  type CollideTally,
  type StoreFill,
} from '@/code/measure/hyperbolic-lines'

const BEATS = 48
const OFFSETS = 4
const FLAT_SIDE = 8
const SMALL = 3
const LARGE = 4
const TRACE = 6
const SKIN = 3
const SALT = 4099
const G_RATE = 4

type LineRun = {
  broken: number
  kDocks: number
  crossK: number
  crossB: number
}

// one run: the lines whose tone ever differs from the start, and the collision's tally
function lineRun(
  tables: LockedTables,
  lines: MeshLines,
  start: Configuration,
  key: PathKey,
  mix = 0,
): LineRun {
  const tally: CollideTally = newCollideTally()
  const run = keyedRunner(tables, start, {
    key,
    mix,
    collide: countingCollide(tally),
  })
  const first = lineCharges(lines, start).tone
  const ever = new Uint8Array(lines.count)

  for (let t = 0; t < BEATS; t++) {
    run.beat()

    const now = lineCharges(lines, run.state()).tone

    for (let k = 0; k < lines.count; k++) {
      if (now[k] !== first[k]) {
        ever[k] = 1
      }
    }
  }

  return {
    broken: ever.reduce((s, x) => s + x, 0),
    kDocks: tally.kDocks,
    crossK: tally.crossK,
    crossB: tally.crossB,
  }
}

// the counted collision against the rule's own, bit for bit, on one start
function sameAsRule(
  tables: LockedTables,
  start: Configuration,
  key: PathKey,
): boolean {
  const counted = keyedRunner(tables, start, {
    key,
    collide: countingCollide(newCollideTally()),
  })
  const rule = keyedRunner(tables, start, { key })

  let same = true

  for (let t = 0; t < BEATS && same; t++) {
    counted.beat()
    rule.beat()

    const a = counted.state()
    const b = rule.state()

    same = samePoints(a, b) && a.store.every((v, i) => v === b.store[i])
  }

  return same
}

// no mesh line holds two dock lines of one dock
function mergedLines(lines: MeshLines, cells: number): number {
  let merged = 0

  for (let x = 0; x < cells; x++) {
    const seen = new Set<number>()

    for (const f of LINE_FIRSTS) {
      const id = lines.lineOf[x * 24 + f]!

      if (seen.has(id) || lines.lineOf[x * 24 + OPPOSITE[f]!] !== id) {
        merged++
      }

      seen.add(id)
    }
  }

  return merged
}

function lineLengths(lines: MeshLines): {
  longest: number
  shortest: number
} {
  const slots = new Int32Array(lines.count)

  for (const id of lines.lineOf) {
    slots[id]!++
  }

  return {
    longest: slots.reduce((m, v) => Math.max(m, v), 0) / 2,
    shortest:
      slots.reduce((m, v) => Math.min(m, v), Number.POSITIVE_INFINITY) /
      2,
  }
}

const saltedKey = (x: number, l: number, use: number): number =>
  fullKey(use, x, l, SALT)

function start(
  cells: number,
  fill: StoreFill,
  love?: { dock: number; slot: number },
): Configuration {
  const c = vacuumFill(cells, fill, saltedKey)

  if (love) {
    addLove(c, love.dock, love.slot)
  }

  return c
}

const sum = (
  xs: readonly LineRun[],
  f: (r: LineRun) => number,
): number => xs.reduce((s, r) => s + f(r), 0)

export default experiment({
  id: 'spin/curved-line-law',
  code: 'E-SPN-0156',
  title:
    "the line law survives the true mesh, and the flat box was a faithful stand-in for it, fail on one gate: on {3,4,3,4} the slot labels carry no holonomy (the loop a, -b, a, -b around each of the 96 triangles returns the identity frame; balls of 8,857 and 162,049 docks, 0 inconsistent steps) while the geometry does (the Levi-Civita holonomy around each loop is an order-3 rotation, exactly (R_a R_b)^2 on 96 of 96, generating a group of 96, and is what the translation-like labelling carries), every line is a geodesic with cosh s = 3, no mesh line holds two dock lines of one dock, and a lone love keeps every line's tone on 28 of 28 runs with K firing on 0 docks; the gate H2c failed: the saturated store vacuum breaks 536,506 line readings through K, but it breaks all 6,144 lines on the flat box the same way, so the failure is the vacuum recipe, not curvature; every cross-line move in every run is made on a K dock (0 on B docks); the flat box reproduces E-SPN-0098's 6,144 of 6,144 on five keys; what curvature changes is the husk: a line meets the cusp layer in at most 2 docks (6 lines with 2 and 6 with 1 at 63 of 63 layer docks) and its husk shadow is bounded, at most 1.414 lattice units, its increments shrinking by 17 - 12 sqrt 2 a step (to 6e-6), so no lone vibe travels on the true husk",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const metrics: Record<string, number> = {}
    const coin = labelledCoin()
    const { center, metric } = coin.frame
    const cc = -innerJ(center, center, metric)
    const antipodal = labelTransports({ coin, kind: 'antipodal' })
    const translation = labelTransports({ coin, kind: 'translation' })
    const small = buildHyperbolicBall({ coin, radius: SMALL })
    const large = buildHyperbolicBall({ coin, radius: LARGE })

    // ---- H1 (a), (b): the 96 triangle loops ----
    const pairs = faceLoopPairs()
    const neg = (k: number): number => OPPOSITE[k]!

    let tableCloses = 0
    let labelsMatch = 0
    let frameReturns = 0
    let lcOrder3 = 0
    let lcExact = 0
    let translationIsLc = 0
    let worstFrame = 0

    const holonomies: Int32Array[] = []

    for (const [a, b] of pairs) {
      const word = [a, neg(b), a, neg(b)]
      const docks = [
        0,
        walkLabels(small, 0, word.slice(0, 1)),
        walkLabels(small, 0, word.slice(0, 2)),
        walkLabels(small, 0, word.slice(0, 3)),
      ]

      if (
        walkLabels(small, 0, word) === 0 &&
        new Set(docks).size === 4
      ) {
        tableCloses++
      }

      const centers: Vec[] = docks.map(x =>
        matVec(small.frames[x]!, center),
      )
      const walked = loopFrames({
        coin,
        transports: antipodal,
        centers,
      })
      const gap = largestEntryGap(walked.frame, identity(center.length))

      worstFrame = Math.max(worstFrame, gap)

      if (
        walked.found &&
        walked.labels.every((k, i) => k === word[i])
      ) {
        labelsMatch++
      }

      if (walked.found && gap < 1e-9) {
        frameReturns++
      }

      const lc = leviCivitaHolonomy(centers, metric)
      const lcPerm = slotPermutation(coin, lc)
      const rab = composePermutations(
        rootReflection(a),
        rootReflection(b),
      )
      const rab2 = composePermutations(rab, rab)

      if (lcPerm && permutationOrder(lcPerm) === 3) {
        lcOrder3++
      }

      if (
        lcPerm &&
        (samePermutation(lcPerm, rab2) ||
          samePermutation(lcPerm, inversePermutation(rab2)))
      ) {
        lcExact++
      }

      if (lcPerm) {
        holonomies.push(lcPerm)
      }

      const trans = loopFrames({
        coin,
        transports: translation,
        centers,
      })

      if (trans.found && largestEntryGap(trans.frame, lc) < 1e-9) {
        translationIsLc++
      }
    }

    // the group the Levi-Civita holonomies generate, by closure
    const group = new Map<string, Int32Array>([
      [
        Array.from({ length: 24 }, (_, d) => d).join(','),
        Int32Array.from({ length: 24 }, (_, d) => d),
      ],
    ])

    for (const g of group.values()) {
      for (const h of holonomies) {
        const p = composePermutations(h, g)
        const key = Array.from(p).join(',')

        if (!group.has(key)) {
          group.set(key, p)
        }
      }

      if (group.size > 2000) {
        break
      }
    }

    const h1a =
      tableCloses === 96 &&
      labelsMatch === 96 &&
      frameReturns === 96 &&
      small.inconsistentSteps === 0 &&
      large.inconsistentSteps === 0 &&
      small.returnsExactly &&
      large.returnsExactly
    const h1b =
      lcOrder3 === 96 && lcExact === 96 && translationIsLc === 96

    // ---- H1 (c): every label chain is a geodesic with cosh s = 3 ----
    const c1 = matVec(antipodal[0]!, center)
    const coshS = -innerJ(center, c1, metric) / cc

    let worstGeodesic = 0

    for (let d = 0; d < 24; d++) {
      const chain: Vec[] = []

      let g: Mat = identity(center.length)

      for (let n = 0; n <= TRACE + 1; n++) {
        chain.push(matVec(g, center))
        g = matMul(g, antipodal[d]!)
      }

      for (let n = 1; n <= TRACE; n++) {
        const p = chain[n]!
        const size = Math.max(...p.map(Math.abs))
        const err = Math.max(
          ...p.map((v, i) =>
            Math.abs(
              (chain[n + 1]![i] ?? 0) +
                (chain[n - 1]![i] ?? 0) -
                2 * coshS * v,
            ),
          ),
        )

        worstGeodesic = Math.max(worstGeodesic, err / size)
      }
    }

    const h1c = worstGeodesic < 1e-9 && Math.abs(coshS - 3) < 1e-12

    // descriptive: two lines of one label through neighboring docks (orthogonal step) diverge
    const roots = rootsD4()
    const orth = roots.findIndex(
      r => r.reduce((s, v, i) => s + v * (roots[0]![i] ?? 0), 0) === 0,
    )
    const divergence: number[] = []

    let alongBase: Mat = identity(center.length)
    let alongNext: Mat = antipodal[orth]!

    for (let n = 0; n <= TRACE; n++) {
      const p = matVec(alongBase, center)
      const q = matVec(alongNext, center)

      divergence.push(
        Math.acosh(Math.max(1, -innerJ(p, q, metric) / cc)),
      )
      alongBase = matMul(alongBase, antipodal[0]!)
      alongNext = matMul(alongNext, antipodal[0]!)
    }

    // ---- H2 (a): structure ----
    const smallTables = ballTables(small, 'pass')
    const largeTables = ballTables(large, 'pass')
    const smallLines = meshLines(smallTables)
    const largeLines = meshLines(largeTables)
    const flatCenter = centerOf(FLAT_SIDE)
    const flat = contactFresh(FLAT_SIDE, 'pass', flatCenter)
    const flatLines = meshLines(flat.tables)
    const merged = {
      small: mergedLines(smallLines, small.cells),
      large: mergedLines(largeLines, large.cells),
      flat: mergedLines(flatLines, flat.cells),
    }
    const h2a =
      merged.small === 0 && merged.large === 0 && merged.flat === 0

    // ---- H2 (b), (c): the lone love, empty and saturated ----
    const k0 = fullPathKey(pathOffset(0))
    const keys = Array.from({ length: OFFSETS }, (_, k) =>
      fullPathKey(pathOffset(k)),
    )
    const smallEmpty = Array.from({ length: 24 }, (_, s) =>
      lineRun(
        smallTables,
        smallLines,
        start(small.cells, 'empty', { dock: 0, slot: s }),
        k0,
      ),
    )
    const smallSaturated = Array.from({ length: 24 }, (_, s) =>
      lineRun(
        smallTables,
        smallLines,
        start(small.cells, 'saturated', { dock: 0, slot: s }),
        k0,
      ),
    )
    const largeEmpty = keys.map(key =>
      lineRun(
        largeTables,
        largeLines,
        start(large.cells, 'empty', { dock: 0, slot: 0 }),
        key,
      ),
    )
    const largeSaturated = keys.map(key =>
      lineRun(
        largeTables,
        largeLines,
        start(large.cells, 'saturated', { dock: 0, slot: 0 }),
        key,
      ),
    )
    const clean = (xs: LineRun[]): boolean =>
      xs.every(
        r =>
          r.broken === 0 &&
          r.kDocks === 0 &&
          r.crossK === 0 &&
          r.crossB === 0,
      )
    const h2b = clean(smallEmpty) && clean(largeEmpty)
    const h2c = clean(smallSaturated) && clean(largeSaturated)

    // ---- H2 (d): the sparse vacuum, attribution, and the G control ----
    const smallSparseStart = start(small.cells, 'sparse', {
      dock: 0,
      slot: 0,
    })
    const flatSparseStart = start(flat.cells, 'sparse', {
      dock: flatCenter,
      slot: 0,
    })
    const smallSparse = lineRun(
      smallTables,
      smallLines,
      smallSparseStart,
      k0,
    )
    const flatSparse = lineRun(
      flat.tables,
      flatLines,
      flatSparseStart,
      k0,
    )
    const instrument =
      sameAsRule(smallTables, smallSparseStart, k0) &&
      sameAsRule(flat.tables, flatSparseStart, k0)
    const gControl = lineRun(
      smallTables,
      smallLines,
      start(small.cells, 'empty', { dock: 0, slot: 0 }),
      k0,
      G_RATE,
    )
    const h2d =
      smallSparse.broken > 0 &&
      flatSparse.broken > 0 &&
      smallSparse.crossB === 0 &&
      flatSparse.crossB === 0 &&
      smallSparse.crossK > 0 &&
      flatSparse.crossK > 0 &&
      instrument &&
      gControl.broken > 0

    // parity on the flat box: the same empty and saturated recipes
    const flatEmpty = lineRun(
      flat.tables,
      flatLines,
      start(flat.cells, 'empty', { dock: flatCenter, slot: 0 }),
      k0,
    )
    const flatSaturated = lineRun(
      flat.tables,
      flatLines,
      start(flat.cells, 'saturated', { dock: flatCenter, slot: 0 }),
      k0,
    )

    // ---- H3': the husk reading of a line ----
    const chart = horosphericalChart(coin)
    const layer = cuspLayer({ coin, skinRadius: SKIN })
    const target = 17 - 12 * Math.SQRT2

    let layerDocks = 0
    let splitRight = 0
    let worstRatio = 0
    let largestExtent = 0

    const directions: number[][] = []

    for (const m of layer.members) {
      layerDocks++

      let twos = 0
      let ones = 0

      for (const f of LINE_FIRSTS) {
        // the line through this dock, n = -TRACE .. TRACE
        const forward: Vec[] = []
        const backward: Vec[] = []

        let g = m.frame
        let h = m.frame

        for (let n = 0; n <= TRACE; n++) {
          forward.push(matVec(g, center))
          backward.push(matVec(h, center))
          g = matMul(g, antipodal[f]!)
          h = matMul(h, antipodal[neg(f)]!)
        }

        const points = [...backward.slice(1).reverse(), ...forward]
        const onLayer = points.filter(
          p =>
            Math.abs(chart.level(p) - chart.layerLevel) <
            1e-9 * chart.layerLevel,
        ).length

        if (onLayer === 2) {
          twos++
        } else if (onLayer === 1) {
          ones++
        }

        const xs = points.map(chart.coordinates)

        for (let i = 0; i < xs.length; i++) {
          for (let j = i + 1; j < xs.length; j++) {
            largestExtent = Math.max(
              largestExtent,
              Math.hypot(...xs[i]!.map((v, a) => v - (xs[j]![a] ?? 0))),
            )
          }
        }

        const whole = xs[xs.length - 1]!.map(
          (v, a) => v - (xs[0]![a] ?? 0),
        )
        const norm = Math.hypot(...whole)

        directions.push(whole.map(v => v / norm))

        for (const ray of [forward, backward]) {
          const rx = ray.map(chart.coordinates)
          const step = (n: number): number =>
            Math.hypot(
              ...rx[n]!.map((v, a) => v - (rx[n - 1]![a] ?? 0)),
            )
          const ratio = step(TRACE) / step(TRACE - 1)

          worstRatio = Math.max(
            worstRatio,
            Math.abs(ratio - target) / target,
          )
        }
      }

      if (twos === 6 && ones === 6) {
        splitRight++
      }
    }

    const distinct: number[][] = []

    for (const u of directions) {
      if (
        !distinct.some(w =>
          w.every((v, a) => Math.abs(v - (u[a] ?? 0)) < 1e-6),
        )
      ) {
        distinct.push(u)
      }
    }

    const h3p =
      splitRight === layerDocks &&
      worstRatio < 1e-4 &&
      chart.axesError < 1e-9

    // ---- H4: E-SPN-0098's L1 on the flat box ----
    const flatStart = cloneConfiguration(wordVacuum(flat, flat.store))

    flatStart.vibe[flatCenter * 24] = 1
    flatStart.open[flatCenter * 24] = 1

    const lawKeys: PathKey[] = [...keys, oldPathKey(flat.cells)]
    const law = lawKeys.map(key =>
      lineRun(flat.tables, flatLines, flatStart, key),
    )
    const h4 =
      flatLines.count === 6144 && law.every(r => r.broken === 0)

    const h2 = h2a && h2b && h2c && h2d
    const ok = h1a && h1b && h1c && h2 && h3p && h4
    const failed = [
      ['H1a', h1a],
      ['H1b', h1b],
      ['H1c', h1c],
      ['H2a', h2a],
      ['H2b', h2b],
      ['H2c', h2c],
      ['H2d', h2d],
      ["H3'", h3p],
      ['H4', h4],
    ]
      .filter(([, v]) => !v)
      .map(([n]) => n)

    const smallLengths = lineLengths(smallLines)
    const largeLengths = lineLengths(largeLines)

    Object.assign(metrics, {
      gate_H1a: h1a ? 1 : 0,
      gate_H1b: h1b ? 1 : 0,
      gate_H1c: h1c ? 1 : 0,
      gate_H2a: h2a ? 1 : 0,
      gate_H2b: h2b ? 1 : 0,
      gate_H2c: h2c ? 1 : 0,
      gate_H2d: h2d ? 1 : 0,
      gate_H3prime: h3p ? 1 : 0,
      gate_H4: h4 ? 1 : 0,
      h3Reached: h2b && h2c ? 0 : 1,
      triangleLoops: pairs.length,
      loopsClosingOnTable: tableCloses,
      loopsLabelledABAB: labelsMatch,
      loopsFrameReturns: frameReturns,
      worstLoopFrameGap: worstFrame,
      lcHolonomyOrder3: lcOrder3,
      lcHolonomyEqualsRaRbSquared: lcExact,
      translationHolonomyIsLeviCivita: translationIsLc,
      lcHolonomyGroupSize: group.size,
      smallBallDocks: small.cells,
      largeBallDocks: large.cells,
      inconsistentStepsSmall: small.inconsistentSteps,
      inconsistentStepsLarge: large.inconsistentSteps,
      coshStep: coshS,
      worstGeodesicDefect: worstGeodesic,
      divergenceStep0: divergence[0]!,
      divergenceStep3: divergence[3]!,
      divergenceStep6: divergence[TRACE]!,
      linesSmall: smallLines.count,
      linesLarge: largeLines.count,
      linesFlat: flatLines.count,
      longestLineSmall: smallLengths.longest,
      shortestLineSmall: smallLengths.shortest,
      longestLineLarge: largeLengths.longest,
      shortestLineLarge: largeLengths.shortest,
      mergedSmall: merged.small,
      mergedLarge: merged.large,
      mergedFlat: merged.flat,
      emptySmallBroken: sum(smallEmpty, r => r.broken),
      emptySmallKDocks: sum(smallEmpty, r => r.kDocks),
      emptyLargeBroken: sum(largeEmpty, r => r.broken),
      emptyLargeKDocks: sum(largeEmpty, r => r.kDocks),
      saturatedSmallBroken: sum(smallSaturated, r => r.broken),
      saturatedSmallKDocks: sum(smallSaturated, r => r.kDocks),
      saturatedLargeBroken: sum(largeSaturated, r => r.broken),
      saturatedLargeKDocks: sum(largeSaturated, r => r.kDocks),
      sparseSmallBroken: smallSparse.broken,
      sparseSmallKDocks: smallSparse.kDocks,
      sparseSmallCrossK: smallSparse.crossK,
      sparseSmallCrossB: smallSparse.crossB,
      sparseFlatBroken: flatSparse.broken,
      sparseFlatKDocks: flatSparse.kDocks,
      sparseFlatCrossK: flatSparse.crossK,
      sparseFlatCrossB: flatSparse.crossB,
      countedCollisionIsRule: instrument ? 1 : 0,
      gControlBroken: gControl.broken,
      flatEmptyBroken: flatEmpty.broken,
      flatSaturatedBroken: flatSaturated.broken,
      flatSaturatedKDocks: flatSaturated.kDocks,
      layerDocksTested: layerDocks,
      layerDocksSplit6and6: splitRight,
      worstShadowRatioError: worstRatio,
      shadowRatioPredicted: target,
      largestShadowExtent: largestExtent,
      shadowDirectionsDistinct: distinct.length,
      shadowLinesTraced: directions.length,
      chartAxesError: chart.axesError,
      seconds: (Date.now() - t0) / 1000,
    })

    for (const [i, r] of law.entries()) {
      metrics[`flatLaw_${lawKeys[i]!.name.replace('+', '')}_broken`] =
        r.broken
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on the true mesh the slot labels carry no holonomy (the four-dock loop a, -b, a, -b around each of ${pairs.length} triangles closes with the identity frame, ${frameReturns} of ${pairs.length}; ${small.cells} and ${large.cells}-dock balls with ${small.inconsistentSteps + large.inconsistentSteps} inconsistent steps) while the geometry does (the Levi-Civita holonomy around each loop is an order-3 rotation, ${lcOrder3} of ${pairs.length}, equal to (R_a R_b)^2 exactly on ${lcExact}, and is what the translation-like labelling carries on ${translationIsLc}); every line is a geodesic (cosh s = ${coshS.toFixed(12)}); on the balls the lone love in an empty mesh breaks ${sum(smallEmpty, r => r.broken) + sum(largeEmpty, r => r.broken)} lines over ${smallEmpty.length + largeEmpty.length} runs with K on ${sum(smallEmpty, r => r.kDocks) + sum(largeEmpty, r => r.kDocks)} docks, the saturated store vacuum breaks ${sum(smallSaturated, r => r.broken) + sum(largeSaturated, r => r.broken)} line readings over ${smallSaturated.length + largeSaturated.length} runs with K on ${sum(smallSaturated, r => r.kDocks) + sum(largeSaturated, r => r.kDocks)} docks (the flat box: ${flatSaturated.broken} of ${flatLines.count}, K on ${flatSaturated.kDocks}), and the rule breaks lines only where K fires (sparse vacuum ${smallSparse.broken} lines on the ball, ${flatSparse.broken} on the flat box, cross-line moves on B docks ${smallSparse.crossB + flatSparse.crossB}); the flat box reproduces E-SPN-0098 (${law.map(r => flatLines.count - r.broken).join('/')} of ${flatLines.count}); a line meets the husk in at most 2 docks (${splitRight} of ${layerDocks} layer docks split 6 and 6) and its husk shadow is bounded (largest extent ${largestExtent.toFixed(4)} lattice units, increments shrinking by ${target.toFixed(6)} a step to ${worstRatio.toExponential(2)})${failed.length ? `; FAILED ${failed.join(', ')}` : ''}`,
      metrics,
      control: {
        gControlBroken: gControl.broken,
        translationHolonomyIsLeviCivita: translationIsLc,
        flatSparseBroken: flatSparse.broken,
        flatLawBrokenOldKey: law[law.length - 1]!.broken,
      },
      notes: `L1 for H1, L2 for H2 and H3'. Gates H1a ${h1a}, H1b ${h1b}, H1c ${h1c}, H2a ${h2a}, H2b ${h2b}, H2c ${h2c}, H2d ${h2d}, H3' ${h3p}, H4 ${h4}; H3 ${h2b && h2c ? 'not reached (lines are conserved)' : 'triggered but not run: its premise (curvature moving a vibe off its line) is refuted by H1, H2a and H2b, and every break is K on both meshes'}. Line-of-a-label divergence (docks along label 0 from the base dock and from its neighbor across label ${orth}), distance by step: ${divergence.map(v => v.toFixed(4)).join(' ')}. Lines per ball: ${smallLines.count} (radius ${SMALL}, lengths ${smallLengths.shortest} to ${smallLengths.longest} docks), ${largeLines.count} (radius ${LARGE}, ${largeLengths.shortest} to ${largeLengths.longest}); flat side ${FLAT_SIDE} ${flatLines.count}. Sparse vacuum K docks: ball ${smallSparse.kDocks}, flat ${flatSparse.kDocks}. Flat parity: empty ${flatEmpty.broken}, saturated ${flatSaturated.broken} lines broken. Holonomy group generated by the 96 Levi-Civita holonomies: ${group.size} elements. Shadow directions: ${distinct.length} distinct over ${directions.length} lines through ${layerDocks} layer docks. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
