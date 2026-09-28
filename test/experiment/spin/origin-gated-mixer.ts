// AN ORIGIN-GATED LINE MIXER (E-SPN-0123). note/research/vibe/roadmap/remaining-pieces.md, "Six angles on 3d motion",
// angle 4, and "A string-gated line mixer (E-SPN-0121)". E-SPN-0121's mixer keeps the vacuum exactly but cascades: every
// piece but the stream keeps each dock's single count, the stream leaves a vacuum vibe unpaired wherever matter blocks
// the vacuum's pairs, and a gate that reads charge and string cannot tell that vibe from matter, so it turns it too.
//
// THE CHANGE, AND WHAT IT COSTS. This ADDS A STORED FACT TO THE RULE. Every vibe carries one bounded trit, its ORIGIN:
// vacuum-born or matter-born (0 on an empty slot). The mixer is E-SPN-0121's M = (1 + w)/2 I + (1 - w)/2 G on the
// single's frame (move rate 21/64 on a keyed path), gated as there (one single on the dock, a lone frame, string on
// the frame's eight links) AND on the single being matter-born. The register (code/measure/origin-gated-mixer): a trit
// per slot, 24 a dock, and per stored pair a word of its two vibes' trits, 12 a dock, so 48 trits a dock, beside the
// 24 vibe trits, 24 points (0 .. 8), 24 open bits, 12 store trits, 12 pair words (0 .. 80) and 12 store open words
// the rule already holds, and the flux register of 12 trits a dock the string clause reads. Nothing in the rule's own
// dynamics writes the trit except by carrying it; it is set once, at the start, by what was placed.
//
// DERIVED BEFORE THE RUN.
// 1. HOW EACH PIECE CARRIES IT. Each piece of the rule is a permutation of vibes (with their points and open bits) that
//    depends on the old fields only. The origin rides with the vibe: the COIN hands it across the line with the vibe;
//    the MEETING exchanges two like vibes' points and keeps each slot's vibe and open bit, so the origin (a fact of the
//    vibe, like its open bit) stays on its slot; the BOUNCE K permutes the dock's whole occupation and the origins with
//    it; the STREAM takes it one dock along; the MIXER hands it to another slot of the frame with the vibe.
// 2. CREATION AND ANNIHILATION. The pair move unmakes a love and a fear on a line into a store; to be a bijection the
//    store must keep BOTH origins, in slot order, as one word 3 o_i + o_j (the shape of the pair word 9 s + q that keeps
//    both points). A pair made from a store gives each slot its stored origin back. So a vibe made from a vacuum pair is
//    vacuum-born, and a matter-born vibe unmade with a vacuum vibe comes back matter-born when the store is made again.
//    Nothing is ever born matter-born: the trit is written once, at the start.
// 3. EXACT, UNITARY, REVERSIBLE. Let a piece act on the old fields s as the permutation P, handing vibes between slots
//    by a slot map pi_s that s determines. The extended piece (s, o) -> (P s, o . pi_s^-1) is a bijection: P s gives
//    s back, s gives pi_s, and pi_s gives o. The pair move's labels go slot to store word and back, injectively. The
//    mixer is E-SPN-0121's controlled unitary sum_g |g><g| (x) U_g with one more control bit, the single's origin, which
//    the piece moves with the vibe and never changes, so the gate is still a function the piece keeps; M_n is untouched
//    (entries in Z[w][1/2]), its inverse the same control with M_n^+. On a keyed path the piece is an involution.
// 4. THE VACUUM IS EXACTLY THE SAME. No piece writes matter-born, the vacuum starts wholly vacuum-born, so every vacuum
//    vibe is vacuum-born at every beat. No piece but the mixer reads the trit, and on the vacuum the mixer's first
//    clause is already false (condition Z: no single on any vacuum dock, E-SPN-0117, 0119), so the vacuum's old fields
//    run bit for bit as keyedRunner's.
// 5. CAN IT STILL CASCADE? (a) Matter-born vibes cannot multiply: every piece permutes vibes with their origins and the
//    store keeps both, so the number of matter-born vibes (on slots and in stores) is conserved exactly, and the mixer
//    acts on at most that many docks a beat (2 for the meson). (b) The vacuum vibes a matter single unpairs never turn:
//    they are vacuum-born. So the E-SPN-0121 mechanism (turned vacuum vibes turning more) is closed. (c) But K is still
//    in the rule. After ONE turn of a matter single its difference from the vacuum lies on the lines through two docks,
//    its old line's star and its new line's, and two differing lines that cross off the hub make K fire between
//    vacuum-born singles there (E-SPN-0119: with the vacuum present two singles already make a hub, and two hubs
//    cascade, E-SPN-0119, 0120, with no mixer at all). The origin gate does not touch that: the vacuum-born singles are
//    moved by the base rule, not by the mixer. PREDICTED: the cascade is slowed, since the mixer now fires on at most two
//    docks a beat instead of every unpaired vacuum vibe, but not prevented; a single turn can seed a two-hub cascade.
// 6. MOMENTUM ALONG LINES AWAY FROM MATTER. The piece is the identity on every dock that holds no matter-born single, so
//    every line-local law (momentum along a line, E-SPN-0098's line tone) holds exactly on every line that carries no
//    matter-born single at that beat; at most two lines change per move. Lines disturbed by K downstream are a property
//    of the base rule, read here and not gated.
// 7. THE STAND-IN (code/measure/frame-meson, E-SPN-0121's): E-SPN-0115's love-fear meson in the unbounded mesh with no
//    vacuum. Both vibes are matter-born, so the origin clause is true on every dock the old gate passes and the stand-in
//    IS E-SPN-0121's, bit for bit: the trit changes nothing about a bound meson with no vacuum around it. O3 and O4 are
//    read there, on the window of registers up to 6 links (a cut at the gate's 13 links does not fit in memory), which
//    can PASS the hold (retained weight at least 1 - 1e-3 bounds the tail past 13) and cannot FAIL it.
//
// GATES, fixed before the run.
//  O1 no cascade: for the meson (a love at X, a fear at Y = X + (1,1,0,0) on the line (1,1,0,0)) and for a lone love at
//     X, on 16 terms each (side 8, 128 beats, 'pass', the Born threshold, full-key offsets 0 .. 15, rate 3), the
//     footprint (docks holding any reading off the vacuum run) at beat 128 is under half the box's docks AND grows under
//     10% from beat 64 to 128.
//  O2 the vacuum is bit for bit unchanged: on every track the vacuum run holds 0 singles, the gate's first clauses hold
//     on 0 vacuum docks, and 0 vacuum vibes are matter-born; vacuum-only boxes (start = the vacuum, the mixer on) of sides
//     4 and 8 differ from the vacuum at 0 readings on every one of 128 beats; the vacuum run at beat 128 equals
//     keyedRunner's bit for bit.
//  O3 a bound meson: in the stand-in at K = 0, from the four-line symmetric sum of E-SPN-0115's level, retained weight at
//     least 1 - 1e-3 at every one of 24 beats (else not decided on this window); and if held, curvature along at least 2
//     independent husk directions: of the inverse mass tensor on e_1, e_2, e_3 (second differences along e_a and
//     (e_a + e_b)/sqrt 2 at step E_rest/64), at least two eigenvalues at least a tenth of the one-line meson's
//     curvature / 4. Reported: the tensor and its isotropy (smallest over largest eigenvalue).
//  O4 (if O3) along (1,1,0,0), m*/E_rest (E_rest = 2 pi/3 + E(0), E-SPN-0115's reading) within 5% of E-SPN-0115's
//     1.7931.
// CONTROLS (a failed control makes the verdict partial).
//  CG the origin gate removed reproduces E-SPN-0121: gate 'none' equals code/measure/string-gated-mixer mixTrack bit for
//     bit (wake, footprint and K docks on every beat, and the last configuration) on 4 meson terms, and the meson
//     cascades there (footprint at beat 128 at least half the box on each).
//  CA mixer angle 0 reproduces the lineon: at rate 0 the meson's track equals keyedRunner bit for bit at beat 128
//     (path 0), a lone love's footprint stays under half the box, and in the stand-in the level energy is E-SPN-0115's
//     0.3188654375223234 to 1e-9, its m*/E_rest is 1.7931 to 5e-5, and it does not move along e_3 (dE 0 to 1e-12).
// CHECKS (a failed check makes the verdict partial): on every beat of every track, the origin register agrees with
// occupation (0 mismatches), the matter-born count stays at its start (0 drift), and the keyed piece applied twice
// gives the configuration and its origins back (0 slots off); the stand-in's held, escaped and dropped weight sum to 1
// to 1e-10.
// READ, NOT GATED: vacuum-born singles the gate refused that E-SPN-0121's gate would have turned; the beat of each term's
// first matter turn, and its footprint then and at the first beat past half the box; K docks; lines off the vacuum's tone.
// Verdict: partial if a control or check fails; pass if O1 .. O4 hold; fail otherwise.
// PROBE, disclosed (instrument only): tmp/origin-probe1-8.log (meson and lone love on offsets 0 and 1 at rate 3: the
// meson reaches 2,971 and 4,094 docks by beat 128, the lone love 173 and 3,337; 0 register mismatches, 0 drift, 0
// reversal off; the gate refused 1,789 to 38,292 vacuum-born singles; gate 'none' equals mixTrack for 48 beats).
//
// FIRST RUN (tmp/origin-exp-run1.log, 90 s): FAIL on O1, as point 5 predicted; O2 passes; O3 is not decided on the
// window, so O4 is not reached; every control and check passes.
//  - O1 fails: the meson ends at 185 to 4,095 of 4,096 docks at beat 128 (mean 2,975), with 13 of 16 terms past half
//    the box; 0 of 16 are bounded. A lone love ends at 37 to 4,096 (mean 1,752), 7 of 16 past half the box, 0 of 16
//    bounded (at rate 0 it holds 6.25). The mixer turns only matter: 17 moves a meson term (6,958 without the origin
//    gate), at most 2 matter singles on any beat, the first turn at beat 5.3 on average, and 21,051 vacuum-born
//    singles refused a term. What spreads is K between vacuum-born singles: 1,447 K docks a meson term, 569 of 6,144
//    lines off the vacuum's tone on p0 (0 at rate 0). Terms that stay small (p2 185, p6 246, p15 266) and terms that
//    fill differ only in whether two disturbed stars crossed within reach and fired K.
//  - O2 holds exactly: 0 vacuum singles, 0 vacuum docks passing the gate's first clauses, 0 matter-born vacuum vibes on
//    every track, vacuum-only boxes of side 4 and 8 at 0 readings, the vacuum run equal to keyedRunner's at beat 128.
//  - O3: the stand-in is E-SPN-0121's (point 7) and retains 0.9999 .. 0.4323 (beat 8) .. 0.0351 (beat 24): not held on
//    the window, not decided past it. No inverse mass tensor is read.
//  - CG: gate 'none' equals mixTrack bit for bit on 4 of 4 terms and cascades (4,089 to 4,095). CA: rate 0 equals
//    keyedRunner, a lone love holds 6.25, the stand-in gives E 0.3188654375223 and m*/E_rest 1.7930822, 0 along e_3.
//    Checks: 0 register mismatches, 0 matter-born drift, 0 reversal slots off, weight balanced to 6e-12.
// Title written after the run.
//
// Depth L1 for O1, O2 and the checks (exact on the rule's integer paths, derived, the controls reproducing the record),
// L2 for the stand-in. DETERMINISM: no random numbers; the key is integer arithmetic and every start is placed. NOTHING
// MOVES: the mixer hands a vibe and its origin to another slot of its own frame on its own dock; the stream takes it
// one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, keyedRunner, lineCharges, linesDiffering, meshLines, pathOffset } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { mixTrack, type MixTrack } from '@/code/measure/string-gated-mixer'
import { originTrack, type OriginGate, type OriginTrack } from '@/code/measure/origin-gated-mixer'
import { meson, pairEmbed } from '@/code/measure/string-binding'
import { nrSeed, settle } from '@/code/measure/meson-band'
import { addStates, autocorrelation, axisOfLine, frameAxes, frameBeat, frameSpace, lineFrame, lineState, momentsOf, normalized, ritzLevels, weightOf, type FrameSpace, type FrameState } from '@/code/measure/frame-meson'
import { hermitianEigen } from '@/code/measure/quantum-ladder'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'

