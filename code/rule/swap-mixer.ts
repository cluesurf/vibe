// THE SWAP COIN AND THE RING MIXER, AS A RULE BRANCH (E-SPN-0145). E-SPN-0143 found, in a one-body float model, that the
// fine coin at zeta = -1 (the line swap X, n = 2/3) with the dock-wide fermionic mixer at an angle e^(i theta) in
// Z[w][1/42] gives every one-body excitation of the love sea one top speed c / 2. That model was never read off a rule:
// code/rule/coined-locked-knit coinBranch carries only n = 1 (zeta = w) and code/measure/dock-mixer dockMixBranch only
// theta = 2 pi / 3 (in Z[w][1/6]). This file adds the two pieces, beside the old ones, without touching them: every
// existing experiment runs the rule it ran before.
//
// THE SWAP COIN. On every line of every dock C = X: a line holding one OPEN vibe takes it to the line's other slot of
// the same dock with amplitude (1 - zeta) / 2 = 1 and keeps it with (1 + zeta) / 2 = 0; a line holding two open vibes
// takes its determinant det X = -1; a closed vibe or an empty line is untouched. Integer entries, no split: a branch
// stays one branch. X is real, symmetric and an involution, so the piece is its own adjoint and its own inverse.
//
// THE RING MIXER. On one dock M = 1 + (u - 1) N_U, N_U = (1/24) sum_(i, j) c_i^dag c_j over the dock's 24 modes (the
// knit's mode order, code/rule/coined-locked-knit modeIndex), u = num / den a norm-one element of Z[w][1/den]. On n
// vibes of one content (value and point, all open) it keeps with 1 + (u - 1) n / 24 or takes ONE vibe to one empty
// slot with (u - 1) / 24 times the hop's fermion sign (hopSign); a full dock takes u (det m), an empty dock 1, a dock
// of two contents is left alone (E-SPN-0096's gate). Every entry times S = 24 den is an Eisenstein integer:
//     full dock   24 num          partial, keep   24 den + n (num - den)          hop   sign (num - den)
//     empty dock  24 den          two contents    24 den
// so every dock of every branch is multiplied by S (a global S^cells per call, the same on every branch), and the
// amplitudes stay in Z[w] over 2^k: nothing is rounded and nothing is dropped. The adjoint conjugates num.
//
// THE CHOSEN ANGLE (E-SPN-0143 U4b). 7 = N(3 + w) splits in Z[w]; u = w^j ((3 + w) / (3 + w^2))^k has norm one and
// denominator 7^k, and at k = 3 the unit nearest pi gives u* = -(360 + 37 w) / 343, theta* = pi + 0.093556: the
// singlet's rest energy m* = 0.046778 with R = tan(m*) / m* = 1.000730. S = 24 * 343 = 8,232 = 2^3 3 7^3, so the ring
// is Z[w][1/42].
//
// ONE BEAT (the order of E-SPN-0140, whose superposed run is the reference): the mixer, then the coin, then the working
// beat of code/rule/occupation-veto-knit (the meetings, the collision's pair move and contact, the stream), on the flat
// links the caller's tables carry. The inverse: the working beat's inverse, the coin, the adjoint mixer.
//
// DETERMINISM: no random number anywhere. EXACT: Eisenstein integers over a power of 2 and a stated global integer
// scale. NOTHING MOVES: the coin and the mixer hand a vibe's value, point and open bit to another slot of its own dock;
// the stream takes each slot's value one dock along.

import { hopSign, LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import { cloneConfiguration, times, type Branch, type Configuration, type LockedState, type LockedTables, type LockedTally } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { vetoBeat, vetoBeatBack, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { mergeBranches } from '@/code/rule/doublet-locked-knit'

// a norm-one Eisenstein number num / den, num = a + b w
export type RingUnit = { readonly num: readonly [bigint, bigint]; readonly den: bigint }

// E-SPN-0143's chosen angle: e^(i theta*) = -(360 + 37 w) / 343
export const SWAP_ANGLE: RingUnit = { num: [-360n, -37n], den: 343n }

// the per-dock scale of the ring mixer: every entry times 24 den is an Eisenstein integer
export const ringScale = (u: RingUnit): bigint => 24n * u.den

const conj = (x: readonly [bigint, bigint]): [bigint, bigint] => [x[0] - x[1], -x[1]]

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// the swap coin on one branch, in place (one branch in, one branch out)
export function swapCoinBranch(cells: number, br: Branch): Branch[] {
  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + (LINE_FIRSTS[l] as number)
      const j = base + (LINE_SECONDS[l] as number)
      const hi = br.vibe[i] !== 0
      const hj = br.vibe[j] !== 0

      if (hi && hj) {
        if (br.open[i] && br.open[j]) times(br, -1n, 0n)
        continue
      }

      const [from, to] = hi && br.open[i] ? [i, j] : hj && br.open[j] ? [j, i] : [-1, -1]

      if (from < 0) continue

      br.vibe[to] = br.vibe[from] as number
      br.point[to] = br.point[from] as number
      br.open[to] = br.open[from] as number
      br.vibe[from] = 0
      br.point[from] = 0
      br.open[from] = 0
    }
  }

  return [br]
}

