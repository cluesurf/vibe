// Exclusion in the dynamics: what in the knit keeps two identical vibes out of one state.
//
// E-SPN-0045 found exclusion in the signed weight (the fermion pair on the role grid needs fear, every fear
// on a coincident point, zero chance of a shared role). The roadmap asks for it in the DYNAMICS: two vibes
// launched at one point must never share a state, and something must enforce it. Four places are read.
//
// 1. THE KNIT. The cold weave (E-FLD-0032, code/rule/cold-weave): two loves, one beat from a common dock,
//    on every unordered pair of distinct directions (276), every phase of the 24-beat schedule and stores 0
//    and 1 (below and above the pair threshold), run 4 beats forward and 4 back on the side-5 D4 box.
//    Read: every slot's value at every beat, and the exact return. This is structural: a slot is one trit,
//    so a state with two vibes in one slot is not in the state space, and every move of the knit is a
//    permutation of slot contents. Nothing in the dynamics needs to act.
// 2. THE SLOT FORCES FERMI STATISTICS on the quantum walk of a lone vibe. The fear walk (a lone vibe's
//    amplitude, the swap phase on its slot) extended to two vibes with no interaction, one vibe per slot:
//    M_chi(s -> t) = U(t1, s1) U(t2, s2) + chi U(t2, s1) U(t1, s2) (code/measure/identical-particles). On
//    the 7-dock ring (14 slots, all 91 two-vibe starts) for 1 to 4 beats, the column norms are exact
//    whole numbers over 16^t, for each of the six units of Z[omega] as chi.
// 3. ANY COIN. The same for generic unitary coins of 2, 3, 4 and 6 slots (Weyl-generated, deterministic),
//    in floating point, and for the classical knit's coins, permutations with phases, as the control.
// 4. THE ROLES. The fear beat's own meeting kernel (fearKernels, meetWhole of code/rule/fear-weave, the
//    one E-FRC-0158 runs) applied 1 to 6 times to two-token wholes: the fermion pair (the uniform
//    antisymmetric mixture), each antisymmetric basis state, and the boson pair.
//
// PREDICTIONS, written before the run. Part 2: at a dock holding both vibes the one-vibe coin splits
// 1 : 3, the pair amplitude of the unbunched channel is a^2 + chi b^2, and its norm is |1 - 3 chi|^2 / 16:
// 16/16 only for chi = -1 (4, 13, 13, 7, 7 for 1, omega, omega^2, -omega, -omega^2). For any unitary coin,
// |a d| + |b c| = 1 = |a d - b c| makes a d and -b c point the same way, so the unbunched channel keeps the
// whole norm only with chi = -1: the determinant, the exterior square of U (Cauchy-Binet). Part 4: the
// swap phase commutes with the exchange, so it maps the antisymmetric subspace to itself.
//
// GATES, fixed before the first run:
//   G1 part 1: over all 13,248 starts no slot holds a value outside {-1, 0, 1} at any beat and every start
//      returns exactly.
//   G2 part 2: chi = -1 keeps every column norm exactly 16^t for t = 1 to 4 on all 91 starts; each other
//      unit fails on at least one start at every t; the same-dock start at t = 1 has norm |1 - 3 chi|^2
//      exactly for all six.
//   G3 part 2, a second computation: for every start and t, the chi = +1 norm plus the free bosons'
//      both-in-one-slot weight is exactly 16^t (the symmetric square is unitary).
//   G4 part 3: on 16 Weyl coins, chi = -1 departs from unit norm by under 1e-12 and every other sixth root
//      of unity by over 1e-3.
//   C1 control: on permutation coins with phases (the classical knit), every sixth root departs by under
//      1e-12, so a classical coin cannot select a statistics.
//   G5 part 4: the fermion pair, each antisymmetric basis state and the boson pair are returned unchanged,
//      exactly, by every meeting, with same-role chance 0, 0 and 1/2.
//
// Depth L2: known mathematics (Cauchy-Binet, the Pauli principle from antisymmetry) put to the model's own
// coin and meeting kernel, exact. Part 1 is L1, structural.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { coldBeat, coldBeatBack, makeColdWeave, type ColdState } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { weylUnitary } from '@/code/tool/weyl'
import { fearKernels, meetWhole, type Whole } from '@/code/rule/fear-weave'
import {
  bunchedNorm,
  composeColumns,
  denseCoinPairDeparture,
  fraction,
  pairNorm,
  pairParts,
  ringColumns,
  roleChance,
  twoRoleWhole,
  type Fraction,
} from '@/code/measure/identical-particles'

