// EVERY CONSERVED DENSITY OF THE WORKING RULE ON TWO NEIGHBORING DOCKS, UP TO DEGREE 2, BY EXACT LINEAR ALGEBRA
// (E-FND-0171, the momentum density). E-FND-0170 found that within degree 2 at support ONE dock the working rule keeps
// only the love and fear counts L and F (and, on the vacuum family, the per-direction counts L_l, F_l). A global charge
// from translation always has a local density, but that density may straddle a link. K1a of the routes file
// (note/project/vibe/roadmap/research/routes/gravity-cosmos-heat-classical.md) asks the next support: is there a conserved
// density on two neighboring docks, in particular a MOMENTUM density? Hydrodynamics with a velocity field (Navier-Stokes)
// needs one; with only L and F conserved locally the long-wavelength theory is two coupled diffusions.
//
// DEFINITION. Q(s) = sum over docks x of [ q1(s at x) + sum over the twelve line directions l of q_l(s at x, s at
// y_l(x)) ], y_l(x) the dock that x's slot f_l (the line's first slot) streams into. q1 is E-FND-0170's degree-<= 2
// one-dock density (2,593 features) and q_l is BILINEAR, a product of one tone indicator of x and one of y_l(x) (72 x 72
// per direction, 62,208 in all): every degree-<= 2 function of two docks is a one-dock part plus a bilinear part
// (code/measure/pair-density). 64,801 features. DEGREE 1 IS NOT RE-RUN: a linear density on two docks sums to a one-dock
// one, so the degree-1 answer at support two is E-FND-0170's (L and F, Z3 the same).
//
// THE SPLIT (code/measure/character-split). 64,801 unknowns is too many for the dense Gram solve. The four coordinate
// reflections of the roots (each negates one coordinate: elements of W(F4), commuting involutions) generate H = (Z2)^4,
// which acts on the features by relabeling slots, with a link turned around when its direction is sent to a second
// slot. For each of the 16 characters chi of H the rows are reduced exactly to V_chi, the densities with v[h f] =
// chi(h) v[f]. N(A) meet V_chi is solved on its own, and the sum over chi is the largest H-invariant part of N(A):
// every conserved density whose coordinate reflections are conserved too, which is every one when the rule is covariant
// (E-FND-0170 found N(A) carried into itself by all 24 root reflections at support one). This is the W(F4)-covariant
// search the route asks for. The characters also CLASSIFY: L and F lie in the trivial character, and a momentum density
// P_k (a W(F4) vector, odd under reflection) lies in the character odd under the flip of coordinate k alone, so a
// momentum-like invariant would show as found in the characters 1, 2, 4 and 8 (bit k for coordinate k).
// THE SOLVE (code/algebra/linear/peeled-null-space): each reduced system is first PEELED (a row of one live column
// zeroes it, a row a x + b y with |a| = |b| merges two columns), which is exact, then the remainder goes through the
// certified Gram solve of E-FND-0170 (code/algebra/linear/exact-null-space), and every basis vector is lifted back and
// checked against every original reduced row in integer arithmetic.
//
// THE RULE. E-FND-0170's exactly: code/measure/full-key-paths keyedRunner on the contact 'pass', coin on, the meeting,
// the no-veto store, no mixer, the full-period key at offset 0. Rows are f(U_t s) - f(s) (A) and the states f(s) (B),
// INVARIANTS FOUND = dim N(A) - dim N(B), as there. Families, NO random numbers:
//   G1 E-FND-0170's local family on side 4 unchanged (every content of one dock with up to 3 vibes, up to 2 stores and
//      the table momenta, beats 0..3), now read with the bilinears: after one beat a dock's vibes sit on up to 24
//      neighbors of x0, many of them linked to each other.
//   G2 TWO DOCKS, side 4: x0 and y = the target of x0's slot d, for all 24 slots d (both link orientations), beats 0..3:
//      (a) every single at x0 (a love or a fear on one of 24 slots, or one store of either sign: 72) with every single
//      at y (72); (b) every LINE PAIR at x0 (both slots of one line, ++, --, +-, -+: 48) with every single at y.
//   V  THE VACUUM FAMILY on side 8: E-FND-0170's 96 disturbances of the working vacuum, 48 beats, rows against the
//      vacuum run on the same key.
// SIDE 4 ALIASES ONE LINK PER DIRECTION (tmp/ax-probe2, a probe of geometry only): among x0, y and their 48 targets,
// exactly one pair per d (a target of x0 and a target of y) is linked on the side-4 torus and not on side 8 (2 r_d -
// r_e is a root mod 4). One beat moves a trit one dock and acts inside docks, so the DYNAMICS of a probe is the side-8
// dynamics; only a bilinear on that false link would be counted wrongly. So a G2 beat that leaves both ends of its
// direction's false link occupied is RUN AGAIN ON SIDE 8 (x0 at the center, y the target of the same slot, the same
// beat) and its row read there, and counted. G1 never touches a false link (checked). V runs on side 8, where the
// relations among the ring agree with every larger side (checked against side 8 itself at x0 and y).
// THIS WAS A DROP UNTIL A BUG SHOWED. Runs 2 and 3 dropped such a beat from A and kept its starting state in B. A
// store pair (or two vibes) on line l at x0 and x0 + r_l releases onto x0 - r_l and x0 + 2 r_l, which is exactly the
// false link (3 r_l is -r_l mod 4), so EVERY beat of those probes was dropped and their bilinears appeared in states and
// in no change: 60 spurious "invariants", per-line store x store and tone x line-tone products along a line's own
// link. The post-run read tmp/ax-third.ts (side 8, no aliasing; run on the droplet) showed they change in 192 of 192
// two-particle beats (store products) and 336 of 384 (tone products), and in 26,880 of 26,880 and 48,000 of 53,760
// beats with a third particle. They are not conserved. The rerun on side 8 replaces the drop. No gate moved.
//
// HYPOTHESES, written before any run of this file (the only probes before it, tmp/ax-probe2, read the neighbor tables,
// the side-4 aliasing above, the coordinate flips and the time of a beat, nothing conserved).
//  H1 NOTHING BEYOND L AND F: on G (G1 and G2 together) the found dimension summed over the 16 characters is 2, L and F
//     both in N(A), both in the trivial character; on V it is 24, every L_l and F_l in N(A), nothing beyond their span.
//  P  FALSIFIER: one invariant on G beyond span(L, F), or on V beyond span(L_l, F_l); in particular any found in the
//     characters 1, 2, 4, 8 (momentum-like, odd under one coordinate reflection).
// BOTH OUTCOMES ARE INFORMATIVE. A conserved two-dock momentum density means hydrodynamics with a velocity field can
// emerge from local conservation; none means Navier-Stokes cannot come from local conservation at support two, and the
// long-wavelength theory of the rule stays two coupled diffusions (K1b), whatever a larger support might add.
// PREDICTED: H1 holds. A bilinear changes when either of its docks changes, so a conserved one needs its two docks'
// changes to cancel across every link a beat creates, and the coin (a vibe handed from r to -r by a key that depends on
// the dock) breaks the occupation momentum at support one with nothing on the neighbor to compensate.
//
// CONTROLS (a failure makes the verdict partial). C1 MORE INVARIANTS: the bare stream (a slot permutation that keeps every
// slot's direction) on G finds strictly more than the rule on G in the trivial character and in character 1. C2 NONE:
// E-FND-0170's decay map (the stream, then every trit raised by one mod 3) on G finds 0 in characters 0 and 1.
// (The controls were first written on G2 alone. A smoke of this file on a family thinned 64-fold, tmp/ax-smoke2, found
// the decay map leaving 146 there, because G2 alone has no one-dock probes to pin the linear part. They were moved to
// the rule's own family G before the gate run, which is where E-FND-0170 ran them. Nothing else moved.)
// INSTRUMENT (a failure makes the verdict partial). I1 E-FND-0170's toy rule 184 (one invariant) and I2 its mod-3 triple
// toggle (0 over Q). I3 every null basis lifted to rationals and verified against every original row. I4 the neighbor
// tables on sides 4 and 8 are consistent (the opposite slot streams back) and bijective; the four flips are involutions
// that commute and carry roots to roots. I5 one probe in 64 scanned over the whole box after its beat: no trit outside
// x0, y and their targets. I6 two vacuum runs agree trit for trit. I7 THE SPLIT ON A KNOWN CASE: the one-dock part of G1
// (E-FND-0170's own features) read through the 16 characters gives the same found dimension as the unsplit dense solve,
// 2. I8 the side-4 aliasing is only links (no two ring docks coincide on side 4 that differ on side 8), never between two
// targets of x0.
// VERDICT, fixed before the run: PASS when H1 holds with every control and instrument; FAIL when P fires with them
// holding; PARTIAL when a control or instrument fails.
//
// GATE RUN (tmp/ax-fnd-run4.log, on the droplet, 7,128 s): PARTIAL, by the rule fixed above, because I3 failed on V.
//  - G (G1 and G2: 74,083 one-dock contents and 207,360 two-dock probes, 624,486 distinct A rows, 2,304 beats run
//    again on side 8): found 2 summed over the 16 characters, both in the trivial character, exactly L and F; 0 in
//    every other character, so 0 momentum-like. Every basis certified (peeled, the Gram remainder at most 3,209
//    columns). WITHIN DEGREE 2 AT SUPPORT TWO NEIGHBORING DOCKS, every conserved density whose coordinate reflections are
//    conserved too is a combination of L, F and the constant. There is no local momentum density at this support.
//  - V8 IS NOT A READING. In all 16 characters the solve's residues mod its one prime did not lift to rationals:
//    exactNullSpace reconstructs by Wang's bound, |n|, d <= sqrt((p - 1) / 2), about 4,096 for p < 2^25, and reports
//    `reconstructed` false when any entry misses it. On that flag this file's reader marks every named density as
//    outside N(A) and prints the mod-p dimensions. So the log's "found 216", "momentum-like 75" and "known in N(A) 0 of
//    14" (even L and F) are that guard's output: an uncertified mod-p count and a refusal, not invariants and not a
//    measurement that L and F fail. The likely reason only V fails: its whole-box rows count a bilinear over 4,096 docks,
//    so the null vectors need rationals past 4,096, where E-FND-0170's one-dock V8 stayed inside. I3 is false on V only,
//    and that alone makes P read true and H1 false by the letter of the gates. On G, H1 holds and P does not fire.
//  THE FIX, AFTER THIS RUN (no gate moved): code/algebra/linear/multi-modular-null-space solves the same Gram system
//    modulo several primes, joins them by the Chinese remainder theorem and reconstructs with the product's bound,
//    verifying every vector against every row in BigInt. peeledNullSpace falls back to it whenever one prime does not
//    lift. A rerun of this file reads V with it. pairVacuumRun (tmp/ax-vacuum.ts <characters>) reads V alone, one process
//    per character, as a check that is not the registered verdict.
//  - C1: the bare stream finds 951 (trivial) and 645 (character 1) against the rule's 2 and 0. C2: the decay map 0 and 0.
//    I1, I2 (rule 184 one invariant, the triple toggle 0 over Q), I4 to I8 hold; I7 one-dock split 2 = 2.
//  - Runs 2 and 3 carried the dropped-row bug described above (60 spurious products on G, all gone here).
// WHAT IT MEANS: Navier-Stokes cannot come from a local conserved momentum at support two and degree 2. The long-
// wavelength theory of the rule stays two coupled diffusions of love and fear (K1b), unless a wider support or a
// higher degree holds a momentum density.
//
// Depth L2: an exact reading of the rule's own runs. DETERMINISM: no random numbers; probes are enumerated in a fixed
// order. EXACT: integer rows, residues mod a prime, rationals, BigInt. NOTHING MOVES: each slot takes the value a piece
// hands it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  DENSITY_FEATURES,
  docksApart,
  namedDensities,
  type NamedDensity,
} from '@/code/measure/conserved-density'
import {
  coordinateFlip,
  neighborTables,
  pairFeatureName,
  pairFeatures,
  pairPermutation,
  TWO_DOCK_FEATURES,
  type NeighborTables,
} from '@/code/measure/pair-density'
import {
  characterBasis,
  elementaryGroup,
  projectDensity,
  reduceRow,
  type CharacterBasis,
  type ElementaryGroup,
} from '@/code/measure/character-split'
import {
  exactNullSpace,
  inSpanSparse,
  rankExact,
  RowSet,
  spanResidual,
  type NullBasis,
} from '@/code/algebra/linear/exact-null-space'
import { peeledNullSpace } from '@/code/algebra/linear/peeled-null-space'
import {
  DECAY,
  disturbances,
  emptyConfiguration,
  localContents,
  RULE,
  STREAM,
  toyRule184,
  toyTriple,
  type Content,
  type Dynamics,
} from '@/test/experiment/foundations/conserved-search'

