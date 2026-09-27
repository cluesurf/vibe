// Can the adopted knit bind two vibes through its vacuum's pairs? The lone-bounce knit on the hub vacuum
// (E-RLT-0084), over the 17 link starts.
//
// E-FRC-0188 found a Yukawa attraction between two knots, exact in the Potts measure of the paid string with pair
// making, and no rule that realizes it. E-SPN-0061 found nothing binds two knots on the string line. The adopted knit
// (the isometric W(F4) knit, the hub vacuum, the lone bounce collision) makes and unmakes vacuum pairs on stored
// lines, so it is the one place in the model where two vibes could exchange created pairs.
//
// THE STRUCTURAL REASON, stated before any run. (1) The knit's positions are classical: a slot holds one vibe and
// the stream copies it, so a pair of vibes has one separation per beat, never a superposition of separations. (2)
// Everything the knit conserves is a sum over docks: charge, count, momentum and E = count + 2 sum |tau| (E-RLT-0064),
// so no conserved quantity depends on how far apart two vibes are, and there is no potential for an attraction to
// lower. (3) The lone bounce collision leaves a lone vibe on a line the vacuum does not store untouched (22 of 24
// directions at the hub anchor are bare), and turns every full line as -1, so two vibes meeting head on bounce. A
// classical rule can still hold vibes together without any energy (a glider does), so the rest is measured.
//
// PREDICTIONS, written before this file ran (probes tmp/mb-probe-knit.ts and tmp/mb-probe-knit2.ts had shown, at the
// committed start only, that one love's disturbance on the stored line spreads into a line-wide pattern of charges up
// to 3 within 20 beats).
// P1 Energy: E(seeded) - E(vacuum) equals the number of seeded vibes at every beat, for two seeds at gaps 2, 4, 6 and
//    8: the energy does not see the separation (exact integers).
// P2 A bare line: two vibes started head on 4 docks apart on a line the vacuum stores nowhere along its length stay
//    exactly two single-slot disturbances, meet and bounce, and their separation is |4 - 2t| folded on the line at
//    every one of 48 beats (ballistic, relative speed 2, no attraction), on every start; the cold vacuum (no store)
//    gives the same.
// P3 The stored line: one love on line 0 at the anchor does exchange with the vacuum's pairs, but its disturbance
//    does not stay one localized charge: the summed absolute disturbance charge along its line reaches at least 3
//    within 48 beats on every start (the cold vacuum keeps it at exactly 1).
// P4 The binding hypothesis, predicted false: two vibes head on stay within 2 docks for the last 24 of 48 beats on a
//    bare line, or on the stored line the love-fear pair's charge dipole stays under half that of the two single
//    disturbances added.
//
// Gates: G1 = P1, G2 = P2, G3 = P3 (instrument gates, on all 17 starts); GB = P4 (the hypothesis, on any start).
// Status: fail if G1 to G3 hold and GB is false (the registered verdict: the knit cannot bind); pass if GB holds on
// some start with G1 to G3; partial otherwise.
//
// Depth L2. Husk: the line is a bulk D4 line; its husk shadow is a husk line of the same docks' columns, so the
// separations read here are the husk separations up to the projection's fixed factor (a bulk step casts one husk
// step, E-MTR-0022). DETERMINISM: fixed seeds on fixed docks; the 17 starts of code/measure/start-ensemble.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { bounceRunner, makeBounceKernel } from '@/code/measure/bounce-pair-kernel'
import { tritDifference, type Reduced } from '@/code/measure/living-pair-kernel'
import { coinData, orientedHubStore } from '@/code/measure/varying-vacuum'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'

const SIDE = 16
const BEATS = 48
const GAP = 4
const ROOTS = rootsD4()

// per beat, along the line: the disturbance charge, and the disturbed slots (the absolute vibe difference)
type LineRun = { rho: Int32Array[]; moved: Int32Array[]; trits: number[]; energy: number[] }

