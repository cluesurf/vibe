// THE COVARIANT COIN IN THE LOCKED KNIT (E-SPN-0091). E-SPN-0090 proved that a coin mixing a line's two slots is
// covariant under every discrete symmetry the knit keeps and is forbidden only by exact lattice-momentum conservation.
// Here it is put in: code/rule/coined-locked-knit, the doublet-locked knit with the stand-in token's coin
// 2C = (1 + w) I + (1 - w) X on every line (theta = -2 pi/3, no new number), applied before the meetings. The question
// is the electron's: does a lone vibe now have a mass, and does the light's drift phase then bind the knit's own three
// loves into the natural spin one half that travels, with g from Landau levels?
//
// WHAT THE COIN EXPOSES, derived before the run. The knit stores configurations with no sign on the stream or on the
// collision's bounce of a full line. While positions are classical this is one phase per history. The coin makes
// positions interfere, so the sign becomes physics. The canonical fermionic lift of a slot permutation (the parity
// of the permutation of occupied modes) is the knit's rule with `fermion: true`; its literal code with the coin is
// `fermion: false` ('native', hard-core bosons). On one bulk line the fermionic knit differs from E-SPN-0087's
// stand-in token in ONE place: the knit's lone-bounce collision swaps the two vibes of a full line, which as a mode
// permutation is -1, where the token lets them pass. So a like contact costs w (meeting) x -1 (bounce) = e^(-i pi/3) in
// the knit (contact energy +pi/3, repulsive) against w in the token (-2 pi/3, attractive), and E-SPN-0087's binding
// at contact does not carry. Separately, loves on PARALLEL bulk lines of one root share the husk line and never share a
// dock: the depth is a flavor that lifts Pauli, so the charge-one sectors on one husk line are
//   (i) [0,0,0] three on one bulk line, (iii) [0,0,1] two plus one on a parallel line, (ii) [0,1,2] one per line.
// Every one is closed under the rule (the coin keeps a vibe on its line, the collision keeps a lone vibe and flips a
// full line). A full 3D three-love spectrum (loves on crossing lines, turned by collisions) is out of memory reach on
// this machine and is not attempted; the husk-line sectors are where E-SPN-0088 found the lightest levels.
//
// GATES, fixed before the first run. Rule gates on the exact rule (Eisenstein integers); sector gates on
// code/measure/coined-line-bloch at D = 3 (N = 7), the first depth where E-SPN-0087's electron exists.
//  R1 bookkeeping: with no open vibe the coin is the identity: on the coset-union vacuum (side 8, 48 beats, 17 starts,
//     sign off since the vacuum holds stores) the coined beat equals the locked beat bit for bit, one branch
//  R2 exact: three open loves (two on one line of one dock, a third a dock away, Weyl points so meetings split), side
//     4, 8 beats, fermion sign on, each start's links: the norm is exact at every beat and the exact inverse returns
//     amplitude 1 on the start, on 17 of 17 starts
//  R3 covariant: the dock coin on one vibe commutes with all 1,152 W(F4) slot maps (24 slots each), a fear takes the
//     love's coefficients (C), and the adjoint coefficients are the conjugates of the forward ones taken through R
//     (T: R conj(C) R = C^-1)
//  R4 massive: on the coined knit's own beat (side 6, every one of the 24 slots of a dock, 17 starts) a lone open love
//     becomes (1 + w)/2 on its slot one dock along and (1 - w)/2 on the opposite slot one dock back, exactly: the
//     symbol S(k) C, whose band has rest gap 2 pi/3, curvature 1/sqrt 3 at K = 0 and top speed 1/2 (read by
//     code/measure/covariant-coin, 1e-6); the locked knit without the coin gives gap 0 (the control)
//  R5 the price, predicted by E-SPN-0090 H3: after one beat a lone love of root r holds momentum weight 1/4 on r and
//     3/4 on -r, so <P> = -r/2 against r before: the lattice momentum is not kept (exact)
//  C1 instrument: 'token' on sector (i) at box 16 reproduces E-SPN-0087's lightest (E-SPN-0087's own build and
//     lightestStreaming: unwrapped energy and spin one half share within 1e-9), and the full spectrum at K = 0.7 on
//     box 8 equals E-SPN-0087's operator's (sorted quasi-energies within 1e-9)
//  C2 the knit is the instrument: three open loves on one axis line of the side-6 box (flat links, equal points), 4
//     starts x 16 beats, fermion and native: the exact coined knit's configuration probabilities equal the
//     instrument's ring form (L = 6) within 1e-12, and no branch ever holds a love off the line
//  G1 the lightest charge-one level over sectors (i), (iii) and (ii) (its flavor sectors [3], [1,1,1], [2,1]) of the
//     fermionic coined knit, box 12, is the natural spin one half: share >= 0.95
//  G2 N = 3 and the 2 pi sign -1: every sector holds doublet labels only (no piece writes o) and C2's leak is 0
//  G3 compact: the lightest's weight at l >= N is at most 1e-3, and its sector's lightest on box 10 is within 1e-4
//  G4 travels: followed from K = 0 to pi in 12 steps (box 12) its band is at least 0.01 wide, its speed reaches 0.02
//     per beat, consecutive overlaps at least 0.5
//  G5 g from Landau levels: a Landau level needs a charged mover that encloses area; evaluable only if some lone vibe's
//     one-beat image leaves its bulk line (R4's images). Not evaluable is a fail
//  Verdict: pass if every gate holds.
//
// PREDICTIONS, written before the first run (a timing probe, tmp/spn91-probe1, printed sizes and seconds only).
//  R1 to R5, C1, C2, G2 pass. G1 FAILS: the fermionic knit's contact is repulsive (+pi/3), so sector (i) loses the
//  binding that made E-SPN-0087's electron, and the lightest level is in the depth-flavored sector (ii), symmetric
//  under the flavors, with a spin one half share under 0.5. G3 and G4 pass. G5 FAILS: the coin keeps every vibe on
//  its line (the mass is along the line only), so no orbit encloses area and g is undefined, as E-SPN-0089 found
//  without the coin. REPORTED beside G1: sector (i) under 'native' (predicted: bosonic, share under 0.95) and under
//  'token' (E-SPN-0087's electron, share 0.98).
//
// FIRST RUN (1,894 s, tmp/spn91-exp1.log): FAIL on G1, G4 and G5, no gate moved. R1 to R5, C1, C2, G2, G3 pass.
// The lone love is massive on the knit's own beat (24 of 24 slots, 17 of 17 starts; gap 2 pi/3, curvature 0.57735,
// top speed 0.5; uncoined gap 0) and its momentum goes r -> -r/2. The instrument equals E-SPN-0087 to 5.6e-17 and the
// exact knit to 1.1e-15. G1 FAILS as predicted: the lightest husk-line charge-one level is the depth-flavored (ii)
// [3] level, E 0.77413, spin one half share 0.2406 (compact: tail 4.6e-5, box shift 3.5e-9). The one-line cluster
// (i) is the heaviest sector, E 1.58831, share 0.2907, against the token's 0.33002 and 0.9824: the bounce's sign
// removes the contact binding (contact weight 0.118 against 0.918). NOT PREDICTED: the fermionic (i) and the native
// (i) have the SAME energy (1.58831, shares 0.2907 and 0.2118): in one dimension a fermion that bounces is a hard-core
// boson that passes, so the knit's collision turns its fermions into the bosons its literal code already was.
// Also: (iii) and (ii) [2,1] share their lightest energy (0.94926). G4 FAILS on one clause: the lightest travels
// (band 0.2217 wide, speed 0.1906) but the tracker's least overlap is 0.475, under the 0.5 fixed (a level crossing
// near K = 7 pi/12 by the energies' kink at 0.9773). G5 FAILS as predicted: every lone vibe stays on its bulk line.
//
// Depth L2: the knit's own rule with one new piece, on its own loves; the sector spectra are floats (measurement)
// checked against the exact rule by C2. HUSK FIRST: every sector is one husk line, every span a husk span.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  lockedBeat,
  lockedNorm,
  lockedState,
  lockedTables,
  norm,
  type Branch,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  coinBranch,
  coinedBeat,
  coinedBeatBack,
  newCoinTally,
} from '@/code/rule/coined-locked-knit'
import {
  lockedFresh,
  vacuumConfiguration,
  SILVER_RATE,
} from '@/code/measure/doublet-locked-readings'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { bandReading, weylF4 } from '@/code/measure/covariant-coin'
import {
  flavorSector,
  followLine,
  lineBasis,
  lineLightest,
  lineSpectrum,
  ringBeat,
  ringKey,
  wholeBasis,
  type LineLightest,
  type LineSector,
  type RingState,
  type Statistics,
  type SubBasis,
  type LineBasis,
} from '@/code/measure/coined-line-bloch'
import {
  boxSpec,
  build,
  lightestStreaming,
  lightN,
} from '@/code/measure/drift-cost-bloch'
import { quartetShare } from '@/code/measure/flux-store-bloch'
import { unitaryEigen } from '@/code/measure/quantum-ladder'

