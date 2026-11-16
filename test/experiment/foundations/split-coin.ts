// THE SPLIT COIN (item vibe-roadmap-grounding-0017, grounding decision 004). The working beat becomes U = S W D Y D W with
// D = C^(1/2) (code/rule/coined-locked-knit halfCoinBranch, opt-in by setCoinPlace('split') or VIBE_COIN=split). This
// file checks the three things the decision needs before the split can replace the default; the reruns of the held
// results are task/split-coin-rerun.ts.
//
// THE GATES were fixed in the item's `what` before this file existed (task/pre-register):
//   S1 D is an exact square root of the coin in Z[w][1/2]: D D = C and D^-1 D = 1 on every one-line configuration on
//      every line and on every branch of E-FND-0179's 9 starts over 8 box beats; of C's four square roots D is the only
//      one that fixes C's fixed vector e0 + e1 and is not a power of C
//   S2 the option is opt-in: with the default place E-FND-0179's gates G0 to G7 all hold (G0 is bit for bit); with the
//      place split, coinedVetoBeat and valueBeat equal E-FND-0179's split order beat for every value kind, and the back
//      beat returns every start
//   S4 ODD's CPT cost on the split rule (E-FND-0179 cptSplit, box): reported, with the zero control (value piece off)
//
// DETERMINISM: no random numbers. Every comparison is exact (Z[w][1/2] in bigint).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedState,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  currentCoinPlace,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  valueBeat,
  valueBeatBack,
  VALUE_KINDS,
  type ValuePiece,
} from '@/code/rule/value-phase'
import { sameStateFast } from '@/code/measure/value-phase-maps'
import {
  coinStep,
  halfCoinStep,
  orderBeat,
} from '@/code/measure/coin-reversal'
import { meshSetup } from '@/test/experiment/foundations/value-phase'
import {
  coinGates,
  readCoin,
  startsOf,
} from '@/test/experiment/foundations/coin-reversal'

type Setup = ReturnType<typeof meshSetup>

// ---- Z[w] for the four roots: a + b w, w^2 = -1 - w ----

type Zw = readonly [number, number]

const mul = (x: Zw, y: Zw): Zw => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
const eq = (x: Zw, y: Zw): boolean => x[0] === y[0] && x[1] === y[1]
const neg = (x: Zw): Zw => [-x[0], -x[1]]

const ONE: Zw = [1, 0]
const W: Zw = [0, 1]
const ZETA6: Zw = [1, 1]

export type RootRow = {
  plus: Zw
  minus: Zw
  squaresToC: boolean
  fixesE0PlusE1: boolean
  powerOfC: boolean
}

// a line operator diagonal on (e0 + e1, e0 - e1) with eigenvalues (plus, minus); C is (1, w)
export function rootsOfCoin(): RootRow[] {
  const powers: Zw[] = [ONE, W, mul(W, W)]
  const rows: RootRow[] = []

  for (const plus of [ONE, neg(ONE)]) {
    for (const minus of [ZETA6, neg(ZETA6)]) {
      rows.push({
        plus,
        minus,
        squaresToC: eq(mul(plus, plus), ONE) && eq(mul(minus, minus), W),
        fixesE0PlusE1: eq(plus, ONE),
        powerOfC: eq(plus, ONE) && powers.some(p => eq(p, minus)),
      })
    }
  }

  return rows
}

// ---- S1 ----

