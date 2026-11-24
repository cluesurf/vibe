// THE READER ON FEAR CONFIGURATIONS (item vibe-roadmap-grounding-0059, grounding decision 017): item 0039's readings
// on the two-species store's configurations (code/measure/fear-store), each one 0039's operation for operation on a
// configuration with no fear and no store.
//
// F, the bound count (decision 017 section 1). F = sum over anchors X of ||(<phi_X| on the love modes, identity on the
// rest) psi||^2, phi_X 0039's level (cold-line lineReader) at anchor X. A placement counts on a configuration when each
// of its three modes holds an OPEN love (+1); a fear is never in a trio and a stored love is on no mode. The anchor dock
// must hold an open love (boundCount's anchored test, read on loves). What is left (the other loves, every open fear,
// every store trit) is the rest configuration, kept under the identity, and the cut shifts by the trio modes that wrap
// past the cut ((c + wrapped) mod 3, each trio love q = +1). The sign is the parity of the open vibes of either charge
// in the rest configuration strictly below each trio mode in line order (a store is outside the open-mode order). The
// output is keyed by (X, the rest configuration's rank in its sector, the cut left), as boundCount keys it.
//
// I's key (section 3): the LOVE PART of a configuration, which modes hold an open love and which docks hold a store
// with which trit; fears are summed out. out_rel's test: a store-free configuration whose open loves do not all sit on
// docks of one colour (x mod 2).
//
// Pure functions of a configuration. No random number.

import type { Amp, LineReader } from '@/code/measure/cold-line'
import { storeAt } from '@/code/measure/fear-line'
import { cfgOf, rankOfCfg, type FearSector } from '@/code/measure/fear-store'

// per configuration of a sector (CSR): its terms' output bases ((X * restM + rest rank) * 3), the cut shifts, the
// signed conjugate amplitudes
export type FearReaderTable = {
  readonly s: FearSector
  readonly off: Int32Array
  readonly base: Float64Array
  readonly wrapped: Uint8Array
  readonly re: Float64Array
  readonly im: Float64Array
  // the output size: anchors x rest configurations x 3 cuts
  readonly size: number
}

// the reader's terms on every configuration of s (loves counted open or stored); rest is the sector (s.loves - 3, s.fears)
export function fearReaderTable(rd: LineReader, s: FearSector, rest: FearSector): FearReaderTable {
  const { L, M } = s
  const modesAll = 2 * L

  if (!rd.closed || rd.L !== L) {
    throw new Error('fear-reader: the reader must be on the closed ring of the sector')
  }

  if (rd.width > modesAll) {
    throw new Error('fear-reader: the reader window is wider than the ring')
  }

  if (rest.L !== L || rest.loves !== s.loves - 3 || rest.fears !== s.fears) {
    throw new Error('fear-reader: the rest sector must hold 3 loves fewer and the same fears')
  }

  const off = new Int32Array(M + 1)
  const base: number[] = []
  const wrapped: number[] = []
  const re: number[] = []
  const im: number[] = []

  for (let r = 0; r < M; r++) {
    off[r] = base.length

    const c = cfgOf(s, r)

    for (let X = 0; X < rd.anchors; X++) {
      if (rd.anchored && c[2 * X] !== 1 && c[2 * X + 1] !== 1) {
        continue
      }

      // the window's love bits: bit j is mode (2X + j) mod 2L holding an open love
      let w = 0

      for (let j = 0; j < rd.width; j++) {
        if (c[(2 * X + j) % modesAll] === 1) {
          w |= 1 << j
        }
      }

      const list = rd.index[w]!

      for (let li = 0; li < list.length; li++) {
        const t = list[li]!
        const ms = rd.modes[t]!
        const o = Int8Array.from(c)
        let wr = 0

        for (const m of ms) {
          const g = 2 * X + m

          if (g >= modesAll) {
            wr++
          }

          o[g % modesAll] = 0
        }

        let parity = 0

        for (const m of ms) {
          const pm = (2 * X + m) % modesAll

          for (let i = 0; i < pm; i++) {
            parity += o[i] !== 0 ? 1 : 0
          }
        }

        const k = rankOfCfg(rest, o)

        if (k < 0) {
          throw new Error('fear-reader: a rest configuration off its sector')
        }

        const sg = parity % 2 === 0 ? 1 : -1

        base.push((X * rest.M + k) * 3)
        wrapped.push(wr)
        re.push(sg * rd.re[t]!)
        im.push(sg * rd.im[t]!)
      }
    }
  }

  off[M] = base.length

  return {
    s,
    off,
    base: Float64Array.from(base),
    wrapped: Uint8Array.from(wrapped),
    re: Float64Array.from(re),
    im: Float64Array.from(im),
    size: rd.anchors * rest.M * 3,
  }
}

// a sparse accumulator of complex amplitudes by output index
export type Sum = { slot: Map<number, number>; re: number[]; im: number[] }