const ROOTS = rootsD4()
const D = 3
const N = lightN(D)
const THREE = ['love', 'love', 'love'] as const
const FERMION = { fermion: true }
const NATIVE = { fermion: false }

const emptyConfiguration = (cells: number): Configuration => ({
  vibe: new Int8Array(cells * 24),
  point: new Int8Array(cells * 24),
  open: new Uint8Array(cells * 24),
  store: new Int8Array(cells * 12),
  spoint: new Int8Array(cells * 12),
  sopen: new Uint8Array(cells * 12),
})

const sameConfig = (a: Configuration, b: Configuration): boolean => {
  for (let i = 0; i < a.vibe.length; i++) {
    if (
      a.vibe[i] !== b.vibe[i] ||
      (a.vibe[i] !== 0 &&
        (a.point[i] !== b.point[i] || a.open[i] !== b.open[i]))
    ) {
      return false
    }
  }

  for (let i = 0; i < a.store.length; i++) {
    if (
      a.store[i] !== b.store[i] ||
      (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])
    ) {
      return false
    }
  }

  return true
}

// ---- R1 ----
function bookkeeping(
  side: number,
  beats: number,
): { mismatches: number; branchesMax: number } {
  const f = lockedFresh(side)

  let a: LockedState = lockedState(vacuumConfiguration(f, 'none'))
  let b: LockedState = lockedState(vacuumConfiguration(f, 'none'))
  let mismatches = 0
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    a = lockedBeat(f.tables, a, t)
    b = coinedBeat(f.tables, b, t, NATIVE)
    branchesMax = Math.max(branchesMax, b.branches.length)

    const x = b.branches[0]!
    const y = a.branches[0]!

    if (
      b.branches.length !== 1 ||
      !sameConfig(x, y) ||
      x.a !== y.a ||
      x.b !== y.b ||
      x.k !== y.k
    ) {
      mismatches++
    }
  }

  return { mismatches, branchesMax }
}

