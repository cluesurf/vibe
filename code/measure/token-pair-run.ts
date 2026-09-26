// The two-token rule of code/rule/token-pair-line in floats, with a color field on the line's links and the
// meeting read either in the lab frame (the fixed-frame beat) or in the tokens' own frames (the comoving beat,
// E-SPN-0062), for E-SPN-0069. Measurement code: floats stand for the exact Eisenstein numbers, and
// code/rule/token-pair-line checks the two agree.
//
// THE COLOR FIELD. Link x (dock x to dock x + 1) holds a Clifford element g_x (a 3 x 3 unitary). A love crossing it
// forward has its role multiplied by g_x, backward by g_x^-1; a fear's antirole by the conjugates. On a ring every
// field is pure gauge except its holonomy h = g_(L-1) ... g_0: with G_x = g_(x-1) ... g_0, a token at dock x that has
// wound w times around the ring holds the frame F = G_x h^w.
//
// THE TWO MEETINGS. Fixed frame: U (or V) applied to the lab roles. Comoving: the kernel translated into each
// token's own frame, (F1 (x) F2) U (F1 (x) F2)^+ (F2 conjugated for a fear). Since U commutes with A (x) A and V with
// A (x) conj(A) for every A, the two agree whenever the tokens have the same winding, and the comoving rule is,
// in the frame-fixed variables role' = F^-1 role, EXACTLY the rule with no field: its bound states cannot depend on
// the link start at all. The comoving runner tracks each token's winding mod the holonomy's order to show it.

import { type Kind } from '@/code/rule/token-pair-line'

export type Complex = [number, number]
// a 3 x 3 complex matrix, row-major
export type M3 = { re: Float64Array; im: Float64Array }

const SQRT3_2 = Math.sqrt(3) / 2
const A: Complex = [0.25, SQRT3_2 / 2]
const B: Complex = [0.75, -SQRT3_2 / 2]
const OMEGA: Complex = [-0.5, SQRT3_2]
const STEP = [1, -1] as const

export type Meeting = 'fixed' | 'comoving'

export function identity3(): M3 {
  const m = { re: new Float64Array(9), im: new Float64Array(9) }

  m.re[0] = m.re[4] = m.re[8] = 1

  return m
}

export function mul3(p: M3, q: M3): M3 {
  const out = { re: new Float64Array(9), im: new Float64Array(9) }

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

export function dagger3(p: M3): M3 {
  const out = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.re[3 * i + j] = p.re[3 * j + i] as number
      out.im[3 * i + j] = -(p.im[3 * j + i] as number)
    }
  }

  return out
}

export const conj3 = (p: M3): M3 => ({ re: Float64Array.from(p.re), im: p.im.map(x => -x) })

// the order of h up to a global phase (h^k proportional to the identity), searched to `cap`
export function projectiveOrder(h: M3, cap = 36): number {
  let p = h

  for (let k = 1; k <= cap; k++) {
    const c: Complex = [p.re[0] as number, p.im[0] as number]
    let off = 0

    for (let i = 0; i < 9; i++) {
      const want: Complex = i % 4 === 0 ? c : [0, 0]

      off = Math.max(off, Math.hypot((p.re[i] as number) - want[0], (p.im[i] as number) - want[1]))
    }

    if (off < 1e-9 && Math.hypot(c[0], c[1]) > 0.5) return k

    p = mul3(p, h)
  }

  throw new Error('holonomy order above the cap')
}

