// THE REMAINDER TEST OF A SELF (item vibe-roadmap-grounding-0053, refiled from 0046 by decision 015, E-SLF-0199). A second definition of a self, beside
// the closure reader (code/measure/self-reader.ts, self-reference.ts): a region is a self when its surroundings cannot
// rebuild its next state. The idea is @OhWellMike's Rem(lambda) = U_lambda - U_field and his signs N1 to N3, Z1 to Z3;
// every definition below is ours, made exact on B1's line engine (code/measure/cone-line.ts).
//
// THE OBJECTS. A start psi_0 of n loves on one mesh line, run by the case's rule V (B1's line rule U, or U with an
// opt-in twist or register of E-SLF-0194). The REGION A is the start's support (whole docks). P keeps the
// configurations with every love on a dock of A. THE FIELD is everything else: the configurations with a love off A,
// and a register beside the line when the case has one (as the reference closure treats it). The field at beat s is
// known exactly: (1 - P) psi_s, every amplitude. THE MEDIUM'S RULE is U, the reference rule: the field never carries a
// candidate's opt-in piece.
//
// THE FIELD-ONLY SIMULATOR with context from beat s0: it starts with the region empty (x_s0 = 0, the region's
// self-free part), and each beat runs the medium's rule on its own region guess plus the true field and keeps the
// region part: x_(s+1) = P U (x_s + (1 - P) psi_s). It is a causal transducer: the region rebuilt from what the field
// sends in. Its error e_s = P psi_s - x_s obeys
//
//   e_s0 = P psi_s0,   e_(s+1) = d_s + P U P e_s,   d_s = P psi_(s+1) - P U psi_s = P (V - U) psi_s
//
// and P U psi = P U Q psi exactly, Q keeping every love within one dock of A (the stream moves a love one dock, every
// other piece is dock local or reads the shape), so every simulator quantity lives on A or A plus one dock. With
// V = U, d = 0 and e_t = (P U P)^(t - s0) P psi_s0: the weight that never left the region.
//
// THE SERIES (each exact, one pure start, no ensemble, no random number):
//   G(t)   = ||e_t||^2 with context from beat 0 (the whole field history): the blind remainder, which reads
//            retention for anything that merely stays (trap T-0046a, decision 015)
//   S(t)   = the same with the simulator also given the region's start: the surplus beyond retention
//   rem_k  = ||e_R||^2 with context from beat R - k, at the read beat R: the remainder against context
//   E(t)   = <N_A>(t) / n, the members' share in A, under zero input (the calm vacuum) and under uniform noise (below)
//   D(t)   = ||P (psi'_t - psi_t)||^2 / ||psi'_0 - psi_0||^2, psi' the start after one extra half coin on every dock
//            (an input pulse at beat 0 after which the field is the calm vacuum again): the share of the pulse's
//            imprint the region still holds
//   GV(t)  the remainder of a simulator that runs the case's own rule V (reported: the state part of G)
//
// UNIFORM NOISE is a Weyl field, never a draw: before each beat t every love on a dock x off A takes the phase
// e^(2 pi i v), v = weylCell(x - lo, t, 0) (code/tool/weyl.ts, frac of fixed irrational multiples), so the field
// scrambles the phase of everything it holds, equidistributed over the circle. It is diagonal, so exactly unitary, and
// it never touches a configuration with every love in A.
//
// THE NULL: the same members as free loves (the closure reader's null), whose many-love evolution is the n-th exterior
// power of the one-love walk, so each null series is a one-love computation (freeSeries).

import {
  ConeCap,
  addAmp,
  clearStore,
  coneBeat,
  coneNorm,
  coneStore,
  copyStore,
  eachConfiguration,
  halfPass,
  registerPass,
  shapePass,
  type ConeStore,
} from '@/code/measure/cone-line'
import {
  freeBeat,
  freeNull,
  readSelf,
  regionGram,
  startTensor,
  tensorExpect,
  type Config,
} from '@/code/measure/self-reader'
import { HALF_COIN } from '@/code/measure/cold-line'
import { OMEGA, steerOf, twistOf, writeOf, type RegisterRule } from '@/code/measure/keel-flame'
import { weylCell } from '@/code/tool/weyl'

