// P84: a genuine Lorentz (boost) invariance test, replacing the spatial-rotation
// proxy used elsewhere. The earlier "Lorentz-safe" claims (P27 etc.) measured only
// the angular isotropy of spatial link directions, which is rotation, not boost. A
// real Lorentz test must probe boosts. Here it does.
//
// The boost parameter of a timelike causal link a->b is its rapidity
//   eta = atanh(dx / dt),   (dt, dx) = coord(b) - coord(a).
// A boost by xi shifts every rapidity by xi (rapidities add). So a structure with
// NO preferred frame has a rapidity distribution that is flat (translation
// invariant) in the bulk, and one with a preferred frame has a peaked distribution.
// A Poisson sprinkling of Minkowski is Lorentz invariant in distribution, so its
// causal-link rapidities are broad and flat; a regular lattice has a rest frame, so
// its timelike links pile up at rapidity 0. We measure the concentration of the
// rapidity distribution (normalized entropy: 1 = perfectly flat, 0 = a single
// value) and confirm the sprinkle's distribution is boost-covariant (its shape is
// unchanged under an actual boost of the coordinates).
// Run: npx tsx code/experiment/p84-lorentz-boost.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'

// Rapidities of the timelike causal links, optionally within a central time band
// (to suppress the diamond's boundary bias).
function linkRapidities(
  coords: Float64Array,
  links: ReadonlyArray<Uint32Array>,
  band: { lo: number; hi: number } | null,
): number[] {
  const out: number[] = []
  for (let a = 0; a < links.length; a++) {
    const ta = coords[a * 2] ?? 0
    const xa = coords[a * 2 + 1] ?? 0
    for (const b of links[a] ?? []) {
      const tb = coords[b * 2] ?? 0
      const xb = coords[b * 2 + 1] ?? 0
      const dt = tb - ta
      const dx = xb - xa
      if (dt <= 1e-9) continue
      const v = dx / dt
      if (Math.abs(v) >= 1 - 1e-9) continue // null/spacelike, no finite rapidity
      if (band && (ta < band.lo || tb > band.hi)) continue
      out.push(Math.atanh(v))
    }
  }
  return out
}

// Normalized Shannon entropy of a histogram over [-range, range], in [0, 1].
// 1 means flat (boost-invariant), near 0 means concentrated (preferred frame).
function flatness(etas: number[], range: number, bins: number): number {
  if (etas.length === 0) return 0
  const h = new Array<number>(bins).fill(0)
  let kept = 0
  for (const e of etas) {
    if (e < -range || e > range) continue
    const k = Math.min(bins - 1, Math.floor(((e + range) / (2 * range)) * bins))
    h[k] = (h[k] ?? 0) + 1
    kept += 1
  }
  if (kept === 0) return 0
  let ent = 0
  for (const c of h) {
    if (c > 0) {
      const p = c / kept
      ent -= p * Math.log(p)
    }
  }
  return ent / Math.log(bins)
}

function std(xs: number[]): number {
  if (xs.length === 0) return 0
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length)
}

// A 1+1 causal lattice: integer points in a diamond, causal order dt >= |dx|.
function latticeCausalSet(half: number): { coords: Float64Array; links: ReadonlyArray<Uint32Array> } {
  const pts: Array<[number, number]> = []
  for (let t = 0; t <= 2 * half; t++) {
    const reach = Math.min(t, 2 * half - t)
    for (let x = -reach; x <= reach; x++) pts.push([t, x])
  }
  const n = pts.length
  const coords = new Float64Array(n * 2)
  pts.forEach(([t, x], i) => {
    coords[i * 2] = t
    coords[i * 2 + 1] = x
  })
  // full future relation, then transitive reduction (direct cover computation)
  const future: number[][] = Array.from({ length: n }, () => [])
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const dt = (pts[b]![0]) - (pts[a]![0])
      const dx = (pts[b]![1]) - (pts[a]![1])
      if (dt > 0 && dt >= Math.abs(dx)) future[a]!.push(b)
    }
  }
  const futureSet = future.map((f) => new Set(f))
  const links: Uint32Array[] = []
  for (let a = 0; a < n; a++) {
    const covers: number[] = []
    for (const b of future[a] ?? []) {
      let isCover = true
      for (const c of future[a] ?? []) {
        if (c !== b && futureSet[c]?.has(b)) {
          isCover = false
          break
        }
      }
      if (isCover) covers.push(b)
    }
    links.push(Uint32Array.from(covers))
  }
  return { coords, links }
}