const G_SIDE = 4
const V_SIDE = 8
const PHASES = 4
const BEATS = 48
const SCAN_EVERY = 64
const CHARACTERS = 16
const MOMENTUM_CHARACTERS = [1, 2, 4, 8]

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/pair-conserved-search',
  code: 'E-FND-0171',
  title:
    'every conserved density of the working rule on two neighboring docks up to degree 2, by exact linear algebra split over the 16 characters of the coordinate reflections (the momentum density), partial (the vacuum family did not certify): on 74,083 one-dock and 207,360 two-dock probes the rule keeps exactly the love and fear counts, 0 in every non-trivial character, so no local momentum density at support two; the bare stream finds 951, the decay map 0',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pairConservedRun()
  },
})

export type PairPlan = {
  // keep every k-th content of G1 and every k-th single of G2 (1 = the registered run; larger only for a smoke)
  thin: number
  vacuum: boolean
}

const SLOTS = Array.from({ length: 24 }, (_, d) => d)
const LINES = Array.from({ length: 12 }, (_, l) => l)

const singles = (): Content[] => [
  ...SLOTS.flatMap(d => [1, -1].map(v => ({ vibes: [[d, v]] as [number, number][], stores: [] }))),
  ...LINES.flatMap(l => [1, -1].map(v => ({ vibes: [], stores: [[l, v]] as [number, number][] }))),
]

