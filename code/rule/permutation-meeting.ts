// THE LIKE MEETING AS A PERMUTATION TIMES A PHASE (E-SPN-0104). The working rule's like meeting (code/rule/occupation-
// veto-knit meetBranch, derived in code/rule/doublet-locked-knit) is, on the two like vibes' points,
//     U = w P_sym + P_anti = (1 + w)/2 I - (1 - w)/2 SWAP     (equal points: w)
// so where two loves meet with unequal points it SPLITS the branch: keep with (1 + w)/2, exchange with -(1 - w)/2.
// E-SPN-0103 found that split is what still unbinds E-SPN-0093's cluster once the drift cost and the sign are in.
//
// THE FAMILY. Any meeting that keeps the occupation, commutes with every frame change g (x) g of the two points, and
// gives the equal-point phase w is U = a I + b SWAP (+ c on the equal-point diagonal, a function of the orbit of the
// point pair under the link group; that group, ASL(2, 3) of order 216 on the 9 points, is 2-transitive, so every
// unequal pair is one orbit and a, b are constants). Unitary iff a + b and a - b are units (the sym and anti channels).
// It is a permutation times a phase iff a = 0 or b = 0. With a + b = w that leaves exactly two:
//   'keep'      U = w I      every like meeting keeps both points and takes the phase w (the anti channel gets w
//                            where the split gives it 1)
//   'exchange'  U = w SWAP   every like meeting exchanges the two points and takes the phase w (the anti channel -w)
// Neither splits a branch, neither needs the 1/2: the ring of a meeting stays Z[w], and k never grows at a meeting.
//
// WHAT EACH KEEPS, exactly, and why (the proof, stated with the code that makes it so):
//   - unitary and reversible: one branch in, one branch out, a unit phase and a point permutation; the inverse takes
//     the conjugate phase w^2 and the same permutation (an involution), after the collision's inverse, as the working
//     rule's meeting does
//   - the vacuum untouched: the meeting reads only OPEN like pairs (the working rule's own test), and the vacuum's
//     vibes are closed, so on a branch with no open vibe this beat is the working rule's beat bit for bit
//   - a lone love's front: a lone love never meets, so its beat is the working rule's bit for bit
//   - the line law (E-SPN-0098) and the light cone: the meeting moves no vibe and changes no vibe trit, so every mesh
//     line's tone and every support is the working rule's
//   - covariance: I and SWAP each commute with g (x) g for every frame change, and the meeting treats every line alike,
//     so the W(F4) covariance of the working meeting (the same test on the same lines) holds unchanged
//
// NOTHING MOVES: a phase and, for 'exchange', the two points each vibe carries swapped in place.

import {
  cloneConfiguration,
  mergeBranches,
  streamConfiguration,
  times,
  type Branch,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import {
  collideVeto,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

export type Meeting = 'split' | 'keep' | 'exchange'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)

// the phase w, and its conjugate w^2 = -1 - w for the inverse beat
const PHASE: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

const cloneBranch = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

// the like meetings of one term, as a permutation times a phase (in place: one branch in, one out)
export function permutationMeet(
  meeting: 'keep' | 'exchange',
  br: Branch,
  cells: number,
  adjoint: boolean,
  tally?: LockedTally,
): Branch {
  const [u, v] = PHASE[adjoint ? 1 : 0]!

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + LINE_SECONDS[l]!
      const vi = br.vibe[i]!

      if (vi === 0 || br.vibe[j] === 0 || !br.open[i] || !br.open[j]) {
        continue
      }

      if (vi !== br.vibe[j]) {
        if (tally) {
          tally.unlikeMeetings++
        }

        continue
      }

      if (tally) {
        tally.likeMeetings++
      }

      if (br.point[i] !== br.point[j] && meeting === 'exchange') {
        const p = br.point[i]!

        br.point[i] = br.point[j]!
        br.point[j] = p
      }

      times(br, u, v)

      if (tally) {
        tally.phaseMeetings++
      }
    }
  }

  return br
}

// one beat of the superposed state with the permutation meeting (the working rule's beat with meetBranch replaced)
export function meetingBeat(
  meeting: 'keep' | 'exchange',
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  tally?: LockedTally,
): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    const b = permutationMeet(
      meeting,
      cloneBranch(br),
      t.cells,
      false,
      tally,
    )

    collideVeto(kind, t, b, beat, false, tally)
    streamConfiguration(t, b, false)
    next.push(b)
  }

  return { branches: mergeBranches(next, tally) }
}

export function meetingBeatBack(
  meeting: 'keep' | 'exchange',
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    const b = cloneBranch(br)

    streamConfiguration(t, b, true)
    collideVeto(kind, t, b, beat, true)
    next.push(permutationMeet(meeting, b, t.cells, true))
  }

  return { branches: mergeBranches(next) }
}
