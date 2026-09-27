// Three STAND-IN love tokens on a husk line meeting pairwise through the fear beat's swap phase (E-SPN-0070):
// the rule of code/rule/token-pair-line extended to three tokens, in floats, with roles (27 per configuration) and
// an optional color field on the links (fixed-frame beat), and its scalar reduction for a role channel on which
// every pairwise meeting acts as one phase.
//
// One beat: every pair of tokens on one dock in opposite slots meets through U = P_sym + omega P_anti on its two
// roles (the pairs of one dock act in a fixed order; on a channel where every U_ij is a scalar the order does not
// matter), then the fear coin on each token's slots, then the stream (slot 0 forward, slot 1 back), a love crossing
// link x forward having its role multiplied by g_x and backward by g_(x-1)^-1.
//
// Index: (((x1 L + x2) L + x3) 8 + 4 c1 + 2 c2 + c3) 27 + 9 j1 + 3 j2 + j3 (the scalar run drops the 27).
//
// Measurement code (floats stand for the exact Eisenstein numbers of the rule).

import { meetingMatrix, type M3 } from '@/code/measure/token-pair-run'

export type Complex = [number, number]

const SQRT3_2 = Math.sqrt(3) / 2
const A: Complex = [0.25, SQRT3_2 / 2]
const B: Complex = [0.75, -SQRT3_2 / 2]
const STEP = [1, -1] as const
const PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [1, 2],
]

export type TripleStart = { x: readonly [number, number, number]; c: readonly [number, number, number]; j?: readonly [number, number, number]; amp: Complex }

export type TripleRun = {
  readonly ring: number
  readonly roles: number
  re: Float64Array
  im: Float64Array
  beat: () => void
  // probability that every pair is within `near` docks on the ring
  compactWeight: (near: number) => number
  // the probability of each ring-distance triple, summed over slots and roles, as a map from (d12, d13) to weight
  positionWeights: () => Float64Array
}

