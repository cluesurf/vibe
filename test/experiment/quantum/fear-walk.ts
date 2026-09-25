// Quantum motion from the one-third turn: the swap phase on which slot of its line a lone vibe is in, the
// amplitude on POSITION that E-FND-0080 found the committed rule lacks (code/rule/fear-walk).
//
// The committed pair table hops a lone vibe to the other slot of its line every beat, and the stream then
// carries it one cell. The hop is the exchange of the two slots, so the cube-root swap phase on it is
// U = a + b HOP, a = (1 + omega) / 2, b = (1 - omega) / 2: keep the direction with amplitude a, reverse it
// with amplitude b. 2 a and 2 b are Eisenstein integers, so the weight on each slot is a pair of whole
// numbers and every beat is exact. The one-vibe sector of a line, on a ring of cells.
//
// Measured, each against the classical stand-in (the same chances with the phases dropped: keep 1/4,
// reverse 3/4, a persistent random walk), the committed hop (phi = pi) and the free stream (phi = 0):
// 1. exactness: the total chance is 4^t / 4^t after every beat, as whole numbers, for 400 beats; 100 beats
//    forward and back on a ring of 51 cells return the start times 4^100 exactly; the Eisenstein weights
//    agree with a floating-point run of the same unitary to 1e-9
// 2. spreading: from one right-moving slot on a ring of 801 cells (no wrap in 400 beats), the second moment
//    <x^2> / t^2 at t = 400 against the prediction 1 - sqrt(1 - |a|^2) = 1 - sqrt 3 / 2 for a two-state
//    walk whose coin keeps with amplitude a (the Hadamard walk's 1 - 1/sqrt 2 at |a|^2 = 1/2), and the
//    growth exponent of the spread between t = 100 and 400. The stand-in's <x^2> against the exact formula
//    for a persistent walk with step correlation c = 1/4 - 3/4 = -1/2,
//    <x^2> = t (1 + c) / (1 - c) - 2 c (1 - c^t) / (1 - c)^2
// 3. two paths: on a ring of 31 cells the swap phase acts at cell 0 only (elsewhere the vibe streams
//    freely); the two directions go round the ring and meet at cell 0 after 31 beats, where it acts again.
//    A phase omega^k on one arm (k = 0, 1, 2, the only phases whole numbers allow). The chance of leaving
//    right-moving: predicted |1 - 3 omega^k|^2 / 16 = 1/4, 13/16, 13/16, against 10/16 for every k in the
//    stand-in and 1 in the committed hop
// 4. revivals: on rings of 3 to 11 cells with the swap phase everywhere, the first beat up to 600 at which
//    the start returns exactly (every weight but the start's zero), and the largest return chance
// 5. why the weight is complex and not loves and fears: a real signed weight with classical steps as
//    permutations is the discrete Wigner function, which exists with that property only in odd dimension
//    (Gross 2006). Two slots per cell make the dimension even. Three (right, left, rest) make it odd, and
//    then the question is whether streaming, a shift by the direction, permutes the grid points. Measured:
//    its Wigner kernel on a ring of N cells times a qutrit direction, for N = 3, 5, 7. Predicted: a
//    permutation only for N = 3, where the velocity c -> c is a map of Z_3 into Z_N that respects adding;
//    for N = 5 and 7 the shift itself makes fears. Control: reversing the direction, c -> -c, a
//    permutation at every N
//
// Gates, fixed before the run: 1 exact everywhere; 2 <x^2> / t^2 within 2% of 1 - sqrt 3 / 2 with spread
// exponent between 0.95 and 1.05, the stand-in equal to its formula to 1e-9 with exponent between 0.45 and
// 0.55, the committed hop's <x^2> at most 1 throughout; 3 exactly 1/4, 13/16, 13/16, the stand-in 10/16
// and the hop 1 for every k; 5 the shift a permutation at N = 3 and not at 5 or 7, the reversal a
// permutation at all three.
//
// The first run failed the stand-in's formula gate at 5.8e-9 against 1e-9: the harness read the moment to
// six decimals, so the gate could not be met by a correct run. It is replaced by the formula as an exact
// whole-number identity, 9 S = 3 t 4^t + 4 4^t - 4 2^t, which is stricter; the float error is reported.
//
// Depth L2: a known construction (the discrete-time quantum walk, Aharonov, Davidovich and Zagury 1993;
// Meyer 1996) with the coin the base's own one-third turn, carried in exact whole numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  chanceBeat,
  FEAR_COIN,
  FEAR_COIN_BACK,
  HOP_COIN,
  norm,
  STAY_COIN,
  times,
  turn,
  walkBeat,
  walkBeatBack,
  walkChances,
  walkStart,
  ZERO,
  type ChanceState,
  type Coin,
  type Eisenstein,
  type WalkState,
} from '@/code/rule/fear-walk'