const RING_DOCKS = 7
const BEATS = [1, 2, 3, 4]
// the six units of Z[omega]: 1, omega, omega^2 and their negatives (codes of unitOf)
const UNITS = [1, 2, 3, -1, -2, -3]
const UNIT_NAMES: Record<number, string> = { 1: 'plusOne', 2: 'omega', 3: 'omegaSquared', [-1]: 'minusOne', [-2]: 'minusOmega', [-3]: 'minusOmegaSquared' }
const UNIT_ANGLE: Record<number, number> = { 1: 0, 2: (2 * Math.PI) / 3, 3: (4 * Math.PI) / 3, [-1]: Math.PI, [-2]: Math.PI + (2 * Math.PI) / 3, [-3]: Math.PI + (4 * Math.PI) / 3 }
const PREDICTED_SAME_DOCK: Record<number, number> = { 1: 4, 2: 13, 3: 13, [-1]: 16, [-2]: 7, [-3]: 7 }

// the E-FLD-0032 cold weave's spec, as fluids/cold-vacuum builds it
function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

function knitRuns(): { starts: number; outside: number; returned: number; meetings: number } {
  const side = 5
  const mesh = d4BoxMesh({ side })
  const weave = makeColdWeave({ mesh, spec: coldSpec() })
  const m = d4BoxCell({ coordinates: [2, 2, 2, 2], side })
  const n = mesh.cellCount * 24
  let starts = 0
  let outside = 0
  let returned = 0
  let meetings = 0

  for (let d = 0; d < 24; d++) {
    for (let e = d + 1; e < 24; e++) {
      for (let phase = 0; phase < 24; phase++) {
        for (const store of [0, 1]) {
          const start: ColdState = { vibe: new Int8Array(n), store: new Int32Array(n), demon: new Int32Array(mesh.cellCount * 12) }

          start.vibe[mesh.neighbour(m, mesh.opposite(d)) * 24 + d] = 1
          start.store[mesh.neighbour(m, mesh.opposite(d)) * 24 + d] = store
          start.vibe[mesh.neighbour(m, mesh.opposite(e)) * 24 + e] = 1
          start.store[mesh.neighbour(m, mesh.opposite(e)) * 24 + e] = store

          let s = start

          for (let t = 0; t < 4; t++) {
            s = coldBeat(weave, s, phase + t)

            for (let i = 0; i < n; i++) {
              const v = s.vibe[i] ?? 0

              if (v < -1 || v > 1) {
                outside++
              }
            }

            // after the first beat both loves sit in dock m: they meet there
            if (t === 0 && s.vibe[m * 24 + d] === 1 && s.vibe[m * 24 + e] === 1) {
              meetings++
            }
          }

          for (let t = 3; t >= 0; t--) {
            s = coldBeatBack(weave, s, phase + t)
          }

          const same = s.vibe.every((v, i) => v === start.vibe[i]) && s.store.every((v, i) => v === start.store[i]) && s.demon.every(v => v === 0)

          starts++
          returned += same ? 1 : 0
        }
      }
    }
  }

  return { starts, outside, returned, meetings }
}

