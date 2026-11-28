// THE SELF'S SPECTRUM (report "Self persistence in reversible dynamics", experiments
// 1 and 2). B1's cluster (E-SLF-0182) and B3's open line (E-SLF-0183, E-SLF-0184) lose the
// cluster's excess in 8 to 32 beats. Is any of the cluster's weight on an eigenvector of the beat that stays bound
// for ever, and if only a part, is the cluster or the rule at fault? And which states next to the vacuum does the
// rule leave alone?
//
// WHY A RING IS THE QUOTIENT HERE. A state on one mesh line stays on it under the working rule (note/line-transfer.md
// Lemma 2). The congruence quotient at (sqrt 2)^m is the Cayley graph of K_I with slot a = right multiplication by
// k_a, so the mesh line through a dock in direction a is the cycle of k_a, of length its order (2^floor(m/2): 8 at
// (sqrt 2)^6, 16 at (sqrt 2)^8, 32 at (sqrt 2)^10), and every N-translate of a line carries the same label a at
// every dock, so the lifted lines never cross. A line sector of the quotient is therefore B1's engine on a ring of
// the line period, exact for any number of beats (periodic grade). Q1 walks the enumerated (sqrt 2)^6 quotient.
//
// THE RULES. PIECES: B1's (the working knit's line sector with E-SPN-0103's drift cost and fermion sign, pass contact,
// flat links, coin before). BARE: the same with the cost and the sign off, the working rule's own line sector.
//
// THE READING (gates in the item's what, gate 870c2c32aab3, set before any probe). Each sector splits into L momentum
// blocks (code/measure/self-spectrum); every block is diagonalized. span = docks of the smallest arc holding every
// love, minus 1; kappa4(e) = an eigenvector's weight on span <= 4; LOCALIZED iff kappa4 >= 1/2, and a size classifies
// only where phi4 (the share of configurations with span <= 4) is at most 0.25. retention_inf R = the start's weight on
// localized eigenvectors; K_inf = its diagonal-ensemble span <= 4 weight (no threshold); R_best = the most any K = 0
// start can put on them while sitting inside span 4. FAULT RULE: R >= 0.9 bound band; R < 0.5 with R_best >= 0.9 the
// cluster; R_best < 0.5 the rule; mixed otherwise.
//
// THE DARK SET (experiment 2) runs on the open line (an open ring that no love reaches the end of: the infinite line,
// honeycomb-exact by the line law), the windows of 7 and 9 docks about the anchored cluster (its span 4 or 6 plus one
// shell): the largest U-invariant subspace inside the window, and the restricted step's top singular value.
//
// SETTINGS. Default SMOKE (L 8 only, dark window 7 on an open ring of 16, tau to 3; a minute on a small machine; no
// evidence). SPECTRUM_SWEEP=full for a large machine.
//
// SMOKE (small machine, 2026-11-17): run 1 failed E1 and D-exact only because the smoke's open ring of 16 let the level's
// tail reach an end (fixed: open starts keep a margin off the ends, the smoke ring 24); run 2 open, every gate held.
//
// FULL RUN (M3, 2026-11-17, clone self-spectrum, 2,985 s, light slot). FAIL by the registered rule on E4 alone: the
// largest eigen residual is 2.0e-9 against the 1e-9 bar (float accumulation; E6 rebuilds 64 beats from the
// eigenvectors to 2.1e-13, orthonormality 1.0e-12). Every other gate held: C1 0, Q1 (1,048,576 docks, period 8 in 12
// directions, returns; orders 16 and 32), E1 5.7e-16, E2 9.8e-15, E3 8.3e-17, E5 1.4e-10, D-exact 0. Readings:
//   pieces n 3: R 1.0000 at L 16 and 32 (K 0), K_inf 0.9941, R_best 0.9987, top phase -0.330018 (the level), anchored
//     R 0.98 at L 16: the bound band. G-size holds (diff 0.0000, phase 9.6e-8).
//   bare n 3: R 0.6301 / 0.6302, K_inf 0.749 / 0.666, R_best 0.9939 (a bound trio at -2.7613, kappa4 0.994, PR 3.6):
//     mixed by the fault rule. G-size holds (phase 1.5e-6). P4 failed: the bare rule does bind a trio.
//   n 1: no flat phase (P1 holds). n 2 bare L 32: 57 localized, 1 to 3 a block, phi4 0.270, not classified (P2).
//   L 8 does not classify (phi4 0.886, P5 holds). Dark set: dimension 0 everywhere, B1's weight 0; sigma1^2 stays near
//   1 to tau 10 (the light cone fits inside the window; P6 mispredicted), B1 kept at tau 10: pieces 0.907 (W 7) and
//   0.917 (W 9), bare 0.323 and 0.463.
//
// Depth L2: B1's rule in floats, spectra by the Householder solver, every pair checked by its residual.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { AxisRing, Placed } from '@/code/measure/held-cluster'
import { pointBeatWith, type CutState } from '@/code/measure/bound-line'
import type { LockedTables } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  enumerateFrames,
  levelRing,
  reduceToLevel,
  type LevelRing,
} from '@/code/substrate/coxeter/congruence-3434'
import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import {
  emptyAmp,
  lineBeat,
  lineEngine,
  rankOf,
  type LineEngine,
} from '@/code/measure/cold-line'
import { unitaryEigenHouseholder } from '@/code/measure/spectral-flow'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import type { Vec } from '@/code/measure/quantum-ladder'
import {
  apply,
  beatMatrix,
  block,
  blockReps,
  columnOrthonormality,
  configOf,
  dense,
  denseUnitarity,
  indexOf,
  invariantInWindow,
  orbits,
  orthonormality,
  project,
  sector,
  spanOf,
  translation,
  translationGates,
  weightOn,
  windowStates,
  type Sector,
  type Sparse,
  type Variant,
} from '@/code/measure/self-spectrum'

const RECORDED = { energy: 0.33001851839229945, share: 0.9823600683345252 }

