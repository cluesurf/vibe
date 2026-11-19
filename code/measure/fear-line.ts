// FEARS ON B1'S LINE (item vibe-roadmap-grounding-0050, grounding decision 013). B1's line rule (code/measure/cold-line)
// with every piece a fear needs, each one DERIVED from the working rule on the honeycomb restricted to line l, never
// invented. The honeycomb code it is checked against is coinedVetoBeat (veto 'none', coin before) with the pieces off,
// and code/rule/cross-line-pieces crossBeat (clock 14, coin before) with B1's pieces on: that file is the honeycomb form
// of B1's pieces that takes a fear (proposal 012: every open vibe one fermion field, the S1 link register written with
// q = +1 a love, -1 a fear), and it equals code/rule/bound-line-pieces on a loves-only line (its own conformance).
//
// THE CONFIGURATION. Line l's two slots at every dock and the dock's store trit on l. Mode 2x is the second slot (the
// back label 1, streams one dock back), mode 2x + 1 the first slot (the forward label 0), cold-line's mode order. Each
// mode holds 0, +1 (a love) or -1 (a fear); store x holds 0 or tau, the value the first slot held when the pair was
// unmade (occupation-veto-knit pairPiece). Every vibe on the line is open, so a store's open bits are always both set
// and its stored points are 0 (all points are 0 on the line): the store trit alone holds what pairPiece keeps.
//
// ONE BEAT (coin before, the honeycomb's U = S Y C), each piece the honeycomb's:
//   cost   (B1's piece, optional) zeta_clock^(-n), n the links whose flux c + Q(l) is not 0 mod 3, Q(l) the CHARGE
//          (loves minus fears; a store is neutral) at positions 0 .. l. Closed: every link of the ring, c the cut trit.
//          Open: the line's own links 0 .. L - 2 (the honeycomb line has no far link). Read before the beat, as
//          crossBeat reads its register.
//   dock   a line holding two open vibes takes the coin's determinant w (charge blind), and two LIKE vibes also take
//          the meeting's equal-point phase w: w^2 for two loves or two fears (cold-line's full dock), w for a love and a
//          fear. Diagonal, and the coin keeps which docks hold two vibes, so it is taken before the coin.
//   coin   a dock with one vibe on l: keep (1 + w)/2, or the vibe (value kept) to the dock's other slot with (1 - w)/2.
//   pair   (the collision's P; its C, the bounce, moves nothing on a dock holding line l alone) a love and a fear on
//          the two slots with store 0 become store tau = the first slot's value; a store with both slots empty becomes
//          tau on the first slot and -tau on the second. Sign +1: the two modes are adjacent in line order (2x, 2x + 1).
//   stream every open vibe one dock along its label; a store stays. With `sign` (B1's piece) the parity of the
//          reordering the stream gives the open modes in line order. Closed: c - q when a vibe leaves L - 1 forward,
//          c + q when it leaves 0 back (the recorded hop, q = +1 a love, -1 a fear).
// The inverse runs each piece back in the reverse order.
//
// GAUGE against the honeycomb. With the sign on, the honeycomb's amplitudes are in modeIndex order (the first slot
// before the second at one dock) and this file's in line order (the second first). The two differ by G = the parity of
// the reordering of the open modes (cross-line-pieces gaugeLine) times (-1) per store: a pair's two modes are adjacent
// in both orders but reversed, so the +1 of unmaking in one order is -1 in the other, a fixed sign per configuration.
//
// TWO EVALUATORS of one map (forwardTerms, backTerms): EXACT, an amplitude per clock count e (mod clock) and cut c, each
// (a + b w) / 2^k with bigint a, b (the honeycomb's free module, so a run forward and back returns the start bit for
// bit), and FLOAT, complex amplitudes per cut. Nothing here moves the rule; no random number.

const SQ3 = Math.sqrt(3)

export type FearLine = {
  readonly L: number
  readonly closed: boolean
  // B1's pieces
  readonly cost: boolean
  readonly sign: boolean
  // the cost's clock 2N (14, B1's)
  readonly clock: number
}

// modes 0 .. 2L - 1, then the L stores
export type Cfg = Int8Array

export const modeOf = (x: number, j: number): number => (j === 0 ? 2 * x + 1 : 2 * x)
export const storeAt = (L: number, x: number): number => 2 * L + x

