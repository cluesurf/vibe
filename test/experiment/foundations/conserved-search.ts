// EVERY CONSERVED QUANTITY OF THE WORKING RULE UP TO DEGREE 2, FOUND BY EXACT LINEAR ALGEBRA (E-FND-0170, the rule's
// invariants). AI-Newton (arXiv 2504.01538) finds conserved quantities in noisy trajectories by regressing candidate
// terms and reading the near-null directions of a PCA. The working rule is exact and discrete, so the same search can be
// done with no fit: every observed beat gives one exact integer constraint on the unknown coefficients, and the
// conserved quantities are the null space of those constraints, solved over the rationals.
//
// DEFINITION. A conserved quantity of degree <= d and support one dock is Q(s) = sum over docks x of q(s at x), with q a
// polynomial of degree <= d in the dock's tone indicators ([trit = +1] and [trit = -1] on each of its 36 positions, the
// 24 slots and the 12 lines' stores; code/measure/conserved-density), such that Q(U_t s) = Q(s) for every state s and
// every beat t (U_t is one beat of the working rule at beat t: its keys depend on t, so Q must hold for all of them).
// Coefficients are rational (equivalently integer up to scale); a second reading takes them in Z3. Degree 1 at support
// one dock is ALL degree-1 translation-invariant densities (a linear density of support r sums to one of support 1).
// Degree 2 is read at support one dock: products of two positions of the same dock, 2,593 features in all. Points, open
// marks and stored pair words are not tone and are not read.
//
// THE RULE. The working rule exactly as E-FND-0169 runs it: code/measure/full-key-paths keyedRunner on the contact
// 'pass' (contactFresh), coin on, the meeting, the no-veto store, no mixer, the full-period key at offset 0, every vibe
// open. The box is side 4 (256 docks; side 4 is the smallest the oriented union allows, side 2 is refused): the
// smallest box on which a dock's 24 stream targets are 24 different docks (checked, I4), which is all a support-one
// density needs, since one beat moves a slot's trit one dock and every other piece acts inside one dock. Side 8 repeats
// the vacuum family, the size check.
//
// METHOD. A row is the change of the feature counts over one beat, f(U_t s) - f(s); the conserved quantities are
// N(A) = {q : A q = 0}. Rows are also taken for the STATES, f(s) - f(s0) over every state visited; their null space N(B)
// holds the densities that are the same on every visited state (the constant, and any feature the family never varies).
// N(B) sits inside N(A), and the INVARIANTS FOUND are N(A) / N(B), dimension dim N(A) - dim N(B). The system is solved
// exactly (code/algebra/linear/exact-null-space): the Gram matrix A^T A mod a prime below 2^25, its null basis lifted to
// rationals and every basis vector checked against every row in integer arithmetic, which certifies both the basis and
// the dimension over Q. The Z3 reading eliminates the distinct degree-1 rows mod 3 directly. Rows come from every state
// of two deterministic families, NO random numbers:
//   G  THE LOCAL FAMILY, side 4, every probe at one dock of an otherwise empty box, run one beat at each of beats 0, 1,
//      2, 3 (both collision orders, and each line's key both under and over the coin threshold): every content of 1, 2
//      or 3 vibes (any slots, any signs); one store (any line, either sign) with 0, 1 or 2 vibes; two stores with 0 or
//      1 vibe; and, for every momentum P the bounce table's isometric map acts on (the 'pass' contact uses it on a dock
//      of two or more singles), the first single-line occupation in enumeration order with that P and at least two
//      singles, as all loves, all fears and alternating.
//   V  THE VACUUM FAMILY, sides 4 and 8: the working vacuum (wordVacuum) and 96 disturbances at the center dock (a love
//      or a fear on each of the 24 slots; on each of the 12 lines the four fillings ++, --, +-, -+), each run 48 beats.
//      Rows are formed against the vacuum run on the same key, so they stay sparse: A holds the vacuum's own beats and
//      the disturbed run's change minus the vacuum's, B the vacuum's states and the disturbed states minus the vacuum's.
// The two families answer different questions. G asks the rule in general (every row is a true constraint, so N(A) on
// G CONTAINS the rule's true invariants: anything absent there is not conserved by the rule). V asks the sector the
// package runs, the vacuum and what one dock's disturbance does to it.
//
// THE KNOWN LIST (the control of H1, from the code and the experiments). K1 the love count L and the fear count F (a
// store counts one of each): their difference is the charge and their sum the energy E = count + 2 sum |tau|
// (code/rule/bounce-pair-knit THE LAWS; the pair move, the coin and the bounce all keep them). K2 the twelve line tones
// T_l, the tone summed over the mesh lines of direction l (E-SPN-0098's line law; claimed on runs from the vacuum).
// sum T_l = L - F, so the known span is 13 dimensional beyond the constant. KNOWN BROKEN, read as a negative: the
// occupation momentum P (a law of the coinless knit; the keyed coin hands a vibe from r to -r), the twelve directed tones
// D_l (E-SPN-0098's probe), the vibe count and the store count alone (the pair move trades two vibes for one store).
//
// HYPOTHESES, written before any run of this file (the only probe before it, tmp/cq-probe1, read box sizes and the time
// of a beat, nothing conserved).
//  H1 THE CONTROL: L and F lie in N(A) on G and on V (sides 4 and 8), at degrees 1 and 2; all twelve T_l lie in N(A)
//     on V (sides 4 and 8), at degrees 1 and 2.
//  H2 NOTHING NEW: on every family and degree, dim N(A) / N(B) equals the rank of the known list in it (no invariant
//     beyond the span of L, F and the T_l).
//  P  FALSIFIER of H2: one invariant, on any family at either degree, outside the span of the known list.
// BOTH OUTCOMES ARE INFORMATIVE: an invariant beyond the list is a finding (where it holds and what it is), and "nothing
// new up to degree 2 at support one dock" on G is a theorem-strength negative within that class: every conserved
// density of the class agrees, on every probe state, with a combination of L, F and the constant.
// PREDICTED (derived from the pieces before the run): on G, N(A) / N(B) = span(L, F), dimension 2 at both degrees, with
// every T_l absent (on a dock of two or more singles the isometric map carries a single to another line: the reflection
// in r1 - r2 fixes P = r1 + r2 and swaps r1 with r2) and every broken quantity absent; H2 holds there. On V, dimension
// 24 at both degrees, the per-direction love and fear counts L_l and F_l (with a store counted on its own line): there
// the coin, the pair move and the bounce on docks of at most one single all keep a vibe on its line, so the line law
// holds for the occupation as well as for the tone, and that adds the 11 per-direction occupation counts N_l = L_l +
// F_l beyond the 13 known. So H2 is predicted to FAIL on V by exactly 11, and nothing beyond L_l, F_l. Z3 gives the
// same dimensions as Q at degree 1. W(F4): N(A) is carried into itself by all 24 slot-root reflections, the trivial part
// of N(A) / N(B) is 2 (L, F) on every family, and on V the other 22 are nontrivial (two copies of the 11-dimensional part
// of the permutation of the 12 lines).
//
// CONTROLS (a failure makes the verdict partial). C1 MORE INVARIANTS: the bare stream (a slot permutation that keeps
// every slot's direction and never touches a store) gives a strictly larger N(A) / N(B) than the rule on G (degrees 1 and
// 2) and on V side 4 (degree 1); predicted 72 and 336 on G (every indicator, plus the 264 store-store products, stores
// never moving) and 48 on V (the vibe indicators; the stores never vary there). C2 NONE: the decay map (the stream, then
// every nonzero trit raised by one mod 3: a love becomes a fear, a fear empties, a store likewise) gives N(A) / N(B) = 0
// on the same families and degrees: only the constant survives.
// INSTRUMENT (a failure makes the verdict partial). I1 THE SOLVER ON A HAND-CHECKED TOY: rule 184 on a ring of 8, every
// one of the 256 states, features {1, N = sum x_i, sum x_i x_(i+1)}: N(A) is exactly span(1, N) and N(B) span(1), so
// one invariant, the particle count (rule 184 moves a particle into an empty right neighbor; the pair count changes,
// 1100 -> 1010 on four cells). I2 THE Z3 READING ON A TOY: on a ring of 6, a map that empties cells 0, 1, 2 when all
// three are full, fills them when all three are empty, and otherwise rotates by one: N changes by 0 or +-3, so over Q
// N(A) / N(B) = 0 and over Z3 it is 1 (N mod 3). I3 every null basis lifted to rationals and verified against every row.
// I4 a dock's 24 stream targets are 24 different docks on sides 4 and 8. I5 one probe in 64 scanned over the whole box
// after its beat: no trit outside the probe dock and its 24 targets. I6 two vacuum runs agree trit for trit.
// VERDICT, fixed before the run: PASS when H1 and H2 hold with every control and instrument; FAIL when H1 or H2 fails
// with them holding (the predicted outcome, on H2 at V); PARTIAL when a control or the instrument fails.
//
// FIRST RUN (tmp/cq-gate-E-FND-0170.log, 312 s): FAIL on H2 at V, as predicted, H1 holding, every control and the
// instrument holding. No gate moved and none was rerun. (Before it, tmp/cq-smoke timed the solver on toy systems only;
// it found the reconstruction's common denominator unbounded on a dense random-free system and the guard was fixed.)
//  - G (74,083 contents, 5,377 table momenta, 296,332 probes, 242,358 distinct rows): found 2 at degree 1 and 2 at
//    degree 2, exactly L and F; Z3 2. No T_l, no broken quantity. Nothing beyond the known list: within the class (degree
//    <= 2, support one dock) every conserved density of the rule agrees on every probe state with a combination of L, F
//    and the constant.
//  - V4 and V8: found 24 at both degrees (Z3 24), all 14 known in N(A) with rank 13, 11 beyond the known, 0 beyond the
//    per-direction love and fear counts L_l, F_l. So the sector the package runs keeps the occupation of every line
//    direction, not only its tone: the 11 counts N_l are the one finding, and they are the line law's own corollary.
//    Degree 2 adds nothing (dim N(A) 1,699 and 1,734 are almost all N(B): pair features the vacuum never varies).
//  - W(F4): on G at both degrees and on V at degree 1, N(A) and N(B) are carried into themselves by the 24 reflections;
//    the found part is 2 trivial (L, F) and on V 22 nontrivial, as predicted. On V at degree 2 the PREDICTION FAILED as
//    read: N(A) and N(B) are not invariant (the vacuum's store layout is not W(F4)-symmetric, so neither is the set of
//    pair features it never varies) and the group mean of the trace is not an integer, so the printed trivial count
//    there means nothing. The 24 found at degree 2 are the degree-1 ones, which are covariant.
//  - C1: the bare stream finds 72 and 336 on G and 48 on V4, each as predicted. C2: the decay map finds 0 everywhere.
//    I1: rule 184 gives N(A) 2, N(B) 1, the particle count. I2: the triple toggle gives 0 over Q and 1 over Z3. I3 to I6
//    hold: every basis lifted and verified against every row, 24 distinct targets on sides 4 and 8, every scanned probe
//    inside its 25 docks, the vacuum reproducible.
// WHAT IT MEANS for the rule's invariants: within degree 2 at support one dock the rule conserves only the love and fear
// counts, and nothing local is hiding. The line law and its occupation form are properties of the vacuum sector,
// broken by any dock that holds two singles.
//
// Depth L2: an exact reading of the rule's own runs; finding an invariant is a structural fact about the rule, not
// physics emerging from it. DETERMINISM: no random numbers; probes are enumerated in a fixed order and the path's
// choices are the key's integer Weyl numbers of (beat, dock, line). EXACT: integer rows, residues mod a prime,
// rationals, BigInt. NOTHING MOVES: each slot takes the value a piece hands it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, keyedRunner } from '@/code/measure/full-key-paths'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, momentumKey, OPPOSITE } from '@/code/rule/isometric-knit'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { reflectionsOf, rootSymmetries } from '@/code/measure/dock-group'
import {
  DENSITY_FEATURES,
  dockFeatures,
  docksApart,
  featureDifference,
  featureName,
  featurePermutation,
  LINEAR_FEATURES,
  namedDensities,
  type NamedDensity,
} from '@/code/measure/conserved-density'
import {
  exactNullSpace,
  inSpanSparse,
  nullDimSmall,
  rankExact,
  RowSet,
  spanResidual,
  type NullBasis,
} from '@/code/algebra/linear/exact-null-space'