const linePairs = (): Content[] =>
  LINES.flatMap(l =>
    [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ].map(([a, b]) => ({
      vibes: [
        [LINE_FIRSTS[l]!, a!],
        [OPPOSITE[LINE_FIRSTS[l]!]!, b!],
      ] as [number, number][],
      stores: [],
    })),
  )

// ---------------- the side-4 aliasing ----------------

type Ring = { docks: number[]; rel: string[] }

// the docks x0, y = target of slot d, the 24 targets of each, and every pairwise relation (equal, linked by a line
// direction either way, or neither)
function ring(tables: LockedTables, nb: NeighborTables, x0: number, d: number): Ring {
  const T = (x: number, e: number): number => Math.floor(tables.target[x * 24 + e]! / 24)
  const y = T(x0, d)
  const docks = [x0, y, ...SLOTS.map(e => T(x0, e)), ...SLOTS.map(e => T(y, e))]
  const rel: string[] = []

  for (const u of docks) {
    for (const v of docks) {
      let r = u === v ? 'e' : '.'

      for (let l = 0; l < 12 && r === '.'; l++) {
        if (nb.next[u * 12 + l] === v) {
          r = `+${l}`
        } else if (nb.next[v * 12 + l] === u) {
          r = `-${l}`
        }
      }

      rel.push(r)
    }
  }

  return { docks, rel }
}

