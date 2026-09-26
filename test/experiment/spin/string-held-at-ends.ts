// Where the string's store can live, and the one place a husk-local rule can put it: at the string's ENDS, on each
// charge's own column (code/rule/reel-string-line). A STAND-IN on locked tokens on one husk line.
//
// E-SPN-0075 made the store the flux's own count, held as one column at one end port. Its bounce decides every
// token's copy from the string's total length, so it reads the far end of the string in the same beat, up to 2D
// docks away. The user's direction: fewest parts, results by theorem. Two angles were weighed before building.
//
// ANGLE 1: IS THE STORE REDUNDANT? Gauss makes each link's flux a local record of the charge on one side. Could a
// per-link bound, which the column already enforces, replace "total length <= 2D"?
// THEOREM 1 (no local bound confines at a range). On a line with no flux at infinity, Gauss fixes every link's flux
// to the enclosed charge, whatever the separation. A string of length r shows the windows of the pattern
// 0 .. 0 q .. q 0 .. 0 (three loves: 0 .. 0 1 .. 1 2 .. 2 0 .. 0), and for r >= w every string shows the SAME set
// of w-link windows. So any predicate on w consecutive links' registers, required at every position, allows every
// length from w on or none of them: a local bound confines everything or nothing, and confinement at range R needs
// a window of more than R links. The store is not redundant, and a count is required (E-SPN-0074: a phase cannot
// confine). This holds for a per-link column of any size: its flux too is the enclosed charge.
// THEOREM 2 (the port store is not husk-local). E-SPN-0075's copy is made only when the joint image keeps l <= 2D.
// A token at one end of a string of 2D, stepping out, is copied or bounced according to whether the OTHER end
// steps in or out in the same beat, 2D docks away. No rule reading one dock's neighborhood per beat can do that.
// THEOREM 3 (the store must sit on the charges). A husk-local count that a growing end pays from in one beat must
// sit within one dock of that end, and the end of a string is a charge. A count left on the links would have to
// be carried to the ends by a stream of its own (a new part), and one fixed to the docks would stay behind a
// travelling pair. So each token's own column holds its REEL: what that end has paid out (the yo-yo string: the
// ends trade length only through the string). The rule: each token's copy crosses one link; the tokens crossing
// one link pay its change of l in equal whole half-links (the only split that does not order two identical tokens
// crossing together); a group that cannot pay stays and flips, E-SPN-0074's bounce decided per link. Kept: sum of
// reels + 2 l. From contact (reels calm, r = 0) each reel is at least -D, so l <= floor(n D / 2).
//
// ANGLE 2: IS THE KNIT'S OWN VIBE A LOCKED TOKEN? The adopted knit's stream copies a vibe along its slot and never
// reads its role; the fear beat (fear-weave advanceWhole) advances the signed whole from the classical beat's
// RECORD and never writes the classical configuration (comoving-weave: the own point "is a function of the
// classical record alone"). So every knit vibe's position is classical in every history (E-SPN-0067), and no
// reading of the adopted knit gives positions the amplitudes a bound level needs. A vibe's position gets
// amplitudes only if its copy direction reads its role. THEOREM 4 (the lock on a husk line is unique): a
// role-reading copy that is covariant under the turns that keep a husk line (the eight units over the line's
// stabilizer) has a generator of complex dimension 1, zero on the role's line and a traceless involution on the
// doublet: the copy moves the doublet's two eigenvectors one dock each way and leaves the line, which is the locked
// token and nothing else (E-SPN-0066's twirl, now on the line's own stabilizer, a weaker condition). So stand-in
// (a) is not removed: it is reduced to one named rule, "a vibe's copy direction is its role's doublet", which the
// adopted knit does not run. Stand-in (b) is removed below.
//
// PREDICTIONS, written before this file ran (a disclosed mechanics probe, tmp/reel-probe1.ts, checked the rule's
// permutation on two small Gauss sectors, the exact runs against the float runner, and the Bloch sizes, and found
// that a swap of the roles alone does not commute with relabeling three tokens whose reels differ; the meeting's
// swap was then made to exchange role and reel together, which is 2 omega on every antisymmetric state as before).
// H1 Theorem 1 exhaustively: for every predicate on w-link windows (Z_3 flux, w = 1 and 2: 8 and 512 predicates;
//    Z_5 column flux, w = 1: 32), over the love-fear pair both ways round (length r = 0 .. 3w + 4) and three loves
//    (gaps u, v = 0 .. 3w + 4), the allowed set never changes with r (or with u at fixed v, or v at fixed u) once
//    the length is at least w: 0 violations.
// H2 Theorem 2 on E-SPN-0075's own rule (code/rule/flux-store-line) over its reach sets (the pair under C, D = 1 to
//    4 on ring 4D + 3, three loves D = 1 to 3): changing only the doublet label of a token at ring distance >= 2
//    changes another token's copy (made or bounced) on some state at every D, and for the pair the farthest such
//    token is exactly 2D away.
// H3 The reel rule is local: the same test (other tokens' labels AND reels changed, every value) finds 0 changes,
//    over the reel rule's reach sets (the same cases) and over the whole Gauss sector of the pair on ring 5 (D = 1)
//    and three loves on ring 4 (D = 1).
// H4 The reel rule is a reversible integer rule: on the whole Gauss sector (every position, label, reel and
//    background flux; the pair on rings 6 and 7 with D = 1 and 2, three loves on rings 4 and 5 with D = 1 and 2)
//    the stream is a permutation with flip . stream . flip its inverse, keeps Gauss mod 3, and keeps sum r + 2 l;
//    no group on any reached state (H5's) fails to split its change into whole half-links.
// H5 The capacity: from contact under every label choice, the reached configurations have l <= floor(n D / 2)
//    with that maximum reached, sum r + 2 l = 0 and Gauss on every one: the pair D = 1 to 4, three loves D = 1 to 3.
// H6 Exact with the cost (c = N, M = 2 N^2): the pair (ring 9, D = 2, 12 beats) and three loves (ring 7, D = 1,
//    6 beats) run exactly in Eisenstein integers and equal the float runner (code/measure/reel-run) to 1e-12; the
//    norms sum to den^2, the exact inverse returns the start, every supported register holds Gauss and
//    sum r + 2 l = 0.
// H7 Theorem 4: for each husk axis, the twirl over the units keeping that axis (sign -1 where they reverse it) has
//    an image of complex dimension 1, under 1e-12 on the line's row and column, whose doublet block is traceless
//    with square proportional to 1 (to 1e-12).
//
// Gates, fixed with the predictions: H1 .. H7. Status pass if all hold.
// START FAMILY: nothing here reads a color link (E-SPN-0082 runs the 17 starts where the field enters). HUSK: one
// husk line, every number a husk number; the reels are the bulk columns under the tokens' slots.
// THE FEAR'S STREAM SIGN: C (the user's choice, 2026-09-26) only; three loves hold no fear.
//
// Depth L1 for theorems 1, 2 and 4 (exhaustive or exact), L2 for the rule (a constructed stand-in).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import * as portStore from '@/code/rule/flux-store-line'
import {
  decodeRegisters,
  encodeRegisters,
  gaussHolds,
  placedRegisters,
  reelSum,
  streamIndex,
  streamIndexBack,
  streamRegisters,
  stringCount,
  type ReelRegisters,
  type ReelSpec,
} from '@/code/rule/reel-string-line'
import { stepTable, type Vibe } from '@/code/rule/locked-token-line'
import { antisymmetrizedReels, reelExactCheck } from '@/code/measure/reel-exact'
import { unitRotations } from '@/code/measure/token-gates'

