// Distance as shared information around a knot (E-GRV-0065). If distance is shared information (E-GRV-0064 reads it on
// the vacuum), a knot that dresses its surroundings with correlations would pull the emergent distances near it short:
// a curvature, charge blind since the mutual information drops the correlation's sign. This file asks the existing rule.
// Nothing in the rule is changed or added.
//
// THE KNIT. As E-GRV-0064: the coset-union vacuum under the lone bounce collision, side 16, the gas of E-GRV-0056
// (8/24 per slot), 17 members (member k, gas phase k), 48 beats to settle, 192 settled beats.
//
// THE KNOT, a disclosed STAND-IN (code/measure/held-knot, the knot of E-GRV-0056 to 0058): the knit cannot bind
// (E-SPN-0067), so the rule makes no knot. A husk ball of radius 2 (33 columns) at husk column (8, 8, 8), full depth,
// HELD: its slots never stream and its docks never collide; an outside vibe whose stream would enter it takes the opposite
// slot of its own dock. Four runs per member:
//   lump     the knot holds a dense lump (every slot love or fear by a Weyl value)
//   flipped  the same lump with every vibe's sign reversed (the charge flipped)
//   empty    the knot holds no vibe (the zero-content control)
//   vacuum   no knot, the plain stream, the same gas on every dock
// The first three run in lockstep and the outside of each is compared with the lump's, slot by slot and store by store,
// at every beat.
//
// THE READING (code/measure/shared-distance). The connected correlation of axis-neighbor husk column pairs, both columns
// outside the knot, pooled per shell r (the rounded min-image distance from the knot's center to the pair's midpoint),
// r = 3 .. 7, over members and beats; per run its own member mean is removed. The Gaussian mutual information
// I = -1/2 ln(1 - rho^2). The emergent length of a neighbor pair is the power form of E-GRV-0064, so the DEFICIT of a run
// X against a reference Y in shell r is
//   delta = 1 - sqrt(I_Y / I_X)
// positive when the pair shares more information with the knot there, that is when the emergent distance shrinks. Errors:
// jackknife over the 17 members.
//
// A THEOREM OF THE STAND-IN, stated before any run: the collision is per dock and no stream crosses the surface, so the
// outside of lump, flipped and empty is the same bit for bit at every beat (E-GRV-0056 G1 checked it at side 24). If so,
// K4 below holds exactly and K5 fails exactly: a held knot's content has no way to reach the correlations outside it. The
// run checks the identity rather than assuming it, and measures what the SURFACE alone does to the emergent geometry.
//
// Gates, fixed before the first run of this file:
//  K1 instrument: energy and charge exact at every beat of all 68 runs; every held trit and point the same at the end as
//     at the start in the three knot runs
//  K2 shrinking: at the innermost shell r = 3 the vacuum's neighbor correlation is at least 3 errors from zero, and the
//     lump's deficit against the vacuum is positive by at least 3 errors
//  K3 a 1/r deficit: the lump's deficit against the vacuum is positive by at least 3 errors in at least 3 of the 5
//     shells, and the least-squares slope of ln delta on ln r over those shells lies in [-1.5, -0.5]
//  K4 charge blind: the flipped run's deficit minus the lump's is within 3 errors of zero in every shell
//  K5 the content, not the wall: the lump's deficit against the EMPTY knot is positive by at least 3 errors at r = 3
// Verdict: pass if all hold; fail if K1 holds and any of K2 to K5 fails; partial if K1 fails.
//
// Reported, not gated: rho per shell for the four runs, the empty knot's deficit against the vacuum (the surface's own
// effect on the emergent geometry), and the number of beats on which the three knot runs' outsides agree.
//
// DISCLOSED: no probe read any correlation before this file; tmp/grv64-probe.ts timed the build and counted a knot's
// columns. The shells and the radius were set from the side (16, min-image distances up to 8).
//
// FIRST RUN (797 s, the record): fail on K2, K3 and K5, recorded as is, no gate moved. K1 and K4 hold. The three knot
// runs' outsides agree bit for bit on 240 of 240 beats on all 17 members, so the content and charge-flip contrasts are
// exactly 0 (K4 holds exactly, K5 fails exactly, as the theorem said). The reference itself is empty: the vacuum's
// neighbor correlation is within 1.9 errors of zero in every shell (E-GRV-0064 found the same), and the knot runs'
// correlations are within 2.2 errors of zero in every shell (largest -1.27e-3 +- 5.7e-4 at r = 6). The deficits
// (-1.4 +- 12, -2.6 +- 79, 0.91 +- 0.57, 0.98 +- 0.25, 0.69 +- 0.69) are ratios of noise to noise. Only r = 6 is 3 errors
// from zero, a single shell far from the knot, not a profile. Title written after the run.
//
// Depth L2: a measurement on the adopted knit's own gas with a zero-content control, a charge-flip control and a no-knot
// reference. DETERMINISM: Weyl fills and the 17 link starts. NOTHING MOVES: the stream takes the neighbor's value, and a
// reflected vibe takes the opposite slot of its own dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox } from '@/code/measure/second-law-husk'
import {
  knotStart,
  knotStream,
  type KnotStream,
} from '@/code/measure/held-knot'
import { cloneReduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  fluctuations,
  gaussianInformation,
  jackknife,
  recordLockstep,
  recordRun,
  shellCorrelation,
  shellPairs,
  shellSums,
  type Recording,
  type ShellPairs,
} from '@/code/measure/shared-distance'

