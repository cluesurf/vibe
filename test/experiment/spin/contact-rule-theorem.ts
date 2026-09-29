// WHICH CONTACT RULES FOR LIKE VIBES THE COINED KNIT ALLOWS (E-SPN-0092). E-SPN-0091 found that once the covariant coin
// makes positions interfere, the knit's bounce of a full line is a mode swap with fermion sign -1, so two like loves
// in contact pay w x -1 = e^(-i pi/3) where the stand-in token paid w, and the one-line three-love cluster unbinds.
// The question put here: which covariant, reversible rules can a full line of two LIKE vibes (two loves or two fears)
// follow, what sign each carries under the canonical fermion ordering, and is "pass" (the two keep their slots) one
// of them, keeping every symmetry the knit keeps?
//
// THE THEOREM (derived before the run, each clause gated below).
// (1) The like contact space is one line's pair. The knit's only like meeting is a full line: both slots of one line
//     of one dock held (code/rule/doublet-locked-knit). Two like fermions on a line's two modes span Lambda^2(C^2),
//     dimension 1. So a reversible rule that keeps the knit's occupation dynamics acts on a full like line as ONE
//     number u of modulus 1. On the dock's twelve full-line pair states W(F4) acts by a signed permutation (a line
//     element that reverses r swaps the two modes, sign -1). It is transitive on the twelve lines, so a covariant rule
//     that keeps every line's occupation must use the SAME u on all twelve (the diagonal part of the commutant has
//     dimension 1). The full commutant (rules that may carry a pair onto another line, which change the occupation
//     dynamics and so are not contact rules of this knit) is counted by Burnside's character sum and reported.
// (2) Exactness fixes u to six values. The knit's amplitudes lie in Z[w][1/2]. An element of modulus 1 there is
//     (a + b w) / 2^k with N(a + b w) = 4^k; 2 is inert in Z[w], so a + b w = 2^k times a unit, and u is one of the six
//     units +-1, +-w, +-w^2.
// (3) Every one of the six keeps every symmetry. A scalar commutes with the signed permutation of every W(F4) element
//     (the 1,152), with C (the same u on two fears as on two loves), and with R; it keeps charge and the lattice
//     momentum (a full line holds momentum 0 and the occupation is untouched); its inverse is conj(u) (T symmetric:
//     conj(u) = u^-1 for a 1 x 1 unit); and it is reversible. No clause of the knit's symmetry picks one.
// (4) Two of the six are slot permutations, four are new phases. The knit's collision acts on a full line by a
//     permutation of its two slots, and the canonical fermionic lift gives the identity +1 and the swap -1, in EVERY
//     order of the dock's modes (a transposition is odd in any order; the ratio of two lifts of one occupation map is
//     the parity of their relative permutation, which reads no order). So BOUNCE (the knit's B: the swap) is u = -1
//     and PASS (the identity) is u = +1. The other four (+-w, +-w^2) are not permutations and would add a new number
//     beside the meeting's w. Pass is the ONLY contact rule other than the bounce that brings in no new number.
// (5) Pass is a collision of the knit. On every dock configuration, 'pass' (B with its -1 replaced by +1 on each full
//     line holding two like vibes, code/rule/bounce-pair-knit) is a slot permutation with B's occupation and charge on
//     every slot, an involution, keeping F and P, commuting with all 1,152 W(F4) maps, with C and with R. A love and a
//     fear on a full line still turn (the vacuum's pairs are unlike, so the vacuum's unmaking is B's). Put into the
//     coined knit with the fermion sign it is exact and reversible, and its fermion sign is B's times (-1)^(like full
//     lines on B's docks).
// So with the meeting's w, the contact phase of a like full line is w u: pass w (energy -2 pi/3, the token's, which
// E-SPN-0087 found binds), bounce -w (+pi/3, E-SPN-0091's repulsion), and the four new phases 1, -1, w^2, -w^2.
//
// GATES, fixed before the first run.
//  K1 exact units: for k = 0 to 6, every a + b w with |a|, |b| <= 2^(k+1) and N = 4^k is 2^k times a unit, and there
//     are exactly six at each k
//  K2 the line pair: the like pair space of a line has dimension 1 (the pairs of a line's 2 modes); W(F4) closes at
//     1,152 and is transitive on the 12 lines; the diagonal covariant rules (one u per line, commuting with every
//     signed line permutation) form a space of dimension 1; the full commutant dimension (1/|G|) sum chi(g)^2 is an
//     integer (reported)
//  K3 the lifts: on every love-only and every fear-only occupation of one dock with at most 5 held slots (the other
//     docks empty), the knit's own fermionSign under 'pass' over its sign under 'lone' is (-1)^(full lines) on docks
//     with at most one single line, +1 on the others, and equals the parity of the relative slot permutation computed
//     by cycles (order-free)
//  K4 pass is a collision: on every dock configuration with at most 3 held slots (charges +-1, 17,345), every love-only
//     and fear-only configuration of full lines plus at most one single (all 4,096 full-line sets), and 4,096 Weyl
//     configurations of any occupancy: 'pass' is a permutation, its vibe image equals 'lone''s, it is an involution
//     (identities tracked), it keeps F and P, it fixes the slots of every like full line on B's docks and equals
//     'lone' on every other slot and on K's docks, commutes with C (a fear for a love) and with R
//  K5 covariance: on the at-most-3 set and the full-line sets (both closed under W(F4), so a generating set decides
//     the whole group there) under a generating set, and on the Weyl set (not closed) under all 1,152 maps, 'pass'
//     commutes with W(F4) (0 off); control: 'lone' commutes too, and a rule that passes on ONE line only fails (the
//     check has teeth)
//  K6 the knit: three open loves (two on one line of one dock, a third a dock away; side 4, 8 beats, fermion sign on)
//     on each of the 17 starts under 'pass': the norm is exact at every beat and the exact inverse returns amplitude 1
//     on the start; and the state differs from 'lone''s (the contact is live)
//  K7 the six contact rules: of the six units exactly two are +-1 (permutation lifts) and all six have conj(u) u = 1;
//     the contact phases w u are the six units again, with pass -> w and bounce -> -w
//  Verdict: pass if K1 to K7 hold.
// REPORTED: on the classical vacuum (side 8, 48 beats, 17 starts, no open vibe) how many beats 'pass' differs from
// 'lone', how many like full lines it meets, and whether 48 beats forward and back return the start.
//
// PREDICTIONS: all pass (the theorem). The vacuum: unmade pairs stream apart as a love and a fear; two loves of
// different pairs can meet on a full line with different points, so 'pass' may differ from 'lone' there (not gated).
//
// FIRST RUN (109 s, tmp/spn92-exp1.log): FAIL on K4 alone, no gate moved. K1, K2, K3, K5, K6, K7 pass. K1: six
// modulus-one elements at every k = 0..6, each 2^k times a unit. K2: 1,152, transitive on the lines, diagonal
// dimension 1 (one u for all twelve); the signed commutant on the twelve pair states is 2 (the identity and one rule
// that carries a pair onto other lines), the unsigned 3. K3: 110,910 one-charge occupations, 552 with ratio -1, 0 off
// the prediction and 0 off the cycle parity. K5: 5,461,638 checks, pass 0 off, lone 0 off, the one-line control 184,176
// off. K6: exact and reversible on 17 of 17 starts, differing from the bounce on 8 of 8 beats of every start. K7: pass
// w (energy -2 pi/3), bounce -w (+pi/3). K4 FAILS on one clause, "keeps F": 1,650 of 127,937 configurations change their
// full-line set. Every other clause holds (0 off), and 'pass''s vibe image equals 'lone''s on all 127,937, so the same
// 1,650 change F under the knit's own collision: they are K's docks (two or more singles), where the isometric map w_P
// need not carry F onto itself. The clause was mis-stated for K's docks (B keeps F; K does not), and 'pass' is K there.
// NOT PREDICTED, REPORTED: on the classical vacuum 'pass' differs from 'lone' on 47 of 48 beats of every start (about
// 86,000 like full lines met in 48 beats): two like vibes of different pairs meet with different points, and pass keeps
// each point on its slot where the bounce swaps them. So pass is not invisible to the classical knit: it changes which
// point rides which slot on the vacuum (reversibly: 48 beats forward and back return the start on 17 of 17).
//
// Depth L1: exhaustive and exact on the dock (integers, permutations, Eisenstein units); the knit runs are exact in
// Z[w][1/2]. Bulk identities of the rule: they hold on every husk column by being identities of the dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  bouncePermutation,
  BOUNCE_TABLE,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import {
  lockedBeat,
  lockedBeatBack,
  lockedNorm,
  lockedState,
  lockedTables,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedBeat,
  coinedBeatBack,
  fermionSign,
  newCoinTally,
} from '@/code/rule/coined-locked-knit'
import {
  lockedFresh,
  vacuumConfiguration,
  SILVER_RATE,
} from '@/code/measure/doublet-locked-readings'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  UNITS,
  eConj,
  eMul,
  eEq,
  weylF4,
  type Eis,
} from '@/code/measure/covariant-coin'

