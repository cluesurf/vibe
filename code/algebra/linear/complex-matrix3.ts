// 3 x 3 complex matrices packed as 18 floats, re and im interleaved, row major: entry (i, j) at offset
// o + 2 (3 i + j). This is the layout of holonomy-caging's GridLifts.floats and color-slab's ColorLinks (k 3), so a
// matrix is read in place inside a long array of links by its offset, with no copy.

export type ComplexEntry = [number, number]

// entry (i, j) of the 3 x 3 at offset o
export function entry3(m: Float64Array, o: number, i: number, j: number): ComplexEntry {
  return [m[o + 2 * (3 * i + j)]!, m[o + 2 * (3 * i + j) + 1]!]
}

const times = (a: ComplexEntry, b: ComplexEntry): ComplexEntry => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const minus = (a: ComplexEntry, b: ComplexEntry): ComplexEntry => [a[0] - b[0], a[1] - b[1]]
const plus = (a: ComplexEntry, b: ComplexEntry): ComplexEntry => [a[0] + b[0], a[1] + b[1]]

// the determinant of the 3 x 3 at offset o, by the first row's cofactors
export function det3f(m: Float64Array, o = 0): ComplexEntry {
  const a = (i: number, j: number): ComplexEntry => entry3(m, o, i, j)
  const t0 = times(a(0, 0), minus(times(a(1, 1), a(2, 2)), times(a(1, 2), a(2, 1))))
  const t1 = times(a(0, 1), minus(times(a(1, 0), a(2, 2)), times(a(1, 2), a(2, 0))))
  const t2 = times(a(0, 2), minus(times(a(1, 0), a(2, 1)), times(a(1, 1), a(2, 0))))

  return plus(minus(t0, t1), t2)
}

// out = a b, the 3 x 3 at offset ao of a times the 3 x 3 at offset bo of b, written at offset 0 of out (out must not
// alias either input)
export function mul3f(a: Float64Array, ao: number, b: Float64Array, bo: number, out = new Float64Array(18)): Float64Array {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let r = 0
      let im = 0

      for (let l = 0; l < 3; l++) {
        const xr = a[ao + 2 * (3 * i + l)]!
        const xi = a[ao + 2 * (3 * i + l) + 1]!
        const yr = b[bo + 2 * (3 * l + j)]!
        const yi = b[bo + 2 * (3 * l + j) + 1]!

        r += xr * yr - xi * yi
        im += xr * yi + xi * yr
      }

      out[2 * (3 * i + j)] = r
      out[2 * (3 * i + j) + 1] = im
    }
  }

  return out
}