const EXACT = 1e-12
const EIGEN = 1e-9
// E4 scaled: the double eps 2^-52 and the frozen constant c of the bar c eps n_b N_b
const F64_EPS = 2 ** -52
const EIGEN_SCALE = 1e4
const EXPAND = 1e-8
const DARK = 1e-10
const LOCAL = 0.5
const CLASSIFY = 0.25
const SPAN = 4
const AGREE = 0.05
const PHASE_AGREE = 1e-3
const BOUND = 0.9
const LOOSE = 0.5
const BINS = 24
const E6_BEATS = 64
const TAU = 2 * Math.PI

type Setting = {
  name: 'smoke' | 'full'
  bare: readonly number[]
  piecesAll: readonly number[]
  piecesK0: readonly number[]
  e6: readonly { variant: Variant; L: number }[]
  windows: readonly { W: number; from: number }[]
  Lo: number
  taus: readonly number[]
  quotient: boolean
  orders: readonly number[]
}

const SMOKE: Setting = {
  name: 'smoke',
  bare: [8],
  piecesAll: [8],
  piecesK0: [],
  e6: [
    { variant: 'bare', L: 8 },
    { variant: 'pieces', L: 8 },
  ],
  windows: [{ W: 7, from: 8 }],
  Lo: 24,
  taus: [1, 2, 3],
  quotient: false,
  orders: [6],
}
const FULL: Setting = {
  name: 'full',
  bare: [8, 16, 32],
  piecesAll: [8, 16],
  piecesK0: [32],
  e6: [
    { variant: 'bare', L: 16 },
    { variant: 'pieces', L: 16 },
    { variant: 'pieces', L: 32 },
  ],
  // reach tau <= 10 stays inside docks 1 .. 30 of the open ring of 32
  windows: [
    { W: 7, from: 13 },
    { W: 9, from: 11 },
  ],
  Lo: 32,
  taus: [1, 2, 4, 8, 10],
  quotient: true,
  orders: [6, 8, 10],
}

const f4 = (x: number): string => x.toFixed(4)
const ex = (x: number): string => x.toExponential(1)
const mod = (a: number, m: number): number => ((a % m) + m) % m
const circ = (a: number, b: number): number => {
  const d = mod(a - b, TAU)

  return Math.min(d, TAU - d)
}

const eigenRows = (n: number, re: Float64Array, im: Float64Array) => hermitianEigenRows(n, re, im)

// ---- Q1: the quotient's lines ----

function product(g: Int32Array, t: Int32Array, ring: LevelRing): Int32Array {
  const out = new Int32Array(50)

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let sa = 0
      let sb = 0

      for (let l = 0; l < 5; l++) {
        sa += g[i * 5 + l]! * t[l * 5 + j]! + 2 * g[25 + i * 5 + l]! * t[25 + l * 5 + j]!
        sb += g[i * 5 + l]! * t[25 + l * 5 + j]! + g[25 + i * 5 + l]! * t[l * 5 + j]!
      }

      out[i * 5 + j] = sa % ring.modA
      out[25 + i * 5 + j] = sb % ring.modB
    }
  }

  return out
}

function transportOrder(slot: number, ring: LevelRing): number {
  const k = reduceToLevel(exactCell().transports[slot]!, ring)
  const one = new Int32Array(50)

  for (let i = 0; i < 5; i++) {
    one[i * 5 + i] = 1 % ring.modA
  }

  let g = k
  let p = 1

  while (g.some((v, i) => v !== one[i]) && p < 1 << 20) {
    g = product(g, k, ring)
    p++
  }

  return p
}

type Lines = { orders: Record<number, number[]>; walked: number[]; returns: boolean; docks: number; ok: boolean }

function quotientLines(setting: Setting): Lines {
  const orders: Record<number, number[]> = {}

  for (const m of setting.orders) {
    orders[m] = LINE_FIRSTS.map(s => transportOrder(s, levelRing({ twoPower: m, odd: 1 })))
  }

  let walked: number[] = []
  let returns = true
  let docks = 0

  if (setting.quotient) {
    const e = enumerateFrames({ level: { twoPower: 6, odd: 1 }, maxDocks: 1_100_000 })

    if (!e.fits) {
      throw new Error('self-spectrum: the (sqrt 2)^6 quotient does not fit')
    }

    docks = e.order
    walked = LINE_FIRSTS.map(slot => {
      const back = OPPOSITE[slot]!

      let x = 0
      let p = 0

      do {
        const y = e.table[x * 24 + slot]!

        if (e.table[y * 24 + back] !== x) {
          returns = false
        }

        x = y
        p++
      } while (x !== 0 && p <= e.order)

      return p
    })
  }

  const want = (m: number): number => 2 ** Math.floor(m / 2)
  const ok =
    setting.orders.every(m => orders[m]!.every(p => p === want(m))) &&
    (!setting.quotient || (walked.every(p => p === 8) && returns))

  return { orders, walked, returns, docks, ok }
}

// ---- starts ----

// B1's level on a ring of L: total momentum 0 over every anchor (anchors undefined) or at the given anchors, wrapped
// translates carried by c (pieces); `open` drops the configurations that would leave docks 1 .. L - 2
function levelStart(
  s: Sector,
  placed: readonly Placed[],
  anchors: readonly number[] | undefined,
  margin: number | undefined,
): { psi: Vec; dropped: number } {
  const L = s.L
  const open = margin !== undefined
  const at = anchors ?? Array.from({ length: L }, (_, X) => X)
  const kept = open ? placed : fitRing(placed, L).kept
  const psi = { re: new Float64Array(s.size), im: new Float64Array(s.size) }
  const w = 1 / Math.sqrt(at.length)

  let dropped = 0

  for (const X of at) {
    for (const p of kept) {
      const ys = p.ts.map(([x]) => x + X)

      if (open && ys.some(y => y < margin || y > L - 1 - margin)) {
        dropped += (p.re ** 2 + p.im ** 2) / at.length
        continue
      }

      const ms = p.ts.map(([x, j]) => {
        const d = mod(x + X, L)

        return j === 0 ? 2 * d + 1 : 2 * d
      })

      if (new Set(ms).size !== ms.length) {
        dropped += (p.re ** 2 + p.im ** 2) / at.length
        continue
      }

      const wrapped = ys.reduce((a, y) => a + Math.floor(y / L), 0)
      const c = s.variant === 'pieces' ? mod(-wrapped, 3) : 0
      const u = indexOf(s, ms) * s.cuts + c

      psi.re[u]! += w * p.re
      psi.im[u]! += w * p.im
    }
  }

  let norm = 0

  for (let u = 0; u < s.size; u++) {
    norm += psi.re[u]! ** 2 + psi.im[u]! ** 2
  }

  const scale = 1 / Math.sqrt(norm)

  for (let u = 0; u < s.size; u++) {
    psi.re[u]! *= scale
    psi.im[u]! *= scale
  }

  return { psi, dropped }
}