function ringTheorem() {
  const slots = 2 * RING_DOCKS
  const one = ringColumns(RING_DOCKS)
  let columns = one
  const rows: { t: number; chi: number; exact: number; sameDock: number }[] = []
  let identityHolds = true
  let identityChecks = 0

  for (const t of BEATS) {
    if (t > 1) {
      columns = composeColumns(columns, one)
    }

    const full = 16 ** t
    const parts: ReturnType<typeof pairParts>[] = []

    for (let s1 = 0; s1 < slots; s1++) {
      for (let s2 = s1 + 1; s2 < slots; s2++) {
        parts.push(pairParts({ columns, s1, s2, slots }))
      }
    }

    for (const p of parts) {
      identityChecks++
      identityHolds = identityHolds && pairNorm(p, 1) + bunchedNorm(p) === full
    }

    for (const chi of UNITS) {
      const exact = parts.filter(p => pairNorm(p, chi) === full).length
      // the same-dock start: slots 0 and 1 of dock 0
      const sameDock = pairNorm(pairParts({ columns, s1: 0, s2: 1, slots }), chi)

      rows.push({ t, chi, exact, sameDock })
    }
  }

  return { rows, starts: (slots * (slots - 1)) / 2, identityHolds, identityChecks }
}

function coinScan() {
  const sizes = [2, 3, 4, 6]
  const generic = sizes.flatMap(k =>
    [1, 2, 3, 4].map(start => {
      const u = weylUnitary({ dimension: k, start: 1000 * k + start })

      return Object.fromEntries(UNITS.map(chi => [chi, denseCoinPairDeparture({ re: u.re, im: u.im, theta: UNIT_ANGLE[chi] ?? 0 })])) as Record<number, number>
    }),
  )
  // permutation coins: slot s -> slot (s + shift) mod k with phase omega^(s mod 3), the classical knit's
  // moves carrying a phase
  const permutation = sizes.flatMap(k =>
    [1, 2].map(shift => {
      const re = Array.from({ length: k }, () => new Array<number>(k).fill(0))
      const im = Array.from({ length: k }, () => new Array<number>(k).fill(0))

      for (let s = 0; s < k; s++) {
        const angle = ((2 * Math.PI) / 3) * (s % 3)
        const row = re[(s + shift) % k] ?? []
        const rowIm = im[(s + shift) % k] ?? []

        row[s] = Math.cos(angle)
        rowIm[s] = Math.sin(angle)
      }

      return Object.fromEntries(UNITS.map(chi => [chi, denseCoinPairDeparture({ re, im, theta: UNIT_ANGLE[chi] ?? 0 })])) as Record<number, number>
    }),
  )

  return { generic, permutation }
}

// the chance both tokens hold one role, exactly
function sameRole(whole: Whole): Fraction {
  return [0, 1, 2]
    .map(i => roleChance(whole, i, i))
    .reduce((sum, p) => fraction(sum.num * p.den + p.num * sum.den, sum.den * p.den), fraction(0n, 1n))
}

function roleMeetings() {
  const kernels = fearKernels({ like: (2 * Math.PI) / 3, unlike: (2 * Math.PI) / 3 })

  if (!kernels) {
    throw new Error('no fear kernels')
  }

  const r = Math.SQRT1_2
  const basis = (entries: readonly (readonly [number, number])[]): number[] => {
    const a = new Array<number>(9).fill(0)

    for (const [index, value] of entries) {
      a[index] = value
    }

    return a
  }
  const anti = [
    basis([[1, r], [3, -r]]),
    basis([[2, r], [6, -r]]),
    basis([[5, r], [7, -r]]),
  ]
  const sym = [
    basis([[0, 1]]),
    basis([[4, 1]]),
    basis([[8, 1]]),
    basis([[1, r], [3, r]]),
    basis([[2, r], [6, r]]),
    basis([[5, r], [7, r]]),
  ]
  const cases = [
    { name: 'fermionPair', states: anti },
    ...anti.map((s, k) => ({ name: `antisymmetric${k}`, states: [s] })),
    { name: 'bosonPair', states: sym },
  ]

  return cases.map(c => {
    const { whole, units } = twoRoleWhole(c.states)
    const start = sameRole(whole)
    let current: Whole = whole
    let unchanged = true
    let sameRoleZeroEvery = true

    for (let m = 0; m < 6; m++) {
      const next = meetWhole({ whole: current, a: 0, b: 1, kernel4: kernels.like, divisor: kernels.likeDivisor, fixed: false })

      if (!next) {
        unchanged = false
        break
      }

      // compare as distributions: reduce both by their totals
      const total = next.weight.reduce((a, b) => a + b, 0n)

      unchanged = unchanged && next.weight.every((w, i) => w * units === (whole.weight[i] ?? 0n) * total)

      const p = sameRole(next)

      sameRoleZeroEvery = sameRoleZeroEvery && p.num === 0n
      current = next
    }

    const loves = whole.weight.filter(w => w > 0n).reduce((a, b) => a + b, 0n)
    const fears = -whole.weight.filter(w => w < 0n).reduce((a, b) => a + b, 0n)

    return { name: c.name, units, loves, fears, unchanged, sameRoleStart: Number(start.num) / Number(start.den), sameRoleZeroEvery }
  })
}