export const emptyCfg = (L: number): Cfg => new Int8Array(3 * L)

export function cfgKey(c: Cfg): string {
  let s = ''

  for (let i = 0; i < c.length; i++) {
    s += String.fromCharCode(c[i]! + 66)
  }

  return s
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---- Z[w] / 2^k ----

export type Z = { a: bigint; b: bigint; k: number }

export const mulZ = (x: Z, y: Z): Z => ({
  a: x.a * y.a - x.b * y.b,
  b: x.a * y.b + x.b * y.a - x.b * y.b,
  k: x.k + y.k,
})

export function reduceZ(x: Z): Z {
  let { a, b, k } = x

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return { a, b, k }
}

export function addZ(x: Z, y: Z): Z {
  const k = Math.max(x.k, y.k)

  return reduceZ({
    a: x.a * (1n << BigInt(k - x.k)) + y.a * (1n << BigInt(k - y.k)),
    b: x.b * (1n << BigInt(k - x.k)) + y.b * (1n << BigInt(k - y.k)),
    k,
  })
}

export const isZero = (x: Z): boolean => x.a === 0n && x.b === 0n

export const normZ = (x: Z): { n: bigint; k: number } => ({ n: x.a * x.a - x.a * x.b + x.b * x.b, k: 2 * x.k })

export const complexOf = (x: Z): [number, number] => {
  const s = 2 ** -x.k

  return [(Number(x.a) - Number(x.b) / 2) * s, ((Number(x.b) * SQ3) / 2) * s]
}

const ONE: Z = { a: 1n, b: 0n, k: 0 }
const NEG: Z = { a: -1n, b: 0n, k: 0 }
// w^m, m = 0, 1, 2
const W_POW: readonly Z[] = [ONE, { a: 0n, b: 1n, k: 0 }, { a: -1n, b: -1n, k: 0 }]
// the coin over 2: keep (1 + w), cross (1 - w); adjoint keep -w, cross 2 + w (coined-locked-knit KEEP, CROSS)
const KEEP: readonly Z[] = [{ a: 1n, b: 1n, k: 1 }, { a: 0n, b: -1n, k: 1 }]
const CROSS: readonly Z[] = [{ a: 1n, b: -1n, k: 1 }, { a: 2n, b: 1n, k: 1 }]

// ---- the pieces on one configuration ----

// the charge of dock x (stores are neutral)
export const chargeAt = (c: Cfg, x: number): number => c[2 * x]! + c[2 * x + 1]!

// the cost's link count: links with flux c + Q(l) != 0 mod 3
export function costLinks(line: FearLine, cfg: Cfg, cut: number): number {
  const last = line.closed ? line.L : line.L - 1

  let Q = 0
  let n = 0

  for (let l = 0; l < last; l++) {
    Q += chargeAt(cfg, l)

    if (mod(cut + Q, 3) !== 0) {
      n++
    }
  }

  return n
}

// the dock phase's power of w: 2 per dock of two like vibes, 1 per dock of a love and a fear
export function dockPower(line: FearLine, cfg: Cfg): number {
  let m = 0

  for (let x = 0; x < line.L; x++) {
    const a = cfg[2 * x + 1]!
    const b = cfg[2 * x]!

    if (a !== 0 && b !== 0) {
      m += a === b ? 2 : 1
    }
  }

  return m % 3
}

// the docks the coin acts on: exactly one vibe on l
export function coinDocks(line: FearLine, cfg: Cfg): number[] {
  const out: number[] = []

  for (let x = 0; x < line.L; x++) {
    if ((cfg[2 * x] !== 0) !== (cfg[2 * x + 1] !== 0)) {
      out.push(x)
    }
  }

  return out
}

// the pair move at every dock, in place (an involution); returns how many docks it made or unmade
export function pairPass(line: FearLine, cfg: Cfg): number {
  let acted = 0

  for (let x = 0; x < line.L; x++) {
    const a = cfg[2 * x + 1]!
    const b = cfg[2 * x]!
    const s = storeAt(line.L, x)
    const tau = cfg[s]!

    if (tau === 0 && a !== 0 && b === -a) {
      cfg[2 * x + 1] = 0
      cfg[2 * x] = 0
      cfg[s] = a
      acted++
    } else if (tau !== 0 && a === 0 && b === 0) {
      cfg[2 * x + 1] = tau
      cfg[2 * x] = -tau
      cfg[s] = 0
      acted++
    }
  }

  return acted
}

// parity (0 or 1) of the reordering keys -> images
function reorderParity(keys: readonly number[], images: readonly number[]): number {
  let inversions = 0

  for (let p = 0; p < keys.length; p++) {
    for (let q = p + 1; q < keys.length; q++) {
      if ((keys[p]! - keys[q]!) * (images[p]! - images[q]!) < 0) {
        inversions++
      }
    }
  }

  return inversions & 1
}

export type Streamed = { cfg: Cfg; parity: number; dc: number; crosses: boolean }

// the stream: every open vibe one dock along its label, stores kept
export function streamCfg(line: FearLine, cfg: Cfg): Streamed {
  const { L } = line
  const out = emptyCfg(L)
  const keys: number[] = []
  const images: number[] = []

  let dc = 0
  let crosses = false

  for (let x = 0; x < L; x++) {
    out[storeAt(L, x)] = cfg[storeAt(L, x)]!
  }

  for (let m = 0; m < 2 * L; m++) {
    const q = cfg[m]!

    if (q === 0) {
      continue
    }

    const x = m >> 1
    const forward = (m & 1) === 1
    const y = mod(forward ? x + 1 : x - 1, L)
    const nm = forward ? 2 * y + 1 : 2 * y

    if (forward && x === L - 1) {
      dc -= q
      crosses = true
    }

    if (!forward && x === 0) {
      dc += q
      crosses = true
    }

    out[nm] = q
    keys.push(m)
    images.push(nm)
  }

  return { cfg: out, parity: reorderParity(keys, images), dc: line.closed ? mod(dc, 3) : 0, crosses }
}

// its inverse: every open vibe one dock against its label
export function unstreamCfg(line: FearLine, cfg: Cfg): Streamed {
  const { L } = line
  const out = emptyCfg(L)
  const keys: number[] = []
  const images: number[] = []

  let dc = 0
  let crosses = false

  for (let x = 0; x < L; x++) {
    out[storeAt(L, x)] = cfg[storeAt(L, x)]!
  }

  for (let m = 0; m < 2 * L; m++) {
    const q = cfg[m]!

    if (q === 0) {
      continue
    }

    const y = m >> 1
    const forward = (m & 1) === 1
    const x = mod(forward ? y - 1 : y + 1, L)
    const om = forward ? 2 * x + 1 : 2 * x

    if (forward && x === L - 1) {
      dc -= q
      crosses = true
    }

    if (!forward && x === 0) {
      dc += q
      crosses = true
    }

    out[om] = q
    keys.push(om)
    images.push(m)
  }

  return { cfg: out, parity: reorderParity(keys, images), dc: line.closed ? mod(dc, 3) : 0, crosses }
}

// ---- the beat as a map on configurations ----

// one term of the image of (cfg, cut): the target, its cut, the coefficient (sign, dock phase, coin), the clock shift
export type Term = { cfg: Cfg; cut: number; coef: Z; de: number; crosses: boolean }

// the coin's outcomes on cfg (forward or adjoint), each with its coefficient
function coinOutcomes(line: FearLine, cfg: Cfg, adjoint: boolean): { cfg: Cfg; coef: Z }[] {
  const docks = coinDocks(line, cfg)
  const side = adjoint ? 1 : 0
  const out: { cfg: Cfg; coef: Z }[] = []

  for (let mask = 0; mask < 1 << docks.length; mask++) {
    const c = Int8Array.from(cfg)

    let coef = ONE

    docks.forEach((x, n) => {
      if ((mask >> n) & 1) {
        const v = c[2 * x]! + c[2 * x + 1]!

        if (c[2 * x] !== 0) {
          c[2 * x] = 0
          c[2 * x + 1] = v
        } else {
          c[2 * x + 1] = 0
          c[2 * x] = v
        }

        coef = mulZ(coef, CROSS[side]!)
      } else {
        coef = mulZ(coef, KEEP[side]!)
      }
    })
    out.push({ cfg: c, coef })
  }

  return out
}

// the forward beat's first stage on (cfg, cut): cost and dock phase, coin, pair move (the stream follows in streamCfg)
export function forwardStage(line: FearLine, cfg: Cfg, cut: number): Term[] {
  const de = line.cost ? -costLinks(line, cfg, cut) : 0
  const dock = W_POW[dockPower(line, cfg)]!

  return coinOutcomes(line, cfg, false).map(o => {
    pairPass(line, o.cfg)

    return { cfg: o.cfg, cut, coef: mulZ(dock, o.coef), de, crosses: false }
  })
}

// the stream with its sign, as one term
export function streamTerm(line: FearLine, cfg: Cfg, cut: number): Term {
  const s = streamCfg(line, cfg)

  return {
    cfg: s.cfg,
    cut: mod(cut + s.dc, 3),
    coef: line.sign && s.parity === 1 ? NEG : ONE,
    de: 0,
    crosses: s.crosses,
  }
}

// the inverse beat on (cfg, cut): the stream undone with its sign, the pair move, the adjoint coin, the dock phase and
// cost undone (read on the configuration and cut before the beat)
export function backTerms(line: FearLine, cfg: Cfg, cut: number): Term[] {
  const u = unstreamCfg(line, cfg)
  const c0 = mod(cut - u.dc, 3)
  const sign = line.sign && u.parity === 1 ? NEG : ONE

  pairPass(line, u.cfg)

  return coinOutcomes(line, u.cfg, true).map(o => {
    const p = dockPower(line, o.cfg)

    return {
      cfg: o.cfg,
      cut: c0,
      coef: mulZ(mulZ(sign, o.coef), W_POW[(3 - p) % 3]!),
      de: line.cost ? costLinks(line, o.cfg, c0) : 0,
      crosses: u.crosses,
    }
  })
}

// ---- the exact evaluator ----

// configuration -> (slice e * 3 + cut) -> amplitude
export type ExactEntry = { cfg: Cfg; amps: Map<number, Z> }
export type ExactState = Map<string, ExactEntry>

export function exactPut(s: ExactState, cfg: Cfg, slice: number, x: Z): void {
  const key = cfgKey(cfg)

  let o = s.get(key)

  if (!o) {
    o = { cfg, amps: new Map() }
    s.set(key, o)
  }

  const prev = o.amps.get(slice)
  const next = prev ? addZ(prev, x) : reduceZ(x)

  if (isZero(next)) {
    o.amps.delete(slice)

    if (o.amps.size === 0) {
      s.delete(key)
    }
  } else {
    o.amps.set(slice, next)
  }
}

export function exactStart(cfg: Cfg): ExactState {
  const s: ExactState = new Map()

  exactPut(s, cfg, 0, ONE)

  return s
}

const sliceOf = (clock: number, e: number, cut: number): number => mod(e, clock) * 3 + cut

export type ExactBeat = { state: ExactState; crossed: boolean }

export function exactBeat(line: FearLine, s: ExactState): ExactBeat {
  const mid: ExactState = new Map()

  for (const { cfg, amps } of s.values()) {
    for (const [slice, x] of amps) {
      const e = Math.floor(slice / 3)
      const cut = slice % 3

      for (const t of forwardStage(line, cfg, cut)) {
        exactPut(mid, t.cfg, sliceOf(line.clock, e + t.de, t.cut), mulZ(x, t.coef))
      }
    }
  }

  const out: ExactState = new Map()

  let crossed = false

  for (const { cfg, amps } of mid.values()) {
    for (const [slice, x] of amps) {
      const e = Math.floor(slice / 3)
      const t = streamTerm(line, cfg, slice % 3)

      crossed ||= t.crosses
      exactPut(out, t.cfg, sliceOf(line.clock, e, t.cut), mulZ(x, t.coef))
    }
  }

  return { state: out, crossed }
}

export function exactBeatBack(line: FearLine, s: ExactState): ExactState {
  const out: ExactState = new Map()

  for (const { cfg, amps } of s.values()) {
    for (const [slice, x] of amps) {
      const e = Math.floor(slice / 3)

      for (const t of backTerms(line, cfg, slice % 3)) {
        exactPut(out, t.cfg, sliceOf(line.clock, e + t.de, t.cut), mulZ(x, t.coef))
      }
    }
  }

  return out
}

// the slices' summed norm: sum N(a + b w) 4^(K - k), against 4^K (equal exactly when it is 1)
export function exactNorm(s: ExactState): { total: bigint; unit: bigint } {
  const all = [...s.values()].flatMap(o => [...o.amps.values()])
  const K = Math.max(0, ...all.map(x => x.k))

  let total = 0n

  for (const x of all) {
    total += (x.a * x.a - x.a * x.b + x.b * x.b) * (1n << BigInt(2 * (K - x.k)))
  }

  return { total, unit: 1n << BigInt(2 * K) }
}

// the (configuration, slice) entries where two exact states differ
export function exactDiffer(a: ExactState, b: ExactState): number {
  let n = 0

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(key)?.amps ?? new Map<number, Z>()
    const y = b.get(key)?.amps ?? new Map<number, Z>()

    for (const slice of new Set([...x.keys(), ...y.keys()])) {
      const p = x.get(slice)
      const q = y.get(slice)

      if (!p || !q || !isZero(addZ(p, mulZ(q, NEG)))) {
        n++
      }
    }
  }

  return n
}

