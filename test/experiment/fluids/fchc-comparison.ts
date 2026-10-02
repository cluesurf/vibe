// IS THE RULE'S COLLISION AN FCHC COLLISION? (E-FLD-0034, route K1d "the FCHC model is this mesh", OPEN-CSM-17). The
// face-centered hypercubic lattice gas (Frisch, d'Humieres, Hasslacher, Lallemand, Pomeau, Rivet 1987, Complex Systems 1,
// 649) moves particles along the 24 D4 roots, the same 24 directions as a dock's 24 slots, and projects to isotropic 3d
// Navier-Stokes. Its collision has to meet three conservation requirements at one node: it keeps the MASS (sum n_i), it
// keeps the 4-MOMENTUM (sum c_i n_i), and it keeps NOTHING ELSE that is a sum over particles (no spurious invariant: the
// collision invariants, the vectors q with q . (n' - n) = 0 on every transition, are exactly the span of 1 and the four
// components of c, dimension 5). The route asks whether the rule's collision is one of FCHC's, and names the kill in
// advance: "the rule's collision lacks a conservation FCHC needs". E-FND-0170 and E-FND-0171 found that the working rule
// keeps only the pain and pleasure counts locally, with no momentum density at support one or two docks. This file reads
// WHERE that loss happens: piece by piece (collision, coin, stream) on the working rule (the knit) and on the register
// rule, against FCHC's own collision as the control.
//
// WHAT IS RUN (exact integer and BigInt arithmetic throughout; no float enters a gate).
//  FCHC CONTROL. Henon's isometric collision (Complex Systems 1, 475, 1987), the collision of Frisch et al.: a node's
//   occupation n with momentum P may go to g n for every g in W(F4) (the 1,152 maps of R^4 permuting the 24 roots) that
//   fixes P. Every such transition on the 276 two-particle and 2,024 three-particle occupations is read.
//  THE KNIT'S COLLISION (the working rule's, code/rule/occupation-veto-knit collideVeto: the pair move pairPiece with the
//   no-veto store, and the dock permutation coinPiece, in both orders, as the alternate schedule runs them), for each of
//   the four collision kinds of code/rule/bounce-pair-knit: 'isometric' (K = w_P, E-RLT-0061), 'bounce' (B), 'lone' (B on
//   docks of at most one single line, K elsewhere, E-RLT-0084), 'pass' (the working rule's, E-SPN-0092). A store is
//   folded into the occupation as one particle on each slot of its line (a store counts one pain and one pleasure, and
//   carries no momentum). Read on the TWO-BODY table (every dock content of count 2: two vibes on any two slots with any
//   tones, 1,104 contents, and one store alone, 24), the THREE-BODY table (three vibes, 16,192, and a store with one vibe,
//   1,152), and the FULL dock permutation on all 2^24 = 16,777,216 slot occupations (bouncePermutation, the function
//   coinPiece calls; it reads the occupation only).
//  THE KNIT'S COIN (code/measure/full-key-paths keyedCoin, the piece that runs before the collision every beat): a line
//   holding one open vibe and an empty slot hands the vibe across where the line's key is under the threshold. Its key
//   is replaced by a fixed choice of crossing lines (none, all twelve, each line alone) on every content of 1, 2 and 3
//   vibes at one dock of a side-4 box. The same contents are then run through coin and collision, the knit's local
//   update without the stream.
//  THE KNIT'S STREAM (the side-4 box of contactFresh, code/measure/doublet-locked-readings streamInto): slot d of dock x
//   goes to slot d of a neighbor; read whether the target table is a bijection that keeps every slot's direction.
//  THE REGISTER RULE (E-SPN-0160, E-SPN-0175, code/measure/register-sea seaBeat). A member lives on 192 modes, slot d
//   times register a; its velocity is r_d (the stream moves slot d one root r_d). Its pieces are the member mixers
//   1 + (u - 1) Q_S (beat 1) and 1 + (conj u - 1) Q_D (beat 2), one-body; the PAIR PIECE, a phase on two members both in
//   the beat's sector, 1 + (e^(i phi) - 1) Q (x) Q (contact phi at V = 0, string at V > 0), the rule's only two-body
//   piece; the swap coin (slot d takes slot -d's value); the stream. Q_S = singletProjector24 / 24 and Q_D =
//   partnerProjector48 / 48 (code/measure/spinor-register) are integer matrices over 24 and 48. The member momentum is
//   C_a = diag(r_d,a) (x) 1_8, and a two-member momentum C_a (x) 1 + 1 (x) C_a. A piece 1 + z X with z != 0 keeps momentum
//   exactly when [X, C] = 0, so ||[Q, C_a]||_F^2 and ||[Q (x) Q, C_a (x) 1 + 1 (x) C_a]||_F^2 are read exactly (scaled
//   by 24^2, 48^2 and their squares, so they are integer sums). The pair piece's TWO-BODY TABLE is also read as slot
//   pairs: (d, e) -> (d', e') is allowed when both 8 x 8 register blocks Q[d, d'] and Q[e, e'] are nonzero, and counted
//   when it changes r_d + r_e. Every piece is number conserving by construction (one-body pieces and a phase on a
//   product of projectors), so mass is not read there.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE KNIT'S COLLISION KEEPS MASS AND MOMENTUM (L1, from the code). coinPiece is a slot permutation, so it keeps every
//    count; K = w_P fixes P and B adds -1 on full lines (momentum 0), so P is kept (bounce-pair-knit THE LAWS). The pair
//    move trades a pain and a pleasure on one line for a store, which folded is the same occupation.
// 2. THE KNIT'S TWO-BODY TABLE IS THE IDENTITY (L1). For two vibes a, b with P = a + b, w_P is -1 on the span of the F4
//    roots orthogonal to P. For every angle between a and b those roots span all of P-perp (head-on: P = 0, w = -1; at
//    120 degrees P is a root and its orthogonal F4 roots are a B3; at 90 and 60 degrees (a - b)/2 is a short or a D4 root
//    orthogonal to P), so w swaps a and b: the occupation is unchanged. B and 'pass' turn a full line onto itself. So no
//    two-body content of the knit ever changes its occupation, and all 24 slot occupations are invariants of the
//    two-body table: 19 spurious ones. FCHC's isometric choice of a RANDOM element of the stabilizer turns a head-on pair
//    onto any of the 12 lines; the knit's deterministic covariant element, -1, cannot. Three bodies break the
//    degeneracy (P then spans less than the occupied roots).
// 3. THE COIN BREAKS MOMENTUM (L1). A crossing moves one vibe from r to -r: Delta P = -2 r, mass kept. A set of
//    crossings keeps P only when its roots sum to 0 (three lines at 120 degrees). The coin keeps each line's occupation,
//    so its own invariants are the 12 line counts.
// 4. THE STREAM KEEPS BOTH (L1): it moves a slot's content to the same slot of the neighbor along that slot's root.
// 5. THE REGISTER RULE'S PIECES BREAK MOMENTUM (L1). Q_S = (1/24) J (x) 1_8 (J the all-ones 24 x 24), so Q_S C_a Q_S = 0
//    (the roots sum to 0) and ||[Q, C_a]||^2 = 2 tr(Q C_a^2) = 2 (8 / 24) sum_d r_d,a^2 = 8. For a projector with
//    Q C Q = 0 and tr Q C = 0 the two-body commutator is 2 ||[Q, C]||^2 ||Q||^2 = 2 * 8 * 8 = 128. The swap coin sends C
//    to -C (it anticommutes), so it reverses every member's momentum every beat. So the register rule's mixers, its pair
//    piece (its two-body collision) and its swap coin each fail momentum, and only the stream keeps it.
//
// PROBES BEFORE THE GATES, disclosed (tmp/fc-probe1.ts, tmp/fc-probe2.ts, run before this file was written; every
//  number below was seen in them, so the gates restate what the probes showed, as derived above). FHP gives 4
//  invariants with head-on collisions only and 3 with the triple. |W(F4)| = 1,152. FCHC isometric: 2-body 23,040
//  transitions, 18,432 moving, rank 19, 5 invariants; 3-body 93,312, rank 19, 5; 0 mass or momentum breaks. Knit, all
//  four kinds: 2-body (vibes only) 0 moving of 1,104, 24 invariants; 3-body (vibes only) rank 19, 5 invariants, 0
//  momentum breaks; full 2^24 table 0 momentum breaks, rank 19 (moving 9,349,056 isometric, 1,322,496 bounce, 9,302,976
//  lone and pass), 13.6 s a kind. Coin (keys none, all, and lines 0 to 5 alone; 1 to 3 vibes): 40,552 moving, 40,296
//  momentum breaks, 0 mass breaks, 12 invariants; coin then collision: 1 invariant (mass). Register: ||[Q_S, C_a]||^2 =
//  4,608 / 24^2 = 8 and ||[Q_D, C_a]||^2 = 18,432 / 48^2 = 8 on every axis, two-body 128 for both; the swap coin
//  anticommutes on all 96 entries; the side-4 stream keeps every direction and is a bijection. The gate run adds the
//  stores to the knit's tables, the coin's lines 6 to 11, the slot-pair table of the pair piece and the controls.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT. (a) FHP (Frisch, Hasslacher, Pomeau 1986) in the integer hexagonal basis: head-on two-body collisions
//     only give exactly 4 invariants (mass, two momenta and the known spurious one), adding the symmetric triple gives
//     exactly 3. (b) The closure of the 48 F4 reflections on the D4 roots has 1,152 elements. (c) 24 Q_S and 48 Q_D are
//     symmetric, (s Q)^2 = s (s Q) on every entry, tr Q = 8. (d) The side-4 stream target is a bijection that keeps every
//     slot's direction. (e) The mass and the four momentum vectors have rank 5.
//  C1 CONTROL, FCHC'S OWN COLLISION PASSES THE SAME CHECK. Henon's isometric collision on the two-body and the three-body
//     tables: 0 transitions change mass or momentum, and exactly 5 invariants on each (so they are exactly span(1, c)).
//     The quantum check's control: a pair piece on Q_0 = (slot 0) (x) 1_8, diagonal in the slots, has commutator 0 one-
//     and two-body.
//  H1 THE ROUTE'S HYPOTHESIS, the rule's collision is an FCHC collision: (i) on the knit, every collision kind keeps mass
//     and momentum on every transition of the 2-body, 3-body and full tables, and has exactly 5 invariants on each; (ii)
//     on the register rule, the pair piece (and the mixers) commute with the momentum.
//  P1 THE FALSIFIER, the route's kill: some piece of a rule's dock update (the collision, or the coin that runs with it
//     at every dock and beat) changes mass or momentum on some transition.
//  PREDICTED (derivations 1 to 5): P1 FIRES, on momentum and never on mass. Knit: the collision keeps both on every
//   table (0 breaks), so it does not lack a conservation; but its two-body table is the identity (0 moving contents of
//   1,128), with 24 invariants against FCHC's 5, while its 3-body and full tables have exactly 5. So H1 (i) fails on the
//   spurious-invariant requirement at two bodies only. The coin breaks momentum (every crossing set whose roots do not
//   sum to 0) and keeps 12 invariants; coin then collision keeps 1 (mass); the stream keeps both. Register: ||[Q, C_a]||^2
//   = 8 for Q_S and Q_D on every axis and 128 two-body, the swap coin anticommutes on all 96 entries, so H1 (ii) fails at
//   the pair piece itself.
//
// VERDICT, fixed before the gate run: FAIL when P1 fires with I1 and C1 holding (the predicted outcome: the rule's
// update is not FCHC's); PASS when H1 holds and P1 does not fire with I1 and C1 holding; PARTIAL when I1 or C1 fails.
// A predicted number that comes out otherwise is recorded as such and moves no gate.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the conservation laws of each piece of one dock's update exactly, over every
// content of the named tables and, for the knit's dock permutation, every one of the 2^24 occupations. It shows which
// requirement fails and at which piece. It does not read whether a rule with the coin removed would be well behaved
// (reversibility, the vacuum, the line law), whether a knit with its collision alone has Navier-Stokes hydrodynamics
// (that needs isotropy of the viscosity, E-RLT-0056, 0057, and semi-detailed balance, not read), nor the register
// rule's crystal momentum, the Bloch charge of translation it keeps globally (E-FND-0157), which is not the particle
// momentum sum c_i n_i whose flux is the stress. Depth L1: exact counts and exact algebra on the rule's own pieces.
// DETERMINISM: no random numbers; every table is enumerated in a fixed order.
//
// FIRST RUN 2026-10-02 (tmp/fc-run1.log, 85 s): FAIL, as predicted. I1, C1 hold; H1 fails; P1 fires, on momentum and
// never on mass. No gate moved and none was rerun. Every predicted number came out as written.
//  - I1: FHP 4 invariants with head-on collisions, 3 with the triple; |W(F4)| = 1,152; 24 Q_S and 48 Q_D symmetric and
//    idempotent on every entry, tr Q = 8 for both; the side-4 stream a bijection with 0 direction changes; the five
//    FCHC vectors of rank 5.
//  - C1: FCHC's isometric collision, 2-body 23,040 transitions (18,432 moving) and 3-body 93,312 (81,792), 0 mass or
//    momentum breaks, exactly 5 invariants on each. The slot-diagonal pair piece: commutator 0, one- and two-body.
//  - THE KNIT'S COLLISION, all four kinds: 0 mass or momentum breaks on the 2-body (1,128 contents), 3-body (17,344) and
//    full tables (2^24 occupations; moving 9,349,056 isometric, 1,322,496 bounce, 9,302,976 lone and pass). The 2-body
//    table is the identity: 0 contents move, 24 invariants, 19 of them spurious. The 3-body and the full tables have
//    exactly 5, FCHC's set. So the collision lacks no conservation FCHC needs; it fails only the spurious-invariant
//    requirement, and only at two bodies: it has no binary collisions.
//  - THE KNIT'S COIN (keys none, all and each line alone; 1 to 3 vibes): 93,024 crossings, 63,808 moving transitions,
//    63,552 change the momentum (the other 256 cross three lines whose roots sum to 0), 0 change the mass; its own
//    invariants are the 12 line counts. Coin then collision: 127,104 momentum breaks, 1 invariant (the mass).
//  - THE REGISTER RULE: ||[Q, C_a]||^2 = 8 for Q_S and Q_D on every axis (the mixers), and 128 for Q (x) Q against the
//    pair momentum (the pair piece, its only two-body piece); as a slot-pair table each sector allows all 331,776
//    transitions (d, e) -> (d', e'), and 328,392 of them change r_d + r_e. The swap coin sends every root to its
//    negative (0 violations of 96), so it reverses the momentum every beat. Only the stream keeps it.
// WHAT IT MEANS for route K1d: the knit's dock permutation is an FCHC collision in its conservation laws (it is
// Henon's isometric rule with the one covariant element of each stabilizer), except that this element turns no
// two-body content; the momentum the rule loses (E-FND-0170, 0171) is lost at the coin, which hands a lone vibe from
// r to -r, and on the register rule at the pair piece, the mixers and the swap coin alike.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  ExactEchelon,
  fhpToy,
  InvariantTable,
  occupationMomentum,
  permuteOccupation,
  SLOT_MASS,
  SLOT_MOMENTUM,
  stabilizerOf,
  subsets,
  weylF4Slots,
  type TableReading,
} from '@/code/measure/fchc-tables'
import {
  bouncePermutation,
  BOUNCE_TABLE,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import {
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { keyedCoin, type PathKey } from '@/code/measure/full-key-paths'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import {
  MODES,
  partnerProjector48,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'

const KINDS: readonly CollisionKind[] = [
  'isometric',
  'bounce',
  'lone',
  'pass',
]
const REG = 8

export default experiment({
  id: 'fluids/fchc-comparison',
  code: 'E-FLD-0034',
  title:
    "is the rule's collision an FCHC collision? fail as predicted, on momentum and never on mass, at the coin and not at the knit's collision: the knit's collision (pair move and dock permutation, all four kinds) keeps mass and momentum on every two-body, three-body and full table (0 breaks over all 2^24 occupations) and has exactly FCHC's 5 invariants from three bodies up, but its two-body table is the identity (0 of 1,128 contents move, 24 invariants: the deterministic -1 never turns a head-on pair), while its coin changes the momentum on 63,552 of 63,808 moving transitions and coin with collision keeps the mass alone; on the register rule the pair piece itself breaks it (two-body commutator^2 128 in both sectors, 328,392 of 331,776 slot-pair transitions change the pair's momentum), as do the mixers (8) and the swap coin, which reverses it; controls: FCHC's isometric collision keeps both with exactly 5 invariants at two and three bodies, FHP gives 4 and 3, a slot-diagonal pair piece commutes",
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return fchcRun()
  },
})

// ---------------- configurations ----------------

function blank(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

const clone = (c: Configuration): Configuration => ({
  vibe: Int8Array.from(c.vibe),
  point: Int8Array.from(c.point),
  open: Uint8Array.from(c.open),
  store: Int8Array.from(c.store),
  spoint: Int8Array.from(c.spoint),
  sopen: Uint8Array.from(c.sopen),
})

// dock 0's occupation with every store folded in as one particle on each slot of its line
function folded(c: Configuration): number[] {
  const n = new Array<number>(24).fill(0)

  for (let d = 0; d < 24; d++) {
    if (c.vibe[d] !== 0) {
      n[d] = 1
    }
  }

  for (let l = 0; l < 12; l++) {
    if (c.store[l] !== 0) {
      n[LINE_FIRSTS[l]!]!++
      n[OPPOSITE[LINE_FIRSTS[l]!]!]!++
    }
  }

  return n
}

// every dock-0 content of `vibes` vibes (any slots, any tones) and `stores` stores (any lines, either sign) on free lines
function contents(
  cells: number,
  vibes: number,
  stores: number,
): Configuration[] {
  const out: Configuration[] = []

  for (const ls of subsets(12, stores)) {
    for (let ss = 0; ss < 1 << stores; ss++) {
      const free = Array.from({ length: 24 }, (_, d) => d).filter(
        d =>
          !ls.some(
            l =>
              LINE_FIRSTS[l] === d || OPPOSITE[LINE_FIRSTS[l]!] === d,
          ),
      )

      for (const pick of subsets(free.length, vibes)) {
        for (let signs = 0; signs < 1 << vibes; signs++) {
          const c = blank(cells)

          ls.forEach((l, i) => {
            c.store[l] = (ss >> i) & 1 ? 1 : -1
          })

          pick.forEach((k, i) => {
            const d = free[k]!

            c.vibe[d] = (signs >> i) & 1 ? 1 : -1
            c.open[d] = 1
          })
          out.push(c)
        }
      }
    }
  }

  return out
}

const newTable = (): InvariantTable =>
  new InvariantTable(SLOT_MASS, SLOT_MOMENTUM)

// ---------------- FCHC's collision ----------------

function fchcTable(
  group: readonly Int32Array[],
  k: number,
): TableReading {
  const t = newTable()

  for (const s of subsets(24, k)) {
    const n = new Array<number>(24).fill(0)

    for (const d of s) {
      n[d] = 1
    }

    for (const g of stabilizerOf(group, occupationMomentum(n))) {
      t.add(n, permuteOccupation(g, n))
    }
  }

  return t.reading()
}

// ---------------- the knit ----------------

// the knit's collision on dock 0 in both orders (the alternate schedule's P K and K P)
function knitCollisionTable(
  tables: LockedTables,
  family: readonly Configuration[],
): TableReading {
  const t = newTable()

  for (const start of family) {
    const before = folded(start)

    for (const order of [0, 1]) {
      const c = clone(start)

      if (order === 0) {
        pairPiece('none', c, 0)
        coinPiece(tables, c, 0)
      } else {
        coinPiece(tables, c, 0)
        pairPiece('none', c, 0)
      }

      t.add(before, folded(c))
    }
  }

  return t.reading()
}

type FullReading = {
  moving: number
  identity: number
  momentumBroken: number
  rank: number
  invariants: number
}

// the dock permutation on every one of the 2^24 occupations. Every row is checked against the four momentum vectors
// (mass is kept by a permutation); while no row breaks them, rank <= 19, so rows are added to the echelon until it
// reaches 19 and the rank is then exact
function fullTable(kind: CollisionKind): FullReading {
  const ech = new ExactEchelon(24)
  const vibe = new Int8Array(24)
  const perm = new Int32Array(24)
  const delta = new Array<number>(24)
  const seen = new Set<string>()

  let moving = 0
  let identity = 0
  let momentumBroken = 0

  for (let mask = 0; mask < 1 << 24; mask++) {
    for (let d = 0; d < 24; d++) {
      vibe[d] = (mask >> d) & 1
    }

    if (bouncePermutation(BOUNCE_TABLE, kind, vibe, 0, perm) === 0) {
      identity++

      continue
    }

    let after = 0

    for (let d = 0; d < 24; d++) {
      if (vibe[d]) {
        after |= 1 << perm[d]!
      }
    }

    if (after === mask) {
      continue
    }

    moving++

    for (let d = 0; d < 24; d++) {
      delta[d] = ((after >> d) & 1) - ((mask >> d) & 1)
    }

    for (let a = 0; a < 4; a++) {
      let s = 0

      for (let d = 0; d < 24; d++) {
        s += SLOT_MOMENTUM[a]![d]! * delta[d]!
      }

      if (s !== 0) {
        momentumBroken++

        break
      }
    }

    if (ech.rank < 19 || momentumBroken > 0) {
      if (ech.rank < 24) {
        const key = delta.join(',')

        if (!seen.has(key)) {
          seen.add(key)
          ech.add(delta)
        }
      }
    }
  }

  return {
    moving,
    identity,
    momentumBroken,
    rank: ech.rank,
    invariants: 24 - ech.rank,
  }
}

const fixedKey = (lines: number): PathKey => ({
  name: `lines ${lines}`,
  line: (_t, _x, l) => ((lines >> l) & 1 ? 0 : 65535),
  frame: () => 65535,
  store: () => 65535,
})

// the coin alone, and the coin then the collision, on every content of 1 to 3 vibes for each fixed crossing choice
function coinTables(tables: LockedTables): {
  coin: TableReading
  local: TableReading
  crossings: number
} {
  const coin = newTable()
  const local = newTable()
  const choices = [
    0,
    4095,
    ...Array.from({ length: 12 }, (_, l) => 1 << l),
  ]

  let crossings = 0

  for (const k of [1, 2, 3]) {
    for (const start of contents(tables.cells, k, 0)) {
      const before = folded(start)

      for (const lines of choices) {
        const c = clone(start)

        crossings += keyedCoin(
          tables,
          c,
          fixedKey(lines),
          THRESHOLD_BORN,
          0,
        )
        coin.add(before, folded(c))

        for (const order of [0, 1]) {
          const e = clone(c)

          if (order === 0) {
            pairPiece('none', e, 0)
            coinPiece(tables, e, 0)
          } else {
            coinPiece(tables, e, 0)
            pairPiece('none', e, 0)
          }

          local.add(before, folded(e))
        }
      }
    }
  }

  return { coin: coin.reading(), local: local.reading(), crossings }
}

// ---------------- the register rule ----------------

const slotOf = (m: number): number => Math.floor(m / REG)

type ProjectorReading = {
  scale: number
  symmetricBad: number
  idempotentBad: number
  trace: number
  // ||[sQ, C_a]||^2 per axis and ||sQ||^2 (integers), and the unscaled one- and two-body commutators
  commScaled: number[]
  normScaled: number
  oneBody: number[]
  twoBody: number[]
  // the slot-pair table of Q (x) Q: allowed (d, e) -> (d', e'), and those that change r_d + r_e
  pairsAllowed: number
  pairsMomentumChanging: number
}

function projectorReading(
  Q: Float64Array,
  scale: number,
): ProjectorReading {
  let symmetricBad = 0
  let idempotentBad = 0
  let trace = 0

  for (let i = 0; i < MODES; i++) {
    trace += Q[i * MODES + i]!

    for (let j = 0; j < MODES; j++) {
      if (Q[i * MODES + j] !== Q[j * MODES + i]) {
        symmetricBad++
      }
    }
  }

  for (let i = 0; i < MODES; i++) {
    for (let j = 0; j < MODES; j++) {
      let x = 0

      for (let k = 0; k < MODES; k++) {
        x += Q[i * MODES + k]! * Q[k * MODES + j]!
      }

      if (x !== scale * Q[i * MODES + j]!) {
        idempotentBad++
      }
    }
  }

  const commScaled = [0, 1, 2, 3].map(a => {
    let x = 0

    for (let i = 0; i < MODES; i++) {
      for (let j = 0; j < MODES; j++) {
        const q = Q[i * MODES + j]!

        if (q !== 0) {
          const d =
            q *
            (DOCK_ROOTS[slotOf(j)]![a]! - DOCK_ROOTS[slotOf(i)]![a]!)

          x += d * d
        }
      }
    }

    return x
  })

  let normScaled = 0

  // the cross term sum Q_mn^2 (c_n - c_m), which vanishes for a symmetric Q; kept to make the two-body formula exact
  const cross = [0, 0, 0, 0]
  const block = new Uint8Array(24 * 24)

  for (let i = 0; i < MODES; i++) {
    for (let j = 0; j < MODES; j++) {
      const q = Q[i * MODES + j]!

      normScaled += q * q

      if (q !== 0) {
        block[slotOf(i) * 24 + slotOf(j)] = 1

        for (let a = 0; a < 4; a++) {
          cross[a]! +=
            q *
            q *
            (DOCK_ROOTS[slotOf(j)]![a]! - DOCK_ROOTS[slotOf(i)]![a]!)
        }
      }
    }
  }

  const s2 = scale * scale
  const oneBody = commScaled.map(x => x / s2)
  // ||[Q (x) Q, C (x) 1 + 1 (x) C]||^2 = sum Q1^2 Q2^2 (D1 + D2)^2 = 2 ||[Q, C]||^2 ||Q||^2 + 2 (sum Q^2 D)^2
  const twoBody = commScaled.map(
    (x, a) => (2 * x * normScaled + 2 * cross[a]! ** 2) / (s2 * s2),
  )

  let pairsAllowed = 0
  let pairsMomentumChanging = 0

  for (let d = 0; d < 24; d++) {
    for (let e = 0; e < 24; e++) {
      for (let d2 = 0; d2 < 24; d2++) {
        if (!block[d * 24 + d2]) {
          continue
        }

        for (let e2 = 0; e2 < 24; e2++) {
          if (!block[e * 24 + e2]) {
            continue
          }

          pairsAllowed++

          const changes = [0, 1, 2, 3].some(
            a =>
              DOCK_ROOTS[d]![a]! + DOCK_ROOTS[e]![a]! !==
              DOCK_ROOTS[d2]![a]! + DOCK_ROOTS[e2]![a]!,
          )

          if (changes) {
            pairsMomentumChanging++
          }
        }
      }
    }
  }

  return {
    scale,
    symmetricBad,
    idempotentBad,
    trace: trace / scale,
    commScaled,
    normScaled,
    oneBody,
    twoBody,
    pairsAllowed,
    pairsMomentumChanging,
  }
}

// the control projector, slot 0 times the register: diagonal in the slots
function slotZeroProjector(): Float64Array {
  const Q = new Float64Array(MODES * MODES)

  for (let a = 0; a < REG; a++) {
    Q[a * MODES + a] = 1
  }

  return Q
}

// ---------------- the run ----------------

function fchcRun(): Verdict {
  const started = Date.now()
  const log = (s: string): void =>
    console.log(
      `[fc ${((Date.now() - started) / 1000).toFixed(1)} s] ${s}`,
    )

  // I1
  const fhp2 = fhpToy(false)
  const fhp3 = fhpToy(true)
  const group = weylF4Slots()
  const fresh = contactFresh(4, 'pass')
  const base = fresh.tables
  const hit = new Uint8Array(base.target.length)

  let directionChanges = 0

  for (let s = 0; s < base.target.length; s++) {
    if (base.target[s]! % 24 !== s % 24) {
      directionChanges++
    }

    hit[base.target[s]!] = 1
  }

  const streamBijective = hit.every(x => x === 1)
  const fiveRank = (() => {
    const e = new ExactEchelon(24)

    e.add(SLOT_MASS)

    for (const m of SLOT_MOMENTUM) {
      e.add(m)
    }

    return e.rank
  })()
  const QS = projectorReading(singletProjector24(), 24)
  const QD = projectorReading(partnerProjector48(), 48)
  const Q0 = projectorReading(slotZeroProjector(), 1)

  log(
    `I1 FHP ${fhp2.invariants}/${fhp3.invariants}, |W(F4)| ${group.length}, stream dir ${directionChanges} bij ${streamBijective}, five ${fiveRank}`,
  )

  const I1 =
    fhp2.invariants === 4 &&
    fhp3.invariants === 3 &&
    group.length === 1152 &&
    QS.symmetricBad === 0 &&
    QS.idempotentBad === 0 &&
    QS.trace === 8 &&
    QD.symmetricBad === 0 &&
    QD.idempotentBad === 0 &&
    QD.trace === 8 &&
    directionChanges === 0 &&
    streamBijective &&
    fiveRank === 5

  // C1
  const fchc2 = fchcTable(group, 2)
  const fchc3 = fchcTable(group, 3)

  log(`C1 FCHC 2-body ${JSON.stringify(fchc2)}`)
  log(`C1 FCHC 3-body ${JSON.stringify(fchc3)}`)

  const C1 =
    fchc2.massMomentumInvariant &&
    fchc3.massMomentumInvariant &&
    fchc2.invariants === 5 &&
    fchc3.invariants === 5 &&
    Q0.oneBody.every(x => x === 0) &&
    Q0.twoBody.every(x => x === 0)

  // the knit's collision
  const two = [...contents(1, 2, 0), ...contents(1, 0, 1)]
  const three = [...contents(1, 3, 0), ...contents(1, 1, 1)]
  const knit = KINDS.map(kind => {
    const tables: LockedTables = { ...base, collision: kind }
    const r2 = knitCollisionTable(tables, two)
    const r3 = knitCollisionTable(tables, three)
    const full = fullTable(kind)

    log(`knit ${kind}: 2-body ${JSON.stringify(r2)}`)
    log(`knit ${kind}: 3-body ${JSON.stringify(r3)}`)
    log(`knit ${kind}: full ${JSON.stringify(full)}`)

    return { kind, r2, r3, full }
  })

  // the knit's coin, and coin then collision ('pass', the working rule's kind)
  const coin = coinTables(base)

  log(`coin ${JSON.stringify(coin)}`)
  log(`register Q_S ${JSON.stringify({ ...QS })}`)
  log(`register Q_D ${JSON.stringify({ ...QD })}`)
  log(`control Q_0 ${JSON.stringify({ ...Q0 })}`)

  let swapViolations = 0

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < 4; a++) {
      if (DOCK_ROOTS[OPPOSITE[d]!]![a] !== -DOCK_ROOTS[d]![a]!) {
        swapViolations++
      }
    }
  }

  // H1 and P1
  const knitConserves = knit.every(
    k =>
      k.r2.massMomentumInvariant &&
      k.r3.massMomentumInvariant &&
      k.full.momentumBroken === 0,
  )
  const knitFive = knit.every(
    k =>
      k.r2.invariants === 5 &&
      k.r3.invariants === 5 &&
      k.full.invariants === 5,
  )
  const registerCommutes =
    QS.oneBody.every(x => x === 0) &&
    QD.oneBody.every(x => x === 0) &&
    QS.twoBody.every(x => x === 0) &&
    QD.twoBody.every(x => x === 0)
  const H1 = knitConserves && knitFive && registerCommutes
  const coinBreaks =
    coin.coin.momentumBroken > 0 || coin.coin.massBroken > 0
  const swapBreaks = swapViolations === 0
  const P1 =
    !knitConserves || coinBreaks || !registerCommutes || swapBreaks

  // the predictions, read against the run (they move no gate)
  const predicted = {
    knitTwoBodyIdentity: knit.every(
      k => k.r2.moving === 0 && k.r2.invariants === 24,
    ),
    knitThreeBodyFive: knit.every(k => k.r3.invariants === 5),
    knitFullFive: knit.every(k => k.full.invariants === 5),
    coinTwelve:
      coin.coin.invariants === 12 && coin.coin.massBroken === 0,
    localOne: coin.local.invariants === 1,
    registerEight: [...QS.oneBody, ...QD.oneBody].every(x => x === 8),
    register128: [...QS.twoBody, ...QD.twoBody].every(x => x === 128),
  }
  const asPredicted =
    Object.values(predicted).every(Boolean) &&
    knitConserves &&
    swapBreaks

  log(
    `gates I1 ${I1} C1 ${C1} H1 ${H1} P1 ${P1}; predictions ${JSON.stringify(predicted)}`,
  )

  const status: Verdict['status'] =
    !I1 || !C1 ? 'partial' : P1 ? 'fail' : H1 ? 'pass' : 'fail'
  const k = (kind: CollisionKind): (typeof knit)[number] =>
    knit.find(x => x.kind === kind)!

  return verdict({
    status,
    claim: P1
      ? `the kill fires on momentum and never on mass: the knit's collision keeps mass and momentum on every table (all four kinds, the full 2^24 occupations included) but its two-body table is the identity (${k('pass').r2.moving} moving of ${k('pass').r2.transitions / 2} contents, ${k('pass').r2.invariants} invariants against FCHC's ${fchc2.invariants}), while three bodies give ${k('pass').r3.invariants}; the momentum is lost at the coin (${coin.coin.momentumBroken} of ${coin.coin.moving} moving transitions), and on the register rule at the pair piece itself (two-body commutator^2 ${QS.twoBody[0]} on Q_S, ${QD.twoBody[0]} on Q_D), the mixers (${QS.oneBody[0]}, ${QD.oneBody[0]}) and the swap coin, which reverses it; FCHC's own isometric collision keeps both with ${fchc2.invariants} invariants`
      : `no piece of either rule's dock update broke mass or momentum`,
    metrics: {
      fhpTwoBodyInvariants: fhp2.invariants,
      fhpTripleInvariants: fhp3.invariants,
      weylF4: group.length,
      streamDirectionChanges: directionChanges,
      fchcTwoBodyInvariants: fchc2.invariants,
      fchcThreeBodyInvariants: fchc3.invariants,
      fchcTwoBodyMoving: fchc2.moving,
      fchcTwoBodyBreaks: fchc2.massBroken + fchc2.momentumBroken,
      fchcThreeBodyBreaks: fchc3.massBroken + fchc3.momentumBroken,
      ...Object.fromEntries(
        knit.flatMap(x => [
          [`${x.kind}TwoBodyMoving`, x.r2.moving],
          [`${x.kind}TwoBodyInvariants`, x.r2.invariants],
          [`${x.kind}ThreeBodyInvariants`, x.r3.invariants],
          [
            `${x.kind}ThreeBodyBreaks`,
            x.r3.massBroken + x.r3.momentumBroken,
          ],
          [`${x.kind}FullMoving`, x.full.moving],
          [`${x.kind}FullMomentumBroken`, x.full.momentumBroken],
          [`${x.kind}FullInvariants`, x.full.invariants],
        ]),
      ),
      coinMoving: coin.coin.moving,
      coinMomentumBroken: coin.coin.momentumBroken,
      coinMassBroken: coin.coin.massBroken,
      coinInvariants: coin.coin.invariants,
      coinCrossings: coin.crossings,
      localMomentumBroken: coin.local.momentumBroken,
      localInvariants: coin.local.invariants,
      registerQsOneBody: QS.oneBody[0]!,
      registerQdOneBody: QD.oneBody[0]!,
      registerQsTwoBody: QS.twoBody[0]!,
      registerQdTwoBody: QD.twoBody[0]!,
      registerQsPairsAllowed: QS.pairsAllowed,
      registerQsPairsMomentumChanging: QS.pairsMomentumChanging,
      registerQdPairsAllowed: QD.pairsAllowed,
      registerQdPairsMomentumChanging: QD.pairsMomentumChanging,
      swapCoinAnticommuteViolations: swapViolations,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      fchcTwoBodyInvariants: fchc2.invariants,
      fchcThreeBodyInvariants: fchc3.invariants,
      slotDiagonalOneBody: Q0.oneBody[0]!,
      slotDiagonalTwoBody: Q0.twoBody[0]!,
    },
    notes: `gates I1 ${I1}, C1 ${C1}, H1 ${H1}, P1 ${P1}; as predicted ${asPredicted} (${JSON.stringify(predicted)})`,
  })
}