const mod = (a: number, m: number): number => ((a % m) + m) % m
const chargeOf = (k: Vibe): number => (k === 'love' ? 1 : -1)
const ringDistance = (L: number, a: number, b: number): number => Math.min(mod(a - b, L), mod(b - a, L))

// ---- H1: every window predicate against every string length ----
function windowTheorem(modulus: number, w: number): { predicates: number; violations: number; confineWithin: number; allowAll: number } {
  const R = 3 * w + 4
  const values = modulus ** w
  const windowCode = (f: readonly number[], at: number): number => {
    let c = 0

    for (let i = 0; i < w; i++) c = c * modulus + (f[at + i] ?? 0)

    return c
  }
  // every window a flux pattern shows, the line padded with w zero links each side
  const windowsOf = (f: readonly number[]): Set<number> => {
    const padded = [...new Array<number>(w).fill(0), ...f, ...new Array<number>(w).fill(0)]
    const out = new Set<number>()

    for (let at = 0; at + w <= padded.length; at++) out.add(windowCode(padded, at))

    return out
  }
  const pairPatterns = [1, modulus - 1].map(q => Array.from({ length: R + 1 }, (_, r) => windowsOf(new Array<number>(r).fill(q))))
  const threePatterns: Set<number>[][] = Array.from({ length: R + 1 }, (_, u) => Array.from({ length: R + 1 }, (_, v) => windowsOf([...new Array<number>(u).fill(1), ...new Array<number>(v).fill(2 % modulus)])))
  let violations = 0
  let confineWithin = 0
  let allowAll = 0
  const count = 2 ** values

  for (let p = 0; p < count; p++) {
    const allowed = (s: Set<number>): boolean => {
      for (const c of s) if (((p >> c) & 1) === 0) return false

      return true
    }

    for (const pats of pairPatterns) {
      const beyond = pats.slice(w).map(allowed)

      if (beyond.some(x => x !== beyond[0])) violations++
      if (!beyond[0] && pats.slice(0, w).some(allowed)) confineWithin++
      if (beyond[0]) allowAll++
    }

    for (let v = 0; v <= R; v++) {
      const col = threePatterns.slice(w).map(row => allowed(row[v]!))

      if (col.some(x => x !== col[0])) violations++
    }

    for (let u = 0; u <= R; u++) {
      const row = threePatterns[u]!.slice(w).map(allowed)

      if (row.some(x => x !== row[0])) violations++
    }
  }

  return { predicates: count, violations, confineWithin, allowAll }
}

