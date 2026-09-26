// Three loves of the DOUBLET-LOCKED KNIT itself (code/rule/doublet-locked-knit), not stand-in tokens: each love on one of
// the 24 slots of a bulk D4 dock, its copy direction the slot's root (the lock: a line's first slot is the doublet's
// forward vector, its second slot the backward one, the scalar line never held). Used by E-SPN-0088 and E-SPN-0089.
//
// WHAT THE RULE DOES TO A LOVE-ONLY CLUSTER, read off code/rule/doublet-locked-knit piece by piece:
//   meeting    two loves on the two slots of one line of one dock: 2U keeps the occupation and keeps or exchanges the
//              two points (a phase w where the points agree). The OCCUPATION is the same in every term.
//   collision  the pair move needs a love and a fear on one line (never, here); the coin piece is the lone-bounce
//              permutation of the dock's slots, computed from the dock's occupation alone (bouncePermutation, 'lone').
//   stream     each slot's vibe copied one dock along its root.
// So the occupation of a love-only cluster is carried by a DETERMINISTIC map of occupations, the same in every branch
// of the superposition and on every link start (the links move points, never slots). Everything this file computes
// about occupations is therefore exact integer bookkeeping. The points are measured separately in the experiments,
// with the real rule (lockedBeat), where they matter.
//
// THE PATCH. The husk directions are infinite; the depth (x4) is periodic with period 2 L, the column of a D4 box of
// side L (code/measure/photon-husk: a husk dock is a column of L bulk docks, x4 of one parity mod 2 L). No other
// period is imposed, so a cluster is compact when it stays compact, not because a box holds it.
//
// THE LIGHT'S FLUX (the drift cost's register). Each husk link carries one center-flux trit, the column sum of its bulk
// links mod 3 (the E-SPN-0075 register read on the husk, E-FRC-0168's column sum). A love's copy along a root whose
// husk shadow is +v_k records -1 on the husk link (column, k); along a shadow -v_k it records +1 on the link
// (column - v_k, k). Gauss mod 3 then holds after every beat: sum of out-links minus in-links at a husk dock = the
// column's love count, mod 3. The drift cost multiplies by zeta_(2N)^(-l) per beat, l the number of husk links with
// nonzero flux (E-SPN-0086's cost, the drift phase per flux link). No link holds anything but the trit the light
// already holds.
//
// NOTHING MOVES: the stream copies each slot's value one dock along; the flux is a relation of the columns at its ends.
// NO ROUNDING, NO FLOAT in anything here except the readings marked MEASUREMENT (the spin share, the energies).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { HUSK_VECTORS } from '@/code/measure/photon-husk'

const ROOTS = rootsD4()

export const R = [0, 1, 2, 3].map(k => Int32Array.from(ROOTS, r => r[k] ?? 0))
export const OPP = Int32Array.from(OPPOSITE)
export const LINE = Int32Array.from(LINE_OF)
// the slot's doublet label: 0 on a line's first slot (copied forward), 1 on its second
export const LABEL = Int8Array.from(SIDE, s => (s === 1 ? 0 : 1))

// each root's husk shadow as (direction index into HUSK_VECTORS, sign)
export const SHADOW_DIR = new Int8Array(24)
export const SHADOW_SIGN = new Int8Array(24)

