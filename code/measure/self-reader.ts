// THE SELF READER (item vibe-roadmap-grounding-0004, note/self-reader.md). A region A of whole docks is read against its
// complement E by its CLOSURE: write the state at beat t as psi_t = sum_e a_e (x) |e> over complement states e, and
// a_eps = sum_e conj(eps_t(e)) a_e with eps_t the complement's self-free run (the vacuum when there is no named
// environment). Then
//
//   c_A(t) = sum_e |<a_eps | a_e>|^2
//
// is the fidelity with which the region's present alone implies its past when the reversible rule runs back. In a calm
// complement with a conserved member count it is r_A(t)^2, r_A the weight with every member inside A (the note's
// theorem); the experiment checks the general formula against that on the exact ball.
//
// THE NULL is the same start and region with every member a free love: the working rule's one-love walk (the split coin
// D D, then the stream; no drift cost, no meeting phase), fermions, so the start runs as the n-th exterior power of the
// one-love map u_t and r0(t) = <psi_0| Lambda^n(u_t^dag P_A u_t) |psi_0>.
//
// Parts are keyed by strings: a complement key, then a region key. The ball parts carry no fermion sign (the bare rule
// has none); the line parts split ascending modes into the region's contiguous docks and the rest, whose sign
// (-1)^(inside * left) is applied, though only parts with an empty outside meet in a_eps.

