// Charge counted in whole units on every beat, read on the husk (E-FRC-0243).
//
// WHAT THE CHARGE IS (read from the code, code/measure/charge-count): the vibe trit, love +1, fear -1, calm 0. It is
// the source of the light's Gauss's law (trit-column), the knit's conserved charge (pair-making-knit, token-store-
// knit), and the string's token charge (flux-store-line). A husk column's charge is the column sum of its vibes.
// The rishon reading Q = (love - fear) / 3 (E-FRC-0170, E-SPN-0055, the three-love charge-one state of E-SPN-0077)
// is the same count in thirds.
//
// E-FRC-0212 and E-RLT-0061 read quantization as holding by construction (a trit is an integer). This file tests
// it: every beat of each adopted rule is checked to keep the integer husk charge, locally, with planted defects
// that the checks must catch.
//
// THE ARGUMENT, before any number.
// (1) Every stored value is a trit, so every charge is an integer, and on the light Gauss's law makes the husk
//     charge the divergence of an integer flux (a column sum of bulk trits): a fractional charge has no flux that
//     could carry it. What can fail is conservation, and locality: a beat that makes or loses a vibe, or moves one
//     without the flux or current recording it.
// (2) The hop gas (E-FRC-0210): a crossing swaps two vibes and pays the net charge J into the link's string, so
//     the husk charge obeys dQ + div J = 0 with J the column sum of the strings' change.
// (3) The adopted pair creation (E-RLT-0067, the returned-neutral store): the pair move makes or unmakes a love
//     and a fear on one line of one dock, so every collision keeps its dock's charge, and the stream copies each
//     slot one dock along its root, which crosses exactly one husk link (the root's shadow; no root lies along the
//     depth alone).
// (4) The flux-store string (E-SPN-0075): its tokens never change kind, and its center flux is a trit, so its
//     Gauss's law holds mod 3: an arc's charge equals the flux out minus the flux in, mod 3. Hence the rishon
//     charge Q = (love - fear) / 3 of an arc is an integer exactly when its boundary flux difference is 0 mod 3.
//     And the center flux cannot see a charge that is a multiple of 3: three loves with no flux anywhere is a
//     Gauss state.
//
// Gates, fixed before the first run (no probe of these quantities; the rules and their starts are the adopted ones):
// A1 the trit light with the hop gas, side 4, D 4, wave form, 96 beats, 17 starts (the light's own family: Weyl
//    phases moved by 131 k, k = 0 .. 16; the light reads no color link, so E-MTH-0028's link family does not enter
//    it): 0 bulk and 0 husk Gauss violations, 0 husk continuity failures (dQ + div J = 0 per column per beat), 0
//    total charge changes, every column's |Q| <= D, and more than 0 crossings on every start
// A2 the planted defects on every start (16 beats): an unpaid crossing (vibes swapped, string left) gives more than
//    0 Gauss violations, and a creating copy (the far calm dock takes the vibe, the near one keeps it) more than 0
//    charge changes
// B1 the adopted knit (token-store-knit 'returned-neutral' on the side-3 box, every token closed, the start of
//    code/measure/token-store-gates), 48 beats, over E-MTH-0028's 17 link starts: 0 collisions changing their dock's
//    charge, 0 husk columns off the charge predicted by moving each collided slot one column step along its root,
//    0 total charge changes, the rule's own beat equal to that decomposition (0 slot mismatches), and more than 0
//    pairs made and more than 0 unmade on every start
// B2 the planted defects on every start: a pair move that turns a fear into a love gives more than 0 dock-charge
//    failures and charge changes; a lossy stream (one held slot dropped) more than 0 continuity failures
// C1 the flux-store string, exhaustive over every register state (the pair under C on rings 6 (D 1) and 7 (D 2),
//    three loves on ring 5 (D 1)): every Gauss state streams to a Gauss state (0 failures), and on every Gauss state
//    every arc's charge equals its boundary flux difference mod 3 (0 failures)
// C2 on three loves, Gauss states with no center flux on any link exist (more than 0): the string's flux reads
//    charge only mod 3
// C3 the planted defect: a stream that moves the tokens without recording the copy breaks Gauss mod 3 on more than
//    0 Gauss states of every space
// E  determinism: A on start 0 and B on the committed start, run twice, give identical fingerprints
// Status: pass if every gate holds; fail otherwise.
//
// Reported, not gated: the share of husk column-beats in B whose love minus fear is not a multiple of 3, where
// the rishon reading is fractional.
//
// Depth L2: conservation and locality checked on every beat of three adopted rules, each with a control that bites.
// HUSK FIRST: A reads husk columns (the bulk Gauss count beside), B reads the knit's box projected on its husk
// columns, C is one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { storeKnit, storeStart, storeWeave } from '@/code/measure/token-store-gates'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { fluxRun, gasRun, knitRun, type FluxRun, type GasRun, type KnitRun } from '@/code/measure/charge-count'
import { type FluxStoreSpec } from '@/code/rule/flux-store-line'
import { type Vibe } from '@/code/rule/locked-token-line'