// the physical amplitude of an entry at cut `cut`: sum_e (a + b w) / 2^k zeta_clock^e
export function physicalAt(line: FearLine, o: ExactEntry, cut: number): [number, number] {
  let re = 0
  let im = 0

  for (const [slice, x] of o.amps) {
    if (slice % 3 !== cut) {
      continue
    }

    const [ar, ai] = complexOf(x)
    const th = (2 * Math.PI * Math.floor(slice / 3)) / line.clock
    const c = Math.cos(th)
    const n = Math.sin(th)

    re += ar * c - ai * n
    im += ar * n + ai * c
  }

  return [re, im]
}

// ---- the float evaluator ----

export type FloatEntry = { cfg: Cfg; re: Float64Array; im: Float64Array }
export type FloatState = Map<string, FloatEntry>

export function floatPut(s: FloatState, cfg: Cfg, cut: number, re: number, im: number): void {
  const key = cfgKey(cfg)

  let o = s.get(key)

  if (!o) {
    o = { cfg, re: new Float64Array(3), im: new Float64Array(3) }
    s.set(key, o)
  }

  o.re[cut]! += re
  o.im[cut]! += im
}

export type FloatBeat = { state: FloatState; crossing: number }

// one beat in floats; `crossing` the weight that would cross an open line's far link (0 on a closed one)
export function floatBeat(line: FearLine, s: FloatState): FloatBeat {
  const mid: FloatState = new Map()

  for (const { cfg, re, im } of s.values()) {
    for (let cut = 0; cut < 3; cut++) {
      const ar = re[cut]!
      const ai = im[cut]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (const t of forwardStage(line, cfg, cut)) {
        const [cr, ci] = complexOf(t.coef)
        const th = (2 * Math.PI * t.de) / line.clock
        const pr = cr * Math.cos(th) - ci * Math.sin(th)
        const pi = cr * Math.sin(th) + ci * Math.cos(th)

        floatPut(mid, t.cfg, t.cut, ar * pr - ai * pi, ar * pi + ai * pr)
      }
    }
  }

  const out: FloatState = new Map()

  let crossing = 0

  for (const { cfg, re, im } of mid.values()) {
    for (let cut = 0; cut < 3; cut++) {
      const ar = re[cut]!
      const ai = im[cut]!

      if (ar === 0 && ai === 0) {
        continue
      }

      const t = streamTerm(line, cfg, cut)
      const sg = t.coef.a === -1n ? -1 : 1

      if (t.crosses && !line.closed) {
        crossing += ar * ar + ai * ai
      }

      floatPut(out, t.cfg, t.cut, sg * ar, sg * ai)
    }
  }

  return { state: out, crossing }
}