const G_SIDE = 4
const V_SIDES = [4, 8]
const PHASES = 4
const BEATS = 48
const SCAN_EVERY = 64

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/conserved-search',
  code: 'E-FND-0170',
  title:
    "every conserved density of the working rule up to degree 2 at support one dock, found by exact linear algebra over Q and Z3, fail as predicted (nothing new in general, 11 new on the vacuum family): on every content of a dock with up to 3 vibes, up to 2 stores and every momentum the bounce table acts on (296,332 probes), the rule keeps exactly the love and fear counts (2 found at degree 1 and at degree 2, Z3 the same); the twelve line tones are not conserved in general, because a dock of two singles carries one across lines; on the vacuum family (sides 4 and 8, 96 disturbances, 48 beats) it keeps 24, the love and fear count of every line direction, 11 beyond the known list, all from the line law's occupation form and nothing beyond it; W(F4) covariant at degree 1 (2 trivial, 22 nontrivial); controls: the bare stream finds 72 and 336, a decay map 0, rule 184 its particle count, a mod-3 toy 0 over Q and 1 over Z3",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return conservedRun()
  },
})

type Runner = { state: () => Configuration; beat: () => void }
type Dynamics = { name: string; make: (tables: LockedTables, start: Configuration, phase: number) => Runner }