export const emptySum = (): Sum => ({ slot: new Map(), re: [], im: [] })

const addTo = (x: Sum, u: number, re: number, im: number): void => {
  let k = x.slot.get(u)

  if (k === undefined) {
    k = x.re.length
    x.slot.set(u, k)
    x.re.push(0)
    x.im.push(0)
  }

  x.re[k]! += re
  x.im[k]! += im
}

const normOfSum = (x: Sum): number => {
  let w = 0

  for (let k = 0; k < x.re.length; k++) {
    w += x.re[k]! * x.re[k]! + x.im[k]! * x.im[k]!
  }

  return w
}

// F on one full column (configuration-major, cut innermost)
export function fearBound(tb: FearReaderTable, a: Amp): number {
  const acc = emptySum()
  const { M } = tb.s

  for (let r = 0; r < M; r++) {
    const o0 = tb.off[r]!
    const o1 = tb.off[r + 1]!

    if (o0 === o1) {
      continue
    }

    for (let c = 0; c < 3; c++) {
      const ar = a.re[r * 3 + c]!
      const ai = a.im[r * 3 + c]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let q = o0; q < o1; q++) {
        const tr = tb.re[q]!
        const ti = tb.im[q]!

        addTo(acc, tb.base[q]! + ((c + tb.wrapped[q]!) % 3), tr * ar - ti * ai, tr * ai + ti * ar)
      }
    }
  }

  return normOfSum(acc)
}

// F on a dense block whose row a is configuration nc[a], cut ncut[a], sign sg[a]: sum over outputs of
// sum_ab beta_a rho_ab conj(beta_b), as class-store reads it
export function fearBoundDense(
  tb: FearReaderTable,
  D: number,
  re: Float64Array,
  im: Float64Array,
  nc: Int32Array,
  ncut: Uint8Array,
  sg: Int8Array,
): number {
  const terms = new Map<number, { a: number[]; re: number[]; im: number[] }>()

  for (let a = 0; a < D; a++) {
    const r = nc[a]!

    for (let q = tb.off[r]!; q < tb.off[r + 1]!; q++) {
      const u = tb.base[q]! + ((ncut[a]! + tb.wrapped[q]!) % 3)
      let x = terms.get(u)

      if (!x) {
        x = { a: [], re: [], im: [] }
        terms.set(u, x)
      }

      x.a.push(a)
      x.re.push(sg[a]! * tb.re[q]!)
      x.im.push(sg[a]! * tb.im[q]!)
    }
  }

  let F = 0

  for (const x of terms.values()) {
    for (let i = 0; i < x.a.length; i++) {
      const ar = x.re[i]!
      const ai = x.im[i]!
      const row = x.a[i]! * D

      for (let j = 0; j < x.a.length; j++) {
        const br = x.re[j]!
        const bi = x.im[j]!
        const pr = re[row + x.a[j]!]!
        const pi = im[row + x.a[j]!]!
        const tr = ar * pr - ai * pi
        const ti = ar * pi + ai * pr

        F += tr * br + ti * bi
      }
    }
  }

  return F
}

// the love part of a configuration as a string: per dock, front love, back love, store trit
export function lovePart(c: Int8Array, L: number): string {
  let k = ''

  for (let x = 0; x < L; x++) {
    const st = c[storeAt(L, x)]!

    k += String.fromCharCode(65 + (c[2 * x + 1] === 1 ? 1 : 0) + (c[2 * x] === 1 ? 2 : 0) + 4 * (st === 0 ? 0 : st === 1 ? 1 : 2))
  }

  return k
}

// per configuration of s: its love part's id in `intern` (shared across sectors, so one distribution holds every
// (3, f) sector)
export function lovePartIds(s: FearSector, intern: Map<string, number>): Int32Array {
  const ids = new Int32Array(s.M)

  for (let r = 0; r < s.M; r++) {
    const k = lovePart(cfgOf(s, r), s.L)
    let id = intern.get(k)

    if (id === undefined) {
      id = intern.size
      intern.set(k, id)
    }

    ids[r] = id
  }

  return ids
}

// out_rel's test: store-free, and the open loves not all on docks of one colour
export function splitColour(c: Int8Array, L: number): boolean {
  let even = 0
  let odd = 0

  for (let x = 0; x < L; x++) {
    if (c[storeAt(L, x)] !== 0) {
      return false
    }

    const n = (c[2 * x] === 1 ? 1 : 0) + (c[2 * x + 1] === 1 ? 1 : 0)

    if (x % 2 === 0) {
      even += n
    } else {
      odd += n
    }
  }

  return even > 0 && odd > 0
}

export function splitColours(s: FearSector): Uint8Array {
  return Uint8Array.from({ length: s.M }, (_, r) => (splitColour(cfgOf(s, r), s.L) ? 1 : 0))
}
