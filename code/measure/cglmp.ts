// The CGLMP inequality for two qutrits (Collins, Gisin, Linden, Massar, Popescu 2002), in floats.
//
//   I3 = [P(A1 = B1) + P(B1 = A2 + 1) + P(A2 = B2) + P(B2 = A1)]
//      - [P(A1 = B1 - 1) + P(B1 = A2) + P(A2 = B2 - 1) + P(B2 = A1 - 1)],
//
// outcomes in Z_3. Every local model gives I3 <= 2. A setting is a 3 x 3 unitary whose columns are the outcome
// vectors (a projective reading). A state is an ensemble of pure two-qutrit states with weights, amplitude
// index 3 i + j. The standard settings are the Fourier readings with phases alpha = 0, 1/2 for Alice and
// beta = -1/4, 1/4 for Bob (|k>_a = sum_j exp(2 pi i j (k + alpha_a) / 3) |j> / sqrt 3, Bob with the opposite
// sign), which give 4 / (6 sqrt 3 - 9) = 2.8729 on the maximally entangled state; the largest value over all
// states and readings known is 1 + sqrt(11/3) = 2.9149 (Acin, Durt, Gisin, Latorre 2002).
//
// The optimizer is deterministic: each of the four readings is the Gram-Schmidt frame of 1 + X, X a complex
// 3 x 3 matrix (72 real parameters in all), started from Weyl points, and climbed by gradient ascent (central
// differences) with a backtracking step. It returns contractions of nothing: every frame is orthonormal to
// rounding, so its value is a value of a real quantum reading.

import { weyl } from '@/code/tool/weyl'

export type Ensemble = { weight: number; re: number[]; im: number[] }[]
// a reading: column k is outcome k's vector; re[3 i + k], im[3 i + k]
export type Frame = { re: number[]; im: number[] }
export type Settings = [Frame, Frame, Frame, Frame] // A1, A2, B1, B2

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// coefficient of P(A_a = k, B_b = l) in I3
export function cglmpCoefficient(
  a: number,
  b: number,
  k: number,
  l: number,
): number {
  const d = mod3(k - l)

  if (a === 0 && b === 0) {
    return d === 0 ? 1 : d === 2 ? -1 : 0
  }

  if (a === 1 && b === 0) {
    // + P(A2 = B1 - 1), - P(A2 = B1)
    return d === 2 ? 1 : d === 0 ? -1 : 0
  }

  if (a === 1 && b === 1) {
    return d === 0 ? 1 : d === 2 ? -1 : 0
  }

  // a = 0, b = 1: + P(A1 = B2), - P(A1 = B2 + 1)
  return d === 0 ? 1 : d === 1 ? -1 : 0
}

export function fourierFrame(sign: number, shift: number): Frame {
  const re: number[] = new Array<number>(9).fill(0)
  const im: number[] = new Array<number>(9).fill(0)

  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 3; j++) {
      const t = (sign * 2 * Math.PI * j * (k + shift)) / 3

      re[3 * j + k] = Math.cos(t) / Math.sqrt(3)
      im[3 * j + k] = Math.sin(t) / Math.sqrt(3)
    }
  }

  return { re, im }
}

export function standardSettings(): Settings {
  return [
    fourierFrame(1, 0),
    fourierFrame(1, 0.5),
    fourierFrame(-1, -0.25),
    fourierFrame(-1, 0.25),
  ]
}

export function cglmpValue(state: Ensemble, s: Settings): number {
  let total = 0

  for (const { weight, re, im } of state) {
    for (let a = 0; a < 2; a++) {
      const fa = s[a]!

      for (let b = 0; b < 2; b++) {
        const fb = s[2 + b]!

        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            const c = cglmpCoefficient(a, b, k, l)

            if (c === 0) {
              continue
            }

            // <a_k b_l | psi> = sum conj(a_k(i)) conj(b_l(j)) psi(3 i + j)
            let xr = 0
            let xi = 0

            for (let i = 0; i < 3; i++) {
              const ar = fa.re[3 * i + k]!
              const ai = -fa.im[3 * i + k]!

              for (let j = 0; j < 3; j++) {
                const br = fb.re[3 * j + l]!
                const bi = -fb.im[3 * j + l]!
                const pr = re[3 * i + j]!
                const pi = im[3 * i + j]!
                const tr = ar * br - ai * bi
                const ti = ar * bi + ai * br

                xr += tr * pr - ti * pi
                xi += tr * pi + ti * pr
              }
            }

            total += weight * c * (xr * xr + xi * xi)
          }
        }
      }
    }
  }

  return total
}

// the Bell operator sum c P^A (x) P^B as a 9 x 9 complex matrix (row major)
export function bellOperator(s: Settings): {
  re: number[]
  im: number[]
} {
  const re = new Array<number>(81).fill(0)
  const im = new Array<number>(81).fill(0)

  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const c = cglmpCoefficient(a, b, k, l)

          if (c === 0) {
            continue
          }

          // v = a_k (x) b_l, add c v v^dagger
          const vr: number[] = []
          const vi: number[] = []

          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const ar = s[a]!.re[3 * i + k]!
              const ai = s[a]!.im[3 * i + k]!
              const br = s[2 + b]!.re[3 * j + l]!
              const bi = s[2 + b]!.im[3 * j + l]!

              vr.push(ar * br - ai * bi)
              vi.push(ar * bi + ai * br)
            }
          }

          for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
              re[9 * x + y] =
                re[9 * x + y]! + c * (vr[x]! * vr[y]! + vi[x]! * vi[y]!)

              im[9 * x + y] =
                im[9 * x + y]! + c * (vi[x]! * vr[y]! - vr[x]! * vi[y]!)
            }
          }
        }
      }
    }
  }

  return { re, im }
}

