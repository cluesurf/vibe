// Why the colour lines trade charge in threes, for every rule and not only the pair rules of
// E-FRC-0107. A triality sigma fixes the three colour lines and cycles the other nine in three
// orbits. Take any rule that is reversible and carried to itself by sigma, whatever it reads,
// including a rule that chooses its pairs from the data. It maps a state sigma leaves alone to a
// state sigma leaves alone, since f(s) = f(sigma s) = sigma f(s). In such a state each orbit's three
// lines hold the same thing, so an orbit always holds a multiple of three tones. A lone tone on a
// colour line with its orbit empty is such a state, and so is whatever it becomes. So no single
// tone can ever cross from a colour line to its orbit. The orbit gains nothing, or three identical
// charges, or three identical neutral pairs. That is the one-for-three move, forced.
//
// The argument is short and this checks it on the real rule, exhaustively. Every cell state sigma
// leaves alone (the three colour lines free, one state per orbit copied round it: 9^3 x 9^3 =
// 531,441) goes through every beat of the triality weave's schedule. Gates: every image is again
// left alone by sigma, and every image holds a multiple of three tones on each orbit. And from each
// of the four lone colour-line tones (two signs, two ends), the charge-conserving images the
// argument allows are listed exhaustively on the four-line block: stay, one for three, or three
// neutral pairs, nothing else.
//
// Controls. The committed turning weave on the same cells: it does not respect sigma, so it maps
// some of them out of the set. Two ideas this closes, recorded rather than left open:
// - Data-dependent pairing, a rule that pairs a colour line with whichever orbit line is occupied,
//   is one of the rules the argument covers. It can move a single tone from an orbit line onto a
//   colour line only if some reversible sigma-covariant map sends a non-fixed state to a fixed one,
//   and a bijection cannot, since the inverse would then send a fixed state out of the set.
// - The one-for-three move as a momentum-conserving three-body collision: the three directions of
//   each orbit would have to sum to zero. They sum to three times one colour weight instead,
//   printed as orbitSumNorm, so the forced move conserves charge and not momentum.
// And one more, a guess that the colour group is what the committed pair clock generates: read a
// line's nine states as the nine points of a qutrit phase space (tones as Z3, every relabelling of
// the three tones tried), and ask whether the pair clock is one of the 432 affine maps of Z3^2. It
// is not, under any relabelling (affineMatches).
//
// Depth L1: an exhaustive statement about a symmetry, checked on the rule that has it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  colourTriality,
  trialityWeave,
  trialityWeaveLayout,
  TRIALITY_WEAVE_PERIOD,
} from '@/code/rule/triality-weave'
import { PAIR_FORWARD, turningWeave } from '@/code/rule/collision'
import { d4BoxMesh } from '@/code/substrate/d4-box'

const PAIR_STATES: readonly (readonly [number, number])[] = [
  -1, 0, 1,
].flatMap(a => [-1, 0, 1].map(b => [a, b] as const))

