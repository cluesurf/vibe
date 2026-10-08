// DOCKS BORN A BEAT PER VOLUME UNDER REGISTER GROWTH (E-CSM-0063), route H12b (note/project/vibe/roadmap/research/routes/
// gravity-cosmos-heat-classical.md, H · the cosmological constant): "Λ as an integration constant: if each beat adds a
// fixed number of docks per unit of husk volume, the volume element is fixed, which is unimodular gravity, where Λ is
// not a vacuum energy but a constant of integration." Test, in the route's words: "read the docks born a beat per husk
// volume under register growth, constant or not, exact". Kill: "the volume added a beat depends on content."
// OPEN-CSM-06.
//
// WHAT IS RUN. The register growth of E-FND-0168 (code/measure/register-growth: the plain wake, birth at root-step
// distance from one seed, one shell a beat; the one-body pieces of the register rule with the reflecting frontier; a born
// dock written empty) on the D4 tori of side 4 and 6 (128 and 648 docks), 8 cycles (16 beats), with three contents on the
// same growth: an EMPTY seed (no orbital), a FULL seed (the 192 member orbitals of a full dock at the seed), and a
// PLANTED LUMP (a full dock's 192 orbitals written at the first dock born at beat 2, at its birth). The births a beat are
// also counted on the unbounded D4 lattice (even coordinate sum in Z^4, the 24 roots) to beat 14, where no box wraps.
// The register growth is on D4, not on the {3,4,3,4} husk (route I1a's port is not built), so "volume" here is the
// grown region's dock count, and the newest shell, the region's own 3d edge, is read beside it.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE LAW READS NO STATE. The plain wake gives every dock its birth beat from the graph alone (torusWake reads the
//    neighbor table and the seed). So the docks added a beat cannot depend on content: the route's kill cannot fire by
//    the law's construction. What can fail is consistency: if any content reached a dock before its birth, a law blind
//    to content would be contradicted (the content would demand the dock earlier). The stream moves a slot one root step
//    a beat and the wake births one shell a beat, so after beat 0 no content passes the frontier (E-FND-0168 LC): the
//    weight on unborn docks should be exactly 0 for every content, including a lump written at the frontier itself.
// 2. HOW MANY A BEAT. On the unbounded D4 lattice the root-step shells should be b(0) = 1, b(t) = 8 t (2 t^2 + 1) for
//    t >= 1 (1, 24, 144, 456, 1056, ...; third differences constant 96), so the ball is V(t) = (2 t^2 + 2 t + 1)^2. Then
//    the docks born a beat per volume are b(t) / V(t - 1) = 8 t (2 t^2 + 1) / (2 t^2 - 2 t + 1)^2, about 4 / t, falling,
//    and per edge volume b(t) / b(t - 1) about 1 + 3 / t, falling to 1. Neither is constant: a fixed number per volume is
//    exponential growth, a constant H; this is a 4-ball growing by one radius a beat, a scale factor proportional to t, H
//    = 1 / t, the coasting reading E-CSM-0060 found on the horospheres. The number added a beat is fixed (a function of t
//    alone), which is the unimodular part of the route; the constant per volume is not.
// 3. THE CONTROL. E-GRV-0066's gated wake reads content: a dock opens 1 + max(0, E - 32) beats after its birth, so a
//    full dock (E = 48, as E-GRV-0066 assigns a full knit dock) waits 16. A full seed then delays every later shell by
//    16 beats, so its births a beat differ from the empty seed's, and the kill would fire on that law. (The register's
//    full dock has 192 members, not the knit's 48 units; E = 48 is the knit's full-dock energy, a stand-in for the
//    control only.)
//
// PROBES BEFORE THE GATES, disclosed. tmp/bv-probe1 (this file's code with PROBE_PLAN: side 4, 4 cycles, lattice to beat
// 8, gated box side 6): the lattice shells 1, 24, 144, 456, 1056, 2040, 3504, 5544, 8256 (third differences 96), per
// volume 24, 5.76, 2.698, 1.690, 1.214, 0.942, 0.767, 0.647; on side 4 the three contents had 0 weight on unborn docks,
// and their total weights drifted 1.7e-9 and 1.9e-9, which failed a first tolerance of 1e-9 and fixed WEIGHT_TOL at
// 1e-8 (E-FND-0168's count tolerance); the gated wake's full seed delayed every shell by 16 beats, and a lump at a
// distance-2 dock delayed none (the wake goes around it). tmp/bv-probe2: the side-8 gated box's plain shells 1, 24,
// 144, 456, 1044, ..., the lattice's to beat 3.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  E1 THE INSTRUMENT: in every content run on both sides the total weight stays its start plus 192 a planted dock within
//     1e-8 at every beat.
//  W0 THE COUNT: the torus wakes' shells equal the lattice's before the box wraps (beats below L / 2), and the lattice's
//     shells are 8 t (2 t^2 + 1) at every t = 1 .. 14 (read through the third differences, constant 96).
//  H1 CONTENT-BLIND (the route's unimodular part): on both sides the docks born at every beat are the same for the three
//     contents, and no content puts any weight on an unborn dock at any beat (exactly 0).
//  P1 THE KILL: the births differ between contents, or some content reaches an unborn dock. H1 fails exactly when P1
//     fires.
//  H2 CONSTANT PER VOLUME (the route's mechanism as stated; PREDICTED TO FAIL by 2): on the lattice, b(t) / V(t - 1) over
//     beats 7 .. 14 varies by at most 1 percent of its smallest value.
//  C1 THE CONTROL: on a side-8 gated box (4,096 docks) the full seed's births a beat differ from the empty seed's, and the
//     empty seed's gated shells equal the lattice's to beat 3.
// READ, gating nothing: the content's reach (docks holding weight above 1e-20) each beat against the births; b / V and
// b(t) / b(t - 1) at each beat; the gated lump's shells; seconds.
// VERDICT: fail if H1 fails (the kill fires) or H2 fails; partial if H1 and H2 hold and E1, W0 or C1 fails; pass
// otherwise. PREDICTED: fail on H2 alone, with the kill not firing.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show, exactly, that the register growth adds a number of docks a beat that is a
// function of the beat alone, the same for every content tried, and that the dynamics never contradicts that (no content
// outruns the frontier), so the volume element is not dynamical: the unimodular premise holds for this growth law. And
// it can show whether that number is a fixed share of the volume. It cannot show that the plain wake is the model's
// growth (it is the least growth rule ported from the lattice gas, E-FND-0168, on D4, not on the {3,4,3,4} husk); a law
// that reads content, like the gated wake, would fire the kill. It does not give Λ a value: in unimodular gravity the
// constant is fixed by the history, and nothing here reads that constant.
//
// FIRST RUN 2026-10-02 (tmp/bv-run1.log, 55 s): FAIL on H2 alone, as derived; the kill does not fire. No gate moved and
// none was rerun.
//  - W0: the lattice shells 1, 24, 144, 456, 1056, 2040, 3504, 5544, 8256, 11736, 16080, 21384, 27744, 35256, 44016 at
//    beats 0 .. 14, each 8 t (2 t^2 + 1) (third differences 96); the torus wakes 1, 24, 74, 28, 1 (side 4) and 1, 24, 144,
//    286, 160, 32, 1 (side 6), the lattice's before the wrap.
//  - H1: the three contents share every birth on both sides, and none put weight on an unborn dock (exactly 0 in all six
//    runs). E1: total weight drift at most 2.0e-9 (side 4) and 8.6e-9 (side 6), under 1e-8. P1 does not fire.
//  - H2: b(t) / V(t - 1) reads 0.767, 0.647, 0.558, 0.491, 0.438, 0.395, 0.360, 0.330 at beats 7 .. 14, a factor 2.3, not
//    constant (t b / V = 4.63 at beat 14, tending to 4). Per edge volume b(t) / b(t - 1) falls 1.489 .. 1.249 over the
//    same beats, toward 1.
//  - C1: on the side-8 gated box the full seed holds every later shell back 16 beats (1, then 16 empty beats, then 24,
//    144, 456, ...), where the empty seed gives 1, 24, 144, 456, 1044, 1512, 792, 120, 3; a planted lump at a distance-2
//    dock moves one dock by one beat (455 and 1045 at beats 3 and 4).
//  - Read: the content fills the born region as fast as it is born: the full seed's weight is on 1, 24, 169, 455, 615,
//    647, 648 docks after beats 0 .. 6 on side 6 (the ball itself to beat 2, then the box), the lump's from its birth on.
//
// Depth L1: exact counts, and float amplitudes only for the consistency check, with reported residuals. DETERMINISM:
// every orbital is a fixed local basis vector; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { MODES, sectorBases, torus } from '@/code/measure/register-sea'
import {
  dockModes,
  growthBeat,
  growthScratch,
  localOrbitals,
  orbitalWeight,
  torusNeighbors,
  torusWake,
  unbornWeight,
  type Orbital,
} from '@/code/measure/register-growth'
import {
  gatedWake,
  shellCounts,
  WAKE_THRESHOLD,
  wakeWait,
} from '@/code/measure/gated-wake'

