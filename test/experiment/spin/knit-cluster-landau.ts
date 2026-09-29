// g on the knit's own lightest charge-one cluster (E-SPN-0089): its Landau levels in a uniform field read from the
// light's columns, and the g they imply. Follows E-SPN-0088, which found the lightest charge-one levels of the
// doublet-locked knit's own loves under the drift cost: three loves that stay in ONE husk column on one husk shadow
// (E = 0, spin one half share 0, travelling at one husk unit a beat).
//
// THE QUESTION. The slot-steered lock gives a lone vibe g_spin = 0 (E-SPN-0083: the spin never enters the band). The
// hope was that binding, which couples position and role through the drift phase, would let the spin into the band
// of a bound cluster. E-SPN-0088 showed the drift phase binds nothing on the knit's own loves: their occupation is
// classical, so the drift phase is one phase per history. A uniform field is a phase too (code/measure/
// knit-cluster-field: the Landau-gauge line integral of the light's husk angle along each copy). So, derived before
// the run: the field keeps every cycle of the occupation map at every b and changes only each cycle's holonomy; a
// Landau level needs an in-plane path closed into a cyclotron orbit, which a phase cannot make of a classical path; so
// there is no Landau level, no ladder, and no g to read from one. For a cluster that does not move in the field plane
// the holonomy is 0 at every b: no Zeeman shift at all, whatever its spin.
//
// THE SETTING. The one-column levels at column depth L = 4, enumerated completely (code/measure/knit-cluster-field
// oneColumnLevels: every start with the three loves in one column, followed to 96 beats). A husk torus 14 x 14 x 2
// (14 = 2N at D = 3, so the Landau gauge is periodic) over columns of depth 4. Field b = 0, 1, 2 quanta per husk
// torus row, B = 2 pi b / 14 per square in the (x1, x2) plane, exact exponents of zeta_28.
//
// GATES, fixed before the first run.
//  Z1 Landau levels exist: at b = 1 and b = 2, some cycle of a lightest level that moves in the field plane is
//     localized in it (fewer than 14 distinct x1 and fewer than 14 distinct x2)
//  Z2 g = 2: read by the Landau estimator of code/measure/token-g-landau on the ladder Z1 finds, |g - 2| < 0.05
//     (not evaluable without Z1, and then it fails)
//  Z3 the field is a phase: at b = 0, 1, 2 every lightest level has the same multiset of cycle lengths, and every
//     cycle that does not move in the plane has holonomy exponent 0 (no Zeeman shift: g_spin = 0 on it)
//  C  control, the instrument sees Landau levels where a coin exists: the locked stand-in token of E-SPN-0080 on its
//     forced 16-beat nested palindrome, plane (x, y), side 48, reads |g_lo - 2| < 1e-6
//  Verdict: pass if Z1, Z2, Z3 and C hold; fail otherwise.
//
// PREDICTIONS, written before the first run: Z1 FAILS (0 localized in-plane cycles at every b: an in-plane mover's
// cycle wraps the torus in its direction), so Z2 FAILS (no ladder; g is undefined, not 2); Z3 passes (the theorem);
// C passes (E-SPN-0080 read 7.5e-9). The spin one half share of every lightest level is 0 at every b (the field
// changes no label).
//
// FIRST RUN (4 s, tmp/kb-spn89-run1.log): FAIL on Z1 and Z2 as predicted, no gate moved. Z3 and C pass. At b = 0, 1,
// 2: 0 of 9,184 in-plane cycles localized (extents 14 x 1, 1 x 14, 14 x 14), cycle lengths identical, 18,032 cycles
// out of the plane all at holonomy 0; the control reads g_lo = 2 within 7.5e-9. One more reading than predicted: every
// in-plane cycle's holonomy is also 0 at b = 1 and 2 (1 distinct value), because a straight path encloses no area,
// so the field has no gauge-invariant effect on these levels at all. INSTRUMENT FIX (second run): the level key in
// oneColumnLevels anchored at the least depth instead of each love in turn, so one class could be counted under two
// keys (150 levels read); the key is now canonical. Every gate is read over all levels either way, so no gate
// changes; the level count does, and the notes are grouped.
//
// Depth L2: the knit's own rule on its own loves, exact integer holonomies; the control is a stand-in by name.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  oneColumnLevels,
  torusCycles,
  shadowOf,
  type FieldCycle,
} from '@/code/measure/knit-cluster-field'
import { spinHalfShares } from '@/code/measure/knit-love-cluster'
import { relabel } from '@/code/measure/g-two-census'
import { bandSignOf, landauG } from '@/code/measure/token-g-landau'
import { type Step } from '@/code/rule/spinor-token'

