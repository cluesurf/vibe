// THE MESON BEAT ON SEVERAL THREADS (E-SPN-0146). code/measure/swap-string mesonBeat is one beat of the love-fear pair
// in its relative coordinate; on a ball of radius 12 it holds 5.6e7 complex amplitudes and one thread takes about a
// second a beat. This file runs the SAME beat on worker threads over shared memory, as a measurement engine, and is
// checked against the one-thread beat entry for entry (the caller's instrument):
//
//   pieces   each worker takes a range of sites (not y = 0) and applies A (x) A (A the row of the shape table at the
//            site's string length: the mass string of E-SPN-0147, every row alike without it; with E-SPN-0148's odd-octet
//            piece A also carries gamma Pi8, the same arithmetic as swap-string applyVibe), writing the scratch tr, and adds the
//            weight whose stream target leaves the ball (absorbed) and, when asked, the center-of-mass flow
//   contact  the calling thread applies the contact map at y = 0 (and the stores), as mesonBeat does
//   stream   each worker GATHERS its own range of target sites: out(q, l, f) = tr(q + r_f - r_l, l, f) times the
//            stream phase and the string phase at q. A gather writes only its own sites, so no two threads write one
//            entry; the scatter form of mesonBeat is the same permutation read the other way, through the same
//            intermediate dock (so the ball's edge absorbs the same entries)
//
// The calling thread blocks on Atomics.wait while the workers run, so the engine is synchronous, as an experiment's run
// is. The workers are unref'd: they never keep the process alive.
//
// DETERMINISM: every sum is over a fixed range in a fixed order, so a run is reproducible bit for bit on the same
// thread count; against the one-thread beat the entries agree to rounding (the flow and absorbed sums are summed in
// another order). NOTHING MOVES: this is the same beat.

import { Worker } from 'node:worker_threads'
import { ROOTS } from '@/code/measure/swap-sector'
import {
  CONTACT_STATES,
  STORE_BASE,
  type MesonEngine,
  type MesonSpace,
  type MesonState,
  type Sparse,
} from '@/code/measure/swap-string'

const OPP: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o.every((x, k) => x === -r[k]!)),
)