// ---- the region basis: every configuration of n loves on docks lo..hi, ranked by the combinatorial number system ----

export type Region = {
  n: number
  lo: number
  hi: number
  // the region's modes 2 lo .. 2 hi + 1
  base: number
  modes: number
  size: number
  binom: number[][]
  // the ascending modes of each rank, n a rank
  table: Int32Array
}

export function regionOf(n: number, lo: number, hi: number): Region {
  const modes = 2 * (hi - lo + 1)
  const binom: number[][] = Array.from({ length: modes + 1 }, () => new Array<number>(n + 2).fill(0))

  for (let a = 0; a <= modes; a++) {
    binom[a]![0] = 1

    for (let b = 1; b <= Math.min(a, n + 1); b++) {
      binom[a]![b] = binom[a - 1]![b - 1]! + (b <= a - 1 ? binom[a - 1]![b]! : 0)
    }
  }

  const size = binom[modes]![n]!
  const R: Region = { n, lo, hi, base: 2 * lo, modes, size, binom, table: new Int32Array(size * n) }
  const pick = new Int32Array(n)

  const visit = (at: number, from: number): void => {
    if (at === n) {
      const r = rankOf(R, pick)

      for (let a = 0; a < n; a++) {
        R.table[r * n + a] = pick[a]!
      }

      return
    }

    for (let q = from; q < R.base + modes; q++) {
      pick[at] = q
      visit(at + 1, q + 1)
    }
  }

  visit(0, R.base)

  return R
}

export function inRegion(R: Region, modes: ArrayLike<number>): boolean {
  return modes[0]! >> 1 >= R.lo && modes[R.n - 1]! >> 1 <= R.hi
}

// the rank of ascending modes, all in the region
export function rankOf(R: Region, modes: ArrayLike<number>): number {
  let r = 0

  for (let a = 0; a < R.n; a++) {
    r += R.binom[modes[a]! - R.base]![a + 1]!
  }

  return r
}

// a region vector: interleaved re, im by rank
export type Vec = Float64Array

export const zeroVec = (R: Region): Vec => new Float64Array(2 * R.size)

export function weightOf(v: Vec): number {
  let w = 0

  for (let i = 0; i < v.length; i++) {
    w += v[i]! * v[i]!
  }

  return w
}

// <a|b>
export function innerOf(a: Vec, b: Vec): [number, number] {
  let sr = 0
  let si = 0

  for (let i = 0; i < a.length; i += 2) {
    sr += a[i]! * b[i]! + a[i + 1]! * b[i + 1]!
    si += a[i]! * b[i + 1]! - a[i + 1]! * b[i]!
  }

  return [sr, si]
}

// a + k b
export function plus(a: Vec, b: Vec, k: number): Vec {
  const out = new Float64Array(a.length)

  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]! + k * b[i]!
  }

  return out
}

export function maxAbsOf(v: Vec): number {
  let m = 0

  for (let i = 0; i < v.length; i++) {
    m = Math.max(m, Math.abs(v[i]!))
  }

  return m
}

// the configurations of a region vector with nonzero amplitude
export function configsOfVec(R: Region, v: Vec): Config[] {
  const out: Config[] = []

  for (let r = 0; r < R.size; r++) {
    const re = v[2 * r]!
    const im = v[2 * r + 1]!

    if (re !== 0 || im !== 0) {
      out.push({ modes: Array.from(R.table.subarray(r * R.n, (r + 1) * R.n)), re, im })
    }
  }

  return out
}

// ---- reading a whole store ----

export type Read = {
  // P s on the region, and the part with every love within one dock of it on the margin region
  P: Vec
  Q: Vec
  // sum of weight x loves on the region's docks
  members: number
}

export function readStore(s: ConeStore, R: Region, M: Region): Read {
  const P = zeroVec(R)
  const Q = zeroVec(M)

  let members = 0

  eachConfiguration(s, (modes, re, im) => {
    if (re === 0 && im === 0) {
      return
    }

    let k = 0

    for (let a = 0; a < modes.length; a++) {
      const x = modes[a]! >> 1

      if (x >= R.lo && x <= R.hi) {
        k++
      }
    }

    members += k * (re * re + im * im)

    if (inRegion(M, modes)) {
      const q = rankOf(M, modes)

      Q[2 * q] = re
      Q[2 * q + 1] = im

      if (k === R.n) {
        const p = rankOf(R, modes)

        P[2 * p] = re
        P[2 * p + 1] = im
      }
    }
  })

  return { P, Q, members }
}

