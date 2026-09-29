// Gravity from the wake, the reading: near a crowd, does the occupancy-gated wake (E-GRV-0066) leave the husk's local
// time behind, does it delay a signal that crosses the crowd, and does the deficit fall as 1/r (E-GRV-0067)?
//
// THE RULE: code/measure/gated-wake (header). The wake from one seed dock on the adopted knit's D4 box; a born dock opens
// onto its unborn neighbors 1 + w(E) beats after its birth, w(E) = max(0, E - 32). A dock's local proper time at global
// beat t is t - born (the knit is global and reads no birth, E-GRV-0066), so the rule can only shift a dock's birth.
//
// THE SETUP, side 32 (the wake reaches husk distance 16 before the torus wraps): the seed dock at husk (0, 0, 0), a
// crowd filling the husk ball of radius 2 about (8, 0, 0) at full depth. THE OCCUPANCY FIELD is a disclosed stand-in: w
// = 16 on the crowd's docks (a crowd dock holds all 24 slots and 12 stores, E = 48) and 0 elsewhere (the vacuum holds
// at most 32, E-GRV-0066 G3). H1 checks the stand-in at side 16 against the real crowd states of both signs, and a
// crowd held static while the wake passes is itself a stand-in: the knit cannot bind (E-SPN-0067).
//
// THE READINGS, on the husk: a column's birth is the least birth of its docks (when the wake first reaches that husk
// point); its OFFSET is its birth with the crowd minus its birth without. Shell r = the husk distance from the crowd's
// center, rounded; only columns the plain wake reaches by beat 14 are read (no wrap). THE SIGNAL is the wake's own front,
// read on the axis behind the crowd, columns (8 + k, 0, 0) for k = 3 .. 6.
//
// Gates, fixed before the first run of this file:
//  H1 instrument: the uniform control (every dock w = 16) gives birth = 17 x plain at every dock; the stand-in field's
//     wake equals the wake on the real crowd's energies, and on the charge-flipped crowd's, at every dock at side 16 on
//     every member (3 link starts), with the crowd at (4, 0, 0) there
//  H2 a slower clock (a RATE): the mean proper-time deficit of shell 3 (far minus near, far = the plain wake's proper time)
//     at global beat t = 1000 exceeds its value at t = 100
//  H3 isotropic: more than half of the columns of shell 3 have offset >= 1
//  H4 1/r: the shell mean offset is positive at every r = 3 .. 6, and a / r fits it with R^2 >= 0.9
//  H5 a delayed signal: every axis column behind the crowd (k = 3 .. 6) has offset >= 1, not increasing with k
// Verdict: pass if all hold; fail if H1 holds and any of H2 to H5 fails; partial if H1 fails.
//
// Reported, not gated: per shell the columns read, the columns with offset >= 1, the mean and largest offset; the same
// per dock; the largest offset inside the crowd; the plain wake's shell counts.
//
// DISCLOSED: the probe of E-GRV-0066 (tmp/grv66-probe1.ts, box build cost only). No run of this file's readings before
// the gates above. A first launch failed on a module path in the runner script before any code of this file ran.
//
// FIRST RUN (tmp/grv0067-run1.log, 9.0 s, the record): fail on H2, H3, H4 and H5, H1 holds; recorded as is, no gate
// moved. Title written after the run.
//
// Depth L1: a constructed growth rule on the knit's substrate with an imposed occupancy field, against a no-crowd, a
// uniform and a charge-flipped control. DETERMINISM: nothing is drawn. NOTHING MOVES: no dock is moved or removed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, vacuumState } from '@/code/measure/second-law-husk'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  ballDocks,
  crowdStart,
  dockEnergy,
  restState,
} from '@/code/measure/gated-take'
import {
  gatedWake,
  huskBall,
  huskColumns,
  shellCounts,
  wakeWait,
} from '@/code/measure/gated-wake'

export const WAKE_DILATION = {
  side: 32,
  checkSide: 16,
  offsets: 2,
  radius: 2,
  center: [8, 0, 0],
  checkCenter: [4, 0, 0],
  full: 48,
  readBirth: 14,
  shells: [3, 4, 5, 6],
  behind: [3, 4, 5, 6],
  early: 100,
  late: 1000,
} as const