const ROOTS = rootsD4()
const FERMION = { fermion: true }
const NATIVE = { fermion: false }
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f]!,
)

const emptyConfiguration = (cells: number): Configuration => ({
  vibe: new Int8Array(cells * 24),
  point: new Int8Array(cells * 24),
  open: new Uint8Array(cells * 24),
  store: new Int8Array(cells * 12),
  spoint: new Int8Array(cells * 12),
  sopen: new Uint8Array(cells * 12),
})

// ---- K1: the modulus-one elements of Z[w][1/2] ----
function exactUnits(kMax: number): {
  perK: number[]
  allUnitMultiples: boolean
} {
  const perK: number[] = []

  let allUnitMultiples = true

  for (let k = 0; k <= kMax; k++) {
    const m = 2 ** (k + 1)
    const target = 4 ** k
    const s = 2 ** k

    let n = 0

    for (let a = -m; a <= m; a++) {
      for (let b = -m; b <= m; b++) {
        if (a * a - a * b + b * b !== target) {
          continue
        }

        n++

        if (a % s !== 0 || b % s !== 0) {
          allUnitMultiples = false
          continue
        }

        const qa = a / s
        const qb = b / s

        if (qa * qa - qa * qb + qb * qb !== 1) {
          allUnitMultiples = false
        }
      }
    }

    perK.push(n)
  }

  return { perK, allUnitMultiples }
}

