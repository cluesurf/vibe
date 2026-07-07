// The Jackiw-Rebbi bound state, read off the knit's OWN coined Dirac walk. Where the mass of a Dirac
// particle changes SIGN across a wall, a state is bound to the wall: a zero-energy mode trapped at the
// interface that cannot disperse away, the one-dimensional face of the bulk-boundary correspondence
// (the same mechanism behind topological edge states and domain-wall fermions). The binding is
// topological: it needs the mass to pass through ZERO, not merely to vary. A mass that changes
// magnitude but keeps its sign binds NOTHING, even with the same spatial gradient.
//
// Measured on the {3,4,3,4} coin's single-particle sector (the two-component coined Dirac walk): the
// local mass follows a profile m(x) across a wall at the centre, and a packet launched at the wall is
// evolved by the exact coin+shift rule. The fraction of probability that stays within a window of the
// wall is the order parameter. For a sign-flipping wall it stays near one (bound); for a uniform mass
// or a same-sign wall it decays as the packet streams away (unbound).

type Complex = readonly [number, number]

const cadd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cabs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]
const IMAG: Complex = [0, 1]

// The fraction of probability retained within +/- window cells of the wall after the walk, for one of
// three mass profiles centred at the lattice midpoint:
//   'flip'     m(x) = mass * tanh((x - wall) / wallWidth)      -- the mass CHANGES SIGN (binds a mode)
//   'samesign' m(x) = mass * (1.5 + 0.5 * tanh(...))           -- varies the same way but stays positive
//   'uniform'  m(x) = mass                                     -- no wall at all
export function massWallRetainedWeight(input: {
  size: number
  steps: number
  mass: number
  profile: 'flip' | 'samesign' | 'uniform'
  width: number
  wallWidth: number
  window: number
}): number {
  const {
    size: L,
    steps,
    mass,
    profile,
    width: sigma,
    wallWidth,
    window,
  } = input
  const wrap = (x: number): number => ((x % L) + L) % L
  const wall = L >> 1

  // localized Gaussian packet at rest, seeded AT the wall (symmetric coin)
  let R: Complex[] = new Array(L).fill([0, 0])
  let Lf: Complex[] = new Array(L).fill([0, 0])
  let seedNorm = 0
  for (let x = 0; x < L; x++) {
    const g = Math.exp(-((x - wall) * (x - wall)) / (2 * sigma * sigma))
    R[x] = [g, 0]
    Lf[x] = [g, 0]
    seedNorm += cabs2(R[x]!) + cabs2(Lf[x]!)
  }
  const inv = 1 / Math.sqrt(seedNorm)
  for (let x = 0; x < L; x++) {
    R[x] = [R[x]![0] * inv, R[x]![1] * inv]
    Lf[x] = [Lf[x]![0] * inv, Lf[x]![1] * inv]
  }

  // local mass profile
  const cosM = new Float64Array(L)
  const sinM = new Float64Array(L)
  for (let x = 0; x < L; x++) {
    const th = Math.tanh((x - wall) / wallWidth)
    const m =
      profile === 'flip'
        ? mass * th
        : profile === 'samesign'
          ? mass * (1.5 + 0.5 * th)
          : mass
    cosM[x] = Math.cos(m)
    sinM[x] = Math.sin(m)
  }

  for (let t = 0; t < steps; t++) {
    const R2: Complex[] = new Array(L)
    const L2: Complex[] = new Array(L)
    for (let x = 0; x < L; x++) {
      const c = cosM[x]!
      const s = sinM[x]!
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(IMAG, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(IMAG, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    const R3: Complex[] = new Array(L).fill([0, 0])
    const L3: Complex[] = new Array(L).fill([0, 0])
    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }
    R = R3
    Lf = L3
  }

  // fraction retained within +/- window of the wall
  let retained = 0
  let total = 0
  for (let x = 0; x < L; x++) {
    total += cabs2(R[x]!) + cabs2(Lf[x]!)
  }
  for (let x = wall - window; x <= wall + window; x++) {
    const xi = wrap(x)
    retained += cabs2(R[xi]!) + cabs2(Lf[xi]!)
  }

  return retained / (total || 1)
}
