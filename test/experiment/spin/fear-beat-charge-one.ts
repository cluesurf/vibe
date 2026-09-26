// Which charge-one cluster can the fear beat bind, and what is its spin?
//
// E-SPN-0069 found that the fear beat's meetings bind two STAND-IN tokens, but only in the channels where a meeting
// is not the identity: two loves when their roles are antisymmetric (U = omega there), a love and a fear in the meson
// singlet Phi (V = omega there). E-SPN-0060 found the natural spin one half first in four loves and a fear, and
// E-SPN-0067 that Pauli with a role-blind binding puts the lightest Q = 1 level in a one-dimensional character. The
// fear beat is NOT role-blind, so this file asks, channel by channel, what its meetings see inside the two smallest
// Q = 1 clusters, the three loves (3, 0) and (4, 1), and then runs the three loves.
//
// THE ARGUMENT, before any number. Every meeting commutes with the turns (2T) and the color frame (it is built from
// SWAP and from Phi, both invariant), so each 2T channel of the neutral space is kept by every meeting. Inside a
// channel, a meeting acts through its pair content: U_ij = 1 + (omega - 1) P_anti(ij) and V_i = 1 + (omega - 1)
// P_Phi(i, fear). So a channel with no antisymmetric love pair feels no like meeting, and a channel with no singlet
// love-fear pair feels no unlike meeting: there the fear is EXACTLY free. The shares are traces of characters.
//
// PREDICTIONS. (Written before this file ran; tmp/mb-probe-shares.ts printed the shares first, so H1's values are
// readings and the prediction is the argument above.)
// P1 (3, 0): the determinant channel (lambda x [1,1,1]) has every love pair antisymmetric (share 1: every meeting is
//    omega) and the twisted doublet (x [3]) none (share 0: no meeting acts at all). (4, 1): the antisymmetric share
//    of a channel in S4 irrep mu is (1 - chi_mu(transposition) / d_mu) / 2 (1/2 on the natural doublet's [2,2], 2/3
//    on lambda's [2,1,1]); the natural doublet's singlet share is 0, so every love-fear meeting is the identity on
//    the electron channel, while lambda's is positive.
// P2 Explicitly: the singlet projector on (love i, fear) annihilates the natural 2T channel of (4, 1) for all four
//    loves, a 4-dimensional space.
// P3 Three loves reduce exactly: with roles in the determinant the full rule's positions equal a scalar run with
//    phase omega at every meeting; with roles in the twisted doublet, a scalar run with phase 1.
// P4 The determinant channel binds three loves (fermions: slots and docks symmetric, a STAND-IN run on a ring of 24
//    from docks 0, 0, 1 in distinct slots): the chance all three lie within 4 docks, averaged over beats 48 to 96,
//    is at least 0.3 and at least twice that of the same start with no meeting.
// P5 Start ensemble: with each of the 17 members' links on a ring of 12 and the fixed-frame beat, the determinant
//    channel's positions equal the no-field run for 5 beats (before any token can wrap) to 1e-12.
//
// Gates: H1 = P1 (to 1e-9), H2 = P2 (norm under 1e-12), H3 = P3 (1e-12), H4 = P4, H5 = P5. Status pass if all hold.
//
// Depth: L1 for the channel algebra, L2 for the STAND-IN three-token run.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { applyToCluster, binaryTetrahedralCharacters, heisenbergGroup, spinTurns } from '@/code/algebra/role-cluster'
import { channelShares } from '@/code/measure/cluster-pairs'
import { irrepsOf, partitionName } from '@/code/measure/pauli-cluster'
import { symmetrizedStart, tripleRun, type Complex, type TripleStart } from '@/code/measure/token-triple-run'
import { type M3 } from '@/code/measure/token-pair-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'

const OMEGA: Complex = [-0.5, Math.sqrt(3) / 2]
const ONE: Complex = [1, 0]
const TRIMER_RING = 24
const REDUCTION_RING = 6
const REDUCTION_BEATS = 10
const ENSEMBLE_RING = 12
const ENSEMBLE_BEATS = 5
const NEAR = 4

