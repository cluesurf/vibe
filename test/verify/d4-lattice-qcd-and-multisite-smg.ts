// 4D D_4 LATTICE QCD (SU(2) & SU(3) ON L = 4, L = 6) & MULTI-SITE SU(4) CAYLEY-4-FORM SMG BENCHMARK:
//   Part 1 (Tier B/C): L = 4 (256 sites, 3,072 links, 8,192 triangles) & L = 6 (1,296 sites, 15,552 links,
//           41,472 triangles) 4D D_4 Lattice SU(2) & SU(3) Monte Carlo + Quenched Naive D_4 Fermions
//           - Exact Kennedy-Pendleton Cabibbo-Marinari heatbath + exact microcanonical overrelaxation
//           - Weak-to-strong beta ladder: <P_tri> (binned jackknife error), planar rhombic Wilson loops
//             W(1,1), W(2,1), W(2,2), W(3,1), W(3,2), standard Creutz ratios chi(2,2) &
//             chi(3,2) = -ln((W(3,2)*W(2,1))/(W(3,1)*W(2,2))), triangle string tension sigma_tri = chi(2,2)/2
//             (null when chi(2,2) unavailable), temporal/spatial Polyakov loops <|L|>
//           - Exact matrix-free quenched naive 4D D_4 chiral Dirac operator D = [[0, M], [-M^dag, 0]] on
//             L = 4 (4^3 x 8) [NOTE: naive D_4 fermions carry 40 continuum species/doublers with two speeds
//             of light: physical c = 1 at k = 0 and c = 1/3 at doublers such as (pi, pi, 0, k_t)]:
//             per-spin-color normalized (<psi_bar psi> / (4 N_c)) exact point-source & stochastic Z_2
//             chiral condensate, exact Axial WTI (< 1e-9), pion correlator C_pi(tau), oscillating
//             parity-partner cosh fit for C_rho(tau), jackknife error bars, GMOR fit, and m_pi / m_rho
//           - Negative controls: strong-coupling analytical check (<P_tri> vs beta/(2 N_c^2) + beta^2/216
//             for SU(3) and I_2(beta)/I_1(beta) for SU(2)), weak-coupling 1-loop check with exact T^4
//             b_1 = 4 zero-mode factor (1 - 3/(11 V)), and free-field (U = I) dispersion check (both c = 1
//             physical sin(pi/L_t) and c = 1/3 doubler sin(pi/L_t)/3 modes)
//   Part 2 (Tier B): Interacting 0+1D / 1+1D Multi-Site SU(4) (~= Spin(6)) Bipartite Cayley-4-Form SMG
//           Benchmark (spinless complex hopping preserves SU(4) ~= Spin(6); full dynamical 3+1D/4D
//           gauge-coupled chiral SMG remains Tier C open!)
//           - Model 2A: 2-site coupled 8-Majorana/site (16 Majoranas, dim 256 -> Cartan blocks 18, 10, 9, ...)
//           - Model 2B: 2-site coupled opposite-chirality 16-Majorana/site (32 Majoranas, Bank A = +Gamma_9
//             8_s & Bank B = -Gamma_9 8_c with SU(4)_A x SU(4)_B-invariant quartic-times-quartic coupling
//             v_cross * sum_x H_{C,A}^(+)(x) H_{C,B}^(-)(x), dim 65,536 -> GS block 324, global sector scan)
//           - Model 2C: 4-site periodic 1+1D chiral ring 8-Majorana/site (32 Majoranas, exact V = 0 Dirac
//             zero modes, dim 65,536 -> complete |Delta N| <= 2 sector scan incl. neutral SU(4) adjoint!)
//           - Exact sparse CG multi-channel Kubo static susceptibilities chi_O = (2/N) <psi_0|O(H-E_0)^-1 O|psi_0>
//             across staggered Z, uniform Z, bond dimerization (VBS), and cross-block off-flavor bilinears
//             (uniform & staggered), all bounded O(1/V) in SMG without any superselection tautology!
//           - Negative controls: 1+1D Fidkowski-Kitaev anomalous 4-Majorana/site (nu = 4 mod 8) with
//             IDENTICALLY normalized staggered Z_0 operator (gap collapses O(t^2/V), chi_stag diverges O(V/t^2))
//             and diagonal-only 8-Majorana/site sector (4-fold atomic degeneracy, gap collapses, chi diverges)
//
// Modes:
//   --smoke (default; laptop-safe < 6 s, < 300 MB RAM, saves tmp/d4-qcd-smg-smoke.json)
//   --full  (full multi-threaded production run; saves tmp/d4-qcd-smg-results.json)
//
// Strictly deterministic (Mulberry32 PRNG, ZERO Math.random()), zero external packages,
// strict TypeScript (--strict --noUncheckedIndexedAccess clean).

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const T0_GLOBAL = performance.now()
const PI = Math.PI
const IS_FULL = process.argv.includes('--full')
const MODE_LABEL = IS_FULL ? 'FULL PRODUCTION' : 'SMOKE'
const N_WORKERS = IS_FULL ? Math.min(10, Math.max(2, os.cpus().length - 2)) : 2

// =================================================================================================
// SECTION 0: ASSERTION HARNESS & DETERMINISTIC MULBERRY32 PRNG
// =================================================================================================

type GateRow = {
  readonly id: string
  readonly part: string
  readonly title: string
  readonly passed: boolean
  readonly detail: string
}

const GATES: GateRow[] = []

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`)
}

function recordGate(id: string, part: string, title: string, cond: boolean, detail: string): void {
  const rss = (process.memoryUsage().rss / (1024 * 1024)).toFixed(1)
  GATES.push({ id, part, title, passed: cond, detail })
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${id} (${part}) | ${title} [RSS ${rss} MB]`)
  console.log(`         -> ${detail}`)
  assert(cond, `Gate ${id} (${title}) failed: ${detail}`)
}

type Rng = {
  readonly next: () => number
  readonly nextInt: (n: number) => number
  readonly nextGauss: () => number
  readonly nextSign: () => number
}

// Deterministic Mulberry32 PRNG (zero Math.random)
function makeMulberry32(seed0: number): Rng {
  let state = seed0 >>> 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    const u = (t ^ (t >>> 14)) >>> 0
    return (u + 0.5) / 4294967296
  }
  const nextInt = (n: number): number => Math.floor(next() * n)
  const nextGauss = (): number => {
    const u1 = next()
    const u2 = next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * PI * u2)
  }
  const nextSign = (): number => (next() < 0.5 ? -1 : 1)
  return { next, nextInt, nextGauss, nextSign }
}

function besselI(n: number, x: number): number {
  const m = Math.abs(n)
  const half = 0.5 * x
  let term = 1
  for (let k = 1; k <= m; k++) term *= half / k
  let sum = term
  const h2 = half * half
  for (let k = 1; k <= 80; k++) {
    term *= h2 / (k * (m + k))
    sum += term
    if (term <= 1e-16 * sum) break
  }
  return sum
}

function popcount(x: number): number {
  let c = 0
  let v = x >>> 0
  while (v !== 0) {
    v &= v - 1
    c++
  }
  return c
}

// =================================================================================================
// SECTION 1: EXACT 4D D_4 BOX TORUS GEOMETRY (Ls^3 x Lt CHECKERBOARD)
//   L = 2 (2^3 x 4):    16 sites,    192 links,    512 triangles (smoke)
//   L = 4 (4^3 x 8):   256 sites,  3,072 links,  8,192 triangles (full gauge + fermions)
//   L = 6 (6^3 x 12): 1,296 sites, 15,552 links, 41,472 triangles (full gauge)
// =================================================================================================

type IVec4 = readonly [number, number, number, number]

type D4BoxTorus = {
  readonly Ls: number
  readonly Lt: number
  readonly V: number
  readonly E: number
  readonly T: number
  readonly sites: readonly IVec4[]
  readonly roots24: readonly IVec4[]
  readonly posR4: readonly IVec4[]
  readonly oppDir: Int32Array
  readonly linkTarget: Int32Array
  readonly linkBcSign: Int8Array
  readonly stepEdge: Int32Array
  readonly stepSign: Int8Array
  readonly stepNext: Int32Array
  readonly triE0: Int32Array
  readonly triS0: Int8Array
  readonly triE1: Int32Array
  readonly triS1: Int8Array
  readonly triE2: Int32Array
  readonly triS2: Int8Array
  readonly stapleE1: Int32Array
  readonly stapleS1: Int8Array
  readonly stapleE2: Int32Array
  readonly stapleS2: Int8Array
  readonly a2Planes: readonly (readonly [number, number])[]
  readonly zigDirA: number
  readonly zigDirB: number
  readonly spatialDir: number
  readonly t0Sites: Int32Array
}

function buildD4BoxTorus(Ls: number, Lt: number): D4BoxTorus {
  assert(Ls >= 2 && Ls % 2 === 0 && Lt >= 2 && Lt % 2 === 0, 'D_4 checkerboard requires even Ls, Lt >= 2')
  const sites: IVec4[] = []
  const coordToSite = new Int32Array(Ls * Ls * Ls * Lt).fill(-1)
  const idx4 = (x: number, y: number, z: number, t: number): number => ((t * Ls + x) * Ls + y) * Ls + z

  const t0List: number[] = []
  for (let t = 0; t < Lt; t++) {
    for (let x = 0; x < Ls; x++) {
      for (let y = 0; y < Ls; y++) {
        for (let z = 0; z < Ls; z++) {
          if (((x + y + z + t) & 1) !== 0) continue
          const id = sites.length
          sites.push([x, y, z, t])
          coordToSite[idx4(x, y, z, t)] = id
          if (t === 0) t0List.push(id)
        }
      }
    }
  }
  const V = sites.length
  const E = 12 * V
  const T = 32 * V
  assert(V === (Ls * Ls * Ls * Lt) / 2, `Unexpected D_4 site count ${V}`)

  const roots24: IVec4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [-1, 1]) {
        for (const sj of [-1, 1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          roots24.push(v)
        }
      }
    }
  }
  const posR4 = roots24.filter(r => {
    for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
    return false
  })
  assert(posR4.length === 12, 'Expected 12 positive D_4 roots')

  const ordered24: IVec4[] = [...posR4, ...posR4.map(r => [-r[0], -r[1], -r[2], -r[3]] as const)]
  const oppDir = new Int32Array(24)
  for (let d = 0; d < 12; d++) {
    oppDir[d] = d + 12
    oppDir[d + 12] = d
  }

  const posKeyToMu = new Map<string, number>(posR4.map((r, i) => [`${r[0]},${r[1]},${r[2]},${r[3]}`, i]))
  const dirKeyTo24 = new Map<string, number>(ordered24.map((r, i) => [`${r[0]},${r[1]},${r[2]},${r[3]}`, i]))

  const wrapSite = (x: number, y: number, z: number, t: number): number => {
    const wx = ((x % Ls) + Ls) % Ls
    const wy = ((y % Ls) + Ls) % Ls
    const wz = ((z % Ls) + Ls) % Ls
    const wt = ((t % Lt) + Lt) % Lt
    const id = coordToSite[idx4(wx, wy, wz, wt)]!
    assert(id >= 0, `Off-D_4 site (${wx},${wy},${wz},${wt})`)
    return id
  }

  const linkTarget = new Int32Array(E)
  const linkBcSign = new Int8Array(E)
  for (let s = 0; s < V; s++) {
    const [x, y, z, t] = sites[s]!
    for (let mu = 0; mu < 12; mu++) {
      const r = posR4[mu]!
      const eIdx = s * 12 + mu
      linkTarget[eIdx] = wrapSite(x + r[0], y + r[1], z + r[2], t + r[3])
      const tNext = t + r[3]
      linkBcSign[eIdx] = tNext < 0 || tNext >= Lt ? -1 : 1
    }
  }

  const stepEdge = new Int32Array(V * 24)
  const stepSign = new Int8Array(V * 24)
  const stepNext = new Int32Array(V * 24)
  for (let s = 0; s < V; s++) {
    const [x, y, z, t] = sites[s]!
    for (let d = 0; d < 24; d++) {
      const r = ordered24[d]!
      const nxt = wrapSite(x + r[0], y + r[1], z + r[2], t + r[3])
      stepNext[s * 24 + d] = nxt
      if (d < 12) {
        stepEdge[s * 24 + d] = s * 12 + d
        stepSign[s * 24 + d] = 1
      } else {
        stepEdge[s * 24 + d] = nxt * 12 + (d - 12)
        stepSign[s * 24 + d] = -1
      }
    }
  }

  const cmp4 = (a: IVec4, b: IVec4): number => {
    for (let k = 0; k < 4; k++) if (a[k]! !== b[k]!) return a[k]! - b[k]!
    return 0
  }
  const canonCycleR4 = (pts: readonly IVec4[]): string => {
    let best: IVec4[] | null = null
    for (let s = 0; s < 3; s++) {
      const o = pts[s]!
      for (const dir of [1, -1] as const) {
        const cand: IVec4[] = [0, 1, 2].map(k => {
          const p = pts[(s + dir * k + 3) % 3]!
          return [p[0] - o[0], p[1] - o[1], p[2] - o[2], p[3] - o[3]] as const
        })
        if (best === null) {
          best = cand
        } else {
          let c = 0
          for (let k = 0; k < 3; k++) {
            c = cmp4(cand[k]!, best[k]!)
            if (c !== 0) break
          }
          if (c < 0) best = cand
        }
      }
    }
    return best!.map(p => `${p[0]},${p[1]},${p[2]},${p[3]}`).join('|')
  }

  type LocalStep = { readonly offset: IVec4; readonly mu: number; readonly sign: 1 | -1 }
  const seenLocal = new Set<string>()
  const localTris: (readonly [LocalStep, LocalStep, LocalStep])[] = []
  const zero4: IVec4 = [0, 0, 0, 0]

  for (const u of ordered24) {
    for (const v of ordered24) {
      if (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3] !== 1) continue
      const pts: readonly IVec4[] = [zero4, u, v]
      const ck = canonCycleR4(pts)
      if (seenLocal.has(ck)) continue
      seenLocal.add(ck)
      const steps: LocalStep[] = []
      for (let k = 0; k < 3; k++) {
        const a = pts[k]!
        const b = pts[(k + 1) % 3]!
        const d: IVec4 = [b[0] - a[0], b[1] - a[1], b[2] - a[2], b[3] - a[3]]
        const pMu = posKeyToMu.get(`${d[0]},${d[1]},${d[2]},${d[3]}`)
        if (pMu !== undefined) {
          steps.push({ offset: a, mu: pMu, sign: 1 })
        } else {
          const mMu = posKeyToMu.get(`${-d[0]},${-d[1]},${-d[2]},${-d[3]}`)
          assert(mMu !== undefined, 'Missing inverse D_4 root in triangle')
          steps.push({ offset: b, mu: mMu!, sign: -1 })
        }
      }
      localTris.push([steps[0]!, steps[1]!, steps[2]!])
    }
  }
  assert(localTris.length === 32, `Expected 32 local D_4 triangles, got ${localTris.length}`)

  const triE0 = new Int32Array(T)
  const triS0 = new Int8Array(T)
  const triE1 = new Int32Array(T)
  const triS1 = new Int8Array(T)
  const triE2 = new Int32Array(T)
  const triS2 = new Int8Array(T)
  const stapleE1 = new Int32Array(E * 8)
  const stapleS1 = new Int8Array(E * 8)
  const stapleE2 = new Int32Array(E * 8)
  const stapleS2 = new Int8Array(E * 8)
  const stapleCount = new Uint8Array(E)

  let tIdx = 0
  const pushStaple = (ea: number, sa: number, eb: number, sb: number, ec: number, sc: number): void => {
    const slot = stapleCount[ea]!
    assert(slot < 8, `Link ${ea} exceeded 8 staples`)
    const o = ea * 8 + slot
    if (sa === 1) {
      stapleE1[o] = eb
      stapleS1[o] = sb
      stapleE2[o] = ec
      stapleS2[o] = sc
    } else {
      stapleE1[o] = ec
      stapleS1[o] = -sc
      stapleE2[o] = eb
      stapleS2[o] = -sb
    }
    stapleCount[ea] = slot + 1
  }

  for (let s = 0; s < V; s++) {
    const [x, y, z, t] = sites[s]!
    for (let lt = 0; lt < 32; lt++) {
      const tri = localTris[lt]!
      const st0 = tri[0]
      const st1 = tri[1]
      const st2 = tri[2]
      const e0 = wrapSite(x + st0.offset[0], y + st0.offset[1], z + st0.offset[2], t + st0.offset[3]) * 12 + st0.mu
      const e1 = wrapSite(x + st1.offset[0], y + st1.offset[1], z + st1.offset[2], t + st1.offset[3]) * 12 + st1.mu
      const e2 = wrapSite(x + st2.offset[0], y + st2.offset[1], z + st2.offset[2], t + st2.offset[3]) * 12 + st2.mu
      assert(e0 !== e1 && e1 !== e2 && e0 !== e2, 'Triangle links must be distinct')
      triE0[tIdx] = e0
      triS0[tIdx] = st0.sign
      triE1[tIdx] = e1
      triS1[tIdx] = st1.sign
      triE2[tIdx] = e2
      triS2[tIdx] = st2.sign
      tIdx++
      pushStaple(e0, st0.sign, e1, st1.sign, e2, st2.sign)
      pushStaple(e1, st1.sign, e2, st2.sign, e0, st0.sign)
      pushStaple(e2, st2.sign, e0, st0.sign, e1, st1.sign)
    }
  }
  assert(tIdx === T, 'Triangle count mismatch')
  for (let e = 0; e < E; e++) assert(stapleCount[e] === 8, `Expected 8 staples at link ${e}`)

  const a2Planes: [number, number][] = []
  for (let d1 = 0; d1 < 12; d1++) {
    const r1 = posR4[d1]!
    for (let d2 = d1 + 1; d2 < 12; d2++) {
      const r2 = posR4[d2]!
      if (r1[0] * r2[0] + r1[1] * r2[1] + r1[2] * r2[2] + r1[3] * r2[3] === 1) {
        a2Planes.push([d1, d2])
      }
    }
  }
  assert(a2Planes.length > 0, 'Must have equilateral A_2 planes in D_4')

  const zigDirA = dirKeyTo24.get('1,0,0,1')!
  const zigDirB = dirKeyTo24.get('-1,0,0,1')!
  const spatialDir = dirKeyTo24.get('1,1,0,0')!
  assert(zigDirA !== undefined && zigDirB !== undefined && spatialDir !== undefined, 'Missing Polyakov directions')

  return {
    Ls,
    Lt,
    V,
    E,
    T,
    sites,
    roots24: ordered24,
    posR4,
    oppDir,
    linkTarget,
    linkBcSign,
    stepEdge,
    stepSign,
    stepNext,
    triE0,
    triS0,
    triE1,
    triS1,
    triE2,
    triS2,
    stapleE1,
    stapleS1,
    stapleE2,
    stapleS2,
    a2Planes,
    zigDirA,
    zigDirB,
    spatialDir,
    t0Sites: Int32Array.from(t0List),
  }
}

// =================================================================================================
// SECTION 2: FLAT-ARRAY SU(2) & SU(3) HEATBATH + MICROCANONICAL OVERRELAXATION + OBSERVABLES
// =================================================================================================

function kpDrawX0(alpha: number, rng: Rng): number {
  if (alpha < 0.05) {
    for (let it = 0; it < 500; it++) {
      const x = 2 * rng.next() - 1
      const accept = Math.sqrt(Math.max(0, 1 - x * x)) * Math.exp(alpha * (x - 1))
      if (rng.next() <= accept) return x
    }
    return 0
  }
  for (let it = 0; it < 300; it++) {
    const r1 = rng.next()
    const r2 = rng.next()
    const r3 = rng.next()
    const c = Math.cos(2 * PI * r2)
    const lamSq = -(Math.log(r1) + c * c * Math.log(r3)) / (2 * alpha)
    if (lamSq <= 1) {
      const r4 = rng.next()
      if (r4 * r4 <= 1 - lamSq) return 1 - 2 * lamSq
    }
  }
  for (let it = 0; it < 500; it++) {
    const x = 2 * rng.next() - 1
    if (rng.next() <= Math.sqrt(Math.max(0, 1 - x * x)) * Math.exp(alpha * (x - 1))) return x
  }
  return 0
}

function kpSu2Draw(a0: number, a1: number, a2: number, a3: number, betaSub: number, rng: Rng): [number, number, number, number] {
  const k = Math.hypot(a0, a1, a2, a3)
  if (k < 1e-13) {
    const g0 = rng.nextGauss()
    const g1 = rng.nextGauss()
    const g2 = rng.nextGauss()
    const g3 = rng.nextGauss()
    const inv = 1 / Math.hypot(g0, g1, g2, g3)
    return [g0 * inv, g1 * inv, g2 * inv, g3 * inv]
  }
  const x0 = kpDrawX0(betaSub * k, rng)
  const rad = Math.sqrt(Math.max(0, 1 - x0 * x0))
  const u = 2 * rng.next() - 1
  const phi = 2 * PI * rng.next()
  const s = Math.sqrt(Math.max(0, 1 - u * u))
  const q0 = x0
  const q1 = rad * s * Math.cos(phi)
  const q2 = rad * s * Math.sin(phi)
  const q3 = rad * u
  const invK = 1 / k
  const v0 = a0 * invK
  const v1 = a1 * invK
  const v2 = a2 * invK
  const v3 = a3 * invK
  return [
    q0 * v0 - q1 * v1 - q2 * v2 - q3 * v3,
    q0 * v1 + q1 * v0 + q2 * v3 - q3 * v2,
    q0 * v2 - q1 * v3 + q2 * v0 + q3 * v1,
    q0 * v3 + q1 * v2 - q2 * v1 + q3 * v0,
  ]
}

function initSu2Links(E: number, hot: boolean, rng: Rng): Float64Array {
  const links = new Float64Array(E * 4)
  for (let e = 0; e < E; e++) {
    const o = e * 4
    if (!hot) {
      links[o] = 1
    } else {
      const g0 = rng.nextGauss()
      const g1 = rng.nextGauss()
      const g2 = rng.nextGauss()
      const g3 = rng.nextGauss()
      const inv = 1 / Math.hypot(g0, g1, g2, g3)
      links[o] = g0 * inv
      links[o + 1] = g1 * inv
      links[o + 2] = g2 * inv
      links[o + 3] = g3 * inv
    }
  }
  return links
}

function su2StapleConjSum(torus: D4BoxTorus, links: Float64Array, e: number): [number, number, number, number] {
  let a0 = 0
  let a1 = 0
  let a2 = 0
  let a3 = 0
  const base = e * 8
  for (let k = 0; k < 8; k++) {
    const o1 = torus.stapleE1[base + k]! * 4
    const s1 = torus.stapleS1[base + k]!
    const o2 = torus.stapleE2[base + k]! * 4
    const s2 = torus.stapleS2[base + k]!
    const u0 = links[o1]!, u1 = s1 * links[o1 + 1]!, u2 = s1 * links[o1 + 2]!, u3 = s1 * links[o1 + 3]!
    const v0 = links[o2]!, v1 = s2 * links[o2 + 1]!, v2 = s2 * links[o2 + 2]!, v3 = s2 * links[o2 + 3]!
    a0 += u0 * v0 - u1 * v1 - u2 * v2 - u3 * v3
    a1 -= u0 * v1 + u1 * v0 + u2 * v3 - u3 * v2
    a2 -= u0 * v2 - u1 * v3 + u2 * v0 + u3 * v1
    a3 -= u0 * v3 + u1 * v2 - u2 * v1 + u3 * v0
  }
  return [a0, a1, a2, a3]
}

function sweepSu2Heatbath(torus: D4BoxTorus, links: Float64Array, beta: number, rng: Rng): void {
  for (let e = 0; e < torus.E; e++) {
    const [a0, a1, a2, a3] = su2StapleConjSum(torus, links, e)
    const [u0, u1, u2, u3] = kpSu2Draw(a0, a1, a2, a3, beta, rng)
    const o = e * 4
    links[o] = u0
    links[o + 1] = u1
    links[o + 2] = u2
    links[o + 3] = u3
  }
}

function sweepSu2Overrelax(torus: D4BoxTorus, links: Float64Array): void {
  for (let e = 0; e < torus.E; e++) {
    const [a0, a1, a2, a3] = su2StapleConjSum(torus, links, e)
    const k2 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3
    if (k2 < 1e-24) continue
    const o = e * 4
    const u0 = links[o]!, u1 = links[o + 1]!, u2 = links[o + 2]!, u3 = links[o + 3]!
    const fac = (2 * (u0 * a0 + u1 * a1 + u2 * a2 + u3 * a3)) / k2
    const n0 = fac * a0 - u0, n1 = fac * a1 - u1, n2 = fac * a2 - u2, n3 = fac * a3 - u3
    const inv = 1 / Math.hypot(n0, n1, n2, n3)
    links[o] = n0 * inv
    links[o + 1] = n1 * inv
    links[o + 2] = n2 * inv
    links[o + 3] = n3 * inv
  }
}

