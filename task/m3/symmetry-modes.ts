// M3 driver (item vibe-computation-models-0053): is the excited-mode deficit of E-CMP-0046 (fewer standing modes from
// one source on every hyperbolic quotient) curvature, or the symmetry group of the regular maps it was read on?
//
//   pnpm call task/m3/symmetry-modes.ts [--reproduce true] [--surfaces 4-5-11,6-4-11,3-7-13] [--max-subgroup 12]
//        [--min-cells 20] [--max-quotients 1] [--honeycomb-level 5] [--honeycomb-read false]
//        [--honeycomb-quotients 0] [--honeycomb-subgroup-order 8] [--honeycomb-scan 48] [--honeycomb-min-word 3]
//        [--orbit-cap 0]
//        [--automorphism-budget 200000] [--orbit-budget 400000] [--automorphisms true] [--orbits true]
//        [--reproduce-bounds false]
//
// PART R (--reproduce): E-CMP-0046's closed-quotient pairs and flat size series, read with its measures and its run
// cap, printed in its own log format behind `reproduce `, so a diff against the experiment's log shows equality.
//
// PART S: the symmetry controls. Hyperbolic side: the regular maps of E-CMP-0046 (and larger ones by --surfaces,
// written p-q-modulus) modulo every subgroup H of the rotation group up to --max-subgroup, one per conjugacy class,
// that acts freely (low-symmetry-quotient.ts subgroupQuotientMap); a non-normal H gives a non-regular map. With
// --honeycomb-read the {3,4,3,4} level --honeycomb-level (5: 16,384 docks) is read, and with --honeycomb-quotients K
// its quotients by K subgroups of the frame group of order --honeycomb-subgroup-order (8 at level 5 gives 2,048 docks,
// the size of level 4, which is the quotient by the normal kernel). Flat side: tori of every shape class
// (rectangular and twisted) and flat Klein bottles of the same degree and size band, and twisted D4 tori for degree 24.
//
// Declared before any run (the measures and the curvature reading are E-CMP-0046's, m8-resonance.md):
// - Measures per graph and law (self 0, self 1), source at cell 0: k (Krylov degree of A' on delta_0 over F3) and k/N;
//   the exact orbit period P from the order of x modulo x^k m(x + 1/x) (mode-bounds.ts, NO cap; checked equal to the
//   run wherever the run closes under the cap); the period mean of M^2 / N^2 when the run closes under the cap; the
//   uniform-mode gate; the Krylov gates (m kills delta_0, its truncation does not).
// - Beside every reading: N, bipartite, injectivity and loop systole, genus (Euler characteristic for 4D), |Aut|
//   (graph-automorphism.ts), |Aut| / N, the equitable bound and the Stab(0) orbit count (both bound k from above).
// - Flat pool of a hyperbolic member of degree p and N cells: flat maps of degree p with |cells - N| <= N / 5 (below
//   100 cells) or N / 10. Tori: sides a <= b <= 1.6 a, shift s in {0, 1, floor(a / 2)} (degree 3 counts 2ab cells).
//   Klein bottles: the shapes with the fewest rows (b = 3, 4) and the squarest one. D4: the listed twisted lattices.
// - Symmetry match: the pool members whose |Aut| / N is nearest the hyperbolic member's in ratio (|log| distance,
//   ties kept), the ratio gap printed.
// - Placement (E-CMP-0046's rule): k/N, period, phase order of the hyperbolic member against [min, max] of the pool
//   and of the matched set, `below`, `above`, `inside`, `unresolved`.
// - Reading for the item: the deficit is group theory if k/N of the low-symmetry hyperbolic quotients reaches the flat
//   pool range (inside or above), curvature-like if it stays below it at every symmetry level, both laws.
//
// Exact integers, F3 and bigint only. No random numbers.

