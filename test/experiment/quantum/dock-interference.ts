// Interference between the lines of one dock, by an exact reduced method (code/rule/fear-dock).
//
// E-QTM-0108 ran the fear clock on one D4 dock over its whole configuration space and reached 9 beats; two
// seeds on different lines did not interfere in that time, and that gate failed. The reduced method rests
// on the knit itself: the palindromic swap fires only where a line holds a lone charge beside a calm line,
// so in the vacuum no swap fires and the dock's vacuum is a product of twelve line states, and a seeded vibe
// correlates only the lines its swaps can reach. The state is kept as a sparse amplitude map over the lines
// a seed has touched times one vector per untouched line, every weight an Eisenstein integer, exact zeros
// pruned. The dock streams into itself (a D4 box of side 1).
//
// Two knits: the committed turning weave (pair table; the turn acts on every state of a line, the lone
// vibe's hop included), and the color turn weave (bind table, E-FRC-0136; the turn acts only where both
// slots hold a vibe, since that table exchanges nothing else). Seeds, fixed before the run: a love on the
// second slot of the first and of the second wire of beat 0's partition (a love on a line's second slot is
// the one the palindromic swap can move). 48 beats, two periods of the committed schedule.
//
// Gates, fixed before the first run:
// 1. the reduced method equals E-QTM-0108's full-configuration method on the committed knit, turn on, for 6
//    beats: the same norm and the same expected vibe on every slot, for the vacuum and for seed A, exactly
// 2. with the turn off (phi = pi) both knits stay one configuration and equal the classical knit run by
//    collide (turningWeave and colorTurnWeave), 48 beats, the vacuum and both seeds
// 3. with the turn, both knits: the total chance exactly 1 every beat, every configuration in the sector of
//    its start, and seed A run 48 beats forward and back returns exactly
// 4. the vacuum never touches a line (it stays a product of line states), both knits
// 5. the question: on the committed knit, the cross term between seeds A and B is not zero at some beat
//    within 48
// Reported: the same cross term on the color turn knit, the defect's size, how many lines each seed touches,
// the size of the joint map, and the vacuum's properties: the expected number of vibes per beat against the
// classical vacuum flash, the spread of the number of love-fear pairs, and its support as a product.
//
// The first run ran out of memory before reporting: it kept every beat's three states, and on the committed
// knit the seed touches all twelve lines by beat 37, the joint map passing 450,000 entries. The run now keeps
// only the current states and stops a knit where a joint map passes 150,000 entries, reporting the beats
// reached. Gates 2 to 5 read "within the beats reached". The second run failed reversal on both knits
// through a harness error: it compared the joint maps' keys, but lines touched on the way stay in the joint
// map holding calm after the backward run, so an equal state has different keys. Reversal is now compared
// on the whole state, both expanded over all twelve lines. Nothing else changed.
//
// Depth L2: a constructed rule on the committed and adopted knits, exact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { COLOR_TURN_SPEC, colorTurnWeave } from '@/code/rule/color-turn-weave'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { collide } from '@/code/rule/lattice-gas'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { makeWill } from '@/code/tone/will'
import { colorLocalKnit, colorWeaveKnit, type Knit } from '@/code/rule/fear-weave'
import { norm } from '@/code/rule/fear-walk'
import { chargeProfile, configOf, dockBeat, makeDock, setTone, totalNorm, type Amplitudes } from '@/code/rule/fear-clock'
import { dockCross, dockNorm, dockProfile, dockReducedBeat, dockStart, expandDock, type ClockKind, type DockMode, type DockState } from '@/code/rule/fear-dock'

const BEATS = 48
// the largest joint map a run may hold before it stops: memory, not time, is the laptop's limit here
const JOINT_CAP = 150000
const CHECK_BEATS = 6

const stateOf = (k: number): [number, number] => [Math.floor(k / 3) - 1, (k % 3) - 1]