export default experiment({
  id: 'spin/exclusion-in-the-dynamics',
  code: 'E-SPN-0047',
  title:
    'exclusion in the dynamics is the slot: a slot is one trit, so no start of the cold weave ever puts two vibes in one slot and nothing in the knit has to act, and the fear walk extended to two vibes under that rule keeps its norm only when the exchanged history enters with -1 (norm |1 - 3 chi|^2 / 16 at a shared dock, exact on all 91 ring starts for 1 to 4 beats and on generic coins, never on a classical permutation coin, which accepts every phase), so the slot plus a free coin forces Fermi statistics, and the fear beat keeps the antisymmetric role pair antisymmetric',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const knit = knitRuns()
    const ring = ringTheorem()
    const coins = coinScan()
    const roles = roleMeetings()

    const g1 = knit.outside === 0 && knit.returned === knit.starts
    const g2 =
      BEATS.every(t => ring.rows.find(r => r.t === t && r.chi === -1)?.exact === ring.starts) &&
      BEATS.every(t => UNITS.filter(chi => chi !== -1).every(chi => (ring.rows.find(r => r.t === t && r.chi === chi)?.exact ?? ring.starts) < ring.starts)) &&
      UNITS.every(chi => ring.rows.find(r => r.t === 1 && r.chi === chi)?.sameDock === PREDICTED_SAME_DOCK[chi])
    const g3 = ring.identityHolds
    const g4 = coins.generic.every(c => (c[-1] ?? 1) < 1e-12 && UNITS.filter(chi => chi !== -1).every(chi => (c[chi] ?? 0) > 1e-3))
    const c1 = coins.permutation.every(c => UNITS.every(chi => (c[chi] ?? 1) < 1e-12))
    const g5 = roles.every(r => r.unchanged) && roles.filter(r => r.name !== 'bosonPair').every(r => r.sameRoleZeroEvery && r.sameRoleStart === 0) && Math.abs((roles.find(r => r.name === 'bosonPair')?.sameRoleStart ?? 0) - 0.5) < 1e-12
    const ok = g1 && g2 && g3 && g4 && c1 && g5

    const metrics: Record<string, number> = {
      knitStarts: knit.starts,
      knitValuesOutsideTrit: knit.outside,
      knitExactReturns: knit.returned,
      knitMeetingsAtTheDock: knit.meetings,
      ringStarts: ring.starts,
      symmetricSquareIdentityChecks: ring.identityChecks,
    }

    for (const row of ring.rows) {
      metrics[`ringT${row.t}${UNIT_NAMES[row.chi]}ExactStarts`] = row.exact

      if (row.t === 1) {
        metrics[`sameDockNormSixteenths${UNIT_NAMES[row.chi]}`] = row.sameDock
      }
    }

    const worst = (list: Record<number, number>[], chi: number, pick: (a: number, b: number) => number, start: number): number =>
      list.reduce((acc, c) => pick(acc, c[chi] ?? start), start)

    metrics.genericMinusOneWorstDeparture = worst(coins.generic, -1, Math.max, 0)
    UNITS.filter(chi => chi !== -1).forEach(chi => {
      metrics[`generic${UNIT_NAMES[chi]}SmallestDeparture`] = Number(worst(coins.generic, chi, Math.min, 99).toFixed(6))
    })
    roles.forEach(r => {
      metrics[`${r.name}Units`] = Number(r.units)
      metrics[`${r.name}Fears`] = Number(r.fears)
      metrics[`${r.name}SameRole`] = r.sameRoleStart
      metrics[`${r.name}UnchangedBySixMeetings`] = r.unchanged ? 1 : 0
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'no start of the cold weave puts two vibes in one slot and every start returns exactly; on the fear ring the two-vibe walk under the one-vibe-per-slot rule keeps its norm on every start for 1 to 4 beats only with chi = -1, the shared-dock norm is |1 - 3 chi|^2 / 16 exactly, the +1 norm plus the free bosons in-one-slot weight is exactly 1, generic unitary coins select chi = -1 alone while classical permutation coins accept every phase, and the fear beat returns the fermion pair, each antisymmetric state and the boson pair unchanged with same-role chances 0, 0 and 1/2',
      metrics,
      control: Object.fromEntries([
        ...UNITS.map(chi => [`permutationCoin${UNIT_NAMES[chi]}WorstDeparture`, worst(coins.permutation, chi, Math.max, 0)]),
        ['g1Knit', g1 ? 1 : 0],
        ['g2RingTheorem', g2 ? 1 : 0],
        ['g3SymmetricSquare', g3 ? 1 : 0],
        ['g4GenericCoins', g4 ? 1 : 0],
        ['c1PermutationCoins', c1 ? 1 : 0],
        ['g5Roles', g5 ? 1 : 0],
      ]),
      notes:
        'L2, with part 1 L1. WHAT ENFORCES EXCLUSION: the slot, and nothing else. A slot is one trit (fear, calm or love), every move of the knit permutes slot contents, and so a configuration with two vibes in one slot is not in the state space: nothing in the dynamics has to act, and part 1 only confirms it (every value a trit, every start back exactly). That is exclusion of the classical kind, for every vibe whatever its kind: a love and a fear cannot share a slot either. What the slot does to a QUANTUM two-vibe walk is the real content. The fear walk is the model amplitude for a lone vibe. Two vibes that do not interact, under one vibe per slot, have a map built from the one-vibe coin with the exchanged history entering at a relative phase chi. The history that sends both into one slot has no configuration, so unitarity needs the unbunched channel to carry the whole norm, and that happens exactly when chi = -1: the determinant, the exterior square. So the slot plus a free coin gives FERMI statistics, not hard-core bosons, and on the fear coin every other phase loses a computable share: 3/4 for +1 (the bosons of E-SPN-0046), 3/16 for omega, 9/16 for -omega. A classical coin (a permutation, the committed knit) never sends two vibes into one slot, so it accepts every phase and cannot select a statistics: the statistics come from the fear beat being a genuine splitter. The roles: the fear beat at a like meeting is SWAP U(2 pi / 3) = P_sym - omega P_anti, which commutes with the exchange, so antisymmetric role states stay antisymmetric through every meeting and two tokens never share a role, while the boson pair keeps its 1/2. Transport across links is a separate question: two tokens at different docks cross different grid moves, and whether they then hold the same role depends on the frame, so the role statement is made at one dock. FIRST RUN: every gate held as written. On the ring the phases other than -1 keep norm only on starts whose vibes never share a dock within t beats (84, 56, 28, 0 of 91 at t = 1 to 4, the same count for all five), and generic coins miss by at least 0.078 (omega) to 0.31 (+1). The fermion pair whole is 54 units with 18 fears, a second computation of E-SPN-0045 through the fear weave phase points. The run takes 1,440 s, almost all of it the 13,248 knit starts on the side-5 box. Limits: the two-vibe quantum walk is the fear walk extended by the slot, not a sector the committed knit already runs, since positions are classical in the fear weave.',
    })
  },
})
