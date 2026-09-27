// Does anything in the knit bind four loves and a fear? The paid string on the E-FRC-0129 line, exactly and in
// its dynamics.
//
// E-SPN-0060 found the (4, 1) cluster holds the natural spin one half twice, orthogonal to every split into a
// neutral triple and a meson. Whether the five hold together is a question about energy. The only energy in the
// model that depends on where vibes are relative to each other is the string: the triality flux (love minus fear
// crossed, mod 3) that a set which is not a knot trails, paid by length (code/rule/string-line, E-FRC-0129: H = mass x
// vibes + tension x links with flux not 0 mod 3 + demons). The paid weave's energy on D4 (tones plus counters,
// code/rule/paid-weave) has no position dependence at all.
//
// THE ARGUMENT. A knot's flux closes: between two knots the flux is 0 mod 3 whatever their distance. So the string
// costs nothing to separate two knots, and binds only a set that is not a knot. Every knot other than the minimal
// three, (1, 1), (3, 0) and (0, 3), is two knots side by side ((4, 1) = (3, 0) + (1, 1), (2, 2) = 2 x (1, 1), (6, 0) =
// 2 x (3, 0)), so on the line a block of N charges splitting into k minimal knots costs N - k tension links at best,
// exactly the sum of its parts.
//
// PREDICTIONS, written before any run.
// P1 On the line (mass 4, tension 1), the least energy of every knot (n, m) with n + m <= 7 is 4 (n + m) + (n + m) - k,
//    k = min(n, m) + |n - m| / 3 its number of minimal knots, and the binding energy against its best split into two
//    knots is exactly 0 for every knot but the minimal three.
// P2 The minimal knots are confined: splitting one into two non-knot parts d calm cells apart costs exactly d more
//    tension than d = 0 (slope 1 = the tension, for d = 0 to 8). The (4, 1) split into (3, 0) and (1, 1) costs the same at
//    every d (slope 0).
// P3 In the dynamics (E-FRC-0129's ring of 256, mass 4, demons of 1 unit, capacity 4, 6,000 beats), four loves and a
//    fear side by side, + + + + -, with their charge conjugate - - - - + half the ring away so the ring's total is 0,
//    keep all ten charges and their order (creation and annihilation cost 8, above the capacity), and behave as two
//    knots: the meson (the fourth love and the fear) stays a few cells wide and the
//    triple holds together, while the distance between the triple and the meson wanders over more than 10 cells,
//    as E-FRC-0129's baryon and antibaryon do.
//
// Gates, fixed before the first run:
// G1 P1 by exhaustive placement in a window of n + m + 3 cells, every energy an integer, the closed form met and the
//    binding 0 for all 8 composite knots with n + m <= 7 (written 7 before the first run, a miscount, see the notes)
// G2 P2: slope exactly 1 for (1, 1), (3, 0) and (0, 3) at every d from 0 to 8, and exactly 0 for (4, 1) -> (3, 0) + (1, 1)
// G3 P3 with tension 1: energy and Gauss's law exact on every beat, 6,000 beats back restore the start, 5 charges in
//    their order on every beat (all ten); the meson's mean gap under 8 cells; the triple's mean spread under half the
//    tension-0 control's; the triple-to-meson distance ranging over more than 10 cells
// G4 control, tension 0: the meson's mean gap more than 4 times the tension-1 value (the string does bind the meson)
//
// Depth L2: the constructed string of E-FRC-0129 on a line, the mechanism before D4; the exact part is L1.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gaussHolds, stringBeat, stringBeatBack, stringEnergy, stringState, type StringLine, type StringState } from '@/code/rule/string-line'

const MASS = 4
const TENSION = 1
const WINDOW_CELLS = 40
const RING = 256
const BEATS = 6000
const START = 120

type Knot = { n: number; m: number }

const isKnot = (k: Knot): boolean => (k.n - k.m) % 3 === 0 && k.n + k.m > 0
const minimalKnots = (k: Knot): number => Math.min(k.n, k.m) + Math.abs(k.n - k.m) / 3

// the energy of a list of charges placed at cells on a quiet line (no demons)
function lineEnergy(line: StringLine, placed: readonly [number, number][]): number {
  const vibe = new Int8Array(line.cells)

  for (const [cell, v] of placed) {
    vibe[cell] = v
  }

  return stringEnergy(line, stringState({ line, vibe, demon: new Int32Array(line.cells) }))
}

