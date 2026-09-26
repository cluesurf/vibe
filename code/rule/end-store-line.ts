// The string's count carried by the only copy a husk line has, the RECORDED HOP (E-SPN-0084, 0085): n LOCKED
// STAND-IN tokens on a husk ring of L docks, every link's center flux a recorded trit (as code/rule/flux-store-line),
// and the string's store held at its two END PORTS, each a column of D bulk trits, copied with its end.
//
// WHY THIS PLACEMENT (E-SPN-0084). On a husk line Gauss fixes every link's column up to one winding number, so the
// line's light has no degree of freedom of its own and no stream: the only thing that ever writes a line's column
// is a charge's recorded hop. So "the count carried by the light's copy" is, on a line, the count carried by the
// hops, and the only hops that change the string count l are those at the string's two ends. A count copied by
// those hops sits at the ends' ports. Nothing is held by a token (no flavor), and nothing is held by the string.
//
// THE REGISTERS. A token: its dock x and its role label j (0 and 1 the doublet, 2 the line, not copied). A link l:
// its center flux f_l in Z_3, held as the port pair of its end slots. The string's run: the links with f != 0, one
// contiguous arc; its left END DOCK is the tail of its first link and its right end dock the head of its last (at
// contact, l = 0, both are the one dock every token sits on). The left end port holds rL, the right rR, each in
// -D .. D (a column of D trits in the thermometer code). They are relations of the end slots, as a link's flux is.
//
// THE STREAM. Each token's label says which link its copy would cross; the tokens that would cross one link form
// that link's GROUP (as code/rule/reel-string-line). A group's copy records the crossings on the link (f - q
// forward, f + q back, Gauss mod 3 kept) and changes l by Delta = [f' != 0] - [f != 0]. Delta = 0: the copy is made.
// Delta != 0: the change is at one end of the run, and that END pays: its port's value moves by -Delta. Which end:
// a new link just outside the run (or at contact, the link on that side of the contact dock) belongs to the end on
// that side; a vacated first link to the left end, a vacated last link to the right; a one-link run vacated belongs
// to the side whose tokens moved (the tokens of both sides never vacate it together: it would need a charge that is
// not there). A group whose end cannot pay (the port pushed past -D or D) is not copied: its members stay and flip
// their doublet labels (0 <-> 1, 2 stays), E-SPN-0074's bounce. Every decision reads one link, the tokens on its two
// docks, and the port on one of those docks. The port's value is copied to the new end dock with the end.
//
// KEPT: rL + rR + l exactly, so from contact (both ports calm, no flux) l <= 2D: each end pays out at most D links.
// THEOREM (the ends are pinned, E-SPN-0085): for a cluster whose end docks never change without a change of l (three
// loves: the flux between loves is never 0), x_left - rL and x_right + rR are kept by every copy, so each end stays
// within 2D + 1 docks of where it began: the cluster cannot travel. A neutral pair at contact moves as one with no
// change of l, which is its only way to travel.
//
// THE COST AND THE MEETINGS are code/rule/flux-store-line's: the light's drift zeta_M^(-c l) per beat, two loves on
// one dock through 2U (its swap exchanges the two vibes' roles; the ports belong to the string's ends, not to the
// vibes, so nothing else is exchanged), a love and a fear through the knit's meeting under C (the identity on the
// states C reaches), and the coin 2C. Every amplitude lies in Z[x] / (x^K - 1), K = lcm(M, 3).
//
// Index: ((p 3^n + lab) 3^L + fl) (2D + 1)^2 + (rL + D) (2D + 1) + (rR + D), p the positions (token 0 most
// significant, base L), lab the labels (base 3), fl the link fluxes (link l the digit of 3^l).

import { stepTable, type Convention, type Vibe } from '@/code/rule/locked-token-line'

export type EndSpec = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  // D: each end port is a column of D trits, -D .. D links
  readonly depth: number
  // c and M: the cost zeta_M^(-c l) per beat (c = 0: no cost)
  readonly cost: number
  readonly root: number
  readonly meet?: boolean
}

export type EndRegisters = { x: number[]; j: number[]; f: number[]; rL: number; rR: number }

export type Run = { readonly l: number; readonly lo: number; readonly hi: number; readonly contact: number }

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const chargeOf = (kind: Vibe): number => (kind === 'love' ? 1 : -1)

export const portLevels = (s: EndSpec): number => 2 * s.depth + 1

