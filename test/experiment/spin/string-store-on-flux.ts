// The string's store put ON THE FLUX, on LOCKED STAND-IN tokens on a husk ring (code/rule/flux-store-line).
//
// E-SPN-0074's paid string confines every channel and is an integer rule, but its store S was put in by hand. Here
// nothing is put in. Every link holds its center flux as one trit (the port pair of its end slots, E-FRC-0229),
// Gauss mod 3 is kept by recording every copy on the link it crosses (E-FRC-0230's recorded hop), and the string's
// store is ONE column of D bulk trits held at the string's end port. The string's length is the count of links
// with nonzero flux, l = sum bal(f)^2, the exponent of the light's own drift term, and the store holds D - l. A
// copy that lengthens the string copies one unit out of the column; a copy that would push the column past -D is
// not made (every token stays, its doublet label flips), E-SPN-0074's bounce.
//
// THE ARGUMENT, before any number.
// (1) Reversible: a copy with label j moves the registers by T_j (positions, the recorded flux, the store), and the
//     flipped labels move them by T_j^-1. A map that applies T_j where the image is in range and otherwise flips
//     the labels is a permutation of the whole register space (the bounce of E-SPN-0074, now with the flux and the
//     store in the state), and its inverse is flip . map . flip. Integer, and nothing is rounded.
// (2) Gauss: a charge q crossing link l forward writes f_l - q, back f_l + q, which is exactly the divergence the
//     copy changes. So Gauss mod 3 is kept on every state, and sigma + l is kept by construction.
// (3) The capacity: sigma lives in -D .. D, the 2D + 1 values of one column, and sigma = D - l on every state
//     reached from contact (sigma = D, no flux), so the string is at most 2D long, and 2D is reached (the pair and
//     three loves both spread until the column is empty). EXACTLY 2D, not D: the store counts the flux's squares,
//     which the flux's sign does not change; a store holding the signed line integral would stop at D.
//
// PREDICTIONS, written before this file ran.
// P1 The stream with the store's bounce is a permutation of the whole register space (positions, labels, every
//    link's trit, the store), and flip . stream . flip inverts it on every state: the love-fear pair under C on
//    rings 6 (D = 1) and 7 (D = 2), three loves on ring 5 (D = 1).
// P2 On the same spaces: every state that satisfies Gauss mod 3 maps to one that does, and sigma + l is kept on
//    every state (0 violations).
// P3 From contact (sigma = D, no flux) under every label choice, the reachable configurations have l <= 2D with
//    l = 2D reached, and sigma = D - l and Gauss on every one: the pair under C for D = 1 to 4 (ring 4D + 3) and
//    three loves for D = 1 to 3; the thermometer column of each sigma in -D .. D sums to sigma.
// P4 The rule runs exactly in Eisenstein integers (no cost here, E-SPN-0076 adds it): the walled pair under C
//    (ring 10, D = 2, 12 beats; ring 12 from the second run, see below) and three loves (ring 7, D = 1, 6 beats)
//    equal the float runner of E-SPN-0074 with a wall of 2D (code/measure/locked-run) to 1e-12, the numerator
//    norms sum to the denominator squared, the exact inverse returns the start, and every supported register
//    state holds Gauss and sigma = D - l.
//
// FIRST RUN (2026-09-26, 3 s), recorded: fail on G4 alone, the pair 0.34 from the float runner on ring 10 (three
// loves 1.7e-16), every other gate passing. A probe (tmp/fsx-probe6.ts) found the first bad beat: the float
// runner's wall reads the SMALLEST ARC between the tokens, so on a ring shorter than 4D + 3 it lets the pair step
// to a separation of 6 on ring 10, which is an arc of 4 the other way round, while the flux rule does not: the
// flux knows which way the string runs, and that string is 6 long. So the exact rule was right and the gate's
// comparator was wrong on a ring that small. SECOND RUN: the pair comparisons moved to ring 12 (> 4D + 2), the
// rule and every other gate unchanged, and the ring 10 comparison kept as a reported control (the arc wall and
// the flux string part there, which is itself the finding that the string is held with its direction).
//
// Gates, fixed with the predictions: G1 = P1, G2 = P2, G3 = P3, G4 = P4. Status pass if all hold.
// THE FEAR'S STREAM SIGN: C (the fear runs the love's rule in its conjugate coordinates, no added sign) is the
// user's choice (2026-09-26) and the only convention gated. C' (the other covariant sign, with the love-fear
// meeting on the dock, which it needs) is run beside it on the same spaces and REPORTED, not gated.
// START FAMILY: this rule reads no color link, so the 17-start family enters nowhere here; E-SPN-0077 runs it
// where the field enters. HUSK: one husk line; every number is a husk number, the store is the bulk column.
//
// Depth L2: a constructed stand-in (locked tokens on one line, the store held at one port); the claim is that the
// paid string's store is the flux's own count held as a column, not a number put in.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  decodeRegisters,
  encodeRegisters,
  gaussHolds,
  placedRegisters,
  registerSize,
  storeColumn,
  streamIndexBack,
  streamRegisters,
  stringCount,
  type FluxStoreSpec,
} from '@/code/rule/flux-store-line'
import {
  antisymmetrized,
  type LockedStart,
} from '@/code/measure/locked-run'
import { exactCheck } from '@/code/measure/flux-store-exact'
import { type Vibe } from '@/code/rule/locked-token-line'

