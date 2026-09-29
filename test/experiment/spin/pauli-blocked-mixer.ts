// A PAULI-BLOCKED FRAME MIXER ON A FILLED-FRAME VACUUM (E-SPN-0130). note/research/vibe/roadmap/remaining-pieces.md,
// "Six angles on 3d motion" and "A string-gated line mixer (E-SPN-0121)": every line mixer added so far cascades the
// working vacuum, because the vacuum's own vibes pass its gate. THE IDEA (the Dirac sea): a FERMIONIC mixer, second-
// quantized with the knit's fermion sign, leaves a completely filled or completely empty set of modes alone up to a
// phase (its determinant). So on a vacuum whose frames are all full or all empty it would turn matter freely, leave the
// vacuum exactly alone, and have nothing to cascade through: an unpaired vibe inside a full frame is a hole, a genuine
// excitation, not debris.
//
// THE PIECE (code/measure/pauli-mixer): on each frame (four orthogonal lines, eight slots), M = exp(i theta N_u),
// N_u = (1/8) sum_(i,j) c_i^dag c_j, at theta = 2 pi / 3 (the coin's w, E-SPN-0121's angle). On n vibes of one content
// it keeps with (8 - n + n w)/8 or hops one vibe to one empty slot with (w - 1)/8 times hopSign (E-SPN-0103's mode
// order, the rule's liftBranch convention); a full frame takes the phase w; an empty one nothing; a partly filled frame
// of two or more contents is left alone (E-SPN-0096: carrying two contents through a hop is not unitary). On a keyed
// path: 64 - 3 n (8 - n) keep bins, 3 bins a hop, placed first in the beat as in E-SPN-0121.
//
// DERIVED BEFORE THE RUNS.
// (a) THE WORKING VACUUM IS PARTLY FILLED, and its partial frames hold two contents. Condition Z (no single line on any
//     dock, E-SPN-0117) makes every line empty or full, so a frame holds 0, 2, 4, 6 or 8 vibes. Probe (tmp/pauli-probe1-
//     8.log, side 8, 128 beats, path 0): frame-beats by held slots 0 / 2 / 4 / 6 / 8 = 1,212,672 / 61,056 / 124,416 /
//     61,056 / 113,664 of 1,572,864; 246,528 partial (15.7%), 243,357 of them love-and-fear, 3,171 of one content (like
//     pairs); every full frame holds several contents. Recomputed in the run.
// (b) FULL-OR-EMPTY VACUUMS OF THE WORKING BEAT EXIST, and none of them can host a hole the mixer turns.
//     - the EMPTY mesh: stationary (period 1). But it holds no vacuum at all; the mixer on it is E-SPN-0121's stand-in.
//     - the NEUTRAL STORED SEA (every slot held, a love on each first slot and a fear on each second, every store full):
//       the pair move is idle (unmaking needs an empty store, making empty slots), K never fires (no single), B turns
//       every love-fear line, the stream is a bijection: every frame full at every beat, returning at beat 2. Its
//       frames hold love and fear, so a hole's frame (7 vibes, two contents) is where no unitary hop exists.
//     - the LOVE SEA (every slot a love): full at every beat for the same reasons, but the stream's link moves split the
//       points (probe: 12,288 of 12,288 frames of several points by beat 1). A one-content love sea needs a point field
//       that every frame's eight slot moves carry onto itself; on the working weave the fewest inconsistent edges per
//       frame component are about 10,850 of 16,384 (tmp/pauli-probe2-8.log), so none exists. THE PIECE THAT BREAKS
//       IT: the links' grid moves on the points (the piece E-SPN-0103 and 0104 found unbinding clusters).
//     - THE MINIMAL CHANGE: flat links (every move the identity). Then the love sea at point 0 is stationary bit for bit
//       (period 1): no piece changes it (like full lines pass under 'pass', meetings of equal points are a phase, no
//       single, no fear, the stream carries point 0 to point 0). Its frames are full and of one content.
//     What the partial filling carries: the working vacuum's pair move makes and unmakes (its store trits change every
//     beat); the full seas and the empty mesh change 0 store trits and fire K 0 times. Read in the run. The drift cost's
//     flux sees a love sea as nothing: at every link the first slot arriving writes -1 and the second slot leaving +1.
// (c) THE PIECE IS EXACT, UNITARY, REVERSIBLE, AND BLOCKED ON FULL OR EMPTY FRAMES. M = 1 + (e^(i theta) - 1) N_u, and
//     N_u is a projector, so M is unitary with inverse exp(-i theta N_u). On the one-content Fock space of a frame (256
//     occupations) it is read in Z[w]/8 and checked exactly: M^dag M = I, M(-theta) M(theta) = I, the full frame's
//     column is w alone, the empty frame's 1 alone, and M = (1 + w)/2 + (1 - w)/2 Gamma(G) with Gamma(G) the rule's own
//     liftBranch on every occupation. The gate (one content, or full) is kept by every hop, so the piece is a
//     controlled unitary. The lone hole: on 7 vibes of one content M is w conj(M_theta) on the hole, the particle-hole
//     image, so a hole walks its frame as a vibe does.
// (d) NO CASCADE ON A FLAT LOVE SEA, BY COUNTING. Every difference from the sea is a hole, a fear or a store. Every
//     piece keeps L + F + 2S and L - F (charge), so F + S and H - 2S are constant: the number of differences is at most
//     H0 + 3 (F0 + S0) forever. K on a dock of the sea permutes identical loves and moves nothing visible, and the mixer
//     on a full frame is a phase. The same count bounds the empty mesh (its differences are the vibes). So Q2 holds by
//     proof; the run confirms it.
// (e) THE LONE EXCITATION'S BAND, derived. A lone vibe keeps its frame (the mixer and the coin act inside it, the
//     stream keeps slots), so its beat is the 8 x 8 U(K) = S(K) C M. At K = 0 the four line-symmetric states sit at 0
//     (the coin's 1), the four antisymmetric at 2 pi / 3 (its w), and M moves the uniform state to theta: a 3-fold edge
//     at 0. To second order the edge is c (K . r_l)^2 on line l's symmetric state (c one line's curvature), projected
//     orthogonal to the uniform state: H_eff = c P diag((K . r_l)^2) P. So the edge's mean curvature is
//     tr D / 4 = c |K|^2 / 2 for any K (the frame is an orthogonal basis): ISOTROPIC in 4d, and the same mean as the four
//     unmixed lineons, which is 1/4 of one line's curvature along its line (E-SPN-0121's S4 prediction). The difference
//     is the branches: at theta = 0 each branch is one line's state (a lineon, its curvature rank 1); at theta = 2 pi/3
//     along a husk axis the branches are 2c, c, 0 with eigenvectors spread over 2 and 4 lines. By particle-hole the
//     hole's band is the vibe's reflected.
//
// GATES, fixed before the gated run.
//  SW the working beat hosts a sea that turns matter: on some full-at-every-beat sea of the working weave (the love sea,
//     the neutral stored sea), a lone hole's frame is one content (so the mixer acts on it) on at least half of 128
//     beats, on 4 of 4 paths.
//  Q1 the filled-frame vacuum is unchanged under the rule plus the mixer: the flat love sea (side 8, 128 beats, 4 paths)
//     differs from its start at 0 readings on every beat and the mixer moves nothing; exactly, the superposed rule
//     (code/rule/coined-locked-knit coinedVetoBeat after the piece) keeps it one branch of amplitude 1 for 4 beats; and
//     on the working weave the love sea and the neutral stored sea with the mixer equal the rule without it bit for bit.
//  Q2 no cascade: on the flat love sea a lone hole and a hole with a fear at Y = X + (1,1,0,0), and on the empty mesh a
//     lone love and the love-fear meson of E-SPN-0121, each on 8 paths (side 8, 128 beats, the Born threshold): the wake
//     grows under 10% from beat 64 to 128 AND the footprint at 128 is under half the box.
//  Q3a the lone excitation holds and turns: on every lone track of Q2 the run differs from its vacuum at exactly one
//     reading on every beat (tail 0); and its band edge has a curving branch (at least a tenth of the unmixed mean
//     curvature), not degenerate with another, whose eigenvector spreads over two or more lines (its largest weight on
//     one line at most 0.99; a lineon's is 1), along husk directions spanning at least 2
//     dimensions; the exact Bloch edge agrees with the derived H_eff to 1e-6. Report the edge's mean inverse mass tensor
//     (4 x 4) and its isotropy, and the branches.
//  Q3b a string-bound composite holds (tail at most 1e-3): NOT COMPUTED here. The empty mesh with this piece is
//     E-SPN-0121's stand-in (its lone-frame mixer and this one agree wherever the pair is on two docks), whose window
//     could not decide it (0.035 of the weight kept at beat 24, E-SPN-0121, E-SPN-0128). Reported, undecided.
// CONTROLS (a failed control makes the verdict partial).
//  C1 on the working, partly filled vacuum the same piece cascades: the vacuum itself leaves the mixerless vacuum (its
//     one-content partial frames are like pairs), and the meson against that vacuum covers at least half the box by beat
//     128 on 4 of 4 paths (E-SPN-0121's cascade, and E-SPN-0097's).
//  C2 theta = 0 gives the lineon: with the piece off, the flat hole and the empty love touch exactly 1 mesh line on 4 of 4
//     paths, and the track equals keyedRunner bit for bit (the flat hole, path 0).
//  C3 the non-fermionic mixer (no signs): on a full frame its column is the signed one's (blocked too: no slot is
//     empty), but it is not unitary on 2 to 7 vibes, the hole's 7 included, so it cannot move a hole.
// CHECKS: the keyed piece applied twice returns the configuration on every beat of every lone track (n = 1 and 7 are
// involutions); the hole in a flat side-4 sea run exactly for 3 superposed beats keeps its norm and runs back to the
// start as one branch of amplitude 1.
// Verdict: partial if a control or check fails; fail if SW, Q1, Q2 or Q3a fails; otherwise open (Q3b undecided).
// PREDICTED: fail on SW, with Q1, Q2 and Q3a passing on the flat-link sea and the empty mesh.
// PROBES, disclosed (instrument only): tmp/pauli-probe1-8.log (the census), tmp/pauli-probe2-8.log (no point field on
// the working weave), tmp/pauli-probe3.log (the Fock checks, the band, one track per start: the flat hole touches 38
// mesh lines, the empty love the same 38, the working-weave hole 1; the working vacuum with the piece fires K 247,501
// times in 128 beats and the meson fills 4,096 docks).
// FIRST RUN (tmp/pauli-exp-run1.log, 118 s): FAIL on SW alone, as derived; every control and check passes.
//  - SW fails: on the working weave a hole in the love sea sits in a one-content frame on 1 to 2 of 128 beats (the
//    links split the points after beat 0) and in the neutral stored sea on 0; it touches 1 mesh line on 4 of 4 paths.
//  - Census: the working vacuum's frames 0/2/4/6/8 held on 1,212,672 / 61,056 / 124,416 / 61,056 / 113,664 frame-beats
//    (0 odd), 3,171 partial frames of one content, 0 full frames of one content, 1,242,624 store trits changed; the
//    empty mesh returns at beat 1, the stored sea at 2 (0 store changes), the bare sea alternates full and empty, the
//    love sea stays full but never returns on the working weave and returns at beat 1 on flat links; K 0 on every sea;
//    point field defects 10,820 to 10,870 per frame component on the working weave, 0 on flat links.
//  - Fock: M^dag M and M(-theta) M(theta) off the identity at 0 of the one-content entries, full column w, empty 1,
//    equal to (1 + w)/2 + (1 - w)/2 liftBranch on 3,840 of 3,840 entries; unsigned off at 10,248 (n = 2 to 7), two
//    contents off at 373,856 (n = 2 to 7).
//  - Q1: the flat love sea blocked on 1,572,864 frame-beats a path, 0 moves, 0 readings off; exact for 4 beats (one
//    branch, amplitude 1); on the working weave both full seas equal the rule without the piece bit for bit.
//  - Q2: footprint at most 1 (hole, love), 2 (meson), 4 (hole and fear, wake 4); growth 0 on every path.
//  - Q3a: every lone track differs from its vacuum at exactly 1 reading every beat; the hole and the love touch the same
//    30 to 39 mesh lines (mean 34.5, 55 docks) against 1 line and 8 docks at theta 0; the edge's branches along e1, e2,
//    e3 are -0.5774, -0.2887, 0 (line weights 0.50, 0.25, 0.50), along e12 (a line) -0.8660, 0, 0, along e13 and e23
//    three at -0.2887; spread directions of rank 3 (theta 0: 0); the derived form agrees to 6e-9; the mean inverse mass
//    tensor is -0.288675 I on all four axes (isotropy 1 to 3e-9), 1/4 of one line's -1.154701.
//  - C1: the working vacuum with the piece leaves the mixerless one on 4,094 of 4,096 docks (154,137 moves, K 247,501
//    firings); the meson fills 4,096 of 4,096 on 4 of 4 paths. C2: theta 0 touches 1 line, keyedRunner bit for bit.
//  - Checks: 0 reversal slots off, 0 non-involutive gated frames on lone tracks; the exact side-4 hole keeps its norm
//    over 3 beats (232 branches) and runs back to its start as one branch of amplitude 1.
// Title written after the run.
//
// Depth L1 (exact on the rule's integer paths and in Z[w], derived) for Q1, Q2, SW and the Fock checks; L2 for the band
// (the Dirac sea and a Grover-coined walk, known constructions). DETERMINISM: no random numbers; the key is integer
// arithmetic and every start is placed. NOTHING MOVES: the piece hands a vibe to an empty slot of its own frame on its
// own dock; the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import {
  fullPathKey,
  keyedRunner,
  meshLines,
  pathOffset,
} from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { lineFrame } from '@/code/measure/frame-meson'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { symmetricEigen } from '@/code/measure/line-class-metric'
import {
  composeDefects,
  edgeCurvatures,
  edgeForm,
  fermionMixBranch,
  fermionTrack,
  fillingRun,
  fockColumns,
  liftAgreement,
  neutralSea,
  placeInSea,
  pointFieldDefects,
  productDefects,
  seaConfiguration,
  type FermionTrack,
} from '@/code/measure/pauli-mixer'
import {
  lockedNorm,
  lockedState,
  mergeBranches,
  sameConfiguration,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
} from '@/code/rule/coined-locked-knit'

