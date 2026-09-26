// The exchange phase of two identical vibes on the husk, and whether it ties to the double cover.
//
// In three dimensions the configuration space of two identical particles has fundamental group Z_2, so an
// exchange carries +1 or -1 and exchanging twice is the identity. Two routes in the model can exchange two
// vibes, and each is measured.
//
// 1. THE STREAM, UNDER THE SLOT. The fear walk on the 3D husk: an L^3 torus of husk docks, each beat the
//    coin C = [[a, b], [b, a]] (2 a = 1 + omega, 2 b = 1 - omega) and a stream along each husk axis in
//    the palindrome x y z z y x (the 3D form of the E-FRC-0176 plane walk, code/measure/identical-particles).
//    Two vibes, one per slot, with no interaction: the direct and the exchanged history enter with a
//    relative phase chi, the exchange phase. For each of the six units of Z[omega] as chi, every start
//    pair on L = 3 (54 slots, 1,431 starts) and L = 4 (128 slots, 8,128 starts), one beat, exact column
//    norms over 16^6. The exchange phase the model gives is the one that keeps every norm.
// 2. THE FEAR BEAT'S MEETING. Where two open tokens meet, the knit exchanges them and the fear beat moves
//    their roles by SWAP U(2 pi / 3) (code/rule/fear-weave, E-FRC-0158). Applied m = 1 to 6 times, through
//    the knit's own kernel (fearKernels, meetWhole), to the product role state |0 1>: the chance the first
//    token holds role 0 and the second role 1, and whether the whole equals the start or the start with
//    its two coordinates swapped.
// 3. THE TIE. The spin-statistics connection pairs the exchange sign with the sign of a 2 pi turn. The
//    committed knit's own turn lifts, over its palindromic schedule, to a net +1 (E-SPN-0044, cited, not
//    re-measured).
//
// PREDICTIONS, written before the run. Part 1: at every substep a dock holding both vibes sends them on
// with pair amplitude a^2 + chi b^2 (norm |1 - 3 chi|^2 / 16), so only chi = -1 keeps every norm, on both
// tori: the exchange phase is -1, and it is the same at every dock, axis and substep (the 3D rule is met,
// (-1)^2 = +1). Part 2: SWAP U = P_sym - omega P_anti, a sixth root on the antisymmetric part, so the
// return chances are 3/4, 1/4, 0, 1/4, 3/4, 1; one meeting squared is not the identity (chance 1/4), but
// three meetings are exactly the pure exchange (the whole equals the swapped start) and six the identity,
// the meeting being a cube root of the exchange whose cube is -1 on the antisymmetric pair. Part 3: -1
// against +1, no tie.
//
// GATES, fixed before the first run:
//   G1 part 1: on both tori chi = -1 keeps every start's norm exactly 16^6, and each other unit loses norm
//      on at least one start.
//   G2 part 2, the 3D rule on one meeting: two meetings return |0 1> with chance 1. PREDICTED TO FAIL (1/4).
//   G3 part 2, the cube root: the chances for m = 1 to 6 are exactly 3/4, 1/4, 0, 1/4, 3/4, 1, three
//      meetings give exactly the swapped start and six exactly the start.
//   G4 the tie: the exchange sign of part 1 equals the 2 pi turn sign of E-SPN-0044. PREDICTED TO FAIL.
// Status: pass if all hold, partial if only G2 and G4 fail, fail otherwise.
//
// Depth L2: the exchange phase is read off the model's coin and kernel exactly, through the unitarity the
// slot imposes; the rotation sign is cited.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fearKernels, meetWhole, type Whole } from '@/code/rule/fear-weave'
import {
  fractionValue,
  huskWalkColumns,
  pairNorm,
  pairParts,
  roleChance,
  twoRoleWhole,
} from '@/code/measure/identical-particles'

