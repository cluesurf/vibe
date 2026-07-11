// Scalar summaries of a ternary tone buffer (values in -1, 0, +1). The total
// charge is the signed sum (the conserved quantity of the perception rule); the
// live count is the number of non-peace (non-zero) cells (the "life" of the
// configuration).

export function totalCharge(tone: Int8Array): number {
  let s = 0

  for (const v of tone) s += v

  return s
}

export function liveCount(tone: Int8Array): number {
  let c = 0

  for (const v of tone) {
    if (v !== 0) {
      c++
    }
  }

  return c
}
