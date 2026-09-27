// No-cloning on the knit: can any sequence of the model's beats copy an unknown signed state, and what does
// the model's own copy (the stream) copy?
//
// Wootters and Zurek (1982), Dieks (1982): a unitary U with U |psi>|b> = |psi>|psi> for two states needs
// <psi|phi> = <psi|phi>^2, so the copied states are equal or orthogonal. In the model's terms: a whole is a
// signed integer weight on the joint phase points, and every beat is either a grid move (a permutation of the
// points) or a meeting kernel K with K^T K = D^2 1 (E-QTM-0137), since the phase-point operators are an
// orthogonal frame (Tr A(x) A(y) = 3^k delta). So every beat keeps the overlap count 3^k sum W1 W2 = Tr(rho1
// rho2) of any two wholes carried through the same record. A copier would send the overlap s to s^2, so no word
// of beats copies two inputs whose overlap is not 0 or 1: the proof is the invariant, checked here on every
// kernel the knit uses and on every beat of its histories.
//
// The model does copy, by construction: the stream copies values one dock along. E-QTM-0127 showed a link's
// flow update is SUM with the vibe as control. On the role grid SUM is the symplectic permutation
// (a1, b1), (a2, b2) -> (a1, b1 - b2), (a1 + a2, b2): it adds the ROLE coordinate a into the target and kicks
// the control's TILT b back. So it copies the classical trit (the role label) exactly, the three basis states
// |j>|0> -> |j>|j>, and nothing else. Copying the whole phase point, (u, 0) -> (u, u), would copy the signed
// weight pointwise, but that map scales the symplectic form by 2 = -1 mod 3, so no Clifford move and no state
// map does it: its image of a basis state puts weight 1/3 on single points, past the two-role floor of 1/9.
//
// Gates, fixed before the first run:
// G1 the invariant: the like kernel and its inverse (quarters), the color law's like and love-fear kernels, and
//    all 81 comoving translates of each, satisfy K^T K = D^2 1 exactly (0 failures of 324); on the knit
//    (committed color weave, vacuum and matter, dock 0, 480 beats, swap and color laws), two wholes started
//    differently and carried through one pair's record keep sum W1 W2 exactly at every beat (BigInt, 0 changes)
// G2 the cloning condition: over the 13 inputs (the 12 one-role stabilizer states and the Strange state), the
//    pairs whose overlap is neither 0 nor 1 are counted (exact rationals), and the largest pairwise-orthogonal
//    set has 3 members, so no unitary word copies more than 3 of them
// G3 the model's words: every two-role word K2 (1 x g) K1 with K1, K2 in {none, like meeting, love-fear
//    meeting} and g any of the 216 link moves, applied to input x blank for all 12 stabilizer blanks (23,328
//    words): 0 words copy two non-orthogonal inputs, and no word copies more than 3 inputs
// G4 the stream's copy: SUM's Wigner kernel is exactly the stated permutation (81 x 81, 0 mismatches), it
//    copies exactly the 3 basis inputs of the 13, and on the Strange input it keeps every joint fear while each
//    copy's own weights hold 0 fears
// G5 the control that must fail: the pointwise weight copy (u, 0) -> (u, u) changes the overlap (so G1's test
//    would catch it), gives a basis input a density with a negative eigenvalue, and breaks the form on some
//    pair of points
//
// Depth L2: a known theorem made exact in the model's integer weights and checked on its kernels, words and
// histories, with a control that fails.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  CONJUGATE_POINT,
  fearKernels,
  meetingKernel,
  phasePermOf,
  swapPhase,
  translatedOf,
  wholeKernel,
  wholeUnits,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  roleWeights,
  runWhole,
  vacuumBackground,
  weylBackground,
  type RoleState,
} from '@/code/measure/knit-magic'
import { marginalOf, permuteRole, phaseSpace, productWeights } from '@/code/measure/stabilizer-contexts'
import { hermitianSpectrum, operatorFromWigner } from '@/code/measure/qutrit-clifford'
import { operator, phasePointOperators } from '@/code/measure/grid-weights'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const MATTER_SCALE = 2.11
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
  ['basis1', 'basis0'],
]

// K^T K = D^2 1 on 81 points
function orthogonalUpTo(kernel: readonly (readonly number[])[], divisor: number): boolean {
  for (let i = 0; i < 81; i++) {
    for (let j = 0; j < 81; j++) {
      let s = 0

      for (let r = 0; r < 81; r++) {
        s += (kernel[r]?.[i] ?? 0) * (kernel[r]?.[j] ?? 0)
      }

      if (s !== (i === j ? divisor * divisor : 0)) {
        return false
      }
    }
  }

  return true
}