function measureSu2Plaq(torus: D4BoxTorus, links: Float64Array): number {
  let sum = 0
  for (let i = 0; i < torus.T; i++) {
    const o0 = torus.triE0[i]! * 4, s0 = torus.triS0[i]!
    const o1 = torus.triE1[i]! * 4, s1 = torus.triS1[i]!
    const o2 = torus.triE2[i]! * 4, s2 = torus.triS2[i]!
    const a0 = links[o0]!, a1 = s0 * links[o0 + 1]!, a2 = s0 * links[o0 + 2]!, a3 = s0 * links[o0 + 3]!
    const b0 = links[o1]!, b1 = s1 * links[o1 + 1]!, b2 = s1 * links[o1 + 2]!, b3 = s1 * links[o1 + 3]!
    const c0 = links[o2]!, c1 = s2 * links[o2 + 1]!, c2 = s2 * links[o2 + 2]!, c3 = s2 * links[o2 + 3]!
    const p0 = a0 * b0 - a1 * b1 - a2 * b2 - a3 * b3
    const p1 = a0 * b1 + a1 * b0 + a2 * b3 - a3 * b2
    const p2 = a0 * b2 - a1 * b3 + a2 * b0 + a3 * b1
    const p3 = a0 * b3 + a1 * b2 - a2 * b1 + a3 * b0
    sum += p0 * c0 - p1 * c1 - p2 * c2 - p3 * c3
  }
  return sum / torus.T
}

function measureSu2WilsonLoop(torus: D4BoxTorus, links: Float64Array, I: number, J: number): number {
  let sum = 0
  const nPlanes = torus.a2Planes.length
  for (let p = 0; p < nPlanes; p++) {
    const [d1, d2] = torus.a2Planes[p]!
    const d1m = torus.oppDir[d1]!, d2m = torus.oppDir[d2]!
    for (let s0 = 0; s0 < torus.V; s0++) {
      let s = s0
      let q0 = 1, q1 = 0, q2 = 0, q3 = 0
      const step = (dir: number): void => {
        const idx = s * 24 + dir, eo = torus.stepEdge[idx]! * 4, sg = torus.stepSign[idx]!
        const u0 = links[eo]!, u1 = sg * links[eo + 1]!, u2 = sg * links[eo + 2]!, u3 = sg * links[eo + 3]!
        const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3
        const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2
        const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1
        const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0
        q0 = n0; q1 = n1; q2 = n2; q3 = n3
        s = torus.stepNext[idx]!
      }
      for (let k = 0; k < I; k++) step(d1)
      for (let k = 0; k < J; k++) step(d2)
      for (let k = 0; k < I; k++) step(d1m)
      for (let k = 0; k < J; k++) step(d2m)
      sum += q0
    }
  }
  return sum / (torus.V * nPlanes)
}

function measureSu2Polyakov(torus: D4BoxTorus, links: Float64Array): { readonly tempAbs: number; readonly spatAbs: number } {
  let sumT = 0
  const nSp = torus.t0Sites.length
  for (let i = 0; i < nSp; i++) {
    let s = torus.t0Sites[i]!
    let q0 = 1, q1 = 0, q2 = 0, q3 = 0
    for (let step = 0; step < torus.Lt; step++) {
      const dir = (step & 1) === 0 ? torus.zigDirA : torus.zigDirB
      const idx = s * 24 + dir, eo = torus.stepEdge[idx]! * 4, sg = torus.stepSign[idx]!
      const u0 = links[eo]!, u1 = sg * links[eo + 1]!, u2 = sg * links[eo + 2]!, u3 = sg * links[eo + 3]!
      const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3
      const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2
      const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1
      const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0
      q0 = n0; q1 = n1; q2 = n2; q3 = n3
      s = torus.stepNext[idx]!
    }
    sumT += q0
  }
  let sumS = 0
  for (let s0 = 0; s0 < torus.V; s0++) {
    let s = s0
    let q0 = 1, q1 = 0, q2 = 0, q3 = 0
    for (let step = 0; step < torus.Ls; step++) {
      const idx = s * 24 + torus.spatialDir, eo = torus.stepEdge[idx]! * 4, sg = torus.stepSign[idx]!
      const u0 = links[eo]!, u1 = sg * links[eo + 1]!, u2 = sg * links[eo + 2]!, u3 = sg * links[eo + 3]!
      const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3
      const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2
      const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1
      const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0
      q0 = n0; q1 = n1; q2 = n2; q3 = n3
      s = torus.stepNext[idx]!
    }
    sumS += q0
  }
  return { tempAbs: Math.abs(sumT / nSp), spatAbs: Math.abs(sumS / torus.V) }
}

function m3PolishAt(arr: Float64Array, off: number): void {
  let n0 = 0
  for (let j = 0; j < 6; j++) n0 += arr[off + j]! * arr[off + j]!
  const i0 = 1 / Math.sqrt(n0)
  for (let j = 0; j < 6; j++) arr[off + j] = arr[off + j]! * i0
  let dR = 0, dI = 0
  for (let j = 0; j < 3; j++) {
    const r0 = arr[off + 2 * j]!, i0v = arr[off + 2 * j + 1]!
    const r1 = arr[off + 6 + 2 * j]!, i1v = arr[off + 6 + 2 * j + 1]!
    dR += r0 * r1 + i0v * i1v
    dI += r0 * i1v - i0v * r1
  }
  for (let j = 0; j < 3; j++) {
    const r0 = arr[off + 2 * j]!, i0v = arr[off + 2 * j + 1]!
    arr[off + 6 + 2 * j] = arr[off + 6 + 2 * j]! - (dR * r0 - dI * i0v)
    arr[off + 6 + 2 * j + 1] = arr[off + 6 + 2 * j + 1]! - (dR * i0v + dI * r0)
  }
  let n1 = 0
  for (let j = 6; j < 12; j++) n1 += arr[off + j]! * arr[off + j]!
  const i1 = 1 / Math.sqrt(n1)
  for (let j = 6; j < 12; j++) arr[off + j] = arr[off + j]! * i1
  const a0r = arr[off]!, a0i = arr[off + 1]!, a1r = arr[off + 2]!, a1i = arr[off + 3]!, a2r = arr[off + 4]!, a2i = arr[off + 5]!
  const b0r = arr[off + 6]!, b0i = arr[off + 7]!, b1r = arr[off + 8]!, b1i = arr[off + 9]!, b2r = arr[off + 10]!, b2i = arr[off + 11]!
  const c0r = a1r * b2r - a1i * b2i - (a2r * b1r - a2i * b1i)
  const c0i = a1r * b2i + a1i * b2r - (a2r * b1i + a2i * b1r)
  const c1r = a2r * b0r - a2i * b0i - (a0r * b2r - a0i * b2i)
  const c1i = a2r * b0i + a2i * b0r - (a0r * b2i + a0i * b2r)
  const c2r = a0r * b1r - a0i * b1i - (a1r * b0r - a1i * b0i)
  const c2i = a0r * b1i + a0i * b1r - (a1r * b0i + a1i * b0r)
  arr[off + 12] = c0r; arr[off + 13] = -c0i
  arr[off + 14] = c1r; arr[off + 15] = -c1i
  arr[off + 16] = c2r; arr[off + 17] = -c2i
}

function initSu3Links(E: number, hot: boolean, rng: Rng): Float64Array {
  const links = new Float64Array(E * 18)
  for (let e = 0; e < E; e++) {
    const o = e * 18
    if (!hot) {
      links[o] = 1; links[o + 8] = 1; links[o + 16] = 1
    } else {
      for (let k = 0; k < 12; k++) links[o + k] = rng.nextGauss()
      m3PolishAt(links, o)
    }
  }
  return links
}

function m3MulFlat(A: Float64Array, oA: number, sA: number, B: Float64Array, oB: number, sB: number, out: Float64Array): void {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0, si = 0
      for (let k = 0; k < 3; k++) {
        const ia = oA + (sA === 1 ? (i * 3 + k) * 2 : (k * 3 + i) * 2)
        const ib = oB + (sB === 1 ? (k * 3 + j) * 2 : (j * 3 + k) * 2)
        const ar = A[ia]!, ai = sA === 1 ? A[ia + 1]! : -A[ia + 1]!
        const br = B[ib]!, bi = sB === 1 ? B[ib + 1]! : -B[ib + 1]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      const oi = (i * 3 + j) * 2
      out[oi] = sr; out[oi + 1] = si
    }
  }
}

function su3StapleInto(torus: D4BoxTorus, links: Float64Array, e: number, stOut: Float64Array, tmp: Float64Array): void {
  stOut.fill(0)
  const base = e * 8
  for (let k = 0; k < 8; k++) {
    m3MulFlat(links, torus.stapleE1[base + k]! * 18, torus.stapleS1[base + k]!, links, torus.stapleE2[base + k]! * 18, torus.stapleS2[base + k]!, tmp)
    for (let j = 0; j < 18; j++) stOut[j] = stOut[j]! + tmp[j]!
  }
}

const SU3_SUBPAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [1, 2],
]

function sweepSu3Heatbath(torus: D4BoxTorus, links: Float64Array, beta: number, rng: Rng): void {
  const betaSub = (2 * beta) / 3
  const st = new Float64Array(18), tmp = new Float64Array(18), M = new Float64Array(18)
  for (let e = 0; e < torus.E; e++) {
    su3StapleInto(torus, links, e, st, tmp)
    const uOff = e * 18
    for (let sp = 0; sp < 3; sp++) {
      const [p, q] = SU3_SUBPAIRS[sp]!
      m3MulFlat(links, uOff, 1, st, 0, 1, M)
      const a0 = 0.5 * (M[(p * 3 + p) * 2]! + M[(q * 3 + q) * 2]!)
      const a1 = 0.5 * (M[(p * 3 + q) * 2 + 1]! + M[(q * 3 + p) * 2 + 1]!)
      const a2 = 0.5 * (M[(p * 3 + q) * 2]! - M[(q * 3 + p) * 2]!)
      const a3 = 0.5 * (M[(p * 3 + p) * 2 + 1]! - M[(q * 3 + q) * 2 + 1]!)
      const [r0, r1, r2, r3] = kpSu2Draw(a0, a1, a2, a3, betaSub, rng)
      const r00r = r0, r00i = -r3, r01r = -r2, r01i = -r1
      const r10r = r2, r10i = -r1, r11r = r0, r11i = r3
      for (let col = 0; col < 3; col++) {
        const ip = uOff + (p * 3 + col) * 2, iq = uOff + (q * 3 + col) * 2
        const upr = links[ip]!, upi = links[ip + 1]!, uqr = links[iq]!, uqi = links[iq + 1]!
        links[ip] = r00r * upr - r00i * upi + (r01r * uqr - r01i * uqi)
        links[ip + 1] = r00r * upi + r00i * upr + (r01r * uqi + r01i * uqr)
        links[iq] = r10r * upr - r10i * upi + (r11r * uqr - r11i * uqi)
        links[iq + 1] = r10r * upi + r10i * upr + (r11r * uqi + r11i * uqr)
      }
    }
  }
}

function sweepSu3Overrelax(torus: D4BoxTorus, links: Float64Array): void {
  const st = new Float64Array(18), tmp = new Float64Array(18), M = new Float64Array(18)
  for (let e = 0; e < torus.E; e++) {
    su3StapleInto(torus, links, e, st, tmp)
    const uOff = e * 18
    for (let sp = 0; sp < 3; sp++) {
      const [p, q] = SU3_SUBPAIRS[sp]!
      m3MulFlat(links, uOff, 1, st, 0, 1, M)
      const a0 = 0.5 * (M[(p * 3 + p) * 2]! + M[(q * 3 + q) * 2]!)
      const a1 = 0.5 * (M[(p * 3 + q) * 2 + 1]! + M[(q * 3 + p) * 2 + 1]!)
      const a2 = 0.5 * (M[(p * 3 + q) * 2]! - M[(q * 3 + p) * 2]!)
      const a3 = 0.5 * (M[(p * 3 + p) * 2 + 1]! - M[(q * 3 + q) * 2 + 1]!)
      const k2 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3
      if (k2 < 1e-24) continue
      const invK = 1 / Math.sqrt(k2)
      const h0 = a0 * invK, h1 = a1 * invK, h2 = a2 * invK, h3 = a3 * invK
      const r0 = 2 * h0 * h0 - 1, r1 = 2 * h0 * h1, r2 = 2 * h0 * h2, r3 = 2 * h0 * h3
      const r00r = r0, r00i = -r3, r01r = -r2, r01i = -r1
      const r10r = r2, r10i = -r1, r11r = r0, r11i = r3
      for (let col = 0; col < 3; col++) {
        const ip = uOff + (p * 3 + col) * 2, iq = uOff + (q * 3 + col) * 2
        const upr = links[ip]!, upi = links[ip + 1]!, uqr = links[iq]!, uqi = links[iq + 1]!
        links[ip] = r00r * upr - r00i * upi + (r01r * uqr - r01i * uqi)
        links[ip + 1] = r00r * upi + r00i * upr + (r01r * uqi + r01i * uqr)
        links[iq] = r10r * upr - r10i * upi + (r11r * uqr - r11i * uqi)
        links[iq + 1] = r10r * upi + r10i * upr + (r11r * uqi + r11i * uqr)
      }
    }
  }
}

function polishAllSu3(links: Float64Array, E: number): void {
  for (let e = 0; e < E; e++) m3PolishAt(links, e * 18)
}

function measureSu3Plaq(torus: D4BoxTorus, links: Float64Array): number {
  const tmp = new Float64Array(18)
  let sum = 0
  for (let i = 0; i < torus.T; i++) {
    m3MulFlat(links, torus.triE0[i]! * 18, torus.triS0[i]!, links, torus.triE1[i]! * 18, torus.triS1[i]!, tmp)
    const o2 = torus.triE2[i]! * 18, s2 = torus.triS2[i]!
    let tr = 0
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const ia = (r * 3 + c) * 2
        const ib = o2 + (s2 === 1 ? (c * 3 + r) * 2 : (r * 3 + c) * 2)
        const br = links[ib]!, bi = s2 === 1 ? links[ib + 1]! : -links[ib + 1]!
        tr += tmp[ia]! * br - tmp[ia + 1]! * bi
      }
    }
    sum += tr / 3
  }
  return sum / torus.T
}

function measureSu3WilsonLoop(torus: D4BoxTorus, links: Float64Array, I: number, J: number): number {
  const cur = new Float64Array(18), nxt = new Float64Array(18)
  let sum = 0
  const nPlanes = torus.a2Planes.length
  for (let p = 0; p < nPlanes; p++) {
    const [d1, d2] = torus.a2Planes[p]!
    const d1m = torus.oppDir[d1]!, d2m = torus.oppDir[d2]!
    for (let s0 = 0; s0 < torus.V; s0++) {
      let s = s0
      cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1
      const step = (dir: number): void => {
        const idx = s * 24 + dir
        m3MulFlat(cur, 0, 1, links, torus.stepEdge[idx]! * 18, torus.stepSign[idx]!, nxt)
        cur.set(nxt)
        s = torus.stepNext[idx]!
      }
      for (let k = 0; k < I; k++) step(d1)
      for (let k = 0; k < J; k++) step(d2)
      for (let k = 0; k < I; k++) step(d1m)
      for (let k = 0; k < J; k++) step(d2m)
      sum += (cur[0]! + cur[8]! + cur[16]!) / 3
    }
  }
  return sum / (torus.V * nPlanes)
}

function measureSu3Polyakov(torus: D4BoxTorus, links: Float64Array): { readonly tempAbs: number; readonly spatAbs: number } {
  const cur = new Float64Array(18), nxt = new Float64Array(18)
  let sumTR = 0, sumTI = 0
  const nSp = torus.t0Sites.length
  for (let i = 0; i < nSp; i++) {
    let s = torus.t0Sites[i]!
    cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1
    for (let step = 0; step < torus.Lt; step++) {
      const dir = (step & 1) === 0 ? torus.zigDirA : torus.zigDirB
      const idx = s * 24 + dir
      m3MulFlat(cur, 0, 1, links, torus.stepEdge[idx]! * 18, torus.stepSign[idx]!, nxt)
      cur.set(nxt)
      s = torus.stepNext[idx]!
    }
    sumTR += (cur[0]! + cur[8]! + cur[16]!) / 3
    sumTI += (cur[1]! + cur[9]! + cur[17]!) / 3
  }
  let sumSR = 0, sumSI = 0
  for (let s0 = 0; s0 < torus.V; s0++) {
    let s = s0
    cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1
    for (let step = 0; step < torus.Ls; step++) {
      const idx = s * 24 + torus.spatialDir
      m3MulFlat(cur, 0, 1, links, torus.stepEdge[idx]! * 18, torus.stepSign[idx]!, nxt)
      cur.set(nxt)
      s = torus.stepNext[idx]!
    }
    sumSR += (cur[0]! + cur[8]! + cur[16]!) / 3
    sumSI += (cur[1]! + cur[9]! + cur[17]!) / 3
  }
  return { tempAbs: Math.hypot(sumTR / nSp, sumTI / nSp), spatAbs: Math.hypot(sumSR / torus.V, sumSI / torus.V) }
}

// =================================================================================================
// SECTION 3: MATRIX-FREE 4D D_4 CHIRAL DIRAC OPERATOR, CG SOLVER, CONDENSATE & HADRON CORRELATORS
// =================================================================================================

function buildSigTables(posR4: readonly IVec4[]): { readonly sigR: Float64Array; readonly sigBarR: Float64Array } {
  const sigR = new Float64Array(12 * 8)
  const sigBarR = new Float64Array(12 * 8)
  for (let mu = 0; mu < 12; mu++) {
    const [rx, ry, rz, rt] = posR4[mu]!
    const o = mu * 8
    sigR[o + 0] = rt; sigR[o + 1] = rz
    sigR[o + 2] = ry; sigR[o + 3] = rx
    sigR[o + 4] = -ry; sigR[o + 5] = rx
    sigR[o + 6] = rt; sigR[o + 7] = -rz
    sigBarR[o + 0] = rt; sigBarR[o + 1] = -rz
    sigBarR[o + 2] = -ry; sigBarR[o + 3] = -rx
    sigBarR[o + 4] = ry; sigBarR[o + 5] = -rx
    sigBarR[o + 6] = rt; sigBarR[o + 7] = rz
  }
  return { sigR, sigBarR }
}

function applyD4ChiralM(
  torus: D4BoxTorus,
  links: Float64Array,
  sigTable: Float64Array,
  dag: boolean,
  inR: Float64Array,
  inI: Float64Array,
  outR: Float64Array,
  outI: Float64Array,
): void {
  outR.fill(0)
  outI.fill(0)
  const V = torus.V
  const C_NORM = 1 / 12
  const fwdSign = dag ? -1 : 1
  const bwdSign = dag ? 1 : -1

  for (let s = 0; s < V; s++) {
    const sBase = s * 6
    for (let mu = 0; mu < 12; mu++) {
      const eIdx = s * 12 + mu
      const dst = torus.linkTarget[eIdx]!
      const dstBase = dst * 6
      const bc = torus.linkBcSign[eIdx]! * C_NORM
      const uOff = eIdx * 18
      const sOff = mu * 8
      const fFac = fwdSign * bc
      const bFac = bwdSign * bc

      for (let sp1 = 0; sp1 < 2; sp1++) {
        for (let sp2 = 0; sp2 < 2; sp2++) {
          const zIdx = sOff + (sp1 * 2 + sp2) * 2
          const sr = sigTable[zIdx]!, si = sigTable[zIdx + 1]!
          if (sr === 0 && si === 0) continue
          const fsr = fFac * sr, fsi = fFac * si
          const bsr = bFac * sr, bsi = bFac * si
          const inDstOff = dstBase + sp2 * 3, inSrcOff = sBase + sp2 * 3
          const outSrcOff = sBase + sp1 * 3, outDstOff = dstBase + sp1 * 3

          for (let c1 = 0; c1 < 3; c1++) {
            let uvr = 0, uvi = 0, udr = 0, udi = 0
            for (let c2 = 0; c2 < 3; c2++) {
              const uF = uOff + (c1 * 3 + c2) * 2
              const fr = links[uF]!, fi = links[uF + 1]!
              const vr = inR[inDstOff + c2]!, vi = inI[inDstOff + c2]!
              uvr += fr * vr - fi * vi
              uvi += fr * vi + fi * vr

              const uB = uOff + (c2 * 3 + c1) * 2
              const br = links[uB]!, bi = -links[uB + 1]!
              const wr = inR[inSrcOff + c2]!, wi = inI[inSrcOff + c2]!
              udr += br * wr - bi * wi
              udi += br * wi + bi * wr
            }
            outR[outSrcOff + c1] = outR[outSrcOff + c1]! + (fsr * uvr - fsi * uvi)
            outI[outSrcOff + c1] = outI[outSrcOff + c1]! + (fsr * uvi + fsi * uvr)
            outR[outDstOff + c1] = outR[outDstOff + c1]! + (bsr * udr - bsi * udi)
            outI[outDstOff + c1] = outI[outDstOff + c1]! + (bsr * udi + bsi * udr)
          }
        }
      }
    }
  }
}

function solveGramCG(
  torus: D4BoxTorus,
  links: Float64Array,
  sigR: Float64Array,
  sigBarR: Float64Array,
  mode: 'L' | 'R',
  mqSq: number,
  bR: Float64Array,
  bI: Float64Array,
  xR: Float64Array,
  xI: Float64Array,
  tol = 1e-11,
  maxIters = 2500,
): { readonly iters: number; readonly relRes: number } {
  const n = torus.V * 6
  const rR = Float64Array.from(bR), rI = Float64Array.from(bI)
  const pR = Float64Array.from(bR), pI = Float64Array.from(bI)
  const tR = new Float64Array(n), tI = new Float64Array(n)
  const apR = new Float64Array(n), apI = new Float64Array(n)
  xR.fill(0); xI.fill(0)

  let bNorm2 = 0
  for (let i = 0; i < n; i++) bNorm2 += bR[i]! * bR[i]! + bI[i]! * bI[i]!
  if (bNorm2 < 1e-30) return { iters: 0, relRes: 0 }
  const tolSq = tol * tol * bNorm2
  let rsOld = bNorm2

  const applyGram = (vR: Float64Array, vI: Float64Array, oR: Float64Array, oI: Float64Array): void => {
    if (mode === 'L') {
      applyD4ChiralM(torus, links, sigBarR, true, vR, vI, tR, tI)
      applyD4ChiralM(torus, links, sigR, false, tR, tI, oR, oI)
    } else {
      applyD4ChiralM(torus, links, sigR, false, vR, vI, tR, tI)
      applyD4ChiralM(torus, links, sigBarR, true, tR, tI, oR, oI)
    }
    for (let i = 0; i < n; i++) {
      oR[i] = oR[i]! + mqSq * vR[i]!
      oI[i] = oI[i]! + mqSq * vI[i]!
    }
  }

  let it = 0
  for (; it < maxIters; it++) {
    applyGram(pR, pI, apR, apI)
    let pAp = 0
    for (let i = 0; i < n; i++) pAp += pR[i]! * apR[i]! + pI[i]! * apI[i]!
    if (pAp <= 1e-30) break
    const alpha = rsOld / pAp
    let rsNew = 0
    for (let i = 0; i < n; i++) {
      xR[i] = xR[i]! + alpha * pR[i]!
      xI[i] = xI[i]! + alpha * pI[i]!
      const nr = rR[i]! - alpha * apR[i]!
      const ni = rI[i]! - alpha * apI[i]!
      rR[i] = nr; rI[i] = ni
      rsNew += nr * nr + ni * ni
    }
    if (rsNew <= tolSq) { it++; rsOld = rsNew; break }
    const beta = rsNew / rsOld
    for (let i = 0; i < n; i++) {
      pR[i] = rR[i]! + beta * pR[i]!
      pI[i] = rI[i]! + beta * pI[i]!
    }
    rsOld = rsNew
  }
  return { iters: it, relRes: Math.sqrt(rsOld / bNorm2) }
}

function exactFreeD4Dispersion(
  Ls: number,
  Lt: number,
  mq: number,
): { readonly lamMinDoubler: number; readonly lamPhysK0: number; readonly pbpNorm: number } {
  // Exact 4D naive D_4 dispersion over 2V Z^4 momenta (40 continuum species/doublers:
  // physical c = 1 mode at k_vec = (0,0,0) has lam = sin(pi/L_t); c = 1/3 doubler at
  // k_vec = (pi,pi,0) has lam_min = sin(pi/L_t)/3). pbpNorm is normalized by 1/(4 N_c) = 1/12.
  const V = (Ls * Ls * Ls * Lt) / 2
  let lamMin2 = Number.POSITIVE_INFINITY
  let pbpSum = 0
  for (let nt = 0; nt < Lt; nt++) {
    const kt = (2 * PI * (nt + 0.5)) / Lt
    const st = Math.sin(kt), ct = Math.cos(kt)
    for (let nx = 0; nx < Ls; nx++) {
      const kx = (2 * PI * nx) / Ls
      const sx = Math.sin(kx), cx = Math.cos(kx)
      for (let ny = 0; ny < Ls; ny++) {
        const ky = (2 * PI * ny) / Ls
        const sy = Math.sin(ky), cy = Math.cos(ky)
        for (let nz = 0; nz < Ls; nz++) {
          const kz = (2 * PI * nz) / Ls
          const sz = Math.sin(kz), cz = Math.cos(kz)
          const px = (sx * (cy + cz + ct)) / 3
          const py = (sy * (cx + cz + ct)) / 3
          const pz = (sz * (cx + cy + ct)) / 3
          const pt = (st * (cx + cy + cz)) / 3
          const lam2 = px * px + py * py + pz * pz + pt * pt
          if (lam2 < lamMin2) lamMin2 = lam2
          pbpSum += (6 * mq) / (lam2 + mq * mq)
        }
      }
    }
  }
  return { lamMinDoubler: Math.sqrt(lamMin2), lamPhysK0: Math.sin(PI / Lt), pbpNorm: pbpSum / (12 * V) }
}