// ---- K2: the signed line representation of W(F4) on the twelve full-line pair states ----
function lineRepresentation(group: readonly number[][]): {
  order: number
  transitive: boolean
  diagonalDimension: number
  commutantDimension: number
  burnsideLines: number
} {
  // g carries line l's pair e_first ^ e_second to +- the pair of line LINE_OF[g[first]]
  const image = (
    g: readonly number[],
    l: number,
  ): { to: number; sign: number } => {
    const f = g[LINE_FIRSTS[l]!]!
    const to = LINE_OF[f]!

    return { to, sign: f === LINE_FIRSTS[to] ? 1 : -1 }
  }

  const orbit = new Set<number>()

  for (const g of group) {
    orbit.add(image(g, 0).to)
  }

  // sum of chi(g)^2 over the group, chi the signed trace; and the unsigned Burnside count of line orbitals
  let chi2 = 0
  let fixed2 = 0

  for (const g of group) {
    let chi = 0
    let fixed = 0

    for (let l = 0; l < 12; l++) {
      const im = image(g, l)

      if (im.to === l) {
        chi += im.sign
        fixed++
      }
    }

    chi2 += chi * chi
    fixed2 += fixed * fixed
  }

  // diagonal covariant rules: u_l with g D g^-1 = D for all g, i.e. u constant on line orbits (signs cancel on a
  // diagonal: D_(g l) = D_l). The dimension is the number of line orbits.
  const orbits: number[] = []
  const seen = new Set<number>()

  for (let l = 0; l < 12; l++) {
    if (seen.has(l)) {
      continue
    }

    orbits.push(l)

    for (const g of group) {
      seen.add(image(g, l).to)
    }
  }

  return {
    order: group.length,
    transitive: orbit.size === 12,
    diagonalDimension: orbits.length,
    commutantDimension: chi2 / group.length,
    burnsideLines: fixed2 / group.length,
  }
}

// ---- the dock permutations ----
const OUT = new Int32Array(24)

function permOf(kind: CollisionKind, vibe: Int8Array): Int32Array {
  const k = bouncePermutation(BOUNCE_TABLE, kind, vibe, 0, OUT)
  const p = new Int32Array(24)

  for (let d = 0; d < 24; d++) {
    p[d] = k === 0 ? d : OUT[d]!
  }

  return p
}

// a rule that passes on line 0 only: not covariant (the negative control)
function oneLinePerm(vibe: Int8Array): Int32Array {
  const p = permOf('lone', vibe)
  const f = LINE_FIRSTS[0]!
  const s = LINE_SECONDS[0]!

  if (
    vibe[f] !== 0 &&
    vibe[f] === vibe[s] &&
    p[f] === s &&
    p[s] === f
  ) {
    p[f] = f
    p[s] = s
  }

  return p
}

type DockShape = { full: number; singles: number; fullLike: number }

function shapeOf(vibe: Int8Array): DockShape {
  let full = 0
  let singles = 0
  let fullLike = 0

  for (let l = 0; l < 12; l++) {
    const a = vibe[LINE_FIRSTS[l]!]!
    const b = vibe[LINE_SECONDS[l]!]!

    if (a !== 0 && b !== 0) {
      full |= 1 << l

      if (a === b) {
        fullLike++
      }
    } else if (a !== 0 || b !== 0) {
      singles++
    }
  }

  return { full, singles, fullLike }
}

