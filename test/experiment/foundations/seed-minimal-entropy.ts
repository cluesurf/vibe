// The past hypothesis read on the ledger's own coarse map: is the seed the lowest coarse entropy among starts of its
// size, and does a growing region renew low entropy at its frontier? (E-FND-0174; routes I9a and I9b of
// roadmap/routes/gravity-cosmos-heat-classical.md, "the low-entropy start", OPEN-CSM-08.)
//
// WHAT IS RUN.
//  Part A (I9a, the main hypothesis). The coarse map is E-FND-0146's, unchanged (code/measure/second-law-husk): the husk
//  cut into blocks of b x b x b columns, E_b the knit's conserved energy (held slots + 2 per stored unit) in block b,
//  H = - sum p_b ln p_b with p_b = E_b / E. The box is the side-4 D4 box of the adopted knit (256 docks, 64 husk
//  columns of 4 docks), cut into 8 blocks of 2 x 2 x 2 columns (32 docks each). The seed is the start of E-CSM-0058 and
//  E-CSM-0059: one distinction, the base dock, on a background written by growth. E-FND-0168 found that the knit's own
//  calm writes the EMPTY mesh (no vibe, no store), so the seed's world is the empty box with one dock distinct. The
//  SIZE of a start is the number of docks that differ from the background; a start of the seed's size differs on one
//  dock. Enumerated: every dock (256) and every content a dock can hold as the coarse map reads it, k held slots
//  (0 to 24) and j stored units (0 to 12), not both 0: 256 x 324 = 82,944 starts, each built as a state and read by
//  the instrument itself. Which slots and which role points are held does not enter E_b, so these are every coarse
//  state a one-dock start can reach. The seed itself is read in two forms: one held slot at the origin dock (the least
//  distinction) and the full origin dock (24 held slots and 12 stored units, the seed E-FND-0168's runs C use).
//  The same question is then put on the adopted coset-union vacuum (E-RLT-0093), where the seed is not the beginning:
//  every one-dock change of it that adds held slots, sets store trits on free lines or clears stored ones
//  (236,544 starts; a sign flip of a stored unit, delta = 0, is not enumerated).
//  Part B (I9b, the second hypothesis). The register rule under register growth (code/measure/register-growth,
//  E-FND-0168: the plain wake, the reflecting frontier, a born dock written in chi = EMPTY, the light unit
//  ringUnit(-1, 4)), the seed a full dock at the origin (192 member orbitals), on the tori L = 4 (128 docks, wake shells
//  1, 24, 74, 28, 1) and L = 6 (648 docks, 7 shells). The dock's coarse entropy is its occupation entropy in the
//  register's own modes, S_x = sum over the dock's 192 modes of h(n_m), h the binary entropy and n_m the mode's
//  occupation (the diagonal of the Slater state's one-body density, valid because the orbitals stay orthonormal). A dock
//  in one Fock state reads exactly 0: chi (every n_m = 0) and the full seed dock (every n_m = 1). This is the "zero-
//  entropy dock state" of the route. Read at every row t (the state after beats 0 to t - 1, so the docks with birth
//  beat at most t - 1 are born), grouped by birth beat. Beside it: the same seed in a region already born at beat 0
//  (every dock born, chi everywhere, the "preborn" run), and on L = 4 a slow wake (a shell every 2 beats).
//
// DERIVED BEFORE THE GATE RUN.
//  1. On any partition into blocks, H >= 0, and H = 0 exactly when one block holds all the energy. A start that differs
//     from the empty background on one dock puts all its energy in that dock's block. So every one-dock start on the
//     empty mesh reads H = 0 exactly, whatever the dock holds and wherever it is. The seed sits at the floor, and so
//     does every start of its size: the route's kill (a start of the same size strictly lower) cannot fire on this
//     coarse map. What the enumeration adds is the exact confirmation; what the derivation adds is the scope: the seed's
//     minimality is not special to the seed. It holds for every start of its size, and for every start of any size
//     confined to one block.
//  2. On the coset-union vacuum of the side-4 box every block holds the same energy (192, read in probe 1: H = ln 8),
//     so a one-dock change with energy change delta gives one block 192 + delta and the rest 192, and H depends on
//     delta alone, not on which dock. The deficit ln 8 - H grows with |delta| (at second order (B - 1) delta^2 / (2 (B a +
//     delta)^2) with a = 192; computed exactly: 1.48e-6 at delta = +1, 5.90e-6 at +2, 5.97e-6 at -2).
//     A dock holds at most 24 held slots and 12 stored units (energy 48). The vacuum's docks hold 4 stored units (192
//     docks) or none (64 docks) (probe 3), so delta runs from -8 to +40 on a stored dock and from 0 to +48 on a
//     store-free dock. The lowest H of a one-dock start on the vacuum is therefore delta = +48, the full dock on a
//     store-free dock, 64 starts; the origin dock holds 4 stored units (probe 4), so the full dock at the origin is
//     delta = +40 and is NOT minimal there. On the vacuum, minimality is a property of the dock's background, not of
//     the seed.
//  3. Under the plain wake the seed's full dock is invariant at beat 0 (all its neighbors are unborn, so the reflecting
//     stream maps the dock to itself, and a full dock's span is fixed by any dock-local unitary). So growth from a full
//     seed is the preborn run shifted by one beat. The two runs apply the pieces in opposite order after that (Q_D first
//     against Q_S first); that the occupations still agree was measured in probe 5 at L = 4 (4e-15), not derived. If it
//     holds at L = 6 too, the frontier's renewal is exactly what an empty region already present around the seed would
//     give: the birth beat equals the graph distance from the seed, and the frontier is the edge of the seed's light
//     cone.
//
// PROBES BEFORE THE GATES, disclosed (tmp/se-probe1 to se-probe5; no gate was moved after the gate run).
//  se-probe1: the instrument on the knit at sides 4 and 8. The coset-union vacuum reads H = ln B exactly with equal
//   blocks (192 per block at side 4, 3,072 at side 8 with 8 blocks). A full-dock seed on the empty mesh, run 200 beats:
//   H = 0 at beat 0, 1.12 to 1.66 at beat 1, then it fluctuates and returns to exactly 0 again and again (the free
//   stream refocuses the few vibes); its mean over beats 101 to 200 is 1.39 to 1.52 against ln 8 = 2.08. Energy exact.
//  se-probe2: Part B at L = 4 for 12 rows (plain, slow, preborn): the shells' mean S per row; the plain run equals the
//   preborn run one row later to the printed digits; the newest born shell had the lowest mean at rows 3 to 8 and not at
//   row 9 (0.678 against 0.343). 192 members kept (2.6e-13), Gram gap 2.7e-15.
//  se-probe3, se-probe4: the vacuum's per-dock store counts (4 on 192 docks, 0 on 64) and the origin dock's (4).
//  se-probe5: the plain run's mode occupations at row t + 1 against the preborn run's at row t, L = 4, t = 0 to 9:
//   largest difference 4.0e-15.
//  So H4, C2 and R at L = 4 are confirmations of probes; at L = 6 they are predictions. H2 was derived after probes 3
//  and 4. H1 and C1 are derivations (1), confirmed by enumeration here.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  I1 instrument: on the side-4 box, blockEnergy summed equals energyOf on every start read in Part A, and the
//     vacuum reads H = ln 8 within 1e-15.
//  C1 control (the comparison can return the kill): the 32,640 starts of two held slots on two different docks of the
//     empty side-4 box read H = 0 exactly on the 3,968 same-block pairs and |H - ln 2| <= 1e-15 on the other 28,672; so
//     against a split pair as the reference, 3,968 starts of the same size are strictly lower: the instrument and the
//     comparison read the other outcome when it exists.
//  H1 (route I9a) the seed is minimal: both forms of the seed read H = 0 exactly, and none of the 82,944 one-dock starts
//     on the empty box reads below it (every one reads exactly 0: all tie).
//  P1 (I9a's kill) some one-dock start reads H strictly below the seed's.
//  H2 (the vacuum reading): on the coset-union vacuum every one-dock start's H depends on delta alone (equal within
//     1e-14 for equal delta); the least H is attained exactly by the 64 starts with delta = +48; the full dock at the
//     origin (delta = +40) reads above it.
//  I2 instrument for Part B: at the end of each run the orbitals' Gram gap is at most 1e-12 and the member weight is
//     192 within 1e-8; at every row every unborn dock reads S = 0 exactly; the seed reads S = 0 at row 0.
//  H3 (route I9b) entropy depends on birth beat: on the plain wake at L = 4 and L = 6, at every row t from 3 to T, the
//     born shells' mean S spans more than 1e-3 (largest minus least).
//  P2 (I9b's kill) at some L, at every row 3 to T, the born shells' mean S agree within 1e-6.
//  H4 the arrow points away from the frontier while the region grows: at every row t from 3 to last + 1 (the rows at
//     which the newest born shell is the one born at beat t - 1), the newest born shell has the least mean S among the
//     born shells, at L = 4 and L = 6.
//  C2 control for H4 (the reading can come out the other way): at some row from last + 2 to T the last shell does NOT
//     have the least mean S, at L = 4 and L = 6.
//  R  the renewal is the seed's light cone: the plain run's mode occupations at row t + 1 equal the preborn run's at
//     row t within 1e-12 for t = 0 to T - 1, at L = 4 and L = 6.
//  Rows: T = 12 at L = 4, T = 10 at L = 6.
//
// VERDICT rule: pass if every gate holds; fail if P1 or P2 fires (H1 or H3 fails); partial if I1, C1 or I2 fails, or
// if H2, H4, C2 or R misses while H1 and H3 hold.
//
// Reported, not gated: the full-dock seed on the empty side-4 box run 200 beats forward and 200 back (H at beats 1 to
// 4, the beats with H exactly 0, the late mean against ln 8); the per-row shell means; the slow wake at L = 4 (rows at
// which its newest born shell has the least mean S).
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether, on the coarse map the arrow experiments use (E-FND-0146,
// E-FND-0155), anything of the seed's size starts lower than the seed, and whether a grown region's coarse entropy
// depends on birth beat. It cannot show that the seed is singled out: on the empty mesh minimality is a tie shared by
// every start of its size (derivation 1), so this map does not choose the seed among them. It does not read a coarse
// map other than block energy (Part A) and dock occupation (Part B); a finer map with blocks of one dock would tie in
// the same way. Part B uses the register rule's one-body pieces, not the knit; it says nothing about the knit under
// growth, which has no growth rule (E-FND-0168). I9c (the ceiling) and I9d (the depth field) are not read.
//
// Depth L2: an exact enumeration (Part A, integer energies, H exact at 0) and float amplitudes with reported
// residuals (Part B). DETERMINISM: no random numbers; role points from the silver sequence; every orbital a fixed local
// basis vector. NOTHING MOVES: the stream copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  arrowBox,
  blockEnergy,
  energyOf,
  shannon,
  twoWay,
  vacuumState,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { MODES, sectorBases, torus } from '@/code/measure/register-sea'
import {
  dockModes,
  gramGap,
  growthBeat,
  growthScratch,
  localOrbitals,
  orbitalWeight,
  torusNeighbors,
  torusWake,
  type Orbital,
} from '@/code/measure/register-growth'
import { SILVER } from '@/code/tool/weyl'

const SIDE = 4
const BLOCK = 2
const DYNAMIC_BEATS = 200
const LIGHT: readonly [number, number] = [-1, 4]
const SIDES_B = [4, 6]
const ROWS: Record<number, number> = { 4: 12, 6: 10 }
const SPREAD_MIN = 1e-3
const SPREAD_KILL = 1e-6
const SHIFT_TOL = 1e-12
const GRAM_TOL = 1e-12
const WEIGHT_TOL = 1e-8

const frac = (x: number): number => x - Math.floor(x)
const flag = (b: boolean): number => (b ? 1 : 0)

// ---------------- Part A helpers ----------------

type Reader = {
  box: ArrowBox
  e: Float64Array
  // the instrument's H, and whether blockEnergy's sum matches energyOf
  read: (s: Reduced) => { h: number; nonzero: number; agrees: boolean }
}

function reader(box: ArrowBox): Reader {
  const e = new Float64Array(box.blocks)

  return {
    box,
    e,
    read: s => {
      blockEnergy(box, s, e)

      let sum = 0
      let nonzero = 0

      for (const v of e) {
        sum += v

        if (v > 0) {
          nonzero++
        }
      }

      return { h: shannon(e), nonzero, agrees: sum === energyOf(s) }
    },
  }
}

const emptyState = (box: ArrowBox): Reduced => {
  const s = vacuumState(box)

  s.store.fill(0)

  return s
}

// k held slots (the first k, alternately love and fear, silver role points) and j stored units on dock x
function fillDock(s: Reduced, x: number, k: number, j: number): void {
  for (let d = 0; d < 24; d++) {
    const slot = x * 24 + d

    s.vibe[slot] = d < k ? (d % 2 === 0 ? 1 : -1) : 0
    s.point[slot] =
      d < k ? Math.floor(9 * frac((slot + 1) * SILVER)) : 0
  }

  for (let l = 0; l < 12; l++) {
    s.store[x * 12 + l] = l < j ? (l % 2 === 0 ? 1 : -1) : 0
  }
}

function clearDock(s: Reduced, x: number): void {
  fillDock(s, x, 0, 0)
}

// ---------------- Part B helpers ----------------

const binary = (n: number): number =>
  n <= 0 || n >= 1 ? 0 : -n * Math.log(n) - (1 - n) * Math.log(1 - n)

function occupations(
  orbitals: readonly Orbital[],
  N: number,
): Float64Array {
  const occ = new Float64Array(N * MODES)

  for (const o of orbitals) {
    for (let k = 0; k < occ.length; k++) {
      occ[k] = occ[k]! + o.re[k]! ** 2 + o.im[k]! ** 2
    }
  }

  return occ
}

function dockEntropy(occ: Float64Array, N: number): Float64Array {
  const s = new Float64Array(N)

  for (let x = 0; x < N; x++) {
    let a = 0

    for (let m = 0; m < MODES; m++) {
      a += binary(occ[x * MODES + m]!)
    }

    s[x] = a
  }

  return s
}

type SideRead = {
  L: number
  N: number
  last: number
  shells: number[]
  // per row, the mean S of each born shell (index by birth beat)
  means: number[][]
  unbornZero: boolean
  seedZero: boolean
  gram: number
  weight: number
  shift: number
  spreads: number[]
  newestLeast: boolean[]
  slowNewestLeast: boolean[] | null
  seconds: number
}

function shellMeans(
  S: Float64Array,
  birth: Int32Array,
  bornUpTo: number,
  shells: number,
): number[] {
  const sum = new Float64Array(shells)
  const count = new Float64Array(shells)

  for (let x = 0; x < S.length; x++) {
    const b = birth[x]!

    if (b <= bornUpTo) {
      sum[b] = sum[b]! + S[x]!
      count[b] = count[b]! + 1
    }
  }

  return Array.from(
    { length: Math.min(bornUpTo, shells - 1) + 1 },
    (_, b) => sum[b]! / count[b]!,
  )
}

function partB(L: number, T: number): SideRead {
  const started = Date.now()
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const E = sectorBases()
  const t = torus(L)
  const N = t.sites.length
  const nb = torusNeighbors(t)
  const plain = torusWake(nb, N, t.origin)
  const last = Math.max(...plain)
  const shells = Array.from(
    { length: last + 1 },
    (_, b) => plain.filter(x => x === b).length,
  )
  const preborn = new Int32Array(N)
  const slowBirth = plain.map(b => 2 * b)
  const scratch = growthScratch(N)

  const step = (
    o: Orbital[],
    birth: Int32Array,
    beat: number,
  ): void => {
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
      o,
      scratch,
    )
  }

  const grown = localOrbitals(N, t.origin, dockModes())
  const born = localOrbitals(N, t.origin, dockModes())
  const slow = L === 4 ? localOrbitals(N, t.origin, dockModes()) : null

  const means: number[][] = []
  const spreads: number[] = []
  const newestLeast: boolean[] = []
  const slowNewestLeast: boolean[] = []

  let unbornZero = true
  let seedZero = true
  let shift = 0
  let previousBorn: Float64Array | null = null

  for (let row = 0; row <= T; row++) {
    const occ = occupations(grown, N)
    const S = dockEntropy(occ, N)

    if (row === 0) {
      seedZero = S[t.origin] === 0
    }

    for (let x = 0; x < N; x++) {
      if (plain[x]! > row - 1 && x !== t.origin && S[x] !== 0) {
        unbornZero = false
      }
    }

    // the plain run at row t + 1 against the preborn run at row t
    if (previousBorn) {
      for (let k = 0; k < occ.length; k++) {
        shift = Math.max(shift, Math.abs(occ[k]! - previousBorn[k]!))
      }
    }

    const m = shellMeans(S, plain, Math.max(row - 1, 0), last + 1)

    means.push(m)
    spreads.push(Math.max(...m) - Math.min(...m))
    newestLeast.push(m.length > 1 && m.at(-1) === Math.min(...m))

    if (slow) {
      const Ss = dockEntropy(occupations(slow, N), N)
      const ms = shellMeans(
        Ss,
        plain,
        Math.floor(Math.max(row - 1, 0) / 2),
        last + 1,
      )

      slowNewestLeast.push(
        ms.length > 1 && ms.at(-1) === Math.min(...ms),
      )
    }

    if (row < T) {
      previousBorn = occupations(born, N)
      step(grown, plain, row)
      step(born, preborn, row)

      if (slow) {
        step(slow, slowBirth, row)
      }
    }
  }

  return {
    L,
    N,
    last,
    shells,
    means,
    unbornZero,
    seedZero,
    gram: Math.max(gramGap(grown), gramGap(born)),
    weight: Math.max(
      Math.abs(orbitalWeight(grown) - 192),
      Math.abs(orbitalWeight(born) - 192),
    ),
    shift,
    spreads,
    newestLeast,
    slowNewestLeast: slow ? slowNewestLeast : null,
    seconds: (Date.now() - started) / 1000,
  }
}

