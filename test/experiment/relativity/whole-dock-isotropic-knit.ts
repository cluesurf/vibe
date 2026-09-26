// Can one collision, run at every dock and every beat, have exact CPT and rotation isotropy forced by its
// symmetry, and keep everything else? E-RLT-0048 to E-RLT-0050 closed every knit whose beats pair the lines
// into couples on a schedule. A period-one knit needs no schedule: if its collision commutes with a group G
// of coin maps acting irreducibly on R^4, rank-2 isotropy is forced, and CPT is one condition on the table
// (negating every tone turns it into its inverse). This experiment asks what the other laws allow, and
// builds the best such knit.
//
// 1. THE COLOR SIDE (code/measure/color-isotropy-bound). Local color counts a calm slot by its side sign, so
//    an exactly color-local collision keeps the side sum D = sum of the twelve line momenta n_l. The full
//    signed stabilizer of every one of the 4,096 side choices, and whether any acts irreducibly.
// 2. THE BOUND. A knit whose period group G acts irreducibly keeps, at every beat, P and D o g for every g
//    in G (a symmetry carries a beat to a beat or a beat inverse, and both keep D). Every subspace spanned
//    by P, D and two images of D of dimension at most 7, and whether its stabilizer acts irreducibly: if
//    none does, every irreducible G forces at least 8 independent line-momentum invariants, where the
//    scatter weave (E-FLD-0024) keeps 5. The census over every conjugate of every two-generated irreducible
//    group gives the constraint table (forced rank by group order).
// 3. THE GROUPS OF LEAST RANK, exhaustively: every subgroup of the irreducible stabilizers of the
//    dimension-8 spaces. For each, whether it holds -1, whether a tone twist can send -1 to charge
//    conjugation (needed for a pair clock (t, -t) on a line to be symmetric), and whether it keeps an
//    oriented couple partition (needed for a two-line clock of like pairs).
// 4. THE QUATERNION KNIT (code/rule/quaternion-knit), built from what survives: Q8, the couple clock of like
//    pairs, the one-candidate lone exchange on the eight free lines, C = E B E. Its full ledger on lone,
//    dense, head-on and move-firing states (glides, reversals, the group and its forced spread), exact
//    reversal and charge, CPT, P and every forced form kept at every dock of a dense run while the line
//    momenta change, the vacuum's period, the acceptance battery of E-FRC-0125 against the committed knit,
//    dressing at sides 7, 9 and 11 for both signs (E-FRC-0136), and the long-wave response of E-RLT-0045 at
//    sides 9 and 13 against the committed knit's.
//
// Gates, fixed before the experiment was written but after the couple-table search had shown the knit's
// first-period dressing (289, against 33): no side choice has an irreducible stabilizer; no subspace of
// dimension 7 or less has one (so at least 8 forms are forced); the least rank is 8 and is reached; every
// least-rank group holds -1 and no twist sends -1 to charge conjugation; only groups of order 8 keep couple
// partitions; the quaternion knit's glide group is irreducible (spread under 1e-12) with CPT at the identity
// coin map, exact reversal, charge, P and forced forms, some line-momentum change, a vacuum that clocks, and
// a long-wave anisotropy under half the committed knit's at side 9; and its dressing exceeds the committed
// knit's at every side and sign (the cost that remains after the proof).
// Added after a probe had shown the single-background response gate failing, reported and not gated: the
// side-9 kernel averaged over 1, 4 and 16 start times for this knit and for the combined knit, to tell noise
// (falling with averaging) from structure (staying). The registered response gate is kept as it was; with
// every other gate met and it failed, the verdict is partial, never pass.
//
// Depth L2: exhaustive group theory with a proof by enumeration, and a constructed knit measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { linearMapOf } from '@/code/substrate/d4-box'
import { d4BoxMesh, d4BoxCell } from '@/code/substrate/d4-box'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { EXCHANGE_LINES, forcedFunctionals, quaternionKnit } from '@/code/rule/quaternion-knit'
import { CHARGE_CONJUGATION, denseCellStates, moveFiringStates, symmetryLedger } from '@/code/measure/rule-symmetry-ledger'
import { conjugacyClasses, matrixGroupClosure } from '@/code/measure/glide-group'
import { chargeWaveResponse, forcedIsotropySpread, kernelParts, responseKernel, unitSamples } from '@/code/measure/coarse-modes'
import { acceptance, dressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import {
  closure,
  forcedForms,
  forcedRankBound,
  groupTable,
  keptCouplePartitions,
  leastRankGroups,
  sideStabilizerCensus,
  twists,
} from '@/code/measure/color-isotropy-bound'
import { collide, stream } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'

const GENERIC = [0.31, -0.74, 0.52, 0.29]
const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))
const DRESSING_SIDES = [7, 9, 11]
const RESPONSE_SIDES = [9, 13]
const GOLDEN = (Math.sqrt(5) - 1) / 2