const momentum = (vibe: Int8Array): string => {
  const p = [0, 0, 0, 0]

  for (let d = 0; d < 24; d++) {
    if (vibe[d] !== 0) {
      for (let i = 0; i < 4; i++) {
        p[i] = p[i]! + ROOTS[d]![i]!
      }
    }
  }

  return p.join(',')
}

const applyPerm = (p: Int32Array, v: Int8Array): Int8Array => {
  const out = new Int8Array(24)

  for (let d = 0; d < 24; d++) {
    out[p[d]!] = v[d]!
  }

  return out
}

const sameArray = (
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

// ---- the configuration families ----
function smallConfigs(maxHeld: number): Int8Array[] {
  const out: Int8Array[] = []

  const rec = (from: number, v: Int8Array, held: number): void => {
    out.push(Int8Array.from(v))

    if (held === maxHeld) {
      return
    }

    for (let d = from; d < 24; d++) {
      for (const c of [1, -1]) {
        v[d] = c
        rec(d + 1, v, held + 1)
        v[d] = 0
      }
    }
  }

  rec(0, new Int8Array(24), 0)

  return out
}

// every set of full lines, each with at most one single (every slot of a non-full line, or none), one charge
function fullLineConfigs(charge: number): Int8Array[] {
  const out: Int8Array[] = []

  for (let F = 0; F < 1 << 12; F++) {
    const base = new Int8Array(24)

    for (let l = 0; l < 12; l++) {
      if (!((F >> l) & 1)) {
        continue
      }

      base[LINE_FIRSTS[l]!] = charge
      base[LINE_SECONDS[l]!] = charge
    }

    out.push(base)

    for (let d = 0; d < 24; d++) {
      if ((F >> LINE_OF[d]!) & 1) {
        continue
      }

      const v = Int8Array.from(base)

      v[d] = charge
      out.push(v)
    }
  }

  return out
}

// integer Weyl configurations: even n dense (each slot a trit), odd n sparse (a third held)
function weylConfigs(count: number): Int8Array[] {
  const out: Int8Array[] = []

  for (let n = 0; n < count; n++) {
    const v = new Int8Array(24)

    for (let d = 0; d < 24; d++) {
      const h =
        (((n * 24 + d) * SILVER_RATE + n * 7919 + 12345) % 65536) >> 4

      if (n % 2 === 0) {
        v[d] = (h % 3) - 1
      } else {
        v[d] = h % 6 === 0 ? 1 : h % 6 === 1 ? -1 : 0
      }
    }

    out.push(v)
  }

  return out
}

// ---- K4: the collision's properties on one configuration ----
type CollisionTally = {
  configs: number
  notPermutation: number
  vibeDiffers: number
  notInvolution: number
  brokenF: number
  brokenP: number
  likeNotFixed: number
  otherDiffers: number
  brokenC: number
  brokenR: number
  likeFullSeen: number
}

const newCollisionTally = (): CollisionTally => ({
  configs: 0,
  notPermutation: 0,
  vibeDiffers: 0,
  notInvolution: 0,
  brokenF: 0,
  brokenP: 0,
  likeNotFixed: 0,
  otherDiffers: 0,
  brokenC: 0,
  brokenR: 0,
  likeFullSeen: 0,
})

function collisionChecks(v: Int8Array, t: CollisionTally): void {
  t.configs++

  const p = permOf('pass', v)
  const b = permOf('lone', v)
  const seen = new Uint8Array(24)

  for (let d = 0; d < 24; d++) {
    seen[p[d]!] = 1
  }

  if (seen.some(x => x === 0)) {
    t.notPermutation++
  }

  const image = applyPerm(p, v)

  if (!sameArray(image, applyPerm(b, v))) {
    t.vibeDiffers++
  }

  // involution, identities tracked: slot d's identity lands at p[d], then at p'[p[d]] under the image's permutation
  const p2 = permOf('pass', image)

  for (let d = 0; d < 24; d++) {
    if (v[d] !== 0 && p2[p[d]!] !== d) {
      t.notInvolution++
      break
    }
  }

  const s0 = shapeOf(v)
  const s1 = shapeOf(image)

  if (s0.full !== s1.full) {
    t.brokenF++
  }

  if (momentum(v) !== momentum(image)) {
    t.brokenP++
  }

  t.likeFullSeen += s0.fullLike

  const bDock = s0.singles <= 1

  for (let d = 0; d < 24; d++) {
    const like = v[d] !== 0 && v[d] === v[OPPOSITE[d]!]

    if (bDock && like) {
      if (p[d] !== d) {
        t.likeNotFixed++
      }
    } else if (p[d] !== b[d]) {
      t.otherDiffers++
    }
  }

  // C: a fear for every love
  const c = Int8Array.from(v, x => -x)

  if (!sameArray(permOf('pass', c), p)) {
    t.brokenC++
  }

  // R: (R v)[OPP d] = v[d]; the permutation of R v must be R p R
  const r = new Int8Array(24)

  for (let d = 0; d < 24; d++) {
    r[OPPOSITE[d]!] = v[d]!
  }

  const pr = permOf('pass', r)

  for (let d = 0; d < 24; d++) {
    if (pr[OPPOSITE[d]!] !== OPPOSITE[p[d]!]) {
      t.brokenR++
      break
    }
  }
}

// ---- K5: covariance ----
function covariantOn(
  rule: (v: Int8Array) => Int32Array,
  v: Int8Array,
  p: Int32Array,
  g: readonly number[],
): boolean {
  const gv = new Int8Array(24)

  for (let d = 0; d < 24; d++) {
    gv[g[d]!] = v[d]!
  }

  const q = rule(gv)

  for (let d = 0; d < 24; d++) {
    if (v[d] !== 0 && q[g[d]!] !== g[p[d]!]) {
      return false
    }
  }

  return true
}

function generatingSet(group: readonly number[][]): number[][] {
  const key = (g: readonly number[]): string => g.join(',')
  const gens: number[][] = []

  let closure = new Set<string>([
    key(group.find(g => g.every((x, i) => x === i))!),
  ])

  for (const g of group) {
    if (closure.has(key(g))) {
      continue
    }

    gens.push([...g])

    const frontier: number[][] = [...closure].map(s =>
      s.split(',').map(Number),
    )
    const all = new Set(closure)

    while (frontier.length > 0) {
      const h = frontier.pop()!

      for (const x of gens) {
        const y = h.map(i => x[i]!)
        const k = key(y)

        if (!all.has(k)) {
          all.add(k)
          frontier.push(y)
        }
      }
    }

    closure = all

    if (closure.size === group.length) {
      break
    }
  }

  return gens
}

// ---- K3: the lifts ----
function relativeParity(
  pass: Int32Array,
  lone: Int32Array,
  v: Int8Array,
): number {
  // rho = lone^-1 o pass on the held slots
  const inv = new Int32Array(24)

  for (let d = 0; d < 24; d++) {
    inv[lone[d]!] = d
  }

  const done = new Uint8Array(24)

  let sign = 1

  for (let d = 0; d < 24; d++) {
    if (v[d] === 0 || done[d]) {
      continue
    }

    let len = 0
    let x = d

    while (!done[x]) {
      done[x] = 1
      len++
      x = inv[pass[x]!]!
    }

    if (len % 2 === 0) {
      sign = -sign
    }
  }

  return sign
}

function liftChecks(maxHeld: number): {
  occupations: number
  predictedOff: number
  cycleOff: number
  minusOnes: number
} {
  const weave = makeColorWeave({ side: 4, table: 'bind' })
  const tLone = lockedTables(weave, 'lone')
  const tPass = lockedTables(weave, 'pass')
  const c = emptyConfiguration(tLone.cells)
  const br: Branch = { ...c, a: 1n, b: 0n, k: 0 }

  let occupations = 0
  let predictedOff = 0
  let cycleOff = 0
  let minusOnes = 0

  for (const charge of [1, -1]) {
    const rec = (from: number, held: number): void => {
      occupations++

      const v = br.vibe.subarray(0, 24)
      const ratio = fermionSign(tPass, br) * fermionSign(tLone, br)
      const s = shapeOf(Int8Array.from(v))
      const predicted =
        s.singles <= 1 ? (s.fullLike % 2 === 0 ? 1 : -1) : 1

      if (ratio !== predicted) {
        predictedOff++
      }

      if (ratio < 0) {
        minusOnes++
      }

      const vv = Int8Array.from(v)

      if (
        relativeParity(permOf('pass', vv), permOf('lone', vv), vv) !==
        ratio
      ) {
        cycleOff++
      }

      if (held === maxHeld) {
        return
      }

      for (let d = from; d < 24; d++) {
        br.vibe[d] = charge
        rec(d + 1, held + 1)
        br.vibe[d] = 0
      }
    }

    rec(0, 0)
  }

  return { occupations, predictedOff, cycleOff, minusOnes }
}

// ---- K6: the coined knit with pass ----
function stateKey(s: LockedState): string {
  return s.branches
    .map(b => {
      const held: string[] = []

      for (let i = 0; i < b.vibe.length; i++) {
        if (b.vibe[i] !== 0) {
          held.push(`${i}:${b.vibe[i]}:${b.point[i]}:${b.open[i]}`)
        }
      }

      return `${held.join(';')}=${b.a},${b.b},${b.k}`
    })
    .sort()
    .join('|')
}

function superposition(beats: number): {
  normExact: boolean
  reversed: boolean
  branchesMax: number
  differsBeats: number
  splits: number
} {
  const side = 4
  const weave = makeColorWeave({ side, table: 'bind' })
  const tables = lockedTables(weave, 'pass')
  const lone = lockedTables(weave, 'lone')
  const cells = tables.cells
  const start = emptyConfiguration(cells)
  const d1 = ((1 * SILVER_RATE) % 65536) % 24
  const second = tables.target[0 * 24 + d1]!
  const third =
    Math.floor(second / 24) * 24 + (((3 * SILVER_RATE) % 65536) % 24)
  const slots = [
    d1,
    OPPOSITE[d1]!,
    third === d1 || third === OPPOSITE[d1]! ? third + 24 : third,
  ]

  slots.forEach((s, n) => {
    start.vibe[s] = 1
    start.open[s] = 1
    start.point[s] = (((n + 1) * SILVER_RATE) % 65536) % 9
  })

  let s: LockedState = lockedState(start)
  let l: LockedState = lockedState(start)

  const tally = newCoinTally()

  let normExact = true
  let branchesMax = 1
  let differsBeats = 0

  for (let t = 0; t < beats; t++) {
    s = coinedBeat(tables, s, t, FERMION, undefined, tally)
    l = coinedBeat(lone, l, t, FERMION)

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)

    if (stateKey(s) !== stateKey(l)) {
      differsBeats++
    }
  }

  for (let t = beats - 1; t >= 0; t--) {
    s = coinedBeatBack(tables, s, t, FERMION)
  }

  const b0 = s.branches[0]
  const reversed =
    s.branches.length === 1 &&
    !!b0 &&
    b0.a === 1n &&
    b0.b === 0n &&
    b0.k === 0 &&
    stateKey(s) === stateKey(lockedState(start))

  return {
    normExact,
    reversed,
    branchesMax,
    differsBeats,
    splits: tally.splits,
  }
}

