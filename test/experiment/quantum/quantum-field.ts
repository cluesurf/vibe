// P114: the field-theoretic vacuum on the exact {5,3,4}. (Ties the perception dynamics to QFT.)
//
// The arrow does (0,0) -> (+1,-1) and share does (+1,-1) -> (0,0): that IS vacuum pair creation and
// annihilation of a charge (a U(1)-like current). So the steady state of the arrow on peace should be a
// fluctuating vacuum of virtual particle-antiparticle pairs. This measures whether that vacuum and its
// excitations are genuinely field-like:
//   1. a fluctuating vacuum (nonzero density steady, pairs continually created and annihilated),
//   2. a two-point correlation function C(r) = <s_x s_y> - <s>^2 with short-range PAIR structure and a
//      finite correlation length xi (an effective mass m about 1/xi), the signature of a massive field,
//   3. a causal LIGHTCONE: a perturbation's influence spreads at a bounded speed (a butterfly cone),
//   4. an exactly conserved charge (the conserved current).
// If these hold, the substrate reproduces a field vacuum, and at greater scale (more RAM) it is the same
// field from which richer structure can emerge. Run: npx tsx code/experiment/p114-quantum-field.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function edgesFromCsr(offsets: Int32Array, adj: Int32Array, n: number): { eu: Int32Array; ev: Int32Array } {
  const eu: number[] = []
  const ev: number[] = []
  for (let v = 0; v < n; v++) for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    const w = adj[p]!
    if (w > v) {
      eu.push(v)
      ev.push(w)
    }
  }
  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

function bfsDist(offsets: Int32Array, adj: Int32Array, n: number, src: number, maxR: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let r = 0
  while (fr.length > 0 && r < maxR) {
    r++
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = r
        next.push(w)
      }
    }
    fr = next
  }
  return dist
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

// vacuum dynamics: the arrow creates pairs, share annihilates, hops carry charge (the field)
function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, arrow: number): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
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
  }
}

export function quantumField(input?: { n?: number }): {
  n: number
  vacuumDensity: number
  fluctuates: boolean
  correlation: { r: number; c: number }[]
  pairAntiCorrelation: number
  correlationLength: number
  effectiveMass: number
  decays: boolean
  coneSpeed: number
  hasLightcone: boolean
  conserved: boolean
  fieldLike: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const ARROW = 0.1

  // bring the vacuum to its fluctuating steady state
  const vac = new Int8Array(N)
  const q0 = sumTone(vac)
  const rng = makeRng({ seed: 7 })
  for (let b = 0; b < 80; b++) beat(vac, eu, ev, moved, rng, ARROW)
  const d1 = nonzero(vac)
  // fluctuation: how many cells change in one more beat (pairs creating/annihilating)
  const before = vac.slice()
  beat(vac, eu, ev, moved, rng, ARROW)
  let changed = 0
  for (let i = 0; i < N; i++) if (vac[i] !== before[i]) changed++
  const vacuumDensity = d1 / N
  const fluctuates = changed > 0.01 * N
  const conserved = sumTone(vac) === q0

  // two-point connected correlation C(r) = <s_x s_y> - <s>^2, over graph distance r
  const mean = sumTone(vac) / N
  const maxR = 6
  const sums = new Float64Array(maxR + 1)
  const counts = new Float64Array(maxR + 1)
  const rng2 = makeRng({ seed: 11 })
  const samples = 250
  for (let s = 0; s < samples; s++) {
    const src = Math.floor(rng2.next() * N)
    const dist = bfsDist(g.offsets, g.adj, N, src, maxR)
    for (let i = 0; i < N; i++) {
      const r = dist[i]!
      if (r >= 0 && r <= maxR) {
        sums[r]! += (vac[src]! - mean) * (vac[i]! - mean)
        counts[r]!++
      }
    }
  }
  const correlation: { r: number; c: number }[] = []
  for (let r = 0; r <= maxR; r++) correlation.push({ r, c: counts[r]! > 0 ? sums[r]! / counts[r]! : 0 })
  const pairAntiCorrelation = correlation[1]!.c // nearest-neighbour correlation (pair structure)

  // correlation length from |C(r)| ~ exp(-r/xi), fit log|C| vs r over r=1..4
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0
  for (let r = 1; r <= 4; r++) {
    const ac = Math.abs(correlation[r]!.c)
    if (ac <= 0) continue
    const y = Math.log(ac)
    sx += r
    sy += y
    sxx += r * r
    sxy += r * y
    m++
  }
  const slope = m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0
  const correlationLength = slope < 0 ? -1 / slope : Infinity
  const effectiveMass = correlationLength > 0 && isFinite(correlationLength) ? 1 / correlationLength : 0
  const decays = Math.abs(correlation[4]!.c) < Math.abs(correlation[1]!.c) * 0.5

  // causal lightcone: perturb the center, run both copies with the same noise, measure the front radius
  let center = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center + 1]! - g.offsets[center]!) center = i
  const dcenter = bfsDist(g.offsets, g.adj, N, center, 12)
  const base = vac.slice()
  const pert = vac.slice()
  pert[center] = (pert[center]! + 1) % 2 === 0 ? 1 : (pert[center]! === 1 ? -1 : 1) // flip the center
  pert[center] = base[center]! === 0 ? 1 : 0
  const T = 5
  const rb = makeRng({ seed: 99 })
  const rp = makeRng({ seed: 99 })
  for (let b = 0; b < T; b++) beat(base, eu, ev, moved, rb, ARROW)
  for (let b = 0; b < T; b++) beat(pert, eu, ev, moved, rp, ARROW)
  let front = 0
  for (let i = 0; i < N; i++) if (base[i] !== pert[i]) {
    const r = dcenter[i]!
    if (r >= 0 && r > front) front = r
  }
  const coneSpeed = front / T
  const hasLightcone = coneSpeed > 0 && coneSpeed <= 1.5 // bounded propagation (about one hop per beat)

  const fieldLike = fluctuates && pairAntiCorrelation < 0 && decays && isFinite(correlationLength) && hasLightcone && conserved
  const solved = fieldLike

  return {
    n: N,
    vacuumDensity,
    fluctuates,
    correlation,
    pairAntiCorrelation,
    correlationLength,
    effectiveMass,
    decays,
    coneSpeed,
    hasLightcone,
    conserved,
    fieldLike,
    solved,
  }
}

