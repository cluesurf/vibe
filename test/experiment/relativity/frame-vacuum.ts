// A living vacuum whose stored line set has an irreducible stabilizer: the FRAME, four orthogonal lines on every dock
// (E-RLT-0081).
//
// THE IDEA (E-RLT-0079's second route). A translation-invariant vacuum keeps only the stabilizer of its stored set. One
// line keeps 48 coin maps, which fix an axis, so the transport is uniaxial. A set whose stabilizer acts irreducibly on
// R^4 forces every rank-2 transport tensor isotropic: the husk diffusion, trace and sound anisotropy then start at
// relative order k^2 instead of k^0. It fits every box (period 1), so E-FRC-0159's battery can run on it unchanged.
//
// DERIVED before running:
//  1. THE LEAST SUCH SET IS A FRAME. The second moment of a stored set must be a multiple of I (it is an invariant
//     quadratic form), so the set's lines span R^4 with equal weight: four lines at least, and four only when they are
//     orthogonal. The D4 lines hold three frames, {e0 +- e1, e2 +- e3} and its two images under triality. Each frame's
//     stabilizer in W(F4) is W(B4), 384 elements, irreducible. A frame is not a 4-design (E-RLT-0080 fact 1), so the
//     rank-4 scalars are not forced: exponent 2, not 4.
//  2. BUT THE STORE IS ORIENTED. A unit's sign says which way its love goes. With +1 on all four lines (a uniform
//     orientation) the state keeps the permutations of the four stored roots (S4) and -1 with charge conjugation: 48
//     elements, which act on R^4 as the permutation representation, 1 + 3, REDUCIBLE: the sum of the four stored roots
//     is a kept axis. So the ORIENTED frame forces no rank-2 tensor either. Whether the orientation reaches the linear
//     transport is the question this file measures (E-RLT-0070 found the full hot vacuum's did not at leading order).
//  3. AN ORIENTATION BALANCED ON EACH LINE (every sign pattern of the four lines equally often across a cell) restores
//     W(B4) in the first-order medium: the cell average of the per-dock matrices is the average over the 16 products
//     of the four frame reflections, which W(B4) keeps. Such a pattern varies from dock to dock, so it needs an even box.
//  4. (Z) holds term by term and the vacuum runs E-RLT-0074's exact cycle on every box (translation-invariant, with the
//     separated layout for (A)).
//
// Gates, fixed before the first run:
//  S1 among the 4,095 nonempty line sets, those with an irreducible stabilizer (a 1-dimensional space of invariant
//     quadratics) have at least 4 lines, and the 4-line ones are exactly the 3 frames, each with stabilizer 384 that
//     forces the bulk quadratics and not the quartics
//  S2 the frame vacuum (lines 0, 1, 10, 11, sign +1) meets (Z) and (A) on sides 3, 5 and 9 and runs the exact period-6
//     cycle (made, vetoed, unmade on beats 0, 1, 2 mod 3 for every unit)
//  S3 symmetry: the uniformly oriented frame keeps 48 coin maps (with charge conjugation for half) and forces 2 invariant
//     quadratics (reducible); the sign-averaged frame keeps 384 and forces 1
//  XT instruments: each oriented collision matrix commutes with the 48 to 1e-10, each sign-averaged one with the 384 to
//     1e-10, neither with all 1,152 (defect above 1e-6), and each pair keeps exactly 6 invariants
//  HA the uniformly oriented frame is anisotropic at leading order: husk charge and trace anisotropy exponents under 1
//  HB the sign-averaged frame is isotropic at rank 2 only: husk charge, trace and sound exponents 2 +- 0.5, and its
//     shear exponent at least 1.5 if W(B4) forces the husk shear at leading order and under 1 if it does not
//  W  the lone love's and fear's largest wake per period on side 9 at most the committed knit's (33, 160, 565, 1,508 and
//     27, 163, 581, 1,501)
// Verdict: pass if every gate holds; fail if S1 to S3 and XT hold and HA, HB or W does not; partial otherwise.
//
// PREDICTED: S1 to S3 and XT hold (derived). HA and HB not predicted beyond the derivation. W FAILS: the probe
// (tmp/vary-probe3.ts) read 78,559 trits in the first period on side 9, the whole box: every dock holds 8 vacuum vibes
// at beat 1 and a lone vibe scatters them, as on the full vacuum (E-RLT-0075: 12 lines, 179,763).
//
// Reported, not gated: the wake by direction; the wake against the number of stored lines (1, two orthogonal, three
// orthogonal, the frame) on side 9, one love each, which shows where the melt starts; the exponents per rung.
//
// DISCLOSED: tmp/vary-probe3.ts ran the frame's cycle and wake before this file; no transport number of the frame was
// seen before the first run.
//
// FIRST RUN (29.7 s): partial, recorded as is. S1, S2, S3 and HB hold; W fails as predicted; HA fails (not predicted:
// the oriented frame's exponents are 2.03, 2.14, 2.03 and 0.15, the same as the sign-averaged frame's to the third
// decimal, so the store's ORIENTATION does not reach the linear transport; only the LINES do). XT fails on one clause
// that was badly written: it asked the oriented matrices to commute with all 48 elements of S3's group as bare coin
// maps (defect 0.17), but S3 itself derived that 24 of them are symmetries only when followed by charge conjugation.
// AFTER THE FIRST RUN a reading was added (not a gate): the 24 root-keeping elements alone and the 24 root-reversing
// ones followed by charge conjugation (code/measure/varying-transport CHARGE_CONJUGATION_INDEX). XT as registered is
// unchanged and still decides the verdict; the title was rewritten after the run.
//
// Depth L2. DETERMINISM: fixed sets and layouts, exhaustive enumeration, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { makeColorWeave } from '@/code/rule/color-weave'
import { isometricTable } from '@/code/rule/isometric-knit'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { makeLivingKernel } from '@/code/measure/living-pair-kernel'
import { sparseConditions, vacuumCycle, wakeSeries } from '@/code/measure/sparse-living-vacuum'
import { d4BoxCell } from '@/code/substrate/d4-box'
import { characterForcing, coinData, huskForcing, integerDeterminant, uniformStore } from '@/code/measure/varying-vacuum'
import { conjugated, equivarianceDefect, lawMatrices, lawsOf, readTransport } from '@/code/measure/varying-transport'