type Aliasing = { links: [number, number][][]; onlyLinks: boolean; neverWithinX0: boolean; count: number }

function aliasing(): Aliasing {
  const four = contactFresh(G_SIDE, 'pass', 0)
  const eight = contactFresh(V_SIDE, 'pass', 0)
  const nb4 = neighborTables(four.tables)
  const nb8 = neighborTables(eight.tables)
  const x4 = centerOf(G_SIDE)
  const x8 = centerOf(V_SIDE)
  const links: [number, number][][] = []

  let onlyLinks = true
  let neverWithinX0 = true
  let count = 0

  for (const d of SLOTS) {
    const a = ring(four.tables, nb4, x4, d)
    const b = ring(eight.tables, nb8, x8, d)
    const m = a.docks.length
    const here: [number, number][] = []

    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        const ra = a.rel[i * m + j]!
        const rb = b.rel[i * m + j]!

        if (ra === rb) {
          continue
        }

        count++
        onlyLinks &&= ra !== 'e' && rb !== 'e'

        const inX0 = (k: number): boolean => k === 0 || (k >= 2 && k < 26)

        neverWithinX0 &&= !(inX0(i) && inX0(j))
        here.push([a.docks[i]!, a.docks[j]!])
      }
    }

    links.push(here)
  }

  return { links, onlyLinks, neverWithinX0, count }
}

// ---------------- collecting rows ----------------

type Probe = { at: [number, Content][]; direction: number }
type Collected = { A: RowSet; B: RowSet; probes: number; dropped: number; scanOk: boolean }

const nonempty = (c: Configuration, x: number): boolean => {
  for (let d = 0; d < 24; d++) {
    if (c.vibe[x * 24 + d] !== 0) {
      return true
    }
  }

  for (let l = 0; l < 12; l++) {
    if (c.store[x * 12 + l] !== 0) {
      return true
    }
  }

  return false
}

function place(c: Configuration, x: number, content: Content, on: boolean): void {
  for (const [d, v] of content.vibes) {
    c.vibe[x * 24 + d] = on ? v : 0
    c.open[x * 24 + d] = on ? 1 : 0
  }

  for (const [l, v] of content.stores) {
    c.store[x * 12 + l] = on ? v : 0
    c.sopen[x * 12 + l] = on ? 3 : 0
  }
}

function collect(dyn: Dynamics, probes: readonly Probe[], alias: Aliasing): Collected {
  const f = contactFresh(G_SIDE, 'pass', 0)
  const tables = f.tables
  const nb = neighborTables(tables)
  const base = emptyConfiguration(tables.cells)
  const empty = emptyConfiguration(tables.cells)
  const A = new RowSet(TWO_DOCK_FEATURES)
  const B = new RowSet(TWO_DOCK_FEATURES)

  // the side-8 box, where a beat that touches a side-4 false link is run again instead of dropped
  const f8 = contactFresh(V_SIDE, 'pass', 0)
  const t8 = f8.tables
  const nb8 = neighborTables(t8)
  const x8 = centerOf(V_SIDE)
  const x4 = centerOf(G_SIDE)
  const base8 = emptyConfiguration(t8.cells)
  const T8 = (x: number, d: number): number => Math.floor(t8.target[x * 24 + d]! / 24)

  let count = 0
  let dropped = 0
  let scanOk = true

  for (const probe of probes) {
    const where = probe.at.map(([x]) => x)
    const scan = [...new Set(where.flatMap(x => [x, ...SLOTS.map(d => Math.floor(tables.target[x * 24 + d]! / 24))]))]

    probe.at.forEach(([x, c]) => place(base, x, c, true))

    const before = pairFeatures(base, where, nb)

    B.add(before)

    for (let phase = 0; phase < PHASES; phase++) {
      const r = dyn.make(tables, base, phase)

      r.beat()

      const after = r.state()
      const falseLink =
        probe.direction >= 0 && alias.links[probe.direction]!.some(([u, v]) => nonempty(after, u) && nonempty(after, v))

      if (count % SCAN_EVERY === 0) {
        scanOk &&= docksApart(after, empty, tables.cells).every(x => scan.includes(x))
      }

      count++

      if (falseLink) {
        // the same probe on side 8: x0 at its center, y the target of the same slot, the same beat
        dropped++

        const at8 = probe.at.map(([x, c]) => [x === x4 ? x8 : T8(x8, probe.direction), c] as [number, Content])
        const where8 = at8.map(([x]) => x)
        const scan8 = [...new Set(where8.flatMap(x => [x, ...SLOTS.map(d => T8(x, d))]))]

        at8.forEach(([x, c]) => place(base8, x, c, true))

        const before8 = pairFeatures(base8, where8, nb8)
        const r8 = dyn.make(t8, base8, phase)

        r8.beat()

        const fa8 = pairFeatures(r8.state(), scan8, nb8)

        A.add(difference(fa8, before8))
        B.add(before8)
        B.add(fa8)
        at8.forEach(([x, c]) => place(base8, x, c, false))
        continue
      }

      const fa = pairFeatures(after, scan, nb)

      A.add(difference(fa, before))
      B.add(fa)
    }

    probe.at.forEach(([x, c]) => place(base, x, c, false))
  }

  return { A, B, probes: count, dropped, scanOk }
}