function binnedJackknifeErr(samples: Float64Array, maxBins = 10): number {
  const n = samples.length
  if (n <= 1) return 0
  const nBins = n >= 8 ? Math.min(maxBins, Math.max(4, Math.floor(n / 4))) : n
  const binLen = Math.floor(n / nBins)
  const binMeans = new Float64Array(nBins)
  let total = 0
  for (let b = 0; b < nBins; b++) {
    const start = b * binLen
    const end = b === nBins - 1 ? n : start + binLen
    let s = 0
    for (let i = start; i < end; i++) s += samples[i]!
    const m = s / (end - start)
    binMeans[b] = m
    total += m
  }
  const grand = total / nBins
  let ss = 0
  for (let b = 0; b < nBins; b++) {
    const loo = (total - binMeans[b]!) / (nBins - 1)
    ss += (loo - grand) * (loo - grand)
  }
  return Math.sqrt(((nBins - 1) / nBins) * ss)
}

function fitRhoOscillatingCosh(
  symC: readonly number[],
  Lt: number,
): { readonly mRho: number; readonly ampA: number; readonly ampB: number; readonly oscRatio: number; readonly relRmsErr: number } {
  // Oscillating parity-partner cosh fit for naive D_4 vector correlator on tau = 1..Lt/2:
  //   C_rho(tau) = A cosh(m_rho (tau - Lt/2)) + (-1)^tau B cosh(m_rho (tau - Lt/2))
  // On Lt = 6 (tau = 1, 2, 3), C(1) and C(3) share parity (-1)^1 = (-1)^3 = -1, giving the
  // exact closed-form oscillating solution cosh(2 m_rho) = C(1)/C(3). On Lt >= 8 (4+ points),
  // 1D variable projection solves exact weighted least-squares for (A(m), B(m)) with zero clamps.
  const half = Lt / 2
  assert(half >= 3, `Lt=${Lt} too small for oscillating parity-partner rho fit`)
  if (half === 3) {
    const c1 = symC[1]!, c2 = symC[2]!, c3 = symC[3]!
    assert(c1 > c3 && c3 > 0, `Non-monotone same-parity rho correlator C(1)=${c1}, C(3)=${c3}`)
    const mRho = 0.5 * Math.acosh(c1 / c3)
    const evenBase = c2 / Math.cosh(mRho)
    const ampA = 0.5 * (evenBase + c3)
    const ampB = 0.5 * (evenBase - c3)
    assert(ampA > 0, `Non-positive rho non-oscillating amplitude A=${ampA}`)
    return { mRho, ampA, ampB, oscRatio: ampB / ampA, relRmsErr: 0 }
  }
  const evalM = (m: number): { readonly sse: number; readonly A: number; readonly B: number } => {
    let g00 = 0, g01 = 0, g11 = 0, r0 = 0, r1 = 0
    for (let tau = 1; tau <= half; tau++) {
      const y = symC[tau]!
      const invW = 1 / Math.max(1e-12, Math.abs(y))
      const ch = Math.cosh(m * (tau - half))
      const f0 = ch * invW
      const f1 = ((tau & 1) === 0 ? 1 : -1) * ch * invW
      const yw = y * invW
      g00 += f0 * f0; g01 += f0 * f1; g11 += f1 * f1
      r0 += f0 * yw; r1 += f1 * yw
    }
    const det = g00 * g11 - g01 * g01
    if (det <= 1e-30) return { sse: Number.POSITIVE_INFINITY, A: 0, B: 0 }
    const A = (g11 * r0 - g01 * r1) / det
    const B = (g00 * r1 - g01 * r0) / det
    if (A <= 0) return { sse: Number.POSITIVE_INFINITY, A, B }
    let sse = 0
    for (let tau = 1; tau <= half; tau++) {
      const y = symC[tau]!
      const pred = (A + ((tau & 1) === 0 ? B : -B)) * Math.cosh(m * (tau - half))
      const rel = (pred - y) / Math.max(1e-12, Math.abs(y))
      sse += rel * rel
    }
    return { sse, A, B }
  }
  let bestM = 1.0, best = evalM(bestM)
  for (let i = 1; i <= 160; i++) {
    const m = 0.1 + (3.9 * i) / 160
    const ev = evalM(m)
    if (ev.sse < best.sse) { best = ev; bestM = m }
  }
  let lo = Math.max(0.05, bestM - 0.05), hi = Math.min(4.5, bestM + 0.05)
  const phi = 0.6180339887498949
  for (let it = 0; it < 60; it++) {
    const x1 = hi - phi * (hi - lo), x2 = lo + phi * (hi - lo)
    if (evalM(x1).sse < evalM(x2).sse) hi = x2
    else lo = x1
  }
  const mRho = 0.5 * (lo + hi)
  const fin = evalM(mRho)
  assert(Number.isFinite(fin.sse) && fin.A > 0, `Oscillating rho fit failed: A=${fin.A}, sse=${fin.sse}`)
  return { mRho, ampA: fin.A, ampB: fin.B, oscRatio: fin.B / fin.A, relRmsErr: Math.sqrt(fin.sse / half) }
}

function solveCoshMassAt(cTau: number, cTau1: number, tau: number, Lt: number): number {
  const half = Lt / 2
  const d0 = Math.abs(tau - half)
  const d1 = Math.abs(tau + 1 - half)
  assert(cTau > 0 && cTau1 > 0 && cTau > cTau1 && d0 > d1, `Invalid cosh correlator ratio ${cTau}/${cTau1} at tau=${tau}`)
  const target = cTau / cTau1
  if (d1 === 0 && d0 === 1) return Math.acosh(target)
  let lo = 0, hi = 12
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (lo + hi)
    const val = Math.cosh(mid * d0) / Math.cosh(mid * d1)
    if (val < target) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

function measureD4FermionsOnConfig(
  torus: D4BoxTorus,
  links: Float64Array,
  sigR: Float64Array,
  sigBarR: Float64Array,
  mq: number,
  nStochNoise: number,
  rng: Rng,
): {
  readonly cPi: Float64Array
  readonly cRho: Float64Array
  readonly pbpExactPt: number
  readonly pbpStoch: number
  readonly wtiRelErr: number
  readonly avgCgIters: number
} {
  const V = torus.V
  const Lt = torus.Lt
  const nBlk = V * 6
  const mqSq = mq * mq
  const x0 = 0

  const sRe = Array.from({ length: V }, () => new Float64Array(144))
  const sIm = Array.from({ length: V }, () => new Float64Array(144))
  const rhsR = new Float64Array(nBlk), rhsI = new Float64Array(nBlk)
  const solR = new Float64Array(nBlk), solI = new Float64Array(nBlk)
  const mvR = new Float64Array(nBlk), mvI = new Float64Array(nBlk)

  let totIters = 0, nSolves = 0

  for (let sp0 = 0; sp0 < 2; sp0++) {
    for (let col0 = 0; col0 < 3; col0++) {
      const kBlk = (x0 * 2 + sp0) * 3 + col0
      const src12 = sp0 * 3 + col0
      rhsR.fill(0); rhsI.fill(0); rhsR[kBlk] = 1
      const cg = solveGramCG(torus, links, sigR, sigBarR, 'L', mqSq, rhsR, rhsI, solR, solI)
      assert(cg.relRes < 1e-9, `CG failed (L): relRes=${cg.relRes}`)
      totIters += cg.iters; nSolves++
      applyD4ChiralM(torus, links, sigBarR, true, solR, solI, mvR, mvI)
      for (let x = 0; x < V; x++) {
        const dr = sRe[x]!, di = sIm[x]!
        for (let sp = 0; sp < 2; sp++) {
          for (let col = 0; col < 3; col++) {
            const rb = (x * 2 + sp) * 3 + col
            const rL = sp * 3 + col, rR = (2 + sp) * 3 + col
            dr[rL * 12 + src12] = mq * solR[rb]!
            di[rL * 12 + src12] = mq * solI[rb]!
            dr[rR * 12 + src12] = mvR[rb]!
            di[rR * 12 + src12] = mvI[rb]!
          }
        }
      }
    }
  }
  for (let sp0 = 0; sp0 < 2; sp0++) {
    for (let col0 = 0; col0 < 3; col0++) {
      const kBlk = (x0 * 2 + sp0) * 3 + col0
      const src12 = (2 + sp0) * 3 + col0
      rhsR.fill(0); rhsI.fill(0); rhsR[kBlk] = 1
      const cg = solveGramCG(torus, links, sigR, sigBarR, 'R', mqSq, rhsR, rhsI, solR, solI)
      assert(cg.relRes < 1e-9, `CG failed (R): relRes=${cg.relRes}`)
      totIters += cg.iters; nSolves++
      applyD4ChiralM(torus, links, sigR, false, solR, solI, mvR, mvI)
      for (let x = 0; x < V; x++) {
        const dr = sRe[x]!, di = sIm[x]!
        for (let sp = 0; sp < 2; sp++) {
          for (let col = 0; col < 3; col++) {
            const rb = (x * 2 + sp) * 3 + col
            const rL = sp * 3 + col, rR = (2 + sp) * 3 + col
            dr[rL * 12 + src12] = -mvR[rb]!
            di[rL * 12 + src12] = -mvI[rb]!
            dr[rR * 12 + src12] = mq * solR[rb]!
            di[rR * 12 + src12] = mq * solI[rb]!
          }
        }
      }
    }
  }

  let trS0 = 0
  const s0R = sRe[x0]!
  for (let i = 0; i < 12; i++) trS0 += s0R[i * 12 + i]!

  const g5gkR: readonly Float64Array[] = [
    Float64Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    Float64Array.from([0, 0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, -1, 0, 0, 0]),
    Float64Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  ]
  const g5gkI: readonly Float64Array[] = [
    Float64Array.from([0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0]),
    Float64Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    Float64Array.from([0, 0, 1, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, -1, 0, 0]),
  ]
  const m4AR = new Float64Array(16), m4AI = new Float64Array(16)
  const m4BR = new Float64Array(16), m4BI = new Float64Array(16)

  const cPi = new Float64Array(Lt), cRho = new Float64Array(Lt)
  let sumPiTot = 0

  for (let x = 0; x < V; x++) {
    const tau = torus.sites[x]![3]!
    const sr = sRe[x]!, si = sIm[x]!
    let piVal = 0
    for (let k = 0; k < 144; k++) piVal += sr[k]! * sr[k]! + si[k]! * si[k]!
    cPi[tau] = cPi[tau]! + piVal
    sumPiTot += piVal

    let rhoVal = 0
    for (let dir = 0; dir < 3; dir++) {
      const GR = g5gkR[dir]!, GI = g5gkI[dir]!
      for (let c1 = 0; c1 < 3; c1++) {
        for (let c2 = 0; c2 < 3; c2++) {
          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              const idx = (a * 3 + c1) * 12 + (b * 3 + c2)
              m4AR[a * 4 + b] = sr[idx]!; m4AI[a * 4 + b] = si[idx]!
            }
          }
          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              let rAcc = 0, iAcc = 0
              for (let m = 0; m < 4; m++) {
                const gr = GR[a * 4 + m]!, gi = GI[a * 4 + m]!
                if (gr === 0 && gi === 0) continue
                const sR = m4AR[m * 4 + b]!, sI = m4AI[m * 4 + b]!
                rAcc += gr * sR - gi * sI
                iAcc += gr * sI + gi * sR
              }
              m4BR[a * 4 + b] = rAcc; m4BI[a * 4 + b] = iAcc
            }
          }
          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              let qr = 0, qi = 0
              for (let m = 0; m < 4; m++) {
                const gr = GR[b * 4 + m]!, gi = GI[b * 4 + m]!
                if (gr === 0 && gi === 0) continue
                const br = m4BR[a * 4 + m]!, bi = m4BI[a * 4 + m]!
                qr += br * gr + bi * gi
                qi += bi * gr - br * gi
              }
              rhoVal += qr * m4AR[a * 4 + b]! + qi * m4AI[a * 4 + b]!
            }
          }
        }
      }
    }
    cRho[tau] = cRho[tau]! + rhoVal / 3
  }
  const wtiRelErr = Math.abs(mq * sumPiTot - trS0) / Math.max(1e-12, Math.abs(trS0))

  let pbpStochSum = 0
  const invSqrt2 = Math.SQRT1_2
  for (let nr = 0; nr < nStochNoise; nr++) {
    for (let i = 0; i < nBlk; i++) {
      rhsR[i] = rng.nextSign() * invSqrt2
      rhsI[i] = rng.nextSign() * invSqrt2
    }
    const cg = solveGramCG(torus, links, sigR, sigBarR, 'R', mqSq, rhsR, rhsI, solR, solI)
    assert(cg.relRes < 1e-9, `Stochastic CG failed: relRes=${cg.relRes}`)
    totIters += cg.iters; nSolves++
    let dot = 0
    for (let i = 0; i < nBlk; i++) dot += rhsR[i]! * solR[i]! + rhsI[i]! * solI[i]!
    pbpStochSum += (2 * mq * dot) / (12 * V)
  }
  const pbpExactNorm = trS0 / 12
  const pbpStoch = nStochNoise > 0 ? pbpStochSum / nStochNoise : pbpExactNorm

  return { cPi, cRho, pbpExactPt: pbpExactNorm, pbpStoch, wtiRelErr, avgCgIters: totIters / Math.max(1, nSolves) }
}

// =================================================================================================
// SECTION 4: WORKER-THREAD PARALLEL GAUGE RUNNER
// =================================================================================================

type GaugePointResult = {
  readonly group: 'SU2' | 'SU3'
  readonly L: number
  readonly Ls: number
  readonly Lt: number
  readonly V: number
  readonly E: number
  readonly T: number
  readonly beta: number
  readonly nTherm: number
  readonly nMeas: number
  readonly plaqMean: number
  readonly plaqErr: number
  readonly polyTemp: number
  readonly polySpat: number
  readonly w11: number
  readonly w21: number
  readonly w22: number
  readonly w31: number
  readonly w32: number
  readonly chi11: number | null
  readonly chi22: number | null
  readonly chi32: number | null
  readonly sigmaTri: number | null
  readonly orMaxDeltaP: number
  readonly elapsedSec: number
}

function runGaugePointSync(
  torus: D4BoxTorus,
  group: 'SU2' | 'SU3',
  beta: number,
  nTherm: number,
  nMeas: number,
  nOrPerHb: number,
  seed: number,
): GaugePointResult {
  const t0 = performance.now()
  const rng = makeMulberry32(seed)
  const hot = beta < 10.0
  const maxIJ = Math.min(3, torus.Ls / 2)

  if (group === 'SU2') {
    const links = initSu2Links(torus.E, hot, rng)
    const pBefore = measureSu2Plaq(torus, links)
    sweepSu2Overrelax(torus, links)
    const pAfter = measureSu2Plaq(torus, links)
    const orMaxDeltaP = Math.abs(pAfter - pBefore)

    for (let sw = 0; sw < nTherm; sw++) {
      sweepSu2Heatbath(torus, links, beta, rng)
      for (let r = 0; r < nOrPerHb; r++) sweepSu2Overrelax(torus, links)
    }

    const plaqs = new Float64Array(nMeas)
    let sumPolyT = 0, sumPolyS = 0, sumW11 = 0, sumW21 = 0, sumW22 = 0, sumW31 = 0, sumW32 = 0

    for (let m = 0; m < nMeas; m++) {
      sweepSu2Heatbath(torus, links, beta, rng)
      for (let r = 0; r < nOrPerHb; r++) sweepSu2Overrelax(torus, links)
      plaqs[m] = measureSu2Plaq(torus, links)
      const poly = measureSu2Polyakov(torus, links)
      sumPolyT += poly.tempAbs; sumPolyS += poly.spatAbs
      sumW11 += measureSu2WilsonLoop(torus, links, 1, 1)
      if (maxIJ >= 2) {
        sumW21 += 0.5 * (measureSu2WilsonLoop(torus, links, 2, 1) + measureSu2WilsonLoop(torus, links, 1, 2))
        sumW22 += measureSu2WilsonLoop(torus, links, 2, 2)
      }
      if (maxIJ >= 3) {
        sumW31 += 0.5 * (measureSu2WilsonLoop(torus, links, 3, 1) + measureSu2WilsonLoop(torus, links, 1, 3))
        sumW32 += 0.5 * (measureSu2WilsonLoop(torus, links, 3, 2) + measureSu2WilsonLoop(torus, links, 2, 3))
      }
    }

    let meanP = 0
    for (let m = 0; m < nMeas; m++) meanP += plaqs[m]!
    meanP /= nMeas
    const errP = binnedJackknifeErr(plaqs)

    const w11 = sumW11 / nMeas
    const w21 = maxIJ >= 2 ? sumW21 / nMeas : 0
    const w22 = maxIJ >= 2 ? sumW22 / nMeas : 0
    const w31 = maxIJ >= 3 ? sumW31 / nMeas : 0
    const w32 = maxIJ >= 3 ? sumW32 / nMeas : 0
    const chi11 = w11 > 1e-12 ? -Math.log(w11) : null
    const chi22 = maxIJ >= 2 && w22 > 1e-12 && w11 > 1e-12 && w21 > 1e-12 ? -Math.log((w22 * w11) / (w21 * w21)) : null
    const chi32 = maxIJ >= 3 && w32 > 1e-12 && w21 > 1e-12 && w31 > 1e-12 && w22 > 1e-12 ? -Math.log((w32 * w21) / (w31 * w22)) : null
    const sigmaTri = chi22 !== null && Number.isFinite(chi22) ? 0.5 * chi22 : null

    return {
      group, L: torus.Ls, Ls: torus.Ls, Lt: torus.Lt, V: torus.V, E: torus.E, T: torus.T, beta, nTherm, nMeas,
      plaqMean: meanP, plaqErr: errP, polyTemp: sumPolyT / nMeas, polySpat: sumPolyS / nMeas,
      w11, w21, w22, w31, w32, chi11, chi22, chi32, sigmaTri, orMaxDeltaP,
      elapsedSec: (performance.now() - t0) / 1000,
    }
  } else {
    const links = initSu3Links(torus.E, hot, rng)
    const pBefore = measureSu3Plaq(torus, links)
    sweepSu3Overrelax(torus, links)
    const pAfter = measureSu3Plaq(torus, links)
    const orMaxDeltaP = Math.abs(pAfter - pBefore)

    for (let sw = 0; sw < nTherm; sw++) {
      sweepSu3Heatbath(torus, links, beta, rng)
      for (let r = 0; r < nOrPerHb; r++) sweepSu3Overrelax(torus, links)
      if ((sw + 1) % 5 === 0) polishAllSu3(links, torus.E)
    }

    const plaqs = new Float64Array(nMeas)
    let sumPolyT = 0, sumPolyS = 0, sumW11 = 0, sumW21 = 0, sumW22 = 0, sumW31 = 0, sumW32 = 0

    for (let m = 0; m < nMeas; m++) {
      sweepSu3Heatbath(torus, links, beta, rng)
      for (let r = 0; r < nOrPerHb; r++) sweepSu3Overrelax(torus, links)
      if ((m + 1) % 5 === 0) polishAllSu3(links, torus.E)
      plaqs[m] = measureSu3Plaq(torus, links)
      const poly = measureSu3Polyakov(torus, links)
      sumPolyT += poly.tempAbs; sumPolyS += poly.spatAbs
      sumW11 += measureSu3WilsonLoop(torus, links, 1, 1)
      if (maxIJ >= 2) {
        sumW21 += 0.5 * (measureSu3WilsonLoop(torus, links, 2, 1) + measureSu3WilsonLoop(torus, links, 1, 2))
        sumW22 += measureSu3WilsonLoop(torus, links, 2, 2)
      }
      if (maxIJ >= 3) {
        sumW31 += 0.5 * (measureSu3WilsonLoop(torus, links, 3, 1) + measureSu3WilsonLoop(torus, links, 1, 3))
        sumW32 += 0.5 * (measureSu3WilsonLoop(torus, links, 3, 2) + measureSu3WilsonLoop(torus, links, 2, 3))
      }
    }

    let meanP = 0
    for (let m = 0; m < nMeas; m++) meanP += plaqs[m]!
    meanP /= nMeas
    const errP = binnedJackknifeErr(plaqs)

    const w11 = sumW11 / nMeas
    const w21 = maxIJ >= 2 ? sumW21 / nMeas : 0
    const w22 = maxIJ >= 2 ? sumW22 / nMeas : 0
    const w31 = maxIJ >= 3 ? sumW31 / nMeas : 0
    const w32 = maxIJ >= 3 ? sumW32 / nMeas : 0
    const chi11 = w11 > 1e-12 ? -Math.log(w11) : null
    const chi22 = maxIJ >= 2 && w22 > 1e-12 && w11 > 1e-12 && w21 > 1e-12 ? -Math.log((w22 * w11) / (w21 * w21)) : null
    const chi32 = maxIJ >= 3 && w32 > 1e-12 && w21 > 1e-12 && w31 > 1e-12 && w22 > 1e-12 ? -Math.log((w32 * w21) / (w31 * w22)) : null
    const sigmaTri = chi22 !== null && Number.isFinite(chi22) ? 0.5 * chi22 : null

    return {
      group, L: torus.Ls, Ls: torus.Ls, Lt: torus.Lt, V: torus.V, E: torus.E, T: torus.T, beta, nTherm, nMeas,
      plaqMean: meanP, plaqErr: errP, polyTemp: sumPolyT / nMeas, polySpat: sumPolyS / nMeas,
      w11, w21, w22, w31, w32, chi11, chi22, chi32, sigmaTri, orMaxDeltaP,
      elapsedSec: (performance.now() - t0) / 1000,
    }
  }
}

