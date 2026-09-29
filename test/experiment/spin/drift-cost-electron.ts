// The lightest charge-one state under the drift's cost ALONE, with no store (code/rule/drift-cost-line), on LOCKED
// STAND-IN tokens on one husk line: three loves, as in E-SPN-0077, with the store taken out.
//
// E-SPN-0086 proves the rule (husk-local, reversible, exact, Gauss exact, translation covariant) and shows on the
// pair that a linear phase ramp of pi / N per link binds at contact, freezes a string's length, carries narrow
// bands past the wrap l = 2N, and lets the bound level travel. Here the same question is put to the charge-one
// cluster. E-SPN-0077's lightest three-love level (store at a port, box 2D) was the natural spin one half, compact,
// and travelling. Its store read 2D docks away; every local placement of the count paid (E-SPN-0081, 0082, 0085: a
// flavor that lifts Pauli, or a pin). If the cost alone binds, keeps the spin one half and travels, the electron
// stand-in needs no store at all.
//
// WHY IT SHOULD. (a) The cost is role-blind and flavorless: it reads only the flux, a function of the positions, so
// no register lifts Pauli's lock on the role (the failure of E-SPN-0082), and E-SPN-0071's argument applies: the
// Pauli ground of a role-blind binding of three locked loves is the natural spin one half. (b) Nothing is pinned
// (E-SPN-0086 (5)): the beat keeps K, so the cluster's centre is a Bloch wave (the failure of E-SPN-0085). (c) The
// line sector is closed exactly as in E-SPN-0077: no piece puts a doublet label on the line, so N = 3 and the full
// turn is (-1)^3 = -1 on every state reached from a locked start. (d) Three loves hold no singlet sub-cluster, so the
// string holds them as a whole (E-SPN-0077 T6), and its length is the cluster's span.
//
// PREDICTIONS, written before this file ran (timing probes printed sizes and seconds only; the tracker probe printed
// instrument numbers, tmp/cost-probe1, 2).
// T1 The line is closed: on the 27-label space (D = 1, 2; boxes 2N + 2; K = 0 and 0.7) the beat moves no weight from
//    the doublet-only states onto the line (below 1e-14): N = 3, 2 pi sign -1.
// T2 Spin one half: at D = 1, 2, 3 (boxes 2N + 2, past the wrap) the lightest three-love level holds at least 0.95 of
//    its weight in role [2,1], the natural doublet (E-SPN-0071's prediction).
// T3 Compact: at D = 2 the lightest level on boxes 12 and 14 agrees (energy to 1e-6, overlap at least 1 - 1e-6), and
//    at D = 2, 3 at most 1e-3 of its weight is on strings of N links or more.
// T4 It travels: followed from K = 0 to pi in 12 steps at D = 2, 3 (boxes 2N + 2) its band is at least 0.01 wide,
//    its group velocity reaches 0.02 docks per beat, consecutive overlaps at least 0.5; the inverse-iteration
//    tracker equals the full-spectrum tracker at D = 2 (13 energies to 1e-8).
// T5 The box operator is the ring rule (no wall): one beat on a momentum state of a ring (three loves D = 2, box 12,
//    ring 28, support l <= 10; the pair D = 3, box 21, ring 48, support l <= 19) equals the box operator's image to
//    1e-12, nothing outside.
// T6 The start family: with each of the 17 link starts' color fields, the costed no-wall runs (three loves ring 24,
//    D = 1, 5 beats; the pair ring 48, D = 2, 10 beats) keep the no-field positions to 1e-12.
//
// Gates, fixed with the predictions: T1 .. T6. Pass if all hold.
// REPORTED: E-SPN-0077's store on the SAME instrument (box 2D) beside the cost alone at D = 1, 2, 3 (energy, <l>, spin
// one half share, tail), D = 1's box convergence, the weight near the wrap (l >= 2N - 2).
// THE BOX IS MEASUREMENT (the rule has no wall). HUSK: one husk line. Three loves hold no fear: C and C' coincide.
//
// Depth L2: a constructed stand-in; the electron's charge, spin and statistics are read on locked tokens on one
// line, not derived for the knit's tokens in 3D.
//
// FIRST RUN (recorded, no gate moved): FAIL on T2, T3 and T4, each at the SHALLOW depths only. T1, T5, T6 pass (line
// leak exactly 0, box = ring rule 1.8e-15 and 4.4e-15, 17 starts 2.1e-13). At D = 3 (N = 7) every gated number holds
// and the level is E-SPN-0077's: E 0.33002 against the store's 0.33022, role [2,1] share 0.982 (store 0.983), <l>
// 2.19 (2.18), weight at l >= N 5.7e-4, near the wrap 3.8e-6, band 0.044 wide, velocity 0.030. At D = 2 (N = 5) the
// share still passes (0.952) but the level feels the wrap: 6.7e-2 of its weight at l >= N (5.8e-2 at l >= 2N - 2),
// box-dependent (dE 3.2e-5, overlap 0.99960 on boxes 12 and 14), band 0.013 and velocity 0.013 (under 0.02). At D = 1
// (N = 3) there is no compact level: the "lightest" is a box state (overlap 0.009 between boxes 8 and 10, <l> 3.08,
// 46 percent at l >= 3), share 0.869. The string's wrap at 2N sits too close to a three-token cluster of span ~2.2
// until N ~ 7. Open: the D = 3 band (0.044) is narrower than E-SPN-0077's (0.078 on its box 2D); the tracker's min
// overlap 0.815 suggests crossings with long-string levels at K > 0, not settled here.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  boxSpec,
  build,
  crossBoxOverlap,
  followBand,
  followBandFull,
  lightestStreaming,
  lightN,
  ringAgreementFree,
  tailWeight,
  type Lightest,
} from '@/code/measure/drift-cost-bloch'
import {
  blochColumn,
  blochSpace,
  quartetShare,
  stringMoments,
  type Bloch,
} from '@/code/measure/flux-store-bloch'
import {
  antisymmetrized,
  lockedRun,
  spanOf,
  type LockedStart,
} from '@/code/measure/locked-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { type Vibe } from '@/code/rule/locked-token-line'