const UNITS = [1, 2, 3, -1, -2, -3]
const UNIT_NAMES: Record<number, string> = { 1: 'plusOne', 2: 'omega', 3: 'omegaSquared', [-1]: 'minusOne', [-2]: 'minusOmega', [-3]: 'minusOmegaSquared' }
const SIDES = [3, 4]
// E-SPN-0044: the net lift of the committed knit's turn over its palindromic schedule
const TURN_SIGN_E_SPN_0044: number = 1
const PREDICTED_RETURNS: readonly (readonly [bigint, bigint])[] = [
  [3n, 4n],
  [1n, 4n],
  [0n, 1n],
  [1n, 4n],
  [3n, 4n],
  [1n, 1n],
]

function huskScan(side: number) {
  const columns = huskWalkColumns({ side })
  const slots = 2 * side ** 3
  const full = 16 ** 6
  const exact = new Map<number, number>(UNITS.map(chi => [chi, 0]))
  let starts = 0
  let meetingStarts = 0

  for (let s1 = 0; s1 < slots; s1++) {
    for (let s2 = s1 + 1; s2 < slots; s2++) {
      const parts = pairParts({ columns, s1, s2, slots })

      starts++
      meetingStarts += parts.bunched.size > 0 ? 1 : 0

      for (const chi of UNITS) {
        if (pairNorm(parts, chi) === full) {
          exact.set(chi, (exact.get(chi) ?? 0) + 1)
        }
      }
    }
  }

  return { side, starts, meetingStarts, exact }
}

function meetings() {
  const kernels = fearKernels({ like: (2 * Math.PI) / 3, unlike: (2 * Math.PI) / 3 })

  if (!kernels) {
    throw new Error('no fear kernels')
  }

  const product = new Array<number>(9).fill(0)

  product[1] = 1

  const swappedProduct = new Array<number>(9).fill(0)

  swappedProduct[3] = 1

  const { whole: start } = twoRoleWhole([product])
  const { whole: swapped } = twoRoleWhole([swappedProduct])
  const proportional = (x: Whole, y: Whole): boolean => {
    const tx = x.weight.reduce((a, b) => a + b, 0n)
    const ty = y.weight.reduce((a, b) => a + b, 0n)

    return x.weight.every((w, i) => w * ty === (y.weight[i] ?? 0n) * tx)
  }
  let current: Whole = start
  const rows: { m: number; chance: { num: bigint; den: bigint }; isStart: boolean; isSwapped: boolean }[] = []

  for (let m = 1; m <= 6; m++) {
    const next = meetWhole({ whole: current, a: 0, b: 1, kernel4: kernels.like, divisor: kernels.likeDivisor, fixed: false })

    if (!next) {
      throw new Error('a meeting was refused')
    }

    current = next
    rows.push({ m, chance: roleChance(current, 0, 1), isStart: proportional(current, start), isSwapped: proportional(current, swapped) })
  }

  const fears = start.weight.filter(w => w < 0n).length

  return { rows, startFears: fears }
}

