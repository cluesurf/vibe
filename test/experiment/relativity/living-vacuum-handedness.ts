// Does the living vacuum pick a handedness? The lone-love response of the living-pair knit's hot vacua, self-dual
// against anti-self-dual (E-FRC-0142's measure), E-RLT-0076.
//
// THE QUESTION. The living-pair knit (code/rule/living-pair-knit, E-RLT-0074) keeps all 1,152 coin maps, the 576
// orientation-reversing ones among them: the rule has exact parity. So a handedness, if the knit is to have one, must
// come from the vacuum STATE, as a spontaneous breaking: a vacuum and its mirror image both allowed, each with the
// opposite handedness. Two parts of the living vacuum could carry it: the store's orientation (the hot vacuum holds one
// unit on every line, oriented) and the living pairs themselves, whose stored role points (the separated layout,
// condition (A)) the veto reads.
//
// DERIVED FIRST (exact, tmp/live-probe2.ts, disclosed): the 4,096 uniform hot orientations (every line +1 or -1 in its
// own orientation, the same on every dock; each is a period-6 living vacuum, since the derivation of E-RLT-0074 (c)
// never reads the sign) fall into 12 orbits of W(F4), and every orbit's stabilizer is half orientation-reversing
// (6 with 3, 2 with 1, 18 with 9). A response R of a covariant rule on a vacuum sigma obeys R = h R h^T for every h
// that fixes sigma, and an orientation-reversing h exchanges the self-dual and anti-self-dual halves of R's
// antisymmetric part. So on any uniform hot vacuum the self-dual and anti-self-dual parts are EQUAL, wherever the
// dynamics is covariant: the store's orientation cannot pick a handedness. What is left to break parity is what the
// orientation does not fix: the layout of the stored points (which (A) forbids to be uniform) and the colored links.
// Both are fixed backgrounds of the run, and the mirror of a layout is an equally valid layout, so any handedness they
// give comes with its mirror: spontaneous at most in the sense that the vacuum's points choose it.
//
// THE MEASURE (code/measure/living-pair-battery loneResponse): a lone love started on each of the 24 directions at one
// dock of the side-9 box, one period (24 beats); j_d is the run's charge displacement per beat against the vacuum run
// (the charge each slot's stream copies one root along); R = sum_d j_d r_d^T; its antisymmetric part split into the
// self-dual and anti-self-dual halves. The handedness is |SD - ASD| / (SD + ASD): 0 for none, and the committed knit's
// 4.1 and 4.7 (E-FRC-0142) read 0.61 and 0.65.
//
// Gates, fixed before the first run:
//  X1 the cold vacuum (no store, a lone love goes straight): SD = ASD = 0 (under 1e-12) on the colored and flat links
//  X2 covariance of the measure: on flat links, carrying the layout by an orientation-reversing element of the
//     all-plus vacuum's stabilizer (with its box cell map, the lone love's dock at the origin that the map fixes)
//     exchanges SD and ASD to 1e-9
//  G1 the 4,096 uniform hot orientations fall into 12 W(F4) orbits and every stabilizer holds orientation-reversing
//     elements
//  H  PREDICTED: the living hot vacuum picks no handedness of note: on the all-plus vacuum, for three layouts
//     (separated greedily in dock order, in reverse order, in a golden-ratio order) on the colored and on the flat
//     links, the handedness is at most 0.2 each
// Verdict: pass if X1, X2, G1 and H hold; fail if X1, X2 and G1 hold and H does not; partial otherwise.
//
// Reported, not gated: SD and ASD per configuration and their sign; the twelve orbit representatives on flat links
// with the dock-order layout; the layout-averaged antisymmetric part.
//
// FIRST RUN (31.9 s): fail on H (the prediction was wrong: the layouts give 0.05 to 0.29 on the all-plus vacuum and
// up to 0.78 on the orbit representatives). ADDED AFTER THE FIRST RUN, a reading with no gate and no gate moved: 16
// more layouts on flat links (Weyl-rotation dock orders), to ask whether the hand is set by the layout or systematic.
//
// Depth L2. DETERMINISM: fixed layouts and orders (golden ratio, Weyl rotations), exhaustive orbits, no draw. The husk is not read (a
// bulk rule's parity, stated); E-FRC-0142's response is a bulk measure too.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { orientationOf } from '@/code/measure/rule-symmetry-ledger'
import { LINE_FIRSTS, LINE_OF, SIDE } from '@/code/rule/isometric-knit'
import { layoutViolations, separatedLayout } from '@/code/rule/living-pair-knit'
import { loneResponse, weaveOf } from '@/code/measure/living-pair-battery'
import { boxCellMap, linearMapOf } from '@/code/substrate/d4-box'
import { type ColorWeave } from '@/code/rule/color-weave'