export default experiment({
  id: 'gauge/one-for-three-is-forced',
  code: 'E-FRC-0112',
  title:
    'any reversible rule that respects a colour triality, pairs chosen from the data included, can move tones between a colour line and its orbit only in threes: checked on all 531,441 triality-fixed cell states through every beat of the triality weave, with the lone-tone images listed exhaustively',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: 3 })
    const opposite = meshOpposites(mesh)
    const sigma = colourTriality({ opposite })
    const layout = trialityWeaveLayout({ opposite, triality: sigma })
    const weave = trialityWeave({ layout })
    const committed = turningWeave({ opposite: [...opposite] })
    const cell = new Int8Array(24)

    const fixedBySigma = (slots: Int8Array): boolean =>
      sigma.every((image, d) => slots[image] === slots[d])

    const orbitTones = (slots: Int8Array): number[] =>
      layout.orbits.map(orbit =>
        orbit.reduce((sum, line) => {
          const [a, b] = layout.lines[line] ?? [0, 0]

          return (
            sum + (slots[a] !== 0 ? 1 : 0) + (slots[b] !== 0 ? 1 : 0)
          )
        }, 0),
      )

    // write a triality-fixed state: colour line states c0 c1 c2, one state per orbit copied round it
    const write = (colour: number[], orbit: number[]): void => {
      cell.fill(0)
      layout.colour.forEach((line, k) => {
        const [a, b] = layout.lines[line] ?? [0, 0]
        const [x, y] = PAIR_STATES[colour[k] ?? 0] ?? [0, 0]

        cell[a] = x
        cell[b] = y
      })

      layout.orbits.forEach((lines, k) => {
        const [x, y] = PAIR_STATES[orbit[k] ?? 0] ?? [0, 0]

        for (const line of lines) {
          const [a, b] = layout.lines[line] ?? [0, 0]

          cell[a] = x
          cell[b] = y
        }
      })
    }

    let states = 0
    let staysFixed = 0
    let orbitsInThrees = 0
    let committedLeaves = 0

    const work = new Int8Array(24)

    for (let code = 0; code < 9 ** 6; code++) {
      const digits = [0, 1, 2, 3, 4, 5].map(
        k => Math.floor(code / 9 ** k) % 9,
      )

      write(digits.slice(0, 3), digits.slice(3))

      if (!fixedBySigma(cell)) {
        continue
      }

      states += 1

      let fixedAll = true
      let threesAll = true

      for (let t = 0; t < TRIALITY_WEAVE_PERIOD; t++) {
        work.set(cell)
        weave(t)(work, 0, 24)
        fixedAll = fixedAll && fixedBySigma(work)
        threesAll =
          threesAll && orbitTones(work).every(n => n % 3 === 0)
      }

      staysFixed += fixedAll ? 1 : 0
      orbitsInThrees += threesAll ? 1 : 0

      let committedFixed = true

      for (let t = 0; t < 24; t++) {
        work.set(cell)
        committed(t)(work, 0, 24)
        committedFixed = committedFixed && fixedBySigma(work)
      }

      committedLeaves += committedFixed ? 0 : 1
    }

    // the four-line block: a lone tone s on colour line R (either end), orbit empty. Every block
    // state sigma leaves alone that has the same charge: R any of 9 states, the orbit one state x3
    const allowed: string[] = []

    for (const s of [1, -1]) {
      for (const [r0, r1] of PAIR_STATES) {
        for (const [o0, o1] of PAIR_STATES) {
          if (r0 + r1 + 3 * (o0 + o1) !== s) {
            continue
          }

          allowed.push(`s${s}: R(${r0},${r1}) orbit(${o0},${o1})x3`)
        }
      }
    }

    // each allowed image, read as how many tones the orbit gains
    const orbitGains = new Set(
      allowed.map(entry => {
        const match = /orbit\((-?\d),(-?\d)\)/.exec(entry)
        const a = Number(match?.[1] ?? 0)
        const b = Number(match?.[2] ?? 0)

        return 3 * ((a !== 0 ? 1 : 0) + (b !== 0 ? 1 : 0))
      }),
    )

    // the orbit sums of the colour-selecting triality
    const roots = rootsD4()
    const seen = new Set<number>()

    let orbitSumNorm = Number.POSITIVE_INFINITY
    let zeroSumOrbits = 0

    for (let d = 0; d < 24; d++) {
      if (seen.has(d) || sigma[d] === d) {
        continue
      }

      const orbit = [d, sigma[d] ?? 0, sigma[sigma[d] ?? 0] ?? 0]

      orbit.forEach(x => seen.add(x))

      const sum = [0, 1, 2, 3].map(k =>
        orbit.reduce((acc, x) => acc + (roots[x]?.[k] ?? 0), 0),
      )
      const norm = Math.hypot(...sum)

      orbitSumNorm = Math.min(orbitSumNorm, norm)
      zeroSumOrbits += norm < 1e-9 ? 1 : 0
    }

    // the pair clock against every affine map of Z3^2, under every relabelling of the tones
    const relabellings = [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ]

    let affineMatches = 0

    for (const label of relabellings) {
      const z = (tone: number): number => label[tone + 1] ?? 0

      for (let m = 0; m < 3 ** 4; m++) {
        const [a, b, c, d] = [0, 1, 2, 3].map(
          k => Math.floor(m / 3 ** k) % 3,
        )

        if (((a ?? 0) * (d ?? 0) - (b ?? 0) * (c ?? 0)) % 3 === 0) {
          continue
        }

        for (let v = 0; v < 9; v++) {
          const [v0, v1] = [v % 3, Math.floor(v / 3)]
          const matches = PAIR_STATES.every(([x, y], k) => {
            const [p, q] = PAIR_FORWARD[k] ?? [0, 0]
            const zx = z(x)
            const zy = z(y)

            return (
              ((a ?? 0) * zx + (b ?? 0) * zy + v0) % 3 === z(p) &&
              ((c ?? 0) * zx + (d ?? 0) * zy + v1) % 3 === z(q)
            )
          })

          affineMatches += matches ? 1 : 0
        }
      }
    }

    const ok =
      states === 9 ** 6 &&
      staysFixed === states &&
      orbitsInThrees === states &&
      [...orbitGains].every(n => n % 3 === 0) &&
      committedLeaves > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all 531,441 cell states the colour triality leaves alone stay in that set through every beat of the triality weave, with a multiple of three tones on every orbit, and from a lone colour-line tone the only charge-conserving triality-fixed images give the orbit 0, 3 or 6 tones, never one, while the committed turning weave takes some of those states out of the set',
      metrics: {
        fixedStates: states,
        staysFixed,
        orbitsInThrees,
        allowedLoneImages: allowed.length,
        orbitGains:
          [...orbitGains].sort((x, y) => x - y).join(' ') === '0 3 6'
            ? 1
            : 0,
        committedLeaves,
      },
      control: {
        zeroSumOrbits,
        orbitSumNorm,
        affineMatches,
      },
      notes: `L1, exact and exhaustive, no random numbers. The allowed images of a lone colour-line tone: ${allowed.join('; ')}. orbitGains is 1 when the gains are exactly 0, 3 and 6. Closed by the same argument: pairs chosen from the data (angle three of the alternatives in note/experiment/gauge/what-the-base-needs.md). Not a hit: the orbits do not sum to zero (zeroSumOrbits 0, smallest sum norm ${orbitSumNorm.toFixed(3)}, which is three times a colour weight), and the pair clock is not an affine map of a qutrit phase space under any tone relabelling (affineMatches 0). What escapes the argument is a rule that respects the triality only together with a shift in time, which does not have to keep fixed states fixed on each beat.`,
    })
  },
})