export type BirthPlan = {
  sides: readonly number[]
  cycles: number
  // beats of the infinite D4 lattice's wake counted
  lattice: number
  // the gated wake's box side (side^4 docks)
  gatedSide: number
}

export const GATE_PLAN: BirthPlan = {
  sides: [4, 6],
  cycles: 8,
  lattice: 14,
  gatedSide: 8,
}

export const PROBE_PLAN: BirthPlan = {
  sides: [4],
  cycles: 4,
  lattice: 8,
  gatedSide: 6,
}

const LIGHT: readonly [number, number] = [-1, 4]
const WEIGHT_TOL = 1e-8
const FULL_ENERGY = 48
const FLAT = 0.01

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'cosmology/birth-per-volume',
  code: 'E-CSM-0063',
  title:
    "the docks register growth adds a beat are the same whatever the content, but they are not a fixed share of the volume, fail on the route's constant as derived (the kill does not fire): on the D4 tori of side 4 and 6 an empty seed, a full seed and a full dock planted at its birth share every birth and never put weight on an unborn dock, because the plain wake reads no state and the stream never outruns it; on the unbounded lattice the births are exactly 8 t (2 t^2 + 1) a beat on a ball of (2 t^2 + 2 t + 1)^2, so the births per volume fall about as 4 / t (0.767 to 0.330 over beats 7 to 14), a coasting scale factor proportional to t, not a constant H; E-GRV-0066's gated wake, which reads content, holds a full seed's shells back 16 beats",
  category: 'cosmology',
  substrates: ['d4'],
  depth: 'L1',
  paper: false,
  run() {
    return birthRun(GATE_PLAN)
  },
})