// ---- reach sets (positions, flux and store, labels free) ----
type Reached<T> = { states: T[]; maxString: number }

function portReach(s: portStore.FluxStoreSpec): Reached<portStore.FluxRegisters> {
  const n = s.kinds.length
  const x0 = Math.floor(s.ring / 2)
  const start = portStore.placedRegisters(s, new Array<number>(n).fill(x0), new Array<number>(n).fill(0))
  const key = (r: portStore.FluxRegisters): number => portStore.encodeRegisters(s, { ...r, j: new Array<number>(n).fill(0) })
  const seen = new Map<number, portStore.FluxRegisters>([[key(start), start]])
  const queue = [start]
  let maxString = 0

  while (queue.length > 0) {
    const r = queue.pop()!

    maxString = Math.max(maxString, portStore.stringCount(r.f))

    for (let c = 0; c < 2 ** n; c++) {
      const out = portStore.streamRegisters(s, { ...r, j: Array.from({ length: n }, (_, t) => (c >> t) & 1) })
      const k = key(out)

      if (!seen.has(k)) {
        const norm = { ...out, j: new Array<number>(n).fill(0) }

        seen.set(k, norm)
        queue.push(norm)
      }
    }
  }

  return { states: [...seen.values()], maxString }
}

function reelReach(s: ReelSpec): Reached<ReelRegisters> & { unsplit: number; storeBroken: number; gaussBroken: number } {
  const n = s.kinds.length
  const x0 = Math.floor(s.ring / 2)
  const start = placedRegisters(s, new Array<number>(n).fill(x0), new Array<number>(n).fill(0))
  const key = (g: ReelRegisters): number => encodeRegisters(s, { ...g, j: new Array<number>(n).fill(0) })
  const seen = new Map<number, ReelRegisters>([[key(start), start]])
  const queue = [start]
  let maxString = 0
  let unsplit = 0
  let storeBroken = 0
  let gaussBroken = 0

  while (queue.length > 0) {
    const g = queue.pop()!
    const l = stringCount(g.f)

    maxString = Math.max(maxString, l)

    if (reelSum(g.r) + 2 * l !== 0) storeBroken++
    if (!gaussHolds(s, g)) gaussBroken++

    for (let c = 0; c < 2 ** n; c++) {
      const j = Array.from({ length: n }, (_, t) => (c >> t) & 1)

      unsplit += unsplitGroups(s, { ...g, j })

      const out = streamRegisters(s, { ...g, j })
      const k = key(out)

      if (!seen.has(k)) {
        const norm = { ...out, j: new Array<number>(n).fill(0) }

        seen.set(k, norm)
        queue.push(norm)
      }
    }
  }

  return { states: [...seen.values()], maxString, unsplit, storeBroken, gaussBroken }
}

// the groups whose change is not a whole number of half-links per member
function unsplitGroups(s: ReelSpec, g: ReelRegisters): number {
  const steps = g.j.map((lab, t) => stepTable(s.kinds[t]!, s.convention)[lab]!)
  const crossing = steps.map((st, t) => (st === 1 ? g.x[t]! : st === -1 ? mod(g.x[t]! - 1, s.ring) : -1))
  let bad = 0

  for (const link of new Set(crossing.filter(c => c >= 0))) {
    const group = crossing.map((c, t) => (c === link ? t : -1)).filter(t => t >= 0)
    let f = g.f[link]!

    for (const u of group) f = mod(f - steps[u]! * chargeOf(s.kinds[u]!), 3)

    const delta = (f === 0 ? 0 : 1) - (g.f[link] === 0 ? 0 : 1)

    if ((2 * delta) % group.length !== 0) bad++
  }

  return bad
}