// ---- R2 ----
function superposition(beats: number): {
  normExact: boolean
  reversed: boolean
  branchesMax: number
  splits: number
} {
  const side = 4
  const tables = lockedTables(
    makeColorWeave({ side, table: 'bind' }),
    'lone',
  )
  const cells = tables.cells
  const start = emptyConfiguration(cells)
  const d1 = ((1 * SILVER_RATE) % 65536) % 24
  const second = tables.target[0 * 24 + d1]!
  const third =
    Math.floor(second / 24) * 24 + (((3 * SILVER_RATE) % 65536) % 24)
  const slots = [
    d1,
    OPPOSITE[d1]!,
    third === d1 || third === OPPOSITE[d1]! ? third + 24 : third,
  ]

  slots.forEach((s, n) => {
    start.vibe[s] = 1
    start.open[s] = 1
    start.point[s] = (((n + 1) * SILVER_RATE) % 65536) % 9
  })

  let s: LockedState = lockedState(start)

  const tally = newCoinTally()

  let normExact = true
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    s = coinedBeat(tables, s, t, FERMION, undefined, tally)

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)
  }

  for (let t = beats - 1; t >= 0; t--) {
    s = coinedBeatBack(tables, s, t, FERMION)
  }

  const b0 = s.branches[0]
  const reversed =
    s.branches.length === 1 &&
    !!b0 &&
    b0.a === 1n &&
    b0.b === 0n &&
    b0.k === 0 &&
    sameConfig(b0, start)

  return { normExact, reversed, branchesMax, splits: tally.splits }
}

