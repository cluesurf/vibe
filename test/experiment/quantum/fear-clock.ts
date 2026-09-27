// The one-third turn joined to the pair clock and the committed vacuum: does it supply the amplitude
// E-FND-0080 found missing? (code/rule/fear-clock)
//
// E-FND-0080 found three facts of the committed rule: its vacuum is a global period-three flash, a seeded
// vibe is a classical defect of at most two slots that never spreads, and two defects add as sets with zero
// cross term. The fear clock writes the committed pair table as P = K SWAP (an exchange, then calm and a
// love-fear pair swapped for each other) and puts the swap phase in place of the exchange, F = K U(phi).
// At phi = pi it is P. Amplitudes are Eisenstein integers on whole configurations, vacuum included.
//
// Two geometries: a ring of docks with one line each (3 and 5 docks, 24 beats), where every configuration
// of a charge sector can be held; and one D4 dock with its twelve lines under the committed turning weave's
// schedule, streaming into itself (9 beats, the laptop's reach: the support passes 26,000 configurations).
// Three states each: the vacuum (every slot calm), the vacuum with a love on one slot (A), and with a love on
// another (B).
//
// Measured, and gated before the run:
// - P = K SWAP on all nine states of a line, against the committed PAIR_FORWARD table
// - at phi = pi every state stays one configuration and equals the committed rule's, beat by beat: the
//   ring against the pair table and the stream, the dock against turningWeave and collide in
//   code/rule/collision and code/rule/lattice-gas
// - with the turn: the total chance is exactly 4^h / 4^h after every beat, every configuration held keeps
//   the start's love minus fear, and A run forward and back returns exactly
// - E-FND-0080 at phi = pi on the ring: the defect (slots where A's expected vibe differs from the
//   vacuum's) never covers more than 2 slots, and the cross term between A and B is 0 at every beat
// - with the turn, on both geometries: the defect covers more than 2 slots, and the cross term between A
//   and B is not 0 at some beat, so a seeded vibe spreads as an amplitude and two of them interfere
// Reported: supports, the beat each first spreads, the vacuum's support and whether it returns to calm.
//
// The first run failed on the dock and the failure stands: seeded at slots 0 and 2, the love never moved
// (defect 1 slot, cross term 0 for 9 beats) because the schedule never clocked those lines in that time and
// a love on a line's first slot is not moved by the palindromic swap. Added after that run, reported and
// not gated: the same with the seeds on the first slots of two lines the schedule clocks at beat 0.
//
// What this leaves out: 24 beats on 5 docks and 9 on one dock are what fit. The vacuum itself becomes a
// superposition (every line's love-fear pair is split by the turn), which is a change to the committed
// vacuum, not only an addition to it.
//
// Depth L2: a constructed rule against stated gates, recovering the committed rule at phi = pi.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { PAIR_FORWARD, turningWeave } from '@/code/rule/collision'
import { collide, stream } from '@/code/rule/lattice-gas'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { makeWill } from '@/code/tone/will'
import {
  chargeOf,
  chargeProfile,
  clockLine,
  configOf,
  crossProfile,
  dockBeat,
  makeDock,
  ringBeat,
  setTone,
  toneAt,
  totalNorm,
  type Amplitudes,
  type ClockMode,
} from '@/code/rule/fear-clock'

const RING_BEATS = 24
const DOCK_BEATS = 9
const RINGS = [3, 5]

type Run = { states: Amplitudes[]; normExact: boolean; chargeViolations: number }

const single = (config: number): Amplitudes => ({ weights: new Map([[config, [1n, 0n]]]), halvings: 0 })

