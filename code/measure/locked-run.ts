// Two or three LOCKED STAND-IN tokens on a husk line in floats (E-SPN-0072 to 0074): the rule of
// code/rule/locked-token-line for n tokens, with an optional color field on the links read in each token's own
// frame, an optional wall (the paid string's bounce) and an optional phase string. Measurement code: floats stand
// for the exact Eisenstein numbers, and the exact runner checks they agree.
//
// A token's role is held in the basis (e0, e1, o) of code/rule/locked-token-line: labels 0 and 1 are the doublet,
// copied forward and back (a fear under 'Cprime' swaps them), label 2 the line, not copied. Pairs of tokens on one
// dock meet: two of one vibe through U (on the exchange-antisymmetric states identical fermions hold, U = omega), a
// love and a fear through V ('dock') or not at all ('knit' under 'C', where the opposite-slot states are orthogonal
// to Phi).
//
// THE COLOR FIELD. Link x holds a Clifford element g_x, taken to the (e0, e1, o) basis by the real orthogonal
// change of basis (a fear's by its conjugate). With G_x = g_(x-1) ... g_0 (pure gauge before any token wraps the
// ring), a token at dock x holds the frame G_x, and every piece that reads a slot reads it in that frame: the coin
// is G C G^+, the copy forward from x is g_x G_x F G_x^+ (F the forward projector), back g_(x-1)^-1 G_x B G_x^+,
// the line stays as G_x O G_x^+, and a bounce is G_x X G_x^+ (X swaps labels 0 and 1). The meetings U and V
// commute with every g (x) g and g (x) conj(g), so they need no frame. With the start written in the frame (the
// runner applies G), the field run's positions equal the no-field run's until a token crosses the ring's last link.

import { type Convention, type Vibe } from '@/code/rule/locked-token-line'
import { DOUBLET_BASIS } from '@/code/measure/locked-cluster'
import { type M3 } from '@/code/measure/token-pair-run'

export type Complex = [number, number]

const SQRT3_2 = Math.sqrt(3) / 2
const OMEGA: Complex = [-0.5, SQRT3_2]
const A: Complex = [0.25, SQRT3_2 / 2]
const B: Complex = [0.75, -SQRT3_2 / 2]

export type LockedStart = { readonly x: readonly number[]; readonly j: readonly number[]; readonly amp: Complex }

export type LockedRunOptions = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  readonly meet?: boolean
  readonly wall?: number
  readonly phaseString?: boolean
  // Clifford elements in the role basis, one per link
  readonly links?: readonly M3[]
  readonly start: readonly LockedStart[]
}

export type LockedRun = {
  readonly ring: number
  readonly n: number
  re: Float64Array
  im: Float64Array
  beat: () => void
  // probability of each position configuration (x1 L^(n-1) + ...), summed over roles
  positions: () => Float64Array
  // probability that the smallest arc holding every token has length at most `near`
  compactWeight: (near: number) => number
  // weight with some token on the line (label 2), in the frame (no-field runs only)
  lineWeight: () => number
}

type C3 = { re: Float64Array; im: Float64Array }

const zero3 = (): C3 => ({ re: new Float64Array(9), im: new Float64Array(9) })

function mul(p: C3, q: C3): C3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 3; k++) {
        const ar = p.re[3 * i + k] as number
        const ai = p.im[3 * i + k] as number
        const br = q.re[3 * k + j] as number
        const bi = q.im[3 * k + j] as number

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      out.re[3 * i + j] = sr
      out.im[3 * i + j] = si
    }
  }

  return out
}

function dagger(p: C3): C3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.re[3 * i + j] = p.re[3 * j + i] as number
      out.im[3 * i + j] = -(p.im[3 * j + i] as number)
    }
  }

  return out
}

const identity3 = (): C3 => {
  const m = zero3()

  m.re[0] = m.re[4] = m.re[8] = 1

  return m
}

// a role-basis matrix taken to the (e0, e1, o) basis: O^T g O, O's columns the doublet basis vectors
export function toLockedBasis(g: M3, conjugate: boolean): C3 {
  const out = zero3()

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 3; k++) {
          const w = (DOUBLET_BASIS[a]![i] as number) * (DOUBLET_BASIS[b]![k] as number)

          sr += w * (g.re[3 * i + k] as number)
          si += w * (conjugate ? -(g.im[3 * i + k] as number) : (g.im[3 * i + k] as number))
        }
      }

      out.re[3 * a + b] = sr
      out.im[3 * a + b] = si
    }
  }

  return out
}

