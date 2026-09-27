// The color law made a state-keeping law, and the theorem that says what it had to give up.
//
// THE DEFECT (reported by E-QTM-0120 and 0121). Under the color law of code/rule/fear-weave (the singlet phase
// where a love meets a fear, the swap phase where like vibes meet, a fear's conjugate role stored at the
// reflected point (a, b) -> (a, -b)), 299 of 2,016 sampled two-role wholes were not quantum states, and
// one-role marginals reached -0.41, below the -1/3 floor of any qutrit state.
//
// THE CAUSE (probe tmp/probe-color-cause.ts, before this file). The kernels read each coordinate in the frame
// of the sign its token carries at the meeting. A token's vibe changes sign between its meetings (the line
// table turns a love into a fear and back) while its stored point stays where it is. Read in the new frame,
// the role has been reflected: a partial conjugation of one coordinate of an entangled whole, which is a
// partial transpose and not a physical map. Every non-state sat in a run where a token had flipped (306 of
// 306 in the probe's reading, 0 without a flip).
//
// THE THEOREM (checked here exhaustively). No color law can keep all three of:
//   (i) covariance: the change a flip makes to a stored point commutes with every link's grid move (so the
//       law does not depend on the frame a dock is read in),
//  (ii) locality: a flip acts on the flipped token's role alone,
// (iii) states stay states on entangled wholes.
// By (i) and (ii) the flip is a permutation of the 9 points in the centralizer of the 216 grid moves, and that
// centralizer is the identity alone (the moves are 2-transitive). The identity on the stored point is, on the
// role, the reflection R: (a, b) -> (a, -b). R has determinant -1, so it is no grid move and no Clifford
// unitary implements it (E-QTM-0117: the Clifford actions are exactly the 216 of determinant 1); it is
// complex conjugation, antiunitary, and on one half of the maximally entangled pair it gives an operator with
// eigenvalue -1/3 (Peres). So (iii) fails for the old law, and any law keeping (iii) breaks (i) at a flip.
//
// THE FIX (fear-weave advanceWhole, frames). The whole carries each coordinate's frame. Before a meeting, a
// coordinate whose token now has the other sign is rewritten in the new frame (reflected, the role unchanged),
// and the backward beat restores the frames from a per-coordinate trail. It keeps (ii) and (iii) and gives up
// (i) at a flip: the flip is the fixed map R on the stored point, which commutes with only a few moves.
//
// Measured, on E-QTM-0119's histories (dock 0 of the side-3 color weave, the vacuum and a golden-ratio Weyl
// matter background, 480 beats, every meeting pair, starts |0>|1>, Strange x |0>, Strange x Strange), EVERY
// beat, the physical whole (each fear-frame coordinate reflected back, physicalWhole) diagonalized:
// - with frames (the fix): how many wholes are not states, and the deepest one-role marginal
// - without (the old law, the control): the same, read in the frame of each token's last sign, and whether
//   every non-state is in a run where a token flipped
// - reversal: 200 beats forward and back with fearBeat and fearBeatBack on a vacuum pair and a matter pair,
//   color law with frames, grain mode; the start is restored up to its units, frames back to unset
//
// Gates, fixed before the first run:
// G1 the centralizer of the 216 grid moves in the 9! permutations of the points is the identity alone
// G2 R is none of the 216 moves, det R = -1 mod 3, and R on one half of the maximally entangled pair gives a
//    least eigenvalue -1/3 (to 1e-9), R on both halves a state
// G3 with frames: 0 wholes that are not states (least eigenvalue below -1e-9), every one-role marginal at or
//    above -1/3 - 1e-9
// G4 without: at least one non-state, and 0 non-states in runs where no token flipped
// G5 with frames the reversal restores both starts exactly (up to units) with every frame unset
//
// Depth L2: a theorem checked by enumeration, and the law measured on the knit's own histories.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  CONJUGATE_POINT,
  fearBeat,
  fearBeatBack,
  fearKernels,
  makeLattice,
  phaseMove,
  physicalWhole,
  wholeUnits,
  type BeatRecord,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  vacuumBackground,
  weylBackground,
  type Background,
  type RoleState,
} from '@/code/measure/knit-magic'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { hermitianSpectrum, operatorFromWigner } from '@/code/measure/qutrit-clifford'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const REVERSAL_BEATS = 200
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