// the like (U) or unlike (V) meeting as a 9 x 9 complex matrix on |j1 j2>, index 3 j1 + j2
export function meetingMatrix(kind: Kind): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(81)
  const im = new Float64Array(81)

  for (let p = 0; p < 9; p++) {
    const i = Math.floor(p / 3)
    const j = p % 3

    if (kind === 'like') {
      // U|ij> = ((1 + w)|ij> + (1 - w)|ji>) / 2
      const q = 3 * j + i

      re[p * 9 + p] = (re[p * 9 + p] as number) + (1 + OMEGA[0]) / 2
      im[p * 9 + p] = (im[p * 9 + p] as number) + OMEGA[1] / 2
      re[q * 9 + p] = (re[q * 9 + p] as number) + (1 - OMEGA[0]) / 2
      im[q * 9 + p] = (im[q * 9 + p] as number) - OMEGA[1] / 2
    } else {
      // V = 1 + (w - 1) |Phi><Phi|, <jj|Phi><Phi|kk> = 1/3
      re[p * 9 + p] = 1
    }
  }

  if (kind === 'unlike') {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        re[4 * j * 9 + 4 * k] = (re[4 * j * 9 + 4 * k] as number) + (OMEGA[0] - 1) / 3
        im[4 * j * 9 + 4 * k] = (im[4 * j * 9 + 4 * k] as number) + OMEGA[1] / 3
      }
    }
  }

  return { re, im }
}

// (P (x) Q) M (P (x) Q)^+ for 3 x 3 P, Q and a 9 x 9 M
function conjugateMeeting(m: { re: Float64Array; im: Float64Array }, p: M3, q: M3): { re: Float64Array; im: Float64Array } {
  const kr = new Float64Array(81)
  const ki = new Float64Array(81)

  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      const pr = p.re[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number
      const pi = p.im[3 * Math.floor(a / 3) + Math.floor(b / 3)] as number
      const qr = q.re[3 * (a % 3) + (b % 3)] as number
      const qi = q.im[3 * (a % 3) + (b % 3)] as number

      kr[a * 9 + b] = pr * qr - pi * qi
      ki[a * 9 + b] = pr * qi + pi * qr
    }
  }

  const prod = (xr: Float64Array, xi: Float64Array, yr: Float64Array, yi: Float64Array): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(81)
    const im = new Float64Array(81)

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let sr = 0
        let si = 0

        for (let k = 0; k < 9; k++) {
          const ar = xr[i * 9 + k] as number
          const ai = xi[i * 9 + k] as number
          const br = yr[k * 9 + j] as number
          const bi = yi[k * 9 + j] as number

          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }

        re[i * 9 + j] = sr
        im[i * 9 + j] = si
      }
    }

    return { re, im }
  }
  const kdr = new Float64Array(81)
  const kdi = new Float64Array(81)

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      kdr[i * 9 + j] = kr[j * 9 + i] as number
      kdi[i * 9 + j] = -(ki[j * 9 + i] as number)
    }
  }

  const left = prod(kr, ki, m.re, m.im)

  return prod(left.re, left.im, kdr, kdi)
}

export type PairRun = {
  readonly ring: number
  readonly kind: Kind
  readonly windings: number
  re: Float64Array
  im: Float64Array
  beat: () => void
  // probability that the ring distance between the tokens is at most `near`
  nearWeight: (near: number) => number
  norm: () => number
}