const OMEGA = (2 * Math.PI) / 3
const SPREAD_BEATS = 400
const SPREAD_CELLS = 2 * SPREAD_BEATS + 1
const RING = 51
const REVERSAL_BEATS = 100
const INTERFEROMETER = 31
const REVIVAL_LIMIT = 600

type Complex = { re: Float64Array; im: Float64Array; n: number }

// the phase-point operators of Z_d, d odd: A(a, b) = D P D^dagger, D = tau^(a b) X^a Z^b, tau = omega_d^((d+1)/2)
function phasePoints(d: number): Complex[] {
  const out: Complex[] = []

  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      const m: Complex = { re: new Float64Array(d * d), im: new Float64Array(d * d), n: d }

      // D P D^dagger |j> : D^dagger |j> = conj(tau^(ab) omega^(b (j - a))) |j - a>, P -> |a - j>, D -> tau^(ab) omega^(b (a - j)) |2a - j>
      for (let j = 0; j < d; j++) {
        const phase = (2 * Math.PI * (b * ((a - j + d) % d) - b * ((j - a + d) % d))) / d
        const row = (((2 * a - j) % d) + d) % d

        m.re[row * d + j] = Math.cos(phase)
        m.im[row * d + j] = Math.sin(phase)
      }

      out.push(m)
    }
  }

  return out
}

function kron(p: Complex, q: Complex): Complex {
  const n = p.n * q.n
  const out: Complex = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

  for (let i = 0; i < p.n; i++) {
    for (let j = 0; j < p.n; j++) {
      const pr = p.re[i * p.n + j] ?? 0
      const pi = p.im[i * p.n + j] ?? 0

      if (pr === 0 && pi === 0) {
        continue
      }

      for (let k = 0; k < q.n; k++) {
        for (let l = 0; l < q.n; l++) {
          const at = (i * q.n + k) * n + (j * q.n + l)

          out.re[at] = pr * (q.re[k * q.n + l] ?? 0) - pi * (q.im[k * q.n + l] ?? 0)
          out.im[at] = pr * (q.im[k * q.n + l] ?? 0) + pi * (q.re[k * q.n + l] ?? 0)
        }
      }
    }
  }

  return out
}

// is the Wigner kernel of a permutation of basis states (sigma: index -> index) a permutation of points?
function kernelIsPermutation(points: Complex[], sigma: number[]): { permutation: boolean; negative: number } {
  const n = points[0]?.n ?? 1
  const moved = points.map(a => {
    const m: Complex = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        m.re[(sigma[i] ?? 0) * n + (sigma[j] ?? 0)] = a.re[i * n + j] ?? 0
        m.im[(sigma[i] ?? 0) * n + (sigma[j] ?? 0)] = a.im[i * n + j] ?? 0
      }
    }

    return m
  })
  let permutation = true
  let negative = 0

  for (const m of moved) {
    let ones = 0
    let others = 0

    for (const a of points) {
      let re = 0

      for (let i = 0; i < n; i++) {
        for (let k = 0; k < n; k++) {
          re += (a.re[i * n + k] ?? 0) * (m.re[k * n + i] ?? 0) - (a.im[i * n + k] ?? 0) * (m.im[k * n + i] ?? 0)
        }
      }

      const value = re / n

      if (Math.abs(value - 1) < 1e-9) {
        ones++
      } else if (Math.abs(value) > 1e-9) {
        others++
        negative += value < 0 ? 1 : 0
      }
    }

    permutation = permutation && ones === 1 && others === 0
  }

  return { permutation, negative }
}

