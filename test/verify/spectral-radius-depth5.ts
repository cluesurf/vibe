// EXACT DEPTH-5 -> DEPTH-6 SPECTRAL RADIUS COLLAPSE ON {3,4,3,4} (4D HYPERBOLIC 24-CELL HONEYCOMB)
//
// Target graph: the 24-regular Right-Angled Coxeter Group (RACG) Cayley graph, which is the
// cell-adjacency graph (dual 1-skeleton) of the 4D hyperbolic honeycomb {3,4,3,4} (whose primal
// vertices are ideal points on the boundary at infinity).
//
// Upgrades the Depth-5 / 2-step Cartier-Foata bracket [11.439047, 11.443713] (width 0.004666)
// from BOTH ends with 100% exact BigInt Collatz-Wielandt / Rayleigh certificates using multi-threaded
// node:worker_threads + SharedArrayBuffer:
//   1. UPPER BOUND SHARPENING (Exact O(1) W(F_4)-Coset Depth-6 Automaton S_6 & [St_6(y), b] Flags):
//      - Reproduces exact S_2 (19), S_3 (169), S_4 (2,197), and S_5 (34,523 states, 43,312 flags,
//        BigInt Q=10^6 <= 11.443713) with exact BigInt shell sums r = 0..6 (1..51,187,080).
//      - Builds exact Depth-6 automaton S_6 (~600k states, ~750k upward-end [St_6(y), b] flags) via
//        level-synchronous parallel worker_threads + compact O(1) S_5 automorphism table + zero-GC flat
//        open-addressed TypedArray hash table; verifies exact BigInt shell sums r = 0..7 & exact
//        integrality at every S_6 state!
//      - Warm-starts parallel SharedArrayBuffer damped Nonlinear Perron-Frobenius iteration from exact
//        converged S_5 solution to primal-dual gap < 1e-7, then certifies the upper bound with 100%
//        exact BigInt Collatz-Wielandt / Schur arithmetic at Q = 10^6 and Q = 10^7!
//   2. LOWER BOUND SHARPENING (Deep 2-Step CF + Exact 3-Step Quadruple-Orbit CF + Exact BigInt Witness):
//      - Builds exact 216 cliques, 57 pair orbits, 4,440 triple orbits, and exact quadruple orbits
//        (~550k orbits via 3.8 MB O(1) TRIPLE_TO_REP_PERM + REP_C4_TO_QUAD lookup table!).
//      - Verifies 0-BigInt-error brute-force identity on Z[4], exact 2-step -> 3-step lift identity,
//        and < 1e-7 finite-difference verification of the exact analytical 3-step gradient!
//      - Runs deep L-BFGS ascent on 2-step (4,440 bulk + 4,440 boundary) and warm-started L-BFGS
//        ascent on 3-step (N_QUAD bulk + 4,440 boundary), then constructs a 100% exact BigInt
//        finite-support witness psi in Z^V (ZERO sqrt, ZERO asymptotic limit) certifying rho >= L_new!
//
// Modes:
//   --smoke (default; fast < 5 s, verifies D2->D3->D4 exact BigInt bounds, cold-start parallel
//            worker parity, S6_STEP_WORKER_JS boot/step self-test, 1-step & quick 2-step CF lower
//            bounds, BigInt witness, analytical gradient, and exact quadruple-orbit O(1) integrality!)
//   --full  (full multi-core Depth-6 + 3-Step CF collapse; saves tmp/spectral-depth5-results.json)
//
// Strictly deterministic (ZERO Math.random()), zero external imports, strict TypeScript clean.

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const T0_GLOBAL = performance.now()
const IS_FULL = process.argv.includes('--full')
const MODE_LABEL = IS_FULL ? 'FULL PRODUCTION' : 'SMOKE'
const N_WORKERS = IS_FULL ? Math.min(10, Math.max(2, os.cpus().length - 2)) : 2

// =================================================================================================
// SECTION 0: HARNESS, D_4 ROOTS, FULL W(F_4) (ORDER 1,152), EXACT BIGINT RATIONAL FORMATTING
// =================================================================================================

type GateRow = { readonly id: string; readonly title: string; readonly passed: boolean; readonly detail: string }
const GATES: GateRow[] = []

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