// the members' sum alone (the noise run reads nothing else)
export function membersOf(s: ConeStore, lo: number, hi: number): number {
  let members = 0

  eachConfiguration(s, (modes, re, im) => {
    const w = re * re + im * im

    if (w === 0) {
      return
    }

    let k = 0

    for (let a = 0; a < modes.length; a++) {
      const x = modes[a]! >> 1

      if (x >= lo && x <= hi) {
        k++
      }
    }

    members += k * w
  })

  return members
}

// ---- the rules ----

export type Rule =
  | { kind: 'bare' }
  | { kind: 'twist'; table: readonly number[] }
  | { kind: 'register'; rule: RegisterRule }

export const registers = (rule: Rule): number => (rule.kind === 'register' ? 3 : 1)

export type Phase = (pos: Int32Array) => readonly [number, number] | null

// the Weyl noise of beat t: every love off docks lo..hi takes e^(2 pi i weylCell(x - lo, t, 0))
export function noiseOf(lo: number, hi: number, t: number): Phase {
  return (pos: Int32Array) => {
    let turn = 0
    let any = false

    for (let a = 0; a < pos.length; a++) {
      const x = pos[a]!

      if (x < lo || x > hi) {
        turn += weylCell(x - lo, t, 0)
        any = true
      }
    }

    if (!any) {
      return null
    }

    const angle = 2 * Math.PI * (turn - Math.floor(turn))

    return [Math.cos(angle), Math.sin(angle)]
  }
}

// one beat of rule V (with the noise first, when given) from `cur` (used up); returns [next, spare]
export function worldBeat(cur: ConeStore[], spare: ConeStore[], rule: Rule, noise: Phase | null): [ConeStore[], ConeStore[]] {
  if (noise) {
    for (const s of cur) {
      shapePass(s, noise)
    }
  }

  if (rule.kind === 'register') {
    registerPass(cur, spare, writeOf(rule.rule), steerOf(rule.rule), OMEGA)

    for (let h = 0; h < cur.length; h++) {
      coneBeat(spare[h]!, cur[h]!, true)
    }

    return [cur, spare]
  }

  if (rule.kind === 'twist' && !rule.table.every(j => j % 3 === 0)) {
    shapePass(cur[0]!, twistOf(rule.table))
  }

  coneBeat(cur[0]!, spare[0]!, true)

  return [spare, cur]
}

// ---- region steps through scratch stores ----

export type Scratch = { a: ConeStore[]; b: ConeStore[] }

export function scratchOf(n: number, line: number, clock: number, d: number): Scratch {
  const make = (): ConeStore => coneStore(n, line, 1e9, clock)

  return { a: Array.from({ length: d }, make), b: Array.from({ length: d }, make) }
}

function load(s: ConeStore, R: Region, v: Vec): void {
  clearStore(s)

  const modes = new Int32Array(R.n)

  for (let r = 0; r < R.size; r++) {
    const re = v[2 * r]!
    const im = v[2 * r + 1]!

    if (re === 0 && im === 0) {
      continue
    }

    for (let a = 0; a < R.n; a++) {
      modes[a] = R.table[r * R.n + a]!
    }

    addAmp(s, modes, re, im)
  }
}

// P W v: the region vectors vs (one a register value, on region `from`) loaded, one beat of W (the case's rule, or U
// with rule bare), the part on region R read back
export function stepRegion(vs: readonly Vec[], from: Region, R: Region, rule: Rule, sc: Scratch): Vec[] {
  const d = vs.length

  for (let h = 0; h < d; h++) {
    load(sc.a[h]!, from, vs[h]!)
  }

  const [next] = rule.kind === 'bare' && d > 1 ? bareEach(sc) : worldBeat(sc.a.slice(0, d), sc.b.slice(0, d), rule, null)

  return next.map(s => readStore(s, R, R).P)
}