function difference(a: ReadonlyMap<number, number>, b: ReadonlyMap<number, number>): Map<number, number> {
  const out = new Map(a)

  b.forEach((v, k) => out.set(k, (out.get(k) ?? 0) - v))

  return out
}

function localProbes(thin: number): { G1: Probe[]; G2: Probe[]; momenta: number } {
  const f = contactFresh(G_SIDE, 'pass', 0)
  const x0 = centerOf(G_SIDE)
  const local = localContents()
  const G1 = local.contents.filter((_, i) => i % thin === 0).map(c => ({ at: [[x0, c]] as [number, Content][], direction: -1 }))
  const one = singles().filter((_, i) => i % thin === 0)
  const G2: Probe[] = []

  for (const d of SLOTS) {
    const y = Math.floor(f.tables.target[x0 * 24 + d]! / 24)

    for (const a of [...one, ...linePairs()]) {
      for (const b of one) {
        G2.push({ at: [[x0, a], [y, b]], direction: d })
      }
    }
  }

  return { G1, G2, momenta: local.momenta }
}

type VacuumCollected = { A: RowSet; B: RowSet; probes: number; reproducible: boolean; consistent: boolean }

function collectVacuum(): VacuumCollected {
  const center = centerOf(V_SIDE)
  const f = contactFresh(V_SIDE, 'pass', center)
  const tables = f.tables
  const nb = neighborTables(tables)
  const all = Array.from({ length: tables.cells }, (_, x) => x)
  const vacuum = wordVacuum(f, f.store)
  const A = new RowSet(TWO_DOCK_FEATURES)
  const B = new RowSet(TWO_DOCK_FEATURES)

  const run = (start: Configuration): Configuration[] => {
    const r = RULE.make(tables, start, 0)
    const out = [cloneConfiguration(start)]

    for (let t = 0; t < BEATS; t++) {
      r.beat()
      out.push(cloneConfiguration(r.state()))
    }

    return out
  }

  const vac = run(vacuum)
  const again = run(vacuum)
  const reproducible = vac.every((c, t) => docksApart(c, again[t]!, tables.cells).length === 0)
  const dense = vac.map(c => pairFeatures(c, all, nb))

  for (let t = 0; t < BEATS; t++) {
    A.add(difference(dense[t + 1]!, dense[t]!))
    B.add(difference(dense[t + 1]!, dense[0]!))
  }

  let probes = 0

  for (const content of disturbances(center)) {
    const start = cloneConfiguration(vacuum)

    for (const [slot, v] of content.vibes) {
      start.vibe[slot] = v
      start.open[slot] = 1
    }

    const states = run(start)
    const apart = states.map((c, t) => pairFeatures(c, docksApart(c, vac[t]!, tables.cells), nb, vac[t]))

    apart.forEach(m => B.add(m))

    for (let t = 0; t < BEATS; t++) {
      A.add(difference(apart[t + 1]!, apart[t]!))
    }

    probes++
  }

  return { A, B, probes, reproducible, consistent: nb.consistent && nb.bijective }
}

// ---------------- reading through the characters ----------------

type CharacterReading = {
  chi: number
  columns: number
  dimA: number
  dimB: number
  found: number
  knownRank: number
  perLineRank: number
  verified: boolean
  peeled: { zeroed: number; merged: number; dense: number }
  extra: string[]
}

type Reading = {
  family: string
  chars: CharacterReading[]
  found: number
  knownIn: string[]
  perLineIn: string[]
  brokenIn: string[]
  beyondKnown: number
  beyondPerLine: number
  momentumFound: number
  verified: boolean
}

const padded = (k: NamedDensity): Float64Array => {
  const v = new Float64Array(TWO_DOCK_FEATURES)

  v.set(k.vector.subarray(0, DENSITY_FEATURES))

  return v
}

const sparse = (y: readonly number[]): Map<number, number> => {
  const m = new Map<number, number>()

  y.forEach((v, c) => {
    if (v !== 0) {
      m.set(c, v)
    }
  })

  return m
}

function reduced(set: RowSet, basis: CharacterBasis): RowSet {
  const out = new RowSet(basis.reps.length)

  for (const r of set.rows) {
    out.add(reduceRow(basis, r.idx, r.val))
  }

  return out
}