// the plain wake on the unbounded D4 lattice (even coordinate sum in Z^4, the 24 roots +-e_i +- e_j): docks at each
// root-step distance from the origin, beats 0 .. T
export function latticeShells(T: number): number[] {
  const R = T + 2
  const W = 2 * R + 1
  const key = (p: readonly number[]): number =>
    p[0]! + R + W * (p[1]! + R + W * (p[2]! + R + W * (p[3]! + R)))
  const roots: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[i] = si
          r[j] = sj
          roots.push(r)
        }
      }
    }
  }

  const seen = new Set<number>([key([0, 0, 0, 0])])
  const shells = [1]

  let front: number[][] = [[0, 0, 0, 0]]

  for (let t = 1; t <= T; t++) {
    const next: number[][] = []

    for (const p of front) {
      for (const r of roots) {
        const q = p.map((c, k) => c + r[k]!)
        const kq = key(q)

        if (!seen.has(kq)) {
          seen.add(kq)
          next.push(q)
        }
      }
    }

    shells.push(next.length)
    front = next
  }

  return shells
}

type ContentRead = {
  // the largest weight on an unborn dock at any beat, and the total weight's drift
  unborn: number
  drift: number
  // per beat: the docks born (the law) and the docks holding weight above 1e-20 (the content's reach)
  reach: number[]
  seconds: number
}

