// BORN WEIGHTS FROM THE BULK'S RECORDS (E-QTM-0198, quantum-coverage 0028, OPEN-QTM-15 and the Born rule). Physics is
// read on the 3d husk and the 4d bulk below is raw experience. E-HLG-0040 found that the bulk records the husk count
// exactly (no coherence between different husk counts), so a husk outcome is written down into the bulk as definite
// record configurations. This file explores whether the bulk's own measure of those records gives the Born rule: for
// each husk outcome, does the share of the bulk's record configurations (base configurations, each weighed the same,
// the measure a permutation step keeps, E-FND-0082) equal the outcome's Born weight |amplitude|^2?
//
// THE RULE AND THE MESH: the full superposed rule (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', every link
// the identity, exact in Z[w][1/2]) on the true labelled {3,4,3,4} mesh below one cusp, as in E-HLG-0040: the growing
// patch (code/measure/husk-content growingPatch, no frontier) to beat 8, and the line tube (lineTube, a ring along the
// line, equal to the infinite line until content wraps) to beat 64. Lines of class 'ahead' meet the husk in two docks
// (positions 0 and 1), lines of class 'down' in one (position 0).
//
// THE TWO WEIGHTS PER OUTCOME (code/measure/bulk-record-born recordTally). The rule's branches are merged, so each is
// one base configuration with a nonzero amplitude. Born(o) = sum of |amplitude|^2 over configurations showing o, over
// the total. Count(o) = number of configurations showing o, over the number of configurations. Both exact fractions.
//
// THE RUNS.
//  P  PREPARED: a husk superposition of two outcomes, alpha |A> + beta |B>. A is a lone open love on the base husk
//     dock on an ahead line (husk count 1); B is a lone open love one dock down a down line through the same dock (husk
//     count 0). The two sit on different lines, and by the line law each stays on its own, so their configurations are
//     disjoint at every beat: the line the vibe is on is a bulk record of the prepared husk count. Two readings at each
//     beat: R1 the prepared outcome (A or B, read by the line), R2 the husk count now (the pointer of E-HLG-0040).
//     Amplitude sets (alpha, beta): (1, 1), (1, w), (1, 1 - w), (1, 2), (1 - w, 1), so Born(A) = 1/2, 1/2, 1/4, 1/5,
//     3/4 (unnormalized starts: every weight is a ratio, and the rule keeps the norm).
//  N  NATURAL: no preparation, the husk count the rule's own leak makes: a lone vibe (E-HLG-0039) and the fear stream
//     (a closed fear on every other dock of the line, E-HLG-0040's one held content, Born(husk) 13/16 and 9/16), each on
//     both classes, on the tube, outcome the open vibe's husk count.
//
// DERIVED BEFORE THE GATE RUN.
//  (a) Linearity: alpha U^t|A> + beta U^t|B> has the support of U^t|A> joined with that of U^t|B> for every nonzero
//      alpha, beta. So the record configurations, and with them any weight that is a function of the configuration
//      alone, are the same for every amplitude set, while Born(A) = |alpha|^2 / (|alpha|^2 + |beta|^2) moves. A
//      configuration measure can match Born on at most the amplitude sets that share one Born weight.
//  (b) The lone vibe holds 2 configurations per line position it reaches (2t at beat t, probe below), so its husk count
//      share is 2/(2t) = 1/t against Born about 1.12/t: close in shape, not equal.
//  (c) The fear stream's Born(husk) is constant while its configurations grow by one a beat: the count share falls as
//      about 2/t. Count and Born part without bound.
//
// PROBE BEFORE THE GATES, DISCLOSED. tmp/qtm198-probe.ts (test/record/E-QTM-0198/probe1.log): on the tube to beat 32,
//  the lone vibe holds 2t configurations, husk Born 0.0351 against count 0.0313 at beat 32 (both classes alike at even
//  beats); the fear stream holds t + 1, husk Born 0.8125 (ahead) and 0.5625 (down) against count 2/33 and 1/33 at beat
//  32. So (b) and (c) were seen; the prepared superposition, the patch, the controls and the weighting scan are new.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every branch of every run keeps the start's count (vibes plus two per stored pair); the patch mesh
//     reads 0 reciprocity misses and 0 off-integer levels; every patch branch has its vibe on the start line of its
//     component.
//  I2 THE PATCH IS THE TUBES: on P, the patch's state split by line equals each component's tube run (started with its
//     amplitude) bit for bit at beats 1 to 8, and the patch's R1 and R2 tallies (Born numerators and counts) equal the
//     tubes' combined tallies exactly, for every amplitude set.
//  I3 DISJOINT AND NORM: on P the two components share no configuration at any beat, and the total Born weight equals
//     |alpha|^2 + |beta|^2 (times 4^K) at every beat.
//  C1 MIXTURE CONTROL: with every amplitude of a run set to 1 on its configurations (the uniform mixture over the same
//     records, the measure a permutation keeps), the Born tally equals the count tally exactly on every outcome, every
//     beat, every run.
//  C2 EQUAL AMPLITUDES: on P with (1, 1) and (1, w), Born(A) = 1/2 and Count(A) = 1/2 exactly at every beat.
//  S  SAME RECORDS: the support (set of configurations) of P is the same for every amplitude set at every beat.
//  H  THE HYPOTHESIS: Count(o) = Born(o) exactly on every outcome of every run (P on R1 and R2, N) at every beat read.
//  W  WEIGHTINGS: configuration weights that depend only on the open vibe's depth d (line steps from the nearest husk
//     dock): power (d + 1)^g and exponential e^(g d), g from -6 to 6 in steps of 0.01, scanned on the N runs over beats
//     8 to 64; reported the least largest error |weighted share - Born| on the husk outcome. A weighting recovers Born
//     when that error is at most 1e-9. Link count is not a separate weighting: every dock has 24 links (on the husk 6
//     along it and 18 down), so weighting by links is the uniform count.
// VERDICT, fixed before the run: PASS when I1, I2, I3, C1, C2 hold and H holds (the bulk's record count is the Born
//  weight); FAIL when they hold and H fails somewhere; PARTIAL when an instrument or control fails. PREDICTED: fail, by
//  (a) on P and by (c) on the fear stream; S holds; no weighting recovers Born.
// WHAT THIS CAN AND CANNOT SHOW. One vibe per component, trivial links, the empty mesh, one husk dock and its line
//  classes, beats to 64. It reads the uniform measure on base configurations and weights by depth; a measure that
//  depends on the amplitudes (Zurek's fine-graining, splitting each configuration into |amplitude|^2 4^K equal pieces)
//  equals Born by construction and is not a measure of configurations.
//
// GATE RUN 2026-10-27 (test/record/E-QTM-0198/gate-run-1.log, 10 s): FAIL, as predicted; every gate as registered, none
//  moved; title and claim written after the run. I1, I2, I3, C1, C2 and S hold: the patch equals the tubes bit for bit
//  to beat 8 on all 5 amplitude sets, the two components never share a configuration, the norm is kept, the flat
//  mixture's Born tally equals its count on every outcome, and (1, 1) and (1, w) give 1/2 and 1/2.
//  P, R1 (the prepared husk count, recorded by the line): Count(A) = 1/2 at every beat for every amplitude set (the
//  records are the same configurations, S), while Born(A) = 1/2, 1/2, 1/4, 1/5, 3/4. Equal only where the amplitudes are
//  equal in size. R2 (husk count now): Count(husk) = 1/(2t) for every set, Born(husk) 0.0087, 0.0087, 0.0043, 0.0035,
//  0.0130 at beat 64.
//  N: the lone vibe holds 2t configurations, Born(husk) 0.0174 against Count 1/64 at beat 64 (ratio 1.113, both
//  classes); the fear stream holds t + 1, Born(husk) exactly 13/16 and 9/16 against Count 2/65 and 1/65 (ratios 26.4
//  and 36.6, growing as t).
//  W: no depth weighting recovers Born: the best one-parameter power weight misses by 0.355 and the best exponential
//  by 0.340 over the four natural runs. Each family fits one kind of run alone and not the other: the lone vibes by
//  (d + 1)^-0.14 to 0.029, the fear streams by e^(-1.15 d) to 0.0007 (close, never exact).
//
// Depth L2: a known fact (branch counting is blind to amplitudes, the problem of every Everett reading that counts
//  branches) read on the rule's own records on the true mesh, with exact controls.
//
// DETERMINISM: no random number; exact Eisenstein weights, float frames checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { buildLazyCuspMesh, lineCells } from '@/code/measure/husk-closure'
import {
  emptyConfiguration,
  growingPatch,
  lineKeys,
  lineTube,
  placeOnLine,
  sameKeys,
  type LineContent,
} from '@/code/measure/husk-content'
import {
  addTallies,
  flatState,
  recordTally,
  sameShare,
  scaledState,
  shareOf,
  supportKeys,
  type RecordTally,
} from '@/code/measure/bulk-record-born'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { lockedState, type Branch, type LockedState } from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'

