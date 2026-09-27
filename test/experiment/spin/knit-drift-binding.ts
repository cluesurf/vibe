// The drift-cost binding carried off one line onto the DOUBLET-LOCKED KNIT'S OWN LOVES (E-SPN-0088). Not a stand-in
// token: each love is a vibe on one of the 24 slots of a bulk D4 dock, copied along its slot's root by the adopted
// knit (code/rule/doublet-locked-knit), met by its 2U meeting, turned by its lone-bounce collision. The cost is the
// light's drift phase per husk flux link, zeta_(2N)^(-l) per beat, on a Z3 center-flux register read on the husk and
// written only by the recorded hop, Gauss exact (code/measure/knit-love-cluster).
//
// THE PATCH. The full 3D husk (x1, x2, x3 unbounded) over columns of depth L (x4 periodic, period 2L, L = 4 and 8, the
// knit's own boxes). Three loves are held as registers, not as a field over the box, so 3D is in memory reach and no
// 2D slice is needed. Cost at D = 3 (N = 7), the first depth where E-SPN-0087's line electron exists.
//
// WHAT CARRIES AND WHAT DOES NOT, derived before any run. On the line (E-SPN-0086, 0087) the stand-in token has a COIN,
// 2C on its doublet labels, so a token's position carries amplitude and a phase that depends on the positions can bind
// it. The knit's lone love has no coin: E-RLT-0097 L7 measured that the knit restricted to one line IS the locked token
// with its coin removed (a lone vibe keeps its slot on 24 of 24 slots, massless). For a love-only cluster every piece of
// the knit is a function of the OCCUPATION alone: the meeting keeps the occupation in both its terms (it exchanges
// points), the pair move needs a fear, the lone-bounce collision reads only which slots are held, the stream is a
// permutation. So THE OCCUPATION IS CLASSICAL: one occupation history, the same in every branch and on every link start.
// The flux is written only by recorded hops, so it too is a function of that one history, and the drift cost is ONE
// PHASE PER HISTORY: it can shift a level's quasi-energy, never mix two occupations, never make or break a bound state.
// Whether three loves stay together is decided by the collision alone. (The adopted point-reading neutral veto is the
// one piece that lets a position carry amplitude, E-RLT-0098, and it needs a fear; with the occupation veto of the
// solutions map section 1 the statement holds on any vacuum.)
//
// So the question becomes a census, which is exact integer bookkeeping: which three-love occupation cycles stay compact
// on the husk, what does each cost, and which is lightest.
//
// DEFINITIONS, fixed before the run.
//  - A LEVEL is an occupation cycle mod translation (bulk D4 translations, x4 mod 2L) whose husk span stays at most
//    RMAX = 6 at every beat and whose flux, started from the Gauss strings (code/measure/knit-love-cluster
//    gaussStrings; zero flux when all three share a column), returns to its own translate after every period
//    (checked over 3 periods). A cycle whose flux does not return lays a growing string and is not a level.
//  - Its reference energy E = (1/T) sum over one period of [ (pi/N) l_t - (2 pi / 3) m_t ], l_t the flux links at
//    beat t, m_t the like meetings (each a phase w at equal points: the knit's contact, E-SPN-0076's contact energy).
//    The LIGHTEST charge-one cluster is the level of least E (ties: all reported).
//  - The census: every start with two loves on one bulk dock (every orbit that collides passes through one) and the
//    third within 2 husk steps in each direction, every depth and slot (3,307,400 starts at L = 4), followed to 96
//    beats; plus the collision-free family, loves on one root (they never share a dock), which holds the column stack.
//  - The spin one half share: E-SPN-0077's role [2,1] reading with a love's position = (dock, line) and label = its
//    slot's doublet label (0 first slot, 1 second), exactly the stand-in's reading when the loves share a line, taken
//    on every level (quasi-energy index k) of a cycle at K = 0, antisymmetrized.
//
// GATES, fixed before the first run.
//  K1 the occupation is classical, on the exact rule: code/rule/doublet-locked-knit's lockedBeat, every love open, the
//     points set by an integer Weyl rate so like meetings split, 8 starts (each with a head-on pair) x 12 beats on the
//     side-8 box, under each of the 17 link starts: every branch holds one occupation at every beat, equal to the
//     occupation map of code/measure/knit-love-cluster (0 mismatches), and the state does split (branches > 1). A
//     start's comparison stops at the first beat where the box's period (8 D4) puts two loves the unbounded patch
//     keeps apart on one box dock (the two are then different rules); the compared beats are counted and must be at
//     least 4 per start on average
//  K2 Gauss exact: 0 violations of husk Gauss mod 3 at every beat of every level read and of every column stack
//  G1 the lightest charge-one cluster is the natural spin one half: share >= 0.95 on every one of its levels
//  G2 N = 3 and the 2 pi sign -1: every love of the lightest level holds a doublet label at every beat (the knit has
//     no rest state), so N = 3 and the turn is (-1)^3
//  G3 compact: the lightest level is a level (husk span <= RMAX, flux closes)
//  G4 travels: its husk shift per period h != 0, so its band E(K) = (Phi + K.h) / T has width pi |h| / T > 0 over
//     K from 0 to pi along h, and group velocity |h| / T > 0 (husk units per beat)
//  G5 the 17 starts: K1 holds on all 17, so the census, the lightest level and G1 to G4 are the same on every start
//  Verdict: pass if K1, K2, G1 to G5 hold; fail otherwise.
//
// PREDICTIONS, written before the first run (a timing probe, tmp/kb-probe1, printed only sizes and seconds).
//  P1 K1, K2 pass (the theorem above).
//  P2 the lightest level is the COLUMN STACK: three loves on one root at depths 0, 2, 4 of one column. They never share
//     a dock, so no meeting and no collision; the column holds three loves, 0 mod 3, so the Gauss flux is 0, and the
//     three hops land on one husk link each beat (-3 = 0 mod 3), so l = 0 forever: E = 0 exactly. It travels at its
//     root's husk shadow (|h| = 1 on an axis, sqrt 2 on a diagonal, per beat). Its three labels are equal, so it is
//     role [3], the spin three halves: spin one half share 0. G1 FAILS, G2 to G5 pass.
//  P3 no census cycle is lighter than the stack: a meeting's contact is negative, but two loves meet only head-on on
//     one line, which the collision turns back into two separating loves.
//  P4 loves on one root in two or three columns lay strings: l grows every period, not a level.
// The binding therefore does NOT carry: the drift phase binds a mover only where a coin lets its position carry
// amplitude, and the knit's lone love has none.
//
// FIRST RUN (58 s, tmp/kb-spn88-run1.log): FAIL on G1 only, no gate moved. K1 0 mismatches on 17 of 17 starts (4
// compared beats on each of the 8 cluster starts, each stopped by the side-8 box's aliasing at beat 4, exactly the
// gate's minimum; 8 splitting meetings, 2 branches), K2 0 Gauss violations. Census:
// 3,307,400 starts at L = 4 (5,976 compact cycles, 0 held) and 6,619,400 at L = 8 (11,952, 0 held); every compact
// cycle has no like meeting; 648 close their flux. The lightest level has E = 0 exactly and is 120-fold: the 48
// one-root stacks and 72 census cycles with husk span 0 (three loves in one column on one husk shadow with depth
// velocities +1 and -1, colliding where their depths coincide). Its spin one half share is 0 on every level (role [3],
// spin three halves), N = 3, compact, travelling at 1 husk unit a beat (band pi wide over K = 0 to pi). P2 was right
// on the stack and incomplete on the family: the lightest level is every one-column, one-shadow cluster, not only
// the one-root stack. P3, P4 held. The count 120 is a lower bound: the one-root stack was read at depth pattern (0, 2,
// 4) only, which is every class at L = 4 but one of seven at L = 8; E-SPN-0089 enumerates the one-column family
// completely at L = 4. No gate depends on the count. SECOND RUN: the first run's notes listed every level (650 kB); they are grouped now,
// and the structure counts of tmp/kb-probe2 (a reading probe run after run 1, disclosed) are added as REPORTED
// numbers. No gate, rule or instrument changed; every run-1 number is reproduced.
//
// Depth L2 for the census and the readings (the knit's own rule, exact integers, measured); the classical-occupation
// statement is L1 (a theorem, checked on the exact rule). HUSK FIRST: every compactness, shift and span is a husk
// number; the depth enters only as the column's period.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { lockedBeat, lockedState, lockedTables, newTally, type Configuration, type LockedState } from '@/code/rule/doublet-locked-knit'
import { d4BoxCell, d4Coordinates } from '@/code/substrate/d4-box'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { OPP, LABEL, SHADOW_DIR, SHADOW_SIGN, clusterBeat, cloneCluster, cycleCost, huskSpan, makeCluster, matchAnchor, spinHalfShares, startCodes, threeLoveCensus, type Cluster, type CycleCost } from '@/code/measure/knit-love-cluster'