// a run with roles (roles = 27) or scalar (roles = 1, every meeting multiplies by `phase`)
export function tripleRun(input: { ring: number; roles: 1 | 27; phase?: Complex; links?: readonly M3[]; start: readonly TripleStart[] }): TripleRun {
  const L = input.ring
  const R = input.roles
  const size = L * L * L * 8 * R
  let re = new Float64Array(size)
  let im = new Float64Array(size)
  let nre = new Float64Array(size)
  let nim = new Float64Array(size)
  const at = (x1: number, x2: number, x3: number, c: number): number => (((x1 * L + x2) * L + x3) * 8 + c) * R

  for (const s of input.start) {
    const j = s.j ?? [0, 0, 0]
    const i = at(s.x[0], s.x[1], s.x[2], 4 * s.c[0] + 2 * s.c[1] + s.c[2]) + (R === 27 ? 9 * j[0] + 3 * j[1] + j[2] : 0)

    re[i] = (re[i] as number) + s.amp[0]
    im[i] = (im[i] as number) + s.amp[1]
  }

  const u = meetingMatrix('like')
  const phase = input.phase ?? [-0.5, SQRT3_2]
  const links = input.links
  const inverses = links?.map(g => {
    const out = { re: new Float64Array(9), im: new Float64Array(9) }

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        out.re[3 * a + b] = g.re[3 * b + a] as number
        out.im[3 * a + b] = -(g.im[3 * b + a] as number)
      }
    }

    return out
  })
  const buf = new Float64Array(54)
  const tr = new Float64Array(27)
  const ti = new Float64Array(27)
  // apply U to the pair (p, q) of the 27 role amplitudes at offset o
  const meetPair = (o: number, p: number, q: number): void => {
    const stride = [9, 3, 1]
    const sp = stride[p] as number
    const sq = stride[q] as number
    const other = 3 - p - q
    const so = stride[other] as number

    for (let k = 0; k < 3; k++) {
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          let sr = 0
          let si = 0

          for (let a2 = 0; a2 < 3; a2++) {
            for (let b2 = 0; b2 < 3; b2++) {
              const mr = u.re[(3 * a + b) * 9 + 3 * a2 + b2] as number
              const mi = u.im[(3 * a + b) * 9 + 3 * a2 + b2] as number
              const idx = o + a2 * sp + b2 * sq + k * so
              const vr = re[idx] as number
              const vi = im[idx] as number

              sr += mr * vr - mi * vi
              si += mr * vi + mi * vr
            }
          }

          const out = a * sp + b * sq + k * so

          tr[out] = sr
          ti[out] = si
        }
      }
    }

    for (let k = 0; k < 27; k++) {
      re[o + k] = tr[k] as number
      im[o + k] = ti[k] as number
    }
  }

  const beat = (): void => {
    // 1. meetings
    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let x3 = 0; x3 < L; x3++) {
          const xs = [x1, x2, x3]

          for (let c = 0; c < 8; c++) {
            const cs = [(c >> 2) & 1, (c >> 1) & 1, c & 1]
            const o = at(x1, x2, x3, c)

            for (const [p, q] of PAIRS) {
              if (xs[p] !== xs[q] || cs[p] === cs[q]) continue

              if (R === 1) {
                const vr = re[o] as number
                const vi = im[o] as number

                re[o] = phase[0] * vr - phase[1] * vi
                im[o] = phase[0] * vi + phase[1] * vr
              } else meetPair(o, p, q)
            }
          }
        }
      }
    }

    // 2. coins
    for (let cell = 0; cell < L * L * L; cell++) {
      for (let r = 0; r < R; r++) {
        for (let k = 0; k < 8; k++) {
          buf[k] = re[(cell * 8 + k) * R + r] as number
          buf[8 + k] = im[(cell * 8 + k) * R + r] as number
        }

        for (let c = 0; c < 8; c++) {
          let sr = 0
          let si = 0

          for (let d = 0; d < 8; d++) {
            let er = 1
            let ei = 0

            for (let t = 0; t < 3; t++) {
              const cc = (c >> (2 - t)) & 1
              const dd = (d >> (2 - t)) & 1
              const f = cc === dd ? A : B
              const nr = er * f[0] - ei * f[1]

              ei = er * f[1] + ei * f[0]
              er = nr
            }

            sr += er * (buf[d] as number) - ei * (buf[8 + d] as number)
            si += er * (buf[8 + d] as number) + ei * (buf[d] as number)
          }

          buf[16 + c] = sr
          buf[24 + c] = si
        }

        for (let c = 0; c < 8; c++) {
          re[(cell * 8 + c) * R + r] = buf[16 + c] as number
          im[(cell * 8 + c) * R + r] = buf[24 + c] as number
        }
      }
    }

    // 3. stream, with the field on the roles
    nre.fill(0)
    nim.fill(0)

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let x3 = 0; x3 < L; x3++) {
          for (let c = 0; c < 8; c++) {
            const cs = [(c >> 2) & 1, (c >> 1) & 1, c & 1]
            const xs = [x1, x2, x3]
            const ys = xs.map((x, t) => (x + STEP[cs[t] as 0 | 1] + L) % L)
            const from = at(x1, x2, x3, c)
            const to = at(ys[0] as number, ys[1] as number, ys[2] as number, c)

            if (!links || R === 1) {
              for (let r = 0; r < R; r++) {
                nre[to + r] = re[from + r] as number
                nim[to + r] = im[from + r] as number
              }

              continue
            }

            // multiply each token's role factor by its crossing matrix
            for (let r = 0; r < 27; r++) {
              tr[r] = re[from + r] as number
              ti[r] = im[from + r] as number
            }

            for (let t = 0; t < 3; t++) {
              const x = xs[t] as number
              const g = cs[t] === 0 ? (links[x] as M3) : (inverses?.[(x - 1 + L) % L] as M3)
              const stride = [9, 3, 1][t] as number
              const cr = new Float64Array(27)
              const ci = new Float64Array(27)

              for (let r = 0; r < 27; r++) {
                const digit = Math.floor(r / stride) % 3
                const base = r - digit * stride

                for (let row = 0; row < 3; row++) {
                  const gr = g.re[3 * row + digit] as number
                  const gi = g.im[3 * row + digit] as number
                  const k = base + row * stride

                  cr[k] = (cr[k] as number) + gr * (tr[r] as number) - gi * (ti[r] as number)
                  ci[k] = (ci[k] as number) + gr * (ti[r] as number) + gi * (tr[r] as number)
                }
              }

              tr.set(cr)
              ti.set(ci)
            }

            for (let r = 0; r < 27; r++) {
              nre[to + r] = tr[r] as number
              nim[to + r] = ti[r] as number
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

  const ringDistance = (a: number, b: number): number => {
    const d = Math.abs(a - b)

    return Math.min(d, L - d)
  }
  const compactWeight = (near: number): number => {
    let total = 0

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        if (ringDistance(x1, x2) > near) continue

        for (let x3 = 0; x3 < L; x3++) {
          if (ringDistance(x1, x3) > near || ringDistance(x2, x3) > near) continue

          const o = at(x1, x2, x3, 0)

          for (let k = 0; k < 8 * R; k++) total += (re[o + k] as number) ** 2 + (im[o + k] as number) ** 2
        }
      }
    }

    return total
  }
  const positionWeights = (): Float64Array => {
    const out = new Float64Array(L * L)

    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        for (let x3 = 0; x3 < L; x3++) {
          const o = at(x1, x2, x3, 0)
          let p = 0

          for (let k = 0; k < 8 * R; k++) p += (re[o + k] as number) ** 2 + (im[o + k] as number) ** 2

          const key = ((x2 - x1 + L) % L) * L + ((x3 - x1 + L) % L)

          out[key] = (out[key] as number) + p
        }
      }
    }

    return out
  }
  const run: TripleRun = { ring: L, roles: R, re, im, beat, compactWeight, positionWeights }

  return run
}