function recordGate(id: string, title: string, passed: boolean, detail: string): void {
  const rss = (process.memoryUsage().rss / (1024 * 1024)).toFixed(1)
  GATES.push({ id, title, passed, detail })
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${id} | ${title} [RSS ${rss} MB]`)
  console.log(`         -> ${detail}`)
  assertExact(passed, `Gate ${id} failed: ${detail}`)
}

type Root4 = readonly [number, number, number, number]

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si; v[j] = sj
          roots.push(v)
        }
      }
    }
  }
  return roots
})()

const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

const ADJ_MASK = new Int32Array(24)
for (let a = 0; a < 24; a++) {
  let mask = 0
  for (let b = 0; b < 24; b++) if (dot4(ROOTS[a]!, ROOTS[b]!) === 1) mask |= 1 << b
  ADJ_MASK[a] = mask
}
const ALL24 = (1 << 24) - 1

function permMask(perm: Uint8Array, mask: number): number {
  let out = 0, m = mask
  while (m !== 0) {
    const bit = m & -m
    out |= 1 << perm[Math.clz32(bit) ^ 31]!
    m ^= bit
  }
  return out
}

function popcount(m: number): number {
  let c = 0, x = m
  while (x !== 0) { x &= x - 1; c++ }
  return c
}

function bitsOf(mask: number): number[] {
  const out: number[] = []
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out.push(Math.clz32(bit) ^ 31)
    m ^= bit
  }
  return out
}

const WF4: readonly Uint8Array[] = (() => {
  const simpleRoots: readonly Root4[] = [
    [0, 1, -1, 0], [0, 0, 1, -1], [0, 0, 0, 1], [1, -1, -1, -1],
  ]
  const gens = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let s = 0; s < 24; s++) {
      const v = ROOTS[s]!, twoVa = 2 * dot4(v, alpha)
      const img: [number, number, number, number] = [
        v[0] - (twoVa * alpha[0]) / aa,
        v[1] - (twoVa * alpha[1]) / aa,
        v[2] - (twoVa * alpha[2]) / aa,
        v[3] - (twoVa * alpha[3]) / aa,
      ]
      const idx = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
      assertExact(idx >= 0, 'W(F_4) reflection left D_4')
      perm[s] = idx
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elems: Uint8Array[] = [id]
  const seen = new Set<string>([id.join(',')])
  for (let head = 0; head < elems.length; head++) {
    const cur = elems[head]!
    for (const g of gens) {
      const nxt = new Uint8Array(24)
      for (let i = 0; i < 24; i++) nxt[i] = g[cur[i]!]!
      const k = nxt.join(',')
      if (!seen.has(k)) { seen.add(k); elems.push(nxt) }
    }
  }
  assertExact(elems.length === 1152, `|W(F_4)| must be 1152, got ${elems.length}`)
  return elems
})()

const WF4_FLAT_SAB = new SharedArrayBuffer(1152 * 24)
const WF4_FLAT = new Uint8Array(WF4_FLAT_SAB)
for (let i = 0; i < 1152; i++) WF4_FLAT.set(WF4[i]!, i * 24)

const WF4_MUL_SAB = new SharedArrayBuffer(1152 * 1152 * 2)
const WF4_MUL = new Uint16Array(WF4_MUL_SAB)
const WF4_INV_SAB = new SharedArrayBuffer(1152 * 2)
const WF4_INV = new Uint16Array(WF4_INV_SAB)
{
  const keyToIdx = new Map<string, number>()
  for (let i = 0; i < 1152; i++) keyToIdx.set(WF4[i]!.join(','), i)
  const tmp = new Uint8Array(24)
  for (let p = 0; p < 1152; p++) {
    for (let q = 0; q < 1152; q++) {
      for (let i = 0; i < 24; i++) tmp[i] = WF4[p]![WF4[q]![i]!]!
      const idx = keyToIdx.get(tmp.join(','))!
      WF4_MUL[p * 1152 + q] = idx
      if (idx === 0) WF4_INV[p] = q
    }
  }
}

const CANON_CLIQUE = new Map<number, { readonly id: number; readonly canon: number; readonly permIds: readonly number[] }>()
const CLIQUE_MASK_LIST: number[] = []
{
  const cliques: number[] = []
  for (let a = 0; a < 24; a++) {
    cliques.push(1 << a)
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      cliques.push((1 << a) | (1 << b))
      for (let c = b + 1; c < 24; c++) {
        if ((ADJ_MASK[a]! & (1 << c)) !== 0 && (ADJ_MASK[b]! & (1 << c)) !== 0) {
          cliques.push((1 << a) | (1 << b) | (1 << c))
        }
      }
    }
  }
  for (const m of cliques) {
    let minM = 0x7fffffff
    for (let pi = 0; pi < 1152; pi++) { const pm = permMask(WF4[pi]!, m); if (pm < minM) minM = pm }
    const permIds: number[] = []
    for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === minM) permIds.push(pi)
    CANON_CLIQUE.set(m, { id: CLIQUE_MASK_LIST.length, canon: minM, permIds })
    CLIQUE_MASK_LIST.push(m)
  }
}

const CANON_FLAG = new Map<string, { readonly canonC: number; readonly canonB: number; readonly permIds: readonly number[] }>()
for (const [m, info] of CANON_CLIQUE) {
  for (const b of bitsOf(m)) {
    let minB = 99
    for (const pi of info.permIds) if (WF4[pi]![b]! < minB) minB = WF4[pi]![b]!
    CANON_FLAG.set(`${m}:${b}`, {
      canonC: info.canon,
      canonB: minB,
      permIds: info.permIds.filter(pi => WF4[pi]![b] === minB),
    })
  }
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a, y = b < 0n ? -b : b
  while (y !== 0n) { const t = x % y; x = y; y = t }
  return x
}

function ratCeilDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(den > 0n && num >= 0n, 'ratCeilDec expects non-negative fraction')
  const scale = 10n ** BigInt(digits)
  const scaled = (num * scale + den - 1n) / den
  return `${scaled / scale}.${(scaled % scale).toString().padStart(digits, '0')}`
}

function ratFloorDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(den > 0n && num >= 0n, 'ratFloorDec expects non-negative fraction')
  const scale = 10n ** BigInt(digits)
  const scaled = (num * scale) / den
  return `${scaled / scale}.${(scaled % scale).toString().padStart(digits, '0')}`
}

function floatFloorDec(x: number, digits = 6): string {
  const scale = 10 ** digits
  const scaled = Math.floor(x * scale)
  return `${Math.floor(scaled / scale)}.${String(scaled % scale).padStart(digits, '0')}`
}

// =================================================================================================
// SECTION 1: NONLINEAR PERRON-FROBENIUS SOLVER (SINGLE-THREADED & MULTI-THREADED SAB) + BIGINT CERT
// =================================================================================================

type PerronSolution = {
  readonly upper: number
  readonly dual: number
  readonly f: Float64Array
  readonly w: Float64Array
  readonly b: Float64Array
  readonly theta: Float64Array
  readonly iters: number
}

function solveNonlinearPerron(
  nC: number,
  nV: number,
  aOff: Int32Array,
  aEdge: Int32Array,
  aMult: Uint8Array,
  bOff: Int32Array,
  bEdge: Int32Array,
  bMult: Uint8Array,
  nIters = 1500,
  warm?: { readonly b: Float64Array; readonly w: Float64Array; readonly theta: Float64Array },
): PerronSolution {
  const owner = new Int32Array(nV).fill(-1), dMult = new Uint8Array(nV)
  for (let v = 0; v < nC; v++) {
    for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) {
      const e = bEdge[i]!
      assertExact(owner[e] === -1, `Unique-owner violated for flag ${e}`)
      owner[e] = v; dMult[e] = bMult[i]!
    }
  }
  const theta = warm ? Float64Array.from(warm.theta) : new Float64Array(nV)
  if (!warm) {
    for (let v = 1; v < nC; v++) {
      let sumD = 0
      for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) sumD += bMult[i]!
      for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) theta[bEdge[i]!] = bMult[i]! / sumD
    }
  }
  const b = warm ? Float64Array.from(warm.b) : new Float64Array(nC).fill(6.0)
  const w = warm ? Float64Array.from(warm.w) : new Float64Array(nC).fill(1 / (nC - 1))
  w[0] = 0
  const y = new Float64Array(nC), f = new Float64Array(nV), aSum = new Float64Array(nC)
  const wNext = new Float64Array(nC), denD = new Float64Array(nV)
  let bestUpper = 24, bestDual = 0
  const bestF = new Float64Array(nV), bestW = new Float64Array(nC), bestB = new Float64Array(nC), bestTheta = new Float64Array(nV)

  let itDone = 0
  for (let it = 0; it < nIters; it++) {
    itDone = it + 1
    for (let v = 1; v < nC; v++) y[v] = 1 / b[v]!
    for (let e = 0; e < nV; e++) f[e] = (dMult[e]! / theta[e]!) * y[owner[e]!]!
    let maxS = 0
    for (let i = aOff[0]!, end = aOff[1]!; i < end; i++) maxS += aMult[i]! * f[aEdge[i]!]!
    for (let v = 1; v < nC; v++) {
      let a = 0
      for (let i = aOff[v]!, end = aOff[v + 1]!; i < end; i++) a += aMult[i]! * f[aEdge[i]!]!
      aSum[v] = a
      const sv = a + b[v]!
      if (sv > maxS) maxS = sv
    }
    if (maxS < bestUpper) { bestUpper = maxS; bestF.set(f); bestB.set(b); bestTheta.set(theta) }
    denD.fill(0)
    for (let v = 1; v < nC; v++) {
      const wv = w[v]!
      if (wv === 0) continue
      for (let i = aOff[v]!, end = aOff[v + 1]!; i < end; i++) denD[aEdge[i]!] = denD[aEdge[i]!]! + wv * aMult[i]!
    }
    if (it % 20 === 0 || it === nIters - 1) {
      let dual = 0
      for (let e = 0; e < nV; e++) {
        const de = denD[e]!, nu = w[owner[e]!]! * dMult[e]!
        if (de > 0 && nu > 0) dual += 2 * Math.sqrt(nu * de)
      }
      if (dual > bestDual) { bestDual = dual; bestW.set(w) }
      if (bestUpper - bestDual < 1e-8) break
    }
    let sumW = 0
    for (let u = 1; u < nC; u++) {
      let acc = 0
      for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) acc += denD[bEdge[i]!]! * f[bEdge[i]!]!
      const nw = acc / b[u]!; wNext[u] = nw; sumW += nw
    }
    if (sumW > 0) {
      const inv = 1 / sumW
      for (let u = 1; u < nC; u++) w[u] = 0.5 * w[u]! + 0.5 * (wNext[u]! * inv)
    }
    for (let v = 1; v < nC; v++) b[v] = 0.5 * b[v]! + 0.5 * (maxS - aSum[v]!)
    let wA = 0, wB = 0
    for (let v = 1; v < nC; v++) { wA += w[v]! * aSum[v]!; wB += w[v]! * b[v]! }
    if (wA > 0 && wB > 0) {
      const sb = Math.sqrt(wA / wB)
      for (let v = 1; v < nC; v++) b[v] = b[v]! * sb
    }
    if (it >= 25 && it % 15 === 0) {
      for (let u = 1; u < nC; u++) {
        const start = bOff[u]!, end = bOff[u + 1]!
        if (end - start <= 1) continue
        let sumSq = 0
        for (let i = start; i < end; i++) sumSq += Math.sqrt(bMult[i]! * (denD[bEdge[i]!]! + 1e-30))
        if (sumSq <= 0) continue
        for (let i = start; i < end; i++) {
          const e = bEdge[i]!
          theta[e] = 0.5 * theta[e]! + 0.5 * (Math.sqrt(bMult[i]! * (denD[e]! + 1e-30)) / sumSq)
        }
        let sn = 0
        for (let i = start; i < end; i++) sn += theta[bEdge[i]!]!
        for (let i = start; i < end; i++) theta[bEdge[i]!] = theta[bEdge[i]!]! / sn
      }
    }
  }
  return { upper: bestUpper, dual: bestDual, f: bestF, w: bestW, b: bestB, theta: bestTheta, iters: itDone }
}

const PERRON_WORKER_JS = `
const { parentPort, workerData } = require('node:worker_threads');
const { vStart, vEnd, aOffSab, aEdgeSab, aMultSab, bOffSab, bEdgeSab, bMultSab, fSab, bSab, wSab, aSumSab, denDSab } = workerData;
const aOff = new Int32Array(aOffSab);
const aEdge = new Int32Array(aEdgeSab);
const aMult = new Uint8Array(aMultSab);
const bOff = new Int32Array(bOffSab);
const bEdge = new Int32Array(bEdgeSab);
const bMult = new Uint8Array(bMultSab);
const f = new Float64Array(fSab);
const b = new Float64Array(bSab);
const w = new Float64Array(wSab);
const aSum = new Float64Array(aSumSab);
const denDLocal = new Float64Array(denDSab);

parentPort.on('message', (msg) => {
  if (msg.cmd === 'step') {
    let maxS = 0;
    denDLocal.fill(0);
    for (let v = vStart; v < vEnd; v++) {
      let a = 0;
      const start = aOff[v], end = aOff[v + 1];
      for (let i = start; i < end; i++) a += aMult[i] * f[aEdge[i]];
      aSum[v] = a;
      const sv = v === 0 ? a : a + b[v];
      if (sv > maxS) maxS = sv;
      if (v > 0) {
        const wv = w[v];
        if (wv !== 0) {
          for (let i = start; i < end; i++) denDLocal[aEdge[i]] += wv * aMult[i];
        }
      }
    }
    parentPort.postMessage({ maxS });
  } else if (msg.cmd === 'cert') {
    const pInts = new Int32Array(msg.pSab);
    const Q = BigInt(msg.Qnum);
    const Q2 = Q * Q;
    let maxNum = 0n;
    let maxDen = 1n;
    for (let u = vStart; u < vEnd; u++) {
      let prodB = 1n;
      for (let i = bOff[u], end = bOff[u + 1]; i < end; i++) prodB *= BigInt(pInts[bEdge[i]]);
      let sumA = 0n;
      for (let i = aOff[u], end = aOff[u + 1]; i < end; i++) sumA += BigInt(aMult[i]) * BigInt(pInts[aEdge[i]]);
      let sumB = 0n;
      for (let i = bOff[u], end = bOff[u + 1]; i < end; i++) sumB += BigInt(bMult[i]) * (prodB / BigInt(pInts[bEdge[i]]));
      const num = sumA * prodB + Q2 * sumB;
      const den = Q * prodB;
      if (num * maxDen > maxNum * den) { maxNum = num; maxDen = den; }
    }
    parentPort.postMessage({ maxNum: maxNum.toString(), maxDen: maxDen.toString() });
  } else if (msg.cmd === 'quit') {
    process.exit(0);
  }
});
`

async function solveNonlinearPerronAndCertParallel(
  nC: number,
  nV: number,
  aOff: Int32Array,
  aEdge: Int32Array,
  aMult: Uint8Array,
  bOff: Int32Array,
  bEdge: Int32Array,
  bMult: Uint8Array,
  nIters: number,
  qList: readonly number[],
  warm?: { readonly b: Float64Array; readonly w: Float64Array; readonly theta: Float64Array },
): Promise<{
  readonly sol: PerronSolution
  readonly certs: readonly { readonly Q: number; readonly num: bigint; readonly den: bigint }[]
}> {
  const nW = Math.min(N_WORKERS, Math.max(2, Math.floor(nC / 100)))
  const aOffSab = new SharedArrayBuffer(aOff.byteLength)
  const aEdgeSab = new SharedArrayBuffer(aEdge.byteLength)
  const aMultSab = new SharedArrayBuffer(aMult.byteLength)
  const bOffSab = new SharedArrayBuffer(bOff.byteLength)
  const bEdgeSab = new SharedArrayBuffer(bEdge.byteLength)
  const bMultSab = new SharedArrayBuffer(bMult.byteLength)
  new Int32Array(aOffSab).set(aOff)
  new Int32Array(aEdgeSab).set(aEdge)
  new Uint8Array(aMultSab).set(aMult)
  new Int32Array(bOffSab).set(bOff)
  new Int32Array(bEdgeSab).set(bEdge)
  new Uint8Array(bMultSab).set(bMult)

  const fSab = new SharedArrayBuffer(nV * 8)
  const bSab = new SharedArrayBuffer(nC * 8)
  const wSab = new SharedArrayBuffer(nC * 8)
  const aSumSab = new SharedArrayBuffer(nC * 8)
  const f = new Float64Array(fSab), b = new Float64Array(bSab), w = new Float64Array(wSab), aSum = new Float64Array(aSumSab)

  const denDLocals: Float64Array[] = []
  const workers: Worker[] = []
  const chunk = Math.ceil(nC / nW)
  for (let wi = 0; wi < nW; wi++) {
    const vStart = wi * chunk
    const vEnd = Math.min(nC, vStart + chunk)
    const dSab = new SharedArrayBuffer(nV * 8)
    denDLocals.push(new Float64Array(dSab))
    workers.push(
      new Worker(PERRON_WORKER_JS, {
        eval: true,
        workerData: { vStart, vEnd, aOffSab, aEdgeSab, aMultSab, bOffSab, bEdgeSab, bMultSab, fSab, bSab, wSab, aSumSab, denDSab: dSab },
      }),
    )
  }

  const callAll = <T>(msg: object): Promise<T[]> =>
    Promise.all(
      workers.map(
        wk =>
          new Promise<T>((resolve, reject) => {
            const onMsg = (m: T) => { wk.off('error', onErr); resolve(m) }
            const onErr = (err: Error) => { wk.off('message', onMsg); reject(err) }
            wk.once('message', onMsg)
            wk.once('error', onErr)
            wk.postMessage(msg)
          }),
      ),
    )

  try {
    const owner = new Int32Array(nV).fill(-1), dMult = new Uint8Array(nV)
    for (let v = 0; v < nC; v++) {
      for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) {
        const e = bEdge[i]!
        assertExact(owner[e] === -1, `Unique-owner violated for flag ${e}`)
        owner[e] = v; dMult[e] = bMult[i]!
      }
    }
    const theta = warm ? Float64Array.from(warm.theta) : new Float64Array(nV)
    if (!warm) {
      for (let v = 1; v < nC; v++) {
        let sumD = 0
        for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) sumD += bMult[i]!
        for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) theta[bEdge[i]!] = bMult[i]! / sumD
      }
    }
    if (warm) { b.set(warm.b); w.set(warm.w) } else { b.fill(6.0); w.fill(1 / (nC - 1)) }
    w[0] = 0
    const y = new Float64Array(nC), wNext = new Float64Array(nC), denD = new Float64Array(nV)
    let bestUpper = 24, bestDual = 0
    const bestF = new Float64Array(nV), bestW = new Float64Array(nC), bestB = new Float64Array(nC), bestTheta = new Float64Array(nV)

    let itDone = 0
    for (let it = 0; it < nIters; it++) {
      itDone = it + 1
      for (let v = 1; v < nC; v++) y[v] = 1 / b[v]!
      for (let e = 0; e < nV; e++) f[e] = (dMult[e]! / theta[e]!) * y[owner[e]!]!

      const res = await callAll<{ readonly maxS: number }>({ cmd: 'step' })
      let maxS = 0
      for (let wi = 0; wi < nW; wi++) if (res[wi]!.maxS > maxS) maxS = res[wi]!.maxS

      if (maxS < bestUpper) { bestUpper = maxS; bestF.set(f); bestB.set(b); bestTheta.set(theta) }

      denD.fill(0)
      for (let wi = 0; wi < nW; wi++) {
        const loc = denDLocals[wi]!
        for (let e = 0; e < nV; e++) denD[e] = denD[e]! + loc[e]!
      }

      if (it % 20 === 0 || it === nIters - 1) {
        let dual = 0
        for (let e = 0; e < nV; e++) {
          const de = denD[e]!, nu = w[owner[e]!]! * dMult[e]!
          if (de > 0 && nu > 0) dual += 2 * Math.sqrt(nu * de)
        }
        if (dual > bestDual) { bestDual = dual; bestW.set(w) }
        if (bestUpper - bestDual < 1e-7) break
      }

      let sumW = 0
      for (let u = 1; u < nC; u++) {
        let acc = 0
        for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) acc += denD[bEdge[i]!]! * f[bEdge[i]!]!
        const nw = acc / b[u]!; wNext[u] = nw; sumW += nw
      }
      if (sumW > 0) {
        const inv = 1 / sumW
        for (let u = 1; u < nC; u++) w[u] = 0.5 * w[u]! + 0.5 * (wNext[u]! * inv)
      }
      for (let v = 1; v < nC; v++) b[v] = 0.5 * b[v]! + 0.5 * (maxS - aSum[v]!)
      let wA = 0, wB = 0
      for (let v = 1; v < nC; v++) { wA += w[v]! * aSum[v]!; wB += w[v]! * b[v]! }
      if (wA > 0 && wB > 0) {
        const sb = Math.sqrt(wA / wB)
        for (let v = 1; v < nC; v++) b[v] = b[v]! * sb
      }
      if (it >= 25 && it % 15 === 0) {
        for (let u = 1; u < nC; u++) {
          const start = bOff[u]!, end = bOff[u + 1]!
          if (end - start <= 1) continue
          let sumSq = 0
          for (let i = start; i < end; i++) sumSq += Math.sqrt(bMult[i]! * (denD[bEdge[i]!]! + 1e-30))
          if (sumSq <= 0) continue
          for (let i = start; i < end; i++) {
            const e = bEdge[i]!
            theta[e] = 0.5 * theta[e]! + 0.5 * (Math.sqrt(bMult[i]! * (denD[e]! + 1e-30)) / sumSq)
          }
          let sn = 0
          for (let i = start; i < end; i++) sn += theta[bEdge[i]!]!
          for (let i = start; i < end; i++) theta[bEdge[i]!] = theta[bEdge[i]!]! / sn
        }
      }
    }

    const certs: { readonly Q: number; readonly num: bigint; readonly den: bigint }[] = []
    for (const Qnum of qList) {
      const pSab = new SharedArrayBuffer(nV * 4)
      const pInts = new Int32Array(pSab)
      for (let e = 0; e < nV; e++) pInts[e] = Math.max(1, Math.round(bestF[e]! * Qnum))
      const cRes = await callAll<{ readonly maxNum: string; readonly maxDen: string }>({ cmd: 'cert', Qnum, pSab })
      let gNum = 0n, gDen = 1n
      for (const r of cRes) {
        const rn = BigInt(r.maxNum), rd = BigInt(r.maxDen)
        if (rn * gDen > gNum * rd) { gNum = rn; gDen = rd }
      }
      const g = gcdBig(gNum, gDen)
      certs.push({ Q: Qnum, num: gNum / g, den: gDen / g })
    }

    return { sol: { upper: bestUpper, dual: bestDual, f: bestF, w: bestW, b: bestB, theta: bestTheta, iters: itDone }, certs }
  } finally {
    for (const wk of workers) wk.terminate()
  }
}

function certifyBigIntSync(
  nC: number, nV: number, aOff: Int32Array, aEdge: Int32Array, aMult: Uint8Array,
  bOff: Int32Array, bEdge: Int32Array, bMult: Uint8Array, fFloat: Float64Array, Qnum: number,
): { readonly num: bigint; readonly den: bigint } {
  const p = new Int32Array(nV)
  for (let e = 0; e < nV; e++) p[e] = Math.max(1, Math.round(fFloat[e]! * Qnum))
  const Q = BigInt(Qnum), Q2 = Q * Q
  let maxNum = 0n, maxDen = 1n
  for (let u = 0; u < nC; u++) {
    let prodB = 1n
    for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) prodB *= BigInt(p[bEdge[i]!]!)
    let sumA = 0n
    for (let i = aOff[u]!, end = aOff[u + 1]!; i < end; i++) sumA += BigInt(aMult[i]!) * BigInt(p[aEdge[i]!]!)
    let sumB = 0n
    for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) sumB += BigInt(bMult[i]!) * (prodB / BigInt(p[bEdge[i]!]!))
    const num = sumA * prodB + Q2 * sumB, den = Q * prodB
    if (num * maxDen > maxNum * den) { maxNum = num; maxDen = den }
  }
  const g = gcdBig(maxNum, maxDen)
  return { num: maxNum / g, den: maxDen / g }
}

// =================================================================================================
// SECTION 2: EXACT SUFFIX AUTOMATA S_2..S_5 + PARALLEL DEPTH-6 S_6 ENGINE
// =================================================================================================

type D2State = { readonly c0: number; readonly downs: ReadonlyMap<number, number> }
type D3State = { readonly c0: number; readonly downs2: ReadonlyMap<number, D2State> }
type D4State = { readonly c0: number; readonly downs3: ReadonlyMap<number, D3State> }

function stepD2(state: D2State, b: number): D2State {
  const newC0 = (1 << b) | (state.c0 & ADJ_MASK[b]!)
  const newDowns = new Map<number, number>([[b, state.c0]])
  for (const a of bitsOf(state.c0 & ADJ_MASK[b]!)) newDowns.set(a, (1 << b) | (state.downs.get(a)! & ADJ_MASK[b]!))
  return { c0: newC0, downs: newDowns }
}

function stepD3(st: D3State, b: number): D3State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns2 = new Map<number, D2State>()
  const wDown1 = new Map<number, number>()
  for (const [x, d2x] of st.downs2) wDown1.set(x, d2x.c0)
  newDowns2.set(b, { c0: st.c0, downs: wDown1 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) newDowns2.set(a, stepD2(st.downs2.get(a)!, b))
  return { c0: newC0, downs2: newDowns2 }
}

function stepD4(st: D4State, b: number): D4State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns3 = new Map<number, D3State>()
  const wDown2 = new Map<number, D2State>()
  for (const [x, d3x] of st.downs3) {
    const dm1 = new Map<number, number>()
    for (const [y, d2y] of d3x.downs2) dm1.set(y, d2y.c0)
    wDown2.set(x, { c0: d3x.c0, downs: dm1 })
  }
  newDowns3.set(b, { c0: st.c0, downs2: wDown2 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) newDowns3.set(a, stepD3(st.downs3.get(a)!, b))
  return { c0: newC0, downs3: newDowns3 }
}

function encodeD2WithPerm(p: Uint8Array, st: D2State, c0Bits: readonly number[]): string {
  const pairs: [number, number][] = []
  for (const a of c0Bits) pairs.push([p[a]!, permMask(p, st.downs.get(a)!)])
  pairs.sort((x, y) => x[0] - y[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, dm] of pairs) key += ',' + pa.toString(36) + ':' + dm.toString(36)
  return key
}

function encodeD3WithPerm(p: Uint8Array, st: D3State, c0Bits: readonly number[]): string {
  const parts: [number, string][] = []
  for (const a of c0Bits) {
    const d2 = st.downs2.get(a)!
    const subPairs: [number, number][] = []
    for (const [x, dm] of d2.downs) subPairs.push([p[x]!, permMask(p, dm)])
    subPairs.sort((u, v) => u[0] - v[0])
    let s = permMask(p, d2.c0).toString(36)
    for (const [px, dm] of subPairs) s += '.' + px.toString(36) + ':' + dm.toString(36)
    parts.push([p[a]!, s])
  }
  parts.sort((u, v) => u[0] - v[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, s] of parts) key += '|' + pa.toString(36) + '=' + s
  return key
}

function encodeD4WithPerm(p: Uint8Array, st: D4State, c0Bits: readonly number[]): string {
  const parts: [number, string][] = []
  for (const a of c0Bits) {
    const d3 = st.downs3.get(a)!
    const subParts: [number, string][] = []
    for (const [x, d2] of d3.downs2) {
      const ss: [number, number][] = []
      for (const [y, dm] of d2.downs) ss.push([p[y]!, permMask(p, dm)])
      ss.sort((u, v) => u[0] - v[0])
      let s2 = permMask(p, d2.c0).toString(36)
      for (const [py, dm] of ss) s2 += '.' + py.toString(36) + ':' + dm.toString(36)
      subParts.push([p[x]!, s2])
    }
    subParts.sort((u, v) => u[0] - v[0])
    let s1 = permMask(p, d3.c0).toString(36)
    for (const [px, s2] of subParts) s1 += ';' + px.toString(36) + '=' + s2
    parts.push([p[a]!, s1])
  }
  parts.sort((u, v) => u[0] - v[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, s1] of parts) key += '|' + pa.toString(36) + '>' + s1
  return key
}

function applyPermD2(p: Uint8Array, st: D2State): D2State {
  const dm = new Map<number, number>()
  for (const [a, m] of st.downs) dm.set(p[a]!, permMask(p, m))
  return { c0: permMask(p, st.c0), downs: dm }
}

function applyPermD3(p: Uint8Array, st: D3State): D3State {
  const dm = new Map<number, D2State>()
  for (const [a, d2] of st.downs2) dm.set(p[a]!, applyPermD2(p, d2))
  return { c0: permMask(p, st.c0), downs2: dm }
}

function applyPermD4(p: Uint8Array, st: D4State): D4State {
  const dm = new Map<number, D3State>()
  for (const [a, d3] of st.downs3) dm.set(p[a]!, applyPermD3(p, d3))
  return { c0: permMask(p, st.c0), downs3: dm }
}

const S6_STEP_WORKER_JS = `
const { parentPort, workerData } = require('node:worker_threads');
const {
  wf4FlatSab, wf4MulSab, wf4InvSab, adjMaskArr,
  d5StepIdSab, d5StepPermSab, d5AutRowSab, d5MinCosetSab,
  canonIdByMaskEntries, canonMaskById, canonPermOff, canonPermList,
} = workerData;

const WF4_FLAT = new Uint8Array(wf4FlatSab);
const WF4_MUL = new Uint16Array(wf4MulSab);
const WF4_INV = new Uint16Array(wf4InvSab);
const ADJ_MASK = new Int32Array(adjMaskArr);
const d5StepId = new Int32Array(d5StepIdSab);
const d5StepPerm = new Uint16Array(d5StepPermSab);
const d5AutRow = new Int32Array(d5AutRowSab);
const d5MinCosetTbl = new Uint16Array(d5MinCosetSab);
const canonIdByMask = new Map(canonIdByMaskEntries);

function d5MinCoset(id, p) {
  const r = d5AutRow[id];
  return r < 0 ? p : d5MinCosetTbl[r * 1152 + p];
}

const tmpA = new Int32Array(3), tmpId = new Int32Array(3), tmpP = new Int32Array(3);
const curA = new Int32Array(3), curId = new Int32Array(3), curP = new Int32Array(3);

parentPort.on('message', (msg) => {
  if (msg.cmd === 'quit') process.exit(0);
  const { uList, c0Arr, kArr, selfIdArr, selfPArr, downAArr, downIdArr, downPArr } = msg;
  const nU = uList.length;
  const out = new Int32Array(nU * 24 * 15);
  let ptr = 0;

  for (let idx = 0; idx < nU; idx++) {
    const u = uList[idx], c0 = c0Arr[idx], ku = kArr[idx], selfId = selfIdArr[idx], selfP = selfPArr[idx], u3 = idx * 3;
    for (let b = 0; b < 24; b++) {
      if ((c0 & (1 << b)) !== 0) continue;
      const newC0 = (1 << b) | (c0 & ADJ_MASK[b]);
      let nk = 0;
      tmpA[nk] = b; tmpId[nk] = selfId; tmpP[nk] = selfP; nk++;
      const adjB = ADJ_MASK[b];
      for (let i = 0; i < ku; i++) {
        const a = downAArr[u3 + i];
        if ((adjB & (1 << a)) === 0) continue;
        const aid = downIdArr[u3 + i], ap = downPArr[u3 + i];
        const bLoc = WF4_FLAT[ap * 24 + b];
        const nxtId = d5StepId[aid * 24 + bLoc];
        const q = d5StepPerm[aid * 24 + bLoc];
        tmpA[nk] = a; tmpId[nk] = nxtId; tmpP[nk] = d5MinCoset(nxtId, WF4_MUL[q * 1152 + ap]); nk++;
      }
      const cid = canonIdByMask.get(newC0);
      const canonC0 = canonMaskById[cid];
      const pStart = canonPermOff[cid], pEnd = canonPermOff[cid + 1];

      let bestPerm = -1;
      let bA0 = 999, bId0 = 999999, bP0 = 99999;
      let bA1 = 999, bId1 = 999999, bP1 = 99999;
      let bA2 = 999, bId2 = 999999, bP2 = 99999;

      for (let pi = pStart; pi < pEnd; pi++) {
        const g = canonPermList[pi], gBase = g * 24, gInv = WF4_INV[g];
        for (let i = 0; i < nk; i++) {
          curA[i] = WF4_FLAT[gBase + tmpA[i]];
          const id = tmpId[i];
          curId[i] = id;
          curP[i] = d5MinCoset(id, WF4_MUL[tmpP[i] * 1152 + gInv]);
        }
        if (nk === 2 && curA[0] > curA[1]) {
          let t = curA[0]; curA[0] = curA[1]; curA[1] = t;
          t = curId[0]; curId[0] = curId[1]; curId[1] = t;
          t = curP[0]; curP[0] = curP[1]; curP[1] = t;
        } else if (nk === 3) {
          if (curA[0] > curA[1]) {
            let t = curA[0]; curA[0] = curA[1]; curA[1] = t;
            t = curId[0]; curId[0] = curId[1]; curId[1] = t;
            t = curP[0]; curP[0] = curP[1]; curP[1] = t;
          }
          if (curA[1] > curA[2]) {
            let t = curA[1]; curA[1] = curA[2]; curA[2] = t;
            t = curId[1]; curId[1] = curId[2]; curId[2] = t;
            t = curP[1]; curP[1] = curP[2]; curP[2] = t;
          }
          if (curA[0] > curA[1]) {
            let t = curA[0]; curA[0] = curA[1]; curA[1] = t;
            t = curId[0]; curId[0] = curId[1]; curId[1] = t;
            t = curP[0]; curP[0] = curP[1]; curP[1] = t;
          }
        }
        let better = bestPerm < 0;
        if (!better) {
          if (curA[0] !== bA0) better = curA[0] < bA0;
          else if (curId[0] !== bId0) better = curId[0] < bId0;
          else if (curP[0] !== bP0) better = curP[0] < bP0;
          else if (nk >= 2 && curA[1] !== bA1) better = curA[1] < bA1;
          else if (nk >= 2 && curId[1] !== bId1) better = curId[1] < bId1;
          else if (nk >= 2 && curP[1] !== bP1) better = curP[1] < bP1;
          else if (nk === 3 && curA[2] !== bA2) better = curA[2] < bA2;
          else if (nk === 3 && curId[2] !== bId2) better = curId[2] < bId2;
          else if (nk === 3 && curP[2] !== bP2) better = curP[2] < bP2;
        }
        if (better) {
          bestPerm = g;
          bA0 = curA[0]; bId0 = curId[0]; bP0 = curP[0];
          if (nk >= 2) { bA1 = curA[1]; bId1 = curId[1]; bP1 = curP[1]; }
          if (nk === 3) { bA2 = curA[2]; bId2 = curId[2]; bP2 = curP[2]; }
        }
      }
      out[ptr] = u; out[ptr + 1] = b; out[ptr + 2] = canonC0; out[ptr + 3] = nk;
      out[ptr + 4] = bA0; out[ptr + 5] = bId0; out[ptr + 6] = bP0;
      out[ptr + 7] = nk >= 2 ? bA1 : 0; out[ptr + 8] = nk >= 2 ? bId1 : 0; out[ptr + 9] = nk >= 2 ? bP1 : 0;
      out[ptr + 10] = nk === 3 ? bA2 : 0; out[ptr + 11] = nk === 3 ? bId2 : 0; out[ptr + 12] = nk === 3 ? bP2 : 0;
      out[ptr + 13] = bestPerm; out[ptr + 14] = WF4_FLAT[bestPerm * 24 + b];
      ptr += 15;
    }
  }
  parentPort.postMessage({ count: ptr / 15, buf: out.subarray(0, ptr) });
});
`

type UpperSuiteResult = {
  readonly d2Upper: string
  readonly d3Upper: string
  readonly d4Upper: string
  readonly d5Upper: string | null
  readonly d6States: number | null
  readonly d6Flags: number | null
  readonly d6FloatUpper: number | null
  readonly d6FloatDual: number | null
  readonly d6CertQ1M: { readonly num: bigint; readonly den: bigint; readonly dec6: string; readonly dec8: string } | null
  readonly d6CertQ10M: { readonly num: bigint; readonly den: bigint; readonly dec6: string; readonly dec8: string } | null
  readonly bestUpperNum: bigint
  readonly bestUpperDen: bigint
  readonly d4ParallelCheckErr: number
  readonly elapsedSec: number
}

async function runUpperBounds(): Promise<UpperSuiteResult> {
  const t0 = performance.now()
  console.log('\n=================================================================================')
  console.log(`PART 1 (${MODE_LABEL}): EXACT NAGNIBEDA UPPER BOUNDS (D2 -> D4${IS_FULL ? ' -> D5 -> PARALLEL D6' : ' SMOKE'})`)
  console.log('=================================================================================')

  // --- D2 (19 states, 23 flags) ---
  const d2States: D2State[] = [{ c0: 0, downs: new Map() }]
  const d2KeyToId = new Map<string, number>([['0', 0]])
  const d2FlagKey = new Map<string, number>()
  const getD2Flag = (st: D2State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!, c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD2WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d2FlagKey.get(best)
    if (id === undefined) { id = d2FlagKey.size; d2FlagKey.set(best, id) }
    return id
  }
  const aOff2 = new Int32Array(20), aE2 = new Int32Array(19 * 24), aM2 = new Uint8Array(19 * 24)
  const bOff2 = new Int32Array(20), bE2 = new Int32Array(19 * 3), bM2 = new Uint8Array(19 * 3)
  let ap2 = 0, bp2 = 0
  for (let u = 0; u < d2States.length; u++) {
    const st = d2States[u]!
    aOff2[u] = ap2
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD2(st, b), info = CANON_CLIQUE.get(nxt.c0)!, c0Bits = bitsOf(nxt.c0)
      let best = '', bp = 0
      for (const pi of info.permIds) {
        const k = encodeD2WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) { best = k; bp = pi }
      }
      if (!d2KeyToId.has(best)) { d2KeyToId.set(best, d2States.length); d2States.push(applyPermD2(WF4[bp]!, nxt)) }
      const fid = getD2Flag(nxt, b)
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of up) { aE2[ap2] = e; aM2[ap2] = c; ap2++ }
    bOff2[u] = bp2
    const dn = new Map<number, number>()
    for (const a of bitsOf(st.c0)) { const fid = getD2Flag(st, a); dn.set(fid, (dn.get(fid) ?? 0) + 1) }
    for (const [e, c] of dn) { bE2[bp2] = e; bM2[bp2] = c; bp2++ }
  }
  aOff2[19] = ap2; bOff2[19] = bp2
  assertExact(d2States.length === 19 && d2FlagKey.size === 23, 'D2 size mismatch')
  const sol2 = solveNonlinearPerron(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, 1200)
  assertExact(sol2.upper - sol2.dual < 1e-6, `D2 primal-dual gap did not converge: ${sol2.upper - sol2.dual}`)
  const c2 = certifyBigIntSync(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, sol2.f, 1_000_000)
  console.log(`  D2 [St_2(y), b] (    19 states,     23 vars): opt=${sol2.upper.toFixed(8)} dual=${sol2.dual.toFixed(8)} | BigInt Q=10^6 <= ${ratCeilDec(c2.num, c2.den, 6)}`)

  // --- D3 (169 states, 220 flags) ---
  const d3States: D3State[] = [{ c0: 0, downs2: new Map() }]
  const d3KeyToId = new Map<string, number>([['0', 0]])
  const d3FlagKey = new Map<string, number>()
  const getD3Flag = (st: D3State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!, c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD3WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d3FlagKey.get(best)
    if (id === undefined) { id = d3FlagKey.size; d3FlagKey.set(best, id) }
    return id
  }
  const aOff3 = new Int32Array(170), aE3 = new Int32Array(169 * 24), aM3 = new Uint8Array(169 * 24)
  const bOff3 = new Int32Array(170), bE3 = new Int32Array(169 * 3), bM3 = new Uint8Array(169 * 3)
  let ap3 = 0, bp3 = 0
  for (let u = 0; u < d3States.length; u++) {
    const st = d3States[u]!
    aOff3[u] = ap3
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD3(st, b), info = CANON_CLIQUE.get(nxt.c0)!, c0Bits = bitsOf(nxt.c0)
      let best = '', bp = 0
      for (const pi of info.permIds) {
        const k = encodeD3WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) { best = k; bp = pi }
      }
      if (!d3KeyToId.has(best)) { d3KeyToId.set(best, d3States.length); d3States.push(applyPermD3(WF4[bp]!, nxt)) }
      const fid = getD3Flag(nxt, b)
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of up) { aE3[ap3] = e; aM3[ap3] = c; ap3++ }
    bOff3[u] = bp3
    const dn = new Map<number, number>()
    for (const a of bitsOf(st.c0)) { const fid = getD3Flag(st, a); dn.set(fid, (dn.get(fid) ?? 0) + 1) }
    for (const [e, c] of dn) { bE3[bp3] = e; bM3[bp3] = c; bp3++ }
  }
  aOff3[169] = ap3; bOff3[169] = bp3
  assertExact(d3States.length === 169 && d3FlagKey.size === 220, 'D3 size mismatch')
  const sol3 = solveNonlinearPerron(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, 1200)
  assertExact(sol3.upper - sol3.dual < 1e-6, `D3 primal-dual gap did not converge: ${sol3.upper - sol3.dual}`)
  const c3 = certifyBigIntSync(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, sol3.f, 1_000_000)
  console.log(`  D3 [St_3(y), b] (   169 states,    220 vars): opt=${sol3.upper.toFixed(8)} dual=${sol3.dual.toFixed(8)} | BigInt Q=10^6 <= ${ratCeilDec(c3.num, c3.den, 6)}`)

  // --- D4 (2,197 states, 2,801 flags) ---
  const d4States: D4State[] = [{ c0: 0, downs3: new Map() }]
  const d4KeyToId = new Map<string, number>([['0', 0]])
  const d4Auts: number[][] = [Array.from({ length: 1152 }, (_, i) => i)]
  const d4StepId = new Int32Array(2197 * 24).fill(-1)
  const d4StepPerm = new Uint16Array(2197 * 24)
  const d4FlagKey = new Map<string, number>()
  const getD4Flag = (st: D4State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!, c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD4WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d4FlagKey.get(best)
    if (id === undefined) { id = d4FlagKey.size; d4FlagKey.set(best, id) }
    return id
  }
  const aOff4 = new Int32Array(2198), aE4 = new Int32Array(2197 * 24), aM4 = new Uint8Array(2197 * 24)
  const bOff4 = new Int32Array(2198), bE4 = new Int32Array(2197 * 3), bM4 = new Uint8Array(2197 * 3)
  let ap4 = 0, bp4 = 0
  for (let u = 0; u < d4States.length; u++) {
    const st = d4States[u]!
    aOff4[u] = ap4
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD4(st, b), info = CANON_CLIQUE.get(nxt.c0)!, c0Bits = bitsOf(nxt.c0)
      let best = '', bp = 0
      for (const pi of info.permIds) {
        const k = encodeD4WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) { best = k; bp = pi }
      }
      let v = d4KeyToId.get(best)
      if (v === undefined) {
        v = d4States.length
        d4KeyToId.set(best, v)
        const cRep = applyPermD4(WF4[bp]!, nxt)
        d4States.push(cRep)
        const cInfo = CANON_CLIQUE.get(cRep.c0)!, cBits = bitsOf(cRep.c0)
        const aut: number[] = []
        for (const pi of cInfo.permIds) if (encodeD4WithPerm(WF4[pi]!, cRep, cBits) === best) aut.push(pi)
        d4Auts.push(aut)
      }
      const fid = getD4Flag(nxt, b)
      d4StepId[u * 24 + b] = v; d4StepPerm[u * 24 + b] = bp
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of up) { aE4[ap4] = e; aM4[ap4] = c; ap4++ }
    bOff4[u] = bp4
    const dn = new Map<number, number>()
    for (const a of bitsOf(st.c0)) { const fid = getD4Flag(st, a); dn.set(fid, (dn.get(fid) ?? 0) + 1) }
    for (const [e, c] of dn) { bE4[bp4] = e; bM4[bp4] = c; bp4++ }
  }
  aOff4[2197] = ap4; bOff4[2197] = bp4
  assertExact(d4States.length === 2197 && d4FlagKey.size === 2801, 'D4 size mismatch')

  const expectedShells = [1n, 24n, 456n, 8376n, 153192n, 2800344n, 51187080n]
  {
    let curN = new Array<bigint>(2197).fill(0n)
    curN[0] = 1n
    for (let r = 1; r <= 6; r++) {
      const nxtN = new Array<bigint>(2197).fill(0n)
      for (let u = 0; u < 2197; u++) {
        const nu = curN[u]!
        if (nu === 0n) continue
        const base = u * 24
        for (let b = 0; b < 24; b++) { const v = d4StepId[base + b]!; if (v >= 0) nxtN[v] = nxtN[v]! + nu }
      }
      let sum = 0n
      for (let v = 1; v < 2197; v++) {
        const kv = BigInt(popcount(d4States[v]!.c0))
        assertExact(nxtN[v]! % kv === 0n, `S_4 integrality failed at r=${r}`)
        nxtN[v] = nxtN[v]! / kv; sum += nxtN[v]!
      }
      assertExact(sum === expectedShells[r], `S_4 shell sum mismatch at r=${r}`)
      curN = nxtN
    }
  }

  const sol4 = solveNonlinearPerron(2197, 2801, aOff4, aE4, aM4, bOff4, bE4, bM4, 1000)
  assertExact(sol4.upper - sol4.dual < 1e-6, `D4 primal-dual gap did not converge: ${sol4.upper - sol4.dual}`)
  const c4 = certifyBigIntSync(2197, 2801, aOff4, aE4, aM4, bOff4, bE4, bM4, sol4.f, 1_000_000)
  // Cold-start parallel SAB parity check (NO warm start) exercising full parallel update + theta loop
  const par4 = await solveNonlinearPerronAndCertParallel(2197, 2801, aOff4, aE4, aM4, bOff4, bE4, bM4, 1000, [1_000_000])
  assertExact(par4.sol.iters >= 100, `Cold-start parallel D4 exited too early: ${par4.sol.iters} iters`)
  assertExact(par4.sol.upper - par4.sol.dual < 1e-6, `Cold-start parallel D4 gap did not converge: ${par4.sol.upper - par4.sol.dual}`)
  const d4ParallelCheckErr = Math.abs(par4.sol.upper - sol4.upper)
  const par4Cert = par4.certs[0]!
  const par4BigIntDiff = Math.abs(
    Number((par4Cert.num * 1_000_000_000n) / par4Cert.den - (c4.num * 1_000_000_000n) / c4.den) / 1e9,
  )
  assertExact(d4ParallelCheckErr < 1e-6 && par4BigIntDiff < 2e-6, `Parallel D4 solver diverged: float=${d4ParallelCheckErr}, bigInt=${par4BigIntDiff}`)
  console.log(
    `  D4 [St_4(y), b] (  2197 states,   2801 vars): opt=${sol4.upper.toFixed(8)} dual=${sol4.dual.toFixed(8)} | BigInt Q=10^6 <= ${ratCeilDec(c4.num, c4.den, 6)} ` +
      `(cold-start parallel ${par4.sol.iters} iters: <= ${ratCeilDec(par4Cert.num, par4Cert.den, 6)}, |diff|=${d4ParallelCheckErr.toExponential(2)})`,
  )

  if (!IS_FULL) {
    // Smoke self-test of S6_STEP_WORKER_JS: instantiate, step real D4 states u=0 (k=0) and u=1 (k=1), verify exact output!
    const canonIdByMaskEntries: [number, number][] = []
    const canonMaskById = new Int32Array(CLIQUE_MASK_LIST.length)
    const canonPermOff = new Int32Array(CLIQUE_MASK_LIST.length + 1)
    const permFlatTmp: number[] = []
    for (const [mask, info] of CANON_CLIQUE) {
      canonIdByMaskEntries.push([mask, info.id])
      canonMaskById[info.id] = info.canon
      canonPermOff[info.id] = permFlatTmp.length
      for (const pi of info.permIds) permFlatTmp.push(pi)
    }
    canonPermOff[CLIQUE_MASK_LIST.length] = permFlatTmp.length
    const canonPermList = new Uint16Array(permFlatTmp)

    const mockStepIdSab = new SharedArrayBuffer(2197 * 24 * 4)
    const mockStepPermSab = new SharedArrayBuffer(2197 * 24 * 2)
    new Int32Array(mockStepIdSab).set(d4StepId)
    new Uint16Array(mockStepPermSab).set(d4StepPerm)
    const mockAutRowSab = new SharedArrayBuffer(2197 * 4)
    const mockAutRow = new Int32Array(mockAutRowSab).fill(-1)
    const mockNontriv: number[][] = []
    for (let u = 0; u < 2197; u++) {
      if (d4Auts[u]!.length > 1) { mockAutRow[u] = mockNontriv.length; mockNontriv.push(d4Auts[u]!) }
    }
    const mockMinCosetSab = new SharedArrayBuffer(mockNontriv.length * 1152 * 2)
    const mockMinCoset = new Uint16Array(mockMinCosetSab)
    for (let row = 0; row < mockNontriv.length; row++) {
      const aut = mockNontriv[row]!, base = row * 1152
      for (let p = 0; p < 1152; p++) {
        let mn = 1152
        for (let i = 0; i < aut.length; i++) { const hp = WF4_MUL[aut[i]! * 1152 + p]!; if (hp < mn) mn = hp }
        mockMinCoset[base + p] = mn
      }
    }
    const s6ProbeWk = new Worker(S6_STEP_WORKER_JS, {
      eval: true,
      workerData: {
        wf4FlatSab: WF4_FLAT_SAB, wf4MulSab: WF4_MUL_SAB, wf4InvSab: WF4_INV_SAB,
        adjMaskArr: Array.from(ADJ_MASK), d5StepIdSab: mockStepIdSab, d5StepPermSab: mockStepPermSab,
        d5AutRowSab: mockAutRowSab, d5MinCosetSab: mockMinCosetSab,
        canonIdByMaskEntries, canonMaskById, canonPermOff, canonPermList,
      },
    })
    let s6SmokeCount = 0
    try {
      const probeRes = await new Promise<{ readonly count: number; readonly buf: Int32Array }>((resolve, reject) => {
        s6ProbeWk.once('message', resolve)
        s6ProbeWk.once('error', reject)
        // Step state u=0 (root: c0=0, k=0) and u=1 (first shell: c0=1, k=1, downA=0, downId=0, downP=0)
        s6ProbeWk.postMessage({
          uList: Int32Array.from([0, 1]),
          c0Arr: Int32Array.from([0, 1]),
          kArr: Uint8Array.from([0, 1]),
          selfIdArr: Uint16Array.from([0, d4StepId[0]!]),
          selfPArr: Uint16Array.from([0, 0]),
          downAArr: Uint8Array.from([0, 0, 0, 0, 0, 0]),
          downIdArr: Uint16Array.from([0, 0, 0, 0, 0, 0]),
          downPArr: Uint16Array.from([0, 0, 0, 0, 0, 0]),
        })
      })
      s6SmokeCount = probeRes.count
      assertExact(s6SmokeCount === 24 + 23, `S6_STEP_WORKER_JS smoke count mismatch: ${s6SmokeCount}`)
      // Verify u=0 produces 24 k=1 transitions and u=1 produces 8 k=2 (adjacent to bit 0) + 15 k=1 transitions
      let k1Cnt = 0, k2Cnt = 0
      for (let r = 0; r < s6SmokeCount; r++) {
        const u = probeRes.buf[r * 15]!, nk = probeRes.buf[r * 15 + 3]!
        if (u === 0) assertExact(nk === 1, 'S6 worker u=0 must yield nk=1')
        else if (nk === 1) k1Cnt++
        else if (nk === 2) k2Cnt++
      }
      assertExact(k1Cnt === 15 && k2Cnt === 8, `S6 worker u=1 branch counts mismatch: k1=${k1Cnt}, k2=${k2Cnt}`)
    } finally {
      s6ProbeWk.terminate()
    }
    console.log(`  S6_STEP_WORKER_JS smoke boot & step verified: 2 states -> ${s6SmokeCount} exact transitions (k=1: 24+15, k=2: 8)`)

    recordGate(
      'S1.1',
      'Exact D2 -> D3 -> D4 Nagnibeda BigInt upper bounds + cold-start parallel SAB parity + S6 worker smoke check',
      c4.num * 1000000n <= 11447000n * c4.den &&
        c4.num * c3.den < c3.num * c4.den &&
        c3.num * c2.den < c2.num * c3.den &&
        d4ParallelCheckErr < 1e-6 &&
        par4.sol.iters >= 100 &&
        s6SmokeCount === 47,
      `D2<=${ratCeilDec(c2.num, c2.den, 6)} > D3<=${ratCeilDec(c3.num, c3.den, 6)} > D4<=${ratCeilDec(c4.num, c4.den, 6)}; cold par4(${par4.sol.iters} it) diff=${d4ParallelCheckErr.toExponential(2)}; S6 worker 47/47 ok`,
    )
    return {
      d2Upper: ratCeilDec(c2.num, c2.den, 6), d3Upper: ratCeilDec(c3.num, c3.den, 6), d4Upper: ratCeilDec(c4.num, c4.den, 6),
      d5Upper: null, d6States: null, d6Flags: null, d6FloatUpper: null, d6FloatDual: null, d6CertQ1M: null, d6CertQ10M: null,
      bestUpperNum: c4.num, bestUpperDen: c4.den, d4ParallelCheckErr, elapsedSec: (performance.now() - t0) / 1000,
    }
  }

  // --- FULL PRODUCTION: S_5 (34,523 states, 43,312 flags) -> PARALLEL S_6 (~600k states) ---
  const tD5 = performance.now()
  const D4_MIN_COSET = new Uint16Array(2197 * 1152)
  for (let u = 0; u < 2197; u++) {
    const aut = d4Auts[u]!, base = u * 1152
    if (aut.length === 1) { for (let p = 0; p < 1152; p++) D4_MIN_COSET[base + p] = p }
    else {
      for (let p = 0; p < 1152; p++) {
        let mn = 1152
        for (let i = 0; i < aut.length; i++) { const hp = WF4_MUL[aut[i]! * 1152 + p]!; if (hp < mn) mn = hp }
        D4_MIN_COSET[base + p] = mn
      }
    }
  }

  const MAX_D5 = 35000
  const d5C0 = new Int32Array(MAX_D5), d5K = new Uint8Array(MAX_D5)
  const d5SelfId = new Uint16Array(MAX_D5), d5SelfP = new Uint16Array(MAX_D5)
  const d5DownA = new Uint8Array(MAX_D5 * 3), d5DownId = new Uint16Array(MAX_D5 * 3), d5DownP = new Uint16Array(MAX_D5 * 3)
  const d5KeyToId = new Map<string, number>([['0', 0]])
  let nD5 = 1
  const d5StepIdSab = new SharedArrayBuffer(MAX_D5 * 24 * 4)
  const d5StepPermSab = new SharedArrayBuffer(MAX_D5 * 24 * 2)
  const d5StepId = new Int32Array(d5StepIdSab).fill(-1)
  const d5StepPerm = new Uint16Array(d5StepPermSab)
  const d5StepImgB = new Uint8Array(MAX_D5 * 24)

  const tmpA = new Int32Array(3), tmpId = new Int32Array(3), tmpP = new Int32Array(3)
  const curA = new Int32Array(3), curId = new Int32Array(3), curP = new Int32Array(3)

  for (let u = 0; u < nD5; u++) {
    const c0 = d5C0[u]!, ku = d5K[u]!, selfId = d5SelfId[u]!, selfP = d5SelfP[u]!, uBase = u * 3, stepBase = u * 24
    for (let b = 0; b < 24; b++) {
      if ((c0 & (1 << b)) !== 0) continue
      const newC0 = (1 << b) | (c0 & ADJ_MASK[b]!)
      let nk = 0
      tmpA[nk] = b; tmpId[nk] = selfId; tmpP[nk] = selfP; nk++
      const adjB = ADJ_MASK[b]!
      for (let i = 0; i < ku; i++) {
        const a = d5DownA[uBase + i]!
        if ((adjB & (1 << a)) === 0) continue
        const aid = d5DownId[uBase + i]!, ap = d5DownP[uBase + i]!
        const bLoc = WF4[ap]![b]!, nxtId = d4StepId[aid * 24 + bLoc]!, q = d4StepPerm[aid * 24 + bLoc]!
        tmpA[nk] = a; tmpId[nk] = nxtId; tmpP[nk] = D4_MIN_COSET[nxtId * 1152 + WF4_MUL[q * 1152 + ap]!]!; nk++
      }
      const info = CANON_CLIQUE.get(newC0)!, permIds = info.permIds
      let bestPerm = -1
      let bA0 = 999, bId0 = 99999, bP0 = 99999, bA1 = 999, bId1 = 99999, bP1 = 99999, bA2 = 999, bId2 = 99999, bP2 = 99999
      for (let pi = 0; pi < permIds.length; pi++) {
        const g = permIds[pi]!, gArr = WF4[g]!, gInv = WF4_INV[g]!
        for (let i = 0; i < nk; i++) {
          curA[i] = gArr[tmpA[i]!]!
          const id = tmpId[i]!
          curId[i] = id
          curP[i] = D4_MIN_COSET[id * 1152 + WF4_MUL[tmpP[i]! * 1152 + gInv]!]!
        }
        if (nk === 2 && curA[0]! > curA[1]!) {
          let t = curA[0]!; curA[0] = curA[1]!; curA[1] = t
          t = curId[0]!; curId[0] = curId[1]!; curId[1] = t
          t = curP[0]!; curP[0] = curP[1]!; curP[1] = t
        } else if (nk === 3) {
          if (curA[0]! > curA[1]!) {
            let t = curA[0]!; curA[0] = curA[1]!; curA[1] = t
            t = curId[0]!; curId[0] = curId[1]!; curId[1] = t
            t = curP[0]!; curP[0] = curP[1]!; curP[1] = t
          }
          if (curA[1]! > curA[2]!) {
            let t = curA[1]!; curA[1] = curA[2]!; curA[2] = t
            t = curId[1]!; curId[1] = curId[2]!; curId[2] = t
            t = curP[1]!; curP[1] = curP[2]!; curP[2] = t
          }
          if (curA[0]! > curA[1]!) {
            let t = curA[0]!; curA[0] = curA[1]!; curA[1] = t
            t = curId[0]!; curId[0] = curId[1]!; curId[1] = t
            t = curP[0]!; curP[0] = curP[1]!; curP[1] = t
          }
        }
        let better = bestPerm < 0
        if (!better) {
          if (curA[0]! !== bA0) better = curA[0]! < bA0
          else if (curId[0]! !== bId0) better = curId[0]! < bId0
          else if (curP[0]! !== bP0) better = curP[0]! < bP0
          else if (nk >= 2 && curA[1]! !== bA1) better = curA[1]! < bA1
          else if (nk >= 2 && curId[1]! !== bId1) better = curId[1]! < bId1
          else if (nk >= 2 && curP[1]! !== bP1) better = curP[1]! < bP1
          else if (nk === 3 && curA[2]! !== bA2) better = curA[2]! < bA2
          else if (nk === 3 && curId[2]! !== bId2) better = curId[2]! < bId2
          else if (nk === 3 && curP[2]! !== bP2) better = curP[2]! < bP2
        }
        if (better) {
          bestPerm = g
          bA0 = curA[0]!; bId0 = curId[0]!; bP0 = curP[0]!
          if (nk >= 2) { bA1 = curA[1]!; bId1 = curId[1]!; bP1 = curP[1]! }
          if (nk === 3) { bA2 = curA[2]!; bId2 = curId[2]!; bP2 = curP[2]! }
        }
      }
      const key =
        nk === 1 ? `${info.canon}|${bA0},${bId0},${bP0}` :
        nk === 2 ? `${info.canon}|${bA0},${bId0},${bP0}|${bA1},${bId1},${bP1}` :
        `${info.canon}|${bA0},${bId0},${bP0}|${bA1},${bId1},${bP1}|${bA2},${bId2},${bP2}`
      let v = d5KeyToId.get(key)
      if (v === undefined) {
        v = nD5++
        d5KeyToId.set(key, v)
        d5C0[v] = info.canon; d5K[v] = nk
        const bLocS = WF4[selfP]![b]!, nSelfId = d4StepId[selfId * 24 + bLocS]!, qS = d4StepPerm[selfId * 24 + bLocS]!
        d5SelfId[v] = nSelfId
        d5SelfP[v] = D4_MIN_COSET[nSelfId * 1152 + WF4_MUL[WF4_MUL[qS * 1152 + selfP]! * 1152 + WF4_INV[bestPerm]!]!]!
        const vBase = v * 3
        d5DownA[vBase] = bA0; d5DownId[vBase] = bId0; d5DownP[vBase] = bP0
        if (nk >= 2) { d5DownA[vBase + 1] = bA1; d5DownId[vBase + 1] = bId1; d5DownP[vBase + 1] = bP1 }
        if (nk === 3) { d5DownA[vBase + 2] = bA2; d5DownId[vBase + 2] = bId2; d5DownP[vBase + 2] = bP2 }
      }
      d5StepId[stepBase + b] = v; d5StepPerm[stepBase + b] = bestPerm; d5StepImgB[stepBase + b] = WF4[bestPerm]![b]!
    }
  }
  assertExact(nD5 === 34523, `Expected 34,523 S_5 states, got ${nD5}`)

  const s5Shells: bigint[] = [1n]
  {
    let curN = new Array<bigint>(nD5).fill(0n); curN[0] = 1n
    for (let r = 1; r <= 7; r++) {
      const nxtN = new Array<bigint>(nD5).fill(0n)
      for (let u = 0; u < nD5; u++) {
        const nu = curN[u]!
        if (nu === 0n) continue
        const base = u * 24
        for (let b = 0; b < 24; b++) { const v = d5StepId[base + b]!; if (v >= 0) nxtN[v] = nxtN[v]! + nu }
      }
      let sum = 0n
      for (let v = 1; v < nD5; v++) {
        const kv = BigInt(d5K[v]!)
        assertExact(nxtN[v]! % kv === 0n, `S_5 integrality failed at r=${r}`)
        nxtN[v] = nxtN[v]! / kv; sum += nxtN[v]!
      }
      if (r <= 6) assertExact(sum === expectedShells[r], `S_5 shell sum mismatch at r=${r}`)
      s5Shells.push(sum); curN = nxtN
    }
  }

  const d5FlagId = new Int32Array(nD5 * 3).fill(-1)
  const d5AutRowSab = new SharedArrayBuffer(nD5 * 4)
  const d5AutRow = new Int32Array(d5AutRowSab).fill(-1)
  const d5NontrivAuts: number[][] = [Array.from({ length: 1152 }, (_, i) => i)]
  d5AutRow[0] = 0
  let nD5Flags = 0

  for (let v = 1; v < nD5; v++) {
    const k = d5K[v]!, vBase = v * 3, permIds = CANON_CLIQUE.get(d5C0[v]!)!.permIds
    const repSlot = [0, 1, 2], aut: number[] = []
    for (let pi = 0; pi < permIds.length; pi++) {
      const g = permIds[pi]!, gArr = WF4[g]!, gInv = WF4_INV[g]!
      let fixes = true
      const permOfSlot = [0, 0, 0]
      for (let i = 0; i < k; i++) {
        const ga = gArr[d5DownA[vBase + i]!]!
        let j = -1
        for (let t = 0; t < k; t++) if (d5DownA[vBase + t] === ga) { j = t; break }
        if (j < 0 || d5DownId[vBase + i] !== d5DownId[vBase + j]) { fixes = false; break }
        if (D4_MIN_COSET[d5DownId[vBase + i]! * 1152 + WF4_MUL[d5DownP[vBase + i]! * 1152 + gInv]!] !== d5DownP[vBase + j]) { fixes = false; break }
        permOfSlot[i] = j
      }
      if (fixes) {
        aut.push(g)
        if (k > 1) {
          for (let i = 0; i < k; i++) {
            const j = permOfSlot[i]!, mn = Math.min(repSlot[i]!, repSlot[j]!), mx = Math.max(repSlot[i]!, repSlot[j]!)
            for (let t = 0; t < k; t++) if (repSlot[t] === mx) repSlot[t] = mn
          }
        }
      }
    }
    if (aut.length > 1) { d5AutRow[v] = d5NontrivAuts.length; d5NontrivAuts.push(aut) }
    if (k === 1) { d5FlagId[vBase] = nD5Flags++ }
    else {
      const slotMap = new Map<number, number>()
      for (let i = 0; i < k; i++) {
        const r = repSlot[i]!
        let fid = slotMap.get(r)
        if (fid === undefined) { fid = nD5Flags++; slotMap.set(r, fid) }
        d5FlagId[vBase + i] = fid
      }
    }
  }
  assertExact(nD5Flags === 43312, `Expected 43,312 D5 flags, got ${nD5Flags}`)

  const d5MinCosetSab = new SharedArrayBuffer(d5NontrivAuts.length * 1152 * 2)
  const d5MinCosetTbl = new Uint16Array(d5MinCosetSab)
  for (let row = 0; row < d5NontrivAuts.length; row++) {
    const aut = d5NontrivAuts[row]!, base = row * 1152
    for (let p = 0; p < 1152; p++) {
      let mn = 1152
      for (let i = 0; i < aut.length; i++) { const hp = WF4_MUL[aut[i]! * 1152 + p]!; if (hp < mn) mn = hp }
      d5MinCosetTbl[base + p] = mn
    }
  }
  const d5MinCoset = (id: number, p: number): number => {
    const r = d5AutRow[id]!
    return r < 0 ? p : d5MinCosetTbl[r * 1152 + p]!
  }

  const aOff5 = new Int32Array(nD5 + 1), aE5 = new Int32Array(nD5 * 24), aM5 = new Uint8Array(nD5 * 24)
  const bOff5 = new Int32Array(nD5 + 1), bE5 = new Int32Array(nD5 * 3), bM5 = new Uint8Array(nD5 * 3)
  let a5 = 0, b5 = 0
  for (let u = 0; u < nD5; u++) {
    aOff5[u] = a5
    const sBase = u * 24, up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      const v = d5StepId[sBase + b]!
      if (v < 0) continue
      const imgB = d5StepImgB[sBase + b]!, kv = d5K[v]!, vBase = v * 3
      let slot = -1
      for (let i = 0; i < kv; i++) if (d5DownA[vBase + i] === imgB) { slot = i; break }
      assertExact(slot >= 0, `D5 missing downward slot at u=${u}, b=${b}, v=${v}`)
      const fid = d5FlagId[vBase + slot]!
      assertExact(fid >= 0, `D5 invalid flag id at v=${v}, slot=${slot}`)
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of up) { aE5[a5] = fid; aM5[a5] = m; a5++ }
    bOff5[u] = b5
    const ku = d5K[u]!, uBase = u * 3, dn = new Map<number, number>()
    for (let i = 0; i < ku; i++) {
      const fid = d5FlagId[uBase + i]!
      assertExact(fid >= 0, `D5 invalid downward flag id at u=${u}, i=${i}`)
      dn.set(fid, (dn.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of dn) { bE5[b5] = fid; bM5[b5] = m; b5++ }
  }
  aOff5[nD5] = a5; bOff5[nD5] = b5

  const par5 = await solveNonlinearPerronAndCertParallel(nD5, nD5Flags, aOff5, aE5, aM5, bOff5, bE5, bM5, 1200, [1_000_000])
  const sol5 = par5.sol, c5 = par5.certs[0]!
  assertExact(sol5.upper - sol5.dual < 1e-6, `D5 primal-dual gap did not converge: ${sol5.upper - sol5.dual}`)
  console.log(
    `  D5 [St_5(y), b] ( 34523 states,  43312 vars): opt=${sol5.upper.toFixed(8)} dual=${sol5.dual.toFixed(8)} | ` +
      `BigInt Q=10^6 <= ${ratCeilDec(c5.num, c5.den, 6)} | nontrivAut=${d5NontrivAuts.length}/${nD5} (${((performance.now() - tD5) / 1000).toFixed(2)}s)`,
  )

  const tD6 = performance.now()
  console.log(`  Expanding exact Depth-6 automaton S_6 across ${N_WORKERS} worker threads...`)

  const canonIdByMaskEntries: [number, number][] = []
  const canonMaskById = new Int32Array(CLIQUE_MASK_LIST.length)
  const canonPermOff = new Int32Array(CLIQUE_MASK_LIST.length + 1)
  const permFlatTmp: number[] = []
  for (const [mask, info] of CANON_CLIQUE) {
    canonIdByMaskEntries.push([mask, info.id])
    canonMaskById[info.id] = info.canon
    canonPermOff[info.id] = permFlatTmp.length
    for (const pi of info.permIds) permFlatTmp.push(pi)
  }
  canonPermOff[CLIQUE_MASK_LIST.length] = permFlatTmp.length
  const canonPermList = new Uint16Array(permFlatTmp)

  let capD6 = 750_000
  let d6C0 = new Int32Array(capD6), d6K = new Uint8Array(capD6)
  let d6SelfId = new Uint16Array(capD6), d6SelfP = new Uint16Array(capD6)
  let d6DownA = new Uint8Array(capD6 * 3), d6DownId = new Uint16Array(capD6 * 3), d6DownP = new Uint16Array(capD6 * 3)
  let d6StepId = new Int32Array(capD6 * 24).fill(-1), d6StepImgB = new Uint8Array(capD6 * 24)

  const growD6 = (): void => {
    const newCap = Math.floor(capD6 * 1.5)
    const gI32 = (old: Int32Array, m: number, fill = 0): Int32Array => { const n = new Int32Array(newCap * m); if (fill !== 0) n.fill(fill); n.set(old); return n }
    const gU16 = (old: Uint16Array, m: number): Uint16Array => { const n = new Uint16Array(newCap * m); n.set(old); return n }
    const gU8 = (old: Uint8Array, m: number): Uint8Array => { const n = new Uint8Array(newCap * m); n.set(old); return n }
    d6C0 = gI32(d6C0, 1); d6K = gU8(d6K, 1); d6SelfId = gU16(d6SelfId, 1); d6SelfP = gU16(d6SelfP, 1)
    d6DownA = gU8(d6DownA, 3); d6DownId = gU16(d6DownId, 3); d6DownP = gU16(d6DownP, 3)
    d6StepId = gI32(d6StepId, 24, -1); d6StepImgB = gU8(d6StepImgB, 24)
    capD6 = newCap
  }

  const HASH_MASK = (1 << 22) - 1
  const hashTable = new Int32Array(HASH_MASK + 1).fill(-1)
  hashTable[0] = 0

  const hashState = (c0: number, nk: number, a0: number, id0: number, p0: number, a1: number, id1: number, p1: number, a2: number, id2: number, p2: number): number => {
    let h = Math.imul(c0 ^ (nk * 0x9e3779b1), 0x85ebca6b)
    h = Math.imul(h ^ (a0 + (id0 << 5) + (p0 << 21)), 0xc2b2ae35)
    if (nk >= 2) h = Math.imul(h ^ (a1 + (id1 << 5) + (p1 << 21)), 0x27d4eb2f)
    if (nk === 3) h = Math.imul(h ^ (a2 + (id2 << 5) + (p2 << 21)), 0x165667b1)
    return (h ^ (h >>> 15)) & HASH_MASK
  }

  let nD6 = 1
  const findOrInsertD6 = (
    c0: number, nk: number, a0: number, id0: number, p0: number, a1: number, id1: number, p1: number,
    a2: number, id2: number, p2: number, parentSelfId: number, parentSelfP: number, b: number, bestPerm: number,
  ): number => {
    let slot = hashState(c0, nk, a0, id0, p0, a1, id1, p1, a2, id2, p2)
    while (true) {
      const existing = hashTable[slot]!
      if (existing < 0) break
      if (d6C0[existing] === c0 && d6K[existing] === nk) {
        const eb = existing * 3
        if (
          d6DownA[eb] === a0 && d6DownId[eb] === id0 && d6DownP[eb] === p0 &&
          (nk < 2 || (d6DownA[eb + 1] === a1 && d6DownId[eb + 1] === id1 && d6DownP[eb + 1] === p1)) &&
          (nk < 3 || (d6DownA[eb + 2] === a2 && d6DownId[eb + 2] === id2 && d6DownP[eb + 2] === p2))
        ) return existing
      }
      slot = (slot + 1) & HASH_MASK
    }
    if (nD6 >= capD6 - 1) growD6()
    const v = nD6++
    hashTable[slot] = v
    d6C0[v] = c0; d6K[v] = nk
    const bLocS = WF4[parentSelfP]![b]!, nSelfId = d5StepId[parentSelfId * 24 + bLocS]!, qS = d5StepPerm[parentSelfId * 24 + bLocS]!
    d6SelfId[v] = nSelfId
    d6SelfP[v] = d5MinCoset(nSelfId, WF4_MUL[WF4_MUL[qS * 1152 + parentSelfP]! * 1152 + WF4_INV[bestPerm]!]!)
    const vb = v * 3
    d6DownA[vb] = a0; d6DownId[vb] = id0; d6DownP[vb] = p0
    if (nk >= 2) { d6DownA[vb + 1] = a1; d6DownId[vb + 1] = id1; d6DownP[vb + 1] = p1 }
    if (nk === 3) { d6DownA[vb + 2] = a2; d6DownId[vb + 2] = id2; d6DownP[vb + 2] = p2 }
    return v
  }

  const stepWorkers: Worker[] = Array.from(
    { length: N_WORKERS },
    () =>
      new Worker(S6_STEP_WORKER_JS, {
        eval: true,
        workerData: {
          wf4FlatSab: WF4_FLAT_SAB, wf4MulSab: WF4_MUL_SAB, wf4InvSab: WF4_INV_SAB,
          adjMaskArr: Array.from(ADJ_MASK), d5StepIdSab, d5StepPermSab, d5AutRowSab, d5MinCosetSab,
          canonIdByMaskEntries, canonMaskById, canonPermOff, canonPermList,
        },
      }),
  )

  try {
    let head = 0
    const MAX_BATCH_PER_WORKER = 8000
    while (head < nD6) {
      const waveEnd = Math.min(nD6, head + MAX_BATCH_PER_WORKER * N_WORKERS)
      const count = waveEnd - head
      const nActive = Math.min(N_WORKERS, count)
      const chunkSz = Math.ceil(count / nActive)
      const promises: Promise<{ readonly count: number; readonly buf: Int32Array }>[] = []

      for (let wi = 0; wi < nActive; wi++) {
        const s = head + wi * chunkSz, e = Math.min(waveEnd, s + chunkSz), len = e - s
        if (len <= 0) continue
        const uList = new Int32Array(len), c0Arr = new Int32Array(len), kArr = new Uint8Array(len)
        const selfIdArr = new Uint16Array(len), selfPArr = new Uint16Array(len)
        const downAArr = new Uint8Array(len * 3), downIdArr = new Uint16Array(len * 3), downPArr = new Uint16Array(len * 3)
        for (let i = 0; i < len; i++) {
          const u = s + i
          uList[i] = u; c0Arr[i] = d6C0[u]!; kArr[i] = d6K[u]!; selfIdArr[i] = d6SelfId[u]!; selfPArr[i] = d6SelfP[u]!
          downAArr[i * 3] = d6DownA[u * 3]!; downAArr[i * 3 + 1] = d6DownA[u * 3 + 1]!; downAArr[i * 3 + 2] = d6DownA[u * 3 + 2]!
          downIdArr[i * 3] = d6DownId[u * 3]!; downIdArr[i * 3 + 1] = d6DownId[u * 3 + 1]!; downIdArr[i * 3 + 2] = d6DownId[u * 3 + 2]!
          downPArr[i * 3] = d6DownP[u * 3]!; downPArr[i * 3 + 1] = d6DownP[u * 3 + 1]!; downPArr[i * 3 + 2] = d6DownP[u * 3 + 2]!
        }
        const wk = stepWorkers[wi]!
        promises.push(
          new Promise((resolve, reject) => {
            const onMsg = (m: { readonly count: number; readonly buf: Int32Array }) => { wk.off('error', onErr); resolve(m) }
            const onErr = (err: Error) => { wk.off('message', onMsg); reject(err) }
            wk.once('message', onMsg); wk.once('error', onErr)
            wk.postMessage({ uList, c0Arr, kArr, selfIdArr, selfPArr, downAArr, downIdArr, downPArr })
          }),
        )
      }

      const batches = await Promise.all(promises)
      for (const batch of batches) {
        const buf = batch.buf, nRec = batch.count
        for (let r = 0; r < nRec; r++) {
          const o = r * 15, u = buf[o]!, b = buf[o + 1]!
          const v = findOrInsertD6(
            buf[o + 2]!, buf[o + 3]!, buf[o + 4]!, buf[o + 5]!, buf[o + 6]!, buf[o + 7]!, buf[o + 8]!, buf[o + 9]!,
            buf[o + 10]!, buf[o + 11]!, buf[o + 12]!, d6SelfId[u]!, d6SelfP[u]!, b, buf[o + 13]!,
          )
          d6StepId[u * 24 + b] = v; d6StepImgB[u * 24 + b] = buf[o + 14]!
        }
      }
      head = waveEnd
    }
  } finally {
    for (const wk of stepWorkers) wk.terminate()
  }
  console.log(`  Built exact Depth-6 automaton S_6: ${nD6.toLocaleString()} states in ${((performance.now() - tD6) / 1000).toFixed(2)}s`)

  {
    let curN = new Array<bigint>(nD6).fill(0n); curN[0] = 1n
    for (let r = 1; r <= 7; r++) {
      const nxtN = new Array<bigint>(nD6).fill(0n)
      for (let u = 0; u < nD6; u++) {
        const nu = curN[u]!
        if (nu === 0n) continue
        const base = u * 24
        for (let b = 0; b < 24; b++) { const v = d6StepId[base + b]!; if (v >= 0) nxtN[v] = nxtN[v]! + nu }
      }
      let sum = 0n
      for (let v = 1; v < nD6; v++) {
        const kv = BigInt(d6K[v]!)
        assertExact(nxtN[v]! % kv === 0n, `S_6 integrality failed at r=${r}, v=${v}`)
        nxtN[v] = nxtN[v]! / kv; sum += nxtN[v]!
      }
      assertExact(sum === s5Shells[r], `S_6 shell sum mismatch at r=${r}`)
      curN = nxtN
    }
    console.log(`  Verified exact BigInt S_6 shell sums r = 0..7 (up to ${s5Shells[7]!.toLocaleString()}) with 0 errors & exact integrality!`)
  }

  const d6FlagId = new Int32Array(nD6 * 3).fill(-1)
  let nD6Flags = 0
  for (let v = 1; v < nD6; v++) {
    const k = d6K[v]!, vBase = v * 3
    if (k === 1) { d6FlagId[vBase] = nD6Flags++; continue }
    const permIds = CANON_CLIQUE.get(d6C0[v]!)!.permIds
    const repSlot = [0, 1, 2]
    for (let pi = 0; pi < permIds.length; pi++) {
      const g = permIds[pi]!, gArr = WF4[g]!, gInv = WF4_INV[g]!
      let fixes = true
      const permOfSlot = [0, 0, 0]
      for (let i = 0; i < k; i++) {
        const ga = gArr[d6DownA[vBase + i]!]!
        let j = -1
        for (let t = 0; t < k; t++) if (d6DownA[vBase + t] === ga) { j = t; break }
        if (j < 0 || d6DownId[vBase + i] !== d6DownId[vBase + j]) { fixes = false; break }
        if (d5MinCoset(d6DownId[vBase + i]!, WF4_MUL[d6DownP[vBase + i]! * 1152 + gInv]!) !== d6DownP[vBase + j]) { fixes = false; break }
        permOfSlot[i] = j
      }
      if (fixes) {
        for (let i = 0; i < k; i++) {
          const j = permOfSlot[i]!, mn = Math.min(repSlot[i]!, repSlot[j]!), mx = Math.max(repSlot[i]!, repSlot[j]!)
          for (let t = 0; t < k; t++) if (repSlot[t] === mx) repSlot[t] = mn
        }
      }
    }
    const slotMap = new Map<number, number>()
    for (let i = 0; i < k; i++) {
      const r = repSlot[i]!
      let fid = slotMap.get(r)
      if (fid === undefined) { fid = nD6Flags++; slotMap.set(r, fid) }
      d6FlagId[vBase + i] = fid
    }
  }
  console.log(`  Enumerated exact D6 upward-end flags [St_6(y), b]: ${nD6Flags.toLocaleString()} variables`)

  const aOff6 = new Int32Array(nD6 + 1), aE6 = new Int32Array(nD6 * 24), aM6 = new Uint8Array(nD6 * 24)
  const bOff6 = new Int32Array(nD6 + 1), bE6 = new Int32Array(nD6 * 3), bM6 = new Uint8Array(nD6 * 3)
  let a6 = 0, b6 = 0
  const upMap = new Map<number, number>(), dnMap = new Map<number, number>()
  for (let u = 0; u < nD6; u++) {
    aOff6[u] = a6; upMap.clear()
    const sBase = u * 24
    for (let b = 0; b < 24; b++) {
      const v = d6StepId[sBase + b]!
      if (v < 0) continue
      const imgB = d6StepImgB[sBase + b]!, kv = d6K[v]!, vBase = v * 3
      let slot = -1
      for (let i = 0; i < kv; i++) if (d6DownA[vBase + i] === imgB) { slot = i; break }
      assertExact(slot >= 0, `D6 missing downward slot at u=${u}, b=${b}, v=${v}`)
      const fid = d6FlagId[vBase + slot]!
      assertExact(fid >= 0, `D6 invalid flag id at v=${v}, slot=${slot}`)
      upMap.set(fid, (upMap.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of upMap) { aE6[a6] = fid; aM6[a6] = m; a6++ }
    bOff6[u] = b6; dnMap.clear()
    const ku = d6K[u]!, uBase = u * 3
    for (let i = 0; i < ku; i++) {
      const fid = d6FlagId[uBase + i]!
      assertExact(fid >= 0, `D6 invalid downward flag id at u=${u}, i=${i}`)
      dnMap.set(fid, (dnMap.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of dnMap) { bE6[b6] = fid; bM6[b6] = m; b6++ }
  }
  aOff6[nD6] = a6; bOff6[nD6] = b6

  const selfCount = new Int32Array(nD5)
  for (let v = 1; v < nD6; v++) selfCount[d6SelfId[v]!] = selfCount[d6SelfId[v]!]! + 1
  const warmB6 = new Float64Array(nD6).fill(6.0), warmW6 = new Float64Array(nD6), warmTh6 = new Float64Array(nD6Flags)
  for (let v = 1; v < nD6; v++) {
    const s5 = d6SelfId[v]!
    warmB6[v] = sol5.b[s5]!
    warmW6[v] = sol5.w[s5]! / Math.max(1, selfCount[s5]!)
    let sumD = 0
    for (let i = bOff6[v]!, end = bOff6[v + 1]!; i < end; i++) sumD += bM6[i]!
    for (let i = bOff6[v]!, end = bOff6[v + 1]!; i < end; i++) warmTh6[bE6[i]!] = bM6[i]! / sumD
  }

  const tSolve6 = performance.now()
  const par6 = await solveNonlinearPerronAndCertParallel(
    nD6, nD6Flags, aOff6, aE6.subarray(0, a6), aM6.subarray(0, a6), bOff6, bE6.subarray(0, b6), bM6.subarray(0, b6),
    1200, [1_000_000, 10_000_000], { b: warmB6, w: warmW6, theta: warmTh6 },
  )
  const sol6 = par6.sol, c6Q1M = par6.certs[0]!, c6Q10M = par6.certs[1]!
  const bestUpper = c6Q10M.num * c6Q1M.den <= c6Q1M.num * c6Q10M.den ? c6Q10M : c6Q1M
  console.log(
    `  D6 [St_6(y), b] (${nD6} states, ${nD6Flags} vars): opt=${sol6.upper.toFixed(8)} dual=${sol6.dual.toFixed(8)} ` +
      `gap=${(sol6.upper - sol6.dual).toExponential(2)} (${sol6.iters} iters, ${((performance.now() - tSolve6) / 1000).toFixed(2)}s)`,
  )
  console.log(
    `    Exact BigInt D6 Collatz-Wielandt certs: Q=10^6 <= ${ratCeilDec(c6Q1M.num, c6Q1M.den, 6)} (${ratCeilDec(c6Q1M.num, c6Q1M.den, 8)}) | ` +
      `Q=10^7 <= ${ratCeilDec(c6Q10M.num, c6Q10M.den, 6)} (${ratCeilDec(c6Q10M.num, c6Q10M.den, 8)})`,
  )

  recordGate(
    'G1.1',
    'Exact Depth-6 S_6 automaton + multi-threaded BigInt Collatz-Wielandt upper bound strictly beats D5 (11.443713)',
    sol6.upper - sol6.dual < 1e-6 && bestUpper.num * c5.den < c5.num * bestUpper.den && bestUpper.num * 1000000n < 11443713n * bestUpper.den,
    `D5<=${ratCeilDec(c5.num, c5.den, 6)} -> D6(${nD6} st, ${nD6Flags} v) BigInt <= ${ratCeilDec(bestUpper.num, bestUpper.den, 6)} (drop=${(Number(ratCeilDec(c5.num, c5.den, 6)) - Number(ratCeilDec(bestUpper.num, bestUpper.den, 6))).toFixed(6)})`,
  )

  return {
    d2Upper: ratCeilDec(c2.num, c2.den, 6), d3Upper: ratCeilDec(c3.num, c3.den, 6),
    d4Upper: ratCeilDec(c4.num, c4.den, 6), d5Upper: ratCeilDec(c5.num, c5.den, 6),
    d6States: nD6, d6Flags: nD6Flags, d6FloatUpper: sol6.upper, d6FloatDual: sol6.dual,
    d6CertQ1M: { num: c6Q1M.num, den: c6Q1M.den, dec6: ratCeilDec(c6Q1M.num, c6Q1M.den, 6), dec8: ratCeilDec(c6Q1M.num, c6Q1M.den, 8) },
    d6CertQ10M: { num: c6Q10M.num, den: c6Q10M.den, dec6: ratCeilDec(c6Q10M.num, c6Q10M.den, 6), dec8: ratCeilDec(c6Q10M.num, c6Q10M.den, 8) },
    bestUpperNum: bestUpper.num, bestUpperDen: bestUpper.den, d4ParallelCheckErr, elapsedSec: (performance.now() - t0) / 1000,
  }
}

// =================================================================================================
// SECTION 3: DEEP CARTIER-FOATA LOWER BOUND (2-STEP DEEP + EXACT 3-STEP QUADRUPLE-ORBIT CF!)
// =================================================================================================

type LowerSuiteResult = {
  readonly nPairs: number
  readonly nTriples: number
  readonly nQuads: number | null
  readonly rho1Step57: number
  readonly rho2Step4440: number
  readonly rho3StepQuad: number | null
  readonly big2StepNum: bigint
  readonly big2StepDen: bigint
  readonly big3StepNum: bigint | null
  readonly big3StepDen: bigint | null
  readonly bestLowerNum: bigint
  readonly bestLowerDen: bigint
  readonly bestAsympLower: number
  readonly gradErrChecked: number
  readonly elapsedSec: number
}

function runLowerBounds(): LowerSuiteResult {
  const t0 = performance.now()
  console.log('\n=================================================================================')
  console.log(`PART 2 (${MODE_LABEL}): EXACT CARTIER-FOATA MARKOV LOWER BOUNDS & BIGINT WITNESS`)
  console.log('=================================================================================')

  const CLIQUES: number[] = [0]
  const CLIQUE_TO_ID = new Map<number, number>([[0, 0]])
  for (let a = 0; a < 24; a++) { const m = 1 << a; CLIQUE_TO_ID.set(m, CLIQUES.length); CLIQUES.push(m) }
  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      const m = (1 << a) | (1 << b); CLIQUE_TO_ID.set(m, CLIQUES.length); CLIQUES.push(m)
    }
  }
  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      for (let c = b + 1; c < 24; c++) {
        if ((ADJ_MASK[a]! & (1 << c)) !== 0 && (ADJ_MASK[b]! & (1 << c)) !== 0) {
          const m = (1 << a) | (1 << b) | (1 << c); CLIQUE_TO_ID.set(m, CLIQUES.length); CLIQUES.push(m)
        }
      }
    }
  }
  const N_CLIQUES = CLIQUES.length // 217
  assertExact(N_CLIQUES === 217, 'Expected 217 cliques incl empty')
  const CLIQUE_SIZE = new Uint8Array(N_CLIQUES), COMMON_ADJ = new Int32Array(N_CLIQUES), ALLOWED_NEXT = new Int32Array(N_CLIQUES)
  for (let i = 0; i < N_CLIQUES; i++) {
    const c = CLIQUES[i]!
    CLIQUE_SIZE[i] = popcount(c)
    let comm = ALL24
    for (const a of bitsOf(c)) comm &= ADJ_MASK[a]!
    COMMON_ADJ[i] = comm
    ALLOWED_NEXT[i] = i === 0 ? ALL24 : ALL24 & ~(c | comm)
  }
  const NEXT_CLIQUES: number[][] = Array.from({ length: N_CLIQUES }, (_, i) => {
    const f = ALLOWED_NEXT[i]!, out: number[] = []
    for (let j = 1; j < N_CLIQUES; j++) if ((CLIQUES[j]! & f) === CLIQUES[j]!) out.push(j)
    return out
  })
  const PREV_CLIQUES: number[][] = Array.from({ length: N_CLIQUES }, () => [])
  for (let i = 1; i < N_CLIQUES; i++) for (const j of NEXT_CLIQUES[i]!) PREV_CLIQUES[j]!.push(i)

  const PERM_CLIQUE = new Uint8Array(1152 * N_CLIQUES)
  for (let pi = 0; pi < 1152; pi++) {
    const p = WF4[pi]!, base = pi * N_CLIQUES
    for (let cid = 1; cid < N_CLIQUES; cid++) PERM_CLIQUE[base + cid] = CLIQUE_TO_ID.get(permMask(p, CLIQUES[cid]!))!
  }

  const repBySize = [0, 1, 25, 121], nOfSize = [0, 24, 96, 96]
  const stabBySizeIdx: number[][] = [[], [], [], []]
  for (let s = 1; s <= 3; s++) {
    const m = CLIQUES[repBySize[s]!]!
    for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === m) stabBySizeIdx[s]!.push(pi)
  }

  type PairOrbit = { readonly id: number; readonly s1: number; readonly s2: number; readonly c1Id: number; readonly c2Id: number; readonly multFromS1: number; readonly totalPairs: number; readonly stabIdx: readonly number[] }
  const PAIR_ORBITS: PairOrbit[] = []
  const PAIR_ORBIT_OF = new Int32Array(N_CLIQUES * N_CLIQUES).fill(-1)
  const PAIR_TO_REP_PERM = new Uint16Array(N_CLIQUES * N_CLIQUES)
  {
    const keyToOrbit = new Map<string, number>()
    for (let s1 = 1; s1 <= 3; s1++) {
      const id1 = repBySize[s1]!, stab = stabBySizeIdx[s1]!, multMap = new Map<number, number>()
      for (const id2 of NEXT_CLIQUES[id1]!) {
        const c2 = CLIQUES[id2]!
        let minC2 = 0x7fffffff
        for (const pi of stab) { const pm = permMask(WF4[pi]!, c2); if (pm < minC2) minC2 = pm }
        const k = `${s1}:${minC2}`
        let oid = keyToOrbit.get(k)
        if (oid === undefined) {
          oid = PAIR_ORBITS.length; keyToOrbit.set(k, oid)
          const c2Id = CLIQUE_TO_ID.get(minC2)!
          PAIR_ORBITS.push({ id: oid, s1, s2: CLIQUE_SIZE[c2Id]!, c1Id: id1, c2Id, multFromS1: 0, totalPairs: 0, stabIdx: stab.filter(pi => permMask(WF4[pi]!, minC2) === minC2) })
        }
        multMap.set(oid, (multMap.get(oid) ?? 0) + 1)
      }
      for (const [oid, m] of multMap) PAIR_ORBITS[oid] = { ...PAIR_ORBITS[oid]!, multFromS1: m, totalPairs: m * nOfSize[s1]! }
    }
    const toRepPermIdx = new Uint16Array(N_CLIQUES)
    for (let i = 1; i < N_CLIQUES; i++) {
      const target = CLIQUES[repBySize[CLIQUE_SIZE[i]!]!]!, m = CLIQUES[i]!
      for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === target) { toRepPermIdx[i] = pi; break }
    }
    for (let i = 1; i < N_CLIQUES; i++) {
      const s1 = CLIQUE_SIZE[i]!, p0 = toRepPermIdx[i]!, stab = stabBySizeIdx[s1]!
      for (const j of NEXT_CLIQUES[i]!) {
        const c2Img = permMask(WF4[p0]!, CLIQUES[j]!)
        let minC2 = 0x7fffffff, bestPi = 0
        for (const pi of stab) { const pm = permMask(WF4[pi]!, c2Img); if (pm < minC2) { minC2 = pm; bestPi = pi } }
        PAIR_ORBIT_OF[i * N_CLIQUES + j] = keyToOrbit.get(`${s1}:${minC2}`)!
        PAIR_TO_REP_PERM[i * N_CLIQUES + j] = WF4_MUL[bestPi * 1152 + p0]!
      }
    }
  }
  const N_PAIR = PAIR_ORBITS.length // 57

  type TripleOrbit = {
    readonly id: number; readonly oIn: number; readonly oOut: number; readonly c1Id: number; readonly c2Id: number; readonly c3Id: number
    readonly multFromOIn: number; readonly multIntoOOut: number; readonly totalTriples: number; readonly stabIdx: readonly number[]
  }
  const TRIPLE_ORBITS: TripleOrbit[] = []
  const REP_C3_TO_TRIPLE = new Int32Array(N_PAIR * N_CLIQUES).fill(-1)
  const REP_C3_TO_PERM = new Uint16Array(N_PAIR * N_CLIQUES)

  for (const po of PAIR_ORBITS) {
    const keyToTid = new Map<number, number>(), multMap = new Map<number, number>(), stab = po.stabIdx
    for (const id3 of NEXT_CLIQUES[po.c2Id]!) {
      const c3 = CLIQUES[id3]!
      let minC3 = 0x7fffffff, bestPi = 0
      for (const pi of stab) { const pm = permMask(WF4[pi]!, c3); if (pm < minC3) { minC3 = pm; bestPi = pi } }
      let tid = keyToTid.get(minC3)
      if (tid === undefined) {
        tid = TRIPLE_ORBITS.length; keyToTid.set(minC3, tid)
        const c3RepId = CLIQUE_TO_ID.get(minC3)!
        TRIPLE_ORBITS.push({
          id: tid, oIn: po.id, oOut: PAIR_ORBIT_OF[po.c2Id * N_CLIQUES + c3RepId]!,
          c1Id: po.c1Id, c2Id: po.c2Id, c3Id: c3RepId, multFromOIn: 0, multIntoOOut: 0, totalTriples: 0,
          stabIdx: stab.filter(pi => permMask(WF4[pi]!, minC3) === minC3),
        })
      }
      REP_C3_TO_TRIPLE[po.id * N_CLIQUES + id3] = tid
      REP_C3_TO_PERM[po.id * N_CLIQUES + id3] = bestPi
      multMap.set(tid, (multMap.get(tid) ?? 0) + 1)
    }
    for (const [tid, m] of multMap) {
      const tr = TRIPLE_ORBITS[tid]!, tot = m * po.totalPairs, outPairs = PAIR_ORBITS[tr.oOut]!.totalPairs
      assertExact(tot % outPairs === 0, `Triple orbit ${tid} integrality failed`)
      TRIPLE_ORBITS[tid] = { ...tr, multFromOIn: m, multIntoOOut: tot / outPairs, totalTriples: tot }
    }
  }
  const N_TRIPLE = TRIPLE_ORBITS.length // 4,440
  assertExact(N_PAIR === 57 && N_TRIPLE === 4440, 'Expected 57 pair & 4440 triple orbits')

  const tripleOrbitOf = (c1: number, c2: number, c3: number): number => {
    const oid = PAIR_ORBIT_OF[c1 * N_CLIQUES + c2]!, pi = PAIR_TO_REP_PERM[c1 * N_CLIQUES + c2]!
    return REP_C3_TO_TRIPLE[oid * N_CLIQUES + PERM_CLIQUE[pi * N_CLIQUES + c3]!]!
  }
  const tripleToRepPerm = (c1: number, c2: number, c3: number): number => {
    const oid = PAIR_ORBIT_OF[c1 * N_CLIQUES + c2]!, p12 = PAIR_TO_REP_PERM[c1 * N_CLIQUES + c2]!
    const c3Img = PERM_CLIQUE[p12 * N_CLIQUES + c3]!, p3 = REP_C3_TO_PERM[oid * N_CLIQUES + c3Img]!
    return WF4_MUL[p3 * 1152 + p12]!
  }

  const STAB0_IDX: number[] = []
  for (let pi = 0; pi < 1152; pi++) if (WF4[pi]![0] === 0) STAB0_IDX.push(pi)
  const C_ALLOWS_0_REPS: { readonly c1: number; readonly mult: number }[] = []
  {
    const seen = new Set<number>()
    for (let c = 1; c < N_CLIQUES; c++) {
      if ((ALLOWED_NEXT[c]! & 1) === 0 || seen.has(c)) continue
      let sz = 0
      for (const pi of STAB0_IDX) { const img = PERM_CLIQUE[pi * N_CLIQUES + c]!; if (!seen.has(img)) { seen.add(img); sz++ } }
      C_ALLOWS_0_REPS.push({ c1: c, mult: sz })
    }
  }
  const ADJ0 = ADJ_MASK[0]!
  const Q3_CLIQUES: number[] = []
  for (let i = 1; i < N_CLIQUES; i++) if ((CLIQUES[i]! & ADJ0) === CLIQUES[i]!) Q3_CLIQUES.push(i)
  const N_Q3 = Q3_CLIQUES.length
  const Q3_PLUS0: number[] = Q3_CLIQUES.map(cid => CLIQUE_TO_ID.get(CLIQUES[cid]! | 1)!)
  const Q3_NEXT: number[][] = Array.from({ length: N_Q3 }, (_, a) => {
    const f = ALLOWED_NEXT[Q3_CLIQUES[a]!]!, out: number[] = []
    for (let b = 0; b < N_Q3; b++) if ((CLIQUES[Q3_CLIQUES[b]!]! & f) === CLIQUES[Q3_CLIQUES[b]!]!) out.push(b)
    return out
  })
  const Q3_PAIR_A: number[] = [], Q3_PAIR_B: number[] = [], Q3_PAIR_ORBIT: number[] = []
  const Q3_PAIR_ID = new Int32Array(N_Q3 * N_Q3).fill(-1)
  for (let a = 0; a < N_Q3; a++) {
    for (const b of Q3_NEXT[a]!) {
      Q3_PAIR_ID[a * N_Q3 + b] = Q3_PAIR_A.length
      Q3_PAIR_A.push(a); Q3_PAIR_B.push(b)
      Q3_PAIR_ORBIT.push(PAIR_ORBIT_OF[Q3_CLIQUES[a]! * N_CLIQUES + Q3_CLIQUES[b]!]!)
    }
  }
  const N_Q3P = Q3_PAIR_A.length
  const Q3T_FROM: number[] = [], Q3T_TO: number[] = [], Q3T_TID: number[] = []
  for (let pid1 = 0; pid1 < N_Q3P; pid1++) {
    const a = Q3_PAIR_A[pid1]!, b = Q3_PAIR_B[pid1]!, ca = Q3_CLIQUES[a]!, cb = Q3_CLIQUES[b]!
    for (const c of Q3_NEXT[b]!) {
      Q3T_FROM.push(pid1); Q3T_TO.push(Q3_PAIR_ID[b * N_Q3 + c]!); Q3T_TID.push(tripleOrbitOf(ca, cb, Q3_CLIQUES[c]!))
    }
  }
  const N_Q3T = Q3T_FROM.length

  const id0 = CLIQUE_TO_ID.get(1)!
  const M0_OIN: number[] = [], M0_OOUT: number[] = [], M0_TID: number[] = [], M0_MULT: number[] = []
  for (const { c1, mult } of C_ALLOWS_0_REPS) {
    const oOut = PAIR_ORBIT_OF[c1 * N_CLIQUES + id0]!
    for (const c0 of PREV_CLIQUES[c1]!) {
      M0_OIN.push(PAIR_ORBIT_OF[c0 * N_CLIQUES + c1]!); M0_OOUT.push(oOut); M0_TID.push(tripleOrbitOf(c0, c1, id0)); M0_MULT.push(mult)
    }
  }
  const P1_C1: number[] = [], P1_J1: number[] = [], P1_OIN_M1: number[] = [], P1_OOUT_M1: number[] = []
  const P1_MULT: number[] = [], P1_OFF: number[] = [0], P1_O0: number[] = [], P1_TIN: number[] = [], P1_TOUT: number[] = []
  for (const { c1, mult } of C_ALLOWS_0_REPS) {
    const f1 = ALLOWED_NEXT[c1]!
    for (let a = 0; a < N_Q3; a++) {
      const j1 = Q3_CLIQUES[a]!
      if ((CLIQUES[j1]! & f1) !== CLIQUES[j1]!) continue
      const j1p = Q3_PLUS0[a]!
      P1_C1.push(c1); P1_J1.push(a); P1_MULT.push(mult)
      P1_OIN_M1.push(PAIR_ORBIT_OF[c1 * N_CLIQUES + j1]!); P1_OOUT_M1.push(PAIR_ORBIT_OF[c1 * N_CLIQUES + j1p]!)
      for (const c0 of PREV_CLIQUES[c1]!) {
        P1_O0.push(PAIR_ORBIT_OF[c0 * N_CLIQUES + c1]!); P1_TIN.push(tripleOrbitOf(c0, c1, j1)); P1_TOUT.push(tripleOrbitOf(c0, c1, j1p))
      }
      P1_OFF.push(P1_O0.length)
    }
  }
  const N_P1 = P1_C1.length
  const M2_P1: number[] = [], M2_TIN: number[] = [], M2_TOUT: number[] = [], M2_OIN: number[] = [], M2_OOUT: number[] = [], M2_Q3P: number[] = []
  for (let k = 0; k < N_P1; k++) {
    const c1 = P1_C1[k]!, a = P1_J1[k]!, j1 = Q3_CLIQUES[a]!, j1p = Q3_PLUS0[a]!
    for (const b of Q3_NEXT[a]!) {
      const j2 = Q3_CLIQUES[b]!
      M2_P1.push(k); M2_TIN.push(tripleOrbitOf(c1, j1, j2)); M2_TOUT.push(tripleOrbitOf(c1, j1p, j2))
      M2_OIN.push(PAIR_ORBIT_OF[j1 * N_CLIQUES + j2]!); M2_OOUT.push(PAIR_ORBIT_OF[j1p * N_CLIQUES + j2]!); M2_Q3P.push(Q3_PAIR_ID[a * N_Q3 + b]!)
    }
  }
  const N_M2 = M2_P1.length
  const M3_FROM: number[] = [], M3_TO: number[] = [], M3_TIN: number[] = [], M3_TOUT: number[] = []
  for (let pid1 = 0; pid1 < N_Q3P; pid1++) {
    const a = Q3_PAIR_A[pid1]!, b = Q3_PAIR_B[pid1]!, j1 = Q3_CLIQUES[a]!, j1p = Q3_PLUS0[a]!, j2 = Q3_CLIQUES[b]!
    for (const c of Q3_NEXT[b]!) {
      M3_FROM.push(pid1); M3_TO.push(Q3_PAIR_ID[b * N_Q3 + c]!); M3_TIN.push(tripleOrbitOf(j1, j2, Q3_CLIQUES[c]!)); M3_TOUT.push(tripleOrbitOf(j1p, j2, Q3_CLIQUES[c]!))
    }
  }
  const N_M3 = M3_FROM.length
  const M0_COEFF = Float64Array.from({ length: M0_OIN.length }, (_, i) => (24 * M0_MULT[i]!) / PAIR_ORBITS[M0_OIN[i]!]!.totalPairs)
  const P1_COEFF = new Float64Array(P1_O0.length)
  for (let k = 0; k < N_P1; k++) for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) P1_COEFF[idx] = P1_MULT[k]! / PAIR_ORBITS[P1_O0[idx]!]!.totalPairs

  const solveLinear57 = (M: Float64Array, rhs: Float64Array): Float64Array => {
    const n = N_PAIR
    const A = Array.from({ length: n }, (_, i) => {
      const r = new Float64Array(n + 1)
      for (let j = 0; j < n; j++) r[j] = M[i * n + j]!
      r[n] = rhs[i]!; return r
    })
    for (let col = 0; col < n; col++) {
      let piv = col
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r]![col]!) > Math.abs(A[piv]![col]!)) piv = r
      if (piv !== col) { const t = A[col]!; A[col] = A[piv]!; A[piv] = t }
      const d = A[col]![col]!
      for (let r = col + 1; r < n; r++) {
        const f = A[r]![col]! / d
        for (let j = col; j <= n; j++) A[r]![j] = A[r]![j]! - f * A[col]![j]!
      }
    }
    const x = new Float64Array(n)
    for (let r = n - 1; r >= 0; r--) {
      let s = A[r]![n]!
      for (let j = r + 1; j < n; j++) s -= A[r]![j]! * x[j]!
      x[r] = s / A[r]![r]!
    }
    return x
  }

  const eval2StepV57 = (omega: Float64Array, needGrad: boolean) => {
    const M2 = new Float64Array(N_PAIR * N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      M2[tr.oIn * N_PAIR + tr.oOut] = M2[tr.oIn * N_PAIR + tr.oOut]! + tr.multFromOIn * w * w
    }
    const pL = new Float64Array(N_PAIR).fill(1 / N_PAIR), pR = new Float64Array(N_PAIR).fill(1 / N_PAIR), tmp57 = new Float64Array(N_PAIR)
    let lam = 1, diffPL2 = 1, diffPR2 = 0
    for (let it = 0; it < 600; it++) {
      tmp57.fill(0)
      for (let i = 0; i < N_PAIR; i++) { const pi = pL[i]!, base = i * N_PAIR; for (let j = 0; j < N_PAIR; j++) tmp57[j] = tmp57[j]! + pi * M2[base + j]! }
      let s = 0; for (let j = 0; j < N_PAIR; j++) s += tmp57[j]!; lam = s
      let diff = 0; for (let j = 0; j < N_PAIR; j++) { const nv = tmp57[j]! / s; diff += Math.abs(nv - pL[j]!); pL[j] = nv }
      diffPL2 = diff
      if (diff < 1e-14) break
    }
    if (needGrad) assertExact(diffPL2 < 1e-10, `eval2StepV4440 pL did not converge: diff=${diffPL2}`)
    if (needGrad) {
      diffPR2 = 1
      for (let it = 0; it < 600; it++) {
        let s = 0
        for (let i = 0; i < N_PAIR; i++) { let acc = 0; const base = i * N_PAIR; for (let j = 0; j < N_PAIR; j++) acc += M2[base + j]! * pR[j]!; tmp57[i] = acc; s += acc }
        let diff = 0; for (let i = 0; i < N_PAIR; i++) { const nv = tmp57[i]! / s; diff += Math.abs(nv - pR[i]!); pR[i] = nv }
        diffPR2 = diff
        if (diff < 1e-14) break
      }
      assertExact(diffPR2 < 1e-10, `eval2StepV4440 pR did not converge: diff=${diffPR2}`)
      let lr = 0; for (let i = 0; i < N_PAIR; i++) lr += pL[i]! * pR[i]!
      for (let i = 0; i < N_PAIR; i++) pR[i] = pR[i]! / lr
    }
    const invLam = 1 / lam, invSqLam = 1 / Math.sqrt(lam), invLam2 = invLam * invLam, invLam3 = invLam2 * invLam
    const P1 = new Float64Array(N_P1)
    for (let k = 0; k < N_P1; k++) {
      let s = 0
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) s += P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[P1_TIN[idx]!]! * omega[P1_TOUT[idx]!]!
      P1[k] = s
    }
    const W_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M2; i++) W_m2[M2_Q3P[i]!] = W_m2[M2_Q3P[i]!]! + P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
    const W_m3 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) W_m3[M3_TO[i]!] = W_m3[M3_TO[i]!]! + W_m2[M3_FROM[i]!]! * omega[M3_TIN[i]!]! * omega[M3_TOUT[i]!]!
    const R_left = Float64Array.from(W_m3), term = Float64Array.from(W_m3), nxtT = new Float64Array(N_Q3P)
    const wSqQ3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_Q3T; i++) { const w = omega[Q3T_TID[i]!]!; wSqQ3[i] = w * w * invLam }
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_TO[i]!] = nxtT[Q3T_TO[i]!]! + term[Q3T_FROM[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let p = 0; p < N_Q3P; p++) { const nv = nxtT[p]!; R_left[p] = R_left[p]! + nv; term[p] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    const A57 = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!, o2 = M0_OOUT[i]!, c = M0_COEFF[i]! * invSqLam * pL[o1]! * omega[M0_TID[i]!]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c; A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let k = 0; k < N_P1; k++) {
      const o1 = P1_OIN_M1[k]!, o2 = P1_OOUT_M1[k]!, c = 24 * invLam * P1[k]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c; A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let i = 0; i < N_M2; i++) {
      const o1 = M2_OIN[i]!, o2 = M2_OOUT[i]!, c = 24 * invLam2 * P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c; A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let pid = 0; pid < N_Q3P; pid++) { const o = Q3_PAIR_ORBIT[pid]!; A57[o * N_PAIR + o] = A57[o * N_PAIR + o]! + 48 * invLam3 * R_left[pid]! }
    const invSqP = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) invSqP[i] = 1 / Math.sqrt(pL[i]!)
    const u = new Float64Array(N_PAIR).fill(1 / Math.sqrt(N_PAIR))
    let rho = 0, lastDiff57 = 1
    for (let it = 0; it < 600; it++) {
      let n2 = 0, ray = 0
      for (let i = 0; i < N_PAIR; i++) {
        let s = 0; const base = i * N_PAIR
        for (let j = 0; j < N_PAIR; j++) s += A57[base + j]! * invSqP[j]! * u[j]!
        const sym = s * invSqP[i]!
        ray += u[i]! * sym
        const nv = sym + 24.0 * u[i]!; tmp57[i] = nv; n2 += nv * nv
      }
      const nrm = Math.sqrt(n2); rho = ray
      let diff = 0; for (let i = 0; i < N_PAIR; i++) { const nv = tmp57[i]! / nrm; diff += Math.abs(nv - u[i]!); u[i] = nv }
      lastDiff57 = diff
      if (diff < 1e-14) break
    }
    // Exact final Rayleigh quotient u^T A_sym u on normalized u (matches Hellmann-Feynman identically)
    let rhoFinal57 = 0
    for (let i = 0; i < N_PAIR; i++) {
      let s = 0; const base = i * N_PAIR
      for (let j = 0; j < N_PAIR; j++) s += A57[base + j]! * invSqP[j]! * u[j]!
      rhoFinal57 += u[i]! * s * invSqP[i]!
    }
    rho = rhoFinal57
    if (needGrad) assertExact(lastDiff57 < 1e-10, `eval2StepV57 power iteration did not converge: diff=${lastDiff57}`)
    const v = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) v[i] = u[i]! * invSqP[i]!
    if (!needGrad) return { rho, gradLogW: new Float64Array(0) }

    const gOmega = new Float64Array(N_TRIPLE), gPL = new Float64Array(N_PAIR)
    let gLam = 0
    for (let o = 0; o < N_PAIR; o++) gPL[o] = -rho * v[o]! * v[o]!
    const gRLeft = new Float64Array(N_Q3P)
    let sumM3 = 0
    for (let pid = 0; pid < N_Q3P; pid++) { const vv2 = v[Q3_PAIR_ORBIT[pid]!]! ** 2; sumM3 += R_left[pid]! * vv2; gRLeft[pid] = 48 * invLam3 * vv2 }
    gLam += -3 * 48 * invLam3 * invLam * sumM3
    const gW_m3 = Float64Array.from(gRLeft); term.set(gRLeft)
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_FROM[i]!] = nxtT[Q3T_FROM[i]!]! + term[Q3T_TO[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let p = 0; p < N_Q3P; p++) { const nv = nxtT[p]!; gW_m3[p] = gW_m3[p]! + nv; term[p] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    for (let i = 0; i < N_Q3T; i++) {
      const gEntry = gW_m3[Q3T_TO[i]!]! * R_left[Q3T_FROM[i]!]!, t = Q3T_TID[i]!, w = omega[t]!
      gOmega[t] = gOmega[t]! + gEntry * 2 * w * invLam; gLam += gEntry * (-w * w * invLam2)
    }
    const gW_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) {
      const g = gW_m3[M3_TO[i]!]!, fr = M3_FROM[i]!, t1 = M3_TIN[i]!, t2 = M3_TOUT[i]!, w1 = omega[t1]!, w2 = omega[t2]!, wf = W_m2[fr]!
      gW_m2[fr] = gW_m2[fr]! + g * w1 * w2; gOmega[t1] = gOmega[t1]! + g * wf * w2; gOmega[t2] = gOmega[t2]! + g * wf * w1
    }
    const gP1 = new Float64Array(N_P1)
    for (let i = 0; i < N_M2; i++) {
      const k = M2_P1[i]!, t1 = M2_TIN[i]!, t2 = M2_TOUT[i]!, w1 = omega[t1]!, w2 = omega[t2]!, pk = P1[k]!
      const vv = v[M2_OIN[i]!]! * v[M2_OOUT[i]!]!, gProd = 48 * invLam2 * vv + gW_m2[M2_Q3P[i]!]!
      gP1[k] = gP1[k]! + gProd * w1 * w2; gOmega[t1] = gOmega[t1]! + gProd * pk * w2; gOmega[t2] = gOmega[t2]! + gProd * pk * w1
      gLam += -2 * 48 * invLam3 * pk * w1 * w2 * vv
    }
    for (let k = 0; k < N_P1; k++) { const vv = v[P1_OIN_M1[k]!]! * v[P1_OOUT_M1[k]!]!; gP1[k] = gP1[k]! + 48 * invLam * vv; gLam += -48 * invLam2 * P1[k]! * vv }
    for (let k = 0; k < N_P1; k++) {
      const gk = gP1[k]!
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
        const o0 = P1_O0[idx]!, t1 = P1_TIN[idx]!, t2 = P1_TOUT[idx]!, c = P1_COEFF[idx]!, p0 = pL[o0]!, w1 = omega[t1]!, w2 = omega[t2]!
        gPL[o0] = gPL[o0]! + gk * c * w1 * w2; gOmega[t1] = gOmega[t1]! + gk * c * p0 * w2; gOmega[t2] = gOmega[t2]! + gk * c * p0 * w1
      }
    }
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!, o2 = M0_OOUT[i]!, t = M0_TID[i]!, fac = 2 * M0_COEFF[i]! * invSqLam * v[o1]! * v[o2]!
      gPL[o1] = gPL[o1]! + fac * omega[t]!; gOmega[t] = gOmega[t]! + fac * pL[o1]!; gLam += -0.5 * fac * invLam * pL[o1]! * omega[t]!
    }
    let pDotG = 0; for (let i = 0; i < N_PAIR; i++) pDotG += pL[i]! * gPL[i]!
    const rhs = new Float64Array(N_PAIR); for (let i = 0; i < N_PAIR; i++) rhs[i] = gPL[i]! - pDotG
    const shiftM = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < N_PAIR; i++) for (let j = 0; j < N_PAIR; j++) shiftM[i * N_PAIR + j] = (i === j ? lam : 0) - M2[i * N_PAIR + j]! + lam * pL[j]!
    const qAdj = solveLinear57(shiftM, rhs)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      gOmega[t] = gOmega[t]! + pL[tr.oIn]! * (gLam * pR[tr.oOut]! + qAdj[tr.oOut]!) * tr.multFromOIn * 2 * w
    }
    const gradLogW = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) gradLogW[t] = gOmega[t]! * omega[t]!
    return { rho, gradLogW }
  }

  const eval2StepV4440 = (omega: Float64Array, needGrad: boolean, vInit?: Float64Array) => {
    const M2 = new Float64Array(N_PAIR * N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      M2[tr.oIn * N_PAIR + tr.oOut] = M2[tr.oIn * N_PAIR + tr.oOut]! + tr.multFromOIn * w * w
    }
    const pL = new Float64Array(N_PAIR).fill(1 / N_PAIR), pR = new Float64Array(N_PAIR).fill(1 / N_PAIR), tmp57 = new Float64Array(N_PAIR)
    let lam = 1, diffPL2 = 1, diffPR2 = 0
    for (let it = 0; it < 600; it++) {
      tmp57.fill(0)
      for (let i = 0; i < N_PAIR; i++) { const pi = pL[i]!, base = i * N_PAIR; for (let j = 0; j < N_PAIR; j++) tmp57[j] = tmp57[j]! + pi * M2[base + j]! }
      let s = 0; for (let j = 0; j < N_PAIR; j++) s += tmp57[j]!; lam = s
      let diff = 0; for (let j = 0; j < N_PAIR; j++) { const nv = tmp57[j]! / s; diff += Math.abs(nv - pL[j]!); pL[j] = nv }
      diffPL2 = diff
      if (diff < 1e-14) break
    }
    if (needGrad) assertExact(diffPL2 < 1e-10, `eval2StepV4440 pL did not converge: diff=${diffPL2}`)
    if (needGrad) {
      diffPR2 = 1
      for (let it = 0; it < 600; it++) {
        let s = 0
        for (let i = 0; i < N_PAIR; i++) { let acc = 0; const base = i * N_PAIR; for (let j = 0; j < N_PAIR; j++) acc += M2[base + j]! * pR[j]!; tmp57[i] = acc; s += acc }
        let diff = 0; for (let i = 0; i < N_PAIR; i++) { const nv = tmp57[i]! / s; diff += Math.abs(nv - pR[i]!); pR[i] = nv }
        diffPR2 = diff
        if (diff < 1e-14) break
      }
      assertExact(diffPR2 < 1e-10, `eval2StepV4440 pR did not converge: diff=${diffPR2}`)
      let lr = 0; for (let i = 0; i < N_PAIR; i++) lr += pL[i]! * pR[i]!
      for (let i = 0; i < N_PAIR; i++) pR[i] = pR[i]! / lr
    }
    const invLam = 1 / lam, invSqLam = 1 / Math.sqrt(lam), invLam2 = invLam * invLam, invLam3 = invLam2 * invLam
    const bTri = new Float64Array(N_TRIPLE), invSqB = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      const bt = invLam * pL[tr.oIn]! * tr.multFromOIn * w * w
      bTri[t] = bt; invSqB[t] = 1 / Math.sqrt(bt)
    }
    const P1 = new Float64Array(N_P1)
    for (let k = 0; k < N_P1; k++) {
      let s = 0
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) s += P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[P1_TIN[idx]!]! * omega[P1_TOUT[idx]!]!
      P1[k] = s
    }
    const W_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M2; i++) W_m2[M2_Q3P[i]!] = W_m2[M2_Q3P[i]!]! + P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
    const W_m3 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) W_m3[M3_TO[i]!] = W_m3[M3_TO[i]!]! + W_m2[M3_FROM[i]!]! * omega[M3_TIN[i]!]! * omega[M3_TOUT[i]!]!
    const R_left = Float64Array.from(W_m3), term = Float64Array.from(W_m3), nxtT = new Float64Array(N_Q3P)
    const wSqQ3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_Q3T; i++) { const w = omega[Q3T_TID[i]!]!; wSqQ3[i] = w * w * invLam }
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_TO[i]!] = nxtT[Q3T_TO[i]!]! + term[Q3T_FROM[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let p = 0; p < N_Q3P; p++) { const nv = nxtT[p]!; R_left[p] = R_left[p]! + nv; term[p] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    const diagM4 = new Float64Array(N_TRIPLE)
    for (let i = 0; i < N_Q3T; i++) { const tid = Q3T_TID[i]!; diagM4[tid] = diagM4[tid]! + 48 * invLam3 * R_left[Q3T_FROM[i]!]! * wSqQ3[i]! }
    const m0PairW = new Float64Array(N_PAIR), sPrev = new Float64Array(N_PAIR)
    const applyA4440 = (v: Float64Array, out: Float64Array): void => {
      out.fill(0); sPrev.fill(0); m0PairW.fill(0)
      for (let t = 0; t < N_TRIPLE; t++) { const o = TRIPLE_ORBITS[t]!.oOut; sPrev[o] = sPrev[o]! + bTri[t]! * v[t]! }
      for (let i = 0; i < M0_OIN.length; i++) {
        const o1 = M0_OIN[i]!, tOut = M0_TID[i]!, fac = M0_COEFF[i]! * invSqLam * omega[tOut]!
        out[tOut] = out[tOut]! + fac * sPrev[o1]!; m0PairW[o1] = m0PairW[o1]! + fac * v[tOut]!
      }
      for (let t = 0; t < N_TRIPLE; t++) out[t] = out[t]! + bTri[t]! * m0PairW[TRIPLE_ORBITS[t]!.oOut]!
      for (let k = 0; k < N_P1; k++) {
        for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
          const t1 = P1_TIN[idx]!, t2 = P1_TOUT[idx]!, c = 24 * invLam * P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[t1]! * omega[t2]!
          out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
        }
      }
      for (let i = 0; i < N_M2; i++) {
        const t1 = M2_TIN[i]!, t2 = M2_TOUT[i]!, c = 24 * invLam2 * P1[M2_P1[i]!]! * omega[t1]! * omega[t2]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let i = 0; i < N_M3; i++) {
        const t1 = M3_TIN[i]!, t2 = M3_TOUT[i]!, c = 24 * invLam3 * W_m2[M3_FROM[i]!]! * omega[t1]! * omega[t2]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let t = 0; t < N_TRIPLE; t++) out[t] = out[t]! + diagM4[t]! * v[t]!
    }
    const u = new Float64Array(N_TRIPLE), v = new Float64Array(N_TRIPLE), av = new Float64Array(N_TRIPLE)
    if (vInit) {
      let n2 = 0; for (let t = 0; t < N_TRIPLE; t++) { const ut = vInit[t]! / invSqB[t]!; u[t] = ut; n2 += ut * ut }
      const inv = 1 / Math.sqrt(n2); for (let t = 0; t < N_TRIPLE; t++) u[t] = u[t]! * inv
    } else {
      for (let t = 0; t < N_TRIPLE; t++) u[t] = Math.sqrt(bTri[t]!)
    }
    let rho = 0, lastDiff2 = 1
    for (let it = 0; it < 600; it++) {
      for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqB[t]!
      applyA4440(v, av)
      let n2 = 0
      for (let t = 0; t < N_TRIPLE; t++) { const nv = av[t]! * invSqB[t]! + 24.0 * u[t]!; av[t] = nv; n2 += nv * nv }
      const nrm = Math.sqrt(n2)
      let diff = 0; for (let t = 0; t < N_TRIPLE; t++) { const nv = av[t]! / nrm; diff += Math.abs(nv - u[t]!); u[t] = nv }
      lastDiff2 = diff
      if (diff < 1e-13) break
    }
    if (needGrad) assertExact(lastDiff2 < 1e-10, `eval2StepV4440 power iteration did not converge: diff=${lastDiff2}`)
    for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqB[t]!
    // Exact generalized Rayleigh quotient v^T A v (with v^T B v = u^T u = 1) matching Hellmann-Feynman gradient
    applyA4440(v, av)
    let ray2 = 0; for (let t = 0; t < N_TRIPLE; t++) ray2 += v[t]! * av[t]!
    rho = ray2
    if (!needGrad) return { rho, gradLogW: new Float64Array(0), v4440: v }

    const gOmega = new Float64Array(N_TRIPLE), gPL = new Float64Array(N_PAIR), gBTri = new Float64Array(N_TRIPLE)
    let gLam = 0
    for (let t = 0; t < N_TRIPLE; t++) gBTri[t] = -rho * v[t]! * v[t]!
    const gRLeft = new Float64Array(N_Q3P)
    let sumM4 = 0
    for (let i = 0; i < N_Q3T; i++) {
      const fr = Q3T_FROM[i]!, tid = Q3T_TID[i]!, w = omega[tid]!, vv2 = v[tid]! * v[tid]!
      sumM4 += R_left[fr]! * wSqQ3[i]! * vv2
      gRLeft[fr] = gRLeft[fr]! + 48 * invLam3 * wSqQ3[i]! * vv2
      gOmega[tid] = gOmega[tid]! + 48 * invLam3 * R_left[fr]! * (2 * w * invLam) * vv2
      gLam += -48 * invLam3 * R_left[fr]! * (w * w * invLam2) * vv2
    }
    gLam += -3 * 48 * invLam3 * invLam * sumM4
    const gW_m3 = Float64Array.from(gRLeft); term.set(gRLeft)
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_FROM[i]!] = nxtT[Q3T_FROM[i]!]! + term[Q3T_TO[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let p = 0; p < N_Q3P; p++) { const nv = nxtT[p]!; gW_m3[p] = gW_m3[p]! + nv; term[p] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    for (let i = 0; i < N_Q3T; i++) {
      const gEntry = gW_m3[Q3T_TO[i]!]! * R_left[Q3T_FROM[i]!]!, t = Q3T_TID[i]!, w = omega[t]!
      gOmega[t] = gOmega[t]! + gEntry * 2 * w * invLam; gLam += gEntry * (-w * w * invLam2)
    }
    const gW_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) {
      const fr = M3_FROM[i]!, to = M3_TO[i]!, t1 = M3_TIN[i]!, t2 = M3_TOUT[i]!, w1 = omega[t1]!, w2 = omega[t2]!, wf = W_m2[fr]!, vv = v[t1]! * v[t2]!
      const gProd = 48 * invLam3 * vv + gW_m3[to]!
      gW_m2[fr] = gW_m2[fr]! + gProd * w1 * w2; gOmega[t1] = gOmega[t1]! + gProd * wf * w2; gOmega[t2] = gOmega[t2]! + gProd * wf * w1
      gLam += -3 * 48 * invLam3 * invLam * wf * w1 * w2 * vv
    }
    const gP1 = new Float64Array(N_P1)
    for (let i = 0; i < N_M2; i++) {
      const k = M2_P1[i]!, t1 = M2_TIN[i]!, t2 = M2_TOUT[i]!, w1 = omega[t1]!, w2 = omega[t2]!, pk = P1[k]!, vv = v[t1]! * v[t2]!
      const gProd = 48 * invLam2 * vv + gW_m2[M2_Q3P[i]!]!
      gP1[k] = gP1[k]! + gProd * w1 * w2; gOmega[t1] = gOmega[t1]! + gProd * pk * w2; gOmega[t2] = gOmega[t2]! + gProd * pk * w1
      gLam += -2 * 48 * invLam3 * pk * w1 * w2 * vv
    }
    for (let k = 0; k < N_P1; k++) {
      const gk = gP1[k]!
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
        const o0 = P1_O0[idx]!, t1 = P1_TIN[idx]!, t2 = P1_TOUT[idx]!, c = P1_COEFF[idx]!, p0 = pL[o0]!, w1 = omega[t1]!, w2 = omega[t2]!
        const vv = v[t1]! * v[t2]!, gTerm = (gk + 48 * invLam * vv) * c
        gPL[o0] = gPL[o0]! + gTerm * w1 * w2; gOmega[t1] = gOmega[t1]! + gTerm * p0 * w2; gOmega[t2] = gOmega[t2]! + gTerm * p0 * w1
        gLam += -48 * invLam2 * c * p0 * w1 * w2 * vv
      }
    }
    sPrev.fill(0)
    const gSPrev = new Float64Array(N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) { const o = TRIPLE_ORBITS[t]!.oOut; sPrev[o] = sPrev[o]! + bTri[t]! * v[t]! }
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!, tOut = M0_TID[i]!, fac = 2 * M0_COEFF[i]! * invSqLam * v[tOut]!
      gSPrev[o1] = gSPrev[o1]! + fac * omega[tOut]!; gOmega[tOut] = gOmega[tOut]! + fac * sPrev[o1]!
      gLam += -0.5 * fac * invLam * omega[tOut]! * sPrev[o1]!
    }
    for (let t = 0; t < N_TRIPLE; t++) gBTri[t] = gBTri[t]! + gSPrev[TRIPLE_ORBITS[t]!.oOut]! * v[t]!
    for (let t = 0; t < N_TRIPLE; t++) {
      const gb = gBTri[t]!, tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      gPL[tr.oIn] = gPL[tr.oIn]! + gb * invLam * tr.multFromOIn * w * w
      gOmega[t] = gOmega[t]! + gb * invLam * pL[tr.oIn]! * tr.multFromOIn * 2 * w
      gLam += gb * (-bTri[t]! * invLam)
    }
    let pDotG = 0; for (let i = 0; i < N_PAIR; i++) pDotG += pL[i]! * gPL[i]!
    const rhs = new Float64Array(N_PAIR); for (let i = 0; i < N_PAIR; i++) rhs[i] = gPL[i]! - pDotG
    const shiftM = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < N_PAIR; i++) for (let j = 0; j < N_PAIR; j++) shiftM[i * N_PAIR + j] = (i === j ? lam : 0) - M2[i * N_PAIR + j]! + lam * pL[j]!
    const qAdj = solveLinear57(shiftM, rhs)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!, w = omega[t]!
      gOmega[t] = gOmega[t]! + pL[tr.oIn]! * (gLam * pR[tr.oOut]! + qAdj[tr.oOut]!) * tr.multFromOIn * 2 * w
    }
    const gradLogW = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) gradLogW[t] = gOmega[t]! * omega[t]!
    return { rho, gradLogW, v4440: v }
  }

  const runLBFGS = (
    dim: number, xInit: Float64Array,
    evalFn: (x: Float64Array, needGrad: boolean) => { readonly val: number; readonly g: Float64Array },
    maxIters: number, tol = 5e-5,
  ): { readonly x: Float64Array; readonly val: number } => {
    const x = Float64Array.from(xInit), mHist = 14
    const sHist: Float64Array[] = [], yHist: Float64Array[] = [], rhoHist: number[] = []
    let cur = evalFn(x, true)
    const tryX = new Float64Array(dim)
    for (let it = 1; it <= maxIters; it++) {
      const grad = cur.g, q = Float64Array.from(grad), kH = sHist.length, alpha = new Float64Array(kH)
      for (let i = kH - 1; i >= 0; i--) {
        let dot = 0; for (let j = 0; j < dim; j++) dot += sHist[i]![j]! * q[j]!
        alpha[i] = rhoHist[i]! * dot
        for (let j = 0; j < dim; j++) q[j] = q[j]! - alpha[i]! * yHist[i]![j]!
      }
      let scale = 1.0
      if (kH > 0) {
        let sy = 0, yy = 0
        for (let j = 0; j < dim; j++) { sy += sHist[kH - 1]![j]! * yHist[kH - 1]![j]!; yy += yHist[kH - 1]![j]! * yHist[kH - 1]![j]! }
        if (yy > 1e-24 && sy > 0) scale = sy / yy
      }
      const d = new Float64Array(dim)
      for (let j = 0; j < dim; j++) d[j] = scale * q[j]!
      for (let i = 0; i < kH; i++) {
        let dot = 0; for (let j = 0; j < dim; j++) dot += yHist[i]![j]! * d[j]!
        const beta = rhoHist[i]! * dot
        for (let j = 0; j < dim; j++) d[j] = d[j]! + sHist[i]![j]! * (alpha[i]! - beta)
      }
      let dg = 0; for (let j = 0; j < dim; j++) dg += d[j]! * grad[j]!
      if (dg <= 0) { d.set(grad); sHist.length = 0; yHist.length = 0; rhoHist.length = 0 }
      let step = 1.0, ok = false
      for (let ls = 0; ls < 16; ls++) {
        for (let j = 0; j < dim; j++) tryX[j] = Math.max(-8, Math.min(8, x[j]! + step * d[j]!))
        if (evalFn(tryX, false).val > cur.val + 1e-12) { ok = true; break }
        step *= 0.5
      }
      if (!ok) break
      const nxt = evalFn(tryX, true)
      const sVec = new Float64Array(dim), yVec = new Float64Array(dim)
      let sy = 0
      for (let j = 0; j < dim; j++) { sVec[j] = tryX[j]! - x[j]!; yVec[j] = grad[j]! - nxt.g[j]!; sy += sVec[j]! * yVec[j]! }
      if (sy > 1e-22) {
        if (sHist.length >= mHist) { sHist.shift(); yHist.shift(); rhoHist.shift() }
        sHist.push(sVec); yHist.push(yVec); rhoHist.push(1 / sy)
      }
      x.set(tryX); cur = nxt
      let gn = 0; for (let j = 0; j < dim; j++) gn += cur.g[j]! * cur.g[j]!
      if (Math.sqrt(gn) < tol) break
    }
    return { x, val: cur.val }
  }

  const omScratch = new Float64Array(N_TRIPLE)
  const logW57Init = new Float64Array(N_PAIR)
  for (const po of PAIR_ORBITS) logW57Init[po.id] = Math.log(po.s2 === 1 ? 1.0 : po.s2 === 2 ? 0.44 : 0.24)
  const res1Step = runLBFGS(
    N_PAIR, logW57Init,
    (lw57, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw57[TRIPLE_ORBITS[t]!.oOut]!)
      const r = eval2StepV57(omScratch, needGrad)
      const g57 = new Float64Array(N_PAIR)
      if (needGrad) for (let t = 0; t < N_TRIPLE; t++) g57[TRIPLE_ORBITS[t]!.oOut] = g57[TRIPLE_ORBITS[t]!.oOut]! + r.gradLogW[t]!
      return { val: r.rho, g: g57 }
    },
    IS_FULL ? 120 : 50, 1e-5,
  )
  const rho1Step57 = res1Step.val

  const logW4440Init = new Float64Array(N_TRIPLE)
  for (let t = 0; t < N_TRIPLE; t++) logW4440Init[t] = res1Step.x[TRIPLE_ORBITS[t]!.oOut]!
  const res2Step57 = runLBFGS(
    N_TRIPLE, logW4440Init,
    (lw, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw[t]!)
      const r = eval2StepV57(omScratch, needGrad)
      return { val: r.rho, g: r.gradLogW }
    },
    IS_FULL ? 280 : 18, IS_FULL ? 1e-6 : 2e-4,
  )
  for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(res2Step57.x[t]!)
  let warmV4440 = eval2StepV4440(omScratch, false).v4440
  const res2Step4440 = runLBFGS(
    N_TRIPLE, res2Step57.x,
    (lw, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw[t]!)
      const r = eval2StepV4440(omScratch, needGrad, warmV4440)
      warmV4440 = r.v4440
      return { val: r.rho, g: r.gradLogW }
    },
    IS_FULL ? 220 : 6, IS_FULL ? 1e-6 : 2e-4,
  )
  for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(res2Step4440.x[t]!)
  const fin4440 = eval2StepV4440(omScratch, true, warmV4440)
  const rho2Step4440 = fin4440.rho
  console.log(`  CF 1-step (57 pair weights)                : rho >= ${rho1Step57.toFixed(8)}`)
  console.log(`  CF 2-step (4,440 triple weights, 4440 bdy) : rho >= ${rho2Step4440.toFixed(8)}`)

  const buildBigInt2StepWitness = (kMin: number, kMax: number): { readonly num: bigint; readonly den: bigint } => {
    const kLen = kMax - kMin + 1
    const omInt = new Array<bigint>(N_TRIPLE), omSq = new Array<bigint>(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) { const q = BigInt(Math.max(1, Math.round(omScratch[t]! * 10000))); omInt[t] = q; omSq[t] = q * q }
    const vInt = new Array<bigint>(N_TRIPLE), vSign = fin4440.v4440[0]! >= 0 ? 1 : -1
    let vMinPos = Number.POSITIVE_INFINITY
    for (let t = 0; t < N_TRIPLE; t++) { const a = vSign * fin4440.v4440[t]!; assertExact(a > 0, `v4440[${t}] positive`); if (a < vMinPos) vMinPos = a }
    for (let t = 0; t < N_TRIPLE; t++) vInt[t] = BigInt(Math.max(1, Math.round(((vSign * fin4440.v4440[t]!) / vMinPos) * 10000)))
    const Z: bigint[][] = [[], [], new Array<bigint>(N_PAIR).fill(1n)]
    for (let k = 3; k <= kMax; k++) {
      const prev = Z[k - 1]!, cur = new Array<bigint>(N_PAIR).fill(0n)
      for (let t = 0; t < N_TRIPLE; t++) { const tr = TRIPLE_ORBITS[t]!; cur[tr.oOut] = cur[tr.oOut]! + BigInt(tr.multIntoOOut) * omSq[t]! * prev[tr.oIn]! }
      Z.push(cur)
    }
    const log2LamInt = (Z[kMax]![0]!.toString(2).length - Z[kMin]![0]!.toString(2).length) / (kMax - kMin)
    const W: bigint[] = new Array<bigint>(kMax + 3).fill(0n)
    for (let i = 0; i < kLen; i++) {
      const k = kMin + i, win = Math.sin((Math.PI * (i + 1)) / (kLen + 1)), expBits = 0.5 * (kMax - k) * log2LamInt, sh = Math.floor(expBits)
      W[k] = BigInt(Math.max(1, Math.round(win * Math.pow(2, expBits - sh) * 65536))) << BigInt(sh)
    }
    const M_CUT = 24
    const S00Prev = new Array<bigint>(N_PAIR).fill(0n), S01Prev = new Array<bigint>(N_PAIR).fill(0n)
    const Sm: bigint[][] = Array.from({ length: M_CUT + 1 }, () => new Array<bigint>(N_PAIR).fill(0n))
    for (let k = kMin; k <= kMax; k++) {
      const wk = W[k]!, wk2 = wk * wk, w01 = wk * W[k + 1]!, zkm1 = Z[k - 1]!
      for (let o = 0; o < N_PAIR; o++) { S00Prev[o] = S00Prev[o]! + wk2 * zkm1[o]!; if (w01 !== 0n) S01Prev[o] = S01Prev[o]! + w01 * zkm1[o]! }
      const mLim = Math.min(M_CUT, k - 2)
      for (let m = 1; m <= mLim; m++) { const zkm = Z[k - m]!, smRow = Sm[m]!; for (let o = 0; o < N_PAIR; o++) smRow[o] = smRow[o]! + wk2 * zkm[o]! }
    }
    let bigDen = 0n
    for (let t = 0; t < N_TRIPLE; t++) { const tr = TRIPLE_ORBITS[t]!; bigDen += BigInt(tr.totalTriples) * omSq[t]! * vInt[t]! * vInt[t]! * S00Prev[tr.oIn]! }
    let bigNum = 0n
    const sPrevBig = new Array<bigint>(N_PAIR).fill(0n)
    for (let t = 0; t < N_TRIPLE; t++) { const tr = TRIPLE_ORBITS[t]!; sPrevBig[tr.oOut] = sPrevBig[tr.oOut]! + BigInt(tr.multIntoOOut) * omSq[t]! * vInt[t]! * S01Prev[tr.oIn]! }
    for (let i = 0; i < M0_OIN.length; i++) bigNum += 48n * BigInt(M0_MULT[i]!) * sPrevBig[M0_OIN[i]!]! * omInt[M0_TID[i]!]! * vInt[M0_TID[i]!]!
    for (let k = 0; k < N_P1; k++) {
      let s = 0n
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) { const t1 = P1_TIN[idx]!, t2 = P1_TOUT[idx]!; s += Sm[1]![P1_O0[idx]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]! }
      bigNum += 48n * BigInt(P1_MULT[k]!) * s
    }
    const P1_GROUPED: { readonly o0: number; readonly w: bigint }[][] = []
    for (let k = 0; k < N_P1; k++) {
      const m = new Map<number, bigint>()
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) { const o0 = P1_O0[idx]!; m.set(o0, (m.get(o0) ?? 0n) + omInt[P1_TIN[idx]!]! * omInt[P1_TOUT[idx]!]!) }
      P1_GROUPED.push(Array.from(m, ([o0, w]) => ({ o0, w })))
    }
    const evalP1Row = (sRow: readonly bigint[]): bigint[] => P1_GROUPED.map((grp, k) => { let s = 0n; for (const { o0, w } of grp) s += sRow[o0]! * w; return s * BigInt(P1_MULT[k]!) })
    {
      const p1 = evalP1Row(Sm[2]!)
      for (let i = 0; i < N_M2; i++) { const t1 = M2_TIN[i]!, t2 = M2_TOUT[i]!; bigNum += 48n * p1[M2_P1[i]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]! }
    }
    {
      const p1 = evalP1Row(Sm[3]!), wm2 = new Array<bigint>(N_Q3P).fill(0n)
      for (let i = 0; i < N_M2; i++) wm2[M2_Q3P[i]!] = wm2[M2_Q3P[i]!]! + p1[M2_P1[i]!]! * omInt[M2_TIN[i]!]! * omInt[M2_TOUT[i]!]!
      for (let i = 0; i < N_M3; i++) { const t1 = M3_TIN[i]!, t2 = M3_TOUT[i]!; bigNum += 48n * wm2[M3_FROM[i]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]! }
    }
    {
      const D = M_CUT - 4
      const uVec: bigint[][] = [new Array<bigint>(N_Q3P).fill(0n)]
      for (let i = 0; i < N_Q3T; i++) { const tid = Q3T_TID[i]!; uVec[0]![Q3T_FROM[i]!] = uVec[0]![Q3T_FROM[i]!]! + omSq[tid]! * vInt[tid]! * vInt[tid]! }
      for (let d = 1; d <= D; d++) {
        const prev = uVec[d - 1]!, cur = new Array<bigint>(N_Q3P).fill(0n)
        for (let i = 0; i < N_Q3T; i++) cur[Q3T_FROM[i]!] = cur[Q3T_FROM[i]!]! + prev[Q3T_TO[i]!]! * omSq[Q3T_TID[i]!]!
        uVec.push(cur)
      }
      const gP1All: bigint[][] = []
      for (let d = 0; d <= D; d++) {
        const ud = uVec[d]!, gM2 = new Array<bigint>(N_Q3P).fill(0n)
        for (let i = 0; i < N_M3; i++) gM2[M3_FROM[i]!] = gM2[M3_FROM[i]!]! + ud[M3_TO[i]!]! * omInt[M3_TIN[i]!]! * omInt[M3_TOUT[i]!]!
        const gP1 = new Array<bigint>(N_P1).fill(0n)
        for (let i = 0; i < N_M2; i++) gP1[M2_P1[i]!] = gP1[M2_P1[i]!]! + gM2[M2_Q3P[i]!]! * omInt[M2_TIN[i]!]! * omInt[M2_TOUT[i]!]!
        gP1All.push(gP1)
      }
      for (let k = 0; k < N_P1; k++) {
        const grp = P1_GROUPED[k]!
        let accK = 0n
        for (let d = 0; d <= D; d++) {
          const gp = gP1All[d]![k]!
          if (gp === 0n) continue
          const sm = Sm[4 + d]!
          let dot = 0n; for (const { o0, w } of grp) dot += w * sm[o0]!
          accK += gp * dot
        }
        bigNum += 48n * BigInt(P1_MULT[k]!) * accK
      }
    }
    return { num: bigNum, den: bigDen }
  }

  const big2 = buildBigInt2StepWitness(10, IS_FULL ? 650 : 120)
  console.log(`  2-Step BigInt witness (k=10..${IS_FULL ? 650 : 120}): rho >= ${ratFloorDec(big2.num, big2.den, 6)} (8-dec: ${ratFloorDec(big2.num, big2.den, 8)})`)

  const nTriplesToScan = IS_FULL ? N_TRIPLE : 120
  const REP_C4_TO_QUAD = new Int32Array(N_TRIPLE * N_CLIQUES).fill(-1)
  const quadTInList: number[] = [], quadTOutList: number[] = []
  const quadMultFromInList: number[] = [], quadMultIntoOutList: number[] = [], quadTotalList: number[] = []

  for (let tid = 0; tid < nTriplesToScan; tid++) {
    const tr = TRIPLE_ORBITS[tid]!, stab = tr.stabIdx
    if (stab.length === 1) {
      for (const id4 of NEXT_CLIQUES[tr.c3Id]!) {
        const qid = quadTInList.length, tOut = tripleOrbitOf(tr.c2Id, tr.c3Id, id4)
        const tot = tr.totalTriples, outTot = TRIPLE_ORBITS[tOut]!.totalTriples
        assertExact(tot % outTot === 0, `Quad orbit integrality failed at tid=${tid}`)
        REP_C4_TO_QUAD[tid * N_CLIQUES + id4] = qid
        quadTInList.push(tid); quadTOutList.push(tOut); quadMultFromInList.push(1); quadMultIntoOutList.push(tot / outTot); quadTotalList.push(tot)
      }
    } else {
      const keyToQid = new Map<number, number>(), multMap = new Map<number, number>()
      for (const id4 of NEXT_CLIQUES[tr.c3Id]!) {
        const c4 = CLIQUES[id4]!
        let minC4 = 0x7fffffff
        for (let si = 0; si < stab.length; si++) { const pm = permMask(WF4[stab[si]!]!, c4); if (pm < minC4) minC4 = pm }
        let qid = keyToQid.get(minC4)
        if (qid === undefined) {
          qid = quadTInList.length; keyToQid.set(minC4, qid)
          const c4RepId = CLIQUE_TO_ID.get(minC4)!
          quadTInList.push(tid); quadTOutList.push(tripleOrbitOf(tr.c2Id, tr.c3Id, c4RepId))
          quadMultFromInList.push(0); quadMultIntoOutList.push(0); quadTotalList.push(0)
        }
        REP_C4_TO_QUAD[tid * N_CLIQUES + id4] = qid
        multMap.set(qid, (multMap.get(qid) ?? 0) + 1)
      }
      for (const [qid, m] of multMap) {
        const tot = m * tr.totalTriples, outTot = TRIPLE_ORBITS[quadTOutList[qid]!]!.totalTriples
        assertExact(tot % outTot === 0, `Quad orbit ${qid} integrality failed`)
        quadMultFromInList[qid] = m; quadMultIntoOutList[qid] = tot / outTot; quadTotalList[qid] = tot
      }
    }
  }

  if (!IS_FULL) {
    let maxGradErr = 0
    for (const idx of [0, 53, 1234, 4439]) {
      const eps = 1e-5, old = res2Step4440.x[idx]!
      omScratch[idx] = Math.exp(old + eps)
      const fp = eval2StepV4440(omScratch, false, fin4440.v4440).rho
      omScratch[idx] = Math.exp(old - eps)
      const fm = eval2StepV4440(omScratch, false, fin4440.v4440).rho
      omScratch[idx] = Math.exp(old)
      const err = Math.abs((fp - fm) / (2 * eps) - fin4440.gradLogW[idx]!)
      if (err > maxGradErr) maxGradErr = err
    }
    console.log(
      `  Quadruple-orbit O(1) smoke check (${nTriplesToScan} triples -> ${quadTInList.length} exact integral quads) & 2-step gradErr=${maxGradErr.toExponential(2)}`,
    )
    recordGate(
      'S2.1',
      'Cartier-Foata 1-step/2-step lower bounds, BigInt witness, analytical gradient & quad-orbit integrality',
      rho2Step4440 > rho1Step57 && rho2Step4440 > 11.435 && big2.num * 1000n > 11430n * big2.den && maxGradErr < 1e-7 && quadTInList.length > 5000,
      `1-step>=${rho1Step57.toFixed(6)}, 2-step>=${rho2Step4440.toFixed(6)}, BigInt>=${ratFloorDec(big2.num, big2.den, 6)}, gradErr=${maxGradErr.toExponential(2)}`,
    )
    return {
      nPairs: N_PAIR, nTriples: N_TRIPLE, nQuads: null, rho1Step57, rho2Step4440, rho3StepQuad: null,
      big2StepNum: big2.num, big2StepDen: big2.den, big3StepNum: null, big3StepDen: null,
      bestLowerNum: big2.num, bestLowerDen: big2.den, bestAsympLower: rho2Step4440, gradErrChecked: maxGradErr,
      elapsedSec: (performance.now() - t0) / 1000,
    }
  }

  // --- FULL PRODUCTION: EXACT 3-STEP QUADRUPLE-ORBIT CF + EXACT BIGINT WITNESS ---
  const t3s = performance.now()
  const N_QUAD = quadTInList.length
  const QUAD_TIN = Int32Array.from(quadTInList), QUAD_TOUT = Int32Array.from(quadTOutList)
  const QUAD_MULT_FROM = Uint16Array.from(quadMultFromInList), QUAD_MULT_INTO = Uint16Array.from(quadMultIntoOutList)

  const quadOrbitOf = (c1: number, c2: number, c3: number, c4: number): number => {
    const tid = tripleOrbitOf(c1, c2, c3), p123 = tripleToRepPerm(c1, c2, c3)
    const q = REP_C4_TO_QUAD[tid * N_CLIQUES + PERM_CLIQUE[p123 * N_CLIQUES + c4]!]!
    assertExact(q >= 0, `Missing quad orbit for (${c1},${c2},${c3},${c4})`)
    return q
  }
  console.log(`  Built exact 3-step CF quadruple orbits: ${N_QUAD.toLocaleString()} orbits in ${((performance.now() - t3s) / 1000).toFixed(2)}s`)

  {
    const testOmQ = new Array<bigint>(N_QUAD)
    for (let q = 0; q < N_QUAD; q++) testOmQ[q] = BigInt(3 + (q % 7))
    const z4Form = new Array<bigint>(N_TRIPLE).fill(0n)
    for (let q = 0; q < N_QUAD; q++) { const to = QUAD_TOUT[q]!; z4Form[to] = z4Form[to]! + BigInt(QUAD_MULT_INTO[q]!) * testOmQ[q]! * testOmQ[q]! }
    for (let t = 0; t < 50; t++) {
      const tr = TRIPLE_ORBITS[t]!
      let bf = 0n
      for (const c0 of PREV_CLIQUES[tr.c1Id]!) { const w = testOmQ[quadOrbitOf(c0, tr.c1Id, tr.c2Id, tr.c3Id)]!; bf += w * w }
      assertExact(bf === z4Form[t], `Z[4][${t}] brute-force BigInt mismatch!`)
    }
  }

  const Q3_TRIP_A = new Uint8Array(N_Q3T), Q3_TRIP_B = new Uint8Array(N_Q3T), Q3_TRIP_C = new Uint8Array(N_Q3T)
  const Q3_TRIP_ID = new Int32Array(N_Q3P * N_Q3).fill(-1)
  {
    let idx = 0
    for (let pid = 0; pid < N_Q3P; pid++) {
      const a = Q3_PAIR_A[pid]!, b = Q3_PAIR_B[pid]!
      for (const c of Q3_NEXT[b]!) { Q3_TRIP_A[idx] = a; Q3_TRIP_B[idx] = b; Q3_TRIP_C[idx] = c; Q3_TRIP_ID[pid * N_Q3 + c] = idx; idx++ }
    }
    assertExact(idx === N_Q3T, 'Q3 triple count mismatch')
  }
  const Q3Q_FROM: number[] = [], Q3Q_TO: number[] = [], Q3Q_QID: number[] = []
  for (let t1 = 0; t1 < N_Q3T; t1++) {
    const a = Q3_TRIP_A[t1]!, b = Q3_TRIP_B[t1]!, c = Q3_TRIP_C[t1]!, ca = Q3_CLIQUES[a]!, cb = Q3_CLIQUES[b]!, cc = Q3_CLIQUES[c]!
    const pidBC = Q3_PAIR_ID[b * N_Q3 + c]!
    for (const d of Q3_NEXT[c]!) { Q3Q_FROM.push(t1); Q3Q_TO.push(Q3_TRIP_ID[pidBC * N_Q3 + d]!); Q3Q_QID.push(quadOrbitOf(ca, cb, cc, Q3_CLIQUES[d]!)) }
  }
  const N_Q3Q = Q3Q_FROM.length

  const M0_3_TIN: number[] = [], M0_3_TOUT: number[] = [], M0_3_QID: number[] = [], M0_3_MULT: number[] = []
  for (const { c1: c3, mult } of C_ALLOWS_0_REPS) {
    for (const c2 of PREV_CLIQUES[c3]!) {
      const tOut = tripleOrbitOf(c2, c3, id0)
      for (const c1 of PREV_CLIQUES[c2]!) {
        M0_3_TIN.push(tripleOrbitOf(c1, c2, c3)); M0_3_TOUT.push(tOut); M0_3_QID.push(quadOrbitOf(c1, c2, c3, id0)); M0_3_MULT.push(mult)
      }
    }
  }
  const M0_3_COEFF = Float64Array.from({ length: M0_3_TIN.length }, (_, i) => (24 * M0_3_MULT[i]!) / TRIPLE_ORBITS[M0_3_TIN[i]!]!.totalTriples)

  const P1_3_C2: number[] = [], P1_3_C3: number[] = [], P1_3_J1: number[] = [], P1_3_MULT: number[] = []
  const P1_3_TIN_M1: number[] = [], P1_3_TOUT_M1: number[] = []
  const P1_3_OFF: number[] = [0], P1_3_T0: number[] = [], P1_3_QIN: number[] = [], P1_3_QOUT: number[] = []
  for (const { c1: c3, mult } of C_ALLOWS_0_REPS) {
    const f3 = ALLOWED_NEXT[c3]!, prevC3 = PREV_CLIQUES[c3]!
    for (let a = 0; a < N_Q3; a++) {
      const j1 = Q3_CLIQUES[a]!
      if ((CLIQUES[j1]! & f3) !== CLIQUES[j1]!) continue
      const j1p = Q3_PLUS0[a]!
      for (const c2 of prevC3) {
        P1_3_C2.push(c2); P1_3_C3.push(c3); P1_3_J1.push(a); P1_3_MULT.push(mult)
        P1_3_TIN_M1.push(tripleOrbitOf(c2, c3, j1)); P1_3_TOUT_M1.push(tripleOrbitOf(c2, c3, j1p))
        for (const c1 of PREV_CLIQUES[c2]!) {
          P1_3_T0.push(tripleOrbitOf(c1, c2, c3)); P1_3_QIN.push(quadOrbitOf(c1, c2, c3, j1)); P1_3_QOUT.push(quadOrbitOf(c1, c2, c3, j1p))
        }
        P1_3_OFF.push(P1_3_T0.length)
      }
    }
  }
  const N_P1_3 = P1_3_C2.length
  const P1_3_T0_ARR = Int32Array.from(P1_3_T0), P1_3_QIN_ARR = Int32Array.from(P1_3_QIN), P1_3_QOUT_ARR = Int32Array.from(P1_3_QOUT)
  const P1_3_COEFF = new Float64Array(P1_3_T0.length)
  for (let k = 0; k < N_P1_3; k++) {
    const m = P1_3_MULT[k]!
    for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) P1_3_COEFF[idx] = m / TRIPLE_ORBITS[P1_3_T0_ARR[idx]!]!.totalTriples
  }

  const c3ToRepIdx = new Int32Array(N_CLIQUES).fill(-1)
  for (let i = 0; i < C_ALLOWS_0_REPS.length; i++) c3ToRepIdx[C_ALLOWS_0_REPS[i]!.c1] = i
  const N_P2_3 = C_ALLOWS_0_REPS.length * N_Q3P
  const M2_3_P1: number[] = [], M2_3_P2: number[] = [], M2_3_QIN: number[] = [], M2_3_QOUT: number[] = [], M2_3_TIN: number[] = [], M2_3_TOUT: number[] = []
  for (let k = 0; k < N_P1_3; k++) {
    const c2 = P1_3_C2[k]!, c3 = P1_3_C3[k]!, a = P1_3_J1[k]!, j1 = Q3_CLIQUES[a]!, j1p = Q3_PLUS0[a]!, c3i = c3ToRepIdx[c3]!
    for (const b of Q3_NEXT[a]!) {
      const j2 = Q3_CLIQUES[b]!, pid = Q3_PAIR_ID[a * N_Q3 + b]!
      M2_3_P1.push(k); M2_3_P2.push(c3i * N_Q3P + pid); M2_3_QIN.push(quadOrbitOf(c2, c3, j1, j2)); M2_3_QOUT.push(quadOrbitOf(c2, c3, j1p, j2))
      M2_3_TIN.push(tripleOrbitOf(c3, j1, j2)); M2_3_TOUT.push(tripleOrbitOf(c3, j1p, j2))
    }
  }
  const N_M2_3 = M2_3_P1.length

  const M3_3_P2: number[] = [], M3_3_Q3T: number[] = [], M3_3_QIN: number[] = [], M3_3_QOUT: number[] = [], M3_3_TIN: number[] = [], M3_3_TOUT: number[] = []
  for (let c3i = 0; c3i < C_ALLOWS_0_REPS.length; c3i++) {
    const c3 = C_ALLOWS_0_REPS[c3i]!.c1, f3 = ALLOWED_NEXT[c3]!
    for (let pid = 0; pid < N_Q3P; pid++) {
      const a = Q3_PAIR_A[pid]!, b = Q3_PAIR_B[pid]!, j1 = Q3_CLIQUES[a]!
      if ((CLIQUES[j1]! & f3) !== CLIQUES[j1]!) continue
      const j1p = Q3_PLUS0[a]!, j2 = Q3_CLIQUES[b]!
      for (const c of Q3_NEXT[b]!) {
        const j3 = Q3_CLIQUES[c]!
        M3_3_P2.push(c3i * N_Q3P + pid); M3_3_Q3T.push(Q3_TRIP_ID[pid * N_Q3 + c]!)
        M3_3_QIN.push(quadOrbitOf(c3, j1, j2, j3)); M3_3_QOUT.push(quadOrbitOf(c3, j1p, j2, j3))
        M3_3_TIN.push(tripleOrbitOf(j1, j2, j3)); M3_3_TOUT.push(tripleOrbitOf(j1p, j2, j3))
      }
    }
  }
  const N_M3_3 = M3_3_P2.length

  const M4_3_FROM: number[] = [], M4_3_TO: number[] = [], M4_3_QIN: number[] = [], M4_3_QOUT: number[] = []
  for (let t1 = 0; t1 < N_Q3T; t1++) {
    const a = Q3_TRIP_A[t1]!, b = Q3_TRIP_B[t1]!, c = Q3_TRIP_C[t1]!, j1 = Q3_CLIQUES[a]!, j1p = Q3_PLUS0[a]!, j2 = Q3_CLIQUES[b]!, j3 = Q3_CLIQUES[c]!
    const pidBC = Q3_PAIR_ID[b * N_Q3 + c]!
    for (const d of Q3_NEXT[c]!) {
      const j4 = Q3_CLIQUES[d]!
      M4_3_FROM.push(t1); M4_3_TO.push(Q3_TRIP_ID[pidBC * N_Q3 + d]!); M4_3_QIN.push(quadOrbitOf(j1, j2, j3, j4)); M4_3_QOUT.push(quadOrbitOf(j1p, j2, j3, j4))
    }
  }
  const N_M4_3 = M4_3_FROM.length
  console.log(`  Compiled 3-step CF interaction lists: M0=${M0_3_TIN.length}, P1=${N_P1_3} (${P1_3_T0_ARR.length} edges), M2=${N_M2_3}, M3=${N_M3_3}, M4=${N_M4_3}, Q3Q=${N_Q3Q}`)

  const eval3StepV4440 = (
    omegaQ: Float64Array, needGrad: boolean, pLInit?: Float64Array, vInit?: Float64Array,
  ): { readonly rho: number; readonly gradLogW: Float64Array; readonly pL: Float64Array; readonly v4440: Float64Array } => {
    const pL = pLInit ? Float64Array.from(pLInit) : new Float64Array(N_TRIPLE).fill(1 / N_TRIPLE)
    const tmpT = new Float64Array(N_TRIPLE)
    let lam = 1, diffPL3 = 1
    for (let it = 0; it < 600; it++) {
      tmpT.fill(0)
      for (let q = 0; q < N_QUAD; q++) { const w = omegaQ[q]!, to = QUAD_TOUT[q]!; tmpT[to] = tmpT[to]! + pL[QUAD_TIN[q]!]! * QUAD_MULT_FROM[q]! * w * w }
      let s = 0; for (let t = 0; t < N_TRIPLE; t++) s += tmpT[t]!; lam = s
      let diff = 0; for (let t = 0; t < N_TRIPLE; t++) { const nv = tmpT[t]! / s; diff += Math.abs(nv - pL[t]!); pL[t] = nv }
      diffPL3 = diff
      if (diff < 1e-13) break
    }
    if (needGrad) assertExact(diffPL3 < 1e-10, `eval3StepV4440 pL did not converge: diff=${diffPL3}`)
    const pR = new Float64Array(N_TRIPLE).fill(1 / N_TRIPLE)
    if (needGrad) {
      let diffPR3 = 1
      for (let it = 0; it < 600; it++) {
        tmpT.fill(0)
        for (let q = 0; q < N_QUAD; q++) { const w = omegaQ[q]!, ti = QUAD_TIN[q]!; tmpT[ti] = tmpT[ti]! + QUAD_MULT_FROM[q]! * w * w * pR[QUAD_TOUT[q]!]! }
        let s = 0; for (let t = 0; t < N_TRIPLE; t++) s += tmpT[t]!
        let diff = 0; for (let t = 0; t < N_TRIPLE; t++) { const nv = tmpT[t]! / s; diff += Math.abs(nv - pR[t]!); pR[t] = nv }
        diffPR3 = diff
        if (diff < 1e-13) break
      }
      assertExact(diffPR3 < 1e-10, `eval3StepV4440 pR did not converge: diff=${diffPR3}`)
      let lr = 0; for (let t = 0; t < N_TRIPLE; t++) lr += pL[t]! * pR[t]!
      for (let t = 0; t < N_TRIPLE; t++) pR[t] = pR[t]! / lr
    }

    const invLam = 1 / lam, invSqLam = 1 / Math.sqrt(lam), invLam2 = invLam * invLam, invLam3 = invLam2 * invLam, invLam4 = invLam2 * invLam2
    const P1 = new Float64Array(N_P1_3)
    for (let k = 0; k < N_P1_3; k++) {
      let s = 0
      for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) s += P1_3_COEFF[idx]! * pL[P1_3_T0_ARR[idx]!]! * omegaQ[P1_3_QIN_ARR[idx]!]! * omegaQ[P1_3_QOUT_ARR[idx]!]!
      P1[k] = s
    }
    const P2 = new Float64Array(N_P2_3)
    for (let i = 0; i < N_M2_3; i++) P2[M2_3_P2[i]!] = P2[M2_3_P2[i]!]! + P1[M2_3_P1[i]!]! * omegaQ[M2_3_QIN[i]!]! * omegaQ[M2_3_QOUT[i]!]!
    const W_m3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_M3_3; i++) W_m3[M3_3_Q3T[i]!] = W_m3[M3_3_Q3T[i]!]! + P2[M3_3_P2[i]!]! * omegaQ[M3_3_QIN[i]!]! * omegaQ[M3_3_QOUT[i]!]!
    const W_m4 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_M4_3; i++) W_m4[M4_3_TO[i]!] = W_m4[M4_3_TO[i]!]! + W_m3[M4_3_FROM[i]!]! * omegaQ[M4_3_QIN[i]!]! * omegaQ[M4_3_QOUT[i]!]!
    const R_left = Float64Array.from(W_m4), term = Float64Array.from(W_m4), nxtT = new Float64Array(N_Q3T), wSqQ3 = new Float64Array(N_Q3Q)
    for (let i = 0; i < N_Q3Q; i++) { const w = omegaQ[Q3Q_QID[i]!]!; wSqQ3[i] = w * w * invLam }
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3Q; i++) nxtT[Q3Q_TO[i]!] = nxtT[Q3Q_TO[i]!]! + term[Q3Q_FROM[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let t = 0; t < N_Q3T; t++) { const nv = nxtT[t]!; R_left[t] = R_left[t]! + nv; term[t] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    const diagM4 = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_Q3T; t++) { const tid = Q3T_TID[t]!; diagM4[tid] = diagM4[tid]! + 48 * invLam4 * R_left[t]! }

    const applyA3 = (v: Float64Array, out: Float64Array): void => {
      out.fill(0)
      for (let i = 0; i < M0_3_TIN.length; i++) {
        const t1 = M0_3_TIN[i]!, t2 = M0_3_TOUT[i]!, c = M0_3_COEFF[i]! * invSqLam * pL[t1]! * omegaQ[M0_3_QID[i]!]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let k = 0; k < N_P1_3; k++) {
        const t1 = P1_3_TIN_M1[k]!, t2 = P1_3_TOUT_M1[k]!, c = 24 * invLam * P1[k]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let i = 0; i < N_M2_3; i++) {
        const t1 = M2_3_TIN[i]!, t2 = M2_3_TOUT[i]!, c = 24 * invLam2 * P1[M2_3_P1[i]!]! * omegaQ[M2_3_QIN[i]!]! * omegaQ[M2_3_QOUT[i]!]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let i = 0; i < N_M3_3; i++) {
        const t1 = M3_3_TIN[i]!, t2 = M3_3_TOUT[i]!, c = 24 * invLam3 * P2[M3_3_P2[i]!]! * omegaQ[M3_3_QIN[i]!]! * omegaQ[M3_3_QOUT[i]!]!
        out[t1] = out[t1]! + c * v[t2]!; out[t2] = out[t2]! + c * v[t1]!
      }
      for (let t = 0; t < N_TRIPLE; t++) out[t] = out[t]! + diagM4[t]! * v[t]!
    }

    const invSqP = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) invSqP[t] = 1 / Math.sqrt(pL[t]!)
    const u = new Float64Array(N_TRIPLE), v = new Float64Array(N_TRIPLE), av = new Float64Array(N_TRIPLE)
    if (vInit) {
      let n2 = 0; for (let t = 0; t < N_TRIPLE; t++) { const ut = vInit[t]! / invSqP[t]!; u[t] = ut; n2 += ut * ut }
      const inv = 1 / Math.sqrt(n2); for (let t = 0; t < N_TRIPLE; t++) u[t] = u[t]! * inv
    } else {
      for (let t = 0; t < N_TRIPLE; t++) u[t] = Math.sqrt(pL[t]!)
    }
    let rho = 0, lastDiff3 = 1
    for (let it = 0; it < 600; it++) {
      for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqP[t]!
      applyA3(v, av)
      let n2 = 0
      for (let t = 0; t < N_TRIPLE; t++) { const nv = av[t]! * invSqP[t]! + 24.0 * u[t]!; av[t] = nv; n2 += nv * nv }
      const nrm = Math.sqrt(n2)
      let diff = 0; for (let t = 0; t < N_TRIPLE; t++) { const nv = av[t]! / nrm; diff += Math.abs(nv - u[t]!); u[t] = nv }
      lastDiff3 = diff
      if (diff < 1e-13) break
    }
    if (needGrad) assertExact(lastDiff3 < 1e-10, `eval3StepV4440 power iteration did not converge: diff=${lastDiff3}`)
    for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqP[t]!
    // Exact generalized Rayleigh quotient v^T A3 v (with v^T P v = u^T u = 1) matching Hellmann-Feynman gradient
    applyA3(v, av)
    let ray3 = 0; for (let t = 0; t < N_TRIPLE; t++) ray3 += v[t]! * av[t]!
    rho = ray3
    if (!needGrad) return { rho, gradLogW: new Float64Array(0), pL, v4440: v }

    const gOmega = new Float64Array(N_QUAD), gPL = new Float64Array(N_TRIPLE)
    let gLam = 0
    for (let t = 0; t < N_TRIPLE; t++) gPL[t] = -rho * v[t]! * v[t]!
    const gRLeft = new Float64Array(N_Q3T)
    let sumM4 = 0
    for (let t = 0; t < N_Q3T; t++) { const vv2 = v[Q3T_TID[t]!]! ** 2; sumM4 += R_left[t]! * vv2; gRLeft[t] = 48 * invLam4 * vv2 }
    gLam += -4 * 48 * invLam4 * invLam * sumM4
    const gW_m4 = Float64Array.from(gRLeft); term.set(gRLeft)
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3Q; i++) nxtT[Q3Q_FROM[i]!] = nxtT[Q3Q_FROM[i]!]! + term[Q3Q_TO[i]!]! * wSqQ3[i]!
      let nrm = 0; for (let t = 0; t < N_Q3T; t++) { const nv = nxtT[t]!; gW_m4[t] = gW_m4[t]! + nv; term[t] = nv; nrm += nv }
      if (nrm < 1e-16) break
    }
    for (let i = 0; i < N_Q3Q; i++) {
      const gEntry = gW_m4[Q3Q_TO[i]!]! * R_left[Q3Q_FROM[i]!]!, q = Q3Q_QID[i]!, w = omegaQ[q]!
      gOmega[q] = gOmega[q]! + gEntry * 2 * w * invLam; gLam += gEntry * (-w * w * invLam2)
    }
    const gW_m3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_M4_3; i++) {
      const g = gW_m4[M4_3_TO[i]!]!, fr = M4_3_FROM[i]!, q1 = M4_3_QIN[i]!, q2 = M4_3_QOUT[i]!, w1 = omegaQ[q1]!, w2 = omegaQ[q2]!, wf = W_m3[fr]!
      gW_m3[fr] = gW_m3[fr]! + g * w1 * w2; gOmega[q1] = gOmega[q1]! + g * wf * w2; gOmega[q2] = gOmega[q2]! + g * wf * w1
    }
    const gP2 = new Float64Array(N_P2_3)
    for (let i = 0; i < N_M3_3; i++) {
      const p2i = M3_3_P2[i]!, q1 = M3_3_QIN[i]!, q2 = M3_3_QOUT[i]!, w1 = omegaQ[q1]!, w2 = omegaQ[q2]!, p2v = P2[p2i]!
      const vv = v[M3_3_TIN[i]!]! * v[M3_3_TOUT[i]!]!, gProd = 48 * invLam3 * vv + gW_m3[M3_3_Q3T[i]!]!
      gP2[p2i] = gP2[p2i]! + gProd * w1 * w2; gOmega[q1] = gOmega[q1]! + gProd * p2v * w2; gOmega[q2] = gOmega[q2]! + gProd * p2v * w1
      gLam += -3 * 48 * invLam4 * p2v * w1 * w2 * vv
    }
    const gP1 = new Float64Array(N_P1_3)
    for (let i = 0; i < N_M2_3; i++) {
      const k = M2_3_P1[i]!, q1 = M2_3_QIN[i]!, q2 = M2_3_QOUT[i]!, w1 = omegaQ[q1]!, w2 = omegaQ[q2]!, pk = P1[k]!
      const vv = v[M2_3_TIN[i]!]! * v[M2_3_TOUT[i]!]!, gProd = 48 * invLam2 * vv + gP2[M2_3_P2[i]!]!
      gP1[k] = gP1[k]! + gProd * w1 * w2; gOmega[q1] = gOmega[q1]! + gProd * pk * w2; gOmega[q2] = gOmega[q2]! + gProd * pk * w1
      gLam += -2 * 48 * invLam3 * pk * w1 * w2 * vv
    }
    for (let k = 0; k < N_P1_3; k++) { const vv = v[P1_3_TIN_M1[k]!]! * v[P1_3_TOUT_M1[k]!]!; gP1[k] = gP1[k]! + 48 * invLam * vv; gLam += -48 * invLam2 * P1[k]! * vv }
    for (let k = 0; k < N_P1_3; k++) {
      const gk = gP1[k]!
      for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) {
        const t0 = P1_3_T0_ARR[idx]!, q1 = P1_3_QIN_ARR[idx]!, q2 = P1_3_QOUT_ARR[idx]!, c = P1_3_COEFF[idx]!, p0 = pL[t0]!, w1 = omegaQ[q1]!, w2 = omegaQ[q2]!
        gPL[t0] = gPL[t0]! + gk * c * w1 * w2; gOmega[q1] = gOmega[q1]! + gk * c * p0 * w2; gOmega[q2] = gOmega[q2]! + gk * c * p0 * w1
      }
    }
    for (let i = 0; i < M0_3_TIN.length; i++) {
      const t1 = M0_3_TIN[i]!, t2 = M0_3_TOUT[i]!, q = M0_3_QID[i]!, fac = 2 * M0_3_COEFF[i]! * invSqLam * v[t1]! * v[t2]!
      gPL[t1] = gPL[t1]! + fac * omegaQ[q]!; gOmega[q] = gOmega[q]! + fac * pL[t1]!; gLam += -0.5 * fac * invLam * pL[t1]! * omegaQ[q]!
    }
    let pDotG = 0; for (let t = 0; t < N_TRIPLE; t++) pDotG += pL[t]! * gPL[t]!
    const qAdj = new Float64Array(N_TRIPLE), rTerm = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) { const rv = (gPL[t]! - pDotG) * invLam; rTerm[t] = rv; qAdj[t] = rv }
    let qAdjNrm = 1
    for (let it = 0; it < 300; it++) {
      tmpT.fill(0)
      for (let q = 0; q < N_QUAD; q++) { const w = omegaQ[q]!, ti = QUAD_TIN[q]!; tmpT[ti] = tmpT[ti]! + QUAD_MULT_FROM[q]! * w * w * invLam * rTerm[QUAD_TOUT[q]!]! }
      let pDotR = 0; for (let t = 0; t < N_TRIPLE; t++) pDotR += pL[t]! * tmpT[t]!
      let nrm = 0; for (let t = 0; t < N_TRIPLE; t++) { const nv = tmpT[t]! - pDotR; qAdj[t] = qAdj[t]! + nv; rTerm[t] = nv; nrm += Math.abs(nv) }
      qAdjNrm = nrm
      if (nrm < 1e-14) break
    }
    assertExact(qAdjNrm < 1e-10, `eval3StepV4440 qAdj Neumann solve did not converge: nrm=${qAdjNrm}`)
    for (let q = 0; q < N_QUAD; q++) {
      const w = omegaQ[q]!
      gOmega[q] = gOmega[q]! + pL[QUAD_TIN[q]!]! * (gLam * pR[QUAD_TOUT[q]!]! + qAdj[QUAD_TOUT[q]!]!) * QUAD_MULT_FROM[q]! * 2 * w
    }
    const gradLogW = new Float64Array(N_QUAD)
    for (let q = 0; q < N_QUAD; q++) gradLogW[q] = gOmega[q]! * omegaQ[q]!
    return { rho, gradLogW, pL, v4440: v }
  }

  const logWQInit = new Float64Array(N_QUAD), omQScratch = new Float64Array(N_QUAD)
  for (let q = 0; q < N_QUAD; q++) { const lw = res2Step4440.x[QUAD_TOUT[q]!]!; logWQInit[q] = lw; omQScratch[q] = Math.exp(lw) }

  const init3 = eval3StepV4440(omQScratch, true)
  console.log(`  3-step lifted baseline check (must match 2-step ${rho2Step4440.toFixed(8)}): rho = ${init3.rho.toFixed(8)}`)
  assertExact(Math.abs(init3.rho - rho2Step4440) < 1e-6, `3-step lift mismatch: ${init3.rho} vs ${rho2Step4440}`)

  let maxGradErr3 = 0
  const gradSampleIdx = Array.from(
    new Set([
      0,
      Math.min(77, N_QUAD - 1),
      Math.floor(N_QUAD * 0.05),
      Math.floor(N_QUAD * 0.25),
      Math.floor(N_QUAD * 0.6),
      N_QUAD - 1,
    ]),
  )
  for (const idx of gradSampleIdx) {
    const eps = 1e-5, old = logWQInit[idx]!
    omQScratch[idx] = Math.exp(old + eps)
    const fp = eval3StepV4440(omQScratch, false, init3.pL, init3.v4440).rho
    omQScratch[idx] = Math.exp(old - eps)
    const fm = eval3StepV4440(omQScratch, false, init3.pL, init3.v4440).rho
    omQScratch[idx] = Math.exp(old)
    const err = Math.abs((fp - fm) / (2 * eps) - init3.gradLogW[idx]!)
    if (err > maxGradErr3) maxGradErr3 = err
  }
  assertExact(maxGradErr3 < 1e-7, `3-step analytical gradient check failed: ${maxGradErr3}`)
  console.log(`  3-step CF analytical gradient verified on 6 quad coords: maxErr = ${maxGradErr3.toExponential(2)} (< 1e-7)`)

  let warmPL3 = init3.pL, warmV3 = init3.v4440
  const res3Step = runLBFGS(
    N_QUAD, logWQInit,
    (lwQ, needGrad) => {
      for (let q = 0; q < N_QUAD; q++) omQScratch[q] = Math.exp(lwQ[q]!)
      const r = eval3StepV4440(omQScratch, needGrad, warmPL3, warmV3)
      warmPL3 = r.pL; warmV3 = r.v4440
      return { val: r.rho, g: r.gradLogW }
    },
    45, 1e-5,
  )
  for (let q = 0; q < N_QUAD; q++) omQScratch[q] = Math.exp(res3Step.x[q]!)
  const fin3 = eval3StepV4440(omQScratch, false, warmPL3, warmV3)
  const rho3StepQuad = fin3.rho
  console.log(`  CF 3-step (${N_QUAD.toLocaleString()} quad weights, 4,440 bdy): rho >= ${rho3StepQuad.toFixed(8)} (${((performance.now() - t3s) / 1000).toFixed(2)}s)`)

  const tBig3 = performance.now()
  const kMin3 = 10, kMax3 = 280, kLen3 = kMax3 - kMin3 + 1
  const omQInt = new Array<bigint>(N_QUAD), omQSq = new Array<bigint>(N_QUAD)
  for (let q = 0; q < N_QUAD; q++) { const iq = BigInt(Math.max(1, Math.round(omQScratch[q]! * 10000))); omQInt[q] = iq; omQSq[q] = iq * iq }
  const v3Int = new Array<bigint>(N_TRIPLE), v3Sign = fin3.v4440[0]! >= 0 ? 1 : -1
  let v3Min = Number.POSITIVE_INFINITY
  for (let t = 0; t < N_TRIPLE; t++) { const a = v3Sign * fin3.v4440[t]!; assertExact(a > 0, `v3[${t}] positive`); if (a < v3Min) v3Min = a }
  for (let t = 0; t < N_TRIPLE; t++) v3Int[t] = BigInt(Math.max(1, Math.round(((v3Sign * fin3.v4440[t]!) / v3Min) * 10000)))

  const Z3: bigint[][] = [[], [], [], new Array<bigint>(N_TRIPLE).fill(1n)]
  for (let k = 4; k <= kMax3; k++) {
    const prev = Z3[k - 1]!, cur = new Array<bigint>(N_TRIPLE).fill(0n)
    for (let q = 0; q < N_QUAD; q++) { const to = QUAD_TOUT[q]!; cur[to] = cur[to]! + BigInt(QUAD_MULT_INTO[q]!) * omQSq[q]! * prev[QUAD_TIN[q]!]! }
    Z3.push(cur)
  }
  const log2Lam3 = (Z3[kMax3]![0]!.toString(2).length - Z3[kMin3]![0]!.toString(2).length) / (kMax3 - kMin3)
  const W3: bigint[] = new Array<bigint>(kMax3 + 3).fill(0n)
  for (let i = 0; i < kLen3; i++) {
    const k = kMin3 + i, win = Math.sin((Math.PI * (i + 1)) / (kLen3 + 1)), expBits = 0.5 * (kMax3 - k) * log2Lam3, sh = Math.floor(expBits)
    W3[k] = BigInt(Math.max(1, Math.round(win * Math.pow(2, expBits - sh) * 65536))) << BigInt(sh)
  }
  const M_CUT3 = 22
  const S00_3 = new Array<bigint>(N_TRIPLE).fill(0n), S01_3 = new Array<bigint>(N_TRIPLE).fill(0n)
  const Sm3: bigint[][] = Array.from({ length: M_CUT3 + 1 }, () => new Array<bigint>(N_TRIPLE).fill(0n))
  for (let k = kMin3; k <= kMax3; k++) {
    const wk = W3[k]!, wk2 = wk * wk, w01 = wk * W3[k + 1]!, zk = Z3[k]!
    for (let t = 0; t < N_TRIPLE; t++) { S00_3[t] = S00_3[t]! + wk2 * zk[t]!; if (w01 !== 0n) S01_3[t] = S01_3[t]! + w01 * zk[t]! }
    const mLim = Math.min(M_CUT3, k - 3)
    for (let m = 1; m <= mLim; m++) { const zkm = Z3[k - m]!, smRow = Sm3[m]!; for (let t = 0; t < N_TRIPLE; t++) smRow[t] = smRow[t]! + wk2 * zkm[t]! }
  }

  let big3Den = 0n
  for (let t = 0; t < N_TRIPLE; t++) big3Den += BigInt(TRIPLE_ORBITS[t]!.totalTriples) * v3Int[t]! * v3Int[t]! * S00_3[t]!

  let big3Num = 0n
  for (let i = 0; i < M0_3_TIN.length; i++) {
    const t1 = M0_3_TIN[i]!, t2 = M0_3_TOUT[i]!
    big3Num += 48n * BigInt(M0_3_MULT[i]!) * S01_3[t1]! * omQInt[M0_3_QID[i]!]! * v3Int[t1]! * v3Int[t2]!
  }
  for (let k = 0; k < N_P1_3; k++) {
    let s = 0n
    for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) s += Sm3[1]![P1_3_T0_ARR[idx]!]! * omQInt[P1_3_QIN_ARR[idx]!]! * omQInt[P1_3_QOUT_ARR[idx]!]!
    big3Num += 48n * BigInt(P1_3_MULT[k]!) * s * v3Int[P1_3_TIN_M1[k]!]! * v3Int[P1_3_TOUT_M1[k]!]!
  }
  const evalP1Big3 = (sRow: readonly bigint[]): bigint[] => {
    const out = new Array<bigint>(N_P1_3)
    for (let k = 0; k < N_P1_3; k++) {
      let s = 0n
      for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) s += sRow[P1_3_T0_ARR[idx]!]! * omQInt[P1_3_QIN_ARR[idx]!]! * omQInt[P1_3_QOUT_ARR[idx]!]!
      out[k] = s * BigInt(P1_3_MULT[k]!)
    }
    return out
  }
  {
    const p1 = evalP1Big3(Sm3[2]!)
    for (let i = 0; i < N_M2_3; i++) big3Num += 48n * p1[M2_3_P1[i]!]! * omQInt[M2_3_QIN[i]!]! * omQInt[M2_3_QOUT[i]!]! * v3Int[M2_3_TIN[i]!]! * v3Int[M2_3_TOUT[i]!]!
  }
  {
    const p1 = evalP1Big3(Sm3[3]!), p2 = new Array<bigint>(N_P2_3).fill(0n)
    for (let i = 0; i < N_M2_3; i++) p2[M2_3_P2[i]!] = p2[M2_3_P2[i]!]! + p1[M2_3_P1[i]!]! * omQInt[M2_3_QIN[i]!]! * omQInt[M2_3_QOUT[i]!]!
    for (let i = 0; i < N_M3_3; i++) big3Num += 48n * p2[M3_3_P2[i]!]! * omQInt[M3_3_QIN[i]!]! * omQInt[M3_3_QOUT[i]!]! * v3Int[M3_3_TIN[i]!]! * v3Int[M3_3_TOUT[i]!]!
  }
  {
    const D = M_CUT3 - 4
    const uVec: bigint[][] = [new Array<bigint>(N_Q3T)]
    for (let t = 0; t < N_Q3T; t++) { const vt = v3Int[Q3T_TID[t]!]!; uVec[0]![t] = vt * vt }
    for (let d = 1; d <= D; d++) {
      const prev = uVec[d - 1]!, cur = new Array<bigint>(N_Q3T).fill(0n)
      for (let i = 0; i < N_Q3Q; i++) cur[Q3Q_FROM[i]!] = cur[Q3Q_FROM[i]!]! + prev[Q3Q_TO[i]!]! * omQSq[Q3Q_QID[i]!]!
      uVec.push(cur)
    }
    for (let d = 0; d <= D; d++) {
      const ud = uVec[d]!, gM3 = new Array<bigint>(N_Q3T).fill(0n)
      for (let i = 0; i < N_M4_3; i++) gM3[M4_3_FROM[i]!] = gM3[M4_3_FROM[i]!]! + ud[M4_3_TO[i]!]! * omQInt[M4_3_QIN[i]!]! * omQInt[M4_3_QOUT[i]!]!
      const gP2 = new Array<bigint>(N_P2_3).fill(0n)
      for (let i = 0; i < N_M3_3; i++) gP2[M3_3_P2[i]!] = gP2[M3_3_P2[i]!]! + gM3[M3_3_Q3T[i]!]! * omQInt[M3_3_QIN[i]!]! * omQInt[M3_3_QOUT[i]!]!
      const gP1 = new Array<bigint>(N_P1_3).fill(0n)
      for (let i = 0; i < N_M2_3; i++) gP1[M2_3_P1[i]!] = gP1[M2_3_P1[i]!]! + gP2[M2_3_P2[i]!]! * omQInt[M2_3_QIN[i]!]! * omQInt[M2_3_QOUT[i]!]!
      const smRow = Sm3[4 + d]!
      for (let k = 0; k < N_P1_3; k++) {
        const gp = gP1[k]!
        if (gp === 0n) continue
        let dot = 0n
        for (let idx = P1_3_OFF[k]!, end = P1_3_OFF[k + 1]!; idx < end; idx++) dot += smRow[P1_3_T0_ARR[idx]!]! * omQInt[P1_3_QIN_ARR[idx]!]! * omQInt[P1_3_QOUT_ARR[idx]!]!
        big3Num += 48n * BigInt(P1_3_MULT[k]!) * gp * dot
      }
    }
  }
  console.log(
    `  CONCRETE EXACT BIGINT 3-STEP WITNESS (k=${kMin3}..${kMax3}, M_CUT=${M_CUT3}, ZERO sqrt): ` +
      `rho >= ${ratFloorDec(big3Num, big3Den, 6)} (8-dec: ${ratFloorDec(big3Num, big3Den, 8)}, ${((performance.now() - tBig3) / 1000).toFixed(2)}s)`,
  )

  const use3 = big3Num * big2.den >= big2.num * big3Den
  const bestNum = use3 ? big3Num : big2.num, bestDen = use3 ? big3Den : big2.den
  const bestAsymp = Math.max(rho2Step4440, rho3StepQuad)

  recordGate(
    'G2.1',
    '3-step quadruple-orbit CF Markov lower bound & exact BigInt witness strictly beat baseline (11.439047)',
    rho3StepQuad > rho2Step4440 && bestNum * 1000000n > 11439047n * bestDen,
    `2-step BigInt>=${ratFloorDec(big2.num, big2.den, 6)}, 3-step BigInt>=${ratFloorDec(big3Num, big3Den, 6)}, asymp>=${floatFloorDec(bestAsymp, 6)}`,
  )

  return {
    nPairs: N_PAIR, nTriples: N_TRIPLE, nQuads: N_QUAD, rho1Step57, rho2Step4440, rho3StepQuad,
    big2StepNum: big2.num, big2StepDen: big2.den, big3StepNum: big3Num, big3StepDen: big3Den,
    bestLowerNum: bestNum, bestLowerDen: bestDen, bestAsympLower: bestAsymp, gradErrChecked: maxGradErr3,
    elapsedSec: (performance.now() - t0) / 1000,
  }
}

// =================================================================================================
// MAIN DRIVER
// =================================================================================================

async function main(): Promise<void> {
  console.log('=================================================================================')
  console.log(`EXACT DEPTH-5 -> DEPTH-6 SPECTRAL RADIUS COLLAPSE ON {3,4,3,4} DUAL 1-SKELETON [${MODE_LABEL}]`)
  console.log(`Graph: 24-regular RACG Cayley / cell-adjacency graph (primal vertices ideal)`)
  console.log(`Workers: ${N_WORKERS} | Node ${process.version} | CPUs: ${os.cpus().length}`)
  console.log('=================================================================================')

  const upper = await runUpperBounds()
  const lower = runLowerBounds()

  const finLo = ratFloorDec(lower.bestLowerNum, lower.bestLowerDen, 6)
  const asympLo = floatFloorDec(lower.bestAsympLower, 6)
  const upHi = ratCeilDec(upper.bestUpperNum, upper.bestUpperDen, 6)
  const finWidth = Number(upHi) - Number(finLo)
  const asympWidth = Number(upHi) - Number(asympLo)

  const rho24Lo = ratFloorDec(lower.bestLowerNum, 24n * lower.bestLowerDen, 6)
  const rho24Hi = ratCeilDec(upper.bestUpperNum, 24n * upper.bestUpperDen, 6)
  const gapLo = ratFloorDec(24n * upper.bestUpperDen - upper.bestUpperNum, 24n * upper.bestUpperDen, 6)
  const gapHi = ratCeilDec(24n * lower.bestLowerDen - lower.bestLowerNum, 24n * lower.bestLowerDen, 6)

  const elapsedSec = (performance.now() - T0_GLOBAL) / 1000
  const peakRssMb = process.memoryUsage().rss / (1024 * 1024)

  if (IS_FULL) {
    recordGate(
      'G3.1',
      'Double-ended exact BigInt spectral bracket collapse strictly tighter than Depth-5 baseline (width < 0.0025)',
      finWidth < 0.0025 && asympWidth < 0.0025 && Number(finLo) > 11.439047 && Number(upHi) < 11.443713,
      `Baseline [11.439047, 11.443713] (0.004666) -> Concrete BigInt [${finLo}, ${upHi}] (width=${finWidth.toFixed(6)}), asymp [${asympLo}, ${upHi}] (width=${asympWidth.toFixed(6)})`,
    )
  } else {
    recordGate(
      'S3.1',
      'Smoke-mode consistency & time budget (< 8 s)',
      lower.bestLowerNum * upper.bestUpperDen < upper.bestUpperNum * lower.bestLowerDen && elapsedSec < 8.0,
      `smoke bracket [${finLo}, ${upHi}] (width=${finWidth.toFixed(6)}), time=${elapsedSec.toFixed(2)}s (< 8 s)`,
    )
  }

  const outFile = IS_FULL ? 'tmp/spectral-depth5-results.json' : 'tmp/spectral-depth5-smoke.json'
  const outAbs = path.resolve(PKG_ROOT, outFile)
  fs.mkdirSync(path.dirname(outAbs), { recursive: true })
  const payload = {
    meta: {
      script: 'test/verify/spectral-radius-depth5.ts',
      graph: '24-regular RACG Cayley graph = cell-adjacency graph (dual 1-skeleton) of {3,4,3,4} (primal vertices ideal)',
      mode: MODE_LABEL,
      nodeVersion: process.version,
      workers: N_WORKERS,
      elapsedSec,
      peakRssMb,
      gatesPassed: GATES.filter(g => g.passed).length,
      gatesTotal: GATES.length,
    },
    baselineDepth5: {
      concreteBigInt: { tier: 'A', lower: '11.439047', upper: '11.443713', width: 0.004666 },
    },
    certifiedBracket: {
      concreteBigInt: { tier: 'A', bounds: [finLo, upHi], width: Number(finWidth.toFixed(6)) },
      asymptotic: { tier: 'B', bounds: [asympLo, upHi], width: Number(asympWidth.toFixed(6)) },
      rhoOver24: { tier: 'A', bounds: [rho24Lo, rho24Hi] },
      spectralGap: { tier: 'A', bounds: [gapLo, gapHi] },
    },
    upper: {
      ...upper,
      bestUpperNum: upper.bestUpperNum.toString(),
      bestUpperDen: upper.bestUpperDen.toString(),
      d6CertQ1M: upper.d6CertQ1M ? { ...upper.d6CertQ1M, num: upper.d6CertQ1M.num.toString(), den: upper.d6CertQ1M.den.toString() } : null,
      d6CertQ10M: upper.d6CertQ10M ? { ...upper.d6CertQ10M, num: upper.d6CertQ10M.num.toString(), den: upper.d6CertQ10M.den.toString() } : null,
    },
    lower: {
      ...lower,
      big2StepNum: lower.big2StepNum.toString(),
      big2StepDen: lower.big2StepDen.toString(),
      big3StepNum: lower.big3StepNum !== null ? lower.big3StepNum.toString() : null,
      big3StepDen: lower.big3StepDen !== null ? lower.big3StepDen.toString() : null,
      bestLowerNum: lower.bestLowerNum.toString(),
      bestLowerDen: lower.bestLowerDen.toString(),
    },
    gates: GATES,
  }
  fs.writeFileSync(outAbs, JSON.stringify(payload, null, 2))

  console.log('\n=================================================================================')
  console.log(`FINAL [${MODE_LABEL}] SPECTRAL RADIUS COLLAPSE ON {3,4,3,4}`)
  console.log('=================================================================================')
  console.log(`  Depth-5 baseline   : [11.439047, 11.443713]  (width = 0.004666)`)
  console.log(`  Concrete BigInt    : [${finLo}, ${upHi}]  (width <= ${finWidth.toFixed(6)})`)
  console.log(`  Asymptotic         : [${asympLo}, ${upHi}]  (width <= ${asympWidth.toFixed(6)})`)
  console.log(`  rho/24             : [${rho24Lo}, ${rho24Hi}] | lambda_gap: [${gapLo}, ${gapHi}]`)
  console.log(`  Output JSON        : ${outFile}`)
  console.log(`  OVERALL            : ${GATES.filter(g => g.passed).length}/${GATES.length} GATES PASSED (${elapsedSec.toFixed(2)} s, RSS ${peakRssMb.toFixed(1)} MB)`)
  console.log('=================================================================================')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

export {}