const SIDE = 16
const RADIUS = 2
const CENTER: [number, number, number] = [8, 8, 8]
const SHELLS = [3, 4, 5, 6, 7]
const PER_DOCK = 8
const SETTLE = 48
const SAMPLES = 192
const RUNS = ['lump', 'flipped', 'empty', 'vacuum'] as const

type Run = (typeof RUNS)[number]

export default experiment({
  id: 'gravity/shared-information-knot',
  code: 'E-GRV-0065',
  title:
    "no emergent curvature from shared information around a held knot on the adopted knit, fail on K2, K3 and K5: in the settled gas (side 16, 17 starts, 192 beats) a held husk ball of radius 2 leaves the axis-neighbor column correlation at zero within 2.2 errors in every shell r = 3 to 7 (largest -1.27e-3 +- 5.7e-4 at r = 6), as the no-knot vacuum is (within 1.9 errors), so the emergent-distance deficit is a ratio of noise (-1.4 +- 12, -2.6 +- 79, 0.91 +- 0.57, 0.98 +- 0.25, 0.69 +- 0.69), significant in 1 shell far from the knot and never in the innermost shell; the outsides of the dense lump, its charge-flipped copy and the empty knot agree bit for bit on 240 of 240 beats on all 17 members, so the reading is charge blind exactly and the knot's content changes nothing outside exactly (a theorem of the held-knot stand-in, checked); energy, charge and the held trits exact",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const members = startFamily(16)
    const recordings: Record<Run, Recording[]> = {
      lump: [],
      flipped: [],
      empty: [],
      vacuum: [],
    }

    let knot: KnotStream | undefined
    let outsideSameMin = Infinity

    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(SIDE, 1))
      const held = knotStream(box, RADIUS, CENTER)
      const plain = knotStream(box, -1, CENTER)
      const lump = knotStart(held, {
        perDock: PER_DOCK,
        phase: k,
        lump: true,
      })
      const flipped = cloneReduced(lump)

      for (let x = 0; x < box.cells; x++) {
        if (!held.held[x]) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          flipped.vibe[x * 24 + d] = -lump.vibe[x * 24 + d]!
        }
      }

      const empty = knotStart(held, {
        perDock: PER_DOCK,
        phase: k,
        lump: false,
      })
      const together = recordLockstep(
        held,
        [lump, flipped, empty],
        SETTLE,
        SAMPLES,
      )

      recordings.lump.push(together.recordings[0]!)
      recordings.flipped.push(together.recordings[1]!)
      recordings.empty.push(together.recordings[2]!)
      recordings.vacuum.push(
        recordRun(
          plain,
          knotStart(plain, {
            perDock: PER_DOCK,
            phase: k,
            lump: false,
          }),
          SETTLE,
          SAMPLES,
        ),
      )

      outsideSameMin = Math.min(
        outsideSameMin,
        together.outsideSameBeats,
      )
      knot = held
      log(`member ${member.name}`)
    })

    const pairs: ShellPairs = shellPairs(knot!, SHELLS)
    const sums: Record<Run, Float64Array[]> = {
      lump: shellSums(fluctuations(recordings.lump), pairs),
      flipped: shellSums(fluctuations(recordings.flipped), pairs),
      empty: shellSums(fluctuations(recordings.empty), pairs),
      vacuum: shellSums(fluctuations(recordings.vacuum), pairs),
    }

    log('sums')

    // joint per-member sums of two runs, so a jackknife sees both at once
    const width = SHELLS.length * 3
    const joined = (x: Run, y: Run): Float64Array[] =>
      members.map((_, m) => {
        const out = new Float64Array(width * 2)

        out.set(sums[x][m]!, 0)
        out.set(sums[y][m]!, width)

        return out
      })
    const info = (
      total: Float64Array,
      offset: number,
      s: number,
    ): number =>
      gaussianInformation(
        shellCorrelation(total.subarray(offset, offset + width), s),
      )
    // the deficit of run x against reference y in shell s: 1 - sqrt(I_y / I_x)
    const deficit = (x: Run, y: Run, s: number) =>
      jackknife(
        joined(x, y),
        total =>
          1 - Math.sqrt(info(total, width, s) / info(total, 0, s)),
      )
    const rho = (x: Run, s: number) =>
      jackknife(sums[x], total => shellCorrelation(total, s))
    const flipGap = (s: number) =>
      jackknife(
        members.map((_, m) => {
          const out = new Float64Array(width * 3)

          out.set(sums.flipped[m]!, 0)
          out.set(sums.lump[m]!, width)
          out.set(sums.vacuum[m]!, 2 * width)

          return out
        }),
        total =>
          1 -
          Math.sqrt(info(total, 2 * width, s) / info(total, 0, s)) -
          (1 -
            Math.sqrt(
              info(total, 2 * width, s) / info(total, width, s),
            )),
      )

    const shells = SHELLS.map((r, s) => ({
      r,
      pairs: pairs.pairs[s]!.length / 2,
      rho: Object.fromEntries(RUNS.map(x => [x, rho(x, s)])) as Record<
        Run,
        { value: number; error: number }
      >,
      lumpVacuum: deficit('lump', 'vacuum', s),
      emptyVacuum: deficit('empty', 'vacuum', s),
      lumpEmpty: deficit('lump', 'empty', s),
      flip: flipGap(s),
    }))

    const pos = (x: { value: number; error: number }): boolean =>
      x.value > 0 && x.value >= 3 * x.error
    const all = [
      ...recordings.lump,
      ...recordings.flipped,
      ...recordings.empty,
      ...recordings.vacuum,
    ]
    const g1 =
      all.every(r => r.exact) &&
      [
        ...recordings.lump,
        ...recordings.flipped,
        ...recordings.empty,
      ].every(r => r.heldSame)
    const inner = shells[0]!
    const g2 =
      Math.abs(inner.rho.vacuum.value) >= 3 * inner.rho.vacuum.error &&
      pos(inner.lumpVacuum)
    const positive = shells.filter(sh => pos(sh.lumpVacuum))
    const slope = (() => {
      if (positive.length < 2) {
        return 0
      }

      const xs = positive.map(sh => Math.log(sh.r))
      const ys = positive.map(sh => Math.log(sh.lumpVacuum.value))
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length
      const my = ys.reduce((a, b) => a + b, 0) / ys.length

      return (
        xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) /
        xs.reduce((a, x) => a + (x - mx) ** 2, 0)
      )
    })()
    const g3 = positive.length >= 3 && slope >= -1.5 && slope <= -0.5
    const g4 = shells.every(
      sh => Math.abs(sh.flip.value) <= 3 * sh.flip.error,
    )
    const g5 = pos(inner.lumpEmpty)
    const status = !g1
      ? 'partial'
      : g2 && g3 && g4 && g5
        ? 'pass'
        : 'fail'
    const e = (x: { value: number; error: number }): string =>
      `${x.value.toExponential(2)} +- ${x.error.toExponential(1)}`
    const beats = SETTLE + SAMPLES

    return verdict({
      status,
      claim: `a held knot (husk radius 2) in the settled gas of the adopted knit (side ${SIDE}, 17 starts, ${SAMPLES} beats): the emergent-distance deficit of axis-neighbor pairs, knot against no knot, at shells ${SHELLS.join(', ')}: ${shells.map(sh => e(sh.lumpVacuum)).join(', ')}; content against the empty knot ${shells.map(sh => e(sh.lumpEmpty)).join(', ')}; flipped minus lump ${shells.map(sh => e(sh.flip)).join(', ')}; the three knot runs' outsides agree on ${outsideSameMin} of ${beats} beats (least over members)`,
      metrics: {
        gate_K1: g1 ? 1 : 0,
        gate_K2: g2 ? 1 : 0,
        gate_K3: g3 ? 1 : 0,
        gate_K4: g4 ? 1 : 0,
        gate_K5: g5 ? 1 : 0,
        outsideSameBeatsMin: outsideSameMin,
        shellsPositive: positive.length,
        slope,
        ...Object.fromEntries(
          shells.map(sh => [
            `deficitLumpVacuumR${sh.r}`,
            sh.lumpVacuum.value,
          ]),
        ),
        ...Object.fromEntries(
          shells.map(sh => [
            `deficitLumpVacuumErrorR${sh.r}`,
            sh.lumpVacuum.error,
          ]),
        ),
        ...Object.fromEntries(
          shells.map(sh => [
            `deficitEmptyVacuumR${sh.r}`,
            sh.emptyVacuum.value,
          ]),
        ),
        ...Object.fromEntries(
          shells.map(sh => [
            `deficitLumpEmptyR${sh.r}`,
            sh.lumpEmpty.value,
          ]),
        ),
        ...Object.fromEntries(
          shells.map(sh => [`rhoVacuumR${sh.r}`, sh.rho.vacuum.value]),
        ),
        ...Object.fromEntries(
          shells.map(sh => [`rhoLumpR${sh.r}`, sh.rho.lump.value]),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        chargeBlind: g4 ? 1 : 0,
        contentMatters: g5 ? 1 : 0,
      },
      notes: `L2. Gates K1 ${g1}, K2 ${g2}, K3 ${g3} (slope ${slope.toFixed(3)} over ${positive.length} shells), K4 ${g4}, K5 ${g5}. Per shell (r, pairs; rho lump, flipped, empty, vacuum; deficit lump-vacuum, empty-vacuum, lump-empty, flipped-minus-lump): ${shells.map(sh => `r ${sh.r}, ${sh.pairs}; ${RUNS.map(x => e(sh.rho[x])).join(', ')}; ${e(sh.lumpVacuum)}, ${e(sh.emptyVacuum)}, ${e(sh.lumpEmpty)}, ${e(sh.flip)}`).join('; ')}. Knot runs' outsides the same on ${outsideSameMin} of ${beats} beats (least over members). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