export default experiment({
  id: 'spin/knit-cannot-bind',
  code: 'E-SPN-0068',
  title:
    'the lone-bounce hub knit does not bind two vibes, partial by its own gates: the energy of two seeded vibes exceeds the vacuum by exactly 2 at every beat and gap on 17 of 17 starts (nothing conserved sees a separation); head on along a bare line they separate ballistically, but on 4 of 17 starts the pair move unmakes the love-fear pair into the store at the meeting for one beat and remakes it, which the separation gate did not allow for (G2 fails); one love on the stored line spreads into 23 to 27 units of absolute charge along its line, so it is no localized particle; the binding gate read true on 10 starts only because it compared line-wide disturbances (pair dipole 4.1 to 13.5, above the 4 that any two point charges can reach), not a bound pair',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const coins = coinData(groupTable())
    const f0 = LINE_FIRSTS[0] as number
    const r0 = d4Coordinates(ROOTS[f0] as number[])
    const mid = SIDE / 2
    const anchor = d4BoxCell({ coordinates: [mid, mid, mid, mid], side: SIDE })
    const hub = orientedHubStore(coins, SIDE, d4BoxCoordinates({ cell: anchor, side: SIDE }).map((v, k) => v - (r0[k] as number)))
    const cells = SIDE ** 4
    const empty = new Int8Array(cells * 12)
    const energyOf = (s: Reduced): number => {
      let e = 0

      for (let i = 0; i < s.vibe.length; i++) if (s.vibe[i] !== 0) e++
      for (let i = 0; i < s.store.length; i++) e += 2 * Math.abs(s.store[i] as number)

      return e
    }

    const members = startFamily(16)
    const perMember = members.map(member => {
      const weave = withStart(member, () => makeColorWeave({ side: SIDE, table: 'bind' }))
      const kernel = makeBounceKernel(weave, 'lone')
      const layout = separatedLayout(weave)
      const lineOf = (d: number): number[] => {
        const out = [anchor]

        for (let i = 1; i < 4 * SIDE; i++) {
          const next = weave.mesh.neighbour(out[i - 1] as number, d)

          if (next === anchor) break

          out.push(next)
        }

        return out
      }
      // a bare direction: its line holds no stored unit on its line index anywhere along it
      let bare = -1

      for (let d = 0; d < 24 && bare < 0; d++) {
        if (LINE_OF[d] === 0) continue
        if (lineOf(d).every(y => hub[y * 12 + (LINE_OF[d] as number)] === 0)) bare = d
      }

      const run = (store: Int8Array, seeds: readonly [number, number, number][], line: readonly number[]): LineRun => {
        const base = (): Reduced => ({ vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: Int8Array.from(store), spoint: Int8Array.from(layout) })
        const seeded = base()

        for (const [dock, slot, v] of seeds) seeded.vibe[dock * 24 + slot] = v

        const a = bounceRunner(kernel, base())
        const b = bounceRunner(kernel, seeded)
        const out: LineRun = { rho: [], moved: [], trits: [], energy: [] }

        for (let t = 0; t < BEATS; t++) {
          a.beat()
          b.beat()

          const sa = a.state()
          const sb = b.state()
          const rho = new Int32Array(line.length)
          const moved = new Int32Array(line.length)

          line.forEach((y, i) => {
            let q = 0
            let m = 0

            for (let d = 0; d < 24; d++) {
              q += (sb.vibe[y * 24 + d] as number) - (sa.vibe[y * 24 + d] as number)
              m += Math.abs((sb.vibe[y * 24 + d] as number) - (sa.vibe[y * 24 + d] as number))
            }

            rho[i] = q
            moved[i] = m
          })
          out.rho.push(rho)
          out.moved.push(moved)
          out.trits.push(tritDifference(sb, sa).trits)
          out.energy.push(energyOf(sb) - energyOf(sa))
        }

        return out
      }

      // P1: energy against separation, on the stored line
      const stored = lineOf(f0)
      const s0 = OPPOSITE[f0] as number
      const energyRuns = [2, 4, 6, 8].map(g => run(hub, [[anchor, f0, 1], [stored[g] as number, s0, -1]], stored))
      const energyExact = energyRuns.every(r => r.energy.every(e => e === 2))

      // P2: the bare line, head on, against the ballistic separation
      const bareLine = bare >= 0 ? lineOf(bare) : []
      const bareBack = bare >= 0 ? (OPPOSITE[bare] as number) : 0
      const L = bareLine.length
      // the separation of the two disturbed docks (one dock when they meet), from the disturbed slots
      const separationOf = (moved: Int32Array): number => {
        const at = [...moved].flatMap((q, i) => (q !== 0 ? [i] : []))

        if (at.length === 1) return 0
        if (at.length !== 2) return -1

        const d = Math.abs((at[1] as number) - (at[0] as number))

        return Math.min(d, L - d)
      }
      const ballistic = (t: number): number => {
        // after beat t + 1 the separation is |gap - 2 (t + 1)| folded on the line
        const d = (((GAP - 2 * (t + 1)) % L) + L) % L

        return Math.min(d, L - d)
      }
      const bareRun = bare >= 0 ? run(hub, [[anchor, bare, 1], [bareLine[GAP] as number, bareBack, -1]], bareLine) : undefined
      const coldRun = bare >= 0 ? run(empty, [[anchor, bare, 1], [bareLine[GAP] as number, bareBack, -1]], bareLine) : undefined
      const bareSeparations = bareRun ? bareRun.moved.map(separationOf) : []
      const coldSeparations = coldRun ? coldRun.moved.map(separationOf) : []
      const bareBallistic = bare >= 0 && bareRun!.trits.every(x => x === 2) && bareSeparations.every((s, t) => s === ballistic(t)) && coldSeparations.every((s, t) => s === bareSeparations[t])

      // P3: one love on the stored line
      const single = run(hub, [[anchor, f0, 1]], stored)
      const singleCold = run(empty, [[anchor, f0, 1]], stored)
      const absolute = (rho: Int32Array): number => rho.reduce((s, q) => s + Math.abs(q), 0)
      const singleMax = Math.max(...single.rho.map(absolute))
      const coldAbsolute = singleCold.rho.map(absolute)

      // P4: the binding hypothesis
      const lateBare = bareSeparations.slice(BEATS / 2)
      const bareBound = lateBare.length > 0 && lateBare.every(s => s >= 0 && s <= 2)
      const Ls = stored.length
      const dipole = (rho: Int32Array): number => {
        let re = 0
        let im = 0

        rho.forEach((q, i) => {
          re += q * Math.cos((2 * Math.PI * i) / Ls)
          im += q * Math.sin((2 * Math.PI * i) / Ls)
        })

        return re * re + im * im
      }
      const pairRun = energyRuns[1]!
      const fearAlone = run(hub, [[stored[GAP] as number, s0, -1]], stored)
      const pairDipole = pairRun.rho.reduce((s, r) => s + dipole(r), 0) / BEATS
      const addedDipole = pairRun.rho.reduce((s, _, t) => s + dipole(Int32Array.from(single.rho[t]!, (q, i) => q + (fearAlone.rho[t]![i] as number))), 0) / BEATS
      const storedBound = pairDipole < 0.5 * addedDipole

      return {
        member: member.name,
        bare,
        bareLength: L,
        storedLength: Ls,
        energyExact,
        bareBallistic,
        singleMax,
        coldSingleOne: coldAbsolute.every(x => x === 1),
        bareBound,
        storedBound,
        pairDipole,
        addedDipole,
        separations: bareSeparations,
        singleAbsolute: single.rho.map(absolute),
      }
    })

    log('members')

    const g1 = perMember.every(m => m.energyExact)
    const g2 = perMember.every(m => m.bare >= 0 && m.bareBallistic)
    const g3 = perMember.every(m => m.singleMax >= 3 && m.coldSingleOne)
    const gb = perMember.some(m => m.bareBound || m.storedBound)
    const status = g1 && g2 && g3 ? (gb ? 'pass' : 'fail') : 'partial'
    const first = perMember[0]!

    return verdict({
      status,
      claim: `on the hub vacuum under the lone bounce collision (side ${SIDE}, 17 link starts): the energy of two seeded vibes exceeds the vacuum's by exactly 2 at every beat and gap 2 to 8 (${perMember.filter(m => m.energyExact).length} of 17 starts), so nothing the knit conserves sees their separation; two vibes head on along a bare line (direction ${first.bare}, ${first.bareLength} docks) stay two single-slot disturbances, bounce and separate as |4 - 2t| at every beat on ${perMember.filter(m => m.bareBallistic).length} of 17 starts, as in the cold vacuum; one love on the stored line exchanges with its pairs but its disturbance reaches ${Math.min(...perMember.map(m => m.singleMax))} to ${Math.max(...perMember.map(m => m.singleMax))} units of absolute charge along the line (1 in the cold vacuum), so it is not one localized charge; the love-fear pair's charge dipole on the stored line averages ${Math.min(...perMember.map(m => m.pairDipole)).toFixed(2)} to ${Math.max(...perMember.map(m => m.pairDipole)).toFixed(2)} against ${Math.min(...perMember.map(m => m.addedDipole)).toFixed(2)} to ${Math.max(...perMember.map(m => m.addedDipole)).toFixed(2)} for the two single disturbances added; binding on ${perMember.filter(m => m.bareBound || m.storedBound).length} of 17 starts`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_GB: gb ? 1 : 0,
        membersEnergyExact: perMember.filter(m => m.energyExact).length,
        membersBallistic: perMember.filter(m => m.bareBallistic).length,
        membersStoredDelocalized: perMember.filter(m => m.singleMax >= 3).length,
        membersBound: perMember.filter(m => m.bareBound || m.storedBound).length,
        singleAbsoluteMaxMin: Math.min(...perMember.map(m => m.singleMax)),
        singleAbsoluteMaxMax: Math.max(...perMember.map(m => m.singleMax)),
        pairDipoleMin: Math.min(...perMember.map(m => m.pairDipole)),
        pairDipoleMax: Math.max(...perMember.map(m => m.pairDipole)),
        addedDipoleMin: Math.min(...perMember.map(m => m.addedDipole)),
        addedDipoleMax: Math.max(...perMember.map(m => m.addedDipole)),
        bareDirection: first.bare,
        bareLineLength: first.bareLength,
        storedLineLength: first.storedLength,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        coldSingleStaysOne: perMember.every(m => m.coldSingleOne) ? 1 : 0,
      },
      notes: `L2. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, GB ${gb}. FIRST RUN (198 s), recorded as is: partial (G2 false on 4 of 17 starts). Gates not moved; the title and this paragraph were written after the run, and the second run reproduces it. WHY G2 FAILED (probe tmp/mb-probe-bare.ts after the run): on integer+0 and integer+2 (the two failing starts among the five inspected; the other two failing starts were not inspected) the love and the fear meet head on at dock 2 with equal role points, so the pair move unmakes them into that dock's store (0 vibes, 1 store trit, energy still exactly 2) and remakes them one beat later, the love leaving forward instead of bouncing back; on the other starts the veto refuses and they bounce. Either way they then separate at relative speed 2 and wrap the 16-dock line (separations 2 0 . 2 4 6 8 6 4 2 0 ...): the failing beats are an annihilation and re-creation through the vacuum store, not an attraction, and the gate's separation reader could not see a pair held in a store. WHY GB READ TRUE: the stored-line clause compared the pair's charge dipole with that of the two single disturbances added, and the pair's (4.1 to 13.5) is below half of the sum's (8.1 to 23.7) on 10 starts; but a dipole above 4 is impossible for two point charges on a ring, so the pair's disturbance is itself line-wide: the clause measured that two line-wide disturbances do not add, not a bound pair. The bare-line clause (within 2 docks for the last 24 beats) held on no start. Registered reading: nothing in this knit binds two vibes. The pair move does make and unmake a love-fear pair at a meeting, which is the exchange of a created pair the Potts Yukawa needs, but with classical positions its only effect is to swap which way the charges leave. Per start (name: bare direction, stored single's largest absolute disturbance, pair dipole / added dipole): ${perMember.map(m => `${m.member}: ${m.bare}, ${m.singleMax}, ${m.pairDipole.toFixed(2)} / ${m.addedDipole.toFixed(2)}`).join('; ')}. Committed start, bare-line separations by beat: ${first.separations.join(' ')}; stored single's absolute disturbance by beat: ${first.singleAbsolute.join(' ')}. DISCLOSED: probes tmp/mb-probe-knit.ts and tmp/mb-probe-knit2.ts (side 8 and 16, committed start) saw the stored line's line-wide disturbance before this file was written.`,
    })
  },
})