// the smallest arc of the ring holding every position
export function spanOf(L: number, xs: readonly number[]): number {
  const sorted = [...xs].sort((a, b) => a - b)
  let largestGap = 0

  for (let i = 0; i < sorted.length; i++) {
    const next = i + 1 < sorted.length ? (sorted[i + 1] as number) : (sorted[0] as number) + L
    largestGap = Math.max(largestGap, next - (sorted[i] as number))
  }

  return L - largestGap
}

// the 9 x 9 meeting (U or V), index 3 j1 + j2
function meeting(kind: 'like' | 'unlike'): C3[] {
  const re = new Float64Array(81)
  const im = new Float64Array(81)

  for (let p = 0; p < 9; p++) {
    const i = Math.floor(p / 3)
    const j = p % 3

    if (kind === 'like') {
      const q = 3 * j + i

      re[p * 9 + p] = (re[p * 9 + p] as number) + (1 + OMEGA[0]) / 2
      im[p * 9 + p] = (im[p * 9 + p] as number) + OMEGA[1] / 2
      re[q * 9 + p] = (re[q * 9 + p] as number) + (1 - OMEGA[0]) / 2
      im[q * 9 + p] = (im[q * 9 + p] as number) - OMEGA[1] / 2
    } else re[p * 9 + p] = 1
  }

  if (kind === 'unlike') {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        re[4 * j * 9 + 4 * k] = (re[4 * j * 9 + 4 * k] as number) + (OMEGA[0] - 1) / 3
        im[4 * j * 9 + 4 * k] = (im[4 * j * 9 + 4 * k] as number) + OMEGA[1] / 3
      }
    }
  }

  return [{ re, im }]
}

