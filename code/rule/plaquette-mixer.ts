// THE CONTROLLED PLAQUETTE MIXER (E-SPN-0116; note/research/vibe/roadmap/remaining-pieces.md, section 3, "a bound pair on
// crossing lines" and "the plaquette move"). E-SPN-0110 found a string's path between two lines frozen: the rule writes a
// link's trit only where a vibe copies across it, so Gauss fixes the flux only up to closed loops and nothing changes
// the loops. E-GRV-0130's plaquette move changed them CLASSICALLY, on expected fields, and spread the string. This is the
// QUANTUM version: on each face, Kogut-Susskind's magnetic term f(U_p) as a quantum-walk coin on the face's Z_3 clock
// shift, applied only where the string already touches the face.
//
// THE REGISTER. A trit f_l on every link of a planar patch of the mesh (the plane of two crossing lines, closed into an
// L x L torus). Stored sparsely: only the nonzero trits.
//
// THE FACE SHIFT U_p: f_l -> f_l + s_l for the face's boundary links l (s_l = +1 along the link, -1 against). It adds a
// closed loop, so the divergence of f (Gauss's charge on every dock) is unchanged, exactly, on integers.
//
// THE CONTROL. The oriented values o_l = s_l f_l (mod 3) around the face. U_p adds the same 1 to every o_l, so the
// DIFFERENCES o_l - o_l' are unchanged by U_p: the control reads only them. The face is ON when they are not all zero
// (the boundary is not a uniform loop), OFF when they are. So the control is constant on every U_p orbit, and the face's
// piece is f(U_p) on ON orbits and the identity on OFF ones. A face whose boundary holds no flux is OFF: the vacuum is a
// fixed point. A face with a string passing along one or two of its links is ON: that is where the string bends.
//
// THE PIECE on an ON orbit, a 3-cycle {x, U x, U^2 x}: f(U) = sum_B zeta_M^(-r bal(B)^2) Pi_B (Pi_B the projector on
// U's eigenvalue w^B), which is code/rule/lattice-qed's 'loop' step; its entries are g_k / 3 with g_0 = 1 + 2 lambda,
// g_1 = g_2 = 1 - lambda, lambda = zeta_M^(-r). EXACT: every entry in (1/3) Z[zeta_M]. UNITARY: its eigenvalues are
// zeta_M^(-r bal(B)^2), roots of unity. REVERSIBLE: the inverse is the same step with every exponent negated (f(U)^+).
// M = 42 holds the coin's w = zeta_42^14, the cost's zeta_14 = zeta_42^3 and this piece at once (the rule's ring,
// Z[zeta_42] with the common denominator 2^a 3^b carried).
//
// THE WINDOW. A stand-in may restrict the mixer to the faces within `window` docks of the crossing X (a face outside it
// is never live). The piece stays exact, unitary and Gauss-keeping on every live face; the window only says where the
// string may bend.
//
// THE ORDER. Two faces that share a link do not commute (each reads the other's links). The faces split into two
// CLASSES with no shared link inside a class (square faces: a + b even or odd; triangles: up or down), so every class's
// pieces commute and act on disjoint links, and the mixer is class 0 then class 1: a product of unitaries, in a fixed
// order. Nothing is drawn.
//
// WHAT IT CHANGES. A basis configuration is fixed iff every face is OFF (every boundary uniform): the empty register,
// and nothing that carries an open string. It never moves a vibe and never reads one, so every vibe's line is kept.
// It does NOT commute with the stream's recorded copy (the copy changes a face's differences), so a vibe dragging a
// string decoheres over the string's shapes: that is the price of keeping the vacuum, derived in the experiment.

import { applyExact, reduce, type Exact, type Step } from '@/code/rule/lattice-qed'

export type PlaneKind = 'square' | 'triangle'

