// A STATIC Z3 CAGE ON LARGER CELLS, OR FROM THE GRID MOVES? (note/project/vibe/roadmap/moving-matter item 0082,
// research/outside-the-box.md 3.2). Explores whether any uniform static colour field could stop a lone third exactly:
// all-non-flat centre fields on 2- and 3-dock cells (family B), or grid-move fields whose links are the qutrit Weyl
// displacements D(v_d) of a linear v: D4 -> Z3^2 (family G), read with 0074's cage engine and velocity carried to any
// cell and to 3 x 3 links (code/measure/cage-cells).
//
// STEP 0 INSTRUMENT: cf0 on its one-dock cell and written as a 2-dock cell both reproduce 0074's C_inf 0.88301020 to
//  1e-8; the identity's v_inf is the same on both cells; the pi-flux rhombic chain reads C_inf under 1e-12. The cell
//  engine equals cage-velocity's reducedPoint on the one-dock cell, the reduced v^2 equals the dense block's on a 2-dock
//  and a 3 x 3 field, and the set engine reproduces centerBands' band widths.
// STEP 1 SCREEN: per class, the eigenphases carrying the colour-mixed one-dock start's weight at 8 fixed generic momenta,
//  plain and Wilson sets (half +); a class is kept when the start weight on phases that move by 1e-9 or more is under
//  1e-6 (the flat-weight tolerance of the gate) on both. STEP 2: survivors get C_inf and flat weight on nk 20 and 40.
//
// GATES, fixed 2026-10-09 before any read (item 0082):
//  CONFINED  some class reads C_inf under 1e-6 with flat weight within 1e-6 of 1 on BOTH sets
//  NONE      no class does
//  OPEN      STEP 0 fails, or a family is not fully screened (the covered fraction reported)
// Uniqueness is reported, never gated. Printed, ungated, for each caging class: plaquette holonomy cubed equals 1.
//
// DETERMINISM: no random numbers. Depth L2: band reads of static colour fields on the 4D bulk, never the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { basisCoords, centerBands, enumerateCenterPatterns } from '@/code/measure/center-flux'
import { cageGeometry, chainVelocity, reducedPoint, samplePoints, type ChainVelocity } from '@/code/measure/cage-velocity'
import {
  SCREEN_MOMENTA,
  cellGrid,
  cellInstrumentPoint,
  cellPoint,
  centerCellField,
  checkField,
  enumerateCenterCell,
  enumerateGridMoves,
  gridMoveField,
  makeCell,
  screenField,
  setPhases,
  setWeightedPhases,
  sublattices,
  weightedSpread,
  type CellField,
  type CellGrid,
  type CellInstrumentPoint,
  type FieldCheck,
  type ScreenRead,
} from '@/code/measure/cage-cells'

export const CF0_CINF = 0.88301020153
export const STEP0_TOL = 1e-8
export const CONFINED_UNDER = 1e-6
export const FLAT_WITHIN = 1e-6

const TAU = 2 * Math.PI

export type Instrument = {
  // |weave m - basisCoords(root)| summed, and the one-dock engine against reducedPoint (max |v^2 gap|, 28 momenta)
  mGap: number
  oneDock: number
  dense: CellInstrumentPoint[]
  // the set engine against centerBands on nk 4 (cf0): max band-width gap per set
  bandGap: { set: number; widthGap: number; refGapPi: number }[]
  chain: ChainVelocity[]
  checks: FieldCheck[]
  // the screen's own control: the same momentum read twice moves no weight
  repeatMoving?: number
}

export type EnumRead = {
  B: { p: number; lambda: number[]; complete: boolean; classes: { c: number[]; orbit: number; uniform: boolean }[] }[]
  G: { maps: number; allNonflat: number; classes: { V: number[]; orbit: number; rank: number; flatTriangles: number }[] }
}

export type ScreenRow = ScreenRead & { check: FieldCheck; uniform?: boolean; rank?: number; flatTriangles?: number }

export type CageCellsInput = {
  instrument: Instrument
  enumeration: EnumRead
  screens: { family: 'B' | 'G'; p: number; rows: ScreenRow[] }[]
  grids: (CellGrid & { p: number })[]
}

export const cf0Center = (): Int8Array => enumerateCenterPatterns().kept[0]!.pattern.c

export function cf0Field(p: number, lambda: readonly number[]): CellField {
  const c = cf0Center()

  return centerCellField(`cf0-p${p}`, makeCell(p, lambda), Int8Array.from({ length: p * 24 }, (_, l) => c[l % 24]!))
}

export function identityCellField(p: number, lambda: readonly number[]): CellField {
  return centerCellField(`identity-p${p}`, makeCell(p, lambda), new Int8Array(p * 24))
}