// the worker's program (plain JavaScript, evaluated in each thread)
const PROGRAM = `
const { workerData } = require('node:worker_threads')
const d = workerData
const ctrl = new Int32Array(d.ctrl)
const shapes = new Float64Array(d.shapes)
const odd = new Float64Array(d.odd)
const length = new Int32Array(d.length)
const step = new Int32Array(d.step)
const opp = d.opp
const roots = d.roots
const stringPh = new Float64Array(d.string)
const streamPh = new Float64Array(d.stream)
const tr = new Float64Array(d.tr)
const ti = new Float64Array(d.ti)
const states = d.states.map(s => [new Float64Array(s[0]), new Float64Array(s[1])])
const partial = new Float64Array(d.partial)
const n = d.n
const origin = d.origin
const lo = Math.floor((n * d.id) / d.workers)
const hi = Math.floor((n * (d.id + 1)) / d.workers)
const P = d.id * 6
const mr = new Float64Array(576)
const mi = new Float64Array(576)

// the one-vibe shape of row h (the site's string length: the mass string's table, every row alike without one)
function apply(h, vr, vi, vo, stride, or, oi, oo, ostride) {
  const c0 = shapes[h]
  const c1 = shapes[h + 1]
  const b0 = shapes[h + 2]
  const b1 = shapes[h + 3]
  let sr = 0
  let si = 0
  for (let e = 0; e < 24; e++) {
    sr += vr[vo + e * stride]
    si += vi[vo + e * stride]
  }
  const bsr = b0 * sr - b1 * si
  const bsi = b0 * si + b1 * sr
  const g0 = odd[0]
  const g1 = odd[1]
  if (g0 === 0 && g1 === 0) {
    for (let t = 0; t < 24; t++) {
      const i = opp[t]
      const wr = vr[vo + i * stride] + bsr
      const wi = vi[vo + i * stride] + bsi
      or[oo + t * ostride] = c0 * wr - c1 * wi
      oi[oo + t * ostride] = c0 * wi + c1 * wr
    }
    return
  }
  // the odd-octet piece (E-SPN-0148): gamma Pi8 w, Pi8 w = (w - X w) / 2 - R (R^T w) / 12, as swap-string applyVibe
  const qr = [0, 0, 0, 0]
  const qi = [0, 0, 0, 0]
  for (let e = 0; e < 24; e++) {
    const xr = vr[vo + e * stride]
    const xi = vi[vo + e * stride]
    for (let k = 0; k < 4; k++) {
      qr[k] += roots[4 * e + k] * xr
      qi[k] += roots[4 * e + k] * xi
    }
  }
  for (let t = 0; t < 24; t++) {
    const i = opp[t]
    const xr = vr[vo + i * stride]
    const xi = vi[vo + i * stride]
    let pr = (xr - vr[vo + t * stride]) / 2
    let pi = (xi - vi[vo + t * stride]) / 2
    for (let k = 0; k < 4; k++) {
      pr -= (roots[4 * i + k] * qr[k]) / 12
      pi -= (roots[4 * i + k] * qi[k]) / 12
    }
    const wr = xr + bsr + g0 * pr - g1 * pi
    const wi = xi + bsi + g0 * pi + g1 * pr
    or[oo + t * ostride] = c0 * wr - c1 * wi
    oi[oo + t * ostride] = c0 * wi + c1 * wr
  }
}

function pieces(s, flow) {
  const sr = s[0]
  const si = s[1]
  let lost = 0
  let fw = 0
  let f0 = 0
  let f1 = 0
  let f2 = 0
  let f3 = 0
  for (let p = lo; p < hi; p++) {
    if (p === origin) continue
    const base = p * 576
    let empty = true
    for (let i = 0; i < 576; i++) {
      if (sr[base + i] !== 0 || si[base + i] !== 0) {
        empty = false
        break
      }
    }
    if (empty) {
      tr.fill(0, base, base + 576)
      ti.fill(0, base, base + 576)
      continue
    }
    const h = 4 * length[p]
    for (let l = 0; l < 24; l++) apply(h, sr, si, base + l * 24, 1, mr, mi, l * 24, 1)
    for (let f = 0; f < 24; f++) apply(h, mr, mi, f, 24, tr, ti, base + f, 24)
    for (let l = 0; l < 24; l++) {
      const q1 = step[p * 24 + l]
      for (let f = 0; f < 24; f++) {
        const i = base + l * 24 + f
        const w = tr[i] * tr[i] + ti[i] * ti[i]
        if (w === 0) continue
        const q = q1 < 0 ? -1 : step[q1 * 24 + opp[f]]
        if (q < 0) lost += w
        if (flow) {
          fw += w
          f0 += (w * (roots[l * 4] + roots[f * 4])) / 2
          f1 += (w * (roots[l * 4 + 1] + roots[f * 4 + 1])) / 2
          f2 += (w * (roots[l * 4 + 2] + roots[f * 4 + 2])) / 2
          f3 += (w * (roots[l * 4 + 3] + roots[f * 4 + 3])) / 2
        }
      }
    }
  }
  partial[P] = lost
  partial[P + 1] = fw
  partial[P + 2] = f0
  partial[P + 3] = f1
  partial[P + 4] = f2
  partial[P + 5] = f3
}

function stream(o) {
  const orr = o[0]
  const oii = o[1]
  for (let q = lo; q < hi; q++) {
    const gr = stringPh[2 * q]
    const gi = stringPh[2 * q + 1]
    for (let f = 0; f < 24; f++) {
      // the one-thread beat steps p by r_l, then by -r_f; read backward that is q + r_f, then - r_l, through the
      // SAME intermediate dock p + r_l = q + r_f, so the ball's edge cuts the same entries
      const p1 = step[q * 24 + f]
      for (let l = 0; l < 24; l++) {
        const j = q * 576 + l * 24 + f
        const p = p1 < 0 ? -1 : step[p1 * 24 + opp[l]]
        if (p < 0) {
          orr[j] = 0
          oii[j] = 0
          continue
        }
        const i = p * 576 + l * 24 + f
        const xr = tr[i]
        const xi = ti[i]
        if (xr === 0 && xi === 0) {
          orr[j] = 0
          oii[j] = 0
          continue
        }
        const c = streamPh[(l * 24 + f) * 2]
        const sn = streamPh[(l * 24 + f) * 2 + 1]
        const zr = xr * c - xi * sn
        const zi = xr * sn + xi * c
        orr[j] = zr * gr - zi * gi
        oii[j] = zr * gi + zi * gr
      }
    }
  }
}

Atomics.add(ctrl, 3, 1)
Atomics.notify(ctrl, 3)
let gen = 0
for (;;) {
  Atomics.wait(ctrl, 1, gen)
  gen = Atomics.load(ctrl, 1)
  const cmd = Atomics.load(ctrl, 0)
  if (cmd === 3) break
  if (cmd === 1) pieces(states[ctrl[4]], ctrl[6] === 1)
  else if (cmd === 2) stream(states[ctrl[5]])
  Atomics.add(ctrl, 2, 1)
  Atomics.notify(ctrl, 2)
}
`