export default experiment({
  id: 'spin/exchange-phase-on-the-husk',
  code: 'E-SPN-0049',
  title:
    'the exchange phase on the husk, partial: two identical vibes on the 3D husk fear walk, one per slot, keep their norm on every start of two tori only when the exchanged history enters with -1, so the model gives -1 at every dock and axis and the 3D rule holds; the fear beat meeting is a cube root of the exchange (return chances 3/4, 1/4, 0, 1/4, 3/4, 1, exactly the pure exchange at three meetings), not an exchange itself; and the -1 does not tie to the double cover, whose 2 pi turn nets +1 on the knit',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const scans = SIDES.map(huskScan)
    const meet = meetings()

    const g1 = scans.every(s => s.exact.get(-1) === s.starts && UNITS.filter(chi => chi !== -1).every(chi => (s.exact.get(chi) ?? s.starts) < s.starts))
    const exchangeSign = g1 ? -1 : 0
    const second = meet.rows.find(r => r.m === 2)
    const g2 = second !== undefined && second.chance.num === second.chance.den
    const g3 =
      meet.rows.every((r, k) => {
        const [num, den] = PREDICTED_RETURNS[k] ?? [-1n, 1n]

        return r.chance.num * den === num * r.chance.den
      }) &&
      meet.rows.find(r => r.m === 3)?.isSwapped === true &&
      meet.rows.find(r => r.m === 6)?.isStart === true &&
      meet.rows.filter(r => r.m < 6).every(r => !r.isStart)
    const g4 = exchangeSign === TURN_SIGN_E_SPN_0044

    const status = g1 && g3 ? (g2 && g4 ? 'pass' : 'partial') : 'fail'
    const metrics: Record<string, number> = { exchangeSign, turnSignCited: TURN_SIGN_E_SPN_0044, productStateFearPoints: meet.startFears }

    for (const s of scans) {
      metrics[`side${s.side}Starts`] = s.starts
      metrics[`side${s.side}StartsWithAMeeting`] = s.meetingStarts

      for (const chi of UNITS) {
        metrics[`side${s.side}${UNIT_NAMES[chi]}ExactStarts`] = s.exact.get(chi) ?? -1
      }
    }

    for (const r of meet.rows) {
      metrics[`returnChanceAfter${r.m}Meetings`] = fractionValue(r.chance)
      metrics[`wholeIsSwappedStartAfter${r.m}`] = r.isSwapped ? 1 : 0
      metrics[`wholeIsStartAfter${r.m}`] = r.isStart ? 1 : 0
    }

    return verdict({
      status,
      claim:
        'on the 3D husk fear walk (L = 3 and 4, every start pair) the two-vibe map under one vibe per slot keeps every norm only for the exchange phase -1, the same at every dock, axis and substep; the fear beat meeting returns a product role state with chances 3/4, 1/4, 0, 1/4, 3/4, 1 over one to six meetings, the pure exchange at three and the start at six, so one meeting is a cube root of the exchange and fails the 3D rule on its own; and the -1 does not match the +1 net lift of the knit 2 pi turn (E-SPN-0044)',
      metrics,
      control: {
        g1ExchangeMinusOne: g1 ? 1 : 0,
        g2MeetingSquaredIdentity: g2 ? 1 : 0,
        g3CubeRoot: g3 ? 1 : 0,
        g4TieToDoubleCover: g4 ? 1 : 0,
      },
      notes:
        'L2. The exchange phase the model gives is -1, and the reason is structural: the slot has no configuration for two vibes in one slot, and the only relative phase between the direct and exchanged histories that keeps the two-vibe walk unitary is -1 (E-SPN-0047 proves it for any unitary coin, and here it is read on the 3D husk walk, where every one of the other five units of Z[omega] loses norm on some start). Since chi is a single number per pair of vibes, the same at every dock and axis, the exchange is path independent and squares to +1, as three dimensions require. The fear beat meeting is a different object. It carries the relative phase of the swap phase, and on the two exchange sectors it acts as 1 and -omega, a sixth root, so on its own it is not an exchange of identical particles in 3D (two meetings return a product state only a quarter of the time). Three meetings compose to exactly the pure exchange, SWAP U^3 = SWAP, whose sign on the antisymmetric pair is -1: the cube-root swap phase is literally a cube root of the exchange. It does not choose between the sectors, the slot does. THE TIE fails, as predicted: the knit is fermionic by exclusion while its 2 pi turn nets +1 over the palindromic schedule (E-SPN-0044, cited, not re-measured here), so the sign of the exchange is not the sign of a rotation. Exclusion here comes from the slot, as in a lattice gas, not from spin one half, and the spin-statistics connection stays open with the double cover. FIRST RUN: every number as predicted, G2 and G4 failing as the header said. On L = 3 every one of the 1,431 starts shares a dock within the beat (the torus is small), and each other unit keeps no start; on L = 4, 960 of 8,128 starts share a dock and every other unit loses norm on exactly those 960 and keeps the other 7,168, so the phase is set only where two vibes meet, as it must be. Limits: the 3D walk is the E-FRC-0176 construction extended to three axes, not a sector the committed knit runs, and one beat is read on each torus.',
    })
  },
})
