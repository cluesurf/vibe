// P100: the perception rule on the real {5,3,4} crystal, the corrected fill-free dynamics.
// (the-perception-rule.md, the-note-is-perception.md.) Supersedes the fill-based P94.
//
// Only vibes with tones. No fills, no edge-state. A vibe SEES its neighbors (the note) and the
// PERCEIVED relation picks a conserving move:
//   - opposite (+ , -)        -> share, both relax to peace (0, 0)
//   - empty (one 0, one charged) -> hop, the charge moves into the peaceful one (arrow-biased = pumping)
//   - both peace (0, 0)        -> polarize to (+1, -1), but ONLY when the arrow drives it (creation)
//   - same nonzero             -> inert
// Every move preserves the pair sum, so the total charge Q is conserved exactly. The arrow is the engine,
// it creates charge from peace (move 3), without it everything relaxes to a dead all-peace.
//
// Predictions checked: Q conserved under the perception rule, the arrow CREATES life from all-peace
// (charge appears and settles to a dynamic balance), WITHOUT the arrow a charged start RELAXES to peace
// (death), the live state is a stable dynamic balance (not 0, not saturated), and hops DIFFUSE a pocket
// while arrow-biased hops PUMP it. Run: npx tsx code/experiment/p100-perception-dynamics.ts

import { pathToFileURL } from 'node:url'
import { buildCoxeterMesh } from '~/substrate/coxeter/engine'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

function bfs(neighbors: number[][], n: number, src: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let frontier = [src]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const u of frontier) for (const w of neighbors[u]!) if (dist[w] === -1) {
      dist[w] = (dist[u] ?? 0) + 1
      next.push(w)
    }
    frontier = next
  }
  return dist
}

function edgesOf(neighbors: number[][]): Array<[number, number]> {
  const e: Array<[number, number]> = []
  for (let v = 0; v < neighbors.length; v++) for (const w of neighbors[v]!) if (w > v) e.push([v, w])
  return e
}

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}
const nonzero = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) if (t[i] !== 0) s++
  return s
}
const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

// One beat of the perception rule. arrowProb is the arrow's creation drive (chance a peaceful pair
// polarizes). pump, if given, biases hops (+ toward lower distance, - toward higher). All moves conserve
// the pair sum.
function beat(tone: Int8Array, edges: Array<[number, number]>, rng: Rng, arrowProb: number, pump: Int32Array | null): void {
  const moved = new Uint8Array(tone.length)
  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0 // share: perceived opposite relaxes to peace
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      // hop: charge into the perceived-empty neighbor
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      const q = tone[c]!
      const doHop = pump ? (q > 0 ? dd(pump, e) < dd(pump, c) : dd(pump, e) > dd(pump, c)) : rng.next() < 0.5
      if (doHop) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      // polarize: the arrow creates a pole from peace
      if (rng.next() < arrowProb) {
        if (rng.next() < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }
        moved[v] = 1
        moved[w] = 1
      }
    }
    // same nonzero: inert
  }
}

