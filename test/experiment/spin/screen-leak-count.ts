// IS THE SCREEN'S 1/32 LEAK A COUNT? (E-SPN-0184, OPEN-MOT-03 decision 2). E-SPN-0182 found that below a cusp of
// {3,4,3,4} the screen layer couples into the depth with exactly 1/32 on the diagonal of H(k) = C^dag C at every husk
// momentum k (its G3, to 6.9e-18), as much as the whole along hop, so no mode stays on the screen. It named the change
// that would create one: "screen docks that keep their 18 down slots". This file asks whether the 1/32 is a count fixed
// by representation content and slot numbers, with no dynamics in it, and what the same count says under the change.
//
// THE COUNT, derived before the run (code/measure/spinor-register's integer projectors; E-SPN-0182 item 4).
//  - The S sector is Q_S = Pi1 (x) 1: the TRIVIAL representation of the slot permutations (the uniform slot vector)
//    times any register. So 24 Q_S has the identity I_8 on every slot's diagonal block, and every S state puts exactly
//    1/24 of its weight on each slot, whatever its register.
//  - The D sector is Q_D = sum_ij f_i f_j^T (x) gamma_i^T gamma_j / 4, so 48 Q_D has gamma(r_b)^T gamma(r_b) = |r_b|^2
//    I_8 = 2 I_8 on slot b's diagonal block (the Clifford relation): Q_D keeps exactly 2/48 = 1/24 of the weight of any
//    value that arrives at one slot.
//  - A layer dock's down slot hands its value to a depth-1 dock that no other layer slot reaches (E-SPN-0181 M1, every
//    depth-1 dock has one parent), so the down terms never meet and their weights add.
//  So the depth part of C psi for any S state psi on the layer has weight n_down x (1/24) x (1/24) |psi|^2 exactly, at
//  every k and for every register: with n_down = 18, 18 / 576 = 1/32. The hop's own normalization agrees: 2 c0^2 with c0
//  = 1 / (2 sqrt 288) is 1/576 = (1/24)(2/48). Read as a share: (18/24) of the slots point down, times 1/24, the D
//  sector's share of one slot.
//
// HYPOTHESES, written before any run of this file.
//  H1 THE COUNT, EXACT: every one of the 24 slot blocks of 24 Q_S is I_8 and of 48 Q_D is 2 I_8 (integers); the layer
//     dock has 18 labels into depth 1 and 6 along the layer, every depth-1 dock has exactly one layer parent; the count
//     n_down (24 Q_S)_aa (48 Q_D)_bb / (24 x 48) reduces to 1/32 in integers; 2 c0^2 = 1/576 (1e-18).
//  H2 THE COUNT IS THE MEASURED LEAK: at E-SPN-0182's five gate momenta the depth-1 Gram of the layer's hop is
//     (1/32) I_8 (1e-15 per entry), and the per-label Grams of the 18 down blocks are each (1/576) I_8 (1e-15): no
//     interference anywhere, so no k-dependence is possible.
//  H3 THE CHANGE GIVES 0: with the screen's 18 down slots kept (returned to the dock by the rule's own reflecting
//     piece, -c0 gamma(r_e) on the dock itself) and, so that the stream stays a permutation, the depth-1 docks' up slot
//     kept too, the same count gives a depth leak of 0: no block leaves the layer for the depth (0 exactly), H(k) has 0
//     coupling between the layer and the depth (exactly), and its layer block equals the closed screen's (E-SPN-0182 C2,
//     cut 0) at every gate k (1e-15). The 18/576 is not lost: the 24 per-label Grams from the layer still sum to
//     (24/576) I = I/24 (1e-15), 18/576 of it now landing on the layer itself.
//  H4 ONE-SIDED IS NOT ENOUGH (derived before the run): keeping only the screen's down slots, the depth-1 docks' up
//     slots still land on the layer's odd register, so H(k) keeps a layer-depth block of Frobenius norm at least 1e-3
//     at every gate k: the depth leak is 0 by the count, but the screen is not closed.
//  P  FALSIFIER: H1 or H2 fails (the leak is not this count), or H3 reads anything but 0 for the changed rule.
// PREDICTED: H1 to H4 hold. The 1/32 is not dynamics: it is 18 slots times the S sector's slot share times the D
// sector's slot share, and single parenthood is what keeps it from interfering.
//
// CONTROLS (a failure makes the verdict partial).
//  C1 INTERFERENCE WHERE THERE ARE MANY PARENTS: on the flat mesh the same hop's weight per S state is g^2(K) = |s(K)|^2
//     / 4 (code/measure/spinor-register structureVector), which runs from 0 at K = 0 to at least 2/24 over the 4^4 torus
//     momenta, so it is not a count there; its torus average is the 24-slot count 24/576 = 1/24 (1e-14), because the
//     average over momenta kills every cross term between two roots.
//  C2 A START OFF THE S SECTOR READS A DIFFERENT NUMBER: a register value on ONE down slot of the layer (not an S state)
//     leaks (2/48) of its weight, 1/24, not 1/32, so the count is a statement about the S sector's uniform slot content.
// INSTRUMENT. I1 E-SPN-0182's G3 reproduced: the layer block of H is C_LL^dag C_LL + I/32 (1e-15) at the five k.
// READ (gating nothing): the same reading one shell down, a depth-1 dock's leak into depth 2 against its own count
// n_down(depth 1) / 576, which says whether single parenthood holds below the screen; the changed rule's layer block's
// largest eigenvalue against the original's.
// VERDICT, fixed before the run: PASS when H1 to H4 hold with the controls and the instrument (the leak is the count,
// and the change takes it to 0); FAIL when H1, H2 or H3 fails; PARTIAL when H4, a control or the instrument fails.
//
// FIRST RUN (tmp/np-gate-E-SPN-0184.log, 1.7 s): PASS, as predicted, no gate moved and none was rerun.
//  - H1: every slot block of 24 Q_S is I_8 and of 48 Q_D is 2 I_8; 18 down labels and 6 along; 18 of 18 depth-1 docks
//    single-parent; the count reduces to 1/32 in integers; 2 c0^2 - 1/576 = 4.3e-19.
//  - H2: the depth-1 Gram is I/32 to 6.9e-18 at all five k, each of the 18 down labels I/576 to 4.3e-19.
//  - H3: under the two-sided keep no block leaves the layer, the layer-depth coupling is exactly 0, the layer block equals
//    the closed screen's bit for bit, and the 24 label Grams still sum to I/24 (1.4e-17).
//  - H4: the one-sided keep leaves a layer-depth block of Frobenius norm 0.102062 at every k (sqrt(1/96)).
//  - C1: on the flat mesh g^2 runs from 0 to 0.125 over the 256 torus momenta, mean 1/24 to 5e-17. C2: one slot's
//    value keeps 1/24. I1: E-SPN-0182's G3 to 1.4e-17.
//  - READ: the layer block's top eigenvalue is 1/16 with the leak and 1/8 under the keep (the 18 returned slots add
//    coherently on the dock). One shell down a depth-1 dock has 23 labels into depth 2 (one up, none along), each to a
//    different dock, so its own leak is 23/576 exactly; but a depth-2 dock can have 2 depth-1 parents, so below the
//    first shell states spread over several docks can interfere.
// WHAT IT MEANS. The 1/32 is a count and not dynamics: (18 down slots) x (1/24, the S sector's share of a slot, the
// trivial representation of the slot permutations) x (1/24, the D sector's share of a slot). The keep takes it to 0
// only if the depth-1 docks also keep their up slot (the stream must stay a permutation); a one-sided keep still ties
// the layer to the depth. For OPEN-MOT-03 decision 2 the change is then exactly E-SPN-0182's closed screen at the layer,
// whose band moves at 0.046 docks a beat.
//
// Depth L1 (a count read off exact integer projectors) and L2 (the register rule's hop on the true mesh's cusp
// quotient, read for it). DETERMINISM: no random numbers. NOTHING MOVES: the hop is the stream's value handed one dock
// along between the S and D sectors.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  C0,
  cliffordHop,
  cuspQuotient,
  hopGram,
  huskTranslations,
  type CuspQuotient,
  type HopBlock,
} from '@/code/measure/cusp-bloch'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { cuspRegion } from '@/code/substrate/coxeter/labelled-region'
import {
  partnerProjector48,
  singletProjector24,
  structureVector,
} from '@/code/measure/spinor-register'