const beats = (U: Sparse, psi: Vec, t: number): Vec => {
  let v = psi

  for (let i = 0; i < t; i++) {
    v = apply(U, v)
  }

  return v
}

const diffMax = (a: Vec, b: Vec): number => {
  let w = 0

  for (let i = 0; i < a.re.length; i++) {
    w = Math.max(w, Math.abs(a.re[i]! - b.re[i]!), Math.abs(a.im[i]! - b.im[i]!))
  }

  return w
}

// ---- E1: the engine against pointBeatWith and cold-line ----

function againstPointBeat(s: Sector, U: Sparse, psi: Vec, options: { cost: boolean; sign: boolean }): number {
  const ring: AxisRing = { docks: Array.from({ length: s.L }, () => 0), first: 0, second: 1, position: new Map() }
  const tables = {} as LockedTables

  let cut: CutState = new Map()

  for (let u = 0; u < s.size; u++) {
    if (psi.re[u] === 0 && psi.im[u] === 0) {
      continue
    }

    const ms = configOf(s, Math.floor(u / s.cuts))

    cut.set(`${u}`, {
      ts: ms.map(m => ({ x: m >> 1, j: m & 1 ? 0 : 1, p: 0 })),
      c: u % s.cuts,
      amp: [psi.re[u]!, psi.im[u]!],
    })
  }

  let a = psi
  let worst = 0

  for (let t = 0; t < 6; t++) {
    cut = pointBeatWith({ ...options, unit: 0, flat: true }, tables, ring, cut)
    a = apply(U, a)

    const theirs = { re: new Float64Array(s.size), im: new Float64Array(s.size) }

    for (const v of cut.values()) {
      const ms = v.ts.map(tk => (tk.j === 0 ? 2 * tk.x + 1 : 2 * tk.x))
      const u = indexOf(s, ms) * s.cuts + (s.cuts === 1 ? 0 : v.c)

      theirs.re[u]! += v.amp[0]
      theirs.im[u]! += v.amp[1]
    }

    worst = Math.max(worst, diffMax(a, theirs))
  }

  return worst
}

function againstColdLine(s: Sector, U: Sparse, psi: Vec, closed: boolean): number {
  const e: LineEngine = closed ? lineEngine(s.L, s.n, true) : lineEngine(s.L, s.n, false)
  const map = new Int32Array(s.size).fill(-1)

  for (let i = 0; i < s.count; i++) {
    let lo = 0
    let hi = 0

    for (const m of configOf(s, i)) {
      if (m < 32) {
        lo |= 1 << m
      } else {
        hi |= 1 << (m - 32)
      }
    }

    const r = rankOf(e.sp.binom, lo, hi)

    for (let c = 0; c < s.cuts; c++) {
      map[i * s.cuts + c] = closed ? r * 3 + c : c === 0 ? r : -1
    }
  }

  let a = emptyAmp(e.sp.count * e.cuts)
  let b = emptyAmp(a.re.length)
  let mine = psi
  let worst = 0

  for (let u = 0; u < s.size; u++) {
    if (map[u]! >= 0) {
      a.re[map[u]!] = psi.re[u]!
      a.im[map[u]!] = psi.im[u]!
    } else {
      worst = Math.max(worst, Math.abs(psi.re[u]!), Math.abs(psi.im[u]!))
    }
  }

  for (let t = 0; t < 6; t++) {
    lineBeat(e, a, b, false)
    ;[a, b] = [b, a]
    mine = apply(U, mine)

    for (let u = 0; u < s.size; u++) {
      const v = map[u]!
      const tr = v >= 0 ? a.re[v]! : 0
      const ti = v >= 0 ? a.im[v]! : 0

      worst = Math.max(worst, Math.abs(mine.re[u]! - tr), Math.abs(mine.im[u]! - ti))
    }
  }

  return worst
}

// ---- the spectral analysis of one sector ----

type EigenRow = { k: number; phase: number; kappa: number; pr: number; b1: number; anchor: number }

type Analysis = {
  label: string
  variant: Variant
  L: number
  n: number
  size: number
  blocks: number
  allBlocks: boolean
  phi4: number
  classifies: boolean
  columns: number
  unitarity: number
  commutator: number
  periodic: boolean
  residual: number
  orthonormal: number
  residualRatio: number
  orthonormalRatio: number
  largestBlock: number
  countOk: boolean
  localized: number
  localizedPerBlock: number[]
  flat: number
  bins: { count: number; medianPr: number; localized: number }[]
  starts: boolean
  b1Block0: number
  R: number
  Ranchor: number
  Kinf: number
  KinfAnchor: number
  Rbest: number
  flatAnchor: number
  top: { phase: number; kappa: number; pr: number; weight: number } | undefined
  fault: string
  e6: number
  phases: number[]
  seconds: number
}

function faultOf(R: number, Rbest: number): string {
  return R >= BOUND ? 'bound band' : R < LOOSE && Rbest >= BOUND ? 'cluster' : Rbest < LOOSE ? 'rule' : 'mixed'
}