// ---- R3 ----
function covariance(): {
  mismatches: number
  checks: number
  fearSame: boolean
  timeSymmetric: boolean
} {
  const group = weylF4()

  const one = (slot: number, vibe: number): Branch => {
    const c = emptyConfiguration(1)

    c.vibe[slot] = vibe
    c.open[slot] = 1

    return { ...c, a: 1n, b: 0n, k: 0 }
  }

  const image = (br: Branch[]): Map<number, string> =>
    new Map(
      br.map(b => [
        b.vibe.findIndex(v => v !== 0),
        `${b.a},${b.b},${b.k}`,
      ]),
    )

  let mismatches = 0
  let checks = 0

  for (const g of group) {
    for (let d = 0; d < 24; d++) {
      // coin then g, against g then coin
      const left = new Map(
        [...image(coinBranch(1, one(d, 1), false))].map(([s, v]) => [
          g[s]!,
          v,
        ]),
      )
      const right = image(coinBranch(1, one(g[d]!, 1), false))

      checks++

      if (
        left.size !== right.size ||
        [...left].some(([s, v]) => right.get(s) !== v)
      ) {
        mismatches++
      }
    }
  }

  const fearSame = [...image(coinBranch(1, one(0, -1), false))].every(
    ([s, v]) => image(coinBranch(1, one(0, 1), false)).get(s) === v,
  )
  // T: the adjoint coefficients are the conjugates of the forward ones (R keeps "same slot" and "opposite slot")
  const conj = (a: bigint, b: bigint): [bigint, bigint] => [a - b, -b]
  const fwd = coinBranch(1, one(0, 1), false)
  const adj = coinBranch(1, one(0, 1), true)
  const timeSymmetric = fwd.every(f => {
    const at = f.vibe.findIndex(v => v !== 0)
    const m = adj.find(x => x.vibe.findIndex(v => v !== 0) === at)
    const [ca, cb] = conj(f.a, f.b)

    return !!m && m.a === ca && m.b === cb && m.k === f.k
  })

  return { mismatches, checks, fearSame, timeSymmetric }
}

// ---- R4, R5, G5: a lone love's one-beat images on the knit's own rule ----
function loneImages(side: number): {
  exact: number
  slots: number
  onLine: number
  momentumQuarter: boolean
  controlMassless: boolean
} {
  const tables = lockedTables(
    makeColorWeave({ side, table: 'bind' }),
    'lone',
  )
  const cells = tables.cells

  let exact = 0
  let onLine = 0
  let momentumQuarter = true
  let controlMassless = true

  for (let d = 0; d < 24; d++) {
    const c = emptyConfiguration(cells)

    c.vibe[d] = 1
    c.open[d] = 1

    const s = coinedBeat(tables, lockedState(c), 0, FERMION)
    const keepAt = tables.target[d]!
    const crossAt = tables.target[OPPOSITE[d]!]!
    const found = (slot: number): Branch | undefined =>
      s.branches.find(
        b =>
          b.vibe[slot] === 1 &&
          b.vibe.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0) === 1,
      )
    const k = found(keepAt)
    const x = found(crossAt)

    if (
      s.branches.length === 2 &&
      k &&
      x &&
      k.a === 1n &&
      k.b === 1n &&
      k.k === 1 &&
      x.a === 1n &&
      x.b === -1n &&
      x.k === 1
    ) {
      exact++
    }

    // both images on the love's own bulk line: the same line class, one dock along +r and -r
    if (
      k &&
      x &&
      LINE_OF[keepAt % 24] === LINE_OF[d] &&
      LINE_OF[crossAt % 24] === LINE_OF[d]
    ) {
      onLine++
    }

    // <P> weights: N(1 + w) / 4 on r, N(1 - w) / 4 on -r
    momentumQuarter =
      momentumQuarter &&
      !!k &&
      !!x &&
      norm(k.a, k.b) === 1n &&
      norm(x.a, x.b) === 3n

    const plain = lockedBeat(tables, lockedState(c), 0)

    controlMassless =
      controlMassless &&
      plain.branches.length === 1 &&
      plain.branches[0]!.vibe[keepAt] === 1
  }

  return { exact, slots: 24, onLine, momentumQuarter, controlMassless }
}

// ---- C2: the knit's line sector against the instrument's ring ----
type LineMap = {
  tables: ReturnType<typeof lockedTables>
  first: number
  second: number
  ring: number[]
  position: Map<number, number>
}

function axisLine(side: number): LineMap {
  const weave = makeColorWeave({ side, table: 'bind' })
  const flat = new Int16Array(weave.mesh.cellCount * 24).fill(
    weave.moves.identity,
  )
  const tables = lockedTables(weave, 'lone', flat)
  const r = ROOTS.findIndex(
    v => v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 1,
  )
  const l = LINE_OF[r]!
  const first = LINE_FIRSTS[l]!
  const second = OPPOSITE[first]!
  const ring: number[] = [0]
  const position = new Map<number, number>([[0, 0]])

  for (;;) {
    const next = Math.floor(
      tables.target[ring[ring.length - 1]! * 24 + first]! / 24,
    )

    if (next === 0) {
      break
    }

    position.set(next, ring.length)
    ring.push(next)
  }

  return { tables, first, second, ring, position }
}

