// THE TURNED COMPOSITE: A MIXER-ON EIGENLEVEL OF THREE HOLES ON THE SLAB (E-SPN-0144). E-SPN-0141 found the straight
// three-hole level sits inside a dense multiplet of bent 2d three-hole levels that the mixer-off beat never couples, so
// any turning mixes them in, and a level read at rate 0 is the wrong reference. These are the tools that read the level
// the mixer itself makes: symmetry sectors of the slab, a narrow spectral filter, the Krylov level with the most
// overlap on a reference, and the first-order (degenerate) action of the mixer within a family of rate-0 levels.
//
//   slabSymmetry     the slab's square symmetry on configurations: reflect x (x -> max - x, the axis-0 slots swapped),
//                    reflect y, swap the axes (x <-> y, slot 2a + j -> 2 (1 - a) + j). Every piece of the beat at
//                    K = 0 commutes with all three (the coin is k I + c X on each line, symmetric under its swap; the
//                    cost reads the Steiner length; the mixer reads the dock's slot sum; the window is symmetric), so a
//                    level can be read inside one character of the group
//   sectorProject    the projector onto the characters (x, y, and the swap when x = y) of those reflections
//   uniformCount     N_u = sum over holes of the projector onto the dock's uniform slot mode. The frame mixer on a hole
//                    is I + (e^(-i theta) - 1) J / 4 = exp(-i theta J / 4), and the holes' projectors commute, so the
//                    whole mixer is exp(-i theta N_u) and a beat at rate n is U(n) = U(0) exp(-i theta N_u), exactly
//   blackmanHarris   the four-term window: a spectral filter with sidelobes at -92 dB, so a level more than 8 pi / T
//                    from the center keeps under 1e-9 of its weight
//   filterSlab       F s = sum_t w_t e^(i E t) U^t s, normalized: the start's content within a narrow band of E
//   followLevel      the Krylov (Toeplitz) Ritz levels of the filtered start, each level's overlap with a reference
//                    read from the same pass, and the vector of the level that overlaps it most
//   levelResidual    |U v - <v|U v> v| for a unit v, and the Rayleigh eigenvalue
//   familyAction     the first-order action of the mixer within a family of rate-0 levels: <v_j|N_u|v_k>
//
// Floats, as measurement. DETERMINISM: no random numbers; every start is placed, filtered or followed. NOTHING MOVES:
// these are readings of code/measure/slab-holes slabBeat, which is unchanged.

import { type Ritz } from '@/code/measure/frame-meson'
import { emptyState, innerSlab, slabBeat, slabLevelVector, weightOfSlab, type SlabSpace, type SlabState, type SlabTally } from '@/code/measure/slab-holes'

type C = [number, number]

export type SlabOp = 'reflect-x' | 'reflect-y' | 'swap'

// the entry permutation of a symmetry: entry e = p * block + b goes to perm[e]
export function slabSymmetry(space: SlabSpace, op: SlabOp): Int32Array {
  const { spec, slots, block, configs } = space
  const n = spec.holes
  const A = spec.axes

  if (A !== 2) throw new Error('slab-turned-level: the symmetries are the slab`s (axes 2)')

  const dims = n * A
  const index = new Map<string, number>()

  for (let p = 0; p < configs; p++) index.set(Array.from(space.coords.subarray(p * dims, (p + 1) * dims)).join(','), p)

  const slotMap = (s: number): number => {
    if (op === 'swap') return 2 * (1 - (s >> 1)) + (s & 1)
    if (op === 'reflect-x') return s >> 1 === 0 ? s ^ 1 : s

    return s >> 1 === 1 ? s ^ 1 : s
  }

  const perm = new Int32Array(configs * block)
  const c = new Array<number>(dims)
  const sl = new Array<number>(n)

  for (let p = 0; p < configs; p++) {
    for (let q = 0; q < dims; q++) c[q] = space.coords[p * dims + q] as number

    const d: number[] = new Array<number>(dims)

    if (op === 'swap') {
      for (let i = 0; i < n; i++) {
        d[i * A] = c[i * A + 1] as number
        d[i * A + 1] = c[i * A] as number
      }
    } else {
      const axis = op === 'reflect-x' ? 0 : 1
      let hi = -Infinity

      for (let i = 0; i < n; i++) hi = Math.max(hi, c[i * A + axis] as number)
      for (let i = 0; i < n; i++) {
        d[i * A + axis] = hi - (c[i * A + axis] as number)
        d[i * A + 1 - axis] = c[i * A + 1 - axis] as number
      }
    }

    const to = index.get(d.join(','))

    if (to === undefined) throw new Error('slab-turned-level: a symmetric image is outside the window')

    for (let b = 0; b < block; b++) {
      let r = b

      for (let i = n - 1; i >= 0; i--) {
        sl[i] = r % slots
        r = Math.floor(r / slots)
      }

      let b2 = 0

      for (let i = 0; i < n; i++) b2 = b2 * slots + slotMap(sl[i] as number)
      perm[p * block + b] = to * block + b2
    }
  }

  return perm
}

