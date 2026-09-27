// THE TWO PIECES THE WORKING RULE LACKS FOR A BOUND LINE CLUSTER (E-SPN-0103). E-SPN-0102 found E-SPN-0093's three-love
// level runs exactly in the working vacuum (code/rule/coined-locked-knit coinedVetoBeat 'none', the pass contact, the
// coin) but spreads, and named what the stand-in has and the rule lacks: the drift cost, and the fermion sign where
// stores exist. This file writes both as rule-level pieces, each one local in what it reads, exactly reversible, and
// exact in its ring. Each is optional, so the working rule is the case with both off, bit for bit.
//
// (a) THE DRIFT COST, AS A LINK REGISTER AND A CLOCK. The stand-in (code/rule/drift-cost-line) holds on every link l a
// center-flux trit f_l in Z_3. An OPEN vibe copied across link l records the copy there (f_l - q forward, f_l + q back,
// q = +1 a love, -1 a fear: the recorded hop of E-FRC-0230), so Gauss f_x - f_(x-1) = q(x) holds after every copy, and
// every link holding nonzero flux multiplies the amplitude by zeta_(2N)^(-1) each beat, N = 2D + 1 = 7 (pi / 7 a link).
// Here, on the cluster's line: with the loves at ring positions and the flux on the ring's cut link (L - 1 to 0) called
// c, Gauss gives every other link's trit, f_l = c + Q(l), Q(l) the loves at positions 0 .. l. So the whole register
// of the line is ONE trit c beside the positions, and it changes only when a love crosses the cut (forward c - 1, back
// c + 1). The cost per beat is zeta_14^(-n), n the links with c + Q(l) != 0 mod 3; on an unwound cluster (c = 0) n is
// its span, the stand-in's cost exactly.
//   - Closed vibes (the vacuum's classical bookkeeping) record nothing, so the vacuum holds every trit at 0 and pays
//     nothing: it is untouched exactly, not up to a phase.
//   - The cost is diagonal in the configuration, so it moves no vibe: a lone love's support after t beats (its front)
//     is exactly the working rule's. Its AMPLITUDES change: a lone love drags a string whose every link costs, which
//     is a linear potential about its start (confinement), not free flight. This is stated, not hidden.
//   - The phase zeta_14 is NOT in Z[w]: the working ring Z[w][1/2] holds sixth roots only. The exact carrier is a CLOCK
//     COUNT e in Z_14 held with each amplitude (the amplitude is sum_e A_e zeta_14^e, A_e in Z[w][1/2]), one slice per
//     (e, c). Each slice runs by the working rule unchanged; the cost moves a branch from slice e to slice e - n. The
//     slices are a free module over Z[w][1/2]: the map on it is the rule (unitary on each slice) times a permutation of
//     slices, so it keeps the slices' summed norm exactly and runs back exactly; the physical amplitude is the sum over
//     e, read as measurement. So the ring grows from Z[w][1/2] to Z[zeta_42][1/2]; nothing is rounded.
//
// (b) THE FERMION SIGN WHERE STORES EXIST. fermionSign (code/rule/coined-locked-knit) takes the parity of the permutation
// the collision and stream give every occupied slot in the dock-major mode order, and refuses on a store (a collision
// that makes or unmakes a pair would need the store's convention) and on loves beside fears. The consistent convention:
//   - A store holds a love and a fear, two fermions: an EVEN object. Its two modes can sit anywhere in the order, and
//     moving an even block past any mode changes no sign, so the store's place in the order is free, and making a pair
//     costs only the parity of the modes strictly between its two vibes (the two-mode hop), whatever the store's place.
//   - Any fixed total order of the modes gives the same dynamics up to a fixed sign per configuration (a diagonal
//     gauge: the parity of the reordering from one order to the other). So the order may be chosen: the cluster's line
//     first, in ring order from the cut (position, and at one dock the back slot first, E-SPN-0091's order), then every
//     other mode in the rule's own order.
//   - In that order the beat's permutation keeps the two blocks (a line love stays on the line, the vacuum never enters
//     the line's slots: checked on every branch as leak 0 and disturbed 0), so its parity is the line block's times the
//     rest's, and the rest (the vacuum with its stores, closed and classical) is the same on every branch: one common
//     phase per beat, which no reading can see. So the sign that matters is the line block's: the reordering parity of
//     the open loves on their line, from the cut. For three loves crossing the cut passes two others, an even
//     permutation, so the ring's cut is invisible (for n loves it is (-1)^(n - 1), the Jordan-Wigner boundary term).
//   - The piece REFUSES where its hypothesis fails: an open vibe off the line.
//
// ONE BEAT (both pieces optional): the cost (reads the positions and c), the coin, the sign (reads the coined positions
// and labels), the no-veto beat (meetings, collision, stream), and c updated by the loves that crossed the cut. The
// inverse: the no-veto inverse, c undone, the sign, the adjoint coin, the cost undone. With `slant` (E-SPN-0106) the
// cost moves after the coin (it reads the coined labels), and in the inverse before the adjoint coin.
//
// NOTHING MOVES: the cost and the sign are phases; the clock count and c are registers written by the stream's own
// copies. Exact in Z[w][1/2] per slice, no float, no rounding, no random number.