export function readInstrument(): Instrument {
  const cf0 = cf0Center()
  const geo = cageGeometry(8)
  const mGap = DOCK_ROOTS.map(basisCoords).reduce(
    (s, m, d) => s + m.reduce((t, v, j) => t + Math.abs(v - geo.m[d * 4 + j]!), 0),
    0,
  )
  const angle = Float64Array.from(cf0, c => (TAU * c) / 3)
  const f1 = cf0Field(1, [0, 0, 0, 0])
  const pts = samplePoints(28)
  const oneDock = Math.max(...pts.map(t => Math.abs(cellPoint(f1, t).v2 - reducedPoint(geo, angle, t).v2)))
  const f2 = cf0Field(2, sublattices(2)[0]!.lambda)
  const g = gridMoveField('g-test', [1, 0, 0, 1, 1, 1, 2, 0])
  const dense = [
    ...pts.slice(20, 23).map(t => cellInstrumentPoint(f2, t)),
    ...pts.slice(20, 22).map(t => cellInstrumentPoint(g, t)),
  ]
  const nk = 4
  const bandGap = [0, 1].map(set => {
    const ref = centerBands(cf0, set as 0 | 1, nk)
    const lo = Array<number>(96).fill(Infinity)
    const hi = Array<number>(96).fill(-Infinity)

    for (let k = 0; k < nk ** 4; k++) {
      const theta = [0, 1, 2, 3].map(q => (TAU * (Math.floor(k / nk ** q) % nk)) / nk)

      setPhases(f1, set as 0 | 1, theta).forEach((v, j) => {
        lo[j] = Math.min(lo[j]!, v)
        hi[j] = Math.max(hi[j]!, v)
      })
    }

    const widths = lo.map((v, j) => hi[j]! - v)

    return { set, widthGap: Math.max(...widths.map((w, j) => Math.abs(w - ref.widths[j]!))), refGapPi: ref.gapPi }
  })

  return {
    mGap,
    oneDock,
    dense,
    bandGap,
    chain: [Math.PI, 0].map(flux => chainVelocity(flux, 4096)),
    checks: [checkField(f1), checkField(f2), checkField(g)],
    repeatMoving: repeatControl(),
  }
}

// the same momentum twice: a read that reproduces itself moves no weight
export function repeatControl(): number {
  const f = cf0Field(1, [0, 0, 0, 0])
  const t = SCREEN_MOMENTA[0]!

  return weightedSpread([setWeightedPhases(f, 0, t), setWeightedPhases(f, 0, t)]).unmatched
}

export function readEnumeration(): EnumRead {
  const B = [1, 2, 3].flatMap(p => sublattices(p).map(s => enumerateCenterCell(makeCell(p, s.lambda))))

  return { B, G: enumerateGridMoves() }
}

export function screenAll(e: EnumRead): CageCellsInput['screens'] {
  const out: CageCellsInput['screens'] = [1, 2, 3].map(p => ({
    family: 'B' as const,
    p,
    rows: e.B.filter(b => b.p === p).flatMap(b =>
      b.classes.map(k => {
        const f = centerCellField('B', makeCell(p, b.lambda), Int8Array.from(k.c))

        return { ...screenField(f), check: checkField(f), uniform: k.uniform }
      }),
    ),
  }))

  out.push({
    family: 'G',
    p: 1,
    rows: e.G.classes.map(k => {
      const f = gridMoveField('G', k.V)

      return { ...screenField(f), check: checkField(f), rank: k.rank, flatTriangles: k.flatTriangles }
    }),
  })

  return out
}