// the least energy of n loves and m fears placed anywhere in a window of n + m + 3 cells
function leastEnergy(line: StringLine, k: Knot): number {
  const total = k.n + k.m
  const width = total + 3
  let best = Infinity

  for (let mask = 0; mask < 1 << width; mask++) {
    const cells: number[] = []

    for (let b = 0; b < width; b++) {
      if ((mask >> b) & 1) {
        cells.push(5 + b)
      }
    }

    if (cells.length !== total) {
      continue
    }

    for (let fears = 0; fears < 1 << total; fears++) {
      let count = 0

      for (let b = 0; b < total; b++) {
        count += (fears >> b) & 1
      }

      if (count !== k.m) {
        continue
      }

      best = Math.min(best, lineEnergy(line, cells.map((c, i) => [c, (fears >> i) & 1 ? -1 : 1] as [number, number])))
    }
  }

  return best
}

// the ring distance and a position unwrapped about a reference
const unwrap = (x: number, reference: number): number => {
  let d = (x - reference) % RING

  if (d > RING / 2) {
    d -= RING
  }

  if (d <= -RING / 2) {
    d += RING
  }

  return reference + d
}

type Run = {
  exact: boolean
  reverses: boolean
  chargesKept: boolean
  orderKept: boolean
  mesonGap: number
  tripleSpread: number
  knotGapLow: number
  knotGapHigh: number
}

function run(tension: number): Run {
  const line: StringLine = { cells: RING, mass: MASS, tension, capacity: 4 }
  const vibe = new Int8Array(RING)
  // the cluster and, half the ring away, its charge conjugate, so the ring's total is 0 and Gauss's law closes
  const cluster = [1, 1, 1, 1, -1]
  const placed: [number, number][] = [...cluster.map((v, i) => [START + i, v] as [number, number]), ...cluster.map((v, i) => [START + RING / 2 + i, -v] as [number, number])]
  const signs = placed.map(([, v]) => v)

  for (const [cell, v] of placed) {
    vibe[cell] = v
  }

  const start = stringState({ line, vibe, demon: Int32Array.from({ length: RING }, () => 1) })
  const e0 = stringEnergy(line, start)
  let s: StringState = start
  let exact = gaussHolds(line, start)
  let chargesKept = true
  let orderKept = true
  // every charge's position, unwrapped continuously; the charges keep their cyclic order (no two pass), so each
  // beat's occupied cells are matched to them by the rotation of the cyclic list that moves them least
  const positions = placed.map(([cell]) => cell)
  let mesonSum = 0
  let spreadSum = 0
  let knotGapLow = Infinity
  let knotGapHigh = -Infinity

  for (let t = 0; t < BEATS; t++) {
    s = stringBeat(line, s, t)
    exact = exact && gaussHolds(line, s) && stringEnergy(line, s) === e0

    const found = [...s.vibe].flatMap((v, cell) => (v !== 0 ? [{ cell, v }] : []))

    chargesKept = chargesKept && found.length === positions.length

    if (found.length === positions.length) {
      let bestShift = 0
      let bestCost = Infinity

      for (let shift = 0; shift < found.length; shift++) {
        let cost = 0

        positions.forEach((p, k) => {
          const c = found[(k + shift) % found.length]?.cell ?? 0

          cost += Math.abs(unwrap(c, p) - p)
        })

        if (cost < bestCost) {
          bestCost = cost
          bestShift = shift
        }
      }

      positions.forEach((p, k) => {
        const c = found[(k + bestShift) % found.length] ?? { cell: 0, v: 0 }

        orderKept = orderKept && c.v === signs[k]
        positions[k] = unwrap(c.cell, p)
      })
    }

    const [p0, p1, p2, p3, p4] = positions as [number, number, number, number, number]

    mesonSum += p4 - p3
    spreadSum += p2 - p0

    const gap = (p3 + p4) / 2 - (p0 + p1 + p2) / 3

    knotGapLow = Math.min(knotGapLow, gap)
    knotGapHigh = Math.max(knotGapHigh, gap)
  }

  let back = s

  for (let t = BEATS - 1; t >= 0; t--) {
    back = stringBeatBack(line, back, t)
  }

  const reverses = back.vibe.every((v, i) => v === start.vibe[i]) && back.flux.every((v, i) => v === start.flux[i]) && back.demon.every((v, i) => v === start.demon[i])

  return { exact, reverses, chargesKept, orderKept, mesonGap: mesonSum / BEATS, tripleSpread: spreadSum / BEATS, knotGapLow, knotGapHigh }
}

