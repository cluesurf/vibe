// The exact register rule of code/rule/flux-store-line against the float runner of E-SPN-0074
// (code/measure/locked-run), with the store as a wall of 2D and the cost applied as a phase before each beat
// (E-SPN-0075, 0076). Measurement: floats read the exact numbers.
//
// Checked in one pass: the exact amplitudes equal the float ones on every configuration (positions and labels),
// the numerator norms sum to the denominator squared times the start's norm (reduced mod Phi_K), the exact
// inverse returns the start times the denominator squared, and every register state the run supports holds Gauss
// mod 3 and sigma = D - l.

import {
  decodeRegisters,
  exactBeat,
  exactBeatBack,
  exactStart,
  gaussHolds,
  placedRegisters,
  stringCount,
  type ExactState,
  type FluxStoreSpec,
} from '@/code/rule/flux-store-line'
import {
  lockedRun,
  spanOf,
  type LockedStart,
} from '@/code/measure/locked-run'
import { canonical, toComplex } from '@/code/rule/lattice-qed'

export type ExactCheck = {
  gap: number
  norm: boolean
  reverses: boolean
  registersOk: boolean
  merged: number
  bits: number
}

export function exactCheck(
  s: FluxStoreSpec,
  starts: readonly LockedStart[],
  beats: number,
): ExactCheck {
  const n = s.kinds.length
  const minAbs = Math.min(...starts.map(e => Math.abs(e.amp[0])))
  const st: ExactState = exactStart(
    s,
    starts.map(e => ({
      registers: placedRegisters(s, [...e.x], [...e.j]),
      weight: BigInt(Math.round(e.amp[0] / minAbs)),
    })),
  )
  const startCopy = new Map([...st.amp].map(([i, v]) => [i, v.slice()]))
  const fl = lockedRun({
    ring: s.ring,
    kinds: s.kinds,
    convention: s.convention,
    unlike: s.unlike,
    wall: 2 * s.depth,
    start: starts,
  })
  const R = 3 ** n
  const P = s.ring ** n
  // the cost phase per position configuration (the string is the smallest arc on every state the wall allows)
  const costRe = new Float64Array(P)
  const costIm = new Float64Array(P)
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % s.ring
      c = Math.floor(c / s.ring)
    }

    const th =
      (-2 * Math.PI * ((s.cost * spanOf(s.ring, xs)) % s.root)) / s.root

    costRe[p] = Math.cos(th)
    costIm[p] = Math.sin(th)
  }

  let gap = 0
  let registersOk = true
  let merged = 0

  for (let t = 0; t < beats; t++) {
    exactBeat(st)

    if (s.cost !== 0) {
      for (let p = 0; p < P; p++) {
        for (let r = 0; r < R; r++) {
          const i = p * R + r
          const vr = fl.re[i]!
          const vi = fl.im[i]!

          fl.re[i] = vr * costRe[p]! - vi * costIm[p]!
          fl.im[i] = vr * costIm[p]! + vi * costRe[p]!
        }
      }
    }

    fl.beat()

    const seen = new Map<number, [number, number]>()

    for (const [i, v] of st.amp) {
      const r = decodeRegisters(s, i)

      if (!gaussHolds(s, r) || r.sigma !== s.depth - stringCount(r.f)) {
        registersOk = false
      }

      const p = r.x.reduce((a, x) => a * s.ring + x, 0)
      const lab = r.j.reduce((a, j) => a * 3 + j, 0)
      const at = p * R + lab
      const [vr, vi] = toComplex(v, st.den, st.k)
      const prev = seen.get(at)

      if (prev) {
        merged++
      }

      seen.set(
        at,
        prev
          ? [prev[0] + vr * minAbs, prev[1] + vi * minAbs]
          : [vr * minAbs, vi * minAbs],
      )
    }

    for (let at = 0; at < fl.re.length; at++) {
      const e = seen.get(at) ?? [0, 0]

      gap = Math.max(
        gap,
        Math.hypot(e[0] - fl.re[at]!, e[1] - fl.im[at]!),
      )
    }
  }

  // norm identity: sum a(x) a(x^-1), reduced mod Phi_K, is den^2 times the start's norm
  const k = st.k

  const normOf = (amp: Map<number, bigint[]>): bigint[] => {
    const acc = new Array<bigint>(k).fill(0n)

    for (const raw of amp.values()) {
      // reduce first (same class mod Phi_K), so the square runs over phi(K) coefficients, not K
      const v = canonical(raw, k)
      const nz: number[] = []

      for (let a = 0; a < k; a++) {
        if (v[a] !== 0n) {
          nz.push(a)
        }
      }

      for (const a of nz) {
        for (const b of nz) {
          acc[(((a - b) % k) + k) % k] =
            acc[(((a - b) % k) + k) % k]! + v[a]! * v[b]!
        }
      }
    }

    return canonical(acc, k)
  }

  const n0 = normOf(startCopy)
  const n1 = normOf(st.amp)
  const norm = n1.every((x, i) => x === (n0[i] ?? 0n) * st.den * st.den)
  const forward = st.den
  const bits = forward.toString(2).length

  for (let t = 0; t < beats; t++) {
    exactBeatBack(st)
  }

  let reverses = [...startCopy.keys()].every(i => st.amp.has(i))

  for (const [i, v] of st.amp) {
    const want = startCopy.get(i)
    const got = canonical(v, k)
    const target = want
      ? canonical(
          want.map(x => x * forward * forward),
          k,
        )
      : new Array<bigint>(k).fill(0n)

    if (!got.every((x, a) => x === (target[a] ?? 0n))) {
      reverses = false
    }
  }

  return { gap, norm, reverses, registersOk, merged, bits }
}