const D = 3
const N = 2 * D + 1
const RMAX = 6
const TMAX = 96
const NEAR = 2
const DEPTHS = [4, 8]
const SILVER_RATE = 27145

// ---- K1: the exact rule's occupation against the occupation map ----

type K1Row = { member: string; mismatches: number; branchesMax: number; splits: number; beats: number; aliasedStops: number }

function k1Starts(): { pos: number[][]; slots: number[] }[] {
  const out: { pos: number[][]; slots: number[] }[] = []

  for (let i = 0; i < 8; i++) {
    const u = ((i + 1) * SILVER_RATE) % 65536
    const d1 = u % 24
    const third = [
      [1, 1, 0, 0],
      [0, 1, 0, 1],
      [2, 0, 0, 0],
      [1, 0, -1, 0],
      [0, 0, 1, 1],
      [1, -1, 0, 0],
      [0, 0, 0, 2],
      [-1, 0, 0, 1],
    ][i]!

    out.push({ pos: [[0, 0, 0, 0], [0, 0, 0, 0], third], slots: [d1, OPP[d1]!, (u >> 5) % 24] })
  }

  return out
}

function k1(side: number, beats: number): K1Row[] {
  return startFamily(16).map(member =>
    withStart(member, () => {
      const tables = lockedTables(makeColorWeave({ side, table: 'bind' }), 'lone')
      const cells = tables.cells
      let mismatches = 0
      let branchesMax = 0
      let compared = 0
      let aliasedStops = 0
      const tally = newTally()

      for (const [i, st] of k1Starts().entries()) {
        const config: Configuration = {
          vibe: new Int8Array(cells * 24),
          point: new Int8Array(cells * 24),
          open: new Uint8Array(cells * 24),
          store: new Int8Array(cells * 12),
          spoint: new Int8Array(cells * 12),
          sopen: new Uint8Array(cells * 12),
        }
        const cellOf = (p: readonly number[]): number => d4BoxCell({ coordinates: d4Coordinates([...p]), side })

        st.pos.forEach((p, t) => {
          const slot = cellOf(p) * 24 + st.slots[t]!

          config.vibe[slot] = 1
          config.open[slot] = 1
          config.point[slot] = (((i * 3 + t + 1) * SILVER_RATE) % 65536) % 9
        })

        const cluster = makeCluster(st.pos, st.slots, side)
        let state: LockedState = lockedState(config)

        for (let t = 0; t < beats; t++) {
          // the box identifies docks 8 D4 apart; once two loves the unbounded patch keeps apart land on one box dock,
          // the two are different rules and the comparison stops (counted)
          const cellsNow = [0, 1, 2].map(v => cellOf([cluster.x[4 * v]!, cluster.x[4 * v + 1]!, cluster.x[4 * v + 2]!, cluster.x[4 * v + 3]!]))
          const aliased = [0, 1, 2].some(a => [0, 1, 2].some(b => a < b && cellsNow[a] === cellsNow[b] && [0, 1, 2, 3].some(k => cluster.x[4 * a + k] !== cluster.x[4 * b + k])))

          if (aliased) {
            aliasedStops++
            break
          }

          state = lockedBeat(tables, state, t, tally)
          clusterBeat(cluster, side)
          compared++
          branchesMax = Math.max(branchesMax, state.branches.length)

          const want = new Set<number>()

          for (let v = 0; v < 3; v++) want.add(cellOf([cluster.x[4 * v]!, cluster.x[4 * v + 1]!, cluster.x[4 * v + 2]!, cluster.x[4 * v + 3]!]) * 24 + cluster.d[v]!)

          for (const br of state.branches) {
            let held = 0

            for (let s = 0; s < br.vibe.length; s++) {
              if (br.vibe[s] === 0) continue
              held++
              if (!want.has(s) || br.vibe[s] !== 1) mismatches++
            }

            if (held !== 3) mismatches++
          }
        }
      }

      return { member: member.name, mismatches, branchesMax, splits: tally.splitMeetings, beats: compared, aliasedStops }
    }),
  )
}