export default experiment({
  id: 'spin/four-one-binding',
  code: 'E-SPN-0061',
  title:
    'nothing in the knit binds four loves and a fear: the paid string charges a set only for being no knot, so on the E-FRC-0129 line every knot but the minimal three costs exactly the sum of its parts (binding 0), the minimal knots are confined at slope 1, and in the dynamics the (4, 1) block lives as a bound triple and a bound meson whose distance wanders freely',
  category: 'spin',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const line: StringLine = { cells: WINDOW_CELLS, mass: MASS, tension: TENSION, capacity: 0 }

    // G1
    const knots: Knot[] = []

    for (let n = 0; n <= 7; n++) {
      for (let m = 0; m <= 7 - n; m++) {
        if (isKnot({ n, m })) {
          knots.push({ n, m })
        }
      }
    }

    const least = new Map(knots.map(k => [`${k.n},${k.m}`, leastEnergy(line, k)]))
    const energyOf = (k: Knot): number => least.get(`${k.n},${k.m}`) ?? NaN
    const rows = knots.map(k => {
      const e = energyOf(k)
      const formula = MASS * (k.n + k.m) + TENSION * (k.n + k.m - minimalKnots(k))
      let bestSplit = Infinity

      for (let n1 = 0; n1 <= k.n; n1++) {
        for (let m1 = 0; m1 <= k.m; m1++) {
          const a = { n: n1, m: m1 }
          const b = { n: k.n - n1, m: k.m - m1 }

          if (isKnot(a) && isKnot(b)) {
            bestSplit = Math.min(bestSplit, energyOf(a) + energyOf(b))
          }
        }
      }

      return { ...k, e, formula, binding: Number.isFinite(bestSplit) ? e - bestSplit : NaN, composite: Number.isFinite(bestSplit) }
    })
    const composite = rows.filter(r => r.composite)
    const minimal = rows.filter(r => !r.composite)
    const g1 =
      rows.every(r => Number.isInteger(r.e) && r.e === r.formula) &&
      composite.length === 8 &&
      composite.every(r => r.binding === 0) &&
      minimal.map(r => `${r.n},${r.m}`).sort().join(' ') === '0,3 1,1 3,0'

    // G2: split energies against the gap d, charges placed from cell 5
    const splitEnergy = (left: readonly number[], right: readonly number[], d: number): number =>
      lineEnergy(line, [...left.map((v, i) => [5 + i, v] as [number, number]), ...right.map((v, i) => [5 + left.length + d + i, v] as [number, number])])
    const slopes = (left: readonly number[], right: readonly number[]): number[] =>
      Array.from({ length: 8 }, (_, d) => splitEnergy(left, right, d + 1) - splitEnergy(left, right, d))
    // a minimal knot's cheapest split at each d: over every cut of every ordering of its charges
    const minimalSlopes = (k: Knot): number[] => {
      const orderings = new Set<string>()
      const charges = [...new Array<number>(k.n).fill(1), ...new Array<number>(k.m).fill(-1)]
      const permute = (rest: number[], prefix: number[]): void => {
        if (rest.length === 0) {
          orderings.add(prefix.join(','))
        }

        rest.forEach((c, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...prefix, c]))
      }

      permute(charges, [])

      const cheapest = (d: number): number => {
        let best = Infinity

        for (const o of orderings) {
          const list = o.split(',').map(Number)

          for (let cut = 1; cut < list.length; cut++) {
            best = Math.min(best, splitEnergy(list.slice(0, cut), list.slice(cut), d))
          }
        }

        return best
      }

      return Array.from({ length: 8 }, (_, d) => cheapest(d + 1) - cheapest(d))
    }
    const confinedSlopes = [{ n: 1, m: 1 }, { n: 3, m: 0 }, { n: 0, m: 3 }].map(k => ({ k, slopes: minimalSlopes(k) }))
    const fallApartSlopes = slopes([1, 1, 1], [1, -1])
    const g2 = confinedSlopes.every(c => c.slopes.every(s => s === TENSION)) && fallApartSlopes.every(s => s === 0)

    // G3, G4: the dynamics
    const bound = run(TENSION)
    const free = run(0)
    const g3 =
      bound.exact &&
      bound.reverses &&
      bound.chargesKept &&
      bound.orderKept &&
      bound.mesonGap < 8 &&
      bound.tripleSpread < free.tripleSpread / 2 &&
      bound.knotGapHigh - bound.knotGapLow > 10
    const g4 = free.mesonGap > 4 * bound.mesonGap

    const ok = g1 && g2 && g3 && g4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `least energies on the line (mass 4, tension 1): ${rows.map(r => `(${r.n}, ${r.m}) ${r.e}${r.composite ? ` binding ${r.binding}` : ' minimal'}`).join(', ')}, every one on the closed form 5 (n + m) - k; splitting a minimal knot costs ${confinedSlopes.map(c => `(${c.k.n}, ${c.k.m}) ${c.slopes.join('/')}`).join(', ')} per extra cell, and separating (3, 0) from (1, 1) costs ${fallApartSlopes.join('/')}; in the dynamics the ten charges (the cluster and its conjugate) stay ten and in order (${bound.chargesKept && bound.orderKept}), energy and Gauss exact and the run reversing (${bound.exact && bound.reverses}), the meson's mean gap is ${bound.mesonGap.toFixed(2)} cells (${free.mesonGap.toFixed(2)} without tension), the triple's mean spread ${bound.tripleSpread.toFixed(2)} (${free.tripleSpread.toFixed(2)}), and the triple-to-meson distance ranges over ${(bound.knotGapHigh - bound.knotGapLow).toFixed(2)} cells`,
      metrics: {
        ...Object.fromEntries(rows.flatMap(r => [[`least_${r.n}_${r.m}`, r.e], ...(r.composite ? [[`binding_${r.n}_${r.m}`, r.binding]] : [])])),
        compositeKnots: composite.length,
        ...Object.fromEntries(confinedSlopes.map(c => [`confinedSlope_${c.k.n}_${c.k.m}`, Math.min(...c.slopes)])),
        fallApartSlopeMax: Math.max(...fallApartSlopes.map(Math.abs)),
        mesonMeanGap: bound.mesonGap,
        tripleMeanSpread: bound.tripleSpread,
        knotGapRange: bound.knotGapHigh - bound.knotGapLow,
        knotGapLow: bound.knotGapLow,
        knotGapHigh: bound.knotGapHigh,
      },
      control: {
        freeMesonMeanGap: free.mesonGap,
        freeTripleMeanSpread: free.tripleSpread,
        freeKnotGapRange: free.knotGapHigh - free.knotGapLow,
      },
      notes:
        'L2 (L1 for the exact energies). FIRST RUN, DISCLOSED, and this is the second: the first run failed three clauses, all harness errors, and the fixes are stated here. (1) G1 required 7 composite knots with n + m <= 7; there are 8 ((2, 2), (3, 3), (1, 4), (4, 1), (2, 5), (5, 2), (0, 6), (6, 0)), and all 8 read binding 0 on the first run, so the count in the gate was corrected to 8. (2) The first run put + + + + - alone on the ring, whose total charge 3 leaves Gauss\'s law unsatisfiable at the seam (the flux must rise by 3 around a closed ring), so the Gauss clause failed from beat 0; tmp/probe-string-net.ts confirmed the rule itself reversed exactly and kept five charges. The charge-conjugate cluster was added half the ring away, as E-FRC-0129 pairs its baryon with an antibaryon. (3) The first run tracked the charges by sorting positions unwrapped about their mean, which scrambled their identities once the meson had wandered 128 cells (the first run read a triple-to-meson range of 208 cells, a triple spread of 46 and a meson gap of 2.31, with the order flag false for that reason); the charges are now matched by the cyclic rotation that moves them least. The exact energies and slopes are unchanged by (2) and (3). The paid string binds a set only into its minimal knots, (1, 1), (3, 0) and (0, 3): it is confinement, not binding between knots. Four loves and a fear are a triple and a meson side by side, and neither the exact energies (binding exactly 0 against the split, at every separation) nor the dynamics (the two pieces wander apart while each holds) show any attraction between them. So the (4, 1) cluster that holds the natural spin one half (E-SPN-0060) is at best a threshold state of the string, degenerate with its own parts. The same holds on D4 for any energy built from vibe count plus a function of the link flux mod 3 that vanishes at 0, since a knot closes its flux there too; and the paid weave\'s own energy (tones plus counters) does not depend on position at all. Under the committed knit no knot of three even travels as one object (E-FRC-0171, E-SPN-0052). What would bind it has to be something the model does not have yet: an interaction between knots, which in QCD is the residual (Yukawa, E-FRC-0195) force, and which here would have to make the five-body spin one half lower than a triple plus a meson. The fall-apart channel is closed only at zero relative motion (E-SPN-0060), so even a small binding would leave the state unstable to an orbital split unless the binding beats the orbital cost.',
    })
  },
})