const SLOTS = 24
const LINES = 12
const PATCH_BEATS = 8
const TUBE_BEATS = 64
const TUBE = 2 * TUBE_BEATS + 16
const SCAN_FROM = 8
const EXACT = 1e-9

type Amplitude = readonly [bigint, bigint]

// (a, b) is a + b w
const AMPLITUDES: readonly { name: string; alpha: Amplitude; beta: Amplitude }[] = [
  { name: '1,1', alpha: [1n, 0n], beta: [1n, 0n] },
  { name: '1,w', alpha: [1n, 0n], beta: [0n, 1n] },
  { name: '1,1-w', alpha: [1n, 0n], beta: [1n, -1n] },
  { name: '1,2', alpha: [1n, 0n], beta: [2n, 0n] },
  { name: '1-w,1', alpha: [1n, -1n], beta: [1n, 0n] },
]

const norm = (z: Amplitude): bigint => z[0] * z[0] - z[0] * z[1] + z[1] * z[1]

const tubePosition = (i: number): number => (i <= TUBE / 2 ? i : i - TUBE)
const tubeDock = (p: number): number => ((p % TUBE) + TUBE) % TUBE

const countOf = (br: Branch): number => {
  let n = 0

  for (let i = 0; i < br.vibe.length; i++) {
    if (br.vibe[i] !== 0) {
      n++
    }
  }

  for (let i = 0; i < br.store.length; i++) {
    if (br.store[i] !== 0) {
      n += 2
    }
  }

  return n
}