// the (slots, docks) symmetrizer or antisymmetrizer of one configuration, with a role vector on (C^3)^3 that the
// caller has made symmetric or antisymmetric to match (Pauli: total antisymmetry for fermion loves)
export function symmetrizedStart(input: { x: readonly [number, number, number]; c: readonly [number, number, number]; sign: 1 | -1; role?: readonly { j: readonly [number, number, number]; amp: number }[] }): TripleStart[] {
  const perms: [number, number, number][] = [
    [0, 1, 2],
    [1, 0, 2],
    [2, 1, 0],
    [0, 2, 1],
    [1, 2, 0],
    [2, 0, 1],
  ]
  const parity = [1, -1, -1, -1, 1, 1]
  const out: TripleStart[] = []
  const role = input.role ?? [{ j: [0, 0, 0] as const, amp: 1 }]

  perms.forEach((p, k) => {
    const x: [number, number, number] = [input.x[p[0]] as number, input.x[p[1]] as number, input.x[p[2]] as number]
    const c: [number, number, number] = [input.c[p[0]] as number, input.c[p[1]] as number, input.c[p[2]] as number]
    const s = input.sign === 1 ? 1 : (parity[k] as number)

    for (const r of role) out.push({ x, c, j: r.j, amp: [s * r.amp, 0] })
  })

  // normalize
  const merged = new Map<string, TripleStart>()

  for (const s of out) {
    const key = `${s.x.join(',')}|${s.c.join(',')}|${(s.j ?? [0, 0, 0]).join(',')}`
    const known = merged.get(key)

    merged.set(key, known ? { ...known, amp: [known.amp[0] + s.amp[0], 0] } : s)
  }

  const list = [...merged.values()].filter(s => Math.abs(s.amp[0]) > 1e-12)
  const norm = Math.sqrt(list.reduce((t, s) => t + s.amp[0] ** 2, 0))

  return list.map(s => ({ ...s, amp: [s.amp[0] / norm, 0] as Complex }))
}