const FRAME = [0, 1, 10, 11]
const COMMITTED_LOVE = [33, 160, 565, 1508]
const COMMITTED_FEAR = [27, 163, 581, 1501]
const WAKE_SIDE = 9

function wakeOf(side: number, store: Int8Array, tone: number): { perPeriod: number[]; byDirection: number[] } {
  const weave = makeColorWeave({ side, table: 'bind' })
  const kernel = makeLivingKernel(weave)
  const layout = separatedLayout(weave)
  const mid = Math.floor(side / 2)
  const center = d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
  const perPeriod = [0, 0, 0, 0]
  const byDirection: number[] = []

  for (let d = 0; d < 24; d++) {
    const series = wakeSeries(kernel, store, layout, center * 24 + d, tone, 96)

    series.forEach((v, t) => {
      perPeriod[Math.floor(t / 24)] = Math.max(perPeriod[Math.floor(t / 24)] as number, v)
    })
    byDirection.push(Math.max(...series))
  }

  return { perPeriod, byDirection }
}

export default experiment({
  id: 'relativity/frame-vacuum',
  code: 'E-RLT-0081',
  title:
    "the frame vacuum (four orthogonal stored lines on every dock, the least set with an irreducible stabilizer, W(B4)), partial on an instrument clause: it runs the exact living cycle on every box and its husk transport is isotropic at rank two only (charge 2.03, trace 2.14, sound 2.03, shear 0.15), the same with its store signs averaged, so the orientation does not reach the linear transport and only the stored lines do; but a lone love's wake fills the side-9 box (78,559 trits in the first period, committed 33), growing with the stored orthogonal lines as 266, 4,436, 63,402 and 78,559 for one to four; the registered instrument gate asked 24 symmetries that need charge conjugation to commute as bare coin maps (0.17, with charge conjugation 5e-13)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const table = groupTable()
    const coins = coinData(table)
    const n = table.permutations.length
    const everything = Array.from({ length: n }, (_, i) => i)
    const stabilizerOf = (lines: readonly number[]): number[] => everything.filter(g => lines.every(l => lines.includes((coins.lineImage[g] as Int8Array)[l] as number)))

    // S1
    let leastIrreducible = 13
    const irreducibleOfLeast: number[][] = []

    for (let mask = 1; mask < 4096; mask++) {
      const lines = Array.from({ length: 12 }, (_, l) => l).filter(l => (mask >> l) & 1)

      if (lines.length > leastIrreducible) continue

      const f = characterForcing(coins, stabilizerOf(lines))

      if (f.quadratics !== 1) continue

      if (lines.length < leastIrreducible) {
        leastIrreducible = lines.length
        irreducibleOfLeast.length = 0
      }

      irreducibleOfLeast.push(lines)
    }

    const frameStabilizer = stabilizerOf(FRAME)
    const frameForcing = { ...characterForcing(coins, frameStabilizer), ...huskForcing(coins, frameStabilizer) }
    const s1 =
      leastIrreducible === 4 &&
      irreducibleOfLeast.length === 3 &&
      irreducibleOfLeast.some(ls => ls.join(',') === FRAME.join(',')) &&
      irreducibleOfLeast.every(ls => stabilizerOf(ls).length === 384) &&
      frameStabilizer.length === 384 &&
      frameForcing.bulk2 &&
      !frameForcing.bulk4

    log('s1')

    // S2
    const cycles = [3, 5, 9].map(side => {
      const weave = makeColorWeave({ side, table: 'bind' })
      const store = uniformStore(side ** 4, FRAME)
      const layout = separatedLayout(weave)
      const cond = sparseConditions(weave, store, layout)
      const cycle = vacuumCycle(makeLivingKernel(weave), store, layout, cond.bothLines)

      return { side, cond, cycle }
    })
    const s2 = cycles.every(c => c.cond.momentumDocks === 0 && c.cond.vetoFailures === 0 && c.cycle.exact)

    log('s2')

    // S3: the uniformly oriented frame's C-even symmetry (every stored root to a stored root, or every one to the
    // reverse of one, with charge conjugation) and the sign-averaged frame's (every frame line to a frame line)
    const orientedGroup = everything.filter(g => {
      const signs = FRAME.map(l => (FRAME.includes((coins.lineImage[g] as Int8Array)[l] as number) ? ((coins.lineSign[g] as Int8Array)[l] as number) : 0))

      return signs.every(s => s === 1) || signs.every(s => s === -1)
    })
    const withC = orientedGroup.filter(g => (coins.lineSign[g] as Int8Array)[FRAME[0] as number] === -1).length
    const orientedForcing = { ...characterForcing(coins, orientedGroup), ...huskForcing(coins, orientedGroup) }
    const s3 = orientedGroup.length === 48 && withC === 24 && orientedForcing.quadratics === 2 && frameStabilizer.length === 384 && frameForcing.quadratics === 1

    log('s3')

    // XT, HA, HB: the transport
    const table4 = isometricTable()
    const oriented = lawMatrices(table4, lawsOf(Array.from({ length: 12 }, (_, l) => (FRAME.includes(l) ? 1 : 0))))
    // the 16 products of the four frame reflections: the W(F4) element that negates exactly the chosen frame roots and
    // keeps the others (the frame spans R^4, so the images of its four roots determine the element)
    const products: number[] = []

    for (let mask = 0; mask < 16; mask++) {
      const g = everything.find(x => {
        const li = coins.lineImage[x] as Int8Array
        const ls = coins.lineSign[x] as Int8Array

        return FRAME.every((l, k) => li[l] === l && ls[l] === ((mask >> k) & 1 ? -1 : 1))
      })

      products.push(g ?? -1)
    }

    // check: the product negating k frame roots is an involution with determinant (-1)^k and doubled trace 2 (4 - 2 k)
    const exactProducts = products.every((g, mask) => {
      const k = [0, 1, 2, 3].filter(b => (mask >> b) & 1).length

      return (
        g >= 0 &&
        coins.order[g] === (k === 0 ? 1 : 2) &&
        integerDeterminant(coins.doubled[g] as number[][]) === 16 * (-1) ** k &&
        (coins.doubled[g] as number[][]).reduce((s, row, i) => s + (row[i] as number), 0) === 2 * (4 - 2 * k)
      )
    })
    const averaged: [Float64Array, Float64Array] = [new Float64Array(72 * 72), new Float64Array(72 * 72)]

    for (const g of products) {
      const p = table.permutations[g] as number[]

      for (const phase of [0, 1] as const) {
        const m = conjugated(oriented[phase], p)

        for (let i = 0; i < m.length; i++) averaged[phase][i] = (averaged[phase][i] as number) + (m[i] as number) / 16
      }
    }

    const perms = (group: readonly number[]): (readonly number[])[] => group.map(g => table.permutations[g] as number[])
    const orientedDefect = Math.max(equivarianceDefect(oriented[0], perms(orientedGroup)), equivarianceDefect(oriented[1], perms(orientedGroup)))
    // added after the first run (a reading, not a gate): the 24 that keep every stored root, alone, and the 24 that
    // reverse them, each followed by charge conjugation, which is what S3 derived
    const keeping = orientedGroup.filter(g => (coins.lineSign[g] as Int8Array)[FRAME[0] as number] === 1)
    const reversing = orientedGroup.filter(g => (coins.lineSign[g] as Int8Array)[FRAME[0] as number] === -1)
    const correctedDefect = Math.max(
      equivarianceDefect(oriented[0], perms(keeping)),
      equivarianceDefect(oriented[1], perms(keeping)),
      equivarianceDefect(oriented[0], perms(reversing), true),
      equivarianceDefect(oriented[1], perms(reversing), true),
    )
    const orientedFull = Math.max(equivarianceDefect(oriented[0], table.permutations), equivarianceDefect(oriented[1], table.permutations))
    const averagedDefect = Math.max(equivarianceDefect(averaged[0], perms(frameStabilizer)), equivarianceDefect(averaged[1], perms(frameStabilizer)))
    const averagedFull = Math.max(equivarianceDefect(averaged[0], table.permutations), equivarianceDefect(averaged[1], table.permutations))
    const readOriented = readTransport(oriented)
    const readAveraged = readTransport(averaged)
    const xt =
      exactProducts &&
      orientedDefect < 1e-10 &&
      averagedDefect < 1e-10 &&
      orientedFull > 1e-6 &&
      averagedFull > 1e-6 &&
      readOriented.invariants === 6 &&
      readAveraged.invariants === 6
    const o3 = readOriented.three
    const a3 = readAveraged.three
    const ha = (o3.charge ?? 9) < 1 && (o3.trace ?? 9) < 1
    const shearForced = frameForcing.huskShear2
    const hb =
      Math.abs((a3.charge ?? 0) - 2) <= 0.5 &&
      Math.abs((a3.trace ?? 0) - 2) <= 0.5 &&
      Math.abs((a3.sound ?? 0) - 2) <= 0.5 &&
      (shearForced ? (a3.shear ?? 0) >= 1.5 : (a3.shear ?? 9) < 1)

    log('transport')

    // W
    const frameStore = uniformStore(WAKE_SIDE ** 4, FRAME)
    const love = wakeOf(WAKE_SIDE, frameStore, 1)
    const fear = wakeOf(WAKE_SIDE, frameStore, -1)
    const noMore = (a: number[], b: number[]): boolean => a.every((x, p) => x <= (b[p] ?? 0))
    const w = noMore(love.perPeriod, COMMITTED_LOVE) && noMore(fear.perPeriod, COMMITTED_FEAR)

    log('w')

    // reported: the wake against the number of stored orthogonal lines
    const ladder = [[0], [0, 1], [0, 1, 10]].map(lines => ({ lines, wake: wakeOf(WAKE_SIDE, uniformStore(WAKE_SIDE ** 4, lines), 1) }))

    log('ladder')

    const status = s1 && s2 && s3 && xt ? (ha && hb && w ? 'pass' : 'fail') : 'partial'
    const list = (xs: readonly number[]): string => xs.join(', ')
    const fmt = (r: Record<string, number>): string => ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${(r[q] ?? Number.NaN).toFixed(2)}`).join(', ')

    return verdict({
      status,
      claim: `the frame vacuum: the least line set with an irreducible stabilizer is a frame of 4 orthogonal lines (W(B4), 384), which runs the exact living cycle on every box, but its stored ORIENTATION keeps only 48 coin maps (S4 and -1 with charge conjugation, reducible), and at a background oriented like it the husk transport is ${fmt(o3)}; averaged over the four lines' signs (what a dock-varying balanced orientation gives at first order, W(B4)) it is ${fmt(a3)}; a lone love's wake on side 9 is ${list(love.perPeriod)} trits per period (committed 33, 160, 565, 1,508): the frame holds 8 vacuum vibes on every dock at beat 1 and melts like the full vacuum`,
      metrics: {
        leastIrreducibleSize: leastIrreducible,
        leastIrreducibleSets: irreducibleOfLeast.length,
        frameStabilizer: frameStabilizer.length,
        frameBulk2: frameForcing.bulk2 ? 1 : 0,
        frameBulk4: frameForcing.bulk4 ? 1 : 0,
        frameHusk4: frameForcing.husk4 ? 1 : 0,
        frameHuskShear: frameForcing.huskShear2 ? 1 : 0,
        ...Object.fromEntries(cycles.flatMap(c => [
          [`side${c.side}Units`, c.cond.units],
          [`side${c.side}ZDocks`, c.cond.momentumDocks],
          [`side${c.side}VetoFailures`, c.cond.vetoFailures],
          [`side${c.side}CycleExact`, c.cycle.exact ? 1 : 0],
          [`side${c.side}Period`, c.cycle.period],
        ])),
        orientedGroup: orientedGroup.length,
        orientedWithC: withC,
        orientedQuadratics: orientedForcing.quadratics,
        orientedQuartics: orientedForcing.quartics,
        averagedQuadratics: frameForcing.quadratics,
        averagedQuartics: frameForcing.quartics,
        reflectionProductsExact: exactProducts ? 1 : 0,
        orientedDefect,
        orientedDefectWithCharge: correctedDefect,
        orientedFullDefect: orientedFull,
        averagedDefect,
        averagedFullDefect: averagedFull,
        orientedInvariants: readOriented.invariants,
        averagedInvariants: readAveraged.invariants,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].flatMap(q => [
          [`oriented_${q}_exponent3`, o3[q] ?? Number.NaN],
          [`oriented_${q}_exponent5`, readOriented.five[q] ?? Number.NaN],
          [`oriented_${q}_anisotropyLongest`, readOriented.anisotropy[q]?.at(-1) ?? Number.NaN],
          [`averaged_${q}_exponent3`, a3[q] ?? Number.NaN],
          [`averaged_${q}_exponent5`, readAveraged.five[q] ?? Number.NaN],
          [`averaged_${q}_anisotropyLongest`, readAveraged.anisotropy[q]?.at(-1) ?? Number.NaN],
        ])),
        ...Object.fromEntries(love.perPeriod.map((x, p) => [`loveSide9Period${p + 1}`, x])),
        ...Object.fromEntries(fear.perPeriod.map((x, p) => [`fearSide9Period${p + 1}`, x])),
        bareDirections: love.byDirection.filter(x => x === 1).length,
        ...Object.fromEntries(ladder.map(l => [`ladder${l.lines.length}LinesPeriod1`, l.wake.perPeriod[0] ?? -1])),
        ...Object.fromEntries(ladder.map(l => [`ladder${l.lines.length}LinesPeriod4`, l.wake.perPeriod[3] ?? -1])),
        seconds: (Date.now() - started) / 1000,
      },
      control: { committedLovePeriod1: COMMITTED_LOVE[0] ?? 0, oneLinePeriod1: ladder[0]?.wake.perPeriod[0] ?? -1 },
      notes: `L2. Gates: S1 ${s1}, S2 ${s2}, S3 ${s3}, XT ${xt}, HA ${ha}, HB ${hb}, W ${w}. Least irreducible line sets: size ${leastIrreducible}, ${JSON.stringify(irreducibleOfLeast)}; frame stabilizer ${frameStabilizer.length}, forcing bulk2 ${frameForcing.bulk2} bulk4 ${frameForcing.bulk4} husk4 ${frameForcing.husk4} husk shear ${frameForcing.huskShear2}. Cycles: ${cycles.map(c => `side ${c.side} units ${c.cond.units} (Z) ${c.cond.momentumDocks} veto failures ${c.cond.vetoFailures} exact ${c.cycle.exact} tallies ${c.cycle.tallies}`).join('; ')}. Oriented group ${orientedGroup.length} (${withC} with C), quadratics ${orientedForcing.quadratics}, quartics ${orientedForcing.quartics}; averaged (W(B4)) quadratics ${frameForcing.quadratics}, quartics ${frameForcing.quartics}. Instruments: reflection products exact ${exactProducts}, defects ${orientedDefect.toExponential(1)} (48, XT as registered, coin maps alone) and ${correctedDefect.toExponential(1)} (the 24 reversing ones followed by charge conjugation, the reading added after the first run) and ${averagedDefect.toExponential(1)} (384), against all 1,152 ${orientedFull.toExponential(2)} and ${averagedFull.toExponential(2)}, invariants ${readOriented.invariants} and ${readAveraged.invariants}. Oriented exponents (three rungs) ${fmt(o3)}; charge anisotropy per rung ${readOriented.anisotropy.charge?.map(x => x.toExponential(2)).join(', ')}. Sign-averaged ${fmt(a3)}; charge anisotropy per rung ${readAveraged.anisotropy.charge?.map(x => x.toExponential(2)).join(', ')}; shear per rung ${readAveraged.anisotropy.shear?.map(x => x.toExponential(2)).join(', ')}. Wake on side 9: love ${list(love.perPeriod)}, fear ${list(fear.perPeriod)}, bare directions ${love.byDirection.filter(x => x === 1).length}. Wake by stored orthogonal lines (love, first and fourth period): ${ladder.map(l => `${l.lines.length}: ${l.wake.perPeriod[0]}, ${l.wake.perPeriod[3]}`).join('; ')}; 4: ${love.perPeriod[0]}, ${love.perPeriod[3]}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
