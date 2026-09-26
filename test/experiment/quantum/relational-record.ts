// A relational record: the one covariant three-body Clifford meeting that is not a permutation measures a
// role along the axis two apparatus tokens share, on every state the knit reaches.
//
// E-QTM-0134 classified the frame-covariant Clifford meetings of three tokens. On a love-love-fear triple
// there is one that is not a permutation, the reflection through the frame direction, on stored points
//
//   system x1' = x1 - x2 + x3,   record x2' = -x1 + x2 + x3,   reference x3' = -x1 - x2,
//
// with the system and the record loves and the reference a fear. It commutes with every one of the 648 frame
// changes because it treats the role and the tilt alike: it has no axis. The axis is in the STATE: when the
// record and the reference are opened on one stored line l (direction d, points r + s d), the system is moved
// by x3 - x2 = (s3 - s2) d, a shift ALONG d, so its d-label [d, x1] is unchanged and its position along d is
// averaged away, and the record's d-label becomes 2 [d, r] - [d, x1], a copy. The reference's becomes
// -[d, x1] - [d, r], a second copy. This is the Bartlett-Rudolph-Spekkens picture: the rule is covariant, the
// apparatus carries the frame, and the apparatus is used up (the reference becomes a record).
//
// The apparatus preparation is a STAND-IN: the knit does not open tokens on lines. The covariant way to
// supply the line is from the classical points of the pair: a love at p and a fear stored at q != p lie on
// exactly one line, l(p, q), and a frame change carries l(p, q) to l(g p, g q). So the axis a record reads is
// the direction q - p of the love-fear pair's two role points.
//
// The system is token A of each of the six Bell histories (code/measure/knot-histories) at every one of 480
// beats (2,880 states), in the love frame (sum-record's physicalFrame), with its partner B kept.
//
// Predictions, written before the first run:
//   - on every reached state and every one of the 12 stored lines l: the record and the reference copy the
//     system's l-class label by the fixed bijections above, the label distribution and B are unchanged, and
//     the system is flat along l's direction
//   - a second apparatus on a line of the same class agrees with the first, rec2 = rec1 + 2 ([d, l2] - [d, l])
//     exactly, and one on a line of another class is independent of it
//   - exhaustively, over the covariant Cliffords of all 8 three-token sign patterns (E-QTM-0134), every system
//     slot, all 144 line preparations of the two other tokens and all 4 classes, the meetings that measure
//     (on all 12 system line states: label kept, flat along the class, a record label a bijection of it) are
//     exactly R, with the system one of the like pair and both apparatus tokens on one stored line of the
//     class: 24 per mixed pattern, 144 in all, and 0 on the two knots; the apparatus (the two tokens other
//     than the system) is a love-fear pair, a knot, in every one, and the triple is never a knot
//   - the apparatus in any of the 9 Bell states of the love-fear pair (the pair made from calm is one) learns
//     nothing: the apparatus pair after is independent of the system's point before
//   - the apparatus on two DIFFERENT lines of one class still copies, but kicks the system's label by a known
//     amount, so the label distribution changes on reached states
//
// Gates, fixed before the first run:
//   G1 the meeting: R's table on the 729 stored joint points is a bijection and an involution, keeps the
//      stored form at every pair, keeps the color content Q at every point, and commutes with all 216
//      diagonal grid moves; the preparation l(p, q) is covariant for all 72 ordered pairs p != q and all 216
//      moves.
//   G2 the measurement on every reached state, all 12 lines: copyBad, referenceCopyBad, unchangedBad (A's
//      l-class label distribution and B's whole marginal), flatBad all 0.
//   G3 records agree: every same-class second apparatus on the predicted graph (0 off it) and every
//      other-class second apparatus independent, on every state and every pair of lines.
//   G4 which meetings measure: exactly 144 passes, all R, all with one-line apparatus, 24 per mixed pattern,
//      0 on LLL and FFF.
//   G5 the knot reading: in every pass the apparatus has charge 0 and the triple has charge not 0.
// Controls, which must give NO:
//   C1 the Bell-state apparatus learns nothing on every state and all 9 Bell states.
//   C2 the two-line apparatus kicks: the label distribution changes on at least one state (with the copy
//      intact on all).
// Readings: the four-token search (every covariant map of LLLL, LLLF, LLFF, every slot, all three apparatus
// tokens on lines of the class read, 27 per class), the number that measure, and how many of those are on
// the knot LLFF.
//
// FIRST RUN (2026-09-26, 32 s): every gate and control as fixed. 2,880 states (1,208 with a fear on A, 1,953
// with a non-uniform label on the role class), 34,560 measurements: copy, reference copy, unchanged,
// partner and flatness all 0 bad. 103,680 same-class second records all on the predicted graph, 311,040
// other-class ones all independent. Exhaustive: 144 passes, all R, all one-line apparatus, 24 on each mixed
// pattern, 0 on LLL and FFF, every apparatus a knot, no triple a knot. 25,920 Bell-state cases, 0 learned.
// Two-line apparatus: the copy holds on all 69,120 cases and the label is kicked on 43,860. Four-token
// reading (apparatus on lines of the class read only, so a lower bound): LLLL 864 passes by 15 maps, every
// one with the knot LLL as apparatus; LLLF 1,944 by 27 maps, 216 of them with a knot apparatus; LLFF, a knot,
// 2,304 by 24 maps, none with a knot apparatus. So "the apparatus is a knot and the triple is not" is a
// three-token law, and "a measurement is a knot forming" is refused: with four tokens a knot measures too.
//
// Depth L2: a covariant meeting placed on the knit's states and its measurement read exactly; the apparatus
// preparation is a stand-in. The husk is not read: every number is a role-grid number.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import type { Whole } from '@/code/rule/fear-weave'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { advanceKnot, bellHistories, lineKnot } from '@/code/measure/knot-histories'
import { LINE_CLASSES, physicalFrame } from '@/code/measure/sum-record'
import {
  addPoints,
  applyStoredLinear,
  chargeOf,
  covariantCliffords,
  frameReflection,
  mod3,
  pointForm,
  scalePoint,
} from '@/code/measure/frame-covariant-meeting'