import { HALF_COIN, type Coin, type LineReader } from '@/code/measure/cold-line'
import {
  coneBeat,
  coneBoundCount,
  coneStore,
  eachConfiguration,
  halfPass,
  phasePass,
  streamInto,
  addAmp,
  type ConeStore,
} from '@/code/measure/cone-line'
import type { DockEnv } from '@/code/measure/cross-line-dock'
import {
  BOUNCE_TABLE,
  bouncePermutation,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import { localMode, reorderParity } from '@/code/rule/cross-line-pieces'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

export type Cx = [number, number]

// complement key -> region key -> amplitude
export type Parts = Map<string, Map<string, Cx>>

export type Closure = {
  // the closure c_A and the weight of a_eps (r_A^2 = c in a calm complement)
  c: number
  r: number
}

function addTo(m: Map<string, Cx>, key: string, re: number, im: number): void {
  const at = m.get(key)

  if (at) {
    at[0] += re
    at[1] += im
  } else {
    m.set(key, [re, im])
  }
}

// THE CLOSURE of a state given by its parts, against the self-free complement `eps` (complement key -> amplitude;
// undefined: the vacuum, key '')
export function closureOf(parts: Parts, eps?: ReadonlyMap<string, Cx>): Closure {
  const e: ReadonlyMap<string, Cx> = eps ?? new Map([['', [1, 0] as Cx]])
  const aEps = new Map<string, Cx>()

  for (const [k, [er, ei]] of e) {
    const a = parts.get(k)

    if (!a) {
      continue
    }

    for (const [rk, [ar, ai]] of a) {
      // conj(eps_k) a
      addTo(aEps, rk, er * ar + ei * ai, er * ai - ei * ar)
    }
  }

  let r = 0

  for (const [x, y] of aEps.values()) {
    r += x * x + y * y
  }

  let c = 0

  for (const a of parts.values()) {
    let pr = 0
    let pi = 0

    for (const [rk, [ar, ai]] of a) {
      const b = aEps.get(rk)

      if (!b) {
        continue
      }

      // conj(b) a
      pr += b[0] * ar + b[1] * ai
      pi += b[0] * ai - b[1] * ar
    }

    c += pr * pr + pi * pi
  }

  return { c, r }
}

// ---- ball parts ----

export type BallTerm = {
  slots: Int32Array
  values: Int8Array
  re: number
  im: number
}

// the parts of ball terms (no fermion sign): the complement key is the occupied slots outside the region with their
// values, the region key those inside
export function ballParts(terms: Iterable<BallTerm>, inRegion: (slot: number) => boolean): Parts {
  const parts: Parts = new Map()

  for (const t of terms) {
    if (t.re === 0 && t.im === 0) {
      continue
    }

    const inside: string[] = []
    const outside: string[] = []

    t.slots.forEach((s, i) => {
      const v = `${s}${t.values[i]! > 0 ? '+' : '-'}`

      if (inRegion(s)) {
        inside.push(v)
      } else {
        outside.push(v)
      }
    })

    const ek = outside.join(',')
    let m = parts.get(ek)

    if (!m) {
      m = new Map()
      parts.set(ek, m)
    }

    addTo(m, inside.join(','), t.re, t.im)
  }

  return parts
}

// the weight of ball terms with every occupied slot inside the region
export function ballRetention(terms: Iterable<BallTerm>, inRegion: (slot: number) => boolean): number {
  let w = 0

  for (const t of terms) {
    if (Array.from(t.slots).every(inRegion)) {
      w += t.re * t.re + t.im * t.im
    }
  }

  return w
}

// ---- line parts ----

// the docks [lo, hi] any configuration of `s` with nonzero amplitude occupies
export function supportOf(s: ConeStore): [number, number] {
  let lo = Infinity
  let hi = -Infinity

  eachConfiguration(s, (modes, re, im) => {
    if (re === 0 && im === 0) {
      return
    }

    lo = Math.min(lo, modes[0]! >> 1)
    hi = Math.max(hi, modes[modes.length - 1]! >> 1)
  })

  return [lo, hi]
}

// r_A: the weight of the configurations with every love on docks lo..hi
export function regionRetention(s: ConeStore, lo: number, hi: number): number {
  let w = 0

  eachConfiguration(s, (modes, re, im) => {
    if (modes[0]! >> 1 >= lo && modes[modes.length - 1]! >> 1 <= hi) {
      w += re * re + im * im
    }
  })

  return w
}

// the parts of line stores keyed by the env outcome: complement key `env|outside modes`, region key the modes on docks
// lo..hi, with the sign of moving the region's modes in front of the left outside ones
export function lineParts(stores: ReadonlyMap<string, ConeStore>, lo: number, hi: number): Parts {
  const parts: Parts = new Map()

  for (const [envKey, s] of stores) {
    eachConfiguration(s, (modes, re, im) => {
      if (re === 0 && im === 0) {
        return
      }

      const inside: number[] = []
      const outside: number[] = []

      let left = 0

      for (const md of modes) {
        const x = md >> 1

        if (x >= lo && x <= hi) {
          inside.push(md)
        } else {
          outside.push(md)

          if (x < lo) {
            left++
          }
        }
      }

      const sg = (inside.length * left) % 2 === 1 ? -1 : 1
      const ek = `${envKey}|${outside.join(',')}`
      let m = parts.get(ek)

      if (!m) {
        m = new Map()
        parts.set(ek, m)
      }

      addTo(m, inside.join(','), sg * re, sg * im)
    })
  }

  return parts
}

// the self-free complement of line parts: the env outcome's amplitude on key `env|` (nothing of the self outside A)
export const lineEps = (env: ReadonlyMap<string, Cx>): Map<string, Cx> =>
  new Map([...env].map(([k, a]) => [`${k}|`, a]))

// ---- K at a shared dock, keeping every env outcome (code/measure/cross-line-dock, with the self-free env beside) ----

const PERM = new Int32Array(24)
const DOCK = new Int8Array(24)
const OFF = -1000

const envTermsOf = (env: DockEnv): [number, number, number][] => [
  [env.single, HALF_COIN[0][0], HALF_COIN[0][1]],
  [OPPOSITE[env.single]!, HALF_COIN[1][0], HALF_COIN[1][1]],
]

const fullSlotsOf = (env: DockEnv): number[] => [LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]

// the env alone at its dock through its first half coin and the collision: env outcome key -> amplitude, in the
// instrument's order (every mode off l first)
export function selfFreeEnv(env: DockEnv, collision: CollisionKind): Map<string, Cx> {
  const out = new Map<string, Cx>()
  const keyOf = (d: number): number => OFF + localMode(d)

  for (const [single, cr, ci] of envTermsOf(env)) {
    DOCK.fill(0)
    DOCK[single] = 1

    for (const d of fullSlotsOf(env)) {
      DOCK[d] = 1
    }

    const kind = bouncePermutation(BOUNCE_TABLE, collision, DOCK, 0, PERM)
    const keys: number[] = []
    const images: number[] = []
    const after: number[] = []

    for (let d = 0; d < 24; d++) {
      if (DOCK[d] === 0) {
        continue
      }

      const to = kind === 0 ? d : PERM[d]!

      keys.push(keyOf(d))
      images.push(keyOf(to))
      after.push(to)
    }

    if (after.some(d => LINE_OF[d] === LINE_OF[env.first])) {
      throw new Error('self-reader: the env alone reaches l')
    }

    const sg = reorderParity(keys, images) === 1 ? -1 : 1

    addTo(out, after.sort((p, q) => p - q).join(','), sg * cr, sg * ci)
  }

  return out
}

// cross-line-dock's dockCollision, operation for operation
function dockCollision(
  a: ConeStore,
  X: number,
  env: DockEnv,
  collision: CollisionKind,
): { stores: Map<string, ConeStore>; exported: number; fired: number } {
  const lineOfL = LINE_OF[env.first]!
  const second = OPPOSITE[env.first]!
  const envTerms = envTermsOf(env)
  const fullSlots = fullSlotsOf(env)
  const stores = new Map<string, ConeStore>()
  const keyOf = (d: number): number =>
    LINE_OF[d] === lineOfL ? 2 * X + (d === env.first ? 1 : 0) : OFF + localMode(d)

  let exported = 0
  let fired = 0

  eachConfiguration(a, (modes, re, im) => {
    if (re === 0 && im === 0) {
      return
    }

    const atX: number[] = []
    const rest: number[] = []

    for (const md of modes) {
      if (md >> 1 === X) {
        atX.push(md)
      } else {
        rest.push(md)
      }
    }

    for (const [single, cr, ci] of envTerms) {
      DOCK.fill(0)

      for (const md of atX) {
        DOCK[(md & 1) === 1 ? env.first : second] = 1
      }

      DOCK[single] = 1

      for (const d of fullSlots) {
        DOCK[d] = 1
      }

      const kind = bouncePermutation(BOUNCE_TABLE, collision, DOCK, 0, PERM)

      let singles = 0

      for (let l = 0; l < 12; l++) {
        if ((DOCK[LINE_FIRSTS[l]!] !== 0) !== (DOCK[OPPOSITE[LINE_FIRSTS[l]!]!] !== 0)) {
          singles++
        }
      }

      const keys: number[] = [...rest]
      const images: number[] = [...rest]
      const newL: number[] = []
      const envAfter: number[] = []

      for (let d = 0; d < 24; d++) {
        if (DOCK[d] === 0) {
          continue
        }

        const to = kind === 0 ? d : PERM[d]!

        keys.push(keyOf(d))
        images.push(keyOf(to))

        if (LINE_OF[to] === lineOfL) {
          newL.push(keyOf(to))
        } else {
          envAfter.push(to)
        }
      }

      const ar = re * cr - im * ci
      const ai = re * ci + im * cr
      const w = ar * ar + ai * ai

      if (kind !== 0 && singles > 1) {
        fired += w
      }

      if (newL.length !== atX.length) {
        exported += w
        continue
      }

      const sg = reorderParity(keys, images) === 1 ? -1 : 1
      const key = envAfter.sort((p, q) => p - q).join(',')

      let s = stores.get(key)

      if (!s) {
        s = coneStore(a.n, a.line, a.cap, a.clock)
        stores.set(key, s)
      }

      addAmp(s, Int32Array.from([...rest, ...newL].sort((p, q) => p - q)), sg * ar, sg * ai)
    }
  })

  return { stores, exported, fired }
}

export type ClosureRun = {
  // B1's bound count summed over env outcomes, the closure and the weight of a_eps, beats 0..beats
  F: number[]
  c: number[]
  r: number[]
  // r_A summed over env outcomes (every member in A, any env)
  inside: number[]
  exported: number
  fired: number
  envs: number
}

// crossDockRun with the closure read at every beat: `start` (used up) through `beats` beats with the env at X on beat 1
// (undefined: the plain line engine), region docks lo..hi
export function closureDockRun(input: {
  start: ConeStore
  X: number
  env: DockEnv | undefined
  beats: number
  rd: LineReader
  collision: CollisionKind
  lo: number
  hi: number
}): ClosureRun {
  const { start, X, env, beats, rd, collision, lo, hi } = input
  let stores = new Map<string, ConeStore>([['', start]])
  let eps = new Map<string, Cx>([['', [1, 0]]])

  const F: number[] = []
  const c: number[] = []
  const r: number[] = []
  const inside: number[] = []
  const push = (): void => {
    let f = 0
    let w = 0

    for (const s of stores.values()) {
      f += coneBoundCount(s, rd)
      w += regionRetention(s, lo, hi)
    }

    const cl = closureOf(lineParts(stores, lo, hi), lineEps(eps))

    F.push(f)
    c.push(cl.c)
    r.push(cl.r)
    inside.push(w)
  }

  push()

  let exported = 0
  let fired = 0

  for (let t = 1; t <= beats; t++) {
    if (t === 1 && env) {
      halfPass(start)
      phasePass(start)

      const k = dockCollision(start, X, env, collision)

      exported = k.exported
      fired = k.fired
      eps = selfFreeEnv(env, collision)
      stores = new Map(
        [...k.stores].map(([key, s]) => {
          halfPass(s)

          const b = coneStore(s.n, s.line, s.cap, s.clock)

          streamInto(s, b)

          return [key, b]
        }),
      )
    } else {
      stores = new Map(
        [...stores].map(([key, s]) => {
          const b = coneStore(s.n, s.line, s.cap, s.clock)

          coneBeat(s, b, true)

          return [key, b]
        }),
      )
    }

    push()
  }

  return { F, c, r, inside, exported, fired, envs: stores.size }
}

// ---- the free null ----

// one beat of the free one-love walk on a line of `line` docks (mode 2x + 1 the forward label at dock x, 2x the back):
// the coin (split: the half coin twice) on each dock's two labels, then the stream (forward one dock up, back one down)
export function freeBeat(v: Float64Array, line: number, split: boolean, coin: Coin): Float64Array {
  const out = new Float64Array(v.length)
  const passes: Coin[] = split ? [HALF_COIN, HALF_COIN] : [coin]
  const work = Float64Array.from(v)

  for (const cn of passes) {
    const [kr, ki] = cn[0]
    const [cr, ci] = cn[1]

    for (let x = 0; x < line; x++) {
      const u = 2 * (2 * x + 1)
      const w = 2 * (2 * x)
      const ar = work[u]!
      const ai = work[u + 1]!
      const br = work[w]!
      const bi = work[w + 1]!

      work[u] = kr * ar - ki * ai + (cr * br - ci * bi)
      work[u + 1] = kr * ai + ki * ar + (cr * bi + ci * br)
      work[w] = cr * ar - ci * ai + (kr * br - ki * bi)
      work[w + 1] = cr * ai + ci * ar + (kr * bi + ki * br)
    }
  }

  for (let x = 0; x < line; x++) {
    const f = 2 * (2 * x + 1)
    const b = 2 * (2 * x)

    if (work[f] !== 0 || work[f + 1] !== 0) {
      if (x + 1 >= line) {
        throw new Error('self-reader: the free walk left its line')
      }

      out[2 * (2 * (x + 1) + 1)] = work[f]!
      out[2 * (2 * (x + 1) + 1) + 1] = work[f + 1]!
    }

    if (work[b] !== 0 || work[b + 1] !== 0) {
      if (x - 1 < 0) {
        throw new Error('self-reader: the free walk left its line')
      }

      out[2 * (2 * (x - 1))] = work[b]!
      out[2 * (2 * (x - 1)) + 1] = work[b + 1]!
    }
  }

  return out
}

export type Config = { modes: number[]; re: number; im: number }

// the configurations of a store with nonzero amplitude
export function configsOf(s: ConeStore): Config[] {
  const out: Config[] = []

  eachConfiguration(s, (modes, re, im) => {
    if (re !== 0 || im !== 0) {
      out.push({ modes: Array.from(modes), re, im })
    }
  })

  return out
}

const permutations = (n: number): { p: number[]; sign: number }[] => {
  if (n === 0) {
    return [{ p: [], sign: 1 }]
  }

  const out: { p: number[]; sign: number }[] = []

  for (const { p, sign } of permutations(n - 1)) {
    for (let at = 0; at <= p.length; at++) {
      // inserting n - 1 at position `at` passes p.length - at larger-index slots
      out.push({ p: [...p.slice(0, at), n - 1, ...p.slice(at)], sign: (p.length - at) % 2 === 0 ? sign : -sign })
    }
  }

  return out
}

// the n-fold tensor of a start over its distinct modes (index m^n, antisymmetric), and the mode list
function startTensor(psi: readonly Config[]): { modes: number[]; n: number; re: Float64Array; im: Float64Array } {
  const modes = [...new Set(psi.flatMap(c => c.modes))].sort((a, b) => a - b)
  const index = new Map(modes.map((q, i) => [q, i]))
  const n = psi[0]!.modes.length
  const m = modes.length
  const size = m ** n
  const re = new Float64Array(size)
  const im = new Float64Array(size)
  const perms = permutations(n)

  for (const c of psi) {
    const idx = c.modes.map(q => index.get(q)!)

    for (const { p, sign } of perms) {
      let at = 0

      for (let a = 0; a < n; a++) {
        at = at * m + idx[p[a]!]!
      }

      re[at] += sign * c.re
      im[at] += sign * c.im
    }
  }

  return { modes, n, re, im }
}

// M = u^dag P_A u on the start's modes: cols[i] the one-love vector (interleaved re, im) of start mode i at beat t
function regionGram(cols: readonly Float64Array[], lo: number, hi: number): { re: Float64Array; im: Float64Array } {
  const m = cols.length
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let sr = 0
      let si = 0

      for (let q = 2 * lo; q <= 2 * hi + 1; q++) {
        const ar = cols[i]![2 * q]!
        const ai = cols[i]![2 * q + 1]!
        const br = cols[j]![2 * q]!
        const bi = cols[j]![2 * q + 1]!

        sr += ar * br + ai * bi
        si += ar * bi - ai * br
      }

      re[i * m + j] = sr
      im[i * m + j] = si
    }
  }

  return { re, im }
}