const ROOTS = rootsD4()
const BOX = 9
const GOLDEN = (Math.sqrt(5) - 1) / 2

// the store pattern (a bit per line, set for -1) carried by a coin map g
function patternImage(g: readonly number[], pattern: number): number {
  let out = 0

  for (let l = 0; l < 12; l++) {
    const s = (pattern >> l) & 1 ? -1 : 1
    const e = g[LINE_FIRSTS[l] as number] as number

    if (s * (SIDE[e] as number) === -1) out |= 1 << (LINE_OF[e] as number)
  }

  return out
}

function orbits(): { orbits: { rep: number; size: number; stabilizer: number; reversing: number }[]; reversingInEvery: boolean } {
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const orientation = permutations.map(g => orientationOf(g))
  const seen = new Int32Array(4096).fill(-1)
  const out: { rep: number; size: number; stabilizer: number; reversing: number }[] = []

  for (let p = 0; p < 4096; p++) {
    if (seen[p] !== -1) continue

    const members = new Set<number>()
    let stabilizer = 0
    let reversing = 0

    permutations.forEach((g, i) => {
      const q = patternImage(g, p)

      members.add(q)

      if (q === p) {
        stabilizer++
        reversing += orientation[i] === -1 ? 1 : 0
      }
    })

    for (const q of members) seen[q] = out.length

    out.push({ rep: p, size: members.size, stabilizer, reversing })
  }

  return { orbits: out, reversingInEvery: out.every(o => o.reversing > 0) }
}

const storeOf = (pattern: number): number[] => LINE_FIRSTS.map((_, l) => ((pattern >> l) & 1 ? -1 : 1))
const handedness = (r: { selfDual: number; antiSelfDual: number }): number => (r.selfDual + r.antiSelfDual > 1e-12 ? Math.abs(r.selfDual - r.antiSelfDual) / (r.selfDual + r.antiSelfDual) : 0)

