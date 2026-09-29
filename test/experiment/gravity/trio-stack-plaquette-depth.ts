// DOES THE TRIO'S CURL LEAVE THROUGH THE SHRINKING BULK (E-GRV-0133)? E-GRV-0130's plaquette move keeps Gauss exactly and
// relaxes the held trio's energy-line tube near the source, but on the closed husk torus the curl wave never leaves:
// the 64-beat depth is 0.19 of the lines' Poisson k, the 128-beat 0.74. The hypothesis (note/research/vibe/roadmap/
// remaining-pieces.md, "2 and 3c, the plaquette move"): the husk is the boundary of the shrinking bulk (E-GRV-0100, 0105,
// which keep 1/r); on the open stack a curl wave radiates into the bulk, as light does in the Randall-Sundrum shape, and
// only the gradient part, the depth, stays bound to the source.
//
// THE MOVE ON THE STACK, DERIVED BEFORE RUNNING (code/rule/stack-plaquette, whose header has the algebra):
//  - The faces. E-GRV-0100's stack at the source's side 16: layers of side 16 (the husk), 8, 4 (no fourth: side 2 has no
//    nine-link mesh), 4,672 docks, 46,656 links (every vertical g = 1). Faces: the husk's 49,152 triangles (line-
//    plaquette's, in its order), each bulk layer's own 12 a dock (6,912), and one VERTICAL face per lateral link of
//    layers 0 and 1 (41,472): the link, its head's vertical down, the link between the two parents on the layer below
//    (none when they share a parent: 13,824 triangles and 27,648 quads), its tail's vertical up. Every face closes
//    (tmp/plaq2-probe1.log: 0 open). Pushing a loop down layer by layer through the vertical faces shows they
//    generate every contractible loop of the stack; H1 of the stack is the husk torus's Z^3, carried down layer to
//    layer, which no face changes.
//  - How curl couples into the bulk. A husk link is in its husk triangles AND its vertical face, so C M E on that face
//    (M E on the husk link, less the parents' link, plus the two verticals' difference) is nonzero for any husk line
//    the bulk below does not match: the face turns, and its turn adds lines to the husk link, both verticals and the
//    parents' link at once. A husk line therefore leaves into the bulk locally, not only along the husk. Per link, the
//    vertical face alone adds kappa M to its stiffness: a gap omega^2 = kappa M (1 on an axis, 2 on a diagonal).
//  - Gauss. C^T B has no divergence at any dock of the STACK, so the stack divergence of E equals the drag's on every
//    dock and beat, exactly: the trio's content on husk docks, 0 on every bulk dock. On the husk ALONE it no longer
//    holds: the husk's own divergence differs from the content by the lines gone down its verticals. Gauss holds on
//    husk plus bulk.
//  - The static solution. B stops only when C M E = 0 on every face: M E = 2 grad x + h over the stack, E = g grad x
//    with stack divergence the content: E-GRV-0100's static field, whose zero mode keeps 1/r on the husk (share 4/7 of
//    the husk alone's for sides 16, 8, 4, plus the massive modes' short-range excess), and h the husk's winding carried
//    into the bulk, odd about the source, cancelled in shell means. Summing the husk's lateral lines gives x on the husk.
//    Q2's TARGET, stated first (tmp/plaq2-probe1.log): the stack's Poisson field for the 64-beat bare lines' divergence,
//    read the same way (x(r) - x(8), a + k / r on r = 2 .. 6), gives k = 0.0252802, 0.7770 of the husk alone's 0.0325372
//    (which a CG solve on the husk-only mesh reproduces to every printed digit).
//  - The coupling. The overcomplete faces make the stack stiff: a vertical link sits in 18 vertical faces, and the
//    largest eigenvalue of M^1/2 C^T C M^1/2 is 51.64 on the stack against 13.62 on the husk (probe 1, 300 power
//    iterations). E-GRV-0130's kappa 14/63 is unstable there (kappa lambda 11.5 > 4; the probe's arm blows up to its
//    window at once). So kappa is set by the SAME margin as E-GRV-0130 (kappa lambda_max 3.02): 10/171, kappa lambda
//    3.0197, one whole line 171^3 units. It slows the husk's long curl wave from 0.272 to c_T = sqrt(0.332 x 10/171) =
//    0.139 docks a beat. So a like-for-like arm is run beside it: the husk alone at the same 10/171 (reported, not gated).
//  - The time for the curl to leave a region of radius r. Down: the vertical face's gap omega = sqrt(kappa M) = 0.242 on
//    an axis, 0.342 on a diagonal, a quarter period of 6.5 and 4.6 beats, so a husk line starts down within a few beats
//    anywhere. Along the husk: r / c_T = 21.5 beats for r = 3. Through layer 1 and 2 (their own mesh, twice and four
//    times the spacing): 0.279 and 0.557 husk docks a beat, 11 and 5 beats for r = 3 plus the hops down and up.
//  - WHAT THE BULK CAN HOLD. This is the caveat the derivation forces. The shrinking stack is FINITE and CLOSED (no floor),
//    and the move is a reversible wave with no loss, so nothing can radiate to infinity: the curl can only be SHARED
//    among the stack's modes. The bulk holds 9,792 of the 46,656 links (21 percent), so at equipartition it holds about
//    a fifth of the wave energy, and the energy that leaves the source's ball mostly spreads over the husk. RS II's bulk
//    takes energy because it is infinite (a continuum of massive modes); this one returns it on its own crossing time
//    (side 8 / 0.279 = 29 beats, side 4 / 0.557 = 7). And the long transverse waves keep a slow branch: a field of one
//    husk wavelength matched layer to layer through the vertical faces (the vector analogue of the scalar zero mode)
//    has no gap, so the slow part of the curl that kept E-GRV-0130's time average from converging is still there, and
//    at the slower kappa it is slower.
//
// THE RUN. E-GRV-0130's source exactly (side 16, box-12 level, P 40, the parallel placement, the working split meeting,
// cost and sign, 128 beats of the sectored ring form), its expected lines cast to the husk each beat and fed as a drag
// on the husk's links to four arms: STACK (the stack's faces, kappa 10/171), HUSK (E-GRV-0130's arm exactly:
// code/measure/line-plaquette, husk faces, 14/63), SLOW (the husk's faces through the stack code with no layers, 10/171)
// and BARE (E-GRV-0130's, no move). Every window 9 whole lines, sized on every arm's drive before the gated run
// (tmp/plaq2-probe1.log, plaq2-probe2.log, a 99-line window): largest line 3.000 (STACK, SLOW, BARE) and 3.405
// (HUSK), largest turn 0.258, 0.248, 0.667: the largest register reaches 0.76 of the half-window 4.5. The stack code with
// no layers equals line-plaquette bit for bit on this drive at 14/63 over 128 beats (probe 1).
//
// THE READINGS. The depth: an arm's husk lateral lines averaged over beats 1 .. 64 (and 1 .. 128) and SUMMED
// (E-GRV-0127's depthReading). The non-gradient energy: on the TWO-BEAT MEAN of the lines (the loves alternate docks
// each beat, a period-2 current at the lattice's top frequency that no move can carry off; E-GRV-0130's P3 reading),
// the part E - F_grad, F_grad the arm's own gradient field (a Poisson solve of the mean's divergence on its own mesh:
// the stack for STACK, the husk for the husk arms), energy sum (E - F_grad)^2 / 2g, split into husk links whose tail is
// within R = 3 of the source (N_in), other husk links, and bulk links (every vertical and bulk lateral).
//
// GATES, fixed before the first run of this file.
//  Q1 Gauss exact: on every beat, the stack divergence of the STACK arm's lines equals the bare drag's at every dock of
//     husk and bulk (0 off), and the husk arms' husk divergence equals theirs (0 off).
//  Q2 the depth: the STACK arm's summed 64-beat mean gives k within 5 percent of the stack's own Poisson k for the same
//     source, 0.0252802 (recomputed in the run; the run must reproduce it to half its last printed digit, 5e-9, or the verdict is partial).
//  Q3 the curl leaves into the bulk: (a) the STACK arm's N_in, averaged over beats 97 .. 128, is at most 0.05 of its
//     beat-0 value (the bare tube's); and (b) the energy that left is found in the bulk: the bulk's non-gradient
//     energy, averaged over beats 97 .. 128, is at least half of what left the ball (N_in(0) - that late mean).
//  Q4 exact: every arm runs back to its start bit for bit, with 0 wraps of lines or turns.
//  CONTROL H (the closed husk, E-GRV-0130's setting): the HUSK arm's 64-beat k reproduces E-GRV-0130's 0.00615292
//     (0.19 of its Poisson k) within 1e-6 of it.
//  CONTROL 0 (no move): the BARE arm's k reproduces E-GRV-0127's -0.2363518 within 1e-3 of it.
//  Verdict: partial if a control fails; pass if Q1 .. Q4 hold; fail otherwise.
// PREDICTED: Q1 and Q4 hold (algebra and the checked window). Q2 FAILS: the gapped part of the curl oscillates away
// within a few beats, but the slow branch does not and runs at half E-GRV-0130's speed, so the 64-beat mean keeps a
// large residue of unknown sign; no number is predicted to 5 percent. Q3(b) FAILS: a closed bulk of 21 percent of the
// links holds about a fifth of the wave energy, not half of what leaves the ball. Q3(a) is not predicted: E-GRV-0130's
// curl measure fell to 0.033 at 14/63, but the slower kappa and the non-gradient measure (which counts the winding and
// the period-2 current's mean) may hold it above 0.05. The controls hold (the same code as E-GRV-0130's arms).
//
// FIRST RUN (tmp/plaq2-exp.log, 62 s, the record; run as E-GRV-XXXX and numbered before registering): fail on Q2, Q3a
// and Q3b; Q1, Q4 and both controls hold; the target reproduced (0.0252802124); no gate moved.
//  - Q1: the stack divergence equals the drag's on every dock of husk and bulk and every beat (0 off, every arm). The
//    husk's own divergence moves off the content by up to 0.239 lines, the lines gone down its verticals: Gauss holds
//    on husk plus bulk and not on the husk alone, as derived.
//  - Q2 FAILS: the summed 64-beat mean x(r) - x(8) is 0.0509, 0.0091, -0.0004, 0.0019, -0.0000, -0.0015, -0.0008,
//    -0.0003 against the target's 0.0501, 0.0183, 0.0092, 0.0054, 0.0032, 0.0017, 0.0008, 0.0002: k 0.00323, 0.128 of
//    the stack's Poisson k (128 beats 0.01498, 0.593). The field is 19.6 percent divergence free, and its own stack-
//    gradient part reads k 0.0197. Like for like, the husk alone at 10/171 reads 0.0527 (1.62 of its Poisson k, a large
//    residue of the other sign) and 0.30 over 128 beats: neither average has converged, so the bulk has not made the
//    time average converge; it has changed the residue.
//  - Q3a FAILS narrowly: the non-gradient energy within 3 of the source, two-beat mean over beats 97 .. 128, is 0.589
//    against the tube's 7.414, a ratio 0.079 against 0.05 (first under half at beat 3, never under a twentieth). The
//    husk alone at 10/171 reads 0.081, at 14/63 0.043: the bulk does not speed the ball's emptying.
//  - Q3b FAILS: of the 6.825 that left the ball, the bulk holds 0.862 (0.126 of it, gate half) and the husk outside the
//    ball 6.607. The turns hold 2.2 on the seam's vertical faces and 0.76 on the deeper ones at beat 128. The field
//    energy fell from 16.5 to 8.1 (the rest is in the turns: the leapfrog's kept energy is shared, not lost). As
//    derived: a closed bulk of 21 percent of the links shares the wave, and most of what leaves goes along the husk.
//  - Q4: every arm runs back bit for bit, 0 wraps; largest line 3.000, turn 0.258.
//  - Controls: the closed husk at 14/63 gives k 0.006152920336893957, E-GRV-0130's to every digit; no move gives
//    -0.2363519.
//  WHAT IT MEANS: the stack's faces carry the move into the bulk exactly (Gauss on husk plus bulk, bit-for-bit reversal),
//  and the static field it relaxes toward is the stack's own 1/r depth (0.777 of the husk alone's). But the shrinking
//  stack is finite, closed and lossless, so the curl is shared among its modes, not radiated away: the bulk takes an
//  eighth of what leaves the source and the husk keeps the rest, and the time-averaged depth is no closer (0.13 at 64
//  beats, 0.59 at 128). The Randall-Sundrum picture needs a bulk that can absorb: an infinite one, or the GROWING stack
//  with its floor (E-GRV-0094, 0095), which this test did not run. The stack's stiffness (lambda_max 51.6, from 18
//  vertical faces on each vertical link) also forces a kappa a quarter of E-GRV-0130's, which halves the curl's speed.
//
// Depth L2 (Q1, Q4 L1). DETERMINISM: no random numbers. NOTHING MOVES: the lines are the rule's drag; each register
// takes its value by the rule. HUSK FIRST: every depth is read on the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { radionMesh } from '@/code/rule/trit-radion'
import { huskFaces, plaquetteRule } from '@/code/rule/line-plaquette'
import { openMesh } from '@/code/rule/open-husk'
import { stackFaces } from '@/code/rule/stack-plaquette'
import { huskDistances } from '@/code/measure/plaquette-readings'
import { bulkLinks, huskCast } from '@/code/measure/energy-lines'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  axisRing,
  blochPacket,
  fitRing,
  levelPlacement,
  ringCenter,
} from '@/code/measure/held-cluster'
import type { PieceOptions } from '@/code/measure/bound-line'
import {
  lineGauge,
  placeCutFramed,
} from '@/code/measure/permutation-meeting'
import {
  depthReading,
  readSectors,
  ringHuskFlux,
  ringLinks,
  sectorBeat,
  type Sectors,
} from '@/code/measure/trio-energy-lines'
import {
  armScratch,
  feedArm,
  plaquetteArm,
  reverseArm,
  wholeLines,
} from '@/code/measure/line-plaquette'
import {
  feedStackArm,
  huskLinks,
  reverseStackArm,
  stackArm,
  stackArmScratch,
  stackGradient,
  stackStiffness,
  stackWholeLines,
  turnSplit,
  waveSplit,
  type WaveSplit,
} from '@/code/measure/stack-plaquette'

