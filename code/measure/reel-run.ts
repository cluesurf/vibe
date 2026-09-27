// LOCKED STAND-IN tokens with reels on a husk ring, in floats (E-SPN-0081, 0082): the rule of
// code/rule/reel-string-line with an optional color field on the links read in each token's own frame, as
// code/measure/locked-run does for the rule without reels. Measurement code: floats stand for the exact numbers.
//
// The state is held on the configurations the rule reaches from contact: positions whose arc (the smallest arc
// holding every token) is at most the reels' span, the flux the Gauss flux along that arc (none outside it), and the
// reels with sum -2 l. The ring must be longer than twice that span, so the arc is the string on every state.
//
// THE COLOR FIELD, as locked-run: link x holds a Clifford element g_x in the (e0, e1, o) basis, a token at dock x
// holds the frame G_x = g_(x-1) ... g_0, and every piece that reads a label reads it in that frame. Each token's
// role is split by the frame's projectors into its forward, back and line parts; each combination of parts is
// copied by the per-link groups (the same decision as the rule, read from the parts' directions) or bounced.

import { type Vibe } from '@/code/rule/locked-token-line'
import { spanOf, toLockedBasis, type Complex } from '@/code/measure/locked-run'
import { type M3 } from '@/code/measure/token-pair-run'

type C3 = { re: Float64Array; im: Float64Array }

const SQ = Math.sqrt(3) / 2
const OMEGA: Complex = [-0.5, SQ]
const A: Complex = [0.25, SQ / 2]
const B: Complex = [0.75, -SQ / 2]
const chargeOf = (kind: Vibe): number => (kind === 'love' ? 1 : -1)
const mod = (a: number, m: number): number => ((a % m) + m) % m

const zero3 = (): C3 => ({ re: new Float64Array(9), im: new Float64Array(9) })

function mul(p: C3, q: C3): C3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 3; k++) {
        sr += p.re[3 * i + k]! * q.re[3 * k + j]! - p.im[3 * i + k]! * q.im[3 * k + j]!
        si += p.re[3 * i + k]! * q.im[3 * k + j]! + p.im[3 * i + k]! * q.re[3 * k + j]!
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
      out.re[3 * i + j] = p.re[3 * j + i]!
      out.im[3 * i + j] = -p.im[3 * j + i]!
    }
  }

  return out
}

const identity3 = (): C3 => {
  const m = zero3()

  m.re[0] = m.re[4] = m.re[8] = 1

  return m
}

export type ReelRunOptions = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly depth: number
  // the cost zeta_M^(-c l) per beat (0: none)
  readonly cost: number
  readonly root: number
  readonly links?: readonly M3[]
}

export type ReelRun = {
  readonly configs: number
  readonly R: number
  re: Float64Array
  im: Float64Array
  // the configuration index of (positions, reels), or -1
  indexOf(x: readonly number[], r: readonly number[]): number
  // positions and reels of a configuration
  positionsOf(c: number): number[]
  reelsOf(c: number): number[]
  // the string count of a configuration
  stringOf(c: number): number
  // write a start given in the frame (the runner applies each token's frame)
  place(entries: readonly { x: readonly number[]; r: readonly number[]; j: readonly number[]; amp: Complex }[]): void
  beat(): void
  // probability of each ring position tuple, summed over reels and roles
  positions(): Float64Array
}

// the flux on every link, along the arc that holds every token (none outside it)
export function arcFlux(L: number, kinds: readonly Vibe[], xs: readonly number[]): number[] {
  const sorted = [...xs].sort((a, b) => a - b)
  let gapAt = sorted.length - 1
  let largest = -1

  for (let i = 0; i < sorted.length; i++) {
    const next = i + 1 < sorted.length ? sorted[i + 1]! : sorted[0]! + L
    const gap = next - sorted[i]!

    if (gap > largest) {
      largest = gap
      gapAt = i
    }
  }

  const start = sorted[(gapAt + 1) % sorted.length]!
  const f = new Array<number>(L).fill(0)
  const charge = new Array<number>(L).fill(0)

  kinds.forEach((k, t) => {
    charge[xs[t]!] = charge[xs[t]!]! + chargeOf(k)
  })

  let cum = 0

  for (let s = 0; s < L; s++) {
    const x = (start + s) % L

    cum += charge[x]!
    f[x] = mod(cum, 3)
  }

  return f
}