export function main(): void {
  const r = quantumField()
  console.log('P114: the field-theoretic vacuum on the exact {5,3,4}')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} exact cells`)
  console.log(`  vacuum density ${(r.vacuumDensity * 100).toFixed(0)}% nonzero, fluctuating (pairs create/annihilate): ${r.fluctuates}`)
  console.log('')
  console.log('  two-point correlation C(r) (the field correlator):')
  for (const p of r.correlation) console.log(`    r=${p.r}  C=${p.c.toFixed(4)}`)
  console.log(`    nearest-neighbour PAIR anti-correlation (C(1) < 0): ${r.pairAntiCorrelation.toFixed(4)}`)
  console.log(`    correlation length xi=${r.correlationLength.toFixed(2)}  ->  effective mass m=${r.effectiveMass.toFixed(3)}, decays: ${r.decays}`)
  console.log('')
  console.log(`  causal lightcone: influence front spreads at ${r.coneSpeed.toFixed(2)} hops/beat (bounded): ${r.hasLightcone}`)
  console.log(`  charge conserved (the current): ${r.conserved}`)
  console.log('')
  console.log(`  the substrate reproduces a field vacuum (fluctuating pairs, correlation length/mass, lightcone, conserved current): ${r.fieldLike}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'quantum/quantum-field',
  title: 'the vacuum is field-like with virtual pairs and a causal cone',
  category: 'quantum',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = quantumField({ n: 60000 })
    const ok =
      r.solved &&
      r.fieldLike &&
      r.fluctuates &&
      r.pairAntiCorrelation < 0 &&
      r.decays &&
      r.hasLightcone &&
      r.conserved
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the steady state is a fluctuating vacuum with pair anti-correlation, finite correlation length, a causal cone, and a conserved charge',
      metrics: {
        vacuumDensity: r.vacuumDensity,
        pairAntiCorrelation: r.pairAntiCorrelation,
        effectiveMass: r.effectiveMass,
        coneSpeed: r.coneSpeed,
      },
    })
  },
})