// the medium's rule U on every register value separately (the field's register is left alone)
function bareEach(sc: Scratch): [ConeStore[], ConeStore[]] {
  for (let h = 0; h < sc.a.length; h++) {
    coneBeat(sc.a[h]!, sc.b[h]!, true)
  }

  return [sc.b, sc.a]
}

// ---- one case ----

export type CaseReading = {
  name: string
  n: number
  T: number
  reach: number
  // weight with every love in A, summed over register values
  r: number[]
  // the reference closure against `ref` (or against the case itself)
  cRef: number[]
  G: number[]
  // the surplus beyond retention: the error of a simulator that also knows the region's start (e'_0 = 0)
  S: number[]
  GV: number[]
  E: number[]
  En: number[]
  D: number[]
  // ||d_t||^2, the rule's own surplus each beat
  surplus: number[]
  // |<e_t|P phi_t>|^2 / (G ||P phi_t||^2)
  sigma: number[]
  // the remainder against context at the read beat R = reach: [k, rem_k]
  context: [number, number][]
  // the largest amplitude of any d_t, and of the direct simulator against P psi - e (I3)
  dMax: number
  simOff: number
  normDrift: number
  deltaWeight: number
  delta: Config[]
  // the region parts at h = 0, every beat, when kept (a reference for other cases)
  parts?: Vec[]
}

