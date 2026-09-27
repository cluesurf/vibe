// DOES ONE PLAQUETTE MOVE TURN THE TRIO'S ENERGY-LINE TUBE INTO ITS DEPTH (E-GRV-0130)? E-GRV-0127 found the working
// rule's own energy lines keep Gauss exactly on E-SPN-0104's held trio, and that the drift cost's string IS that
// register mod 3; but a love cannot leave its line, so the lines are a tube on the trio's husk line, 98.8 percent
// divergence free, and summing them gives k -0.236 against E-GRV-0119's 0.0307. The hypothesis (note/research/vibe/
// roadmap/remaining-pieces.md, "2, the depth from energy lines", and idea 3c): one local, reversible move that relaxes
// the register's curl and keeps its divergence turns the tube into the 1/r field, so the depth is the energy-line
// register with plaquette dynamics and needs no step register of its own.
//
// THE MOVE, DERIVED BEFORE RUNNING (code/rule/line-plaquette, whose header carries the algebra):
//  - Which move. On each husk triangle, take B units of line once around the face. A face's boundary enters and leaves
//    each corner once, so div C^T B = 0 on integers: Gauss is kept exactly whatever B is (tmp/plaq-probe1.log: 0 on a
//    Weyl B, all 49,152 faces closed). E-GRV-0090's step relaxation is NOT this move: it adds g times a difference of
//    dock rates (a gradient), which changes the divergence and never the curl. The plaquette move is its dual on the
//    other half of the field, and the schedule is the same leapfrog with the same carry:
//        E(t+1) = E(t) + drag(t) + C^T B(t)        B(t+1) = B(t) - (a / q) C M E(t+1),   M = 2 / g
//    in integers (one whole line = q^3 units, the division's remainder carried per face, never dropped), each register
//    in a balanced window of 9 whole lines, a wrap counted. It is a wave (E'' = -kappa C^T C M E on the curl part), not
//    a dissipation, so it runs back bit for bit.
//  - The coupling. kappa = a / q = 14 / 63. The probe gives the symmetric operator's largest eigenvalue 13.59 and the
//    long-wave curl coefficient 0.332 k^2 (the same along axis, face and body to 0.3 percent), so the leapfrog is stable
//    for kappa < 4 / 13.59; kappa 14/63 puts kappa lambda_max at 3.02, a quarter under the limit. Its waves run at c_T =
//    sqrt(0.332 kappa) = 0.272 docks a beat, 0.62 of the light's 0.436 (step-depth's radion): the overcomplete faces
//    (both diagonals on every square) make the operator stiff at short wavelengths, so the curl cannot be run at c.
//  - The static solution. B stops only when C M E = 0 on every face, and the triangles generate every contractible
//    loop, so M E = 2 grad x + h: E = g grad x with div E = the trio's energy, which is exactly the field E-GRV-0090's
//    rule settles to, curl free, its summed potential the Poisson solution. PLUS h, the harmonic part, which no face
//    can change (every face's boundary is contractible): the lines' net winding around the torus is kept by the move.
//    E-GRV-0127's tube winds 1.5 lines (3 units over half the ring), so the relaxed field keeps a uniform tilt. A tilt
//    is odd about the source, so shell means about the source cancel it on every shell short of the torus's seam, and
//    it enters x(r) - x(8) as a constant: it moves a, not k.
//  - The integer register against mod 3. Carried as integers, the register holds the tube's 3 lines from the trio to
//    the sink and the move relaxes them into the monopole field of 3 units. Carried mod 3 (the drift cost's string,
//    balanced in {-1, 0, 1}), 3 lines are 0: the tube from the trio to the sink is invisible, and the string's
//    divergence along the ring is +1, -2, +1 at the three loves (the lines run 0, 1, 2 = -1, 3 = 0): the trio is Z3
//    neutral, a quadrupole, with no monopole. So the move on the mod-3 register relaxes the confining string between
//    the loves into a short-range field, and cannot give a 1/r depth at all. The depth needs the integer register,
//    which E-GRV-0127 found splits histories the mod-3 register merges (cut sectors six apart, 3.4e-7 by beat 128).
//    And carried per entry, a plaquette register would record each entry's history (B integrates E), so entries that
//    now merge would stop interfering: a which-path record. Here the field is not felt by the trio (as in E-GRV-0119
//    and 0127: the depth is read, never acted on), so the expected field is the rule driven by the expected drag, and
//    that is what is run (code/measure/line-plaquette: the drag rounded to a register unit, its rounding carried).
//
// THE RUN. E-GRV-0127's source exactly (side 16, box-12 level, P 40, the parallel placement, the working split meeting,
// cost and sign), 128 beats of the sectored ring form, its expected lines cast to the husk each beat and fed to three
// arms on one face set: MOVING (the integer register with the move), BARE (the same drag, no face ever turns: the
// control), and MOD 3 (the expected balanced string with the move, windows of 3 whole lines). E-GRV-0107's seeded pair
// for 64 beats, its integer lines fed to a fourth arm with the move.
//
// GATES, fixed before the first run of this file.
//  P1 Gauss exact: on every beat and dock, div E equals div of the bare drag exactly (integers) on the integer arms,
//     and modulo its window (3 whole lines) on the mod-3 arm, whose wraps are its mod-3 arithmetic;
//     and through every husk ball r = 0 .. 7 about the source (the sink's balls skipped) the moving arm's outflow equals
//     the expected energy inside within 1 percent of it, or 1e-5 where the ball holds none (half a register unit on the
//     ring's links).
//  P2 the depth: the moving arm's husk lines averaged over beats 1 .. 64 and SUMMED (E-GRV-0127's depthReading, the
//     shell profile x(r) - x(8), a + k / r on r = 2 .. 6) give k within 5 percent of 0.03072 (energy / 3).
//  P3 the curl leaves the source: the curl energy sum (C M E)^2 over faces within husk distance 3 of the source, read
//     on the two-beat mean of E (the loves alternate docks each beat; that period-2 current is at the lattice's highest
//     frequency, above the curl wave's band, top 2 asin(sqrt(3.02) / 2) = 2.12 rad a beat, so no move can carry it off),
//     averaged over beats 97 .. 128, is at most 0.25 of its beat-0 value (the bare tube). The curl energy, the
//     non-gradient field energy and the curl's mean radius are reported over time, and the per-beat curl beside it.
//  P4 exact: every arm runs back to its start bit for bit, with 0 wraps of lines or turns on the integer arms (the
//     mod-3 arm's wraps are reported).
//  CONTROL 0: the bare arm (no move) gives E-GRV-0127's k -0.2363518 within 1e-3 of it.
//  CONTROL-: E-GRV-0107's spreading pair, with the move, must MISS P2 (its target scaled to energy 2).
//  Verdict: partial if a control fails; pass if P1 .. P4 hold; fail otherwise.
// PREDICTED: P1 and P4 hold (algebra and construction). P2 FAILS narrowly even if the move relaxes the curl
// perfectly: the relaxed field is the lines' own divergence-fixed part, which E-GRV-0127 read at k 0.03254, 5.9
// percent above 0.03072 (the tube ends on a point sink at husk distance 8; E-GRV-0119's solve used a uniform
// background), and the 64-beat average keeps a residue of the slowest curl modes (period 2 pi / (0.272 x 2 pi / 16) =
// 59 beats), of unknown sign. So the sharper reading, reported beside P2 and gating nothing: k against 0.03254, and
// the average's divergence-free share against E-GRV-0127's 98.8 percent. P3 holds (the tube's curl radiates into the
// whole torus; the ball is 3 percent of it). The mod-3 arm reads |k| well under the target (no monopole). Idea 3c: the
// move does not bend the string, it spreads it: the largest line off the husk line stays well under one whole line.
// Controls hold (the bare arm is E-GRV-0127's lines to a register unit; the pair's divergence-fixed k is -0.0274).
//
// FIRST RUN (tmp/plaq-run1.log, 67 s, the record; tmp/plaq-run2.log reruns it with per-arm tallies added, every gate
// number identical): fail on P1, P2 and P4; P3 and both controls hold; no gate moved.
//  - P1 and P4 fail ONLY on the pair control's arm: E-GRV-0107's bulk lines summed over a husk column reach 8 lines on
//    one husk link (its beat-0 lines are trits, then the pair's light-speed tails pile up), past the 9-line window, so
//    that arm wraps 5,697 times and its Gauss breaks on 2,834 docks. The trio's arms: 0 wraps, div E equal to the bare
//    drag's on every dock and beat (0 off), balls within 3.8e-6 (quantization), the largest line 3.40 and turn 0.67
//    whole lines. Every arm, the wrapped pair included, runs back bit for bit. The window was fixed for the trio's tube
//    and never checked against the control's drive: a design error, recorded, the gates unchanged.
//  - P2: the move relaxes the curl but too slowly for the window. The 64-beat mean's divergence-free share falls from
//    the bare 98.8 to 22.3 percent; its summed depth x(r) - x(8) 0.0414, 0.0108, 0.0037, 0.0021, 0.0015, 0.0020,
//    0.0016, 0.0003 gives k 0.00615 (0.19 of the lines' own Poisson k 0.03254); over 128 beats k 0.0241 (0.74). The
//    wave does not dissipate: the field's energy stays 16 to 19 against its gradient part's 0.26 to 0.34, so the curl
//    leaves the source but never the torus, and a time average only converges as the slow modes average out.
//  - P3: holds. The two-beat mean's curl within 3 of the source over beats 97 .. 128 is 0.033 of the tube's (7.96
//    against 240.9; per beat 34.0, the period-2 current). The non-gradient energy inside the ball falls 7.41, 9.32
//    (beat 8), 6.65, 3.20, 1.41 (64), 1.05, 1.27 (128). The curl's mean radius grows 3.83, 3.66, 4.24, 5.14, 7.38 at beats
//    0, 8, 16, 32, 64: about 0.06 docks a beat after beat 16, well under c_T 0.27. That is a mean over a torus it fills,
//    not a front, so it is no reading of the speed.
//  - Controls: the bare arm gives k -0.2363519 (E-GRV-0127's to 1e-7). The pair with the move reads k 0.321 against
//    0.0205 and misses, but its register wrapped, so this control is weaker than intended.
//  - Mod 3 (the drift string): 0 wraps, Gauss mod 3 exact; k -0.00138 and profile under 0.014: no monopole, as derived
//    (the trio is Z3 neutral).
//  - Idea 3c: the move does not bend the string. It spreads it. The share of field energy on the trio's husk line falls
//    1.000, 0.449, 0.074, 0.049, 0.028 at beats 0, 8, 16, 32, 64; the largest line off the line is 0.24 of a whole line
//    on the 64-beat mean (per beat at most 0.81); the mod-3 string's off-line lines stay under 0.30 and 0.02 on the
//    mean. No whole unit ever leaves the line: a bent string would carry one.
//  WHAT IT MEANS: the plaquette move keeps Gauss exactly, runs back exactly, and does relax the tube's curl: the 64-beat
//  field goes from 98.8 to 22.3 percent curl, the near-source curl to 3 percent. But as a reversible wave it only
//  MOVES the curl around a closed torus, so the depth is reached only as a long time average (k 0.19, then 0.74, of the
//  Poisson value at 64 and 128 beats). It gives the depth only on the integer register (mod 3 gives none), and it turns
//  a string into a spread field rather than bending it. Title written after the run.
//
// Depth L2 (P1, P4 L1). DETERMINISM: no random numbers. NOTHING MOVES: the lines are the rule's drag; each register
// takes its value by the rule. HUSK FIRST: every field and depth is read on the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, pathOffset } from '@/code/measure/full-key-paths'
import { d4BoxCell } from '@/code/substrate/d4-box-integer'
import { radionMesh } from '@/code/rule/trit-radion'
import { huskFaces, plaquetteRule } from '@/code/rule/line-plaquette'
import { huskDistances } from '@/code/measure/plaquette-readings'
import { addHuskFlux, bulkLinks, huskCast, lineRunner, routeUnits } from '@/code/measure/energy-lines'
import { lineBasis, lineLightest, wholeBasis, type LineSector } from '@/code/measure/coined-line-bloch'
import { axisRing, blochPacket, fitRing, levelPlacement, ringCenter, ringColumns } from '@/code/measure/held-cluster'
import type { PieceOptions } from '@/code/measure/bound-line'
import { lineGauge, placeCutFramed } from '@/code/measure/permutation-meeting'
import { depthReading, readSectors, ringHuskFlux, ringLinks, sectorBeat, sectorDensity, type DepthReading, type Sectors } from '@/code/measure/trio-energy-lines'
import { armScratch, ballGauss, curlEnergy, expectedString, feedArm, fieldSplit, lineShare, plaquetteArm, reverseArm, wholeLines, type PlaquetteArm } from '@/code/measure/line-plaquette'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const WINDOW = 64
const REF = 8
const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
const TARGET_K = 0.03072
const HELM_K_0127 = 0.03253720396736877
const BARE_K_0127 = -0.2363518447458349
const G2_TOLERANCE = 0.05
const BARE_TOLERANCE = 1e-3
const P1_RELATIVE = 0.01
const P1_FLOOR = 1e-5
const P3_RADIUS = 3
const P3_RATIO = 0.25
const P3_FROM = 97
const BALL_TOP = 7
const PAIR_ENERGY = 2
// kappa = A / Q (the probe: kappa lambda_max 3.02), one whole line Q^LEVELS units, windows of WHOLE whole lines
const A = 14
const Q = 63
const LEVELS = 3
const WHOLE = 9
const WHOLE_MOD3 = 3
const REPORT = [0, 1, 8, 16, 32, 64, 96, 128]