// ---- the boundary with fears (decision 013 item 4) ----
//
// Charge blind. A dock's HELD UNITS are its vibes on l and its stored line. A vibe is a SYNDROME when it is the only
// held unit on its dock (the other slot empty, store 0) and no held unit lies on another dock within distance d (cyclic
// on a closed line). A stored line is never handed out (it holds a self love when it forms with one). Removing a
// syndrome vibe leaves every other syndrome as it was (no held unit lies within d of it), so the docks' exports commute.
// The sign of taking modes out in ascending order: (-1)^(open vibes on lower modes), stores even.

const distance = (a: number, b: number, L: number, closed: boolean): number => {
  const d = Math.abs(a - b)

  return closed ? Math.min(d % L, L - (d % L)) : d
}

export const heldAt = (L: number, c: Cfg, x: number): number =>
  (c[2 * x] !== 0 ? 1 : 0) + (c[2 * x + 1] !== 0 ? 1 : 0) + (c[storeAt(L, x)] !== 0 ? 1 : 0)

// the syndrome modes of a configuration, ascending (every lone vibe with `isolatedOnly` false: the swap control)
export function fearSyndrome(L: number, c: Cfg, d: number, closed: boolean, isolatedOnly: boolean): number[] {
  const out: number[] = []

  for (let x = 0; x < L; x++) {
    if (heldAt(L, c, x) !== 1 || c[storeAt(L, x)] !== 0) {
      continue
    }

    if (isolatedOnly) {
      let alone = true

      for (let y = 0; y < L && alone; y++) {
        if (y !== x && heldAt(L, c, y) > 0 && distance(x, y, L, closed) <= d) {
          alone = false
        }
      }

      if (!alone) {
        continue
      }
    }

    out.push(c[2 * x] !== 0 ? 2 * x : 2 * x + 1)
  }

  return out
}

