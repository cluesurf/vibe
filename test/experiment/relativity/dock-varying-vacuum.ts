// A living vacuum that breaks W(F4) dock by dock and still forces isotropic husk transport: which patterns can do it,
// the least one, and what it costs (E-RLT-0080).
//
// THE QUESTION (E-RLT-0077 to E-RLT-0079). The living-pair knit (code/rule/living-pair-knit, schedule 'alternate',
// unchanged) is W(F4)-covariant, so a clocking vacuum must break W(F4) in its STATE (E-RLT-0064). The one-line vacuum
// does, keeps all 14 quantum gates and makes fear, but its husk transport is uniaxial at leading order: its stored line
// picks an axis. A vacuum whose orientation varies from dock to dock could break W(F4) locally while its space group
// forces the long-wave transport isotropic. Derived before building (code/measure/varying-vacuum carries each proof):
//  1. LINES APPEAR EQUALLY. A point group G that forces the rank-4 scalars isotropic makes every G-orbit of stored lines
//     a spherical 4-design, and among the 4,095 nonempty sets of D4 lines only the full 12 is one. So every orbit of
//     stored docks carries all 12 lines equally.
//  2. NOT EVERY DOCK CAN STORE A LINE. If G holds -1 and an order-3 element g with no fixed vector (2T and W(F4) do),
//     g's affine image on any finite period cell commutes with the affine -1, so it fixes the unique -1-fixed dock of
//     the odd part and (orbits of size 1 or 3 on a 2-group) a dock of the 2-part: g fixes a dock, whose line g would have
//     to fix. So the requested design, one line on EVERY dock, cannot be forced isotropic on any periodic box.
//  3. THE LEAST CELL HAS 16 DOCKS. A 2T-invariant lattice is a principal left ideal of the Hurwitz order, of square
//     index; 12 stored docks and at least one empty need at least 13, so 16 (D4 / 2 D4).
//  4. THE HUB PATTERN: on D4 / 2 D4, every dock of the class of a root r stores line(r), the class 0 (the HUBS, 2 D4)
//     and the three norm-4 classes store nothing. Each stored dock is the midpoint of two hubs and stores the line
//     joining them; (Z) holds term by term; at beat 1 every vacuum vibe sits on a hub. Its line pattern is kept by all
//     1,152 elements of W(F4) about a hub.
//  5. THE ORIENTATION. A store sign says which way a unit's love goes, so the vacuum is a field of ORIENTED roots, one
//     direction on every edge of the hub graph. No translation-invariant orientation keeps the quaternion group Q8 (i H
//     = +-H and j H = +-H force k H = H, against k^2 = -1), so an isotropic vacuum needs a varying orientation. A search
//     (tmp/vary-probe1.ts, 2.ts) found no orientation kept by any lift of W(F4) on the side-4 box (the long-root
//     reflections fix hyperplanes that hold units along and across their root), and found one kept by a group of 576
//     elements: 2T about a hub and one more element, period 4 D4, no charge conjugation. That group holds the 12
//     short-root reflections and none of the long ones (an index-2 subgroup of W(F4)), and its invariant polynomials of
//     degree under 12 are W(F4)'s, so it forces what W(F4) forces at these orders: the husk scalars through k^4 and the
//     husk shear at leading order. This is the ORIENTED HUB VACUUM, fixed by code/measure/varying-vacuum orientedHub.
//  6. THE BATTERY'S BOXES CANNOT HOLD IT. A pattern that lives on boxes of sides 3, 5, 7, 9, 11 and 13 has every one
//     of those sides as a period, so it is translation-invariant (gcd 1), so by fact 1 it stores all 12 lines on every
//     dock: the full vacuum, which melts (E-RLT-0075). Every other isotropic vacuum needs a side divisible by its period
//     (4 here).
//
// Gates, fixed before the first run of this file:
//  D1 designs: of the 4,095 nonempty line sets exactly one is a 4-design (the 12), and the 2-designs have sizes 4, 8, 12
//     with the three frames as the 4-line ones
//  D2 fact 2: every two-generated subgroup of W(F4) (all orders) that forces the bulk quadratics and quartics holds -1
//     and a vector-free order-3 element (0 exceptions); on sides 2 to 8, for all 16 vector-free order-3 elements, 0
//     translations give a map that commutes with an affine -1 and fixes no dock (free maps exist only when 3 divides
//     the side)
//  D3 fact 3: every 2T-invariant sublattice found (cyclic and pairwise sums on sides 2, 3, 4, cyclic on side 6) has a
//     perfect-square index, and the least index at least 13 is 16
//  D4 fact 4: the hub pattern has 0 docks failing (Z) on sides 4 and 8, and its line pattern is kept by all 1,152
//     elements about a hub with the 16 translations 2 D4 / 4 D4 on side 4 (18,432 elements)
//  D5 fact 5: 0 of the 4,096 uniform orientations keep Q8 (and 0 keep 2T); 0 of the 17,408 lifts of W(F4) orient the
//     hub pattern on side 4; the oriented hub vacuum's symmetry on side 8 has 9,216 elements, point group 576 with no
//     charge conjugation, 16 translations, 12 reflections, and forces the bulk rank 2 and 4 and the husk rank 4 and
//     shear
//  D6 the run: on sides 4 and 8 the oriented hub vacuum meets (Z) and runs with period 6, every unit made on beats 0
//     and 3 mod 6 and unmade on 2 and 5, and 0 vetoes (predicted from the probe: every hub receives two loves or two
//     fears on each line, never a love and a fear, so condition (A) is never needed)
//  D7 the first-order transport: the cell average of the oriented hub vacuum's per-dock collision matrices commutes with
//     all 1,152 coin maps to 1e-10, holds all 24 oriented roots, and its husk charge, trace and sound exponents are at
//     least 3.5 and its shear 2 +- 0.5 (E-RLT-0079's reading)
//  W  CAN IT WORK: the lone love's and lone fear's largest wake per period on side 8 (24 directions, 4 periods, the
//     center dock storing line 0) at most the one-line vacuum's on the same box
// Verdict: pass if D1 to D7 and W hold; fail if D1 to D7 hold and W does not; partial otherwise.
//
// PREDICTED before the first run: D1 to D7 hold (derived; D5 and D6 found by the probes). W FAILS: the probe
// (tmp/vary-probe3.ts) read 8,896 trits in the first period against the one-line vacuum's 210 on side 8. The hub
// vacuum holds 24 vacuum vibes on every hub at beat 1, as the full vacuum holds them on every dock, and a lone vibe that
// reaches a full hub turns K away from -1 there and scatters all 24.
//
// Reported, not gated: the wake by direction; the free-translation counts at sides 3 and 6; the 2T CHAIN pattern
// (code/measure/varying-vacuum chainPattern, the most units whose 2T orbits never share a unit dock or a beat-1
// midpoint, so every dock receives at most one antipodal pair at beat 1, as on the one-line vacuum) and its wake on
// side 8; the hub vacuum's walls-free facts (units, hubs); the forcing flags of the unoriented W(F4) group.
//
// DISCLOSED: four probes ran before this file (tmp/vary-probe1.ts to 4.ts): the design census, the fixed-dock algebra
// (the first version tested line-free order-3 elements, 32 of which fix a vector, and found free commuting maps on even
// sides; the proof needs vector-free ones, and with them the count is 0), the invariant indices, the census, the hub
// pattern's symmetry, the orientation search, the vacuum run and the wakes of the hub, one-line, frame and chain
// vacua. Every gate above was written after those probes, so D5, D6 and W are confirmations, not predictions.
//
// FIRST RUN (39.2 s): fail, as predicted: D1 to D7 hold and W fails. Title rewritten after the run; no logic changed.
//
// Depth L2. DETERMINISM: exhaustive enumeration and fixed search orders, no draw. The husk is read in D7 only (the
// first-order medium); the exact periodic transport is forced by the point group, not computed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { twoGeneratedSubgroups } from '@/code/measure/isotropy-group-census'
import { makeColorWeave } from '@/code/rule/color-weave'
import { isometricTable, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { makeLivingKernel } from '@/code/measure/living-pair-kernel'
import { sparseConditions, vacuumCycle, wakeSeries } from '@/code/measure/sparse-living-vacuum'
import { d4BoxCell, d4BoxMesh, d4Coordinates } from '@/code/substrate/d4-box'
import {
  binaryTetrahedralIndices,
  boxMaps,
  chainPattern,
  characterForcing,
  coinData,
  designCensus,
  determinantOf,
  fixedDockCheck,
  halfSetsKept,
  hubLines,
  huskForcing,
  invariantIndices,
  liftSearch,
  momentumFailures,
  orientedHub,
  orientedHubStore,
  patternSymmetry,
  storeOf,
  tileStore,
  uniformStore,
} from '@/code/measure/varying-vacuum'
import { averagedMatrices, equivarianceDefect, readTransport } from '@/code/measure/varying-transport'

const ROOTS = rootsD4()
const WAKE_SIDE = 8
const WAKE_BEATS = 96

type Wake = { perPeriod: number[]; byDirection: number[] }

// the largest wake per period (trits off the vacuum run) over the 24 directions of a lone vibe at the center
function wakeOf(side: number, store: Int8Array, center: number, tone: number): Wake {
  const weave = makeColorWeave({ side, table: 'bind' })
  const kernel = makeLivingKernel(weave)
  const layout = separatedLayout(weave)
  const perPeriod = [0, 0, 0, 0]
  const byDirection: number[] = []

  for (let d = 0; d < 24; d++) {
    const series = wakeSeries(kernel, store, layout, center * 24 + d, tone, WAKE_BEATS)

    series.forEach((v, t) => {
      perPeriod[Math.floor(t / 24)] = Math.max(perPeriod[Math.floor(t / 24)] as number, v)
    })
    byDirection.push(Math.max(...series))
  }

  return { perPeriod, byDirection }
}

type Run = { units: number; momentumDocks: number; period: number; tallies: string; expected: string; ok: boolean }

function runOf(side: number, store: Int8Array): Run {
  const weave = makeColorWeave({ side, table: 'bind' })
  const kernel = makeLivingKernel(weave)
  const layout = separatedLayout(weave)
  const cond = sparseConditions(weave, store, layout)
  const cycle = vacuumCycle(kernel, store, layout, cond.bothLines)
  const u = cond.units
  const expected = [`${u}/0/0`, '0/0/0', `0/${u}/0`, `${u}/0/0`, '0/0/0', `0/${u}/0`].join(' ')

  return { units: u, momentumDocks: cond.momentumDocks, period: cycle.period, tallies: cycle.tallies, expected, ok: cond.momentumDocks === 0 && cycle.period === 6 && cycle.tallies === expected }
}

export default experiment({
  id: 'relativity/dock-varying-vacuum',
  code: 'E-RLT-0080',
  title:
    'a living vacuum that breaks W(F4) dock by dock and forces isotropic husk transport exists, fail on its wake: only the full 12 lines are a 4-design, so isotropy needs every line equally; no forcing group lets every dock store a line (every one of the 48 found holds -1 and a vector-free order-3 element, whose image fixes a dock of every periodic cell); the least cell is 16 docks and carries the HUB pattern (a line on every midpoint of the doubled lattice, (Z) by pairs, line pattern kept by all 1,152); no translation-invariant orientation keeps Q8 and no lift of W(F4) orients it, but an orientation of period 4 D4 keeps 576 elements (the short reflections, no long one), which force the husk scalars through k^4 and the shear at leading order; it runs with period 6 and no veto, its cell-averaged transport is 4.00, 4.09, 4.02 and 2.02, but a lone love wakes 8,896 trits per period on side 8 against the one-line vacuum\'s 210, since every hub holds 24 vacuum vibes at beat 1; no such vacuum fits the battery\'s odd boxes except the full one, which melts',
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
    const twoT = binaryTetrahedralIndices(table)

    // D1
    const designs = designCensus()
    const d1 = designs.fourDesigns === 1 && designs.fourDesignSizes[0] === 12 && designs.twoDesignSizes.join(',') === '4,8,12' && designs.frames.length === 3

    // D2
    const groups = twoGeneratedSubgroups(table, n)
    let forcing = 0
    let forcing2 = 0
    let exceptions = 0

    for (const g of groups) {
      const f = characterForcing(coins, g)

      if (f.bulk2) forcing2++
      if (!(f.bulk2 && f.bulk4)) continue

      forcing++

      const holds = g.includes(table.minus) && g.some(x => coins.order[x] === 3 && coins.vectorFree[x])

      exceptions += holds ? 0 : 1
    }

    const free3 = everything.filter(g => coins.order[g] === 3 && coins.vectorFree[g])
    const fixedDock = [2, 3, 4, 5, 6, 7, 8].map(side => {
      let free = 0
      let commuting = 0

      for (const g of free3) {
        const f = fixedDockCheck(coins, g, side)

        free += f.free
        commuting += f.freeCommuting
      }

      return { side, free, commuting }
    })
    const d2 = forcing > 0 && exceptions === 0 && free3.length === 16 && fixedDock.every(f => f.commuting === 0 && (f.free > 0) === (f.side % 3 === 0))

    log('d2')

    // D3
    const indices = [2, 3, 4, 6].map(side => {
      const box = boxMaps(coins, side)

      return invariantIndices(
        twoT.map(g => Array.from(box.linear[g] as Int32Array)),
        side,
        side <= 4,
      )
    })
    const allIndices = [...new Set(indices.flat())].sort((a, b) => a - b)
    const d3 = allIndices.every(i => Number.isInteger(Math.sqrt(i))) && allIndices.find(i => i >= 13) === 16

    log('d3')

    // D4
    const hub4 = boxMaps(coins, 4)
    const lines4 = hubLines(4, [0, 0, 0, 0])
    const unoriented = patternSymmetry(coins, hub4, storeOf(lines4, new Int8Array(lines4.length).fill(1)), true)
    const zFailures = [4, 8].map(side => {
      const mesh = d4BoxMesh({ side })
      const lines = hubLines(side, [0, 0, 0, 0])

      return momentumFailures(storeOf(lines, new Int8Array(lines.length).fill(1)), side, (x, d) => mesh.neighbour(x, d))
    })
    const unorientedForcing = { ...characterForcing(coins, unoriented.pointGroup), ...huskForcing(coins, unoriented.pointGroup) }
    const d4 = zFailures.every(z => z === 0) && unoriented.pointGroup.length === 1152 && unoriented.translations === 16 && unoriented.elements === 18432

    log('d4')

    // D5
    const q8 = twoT.filter(g => (coins.order[g] ?? 0) <= 4)
    const keptQ8 = halfSetsKept(coins, q8)
    const kept2T = halfSetsKept(coins, twoT)
    const lifts = liftSearch(coins, 4)
    const oriented = orientedHub(coins)
    const box8 = boxMaps(coins, 8)
    const store8 = orientedHubStore(coins, 8, [0, 0, 0, 0])
    const symmetry = patternSymmetry(coins, box8, store8)
    const reflections = symmetry.pointGroup.filter(g => coins.order[g] === 2 && determinantOf(coins, g) === -1 && (coins.doubled[g] ?? []).reduce((s, row, i) => s + (row[i] as number), 0) === 4)
    const orientedForcing = { ...characterForcing(coins, symmetry.pointGroup), ...huskForcing(coins, symmetry.pointGroup) }
    // a long-root reflection fixes the line of its root and sends it to its reverse; a short-root one reverses no line
    const longReflections = reflections.filter(g => (coins.lineImage[g] as Int8Array).some((m, l) => m === l && (coins.lineSign[g] as Int8Array)[l] === -1)).length
    const shortReflections = reflections.length - longReflections
    const d5 =
      keptQ8 === 0 &&
      kept2T === 0 &&
      lifts.oriented === 0 &&
      symmetry.elements === 9216 &&
      symmetry.pointGroup.length === 576 &&
      symmetry.withoutC.length === 576 &&
      symmetry.translations === 16 &&
      reflections.length === 12 &&
      longReflections === 0 &&
      orientedForcing.bulk2 &&
      orientedForcing.bulk4 &&
      orientedForcing.husk4 &&
      orientedForcing.huskShear2

    log('d5')

    // D6
    const runs = [4, 8].map(side => runOf(side, orientedHubStore(coins, side, [0, 0, 0, 0])))
    const d6 = runs.every(r => r.ok)

    log('d6')

    // D7
    const table4 = isometricTable()
    const averaged = averagedMatrices({ table: table4, store: orientedHubStore(coins, 4, [0, 0, 0, 0]), cells: 256, permutations: table.permutations })
    const defect = Math.max(equivarianceDefect(averaged.even, table.permutations), equivarianceDefect(averaged.odd, table.permutations))
    const transport = readTransport([averaged.even, averaged.odd])
    const t3 = transport.three
    const d7 =
      defect < 1e-10 &&
      averaged.carriers === 24 &&
      averaged.stored === 192 &&
      (t3.charge ?? 0) >= 3.5 &&
      (t3.trace ?? 0) >= 3.5 &&
      (t3.sound ?? 0) >= 3.5 &&
      Math.abs((t3.shear ?? 0) - 2) <= 0.5

    log('d7')

    // W
    const r0 = d4Coordinates(ROOTS[LINE_FIRSTS[0] as number] as number[])
    const mid = WAKE_SIDE / 2
    const center = d4BoxCell({ coordinates: [mid, mid, mid, mid], side: WAKE_SIDE })
    const hubAt = [mid, mid, mid, mid].map((v, k) => v - (r0[k] as number))
    const hubStore = orientedHubStore(coins, WAKE_SIDE, hubAt)
    const oneLine = uniformStore(WAKE_SIDE ** 4, [0])
    const hubLove = wakeOf(WAKE_SIDE, hubStore, center, 1)
    const hubFear = wakeOf(WAKE_SIDE, hubStore, center, -1)
    const lineLove = wakeOf(WAKE_SIDE, oneLine, center, 1)
    const lineFear = wakeOf(WAKE_SIDE, oneLine, center, -1)
    const noMore = (a: number[], b: number[]): boolean => a.every((x, p) => x <= (b[p] ?? 0))
    const w = noMore(hubLove.perPeriod, lineLove.perPeriod) && noMore(hubFear.perPeriod, lineFear.perPeriod)

    log('w')

    // reported: the 2T chain pattern and its wake
    const chain = chainPattern(coins, 4)
    const chainStore4 = storeOf(chain.lines, chain.orientation.signs)
    const chainSymmetry = patternSymmetry(coins, hub4, chainStore4)
    const chainForcing = { ...characterForcing(coins, chainSymmetry.pointGroup), ...huskForcing(coins, chainSymmetry.pointGroup) }
    const chainStore8 = tileStore(chainStore4, 4, WAKE_SIDE)
    const chainRun = runOf(WAKE_SIDE, chainStore8)
    let chainCenter = center

    for (let x = center; x < WAKE_SIDE ** 4; x++) {
      if (chainStore8.slice(x * 12, x * 12 + 12).some(v => v !== 0)) {
        chainCenter = x
        break
      }
    }

    const chainLove = wakeOf(WAKE_SIDE, chainStore8, chainCenter, 1)

    log('chain')

    const instruments = d1 && d2 && d3 && d4 && d5 && d6 && d7
    const status = instruments ? (w ? 'pass' : 'fail') : 'partial'
    const list = (xs: readonly number[]): string => xs.join(', ')

    return verdict({
      status,
      claim: `a living vacuum can break W(F4) dock by dock and keep the husk transport isotropic, but not with a line on every dock and not on the battery's odd boxes, and the one found melts: over the 4,095 line sets only the full 12 is a 4-design, so isotropy needs every line equally; every one of the ${forcing} forcing subgroups found holds -1 and a vector-free order-3 element, whose affine image fixes a dock of every periodic cell (0 exceptions on sides 2 to 8), so some docks must store nothing; 2T-invariant cells have square index, the least is 16 docks, and it carries the HUB pattern (12 stored lines, 4 empty, (Z) by pairs, line pattern kept by all 1,152); no uniform orientation keeps Q8, no lift of W(F4) orients it (0 of ${lifts.tried}), and one orientation of period 4 D4 keeps ${symmetry.pointGroup.length} elements (12 short reflections, no long one), which force the husk scalars through k^4 and the shear at leading order; the oriented hub vacuum runs with period ${runs[1]?.period} and no veto, its cell-averaged transport commutes with W(F4) (${defect.toExponential(1)}; charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}), but a lone love's wake on side 8 is ${list(hubLove.perPeriod)} trits per period against the one-line vacuum's ${list(lineLove.perPeriod)}: every hub holds 24 vacuum vibes at beat 1 and a lone vibe scatters them`,
      metrics: {
        fourDesigns: designs.fourDesigns,
        twoDesigns: designs.twoDesigns,
        subgroups: groups.length,
        forcingRank2: forcing2,
        forcingRank2And4: forcing,
        fact2Exceptions: exceptions,
        vectorFreeOrder3: free3.length,
        ...Object.fromEntries(fixedDock.flatMap(f => [
          [`side${f.side}FreeTranslations`, f.free],
          [`side${f.side}FreeCommuting`, f.commuting],
        ])),
        invariantIndexCount: allIndices.length,
        leastIndexAtLeast13: allIndices.find(i => i >= 13) ?? -1,
        hubZFailuresSide4: zFailures[0] ?? -1,
        hubZFailuresSide8: zFailures[1] ?? -1,
        unorientedElements: unoriented.elements,
        unorientedPointGroup: unoriented.pointGroup.length,
        unorientedTranslations: unoriented.translations,
        unorientedHuskShear: unorientedForcing.huskShear2 ? 1 : 0,
        uniformOrientationsKeepingQ8: keptQ8,
        uniformOrientationsKeeping2T: kept2T,
        liftsTried: lifts.tried,
        liftsOriented: lifts.oriented,
        liftsLeastConflicts: lifts.leastConflicts,
        orientedExtraElement: oriented.extra,
        orientedOrbits: oriented.orbits,
        orientedElements: symmetry.elements,
        orientedPointGroup: symmetry.pointGroup.length,
        orientedWithoutC: symmetry.withoutC.length,
        orientedTranslations: symmetry.translations,
        orientedReflections: reflections.length,
        orientedLongReflections: longReflections,
        orientedShortReflections: shortReflections,
        orientedBulk2: orientedForcing.bulk2 ? 1 : 0,
        orientedBulk4: orientedForcing.bulk4 ? 1 : 0,
        orientedHusk4: orientedForcing.husk4 ? 1 : 0,
        orientedHuskShear: orientedForcing.huskShear2 ? 1 : 0,
        runSide4Units: runs[0]?.units ?? -1,
        runSide8Units: runs[1]?.units ?? -1,
        runSide8Period: runs[1]?.period ?? -1,
        averagedDefect: defect,
        averagedStored: averaged.stored,
        averagedEmpty: averaged.empty,
        averagedCarriers: averaged.carriers,
        averagedInvariants: transport.invariants,
        averagedKc: transport.kc,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].flatMap(q => [
          [`averaged_${q}_exponent3`, t3[q] ?? Number.NaN],
          [`averaged_${q}_exponent5`, transport.five[q] ?? Number.NaN],
          [`averaged_${q}_anisotropyLongest`, transport.anisotropy[q]?.at(-1) ?? Number.NaN],
        ])),
        ...Object.fromEntries(hubLove.perPeriod.map((x, p) => [`hubLovePeriod${p + 1}`, x])),
        ...Object.fromEntries(hubFear.perPeriod.map((x, p) => [`hubFearPeriod${p + 1}`, x])),
        ...Object.fromEntries(lineLove.perPeriod.map((x, p) => [`oneLineLovePeriod${p + 1}`, x])),
        ...Object.fromEntries(lineFear.perPeriod.map((x, p) => [`oneLineFearPeriod${p + 1}`, x])),
        hubBareDirections: hubLove.byDirection.filter(x => x === 1).length,
        chainUnits4: chain.units,
        chainOrbitsChosen: chain.chosen,
        chainSearchExact: chain.exact ? 1 : 0,
        chainOriented: chain.orientation.ok ? 1 : 0,
        chainPointGroup: chainSymmetry.pointGroup.length,
        chainBulk4: chainForcing.bulk4 ? 1 : 0,
        chainHuskShear: chainForcing.huskShear2 ? 1 : 0,
        chainRunPeriod: chainRun.period,
        chainZDocks: chainRun.momentumDocks,
        ...Object.fromEntries(chainLove.perPeriod.map((x, p) => [`chainLovePeriod${p + 1}`, x])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        oneLineLovePeriod1: lineLove.perPeriod[0] ?? -1,
        uniformOrientationsKeepingQ8: keptQ8,
      },
      notes: `L2. Gates: D1 ${d1}, D2 ${d2}, D3 ${d3}, D4 ${d4}, D5 ${d5}, D6 ${d6}, D7 ${d7}, W ${w}. Designs: ${designs.twoDesigns} 2-designs (sizes ${designs.twoDesignSizes.join(', ')}, frames ${JSON.stringify(designs.frames)}), ${designs.fourDesigns} 4-design. Census: ${groups.length} two-generated subgroups of W(F4), ${forcing2} force the bulk quadratics, ${forcing} the quadratics and quartics, ${exceptions} lack -1 or a vector-free order-3 element. Fixed docks (16 vector-free order-3 elements; free translations and free commuting ones by side 2 to 8): ${fixedDock.map(f => `${f.side}: ${f.free}/${f.commuting}`).join(', ')}. 2T-invariant indices seen: ${allIndices.join(', ')}. Hub pattern: (Z) failures ${zFailures.join(' and ')} on sides 4 and 8; unoriented symmetry ${unoriented.elements} elements (point group ${unoriented.pointGroup.length}, translations ${unoriented.translations}), husk shear forced ${unorientedForcing.huskShear2}. Orientation: uniform half-sets kept by Q8 ${keptQ8}, by 2T ${kept2T}; W(F4) lifts oriented ${lifts.oriented} of ${lifts.tried} (least conflicts ${lifts.leastConflicts}); oriented hub: extra element ${oriented.extra}, ${oriented.orbits} orbits of units, symmetry ${symmetry.elements} elements, point group ${symmetry.pointGroup.length} (${symmetry.withoutC.length} without C), ${symmetry.translations} translations on side 8, reflections ${reflections.length} (long ${longReflections}), forcing bulk2 ${orientedForcing.bulk2} bulk4 ${orientedForcing.bulk4} husk4 ${orientedForcing.husk4} shear ${orientedForcing.huskShear2}. Run: side 4 ${runs[0]?.tallies} (units ${runs[0]?.units}), side 8 ${runs[1]?.tallies} (units ${runs[1]?.units}), period ${runs[1]?.period}. First-order transport (cell average of ${averaged.stored} stored and ${averaged.empty} empty docks over ${averaged.carriers} oriented roots): defect ${defect.toExponential(2)}, ${transport.invariants} invariants, exponents over three rungs charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}. Wakes on side ${WAKE_SIDE} per period: hub love ${list(hubLove.perPeriod)}, fear ${list(hubFear.perPeriod)} (bare directions ${hubLove.byDirection.filter(x => x === 1).length} of 24); one-line love ${list(lineLove.perPeriod)}, fear ${list(lineFear.perPeriod)}. Chain pattern (2T, one antipodal pair per dock at beat 1): ${chain.units} units of 256 on side 4 (${chain.chosen} orbits of ${chain.usable} usable, search exact ${chain.exact}), oriented ${chain.orientation.ok}, point group ${chainSymmetry.pointGroup.length} (bulk4 ${chainForcing.bulk4}, shear ${chainForcing.huskShear2}), (Z) docks ${chainRun.momentumDocks}, period ${chainRun.period}, tallies ${chainRun.tallies}, love wake ${list(chainLove.perPeriod)}: one pair per dock does not stop the melt either. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