const REG = 8
const SLOTS = 24
const MODES = SLOTS * REG
const EXACT = 1e-15
const OPEN = 1e-3
const KS: number[][] = [
  [0, 0, 0],
  [Math.PI / 2, 0, 0],
  [Math.PI, 0, 0],
  [Math.PI / 2, Math.PI / 2, Math.PI / 2],
  [0.37, -0.21, 0.13],
]

const flag = (b: boolean): number => (b ? 1 : 0)
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b))

export default experiment({
  id: 'spin/screen-leak-count',
  code: 'E-SPN-0184',
  title:
    "the screen's fixed 1/32 leak is a count, not dynamics, pass: the S sector is the trivial representation of the slot permutations, so 24 Q_S is I on every slot block and an S state puts 1/24 of its weight on each slot, and 48 Q_D is 2 I on every slot block, so the D sector keeps 1/24 of any value arriving at a slot; every depth-1 dock has one layer parent, so the 18 down terms never interfere and the leak is 18 x (1/24) x (1/24) = 1/32 exactly (integers; measured 6.9e-18 at five husk momenta, each down label 1/576); keeping the 18 down slots together with the depth-1 docks' up slot gives a leak of exactly 0 and the layer block of the closed screen bit for bit, the 24 labels' weight still 1/24 in total, while keeping only the down slots leaves a layer-depth coupling of sqrt(1/96) at every k; control: on the flat mesh, where every dock has 24 parents, the same weight g^2 interferes from 0 to 0.125 and only its torus average is the count 1/24",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return screenLeakRun()
  },
})