const openBelow = (c: Cfg, m: number): number => {
  let n = 0

  for (let i = 0; i < m; i++) {
    n += c[i] !== 0 ? 1 : 0
  }

  return n
}

// the export: the configuration left, the records (mode, charge) handed out, the sign
export type FearExport = { left: Cfg; taken: { mode: number; q: number }[]; sign: number }

export function fearExport(L: number, c: Cfg, d: number, closed: boolean, isolatedOnly: boolean): FearExport {
  const left = Int8Array.from(c)
  const taken: { mode: number; q: number }[] = []

  let parity = 0

  for (const m of fearSyndrome(L, c, d, closed, isolatedOnly)) {
    parity += openBelow(left, m)
    taken.push({ mode: m, q: left[m]! })
    left[m] = 0
  }

  return { left, taken, sign: parity % 2 === 0 ? 1 : -1 }
}

// the partner direction: cells holding (mode, charge) records at docks that are empty in `c` with no held unit within d
// put their vibe back; undefined when any record cannot return (the piece then leaves the pair alone)
export function fearReturn(
  L: number,
  c: Cfg,
  records: readonly { mode: number; q: number }[],
  d: number,
  closed: boolean,
): { cfg: Cfg; sign: number } | undefined {
  const out = Int8Array.from(c)
  const docks = new Set(records.map(r => r.mode >> 1))

  for (const r of records) {
    const x = r.mode >> 1

    if (heldAt(L, c, x) !== 0) {
      return undefined
    }

    for (let y = 0; y < L; y++) {
      if (y !== x && heldAt(L, c, y) > 0 && distance(x, y, L, closed) <= d) {
        return undefined
      }

      // two records within d of each other would not both have been isolated
      if (y !== x && docks.has(y) && distance(x, y, L, closed) <= d) {
        return undefined
      }
    }
  }

  // put back descending, so each mode counts the same lower modes its export counted
  let parity = 0

  for (const r of [...records].sort((p, q) => q.mode - p.mode)) {
    out[r.mode] = r.q
    parity += openBelow(out, r.mode)
  }

  return { cfg: out, sign: parity % 2 === 0 ? 1 : -1 }
}

// an arrival of charge q at mode (dock, label): enters when the mode is empty, sign (-1)^(open vibes on lower modes);
// undefined when the mode is full (the vibe stays in its cell)
export function fearArrival(c: Cfg, x: number, label: number, q: number): { cfg: Cfg; sign: number } | undefined {
  const m = modeOf(x, label)

  if (c[m] !== 0) {
    return undefined
  }

  const out = Int8Array.from(c)

  out[m] = q

  return { cfg: out, sign: openBelow(c, m) % 2 === 0 ? 1 : -1 }
}

// ---- the class (decision 013 item 5) ----

// Q_t = loves - fears on docks x = parity mod 2, mod 3 (a store is neutral, so a resting pair never moves it)
export function chargeClass(L: number, c: Cfg, parity: number): number {
  let q = 0

  for (let x = parity; x < L; x += 2) {
    q += chargeAt(c, x)
  }

  return mod(q, 3)
}