export function caseRun(input: {
  name: string
  rule: Rule
  start: ConeStore
  region: Region
  margin: Region
  T: number
  contextKs: readonly number[]
  ref?: readonly Vec[]
  keepParts?: boolean
  checkBeats?: number
  log?: (what: string) => void
}): CaseReading {
  const { name, rule, start, region: R, margin: M, T } = input
  const n = start.n
  const d = registers(rule)
  const empty = (): ConeStore => coneStore(n, start.line, start.cap, start.clock)
  const sc = scratchOf(n, start.line, start.clock, d)
  const bare: Rule = { kind: 'bare' }
  const checkBeats = input.checkBeats ?? 0
  const out: CaseReading = {
    name,
    n,
    T,
    reach: 0,
    r: [],
    cRef: [],
    G: [],
    S: [],
    GV: [],
    E: [],
    En: [],
    D: [],
    surplus: [],
    sigma: [],
    context: [],
    dMax: 0,
    simOff: 0,
    normDrift: 0,
    deltaWeight: 0,
    delta: [],
  }
  const fresh = (): ConeStore[] => [copyStore(start), ...Array.from({ length: d - 1 }, empty)]
  const norm = (ss: readonly ConeStore[]): number => Math.abs(ss.reduce((t, s) => t + coneNorm(s), 0) - 1)

  // ---- the calm run, the simulator beside it ----
  let cur = fresh()
  let spare = Array.from({ length: d }, empty)
  const P: Vec[][] = []
  const dd: Vec[][] = []
  let puq: Vec[] = []
  let e: Vec[] = []
  let eS: Vec[] = Array.from({ length: d }, () => zeroVec(R))
  let eV: Vec[] = []
  // the direct simulator (I3): x_t on the region, and full scratch stores
  let x: Vec[] = Array.from({ length: d }, () => zeroVec(R))
  const ys = checkBeats > 0 ? { a: Array.from({ length: d }, empty), b: Array.from({ length: d }, empty) } : null

  for (let t = 0; t <= T; t++) {
    const reads = cur.map(s => readStore(s, R, M))
    const Pt = reads.map(q => q.P)

    P.push(Pt)

    if (t === 0) {
      e = Pt.map(v => Float64Array.from(v))
      eV = Pt.map(v => Float64Array.from(v))
    } else {
      const dt = Pt.map((v, h) => plus(v, puq[h]!, -1))

      dd.push(dt)
      out.dMax = Math.max(out.dMax, ...dt.map(maxAbsOf))
      out.surplus.push(dt.reduce((s, v) => s + weightOf(v), 0))

      const pe = stepRegion(e, R, R, bare, sc)

      e = dt.map((v, h) => plus(v, pe[h]!, 1))

      const ps = stepRegion(eS, R, R, bare, sc)

      eS = dt.map((v, h) => plus(v, ps[h]!, 1))
      eV = stepRegion(eV, R, R, rule, sc)

      if (ys && t <= checkBeats) {
        out.simOff = Math.max(out.simOff, ...x.map((v, h) => maxAbsOf(plus(plus(Pt[h]!, e[h]!, -1), v, -1))))
      }
    }

    const G = e.reduce((s, v) => s + weightOf(v), 0)
    const refT = input.ref ? input.ref[t]! : Pt[0]!
    const refW = weightOf(refT)

    out.G.push(G)
    out.S.push(eS.reduce((s, v) => s + weightOf(v), 0))
    out.GV.push(eV.reduce((s, v) => s + weightOf(v), 0))
    out.r.push(Pt.reduce((s, v) => s + weightOf(v), 0))
    out.cRef.push(Pt.reduce((s, v) => {
      const [a, b] = innerOf(refT, v)

      return s + a * a + b * b
    }, 0))
    out.sigma.push(
      G > 0 && refW > 0
        ? e.reduce((s, v) => {
            const [a, b] = innerOf(refT, v)

            return s + a * a + b * b
          }, 0) / (G * refW)
        : 0,
    )
    out.E.push(reads.reduce((s, q) => s + q.members, 0) / n)
    out.normDrift = Math.max(out.normDrift, norm(cur))

    if (t === T) {
      break
    }

    puq = stepRegion(reads.map(q => q.Q), M, R, bare, sc)

    // the direct simulator: y = (psi_t - P psi_t) + x_t, one beat of U, the region part
    if (ys && t < checkBeats) {
      for (let h = 0; h < d; h++) {
        const y = ys.a[h]!

        clearStore(y)
        eachConfiguration(cur[h]!, (modes, re, im) => {
          if ((re !== 0 || im !== 0) && !inRegion(R, modes)) {
            addAmp(y, modes, re, im)
          }
        })

        for (const c of configsOfVec(R, x[h]!)) {
          addAmp(y, Int32Array.from(c.modes), c.re, c.im)
        }

        coneBeat(y, ys.b[h]!, true)
      }

      x = ys.b.map(s => readStore(s, R, R).P)
    }

    try {
      ;[cur, spare] = worldBeat(cur, spare, rule, null)
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    out.reach = t + 1

    if (input.log && ((t + 1) % 16 === 0 || t + 1 === T)) {
      input.log(`${name} calm beat ${t + 1}: G ${out.G[t]!.toFixed(4)} r ${out.r[t]!.toFixed(4)} store ${cur.map(s => s.used).join('/')}`)
    }
  }

  // ---- the remainder against context at the read beat ----
  const Rt = out.reach

  for (const k of [...new Set([...input.contextKs.filter(k => k <= Rt), Rt])].sort((a, b) => a - b)) {
    let v = P[Rt - k]!.map(w => Float64Array.from(w))

    for (let s = Rt - k; s < Rt; s++) {
      const pe = stepRegion(v, R, R, bare, sc)

      v = dd[s]!.map((w, h) => plus(w, pe[h]!, 1))
    }

    out.context.push([k, v.reduce((s, w) => s + weightOf(w), 0)])
  }

  // ---- the noise run ----
  cur = fresh()
  spare = Array.from({ length: d }, empty)
  out.En.push(cur.reduce((s, q) => s + membersOf(q, R.lo, R.hi), 0) / n)

  for (let t = 1; t <= out.reach; t++) {
    ;[cur, spare] = worldBeat(cur, spare, rule, noiseOf(R.lo, R.hi, t))
    out.En.push(cur.reduce((s, q) => s + membersOf(q, R.lo, R.hi), 0) / n)
    out.normDrift = Math.max(out.normDrift, norm(cur))
  }

  // ---- the pulse: one extra half coin on every dock at beat 0, then the calm run ----
  const kicked = copyStore(start)

  halfPass(kicked)

  cur = [kicked, ...Array.from({ length: d - 1 }, empty)]
  spare = Array.from({ length: d }, empty)

  const delta0 = plus(readStore(kicked, R, R).P, P[0]![0]!, -1)

  out.deltaWeight = weightOf(delta0)
  out.delta = configsOfVec(R, delta0)

  for (let t = 0; t <= out.reach; t++) {
    if (t > 0) {
      ;[cur, spare] = worldBeat(cur, spare, rule, null)
      out.normDrift = Math.max(out.normDrift, norm(cur))
    }

    const Pk = cur.map(s => readStore(s, R, R).P)

    out.D.push(Pk.reduce((s, v, h) => s + weightOf(plus(v, P[t]![h]!, -1)), 0) / out.deltaWeight)
  }

  if (input.keepParts) {
    out.parts = P.map(v => v[0]!)
  }

  input.log?.(`${name}: reach ${out.reach}, G(R) ${out.G[out.reach]!.toFixed(4)}, E ${out.E[out.reach]!.toFixed(4)}, En ${out.En[out.reach]!.toFixed(4)}, D ${out.D[out.reach]!.toFixed(4)}, c_ref ${out.cRef[out.reach]!.toFixed(4)}`)

  return out
}

// ---- the free null ----

export type FreeSeries = {
  // the closure null's retention r0 (c0 = r0^2), never-left G0, members E0 calm and E0n under the noise, pulse D0
  r0: number[]
  G0: number[]
  E0: number[]
  E0n: number[]
  D0: number[]
  // self-checks: |Tr rho1 - n| and max over beats of |E0 on the whole line - 1|
  traceOff: number
  wholeOff: number
}

// rho1[i][j] = <psi| c_i^dag c_j |psi> over `modes`
export function oneBodyDensity(psi: readonly Config[], modes: readonly number[]): { re: Float64Array; im: Float64Array } {
  const m = modes.length
  const index = new Map(modes.map((q, i) => [q, i]))
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)
  const groups = new Map<string, [number, number, number][]>()

  for (const c of psi) {
    for (let p = 0; p < c.modes.length; p++) {
      const key = c.modes.filter((_, a) => a !== p).join(',')
      const sg = p % 2 === 0 ? 1 : -1
      const list = groups.get(key) ?? []

      list.push([index.get(c.modes[p]!)!, sg * c.re, sg * c.im])
      groups.set(key, list)
    }
  }

  for (const list of groups.values()) {
    for (const [i, br, bi] of list) {
      for (const [j, gr, gi] of list) {
        // conj(beta) gamma
        re[i * m + j] = re[i * m + j]! + br * gr + bi * gi
        im[i * m + j] = im[i * m + j]! + br * gi - bi * gr
      }
    }
  }

  return { re, im }
}

