// Wilson loops at tree level in lattice perturbation theory, exactly, on a finite periodic box. At
// lowest order the gauge field is free, so for a rectangular R x T loop in the (mu, nu) plane
//
//   -ln W(R, T) = (C_R g^2 / 2) (1 / V) sum over k != 0 of |J(k)|^2 / khat^2
//
// with khat^2 = sum_rho 4 sin^2(k_rho / 2) the lattice Laplacian in Feynman gauge and J the Fourier
// transform of the loop's current:
//
//   |J(k)|^2 = |S_R(k_mu)|^2 4 sin^2(T k_nu / 2) + |S_T(k_nu)|^2 4 sin^2(R k_mu / 2),
//   S_L(q) = sum_{j < L} exp(i q j)
//
// The group enters only through the Casimir C_R, so any ratio of such quantities, a Creutz ratio
// against another, is one pure number for every group and every representation. That number is what
// a measured ratio must approach as g^2 -> 0, computed here rather than fitted.

// f(R, T) = -ln W(R, T) / (C_R g^2) at tree level, on a periodic box of side `box` in four dimensions.
export function treeLevelLoop(input: { r: number; t: number; box: number }): number {
  const { r, t, box } = input

  if (r === 0 || t === 0) {
    return 0
  }

  const momenta = Array.from({ length: box }, (_, j) => (2 * Math.PI * j) / box)
  const sinSquared = momenta.map(q => 4 * Math.sin(q / 2) ** 2)
  // |S_L(q)|^2 = sin^2(L q / 2) / sin^2(q / 2), L^2 at q = 0
  const sumSquared = (length: number, q: number): number => {
    const s = Math.sin(q / 2)

    return Math.abs(s) < 1e-12 ? length * length : Math.sin((length * q) / 2) ** 2 / (s * s)
  }

  let total = 0

  for (let a = 0; a < box; a++) {
    const kMu = momenta[a] ?? 0
    const loopMu = sumSquared(r, kMu)
    const edgeMu = 4 * Math.sin((r * kMu) / 2) ** 2

    for (let b = 0; b < box; b++) {
      const kNu = momenta[b] ?? 0
      const current =
        loopMu * 4 * Math.sin((t * kNu) / 2) ** 2 + sumSquared(t, kNu) * edgeMu

      if (current === 0) {
        continue
      }

      // the two directions outside the plane only enter the propagator
      for (let c = 0; c < box; c++) {
        for (let d = 0; d < box; d++) {
          const khat =
            (sinSquared[a] ?? 0) + (sinSquared[b] ?? 0) + (sinSquared[c] ?? 0) + (sinSquared[d] ?? 0)

          if (khat > 0) {
            total += current / khat
          }
        }
      }
    }
  }

  return total / (2 * box ** 4)
}

// The tree-level Creutz ratio chi(R, R) / (C_R g^2), from f.
export function treeLevelCreutz(input: { r: number; box: number }): number {
  const f = (r: number, t: number): number => treeLevelLoop({ r, t, box: input.box })
  const { r } = input

  return f(r, r) + f(r - 1, r - 1) - f(r - 1, r) - f(r, r - 1)
}