export function reelRun(options: ReelRunOptions): ReelRun {
  const L = options.ring
  const n = options.kinds.length
  const D = options.depth
  const V = 2 * D + 1
  const S = Math.floor((n * D) / 2)
  const R = 3 ** n

  if (L <= 2 * S + 1) throw new Error('reel-run: the ring must be longer than twice the reels span')

  const P = L ** n
  const VN = V ** n
  const index = new Map<number, number>()
  const confPos: number[][] = []
  const confReel: number[][] = []
  const confString: number[] = []
  const confFlux: number[][] = []
  const xs = new Array<number>(n).fill(0)
  const rs = new Array<number>(n).fill(0)
  const decodeP = (p: number, out: number[]): void => {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      out[t] = c % L
      c = Math.floor(c / L)
    }
  }
  const reelCode = (r: readonly number[]): number => r.reduce((a, v) => a * V + (v + D), 0)
  const posCode = (x: readonly number[]): number => x.reduce((a, v) => a * L + v, 0)

  for (let p = 0; p < P; p++) {
    decodeP(p, xs)

    if (spanOf(L, xs) > S) continue

    const f = arcFlux(L, options.kinds, xs)
    const l = f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

    if (2 * l > n * D) continue

    const walk = (t: number, need: number): void => {
      if (t === n) {
        if (need !== 0) return

        index.set(p * VN + reelCode(rs), confPos.length)
        confPos.push(xs.slice())
        confReel.push(rs.slice())
        confString.push(l)
        confFlux.push(f)

        return
      }

      for (let v = -D; v <= D; v++) {
        rs[t] = v
        walk(t + 1, need - v)
      }
    }

    walk(0, -2 * l)
  }

  const count = confPos.length
  const links = options.links
  const frames: C3[][] = options.kinds.map(kind => {
    const out: C3[] = [identity3()]

    for (let x = 1; x < L; x++) out.push(links ? mul(toLockedBasis(links[x - 1]!, kind === 'fear'), out[x - 1]!) : identity3())

    return out
  })
  const linkOf = (t: number, x: number): C3 => (links ? toLockedBasis(links[x]!, options.kinds[t] === 'fear') : identity3())
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
  type Moves = { coin: C3; move: [C3, C3, C3]; bounce: [C3, C3, C3] }
  // convention C: label 0 forward, 1 back, for loves and fears alike
  const tables: Moves[][] = options.kinds.map((_, t) =>
    Array.from({ length: L }, (_, x) => {
      const G = frames[t]![x]!
      const Gd = dagger(G)
      const inFrame = (m: C3): C3 => mul(mul(G, m), Gd)
      const fwd = inFrame(projector(0))
      const back = inFrame(projector(1))
      const rest = inFrame(projector(2))
      const back1 = links ? dagger(linkOf(t, mod(x - 1, L))) : identity3()
      const flip = inFrame(swap)

      return { coin: inFrame(coin), move: [mul(linkOf(t, x), fwd), mul(back1, back), rest], bounce: [mul(flip, fwd), mul(flip, back), rest] }
    }),
  )
  // U = (1 + omega) / 2 + (1 - omega) / 2 SWAP
  const SWAP_KEEP: Complex = [(1 + OMEGA[0]) / 2, OMEGA[1] / 2]
  const SWAP_MOVE: Complex = [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2]
  const strides = Array.from({ length: n }, (_, t) => 3 ** (n - 1 - t))
  let re = new Float64Array(count * R)
  let im = new Float64Array(count * R)
  let nre = new Float64Array(count * R)
  let nim = new Float64Array(count * R)
  const tr = new Float64Array(R)
  const ti = new Float64Array(R)
  const ur = new Float64Array(R)
  const ui = new Float64Array(R)
  const cr = new Float64Array(R)
  const ci = new Float64Array(R)
  const applyOne = (m: C3, t: number, inR: Float64Array, inI: Float64Array, outR: Float64Array, outI: Float64Array): void => {
    const st = strides[t]!

    outR.fill(0)
    outI.fill(0)

    for (let r = 0; r < R; r++) {
      const vr = inR[r]!
      const vi = inI[r]!

      if (vr === 0 && vi === 0) continue

      const digit = Math.floor(r / st) % 3
      const base = r - digit * st

      for (let row = 0; row < 3; row++) {
        const mr = m.re[3 * row + digit]!
        const mi = m.im[3 * row + digit]!

        if (mr === 0 && mi === 0) continue

        const k = base + row * st

        outR[k] = outR[k]! + mr * vr - mi * vi
        outI[k] = outI[k]! + mr * vi + mi * vr
      }
    }
  }
  const STEPS = [1, -1, 0] as const
  const combos = 3 ** n
  const dirs = new Array<number>(n).fill(0)
  const moved = new Array<boolean>(n).fill(false)
  const ys = new Array<number>(n).fill(0)
  const nr = new Array<number>(n).fill(0)

  // the per-link groups on the ring (the rule's decision), for the parts' directions
  const decide = (c: number): void => {
    const x = confPos[c]!
    const r = confReel[c]!
    const f = confFlux[c]!
    const crossing = dirs.map((dd, t) => (dd === 0 ? x[t]! : dd === 1 ? mod(x[t]! - 1, L) : -1))
    const done = new Array<boolean>(n).fill(false)

    for (let t = 0; t < n; t++) {
      ys[t] = x[t]!
      nr[t] = r[t]!
      moved[t] = false
    }

    for (let t = 0; t < n; t++) {
      if (done[t] || crossing[t]! < 0) continue

      const link = crossing[t]!
      const group: number[] = []

      for (let u = 0; u < n; u++) if (crossing[u] === link) group.push(u)

      group.forEach(u => {
        done[u] = true
      })

      let fNew = f[link]!

      for (const u of group) fNew = mod(fNew - STEPS[dirs[u] as 0 | 1 | 2] * chargeOf(options.kinds[u]!), 3)

      const delta = (fNew === 0 ? 0 : 1) - (f[link] === 0 ? 0 : 1)
      const k = group.length
      const whole = (2 * delta) % k === 0
      const share = whole ? (2 * delta) / k : 0
      const fits = whole && group.every(u => r[u]! - share >= -D && r[u]! - share <= D)

      if (!fits) continue

      for (const u of group) {
        ys[u] = mod(x[u]! + STEPS[dirs[u] as 0 | 1 | 2], L)
        nr[u] = r[u]! - share
        moved[u] = true
      }
    }
  }

  const beat = (): void => {
    // cost and meetings
    for (let c = 0; c < count; c++) {
      const o = c * R

      if (options.cost !== 0) {
        const th = (-2 * Math.PI * ((options.cost * confString[c]!) % options.root)) / options.root
        const cs = Math.cos(th)
        const sn = Math.sin(th)

        for (let r = 0; r < R; r++) {
          const vr = re[o + r]!
          const vi = im[o + r]!

          re[o + r] = cs * vr - sn * vi
          im[o + r] = cs * vi + sn * vr
        }
      }
    }

    // the like meetings: 2U's swap exchanges the two vibes' roles and reels together (U commutes with g (x) g, so
    // it needs no frame), pairs in index order as the rule applies them
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        if (options.kinds[a] !== options.kinds[b]) continue

        nre.set(re)
        nim.set(im)

        for (let c = 0; c < count; c++) {
          const x = confPos[c]!

          if (x[a] !== x[b]) continue

          const sr = confReel[c]!.slice()

          sr[a] = confReel[c]![b]!
          sr[b] = confReel[c]![a]!

          const c2 = index.get(posCode(x) * VN + reelCode(sr))!

          for (let r = 0; r < R; r++) {
            const ja = Math.floor(r / strides[a]!) % 3
            const jb = Math.floor(r / strides[b]!) % 3
            const r2 = r + (jb - ja) * strides[a]! + (ja - jb) * strides[b]!
            const pr = nre[c * R + r]!
            const pi = nim[c * R + r]!
            const qr = nre[c2 * R + r2]!
            const qi = nim[c2 * R + r2]!

            re[c * R + r] = SWAP_KEEP[0] * pr - SWAP_KEEP[1] * pi + SWAP_MOVE[0] * qr - SWAP_MOVE[1] * qi
            im[c * R + r] = SWAP_KEEP[0] * pi + SWAP_KEEP[1] * pr + SWAP_MOVE[0] * qi + SWAP_MOVE[1] * qr
          }
        }
      }
    }

    // coins
    for (let c = 0; c < count; c++) {
      const x = confPos[c]!

      for (let r = 0; r < R; r++) {
        tr[r] = re[c * R + r]!
        ti[r] = im[c * R + r]!
      }

      for (let t = 0; t < n; t++) {
        applyOne(tables[t]![x[t]!]!.coin, t, tr, ti, ur, ui)
        tr.set(ur)
        ti.set(ui)
      }

      for (let r = 0; r < R; r++) {
        re[c * R + r] = tr[r]!
        im[c * R + r] = ti[r]!
      }
    }

    // stream
    nre.fill(0)
    nim.fill(0)

    for (let c = 0; c < count; c++) {
      const x = confPos[c]!

      for (let r = 0; r < R; r++) {
        tr[r] = re[c * R + r]!
        ti[r] = im[c * R + r]!
      }

      for (let combo = 0; combo < combos; combo++) {
        let cc = combo

        for (let t = n - 1; t >= 0; t--) {
          dirs[t] = cc % 3
          cc = Math.floor(cc / 3)
        }

        decide(c)

        const target = index.get(posCode(ys) * VN + reelCode(nr))

        cr.set(tr)
        ci.set(ti)

        for (let t = 0; t < n; t++) {
          const table = tables[t]![x[t]!]!
          const d = dirs[t] as 0 | 1 | 2
          const m = d === 2 || moved[t] ? table.move[d] : table.bounce[d]

          applyOne(m, t, cr, ci, ur, ui)
          cr.set(ur)
          ci.set(ui)
        }

        let any = false

        for (let r = 0; r < R; r++) if (cr[r] !== 0 || ci[r] !== 0) any = true

        if (!any) continue

        if (target === undefined) throw new Error('reel-run: an image left the configuration list')

        for (let r = 0; r < R; r++) {
          nre[target * R + r] = nre[target * R + r]! + cr[r]!
          nim[target * R + r] = nim[target * R + r]! + ci[r]!
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

  const run: ReelRun = {
    configs: count,
    R,
    re,
    im,
    indexOf: (x, r) => index.get(posCode(x) * VN + reelCode(r)) ?? -1,
    positionsOf: c => confPos[c]!.slice(),
    reelsOf: c => confReel[c]!.slice(),
    stringOf: c => confString[c]!,
    place: entries => {
      for (const e of entries) {
        const c = index.get(posCode(e.x) * VN + reelCode(e.r))

        if (c === undefined) throw new Error('reel-run: the start is not a configuration')

        tr.fill(0)
        ti.fill(0)
        tr[e.j.reduce((a, v) => a * 3 + v, 0)] = e.amp[0]
        ti[e.j.reduce((a, v) => a * 3 + v, 0)] = e.amp[1]

        if (links) {
          for (let t = 0; t < n; t++) {
            applyOne(frames[t]![e.x[t]!]!, t, tr, ti, ur, ui)
            tr.set(ur)
            ti.set(ui)
          }
        }

        for (let r = 0; r < R; r++) {
          run.re[c * R + r] = run.re[c * R + r]! + tr[r]!
          run.im[c * R + r] = run.im[c * R + r]! + ti[r]!
        }
      }
    },
    beat,
    positions: () => {
      const out = new Float64Array(P)

      for (let c = 0; c < count; c++) {
        let s = 0

        for (let r = 0; r < R; r++) s += run.re[c * R + r]! ** 2 + run.im[c * R + r]! ** 2

        const p = posCode(confPos[c]!)

        out[p] = out[p]! + s
      }

      return out
    },
  }

  return run
}