// a planar patch: the torus L x L of docks (a, b), dock a + L b. Link directions: 0 = A (a + 1), 1 = B (b + 1), and for
// triangles 2 = C (a - 1, b + 1). Link index dir L^2 + dock.
export type PlanePatch = {
  readonly L: number
  readonly kind: PlaneKind
  readonly dirs: number
  readonly links: number
  // faces: `size` boundary links each, with signs, and a class 0 or 1
  readonly size: number
  readonly faces: number
  readonly faceLink: Int32Array
  readonly faceSign: Int8Array
  readonly faceClass: Uint8Array
  // the two faces each link bounds
  readonly linkFaces: Int32Array
  // the faces the mixer acts on: every corner within `window` docks of X (max(|a|, |b|), signed); the rest never mix
  readonly window: number
  readonly faceLive: Uint8Array
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

// the dock step of each link direction, (da, db)
const STEPS = [
  [1, 0],
  [0, 1],
  [-1, 1],
] as const

export function planePatch(L: number, kind: PlaneKind, window = Infinity): PlanePatch {
  if (kind === 'square' && L % 2 !== 0) throw new Error('planePatch: a square patch needs L even (two classes)')

  const dock = (a: number, b: number): number => mod(a, L) + L * mod(b, L)
  const link = (dir: number, a: number, b: number): number => dir * L * L + dock(a, b)
  const dirs = kind === 'square' ? 2 : 3
  const size = kind === 'square' ? 4 : 3
  const faces = kind === 'square' ? L * L : 2 * L * L
  const faceLink = new Int32Array(faces * size)
  const faceSign = new Int8Array(faces * size)
  const faceClass = new Uint8Array(faces)
  let f = 0
  const put = (ls: readonly (readonly [number, number])[], c: number): void => {
    ls.forEach(([l, s], k) => {
      faceLink[f * size + k] = l
      faceSign[f * size + k] = s
    })
    faceClass[f] = c
    f++
  }

  for (let b = 0; b < L; b++) {
    for (let a = 0; a < L; a++) {
      if (kind === 'square') {
        put(
          [
            [link(0, a, b), 1],
            [link(1, a + 1, b), 1],
            [link(0, a, b + 1), -1],
            [link(1, a, b), -1],
          ],
          (a + b) % 2,
        )
      } else {
        // up: (a, b) -> (a + 1, b) -> (a, b + 1) -> (a, b)
        put(
          [
            [link(0, a, b), 1],
            [link(2, a + 1, b), 1],
            [link(1, a, b), -1],
          ],
          0,
        )
        // down: (a + 1, b) -> (a + 1, b + 1) -> (a, b + 1) -> (a + 1, b)
        put(
          [
            [link(1, a + 1, b), 1],
            [link(0, a, b + 1), -1],
            [link(2, a + 1, b), -1],
          ],
          1,
        )
      }
    }
  }

  const links = dirs * L * L
  const linkFaces = new Int32Array(links * 2).fill(-1)

  for (let g = 0; g < faces; g++) {
    for (let k = 0; k < size; k++) {
      const l = faceLink[g * size + k] as number

      if (linkFaces[l * 2] === -1) linkFaces[l * 2] = g
      else if (linkFaces[l * 2 + 1] === -1) linkFaces[l * 2 + 1] = g
      else throw new Error('planePatch: a link bounds more than two faces')
    }
  }

  const faceLive = new Uint8Array(faces)
  const signed = (x: number): number => (x <= L / 2 ? x : x - L)

  for (let g = 0; g < faces; g++) {
    let far = 0

    for (let k = 0; k < size; k++) {
      const l = faceLink[g * size + k] as number
      const d = l % (L * L)
      const [da, db] = STEPS[Math.floor(l / (L * L))] as readonly [number, number]

      for (const [a, b] of [
        [d % L, Math.floor(d / L)],
        [mod((d % L) + da, L), mod(Math.floor(d / L) + db, L)],
      ] as const) {
        far = Math.max(far, Math.abs(signed(a)), Math.abs(signed(b)))
      }
    }

    faceLive[g] = far <= window ? 1 : 0
  }

  return { L, kind, dirs, links, size, faces, faceLink, faceSign, faceClass, linkFaces, window, faceLive }
}

export const liveFaces = (p: PlanePatch): number => p.faceLive.reduce((a, x) => a + x, 0)

// no two faces of one class share a link (checked, not assumed)
export function classesDisjoint(p: PlanePatch): boolean {
  for (let l = 0; l < p.links; l++) {
    const g = p.linkFaces[l * 2] as number
    const h = p.linkFaces[l * 2 + 1] as number

    if (g < 0 || h < 0 || p.faceClass[g] === p.faceClass[h]) return false
  }

  return true
}

// the sparse register: link -> trit 1 or 2 (a zero is absent)
export type Flux = Map<number, number>

export const fluxKey = (f: Flux): string =>
  [...f.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([l, v]) => `${l}:${v}`)
    .join(',')

export function fluxFromKey(key: string): Flux {
  const f: Flux = new Map()

  if (key === '') return f
  for (const t of key.split(',')) {
    const [l, v] = t.split(':').map(Number) as [number, number]

    f.set(l, v)
  }

  return f
}

export function addTrit(f: Flux, l: number, v: number): void {
  const x = mod((f.get(l) ?? 0) + v, 3)

  if (x === 0) f.delete(l)
  else f.set(l, x)
}

// is face g ON: its oriented values not all equal
export function faceOn(p: PlanePatch, f: Flux, g: number): boolean {
  let first = -1

  for (let k = 0; k < p.size; k++) {
    const o = mod((p.faceSign[g * p.size + k] as number) * (f.get(p.faceLink[g * p.size + k] as number) ?? 0), 3)

    if (k === 0) first = o
    else if (o !== first) return true
  }

  return false
}

// U_p^m on a copy of f
export function faceShift(p: PlanePatch, f: Flux, g: number, m: number): Flux {
  const out: Flux = new Map(f)

  for (let k = 0; k < p.size; k++) addTrit(out, p.faceLink[g * p.size + k] as number, m * (p.faceSign[g * p.size + k] as number))

  return out
}

// the ON faces of class c touching f (a face with no flux on its boundary is OFF, so only faces of nonzero links count)
export function activeFaces(p: PlanePatch, f: Flux, c: number): number[] {
  const seen = new Set<number>()

  for (const l of f.keys()) {
    for (const g of [p.linkFaces[l * 2] as number, p.linkFaces[l * 2 + 1] as number]) {
      if (p.faceClass[g] === c && p.faceLive[g] === 1 && !seen.has(g) && faceOn(p, f, g)) seen.add(g)
    }
  }

  return [...seen].sort((x, y) => x - y)
}

// divergence of f at every dock with a nonzero value, as a sorted key (Gauss's charges)
export function divergenceKey(p: PlanePatch, f: Flux): string {
  const L2 = p.L * p.L
  const div = new Map<number, number>()

  for (const [l, v] of f) {
    const dir = Math.floor(l / L2)
    const d = l % L2
    const a = d % p.L
    const b = Math.floor(d / p.L)
    const [da, db] = STEPS[dir] as readonly [number, number]
    const to = mod(a + da, p.L) + p.L * mod(b + db, p.L)

    div.set(d, mod((div.get(d) ?? 0) + v, 3))
    div.set(to, mod((div.get(to) ?? 0) - v, 3))
  }

  return [...div.entries()]
    .filter(([, v]) => v !== 0)
    .sort((x, y) => x[0] - y[0])
    .map(([d, v]) => `${d}:${v}`)
    .join(',')
}

// THE MIXER: M = 42 and r (the magnetic exponent, theta = 2 pi r / M)
export type Mixer = { readonly m: number; readonly r: number }

export type Amp = [number, number]

// the float amplitudes of f(U) on an ON orbit: [stay, shift by 1, shift by 2]
export function mixerAmplitudes(mix: Mixer): [Amp, Amp, Amp] {
  const t = (-2 * Math.PI * mix.r) / mix.m
  const lambda: Amp = [Math.cos(t), Math.sin(t)]
  const stay: Amp = [(1 + 2 * lambda[0]) / 3, (2 * lambda[1]) / 3]
  const move: Amp = [(1 - lambda[0]) / 3, -lambda[1] / 3]

  return [stay, move, [move[0], move[1]]]
}

const cmul = (a: Amp, b: Amp): Amp => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]

