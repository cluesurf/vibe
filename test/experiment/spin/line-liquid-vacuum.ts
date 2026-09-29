// A LINE-LIQUID VACUUM (E-SPN-0137). note/research/vibe/roadmap/remaining-pieces.md, "Six angles on 3d motion", angle 3.
// Every added line mixer cascades (E-SPN-0094 .. 0099, 0121) because the vacuum is a fixed bundle of line pairs, so any
// turn unpairs them. The proposal: a vacuum whose state is a superposition over line assignments, invariant under the
// mixer, as a lattice theory's ground state is isotropic. Asked: does the working rule with a frame mixer have such a
// stationary vacuum, is one love on it a sharp level, and is its band isotropic in 3d.
//
// THE INSTRUMENTS (code/measure/line-liquid). The vacuum's images under W(F4), and the one-point occupation stand-in: the
// rule's occupation exactly (under veto 'none' no piece reads a point, and on a keyed path the stand-in equals the rule
// slot for slot), the coin's and the mixer's amplitudes exactly, points dropped (every like meeting the equal-point
// phase w). The mixer is E-SPN-0121's M_n with the string clause dropped (its 'stringless' control, which cascaded too).
//
// DERIVED BEFORE THE RUN.
// 1. WHAT THE VACUUM IS (tmp/liquid-probe1, -probe2). On three docks in four the working vacuum stores a pair on all
//    four lines of ONE frame; which frame and which four tones is set by the dock's place in a 4^4 cell (16 box
//    translations fix it on side 8). It holds no single line at any beat (condition Z) and repeats every 12 beats. So it
//    is literally a fixed bundle of line pairs, one frame a dock.
// 2. ANY VACUUM STATE IS MIXER-INVARIANT. The mixer acts only on a dock holding exactly one single on a lone frame. A
//    configuration with no single line is never gated, so M_n (any n, G included) is the identity on the whole no-single
//    sector, fixed vacuum or liquid alike. There is nothing in any vacuum for the mixer to disturb. The cascade is not
//    the mixer acting on the vacuum: it is the stream unpairing vacuum vibes where matter blocks their pairs (E-SPN-0121's
//    census), and the mixer then acting on those.
// 3. THE ONLY LIQUIDS ARE SUPERPOSITIONS OF IMAGES. On the no-single sector a beat sends a configuration to one
//    configuration times a phase (no coin crossing, no mixer, the meeting and the coin's determinant phases), and depends
//    on t only through the collision order's parity. So its stationary states are Floquet sums over periodic orbits, and
//    a liquid is a superposition of vacua. The W(F4) images of the vacuum are vacua by the rule's covariance; the
//    symmetric Floquet sum over them (code/measure/line-liquid liquidVacuum) is a frame-invariant eigenvector of the beat
//    pair by construction. A LOCAL liquid (pairs superposed over lines at one dock) needs the rearranged configurations
//    to be vacua too. Probe (tmp/liquid-probe4): of 12,544 one-dock alternatives on a whole cell (each of 256 docks
//    given no stores or a full stored frame of any of 3 frames and 16 tone patterns), only the 256 unchanged ones keep Z
//    and the period. The vacuum is rigid: no one-dock rearrangement is a vacuum.
// 4. THE CLUSTER THEOREM: A LIQUID OF IMAGES IS INCOHERENT FOR THE LOVE. Two distinct images differ on a positive
//    fraction of docks of every cell (read below as minApart of 256), so on the unbounded mesh on infinitely many. A term
//    of the love on image i differs from image i at finitely many docks. So no term of the love on image i ever equals a
//    term on image j, the components never interfere, and every reading of the love on the liquid is the average over
//    images of the readings on fixed images, which by covariance are the fixed vacuum's with the love's start carried by
//    g^-1. So the liquid gives the love exactly what a classical mixture of fixed vacua gives it: L2 on the liquid holds
//    exactly when L2 holds (on average) on the fixed vacuum, and the fixed vacuum's cascade (E-SPN-0121) carries over.
// 5. THE LINEON AT ANGLE 0. At n = 0 every piece keeps each mesh line's tone and no dock ever holds two singles, so a
//    lone love's difference stays on its own mesh line (E-SPN-0117, 0119). In the stand-in: all weight on one mesh line,
//    one line off tone, and the amplitude moduli independent of any momentum across the line.
//
// GATES, fixed before the registered run (the probes above are disclosed, and the rate-3 coherent probe
// tmp/liquid-probe5-n3.log reached 3 beats at 34,958 terms in 273 s, so the coherent windows are fixed at 5 beats for
// n = 0 and 3 for n = 3; term counts grow about 15-fold a beat at n = 0 and 13 to 670-fold at n = 3).
//  L1 on the side-4 box (one vacuum cell), the symmetric Floquet state Phi over all distinct W(F4) images: every image
//     holds 0 single lines and 0 gated docks over 76 beats and repeats in 12; |<Phi|U^64 Phi>| / <Phi|Phi> >= 0.99 read
//     by running the rule's pieces; Phi unchanged (to 1e-12) by the 48 reflections of W(F4), which generate it.
//     (Corrected after run 1, see below: the count 48 was wrong for what the code reads; the clause is now read on a
//     generating set whose closure is checked to be all 1,152 elements.)
//  L2 a lone love (E-SPN-0121's: slot (1,1,0,0) at the box center) on the vacuum is a sharp level: weight >= 0.5 on one
//     Floquet level of U^12, read from the coherent stand-in's c(12 m), m <= 4. DECIDABLE ONLY IF the coherent window
//     reaches 48 beats; otherwise undecided on the window, with the trend read: weight with exactly one mesh line off
//     tone (e1), the mean and most lines off, and the coherent against the decoherent limit (every split weighted by
//     |amplitude|^2, no interference: the sum the rule's keyed paths sample).
//  L3 (if L2) the band curves along e_1, e_2, e_3 and is isotropic to 10%.
// CONTROLS (a failed control makes the verdict partial).
//  C1 the cascade: E-SPN-0121's own track (the string clause on, rate 3, lone love, side 8, 'pass', Born, paths 0 .. 3)
//     reproduces its record footprints at beats 8/16/32/64/128 exactly, and rate 0 its lineon record.
//  C2 the lineon at mixer angle 0: over the coherent window, weight 1 on one mesh line, e1 = 1, and the moduli at a
//     momentum across the line equal those at K = 0 to 1e-12.
// CHECKS (a failed check makes the verdict partial): the stand-in on keyed paths equals the rule's occupation slot for
// slot (n = 3 without the string clause and n = 0, path 0, 64 beats); the coherent weight stays 1 to 1e-9; the rigidity
// count of point 3 is re-read.
// Verdict: partial if a control or check fails; fail if L1 fails or L2 is decided false; pass if L1, L2 and L3 hold;
// open if L1 holds and L2 is undecided on the window.
//
// FIRST RUN (tmp/liquid-exp-run1.log, 341 s): FAIL on L1, on the count clause alone. The code read the W(F4) elements
// that are involutions with a doubled trace of 4 and found 24 of them, not the 48 the gate had counted, so
// `reflections === 48` was false; the change of Phi under those 24 was exactly 0, and every other clause held (1,152
// images, 0 singles, 0 gated docks, 1,152 periodic, overlap 1 after 64 beats). The count was a mis-stated clause, not a
// reading. It was replaced by the clause it stood for (Phi unchanged by a set of W(F4) elements whose generated group
// is read to be all 1,152), with no threshold moved; a second run reading all 1,152 elements directly was stopped after
// 30 minutes as too heavy.
// THIRD RUN (tmp/liquid-exp-run3.log, 337 s): OPEN. L1 holds, L2 is undecided on the window, every control and check
// passes.
//  - L1: 1,152 distinct images (the orbit is free), 0 single lines and 0 gated docks over 76 beats on every one, all
//    1,152 periodic in 12, overlap exactly 1 after 64 beats, Phi unchanged by 6 generators whose closure is all 1,152.
//    Two images sit at least 144 of 256 docks apart.
//  - Rigidity: 0 of 12,288 one-dock rearrangements keep Z and the period.
//  - L2 undecided: the coherent windows reach 5 beats at n = 0 (3,070 terms) and 3 at n = 3 (34,958 terms), against the
//    48 a Floquet level needs. At n = 3 by beat 3: e1 0.9019, mean lines off 1.128, most 4, 0.7188 on one mesh line;
//    the coherent and decoherent readings agree exactly (difference 0), so no interference has acted in the window.
//  - C1: E-SPN-0121's lone-love footprints reproduced on all 4 paths at rates 3 and 0 (mean 4,095.25 against 6.25 at
//    beat 128). C2: at n = 0 all weight on one mesh line, e1 = 1, across-line moduli equal to 1.1e-16.
//  - Checks: the stand-in equals the rule's occupation slot for slot on keyed paths (0 differences, n = 3 and 0, 64
//    beats), weight 1 to 2.2e-16.
// Title written after the run. Every other gate, control and check read the same: C1 and C2 pass, the checks pass, L2
// undecided.
//
// Depth L1 for L1 and the derivations (exact on the rule's integer occupation, the vacuum's images by the rule's
// covariance); L2 for the stand-in's readings. DETERMINISM: no random numbers; starts are placed. NOTHING MOVES: the
// coin and the mixer hand a value between slots of one dock, the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, pathOffset } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeVibes } from '@/code/measure/two-hub-bound'
import {
  gatedMix,
  mixTrack,
  newMixTally,
} from '@/code/measure/string-gated-mixer'
import { starBeat, type KEvent } from '@/code/measure/hub-star'
import { weylF4 } from '@/code/measure/covariant-coin'
import { FRAME_LINES } from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  type Configuration,
} from '@/code/rule/doublet-locked-knit'
import {
  liquidBeat,
  liquidDistance,
  liquidLattice,
  liquidReading,
  liquidStart,
  liquidVacuum,
  liquidWeight,
  newLiquidTally,
  termOnBox,
  termSingles,
  type LiquidLattice,
  type LiquidReading,
  type LiquidSpec,
  type LiquidState,
  type LiquidTerm,
} from '@/code/measure/line-liquid'

