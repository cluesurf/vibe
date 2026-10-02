// THE DEPTH FROM GAUSS'S LAW ON THE WARPED COLUMN (E-FRC-0281, OPEN-FND-04, OPEN-LGT-04). Two counts are still
// chosen, the depth D and the light's split (roadmap Q "no free parameters"). Solutions section 7's second
// candidate, "D from the cusp", says the warp fixes the column depth: Gauss's law exact on the warped column forces
// one D. Two routes rows carry it: routes/mind-whole-engine-techniques.md (row "D from Gauss on the warped column":
// the Gauss residual on the warped column over D = 1 to 64, killed if exact at every D or at none) and
// routes/matter-forces-numbers.md (row "D from the cusp": Gauss's law on the warped column at D = 5 to 12, killed if
// every D satisfies it). E-FRC-0261 found that one light speed fixes only kappa against the register size and D never
// enters it, so a condition that fixes D has to come from somewhere else; this is one candidate.
//
// WHAT "THE WARPED COLUMN" IS IN THE CODE. The column is code/rule/trit-column's (E-FRC-0207): the D4 bulk with husk
// period L on x1, x2, x3 and period 2D on the depth x4, so each husk dock has a column of D bulk docks, levels
// m = 0 .. D - 1, each holding trits; the husk reads column sums. Gauss's law in the bulk holds by construction (the
// flux is the string minus the curl of the triangle potentials), and the husk's Gauss's law is the husk divergence
// of the column-summed flux against the column-summed charge (trit-column huskGaussViolations, held at D 4, 8, 16 in
// E-FRC-0207). The only code that warps a column is code/measure/photon-husk warpWeights (E-FRC-0177): a bulk link
// weighs lambda^(-s j) at the shallower of its two docks, j the dock's layer, lambda = 18.2787 the {3,4,3,4} warp
// factor (the largest root of lambda^3 - 21 lambda^2 + 51 lambda - 23, E-MTH-0007), s = 1/3 (a shell's linear size)
// or s = 1 (its share of the ball). There the layer is read both ways from the sheet, j = min(m, L - m), on the
// isotropic box where D = L, and E-FRC-0177 compared the warped divergence with the unweighted column charge. Here
// the same weights are put on the trit column with D free. "Gauss's law on the warped column at depth D" is then:
// for every bulk field of the rule's form, the husk divergence of the warped projection equals the column charge,
// read either weighted (each dock's charge times its own layer weight) or unweighted (E-FRC-0177's reading).
// Two layerings are run: two-sided, j = min(m, D - m) (E-FRC-0177's), and one-sided, j = m (a column with a top
// and a bottom). E-GRV-0102's warp (the bulk clock warped with the scale) acts on a scalar gravity stack's inertia
// only and does not enter a Gauss constraint, so it is not a reading of this question.
//
// DERIVED BEFORE THE GATE RUN.
// 1. NO LINK STAYS IN A COLUMN. Every D4 root has two nonzero coordinates, so none lies along the depth alone, and
//    every bulk link joins two columns. A link with no depth part keeps its level; a link along e_i + e4 or
//    e_i - e4 joins level m to level m or m - 1 (the column's x4 parity flips), and the level D - 1 to level 0
//    across the period. So the levels of every column form one chain, 0 - 1 - ... - (D - 1) - 0, through links.
// 2. THE THEOREM. Let a link l from dock x (column c) to dock y (column c') weigh w_l, and let the husk charge
//    read dock weights phi. The husk divergence at c takes +w_l E_l from l, the weighted charge at c takes
//    phi_x E_l from l (since q = div E), and likewise -w_l E_l against -phi_y E_l at c'. The two agree for every
//    field E exactly when phi_x = phi_y = w_l on every link. With weights that depend on the level only, that
//    forces one value along each chain of point 1, so the only weightings that keep Gauss's law exactly are the
//    constant ones. For lambda^(-s j) with s > 0 (injective in j) the residual vanishes identically exactly when no
//    link joins two different layers, which happens only when the column has a single layer: D = 1, where every
//    weight is lambda^0 = 1 and the warp has nothing to act on. For the unweighted charge reading the weights
//    must all be 1: again only D = 1. At every D >= 2 Gauss's law fails, and the failure does not depend on D.
//    So the warped projection is exact at D = 1 only, the column with no warp, and at no D >= 2; in 5 .. 12, at none.
// 3. THE WARP INSIDE THE RULE. If the warp is put into the constrained variable itself (the stored bulk flux is
//    F = w E and the rule's bulk Gauss's law is div F = q, as the gravity stacks of E-GRV-0100 to 0105 carry their
//    weights inside the rule), the column sum of F telescopes against the column sum of q at every D, by point 1's
//    no-link-in-a-column. That reading is exact at EVERY D. Either way D does not enter: Gauss's law is linear and
//    local, a column sum of bulk constraints, and the column's length is not in it.
// 4. D = 1 IS NOT A DEPTH THE WARP CHOOSES. It is the one value at which the column has one layer and no warp
//    exists. On E-FRC-0207's p = 1 trit light kappa = 2/(2D + 1) = 2/3 there, and with the husk's lambda_max = 16
//    kappa lambda_max = 32/3 > 4, outside the leapfrog's stable range (D >= 4 is needed); the adopted loop light runs
//    at kappa = 3/16 at every N (E-FRC-0260), so stability alone does not exclude it there. Its alpha at N = 3 and
//    rho = 0.4614 is 1/alpha = 36 sqrt(2 rho / 3) = 19.97, not 137.
// So the route is predicted to fail: the warped column keeps Gauss's law only where it is not warped.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/dg-probe1.ts built the trit bulk at side 4 for D = 1, 2, 3, 64 (docks
// 64 .. 4,096, 768 .. 49,152 links, 49 to 1,087 ms each), to size the run. No residual was read before the gates.
//
// WHAT IS RUN. Side 4 (64 husk docks), every D = 1 .. 64. Two fields of the rule's own form, all trits: (a) a
// love-fear pair joined by a string of three links along e1 + e4 (love at level 0, fear at level 1 when D >= 2),
// with every triangle's potential trit set to floor(3 frac(n phi)) - 1 from the golden Weyl sequence (n the
// triangle's index plus 1); (b) the same potentials with no pair, a charge-free curl field. The flux is
// trit-column bulkFlux. Exact counts in integers; warped residuals in floats.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: at every D = 1 .. 64, both fields: every stored value in -1 .. 1, 0 bulk Gauss violations
//     (trit-column bulkGaussViolations), and the flat column sum (s = 0) has 0 husk Gauss violations computed in
//     integers by this file's projection, and the same count from trit-column huskGaussViolations on its
//     columnSumLinks. The theorem's input: every bulk link joins two different columns (0 links inside a column).
//  C1 CONTROL (the instrument reads a failure): the one-sheet restriction (only links whose two docks are both at
//     level 0, E-FRC-0207's control) has husk Gauss violations > 0 on field (a) at every D = 2 .. 64.
//  H1 THE ROUTE: some warped reading (s in {1/3, 1}, either layering, either charge reading) has 0 violating husk
//     docks on both fields at some D in 2 .. 64, and some D in 2 .. 64 where it does not. (D = 1 is left out: the
//     column there has one layer and the warp is not defined on it; it is reported below.)
//  P1 THE FALSIFIER (point 2): at every D = 2 .. 64, every warped reading has violating husk docks > 0 on field
//     (a), the number of links joining different layers is > 0 for both layerings, and the level graph of point 1
//     (levels joined when a link joins them) is connected, so no level weighting but a constant keeps Gauss's law.
//     In particular no D in 5 .. 12 is exact (the cusp row's window).
// REPORTED, not moving the status:
//  D1 at D = 1 every warped reading has 0 violations on both fields, exactly (all weights are 1), as derived.
//  R0 the smallest relative residual |r|_2 / |P_w E|_2 over D = 2 .. 64 for each warped reading on field (a),
//     predicted far above the float floor (above 1e-3): no D comes near exact.
//  W  the warp inside the rule (point 3, s = 1, two-sided): the column sum of F = w E against the column sum of
//     div F, relative residual under 1e-12 at every D = 1 .. 64.
// VERDICT, fixed before the run: FAIL (as derived) when I1, C1 and P1 hold (the route fixes no D); PASS when I1, C1
//  and H1 hold; PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. It decides the question as the code defines the warped column: E-FRC-0177's layer
//  weights on the trit column of E-FRC-0207, on the flat D4 box. It does not build the true hyperbolic column, whose
//  link count grows with depth (E-FRC-0177 notes it is not built); point 2's argument covers any weighting by level
//  and point 3 any warp carried inside the rule's constraint, but a column whose geometry changes the incidence
//  itself is outside both. A fail removes Gauss's law as the source of D on this column; it says nothing about the
//  other D-fixing candidates (a fixed point of the running, a seam condition).
//
// Depth L1: exact counts and an exact identity, with the warped residuals in floats beside them.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  emptyTritState,
  huskGaussViolations,
  makeTritLight,
  placeTritPair,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'

