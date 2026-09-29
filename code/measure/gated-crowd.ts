// A crowd under the occupancy-gated take, and what it does to the husk around it (E-GRV-0061). The rule is
// code/measure/gated-take's, unchanged (E-GRV-0060); this file builds the survey and its readers.
//
// THE CROWD. A husk ball of radius 2 at full depth around the origin, every slot and store of its docks held (energy
// 48, so L = 17 under the law L(E) = 1 + max(0, E - 32)), love or fear by a Weyl value. Its counters start at 1: the
// crowd as it stands one beat after a take, so it is paused on beats 0 to 15 and takes first on beat 16. That is a state
// the rest orbit reaches (a full dock that took on the beat before), chosen so the rule itself keeps the crowd in place
// for 16 beats; no reflection is imposed. The background is the adopted vacuum (its docks hold at most 24, below the
// threshold, so outside the crowd the gated rule is the old knit exactly while nothing crowds there).
//
// FOUR CONFIGURATIONS from one start: none (the gated rule, no crowd), crowd, flip (the crowd with every trit negated)
// and old (the crowd under the OLD knit, no gate). Plus the old knit on the plain vacuum, to check none against it.
//
// THE READERS.
//   the signal: one love vibe added on a +x slot at (-reach, b, 0) against the base run (code/measure/knot-time
//     twinStart). Per beat, the twin's husk column content (two 32-bit hashes, a reader) against the base's: the
//     ARRIVAL at the detector (reach, b, 0), at the column BEHIND it (reach + 2, b, 0) (a front that reaches the detector
//     first came through; one that reaches the column behind first came round the torus), at the column BACK of the
//     source (-reach - 2, b, 0) (a front there came back, reflected), and at the PLANE x = reach: the first beat any of
//     its columns differs, and the mean min-image y of the columns differing then (the deflection: b minus that mean,
//     positive toward the crowd)
//   the drift: a dilute test blob (the 7 columns within 1 of a point at distance r on an axis, full depth, each calm
//     slot held when a Weyl value falls below 1/24) against the base run; the excess energy's displacement toward the
//     crowd (code/measure/held-knot towardKnot) after 16 and 32 beats
//
// NO ROUNDING in the rule. Reals and hashes only in the readers. DETERMINISM: link starts and Weyl fills; nothing is
// drawn. NOTHING MOVES: a slot takes its neighbor's value; a turned-back vibe takes the opposite slot of its own dock.

import {
  arrowBox,
  chargeOf,
  energyOf,
  twoWay,
  vacuumState,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import {
  sameReduced,
  type Reduced,
} from '@/code/measure/living-pair-kernel'
import {
  columnEnergy,
  columnPosition,
  ring,
  towardKnot,
} from '@/code/measure/held-knot'
import { twinStart } from '@/code/measure/knot-time'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  ballDocks,
  cloneGated,
  contentHashes,
  crowdStart,
  dockEnergy,
  gasFill,
  gatedRunner,
  gatedTake,
  occupancyLaw,
  restState,
  type BeatTally,
  type GatedState,
} from '@/code/measure/gated-take'

export type CrowdSettings = {
  readonly side: number
  readonly threshold: number
  readonly radius: number
  readonly crowdCounter: number
  readonly offsets: number
  readonly beats: number
  readonly reach: number
  readonly impacts: readonly number[]
  readonly distances: readonly number[]
  readonly axes: readonly (readonly [number, number, number])[]
  readonly driftReads: readonly number[]
}

// fixed before the first run of E-GRV-0061
export const CROWD: CrowdSettings = {
  side: 24,
  threshold: 32,
  radius: 2,
  crowdCounter: 1,
  offsets: 4,
  beats: 32,
  reach: 5,
  impacts: [0, 3, 4, 5, 6],
  distances: [4, 5, 6, 8],
  axes: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  driftReads: [16, 32],
}

export type CrowdConfig = 'none' | 'crowd' | 'flip' | 'old'
export const CROWD_CONFIGS: readonly CrowdConfig[] = [
  'none',
  'crowd',
  'flip',
  'old',
]
export type DriftConfig = 'none' | 'crowd' | 'flip'
export const DRIFT_CONFIGS: readonly DriftConfig[] = [
  'none',
  'crowd',
  'flip',
]

export type CrowdMember = {
  name: string
  // per config and impact index (beats + 1: never within the window)
  arrival: Record<CrowdConfig, number[]>
  behind: Record<CrowdConfig, number[]>
  back: Record<CrowdConfig, number[]>
  planeBeat: Record<CrowdConfig, number[]>
  planeY: Record<CrowdConfig, number[]>
  // per config, read beat index, distance index, axis index: the displacement toward the crowd
  drift: Record<DriftConfig, number[][][]>
  exact: boolean
  noneIsOld: boolean
  returns: boolean
  // the crowd config: energy in the ball at the end over at the start, the crowd's takes, outside docks paused
  retained: number
  crowdTakes: number
  crowdDockBeats: number
  outsidePaused: number
  maxOutsideEnergy: number
  turned: number
  seconds: number
}