const GAUGE_WORKER_JS = `
const { parentPort, workerData } = require('node:worker_threads');
const PI = Math.PI;
const { tasks, torusPack } = workerData;

function makeRng(seed0) {
  let state = seed0 >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) + 0.5) / 4294967296;
  };
  const nextGauss = () => Math.sqrt(-2 * Math.log(next())) * Math.cos(2 * PI * next());
  return { next, nextGauss };
}

function kpDrawX0(alpha, rng) {
  if (alpha < 0.05) {
    for (let it = 0; it < 500; it++) {
      const x = 2 * rng.next() - 1;
      if (rng.next() <= Math.sqrt(Math.max(0, 1 - x * x)) * Math.exp(alpha * (x - 1))) return x;
    }
    return 0;
  }
  for (let it = 0; it < 300; it++) {
    const r1 = rng.next(), r2 = rng.next(), r3 = rng.next();
    const c = Math.cos(2 * PI * r2);
    const lamSq = -(Math.log(r1) + c * c * Math.log(r3)) / (2 * alpha);
    if (lamSq <= 1) {
      const r4 = rng.next();
      if (r4 * r4 <= 1 - lamSq) return 1 - 2 * lamSq;
    }
  }
  for (let it = 0; it < 500; it++) {
    const x = 2 * rng.next() - 1;
    if (rng.next() <= Math.sqrt(Math.max(0, 1 - x * x)) * Math.exp(alpha * (x - 1))) return x;
  }
  return 0;
}

function kpSu2Draw(a0, a1, a2, a3, betaSub, rng) {
  const k = Math.hypot(a0, a1, a2, a3);
  if (k < 1e-13) {
    const g0 = rng.nextGauss(), g1 = rng.nextGauss(), g2 = rng.nextGauss(), g3 = rng.nextGauss();
    const inv = 1 / Math.hypot(g0, g1, g2, g3);
    return [g0 * inv, g1 * inv, g2 * inv, g3 * inv];
  }
  const x0 = kpDrawX0(betaSub * k, rng);
  const rad = Math.sqrt(Math.max(0, 1 - x0 * x0));
  const u = 2 * rng.next() - 1;
  const phi = 2 * PI * rng.next();
  const s = Math.sqrt(Math.max(0, 1 - u * u));
  const q0 = x0, q1 = rad * s * Math.cos(phi), q2 = rad * s * Math.sin(phi), q3 = rad * u;
  const invK = 1 / k;
  const v0 = a0 * invK, v1 = a1 * invK, v2 = a2 * invK, v3 = a3 * invK;
  return [
    q0 * v0 - q1 * v1 - q2 * v2 - q3 * v3,
    q0 * v1 + q1 * v0 + q2 * v3 - q3 * v2,
    q0 * v2 - q1 * v3 + q2 * v0 + q3 * v1,
    q0 * v3 + q1 * v2 - q2 * v1 + q3 * v0,
  ];
}

function m3PolishAt(arr, off) {
  let n0 = 0;
  for (let j = 0; j < 6; j++) n0 += arr[off + j] * arr[off + j];
  const i0 = 1 / Math.sqrt(n0);
  for (let j = 0; j < 6; j++) arr[off + j] *= i0;
  let dR = 0, dI = 0;
  for (let j = 0; j < 3; j++) {
    const r0 = arr[off + 2 * j], i0v = arr[off + 2 * j + 1];
    const r1 = arr[off + 6 + 2 * j], i1v = arr[off + 6 + 2 * j + 1];
    dR += r0 * r1 + i0v * i1v;
    dI += r0 * i1v - i0v * r1;
  }
  for (let j = 0; j < 3; j++) {
    const r0 = arr[off + 2 * j], i0v = arr[off + 2 * j + 1];
    arr[off + 6 + 2 * j] -= (dR * r0 - dI * i0v);
    arr[off + 6 + 2 * j + 1] -= (dR * i0v + dI * r0);
  }
  let n1 = 0;
  for (let j = 6; j < 12; j++) n1 += arr[off + j] * arr[off + j];
  const i1 = 1 / Math.sqrt(n1);
  for (let j = 6; j < 12; j++) arr[off + j] *= i1;
  const a0r = arr[off], a0i = arr[off + 1], a1r = arr[off + 2], a1i = arr[off + 3], a2r = arr[off + 4], a2i = arr[off + 5];
  const b0r = arr[off + 6], b0i = arr[off + 7], b1r = arr[off + 8], b1i = arr[off + 9], b2r = arr[off + 10], b2i = arr[off + 11];
  arr[off + 12] = (a1r * b2r - a1i * b2i) - (a2r * b1r - a2i * b1i);
  arr[off + 13] = -((a1r * b2i + a1i * b2r) - (a2r * b1i + a2i * b1r));
  arr[off + 14] = (a2r * b0r - a2i * b0i) - (a0r * b2r - a0i * b2i);
  arr[off + 15] = -((a2r * b0i + a2i * b0r) - (a0r * b2i + a0i * b2r));
  arr[off + 16] = (a0r * b1r - a0i * b1i) - (a1r * b0r - a1i * b0i);
  arr[off + 17] = -((a0r * b1i + a0i * b1r) - (a1r * b0i + a1i * b0r));
}

function m3MulFlat(A, oA, sA, B, oB, sB, out) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0, si = 0;
      for (let k = 0; k < 3; k++) {
        const ia = oA + (sA === 1 ? (i * 3 + k) * 2 : (k * 3 + i) * 2);
        const ib = oB + (sB === 1 ? (k * 3 + j) * 2 : (j * 3 + k) * 2);
        const ar = A[ia], ai = sA === 1 ? A[ia + 1] : -A[ia + 1];
        const br = B[ib], bi = sB === 1 ? B[ib + 1] : -B[ib + 1];
        sr += ar * br - ai * bi;
        si += ar * bi + ai * br;
      }
      const oi = (i * 3 + j) * 2;
      out[oi] = sr; out[oi + 1] = si;
    }
  }
}

const tp = torusPack;
const SUBPAIRS = [[0, 1], [0, 2], [1, 2]];
const results = [];

for (const task of tasks) {
  const t0 = performance.now();
  const rng = makeRng(task.seed);
  const { group, beta, nTherm, nMeas, nOrPerHb } = task;
  const hot = beta < 10.0;
  const maxIJ = Math.min(3, tp.Ls / 2);

  if (group === 'SU2') {
    const links = new Float64Array(tp.E * 4);
    for (let e = 0; e < tp.E; e++) {
      const o = e * 4;
      if (!hot) { links[o] = 1; } else {
        const g0 = rng.nextGauss(), g1 = rng.nextGauss(), g2 = rng.nextGauss(), g3 = rng.nextGauss();
        const inv = 1 / Math.hypot(g0, g1, g2, g3);
        links[o] = g0 * inv; links[o + 1] = g1 * inv; links[o + 2] = g2 * inv; links[o + 3] = g3 * inv;
      }
    }
    const staple = (e) => {
      let a0 = 0, a1 = 0, a2 = 0, a3 = 0;
      const base = e * 8;
      for (let k = 0; k < 8; k++) {
        const o1 = tp.stapleE1[base + k] * 4, s1 = tp.stapleS1[base + k];
        const o2 = tp.stapleE2[base + k] * 4, s2 = tp.stapleS2[base + k];
        const u0 = links[o1], u1 = s1 * links[o1 + 1], u2 = s1 * links[o1 + 2], u3 = s1 * links[o1 + 3];
        const v0 = links[o2], v1 = s2 * links[o2 + 1], v2 = s2 * links[o2 + 2], v3 = s2 * links[o2 + 3];
        a0 += u0 * v0 - u1 * v1 - u2 * v2 - u3 * v3;
        a1 -= u0 * v1 + u1 * v0 + u2 * v3 - u3 * v2;
        a2 -= u0 * v2 - u1 * v3 + u2 * v0 + u3 * v1;
        a3 -= u0 * v3 + u1 * v2 - u2 * v1 + u3 * v0;
      }
      return [a0, a1, a2, a3];
    };
    const hb = () => {
      for (let e = 0; e < tp.E; e++) {
        const [a0, a1, a2, a3] = staple(e);
        const [u0, u1, u2, u3] = kpSu2Draw(a0, a1, a2, a3, beta, rng);
        const o = e * 4;
        links[o] = u0; links[o + 1] = u1; links[o + 2] = u2; links[o + 3] = u3;
      }
    };
    const or = () => {
      for (let e = 0; e < tp.E; e++) {
        const [a0, a1, a2, a3] = staple(e);
        const k2 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        if (k2 < 1e-24) continue;
        const o = e * 4;
        const u0 = links[o], u1 = links[o + 1], u2 = links[o + 2], u3 = links[o + 3];
        const fac = (2 * (u0 * a0 + u1 * a1 + u2 * a2 + u3 * a3)) / k2;
        const n0 = fac * a0 - u0, n1 = fac * a1 - u1, n2 = fac * a2 - u2, n3 = fac * a3 - u3;
        const inv = 1 / Math.hypot(n0, n1, n2, n3);
        links[o] = n0 * inv; links[o + 1] = n1 * inv; links[o + 2] = n2 * inv; links[o + 3] = n3 * inv;
      }
    };
    const plaq = () => {
      let sum = 0;
      for (let i = 0; i < tp.T; i++) {
        const o0 = tp.triE0[i] * 4, s0 = tp.triS0[i];
        const o1 = tp.triE1[i] * 4, s1 = tp.triS1[i];
        const o2 = tp.triE2[i] * 4, s2 = tp.triS2[i];
        const a0 = links[o0], a1 = s0 * links[o0 + 1], a2 = s0 * links[o0 + 2], a3 = s0 * links[o0 + 3];
        const b0 = links[o1], b1 = s1 * links[o1 + 1], b2 = s1 * links[o1 + 2], b3 = s1 * links[o1 + 3];
        const c0 = links[o2], c1 = s2 * links[o2 + 1], c2 = s2 * links[o2 + 2], c3 = s2 * links[o2 + 3];
        const p0 = a0 * b0 - a1 * b1 - a2 * b2 - a3 * b3;
        const p1 = a0 * b1 + a1 * b0 + a2 * b3 - a3 * b2;
        const p2 = a0 * b2 - a1 * b3 + a2 * b0 + a3 * b1;
        const p3 = a0 * b3 + a1 * b2 - a2 * b1 + a3 * b0;
        sum += p0 * c0 - p1 * c1 - p2 * c2 - p3 * c3;
      }
      return sum / tp.T;
    };
    const wloop = (I, J) => {
      let sum = 0;
      const nP = tp.a2Planes.length;
      for (let p = 0; p < nP; p++) {
        const d1 = tp.a2Planes[p][0], d2 = tp.a2Planes[p][1];
        const d1m = tp.oppDir[d1], d2m = tp.oppDir[d2];
        for (let s0 = 0; s0 < tp.V; s0++) {
          let s = s0, q0 = 1, q1 = 0, q2 = 0, q3 = 0;
          const step = (dir) => {
            const idx = s * 24 + dir, eo = tp.stepEdge[idx] * 4, sg = tp.stepSign[idx];
            const u0 = links[eo], u1 = sg * links[eo + 1], u2 = sg * links[eo + 2], u3 = sg * links[eo + 3];
            const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3;
            const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2;
            const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1;
            const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0;
            q0 = n0; q1 = n1; q2 = n2; q3 = n3; s = tp.stepNext[idx];
          };
          for (let k = 0; k < I; k++) step(d1);
          for (let k = 0; k < J; k++) step(d2);
          for (let k = 0; k < I; k++) step(d1m);
          for (let k = 0; k < J; k++) step(d2m);
          sum += q0;
        }
      }
      return sum / (tp.V * nP);
    };
    const poly = () => {
      let sumT = 0;
      for (let i = 0; i < tp.t0Sites.length; i++) {
        let s = tp.t0Sites[i], q0 = 1, q1 = 0, q2 = 0, q3 = 0;
        for (let st = 0; st < tp.Lt; st++) {
          const dir = (st & 1) === 0 ? tp.zigDirA : tp.zigDirB;
          const idx = s * 24 + dir, eo = tp.stepEdge[idx] * 4, sg = tp.stepSign[idx];
          const u0 = links[eo], u1 = sg * links[eo + 1], u2 = sg * links[eo + 2], u3 = sg * links[eo + 3];
          const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3;
          const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2;
          const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1;
          const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0;
          q0 = n0; q1 = n1; q2 = n2; q3 = n3; s = tp.stepNext[idx];
        }
        sumT += q0;
      }
      let sumS = 0;
      for (let s0 = 0; s0 < tp.V; s0++) {
        let s = s0, q0 = 1, q1 = 0, q2 = 0, q3 = 0;
        for (let st = 0; st < tp.Ls; st++) {
          const idx = s * 24 + tp.spatialDir, eo = tp.stepEdge[idx] * 4, sg = tp.stepSign[idx];
          const u0 = links[eo], u1 = sg * links[eo + 1], u2 = sg * links[eo + 2], u3 = sg * links[eo + 3];
          const n0 = q0 * u0 - q1 * u1 - q2 * u2 - q3 * u3;
          const n1 = q0 * u1 + q1 * u0 + q2 * u3 - q3 * u2;
          const n2 = q0 * u2 - q1 * u3 + q2 * u0 + q3 * u1;
          const n3 = q0 * u3 + q1 * u2 - q2 * u1 + q3 * u0;
          q0 = n0; q1 = n1; q2 = n2; q3 = n3; s = tp.stepNext[idx];
        }
        sumS += q0;
      }
      return { tempAbs: Math.abs(sumT / tp.t0Sites.length), spatAbs: Math.abs(sumS / tp.V) };
    };
    const pB = plaq(); or(); const pA = plaq(); const orMaxDeltaP = Math.abs(pA - pB);
    for (let sw = 0; sw < nTherm; sw++) { hb(); for (let r = 0; r < nOrPerHb; r++) or(); }
    const ps = new Float64Array(nMeas);
    let sPT = 0, sPS = 0, sW11 = 0, sW21 = 0, sW22 = 0, sW31 = 0, sW32 = 0;
    for (let m = 0; m < nMeas; m++) {
      hb(); for (let r = 0; r < nOrPerHb; r++) or();
      ps[m] = plaq();
      const po = poly(); sPT += po.tempAbs; sPS += po.spatAbs;
      sW11 += wloop(1, 1);
      if (maxIJ >= 2) { sW21 += 0.5 * (wloop(2, 1) + wloop(1, 2)); sW22 += wloop(2, 2); }
      if (maxIJ >= 3) { sW31 += 0.5 * (wloop(3, 1) + wloop(1, 3)); sW32 += 0.5 * (wloop(3, 2) + wloop(2, 3)); }
    }
    let mP = 0; for (let m = 0; m < nMeas; m++) mP += ps[m]; mP /= nMeas;
    const nBins = nMeas >= 8 ? Math.min(10, Math.max(4, Math.floor(nMeas / 4))) : nMeas;
    const binLen = Math.floor(nMeas / nBins), bMeans = new Float64Array(nBins);
    let bTot = 0;
    for (let b = 0; b < nBins; b++) {
      const st = b * binLen, en = b === nBins - 1 ? nMeas : st + binLen;
      let ss = 0; for (let i = st; i < en; i++) ss += ps[i];
      bMeans[b] = ss / (en - st); bTot += bMeans[b];
    }
    const bGrand = bTot / nBins; let bVar = 0;
    for (let b = 0; b < nBins; b++) { const loo = (bTot - bMeans[b]) / (nBins - 1); bVar += (loo - bGrand) ** 2; }
    const eP = nBins > 1 ? Math.sqrt(((nBins - 1) / nBins) * bVar) : 0;
    const w11 = sW11 / nMeas, w21 = maxIJ >= 2 ? sW21 / nMeas : 0, w22 = maxIJ >= 2 ? sW22 / nMeas : 0, w31 = maxIJ >= 3 ? sW31 / nMeas : 0, w32 = maxIJ >= 3 ? sW32 / nMeas : 0;
    const chi11 = w11 > 1e-12 ? -Math.log(w11) : null;
    const chi22 = maxIJ >= 2 && w22 > 1e-12 && w11 > 1e-12 && w21 > 1e-12 ? -Math.log((w22 * w11) / (w21 * w21)) : null;
    const chi32 = maxIJ >= 3 && w32 > 1e-12 && w21 > 1e-12 && w31 > 1e-12 && w22 > 1e-12 ? -Math.log((w32 * w21) / (w31 * w22)) : null;
    const sigmaTri = chi22 !== null && Number.isFinite(chi22) ? 0.5 * chi22 : null;
    results.push({
      group, L: tp.Ls, Ls: tp.Ls, Lt: tp.Lt, V: tp.V, E: tp.E, T: tp.T, beta, nTherm, nMeas,
      plaqMean: mP, plaqErr: eP, polyTemp: sPT / nMeas, polySpat: sPS / nMeas,
      w11, w21, w22, w31, w32, chi11, chi22, chi32, sigmaTri, orMaxDeltaP,
      elapsedSec: (performance.now() - t0) / 1000,
    });
  } else {
    const links = new Float64Array(tp.E * 18);
    for (let e = 0; e < tp.E; e++) {
      const o = e * 18;
      if (!hot) { links[o] = 1; links[o + 8] = 1; links[o + 16] = 1; }
      else { for (let k = 0; k < 12; k++) links[o + k] = rng.nextGauss(); m3PolishAt(links, o); }
    }
    const stBuf = new Float64Array(18), tmp = new Float64Array(18), M = new Float64Array(18);
    const cur = new Float64Array(18), nxt = new Float64Array(18);
    const staple = (e) => {
      stBuf.fill(0);
      const base = e * 8;
      for (let k = 0; k < 8; k++) {
        m3MulFlat(links, tp.stapleE1[base + k] * 18, tp.stapleS1[base + k], links, tp.stapleE2[base + k] * 18, tp.stapleS2[base + k], tmp);
        for (let j = 0; j < 18; j++) stBuf[j] += tmp[j];
      }
    };
    const betaSub = (2 * beta) / 3;
    const hb = () => {
      for (let e = 0; e < tp.E; e++) {
        staple(e);
        const uOff = e * 18;
        for (let sp = 0; sp < 3; sp++) {
          const p = SUBPAIRS[sp][0], q = SUBPAIRS[sp][1];
          m3MulFlat(links, uOff, 1, stBuf, 0, 1, M);
          const a0 = 0.5 * (M[(p * 3 + p) * 2] + M[(q * 3 + q) * 2]);
          const a1 = 0.5 * (M[(p * 3 + q) * 2 + 1] + M[(q * 3 + p) * 2 + 1]);
          const a2 = 0.5 * (M[(p * 3 + q) * 2] - M[(q * 3 + p) * 2]);
          const a3 = 0.5 * (M[(p * 3 + p) * 2 + 1] - M[(q * 3 + q) * 2 + 1]);
          const [r0, r1, r2, r3] = kpSu2Draw(a0, a1, a2, a3, betaSub, rng);
          const r00r = r0, r00i = -r3, r01r = -r2, r01i = -r1, r10r = r2, r10i = -r1, r11r = r0, r11i = r3;
          for (let col = 0; col < 3; col++) {
            const ip = uOff + (p * 3 + col) * 2, iq = uOff + (q * 3 + col) * 2;
            const upr = links[ip], upi = links[ip + 1], uqr = links[iq], uqi = links[iq + 1];
            links[ip] = r00r * upr - r00i * upi + (r01r * uqr - r01i * uqi);
            links[ip + 1] = r00r * upi + r00i * upr + (r01r * uqi + r01i * uqr);
            links[iq] = r10r * upr - r10i * upi + (r11r * uqr - r11i * uqi);
            links[iq + 1] = r10r * upi + r10i * upr + (r11r * uqi + r11i * uqr);
          }
        }
      }
    };
    const or = () => {
      for (let e = 0; e < tp.E; e++) {
        staple(e);
        const uOff = e * 18;
        for (let sp = 0; sp < 3; sp++) {
          const p = SUBPAIRS[sp][0], q = SUBPAIRS[sp][1];
          m3MulFlat(links, uOff, 1, stBuf, 0, 1, M);
          const a0 = 0.5 * (M[(p * 3 + p) * 2] + M[(q * 3 + q) * 2]);
          const a1 = 0.5 * (M[(p * 3 + q) * 2 + 1] + M[(q * 3 + p) * 2 + 1]);
          const a2 = 0.5 * (M[(p * 3 + q) * 2] - M[(q * 3 + p) * 2]);
          const a3 = 0.5 * (M[(p * 3 + p) * 2 + 1] - M[(q * 3 + q) * 2 + 1]);
          const k2 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
          if (k2 < 1e-24) continue;
          const invK = 1 / Math.sqrt(k2);
          const h0 = a0 * invK, h1 = a1 * invK, h2 = a2 * invK, h3 = a3 * invK;
          const r0 = 2 * h0 * h0 - 1, r1 = 2 * h0 * h1, r2 = 2 * h0 * h2, r3 = 2 * h0 * h3;
          const r00r = r0, r00i = -r3, r01r = -r2, r01i = -r1, r10r = r2, r10i = -r1, r11r = r0, r11i = r3;
          for (let col = 0; col < 3; col++) {
            const ip = uOff + (p * 3 + col) * 2, iq = uOff + (q * 3 + col) * 2;
            const upr = links[ip], upi = links[ip + 1], uqr = links[iq], uqi = links[iq + 1];
            links[ip] = r00r * upr - r00i * upi + (r01r * uqr - r01i * uqi);
            links[ip + 1] = r00r * upi + r00i * upr + (r01r * uqi + r01i * uqr);
            links[iq] = r10r * upr - r10i * upi + (r11r * uqr - r11i * uqi);
            links[iq + 1] = r10r * upi + r10i * upr + (r11r * uqi + r11i * uqr);
          }
        }
      }
    };
    const plaq = () => {
      let sum = 0;
      for (let i = 0; i < tp.T; i++) {
        m3MulFlat(links, tp.triE0[i] * 18, tp.triS0[i], links, tp.triE1[i] * 18, tp.triS1[i], tmp);
        const o2 = tp.triE2[i] * 18, s2 = tp.triS2[i];
        let tr = 0;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const ia = (r * 3 + c) * 2;
            const ib = o2 + (s2 === 1 ? (c * 3 + r) * 2 : (r * 3 + c) * 2);
            const br = links[ib], bi = s2 === 1 ? links[ib + 1] : -links[ib + 1];
            tr += tmp[ia] * br - tmp[ia + 1] * bi;
          }
        }
        sum += tr / 3;
      }
      return sum / tp.T;
    };
    const wloop = (I, J) => {
      let sum = 0;
      const nP = tp.a2Planes.length;
      for (let p = 0; p < nP; p++) {
        const d1 = tp.a2Planes[p][0], d2 = tp.a2Planes[p][1];
        const d1m = tp.oppDir[d1], d2m = tp.oppDir[d2];
        for (let s0 = 0; s0 < tp.V; s0++) {
          let s = s0;
          cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1;
          const step = (dir) => {
            const idx = s * 24 + dir;
            m3MulFlat(cur, 0, 1, links, tp.stepEdge[idx] * 18, tp.stepSign[idx], nxt);
            cur.set(nxt); s = tp.stepNext[idx];
          };
          for (let k = 0; k < I; k++) step(d1);
          for (let k = 0; k < J; k++) step(d2);
          for (let k = 0; k < I; k++) step(d1m);
          for (let k = 0; k < J; k++) step(d2m);
          sum += (cur[0] + cur[8] + cur[16]) / 3;
        }
      }
      return sum / (tp.V * nP);
    };
    const poly = () => {
      let sTR = 0, sTI = 0;
      for (let i = 0; i < tp.t0Sites.length; i++) {
        let s = tp.t0Sites[i];
        cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1;
        for (let st = 0; st < tp.Lt; st++) {
          const dir = (st & 1) === 0 ? tp.zigDirA : tp.zigDirB;
          const idx = s * 24 + dir;
          m3MulFlat(cur, 0, 1, links, tp.stepEdge[idx] * 18, tp.stepSign[idx], nxt);
          cur.set(nxt); s = tp.stepNext[idx];
        }
        sTR += (cur[0] + cur[8] + cur[16]) / 3;
        sTI += (cur[1] + cur[9] + cur[17]) / 3;
      }
      let sSR = 0, sSI = 0;
      for (let s0 = 0; s0 < tp.V; s0++) {
        let s = s0;
        cur.fill(0); cur[0] = 1; cur[8] = 1; cur[16] = 1;
        for (let st = 0; st < tp.Ls; st++) {
          const idx = s * 24 + tp.spatialDir;
          m3MulFlat(cur, 0, 1, links, tp.stepEdge[idx] * 18, tp.stepSign[idx], nxt);
          cur.set(nxt); s = tp.stepNext[idx];
        }
        sSR += (cur[0] + cur[8] + cur[16]) / 3;
        sSI += (cur[1] + cur[9] + cur[17]) / 3;
      }
      return { tempAbs: Math.hypot(sTR / tp.t0Sites.length, sTI / tp.t0Sites.length), spatAbs: Math.hypot(sSR / tp.V, sSI / tp.V) };
    };
    const pB = plaq(); or(); const pA = plaq(); const orMaxDeltaP = Math.abs(pA - pB);
    for (let sw = 0; sw < nTherm; sw++) {
      hb(); for (let r = 0; r < nOrPerHb; r++) or();
      if ((sw + 1) % 5 === 0) for (let e = 0; e < tp.E; e++) m3PolishAt(links, e * 18);
    }
    const ps = new Float64Array(nMeas);
    let sPT = 0, sPS = 0, sW11 = 0, sW21 = 0, sW22 = 0, sW31 = 0, sW32 = 0;
    for (let m = 0; m < nMeas; m++) {
      hb(); for (let r = 0; r < nOrPerHb; r++) or();
      if ((m + 1) % 5 === 0) for (let e = 0; e < tp.E; e++) m3PolishAt(links, e * 18);
      ps[m] = plaq();
      const po = poly(); sPT += po.tempAbs; sPS += po.spatAbs;
      sW11 += wloop(1, 1);
      if (maxIJ >= 2) { sW21 += 0.5 * (wloop(2, 1) + wloop(1, 2)); sW22 += wloop(2, 2); }
      if (maxIJ >= 3) { sW31 += 0.5 * (wloop(3, 1) + wloop(1, 3)); sW32 += 0.5 * (wloop(3, 2) + wloop(2, 3)); }
    }
    let mP = 0; for (let m = 0; m < nMeas; m++) mP += ps[m]; mP /= nMeas;
    const nBins = nMeas >= 8 ? Math.min(10, Math.max(4, Math.floor(nMeas / 4))) : nMeas;
    const binLen = Math.floor(nMeas / nBins), bMeans = new Float64Array(nBins);
    let bTot = 0;
    for (let b = 0; b < nBins; b++) {
      const st = b * binLen, en = b === nBins - 1 ? nMeas : st + binLen;
      let ss = 0; for (let i = st; i < en; i++) ss += ps[i];
      bMeans[b] = ss / (en - st); bTot += bMeans[b];
    }
    const bGrand = bTot / nBins; let bVar = 0;
    for (let b = 0; b < nBins; b++) { const loo = (bTot - bMeans[b]) / (nBins - 1); bVar += (loo - bGrand) ** 2; }
    const eP = nBins > 1 ? Math.sqrt(((nBins - 1) / nBins) * bVar) : 0;
    const w11 = sW11 / nMeas, w21 = maxIJ >= 2 ? sW21 / nMeas : 0, w22 = maxIJ >= 2 ? sW22 / nMeas : 0, w31 = maxIJ >= 3 ? sW31 / nMeas : 0, w32 = maxIJ >= 3 ? sW32 / nMeas : 0;
    const chi11 = w11 > 1e-12 ? -Math.log(w11) : null;
    const chi22 = maxIJ >= 2 && w22 > 1e-12 && w11 > 1e-12 && w21 > 1e-12 ? -Math.log((w22 * w11) / (w21 * w21)) : null;
    const chi32 = maxIJ >= 3 && w32 > 1e-12 && w21 > 1e-12 && w31 > 1e-12 && w22 > 1e-12 ? -Math.log((w32 * w21) / (w31 * w22)) : null;
    const sigmaTri = chi22 !== null && Number.isFinite(chi22) ? 0.5 * chi22 : null;
    results.push({
      group, L: tp.Ls, Ls: tp.Ls, Lt: tp.Lt, V: tp.V, E: tp.E, T: tp.T, beta, nTherm, nMeas,
      plaqMean: mP, plaqErr: eP, polyTemp: sPT / nMeas, polySpat: sPS / nMeas,
      w11, w21, w22, w31, w32, chi11, chi22, chi32, sigmaTri, orMaxDeltaP,
      elapsedSec: (performance.now() - t0) / 1000,
    });
  }
}
parentPort.postMessage(results);
`

type GaugeTask = {
  readonly group: 'SU2' | 'SU3'
  readonly beta: number
  readonly nTherm: number
  readonly nMeas: number
  readonly nOrPerHb: number
  readonly seed: number
}

async function runGaugeTasksParallel(torus: D4BoxTorus, tasks: readonly GaugeTask[]): Promise<GaugePointResult[]> {
  if (!IS_FULL || tasks.length <= 1) {
    return tasks.map(t => runGaugePointSync(torus, t.group, t.beta, t.nTherm, t.nMeas, t.nOrPerHb, t.seed))
  }
  const nW = Math.min(N_WORKERS, tasks.length)
  const buckets: GaugeTask[][] = Array.from({ length: nW }, () => [])
  for (let i = 0; i < tasks.length; i++) buckets[i % nW]!.push(tasks[i]!)

  const torusPack = {
    Ls: torus.Ls, Lt: torus.Lt, V: torus.V, E: torus.E, T: torus.T,
    oppDir: torus.oppDir, stepEdge: torus.stepEdge, stepSign: torus.stepSign, stepNext: torus.stepNext,
    triE0: torus.triE0, triS0: torus.triS0, triE1: torus.triE1, triS1: torus.triS1, triE2: torus.triE2, triS2: torus.triS2,
    stapleE1: torus.stapleE1, stapleS1: torus.stapleS1, stapleE2: torus.stapleE2, stapleS2: torus.stapleS2,
    a2Planes: torus.a2Planes, zigDirA: torus.zigDirA, zigDirB: torus.zigDirB, spatialDir: torus.spatialDir, t0Sites: torus.t0Sites,
  }

  const promises = buckets.map(
    bucket =>
      new Promise<GaugePointResult[]>((resolve, reject) => {
        const w = new Worker(GAUGE_WORKER_JS, { eval: true, workerData: { tasks: bucket, torusPack } })
        w.on('message', (res: GaugePointResult[]) => resolve(res))
        w.on('error', reject)
        w.on('exit', code => {
          if (code !== 0) reject(new Error(`Gauge worker exited with code ${code}`))
        })
      }),
  )
  const chunks = await Promise.all(promises)
  const flat: GaugePointResult[] = new Array<GaugePointResult>(tasks.length)
  for (let b = 0; b < nW; b++) {
    const ch = chunks[b]!
    for (let j = 0; j < ch.length; j++) flat[j * nW + b] = ch[j]!
  }
  return flat
}

