// Gravity from the wake, the rule: where does the mesh's growth enter the dynamics today, and what is the simplest local,
// deterministic, integer rule in which growth waits on occupancy, so the mesh grows more slowly where it is full
// (E-GRV-0066)? The idea: time is the wake (the growth, E-CSM-0007, E-GMT-0027), so a region whose growth waits on its
// occupancy would run behind, a time dilation built from the arrow the model already has, charge-blind since occupancy
// has no sign.
//
// THE READING, stated before any run (code/measure/gated-wake, header): the adopted knit runs on the closed D4 box, its
// stream a permutation of the box's slots, and no part of the beat reads a dock's birth. The growth is computed apart
// from the knit and takes no state. So the husk dynamics never sees growth, and it cannot see it without a change to the
// knit: on a region that is still growing, the edge slots take from docks that do not exist yet, so an edge rule would
// have to be added. And growth happens only at the open edge: inside the grown region every dock already exists and
// beats with the rest, so a gate on growth can delay a dock's BIRTH (a fixed offset) and cannot change the rate at which
// a born dock's time runs. Gating the local beat itself, inside the grown region, is the occupancy-gated take of
// E-GRV-0060 and E-GRV-0061 (another line of work, not repeated here): the knit must stay reversible there, and
// E-GRV-0060's witness N1 shows a plain wait (take-or-keep) loses a vibe.
//
// THE RULE (code/measure/gated-wake): the wake from one seed dock, where a born dock opens onto its unborn neighbors
// 1 + w(E) beats after its birth, w(E) = max(0, E - 32), E the dock's energy (E-GRV-0060's law read as a wait). With
// every w = 0 it is the plain wake. Irreversible by design (a born dock is never unborn); the knit is untouched.
//
// Gates, fixed before the first run of this file:
//  G1 the knit is closed and reversible: on every member (3 link starts) at side 16 the stream is a permutation of the
//     box's slots, and the knit run 12 beats forward and 12 back from a crowd (husk ball of radius 2, both signs)
//     returns the start exactly
//  G2 growth cannot enter the knit unchanged: on the plain wake from one dock at side 16, the region born by beat t has
//     open edge slots (a born dock's slot whose stream source is unborn) at every t = 0 .. 7
//  G3 the old wake kept where occupancy is the vacuum's: on every member no dock of the vacuum holds more than 32 at
//     any beat 0 .. 12 of the knit, and the gated wake on the vacuum's energies equals the plain wake at every dock
//  G4 uniform occupancy: every dock full (48), the gated wake is the plain wake at 17 beats a shell, at every dock
//  G5 charge-blind: the crowd and the same crowd with every charge flipped give the same energy at every dock and the
//     same birth at every dock, on every member
//  G6 the gate acts: the crowd's wake differs from the plain wake at some dock
// Verdict: pass if all hold (the reading and the rule as stated); fail otherwise.
//
// DISCLOSED: one probe before this file (tmp/grv66-probe1.ts) timed the box build at sides 16 and 32 (1.1 s, 7.1 s, 720
// MB heap at 32) and checked every dock's 24 stream targets are 24 distinct docks; it read no crowd, growth or gate. A
// first launch of the run failed on a module path in the runner script before any code of this file ran.
//
// FIRST RUN (tmp/grv0066-run1.log, 8.7 s, the record): pass, every gate. Title written after the run.
//
// Depth L2: exact checks of the knit and of a constructed growth rule on the adopted knit's own box, vacuum and crowds.
// DETERMINISM: link starts and Weyl fills; nothing is drawn. NOTHING MOVES: the knit's slots take their neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  arrowBox,
  twoWay,
  vacuumState,
} from '@/code/measure/second-law-husk'
import { sameReduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  ballDocks,
  crowdStart,
  dockEnergy,
  gatedTake,
  restState,
} from '@/code/measure/gated-take'
import {
  WAKE_THRESHOLD,
  gatedWake,
  openEdgeSlots,
  shellCounts,
  wakeWait,
} from '@/code/measure/gated-wake'

export const WAKE_RULE = {
  side: 16,
  offsets: 2,
  radius: 2,
  crowdCenter: [4, 0, 0],
  knitBeats: 12,
  edgeBeats: 7,
  full: 48,
} as const