// the docks of a branch's open vibes (open slots and open stored pairs)
const openDocks = (br: Branch): number[] => {
  const out: number[] = []

  for (let i = 0; i < br.vibe.length; i++) {
    if (br.vibe[i] !== 0 && br.open[i]) {
      out.push((i / SLOTS) | 0)
    }
  }

  for (let i = 0; i < br.store.length; i++) {
    if (br.store[i] !== 0 && br.sopen[i]) {
      out.push((i / LINES) | 0)
    }
  }

  return out
}

const huskCountOutcome =
  (isHusk: (dock: number) => boolean) =>
  (br: Branch): string =>
    `${openDocks(br).filter(isHusk).length}`

// flat tallies equal (control C1)
const flatEqual = (t: RecordTally): boolean => {
  for (const [o, w] of t.born) {
    if (!sameShare(w, t.bornTotal, t.count.get(o) ?? 0n, t.countTotal)) {
      return false
    }
  }

  return t.born.size === t.count.size
}

const sameTally = (x: RecordTally, y: RecordTally): boolean => {
  const K = Math.max(x.K, y.K)
  const lx = BigInt(2 * (K - x.K))
  const ly = BigInt(2 * (K - y.K))
  const keys = new Set([...x.born.keys(), ...y.born.keys()])

  for (const o of keys) {
    if (((x.born.get(o) ?? 0n) << lx) !== ((y.born.get(o) ?? 0n) << ly)) {
      return false
    }

    if ((x.count.get(o) ?? 0n) !== (y.count.get(o) ?? 0n)) {
      return false
    }
  }

  return true
}

// does count equal Born on every outcome of a tally
const countIsBorn = (t: RecordTally): boolean => {
  const keys = new Set([...t.born.keys(), ...t.count.keys()])

  for (const o of keys) {
    if (!sameShare(t.born.get(o) ?? 0n, t.bornTotal, t.count.get(o) ?? 0n, t.countTotal)) {
      return false
    }
  }

  return true
}

type Line = {
  name: string
  slot: number
  husk: ReadonlySet<number>
}

function tubeStart(line: Line, content: LineContent, amplitude: Amplitude): LockedState {
  const c = emptyConfiguration(TUBE)

  placeOnLine({ configuration: c, dockAt: tubeDock, slot: line.slot, content })

  return scaledState(lockedState(c), amplitude[0], amplitude[1], 0)
}