const THREE = ['love', 'love', 'love'] as const

// T1: the weight the beat moves from the doublet-only states onto the line
function lineLeak(
  D: number,
  K: number,
): { leak: number; columns: number } {
  const b = blochSpace(boxSpec(THREE, D, 2 * lightN(D) + 2, 3))

  let leak = 0
  let columns = 0

  for (let col = 0; col < b.size; col++) {
    const r = col % b.labelCount

    if ([Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3].includes(2)) {
      continue
    }

    columns++

    const img = blochColumn(b, K, col)

    let w = 0

    img.idx.forEach((i, m) => {
      const s = i % b.labelCount

      if (
        [Math.floor(s / 9), Math.floor(s / 3) % 3, s % 3].includes(2)
      ) {
        w += img.re[m]! ** 2 + img.im[m]! ** 2
      }
    })

    leak = Math.max(leak, w)
  }

  return { leak, columns }
}

// T6: the color field of each start family member (as E-SPN-0077)
function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))

  let n2 = 0

  for (let c = 0; c < 3; c++) {
    n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2
  }

  const f = 1 / Math.sqrt(n2)

  return {
    re: Float64Array.from(vals, v => v[0] * f),
    im: Float64Array.from(vals, v => v[1] * f),
  }
}

// a costed run with NO wall (the drift's cost as a phase on the smallest arc; rings chosen so no string passes half)
function costedFreeRun(input: {
  ring: number
  kinds: Vibe[]
  D: number
  links?: M3[]
  start: LockedStart[]
}): { beat: () => void; positions: () => Float64Array } {
  const N = lightN(input.D)
  const M = 2 * N * N
  const run = lockedRun({
    ring: input.ring,
    kinds: input.kinds,
    convention: 'C',
    unlike: 'knit',
    links: input.links,
    start: input.start,
  })
  const n = input.kinds.length
  const R = 3 ** n
  const P = input.ring ** n
  const cr = new Float64Array(P)
  const ci = new Float64Array(P)
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % input.ring
      c = Math.floor(c / input.ring)
    }

    const th = (-2 * Math.PI * ((N * spanOf(input.ring, xs)) % M)) / M

    cr[p] = Math.cos(th)
    ci[p] = Math.sin(th)
  }

  return {
    beat: () => {
      for (let p = 0; p < P; p++) {
        for (let r = 0; r < R; r++) {
          const vr = run.re[p * R + r]!
          const vi = run.im[p * R + r]!

          run.re[p * R + r] = vr * cr[p]! - vi * ci[p]!
          run.im[p * R + r] = vr * ci[p]! + vi * cr[p]!
        }
      }

      run.beat()
    },
    positions: () => run.positions(),
  }
}