// <T| M^(x)n |T> / n!, with M applied along each axis in turn
function tensorExpect(T: { n: number; re: Float64Array; im: Float64Array }, m: number, M: { re: Float64Array; im: Float64Array }): number {
  let cr = Float64Array.from(T.re)
  let ci = Float64Array.from(T.im)

  for (let axis = 0; axis < T.n; axis++) {
    const stride = m ** (T.n - 1 - axis)
    const nr = new Float64Array(cr.length)
    const ni = new Float64Array(cr.length)

    for (let base = 0; base < cr.length; base++) {
      if (Math.floor(base / stride) % m !== 0) {
        continue
      }

      for (let i = 0; i < m; i++) {
        let sr = 0
        let si = 0

        for (let j = 0; j < m; j++) {
          const xr = cr[base + j * stride]!
          const xi = ci[base + j * stride]!

          if (xr === 0 && xi === 0) {
            continue
          }

          const mr = M.re[i * m + j]!
          const mi = M.im[i * m + j]!

          sr += mr * xr - mi * xi
          si += mr * xi + mi * xr
        }

        nr[base + i * stride] = sr
        ni[base + i * stride] = si
      }
    }

    cr = nr
    ci = ni
  }

  let total = 0

  for (let k = 0; k < cr.length; k++) {
    total += T.re[k]! * cr[k]! + T.im[k]! * ci[k]!
  }

  let fact = 1

  for (let a = 2; a <= T.n; a++) {
    fact *= a
  }

  return total / fact
}