const SIDE = 4
const DEPTHS = Array.from({ length: 64 }, (_, i) => i + 1)
const CUSP_WINDOW = [5, 12] as const
const WARPS = [1 / 3, 1] as const
const LAYERINGS = ['two', 'one'] as const
const READINGS = ['weighted', 'unweighted'] as const
const PATH = [0, 0, 0] // three steps along e1 + e4, the first root
const NEAR_EXACT = 1e-3
const RULE_TOLERANCE = 1e-12

type Layering = (typeof LAYERINGS)[number]
type Reading = (typeof READINGS)[number]

const ROOTS = rootsD4()

// the warp factor: the Perron root of lambda^3 - 21 lambda^2 + 51 lambda - 23 (E-MTH-0007)
function warpFactor(): number {
  let x = 18

  for (let i = 0; i < 60; i++) {
    const f = x ** 3 - 21 * x ** 2 + 51 * x - 23
    const df = 3 * x ** 2 - 42 * x + 51

    x -= f / df
  }

  return x
}

const LAMBDA = warpFactor()

// the far dock of each bulk link (12 first roots per dock)
function linkHeads(light: TritLight): Int32Array {
  const { bulk } = light
  const index = bulk.roots.map(r =>
    ROOTS.findIndex(v => v.every((x, k) => x === (r[k] ?? 0))),
  )

  return Int32Array.from({ length: bulk.links }, (_, l) => {
    const x = Math.floor(l / 12)

    return bulk.neighbour[x * 24 + (index[l % 12] ?? 0)] ?? 0
  })
}