// a span test that left the exact range answers "not in the span", which only ever keeps a candidate for the exact rank
const safeInSpan = (basis: NullBasis, y: ReadonlyMap<number, number>): boolean => {
  try {
    return inSpanSparse(basis, y)
  } catch {
    return false
  }
}

const quotientRank = (NB: NullBasis, ys: readonly number[][]): number => rankExact(ys.map(y => spanResidual(NB, y)))

function readFamily(
  family: string,
  c: { A: RowSet; B: RowSet },
  group: ElementaryGroup,
  named: { known: NamedDensity[]; perLine: NamedDensity[]; broken: NamedDensity[] },
  only: readonly number[] = Array.from({ length: CHARACTERS }, (_, chi) => chi),
  log: (what: string) => void = () => undefined,
): Reading {
  const chars: CharacterReading[] = []
  const inAll = new Map<string, boolean>()
  const vectors = [...named.known, ...named.perLine, ...named.broken].map(k => ({ name: k.name, v: padded(k) }))

  vectors.forEach(k => inAll.set(k.name, true))

  for (const chi of only) {
    const basis = characterBasis(group, chi)
    const m = basis.reps.length
    const A = reduced(c.A, basis)
    const B = reduced(c.B, basis)
    const NA = peeledNullSpace(A)
    const NB = peeledNullSpace(B)
    const proj = new Map(vectors.map(k => [k.name, projectDensity(group, basis, k.v)]))

    // a basis that did not lift to rationals cannot be read exactly: report the dimensions only, unverified
    if (!NA.reconstructed || !NB.reconstructed) {
      vectors.forEach(k => inAll.set(k.name, false))
      chars.push({
        chi,
        columns: m,
        dimA: NA.dim,
        dimB: NB.dim,
        found: NA.dim - NB.dim,
        knownRank: 0,
        perLineRank: 0,
        verified: false,
        peeled: { zeroed: NA.zeroed, merged: NA.merged, dense: NA.dense },
        extra: [`chi ${chi}: not reconstructed`],
      })
      log(`${family} chi ${chi}: ${m} columns, NOT RECONSTRUCTED (A ${NA.reconstructed}, B ${NB.reconstructed})`)
      continue
    }

    for (const k of vectors) {
      const y = proj.get(k.name)!

      if (y.some(v => v !== 0) && !inSpanSparse(NA, sparse(y))) {
        inAll.set(k.name, false)
      }
    }

    const within = (k: NamedDensity): boolean => {
      const y = proj.get(k.name)!

      return y.every(v => v === 0) || inSpanSparse(NA, sparse(y))
    }

    const knownYs = named.known.filter(within).map(k => proj.get(k.name)!)
    const perLineYs = named.perLine.filter(within).map(k => proj.get(k.name)!)
    const knownRank = quotientRank(NB, knownYs)
    const perLineRank = quotientRank(NB, [...knownYs, ...perLineYs])
    const found = NA.dim - NB.dim
    const extra: string[] = []

    // the basis vectors of N(A) beyond N(B) and the named span, written by their largest few features (at most 4)
    if (found - perLineRank > 0) {
      const spanned = [...knownYs, ...perLineYs]

      let rank = quotientRank(NB, spanned)
      let tried = 0

      for (const v of NA.vectors) {
        if (extra.length >= 8 || tried >= 400) {
          break
        }

        // a vector of N(B) is no invariant: skip it before any rank
        if (safeInSpan(NB, new Map(Array.from(v.idx, (col, i) => [col, v.num[i]!] as [number, number])))) {
          continue
        }

        tried++

        const y = new Array<number>(m).fill(0)

        v.idx.forEach((col, i) => (y[col] = v.num[i]!))

        const next = quotientRank(NB, [...spanned, y])

        if (next > rank) {
          rank = next
          spanned.push(y)

          const top = Array.from(v.idx, (col, i) => [col, v.num[i]!] as const)
            .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
            .slice(0, 6)

          extra.push(
            `chi ${chi}: ${v.idx.length} terms, ${top.map(([col, x]) => `${x}/${v.den} ${pairFeatureName(basis.reps[col]!)}`).join(' + ')}`,
          )
        }
      }
    }

    chars.push({
      chi,
      columns: m,
      dimA: NA.dim,
      dimB: NB.dim,
      found,
      knownRank,
      perLineRank,
      verified: NA.verified && NB.verified,
      peeled: { zeroed: NA.zeroed, merged: NA.merged, dense: NA.dense },
      extra,
    })
    log(`${family} chi ${chi}: ${m} columns, A ${c.A.rows.length} rows peeled to ${NA.dense} dense, found ${found}, beyond the lists ${found - perLineRank}`)
    extra.forEach(e => log(`  extra ${e}`))
  }

  const found = chars.reduce((s, r) => s + r.found, 0)
  const knownRank = chars.reduce((s, r) => s + r.knownRank, 0)
  const perLineRank = chars.reduce((s, r) => s + r.perLineRank, 0)

  return {
    family,
    chars,
    found,
    knownIn: named.known.filter(k => inAll.get(k.name)).map(k => k.name),
    perLineIn: named.perLine.filter(k => inAll.get(k.name)).map(k => k.name),
    brokenIn: named.broken.filter(k => inAll.get(k.name)).map(k => k.name),
    beyondKnown: found - knownRank,
    beyondPerLine: found - perLineRank,
    momentumFound: chars.filter(r => MOMENTUM_CHARACTERS.includes(r.chi)).reduce((s, r) => s + r.found, 0),
    verified: chars.every(r => r.verified),
  }
}