type Case = { name: string; spec: FluxStoreSpec }

const specOf = (
  ring: number,
  kinds: Vibe[],
  convention: 'C' | 'Cprime',
  depth: number,
): FluxStoreSpec => ({
  ring,
  kinds,
  convention,
  unlike: convention === 'C' ? 'knit' : 'dock',
  depth,
  cost: 0,
  root: 3,
})

// P1, P2 on the whole register space
function wholeSpace(s: FluxStoreSpec): {
  size: number
  permutation: boolean
  inverse: boolean
  gaussStates: number
  gaussBroken: number
  storeBroken: number
} {
  const size = registerSize(s)
  const hits = new Uint8Array(size)

  let inverse = true
  let gaussStates = 0
  let gaussBroken = 0
  let storeBroken = 0

  for (let i = 0; i < size; i++) {
    const r = decodeRegisters(s, i)
    const out = streamRegisters(s, r)
    const j = encodeRegisters(s, out)

    hits[j] = hits[j]! + 1

    if (streamIndexBack(s, j) !== i) {
      inverse = false
    }

    if (out.sigma + stringCount(out.f) !== r.sigma + stringCount(r.f)) {
      storeBroken++
    }

    if (gaussHolds(s, r)) {
      gaussStates++

      if (!gaussHolds(s, out)) {
        gaussBroken++
      }
    }
  }

  return {
    size,
    permutation: hits.every(h => h === 1),
    inverse,
    gaussStates,
    gaussBroken,
    storeBroken,
  }
}

// P3: the configurations reachable from contact, under every label choice
function reach(s: FluxStoreSpec): {
  configurations: number
  maxString: number
  storeBroken: number
  gaussBroken: number
} {
  const n = s.kinds.length
  const labelChoices = s.convention === 'C' ? 2 ** n : 3 ** n
  const x0 = Math.floor(s.ring / 2)
  const start = placedRegisters(
    s,
    new Array<number>(n).fill(x0),
    new Array<number>(n).fill(0),
  )
  const key = (r: {
    x: number[]
    f: number[]
    sigma: number
  }): number =>
    encodeRegisters(s, { ...r, j: new Array<number>(n).fill(0) })
  const seen = new Set<number>([key(start)])
  const queue = [key(start)]

  let maxString = 0
  let storeBroken = 0
  let gaussBroken = 0

  while (queue.length > 0) {
    const r = decodeRegisters(s, queue.pop()!)
    const l = stringCount(r.f)

    maxString = Math.max(maxString, l)

    if (r.sigma !== s.depth - l) {
      storeBroken++
    }

    if (!gaussHolds(s, r)) {
      gaussBroken++
    }

    for (let c = 0; c < labelChoices; c++) {
      const j = Array.from({ length: n }, (_, t) =>
        s.convention === 'C'
          ? (c >> t) & 1
          : Math.floor(c / 3 ** t) % 3,
      )
      const out = streamRegisters(s, { ...r, j })
      const k = key(out)

      if (!seen.has(k)) {
        seen.add(k)
        queue.push(k)
      }
    }
  }

  return {
    configurations: seen.size,
    maxString,
    storeBroken,
    gaussBroken,
  }
}