// ---- REPORTED: the classical vacuum ----
function vacuum(
  side: number,
  beats: number,
): { differs: number; likeFull: number; returned: boolean } {
  const f = lockedFresh(side)
  const pass: LockedTables = lockedTables(f.weave, 'pass')
  const start = vacuumConfiguration(f, 'none')

  let a: LockedState = lockedState(start)
  let b: LockedState = lockedState(start)
  let differs = 0
  let likeFull = 0

  for (let t = 0; t < beats; t++) {
    const x = a.branches[0]!

    for (let c = 0; c < f.cells; c++) {
      for (let l = 0; l < 12; l++) {
        const i = x.vibe[c * 24 + LINE_FIRSTS[l]!]!
        const j = x.vibe[c * 24 + LINE_SECONDS[l]!]!

        if (i !== 0 && i === j) {
          likeFull++
        }
      }
    }

    a = lockedBeat(pass, a, t)
    b = coinedBeat(f.tables, b, t, NATIVE)

    if (stateKey(a) !== stateKey(b)) {
      differs++
    }
  }

  for (let t = beats - 1; t >= 0; t--) {
    a = lockedBeatBack(pass, a, t)
  }

  return {
    differs,
    likeFull,
    returned: stateKey(a) === stateKey(lockedState(start)),
  }
}

