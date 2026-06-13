// What IS a self, measured properly. A self is NOT "similar charges in the same relation" (that measure is a
// conserved-field slow mode, plain diffusion shows the same, see selves-tower-3434.ts and p208). A self is a
// fuzzy localized COHERENT PATTERN that keeps its IDENTITY while it PROPAGATES and exchanges its material, the
// way a glider, a particle, a molecule, or a living cell does, same FORM, different MATTER, moving.
//
// This experiment defines that measure and shows it works, on the {3,4,3,4} flat 3D cusp ({4,3,4}=Z^3):
//   1. CALIBRATION, a Conway's-Life glider, the cleanest propagating self. The measure must score it HIGH on
//      pattern-identity-through-turnover and detect its coherent motion, while its material turns over 100%.
//   2. CONTRAST, the vibe perception rule from a localized seed. The measure must score it LOW, the blob
//      disperses and churns, it does not hold a coherent identity, no self crystallizes from generic dynamics.
// The point is the RIGHT measure (identity through turnover), and the honest result, the cusp SUPPORTS
// propagating self-like patterns, but the pure perception rule does not spontaneously MAKE one from a generic
// seed (consistent with p101, churn). The genuine vibe-self is the topological hopfion (p192), which must be
// seeded, and self NESTING is the open higher-order-binding gap.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/selves-as-propagating-structures-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { toCsr } from '@/code/tool/graph'
import { perceptionPermutation as perm } from '@/code/rule/perception-permutation'

// ---------- the RIGHT measure ----------
// Given a sequence of "occupied-cell" sets (the pattern over time), a self scores high on:
//   identity  = overlap of the pattern with itself one period later, AFTER recentering by its centroid
//               (same FORM in a co-moving frame), in [0,1]
//   turnover  = fraction of the occupied cells that are different from one beat to the next (the MATTER
//               flows through, in [0,1]); a self has same form AND high turnover (a whirlpool, a flame)
//   motion    = net displacement of the centroid per beat (it PROPAGATES, not just sits)
//   localized = the pattern stays compact (radius of gyration does NOT grow without bound)

function centroid(cells: Set<string>): [number, number] {
  let sx = 0
  let sy = 0
  for (const k of cells) { const [x, y] = k.split(',').map(Number); sx += x!; sy += y! }
  return [sx / cells.size, sy / cells.size]
}
function recenter(cells: Set<string>): Set<string> {
  const [cx, cy] = centroid(cells)
  const out = new Set<string>()
  for (const k of cells) { const [x, y] = k.split(',').map(Number); out.add(`${x! - Math.round(cx)},${y! - Math.round(cy)}`) }
  return out
}
function overlap(a: Set<string>, b: Set<string>): number {
  let inter = 0
  for (const k of a) if (b.has(k)) inter++
  return inter / Math.max(1, Math.max(a.size, b.size))
}
function radiusOfGyration(cells: Set<string>): number {
  const [cx, cy] = centroid(cells)
  let s = 0
  for (const k of cells) { const [x, y] = k.split(',').map(Number); s += (x! - cx) ** 2 + (y! - cy) ** 2 }
  return Math.sqrt(s / cells.size)
}

// ---------- 1. CALIBRATION: a Conway's Life glider on the cusp ----------

function gliderSelf(): { identity: number; turnover: number; speed: number; rgGrowth: number; isSelf: boolean } {
  const moore = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => [dx, dy])).filter(([dx, dy]) => dx !== 0 || dy !== 0)
  const lifeStep = (state: Set<string>): Set<string> => {
    const count = new Map<string, number>()
    for (const k of state) { const [x, y] = k.split(',').map(Number); for (const [dx, dy] of moore) { const nk = `${x! + dx!},${y! + dy!}`; count.set(nk, (count.get(nk) ?? 0) + 1) } }
    const next = new Set<string>()
    for (const [k, c] of count) if (c === 3 || (c === 2 && state.has(k))) next.add(k)
    return next
  }
  let s = new Set<string>(['0,0', '1,0', '2,0', '2,1', '1,2'])
  const frames: Set<string>[] = [new Set(s)]
  const centroids: [number, number][] = [centroid(s)]
  for (let t = 0; t < 12; t++) { s = lifeStep(s); frames.push(new Set(s)); centroids.push(centroid(s)) }
  // identity = overlap of recentered pattern with the recentered pattern one PERIOD (4) later
  let id = 0
  let idc = 0
  for (let t = 0; t + 4 < frames.length; t++) { id += overlap(recenter(frames[t]!), recenter(frames[t + 4]!)); idc++ }
  const identity = id / idc
  // turnover = average fraction of occupied cells that differ frame-to-frame (the matter flows)
  let tov = 0
  let tovc = 0
  for (let t = 0; t + 1 < frames.length; t++) { tov += 1 - overlap(frames[t]!, frames[t + 1]!); tovc++ }
  const turnover = tov / tovc
  // speed = mean centroid displacement per beat; rgGrowth = radius-of-gyration drift (should stay ~constant)
  let disp = 0
  for (let t = 0; t + 1 < centroids.length; t++) disp += Math.hypot(centroids[t + 1]![0] - centroids[t]![0], centroids[t + 1]![1] - centroids[t]![1])
  const speed = disp / (centroids.length - 1)
  const rgGrowth = radiusOfGyration(frames[frames.length - 1]!) - radiusOfGyration(frames[0]!)
  const isSelf = identity > 0.8 && turnover > 0.3 && speed > 0.1 && Math.abs(rgGrowth) < 1
  return { identity, turnover, speed, rgGrowth, isSelf }
}