export default experiment({
  id: 'spin/string-store-on-flux',
  code: 'E-SPN-0075',
  title:
    "the string's store put on the flux, a STAND-IN on locked tokens: every link's center flux a recorded trit and the store one column of D bulk trits holding D minus the string's length (the drift's own exponent); the rule is a permutation of the whole register space, keeps Gauss mod 3 on every state, runs exactly in Eisenstein integers, and the string reaches exactly 2D, so the depth sets the string's range",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- G1, G2 ----
    const gated: Case[] = [
      {
        name: 'pair C ring 6 D 1',
        spec: specOf(6, ['love', 'fear'], 'C', 1),
      },
      {
        name: 'pair C ring 7 D 2',
        spec: specOf(7, ['love', 'fear'], 'C', 2),
      },
      {
        name: 'three loves ring 5 D 1',
        spec: specOf(5, ['love', 'love', 'love'], 'C', 1),
      },
    ]
    const reported: Case[] = [
      {
        name: "pair C' ring 6 D 1",
        spec: specOf(6, ['love', 'fear'], 'Cprime', 1),
      },
    ]
    const whole = gated.map(c => ({
      name: c.name,
      ...wholeSpace(c.spec),
    }))
    const wholeVariant = reported.map(c => ({
      name: c.name,
      ...wholeSpace(c.spec),
    }))
    const g1 = whole.every(w => w.permutation && w.inverse)
    const g2 = whole.every(
      w =>
        w.gaussBroken === 0 && w.storeBroken === 0 && w.gaussStates > 0,
    )

    log('g1 g2')

    // ---- G3 ----
    const reaches = [
      ...[1, 2, 3, 4].map(D => ({
        name: `pair C D ${D}`,
        D,
        ...reach(specOf(4 * D + 3, ['love', 'fear'], 'C', D)),
      })),
      ...[1, 2, 3].map(D => ({
        name: `three loves D ${D}`,
        D,
        ...reach(specOf(4 * D + 3, ['love', 'love', 'love'], 'C', D)),
      })),
    ]
    const reachesVariant = [1, 2, 3].map(D => ({
      name: `pair C' D ${D}`,
      D,
      ...reach(specOf(4 * D + 3, ['love', 'fear'], 'Cprime', D)),
    }))
    const columns = [1, 2, 4, 8, 16].every(D => {
      for (let sigma = -D; sigma <= D; sigma++) {
        const col = storeColumn(sigma, D)

        if (
          col.length !== D ||
          col.reduce((a, b) => a + b, 0) !== sigma
        ) {
          return false
        }
      }

      return true
    })
    const g3 =
      reaches.every(
        r =>
          r.maxString === 2 * r.D &&
          r.storeBroken === 0 &&
          r.gaussBroken === 0,
      ) && columns

    log('g3')

    // ---- G4 ----
    const pairStart: LockedStart[] = [
      { x: [6, 6], j: [0, 1], amp: [1, 0] },
    ]
    const threeStart = antisymmetrized({ x: [3, 3, 4], j: [0, 1, 0] })
    const exactPair = exactCheck(
      specOf(12, ['love', 'fear'], 'C', 2),
      pairStart,
      12,
    )
    const exactThree = exactCheck(
      specOf(7, ['love', 'love', 'love'], 'C', 1),
      threeStart,
      6,
    )
    const exactVariant = exactCheck(
      specOf(12, ['love', 'fear'], 'Cprime', 2),
      pairStart,
      8,
    )
    // the first run's ring: the smallest-arc wall of the float runner parts from the flux string there
    const exactShortRing = exactCheck(
      specOf(10, ['love', 'fear'], 'C', 2),
      [{ x: [5, 5], j: [0, 1], amp: [1, 0] }],
      12,
    )
    const exactOk = (e: typeof exactPair): boolean =>
      e.gap < 1e-12 &&
      e.norm &&
      e.reverses &&
      e.registersOk &&
      e.merged === 0
    const g4 = exactOk(exactPair) && exactOk(exactThree)

    log('g4')

    const ok = g1 && g2 && g3 && g4
    const wholeText = (w: (typeof whole)[number]): string =>
      `${w.name}: ${w.size.toLocaleString('en-US')} states, permutation ${w.permutation}, inverse ${w.inverse}, ${w.gaussStates.toLocaleString('en-US')} Gauss states with ${w.gaussBroken} broken, store broken ${w.storeBroken}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with every link's center flux a recorded trit and the string's store one column of D trits holding D - l (l the count of links carrying flux, the drift's own exponent), the stream with the store's bounce is a permutation of the whole register space and flip . stream . flip its inverse (${whole.map(w => `${w.name} ${w.size.toLocaleString('en-US')}`).join(', ')} states), Gauss mod 3 is kept on all ${whole.reduce((a, w) => a + w.gaussStates, 0).toLocaleString('en-US')} Gauss states and sigma + l on every state; from contact the string reaches exactly 2D and never more (${reaches.map(r => `${r.name}: max ${r.maxString} over ${r.configurations} configurations`).join('; ')}), with sigma = D - l and Gauss on every reached configuration; the rule runs exactly in Eisenstein integers and equals the float runner of E-SPN-0074 with a wall of 2D (pair ${exactPair.gap.toExponential(1)}, three loves ${exactThree.gap.toExponential(1)}), norm identity ${exactPair.norm && exactThree.norm}, exact reversal ${exactPair.reverses && exactThree.reverses}; so the depth sets the string's range at 2D. C' (reported): permutation ${wholeVariant[0]!.permutation}, Gauss broken ${wholeVariant[0]!.gaussBroken}, max string ${reachesVariant.map(r => r.maxString).join(', ')} for D = 1 to 3, exact gap ${exactVariant.gap.toExponential(1)}`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        ...Object.fromEntries(
          whole.flatMap((w, i) => [
            [`whole${i}_states`, w.size],
            [`whole${i}_permutation`, w.permutation ? 1 : 0],
            [`whole${i}_inverse`, w.inverse ? 1 : 0],
            [`whole${i}_gaussStates`, w.gaussStates],
            [`whole${i}_gaussBroken`, w.gaussBroken],
            [`whole${i}_storeBroken`, w.storeBroken],
          ]),
        ),
        ...Object.fromEntries(
          reaches.flatMap(r => [
            [
              `reach_${r.name.replace(/ /g, '_')}_maxString`,
              r.maxString,
            ],
            [
              `reach_${r.name.replace(/ /g, '_')}_configurations`,
              r.configurations,
            ],
          ]),
        ),
        storeColumnsSum: columns ? 1 : 0,
        exactPairGap: exactPair.gap,
        exactPairNorm: exactPair.norm ? 1 : 0,
        exactPairReverses: exactPair.reverses ? 1 : 0,
        exactPairRegisters: exactPair.registersOk ? 1 : 0,
        exactPairDenominatorBits: exactPair.bits,
        exactThreeGap: exactThree.gap,
        exactThreeNorm: exactThree.norm ? 1 : 0,
        exactThreeReverses: exactThree.reverses ? 1 : 0,
        exactThreeRegisters: exactThree.registersOk ? 1 : 0,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        variantPermutation: wholeVariant[0]!.permutation ? 1 : 0,
        variantInverse: wholeVariant[0]!.inverse ? 1 : 0,
        variantGaussBroken: wholeVariant[0]!.gaussBroken,
        variantStoreBroken: wholeVariant[0]!.storeBroken,
        ...Object.fromEntries(
          reachesVariant.map(r => [
            `variantReach_D${r.D}_maxString`,
            r.maxString,
          ]),
        ),
        variantExactGap: exactVariant.gap,
        variantExactNorm: exactVariant.norm ? 1 : 0,
        variantExactReverses: exactVariant.reverses ? 1 : 0,
        variantExactRegisters: exactVariant.registersOk ? 1 : 0,
        shortRingArcWallGap: exactShortRing.gap,
        shortRingExactReverses: exactShortRing.reverses ? 1 : 0,
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line, the store held at one end port). Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}. Whole spaces: ${whole.map(wholeText).join('; ')}. Variant C' (reported, not gated; C is the user's choice of 2026-09-26): ${wholeVariant.map(wholeText).join('; ')}; reach ${reachesVariant.map(r => `D ${r.D} max ${r.maxString} (${r.configurations} configurations, store broken ${r.storeBroken}, Gauss broken ${r.gaussBroken})`).join(', ')}; exact run gap ${exactVariant.gap.toExponential(1)}, norm ${exactVariant.norm}, reversal ${exactVariant.reverses}, registers ${exactVariant.registersOk}. Exact runs merged ${exactPair.merged} and ${exactThree.merged} register states onto one float configuration (0 means the flux and store are functions of the positions on every reached state). FIRST RUN (recorded, 3 s): fail on G4 alone, the pair on ring 10 0.34 from the float runner; the float runner's wall reads the smallest arc and lets the pair step to a separation of 6 on a ring of 10 (an arc of 4 the other way), the flux does not; second run with the pair on ring 12, rule and gates unchanged; the ring 10 comparison is kept as a control: gap ${exactShortRing.gap.toExponential(1)} (exact reversal there ${exactShortRing.reverses}). MEANING: the store of E-SPN-0074 is no longer put in. It is the flux's own count, l = sum bal(f)^2, the same integer the light's drift term reads, held as one column of D bulk trits, and the rule that pays it is a permutation of every register with Gauss exact. The column's 2D + 1 values are the capacity, so the string is at most 2D long, and exactly 2D is reached: the depth sets the string's range. 2D and not D because the store counts squares, which do not see the flux's sign. What this does not do: say which bound level is lightest (E-SPN-0076 adds the drift's cost), or whether the lightest charge-one level is the natural spin one half (E-SPN-0077).`,
    })
  },
})