export default experiment({
  id: 'quantum/dock-interference',
  code: 'E-QTM-0110',
  title:
    'interference between the lines of one dock by an exact reduced method: the vacuum is a product of line states, a seed correlates only the lines its swaps reach, the reduced state equals the full configuration space where both run, recovers both knits at phi = pi, and runs 48 beats to ask whether two seeds on different lines interfere',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: 1 })
    const opposite = Array.from({ length: 24 }, (_, d) => mesh.opposite(d))
    const committedKnit = colorWeaveKnit(makeColorWeave({ side: 1, table: 'pair' }))
    const turnKnit: Knit = colorLocalKnit({
      opposite,
      couplesZero: COLOR_TURN_SPEC.couplesZero,
      turn: COLOR_TURN_SPEC.turn,
      positionAt: COLOR_TURN_SPEC.positionAt,
      swapAt: COLOR_TURN_SPEC.swapAt,
      table: COLOR_TURN_SPEC.tables[0] ?? [],
      swapWhen: COLOR_TURN_SPEC.swapWhen,
    })
    const lines = committedKnit.lines
    const seedsOf = (knit: Knit): number[] => {
      const wires = (knit.positions[knit.positionAt[0] ?? 0] ?? []).map(c => c[1])

      return [knit.lines[wires[0] ?? 0]?.[1] ?? 0, knit.lines[wires[1] ?? 0]?.[1] ?? 0]
    }

    const configOfDock = (s: DockState): number | null => {
      if (s.joint.size !== 1) {
        return null
      }

      const [key] = [...s.joint.keys()]
      const tones = new Array<number>(24).fill(0)

      for (let l = 0; l < lines.length; l++) {
        const at = s.touched.indexOf(l)
        let local = -1

        if (at >= 0) {
          local = Math.floor((key ?? 0) / 9 ** at) % 9
        } else {
          const nonzero = (s.free[l] ?? []).map((z, k) => (z[0] !== 0n || z[1] !== 0n ? k : -1)).filter(k => k >= 0)

          if (nonzero.length !== 1) {
            return null
          }

          local = nonzero[0] ?? 0
        }

        const [x, y] = stateOf(local)

        tones[lines[l]?.[0] ?? 0] = x
        tones[lines[l]?.[1] ?? 0] = y
      }

      return configOf(tones)
    }

    const study = (knit: Knit, kind: ClockKind, classical: (t: number) => Collision) => {
      const [slotA, slotB] = seedsOf(knit)
      const starts = [undefined, { slot: slotA ?? 0, vibe: 1 }, { slot: slotB ?? 0, vibe: 1 }]
      const run = (mode: DockMode, start: (typeof starts)[number]): DockState[] => {
        const out: DockState[] = [dockStart(lines, start)]

        for (let t = 0; t < BEATS; t++) {
          out.push(dockReducedBeat(out[t]!, knit, kind, mode, t, true))
        }

        return out
      }

      // 2: phi = pi against the classical knit
      let classicalMismatch = 0

      for (const start of starts) {
        const states = run('committed', start)
        let will = makeWill(mesh)

        if (start) {
          will.data[start.slot] = start.vibe
        }

        for (let t = 0; t < BEATS; t++) {
          collide(will, classical(t))

          const config = configOfDock(states[t + 1]!)

          classicalMismatch += config === configOf([...will.data]) ? 0 : 1
        }

        will = makeWill(mesh)
      }

      // 3 and 4 and 5: the turn, the three states in lockstep, nothing kept but the first beats (for gate 1)
      // and the current ones, stopped where a joint map passes the cap
      let v = dockStart(lines, starts[0])
      let a = dockStart(lines, starts[1])
      let b = dockStart(lines, starts[2])
      const early: { v: DockState; a: DockState }[] = []
      let exact = true
      let sectorViolations = 0
      let vacuumTouched = 0
      let reached = 0
      const defect: number[] = []
      const cross: number[] = []
      const pairsPerBeat: number[] = []
      let spreadAtEnd = 0
      let jointMax = 0

      const check = (s: DockState, charge: number): void => {
        exact = exact && dockNorm(s) === 4n ** BigInt(s.halvings)

          for (const key of s.joint.keys()) {
            let q = 0

            s.touched.forEach((_, i) => {
              const [x, y] = stateOf(Math.floor(key / 9 ** i) % 9)

              q += x + y
            })

            sectorViolations += q === charge ? 0 : 1
          }

        s.free.forEach((vec, l) => {
          if (!s.touched.includes(l)) {
            vec.forEach((z, k) => {
              const [x, y] = stateOf(k)

              sectorViolations += (z[0] !== 0n || z[1] !== 0n) && x + y !== 0 ? 1 : 0
            })
          }
        })
      }

      const observe = (): void => {
        const pv = dockProfile(v, lines, 24)
        const pa = dockProfile(a, lines, 24)

        defect.push(pa.filter((x, s) => x * 4n ** BigInt(v.halvings) !== (pv[s] ?? 0n) * 4n ** BigInt(a.halvings)).length)
        cross.push(dockCross(a, b, lines, 24).filter(x => x !== 0n).length)

        // the vacuum: the chance each line holds a pair
        let mean = 0
        let variance = 0

        v.free.forEach(vec => {
          const total = vec.reduce((acc, z) => acc + norm(z), 0n)
          const calm = norm(vec[4] ?? [0n, 0n])
          const p = total > 0n ? Number(((total - calm) * 1000000n) / total) / 1e6 : 0

          mean += p
          variance += p * (1 - p)
        })

        pairsPerBeat.push(mean)
        spreadAtEnd = variance
      }

      observe()

      for (let t = 0; t < BEATS; t++) {
        v = dockReducedBeat(v, knit, kind, 'fear', t, true)
        a = dockReducedBeat(a, knit, kind, 'fear', t, true)
        b = dockReducedBeat(b, knit, kind, 'fear', t, true)
        check(v, 0)
        check(a, 1)
        check(b, 1)
        vacuumTouched = Math.max(vacuumTouched, v.touched.length)
        jointMax = Math.max(jointMax, a.joint.size, b.joint.size)
        reached = t + 1

        if (t < CHECK_BEATS) {
          early.push({ v, a })
        }

        observe()

        if (a.joint.size > JOINT_CAP || b.joint.size > JOINT_CAP) {
          break
        }
      }

      let back = a

      for (let t = reached - 1; t >= 0; t--) {
        back = dockReducedBeat(back, knit, kind, 'fear', t, false)
      }

      // compared as whole states: both expanded over all twelve lines, weights over 2^halvings
      const start = dockStart(lines, starts[1])
      const all = lines.map((_, l) => l)
      const eb = expandDock(back, all)
      const es = expandDock(start, all)
      const scaleB = 2n ** BigInt(start.halvings)
      const scaleS = 2n ** BigInt(back.halvings)
      const reverses =
        eb.size === es.size &&
        [...es].every(([k, z]) => {
          const w = eb.get(k)

          return w !== undefined && w[0] * scaleB === z[0] * scaleS && w[1] * scaleB === z[1] * scaleS
        })

      const classicalPairs: number[] = []

      {
        let will = makeWill(mesh)

        classicalPairs.push(0)

        for (let t = 0; t < BEATS; t++) {
          collide(will, classical(t))
          classicalPairs.push(lines.filter(([i, j]) => will.data[i] !== 0 || will.data[j] !== 0).length)
        }

        will = makeWill(mesh)
      }

      const mean = (xs: number[]): number => xs.slice(1).reduce((s, x) => s + x, 0) / (xs.length - 1)
      const lineSupports = v.free.map(vec => vec.filter(z => z[0] !== 0n || z[1] !== 0n).length)

      return {
        seeds: [slotA ?? -1, slotB ?? -1],
        classicalMismatch,
        exact,
        sectorViolations,
        reverses,
        reached,
        vacuumTouched,
        touchedA: a.touched.length,
        touchedB: b.touched.length,
        jointMax,
        defectMax: Math.max(...defect),
        firstSpread: defect.findIndex(d => d > 1),
        crossMax: Math.max(...cross),
        firstCross: cross.findIndex(c => c > 0),
        vacuumPairsMean: mean(pairsPerBeat),
        classicalPairsMean: mean(classicalPairs),
        vacuumPairSpreadAtEnd: spreadAtEnd,
        vacuumSupport: lineSupports.reduce((p, x) => p * x, 1),
        early,
      }
    }

    const committed = study(committedKnit, 'pair', turningWeave({ opposite }))
    const turned = study(turnKnit, 'bind', colorTurnWeave({ opposite }))

    // 1: the reduced method against the full configuration method, committed knit, turn on
    const dock = makeDock(opposite)
    const calm = configOf(new Array<number>(24).fill(0))
    let fullV: Amplitudes = { weights: new Map([[calm, [1n, 0n]]]), halvings: 0 }
    let fullA: Amplitudes = { weights: new Map([[setTone(calm, committed.seeds[0] ?? 0, 1), [1n, 0n]]]), halvings: 0 }
    let fullMismatch = 0

    for (let t = 0; t < CHECK_BEATS; t++) {
      fullV = dockBeat(fullV, dock, t, 'fear', true)
      fullA = dockBeat(fullA, dock, t, 'fear', true)

      for (const [full, reduced] of [
        [fullV, committed.early[t]!.v],
        [fullA, committed.early[t]!.a],
      ] as const) {
        const pf = chargeProfile(full, 24)
        const pr = dockProfile(reduced, lines, 24)

        fullMismatch += totalNorm(full) * 4n ** BigInt(reduced.halvings) === dockNorm(reduced) * 4n ** BigInt(full.halvings) ? 0 : 1
        fullMismatch += pf.filter((x, s) => x * 4n ** BigInt(reduced.halvings) !== (pr[s] ?? 0n) * 4n ** BigInt(full.halvings)).length
      }
    }

    const both = [committed, turned]
    const ok =
      fullMismatch === 0 &&
      both.every(s => s.classicalMismatch === 0 && s.exact && s.sectorViolations === 0 && s.reverses && s.vacuumTouched === 0) &&
      committed.crossMax > 0

    const report = (name: string, s: typeof committed) => [
      [`${name}SeedA`, s.seeds[0] ?? -1],
      [`${name}SeedB`, s.seeds[1] ?? -1],
      [`${name}ClassicalMismatch`, s.classicalMismatch],
      [`${name}Exact`, s.exact ? 1 : 0],
      [`${name}SectorViolations`, s.sectorViolations],
      [`${name}Reverses`, s.reverses ? 1 : 0],
      [`${name}VacuumLinesTouched`, s.vacuumTouched],
      [`${name}SeedALinesTouched`, s.touchedA],
      [`${name}SeedBLinesTouched`, s.touchedB],
      [`${name}JointMapMax`, s.jointMax],
      [`${name}BeatsReached`, s.reached],
      [`${name}DefectMax`, s.defectMax],
      [`${name}FirstSpreadBeat`, s.firstSpread],
      [`${name}CrossSlotsMax`, s.crossMax],
      [`${name}FirstCrossBeat`, s.firstCross],
      [`${name}VacuumPairsMean`, s.vacuumPairsMean],
      [`${name}ClassicalVacuumPairsMean`, s.classicalPairsMean],
      [`${name}VacuumPairCountVarianceAtEnd`, s.vacuumPairSpreadAtEnd],
      [`${name}VacuumSupport`, s.vacuumSupport],
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reduced method equals the full configuration space for 6 beats; at phi = pi both knits stay one configuration and equal the classical knit for 48 beats; with the turn both are exact, stay in their charge sector and reverse, and the vacuum never correlates two lines; two seeds on different lines interfere, from beat 15 on the committed knit (run to beat 24, where the joint map passes the cap) and from beat 37 on the color turn knit (run to 48)',
      metrics: {
        reducedAgainstFullMismatch: fullMismatch,
        ...Object.fromEntries([...report('committed', committed), ...report('colorTurn', turned)]),
      },
      control: {
        beats: BEATS,
        checkBeats: CHECK_BEATS,
      },
      notes:
        'L2, exact Eisenstein integers (BigInt). The dock streams into itself (a D4 box of side 1): this tests the clock and the schedule, not motion between docks. The cross term is 2 Re sum conj(A) B q_s, counted as the number of slots where it is not zero. The vacuum numbers: the mean over 48 beats of the expected number of lines holding a love-fear pair, against the classical flash, the variance of that number at beat 48 (a product of lines, so a sum of line variances), and the vacuum support as the product of the lines supports.',
    })
  },
})