for (let d = 0; d < 24; d++) {
  const s = [R[0]![d]!, R[1]![d]!, R[2]![d]!]
  const k = HUSK_VECTORS.findIndex(v => v.every((x, i) => x === s[i]))
  const m = HUSK_VECTORS.findIndex(v => v.every((x, i) => x === -s[i]!))

  if (k < 0 && m < 0) throw new Error('knit-love-cluster: a root casts no husk direction')

  SHADOW_DIR[d] = k >= 0 ? k : m
  SHADOW_SIGN[d] = k >= 0 ? 1 : -1
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---------------------------------------------------------------------------------------------------------
// the cluster: n loves, positions x (n x 4, D4 integer vectors, x4 kept in [0, 2L)), slots d

export type Cluster = { n: number; x: Int32Array; d: Int8Array }

export const cloneCluster = (c: Cluster): Cluster => ({ n: c.n, x: Int32Array.from(c.x), d: Int8Array.from(c.d) })

export function makeCluster(pos: readonly (readonly number[])[], slots: readonly number[], depth: number): Cluster {
  const n = slots.length
  const x = new Int32Array(4 * n)

  for (let t = 0; t < n; t++) {
    const p = pos[t]!

    if ((p[0]! + p[1]! + p[2]! + p[3]!) % 2 !== 0) throw new Error('knit-love-cluster: a position is not a D4 vector')

    x[4 * t] = p[0]!
    x[4 * t + 1] = p[1]!
    x[4 * t + 2] = p[2]!
    x[4 * t + 3] = mod(p[3]!, 2 * depth)
  }

  return { n, x, d: Int8Array.from(slots) }
}

const sameDock = (c: Cluster, a: number, b: number): boolean =>
  c.x[4 * a] === c.x[4 * b] && c.x[4 * a + 1] === c.x[4 * b + 1] && c.x[4 * a + 2] === c.x[4 * b + 2] && c.x[4 * a + 3] === c.x[4 * b + 3]

// the flux register: husk link (column, direction k) -> trit in {1, 2} (absent = 0)
export type Flux = Map<number, number>

const OFF = 512
const SPAN = 1024

export const linkKey = (c0: number, c1: number, c2: number, k: number): number => (((c0 + OFF) * SPAN + (c1 + OFF)) * SPAN + (c2 + OFF)) * 9 + k

export function linkOf(key: number): [number, number, number, number] {
  const k = key % 9
  let r = (key - k) / 9
  const c2 = (r % SPAN) - OFF

  r = (r - (r % SPAN)) / SPAN

  const c1 = (r % SPAN) - OFF
  const c0 = (r - (r % SPAN)) / SPAN - OFF

  return [c0, c1, c2, k]
}

function addFlux(f: Flux, key: number, v: number): void {
  const w = mod((f.get(key) ?? 0) + v, 3)

  if (w === 0) f.delete(key)
  else f.set(key, w)
}

export type BeatTally = { meetings: number }

const ARR = new Int8Array(24)
const PERM = new Int32Array(24)
const DONE = new Uint8Array(64)

// ONE BEAT of the rule on the cluster's occupation (meeting, collision, stream), the flux recorded when given.
// Returns the number of like meetings (two loves on the two slots of one line of one dock, before the collision).
export function clusterBeat(c: Cluster, depth: number, flux?: Flux): number {
  const n = c.n
  let meetings = 0

  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (sameDock(c, a, b) && OPP[c.d[a]!] === c.d[b]) meetings++

  // the collision, dock by dock
  DONE.fill(0, 0, n)

  for (let a = 0; a < n; a++) {
    if (DONE[a]) continue

    ARR.fill(0)
    ARR[c.d[a]!] = 1

    for (let b = a + 1; b < n; b++) if (!DONE[b] && sameDock(c, a, b)) ARR[c.d[b]!] = 1

    const kind = bouncePermutation(BOUNCE_TABLE, 'lone', ARR, 0, PERM)

    for (let b = a; b < n; b++) {
      if (DONE[b] || (b !== a && !sameDock(c, a, b))) continue

      DONE[b] = 1

      if (kind !== 0) c.d[b] = PERM[c.d[b]!]!
    }
  }

  // the stream, with the recorded hop
  for (let t = 0; t < n; t++) {
    const d = c.d[t]!

    if (flux) {
      const k = SHADOW_DIR[d]!

      if (SHADOW_SIGN[d] === 1) addFlux(flux, linkKey(c.x[4 * t]!, c.x[4 * t + 1]!, c.x[4 * t + 2]!, k), -1)
      else {
        const v = HUSK_VECTORS[k]!

        addFlux(flux, linkKey(c.x[4 * t]! - v[0]!, c.x[4 * t + 1]! - v[1]!, c.x[4 * t + 2]! - v[2]!, k), 1)
      }
    }

    c.x[4 * t] = c.x[4 * t]! + R[0]![d]!
    c.x[4 * t + 1] = c.x[4 * t + 1]! + R[1]![d]!
    c.x[4 * t + 2] = c.x[4 * t + 2]! + R[2]![d]!
    c.x[4 * t + 3] = mod(c.x[4 * t + 3]! + R[3]![d]!, 2 * depth)
  }

  return meetings
}

// ---------------------------------------------------------------------------------------------------------
// the Gauss flux of a placement (no flux at infinity): a string of +1 from each love's column to love 0's column,
// along x1, then x2, then x3 (the total love count is 0 mod 3, so love 0's column closes the strings)

export function gaussStrings(c: Cluster): Flux {
  const f: Flux = new Map()
  const r = [c.x[0]!, c.x[1]!, c.x[2]!]

  for (let t = 1; t < c.n; t++) {
    const a = [c.x[4 * t]!, c.x[4 * t + 1]!, c.x[4 * t + 2]!]

    for (let k = 0; k < 3; k++) {
      while (a[k] !== r[k]) {
        const s = a[k]! < r[k]! ? 1 : -1
        const b = a.slice()

        b[k] = a[k]! + s

        // outflow +1 from a to b
        if (s === 1) addFlux(f, linkKey(a[0]!, a[1]!, a[2]!, k), 1)
        else addFlux(f, linkKey(b[0]!, b[1]!, b[2]!, k), -1)

        a[k] = b[k]!
      }
    }
  }

  if (c.n % 3 !== 0) throw new Error('knit-love-cluster: the loves are not a center singlet')

  return f
}

// husk docks where out-flux minus in-flux differs from the column's love count mod 3 (checked on every dock the flux
// or the loves touch)
export function gaussViolations(c: Cluster, f: Flux): number {
  const docks = new Map<string, [number, number, number]>()
  const touch = (p: [number, number, number]): void => void docks.set(p.join(','), p)

  for (let t = 0; t < c.n; t++) touch([c.x[4 * t]!, c.x[4 * t + 1]!, c.x[4 * t + 2]!])

  for (const key of f.keys()) {
    const [a, b, e, k] = linkOf(key)
    const v = HUSK_VECTORS[k]!

    touch([a, b, e])
    touch([a + v[0]!, b + v[1]!, e + v[2]!])
  }

  let bad = 0

  for (const [x, y, z] of docks.values()) {
    let div = 0

    for (let k = 0; k < 9; k++) {
      const v = HUSK_VECTORS[k]!

      div += f.get(linkKey(x, y, z, k)) ?? 0
      div -= f.get(linkKey(x - v[0]!, y - v[1]!, z - v[2]!, k)) ?? 0
    }

    let q = 0

    for (let t = 0; t < c.n; t++) if (c.x[4 * t] === x && c.x[4 * t + 1] === y && c.x[4 * t + 2] === z) q++

    if (mod(div - q, 3) !== 0) bad++
  }

  return bad
}

// ---------------------------------------------------------------------------------------------------------
// translation classes: a relative code per love (anchor love a), sorted

const W = 128
const H = 64

function relCode(c: Cluster, a: number, t: number, depth: number): number {
  const dx0 = c.x[4 * t]! - c.x[4 * a]! + H
  const dx1 = c.x[4 * t + 1]! - c.x[4 * a + 1]! + H
  const dx2 = c.x[4 * t + 2]! - c.x[4 * a + 2]! + H
  const dx3 = mod(c.x[4 * t + 3]! - c.x[4 * a + 3]!, 2 * depth)

  return (((dx0 * W + dx1) * W + dx2) * (2 * depth) + dx3) * 24 + c.d[t]!
}

const CODES = new Float64Array(8)

// the sorted relative codes with love a as the anchor, written into out
function codesFrom(c: Cluster, a: number, depth: number, out: Float64Array): void {
  for (let t = 0; t < c.n; t++) out[t] = relCode(c, a, t, depth)

  // insertion sort (n <= 4)
  for (let i = 1; i < c.n; i++) {
    const v = out[i]!
    let j = i - 1

    while (j >= 0 && out[j]! > v) {
      out[j + 1] = out[j]!
      j--
    }

    out[j + 1] = v
  }
}

// the anchor a of c whose relative codes equal `want` (the start's, anchored at its love 0), or -1
export function matchAnchor(c: Cluster, want: Float64Array, depth: number): number {
  for (let a = 0; a < c.n; a++) {
    codesFrom(c, a, depth, CODES)

    let same = true

    for (let t = 0; t < c.n && same; t++) same = CODES[t] === want[t]

    if (same) return a
  }

  return -1
}

export function startCodes(c: Cluster, depth: number): Float64Array {
  const out = new Float64Array(c.n)

  codesFrom(c, 0, depth, out)

  return out
}

// the least sorted-code list over anchors, as a string: equal exactly for translates
export function classKey(c: Cluster, depth: number): string {
  let best = ''

  for (let a = 0; a < c.n; a++) {
    codesFrom(c, a, depth, CODES)

    const s = Array.from(CODES.subarray(0, c.n)).join(',')

    if (best === '' || s < best) best = s
  }

  return best
}

export function huskSpan(c: Cluster): number {
  let s = 0

  for (let a = 0; a < c.n; a++) {
    for (let b = a + 1; b < c.n; b++) {
      for (let k = 0; k < 3; k++) s = Math.max(s, Math.abs(c.x[4 * a + k]! - c.x[4 * b + k]!))
    }
  }

  return s
}

// ---------------------------------------------------------------------------------------------------------
// THE CENSUS: every three-love start with two loves on one bulk dock (every orbit that ever collides passes through
// one) and the third within `near` husk steps in each direction, at every depth and slot; each followed until its husk
// span passes rmax (escaped), it returns to a translate of itself (a compact cycle), or tmax beats pass (held)

export type Cycle = {
  key: string
  start: Cluster
  period: number
  // the translation over one period: husk part and depth part (mod 2L)
  shift: [number, number, number, number]
  meetings: number
  maxSpan: number
  starts: number
}

export type Census = { starts: number; escaped: number; held: number; heldExamples: Cluster[]; cycles: Cycle[]; beats: number }

export function threeLoveCensus(depth: number, near: number, rmax: number, tmax: number): Census {
  const cycles = new Map<string, Cycle>()
  const heldExamples: Cluster[] = []
  let starts = 0
  let escaped = 0
  let held = 0
  let beats = 0
  const c: Cluster = { n: 3, x: new Int32Array(12), d: new Int8Array(3) }

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = d1 + 1; d2 < 24; d2++) {
      for (let o0 = -near; o0 <= near; o0++) {
        for (let o1 = -near; o1 <= near; o1++) {
          for (let o2 = -near; o2 <= near; o2++) {
            for (let o3 = 0; o3 < 2 * depth; o3++) {
              if (mod(o0 + o1 + o2 + o3, 2) !== 0) continue

              const origin = o0 === 0 && o1 === 0 && o2 === 0 && o3 === 0

              for (let d3 = 0; d3 < 24; d3++) {
                if (origin && d3 <= d2) continue

                starts++
                c.x.fill(0)
                c.x[8] = o0
                c.x[9] = o1
                c.x[10] = o2
                c.x[11] = o3
                c.d[0] = d1
                c.d[1] = d2
                c.d[2] = d3

                const want = startCodes(c, depth)
                const x0 = [c.x[0]!, c.x[1]!, c.x[2]!, c.x[3]!]
                let meetings = 0
                let maxSpan = 0
                let outcome = 'held'

                for (let t = 1; t <= tmax; t++) {
                  meetings += clusterBeat(c, depth)
                  beats++

                  const span = huskSpan(c)

                  maxSpan = Math.max(maxSpan, span)

                  if (span > rmax) {
                    outcome = 'escaped'
                    break
                  }

                  const a = matchAnchor(c, want, depth)

                  if (a >= 0) {
                    outcome = 'cycle'

                    const shift: [number, number, number, number] = [c.x[4 * a]! - x0[0]!, c.x[4 * a + 1]! - x0[1]!, c.x[4 * a + 2]! - x0[2]!, mod(c.x[4 * a + 3]! - x0[3]!, 2 * depth)]
                    // the cycle's name: the least class key along it
                    const probe = makeCluster([[0, 0, 0, 0], [0, 0, 0, 0], [o0, o1, o2, o3]], [d1, d2, d3], depth)
                    let key = classKey(probe, depth)

                    for (let s = 1; s < t; s++) {
                      clusterBeat(probe, depth)

                      const k = classKey(probe, depth)

                      if (k < key) key = k
                    }

                    const known = cycles.get(key)

                    if (known) known.starts++
                    else cycles.set(key, { key, start: makeCluster([[0, 0, 0, 0], [0, 0, 0, 0], [o0, o1, o2, o3]], [d1, d2, d3], depth), period: t, shift, meetings, maxSpan, starts: 1 })

                    break
                  }
                }

                if (outcome === 'escaped') escaped++
                else if (outcome === 'held') {
                  held++
                  if (heldExamples.length < 8) heldExamples.push(makeCluster([[0, 0, 0, 0], [0, 0, 0, 0], [o0, o1, o2, o3]], [d1, d2, d3], depth))
                }
              }
            }
          }
        }
      }
    }
  }

  return { starts, escaped, held, heldExamples, cycles: [...cycles.values()], beats }
}