// the determinant (antisymmetric) and a twisted-doublet (symmetric neutral) role state of three loves
const EPSILON: { j: [number, number, number]; amp: number }[] = [
  [0, 1, 2, 1],
  [1, 2, 0, 1],
  [2, 0, 1, 1],
  [1, 0, 2, -1],
  [0, 2, 1, -1],
  [2, 1, 0, -1],
].map(([a, b, c, s]) => ({ j: [a, b, c] as [number, number, number], amp: (s as number) / Math.sqrt(6) }))
const DOUBLET: { j: [number, number, number]; amp: number }[] = [0, 1, 2].map(k => ({ j: [k, k, k] as [number, number, number], amp: 1 / Math.sqrt(3) }))

function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

export default experiment({
  id: 'spin/fear-beat-charge-one',
  code: 'E-SPN-0070',
  title:
    'the fear beat cannot see the electron channel, fail on the trimer gate: every meeting keeps each 2T channel and acts through its pair content, and in (4, 1) the natural spin one half holds no meson-singlet love-fear pair (singlet share 0, the projector annihilates all 4 dimensions to 2e-15), so its fear is exactly free; in (3, 0) only the determinant (2 pi sign +1) feels meetings (every pair antisymmetric) and the twisted doublet feels none; three STAND-IN loves in the determinant from distinct slots stay compact 0.232 against 0.136 without meetings (gate 2 times fails), falling as 1/L as a bound pair with a free third, while from one dock a three-love bound state holds about 0.2 at every ring size',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- H1: channel shares ----
    const three = channelShares({ roles: 3, antiroles: 0 })
    const five = channelShares({ roles: 4, antiroles: 1 })
    const s4 = irrepsOf(4)
    const expectedAnti = (partition: string): number => {
      const mu = s4.find(i => partitionName(i.partition) === partition)!

      return (1 - (mu.values['2,1,1'] ?? 0) / mu.dimension) / 2
    }
    const det30 = three.shares.find(s => s.partition === '[1,1,1]')
    const doublet30 = three.shares.find(s => s.partition === '[3]')
    const natural41 = five.shares.find(s => s.spin === 'natural')
    const lambda41 = five.shares.find(s => s.spin === 'lambda')
    const h1 =
      three.rank === 3 &&
      five.rank === 27 &&
      Math.abs((det30?.antisymmetricShare ?? 0) - 1) < 1e-9 &&
      det30?.twoPiSign === 1 &&
      Math.abs(doublet30?.antisymmetricShare ?? 1) < 1e-9 &&
      doublet30?.twoPiSign === -1 &&
      five.shares.every(s => Math.abs(s.antisymmetricShare - expectedAnti(s.partition)) < 1e-9) &&
      Math.abs(natural41?.singletShare ?? 1) < 1e-9 &&
      (lambda41?.singletShare ?? 0) > 1e-3

    log('h1')

    // ---- H2: the singlet projector annihilates the natural channel of (4, 1) ----
    const { turns, lambda } = spinTurns()
    const natural = binaryTetrahedralCharacters({ turns, lambda }).find(c => c.name === 'natural')!
    const group = heisenbergGroup()
    const size = 3 ** 5
    const project = (v: { re: Float64Array; im: Float64Array }): { re: Float64Array; im: Float64Array } => {
      // the color projector, then the natural 2T isotypic projector (2 / 24) sum conj(chi(e)) R(e)
      const colored = { re: new Float64Array(size), im: new Float64Array(size) }

      for (const h of group) {
        const hv = applyToCluster({ vector: v, unitary: h, roles: 4, antiroles: 1 })

        for (let k = 0; k < size; k++) {
          colored.re[k] = (colored.re[k] as number) + (hv.re[k] as number) / group.length
          colored.im[k] = (colored.im[k] as number) + (hv.im[k] as number) / group.length
        }
      }

      const out = { re: new Float64Array(size), im: new Float64Array(size) }

      turns.forEach((t, i) => {
        const rv = applyToCluster({ vector: colored, unitary: t.unitary as ComplexMatrix, roles: 4, antiroles: 1 })
        const chi = natural.values[i] ?? [0, 0]
        const cr = (2 / turns.length) * chi[0]
        const ci = (-2 / turns.length) * chi[1]

        for (let k = 0; k < size; k++) {
          out.re[k] = (out.re[k] as number) + cr * (rv.re[k] as number) - ci * (rv.im[k] as number)
          out.im[k] = (out.im[k] as number) + cr * (rv.im[k] as number) + ci * (rv.re[k] as number)
        }
      })

      return out
    }
    const naturalVectors: { re: Float64Array; im: Float64Array }[] = []

    for (let i = 0; i < size && naturalVectors.length < 4; i++) {
      const e = { re: new Float64Array(size), im: new Float64Array(size) }

      e.re[i] = 1

      const p = project(e)

      for (const b of naturalVectors) {
        let cr = 0
        let ci = 0

        for (let k = 0; k < size; k++) {
          cr += (b.re[k] as number) * (p.re[k] as number) + (b.im[k] as number) * (p.im[k] as number)
          ci += (b.re[k] as number) * (p.im[k] as number) - (b.im[k] as number) * (p.re[k] as number)
        }

        for (let k = 0; k < size; k++) {
          const br = b.re[k] as number
          const bi = b.im[k] as number

          p.re[k] = (p.re[k] as number) - (cr * br - ci * bi)
          p.im[k] = (p.im[k] as number) - (cr * bi + ci * br)
        }
      }

      let n = 0

      for (let k = 0; k < size; k++) n += (p.re[k] as number) ** 2 + (p.im[k] as number) ** 2

      n = Math.sqrt(n)

      if (n > 1e-6) naturalVectors.push({ re: p.re.map(x => x / n), im: p.im.map(x => x / n) })
    }

    // the singlet projector on (love i, the fear): (P v)_(jj) = (1/3) sum_k v_(kk)
    const singletNorm = (v: { re: Float64Array; im: Float64Array }, love: number): number => {
      const s0 = 3 ** (4 - love)
      const sa = 1
      let total = 0

      for (let i = 0; i < size; i++) {
        const d0 = Math.floor(i / s0) % 3
        const da = i % 3

        if (d0 !== da) continue

        const base = i - d0 * s0 - da * sa
        let sr = 0
        let si = 0

        for (let k = 0; k < 3; k++) {
          sr += v.re[base + k * s0 + k * sa] as number
          si += v.im[base + k * s0 + k * sa] as number
        }

        total += (sr / 3) ** 2 + (si / 3) ** 2
      }

      return Math.sqrt(total)
    }
    const naturalSinglet = Math.max(...naturalVectors.flatMap(v => [0, 1, 2, 3].map(love => singletNorm(v, love))))
    // control: a lambda-channel vector does have a singlet part (the same projector, lambda's character)
    const h2 = naturalVectors.length === 4 && naturalSinglet < 1e-12

    log('h2')

    // ---- H3: the reduction of three loves ----
    const reductionStart = (role: typeof EPSILON, sign: 1 | -1): TripleStart[] => symmetrizedStart({ x: [2, 2, 3], c: [0, 1, 1], sign, role })
    const scalarStart = (sign: 1 | -1): TripleStart[] => symmetrizedStart({ x: [2, 2, 3], c: [0, 1, 1], sign })
    const reductionGap = (role: typeof EPSILON, sign: 1 | -1, phase: Complex): number => {
      const full = tripleRun({ ring: REDUCTION_RING, roles: 27, start: reductionStart(role, sign) })
      const scalar = tripleRun({ ring: REDUCTION_RING, roles: 1, phase, start: scalarStart(sign) })
      let gap = 0

      for (let t = 0; t < REDUCTION_BEATS; t++) {
        full.beat()
        scalar.beat()

        const a = full.positionWeights()
        const b = scalar.positionWeights()

        gap = Math.max(gap, ...a.map((x, i) => Math.abs(x - (b[i] as number))))
      }

      return gap
    }
    // fermions: the determinant pairs with symmetric slots and docks; the doublet with antisymmetric ones
    const epsilonGap = reductionGap(EPSILON, 1, OMEGA)
    const doubletGap = reductionGap(DOUBLET, -1, ONE)
    // control: the determinant with phase 1 is NOT its run (the reduction can fail)
    const epsilonAsFree = reductionGap(EPSILON, 1, ONE)
    const h3 = epsilonGap < 1e-12 && doubletGap < 1e-12 && epsilonAsFree > 1e-6

    log('h3')

    // ---- H4: the determinant triple binds ----
    const trimer = (phase: Complex): { mean: number; late: number } => {
      const run = tripleRun({ ring: TRIMER_RING, roles: 1, phase, start: symmetrizedStart({ x: [0, 0, 1], c: [0, 1, 1], sign: 1 }) })
      const T = 4 * TRIMER_RING
      let sum = 0
      let n = 0
      let late = 0

      for (let t = 0; t < T; t++) {
        run.beat()

        if (t >= T / 2) {
          const w = run.compactWeight(NEAR)

          sum += w
          n++
          late = w
        }
      }

      return { mean: sum / n, late }
    }
    const bound = trimer(OMEGA)
    const free = trimer(ONE)
    const h4 = bound.mean >= 0.3 && bound.mean >= 2 * free.mean

    // REPORTED, added after the first run (not gated): the compact chance against the ring's size for two starts,
    // fitted to a + b / L (a three-love bound state gives a > 0; a bound pair with a free third love gives a near 0,
    // since the third love is then within reach with chance about (2 near + 1) / L)
    const sizes = [16, 24, 32]
    const scaling = (x: readonly [number, number, number], c: readonly [number, number, number]): { values: number[]; a: number; b: number; check: number } => {
      const values = sizes.map(L => {
        const run = tripleRun({ ring: L, roles: 1, phase: OMEGA, start: symmetrizedStart({ x, c, sign: 1 }) })
        const T = 4 * L
        let sum = 0
        let n = 0

        for (let t = 0; t < T; t++) {
          run.beat()

          if (t >= T / 2) {
            sum += run.compactWeight(NEAR)
            n++
          }
        }

        return sum / n
      })
      // fit on the two largest rings, check on the smallest
      const [v16, v24, v32] = values as [number, number, number]
      const b = (v24 - v32) / (1 / 24 - 1 / 32)
      const a = v32 - b / 32

      return { values, a, b, check: a + b / 16 - v16 }
    }
    const distinctSlots = scaling([0, 0, 1], [0, 1, 1])
    const oneDock = scaling([0, 0, 0], [0, 1, 1])

    log('h4 scaling')

    // ---- H5: the start ensemble ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const ensemble = startFamily(16).map(member => {
      const links = Array.from({ length: ENSEMBLE_RING }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      const start = symmetrizedStart({ x: [4, 4, 5], c: [0, 1, 1], sign: 1, role: EPSILON })
      const field = tripleRun({ ring: ENSEMBLE_RING, roles: 27, links, start })
      const plain = tripleRun({ ring: ENSEMBLE_RING, roles: 27, start })
      let gap = 0

      for (let t = 0; t < ENSEMBLE_BEATS; t++) {
        field.beat()
        plain.beat()

        const a = field.positionWeights()
        const b = plain.positionWeights()

        gap = Math.max(gap, ...a.map((x, i) => Math.abs(x - (b[i] as number))))
      }

      return { member: member.name, gap }
    })
    const h5 = ensemble.every(e => e.gap < 1e-12)

    log('h5')

    const ok = h1 && h2 && h3 && h4 && h5
    const shareText = (s: (typeof five.shares)[number]): string => `${s.spin} (2 pi ${s.twoPiSign > 0 ? '+' : '-'}) ${s.partition} dim ${s.dimension.toFixed(0)}: love pair antisymmetric ${s.antisymmetricShare.toFixed(4)}, love-fear singlet ${s.singletShare.toFixed(4)}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `(3, 0): ${three.shares.map(shareText).join('; ')}; (4, 1): ${five.shares.map(shareText).join('; ')}; the singlet projector on each love and the fear annihilates the 4-dimensional natural channel (largest norm ${naturalSinglet.toExponential(1)}), so in the electron channel every love-fear meeting is the identity and the fear is exactly free; three loves in the determinant run as a scalar walk with phase omega at every meeting (gap ${epsilonGap.toExponential(1)}), in the twisted doublet as one with no meeting (${doubletGap.toExponential(1)}); the determinant triple stays within 4 docks with chance ${bound.mean.toFixed(3)} over beats 48 to 96 on a ring of 24 against ${free.mean.toFixed(3)} with no meeting; with the 17 members' links the determinant triple's motion is unchanged before any token can wrap (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        gate_H4: h4 ? 1 : 0,
        gate_H5: h5 ? 1 : 0,
        ...Object.fromEntries(three.shares.flatMap(s => [[`s30_${s.spin}_${s.partition}_antisym`, s.antisymmetricShare]])),
        ...Object.fromEntries(five.shares.flatMap(s => [[`s41_${s.spin}_${s.partition}_antisym`, s.antisymmetricShare], [`s41_${s.spin}_${s.partition}_singlet`, s.singletShare]])),
        naturalChannelDimension: naturalVectors.length,
        naturalSingletNorm: naturalSinglet,
        reductionGapDeterminant: epsilonGap,
        reductionGapDoublet: doubletGap,
        trimerCompact: bound.mean,
        trimerCompactLast: bound.late,
        ...Object.fromEntries(distinctSlots.values.map((v, i) => [`distinctSlotsCompactRing${sizes[i]}`, v])),
        distinctSlotsFitA: distinctSlots.a,
        distinctSlotsFitB: distinctSlots.b,
        distinctSlotsFitCheck16: distinctSlots.check,
        ...Object.fromEntries(oneDock.values.map((v, i) => [`oneDockCompactRing${sizes[i]}`, v])),
        oneDockFitA: oneDock.a,
        oneDockFitB: oneDock.b,
        oneDockFitCheck16: oneDock.check,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        determinantRunAsFreeGap: epsilonAsFree,
        trimerCompactNoMeeting: free.mean,
        uniformCompact: ((2 * NEAR + 1) / TRIMER_RING) ** 2,
      },
      notes: `L2 (L1 for the channel algebra; the three-token run is a STAND-IN). Gates H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}. FIRST RUN (4.6 s), recorded as is: fail on H4 alone. From docks 0, 0, 1 in distinct slots the determinant triple stays compact with chance 0.232 against 0.136 with no meeting (1.7 times, gate 2 times and 0.3). Gate not moved. A probe after the run (tmp/mb-probe-trimer.ts) and the reported scaling here read why: from that start the compact chance falls as 1/L (${distinctSlots.values.map(v => v.toFixed(3)).join(', ')} on rings 16, 24, 32; fit a = ${distinctSlots.a.toFixed(3)}, b = ${distinctSlots.b.toFixed(2)}, off by ${distinctSlots.check.toFixed(3)} at 16): a bound love pair (the diquark of E-SPN-0069) with a free third love, and no overlap with a three-love bound state; from all three on one dock (two in one slot, which the stand-in allows and the knit's one-vibe-per-slot rule would not) it tends to ${oneDock.a.toFixed(3)} (values ${oneDock.values.map(v => v.toFixed(3)).join(', ')}; fit off by ${oneDock.check.toFixed(3)} at 16), so a three-love bound state exists in the determinant channel but a start that respects the slot rule does not reach it on this line. Ensemble gaps: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. DISCLOSED: tmp/mb-probe-shares.ts printed the channel shares before this file was written; the title was rewritten after the runs. MEANING: the fear beat reads the role, and what it reads decides the answer. The (3, 0) triple can be bound only in its determinant channel (a one-dimensional 2T character, 2 pi sign +1, a spin singlet); its twisted doublet, the piece of spin 3/2, feels no meeting at all. In (4, 1) the natural doublet, the electron-like spin one half, holds no meson-singlet love-fear pair, so the fear beat never touches its fear: whatever binds the four loves, the fear is free. The channel lambda x [2,1,1], E-SPN-0067's Pauli ground, is the one where every kind of meeting acts (love pairs 2/3 antisymmetric, love-fear pairs 1/3 singlet). So under the only interaction the model has at a meeting, the only Q = 1 channels the fear beat can bind are the determinant triple (odd fermion number, the rotation sign of a boson; bound as three only from a start the slot rule forbids on a line) and (4, 1) channels other than the natural doublet; the electron is not derived, and the reason is exact: its channel is the one the fear beat cannot see. What would change it: an interaction that reads the love-fear pair outside Phi (the string does, through the flux, E-FRC-0129), or a moving love whose role is locked to the doublet (E-SPN-0066), which changes the channels.`,
    })
  },
})