const floatOf = (w: Whole): number[] => {
  const units = Number(wholeUnits(w))

  return w.weight.map(x => Number(x) / units)
}

// the whole read with the listed coordinates reflected
function reflected(w: Whole, reflectA: boolean, reflectB: boolean): number[] {
  const f = floatOf(w)
  const out = new Array<number>(81).fill(0)

  f.forEach((x, i) => {
    const a = reflectA ? (CONJUGATE_POINT[Math.floor(i / 9)] ?? 0) : Math.floor(i / 9)
    const b = reflectB ? (CONJUGATE_POINT[i % 9] ?? 0) : i % 9

    out[a * 9 + b] = x
  })

  return out
}

function deepestMarginal(w: readonly number[]): number {
  let deepest = 0

  for (let x = 0; x < 9; x++) {
    let m1 = 0
    let m2 = 0

    for (let y = 0; y < 9; y++) {
      m1 += w[x * 9 + y] ?? 0
      m2 += w[y * 9 + x] ?? 0
    }

    deepest = Math.min(deepest, m1, m2)
  }

  return deepest
}

// every permutation of 0..8 in lexicographic order, visited without storing them
function forEachPermutation(visit: (p: readonly number[]) => void): void {
  const p = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  for (;;) {
    visit(p)

    let i = 7

    while (i >= 0 && (p[i] ?? 0) > (p[i + 1] ?? 0)) i--

    if (i < 0) return

    let j = 8

    while ((p[j] ?? 0) < (p[i] ?? 0)) j--
    ;[p[i], p[j]] = [p[j] ?? 0, p[i] ?? 0]

    for (let l = i + 1, r = 8; l < r; l++, r--) {
      ;[p[l], p[r]] = [p[r] ?? 0, p[l] ?? 0]
    }
  }
}