export function perceptionDynamics(): {
  cells: number
  conserved: boolean
  lifeStart: number
  lifeEnd: number
  arrowCreatesLife: boolean
  deathStart: number
  deathEnd: number
  noArrowRelaxesToPeace: boolean
  balanceMid: number
  balanceLate: number
  dynamicBalance: boolean
  absChargeStart: number
  absDiffused: number
  netPumped: number
  netDiffused: number
  diffusesAndPumps: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  let center = 0
  for (let i = 1; i < n; i++) if (neighbors[i]!.length > neighbors[center]!.length) center = i
  const distC = bfs(neighbors, n, center)
  const r0 = 4

  // ARROW CREATES LIFE: from all-peace, the arrow makes charge appear and settle to a balance
  const life = new Int8Array(n) // all 0
  const qLife = sumTone(life)
  const rngL = makeRng({ seed: 9 })
  const lifeStart = nonzero(life)
  let balanceMid = 0
  for (let b = 0; b < 120; b++) {
    beat(life, edges, rngL, 0.1, null)
    if (b === 59) balanceMid = nonzero(life)
  }
  const lifeEnd = nonzero(life)
  const balanceLate = lifeEnd
  const conservedLife = sumTone(life) === qLife

  // NO ARROW RELAXES TO PEACE: a balanced charged start, no creation, relaxes toward peace
  const death = new Int8Array(n)
  const rngD0 = makeRng({ seed: 14 })
  for (let i = 0; i < n; i++) {
    const r = rngD0.next()
    death[i] = r < 0.4 ? 1 : r < 0.8 ? -1 : 0 // balanced-ish, Q near 0
  }
  // force exact balance so it can fully relax
  let q = sumTone(death)
  for (let i = 0; i < n && q !== 0; i++) {
    if (q > 0 && death[i] === 1) {
      death[i] = 0
      q--
    } else if (q < 0 && death[i] === -1) {
      death[i] = 0
      q++
    }
  }
  const qDeath = sumTone(death)
  const deathStart = nonzero(death)
  const rngD = makeRng({ seed: 14 })
  for (let b = 0; b < 300; b++) beat(death, edges, rngD, 0, null)
  const deathEnd = nonzero(death)
  const conservedDeath = sumTone(death) === qDeath

  // DIFFUSION vs PUMPING: a balanced pocket near the center, no creation, just transport
  const makePocket = (): Int8Array => {
    const t = new Int8Array(n)
    const inner: number[] = []
    for (let i = 0; i < n; i++) if (dd(distC, i) <= r0) inner.push(i)
    for (let k = 0; k < inner.length; k++) t[inner[k]!] = k % 2 === 0 ? 1 : -1
    if (inner.length % 2 === 1) t[inner[inner.length - 1]!] = 0
    return t
  }
  const absInR0 = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (dd(distC, i) <= r0) s += Math.abs(t[i]!)
    return s
  }
  const netInR0 = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (dd(distC, i) <= r0) s += t[i]!
    return s
  }
  const diff = makePocket()
  const qDiff = sumTone(diff)
  const absChargeStart = absInR0(diff)
  const rngDi = makeRng({ seed: 5 })
  for (let b = 0; b < 80; b++) beat(diff, edges, rngDi, 0, null)
  const absDiffused = absInR0(diff)
  const netDiffused = netInR0(diff)
  const conservedDiff = sumTone(diff) === qDiff

  const pump = makePocket()
  const qPump = sumTone(pump)
  const rngPu = makeRng({ seed: 5 })
  for (let b = 0; b < 80; b++) beat(pump, edges, rngPu, 0, distC)
  const netPumped = netInR0(pump)
  const conservedPump = sumTone(pump) === qPump

  const conserved = conservedLife && conservedDeath && conservedDiff && conservedPump
  const arrowCreatesLife = lifeStart === 0 && lifeEnd > 0.1 * n
  const noArrowRelaxesToPeace = deathEnd < 0.4 * deathStart
  const dynamicBalance = balanceMid > 0.1 * n && Math.abs(balanceLate - balanceMid) < 0.25 * balanceMid
  const diffusesAndPumps = absDiffused < absChargeStart && Math.abs(netPumped) > Math.abs(netDiffused) + 3

  const solved = conserved && arrowCreatesLife && noArrowRelaxesToPeace && dynamicBalance && diffusesAndPumps

  return {
    cells: n,
    conserved,
    lifeStart,
    lifeEnd,
    arrowCreatesLife,
    deathStart,
    deathEnd,
    noArrowRelaxesToPeace,
    balanceMid,
    balanceLate,
    dynamicBalance,
    absChargeStart,
    absDiffused,
    netPumped,
    netDiffused,
    diffusesAndPumps,
    solved,
  }
}

export function main(): void {
  const r = perceptionDynamics()
  console.log('P100: the perception rule on the real {5,3,4} crystal (no fills)')
  console.log('')
  console.log(`  ${r.cells} cells, only tones, the note is what a vibe sees`)
  console.log('')
  console.log('  charge conserved under the perception rule:', r.conserved)
  console.log('')
  console.log('  the arrow creates life from all-peace:')
  console.log(`    nonzero ${r.lifeStart} -> ${r.lifeEnd} of ${r.cells}, creates life: ${r.arrowCreatesLife}`)
  console.log('')
  console.log('  without the arrow, a charged start relaxes to peace (death):')
  console.log(`    nonzero ${r.deathStart} -> ${r.deathEnd}, relaxes: ${r.noArrowRelaxesToPeace}`)
  console.log('')
  console.log('  the live state is a dynamic balance (stable, not dead, not saturated):')
  console.log(`    nonzero mid ${r.balanceMid}, late ${r.balanceLate}, stable balance: ${r.dynamicBalance}`)
  console.log('')
  console.log('  hops diffuse a pocket, arrow-biased hops pump it:')
  console.log(`    abs charge ${r.absChargeStart} -> ${r.absDiffused} (drain), net center pumped ${r.netPumped} vs diffused ${r.netDiffused}: ${r.diffusesAndPumps}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