function layerOf(m: number, depth: number, layering: Layering): number {
  return layering === 'two' ? Math.min(m, depth - m) : m
}

type Field = { state: TritState; flux: Int32Array }

function makeField(light: TritLight, pair: boolean): Field {
  const state = emptyTritState(light)

  for (let t = 0; t < light.bulk.triangles; t++) {
    state.potential[t] = Math.floor(3 * weyl(t + 1)) - 1
  }

  if (pair) {
    placeTritPair(light, state, 0, PATH, 1)
  }

  return { state, flux: bulkFlux(light, state) }
}

function tritsOutOfRange(s: TritState): number {
  let bad = 0

  for (const a of [s.vibe, s.angle, s.string, s.potential]) {
    for (const v of a) {
      bad += v >= -1 && v <= 1 ? 0 : 1
    }
  }

  return bad
}

// the husk residual r_c = div_h(P_w E)_c - Q_c, with link weights w (per bulk link) and dock weights phi for the
// charge (phi null: the unweighted column charge); returns the residual and the projected field
function huskResidual(
  light: TritLight,
  flux: ArrayLike<number>,
  charge: ArrayLike<number>,
  w: ArrayLike<number>,
  phi: ArrayLike<number> | null,
): { residual: Float64Array; projected: Float64Array } {
  const { bulk } = light
  const projected = new Float64Array(bulk.huskLinks)

  for (let l = 0; l < bulk.links; l++) {
    const x = Math.floor(l / 12)
    const h = (bulk.column[x] ?? 0) * 9 + (bulk.firstHusk[l % 12] ?? 0)

    projected[h] = (projected[h] ?? 0) + (w[l] ?? 0) * (flux[l] ?? 0)
  }

  const residual = new Float64Array(bulk.huskDocks)

  for (let h = 0; h < bulk.huskLinks; h++) {
    const y = Math.floor(h / 9)
    const z = bulk.huskNeighbour[h] ?? 0

    residual[y] = (residual[y] ?? 0) + (projected[h] ?? 0)
    residual[z] = (residual[z] ?? 0) - (projected[h] ?? 0)
  }

  for (let x = 0; x < bulk.docks; x++) {
    const c = bulk.column[x] ?? 0

    residual[c] =
      (residual[c] ?? 0) - (phi ? (phi[x] ?? 0) : 1) * (charge[x] ?? 0)
  }

  return { residual, projected }
}