const BEATS = 480
const SIGNS = [1, 1, -1]

const directionPoint = (c: number): number => 3 * (LINE_CLASSES[c]?.direction[0] ?? 0) + (LINE_CLASSES[c]?.direction[1] ?? 0)
// LABEL[9 c + x] = [d_c, x]
const LABEL = Int8Array.from({ length: 36 }, (_, k) => pointForm(directionPoint(Math.floor(k / 9)), k % 9))
// the 12 lines as (class, points)
const LINES = LINE_CLASSES.flatMap((c, ci) => c.lines.map(points => ({ c: ci, points: [...points] })))
const lineLabel = (l: { c: number; points: number[] }): number => LABEL[9 * l.c + (l.points[0] ?? 0)] ?? 0

// the joint table of a 3 x 3 matrix on stored points, index 81 x1 + 9 x2 + x3
function tripleTable(a: readonly number[]): Int16Array {
  const out = [0, 0, 0]
  const table = new Int16Array(729)

  for (let j = 0; j < 729; j++) {
    applyStoredLinear(a, [Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9], out)
    table[j] = 81 * (out[0] ?? 0) + 9 * (out[1] ?? 0) + (out[2] ?? 0)
  }

  return table
}

// Does map `a` (n tokens) with the system at slot s and apparatus token k on line lines[k] measure class c?
// Tested on all 12 system line states: the system's c-label distribution kept, the system flat along c, and
// some apparatus token whose c-label is one bijection of the system's across all 12 states.
function measures(a: readonly number[], n: number, s: number, lines: readonly (readonly number[])[], c: number): boolean {
  const others = Array.from({ length: n }, (_, i) => i).filter(i => i !== s)
  // for each other token, the map system label -> record label seen, -1 unseen, -2 conflicting
  const seen = others.map(() => [-1, -1, -1])
  const combos = others.reduce((m, k) => m * (lines[k]?.length ?? 1), 1)
  const points = new Array<number>(n).fill(0)
  const image = new Array<number>(n).fill(0)

  for (const state of LINES) {
    const before = [0, 0, 0]
    const after = new Array<number>(9).fill(0)

    for (const x of state.points) {
      before[LABEL[9 * c + x] ?? 0] = (before[LABEL[9 * c + x] ?? 0] ?? 0) + combos

      for (let m = 0; m < combos; m++) {
        let rest = m

        points[s] = x
        for (const k of others) {
          const line = lines[k] ?? []

          points[k] = line[rest % line.length] ?? 0
          rest = Math.floor(rest / line.length)
        }

        applyStoredLinear(a, points, image)
        const xs = image[s] ?? 0
        const ks = LABEL[9 * c + xs] ?? 0

        after[xs] = (after[xs] ?? 0) + 1
        others.forEach((k, i) => {
          const kr = LABEL[9 * c + (image[k] ?? 0)] ?? 0
          const map = seen[i]!

          map[ks] = map[ks] === -1 || map[ks] === kr ? kr : -2
        })
      }
    }

    const labelsAfter = [0, 0, 0]

    after.forEach((w, x) => {
      labelsAfter[LABEL[9 * c + x] ?? 0] = (labelsAfter[LABEL[9 * c + x] ?? 0] ?? 0) + w
    })

    if (labelsAfter.some((w, k) => w !== before[k])) {
      return false
    }

    if (after.some((w, x) => 3 * w !== (labelsAfter[LABEL[9 * c + x] ?? 0] ?? 0))) {
      return false
    }
  }

  return seen.some(map => map.every(v => v >= 0) && new Set(map).size === 3)
}

