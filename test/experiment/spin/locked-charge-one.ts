// The lightest bound charge-one state of LOCKED tokens under the fear beat: three loves, and none bind as three.
// A STAND-IN on a husk line (code/measure/locked-run, code/measure/token-triple-run).
//
// E-SPN-0071: with every role locked into its doublet, every Q = 1 cluster is spinorial and its Pauli ground under
// a role-blind binding is the natural spin one half. E-SPN-0072: under the lock the fear beat binds two loves only
// as the diquark, and never meets a love and a fear under the knit's meeting. This file asks what that leaves for
// charge one, the task's question: with the doublet lock and the fear beat's exact contact phase, what is the
// lightest bound Q = 1 state, and is it spin one half with odd fermion number?
//
// THE ARGUMENT, before any number.
// (1) (4, 1) and every cluster with a fear: under the knit's meeting and the primary convention, every love-fear
//     meeting is the identity (E-SPN-0072), so the fear's motion is exactly the free walk whatever the loves do.
//     No Q = 1 cluster containing a fear is held together by the fear beat.
// (2) (3, 0): three identical fermions whose internal label is two-valued (the doublet, which is also the slot).
//     On one dock only two can sit (one per slot), and every like contact is the antisymmetric pair with phase
//     omega. So the locked three-love rule on antisymmetric states is EXACTLY the scalar walk with phase omega at
//     every contact and antisymmetric slots and docks, and the line is never reached (N = 3, 2 pi sign -1 on every
//     state, by E-SPN-0071).
// (3) Two-component fermions with a contact attraction form pairs and nothing larger: in one dimension the
//     attractive Gaudin-Yang gas (the continuum limit of such a walk) has two-strings only, since a third fermion
//     always shares its component with one member of the pair and Pauli keeps them apart. A three-body bound
//     state needs three components: E-SPN-0070's determinant channel (three different roles, an SU(3)-like
//     triple) did show one. The lock removes the third component, so the prediction is NO three-love bound state:
//     a diquark and a free love.
//
// PREDICTIONS, written before this file ran (no probe of these numbers was run).
// P1 Reduction: the locked three-love rule from an antisymmetric start (ring 6, 10 beats) has the positions of the
//    scalar phase-omega walk with antisymmetric slots and docks to 1e-12, and its line weight is exactly 0; from a
//    symmetric (boson) start the two differ by more than 1e-6 (the reduction can fail).
// P2 No trimer: for three antisymmetric starts respecting the slot rule, the chance that all three lie within 4 docks
//    (smallest arc), averaged over beats 2L to 4L on rings 16, 24 and 32, fitted as a + b / L on 24 and 32, gives
//    a < 0.05 (a diquark plus a free love gives a near 0).
// P3 Instrument control: the same fit on E-SPN-0070's determinant triple from one dock (slots and docks symmetric,
//    three roles) gives a >= 0.1, where that file read a three-love bound state.
// P4 The fear is free: in a run of two loves and a fear under the knit's meeting ('C', ring 12, 12 beats), the fear's
//    position distribution is the lone free walk's and the loves' joint distribution is the lone locked pair's, to
//    1e-12.
// P5 Start ensemble: with each of the 17 members' links on a ring of 12, the locked three-love run has the no-field
//    positions for 5 beats (before any token crosses the ring's last link) to 1e-12.
//
// Gates, fixed with the predictions: T1 = P1, T2 = P2, T3 = P3, T4 = P4, T5 = P5. Status pass if all hold.
// REPORTED, not gated: the spin-3/2 share (role irrep [3] of the three doublets) of the late state, and the fits.
//
// HUSK: one husk line; every number is a husk number.
//
// Depth L2: a constructed stand-in; the no-trimer argument is the known two-component Gaudin-Yang result.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { antisymmetrized, lockedRun, type LockedStart } from '@/code/measure/locked-run'
import { symmetrizedStart, tripleRun, type Complex } from '@/code/measure/token-triple-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'

const OMEGA: Complex = [-0.5, Math.sqrt(3) / 2]
const NEAR = 4
const SIZES = [16, 24, 32] as const
const REDUCTION_RING = 6
const REDUCTION_BEATS = 10
const FREE_RING = 12
const FREE_BEATS = 12
const ENSEMBLE_RING = 12
const ENSEMBLE_BEATS = 5
const SPIN_RING = 16

