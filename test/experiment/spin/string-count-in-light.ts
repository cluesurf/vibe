// Can the string's count ride the light's own stream? A theorem first, on a husk line and on the light's own ladder.
//
// THE QUESTION (the user's candidate resolution of E-SPN-0081's trilemma). A string's count must exist (no local
// bound confines at a range), and every local placement paid: on the tokens a flavor (Pauli lost, E-SPN-0082), at
// the end ports a pinned cluster, between the ends a stream of its own. The candidate: the light's flux column
// already streams along links (E-FRC-0230 to 0245: every flux a column of D bulk trits, the link held as columns of
// its end slots), so put the count into that stream: the count is the column's own occupation, the integer l the
// drift reads (E-SPN-0075), transported by the light's own copy. Then no register and no stream is added, the read
// is one link, the tokens carry no flavor, and the cluster travels because the count moves with the light. Is l
// recoverable locally from the light's columns as they stream, a local conservation law d l + div J = 0 on the husk
// line, so that a local bounce at each link realizes E-SPN-0075's capacity exactly?
//
// THE ANSWER IS NO, for four separate reasons, each a theorem checked here.
// THEOREM A (a line's light holds nothing of its own). On a husk line Gauss fixes every link's column from its
// neighbor and the charge between them, so the columns obeying Gauss are the charges' own field plus ONE number per
// ring (the winding). With no square there is no force step, and the light's one factor on a line is the drift, a
// diagonal phase. A line's light copies nothing: the only thing that ever writes a line's column is a charge's
// recorded hop. So on the line there is no light stream to carry a count.
// THEOREM B (l is sourced at the charges, not conserved). Under the recorded hop rho_x = bal(f_x)^2 changes only on
// the link a charge crossed, and l = sum rho changes (the string grows and shrinks). A continuity law needs a current
// whose divergence sums to zero on a ring, so no J exists: l is the string's LENGTH, made and unmade at its ends.
// A count that confines is l plus a RESERVE, and the reserve must be a register that some copy carries.
// THEOREM C (where the light does stream, it keeps no count). On the plaquette ladder (the light's own rule,
// E-FRC-0230, with a stand-in charge's recorded hop) a diagonal register the beat keeps must be constant on every
// connected piece of the beat's support. Those pieces are exactly the Gauss classes split by the winding, and l takes
// many values on every one: the light's loops make and unmake l freely (electric into magnetic), so the light copies
// charge along and never length. A reserve the light carried would be spent by the photon itself.
// THEOREM D (exactness is impossible anyway). E-SPN-0075's bounce reads the string's far end in the same beat, up to
// 2D docks away (E-SPN-0081's Theorem 2, recomputed): no husk-local rule makes the same decisions.
// And the register half of the candidate fails too: a column of D trits with column sum 1 (a string link) hides at
// most floor((D - 1) / 2) neutral pairs, which no husk read sees, far short of the store's 2D + 1 values, and at
// contact, where the store is full, the string has no column at all.
//
// WHAT IS LEFT ON A LINE. The light's copy on a line IS the recorded hop, and a count carried by the hops that change
// l sits at the string's two end ports. E-SPN-0085 builds exactly that and finds it pins the cluster. So the
// trilemma closes as a theorem: a count that keeps Pauli's lock and lets the charge-one cluster travel needs a stream
// the light does not supply.
//
// PREDICTIONS, written before this file ran (no probe read any number below).
// L1 Theorem A exhaustively: for every placement of up to three loves and fears on a ring of L docks (N = 3: L = 3 to
//    6; N = 5: L = 3 to 5; N = 7: L = 3, 4) the column assignments obeying Gauss mod N at every dock number exactly N
//    when the total charge is 0 mod N and 0 otherwise: 0 exceptions.
// L2 Theorem B: under the recorded hop of locked tokens (a love-fear pair and three loves, ring 12, arcs up to 6,
//    every doublet label choice) rho changes on no link that no token crossed (0), l changes on some states, and the
//    change per beat spans exactly -2 .. 2.
// L3 Theorem C on the full register space of the ladder (N = 3 with 2 and 3 squares, N = 5 with 2; the classical
//    split c = N, r = 2, M = 2 N^2; the stand-in's recorded hop at z = zeta_M): one beat is unitary (1e-12); every
//    kept entry of its support exceeds 1e-6 and every dropped one is below 1e-12; every support component lies in
//    one Gauss class (0 mixed); every Gauss class splits into exactly N components; l is constant on no component;
//    the vacuum component reaches l > 2D; every power of the loop shift appears in the force factor (|g_s| > 1e-9).
// L4 Theorem D: in E-SPN-0075's port-store rule (a love-fear pair, D = 1, 2, 3, ring 4D + 3, its reach set from
//    contact) a token's copy changes with the label of a token 2 or more docks away on some state, the farthest
//    exactly 2D.
// L5 The hidden content: over all 3^D columns, D = 1 to 8, the most hidden pairs at |sum| = 1 is floor((D - 1) / 2),
//    and floor((D - 1) / 2) + 1 < 2D + 1 at every D.
//
// Gates, fixed with the predictions: L1 .. L5. Status pass if all hold (the theorems stand, and the answer to the
// question is no).
// FIRST RUN (2026-09-26, 1.7 s), recorded: PASS on every gate, no gate moved. The record is this run.
// HUSK: L1, L2, L4, L5 are husk-line statements; L3 is the husk light's own ladder (two husk lines joined by
// rungs). The columns are bulk trits read as their sum, E-FRC-0207. START FAMILY: nothing here reads a knit
// vacuum or a color link; every statement is exhaustive or exact over its register space.
//
// Depth L1: theorems, checked exhaustively or exactly. No stand-in is graded: the ladder's charge is E-FRC-0230's
// stand-in and appears only as the second charge whose hop the light records.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { chargePlacements, crossingSources, hiddenColumn, ladderComponents, lineGaussCount, loopCoefficients, portFarReach } from '@/code/measure/light-count'
import { inverseDepthSpec } from '@/code/rule/plaquette-ladder'