// =================================================================================================
// SECTION 5: PART 1 RUNNER - D_4 LATTICE SU(2)/SU(3) MONTE CARLO & QUENCHED NAIVE D_4 FERMIONS
// =================================================================================================

type FermionMassRow = {
  readonly mq: number
  readonly pbpPt: number
  readonly pbpPtErr: number
  readonly pbpStoch: number
  readonly pbpStochErr: number
  readonly pbpFree: number
  readonly mPi: number
  readonly mPiErr: number
  readonly mRho: number
  readonly mRhoErr: number
  readonly mRhoOscRatio: number
  readonly mRhoFitRelRms: number
  readonly mPiOverMRho: number
  readonly mPiOverMRhoErr: number
  readonly wtiMaxErr: number
  readonly cPi: number[]
  readonly cRho: number[]
}

type Part1Summary = {
  readonly mode: string
  readonly tier: string
  readonly fermionDiscretization: string
  readonly censusL4: { readonly V: number; readonly E: number; readonly T: number }
  readonly censusL6: { readonly V: number; readonly E: number; readonly T: number }
  readonly gaugeRuns: readonly GaugePointResult[]
  readonly strongCouplingChecks: {
    readonly su2Beta: number
    readonly su2Measured: number
    readonly su2Exact: number
    readonly su2RelErr: number
    readonly su3Beta: number
    readonly su3Measured: number
    readonly su3Exact: number
    readonly su3RelErr: number
  }
  readonly weakCouplingCheck: {
    readonly beta: number
    readonly L: number
    readonly measured: number
    readonly oneLoopT4Pred: number
    readonly absDiff: number
  }
  readonly freeFieldChecks: {
    readonly L: number
    readonly adjIdentityErr: number
    readonly freeDispLamPhysK0: number
    readonly freeDispLamMinDoubler: number
    readonly freePbpNormAnalytical: number
    readonly freePbpNormCg: number
    readonly freePbpRelErr: number
    readonly freeWtiErr: number
  }
  readonly fermionBeta: number
  readonly fermionL: number
  readonly fermionConfigs: number
  readonly fermionSpectrum: readonly FermionMassRow[]
  readonly gmorR2: number
  readonly gmorIntercept: number
  readonly chiralCondensateExtrap: number
  readonly elapsedSec: number
}

function linReg(xs: readonly number[], ys: readonly number[]): { readonly intercept: number; readonly slope: number; readonly r2: number } {
  const n = xs.length
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (let i = 0; i < n; i++) { sx += xs[i]!; sy += ys[i]!; sxx += xs[i]! * xs[i]!; sxy += xs[i]! * ys[i]! }
  const mx = sx / n, my = sy / n
  const slope = (sxy - n * mx * my) / Math.max(1e-30, sxx - n * mx * mx)
  const intercept = my - slope * mx
  let ssTot = 0, ssRes = 0
  for (let i = 0; i < n; i++) {
    ssTot += (ys[i]! - my) ** 2
    ssRes += (ys[i]! - (intercept + slope * xs[i]!)) ** 2
  }
  return { intercept, slope, r2: ssTot > 1e-30 ? 1 - ssRes / ssTot : 1 }
}

async function runPart1D4LatticeQcd(): Promise<Part1Summary> {
  const t0 = performance.now()
  console.log('\n=================================================================================')
  console.log(`PART 1 (${MODE_LABEL}, Tier B/C): 4D D_4 LATTICE SU(2)/SU(3) MC & QUENCHED NAIVE D_4 FERMIONS`)
  console.log('  [Disclosure] Fermion operator is quenched naive 4D D_4 (40 species/doublers: physical c=1')
  console.log('               at k=0, c=1/3 at doublers e.g. (pi,pi,0,k_t)); <pbp> normalized by 1/(4 N_c).')
  console.log('=================================================================================')

  const torusL4 = buildD4BoxTorus(4, 8)
  const torusL6 = buildD4BoxTorus(6, 12)
  assert(torusL4.V === 256 && torusL4.E === 3072 && torusL4.T === 8192, 'L=4 census mismatch')
  assert(torusL6.V === 1296 && torusL6.E === 15552 && torusL6.T === 41472, 'L=6 census mismatch')
  console.log('  Verified exact D_4 torus geometry:')
  console.log(`    L=4 (4^3 x 8)  : V=${torusL4.V} sites, E=${torusL4.E} links, T=${torusL4.T} triangles, 8 staples/link`)
  console.log(`    L=6 (6^3 x 12) : V=${torusL6.V} sites, E=${torusL6.E} links, T=${torusL6.T} triangles, 8 staples/link`)

  const allGaugeRuns: GaugePointResult[] = []

  if (!IS_FULL) {
    const torusL2 = buildD4BoxTorus(2, 4)
    const smokeTasks: GaugeTask[] = [
      { group: 'SU2', beta: 0.2, nTherm: 20, nMeas: 240, nOrPerHb: 1, seed: 601001 },
      { group: 'SU2', beta: 1.6, nTherm: 20, nMeas: 20, nOrPerHb: 2, seed: 601002 },
      { group: 'SU2', beta: 2.6, nTherm: 20, nMeas: 20, nOrPerHb: 2, seed: 601003 },
      { group: 'SU3', beta: 0.2, nTherm: 20, nMeas: 100, nOrPerHb: 1, seed: 602001 },
      { group: 'SU3', beta: 2.8, nTherm: 20, nMeas: 16, nOrPerHb: 2, seed: 602002 },
      { group: 'SU3', beta: 3.4, nTherm: 20, nMeas: 16, nOrPerHb: 2, seed: 602003 },
      { group: 'SU3', beta: 20.0, nTherm: 20, nMeas: 16, nOrPerHb: 2, seed: 602004 },
    ]
    allGaugeRuns.push(...(await runGaugeTasksParallel(torusL2, smokeTasks)))
  } else {
    const tasksL4: GaugeTask[] = [
      { group: 'SU2', beta: 0.2, nTherm: 50, nMeas: 80, nOrPerHb: 1, seed: 610101 },
      { group: 'SU2', beta: 1.0, nTherm: 60, nMeas: 60, nOrPerHb: 2, seed: 610102 },
      { group: 'SU2', beta: 1.6, nTherm: 70, nMeas: 60, nOrPerHb: 2, seed: 610103 },
      { group: 'SU2', beta: 2.0, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610104 },
      { group: 'SU2', beta: 2.4, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610105 },
      { group: 'SU2', beta: 3.0, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610106 },
      { group: 'SU2', beta: 20.0, nTherm: 60, nMeas: 50, nOrPerHb: 2, seed: 610107 },
      { group: 'SU3', beta: 0.2, nTherm: 50, nMeas: 80, nOrPerHb: 1, seed: 610201 },
      { group: 'SU3', beta: 1.2, nTherm: 60, nMeas: 60, nOrPerHb: 2, seed: 610202 },
      { group: 'SU3', beta: 2.4, nTherm: 70, nMeas: 60, nOrPerHb: 2, seed: 610203 },
      { group: 'SU3', beta: 2.9, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610204 },
      { group: 'SU3', beta: 3.1, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610205 },
      { group: 'SU3', beta: 3.4, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610206 },
      { group: 'SU3', beta: 3.8, nTherm: 80, nMeas: 60, nOrPerHb: 2, seed: 610207 },
      { group: 'SU3', beta: 20.0, nTherm: 60, nMeas: 50, nOrPerHb: 2, seed: 610208 },
    ]
    console.log(`  Running L=4 (${torusL4.V} sites, ${torusL4.E} links, ${torusL4.T} tris) across ${N_WORKERS} worker threads...`)
    allGaugeRuns.push(...(await runGaugeTasksParallel(torusL4, tasksL4)))

    const tasksL6: GaugeTask[] = [
      { group: 'SU2', beta: 0.2, nTherm: 40, nMeas: 50, nOrPerHb: 1, seed: 620101 },
      { group: 'SU2', beta: 1.6, nTherm: 50, nMeas: 45, nOrPerHb: 2, seed: 620102 },
      { group: 'SU2', beta: 2.0, nTherm: 60, nMeas: 45, nOrPerHb: 2, seed: 620103 },
      { group: 'SU2', beta: 2.4, nTherm: 60, nMeas: 45, nOrPerHb: 2, seed: 620104 },
      { group: 'SU2', beta: 20.0, nTherm: 40, nMeas: 35, nOrPerHb: 2, seed: 620105 },
      { group: 'SU3', beta: 0.2, nTherm: 40, nMeas: 50, nOrPerHb: 1, seed: 620201 },
      { group: 'SU3', beta: 2.4, nTherm: 50, nMeas: 45, nOrPerHb: 2, seed: 620202 },
      { group: 'SU3', beta: 3.1, nTherm: 60, nMeas: 45, nOrPerHb: 2, seed: 620203 },
      { group: 'SU3', beta: 3.4, nTherm: 60, nMeas: 45, nOrPerHb: 2, seed: 620204 },
      { group: 'SU3', beta: 3.8, nTherm: 60, nMeas: 45, nOrPerHb: 2, seed: 620205 },
      { group: 'SU3', beta: 20.0, nTherm: 40, nMeas: 35, nOrPerHb: 2, seed: 620206 },
    ]
    console.log(`  Running L=6 (${torusL6.V} sites, ${torusL6.E} links, ${torusL6.T} tris) across ${N_WORKERS} worker threads...`)
    allGaugeRuns.push(...(await runGaugeTasksParallel(torusL6, tasksL6)))
  }

  let maxOrErr = 0
  for (const r of allGaugeRuns) {
    if (r.orMaxDeltaP > maxOrErr) maxOrErr = r.orMaxDeltaP
    const sStr = r.sigmaTri !== null ? r.sigmaTri.toFixed(4) : 'n/a'
    const c22Str = r.chi22 !== null ? r.chi22.toFixed(4) : 'n/a'
    console.log(
      `    ${r.group} L=${r.L} b=${r.beta.toFixed(1).padStart(4)}: <P_tri>=${r.plaqMean.toFixed(5)}+/-${r.plaqErr.toFixed(5)} | ` +
        `<|L_t|>=${r.polyTemp.toFixed(4)} | W11=${r.w11.toFixed(4)} | chi22=${c22Str} | sig_tri=${sStr} (${r.elapsedSec.toFixed(2)}s)`,
    )
  }

  const scSu2 = allGaugeRuns.find(r => r.group === 'SU2' && Math.abs(r.beta - 0.2) < 1e-6)!
  const scSu3 = allGaugeRuns.find(r => r.group === 'SU3' && Math.abs(r.beta - 0.2) < 1e-6)!
  const su2ExactSC = besselI(2, scSu2.beta) / besselI(1, scSu2.beta)
  const su3ExactSC = scSu3.beta / (2 * 9) + (scSu3.beta * scSu3.beta) / 216
  const su2RelErr = Math.abs(scSu2.plaqMean - su2ExactSC) / su2ExactSC
  const su3RelErr = Math.abs(scSu3.plaqMean - su3ExactSC) / su3ExactSC
  console.log(
    `  [NegCtrl Strong-Coupling b=0.2] SU(2): MC=${scSu2.plaqMean.toFixed(5)} vs Exact=${su2ExactSC.toFixed(5)} (relErr=${(su2RelErr * 100).toFixed(2)}%) | ` +
      `SU(3): MC=${scSu3.plaqMean.toFixed(5)} vs b/(2N_c^2)+b^2/216=${su3ExactSC.toFixed(5)} (relErr=${(su3RelErr * 100).toFixed(2)}%)`,
  )

  const wcSu3 = allGaugeRuns.find(r => r.group === 'SU3' && Math.abs(r.beta - 20.0) < 1e-6)!
  // Exact 1-loop weak-coupling plaquette on T^4 D_4: 12V links - (V-1) gauge - b_1(T^4)=4 harmonic zero modes = 11V - 3
  const wcPred = 1 - ((11 * 8) / (64 * wcSu3.beta)) * (1 - 3 / (11 * wcSu3.V))
  const wcErr = Math.abs(wcSu3.plaqMean - wcPred)
  console.log(
    `  [NegCtrl Weak-Coupling 1-Loop T^4 (b_1=4) b=20] SU(3) L=${wcSu3.L}: MC=${wcSu3.plaqMean.toFixed(5)} vs 1-loop=${wcPred.toFixed(5)} (|diff|=${wcErr.toFixed(5)})`,
  )

  const { sigR, sigBarR } = buildSigTables(torusL4.posR4)
  const rngF = makeMulberry32(202611281)
  const randLinksL4 = initSu3Links(torusL4.E, true, rngF)
  const nBlk4 = torusL4.V * 6
  const uR = new Float64Array(nBlk4), uI = new Float64Array(nBlk4)
  const vR = new Float64Array(nBlk4), vI = new Float64Array(nBlk4)
  const mvR = new Float64Array(nBlk4), mvI = new Float64Array(nBlk4)
  const mduR = new Float64Array(nBlk4), mduI = new Float64Array(nBlk4)
  for (let i = 0; i < nBlk4; i++) {
    uR[i] = rngF.nextGauss(); uI[i] = rngF.nextGauss()
    vR[i] = rngF.nextGauss(); vI[i] = rngF.nextGauss()
  }
  applyD4ChiralM(torusL4, randLinksL4, sigR, false, vR, vI, mvR, mvI)
  applyD4ChiralM(torusL4, randLinksL4, sigBarR, true, uR, uI, mduR, mduI)
  let lhsR = 0, lhsI = 0, rhsR = 0, rhsI = 0
  for (let i = 0; i < nBlk4; i++) {
    lhsR += uR[i]! * mvR[i]! + uI[i]! * mvI[i]!
    lhsI += uR[i]! * mvI[i]! - uI[i]! * mvR[i]!
    rhsR += mduR[i]! * vR[i]! + mduI[i]! * vI[i]!
    rhsI += mduR[i]! * vI[i]! - mduI[i]! * vR[i]!
  }
  const adjIdentityErr = Math.hypot(lhsR - rhsR, lhsI - rhsI) / Math.max(1, Math.hypot(lhsR, lhsI))

  const freeLinksL4 = initSu3Links(torusL4.E, false, rngF)
  const freeMq = 0.2
  const freeExact = exactFreeD4Dispersion(4, 8, freeMq)
  assert(Math.abs(freeExact.lamMinDoubler - Math.sin(PI / 8) / 3) < 1e-14, 'Free doubler lam_min mismatch')
  const freeMeas = measureD4FermionsOnConfig(torusL4, freeLinksL4, sigR, sigBarR, freeMq, 0, rngF)
  const freePbpRelErr = Math.abs(freeMeas.pbpExactPt - freeExact.pbpNorm) / freeExact.pbpNorm
  console.log(
    `  [NegCtrl Free-Field L=4 (4^3 x 8, U=I)] <u,Mv>=<M^dag u,v> err=${adjIdentityErr.toExponential(2)} | ` +
      `lam_phys(k=0)=${freeExact.lamPhysK0.toFixed(6)} (c=1 sin(pi/8)), lam_doubler=${freeExact.lamMinDoubler.toFixed(6)} (c=1/3 sin(pi/8)/3) | ` +
      `pbp/(4Nc)(0.2): CG=${freeMeas.pbpExactPt.toFixed(8)} vs Exact=${freeExact.pbpNorm.toFixed(8)} (relErr=${freePbpRelErr.toExponential(2)}, WTI=${freeMeas.wtiRelErr.toExponential(2)})`,
  )

  const fermTorus = IS_FULL ? torusL4 : buildD4BoxTorus(2, 6)
  const { sigR: fSigR, sigBarR: fSigBarR } = buildSigTables(fermTorus.posR4)
  const fermBeta = 3.1
  const nFermConfigs = IS_FULL ? 12 : 8
  const nStochNoise = IS_FULL ? 8 : 4
  const mqLadder = IS_FULL ? ([0.04, 0.08, 0.12, 0.2] as const) : ([0.04, 0.1, 0.2] as const)

  const fLinks = initSu3Links(fermTorus.E, true, rngF)
  const nFermTherm = IS_FULL ? 60 : 25
  const nFermSep = IS_FULL ? 10 : 6
  for (let sw = 0; sw < nFermTherm; sw++) {
    sweepSu3Heatbath(fermTorus, fLinks, fermBeta, rngF)
    sweepSu3Overrelax(fermTorus, fLinks)
    sweepSu3Overrelax(fermTorus, fLinks)
    if ((sw + 1) % 5 === 0) polishAllSu3(fLinks, fermTorus.E)
  }

  const fermConfigs: Float64Array[] = []
  let fermPlaqSum = 0
  for (let c = 0; c < nFermConfigs; c++) {
    for (let sw = 0; sw < nFermSep; sw++) {
      sweepSu3Heatbath(fermTorus, fLinks, fermBeta, rngF)
      sweepSu3Overrelax(fermTorus, fLinks)
      sweepSu3Overrelax(fermTorus, fLinks)
    }
    polishAllSu3(fLinks, fermTorus.E)
    fermPlaqSum += measureSu3Plaq(fermTorus, fLinks)
    fermConfigs.push(Float64Array.from(fLinks))
  }
  console.log(
    `  [Quenched Naive D_4 Fermion Spectroscopy L=${fermTorus.Ls} (${fermTorus.Ls}^3 x ${fermTorus.Lt}, V=${fermTorus.V}, beta=${fermBeta}, ${nFermConfigs} configs, <P_tri>=${(fermPlaqSum / nFermConfigs).toFixed(4)})]:`,
  )

  const fermionSpectrum: FermionMassRow[] = []
  let maxWtiFerm = 0
  let maxStochPtRelDiff = 0
  const halfT = fermTorus.Lt / 2
  const symCorr = (arr: Float64Array): number[] => {
    const out: number[] = []
    for (let tau = 0; tau <= halfT; tau++) {
      out.push(0.5 * (arr[tau]! + arr[(fermTorus.Lt - tau) % fermTorus.Lt]!))
    }
    return out
  }
  const jackknifeStd = (looVals: readonly number[], fullVal: number): number => {
    const n = looVals.length
    if (n <= 1) return 0
    let ss = 0
    for (let i = 0; i < n; i++) ss += (looVals[i]! - fullVal) ** 2
    return Math.sqrt(((n - 1) / n) * ss)
  }

  for (const mq of mqLadder) {
    const cPiSum = new Float64Array(fermTorus.Lt), cRhoSum = new Float64Array(fermTorus.Lt)
    const cPiPerCfg: Float64Array[] = [], cRhoPerCfg: Float64Array[] = []
    const pbpPtPerCfg = new Float64Array(nFermConfigs), pbpStochPerCfg = new Float64Array(nFermConfigs)
    let sumPbpPt = 0, sumPbpStoch = 0, wtiMq = 0
    for (let c = 0; c < nFermConfigs; c++) {
      const m = measureD4FermionsOnConfig(fermTorus, fermConfigs[c]!, fSigR, fSigBarR, mq, nStochNoise, rngF)
      cPiPerCfg.push(m.cPi); cRhoPerCfg.push(m.cRho)
      pbpPtPerCfg[c] = m.pbpExactPt; pbpStochPerCfg[c] = m.pbpStoch
      for (let t = 0; t < fermTorus.Lt; t++) {
        cPiSum[t] = cPiSum[t]! + m.cPi[t]!
        cRhoSum[t] = cRhoSum[t]! + m.cRho[t]!
      }
      sumPbpPt += m.pbpExactPt; sumPbpStoch += m.pbpStoch
      if (m.wtiRelErr > wtiMq) wtiMq = m.wtiRelErr
    }
    if (wtiMq > maxWtiFerm) maxWtiFerm = wtiMq
    const cPiAvg = new Float64Array(fermTorus.Lt), cRhoAvg = new Float64Array(fermTorus.Lt)
    for (let t = 0; t < fermTorus.Lt; t++) {
      cPiAvg[t] = cPiSum[t]! / nFermConfigs
      cRhoAvg[t] = cRhoSum[t]! / nFermConfigs
    }
    const symPiMean = symCorr(cPiAvg)
    const symRhoMean = symCorr(cRhoAvg)
    const mPi = solveCoshMassAt(symPiMean[halfT - 1]!, symPiMean[halfT]!, halfT - 1, fermTorus.Lt)
    const rhoFit = fitRhoOscillatingCosh(symRhoMean, fermTorus.Lt)
    const mRho = rhoFit.mRho
    const ratioFull = mPi / mRho

    const jkMPi: number[] = [], jkMRho: number[] = [], jkRatio: number[] = [], jkPbpPt: number[] = [], jkPbpStoch: number[] = []
    const tmpPi = new Float64Array(fermTorus.Lt), tmpRho = new Float64Array(fermTorus.Lt)
    for (let k = 0; k < nFermConfigs; k++) {
      const inv = 1 / (nFermConfigs - 1)
      for (let t = 0; t < fermTorus.Lt; t++) {
        tmpPi[t] = (cPiSum[t]! - cPiPerCfg[k]![t]!) * inv
        tmpRho[t] = (cRhoSum[t]! - cRhoPerCfg[k]![t]!) * inv
      }
      const sp = symCorr(tmpPi), sr = symCorr(tmpRho)
      const mpK = solveCoshMassAt(sp[halfT - 1]!, sp[halfT]!, halfT - 1, fermTorus.Lt)
      const mrK = fitRhoOscillatingCosh(sr, fermTorus.Lt).mRho
      jkMPi.push(mpK); jkMRho.push(mrK); jkRatio.push(mpK / mrK)
      jkPbpPt.push((sumPbpPt - pbpPtPerCfg[k]!) * inv)
      jkPbpStoch.push((sumPbpStoch - pbpStochPerCfg[k]!) * inv)
    }
    const pbpPtMean = sumPbpPt / nFermConfigs, pbpStochMean = sumPbpStoch / nFermConfigs
    const pbpPtErr = jackknifeStd(jkPbpPt, pbpPtMean)
    const pbpStochErr = jackknifeStd(jkPbpStoch, pbpStochMean)
    const mPiErr = jackknifeStd(jkMPi, mPi)
    const mRhoErr = jackknifeStd(jkMRho, mRho)
    const mPiOverMRhoErr = jackknifeStd(jkRatio, ratioFull)
    const stochRelDiff = Math.abs(pbpStochMean - pbpPtMean) / Math.max(1e-12, pbpPtMean)
    if (stochRelDiff > maxStochPtRelDiff) maxStochPtRelDiff = stochRelDiff

    const freeAtMq = exactFreeD4Dispersion(fermTorus.Ls, fermTorus.Lt, mq).pbpNorm
    const row: FermionMassRow = {
      mq, pbpPt: pbpPtMean, pbpPtErr, pbpStoch: pbpStochMean, pbpStochErr, pbpFree: freeAtMq,
      mPi, mPiErr, mRho, mRhoErr, mRhoOscRatio: rhoFit.oscRatio, mRhoFitRelRms: rhoFit.relRmsErr,
      mPiOverMRho: ratioFull, mPiOverMRhoErr, wtiMaxErr: wtiMq,
      cPi: Array.from(cPiAvg), cRho: Array.from(cRhoAvg),
    }
    fermionSpectrum.push(row)
    console.log(
      `    m_q=${mq.toFixed(2)}: <pbp>/(4Nc)=${row.pbpPt.toFixed(4)}+/-${row.pbpPtErr.toFixed(4)} stoch=${row.pbpStoch.toFixed(4)}+/-${row.pbpStochErr.toFixed(4)} (free=${row.pbpFree.toFixed(4)}) | ` +
        `m_pi=${row.mPi.toFixed(4)}+/-${row.mPiErr.toFixed(4)}, m_rho=${row.mRho.toFixed(4)}+/-${row.mRhoErr.toFixed(4)} (B/A=${row.mRhoOscRatio.toFixed(2)}), ` +
        `m_pi/m_rho=${row.mPiOverMRho.toFixed(4)}+/-${row.mPiOverMRhoErr.toFixed(4)} | WTI=${wtiMq.toExponential(1)}`,
    )
  }

  const gmorFit = linReg(fermionSpectrum.map(r => r.mq), fermionSpectrum.map(r => r.mPi * r.mPi))
  const pbpFit = linReg(fermionSpectrum.map(r => r.mq), fermionSpectrum.map(r => r.pbpPt))
  console.log(
    `  [Chiral Extrapolation] GMOR m_pi^2 = ${gmorFit.intercept.toFixed(4)} + ${gmorFit.slope.toFixed(3)} m_q (R^2=${gmorFit.r2.toFixed(5)}) | ` +
      `<psi_bar psi>/(4Nc)(m_q->0) = ${pbpFit.intercept.toFixed(4)} (> 0 SBCS; max stoch-vs-pt diff=${(maxStochPtRelDiff * 100).toFixed(1)}%)`,
  )

  recordGate(
    'G1.1',
    'Part 1',
    'D_4 torus census (L=4: 256/3072/8192, L=6: 1296/15552/41472) & exact overrelaxation invariance',
    torusL4.V === 256 && torusL6.V === 1296 && maxOrErr < 1e-12,
    `L=4 & L=6 exact census verified; max microcanonical OR |dP| = ${maxOrErr.toExponential(2)} (< 1e-12)`,
  )
  recordGate(
    'G1.2',
    'Part 1',
    'Strong-coupling & weak-coupling 1-loop T^4 (b_1=4) analytical negative controls (SU(2) & SU(3) on D_4)',
    su2RelErr < 0.08 && su3RelErr < 0.12 && wcErr < 0.02,
    `SC b=0.2 SU(2) relErr=${(su2RelErr * 100).toFixed(2)}%, SU(3) relErr=${(su3RelErr * 100).toFixed(2)}%; WC T^4 b=20 |diff|=${wcErr.toFixed(5)}`,
  )
  recordGate(
    'G1.3',
    'Part 1',
    'Matrix-free L=4 naive D_4 Dirac adjoint & exact free-field (U=I) dispersion/condensate control',
    adjIdentityErr < 1e-13 && freePbpRelErr < 1e-9 && freeMeas.wtiRelErr < 1e-9,
    `adjErr=${adjIdentityErr.toExponential(2)}, freePbpRelErr=${freePbpRelErr.toExponential(2)}, freeWTI=${freeMeas.wtiRelErr.toExponential(2)}`,
  )
  const lightest = fermionSpectrum[0]!
  const heaviest = fermionSpectrum[fermionSpectrum.length - 1]!
  recordGate(
    'G1.4',
    'Part 1',
    'Quenched naive D_4 SU(3) dynamical SBCS, stoch-vs-pt <pbp>, Axial WTI, GMOR & oscillating m_rho hierarchy',
    maxWtiFerm < 1e-9 &&
      pbpFit.intercept > 0.1 &&
      lightest.pbpPt > 2.0 * lightest.pbpFree &&
      maxStochPtRelDiff < 0.2 &&
      gmorFit.r2 > 0.985 &&
      lightest.mPi < lightest.mRho &&
      lightest.mPiOverMRho < heaviest.mPiOverMRho,
    `<pbp>/(4Nc)(0)=${pbpFit.intercept.toFixed(4)}, stoch-vs-pt<=${(maxStochPtRelDiff * 100).toFixed(1)}%, GMOR R^2=${gmorFit.r2.toFixed(5)}, m_pi/m_rho=${lightest.mPiOverMRho.toFixed(3)}->${heaviest.mPiOverMRho.toFixed(3)}, WTI=${maxWtiFerm.toExponential(1)}`,
  )

  return {
    mode: MODE_LABEL,
    tier: 'Tier B/C (quenched pure-gauge D_4 SU(2)/SU(3) MC + quenched naive 40-doubler D_4 fermions)',
    fermionDiscretization: 'quenched-naive-d4-40-doubler (c=1 physical at k=0, c=1/3 at doublers e.g. (pi,pi,0,k_t); <pbp> normalized by 1/(4 N_c))',
    censusL4: { V: torusL4.V, E: torusL4.E, T: torusL4.T },
    censusL6: { V: torusL6.V, E: torusL6.E, T: torusL6.T },
    gaugeRuns: allGaugeRuns,
    strongCouplingChecks: {
      su2Beta: scSu2.beta, su2Measured: scSu2.plaqMean, su2Exact: su2ExactSC, su2RelErr,
      su3Beta: scSu3.beta, su3Measured: scSu3.plaqMean, su3Exact: su3ExactSC, su3RelErr,
    },
    weakCouplingCheck: {
      beta: wcSu3.beta, L: wcSu3.L, measured: wcSu3.plaqMean, oneLoopT4Pred: wcPred, absDiff: wcErr,
    },
    freeFieldChecks: {
      L: 4, adjIdentityErr, freeDispLamPhysK0: freeExact.lamPhysK0, freeDispLamMinDoubler: freeExact.lamMinDoubler,
      freePbpNormAnalytical: freeExact.pbpNorm, freePbpNormCg: freeMeas.pbpExactPt, freePbpRelErr, freeWtiErr: freeMeas.wtiRelErr,
    },
    fermionBeta: fermBeta, fermionL: fermTorus.Ls, fermionConfigs: nFermConfigs,
    fermionSpectrum, gmorR2: gmorFit.r2, gmorIntercept: gmorFit.intercept, chiralCondensateExtrap: pbpFit.intercept,
    elapsedSec: (performance.now() - t0) / 1000,
  }
}

