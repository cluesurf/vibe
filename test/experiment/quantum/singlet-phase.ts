// The color-respecting gate for a love meeting a fear, and whether any color-respecting meeting can make
// or unmake a whole.
//
// E-QTM-0099 applied the swap phase at every meeting, love-fear included, and argued it breaks the color
// law of E-FRC-0124 there. A fear's role is the conjugate of a love's: a color move C acts on it as C*.
// The gates that commute with C x C* for every C are span{1, P}, P the projector on the whole
// Phi = sum_j |j j> / sqrt 3, so the one-third turn for a love meeting a fear is the singlet phase
// V(phi) = 1 + (e^(i phi) - 1) P (code/rule/fear-weave, singletPhase). Since A(a, b)* = A(a, -b), a fear's
// conjugate role stored at the reflected point (a, -b) moves by the same grid move as a love's: that is
// the color weave's own convention, and in it the color law is that love minus fear, x - y, is kept.
//
// Measured:
// 1. the algebra: the conjugation identity on the grid; the dimension of the commutant of Sigma(648) on
//    3 x 3 and on 3 x 3bar, sum |chi|^4 / 648 (2 for SU(3); a larger number would mean the finite color
//    group allows more color-respecting gates); the whole Phi's grid weights; the singlet phase's kernel
//    at 2 pi / 3: its denominator, its fears, how many entries break x - y (the per-configuration color
//    law) and how many break frame covariance under all 216 grid moves. Control: the swap phase put at a
//    love-fear meeting
// 2. on the lattice: the color weave with the hop-free table (the one E-FRC-0124 found color-local), where
//    every token keeps one sign for life (a love, or a fear, or a calm slot signed by its side). Control:
//    the committed table, where the hop changes signs. A whole of a love and a fear from one line of cell
//    0 in the vacuum (the love-fear pair of cell 0 that meets most in 240 beats), from |0> |0bar>, share
//    of Phi 1/3, on the live links for 480 beats: at every meeting, the weight in each of the nine classes
//    x - y = c before and after, exactly; the share of Phi (the class c = 0) before and after every
//    meeting and every crossing; reversal and charge in fixed units; the fear-off rule (phi = 0); and the
//    same run with the swap phase at love-fear meetings, the E-QTM-0099 rule
// 3. wholes of three: any sequence of color-respecting meetings (swap phases at any angle on any pair,
//    with common frame moves) keeps the singlet share of |0>|1>|2> at 1/6. Reported: the largest share a
//    greedy search reaches when the three tokens are turned by different grid moves between meetings (a
//    gauge field's holonomy), and the same for a love and a fear from |0>|0bar>
//
// Gates, fixed before the run: conjugation identity to 1e-12; both commutant dimensions 2; Phi is 9 units,
// 0 fears, all on x = y; the singlet phase's kernel is whole with 0 color-law and 0 frame violations,
// while the swap phase at a love-fear meeting has color-law violations; token signs never change under
// the hop-free table and do under the committed one; on the lattice every class weight is unchanged at
// every meeting (with meetings), the Phi share is unchanged at every meeting, the run reverses exactly and
// keeps love minus fear, the fear-off rule makes no fear, and the swap-phase rule changes class weights at
// meetings; every color-respecting sequence on three roles keeps the share at 1/6 to 1e-12.
//
// The first run measured the sign changes in the vacuum, where the committed table's control read 0: the
// vacuum flashes in step and never holds a lone charge, so the hop never fires. The sign count for both
// tables was moved to a golden-ratio fill, the gate unchanged.
//
// Depth L1 for the algebra, L2 for the lattice run.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  fearBeatBack,
  makeLattice,
  meetingKernel,
  singletPhase,
  swapPhase,
  twoRolePoints,
  wholeKernel,
  wholeLovesAndFears,
  wholeUnits,
  fearKernels,
  type FearKernels,
  type BeatRecord,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridWeights } from '@/code/measure/grid-weights'
import { generateGroup, type Matrix3 } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const SEARCH_BEATS = 240
const REVERSAL_BEATS = 96
const GREEDY_STEPS = 12

type C = [number, number]
type Vector = C[]

