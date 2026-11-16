// THE SUBGROUP SEARCH for a long-run quotient of the {3,4,3,4} honeycomb (item vibe-roadmap-honeycomb-0016, decision
// 002, gates pre-registered in the item's `what` before any probe). Code: code/substrate/coxeter/congruence-3434.ts.
//
// Stage 1, congruence kernels N = K cap G(I) at the ideals I = (sqrt 2)^m (n), coarsest first. A level is skipped
// when a coarser one (dividing it) did not fit, since K_I maps onto K_I' for I inside I'. Levels at a prime over 7,
// 17 or 23 are out before any run: |K_7| = 276,595,200 (E-GMT-0042), and 17 and 23 give cell quotients of 1.7e9 and
// 3.6e10.
// Stage 2, layers: for the two finest 2-adic levels m that fit and j = 1, 2, the subgroups N_W between K(m + j) and
// K(m) (congruence-3434.ts, LAYERS): the short elements of K(m) are found exactly in the radius-5 ball of K mod
// (sqrt 2)^(m + j), and W is grown greedily, closed under the reflections (so N_W is normal in G), avoiding every
// layer vector of an element of length <= 2 r + 1, for r = 4 down to one past the best systole so far.
//
// G1 size and labels. The winner has at most 2,000,000 docks, and in its table every dock has 24 distinct
//    neighbours, none itself, and neighbour(neighbour(x, a), OPPOSITE a) = x. N lies in K, so labels are consistent.
// G2 systole. The largest r <= 4 whose reduced r-ball equals the honeycomb's labelled r-ball, at the identity (N is
//    normal in K; the layered candidates are also read at docks 1 to 24, which cover every class of K mod 2). Bar 4.
//    Systole >= 2 makes N torsion-free: a torsion element of K fixes a point of a 2-face or an edge, so it moves
//    some dock by at most 3.
// G3 cusps. A union-find over (dock, ideal vertex) pairs across shared facets; every cusp has the same cube count c
//    and cusps x c = 24 x docks.
// G4 the rule on the winner. 96 beats forward then 96 back return exactly, stream bijective, charge and count kept
//    at every beat, the C-conjugate run is minus the run at every beat, at both thresholds, on the stand-in store
//    (E-GMT-0042's ruleRun).
//
// Under keys 3 a dock is a block, never a point. Under keys 2 the quotient is an instrument, not the present: the
// present is the whole infinite honeycomb, and the quotient holds its states that repeat under N.

import { performance } from 'node:perf_hooks'
import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import {
  analyzeLayer,
  cellMeetsFrames,
  cuspCount,
  cuspIncidence,
  enumerateFrames,
  enumerateLayered,
  frameSystole,
  graphGates,
  layerSubgroup,
  levelRing,
  localSystole,
  quotientMesh,
  type CongruenceLevel,
} from '@/code/substrate/coxeter/congruence-3434'
import { ruleRun } from '@/test/experiment/geometry/honeycomb-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

export type SearchOptions = {
  levels: CongruenceLevel[]
  maxDocks: number
  beats: number
  // stage 2 on or off, and the cap on the radius-5 ball it enumerates
  layers: boolean
  ballCap: number
}

export const FULL: SearchOptions = {
  levels: [
    ...Array.from({ length: 12 }, (_, i) => ({ twoPower: i + 1, odd: 1 })),
    { twoPower: 0, odd: 3 },
    { twoPower: 1, odd: 3 },
    { twoPower: 2, odd: 3 },
    { twoPower: 3, odd: 3 },
    { twoPower: 0, odd: 5 },
    { twoPower: 1, odd: 5 },
  ],
  maxDocks: 2000000,
  beats: 96,
  layers: true,
  ballCap: 4000000,
}

type Row = {
  name: string
  docks: number | string
  systole: number
  shells: string
  cusps: number
  cubesPerCusp: string
  cellImage: number
  cellInFrames: number
  gatesOk: boolean
}