// one class of the mixer on one basis register: the branches (register, amplitude), every branch whose weight is at
// least `floor`; the product over the class's ON faces, which act on disjoint links and commute
export function mixClass(p: PlanePatch, mix: Mixer, f: Flux, c: number, floor: number): { flux: Flux; amp: Amp }[] {
  const faces = activeFaces(p, f, c)

  if (faces.length === 0) return [{ flux: f, amp: [1, 0] }]

  const amps = mixerAmplitudes(mix)
  const out: { flux: Flux; amp: Amp }[] = []
  const go = (i: number, g: Flux, amp: Amp): void => {
    if (amp[0] * amp[0] + amp[1] * amp[1] < floor) return
    if (i === faces.length) {
      out.push({ flux: g, amp })

      return
    }

    for (let m = 0; m < 3; m++) go(i + 1, m === 0 ? g : faceShift(p, g, faces[i] as number, m), cmul(amp, amps[m] as Amp))
  }

  go(0, f, [1, 0])

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the exact mixer, through code/rule/lattice-qed's 'loop' step over Z[zeta_M] (every face a step, a register an index)

export type ExactRegistry = { keys: string[]; index: Map<string, number> }

export const exactRegistry = (): ExactRegistry => ({ keys: [], index: new Map() })

export function registerFlux(reg: ExactRegistry, f: Flux): number {
  const k = fluxKey(f)
  const found = reg.index.get(k)

  if (found !== undefined) return found
  reg.index.set(k, reg.keys.length)
  reg.keys.push(k)

  return reg.keys.length - 1
}

// the controlled face step: U_p on ON registers, the identity on OFF ones (orbits of size 3 or 1)
export function faceStep(p: PlanePatch, reg: ExactRegistry, g: number, exponents: readonly number[]): Step {
  return {
    kind: 'loop',
    n: 3,
    exponents,
    shift: (i: number) => {
      const f = fluxFromKey(reg.keys[i] as string)

      return faceOn(p, f, g) ? registerFlux(reg, faceShift(p, f, g, 1)) : i
    },
  }
}

// the magnetic exponents -r bal(B)^2, B = 0, 1, 2 (bal 0, 1, -1)
export const mixerExponents = (mix: Mixer): number[] => [0, -mix.r, -mix.r]

// the whole mixer (class 0 then class 1) on an exact vector, or its inverse (class 1 then class 0, exponents negated)
export function exactMixer(p: PlanePatch, mix: Mixer, reg: ExactRegistry, v: Exact, inverse = false): Exact {
  const exps = mixerExponents(mix).map(e => (inverse ? -e : e))
  let w = v

  for (const c of inverse ? [1, 0] : [0, 1]) {
    const faces = new Set<number>()

    for (const i of w.entries.keys()) for (const g of activeFaces(p, fluxFromKey(reg.keys[i] as string), c)) faces.add(g)
    for (const g of [...faces].sort((x, y) => x - y)) w = applyExact(faceStep(p, reg, g, exps), w)
    w = reduce(w)
  }

  return w
}