// =================================================================================================
// SECTION 6: PART 2 - TIER-B 0+1D/1+1D MULTI-SITE SU(4) (~= Spin(6)) CAYLEY-4-FORM SMG BENCHMARK
//   Note: On-site Cayley 4-form is Spin(7)-invariant (projecting onto +Gamma_9 8_s or -Gamma_9 8_c),
//   while bipartite spinless complex hopping preserves SU(4) ~= Spin(6). NegCtrl 2D tests 1+1D
//   Fidkowski-Kitaev nu = 4 mod 8; full dynamical 3+1D/4D gauge-coupled chiral SMG remains Tier C open.
// =================================================================================================

type PauliTerm = { readonly xMask: number; readonly zMask: number; readonly iPow: number }

function mulPauli(a: PauliTerm, b: PauliTerm): PauliTerm {
  const flips = popcount(a.zMask & b.xMask)
  return { xMask: a.xMask ^ b.xMask, zMask: a.zMask ^ b.zMask, iPow: (a.iPow + b.iPow + 2 * (flips & 1)) & 3 }
}

function majoranaPauli(idx: number): PauliTerm {
  const q = idx >> 1
  if ((idx & 1) === 0) return { xMask: 1 << q, zMask: (1 << q) - 1, iPow: 0 }
  return { xMask: 1 << q, zMask: (1 << (q + 1)) - 1, iPow: 1 }
}

function prodMajoranas(indices: readonly number[]): PauliTerm {
  let cur: PauliTerm = { xMask: 0, zMask: 0, iPow: 0 }
  for (const idx of indices) cur = mulPauli(cur, majoranaPauli(idx))
  return cur
}

function leviCivitaSign(perm: readonly number[]): number {
  let inv = 0
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) if (perm[i]! > perm[j]!) inv++
  }
  return (inv & 1) === 0 ? 1 : -1
}

const FANO_TRIPLES: readonly (readonly [number, number, number])[] = [
  [1, 2, 3], [1, 4, 5], [1, 7, 6], [2, 4, 6], [2, 5, 7], [3, 4, 7], [3, 6, 5],
]

type OneSiteOp = { readonly diag: Float64Array; readonly offDst: Int32Array; readonly offVal: Float64Array }

function buildOneSiteCayleyOp(diagonalOnly: boolean, chirality: 1 | -1 = 1): OneSiteOp {
  // Exact 1-site 8-Majorana Cayley 4-form:
  //   chirality = +1: H_C^(+) = -sum_{Fano} (A + *A) projects onto +Gamma_9 (8_s, even parity, E0=-14 unique)
  //   chirality = -1: H_C^(-) = +sum_{Fano} (A - *A) projects onto -Gamma_9 (8_c, odd parity, E0=-14 unique)
  const dim = 16
  const re = new Float64Array(dim * dim), im = new Float64Array(dim * dim)
  const phases: readonly [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]]

  const addTerm = (quad: readonly number[], coeff: number): void => {
    const p = prodMajoranas(quad)
    if (diagonalOnly && p.xMask !== 0) return
    const [pr, pi] = phases[p.iPow & 3]!
    const cr = coeff * pr, ci = coeff * pi
    for (let col = 0; col < dim; col++) {
      const sign = (popcount(col & p.zMask) & 1) === 0 ? 1 : -1
      const row = col ^ p.xMask
      re[row * dim + col] = re[row * dim + col]! + sign * cr
      im[row * dim + col] = im[row * dim + col]! + sign * ci
    }
  }

  for (const [i, j, k] of FANO_TRIPLES) {
    const rawA = [0, i, j, k]
    const sortedA = [...rawA].sort((x, y) => x - y)
    addTerm(sortedA, -chirality * leviCivitaSign(rawA))
    const setA = new Set(rawA)
    const comp = [0, 1, 2, 3, 4, 5, 6, 7].filter(x => !setA.has(x))
    addTerm(comp, -leviCivitaSign([...rawA, ...comp]))
  }

  let maxIm = 0
  for (let i = 0; i < im.length; i++) if (Math.abs(im[i]!) > maxIm) maxIm = Math.abs(im[i]!)
  assert(maxIm < 1e-14, `1-site Cayley operator must be strictly real, maxIm=${maxIm}`)

  const diag = new Float64Array(16), offDst = new Int32Array(16).fill(-1), offVal = new Float64Array(16)
  for (let c = 0; c < 16; c++) {
    diag[c] = re[c * 16 + c]!
    let offCnt = 0
    for (let r = 0; r < 16; r++) {
      if (r === c) continue
      const v = re[r * 16 + c]!
      if (Math.abs(v) > 1e-12) { offDst[c] = r; offVal[c] = v; offCnt++ }
    }
    assert(offCnt <= 1, `Expected <= 1 off-diagonal transition per nibble, got ${offCnt}`)
  }
  return { diag, offDst, offVal }
}

function jacobiSymAsc(matIn: Float64Array, n: number, maxSweeps = 120): { readonly values: Float64Array; readonly vectors: Float64Array } {
  const a = Float64Array.from(matIn)
  const v = new Float64Array(n * n)
  for (let i = 0; i < n; i++) v[i * n + i] = 1
  for (let sw = 0; sw < maxSweeps; sw++) {
    let off = 0
    for (let p = 0; p < n; p++) {
      const po = p * n
      for (let q = p + 1; q < n; q++) { const apq = a[po + q]!; off += apq * apq }
    }
    if (off < 1e-28) break
    const thresh = sw < 3 ? (0.2 * Math.sqrt(off)) / (n * n) : 0
    for (let p = 0; p < n; p++) {
      const po = p * n
      for (let q = p + 1; q < n; q++) {
        const apq = a[po + q]!
        if (Math.abs(apq) <= thresh || Math.abs(apq) < 1e-15) continue
        const app = a[po + p]!, aqq = a[q * n + q]!
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t), s = t * c
        a[po + p] = app - t * apq; a[q * n + q] = aqq + t * apq
        a[po + q] = 0; a[q * n + p] = 0
        for (let r = 0; r < n; r++) {
          if (r === p || r === q) continue
          const ro = r * n, arp = a[ro + p]!, arq = a[ro + q]!
          const nrp = c * arp - s * arq, nrq = s * arp + c * arq
          a[ro + p] = nrp; a[po + r] = nrp; a[ro + q] = nrq; a[q * n + r] = nrq
        }
        for (let r = 0; r < n; r++) {
          const ro = r * n, vrp = v[ro + p]!, vrq = v[ro + q]!
          v[ro + p] = c * vrp - s * vrq; v[ro + q] = s * vrp + c * vrq
        }
      }
    }
  }
  const ord = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i * n + i]! - a[j * n + j]!)
  const values = new Float64Array(n), vectors = new Float64Array(n * n)
  for (let c = 0; c < n; c++) {
    const src = ord[c]!
    values[c] = a[src * n + src]!
    for (let r = 0; r < n; r++) vectors[r * n + c] = v[r * n + src]!
  }
  return { values, vectors }
}

type SparseSym = { readonly n: number; readonly rowPtr: Int32Array; readonly colIdx: Int32Array; readonly val: Float64Array }

function spmvSym(H: SparseSym, x: Float64Array, out: Float64Array): void {
  const n = H.n, rp = H.rowPtr, ci = H.colIdx, va = H.val
  for (let r = 0; r < n; r++) {
    let s = 0
    for (let k = rp[r]!, end = rp[r + 1]!; k < end; k++) s += va[k]! * x[ci[k]!]!
    out[r] = s
  }
}

function blockLanczosLowest(
  H: SparseSym,
  nEigs: number,
  seed: number,
  blockSize = Math.max(1, nEigs),
  maxSteps = 90,
): { readonly values: number[]; readonly vectors: Float64Array[]; readonly maxResidual: number } {
  const n = H.n
  if (n <= 48) {
    const dense = new Float64Array(n * n)
    for (let r = 0; r < n; r++) {
      for (let k = H.rowPtr[r]!, end = H.rowPtr[r + 1]!; k < end; k++) dense[r * n + H.colIdx[k]!] = H.val[k]!
    }
    const eig = jacobiSymAsc(dense, n)
    const kOut = Math.min(nEigs, n)
    const values: number[] = [], vectors: Float64Array[] = []
    let maxRes = 0
    const hv = new Float64Array(n)
    for (let j = 0; j < kOut; j++) {
      values.push(eig.values[j]!)
      const vec = new Float64Array(n)
      for (let r = 0; r < n; r++) vec[r] = eig.vectors[r * n + j]!
      vectors.push(vec)
      spmvSym(H, vec, hv)
      let r2 = 0
      for (let r = 0; r < n; r++) r2 += (hv[r]! - eig.values[j]! * vec[r]!) ** 2
      if (Math.sqrt(r2) > maxRes) maxRes = Math.sqrt(r2)
    }
    return { values, vectors, maxResidual: maxRes }
  }

  const rng = makeMulberry32(seed)
  const b = Math.min(blockSize, n)
  const Q: Float64Array[] = [], HQ: Float64Array[] = []
  const maxBasis = Math.min(n, b * maxSteps)

  const addOrthoVec = (raw: Float64Array): boolean => {
    const v = Float64Array.from(raw)
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < Q.length; k++) {
        const qk = Q[k]!
        let d = 0
        for (let i = 0; i < n; i++) d += qk[i]! * v[i]!
        for (let i = 0; i < n; i++) v[i] = v[i]! - d * qk[i]!
      }
    }
    let n2 = 0
    for (let i = 0; i < n; i++) n2 += v[i]! * v[i]!
    const nrm = Math.sqrt(n2)
    if (nrm < 1e-11) return false
    const inv = 1 / nrm
    for (let i = 0; i < n; i++) v[i] = v[i]! * inv
    const hv = new Float64Array(n)
    spmvSym(H, v, hv)
    Q.push(v); HQ.push(hv)
    return true
  }

  const initRaw = new Float64Array(n)
  for (let j = 0; j < b; j++) {
    for (let i = 0; i < n; i++) initRaw[i] = rng.nextGauss()
    addOrthoVec(initRaw)
  }

  let curStart = 0, curEnd = Q.length
  const kOut = Math.min(nEigs, n)

  for (let step = 0; step < maxSteps && Q.length < maxBasis; step++) {
    const nextStart = Q.length
    for (let idx = curStart; idx < curEnd && Q.length < maxBasis; idx++) addOrthoVec(HQ[idx]!)
    const saturated = Q.length === nextStart
    curStart = nextStart; curEnd = Q.length

    if (saturated || (step >= 15 && (step + 1) % 12 === 0) || Q.length >= maxBasis || step === maxSteps - 1) {
      const m = Q.length
      const T = new Float64Array(m * m)
      for (let i = 0; i < m; i++) {
        const qi = Q[i]!
        for (let j = i; j < m; j++) {
          const hqj = HQ[j]!
          let d = 0
          for (let r = 0; r < n; r++) d += qi[r]! * hqj[r]!
          T[i * m + j] = d; T[j * m + i] = d
        }
      }
      const eig = jacobiSymAsc(T, m, 90)
      let worstRes = 0
      const vec = new Float64Array(n), hv = new Float64Array(n)
      for (let c = 0; c < kOut; c++) {
        vec.fill(0); hv.fill(0)
        for (let k = 0; k < m; k++) {
          const ck = eig.vectors[k * m + c]!, qk = Q[k]!, hqk = HQ[k]!
          for (let r = 0; r < n; r++) { vec[r] = vec[r]! + ck * qk[r]!; hv[r] = hv[r]! + ck * hqk[r]! }
        }
        const lam = eig.values[c]!
        let r2 = 0
        for (let r = 0; r < n; r++) r2 += (hv[r]! - lam * vec[r]!) ** 2
        const res = Math.sqrt(r2)
        if (res > worstRes) worstRes = res
      }
      if (saturated || worstRes < 1e-12 || Q.length >= maxBasis || step === maxSteps - 1) {
        const values: number[] = [], vectors: Float64Array[] = []
        for (let c = 0; c < kOut; c++) {
          values.push(eig.values[c]!)
          const vc = new Float64Array(n)
          for (let k = 0; k < m; k++) {
            const ck = eig.vectors[k * m + c]!, qk = Q[k]!
            for (let r = 0; r < n; r++) vc[r] = vc[r]! + ck * qk[r]!
          }
          vectors.push(vc)
        }
        return { values, vectors, maxResidual: worstRes }
      }
    }
  }
  throw new Error('Block Lanczos terminated unexpectedly')
}

type SmgBlock = {
  readonly nSites: number
  readonly chirality: 1 | -1
  readonly states: Int32Array
  readonly stateToIdx: Int32Array
  readonly Q1: number
  readonly Q2: number
  readonly Q3: number
}

function buildSmgCartanBlock(nSites: number, Q1: number, Q2: number, Q3: number, chirality: 1 | -1 = 1): SmgBlock {
  // Cartan U(1)^3 charges conserved by both hopping and Cayley 4-form:
  //   chirality = +1 (+Gamma_9, 8_s): Q1 = N0 - N3, Q2 = N1 - N2, Q3 = N0 + N1
  //   chirality = -1 (-Gamma_9, 8_c): Q1 = N0 + N3, Q2 = N1 - N2, Q3 = N0 - N1
  const totalDim = 1 << (4 * nSites)
  const list: number[] = []
  const stateToIdx = new Int32Array(totalDim).fill(-1)
  for (let s = 0; s < totalDim; s++) {
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0
    for (let x = 0; x < nSites; x++) {
      const nib = (s >> (4 * x)) & 0xf
      n0 += nib & 1; n1 += (nib >> 1) & 1; n2 += (nib >> 2) & 1; n3 += (nib >> 3) & 1
    }
    const match =
      chirality === 1
        ? n0 - n3 === Q1 && n1 - n2 === Q2 && n0 + n1 === Q3
        : n0 + n3 === Q1 && n1 - n2 === Q2 && n0 - n1 === Q3
    if (match) {
      stateToIdx[s] = list.length
      list.push(s)
    }
  }
  return { nSites, chirality, states: Int32Array.from(list), stateToIdx, Q1, Q2, Q3 }
}

function solveShiftedCG(
  H: SparseSym,
  shift: number,
  rhsIn: Float64Array,
  projVec: Float64Array | null,
  tol = 1e-12,
  maxIter = 450,
): { readonly sol: Float64Array; readonly iters: number; readonly relRes: number } {
  // Solves (H + shift * I) x = P_perp rhs using Conjugate Gradient (strictly SPD on P_perp).
  const n = H.n
  const b = Float64Array.from(rhsIn)
  const projectOut = (v: Float64Array): void => {
    if (projVec === null) return
    let d = 0
    for (let i = 0; i < n; i++) d += projVec[i]! * v[i]!
    for (let i = 0; i < n; i++) v[i] = v[i]! - d * projVec[i]!
  }
  projectOut(b)
  let bNorm2 = 0
  for (let i = 0; i < n; i++) bNorm2 += b[i]! * b[i]!
  const x = new Float64Array(n)
  if (bNorm2 < 1e-28) return { sol: x, iters: 0, relRes: 0 }

  const r = Float64Array.from(b), p = Float64Array.from(b), ap = new Float64Array(n)
  let rsOld = bNorm2
  let it = 0
  const tolSq = tol * tol * bNorm2
  for (; it < maxIter; it++) {
    spmvSym(H, p, ap)
    for (let i = 0; i < n; i++) ap[i] = ap[i]! + shift * p[i]!
    projectOut(ap)
    let pAp = 0
    for (let i = 0; i < n; i++) pAp += p[i]! * ap[i]!
    if (pAp <= 1e-30) break
    const alpha = rsOld / pAp
    let rsNew = 0
    for (let i = 0; i < n; i++) {
      x[i] = x[i]! + alpha * p[i]!
      r[i] = r[i]! - alpha * ap[i]!
      rsNew += r[i]! * r[i]!
    }
    if (projVec !== null && (it + 1) % 20 === 0) {
      projectOut(x); projectOut(r)
      rsNew = 0
      for (let i = 0; i < n; i++) rsNew += r[i]! * r[i]!
    }
    if (rsNew <= tolSq) { rsOld = rsNew; it++; break }
    const beta = rsNew / rsOld
    for (let i = 0; i < n; i++) p[i] = r[i]! + beta * p[i]!
    rsOld = rsNew
  }
  projectOut(x)
  return { sol: x, iters: it, relRes: Math.sqrt(rsOld / bNorm2) }
}

function buildSmgBlockHamiltonian(
  blk: SmgBlock,
  bonds: readonly (readonly [number, number])[],
  cayleyOp: OneSiteOp,
  tHop: number,
  vInt: number,
  epsStagZ0 = 0,
): SparseSym {
  const n = blk.states.length
  const rowPtr = new Int32Array(n + 1)
  const colsTmp: number[] = [], valsTmp: number[] = []
  const rowMap = new Map<number, number>()

  for (let row = 0; row < n; row++) {
    rowPtr[row] = colsTmp.length
    rowMap.clear()
    const s = blk.states[row]!

    let diagAcc = 0
    for (let x = 0; x < blk.nSites; x++) {
      const shift = 4 * x
      const nib = (s >> shift) & 0xf
      diagAcc += vInt * cayleyOp.diag[nib]!
      if (epsStagZ0 !== 0) {
        const z0 = (nib & 1) === 0 ? 1 : -1
        diagAcc += ((x & 1) === 0 ? 1 : -1) * epsStagZ0 * z0
      }
      const dstNib = cayleyOp.offDst[nib]!
      if (dstNib >= 0 && vInt !== 0) {
        const sDst = (s & ~(0xf << shift)) | (dstNib << shift)
        const col = blk.stateToIdx[sDst]!
        assert(col >= 0, 'Cayley 4-form left Cartan symmetry block!')
        rowMap.set(col, (rowMap.get(col) ?? 0) + vInt * cayleyOp.offVal[nib]!)
      }
    }
    rowMap.set(row, (rowMap.get(row) ?? 0) + diagAcc)

    if (tHop !== 0) {
      for (let bi = 0; bi < bonds.length; bi++) {
        const [x0, y0] = bonds[bi]!
        const x = Math.min(x0, y0), y = Math.max(x0, y0)
        for (let q = 0; q < 4; q++) {
          const bA = 4 * x + q, bB = 4 * y + q
          if (((s >> bA) & 1) === ((s >> bB) & 1)) continue
          const betweenMask = ((1 << bB) - 1) ^ ((1 << (bA + 1)) - 1)
          const jw = (popcount(s & betweenMask) & 1) === 0 ? 1 : -1
          const col = blk.stateToIdx[s ^ (1 << bA) ^ (1 << bB)]!
          assert(col >= 0, 'Kinetic hopping left Cartan symmetry block!')
          rowMap.set(col, (rowMap.get(col) ?? 0) - 2 * tHop * jw)
        }
      }
    }

    const sortedCols = Array.from(rowMap.keys()).sort((a, b) => a - b)
    for (const c of sortedCols) {
      const v = rowMap.get(c)!
      if (Math.abs(v) > 1e-15 || c === row) { colsTmp.push(c); valsTmp.push(v) }
    }
  }
  rowPtr[n] = colsTmp.length
  return { n, rowPtr, colIdx: Int32Array.from(colsTmp), val: Float64Array.from(valsTmp) }
}

function measureSmgObservables(
  blk: SmgBlock,
  psi: Float64Array,
  cayleyOp: OneSiteOp,
): { readonly diagSymmetryCheck: number; readonly g2ByDist: number[]; readonly g4ConnByDist: number[]; readonly cayleyPerSite: number } {
  const n = blk.states.length, nSites = blk.nSites
  // Numerical symmetry sanity check for on-site diagonal Z_{x,q} (zero by exact symmetry in unique GS;
  // NOT dynamical evidence against SSB - dynamical stability is measured by Kubo susceptibilities below!)
  let maxDiagZ = 0
  for (let x = 0; x < nSites; x++) {
    for (let q = 0; q < 4; q++) {
      const bit = 4 * x + q
      let zExp = 0
      for (let i = 0; i < n; i++) {
        const p = psi[i]! * psi[i]!
        zExp += ((blk.states[i]! >> bit) & 1) === 0 ? p : -p
      }
      if (Math.abs(zExp) > maxDiagZ) maxDiagZ = Math.abs(zExp)
    }
  }

  const maxR = Math.floor(nSites / 2)
  const g2ByDist: number[] = []
  for (let r = 1; r <= maxR; r++) {
    let g2 = 0
    for (let q = 0; q < 4; q++) {
      const bA = q, bB = 4 * r + q
      const mask = ((1 << bB) - 1) ^ ((1 << (bA + 1)) - 1)
      let acc = 0
      for (let i = 0; i < n; i++) {
        const s = blk.states[i]!
        if (((s >> bA) & 1) === ((s >> bB) & 1)) continue
        const j = blk.stateToIdx[s ^ (1 << bA) ^ (1 << bB)]!
        if (j >= 0) {
          const jw = (popcount(s & mask) & 1) === 0 ? 1 : -1
          acc += jw * psi[i]! * psi[j]!
        }
      }
      g2 += Math.abs(acc)
    }
    g2ByDist.push(g2 / 4)
  }

  const applySiteCayley = (site: number, src: Float64Array, out: Float64Array): void => {
    out.fill(0)
    const shift = 4 * site
    for (let i = 0; i < n; i++) {
      const s = blk.states[i]!, nib = (s >> shift) & 0xf, c = src[i]!
      out[i] = out[i]! + cayleyOp.diag[nib]! * c
      const dstNib = cayleyOp.offDst[nib]!
      if (dstNib >= 0) {
        const j = blk.stateToIdx[(s & ~(0xf << shift)) | (dstNib << shift)]!
        out[j] = out[j]! + cayleyOp.offVal[nib]! * c
      }
    }
  }

  const h0Psi = new Float64Array(n), hrPsi = new Float64Array(n)
  applySiteCayley(0, psi, h0Psi)
  let exp0 = 0
  for (let i = 0; i < n; i++) exp0 += psi[i]! * h0Psi[i]!

  const g4ConnByDist: number[] = []
  for (let r = 1; r <= maxR; r++) {
    applySiteCayley(r, psi, hrPsi)
    let expR = 0, exp0R = 0
    for (let i = 0; i < n; i++) { expR += psi[i]! * hrPsi[i]!; exp0R += h0Psi[i]! * hrPsi[i]! }
    g4ConnByDist.push(Math.abs(exp0R - exp0 * expR))
  }
  return { diagSymmetryCheck: maxDiagZ, g2ByDist, g4ConnByDist, cayleyPerSite: exp0 }
}