// ---- H2, H3: does a far token's register change another token's copy? ----
type Locality = { witnesses: number; farthest: number; checked: number }

function portLocality(s: portStore.FluxStoreSpec, states: readonly portStore.FluxRegisters[]): Locality {
  const n = s.kinds.length
  let witnesses = 0
  let farthest = 0
  let checked = 0

  for (const r of states) {
    for (let c = 0; c < 2 ** n; c++) {
      const j = Array.from({ length: n }, (_, t) => (c >> t) & 1)
      const base = portStore.streamRegisters(s, { ...r, j })

      for (let t = 0; t < n; t++) {
        for (let u = 0; u < n; u++) {
          const dist = ringDistance(s.ring, r.x[t]!, r.x[u]!)

          if (u === t || dist < 2) continue

          const j2 = j.slice()

          j2[u] = 1 - j[u]!
          checked++

          const other = portStore.streamRegisters(s, { ...r, j: j2 })

          if ((other.x[t] !== r.x[t]) !== (base.x[t] !== r.x[t])) {
            witnesses++
            farthest = Math.max(farthest, dist)
          }
        }
      }
    }
  }

  return { witnesses, farthest, checked }
}

function reelLocality(s: ReelSpec, states: readonly ReelRegisters[], labels: readonly number[] = [0, 1]): Locality {
  const n = s.kinds.length
  let witnesses = 0
  let farthest = 0
  let checked = 0
  const L = labels.length

  for (const g of states) {
    for (let c = 0; c < L ** n; c++) {
      const j = Array.from({ length: n }, (_, t) => labels[Math.floor(c / L ** t) % L]!)
      const base = streamRegisters(s, { ...g, j })

      for (let t = 0; t < n; t++) {
        const moved = base.x[t] !== g.x[t] || base.j[t] === j[t]

        for (let u = 0; u < n; u++) {
          const dist = ringDistance(s.ring, g.x[t]!, g.x[u]!)

          if (u === t || dist < 2) continue

          for (const ju of labels) {
            for (let ru = -s.depth; ru <= s.depth; ru++) {
              if (ju === j[u] && ru === g.r[u]) continue

              const j2 = j.slice()
              const r2 = g.r.slice()

              j2[u] = ju
              r2[u] = ru
              checked++

              const other = streamRegisters(s, { ...g, j: j2, r: r2 })
              const movedOther = other.x[t] !== g.x[t] || other.j[t] === j2[t]

              if (movedOther !== moved || other.x[t] !== base.x[t] || other.j[t] !== base.j[t] || other.r[t] !== base.r[t]) {
                witnesses++
                farthest = Math.max(farthest, dist)
              }
            }
          }
        }
      }
    }
  }

  return { witnesses, farthest, checked }
}

// every Gauss state: positions, labels, reels and the background flux on link 0's side
function gaussSector(s: ReelSpec): ReelRegisters[] {
  const n = s.kinds.length
  const L = s.ring
  const V = 2 * s.depth + 1
  const out: ReelRegisters[] = []

  for (let p = 0; p < L ** n; p++) {
    const x = Array.from({ length: n }, (_, t) => Math.floor(p / L ** (n - 1 - t)) % L)
    const q = new Array<number>(L).fill(0)

    s.kinds.forEach((k, t) => {
      q[x[t]!] = q[x[t]!]! + chargeOf(k)
    })

    if (mod(q.reduce((a, b) => a + b, 0), 3) !== 0) continue

    for (let b = 0; b < 3; b++) {
      const f = new Array<number>(L)
      let cum = b

      for (let l = 0; l < L; l++) {
        cum += q[l]!
        f[l] = mod(cum, 3)
      }

      for (let lab = 0; lab < 3 ** n; lab++) {
        const j = Array.from({ length: n }, (_, t) => Math.floor(lab / 3 ** (n - 1 - t)) % 3)

        for (let rc = 0; rc < V ** n; rc++) {
          const r = Array.from({ length: n }, (_, t) => (Math.floor(rc / V ** (n - 1 - t)) % V) - s.depth)

          out.push({ x, j, f, r })
        }
      }
    }
  }

  return out
}