const norm = (a: ArrayLike<number>): number => {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) ** 2
  }

  return Math.sqrt(s)
}

const nonzero = (a: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === 0 ? 0 : 1
  }

  return n
}

// the bulk divergence of a float link field
function bulkDivergence(
  light: TritLight,
  heads: Int32Array,
  f: ArrayLike<number>,
): Float64Array {
  const div = new Float64Array(light.bulk.docks)

  for (let l = 0; l < light.bulk.links; l++) {
    const x = Math.floor(l / 12)
    const y = heads[l] ?? 0

    div[x] = (div[x] ?? 0) + (f[l] ?? 0)
    div[y] = (div[y] ?? 0) - (f[l] ?? 0)
  }

  return div
}

// the level graph: levels m, m' joined when some link joins a dock at m to one at m'; its component count
function levelComponents(light: TritLight, heads: Int32Array): number {
  const d = light.bulk.depth
  const parent = Array.from({ length: d }, (_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      i = parent[i] ?? i
    }

    return i
  }

  for (let l = 0; l < light.bulk.links; l++) {
    const a = find(light.bulk.level[Math.floor(l / 12)] ?? 0)
    const b = find(light.bulk.level[heads[l] ?? 0] ?? 0)

    if (a !== b) {
      parent[a] = b
    }
  }

  return new Set(parent.map((_, i) => find(i))).size
}

type DepthRead = Record<string, number>