function applyKernel(kernel: readonly (readonly number[])[], v: Float64Array): Float64Array {
  const out = new Float64Array(81)

  for (let r = 0; r < 81; r++) {
    const row = kernel[r] ?? []
    let s = 0

    for (let c = 0; c < 81; c++) {
      const k = row[c] ?? 0

      if (k !== 0) {
        s += k * (v[c] ?? 0)
      }
    }

    out[r] = s
  }

  return out
}

// out proportional to target, exactly (integer-valued doubles)
function proportional(out: Float64Array, target: Float64Array): boolean {
  let no = 0
  let nt = 0

  for (let i = 0; i < 81; i++) {
    no += out[i] ?? 0
    nt += target[i] ?? 0
  }

  if (no === 0) {
    return false
  }

  for (let i = 0; i < 81; i++) {
    if ((out[i] ?? 0) * nt !== (target[i] ?? 0) * no) {
      return false
    }
  }

  return true
}

export default experiment({
  id: 'quantum/no-cloning-on-the-knit',
  code: 'E-QTM-0151',
  title:
    'no beat copies an unknown signed state: every kernel the knit uses is orthogonal up to its divisor and every link a permutation, so the overlap of two wholes is kept exactly on every beat of every history, and a copier would square it; none of 23,328 two-meeting words copies two non-orthogonal inputs, while the stream\'s own copy, SUM, copies the role trit of the 3 basis states and leaves each copy of a Strange role with 0 fears',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const moves = gridMoves()
    const perms = moves.act.map(g => phasePermOf(g))
    const two = phaseSpace(2)

    // G1 kernels
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kBack = meetingKernel(swapPhase(-OMEGA)) ?? []
    const color = fearKernels({ like: OMEGA, unlike: OMEGA })
    const bases: { kernel: readonly (readonly number[])[]; divisor: number }[] = [
      { kernel: kThird, divisor: 4 },
      { kernel: kBack, divisor: 4 },
      { kernel: color?.like ?? [], divisor: color?.likeDivisor ?? 1 },
      { kernel: color?.unlike ?? [], divisor: color?.unlikeDivisor ?? 1 },
    ]
    let kernelsChecked = 0
    let kernelFailures = 0

    for (const base of bases) {
      for (let pa = 0; pa < 9; pa++) {
        for (let pb = 0; pb < 9; pb++) {
          kernelsChecked++
          kernelFailures += orthogonalUpTo(translatedOf(base.kernel, pa, pb), base.divisor) ? 0 : 1
        }
      }
    }

    const movesPermute = perms.every(p => new Set(p).size === 9)

    // G1 on the knit: overlaps of two differently started wholes through one record
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    let beatsCompared = 0
    let overlapChanges = 0

    const overlap = (a: Whole, b: Whole): { num: bigint; den: bigint } => {
      let s = 0n

      a.weight.forEach((w, i) => {
        s += w * (b.weight[i] ?? 0n)
      })

      return { num: s, den: wholeUnits(a) * wholeUnits(b) }
    }

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: Array.from({ length: 24 }, (_, d) => d), beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)

        for (const law of [{ kernel4: kThird }, { kernel4: [] as number[][], color: color ?? undefined }]) {
          const runs = STARTS.map(start => {
            const w = productWhole([a, b], start)

            return [w, ...runWhole({ weave, start: w, records: mine, kernel4: law.kernel4, color: law.color }).map(s => s.whole)]
          })

          for (let i = 0; i < runs.length; i++) {
            for (let j = i + 1; j < runs.length; j++) {
              const first = overlap(runs[i]![0]!, runs[j]![0]!)

              for (let t = 1; t < (runs[i]?.length ?? 0); t++) {
                const now = overlap(runs[i]![t]!, runs[j]![t]!)

                beatsCompared++
                overlapChanges += now.num * first.den === first.num * now.den ? 0 : 1
              }
            }
          }
        }
      }
    }

    // G2 the 13 inputs and their overlaps
    const basis0 = roleWeights('basis0')
    const stabilizer: bigint[][] = []
    const seen = new Set<string>()

    for (const p of perms) {
      const image = permuteRole(basis0, 1, 0, p)
      const key = image.join(',')

      if (!seen.has(key)) {
        seen.add(key)
        stabilizer.push(image)
      }
    }

    const inputs = [...stabilizer, roleWeights('strange')]
    const units = (w: readonly bigint[]): bigint => w.reduce((a, b) => a + b, 0n)
    // 3 sum w1 w2 / (N1 N2), as a reduced fraction key
    const overlapOf = (x: readonly bigint[], y: readonly bigint[]): [bigint, bigint] => {
      let s = 0n

      x.forEach((w, i) => {
        s += w * (y[i] ?? 0n)
      })

      return [3n * s, units(x) * units(y)]
    }
    let nonTrivialPairs = 0
    const values = new Set<string>()
    const orthogonal: boolean[][] = inputs.map(() => inputs.map(() => false))

    for (let i = 0; i < inputs.length; i++) {
      for (let j = i + 1; j < inputs.length; j++) {
        const [num, den] = overlapOf(inputs[i]!, inputs[j]!)

        values.add(`${Number(num) / Number(den)}`)
        orthogonal[i]![j] = num === 0n
        orthogonal[j]![i] = num === 0n
        nonTrivialPairs += num !== 0n && num !== den ? 1 : 0
      }
    }

    // the largest pairwise-orthogonal set, by exhausting subsets of the 13
    let largestOrthogonalSet = 0

    for (let mask = 1; mask < 1 << inputs.length; mask++) {
      const members = inputs.map((_, i) => i).filter(i => (mask >> i) & 1)

      if (members.length <= largestOrthogonalSet) {
        continue
      }

      if (members.every((x, k) => members.slice(k + 1).every(y => orthogonal[x]![y]))) {
        largestOrthogonalSet = members.length
      }
    }

    // G3 the model's words, in the love frame: the love-fear kernel read in the physical frame
    const reflect = (i: number): number => Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)
    const unlikePhysical = color ? Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => color.unlike[reflect(r)]?.[reflect(c)] ?? 0)) : []
    const kernels: (readonly (readonly number[])[] | null)[] = [null, kThird, unlikePhysical]
    const asFloat = (w: readonly bigint[]): Float64Array => Float64Array.from(w, x => Number(x))
    const targets = inputs.map(x => asFloat(productWeights(x, x)))
    let words = 0
    let wordsCopyingNonOrthogonal = 0
    let mostCopied = 0
    let wordsCopyingThree = 0

    for (const blank of stabilizer) {
      for (const k1 of kernels) {
        const after1 = inputs.map(x => {
          const v = asFloat(productWeights(x, blank))

          return k1 ? applyKernel(k1, v) : v
        })

        for (const p of perms) {
          const moved = after1.map(v => {
            const out = new Float64Array(81)

            for (let i = 0; i < 81; i++) {
              out[9 * Math.floor(i / 9) + (p[i % 9] ?? 0)] = v[i] ?? 0
            }

            return out
          })

          for (const k2 of kernels) {
            words++

            const copied: number[] = []

            moved.forEach((v, i) => {
              const out = k2 ? applyKernel(k2, v) : v

              if (proportional(out, targets[i]!)) {
                copied.push(i)
              }
            })

            mostCopied = Math.max(mostCopied, copied.length)
            wordsCopyingThree += copied.length >= 3 ? 1 : 0

            if (copied.some((x, k) => copied.slice(k + 1).some(y => !orthogonal[x]![y]))) {
              wordsCopyingNonOrthogonal++
            }
          }
        }
      }
    }

    // G4 SUM, the stream's copy: |j, k> -> |j, j + k>
    const sum = operator(9)

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        sum.re[(3 * j + ((j + k) % 3)) * 9 + (3 * j + k)] = 1
      }
    }

    const sumKernel = wholeKernel(sum, 1)
    let sumMismatches = 0

    for (let c = 0; c < 81; c++) {
      const [a1, b1, a2, b2] = Array.from(two.trits[c] ?? [])
      const image = 9 * (3 * (a1 ?? 0) + (((b1 ?? 0) - (b2 ?? 0) + 3) % 3)) + 3 * (((a1 ?? 0) + (a2 ?? 0)) % 3) + (b2 ?? 0)

      for (let r = 0; r < 81; r++) {
        sumMismatches += (sumKernel?.kernel[r]?.[c] ?? 0) !== (r === image ? 1 : 0) ? 1 : 0
      }
    }

    let sumCopies = 0
    let strangeJointFears = 0n
    let strangeInputFears = 0n
    let strangeCopyFears = 0n

    inputs.forEach((x, i) => {
      const v = asFloat(productWeights(x, basis0))
      const out = sumKernel ? applyKernel(sumKernel.kernel, v) : v

      sumCopies += proportional(out, targets[i]!) ? 1 : 0

      if (i === inputs.length - 1) {
        const joint = Array.from(out, w => BigInt(w))

        strangeJointFears = joint.reduce((s, w) => s + (w < 0n ? -w : 0n), 0n)
        strangeInputFears = productWeights(x, basis0).reduce((s, w) => s + (w < 0n ? -w : 0n), 0n)

        for (const keep of [0, 1]) {
          strangeCopyFears += marginalOf(joint, 2, [keep]).reduce((s, w) => s + (w < 0n ? -w : 0n), 0n)
        }
      }
    })

    // G5 the pointwise weight copy
    const diagonal = (w: readonly bigint[]): bigint[] => {
      const out = new Array<bigint>(81).fill(0n)

      w.forEach((x, u) => {
        out[9 * u + u] = x
      })

      return out
    }
    const basis1 = roleWeights('basis1')
    const plus = stabilizer.find(w => overlapOf(w, basis0)[0] !== 0n && overlapOf(w, basis0)[0] !== overlapOf(w, basis0)[1]) ?? basis1
    const before = overlapOf(basis0, plus)
    let afterNum = 0n

    diagonal(basis0).forEach((w, i) => {
      afterNum += w * (diagonal(plus)[i] ?? 0n)
    })

    // two-role overlap is 9 sum w1 w2 / (N1 N2)
    const pointwiseChangesOverlap = 9n * afterNum * before[1] !== before[0] * units(basis0) * units(plus)
    const points2 = phasePointOperators(2)
    const copied0 = diagonal(basis0)
    const pointwiseMinEigen = hermitianSpectrum(operatorFromWigner(copied0.map(x => Number(x) / Number(units(copied0))), points2))[0] ?? 0
    let formBroken = 0

    for (let u = 0; u < 9; u++) {
      for (let v = 0; v < 9; v++) {
        const f1 = phaseSpace(1).form[u * 9 + v] ?? 0
        const f2 = two.form[(9 * u + u) * 81 + (9 * v + v)] ?? 0

        formBroken += f1 !== f2 ? 1 : 0
      }
    }

    const g1 = kernelFailures === 0 && kernelsChecked === 324 && movesPermute && overlapChanges === 0 && beatsCompared > 0
    const g2 = largestOrthogonalSet === 3 && nonTrivialPairs > 0
    const g3 = wordsCopyingNonOrthogonal === 0 && mostCopied <= 3 && words === 23328
    const g4 = sumMismatches === 0 && sumCopies === 3 && strangeJointFears === strangeInputFears && strangeInputFears > 0n && strangeCopyFears === 0n
    const g5 = pointwiseChangesOverlap && pointwiseMinEigen < -1e-9 && formBroken > 0

    return verdict({
      status: g1 && g2 && g3 && g4 && g5 ? 'pass' : 'fail',
      claim:
        'every kernel the knit uses is orthogonal up to its divisor and every link a permutation, so every beat keeps the overlap of two wholes exactly (0 changes on the knit\'s histories) and a copier, which squares it, cannot exist for two non-orthogonal inputs; no two-meeting word copies such a pair, while SUM, the stream\'s copy, copies the role trit of the 3 basis states only and leaves each copy of a Strange role with 0 fears; copying the phase point itself breaks the symplectic form and makes non-states',
      metrics: {
        gateInvariant: g1 ? 1 : 0,
        gateCloningCondition: g2 ? 1 : 0,
        gateWords: g3 ? 1 : 0,
        gateStreamCopy: g4 ? 1 : 0,
        gatePointwiseControl: g5 ? 1 : 0,
        kernelsChecked,
        kernelFailures,
        knitBeatsCompared: beatsCompared,
        knitOverlapChanges: overlapChanges,
        inputs: inputs.length,
        nonTrivialOverlapPairs: nonTrivialPairs,
        distinctOverlaps: values.size,
        largestOrthogonalSet,
        words,
        wordsCopyingNonOrthogonal,
        mostInputsCopiedByOneWord: mostCopied,
        wordsCopyingThree,
        sumKernelMismatches: sumMismatches,
        sumCopies,
        strangeInputFears: Number(strangeInputFears),
        strangeJointFearsAfterSum: Number(strangeJointFears),
        strangeCopyFearsAfterSum: Number(strangeCopyFears),
        pointwiseCopyMinEigenvalue: pointwiseMinEigen,
        pointwiseFormBrokenPairs: formBroken,
      },
      control: {
        movesPermute: movesPermute ? 1 : 0,
        pointwiseChangesOverlap: pointwiseChangesOverlap ? 1 : 0,
      },
      notes:
        'First run 2026-09-26: every gate passed as fixed. The 13 inputs\' pairwise overlaps take the three values 0, 1/3 and 1/2, and 62 of the 78 pairs are neither 0 nor 1. No two-meeting word copies even one orthogonal pair (the most any word copies is 1 input, its own blank); only SUM, the stream\'s flow update, copies 3. The first run\'s controls also printed that list as one encoded number, removed after it as unreadable; nothing else changed.' +
        'L2. The theorem is the invariant; the words and histories check it on the model\'s own kernels, and the pointwise copy shows the check can fail. The love-fear kernel is read in the love frame (the stored kernel conjugated on its second coordinate), where it is the Wigner kernel of the singlet phase itself. A single history (one joint point) is classical and SUM copies its role coordinate, but the signed weight over histories is never copied: the Strange role\'s fears stay in the joint whole, in the correlation, and neither copy holds one.',
    })
  },
})