// sum_b B_b^dag B_b over a block list, 8 x 8 (the incoherent Gram)
function incoherent(list: readonly HopBlock[]): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(REG * REG)
  const im = new Float64Array(REG * REG)

  for (const b of list) {
    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        let sr = 0
        let si = 0

        for (let l = 0; l < REG; l++) {
          const ar = b.re[l * REG + i]!
          const ai = -b.im[l * REG + i]!
          const br = b.re[l * REG + j]!
          const bi = b.im[l * REG + j]!

          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }

        re[i * REG + j]! += sr
        im[i * REG + j]! += si
      }
    }
  }

  return { re, im }
}

// the blocks summed where they land on one dock (the coherent sum per target), then the incoherent Gram over targets
function perTarget(list: readonly HopBlock[]): { re: Float64Array; im: Float64Array } {
  const byX = new Map<number, HopBlock>()

  for (const b of list) {
    const hit = byX.get(b.x)

    if (hit) {
      byX.set(b.x, { ...hit, re: hit.re.map((v, t) => v + b.re[t]!), im: hit.im.map((v, t) => v + b.im[t]!) })
    } else {
      byX.set(b.x, b)
    }
  }

  return incoherent([...byX.values()])
}

const gapToScaledIdentity = (g: { re: Float64Array; im: Float64Array }, s: number): number => {
  let worst = 0

  for (let i = 0; i < REG; i++) {
    for (let j = 0; j < REG; j++) {
      worst = Math.max(worst, Math.abs(g.re[i * REG + j]! - (i === j ? s : 0)), Math.abs(g.im[i * REG + j]!))
    }
  }

  return worst
}

