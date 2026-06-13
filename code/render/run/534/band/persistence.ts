// SELF TEST by PERSISTENCE OF IDENTITY. A connected same-sign blob is NOT a self (it flickers), the theory's
// shallow proxy. A real self is a persistent, bounded, self-maintaining, integrated pattern. This colours
// each charge by HOW LONG it has continuously held its identity, so flickering churn stays dark and a
// genuinely persistent structure glows. Two modes:
//   free        the bare cohesive rule, no maintenance. Expected, mostly dark, blobs flicker (no selves).
//   maintained  a seeded self held by CONSERVING maintenance (the will refills it, P178). Expected, the self
//               glows steadily amid the dark churn, the one thing that is NOT flickering, a real self.
// It also prints the test, average persistence inside the self vs the background, over beats.
// Run: pnpm tsx code/gpu/render-persistence-anim.ts [free|maintained]   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { toCSR, beat, sameSignNeighbors, discreteArrow, type Graph } from '@/test/experiment/misc/self-kit'
import { encodePng } from '@/code/draw/png'
import { makeRng } from '@/code/tool/rng'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Mode = 'free' | 'maintained' | 'autonomous'
const MODE: Mode = process.argv[2] === 'maintained' ? 'maintained' : process.argv[2] === 'autonomous' ? 'autonomous' : 'free'
const REPAIR_THRESHOLD = 5 // a hole with at least this many same-sign neighbours is locally interior to a self
const MAX_BAND = 80000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1400
const RADIUS = 2
const ZOOM_FIT = 0.85
const ARROW_PERIOD = 40 // discrete arrow, deterministic creation period (defining-the-arrow.md)
const COHESION = 0.3
const SEED_DENSITY = 0.3 // background churn
const SELF_SIZE = 1200 // cells in the seeded self (maintained mode)
const PMAX = 40 // persistence (consecutive beats) at which a charge is fully bright

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