// sum_ij rho1_ij M_ij, real part
function contract(rho: { re: Float64Array; im: Float64Array }, M: { re: Float64Array; im: Float64Array }): number {
  let s = 0

  for (let k = 0; k < rho.re.length; k++) {
    s += rho.re[k]! * M.re[k]! - rho.im[k]! * M.im[k]!
  }

  return s
}

function noiseCol(v: Float64Array, line: number, lo: number, hi: number, t: number): Float64Array {
  const out = Float64Array.from(v)

  for (let x = 0; x < line; x++) {
    if (x >= lo && x <= hi) {
      continue
    }

    const a = 2 * Math.PI * weylCell(x - lo, t, 0)
    const c = Math.cos(a)
    const s = Math.sin(a)

    for (const q of [2 * x, 2 * x + 1]) {
      const r = out[2 * q]!
      const i = out[2 * q + 1]!

      out[2 * q] = c * r - s * i
      out[2 * q + 1] = c * i + s * r
    }
  }

  return out
}

export function freeSeries(input: {
  psi: readonly Config[]
  delta: readonly Config[]
  deltaWeight: number
  line: number
  lo: number
  hi: number
  beats: number
}): FreeSeries {
  const { psi, delta, line, lo, hi, beats } = input
  const n = psi[0]!.modes.length
  const T = startTensor(psi)
  const m = T.modes.length
  const unit = (q: number): Float64Array => {
    const v = new Float64Array(4 * line)

    v[2 * q] = 1

    return v
  }
  const rho = oneBodyDensity(psi, T.modes)
  let traceOff = 0

  for (let i = 0; i < m; i++) {
    traceOff += rho.re[i * m + i]!
  }

  traceOff = Math.abs(traceOff - n)

  let stay = T.modes.map(unit)
  let calm = T.modes.map(unit)
  let noisy = T.modes.map(unit)
  const G0: number[] = []
  const E0: number[] = []
  const E0n: number[] = []
  let wholeOff = 0

  for (let t = 0; t <= beats; t++) {
    if (t > 0) {
      stay = stay.map(v => {
        const w = freeBeat(v, line, true, HALF_COIN)

        for (let q = 0; q < 2 * line; q++) {
          if (q >> 1 < lo || q >> 1 > hi) {
            w[2 * q] = 0
            w[2 * q + 1] = 0
          }
        }

        return w
      })
      calm = calm.map(v => freeBeat(v, line, true, HALF_COIN))
      noisy = noisy.map(v => freeBeat(noiseCol(v, line, lo, hi, t), line, true, HALF_COIN))
    }

    G0.push(tensorExpect(T, m, regionGram(stay, lo, hi)))
    E0.push(contract(rho, regionGram(calm, lo, hi)) / n)
    E0n.push(contract(rho, regionGram(noisy, lo, hi)) / n)
    wholeOff = Math.max(wholeOff, Math.abs(contract(rho, regionGram(calm, 0, line - 1)) / n - 1))
  }

  const r0 = freeNull({ psi, line, lo, hi, beats }).r0
  const D0 = freeNull({ psi: delta, line, lo, hi, beats }).r0.map(x => x / input.deltaWeight)

  return { r0, G0, E0, E0n, D0, traceOff, wholeOff }
}

