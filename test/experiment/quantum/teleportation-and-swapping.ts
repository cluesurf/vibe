// Teleportation and entanglement swapping on the knit: can one knot's state reach another knot's role, exactly,
// through a pair the knit made and two classical trits?
//
// Bennett et al. (1993) for qudits: a maximally entangled pair, a reading of the sender's two roles in a basis of
// maximally entangled states (d^2 outcomes, two trits here), and a displacement on the receiver's role chosen by
// the outcome. Zukowski et al. (1993): teleporting half of an entangled pair swaps the entanglement onto roles
// that never met. In the model's terms every piece is its own: the pair is made by the knit's fear beat, the
// reading is the net count over a Lagrangian coset of two roles (the model's reading, E-QTM-0130, 0142), the
// receiver's weights conditioned on the outcome are the coset sums over the read roles (Tr(Pi A(u)) = 1 on the
// coset), and the correction is a link move (a grid move, one of the 216).
//
// Which pair: a love and a fear met once from a common role point (the love-fear singlet phase V(2 pi / 3) on
// |0>|0>) is maximally entangled and a stabilizer state: V|00> = (1 x S) Phi with S = diag(1, omega, omega)
// Clifford, since |<Phi|00>|^2 = 1/3 makes every Schmidt weight 1/3 (E-QTM-0141: e2 = g, e3 = g^3). Probe
// before this file (tmp/ctx-probe2.ts): read in the love frame its 9 weights are 1 unit each on a Lagrangian
// coset; in the stored (fear) frame they sit on a non-isotropic set and are not a state, so the love frame is
// read. A LIKE pair does not serve: over every like word with up to three meetings and any one-role Clifford
// moves between them (2,099,520 words from 45 product starts), the largest |det psi|^2 is 0.0298, short of the
// 1/27 = 0.0370 of maximal entanglement, and E-QTM-0133's Tsirelson pair has Schmidt weights (1/2, 1/2, 0):
// an ebit, which can carry a qubit but not a qutrit. That is the prediction registered for the control below.
//
// Predictions registered before the run: on every link start where a love and a fear of dock 0 meet, the pair
// made there (from |0>|0> at the meeting beat, carried by the knit until just before its next meeting) is
// maximally entangled with uniform marginals; a Lagrangian reading of (input, pair's first role) with grid-move
// corrections on the pair's second role teleports every input exactly (weights proportional, BigInt); each of
// the 9 outcomes has chance exactly 1/9 for every input; a fear in the input arrives as the same fear share at
// the receiver; and teleporting one role of a two-role knot leaves the other role knotted with the receiver,
// equal to the knot exactly, fears included. Controls: the same pair with the fear beat off stays a product and
// no reading-plus-correction teleports; the like Tsirelson pair teleports no qutrit exactly.
//
// Gates, fixed before the first run:
// G1 on all 17 starts of E-MTH-0028's family a love-fear meeting of dock 0 is found and its pair is maximally
//    entangled (each role's marginal 1/9 on every point, exactly)
// G2 on every start a protocol (one of the 40 Lagrangian readings, one grid move per outcome) teleports all
//    inputs exactly: the 12 stabilizer states, the Strange state, and the reduced role states of 24 knit knots
//    with fear; every outcome's chance is exactly 1/9 for every input
// G3 fear is carried: for every input with fear and every outcome the receiver's fear share equals the input's
// G4 entanglement swapping: on every start, the 24 knit knots (two roles, with fear) teleported through one role
//    arrive exactly, fears included, and the pair itself teleported through its first role leaves a maximally
//    entangled pair on two roles that never met
// G5 controls: with the fear beat off the pair is a product (a role's marginal is not uniform) and 0 of the 40
//    readings teleports; the like Tsirelson pair teleports on 0 of the 40 readings, and its best average
//    fidelity over the stabilizer inputs is below 1
// Reported: per start the pair's tokens and beat, the reading used, how many members (single joint points of
// the read roles) inside an outcome carry a negative weight toward the receiver (a single history is not the
// teleported state; only the outcome's net count is), and the like pair's fidelity.
//
// Depth L2: a known protocol run with the model's own pair, reading and link moves, over the start family.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearKernels,
  meetingKernel,
  meetWhole,
  phasePermOf,
  physicalWhole,
  swapPhase,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  roleWeights,
  runWhole,
  vacuumBackground,
} from '@/code/measure/knit-magic'
import {
  cosetLabels,
  lagrangians,
  marginalOf,
  permuteRole,
  phaseSpace,
  productWeights,
} from '@/code/measure/stabilizer-contexts'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  hermitianSpectrum,
  operatorFromWigner,
} from '@/code/measure/qutrit-clifford'
import { phasePointOperators } from '@/code/measure/grid-weights'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 240
const CARRY_LIMIT = 24
const KNOTS = 24