// <psi| Lambda^n(M) |psi> by the determinant sum (F0's direct form; quadratic in the configurations)
function directExpect(psi: readonly Config[], modes: readonly number[], M: { re: Float64Array; im: Float64Array }): number {
  const index = new Map(modes.map((q, i) => [q, i]))
  const m = modes.length
  const n = psi[0]!.modes.length
  const perms = permutations(n)

  let total = 0

  for (const a of psi) {
    const ia = a.modes.map(q => index.get(q)!)

    for (const b of psi) {
      const ib = b.modes.map(q => index.get(q)!)

      let dr = 0
      let di = 0

      for (const { p, sign } of perms) {
        let pr = sign
        let pi = 0

        for (let k = 0; k < n; k++) {
          const mr = M.re[ia[k]! * m + ib[p[k]!]!]!
          const mi = M.im[ia[k]! * m + ib[p[k]!]!]!
          const x = pr * mr - pi * mi

          pi = pr * mi + pi * mr
          pr = x
        }

        dr += pr
        di += pi
      }

      // conj(psi_a) det psi_b, real part
      const br = dr * b.re - di * b.im
      const bi = dr * b.im + di * b.re

      total += a.re * br + a.im * bi
    }
  }

  return total
}

export type FreeNull = {
  // r0 at beats 0..beats
  r0: number[]
  // the direct determinant sum at `checkBeat`, when asked
  direct?: number
}

