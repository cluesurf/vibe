// THE WORKING VACUUM'S LIKE-PAIR WORD (E-QTM-0171's extraction, as a helper for E-QTM-0172 and later readings).
// MEASUREMENT, exact: the rule's own like pair (E-RLT-0105's pick, code/measure/occupation-veto-readings likePairStart)
// is followed by two single-mark shadows of the classical occupation, one per vibe, which run the rule's collision and
// stream; each vibe's slot is then known every beat and the grid move of the link it streams through is read from the
// tables. A meeting is a beat at which both vibes are free and sit on one line of a dock with like signs. Between two
// meetings vibe A's point is moved by P and vibe B's by Q; the relative move R = P Q^-1 is returned as the index of the
// local Clifford that permutes the phase points the same way (E-QTM-0133's convention A). The coin and the meetings do
// not move a slot of the pair in the working vacuum (E-QTM-0171's instrument gate checked this against the rule on 34
// runs); this helper does not recheck it.
//
// NOTHING MOVES: the shadows are copies; no seeds.

import {
  contactFresh,
  likePairStart,
} from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { collideVeto, toWords } from '@/code/rule/occupation-veto-knit'
import {
  cloneConfiguration,
  streamConfiguration,
  type Configuration,
} from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  cliffordGroup,
  eisValue,
  type Mat3,
} from '@/code/measure/eisenstein-words'
import {
  phasePointOperators,
  type Operator,
} from '@/code/measure/grid-weights'

const IDENTITY = Array.from({ length: 9 }, (_, i) => i)

function floatOf(m: Mat3): Operator {
  const o: Operator = {
    n: 3,
    re: new Float64Array(9),
    im: new Float64Array(9),
  }

  m.num.forEach((x, i) => {
    const [re, im] = eisValue(x, 3 ** m.den3)

    o.re[i] = re
    o.im[i] = im
  })

  return o
}

function product(a: Operator, b: Operator, dagger: boolean): Operator {
  const o: Operator = {
    n: 3,
    re: new Float64Array(9),
    im: new Float64Array(9),
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const ar = a.re[i * 3 + k]!
        const ai = a.im[i * 3 + k]!
        const br = dagger ? b.re[j * 3 + k]! : b.re[k * 3 + j]!
        const bi = dagger ? -b.im[j * 3 + k]! : b.im[k * 3 + j]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      o.re[i * 3 + j] = re
      o.im[i * 3 + j] = im
    }
  }

  return o
}

// the permutation of the nine phase points a Clifford makes by conjugation
export function cliffordPointPermutation(m: Mat3): number[] {
  const u = floatOf(m)
  const points = phasePointOperators(1)

  return points.map(p => {
    const moved = product(product(u, p, false), u, true)

    return points.findIndex(q =>
      q.re.every(
        (v, i) =>
          Math.abs(v - moved.re[i]!) < 1e-9 &&
          Math.abs(q.im[i]! - moved.im[i]!) < 1e-9,
      ),
    )
  })
}

export type PairWord = {
  // the group the indices refer to (code/measure/eisenstein-words cliffordGroup, in its order)
  group: Mat3[]
  // beats at which the pair meets
  meets: number[]
  // the relative move between meeting i and meeting i + 1, as a group index (-1 if no Clifford makes it)
  rs: number[]
  found: boolean
}

// the like pair's meetings and relative moves over `beats` beats on a side-`side` box, at the current link start
export function vacuumPairWord(
  side: number,
  beats: number,
  group: Mat3[] = cliffordGroup(),
): PairWord {
  const indexOf = new Map<string, number>()

  group.forEach((g, i) =>
    indexOf.set(cliffordPointPermutation(g).join(','), i),
  )

  const f = contactFresh(side, 'pass')
  const pick = likePairStart(
    'none',
    f.tables,
    toWords(vacuumConfiguration(f, 'none')),
    12,
  )
  const out: PairWord = { group, meets: [], rs: [], found: false }

  if (!pick?.clean) {
    return out
  }

  const marks: Configuration[] = []

  pick.start.sopen.forEach((bits, line) => {
    for (const bit of [1, 2]) {
      if (bits & bit) {
        const c = cloneConfiguration(pick.start)

        c.sopen.fill(0)
        c.sopen[line] = bit
        marks.push(c)
      }
    }
  })

  if (marks.length !== 2) {
    return out
  }

  out.found = true

  const slotOf = (c: Configuration): number =>
    c.open.findIndex(v => v !== 0)

  let cum = [IDENTITY, IDENTITY]

  for (let t = 0; t < beats; t++) {
    const sa = slotOf(marks[0]!)
    const sb = slotOf(marks[1]!)
    const meeting =
      sa >= 0 &&
      sb >= 0 &&
      Math.floor(sa / 24) === Math.floor(sb / 24) &&
      OPPOSITE[sa % 24] === sb % 24 &&
      marks[0]!.vibe[sa] === marks[0]!.vibe[sb]

    if (meeting) {
      if (out.meets.length > 0) {
        const p = cum[0]!
        const qi = new Array<number>(9)

        cum[1]!.forEach((v, i) => (qi[v] = i))
        out.rs.push(
          indexOf.get(IDENTITY.map(x => p[qi[x]!]!).join(',')) ?? -1,
        )
      }

      out.meets.push(t)
      cum = [IDENTITY, IDENTITY]
    }

    marks.forEach((c, k) => {
      collideVeto('none', f.tables, c, t, false)

      const s = slotOf(c)

      if (s >= 0) {
        cum[k] = cum[k]!.map(p => f.tables.move[s * 9 + p]!)
      }

      streamConfiguration(f.tables, c, false)
    })
  }

  return out
}