// ---- the levels ----

type Level = {
  name: string
  depth: number
  start: Cluster
  period: number
  shift: number[]
  cost: CycleCost
  closes: boolean
  energy: number
  sumLinks: number
  sumMeetings: number
  spin: number[]
  labelsOk: boolean
  maxSpan: number
}

function readLevel(name: string, start: Cluster, period: number, depth: number): Level {
  const cost = cycleCost(start, period, depth, 3)
  const links = cost.links.slice(0, period)
  const meets = cost.meetingsByBeat.slice(0, period)
  const phases = links.map((l, t) => (Math.PI / N) * l - ((2 * Math.PI) / 3) * meets[t]!)
  const sumLinks = links.reduce((a, b) => a + b, 0)
  const sumMeetings = meets.reduce((a, b) => a + b, 0)
  const c = cloneCluster(start)
  let labelsOk = true
  let maxSpan = huskSpan(c)

  for (let t = 0; t < period; t++) {
    for (let v = 0; v < 3; v++) labelsOk &&= LABEL[c.d[v]!] === 0 || LABEL[c.d[v]!] === 1
    clusterBeat(c, depth)
    maxSpan = Math.max(maxSpan, huskSpan(c))
  }

  // the husk translation over one period: the love of c standing on love 0's place in the start's class
  const a = matchAnchor(c, startCodes(start, depth), depth)

  if (a < 0) throw new Error('E-SPN-0088: a level did not return after its period')

  const shift = [0, 1, 2].map(k => c.x[4 * a + k]! - start.x[k]!)

  return {
    name,
    depth,
    start,
    period,
    shift,
    cost,
    closes: cost.closes.every(Boolean),
    energy: (Math.PI / N) * (sumLinks / period) - ((2 * Math.PI) / 3) * (sumMeetings / period),
    sumLinks,
    sumMeetings,
    spin: spinHalfShares(start, period, depth, phases),
    labelsOk,
    maxSpan,
  }
}