const loneAt = (position: number): LineContent => ({
  vibes: [{ position, forward: true, value: 1, open: true, point: 0 }],
  stores: [],
})

// the depth of a line position below the husk: steps to the nearest husk position
const depthOf = (husk: ReadonlySet<number>, p: number): number =>
  Math.min(...[...husk].map(h => Math.abs(p - h)))

// ---- N: natural runs on the tube ----

type NaturalRun = {
  tag: string
  // per beat 1..TUBE_BEATS: Born(husk) share, count share, configurations
  born: number[]
  count: number[]
  configurations: number[]
  // per beat: the open vibe's depth and whether it is on the husk, per configuration, and its Born numerator share
  records: { depth: number; husk: boolean }[][]
  born1: number[]
  flat: boolean
  kept: boolean
  bornEqualsCount: boolean
}

function naturalRun(line: Line, kind: 'lone' | 'fearStream'): NaturalRun {
  const all = Array.from({ length: TUBE }, (_, i) => tubePosition(i))
  const content: LineContent =
    kind === 'lone'
      ? loneAt(0)
      : {
          vibes: [
            ...loneAt(0).vibes,
            ...all
              .filter(p => p !== 0)
              .map(p => ({ position: p, forward: false, value: -1 as const, open: false })),
          ],
          stores: [],
        }
  const tables = lineTube({ slot: line.slot, length: TUBE })
  const isHusk = (x: number): boolean => line.husk.has(tubePosition(x))
  const outcomeOf = huskCountOutcome(isHusk)

  let st = tubeStart(line, content, [1n, 0n])

  const start = countOf(st.branches[0]!)
  const out: NaturalRun = {
    tag: `${kind}_${line.name}`,
    born: [],
    count: [],
    configurations: [],
    records: [],
    born1: [],
    flat: true,
    kept: true,
    bornEqualsCount: true,
  }

  for (let t = 1; t <= TUBE_BEATS; t++) {
    st = coinedVetoBeat('none', tables, st, t - 1)

    const r = recordTally({ state: st, outcomeOf })

    out.born.push(shareOf(r.born.get('1') ?? 0n, r.bornTotal))
    out.count.push(shareOf(r.count.get('1') ?? 0n, r.countTotal))
    out.configurations.push(Number(r.countTotal))
    out.flat &&= flatEqual(recordTally({ state: flatState(st), outcomeOf }))
    out.kept &&= st.branches.every(b => countOf(b) === start)
    out.bornEqualsCount &&= countIsBorn(r)
    out.records.push(
      st.branches.map(b => {
        const d = openDocks(b)[0]!

        return { depth: depthOf(line.husk, tubePosition(d)), husk: isHusk(d) }
      }),
    )
  }

  return out
}

// least largest error of a one-parameter depth weighting over the natural runs, beats SCAN_FROM..TUBE_BEATS
function scanWeighting(
  runs: readonly NaturalRun[],
  weight: (depth: number, g: number) => number,
): { g: number; error: number } {
  let best = { g: Number.NaN, error: Number.POSITIVE_INFINITY }

  for (let gi = -600; gi <= 600; gi++) {
    const g = gi / 100

    let worst = 0

    for (const run of runs) {
      for (let t = SCAN_FROM; t <= TUBE_BEATS; t++) {
        let husk = 0
        let total = 0

        for (const rec of run.records[t - 1]!) {
          const w = weight(rec.depth, g)

          total += w

          if (rec.husk) {
            husk += w
          }
        }

        worst = Math.max(worst, Math.abs(husk / total - run.born[t - 1]!))
      }
    }

    if (worst < best.error) {
      best = { g, error: worst }
    }
  }

  return best
}