// ---------------- the three dynamics ----------------

const RULE: Dynamics = {
  name: 'rule',
  make: (tables, start, phase) => keyedRunner(tables, start, { key: fullPathKey(0), phase }),
}

function swapRunner(start: Configuration, step: (a: Configuration, b: Configuration) => void): Runner {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  return {
    state: () => a,
    beat() {
      step(a, b)

      const s = a

      a = b
      b = s
    },
  }
}

const STREAM: Dynamics = {
  name: 'stream',
  make: (tables, start) => swapRunner(start, (a, b) => streamInto(tables, a, b)),
}

const raise = (v: number): number => (v === 1 ? -1 : 0)

const DECAY: Dynamics = {
  name: 'decay',
  make: (tables, start) =>
    swapRunner(start, (a, b) => {
      streamInto(tables, a, b)

      for (let i = 0; i < b.vibe.length; i++) {
        b.vibe[i] = raise(b.vibe[i]!)
      }

      for (let i = 0; i < b.store.length; i++) {
        b.store[i] = raise(b.store[i]!)
      }
    }),
}

// ---------------- the local family ----------------

type Content = { vibes: [number, number][]; stores: [number, number][] }

function* signed(slots: number[], k: number, from = 0, acc: [number, number][] = []): Generator<[number, number][]> {
  if (acc.length === k) {
    yield acc

    return
  }

  for (let i = from; i < slots.length; i++) {
    for (const v of [1, -1]) {
      yield* signed(slots, k, i + 1, [...acc, [slots[i]!, v]])
    }
  }
}