export function decodeRegisters(s: EndSpec, index: number): EndRegisters {
  const n = s.kinds.length
  const L = s.ring
  const V = portLevels(s)
  let rest = index
  const rR = (rest % V) - s.depth

  rest = Math.floor(rest / V)

  const rL = (rest % V) - s.depth

  rest = Math.floor(rest / V)

  const f = new Array<number>(L)

  for (let l = 0; l < L; l++) {
    f[l] = rest % 3
    rest = Math.floor(rest / 3)
  }

  const j = new Array<number>(n)

  for (let t = n - 1; t >= 0; t--) {
    j[t] = rest % 3
    rest = Math.floor(rest / 3)
  }

  const x = new Array<number>(n)

  for (let t = n - 1; t >= 0; t--) {
    x[t] = rest % L
    rest = Math.floor(rest / L)
  }

  return { x, j, f, rL, rR }
}

export function encodeRegisters(s: EndSpec, g: EndRegisters): number {
  const n = s.kinds.length
  const L = s.ring
  const V = portLevels(s)
  let p = 0

  for (let t = 0; t < n; t++) p = p * L + g.x[t]!

  let lab = 0

  for (let t = 0; t < n; t++) lab = lab * 3 + g.j[t]!

  let fl = 0

  for (let l = L - 1; l >= 0; l--) fl = fl * 3 + g.f[l]!

  return ((p * 3 ** n + lab) * 3 ** L + fl) * V * V + (g.rL + s.depth) * V + (g.rR + s.depth)
}

// l: the count of links with nonzero center flux
export const stringCount = (f: readonly number[]): number => f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

// the string's run: one contiguous arc of nonzero links, or contact (every token on one dock)
export function runOf(s: EndSpec, g: EndRegisters): Run {
  const L = s.ring
  const l = stringCount(g.f)

  if (l === 0) {
    if (g.x.some(v => v !== g.x[0])) throw new Error('end-store-line: no string but the tokens are apart')

    return { l: 0, lo: -1, hi: -1, contact: g.x[0]! }
  }

  if (l >= L) throw new Error('end-store-line: the string wraps the ring')

  let lo = -1

  for (let x = 0; x < L; x++) {
    if (g.f[x] !== 0 && g.f[mod(x - 1, L)] === 0) {
      if (lo >= 0) throw new Error('end-store-line: the string is split')

      lo = x
    }
  }

  return { l, lo, hi: mod(lo + l - 1, L), contact: -1 }
}

// the two end docks (the ports' docks)
export const endDocks = (s: EndSpec, run: Run): [number, number] => (run.l === 0 ? [run.contact, run.contact] : [run.lo, mod(run.hi + 1, s.ring)])

export function gaussHolds(s: EndSpec, g: EndRegisters): boolean {
  const L = s.ring
  const q = new Array<number>(L).fill(0)

  s.kinds.forEach((k, t) => {
    q[g.x[t]!] = q[g.x[t]!]! + chargeOf(k)
  })

  for (let x = 0; x < L; x++) if (mod(g.f[x]! - g.f[mod(x - 1, L)]! - q[x]!, 3) !== 0) return false

  return true
}

// tokens on an arc that does not cross the seam (dock L - 1 to dock 0): the Gauss flux with none outside the arc
export function placedRegisters(s: EndSpec, x: readonly number[], j: readonly number[], rL = 0, rR = 0): EndRegisters {
  const f = new Array<number>(s.ring).fill(0)
  let cum = 0

  for (let l = 0; l < s.ring; l++) {
    s.kinds.forEach((k, t) => {
      if (x[t] === l) cum += chargeOf(k)
    })
    f[l] = mod(cum, 3)
  }

  if (f[s.ring - 1] !== 0) throw new Error('end-store-line: the placed tokens are not a center singlet')

  return { x: x.slice(), j: j.slice(), f, rL, rR }
}

const FLIP = [1, 0, 2] as const

export type Side = 'left' | 'right'