function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))
  let n2 = 0

  for (let c = 0; c < 3; c++) n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2

  const f = 1 / Math.sqrt(n2)

  return { re: Float64Array.from(vals, v => v[0] * f), im: Float64Array.from(vals, v => v[1] * f) }
}

// full position distribution of a tripleRun (index (x1 L + x2) L + x3), summed over slots
function triplePositions(run: ReturnType<typeof tripleRun>): Float64Array {
  const L = run.ring
  const out = new Float64Array(L * L * L)

  for (let p = 0; p < L * L * L; p++) {
    let s = 0

    for (let k = 0; k < 8 * run.roles; k++) s += (run.re[p * 8 * run.roles + k] as number) ** 2 + (run.im[p * 8 * run.roles + k] as number) ** 2

    out[p] = s
  }

  return out
}

// a + b / L on the two largest rings, checked on the smallest
function fit(values: readonly number[]): { a: number; b: number; check: number } {
  const [v16, v24, v32] = values as [number, number, number]
  const b = (v24 - v32) / (1 / 24 - 1 / 32)
  const a = v32 - b / 32

  return { a, b, check: a + b / 16 - v16 }
}

// the scalar run's compact chance averaged over beats 2L to 4L
function compactScalar(input: { ring: number; phase: Complex; x: [number, number, number]; c: [number, number, number]; sign: 1 | -1 }): number {
  const run = tripleRun({ ring: input.ring, roles: 1, phase: input.phase, start: symmetrizedStart({ x: input.x, c: input.c, sign: input.sign }) })
  const T = 4 * input.ring
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
}

const STARTS: readonly { name: string; x: [number, number, number]; c: [number, number, number] }[] = [
  { name: 'pair+adjacent', x: [0, 0, 1], c: [0, 1, 0] },
  { name: 'pair+adjacent back', x: [0, 0, 1], c: [0, 1, 1] },
  { name: 'three docks', x: [0, 1, 2], c: [0, 1, 0] },
]