function readDepth(depth: number): DepthRead {
  const light = makeTritLight({ side: SIDE, depth })
  const { bulk } = light
  const heads = linkHeads(light)
  const out: DepthRead = {}
  const fields = { a: makeField(light, true), b: makeField(light, false) }
  const ones = new Float64Array(bulk.links).fill(1)

  // I1: the instrument
  let inColumn = 0

  for (let l = 0; l < bulk.links; l++) {
    inColumn +=
      bulk.column[Math.floor(l / 12)] === bulk.column[heads[l] ?? 0] ? 1 : 0
  }

  out.linksInsideColumn = inColumn

  for (const [name, f] of Object.entries(fields)) {
    out[`outOfRange_${name}`] = tritsOutOfRange(f.state)
    out[`bulkGauss_${name}`] = bulkGaussViolations(light, f.state)

    const flat = huskResidual(light, f.flux, f.state.vibe, ones, null)

    out[`flatHusk_${name}`] = nonzero(flat.residual)
    out[`flatHuskTrit_${name}`] = huskGaussViolations(
      light,
      columnSumLinks(light, f.flux),
      f.state.vibe,
    )
  }

  // C1: the one-sheet restriction
  const sheet = Float64Array.from({ length: bulk.links }, (_, l) =>
    bulk.level[Math.floor(l / 12)] === 0 && bulk.level[heads[l] ?? 0] === 0
      ? 1
      : 0,
  )

  out.sheetHusk_a = nonzero(
    huskResidual(
      light,
      fields.a.flux,
      fields.a.state.vibe,
      sheet,
      null,
    ).residual,
  )

  // the warped readings
  for (const layering of LAYERINGS) {
    const layer = Int32Array.from({ length: bulk.docks }, (_, x) =>
      layerOf(bulk.level[x] ?? 0, depth, layering),
    )
    let crossing = 0

    for (let l = 0; l < bulk.links; l++) {
      crossing +=
        layer[Math.floor(l / 12)] === layer[heads[l] ?? 0] ? 0 : 1
    }

    out[`crossingLinks_${layering}`] = crossing

    for (const s of WARPS) {
      const tag = `${layering}_s${s === 1 ? '1' : 'Third'}`
      const phi = Float64Array.from(layer, j => LAMBDA ** (-s * j))
      const w = Float64Array.from({ length: bulk.links }, (_, l) => {
        const j = Math.min(
          layer[Math.floor(l / 12)] ?? 0,
          layer[heads[l] ?? 0] ?? 0,
        )

        return LAMBDA ** (-s * j)
      })

      for (const reading of READINGS) {
        for (const [name, f] of Object.entries(fields)) {
          const r = huskResidual(
            light,
            f.flux,
            f.state.vibe,
            w,
            reading === 'weighted' ? phi : null,
          )

          out[`violations_${tag}_${reading}_${name}`] = nonzero(r.residual)
          out[`relResidual_${tag}_${reading}_${name}`] =
            norm(r.residual) / Math.max(norm(r.projected), 1e-300)
        }
      }

      // W: the warp inside the rule, F = w E with q' = div F
      if (layering === 'two' && s === 1) {
        const fa = Float64Array.from(fields.a.flux, (e, l) => e * (w[l] ?? 0))
        const q = bulkDivergence(light, heads, fa)
        const r = huskResidual(light, fa, q, ones, null)

        out.ruleWarpRelResidual = norm(r.residual) / norm(r.projected)
      }
    }
  }

  out.levelComponents = levelComponents(light, heads)

  return out
}