export default experiment({
  id: 'foundations/seed-minimal-entropy',
  code: 'E-FND-0174',
  title:
    'the seed is minimal and the frontier renews it (pending the gate run)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ================= Part A =================
    const box = arrowBox(SIDE, BLOCK)
    const R = reader(box)
    const vac = R.read(vacuumState(box))
    const lnB = Math.log(box.blocks)

    let agrees = vac.agrees

    // ---- C1: two held slots on two docks of the empty box ----
    const pair = emptyState(box)

    let sameBlock = 0
    let split = 0
    let pairOther = 0

    for (let x = 0; x < box.cells; x++) {
      for (let y = x + 1; y < box.cells; y++) {
        pair.vibe[x * 24] = 1
        pair.vibe[y * 24] = 1

        const r = R.read(pair)

        agrees &&= r.agrees

        if (r.h === 0 && box.block[x] === box.block[y]) {
          sameBlock++
        } else if (
          Math.abs(r.h - Math.LN2) <= 1e-15 &&
          box.block[x] !== box.block[y]
        ) {
          split++
        } else {
          pairOther++
        }

        pair.vibe[x * 24] = 0
        pair.vibe[y * 24] = 0
      }
    }

    const docksPerBlock = box.cells / box.blocks
    const C1 =
      pairOther === 0 &&
      sameBlock ===
        box.blocks * ((docksPerBlock * (docksPerBlock - 1)) / 2) &&
      split === (box.cells * (box.cells - 1)) / 2 - sameBlock

    log(
      `C1 ${C1}: same block ${sameBlock}, split ${split}, other ${pairOther}`,
    )

    // ---- H1: every one-dock start on the empty box ----
    const one = emptyState(box)

    fillDock(one, 0, 1, 0)

    const seedLeast = R.read(one)

    fillDock(one, 0, 24, 12)

    const seedFull = R.read(one)

    clearDock(one, 0)

    let starts = 0
    let below = 0
    let zero = 0
    let maxH = 0

    for (let x = 0; x < box.cells; x++) {
      for (let k = 0; k <= 24; k++) {
        for (let j = 0; j <= 12; j++) {
          if (k === 0 && j === 0) {
            continue
          }

          fillDock(one, x, k, j)

          const r = R.read(one)

          agrees &&= r.agrees
          starts++

          if (r.h < Math.min(seedLeast.h, seedFull.h)) {
            below++
          }

          if (r.h === 0 && r.nonzero === 1) {
            zero++
          }

          maxH = Math.max(maxH, r.h)
        }
      }

      clearDock(one, x)
    }

    const H1 =
      seedLeast.h === 0 &&
      seedFull.h === 0 &&
      below === 0 &&
      zero === starts
    const P1 = below > 0

    log(
      `H1 ${H1}: ${starts} starts, ${zero} at H = 0, ${below} below the seed`,
    )

    // ---- H2: every one-dock change of the coset-union vacuum ----
    const vs = vacuumState(box)
    const byDelta = new Map<
      number,
      { min: number; max: number; count: number }
    >()

    let vacStarts = 0

    for (let x = 0; x < box.cells; x++) {
      const savedStore = Array.from(
        vs.store.subarray(x * 12, x * 12 + 12),
      )
      const storedLines = savedStore.flatMap((v, l) =>
        v !== 0 ? [l] : [],
      )
      const freeLines = savedStore.flatMap((v, l) =>
        v === 0 ? [l] : [],
      )

      for (let k = 0; k <= 24; k++) {
        for (let i = 0; i <= storedLines.length; i++) {
          for (let j = 0; j <= freeLines.length; j++) {
            if (k === 0 && i === 0 && j === 0) {
              continue
            }

            for (let d = 0; d < 24; d++) {
              const slot = x * 24 + d

              vs.vibe[slot] = d < k ? (d % 2 === 0 ? 1 : -1) : 0
              vs.point[slot] =
                d < k ? Math.floor(9 * frac((slot + 1) * SILVER)) : 0
            }

            storedLines.forEach((l, r) => {
              vs.store[x * 12 + l] = r < i ? 0 : savedStore[l]!
            })

            freeLines.forEach((l, r) => {
              vs.store[x * 12 + l] = r < j ? (r % 2 === 0 ? 1 : -1) : 0
            })

            const r = R.read(vs)
            const delta = k + 2 * (j - i)
            const cell = byDelta.get(delta) ?? {
              min: Infinity,
              max: -Infinity,
              count: 0,
            }

            agrees &&= r.agrees
            cell.min = Math.min(cell.min, r.h)
            cell.max = Math.max(cell.max, r.h)
            cell.count++
            byDelta.set(delta, cell)
            vacStarts++
          }
        }
      }

      for (let d = 0; d < 24; d++) {
        vs.vibe[x * 24 + d] = 0
        vs.point[x * 24 + d] = 0
      }

      vs.store.set(savedStore, x * 12)
    }

    const deltas = [...byDelta.keys()].sort((a, b) => a - b)
    const positionFree = deltas.every(
      d => byDelta.get(d)!.max - byDelta.get(d)!.min <= 1e-14,
    )
    const leastH = Math.min(...deltas.map(d => byDelta.get(d)!.min))
    const leastDeltas = deltas.filter(
      d => byDelta.get(d)!.min === leastH,
    )
    const originStored = Array.from(
      vacuumState(box).store.subarray(0, 12),
    ).filter(v => v !== 0).length
    // the full dock at the origin: 24 held slots, every store line nonzero; its stored units were already there
    const originFullDelta = 24 + 2 * (12 - originStored)
    const fullOrigin = (() => {
      const s = vacuumState(box)

      for (let d = 0; d < 24; d++) {
        s.vibe[d] = d % 2 === 0 ? 1 : -1
        s.point[d] = Math.floor(9 * frac((d + 1) * SILVER))
      }

      for (let l = 0; l < 12; l++) {
        if (s.store[l] === 0) {
          s.store[l] = l % 2 === 0 ? 1 : -1
        }
      }

      return R.read(s)
    })()
    const H2 =
      positionFree &&
      leastDeltas.length === 1 &&
      leastDeltas[0] === 48 &&
      byDelta.get(48)!.count === 64 &&
      fullOrigin.h > leastH
    const I1 = agrees && Math.abs(vac.h - lnB) <= 1e-15

    log(
      `H2 ${H2}: ${vacStarts} starts, deltas ${deltas[0]}..${deltas[deltas.length - 1]}, least at ${leastDeltas.join(',')}`,
    )

    // ---- reported: the full-dock seed on the empty box, forward and back ----
    const seedState = emptyState(box)

    fillDock(seedState, 0, 24, 12)

    const dyn = (
      direction: 1 | -1,
    ): { first: number[]; zeros: number; late: number } => {
      const r = twoWay(box, seedState)
      const hs: number[] = []

      for (let t = 1; t <= DYNAMIC_BEATS; t++) {
        if (direction > 0) {
          r.forward()
        } else {
          r.backward()
        }

        hs.push(R.read(r.state()).h)
      }

      return {
        first: hs.slice(0, 4),
        zeros: hs.filter(h => h === 0).length,
        late:
          hs.slice(DYNAMIC_BEATS / 2).reduce((a, b) => a + b, 0) /
          (DYNAMIC_BEATS / 2),
      }
    }

    const fwd = dyn(1)
    const bwd = dyn(-1)

    log('dynamics')

    // ================= Part B =================
    const sides = SIDES_B.map(L => {
      const r = partB(L, ROWS[L]!)

      log(
        `L ${L}: shells ${r.shells.join(' ')}, shift ${r.shift.toExponential(2)}`,
      )

      return r
    })

    const I2 = sides.every(
      r =>
        r.gram <= GRAM_TOL &&
        r.weight <= WEIGHT_TOL &&
        r.unbornZero &&
        r.seedZero,
    )
    const window = (r: SideRead, from: number, to: number): number[] =>
      Array.from(
        { length: Math.max(to - from + 1, 0) },
        (_, i) => from + i,
      )
    const H3 = sides.every(r =>
      window(r, 3, ROWS[r.L]!).every(t => r.spreads[t]! > SPREAD_MIN),
    )
    const P2 = sides.some(r =>
      window(r, 3, ROWS[r.L]!).every(t => r.spreads[t]! < SPREAD_KILL),
    )
    const H4 = sides.every(r =>
      window(r, 3, r.last + 1).every(t => r.newestLeast[t]),
    )
    const C2 = sides.every(r =>
      window(r, r.last + 2, ROWS[r.L]!).some(t => !r.newestLeast[t]),
    )
    const Rgate = sides.every(r => r.shift <= SHIFT_TOL)

    const status =
      P1 || P2 || !H1 || !H3
        ? 'fail'
        : I1 && C1 && I2 && H2 && H4 && C2 && Rgate
          ? 'pass'
          : 'partial'

    const fmt = (xs: number[], digits = 3): string =>
      xs.map(x => x.toFixed(digits)).join(' ')
    const sideText = sides
      .map(
        r =>
          `L ${r.L} (N ${r.N}, shells ${r.shells.join(' ')}, ${r.seconds.toFixed(0)} s): Gram ${r.gram.toExponential(1)}, weight drift ${r.weight.toExponential(1)}, shift ${r.shift.toExponential(1)}; per row the born shells' mean S: ${r.means.map((m, t) => `t ${t}: ${fmt(m)}`).join('; ')}; newest least at rows ${r.newestLeast.flatMap((b, t) => (b ? [t] : [])).join(' ')}${r.slowNewestLeast ? `; slow wake newest least at rows ${r.slowNewestLeast.flatMap((b, t) => (b ? [t] : [])).join(' ')}` : ''}`,
      )
      .join('. ')

    return verdict({
      status,
      claim: `on E-FND-0146's coarse map (8 husk blocks, side-4 box), the seed (one dock distinct from the empty mesh that growth writes) reads H = 0, and all ${starts} one-dock starts read exactly 0 too (${below} below it): the seed is minimal, tied with every start of its size; on the coset-union vacuum a one-dock start's H depends only on its energy change, least at +48 (the full dock on one of the 64 store-free docks), so the full dock at the origin (+${originFullDelta}) is not minimal there; under register growth (chi empty, full seed) the born shells' mean occupation entropy spans ${Math.min(...sides.flatMap(r => window(r, 3, ROWS[r.L]!).map(t => r.spreads[t]!))).toFixed(3)} or more at rows 3 on, the newest shell least while the region grows (H4 ${H4}), and the grown run equals the seed in an already-born empty region one beat later (largest occupation difference ${Math.max(...sides.map(r => r.shift)).toExponential(1)})`,
      metrics: {
        gate_I1: flag(I1),
        gate_C1: flag(C1),
        gate_H1: flag(H1),
        gate_P1: flag(P1),
        gate_H2: flag(H2),
        gate_I2: flag(I2),
        gate_H3: flag(H3),
        gate_P2: flag(P2),
        gate_H4: flag(H4),
        gate_C2: flag(C2),
        gate_R: flag(Rgate),
        oneDockStarts: starts,
        oneDockAtZero: zero,
        oneDockBelowSeed: below,
        oneDockMaxH: maxH,
        pairSameBlock: sameBlock,
        pairSplit: split,
        vacuumH: vac.h,
        vacuumStarts: vacStarts,
        vacuumLeastDelta: leastDeltas[0] ?? NaN,
        vacuumLeastDeficit: lnB - leastH,
        vacuumFullOriginDeficit: lnB - fullOrigin.h,
        vacuumOriginStored: originStored,
        seedForwardZeros: fwd.zeros,
        seedBackwardZeros: bwd.zeros,
        seedForwardLateOverLnB: fwd.late / lnB,
        seedBackwardLateOverLnB: bwd.late / lnB,
        ...Object.fromEntries(
          sides.map(r => [`shift_L${r.L}`, r.shift]),
        ),
        ...Object.fromEntries(sides.map(r => [`gram_L${r.L}`, r.gram])),
        ...Object.fromEntries(
          sides.map(r => [
            `leastSpread_L${r.L}`,
            Math.min(
              ...window(r, 3, ROWS[r.L]!).map(t => r.spreads[t]!),
            ),
          ]),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        pairLowerThanSplitReference: sameBlock,
        lastShellNotLeastAfterGrowth: flag(C2),
      },
      notes: `L2. Gates I1 ${I1}, C1 ${C1}, H1 ${H1}, P1 ${P1}, H2 ${H2}, I2 ${I2}, H3 ${H3}, P2 ${P2}, H4 ${H4}, C2 ${C2}, R ${Rgate}. Part A: seed (one held slot) H ${seedLeast.h}, full seed H ${seedFull.h}; vacuum H ${vac.h} (ln 8 ${lnB}); deficit ln 8 - H by delta: ${deltas.map(d => `${d}: ${(lnB - byDelta.get(d)!.min).toExponential(3)} (${byDelta.get(d)!.count})`).join(', ')}; full dock at the origin deficit ${(lnB - fullOrigin.h).toExponential(3)}. The full-dock seed on the empty box, forward: H at beats 1 to 4 ${fmt(fwd.first)}, H exactly 0 on ${fwd.zeros} of ${DYNAMIC_BEATS} beats, mean over the last 100 ${fwd.late.toFixed(4)} (${(fwd.late / lnB).toFixed(3)} of ln 8); backward: ${fmt(bwd.first)}, ${bwd.zeros} zeros, ${bwd.late.toFixed(4)}. Part B: ${sideText}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