const D = 3
const N = 2 * D + 1
const LH = 2 * N
const LZ = 2
const DEPTH = 4
const FIELDS = [0, 1, 2]
const MODEL_COIN = Math.PI / 3
const FORCED = 'z00x00y00y00x00z'

// E-SPN-0080's plane reading of a word: a -> x, b -> y, the third axis -> z, a filler -> a depth beat
function planeSteps(
  word: string,
  plane: readonly [number, number],
): Step[] {
  const image: [string, string, string] = ['', '', '']

  image[plane[0]] = 'x'
  image[plane[1]] = 'y'
  image[3 - plane[0] - plane[1]] = 'z'

  return Array.from(
    relabel(word, image),
    (ch): Step => (ch === '0' ? 'up' : (ch as Step)),
  )
}

const grouped = (keys: readonly string[]): string => {
  const g = new Map<string, number>()

  for (const k of keys) {
    g.set(k, (g.get(k) ?? 0) + 1)
  }

  return [...g]
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} x ${k}`)
    .join('; ')
}

const lengths = (cs: readonly FieldCycle[]): string =>
  cs
    .map(c => c.length)
    .sort((a, b) => a - b)
    .join(',')

export default experiment({
  id: 'spin/knit-cluster-landau',
  code: 'E-SPN-0089',
  title:
    "g on the knit's own lightest charge-one cluster (three loves in one husk column): its Landau levels in a uniform field read from the light's columns, and the g they imply, against the slot-steered lock's g_spin = 0",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const family = oneColumnLevels(DEPTH, 96)
    const rows = family.levels.map(level => {
      const byField = FIELDS.map(b => ({
        b,
        cycles: torusCycles(level.start, DEPTH, LH, LZ, b),
      }))
      const spin = spinHalfShares(
        level.start,
        level.period,
        DEPTH,
        new Array<number>(level.period).fill(0),
      )

      return {
        level,
        byField,
        spin,
        moves: byField[0]!.cycles.some(c => c.inPlane),
        shadow: shadowOf(level.start.d[0]!),
      }
    })

    const localized = FIELDS.map(b =>
      rows.reduce(
        (s, r) =>
          s +
          r.byField
            .find(f => f.b === b)!
            .cycles.filter(
              c => c.inPlane && c.extent1 < LH && c.extent2 < LH,
            ).length,
        0,
      ),
    )
    const inPlaneCycles = FIELDS.map(b =>
      rows.reduce(
        (s, r) =>
          s +
          r.byField.find(f => f.b === b)!.cycles.filter(c => c.inPlane)
            .length,
        0,
      ),
    )
    const z1 = localized[1]! > 0 && localized[2]! > 0
    const z2 = false
    const sameLengths = rows.every(r =>
      r.byField.every(
        f => lengths(f.cycles) === lengths(r.byField[0]!.cycles),
      ),
    )
    const staticCycles = rows.flatMap(r =>
      r.byField.flatMap(f => f.cycles.filter(c => !c.inPlane)),
    )
    const staticShift = staticCycles.filter(
      c => c.exponent !== 0,
    ).length
    const z3 =
      sameLengths && staticCycles.length > 0 && staticShift === 0

    // the holonomies the field gives in-plane movers (their Aharonov-Bohm phases), per b
    const holonomies = FIELDS.map(
      b =>
        new Set(
          rows.flatMap(r =>
            r.byField
              .find(f => f.b === b)!
              .cycles.filter(c => c.inPlane)
              .map(c => c.exponent),
          ),
        ).size,
    )
    const extents = [
      ...new Set(
        rows.flatMap(r =>
          r.byField.flatMap(f =>
            f.cycles
              .filter(c => c.inPlane)
              .map(c => `${c.extent1}x${c.extent2}`),
          ),
        ),
      ),
    ]

    // ---- control ----
    const schedule = planeSteps(FORCED, [0, 1])
    const sign = bandSignOf({
      schedule,
      mode: 'locked',
      coinAngle: MODEL_COIN,
    })
    const control = landauG({
      schedule,
      mode: 'locked',
      coinAngle: MODEL_COIN,
      side: 48,
      sign,
    })
    const c = Math.abs(control.gLo - 2) < 1e-6

    const ok = z1 && z2 && z3 && c
    const spinAll = rows.flatMap(r => r.spin)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the knit's lightest charge-one levels (${rows.length} one-column levels at column depth ${DEPTH}, from ${family.starts.toLocaleString('en-US')} one-column starts) in a uniform field on a ${LH} x ${LH} x ${LZ} husk torus: at b = ${FIELDS.join(', ')} the cycles are the same (lengths identical: ${sameLengths}) and ${localized.join(', ')} of ${inPlaneCycles.join(', ')} in-plane cycles are localized in the plane (extents ${extents.join(', ')}), so there is no Landau level and no ladder: g is undefined, not 2; the ${staticCycles.length / FIELDS.length} cycles that do not move in the plane have holonomy 0 at every b (${staticShift} shifted), so no Zeeman shift (g_spin = 0); the field gives in-plane movers ${holonomies.join(', ')} distinct Aharonov-Bohm holonomies; spin one half share ${Math.min(...spinAll).toFixed(4)} to ${Math.max(...spinAll).toFixed(4)}; the stand-in control reads g_lo = ${control.gLo.toFixed(9)}`,
      metrics: {
        gate_Z1: z1 ? 1 : 0,
        gate_Z2: z2 ? 1 : 0,
        gate_Z3: z3 ? 1 : 0,
        gate_C: c ? 1 : 0,
        levels: rows.length,
        starts: family.starts,
        leave: family.leave,
        movingLevels: rows.filter(r => r.moves).length,
        ...Object.fromEntries(
          FIELDS.flatMap((b, i) => [
            [`b${b}_inPlaneCycles`, inPlaneCycles[i]!],
            [`b${b}_localized`, localized[i]!],
            [`b${b}_holonomies`, holonomies[i]!],
          ]),
        ),
        staticCycles: staticCycles.length / FIELDS.length,
        staticShifted: staticShift,
        spinHalfMin: Math.min(...spinAll),
        spinHalfMax: Math.max(...spinAll),
        controlGLo: control.gLo,
        seconds: (Date.now() - started) / 1000,
      },
      control: { controlMiss: Math.abs(control.gLo - 2) },
      notes: `L2. Gates Z1 ${z1}, Z2 ${z2} (not evaluable without a ladder), Z3 ${z3}, C ${c}. Levels grouped (count x period, husk shadow, torus cycles at b = 0 as length x count): ${grouped(rows.map(r => `T ${r.level.period} s (${r.shadow.join(',')}) [${[...new Set(r.byField[0]!.cycles.map(x => x.length))].map(L => `${L} x ${r.byField[0]!.cycles.filter(x => x.length === L).length}`).join(', ')}]`))}. Holonomy exponents of zeta_${2 * LH} for in-plane cycles at b = 1: ${[...new Set(rows.flatMap(r => r.byField[1]!.cycles.filter(x => x.inPlane).map(x => x.exponent)))].sort((a, b) => a - b).join(' ')}. The field is the Landau-gauge line integral of the light's husk angle along each copy, exact in zeta_${2 * LH}; the torus is measurement (the rule has no period in the husk).`,
    })
  },
})