type Protocol = { plane: number; corrections: Map<number, number[]> }

const units = (w: readonly bigint[]): bigint =>
  w.reduce((a, b) => a + b, 0n)
const fearsOf = (w: readonly bigint[]): bigint =>
  w.reduce((s, x) => s + (x < 0n ? -x : 0n), 0n)

function proportional(
  a: readonly bigint[],
  b: readonly bigint[],
): boolean {
  const na = units(a)
  const nb = units(b)

  return na !== 0n && a.every((x, i) => x * nb === (b[i] ?? 0n) * na)
}

// the weights of every outcome of a reading of `read` roles by a plane's coset labels, in one pass
function outcomes(
  weight: readonly bigint[],
  roles: number,
  read: readonly [number, number],
  labels: Int32Array,
): Map<number, bigint[]> {
  const kept = Array.from({ length: roles }, (_, r) => r).filter(
    r => !read.includes(r),
  )
  const out = new Map<number, bigint[]>()

  weight.forEach((w, i) => {
    if (w === 0n) {
      return
    }

    const digit = (r: number): number =>
      Math.floor(i / 9 ** (roles - 1 - r)) % 9
    const c = labels[9 * digit(read[0]) + digit(read[1])] ?? 0
    const keptPoint = kept.reduce((acc, r) => acc * 9 + digit(r), 0)

    let row = out.get(c)

    if (!row) {
      row = new Array<bigint>(9 ** kept.length).fill(0n)
      out.set(c, row)
    }

    row[keptPoint] = (row[keptPoint] ?? 0n) + w
  })

  return out
}