export function actSymmetry(perm: Int32Array, s: SlabState): SlabState {
  const re = new Float64Array(s.re.length)
  const im = new Float64Array(s.im.length)

  for (let e = 0; e < perm.length; e++) {
    const t = perm[e] as number

    re[t] = s.re[e] as number
    im[t] = s.im[e] as number
  }

  return { re, im }
}

// <s|g s> / <s|s>
export function characterOf(perm: Int32Array, s: SlabState): C {
  const g = actSymmetry(perm, s)
  const [r, i] = innerSlab(s, g)
  const w = weightOfSlab(s)

  return [r / w, i / w]
}

export type SlabPerms = { x: Int32Array; y: Int32Array; swap: Int32Array }

export const slabPerms = (space: SlabSpace): SlabPerms => ({ x: slabSymmetry(space, 'reflect-x'), y: slabSymmetry(space, 'reflect-y'), swap: slabSymmetry(space, 'swap') })

export type SlabSector = { x: 1 | -1; y: 1 | -1; swap?: 1 | -1 }

const combine = (a: SlabState, b: SlabState, f: number): SlabState => ({ re: a.re.map((v, k) => v + f * (b.re[k] as number)), im: a.im.map((v, k) => v + f * (b.im[k] as number)) })

// (1 + x R_x)(1 + y R_y)(1 + swap W) / (4 or 8) s, not normalized
export function sectorProject(perms: SlabPerms, s: SlabState, sector: SlabSector): SlabState {
  let u = combine(s, actSymmetry(perms.x, s), sector.x)

  u = combine(u, actSymmetry(perms.y, u), sector.y)

  let scale = 0.25

  if (sector.swap !== undefined) {
    if (sector.x !== sector.y) throw new Error('slab-turned-level: the swap character needs x = y')
    u = combine(u, actSymmetry(perms.swap, u), sector.swap)
    scale = 0.125
  }

  return { re: u.re.map(v => v * scale), im: u.im.map(v => v * scale) }
}

// N_u s: per hole, its four slots replaced by their mean, summed over the holes
export function uniformCount(space: SlabSpace, s: SlabState): SlabState {
  const { spec, slots, configs, block } = space
  const n = spec.holes
  const out = emptyState(space)

  for (let i = 0; i < n; i++) {
    const stride = slots ** (n - 1 - i)

    for (let base = 0; base < configs * block; base += stride * slots) {
      for (let o = 0; o < stride; o++) {
        let sr = 0
        let si = 0

        for (let q = 0; q < slots; q++) {
          sr += s.re[base + o + q * stride] as number
          si += s.im[base + o + q * stride] as number
        }

        for (let q = 0; q < slots; q++) {
          out.re[base + o + q * stride] = (out.re[base + o + q * stride] as number) + sr / slots
          out.im[base + o + q * stride] = (out.im[base + o + q * stride] as number) + si / slots
        }
      }
    }
  }

  return out
}