const shared = (n: number): Float64Array =>
  new Float64Array(new SharedArrayBuffer(n * 8))

// a space whose scratch, string and stream arrays live in shared memory (so a threaded engine can read them); the
// caller builds it with swap-string mesonSpace and passes it through here before any engine is made
export function shareSpace(space: MesonSpace): MesonSpace {
  const move = (a: Float64Array): Float64Array => {
    const b = shared(a.length)

    b.set(a)

    return b
  }

  const length = new Int32Array(
    new SharedArrayBuffer(space.length.length * 4),
  )

  length.set(space.length)

  return {
    ...space,
    tr: move(space.tr),
    ti: move(space.ti),
    string: move(space.string),
    stream: move(space.stream),
    shapes: move(space.shapes),
    odd: move(space.odd),
    length,
  }
}

// the threaded engine over `threads` workers and a pool of `states` shared states
export function threadEngine(
  space: MesonSpace,
  threads: number,
  states: number,
): MesonEngine {
  if (
    !(space.tr.buffer instanceof SharedArrayBuffer) ||
    !(space.string.buffer instanceof SharedArrayBuffer) ||
    !(space.stream.buffer instanceof SharedArrayBuffer) ||
    !(space.shapes.buffer instanceof SharedArrayBuffer) ||
    !(space.odd.buffer instanceof SharedArrayBuffer) ||
    !(space.length.buffer instanceof SharedArrayBuffer)
  ) {
    throw new Error('meson-pool: the space is not shared (shareSpace)')
  }

  const { ball, origin } = space
  const n = ball.points.length
  const size = n * 576 + 24
  const pool: MesonState[] = Array.from({ length: states }, () => ({
    re: shared(size),
    im: shared(size),
  }))
  const free = new Set(pool)
  const index = new Map(pool.map((s, i) => [s, i]))
  const ctrl = new Int32Array(new SharedArrayBuffer(8 * 4))
  const step = new Int32Array(
    new SharedArrayBuffer(ball.step.length * 4),
  )
  const partial = shared(threads * 6)

  step.set(ball.step)

  const roots = ROOTS.flatMap(r => [...r])
  const workers = Array.from({ length: threads }, (_, id) => {
    const w = new Worker(PROGRAM, {
      eval: true,
      workerData: {
        ctrl: ctrl.buffer,
        shapes: space.shapes.buffer,
        odd: space.odd.buffer,
        length: space.length.buffer,
        step: step.buffer,
        opp: [...OPP],
        roots,
        string: space.string.buffer,
        stream: space.stream.buffer,
        tr: space.tr.buffer,
        ti: space.ti.buffer,
        states: pool.map(s => [s.re.buffer, s.im.buffer]),
        partial: partial.buffer,
        n,
        origin,
        workers: threads,
        id,
      },
    })

    w.unref()

    return w
  })

  // wait until every worker is running
  for (;;) {
    const ready = Atomics.load(ctrl, 3)

    if (ready >= threads) {
      break
    }

    Atomics.wait(ctrl, 3, ready, 1000)
  }

  const run = (cmd: number): void => {
    Atomics.store(ctrl, 0, cmd)
    Atomics.store(ctrl, 2, 0)
    Atomics.add(ctrl, 1, 1)
    Atomics.notify(ctrl, 1)

    for (;;) {
      const done = Atomics.load(ctrl, 2)

      if (done >= threads) {
        break
      }

      Atomics.wait(ctrl, 2, done, 1000)
    }
  }

  const vr = new Float64Array(CONTACT_STATES)
  const vi = new Float64Array(CONTACT_STATES)

  return {
    space,
    threads,
    borrow: () => {
      const s = free.values().next().value

      if (!s) {
        throw new Error('meson-pool: every pooled state is in use')
      }

      free.delete(s)

      return s
    },
    give: s => {
      if (index.has(s)) {
        free.add(s)
      }
    },
    beat: (s, out, beat, flow) => {
      const si = index.get(s)
      const oi = index.get(out)

      if (si === undefined || oi === undefined || si === oi) {
        throw new Error(
          'meson-pool: beat needs two distinct pooled states',
        )
      }

      ctrl[4] = si
      ctrl[5] = oi
      ctrl[6] = flow ? 1 : 0
      run(1)

      // the contact at y = 0 and the stores, on this thread (mesonBeat's own step)
      const C = space.contact[beat % 2]!
      const base = origin * 576

      for (let i = 0; i < STORE_BASE; i++) {
        vr[i] = s.re[base + i]!
        vi[i] = s.im[base + i]!
      }

      for (let j = 0; j < 24; j++) {
        vr[STORE_BASE + j] = s.re[n * 576 + j]!
        vi[STORE_BASE + j] = s.im[n * 576 + j]!
      }

      const or = new Float64Array(CONTACT_STATES)
      const oim = new Float64Array(CONTACT_STATES)

      for (let f = 0; f < CONTACT_STATES; f++) {
        const xr = vr[f]!
        const xi = vi[f]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const col = C.cols[f]!

        for (let e = 0; e < col.to.length; e++) {
          const t = col.to[e]!
          const cr = col.re[e]!
          const ci = col.im[e]!

          or[t]! += cr * xr - ci * xi
          oim[t]! += cr * xi + ci * xr
        }
      }

      let lost = 0
      let fw = 0

      const fv = [0, 0, 0, 0]

      for (let l = 0; l < 24; l++) {
        const q1 = ball.step[origin * 24 + l]!

        for (let f = 0; f < 24; f++) {
          const i = l * 24 + f
          const xr = or[i]!
          const xi = oim[i]!

          space.tr[base + i] = xr
          space.ti[base + i] = xi

          const w = xr * xr + xi * xi

          if (w === 0) {
            continue
          }

          const q = q1 < 0 ? -1 : ball.step[q1 * 24 + OPP[f]!]!

          if (q < 0) {
            lost += w
          }

          if (flow) {
            const r1 = ROOTS[l]!
            const r2 = ROOTS[f]!

            fw += w

            for (let k = 0; k < 4; k++) {
              fv[k]! += (w * (r1[k]! + r2[k]!)) / 2
            }
          }
        }
      }

      run(2)

      for (let j = 0; j < 24; j++) {
        out.re[n * 576 + j] = or[STORE_BASE + j]!
        out.im[n * 576 + j] = oim[STORE_BASE + j]!

        if (flow) {
          fw += or[STORE_BASE + j]! ** 2 + oim[STORE_BASE + j]! ** 2
        }
      }

      for (let t = 0; t < threads; t++) {
        lost += partial[t * 6]!

        if (flow) {
          fw += partial[t * 6 + 1]!

          for (let k = 0; k < 4; k++) {
            fv[k]! += partial[t * 6 + 2 + k]!
          }
        }
      }

      if (flow) {
        flow.weight += fw

        for (let k = 0; k < 4; k++) {
          flow.v[k] = flow.v[k]! + fv[k]!
        }
      }

      return lost
    },
    close: () => {
      Atomics.store(ctrl, 0, 3)
      Atomics.add(ctrl, 1, 1)
      Atomics.notify(ctrl, 1)

      for (const w of workers) {
        void w.terminate()
      }
    },
  }
}