function analyze(
  L: number,
  n: number,
  variant: Variant,
  k0Only: boolean,
  placed: readonly Placed[],
  e6: boolean,
  log: (w: string) => void,
): Analysis {
  const started = Date.now()
  const s = sector(L, n, variant)
  const U = beatMatrix(s)
  const T = translation(s)
  const tg = translationGates(s, U, T)
  const o = orbits(s, T)
  const columns = columnOrthonormality(U)
  const spanOk = new Uint8Array(s.size)

  let small = 0

  for (let i = 0; i < s.count; i++) {
    const ok = spanOf(L, configOf(s, i)) <= SPAN

    small += ok ? 1 : 0

    for (let c = 0; c < s.cuts; c++) {
      spanOk[i * s.cuts + c] = ok ? 1 : 0
    }
  }

  const phi4 = small / s.count
  const starts = n === 3
  const b1 = starts ? levelStart(s, placed, undefined, undefined).psi : undefined
  const anchor = starts ? levelStart(s, placed, [0], undefined).psi : undefined
  const b1At64 = b1 && e6 ? beats(U, b1, E6_BEATS) : undefined
  const ks = k0Only ? [0] : Array.from({ length: L }, (_, k) => k)
  const rows: EigenRow[] = []
  const phasesByBlock: number[][] = []

  let unitarity = 0
  let residual = 0
  let orthonormal = 0
  let residualRatio = 0
  let orthonormalRatio = 0
  let largestBlock = 0
  let countOk = true
  let Kinf = 0
  let KinfAnchor = 0
  let Rbest = 0
  let b1Block0 = 0
  let e6Err = 0

  for (const k of ks) {
    const b = block(s, U, o, k)

    if (b.dim === 0) {
      phasesByBlock.push([])
      continue
    }

    const blockUnitarity = denseUnitarity(b.dim, b.re, b.im)

    unitarity = Math.max(unitarity, blockUnitarity)

    const eg = unitaryEigenHouseholder(b.dim, b.re, b.im)
    const blockOrthonormal = orthonormality(eg.vectors)

    residual = Math.max(residual, eg.residual)
    orthonormal = Math.max(orthonormal, blockOrthonormal)
    // E4 scaled (gate d99189b03149): the block's residual over eps n_b N_b, N_b = sqrt(1 + n_b u_b)
    // bounding |M_b|_2 from its own E2 reading, and its orthonormality over eps n_b
    residualRatio = Math.max(residualRatio, eg.residual / (F64_EPS * b.dim * Math.sqrt(1 + b.dim * blockUnitarity)))
    orthonormalRatio = Math.max(orthonormalRatio, blockOrthonormal / (F64_EPS * b.dim))
    largestBlock = Math.max(largestBlock, b.dim)
    countOk &&= eg.vectors.length === b.dim

    const inSpan = Uint8Array.from(b.reps, r => spanOk[r]!)
    const xb1 = b1 ? project(o, b, b1) : undefined
    const xan = anchor ? project(o, b, anchor) : undefined
    const ov = (x: Vec | undefined, v: Vec): [number, number] => {
      if (!x) {
        return [0, 0]
      }

      let r = 0
      let i = 0

      for (let a = 0; a < b.dim; a++) {
        r += v.re[a]! * x.re[a]! + v.im[a]! * x.im[a]!
        i += v.re[a]! * x.im[a]! - v.im[a]! * x.re[a]!
      }

      return [r, i]
    }
    const blockRows: (EigenRow & { v: Vec; o1: [number, number]; o2: [number, number] })[] = []

    if (k === 0 && xb1) {
      for (let a = 0; a < b.dim; a++) {
        b1Block0 += xb1.re[a]! ** 2 + xb1.im[a]! ** 2
      }
    }

    eg.vectors.forEach((v, i) => {
      let kappa = 0
      let p4 = 0

      for (let a = 0; a < b.dim; a++) {
        const w = v.re[a]! ** 2 + v.im[a]! ** 2

        kappa += inSpan[a]! ? w : 0
        p4 += w * w
      }

      const o1 = ov(xb1, v)
      const o2 = ov(xan, v)

      blockRows.push({
        k,
        phase: eg.phases[i]!,
        kappa,
        pr: 1 / p4,
        b1: o1[0] ** 2 + o1[1] ** 2,
        anchor: o2[0] ** 2 + o2[1] ** 2,
        v,
        o1,
        o2,
      })
    })

    // K_inf: the eigenphases grouped within 1e-9 (a degenerate group's cross terms kept)
    const order = blockRows.map((_, i) => i).sort((x, y) => blockRows[x]!.phase - blockRows[y]!.phase)
    const groups: number[][] = []

    for (const i of order) {
      const g = groups[groups.length - 1]

      if (g && Math.abs(blockRows[i]!.phase - blockRows[g[g.length - 1]!]!.phase) <= 1e-9) {
        g.push(i)
      } else {
        groups.push([i])
      }
    }

    for (const g of groups) {
      for (const which of [0, 1]) {
        if ((which === 0 && !xb1) || (which === 1 && !xan)) {
          continue
        }

        const wr = new Float64Array(b.dim)
        const wi = new Float64Array(b.dim)

        for (const i of g) {
          const row = blockRows[i]!
          const [cr, ci] = which === 0 ? row.o1 : row.o2

          for (let a = 0; a < b.dim; a++) {
            wr[a]! += cr * row.v.re[a]! - ci * row.v.im[a]!
            wi[a]! += cr * row.v.im[a]! + ci * row.v.re[a]!
          }
        }

        let kw = 0

        for (let a = 0; a < b.dim; a++) {
          kw += inSpan[a]! ? wr[a]! ** 2 + wi[a]! ** 2 : 0
        }

        if (which === 0) {
          Kinf += kw
        } else {
          KinfAnchor += kw
        }
      }
    }

    // R_best over the K 0 block
    if (k === 0) {
      const loc = blockRows.filter(r => r.kappa >= LOCAL)
      const m = loc.length

      if (m > 0) {
        const gre = new Float64Array(m * m)
        const gim = new Float64Array(m * m)

        for (let x = 0; x < m; x++) {
          for (let y = 0; y < m; y++) {
            let sr = 0
            let si = 0

            for (let a = 0; a < b.dim; a++) {
              if (!inSpan[a]) {
                continue
              }

              const ur = loc[x]!.v.re[a]!
              const ui = -loc[x]!.v.im[a]!
              const vr = loc[y]!.v.re[a]!
              const vi = loc[y]!.v.im[a]!

              sr += ur * vr - ui * vi
              si += ur * vi + ui * vr
            }

            gre[x * m + y] = sr
            gim[x * m + y] = si
          }
        }

        const h = hermitianEigenRows(m, gre, gim)

        Rbest = h.values[m - 1]!
      }
    }

    // E6: the eigen expansion of B1's start against 64 beats of the engine
    if (xb1 && b1At64) {
      const x64 = project(o, b, b1At64)
      const pr = new Float64Array(b.dim)
      const pi = new Float64Array(b.dim)

      for (const row of blockRows) {
        const th = row.phase * E6_BEATS
        const cr = row.o1[0] * Math.cos(th) - row.o1[1] * Math.sin(th)
        const ci = row.o1[0] * Math.sin(th) + row.o1[1] * Math.cos(th)

        for (let a = 0; a < b.dim; a++) {
          pr[a]! += cr * row.v.re[a]! - ci * row.v.im[a]!
          pi[a]! += cr * row.v.im[a]! + ci * row.v.re[a]!
        }
      }

      for (let a = 0; a < b.dim; a++) {
        e6Err = Math.max(e6Err, Math.abs(pr[a]! - x64.re[a]!), Math.abs(pi[a]! - x64.im[a]!))
      }
    }

    phasesByBlock.push(blockRows.map(r => r.phase))

    for (const r of blockRows) {
      rows.push({ k: r.k, phase: r.phase, kappa: r.kappa, pr: r.pr, b1: r.b1, anchor: r.anchor })
    }

    log(`  ${variant} n ${n} L ${L} block ${k} dim ${b.dim}`)
  }

  // flat phases: present in every block
  const flatPhase = (ph: number): boolean => phasesByBlock.every(list => list.some(q => circ(q, ph) <= 1e-9))
  const flatRows = k0Only ? [] : rows.filter(r => flatPhase(r.phase))
  const flatSet = new Set(phasesByBlock[0]!.filter(flatPhase).map(p => p.toFixed(8)))
  const loc = rows.filter(r => r.kappa >= LOCAL)
  const bins = Array.from({ length: BINS }, (_, i) => {
    const inBin = rows.filter(r => Math.min(BINS - 1, Math.floor((mod(r.phase + Math.PI, TAU) / TAU) * BINS)) === i)
    const prs = inBin.map(r => r.pr).sort((a, b) => a - b)

    return {
      count: inBin.length,
      medianPr: prs.length ? prs[Math.floor(prs.length / 2)]! : 0,
      localized: inBin.filter(r => r.kappa >= LOCAL).length,
    }
  })
  const R = loc.reduce((a, r) => a + r.b1, 0)
  const Ranchor = loc.reduce((a, r) => a + r.anchor, 0)
  const top = starts ? loc.filter(r => r.k === 0).sort((x, y) => y.b1 - x.b1)[0] : undefined
  const totalDim = ks.reduce((a, k) => a + blockReps(s, o, k).length, 0)

  countOk &&= k0Only || totalDim === s.size

  return {
    label: `${variant} n ${n} L ${L}${k0Only ? ' (K 0)' : ''}`,
    variant,
    L,
    n,
    size: s.size,
    blocks: ks.length,
    allBlocks: !k0Only,
    phi4,
    classifies: phi4 <= CLASSIFY,
    columns,
    unitarity,
    commutator: tg.commutator,
    periodic: tg.periodic,
    residual,
    orthonormal,
    residualRatio,
    orthonormalRatio,
    largestBlock,
    countOk,
    localized: loc.length,
    localizedPerBlock: ks.map(k => loc.filter(r => r.k === k).length),
    flat: flatSet.size,
    bins,
    starts,
    b1Block0,
    R,
    Ranchor: k0Only ? Number.NaN : Ranchor,
    Kinf,
    KinfAnchor: k0Only ? Number.NaN : KinfAnchor,
    Rbest,
    flatAnchor: flatRows.reduce((a, r) => a + r.anchor, 0),
    top: top ? { phase: top.phase, kappa: top.kappa, pr: top.pr, weight: top.b1 } : undefined,
    fault: starts ? faultOf(R, Rbest) : 'n/a',
    e6: e6Err,
    phases: rows.map(r => r.phase),
    seconds: (Date.now() - started) / 1000,
  }
}