import { coinBranch } from '@/code/rule/coined-locked-knit'
import { bagHeavy, fineCoinBranch, type Bag } from '@/code/rule/fine-coin'
import { mergeBranches, type Branch, type LockedState, type LockedTables, type LockedTally } from '@/code/rule/doublet-locked-knit'
import { vetoBeat, vetoBeatBack } from '@/code/rule/occupation-veto-knit'
import { meetingBeat, meetingBeatBack, type Meeting } from '@/code/rule/permutation-meeting'

// the clock: 2N for N = 2D + 1, D = 3
export const CLOCK = 14

// `meeting` (E-SPN-0104): the like meeting at unequal points. 'split' (the default, and the working rule's) keeps with
// (1 + w)/2 and exchanges with -(1 - w)/2; 'keep' and 'exchange' are the two permutation meetings of code/rule/
// permutation-meeting (a phase w on every like meeting, and at unequal points the points kept or exchanged)
// `slant` (E-SPN-0106, with `cost`): the cost read AFTER the coin, on the coined labels, and a costly link charged only
// on a beat when the two docks bounding its gap do NOT co-move (see slantLinks). Off, the cost is the one above
// `fine` (E-SPN-0107): the fine coin of code/rule/fine-coin in place of the working coin, its phase w taken as its
// n-th part; its count u rides in the slice beside the clock count and the cut trit (key `e,c` at u = 0, `e,c,u`
// otherwise, so every start is a count-0 start). fine = 1 is the working coin bit for bit
// `fullDock` (E-SPN-0108, with `fine`): the full-dock correction of code/rule/fine-coin, a full line's phase kept at the
// working coin's w while a lone love takes the fine coin. The identity at fine = 1
// `bag` (E-SPN-0109, with `fine`): the string sets the coin. A dock holding a love takes the heavy coin w where the
// string's flux on its two links says so (code/rule/fine-coin bagHeavy, read by bagPositions), the fine coin zeta
// otherwise. The flux is c + Q(l), so the cut trit c is carried whenever the bag is on, with or without the cost. The
// coin reads the positions and c before the stream, which the coin keeps, so the inverse reads them again after the
// stream is undone. The identity at fine = 1
export type BoundOptions = { readonly cost: boolean; readonly sign: boolean; readonly meeting?: Meeting; readonly slant?: boolean; readonly fine?: number; readonly fullDock?: boolean; readonly bag?: Bag }

// the line the pieces read: its docks in stream order, its two slots, each dock's position
export type BoundLine = { readonly docks: readonly number[]; readonly first: number; readonly second: number; readonly position: ReadonlyMap<number, number> }

export type LineLove = { x: number; j: number }

// the open vibes of a branch as loves on the line (j 0 the first slot, which streams forward); refuses one off the line
export function lineLoves(line: BoundLine, br: Branch): LineLove[] {
  const out: LineLove[] = []

  for (let i = 0; i < br.vibe.length; i++) {
    if (br.vibe[i] === 0 || br.open[i] !== 1) continue

    const x = line.position.get(Math.floor(i / 24))
    const d = i % 24

    if (x === undefined || (d !== line.first && d !== line.second)) throw new Error('bound-line-pieces: an open vibe off the line; the pieces are written for the line block only')
    if (br.vibe[i] !== 1) throw new Error('bound-line-pieces: an open fear on the line; the line block is written for loves')
    out.push({ x, j: d === line.first ? 0 : 1 })
  }

  return out
}

// the links holding nonzero flux: link l (position l to l + 1) holds c + Q(l) mod 3
export function fluxLinks(L: number, loves: readonly LineLove[], c: number): number {
  const q = new Int32Array(L)

  for (const t of loves) q[t.x]!++

  let Q = 0
  let n = 0

  for (let l = 0; l < L; l++) {
    Q += q[l] as number
    if ((((c + Q) % 3) + 3) % 3 !== 0) n++
  }

  return n
}