const SLOTS = Array.from({ length: 24 }, (_, d) => d)
const LINES = Array.from({ length: 12 }, (_, l) => l)

// the first single-line occupation (each line empty, first slot or second slot) for every momentum the isometric table
// acts on, with at least two singles
function tableContents(): { contents: Content[]; momenta: number } {
  const seen = new Set<number>()
  const contents: Content[] = []

  for (let code = 0; code < 3 ** 12; code++) {
    const held: number[] = []

    let c = code

    for (let l = 0; l < 12; l++) {
      const s = c % 3

      c = Math.floor(c / 3)

      if (s === 1) {
        held.push(LINE_FIRSTS[l]!)
      } else if (s === 2) {
        held.push(OPPOSITE[LINE_FIRSTS[l]!]!)
      }
    }

    if (held.length < 2) {
      continue
    }

    const p = [0, 1, 2, 3].map(k => held.reduce((s, d) => s + DOCK_ROOTS[d]![k]!, 0))
    const key = momentumKey(p)
    const w = BOUNCE_TABLE[key]

    if (!w || seen.has(key) || w.every((to, d) => to === d)) {
      continue
    }

    seen.add(key)

    for (const pattern of ['love', 'fear', 'alternate']) {
      contents.push({
        vibes: held.map((d, i) => [d, pattern === 'love' ? 1 : pattern === 'fear' ? -1 : i % 2 === 0 ? 1 : -1]),
        stores: [],
      })
    }
  }

  return { contents, momenta: seen.size }
}

function localContents(): { contents: Content[]; momenta: number } {
  const contents: Content[] = []

  for (let k = 1; k <= 3; k++) {
    for (const vibes of signed(SLOTS, k)) {
      contents.push({ vibes, stores: [] })
    }
  }

  for (const stores of signed(LINES, 1)) {
    for (let k = 0; k <= 2; k++) {
      for (const vibes of signed(SLOTS, k)) {
        contents.push({ vibes, stores })
      }
    }
  }

  for (const stores of signed(LINES, 2)) {
    for (let k = 0; k <= 1; k++) {
      for (const vibes of signed(SLOTS, k)) {
        contents.push({ vibes, stores })
      }
    }
  }

  const table = tableContents()

  return { contents: [...contents, ...table.contents], momenta: table.momenta }
}

const emptyConfiguration = (cells: number): Configuration => ({
  vibe: new Int8Array(cells * 24),
  point: new Int8Array(cells * 24),
  open: new Uint8Array(cells * 24),
  store: new Int8Array(cells * 12),
  spoint: new Int8Array(cells * 12),
  sopen: new Uint8Array(cells * 12),
})

type Collected = { A: RowSet; B: RowSet; probes: number; scanOk: boolean }

function collectLocal(dyn: Dynamics, contents: readonly Content[]): Collected {
  const f = contactFresh(G_SIDE, 'pass', 0)
  const tables = f.tables
  const x0 = centerOf(G_SIDE)
  const base = emptyConfiguration(tables.cells)
  const scan = [x0, ...new Set(SLOTS.map(d => Math.floor(tables.target[x0 * 24 + d]! / 24)))]
  const empty = emptyConfiguration(tables.cells)
  const A = new RowSet(DENSITY_FEATURES)
  const B = new RowSet(DENSITY_FEATURES)

  let probes = 0
  let scanOk = true

  for (const content of contents) {
    for (const [d, v] of content.vibes) {
      base.vibe[x0 * 24 + d] = v
      base.open[x0 * 24 + d] = 1
    }

    for (const [l, v] of content.stores) {
      base.store[x0 * 12 + l] = v
      base.sopen[x0 * 12 + l] = 3
    }

    const before = dockFeatures(base, [x0], 2)

    B.add(before)

    for (let phase = 0; phase < PHASES; phase++) {
      const r = dyn.make(tables, base, phase)

      r.beat()

      const after = dockFeatures(r.state(), scan, 2)

      A.add(featureDifference(after, before))
      B.add(after)

      if (probes % SCAN_EVERY === 0) {
        const apart = docksApart(r.state(), empty, tables.cells)

        scanOk &&= apart.every(x => scan.includes(x))
      }

      probes++
    }

    for (const [d] of content.vibes) {
      base.vibe[x0 * 24 + d] = 0
      base.open[x0 * 24 + d] = 0
    }

    for (const [l] of content.stores) {
      base.store[x0 * 12 + l] = 0
      base.sopen[x0 * 12 + l] = 0
    }
  }

  return { A, B, probes, scanOk }
}