export function blackmanHarris(T: number): number[] {
  const a = [0.35875, 0.48829, 0.14128, 0.01168]

  return Array.from({ length: T }, (_, t) => {
    const x = (2 * Math.PI * t) / (T - 1)

    return (a[0] as number) - (a[1] as number) * Math.cos(x) + (a[2] as number) * Math.cos(2 * x) - (a[3] as number) * Math.cos(3 * x)
  })
}

export const normalizeSlab = (s: SlabState): SlabState => {
  const w = Math.sqrt(weightOfSlab(s))

  return { re: s.re.map(v => v / w), im: s.im.map(v => v / w) }
}

// F s = sum_t w_t e^(i E t) U^t s over t = 0 .. T - 1, normalized; a level e^(-i E' t) passes with gain
// sum_t w_t e^(i (E - E') t)
export function filterSlab(space: SlabSpace, K: readonly number[], s: SlabState, E: number, T: number): SlabState {
  const w = blackmanHarris(T)
  const tally: SlabTally = { escaped: 0 }
  const out = emptyState(space)
  let u: SlabState = { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }

  for (let t = 0; t < T; t++) {
    if (t > 0) u = slabBeat(space, K, u, tally)

    const fr = (w[t] as number) * Math.cos(E * t)
    const fi = (w[t] as number) * Math.sin(E * t)

    for (let k = 0; k < u.re.length; k++) {
      const ur = u.re[k] as number
      const ui = u.im[k] as number

      if (ur === 0 && ui === 0) continue
      out.re[k] = (out.re[k] as number) + fr * ur - fi * ui
      out.im[k] = (out.im[k] as number) + fr * ui + fi * ur
    }
  }

  return normalizeSlab(out)
}

export type FollowedLevel = { energy: number; weight: number; overlap: number; residual: number; coefficients: C[] }

export type Followed = { levels: FollowedLevel[]; chosen: number; vector: SlabState; filtered: SlabState }

// the Ritz levels of the filtered start over `ritzBeats` beats; the overlap of each with `reference` (unit) from
// d(t) = <reference|U^t f>; the vector of the level of largest overlap
export function followLevel(
  space: SlabSpace,
  K: readonly number[],
  start: SlabState,
  input: { E: number; filterBeats: number; ritzBeats: number; reference: SlabState; ritz: (c: readonly C[]) => Ritz[] },
): Followed {
  const f = filterSlab(space, K, start, input.E, input.filterBeats)
  const tally: SlabTally = { escaped: 0 }
  const c: C[] = [innerSlab(f, f)]
  const d: C[] = [innerSlab(input.reference, f)]
  let u: SlabState = { re: Float64Array.from(f.re), im: Float64Array.from(f.im) }

  for (let t = 1; t <= input.ritzBeats; t++) {
    u = slabBeat(space, K, u, tally)
    c.push(innerSlab(f, u))
    d.push(innerSlab(input.reference, u))
  }

  const levels: FollowedLevel[] = input.ritz(c).map(l => {
    let r = 0
    let i = 0

    l.coefficients.forEach((x, t) => {
      const z = d[t] as C

      r += x[0] * z[0] - x[1] * z[1]
      i += x[0] * z[1] + x[1] * z[0]
    })

    return { energy: l.energy, weight: l.weight, overlap: r * r + i * i, residual: l.residual, coefficients: l.coefficients }
  })

  let chosen = 0

  levels.forEach((l, k) => {
    if (l.overlap > (levels[chosen] as FollowedLevel).overlap) chosen = k
  })

  const vector = slabLevelVector(space, K, f, (levels[chosen] as FollowedLevel).coefficients)

  return { levels, chosen, vector, filtered: f }
}

// |U v - lambda v| for a unit v, lambda = <v|U v>
export function levelResidual(space: SlabSpace, K: readonly number[], v: SlabState): { residual: number; lambda: C; energy: number } {
  const u = slabBeat(space, K, { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }, { escaped: 0 })
  const lam = innerSlab(v, u)
  let r = 0

  for (let k = 0; k < u.re.length; k++) {
    const vr = v.re[k] as number
    const vi = v.im[k] as number
    const dr = (u.re[k] as number) - (lam[0] * vr - lam[1] * vi)
    const di = (u.im[k] as number) - (lam[0] * vi + lam[1] * vr)

    r += dr * dr + di * di
  }

  return { residual: Math.sqrt(r), lambda: lam, energy: -Math.atan2(lam[1], lam[0]) }
}