// one run of the register growth with the given content: orbitals at the start, and full docks added at their birth
function contentRun(
  N: number,
  nb: Int32Array,
  birth: Int32Array,
  cycles: number,
  start: Orbital[],
  planted: readonly number[],
  E: ReturnType<typeof sectorBases>,
  u: [number, number],
): ContentRead {
  const started = Date.now()
  const orbitals = start
  const scratch = growthScratch(N)
  const added = new Set<number>()
  const reach: number[] = []

  let unborn = 0
  let expected = orbitalWeight(orbitals)
  let drift = 0

  for (let beat = 0; beat < 2 * cycles; beat++) {
    for (const x of planted) {
      if (birth[x]! <= beat && !added.has(x)) {
        added.add(x)
        orbitals.push(...localOrbitals(N, x, dockModes()))
        expected += MODES
      }
    }

    unborn = Math.max(unborn, unbornWeight(orbitals, birth, beat))

    const one = beat % 2 === 0

    growthBeat(
      {
        nb,
        birth,
        E: one ? E.S : E.D,
        w: one ? u : [u[0], -u[1]],
        time: beat,
        reflect: true,
      },
      orbitals,
      scratch,
    )

    drift = Math.max(
      drift,
      Math.abs(orbitalWeight(orbitals) - expected),
    )

    let held = 0

    for (let x = 0; x < N; x++) {
      let w = 0

      for (const o of orbitals) {
        for (let k = x * MODES; k < (x + 1) * MODES; k++) {
          w += o.re[k]! ** 2 + o.im[k]! ** 2
        }
      }

      if (w > 1e-20) {
        held++
      }
    }

    reach.push(held)
  }

  return {
    unborn,
    drift,
    reach,
    seconds: (Date.now() - started) / 1000,
  }
}