import { automorphismOrder } from '@/code/measure/graph-automorphism'
import { equitableBound, exactWavePeriod, stabilizerOrbits } from '@/code/measure/mode-bounds'
import {
  compareFractions,
  evaluatePolynomialOn,
  fraction,
  fractionToNumber,
  isBipartite,
  krylovMinimalPolynomial,
  shiftedAdjacencyMinimalPolynomial,
  uniformModePeriod,
  waveMap,
  waveOrbit,
  type Fraction,
} from '@/code/measure/z3-resonance'
import {
  axialKleinGlide,
  cayleyStructure,
  cayleySubgroups,
  D4_TILING,
  farDocks,
  flatQuotient,
  HEXAGON_TILING,
  leftCosetQuotient,
  rotationGroup,
  SQUARE_TILING,
  squareKleinGlide,
  subgroupClasses,
  subgroupQuotientMap,
  TRIANGLE_TILING,
  type FlatQuotient,
  type Lattice,
  type PeriodicTiling,
} from '@/code/substrate/low-symmetry-quotient'
import {
  ballSystole,
  closedQuotients,
  d4Torus,
  findRotaryMap,
  hexagonTorus,
  projectiveGroup,
  referenceTiling,
  rotaryMap,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { flags, intFlag, listFlag, seconds, summary } from './args'

const f = flags()
const reproduce = f.get('reproduce') !== 'false'
// p-q-modulus words; `none` reads no surface
const surfaces = listFlag(f, 'surfaces', ['4-5-11']).filter(w => w !== 'none')
const maxSubgroup = intFlag(f, 'max-subgroup', 12)
const minCells = intFlag(f, 'min-cells', 20)
const maxQuotients = intFlag(f, 'max-quotients', 1)
// the {3,4,3,4} 2-adic level read and quotiented (5 is the 16,384-dock level, 4 the 2,048-dock one)
const honeycombLevel = intFlag(f, 'honeycomb-level', 5)
const honeycombRead = f.get('honeycomb-read') === 'true'
const honeycombSubgroupOrder = intFlag(f, 'honeycomb-subgroup-order', 8)
const honeycombQuotients = intFlag(f, 'honeycomb-quotients', 0)
const honeycombScan = intFlag(f, 'honeycomb-scan', 48)
// candidate generators start at this word length from dock 0 (shorter words fold neighbours together)
const honeycombMinWord = intFlag(f, 'honeycomb-min-word', 3)
const orbitCapFlag = intFlag(f, 'orbit-cap', 0)
const automorphismBudget = intFlag(f, 'automorphism-budget', 200_000)
const orbitBudget = intFlag(f, 'orbit-budget', 400_000)
const withAutomorphisms = f.get('automorphisms') !== 'false'
const withOrbits = f.get('orbits') !== 'false'
// |Aut| and the bounds on the reproduced E-CMP-0046 graphs too (the experiment did not read them)
const reproduceBounds = f.get('reproduce-bounds') === 'true'
const t0 = performance.now()
const log = (line: string): void => console.log(`${line} (${seconds(t0)} s)`)

type Check = { name: string; ok: boolean }

const checks: Check[] = []
const negatives: Check[] = []

// ---- one graph, the E-CMP-0046 measures plus the exact period and the bounds ----

type Law = 'self0' | 'self1'

const SIGMA: Readonly<Record<Law, number>> = { self0: 0, self1: 1 }

type LawReading = {
  krylov: number
  // the run's period under the cap, -1 past it (E-CMP-0046's reading)
  period: number
  // the exact period from the algebra, null when 3^d - 1 was not certified
  exactPeriod: bigint | null
  largestFactorDegree: number
  phaseOrder: Fraction | null
}

type GraphSpec = {
  name: string
  curvature: 'flat' | 'hyperbolic'
  degree: number
  neighbors: number[][]
  systole: number | null
  loopSystole: number | null
  genus: number | null
  euler: number | null
  orientable: boolean | null
  construction: string
  // orientation-preserving map automorphisms known from the construction (|N_G(H) / H|), a divisor check on |Aut|
  mapAutomorphisms?: number
}

type GraphReading = GraphSpec & {
  cells: number
  bipartite: boolean
  automorphisms: bigint | null
  equitable: number
  orbits: number | null
  laws: Record<Law, LawReading>
}

const capOf = (n: number, degree: number): number =>
  orbitCapFlag > 0 ? orbitCapFlag : Math.max(2000, Math.floor(1.2e7 / (n * (degree + 1))))

function readGraph(g: GraphSpec, options: { bounds: boolean }): GraphReading {
  const n = g.neighbors.length
  const delta = new Uint8Array(n)

  delta[0] = 1

  const laws = {} as Record<Law, LawReading>

  for (const law of ['self0', 'self1'] as const) {
    const sigma = SIGMA[law]
    const m = shiftedAdjacencyMinimalPolynomial({ neighbors: g.neighbors, sigma, seed: delta })
    const killed = evaluatePolynomialOn(g.neighbors, sigma, m, delta).every(v => v === 0)
    const truncated = evaluatePolynomialOn(g.neighbors, sigma, m.slice(1), delta).every(v => v === 0)

    checks.push({ name: `B1 ${g.name} ${law}: the Krylov polynomial kills the source`, ok: killed })
    negatives.push({ name: `NB1 ${g.name} ${law}: its truncation does not`, ok: !truncated })

    if (n <= 60) {
      const seed = new Uint8Array(2 * n)

      seed[n] = 1

      const mt = krylovMinimalPolynomial({ apply: waveMap(g.neighbors, sigma), seed, maxDegree: 2 * n })

      checks.push({ name: `B2 ${g.name} ${law}: T's cyclic space has dimension 2k`, ok: mt !== null && mt.length - 1 === 2 * (m.length - 1) })
    }

    const orbit = waveOrbit({ neighbors: g.neighbors, sigma, previous: new Uint8Array(n), current: delta, cap: capOf(n, g.degree) })
    const exact = exactWavePeriod(m)

    if (orbit.period > 0) {
      checks.push({ name: `P ${g.name} ${law}: the exact period ${exact.period} equals the run's ${orbit.period}`, ok: exact.period === BigInt(orbit.period) })
    } else if (exact.period !== null) {
      checks.push({ name: `P ${g.name} ${law}: the exact period ${exact.period} exceeds the run cap`, ok: exact.period > BigInt(capOf(n, g.degree)) })
    }

    const uniformPeriod = uniformModePeriod(g.degree + sigma)
    const uniform = waveOrbit({ neighbors: g.neighbors, sigma, previous: new Uint8Array(n), current: new Uint8Array(n).fill(1), cap: 20 })

    checks.push({ name: `B3 ${g.name} ${law}: the uniform mode returns at ${uniformPeriod}`, ok: uniform.period === uniformPeriod })

    laws[law] = {
      krylov: m.length - 1,
      period: orbit.period,
      exactPeriod: exact.period,
      largestFactorDegree: exact.largestDegree,
      phaseOrder: orbit.phaseOrder,
    }
  }

  let automorphisms: bigint | null = null
  let equitable = -1
  let orbits: number | null = null

  if (options.bounds) {
    if (withAutomorphisms) {
      automorphisms = automorphismOrder({ neighbors: g.neighbors, budget: automorphismBudget }).order

      if (automorphisms !== null && g.mapAutomorphisms !== undefined) {
        checks.push({ name: `A ${g.name}: |Aut| ${automorphisms} is a multiple of the map automorphisms ${g.mapAutomorphisms}`, ok: automorphisms % BigInt(g.mapAutomorphisms) === 0n })
      }
    }

    equitable = equitableBound(g.neighbors, 0)

    if (withOrbits) {
      const o = stabilizerOrbits({ neighbors: g.neighbors, root: 0, budget: orbitBudget })

      orbits = o.orbits
      checks.push({ name: `E ${g.name}: the equitable count ${equitable} matches the orbit search's own ${o.equitable}`, ok: equitable === o.equitable })

      if (orbits !== null) {
        checks.push({ name: `O ${g.name}: k <= equitable <= orbits (${laws.self0.krylov}, ${laws.self1.krylov} <= ${equitable} <= ${orbits})`, ok: laws.self0.krylov <= equitable && laws.self1.krylov <= equitable && equitable <= orbits })
      }
    } else {
      checks.push({ name: `O ${g.name}: k <= equitable`, ok: laws.self0.krylov <= equitable && laws.self1.krylov <= equitable })
    }
  }

  return { ...g, cells: n, bipartite: isBipartite(g.neighbors), automorphisms, equitable, orbits, laws }
}

const show = (x: Fraction | null): string => (x === null ? 'n/a' : String(fractionToNumber(x)))

// E-CMP-0046's own log line
function modesLine(g: GraphReading): string {
  return `modes ${g.name} (${g.curvature}, N ${g.cells}, degree ${g.degree}, bipartite ${g.bipartite}, systole ${g.systole ?? 'n/a'}/${g.loopSystole ?? 'n/a'}): ${(['self0', 'self1'] as const).map(l => `${l} P ${g.laws[l].period} k ${g.laws[l].krylov} M2 ${show(g.laws[l].phaseOrder)}`).join('; ')}`
}

function factsLine(g: GraphReading): string {
  const ratio = g.automorphisms === null ? 'n/a' : (Number(g.automorphisms) / g.cells).toPrecision(4)

  return `facts ${g.name}: N ${g.cells}, genus ${g.genus ?? 'n/a'}, euler ${g.euler ?? 'n/a'}, orientable ${g.orientable ?? 'n/a'}, systole ${g.systole ?? 'n/a'}/${g.loopSystole ?? 'n/a'}, |Aut| ${g.automorphisms ?? 'n/a'}, |Aut|/N ${ratio}, equitable ${g.equitable}, orbits ${g.orbits ?? 'n/a'}; ${(['self0', 'self1'] as const).map(l => `${l} k ${g.laws[l].krylov} exactP ${g.laws[l].exactPeriod ?? 'unresolved'} (largest factor degree ${g.laws[l].largestFactorDegree})`).join('; ')}; ${g.construction}`
}

// ---- placements (E-CMP-0046's rule; exact periods have no open end) ----

type Placement = 'above' | 'below' | 'inside' | 'unresolved'

function placeFraction(h: Fraction | null, flat: readonly (Fraction | null)[]): Placement {
  if (h === null) {
    return 'unresolved'
  }

  const resolved = flat.filter((v): v is Fraction => v !== null)

  if (resolved.length === 0) {
    return 'unresolved'
  }

  if (resolved.every(v => compareFractions(h, v) < 0)) {
    return 'below'
  }

  if (resolved.length === flat.length && resolved.every(v => compareFractions(h, v) > 0)) {
    return 'above'
  }

  return 'inside'
}

function placeNumber(h: number, flat: readonly number[]): Placement {
  if (h < 0) {
    return 'unresolved'
  }

  const resolved = flat.filter(v => v >= 0)

  if (resolved.length === 0) {
    return 'unresolved'
  }

  if (h < Math.min(...resolved)) {
    return 'below'
  }

  if (resolved.length === flat.length && h > Math.max(...resolved)) {
    return 'above'
  }

  return 'inside'
}

function placeBig(h: bigint | null, flat: readonly (bigint | null)[]): Placement {
  return placeFraction(h === null ? null : fraction(h), flat.map(v => (v === null ? null : fraction(v))))
}

const MEASURES = ['period', 'krylovShare', 'phaseOrder'] as const

type Measure = (typeof MEASURES)[number] | 'exactPeriod'

function place(h: GraphReading, flat: readonly GraphReading[], law: Law, measure: Measure): Placement {
  if (measure === 'period') {
    return placeNumber(h.laws[law].period, flat.map(x => x.laws[law].period))
  }

  if (measure === 'exactPeriod') {
    return placeBig(h.laws[law].exactPeriod, flat.map(x => x.laws[law].exactPeriod))
  }

  if (measure === 'krylovShare') {
    return placeFraction(fraction(h.laws[law].krylov, h.cells), flat.map(x => fraction(x.laws[law].krylov, x.cells)))
  }

  return placeFraction(h.laws[law].phaseOrder, flat.map(x => x.laws[law].phaseOrder))
}

// ---- PART R: E-CMP-0046's pairs ----

function torusSpec(name: string, degree: number, neighbors: number[][]): GraphSpec {
  return { name, curvature: 'flat', degree, neighbors, systole: null, loopSystole: null, genus: 1, euler: 0, orientable: true, construction: name }
}

// E-CMP-0046's flatSeries
function flatSeries(degree: number, n: number): GraphSpec[] {
  const band = n < 100 ? n / 5 : n / 10
  const out: GraphSpec[] = []

  for (let a = 3; a * a <= n + band; a++) {
    for (let b = a; b <= 1.6 * a; b++) {
      const cells = degree === 3 ? 2 * a * b : a * b

      if (Math.abs(cells - n) > band) {
        continue
      }

      if (degree === 4) {
        out.push(torusSpec(`square-${a}x${b}`, 4, squareTorus(a, b).analysis.neighbors))
      } else if (degree === 6) {
        out.push(torusSpec(`hexagon-${a}x${b}`, 6, hexagonTorus(a, b).analysis.neighbors))
      } else if (degree === 3) {
        out.push(torusSpec(`triangle-${a}x${b}`, 3, triangleTorus(a, b).analysis.neighbors))
      }
    }
  }

  return out
}

type ReproducedPair = { label: string; hyperbolic: GraphReading; partner: GraphReading; series: GraphReading[] }

const catalog = closedQuotients()

function reproducePairs(): ReproducedPair[] {
  const byName = new Map(catalog.map(e => [e.quotient.name, e.quotient]))
  const pairs: ReproducedPair[] = []
  const specs: { label: string; hyperbolic: GraphSpec; partner: GraphSpec; series: GraphSpec[] }[] = []

  for (const e of catalog) {
    const q = e.quotient

    if (q.curvature !== 'hyperbolic' || q.partner === null) {
      continue
    }

    const partner = byName.get(q.partner)!
    const asSpec = (x: typeof q): GraphSpec => ({
      name: x.name,
      curvature: x.curvature,
      degree: x.degree,
      neighbors: x.neighbors,
      systole: x.systole,
      loopSystole: x.loopSystole,
      genus: x.genus,
      euler: x.euler,
      orientable: true,
      construction: x.construction,
    })
    const series =
      q.degree === 24
        ? [4, 6, 8, 10].map(side => torusSpec(`d4-side-${side}`, 24, d4Torus(side).neighbors))
        : flatSeries(q.degree, q.cells)

    specs.push({ label: `${q.name}/${partner.name}`, hyperbolic: asSpec(q), partner: asSpec(partner), series })
  }

  for (const [p, qq, modulus, torus, torusName] of [
    [4, 5, 11, squareTorus(15, 22), 'square-15x22'],
    [3, 7, 13, triangleTorus(13, 14), 'triangle-13x14'],
  ] as const) {
    const rotary = findRotaryMap({ p, q: qq, moduli: [modulus], reference: referenceTiling([p, qq], 6000), minSystole: 1 })

    if (!rotary) {
      throw new Error(`symmetry-modes: no {${p},${qq}} map in PGL(2,${modulus})`)
    }

    const n = rotary.analysis.faces
    const hyperbolic: GraphSpec = {
      name: `surface-${p}-${qq}-pgl2-${modulus}-${n}`,
      curvature: 'hyperbolic',
      degree: p,
      neighbors: rotary.analysis.neighbors,
      systole: null,
      loopSystole: null,
      genus: rotary.analysis.genus,
      euler: rotary.analysis.euler,
      orientable: true,
      construction: `regular map in PGL(2,${modulus})`,
    }

    specs.push({ label: `${hyperbolic.name}/${torusName}`, hyperbolic, partner: torusSpec(torusName, p, torus.analysis.neighbors), series: flatSeries(p, n) })
  }

  for (const s of specs) {
    const pair: ReproducedPair = {
      label: s.label,
      hyperbolic: readGraph(s.hyperbolic, { bounds: reproduceBounds }),
      partner: readGraph(s.partner, { bounds: reproduceBounds }),
      series: s.series.map(g => readGraph(g, { bounds: reproduceBounds })),
    }

    for (const g of [pair.hyperbolic, pair.partner, ...pair.series]) {
      log(`reproduce ${modesLine(g)}`)

      if (reproduceBounds) {
        log(`reproduce ${factsLine(g)}`)
      }
    }

    for (const law of ['self0', 'self1'] as const) {
      log(`reproduce pair ${pair.label} ${law}: ${MEASURES.map(m => `${m} ${place(pair.hyperbolic, [pair.partner, ...pair.series], law, m)}`).join(', ')}`)
    }

    pairs.push(pair)
  }

  return pairs
}

// ---- PART S: low-symmetry hyperbolic quotients ----

const REFERENCE_CELLS = 6000

function systoleOf(neighbors: number[][], symbol: readonly number[], degree: number): { systole: number; loopSystole: number | null } {
  const s = ballSystole({ neighbors, reference: referenceTiling(symbol, REFERENCE_CELLS), referenceDegree: degree })

  return { systole: s.systole, loopSystole: s.loopSystole }
}

function surfaceQuotients(): GraphSpec[] {
  const out: GraphSpec[] = []

  for (const word of surfaces) {
    const [p, q, modulus] = word.split('-').map(Number) as [number, number, number]
    const reference = referenceTiling([p, q], REFERENCE_CELLS)
    const rotary = findRotaryMap({ p, q, moduli: [modulus], reference, minSystole: 1 })

    if (!rotary) {
      log(`surface {${p},${q}} mod ${modulus}: no regular map with systole >= 1`)
      continue
    }

    const group = projectiveGroup(modulus)
    const rotation = rotationGroup({ group, x: rotary.x, y: rotary.y })
    const map = rotaryMap(group, rotation.elements, rotation.x, rotation.y)
    const sameMap = map.faceNext.every((v, i) => v === rotary.map.faceNext[i]) && map.edgeMate.every((v, i) => v === rotary.map.edgeMate[i])

    checks.push({ name: `R {${p},${q}} PGL(2,${modulus}): the rebuilt regular map equals findRotaryMap's dart for dart`, ok: sameMap })

    const classes = subgroupClasses(rotation, maxSubgroup)

    let valid = 0

    for (const c of classes) {
      const quotient = subgroupQuotientMap({ rotation, map, members: c.members, p, q })
      const failing = Object.entries(quotient.analysis.gates).filter(([, ok]) => !ok).map(([gate]) => gate)

      log(`  subgroup order ${c.order} ${c.cyclic ? 'cyclic' : 'two-generated'} (${c.classSize} conjugates): ${quotient.valid ? `free, ${quotient.analysis.faces} cells` : `rejected (${failing.join(', ') || 'darts'})`}`)

      if (!quotient.valid || quotient.analysis.faces < minCells) {
        continue
      }

      valid++

      const neighbors = quotient.analysis.neighbors
      const sys = systoleOf(neighbors, [p, q], p)
      const normal = c.classSize === 1

      out.push({
        name: `quotient-${p}-${q}-pgl2-${modulus}-H${c.order}${c.cyclic ? 'c' : 'b'}-${c.members[1]}`,
        curvature: 'hyperbolic',
        degree: p,
        neighbors,
        systole: sys.systole,
        loopSystole: sys.loopSystole,
        genus: quotient.analysis.genus,
        euler: quotient.analysis.euler,
        orientable: true,
        construction: `{${p},${q}} regular map of PGL(2,${modulus}) (rotation group order ${rotation.elements.length}) modulo a ${c.cyclic ? 'cyclic' : 'two-generated'} subgroup of order ${c.order}, ${normal ? 'NORMAL (regular quotient)' : `not normal (${c.classSize} conjugates)`}, |N(H)/H| = ${c.normalizerOrder / c.order}`,
        mapAutomorphisms: c.normalizerOrder / c.order,
      })
    }

    log(`surface {${p},${q}} PGL(2,${modulus}): rotation group ${rotation.elements.length}, ${classes.length} subgroup classes up to order ${maxSubgroup}, ${valid} free with at least ${minCells} cells`)
  }

  return out.sort((a, b) => a.neighbors.length - b.neighbors.length || (a.name < b.name ? -1 : 1)).slice(0, maxQuotients)
}

function honeycombGraphs(): GraphSpec[] {
  const out: GraphSpec[] = []

  if (!honeycombRead && honeycombQuotients === 0) {
    return out
  }

  const name = `honeycomb-3-4-3-4-level-${honeycombLevel}`
  const entry = catalog.find(e => e.quotient.name === name)

  if (!entry) {
    throw new Error(`symmetry-modes: the catalog has no ${name}`)
  }

  const q = entry.quotient

  if (honeycombRead) {
    out.push({
      name: q.name,
      curvature: 'hyperbolic',
      degree: 24,
      neighbors: q.neighbors,
      systole: q.systole,
      loopSystole: q.loopSystole,
      genus: null,
      euler: q.euler,
      orientable: true,
      construction: q.construction,
    })
  }

  if (honeycombQuotients > 0) {
    const order = honeycombSubgroupOrder
    const cayley = cayleyStructure(q.neighbors)
    const candidates = farDocks(cayley, honeycombMinWord, honeycombScan)
    const subgroups = cayleySubgroups({ cayley, order, candidates, limit: 4 * honeycombQuotients })

    log(`honeycomb level ${honeycombLevel}: ${q.cells} docks, ${subgroups.length} classes of order-${order} subgroups from ${candidates.length} docks at word length >= ${honeycombMinWord}`)

    let taken = 0

    for (const h of subgroups) {
      if (taken >= honeycombQuotients) {
        break
      }

      const automorphic = h.members.every(g => cayley.isLeftAutomorphism(g))

      checks.push({ name: `C level ${honeycombLevel} H{${h.generators.join(',')}}: left multiplication is a graph automorphism`, ok: automorphic })

      const quotient = leftCosetQuotient({ neighbors: q.neighbors, cayley, members: h.members })

      log(`  subgroup {${h.generators.join(',')}} (${h.classSize} conjugates): ${quotient.simple ? `simple, ${quotient.cells} docks` : 'rejected (not simple)'}`)

      if (!quotient.simple) {
        continue
      }

      taken++

      const euler = q.euler === null ? null : q.euler / order

      checks.push({ name: `C level ${honeycombLevel} / H: ${q.cells / order} docks and an integral Euler characteristic`, ok: quotient.cells * order === q.cells && (euler === null || Number.isInteger(euler)) })
      out.push({
        name: `${name}-mod-H${order}-${h.members[1]}`,
        curvature: 'hyperbolic',
        degree: 24,
        neighbors: quotient.neighbors,
        systole: null,
        loopSystole: null,
        genus: null,
        euler,
        orientable: true,
        construction: `{3,4,3,4} level ${honeycombLevel} frame group modulo an order-${order} subgroup generated by docks ${h.generators.join(', ')} (${h.classSize === 1 ? 'NORMAL' : `${h.classSize} conjugates`}), |N(H)/H| = ${h.normalizerOrder / order}`,
        mapAutomorphisms: h.normalizerOrder / order,
      })
    }
  }

  return out
}

// ---- the flat pool ----

const flatCache = new Map<string, GraphReading>()

function readFlat(fq: FlatQuotient, degree: number): GraphReading | null {
  const hit = flatCache.get(fq.name)

  if (hit) {
    return hit
  }

  checks.push({ name: `F ${fq.name}: the cell count equals the deck group's index`, ok: fq.countMatches })

  if (!fq.simple) {
    return null
  }

  const sys = degree === 24 ? { systole: null, loopSystole: null } : systoleOf(fq.neighbors, fq.symbol, degree)
  const reading = readGraph(
    {
      name: fq.name,
      curvature: 'flat',
      degree,
      neighbors: fq.neighbors,
      systole: sys.systole,
      loopSystole: sys.loopSystole,
      genus: fq.orientable ? 1 : null,
      euler: 0,
      orientable: fq.orientable,
      construction: fq.construction,
    },
    { bounds: true },
  )

  flatCache.set(fq.name, reading)
  log(`flat ${modesLine(reading)}`)
  log(`flat ${factsLine(reading)}`)

  return reading
}

const TILING_OF_DEGREE: Readonly<Record<number, PeriodicTiling>> = { 3: TRIANGLE_TILING, 4: SQUARE_TILING, 6: HEXAGON_TILING, 24: D4_TILING }

// the D4 lattices (Hermite rows, every row in D4 and of norm above 8 so the quotient is simple) of determinant 2N
const D4_LATTICES: Readonly<Record<number, readonly Lattice[]>> = {
  1024: [
    [[4, 0, 0, 0], [0, 8, 0, 0], [0, 0, 8, 0], [0, 0, 0, 8]],
    [[4, 1, 1, 0], [0, 8, 2, 0], [0, 0, 8, 2], [0, 0, 0, 8]],
  ],
  2048: [
    [[8, 0, 0, 0], [0, 8, 0, 0], [0, 0, 8, 0], [0, 0, 0, 8]],
    [[4, 0, 0, 0], [0, 8, 0, 0], [0, 0, 8, 0], [0, 0, 0, 16]],
    [[4, 0, 0, 0], [0, 4, 0, 0], [0, 0, 16, 0], [0, 0, 0, 16]],
    [[8, 2, 0, 0], [0, 8, 0, 0], [0, 0, 8, 2], [0, 0, 0, 8]],
    [[8, 1, 1, 0], [0, 8, 0, 0], [0, 0, 8, 2], [0, 0, 0, 8]],
    [[4, 1, 1, 0], [0, 8, 2, 0], [0, 0, 8, 2], [0, 0, 0, 16]],
  ],
  16384: [
    [[8, 0, 0, 0], [0, 16, 0, 0], [0, 0, 16, 0], [0, 0, 0, 16]],
    [[8, 1, 1, 0], [0, 16, 2, 0], [0, 0, 16, 2], [0, 0, 0, 16]],
  ],
}

function flatPool(degree: number, n: number): GraphReading[] {
  const tiling = TILING_OF_DEGREE[degree]

  if (!tiling) {
    return []
  }

  const out: GraphReading[] = []

  const push = (fq: FlatQuotient): void => {
    const r = readFlat(fq, degree)

    if (r) {
      out.push(r)
    }
  }

  if (degree === 24) {
    for (const lattice of D4_LATTICES[n] ?? []) {
      push(flatQuotient({ tiling, lattice }))
    }

    return out
  }

  const band = n < 100 ? n / 5 : n / 10
  const per = degree === 3 ? 2 : 1
  const shapes: [number, number][] = []

  for (let a = 3; a * a * per <= n + band; a++) {
    for (let b = a; b <= 1.6 * a; b++) {
      if (Math.abs(per * a * b - n) <= band) {
        shapes.push([a, b])
      }
    }
  }

  for (const [a, b] of shapes) {
    const shifts = [...new Set([0, 1, Math.floor(a / 2)])]

    for (const s of shifts) {
      push(flatQuotient({ tiling, lattice: [[a, s], [0, b]] }))
    }
  }

  // Klein bottles: cells a b (square), 2 a c (hexagon), 4 a c (triangle); the fewest rows (3, 4) and the squarest
  const kleinPer = degree === 4 ? 1 : degree === 6 ? 2 : 4
  const klein: [number, number][] = []

  for (const rows of [3, 4]) {
    const a = Math.round(n / (kleinPer * rows))

    if (Math.abs(kleinPer * a * rows - n) <= band) {
      klein.push([a, rows])
    }
  }

  let square: [number, number] | null = null

  for (let rows = 3; rows * rows * kleinPer <= n + band; rows++) {
    const a = Math.round(n / (kleinPer * rows))

    if (a >= rows && Math.abs(kleinPer * a * rows - n) <= band) {
      square = [a, rows]
    }
  }

  if (square) {
    klein.push(square)
  }

  for (const [a, rows] of klein) {
    push(flatQuotient({ tiling, glide: degree === 4 ? squareKleinGlide(a, rows) : axialKleinGlide(a, rows, tiling.types) }))
  }

  return out
}

// ---- the run ----

function symmetryRatio(g: GraphReading): Fraction | null {
  return g.automorphisms === null ? null : fraction(g.automorphisms, BigInt(g.cells))
}

function matchedSet(h: GraphReading, pool: readonly GraphReading[]): { matched: GraphReading[]; gap: number | null } {
  const rh = symmetryRatio(h)

  if (rh === null) {
    return { matched: [], gap: null }
  }

  let best = Number.POSITIVE_INFINITY
  let matched: GraphReading[] = []

  for (const x of pool) {
    const rx = symmetryRatio(x)

    if (rx === null) {
      continue
    }

    // |log(rx / rh)| compared through the exact ratio rx / rh or its inverse, as a number for ordering only
    const q = Number(rx.n * rh.d) / Number(rx.d * rh.n)
    const distance = Math.abs(Math.log(q))

    if (distance < best - 1e-12) {
      best = distance
      matched = [x]
    } else if (Math.abs(distance - best) <= 1e-12) {
      matched.push(x)
    }
  }

  return { matched, gap: Number.isFinite(best) ? Math.exp(best) : null }
}

const json = (v: unknown): unknown => JSON.parse(JSON.stringify(v, (_, x: unknown) => (typeof x === 'bigint' ? x.toString() : x)))

function readingJson(g: GraphReading): unknown {
  return json({
    name: g.name,
    curvature: g.curvature,
    cells: g.cells,
    degree: g.degree,
    bipartite: g.bipartite,
    systole: g.systole,
    loopSystole: g.loopSystole,
    genus: g.genus,
    euler: g.euler,
    orientable: g.orientable,
    automorphisms: g.automorphisms,
    automorphismsPerCell: g.automorphisms === null ? null : Number(g.automorphisms) / g.cells,
    equitable: g.equitable,
    orbits: g.orbits,
    laws: Object.fromEntries(
      (['self0', 'self1'] as const).map(l => [
        l,
        {
          krylov: g.laws[l].krylov,
          krylovShare: g.laws[l].krylov / g.cells,
          period: g.laws[l].period,
          exactPeriod: g.laws[l].exactPeriod,
          largestFactorDegree: g.laws[l].largestFactorDegree,
          phaseOrder: g.laws[l].phaseOrder === null ? null : `${g.laws[l].phaseOrder.n}/${g.laws[l].phaseOrder.d}`,
        },
      ]),
    ),
    construction: g.construction,
  })
}

// the orbit counter on known graphs: the 7-cycle (Stab(0) is one reflection: 4 orbits), Petersen (distance-transitive,
// so the orbits of Stab(0) are its distance classes 0, 1, 2: 3 orbits), and the rigid spider with legs 1, 2, 3 (7
// orbits); negative: the cycle does not read the rigid count
{
  const cycle = Array.from({ length: 7 }, (_, i) => [(i + 1) % 7, (i + 6) % 7])
  const petersen = Array.from({ length: 10 }, (_, i) =>
    i < 5 ? [(i + 1) % 5, (i + 4) % 5, i + 5] : [((i - 5 + 2) % 5) + 5, ((i - 5 + 3) % 5) + 5, i - 5],
  )
  const spider = [[1, 2, 4], [0], [0, 3], [2], [0, 5], [4, 6], [5]]
  const read = (neighbors: number[][]): number | null => stabilizerOrbits({ neighbors, root: 0 }).orbits

  checks.push({ name: 'K the 7-cycle has 4 orbits of Stab(0)', ok: read(cycle) === 4 })
  checks.push({ name: 'K Petersen has 3 orbits of Stab(0)', ok: read(petersen) === 3 })
  checks.push({ name: 'K the rigid spider has 7 orbits of Stab(0) and 7 equitable classes', ok: read(spider) === 7 && equitableBound(spider, 0) === 7 })
  negatives.push({ name: 'NK the 7-cycle does not read 7 orbits', ok: read(cycle) !== 7 })
}

log(`symmetry-modes: reproduce ${reproduce}, surfaces ${surfaces.join(',')}, max subgroup ${maxSubgroup}, min cells ${minCells}, max quotients ${maxQuotients}, honeycomb level ${honeycombLevel} read ${honeycombRead} quotients ${honeycombQuotients} of order ${honeycombSubgroupOrder}, orbit cap ${orbitCapFlag || 'E-CMP-0046 formula'}, automorphisms ${withAutomorphisms}, orbits ${withOrbits}`)

const reproduced = reproduce ? reproducePairs() : []
const hyperbolicSpecs = [...surfaceQuotients(), ...honeycombGraphs()]
const symmetryPairs: unknown[] = []
const tally: Record<string, Record<Placement, number>> = {}

const count = (key: string, p: Placement): void => {
  tally[key] ??= { above: 0, below: 0, inside: 0, unresolved: 0 }
  tally[key][p]++
}

for (const spec of hyperbolicSpecs) {
  const h = readGraph(spec, { bounds: true })

  log(`hyperbolic ${modesLine(h)}`)
  log(`hyperbolic ${factsLine(h)}`)

  const pool = flatPool(h.degree, h.cells)
  const { matched, gap } = matchedSet(h, pool)
  const row: Record<string, unknown> = { hyperbolic: readingJson(h), pool: pool.map(x => x.name), matched: matched.map(x => x.name), symmetryGap: gap }

  for (const law of ['self0', 'self1'] as const) {
    const vsPool = Object.fromEntries((['krylovShare', 'exactPeriod', 'period', 'phaseOrder'] as const).map(m => [m, place(h, pool, law, m)]))
    const vsMatched = Object.fromEntries((['krylovShare', 'exactPeriod', 'period', 'phaseOrder'] as const).map(m => [m, place(h, matched, law, m)]))

    row[law] = { pool: vsPool, matched: vsMatched }
    count(`krylovShare.pool.${law}`, vsPool.krylovShare!)
    count(`krylovShare.matched.${law}`, vsMatched.krylovShare!)
    log(`pair ${h.name} ${law} vs pool (${pool.length}): ${Object.entries(vsPool).map(([m, p]) => `${m} ${p}`).join(', ')}; vs matched (${matched.map(x => x.name).join(' ') || 'none'}, ratio gap ${gap === null ? 'n/a' : gap.toPrecision(4)}): ${Object.entries(vsMatched).map(([m, p]) => `${m} ${p}`).join(', ')}`)
  }

  symmetryPairs.push(row)
}

const failed = [...checks, ...negatives.map(c => ({ ...c, name: c.name }))].filter(c => !c.ok)

for (const c of failed) {
  log(`FAILED ${c.name}`)
}

summary({
  item: 'vibe-computation-models-0053',
  seconds: seconds(t0),
  gates: checks.length,
  controls: negatives.length,
  failed: failed.length,
  flags: Object.fromEntries(f),
  tally,
  reproduced: reproduced.map(p => ({
    label: p.label,
    placements: Object.fromEntries((['self0', 'self1'] as const).map(l => [l, Object.fromEntries(MEASURES.map(m => [m, place(p.hyperbolic, [p.partner, ...p.series], l, m)]))])),
    readings: [p.hyperbolic, p.partner, ...p.series].map(readingJson),
  })),
  symmetryPairs,
  flat: [...flatCache.values()].map(readingJson),
})
