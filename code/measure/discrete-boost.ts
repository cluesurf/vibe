// Exact discrete Lorentz structure of the light sector. A regular lattice cannot carry the full
// continuous Lorentz group (its point group is finite), but in light-cone coordinates the lattice
// admits exact integer boosts (u, v) to (lambda u, v / lambda): the boost with integer lambda maps
// lattice points to lattice points in the contracted direction, and its rapidity is ln(lambda).
// The rapidities of products of integer boosts are n ln 2 + m ln 3 + ..., and since ln 2 / ln 3 is
// irrational these fill the rapidity line densely: the discrete subgroup is dense in the boost
// group, indistinguishable from continuous at any finite resolution. On the massless walk (rigid
// chiral transport, dispersion omega = k exactly at every momentum) the boost acts on a chiral
// profile by contraction with the time rescaled by the same factor, and it maps solutions to
// solutions exactly.

// The boost equivariance defect for a right-moving profile: evolving the lambda-contracted
// profile for beats / lambda steps versus contracting the profile evolved for beats steps. Zero
// exactly when the boost maps solutions to solutions. The profile is a smooth bump sampled on a
// ring.
export function boostEquivarianceDefect(input: {
  size: number
  lambda: number
  beats: number
  center: number
  width: number
}): number {
  const { size, lambda, beats, center, width } = input

  const profile = (s: number): number => {
    const wrapped = ((s % size) + size) % size

    return Math.exp(-((wrapped - center) * (wrapped - center)) / width)
  }

  const contractedBeats = beats / lambda

  let defect = 0

  for (let x = 0; x < size; x++) {
    // evolve the contracted profile for beats / lambda steps
    const evolvedContracted = profile(lambda * (x - contractedBeats))
    // contract the profile evolved for beats steps
    const contractedEvolved = profile(lambda * x - beats)

    defect = Math.max(
      defect,
      Math.abs(evolvedContracted - contractedEvolved),
    )
  }

  return defect
}

// The massive shell in deformed variables. From the walk dispersion cos(omega) = cos(mass) cos(k)
// follows the exact identity sin^2(omega) - cos^2(mass) sin^2(k) = sin^2(mass), so in the
// variables E = sin(omega) and P = cos(mass) sin(k) the massive shell is a true Lorentz hyperbola
// E^2 - P^2 = sin^2(mass) with invariant rest mass sin(mass), the standard boosts act on (E, P)
// exactly, and the group velocity is P / E, the relativistic velocity formula. The deformation
// map converges to the identity in the continuum (sin goes to its argument).

// The deformed energy-momentum pair of a mode.
export function shellVariables(input: {
  omega: number
  k: number
  mass: number
}): { energy: number; momentum: number } {
  return {
    energy: Math.sin(input.omega),
    momentum: Math.cos(input.mass) * Math.sin(input.k),
  }
}

// A standard Lorentz boost on the deformed pair.
export function boostShell(input: {
  energy: number
  momentum: number
  rapidity: number
}): { energy: number; momentum: number } {
  const { energy, momentum, rapidity } = input

  return {
    energy:
      energy * Math.cosh(rapidity) + momentum * Math.sinh(rapidity),
    momentum:
      momentum * Math.cosh(rapidity) + energy * Math.sinh(rapidity),
  }
}

// The largest gap left in the rapidity interval [0, span] by the integer-boost rapidities
// n ln 2 + m ln 3 with |n|, |m| up to `range`. Shrinks toward zero as the range grows, the
// density of the discrete boost subgroup.
export function rapidityMaxGap(input: {
  range: number
  span: number
}): number {
  const { range, span } = input
  const rapidities: number[] = []

  for (let n = -range; n <= range; n++) {
    for (let m = -range; m <= range; m++) {
      const rapidity = n * Math.log(2) + m * Math.log(3)

      if (rapidity >= 0 && rapidity <= span) {
        rapidities.push(rapidity)
      }
    }
  }

  rapidities.sort((a, b) => a - b)

  let gap = rapidities[0]!

  for (let i = 1; i < rapidities.length; i++) {
    gap = Math.max(gap, rapidities[i]! - rapidities[i - 1]!)
  }

  return Math.max(gap, span - rapidities[rapidities.length - 1]!)
}