export function birthRun(plan: BirthPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const E = sectorBases()
  const metrics: Record<string, number> = {}
  const control: Record<string, number> = {}

  // ---------------- the unbounded lattice: born a beat, and per volume ----------------
  const shells = latticeShells(plan.lattice)
  const volume: number[] = []

  shells.reduce((acc, b, t) => ((volume[t] = acc + b), acc + b), 0)

  const perVolume = shells.slice(1).map((b, i) => b / volume[i]!)
  const perShell = shells.slice(2).map((b, i) => b / shells[i + 1]!)
  // H2: born a beat per volume constant within FLAT over the last half of the beats
  // beats lattice / 2 .. lattice (perVolume[i] is beat i + 1)
  const tail = perVolume.slice(Math.floor(plan.lattice / 2) - 1)
  const H2 =
    (Math.max(...tail) - Math.min(...tail)) / Math.min(...tail) <= FLAT
  // the third differences of the shells (a cubic has constant third differences)
  const d3 = shells
    .slice(1)
    .map((_, i, a) =>
      i + 3 < a.length
        ? a[i + 3]! - 3 * a[i + 2]! + 3 * a[i + 1]! - a[i]!
        : NaN,
    )
    .filter(v => !Number.isNaN(v))

  log(`lattice shells ${shells.join(' ')}`)
  log(`per volume ${perVolume.map(v => v.toFixed(4)).join(' ')}`)
  log(
    `per shell ${perShell.map(v => v.toFixed(4)).join(' ')}; third differences ${d3.join(' ')}`,
  )
  shells.forEach((b, t) => (metrics[`shell_${t}`] = b))
  perVolume.forEach((r, i) => (metrics[`perVolume_${i + 1}`] = r))

  // ---------------- the register growth with three contents ----------------
  let E1 = true
  let H1 = true
  let W0 = shells.every(
    (b, t) => b === (t === 0 ? 1 : 8 * t * (2 * t * t + 1)),
  )

  for (const L of plan.sides) {
    const t = torus(L)
    const N = t.sites.length
    const nb = torusNeighbors(t)
    const birth = torusWake(nb, N, t.origin)
    const torusShells = shellCounts(birth)
    // W0: before the box wraps (beats < L / 2) the torus wake is the lattice's
    const early = Math.floor(L / 2) - 1

    W0 =
      W0 &&
      torusShells.slice(0, early + 1).every((b, k) => b === shells[k])

    const lump = birth.findIndex(b => b === 2)
    const runs: [string, Orbital[], number[]][] = [
      ['empty', [], []],
      ['full', localOrbitals(N, t.origin, dockModes()), []],
      ['lump', [], [lump]],
    ]
    const born: number[][] = []

    for (const [name, start, planted] of runs) {
      const r = contentRun(
        N,
        nb,
        birth,
        plan.cycles,
        start,
        planted,
        E,
        u,
      )
      // the law's births a beat, as the dynamics sees them: docks with birth <= beat, differenced
      const counts = Array.from({ length: 2 * plan.cycles }, (_, b) =>
        birth.reduce((n, v) => n + (v === b ? 1 : 0), 0),
      )

      born.push(counts)
      E1 = E1 && r.drift <= WEIGHT_TOL
      H1 = H1 && r.unborn === 0
      metrics[`L${L}_${name}_unborn`] = r.unborn
      metrics[`L${L}_${name}_drift`] = r.drift
      metrics[`L${L}_${name}_seconds`] = r.seconds
      r.reach.forEach(
        (v, b) => (metrics[`L${L}_${name}_reach_${b}`] = v),
      )

      log(
        `L ${L} ${name}: unborn ${r.unborn} drift ${r.drift} reach ${r.reach.join(' ')} (${r.seconds}s)`,
      )
    }

    H1 = H1 && born.every(c => c.every((v, b) => v === born[0]![b]))
    metrics[`L${L}_docks`] = N
    torusShells.forEach((b, k) => (metrics[`L${L}_shell_${k}`] = b))
    log(
      `L ${L}: shells ${torusShells.join(' ')}, W0 ${W0}, lump dock ${lump}`,
    )
  }

  // ---------------- C1: a law that reads content (the gated wake, E-GRV-0066) ----------------
  const G = plan.gatedSide
  const cells = G ** 4
  const zero = new Int32Array(cells)
  const plainG = gatedWake(G, zero, 0)
  const lumpDock = plainG.findIndex(b => b === 2)
  const fullWait = new Int32Array(cells)
  const lumpWait = new Int32Array(cells)

  fullWait[0] = wakeWait(FULL_ENERGY)
  lumpWait[lumpDock] = wakeWait(FULL_ENERGY)

  const gEmpty = shellCounts(plainG)
  const gFull = shellCounts(gatedWake(G, fullWait, 0))
  const gLump = shellCounts(gatedWake(G, lumpWait, 0))
  const differ = (a: number[], b: number[]): boolean =>
    a.length !== b.length || a.some((v, k) => v !== b[k])
  const gEarly = Math.floor(G / 2) - 1
  const C1 =
    differ(gEmpty, gFull) &&
    gEmpty.slice(0, gEarly + 1).every((b, k) => b === shells[k])

  log(
    `C1 ${C1}: gated empty ${gEmpty.join(' ')}; full seed ${gFull.join(' ')}; lump ${gLump.join(' ')} (threshold ${WAKE_THRESHOLD})`,
  )
  control.gated_full_differs = flag(differ(gEmpty, gFull))
  control.gated_lump_differs = flag(differ(gEmpty, gLump))
  control.gated_empty_beats = gEmpty.length
  control.gated_full_beats = gFull.length
  control.gated_lump_beats = gLump.length

  const instrument = E1 && W0
  const status: Verdict['status'] =
    !H1 || !H2 ? 'fail' : instrument && C1 ? 'pass' : 'partial'

  return verdict({
    status,
    claim: H1
      ? `register growth adds the same docks a beat whatever the content; per volume they fall (${perVolume.at(-1)!.toFixed(4)} at beat ${plan.lattice}), not constant`
      : 'the docks added a beat depend on content',
    metrics: {
      E1: flag(E1),
      W0: flag(W0),
      H1: flag(H1),
      H2: flag(H2),
      C1: flag(C1),
      ...metrics,
      seconds: (Date.now() - started) / 1000,
    },
    control,
    notes: `E1 ${E1} W0 ${W0} H1 ${H1} H2 ${H2} C1 ${C1}`,
  })
}