const SIDE = 8
const CELL_SIDE = 4
const B = rootIndex([1, 1, 0, 0])
const RATE = 3
const BEATS = 128
const REPORT_AT = [8, 16, 32, 64, 128]
// E-SPN-0121's record (tmp/smix-exp-run3.log): lone love footprints at REPORT_AT, paths 0 .. 3
const RECORD_RATE3 = [
  [9, 108, 4096, 4094, 4096],
  [4, 61, 4083, 4090, 4094],
  [6, 45, 3314, 4093, 4096],
  [5, 51, 3908, 4094, 4095],
]
const RECORD_RATE0 = [
  [7, 7, 5, 6, 6],
  [3, 7, 7, 6, 7],
  [4, 6, 7, 8, 6],
  [6, 5, 7, 7, 6],
]
const OVERLAP = 0.99
const SAME = 1e-12
const UNIT = 1e-9
const LEVEL_BEATS = 48
const WINDOW0 = 5
const WINDOW3 = 3
const CHECK_BEATS = 64
const KAPPA = (2 * Math.PI) / 32

export default experiment({
  id: 'spin/line-liquid-vacuum',
  code: 'E-SPN-0137',
  title:
    "a line-liquid vacuum exists but cannot help, open (L1 pass, L2 undecided on the window): the working vacuum stores one whole frame of pairs on 3 docks in 4 and is rigid (0 of 12,288 one-dock rearrangements keep condition Z and the 12-beat period), so its only frame-invariant stationary states are superpositions of its 1,152 W(F4) images, which sit at least 144 of 256 docks apart; the symmetric Floquet sum over them has overlap 1 after 64 beats, 0 single lines and 0 gated docks, and is unchanged by 6 generators of W(F4); every mixer is the identity on any vacuum, so the cascade is matter unpairing vacuum vibes, and since the images never interfere a love on the liquid sees a classical mixture of fixed vacua, where E-SPN-0121's cascade is reproduced (lone love footprint 4,095 of 4,096 at beat 128, 6 at rate 0); a one-point occupation stand-in equal to the rule's occupation on keyed paths (0 differences over 64 beats) reaches 5 coherent beats at rate 0 (3,070 terms, the lineon exact: one mesh line, across-line moduli equal to 1e-16) and 3 at rate 3 (34,958 terms, 0.90 of the weight with one line off tone, coherent and decoherent readings identical), far short of the 48 beats a Floquet level needs; the route needs a new vacuum, not this one superposed",
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
    const group = weylF4()

    // ---- L1: the liquid on one vacuum cell ----
    const f4 = contactFresh(CELL_SIDE, 'pass', centerOf(CELL_SIDE))
    const liquid = liquidVacuum(
      f4.tables,
      wordVacuum(f4, f4.store),
      CELL_SIDE,
      group,
    )
    const L1 =
      liquid.singles === 0 &&
      liquid.gated === 0 &&
      liquid.periodic === liquid.images &&
      liquid.overlap64 >= OVERLAP &&
      liquid.generated === group.length &&
      liquid.reflectionChange <= SAME

    log('liquid')

    // ---- the side-8 box ----
    const X = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', X)
    const vac = wordVacuum(f, f.store)
    const love = placeVibes(vac, [{ dock: X, slot: B, vibe: 1 }])
    const L = liquidLattice(f.tables, vac, SIDE)
    const Lbox = liquidLattice(f.tables, vac, SIDE, SIDE)

    // rigidity: every dock of one cell given no stores or a whole stored frame (3 frames x 16 tones), 12 beats
    let tested = 0
    let keptNonTrivial = 0

    const rigidSpec: LiquidSpec = {
      n: 0,
      bloch: false,
      K: [0, 0, 0, 0],
      cut: Infinity,
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
    }

    for (let x = 0; x < CELL_SIDE ** 4; x++) {
      const c = [
        x % 4,
        Math.floor(x / 4) % 4,
        Math.floor(x / 16) % 4,
        Math.floor(x / 64) % 4,
      ]
      const dock =
        c[0]! + SIDE * (c[1]! + SIDE * (c[2]! + SIDE * c[3]!))
      const own = vac.store
        .subarray(dock * 12, dock * 12 + 12)
        .join(',')
      const alternatives: Int8Array[] = [new Int8Array(12)]

      for (let fr = 0; fr < 3; fr++) {
        for (let tones = 0; tones < 16; tones++) {
          const st = new Int8Array(12)

          FRAME_LINES[fr]!.forEach(
            (l, i) => (st[l] = (tones >> i) & 1 ? -1 : 1),
          )
          alternatives.push(st)
        }
      }

      for (const st of alternatives) {
        if (st.join(',') === own) {
          continue
        }

        const start = cloneConfiguration(vac)

        start.store.set(st, dock * 12)

        for (let l = 0; l < 12; l++) {
          start.sopen[dock * 12 + l] = st[l] !== 0 ? 3 : 0
        }

        let s = liquidStart(Lbox, rigidSpec, [
          { config: start, amp: [1, 0] },
        ])

        const k0 = [...s.keys()][0]

        let ok = true

        for (let t = 0; t < 12 && ok; t++) {
          s = liquidBeat(Lbox, s, t, rigidSpec, newLiquidTally())

          for (const term of s.values()) {
            if (termSingles(term) > 0) {
              ok = false
            }
          }
        }

        tested++

        if (ok && [...s.keys()][0] === k0) {
          keptNonTrivial++
        }
      }
    }

    log('rigidity')

    // ---- CHECK: the stand-in on keyed paths is the rule's occupation ----
    const keyedDiffer = [3, 0].map(n => {
      const key = fullPathKey(pathOffset(0))
      const spec: LiquidSpec = {
        n,
        bloch: false,
        K: [0, 0, 0, 0],
        cut: Infinity,
        key,
        threshold: THRESHOLD_BORN,
      }

      let s = liquidStart(Lbox, spec, [{ config: love, amp: [1, 0] }])
      let a = cloneConfiguration(love)
      let b = cloneConfiguration(love)

      const flux = new Int8Array(f.cells * 12)
      const events: KEvent[] = []

      let differ = 0

      for (let t = 0; t < CHECK_BEATS; t++) {
        gatedMix(
          f.tables,
          a,
          flux,
          flux,
          key,
          t,
          n,
          newMixTally(),
          true,
        )

        starBeat(f.tables, a, b, key, THRESHOLD_BORN, t, events)
        ;[a, b] = [b, a]
        s = liquidBeat(Lbox, s, t, spec, newLiquidTally())

        if (s.size !== 1) {
          return Infinity
        }

        const box = termOnBox(Lbox, [...s.values()][0]!, t + 1)

        for (let i = 0; i < box.vibe.length; i++) {
          if (box.vibe[i] !== a.vibe[i]) {
            differ++
          }
        }

        for (let i = 0; i < box.store.length; i++) {
          if (box.store[i] !== a.store[i]) {
            differ++
          }
        }
      }

      return differ
    })

    log('keyed check')

    // ---- L2: the coherent stand-in and its decoherent limit ----
    const runs = (
      n: number,
      window: number,
      specs: [string, LiquidSpec][],
    ): Record<
      string,
      { readings: LiquidReading[]; unitGap: number }
    > & { distance: number[] } => {
      const states = new Map<string, LiquidState>(
        specs.map(([name, spec]) => [
          name,
          liquidStart(L, spec, [{ config: love, amp: [1, 0] }]),
        ]),
      )
      const out: Record<
        string,
        { readings: LiquidReading[]; unitGap: number }
      > = Object.fromEntries(
        specs.map(([name]) => [name, { readings: [], unitGap: 0 }]),
      )
      const distance: number[] = []

      for (let t = 0; t < window; t++) {
        for (const [name, spec] of specs) {
          const s = liquidBeat(
            L,
            states.get(name)!,
            t,
            spec,
            newLiquidTally(),
          )

          states.set(name, s)
          out[name]!.readings.push(
            liquidReading(L, s, t + 1, spec.classical),
          )

          out[name]!.unitGap = Math.max(
            out[name]!.unitGap,
            Math.abs(liquidWeight(s, spec.classical) - 1),
          )
        }

        if (states.has('across')) {
          distance.push(
            liquidDistance(
              states.get('coherent')!,
              states.get('across')!,
            ),
          )
        }

        log(`n ${n} beat ${t + 1}`)
      }

      void n

      return Object.assign(out, { distance })
    }

    const zero = runs(0, WINDOW0, [
      [
        'coherent',
        { n: 0, bloch: true, K: [0, 0, 0, 0], cut: Infinity },
      ],
      [
        'across',
        { n: 0, bloch: true, K: [0, 0, KAPPA, 0], cut: Infinity },
      ],
    ])
    const three = runs(RATE, WINDOW3, [
      [
        'coherent',
        { n: RATE, bloch: true, K: [0, 0, 0, 0], cut: Infinity },
      ],
      [
        'classical',
        {
          n: RATE,
          bloch: true,
          K: [0, 0, 0, 0],
          cut: Infinity,
          classical: true,
        },
      ],
    ])
    const coh = three.coherent!.readings
    const dec = three.classical!.readings
    const L2decided = Math.max(WINDOW0, WINDOW3) >= LEVEL_BEATS
    const L2 = false
    const L3 = false

    // ---- C1: E-SPN-0121's own track ----
    const at = (xs: number[]): number[] =>
      REPORT_AT.map(t => xs[t - 1]!)
    const footprints = (n: number): number[][] =>
      [0, 1, 2, 3].map(k =>
        at(
          mixTrack({
            tables: f.tables,
            vacuum: vac,
            start: love,
            hub: X,
            key: fullPathKey(pathOffset(k)),
            threshold: THRESHOLD_BORN,
            beats: BEATS,
            side: SIDE,
            n,
          }).footprint,
        ),
      )
    const f3 = footprints(RATE)
    const f0 = footprints(0)
    const C1 =
      f3.every((r, k) =>
        r.every((v, i) => v === RECORD_RATE3[k]![i]),
      ) &&
      f0.every((r, k) => r.every((v, i) => v === RECORD_RATE0[k]![i]))

    log('C1')

    const C2 =
      zero.coherent!.readings.every(
        r =>
          Math.abs(r.onLine - 1) <= UNIT &&
          Math.abs(r.e1 - 1) <= UNIT &&
          r.maxOff === 1,
      ) && zero.distance.every(d => d <= SAME)
    const checked =
      keyedDiffer.every(d => d === 0) &&
      zero.coherent!.unitGap <= UNIT &&
      zero.across!.unitGap <= UNIT &&
      three.coherent!.unitGap <= UNIT &&
      three.classical!.unitGap <= UNIT &&
      keptNonTrivial === 0
    const status =
      !C1 || !C2 || !checked
        ? 'partial'
        : !L1 || (L2decided && !L2)
          ? 'fail'
          : L1 && L2 && L3
            ? 'pass'
            : 'open'
    const last = (r: LiquidReading[]): LiquidReading => r[r.length - 1]!
    const gapCD = Math.max(
      ...coh.map((r, i) =>
        Math.max(
          Math.abs(r.e1 - dec[i]!.e1),
          Math.abs(r.meanOff - dec[i]!.meanOff),
          Math.abs(r.onLine - dec[i]!.onLine),
        ),
      ),
    )

    const metrics: Record<string, number> = {
      L1: L1 ? 1 : 0,
      L2: L2 ? 1 : 0,
      L2_decided: L2decided ? 1 : 0,
      L3: L3 ? 1 : 0,
      control_C1: C1 ? 1 : 0,
      control_C2: C2 ? 1 : 0,
      checked: checked ? 1 : 0,
      images: liquid.images,
      imageSingles: liquid.singles,
      imageGated: liquid.gated,
      imagePeriodic: liquid.periodic,
      overlap64: liquid.overlap64,
      generators: liquid.reflections,
      generated: liquid.generated,
      reflectionChange: liquid.reflectionChange,
      minApart: liquid.minApart,
      cellDocks: liquid.cells,
      rigidTested: tested,
      rigidKept: keptNonTrivial,
      keyedDiffer3: keyedDiffer[0]!,
      keyedDiffer0: keyedDiffer[1]!,
      window0: WINDOW0,
      window3: WINDOW3,
      terms0: last(zero.coherent!.readings).terms,
      terms3: last(coh).terms,
      e1Rate3: last(coh).e1,
      e1Rate3Decoherent: last(dec).e1,
      meanOffRate3: last(coh).meanOff,
      maxOffRate3: last(coh).maxOff,
      onLineRate3: last(coh).onLine,
      coherentVsDecoherent: gapCD,
      across0: Math.max(...zero.distance),
      unitGap: Math.max(
        zero.coherent!.unitGap,
        three.coherent!.unitGap,
      ),
      footprint128Rate3: f3.reduce((s, r) => s + r[4]!, 0) / 4,
      footprint128Rate0: f0.reduce((s, r) => s + r[4]!, 0) / 4,
      seconds: (Date.now() - started) / 1000,
    }
    const trend = (r: LiquidReading[]): string =>
      r
        .map(
          (x, i) =>
            `t${i + 1}: terms ${x.terms}, e1 ${x.e1.toFixed(4)}, off ${x.meanOff.toFixed(3)}/${x.maxOff}, one line ${x.onLine.toFixed(4)}`,
        )
        .join('; ')

    return verdict({
      status,
      claim: `a frame-invariant stationary vacuum exists (${liquid.images} W(F4) images, overlap ${liquid.overlap64.toFixed(12)} after 64 beats, ${liquid.gated} gated docks, unchanged by ${liquid.reflections} generators of a group of ${liquid.generated}) but only as a superposition of images at least ${liquid.minApart} of ${liquid.cells} docks apart, since ${keptNonTrivial} of ${tested} one-dock rearrangements are vacua; on it a love sees a classical mixture of fixed vacua, so E-SPN-0121's cascade carries over; the coherent window (${WINDOW3} beats at rate 3) is far short of the ${LEVEL_BEATS} a Floquet level needs, and in it the coherent and decoherent readings agree to ${gapCD.toExponential(1)}`,
      metrics,
      control: {
        C1: C1 ? 1 : 0,
        C2: C2 ? 1 : 0,
        footprint128Rate3: metrics.footprint128Rate3!,
        footprint128Rate0: metrics.footprint128Rate0!,
        across0: metrics.across0!,
      },
      notes: `L1 ${L1} (images ${liquid.images}, singles ${liquid.singles}, gated ${liquid.gated}, periodic ${liquid.periodic}, overlap ${liquid.overlap64}, reflections ${liquid.reflections} change ${liquid.reflectionChange}, min apart ${liquid.minApart} of ${liquid.cells}). Rigidity: ${keptNonTrivial} of ${tested} non-trivial one-dock alternatives keep Z and the period. L2 undecided (window ${WINDOW0} beats at n = 0, ${WINDOW3} at n = 3, ${LEVEL_BEATS} needed). n = 0: ${trend(zero.coherent!.readings)}; across-line moduli ${zero.distance.map(d => d.toExponential(1)).join(' ')}. n = 3 coherent: ${trend(coh)}; decoherent: ${trend(dec)}. C1 rate 3 ${f3.map(r => r.join('/')).join('; ')}; rate 0 ${f0.map(r => r.join('/')).join('; ')}. Keyed check differ ${keyedDiffer.join(', ')}. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
