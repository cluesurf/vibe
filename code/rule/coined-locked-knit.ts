// THE COINED LOCKED KNIT (E-SPN-0091): the doublet-locked knit (code/rule/doublet-locked-knit, unchanged) with one new
// piece, the covariant coin E-SPN-0090 found, and the fermion sign the coin makes visible.
//
// THE COIN. On every line of every dock, C = alpha P+ + beta P- on the doublet (e0, e1), P+- the projectors on
// e0 +- e1, with alpha = 1 and beta = w: 2C = (1 + w) I + (1 - w) X, the stand-in token's coin (E-SPN-0086, 0087), so no
// new number enters. E-SPN-0090: it commutes with W(F4)'s line stabilizer, the comoving frame, C and T, is exact in
// Z[w] over 2, and does not keep the lattice momentum (the one symmetry that forbids a mass). Acting on a
// configuration (the knit's state is a sum of configurations, each vibe on a slot with a point):
//   a line holding one OPEN vibe     keep (1 + w)/2, or copy the vibe (value, point, open) to the line's other slot
//                                    of the same dock with (1 - w)/2. The vibe stays on its line and its dock
//   a line holding two open vibes    the pair's determinant, det C = w, a phase (two fermions on the two slots of one
//                                    line: C (x) C on the antisymmetric pair); points unchanged
//   any line with a closed vibe      untouched (a closed vibe is classical bookkeeping; with no open vibe the coin is
//                                    the identity and the rule is the locked knit bit for bit)
//
// THE FERMION SIGN. The knit stores configurations with no sign on the stream: a vibe copied past another, or a full
// line bounced (its two vibes swap slots), picks up nothing. While positions are classical this is a global phase per
// history (every branch shares one occupation history, E-SPN-0088), so it never mattered. Once the coin superposes
// positions, histories that cross and histories that bounce interfere, and the sign decides the statistics. The
// canonical fermionic lift of a slot permutation (c_d -> c_(w d) on fermion modes) gives each configuration the parity
// of the permutation its occupied modes undergo, in one fixed order of modes. The order used: dock by dock, and in a
// dock line by line, first slot then second (so the coin's copy within a line passes no other mode and carries no
// sign). The meeting's exchange already carries its fermion sign (code/rule/doublet-locked-knit). With `fermion: false`
// the rule is the knit's literal configuration code plus the coin (called 'native' in E-SPN-0091), whose vibes then
// exchange as hard-core bosons.
//
// The fermion sign is computed for love-only and fear-only configurations with no store (the only ones E-SPN-0091
// runs with the sign on). A dock whose collision makes or unmakes a pair would need the store's sign convention, which
// is not written; the code refuses rather than guess.
//
// ONE BEAT t: the coin, then the locked knit's beat (meetings, collision, stream), with the fermion sign of the
// collision and stream of each branch. The inverse: the locked knit's inverse beat, the same sign, the adjoint coin.
//
// NOTHING MOVES: the coin copies a vibe to the other slot of its own line on its own dock, the stream copies each
// slot's value one dock along; a link holds nothing. Exact in Z[w][1/2]; no float, no rounding, no random number.

import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { lockedBeat, lockedBeatBack, mergeBranches, times, type Branch, type LockedState, type LockedTables, type LockedTally } from '@/code/rule/doublet-locked-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type CoinOptions = { readonly fermion: boolean }

// the coin's coefficients over 2 (forward, adjoint): keep (1 + w), adjoint -w; cross (1 - w), adjoint 2 + w; the
// full line's det w (exact, no scale), adjoint w^2 = -1 - w
const KEEP: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]
const CROSS: readonly [bigint, bigint][] = [
  [1n, -1n],
  [2n, 1n],
]
const DET: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

const cloneBranch = (b: Branch): Branch => ({
  vibe: Int8Array.from(b.vibe),
  point: Int8Array.from(b.point),
  open: Uint8Array.from(b.open),
  store: Int8Array.from(b.store),
  spoint: Int8Array.from(b.spoint),
  sopen: Uint8Array.from(b.sopen),
  a: b.a,
  b: b.b,
  k: b.k,
})

export type CoinTally = { splits: number; determinants: number }

export const newCoinTally = (): CoinTally => ({ splits: 0, determinants: 0 })