const SIDE = 8
const SMALL = 4
const BEATS = 128
const PATHS = 8
const FEW = 4
const GROWTH_FROM = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const GATED_SHARE = 0.5
const EXACT_BEATS = 4
const HOLE_BEATS = 3
const CURVE_FRAC = 0.1
const FORM_SAME = 1e-6
const SPREAD = 0.99
const THETA = (2 * Math.PI) / 3

export default experiment({
  id: 'spin/pauli-blocked-mixer',
  code: 'E-SPN-0130',
  title:
    "a fermionic frame mixer is Pauli-blocked on full frames, but no sea of the working beat lets it turn a hole, fail (SW): M = exp(i theta N_u) at theta 2 pi/3 is exact in Z[w]/8, unitary and reversible on one-content frames (0 entries off, equal to (1 + w)/2 + (1 - w)/2 liftBranch on 3,840 of 3,840), w on a full frame and 1 on an empty one, while unsigned it fails on 2 to 7 vibes (10,248 entries) and with two contents too (373,856); the working vacuum is partly filled (side 8, 128 beats: frames holding 2, 4, 6 vibes on 246,528 of 1,572,864 frame-beats, 3,171 of one content) and the piece cascades it (4,094 of 4,096 docks, K 247,501 firings, the meson 4,096 on 4 of 4 paths); the working beat keeps three full-or-empty seas (the empty mesh, a neutral sea with every store full returning at beat 2, a love sea staying full) and the piece leaves each bit for bit, but a hole in a full sea sits in a frame of several contents (love and fear, or loves whose points the links split: no point field fits, 10,820 to 10,870 defects per frame component) on all but 1 or 2 of 128 beats and stays a lineon (1 mesh line); with flat links, the minimal change, the love sea is stationary bit for bit and exactly (one branch of amplitude 1), a hole touches 30 to 39 mesh lines as a vibe on the empty mesh does, a hole and a fear stay within 4 readings, and the edge's mean inverse mass tensor is -0.288675 I in 4d (a quarter of one line's), its branches spread over 2 to 4 lines along directions of rank 3 (0 at theta 0); a string-bound composite is not decided",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const B = rootIndex([1, 1, 0, 0])
    const X = centerOf(SIDE)
    const fr = contactFresh(SIDE, 'pass', X)
    const cells = fr.cells
    const flat = {
      ...fr.tables,
      move: new Int8Array(fr.tables.move.length).map((_, i) => i % 9),
      back: new Int8Array(fr.tables.back.length).map((_, i) => i % 9),
    }
    const lines = meshLines(fr.tables)
    const Y = Math.floor(fr.tables.target[X * 24 + B]! / 24)
    const key0 = fullPathKey(0)
    const vacuum = wordVacuum(fr, fr.store)
    const love = seaConfiguration(cells, 1)
    const empty = seaConfiguration(cells, 0)
    const stored = neutralSea(cells, true)
    const bare = neutralSea(cells, false)

    // ---- (a), (b): the census ----
    const census = {
      working: fillingRun(
        fr.tables,
        vacuum,
        key0,
        THRESHOLD_BORN,
        BEATS,
      ),
      empty: fillingRun(fr.tables, empty, key0, THRESHOLD_BORN, BEATS),
      stored: fillingRun(
        fr.tables,
        stored,
        key0,
        THRESHOLD_BORN,
        BEATS,
      ),
      bare: fillingRun(fr.tables, bare, key0, THRESHOLD_BORN, BEATS),
      loveWorking: fillingRun(
        fr.tables,
        love,
        key0,
        THRESHOLD_BORN,
        BEATS,
      ),
      loveFlat: fillingRun(flat, love, key0, THRESHOLD_BORN, BEATS),
    }
    const fieldWorking = pointFieldDefects(fr.tables).flat()
    const fieldFlat = pointFieldDefects(flat).flat()

    log('census')

    // ---- (c): the Fock checks ----
    const signed = fockColumns({
      contents: 1,
      signed: true,
      adjoint: false,
    })
    const signedBack = fockColumns({
      contents: 1,
      signed: true,
      adjoint: true,
    })
    const unsigned = fockColumns({
      contents: 1,
      signed: false,
      adjoint: false,
    })
    const two = fockColumns({
      contents: 2,
      signed: true,
      adjoint: false,
    })
    const unitary = productDefects(
      signed.columns,
      signed.columns,
      signed.n,
    )
    const reversal = composeDefects(
      signedBack.columns,
      signed.columns,
      signed.n,
    )
    const unsignedDefects = productDefects(
      unsigned.columns,
      unsigned.columns,
      unsigned.n,
    )
    const twoDefects = productDefects(two.columns, two.columns, two.n)
    const lift = liftAgreement()
    const columnIs = (
      col: [number, [number, number]][],
      s: number,
      a: number,
      b: number,
    ): boolean =>
      col.length === 1 &&
      col[0]![0] === s &&
      col[0]![1][0] === a &&
      col[0]![1][1] === b
    const fullPhase = columnIs(signed.columns[255]!, 255, 0, 8)
    const emptyOne = columnIs(signed.columns[0]!, 0, 8, 0)
    const unsignedFullBlocked = columnIs(
      unsigned.columns[255]!,
      255,
      0,
      8,
    )
    const exactPiece =
      unitary.entries === 0 &&
      reversal.entries === 0 &&
      fullPhase &&
      emptyOne &&
      lift.differ === 0

    log('fock')

    // ---- tracks ----
    const track = (
      tables: LockedTables,
      reference: Configuration,
      start: Configuration,
      path: number,
      on: boolean,
      referenceOn?: boolean,
    ): FermionTrack =>
      fermionTrack({
        tables,
        reference,
        start,
        key: fullPathKey(pathOffset(path)),
        threshold: THRESHOLD_BORN,
        beats: BEATS,
        on,
        referenceOn,
        lines,
      })
    const hole = placeInSea(love, [{ dock: X, slot: B, vibe: 0 }])
    const holeFear = placeInSea(love, [
      { dock: X, slot: B, vibe: 0 },
      { dock: Y, slot: B, vibe: -1 },
    ])
    const lone = placeInSea(empty, [{ dock: X, slot: B, vibe: 1 }])
    const meson = placeInSea(empty, [
      { dock: X, slot: B, vibe: 1 },
      { dock: Y, slot: B, vibe: -1 },
    ])
    const paths = Array.from({ length: PATHS }, (_, k) => k)
    const few = Array.from({ length: FEW }, (_, k) => k)

    // Q1
    const seaTracks = few.map(k => track(flat, love, love, k, true))
    const blockedWorking = [
      track(fr.tables, love, love, 0, true, false),
      track(fr.tables, stored, stored, 0, true, false),
    ]

    let exact: LockedState = lockedState(love)
    let exactOk = true

    for (let t = 0; t < EXACT_BEATS; t++) {
      exact = {
        branches: mergeBranches(
          exact.branches.flatMap(b =>
            fermionMixBranch(cells, b, false),
          ),
        ),
      }
      exact = coinedVetoBeat('none', flat, exact, t)

      const b0 = exact.branches[0]

      exactOk =
        exactOk &&
        exact.branches.length === 1 &&
        !!b0 &&
        b0.a === 1n &&
        b0.b === 0n &&
        b0.k === 0 &&
        sameConfiguration(b0, love)
    }

    const Q1 =
      seaTracks.every(
        r =>
          r.wake.every(w => w === 0) &&
          r.referenceDrift === 0 &&
          r.tally.moved === 0,
      ) &&
      exactOk &&
      blockedWorking.every(r => r.wake.every(w => w === 0))

    log('Q1')

    // Q2 and Q3a's hold
    const holes = paths.map(k => track(flat, love, hole, k, true))
    const holeFears = paths.map(k =>
      track(flat, love, holeFear, k, true),
    )
    const loves = paths.map(k => track(fr.tables, empty, lone, k, true))
    const mesons = paths.map(k =>
      track(fr.tables, empty, meson, k, true),
    )
    const twoHoles = [
      track(
        flat,
        love,
        placeInSea(love, [
          { dock: X, slot: B, vibe: 0 },
          { dock: Y, slot: B, vibe: 0 },
        ]),
        0,
        true,
      ),
    ]
    const growthOf = (r: FermionTrack): number =>
      (r.wake[BEATS - 1]! - r.wake[GROWTH_FROM - 1]!) /
      Math.max(1, r.wake[GROWTH_FROM - 1]!)
    const bounded = (r: FermionTrack): boolean =>
      growthOf(r) < GROWTH_LIMIT &&
      r.footprint[BEATS - 1]! < BOX_SHARE * cells
    const Q2 = [...holes, ...holeFears, ...loves, ...mesons].every(
      bounded,
    )

    log('Q2')

    // SW: the working weave's full seas
    const swLove = few.map(k => track(fr.tables, love, hole, k, true))
    const storedHole = placeInSea(stored, [
      { dock: X, slot: B, vibe: 0 },
    ])
    const swStored = few.map(k =>
      track(fr.tables, stored, storedHole, k, true),
    )
    const gatedShare = (r: FermionTrack): number =>
      r.tally.gated / BEATS
    const SW = [swLove, swStored].some(rs =>
      rs.every(r => gatedShare(r) >= GATED_SHARE),
    )

    log('SW')

    // ---- Q3a: the band ----
    const F = lineFrame(B)
    const rB = [1, 1, 0, 0].map(x => x / Math.SQRT2)
    const own = edgeCurvatures(F, rB, 0, 4)
    const lineCurv = own.reduce(
      (m, x) => (Math.abs(x) > Math.abs(m) ? x : m),
      0,
    )
    const c = lineCurv / 4
    const s2 = Math.SQRT1_2
    const husk: [string, number[]][] = [
      ['e1', [1, 0, 0, 0]],
      ['e2', [0, 1, 0, 0]],
      ['e3', [0, 0, 1, 0]],
      ['e12', [s2, s2, 0, 0]],
      ['e13', [s2, 0, s2, 0]],
      ['e23', [0, s2, s2, 0]],
    ]

    let formGap = 0

    const spreadDirs: number[][] = []
    const spreadDirs0: number[][] = []
    const bandRows = husk.map(([name, d]) => {
      const exactMixed = edgeCurvatures(F, d, THETA, 3)
      const exact0 = edgeCurvatures(F, d, 0, 4)
      const form = edgeForm(F, d, c, true)
      const form0 = edgeForm(F, d, c, false)

      exactMixed.forEach(
        (x, i) =>
          (formGap = Math.max(
            formGap,
            Math.abs(x - form.curvatures[i]!),
          )),
      )

      exact0.forEach(
        (x, i) =>
          (formGap = Math.max(
            formGap,
            Math.abs(x - form0.curvatures[i]!),
          )),
      )

      const spreadHere = (f: {
        curvatures: number[]
        lineWeight: number[]
      }): boolean =>
        f.curvatures.some(
          (x, i) =>
            Math.abs(x) >= CURVE_FRAC * Math.abs(c) &&
            f.lineWeight[i]! <= SPREAD &&
            f.curvatures.every(
              (y, j) => j === i || Math.abs(y - x) > FORM_SAME,
            ),
        )

      if (spreadHere(form)) {
        spreadDirs.push(d)
      }

      if (spreadHere(form0)) {
        spreadDirs0.push(d)
      }

      return { name, exactMixed, exact0, lineWeight: form.lineWeight }
    })

    const rankOf = (vs: number[][]): number => {
      if (vs.length === 0) {
        return 0
      }

      const g = vs.map(u =>
        vs.map(v => u.reduce((s, x, k) => s + x * v[k]!, 0)),
      )

      return symmetricEigen(g).values.filter(x => x > 1e-9).length
    }

    const spreadRank = rankOf(spreadDirs)
    const spreadRank0 = rankOf(spreadDirs0)

    // the edge's mean inverse mass tensor, 4 x 4, from the exact band: A_ii along e_i, A_ij from (e_i + e_j)/sqrt 2
    const mean = (d: number[]): number => {
      const x = edgeCurvatures(F, d, THETA, 3)

      return x.reduce((s, v) => s + v, 0) / x.length
    }

    const unit = (i: number): number[] =>
      [0, 1, 2, 3].map(k => (k === i ? 1 : 0))
    const diag = [0, 1, 2, 3].map(i => mean(unit(i)))
    const A = [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j =>
        i === j
          ? diag[i]!
          : mean([0, 1, 2, 3].map(k => (k === i || k === j ? s2 : 0))) -
            (diag[i]! + diag[j]!) / 2,
      ),
    )
    const aValues = symmetricEigen(A).values
    const isotropy =
      Math.min(...aValues.map(Math.abs)) /
      Math.max(...aValues.map(Math.abs))
    const loneHeld = [...holes, ...loves].every(r =>
      r.wake.every(w => w === 1),
    )
    const Q3a = loneHeld && spreadRank >= 2 && formGap <= FORM_SAME

    log('band')

    // ---- controls ----
    const vacuumMixed = track(fr.tables, vacuum, vacuum, 0, true, false)
    const cascades = few.map(k =>
      track(
        fr.tables,
        vacuum,
        placeVibes(vacuum, [
          { dock: X, slot: B, vibe: 1 },
          { dock: Y, slot: B, vibe: -1 },
        ]),
        k,
        true,
      ),
    )
    const C1 =
      vacuumMixed.footprint[BEATS - 1]! > 0 &&
      cascades.every(r => r.footprint[BEATS - 1]! >= BOX_SHARE * cells)
    const holesOff = few.map(k => track(flat, love, hole, k, false))
    const lovesOff = few.map(k =>
      track(fr.tables, empty, lone, k, false),
    )
    const runner = keyedRunner(flat, hole, {
      key: fullPathKey(pathOffset(0)),
      threshold: THRESHOLD_BORN,
    })

    for (let t = 0; t < BEATS; t++) {
      runner.beat()
    }

    const runnerSame = sameConfiguration(
      runner.state(),
      holesOff[0]!.last,
    )
    const C2 =
      [...holesOff, ...lovesOff].every(r => r.linesTouched === 1) &&
      runnerSame
    const C3 =
      unsignedFullBlocked &&
      unsignedDefects.sectors.includes(7) &&
      unsignedDefects.entries > 0

    log('controls')

    // ---- checks ----
    const loneTracks = [...holes, ...loves, ...holesOff, ...lovesOff]
    const reversalDiffer = loneTracks.reduce(
      (n, r) => n + r.reversalDiffer,
      0,
    )
    const nonInvolutive = loneTracks.reduce(
      (n, r) => n + r.tally.nonInvolutive,
      0,
    )
    const small = contactFresh(SMALL, 'pass', centerOf(SMALL))
    const smallFlat = {
      ...small.tables,
      move: new Int8Array(small.tables.move.length).map(
        (_, i) => i % 9,
      ),
      back: new Int8Array(small.tables.back.length).map(
        (_, i) => i % 9,
      ),
    }
    const smallHole = placeInSea(seaConfiguration(small.cells, 1), [
      { dock: centerOf(SMALL), slot: B, vibe: 0 },
    ])

    let s: LockedState = lockedState(smallHole)
    let normExact = true
    let maxBranches = 0

    for (let t = 0; t < HOLE_BEATS; t++) {
      s = {
        branches: mergeBranches(
          s.branches.flatMap(b =>
            fermionMixBranch(small.cells, b, false),
          ),
        ),
      }
      s = coinedVetoBeat('none', smallFlat, s, t)

      const n = lockedNorm(s)

      normExact = normExact && n.total === n.unit
      maxBranches = Math.max(maxBranches, s.branches.length)
    }

    for (let t = HOLE_BEATS - 1; t >= 0; t--) {
      s = coinedVetoBeatBack('none', smallFlat, s, t)
      s = {
        branches: mergeBranches(
          s.branches.flatMap(b =>
            fermionMixBranch(small.cells, b, true),
          ),
        ),
      }
    }

    const back = s.branches[0] as Branch | undefined
    const backExact =
      s.branches.length === 1 &&
      !!back &&
      back.a === 1n &&
      back.b === 0n &&
      back.k === 0 &&
      sameConfiguration(back, smallHole)
    const checked =
      reversalDiffer === 0 &&
      nonInvolutive === 0 &&
      normExact &&
      backExact &&
      exactPiece

    log('checks')

    // ---- verdict ----
    const controls = C1 && C2 && C3
    const status =
      !controls || !checked
        ? 'partial'
        : !(SW && Q1 && Q2 && Q3a)
          ? 'fail'
          : 'open'
    const meanOf = (xs: number[]): number =>
      xs.reduce((u, v) => u + v, 0) / xs.length
    const at = (r: FermionTrack, key: 'wake' | 'footprint'): string =>
      [8, 16, 32, 64, 128].map(t => r[key][t - 1]).join('/')
    const sumHeld = (h: number[]): number =>
      h.slice(1, 8).reduce((u, v) => u + v, 0)

    const metrics: Record<string, number> = {
      SW: SW ? 1 : 0,
      Q1: Q1 ? 1 : 0,
      Q2: Q2 ? 1 : 0,
      Q3a: Q3a ? 1 : 0,
      Q3b_decided: 0,
      control_C1: C1 ? 1 : 0,
      control_C2: C2 ? 1 : 0,
      control_C3: C3 ? 1 : 0,
      checked: checked ? 1 : 0,
      cells,
      workingFrameBeats: census.working.byHeld.reduce(
        (u, v) => u + v,
        0,
      ),
      workingEmpty: census.working.byHeld[0]!,
      workingHeld2: census.working.byHeld[2]!,
      workingHeld4: census.working.byHeld[4]!,
      workingHeld6: census.working.byHeld[6]!,
      workingFull: census.working.byHeld[8]!,
      workingOdd:
        census.working.byHeld[1]! +
        census.working.byHeld[3]! +
        census.working.byHeld[5]! +
        census.working.byHeld[7]!,
      workingPartial: sumHeld(census.working.byHeld),
      workingOneContentPartial: census.working.oneContentPartial,
      workingOneContentFull: census.working.oneContentFull,
      workingStoreChanges: census.working.storeChanges,
      emptyPartial: census.empty.partial,
      emptyReturn: census.empty.returnBeat,
      storedPartial: census.stored.partial,
      storedFull: census.stored.byHeld[8]!,
      storedOneContentFull: census.stored.oneContentFull,
      storedReturn: census.stored.returnBeat,
      storedStoreChanges: census.stored.storeChanges,
      barePartial: census.bare.partial,
      bareFull: census.bare.byHeld[8]!,
      bareEmpty: census.bare.byHeld[0]!,
      loveWorkingPartial: census.loveWorking.partial,
      loveWorkingOneContentFull: census.loveWorking.oneContentFull,
      loveWorkingReturn: census.loveWorking.returnBeat,
      loveFlatPartial: census.loveFlat.partial,
      loveFlatOneContentFull: census.loveFlat.oneContentFull,
      loveFlatReturn: census.loveFlat.returnBeat,
      seasKEvents:
        census.stored.kEvents +
        census.loveWorking.kEvents +
        census.loveFlat.kEvents +
        census.empty.kEvents,
      pointFieldMinWorking: Math.min(...fieldWorking),
      pointFieldMaxWorking: Math.max(...fieldWorking),
      pointFieldFlat: Math.max(...fieldFlat),
      fockUnitaryOff: unitary.entries,
      fockReversalOff: reversal.entries,
      fockUnsignedOff: unsignedDefects.entries,
      fockTwoContentOff: twoDefects.entries,
      liftDiffer: lift.differ,
      liftChecked: lift.checked,
      fullPhase: fullPhase ? 1 : 0,
      seaBlockedFrames: meanOf(seaTracks.map(r => r.tally.blockedFull)),
      seaMoved: seaTracks.reduce((u, r) => u + r.tally.moved, 0),
      exactSea: exactOk ? 1 : 0,
      holeMaxFootprint: Math.max(
        ...holes.map(r => Math.max(...r.footprint)),
      ),
      holeFearMaxFootprint: Math.max(
        ...holeFears.map(r => Math.max(...r.footprint)),
      ),
      holeFearMaxWake: Math.max(
        ...holeFears.map(r => Math.max(...r.wake)),
      ),
      loveMaxFootprint: Math.max(
        ...loves.map(r => Math.max(...r.footprint)),
      ),
      mesonMaxFootprint: Math.max(
        ...mesons.map(r => Math.max(...r.footprint)),
      ),
      twoHolesMaxWake: Math.max(...twoHoles[0]!.wake),
      holeLines: meanOf(holes.map(r => r.linesTouched)),
      holeDocks: meanOf(holes.map(r => r.docksTouched)),
      loveLines: meanOf(loves.map(r => r.linesTouched)),
      loveDocks: meanOf(loves.map(r => r.docksTouched)),
      mesonLines: meanOf(mesons.map(r => r.linesTouched)),
      holeMoves: meanOf(holes.map(r => r.tally.moved)),
      holeLinesOff: meanOf(holesOff.map(r => r.linesTouched)),
      holeDocksOff: meanOf(holesOff.map(r => r.docksTouched)),
      swLoveGatedShare: Math.max(...swLove.map(gatedShare)),
      swLoveLines: Math.max(...swLove.map(r => r.linesTouched)),
      swStoredGatedShare: Math.max(...swStored.map(gatedShare)),
      swStoredLines: Math.max(...swStored.map(r => r.linesTouched)),
      swStoredTwoContent: meanOf(swStored.map(r => r.tally.twoContent)),
      lineCurvature: lineCurv,
      c,
      spreadRank,
      spreadRank0,
      formGap,
      tensorMin: Math.min(...aValues),
      tensorMax: Math.max(...aValues),
      isotropy,
      vacuumMixedFootprint128: vacuumMixed.footprint[BEATS - 1]!,
      vacuumMixedK: vacuumMixed.kEvents,
      vacuumMixedMoves: vacuumMixed.tally.moved,
      cascadeMinFootprint128: Math.min(
        ...cascades.map(r => r.footprint[BEATS - 1]!),
      ),
      runnerSame: runnerSame ? 1 : 0,
      reversalDiffer,
      nonInvolutive,
      holeExactBranches: maxBranches,
      holeExactBack: backExact ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }
    const bandText = bandRows
      .map(
        r =>
          `${r.name}: mixed ${r.exactMixed.map(x => x.toFixed(6)).join(' ')} (line weights ${r.lineWeight.map(x => x.toFixed(3)).join(' ')}), unmixed ${r.exact0.map(x => x.toFixed(6)).join(' ')}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `a fermionic frame mixer (exp(i theta N_u), theta 2 pi/3) is exact and unitary on one-content frames and a phase on full ones, so every full-at-every-beat sea of the working beat stays bit for bit (SW ${SW}: a hole there sits in a frame of several contents, one content on at most ${(Math.max(metrics.swLoveGatedShare!, metrics.swStoredGatedShare!) * 100).toFixed(1)}% of beats, and stays a lineon); with flat links the love sea is stationary bit for bit (Q1 ${Q1}), a hole and a hole-fear pair stay bounded (Q2 ${Q2}, footprint at most ${metrics.holeFearMaxFootprint}), and the hole turns (${metrics.holeLines} mesh lines against 1 at theta 0), with an edge whose mean inverse mass tensor has isotropy ${isotropy.toFixed(6)} (Q3a ${Q3a}); a bound composite is not decided; the partly filled working vacuum cascades under the same piece`,
      metrics,
      control: {
        vacuumMixedFootprint128: metrics.vacuumMixedFootprint128!,
        cascadeMinFootprint128: metrics.cascadeMinFootprint128!,
        holeLinesOff: metrics.holeLinesOff!,
        runnerSame: metrics.runnerSame!,
        fockUnsignedOff: unsignedDefects.entries,
      },
      notes: `L1 (paths, Fock) and L2 (band). Census over ${BEATS} beats of side ${SIDE}: working by held ${census.working.byHeld.join(' ')}, one-content partial ${census.working.oneContentPartial}, store changes ${census.working.storeChanges}; empty partial ${census.empty.partial} return ${census.empty.returnBeat}; stored sea partial ${census.stored.partial} return ${census.stored.returnBeat} store changes ${census.stored.storeChanges}; bare sea by held ${census.bare.byHeld.join(' ')}; love sea working partial ${census.loveWorking.partial} one-content full ${census.loveWorking.oneContentFull} return ${census.loveWorking.returnBeat}; love sea flat one-content full ${census.loveFlat.oneContentFull} return ${census.loveFlat.returnBeat}; K on the seas ${metrics.seasKEvents}. Point field defects per frame component: working ${fieldWorking.join(' ')}, flat ${fieldFlat.join(' ')}. Fock: unitary off ${unitary.entries}, reversal off ${reversal.entries}, unsigned off ${unsignedDefects.entries} (n ${unsignedDefects.sectors.join(',')}), two contents off ${twoDefects.entries} (n ${twoDefects.sectors.join(',')}), lift ${lift.differ} of ${lift.checked}. Q1: sea blocked frames ${metrics.seaBlockedFrames}, moves ${metrics.seaMoved}, exact ${exactOk}, working-weave seas with vs without the piece ${blockedWorking.map(r => Math.max(...r.wake)).join(', ')}. Q2 per path (wake, footprint at 8/16/32/64/128): holes ${holes.map(r => at(r, 'footprint')).join('; ')}; hole+fear ${holeFears.map(r => `${at(r, 'wake')} fp ${at(r, 'footprint')}`).join('; ')}; loves ${loves.map(r => at(r, 'footprint')).join('; ')}; mesons ${mesons.map(r => at(r, 'footprint')).join('; ')}; two holes wake ${at(twoHoles[0]!, 'wake')}. Lines touched: holes ${holes.map(r => r.linesTouched).join(' ')}, loves ${loves.map(r => r.linesTouched).join(' ')}, mesons ${mesons.map(r => r.linesTouched).join(' ')}, off ${holesOff.map(r => r.linesTouched).join(' ')}. SW: love-sea hole gated ${swLove.map(r => r.tally.gated).join(' ')} of ${BEATS}, lines ${swLove.map(r => r.linesTouched).join(' ')}; stored-sea hole gated ${swStored.map(r => r.tally.gated).join(' ')}, lines ${swStored.map(r => r.linesTouched).join(' ')}. Band (curvatures 2 lambda, epsilon = lambda kappa^2; the lineon's own ${lineCurv.toFixed(6)}, c ${c.toFixed(6)}): ${bandText}; spread directions rank ${spreadRank} (theta 0: ${spreadRank0}); form gap ${formGap.toExponential(2)}; mean tensor eigenvalues ${aValues.map(x => x.toFixed(6)).join(' ')}. C1: vacuum with the piece off the mixerless vacuum at ${vacuumMixed.footprint[BEATS - 1]} docks (K ${vacuumMixed.kEvents}, moves ${vacuumMixed.tally.moved}); meson ${cascades.map(r => at(r, 'footprint')).join('; ')}. Checks: reversal ${reversalDiffer}, non-involutive gated frames ${nonInvolutive}, exact hole norm ${normExact} (${maxBranches} branches), back ${backExact}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