// I7: the one-dock part of G1, unsplit (E-FND-0170's dense solve) against the 16 characters
function splitCheck(c: { A: RowSet; B: RowSet }, generators: readonly Int32Array[]): { unsplit: number; split: number } {
  const A = c.A.project(DENSITY_FEATURES)
  const B = c.B.project(DENSITY_FEATURES)
  const unsplit = exactNullSpace(A).dim - exactNullSpace(B).dim
  // the one-dock features map among themselves
  const one = elementaryGroup(generators.map(p => p.subarray(0, DENSITY_FEATURES)))

  let split = 0

  for (let chi = 0; chi < CHARACTERS; chi++) {
    const basis = characterBasis(one, chi)

    split += peeledNullSpace(reduced(A, basis)).dim - peeledNullSpace(reduced(B, basis)).dim
  }

  return { unsplit, split }
}

// THE VACUUM FAMILY ALONE, on chosen characters: a check that can be split across processes (one character each). It
// reports per character the dimensions, whether they certified, and the named densities inside N(A); it is not the
// registered run, whose verdict reads V through pairConservedRun.
export function pairVacuumRun(characters: readonly number[]): Record<string, number | string> {
  const named = namedDensities()
  const group = elementaryGroup([0, 1, 2, 3].map(coordinateFlip).map(pairPermutation))
  const vacuum = collectVacuum()
  const r = readFamily(`V${V_SIDE}`, vacuum, group, named, characters, what => console.error(what))
  const out: Record<string, number | string> = {
    reproducible: flag(vacuum.reproducible),
    perLineIn: r.perLineIn.length,
    knownIn: r.knownIn.length,
    verified: flag(r.verified),
  }

  for (const c of r.chars) {
    out[`chi${c.chi}`] = `found ${c.found}, dimA ${c.dimA}, dimB ${c.dimB}, known rank ${c.knownRank}, per-line rank ${c.perLineRank}, verified ${c.verified}${c.extra.length > 0 ? `, extra ${c.extra.join(' | ')}` : ''}`
  }

  return out
}

// ---------------- the run ----------------