function lineAgreement(
  side: number,
  statistics: Statistics,
  starts: readonly (readonly [number, number][])[],
  beats: number,
): { worst: number; leaks: number; compared: number; L: number } {
  const m = axisLine(side)
  const L = m.ring.length
  const sector: LineSector = {
    flavors: [0, 0, 0],
    statistics,
    D,
    box: L,
  }

  let worst = 0
  let leaks = 0
  let compared = 0

  for (const st of starts) {
    const c = emptyConfiguration(m.tables.cells)

    let ringState: RingState = new Map()

    const ts = st.map(([x, j]) => ({ x, j, f: 0 }))

    ringState.set(ringKey(ts), {
      ts: ts
        .map(t => ({ ...t }))
        .sort(
          (p, q) =>
            2 * p.x +
            (p.j === 0 ? 1 : 0) -
            (2 * q.x + (q.j === 0 ? 1 : 0)),
        ),
      amp: [1, 0],
    })

    for (const [x, j] of st) {
      const slot = m.ring[x]! * 24 + (j === 0 ? m.first : m.second)

      c.vibe[slot] = 1
      c.open[slot] = 1
    }

    let s: LockedState = lockedState(c)

    for (let t = 0; t < beats; t++) {
      s = coinedBeat(
        m.tables,
        s,
        t,
        statistics === 'fermion' ? FERMION : NATIVE,
      )
      ringState = ringBeat(sector, L, ringState)

      const knit = new Map<string, number>()

      for (const b of s.branches) {
        const toks: { x: number; j: number; f: number }[] = []

        for (let i = 0; i < b.vibe.length; i++) {
          if (b.vibe[i] === 0) {
            continue
          }

          const cell = Math.floor(i / 24)
          const d = i % 24
          const x = m.position.get(cell)

          if (x === undefined || (d !== m.first && d !== m.second)) {
            leaks++
            continue
          }

          toks.push({ x, j: d === m.first ? 0 : 1, f: 0 })
        }

        if (toks.length !== 3) {
          continue
        }

        const key = ringKey(toks)
        const p = Number(norm(b.a, b.b)) / 4 ** b.k

        knit.set(key, (knit.get(key) ?? 0) + p)
      }

      const keys = new Set([...knit.keys(), ...ringState.keys()])

      for (const k of keys) {
        const r = ringState.get(k)
        const pr = r ? r.amp[0] ** 2 + r.amp[1] ** 2 : 0

        worst = Math.max(worst, Math.abs((knit.get(k) ?? 0) - pr))
      }

      compared++
    }
  }

  return { worst, leaks, compared, L }
}

// ---- the sectors ----
type SectorRow = {
  name: string
  box: number
  statistics: Statistics
  basis: LineBasis
  sub: SubBasis
  lp: LineLightest
}

function sectorRows(
  box: number,
  statistics: Statistics,
  log: (s: string) => void,
): SectorRow[] {
  const rows: SectorRow[] = []
  const one: [string, readonly [number, number, number]][] = [
    ['(i) one line', [0, 0, 0]],
    ['(iii) two plus one', [0, 0, 1]],
  ]

  for (const [name, flavors] of one) {
    const basis = lineBasis({ flavors, statistics, D, box })
    const sub = wholeBasis(basis)

    rows.push({
      name,
      box,
      statistics,
      basis,
      sub,
      lp: lineLightest(basis, sub),
    })
    log(`${name} box ${box} ${statistics}`)
  }

  const three = lineBasis({ flavors: [0, 1, 2], statistics, D, box })

  for (const kind of ['sym', 'anti', 'mixed'] as const) {
    const sub = flavorSector(three, kind)

    rows.push({
      name: `(ii) one per line, ${kind}`,
      box,
      statistics,
      basis: three,
      sub,
      lp: lineLightest(three, sub),
    })
    log(`(ii) ${kind} box ${box}`)
  }

  return rows
}