// which end pays a group's change of l (Delta != 0) at `link`, given the run before the beat
export function payingEnd(s: EndSpec, run: Run, link: number, delta: number, fromTail: boolean, fromHead: boolean): Side {
  const L = s.ring

  if (run.l === 0) {
    if (delta !== 1) throw new Error('end-store-line: a change at contact that is not a new link')
    if (link === mod(run.contact - 1, L)) return 'left'
    if (link === run.contact) return 'right'

    throw new Error('end-store-line: a new link away from the contact dock')
  }

  if (delta === 1) {
    if (link === mod(run.lo - 1, L)) return 'left'
    if (link === mod(run.hi + 1, L)) return 'right'

    throw new Error('end-store-line: a new link away from the run')
  }

  if (run.l === 1) {
    if (link !== run.lo) throw new Error('end-store-line: a vacated link off the run')
    if (fromTail && fromHead) throw new Error('end-store-line: both sides vacate one link')

    return fromTail ? 'left' : 'right'
  }

  if (link === run.lo) return 'left'
  if (link === run.hi) return 'right'

  throw new Error('end-store-line: an inner link vacated (the string would split)')
}

// the stream with the ends' bounce, as a map of register configurations
export function streamRegisters(s: EndSpec, g: EndRegisters): EndRegisters {
  const L = s.ring
  const n = s.kinds.length
  const run = runOf(s, g)
  const x = g.x.slice()
  const j = g.j.slice()
  const f = g.f.slice()
  let rL = g.rL
  let rR = g.rR
  const steps = g.j.map((lab, t) => stepTable(s.kinds[t]!, s.convention)[lab]!)
  const crossing = steps.map((st, t) => (st === 1 ? g.x[t]! : st === -1 ? mod(g.x[t]! - 1, L) : -1))
  const done = new Array<boolean>(n).fill(false)
  let leftPaid = 0
  let rightPaid = 0

  for (let t = 0; t < n; t++) {
    if (done[t] || crossing[t]! < 0) continue

    const link = crossing[t]!
    const group: number[] = []

    for (let u = 0; u < n; u++) if (crossing[u] === link) group.push(u)

    group.forEach(u => {
      done[u] = true
    })

    let fNew = g.f[link]!

    for (const u of group) fNew = mod(fNew - steps[u]! * chargeOf(s.kinds[u]!), 3)

    const delta = (fNew === 0 ? 0 : 1) - (g.f[link] === 0 ? 0 : 1)
    let fits = true

    if (delta !== 0) {
      const fromTail = group.some(u => steps[u] === 1)
      const fromHead = group.some(u => steps[u] === -1)
      const side = payingEnd(s, run, link, delta, fromTail, fromHead)
      const next = (side === 'left' ? g.rL : g.rR) - delta

      if (side === 'left') leftPaid++
      else rightPaid++

      if (leftPaid > 1 || rightPaid > 1) throw new Error('end-store-line: one end paid twice in a beat')

      fits = next >= -s.depth && next <= s.depth

      if (fits && side === 'left') rL = next
      if (fits && side === 'right') rR = next
    }

    if (!fits) {
      for (const u of group) j[u] = FLIP[g.j[u] as 0 | 1 | 2]

      continue
    }

    f[link] = fNew

    for (const u of group) x[u] = mod(g.x[u]! + steps[u]!, L)
  }

  return { x, j, f, rL, rR }
}

export const streamIndex = (s: EndSpec, index: number): number => encodeRegisters(s, streamRegisters(s, decodeRegisters(s, index)))

// the inverse stream: flip every label, stream, flip back
export function streamIndexBack(s: EndSpec, index: number): number {
  const g = decodeRegisters(s, index)
  const out = streamRegisters(s, { ...g, j: g.j.map(v => FLIP[v as 0 | 1 | 2] as number) })

  return encodeRegisters(s, { ...out, j: out.j.map(v => FLIP[v as 0 | 1 | 2] as number) })
}

// the ends' positions against their ports: x_left - rL and x_right + rR (ring positions, mod L)
export function endInvariants(s: EndSpec, g: EndRegisters): [number, number] {
  const [a, b] = endDocks(s, runOf(s, g))

  return [mod(a - g.rL, s.ring), mod(b + g.rR, s.ring)]
}

// ---------------------------------------------------------------------------------------------------------
// exact amplitudes in Z[x] / (x^K - 1)

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

export const exactRoot = (s: EndSpec): number => (s.root * 3) / gcd(s.root, 3)

export type ExactEndState = { readonly spec: EndSpec; readonly k: number; den: bigint; amp: Map<number, bigint[]> }

type Term = readonly [bigint, number]