// ---------------------------------------------------------------------------------------------------------
// a cycle's flux and cost, over `periods` periods from the Gauss strings (or zero flux when every column is neutral)

export type CycleCost = {
  // l at the start of every beat, over all periods
  links: number[]
  // per period: does the flux equal the start flux translated by the period's husk shift
  closes: boolean[]
  gaussBad: number
  meetingsPerPeriod: number
  // like meetings at every beat, over all periods
  meetingsByBeat: number[]
}

function shiftedFlux(f: Flux, h: readonly number[]): Flux {
  const out: Flux = new Map()

  for (const [key, v] of f) {
    const [a, b, e, k] = linkOf(key)

    out.set(linkKey(a + h[0]!, b + h[1]!, e + h[2]!, k), v)
  }

  return out
}

const sameFlux = (a: Flux, b: Flux): boolean => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v)

export function cycleCost(start: Cluster, period: number, depth: number, periods: number): CycleCost {
  const c = cloneCluster(start)
  const f = gaussStrings(c)
  const f0 = new Map(f)
  const links: number[] = []
  const closes: boolean[] = []
  let gaussBad = gaussViolations(c, f)
  let meetings = 0
  const meetingsByBeat: number[] = []
  const x0 = [c.x[0]!, c.x[1]!, c.x[2]!]

  for (let p = 1; p <= periods; p++) {
    for (let t = 0; t < period; t++) {
      links.push(f.size)

      const m = clusterBeat(c, depth, f)

      meetings += m
      meetingsByBeat.push(m)
      gaussBad += gaussViolations(c, f)
    }

    // the translation: the anchor love now standing where love 0 stood (up to the period's shift)
    const want = startCodes(start, depth)
    const a = matchAnchor(c, want, depth)

    if (a < 0) throw new Error('knit-love-cluster: the cycle did not return')

    closes.push(sameFlux(f, shiftedFlux(f0, [c.x[4 * a]! - x0[0]!, c.x[4 * a + 1]! - x0[1]!, c.x[4 * a + 2]! - x0[2]!])))
  }

  return { links, closes, gaussBad, meetingsPerPeriod: meetings / periods, meetingsByBeat }
}