function wholeSector(s: ReelSpec): { states: number; permutation: boolean; inverse: boolean; gaussBroken: number; storeBroken: number; unsplitStates: number } {
  const states = gaussSector(s)
  const keys = new Set(states.map(g => encodeRegisters(s, g)))
  const images = new Set<number>()
  let inverse = true
  let gaussBroken = 0
  let storeBroken = 0
  let unsplitStates = 0

  for (const g of states) {
    const i = encodeRegisters(s, g)
    const j = streamIndex(s, i)
    const out = decodeRegisters(s, j)

    images.add(j)

    if (streamIndexBack(s, j) !== i) inverse = false
    if (!gaussHolds(s, out)) gaussBroken++
    if (reelSum(out.r) + 2 * stringCount(out.f) !== reelSum(g.r) + 2 * stringCount(g.f)) storeBroken++
    if (unsplitGroups(s, g) > 0) unsplitStates++
  }

  const permutation = images.size === states.length && [...images].every(k => keys.has(k))

  return { states: states.length, permutation, inverse, gaussBroken, storeBroken, unsplitStates }
}

// ---- H7: the twirl over a husk line's stabilizer ----
type C = [number, number]
type M3c = { re: Float64Array; im: Float64Array }

function lineLock(axis: number): { dimension: number; lineWorst: number; involutionGap: number; traceGap: number; units: number } {
  const units = unitRotations().filter(u => Math.abs(Math.abs(u.rotation.matrix[3 * axis + axis]!) - 1) < 1e-9)
  const rho = (spin: C[]): M3c => {
    const m: M3c = { re: new Float64Array(9), im: new Float64Array(9) }

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        m.re[i * 3 + j] = spin[i * 2 + j]![0]
        m.im[i * 3 + j] = spin[i * 2 + j]![1]
      }
    }

    m.re[8] = 1

    return m
  }
  const mul = (a: M3c, b: M3c): M3c => {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 3; j++) {
          re[i * 3 + j] = re[i * 3 + j]! + a.re[i * 3 + k]! * b.re[k * 3 + j]! - a.im[i * 3 + k]! * b.im[k * 3 + j]!
          im[i * 3 + j] = im[i * 3 + j]! + a.re[i * 3 + k]! * b.im[k * 3 + j]! + a.im[i * 3 + k]! * b.re[k * 3 + j]!
        }
      }
    }

    return { re, im }
  }
  const dagger = (a: M3c): M3c => {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        re[i * 3 + j] = a.re[j * 3 + i]!
        im[i * 3 + j] = -a.im[j * 3 + i]!
      }
    }

    return { re, im }
  }
  const twirl = (x: M3c): M3c => {
    const out: M3c = { re: new Float64Array(9), im: new Float64Array(9) }

    for (const { rotation } of units) {
      const r = rho(rotation.spin as C[])
      const s = rotation.matrix[3 * axis + axis]!
      const moved = mul(mul(r, x), dagger(r))

      for (let i = 0; i < 9; i++) {
        out.re[i] = out.re[i]! + (s * moved.re[i]!) / units.length
        out.im[i] = out.im[i]! + (s * moved.im[i]!) / units.length
      }
    }

    return out
  }
  const images: number[][] = []
  const mats: M3c[] = []
  let lineWorst = 0

  for (let e = 0; e < 9; e++) {
    for (const imaginary of [false, true]) {
      const x: M3c = { re: new Float64Array(9), im: new Float64Array(9) }

      ;(imaginary ? x.im : x.re)[e] = 1

      const y = twirl(x)

      for (let i = 0; i < 9; i++) if (Math.floor(i / 3) === 2 || i % 3 === 2) lineWorst = Math.max(lineWorst, Math.hypot(y.re[i]!, y.im[i]!))

      images.push([...y.re, ...y.im])
      mats.push(y)
    }
  }

  const basis: number[][] = []

  for (const v of images) {
    const w = [...v]

    for (const b of basis) {
      const dot = w.reduce((s, x, i) => s + x * b[i]!, 0)

      for (let i = 0; i < w.length; i++) w[i] = w[i]! - dot * b[i]!
    }

    const nrm = Math.sqrt(w.reduce((s, x) => s + x * x, 0))

    if (nrm > 1e-9) basis.push(w.map(x => x / nrm))
  }

  // the largest image: its doublet block's trace and square
  let best = mats[0]!
  let bestNorm = 0

  for (const m of mats) {
    const nrm = m.re.reduce((s, x) => s + x * x, 0) + m.im.reduce((s, x) => s + x * x, 0)

    if (nrm > bestNorm) {
      bestNorm = nrm
      best = m
    }
  }

  const sq = mul(best, best)
  const traceGap = Math.hypot(best.re[0]! + best.re[4]!, best.im[0]! + best.im[4]!)
  const lam: C = [sq.re[0]!, sq.im[0]!]
  const involutionGap = Math.max(Math.hypot(sq.re[1]!, sq.im[1]!), Math.hypot(sq.re[3]!, sq.im[3]!), Math.hypot(sq.re[4]! - lam[0], sq.im[4]! - lam[1]))

  return { dimension: basis.length / 2, lineWorst, involutionGap, traceGap, units: units.length }
}