const BOX = 12
const P = 40
const SIDE = 16
const LAYERS = 2
const BEATS = 128
const WINDOW = 64
const REF = 8
const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
const STACK_K = 0.02528021
// half the last digit the probe printed
const STACK_K_SAME = 5e-9
const HUSK_K_0130 = 0.006152920336893957
const HELM_K_0127 = 0.03253720396736877
const BARE_K_0127 = -0.2363518447458349
const Q2_TOLERANCE = 0.05
const HUSK_TOLERANCE = 1e-6
const BARE_TOLERANCE = 1e-3
const RADIUS = 3
const Q3_RATIO = 0.05
const Q3_FOUND = 0.5
const LATE_FROM = 97
const STIFF_ITERATIONS = 300
// E-GRV-0130's move and window, and the stack's kappa at the same margin
const A_HUSK = 14
const Q_HUSK = 63
const A_STACK = 10
const Q_STACK = 171
const LEVELS = 3
const WHOLE = 9
const REPORT = [0, 1, 4, 8, 16, 32, 64, 96, 128]

export default experiment({
  id: 'gravity/trio-stack-plaquette-depth',
  code: 'E-GRV-0133',
  title:
    "the plaquette move on the shrinking stack's faces keeps Gauss exactly on husk plus bulk, but the closed bulk does not carry the trio's curl away, fail on Q2 and Q3: E-GRV-0130's drive on E-GRV-0100's stack at side 16 (sides 16, 8, 4, 97,536 faces, kappa 10/171 at E-GRV-0130's stability margin, since the overcomplete vertical faces raise lambda_max from 13.6 to 51.6) keeps the stack divergence equal to the drag's on every dock and beat while the husk's own divergence moves up to 0.24 lines down its verticals, never wraps and runs back bit for bit; the summed 64-beat depth gives k 0.0032, 0.128 of the stack's own Poisson k 0.0253 (0.593 over 128 beats), and the husk alone at the same kappa is no better converged (1.62, then 0.30, of its Poisson k); the non-gradient energy within 3 of the source falls to 0.079 of the tube's (gate 0.05), and of the 6.8 that left, 0.86 is in the bulk (gate half) and 6.6 on the husk outside: a finite reversible bulk shares the wave, it does not absorb it; E-GRV-0130's closed-husk arm reproduces k 0.0061529 to every digit and the bare arm -0.2364",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const sector: LineSector = {
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: BOX,
      unit: 0,
    }
    const basis = lineBasis(sector)
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)

    // ---- the side-16 source, as E-GRV-0127 and 0130 ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const gauge = lineGauge(f.tables, ring)
    const fit = fitRing(placed, L)
    const links = ringLinks(f.tables, ring)
    const cast = huskCast(bulkLinks(f.tables), husk)
    const c0 =
      Math.round(
        ringCenter(
          blochPacket(basis, L, level.cre, level.cim, true).density(),
        ),
      ) % L
    const col = husk.column[ring.docks[c0]!]!
    const sink = (c0 + L / 2) % L
    const dist = huskDistances(SIDE, col)
    const options: PieceOptions = {
      cost: true,
      sign: true,
      unit: 0,
      flat: false,
    }

    let sectors: Sectors = new Map([
      [0, placeCutFramed(gauge, fit.kept, P, 'parallel')],
    ])

    const lines = Float64Array.from(
      readSectors(L, sink, sectors, false).gauss,
    )

    const toHusk = (ringField: Float64Array): Float64Array => {
      const out = new Float64Array(husk.columns * 9)

      ringHuskFlux(links, cast, ringField, out)

      return out
    }

    // ---- the meshes, faces and arms ----
    const radion = radionMesh([SIDE, SIDE, SIDE])
    const hf = huskFaces(radion)
    const stack = openMesh(SIDE, LAYERS, 'shrink')
    const flat = openMesh(SIDE, 0, 'shrink')
    const sf = stackFaces(stack)
    const ff = stackFaces(flat)
    const lambdaStack = stackStiffness(
      sf,
      stack.links,
      STIFF_ITERATIONS,
    )
    const lambdaHusk = stackStiffness(ff, flat.links, STIFF_ITERATIONS)
    const ruleHusk = plaquetteRule(A_HUSK, Q_HUSK, LEVELS, WHOLE)
    const ruleStack = plaquetteRule(A_STACK, Q_STACK, LEVELS, WHOLE)
    const start = toHusk(lines)
    const huskArm = plaquetteArm(radion, hf, ruleHusk, start, true)
    const bare = plaquetteArm(radion, hf, ruleHusk, start, false)
    const huskScratch = armScratch(radion, hf)
    const deep = stackArm(stack, sf, ruleStack, start)
    const deepScratch = stackArmScratch(stack, sf)
    const slow = stackArm(flat, ff, ruleStack, start)
    const slowScratch = stackArmScratch(flat, ff)
    const huskLen = husk.columns * 9
    const sum = {
      deep: [new Float64Array(huskLen), new Float64Array(huskLen)],
      husk: [new Float64Array(huskLen), new Float64Array(huskLen)],
      slow: [new Float64Array(huskLen), new Float64Array(huskLen)],
      bare: [new Float64Array(huskLen), new Float64Array(huskLen)],
    }

    const addTo = (
      pair: Float64Array[],
      w: ArrayLike<number>,
      t: number,
    ): void => {
      for (let l = 0; l < huskLen; l++) {
        if (t <= WINDOW) {
          pair[0]![l]! += w[l]! / WINDOW
        }

        pair[1]![l]! += w[l]! / BEATS
      }
    }

    // the non-gradient split of a two-beat mean on its own mesh
    const split = (
      mesh: typeof stack,
      now: Float64Array,
      prev: Float64Array,
    ): WaveSplit => {
      const mean = Float64Array.from(now, (v, i) => (v + prev[i]!) / 2)

      return waveSplit(
        mesh,
        mean,
        stackGradient(mesh, mean).flux,
        dist,
        RADIUS,
      )
    }

    const wDeep0 = stackWholeLines(deep)
    const wSlow0 = stackWholeLines(slow)
    const wHusk0 = wholeLines(huskArm)
    const s0 = {
      deep: split(stack, wDeep0, wDeep0),
      slow: split(flat, wSlow0, wSlow0),
      husk: split(flat, wHusk0, wHusk0),
    }

    let prev = { deep: wDeep0, slow: wSlow0, husk: wHusk0 }

    const late = {
      deepIn: 0,
      deepBulk: 0,
      deepOut: 0,
      slowIn: 0,
      huskIn: 0,
      beats: 0,
    }
    const first = {
      deepHalf: -1,
      deepTwentieth: -1,
      slowHalf: -1,
      slowTwentieth: -1,
      huskHalf: -1,
      huskTwentieth: -1,
    }
    const timeline: string[] = []
    const f3 = (x: number): string => x.toFixed(3)

    const report = (
      t: number,
      sd: WaveSplit,
      ss: WaveSplit,
      sh: WaveSplit,
    ): void => {
      const turns = turnSplit(
        sf,
        deep.state.face,
        ruleStack,
        dist,
        RADIUS,
      )

      timeline.push(
        `t${t}: stack N_in ${f3(sd.restInside)} husk-out ${f3(sd.restHuskOutside)} bulk ${f3(sd.restBulk)} gradient ${sd.gradient.toFixed(4)} energy ${f3(sd.energy)}, turns in ${f3(turns.inside)} out ${f3(turns.huskOutside)} seam ${f3(turns.seam)} deep ${f3(turns.deep)}; slow N_in ${f3(ss.restInside)} rest ${f3(ss.rest)}; husk N_in ${f3(sh.restInside)} rest ${f3(sh.rest)}`,
      )
    }

    report(0, s0.deep, s0.slow, s0.husk)

    for (let t = 1; t <= BEATS; t++) {
      sectors = sectorBeat(options, f.tables, ring, sectors)

      const r = readSectors(L, sink, sectors, true)

      for (let k = 0; k < L; k++) {
        lines[k]! += r.drag[k]!
      }

      const target = toHusk(lines)

      feedArm(radion, hf, huskArm, target, huskScratch)
      feedArm(radion, hf, bare, target, huskScratch)
      feedStackArm(stack, sf, deep, target, deepScratch)
      feedStackArm(flat, ff, slow, target, slowScratch)

      const now = {
        deep: stackWholeLines(deep),
        slow: stackWholeLines(slow),
        husk: wholeLines(huskArm),
      }

      addTo(sum.deep, now.deep, t)
      addTo(sum.slow, now.slow, t)
      addTo(sum.husk, now.husk, t)
      addTo(sum.bare, wholeLines(bare), t)

      const sd = split(stack, now.deep, prev.deep)
      const ss = split(flat, now.slow, prev.slow)
      const sh = split(flat, now.husk, prev.husk)

      const cross = (
        key: keyof typeof first,
        value: number,
        base: number,
        ratio: number,
      ): void => {
        if (first[key] < 0 && value <= ratio * base) {
          first[key] = t
        }
      }

      cross('deepHalf', sd.restInside, s0.deep.restInside, 0.5)
      cross(
        'deepTwentieth',
        sd.restInside,
        s0.deep.restInside,
        Q3_RATIO,
      )
      cross('slowHalf', ss.restInside, s0.slow.restInside, 0.5)
      cross(
        'slowTwentieth',
        ss.restInside,
        s0.slow.restInside,
        Q3_RATIO,
      )
      cross('huskHalf', sh.restInside, s0.husk.restInside, 0.5)
      cross(
        'huskTwentieth',
        sh.restInside,
        s0.husk.restInside,
        Q3_RATIO,
      )

      if (t >= LATE_FROM) {
        late.deepIn += sd.restInside
        late.deepBulk += sd.restBulk
        late.deepOut += sd.restHuskOutside
        late.slowIn += ss.restInside
        late.huskIn += sh.restInside
        late.beats++
      }

      if (REPORT.includes(t)) {
        report(t, sd, ss, sh)
      }

      prev = now
    }

    // ---- the readings ----
    const read = (
      field: Float64Array,
    ): ReturnType<typeof depthReading> =>
      depthReading(SIDE, col, field, REF, FIT_R)
    const deep64 = read(sum.deep[0]!)
    const deep128 = read(sum.deep[1]!)
    const husk64 = read(sum.husk[0]!)
    const husk128 = read(sum.husk[1]!)
    const slow64 = read(sum.slow[0]!)
    const slow128 = read(sum.slow[1]!)
    const bare64 = read(sum.bare[0]!)
    // Q2's target: the stack's Poisson field of the 64-beat bare lines' divergence, read the same way
    const bareStack = new Float64Array(stack.links)

    bareStack.set(sum.bare[0]!)

    const target = read(
      huskLinks(stack, stackGradient(stack, bareStack).flux),
    )
    // the STACK arm's own 64-beat mean, its stack-gradient part read the same way (its stack divergence is the bare's)
    const deepMean = new Float64Array(stack.links)

    deepMean.set(sum.deep[0]!)

    const deepGradient = read(
      huskLinks(stack, stackGradient(stack, deepMean).flux),
    )

    // ---- Q4 ----
    const reversed = {
      deep: reverseStackArm(sf, deep, deepScratch),
      slow: reverseStackArm(ff, slow, slowScratch),
      husk: reverseArm(hf, huskArm, huskScratch),
      bare: reverseArm(hf, bare, huskScratch),
    }
    const wraps = {
      deep: deep.tally.lineWraps + deep.tally.faceWraps,
      slow: slow.tally.lineWraps + slow.tally.faceWraps,
      husk: huskArm.tally.lineWraps + huskArm.tally.faceWraps,
      bare: bare.tally.lineWraps + bare.tally.faceWraps,
    }

    // ---- the gates ----
    const lateDeepIn = late.deepIn / late.beats
    const lateDeepBulk = late.deepBulk / late.beats
    const lateDeepOut = late.deepOut / late.beats
    const left = s0.deep.restInside - lateDeepIn
    const targetSame = Math.abs(target.k - STACK_K) <= STACK_K_SAME
    const q1 =
      deep.gaussOff === 0 &&
      slow.gaussOff === 0 &&
      huskArm.gaussOff === 0 &&
      bare.gaussOff === 0
    const q2 = Math.abs(deep64.k / STACK_K - 1) <= Q2_TOLERANCE
    const q3a = lateDeepIn <= Q3_RATIO * s0.deep.restInside
    const q3b = lateDeepBulk >= Q3_FOUND * left
    const q3 = q3a && q3b
    const q4 =
      Object.values(reversed).every(Boolean) &&
      Object.values(wraps).every(w => w === 0)
    const controlH =
      Math.abs(husk64.k / HUSK_K_0130 - 1) <= HUSK_TOLERANCE
    const control0 =
      Math.abs(bare64.k / BARE_K_0127 - 1) <= BARE_TOLERANCE
    const status = !(controlH && control0 && targetSame)
      ? 'partial'
      : q1 && q2 && q3 && q4
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_Q1: q1 ? 1 : 0,
      gate_Q2: q2 ? 1 : 0,
      gate_Q3a: q3a ? 1 : 0,
      gate_Q3b: q3b ? 1 : 0,
      gate_Q4: q4 ? 1 : 0,
      controlH: controlH ? 1 : 0,
      control0: control0 ? 1 : 0,
      targetSame: targetSame ? 1 : 0,
      docks: stack.docks,
      links: stack.links,
      faces: sf.count,
      lambdaStack,
      lambdaHusk,
      kappaLambdaStack: (A_STACK / Q_STACK) * lambdaStack,
      kappaLambdaHusk: (A_HUSK / Q_HUSK) * lambdaHusk,
      stackTargetK: target.k,
      stackTargetOverHusk: target.k / HELM_K_0127,
      k64: deep64.k,
      k128: deep128.k,
      k64OverTarget: deep64.k / target.k,
      k128OverTarget: deep128.k / target.k,
      deepGradientK64: deepGradient.k,
      huskK64: husk64.k,
      huskK128: husk128.k,
      slowK64: slow64.k,
      slowK128: slow128.k,
      slowK64OverHelm: slow64.k / HELM_K_0127,
      slowK128OverHelm: slow128.k / HELM_K_0127,
      bareK64: bare64.k,
      nIn0: s0.deep.restInside,
      nInLate: lateDeepIn,
      nInRatio: lateDeepIn / s0.deep.restInside,
      bulkLate: lateDeepBulk,
      huskOutsideLate: lateDeepOut,
      huskOutside0: s0.deep.restHuskOutside,
      leftBall: left,
      bulkOverLeft: lateDeepBulk / left,
      slowNIn0: s0.slow.restInside,
      slowNInRatio: late.slowIn / late.beats / s0.slow.restInside,
      huskNIn0: s0.husk.restInside,
      huskNInRatio: late.huskIn / late.beats / s0.husk.restInside,
      firstDeepHalf: first.deepHalf,
      firstDeepTwentieth: first.deepTwentieth,
      firstSlowHalf: first.slowHalf,
      firstSlowTwentieth: first.slowTwentieth,
      firstHuskHalf: first.huskHalf,
      firstHuskTwentieth: first.huskTwentieth,
      deepGaussOff: deep.gaussOff,
      deepHuskGap: deep.huskGap,
      slowHuskGap: slow.huskGap,
      deepWraps: wraps.deep,
      slowWraps: wraps.slow,
      huskWraps: wraps.husk,
      bareWraps: wraps.bare,
      deepLargestLine: deep.largestLine,
      deepLargestTurn: deep.largestTurn,
      slowLargestLine: slow.largestLine,
      slowLargestTurn: slow.largestTurn,
      freeShareDeep64: deep64.freeShare,
      seconds: (Date.now() - started) / 1000,
    }

    for (let q = 0; q <= REF; q++) {
      metrics[`deep64_r${q}`] = deep64.profile[q]!
      metrics[`target_r${q}`] = target.profile[q]!
      metrics[`slow64_r${q}`] = slow64.profile[q]!
    }

    return verdict({
      status,
      claim: `E-GRV-0130's held-trio drive on E-GRV-0100's shrinking stack at side ${SIDE} (sides ${stack.sides.join(', ')}; ${stack.docks} docks, ${stack.links} links, ${sf.count} faces; lambda_max ${lambdaStack.toFixed(2)} against the husk's ${lambdaHusk.toFixed(2)}, kappa ${A_STACK}/${Q_STACK}, kappa lambda ${((A_STACK / Q_STACK) * lambdaStack).toFixed(3)}): Q1 stack Gauss off on ${deep.gaussOff} docks (the husk's own divergence off by up to ${deep.huskGap.toFixed(3)} lines, gone down its verticals); Q2 the summed 64-beat mean x(r) - x(8) ${deep64.profile.slice(0, REF).map(f4).join(', ')}, k ${deep64.k.toExponential(4)} against the stack's Poisson k ${target.k.toExponential(4)} (${(deep64.k / target.k).toFixed(3)} of it; 128 beats ${(deep128.k / target.k).toFixed(3)}; the stack Poisson k is ${(target.k / HELM_K_0127).toFixed(4)} of the husk alone's); Q3 the non-gradient energy within ${RADIUS} of the source on the two-beat mean, beats ${LATE_FROM} .. ${BEATS}, ${lateDeepIn.toFixed(3)} against ${s0.deep.restInside.toFixed(3)} at beat 0 (${(lateDeepIn / s0.deep.restInside).toFixed(3)}; first under half at beat ${first.deepHalf}, under a twentieth at ${first.deepTwentieth}), the bulk's ${lateDeepBulk.toFixed(3)} against the ${left.toFixed(3)} that left (${(lateDeepBulk / left).toFixed(3)}), the husk outside ${lateDeepOut.toFixed(3)}; Q4 reversed ${JSON.stringify(reversed)}, wraps ${JSON.stringify(wraps)}; control H (the closed husk, 14/63) k ${husk64.k.toExponential(6)} against ${HUSK_K_0130.toExponential(6)}; control 0 (no move) k ${bare64.k.toExponential(4)}; the husk alone at 10/171 (like for like, reported) k ${slow64.k.toExponential(4)} (${(slow64.k / HELM_K_0127).toFixed(3)} of its Poisson k; 128 beats ${(slow128.k / HELM_K_0127).toFixed(3)}), N_in late ${(late.slowIn / late.beats / s0.slow.restInside).toFixed(3)} of its start`,
      metrics,
      control: { husk: controlH ? 1 : 0, zero: control0 ? 1 : 0 },
      notes: `L2 (Q1, Q4 L1). Gates Q1 ${q1}, Q2 ${q2}, Q3a ${q3a}, Q3b ${q3b}, Q4 ${q4}; control H ${controlH}, control 0 ${control0}, target reproduced ${targetSame} (${target.k}). Start center ${c0}, sink ${sink}. Husk arm (14/63) N_in late ${(late.huskIn / late.beats / s0.husk.restInside).toFixed(3)} of its start, first under half ${first.huskHalf}, twentieth ${first.huskTwentieth}; slow arm first under half ${first.slowHalf}, twentieth ${first.slowTwentieth}. The stack arm's own stack-gradient part reads k ${deepGradient.k.toExponential(6)}. Target profile ${target.profile.slice(0, REF).map(f4).join(', ')}. Timeline: ${timeline.join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