// ---------------------------------------------------------------------------------------------------------
// MEASUREMENT: the role [2,1] (natural spin one half) share of a cycle's levels, E-SPN-0071 / E-SPN-0077's reading
// carried to the knit. A love's POSITION is its (dock, line) and its LABEL the slot's doublet label, exactly the
// stand-in's (dock on the line, doublet label) when the loves share one line. The level at K = 0 with quasi-energy
// index k is the cycle's configurations with amplitudes a_(t+1) = a_t e^(-i phi_t) / lambda, lambda^T = e^(-i Phi);
// first-quantized and antisymmetrized, then the labels are symmetrized at fixed positions (the role [3] part) and the
// rest is role [2,1] (a love's label is two-valued, so there is no [1,1,1] part).

export function spinHalfShares(start: Cluster, period: number, depth: number, phases: readonly number[]): number[] {
  const configs: Cluster[] = []
  const c = cloneCluster(start)

  for (let t = 0; t < period; t++) {
    configs.push(cloneCluster(c))
    clusterBeat(c, depth)
  }

  const total = phases.reduce((s, x) => s + x, 0)
  const shares: number[] = []
  const perms: [number[], number][] = [
    [[0, 1, 2], 1],
    [[1, 0, 2], -1],
    [[2, 1, 0], -1],
    [[0, 2, 1], -1],
    [[1, 2, 0], 1],
    [[2, 0, 1], 1],
  ]

  for (let k = 0; k < period; k++) {
    // lambda = e^(-i E), E T = Phi + 2 pi k
    const E = (total + 2 * Math.PI * k) / period
    const amp = new Map<string, [number, number]>()
    let arg = 0

    configs.forEach((cf, t) => {
      if (t > 0) arg += E - phases[t - 1]!

      // positions relative to the translation-class anchor (the least dock code), so translates coincide
      const docks = [0, 1, 2].map(i => [cf.x[4 * i]!, cf.x[4 * i + 1]!, cf.x[4 * i + 2]!, cf.x[4 * i + 3]!])
      const anchorOf = docks.map(p => p.join(',')).sort()[0]!.split(',').map(Number)
      const pos = docks.map((p, i) => `${p[0]! - anchorOf[0]!}.${p[1]! - anchorOf[1]!}.${p[2]! - anchorOf[2]!}.${mod(p[3]! - anchorOf[3]!, 2 * depth)}.${LINE[cf.d[i]!]}`)
      const lab = [0, 1, 2].map(i => LABEL[cf.d[i]!]!)
      const w = 1 / Math.sqrt(6 * period)

      for (const [p, s] of perms) {
        const key = `${pos[p[0]!]}|${pos[p[1]!]}|${pos[p[2]!]}#${lab[p[0]!]}${lab[p[1]!]}${lab[p[2]!]}`
        const o = amp.get(key) ?? [0, 0]

        amp.set(key, [o[0] + s * w * Math.cos(arg), o[1] + s * w * Math.sin(arg)])
      }
    })

    let norm = 0
    let sym = 0
    const byPos = new Map<string, Map<string, [number, number]>>()

    for (const [key, v] of amp) {
      norm += v[0] * v[0] + v[1] * v[1]

      const [p, l] = key.split('#') as [string, string]
      const m = byPos.get(p) ?? new Map<string, [number, number]>()

      m.set(l, v)
      byPos.set(p, m)
    }

    for (const m of byPos.values()) {
      for (let code = 0; code < 8; code++) {
        const j = [(code >> 2) & 1, (code >> 1) & 1, code & 1]
        let sr = 0
        let si = 0

        for (const [p] of perms) {
          const v = m.get(`${j[p[0]!]}${j[p[1]!]}${j[p[2]!]}`)

          if (v) {
            sr += v[0] / 6
            si += v[1] / 6
          }
        }

        sym += sr * sr + si * si
      }
    }

    shares.push(norm > 0 ? 1 - sym / norm : Number.NaN)
  }

  return shares
}