function run() {
  const reads = DEPTHS.map(d => readDepth(d))
  const at = (d: number): DepthRead => reads[d - 1] ?? {}
  const v = (d: number, key: string): number => at(d)[key] ?? Number.NaN
  const deep = DEPTHS.filter(d => d >= 2)
  const tags = LAYERINGS.flatMap(layering =>
    WARPS.flatMap(s =>
      READINGS.map(
        reading => `${layering}_s${s === 1 ? '1' : 'Third'}_${reading}`,
      ),
    ),
  )

  // I1
  const i1 = DEPTHS.every(
    d =>
      v(d, 'linksInsideColumn') === 0 &&
      ['a', 'b'].every(
        n =>
          v(d, `outOfRange_${n}`) === 0 &&
          v(d, `bulkGauss_${n}`) === 0 &&
          v(d, `flatHusk_${n}`) === 0 &&
          v(d, `flatHuskTrit_${n}`) === 0,
      ),
  )
  // C1
  const c1 = deep.every(d => v(d, 'sheetHusk_a') > 0)
  // H1
  const exactAt = (d: number, tag: string): boolean =>
    v(d, `violations_${tag}_a`) === 0 && v(d, `violations_${tag}_b`) === 0
  const h1 = tags.some(
    tag =>
      deep.some(d => exactAt(d, tag)) && deep.some(d => !exactAt(d, tag)),
  )
  // P1
  const p1 = deep.every(
    d =>
      tags.every(tag => v(d, `violations_${tag}_a`) > 0) &&
      LAYERINGS.every(l => v(d, `crossingLinks_${l}`) > 0) &&
      v(d, 'levelComponents') === 1,
  )
  const exactInCusp = DEPTHS.filter(
    d => d >= CUSP_WINDOW[0] && d <= CUSP_WINDOW[1],
  ).filter(d => tags.some(tag => exactAt(d, tag))).length
  const exactDeep = deep.filter(d => tags.some(tag => exactAt(d, tag))).length
  // reported
  const d1 = tags.every(tag => exactAt(1, tag))
  const minRel = Object.fromEntries(
    tags.map(tag => [
      `minRelResidual_${tag}`,
      Math.min(...deep.map(d => v(d, `relResidual_${tag}_a`))),
    ]),
  )
  const argMin = Object.fromEntries(
    tags.map(tag => {
      const vals = deep.map(d => v(d, `relResidual_${tag}_a`))

      return [`argMinD_${tag}`, deep[vals.indexOf(Math.min(...vals))] ?? 0]
    }),
  )
  const r0 = Object.values(minRel).every(x => x > NEAR_EXACT)
  const ruleWorst = Math.max(...DEPTHS.map(d => v(d, 'ruleWarpRelResidual')))
  const w = ruleWorst < RULE_TOLERANCE

  const status = i1 && c1 && p1 ? 'fail' : i1 && c1 && h1 ? 'pass' : 'partial'
  const sample = (key: string): Record<string, number> =>
    Object.fromEntries(
      [1, 2, 3, 4, 5, 8, 12, 16, 32, 64].map(d => [
        `${key}_D${d}`,
        v(d, key),
      ]),
    )

  const metrics: Record<string, number> = {
    lambda: LAMBDA,
    gateI1: i1 ? 1 : 0,
    gateC1: c1 ? 1 : 0,
    gateH1: h1 ? 1 : 0,
    gateP1: p1 ? 1 : 0,
    reportD1: d1 ? 1 : 0,
    reportR0: r0 ? 1 : 0,
    reportW: w ? 1 : 0,
    exactDepthsIn2to64: exactDeep,
    exactDepthsIn5to12: exactInCusp,
    ruleWarpWorstRelResidual: ruleWorst,
    ...minRel,
    ...argMin,
    ...sample('crossingLinks_two'),
    ...sample('crossingLinks_one'),
    ...sample('levelComponents'),
    ...sample('violations_two_s1_weighted_a'),
    ...sample('violations_two_s1_weighted_b'),
    ...sample('relResidual_two_s1_weighted_a'),
    ...sample('relResidual_two_sThird_weighted_a'),
    ...sample('relResidual_one_s1_weighted_a'),
    ...sample('relResidual_two_s1_unweighted_a'),
    ...sample('relResidual_two_s1_weighted_b'),
    ...sample('sheetHusk_a'),
    ...sample('ruleWarpRelResidual'),
  }
  const control: Record<string, number> = {
    ...sample('flatHusk_a'),
    ...sample('flatHusk_b'),
    ...sample('bulkGauss_a'),
  }

  return verdict({
    status,
    claim: `Gauss's law on the warped column (E-FRC-0177's layer weights lambda^(-s j), s = 1/3 and 1, on E-FRC-0207's trit column, side 4) holds exactly at ${exactDeep} of the depths D = 2 .. 64 and ${exactInCusp} of D = 5 .. 12, under both layerings and both charge readings, and at D = 1 ${d1 ? 'it holds' : 'it does not hold'} (one layer, every weight 1); the level graph is connected at every D, so only a constant weighting keeps Gauss's law, while the flat sum and the warp carried inside the rule keep it at every D (worst ${ruleWorst.toExponential(1)}): D does not enter Gauss's law`,
    metrics,
    control,
    notes:
      'L1 counts and identity; warped residuals in floats. The one-sheet restriction is the control that the instrument reads a failure. D = 1 is excluded from H1 because the warp needs two layers. The true hyperbolic column (link count growing with depth) is not built.',
  })
}

export default experiment({
  id: 'gauge/depth-from-gauss',
  code: 'E-FRC-0281',
  title:
    "the depth from Gauss's law on the warped column, as derived before the run",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run,
})
