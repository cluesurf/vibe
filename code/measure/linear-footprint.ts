// THE FOOTPRINT OF A LINEAR RULE OVER Z3, FROM ONE DISTURBED SITE (E-FND-0169). A linear (additive) rule mod 3 takes
// x_(t+1)(p) = sum over a neighbor set R of x_t(p - r) mod 3; from one site its footprint at beat t is the support of
// P^t mod 3, P = sum_r z^r. In 1 + 1 dimensions with R = {0, 1} this is Pascal's triangle mod 3, whose space-time
// count up to t = 3^k is 6^k exactly (box-counting dimension log 6 / log 3 = 1.6309). This module counts the support
// beat by beat for any integer neighbor set in Z^d (d up to 4), on a dense box large enough that nothing wraps.
//
//   linearFootprint   the nonzero count per beat, t = 0 .. T, from x_0 = delta at the origin
//   spaceTimeCount    the cumulative count S(t) = sum over beats 0 .. t
//   logSlope          the least-squares slope of log y against log x
//
// EXACT: integers mod 3 only. DETERMINISM: no random numbers.

export function linearFootprint(neighbors: readonly (readonly number[])[], beats: number): number[] {
  const d = neighbors[0]!.length
  const reach = Math.max(...neighbors.flatMap(r => r.map(Math.abs)))
  const half = reach * beats
  const side = 2 * half + 1
  const size = side ** d
  const stride = Array.from({ length: d }, (_, i) => side ** i)
  const offsets = neighbors.map(r => r.reduce((s, x, i) => s + x * stride[i]!, 0))

  let a = new Uint8Array(size)
  let b = new Uint8Array(size)

  const origin = stride.reduce((s, x) => s + half * x, 0)

  a[origin] = 1

  const counts = [1]

  // the live index range grows by `reach` per axis a beat; walk the whole box but skip zeros cheaply
  for (let t = 1; t <= beats; t++) {
    b.fill(0)

    for (let i = 0; i < size; i++) {
      const v = a[i]!

      if (v === 0) {
        continue
      }

      for (const o of offsets) {
        const j = i + o

        b[j] = (b[j]! + v) % 3
      }
    }

    let n = 0

    for (let i = 0; i < size; i++) {
      n += b[i] !== 0 ? 1 : 0
    }

    counts.push(n)

    const s = a

    a = b
    b = s
  }

  return counts
}

export const spaceTimeCount = (counts: readonly number[]): number[] => {
  let s = 0

  return counts.map(c => (s += c))
}

export function logSlope(xs: readonly number[], ys: readonly number[]): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((a, b) => a + b, 0) / lx.length
  const my = ly.reduce((a, b) => a + b, 0) / ly.length

  let num = 0
  let den = 0

  lx.forEach((x, i) => {
    num += (x - mx) * (ly[i]! - my)
    den += (x - mx) ** 2
  })

  return num / den
}