function anisotropy(side: number, schedule: ReturnType<typeof quaternionKnit>): number {
  return averagedAnisotropy(side, schedule, 1)[0] ?? 0
}

// the kernel averaged over `samples` start times 6 beats apart; the anisotropy after 1, 4 and 16 samples
// (or as many as run): a structural anisotropy stays, noise falls
function averagedAnisotropy(side: number, schedule: ReturnType<typeof quaternionKnit>, samples: number): number[] {
  let sum: number[][][] | undefined
  const out: number[] = []

  for (let j = 0; j < samples; j++) {
    const records = chargeWaveResponse({ mesh: d4Mesh({ side }), side, schedule, directions: rootsD4(), modes: AXES, epsilon: 0.1, warm: 48 + 6 * j, beats: 2 * side })
    const kernel = responseKernel(records)

    sum = sum ? sum.map((m, t) => m.map((row, i) => row.map((x, k) => x + (kernel[t]?.[i]?.[k] ?? 0)))) : kernel

    if ([1, 4, 16].includes(j + 1)) {
      const parts = kernelParts(sum.map(m => m.map(row => row.map(x => x / (j + 1)))))

      out.push(parts.anisotropic / parts.isotropic)
    }
  }

  return out
}

export default experiment({
  id: 'relativity/whole-dock-isotropic-knit',
  code: 'E-RLT-0051',
  title:
    'no knit has exact local color, forced rotation isotropy and momentum exchange as free as the scatter weave\'s: no irreducible coin group keeps the side signs of any of the 4,096 side choices, so a knit whose period group acts irreducibly keeps P and every image of the side sum, at least 8 line-momentum invariants (every subspace of 7 or fewer has a reducible stabilizer) where the scatter weave keeps 5, and 12 (no exchange at all) for 235 of the 320 two-generated irreducible groups; the 109 groups that reach 8 all hold -1 acting without charge conjugation, so no pair clock on a line is symmetric and the vacuum must clock with like pairs on two lines, and only the two quaternion groups keep couples for it; the quaternion knit built on that (one collision, exchange and couple clock, C = E B E) has exact CPT, Q8 forcing rank-2 isotropy (spread 1.3e-15), exact reversal, charge, P and every forced invariant, a clocking vacuum (period 3), exchange on 8 lines and connected line graphs, but its dressing runs away (289, 7,219, 68,735, 106,055 slots at side 9 against the committed 33, 160, 565, 1,508), and its single-background long-wave response reads 2.80 (noise that falls to 1.03 over 16 start times, where the combined knit stays at 0.80)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const table = groupTable()
    const roots = rootsD4()
    const n = table.permutations.length

    // 1 and 2
    const sides = sideStabilizerCensus(table)
    const bound = forcedRankBound(table)

    // the constraint table over every conjugate of every two-generated irreducible group
    const { classOf } = conjugacyClasses(table.permutations)
    const reps = new Map<number, number>()

    table.permutations.forEach((_, i) => {
      if (!reps.has(classOf[i] ?? -1)) reps.set(classOf[i] ?? -1, i)
    })

    const twoGenerated = new Map<string, number[]>()

    for (const a of reps.values()) {
      for (let b = 0; b < n; b++) {
        const g = closure(table, [a, b])

        if (table.spread(g) < 1e-9) twoGenerated.set(g.join(','), g)
      }
    }

    const conjugates = new Map<string, number[]>()

    for (const g of twoGenerated.values()) {
      for (let h = 0; h < n; h++) {
        const k = g.map(x => table.multiply[(table.multiply[h * n + x] ?? 0) * n + (table.inverse[h] ?? 0)] ?? 0).sort((p, q) => p - q)

        conjugates.set(k.join(','), k)
      }
    }

    const constraint = new Map<string, number>()
    let leastInCensus = 99

    for (const g of conjugates.values()) {
      const r = forcedForms(table, g).length

      leastInCensus = Math.min(leastInCensus, r)
      constraint.set(`order${g.length}Rank${r}`, (constraint.get(`order${g.length}Rank${r}`) ?? 0) + 1)
    }

    // 3
    const least = leastRankGroups(table)
    const allHoldMinus = least.groups.every(g => g.includes(table.minus))
    const pairClockTwists = least.groups.filter(g => twists(table, g).some(t => t.get(table.minus) === -1)).length
    const coupleKeepers = least.groups.filter(g => twists(table, g).some(t => keptCouplePartitions(table, g, t, 1) > 0))
    const onlyOrderEight = coupleKeepers.length > 0 && coupleKeepers.every(g => g.length === 8)

    // 4. the quaternion knit
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
    const forward = quaternionKnit({ opposite })
    const inverse = quaternionKnit({ opposite, forward: false })
    const headOn = Array.from({ length: 128 }, (_, m) =>
      Int8Array.from({ length: 24 }, (__, d) => {
        const l = d < (opposite[d] ?? d) ? d : (opposite[d] ?? d)

        return (((m * 7 + l * 5 + ((m * l) % 7)) % 3) - 1) as number
      }),
    )
    const pairs: [number, number, number, number][] = []

    for (let u = 0; u < 24; u++) for (let v = u + 1; v < 24; v++) pairs.push([u, v, u, v])

    const ledger = symmetryLedger({
      forward,
      inverse,
      period: 1,
      permutations: table.permutations,
      degree: 24,
      quickDense: 64,
      thoroughDense: 1024,
      extraStates: [...headOn, ...moveFiringStates({ moves: pairs, degree: 24 })],
    })
    const glides = ledger.filter(e => e.kind === 'forward')
    const reversals = ledger.filter(e => e.kind === 'reversal')
    const glideGroup = matrixGroupClosure(glides.map(e => linearMapOf(table.permutations[e.p] ?? []) ?? []))
    const glideSpread = forcedIsotropySpread({ group: glideGroup, rank: 2, generic: GENERIC, samples: unitSamples(64) })
    const cpt = reversals.some(e => e.p === table.identity && e.tau === CHARGE_CONJUGATION)
    const minusGlide = glides.filter(e => e.p === table.minus).map(e => e.tau)
    const plainCharge = glides.some(e => e.p === table.identity && e.tau === CHARGE_CONJUGATION)

    // conservation on a dense run (side 5 box, 48 beats): charge, P, every forced form at every dock, and how
    // often the line momenta change
    const forms = forcedFunctionals()
    const lineMomenta = (s: Int8Array, base: number): number[] =>
      table.firsts.map(d => Math.abs(s[base + d] ?? 0) - Math.abs(s[base + (opposite[d] ?? 0)] ?? 0))
    let will: Will = makeWill(d4BoxMesh({ side: 5 }))

    for (let i = 0; i < will.data.length; i++) {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      will.data[i] = u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    }

    let formBreaks = 0
    let momentumChanges = 0
    let exchangeLineChanges = 0
    let frozenLineChanges = 0
    const docks = will.mesh.cellCount
    const collision = forward(0)

    for (let t = 0; t < 48; t++) {
      for (let x = 0; x < docks; x++) {
        const before = lineMomenta(will.data, x * 24)

        collision(will.data, x * 24, 24)

        const after = lineMomenta(will.data, x * 24)

        for (const row of forms) {
          if (Math.abs(row.reduce((a, c, l) => a + c * ((after[l] ?? 0) - (before[l] ?? 0)), 0)) > 1e-9) formBreaks++
        }

        if (after.some((v, l) => v !== before[l])) momentumChanges++

        after.forEach((v, l) => {
          if (v !== before[l]) {
            if (EXCHANGE_LINES.includes(l)) exchangeLineChanges++
            else frozenLineChanges++
          }
        })
      }

      will = stream(will)
    }

    void collide

    // the battery against the committed knit
    const rule: ScheduledRule = (o, f) => quaternionKnit({ opposite: o, forward: f })
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const battery = acceptance(rule)
    const committed = acceptance(committedRule)
    const dressings = DRESSING_SIDES.flatMap(side =>
      [1, -1].map(tone => ({
        side,
        tone,
        knit: dressing(rule, { tone, side }).periodLargest,
        committed: dressing(committedRule, { tone, side }).periodLargest,
      })),
    )
    const dressedMore = dressings.every(d => d.knit.every((x, p) => x > (d.committed[p] ?? 0)))
    const responses = RESPONSE_SIDES.map(side => ({
      side,
      knit: anisotropy(side, quaternionKnit({ opposite: meshOpposites(d4Mesh({ side })) })),
      committed: anisotropy(side, turningWeave({ opposite: meshOpposites(d4Mesh({ side })) })),
    }))
    const isotropic = (responses[0]?.knit ?? 1) < 0.5 * (responses[0]?.committed ?? 0)
    // reported, not gated (added after the single-sample reading was seen): the side-9 kernel averaged over
    // 1, 4 and 16 start times, for this knit and for the combined knit (CPT, reducible period group)
    const averaged = averagedAnisotropy(9, quaternionKnit({ opposite: meshOpposites(d4Mesh({ side: 9 })) }), 16)
    const combinedAveraged = averagedAnisotropy(9, combinedCollision({ spec: COMBINED_DEFAULT, opposite: meshOpposites(d4Mesh({ side: 9 })) }), 16)
    const vacuumCell = new Int8Array(24)

    collision(vacuumCell, 0, 24)

    const calmClocks = vacuumCell.some(x => x !== 0)

    void d4BoxCell
    void roots

    const rest =
      sides.irreducible === 0 &&
      bound.irreducible === 0 &&
      leastInCensus === 8 &&
      least.groups.length > 0 &&
      allHoldMinus &&
      pairClockTwists === 0 &&
      onlyOrderEight &&
      glideSpread < 1e-12 &&
      cpt &&
      battery.reverses &&
      battery.chargeKept &&
      formBreaks === 0 &&
      exchangeLineChanges > 0 &&
      frozenLineChanges === 0 &&
      calmClocks &&
      battery.vacuumPeriod > 0 &&
      dressedMore

    return verdict({
      // every gate but the single-background response: partial, since that gate stays failed as registered
      status: rest && isotropic ? 'pass' : rest ? 'partial' : 'fail',
      claim:
        'no side choice has an irreducible signed stabilizer; no forced subspace of dimension 7 or less has one, so every irreducible period group forces at least 8 line-momentum invariants, and 8 is reached; every least-rank group holds -1 with the plain tone map and only order-8 groups keep couples; the quaternion knit has an irreducible Q8 glide group, CPT at the identity coin map, exact reversal, charge, P and forced invariants with exchange on its free lines, and a clocking vacuum, and dresses more than the committed knit at every side, sign and period; its single-background long-wave anisotropy at side 9 is not under half the committed knit\'s (the registered gate that fails)',
      metrics: {
        sideChoices: 4096,
        sideChoicesWithIrreducibleStabilizer: sides.irreducible,
        largestSignedSideStabilizer: sides.largest,
        imagesOfTheSideSum: bound.images,
        subspacesOfDimensionAtMost7: bound.subspaces,
        subspacesWithIrreducibleStabilizer: bound.irreducible,
        twoGeneratedIrreducibleGroupsEveryConjugate: conjugates.size,
        leastForcedRankInCensus: leastInCensus,
        ...Object.fromEntries([...constraint].sort()),
        dimension8Spaces: least.spaces,
        irreducibleDimension8Stabilizers: least.hosts.length,
        leastRankGroups: least.groups.length,
        leastRankGroupsHoldingMinusOne: least.groups.filter(g => g.includes(table.minus)).length,
        leastRankGroupsWithAPairClockTwist: pairClockTwists,
        leastRankGroupsKeepingCouples: coupleKeepers.length,
        knitGlides: glides.length,
        knitReversals: reversals.length,
        knitGlideGroupOrder: glideGroup.length,
        knitForcedSpread: Number(glideSpread.toExponential(2)),
        knitCpt: cpt ? 1 : 0,
        knitMinusOneToneMap: minusGlide[0] ?? -1,
        knitChargeConjugationAlone: plainCharge ? 1 : 0,
        knitFormBreaks: formBreaks,
        knitDockBeatsWithMomentumExchange: momentumChanges,
        knitExchangeLineChanges: exchangeLineChanges,
        knitFrozenLineChanges: frozenLineChanges,
        knitVacuumPeriod: battery.vacuumPeriod,
        knitReverses: battery.reverses ? 1 : 0,
        knitChargeKept: battery.chargeKept ? 1 : 0,
        knitCptPhase: battery.cptPhase,
        knitVacuumComponents: battery.vacuumComponents,
        knitDenseComponents: battery.denseComponents,
        knitAdditivityWorst: battery.additivityWorst,
        knitWallQuantized: battery.wallQuantized ? 1 : 0,
        knitTravellers: battery.travellers,
        ...Object.fromEntries(
          dressings.flatMap(d => d.knit.map((x, p) => [`knit${d.tone > 0 ? 'Love' : 'Fear'}Side${d.side}Period${p + 1}`, x])),
        ),
        ...Object.fromEntries(responses.map(r => [`knitAnisotropySide${r.side}`, Number(r.knit.toFixed(4))])),
        ...Object.fromEntries(averaged.map((x, i) => [`knitSide9AnisotropyOver${[1, 4, 16][i]}Starts`, Number(x.toFixed(4))])),
        ...Object.fromEntries(combinedAveraged.map((x, i) => [`combinedSide9AnisotropyOver${[1, 4, 16][i]}Starts`, Number(x.toFixed(4))])),
      },
      control: {
        committedVacuumPeriod: committed.vacuumPeriod,
        committedVacuumComponents: committed.vacuumComponents,
        committedDenseComponents: committed.denseComponents,
        committedTravellers: committed.travellers,
        committedCptPhase: committed.cptPhase,
        ...Object.fromEntries(
          dressings.flatMap(d => d.committed.map((x, p) => [`committed${d.tone > 0 ? 'Love' : 'Fear'}Side${d.side}Period${p + 1}`, x])),
        ),
        ...Object.fromEntries(responses.map(r => [`committedAnisotropySide${r.side}`, Number(r.committed.toFixed(4))])),
      },
      notes:
        'L2. THE PROOF. Exact local color, with role points carried slot for slot and calm ones paired by side, is exactly a kept side sum D per dock. A symmetry g of a knit carries each beat to a beat or a beat inverse, so every beat also keeps D o g. The forced forms are P (4) plus the span of G . D. If that span had rank 7 or less, it would be spanned by P, D and two images of D, it would be G-invariant, and G would lie in its stabilizer; all 249 such subspaces have reducible stabilizers, so rank 8 is the floor over every irreducible subgroup of W(F4), not only the two-generated ones censused. The scatter weave keeps 5 (E-FLD-0024); isotropy by symmetry costs at least 3 more, and for 235 of 320 two-generated irreducible groups all 12 (every line momentum frozen, no exchange). The bound assumes the symmetries keep calm; E-RLT-0052 shows uniform calm-moving relabelings freeze the vacuum and finds no per-side one on any knit, but per-side maps are not excluded in general. THE VACUUM. Every least-rank group is a subgroup of one of 4 irreducible stabilizers (orders 384, 64, 64, 64) of the 1,113 dimension-8 spaces, 109 in all; each holds -1, and -1 lies in the subgroup of squares and commutators, so every tone twist sends it to the plain map: a calm line cannot become (t, -t) symmetrically, and charge-free like pairs on two lines are the only clock. Only the two Q8 (left and right unit quaternions) keep an oriented couple partition (160 each under three of their four twists). THE KNIT. Q8 frees 4 line-momentum directions on 8 lines (e1 +- e3, e2 +- e4, e1 +- e4, e2 +- e3) and freezes the frame e1 +- e2, e3 +- e4; no Q8-invariant quad partition of the free lines hosts any allowed binary scattering, so the exchange reads all 8 lines at once and fires on the 24 lone pairs with exactly one partner. On a dense side-5 run it changed line momenta at 87 dock-beats of 48 x 625 (348 line changes, none on a frozen line), and it changes the outcome of 3.3 percent of random dock states. The couple tables were searched (hill climbing on the first-period dressing, four starts from the plain table, one start with only the two couples of the second orbit clocking): 72,161 for the plain table, then 313, 711, 809, 289, 365 and 385; 289 is the knit. The dressing is supercritical at every side: a lone tone breaks a four-slot creation event, and the broken event throws out like pairs that break more. Travel 4 of 24 (committed 12). P is exact (-1 acts without C), and C and CP are both broken, as in the committed knit. The fear beat (E-QTM-0109) was not ported: its kernels read wire meetings, which this knit does not have, so compatibility is not measured. THE RESPONSE. One background reads 2.80 at side 9 and 1.90 at side 13, above the committed 1.60 and 1.34, and fails the registered gate; the isotropic part is small (0.24 against the combined knit\'s 1.00), the copies decorrelate as the dressing does, and the reading falls with averaging (2.80, 1.60, 1.03 over 1, 4, 16 start times) where the combined knit\'s structural anisotropy stays (0.84, 0.80, 0.80). Forced isotropy is exact in the ensemble mean; the instrument sees it only through that averaging.',
    })
  },
})