export default experiment({
  id: 'quantum/teleportation-and-swapping',
  code: 'E-QTM-0152',
  title:
    'teleportation and entanglement swapping on the knit: the pair a love and a fear make at one meeting from a common role point is maximally entangled and a stabilizer state, and with it, a reading of two roles on a Lagrangian coset (two classical trits, each outcome at chance 1/9) and one link move per outcome, every input reaches the receiving role exactly on all 17 link starts, fears included, and half of a fear-carrying knot swaps onto a role that never met its partner; with the fear beat off the pair is a product, and a like pair, an ebit at best, teleports no qutrit',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const two = phaseSpace(2)
    const planes = lagrangians(two).map(p => cosetLabels(two, p))
    const perms = gridMoves().act.map(g => phasePermOf(g))
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA })!
    const colorOff = fearKernels({ like: Math.PI, unlike: 0 })!

    // inputs: the 12 stabilizer states and the Strange state
    const basis0 = roleWeights('basis0')
    const stabilizer: bigint[][] = []
    const seen = new Set<string>()

    for (const p of perms) {
      const image = permuteRole(basis0, 1, 0, p)

      if (!seen.has(image.join(','))) {
        seen.add(image.join(','))
        stabilizer.push(image)
      }
    }

    const strange = roleWeights('strange')

    // knots with fear from the knit's default-start histories (color law, vacuum, dock 0): the first KNOTS
    // two-role wholes that hold a fear, one per pair and beat, in a fixed order
    const knots: bigint[][] = []

    {
      const weave = makeColorWeave({ side: 3, table: 'pair' })
      const slots = weave.mesh.cellCount * 24
      const records = classicalRecords({
        weave,
        links: weave.links,
        background: vacuumBackground(slots),
        open: Array.from({ length: 24 }, (_, d) => d),
        beats: BEATS,
      })

      for (const { a, b } of meetingPairs(records)) {
        const steps = runWhole({
          weave,
          start: productWhole([a, b], ['basis0', 'basis1']),
          records: pairRecords(records, a, b),
          kernel4: [],
          color: colorOn,
        })

        for (
          let t = 0;
          t < steps.length && knots.length < KNOTS;
          t += 7
        ) {
          const w = physicalWhole(steps[t]!.whole).weight

          if (fearsOf(w) > 0n && fearsOf(marginalOf(w, 2, [1])) > 0n) {
            knots.push([...w])
          }
        }
      }
    }

    const inputs = [
      ...stabilizer,
      strange,
      ...knots.map(k => marginalOf(k, 2, [1])),
    ]

    // teleport one input (one role) through a pair (two roles) with a plane: the receiver's weights per outcome
    const teleport = (
      input: readonly bigint[],
      pair: readonly bigint[],
      plane: Int32Array,
    ): Map<number, bigint[]> =>
      outcomes(productWeights(input, pair), 3, [0, 1], plane)

    // a protocol for a pair: the first plane for which every outcome has a grid move taking the receiver's weights
    // to the input's for every input
    const findProtocol = (
      pair: readonly bigint[],
      probe: readonly (readonly bigint[])[],
    ): Protocol | null => {
      for (let plane = 0; plane < planes.length; plane++) {
        const corrections = new Map<number, number[]>()

        let ok = true

        for (const input of probe) {
          const got = teleport(input, pair, planes[plane]!)

          for (const [c, w] of got) {
            const candidates =
              corrections.get(c) ?? perms.map((_, g) => g)
            const kept = candidates.filter(g =>
              proportional(permuteRole(w, 1, 0, perms[g]!), input),
            )

            corrections.set(c, kept)
            ok = ok && kept.length > 0
          }

          if (!ok) {
            break
          }
        }

        if (ok && corrections.size === 9) {
          return { plane, corrections }
        }
      }

      return null
    }

    // the pair on each start
    const family = startFamily(16)

    let startsWithPair = 0
    let startsMaximal = 0
    let startsTeleporting = 0
    let startsChanceExact = 0
    let startsFearCarried = 0
    let startsSwapping = 0
    let startsPairSwap = 0
    let carriedMoves = 0

    const distinctPairs = new Set<string>()

    let offProducts = 0
    let offTeleporting = 0
    let negativeMembers = 0
    let members = 0

    const detail: string[] = []

    for (const member of family) {
      withStart(member, () => {
        const weave = makeColorWeave({ side: 3, table: 'pair' })
        const slots = weave.mesh.cellCount * 24
        const records = classicalRecords({
          weave,
          links: weave.links,
          background: vacuumBackground(slots),
          open: Array.from({ length: 24 }, (_, d) => d),
          beats: BEATS,
        })

        let found: { a: number; b: number; t0: number } | null = null

        for (let t = 0; t < records.length && !found; t++) {
          const r = records[t]!

          r.meetings.forEach(([a, b], k) => {
            const s = r.signs?.[k]

            if (!found && s && s[0] !== s[1]) {
              found = { a, b, t0: t }
            }
          })
        }

        if (!found) {
          detail.push(`${member.name}:none`)

          return
        }

        const { a, b, t0 } = found as {
          a: number
          b: number
          t0: number
        }

        startsWithPair++

        const mine: BeatRecord[] = pairRecords(records, a, b).slice(t0)

        const carry = (
          color: FearKernels,
        ): { pair: bigint[]; beats: number } => {
          let whole: Whole = productWhole([a, b], ['basis0', 'basis0'])
          let beats = 0

          for (let t = 0; t < Math.min(mine.length, CARRY_LIMIT); t++) {
            if (t > 0 && (mine[t]?.meetings.length ?? 0) > 0) {
              break
            }

            whole = advanceWhole({
              weave,
              whole,
              record: mine[t]!,
              kernel4: [],
              color,
              fixed: false,
              forward: true,
            })!
            beats++
            carriedMoves +=
              color === colorOn
                ? (mine[t]?.crossings.filter(
                    ([, g]) => g !== weave.moves.identity,
                  ).length ?? 0)
                : 0
          }

          return { pair: [...physicalWhole(whole).weight], beats }
        }

        const on = carry(colorOn)
        const off = carry(colorOff)
        const pair = on.pair

        distinctPairs.add(pair.join(','))

        const n = units(pair)
        const maximal = [0, 1].every(keep =>
          marginalOf(pair, 2, [keep]).every(w => w * 9n === n),
        )

        startsMaximal += maximal ? 1 : 0

        const protocol = findProtocol(pair, [strange, ...stabilizer])

        let allExact = protocol !== null
        let chanceExact = protocol !== null
        let fearCarried = protocol !== null

        if (protocol) {
          for (const input of inputs) {
            const got = teleport(input, pair, planes[protocol.plane]!)
            const total = units(input) * n

            for (const [c, w] of got) {
              const g = protocol.corrections.get(c)?.[0] ?? 0
              const fixed = permuteRole(w, 1, 0, perms[g]!)

              allExact = allExact && proportional(fixed, input)
              chanceExact = chanceExact && units(w) * 9n === total
              fearCarried =
                fearCarried &&
                fearsOf(fixed) * units(input) ===
                  fearsOf(input) * units(fixed)
            }

            // members: each read point (x_A, x_B) inside an outcome, and its own column toward the receiver
            if (input === strange) {
              for (let xa = 0; xa < 9; xa++) {
                for (let xb = 0; xb < 9; xb++) {
                  members++

                  let negative = false

                  for (let z = 0; z < 9; z++) {
                    negative =
                      negative ||
                      (input[xa] ?? 0n) * (pair[9 * xb + z] ?? 0n) < 0n
                  }

                  negativeMembers += negative ? 1 : 0
                }
              }
            }
          }
        }

        startsTeleporting += allExact ? 1 : 0
        startsChanceExact += chanceExact ? 1 : 0
        startsFearCarried += fearCarried ? 1 : 0

        // swapping: a knot (R, A) with A teleported through the pair; roles R, A, B, C, read A and B
        let swapped = protocol !== null

        if (protocol) {
          for (const knot of [...knots, pair]) {
            const got = outcomes(
              productWeights(knot, pair),
              4,
              [1, 2],
              planes[protocol.plane]!,
            )

            for (const [c, w] of got) {
              const g = protocol.corrections.get(c)?.[0] ?? 0
              const fixed = permuteRole(w, 2, 1, perms[g]!)

              swapped = swapped && proportional(fixed, knot)
            }
          }

          // the pair teleported through its own first role: the receiver and the pair's second role never met
          const got = outcomes(
            productWeights(pair, pair),
            4,
            [1, 2],
            planes[protocol.plane]!,
          )

          let pairSwap = true

          for (const [, w] of got) {
            const m = units(w)

            pairSwap =
              pairSwap &&
              [0, 1].every(keep =>
                marginalOf(w, 2, [keep]).every(x => x * 9n === m),
              )
          }

          startsPairSwap += pairSwap ? 1 : 0
        }

        startsSwapping += swapped ? 1 : 0

        // the fear beat off
        const offN = units(off.pair)
        const offProduct = !marginalOf(off.pair, 2, [0]).every(
          w => w * 9n === offN,
        )

        offProducts += offProduct ? 1 : 0
        offTeleporting += findProtocol(off.pair, [
          strange,
          ...stabilizer,
        ])
          ? 1
          : 0

        detail.push(
          `${member.name}:${a}-${b}@${t0}+${on.beats}${protocol ? `/plane${protocol.plane}` : '/none'}`,
        )
      })
    }

    // the like Tsirelson pair (E-QTM-0133): from |0> x s (s a stabilizer state), two like meetings, a link move
    // on the first role, a third like meeting; the first word in a fixed order that gives Schmidt weights
    // (1/2, 1/2, 0), read exactly by the marginal's purity 3 sum W^2 = 1/2 and, in floats, a zero eigenvalue
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const onePoints = phasePointOperators(1)
    const meet = (w: Whole): Whole =>
      meetWhole({
        whole: w,
        a: 0,
        b: 1,
        kernel4: kThird,
        fixed: false,
      })!

    let likePair: bigint[] | null = null
    let likeMove = -1

    for (const s of stabilizer) {
      const after2 = meet(
        meet({ tokens: [0, 1], weight: productWeights(basis0, s) }),
      )

      for (let g = 0; g < perms.length && !likePair; g++) {
        const moved: Whole = {
          ...after2,
          weight: permuteRole(after2.weight, 2, 0, perms[g]!),
        }
        const w = meet(moved).weight
        const m = marginalOf(w, 2, [0])
        const nm = units(m)
        const purity = 3n * m.reduce((x, y) => x + y * y, 0n)

        if (2n * purity === nm * nm) {
          const spectrum = hermitianSpectrum(
            operatorFromWigner(
              m.map(x => Number(x) / Number(nm)),
              onePoints,
            ),
          )

          if (Math.abs(spectrum[0] ?? 1) < 1e-9) {
            likePair = [...w]
            likeMove = g
          }
        }
      }

      if (likePair) {
        break
      }
    }

    let likeTeleporting = 0
    let likeBestFidelity = 0

    if (likePair) {
      const pair = likePair

      likeTeleporting = findProtocol(pair, [strange, ...stabilizer])
        ? 1
        : 0

      // average fidelity over the 12 stabilizer inputs, each outcome corrected by its best grid move:
      // F = Tr(rho_C rho_in) = 3 sum W_C W_in
      for (const labels of planes) {
        let total = 0

        for (const input of stabilizer) {
          const got = teleport(input, pair, labels)
          const nIn = Number(units(input))

          let f = 0

          for (const [, w] of got) {
            const nW = Number(units(w))

            let best = 0

            if (nW === 0) {
              continue
            }

            for (const p of perms) {
              const fixed = permuteRole(w, 1, 0, p)

              let s = 0

              fixed.forEach((x, q) => {
                s += Number(x) * Number(input[q] ?? 0n)
              })

              best = Math.max(best, (3 * s) / (nW * nIn))
            }

            // weighted by the outcome's chance
            f += (nW / (nIn * Number(units(pair)))) * best
          }

          total += f
        }

        likeBestFidelity = Math.max(
          likeBestFidelity,
          total / stabilizer.length,
        )
      }
    }

    const all = family.length
    const g1 = startsWithPair === all && startsMaximal === all
    const g2 = startsTeleporting === all && startsChanceExact === all
    const g3 = startsFearCarried === all
    const g4 = startsSwapping === all && startsPairSwap === all
    const g5 =
      offProducts === all &&
      offTeleporting === 0 &&
      likePair !== null &&
      likeTeleporting === 0 &&
      likeBestFidelity < 1 - 1e-12

    return verdict({
      status:
        g1 && g2 && g3 && g4 && g5 ? 'pass' : g2 ? 'partial' : 'fail',
      claim:
        'on every link start the love-fear pair made at one meeting from a common role point is maximally entangled, and a Lagrangian reading of two roles (9 outcomes, each at chance exactly 1/9) with one link move per outcome teleports every input exactly, fears included, and swaps a fear-carrying knot onto a role that never met its partner; with the fear beat off the pair is a product and nothing teleports, and a like pair (an ebit) teleports no qutrit',
      metrics: {
        gatePairMade: g1 ? 1 : 0,
        gateTeleport: g2 ? 1 : 0,
        gateFearCarried: g3 ? 1 : 0,
        gateSwapping: g4 ? 1 : 0,
        gateControls: g5 ? 1 : 0,
        starts: all,
        startsWithLoveFearPair: startsWithPair,
        startsPairMaximal: startsMaximal,
        startsTeleportingEveryInput: startsTeleporting,
        startsChanceExactlyNinth: startsChanceExact,
        startsFearCarried,
        startsSwappingEveryKnot: startsSwapping,
        startsPairSwapMaximal: startsPairSwap,
        linkMovesCarriedOverStarts: carriedMoves,
        distinctPairsOverStarts: distinctPairs.size,
        inputs: inputs.length,
        knitKnotsWithFear: knots.length,
        strangeMembersRead: members,
        strangeMembersWithNegativeColumn: negativeMembers,
        fearOffPairsProduct: offProducts,
        fearOffStartsTeleporting: offTeleporting,
        likePairFound: likePair ? 1 : 0,
        likePairLinkMove: likeMove,
        likePairTeleportingReadings: likeTeleporting,
        likePairBestAverageFidelity: likeBestFidelity,
      },
      control: {
        lagrangianReadings: planes.length,
        gridMoves: perms.length,
        stabilizerInputs: stabilizer.length,
      },
      notes:
        `per start (tokens@meeting beat+beats carried/reading): ${detail.join(' ')}. ` +
        'First run 2026-09-26: every gate passed as fixed. Every start found the same love-fear meeting (tokens 22 and 21 at beat 2: the vibes, and so the meetings, do not depend on the link start) and the same reading, so two reported metrics were added after it to show the starts differ where they can: the pair carried 168 non-identity link moves over the 17 starts and arrived as 16 distinct pairs, and one reading (plane 16 of the 40) serves all of them with corrections that depend on the start; every other number unchanged. The like pair (the first word found: two like meetings from |0> x s, link move 90 on the first role, a third like meeting) teleports on 0 of 40 readings, with best average fidelity 5/6 over the 12 stabilizer inputs. ' +
        "L2. The reading is the reader's net count over a coset, the adopted reading rule (E-QTM-0142), not a beat; the receiver's conditional weights are exact sums, and the correction is a link move. A member of an outcome (one joint point of the two read roles) sends the receiver the column input(x_A) pair(x_B, .), which for a Strange input is negative on some members: a single history does not carry the state, only the outcome's count does, as E-QTM-0144 found for Bell.",
    })
  },
})