export default experiment({
  id: 'spin/locked-charge-one',
  code: 'E-SPN-0073',
  title: 'three locked loves do not bind as three, a STAND-IN: the lock makes the loves two-component fermions (the doublet is the slot), so the fear beat is exactly a contact phase omega on antisymmetric pairs, it holds a diquark and a free love and nothing larger (the two-component Gaudin-Yang result), and a fear is exactly free under the knit\'s meeting; every Q = 1 state is spinorial with fermion number 3, but the fear beat binds no Q = 1 state',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- T1 ----
    const reduction = (sign: 1 | -1): { gap: number; line: number } => {
      const x: [number, number, number] = [2, 2, 3]
      const c: [number, number, number] = [0, 1, 1]
      const lockedStart: LockedStart[] =
        sign === -1
          ? antisymmetrized({ x, j: c })
          : symmetrizedStart({ x, c, sign: 1 }).map(s => ({ x: [...s.x], j: [...s.c], amp: s.amp }))
      const locked = lockedRun({ ring: REDUCTION_RING, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', start: lockedStart })
      const scalar = tripleRun({ ring: REDUCTION_RING, roles: 1, phase: OMEGA, start: symmetrizedStart({ x, c, sign }) })
      let gap = 0
      let line = 0

      for (let t = 0; t < REDUCTION_BEATS; t++) {
        locked.beat()
        scalar.beat()

        const a = locked.positions()
        const b = triplePositions(scalar)

        gap = Math.max(gap, ...a.map((v, i) => Math.abs(v - (b[i] as number))))
        line = Math.max(line, locked.lineWeight())
      }

      return { gap, line }
    }
    const fermion = reduction(-1)
    const boson = reduction(1)
    const t1 = fermion.gap < 1e-12 && fermion.line === 0 && boson.gap > 1e-6

    log('t1')

    // ---- T2: no trimer ----
    const trimer = STARTS.map(s => {
      const values = SIZES.map(L => compactScalar({ ring: L, phase: OMEGA, x: s.x, c: s.c, sign: -1 }))
      const free = SIZES.map(L => compactScalar({ ring: L, phase: [1, 0], x: s.x, c: s.c, sign: -1 }))

      return { name: s.name, values, free, ...fit(values) }
    })
    const t2 = trimer.every(s => s.a < 0.05)

    log('t2')

    // ---- T3: the instrument sees E-SPN-0070's three-role trimer ----
    const controlValues = SIZES.map(L => compactScalar({ ring: L, phase: OMEGA, x: [0, 0, 0], c: [0, 1, 1], sign: 1 }))
    const control = { values: controlValues, ...fit(controlValues) }
    const t3 = control.a >= 0.1

    log('t3')

    // ---- T4: the fear is free ----
    const x0 = FREE_RING / 2
    const three = lockedRun({ ring: FREE_RING, kinds: ['love', 'love', 'fear'], convention: 'C', unlike: 'knit', start: antisymmetrized({ x: [x0, x0], j: [0, 1] }).map(s => ({ x: [...s.x, x0], j: [...s.j, 0], amp: s.amp })) })
    const pair = lockedRun({ ring: FREE_RING, kinds: ['love', 'love'], convention: 'C', unlike: 'knit', start: antisymmetrized({ x: [x0, x0], j: [0, 1] }) })
    const lone = lockedRun({ ring: FREE_RING, kinds: ['fear'], convention: 'C', unlike: 'knit', start: [{ x: [x0], j: [0], amp: [1, 0] }] })
    let fearGap = 0
    let pairGap = 0

    for (let t = 0; t < FREE_BEATS; t++) {
      three.beat()
      pair.beat()
      lone.beat()

      const full = three.positions()
      const fearMarginal = new Float64Array(FREE_RING)
      const pairMarginal = new Float64Array(FREE_RING * FREE_RING)

      for (let p = 0; p < full.length; p++) {
        fearMarginal[p % FREE_RING] = (fearMarginal[p % FREE_RING] as number) + (full[p] as number)
        pairMarginal[Math.floor(p / FREE_RING)] = (pairMarginal[Math.floor(p / FREE_RING)] as number) + (full[p] as number)
      }

      const lonePos = lone.positions()
      const pairPos = pair.positions()

      fearGap = Math.max(fearGap, ...fearMarginal.map((v, i) => Math.abs(v - (lonePos[i] as number))))
      pairGap = Math.max(pairGap, ...pairMarginal.map((v, i) => Math.abs(v - (pairPos[i] as number))))
    }

    const t4 = fearGap < 1e-12 && pairGap < 1e-12

    log('t4')

    // ---- T5: the start ensemble ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) => unitaryOf(k))
    const ensemble = startFamily(16).map(member => {
      const links = Array.from({ length: ENSEMBLE_RING }, (_, x) => unitaries[table.indexOf(phaseMove(moves.act[member.start(x, moves.act.length)] ?? []))] as M3)
      const start = antisymmetrized({ x: [5, 5, 6], j: [0, 1, 0] })
      const field = lockedRun({ ring: ENSEMBLE_RING, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', links, start })
      const plain = lockedRun({ ring: ENSEMBLE_RING, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', start })
      let gap = 0

      for (let t = 0; t < ENSEMBLE_BEATS; t++) {
        field.beat()
        plain.beat()

        const a = field.positions()
        const b = plain.positions()

        gap = Math.max(gap, ...a.map((v, i) => Math.abs(v - (b[i] as number))))
      }

      return { member: member.name, gap }
    })
    const t5 = ensemble.every(e => e.gap < 1e-12)

    log('t5')

    // REPORTED: the spin-3/2 share of the locked run's late state (role irrep [3] of the three doublets)
    const spin = (() => {
      const run = lockedRun({ ring: SPIN_RING, kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', start: antisymmetrized({ x: [0, 0, 1], j: [0, 1, 0] }) })

      for (let t = 0; t < 4 * SPIN_RING; t++) run.beat()

      const perms = [
        [0, 1, 2],
        [1, 0, 2],
        [2, 1, 0],
        [0, 2, 1],
        [1, 2, 0],
        [2, 0, 1],
      ]
      let quartet = 0
      let total = 0

      for (let p = 0; p < SPIN_RING ** 3; p++) {
        for (let r = 0; r < 27; r++) {
          const digits = [Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3]
          let sr = 0
          let si = 0

          for (const perm of perms) {
            const q = 9 * (digits[perm[0] as number] as number) + 3 * (digits[perm[1] as number] as number) + (digits[perm[2] as number] as number)

            sr += (run.re[p * 27 + q] as number) / 6
            si += (run.im[p * 27 + q] as number) / 6
          }

          quartet += sr * sr + si * si
          total += (run.re[p * 27 + r] as number) ** 2 + (run.im[p * 27 + r] as number) ** 2
        }
      }

      return { quartet: quartet / total, total }
    })()

    log('spin')

    const ok = t1 && t2 && t3 && t4 && t5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the locked three-love rule is the scalar phase-omega walk on antisymmetric states (gap ${fermion.gap.toExponential(1)}, line weight ${fermion.line}, so N = 3 and the 2 pi sign is -1 on every state; ${boson.gap.toExponential(1)} on a boson start); from three starts that respect the slot rule the chance all three lie within 4 docks falls as 1/L (a = ${trimer.map(s => s.a.toFixed(3)).join(', ')} from rings 24 and 32; values ${trimer.map(s => s.values.map(v => v.toFixed(3)).join('/')).join(', ')} on rings 16/24/32), a diquark and a free love, while E-SPN-0070's three-role triple from one dock keeps a = ${control.a.toFixed(3)}; in two loves and a fear the fear moves exactly as a lone walker (gap ${fearGap.toExponential(1)}) and the loves as a lone pair (${pairGap.toExponential(1)}); over the 17 link starts the three-love positions are the no-field ones before any wrap (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)}); the late state holds a spin-3/2 share of ${spin.quartet.toFixed(3)}`,
      metrics: {
        gate_T1: t1 ? 1 : 0,
        gate_T2: t2 ? 1 : 0,
        gate_T3: t3 ? 1 : 0,
        gate_T4: t4 ? 1 : 0,
        gate_T5: t5 ? 1 : 0,
        reductionGapFermion: fermion.gap,
        reductionLineWeight: fermion.line,
        reductionGapBoson: boson.gap,
        ...Object.fromEntries(trimer.flatMap((s, i) => [...s.values.map((v, k) => [`start${i}_compactRing${SIZES[k]}`, v]), ...s.free.map((v, k) => [`start${i}_compactNoMeetingRing${SIZES[k]}`, v]), [`start${i}_fitA`, s.a], [`start${i}_fitB`, s.b], [`start${i}_fitCheck16`, s.check]])),
        fearMarginalGap: fearGap,
        pairMarginalGap: pairGap,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        spinQuartetShare: spin.quartet,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...Object.fromEntries(control.values.map((v, k) => [`threeRoleOneDockCompactRing${SIZES[k]}`, v])),
        threeRoleOneDockFitA: control.a,
        threeRoleOneDockFitCheck16: control.check,
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line, not the knit's tokens). Gates T1 ${t1}, T2 ${t2}, T3 ${t3}, T4 ${t4}, T5 ${t5}. FIRST RUN (30 s): every gate passed, recorded as is; this note line was added after it. Starts: ${STARTS.map(s => `${s.name} (docks ${s.x.join(',')}, slots ${s.c.join(',')})`).join('; ')}. Fit checks at ring 16: ${trimer.map(s => s.check.toFixed(3)).join(', ')}; control ${control.check.toFixed(3)}. Ensemble gaps: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. MEANING: with the lock the question of the lightest charge-one state has a sharp answer under the fear beat alone: there is no bound one. Every Q = 1 state is spinorial with odd fermion number (E-SPN-0071), so the spin-statistics mismatch is gone, but the fear beat holds only the diquark: three loves are two-component fermions and pair without a third (the two-component Gaudin-Yang result), and a fear under the knit's meeting is never met at all (E-SPN-0072). The three-body state E-SPN-0070 saw needed three distinct roles; the lock leaves two. Binding a charge-one state therefore needs an interaction the fear beat does not supply: one that reads the love-fear pair outside Phi, or one that holds three loves without a contact (a string), which E-SPN-0074 tests.`,
    })
  },
})
