// The exact register rule of code/rule/reel-string-line against the float runner code/measure/reel-run (no color
// field), with the cost (E-SPN-0081). Measurement: floats read the exact numbers.
//
// Checked in one pass, as code/measure/flux-store-exact does for the port store: the exact amplitudes equal the float
// ones on every configuration (positions, reels, labels), the numerator norms sum to the denominator squared times
// the start's norm (reduced mod Phi_K), the exact inverse returns the start times the denominator squared, and every
// register state the run supports holds Gauss mod 3 and sum r + 2 l = 0.

import {
  decodeRegisters,
  exactReelBeat,
  exactReelBeatBack,
  exactReelStart,
  gaussHolds,
  placedRegisters,
  reelSum,
  stringCount,
  type ExactReelState,
  type ReelSpec,
} from '@/code/rule/reel-string-line'
import { reelRun } from '@/code/measure/reel-run'
import { canonical, toComplex } from '@/code/rule/lattice-qed'

export type ReelStart = {
  readonly x: readonly number[]
  readonly j: readonly number[]
  readonly r: readonly number[]
  readonly amp: number
}

export type ReelExactCheck = {
  gap: number
  norm: boolean
  reverses: boolean
  registersOk: boolean
  merged: number
  bits: number
  supported: number
}

export function reelExactCheck(
  s: ReelSpec,
  starts: readonly ReelStart[],
  beats: number,
): ReelExactCheck {
  const n = s.kinds.length
  const minAbs = Math.min(...starts.map(e => Math.abs(e.amp)))
  const st: ExactReelState = exactReelStart(
    s,
    starts.map(e => ({
      registers: placedRegisters(s, [...e.x], [...e.j], [...e.r]),
      weight: BigInt(Math.round(e.amp / minAbs)),
    })),
  )
  const startCopy = new Map([...st.amp].map(([i, v]) => [i, v.slice()]))
  const fl = reelRun({
    ring: s.ring,
    kinds: s.kinds,
    depth: s.depth,
    cost: s.cost,
    root: s.root,
  })

  fl.place(
    starts.map(e => ({
      x: e.x,
      r: e.r,
      j: e.j,
      amp: [e.amp, 0] as [number, number],
    })),
  )

  const R = 3 ** n

  let gap = 0
  let registersOk = true
  let merged = 0
  let supported = 0

  for (let t = 0; t < beats; t++) {
    exactReelBeat(st)
    fl.beat()

    const seen = new Map<number, [number, number]>()

    for (const [i, v] of st.amp) {
      const g = decodeRegisters(s, i)

      if (
        !gaussHolds(s, g) ||
        reelSum(g.r) + 2 * stringCount(g.f) !== 0
      ) {
        registersOk = false
      }

      const c = fl.indexOf(g.x, g.r)

      if (c < 0) {
        registersOk = false
        continue
      }

      const at = c * R + g.j.reduce((a, j) => a * 3 + j, 0)
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

    supported = Math.max(supported, st.amp.size)

    for (let at = 0; at < fl.re.length; at++) {
      const e = seen.get(at) ?? [0, 0]

      gap = Math.max(
        gap,
        Math.hypot(e[0] - fl.re[at]!, e[1] - fl.im[at]!),
      )
    }
  }

  const k = st.k

  const normOf = (amp: Map<number, bigint[]>): bigint[] => {
    const acc = new Array<bigint>(k).fill(0n)

    for (const raw of amp.values()) {
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
    exactReelBeatBack(st)
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

  return { gap, norm, reverses, registersOk, merged, bits, supported }
}

// antisymmetrize a start over the permutations of identical tokens (positions, labels and reels together)
export function antisymmetrizedReels(input: {
  x: readonly number[]
  j: readonly number[]
  r: readonly number[]
}): ReelStart[] {
  const n = input.x.length
  const perms: number[][] =
    n === 2
      ? [
          [0, 1],
          [1, 0],
        ]
      : [
          [0, 1, 2],
          [1, 0, 2],
          [2, 1, 0],
          [0, 2, 1],
          [1, 2, 0],
          [2, 0, 1],
        ]
  const signs = n === 2 ? [1, -1] : [1, -1, -1, -1, 1, 1]
  const merged = new Map<
    string,
    { x: number[]; j: number[]; r: number[]; amp: number }
  >()

  perms.forEach((p, k) => {
    const x = p.map(i => input.x[i]!)
    const j = p.map(i => input.j[i]!)
    const r = p.map(i => input.r[i]!)
    const key = `${x.join(',')}|${j.join(',')}|${r.join(',')}`
    const known = merged.get(key)

    merged.set(key, { x, j, r, amp: (known?.amp ?? 0) + signs[k]! })
  })

  const list = [...merged.values()].filter(e => Math.abs(e.amp) > 1e-12)
  const norm = Math.sqrt(list.reduce((t, e) => t + e.amp ** 2, 0))

  return list.map(e => ({ ...e, amp: e.amp / norm }))
}