export function bulkRecordBornRun(): Verdict {
  const started = Date.now()
  const mesh = buildLazyCuspMesh()
  const base = mesh.base
  const classOf = (slot: number): string =>
    [...lineCells({ mesh, dock: base, slot, reach: 2 })]
      .filter(([x]) => mesh.level(x) === 1)
      .map(([, p]) => p)
      .sort((a, b) => a - b)
      .join(',')
  const slots = Array.from({ length: SLOTS }, (_, s) => s)
  const ahead: Line = {
    name: 'ahead',
    slot: slots.find(s => classOf(s) === '0,1')!,
    husk: new Set([0, 1]),
  }
  const down: Line = {
    name: 'down',
    slot: slots.find(s => classOf(s) === '0')!,
    husk: new Set([0]),
  }
  const metrics: Record<string, number> = {}
  const lines: string[] = []

  let i1 = true
  let i2 = true
  let i3 = true
  let c1 = true
  let c2 = true
  let s = true
  let h = true

  // ---- P: the prepared superposition ----
  const B_POSITION = 1
  const aheadCells = lineCells({ mesh, dock: base, slot: ahead.slot, reach: PATCH_BEATS + 4 })
  const downCells = lineCells({ mesh, dock: base, slot: down.slot, reach: PATCH_BEATS + 4 })
  const downAt = new Map([...downCells].map(([x, p]) => [p, x]))
  const supports: Set<string>[][] = []

  for (const amp of AMPLITUDES) {
    // the patch: both components in one state
    const patch = growingPatch(mesh)
    const ca = emptyConfiguration(mesh.size())
    const cb = emptyConfiguration(mesh.size())

    placeOnLine({ configuration: ca, dockAt: () => base, slot: ahead.slot, content: loneAt(0) })
    placeOnLine({
      configuration: cb,
      dockAt: p => downAt.get(p)!,
      slot: down.slot,
      content: loneAt(B_POSITION),
    })

    let sp: LockedState = patch.widen({
      branches: [
        ...scaledState(lockedState(ca), amp.alpha[0], amp.alpha[1], 0).branches,
        ...scaledState(lockedState(cb), amp.beta[0], amp.beta[1], 0).branches,
      ],
    })

    // the tubes
    const ta = lineTube({ slot: ahead.slot, length: TUBE })
    const tb = lineTube({ slot: down.slot, length: TUBE })
    let sa = tubeStart(ahead, loneAt(0), amp.alpha)
    let sb = tubeStart(down, loneAt(B_POSITION), amp.beta)

    const normStart = norm(amp.alpha) + norm(amp.beta)
    const huskA = (x: number): boolean => ahead.husk.has(tubePosition(x))
    const huskB = (x: number): boolean => down.husk.has(tubePosition(x))
    const bornA: number[] = []
    const countA: number[] = []
    const bornHusk: number[] = []
    const countHusk: number[] = []
    const ampSupports: Set<string>[] = []

    let r1Equal = true
    let r2Equal = true

    for (let t = 1; t <= TUBE_BEATS; t++) {
      sa = coinedVetoBeat('none', ta, sa, t - 1)
      sb = coinedVetoBeat('none', tb, sb, t - 1)

      const r1 = addTallies([
        recordTally({ state: sa, outcomeOf: () => 'A' }),
        recordTally({ state: sb, outcomeOf: () => 'B' }),
      ])
      const r2 = addTallies([
        recordTally({ state: sa, outcomeOf: huskCountOutcome(huskA) }),
        recordTally({ state: sb, outcomeOf: huskCountOutcome(huskB) }),
      ])

      // I3: disjoint (different lines, so different keys; read on tube keys tagged by component) and the norm
      i3 &&= r1.bornTotal === normStart << BigInt(2 * r1.K)
      i1 &&= sa.branches.every(b => countOf(b) === 1) && sb.branches.every(b => countOf(b) === 1)

      // C1
      c1 &&=
        flatEqual(
          addTallies([
            recordTally({ state: flatState(sa), outcomeOf: () => 'A' }),
            recordTally({ state: flatState(sb), outcomeOf: () => 'B' }),
          ]),
        ) &&
        flatEqual(
          addTallies([
            recordTally({ state: flatState(sa), outcomeOf: huskCountOutcome(huskA) }),
            recordTally({ state: flatState(sb), outcomeOf: huskCountOutcome(huskB) }),
          ]),
        )

      // C2
      if (amp.name === '1,1' || amp.name === '1,w') {
        c2 &&=
          sameShare(r1.born.get('A')!, r1.bornTotal, 1n, 2n) &&
          sameShare(r1.count.get('A')!, r1.countTotal, 1n, 2n)
      }

      r1Equal &&= countIsBorn(r1)
      r2Equal &&= countIsBorn(r2)
      bornA.push(shareOf(r1.born.get('A') ?? 0n, r1.bornTotal))
      countA.push(shareOf(r1.count.get('A') ?? 0n, r1.countTotal))
      bornHusk.push(shareOf(r2.born.get('1') ?? 0n, r2.bornTotal))
      countHusk.push(shareOf(r2.count.get('1') ?? 0n, r2.countTotal))

      // S: the support, keyed by component and tube configuration
      const support = new Set<string>()

      for (const k of supportKeys(sa)) {
        support.add(`A|${k}`)
      }

      for (const k of supportKeys(sb)) {
        support.add(`B|${k}`)
      }

      ampSupports.push(support)

      if (t > PATCH_BEATS) {
        continue
      }

      // the patch beat, I1 and I2
      sp = patch.beat(sp, t - 1)

      const onA = (br: Branch): boolean => {
        for (let i = 0; i < br.vibe.length; i++) {
          if (br.vibe[i] !== 0) {
            return LINE_OF[i % SLOTS] === LINE_OF[ahead.slot]
          }
        }

        return false
      }
      const pa: LockedState = { branches: sp.branches.filter(onA) }
      const pb: LockedState = { branches: sp.branches.filter(b => !onA(b)) }
      const ka = lineKeys({ state: pa, positionOf: x => aheadCells.get(x), slot: ahead.slot })
      const kb = lineKeys({ state: pb, positionOf: x => downCells.get(x), slot: down.slot })
      const kta = lineKeys({ state: sa, positionOf: tubePosition, slot: ahead.slot })
      const ktb = lineKeys({ state: sb, positionOf: tubePosition, slot: down.slot })

      const keysA = supportKeys(pa)

      i3 &&= [...supportKeys(pb)].every(k => !keysA.has(k))
      i1 &&= ka.offLine === 0 && kb.offLine === 0 && sp.branches.every(b => countOf(b) === 1)
      i2 &&= sameKeys(ka.keys, kta.keys) && sameKeys(kb.keys, ktb.keys)

      const isHuskPatch = (x: number): boolean => mesh.level(x) === 1
      const p1 = recordTally({ state: sp, outcomeOf: b => (onA(b) ? 'A' : 'B') })
      const p2 = recordTally({ state: sp, outcomeOf: huskCountOutcome(isHuskPatch) })

      i2 &&= sameTally(p1, r1) && sameTally(p2, r2)
    }

    supports.push(ampSupports)
    h &&= r1Equal && r2Equal

    const at = [1, 2, 4, 8, 16, 32, 64]

    metrics[`P_${amp.name}_bornA`] = bornA[TUBE_BEATS - 1]!
    metrics[`P_${amp.name}_countA`] = countA[TUBE_BEATS - 1]!
    metrics[`P_${amp.name}_bornHusk_t64`] = bornHusk[TUBE_BEATS - 1]!
    metrics[`P_${amp.name}_countHusk_t64`] = countHusk[TUBE_BEATS - 1]!
    metrics[`P_${amp.name}_countIsBorn_R1`] = r1Equal ? 1 : 0
    metrics[`P_${amp.name}_countIsBorn_R2`] = r2Equal ? 1 : 0
    lines.push(
      `P (${amp.name}): R1 Born(A) ${at.map(t => bornA[t - 1]!.toFixed(4)).join(' ')}, Count(A) ${at.map(t => countA[t - 1]!.toFixed(4)).join(' ')}; R2 Born(husk) ${at.map(t => bornHusk[t - 1]!.toFixed(4)).join(' ')}, Count(husk) ${at.map(t => countHusk[t - 1]!.toFixed(4)).join(' ')} (beats ${at.join(', ')})`,
    )
  }

  for (let t = 0; t < TUBE_BEATS; t++) {
    const first = supports[0]![t]!

    for (const other of supports.slice(1)) {
      const o = other[t]!

      s &&= o.size === first.size && [...o].every(k => first.has(k))
    }
  }

  // ---- N: natural runs ----
  const naturals = [
    naturalRun(ahead, 'lone'),
    naturalRun(down, 'lone'),
    naturalRun(ahead, 'fearStream'),
    naturalRun(down, 'fearStream'),
  ]

  for (const n of naturals) {
    i1 &&= n.kept
    c1 &&= n.flat
    h &&= n.bornEqualsCount

    const at = [1, 2, 4, 8, 16, 32, 64]

    metrics[`N_${n.tag}_born_t64`] = n.born[TUBE_BEATS - 1]!
    metrics[`N_${n.tag}_count_t64`] = n.count[TUBE_BEATS - 1]!
    metrics[`N_${n.tag}_configurations_t64`] = n.configurations[TUBE_BEATS - 1]!
    metrics[`N_${n.tag}_ratio_t64`] = n.born[TUBE_BEATS - 1]! / n.count[TUBE_BEATS - 1]!
    lines.push(
      `N ${n.tag}: Born(husk) ${at.map(t => n.born[t - 1]!.toFixed(4)).join(' ')}, Count(husk) ${at.map(t => n.count[t - 1]!.toFixed(4)).join(' ')}, configurations ${at.map(t => n.configurations[t - 1]).join(' ')} (beats ${at.join(', ')})`,
    )
  }

  // ---- W: depth weightings ----
  const power = scanWeighting(naturals, (d, g) => (d + 1) ** g)
  const exponential = scanWeighting(naturals, (d, g) => Math.exp(g * d))
  const lonePower = scanWeighting(naturals.slice(0, 2), (d, g) => (d + 1) ** g)
  const fearExp = scanWeighting(naturals.slice(2), (d, g) => Math.exp(g * d))
  const recovers = power.error <= EXACT || exponential.error <= EXACT

  metrics.W_power_g = power.g
  metrics.W_power_error = power.error
  metrics.W_exponential_g = exponential.g
  metrics.W_exponential_error = exponential.error
  metrics.W_lonePower_g = lonePower.g
  metrics.W_lonePower_error = lonePower.error
  metrics.W_fearExponential_g = fearExp.g
  metrics.W_fearExponential_error = fearExp.error
  lines.push(
    `W: power (d+1)^g best g ${power.g} error ${power.error.toFixed(4)}; exponential e^(g d) best g ${exponential.g} error ${exponential.error.toFixed(4)}; lone vibes alone, power g ${lonePower.g} error ${lonePower.error.toFixed(4)}; fear streams alone, exponential g ${fearExp.g} error ${fearExp.error.toFixed(4)}`,
  )

  const health = mesh.health()

  i1 &&= health.reciprocityMisses === 0 && health.offInteger === 0

  const instruments = i1 && i2 && i3 && c1 && c2
  const status = instruments ? (h ? 'pass' : 'fail') : 'partial'
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `the bulk's record configurations ${h ? 'give' : 'do not give'} the Born weight: on a prepared husk superposition the record count is ${s ? 'the same for every amplitude set' : 'amplitude dependent'}, and ${recovers ? 'a depth weighting recovers Born' : 'no depth weighting recovers Born'} on the natural runs`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_I2: i2 ? 1 : 0,
      gate_I3: i3 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_S: s ? 1 : 0,
      gate_H: h ? 1 : 0,
      weightingRecovers: recovers ? 1 : 0,
      reciprocityMisses: health.reciprocityMisses,
      offInteger: health.offInteger,
      meshDocks: mesh.size(),
      ...metrics,
      seconds,
    },
    control: { mixtureCountIsBorn: c1 ? 1 : 0, equalAmplitudesHalf: c2 ? 1 : 0 },
    notes: `L2. Gates I1 ${i1}, I2 ${i2}, I3 ${i3}, C1 ${c1}, C2 ${c2}, S ${s}, H ${h}; weighting recovers ${recovers}. ${lines.join(' | ')}. ${seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/bulk-record-born',
  code: 'E-QTM-0198',
  title:
    "explores whether the share of the bulk's record configurations for each husk outcome equals its Born weight, fail: on a prepared husk superposition alpha |A> + beta |B> (a vibe on the husk, a vibe one dock down another line) the line records the prepared husk count, and the records are the same configurations for every amplitude set, so Count(A) = 1/2 while Born(A) = 1/2, 1/2, 1/4, 1/5, 3/4; with no preparation the lone vibe holds 2t configurations (husk Born 0.0174 against count 1/64 at beat 64) and the fear stream t + 1 (husk Born exactly 13/16 and 9/16 against 2/65 and 1/65); no weight by depth recovers Born (best power 0.355, exponential 0.340 off, each fits one kind of run alone); controls: the flat mixture's count is its Born weight exactly, equal amplitudes give 1/2 and 1/2, patch equals tubes bit for bit to beat 8",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return bulkRecordBornRun()
  },
})