export function lorentzBoost(input: { seed: number }): {
  sprinkleFlatness: number
  latticeFlatness: number
  sprinkleStd: number
  latticeStd: number
  boostedFlatness: number
  flatnessUnderBoost: number
  sprinkleIsFlat: boolean
  latticeIsPeaked: boolean
  boostCovariant: boolean
  solved: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const poset = sprinkleMinkowski({ dimension: 2, count: 4000, rng })
  const coords = poset.embedding?.coords ?? new Float64Array(0)
  const band = { lo: 0.25, hi: 0.75 }
  const RANGE = 2.0
  const BINS = 16

  const sprinkleEtas = linkRapidities(coords, poset.links, band)
  const sprinkleFlatness = flatness(sprinkleEtas, RANGE, BINS)
  const sprinkleStd = std(sprinkleEtas)

  const lat = latticeCausalSet(14)
  const latticeEtas = linkRapidities(lat.coords, lat.links, null)
  const latticeFlatness = flatness(latticeEtas, RANGE, BINS)
  const latticeStd = std(latticeEtas)

  // Actual boost of the sprinkle by rapidity xi: t' = cosh xi * t + sinh xi * x,
  // x' = sinh xi * t + cosh xi * x. The causal order (hence links) is unchanged;
  // we recompute rapidities in the new frame, recentre the band on the boosted
  // slice, and check the distribution shape (flatness) is preserved.
  const xi = 1.0
  const ch = Math.cosh(xi)
  const sh = Math.sinh(xi)
  const n = coords.length / 2
  const boosted = new Float64Array(coords.length)
  for (let i = 0; i < n; i++) {
    const t = coords[i * 2] ?? 0
    const x = coords[i * 2 + 1] ?? 0
    boosted[i * 2] = ch * t + sh * x
    boosted[i * 2 + 1] = sh * t + ch * x
  }
  // boosted time band: map the central band's centre through the boost
  const tc = 0.5
  const boostedCentre = ch * tc
  const boostedBand = { lo: boostedCentre - 0.25 * ch, hi: boostedCentre + 0.25 * ch }
  const boostedEtas = linkRapidities(boosted, poset.links, boostedBand)
  // de-mean both so we compare shape, not the (expected) shift by xi
  const meanShift = boostedEtas.length ? boostedEtas.reduce((a, b) => a + b, 0) / boostedEtas.length : 0
  const boostedCentered = boostedEtas.map((e) => e - meanShift)
  const boostedFlatness = flatness(boostedCentered, RANGE, BINS)
  const flatnessUnderBoost = Math.abs(boostedFlatness - sprinkleFlatness)

  const sprinkleIsFlat = sprinkleFlatness > 0.9
  const latticeIsPeaked = latticeFlatness < 0.6 && sprinkleStd > 3 * latticeStd
  const boostCovariant = flatnessUnderBoost < 0.1

  return {
    sprinkleFlatness,
    latticeFlatness,
    sprinkleStd,
    latticeStd,
    boostedFlatness,
    flatnessUnderBoost,
    sprinkleIsFlat,
    latticeIsPeaked,
    boostCovariant,
    solved: sprinkleIsFlat && latticeIsPeaked && boostCovariant,
  }
}

export function main(): void {
  const r = lorentzBoost({ seed: 1 })
  console.log('P84: a genuine Lorentz (boost) invariance test')
  console.log('')
  console.log('  causal-link rapidity distribution (rapidity = boost parameter):')
  console.log(`    sprinkle flatness (normalized entropy, 1 = boost-invariant): ${r.sprinkleFlatness.toFixed(3)}`)
  console.log(`    lattice  flatness:                                           ${r.latticeFlatness.toFixed(3)}`)
  console.log(`    sprinkle rapidity spread: ${r.sprinkleStd.toFixed(3)}   lattice spread: ${r.latticeStd.toFixed(3)}`)
  console.log('')
  console.log('  boost-covariance of the sprinkle (boost by rapidity 1.0, compare shape):')
  console.log(`    flatness before ${r.sprinkleFlatness.toFixed(3)}, after ${r.boostedFlatness.toFixed(3)}, change ${r.flatnessUnderBoost.toFixed(3)}`)
  console.log('')
  console.log(`  sprinkle is flat (no preferred frame): ${r.sprinkleIsFlat ? 'YES' : 'no'}`)
  console.log(`  lattice is peaked (preferred rest frame): ${r.latticeIsPeaked ? 'YES' : 'no'}`)
  console.log(`  sprinkle distribution is boost-covariant: ${r.boostCovariant ? 'YES' : 'no'}`)
  console.log('')
  console.log(`  genuine Lorentz boost test solved: ${r.solved ? 'YES' : 'no'}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