// THE BAG'S HEAVY POSITIONS (E-SPN-0109): the occupied positions whose two links (l = x - 1 and l = x, ring order) carry
// the flux that `bag` names, link l holding c + Q(l) mod 3 as in fluxLinks. A function of the positions and c only, so
// the coin, which keeps both, reads the same set before and after it acts
export function bagPositions(L: number, loves: readonly { x: number }[], c: number, bag: Bag): Set<number> {
  const q = new Int32Array(L)

  for (const t of loves) q[t.x]!++

  const flux = new Uint8Array(L)
  let Q = 0

  for (let l = 0; l < L; l++) {
    Q += q[l] as number
    flux[l] = (((c + Q) % 3) + 3) % 3 !== 0 ? 1 : 0
  }

  const out = new Set<number>()

  for (let x = 0; x < L; x++) if ((q[x] as number) > 0 && bagHeavy(bag, flux[(x - 1 + L) % L] === 1, flux[x] === 1)) out.add(x)

  return out
}

// THE SLANT COST (E-SPN-0106). The loves' docks cut the ring into gaps; every link of one gap holds the same trit
// c + Q(l). A gap's world sheet over one beat is bounded by its two end docks' steps. When each end dock holds ONE love
// and the two carry the same coined label, the whole gap is taken one position along at the light speed: its links are
// not charged that beat (the proposal that a string is priced per unit of its own proper time, and a segment moving at
// the stream's speed has none). Every other costly link is charged as before. Read on the coined labels, so it is a
// phase diagonal in the coined configuration and the cut trit: unitary, and undone by the same phase read on the same
// coined configuration in the inverse. The vacuum has no open love, holds every trit 0, and pays nothing.
// Positions are ring positions 0 .. L - 1; a single occupied dock makes one gap of L links, whose two ends are the same
// dock (co-moving iff it holds one love).
export function slantLinks(L: number, loves: readonly LineLove[], c: number): number {
  const q = new Int32Array(L)
  const lab = new Int32Array(L)

  for (const t of loves) {
    q[t.x]!++
    lab[t.x] = t.j
  }

  const occupied: number[] = []

  for (let x = 0; x < L; x++) if ((q[x] as number) > 0) occupied.push(x)
  if (occupied.length === 0) return 0

  // Q(l) for each link, as in fluxLinks
  const flux = new Int32Array(L)
  let Q = 0

  for (let l = 0; l < L; l++) {
    Q += q[l] as number
    flux[l] = (((c + Q) % 3) + 3) % 3
  }

  let n = 0

  occupied.forEach((a, i) => {
    const b = occupied[(i + 1) % occupied.length] as number
    const size = (((b - a) % L) + L) % L || L
    const comove = q[a] === 1 && q[b] === 1 && lab[a] === lab[b]

    if (comove) return
    // the gap's links a, a + 1, .. b - 1 (mod L)
    for (let s = 0; s < size; s++) if (flux[(a + s) % L] !== 0) n++
  })

  return n
}

// the change of c when the coined loves stream: a love leaving position L - 1 forward, or 0 back, crosses the cut
export function cutCrossing(L: number, loves: readonly LineLove[]): number {
  let d = 0

  for (const t of loves) {
    if (t.j === 0 && t.x === L - 1) d--
    if (t.j === 1 && t.x === 0) d++
  }

  return d
}

// the line block's order: position, and at one dock the back slot (label 1) first
const lineKey = (x: number, j: number): number => 2 * x + (j === 0 ? 1 : 0)

// the parity of the reordering the stream gives the coined loves (first slot one position forward, second one back)
export function lineSign(L: number, loves: readonly LineLove[]): number {
  const before = loves.map(t => lineKey(t.x, t.j))
  const after = loves.map(t => lineKey((((t.x + (t.j === 0 ? 1 : -1)) % L) + L) % L, t.j))
  let inversions = 0

  for (let p = 0; p < loves.length; p++) for (let q = p + 1; q < loves.length; q++) if (((before[p] as number) - (before[q] as number)) * ((after[p] as number) - (after[q] as number)) < 0) inversions++

  return inversions % 2 === 0 ? 1 : -1
}

// the state: one slice of branches per clock count e (mod 14) and cut trit c (mod 3), and with the fine coin its count u
// (mod fine, carried), the slice then naming its `fine` so a reading knows the count's phase e^(2 pi i u/(3 fine))
export type BoundState = Map<string, { e: number; c: number; u?: number; fine?: number; branches: Branch[] }>

const sliceKey = (e: number, c: number, u = 0): string => (u === 0 ? `${e},${c}` : `${e},${c},${u}`)
const mod = (a: number, m: number): number => ((a % m) + m) % m

type Group = { e: number; c: number; u: number; list: Branch[] }

function put(out: Map<string, Group>, e: number, c: number, b: Branch, u = 0): void {
  const k = sliceKey(e, c, u)
  const o = out.get(k)

  if (o) o.list.push(b)
  else out.set(k, { e, c, u, list: [b] })
}

// whether the cut trit is carried: by the cost, or by the bag that reads the flux
const carriesTrit = (options: BoundOptions): boolean => options.cost || options.bag !== undefined