const same = (a: Int32Array, b: Int32Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

export default experiment({
  id: 'gravity/gated-wake-rule',
  code: 'E-GRV-0066',
  title:
    "growth never enters the husk dynamics, and the simplest occupancy-gated wake keeps every law where occupancy is uniform, pass: the adopted knit's stream is a permutation of the closed box (side 16, 3 starts) and runs a crowd 12 beats forward and back to the bit, so no beat reads a dock's birth; the knit cannot run unchanged on a growing region, whose edge has 24, 360, 1560, 4200, 8856, 16104, 26520, 40680 slots taking from unborn docks at beats 0 to 7; the rule (a born dock opens onto its unborn neighbors 1 + max(0, E - 32) beats after its birth) equals the plain wake on the vacuum (dock energy at most 24), runs at exactly 17 beats a shell at full occupancy, gives the same birth at every dock for a crowd and its charge flip, and delays births in and near a crowd by up to 17 beats; growth happens only at the open edge and the knit beats every born dock alike, so the gate can shift a dock's birth and cannot change its clock rate",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const S = WAKE_RULE
    const members = startFamily(S.offsets)
    const cells = S.side ** 4
    const zero = new Int32Array(cells)
    const plain = gatedWake(S.side, zero, 0)
    const full = gatedWake(
      S.side,
      new Int32Array(cells).fill(wakeWait(S.full)),
      0,
    )

    let g1 = true
    let g3 = true
    let g5 = true
    let g6 = false
    let vacuumMax = 0
    let crowdDocks = 0
    let changedDocks = 0
    let maxOffset = 0
    let edge: number[] = []

    const memberNotes: string[] = []

    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(S.side, 4))
      const g = gatedTake(box, {
        name: 'none',
        top: 1,
        length: () => 1,
      })
      const source = g.source
      // G1: the stream is a permutation (gatedTake throws otherwise) covering every slot
      const covered = new Uint8Array(source.length)

      for (const s of source) {
        if (s >= 0) {
          covered[s] = 1
        }
      }

      if (!covered.every(v => v === 1)) {
        g1 = false
      }

      // G2 on the first member
      if (k === 0) {
        edge = Array.from({ length: S.edgeBeats + 1 }, (_, t) =>
          openEdgeSlots(source, plain, t),
        )
      }

      const vacuum = restState(vacuumState(box), box.cells)
      const ball = ballDocks(box, S.radius, S.crowdCenter)
      const crowd = crowdStart(box, vacuum, {
        docks: ball,
        phase: k,
        sign: 1,
        counter: 0,
      })
      const flip = crowdStart(box, vacuum, {
        docks: ball,
        phase: k,
        sign: -1,
        counter: 0,
      })

      // G1: forward and back
      for (const start of [crowd, flip]) {
        const r = twoWay(box, start.s)

        for (let t = 0; t < S.knitBeats; t++) {
          r.forward()
        }

        for (let t = 0; t < S.knitBeats; t++) {
          r.backward()
        }

        if (!sameReduced(r.state(), start.s) || r.time() !== 0) {
          g1 = false
        }
      }

      // G3: the vacuum's energies over the knit's beats, and the gated wake on them
      {
        const r = twoWay(box, vacuum.s)
        const e0 = new Int32Array(cells)

        for (let t = 0; t <= S.knitBeats; t++) {
          if (t > 0) {
            r.forward()
          }

          for (let x = 0; x < cells; x++) {
            const e = dockEnergy(r.state(), x)

            if (t === 0) {
              e0[x] = wakeWait(e)
            }

            vacuumMax = Math.max(vacuumMax, e)
          }
        }

        if (!same(gatedWake(S.side, e0, 0), plain)) {
          g3 = false
        }
      }

      // G5, G6
      const wc = Int32Array.from({ length: cells }, (_, x) =>
        wakeWait(dockEnergy(crowd.s, x)),
      )
      const wf = Int32Array.from({ length: cells }, (_, x) =>
        wakeWait(dockEnergy(flip.s, x)),
      )

      for (let x = 0; x < cells; x++) {
        if (dockEnergy(crowd.s, x) !== dockEnergy(flip.s, x)) {
          g5 = false
        }
      }

      const bc = gatedWake(S.side, wc, 0)
      const bf = gatedWake(S.side, wf, 0)

      if (!same(bc, bf)) {
        g5 = false
      }

      crowdDocks = ball.reduce((u, v) => u + v, 0)
      changedDocks = 0
      maxOffset = 0

      for (let x = 0; x < cells; x++) {
        const d = bc[x]! - plain[x]!

        if (d !== 0) {
          changedDocks++
        }

        maxOffset = Math.max(maxOffset, d)
      }

      if (changedDocks > 0) {
        g6 = true
      }

      memberNotes.push(
        `${member.name} ${((Date.now() - started) / 1000).toFixed(0)}s`,
      )
    })

    const g2 = edge.length === S.edgeBeats + 1 && edge.every(n => n > 0)
    const g3All = g3 && vacuumMax <= WAKE_THRESHOLD
    const g4 = plain.every(
      (b, x) => full[x] === (wakeWait(S.full) + 1) * b,
    )
    const gates = [g1, g2, g3All, g4, g5, g6]
    const status = gates.every(Boolean) ? 'pass' : 'fail'
    const shells = shellCounts(plain)

    return verdict({
      status,
      claim: `the knit's stream is a permutation of the closed box and returns a crowd after 12 beats back (${g1}); the plain wake's grown region has ${edge.join(', ')} open edge slots at beats 0 to ${S.edgeBeats}; vacuum dock energy at most ${vacuumMax} (threshold ${WAKE_THRESHOLD}), gated wake on the vacuum equal to the plain wake ${g3}; full occupancy runs the wake at ${wakeWait(S.full) + 1} beats a shell ${g4}; crowd and flipped crowd identical ${g5}; the crowd (${crowdDocks} docks) changes the birth of ${changedDocks} docks, by at most ${maxOffset} beats`,
      metrics: {
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3All ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        gate_G6: g6 ? 1 : 0,
        vacuumMaxDockEnergy: vacuumMax,
        crowdDocks,
        changedDocks,
        maxBirthOffset: maxOffset,
        ...Object.fromEntries(
          edge.map((n, t) => [`openEdgeSlots_t${t}`, n]),
        ),
        ...Object.fromEntries(
          shells.slice(0, 8).map((n, t) => [`plainShell_${t}`, n]),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        vacuumKeepsPlainWake: g3All ? 1 : 0,
        chargeFlipIdentical: g5 ? 1 : 0,
      },
      notes: `L2. Gates G1 ${g1}, G2 ${g2}, G3 ${g3All}, G4 ${g4}, G5 ${g5}, G6 ${g6}. Plain wake shells from one dock (side ${S.side}, the torus wraps past beat 8): ${shells.join(', ')}. Members: ${memberNotes.join(', ')}.`,
    })
  },
})
