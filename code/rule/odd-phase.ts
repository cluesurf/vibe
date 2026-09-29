// THE ODD-OCTET PHASE, AS A RULE BRANCH (E-SPN-0148). A W(F4)-covariant dock piece beside the ring mixer: on one dock
// G8 = 1 + (v - 1) Pi8 on the 24 one-vibe modes, Pi8 the projector onto the 8-dimensional irreducible part of the
// line-odd sector (the X = -1 modes that are not linear in the root, a . r_d),
//     12 Pi8 = 6 (I - X) - R R^T      (integer: 4 on the diagonal, -4 on the line partner, -(r_d . r_e) elsewhere),
// v = num / den a norm-one element of Z[w][1/den]. Its second quantization is Pauli-blocked by construction: an empty
// dock takes 1, a full dock of one content det G8 = v^8, a lone vibe the matrix G8 (a hop carries no fermion sign).
// Docks of 2 to 23 vibes of one content take the 8-mode minors, which are NOT built here: the runs that use this piece
// visit only docks of 0, 1 and 24 vibes (and docks of two contents, which it leaves alone, as the ring mixer does), and a
// dock outside that set throws rather than being passed through.
//
// EXACT. Every dock of every branch is multiplied by S8 = 12 den^8 (a global S8^cells per call):
//     empty dock or two contents   12 den^8          full dock   12 num^8
//     one vibe, slot a to slot b   den^7 (12 den [a = b] + (num - den) (12 Pi8)_ba)
// so the amplitudes stay Eisenstein integers over 2^k. The adjoint conjugates num.
//
// ONE BEAT: the ring mixer, this piece, the swap coin, the working beat (code/rule/swap-mixer's order with the piece
// after the mixer; the two act on orthogonal modes, so on one vibe they commute). The inverse: the working beat back,
// the coin, the adjoint piece, the adjoint mixer.
//
// DETERMINISM: no random number. NOTHING MOVES: the piece hands a vibe's value, point and open bit to another slot of its
// own dock; the stream takes each slot's value one dock along.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  cloneConfiguration,
  mergeBranches,
  times,
  type Branch,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  vetoBeat,
  vetoBeatBack,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import {
  dockHold,
  ringDockMixBranch,
  swapCoinBranch,
  type RingUnit,
} from '@/code/rule/swap-mixer'

const ROOTS = rootsD4()

// 12 Pi8, row-major [to][from]
export const ODD_OCTET_12: readonly (readonly number[])[] = ROOTS.map(
  (r, i) =>
    ROOTS.map(
      (s, j) =>
        (i === j ? 6 : 0) -
        (OPPOSITE[i] === j ? 6 : 0) -
        r.reduce((t, x, k) => t + x * s[k]!, 0),
    ),
)

// the per-dock scale of the piece
export const oddScale = (v: RingUnit): bigint => 12n * v.den ** 8n

const conj = (x: readonly [bigint, bigint]): [bigint, bigint] => [
  x[0] - x[1],
  -x[1],
]

const cloneBranch = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

// the piece on one branch, every dock, each dock times oddScale(v)
export function oddPhaseBranch(
  cells: number,
  br: Branch,
  v: RingUnit,
  adjoint: boolean,
): Branch[] {
  const num = adjoint
    ? conj(v.num)
    : ([v.num[0], v.num[1]] as [bigint, bigint])
  const S = oddScale(v)
  const den7 = v.den ** 7n
  const hopU = num[0] - v.den
  const hopV = num[1]

  let branches: Branch[] = [br]

  for (let x = 0; x < cells; x++) {
    const next: Branch[] = []

    for (const b of branches) {
      const h = dockHold(b, x)

      if (h.held === 0 || !h.oneContent) {
        times(b, S, 0n)
        next.push(b)
        continue
      }

      if (h.held === 24) {
        for (let e = 0; e < 8; e++) {
          times(b, num[0], num[1])
        }

        times(b, 12n, 0n)
        next.push(b)
        continue
      }

      if (h.held !== 1) {
        throw new Error(
          `odd-phase: a dock of ${h.held} vibes of one content (only 0, 1 and 24 are built)`,
        )
      }

      const from = Math.log2(h.mask)

      for (let to = 0; to < 24; to++) {
        const q = BigInt((ODD_OCTET_12[to] as number[])[from]!)
        const re = to === from ? 12n * v.den + hopU * q : hopU * q
        const im = hopV * q

        if (re === 0n && im === 0n) {
          continue
        }

        const k = cloneBranch(b)

        if (to !== from) {
          const i = x * 24 + from
          const j = x * 24 + to

          k.vibe[j] = k.vibe[i]!
          k.point[j] = k.point[i]!
          k.open[j] = k.open[i]!
          k.vibe[i] = 0
          k.point[i] = 0
          k.open[i] = 0
        }

        times(k, den7 * re, den7 * im)
        next.push(k)
      }
    }

    branches = next
  }

  return branches
}

// one beat: the ring mixer (u), the odd-octet piece (v), the swap coin, the working beat. The amplitudes carry the global
// factor (ringScale(u) oddScale(v))^cells
export function oddPhasedBeat(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  u: RingUnit,
  v: RingUnit,
  tally?: LockedTally,
): LockedState {
  const mixed = mergeBranches(
    s.branches.flatMap(b =>
      ringDockMixBranch(t.cells, cloneBranch(b), u, false),
    ),
  )
  const odd = mergeBranches(
    mixed.flatMap(b => oddPhaseBranch(t.cells, b, v, false)),
  )
  const coined = odd.flatMap(b => swapCoinBranch(t.cells, b))

  return vetoBeat(
    kind,
    t,
    { branches: mergeBranches(coined) },
    beat,
    tally,
  )
}

// its exact inverse (the same global factor)
export function oddPhasedBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  u: RingUnit,
  v: RingUnit,
): LockedState {
  const back = vetoBeatBack(kind, t, s, beat).branches.flatMap(b =>
    swapCoinBranch(t.cells, cloneBranch(b)),
  )
  const odd = mergeBranches(
    back.flatMap(b => oddPhaseBranch(t.cells, b, v, true)),
  )

  return {
    branches: mergeBranches(
      odd.flatMap(b => ringDockMixBranch(t.cells, b, u, true)),
    ),
  }
}
