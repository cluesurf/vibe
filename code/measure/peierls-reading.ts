// Readings for a test vibe that hops with the light's Peierls phase (code/rule/husk-peierls-walk; E-FRC-0252, 0255):
// the packet it starts from, its centroid on the ring, the exact run over a recorded light, and the same walk in
// doubles reading real angles (the references). Real numbers live here only; the walk holds cyclotomic integers.
//
// DETERMINISM: every start is placed; nothing is drawn.

import {
  copyWalk,
  makeWalk,
  normTrace,
  probabilities,
  sameWalk,
  walkBeat,
  walkBeatBack,
} from '@/code/rule/husk-peierls-walk'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const binomial = (n: number, k: number): number =>
  k < 0 || k > n
    ? 0
    : k === 0
      ? 1
      : (binomial(n, k - 1) * (n - k + 1)) / k

// the ring, the light's depth (angles cycle mod 4D), the walk's root of unity, and the packet's binomial order
export type PeierlsSetting = {
  side: number
  depth: number
  order: number
  pack: number
}

// a binomial packet C(pack, x - r + pack / 2), real and at rest, centered at r on the ring
export const packetAt = (w: PeierlsSetting, r: number): number[] =>
  Array.from({ length: w.side }, (_, x) =>
    binomial(
      w.pack,
      mod(x - r + w.pack / 2 + w.side / 2, w.side) - w.side / 2,
    ),
  )

// the centroid relative to r, on the ring
export function ringCentroid(
  w: PeierlsSetting,
  p: ArrayLike<number>,
  r: number,
): number {
  let c = 0

  for (let x = 0; x < w.side; x++) {
    c += p[x]! * (mod(x - r + w.side / 2, w.side) - w.side / 2)
  }

  return c
}

// the exact walk of charge q from the packet at r over the recorded angles (one row per beat): its centroid move,
// whether its norm trace is 4^hops times the start's, and (with `back`) whether it runs back to exactly 4^hops times
// its start
export function exactWalkRun(
  w: PeierlsSetting,
  r: number,
  q: number,
  angles: readonly Int32Array[],
  back = false,
): { move: number; normOk: boolean; backOk: boolean } {
  const beats = angles.length
  const walk = makeWalk({
    order: w.order,
    depth: w.depth,
    sites: w.side,
    start: packetAt(w, r),
  })
  const first = copyWalk(walk)
  const norm0 = normTrace(walk)

  for (let t = 0; t < beats; t++) {
    walkBeat(walk, angles[t]!, q)
  }

  const normOk = normTrace(walk) === norm0 * 4n ** BigInt(beats * 2)
  const move =
    ringCentroid(w, probabilities(walk), r) -
    ringCentroid(w, probabilities(first), r)

  let backOk = true

  if (back) {
    const v = copyWalk(walk)

    for (let t = beats - 1; t >= 0; t--) {
      walkBeatBack(v, angles[t]!, q)
    }

    backOk = sameWalk(v, first, 4n ** BigInt(beats * 2))
  }

  return { move, normOk, backOk }
}

// the same walk in doubles, reading real angles angle(t, x) on the link x -> x + 1 at beat t
export function floatWalkRun(
  w: PeierlsSetting,
  r: number,
  q: number,
  beats: number,
  angle: (t: number, x: number) => number,
): number {
  const side = w.side
  const re = Float64Array.from(packetAt(w, r))
  const im = new Float64Array(side)
  const th = (2 * Math.PI) / w.order
  const c = Math.cos(th)
  const sn = Math.sin(th)
  const p0 = Float64Array.from(re, v => v * v)
  const total = p0.reduce((a, b) => a + b, 0)

  for (let t = 0; t < beats; t++) {
    for (const parity of [0, 1]) {
      for (let x = parity; x < side; x += 2) {
        const y = (x + 1) % side
        const ph = (-2 * Math.PI * q * angle(t, x)) / (4 * w.depth)
        // (T psi)_y = e^(i ph) psi_x, (T psi)_x = e^(-i ph) psi_y; V = c + i s T
        const txr = Math.cos(-ph) * re[y]! - Math.sin(-ph) * im[y]!
        const txi = Math.sin(-ph) * re[y]! + Math.cos(-ph) * im[y]!
        const tyr = Math.cos(ph) * re[x]! - Math.sin(ph) * im[x]!
        const tyi = Math.sin(ph) * re[x]! + Math.cos(ph) * im[x]!
        const nxr = c * re[x]! - sn * txi
        const nxi = c * im[x]! + sn * txr
        const nyr = c * re[y]! - sn * tyi
        const nyi = c * im[y]! + sn * tyr

        re[x] = nxr
        im[x] = nxi
        re[y] = nyr
        im[y] = nyi
      }
    }
  }

  const p = Float64Array.from(
    re,
    (v, i) => (v * v + im[i]! * im[i]!) / total,
  )

  return (
    ringCentroid(w, p, r) -
    ringCentroid(
      w,
      Float64Array.from(p0, v => v / total),
      r,
    )
  )
}