const divides = (a: CongruenceLevel, b: CongruenceLevel): boolean =>
  a.twoPower <= b.twoPower && b.odd % a.odd === 0

export function honeycombSubgroupSearch(options: SearchOptions): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)
  const cell = exactCell()
  const incidence = cuspIncidence(cell)
  const incidenceOk = Object.values(incidence.gates).every(Boolean)

  log(`incidence gates ${JSON.stringify(incidence.gates)}`)

  const rows: Row[] = []
  const refused: CongruenceLevel[] = []
  const twoAdic = new Map<number, number>()
  let winner: { row: Row; table: Int32Array; docks: number; systole: number } | undefined
  let cuspsOk = true

  const consider = (
    name: string,
    table: Int32Array,
    docks: number,
    systole: number,
    shells: string,
    meets: { cellImage: number; cellInFrames: number },
  ): Row => {
    const gates = graphGates(table, docks)
    const cusps = cuspCount(table, docks, incidence)
    const cuspAlike = cusps.cubeCounts.length === 1 && cusps.cusps * cusps.cubeCounts[0]! === 24 * docks
    const gatesOk = Object.values(gates).every(Boolean)
    const row: Row = {
      name,
      docks,
      systole,
      shells,
      cusps: cusps.cusps,
      cubesPerCusp: cusps.cubeCounts.join(' '),
      ...meets,
      gatesOk,
    }

    rows.push(row)
    log(`${name}: ${docks} docks, gates ${JSON.stringify(gates)}, shells ${shells}, systole ${systole}, cusps ${cusps.cusps} x ${row.cubesPerCusp} cubes, |H_I| ${meets.cellImage}, |H_I cap K_I| ${meets.cellInFrames}`)

    const better =
      gatesOk &&
      (!winner || systole > winner.systole || (systole === winner.systole && docks < winner.docks))

    if (better) {
      cuspsOk = cuspAlike
      winner = { row, table, docks, systole }
    }

    return row
  }

  // ---- stage 1: congruence kernels ----
  for (const level of options.levels) {
    const name = levelRing(level).name

    if (refused.some(r => divides(r, level))) {
      log(`${name}: skipped (a coarser level does not fit)`)
      continue
    }

    const e = enumerateFrames({ level, maxDocks: options.maxDocks, cell })

    if (!e.fits) {
      refused.push(level)
      rows.push({
        name,
        docks: `> ${options.maxDocks}`,
        systole: -1,
        shells: '',
        cusps: -1,
        cubesPerCusp: '',
        cellImage: -1,
        cellInFrames: -1,
        gatesOk: false,
      })
      log(`${name}: more than ${options.maxDocks} docks, refused`)
      continue
    }

    const systole = frameSystole(e.table, e.order)
    const row = consider(name, e.table, e.order, systole.systole, systole.shells.join(' '), cellMeetsFrames(e, cell))

    if (level.odd === 1 && row.gatesOk) {
      twoAdic.set(level.twoPower, e.order)
    }
  }

  // ---- stage 2: layers ----
  if (options.layers && twoAdic.size > 0) {
    const top = Math.max(...twoAdic.keys())

    for (const m of [top - 1, top]) {
      for (const j of [1, 2]) {
        const base = twoAdic.get(m)

        if (base === undefined || j > m || 2 * base > options.maxDocks) {
          continue
        }

        const analysis = analyzeLayer({ m, j, ballCap: options.ballCap, cell })

        if (!analysis) {
          log(`layer m ${m} j ${j}: the radius-5 ball of K mod (sqrt 2)^${m + j} exceeds ${options.ballCap}, skipped`)
          continue
        }

        const histogram = new Map<number, number>()

        for (const length of analysis.lengths.values()) {
          histogram.set(length, (histogram.get(length) ?? 0) + 1)
        }

        log(`layer m ${m} j ${j}: ball ${analysis.ballDocks} docks (shells ${analysis.ballShells.join(' ')}, systole of K mod (sqrt 2)^${m + j} ${analysis.ballSystole}), ${analysis.pairs} pairs, layer vectors by least length ${[...histogram].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}:${c}`).join(' ')}`)

        for (let r = 4; r > (winner?.systole ?? -1); r--) {
          if (analysis.ballSystole < r) {
            continue
          }

          const sub = layerSubgroup(analysis, r, cell)
          const e = enumerateLayered({ subgroup: sub, maxDocks: options.maxDocks, cell })
          const name = `layer (sqrt 2)^${m}..${m + j}, W dim ${sub.dimension} of span ${sub.spanDimension}, target ${r}`

          if (!e.fits) {
            log(`${name}: more than ${options.maxDocks} docks`)
            continue
          }

          const whole = frameSystole(e.table, e.order)
          let systole = whole.systole

          for (let start = 1; start <= 24 && start < e.order; start++) {
            systole = Math.min(systole, localSystole(e.table, start, 4).systole)
          }

          consider(name, e.table, e.order, systole, whole.shells.join(' '), { cellImage: -1, cellInFrames: -1 })
          break
        }
      }
    }
  }

  // ---- G4 ----
  let rule: ReturnType<typeof ruleRun> | undefined

  if (winner) {
    const q = quotientMesh(winner.table, winner.docks, `honeycomb-subgroup-${winner.row.name}`, cell)

    rule = ruleRun(q, options.beats)
    log(`G4 on ${winner.row.name}, ${q.cells} docks, ${options.beats} beats: bijective ${rule.bijective}, law breaks ${rule.lawBreaks}, C breaks ${rule.cBreaks}, not back ${rule.notBack}, ${rule.secondsPerBeat.toFixed(3)} s a beat`)
  }

  const g1 = winner !== undefined && winner.docks <= options.maxDocks && winner.row.gatesOk
  const g3 = incidenceOk && cuspsOk
  const g4 = rule
    ? rule.bijective && rule.lawBreaks === 0 && rule.cBreaks === 0 && rule.notBack === 0
    : false
  const best = winner?.systole ?? -1
  const status = !g1 || !g3 || !g4 ? 'fail' : best >= 4 ? 'pass' : 'open'
  const table = rows
    .map(r => `${r.name}: docks ${r.docks}, systole ${r.systole}, cusps ${r.cusps} x ${r.cubesPerCusp}`)
    .join('; ')

  return verdict({
    status,
    claim: `finite quotients of the {3,4,3,4} frame group K with consistent slot labels: ${table}. Winner ${winner?.row.name ?? 'none'} (${winner?.docks ?? 0} docks, systole ${best}, ${winner?.row.cusps ?? 0} cusps); the working rule on it runs ${options.beats} beats forward and back ${g4 ? 'exactly, charge, count and C kept' : 'NOT exactly'}`,
    metrics: {
      winnerDocks: winner?.docks ?? -1,
      winnerSystole: best,
      winnerCusps: winner?.row.cusps ?? -1,
      candidates: rows.length,
      refused: refused.length,
      ruleLawBreaks: rule?.lawBreaks ?? -1,
      ruleCBreaks: rule?.cBreaks ?? -1,
      ruleNotBack: rule?.notBack ?? -1,
      ruleSecondsPerBeat: rule?.secondsPerBeat ?? -1,
      seconds: seconds(),
    },
    notes:
      'L1 (an instrument, exact). Gates pre-registered in vibe-roadmap-honeycomb-0016 before any probe. Every quotient is enumerated exactly over Z[sqrt 2] / (sqrt 2)^k; a candidate over 2,000,000 docks is refused after 2,000,000 expansions. Status open = every gate holds but the best systole is under 4.',
  })
}

export default experiment({
  id: 'geometry/honeycomb-subgroup-search',
  code: 'E-GMT-0043',
  title:
    'the {3,4,3,4} honeycomb modulo (sqrt 2)^m (n) and between two 2-adic levels: exact quotients of the frame group K with consistent slot labels, their docks, systole and cusps, and the working rule on the best one',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return honeycombSubgroupSearch(FULL)
  },
})