const same = (a: Int32Array, b: Int32Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

export default experiment({
  id: 'gravity/gated-wake-dilation',
  code: 'E-GRV-0067',
  title:
    "no time dilation from the occupancy-gated wake, fail on H2 to H5: past a crowd whose docks wait 16 beats (husk ball of radius 2, side 32), the wake reaches every husk column outside the crowd on time (0 of 98, 210, 350, 450 columns late at r = 3 to 6, and 0 at every r out to 22), so the offset has no 1/r (fit a = 0) and the front behind the crowd is not delayed (0 beats at k = 3 to 6): it goes round the crowd at no cost, the D4 mesh having many shortest paths; single docks at depths the crowd shadows are born up to 3 beats late, mean 0.079, 0.042, 0.017, 0.0088 at r = 3 to 6 and 0 from r = 7; the crowd's center column is reached 16 beats late; the proper-time deficit is a fixed offset that never grows (0 at t = 100 and t = 1000), since every born dock beats alike; the uniform control runs 17 times slower everywhere and the charge-flipped crowd is identical at every dock",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const S = WAKE_DILATION
    const members = startFamily(S.offsets)

    // H1: the stand-in against the real crowd states, at the check side
    let standIn = true

    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(S.checkSide, 4))
      const cells = box.cells
      const vacuum = restState(vacuumState(box), cells)
      const ball = ballDocks(box, S.radius, S.checkCenter)
      const stand = Int32Array.from(ball, v =>
        v ? wakeWait(S.full) : 0,
      )
      const expected = gatedWake(S.checkSide, stand, 0)

      for (const sign of [1, -1] as const) {
        const crowd = crowdStart(box, vacuum, {
          docks: ball,
          phase: k,
          sign,
          counter: 0,
        })
        const w = Int32Array.from({ length: cells }, (_, x) =>
          wakeWait(dockEnergy(crowd.s, x)),
        )

        if (!same(gatedWake(S.checkSide, w, 0), expected)) {
          standIn = false
        }
      }
    })

    // the side-32 wakes
    const side = S.side
    const cells = side ** 4
    const columns = huskColumns(side)
    const ball = huskBall(columns, side, S.radius, S.center)
    const crowdW = Int32Array.from(ball, v =>
      v ? wakeWait(S.full) : 0,
    )
    const plain = gatedWake(side, new Int32Array(cells), 0)
    const crowd = gatedWake(side, crowdW, 0)
    const uniform = gatedWake(
      side,
      new Int32Array(cells).fill(wakeWait(S.full)),
      0,
    )
    const uniformOk = plain.every(
      (b, x) => uniform[x] === (wakeWait(S.full) + 1) * b,
    )
    const h1 = standIn && uniformOk

    // column births
    const nCol = side ** 3
    const colPlain = new Int32Array(nCol).fill(0x7fffffff)
    const colCrowd = new Int32Array(nCol).fill(0x7fffffff)

    for (let x = 0; x < cells; x++) {
      const c = columns[x]!

      colPlain[c] = Math.min(colPlain[c]!, plain[x]!)
      colCrowd[c] = Math.min(colCrowd[c]!, crowd[x]!)
    }

    const ring = (d: number): number => {
      const m = ((d % side) + side) % side

      return m > side / 2 ? m - side : m
    }

    const shellOf = (c: number): number => {
      const p = [
        c % side,
        Math.floor(c / side) % side,
        Math.floor(c / (side * side)),
      ]
      const d2 = p.reduce(
        (acc, v, i) => acc + ring(v - (S.center[i] as number)) ** 2,
        0,
      )

      return Math.round(Math.sqrt(d2))
    }

    type Tally = {
      read: number
      delayed: number
      sum: number
      max: number
    }

    const blank = (): Tally => ({ read: 0, delayed: 0, sum: 0, max: 0 })
    const byColumn = new Map<number, Tally>()
    const byDock = new Map<number, Tally>()

    for (let c = 0; c < nCol; c++) {
      if (colPlain[c]! > S.readBirth) {
        continue
      }

      const r = shellOf(c)
      const t = byColumn.get(r) ?? blank()
      const d = colCrowd[c]! - colPlain[c]!

      t.read++
      t.sum += d
      t.max = Math.max(t.max, d)

      if (d >= 1) {
        t.delayed++
      }

      byColumn.set(r, t)
    }

    let insideMax = 0

    for (let x = 0; x < cells; x++) {
      if (plain[x]! > S.readBirth) {
        continue
      }

      const d = crowd[x]! - plain[x]!

      if (ball[x]) {
        insideMax = Math.max(insideMax, d)
      }

      const r = shellOf(columns[x]!)
      const t = byDock.get(r) ?? blank()

      t.read++
      t.sum += d
      t.max = Math.max(t.max, d)

      if (d >= 1) {
        t.delayed++
      }

      byDock.set(r, t)
    }

    const meanAt = (m: Map<number, Tally>, r: number): number => {
      const t = m.get(r)

      return t && t.read > 0 ? t.sum / t.read : 0
    }

    // H2: proper time since the plain birth, far (no crowd) and near (shell 3 with the crowd, born shell3 beats later on
    // average); the knit beats every born dock once a beat, so the deficit is far minus near at global beat t
    const shell3 = meanAt(byColumn, 3)
    const properFar = (t: number): number => t
    const properNear = (t: number): number => t - shell3
    const deficit = (t: number): number => properFar(t) - properNear(t)
    const h2 = deficit(S.late) > deficit(S.early)

    // H3
    const t3 = byColumn.get(3) ?? blank()
    const h3 = 2 * t3.delayed > t3.read

    // H4: a / r least squares through the origin in 1/r, R^2 against the mean
    const ys = S.shells.map(r => meanAt(byColumn, r))
    const xs = S.shells.map(r => 1 / r)
    const a =
      xs.reduce((u, x, i) => u + x * ys[i]!, 0) /
      xs.reduce((u, x) => u + x * x, 0)
    const yMean = ys.reduce((u, v) => u + v, 0) / ys.length
    const ssRes = ys.reduce((u, y, i) => u + (y - a * xs[i]!) ** 2, 0)
    const ssTot = ys.reduce((u, y) => u + (y - yMean) ** 2, 0)
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
    const h4 = ys.every(y => y > 0) && r2 >= 0.9

    // H5
    const axis = S.behind.map(k => {
      const c = (S.center[0] + k) % side

      return colCrowd[c]! - colPlain[c]!
    })
    const h5 =
      axis.every(d => d >= 1) &&
      axis.every((d, i) => i === 0 || d <= axis[i - 1]!)
    const status = !h1
      ? 'partial'
      : h2 && h3 && h4 && h5
        ? 'pass'
        : 'fail'
    const tallyNote = (m: Map<number, Tally>): string =>
      [...m.keys()]
        .sort((u, v) => u - v)
        .map(r => {
          const t = m.get(r)!

          return `r${r} ${t.delayed}/${t.read} delayed, mean ${(t.sum / t.read).toFixed(3)}, max ${t.max}`
        })
        .join('; ')
    const metrics: Record<string, number> = {
      gate_H1: h1 ? 1 : 0,
      gate_H2: h2 ? 1 : 0,
      gate_H3: h3 ? 1 : 0,
      gate_H4: h4 ? 1 : 0,
      gate_H5: h5 ? 1 : 0,
      standInMatchesKnitCrowd: standIn ? 1 : 0,
      uniformSeventeen: uniformOk ? 1 : 0,
      crowdDocks: ball.reduce((u, v) => u + v, 0),
      insideMaxOffset: insideMax,
      fitA: a,
      fitR2: r2,
      deficitEarly: deficit(S.early),
      deficitLate: deficit(S.late),
      seconds: (Date.now() - started) / 1000,
    }

    S.shells.forEach((r, i) => {
      metrics[`columnMeanOffset_r${r}`] = ys[i]!
      metrics[`columnDelayed_r${r}`] = byColumn.get(r)?.delayed ?? 0
      metrics[`columnRead_r${r}`] = byColumn.get(r)?.read ?? 0
      metrics[`dockMeanOffset_r${r}`] = meanAt(byDock, r)
      metrics[`dockDelayed_r${r}`] = byDock.get(r)?.delayed ?? 0
    })

    S.behind.forEach((k, i) => {
      metrics[`axisOffset_k${k}`] = axis[i]!
    })

    return verdict({
      status,
      claim: `the occupancy-gated wake past a crowd (husk ball radius 2 at (8, 0, 0), side 32, crowd docks wait 16): column offsets at r = ${S.shells.join(', ')}: mean ${ys.map(y => y.toFixed(3)).join(', ')} (a / r fit a = ${a.toFixed(3)}, R^2 = ${r2.toFixed(3)}); shell 3 delayed columns ${t3.delayed} of ${t3.read}; axis behind k = ${S.behind.join(', ')}: ${axis.join(', ')}; proper-time deficit ${deficit(S.early).toFixed(3)} at t = ${S.early} and ${deficit(S.late).toFixed(3)} at t = ${S.late}; largest offset inside the crowd ${insideMax}`,
      metrics,
      control: {
        uniformSeventeen: uniformOk ? 1 : 0,
        chargeFlipIdentical: standIn ? 1 : 0,
      },
      notes: `L1. Gates H1 ${h1} (stand-in ${standIn}, uniform ${uniformOk}), H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}. Columns by shell: ${tallyNote(byColumn)}. Docks by shell: ${tallyNote(byDock)}. Plain wake shells from one dock (side ${side}): ${shellCounts(plain).slice(0, 17).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