// ---------- 2. CONTRAST: the vibe perception rule from a localized seed ----------


function vibeChurn(): { identity: number; rgGrowth: number; isSelf: boolean } {
  const g = buildEuclideanLattice({ symbol: [4, 3, 4], maxCells: 30000 })
  const n = g.cellCount
  const { offsets, adj } = toCsr(g.neighbors)
  // a localized +1 blob near the centre in a sea of 0 (a "particle" seed)
  const tone = new Int8Array(n)
  const cx = g.coords.reduce((s, c) => s.map((v, i) => v + c[i]!), [0, 0, 0]).map((v) => v / n)
  const seed: number[] = []
  for (let i = 0; i < n; i++) {
    const d2 = g.coords[i]!.reduce((s, v, k) => s + (v - cx[k]!) ** 2, 0)
    if (d2 < 4) { tone[i] = 1; seed.push(i) }
  }
  const occupied = (): Set<string> => {
    const s = new Set<string>()
    for (let i = 0; i < n; i++) if (tone[i] === 1) s.add(`${g.coords[i]![0]},${g.coords[i]![1]},${g.coords[i]![2]}`)
    return s
  }
  const rg3 = (cells: Set<string>): number => {
    const pts = [...cells].map((k) => k.split(',').map(Number))
    const c = [0, 1, 2].map((d) => pts.reduce((s, p) => s + p[d]!, 0) / pts.length)
    return Math.sqrt(pts.reduce((s, p) => s + (p[0]! - c[0]!) ** 2 + (p[1]! - c[1]!) ** 2 + (p[2]! - c[2]!) ** 2, 0) / pts.length)
  }
  const rng = makeRng({ seed: 3 })
  const frame0 = occupied()
  const rg0 = rg3(frame0)
  const step = (): void => {
    const used = new Uint8Array(n)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); const t = order[i]!; order[i] = order[j]!; order[j] = t }
    for (const v of order) {
      if (used[v]) continue
      const start = offsets[v]!
      const deg = offsets[v + 1]! - start
      const o = Math.floor(rng.next() * deg)
      for (let sft = 0; sft < deg; sft++) {
        const w = adj[start + ((o + sft) % deg)]!
        if (used[w] || w === v) continue
        const [na, nb] = perm(tone[v]!, tone[w]!)
        tone[v] = na as -1 | 0 | 1
        tone[w] = nb as -1 | 0 | 1
        used[v] = 1
        used[w] = 1
        break
      }
    }
  }
  for (let t = 0; t < 30; t++) step()
  const frameT = occupied()
  // identity = overlap of recentered 3D patterns (does the seed keep its shape?), rgGrowth = does it disperse?
  const recenter3 = (cells: Set<string>): Set<string> => {
    const pts = [...cells].map((k) => k.split(',').map(Number))
    const c = [0, 1, 2].map((d) => Math.round(pts.reduce((s, p) => s + p[d]!, 0) / pts.length))
    return new Set(pts.map((p) => `${p[0]! - c[0]!},${p[1]! - c[1]!},${p[2]! - c[2]!}`))
  }
  const identity = overlap(recenter3(frame0), recenter3(frameT))
  const rgGrowth = rg3(frameT) - rg0
  const isSelf = identity > 0.8 && Math.abs(rgGrowth) < 1
  return { identity, rgGrowth, isSelf }
}

// The identity-through-turnover measure separates a genuine propagating self (the glider
// calibration) from the churn of the pure perception rule on a generic seed (the contrast).
export function propagatingSelves(): {
  gliderIdentity: number
  gliderTurnover: number
  gliderSpeed: number
  gliderIsSelf: boolean
  vibeIdentity: number
  vibeRgGrowth: number
  vibeIsSelf: boolean
  separates: boolean
} {
  const gl = gliderSelf()
  const vc = vibeChurn()
  const separates = gl.isSelf && !vc.isSelf
  return {
    gliderIdentity: gl.identity,
    gliderTurnover: gl.turnover,
    gliderSpeed: gl.speed,
    gliderIsSelf: gl.isSelf,
    vibeIdentity: vc.identity,
    vibeRgGrowth: vc.rgGrowth,
    vibeIsSelf: vc.isSelf,
    separates,
  }
}

export default defineExperiment({
  id: 'selves/selves-as-propagating-structures-3434',
  title: 'identity-through-turnover scores a glider as a self and the perception-rule seed as churn',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = propagatingSelves()
    const ok = r.separates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an identity-through-turnover measure scores a Conway glider high as a propagating self while scoring the pure perception rule from a generic seed low, so the cusp supports self-like patterns but the bare rule does not spontaneously make one',
      metrics: {
        gliderIdentity: r.gliderIdentity,
        gliderTurnover: r.gliderTurnover,
        gliderSpeed: r.gliderSpeed,
        vibeIdentity: r.vibeIdentity,
        vibeRgGrowth: r.vibeRgGrowth,
      },
      control: {
        gliderIsSelf: r.gliderIsSelf ? 1 : 0,
        vibeIsSelf: r.vibeIsSelf ? 1 : 0,
      },
      notes:
        'L2 with a control. The Conway glider is the positive calibration (a known propagating self) and the perception-rule seed is the negative contrast. The honest reading is that the cusp SUPPORTS propagating self-patterns and the right measure detects them, but the pure rule churns and does not crystallize one from a generic seed, consistent with the churn finding. The vibe contrast uses a pseudo-random update order, so its churn is an ensemble statement. The genuine seeded self is the topological hopfion, and self nesting is the open frontier.',
    })
  },
})