const moments = (chances: bigint[], scale: bigint, origin: number): { mean: number; second: number } => {
  let first = 0n
  let second = 0n

  chances.forEach((p, x) => {
    const d = BigInt(x - origin)

    first += d * p
    second += d * d * p
  })

  return { mean: Number(first * 1000000n / scale) / 1e6, second: Number(second * 1000000n / scale) / 1e6 }
}

export default experiment({
  id: 'quantum/fear-walk',
  code: 'E-QTM-0103',
  title:
    'quantum motion from the one-third turn: the swap phase on which slot a lone vibe holds is carried exactly as Eisenstein integers, reverses exactly, spreads in proportion to time where its phase-free stand-in diffuses as the square root, interferes between two paths round a ring with visibility 9/17 where the stand-in shows none, and cannot be carried as real loves and fears, since streaming is a permutation of the Wigner grid only on a ring of three cells',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const everywhere = (coin: Coin) => (): Coin => coin

    // 1 and 2: spreading, exactness, the float check
    let state = walkStart(SPREAD_CELLS, SPREAD_BEATS, true)
    let chances: ChanceState = {
      right: Array.from({ length: SPREAD_CELLS }, (_, x) => (x === SPREAD_BEATS ? 1n : 0n)),
      left: new Array<bigint>(SPREAD_CELLS).fill(0n),
    }
    let hop = walkStart(SPREAD_CELLS, SPREAD_BEATS, true)
    let normExact = true
    let hopSecondMax = 0
    let floatError = 0
    let destructive = 0
    let re: number[] = Array.from({ length: 2 * SPREAD_CELLS }, (_, i) => (i === SPREAD_BEATS ? 1 : 0))
    let im = new Array<number>(2 * SPREAD_CELLS).fill(0)
    const a = { re: (1 + Math.cos(OMEGA)) / 2, im: Math.sin(OMEGA) / 2 }
    const b = { re: (1 - Math.cos(OMEGA)) / 2, im: -Math.sin(OMEGA) / 2 }
    const quantumAt: Record<number, { second: number; spread: number }> = {}
    const classicalAt: Record<number, { second: number; spread: number }> = {}

    for (let t = 1; t <= SPREAD_BEATS; t++) {
      // interference: slots where the two contributions cancel in part (their cross term is negative)
      for (let x = 0; x < SPREAD_CELLS; x++) {
        const r = state.right[x] ?? ZERO
        const l = state.left[x] ?? ZERO

        for (const [keep, reverse] of [[times(FEAR_COIN[0], r), times(FEAR_COIN[1], l)], [times(FEAR_COIN[1], r), times(FEAR_COIN[0], l)]] as const) {
          const sum: Eisenstein = [keep[0] + reverse[0], keep[1] + reverse[1]]

          destructive += norm(sum) < norm(keep) + norm(reverse) ? 1 : 0
        }
      }

      state = walkBeat(state, everywhere(FEAR_COIN))
      chances = chanceBeat(chances, 1n, 3n)
      hop = walkBeat(hop, everywhere(HOP_COIN))

      const p = walkChances(state)
      const scale = 4n ** BigInt(t)

      normExact = normExact && p.reduce((s, v) => s + v, 0n) === scale

      const hopMoments = moments(walkChances(hop), scale, SPREAD_BEATS)

      hopSecondMax = Math.max(hopSecondMax, hopMoments.second)

      if (t <= 60) {
        const nextRe = new Array<number>(re.length).fill(0)
        const nextIm = new Array<number>(im.length).fill(0)

        for (let x = 0; x < SPREAD_CELLS; x++) {
          const rr = re[x] ?? 0
          const ri = im[x] ?? 0
          const lr = re[SPREAD_CELLS + x] ?? 0
          const li = im[SPREAD_CELLS + x] ?? 0
          const up = (x + 1) % SPREAD_CELLS
          const down = (x - 1 + SPREAD_CELLS) % SPREAD_CELLS

          nextRe[up] = a.re * rr - a.im * ri + b.re * lr - b.im * li
          nextIm[up] = a.re * ri + a.im * rr + b.re * li + b.im * lr
          nextRe[SPREAD_CELLS + down] = b.re * rr - b.im * ri + a.re * lr - a.im * li
          nextIm[SPREAD_CELLS + down] = b.re * ri + b.im * rr + a.re * li + a.im * lr
        }

        re = nextRe
        im = nextIm

        const scaleT = 2 ** t

        for (let x = 0; x < SPREAD_CELLS; x++) {
          for (const [w, fr, fi] of [
            [state.right[x] ?? ZERO, re[x] ?? 0, im[x] ?? 0],
            [state.left[x] ?? ZERO, re[SPREAD_CELLS + x] ?? 0, im[SPREAD_CELLS + x] ?? 0],
          ] as const) {
            const er = (Number(w[0]) - Number(w[1]) / 2) / scaleT
            const ei = ((Number(w[1]) * Math.sqrt(3)) / 2) / scaleT

            floatError = Math.max(floatError, Math.abs(er - fr), Math.abs(ei - fi))
          }
        }
      }

      if (t === 100 || t === 200 || t === SPREAD_BEATS) {
        const q = moments(p, scale, SPREAD_BEATS)
        const c = moments(
          chances.right.map((v, x) => v + (chances.left[x] ?? 0n)),
          scale,
          SPREAD_BEATS,
        )

        quantumAt[t] = { second: q.second, spread: Math.sqrt(q.second - q.mean * q.mean) }
        classicalAt[t] = { second: c.second, spread: Math.sqrt(c.second - c.mean * c.mean) }
      }
    }

    const predicted = 1 - Math.sqrt(3) / 2
    const quantumRatio = (quantumAt[SPREAD_BEATS]?.second ?? 0) / SPREAD_BEATS ** 2
    const exponent = (at: typeof quantumAt): number =>
      Math.log((at[SPREAD_BEATS]?.spread ?? 1) / (at[100]?.spread ?? 1)) / Math.log(SPREAD_BEATS / 100)
    const quantumExponent = exponent(quantumAt)
    const classicalExponent = exponent(classicalAt)
    const c = -0.5
    const persistent = SPREAD_BEATS * ((1 + c) / (1 - c)) - (2 * c * (1 - c ** SPREAD_BEATS)) / (1 - c) ** 2
    const classicalFormulaError = Math.abs((classicalAt[SPREAD_BEATS]?.second ?? 0) - persistent) / persistent
    // the same, exactly: with c = -1/2 the formula is t / 3 + 4 / 9 - 4 / (9 2^t), so 9 S = 3 t 4^t + 4 4^t - 4 2^t
    // for S the whole-number second moment over 4^t
    const exactSecond = chances.right.reduce((s, v, x) => {
      const d = BigInt(x - SPREAD_BEATS)

      return s + d * d * (v + (chances.left[x] ?? 0n))
    }, 0n)
    const big = BigInt(SPREAD_BEATS)
    const classicalFormulaExact = 9n * exactSecond === 3n * big * 4n ** big + 4n * 4n ** big - 4n * 2n ** big

    // reversal on a ring with wrap
    let ring: WalkState = walkStart(RING, 0, true)

    ring = { ...ring, right: ring.right.map((w, x) => (x === 7 ? [3n, 1n] : w)), left: ring.left.map((w, x) => (x === 20 ? [-2n, 5n] : w)) }

    const ring0 = ring

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      ring = walkBeat(ring, everywhere(FEAR_COIN))
    }

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      ring = walkBeatBack(ring, everywhere(FEAR_COIN_BACK))
    }

    const factor = 4n ** BigInt(REVERSAL_BEATS)
    const reverses = ring.right.every((w, x) => w[0] === (ring0.right[x]?.[0] ?? 0n) * factor && w[1] === (ring0.right[x]?.[1] ?? 0n) * factor) &&
      ring.left.every((w, x) => w[0] === (ring0.left[x]?.[0] ?? 0n) * factor && w[1] === (ring0.left[x]?.[1] ?? 0n) * factor)

    // 3. two paths
    const plateCell = INTERFEROMETER - 5
    const interferometer = (coin: Coin, k: number): number => {
      let s = walkStart(INTERFEROMETER, 0, true)

      for (let t = 0; t <= INTERFEROMETER; t++) {
        s = walkBeat(s, x => (x === 0 ? coin : STAY_COIN))
        s = { ...s, left: s.left.map((w, x) => (x === plateCell ? turn(w, k) : w)) }
      }

      // after the second action at cell 0 and one stream: right-moving at cell 1, left-moving at cell N - 1
      const total = walkChances(s).reduce((sum, v) => sum + v, 0n)

      return Number(norm(s.right[1] ?? ZERO) * 1000000n / total) / 1e6
    }
    const fringe = [0, 1, 2].map(k => interferometer(FEAR_COIN, k))
    const hopFringe = [0, 1, 2].map(k => interferometer(HOP_COIN, k))
    // the stand-in: chances only, a split at cell 0 twice, the phase plate does nothing to a chance
    const standIn = (1 / 4) * (1 / 4) + (3 / 4) * (3 / 4)
    const visibility = (Math.max(...fringe) - Math.min(...fringe)) / (Math.max(...fringe) + Math.min(...fringe))

    // 4. revivals
    const revivals = [3, 5, 7, 9, 11].map(cells => {
      let s = walkStart(cells, 0, true)
      let first = 0
      let best = 0

      for (let t = 1; t <= REVIVAL_LIMIT && first === 0; t++) {
        s = walkBeat(s, everywhere(FEAR_COIN))

        const back = norm(s.right[0] ?? ZERO)
        const scale = 4n ** BigInt(t)

        best = Math.max(best, Number((back * 1000000n) / scale) / 1e6)
        first = back === scale ? t : 0
      }

      return { cells, first, best }
    })

    // 5. real signed weight: the shift by a qutrit direction on the Wigner grid of N cells x 3 directions
    const three = phasePoints(3)
    const obstruction = [3, 5, 7].map(cells => {
      const points = phasePoints(cells).flatMap(p => three.map(q => kron(p, q)))
      const velocity = [0, 1, cells - 1]
      const shift = Array.from({ length: 3 * cells }, (_, i) => {
        const x = Math.floor(i / 3)
        const d = i % 3

        return ((x + (velocity[d] ?? 0)) % cells) * 3 + d
      })
      const reverse = Array.from({ length: 3 * cells }, (_, i) => Math.floor(i / 3) * 3 + ((3 - (i % 3)) % 3))

      return { cells, shift: kernelIsPermutation(points, shift), reverse: kernelIsPermutation(points, reverse) }
    })

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-6
    const ok =
      normExact &&
      reverses &&
      floatError < 1e-9 &&
      Math.abs(quantumRatio / predicted - 1) < 0.02 &&
      quantumExponent > 0.95 &&
      quantumExponent < 1.05 &&
      classicalFormulaExact &&
      classicalExponent > 0.45 &&
      classicalExponent < 0.55 &&
      hopSecondMax <= 1 &&
      exact(fringe[0] ?? 0, 1 / 4) &&
      exact(fringe[1] ?? 0, 13 / 16) &&
      exact(fringe[2] ?? 0, 13 / 16) &&
      hopFringe.every(p => exact(p, 1)) &&
      exact(standIn, 10 / 16) &&
      obstruction[0]?.shift.permutation === true &&
      obstruction[1]?.shift.permutation === false &&
      obstruction[2]?.shift.permutation === false &&
      obstruction.every(o => o.reverse.permutation)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the walk is exact in Eisenstein integers for 400 beats, reverses exactly and matches the floating-point unitary; <x^2> / t^2 at t = 400 is within 2% of 1 - sqrt 3 / 2 and the spread grows as t, where the phase-free stand-in matches the persistent-walk formula and spreads as sqrt t and the committed hop stays pinned; two paths round a ring leave right-moving with chance 1/4, 13/16, 13/16 for the phase omega^k, where the stand-in gives 10/16 and the hop 1; and streaming by direction is a permutation of the Wigner grid on a ring of 3 cells but not of 5 or 7, so the weight on position is complex, not loves and fears',
      metrics: {
        normExactEveryBeat: normExact ? 1 : 0,
        reversesExactly: reverses ? 1 : 0,
        floatError,
        destructiveMeetingsIn400Beats: destructive,
        secondMomentOverT2At400: quantumRatio,
        secondMomentPredicted: predicted,
        spreadAt100: quantumAt[100]?.spread ?? -1,
        spreadAt200: quantumAt[200]?.spread ?? -1,
        spreadAt400: quantumAt[SPREAD_BEATS]?.spread ?? -1,
        spreadExponent: quantumExponent,
        fringeK0: fringe[0] ?? -1,
        fringeK1: fringe[1] ?? -1,
        fringeK2: fringe[2] ?? -1,
        fringeVisibility: visibility,
        ...Object.fromEntries(revivals.flatMap(r => [[`revivalBeatRing${r.cells}`, r.first], [`bestReturnRing${r.cells}`, r.best]])),
        ...Object.fromEntries(obstruction.flatMap(o => [[`shiftIsPermutationRing${o.cells}`, o.shift.permutation ? 1 : 0], [`shiftNegativeEntriesRing${o.cells}`, o.shift.negative]])),
      },
      control: {
        standInSecondMomentOverTAt400: (classicalAt[SPREAD_BEATS]?.second ?? 0) / SPREAD_BEATS,
        standInFormulaRelativeError: classicalFormulaError,
        standInFormulaExact: classicalFormulaExact ? 1 : 0,
        standInSpreadAt400: classicalAt[SPREAD_BEATS]?.spread ?? -1,
        standInSpreadExponent: classicalExponent,
        standInFringeEveryK: standIn,
        hopSecondMomentMax: hopSecondMax,
        hopFringeK0: hopFringe[0] ?? -1,
        hopFringeK1: hopFringe[1] ?? -1,
        ...Object.fromEntries(obstruction.map(o => [`reverseIsPermutationRing${o.cells}`, o.reverse.permutation ? 1 : 0])),
      },
      notes:
        'L2. Weights are Eisenstein integers m + n omega (BigInt pairs) over 2^t; chances are m^2 - m n + n^2 over 4^t; moments are read to 1e-6 from exact ratios. The spread exponent is log(sigma(400) / sigma(100)) / log 4. Destructive meetings: slot contributions whose sum has a smaller chance than the two apart, which a sum of chances never has. The interferometer is built by hand: the swap phase at one cell, free streaming elsewhere, a phase omega^k on the left-moving slot of cell 26. This is the one-vibe sector of one line with no vacuum: in the committed rule calm makes pairs everywhere, so a lone vibe is never alone (E-FND-0080), and joining this walk to the pair clock is not done. The Wigner grid of N cells x 3 directions uses the product of the odd-dimension phase-point operators; the gate asks only whether the shift permutes its points.',
    })
  },
})