// A two-token run. `links`: one Clifford matrix per link (undefined: no field). `meeting`: fixed or comoving.
// `start`: amplitudes on (x1, x2, c1, c2, j1, j2) at winding (0, 0).
export function pairRun(input: {
  ring: number
  kind: Kind
  links?: readonly M3[]
  meeting: Meeting
  phase?: Complex
  start: readonly { x1: number; x2: number; c1: number; c2: number; j1: number; j2: number; amp: Complex }[]
}): PairRun {
  const { ring: L, kind } = input
  const links = input.links
  const frames: M3[] = [identity3()]

  if (links) for (let x = 0; x < L; x++) frames.push(mul3(links[x] as M3, frames[x] as M3))

  const h = frames[L] ?? identity3()
  const n = links && input.meeting === 'comoving' ? projectiveOrder(h) : 1
  const block = L * L * 36
  const size = n * n * block
  let re = new Float64Array(size)
  let im = new Float64Array(size)
  let nre = new Float64Array(size)
  let nim = new Float64Array(size)
  const idx = (w1: number, w2: number, x1: number, x2: number, c1: number, c2: number, j1: number, j2: number): number =>
    (w1 * n + w2) * block + ((x1 * L + x2) * 4 + 2 * c1 + c2) * 9 + 3 * j1 + j2

  for (const s of input.start) {
    const at = idx(0, 0, s.x1, s.x2, s.c1, s.c2, s.j1, s.j2)

    re[at] = s.amp[0]
    im[at] = s.amp[1]
  }

  // the meeting matrices: base, then per (dock, w1, w2) for the comoving beat with a field
  const base = meetingMatrix(kind)

  if (input.phase && kind === 'like') {
    // a scalar contact phase in place of the fear beat (the control: phase 1 is no meeting at all)
    base.re.fill(0)
    base.im.fill(0)

    for (let p = 0; p < 9; p++) {
      base.re[p * 9 + p] = input.phase[0]
      base.im[p * 9 + p] = input.phase[1]
    }
  }

  const hPowers: M3[] = [identity3()]

  for (let k = 1; k < n; k++) hPowers.push(mul3(hPowers[k - 1] as M3, h))

  const meetings = new Map<number, { re: Float64Array; im: Float64Array }>()
  const meetingAt = (x: number, w1: number, w2: number): { re: Float64Array; im: Float64Array } => {
    if (!links || input.meeting === 'fixed') return base

    const key = (x * n + w1) * n + w2
    const known = meetings.get(key)

    if (known) return known

    const f1 = mul3(frames[x] as M3, hPowers[w1] as M3)
    const f2raw = mul3(frames[x] as M3, hPowers[w2] as M3)
    const f2 = kind === 'unlike' ? conj3(f2raw) : f2raw
    const m = conjugateMeeting(base, f1, f2)

    meetings.set(key, m)

    return m
  }

  // the link matrices for a crossing: forward over link x, back over link x - 1, for a love or (conj) a fear
  const inverses = links ? links.map(dagger3) : []
  const crossing = (x: number, c: number, fear: boolean): M3 | undefined => {
    if (!links) return undefined

    const m = c === 0 ? (links[x] as M3) : (inverses[(x - 1 + L) % L] as M3)

    return fear ? conj3(m) : m
  }
  const coin = [
    [A, B],
    [B, A],
  ]
  const tr = new Float64Array(9)
  const ti = new Float64Array(9)
  const ur = new Float64Array(9)
  const ui = new Float64Array(9)

  const beat = (): void => {
    // 1. meeting
    for (let w1 = 0; w1 < n; w1++) {
      for (let w2 = 0; w2 < n; w2++) {
        for (let x = 0; x < L; x++) {
          const m = meetingAt(x, w1, w2)

          for (const [c1, c2] of [
            [0, 1],
            [1, 0],
          ] as const) {
            const at = idx(w1, w2, x, x, c1, c2, 0, 0)

            for (let p = 0; p < 9; p++) {
              let sr = 0
              let si = 0

              for (let q = 0; q < 9; q++) {
                const mr = m.re[p * 9 + q] as number
                const mi = m.im[p * 9 + q] as number
                const vr = re[at + q] as number
                const vi = im[at + q] as number

                sr += mr * vr - mi * vi
                si += mr * vi + mi * vr
              }

              tr[p] = sr
              ti[p] = si
            }

            for (let p = 0; p < 9; p++) {
              re[at + p] = tr[p] as number
              im[at + p] = ti[p] as number
            }
          }
        }
      }
    }

    // 2. coin
    for (let cell = 0; cell < n * n * L * L; cell++) {
      const at0 = cell * 36

      for (let r = 0; r < 9; r++) {
        const vr = [0, 1, 2, 3].map(c => re[at0 + c * 9 + r] as number)
        const vi = [0, 1, 2, 3].map(c => im[at0 + c * 9 + r] as number)

        for (let c = 0; c < 4; c++) {
          let sr = 0
          let si = 0

          for (let d = 0; d < 4; d++) {
            const p = coin[c >> 1]![d >> 1]!
            const q = coin[c & 1]![d & 1]!
            const er = p[0] * q[0] - p[1] * q[1]
            const ei = p[0] * q[1] + p[1] * q[0]

            sr += er * (vr[d] as number) - ei * (vi[d] as number)
            si += er * (vi[d] as number) + ei * (vr[d] as number)
          }

          re[at0 + c * 9 + r] = sr
          im[at0 + c * 9 + r] = si
        }
      }
    }

    // 3. stream, with the field and the windings
    nre.fill(0)
    nim.fill(0)

    for (let w1 = 0; w1 < n; w1++) {
      for (let w2 = 0; w2 < n; w2++) {
        for (let x1 = 0; x1 < L; x1++) {
          for (let x2 = 0; x2 < L; x2++) {
            for (let c = 0; c < 4; c++) {
              const c1 = c >> 1
              const c2 = c & 1
              const y1 = (x1 + STEP[c1] + L) % L
              const y2 = (x2 + STEP[c2] + L) % L
              const v1 = n === 1 ? 0 : (w1 + (c1 === 0 && x1 === L - 1 ? 1 : c1 === 1 && x1 === 0 ? n - 1 : 0)) % n
              const v2 = n === 1 ? 0 : (w2 + (c2 === 0 && x2 === L - 1 ? 1 : c2 === 1 && x2 === 0 ? n - 1 : 0)) % n
              const from = idx(w1, w2, x1, x2, c1, c2, 0, 0)
              const to = idx(v1, v2, y1, y2, c1, c2, 0, 0)
              const g1 = crossing(x1, c1, false)
              const g2 = crossing(x2, c2, kind === 'unlike')

              if (!g1 || !g2) {
                for (let p = 0; p < 9; p++) {
                  nre[to + p] = re[from + p] as number
                  nim[to + p] = im[from + p] as number
                }

                continue
              }

              // R' = g1 R g2^T on the 3 x 3 array R[j1][j2]
              for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                  let sr = 0
                  let si = 0

                  for (let k = 0; k < 3; k++) {
                    const gr = g1.re[3 * i + k] as number
                    const gi = g1.im[3 * i + k] as number
                    const vr = re[from + 3 * k + j] as number
                    const vi = im[from + 3 * k + j] as number

                    sr += gr * vr - gi * vi
                    si += gr * vi + gi * vr
                  }

                  ur[3 * i + j] = sr
                  ui[3 * i + j] = si
                }
              }

              for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                  let sr = 0
                  let si = 0

                  for (let k = 0; k < 3; k++) {
                    const gr = g2.re[3 * j + k] as number
                    const gi = g2.im[3 * j + k] as number
                    const vr = ur[3 * i + k] as number
                    const vi = ui[3 * i + k] as number

                    sr += gr * vr - gi * vi
                    si += gr * vi + gi * vr
                  }

                  nre[to + 3 * i + j] = sr
                  nim[to + 3 * i + j] = si
                }
              }
            }
          }
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

  const nearWeight = (near: number): number => {
    let total = 0

    for (let w = 0; w < n * n; w++) {
      for (let x1 = 0; x1 < L; x1++) {
        for (let x2 = 0; x2 < L; x2++) {
          const d = Math.abs(x1 - x2)

          if (Math.min(d, L - d) > near) continue

          const at = w * block + (x1 * L + x2) * 36

          for (let k = 0; k < 36; k++) total += (re[at + k] as number) ** 2 + (im[at + k] as number) ** 2
        }
      }
    }

    return total
  }
  const norm = (): number => {
    let total = 0

    for (let k = 0; k < size; k++) total += (re[k] as number) ** 2 + (im[k] as number) ** 2

    return total
  }
  const run: PairRun = { ring: L, kind, windings: n, re, im, beat, nearWeight, norm }

  return run
}