const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const conj = (a: C): C => [a[0], -a[1]]
const entry = (m: Matrix3, i: number, j: number): C => [m[2 * (3 * i + j)] ?? 0, m[2 * (3 * i + j) + 1] ?? 0]

// a 3 x 3 matrix on one factor of a vector of `factors` roles
function onFactor(v: Vector, m: Matrix3, factor: number, factors: number, conjugate: boolean): Vector {
  const stride = 3 ** (factors - 1 - factor)
  const out: Vector = v.map(() => [0, 0])

  v.forEach((amp, index) => {
    const digit = Math.floor(index / stride) % 3
    const base = index - digit * stride

    for (let row = 0; row < 3; row++) {
      const e = conjugate ? conj(entry(m, row, digit)) : entry(m, row, digit)

      out[base + row * stride] = add(out[base + row * stride] ?? [0, 0], mul(e, amp))
    }
  })

  return out
}

// the swap phase on roles i < j of three
function swapOn(v: Vector, i: number, j: number, phi: number): Vector {
  const alpha: C = [(1 + Math.cos(phi)) / 2, Math.sin(phi) / 2]
  const beta: C = [(1 - Math.cos(phi)) / 2, -Math.sin(phi) / 2]

  return v.map((amp, index) => {
    const d = [Math.floor(index / 9), Math.floor(index / 3) % 3, index % 3]
    const s = [...d]

    s[i] = d[j] ?? 0
    s[j] = d[i] ?? 0

    return add(mul(alpha, amp), mul(beta, v[9 * (s[0] ?? 0) + 3 * (s[1] ?? 0) + (s[2] ?? 0)] ?? [0, 0]))
  })
}

// the singlet phase on a love and a fear, index 3 love + fear
function singletOn(v: Vector, phi: number): Vector {
  let overlap: C = [0, 0]

  for (const j of [0, 4, 8]) {
    overlap = add(overlap, v[j] ?? [0, 0])
  }

  const factor: C = [(Math.cos(phi) - 1) / 3, Math.sin(phi) / 3]

  return v.map((amp, index) => (index % 4 === 0 ? add(amp, mul(factor, overlap)) : amp))
}

const shareThree = (v: Vector): number => {
  let re = 0
  let im = 0

  for (const [i, j, k, sign] of [
    [0, 1, 2, 1],
    [1, 2, 0, 1],
    [2, 0, 1, 1],
    [0, 2, 1, -1],
    [2, 1, 0, -1],
    [1, 0, 2, -1],
  ] as const) {
    const amp = v[9 * i + 3 * j + k] ?? [0, 0]

    re += (sign * amp[0]) / Math.sqrt(6)
    im += (sign * amp[1]) / Math.sqrt(6)
  }

  return re * re + im * im
}

const sharePair = (v: Vector): number => {
  const s = [0, 4, 8].reduce((acc, j) => add(acc, v[j] ?? [0, 0]), [0, 0] as C)

  return (s[0] * s[0] + s[1] * s[1]) / 3
}

const basis = (size: number, at: number): Vector => Array.from({ length: size }, (_, i) => (i === at ? [1, 0] : [0, 0]) as C)