// the cells whose coin is heavy under the bag (none without one), read from the loves' positions and c
function heavyCells(options: BoundOptions, line: BoundLine, loves: readonly LineLove[], c: number): ReadonlySet<number> | undefined {
  if (options.bag === undefined) return undefined
  if (options.fine === undefined) throw new Error('bound-line-pieces: the bag chooses between the fine coin and w; it needs `fine`')

  return new Set([...bagPositions(line.docks.length, loves, c, options.bag)].map(x => line.docks[x] as number))
}

// the coin the options name, on one branch at count u (forward or adjoint)
function coinAt(options: BoundOptions, cells: number, br: Branch, u: number, adjoint: boolean, heavy?: ReadonlySet<number>): { b: Branch; u: number }[] {
  return options.fine === undefined ? coinBranch(cells, br, adjoint).map(b => ({ b, u })) : fineCoinBranch(cells, br, u, options.fine, adjoint, options.fullDock === true, heavy)
}

function sliced(options: BoundOptions, acc: Map<string, Group>): BoundState {
  const out: BoundState = new Map()

  for (const [k, g] of acc) {
    const branches = mergeBranches(g.list)

    if (branches.length === 0) continue
    out.set(k, options.fine === undefined ? { e: g.e, c: g.c, branches } : { e: g.e, c: g.c, u: g.u, fine: options.fine, branches })
  }

  return out
}

export function boundStart(s: LockedState): BoundState {
  return new Map([[sliceKey(0, 0), { e: 0, c: 0, branches: s.branches }]])
}

const clone = (b: Branch): Branch => ({ vibe: Int8Array.from(b.vibe), point: Int8Array.from(b.point), open: Uint8Array.from(b.open), store: Int8Array.from(b.store), spoint: Int8Array.from(b.spoint), sopen: Uint8Array.from(b.sopen), a: b.a, b: b.b, k: b.k })

// one beat, `chunk` branches at a time (the beat is linear, so this is the beat on all at once)
export function boundBeat(options: BoundOptions, t: LockedTables, line: BoundLine, s: BoundState, beat: number, chunk = 16, tally?: LockedTally): BoundState {
  const L = line.docks.length
  const acc = new Map<string, Group>()

  for (const { e, c, u = 0, branches } of s.values()) {
    for (let i = 0; i < branches.length; i += chunk) {
      const groups = new Map<string, Group>()

      for (const br of branches.slice(i, i + chunk)) {
        const before = lineLoves(line, br)
        const e0 = options.cost && !options.slant ? mod(e - fluxLinks(L, before, c), CLOCK) : e

        for (const { b, u: u1 } of coinAt(options, t.cells, clone(br), u, false, heavyCells(options, line, before, c))) {
          const loves = lineLoves(line, b)
          const e1 = options.cost && options.slant ? mod(e0 - slantLinks(L, loves, c), CLOCK) : e0

          if (options.sign && lineSign(L, loves) < 0) {
            b.a = -b.a
            b.b = -b.b
          }

          put(groups, e1, carriesTrit(options) ? mod(c + cutCrossing(L, loves), 3) : c, b, u1)
        }
      }

      for (const g of groups.values()) {
        const merged = { branches: mergeBranches(g.list) }
        const next = options.meeting === undefined || options.meeting === 'split' ? vetoBeat('none', t, merged, beat, tally) : meetingBeat(options.meeting, 'none', t, merged, beat, tally)

        for (const b of next.branches) put(acc, g.e, g.c, b, g.u)
      }
    }
  }

  return sliced(options, acc)
}

export function boundBeatBack(options: BoundOptions, t: LockedTables, line: BoundLine, s: BoundState, beat: number, chunk = 16): BoundState {
  const L = line.docks.length
  const acc = new Map<string, Group>()

  for (const { e, c, u = 0, branches } of s.values()) {
    for (let i = 0; i < branches.length; i += chunk) {
      const part = { branches: branches.slice(i, i + chunk) }
      const back = options.meeting === undefined || options.meeting === 'split' ? vetoBeatBack('none', t, part, beat) : meetingBeatBack(options.meeting, 'none', t, part, beat)

      for (const b of back.branches) {
        const loves = lineLoves(line, b)
        const c0 = carriesTrit(options) ? mod(c - cutCrossing(L, loves), 3) : c

        if (options.sign && lineSign(L, loves) < 0) {
          b.a = -b.a
          b.b = -b.b
        }

        const eb = options.cost && options.slant ? mod(e + slantLinks(L, loves, c0), CLOCK) : e

        for (const { b: v, u: u0 } of coinAt(options, t.cells, clone(b), u, true, heavyCells(options, line, loves, c0))) put(acc, options.cost && !options.slant ? mod(eb + fluxLinks(L, lineLoves(line, v), c0), CLOCK) : eb, c0, v, u0)
      }
    }
  }

  return sliced(options, acc)
}