type KuboChannels = {
  readonly chiStagZ: number
  readonly chiUnifZ: number
  readonly chiDimer: number
  readonly chiOffFlavUnif: number
  readonly chiOffFlavStag: number
  readonly chiMaxAll: number
}

function measureSmgKuboSusceptibilities(
  gsBlk: SmgBlock,
  flavBlk: SmgBlock,
  hGs: SparseSym,
  hFlav: SparseSym,
  bonds: readonly (readonly [number, number])[],
  psi0: Float64Array,
  e0: number,
): KuboChannels {
  // Exact multi-channel static Kubo susceptibilities:
  //   chi_O = (2 / N) <psi_0 | O^dag (H - E_0)^(-1) P_perp O | psi_0>
  // Every local probe operator o_x is Frobenius-normalized to Tr(o_x^2) / dim = 1:
  //   (a) Staggered Z_0:     o_x = (-1)^x Z_{x,0}                               (in gsBlk; IDENTICAL to anom4M!)
  //   (b) Uniform Z_0:       o_x = Z_{x,0}                                      (in gsBlk)
  //   (c) Bond dimer (VBS):  o_b = (-1)^b sqrt(2) (c_{x,0}^dag c_{y,0} + h.c.)  (in gsBlk)
  //   (d) Off-flavor unif:   o_x = sqrt(2) (c_{x,0}^dag c_{x,1} + h.c.)         (cross-block gsBlk -> flavBlk)
  //   (e) Off-flavor stag:   o_x = (-1)^x sqrt(2) (c_{x,0}^dag c_{x,1} + h.c.)  (cross-block gsBlk -> flavBlk)
  const n = gsBlk.states.length, nSites = gsBlk.nSites, nFlav = flavBlk.states.length
  const shift = -e0

  const solveInBlock = (rhs: Float64Array): number => {
    const cg = solveShiftedCG(hGs, shift, rhs, psi0)
    assert(cg.relRes < 1e-10, `Kubo in-block CG failed: relRes=${cg.relRes}`)
    let dot = 0
    for (let i = 0; i < n; i++) dot += rhs[i]! * cg.sol[i]!
    return (2 * dot) / nSites
  }

  // (a) Staggered Z_0 and (b) Uniform Z_0
  const rhsStag = new Float64Array(n), rhsUnif = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const s = gsBlk.states[i]!, c = psi0[i]!
    let st = 0, un = 0
    for (let x = 0; x < nSites; x++) {
      const z0 = ((s >> (4 * x)) & 1) === 0 ? 1 : -1
      st += ((x & 1) === 0 ? 1 : -1) * z0
      un += z0
    }
    rhsStag[i] = st * c
    rhsUnif[i] = un * c
  }
  const chiStagZ = solveInBlock(rhsStag)
  const chiUnifZ = solveInBlock(rhsUnif)

  // (c) Bond dimerization / VBS bilinear in gsBlk
  const rhsDimer = new Float64Array(n)
  const s2 = Math.SQRT2
  for (let bi = 0; bi < bonds.length; bi++) {
    const [x0, y0] = bonds[bi]!
    const x = Math.min(x0, y0), y = Math.max(x0, y0)
    const bSign = (bi & 1) === 0 ? 1 : -1
    const bA = 4 * x, bB = 4 * y
    const betweenMask = ((1 << bB) - 1) ^ ((1 << (bA + 1)) - 1)
    for (let i = 0; i < n; i++) {
      const s = gsBlk.states[i]!
      if (((s >> bA) & 1) === ((s >> bB) & 1)) continue
      const j = gsBlk.stateToIdx[s ^ (1 << bA) ^ (1 << bB)]!
      if (j >= 0) {
        const jw = (popcount(s & betweenMask) & 1) === 0 ? 1 : -1
        rhsDimer[j] = rhsDimer[j]! + bSign * s2 * jw * psi0[i]!
      }
    }
  }
  const chiDimer = solveInBlock(rhsDimer)

  // (d, e) Cross-block off-flavor bilinear A = sum_x s_x c_{x,0}^dag c_{x,1} mapping gsBlk (0,0,N) -> flavBlk (1,-1,N)
  // Hermitian normalized O = sqrt(2)(A + A^dag) couples equally to (1,-1,N) and isomorphic (-1,1,N):
  //   chi_O = (2/N) * (2 + 2) * <A psi_0 | (H_flav - E_0)^(-1) | A psi_0> = (8/N) * <rhs, sol>
  const rhsFlavUnif = new Float64Array(nFlav), rhsFlavStag = new Float64Array(nFlav)
  for (let i = 0; i < n; i++) {
    const s = gsBlk.states[i]!, c = psi0[i]!
    for (let x = 0; x < nSites; x++) {
      const b0 = 4 * x, b1 = 4 * x + 1
      // c_{x,0}^dag c_{x,1} requires n_{x,1}=1 and n_{x,0}=0; since b0 and b1 are adjacent, JW sign between them is +1
      if (((s >> b0) & 1) === 0 && ((s >> b1) & 1) === 1) {
        const sDst = s ^ (1 << b0) ^ (1 << b1)
        const j = flavBlk.stateToIdx[sDst]!
        assert(j >= 0, `Off-flavor c_0^dag c_1 left flavBlk!`)
        rhsFlavUnif[j] = rhsFlavUnif[j]! + c
        rhsFlavStag[j] = rhsFlavStag[j]! + ((x & 1) === 0 ? 1 : -1) * c
      }
    }
  }
  const cgFU = solveShiftedCG(hFlav, shift, rhsFlavUnif, null)
  const cgFS = solveShiftedCG(hFlav, shift, rhsFlavStag, null)
  assert(cgFU.relRes < 1e-10 && cgFS.relRes < 1e-10, `Kubo cross-block CG failed: ${cgFU.relRes}, ${cgFS.relRes}`)
  let dotFU = 0, dotFS = 0
  for (let j = 0; j < nFlav; j++) { dotFU += rhsFlavUnif[j]! * cgFU.sol[j]!; dotFS += rhsFlavStag[j]! * cgFS.sol[j]! }
  const chiOffFlavUnif = (8 * dotFU) / nSites
  const chiOffFlavStag = (8 * dotFS) / nSites
  const chiMaxAll = Math.max(chiStagZ, chiUnifZ, chiDimer, chiOffFlavUnif, chiOffFlavStag)
  return { chiStagZ, chiUnifZ, chiDimer, chiOffFlavUnif, chiOffFlavStag, chiMaxAll }
}

type TwoSite16MRow = {
  readonly vOverT: number
  readonly e0: number
  readonly gsDeg: number
  readonly gsDegLowerBound: boolean
  readonly gapNeutral: number
  readonly gap1p: number
  readonly gapGlobal: number
  readonly chiStagZ: number
  readonly chiUnifZ: number
  readonly diagSymmetryCheck: number
}

function runTwoSite16MajoranaSMG(
  cayleyPlus: OneSiteOp,
  cayleyMinus: OneSiteOp,
  vLadder: readonly number[],
  vCrossRatio = -0.02,
): {
  readonly dimGsBlock: number
  readonly dimOddBlock: number
  readonly globalBlocksScanned: number
  readonly vCrossRatio: number
  readonly rows: readonly TwoSite16MRow[]
} {
  // Bank A (+Gamma_9, 8_s): Q = (N0-N3, N1-N2, N0+N1)
  // Bank B (-Gamma_9, 8_c): Q = (N0+N3, N1-N2, N0-N1) (exact chiral mirror (2-Q1, Q2, 2-Q3))
  // Inter-bank coupling: vCrossRatio * V * sum_x H_{C,A}^(+)(x) (x) H_{C,B}^(-)(x), strictly SU(4)_A x SU(4)_B
  // and Spin(7)_A x Spin(7)_B invariant (both diagonal AND off-diagonal singlet coupling!).
  const gsA = buildSmgCartanBlock(2, 0, 0, 2, 1)
  const oddA = buildSmgCartanBlock(2, 1, 0, 3, 1)
  const flavA = buildSmgCartanBlock(2, 1, -1, 2, 1)
  const adjA = buildSmgCartanBlock(2, 2, 0, 3, 1)
  const pairA = buildSmgCartanBlock(2, 0, 0, 3, 1)

  const gsB = buildSmgCartanBlock(2, 2, 0, 0, -1)
  const oddB = buildSmgCartanBlock(2, 1, 0, -1, -1)
  const flavB = buildSmgCartanBlock(2, 1, -1, 0, -1)
  const adjB = buildSmgCartanBlock(2, 0, 0, -1, -1)
  const pairB = buildSmgCartanBlock(2, 2, 0, -1, -1)

  assert(
    gsA.states.length === 18 &&
      gsB.states.length === 18 &&
      oddA.states.length === 10 &&
      oddB.states.length === 10 &&
      adjA.states.length === 4 &&
      adjB.states.length === 4,
    'Unexpected 2-site opposite-chirality bank dims',
  )
  const nA = gsA.states.length, nB = gsB.states.length
  const dimGs = nA * nB, dimOdd = oddA.states.length * nB
  const bonds2: readonly (readonly [number, number])[] = [[0, 1]]

  const buildCoupledTwoBankH = (blkA: SmgBlock, blkB: SmgBlock, tHop: number, vInt: number): SparseSym => {
    const hA = buildSmgBlockHamiltonian(blkA, bonds2, cayleyPlus, tHop, vInt)
    const hB = buildSmgBlockHamiltonian(blkB, bonds2, cayleyMinus, tHop, vInt)
    const na = blkA.states.length, nb = blkB.states.length, N = na * nb
    const rowPtr = new Int32Array(N + 1), cols: number[] = [], vals: number[] = []
    const rowMap = new Map<number, number>()
    const gCross = vCrossRatio * vInt
    for (let ia = 0; ia < na; ia++) {
      const sA = blkA.states[ia]!
      for (let ib = 0; ib < nb; ib++) {
        const sB = blkB.states[ib]!, row = ia * nb + ib
        rowPtr[row] = cols.length; rowMap.clear()
        for (let k = hA.rowPtr[ia]!, end = hA.rowPtr[ia + 1]!; k < end; k++) {
          const col = hA.colIdx[k]! * nb + ib
          rowMap.set(col, (rowMap.get(col) ?? 0) + hA.val[k]!)
        }
        for (let k = hB.rowPtr[ib]!, end = hB.rowPtr[ib + 1]!; k < end; k++) {
          const col = ia * nb + hB.colIdx[k]!
          rowMap.set(col, (rowMap.get(col) ?? 0) + hB.val[k]!)
        }
        if (gCross !== 0) {
          for (let x = 0; x < 2; x++) {
            const sh = 4 * x
            const nibA = (sA >> sh) & 0xf, nibB = (sB >> sh) & 0xf
            const dA = cayleyPlus.diag[nibA]!, dstNibA = cayleyPlus.offDst[nibA]!, oA = cayleyPlus.offVal[nibA]!
            const dB = cayleyMinus.diag[nibB]!, dstNibB = cayleyMinus.offDst[nibB]!, oB = cayleyMinus.offVal[nibB]!
            const ja = dstNibA >= 0 ? blkA.stateToIdx[(sA & ~(0xf << sh)) | (dstNibA << sh)]! : -1
            const jb = dstNibB >= 0 ? blkB.stateToIdx[(sB & ~(0xf << sh)) | (dstNibB << sh)]! : -1
            if (dA !== 0 && dB !== 0) rowMap.set(row, (rowMap.get(row) ?? 0) + gCross * dA * dB)
            if (ja >= 0 && dB !== 0) { const c = ja * nb + ib; rowMap.set(c, (rowMap.get(c) ?? 0) + gCross * oA * dB) }
            if (jb >= 0 && dA !== 0) { const c = ia * nb + jb; rowMap.set(c, (rowMap.get(c) ?? 0) + gCross * dA * oB) }
            if (ja >= 0 && jb >= 0) { const c = ja * nb + jb; rowMap.set(c, (rowMap.get(c) ?? 0) + gCross * oA * oB) }
          }
        }
        for (const c of Array.from(rowMap.keys()).sort((a, b) => a - b)) {
          const v = rowMap.get(c)!
          if (Math.abs(v) > 1e-15 || c === row) { cols.push(c); vals.push(v) }
        }
      }
    }
    rowPtr[N] = cols.length
    return { n: N, rowPtr, colIdx: Int32Array.from(cols), val: Float64Array.from(vals) }
  }

  const sectorPairs: readonly (readonly [SmgBlock, SmgBlock])[] = [
    [oddA, gsB], [gsA, oddB], [flavA, gsB], [gsA, flavB],
    [adjA, gsB], [gsA, adjB], [pairA, gsB], [gsA, pairB], [oddA, oddB],
  ]

  const rows: TwoSite16MRow[] = []
  for (let vi = 0; vi < vLadder.length; vi++) {
    const V = vLadder[vi]!
    const nGsEigs = V === 0 ? 4 : 2
    const hGs = buildCoupledTwoBankH(gsA, gsB, 1.0, V)
    const eGs = blockLanczosLowest(hGs, nGsEigs, 700100 + vi)
    const eOddA = blockLanczosLowest(buildCoupledTwoBankH(oddA, gsB, 1.0, V), 1, 700200 + vi)
    const eOddB = blockLanczosLowest(buildCoupledTwoBankH(gsA, oddB, 1.0, V), 1, 700300 + vi)
    assert(eGs.maxResidual < 1e-11 && eOddA.maxResidual < 1e-11 && eOddB.maxResidual < 1e-11, '2-site 16M Lanczos residual too high')
    const e0 = eGs.values[0]!
    let gsDeg = 0
    for (const ev of eGs.values) if (Math.abs(ev - e0) < 1e-8) gsDeg++
    const gsDegLowerBound = gsDeg === nGsEigs
    const gapNeutral = eGs.values[1]! - e0
    const gap1p = Math.min(eOddA.values[0]! - e0, eOddB.values[0]! - e0)
    let gapGlobal = Math.min(gapNeutral, gap1p)
    if (V > 0) {
      for (let si = 2; si < sectorPairs.length; si++) {
        const [bA, bB] = sectorPairs[si]!
        const ex = blockLanczosLowest(buildCoupledTwoBankH(bA, bB, 1.0, V), 1, 700400 + si * 20 + vi)
        assert(ex.maxResidual < 1e-10, `2-site 16M extra sector ${si} residual too high`)
        const g = ex.values[0]! - e0
        if (g < gapGlobal) gapGlobal = g
      }
    }
    const psi = eGs.vectors[0]!
    let maxDiagZ = 0
    for (let x = 0; x < 2; x++) {
      for (let q = 0; q < 4; q++) {
        const bit = 4 * x + q
        let zA = 0, zB = 0
        for (let ia = 0; ia < nA; ia++) {
          const sgnA = ((gsA.states[ia]! >> bit) & 1) === 0 ? 1 : -1
          for (let ib = 0; ib < nB; ib++) {
            const p = psi[ia * nB + ib]! ** 2
            const sgnB = ((gsB.states[ib]! >> bit) & 1) === 0 ? 1 : -1
            zA += sgnA * p; zB += sgnB * p
          }
        }
        maxDiagZ = Math.max(maxDiagZ, Math.abs(zA), Math.abs(zB))
      }
    }
    let chiStagZ = 0, chiUnifZ = 0
    if (V > 0 && gapNeutral > 1e-6) {
      const rhsStag = new Float64Array(dimGs), rhsUnif = new Float64Array(dimGs)
      for (let ia = 0; ia < nA; ia++) {
        const sA = gsA.states[ia]!
        const z0 = (sA & 1) === 0 ? 1 : -1, z1 = ((sA >> 4) & 1) === 0 ? 1 : -1
        const st = z0 - z1, un = z0 + z1
        for (let ib = 0; ib < nB; ib++) {
          const idx = ia * nB + ib
          rhsStag[idx] = st * psi[idx]!
          rhsUnif[idx] = un * psi[idx]!
        }
      }
      const cgS = solveShiftedCG(hGs, -e0, rhsStag, psi)
      const cgU = solveShiftedCG(hGs, -e0, rhsUnif, psi)
      assert(cgS.relRes < 1e-10 && cgU.relRes < 1e-10, 'Model 2B Kubo CG failed')
      let ds = 0, du = 0
      for (let i = 0; i < dimGs; i++) { ds += rhsStag[i]! * cgS.sol[i]!; du += rhsUnif[i]! * cgU.sol[i]! }
      chiStagZ = ds // (2 / nSites) * ds with nSites = 2
      chiUnifZ = du
    }
    rows.push({
      vOverT: V, e0, gsDeg, gsDegLowerBound, gapNeutral, gap1p, gapGlobal,
      chiStagZ, chiUnifZ, diagSymmetryCheck: maxDiagZ,
    })
  }
  return { dimGsBlock: dimGs, dimOddBlock: dimOdd, globalBlocksScanned: 1 + sectorPairs.length, vCrossRatio, rows }
}

function runAnomalous4MajoranaControl(
  nSites: number,
  bonds: readonly (readonly [number, number])[],
  vLadder: readonly number[],
): {
  readonly nSites: number
  readonly totalDim: number
  readonly halfFillDim: number
  readonly rows: readonly {
    readonly vOverT: number
    readonly e0: number
    readonly gsDeg: number
    readonly gsDegLowerBound: boolean
    readonly gapAll: number
    readonly chiStagZ: number
    readonly atomicGsDeg: number
  }[]
} {
  // 1+1D Fidkowski-Kitaev anomalous nu = 4 mod 8 half-multiplet control (4 Majoranas/site = 2 complex fermions/site).
  // Uses the IDENTICAL staggered probe operator O_stag = sum_x (-1)^x Z_{x,0} (||o_x||^2_avg = 1) and exact Kubo CG
  // chi_stag = (2/N) <psi_0 | O_stag (H - E_0)^(-1) P_perp O_stag | psi_0> as SMG Models 2A/2B/2C!
  const totalDim = 1 << (2 * nSites)
  const buildBlock4M = (N0: number, N1: number): { states: Int32Array; stateToIdx: Int32Array } => {
    const st: number[] = []
    const s2i = new Int32Array(totalDim).fill(-1)
    for (let s = 0; s < totalDim; s++) {
      let c0 = 0, c1 = 0
      for (let x = 0; x < nSites; x++) { c0 += (s >> (2 * x)) & 1; c1 += (s >> (2 * x + 1)) & 1 }
      if (c0 === N0 && c1 === N1) { s2i[s] = st.length; st.push(s) }
    }
    return { states: Int32Array.from(st), stateToIdx: s2i }
  }

  const buildH4M = (blk: { states: Int32Array; stateToIdx: Int32Array }, tHop: number, vInt: number): SparseSym => {
    const n = blk.states.length
    const rowPtr = new Int32Array(n + 1), cols: number[] = [], vals: number[] = []
    const rowMap = new Map<number, number>()
    for (let r = 0; r < n; r++) {
      rowPtr[r] = cols.length; rowMap.clear()
      const s = blk.states[r]!
      let diag = 0
      for (let x = 0; x < nSites; x++) {
        const z0 = ((s >> (2 * x)) & 1) === 0 ? 1 : -1, z1 = ((s >> (2 * x + 1)) & 1) === 0 ? 1 : -1
        diag += vInt * z0 * z1
      }
      rowMap.set(r, diag)
      if (tHop !== 0) {
        for (const [x0, y0] of bonds) {
          const x = Math.min(x0, y0), y = Math.max(x0, y0)
          for (let q = 0; q < 2; q++) {
            const bA = 2 * x + q, bB = 2 * y + q
            if (((s >> bA) & 1) === ((s >> bB) & 1)) continue
            const mask = ((1 << bB) - 1) ^ ((1 << (bA + 1)) - 1)
            const jw = (popcount(s & mask) & 1) === 0 ? 1 : -1
            const col = blk.stateToIdx[s ^ (1 << bA) ^ (1 << bB)]!
            rowMap.set(col, (rowMap.get(col) ?? 0) - 2 * tHop * jw)
          }
        }
      }
      for (const c of Array.from(rowMap.keys()).sort((a, b) => a - b)) {
        const v = rowMap.get(c)!
        if (Math.abs(v) > 1e-15 || c === r) { cols.push(c); vals.push(v) }
      }
    }
    rowPtr[n] = cols.length
    return { n, rowPtr, colIdx: Int32Array.from(cols), val: Float64Array.from(vals) }
  }

  const halfN = Math.floor(nSites / 2)
  const hfBlk = buildBlock4M(halfN, halfN)
  const spinBlk = buildBlock4M(halfN + 1, halfN - 1)
  const oddBlk = buildBlock4M(halfN + 1, halfN)

  const rows: {
    readonly vOverT: number
    readonly e0: number
    readonly gsDeg: number
    readonly gsDegLowerBound: boolean
    readonly gapAll: number
    readonly chiStagZ: number
    readonly atomicGsDeg: number
  }[] = []
  for (let vi = 0; vi < vLadder.length; vi++) {
    const V = vLadder[vi]!
    const hHf = buildH4M(hfBlk, 1.0, V)
    const eHf = blockLanczosLowest(hHf, 4, 800100 + vi)
    const eSp = spinBlk.states.length > 0 ? blockLanczosLowest(buildH4M(spinBlk, 1.0, V), 2, 800200 + vi) : null
    const eOdd = blockLanczosLowest(buildH4M(oddBlk, 1.0, V), 2, 800300 + vi)
    const allLowest = [...eHf.values, ...(eSp ? eSp.values : []), ...eOdd.values].sort((a, b) => a - b)
    const e0 = allLowest[0]!
    let gsDeg = 0
    for (const ev of allLowest) if (Math.abs(ev - e0) < 1e-7) gsDeg++
    let hfDeg = 0
    for (const ev of eHf.values) if (Math.abs(ev - e0) < 1e-7) hfDeg++
    const gsDegLowerBound = hfDeg === eHf.values.length
    const gapAll = allLowest[gsDeg]! - e0

    let chiStagZ = Number.POSITIVE_INFINITY
    if (V > 0 && eHf.values[1]! - e0 > 1e-7) {
      const psi0 = eHf.vectors[0]!
      const rhs = new Float64Array(hfBlk.states.length)
      for (let i = 0; i < hfBlk.states.length; i++) {
        const s = hfBlk.states[i]!
        let st = 0
        for (let x = 0; x < nSites; x++) {
          const z0 = ((s >> (2 * x)) & 1) === 0 ? 1 : -1
          st += ((x & 1) === 0 ? 1 : -1) * z0
        }
        rhs[i] = st * psi0[i]!
      }
      const cg = solveShiftedCG(hHf, -e0, rhs, psi0)
      assert(cg.relRes < 1e-10, `Anom 4M Kubo CG failed: relRes=${cg.relRes}`)
      let dot = 0
      for (let i = 0; i < hfBlk.states.length; i++) dot += rhs[i]! * cg.sol[i]!
      chiStagZ = (2 * dot) / nSites
    }
    rows.push({
      vOverT: V, e0, gsDeg, gsDegLowerBound, gapAll,
      chiStagZ: Number.isFinite(chiStagZ) ? chiStagZ : -1,
      atomicGsDeg: 1 << nSites,
    })
  }
  return { nSites, totalDim, halfFillDim: hfBlk.states.length, rows }
}

type MultiSiteSmgPoint = {
  readonly vOverT: number
  readonly e0: number
  readonly gsDeg: number
  readonly gsDegLowerBound: boolean
  readonly gapNeutral: number
  readonly gap1p: number
  readonly gapFlavor: number
  readonly gapAdjoint: number
  readonly gapGlobal: number
  readonly diagSymmetryCheck: number
  readonly g2Dist1: number
  readonly g2Dist2: number
  readonly g4ConnDist1: number
  readonly g4ConnDist2: number
  readonly cayleyPerSite: number
  readonly kubo: KuboChannels
  readonly maxResidual: number
}

