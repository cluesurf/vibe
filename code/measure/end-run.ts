// LOCKED STAND-IN tokens with the string's store at its two end ports, on a husk ring, in floats (E-SPN-0085): the
// rule of code/rule/end-store-line with an optional color field on the links read in each token's own frame, as
// code/measure/reel-run does for the reels. Measurement code: floats stand for the exact numbers.
//
// The state is held on the configurations the rule reaches from contact: positions whose arc is at most 2D, the flux
// the Gauss flux along that arc (none outside it), and the ports with rL + rR + l = 0, each in -D .. D. The ring
// must be longer than 4D + 1, so the arc is the string on every state.
//
// Every copy decision is the rule's own (code/rule/end-store-line streamRegisters), tabulated once per configuration
// and per combination of the parts' directions: the color field splits each token's role by its frame's projectors
// into forward, back and line parts, and each combination is copied or bounced as the rule decides for those labels.

import { type Vibe } from '@/code/rule/locked-token-line'
import { spanOf, toLockedBasis, type Complex } from '@/code/measure/locked-run'
import { type M3 } from '@/code/measure/token-pair-run'
import { arcFlux } from '@/code/measure/reel-run'
import { streamRegisters, type EndSpec } from '@/code/rule/end-store-line'

type C3 = { re: Float64Array; im: Float64Array }

const SQ = Math.sqrt(3) / 2
const OMEGA: Complex = [-0.5, SQ]
const A: Complex = [0.25, SQ / 2]
const B: Complex = [0.75, -SQ / 2]
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

export type EndRunOptions = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly depth: number
  readonly cost: number
  readonly root: number
  readonly links?: readonly M3[]
}

export type EndRun = {
  readonly configs: number
  readonly R: number
  re: Float64Array
  im: Float64Array
  // the configuration index of (positions, ports), or -1
  indexOf(x: readonly number[], ports: readonly number[]): number
  positionsOf(c: number): number[]
  portsOf(c: number): number[]
  stringOf(c: number): number
  place(entries: readonly { x: readonly number[]; ports: readonly number[]; j: readonly number[]; amp: Complex }[]): void
  beat(): void
  positions(): Float64Array
}

export function endRun(options: EndRunOptions): EndRun {
  const L = options.ring
  const n = options.kinds.length
  const D = options.depth
  const V = 2 * D + 1
  const S = 2 * D
  const R = 3 ** n
  const spec: EndSpec = { ring: L, kinds: options.kinds, convention: 'C', depth: D, cost: options.cost, root: options.root }

  if (L <= 2 * S + 1) throw new Error('end-run: the ring must be longer than 4D + 1')

  const P = L ** n
  const index = new Map<number, number>()
  const confPos: number[][] = []
  const confPorts: number[][] = []
  const confString: number[] = []
  const confFlux: number[][] = []
  const xs = new Array<number>(n).fill(0)
  const posCode = (x: readonly number[]): number => x.reduce((a, v) => a * L + v, 0)
  const key = (x: readonly number[], rL: number, rR: number): number => (posCode(x) * V + (rL + D)) * V + (rR + D)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % L
      c = Math.floor(c / L)
    }

    if (spanOf(L, xs) > S) continue

    const f = arcFlux(L, options.kinds, xs)
    const l = f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

    if (l > S) continue

    for (let rL = -D; rL <= D; rL++) {
      const rR = -l - rL

      if (rR < -D || rR > D) continue

      index.set(key(xs, rL, rR), confPos.length)
      confPos.push(xs.slice())
      confPorts.push([rL, rR])
      confString.push(l)
      confFlux.push(f)
    }
  }

  const count = confPos.length
  const combos = 3 ** n
  // the rule's decision for every configuration and every combination of directions: target and moved mask
  const target = new Int32Array(count * combos).fill(-1)
  const movedMask = new Int32Array(count * combos)
  const dirs = new Array<number>(n).fill(0)

  for (let c = 0; c < count; c++) {
    for (let combo = 0; combo < combos; combo++) {
      let cc = combo

      for (let t = n - 1; t >= 0; t--) {
        dirs[t] = cc % 3
        cc = Math.floor(cc / 3)
      }

      const out = streamRegisters(spec, { x: confPos[c]!, j: dirs.slice(), f: confFlux[c]!, rL: confPorts[c]![0]!, rR: confPorts[c]![1]! })
      const at = index.get(key(out.x, out.rL, out.rR))

      target[c * combos + combo] = at ?? -1

      let mask = 0

      for (let t = 0; t < n; t++) if (dirs[t] === 2 || out.j[t] === dirs[t]) mask |= 1 << t

      movedMask[c * combos + combo] = mask
    }
  }

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

  const beat = (): void => {
    if (options.cost !== 0) {
      for (let c = 0; c < count; c++) {
        const o = c * R
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

    // the like meetings: 2U's swap exchanges the two vibes' roles (the ports are the string's ends', not the vibes')
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        if (options.kinds[a] !== options.kinds[b]) continue

        nre.set(re)
        nim.set(im)

        for (let c = 0; c < count; c++) {
          const x = confPos[c]!

          if (x[a] !== x[b]) continue

          for (let r = 0; r < R; r++) {
            const ja = Math.floor(r / strides[a]!) % 3
            const jb = Math.floor(r / strides[b]!) % 3
            const r2 = r + (jb - ja) * strides[a]! + (ja - jb) * strides[b]!
            const pr = nre[c * R + r]!
            const pi = nim[c * R + r]!
            const qr = nre[c * R + r2]!
            const qi = nim[c * R + r2]!

            re[c * R + r] = SWAP_KEEP[0] * pr - SWAP_KEEP[1] * pi + SWAP_MOVE[0] * qr - SWAP_MOVE[1] * qi
            im[c * R + r] = SWAP_KEEP[0] * pi + SWAP_KEEP[1] * pr + SWAP_MOVE[0] * qi + SWAP_MOVE[1] * qr
          }
        }
      }
    }

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

        const mask = movedMask[c * combos + combo]!

        cr.set(tr)
        ci.set(ti)

        for (let t = 0; t < n; t++) {
          const table = tables[t]![x[t]!]!
          const d = dirs[t] as 0 | 1 | 2
          const m = (mask >> t) & 1 ? table.move[d] : table.bounce[d]

          applyOne(m, t, cr, ci, ur, ui)
          cr.set(ur)
          ci.set(ui)
        }

        let any = false

        for (let r = 0; r < R; r++) if (cr[r] !== 0 || ci[r] !== 0) any = true

        if (!any) continue

        const to = target[c * combos + combo]!

        if (to < 0) throw new Error('end-run: an image left the configuration list')

        for (let r = 0; r < R; r++) {
          nre[to * R + r] = nre[to * R + r]! + cr[r]!
          nim[to * R + r] = nim[to * R + r]! + ci[r]!
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

  const run: EndRun = {
    configs: count,
    R,
    re,
    im,
    indexOf: (x, ports) => index.get(key(x, ports[0]!, ports[1]!)) ?? -1,
    positionsOf: c => confPos[c]!.slice(),
    portsOf: c => confPorts[c]!.slice(),
    stringOf: c => confString[c]!,
    place: entries => {
      for (const e of entries) {
        const c = index.get(key(e.x, e.ports[0]!, e.ports[1]!))

        if (c === undefined) throw new Error('end-run: the start is not a configuration')

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