const GAS_STARTS = 17
const GAS_BEATS = 96
const DEFECT_BEATS = 16
const KNIT_BEATS = 48

const fluxSpec = (ring: number, kinds: Vibe[], depth: number): FluxStoreSpec => ({ ring, kinds, convention: 'C', unlike: 'knit', depth, cost: 0, root: 3 })

export default experiment({
  id: 'gauge/charge-count-every-beat',
  code: 'E-FRC-0243',
  title:
    'charge is counted in whole vibes on every beat, locally, on the husk: the trit light with the hop gas keeps Gauss and the husk continuity dQ + div J = 0 on every beat of 17 starts, the adopted pair creation (the returned-neutral store) keeps every dock\'s charge through every collision and moves charge only across husk links on all 17 link starts, and the flux-store string keeps Gauss mod 3 on every register state, so the rishon charge (love - fear) / 3 is whole exactly on regions whose boundary carries no center flux, while the center flux cannot see three loves; every planted defect is caught',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    // A: the trit light with the hop gas
    let a1 = true
    let a2 = true
    const sumGas: GasRun = { bulkGauss: 0, huskGauss: 0, continuity: 0, chargeChange: 0, columnBound: 0, crossings: 0, charged: 0, fingerprint: 0 }
    let minCrossings = Infinity

    for (let member = 0; member < GAS_STARTS; member++) {
      const r = gasRun(member, GAS_BEATS, 'none')
      const unpaid = gasRun(member, DEFECT_BEATS, 'unpaid')
      const creating = gasRun(member, DEFECT_BEATS, 'creating')

      for (const key of ['bulkGauss', 'huskGauss', 'continuity', 'chargeChange', 'columnBound', 'crossings', 'charged'] as const) sumGas[key] += r[key]
      minCrossings = Math.min(minCrossings, r.crossings)
      a1 = a1 && r.bulkGauss === 0 && r.huskGauss === 0 && r.continuity === 0 && r.chargeChange === 0 && r.columnBound === 0 && r.crossings > 0
      a2 = a2 && unpaid.bulkGauss + unpaid.huskGauss > 0 && creating.chargeChange > 0
      metrics[`gas_start${member}_crossings`] = r.crossings
      metrics[`gas_start${member}_unpaidGauss`] = unpaid.bulkGauss + unpaid.huskGauss
      metrics[`gas_start${member}_unpaidHuskGauss`] = unpaid.huskGauss
      metrics[`gas_start${member}_creatingChargeChanges`] = creating.chargeChange
    }

    for (const [k, v] of Object.entries(sumGas)) if (k !== 'fingerprint') metrics[`gas_${k}`] = v

    metrics.gas_minCrossings = minCrossings

    // B: the adopted knit over the link start family
    let b1 = true
    let b2 = true
    const family = startFamily(GAS_STARTS - 1)
    const sumKnit: Record<string, number> = {}
    let committedFingerprint = 0

    family.forEach((member, i) => {
      const [run, loveLove, lossy] = withStart(member, (): KnitRun[] => {
        const weave = storeWeave()
        const knit = storeKnit(weave, 'returned-neutral')
        const start = storeStart(weave.mesh.cellCount, 1)

        return [knitRun(knit, start, KNIT_BEATS, 'none'), knitRun(knit, start, KNIT_BEATS, 'loveLove'), knitRun(knit, start, KNIT_BEATS, 'lossy')]
      })

      if (i === 0) committedFingerprint = run!.fingerprint

      for (const [k, v] of Object.entries(run!)) if (k !== 'fingerprint') sumKnit[k] = (sumKnit[k] ?? 0) + v

      b1 = b1 && run!.dockChargeFailures === 0 && run!.continuity === 0 && run!.chargeChange === 0 && run!.beatMismatch === 0 && run!.made > 0 && run!.unmade > 0
      b2 = b2 && loveLove!.dockChargeFailures > 0 && loveLove!.chargeChange > 0 && lossy!.continuity > 0
      metrics[`knit_${member.name}_made`] = run!.made
      metrics[`knit_${member.name}_unmade`] = run!.unmade
      metrics[`knit_${member.name}_loveLoveDockFailures`] = loveLove!.dockChargeFailures
      metrics[`knit_${member.name}_lossyContinuity`] = lossy!.continuity
    })

    for (const [k, v] of Object.entries(sumKnit)) metrics[`knit_${k}`] = v

    metrics.knit_rishonFractionalShare = (sumKnit.rishonFractional ?? 0) / Math.max(1, sumKnit.columnBeats ?? 1)

    // C: the flux-store string, exhaustive
    const cases: { name: string; spec: FluxStoreSpec }[] = [
      { name: 'pairRing6D1', spec: fluxSpec(6, ['love', 'fear'], 1) },
      { name: 'pairRing7D2', spec: fluxSpec(7, ['love', 'fear'], 2) },
      { name: 'threeLovesRing5D1', spec: fluxSpec(5, ['love', 'love', 'love'], 1) },
    ]
    let c1 = true
    let c3 = true
    let threeLoves: FluxRun | undefined

    for (const c of cases) {
      const r = fluxRun(c.spec)

      for (const [k, v] of Object.entries(r)) metrics[`flux_${c.name}_${k}`] = v

      c1 = c1 && r.gaussBroken === 0 && r.arcFailures === 0 && r.gaussStates > 0
      c3 = c3 && r.unrecordedBroken > 0
      if (c.name === 'threeLovesRing5D1') threeLoves = r
    }

    const c2 = (threeLoves?.invisibleCharge ?? 0) > 0

    // E: determinism
    const againGas = gasRun(0, GAS_BEATS, 'none')
    const firstGas = gasRun(0, GAS_BEATS, 'none')
    const againKnit = withStart(family[0]!, () => {
      const weave = storeWeave()

      return knitRun(storeKnit(weave, 'returned-neutral'), storeStart(weave.mesh.cellCount, 1), KNIT_BEATS, 'none')
    })
    const e = againGas.fingerprint === firstGas.fingerprint && againKnit.fingerprint === committedFingerprint

    const gates = { A1: a1, A2: a2, B1: b1, B2: b2, C1: c1, C2: c2, C3: c3, E: e }

    for (const [k, v] of Object.entries(gates)) metrics[`gate${k}`] = v ? 1 : 0

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status: Object.values(gates).every(Boolean) ? 'pass' : 'fail',
      claim: `on the trit light with the hop gas (side 4, D 4, 17 starts x ${GAS_BEATS} beats, ${sumGas.crossings} crossings) the husk charge keeps Gauss (${sumGas.huskGauss} husk, ${sumGas.bulkGauss} bulk violations) and continuity per column (${sumGas.continuity} failures, ${sumGas.chargeChange} charge changes); the adopted pair creation over 17 link starts (${sumKnit.made} pairs made, ${sumKnit.unmade} unmade in ${KNIT_BEATS} beats each) changes no dock's charge in any collision (${sumKnit.dockChargeFailures}) and moves charge only across husk links (${sumKnit.continuity} column failures); the flux-store string keeps Gauss mod 3 on all ${cases.map(c => metrics[`flux_${c.name}_gaussStates`]).join(', ')} Gauss states and every arc's charge is its boundary flux difference mod 3 (${cases.reduce((s, c) => s + (metrics[`flux_${c.name}_arcFailures`] ?? 0), 0)} failures), so (love - fear) / 3 is whole on flux-free boundaries, and ${threeLoves?.invisibleCharge ?? 0} three-love states carry no center flux at all; every planted defect caught (unpaid crossing, creating copy, love-love pair move, lossy stream, unrecorded copy)`,
      metrics,
      control: {
        unpaidGaussStart0: metrics.gas_start0_unpaidGauss ?? 0,
        loveLoveDockFailuresCommitted: metrics['knit_integer+0_loveLoveDockFailures'] ?? 0,
        unrecordedBrokenThreeLoves: threeLoves?.unrecordedBroken ?? 0,
      },
      notes: `L2, deterministic (Weyl and Kronecker starts, E-MTH-0028's link family, exhaustive register spaces; no draw). Gates: ${JSON.stringify(gates)}. FIRST RUN 2026-09-26 (tmp/frc0243.log, 4.4 s), PASS on every gate, no gate moved. Reported: 67 percent of the knit's husk column-beats (14,785 of 22,032) hold a love minus fear that is not a multiple of 3, so under the rishon reading most columns carry a fractional Q at any beat; wholeness of Q is a property of flux-free regions (C1), not of columns. FLAG: the U(1) light couples to the vibe count, not to Q, so a three-love charge-one state (E-SPN-0077) carries light charge 3 and would couple with 9 times the one-vibe alpha of E-FRC-0212 and 0242, unless the light is made to couple to Q.`,
    })
  },
})