type Part2Summary = {
  readonly mode: string
  readonly tier: string
  readonly dimensionalityNote: string
  readonly oneSitePlusVerifyErr: number
  readonly oneSiteMinusVerifyErr: number
  readonly kuboVsFdRelErr: number
  readonly twoSite8M: {
    readonly totalDim: number
    readonly gsBlockDim: number
    readonly oddBlockDim: number
    readonly globalBlocksScanned: number
    readonly rows: readonly MultiSiteSmgPoint[]
  }
  readonly twoSite16M: {
    readonly totalDim: number
    readonly gsBlockDim: number
    readonly oddBlockDim: number
    readonly globalBlocksScanned: number
    readonly vCrossRatio: number
    readonly rows: readonly TwoSite16MRow[]
  }
  readonly fourSite8M: {
    readonly totalDim: number
    readonly gsBlockDim: number
    readonly oddBlockDim: number
    readonly flavorBlockDim: number
    readonly adjointBlockDim: number
    readonly globalBlocksScanned: number
    readonly rows: readonly MultiSiteSmgPoint[]
  }
  readonly anomalous4MControl: {
    readonly nSites: number
    readonly totalDim: number
    readonly halfFillDim: number
    readonly rows: readonly {
      readonly vOverT: number
      readonly e0: number
      readonly gsDeg: number
      readonly gsDegLowerBound: boolean
      readonly gapAll: number
      readonly chiStagZ: number
      readonly atomicGsDeg: number
    }[]
  }
  readonly diagonalOnlyControl: {
    readonly nSites: number
    readonly vLarge: number
    readonly atomicGsDeg: number
    readonly gapAtVLarge: number
    readonly chiStagZAtVLarge: number
  }
  readonly elapsedSec: number
}

function runPart2MultiSiteSmg(): Part2Summary {
  const t0 = performance.now()
  console.log('\n=================================================================================')
  console.log(`PART 2 (${MODE_LABEL}, Tier B): 0+1D/1+1D MULTI-SITE SU(4) (~= Spin(6)) CAYLEY-4-FORM SMG BENCHMARK`)
  console.log('  [Disclosure] Spinless bipartite hopping preserves SU(4) ~= Spin(6); NegCtrl 2D tests 1+1D')
  console.log('               Fidkowski-Kitaev nu=4 mod 8. Full 3+1D/4D gauge-coupled chiral SMG is Tier C open.')
  console.log('=================================================================================')

  const cayleyPlus = buildOneSiteCayleyOp(false, 1)
  const cayleyMinus = buildOneSiteCayleyOp(false, -1)
  const cayleyDiag = buildOneSiteCayleyOp(true, 1)

  let oneSitePlusErr = 0, oneSiteMinusErr = 0
  {
    const blk1P = buildSmgCartanBlock(1, 0, 0, 1, 1)
    assert(blk1P.states.length === 2, '1-site +Gamma_9 (0,0,1) block must have dim 2')
    const e1P = blockLanczosLowest(buildSmgBlockHamiltonian(blk1P, [], cayleyPlus, 0, 1.0), 2, 1001)
    oneSitePlusErr = Math.max(Math.abs(e1P.values[0]! - -14), Math.abs(e1P.values[1]! - 2))
    assert(oneSitePlusErr < 1e-13, `1-site +Gamma_9 Cayley mismatch: ${e1P.values.join(', ')}`)

    const blk1M = buildSmgCartanBlock(1, 1, 0, 0, -1)
    assert(blk1M.states.length === 2, '1-site -Gamma_9 (1,0,0) block must have dim 2')
    const e1M = blockLanczosLowest(buildSmgBlockHamiltonian(blk1M, [], cayleyMinus, 0, 1.0), 2, 1002)
    oneSiteMinusErr = Math.max(Math.abs(e1M.values[0]! - -14), Math.abs(e1M.values[1]! - 2))
    assert(oneSiteMinusErr < 1e-13, `1-site -Gamma_9 Cayley mismatch: ${e1M.values.join(', ')}`)
  }
  console.log(
    `  1-site Spin(7) Cayley 4-forms verified: +Gamma_9 (8_s) E0=-14, E1=+2 (err=${oneSitePlusErr.toExponential(1)}) | ` +
      `-Gamma_9 (8_c) E0=-14, E1=+2 (err=${oneSiteMinusErr.toExponential(1)})`,
  )

  const runMultiSite8M = (
    nSites: number,
    bonds: readonly (readonly [number, number])[],
    vLadder: readonly number[],
  ) => {
    const gsBlk = buildSmgCartanBlock(nSites, 0, 0, nSites, 1)
    const oddBlk = buildSmgCartanBlock(nSites, 1, 0, nSites + 1, 1)
    const flavBlk = buildSmgCartanBlock(nSites, 1, -1, nSites, 1)
    const adjBlk = buildSmgCartanBlock(nSites, 2, 0, nSites + 1, 1) // neutral SU(4) adjoint (n0-n3=2, n1=n2, N=2*nSites)
    // Complete symmetry-inequivalent |Delta N| <= 2 sector list (scanned in BOTH smoke and full!)
    const extraCoords: readonly (readonly [number, number, number])[] = [
      [2, -2, nSites],       // neutral double off-flavor (Delta N = 0)
      [0, 0, nSites + 1],    // 2-particle pair (Delta N = +2)
      [0, 0, nSites - 1],    // 2-hole pair (Delta N = -2)
      [1, 1, nSites + 2],    // 2-particle (n0+1, n1+1) (Delta N = +2)
      [1, -1, nSites + 1],   // 2-particle (n0+1, n2+1) (Delta N = +2)
      [2, 0, nSites + 2],    // 2-particle (n0+2) (Delta N = +2)
    ]
    const extraBlocks: SmgBlock[] = []
    for (const [q1, q2, q3] of extraCoords) {
      const b = buildSmgCartanBlock(nSites, q1, q2, q3, 1)
      if (b.states.length > 0) extraBlocks.push(b)
    }

    const rows: MultiSiteSmgPoint[] = []
    for (let vi = 0; vi < vLadder.length; vi++) {
      const V = vLadder[vi]!
      const nGsEigs = V === 0 ? 4 : 2
      const hGs = buildSmgBlockHamiltonian(gsBlk, bonds, cayleyPlus, 1.0, V)
      const hOdd = buildSmgBlockHamiltonian(oddBlk, bonds, cayleyPlus, 1.0, V)
      const hFlav = buildSmgBlockHamiltonian(flavBlk, bonds, cayleyPlus, 1.0, V)
      const hAdj = buildSmgBlockHamiltonian(adjBlk, bonds, cayleyPlus, 1.0, V)
      const eGs = blockLanczosLowest(hGs, nGsEigs, 910000 + nSites * 1000 + vi)
      const eOdd = blockLanczosLowest(hOdd, 2, 920000 + nSites * 1000 + vi)
      const eFlav = blockLanczosLowest(hFlav, 2, 930000 + nSites * 1000 + vi)
      const eAdj = blockLanczosLowest(hAdj, 1, 935000 + nSites * 1000 + vi)
      let maxRes = Math.max(eGs.maxResidual, eOdd.maxResidual, eFlav.maxResidual, eAdj.maxResidual)
      assert(maxRes < 1e-10, `Lanczos residual too large at N=${nSites}, V=${V}: ${maxRes}`)

      const e0 = eGs.values[0]!
      let gsDeg = 0
      for (const ev of eGs.values) if (Math.abs(ev - e0) < 1e-7) gsDeg++
      const gsDegLowerBound = gsDeg === nGsEigs
      const gapNeutral = eGs.values[1]! - e0
      const gap1p = eOdd.values[0]! - e0
      const gapFlavor = eFlav.values[0]! - e0
      const gapAdjoint = eAdj.values[0]! - e0
      let gapGlobal = Math.min(gapNeutral, gap1p, gapFlavor, gapAdjoint)

      if (V > 0) {
        for (let bi = 0; bi < extraBlocks.length; bi++) {
          const ex = blockLanczosLowest(buildSmgBlockHamiltonian(extraBlocks[bi]!, bonds, cayleyPlus, 1.0, V), 1, 940000 + bi * 100 + vi)
          if (ex.maxResidual > maxRes) maxRes = ex.maxResidual
          assert(ex.maxResidual < 1e-10, `Extra sector ${bi} Lanczos residual too large at N=${nSites}, V=${V}`)
          const g = ex.values[0]! - e0
          if (g < gapGlobal) gapGlobal = g
        }
      }

      const obs = measureSmgObservables(gsBlk, eGs.vectors[0]!, cayleyPlus)
      const kubo: KuboChannels =
        V > 0 && gapGlobal > 1e-6
          ? measureSmgKuboSusceptibilities(gsBlk, flavBlk, hGs, hFlav, bonds, eGs.vectors[0]!, e0)
          : { chiStagZ: 0, chiUnifZ: 0, chiDimer: 0, chiOffFlavUnif: 0, chiOffFlavStag: 0, chiMaxAll: 0 }

      rows.push({
        vOverT: V, e0, gsDeg, gsDegLowerBound, gapNeutral, gap1p, gapFlavor, gapAdjoint, gapGlobal,
        diagSymmetryCheck: obs.diagSymmetryCheck,
        g2Dist1: obs.g2ByDist[0] ?? 0, g2Dist2: obs.g2ByDist[1] ?? 0,
        g4ConnDist1: obs.g4ConnByDist[0] ?? 0, g4ConnDist2: obs.g4ConnByDist[1] ?? 0,
        cayleyPerSite: obs.cayleyPerSite, kubo, maxResidual: maxRes,
      })
    }
    return {
      totalDim: 1 << (4 * nSites),
      gsBlockDim: gsBlk.states.length,
      oddBlockDim: oddBlk.states.length,
      flavorBlockDim: flavBlk.states.length,
      adjointBlockDim: adjBlk.states.length,
      globalBlocksScanned: 4 + extraBlocks.length,
      rows,
    }
  }

  const vLadder2 = IS_FULL ? ([0, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0] as const) : ([0, 0.5, 1.0, 2.0, 4.0] as const)
  const vLadder4 = IS_FULL ? ([0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0] as const) : ([0, 0.5, 1.0, 3.0] as const)
  const vLadder16 = IS_FULL ? ([0, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0] as const) : ([0, 1.0, 2.0] as const)
  const vLadderAnom = IS_FULL ? ([0, 1.0, 2.0, 4.0, 8.0, 16.0] as const) : ([0, 4.0, 10.0] as const)

  const twoSite8M = runMultiSite8M(2, [[0, 1]], vLadder2)
  console.log(`\n  [Model 2A] 2-Site 8-Majorana/Site (16 Majoranas, dim=${twoSite8M.totalDim} -> GS=${twoSite8M.gsBlockDim}, 1p=${twoSite8M.oddBlockDim}, adj=${twoSite8M.adjointBlockDim}, ${twoSite8M.globalBlocksScanned} blocks):`)
  for (const r of twoSite8M.rows) {
    console.log(
      `    V/t=${r.vOverT.toFixed(2)}: E0=${r.e0.toFixed(5)} gsDeg=${r.gsDeg}${r.gsDegLowerBound ? '+' : ''} | dE_glob=${r.gapGlobal.toFixed(5)} dE_1p=${r.gap1p.toFixed(5)} | ` +
        `G2(1)=${r.g2Dist1.toFixed(4)} G4c(1)=${r.g4ConnDist1.toFixed(4)} | chi(stagZ,unifZ,dim,offF)=(${r.kubo.chiStagZ.toFixed(4)},${r.kubo.chiUnifZ.toFixed(4)},${r.kubo.chiDimer.toFixed(4)},${r.kubo.chiOffFlavUnif.toFixed(4)})`,
    )
  }

  // Exact numerical parity check: Kubo CG chiStagZ vs finite-difference probe on 2-site SMG at V/t=1.0
  let kuboVsFdRelErr = 0
  {
    const gs2 = buildSmgCartanBlock(2, 0, 0, 2, 1), eps = 1e-4
    const ep = blockLanczosLowest(buildSmgBlockHamiltonian(gs2, [[0, 1]], cayleyPlus, 1.0, 1.0, eps), 1, 955001)
    let stagZ0 = 0
    for (let i = 0; i < gs2.states.length; i++) {
      const s = gs2.states[i]!, p = ep.vectors[0]![i]! ** 2
      const z0 = (s & 1) === 0 ? 1 : -1, z1 = ((s >> 4) & 1) === 0 ? 1 : -1
      stagZ0 += (z0 - z1) * p
    }
    const fdChi = Math.abs(stagZ0) / (2 * eps)
    const cgChi = twoSite8M.rows.find(r => Math.abs(r.vOverT - 1.0) < 1e-6)!.kubo.chiStagZ
    kuboVsFdRelErr = Math.abs(fdChi - cgChi) / Math.max(1e-12, cgChi)
    assert(kuboVsFdRelErr < 1e-4, `Kubo CG vs finite-diff mismatch: cg=${cgChi}, fd=${fdChi}`)
    console.log(`  [Kubo Parity Check] 2-site V/t=1.0: Kubo_CG=${cgChi.toFixed(8)} vs FD=${fdChi.toFixed(8)} (relErr=${kuboVsFdRelErr.toExponential(2)})`)
  }

  const twoSite16M = runTwoSite16MajoranaSMG(cayleyPlus, cayleyMinus, vLadder16, -0.02)
  console.log(
    `\n  [Model 2B] 2-Site Opposite-Chirality 16-Majorana/Site (32 Majoranas, +Gamma_9 8_s (+) -Gamma_9 8_c, SU(4)_A x SU(4)_B quartic vCross=${twoSite16M.vCrossRatio}*V, dim=65,536 -> GS=${twoSite16M.dimGsBlock}, ${twoSite16M.globalBlocksScanned} sectors):`,
  )
  for (const r of twoSite16M.rows) {
    console.log(
      `    V/t=${r.vOverT.toFixed(2)}: E0=${r.e0.toFixed(5)} gsDeg=${r.gsDeg}${r.gsDegLowerBound ? '+' : ''} | dE_glob=${r.gapGlobal.toFixed(5)} dE_neut=${r.gapNeutral.toFixed(5)} dE_1p=${r.gap1p.toFixed(5)} | chi(stagZ,unifZ)=(${r.chiStagZ.toFixed(4)},${r.chiUnifZ.toFixed(4)})`,
    )
  }

  const bonds4Ring: readonly (readonly [number, number])[] = [[0, 1], [1, 2], [2, 3], [0, 3]]
  const fourSite8M = runMultiSite8M(4, bonds4Ring, vLadder4)
  console.log(
    `\n  [Model 2C] 4-Site 1+1D Periodic Chiral Ring 8-Majorana/Site (32 Majoranas, dim=${fourSite8M.totalDim} -> GS=${fourSite8M.gsBlockDim}, 1p=${fourSite8M.oddBlockDim}, flav=${fourSite8M.flavorBlockDim}, adj=${fourSite8M.adjointBlockDim}, ${fourSite8M.globalBlocksScanned} blocks):`,
  )
  for (const r of fourSite8M.rows) {
    console.log(
      `    V/t=${r.vOverT.toFixed(2)}: E0=${r.e0.toFixed(5)} gsDeg=${r.gsDeg}${r.gsDegLowerBound ? '+' : ''} | dE_glob=${r.gapGlobal.toFixed(5)} dE_adj=${r.gapAdjoint.toFixed(5)} dE_1p=${r.gap1p.toFixed(5)} | ` +
        `G2(1,2)=(${r.g2Dist1.toFixed(4)},${r.g2Dist2.toFixed(4)}) G4c(1,2)=(${r.g4ConnDist1.toFixed(3)},${r.g4ConnDist2.toFixed(3)}) | chiMax=${r.kubo.chiMaxAll.toFixed(4)} (stagZ=${r.kubo.chiStagZ.toFixed(4)}, dim=${r.kubo.chiDimer.toFixed(4)}, offF=${r.kubo.chiOffFlavUnif.toFixed(4)})`,
    )
  }

  const anom4M = runAnomalous4MajoranaControl(4, bonds4Ring, vLadderAnom)
  console.log(`\n  [NegCtrl 2D] 1+1D Fidkowski-Kitaev Anomalous 4-Majorana/Site (nu=4 mod 8) on 4-Site Ring (dim=${anom4M.totalDim}, HF block=${anom4M.halfFillDim}, identical Z_0 Kubo norm):`)
  for (const r of anom4M.rows) {
    console.log(
      `    V/t=${r.vOverT.toFixed(2)}: E0=${r.e0.toFixed(5)} gsDeg=${r.gsDeg}${r.gsDegLowerBound ? '+' : ''} (atomicDeg=${r.atomicGsDeg}) | gap=${r.gapAll.toFixed(5)} | chi_stagZ=${r.chiStagZ >= 0 ? r.chiStagZ.toFixed(3) : 'INF (gapless)'}`,
    )
  }

  const diagBlk2 = buildSmgCartanBlock(2, 0, 0, 2, 1)
  const vDiagTest = 4.0
  const eDiagAtom = blockLanczosLowest(buildSmgBlockHamiltonian(diagBlk2, [[0, 1]], cayleyDiag, 0, vDiagTest), 4, 960001)
  let atomicDegDiag = 0
  for (const ev of eDiagAtom.values) if (Math.abs(ev - eDiagAtom.values[0]!) < 1e-7) atomicDegDiag++
  const hDiagCoupled = buildSmgBlockHamiltonian(diagBlk2, [[0, 1]], cayleyDiag, 1.0, vDiagTest)
  const eDiagCoupled = blockLanczosLowest(hDiagCoupled, 4, 960002)
  const gapDiagV4 = eDiagCoupled.values[1]! - eDiagCoupled.values[0]!
  const rhsDiag = new Float64Array(diagBlk2.states.length)
  for (let i = 0; i < diagBlk2.states.length; i++) {
    const s = diagBlk2.states[i]!
    const z0 = (s & 1) === 0 ? 1 : -1, z1 = ((s >> 4) & 1) === 0 ? 1 : -1
    rhsDiag[i] = (z0 - z1) * eDiagCoupled.vectors[0]![i]!
  }
  const cgDiag = solveShiftedCG(hDiagCoupled, -eDiagCoupled.values[0]!, rhsDiag, eDiagCoupled.vectors[0]!)
  assert(cgDiag.relRes < 1e-10, `Diag-only Kubo CG failed: ${cgDiag.relRes}`)
  let diagDot = 0
  for (let i = 0; i < diagBlk2.states.length; i++) diagDot += rhsDiag[i]! * cgDiag.sol[i]!
  const diagChiStagZ = diagDot // (2 / nSites) * diagDot with nSites = 2
  console.log(
    `\n  [NegCtrl 2E] Diagonal-only 8-Majorana/Site on 2 sites (V/t=${vDiagTest}): atomicGsDeg=${atomicDegDiag} (DEGENERATE!), ` +
      `coupled gap=${gapDiagV4.toFixed(5)} (vs full SMG ${twoSite8M.rows[twoSite8M.rows.length - 1]!.gapGlobal.toFixed(3)}), chi_stagZ=${diagChiStagZ.toFixed(3)}`,
  )

  const r4Free = fourSite8M.rows[0]!
  const r4Strong = fourSite8M.rows[fourSite8M.rows.length - 1]!
  const r4Mid = fourSite8M.rows[Math.min(2, fourSite8M.rows.length - 1)]!
  const r16Strong = twoSite16M.rows[twoSite16M.rows.length - 1]!
  const anomMid = anom4M.rows.find(r => Math.abs(r.vOverT - 4.0) < 1e-6)!
  const anomStrong = anom4M.rows[anom4M.rows.length - 1]!

  recordGate(
    'G2.1',
    'Part 2',
    '4-site 1+1D chiral ring: V=0 gapless zero-mode phase -> unique gapped SU(4) SMG across all |Delta N|<=2 sectors',
    r4Free.gapNeutral < 1e-9 &&
      r4Free.gsDeg >= 4 &&
      r4Free.gsDegLowerBound &&
      r4Strong.gsDeg === 1 &&
      !r4Strong.gsDegLowerBound &&
      r4Strong.gapGlobal > 10 &&
      r4Strong.gapAdjoint > 10 &&
      r4Strong.gap1p > r4Mid.gap1p &&
      r4Strong.maxResidual < 1e-11,
    `V=0: gap=${r4Free.gapNeutral.toExponential(1)}, gsDeg>=${r4Free.gsDeg}; V/t=${r4Strong.vOverT}: gsDeg=${r4Strong.gsDeg}, dE_glob=${r4Strong.gapGlobal.toFixed(3)} (adj=${r4Strong.gapAdjoint.toFixed(3)}, ${fourSite8M.globalBlocksScanned} sectors), res=${r4Strong.maxResidual.toExponential(1)}`,
  )
  recordGate(
    'G2.2',
    'Part 2',
    'Multi-channel Kubo susceptibilities bounded O(1/V) (stagZ, unifZ, VBS dimer, cross-block off-flavor) & Model 2B 8_s(+)8_c global SMG gap',
    kuboVsFdRelErr < 1e-4 &&
      r4Strong.kubo.chiMaxAll < r4Mid.kubo.chiMaxAll &&
      r4Strong.kubo.chiMaxAll < 0.5 &&
      r4Strong.g2Dist1 < r4Mid.g2Dist1 &&
      r4Strong.cayleyPerSite < -13.0 &&
      r16Strong.gsDeg === 1 &&
      r16Strong.gapGlobal > 15 &&
      r16Strong.chiStagZ < 0.5 &&
      r16Strong.chiUnifZ < 0.5,
    `4-site chiMax: ${r4Mid.kubo.chiMaxAll.toFixed(4)}->${r4Strong.kubo.chiMaxAll.toFixed(4)} (Kubo/FD err=${kuboVsFdRelErr.toExponential(1)}); G2(1): ${r4Mid.g2Dist1.toFixed(4)}->${r4Strong.g2Dist1.toFixed(4)}; 2x16M 8_s(+)8_c dE_glob=${r16Strong.gapGlobal.toFixed(3)} (${twoSite16M.globalBlocksScanned} sectors)`,
  )
  recordGate(
    'G2.3',
    'Part 2',
    'Identically-normalized 1+1D Fidkowski-Kitaev 4M/site (nu=4 mod 8) & diagonal-only controls CANNOT open symmetric gap',
    anomStrong.gapAll < anomMid.gapAll &&
      anomStrong.chiStagZ > anomMid.chiStagZ &&
      anomStrong.chiStagZ > 5 * r4Strong.kubo.chiMaxAll &&
      atomicDegDiag >= 2 &&
      gapDiagV4 < 2.0 &&
      diagChiStagZ > 50 * r4Strong.kubo.chiMaxAll,
    `Anom 4M gap collapses ${anomMid.gapAll.toFixed(4)}->${anomStrong.gapAll.toFixed(4)}, equal-norm chi_stagZ surges ${anomMid.chiStagZ.toFixed(2)}->${anomStrong.chiStagZ.toFixed(2)} vs SMG chiMax=${r4Strong.kubo.chiMaxAll.toFixed(4)}; diagOnly atomicDeg=${atomicDegDiag}, chi=${diagChiStagZ.toFixed(1)}`,
  )

  return {
    mode: MODE_LABEL,
    tier: 'Tier B (0+1D/1+1D multi-site SU(4) ~= Spin(6) bipartite Cayley-4-form SMG benchmark)',
    dimensionalityNote: 'Spinless complex hopping preserves SU(4) ~= Spin(6); NegCtrl 2D tests 1+1D Fidkowski-Kitaev nu=4 mod 8; full dynamical 3+1D/4D gauge-coupled chiral SMG remains Tier C open.',
    oneSitePlusVerifyErr: oneSitePlusErr,
    oneSiteMinusVerifyErr: oneSiteMinusErr,
    kuboVsFdRelErr,
    twoSite8M,
    twoSite16M: {
      totalDim: 65536, gsBlockDim: twoSite16M.dimGsBlock, oddBlockDim: twoSite16M.dimOddBlock,
      globalBlocksScanned: twoSite16M.globalBlocksScanned, vCrossRatio: twoSite16M.vCrossRatio, rows: twoSite16M.rows,
    },
    fourSite8M,
    anomalous4MControl: anom4M,
    diagonalOnlyControl: { nSites: 2, vLarge: vDiagTest, atomicGsDeg: atomicDegDiag, gapAtVLarge: gapDiagV4, chiStagZAtVLarge: diagChiStagZ },
    elapsedSec: (performance.now() - t0) / 1000,
  }
}

// =================================================================================================
// MAIN DRIVER
// =================================================================================================

async function main(): Promise<void> {
  console.log('=================================================================================')
  console.log(`4D D_4 LATTICE QCD (Tier B/C) + MULTI-SITE SU(4) CAYLEY-4-FORM SMG (Tier B) [${MODE_LABEL}]`)
  console.log(`Workers: ${N_WORKERS} | Node ${process.version} | CPUs: ${os.cpus().length}`)
  console.log('=================================================================================')

  const part1 = await runPart1D4LatticeQcd()
  const part2 = runPart2MultiSiteSmg()

  const elapsedSec = (performance.now() - T0_GLOBAL) / 1000
  const peakRssMb = process.memoryUsage().rss / (1024 * 1024)

  const outFile = IS_FULL ? 'tmp/d4-qcd-smg-results.json' : 'tmp/d4-qcd-smg-smoke.json'
  const outAbs = path.resolve(PKG_ROOT, outFile)
  fs.mkdirSync(path.dirname(outAbs), { recursive: true })
  const payload = {
    meta: {
      script: 'test/verify/d4-lattice-qcd-and-multisite-smg.ts',
      mode: MODE_LABEL,
      nodeVersion: process.version,
      workers: N_WORKERS,
      elapsedSec,
      peakRssMb,
      gatesPassed: GATES.filter(g => g.passed).length,
      gatesTotal: GATES.length,
    },
    gates: GATES,
    part1,
    part2,
  }
  fs.writeFileSync(outAbs, JSON.stringify(payload, null, 2))

  console.log('\n=================================================================================')
  console.log(`SUMMARY [${MODE_LABEL}]: ${GATES.filter(g => g.passed).length}/${GATES.length} GATES PASSED`)
  console.log(`  Output JSON : ${outFile}`)
  console.log(`  Runtime     : ${elapsedSec.toFixed(2)} s | RSS: ${peakRssMb.toFixed(1)} MB`)
  console.log('=================================================================================')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

export {}