const B = rootIndex([1, 1, 0, 0])
const RATE = 3
const SIDE = 8
const BEATS = 128
const PATHS = 16
const FEW = 4
const GROWTH_FROM = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const WINDOW_SIDES = [4, 8]
// the stand-in
const D = 6
const N = 2 * D + 1
const CUT = 6
const FLOOR = 1e-10
const HOLD_BEATS = 24
const TAIL = 1e-3
const E_REST = 0.3188654375223234
const TOTAL = 1.7931
const TOTAL_SAME = 5e-5
const MASS_SAME = 0.05
const ENERGY_SAME = 1e-9
const MASS = Math.PI / 3
const CURVE_FRAC = 1 / 64
const CURVE_SHARE = 0.1
const NORM_SAME = 1e-10
const RITZ_T = 120
const REPORT_AT = [8, 16, 32, 64, 128]

export default experiment({
  id: 'spin/origin-gated-mixer',
  code: 'E-SPN-0123',
  title:
    "a line mixer gated on a stored vacuum-or-matter origin trit per vibe keeps the vacuum exactly and turns only matter, but K still cascades, fail (O1): E-SPN-0121's mixer with one more clause (the single is matter-born), the trit carried by coin, bounce, stream and mixer, kept on its slot by the meeting and stored in slot order by the pair move (48 trits a dock), is exact and reversible (0 register mismatches, 0 reversal slots off), conserves the matter-born count exactly and gates 0 vacuum docks, so the vacuum runs bit for bit; it turns 17 times a meson term against 6,958 without the origin clause and refuses 21,051 vacuum-born singles, yet the meson reaches 185 to 4,095 of 4,096 docks by beat 128 (0 of 16 terms bounded, 13 past half the box) and a lone love 37 to 4,096 (0 of 16 bounded, 6.25 at rate 0), because one turn puts the difference on two stars whose crossing lines fire K between vacuum-born singles (1,447 K docks a meson term); the vacuum-free stand-in is E-SPN-0121's and keeps 0.035 of the weight by beat 24, so the hold stays undecided and no mass tensor is read; the ungated control reproduces E-SPN-0121 bit for bit and rate 0 reproduces the lineon and E-SPN-0115 (m*/E_rest 1.79308)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- the rule ----
    const setup = (side: number) => {
      const X = centerOf(side)
      const f = contactFresh(side, 'pass', X)
      const vacuum = wordVacuum(f, f.store)
      const Y = Math.floor((f.tables.target[X * 24 + B] as number) / 24)

      return {
        side,
        X,
        f,
        vacuum,
        lines: meshLines(f.tables),
        meson: { start: placeVibes(vacuum, [{ dock: X, slot: B, vibe: 1 }, { dock: Y, slot: B, vibe: -1 }]), matter: [X * 24 + B, Y * 24 + B] },
        love: { start: placeVibes(vacuum, [{ dock: X, slot: B, vibe: 1 }]), matter: [X * 24 + B] },
      }
    }
    type Setup = ReturnType<typeof setup>
    type Start = { start: Configuration; matter: number[] }
    const s8 = setup(SIDE)
    const track = (g: Setup, s: Start, path: number, n: number, gate: OriginGate = 'origin'): OriginTrack =>
      originTrack({ tables: g.f.tables, vacuum: g.vacuum, start: s.start, matter: s.matter, key: fullPathKey(pathOffset(path)), threshold: THRESHOLD_BORN, beats: BEATS, n, gate })

    const mesons = Array.from({ length: PATHS }, (_, k) => track(s8, s8.meson, k, RATE))

    log('meson terms')

    const loves = Array.from({ length: PATHS }, (_, k) => track(s8, s8.love, k, RATE))

    log('love terms')

    const growthOf = (r: OriginTrack): number => ((r.footprint[BEATS - 1] as number) - (r.footprint[GROWTH_FROM - 1] as number)) / Math.max(1, r.footprint[GROWTH_FROM - 1] as number)
    const bounded = (r: OriginTrack): boolean => growthOf(r) < GROWTH_LIMIT && (r.footprint[BEATS - 1] as number) < BOX_SHARE * s8.f.cells
    const O1 = mesons.every(bounded) && loves.every(bounded)

    // O2: the vacuum
    const windows = WINDOW_SIDES.map(side => {
      const g = side === SIDE ? s8 : setup(side)
      const r = track(g, { start: g.vacuum, matter: [] }, 0, RATE)

      return { side, wake: r.wake.reduce((u, v) => u + v, 0), gated: r.gated.reduce((u, v) => u + v, 0) + r.vacuumGated, singles: r.vacuumRunSingles, matter: r.vacuumMatter }
    })
    const runner = keyedRunner(s8.f.tables, s8.vacuum, { key: fullPathKey(0), threshold: THRESHOLD_BORN })

    for (let t = 0; t < BEATS; t++) runner.beat()

    const differ = (p: Configuration, q: Configuration): number => {
      let n = 0

      for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i] || (p.vibe[i] !== 0 && (p.point[i] !== q.point[i] || p.open[i] !== q.open[i]))) n++
      for (let i = 0; i < p.store.length; i++) if (p.store[i] !== q.store[i] || (p.store[i] !== 0 && (p.spoint[i] !== q.spoint[i] || p.sopen[i] !== q.sopen[i]))) n++

      return n
    }
    const vacuumDiffer = differ(runner.state(), (mesons[0] as OriginTrack).vacuumLast)

    log('vacuum')

    // ---- controls ----
    // CG: the origin gate removed is E-SPN-0121's mixer
    const ungated = Array.from({ length: FEW }, (_, k) => track(s8, s8.meson, k, RATE, 'none'))
    const old = Array.from({ length: FEW }, (_, k) => mixTrack({ tables: s8.f.tables, vacuum: s8.vacuum, start: s8.meson.start, hub: s8.X, key: fullPathKey(pathOffset(k)), threshold: THRESHOLD_BORN, beats: BEATS, side: SIDE, n: RATE }))
    const cgOff = ungated.map((r, k) => {
      const m = old[k] as MixTrack
      let off = 0

      for (let t = 0; t < BEATS; t++) if (r.wake[t] !== m.wake[t] || r.footprint[t] !== m.footprint[t] || r.kDocks[t] !== m.kDocks[t]) off++

      return off + differ(r.last, m.last)
    })
    const CG = cgOff.every(x => x === 0) && ungated.every(r => (r.footprint[BEATS - 1] as number) >= BOX_SHARE * s8.f.cells)

    log('control CG')

    // CA: rate 0 is the lineon
    const meson0 = track(s8, s8.meson, 0, 0)
    const loves0 = Array.from({ length: FEW }, (_, k) => track(s8, s8.love, k, 0))
    const mesonRunner = keyedRunner(s8.f.tables, s8.meson.start, { key: fullPathKey(0), threshold: THRESHOLD_BORN })

    for (let t = 0; t < BEATS; t++) mesonRunner.beat()

    const stepperDiffer = differ(mesonRunner.state(), meson0.last)

    log('control CA rule')

    const everyTrack = [...mesons, ...loves, ...ungated, meson0, ...loves0]
    const vacuumSinglesAll = everyTrack.reduce((n, r) => n + r.vacuumRunSingles, 0)
    const vacuumGatedAll = everyTrack.reduce((n, r) => n + r.vacuumGated, 0)
    const vacuumMatterAll = everyTrack.reduce((n, r) => n + r.vacuumMatter, 0)
    const O2 = vacuumSinglesAll === 0 && vacuumGatedAll === 0 && vacuumMatterAll === 0 && windows.every(w => w.wake === 0 && w.gated === 0 && w.singles === 0 && w.matter === 0) && vacuumDiffer === 0

    // ---- the stand-in ----
    const F = lineFrame(B)
    const axisB = axisOfLine(F, LINE_OF[B] as number)
    const m = meson(D, 2 * N, 1)
    const level = settle(m, nrSeed(m))
    const full = pairEmbed(m, 0, level.block)
    const entries: { d: number; jl: number; jf: number; amp: [number, number] }[] = []

    for (let i = 0; i < m.b.size; i++) {
      if (full.re[i] === 0 && full.im[i] === 0) continue

      const c = Math.floor(i / m.b.labelCount)
      const r = i % m.b.labelCount

      entries.push({ d: m.b.configs[c]![1]!, jl: Math.floor(r / 2), jf: r % 2, amp: [full.re[i] as number, full.im[i] as number] })
    }

    const energyAt = (space: FrameSpace, K: readonly number[], start: FrameState): { energy: number; weight: number; residual: number } => {
      const ritz = ritzLevels(autocorrelation(space, K, start, RITZ_T).c).sort((x, y) => y.weight - x.weight)

      return ritz[0] as { energy: number; weight: number; residual: number }
    }
    const uB = frameAxes(F)[axisB] as number[]
    // the one-line meson's rest energy, curvature and m*/E_rest (E-SPN-0115's reading), and a transverse boost
    const s0 = frameSpace({ frame: F, n: 0, D, cut: 2 * N, floor: 1e-24 })
    const onB = lineState(s0, axisB, entries)
    const e0 = energyAt(s0, [0, 0, 0, 0], onB)
    const eRest0 = 2 * MASS + e0.energy
    const step0 = eRest0 * CURVE_FRAC
    const curve0 = (energyAt(s0, uB.map(x => x * step0), onB).energy + energyAt(s0, uB.map(x => -x * step0), onB).energy - 2 * e0.energy) / (step0 * step0)
    const total0 = 1 / (curve0 * eRest0)
    const eTrans = energyAt(s0, [0, 0, step0, 0], onB)
    const CA = stepperDiffer === 0 && loves0.every(r => (r.footprint[BEATS - 1] as number) < BOX_SHARE * s8.f.cells) && Math.abs(e0.energy - E_REST) <= ENERGY_SAME && Math.abs(total0 - TOTAL) <= TOTAL_SAME && Math.abs(eTrans.energy - e0.energy) <= 1e-12

    log('stand-in rate 0')

    // rate 3 on the window: the hold
    const space = frameSpace({ frame: F, n: RATE, D, cut: CUT, floor: FLOOR })
    let sym: FrameState = new Map()

    for (let a = 0; a < 4; a++) sym = addStates(sym, lineState(space, a, entries))
    sym = normalized(sym)

    let s = sym
    const tally = { escaped: 0, dropped: 0 }
    const retained: number[] = []

    for (let t = 0; t < HOLD_BEATS; t++) {
      s = frameBeat(space, [0, 0, 0, 0], s, tally)
      retained.push(weightOf(s))
    }

    const normGap = Math.abs((retained[HOLD_BEATS - 1] as number) + tally.escaped + tally.dropped - 1)
    const moments = momentsOf(space, s, N)
    const held = retained.every(w => w >= 1 - TAIL)

    log('stand-in rate 3')

    // O3's curvature and O4, read only on a held level
    let tensor: number[][] = []
    let eigen: number[] = []
    let isotropy = Number.NaN
    let totalMixed = Number.NaN
    let curved = 0

    if (held) {
      const e3 = energyAt(space, [0, 0, 0, 0], sym)
      const eRest = 2 * MASS + e3.energy
      const step = eRest * CURVE_FRAC
      const second = (u: readonly number[]): number => (energyAt(space, u.map(x => x * step), sym).energy + energyAt(space, u.map(x => -x * step), sym).energy - 2 * e3.energy) / (step * step)
      const unit = (a: number): number[] => [0, 1, 2, 3].map(k => (k === a ? 1 : 0))
      const diag = [0, 1, 2].map(a => second(unit(a)))

      tensor = [0, 1, 2].map(a => [0, 1, 2].map(b => (a === b ? (diag[a] as number) : second(unit(a).map((x, k) => (x + (unit(b)[k] as number)) / Math.SQRT2)) - ((diag[a] as number) + (diag[b] as number)) / 2)))
      eigen = hermitianEigen(3, Float64Array.from(tensor.flat()), new Float64Array(9)).values.slice().sort((x, y) => x - y)
      isotropy = (eigen[0] as number) / (eigen[2] as number)
      curved = eigen.filter(v => v >= (CURVE_SHARE * curve0) / 4).length
      totalMixed = 1 / (second(uB) * eRest)
    }

    const O3 = held && curved >= 2
    const O4 = O3 && Math.abs(totalMixed / TOTAL - 1) <= MASS_SAME

    // ---- verdict ----
    const mismatch = everyTrack.reduce((n, r) => n + r.mismatch, 0)
    const drift = everyTrack.reduce((n, r) => n + r.matterDrift, 0)
    const reversalDiffer = everyTrack.reduce((n, r) => n + r.reversalDiffer, 0)
    const checked = mismatch === 0 && drift === 0 && reversalDiffer === 0 && normGap <= NORM_SAME
    const status = !CG || !CA || !checked ? 'partial' : O1 && O2 && O3 && O4 ? 'pass' : 'fail'
    const mean = (xs: number[]): number => xs.reduce((u, v) => u + v, 0) / xs.length
    const sum = (xs: number[]): number => xs.reduce((u, v) => u + v, 0)
    const at = (r: OriginTrack, key: 'wake' | 'footprint' | 'kDocks' | 'matterSingles' | 'vacuumSingles'): string => REPORT_AT.map(t => r[key][t - 1]).join('/')
    const firstFill = (r: OriginTrack): number => r.footprint.findIndex(x => x >= BOX_SHARE * s8.f.cells) + 1
    const firstTurn = (r: OriginTrack): number => r.moved.findIndex(x => x > 0) + 1
    const toneDiffer = (r: OriginTrack): number => linesDiffering(lineCharges(s8.lines, r.last).tone, lineCharges(s8.lines, r.vacuumLast).tone)
    const filled = (rs: OriginTrack[]): number => rs.filter(r => firstFill(r) > 0).length

    const metrics: Record<string, number> = {
      O1: O1 ? 1 : 0,
      O2: O2 ? 1 : 0,
      O3: O3 ? 1 : 0,
      O3_held: held ? 1 : 0,
      O4: O4 ? 1 : 0,
      control_CG: CG ? 1 : 0,
      control_CA: CA ? 1 : 0,
      checked: checked ? 1 : 0,
      boundedMesons: mesons.filter(bounded).length,
      boundedLoves: loves.filter(bounded).length,
      cells: s8.f.cells,
      mesonMinFootprint128: Math.min(...mesons.map(r => r.footprint[BEATS - 1] as number)),
      mesonMaxFootprint128: Math.max(...mesons.map(r => r.footprint[BEATS - 1] as number)),
      mesonMeanFootprint128: mean(mesons.map(r => r.footprint[BEATS - 1] as number)),
      mesonFilled: filled(mesons),
      loveMinFootprint128: Math.min(...loves.map(r => r.footprint[BEATS - 1] as number)),
      loveMaxFootprint128: Math.max(...loves.map(r => r.footprint[BEATS - 1] as number)),
      loveMeanFootprint128: mean(loves.map(r => r.footprint[BEATS - 1] as number)),
      loveFilled: filled(loves),
      loveFootprint128Rate0: mean(loves0.map(r => r.footprint[BEATS - 1] as number)),
      mesonFootprint128Rate0: meson0.footprint[BEATS - 1] as number,
      ungatedMinFootprint128: Math.min(...ungated.map(r => r.footprint[BEATS - 1] as number)),
      cgOff: sum(cgOff),
      mesonMeanMoved: mean(mesons.map(r => sum(r.moved))),
      loveMeanMoved: mean(loves.map(r => sum(r.moved))),
      mesonMeanRefused: mean(mesons.map(r => sum(r.refused))),
      loveMeanRefused: mean(loves.map(r => sum(r.refused))),
      ungatedMeanMoved: mean(ungated.map(r => sum(r.moved))),
      mesonMeanFirstTurn: mean(mesons.map(firstTurn)),
      mesonMeanKDocks128: mean(mesons.map(r => r.kDocks[BEATS - 1] as number)),
      loveMeanKDocks128: mean(loves.map(r => r.kDocks[BEATS - 1] as number)),
      mesonMaxMatterSingles: Math.max(...mesons.map(r => Math.max(...r.matterSingles))),
      toneLinesMeson0: toneDiffer(mesons[0] as OriginTrack),
      toneLinesRate0: toneDiffer(meson0),
      meshLines: s8.lines.count,
      vacuumSingles: vacuumSinglesAll,
      vacuumGated: vacuumGatedAll,
      vacuumMatter: vacuumMatterAll,
      vacuumDiffer,
      windowWake4: (windows[0] as { wake: number }).wake,
      windowWake8: (windows[1] as { wake: number }).wake,
      stepperDiffer,
      mismatch,
      drift,
      reversalDiffer,
      standEnergy0: e0.energy,
      standTotal0: total0,
      standTransverse: eTrans.energy - e0.energy,
      heldRetained8: retained[7] as number,
      heldRetained24: retained[HOLD_BEATS - 1] as number,
      heldMeanString: moments.meanString,
      heldBent: moments.bent,
      windowClasses: space.classes.length,
      normGap,
      curvedDirections: curved,
      isotropy,
      totalMixed,
      seconds: (Date.now() - started) / 1000,
    }
    const perTerm = (rs: OriginTrack[]): string => rs.map((r, k) => `p${k}: footprint ${at(r, 'footprint')}, K docks ${at(r, 'kDocks')}, matter singles ${at(r, 'matterSingles')}, vacuum-born singles ${at(r, 'vacuumSingles')}, moves ${sum(r.moved)}, refused ${sum(r.refused)}, first turn ${firstTurn(r)}, half box ${firstFill(r)}, growth ${growthOf(r).toFixed(4)}`).join('; ')

    return verdict({
      status,
      claim: `an origin-gated line mixer (E-SPN-0121's mixer, turning only a matter-born single; one stored trit per vibe) keeps the vacuum bit for bit (${vacuumGatedAll} vacuum docks gated, ${vacuumMatterAll} matter-born vacuum vibes, ${vacuumDiffer} readings off keyedRunner), conserves the matter-born count exactly (${drift} drift) and refuses the vacuum-born singles E-SPN-0121 turned (${metrics.mesonMeanRefused} a meson term); the meson ends at ${metrics.mesonMinFootprint128} to ${metrics.mesonMaxFootprint128} of ${s8.f.cells} docks (${metrics.boundedMesons} of ${PATHS} bounded), a lone love at ${metrics.loveMinFootprint128} to ${metrics.loveMaxFootprint128} (${metrics.boundedLoves} of ${PATHS} bounded); the stand-in's window keeps ${(retained[HOLD_BEATS - 1] as number).toFixed(4)} by beat ${HOLD_BEATS}`,
      metrics,
      control: { cgOff: sum(cgOff), stepperDiffer, standEnergy0: e0.energy, standTotal0: total0, loveFootprint128Rate0: metrics.loveFootprint128Rate0 as number },
      notes: `L1 (O1, O2) and L2 (stand-in). O1 ${O1}; O2 ${O2} (windows ${windows.map(w => `side ${w.side}: wake ${w.wake}, gated ${w.gated}, singles ${w.singles}, matter ${w.matter}`).join('; ')}); O3 ${O3} (held ${held}: retained ${retained.map(w => w.toFixed(4)).join(' ')}; mean string ${moments.meanString.toFixed(3)}, bent ${moments.bent.toFixed(3)}, ${space.classes.length} classes${held ? `; tensor ${JSON.stringify(tensor)}, eigenvalues ${eigen.join(', ')}, isotropy ${isotropy}` : ''}); O4 ${O4}${held ? ` (m*/E_rest ${totalMixed})` : ' (not reached)'}. CG ${CG} (off ${cgOff.join('/')}, ungated footprints ${ungated.map(r => r.footprint[BEATS - 1]).join('/')}); CA ${CA} (stepper ${stepperDiffer}, lone love rate 0 ${loves0.map(r => at(r, 'footprint')).join('; ')}, meson rate 0 ${at(meson0, 'footprint')}, stand-in E ${e0.energy}, total ${total0}, transverse ${eTrans.energy - e0.energy}). Checks: mismatch ${mismatch}, drift ${drift}, reversal ${reversalDiffer}, norm gap ${normGap.toExponential(2)}. Meson terms: ${perTerm(mesons)}. Lone love terms: ${perTerm(loves)}. Tone lines off the vacuum at 128: meson p0 ${metrics.toneLinesMeson0}, rate 0 ${metrics.toneLinesRate0} of ${s8.lines.count}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