export default experiment({
  id: 'relativity/living-vacuum-handedness',
  code: 'E-RLT-0076',
  title:
    "does the living vacuum pick a handedness, fail on the prediction: the store's orientation cannot (the 4,096 uniform hot orientations fall into 12 W(F4) orbits, every stabilizer half orientation-reversing), but the stored points can: each separated layout gives the lone-love response a handedness |SD - ASD| / (SD + ASD) of 0.05 to 0.29 on the all-plus vacuum (committed knit 0.61), up to 0.78 on the orbit representatives, the layout's own mirror gives the opposite hand exactly, and over 16 more layouts SD leads on 7, per-layout handedness 0.26 on average, while the averaged response has none (SD 72.0, ASD 70.7): one hand per vacuum, no preferred hand, read on a vacuum the lone love melts",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const weave = weaveOf(BOX)
    const cells = weave.mesh.cellCount
    const flatLinks = new Int16Array(cells * 24).fill(weave.moves.identity)
    const flatWeave: ColorWeave = { ...weave, links: flatLinks }
    const origin = 0
    const allPlus = storeOf(0)
    const orders: Record<string, number[]> = {
      forward: Array.from({ length: cells }, (_, x) => x),
      reverse: Array.from({ length: cells }, (_, x) => cells - 1 - x),
      golden: Array.from({ length: cells }, (_, x) => x).sort((a, b) => (((a + 1) * GOLDEN) % 1) - (((b + 1) * GOLDEN) % 1)),
    }

    // G1
    const exact = orbits()

    // X1
    const coldColored = loneResponse(LINE_FIRSTS.map(() => 0), { side: BOX, center: origin })
    const coldFlat = loneResponse(LINE_FIRSTS.map(() => 0), { side: BOX, links: flatLinks, center: origin })
    const x1 = [coldColored, coldFlat].every(r => r.selfDual < 1e-12 && r.antiSelfDual < 1e-12)

    // H: the all-plus vacuum on three layouts and two link fields
    const configurations: { name: string; selfDual: number; antiSelfDual: number; antisymmetric: number[]; violations: number }[] = []

    for (const [name, order] of Object.entries(orders)) {
      const colored = separatedLayout(weave, order)
      const flat = separatedLayout(flatWeave, order)
      const rc = loneResponse(allPlus, { side: BOX, layout: colored, center: origin })
      const rf = loneResponse(allPlus, { side: BOX, links: flatLinks, layout: flat, center: origin })

      configurations.push({ name: `colored-${name}`, ...rc, violations: layoutViolations(weave, colored) })
      configurations.push({ name: `flat-${name}`, ...rf, violations: layoutViolations(flatWeave, flat) })
    }

    // X2: the flat dock-order layout carried by an orientation-reversing element of the all-plus stabilizer
    const permutations = weylF4DirectionPermutations({ directions: ROOTS })
    let mirror: { selfDual: number; antiSelfDual: number } | undefined
    let mirrorBase: { selfDual: number; antiSelfDual: number } | undefined

    for (const g of permutations) {
      if (mirror || orientationOf(g) !== -1 || patternImage(g, 0) !== 0) continue

      const matrix = linearMapOf(g)
      const cellMap = matrix ? boxCellMap({ matrix, side: BOX }) : undefined

      if (!cellMap || cellMap[origin] !== origin) continue

      const flat = separatedLayout(flatWeave, orders.forward)
      const carried = new Int8Array(flat.length)

      for (let x = 0; x < cells; x++) {
        for (let l = 0; l < 12; l++) carried[(cellMap[x] as number) * 12 + (LINE_OF[g[LINE_FIRSTS[l] as number] as number] as number)] = flat[x * 12 + l] as number
      }

      mirrorBase = configurations.find(c => c.name === 'flat-forward')
      mirror = loneResponse(allPlus, { side: BOX, links: flatLinks, layout: carried, center: origin })
    }

    const x2 =
      !!mirror && !!mirrorBase && Math.abs(mirror.selfDual - mirrorBase.antiSelfDual) < 1e-9 && Math.abs(mirror.antiSelfDual - mirrorBase.selfDual) < 1e-9

    // reported: the twelve orbit representatives on flat links, dock-order layout
    const flatForward = separatedLayout(flatWeave, orders.forward)
    const perOrbit = exact.orbits.map(o => ({ rep: o.rep, ...loneResponse(storeOf(o.rep), { side: BOX, links: flatLinks, layout: flatForward, center: origin }) }))
    // added after the first run (a reading, no gate): 16 more layouts on flat links, each greedy in the order of a
    // Weyl rotation frac((x + 1) sqrt q) for the first 16 odd primes q; how many have SD above ASD, and the handedness
    // of the antisymmetric part averaged over them
    const primes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]
    const extra = primes.map(q => {
      const rate = Math.sqrt(q) - Math.floor(Math.sqrt(q))
      const order = Array.from({ length: cells }, (_, x) => x).sort((a, b) => (((a + 1) * rate) % 1) - (((b + 1) * rate) % 1))

      return loneResponse(allPlus, { side: BOX, links: flatLinks, layout: separatedLayout(flatWeave, order), center: origin })
    })
    const extraAverage = [0, 1, 2, 3, 4, 5].map(i => extra.reduce((s, r) => s + (r.antisymmetric[i] ?? 0), 0) / extra.length)
    const extraSelfDualAbove = extra.filter(r => r.selfDual > r.antiSelfDual).length
    const extraMeanHandedness = extra.reduce((s, r) => s + handedness(r), 0) / extra.length
    const h = configurations.every(c => handedness(c) <= 0.2)
    const g1 = exact.orbits.length === 12 && exact.reversingInEvery
    const status = x1 && x2 ? (g1 && h ? 'pass' : 'fail') : 'partial'
    const averaged = [0, 1, 2, 3, 4, 5].map(i => configurations.filter(c => c.name.startsWith('flat')).reduce((s, c) => s + (c.antisymmetric[i] ?? 0), 0) / 3)
    const sdOf = (a: number[]): number => Math.hypot((a[0] ?? 0) + (a[5] ?? 0), (a[1] ?? 0) - (a[4] ?? 0), (a[2] ?? 0) + (a[3] ?? 0))
    const asdOf = (a: number[]): number => Math.hypot((a[0] ?? 0) - (a[5] ?? 0), (a[1] ?? 0) + (a[4] ?? 0), (a[2] ?? 0) - (a[3] ?? 0))
    const metrics: Record<string, number> = {
      orbits: exact.orbits.length,
      orbitsWithReversingStabilizer: exact.orbits.filter(o => o.reversing > 0).length,
      coldColoredSelfDual: coldColored.selfDual,
      coldColoredAntiSelfDual: coldColored.antiSelfDual,
      coldFlatSelfDual: coldFlat.selfDual,
      coldFlatAntiSelfDual: coldFlat.antiSelfDual,
      mirrorSelfDual: mirror?.selfDual ?? -1,
      mirrorAntiSelfDual: mirror?.antiSelfDual ?? -1,
      ...Object.fromEntries(
        configurations.flatMap(c => [
          [`${c.name}_selfDual`, c.selfDual],
          [`${c.name}_antiSelfDual`, c.antiSelfDual],
          [`${c.name}_handedness`, handedness(c)],
          [`${c.name}_layoutViolations`, c.violations],
        ]),
      ),
      flatLayoutAveragedSelfDual: sdOf(averaged),
      flatLayoutAveragedAntiSelfDual: asdOf(averaged),
      extraLayouts: extra.length,
      extraSelfDualAbove,
      extraMeanHandedness,
      extraMeanSelfDual: extra.reduce((s, r) => s + r.selfDual, 0) / extra.length,
      extraMeanAntiSelfDual: extra.reduce((s, r) => s + r.antiSelfDual, 0) / extra.length,
      extraAveragedSelfDual: sdOf(extraAverage),
      extraAveragedAntiSelfDual: asdOf(extraAverage),
      ...Object.fromEntries(
        exact.orbits.flatMap((o, i) => [
          [`orbit${o.rep}_size`, o.size],
          [`orbit${o.rep}_stabilizer`, o.stabilizer],
          [`orbit${o.rep}_reversing`, o.reversing],
          [`orbit${o.rep}_selfDual`, perOrbit[i]?.selfDual ?? -1],
          [`orbit${o.rep}_antiSelfDual`, perOrbit[i]?.antiSelfDual ?? -1],
          [`orbit${o.rep}_handedness`, perOrbit[i] ? handedness(perOrbit[i]) : -1],
        ]),
      ),
      seconds: (Date.now() - started) / 1000,
    }
    const largest = Math.max(...configurations.map(handedness))
    const largestOrbit = Math.max(...perOrbit.map(handedness))

    return verdict({
      status,
      claim: `the living hot vacuum's orientation picks no hand, ${h ? 'and its stored points pick none of note' : 'but its stored points do, one per layout'}: the 4,096 uniform hot orientations fall into ${exact.orbits.length} W(F4) orbits, every stabilizer half orientation-reversing (${exact.orbits.map(o => `${o.reversing} of ${o.stabilizer}`).join(', ')}), so the store's orientation cannot choose one; on the all-plus vacuum the lone-love response's handedness |SD - ASD| / (SD + ASD) is ${configurations.map(c => `${handedness(c).toFixed(3)} (${c.name})`).join(', ')}, at most ${largest.toFixed(3)} against the committed knit's 0.61, and the twelve orbit representatives on flat links reach ${largestOrbit.toFixed(3)}; carrying the layout by an orientation-reversing element of the vacuum's own stabilizer exchanges SD and ASD ${x2 ? 'exactly' : 'NOT exactly'} (${mirror?.selfDual.toFixed(4)} and ${mirror?.antiSelfDual.toFixed(4)} against ${mirrorBase?.selfDual.toFixed(4)} and ${mirrorBase?.antiSelfDual.toFixed(4)}), so whatever handedness the stored points give, the same orientation holds its mirror`,
      metrics,
      control: { coldColoredSelfDual: coldColored.selfDual, coldFlatSelfDual: coldFlat.selfDual, committedHandedness: 0.61 },
      notes: `L2. Gates: X1 ${x1}, X2 ${x2}, G1 ${g1}, H ${h}. Per configuration SD and ASD: ${configurations.map(c => `${c.name} ${c.selfDual.toFixed(4)} / ${c.antiSelfDual.toFixed(4)}`).join('; ')}. The flat layouts averaged: SD ${sdOf(averaged).toFixed(4)}, ASD ${asdOf(averaged).toFixed(4)}. Orbits (representative: SD / ASD): ${perOrbit.map(o => `${o.rep}: ${o.selfDual.toFixed(4)} / ${o.antiSelfDual.toFixed(4)}`).join('; ')}. SIXTEEN MORE LAYOUTS on flat links (added after the first run, a reading): SD above ASD on ${extraSelfDualAbove} of ${extra.length}, mean handedness ${extraMeanHandedness.toFixed(3)}, mean SD ${metrics.extraMeanSelfDual?.toFixed(1)} and ASD ${metrics.extraMeanAntiSelfDual?.toFixed(1)}; the antisymmetric part averaged over them has SD ${sdOf(extraAverage).toFixed(1)} and ASD ${asdOf(extraAverage).toFixed(1)}. FIRST RUN (31.9 s): fail on H, recorded as is (every configuration of the all-plus vacuum but one read above 0.2, largest 0.293). What it means: the store's orientation provably carries no hand (G1), but the stored points do: each separated layout gives the response a handedness, the layout's own mirror gives the opposite one exactly (X2), and which hand a layout takes follows no rule the orientation sets. The response is read on a vacuum that the lone love melts (E-RLT-0075: 179,763 trits in the first period), so it sums the melt's currents, not a particle's. ${metrics.seconds?.toFixed(0)} s.`,
    })
  },
})