export default experiment({
  id: 'quantum/relational-record',
  code: 'E-QTM-0135',
  title:
    'a relational record: the reflection through the frame direction, the one covariant three-body meeting that is not a permutation, measures a role exactly along the axis of a love-fear apparatus opened on one line, on every state the knit reaches; the apparatus is a knot and the triple is not, and the meeting keeps loves, fears and the color content',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = frameReflection(SIGNS)!
    const table = tripleTable(r)

    // G1: the meeting on the grid
    const moves = gridMoves()
    const phaseMoves = moves.act.map(g => phaseMove(g))
    const hit = new Uint8Array(729)
    let meetingBad = 0

    for (let j = 0; j < 729; j++) {
      const image = table[j] ?? 0
      const p = [Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9]
      const q = [Math.floor(image / 81), Math.floor(image / 9) % 9, image % 9]
      const color = (xs: readonly number[]): number => {
        let qa = 0
        let qb = 0

        xs.forEach((x, i) => {
          qa += (SIGNS[i] ?? 0) * Math.floor(x / 3)
          qb += (SIGNS[i] ?? 0) * (x % 3)
        })

        return 3 * mod3(qa) + mod3(qb)
      }

      meetingBad += hit[image] === 1 ? 1 : 0
      hit[image] = 1
      meetingBad += table[image] === j ? 0 : 1
      meetingBad += color(p) === color(q) ? 0 : 1

      for (const g of phaseMoves) {
        const moved = 81 * (g[p[0] ?? 0] ?? 0) + 9 * (g[p[1] ?? 0] ?? 0) + (g[p[2] ?? 0] ?? 0)
        const left = table[moved] ?? 0

        meetingBad += left === 81 * (g[q[0] ?? 0] ?? 0) + 9 * (g[q[1] ?? 0] ?? 0) + (g[q[2] ?? 0] ?? 0) ? 0 : 1
      }
    }

    const form = (x: number, y: number): number =>
      mod3(
        pointForm(Math.floor(x / 81), Math.floor(y / 81)) +
          pointForm(Math.floor(x / 9) % 9, Math.floor(y / 9) % 9) -
          pointForm(x % 9, y % 9),
      )

    for (let x = 0; x < 729; x++) {
      for (let y = 0; y < 729; y++) {
        if (form(table[x] ?? 0, table[y] ?? 0) !== form(x, y)) {
          meetingBad++
        }
      }
    }

    // the preparation l(p, q) is covariant
    const lineThrough = (p: number, q: number): number[] =>
      [0, 1, 2].map(s => addPoints(p, scalePoint(s, addPoints(q, scalePoint(2, p))))).sort((a, b) => a - b)
    let preparationBad = 0

    for (let p = 0; p < 9; p++) {
      for (let q = 0; q < 9; q++) {
        if (p === q) {
          continue
        }

        const line = lineThrough(p, q)

        for (const g of phaseMoves) {
          const moved = line.map(x => g[x] ?? 0).sort((a, b) => a - b)
          const direct = lineThrough(g[p] ?? 0, g[q] ?? 0)

          preparationBad += moved.every((x, i) => x === direct[i]) ? 0 : 1
        }
      }
    }

    // G2, G3, C1, C2 on the reached states
    const counts = {
      states: 0,
      statesWithFearOnA: 0,
      measurements: 0,
      copyBad: 0,
      referenceCopyBad: 0,
      unchangedBad: 0,
      partnerBad: 0,
      flatBad: 0,
      sameClassPairs: 0,
      sameClassBad: 0,
      otherClassPairs: 0,
      otherClassBad: 0,
      bellCases: 0,
      bellLearned: 0,
      kickCases: 0,
      kickCopyBad: 0,
      kickChanged: 0,
      statesWithNonUniformLabel: 0,
    }

    for (const h of bellHistories(BEATS)) {
      let w: Whole = lineKnot(h.tokens, [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k))

      for (const record of h.records) {
        w = advanceKnot(h, w, record)

        const state = physicalFrame(w, h.conjugated)
        const nonzero: number[] = []

        state.weight.forEach((x, i) => {
          if (x !== 0n) {
            nonzero.push(i)
          }
        })

        const margA = new Array<bigint>(9).fill(0n)
        const margB = new Array<bigint>(9).fill(0n)

        for (const i of nonzero) {
          margA[Math.floor(i / 9)] = (margA[Math.floor(i / 9)] ?? 0n) + (state.weight[i] ?? 0n)
          margB[i % 9] = (margB[i % 9] ?? 0n) + (state.weight[i] ?? 0n)
        }

        counts.states++
        counts.statesWithFearOnA += margA.some(x => x < 0n) ? 1 : 0

        for (const line of LINES) {
          const c = line.c
          const lam = lineLabel(line)
          const aAfter = new Array<bigint>(9).fill(0n)
          const bAfter = new Array<bigint>(9).fill(0n)
          const jointRec = new Array<bigint>(9).fill(0n)
          const jointRef = new Array<bigint>(9).fill(0n)
          // (A' point, record label), for the second apparatus
          const pointRec = new Array<bigint>(27).fill(0n)

          for (const i of nonzero) {
            const x = state.weight[i] ?? 0n
            const xa = Math.floor(i / 9)

            for (const sr of line.points) {
              for (const sf of line.points) {
                const image = table[81 * xa + 9 * sr + sf] ?? 0
                const a2 = Math.floor(image / 81)
                const k = LABEL[9 * c + a2] ?? 0
                const kr = LABEL[9 * c + (Math.floor(image / 9) % 9)] ?? 0
                const kf = LABEL[9 * c + (image % 9)] ?? 0

                aAfter[a2] = (aAfter[a2] ?? 0n) + x
                bAfter[i % 9] = (bAfter[i % 9] ?? 0n) + x
                jointRec[3 * k + kr] = (jointRec[3 * k + kr] ?? 0n) + x
                jointRef[3 * k + kf] = (jointRef[3 * k + kf] ?? 0n) + x
                pointRec[3 * a2 + kr] = (pointRec[3 * a2 + kr] ?? 0n) + x
              }
            }
          }

          counts.measurements++

          const labelsOf = (m: readonly bigint[]): bigint[] => {
            const out = [0n, 0n, 0n]

            m.forEach((x, p) => {
              out[LABEL[9 * c + p] ?? 0] = (out[LABEL[9 * c + p] ?? 0] ?? 0n) + x
            })

            return out
          }
          const before = labelsOf(margA).map(x => 9n * x)
          const after = labelsOf(aAfter)

          counts.copyBad += jointRec.every((x, j) => x === 0n || mod3(2 * lam - Math.floor(j / 3)) === j % 3) ? 0 : 1
          counts.referenceCopyBad += jointRef.every((x, j) => x === 0n || mod3(-Math.floor(j / 3) - lam) === j % 3) ? 0 : 1
          counts.unchangedBad += before.every((x, k) => x === after[k]) ? 0 : 1
          counts.partnerBad += margB.every((x, p) => 9n * x === bAfter[p]) ? 0 : 1
          counts.flatBad += aAfter.every((x, p) => 3n * x === (after[LABEL[9 * c + p] ?? 0] ?? 0n)) ? 0 : 1

          if (line === LINES[0]) {
            counts.statesWithNonUniformLabel += before.every(x => x === before[0]) ? 0 : 1
          }

          // the second apparatus
          for (const line2 of LINES) {
            const joint = new Array<bigint>(9).fill(0n)

            for (let j = 0; j < 27; j++) {
              const x = pointRec[j] ?? 0n

              if (x === 0n) {
                continue
              }

              for (const sr of line2.points) {
                for (const sf of line2.points) {
                  const image = table[81 * Math.floor(j / 3) + 9 * sr + sf] ?? 0
                  const kr2 = LABEL[9 * line2.c + (Math.floor(image / 9) % 9)] ?? 0

                  joint[3 * (j % 3) + kr2] = (joint[3 * (j % 3) + kr2] ?? 0n) + x
                }
              }
            }

            if (line2.c === c) {
              const shift = 2 * (lineLabel(line2) - lam)

              counts.sameClassPairs++
              counts.sameClassBad += joint.every((x, j) => x === 0n || mod3(Math.floor(j / 3) + shift) === j % 3) ? 0 : 1
            } else {
              const total = joint.reduce((s, x) => s + x, 0n)
              const row = [0, 1, 2].map(a => (joint[3 * a] ?? 0n) + (joint[3 * a + 1] ?? 0n) + (joint[3 * a + 2] ?? 0n))
              const col = [0, 1, 2].map(b => (joint[b] ?? 0n) + (joint[3 + b] ?? 0n) + (joint[6 + b] ?? 0n))

              counts.otherClassPairs++
              counts.otherClassBad += joint.every((x, j) => x * total === (row[Math.floor(j / 3)] ?? 0n) * (col[j % 3] ?? 0n)) ? 0 : 1
            }
          }

          // C2: the record on this line, the reference on another line of the same class
          for (const other of LINES) {
            if (other.c !== c || other === line) {
              continue
            }

            const kAfter = [0n, 0n, 0n]
            const joint = new Array<bigint>(9).fill(0n)

            for (let xa = 0; xa < 9; xa++) {
              const x = margA[xa] ?? 0n

              if (x === 0n) {
                continue
              }

              for (const sr of line.points) {
                for (const sf of other.points) {
                  const image = table[81 * xa + 9 * sr + sf] ?? 0
                  const k = LABEL[9 * c + Math.floor(image / 81)] ?? 0
                  const kr = LABEL[9 * c + (Math.floor(image / 9) % 9)] ?? 0

                  kAfter[k] = (kAfter[k] ?? 0n) + x
                  joint[3 * k + kr] = (joint[3 * k + kr] ?? 0n) + x
                }
              }
            }

            const rows = [0, 1, 2].map(k => [0, 1, 2].filter(kr => (joint[3 * k + kr] ?? 0n) !== 0n).length)

            counts.kickCases++
            counts.kickCopyBad += rows.every(n => n <= 1) && new Set([0, 1, 2].map(k => [0, 1, 2].find(kr => (joint[3 * k + kr] ?? 0n) !== 0n) ?? -k - 10)).size === 3 ? 0 : 1
            counts.kickChanged += before.every((x, k) => x === kAfter[k]) ? 0 : 1
          }
        }

        // C1: the apparatus in a Bell state of the love-fear pair: (y, y + v) stored
        for (let v = 0; v < 9; v++) {
          const joint = new Array<bigint>(729).fill(0n)

          for (let xa = 0; xa < 9; xa++) {
            const x = margA[xa] ?? 0n

            if (x === 0n) {
              continue
            }

            for (let y = 0; y < 9; y++) {
              const image = table[81 * xa + 9 * y + addPoints(y, v)] ?? 0

              joint[81 * xa + (image % 81)] = (joint[81 * xa + (image % 81)] ?? 0n) + x
            }
          }

          const total = joint.reduce((s, x) => s + x, 0n)
          const pair = new Array<bigint>(81).fill(0n)
          const sys = new Array<bigint>(9).fill(0n)

          joint.forEach((x, j) => {
            pair[j % 81] = (pair[j % 81] ?? 0n) + x
            sys[Math.floor(j / 81)] = (sys[Math.floor(j / 81)] ?? 0n) + x
          })

          counts.bellCases++
          counts.bellLearned += joint.every((x, j) => x * total === (sys[Math.floor(j / 81)] ?? 0n) * (pair[j % 81] ?? 0n)) ? 0 : 1
        }
      }
    }

    // G4 and G5: which covariant meetings measure, exhaustively
    const patterns = Array.from({ length: 8 }, (_, k) => [0, 1, 2].map(i => ((k >> i) & 1 ? -1 : 1)))
    let passes = 0
    let passesNotR = 0
    let passesTwoLines = 0
    let passesOnKnots = 0
    let knotReadingBad = 0
    const perPattern: Record<string, number> = {}

    for (const signs of patterns) {
      const name = signs.map(w => (w > 0 ? 'L' : 'F')).join('')
      const maps = covariantCliffords(signs)
      const reflection = frameReflection(signs)
      let count = 0

      for (const a of maps) {
        for (let s = 0; s < 3; s++) {
          const [i, j] = [0, 1, 2].filter(k => k !== s)

          for (const li of LINES) {
            for (const lj of LINES) {
              for (let c = 0; c < 4; c++) {
                const lines: number[][] = [[], [], []]

                lines[i ?? 0] = li.points
                lines[j ?? 0] = lj.points

                if (!measures(a, 3, s, lines, c)) {
                  continue
                }

                count++
                passes++
                passesNotR += reflection && a.every((x, k) => x === reflection[k]) ? 0 : 1
                passesTwoLines += li === lj ? 0 : 1
                passesOnKnots += chargeOf(signs) === 0 ? 1 : 0
                knotReadingBad += chargeOf([signs[i ?? 0] ?? 0, signs[j ?? 0] ?? 0]) === 0 && chargeOf(signs) !== 0 ? 0 : 1
              }
            }
          }
        }
      }

      perPattern[`passes_${name}`] = count
    }

    // reading: four tokens, all apparatus on lines of the class read
    const four: Record<string, number> = {}

    for (const signs of [
      [1, 1, 1, 1],
      [1, 1, 1, -1],
      [1, 1, -1, -1],
    ]) {
      const name = signs.map(w => (w > 0 ? 'L' : 'F')).join('')
      const maps = covariantCliffords(signs)
      let count = 0
      let apparatusKnots = 0
      const mapsThatMeasure = new Set<number>()

      maps.forEach((a, mi) => {
        for (let s = 0; s < 4; s++) {
          const others = [0, 1, 2, 3].filter(k => k !== s)

          for (let c = 0; c < 4; c++) {
            const classLines = LINES.filter(l => l.c === c)

            for (let m = 0; m < 27; m++) {
              const lines: number[][] = [[], [], [], []]

              others.forEach((k, t) => {
                lines[k] = classLines[Math.floor(m / 3 ** t) % 3]?.points ?? []
              })

              if (measures(a, 4, s, lines, c)) {
                count++
                mapsThatMeasure.add(mi)
                apparatusKnots += chargeOf(others.map(k => signs[k] ?? 0)) === 0 ? 1 : 0
              }
            }
          }
        }
      })

      four[`four_${name}_charge`] = chargeOf(signs)
      four[`four_${name}_passes`] = count
      four[`four_${name}_mapsThatMeasure`] = mapsThatMeasure.size
      four[`four_${name}_passesWithKnotApparatus`] = apparatusKnots
    }

    const gates = {
      G1: meetingBad === 0 && preparationBad === 0,
      G2: counts.copyBad === 0 && counts.referenceCopyBad === 0 && counts.unchangedBad === 0 && counts.partnerBad === 0 && counts.flatBad === 0,
      G3: counts.sameClassBad === 0 && counts.otherClassBad === 0 && counts.sameClassPairs > 0 && counts.otherClassPairs > 0,
      G4: passes === 144 && passesNotR === 0 && passesTwoLines === 0 && passesOnKnots === 0 && patterns.every(s => perPattern[`passes_${s.map(w => (w > 0 ? 'L' : 'F')).join('')}`] === (chargeOf(s) === 0 ? 0 : 24)),
      G5: knotReadingBad === 0 && passes > 0,
      C1: counts.bellLearned === 0,
      C2: counts.kickChanged > 0 && counts.kickCopyBad === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the reflection through the frame direction, with a love-fear apparatus opened on one stored line, is a von Neumann measurement of the system's label across that line's class on all ${counts.states} reached states and all 12 lines (${counts.measurements} measurements): record and reference each copy it, its distribution and the partner are unchanged, the system is flattened along the axis, and a second apparatus agrees on its class and is independent on the others; of every covariant Clifford meeting of three tokens, preparation and class (${passes} passes), only this one measures, always with a knot as apparatus and never on a knot triple; a Bell-state apparatus learns nothing, and two lines of one class kick the label`,
      metrics: {
        meetingBad,
        preparationBad,
        ...counts,
        passes,
        passesNotR,
        passesTwoLines,
        passesOnKnots,
        knotReadingBad,
        ...perPattern,
        ...four,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status pass as before; states with fear on A 1,208 -> 995. " + ('L2, exact BigInt wholes on the reached states, exact integer tables elsewhere, no random numbers. The apparatus preparation (two tokens opened on one line, the line through the pair\'s classical points) is a stand-in: the knit does not open tokens. A pass of the exhaustive search is a measurement on the 12 system line states (the label distribution kept, flat along the class, some apparatus label a bijection of the system\'s); the reached-state gates then check the one that passes on the knit\'s own states.'),
    })
  },
})
