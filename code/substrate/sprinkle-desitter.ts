// A causal set sprinkled into a 2D de Sitter / FRW patch ds^2 = -dtau^2 + a(tau)^2 dx^2 with a(tau) =
// e^{H tau}. Points are placed by proper 2-volume (dV = a(tau) dtau dx, since sqrt(-g) = a in 2D), so
// proper time is sampled by inverse-CDF with density proportional to a(tau). Causality is read in
// conformal time eta = (1 - e^{-H tau}) / H, where the light cone is 45 degrees, then transitively
// closed. The resulting order's spatial slices grow with proper time, an expanding universe represented
// faithfully as a causal order. This reweights by the de Sitter proper volume (unlike the conformal-box
// sprinkleCurved), so it is the proper-volume de Sitter sprinkling.

import { Rng } from '@/code/tool/rng'
import { makeBitMatrix, setBit, getBit } from '@/code/tool/bitset'
import { makePosetFromFuture, Poset } from '@/code/tool/poset'

export function sprinkleDeSitter(input: {
  count: number
  hubble: number
  properTime: number
  comovingWidth: number
  rng: Rng
}): { poset: Poset; tau: number[] } {
  const n = input.count
  const H = input.hubble
  const T = input.properTime
  const eHT = Math.exp(H * T)
  const tau: number[] = []
  const x: number[] = []
  const eta: number[] = []
  for (let i = 0; i < n; i++) {
    // Inverse-CDF sample of tau with density proportional to a(tau) = e^{H tau}.
    const u = input.rng.next()
    const t = (1 / H) * Math.log(1 + u * (eHT - 1))
    tau.push(t)
    x.push(input.rng.next() * input.comovingWidth)
    eta.push((1 - Math.exp(-H * t)) / H)
  }

  // Sort by proper time so the labelling is topological (past before future).
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => (tau[a] ?? 0) - (tau[b] ?? 0),
  )
  const sTau = order.map(i => tau[i] ?? 0)
  const sX = order.map(i => x[i] ?? 0)
  const sEta = order.map(i => eta[i] ?? 0)

  const future = makeBitMatrix({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // i precedes j (sTau[i] <= sTau[j]) iff inside the forward light cone.
      if (
        Math.abs((sX[j] ?? 0) - (sX[i] ?? 0)) <=
        (sEta[j] ?? 0) - (sEta[i] ?? 0)
      ) {
        setBit(future, { row: i, col: j })
      }
    }
  }

  // Transitive closure (forward pass; labelling is topological).
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < k; i++) {
      if (getBit(future, { row: i, col: k })) {
        for (let j = k + 1; j < n; j++) {
          if (getBit(future, { row: k, col: j })) {
            setBit(future, { row: i, col: j })
          }
        }
      }
    }
  }

  return { poset: makePosetFromFuture({ size: n, future }), tau: sTau }
}