const reelSpec = (ring: number, kinds: Vibe[], depth: number, cost = false): ReelSpec => {
  const N = 2 * depth + 1

  return { ring, kinds, convention: 'C', unlike: 'knit', depth, cost: cost ? N : 0, root: cost ? 2 * N * N : 3 }
}

const portSpec = (ring: number, kinds: Vibe[], depth: number): portStore.FluxStoreSpec => ({ ring, kinds, convention: 'C', unlike: 'knit', depth, cost: 0, root: 3 })

export default experiment({
  id: 'spin/string-held-at-ends',
  code: 'E-SPN-0081',
  title: "where the string's store can live, a STAND-IN on locked tokens on a husk line: no bound on a link's own registers confines at a range (Gauss makes every string show the same windows), the port store's bounce reads the string's far end in the same beat, so a husk-local count must sit on the charges: each token's own column is its reel, the tokens crossing a link pay its change in equal half-links, and the rule is local, reversible, integer, Gauss exact and confines at floor(n D / 2); the knit's own vibe is not a locked token (its positions are classical), and the lock is the unique covariant way to make it one",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- H1 ----
    const windows = [
      { name: 'Z3 w1', ...windowTheorem(3, 1) },
      { name: 'Z3 w2', ...windowTheorem(3, 2) },
      { name: 'Z5 w1', ...windowTheorem(5, 1) },
    ]
    const h1 = windows.every(w => w.violations === 0)

    log('h1')

    // ---- H2 ----
    const portCases = [
      ...[1, 2, 3, 4].map(D => ({ name: `pair D ${D}`, D, pair: true, spec: portSpec(4 * D + 3, ['love', 'fear'], D) })),
      ...[1, 2, 3].map(D => ({ name: `three loves D ${D}`, D, pair: false, spec: portSpec(4 * D + 3, ['love', 'love', 'love'], D) })),
    ]
    const portRows = portCases.map(c => {
      const reach = portReach(c.spec)

      return { name: c.name, D: c.D, pair: c.pair, states: reach.states.length, maxString: reach.maxString, ...portLocality(c.spec, reach.states) }
    })
    const h2 = portRows.every(r => r.witnesses > 0 && (!r.pair || r.farthest === 2 * r.D))

    log('h2')

    // ---- H3, H5 ----
    const reelCases = [
      ...[1, 2, 3, 4].map(D => ({ name: `pair D ${D}`, D, n: 2, spec: reelSpec(4 * D + 3, ['love', 'fear'], D) })),
      ...[1, 2, 3].map(D => ({ name: `three loves D ${D}`, D, n: 3, spec: reelSpec(4 * D + 3, ['love', 'love', 'love'], D) })),
    ]
    const reelRows = reelCases.map(c => {
      const reach = reelReach(c.spec)

      log(`reach ${c.name}`)

      return { name: c.name, D: c.D, n: c.n, states: reach.states.length, maxString: reach.maxString, unsplit: reach.unsplit, storeBroken: reach.storeBroken, gaussBroken: reach.gaussBroken, ...reelLocality(c.spec, reach.states) }
    })
    // the Gauss sector with labels left to the locality test, which runs every label
    const unlabeled = (s: ReelSpec): ReelRegisters[] => gaussSector(s).filter(g => g.j.every(v => v === 0))
    const sectorLocality = [
      { name: 'pair ring 5 D 1', ...reelLocality(reelSpec(5, ['love', 'fear'], 1), unlabeled(reelSpec(5, ['love', 'fear'], 1)), [0, 1, 2]) },
      { name: 'three loves ring 4 D 1', ...reelLocality(reelSpec(4, ['love', 'love', 'love'], 1), unlabeled(reelSpec(4, ['love', 'love', 'love'], 1)), [0, 1, 2]) },
    ]
    const h3 = reelRows.every(r => r.witnesses === 0 && r.checked > 0) && sectorLocality.every(r => r.witnesses === 0 && r.checked > 0)
    const h5 = reelRows.every(r => r.maxString === Math.floor((r.n * r.D) / 2) && r.storeBroken === 0 && r.gaussBroken === 0)

    log('h3 h5')

    // ---- H4 ----
    const sectors = [
      { name: 'pair ring 6 D 1', ...wholeSector(reelSpec(6, ['love', 'fear'], 1)) },
      { name: 'pair ring 7 D 2', ...wholeSector(reelSpec(7, ['love', 'fear'], 2)) },
      { name: 'three loves ring 4 D 1', ...wholeSector(reelSpec(4, ['love', 'love', 'love'], 1)) },
      { name: 'three loves ring 5 D 2', ...wholeSector(reelSpec(5, ['love', 'love', 'love'], 2)) },
    ]
    const h4 = sectors.every(w => w.permutation && w.inverse && w.gaussBroken === 0 && w.storeBroken === 0) && reelRows.every(r => r.unsplit === 0)

    log('h4')

    // ---- H6 ----
    const exactPair = reelExactCheck(reelSpec(9, ['love', 'fear'], 2, true), [{ x: [4, 4], j: [0, 1], r: [0, 0], amp: 1 }], 12)
    const exactThree = reelExactCheck(reelSpec(7, ['love', 'love', 'love'], 1, true), antisymmetrizedReels({ x: [3, 3, 4], j: [0, 1, 0], r: [0, -1, -1] }), 6)
    const exactOk = (e: typeof exactPair): boolean => e.gap < 1e-12 && e.norm && e.reverses && e.registersOk && e.merged === 0
    const h6 = exactOk(exactPair) && exactOk(exactThree)

    log('h6')

    // ---- H7 ----
    const locks = [0, 1, 2].map(a => ({ axis: a, ...lineLock(a) }))
    const h7 = locks.every(l => l.dimension === 1 && l.lineWorst < 1e-12 && l.involutionGap < 1e-12 && l.traceGap < 1e-12)

    log('h7')

    const ok = h1 && h2 && h3 && h4 && h5 && h6 && h7
    const pairPort = portRows.filter(r => r.pair)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `no bound on a link's own registers confines at a range: over every predicate on w-link windows (${windows.map(w => `${w.name}: ${w.predicates}`).join(', ')}) the allowed string lengths never change once the length reaches w (${windows.reduce((a, w) => a + w.violations, 0)} violations), because Gauss shows every long string the same windows; E-SPN-0075's port store is not husk-local: a token's copy changes with the label of a token 2 or more docks away on ${portRows.map(r => r.witnesses.toLocaleString('en-US')).join(', ')} checks (${portRows.map(r => r.name).join(', ')}), the pair's farthest at ${pairPort.map(r => r.farthest).join(', ')} = 2D; held on the charges instead, as each token's own column (its reel, the tokens crossing a link paying its change in equal half-links), the rule reads nothing past one link (0 of ${(reelRows.reduce((a, r) => a + r.checked, 0) + sectorLocality.reduce((a, r) => a + r.checked, 0)).toLocaleString('en-US')} far changes matter), permutes every Gauss sector tried (${sectors.map(w => w.states.toLocaleString('en-US')).join(', ')} states, flip . stream . flip its inverse, Gauss and sum r + 2 l kept), confines at exactly floor(n D / 2) (${reelRows.map(r => r.maxString).join(', ')}), and runs exactly in Eisenstein integers with the cost (${exactPair.gap.toExponential(1)}, ${exactThree.gap.toExponential(1)}, norm and reversal ${exactPair.norm && exactPair.reverses && exactThree.norm && exactThree.reverses}); a role-reading copy covariant under a husk line's own ${locks[0]!.units} units has a generator of dimension ${locks.map(l => l.dimension).join(', ')}, zero on the line (${Math.max(...locks.map(l => l.lineWorst)).toExponential(1)}) and a traceless involution on the doublet: the locked token is the only way the knit's vibe can move with amplitudes, and the adopted knit does not run it`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        gate_H4: h4 ? 1 : 0,
        gate_H5: h5 ? 1 : 0,
        gate_H6: h6 ? 1 : 0,
        gate_H7: h7 ? 1 : 0,
        ...Object.fromEntries(windows.flatMap(w => [[`window_${w.name.replace(/ /g, '_')}_violations`, w.violations], [`window_${w.name.replace(/ /g, '_')}_confineWithin`, w.confineWithin]])),
        ...Object.fromEntries(portRows.flatMap(r => [[`port_${r.name.replace(/ /g, '_')}_witnesses`, r.witnesses], [`port_${r.name.replace(/ /g, '_')}_farthest`, r.farthest], [`port_${r.name.replace(/ /g, '_')}_states`, r.states]])),
        ...Object.fromEntries(reelRows.flatMap(r => [[`reel_${r.name.replace(/ /g, '_')}_witnesses`, r.witnesses], [`reel_${r.name.replace(/ /g, '_')}_maxString`, r.maxString], [`reel_${r.name.replace(/ /g, '_')}_states`, r.states], [`reel_${r.name.replace(/ /g, '_')}_unsplit`, r.unsplit]])),
        ...Object.fromEntries(sectors.flatMap(w => [[`sector_${w.name.replace(/ /g, '_')}_states`, w.states], [`sector_${w.name.replace(/ /g, '_')}_unsplitStates`, w.unsplitStates]])),
        exactPairGap: exactPair.gap,
        exactThreeGap: exactThree.gap,
        exactPairBits: exactPair.bits,
        exactThreeBits: exactThree.bits,
        lineLockDimension: Math.max(...locks.map(l => l.dimension)),
        lineLockLineWorst: Math.max(...locks.map(l => l.lineWorst)),
        lineLockInvolutionGap: Math.max(...locks.map(l => l.involutionGap)),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...Object.fromEntries(sectorLocality.map(r => [`sectorLocality_${r.name.replace(/ /g, '_')}_checked`, r.checked])),
        portLocalityChecked: portRows.reduce((a, r) => a + r.checked, 0),
        reelLocalityChecked: reelRows.reduce((a, r) => a + r.checked, 0),
      },
      notes: `L1 for theorems 1, 2, 4; the reel rule L2, a STAND-IN (locked tokens on one husk line). Gates H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}, H6 ${h6}, H7 ${h7}. Windows: ${windows.map(w => `${w.name} ${w.predicates} predicates, ${w.violations} violations, ${w.confineWithin} confine only inside the window, ${w.allowAll} allow every length (per orientation)`).join('; ')}. Port store (E-SPN-0075): ${portRows.map(r => `${r.name}: ${r.states} reached, max l ${r.maxString}, ${r.witnesses} of ${r.checked} far label changes move another token's copy, farthest ${r.farthest}`).join('; ')}. Reel rule: ${reelRows.map(r => `${r.name}: ${r.states} reached, max l ${r.maxString} (floor(nD/2) = ${Math.floor((r.n * r.D) / 2)}), ${r.witnesses} of ${r.checked} far changes matter, ${r.unsplit} unsplit groups, store broken ${r.storeBroken}, Gauss broken ${r.gaussBroken}`).join('; ')}; whole Gauss sectors: ${sectorLocality.map(r => `${r.name} ${r.witnesses} of ${r.checked}`).join(', ')}. Permutation: ${sectors.map(w => `${w.name} ${w.states} states, permutation ${w.permutation}, inverse ${w.inverse}, Gauss broken ${w.gaussBroken}, store broken ${w.storeBroken}, states with an unsplittable group ${w.unsplitStates} (these bounce; they are states whose flux wraps the ring)`).join('; ')}. Exact: pair ${JSON.stringify(exactPair)}, three loves ${JSON.stringify(exactThree)}. Line lock: ${locks.map(l => `axis ${l.axis}: ${l.units} units, dimension ${l.dimension}, line ${l.lineWorst.toExponential(1)}, involution ${l.involutionGap.toExponential(1)}, trace ${l.traceGap.toExponential(1)}`).join('; ')}. MEANING: stand-in (b) is removed. The store does not need a port, and it cannot be dropped: Gauss makes the flux local and blind to length, so a local count is required, and the only husk-local place for it is on the charges. Each token's own column is its reel, the ends trade string only through its length (the yo-yo), and every decision reads one link. The range is floor(n D / 2), set by the columns under the ends (E-SPN-0075's 2D came from one column of 2D + 1 values counting whole links; here each end's column counts half-links, because two identical tokens crossing together must share). Stand-in (a) is not removed, and cannot be by reading: the adopted knit's positions are classical in every history (its stream reads slots, the fear beat reads the classical record and writes none of it, E-SPN-0067), so its vibes cannot form a bound level; the one covariant rule that gives a vibe's position amplitudes from its role is the doublet lock, dimension 1 on a husk line's own stabilizer. The locked token is therefore the unique candidate, one named rule ("a vibe's copy direction is its role's doublet") from the knit, not a derivation from it. No background vacuum is used: the construction runs on a husk line with no knit vacuum, and the obstruction to (a) is a property of the stream and the fear beat on every vacuum, including the coset-union vacuum of E-RLT-0093.`,
    })
  },
})
