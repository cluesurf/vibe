// Curvature counted in SHARED HISTORY around a dense cluster (E-GRV-0073), the source-side companion of E-GRV-0072 as
// E-GRV-0065 and 0069 were of 0064 and 0068. Nothing in the rule is changed or added: the same reading
// (code/measure/shared-history), on the working vacuum with and without a cluster.
//
// THE VACUUM: the working one of E-GRV-0072 (vetoBeat, veto 'none', pass contact, every stored pair closed), side 16.
//
// THE CLUSTER, a DISCLOSED STAND-IN for the initial condition only. The rule makes no cluster of its own to read: the
// knit cannot bind (E-GRV-0056), a like knot of E-RLT-0103 is two vibes, and the working vacuum is periodic in space
// and time (probe 1 of E-GRV-0072: period 12, every label within 4 steps of home), so it has no single densest region.
// So a surplus is placed at beat 0 and the rule is left alone from then on: in every dock whose husk column is within
// mesh distance 1 of the center column (the column of code/measure/wall-reading centerOf, 19 columns of 16 docks), one
// vibe on the first slot of every line whose store is empty (the slots are all empty at beat 0), point 0, closed.
//   love     every placed vibe a love
//   fear     every placed vibe a fear (the source flipped, the vacuum unchanged)
//   control  nothing placed: the working vacuum itself
//
// THE READING. N_T(A, B), meetings in [T - W, T) whose labels sit at T in columns A and B (code/measure/shared-history),
// W = 12, T = 12, 24, 36, 48. The local element of the relational metric at distance r from the center:
//   N1(r) = the mean of N_T(A, B) over ordered column pairs with mesh(A, B) = 1 (the 18 axis and face-diagonal steps)
//           and mesh(center, A) = r
// and the relational distance of one mesh step in the power form of E-GRV-0072, d ~ N^(-1/2), relative to the control:
//   deficit(r) = 1 - sqrt(N1_control(r) / N1_state(r))
// positive where the relational distance SHRINKS toward the cluster. Members: the start family's first five; errors by
// jackknife over them, each member's three states taken together.
//
// Gates, fixed before the first run of this file. Read at T = 12 (the first window, the cluster at its most compact).
//  K0 instrument: on every run the labeled configuration equals the rule's own beat at every beat, labels sound, and
//     the second pass repeats the first
//  K1 a background: the control's N1(r) is above 0 at every r = 0 to 8
//  K2 the cluster curves it as 1/r: with the love cluster, deficit(r) is above 3 errors and above 0 at every r = 2 to 6
//     (outside the cluster), and the least-squares slope of ln deficit(r) on ln r over r = 2 to 6 lies in [-1.25, -0.75]
//  K3 charge blind: at every r = 0 to 8 the love and fear deficits differ by at most 3 jackknife errors of the
//     difference plus 1e-9
// Verdict: partial if K0 fails; pass if K1, K2 and K3 hold; fail otherwise.
// Reported, not gated: N1(r) of all three states at every read beat, the deficits at every read beat, the log slope, how
// many placed labels are still within mesh 2 of the center at each read beat.
//
// PREDICTED, before any run: fail on K2. The placed vibes are not bound, so the surplus leaves along the stream and its
// extra meetings follow it; and E-GRV-0072's probe found the vacuum's relation of finite range, so a deficit, if any,
// has no 1/r tail to carry. K3 is not predicted: flipping the source alone is not a symmetry of the rule.
//
// PROBES: none of this file's own; E-GRV-0072's tmp/grv72-probe1 to 3 (timing, label soundness, the vacuum's period).
// The prediction's "finite range" came from probe 1 on side 8 and was wrong (E-GRV-0072's first run): on side 16 the
// vacuum's relation spans the torus.
//
// FIRST RUN (425 s, tmp/grv73-run1.log): fail on K2 and K3, recorded as is, no gate moved. K0 holds on all 15 runs, and
// the five starts agree bit for bit, so every jackknife error is 0. K1 holds: the control's N1(r) is 57.9 to 88.0 at
// r = 0 to 8. K2 FAILS WITH THE WRONG SIGN: the 2,816 placed loves LOWER the neighbor meeting count near them (love N1
// 21.8, 29.3, 28.0, 37.4, 47.5 at r = 0 to 4, against the control's 88.0, 57.9, 69.2, 64.4, 67.0), so the relational
// distance GROWS toward the cluster: deficit -0.571, -0.312, -0.187, -0.073, -0.033 at r = 2 to 6, a front falling
// about as r^-2.6 in size, not a well; the log of a negative deficit is undefined, so the slope reads NaN. The surplus
// breaks the vacuum's 12-beat cycle: by T = 24 the neighbor count is about 30 at EVERY r (deficit near -0.45 across
// the torus) and stays there at T = 36 and 48, and the ordered meeting pairs per window fall from 51.4 million to 24.7
// million. The placed labels do not stay together: 140, 188, 176, 68 of 2,816 are within mesh 2 of the center at
// T = 12 to 48. K3 FAILS by an exact difference: love and fear agree to 0.3% far out (r = 3 to 8, differences at most
// 2.5e-3) but not at the cluster (love minus fear -0.104 at r = 0, 0.051 at r = 1, -0.045 at r = 2), since flipping
// the source alone is not a symmetry of the rule. Title written after the run.
//
// Depth L2. Read on the husk. DETERMINISM: no random number; the start family. NOTHING MOVES: each slot takes its
// neighbor's value; a label only records which value was taken where.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { jackknife, meshDistance } from '@/code/measure/shared-distance'
import {
  historyRun,
  torus,
  type HistoryRun,
} from '@/code/measure/shared-history'