function empty(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

// every one-line configuration on dock 0: empty, one vibe, two vibes, each tone, open or closed, two points
function lineConfigurations(cells: number): Configuration[] {
  const out: Configuration[] = []

  for (let l = 0; l < 12; l++) {
    const i = LINE_FIRSTS[l]!
    const j = OPPOSITE[i]!

    out.push(empty(cells))

    for (const slot of [i, j]) {
      for (const tone of [1, -1]) {
        for (const open of [0, 1]) {
          for (const point of [0, 5]) {
            const c = empty(cells)

            c.vibe[slot] = tone
            c.open[slot] = open
            c.point[slot] = point
            out.push(c)
          }
        }
      }
    }

    for (const ti of [1, -1]) {
      for (const tj of [1, -1]) {
        for (const oi of [0, 1]) {
          for (const oj of [0, 1]) {
            const c = empty(cells)

            c.vibe[i] = ti
            c.vibe[j] = tj
            c.open[i] = oi
            c.open[j] = oj
            c.point[i] = 0
            c.point[j] = 5
            out.push(c)
          }
        }
      }
    }
  }

  return out
}

export type RootReading = {
  lineStates: number
  trajectoryStates: number
  squareMismatches: number
  inverseMismatches: number
}

function checkState(s: Setup, st: LockedState, r: RootReading): void {
  const d = halfCoinStep(s.tables, st, false)

  if (!sameStateFast(halfCoinStep(s.tables, d, false), coinStep(s.tables, st, false))) {
    r.squareMismatches++
  }

  if (!sameStateFast(halfCoinStep(s.tables, d, true), st)) {
    r.inverseMismatches++
  }
}

export function readRoot(s: Setup): RootReading {
  const r: RootReading = { lineStates: 0, trajectoryStates: 0, squareMismatches: 0, inverseMismatches: 0 }

  for (const c of lineConfigurations(s.tables.cells)) {
    checkState(s, lockedState(c), r)
    r.lineStates++
  }

  const off: ValuePiece = { kind: 'off' }

  for (const st of startsOf(s)) {
    let a = lockedState(st.config)

    for (let t = 0; t < s.beats; t++) {
      checkState(s, a, r)
      r.trajectoryStates++
      a = orderBeat('before', off, s.tables, a, t)
    }
  }

  return r
}

// ---- S2 ----

export type OptionReading = {
  // with place split: beats where the rule differs from E-FND-0179's split order, per value kind
  splitMismatches: Record<string, number>
  // starts that do not return under the split back beat (every value kind)
  splitNoReturn: number
  // E-FND-0179's gates on the default place
  defaultGates: Record<string, boolean>
}

function withPlace<T>(place: 'before' | 'split', run: () => T): T {
  const was = currentCoinPlace()

  setCoinPlace(place)

  try {
    return run()
  } finally {
    setCoinPlace(was)
  }
}

export function readOption(s: Setup): OptionReading {
  const splitMismatches: Record<string, number> = {}

  let splitNoReturn = 0

  withPlace('split', () => {
    for (const kind of VALUE_KINDS) {
      const piece: ValuePiece = { kind, orientation: s.orientation }

      splitMismatches[kind] = 0

      for (const st of startsOf(s)) {
        let a = lockedState(st.config)

        for (let t = 0; t < s.beats; t++) {
          const mine = valueBeat(piece, s.tables, a, t)
          const theirs = orderBeat('split', piece, s.tables, a, t)

          if (!sameStateFast(mine, theirs)) {
            splitMismatches[kind]!++
          }

          if (kind === 'off' && !sameStateFast(coinedVetoBeat('none', s.tables, a, t), theirs)) {
            splitMismatches[kind]!++
          }

          a = theirs
        }

        for (let t = s.beats - 1; t >= 0; t--) {
          a = valueBeatBack(piece, s.tables, a, t)
        }

        if (!sameStateFast(a, lockedState(st.config))) {
          splitNoReturn++
        }
      }
    }
  })

  return { splitMismatches, splitNoReturn, defaultGates: {} }
}

// ---- the run ----

export function splitCoin(log: (line: string) => void = () => {}): Verdict {
  const started = Date.now()
  const tick = (what: string): void => log(`${what} (${Math.round((Date.now() - started) / 1000)} s)`)
  const s = meshSetup('box', 1)
  const roots = rootsOfCoin()
  const kept = roots.filter(x => x.squaresToC && x.fixesE0PlusE1 && !x.powerOfC)
  const root = readRoot(s)

  tick(`S1 roots ${JSON.stringify(roots)} reading ${JSON.stringify(root)}`)

  const option = readOption(s)

  tick(`S2 split ${JSON.stringify(option)}`)

  const coin = withPlace('before', () => readCoin(s, log))
  const gates0179 = coinGates(coin)

  option.defaultGates = gates0179
  tick(`S2 default E-FND-0179 gates ${JSON.stringify(gates0179)}`)

  const sp = coin.cptSplit!
  const dual = coin.cptDual!
  const controlZero = (['P', 'Prot'] as const).every(m =>
    Object.values(sp.off![m]!).every(n => n === 0),
  )
  const oddSplit = sp.odd!.Prot!.X1!
  const oddSplitF = sp.odd!.Prot!.X1f!
  const oddDual = dual.odd!.Prot!.X1!

  tick(`S4 cptSplit ${JSON.stringify(sp)}`)

  const gates = {
    S1:
      roots.every(x => x.squaresToC) &&
      kept.length === 1 &&
      kept[0]!.minus[0] === 1 &&
      kept[0]!.minus[1] === 1 &&
      root.squareMismatches === 0 &&
      root.inverseMismatches === 0,
    S2:
      Object.values(gates0179).every(Boolean) &&
      Object.values(option.splitMismatches).every(n => n === 0) &&
      option.splitNoReturn === 0,
    S4control: controlZero,
  }
  const failing = Object.entries(gates).filter(([, ok]) => !ok).map(([g]) => g)
  const status = failing.length > 0 ? 'fail' : 'pass'

  return verdict({
    status,
    claim:
      status === 'pass'
        ? `D = C^(1/2) (keep (2 + w)/2, cross -w/2, two open vibes 1 + w) is exact in Z[w][1/2]: D D = C and D^-1 D = 1 on ${root.lineStates} one-line and ${root.trajectoryStates} trajectory states, and of C's four square roots it is the only one that fixes e0 + e1 and is not a power of C; the split option equals E-FND-0179's split beat for every value kind and returns every start, the default keeps E-FND-0179's gates; on the split rule ODD breaks CPT under the depth-reversing lift on X1 at ${oddSplit} of ${s.beats} beats (X1f ${oddSplitF}; coin before ${oddDual}) against a zero control`
        : `gates failing: ${failing.join(', ')}`,
    metrics: {
      seconds: (Date.now() - started) / 1000,
      lineStates: root.lineStates,
      trajectoryStates: root.trajectoryStates,
      squareMismatches: root.squareMismatches,
      inverseMismatches: root.inverseMismatches,
      rootsKept: kept.length,
      splitNoReturn: option.splitNoReturn,
      ...Object.fromEntries(Object.entries(option.splitMismatches).map(([k, n]) => [`splitMismatch_${k}`, n])),
      oddCptSplitProtX1: oddSplit,
      oddCptSplitProtX1f: oddSplitF,
      oddCptDualProtX1: oddDual,
      oddCptSplitPX1: sp.odd!.P!.X1!,
      evenCptSplitPH: sp.even!.P!.H!,
      ...Object.fromEntries(Object.entries(gates).map(([g, ok]) => [`gate${g}`, ok ? 1 : 0])),
    },
    notes: `Gates: grounding-0017 what. cptSplit ${JSON.stringify(sp)}. E-FND-0179 gates on the default place ${JSON.stringify(gates0179)}.`,
  })
}

export default experiment({
  id: 'foundations/split-coin',
  code: 'E-FND-0180',
  title:
    "the split coin, pass: D = C^(1/2) (keep (2 + w)/2, cross -w/2, two open vibes 1 + w = zeta6) is exact in Z[w][1/2], inside both model rings: D D = C and D^-1 D = 1 on 396 one-line and 72 trajectory states, and of C's four square roots it is the only one that fixes the coin's fixed vector e0 + e1 and is not a power of C (P+ + w^2 P- is C^-1); the split beat S W D Y D W is an opt-in option of the working rule (VIBE_COIN=split), equal to E-FND-0179's split order for every value kind on the 9 box starts and exactly reversible, with the default bit for bit (E-FND-0179 G0 to G7 hold); on the split rule, now T-even, ODD breaks CPT under the depth-reversing lift on X1 at 2 of 8 beats (X1f 2, coin before 2) and keeps it under the depth-kept inversion, against a zero control",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return splitCoin(line => console.error(line))
  },
})