// E5: the blocks' eigenphases against the dense sector's
function denseAgreement(a: Analysis): number {
  const s = sector(a.L, a.n, a.variant)
  const U = beatMatrix(s)
  const d = dense(U)
  const eg = unitaryEigenHouseholder(s.size, d.re, d.im)
  const off = 0.123
  const x = eg.phases.map(p => mod(p + off, TAU)).sort((p, q) => p - q)
  const y = a.phases.map(p => mod(p + off, TAU)).sort((p, q) => p - q)

  if (x.length !== y.length) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(eg.residual, ...x.map((p, i) => circ(p, y[i]!)))
}

// ---- the dark set ----

type Dark = {
  label: string
  W: number
  states: number
  dim: number
  rounds: number
  leak: number
  drift: number
  unitarity: number
  phases: number[]
  period: number
  b1Weight: number
  dropped: number
  sigma: { tau: number; top: number; kept: number }[]
  endWeight: number
}

function darkSet(
  Lo: number,
  n: number,
  variant: Variant,
  win: { W: number; from: number },
  taus: readonly number[],
  placed: readonly Placed[],
  log: (w: string) => void,
): Dark {
  const s = sector(Lo, n, variant)
  const U = beatMatrix(s)
  const states = windowStates(s, win.from, win.from + win.W - 1)
  const inv = invariantInWindow(s, U, states, eigenRows)
  const k = inv.Q.k
  const eg = k > 0 ? unitaryEigenHouseholder(k, inv.hre, inv.him) : { phases: [], vectors: [], residual: 0 }
  const unitarity = Math.max(k > 0 ? denseUnitarity(k, inv.hre, inv.him) : 0, eg.residual)

  let period = 0

  for (let p = 1; p <= 12 && k > 0; p++) {
    if (eg.phases.every(ph => circ(ph * p, 0) <= 1e-9)) {
      period = p
      break
    }
  }

  // the anchored level, its configurations that would reach an end within tau_max beats dropped (reported)
  const start = n === 3 ? levelStart(s, placed, [win.from + 1], Math.max(...taus) + 1) : undefined
  const b1Weight = start ? weightOn(inv, start.psi) : Number.NaN
  const N = states.length
  const at = new Map<number, number>()

  states.forEach((u, i) => at.set(u, i))

  // the restricted step P U^tau P, column by column, and the weight at the ring's ends
  const endState = new Uint8Array(s.size)

  for (let i = 0; i < s.count; i++) {
    const end = configOf(s, i).some(m => m >> 1 === 0 || m >> 1 === Lo - 1)

    for (let c = 0; c < s.cuts; c++) {
      endState[i * s.cuts + c] = end ? 1 : 0
    }
  }

  const tauMax = Math.max(...taus)
  const A = new Map<number, { re: Float64Array; im: Float64Array }>()

  for (const t of taus) {
    A.set(t, { re: new Float64Array(N * N), im: new Float64Array(N * N) })
  }

  let endWeight = 0

  const sweep = (v0: Vec, record: (t: number, v: Vec) => void): void => {
    let v = v0

    for (let t = 1; t <= tauMax; t++) {
      v = apply(U, v)

      for (let u = 0; u < s.size; u++) {
        if (endState[u]) {
          endWeight += v.re[u]! ** 2 + v.im[u]! ** 2
        }
      }

      record(t, v)
    }
  }

  for (let j = 0; j < N; j++) {
    const e = { re: new Float64Array(s.size), im: new Float64Array(s.size) }

    e.re[states[j]!] = 1
    sweep(e, (t, v) => {
      const m = A.get(t)

      if (!m) {
        return
      }

      for (let i = 0; i < N; i++) {
        m.re[j * N + i] = v.re[states[i]!]!
        m.im[j * N + i] = v.im[states[i]!]!
      }
    })
  }

  const kept = new Map<number, number>()

  if (start) {
    sweep(start.psi, (t, v) => {
      if (A.has(t)) {
        let w = 0

        for (const u of states) {
          w += v.re[u]! ** 2 + v.im[u]! ** 2
        }

        kept.set(t, w)
      }
    })
  }

  const sigma = taus.map(t => {
    const m = A.get(t)!
    const gre = new Float64Array(N * N)
    const gim = new Float64Array(N * N)

    // G = A^dag A, A's column j at [j * N ..]
    for (let a = 0; a < N; a++) {
      for (let b = a; b < N; b++) {
        let sr = 0
        let si = 0

        for (let i = 0; i < N; i++) {
          const xr = m.re[a * N + i]!
          const xi = -m.im[a * N + i]!
          const yr = m.re[b * N + i]!
          const yi = m.im[b * N + i]!

          sr += xr * yr - xi * yi
          si += xr * yi + xi * yr
        }

        gre[a * N + b] = sr
        gim[a * N + b] = si
        gre[b * N + a] = sr
        gim[b * N + a] = -si
      }
    }

    const h = hermitianEigenRows(N, gre, gim)

    return { tau: t, top: h.values[N - 1]!, kept: kept.get(t) ?? Number.NaN }
  })

  log(`  dark ${variant} n ${n} W ${win.W}: ${N} states, invariant ${k}`)

  return {
    label: `${variant} n ${n} W ${win.W}`,
    W: win.W,
    states: N,
    dim: k,
    rounds: inv.rounds,
    leak: inv.leak,
    drift: inv.drift,
    unitarity,
    phases: eg.phases,
    period,
    b1Weight,
    dropped: start?.dropped ?? 0,
    sigma,
    endWeight,
  }
}

