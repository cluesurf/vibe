// Is the fear weave quantum, measured by what a classical rule cannot do? Three witnesses, each read off
// the loves and fears the lattice carries (code/rule/fear-weave, E-QTM-0099), each against the same rule
// with the fear beat off (phi = pi, the color weave) and against its nearest classical stand-in: the swap
// phase with its phases thrown away, which exchanges two meeting roles with chance 3/4 and leaves them
// with chance 1/4 (|b|^2 and |a|^2 of U = a + b SWAP), a kernel with no fear.
//
// 1. Interference. The vacuum whole of E-QTM-0099 (a pair made together from calm, tokens 4 and 7) on flat
//    links, from |0>|1>. Between meetings nothing touches its roles, so each meeting is one step of
//    SWAP U. Measured from the grid weights (a role's value is the sum over its tilts): the chance the
//    first token reads 1 and the second 0 after each of the first three meetings, and the loves and fears
//    that cancel at each meeting (two contributions of opposite sign landing on one joint point). Predicted:
//    1/4, 3/4, 1, since SWAP U = (1 - omega) / 2 + (1 + omega) / 2 SWAP and (SWAP U)^3 = SWAP; the
//    stochastic stand-in, which in the tokens' labels changes the reading with chance 1/4, gives 1/4, 3/8,
//    7/16 and cancels
//    nothing; the fear-off rule gives 0 at every meeting.
// 2. Nonlocality. The same whole on the live links, read one beat after its first meeting, when its two
//    tokens stand in different cells. From its grid weights the density matrix rho = sum W(x) A(x), and the
//    largest CHSH value over two-outcome measurements on each role, by a deterministic see-saw from eight
//    fixed starts. Predicted: sqrt 7 = 2.6458, the value for Schmidt weights 1/4 and 3/4 (Gisin), above
//    the local bound 2. Controls: the fear-off rule and the stochastic stand-in, both at most 2. The see-saw
//    is also run after every meeting of the pair that spends the most grain in E-QTM-0099.
// 3. The whole of three different roles. A three-token whole from |0>|1>|2>: the cell-0 triple of the
//    golden-ratio matter fill whose three pairs all meet in 480 beats, with the most meetings. The
//    singlet's share is F = 27 sum W W_singlet, exact in integers since the singlet's weights are whole in
//    units of 54 (18 fears, E-FRC-0120). Predicted: on flat links F stays exactly 1/6 through every
//    meeting, because the singlet is antisymmetric under every exchange and so only takes a phase from
//    each swap phase: meetings alone can neither make a whole of different roles nor unmake one. Reported:
//    on live links, the smallest and largest F.
//
// 4. Added after the three-trit color law was adopted (E-QTM-0102): the same witnesses in the color mode,
//    where the vacuum pair, a love and a fear, meets by the singlet phase. Its predictions and gates are in
//    section 4 of the code, fixed before its first run.
//
// Gates, fixed before the run: interference 1/4, 3/4, 1 exactly, the stand-in 1/4, 3/8, 7/16, the fear-off
// rule 0, cancellations at the first three meetings above 0 for the fear beat and 0 for the stand-in; CHSH
// within 1e-6 of sqrt 7 with the tokens in different cells, both controls at most 2 + 1e-9; F exactly 1/6
// after every meeting on flat links, with the triple meeting at least once in each pairing.
//
// Positions stay classical in this rule: every witness here is in the roles, none in where a vibe goes.
//
// Depth L2: a constructed rule on the committed lattice, with the witnesses computed from its integers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearBeat,
  makeLattice,
  meetingKernel,
  meetWhole,
  moveCoordinate,
  swapPhase,
  twoRolePoints,
  wholeLovesAndFears,
  wholeUnits,
  fearKernels,
  CONJUGATE_POINT,
  type BeatRecord,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridWeights, phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { d4BoxDistance } from '@/code/substrate/d4-box'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const MATTER_SCALE = 2.11
const BEATS = 480
const VACUUM_PAIR = [4, 7]
const GROWER_PAIR = [4, 20]

type Hermitian = { re: Float64Array; im: Float64Array }

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