function run(): void {
  const slab = buildHorosphereBand({ maxBand: MAX_BAND, half: HALF, margin: MARGIN })
  const n = slab.cellCount
  const dim = slab.coords[0]!.length
  const xi = slab.idealPoint
  const g = toCSR(slab.neighbors)
  console.log(`mode ${MODE}, slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()}`)

  // 2D positions, stereographic inversion from xi then onto an orthonormal basis of the plane perp to xi
  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => {
    const m = norm(v) || 1
    return v.map((x) => x / m)
  }
  let axis = 0
  for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim
  for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  const e2 = normalize(sub(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1, dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1)))

  type BandCell = { index: number; px: number; py: number; u: number; v: number }
  const raw: BandCell[] = []
  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) continue
    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map((v) => v / d2)
    raw.push({ index: i, u: dot(w, e1), v: dot(w, e2), px: 0, py: 0 })
  }
  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)] ?? 0
  }
  const cu = median(raw.map((c) => c.u))
  const cv = median(raw.map((c) => c.v))
  const radii = raw.map((c) => Math.max(Math.abs(c.u - cu), Math.abs(c.v - cv))).sort((a, b) => a - b)
  const halfExtent = (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1
  const pad = 20
  const halfPix = IMG / 2 - pad
  for (const c of raw) {
    c.px = Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix)
    c.py = Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix)
  }

  // the seeded self (maintained mode), a connected ball of band cells near the centre
  const bandSet = new Set(raw.map((c) => c.index))
  const selfCells: number[] = []
  const inSelf = new Uint8Array(n)
  if (MODE === 'maintained') {
    let start = raw[0]!.index
    let best = Infinity
    for (const c of raw) {
      const d = (c.u - cu) ** 2 + (c.v - cv) ** 2
      if (d < best) {
        best = d
        start = c.index
      }
    }
    inSelf[start] = 1
    let fr = [start]
    while (selfCells.length < SELF_SIZE && fr.length) {
      const nf: number[] = []
      for (const u of fr) {
        selfCells.push(u)
        if (selfCells.length >= SELF_SIZE) break
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!
          if (bandSet.has(w) && !inSelf[w]) {
            inSelf[w] = 1
            nf.push(w)
          }
        }
      }
      fr = nf
    }
  }
  // ground for conserving maintenance, the off-screen margin cells (|busemann| >= half)
  const ground: number[] = []
  for (let i = 0; i < n; i++) if (Math.abs(slab.busemann[i]!) >= HALF) ground.push(i)

  // seed, background churn everywhere, plus the self forced to +1 in maintained mode
  const rng = makeRng({ seed: 7 })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    const r = rng.next()
    tone[i] = (r < SEED_DENSITY ? 1 : r < SEED_DENSITY * 1.3 ? -1 : 0) as -1 | 0 | 1
  }
  for (const c of selfCells) tone[c] = 1

  const moved = new Uint8Array(n)
  const prev = tone.slice()
  const persist = new Uint16Array(n)

  // AUTONOMOUS local repair, no external hand. A hole (peace cell) that is locally INTERIOR to a same-sign
  // region (at least REPAIR_THRESHOLD same-sign neighbours, clearly more of one sign) completes itself to
  // that sign, the arrow's balancing opposite partner is dumped into a random cell (conserving). Each cell
  // reads only its own neighbourhood, there is no global self list and no knower of where the self should be.
  // Perception (sensing local kind) plus the arrow (balanced creation), both base elements, nothing new.
  const placeRandom = (sign: -1 | 1, count: number): void => {
    let placed = 0
    let guard = 0
    while (placed < count && guard < n * 6) {
      guard++
      const e = Math.floor(rng.next() * n)
      if (tone[e] === 0) {
        tone[e] = sign
        placed++
      }
    }
  }
  const autonomousRepair = (graph: Graph): void => {
    let owedMinus = 0
    let owedPlus = 0
    for (let c = 0; c < n; c++) {
      if (tone[c] !== 0) continue
      const plus = sameSignNeighbors(tone, graph, c, 1)
      const minus = sameSignNeighbors(tone, graph, c, -1)
      if (plus >= REPAIR_THRESHOLD && plus > minus + 2) {
        tone[c] = 1
        owedMinus++
      } else if (minus >= REPAIR_THRESHOLD && minus > plus + 2) {
        tone[c] = -1
        owedPlus++
      }
    }
    placeRandom(-1, owedMinus)
    placeRandom(1, owedPlus)
  }

  // largest connected cluster of PERSISTENT cells (persistence >= 20), a genuinely durable self
  const persistentSelf = (): number => {
    const seen = new Uint8Array(n)
    let best = 0
    for (let s = 0; s < n; s++) {
      if (seen[s] || tone[s] === 0 || persist[s]! < 20) continue
      const sign = tone[s]!
      let size = 0
      let fr = [s]
      seen[s] = 1
      while (fr.length) {
        const nf: number[] = []
        for (const u of fr) {
          size++
          for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
            const w = g.adj[p]!
            if (!seen[w] && tone[w] === sign && persist[w]! >= 20) {
              seen[w] = 1
              nf.push(w)
            }
          }
        }
        fr = nf
      }
      if (size > best) best = size
    }
    return best
  }

  // conserving maintenance, refill the self to +1, balance with -1 dumped into the ground
  const maintain = (): void => {
    let need = 0
    for (const c of selfCells) {
      if (tone[c] !== 1) {
        need += 1 - tone[c]!
        tone[c] = 1
      }
    }
    for (const gc of ground) {
      if (need <= 0) break
      if (tone[gc] === 0) {
        tone[gc] = -1
        need--
      }
    }
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'make', 'frames')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  for (let f = 0; f < FRAMES; f++) {
    beat(tone, g, moved, rng, 0, COHESION)
    discreteArrow(tone, g, f, ARROW_PERIOD)
    if (MODE === 'maintained') maintain()
    else if (MODE === 'autonomous') autonomousRepair(g)

    // update persistence, consecutive beats a cell has held the same nonzero charge
    for (let i = 0; i < n; i++) {
      if (tone[i] !== 0 && tone[i] === prev[i]) persist[i] = Math.min(persist[i]! + 1, PMAX)
      else persist[i] = 0
      prev[i] = tone[i]!
    }

    // render, brightness by persistence, dim flicker, bright persistent self
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 8
      rgba[i * 4 + 1] = 8
      rgba[i * 4 + 2] = 9
      rgba[i * 4 + 3] = 255
    }
    for (const c of raw) {
      const t = tone[c.index]!
      if (t === 0) continue
      const inten = 0.12 + 0.88 * (persist[c.index]! / PMAX)
      const r8 = t === 1 ? Math.round(40 + 90 * inten) : Math.round(120 + 135 * inten)
      const g8 = t === 1 ? Math.round(60 + 160 * inten) : Math.round(40 + 90 * inten)
      const b8 = t === 1 ? Math.round(110 + 145 * inten) : Math.round(70 + 90 * inten)
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy
          if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue
          const idx = (y * IMG + x) * 4
          rgba[idx] = r8
          rgba[idx + 1] = g8
          rgba[idx + 2] = b8
        }
      }
    }
    writeFileSync(join(outDir, `frame_${String(f).padStart(4, '0')}.png`), encodePng(rgba, IMG, IMG))

    if (f % 40 === 0 || f === FRAMES - 1) {
      // the test, average persistence inside the self vs the background band
      let selfSum = 0
      let bgSum = 0
      let bgCount = 0
      for (const c of raw) {
        if (inSelf[c.index]) selfSum += persist[c.index]!
        else {
          bgSum += persist[c.index]!
          bgCount++
        }
      }
      const selfAvg = selfCells.length ? selfSum / selfCells.length : 0
      const bgAvg = bgCount ? bgSum / bgCount : 0
      if (MODE === 'maintained') {
        console.log(`  beat ${f}, persistence self ${selfAvg.toFixed(1)} vs background ${bgAvg.toFixed(1)}`)
      } else {
        // no seeded self, did a PERSISTENT self emerge anywhere from the local rule alone?
        let maxP = 0
        for (let i = 0; i < n; i++) if (persist[i]! > maxP) maxP = persist[i]!
        console.log(`  beat ${f}, largest persistent self ${persistentSelf()} cells, max persistence ${maxP}, avg ${bgAvg.toFixed(1)}`)
      }
    }
  }
  console.log(`wrote ${FRAMES} frames (${MODE}), assemble with task/render-video.sh`)
}

run()