export default experiment({
  id: 'gravity/trio-line-plaquette-depth',
  code: 'E-GRV-0130',
  title:
    "one plaquette move on the held trio's energy lines keeps Gauss exactly and relaxes their curl, but as a reversible wave it reaches the depth only slowly, fail on P2 (and on P1 and P4 through the pair control's window): on E-GRV-0127's source with kappa 14/63 the trio's arms keep div E equal to the bare drag's on every dock and beat, never wrap and run back bit for bit, and the curl near the source falls to 0.033 of the tube's; the 64-beat field drops from 98.8 to 22.3 percent divergence free, but its summed depth gives k 0.0062 against 0.0307 (0.19 of the lines' own Poisson k 0.0325; 0.74 over 128 beats), because the wave moves its curl around the torus without losing it; the drift string carried mod 3 gives no monopole (k -0.0014, the trio is Z3 neutral); the move spreads a string instead of bending it (on-line share 1.00 to 0.03, no line over 0.81 off the line); the bare arm reproduces k -0.2364 and the spreading pair misses (0.321), but its husk lines reach 8 and wrap the 9-line window, which breaks Gauss on that control's arm",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const sector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: BOX, unit: 0 }
    const basis = lineBasis(sector)
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)

    // ---- the side-16 source, as E-GRV-0127 ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const mesh = radionMesh([SIDE, SIDE, SIDE])
    const faces = huskFaces(mesh)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const gauge = lineGauge(f.tables, ring)
    const fit = fitRing(placed, L)
    const links = ringLinks(f.tables, ring)
    const cast = huskCast(bulkLinks(f.tables), husk)
    const c0 = Math.round(ringCenter(blochPacket(basis, L, level.cre, level.cim, true).density())) % L
    const col = husk.column[ring.docks[c0] as number] as number
    const sink = (c0 + L / 2) % L
    const sinkCol = husk.column[ring.docks[sink] as number] as number
    const dist = huskDistances(SIDE, col)
    const onLine = new Set<number>(Array.from(links.bulk, b => cast.link[b] as number))
    const options: PieceOptions = { cost: true, sign: true, unit: 0, flat: false }
    let sectors: Sectors = new Map([[0, placeCutFramed(gauge, fit.kept, P, 'parallel')]])
    const r0 = readSectors(L, sink, sectors, false)
    const lines = Float64Array.from(r0.gauss)
    const toHusk = (ringField: Float64Array): Float64Array => {
      const out = new Float64Array(husk.columns * 9)

      ringHuskFlux(links, cast, ringField, out)

      return out
    }

    const rule = plaquetteRule(A, Q, LEVELS, WHOLE)
    const rule3 = plaquetteRule(A, Q, LEVELS, WHOLE_MOD3)
    const moving = plaquetteArm(mesh, faces, rule, toHusk(lines), true)
    const bare = plaquetteArm(mesh, faces, rule, toHusk(lines), false)
    const mod3 = plaquetteArm(mesh, faces, rule3, toHusk(expectedString(L, sink, sectors)), true)
    const scratch = armScratch(mesh, faces)
    const arms: [string, PlaquetteArm][] = [
      ['moving', moving],
      ['bare', bare],
      ['mod3', mod3],
    ]
    const sums = new Map(arms.map(([n]) => [n, { s64: new Float64Array(husk.columns * 9), s128: new Float64Array(husk.columns * 9) }]))
    const curlNow = new Float64Array(faces.count)
    const curlPrev = new Float64Array(faces.count)
    const curlMean = new Float64Array(faces.count)
    const sumDensity64 = new Float64Array(L)
    let movingLargestLine = 0
    let movingLargestTurn = 0
    const inBall = (c: Float64Array): number => {
      let s = 0

      for (let q = 0; q < faces.count; q++) if ((dist[faces.dock[q] as number] as number) <= P3_RADIUS) s += (c[q] as number) ** 2

      return s
    }
    const e0 = curlEnergy(faces, wholeLines(moving), dist, P3_RADIUS, curlPrev)
    const e30 = curlEnergy(faces, wholeLines(mod3), dist, P3_RADIUS, new Float64Array(faces.count))
    const p3Base = e0.inside
    let p3Late = 0
    let p3LateBeat = 0
    let p3Beats = 0
    let p1BallGap = 0
    let p1BallRel = 0
    let p1BallOff = 0
    const timeline: string[] = []
    const report = (t: number): void => {
      const wm = wholeLines(moving)
      const w3 = wholeLines(mod3)
      const sm = fieldSplit(mesh, SIDE, wm, dist, P3_RADIUS)
      const s3 = fieldSplit(mesh, SIDE, w3, dist, P3_RADIUS)
      const cm = curlEnergy(faces, wm, dist, P3_RADIUS, new Float64Array(faces.count))
      const c3 = curlEnergy(faces, w3, dist, P3_RADIUS, new Float64Array(faces.count))
      const lm = lineShare(wm, onLine)
      const l3 = lineShare(w3, onLine)

      timeline.push(
        `t${t}: moving curl in ${cm.inside.toFixed(3)} all ${cm.total.toFixed(3)} r_mean ${cm.meanRadius.toFixed(2)}, energy ${sm.energy.toFixed(4)} gradient ${sm.gradient.toFixed(4)} rest ${sm.rest.toFixed(4)} (inside ${sm.restInside.toFixed(4)}), on-line share ${lm.onShare.toFixed(3)} max on ${lm.onMax.toFixed(3)} off ${lm.offMax.toFixed(3)}; mod3 curl in ${c3.inside.toFixed(3)} all ${c3.total.toFixed(3)}, energy ${s3.energy.toFixed(4)} gradient ${s3.gradient.toFixed(4)}, on-line share ${l3.onShare.toFixed(3)} max on ${l3.onMax.toFixed(3)} off ${l3.offMax.toFixed(3)}`,
      )
    }

    report(0)

    for (let t = 1; t <= BEATS; t++) {
      sectors = sectorBeat(options, f.tables, ring, sectors)

      const r = readSectors(L, sink, sectors, true)

      for (let k = 0; k < L; k++) lines[k]! += r.drag[k] as number

      const target = toHusk(lines)

      feedArm(mesh, faces, moving, target, scratch)
      feedArm(mesh, faces, bare, target, scratch)
      feedArm(mesh, faces, mod3, toHusk(expectedString(L, sink, sectors)), scratch)

      // P1's balls
      const dens = sectorDensity(L, sectors)
      const content = ringColumns(husk, ring, dens)

      if (t <= WINDOW) for (let x = 0; x < L; x++) sumDensity64[x]! += dens[x] as number
      content[sinkCol]! -= 3

      const wm = wholeLines(moving)

      for (const v of wm) movingLargestLine = Math.max(movingLargestLine, Math.abs(v))
      for (const v of moving.state.face) movingLargestTurn = Math.max(movingLargestTurn, Math.abs(v) / rule.unit)

      const bg =ballGauss(mesh, wm, content, dist, sinkCol, BALL_TOP, P1_RELATIVE, P1_FLOOR)

      p1BallGap = Math.max(p1BallGap, bg.gap)
      p1BallRel = Math.max(p1BallRel, bg.relative)
      p1BallOff += bg.off

      // P3: the two-beat mean's curl near the source
      curlEnergy(faces, wm, dist, P3_RADIUS, curlNow)
      for (let q = 0; q < faces.count; q++) curlMean[q] = ((curlNow[q] as number) + (curlPrev[q] as number)) / 2
      if (t >= P3_FROM) {
        p3Late += inBall(curlMean)
        p3LateBeat += inBall(curlNow)
        p3Beats++
      }
      curlPrev.set(curlNow)

      for (const [n, arm] of arms) {
        const w = wholeLines(arm)
        const s = sums.get(n)!

        for (let l = 0; l < w.length; l++) {
          if (t <= WINDOW) s.s64[l]! += w[l] as number
          s.s128[l]! += w[l] as number
        }
      }

      if (REPORT.includes(t)) report(t)
    }

    const avg = (n: string, beats: number): Float64Array => Float64Array.from(beats === WINDOW ? sums.get(n)!.s64 : sums.get(n)!.s128, v => v / beats)
    const readM64 = depthReading(SIDE, col, avg('moving', WINDOW), REF, FIT_R)
    const readM128 = depthReading(SIDE, col, avg('moving', BEATS), REF, FIT_R)
    const readB64 = depthReading(SIDE, col, avg('bare', WINDOW), REF, FIT_R)
    const read364 = depthReading(SIDE, col, avg('mod3', WINDOW), REF, FIT_R)
    const avgLine = lineShare(avg('moving', WINDOW), onLine)
    const avgLine3 = lineShare(avg('mod3', WINDOW), onLine)
    const energy = sumDensity64.reduce((s, v) => s + v, 0) / WINDOW
    const target = (TARGET_K * energy) / 3
    const within = (d: DepthReading, k: number): boolean => Math.abs(d.k / k - 1) <= G2_TOLERANCE

    // ---- CONTROL-: E-GRV-0107's seeded pair, its dragged lines in the bulk, with the move ----
    const anti = d4BoxCell({ coordinates: [0, 0, 0, 0], side: SIDE })
    const blinks = bulkLinks(f.tables)
    const vacuum = wordVacuum(f, f.store)
    const seeded = cloneConfiguration(vacuum)

    seeded.vibe[center * 24 + 6] = 1
    seeded.open[center * 24 + 6] = 1
    seeded.vibe[center * 24 + 8] = -1
    seeded.open[center * 24 + 8] = 1

    const placedLines = new Int32Array(f.cells * 12)

    routeUnits(blinks, placedLines, center, anti, PAIR_ENERGY)

    const key = fullPathKey(pathOffset(0))
    const va = lineRunner(f.tables, vacuum, new Int32Array(f.cells * 12), key)
    const sb = lineRunner(f.tables, seeded, placedLines, key)
    const pairField = (): Float64Array => {
      const out = new Float64Array(husk.columns * 9)

      addHuskFlux(cast, sb.line, out, 1)
      addHuskFlux(cast, va.line, out, -1)

      return out
    }
    const pairStart = pairField()
    const pair = plaquetteArm(mesh, faces, rule, pairStart, true)
    const pairSum = new Float64Array(husk.columns * 9)
    let pairLargestTarget = 0

    for (let t = 1; t <= WINDOW; t++) {
      va.beat()
      sb.beat()

      const pf = pairField()

      for (const v of pf) pairLargestTarget = Math.max(pairLargestTarget, Math.abs(v))
      feedArm(mesh, faces, pair, pf, scratch)

      const w = wholeLines(pair)

      for (let l = 0; l < w.length; l++) pairSum[l]! += (w[l] as number) / WINDOW
    }

    const pairCol = husk.column[center] as number
    const readPair = depthReading(SIDE, pairCol, pairSum, REF, FIT_R)
    const controlMinus = !within(readPair, (TARGET_K * PAIR_ENERGY) / 3)
    const control0 = Math.abs(readB64.k / BARE_K_0127 - 1) <= BARE_TOLERANCE

    // ---- P4: every arm back to its start ----
    const reversed = { moving: reverseArm(faces, moving, scratch), bare: reverseArm(faces, bare, scratch), mod3: reverseArm(faces, mod3, scratch), pair: reverseArm(faces, pair, scratch) }
    const integerArms = [moving, bare, pair]
    const wraps = integerArms.reduce((s, a) => s + a.tally.lineWraps + a.tally.faceWraps, 0)
    const mod3Wraps = mod3.tally.lineWraps + mod3.tally.faceWraps

    // ---- the gates ----
    const gaussOff = integerArms.reduce((s, a) => s + a.gaussOff, 0) + mod3.gaussOffWindow
    const p1 = gaussOff === 0 && p1BallOff === 0
    const p2 = within(readM64, target)
    const p3Mean = p3Late / p3Beats
    const p3PerBeat = p3LateBeat / p3Beats
    const p3 = p3Mean <= P3_RATIO * p3Base
    const p4 = reversed.moving && reversed.bare && reversed.mod3 && reversed.pair && wraps === 0
    const status = !(control0 && controlMinus) ? 'partial' : p1 && p2 && p3 && p4 ? 'pass' : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_P1: p1 ? 1 : 0,
      gate_P2: p2 ? 1 : 0,
      gate_P3: p3 ? 1 : 0,
      gate_P4: p4 ? 1 : 0,
      control0: control0 ? 1 : 0,
      controlMinus: controlMinus ? 1 : 0,
      energy,
      targetK: target,
      k64: readM64.k,
      k128: readM128.k,
      kOverHelm0127: readM64.k / HELM_K_0127,
      helmK64: readM64.helmK,
      freeShare64: readM64.freeShare,
      curl64: readM64.curl,
      bareK64: readB64.k,
      bareFreeShare64: readB64.freeShare,
      mod3K64: read364.k,
      mod3HelmK64: read364.helmK,
      mod3FreeShare64: read364.freeShare,
      pairK: readPair.k,
      pairHelmK: readPair.helmK,
      gaussOff,
      ballGap: p1BallGap,
      ballRelative: p1BallRel,
      ballOff: p1BallOff,
      p3Base,
      p3Mean,
      p3PerBeat,
      p3Ratio: p3Mean / p3Base,
      mod3CurlBase: e30.inside,
      wraps,
      lineWraps: integerArms.reduce((s, a) => s + a.tally.lineWraps, 0),
      faceWraps: integerArms.reduce((s, a) => s + a.tally.faceWraps, 0),
      mod3Wraps,
      mod3GaussOffExact: mod3.gaussOff,
      movingWraps: moving.tally.lineWraps + moving.tally.faceWraps,
      bareWraps: bare.tally.lineWraps + bare.tally.faceWraps,
      pairWraps: pair.tally.lineWraps + pair.tally.faceWraps,
      movingGaussOff: moving.gaussOff,
      pairGaussOff: pair.gaussOff,
      pairLargestTarget,
      movingLargestLine,
      movingLargestTurn,
      pairStartLargest: Math.max(...pairStart.map(Math.abs)),
      avgOnShare: avgLine.onShare,
      avgOffMax: avgLine.offMax,
      avgOnShareMod3: avgLine3.onShare,
      avgOffMaxMod3: avgLine3.offMax,
      c0,
      sink,
      sinkDistance: dist[sinkCol] as number,
      seconds: (Date.now() - started) / 1000,
    }

    for (let q = 0; q <= REF; q++) {
      metrics[`moving64_r${q}`] = readM64.profile[q] as number
      metrics[`mod3_64_r${q}`] = read364.profile[q] as number
    }

    return verdict({
      status,
      claim: `E-SPN-0104's held trio's expected energy lines (E-GRV-0127's source, energy ${energy}) fed for ${BEATS} beats to the plaquette move (kappa ${A}/${Q}, one line ${rule.unit} units, windows ${WHOLE} lines): P1 div E against the bare drag off on ${gaussOff} docks over every beat and arm, Gauss through ${BALL_TOP + 1} balls largest gap ${p1BallGap.toExponential(2)}; P2 the summed 64-beat mean x(r) - x(8) ${readM64.profile.slice(0, REF).map(f4).join(', ')}, k ${readM64.k.toExponential(4)} against ${target.toExponential(4)} (${(readM64.k / HELM_K_0127).toFixed(3)} of the lines' own Poisson k 0.03254; divergence-free share ${(100 * readM64.freeShare).toFixed(1)} percent against the bare ${(100 * readB64.freeShare).toFixed(1)}; curl on ${readM64.curl} links; 128 beats k ${readM128.k.toExponential(4)}); P3 curl within ${P3_RADIUS} of the source, two-beat mean over beats ${P3_FROM} .. ${BEATS} ${p3Mean.toFixed(3)} against the tube's ${p3Base.toFixed(3)} (ratio ${(p3Mean / p3Base).toFixed(3)}; per beat ${p3PerBeat.toFixed(3)}); P4 reversed ${Object.values(reversed).every(Boolean)}, wraps ${wraps}; control 0 (no move) k ${readB64.k.toExponential(4)}; control- (the pair, with the move) k ${readPair.k.toExponential(4)} against ${((TARGET_K * PAIR_ENERGY) / 3).toExponential(4)}; mod 3 (the drift string, with the move) k ${read364.k.toExponential(4)}, x(r) - x(8) ${read364.profile.slice(0, REF).map(f4).join(', ')}; idea 3c on the 64-beat mean: on-line share ${avgLine.onShare.toFixed(3)}, largest line off the husk line ${avgLine.offMax.toFixed(3)} (mod 3: ${avgLine3.onShare.toFixed(3)}, ${avgLine3.offMax.toFixed(3)})`,
      metrics,
      control: { zero: control0 ? 1 : 0, minus: controlMinus ? 1 : 0 },
      notes: `L2 (P1, P4 L1). Gates P1 ${p1}, P2 ${p2}, P3 ${p3}, P4 ${p4}; control 0 ${control0}, control- ${controlMinus}. Start center ${c0}, sink ${sink} at husk distance ${dist[sinkCol]}. Pair divergence-fixed k ${readPair.helmK.toExponential(4)}, reversed ${JSON.stringify(reversed)}. Timeline: ${timeline.join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