// the chance the tokens' roles read (j, k): the sum over tilts
function roleChance(whole: Whole, j: number, k: number): number {
  let sum = 0n

  whole.weight.forEach((w, i) => {
    if (Math.floor(Math.floor(i / 9) / 3) === j && Math.floor((i % 9) / 3) === k) {
      sum += w
    }
  })

  return Number(sum) / Number(wholeUnits(whole))
}

// loves and fears cancelled by a meeting, in wholes: contributions of opposite sign on one joint point
function cancelled(whole: Whole, kernel4: readonly (readonly number[])[]): number {
  let lost = 0n

  for (let r = 0; r < 81; r++) {
    let gross = 0n
    let net = 0n

    for (let c = 0; c < 81; c++) {
      const v = BigInt(kernel4[r]?.[c] ?? 0) * (whole.weight[c] ?? 0n)

      gross += v < 0n ? -v : v
      net += v
    }

    lost += gross - (net < 0n ? -net : net)
  }

  return Number(lost) / Number(4n * wholeUnits(whole))
}

// real symmetric eigen-decomposition by cyclic Jacobi, columns of the returned matrix
function jacobi(a: number[][]): { values: number[]; vectors: number[][] } {
  const n = a.length
  const m = a.map(row => [...row])
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)))

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += (m[p]?.[q] ?? 0) ** 2
      }
    }

    if (off < 1e-28) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = m[p]?.[q] ?? 0

        if (Math.abs(apq) < 1e-300) {
          continue
        }

        const theta = ((m[q]?.[q] ?? 0) - (m[p]?.[p] ?? 0)) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const mkp = m[k]?.[p] ?? 0
          const mkq = m[k]?.[q] ?? 0

          m[k]![p] = c * mkp - s * mkq
          m[k]![q] = s * mkp + c * mkq
        }

        for (let k = 0; k < n; k++) {
          const mpk = m[p]?.[k] ?? 0
          const mqk = m[q]?.[k] ?? 0

          m[p]![k] = c * mpk - s * mqk
          m[q]![k] = s * mpk + c * mqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k]?.[p] ?? 0
          const vkq = v[k]?.[q] ?? 0

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  return { values: m.map((row, i) => row[i] ?? 0), vectors: v }
}

// the sign of a 3 x 3 Hermitian matrix (eigenvalues sent to +1 or -1), through its 6 x 6 real form
function signOf(h: Hermitian): Hermitian {
  const z = Array.from({ length: 6 }, () => new Array<number>(6).fill(0))

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const re = h.re[i * 3 + j] ?? 0
      const im = h.im[i * 3 + j] ?? 0

      z[i]![j] = re
      z[i + 3]![j + 3] = re
      z[i]![j + 3] = -im
      z[i + 3]![j] = im
    }
  }

  const { values, vectors } = jacobi(z)
  const out: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 6; k++) {
        const sign = (values[k] ?? 0) >= 0 ? 1 : -1

        re += sign * (vectors[i]?.[k] ?? 0) * (vectors[j]?.[k] ?? 0)
        im += sign * (vectors[i + 3]?.[k] ?? 0) * (vectors[j]?.[k] ?? 0)
      }

      out.re[i * 3 + j] = re
      out.im[i * 3 + j] = im
    }
  }

  return out
}

function combine(a: Hermitian, b: Hermitian, s: number): Hermitian {
  return { re: a.re.map((x, i) => x + s * (b.re[i] ?? 0)), im: a.im.map((x, i) => x + s * (b.im[i] ?? 0)) }
}

// rho = sum W(x) A(x) on two roles, row-major 9 x 9
function densityOf(whole: Whole): Operator {
  const points = twoRolePoints()
  const units = Number(wholeUnits(whole))
  const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  whole.weight.forEach((w, x) => {
    if (w === 0n) {
      return
    }

    const weight = Number(w) / units
    const a = points[x]!

    for (let k = 0; k < 81; k++) {
      rho.re[k] = (rho.re[k] ?? 0) + weight * (a.re[k] ?? 0)
      rho.im[k] = (rho.im[k] ?? 0) + weight * (a.im[k] ?? 0)
    }
  })

  return rho
}