export function lockedRun(options: LockedRunOptions): LockedRun {
  const L = options.ring
  const n = options.kinds.length
  const R = 3 ** n
  const P = L ** n
  const size = P * R
  let re = new Float64Array(size)
  let im = new Float64Array(size)
  let nre = new Float64Array(size)
  let nim = new Float64Array(size)
  const strides = Array.from({ length: n }, (_, t) => 3 ** (n - 1 - t))
  const posStrides = Array.from({ length: n }, (_, t) => L ** (n - 1 - t))
  const fwdLabel = options.kinds.map(k => (k === 'fear' && options.convention === 'Cprime' ? 1 : 0))
  const backLabel = fwdLabel.map(f => 1 - f)
  const links = options.links

  // frames per dock and vibe
  const frames: C3[][] = options.kinds.map(kind => {
    const out: C3[] = [identity3()]

    for (let x = 1; x < L; x++) out.push(links ? mul(toLockedBasis(links[x - 1] as M3, kind === 'fear'), out[x - 1] as C3) : identity3())

    return out
  })
  const linkOf = (t: number, x: number): C3 => (links ? toLockedBasis(links[x] as M3, options.kinds[t] === 'fear') : identity3())
  const projector = (label: number): C3 => {
    const m = zero3()

    m.re[4 * label] = 1

    return m
  }
  const coin = ((): C3 => {
    const m = zero3()

    m.re[0] = A[0]
    m.im[0] = A[1]
    m.re[4] = A[0]
    m.im[4] = A[1]
    m.re[1] = B[0]
    m.im[1] = B[1]
    m.re[3] = B[0]
    m.im[3] = B[1]
    m.re[8] = 1

    return m
  })()
  const swap = ((): C3 => {
    const m = zero3()

    m.re[1] = m.re[3] = m.re[8] = 1

    return m
  })()
  // per token, per dock: coin, and the three moves with their bounces
  type Moves = { coin: C3; move: [C3, C3, C3]; bounce: [C3, C3, C3] }
  const tables: Moves[][] = options.kinds.map((_, t) =>
    Array.from({ length: L }, (_, x) => {
      const G = frames[t]![x] as C3
      const Gd = dagger(G)
      const inFrame = (m: C3): C3 => mul(mul(G, m), Gd)
      const fwd = inFrame(projector(fwdLabel[t] as number))
      const back = inFrame(projector(backLabel[t] as number))
      const rest = inFrame(projector(2))
      const back1 = links ? dagger(linkOf(t, (x - 1 + L) % L)) : identity3()
      const flip = inFrame(swap)

      return {
        coin: inFrame(coin),
        move: [mul(linkOf(t, x), fwd), mul(back1, back), rest],
        bounce: [mul(flip, fwd), mul(flip, back), rest],
      }
    }),
  )
  const STEPS = [1, -1, 0] as const
  const like = meeting('like')[0] as C3
  const unlike = meeting('unlike')[0] as C3
  // the knit's love-fear meeting in the frame: V on the opposite-slot label pairs, Pi V Pi + (1 - Pi), refused
  // unless V keeps those pairs (it is unitary only then)
  const knitMeeting = (p: number, q: number): C3 => {
    const opposite = new Set<number>()

    opposite.add(3 * (fwdLabel[p] as number) + (backLabel[q] as number))
    opposite.add(3 * (backLabel[p] as number) + (fwdLabel[q] as number))

    const out = { re: new Float64Array(81), im: new Float64Array(81) }
    let leak = 0

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const inRow = opposite.has(row)
        const inCol = opposite.has(col)

        if (inRow && inCol) {
          out.re[row * 9 + col] = unlike.re[row * 9 + col] as number
          out.im[row * 9 + col] = unlike.im[row * 9 + col] as number
        } else if (!inRow && !inCol) out.re[row * 9 + col] = row === col ? 1 : 0
        else if (inCol) leak = Math.max(leak, Math.hypot(unlike.re[row * 9 + col] as number, unlike.im[row * 9 + col] as number))
      }
    }

    if (leak > 1e-12) throw new Error('the knit meeting is not closed under V with this convention')

    return out
  }
  const base9: (C3 | undefined)[][] = options.kinds.map((a, p) =>
    options.kinds.map((b, q) => {
      if (p >= q || options.meet === false) return undefined
      if (a === b) return like
      if (options.unlike === 'knit') return knitMeeting(p, q)

      return unlike
    }),
  )
  // per dock, the meeting in the lab: (G_a (x) G_b) M (G_a (x) G_b)^+
  const kron9 = (g: C3, h: C3): C3 => {
    const out = { re: new Float64Array(81), im: new Float64Array(81) }

    for (let a = 0; a < 9; a++) {
      for (let b = 0; b < 9; b++) {
        const gr = g.re[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number
        const gi = g.im[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number
        const hr = h.re[3 * (a % 3) + (b % 3)] as number
        const hi = h.im[3 * (a % 3) + (b % 3)] as number

        out.re[a * 9 + b] = gr * hr - gi * hi
        out.im[a * 9 + b] = gr * hi + gi * hr
      }
    }

    return out
  }
  const mul9 = (x: C3, y: C3, daggerY: boolean): C3 => {
    const out = { re: new Float64Array(81), im: new Float64Array(81) }

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let sr = 0
        let si = 0

        for (let k = 0; k < 9; k++) {
          const ar = x.re[i * 9 + k] as number
          const ai = x.im[i * 9 + k] as number
          const br = daggerY ? (y.re[j * 9 + k] as number) : (y.re[k * 9 + j] as number)
          const bi = daggerY ? -(y.im[j * 9 + k] as number) : (y.im[k * 9 + j] as number)

          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }

        out.re[i * 9 + j] = sr
        out.im[i * 9 + j] = si
      }
    }

    return out
  }
  const meetings: (C3[] | undefined)[][] = base9.map((row, p) =>
    row.map((m, q) => {
      if (!m) return undefined
      if (!links) return Array.from({ length: L }, () => m)

      return Array.from({ length: L }, (_, x) => {
        const k = kron9(frames[p]![x] as C3, frames[q]![x] as C3)

        return mul9(mul9(k, m, false), k, true)
      })
    }),
  )
  const decode = (code: number, out: number[]): void => {
    let c = code

    for (let t = n - 1; t >= 0; t--) {
      out[t] = c % L
      c = Math.floor(c / L)
    }
  }
  const xs = new Array<number>(n).fill(0)
  const spans = new Int32Array(P)

  for (let p = 0; p < P; p++) {
    decode(p, xs)
    spans[p] = spanOf(L, xs)
  }

  // the start, written in the frame, taken to the lab
  for (const s of options.start) {
    const p = s.x.reduce((acc, x) => acc * L + x, 0)
    const r = s.j.reduce((acc, j) => acc * 3 + j, 0)

    re[p * R + r] = (re[p * R + r] as number) + s.amp[0]
    im[p * R + r] = (im[p * R + r] as number) + s.amp[1]
  }

  const tr = new Float64Array(R)
  const ti = new Float64Array(R)
  const ur = new Float64Array(R)
  const ui = new Float64Array(R)
  // apply a 3 x 3 to token t of the role tensor (tr, ti) -> (ur, ui)
  const applyOne = (m: C3, t: number, inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array): void => {
    const st = strides[t] as number

    outR.fill(0)
    outI.fill(0)

    for (let r = 0; r < R; r++) {
      const vr = inR[r] as number
      const vi = inI[r] as number

      if (vr === 0 && vi === 0) continue

      const digit = Math.floor(r / st) % 3
      const base = r - digit * st

      for (let row = 0; row < 3; row++) {
        const mr = m.re[3 * row + digit] as number
        const mi = m.im[3 * row + digit] as number

        if (mr === 0 && mi === 0) continue

        const k = base + row * st

        outR[k] = (outR[k] as number) + mr * vr - mi * vi
        outI[k] = (outI[k] as number) + mr * vi + mi * vr
      }
    }
  }

  if (links) {
    for (let p = 0; p < P; p++) {
      decode(p, xs)

      for (let r = 0; r < R; r++) {
        tr[r] = re[p * R + r] as number
        ti[r] = im[p * R + r] as number
      }

      for (let t = 0; t < n; t++) {
        applyOne(frames[t]![xs[t] as number] as C3, t, tr, ti, ur, ui)
        tr.set(ur)
        ti.set(ui)
      }

      for (let r = 0; r < R; r++) {
        re[p * R + r] = tr[r] as number
        im[p * R + r] = ti[r] as number
      }
    }
  }

  const pairBuf = new Float64Array(18)
  const combos = 3 ** n
  const cr = new Float64Array(R)
  const ci = new Float64Array(R)
  const ys = new Array<number>(n).fill(0)

  const beat = (): void => {
    // 0 and 1: the phase string and the meetings
    for (let p = 0; p < P; p++) {
      const o = p * R

      if (options.phaseString) {
        const k = (spans[p] as number) % 3
        const ph: Complex = k === 0 ? [1, 0] : k === 1 ? OMEGA : [OMEGA[0], -OMEGA[1]]

        for (let r = 0; r < R; r++) {
          const vr = re[o + r] as number
          const vi = im[o + r] as number

          re[o + r] = ph[0] * vr - ph[1] * vi
          im[o + r] = ph[0] * vi + ph[1] * vr
        }
      }

      decode(p, xs)

      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          const list = meetings[a]![b]

          if (!list || xs[a] !== xs[b]) continue

          const m = list[xs[a] as number] as C3

          const sa = strides[a] as number
          const sb = strides[b] as number
          const others = R / 9

          for (let rest = 0; rest < others; rest++) {
            // the role index with digits a and b zero: enumerate the other digits
            let base = 0
            let c = rest

            for (let t = n - 1; t >= 0; t--) {
              if (t === a || t === b) continue

              base += (c % 3) * (strides[t] as number)
              c = Math.floor(c / 3)
            }

            for (let q = 0; q < 9; q++) {
              const idx = o + base + Math.floor(q / 3) * sa + (q % 3) * sb

              pairBuf[q] = re[idx] as number
              pairBuf[9 + q] = im[idx] as number
            }

            for (let q = 0; q < 9; q++) {
              let sr = 0
              let si = 0

              for (let k = 0; k < 9; k++) {
                const mr = m.re[q * 9 + k] as number
                const mi = m.im[q * 9 + k] as number

                sr += mr * (pairBuf[k] as number) - mi * (pairBuf[9 + k] as number)
                si += mr * (pairBuf[9 + k] as number) + mi * (pairBuf[k] as number)
              }

              const idx = o + base + Math.floor(q / 3) * sa + (q % 3) * sb

              re[idx] = sr
              im[idx] = si
            }
          }
        }
      }
    }

    // 2. the coins
    for (let p = 0; p < P; p++) {
      decode(p, xs)

      for (let r = 0; r < R; r++) {
        tr[r] = re[p * R + r] as number
        ti[r] = im[p * R + r] as number
      }

      for (let t = 0; t < n; t++) {
        applyOne(tables[t]![xs[t] as number]!.coin, t, tr, ti, ur, ui)
        tr.set(ur)
        ti.set(ui)
      }

      for (let r = 0; r < R; r++) {
        re[p * R + r] = tr[r] as number
        im[p * R + r] = ti[r] as number
      }
    }

    // 3. the stream, with the bounce
    nre.fill(0)
    nim.fill(0)

    for (let p = 0; p < P; p++) {
      decode(p, xs)

      for (let r = 0; r < R; r++) {
        tr[r] = re[p * R + r] as number
        ti[r] = im[p * R + r] as number
      }

      for (let combo = 0; combo < combos; combo++) {
        let c = combo
        const dirs: number[] = []

        for (let t = n - 1; t >= 0; t--) {
          dirs[t] = c % 3
          c = Math.floor(c / 3)
        }

        for (let t = 0; t < n; t++) ys[t] = ((((xs[t] as number) + STEPS[dirs[t] as 0 | 1 | 2]) % L) + L) % L

        const blocked = options.wall !== undefined && spanOf(L, ys) > options.wall
        let target = 0

        for (let t = 0; t < n; t++) target += (blocked ? (xs[t] as number) : (ys[t] as number)) * (posStrides[t] as number)

        cr.set(tr)
        ci.set(ti)

        for (let t = 0; t < n; t++) {
          const table = tables[t]![xs[t] as number]!
          const m = blocked ? table.bounce[dirs[t] as 0 | 1 | 2] : table.move[dirs[t] as 0 | 1 | 2]

          applyOne(m, t, cr, ci, ur, ui)
          cr.set(ur)
          ci.set(ui)
        }

        for (let r = 0; r < R; r++) {
          nre[target * R + r] = (nre[target * R + r] as number) + (cr[r] as number)
          nim[target * R + r] = (nim[target * R + r] as number) + (ci[r] as number)
        }
      }
    }

    const sr = re
    const si = im

    re = nre
    im = nim
    nre = sr
    nim = si
    run.re = re
    run.im = im
  }

  const positions = (): Float64Array => {
    const out = new Float64Array(P)

    for (let p = 0; p < P; p++) {
      let s = 0

      for (let r = 0; r < R; r++) s += (re[p * R + r] as number) ** 2 + (im[p * R + r] as number) ** 2

      out[p] = s
    }

    return out
  }
  const compactWeight = (near: number): number => {
    const pos = positions()
    let s = 0

    for (let p = 0; p < P; p++) if ((spans[p] as number) <= near) s += pos[p] as number

    return s
  }
  const lineWeight = (): number => {
    let s = 0

    for (let p = 0; p < P; p++) {
      for (let r = 0; r < R; r++) {
        let onLine = false
        let c = r

        for (let t = 0; t < n; t++) {
          if (c % 3 === 2) onLine = true
          c = Math.floor(c / 3)
        }

        if (onLine) s += (re[p * R + r] as number) ** 2 + (im[p * R + r] as number) ** 2
      }
    }

    return s
  }
  const run: LockedRun = { ring: L, n, re, im, beat, positions, compactWeight, lineWeight }

  return run
}

// antisymmetrize a start over the permutations of n identical tokens (positions and labels together)
export function antisymmetrized(input: { x: readonly number[]; j: readonly number[] }): LockedStart[] {
  const n = input.x.length
  const perms: number[][] = n === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]]
  const signs = n === 2 ? [1, -1] : [1, -1, -1, -1, 1, 1]
  const merged = new Map<string, LockedStart>()

  perms.forEach((p, k) => {
    const x = p.map(i => input.x[i] as number)
    const j = p.map(i => input.j[i] as number)
    const key = `${x.join(',')}|${j.join(',')}`
    const known = merged.get(key)
    const s = signs[k] as number

    merged.set(key, { x, j, amp: [(known?.amp[0] ?? 0) + s, 0] })
  })

  const list = [...merged.values()].filter(s => Math.abs(s.amp[0]) > 1e-12)
  const norm = Math.sqrt(list.reduce((t, s) => t + s.amp[0] ** 2, 0))

  return list.map(s => ({ ...s, amp: [s.amp[0] / norm, 0] as Complex }))
}