// r0(t) of a start on the line engine's line (docks 0..line - 1), region lo..hi, beats 0..beats
export function freeNull(input: {
  psi: readonly Config[]
  line: number
  lo: number
  hi: number
  beats: number
  split?: boolean
  checkBeat?: number
}): FreeNull {
  const { psi, line, lo, hi, beats } = input
  const split = input.split ?? true
  const T = startTensor(psi)
  const m = T.modes.length
  let cols = T.modes.map(q => {
    const v = new Float64Array(4 * line)

    v[2 * q] = 1

    return v
  })

  const r0: number[] = []
  let direct: number | undefined

  for (let t = 0; t <= beats; t++) {
    if (t > 0) {
      cols = cols.map(v => freeBeat(v, line, split, HALF_COIN))
    }

    const M = regionGram(cols, lo, hi)

    r0.push(tensorExpect(T, m, M))

    if (input.checkBeat === t) {
      direct = directExpect(psi, T.modes, M)
    }
  }

  return { r0, direct }
}

// a one-love vector at mode q after `beats` free beats (for N1)
export function freeLove(line: number, q: number, beats: number, split = true): Float64Array[] {
  let v = new Float64Array(4 * line)

  v[2 * q] = 1

  const out = [v]

  for (let t = 1; t <= beats; t++) {
    v = freeBeat(v, line, split, HALF_COIN)
    out.push(v)
  }

  return out
}

// ---- the reading ----

// the first beat whose value falls below 1/2 (Infinity when none does)
export function halfTime(series: readonly number[]): number {
  const t = series.findIndex(x => x < 0.5)

  return t < 0 ? Infinity : t
}

export type SelfReading = {
  self: boolean | undefined
  reason: string
  tauC: number
  tau0: number
}

// a self iff n >= 1 and tau_c >= 2 tau_0, decided only when tau_0 <= reach / 2
export function readSelf(n: number, c: readonly number[], c0: readonly number[]): SelfReading {
  const tauC = halfTime(c)
  const tau0 = halfTime(c0)
  const reach = Math.min(c.length, c0.length) - 1

  if (n === 0) {
    return { self: false, reason: 'no members', tauC, tau0 }
  }

  if (!(tau0 <= reach / 2)) {
    return { self: undefined, reason: `tau_0 ${tau0} beyond half the run (${reach} beats)`, tauC, tau0 }
  }

  return tauC >= 2 * tau0
    ? { self: true, reason: `tau_c ${tauC} >= 2 tau_0 ${tau0}`, tauC, tau0 }
    : { self: false, reason: `tau_c ${tauC} < 2 tau_0 ${tau0}`, tauC, tau0 }
}