const norm3 = (h: readonly number[]): number => Math.hypot(h[0]!, h[1]!, h[2]!)

export default experiment({
  id: 'spin/knit-drift-binding',
  code: 'E-SPN-0088',
  title: "the drift-cost binding carried off one line onto the doublet-locked knit's own loves, on the 3D husk over columns of depth 4 and 8: whether the lightest charge-one cluster of three loves, held only by the light's drift phase per flux link with Gauss exact, is the natural spin one half, N = 3 with 2 pi sign -1, compact and travelling, over the 17-start family",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- K1 ----
    const k1Rows = k1(8, 12)
    const k1ok = k1Rows.length === 17 && k1Rows.every(r => r.mismatches === 0 && r.beats >= 4 * 8) && k1Rows.some(r => r.branchesMax > 1)

    log('k1')

    // ---- the census ----
    const censuses = DEPTHS.map(depth => {
      const c = threeLoveCensus(depth, NEAR, RMAX, TMAX)

      log(`census L ${depth}`)

      return { depth, ...c }
    })

    // REPORTED (added after the first run, disclosed; read from tmp/kb-probe2): how many compact cycles hold loves on
    // two husk shadows, and how many collisions turn a love's husk direction
    const structure = censuses.map(cs => {
      let twoShadows = 0
      let turns = 0
      let collisions = 0

      for (const cy of cs.cycles) {
        const c = cloneCluster(cy.start)
        const shadows = new Set<number>()

        for (let t = 0; t < cy.period; t++) {
          const before = cloneCluster(c)

          for (let v = 0; v < 3; v++) shadows.add((SHADOW_DIR[c.d[v]!]! + 1) * SHADOW_SIGN[c.d[v]!]!)
          if ([0, 1, 2].some(a => [0, 1, 2].some(b => a < b && [0, 1, 2, 3].every(k => c.x[4 * a + k] === c.x[4 * b + k])))) collisions++

          clusterBeat(c, cs.depth)

          for (let v = 0; v < 3; v++) if (SHADOW_DIR[c.d[v]!] !== SHADOW_DIR[before.d[v]!] || SHADOW_SIGN[c.d[v]!] !== SHADOW_SIGN[before.d[v]!]) turns++
        }

        if (shadows.size > 1) twoShadows++
      }

      return { depth: cs.depth, twoShadows, turns, collisions }
    })

    // ---- the levels: census cycles, and the one-root family ----
    const levels: Level[] = []
    const notLevels: { name: string; growth: number[] }[] = []

    for (const cs of censuses) {
      cs.cycles.forEach((cy, i) => {
        const lv = readLevel(`census L${cs.depth} #${i}`, cy.start, cy.period, cs.depth)

        if (lv.closes && lv.maxSpan <= RMAX) levels.push(lv)
        else notLevels.push({ name: lv.name, growth: lv.cost.links })
      })
    }

    // the one-root family: every root, stacked in one column (depths 0, 2, 4), and spread over two and three columns
    const stackCheck = { roots: 0, gaussBad: 0 }

    for (const depth of DEPTHS) {
      for (let r = 0; r < 24; r++) {
        const stack = makeCluster([[0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 4]], [r, r, r], depth)
        const lv = readLevel(`stack L${depth} root ${r}`, stack, 1, depth)

        stackCheck.roots++
        stackCheck.gaussBad += lv.cost.gaussBad
        if (lv.closes) levels.push(lv)
        else notLevels.push({ name: lv.name, growth: lv.cost.links })
      }
    }

    for (const [name, pos] of [
      ['two columns', [[0, 0, 0, 0], [0, 0, 0, 2], [1, 1, 0, 0]]],
      ['three columns', [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0]]],
    ] as const) {
      const c = makeCluster(pos, [0, 0, 0], 4)
      const cost = cycleCost(c, 1, 4, 4)

      notLevels.push({ name: `one root, ${name}`, growth: cost.links })
    }

    log('levels')

    const gaussBad = levels.reduce((s, l) => s + l.cost.gaussBad, 0) + stackCheck.gaussBad
    const k2 = gaussBad === 0

    // ---- the lightest ----
    const sorted = levels.slice().sort((a, b) => a.energy - b.energy)
    const lightestE = sorted[0]?.energy ?? Number.NaN
    const lightest = sorted.filter(l => Math.abs(l.energy - lightestE) < 1e-12)
    const g1 = lightest.length > 0 && lightest.every(l => Math.min(...l.spin) >= 0.95)
    const g2 = lightest.length > 0 && lightest.every(l => l.labelsOk)
    const g3 = lightest.length > 0 && lightest.every(l => l.closes && l.maxSpan <= RMAX)
    const g4 = lightest.length > 0 && lightest.every(l => norm3(l.shift) > 0)
    const g5 = k1ok
    const ok = k1ok && k2 && g1 && g2 && g3 && g4 && g5

    const censusCycles = levels.filter(l => l.name.startsWith('census'))
    const stacks = levels.filter(l => l.name.startsWith('stack'))
    // the levels grouped by what they read (the first run listed every one; grouped after it, a reporting change only)
    const grouped = (ls: readonly Level[]): string => {
      const g = new Map<string, number>()

      for (const l of ls) {
        const key = `T ${l.period}, |h| ${norm3(l.shift).toFixed(3)}, meetings ${l.sumMeetings}, links ${l.sumLinks} per period, E ${l.energy.toFixed(5)}, span ${l.maxSpan}, spin one half ${Math.min(...l.spin).toFixed(4)} to ${Math.max(...l.spin).toFixed(4)}`

        g.set(key, (g.get(key) ?? 0) + 1)
      }

      return [...g].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} x (${k})`).join('; ')
    }
    const cycleGroups = (cs: (typeof censuses)[number]): string => {
      const g = new Map<string, number>()

      for (const y of cs.cycles) {
        const key = `T ${y.period} |h| ${norm3(y.shift).toFixed(3)} m ${y.meetings} span ${y.maxSpan}`

        g.set(key, (g.get(key) ?? 0) + 1)
      }

      return [...g].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} x (${k})`).join('; ')
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on the doublet-locked knit's own loves the occupation is classical: the exact rule, every love open with splitting meetings, holds one occupation in every branch equal to the occupation map (${k1Rows.reduce((s, r) => s + r.mismatches, 0)} mismatches, up to ${Math.max(...k1Rows.map(r => r.branchesMax))} branches, 17 of 17 starts), so the drift cost is one phase per history and binds nothing; the census of ${censuses.map(c => `${c.starts.toLocaleString('en-US')} starts at column depth ${c.depth} (${c.escaped.toLocaleString('en-US')} escape, ${c.held} held, ${c.cycles.length} compact cycles)`).join('; ')} leaves ${censusCycles.length} closed collision levels; the lightest level (E ${lightestE.toFixed(5)}) is ${lightest.length === 0 ? 'none' : `${lightest.length} level(s), ${lightest.slice(0, 3).map(l => l.name).join(', ')}`}, spin one half share ${lightest.length ? Math.min(...lightest.flatMap(l => l.spin)).toFixed(4) : 'none'}, N = 3 ${g2}, compact ${g3}, travels ${g4} (|h|/T ${lightest.length ? (norm3(lightest[0]!.shift) / lightest[0]!.period).toFixed(4) : 'none'}); Gauss violations ${gaussBad}`,
      metrics: {
        gate_K1: k1ok ? 1 : 0,
        gate_K2: k2 ? 1 : 0,
        gate_G1: g1 ? 1 : 0,
        gate_G2: g2 ? 1 : 0,
        gate_G3: g3 ? 1 : 0,
        gate_G4: g4 ? 1 : 0,
        gate_G5: g5 ? 1 : 0,
        k1Mismatches: k1Rows.reduce((s, r) => s + r.mismatches, 0),
        k1BranchesMax: Math.max(...k1Rows.map(r => r.branchesMax)),
        k1Splits: k1Rows.reduce((s, r) => s + r.splits, 0),
        gaussViolations: gaussBad,
        ...Object.fromEntries(censuses.flatMap(c => [[`census_L${c.depth}_starts`, c.starts], [`census_L${c.depth}_escaped`, c.escaped], [`census_L${c.depth}_held`, c.held], [`census_L${c.depth}_cycles`, c.cycles.length]])),
        ...Object.fromEntries(structure.flatMap(s => [[`census_L${s.depth}_twoShadowCycles`, s.twoShadows], [`census_L${s.depth}_huskTurns`, s.turns], [`census_L${s.depth}_collisions`, s.collisions]])),
        closedCollisionLevels: censusCycles.length,
        closedStacks: stacks.length,
        notLevels: notLevels.length,
        lightestEnergy: lightestE,
        lightestCount: lightest.length,
        lightestSpinHalf: lightest.length ? Math.min(...lightest.flatMap(l => l.spin)) : Number.NaN,
        lightestSpeed: lightest.length ? norm3(lightest[0]!.shift) / lightest[0]!.period : Number.NaN,
        lightestBandWidth: lightest.length ? (Math.PI * norm3(lightest[0]!.shift)) / lightest[0]!.period : Number.NaN,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        stackRoots: stackCheck.roots,
      },
      notes: `L2 (census and readings on the knit's own rule), L1 for the classical occupation. Gates K1 ${k1ok}, K2 ${k2}, G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. K1 by start: ${k1Rows.map(r => `${r.member} ${r.mismatches}/${r.branchesMax}/${r.splits}/${r.beats}/${r.aliasedStops}`).join(', ')} (mismatches/branches/splits/compared beats/aliased stops). Census (two loves on one dock, third within ${NEAR}, rmax ${RMAX}, tmax ${TMAX}): ${censuses.map(c => `L ${c.depth}: ${c.starts} starts, ${c.beats} beats, escaped ${c.escaped}, held ${c.held}, cycles ${c.cycles.length} (${cycleGroups(c)})`).join('. ')}. Held examples: ${censuses.flatMap(c => c.heldExamples.slice(0, 2).map(h => `L${c.depth} slots ${Array.from(h.d).join(' ')} third (${Array.from(h.x.subarray(8, 12)).join(',')})`)).join('; ') || 'none'}. Structure (reported after run 1): ${structure.map(s => `L ${s.depth}: ${s.twoShadows} compact cycles hold two husk shadows, ${s.collisions} collisions per period summed, ${s.turns} turn a love's husk direction`).join('; ')}. Closed collision levels, grouped:${grouped(censusCycles)}. Lightest, grouped: ${grouped(lightest)}. Stacks: ${stacks.length} closed of ${stackCheck.roots}, energies ${[...new Set(stacks.map(s => s.energy.toFixed(6)))].join(', ')}, speeds ${[...new Set(stacks.map(s => (norm3(s.shift) / s.period).toFixed(4)))].join(', ')}, spin one half ${[...new Set(stacks.map(s => s.spin[0]!.toFixed(4)))].join(', ')}. Not levels (flux does not return): ${notLevels.slice(0, 12).map(n => `${n.name}: l ${n.growth.slice(0, 8).join(' ')}`).join('; ')}${notLevels.length > 12 ? ` and ${notLevels.length - 12} more` : ''}. THE DEPTH is the column's period, not a wall; the husk is unbounded.`,
    })
  },
})