const mod = (a: number, m: number): number => ((a % m) + m) % m

export default experiment({
  id: 'spin/string-count-in-light',
  code: 'E-SPN-0084',
  title: "can the string's count ride the light's own stream, pass (the answer is no, by theorems checked exhaustively): on a husk line Gauss leaves the light one winding number, so its only copy is the recorded hop; l has no continuity law (it is a length sourced at the charges); where the light streams (the ladder) its beat keeps only Gauss data and makes and unmakes l itself; E-SPN-0075's exact capacity reads 2D docks away; and a string link's column hides floor((D - 1) / 2) pairs, far short of the store",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- L1 ----
    const lineCases = [
      ...[3, 4, 5, 6].map(L => ({ N: 3, L })),
      ...[3, 4, 5].map(L => ({ N: 5, L })),
      ...[3, 4].map(L => ({ N: 7, L })),
    ]
    const lineRows = lineCases.map(c => {
      let exceptions = 0
      let placements = 0
      let neutral = 0

      for (const q of chargePlacements(c.L)) {
        placements++

        const total = mod(q.reduce((a, b) => a + b, 0), c.N)
        const want = total === 0 ? c.N : 0

        if (total === 0) neutral++
        if (lineGaussCount(c.L, c.N, q) !== want) exceptions++
      }

      return { ...c, placements, neutral, exceptions }
    })
    const l1 = lineRows.every(r => r.exceptions === 0)

    log('l1')

    // ---- L2 ----
    const sources = [
      { name: 'pair', ...crossingSources(12, ['love', 'fear'], 6) },
      { name: 'three loves', ...crossingSources(12, ['love', 'love', 'love'], 6) },
    ]
    const l2 = sources.every(s => s.offCrossing === 0 && s.lChanged > 0 && s.lChangeRange[0] === -2 && s.lChangeRange[1] === 2)

    log('l2')

    // ---- L3 ----
    const ladders = [
      { N: 3, squares: 2 },
      { N: 3, squares: 3 },
      { N: 5, squares: 2 },
    ].map(c => {
      const spec = inverseDepthSpec(c.N, c.squares, 'force', 1)
      const comp = ladderComponents(spec)
      const g = loopCoefficients(spec)

      log(`l3 N ${c.N} squares ${c.squares}`)

      return { ...c, D: (c.N - 1) / 2, ...comp, loopMin: Math.min(...g) }
    })
    const l3 = ladders.every(
      r =>
        r.unitarity < 1e-12 &&
        r.smallestKept > 1e-6 &&
        r.largestDropped < 1e-12 &&
        r.mixedComponents === 0 &&
        r.componentsPerClass.length === 1 &&
        r.componentsPerClass[0] === r.N &&
        r.constantLComponents === 0 &&
        r.vacuumLMax > 2 * r.D &&
        r.loopMin > 1e-9,
    )

    // ---- L4 ----
    const ports = [1, 2, 3].map(D => ({ D, ...portFarReach(4 * D + 3, ['love', 'fear'], D) }))
    const l4 = ports.every(p => p.witnesses > 0 && p.farthest === 2 * p.D)

    log('l4')

    // ---- L5 ----
    const hidden = [1, 2, 3, 4, 5, 6, 7, 8].map(D => {
      const best = hiddenColumn(D)

      return { D, atOne: best[1]!, formula: Math.floor((D - 1) / 2) }
    })
    const l5 = hidden.every(h => h.atOne === h.formula && h.atOne + 1 < 2 * h.D + 1)

    const ok = l1 && l2 && l3 && l4 && l5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the string's count cannot ride the light: on a husk line Gauss leaves the light's columns one winding number and nothing per link (${lineRows.reduce((a, r) => a + r.placements, 0).toLocaleString('en-US')} charge placements over ${lineRows.length} (N, L) cases, ${lineRows.reduce((a, r) => a + r.exceptions, 0)} exceptions), so a line's light copies nothing and the only writer of a line's column is a charge's recorded hop; under that hop rho = bal(f)^2 changes only where a charge crossed (${sources.reduce((a, s) => a + s.offCrossing, 0)} off-crossing changes over ${sources.reduce((a, s) => a + s.states, 0).toLocaleString('en-US')} states) and l changes by ${sources[0]!.lChangeRange.join(' .. ')} per beat, so l has no continuity law: it is the string's length, sourced at its ends; on the light's own ladder the beat's support splits into exactly the Gauss classes times the winding (${ladders.map(r => `N ${r.N}, ${r.squares} squares: ${r.components.toLocaleString('en-US')} components, ${r.gaussClasses.toLocaleString('en-US')} classes, ${r.componentsPerClass.join('/')} each, ${r.mixedComponents} mixed`).join('; ')}) and l is constant on none (${ladders.map(r => r.constantLComponents).join(', ')}), the vacuum's piece reaching l = ${ladders.map(r => r.vacuumLMax).join(', ')} against a capacity of 2D = ${ladders.map(r => 2 * r.D).join(', ')}: the light keeps only Gauss data and spends l itself; E-SPN-0075's exact capacity reads up to 2D docks away (farthest ${ports.map(p => p.farthest).join(', ')} at D = 1 to 3); and a string link's column hides at most floor((D - 1) / 2) pairs (${hidden.map(h => h.atOne).join(', ')} at D = 1 to 8) against the store's 2D + 1 values, with no column at all at contact`,
      metrics: {
        gate_L1: l1 ? 1 : 0,
        gate_L2: l2 ? 1 : 0,
        gate_L3: l3 ? 1 : 0,
        gate_L4: l4 ? 1 : 0,
        gate_L5: l5 ? 1 : 0,
        lineExceptions: lineRows.reduce((a, r) => a + r.exceptions, 0),
        linePlacements: lineRows.reduce((a, r) => a + r.placements, 0),
        ...Object.fromEntries(sources.flatMap(s => [[`sources_${s.name.replace(/ /g, '_')}_states`, s.states], [`sources_${s.name.replace(/ /g, '_')}_offCrossing`, s.offCrossing], [`sources_${s.name.replace(/ /g, '_')}_lChanged`, s.lChanged]])),
        ...Object.fromEntries(
          ladders.flatMap(r => {
            const k = `ladder_N${r.N}_sq${r.squares}`

            return [
              [`${k}_size`, r.size],
              [`${k}_components`, r.components],
              [`${k}_gaussClasses`, r.gaussClasses],
              [`${k}_mixed`, r.mixedComponents],
              [`${k}_constantL`, r.constantLComponents],
              [`${k}_vacuumLMax`, r.vacuumLMax],
              [`${k}_vacuumSize`, r.vacuumSize],
              [`${k}_smallestKept`, r.smallestKept],
              [`${k}_largestDropped`, r.largestDropped],
              [`${k}_unitarity`, r.unitarity],
              [`${k}_loopMin`, r.loopMin],
            ]
          }),
        ),
        ...Object.fromEntries(ports.flatMap(p => [[`port_D${p.D}_witnesses`, p.witnesses], [`port_D${p.D}_farthest`, p.farthest], [`port_D${p.D}_checked`, p.checked]])),
        ...Object.fromEntries(hidden.map(h => [`hidden_D${h.D}_atOne`, h.atOne])),
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L1, theorems checked exhaustively or exactly. Gates L1 ${l1}, L2 ${l2}, L3 ${l3}, L4 ${l4}, L5 ${l5}. Line (Theorem A): ${lineRows.map(r => `N ${r.N} L ${r.L}: ${r.placements} placements (${r.neutral} neutral mod N), ${r.exceptions} exceptions`).join('; ')}. Sources (Theorem B): ${sources.map(s => `${s.name}: ${s.states} states, ${s.offCrossing} off-crossing changes, l changed on ${s.lChanged}, change ${s.lChangeRange.join(' .. ')}`).join('; ')}. Ladder (Theorem C): ${ladders.map(r => `N ${r.N}, ${r.squares} squares: ${r.size} registers, ${r.components} components over ${r.gaussClasses} Gauss classes (${r.componentsPerClass.join('/')} per class), ${r.mixedComponents} mixed, l constant on ${r.constantLComponents}, vacuum piece ${r.vacuumSize} states reaching l = ${r.vacuumLMax}, kept entries >= ${r.smallestKept.toExponential(2)}, dropped <= ${r.largestDropped.toExponential(1)}, unitarity ${r.unitarity.toExponential(1)}, smallest loop coefficient ${r.loopMin.toExponential(2)}`).join('; ')}. Port store (Theorem D): ${ports.map(p => `D ${p.D}: ${p.states} reached, ${p.witnesses} of ${p.checked} far label changes move a copy, farthest ${p.farthest}`).join('; ')}. Hidden pairs at |sum| = 1: ${hidden.map(h => `D ${h.D} ${h.atOne}`).join(', ')}. MEANING: the candidate fails at every step. On a line there is no light stream (Gauss leaves one winding), so "the count moves with the light" can only mean "moves with the recorded hops", and the hops that change l are the string's two ends: that is the end-port store, which E-SPN-0085 builds (it keeps Pauli's lock and the range 2D, pins the charge-one cluster exactly, and its lightest level is not the natural spin one half). Where the light does stream (squares), it keeps no count at all: its support mixes every value of l inside each Gauss class, so a reserve on the light would be spent by the photon. l itself is a length, sourced at the charges, with no continuity law. So E-SPN-0081's trilemma is a theorem: a count that keeps Pauli and travels needs a stream of its own. What this is not: a statement about the knit's 3D husk light beyond the ladder (the ladder is the light's own rule on its smallest closed geometry; the argument, support components equal Gauss data, holds on any lattice whose loop shifts generate the cycle space, which the square lattice's do).`,
    })
  },
})