type Row = {
  D: number
  S: number
  bloch: Bloch
  lp: Lightest
  mean: number
  spinHalf: number
  tailN: number
  tailWrap: number
}

function threeLightest(D: number, S: number): Row {
  const bu = build(boxSpec(THREE, D, S), 0)
  const lp = lightestStreaming(bu, 2 * S + 6)
  const N = lightN(D)

  return {
    D,
    S,
    bloch: bu.bloch,
    lp,
    mean: stringMoments(bu.bloch, lp.level.vector).mean,
    spinHalf: 1 - quartetShare(bu.bloch, lp.level.vector),
    tailN: tailWeight(bu.bloch, lp.level.vector, N),
    tailWrap: tailWeight(bu.bloch, lp.level.vector, 2 * N - 2),
  }
}

export default experiment({
  id: 'spin/drift-cost-electron',
  code: 'E-SPN-0087',
  title:
    "the lightest charge-one state under the drift's cost alone, with no store, a STAND-IN on locked tokens: three loves bound by the string's phase ramp of pi / N per link, the line sector closed (N = 3, 2 pi sign -1), the lightest level the natural spin one half, compact on boxes past the wrap l = 2N, and travelling",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- T1 ----
    const leaks = [1, 2].flatMap(D =>
      [0, 0.7].map(K => ({ D, K, ...lineLeak(D, K) })),
    )
    const t1 = leaks.every(l => l.leak < 1e-14 && l.columns > 0)

    log('t1')

    // ---- T2 ----
    const rows = [1, 2, 3].map(D => {
      const row = threeLightest(D, 2 * lightN(D) + 2)

      log(`t2 D ${D}`)

      return row
    })
    const t2 = rows.every(r => r.spinHalf >= 0.95)

    // ---- T3 ----
    const wider = threeLightest(2, 14)
    const r2 = rows.find(r => r.D === 2)!
    const boxGap = Math.abs(wider.lp.unwrapped - r2.lp.unwrapped)
    const boxOverlap = crossBoxOverlap(
      r2.bloch,
      r2.lp.level.vector,
      wider.bloch,
      wider.lp.level.vector,
    )
    const t3 =
      boxGap <= 1e-6 &&
      boxOverlap >= 1 - 1e-6 &&
      rows.filter(r => r.D >= 2).every(r => r.tailN <= 1e-3)

    log('t3')

    // REPORTED: D = 1 on a wider box
    const widerOne = threeLightest(1, 10)
    const r1 = rows.find(r => r.D === 1)!
    const boxGapOne = Math.abs(widerOne.lp.unwrapped - r1.lp.unwrapped)
    const boxOverlapOne = crossBoxOverlap(
      r1.bloch,
      r1.lp.level.vector,
      widerOne.bloch,
      widerOne.lp.level.vector,
    )

    // ---- T4 ----
    const bands = [2, 3].map(D => {
      const r = rows.find(x => x.D === D)!
      const b = followBand(boxSpec(THREE, D, r.S), r.lp.level, 12)

      log(`t4 D ${D}`)

      return { D, ...b }
    })
    const calibration = followBandFull(
      boxSpec(THREE, 2, r2.S),
      r2.lp.level,
      12,
    )
    const trackerGap = Math.max(
      ...bands[0]!.energies.map((e, k) =>
        Math.abs(e - calibration.energies[k]!),
      ),
    )
    const t4 =
      bands.every(
        b =>
          b.bandwidth >= 0.01 &&
          b.velocity >= 0.02 &&
          b.minOverlap >= 0.5,
      ) && trackerGap <= 1e-8

    log('t4')

    // ---- T5 ----
    const fill = (i: number): [number, number] => [
      weyl(i + 1, GOLDEN) - 0.5,
      weyl(i + 1, SILVER) - 0.5,
    ]
    const agreeThree = ringAgreementFree(
      boxSpec(THREE, 2, 12),
      28,
      5,
      10,
      fill,
    )
    const agreePair = ringAgreementFree(
      boxSpec(['love', 'fear'], 3, 21),
      48,
      7,
      19,
      fill,
    )
    const t5 =
      agreeThree.gap < 1e-12 &&
      agreePair.gap < 1e-12 &&
      agreeThree.outside < 1e-24 &&
      agreePair.outside < 1e-24

    log('t5')

    // ---- T6 ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) =>
      unitaryOf(k),
    )
    const ensemble = startFamily(16).map(member => {
      const linksOf = (L: number): M3[] =>
        Array.from(
          { length: L },
          (_, x) =>
            unitaries[
              table.indexOf(
                phaseMove(
                  moves.act[member.start(x, moves.act.length)] ?? [],
                ),
              )
            ]!,
        )

      let gap = 0

      const cases: {
        L: number
        kinds: Vibe[]
        D: number
        beats: number
        start: LockedStart[]
      }[] = [
        {
          L: 24,
          kinds: [...THREE],
          D: 1,
          beats: 5,
          start: antisymmetrized({ x: [11, 11, 12], j: [0, 1, 0] }),
        },
        {
          L: 48,
          kinds: ['love', 'fear'],
          D: 2,
          beats: 10,
          start: [{ x: [24, 24], j: [0, 1], amp: [1, 0] }],
        },
      ]

      for (const c of cases) {
        const field = costedFreeRun({
          ring: c.L,
          kinds: c.kinds,
          D: c.D,
          links: linksOf(c.L),
          start: c.start,
        })
        const plain = costedFreeRun({
          ring: c.L,
          kinds: c.kinds,
          D: c.D,
          start: c.start,
        })

        for (let t = 0; t < c.beats; t++) {
          field.beat()
          plain.beat()

          const a = field.positions()
          const b = plain.positions()

          for (let i = 0; i < a.length; i++) {
            gap = Math.max(gap, Math.abs(a[i]! - b[i]!))
          }
        }
      }

      return { member: member.name, gap }
    })
    const t6 =
      ensemble.length === 17 && ensemble.every(e => e.gap < 1e-12)

    log('t6')

    // REPORTED: E-SPN-0077's store on the same instrument (box 2D)
    const store = [1, 2, 3].map(D => threeLightest(D, 2 * D))

    const ok = t1 && t2 && t3 && t4 && t5 && t6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `three locked loves bound by the drift's cost alone (no store): the beat moves no weight onto the line (worst ${Math.max(...leaks.map(l => l.leak)).toExponential(1)}), so N = 3 and the 2 pi sign is -1; the lightest level (boxes 2N + 2, past the wrap) has role [2,1] share ${rows.map(r => r.spinHalf.toFixed(3)).join(', ')} at D = 1, 2, 3 (E-SPN-0077's store on the same instrument: ${store.map(r => r.spinHalf.toFixed(3)).join(', ')}), <l> ${rows.map(r => r.mean.toFixed(2)).join(', ')} (store ${store.map(r => r.mean.toFixed(2)).join(', ')}), weight at l >= N ${rows.map(r => r.tailN.toExponential(1)).join(', ')}, the same on boxes 12 and 14 at D = 2 (dE ${boxGap.toExponential(1)}, overlap ${boxOverlap.toFixed(8)}); band ${bands.map(b => b.bandwidth.toFixed(3)).join(', ')} wide, group velocity up to ${bands.map(b => b.velocity.toFixed(3)).join(', ')} docks per beat at D = 2, 3; the box operator is the ring rule (${agreeThree.gap.toExponential(1)}, ${agreePair.gap.toExponential(1)}), and over the 17 link starts the no-wall costed runs keep the no-field positions (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_T1: t1 ? 1 : 0,
        gate_T2: t2 ? 1 : 0,
        gate_T3: t3 ? 1 : 0,
        gate_T4: t4 ? 1 : 0,
        gate_T5: t5 ? 1 : 0,
        gate_T6: t6 ? 1 : 0,
        lineLeakWorst: Math.max(...leaks.map(l => l.leak)),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`three_D${r.D}_energy`, r.lp.unwrapped],
            [`three_D${r.D}_rawEnergy`, r.lp.level.energy],
            [`three_D${r.D}_meanString`, r.mean],
            [`three_D${r.D}_spinHalfShare`, r.spinHalf],
            [`three_D${r.D}_tailAtN`, r.tailN],
            [`three_D${r.D}_tailAtWrap`, r.tailWrap],
            [`three_D${r.D}_evenShare`, r.lp.reading.even],
            [
              `three_D${r.D}_gapNext`,
              r.lp.nextUnwrapped - r.lp.unwrapped,
            ],
            [`three_D${r.D}_dim`, r.lp.dim],
            [`three_D${r.D}_eigenResidual`, r.lp.residual],
          ]),
        ),
        boxGapD2: boxGap,
        boxOverlapD2: boxOverlap,
        ...Object.fromEntries(
          bands.flatMap(b => [
            [`band_D${b.D}_width`, b.bandwidth],
            [`band_D${b.D}_velocity`, b.velocity],
            [`band_D${b.D}_minOverlap`, b.minOverlap],
          ]),
        ),
        trackerGap,
        ringGapThree: agreeThree.gap,
        ringGapPair: agreePair.gap,
        ringOutsideThree: agreeThree.outside,
        ringOutsidePair: agreePair.outside,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        boxGapD1: boxGapOne,
        boxOverlapD1: boxOverlapOne,
        ...Object.fromEntries(
          store.flatMap(r => [
            [`store_D${r.D}_energy`, r.lp.unwrapped],
            [`store_D${r.D}_meanString`, r.mean],
            [`store_D${r.D}_spinHalfShare`, r.spinHalf],
            [`store_D${r.D}_evenShare`, r.lp.reading.even],
          ]),
        ),
      },
      notes: `L2, a STAND-IN. Gates T1 ${t1}, T2 ${t2}, T3 ${t3}, T4 ${t4}, T5 ${t5}, T6 ${t6}. Cost alone, lightest by depth (box 2N + 2): ${rows.map(r => `D ${r.D} (box ${r.S}, dim ${r.lp.dim}): E ${r.lp.unwrapped.toFixed(5)} (raw ${r.lp.level.energy.toFixed(5)}), <l> ${r.mean.toFixed(3)}, spin one half ${r.spinHalf.toFixed(4)}, particle ${r.lp.reading.even.toFixed(3)}, tail at N ${r.tailN.toExponential(1)}, near the wrap ${r.tailWrap.toExponential(1)}, next +${(r.lp.nextUnwrapped - r.lp.unwrapped).toFixed(4)}, residual ${r.lp.residual.toExponential(1)}`).join('; ')}. E-SPN-0077's store (box 2D, the same instrument): ${store.map(r => `D ${r.D}: E ${r.lp.unwrapped.toFixed(5)}, <l> ${r.mean.toFixed(3)}, spin one half ${r.spinHalf.toFixed(4)}`).join('; ')}. D = 1 on boxes 8 and 10: dE ${boxGapOne.toExponential(1)}, overlap ${boxOverlapOne.toFixed(6)}. Bands (K = 0 to pi, 12 steps): ${bands.map(b => `D ${b.D}: ${b.energies.map(e => e.toFixed(3)).join(' ')} (min overlap ${b.minOverlap.toFixed(3)}, worst residual ${b.worstResidual.toExponential(1)})`).join('; ')}; full-spectrum tracker at D = 2: ${calibration.energies.map(e => e.toFixed(3)).join(' ')} (gap ${trackerGap.toExponential(1)}). Line leak by (D, K): ${leaks.map(l => `(${l.D}, ${l.K}) ${l.leak.toExponential(1)} over ${l.columns} columns`).join(', ')}. Start members: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}. THE BOX is measurement, not rule. What this is not: an electron of the knit (locked stand-in tokens on one line, three loves as the charge-one cluster by the model's Q = (love - fear) / 3).`,
    })
  },
})