export default experiment({
  id: 'spin/contact-rule-theorem',
  code: 'E-SPN-0092',
  title:
    "which contact rules a full line of two like vibes allows in the coined doublet-locked knit: one Eisenstein unit u, the same on all twelve lines, every one of the six covariant (1,152 W(F4), C, T, charge, momentum, reversal); two are slot permutations, the bounce (-1, the knit's B) and the pass (+1), the only other rule with no new number; pass is a collision of the knit and makes the like contact cost the meeting's w alone",
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

    // ---- K1 ----
    const units = exactUnits(6)
    const k1 = units.allUnitMultiples && units.perK.every(n => n === 6)

    // ---- K2 ----
    const group = weylF4()
    const rep = lineRepresentation(group)
    const k2 =
      rep.order === 1152 &&
      rep.transitive &&
      rep.diagonalDimension === 1 &&
      Number.isInteger(rep.commutantDimension)

    log('K1 K2')

    // ---- K3 ----
    const lifts = liftChecks(5)
    const k3 =
      lifts.predictedOff === 0 &&
      lifts.cycleOff === 0 &&
      lifts.minusOnes > 0

    log('K3')

    // ---- K4 ----
    const small = smallConfigs(3)
    const fullSets = [...fullLineConfigs(1), ...fullLineConfigs(-1)]
    const sample = weylConfigs(4096)
    const col = newCollisionTally()

    for (const v of [...small, ...fullSets, ...sample]) {
      collisionChecks(v, col)
    }

    const k4 =
      col.notPermutation === 0 &&
      col.vibeDiffers === 0 &&
      col.notInvolution === 0 &&
      col.brokenF === 0 &&
      col.brokenP === 0 &&
      col.likeNotFixed === 0 &&
      col.otherDiffers === 0 &&
      col.brokenC === 0 &&
      col.brokenR === 0 &&
      col.likeFullSeen > 0

    log('K4')

    // ---- K5 ----
    const gens = generatingSet(group)
    const passRule = (v: Int8Array): Int32Array => permOf('pass', v)
    const loneRule = (v: Int8Array): Int32Array => permOf('lone', v)

    let passOff = 0
    let loneOff = 0
    let oneLineOff = 0
    let covChecks = 0

    const covary = (
      v: Int8Array,
      maps: readonly (readonly number[])[],
      oneLine: boolean,
    ): void => {
      const pp = passRule(v)
      const pl = loneRule(v)
      const po = oneLinePerm(v)

      for (const g of maps) {
        covChecks++

        if (!covariantOn(passRule, v, pp, g)) {
          passOff++
        }

        if (!covariantOn(loneRule, v, pl, g)) {
          loneOff++
        }

        if (oneLine && !covariantOn(oneLinePerm, v, po, g)) {
          oneLineOff++
        }
      }
    }

    // the at-most-3 set and the full-line sets are closed under W(F4), so a generating set decides the group there
    for (const v of small) {
      covary(v, gens, true)
    }

    for (const v of fullSets) {
      covary(v, gens, false)
    }

    // the Weyl set is not closed: every map
    for (const v of sample) {
      covary(v, group, true)
    }

    const k5 = passOff === 0 && loneOff === 0 && oneLineOff > 0

    log('K5')

    // ---- K6 ----
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const r = superposition(8)

        log(`start ${member.name}`)

        return { name: member.name, ...r }
      }),
    )
    const k6 = perStart.every(
      p => p.normExact && p.reversed && p.differsBeats > 0,
    )

    // ---- K7 ----
    const W: Eis = [0, 1]
    const permutationLifts = UNITS.filter(
      u => (u.value[0] === 1 || u.value[0] === -1) && u.value[1] === 0,
    )
    const allT = UNITS.every(u =>
      eEq(eMul(eConj(u.value), u.value), [1, 0]),
    )
    const contact = UNITS.map(u => ({
      unit: u.name,
      sixths: u.sixths,
      phase: eMul(W, u.value),
    }))
    const phasesAreUnits = contact.every(c =>
      UNITS.some(u => eEq(u.value, c.phase)),
    )
    const passPhase = contact.find(c => c.sixths === 0)!.phase
    const bouncePhase = contact.find(c => c.sixths === 3)!.phase
    const k7 =
      permutationLifts.length === 2 &&
      allT &&
      phasesAreUnits &&
      eEq(passPhase, W) &&
      eEq(bouncePhase, [0, -1])

    const energyOf = (ph: Eis): number => {
      const ang = Math.atan2(
        (Math.sqrt(3) / 2) * ph[1],
        ph[0] - ph[1] / 2,
      )

      let e = -ang

      while (e <= -Math.PI) {
        e += 2 * Math.PI
      }

      while (e > Math.PI) {
        e -= 2 * Math.PI
      }

      return e
    }

    // ---- REPORTED ----
    const vac = family.map(member =>
      withStart(member, () => ({
        name: member.name,
        ...vacuum(8, 48),
      })),
    )

    log('vacuum')

    const ok = k1 && k2 && k3 && k4 && k5 && k6 && k7

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `a like contact in the coined knit is a full line, whose like pair space has dimension 1, so a reversible rule keeping the occupation is one unit u; exactness leaves six (every modulus-one element of Z[w][1/2] up to 4^6 is 2^k times a unit, ${units.perK.join(', ')} per k); W(F4) (${rep.order}) is transitive on the 12 lines, so covariance forces one u on all of them (diagonal dimension ${rep.diagonalDimension}; full signed commutant ${rep.commutantDimension}, lines' Burnside ${rep.burnsideLines}); every unit keeps C, T (conj(u) u = 1), charge, momentum and reversal; two are slot permutations: the bounce u = -1 (the knit's B) and the pass u = +1, with the lift ratio (-1)^(like full lines) on ${lifts.occupations} occupations (0 off, order-free by cycles); 'pass' is a collision of the knit on ${col.configs} dock configurations (${col.likeFullSeen} like full lines seen: permutation, B's vibe image, involution, F, P, C, R, 0 off) and covariant (${covChecks} checks, 0 off; the one-line control breaks ${oneLineOff}); in the coined knit with the fermion sign it is exact and reversible on ${perStart.filter(p => p.normExact && p.reversed).length} of 17 starts and differs from B on every start; the like contact phase w u is w (energy ${energyOf(passPhase).toFixed(4)}) under pass against -w (${energyOf(bouncePhase).toFixed(4)}) under the bounce`,
      metrics: {
        gate_K1: k1 ? 1 : 0,
        gate_K2: k2 ? 1 : 0,
        gate_K3: k3 ? 1 : 0,
        gate_K4: k4 ? 1 : 0,
        gate_K5: k5 ? 1 : 0,
        gate_K6: k6 ? 1 : 0,
        gate_K7: k7 ? 1 : 0,
        groupOrder: rep.order,
        diagonalDimension: rep.diagonalDimension,
        commutantDimension: rep.commutantDimension,
        burnsideLines: rep.burnsideLines,
        liftOccupations: lifts.occupations,
        liftPredictedOff: lifts.predictedOff,
        liftCycleOff: lifts.cycleOff,
        liftMinusOnes: lifts.minusOnes,
        collisionConfigs: col.configs,
        likeFullSeen: col.likeFullSeen,
        collisionOff:
          col.notPermutation +
          col.vibeDiffers +
          col.notInvolution +
          col.brokenF +
          col.brokenP +
          col.likeNotFixed +
          col.otherDiffers +
          col.brokenC +
          col.brokenR,
        covarianceChecks: covChecks,
        covariancePassOff: passOff,
        covarianceLoneOff: loneOff,
        covarianceOneLineOff: oneLineOff,
        generators: gens.length,
        knitStartsExact: perStart.filter(p => p.normExact && p.reversed)
          .length,
        knitDiffersBeatsMin: Math.min(
          ...perStart.map(p => p.differsBeats),
        ),
        knitBranchesMax: Math.max(...perStart.map(p => p.branchesMax)),
        vacuumDiffersBeatsMax: Math.max(...vac.map(v => v.differs)),
        vacuumLikeFullMax: Math.max(...vac.map(v => v.likeFull)),
        vacuumReturned: vac.filter(v => v.returned).length,
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L1. Gates K1 ${k1}, K2 ${k2}, K3 ${k3}, K4 ${k4}, K5 ${k5}, K6 ${k6}, K7 ${k7}. K1 per k = 0..6: ${units.perK.join(' ')}. K2: order ${rep.order}, transitive ${rep.transitive}, diagonal ${rep.diagonalDimension}, signed commutant ${rep.commutantDimension}, unsigned ${rep.burnsideLines}. K3: ${lifts.occupations} occupations, ${lifts.minusOnes} with ratio -1, off ${lifts.predictedOff} (predicted), ${lifts.cycleOff} (cycles). K4 tally: ${JSON.stringify(col)}. K5: ${covChecks} checks (all 1,152 on ${small.length + sample.length} configurations, ${gens.length} generators on ${fullSets.length}), pass off ${passOff}, lone off ${loneOff}, one-line control off ${oneLineOff}. K6 per start (norm, reversed, branches max, beats differing from lone, coin splits): ${perStart.map(p => `${p.name} ${p.normExact}, ${p.reversed}, ${p.branchesMax}, ${p.differsBeats}, ${p.splits}`).join(' | ')}. K7 contact phases w u: ${contact.map(c => `u ${c.unit} -> (${c.phase[0]}, ${c.phase[1]}) energy ${energyOf(c.phase).toFixed(4)}`).join('; ')}. REPORTED vacuum (side 8, 48 beats; beats differing from lone, like full lines met, forward and back returns): ${vac.map(v => `${v.name} ${v.differs}, ${v.likeFull}, ${v.returned}`).join(' | ')}.`,
    })
  },
})