// the coin on one branch: the list of branches it becomes
export function coinBranch(cells: number, br: Branch, adjoint: boolean, tally?: CoinTally): Branch[] {
  const side = adjoint ? 1 : 0
  const halves: { from: number; to: number }[] = []

  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + (LINE_FIRSTS[l] as number)
      const j = base + (LINE_SECONDS[l] as number)
      const hi = br.vibe[i] !== 0
      const hj = br.vibe[j] !== 0

      if (hi && hj) {
        if (br.open[i] && br.open[j]) {
          const [u, v] = DET[side] as [bigint, bigint]

          times(br, u, v)
          if (tally) tally.determinants++
        }

        continue
      }

      if (hi && br.open[i]) halves.push({ from: i, to: j })
      else if (hj && br.open[j]) halves.push({ from: j, to: i })
    }
  }

  if (halves.length === 0) return [br]
  if (halves.length > 20) throw new Error(`coined-locked-knit: ${halves.length} half-full open lines in one branch, over the guard 20`)
  if (tally) tally.splits += halves.length

  const [ku, kv] = KEEP[side] as [bigint, bigint]
  const [cu, cv] = CROSS[side] as [bigint, bigint]
  const out: Branch[] = []

  for (let mask = 0; mask < 1 << halves.length; mask++) {
    const b = cloneBranch(br)

    halves.forEach((h, n) => {
      if ((mask >> n) & 1) {
        b.vibe[h.to] = b.vibe[h.from] as number
        b.point[h.to] = b.point[h.from] as number
        b.open[h.to] = b.open[h.from] as number
        b.vibe[h.from] = 0
        b.point[h.from] = 0
        b.open[h.from] = 0
        times(b, cu, cv)
      } else times(b, ku, kv)
    })

    b.k += halves.length
    out.push(b)
  }

  return out
}

// the order of fermion modes: dock-major, and in a dock line by line, the first slot before the second
export function modeIndex(slot: number): number {
  const d = slot % 24

  return (slot - d) + 2 * (LINE_OF[d] as number) + (SIDE[d] === 1 ? 0 : 1)
}

const PERM = new Int32Array(24)
const VIBE = new Int8Array(24)

// the parity (+1 or -1) of the permutation the collision and stream of beat t give the occupied modes of a
// configuration (its occupation, which the meeting keeps)
export function fermionSign(t: LockedTables, br: Branch): number {
  for (let s = 0; s < br.store.length; s++) if (br.store[s] !== 0) throw new Error('coined-locked-knit: the fermion sign is not written for a configuration holding a store')

  const from: number[] = []
  const to: number[] = []
  let kindSeen = 0

  for (let x = 0; x < t.cells; x++) {
    const base = x * 24
    let held = 0

    for (let d = 0; d < 24; d++) {
      const v = br.vibe[base + d] as number

      VIBE[d] = v
      if (v !== 0) {
        held++
        if (kindSeen === 0) kindSeen = v
        else if (v !== kindSeen) throw new Error('coined-locked-knit: the fermion sign is not written for a configuration holding loves and fears')
      }
    }

    if (held === 0) continue

    const kind = bouncePermutation(BOUNCE_TABLE, t.collision, VIBE, 0, PERM)

    for (let d = 0; d < 24; d++) {
      if (VIBE[d] === 0) continue

      const after = kind === 0 ? d : (PERM[d] as number)

      from.push(modeIndex(base + d))
      to.push(modeIndex(t.target[base + after] as number))
    }
  }

  // parity of the sequence `to` read in the order of `from`
  const order = from.map((_, i) => i).sort((p, q) => (from[p] as number) - (from[q] as number))
  const seq = order.map(i => to[i] as number)
  let inversions = 0

  for (let p = 0; p < seq.length; p++) for (let q = p + 1; q < seq.length; q++) if ((seq[p] as number) > (seq[q] as number)) inversions++

  return inversions % 2 === 0 ? 1 : -1
}

function signed(t: LockedTables, s: LockedState): LockedState {
  for (const b of s.branches) {
    if (fermionSign(t, b) < 0) {
      b.a = -b.a
      b.b = -b.b
    }
  }

  return s
}

export function coinedBeat(t: LockedTables, s: LockedState, beat: number, options: CoinOptions, tally?: LockedTally, coinTally?: CoinTally): LockedState {
  const coined: Branch[] = []

  for (const br of s.branches) coined.push(...coinBranch(t.cells, cloneBranch(br), false, coinTally))

  let mid: LockedState = { branches: mergeBranches(coined) }

  if (options.fermion) mid = signed(t, mid)

  return lockedBeat(t, mid, beat, tally)
}

export function coinedBeatBack(t: LockedTables, s: LockedState, beat: number, options: CoinOptions): LockedState {
  let back = lockedBeatBack(t, s, beat)

  if (options.fermion) back = signed(t, back)

  const out: Branch[] = []

  for (const br of back.branches) out.push(...coinBranch(t.cells, cloneBranch(br), true))

  return { branches: mergeBranches(out) }
}