// ---- the run ----

// E4 'absolute' is E-SLF-0188's registered gate (gate 870c2c32aab3): every residual and orthonormality at most 1e-9.
// E4 'scaled' is E-SLF-0193's (gate d99189b03149): every block's residual at most c eps n_b N_b and
// its orthonormality at most c eps n_b, c = 1e4; the absolute reading is printed beside it, not gated. Nothing else
// differs between the two.
export type E4Mode = 'absolute' | 'scaled'

export function selfSpectrumRun(e4: E4Mode): ReturnType<typeof verdict> {
    const started = Date.now()
    const setting = process.env.SPECTRUM_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- C1 ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: 12, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.max(Math.abs(level.unwrapped - RECORDED.energy), Math.abs(level.spinHalf - RECORDED.share))
    const gC1 = levelOff <= 1e-9

    log('level')

    // ---- Q1 ----
    const lines = quotientLines(setting)
    const gQ1 = lines.ok

    log('lines')

    // ---- E1 ----
    const e1: { what: string; worst: number }[] = []

    for (const n of [1, 2, 3]) {
      const s = sector(8, n, 'bare')
      const U = beatMatrix(s)
      const psi =
        n === 3
          ? levelStart(s, placed, undefined, undefined).psi
          : (() => {
              const v = { re: new Float64Array(s.size), im: new Float64Array(s.size) }

              v.re[indexOf(s, n === 1 ? [3] : [3, 6])] = 1

              return v
            })()

      e1.push({ what: `pointBeat bare n ${n}`, worst: againstPointBeat(s, U, psi, { cost: false, sign: false }) })
    }

    {
      const s = sector(8, 3, 'pieces')
      const U = beatMatrix(s)

      e1.push({
        what: 'pointBeat pieces n 3',
        worst: againstPointBeat(s, U, levelStart(s, placed, undefined, undefined).psi, { cost: true, sign: true }),
      })
    }

    {
      const s = sector(setting.name === 'full' ? 16 : 8, 3, 'pieces')
      const U = beatMatrix(s)

      e1.push({ what: `cold-line closed L ${s.L}`, worst: againstColdLine(s, U, levelStart(s, placed, undefined, undefined).psi, true) })
    }

    {
      const s = sector(setting.Lo, 3, 'pieces')
      const U = beatMatrix(s)

      e1.push({
        what: `cold-line open Lo ${s.L}`,
        // kept 7 docks off both ends, so 6 beats never reach an end
        worst: againstColdLine(s, U, levelStart(s, placed, [setting.windows[0]!.from + 1], 7).psi, false),
      })
    }

    const gE1 = e1.every(x => x.worst <= EXACT)

    log('E1')

    // ---- the spectra ----
    const wantE6 = (v: Variant, L: number): boolean => setting.e6.some(x => x.variant === v && x.L === L)
    const analyses: Analysis[] = []

    for (const L of setting.bare) {
      for (const n of [1, 2, 3]) {
        analyses.push(analyze(L, n, 'bare', false, placed, wantE6('bare', L) && n === 3, log))
        log(`bare n ${n} L ${L}`)
      }
    }

    for (const L of setting.piecesAll) {
      analyses.push(analyze(L, 3, 'pieces', false, placed, wantE6('pieces', L), log))
      log(`pieces L ${L}`)
    }

    for (const L of setting.piecesK0) {
      analyses.push(analyze(L, 3, 'pieces', true, placed, wantE6('pieces', L), log))
      log(`pieces L ${L} K 0`)
    }

    // ---- E5 ----
    const e5 = analyses
      .filter(a => a.L === 8 && a.n === 3 && a.allBlocks)
      .map(a => ({ what: a.label, off: denseAgreement(a) }))

    log('E5')

    const gE2 = analyses.every(a => a.columns <= EXACT && a.unitarity <= EXACT)
    const gE3 = analyses.every(a => a.commutator <= EXACT && a.periodic)
    const gE4Absolute = analyses.every(a => a.residual <= EIGEN && a.orthonormal <= EIGEN && a.countOk)
    const e4Ratio = Math.max(...analyses.map(a => Math.max(a.residualRatio, a.orthonormalRatio)))
    const gE4Scaled = analyses.every(a => a.countOk) && e4Ratio <= EIGEN_SCALE
    const gE4 = e4 === 'scaled' ? gE4Scaled : gE4Absolute
    const gE5 = e5.length > 0 && e5.every(x => x.off <= EIGEN)
    const e6Rows = analyses.filter(a => wantE6(a.variant, a.L) && a.n === 3)
    const gE6 = e6Rows.length === setting.e6.length && e6Rows.every(a => a.e6 <= EXPAND)

    // ---- the dark set ----
    const darks: Dark[] = []

    for (const win of setting.windows) {
      for (const n of [1, 2, 3]) {
        darks.push(darkSet(setting.Lo, n, 'bare', win, setting.taus, placed, log))
      }

      darks.push(darkSet(setting.Lo, 3, 'pieces', win, setting.taus, placed, log))
    }

    const gD = darks.every(d => d.leak <= DARK && d.drift <= DARK && d.unitarity <= DARK && d.endWeight === 0)

    log('dark')

    // ---- G-size, the fault, the predictions ----
    const at = (v: Variant, L: number, n = 3): Analysis | undefined => analyses.find(a => a.variant === v && a.L === L && a.n === n)
    const size = (v: Variant): { ok: boolean; why: string } => {
      const a = at(v, 16)
      const b = at(v, 32)

      if (!a || !b || !a.top || !b.top) {
        return { ok: false, why: 'not run' }
      }

      const dR = Math.abs(a.R - b.R)
      const dP = circ(a.top.phase, b.top.phase)
      const ok = a.classifies && b.classifies && dR <= AGREE && dP <= PHASE_AGREE && a.fault === b.fault

      return { ok, why: `R ${f4(a.R)} / ${f4(b.R)} (diff ${f4(dR)}), top phase diff ${ex(dP)}, fault ${a.fault} / ${b.fault}` }
    }
    const sizeBare = size('bare')
    const sizePieces = size('pieces')
    const p1 = setting.bare.every(L => {
      const a = at('bare', L, 1)!

      return a.flat === 0
    })
    const a32n2 = at('bare', 32, 2)
    const p2 = a32n2 ? (a32n2.classifies ? (a32n2.localizedPerBlock.every(x => x >= 1) ? 'held' : 'failed') : `not classified (phi4 ${f4(a32n2.phi4)})`) : 'not run'
    const p3 = [16, 32].every(L => (at('pieces', L)?.R ?? 0) >= BOUND) && sizePieces.ok
    const p4 = [16, 32].every(L => {
      const a = at('bare', L)

      return a !== undefined && a.R < LOOSE && a.Rbest < LOOSE
    })
    const p5 = (at('bare', 8)?.phi4 ?? 0) > CLASSIFY
    const p6 = darks.every(d => d.dim === 0) && darks.every(d => (d.sigma.find(x => x.tau === 1)?.top ?? 1) < 1 - 1e-9)

    const instrumentOk = gC1 && gQ1 && gE1 && gE2 && gE3 && gE4 && gE5 && gE6 && gD
    const status: 'pass' | 'fail' | 'open' = !instrumentOk
      ? 'fail'
      : setting.name === 'smoke'
        ? 'open'
        : sizeBare.ok && sizePieces.ok
          ? 'pass'
          : 'open'

    // ---- the record ----
    const binRow = (a: Analysis): string =>
      a.bins.map((b, i) => `${i}:${b.count}/${b.medianPr.toFixed(1)}/${b.localized}`).join(' ')
    const row = (a: Analysis): string =>
      `${a.label}: ${a.size} states, ${a.blocks} blocks, phi4 ${f4(a.phi4)}${a.classifies ? '' : ' (does not classify)'}, localized ${a.localized} (per block ${a.localizedPerBlock.join(',')}), flat phases ${a.allBlocks ? a.flat : 'n/a'}${a.starts ? `; B1 start in K 0 ${f4(a.b1Block0)}, R ${f4(a.R)}, K_inf ${f4(a.Kinf)}, R_best ${f4(a.Rbest)}, anchored R ${f4(a.Ranchor)} K_inf ${f4(a.KinfAnchor)} flat ${f4(a.flatAnchor)}, top ${a.top ? `phase ${a.top.phase.toFixed(6)} kappa4 ${f4(a.top.kappa)} PR ${a.top.pr.toFixed(1)} weight ${f4(a.top.weight)}` : 'none'}; fault: ${a.fault}` : ''}`
    const darkRow = (d: Dark): string =>
      `${d.label}: ${d.states} window states, invariant dim ${d.dim} (${d.rounds} rounds${d.dim > 0 ? `, phases ${d.phases.map(p => p.toFixed(4)).join(' ')}, period ${d.period || 'none <= 12'}` : ''}), B1 weight on it ${Number.isNaN(d.b1Weight) ? 'n/a' : ex(d.b1Weight)}; sigma1^2 ${d.sigma.map(x => `${x.tau}:${f4(x.top)}`).join(' ')}${Number.isNaN(d.sigma[0]!.kept) ? '' : `; B1 kept ${d.sigma.map(x => `${x.tau}:${f4(x.kept)}`).join(' ')}`}`

    for (const a of analyses) {
      console.error(`PR against eigenphase, ${a.label} (bin: count/median PR/localized, bin i = phase in [-pi + i pi/12, ..)): ${binRow(a)}`)
    }

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_Q1: gQ1 ? 1 : 0,
      gate_E1: gE1 ? 1 : 0,
      gate_E2: gE2 ? 1 : 0,
      gate_E3: gE3 ? 1 : 0,
      gate_E4: gE4 ? 1 : 0,
      gate_E5: gE5 ? 1 : 0,
      gate_E6: gE6 ? 1 : 0,
      gate_D: gD ? 1 : 0,
      g_size_bare: sizeBare.ok ? 1 : 0,
      g_size_pieces: sizePieces.ok ? 1 : 0,
      p1: p1 ? 1 : 0,
      p3: p3 ? 1 : 0,
      p4: p4 ? 1 : 0,
      p5: p5 ? 1 : 0,
      p6: p6 ? 1 : 0,
      levelOff,
      e1Worst: Math.max(...e1.map(x => x.worst)),
      unitarity: Math.max(...analyses.map(a => Math.max(a.columns, a.unitarity))),
      commutator: Math.max(...analyses.map(a => a.commutator)),
      residual: Math.max(...analyses.map(a => a.residual)),
      orthonormal: Math.max(...analyses.map(a => a.orthonormal)),
      e5: Math.max(...e5.map(x => x.off)),
      e6: Math.max(0, ...e6Rows.map(a => a.e6)),
      seconds: (Date.now() - started) / 1000,
    }

    for (const a of analyses) {
      const key = `${a.variant}_n${a.n}_L${a.L}`

      metrics[`${key}_localized`] = a.localized
      metrics[`${key}_phi4`] = a.phi4

      if (a.starts) {
        metrics[`${key}_R`] = a.R
        metrics[`${key}_Kinf`] = a.Kinf
        metrics[`${key}_Rbest`] = a.Rbest
      }
    }

    for (const d of darks) {
      metrics[`dark_${d.label.replace(/ /g, '_')}_dim`] = d.dim
    }

    if (e4 === 'scaled') {
      metrics.e4_ratio = e4Ratio
      metrics.e4_residual_ratio = Math.max(...analyses.map(a => a.residualRatio))
      metrics.e4_orthonormal_ratio = Math.max(...analyses.map(a => a.orthonormalRatio))
      metrics.e4_largest_block = Math.max(...analyses.map(a => a.largestBlock))
      metrics.e4_absolute_reading = gE4Absolute ? 1 : 0

      for (const a of analyses) {
        metrics[`${a.variant}_n${a.n}_L${a.L}_e4_ratio`] = Math.max(a.residualRatio, a.orthonormalRatio)
      }
    }

    const e4Text =
      e4 === 'scaled'
        ? `E4 ${gE4} (scaled: worst ratio ${e4Ratio.toFixed(1)} against c ${EIGEN_SCALE}, residual ratio ${metrics.e4_residual_ratio!.toFixed(1)}, orthonormal ratio ${metrics.e4_orthonormal_ratio!.toFixed(1)}, largest block ${metrics.e4_largest_block}; per analysis ${analyses.map(a => `${a.label} ${Math.max(a.residualRatio, a.orthonormalRatio).toFixed(1)}`).join(', ')}; the absolute reading, not gated: residual ${ex(metrics.residual!)}, orthonormal ${ex(metrics.orthonormal!)}, against 1e-9 ${gE4Absolute})`
        : `E4 ${gE4} (residual ${ex(metrics.residual!)}, orthonormal ${ex(metrics.orthonormal!)})`

    return verdict({
      status,
      claim: `${setting.name} setting. Quotient lines: orders ${Object.entries(lines.orders).map(([m, ps]) => `(sqrt 2)^${m} ${[...new Set(ps)].join('/')}`).join(', ')}${setting.quotient ? `; (sqrt 2)^6 enumerated (${lines.docks} docks), walked ${[...new Set(lines.walked)].join('/')} in 12 directions, returns ${lines.returns}` : ''}. SPECTRA: ${analyses.map(row).join(' || ')}. G-size bare ${sizeBare.ok} (${sizeBare.why}); pieces ${sizePieces.ok} (${sizePieces.why}). DARK SET (open ring of ${setting.Lo}): ${darks.map(darkRow).join(' || ')}. Predictions: P1 ${p1}, P2 ${p2}, P3 ${p3}, P4 ${p4}, P5 ${p5}, P6 ${p6}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; no evidence, open by rule)' : ''}. Gates C1 ${gC1} (${ex(levelOff)}), Q1 ${gQ1}, E1 ${gE1} (${e1.map(x => `${x.what} ${ex(x.worst)}`).join(', ')}), E2 ${gE2} (${ex(metrics.unitarity!)}), E3 ${gE3} (${ex(metrics.commutator!)}), ${e4Text}, E5 ${gE5} (${e5.map(x => `${x.what} ${ex(x.off)}`).join(', ')}), E6 ${gE6} (${ex(metrics.e6!)}), D-exact ${gD} (leak ${ex(Math.max(...darks.map(d => d.leak)))}, drift ${ex(Math.max(...darks.map(d => d.drift)))}, end weight ${ex(Math.max(...darks.map(d => d.endWeight)))}). The bare rule carries B1's level amplitudes onto sets with no sign (pointBeatWith sign false). Pieces at L 32: the K 0 block only (B1's start lies in it), so its anchored and flat readings are not computed. The dark set's restricted step is read to tau ${Math.max(...setting.taus)} (the open ring keeps both windows off its ends only to tau 10, not the registered 12). The level is the stand-in's (coined-line-bloch box 12); the quotient lines are periodic grade; the open line honeycomb-exact by the line law.`,
    })
}

// ---- the experiment ----

export default experiment({
  id: 'selves/self-spectrum',
  code: 'E-SLF-0188',
  title:
    "the self's spectrum (report 'Self persistence in reversible dynamics', experiments 1 and 2): the localized eigenvectors of B1's line sector (bare and with E-SPN-0103's pieces; 1, 2 and 3 loves) on the lines of the (sqrt 2)^6, ^8 and ^10 congruence quotients, B1's cluster's weight on them (retention_inf) and whether the cluster or the rule is at fault, and the dark set of the cluster's window on the open line",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return selfSpectrumRun('absolute')
  },
})