// ---------------- the vacuum family ----------------

function disturbances(center: number): Content[] {
  const out: Content[] = []

  for (const d of SLOTS) {
    for (const v of [1, -1]) {
      out.push({ vibes: [[center * 24 + d, v]], stores: [] })
    }
  }

  for (const l of LINES) {
    const fs = center * 24 + LINE_FIRSTS[l]!
    const ss = center * 24 + OPPOSITE[LINE_FIRSTS[l]!]!

    for (const [a, b] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      out.push({ vibes: [[fs, a!], [ss, b!]], stores: [] })
    }
  }

  return out
}

type VacuumCollected = Collected & { reproducible: boolean; targetsDistinct: boolean }

function collectVacuum(dyn: Dynamics, side: number, degree: 1 | 2): VacuumCollected {
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const tables = f.tables
  const all = Array.from({ length: tables.cells }, (_, x) => x)
  const vacuum = wordVacuum(f, f.store)
  const A = new RowSet(DENSITY_FEATURES)
  const B = new RowSet(DENSITY_FEATURES)

  let targetsDistinct = true

  for (let x = 0; x < tables.cells; x++) {
    targetsDistinct &&= new Set(SLOTS.map(d => Math.floor(tables.target[x * 24 + d]! / 24))).size === 24
  }

  const run = (start: Configuration): Configuration[] => {
    const r = dyn.make(tables, start, 0)
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
  const dense = vac.map(c => dockFeatures(c, all, degree))

  for (let t = 0; t < BEATS; t++) {
    A.add(featureDifference(dense[t + 1]!, dense[t]!))
    B.add(featureDifference(dense[t + 1]!, dense[0]!))
  }

  let probes = 0

  for (const content of disturbances(center)) {
    const start = cloneConfiguration(vacuum)

    for (const [slot, v] of content.vibes) {
      start.vibe[slot] = v
      start.open[slot] = 1
    }

    const states = run(start)
    const apart = states.map((c, t) => dockFeatures(c, docksApart(c, vac[t]!, tables.cells), degree, vac[t]))

    apart.forEach(m => B.add(m))

    for (let t = 0; t < BEATS; t++) {
      A.add(featureDifference(apart[t + 1]!, apart[t]!))
    }

    probes++
  }

  return { A, B, probes, scanOk: true, reproducible, targetsDistinct }
}

// ---------------- reading a null space ----------------

const restrict = (v: Float64Array, n: number): Map<number, number> => {
  const m = new Map<number, number>()

  for (let c = 0; c < n; c++) {
    if (v[c] !== 0) {
      m.set(c, v[c]!)
    }
  }

  return m
}

const denseOf = (v: Float64Array, n: number): number[] => Array.from(v.subarray(0, n))

type Group = { perms: Int32Array[]; inverses: Int32Array[]; generators: Int32Array[] }

function dockGroup(): Group {
  const sym = rootSymmetries(DOCK_ROOTS)
  const perms = sym.elements.map(e => featurePermutation(e.slots))
  const inverses = perms.map(p => {
    const q = new Int32Array(p.length)

    p.forEach((to, from) => (q[to] = from))

    return q
  })
  const generators = reflectionsOf(sym.elements).map(r => featurePermutation(r.element.slots))

  return { perms, inverses, generators }
}

const fracAdd = ([a, b]: [bigint, bigint], [c, d]: [bigint, bigint]): [bigint, bigint] => [a * d + c * b, b * d]

type Covariance = { invariant: boolean; fixed: number; integral: boolean }

// whether the generators carry the basis into its span, and the dimension of its fixed part (the mean of the trace
// over the group, each trace read on the echelon basis: the coefficient of X_j in g X_j is (g X_j) at X_j's free column)
function covariance(basis: NullBasis, group: Group): Covariance {
  const n = basis.n
  const invariant = group.generators.every(g =>
    basis.vectors.every(v => {
      const y = new Map<number, number>()

      v.idx.forEach((c, i) => y.set(g[c]!, v.num[i]!))

      return inSpanSparse(basis, y)
    }),
  )
  const lookup = basis.vectors.map(v => new Map(Array.from(v.idx, (c, i) => [c, v.num[i]!])))
  // the trace summed over the group, kept as one integer numerator per denominator
  const byDen = new Map<number, bigint>()

  group.inverses.forEach(inv => {
    basis.vectors.forEach((v, j) => {
      const source = inv[v.free]!

      if (source >= n) {
        return
      }

      const a = lookup[j]!.get(source) ?? 0

      if (a !== 0) {
        byDen.set(v.den, (byDen.get(v.den) ?? 0n) + BigInt(a))
      }
    })
  })

  let total: [bigint, bigint] = [0n, 1n]

  byDen.forEach((num, den) => (total = fracAdd(total, [num, BigInt(den)])))

  const size = BigInt(group.perms.length)
  const integral = total[0] % (total[1] * size) === 0n

  return { invariant, fixed: Number(total[0] / (total[1] * size)), integral }
}

type Reading = {
  family: string
  degree: 1 | 2
  NA: NullBasis
  NB: NullBasis
  found: number
  z3?: number
  knownIn: string[]
  knownRank: number
  perLineRank: number
  brokenIn: string[]
  newBeyondKnown: number
  newBeyondPerLine: number
  covA?: Covariance
  covB?: Covariance
  extra: string[]
}

function quotientRank(NB: NullBasis, vectors: readonly NamedDensity[], n: number): number {
  return rankExact(vectors.map(k => spanResidual(NB, denseOf(k.vector, n))))
}

function readSystem(
  family: string,
  degree: 1 | 2,
  c: Collected,
  named: ReturnType<typeof namedDensities>,
  group?: Group,
): Reading {
  const n = degree === 1 ? LINEAR_FEATURES : DENSITY_FEATURES
  const A = degree === 1 ? c.A.project(n) : c.A
  const B = degree === 1 ? c.B.project(n) : c.B
  const NA = exactNullSpace(A)
  const NB = exactNullSpace(B)
  const within = (k: NamedDensity): boolean => inSpanSparse(NA, restrict(k.vector, n))
  const knownIn = named.known.filter(within)
  const perLineIn = named.perLine.filter(within)
  const found = NA.dim - NB.dim
  const knownRank = quotientRank(NB, knownIn, n)
  const perLineRank = quotientRank(NB, [...knownIn, ...perLineIn], n)
  const extra: string[] = []
  const newBeyondPerLine = found - perLineRank

  // the basis vectors of N(A) outside N(B) + known + per-line, written out (degree 1 only, at most 6)
  if (newBeyondPerLine > 0 && degree === 1) {
    const spanned = [...knownIn, ...perLineIn]

    for (const v of NA.vectors) {
      if (extra.length >= 6) {
        break
      }

      const dense = new Float64Array(n)

      v.idx.forEach((col, i) => (dense[col] = v.num[i]!))

      const candidate = { name: 'x', vector: dense }
      const before = quotientRank(NB, spanned, n)
      const after = quotientRank(NB, [...spanned, candidate], n)

      if (after > before) {
        spanned.push(candidate)
        extra.push(
          Array.from(v.idx, (col, i) => `${v.num[i]! / v.den} ${featureName(col)}`).join(' + '),
        )
      }
    }
  }

  return {
    family,
    degree,
    NA,
    NB,
    found,
    z3: degree === 1 ? nullDimSmall(A, 3) - nullDimSmall(B, 3) : undefined,
    knownIn: knownIn.map(k => k.name),
    knownRank,
    perLineRank,
    brokenIn: named.broken.filter(within).map(k => k.name),
    newBeyondKnown: found - knownRank,
    newBeyondPerLine,
    covA: group ? covariance(NA, group) : undefined,
    covB: group ? covariance(NB, group) : undefined,
    extra,
  }
}

const foundOnly = (c: Collected, degree: 1 | 2): { found: number; verified: boolean } => {
  const n = degree === 1 ? LINEAR_FEATURES : DENSITY_FEATURES
  const NA = exactNullSpace(degree === 1 ? c.A.project(n) : c.A)
  const NB = exactNullSpace(degree === 1 ? c.B.project(n) : c.B)

  return { found: NA.dim - NB.dim, verified: NA.verified && NB.verified && NA.reconstructed && NB.reconstructed }
}

// ---------------- the toys ----------------

function toyRule184(): { ok: boolean; found: number; dimA: number; dimB: number } {
  const n = 8
  const A = new RowSet(3)
  const B = new RowSet(3)
  const features = (x: number[]): Map<number, number> =>
    new Map([
      [1, x.reduce((s, v) => s + v, 0)],
      [2, x.reduce((s, v, i) => s + v * x[(i + 1) % n]!, 0)],
    ])

  for (let s = 0; s < 1 << n; s++) {
    const x = Array.from({ length: n }, (_, i) => (s >> i) & 1)
    const y = x.map((v, i) => {
      const left = x[(i + n - 1) % n]!
      const right = x[(i + 1) % n]!

      return (left === 1 && v === 0) || (v === 1 && right === 1) ? 1 : 0
    })

    A.add(featureDifference(features(y), features(x)))
    B.add(features(x))
  }

  const NA = exactNullSpace(A)
  const NB = exactNullSpace(B)
  const ok =
    NA.verified &&
    NB.verified &&
    NA.dim === 2 &&
    NB.dim === 1 &&
    inSpanSparse(NA, new Map([[0, 1]])) &&
    inSpanSparse(NA, new Map([[1, 1]])) &&
    !inSpanSparse(NA, new Map([[2, 1]]))

  return { ok, found: NA.dim - NB.dim, dimA: NA.dim, dimB: NB.dim }
}

function toyTriple(): { ok: boolean; overQ: number; overZ3: number } {
  const n = 6
  const A = new RowSet(2)
  const B = new RowSet(2)
  const count = (x: number[]): Map<number, number> => new Map([[1, x.reduce((s, v) => s + v, 0)]])

  for (let s = 0; s < 1 << n; s++) {
    const x = Array.from({ length: n }, (_, i) => (s >> i) & 1)
    const head = x[0]! + x[1]! + x[2]!
    const y =
      head === 3
        ? [0, 0, 0, ...x.slice(3)]
        : head === 0
          ? [1, 1, 1, ...x.slice(3)]
          : x.map((_, i) => x[(i + n - 1) % n]!)

    A.add(featureDifference(count(y), count(x)))
    B.add(count(x))
  }

  const NA = exactNullSpace(A)
  const NB = exactNullSpace(B)
  const overQ = NA.dim - NB.dim
  const overZ3 = nullDimSmall(A, 3) - nullDimSmall(B, 3)

  return { ok: NA.verified && NB.verified && overQ === 0 && overZ3 === 1, overQ, overZ3 }
}

// ---------------- the run ----------------

export function conservedRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const named = namedDensities()
  const group = dockGroup()
  const local = localContents()

  log(`local family: ${local.contents.length} contents, ${local.momenta} table momenta`)

  // the rule
  const gRule = collectLocal(RULE, local.contents)

  log(`G rule: ${gRule.A.rows.length} distinct A rows, ${gRule.B.rows.length} B rows`)

  const readings: Reading[] = []

  readings.push(readSystem('G', 1, gRule, named, group))
  readings.push(readSystem('G', 2, gRule, named, group))
  log('G rule read')

  const vacua: VacuumCollected[] = []

  for (const side of V_SIDES) {
    const v = collectVacuum(RULE, side, 2)

    vacua.push(v)
    log(`V${side} rule: ${v.A.rows.length} A rows, ${v.B.rows.length} B rows`)
    readings.push(readSystem(`V${side}`, 1, v, named, group))
    readings.push(readSystem(`V${side}`, 2, v, named, group))
    log(`V${side} rule read`)
  }

  // the controls
  const gStream = collectLocal(STREAM, local.contents)
  const gDecay = collectLocal(DECAY, local.contents)
  const vStream = collectVacuum(STREAM, V_SIDES[0]!, 1)
  const vDecay = collectVacuum(DECAY, V_SIDES[0]!, 1)
  const stream = {
    G1: foundOnly(gStream, 1),
    G2: foundOnly(gStream, 2),
    V1: foundOnly(vStream, 1),
  }
  const decay = {
    G1: foundOnly(gDecay, 1),
    G2: foundOnly(gDecay, 2),
    V1: foundOnly(vDecay, 1),
  }

  log('controls read')

  const rule184 = toyRule184()
  const triple = toyTriple()

  // ---------------- gates ----------------
  const at = (family: string, degree: number): Reading => readings.find(r => r.family === family && r.degree === degree)!
  const hasLF = (r: Reading): boolean => r.knownIn.includes(named.known[0]!.name) && r.knownIn.includes(named.known[1]!.name)
  const allTones = (r: Reading): boolean => named.known.slice(2).every(k => r.knownIn.includes(k.name))
  const H1 = readings.every(hasLF) && readings.filter(r => r.family !== 'G').every(allTones)
  const H2 = readings.every(r => r.newBeyondKnown === 0)
  const C1 =
    stream.G1.found > at('G', 1).found && stream.G2.found > at('G', 2).found && stream.V1.found > at('V4', 1).found
  const C2 = decay.G1.found === 0 && decay.G2.found === 0 && decay.V1.found === 0
  const I1 = rule184.ok
  const I2 = triple.ok
  const I3 =
    readings.every(r => r.NA.verified && r.NB.verified && r.NA.reconstructed && r.NB.reconstructed) &&
    [stream, decay].every(s => s.G1.verified && s.G2.verified && s.V1.verified)
  const I4 = vacua.every(v => v.targetsDistinct)
  const I5 = gRule.scanOk && gStream.scanOk && gDecay.scanOk
  const I6 = vacua.every(v => v.reproducible)
  const controls = C1 && C2 && I1 && I2 && I3 && I4 && I5 && I6
  const status: Verdict['status'] = !controls ? 'partial' : H1 && H2 ? 'pass' : 'fail'

  const line = (r: Reading): string =>
    `${r.family} degree ${r.degree}: dim N(A) ${r.NA.dim}, dim N(B) ${r.NB.dim}, found ${r.found}${r.z3 === undefined ? '' : ` (Z3 ${r.z3})`}, known in N(A) ${r.knownIn.length} of ${named.known.length} (rank ${r.knownRank}), with the per-direction counts rank ${r.perLineRank}, beyond the known ${r.newBeyondKnown}, beyond the per-direction counts ${r.newBeyondPerLine}, broken quantities in N(A): ${r.brokenIn.length === 0 ? 'none' : r.brokenIn.join(', ')}; W(F4): N(A) ${r.covA?.invariant ? 'invariant' : 'NOT invariant'}, fixed ${r.covA?.fixed}${r.covA?.integral ? '' : ' (non-integral mean)'}, N(B) ${r.covB?.invariant ? 'invariant' : 'NOT invariant'}, fixed ${r.covB?.fixed}, so the found part has trivial multiplicity ${(r.covA?.fixed ?? 0) - (r.covB?.fixed ?? 0)} and ${r.found - ((r.covA?.fixed ?? 0) - (r.covB?.fixed ?? 0))} nontrivial${r.extra.length > 0 ? `; outside every list: ${r.extra.join(' | ')}` : ''}`

  const metrics: Record<string, number> = {
    H1: flag(H1),
    H2: flag(H2),
    C1: flag(C1),
    C2: flag(C2),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    I5: flag(I5),
    I6: flag(I6),
    localContents: local.contents.length,
    tableMomenta: local.momenta,
    streamG1: stream.G1.found,
    streamG2: stream.G2.found,
    streamV1: stream.V1.found,
    decayG1: decay.G1.found,
    decayG2: decay.G2.found,
    decayV1: decay.V1.found,
    toy184Found: rule184.found,
    toyTripleQ: triple.overQ,
    toyTripleZ3: triple.overZ3,
    seconds: (Date.now() - started) / 1000,
  }

  for (const r of readings) {
    const k = `${r.family}d${r.degree}`

    metrics[`found_${k}`] = r.found
    metrics[`dimA_${k}`] = r.NA.dim
    metrics[`dimB_${k}`] = r.NB.dim
    metrics[`beyondKnown_${k}`] = r.newBeyondKnown
    metrics[`beyondPerLine_${k}`] = r.newBeyondPerLine
    metrics[`trivial_${k}`] = (r.covA?.fixed ?? 0) - (r.covB?.fixed ?? 0)

    if (r.z3 !== undefined) {
      metrics[`z3_${k}`] = r.z3
    }
  }

  return verdict({
    status,
    claim: `H1 ${H1} H2 ${H2}. ${readings.map(line).join('. ')}. Controls: C1 ${C1} (the bare stream finds ${stream.G1.found} on G at degree 1, ${stream.G2.found} at degree 2, ${stream.V1.found} on V4 at degree 1) C2 ${C2} (the decay map finds ${decay.G1.found}, ${decay.G2.found}, ${decay.V1.found}); instrument I1 ${I1} (rule 184: N(A) ${rule184.dimA}, N(B) ${rule184.dimB}, found ${rule184.found}, the particle count) I2 ${I2} (the triple toggle: ${triple.overQ} over Q, ${triple.overZ3} over Z3) I3 ${I3} I4 ${I4} I5 ${I5} I6 ${I6}`,
    metrics,
    control: {
      streamG1: stream.G1.found,
      streamG2: stream.G2.found,
      streamV1: stream.V1.found,
      decayG1: decay.G1.found,
      decayG2: decay.G2.found,
      decayV1: decay.V1.found,
    },
    notes: `L2. Local family G: side ${G_SIDE}, ${local.contents.length} contents (${local.momenta} table momenta) at ${PHASES} beats each, ${gRule.probes} probes, ${gRule.A.rows.length} distinct rule rows. Vacuum family V: sides ${V_SIDES.join(', ')}, ${vacua[0]!.probes} disturbances, ${BEATS} beats. Prime ${readings[0]!.NA.prime}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
