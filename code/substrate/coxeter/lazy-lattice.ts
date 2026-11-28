// A LAZY EXACT flat tiling whose tiles are the points of an integer lattice and whose facet neighbours are the lattice
// steps ±r: the hexagonal tiling {6,3} (the A2 lattice, 6 steps) and the 24-cell honeycomb {3,4,3,3} (the D4 lattice,
// its 24 roots). Tiles are created as a caller reaches them, keyed by their integer coordinates, so a run grows only
// where its excitation is. Integers only.
//
// Distance and ball sizes are closed forms, checked against breadth-first search by the experiment that uses them:
//   A2 with steps ±(1,0), ±(0,1), ±(1,-1): d(x, y) = max(|x|, |y|, |x + y|), ball 1 + 3 r (r + 1)
//   D4 with steps ±e_i ± e_j:             d(x) = max(max |x_i|, sum |x_i| / 2), ball 1 + 4 r^2 (r + 1)^2 + 4 r (r + 1)
// (one step moves sum |x_i| by at most 2 and max |x_i| by at most 1, and both bounds are reached; the D4 shells are
// 16 r^3 + 8 r, its coordination sequence 24, 144, 456, 1056).

export type LatticeKind = 'a2' | 'd4'

export type LatticeSpec = {
  readonly kind: LatticeKind
  readonly dimension: number
  // one step per ± pair; the facet neighbours are +step and -step
  readonly steps: readonly (readonly number[])[]
  // for each step, a coordinate where it is odd: the parity of that coordinate splits the step's edges into two
  // perfect matchings
  readonly parity: readonly number[]
}

export function latticeSpec(kind: LatticeKind): LatticeSpec {
  if (kind === 'a2') {
    return {
      kind,
      dimension: 2,
      steps: [
        [1, 0],
        [0, 1],
        [1, -1],
      ],
      parity: [0, 1, 0],
    }
  }

  const steps: number[][] = []
  const parity: number[] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const sign of [1, -1]) {
        const r = [0, 0, 0, 0]

        r[i] = 1
        r[j] = sign
        steps.push(r)
        parity.push(i)
      }
    }
  }

  return { kind, dimension: 4, steps, parity }
}

export function latticeDistance(kind: LatticeKind, x: readonly number[]): number {
  if (kind === 'a2') {
    return Math.max(Math.abs(x[0]!), Math.abs(x[1]!), Math.abs(x[0]! + x[1]!))
  }

  let max = 0
  let sum = 0

  for (const v of x) {
    max = Math.max(max, Math.abs(v))
    sum += Math.abs(v)
  }

  return Math.max(max, sum / 2)
}

export function latticeBall(kind: LatticeKind, r: number): number {
  return kind === 'a2'
    ? 1 + 3 * r * (r + 1)
    : 1 + 4 * r * r * (r + 1) * (r + 1) + 4 * r * (r + 1)
}

export class LazyLattice {
  readonly spec: LatticeSpec
  private readonly coords: number[][] = []
  private readonly index = new Map<string, number>()
  private readonly distanceOf: number[] = []

  constructor(kind: LatticeKind) {
    this.spec = latticeSpec(kind)

    const origin = new Array<number>(this.spec.dimension).fill(0)

    this.intern(origin)
  }

  get count(): number {
    return this.coords.length
  }

  coordinates(cell: number): readonly number[] {
    return this.coords[cell]!
  }

  distance(cell: number): number {
    return this.distanceOf[cell]!
  }

  distanceBetween(a: number, b: number): number {
    const x = this.coords[a]!
    const y = this.coords[b]!

    return latticeDistance(
      this.spec.kind,
      x.map((v, i) => y[i]! - v),
    )
  }

  // the cell one step `sign` * steps[k] from `cell`
  step(cell: number, k: number, sign: 1 | -1): number {
    const x = this.coords[cell]!
    const r = this.spec.steps[k]!

    return this.intern(x.map((v, i) => v + sign * r[i]!))
  }

  // the parity (0 or 1) of the coordinate that splits step k
  parity(cell: number, k: number): number {
    const v = this.coords[cell]![this.spec.parity[k]!]!

    return ((v % 2) + 2) % 2
  }

  // the cell at lattice point x (D4 points have an even coordinate sum)
  at(x: readonly number[]): number {
    if (
      x.length !== this.spec.dimension ||
      x.some(v => !Number.isInteger(v)) ||
      (this.spec.kind === 'd4' && x.reduce((s, v) => s + v, 0) % 2 !== 0)
    ) {
      throw new Error(`lazy-lattice: ${x.join(',')} is not a point of ${this.spec.kind}`)
    }

    return this.intern([...x])
  }

  // canonical order: distance, then coordinates lexicographically
  compare(a: number, b: number): number {
    if (a === b) {
      return 0
    }

    const d = this.distanceOf[a]! - this.distanceOf[b]!

    if (d !== 0) {
      return d
    }

    const x = this.coords[a]!
    const y = this.coords[b]!

    for (let i = 0; i < x.length; i++) {
      if (x[i] !== y[i]) {
        return x[i]! - y[i]!
      }
    }

    throw new Error('lazy-lattice: two cells share coordinates')
  }

  private intern(x: number[]): number {
    const key = x.join(',')
    const found = this.index.get(key)

    if (found !== undefined) {
      return found
    }

    const id = this.coords.length

    this.coords.push(x)
    this.distanceOf.push(latticeDistance(this.spec.kind, x))
    this.index.set(key, id)

    return id
  }
}