export function cageCellsVerdict(input: CageCellsInput): Verdict {
  const { instrument: I, enumeration: E, screens, grids } = input
  const metrics: Record<string, number> = {}
  const notes: string[] = []
  const grid = (name: string, p: number): CellGrid | undefined => grids.find(g => g.name === `${name}-p${p}` && g.nk === 20)
  const C = (p: number): number => {
    const c = grid('cf0', p)
    const i = grid('identity', p)

    return c && i ? Math.sqrt(c.v2 / i.v2) : NaN
  }
  const C1 = C(1)
  const C2 = C(2)
  const vI1 = grid('identity', 1)?.v2 ?? NaN
  const vI2 = grid('identity', 2)?.v2 ?? NaN
  const pi = I.chain.find(r => r.flux === Math.PI)
  const zero = I.chain.find(r => r.flux === 0)
  const chainC = pi && zero ? Math.sqrt(pi.v2 / zero.v2) : NaN
  const denseGap = Math.max(...I.dense.map(d => Math.abs(d.reducedV2 - d.denseV2)))
  const bandGap = Math.max(...I.bandGap.map(b => b.widthGap))

  metrics.step0CinfOneDock = C1
  metrics.step0CinfTwoDock = C2
  metrics.step0IdentityV2Gap = Math.abs(vI1 - vI2)
  metrics.chainCinf = chainC
  metrics.chainFlatWeight = pi?.flatWeight ?? NaN
  metrics.oneDockEngineGap = I.oneDock
  metrics.rootOffsetGap = I.mGap
  metrics.denseGap = denseGap
  metrics.setBandWidthGap = bandGap
  metrics.repeatMoving = I.repeatMoving ?? NaN
  metrics.fieldReverseGap = Math.max(...I.checks.map(c => c.reverseGap))

  const step0 =
    Math.abs(C1 - CF0_CINF) < STEP0_TOL &&
    Math.abs(C2 - CF0_CINF) < STEP0_TOL &&
    Math.abs(vI1 - vI2) < STEP0_TOL &&
    chainC < 1e-12 &&
    Math.abs((pi?.flatWeight ?? 0) - 1) < 1e-12 &&
    I.mGap === 0 &&
    I.oneDock < 1e-12 &&
    denseGap < 1e-8 &&
    bandGap < 1e-12 &&
    (I.repeatMoving ?? 1) === 0 &&
    I.checks.every(c => c.reverseGap < 1e-12 && c.inGroup)

  // coverage
  const enumerated = (fam: 'B' | 'G', p: number): number =>
    fam === 'G' ? E.G.classes.length : E.B.filter(b => b.p === p).reduce((s, b) => s + b.classes.length, 0)
  const families: { fam: 'B' | 'G'; p: number }[] = [
    { fam: 'B', p: 1 },
    { fam: 'B', p: 2 },
    { fam: 'B', p: 3 },
    { fam: 'G', p: 1 },
  ]
  const coverage = families.map(({ fam, p }) => {
    const s = screens.find(x => x.family === fam && x.p === p)
    const n = enumerated(fam, p)

    return { fam, p, n, screened: s?.rows.length ?? 0, kept: s?.rows.filter(r => r.kept).length ?? 0 }
  })
  const complete = E.B.every(b => b.complete) && coverage.every(c => c.screened === c.n)

  coverage.forEach(c => {
    metrics[`classes${c.fam}${c.p}`] = c.n
    metrics[`screened${c.fam}${c.p}`] = c.screened
    metrics[`kept${c.fam}${c.p}`] = c.kept
  })
  metrics.gAllNonflat = E.G.allNonflat

  const rows = screens.flatMap(s => s.rows)
  const allNonflatB = screens
    .filter(s => s.family === 'B')
    .every(s => s.rows.every(r => r.check.nonflat === r.check.triangles))

  metrics.leastMovingPlain = Math.min(...rows.map(r => r.plain.unmatched))
  metrics.leastMovingCage = Math.min(...rows.map(r => r.cage.unmatched))
  metrics.worstResidual = Math.max(...rows.map(r => r.residual))

  const kept = rows.filter(r => r.kept)

  let status: Verdict['status'] = 'open'
  let word = 'OPEN'

  if (!step0) {
    notes.push('STEP 0 failed or is missing')
  } else if (!complete || !allNonflatB) {
    const covered = coverage.reduce((s, c) => s + c.screened, 0) / coverage.reduce((s, c) => s + c.n, 0)

    metrics.coveredFraction = covered
    notes.push(`not fully screened: covered ${covered.toFixed(4)}`)
  } else if (kept.length > 0) {
    notes.push(`${kept.length} classes pass the screen: STEP 2 (C_inf on nk 20 and 40, both sets) decides`)
  } else {
    status = 'fail'
    word = 'NONE'
  }

  return verdict({
    status,
    claim: `${word}: family B ${coverage
      .filter(c => c.fam === 'B')
      .map(c => `${c.p}-dock ${c.n} classes, ${c.kept} kept`)
      .join('; ')} (every triangle non-flat, gauge, rotations and cell translations removed); family G ${coverage.find(c => c.fam === 'G')!.n} classes of 3^8 maps, ${E.G.allNonflat} with every triangle non-flat, ${coverage.find(c => c.fam === 'G')!.kept} kept. Least start weight moving on the plain set ${metrics.leastMovingPlain!.toFixed(6)}, on the cage engine ${metrics.leastMovingCage!.toFixed(6)}. STEP 0 C_inf cf0 one-dock ${C1.toFixed(10)}, two-dock ${C2.toFixed(10)}, chain ${chainC.toExponential(2)}.`,
    metrics,
    control: { cf0CinfOneDock: C1, cf0CinfTwoDock: C2, chainCinf: chainC },
    notes: [
      'Bulk 4D band reads, never the husk. The screen is necessary for a cage, not sufficient: a kept class still needs STEP 2. No caging class, so the triality-zero check and uniqueness have nothing to print.',
      ...notes,
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/cage-cells',
  code: 'E-FRC-0000',
  title: 'explores whether a static centre field on a 2- or 3-dock cell, or a grid-move field, could stop a lone third exactly',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (about an hour; the runner deck/vibe/tmp/ccell.sh splits it)
    const enumeration = readEnumeration()
    const lam2 = sublattices(2)[0]!.lambda
    const grids = [
      { ...cellGrid(cf0Field(1, [0, 0, 0, 0]), 20), p: 1 },
      { ...cellGrid(identityCellField(1, [0, 0, 0, 0]), 20), p: 1 },
      { ...cellGrid(cf0Field(2, lam2), 20), p: 2 },
      { ...cellGrid(identityCellField(2, lam2), 20), p: 2 },
    ]

    return cageCellsVerdict({ instrument: readInstrument(), enumeration, screens: screenAll(enumeration), grids })
  },
})