// a copy of a quotient with some (dock, label) steps cut (target -1), so the reflecting boundary returns them
const cutSteps = (q: CuspQuotient, cut: (x: number, e: number) => boolean): CuspQuotient => ({
  ...q,
  target: Int32Array.from(q.target, (t, at) => (cut(Math.floor(at / SLOTS), at % SLOTS) ? -1 : t)),
})

export function screenLeakRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()
  const patch = cuspRegion({ coin, skin: 2, depth: 0 })
  const tr = huskTranslations(coin, patch.frames)
  const zero = cuspQuotient({ coin, translations: tr, depth: 0, kind: 'unit' })
  const one = cuspQuotient({ coin, translations: tr, depth: 1, kind: 'unit' })
  const two = cuspQuotient({ coin, translations: tr, depth: 2, kind: 'unit' })

  log('quotients')

  // ---------------- H1: the count ----------------
  const S24 = singletProjector24()
  const D48 = partnerProjector48()

  let blocksRight = true

  for (let a = 0; a < SLOTS; a++) {
    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        const at = (a * REG + i) * MODES + a * REG + j

        blocksRight &&= S24[at] === (i === j ? 1 : 0) && D48[at] === (i === j ? 2 : 0)
      }
    }
  }

  const labelsOf = (q: CuspQuotient, x: number, depth: number): number[] =>
    Array.from({ length: SLOTS }, (_, e) => e).filter(e => {
      const y = q.target[x * SLOTS + e]!

      return y >= 0 && q.depth[y] === depth
    })
  const down = labelsOf(one, 0, 1)
  const along = labelsOf(one, 0, 0)

  let parents = 0
  let depthOne = 0

  for (let x = 0; x < one.docks; x++) {
    if (one.depth[x] === 1) {
      depthOne++
      parents += labelsOf(one, x, 0).length === 1 ? 1 : 0
    }
  }

  // n_down x (24 Q_S)_aa x (48 Q_D)_bb over 24 x 48, in integers
  const num = BigInt(down.length) * BigInt(S24[0]!) * BigInt(D48[0]!)
  const den = 24n * 48n
  const g0 = gcd(num, den)
  const count = { num: num / g0, den: den / g0 }
  const countValue = Number(count.num) / Number(count.den)
  const c0Gap = Math.abs(2 * C0 * C0 - 1 / 576)
  const H1 =
    blocksRight &&
    down.length === 18 &&
    along.length === 6 &&
    depthOne === 18 &&
    parents === 18 &&
    count.num === 1n &&
    count.den === 32n &&
    c0Gap <= 1e-18

  // ---------------- H2, I1: the measured leak ----------------
  let leakGap = 0
  let perLabelGap = 0
  let layerBlockGap = 0
  let topOriginal = 0

  for (const k of KS) {
    const blocks = cliffordHop({ q: one, k, boundary: 'reflect' })
    const fromLayer = blocks.filter(b => b.y === 0)
    const toDepth = fromLayer.filter(b => one.depth[b.x] === 1)

    leakGap = Math.max(leakGap, gapToScaledIdentity(perTarget(toDepth), countValue))

    for (const b of toDepth) {
      perLabelGap = Math.max(perLabelGap, gapToScaledIdentity(incoherent([b]), 1 / 576))
    }

    const H = hopGram(one.docks, blocks)
    const alongGram = perTarget(fromLayer.filter(b => one.depth[b.x] === 0))

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        layerBlockGap = Math.max(
          layerBlockGap,
          Math.abs(H.re[i * H.n + j]! - alongGram.re[i * REG + j]! - (i === j ? countValue : 0)),
          Math.abs(H.im[i * H.n + j]! - alongGram.im[i * REG + j]!),
        )
      }
    }

    const layer = { re: new Float64Array(REG * REG), im: new Float64Array(REG * REG) }

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        layer.re[i * REG + j] = H.re[i * H.n + j]!
        layer.im[i * REG + j] = H.im[i * H.n + j]!
      }
    }

    topOriginal = Math.max(topOriginal, ...hermitianEigenRows(REG, layer.re, layer.im).values)
  }

  const H2 = leakGap <= EXACT && perLabelGap <= EXACT
  const I1 = layerBlockGap <= EXACT

  log('H2')

  // ---------------- H3: the two-sided keep ----------------
  const upOf = (x: number): number[] => labelsOf(one, x, 0)
  const twoSided = cutSteps(one, (x, e) => (x === 0 && down.includes(e)) || (one.depth[x] === 1 && upOf(x).includes(e)))
  const oneSided = cutSteps(one, (x, e) => x === 0 && down.includes(e))

  let changedLeak = 0
  let crossTwo = 0
  let closedGap = 0
  let budgetGap = 0
  let crossOne = Infinity
  let topChanged = 0

  for (const k of KS) {
    const blocks = cliffordHop({ q: twoSided, k, boundary: 'reflect' })
    const fromLayer = blocks.filter(b => b.y === 0)

    changedLeak = Math.max(changedLeak, fromLayer.filter(b => b.x !== 0).length)
    budgetGap = Math.max(budgetGap, gapToScaledIdentity(incoherent(fromLayer), 1 / 24))

    const H = hopGram(twoSided.docks, blocks)
    const closed = hopGram(zero.docks, cliffordHop({ q: zero, k, boundary: 'reflect' }))
    const layer = { re: new Float64Array(REG * REG), im: new Float64Array(REG * REG) }

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < H.n; j++) {
        if (j >= REG) {
          crossTwo = Math.max(crossTwo, Math.abs(H.re[i * H.n + j]!), Math.abs(H.im[i * H.n + j]!))
        } else {
          closedGap = Math.max(
            closedGap,
            Math.abs(H.re[i * H.n + j]! - closed.re[i * closed.n + j]!),
            Math.abs(H.im[i * H.n + j]! - closed.im[i * closed.n + j]!),
          )
          layer.re[i * REG + j] = H.re[i * H.n + j]!
          layer.im[i * REG + j] = H.im[i * H.n + j]!
        }
      }
    }

    topChanged = Math.max(topChanged, ...hermitianEigenRows(REG, layer.re, layer.im).values)

    // H4: the one-sided keep
    const H1s = hopGram(oneSided.docks, cliffordHop({ q: oneSided, k, boundary: 'reflect' }))

    let f2 = 0

    for (let i = 0; i < REG; i++) {
      for (let j = REG; j < H1s.n; j++) {
        f2 += H1s.re[i * H1s.n + j]! ** 2 + H1s.im[i * H1s.n + j]! ** 2
      }
    }

    crossOne = Math.min(crossOne, Math.sqrt(f2))
  }

  const H3 = changedLeak === 0 && crossTwo === 0 && closedGap <= EXACT && budgetGap <= EXACT
  const H4 = crossOne >= OPEN

  log('H3 H4')

  // ---------------- C1: the flat mesh ----------------
  const g2s: number[] = []

  for (let n = 0; n < 256; n++) {
    const K = [0, 1, 2, 3].map(i => (2 * Math.PI * (Math.floor(n / 4 ** i) % 4)) / 4)
    const s = structureVector(K)

    g2s.push(s.reduce((a, x) => a + x * x, 0) / 4)
  }

  const flatMean = g2s.reduce((a, x) => a + x, 0) / g2s.length
  const flatMin = Math.min(...g2s)
  const flatMax = Math.max(...g2s)
  const C1 = Math.abs(flatMean - 1 / 24) <= 1e-14 && flatMin <= EXACT && flatMax >= 2 / 24

  // ---------------- C2: a start on one down slot ----------------
  // a register value chi on slot b (unit weight): Q_D keeps chi^T (Q_D)_bb chi = (D48_bb / 48) |chi|^2 for every chi
  const b = down[0]!
  const offS = D48[(b * REG) * MODES + b * REG]! / 48
  const C2 = Math.abs(offS - 1 / 24) <= EXACT && Math.abs(offS - countValue) > 1e-3

  // ---------------- READ: one shell down ----------------
  let shellGap = 0
  let shellDown = 0
  let shellParentsMax = 0

  for (let x = 0; x < two.docks; x++) {
    if (two.depth[x] !== 2) {
      continue
    }

    shellParentsMax = Math.max(shellParentsMax, labelsOf(two, x, 1).length)
  }

  {
    const y = Array.from({ length: two.docks }, (_, x) => x).find(x => two.depth[x] === 1)!
    const blocks = cliffordHop({ q: two, k: KS[4]!, boundary: 'reflect' }).filter(
      bk => bk.y === y && two.depth[bk.x] === 2,
    )

    shellDown = labelsOf(two, y, 2).length
    shellGap = gapToScaledIdentity(perTarget(blocks), shellDown / 576)
  }

  log('controls and read')

  const status: Verdict['status'] = !(H1 && H2 && H3) ? 'fail' : H4 && C1 && C2 && I1 ? 'pass' : 'partial'
  const e = (x: number): string => x.toExponential(2)

  return verdict({
    status,
    claim: `H1 ${H1} (slot blocks of 24 Q_S = I and 48 Q_D = 2 I on all 24 slots ${blocksRight}; ${down.length} down and ${along.length} along labels, ${parents} of ${depthOne} depth-1 docks single-parent; count ${count.num}/${count.den}; 2 c0^2 - 1/576 ${e(c0Gap)}); H2 ${H2} (depth-1 Gram on I/32 to ${e(leakGap)} at ${KS.length} k, each down label on I/576 to ${e(perLabelGap)}); H3 ${H3} (two-sided keep: ${changedLeak} blocks leave the layer, layer-depth coupling ${e(crossTwo)}, layer block on the closed screen's to ${e(closedGap)}, the 24 label Grams on I/24 to ${e(budgetGap)}); H4 ${H4} (one-sided keep: layer-depth block at least ${crossOne.toFixed(6)} in Frobenius norm); controls C1 ${C1} (flat g^2 over 256 torus momenta: mean ${flatMean.toFixed(15)} against 1/24, range ${flatMin.toExponential(2)} to ${flatMax.toFixed(6)}) C2 ${C2} (one slot's value keeps ${offS.toFixed(6)}); instrument I1 ${I1} (layer block on C_LL^dag C_LL + I/32 to ${e(layerBlockGap)})`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      down: down.length,
      along: along.length,
      countNumerator: Number(count.num),
      countDenominator: Number(count.den),
      leakGap,
      perLabelGap,
      changedLeak,
      crossTwo,
      closedGap,
      budgetGap,
      crossOne,
      flatMean,
      flatMin,
      flatMax,
      oneSlot: offS,
      layerBlockGap,
      topOriginal,
      topChanged,
      shellDown,
      shellGap,
      shellParentsMax,
      seconds: (Date.now() - started) / 1000,
    },
    control: { flatMean, flatMin, flatMax, oneSlot: offS },
    notes: `L1 and L2. Docks per cell at cuts 0, 1, 2: ${zero.docks}, ${one.docks}, ${two.docks}. The layer block's largest eigenvalue over the five k: ${topOriginal.toFixed(6)} with the leak, ${topChanged.toFixed(6)} under the two-sided keep (the closed screen). One shell down (read): a depth-1 dock has ${shellDown} labels into depth 2, and its depth-2 Gram (coherent per target) is ${shellDown}/576 I to ${e(shellGap)}; the most layer-1 parents of any depth-2 dock is ${shellParentsMax}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