// Gram-Schmidt of the columns of 1 + X, X from 18 parameters (re then im, row major)
export function frameOf(x: ArrayLike<number>, offset: number): Frame {
  const cols: [number[], number[]][] = []

  for (let k = 0; k < 3; k++) {
    let vr = [0, 1, 2].map(
      i => (i === k ? 1 : 0) + x[offset + 3 * i + k]!,
    )
    let vi = [0, 1, 2].map(i => x[offset + 9 + 3 * i + k]!)

    for (const [ur, ui] of cols) {
      // v -= <u|v> u
      let pr = 0
      let pi = 0

      for (let i = 0; i < 3; i++) {
        pr += ur[i]! * vr[i]! + ui[i]! * vi[i]!
        pi += ur[i]! * vi[i]! - ui[i]! * vr[i]!
      }

      vr = vr.map((v, i) => v - (pr * ur[i]! - pi * ui[i]!))
      vi = vi.map((v, i) => v - (pr * ui[i]! + pi * ur[i]!))
    }

    const n = Math.sqrt(
      vr.reduce((s, v, i) => s + v * v + vi[i]! ** 2, 0),
    )

    cols.push([vr.map(v => v / n), vi.map(v => v / n)])
  }

  const re = new Array<number>(9)
  const im = new Array<number>(9)

  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 3; i++) {
      re[3 * i + k] = cols[k]![0][i]!
      im[3 * i + k] = cols[k]![1][i]!
    }
  }

  return { re, im }
}

export function settingsOf(x: ArrayLike<number>): Settings {
  return [frameOf(x, 0), frameOf(x, 18), frameOf(x, 36), frameOf(x, 54)]
}

// the largest defect |U^dagger U - 1| over the four frames
export function frameDefect(s: Settings): number {
  let worst = 0

  for (const f of s) {
    for (let p = 0; p < 3; p++) {
      for (let q = 0; q < 3; q++) {
        let r = 0
        let m = 0

        for (let i = 0; i < 3; i++) {
          r +=
            f.re[3 * i + p]! * f.re[3 * i + q]! +
            f.im[3 * i + p]! * f.im[3 * i + q]!

          m +=
            f.re[3 * i + p]! * f.im[3 * i + q]! -
            f.im[3 * i + p]! * f.re[3 * i + q]!
        }

        worst = Math.max(
          worst,
          Math.abs(r - (p === q ? 1 : 0)),
          Math.abs(m),
        )
      }
    }
  }

  return worst
}

// gradient ascent from `starts` Weyl starts; returns the best value and its settings
export function cglmpOptimize(input: {
  state: Ensemble
  starts: number
  iterations?: number
  offset?: number
}): { value: number; settings: Settings; values: number[] } {
  const { state, starts, iterations = 600, offset = 0 } = input
  const n = 72
  const h = 1e-6
  const f = (x: Float64Array): number =>
    cglmpValue(state, settingsOf(x))

  let best = -Infinity
  let bestX = new Float64Array(n)

  const values: number[] = []

  for (let s = 0; s < starts; s++) {
    let x = Float64Array.from(
      { length: n },
      (_, k) => 2 * weyl(1 + (offset + s) * n + k) - 1,
    )
    let fx = f(x)
    let step = 0.1

    for (let it = 0; it < iterations; it++) {
      const g = new Float64Array(n)

      for (let k = 0; k < n; k++) {
        const xp = Float64Array.from(x)
        const xm = Float64Array.from(x)

        xp[k] = xp[k]! + h
        xm[k] = xm[k]! - h
        g[k] = (f(xp) - f(xm)) / (2 * h)
      }

      const gn = Math.sqrt(g.reduce((t, v) => t + v * v, 0))

      if (gn < 1e-10) {
        break
      }

      let moved = false

      for (let tries = 0; tries < 40; tries++) {
        const y = Float64Array.from(
          x,
          (v, k) => v + (step * g[k]!) / gn,
        )
        const fy = f(y)

        if (fy > fx) {
          x = y
          fx = fy
          step *= 1.5
          moved = true
          break
        }

        step /= 2
      }

      if (!moved) {
        break
      }
    }

    values.push(fx)

    if (fx > best) {
      best = fx
      bestX = x
    }
  }

  return { value: best, settings: settingsOf(bestX), values }
}

// sum sqrt(p_k) |k k>
export function schmidtState(p: readonly number[]): Ensemble {
  const re = new Array<number>(9).fill(0)
  const im = new Array<number>(9).fill(0)

  p.forEach((w, k) => {
    re[4 * k] = Math.sqrt(w)
  })

  return [{ weight: 1, re, im }]
}

// sum p_k |k k><k k|, the dephased Schmidt state (separable)
export function dephasedState(p: readonly number[]): Ensemble {
  return p.map((w, k) => {
    const re = new Array<number>(9).fill(0)

    re[4 * k] = 1

    return { weight: w, re, im: new Array<number>(9).fill(0) }
  })
}