export default experiment({
  id: 'spin/coined-knit-electron',
  code: 'E-SPN-0091',
  title:
    "the covariant coin in the doublet-locked knit: a lone vibe gains the stand-in's mass (rest gap 2 pi/3, top speed 1/2) at the price of the lattice momentum, and the coin makes the fermion sign physical; on the husk-line charge-one sectors (three loves on one bulk line, two plus one, one per parallel line) whether the drift phase binds the natural spin one half that travels, and whether g can be read",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)

    // ---- R1, R2, R4 over the start family ----
    const perStart = family.map(member =>
      withStart(member, () => {
        const r1 = bookkeeping(8, 48)
        const r2 = superposition(8)
        const r4 = loneImages(6)

        log(`start ${member.name}`)

        return { name: member.name, r1, r2, r4 }
      }),
    )
    const gR1 = perStart.every(
      p => p.r1.mismatches === 0 && p.r1.branchesMax === 1,
    )
    const gR2 = perStart.every(
      p => p.r2.normExact && p.r2.reversed && p.r2.splits > 0,
    )
    const cov = covariance()
    const gR3 =
      cov.mismatches === 0 &&
      cov.checks === 1152 * 24 &&
      cov.fearSame &&
      cov.timeSymmetric
    const band = bandReading(-2)
    const bandMiss = Math.max(
      Math.abs(band.gap - (2 * Math.PI) / 3),
      Math.abs(band.curvature - 1 / Math.sqrt(3)),
      Math.abs(band.topSpeed - 0.5),
    )
    const control = bandReading(0)
    const gR4 =
      perStart.every(p => p.r4.exact === 24 && p.r4.controlMassless) &&
      bandMiss < 1e-6 &&
      control.gap < 1e-12
    const gR5 = perStart.every(p => p.r4.momentumQuarter)

    log('R')

    // ---- C1 ----
    const tokenBasis = lineBasis({
      flavors: [0, 0, 0],
      statistics: 'token',
      D,
      box: 16,
    })
    const tokenMine = lineLightest(tokenBasis, wholeBasis(tokenBasis))
    const ref = build(boxSpec(THREE, D, 16), 0)
    const refLp = lightestStreaming(ref, 2 * 16 + 6)
    const refShare = 1 - quartetShare(ref.bloch, refLp.level.vector)
    const c1Energy = Math.abs(
      tokenMine.lightest.unwrapped - refLp.unwrapped,
    )
    const c1Share = Math.abs(tokenMine.lightest.spinHalf - refShare)
    const small = lineBasis({
      flavors: [0, 0, 0],
      statistics: 'token',
      D,
      box: 8,
    })
    const mineSpec = lineSpectrum(small, wholeBasis(small), 0.7)
    const refSmall = build(boxSpec(THREE, D, 8), 0.7)
    const refSpec = unitaryEigen(
      refSmall.red.dim,
      refSmall.red.re,
      refSmall.red.im,
    )
      .phases.map(p => {
        let e = -p

        while (e <= -Math.PI) {
          e += 2 * Math.PI
        }

        while (e > Math.PI) {
          e -= 2 * Math.PI
        }

        return e
      })
      .sort((a, b) => a - b)
    const c1Spectrum =
      mineSpec.length === refSpec.length
        ? Math.max(...mineSpec.map((e, i) => Math.abs(e - refSpec[i]!)))
        : Number.POSITIVE_INFINITY
    const gC1 = c1Energy < 1e-9 && c1Share < 1e-9 && c1Spectrum < 1e-9

    log('C1')

    // ---- C2 ----
    const starts: [number, number][][] = [
      [
        [0, 0],
        [1, 1],
        [3, 0],
      ],
      [
        [0, 0],
        [0, 1],
        [2, 0],
      ],
      [
        [0, 0],
        [2, 0],
        [4, 1],
      ],
      [
        [1, 1],
        [2, 1],
        [5, 0],
      ],
    ]
    const c2 = (['fermion', 'native'] as const).map(st => ({
      statistics: st,
      ...lineAgreement(6, st, starts, 16),
    }))
    const gC2 = c2.every(
      r =>
        r.worst < 1e-12 &&
        r.leaks === 0 &&
        r.compared === 64 &&
        r.L === 6,
    )

    log('C2')

    // ---- G1: the sectors of the fermionic knit, box 12 ----
    const rows = sectorRows(12, 'fermion', log)
    const sorted = rows
      .slice()
      .sort((a, b) => a.lp.lightest.unwrapped - b.lp.lightest.unwrapped)
    const lightest = sorted[0]!
    const g1 = lightest.lp.lightest.spinHalf >= 0.95

    // ---- G2 ----
    const g2 = gC2

    // ---- G3 ----
    const smallRows = sectorRows(10, 'fermion', log)
    const twin = smallRows.find(r => r.name === lightest.name)!
    const boxShift = Math.abs(
      twin.lp.lightest.unwrapped - lightest.lp.lightest.unwrapped,
    )
    const g3 = lightest.lp.lightest.tailN <= 1e-3 && boxShift <= 1e-4

    // ---- G4 ----
    const follow = followLine(
      lightest.basis,
      lightest.sub,
      lightest.lp.lightest,
      12,
    )
    const g4 =
      follow.bandwidth >= 0.01 &&
      follow.velocity >= 0.02 &&
      follow.minOverlap >= 0.5

    log('G4')

    // ---- G5 ----
    const g5 = perStart.some(p => p.r4.onLine < 24)

    // ---- REPORTED: sector (i) under the other statistics, box 12 ----
    const others = (['native', 'token'] as const).map(st => {
      const basis = lineBasis({
        flavors: [0, 0, 0],
        statistics: st,
        D,
        box: 12,
      })

      return {
        statistics: st,
        lp: lineLightest(basis, wholeBasis(basis)),
      }
    })

    log('reported')

    const ok =
      gR1 &&
      gR2 &&
      gR3 &&
      gR4 &&
      gR5 &&
      gC1 &&
      gC2 &&
      g1 &&
      g2 &&
      g3 &&
      g4 &&
      g5
    const rowText = (r: SectorRow): string =>
      `${r.name} (dim ${r.lp.dim}): E ${r.lp.lightest.unwrapped.toFixed(5)} (raw ${r.lp.lightest.energy.toFixed(5)}, offset ${Math.abs(r.lp.lightest.unwrapped - r.lp.lightest.reference).toFixed(3)}), spin one half ${r.lp.lightest.spinHalf.toFixed(4)}, <l> ${r.lp.lightest.mean.toFixed(3)}, tail at N ${r.lp.lightest.tailN.toExponential(1)}, contact ${r.lp.lightest.contact.toFixed(4)}, particle ${r.lp.lightest.even.toFixed(3)}, next ${r.lp.next.toFixed(5)}, residual ${r.lp.residual.toExponential(1)}, leak ${r.lp.leak.toExponential(1)}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the coin 2C = (1 + w) + (1 - w) X in the doublet-locked knit: with no open vibe it is the locked knit bit for bit (17 of 17), exact with the fermion sign (norm and reversal on ${perStart.filter(p => p.r2.normExact && p.r2.reversed).length} of 17), covariant under all 1,152 W(F4) maps, C and T; a lone love on the knit's own beat becomes (1 + w)/2 one dock along and (1 - w)/2 one dock back on 24 of 24 slots and 17 of 17 starts, a band with rest gap ${band.gap.toFixed(6)}, curvature ${band.curvature.toFixed(6)} and top speed ${band.topSpeed.toFixed(6)} where the uncoined knit has gap 0: the vibe is massive, and its momentum after one beat is -r/2 against r (the price E-SPN-0090 named); the instrument reproduces E-SPN-0087 (${c1Energy.toExponential(1)}, ${c1Share.toExponential(1)}, spectrum ${c1Spectrum.toExponential(1)}) and the exact knit's line sector (${c2.map(r => `${r.statistics} ${r.worst.toExponential(1)}`).join(', ')}, 0 leaks); the fermionic knit's lightest husk-line charge-one level is ${lightest.name} at E ${lightest.lp.lightest.unwrapped.toFixed(5)}, spin one half share ${lightest.lp.lightest.spinHalf.toFixed(4)}, tail ${lightest.lp.lightest.tailN.toExponential(1)}, box shift ${boxShift.toExponential(1)}, band ${follow.bandwidth.toFixed(4)} wide, speed ${follow.velocity.toFixed(4)}; the one-line cluster under the same rule reads E ${rows[0]!.lp.lightest.unwrapped.toFixed(5)}, share ${rows[0]!.lp.lightest.spinHalf.toFixed(4)} (native ${others[0]!.lp.lightest.unwrapped.toFixed(5)}, ${others[0]!.lp.lightest.spinHalf.toFixed(4)}; the stand-in token ${others[1]!.lp.lightest.unwrapped.toFixed(5)}, ${others[1]!.lp.lightest.spinHalf.toFixed(4)}); every lone vibe stays on its bulk line, so no orbit encloses area and g is not evaluable`,
      metrics: {
        gate_R1: gR1 ? 1 : 0,
        gate_R2: gR2 ? 1 : 0,
        gate_R3: gR3 ? 1 : 0,
        gate_R4: gR4 ? 1 : 0,
        gate_R5: gR5 ? 1 : 0,
        gate_C1: gC1 ? 1 : 0,
        gate_C2: gC2 ? 1 : 0,
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        starts: family.length,
        restGap: band.gap,
        curvature: band.curvature,
        topSpeed: band.topSpeed,
        loneExactSlots: Math.min(...perStart.map(p => p.r4.exact)),
        superposeBranchesMax: Math.max(
          ...perStart.map(p => p.r2.branchesMax),
        ),
        superposeSplitsMin: Math.min(...perStart.map(p => p.r2.splits)),
        covarianceChecks: cov.checks,
        covarianceMismatches: cov.mismatches,
        c1EnergyGap: c1Energy,
        c1ShareGap: c1Share,
        c1SpectrumGap: c1Spectrum,
        c2FermionWorst: c2[0]!.worst,
        c2NativeWorst: c2[1]!.worst,
        c2Leaks: c2.reduce((s, r) => s + r.leaks, 0),
        lightestEnergy: lightest.lp.lightest.unwrapped,
        lightestSpinHalf: lightest.lp.lightest.spinHalf,
        lightestTail: lightest.lp.lightest.tailN,
        lightestMeanString: lightest.lp.lightest.mean,
        boxShift,
        bandWidth: follow.bandwidth,
        bandVelocity: follow.velocity,
        bandMinOverlap: follow.minOverlap,
        ...Object.fromEntries(
          rows.flatMap((r, k) => [
            [`sector${k}_energy`, r.lp.lightest.unwrapped],
            [`sector${k}_spinHalf`, r.lp.lightest.spinHalf],
            [`sector${k}_dim`, r.lp.dim],
          ]),
        ),
        nativeOneLineEnergy: others[0]!.lp.lightest.unwrapped,
        nativeOneLineSpinHalf: others[0]!.lp.lightest.spinHalf,
        tokenOneLineEnergy: others[1]!.lp.lightest.unwrapped,
        tokenOneLineSpinHalf: others[1]!.lp.lightest.spinHalf,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        uncoinedGap: control.gap,
        token16Energy: tokenMine.lightest.unwrapped,
        token16SpinHalf: tokenMine.lightest.spinHalf,
        reference16Energy: refLp.unwrapped,
        reference16SpinHalf: refShare,
      },
      notes: `L2. Gates R1 ${gR1}, R2 ${gR2}, R3 ${gR3}, R4 ${gR4}, R5 ${gR5}, C1 ${gC1}, C2 ${gC2}, G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. Per start (R1 mismatches; R2 norm, reversal, branches max, splits; R4 exact slots, on-line slots): ${perStart.map(p => `${p.name} ${p.r1.mismatches}; ${p.r2.normExact}, ${p.r2.reversed}, ${p.r2.branchesMax}, ${p.r2.splits}; ${p.r4.exact}, ${p.r4.onLine}`).join(' | ')}. Band of the coin (code/measure/covariant-coin, theta = -2 pi/3): gap ${band.gap.toFixed(9)}, curvature ${band.curvature.toFixed(9)}, top speed ${band.topSpeed.toFixed(9)} (miss ${bandMiss.toExponential(1)}); uncoined gap ${control.gap.toExponential(1)}. Covariance: ${cov.checks} checks, ${cov.mismatches} off, fear ${cov.fearSame}, T ${cov.timeSymmetric}. C1 at box 16: mine E ${tokenMine.lightest.unwrapped.toFixed(9)} share ${tokenMine.lightest.spinHalf.toFixed(9)}, E-SPN-0087's E ${refLp.unwrapped.toFixed(9)} share ${refShare.toFixed(9)}; spectrum at K = 0.7, box 8: ${mineSpec.length} levels, worst ${c1Spectrum.toExponential(1)}. C2 (ring ${c2[0]!.L}): ${c2.map(r => `${r.statistics} worst ${r.worst.toExponential(1)}, leaks ${r.leaks}, beats compared ${r.compared}`).join('; ')}. Fermionic sectors, box 12: ${rows.map(rowText).join(' || ')}. Box 10: ${smallRows.map(r => `${r.name} E ${r.lp.lightest.unwrapped.toFixed(5)} share ${r.lp.lightest.spinHalf.toFixed(4)}`).join('; ')}. Band of the lightest (K = 0 to pi, 12 steps): ${follow.energies.map(e => e.toFixed(4)).join(' ')} (min overlap ${follow.minOverlap.toFixed(3)}, worst residual ${follow.worstResidual.toExponential(1)}). Sector (i), box 12, other statistics: ${others.map(o => `${o.statistics} E ${o.lp.lightest.unwrapped.toFixed(5)}, share ${o.lp.lightest.spinHalf.toFixed(4)}, <l> ${o.lp.lightest.mean.toFixed(3)}, tail ${o.lp.lightest.tailN.toExponential(1)}, contact ${o.lp.lightest.contact.toFixed(4)}`).join('; ')}. THE BOX is measurement. The sectors are the husk-line ones; loves on crossing lines are not in any sector computed here. The cluster sectors use flat links (equal points); the 17 starts enter R1, R2 and R4.`,
    })
  },
})