// ---- the six signs ----

export type Sign = boolean | undefined

// rho and rho0 are 0046's ratios, kept as readings; s is the surplus fraction S / r at every beat (refiled gate)
export type Signs = { N1: Sign; Z1: Sign; N2: Sign; Z2: Sign; N3: Sign; Z3: Sign; rho: number; rho0: number; s: number[] }

// THE FLOOR of "falls to zero" and "drifts to rest"
export const REST = 1 / 16

const ratio = (a: number, b: number): number => (b > 0 ? a / b : 0)

// THE SURPLUS BEYOND RETENTION (item vibe-roadmap-grounding-0053's gate, decision 015). G's simulator starts blind,
// so anything that merely stays in A is unrebuilt and G reads retention. S's simulator also knows the region's start
// (e'_0 = 0, e'_(s+1) = d_s + P U P e'_s): it runs the medium's rule on the region's own past plus the whole field
// record, so a member that stays costs it nothing and S is the part of the region neither explains. s = S / r.
// The free null's s is 0 at every beat by construction (free loves run the null's own medium rule).
//   N1: s(t) >= 1/2 at every beat t from ceil(T / 2) to T (the gap levels off above half the region's weight)
//   Z1: s(T) <= 1/16 (with the whole field record and the region's past the leftover falls to the floor)
export function remainderSigns(c: CaseReading, f: FreeSeries): Signs {
  const R = c.reach
  const rho = ratio(c.G[R]!, c.r[R]!)
  const rho0 = ratio(f.G0[R]!, f.r0[R]!)
  const zero = readSelf(c.n, c.E, f.E0).self
  const noise = readSelf(c.n, c.En, f.E0n).self
  const s = c.S.map((x, t) => ratio(x, c.r[t]!))

  return {
    N1: c.n === 0 ? false : s.slice(Math.ceil(R / 2)).every(x => x >= 0.5),
    Z1: s[R]! <= REST,
    N2: zero === undefined || noise === undefined ? undefined : zero && noise,
    Z2: Math.min(...c.E) <= REST || Math.min(...c.En) <= REST,
    N3: readSelf(c.n, c.D, f.D0).self,
    Z3: Math.min(...c.G) <= REST,
    rho,
    rho0,
    s,
  }
}

export type RemWord = 'REM SELF' | 'NO REM' | 'MIXED' | 'UNDECIDED'

export function remWord(s: Signs): RemWord {
  const all = [s.N1, s.Z1, s.N2, s.Z2, s.N3, s.Z3]

  if (all.some(x => x === undefined)) {
    return 'UNDECIDED'
  }

  if (s.N1 && s.N2 && s.N3 && !s.Z1 && !s.Z2 && !s.Z3) {
    return 'REM SELF'
  }

  if (!s.N1 && !s.N2 && !s.N3 && s.Z1 && s.Z2 && s.Z3) {
    return 'NO REM'
  }

  return 'MIXED'
}