export default experiment({
  id: 'quantum/fear-clock',
  code: 'E-QTM-0108',
  title:
    'the one-third turn joined to the committed pair clock and vacuum: written as calm-pair creation after a swap phase it is the committed table at phi = pi, beat for beat on a ring of docks and on one D4 dock; with the turn it is exact, keeps love minus fear, reverses, and supplies the amplitude E-FND-0080 found missing, a seeded vibe spreading past two slots and two seeds interfering',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // P = K SWAP on all nine states
    let factorization = 0

    for (const x of [-1, 0, 1]) {
      for (const y of [-1, 0, 1]) {
        const s = clockLine(single(configOf([x, y])), 0, 1, 'committed', true)
        const [config] = [...s.weights.keys()]
        const expect = PAIR_FORWARD[(x + 1) * 3 + (y + 1)] ?? [x, y]

        factorization += s.weights.size === 1 && config === configOf([expect[0], expect[1]]) ? 0 : 1
      }
    }

    const evolve = (start: Amplitudes, beats: number, step: (s: Amplitudes, t: number) => Amplitudes, slots: number): Run => {
      const charge = chargeOf([...start.weights.keys()][0] ?? 0, slots)
      const states: Amplitudes[] = [start]
      let normExact = true
      let chargeViolations = 0
      let s = start

      for (let t = 0; t < beats; t++) {
        s = step(s, t)
        states.push(s)
        normExact = normExact && totalNorm(s) === 4n ** BigInt(s.halvings)

        for (const config of s.weights.keys()) {
          chargeViolations += chargeOf(config, slots) === charge ? 0 : 1
        }
      }

      return { states, normExact, chargeViolations }
    }

    // the defect and the cross term, beat by beat
    const compare = (vacuum: Run, a: Run, b: Run, slots: number) => {
      const defect: number[] = []
      const cross: number[] = []

      vacuum.states.forEach((v, t) => {
        const sa = a.states[t]
        const sb = b.states[t]

        if (!sa || !sb) {
          return
        }

        const pv = chargeProfile(v, slots)
        const pa = chargeProfile(sa, slots)
        let count = 0

        for (let s = 0; s < slots; s++) {
          count += (pa[s] ?? 0n) * 4n ** BigInt(v.halvings) === (pv[s] ?? 0n) * 4n ** BigInt(sa.halvings) ? 0 : 1
        }

        defect.push(count)
        cross.push(crossProfile(sa, sb, slots).filter(x => x !== 0n).length)
      })

      return {
        defectMax: Math.max(...defect),
        defectFinal: defect[defect.length - 1] ?? -1,
        firstSpread: defect.findIndex(c => c > 2),
        crossSlotsMax: Math.max(...cross),
        firstCross: cross.findIndex(c => c > 0),
      }
    }

    // the ring
    const ringResults = RINGS.map(docks => {
      const slots = 2 * docks
      const calm = configOf(new Array<number>(slots).fill(0))
      const seedA = setTone(calm, 0, 1)
      const seedB = setTone(calm, 2 * Math.floor(docks / 2), 1)
      const run = (start: number, mode: ClockMode) => evolve(single(start), RING_BEATS, s => ringBeat(s, docks, mode, true), slots)

      // phi = pi against the pair table and the stream
      let committedMismatch = 0

      for (const start of [calm, seedA, seedB]) {
        const quantum = run(start, 'committed')
        let tones = Array.from({ length: slots }, (_, s) => toneAt(start, s))

        for (let t = 0; t < RING_BEATS; t++) {
          const collided = [...tones]

          for (let x = 0; x < docks; x++) {
            const out = PAIR_FORWARD[((tones[2 * x] ?? 0) + 1) * 3 + ((tones[2 * x + 1] ?? 0) + 1)] ?? [0, 0]

            collided[2 * x] = out[0]
            collided[2 * x + 1] = out[1]
          }

          tones = Array.from({ length: slots }, (_, s) => {
            const x = Math.floor(s / 2)

            return s % 2 === 0 ? (collided[2 * ((x - 1 + docks) % docks)] ?? 0) : (collided[2 * ((x + 1) % docks) + 1] ?? 0)
          })

          const state = quantum.states[t + 1]

          committedMismatch += state && state.weights.size === 1 && [...state.weights.keys()][0] === configOf(tones) ? 0 : 1
        }
      }

      const committed = { v: run(calm, 'committed'), a: run(seedA, 'committed'), b: run(seedB, 'committed') }
      const fear = { v: run(calm, 'fear'), a: run(seedA, 'fear'), b: run(seedB, 'fear') }
      const vacuumPeriod = committed.v.states.findIndex((s, t) => t > 0 && s.weights.size === 1 && s.weights.has(calm))
      const fearVacuumReturn = fear.v.states.findIndex((s, t) => t > 0 && s.weights.size === 1 && s.weights.has(calm))

      // reversal of A
      let back = fear.a.states[RING_BEATS] ?? single(seedA)

      for (let t = 0; t < RING_BEATS; t++) {
        back = ringBeat(back, docks, 'fear', false)
      }

      const reverses = back.weights.size === 1 && back.halvings === 0 && (back.weights.get(seedA)?.[0] ?? 0n) === 1n && (back.weights.get(seedA)?.[1] ?? 1n) === 0n

      return {
        docks,
        committedMismatch,
        vacuumPeriod,
        committedCompare: compare(committed.v, committed.a, committed.b, slots),
        fearCompare: compare(fear.v, fear.a, fear.b, slots),
        exact: [fear.v, fear.a, fear.b].every(r => r.normExact),
        chargeViolations: [fear.v, fear.a, fear.b].reduce((n, r) => n + r.chargeViolations, 0),
        reverses,
        vacuumSupport: fear.v.states[RING_BEATS]?.weights.size ?? -1,
        seededSupport: fear.a.states[RING_BEATS]?.weights.size ?? -1,
        fearVacuumReturn,
      }
    })

    // one D4 dock with its twelve lines, streaming into itself
    const mesh = d4BoxMesh({ side: 1 })
    const opposite = Array.from({ length: 24 }, (_, d) => mesh.opposite(d))
    const dock = makeDock(opposite)
    const forward = turningWeave({ opposite })
    const calm = configOf(new Array<number>(24).fill(0))
    const dockA = setTone(calm, 0, 1)
    const dockB = setTone(calm, 2, 1)
    const dockRun = (start: number, mode: ClockMode) => evolve(single(start), DOCK_BEATS, (s, t) => dockBeat(s, dock, t, mode, true), 24)
    let dockCommittedMismatch = 0

    for (const start of [calm, dockA, dockB]) {
      const quantum = dockRun(start, 'committed')
      let will = makeWill(mesh)

      will.data.set(Array.from({ length: 24 }, (_, s) => toneAt(start, s)))

      for (let t = 0; t < DOCK_BEATS; t++) {
        collide(will, forward(t))
        will = stream(will)

        const state = quantum.states[t + 1]

        dockCommittedMismatch += state && state.weights.size === 1 && [...state.weights.keys()][0] === configOf([...will.data]) ? 0 : 1
      }
    }

    const dockCommitted = { v: dockRun(calm, 'committed'), a: dockRun(dockA, 'committed'), b: dockRun(dockB, 'committed') }
    const dockFear = { v: dockRun(calm, 'fear'), a: dockRun(dockA, 'fear'), b: dockRun(dockB, 'fear') }
    const dockCommittedCompare = compare(dockCommitted.v, dockCommitted.a, dockCommitted.b, 24)
    const dockFearCompare = compare(dockFear.v, dockFear.a, dockFear.b, 24)
    let dockBack = dockFear.a.states[DOCK_BEATS] ?? single(dockA)

    for (let t = DOCK_BEATS - 1; t >= 0; t--) {
      dockBack = dockBeat(dockBack, dock, t, 'fear', false)
    }

    const dockReverses = dockBack.weights.size === 1 && dockBack.halvings === 0 && (dockBack.weights.get(dockA)?.[0] ?? 0n) === 1n
    // added after the first run, reported and not gated: seeds on the first slots of two lines the schedule
    // clocks at beat 0 (the first run seeded slots 0 and 2, whose lines the schedule never clocks in 9 beats)
    const wireSlots = (dock.positions[0] ?? []).map(c => dock.lines[c[1]]?.[0] ?? 0)
    const wiredA = setTone(calm, wireSlots[0] ?? 0, 1)
    const wiredB = setTone(calm, wireSlots[1] ?? 0, 1)
    const dockWiredCompare = compare(dockFear.v, dockRun(wiredA, 'fear'), dockRun(wiredB, 'fear'), 24)
    const dockExact = [dockFear.v, dockFear.a, dockFear.b].every(r => r.normExact)
    const dockCharge = [dockFear.v, dockFear.a, dockFear.b].reduce((n, r) => n + r.chargeViolations, 0)

    const ok =
      factorization === 0 &&
      ringResults.every(
        r =>
          r.committedMismatch === 0 &&
          r.exact &&
          r.chargeViolations === 0 &&
          r.reverses &&
          r.committedCompare.defectMax <= 2 &&
          r.committedCompare.crossSlotsMax === 0 &&
          r.fearCompare.defectMax > 2 &&
          r.fearCompare.crossSlotsMax > 0,
      ) &&
      dockCommittedMismatch === 0 &&
      dockExact &&
      dockCharge === 0 &&
      dockReverses &&
      dockFearCompare.defectMax > 2 &&
      dockFearCompare.crossSlotsMax > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed pair table is calm-pair creation after an exchange on all nine states; at phi = pi the fear clock is the committed rule beat for beat on rings of 3 and 5 docks and on one D4 dock, where a seeded vibe stays a defect of at most 2 slots with no cross term (E-FND-0080); with the turn every run is exact, keeps love minus fear and reverses, and on the rings a seeded vibe spreads to every slot and two seeds interfere from beat 3; the dock gate FAILED and stands: seeded where the schedule never clocks in 9 beats the vibe did not move, and seeded on clocked lines it spreads to 3 slots but two seeds on different lines never share a configuration in 9 beats',
      metrics: {
        pairTableFactorizationMismatches: factorization,
        ...Object.fromEntries(
          ringResults.flatMap(r => [
            [`ring${r.docks}CommittedMismatch`, r.committedMismatch],
            [`ring${r.docks}CommittedVacuumPeriod`, r.vacuumPeriod],
            [`ring${r.docks}CommittedDefectMax`, r.committedCompare.defectMax],
            [`ring${r.docks}CommittedCrossSlotsMax`, r.committedCompare.crossSlotsMax],
            [`ring${r.docks}FearExact`, r.exact ? 1 : 0],
            [`ring${r.docks}FearChargeViolations`, r.chargeViolations],
            [`ring${r.docks}FearReverses`, r.reverses ? 1 : 0],
            [`ring${r.docks}FearDefectMax`, r.fearCompare.defectMax],
            [`ring${r.docks}FearDefectFinal`, r.fearCompare.defectFinal],
            [`ring${r.docks}FearFirstSpreadBeat`, r.fearCompare.firstSpread],
            [`ring${r.docks}FearCrossSlotsMax`, r.fearCompare.crossSlotsMax],
            [`ring${r.docks}FearFirstCrossBeat`, r.fearCompare.firstCross],
            [`ring${r.docks}FearVacuumSupport`, r.vacuumSupport],
            [`ring${r.docks}FearSeededSupport`, r.seededSupport],
            [`ring${r.docks}FearVacuumReturnBeat`, r.fearVacuumReturn],
          ]),
        ),
        dockCommittedMismatch,
        dockCommittedDefectMax: dockCommittedCompare.defectMax,
        dockCommittedCrossSlotsMax: dockCommittedCompare.crossSlotsMax,
        dockFearExact: dockExact ? 1 : 0,
        dockFearChargeViolations: dockCharge,
        dockFearReverses: dockReverses ? 1 : 0,
        dockFearDefectMax: dockFearCompare.defectMax,
        dockFearDefectFinal: dockFearCompare.defectFinal,
        dockFearFirstSpreadBeat: dockFearCompare.firstSpread,
        dockFearCrossSlotsMax: dockFearCompare.crossSlotsMax,
        dockFearFirstCrossBeat: dockFearCompare.firstCross,
        dockWiredSeedSlotA: wireSlots[0] ?? -1,
        dockWiredSeedSlotB: wireSlots[1] ?? -1,
        dockWiredFearDefectMax: dockWiredCompare.defectMax,
        dockWiredFearFirstSpreadBeat: dockWiredCompare.firstSpread,
        dockWiredFearCrossSlotsMax: dockWiredCompare.crossSlotsMax,
        dockWiredFearFirstCrossBeat: dockWiredCompare.firstCross,
        dockFearVacuumSupport: dockFear.v.states[DOCK_BEATS]?.weights.size ?? -1,
        dockFearSeededSupport: dockFear.a.states[DOCK_BEATS]?.weights.size ?? -1,
      },
      control: {
        ringBeats: RING_BEATS,
        dockBeats: DOCK_BEATS,
      },
      notes:
        'L2, exact Eisenstein integers (BigInt) on whole configurations. The defect counts slots where the seeded state expected vibe differs from the vacuum state, as exact ratios. The cross term is 2 Re sum conj(A) B q_s over shared configurations, the interference in the expected vibe of the superposition of the two seeds. The dock streams into itself (a D4 box of side 1), so it tests the clock and the schedule, not motion between docks. The palindromic swap is kept classical: it is a permutation of configurations. The seeds are at slot 0 and at the right-moving slot of the middle dock on the ring, and at slots 0 and 2 on the dock.',
    })
  },
})