export default experiment({
  id: 'quantum/singlet-phase',
  code: 'E-QTM-0102',
  title:
    'the color-respecting gate for a love meeting a fear is the singlet phase: in whole thirds, with fears, it keeps love minus fear of the two role points in every configuration where the swap phase does not, and a love-fear whole needs no fear at all; no color-respecting meeting of any angle can make or unmake a whole, of two roles or of three, and only the holonomy of the links between meetings can',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. the algebra
    const points = twoRolePoints()
    let conjugationError = 0

    for (let p = 0; p < 9; p++) {
      const a = points[p * 9]
      const b = points[(CONJUGATE_POINT[p] ?? 0) * 9]

      for (let k = 0; k < 81; k++) {
        conjugationError = Math.max(conjugationError, Math.abs((a?.re[k] ?? 0) - (b?.re[k] ?? 0)), Math.abs(-(a?.im[k] ?? 0) - (b?.im[k] ?? 0)))
      }
    }

    const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators, limit: 4000 })
    const fourth = group.matrices.reduce((s, m) => {
      const t = [0, 1, 2].reduce((acc, i) => add(acc, entry(m, i, i)), [0, 0] as C)

      return s + (t[0] * t[0] + t[1] * t[1]) ** 2
    }, 0)
    const commutantDimension = fourth / group.order

    const s3 = 1 / Math.sqrt(3)
    const phiWeights = gridWeights({
      re: Array.from({ length: 9 }, (_, i) => (i % 4 === 0 ? s3 : 0)),
      im: new Array<number>(9).fill(0),
      points,
    })
    const phiUnits = phiWeights.map((_, i) => Math.round(9 * (phiWeights[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0)))
    const phiFears = -phiUnits.filter(n => n < 0).reduce((a, b) => a + b, 0)
    const phiOffDiagonal = phiUnits.filter((n, i) => n !== 0 && Math.floor(i / 9) !== i % 9).length

    const classOf = (x: number, y: number): number => 3 * ((Math.floor(x / 3) - Math.floor(y / 3) + 3) % 3) + (((x % 3) - (y % 3) + 3) % 3)
    const singlet = wholeKernel(singletPhase(OMEGA), 1000)
    const singletBack = wholeKernel(singletPhase(-OMEGA), 1000)
    const kSinglet = conjugateSecond(singlet?.kernel ?? [])
    const kSingletBack = conjugateSecond(singletBack?.kernel ?? [])
    const kSwapAtLoveFear = conjugateSecond(meetingKernel(swapPhase(OMEGA)) ?? [])
    const weave = makeColorWeave({ side: SIDE, table: 'bind' })
    const { moves } = weave
    const lawViolations = (k: number[][]): number => {
      let count = 0

      k.forEach((row, r) =>
        row.forEach((value, c) => {
          count += value !== 0 && classOf(Math.floor(r / 9), r % 9) !== classOf(Math.floor(c / 9), c % 9) ? 1 : 0
        }),
      )

      return count
    }
    const frameViolations = (k: number[][]): number => {
      let count = 0

      for (const g of moves.act) {
        const image = (i: number): number => (g[Math.floor(i / 9)] ?? 0) * 9 + (g[i % 9] ?? 0)

        k.forEach((row, r) =>
          row.forEach((value, c) => {
            count += (k[image(r)]?.[image(c)] ?? 0) === value ? 0 : 1
          }),
        )
      }

      return count
    }
    const singletFears = kSinglet.flat().filter(x => x < 0).length
    const singletLaw = lawViolations(kSinglet)
    const swapLaw = lawViolations(kSwapAtLoveFear)
    const singletFrame = frameViolations(kSinglet)
    const swapFrame = frameViolations(kSwapAtLoveFear)

    // 2. the lattice
    const slots = weave.mesh.cellCount * 24
    const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
    const signAt = (w: ColorWeave, vibe: Int8Array, slot: number): number => (vibe[slot] ?? 0) || (w.side[slot % 24] ?? 1)
    // on a golden-ratio fill of fears, calms and loves: the vacuum flashes in step and never holds a lone
    // charge, so the committed table's hop never fires there (the first run's control, 0, measured that)
    const fill = { vibe: new Int8Array(slots), point: new Int8Array(slots) }

    for (let i = 0; i < slots; i++) {
      const u = ((i + 1) * ((Math.sqrt(5) - 1) / 2) * 2.11) % 1

      fill.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    }

    const signChanges = (w: ColorWeave): number => {
      let lattice = makeLattice(fill)
      const sign = Int8Array.from({ length: slots }, (_, s) => signAt(w, lattice.vibe, s))
      let changes = 0

      for (let t = 0; t < SEARCH_BEATS; t++) {
        lattice = fearBeat({ weave: w, links: w.links, lattice, open: new Uint8Array(slots), t }).lattice
        lattice.token.forEach((tk, s) => {
          changes += signAt(w, lattice.vibe, s) === sign[tk] ? 0 : 1
        })
      }

      return changes
    }
    const signChangesBind = signChanges(weave)
    const signChangesCommitted = signChanges(makeColorWeave({ side: SIDE, table: 'pair' }))
    const tokenSign = (tk: number): number => weave.side[tk % 24] ?? 1

    const cell0 = new Uint8Array(slots)

    for (let s = 0; s < 24; s++) {
      cell0[s] = 1
    }

    const counts = new Map<string, number>()

    {
      let lattice = makeLattice(vacuum)

      for (let t = 0; t < SEARCH_BEATS; t++) {
        const r = fearBeat({ weave, links: weave.links, lattice, open: cell0, t })

        lattice = r.lattice

        for (const [a, b] of r.record.meetings) {
          if (tokenSign(a) !== tokenSign(b)) {
            const love = tokenSign(a) > 0 ? a : b
            const key = `${love},${love === a ? b : a}`

            counts.set(key, (counts.get(key) ?? 0) + 1)
          }
        }
      }
    }

    const pair = ([...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0]?.[0] ?? '0,1').split(',').map(Number)
    const open = new Uint8Array(slots)

    for (const tk of pair) {
      open[tk] = 1
    }

    const records: BeatRecord[] = []

    {
      let lattice = makeLattice(vacuum)

      for (let t = 0; t < BEATS; t++) {
        const r = fearBeat({ weave, links: weave.links, lattice, open, t })

        lattice = r.lattice
        records.push(r.record)
      }
    }

    // |0> for the love, |0bar> for the fear: the points (0, b), the fear's stored at (0, -b), the same set
    const start: Whole = { tokens: pair, weight: Array.from({ length: 81 }, (_, i) => (Math.floor(i / 27) === 0 && Math.floor((i % 9) / 3) === 0 ? 1n : 0n)) }
    const kernelFor = (kernel: number[][], divisor: number) => (ta: number, tb: number) =>
      tokenSign(ta) === tokenSign(tb)
        ? { kernel: meetingKernel(swapPhase(OMEGA)) ?? [], divisor: 4, order: [ta, tb] as const }
        : { kernel, divisor, order: (tokenSign(ta) > 0 ? [ta, tb] : [tb, ta]) as readonly [number, number] }
    const classWeights = (whole: Whole): bigint[] => {
      const out = new Array<bigint>(9).fill(0n)

      whole.weight.forEach((w, i) => {
        const c = classOf(Math.floor(i / 9), i % 9)

        out[c] = (out[c] ?? 0n) + w
      })

      return out
    }
    const sameShares = (a: Whole, b: Whole): boolean => {
      const ca = classWeights(a)
      const cb = classWeights(b)
      const na = wholeUnits(a)
      const nb = wholeUnits(b)

      return ca.every((w, c) => w * nb === (cb[c] ?? 0n) * na)
    }
    const shareOf = (whole: Whole): number => Number(classWeights(whole)[0] ?? 0n) / Number(wholeUnits(whole))
    const trace = (kernel: number[][], divisor: number, color?: FearKernels) => {
      let whole = start
      let meetings = 0
      let classChanges = 0
      let crossingShareChanges = 0
      let unitsMax = 9n
      let fearsMax = 0n
      let fearShareMax = 0
      const shares: number[] = [shareOf(start)]

      for (const record of records) {
        const afterMeet = color
          ? advanceWhole({ weave, whole, record: { meetings: record.meetings, crossings: [], signs: record.signs }, kernel4: [], color, fixed: false, forward: true })!
          : advanceWhole({ weave, whole, record: { meetings: record.meetings, crossings: [] }, kernel4: [], kernelOf: kernelFor(kernel, divisor), fixed: false, forward: true })!

        if (record.meetings.length > 0) {
          meetings += record.meetings.length
          classChanges += sameShares(whole, afterMeet) ? 0 : 1
        }

        whole = advanceWhole({ weave, whole: afterMeet, record: { meetings: [], crossings: record.crossings }, kernel4: [], fixed: false, forward: true })!
        crossingShareChanges += shareOf(whole) === shareOf(afterMeet) ? 0 : 1
        shares.push(shareOf(whole))

        const units = wholeUnits(whole)
        const { loves, fears } = wholeLovesAndFears(whole)

        unitsMax = units > unitsMax ? units : unitsMax
        fearsMax = fears > fearsMax ? fears : fearsMax
        fearShareMax = Math.max(fearShareMax, Number(fears) / Number(loves + fears))
      }

      return { meetings, classChanges, crossingShareChanges, unitsMax, fearsMax, fearShareMax, shares }
    }

    const withSinglet = trace(kSinglet, singlet?.divisor ?? 3)
    // the color mode of code/rule/fear-weave, kernels chosen by the vibes each meeting recorded rather than
    // by the tokens' side signs: the same run, which must give the same shares at every beat
    const viaColorMode = trace([], 1, fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined)
    const colorModeAgrees =
      viaColorMode.shares.length === withSinglet.shares.length && viaColorMode.shares.every((s, i) => s === withSinglet.shares[i]) && viaColorMode.classChanges === withSinglet.classChanges
    const withSwap = trace(kSwapAtLoveFear, 4)
    const fearOff = trace(Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => (r === c ? 1 : 0))), 1)

    // reversal and charge in fixed units
    const bigUnits = 9n * 3n ** 150n
    let reverses = false
    let chargeKept = true

    {
      let lattice = makeLattice(vacuum)
      const whole0: Whole = { tokens: pair, weight: start.weight.map(w => w * (bigUnits / 9n)) }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: weave.links, lattice, open, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], kernelOf: kernelFor(kSinglet, singlet?.divisor ?? 3), fixed: true, forward: true }) : null
        chargeKept = chargeKept && whole !== null && wholeUnits(whole) === bigUnits
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: weave.links, lattice, open, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], kernelOf: kernelFor(kSingletBack, singletBack?.divisor ?? 3), fixed: true, forward: false }) : null
      }

      reverses = whole !== null && whole.weight.every((w, i) => w === whole0.weight[i]) && lattice.token.every((tk, s) => tk === s)
    }

    // 3. wholes of three, and the pair, off the lattice
    const clifford: Matrix3[] = []
    const seen = new Set<string>()

    group.matrices.forEach(m => {
      const key = (phaseSpaceAction({ unitary: m }) ?? []).join(',')

      if (!seen.has(key)) {
        seen.add(key)
        clifford.push(m)
      }
    })

    const angles = [OMEGA, Math.PI / 2, 1, 2 * Math.PI * ((Math.sqrt(5) - 1) / 2)]
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [0, 2],
    ]
    let worstDeviation = 0
    let three = basis(27, 5)

    for (let step = 0; step < 60; step++) {
      const [i, j] = pairs[step % 3] ?? [0, 1]

      three = swapOn(three, i, j, angles[step % angles.length] ?? OMEGA)

      if (step % 5 === 4) {
        const g = clifford[(step * 37) % clifford.length] ?? clifford[0]!

        three = onFactor(onFactor(onFactor(three, g, 0, 3, false), g, 1, 3, false), g, 2, 3, false)
      }

      worstDeviation = Math.max(worstDeviation, Math.abs(shareThree(three) - 1 / 6))
    }

    const greedyThree = (): number[] => {
      let v = basis(27, 5)
      const out: number[] = []

      for (let step = 0; step < GREEDY_STEPS; step++) {
        let best = -1
        let bestV = v

        for (const [i, j] of pairs) {
          const met = swapOn(v, i, j, OMEGA)

          for (let k = 0; k < 3; k++) {
            for (const g of clifford) {
              const candidate = onFactor(met, g, k, 3, false)
              const share = shareThree(candidate)

              if (share > best + 1e-12) {
                best = share
                bestV = candidate
              }
            }
          }
        }

        v = bestV
        out.push(best)
      }

      return out
    }

    const greedyPair = (): number[] => {
      let v = basis(9, 0)
      const out: number[] = []

      for (let step = 0; step < GREEDY_STEPS; step++) {
        let best = -1
        let bestV = v
        const met = singletOn(v, OMEGA)

        for (let k = 0; k < 2; k++) {
          for (const g of clifford) {
            const candidate = onFactor(met, g, k, 2, k === 1)
            const share = sharePair(candidate)

            if (share > best + 1e-12) {
              best = share
              bestV = candidate
            }
          }
        }

        v = bestV
        out.push(best)
      }

      return out
    }

    const threeGreedy = greedyThree()
    const pairGreedy = greedyPair()

    const ok =
      conjugationError < 1e-12 &&
      Math.abs(commutantDimension - 2) < 1e-9 &&
      phiUnits.reduce((a, b) => a + b, 0) === 9 &&
      phiFears === 0 &&
      phiOffDiagonal === 0 &&
      singlet !== null &&
      singletLaw === 0 &&
      singletFrame === 0 &&
      swapLaw > 0 &&
      signChangesBind === 0 &&
      signChangesCommitted > 0 &&
      withSinglet.meetings > 0 &&
      withSinglet.classChanges === 0 &&
      reverses &&
      chargeKept &&
      fearOff.fearsMax === 0n &&
      withSwap.classChanges > 0 &&
      worstDeviation < 1e-12

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a fear stored at the reflected grid point moves as a love does; Sigma(648) allows exactly two color-respecting gates on a love and a love and on a love and a fear, as SU(3) does; the love-fear whole Phi is nine loves and no fear, all on x = y; the singlet phase at 2 pi / 3 has a kernel in thirds with fears that keeps x - y in every configuration and commutes with all 216 grid moves, where the swap phase breaks both; on the hop-free lattice every token keeps its sign, every class weight is unchanged at every meeting, the run reverses exactly and keeps love minus fear, and the swap-phase rule changes class weights; color-respecting sequences on three roles keep the singlet share at 1/6',
      metrics: {
        conjugationError,
        commutantDimension,
        phiUnits: 9,
        phiFears,
        phiPointsOffDiagonal: phiOffDiagonal,
        singletKernelDivisor: singlet?.divisor ?? -1,
        singletKernelNegativeEntries: singletFears,
        singletKernelColorLawViolations: singletLaw,
        singletKernelFrameViolations: singletFrame,
        tokenSignChangesHopFree: signChangesBind,
        loveToken: pair[0] ?? -1,
        fearToken: pair[1] ?? -1,
        meetings: withSinglet.meetings,
        classChangesAtMeetings: withSinglet.classChanges,
        shareChangesAtCrossings: withSinglet.crossingShareChanges,
        shareStart: withSinglet.shares[0] ?? -1,
        shareMin: Math.min(...withSinglet.shares),
        shareMax: Math.max(...withSinglet.shares),
        shareFinal: withSinglet.shares[withSinglet.shares.length - 1] ?? -1,
        unitsLog3Over9Max: Math.log(Number(withSinglet.unitsMax) / 9) / Math.log(3),
        fearsMax: Number(withSinglet.fearsMax),
        fearShareMax: withSinglet.fearShareMax,
        reversesExactly: reverses ? 1 : 0,
        loveMinusFearKept: chargeKept ? 1 : 0,
        threeRoleWorstDeviationFromSixth: worstDeviation,
        threeRoleGreedyShareAfter1: threeGreedy[0] ?? -1,
        threeRoleGreedyShareAfter4: threeGreedy[3] ?? -1,
        threeRoleGreedyShareMax: Math.max(...threeGreedy),
        pairGreedyShareAfter1: pairGreedy[0] ?? -1,
        pairGreedyShareMax: Math.max(...pairGreedy),
      },
      control: {
        swapAtLoveFearColorLawViolations: swapLaw,
        swapAtLoveFearFrameViolations: swapFrame,
        tokenSignChangesCommitted: signChangesCommitted,
        swapRuleClassChangesAtMeetings: withSwap.classChanges,
        swapRuleShareMax: Math.max(...withSwap.shares),
        fearOffFearsMax: Number(fearOff.fearsMax),
        fearOffShareChangesAtCrossings: fearOff.crossingShareChanges,
        colorModeAgreesWithSideSigns: colorModeAgrees ? 1 : 0,
      },
      notes:
        'L1 for the kernels and characters, L2 for the lattice. The commutant dimension is sum |Tr g|^4 / 648 over Sigma(648), the same for 3 x 3 and 3 x 3bar since |Tr g*| = |Tr g|. Class weights are compared as exact ratios of BigInt sums. The greedy searches are deterministic: each step a meeting (the swap phase at 2 pi / 3 on the best of the three pairs, or the singlet phase) then the best single grid move on one token, which a gauge field can supply and a common frame change cannot; they are lower bounds on what holonomy can reach, not optima. The three-role sweep uses four angles, three pairings and a common frame move every fifth step.',
    })
  },
})