type Run = { forward: () => void; content: () => Reduced }

const columnIndex = (side: number, p: readonly number[]): number => {
  const m = (v: number): number => ((v % side) + side) % side

  return m(p[0]!) + side * m(p[1]!) + side * side * m(p[2]!)
}

function crowdMember(
  member: ReturnType<typeof startFamily>[number],
  k: number,
  S: CrowdSettings,
): CrowdMember {
  const started = Date.now()
  const box: ArrowBox = withStart(member, () => arrowBox(S.side, 4))
  const law = occupancyLaw(S.threshold)
  const g = gatedTake(box, law)
  const columns = S.side ** 3
  const ball = ballDocks(box, S.radius, [0, 0, 0])
  const vacuum = restState(vacuumState(box), box.cells)
  const starts: Record<CrowdConfig, GatedState> = {
    none: vacuum,
    crowd: crowdStart(box, vacuum, {
      docks: ball,
      phase: k,
      sign: 1,
      counter: S.crowdCounter,
    }),
    flip: crowdStart(box, vacuum, {
      docks: ball,
      phase: k,
      sign: -1,
      counter: S.crowdCounter,
    }),
    old: crowdStart(box, vacuum, {
      docks: ball,
      phase: k,
      sign: 1,
      counter: S.crowdCounter,
    }),
  }

  let exact = true
  let turned = 0

  const tally: BeatTally = { active: 0, turned: 0, upper: 0 }

  const runOf = (c: CrowdConfig, s: GatedState): Run => {
    if (c === 'old') {
      const r = twoWay(box, s.s)

      return { forward: () => r.forward(), content: () => r.state() }
    }

    const r = gatedRunner(g, s)

    return {
      forward: () => {
        tally.turned = 0
        r.forward(tally)
        turned += tally.turned
      },
      content: () => r.state().s,
    }
  }

  // THE BASE RUNS: per beat content hashes, and the column energies at the drift reads; the crowd run's own readings
  const baseA: Record<CrowdConfig, Int32Array[]> = {
    none: [],
    crowd: [],
    flip: [],
    old: [],
  }
  const baseB: Record<CrowdConfig, Int32Array[]> = {
    none: [],
    crowd: [],
    flip: [],
    old: [],
  }
  const baseEnergy: Record<DriftConfig, Map<number, Float64Array>> = {
    none: new Map(),
    crowd: new Map(),
    flip: new Map(),
  }

  let noneIsOld = true
  let crowdTakes = 0
  let crowdDockBeats = 0
  let outsidePaused = 0
  let maxOutsideEnergy = 0
  let returns = true

  const ballEnergy = (s: Reduced): number => {
    let e = 0

    for (let x = 0; x < box.cells; x++) {
      if (ball[x]) {
        e += dockEnergy(s, x)
      }
    }

    return e
  }

  const retained0 = ballEnergy(starts.crowd.s)

  let retained = 0

  for (const c of CROWD_CONFIGS) {
    const gatedCrowd =
      c === 'crowd' ? gatedRunner(g, starts.crowd) : undefined
    const r = gatedCrowd
      ? {
          forward: () => gatedCrowd.forward(),
          content: () => gatedCrowd.state().s,
        }
      : runOf(c, starts[c])
    const plain = c === 'none' ? twoWay(box, vacuum.s) : undefined
    const e0 = energyOf(starts[c].s)
    const q0 = chargeOf(starts[c].s)

    for (let t = 1; t <= S.beats; t++) {
      if (gatedCrowd) {
        const before = gatedCrowd.state()

        for (let x = 0; x < box.cells; x++) {
          if (ball[x]) {
            crowdDockBeats++

            if (before.counter[x] === 0) {
              crowdTakes++
            }
          } else if (before.counter[x] !== 0) {
            outsidePaused++
          }
        }
      }

      r.forward()

      const s = r.content()

      if (energyOf(s) !== e0 || chargeOf(s) !== q0) {
        exact = false
      }

      if (plain) {
        plain.forward()

        if (!sameReduced(s, plain.state())) {
          noneIsOld = false
        }
      }

      if (c === 'crowd') {
        for (let x = 0; x < box.cells; x++) {
          if (!ball[x]) {
            maxOutsideEnergy = Math.max(
              maxOutsideEnergy,
              dockEnergy(s, x),
            )
          }
        }
      }

      const a = new Int32Array(columns)
      const b = new Int32Array(columns)

      contentHashes(box, s, a, b)
      baseA[c].push(a)
      baseB[c].push(b)

      if (c !== 'old' && S.driftReads.includes(t)) {
        const e = new Float64Array(columns)

        columnEnergy(box, s, e)
        baseEnergy[c].set(t, e)
      }
    }

    if (gatedCrowd) {
      retained = ballEnergy(gatedCrowd.state().s) / retained0

      for (let t = 0; t < S.beats; t++) {
        gatedCrowd.backward()
      }

      returns =
        sameReduced(gatedCrowd.state().s, starts.crowd.s) &&
        gatedCrowd.time() === 0

      for (let x = 0; x < box.cells; x++) {
        if (gatedCrowd.state().counter[x] !== starts.crowd.counter[x]) {
          returns = false
        }
      }
    }
  }

  // THE SIGNAL
  const never = S.beats + 1
  const arrival = {} as Record<CrowdConfig, number[]>
  const behind = {} as Record<CrowdConfig, number[]>
  const back = {} as Record<CrowdConfig, number[]>
  const planeBeat = {} as Record<CrowdConfig, number[]>
  const planeY = {} as Record<CrowdConfig, number[]>
  const plane = Array.from({ length: columns }, (_, c) => c).filter(
    c => columnPosition(c, S.side)[0] === S.reach,
  )
  const ha = new Int32Array(columns)
  const hb = new Int32Array(columns)

  for (const c of CROWD_CONFIGS) {
    arrival[c] = []
    behind[c] = []
    back[c] = []
    planeBeat[c] = []
    planeY[c] = []

    for (const b of S.impacts) {
      const twin = cloneGated(starts[c])

      twin.s = twinStart(box, starts[c].s, [-S.reach, b, 0])

      const r = runOf(c, twin)
      const det = columnIndex(S.side, [S.reach, b, 0])
      const beh = columnIndex(S.side, [S.reach + 2, b, 0])
      const bak = columnIndex(S.side, [-S.reach - 2, b, 0])

      let fa = never
      let fb = never
      let fk = never
      let fp = never
      let py = Number.NaN

      for (let t = 1; t <= S.beats; t++) {
        r.forward()
        contentHashes(box, r.content(), ha, hb)

        const A = baseA[c][t - 1]!
        const B = baseB[c][t - 1]!
        const differs = (col: number): boolean =>
          ha[col] !== A[col] || hb[col] !== B[col]

        if (fa === never && differs(det)) {
          fa = t
        }

        if (fb === never && differs(beh)) {
          fb = t
        }

        if (fk === never && differs(bak)) {
          fk = t
        }

        if (fp === never) {
          let n = 0
          let y = 0

          for (const col of plane) {
            if (!differs(col)) {
              continue
            }

            n++
            y += ring(columnPosition(col, S.side)[1], S.side)
          }

          if (n > 0) {
            fp = t
            py = y / n
          }
        }
      }

      if (c !== 'old') {
        const s = r.content()

        if (
          energyOf(s) !== energyOf(twin.s) ||
          chargeOf(s) !== chargeOf(twin.s)
        ) {
          exact = false
        }
      }

      arrival[c].push(fa)
      behind[c].push(fb)
      back[c].push(fk)
      planeBeat[c].push(fp)
      planeY[c].push(py)
    }
  }

  // THE DRIFT
  const drift = {} as Record<DriftConfig, number[][][]>
  const excess = new Float64Array(columns)
  const col = new Float64Array(columns)

  for (const c of DRIFT_CONFIGS) {
    drift[c] = S.driftReads.map(() =>
      S.distances.map(() => S.axes.map(() => 0)),
    )

    S.distances.forEach((r0, i) => {
      S.axes.forEach((axis, j) => {
        const at = axis.map(a => a * r0)
        const toward = axis.map(a => -a) as unknown as [
          number,
          number,
          number,
        ]
        const blob = gasFill(box, starts[c], {
          perDock: 1,
          phase: k,
          only: ballDocks(box, 1, at),
        })
        const r = runOf(c, blob)

        for (let t = 1; t <= S.beats; t++) {
          r.forward()

          const read = S.driftReads.indexOf(t)

          if (read < 0) {
            continue
          }

          columnEnergy(box, r.content(), col)

          const base = baseEnergy[c].get(t)!

          for (let x = 0; x < columns; x++) {
            excess[x] = col[x]! - base[x]!
          }

          drift[c][read]![i]![j] = towardKnot(
            excess,
            S.side,
            at as unknown as [number, number, number],
            toward,
          ).shift
        }
      })
    })
  }

  return {
    name: member.name,
    arrival,
    behind,
    back,
    planeBeat,
    planeY,
    drift,
    exact,
    noneIsOld,
    returns,
    retained,
    crowdTakes,
    crowdDockBeats,
    outsidePaused,
    maxOutsideEnergy,
    turned,
    seconds: (Date.now() - started) / 1000,
  }
}

export function crowdSurvey(
  log?: (what: string) => void,
  settings: CrowdSettings = CROWD,
): CrowdMember[] {
  return startFamily(settings.offsets).map((member, k) => {
    const m = crowdMember(member, k, settings)

    log?.(`${m.name} ${m.seconds.toFixed(0)}s`)

    return m
  })
}