export function pairConservedRun(plan: PairPlan = { thin: 1, vacuum: true }): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const named = namedDensities()

  // the group: the four coordinate flips on the 64,801 features
  const flips = [0, 1, 2, 3].map(coordinateFlip)
  const rootsOk = flips.every(s => s.every(t => t >= 0) && new Set(s).size === 24)
  const generators = flips.map(pairPermutation)
  const group = elementaryGroup(generators)
  const involutive = generators.every(p => p.every((g, f) => p[g] === f))
  const commuting = generators.every(p => generators.every(q => p.every((g, f) => q[g] === p[q[f]!])))
  const nb4 = neighborTables(contactFresh(G_SIDE, 'pass', 0).tables)
  const alias = aliasing()

  log(`aliasing: ${alias.count} relations differ, only links ${alias.onlyLinks}, never within x0 ${alias.neverWithinX0}`)

  const probes = localProbes(plan.thin)

  log(`G1 ${probes.G1.length} contents, G2 ${probes.G2.length} probes`)

  const g1 = collect(RULE, probes.G1, alias)

  log(`G1 rule: ${g1.A.rows.length} A rows`)

  const g2 = collect(RULE, probes.G2, alias)

  log(`G2 rule: ${g2.A.rows.length} A rows, ${g2.dropped} run again on side 8 (a false link on side 4)`)

  const G = { A: new RowSet(TWO_DOCK_FEATURES), B: new RowSet(TWO_DOCK_FEATURES) }

  G.A.merge(g1.A)
  G.A.merge(g2.A)
  G.B.merge(g1.B)
  G.B.merge(g2.B)

  const split = splitCheck(g1, generators)

  log(`I7 split check: unsplit ${split.unsplit}, split ${split.split}`)

  const readings: Reading[] = [readFamily('G', G, group, named, undefined, log)]

  let vacuum: VacuumCollected | undefined

  if (plan.vacuum) {
    vacuum = collectVacuum()
    log(`V${V_SIDE}: ${vacuum.A.rows.length} A rows`)
    readings.push(readFamily(`V${V_SIDE}`, vacuum, group, named, undefined, log))
  }

  // the controls, on G (G1 and G2, as the rule), characters 0 and 1
  const s2 = collect(STREAM, [...probes.G1, ...probes.G2], alias)
  const d2 = collect(DECAY, [...probes.G1, ...probes.G2], alias)
  const stream = readFamily('stream G', s2, group, named, [0, 1])
  const decay = readFamily('decay G', d2, group, named, [0, 1])

  log('controls read')

  const rule184 = toyRule184()
  const triple = toyTriple()

  // ---------------- gates ----------------
  const g = readings[0]!
  const v = readings[1]
  const at = (r: Reading, chi: number): number => r.chars.find(c => c.chi === chi)?.found ?? 0
  const lf = [named.known[0]!.name, named.known[1]!.name]
  const H1G = g.found === 2 && lf.every(n => g.knownIn.includes(n)) && at(g, 0) === 2
  const H1V =
    !v || (v.found === 24 && named.perLine.every(k => v.perLineIn.includes(k.name)) && v.beyondPerLine === 0)
  const H1 = H1G && H1V
  const P = g.beyondKnown > 0 || (v !== undefined && v.beyondPerLine > 0)
  const C1 = at(stream, 0) > at(g, 0) && at(stream, 1) > at(g, 1)
  const C2 = at(decay, 0) === 0 && at(decay, 1) === 0
  const I1 = rule184.ok
  const I2 = triple.ok
  const I3 = readings.every(r => r.verified) && stream.verified && decay.verified
  const I4 = nb4.consistent && nb4.bijective && (!vacuum || vacuum.consistent) && rootsOk && involutive && commuting
  const I5 = g1.scanOk && g2.scanOk && s2.scanOk && d2.scanOk
  const I6 = !vacuum || vacuum.reproducible
  const I7 = split.unsplit === split.split && split.unsplit === 2
  const I8 = alias.onlyLinks && alias.neverWithinX0
  const controls = C1 && C2 && I1 && I2 && I3 && I4 && I5 && I6 && I7 && I8
  const status: Verdict['status'] = !controls ? 'partial' : H1 && !P ? 'pass' : 'fail'

  const line = (r: Reading): string =>
    `${r.family}: found ${r.found} (by character ${r.chars.map(c => `${c.chi}:${c.found}`).join(' ')}), known in N(A) ${r.knownIn.length} of ${named.known.length}, per-direction counts in N(A) ${r.perLineIn.length} of ${named.perLine.length}, beyond the known ${r.beyondKnown}, beyond the per-direction counts ${r.beyondPerLine}, momentum-like ${r.momentumFound}, broken quantities in N(A): ${r.brokenIn.length === 0 ? 'none' : r.brokenIn.join(', ')}; columns ${r.chars.map(c => c.columns).join('/')}, dense after peeling ${r.chars.map(c => c.peeled.dense).join('/')}${r.chars.some(c => c.extra.length > 0) ? `; outside every list: ${r.chars.flatMap(c => c.extra).join(' | ')}` : ''}`

  const metrics: Record<string, number> = {
    H1: flag(H1),
    P: flag(P),
    C1: flag(C1),
    C2: flag(C2),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    I5: flag(I5),
    I6: flag(I6),
    I7: flag(I7),
    I8: flag(I8),
    g1Contents: probes.G1.length,
    g2Probes: probes.G2.length,
    g1Rows: g1.A.rows.length,
    g2Rows: g2.A.rows.length,
    g2Side8: g2.dropped,
    aliasRelations: alias.count,
    splitUnsplit: split.unsplit,
    splitSplit: split.split,
    stream0: at(stream, 0),
    stream1: at(stream, 1),
    decay0: at(decay, 0),
    decay1: at(decay, 1),
    toy184Found: rule184.found,
    toyTripleQ: triple.overQ,
    seconds: (Date.now() - started) / 1000,
  }

  for (const r of readings) {
    metrics[`found_${r.family}`] = r.found
    metrics[`beyondKnown_${r.family}`] = r.beyondKnown
    metrics[`beyondPerLine_${r.family}`] = r.beyondPerLine
    metrics[`momentum_${r.family}`] = r.momentumFound

    for (const c of r.chars) {
      metrics[`found_${r.family}_chi${c.chi}`] = c.found
    }
  }

  return verdict({
    status,
    claim: `H1 ${H1} P ${P}. ${readings.map(line).join('. ')}. Controls: C1 ${C1} (the bare stream on G finds ${at(stream, 0)} in the trivial character and ${at(stream, 1)} in character 1) C2 ${C2} (the decay map ${at(decay, 0)}, ${at(decay, 1)}); instrument I1 ${I1} I2 ${I2} I3 ${I3} I4 ${I4} I5 ${I5} I6 ${I6} I7 ${I7} (one-dock G1: ${split.unsplit} unsplit, ${split.split} through the characters) I8 ${I8} (${alias.count} side-4 relations differ from side 8, all links between a target of x0 and a target of y; ${g2.dropped} G2 beats run again on side 8)`,
    metrics,
    control: {
      stream0: at(stream, 0),
      stream1: at(stream, 1),
      decay0: at(decay, 0),
      decay1: at(decay, 1),
    },
    notes: `L2. G1 ${probes.G1.length} contents (${probes.momenta} table momenta), G2 ${probes.G2.length} two-dock probes, ${PHASES} beats each, side ${G_SIDE}; V side ${V_SIDE}${vacuum ? `, ${vacuum.probes} disturbances, ${BEATS} beats` : ' not run'}. Momentum-like characters ${MOMENTUM_CHARACTERS.join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