// the slots of dock x holding a vibe (a mask), their count, and whether they are all open and of one value and point
export function dockHold(c: Configuration, x: number): { held: number; mask: number; oneContent: boolean } {
  let held = 0
  let mask = 0
  let oneContent = true
  let first = -1

  for (let d = 0; d < 24; d++) {
    const i = x * 24 + d

    if (c.vibe[i] === 0) continue
    held++
    mask |= 1 << d
    if (!c.open[i]) oneContent = false
    if (first < 0) first = i
    else if (c.vibe[i] !== c.vibe[first] || c.point[i] !== c.point[first]) oneContent = false
  }

  return { held, mask, oneContent }
}

function hop(b: Configuration, from: number, to: number): void {
  b.vibe[to] = b.vibe[from] as number
  b.point[to] = b.point[from] as number
  b.open[to] = b.open[from] as number
  b.vibe[from] = 0
  b.point[from] = 0
  b.open[from] = 0
}

// the ring mixer on one branch, every dock, each dock's piece times ringScale(u) (a global ringScale(u)^cells per call)
export function ringDockMixBranch(cells: number, br: Branch, u: RingUnit, adjoint: boolean, guard = 1 << 16): Branch[] {
  const num = adjoint ? conj(u.num) : ([u.num[0], u.num[1]] as [bigint, bigint])
  const S = ringScale(u)
  const hopU = num[0] - u.den
  const hopV = num[1]
  let branches: Branch[] = [br]

  for (let x = 0; x < cells; x++) {
    const next: Branch[] = []

    for (const b of branches) {
      const h = dockHold(b, x)
      const n = h.held

      if (n === 24) {
        times(b, 24n * num[0], 24n * num[1])
        next.push(b)
        continue
      }

      if (n === 0 || !h.oneContent) {
        times(b, S, 0n)
        next.push(b)
        continue
      }

      const N = BigInt(n)
      const keep = cloneBranch(b)

      times(keep, S + N * hopU, N * hopV)
      next.push(keep)

      for (let from = 0; from < 24; from++) {
        if (!((h.mask >> from) & 1)) continue

        for (let to = 0; to < 24; to++) {
          if ((h.mask >> to) & 1) continue

          const k = cloneBranch(b)
          const sign = BigInt(hopSign(k, x * 24, x * 24 + from, x * 24 + to))

          hop(k, x * 24 + from, x * 24 + to)
          times(k, sign * hopU, sign * hopV)
          next.push(k)
        }
      }
    }

    branches = next
    if (branches.length > guard) throw new Error(`swap-mixer: ${branches.length} branches, over the guard ${guard}`)
  }

  return branches
}

// one beat: the ring mixer, the swap coin, the working beat (kind the pair move's veto; 'none' for the love sea). The
// amplitudes carry the global factor ringScale(u)^cells of this beat
export function swapMixedBeat(kind: VetoKind, t: LockedTables, s: LockedState, beat: number, u: RingUnit = SWAP_ANGLE, tally?: LockedTally): LockedState {
  const mixed = mergeBranches(s.branches.flatMap(b => ringDockMixBranch(t.cells, cloneBranch(b), u, false)))
  const coined = mixed.flatMap(b => swapCoinBranch(t.cells, b))

  return vetoBeat(kind, t, { branches: mergeBranches(coined) }, beat, tally)
}

// its exact inverse: the working beat back, the coin, the adjoint mixer (the same global factor ringScale(u)^cells)
export function swapMixedBeatBack(kind: VetoKind, t: LockedTables, s: LockedState, beat: number, u: RingUnit = SWAP_ANGLE): LockedState {
  const back = vetoBeatBack(kind, t, s, beat).branches.flatMap(b => swapCoinBranch(t.cells, cloneBranch(b)))

  return { branches: mergeBranches(back.flatMap(b => ringDockMixBranch(t.cells, b, u, true))) }
}