export default experiment({
  id: 'quantum/color-law-keeps-states',
  code: 'E-QTM-0123',
  title:
    'the color law keeps quantum states once each coordinate carries its frame: a token\'s vibe can change sign between meetings, and leaving its stored point in place was a partial conjugation, which made 299 of 2,016 wholes non-states; no law can be at once covariant under the links, local to the flipped token and state-keeping, since the only covariant flip is the antiunitary reflection, so the fix keeps states and locality and gives up covariance at a flip',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: the centralizer of the grid moves
    const grid = gridMoves()
    const moves = grid.act.map(t => phaseMove(t))
    let centralizer = 0

    forEachPermutation(p => {
      for (const m of moves) {
        for (let q = 0; q < 9; q++) {
          if (p[m[q] ?? 0] !== m[p[q] ?? 0]) {
            return
          }
        }
      }

      centralizer++
    })

    // G2: R is not a move, its determinant, and what it does to the maximally entangled pair
    const key = (t: readonly number[]): string => t.join(',')
    const rIsMove = moves.filter(m => key(m) === key([...CONJUGATE_POINT])).length
    // R fixes (1, 0) and sends (0, 1) to (0, -1): the matrix diag(1, -1), determinant -1
    const rDeterminant = (((1 * -1 - 0 * 0) % 3) + 3) % 3
    const commutingWithR = moves.filter(m => m.every((x, q) => CONJUGATE_POINT[x] === m[CONJUGATE_POINT[q] ?? 0])).length
    const points2 = phasePointOperators(2)
    // the maximally entangled pair sum_j |j j> / sqrt 3, its Wigner function from the operators
    const phiRe = Array.from({ length: 9 }, (_, i) => (Math.floor(i / 3) === i % 3 ? 1 / Math.sqrt(3) : 0))
    const phiWeights = points2.map(a => {
      let v = 0

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          v += (phiRe[i] ?? 0) * (a.re[i * 9 + j] ?? 0) * (phiRe[j] ?? 0)
        }
      }

      return v / 9
    })
    const phiWhole = (reflectA: boolean, reflectB: boolean): number[] => {
      const out = new Array<number>(81).fill(0)

      phiWeights.forEach((x, i) => {
        const a = reflectA ? (CONJUGATE_POINT[Math.floor(i / 9)] ?? 0) : Math.floor(i / 9)
        const b = reflectB ? (CONJUGATE_POINT[i % 9] ?? 0) : i % 9

        out[a * 9 + b] = x
      })

      return out
    }
    const leastOf = (w: readonly number[]): number => hermitianSpectrum(operatorFromWigner([...w], points2))[0] ?? 0
    const phiLeast = leastOf(phiWhole(false, false))
    const phiPartialLeast = leastOf(phiWhole(false, true))
    const phiFullLeast = leastOf(phiWhole(true, true))

    // G3, G4: the knit
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA })!
    const tally = {
      on: { wholes: 0, nonStates: 0, deepest: 0, least: 0 },
      off: { wholes: 0, nonStates: 0, deepest: 0, least: 0, nonStatesWithoutFlip: 0, runsWithFlip: 0, runs: 0 },
    }

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: 2.11 })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: Array.from({ length: 24 }, (_, d) => d), beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)

        for (const start of STARTS) {
          for (const frames of [true, false]) {
            let whole: Whole = productWhole([a, b], start)
            const last = new Map<number, number>()
            let flipped = false

            mine.forEach(record => {
              record.meetings.forEach(([ta, tb], k) => {
                const [sa, sb] = record.signs?.[k] ?? [1, 1]

                for (const [tk, s] of [
                  [ta, sa],
                  [tb, sb],
                ] as const) {
                  flipped = flipped || (last.has(tk) && last.get(tk) !== s)
                  last.set(tk, s)
                }
              })

              whole = advanceWhole({ weave, whole, record, kernel4: [], color: colorOn, fixed: false, forward: true, frames })!

              const w = frames ? floatOf(physicalWhole(whole)) : reflected(whole, last.get(a) === -1, last.get(b) === -1)
              const least = leastOf(w)
              const t = frames ? tally.on : tally.off

              t.wholes++
              t.nonStates += least < -1e-9 ? 1 : 0
              t.least = Math.min(t.least, least)
              t.deepest = Math.min(t.deepest, deepestMarginal(w))

              if (!frames && least < -1e-9 && !flipped) {
                tally.off.nonStatesWithoutFlip++
              }
            })

            if (!frames) {
              tally.off.runs++
              tally.off.runsWithFlip += flipped ? 1 : 0
            }
          }
        }
      }
    }

    // G5: reversal with frames, grain mode, on a vacuum pair and a matter pair
    const colorBack = fearKernels({ like: -OMEGA, unlike: -OMEGA })!
    const reversal = (background: Background): { restored: boolean; framesUnset: boolean; flips: number; meetings: number } => {
      const records = classicalRecords({ weave, links: weave.links, background, open: Array.from({ length: 24 }, (_, d) => d), beats: REVERSAL_BEATS })
      const pairs = meetingPairs(records).sort((x, y) => y.meetings - x.meetings)
      const { a, b } = pairs[0] ?? { a: 0, b: 1 }
      const open = new Uint8Array(slots)

      open[a] = 1
      open[b] = 1

      let lattice = makeLattice(background)
      const whole0 = productWhole([a, b], ['strange', 'basis0'])
      let whole: Whole = whole0
      let meetings = 0
      let flips = 0
      const last = new Map<number, number>()
      const note = (record: BeatRecord): void => {
        record.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = record.signs?.[k] ?? [1, 1]

          meetings++

          for (const [tk, s] of [
            [ta, sa],
            [tb, sb],
          ] as const) {
            flips += last.has(tk) && last.get(tk) !== s ? 1 : 0
            last.set(tk, s)
          }
        })
      }

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: weave.links, lattice, open, t })

        lattice = r.lattice
        note(r.record)
        whole = advanceWhole({ weave, whole, record: r.record, kernel4: [], color: colorOn, fixed: false, forward: true })!
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: weave.links, lattice, open, t })

        lattice = r.lattice
        whole = advanceWhole({ weave, whole, record: r.record, kernel4: [], color: colorBack, fixed: false, forward: false })!
      }

      const u0 = wholeUnits(whole0)
      const u1 = wholeUnits(whole)
      const restored = whole.weight.every((w, i) => w * u0 === (whole0.weight[i] ?? 0n) * u1)
      const framesUnset = (whole.frame ?? []).every(f => f === 0) && (whole.trail ?? []).every(t => t.length === 0)

      return { restored, framesUnset, flips, meetings }
    }
    const vacuumReversal = reversal(vacuumBackground(slots))
    const matterReversal = reversal(weylBackground({ slots, scale: 2.11 }))

    const g1 = centralizer === 1
    const g2 = rIsMove === 0 && rDeterminant === 2 && Math.abs(phiPartialLeast + 1 / 3) < 1e-9 && phiFullLeast > -1e-9 && phiLeast > -1e-9
    const g3 = tally.on.nonStates === 0 && tally.on.deepest >= -1 / 3 - 1e-9
    const g4 = tally.off.nonStates > 0 && tally.off.nonStatesWithoutFlip === 0
    const g5 = [vacuumReversal, matterReversal].every(r => r.restored && r.framesUnset)
    const ok = g1 && g2 && g3 && g4 && g5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the only permutation of the 9 role points commuting with all 216 grid moves is the identity (${centralizer} of 9!), and the identity on a stored point is the reflection R on the role, determinant -1, no grid move, which takes one half of the maximally entangled pair to least eigenvalue ${phiPartialLeast.toFixed(6)}: no color law is covariant, local and state-keeping at once; with each coordinate's frame carried (a flip rewrites the point by R, covariant under ${commutingWithR} of 216 moves), ${tally.on.nonStates} of ${tally.on.wholes} two-role wholes on E-QTM-0119's histories are non-states and the deepest one-role marginal is ${tally.on.deepest.toFixed(6)}, where the old law leaves ${tally.off.nonStates} non-states, all in runs where a token flipped, and the frames reverse exactly`,
      metrics: {
        centralizerSize: centralizer,
        reflectionIsGridMove: rIsMove,
        reflectionDeterminantMod3: rDeterminant,
        movesCommutingWithReflection: commutingWithR,
        entangledLeastEigenvalue: phiLeast,
        entangledPartialReflectionLeast: phiPartialLeast,
        entangledFullReflectionLeast: phiFullLeast,
        framesWholes: tally.on.wholes,
        framesNonStates: tally.on.nonStates,
        framesLeastEigenvalue: tally.on.least,
        framesDeepestMarginal: tally.on.deepest,
        vacuumReversalRestored: vacuumReversal.restored ? 1 : 0,
        vacuumReversalFramesUnset: vacuumReversal.framesUnset ? 1 : 0,
        vacuumReversalMeetings: vacuumReversal.meetings,
        vacuumReversalFlips: vacuumReversal.flips,
        matterReversalRestored: matterReversal.restored ? 1 : 0,
        matterReversalFramesUnset: matterReversal.framesUnset ? 1 : 0,
        matterReversalMeetings: matterReversal.meetings,
        matterReversalFlips: matterReversal.flips,
      },
      control: {
        oldLawWholes: tally.off.wholes,
        oldLawNonStates: tally.off.nonStates,
        oldLawLeastEigenvalue: tally.off.least,
        oldLawDeepestMarginal: tally.off.deepest,
        oldLawNonStatesWithoutFlip: tally.off.nonStatesWithoutFlip,
        oldLawRuns: tally.off.runs,
        oldLawRunsWithFlip: tally.off.runsWithFlip,
      },
      notes:
        'L2. The theorem is exact and finite (9! permutations against the 216 moves, one 9 x 9 spectrum); the knit numbers are every beat of every run, not a sample. The 299 of 2,016 of E-QTM-0120 were every twentieth beat under the transposed grid convention; this file runs after E-QTM-0124 fixed it, so the old law\'s count here differs in the detail, not in kind. Why the fix and not another: a law that keeps states must act on a flipped token by a unitary, and the only freedom is WHICH frame the old role is rewritten in; keeping the role itself (the identity on the role, R on the stored point) is the one choice that needs no further structure, and it is not covariant because nothing can be. What it costs: a gauge (frame) mismatch test on a history with a flip now fails where one did before (E-QTM-0099\'s color-mode frame gate reads this; see its rerun). First run, 2026-09-26 (18 s): pass, gates unchanged. With frames 0 of 40,320 wholes are non-states (least eigenvalue -6e-16); the old law leaves 6,237 of 40,320, least eigenvalue -0.494, all 6,237 in the 36 of 84 runs where a token flipped. Read in each token\'s last-sign frame the old law\'s one-role marginals stay at -1/3 here; the -0.41 of E-QTM-0120 was read in the stored frame. The matter reversal crossed 4 flips and restored the start exactly.',
    })
  },
})