// the reduced operator on one role against an observable on the other: side 1 gives R with
// Tr(rho (X x Y)) = Tr(R Y), R_jj' = sum rho_(i j),(i' j') X_i'i; side 0 gives L with Tr(rho (X x Y)) = Tr(L X)
function reduce(rho: Operator, o: Hermitian, side: 0 | 1): Hermitian {
  const out: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      let re = 0
      let im = 0

      for (let s = 0; s < 3; s++) {
        for (let u = 0; u < 3; u++) {
          const row = side === 1 ? 3 * s + p : 3 * p + s
          const col = side === 1 ? 3 * u + q : 3 * q + u
          const rr = rho.re[row * 9 + col] ?? 0
          const ri = rho.im[row * 9 + col] ?? 0
          const or = o.re[u * 3 + s] ?? 0
          const oi = o.im[u * 3 + s] ?? 0

          re += rr * or - ri * oi
          im += rr * oi + ri * or
        }
      }

      out.re[p * 3 + q] = re
      out.im[p * 3 + q] = im
    }
  }

  // its Hermitian part
  const h: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      h.re[p * 3 + q] = ((out.re[p * 3 + q] ?? 0) + (out.re[q * 3 + p] ?? 0)) / 2
      h.im[p * 3 + q] = ((out.im[p * 3 + q] ?? 0) - (out.im[q * 3 + p] ?? 0)) / 2
    }
  }

  return h
}

function traceProduct(a: Hermitian, b: Hermitian): number {
  let re = 0

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      re += (a.re[i * 3 + k] ?? 0) * (b.re[k * 3 + i] ?? 0) - (a.im[i * 3 + k] ?? 0) * (b.im[k * 3 + i] ?? 0)
    }
  }

  return re
}

// a fixed Hermitian matrix from a golden-ratio fill, for the see-saw's starts
function fixedHermitian(seed: number): Hermitian {
  const h: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = i; j < 3; j++) {
      const u = (((seed + 1) * 7 + i * 3 + j + 1) * GOLDEN) % 1
      const v = (((seed + 2) * 11 + i * 5 + j + 3) * GOLDEN) % 1

      h.re[i * 3 + j] = u - 0.5
      h.re[j * 3 + i] = u - 0.5
      h.im[i * 3 + j] = i === j ? 0 : v - 0.5
      h.im[j * 3 + i] = i === j ? 0 : 0.5 - v
    }
  }

  return h
}

// the largest CHSH value the see-saw finds from eight fixed starts
function chsh(rho: Operator): number {
  let best = Number.NEGATIVE_INFINITY

  for (let start = 0; start < 8; start++) {
    let a0 = signOf(fixedHermitian(2 * start))
    let a1 = signOf(fixedHermitian(2 * start + 1))
    let value = 0

    for (let step = 0; step < 200; step++) {
      const b0 = signOf(reduce(rho, combine(a0, a1, 1), 1))
      const b1 = signOf(reduce(rho, combine(a0, a1, -1), 1))

      a0 = signOf(reduce(rho, combine(b0, b1, 1), 0))
      a1 = signOf(reduce(rho, combine(b0, b1, -1), 0))

      const next = traceProduct(reduce(rho, combine(b0, b1, 1), 0), a0) + traceProduct(reduce(rho, combine(b0, b1, -1), 0), a1)

      if (Math.abs(next - value) < 1e-13) {
        value = next
        break
      }

      value = next
    }

    best = Math.max(best, value)
  }

  return best
}