function addTerms(out: bigint[], v: readonly bigint[], terms: readonly Term[], k: number): void {
  for (const [c, a] of terms) {
    if (c === 0n) continue

    const sh = mod(a, k)

    for (let i = 0; i < k; i++) {
      const y = v[i]!

      if (y !== 0n) out[(i + sh) % k] = out[(i + sh) % k]! + c * y
    }
  }
}

const zero = (k: number): bigint[] => new Array<bigint>(k).fill(0n)

export function exactEndStart(s: EndSpec, start: readonly { registers: EndRegisters; weight: bigint }[]): ExactEndState {
  const k = exactRoot(s)
  const amp = new Map<number, bigint[]>()

  for (const e of start) {
    const v = zero(k)

    v[0] = e.weight
    amp.set(encodeRegisters(s, e.registers), v)
  }

  return { spec: s, k, den: 1n, amp }
}

function labelPiece(st: ExactEndState, apply: (g: EndRegisters) => { j: number[]; terms: Term[] }[]): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const g = decodeRegisters(st.spec, i)

    for (const o of apply(g)) {
      const key = encodeRegisters(st.spec, { ...g, j: o.j })
      let target = out.get(key)

      if (!target) {
        target = zero(st.k)
        out.set(key, target)
      }

      addTerms(target, v, o.terms, st.k)
    }
  }

  st.amp = out
}

const meetingScale = (s: EndSpec): bigint => {
  if (s.meet === false) return 1n

  let scale = 1n
  const n = s.kinds.length

  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (s.kinds[a] === s.kinds[b]) scale *= 2n

  return scale
}

export const exactEndBeatScale = (s: EndSpec): bigint => 2n ** BigInt(s.kinds.length) * meetingScale(s)

function costPiece(st: ExactEndState, adjoint: boolean): void {
  const s = st.spec

  if (s.cost === 0) return

  const unit = st.k / s.root
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const target = zero(st.k)

    addTerms(target, v, [[1n, (adjoint ? 1 : -1) * s.cost * stringCount(decodeRegisters(s, i).f) * unit]], st.k)
    out.set(i, target)
  }

  st.amp = out
}

// two like vibes on one dock: 2U = (1 + w) + (1 - w) SWAP on their roles; a love and a fear: the knit's meeting
// under C, the identity on the states C reaches
function meetingPiece(st: ExactEndState, adjoint: boolean): void {
  const s = st.spec

  if (s.meet === false) return

  const n = s.kinds.length
  const w3 = st.k / 3
  const w = adjoint ? -w3 : w3
  const pairs: [number, number][] = []

  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (s.kinds[a] === s.kinds[b]) pairs.push([a, b])

  const order = adjoint ? pairs.slice().reverse() : pairs

  for (const [a, b] of order) {
    labelPiece(st, g => {
      if (g.x[a] !== g.x[b]) return [{ j: g.j, terms: [[2n, 0]] }]

      const sw = g.j.slice()

      sw[a] = g.j[b]!
      sw[b] = g.j[a]!

      return [
        { j: g.j.slice(), terms: [[1n, 0], [1n, w]] },
        { j: sw, terms: [[1n, 0], [-1n, w]] },
      ]
    })
  }
}

function coinPiece(st: ExactEndState, adjoint: boolean): void {
  const n = st.spec.kinds.length
  const w = (adjoint ? -1 : 1) * (st.k / 3)

  for (let t = 0; t < n; t++) {
    labelPiece(st, g => {
      const jt = g.j[t]!

      if (jt === 2) return [{ j: g.j, terms: [[2n, 0]] }]

      const other = g.j.slice()

      other[t] = 1 - jt

      return [
        { j: g.j.slice(), terms: [[1n, 0], [1n, w]] },
        { j: other, terms: [[1n, 0], [-1n, w]] },
      ]
    })
  }
}

function streamPiece(st: ExactEndState, back: boolean): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) out.set(back ? streamIndexBack(st.spec, i) : streamIndex(st.spec, i), v)

  if (out.size !== st.amp.size) throw new Error('end-store-line: the stream merged two configurations')

  st.amp = out
}

export function exactEndBeat(st: ExactEndState): void {
  costPiece(st, false)
  meetingPiece(st, false)
  coinPiece(st, false)
  streamPiece(st, false)
  st.den *= exactEndBeatScale(st.spec)
}

export function exactEndBeatBack(st: ExactEndState): void {
  streamPiece(st, true)
  coinPiece(st, true)
  meetingPiece(st, true)
  costPiece(st, true)
  st.den *= exactEndBeatScale(st.spec)
}