// the level at momentum K continued from a K = 0 level v: the dominant Krylov Ritz level of v under U_K over `beats`
// beats, its vector, and its explicit Rayleigh energy and residual (the Toeplitz Ritz energy is not used: on a start
// that is not one level it is off by up to 1e-4)
export function levelAt(space: SlabSpace, K: readonly number[], v: SlabState, beats: number, ritz: (c: readonly C[]) => Ritz[]): { energy: number; residual: number; weight: number } {
  const tally: SlabTally = { escaped: 0 }
  const c: C[] = [innerSlab(v, v)]
  let u: SlabState = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

  for (let t = 1; t <= beats; t++) {
    u = slabBeat(space, K, u, tally)
    c.push(innerSlab(v, u))
  }

  const level = ritz(c).sort((x, y) => y.weight - x.weight)[0] as Ritz
  const w = slabLevelVector(space, K, v, level.coefficients)
  const r = levelResidual(space, K, w)

  return { energy: r.energy, residual: r.residual, weight: level.weight }
}

// the inverse mass tensor of a K = 0 level by second differences of levelAt energies: xx also Richardson-extrapolated
// from kappa and 2 kappa (the inertia), the tensor from xx, yy and the diagonal at kappa; E(K) = E(-K) is used (the level is even under both reflections, which
// map K to -K along their axis)
export function turnedTensor(space: SlabSpace, v: SlabState, E0: number, kappa: number, beats: number, ritz: (c: readonly C[]) => Ritz[]): { xx: number; xxSingle: number; yy: number; xy: number; eigen: [number, number]; worstResidual: number; leastWeight: number } {
  const reads: { energy: number; residual: number; weight: number }[] = []
  const second = (K: readonly number[], k: number): number => {
    const r = levelAt(space, K, v, beats, ritz)
    const d = r.energy - E0
    const wrapped = d - 2 * Math.PI * Math.round(d / (2 * Math.PI))

    reads.push(r)

    return (2 * wrapped) / (k * k)
  }
  const xxSingle = second([kappa, 0], kappa)
  const xxDouble = second([2 * kappa, 0], 2 * kappa)
  const xx = (4 * xxSingle - xxDouble) / 3
  const yy = second([0, kappa], kappa)
  const dd = second([kappa * Math.SQRT1_2, kappa * Math.SQRT1_2], kappa)
  // the tensor's eigenvalues from the three single-kappa reads, so all three carry the same K^4 error
  const xy = dd - (xxSingle + yy) / 2
  const mean = (xxSingle + yy) / 2
  const rr = Math.sqrt(((xxSingle - yy) / 2) ** 2 + xy * xy)

  return { xx, xxSingle, yy, xy, eigen: [mean - rr, mean + rr], worstResidual: Math.max(...reads.map(r => r.residual)), leastWeight: Math.min(...reads.map(r => r.weight)) }
}

// <v_j|N_u|v_k> over a family of unit vectors, row-major
export function familyAction(space: SlabSpace, family: readonly SlabState[]): { re: Float64Array; im: Float64Array } {
  const m = family.length
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)
  const pushed = family.map(v => uniformCount(space, v))

  for (let j = 0; j < m; j++) {
    for (let k = 0; k < m; k++) {
      const [r, i] = innerSlab(family[j] as SlabState, pushed[k] as SlabState)

      re[j * m + k] = r
      im[j * m + k] = i
    }
  }

  return { re, im }
}

// the weight of N_u v outside the span of an orthonormal family, |(1 - P) N_u v|^2
export function pushOutside(space: SlabSpace, family: readonly SlabState[], v: SlabState): number {
  const p = uniformCount(space, v)
  let w = weightOfSlab(p)

  for (const f of family) {
    const [r, i] = innerSlab(f, p)

    w -= r * r + i * i
  }

  return w
}