export default experiment({
  id: 'quantum/fear-witness',
  code: 'E-QTM-0100',
  title:
    'the fear weave is quantum in its roles and only there: a pair made together interferes (its chance of a reading goes 1/4, 3/4, 1 over three meetings, with fears cancelling, where the phase-free stand-in gives 1/4, 3/8, 7/16), its two tokens violate CHSH at sqrt 7 from different cells where both classical rules stay at 2, and meetings can never make or unmake a whole of three different roles',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const { mesh, moves } = weave
    const slots = mesh.cellCount * 24
    const liveLinks = weave.links
    const flatLinks = new Int16Array(slots).fill(moves.identity)
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kPi = meetingKernel(swapPhase(Math.PI)) ?? []
    // the stand-in: SWAP (1/4 + 3/4 SWAP) on the tokens, as 4 K: stay (after the exchange) with 3, swap back with 1
    const kStochastic = Array.from({ length: 81 }, (_, r) =>
      Array.from({ length: 81 }, (__, c) => {
        const swapped = (c % 9) * 9 + Math.floor(c / 9)

        return (r === c ? 3 : 0) + (r === swapped ? 1 : 0)
      }),
    )
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) {
        open[t] = 1
      }

      return open
    }
    const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
    const matter = { vibe: new Int8Array(slots), point: new Int8Array(slots) }

    for (let i = 0; i < slots; i++) {
      const u = ((i + 1) * GOLDEN * MATTER_SCALE) % 1

      matter.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      matter.point[i] = Math.floor(((i + 3) * GOLDEN * MATTER_SCALE * 9) % 9)
    }

    const run = (background: typeof vacuum, links: Int16Array, open: Uint8Array, beats: number) => {
      let lattice = makeLattice(background)
      const records: BeatRecord[] = []
      const cells: Map<number, number>[] = []

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave, links, lattice, open, t })

        lattice = r.lattice
        records.push(r.record)

        const at = new Map<number, number>()

        lattice.token.forEach((tk, s) => {
          if (open[tk] === 1) {
            at.set(tk, Math.floor(s / 24))
          }
        })
        cells.push(at)
      }

      return { records, cells }
    }

    // 1. interference on flat links
    const flatRun = run(vacuum, flatLinks, openOf(VACUUM_PAIR), 60)
    const chances = (kernel4: number[][]): { chance: number[]; cancel: number[] } => {
      let whole: Whole = basisWhole(VACUUM_PAIR, [0, 1])
      const chance: number[] = []
      const cancel: number[] = []

      for (const record of flatRun.records) {
        if (record.meetings.length > 0 && chance.length < 3) {
          cancel.push(cancelled(whole, kernel4))
        }

        whole = advanceWhole({ weave, whole, record, kernel4, fixed: false, forward: true })!

        if (record.meetings.length > 0 && chance.length < 3) {
          chance.push(roleChance(whole, 1, 0))
        }
      }

      return { chance, cancel }
    }

    const quantum = chances(kThird)
    const stochastic = chances(kStochastic)
    const fearOff = chances(kPi)
    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12

    // 2. nonlocality: one beat after the first meeting on live links
    const liveRun = run(vacuum, liveLinks, openOf(VACUUM_PAIR), 60)
    const firstMeeting = liveRun.records.findIndex(r => r.meetings.length > 0)
    const stateAfter = (kernel4: number[][]): Whole => {
      let whole: Whole = basisWhole(VACUUM_PAIR, [0, 1])

      for (let t = 0; t <= firstMeeting + 1; t++) {
        whole = advanceWhole({ weave, whole, record: liveRun.records[t]!, kernel4, fixed: false, forward: true })!
      }

      return whole
    }
    const readAt = liveRun.cells[firstMeeting + 1] ?? new Map<number, number>()
    const cellA = readAt.get(VACUUM_PAIR[0] ?? 0) ?? 0
    const cellB = readAt.get(VACUUM_PAIR[1] ?? 0) ?? 0
    const separation = d4BoxDistance({ a: cellA, b: cellB, side: SIDE })
    const bellQuantum = chsh(densityOf(stateAfter(kThird)))
    const bellOff = chsh(densityOf(stateAfter(kPi)))
    const bellStochastic = chsh(densityOf(stateAfter(kStochastic)))
    const fearsAtReading = Number(wholeLovesAndFears(stateAfter(kThird)).fears)

    // and after every meeting of the pair that spends the most grain in E-QTM-0099
    const growerRun = run(matter, liveLinks, openOf(GROWER_PAIR), BEATS)
    const growerBell: number[] = []

    {
      let whole: Whole = basisWhole(GROWER_PAIR, [0, 1])

      for (const record of growerRun.records) {
        whole = advanceWhole({ weave, whole, record, kernel4: kThird, fixed: false, forward: true })!

        if (record.meetings.length > 0) {
          growerBell.push(chsh(densityOf(whole)))
        }
      }
    }

    // 4. the color mode, adopted after E-QTM-0102. The vacuum pair is a love (token 4) and a fear (token 7),
    // so every one of its meetings is the singlet phase V = 1 + (omega - 1) P_Phi. From |0>|1> it does nothing
    // (|0 1> is orthogonal to Phi), so the section starts from |0>|0bar>, share of Phi 1/3. Predicted, fixed
    // before its first run: the chance of reading (0, 0) after meetings 1 to 3 is 1/3, 1/3, 1 (V^3 = 1); the
    // stand-in (the same meetings with the state dephased in the role basis after each) gives 1/3, 1/3, 1/3;
    // with the fear beat off (V(0) = 1) it stays 1. One beat after the first meeting on live links the pair
    // violates CHSH (above 2), read from the density matrix with the fear's role taken back to its own
    // convention; the fear-off rule and the stand-in stay at 2
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const colorOff = fearKernels({ like: Math.PI, unlike: 0 }) ?? undefined
    const dephase = (whole: Whole): Whole => {
      const role = new Array<bigint>(9).fill(0n)

      whole.weight.forEach((w, i) => {
        const k = Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

        role[k] = (role[k] ?? 0n) + w
      })

      return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)] ?? 0n) }
    }
    const colorChances = (color: typeof colorOn, dephased: boolean): number[] => {
      let whole: Whole = basisWhole(VACUUM_PAIR, [0, 0])
      const out: number[] = []

      for (const record of flatRun.records) {
        whole = advanceWhole({ weave, whole, record, kernel4: [], color, fixed: false, forward: true })!

        if (record.meetings.length > 0 && out.length < 3) {
          whole = dephased ? dephase(whole) : whole
          out.push(roleChance(whole, 0, 0))
        }
      }

      return out
    }
    const colorQuantum = colorChances(colorOn, false)
    const colorStandIn = colorChances(colorOn, true)
    const colorOffChances = colorChances(colorOff, false)
    const nativeDensity = (whole: Whole): Operator => {
      const native = whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n)

      return densityOf({ tokens: whole.tokens, weight: native })
    }
    const colorState = (color: typeof colorOn, dephased: boolean): Whole => {
      let whole: Whole = basisWhole(VACUUM_PAIR, [0, 0])

      for (let t = 0; t <= firstMeeting + 1; t++) {
        const record = liveRun.records[t]!

        whole = advanceWhole({ weave, whole, record, kernel4: [], color, fixed: false, forward: true })!
        whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
      }

      return whole
    }
    const colorBell = chsh(nativeDensity(colorState(colorOn, false)))
    const colorBellOff = chsh(nativeDensity(colorState(colorOff, false)))
    const colorBellStandIn = chsh(nativeDensity(colorState(colorOn, true)))
    const colorOk =
      exact(colorQuantum[0] ?? 0, 1 / 3) &&
      exact(colorQuantum[1] ?? 0, 1 / 3) &&
      exact(colorQuantum[2] ?? 0, 1) &&
      exact(colorStandIn[0] ?? 0, 1 / 3) &&
      exact(colorStandIn[1] ?? 0, 1 / 3) &&
      exact(colorStandIn[2] ?? 0, 1 / 3) &&
      colorOffChances.every(c => c === 1) &&
      colorBell > 2 + 1e-6 &&
      colorBellOff <= 2 + 1e-9 &&
      colorBellStandIn <= 2 + 1e-9

    // 3. three different roles: the singlet's weights in units of 54
    const s6 = 1 / Math.sqrt(6)
    const singletRe = new Array<number>(27).fill(0)

    for (const [i, j, k, sign] of [
      [0, 1, 2, 1],
      [1, 2, 0, 1],
      [2, 0, 1, 1],
      [0, 2, 1, -1],
      [2, 1, 0, -1],
      [1, 0, 2, -1],
    ] as const) {
      singletRe[9 * i + 3 * j + k] = sign * s6
    }

    const singlet = gridWeights({ re: singletRe, im: new Array<number>(27).fill(0), points: phasePointOperators(3) }).map(w => BigInt(Math.round(54 * w)))
    const singletFears = -singlet.filter(w => w < 0n).reduce((a, b) => a + b, 0n)
    const shareOf = (whole: Whole): number => {
      const dot = whole.weight.reduce((s, w, i) => s + w * (singlet[i] ?? 0n), 0n)

      return Number(dot) / Number(2n * wholeUnits(whole))
    }
    const exactSixth = (whole: Whole): boolean => 3n * whole.weight.reduce((s, w, i) => s + w * (singlet[i] ?? 0n), 0n) === wholeUnits(whole)

    const cell0 = openOf(Array.from({ length: 24 }, (_, s) => s))
    const surveyRecords = run(matter, liveLinks, cell0, BEATS).records
    const pairMeetings = new Map<string, number>()

    for (const r of surveyRecords) {
      for (const [a, b] of r.meetings) {
        const key = `${Math.min(a, b)},${Math.max(a, b)}`

        pairMeetings.set(key, (pairMeetings.get(key) ?? 0) + 1)
      }
    }

    const met = (a: number, b: number): number => pairMeetings.get(`${Math.min(a, b)},${Math.max(a, b)}`) ?? 0
    let triple: number[] = []
    let tripleMeetings = 0

    for (let a = 0; a < 24; a++) {
      for (let b = a + 1; b < 24; b++) {
        for (let c = b + 1; c < 24; c++) {
          const total = met(a, b) + met(a, c) + met(b, c)

          if (met(a, b) > 0 && met(a, c) > 0 && met(b, c) > 0 && total > tripleMeetings) {
            triple = [a, b, c]
            tripleMeetings = total
          }
        }
      }
    }

    const tripleStudy = (links: Int16Array): { shares: number[]; allSixth: boolean; pure: boolean; pairings: number } => {
      const open = openOf(triple)
      const records = run(matter, links, open, BEATS).records
      let whole: Whole = basisWhole(triple, [0, 1, 2])
      const shares: number[] = [shareOf(whole)]
      let allSixth = exactSixth(whole)
      let pure = true
      const pairings = new Set<string>()

      for (const record of records) {
        whole = advanceWhole({ weave, whole, record, kernel4: kThird, fixed: false, forward: true })!

        const units = wholeUnits(whole)

        pure = pure && 27n * whole.weight.reduce((s, w) => s + w * w, 0n) === units * units

        if (record.meetings.length > 0) {
          for (const [a, b] of record.meetings) {
            pairings.add(`${Math.min(a, b)},${Math.max(a, b)}`)
          }

          shares.push(shareOf(whole))
          allSixth = allSixth && exactSixth(whole)
        }
      }

      return { shares, allSixth, pure, pairings: pairings.size }
    }

    const tripleFlat = tripleStudy(flatLinks)
    const tripleLive = tripleStudy(liveLinks)

    const sqrt7 = Math.sqrt(7)
    const ok =
      colorOk &&
      quantum.chance.length === 3 &&
      exact(quantum.chance[0] ?? 0, 1 / 4) &&
      exact(quantum.chance[1] ?? 0, 3 / 4) &&
      exact(quantum.chance[2] ?? 0, 1) &&
      exact(stochastic.chance[0] ?? 0, 1 / 4) &&
      exact(stochastic.chance[1] ?? 0, 3 / 8) &&
      exact(stochastic.chance[2] ?? 0, 7 / 16) &&
      fearOff.chance.every(c => c === 0) &&
      quantum.cancel.every(c => c > 0) &&
      stochastic.cancel.every(c => c === 0) &&
      Math.abs(bellQuantum - sqrt7) < 1e-6 &&
      separation > 0 &&
      bellOff <= 2 + 1e-9 &&
      bellStochastic <= 2 + 1e-9 &&
      triple.length === 3 &&
      tripleFlat.pairings === 3 &&
      tripleFlat.allSixth

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on flat links the pair made together reads (1, 0) with chance 1/4, 3/4, 1 after three meetings, with loves and fears cancelling at each, where the phase-free stand-in gives 1/4, 3/8, 7/16 and cancels none and the fear-off rule gives 0; one beat after its first meeting on live links, with its tokens in different cells, its CHSH value is sqrt 7 where the fear-off rule and the stand-in stay at 2; and a three-token whole keeps its singlet share at exactly 1/6 through every meeting on flat links, in all three pairings',
      metrics: {
        chanceAfterMeeting1: quantum.chance[0] ?? -1,
        chanceAfterMeeting2: quantum.chance[1] ?? -1,
        chanceAfterMeeting3: quantum.chance[2] ?? -1,
        cancelledWholesMeeting1: quantum.cancel[0] ?? -1,
        cancelledWholesMeeting2: quantum.cancel[1] ?? -1,
        cancelledWholesMeeting3: quantum.cancel[2] ?? -1,
        firstMeetingBeat: firstMeeting,
        readingBeat: firstMeeting + 1,
        tokenCellA: cellA,
        tokenCellB: cellB,
        tokenSeparation: separation,
        fearsAtReading,
        chshFearBeat: bellQuantum,
        chshPredicted: sqrt7,
        growerMeetings: growerBell.length,
        growerChshMax: Math.max(...growerBell),
        growerChshMin: Math.min(...growerBell),
        growerChshFinal: growerBell[growerBell.length - 1] ?? -1,
        growerMeetingsAbove2: growerBell.filter(v => v > 2 + 1e-9).length,
        singletUnits: 54,
        singletFears: Number(singletFears),
        tripleFirst: triple[0] ?? -1,
        tripleSecond: triple[1] ?? -1,
        tripleThird: triple[2] ?? -1,
        tripleMeetingsInSurvey: tripleMeetings,
        tripleFlatMeetings: tripleFlat.shares.length - 1,
        tripleFlatPairings: tripleFlat.pairings,
        tripleFlatSingletShareExactlySixth: tripleFlat.allSixth ? 1 : 0,
        tripleFlatPure: tripleFlat.pure ? 1 : 0,
        tripleLiveMeetings: tripleLive.shares.length - 1,
        tripleLivePure: tripleLive.pure ? 1 : 0,
        tripleLiveSingletShareMin: Math.min(...tripleLive.shares),
        tripleLiveSingletShareMax: Math.max(...tripleLive.shares),
        tripleLiveSingletShareFinal: tripleLive.shares[tripleLive.shares.length - 1] ?? -1,
        colorModeGatesPass: colorOk ? 1 : 0,
        colorChanceAfterMeeting1: colorQuantum[0] ?? -1,
        colorChanceAfterMeeting2: colorQuantum[1] ?? -1,
        colorChanceAfterMeeting3: colorQuantum[2] ?? -1,
        colorChsh: colorBell,
        colorStandInChance3: colorStandIn[2] ?? -1,
        colorFearOffChanceMin: Math.min(...colorOffChances),
        colorChshFearOff: colorBellOff,
        colorChshStandIn: colorBellStandIn,
      },
      control: {
        stochasticChance1: stochastic.chance[0] ?? -1,
        stochasticChance2: stochastic.chance[1] ?? -1,
        stochasticChance3: stochastic.chance[2] ?? -1,
        stochasticCancelledMax: Math.max(...stochastic.cancel),
        fearOffChanceMax: Math.max(...fearOff.chance),
        chshFearOff: bellOff,
        chshStochastic: bellStochastic,
      },
      notes:
        'L2. Chances and the singlet share are exact ratios of BigInt sums; the CHSH value is a floating-point see-saw (200 rounds from eight fixed golden-ratio starts), a lower bound on the maximum that meets the analytic sqrt 7 for this state. The stochastic stand-in is the swap phase with its phases dropped, which is the kernel a classical rule with a coin at each meeting would carry; it is not reversible. The tokens are read in different cells, but the rule is local and deterministic in its classical layer, so the witness is of the state the meeting made, not a loophole-free test. Positions stay classical: no witness here is in where a vibe goes. The triple is the cell-0 triple of the matter fill (golden ratio at 2.11) whose three pairs all meet in 480 beats, with the most meetings in total, found from one classical run. The grower pair (4, 20) is the one E-QTM-0099 found spending the most grain.',
    })
  },
})