const SIDE = 16
const READS = [12, 24, 36, 48]
const WINDOW = 12
const PRIMARY = 0
const MEMBERS = 4
const RMAX = 8
const STATES = ['control', 'love', 'fear'] as const

type State = (typeof STATES)[number]

function place(
  start: Configuration,
  column: Int32Array,
  center: number,
  t: ReturnType<typeof torus>,
  sign: number,
): number {
  let placed = 0

  for (let x = 0; x < column.length; x++) {
    if (
      meshDistance(Array.from(t.vector[t.delta(center, column[x]!)]!)) >
      1
    ) {
      continue
    }

    for (let l = 0; l < 12; l++) {
      if (start.store[x * 12 + l] !== 0) {
        continue
      }

      const s = x * 24 + LINE_FIRSTS[l]!

      if (start.vibe[s] !== 0) {
        throw new Error(
          'shared-history-curvature: a slot is not empty at beat 0',
        )
      }

      start.vibe[s] = sign
      placed++
    }
  }

  return placed
}

export default experiment({
  id: 'gravity/shared-history-curvature',
  code: 'E-GRV-0073',
  title:
    "no curvature from shared history around a cluster on the working vacuum, fail on K2 and K3, with the wrong sign: 2,816 loves placed in the 19 center columns (side 16, 5 starts that agree bit for bit, the labeled beat the rule's on all 15 runs) LOWER the count of recent meetings between neighboring columns near them (21.8 at the center against the vacuum's 88.0, and 28.0, 37.4, 47.5 at r = 2 to 4 against 69.2, 64.4, 67.0), so relational distance grows toward the cluster, a deficit of -0.57, -0.31, -0.19, -0.07, -0.03 at r = 2 to 6 that is a front, not a 1/r well; the surplus breaks the vacuum's 12-beat cycle and by T = 24 halves the neighbor count everywhere (about 30 at every r); the placed vibes disperse (68 of 2,816 within 2 of the center at T = 48); love and fear agree to 2.5e-3 far out but differ by 0.10 at the center, so the reading is not exactly charge-blind",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const t = torus(SIDE)
    const steps: number[] = []

    for (let d = 1; d < t.columns; d++) {
      if (meshDistance(Array.from(t.vector[d]!)) === 1) {
        steps.push(d)
      }
    }

    const isStep = new Uint8Array(t.columns)

    for (const d of steps) {
      isStep[d] = 1
    }

    let center = -1
    let rOf: Int32Array | undefined

    const shellPairs = new Float64Array(RMAX + 1)

    let placedCount = 0

    // per member: [state][read][r] shell sums, flattened, plus the member count
    const perMember = startFamily(MEMBERS).map(member =>
      withStart(member, () => {
        const f = contactFresh(SIDE, 'pass')
        const column = boxHusk(f.weave.mesh, SIDE).column

        if (!rOf) {
          center = column[centerOf(SIDE)]!
          rOf = Int32Array.from({ length: t.columns }, (_, a) =>
            meshDistance(Array.from(t.vector[t.delta(center, a)]!)),
          )

          for (let a = 0; a < t.columns; a++) {
            if (rOf[a]! <= RMAX) {
              shellPairs[rOf[a]!]! += steps.length
            }
          }
        }

        const r = rOf
        const sums = new Float64Array(
          STATES.length * READS.length * (RMAX + 1) + 1,
        )
        const runs: HistoryRun[] = []
        const near: number[][] = []

        sums[sums.length - 1] = 1
        STATES.forEach((state: State, si) => {
          const start = toWords(vacuumConfiguration(f, 'none'))
          const vacuumLabels = start.store.reduce(
            (a, s) => a + (s !== 0 ? 2 : 0),
            0,
          )
          const placed =
            state === 'control'
              ? 0
              : place(
                  start,
                  column,
                  center,
                  t,
                  state === 'love' ? 1 : -1,
                )

          if (state === 'love') {
            placedCount = placed
          }

          const nearBy: number[] = []
          const run = historyRun({
            kind: 'none',
            tables: f.tables,
            start,
            column,
            reads: READS,
            window: WINDOW,
            visit: (k, a, b) => {
              if (!isStep[t.delta(a, b)]) {
                return
              }

              const ra = r[a]!

              if (ra <= RMAX) {
                sums[(si * READS.length + k) * (RMAX + 1) + ra]! += 1
              }
            },
            onRead: (k, columns) => {
              let n = 0

              for (let u = vacuumLabels; u < columns.length; u++) {
                if (r[columns[u]!]! <= 2) {
                  n++
                }
              }

              nearBy[k] = n
            },
          })

          runs.push(run)
          near.push(nearBy)
          console.error(
            `${member.name} ${state}: placed ${placed}, ${JSON.stringify(run)}, placed labels within 2 of the center by read ${JSON.stringify(nearBy)} ${Math.round((Date.now() - started) / 1000)}s`,
          )
        })

        return { sums, runs, near }
      }),
    )

    const sums = perMember.map(p => p.sums)
    const at = (si: number, k: number, rr: number): number =>
      (si * READS.length + k) * (RMAX + 1) + rr
    const n1 = (
      total: Float64Array,
      si: number,
      k: number,
      rr: number,
    ): number =>
      total[at(si, k, rr)]! /
      (shellPairs[rr]! * total[total.length - 1]!)
    const deficitOf = (
      total: Float64Array,
      si: number,
      k: number,
      rr: number,
    ): number =>
      1 - Math.sqrt(n1(total, 0, k, rr) / n1(total, si, k, rr))
    const rs = Array.from({ length: RMAX + 1 }, (_, i) => i)
    const outside = [2, 3, 4, 5, 6]

    const k0 = perMember.every(p =>
      p.runs.every(x => x.matchesRule && x.sound && x.repeatable),
    )
    const control = rs.map(rr =>
      jackknife(sums, total => n1(total, 0, PRIMARY, rr)),
    )
    const k1 = control.every(x => x.value > 0)
    const love = rs.map(rr =>
      jackknife(sums, total => deficitOf(total, 1, PRIMARY, rr)),
    )
    const fear = rs.map(rr =>
      jackknife(sums, total => deficitOf(total, 2, PRIMARY, rr)),
    )
    const flip = rs.map(rr =>
      jackknife(
        sums,
        total =>
          deficitOf(total, 1, PRIMARY, rr) -
          deficitOf(total, 2, PRIMARY, rr),
      ),
    )
    const positive = outside.every(
      rr =>
        love[rr]!.value > 3 * love[rr]!.error && love[rr]!.value > 0,
    )
    const xs = outside.map(rr => Math.log(rr))
    const ys = outside.map(rr =>
      love[rr]!.value > 0 ? Math.log(love[rr]!.value) : NaN,
    )
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length
    const my = ys.reduce((a, b) => a + b, 0) / ys.length
    const slope = ys.every(Number.isFinite)
      ? xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) /
        xs.reduce((a, x) => a + (x - mx) ** 2, 0)
      : NaN
    const k2 =
      positive &&
      Number.isFinite(slope) &&
      slope >= -1.25 &&
      slope <= -0.75
    const k3 = flip.every(x => Math.abs(x.value) <= 3 * x.error + 1e-9)
    const status = !k0 ? 'partial' : k1 && k2 && k3 ? 'pass' : 'fail'

    const e = (v: number): string =>
      Number.isFinite(v) ? v.toPrecision(4) : String(v)
    const pooled = new Float64Array(sums[0]!.length)

    for (const s of sums) {
      for (let i = 0; i < pooled.length; i++) {
        pooled[i]! += s[i]!
      }
    }

    const profile = READS.map(
      (T, k) =>
        `T ${T}: ${STATES.map((s, si) => `${s} N1 [${rs.map(rr => e(n1(pooled, si, k, rr))).join(', ')}]`).join('; ')}; deficit love [${rs.map(rr => e(deficitOf(pooled, 1, k, rr))).join(', ')}], fear [${rs.map(rr => e(deficitOf(pooled, 2, k, rr))).join(', ')}]`,
    ).join('. ')

    return verdict({
      status,
      claim: `working vacuum (side ${SIDE}, window ${WINDOW}, read at T = ${READS[PRIMARY]}) around a placed cluster of ${placedCount} vibes: instrument ${k0}; background (control N1 > 0 at r = 0..${RMAX}) ${k1}; love deficit at r = 2..6 [${outside.map(rr => `${e(love[rr]!.value)} +- ${e(love[rr]!.error)}`).join(', ')}], log slope ${e(slope)}, K2 ${k2}; charge blind ${k3} (love minus fear at r = 0..${RMAX}: [${flip.map(x => e(x.value)).join(', ')}])`,
      metrics: {
        gate_K0: k0 ? 1 : 0,
        gate_K1: k1 ? 1 : 0,
        gate_K2: k2 ? 1 : 0,
        gate_K3: k3 ? 1 : 0,
        placed: placedCount,
        slope: Number.isFinite(slope) ? slope : -999,
        ...Object.fromEntries(
          rs.map(rr => [`deficitLove_r${rr}`, love[rr]!.value]),
        ),
        ...Object.fromEntries(
          rs.map(rr => [`deficitFear_r${rr}`, fear[rr]!.value]),
        ),
        ...Object.fromEntries(
          rs.map(rr => [`controlN1_r${rr}`, control[rr]!.value]),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        controlN1Min: Math.min(...control.map(x => x.value)),
        controlN1Max: Math.max(...control.map(x => x.value)),
      },
      notes: `L2. Center column ${center}. Shell pair counts [${Array.from(shellPairs).join(', ')}]. Placed labels within mesh 2 of the center at each read (love, fear) per member: ${perMember.map(p => JSON.stringify([p.near[1], p.near[2]])).join('; ')}. Errors at T = ${READS[PRIMARY]}: love [${love.map(x => e(x.error)).join(', ')}], difference [${flip.map(x => e(x.error)).join(', ')}]. Profiles: ${profile}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
