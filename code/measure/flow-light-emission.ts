// Measurement tools for spontaneous emission into the flow light (E-FRC-0228), on the two-square lattice QED of
// code/rule/lattice-qed: the first square holds the STAND-IN atom (nucleus, electron, the square's own loop m_A),
// the second square's loop m_B is the light register the atom meets. The shared rung's electric phase
// zeta^(-c bal(m_A - m_B)^2) is the only thing that reads both: it is the coupling. A collision is K beats of the
// exact rule with a fresh register, after which the stream copies the register away (a STAND-IN for the light
// leaving). Everything here is measurement (floats); the rule's factors are the exact ones of lattice-qed, and a
// float-only 'turns' step appears only when the coupling is scaled by lambda for the first-order (Born) reading.
//
// Sector index of the two squares: (atom index a) * N + m_B, with a = (electron dock slot) * N + m_A, which is
// exactly the one-square sector's index, so the atom's states are the one-square sector's.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import {
  applyFloat,
  bal,
  buildSector,
  magneticExponents,
  sectorElectric,
  sectorHop,
  sectorLoopShift,
  squareLattice,
  type BeatSpec,
  type Complex,
  type Sector,
  type Step,
} from '@/code/rule/lattice-qed'

export type Matrix = { re: Float64Array; im: Float64Array; n: number }

export type Vector = { re: Float64Array; im: Float64Array }

export const zeroMatrix = (n: number): Matrix => ({ re: new Float64Array(n * n), im: new Float64Array(n * n), n })

// the rung's link index in squareLattice(2)
export const RUNG = 1

// ---------------------------------------------------------------------------------------------------------
// generators (energies in units of 2 pi / M per beat): the Hamiltonian each beat approximates as M grows

function addLoopGenerator(h: Matrix, shift: Int32Array, n: number, r: number): void {
  const d = h.n

  for (let i = 0; i < d; i++) {
    let at = i

    for (let k = 0; k < n; k++) {
      let g = 0

      // bal(B)^2 is even in B, so g'_k is real
      for (let B = 0; B < n; B++) g += (r * bal(B, n) ** 2 * Math.cos((2 * Math.PI * B * k) / n)) / n

      h.re[at * d + i] = h.re[at * d + i]! + g
      at = shift[at]!
    }
  }
}

// the rung energy bal(m_A - f)^2 averaged over the register's distribution p (the static part of the coupling),
// per atom index of the one-square sector
export function meanRung(sector: Sector, p: ArrayLike<number>): Float64Array {
  const n = sector.n

  return Float64Array.from({ length: sector.size }, (_, i) => {
    const mA = sector.loops[i]!
    let e = 0

    for (let f = 0; f < n; f++) e += p[f]! * bal(mA - f, n) ** 2

    return e
  })
}

// the atom (one square): -hop sum P-_l + 2c sum bal(e)^2 over its links but the rung + r bal(B)^2, plus, when a
// register distribution is given, the rung's energy averaged over it (the atom dressed by the register's static
// field, so the coupling left over has zero mean)
export function atomGenerator(n: number, spec: BeatSpec, dressing?: ArrayLike<number>): { sector: Sector; h: Matrix } {
  const sector = buildSector(squareLattice(1), n)
  const d = sector.size
  const h = zeroMatrix(d)

  for (const l of sector.lattice.hops) {
    const mv = sectorHop(sector, l)

    for (let i = 0; i < d; i++) {
      h.re[i * d + i] = h.re[i * d + i]! - spec.hop / 2
      h.re[mv[i]! * d + i] = h.re[mv[i]! * d + i]! + spec.hop / 2
    }
  }

  const electric = sectorElectric(sector, [RUNG])

  for (let i = 0; i < d; i++) h.re[i * d + i] = h.re[i * d + i]! + 2 * spec.electric * electric[i]!

  if (dressing) {
    const mean = meanRung(sector, dressing)

    for (let i = 0; i < d; i++) h.re[i * d + i] = h.re[i * d + i]! + 2 * spec.electric * mean[i]!
  }

  addLoopGenerator(h, sectorLoopShift(sector, 0), n, spec.magnetic)

  return { sector, h }
}

// the register (the second square's three far links and its plaquette) on m_B = 0 .. N - 1
export function registerGenerator(n: number, spec: BeatSpec): Matrix {
  const h = zeroMatrix(n)

  for (let f = 0; f < n; f++) h.re[f * n + f] = 2 * 3 * spec.electric * bal(f, n) ** 2

  addLoopGenerator(h, Int32Array.from({ length: n }, (_, f) => (f + 1) % n), n, spec.magnetic)

  return h
}

export function eigenStates(h: Matrix): { values: number[]; vectors: Vector[] } {
  const d = h.n
  const k = makeComplexMatrix({ rows: d, cols: d })

  k.re.set(h.re)
  k.im.set(h.im)

  const e = eigHermitian({ matrix: k })

  return {
    values: Array.from(e.values),
    vectors: Array.from({ length: d }, (_, a) => ({
      re: Float64Array.from({ length: d }, (_, i) => e.vectorsRe[i * d + a]!),
      im: Float64Array.from({ length: d }, (_, i) => e.vectorsIm[i * d + a]!),
    })),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the two-square beat with the rung's phase as its own factor (lambda = 1 is the exact rule; other lambda only
// for the first-order reading, as a float 'turns' factor)

// `mean` (per atom index): the rung's static part kept at full strength when lambda scales the rest
export function collisionBeat(sector: Sector, spec: BeatSpec, options: { lambda?: number; registerMagnetic?: boolean; mean?: Float64Array } = {}): Step[] {
  const lambda = options.lambda ?? 1
  const mean = options.mean
  const n = sector.n
  const steps: Step[] = []

  for (const l of sector.lattice.hops) {
    const mv = sectorHop(sector, l)

    steps.push({ kind: 'hop', move: i => mv[i]!, z: spec.hop })
  }

  const rest = sectorElectric(sector, [RUNG])
  const all = sectorElectric(sector)
  const restStep: Step = { kind: 'phase', exponent: i => -spec.electric * rest[i]! }
  const rungStep: Step =
    lambda === 1
      ? { kind: 'phase', exponent: i => -spec.electric * (all[i]! - rest[i]!) }
      : {
          kind: 'turns',
          turns: i => {
            const rung = all[i]! - rest[i]!
            const fixed = mean ? mean[Math.floor(i / n)]! : 0

            return (-spec.electric * (fixed + lambda * (rung - fixed))) / spec.m
          },
        }

  steps.push(restStep, rungStep)

  sector.lattice.plaquettes.forEach((_, p) => {
    if (p === 1 && options.registerMagnetic === false) return

    const shift = sectorLoopShift(sector, p)

    steps.push({ kind: 'loop', shift: i => shift[i]!, exponents: magneticExponents(sector.n, spec.magnetic), n: sector.n })
  })

  steps.push(restStep, rungStep)

  return steps
}

// the joint state after one collision of K beats from atom state `atom` and register state `register`
export function collide(steps: readonly Step[], spec: BeatSpec, beats: number, atom: Vector, register: Vector): Complex {
  const n = register.re.length
  const d = atom.re.length
  let w: Complex = { re: new Float64Array(d * n), im: new Float64Array(d * n) }

  for (let a = 0; a < d; a++) {
    for (let f = 0; f < n; f++) {
      w.re[a * n + f] = atom.re[a]! * register.re[f]! - atom.im[a]! * register.im[f]!
      w.im[a * n + f] = atom.re[a]! * register.im[f]! + atom.im[a]! * register.re[f]!
    }
  }

  for (let t = 0; t < beats; t++) for (const s of steps) w = applyFloat(s, w, spec.m)

  return w
}

// Kraus operators of one collision: K_f[a', a] = <a', f| W^K |a, register>
export function collisionKraus(steps: readonly Step[], spec: BeatSpec, beats: number, d: number, register: Vector): Matrix[] {
  const n = register.re.length
  const kraus = Array.from({ length: n }, () => zeroMatrix(d))

  for (let a = 0; a < d; a++) {
    const basis = { re: new Float64Array(d), im: new Float64Array(d) }

    basis.re[a] = 1

    const w = collide(steps, spec, beats, basis, register)

    for (let a2 = 0; a2 < d; a2++) {
      for (let f = 0; f < n; f++) {
        kraus[f]!.re[a2 * d + a] = w.re[a2 * n + f]!
        kraus[f]!.im[a2 * d + a] = w.im[a2 * n + f]!
      }
    }
  }

  return kraus
}

// rho -> sum_f K_f rho K_f^dag
export function applyChannel(kraus: readonly Matrix[], rho: Matrix): Matrix {
  const d = rho.n
  const out = zeroMatrix(d)

  for (const K of kraus) {
    const tr = new Float64Array(d * d)
    const ti = new Float64Array(d * d)

    for (let i = 0; i < d; i++) {
      for (let k = 0; k < d; k++) {
        const kr = K.re[i * d + k]!
        const ki = K.im[i * d + k]!

        if (kr === 0 && ki === 0) continue

        for (let j = 0; j < d; j++) {
          tr[i * d + j] = tr[i * d + j]! + kr * rho.re[k * d + j]! - ki * rho.im[k * d + j]!
          ti[i * d + j] = ti[i * d + j]! + kr * rho.im[k * d + j]! + ki * rho.re[k * d + j]!
        }
      }
    }

    for (let i = 0; i < d; i++) {
      for (let k = 0; k < d; k++) {
        const xr = tr[i * d + k]!
        const xi = ti[i * d + k]!

        if (xr === 0 && xi === 0) continue

        for (let j = 0; j < d; j++) {
          const kr = K.re[j * d + k]!
          const ki = -K.im[j * d + k]!

          out.re[i * d + j] = out.re[i * d + j]! + xr * kr - xi * ki
          out.im[i * d + j] = out.im[i * d + j]! + xr * ki + xi * kr
        }
      }
    }
  }

  return out
}

// largest entry of sum K K^dag - 1 (0 for a unital channel)
export function unitalDefect(kraus: readonly Matrix[]): number {
  const d = kraus[0]!.n
  const identity = zeroMatrix(d)

  for (let i = 0; i < d; i++) identity.re[i * d + i] = 1 / d

  const out = applyChannel(kraus, identity)
  let defect = 0

  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) defect = Math.max(defect, d * Math.hypot(out.re[i * d + j]! - (i === j ? 1 / d : 0), out.im[i * d + j]!))

  return defect
}

export function projector(v: Vector): Matrix {
  const d = v.re.length
  const p = zeroMatrix(d)

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      p.re[i * d + j] = v.re[i]! * v.re[j]! + v.im[i]! * v.im[j]!
      p.im[i * d + j] = v.im[i]! * v.re[j]! - v.re[i]! * v.im[j]!
    }
  }

  return p
}

// Tr(rho H)
export function expectation(rho: Matrix, h: Matrix): number {
  const d = rho.n
  let x = 0

  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) x += rho.re[i * d + j]! * h.re[j * d + i]! - rho.im[i * d + j]! * h.im[j * d + i]!

  return x
}

export function purity(rho: Matrix): number {
  let p = 0

  for (let i = 0; i < rho.re.length; i++) p += rho.re[i]! ** 2 + rho.im[i]! ** 2

  return p
}

export const population = (rho: Matrix, v: Vector): number => expectation(rho, projector(v))

// ---------------------------------------------------------------------------------------------------------
// the first-order (Born) transfer: the probability to find the atom in `target` after one collision, to
// second order in lambda at lambda = 1 (a central difference of the lambda-scaled rule at lambda = 0)

export function bornTransfer(sector: Sector, spec: BeatSpec, beats: number, atom: Vector, register: Vector, target: Vector, mean?: Float64Array): number {
  const h = 1e-5
  const plus = collide(collisionBeat(sector, spec, { lambda: h, mean }), spec, beats, atom, register)
  const minus = collide(collisionBeat(sector, spec, { lambda: -h, mean }), spec, beats, atom, register)
  const n = register.re.length
  const d = atom.re.length
  let p = 0

  // |<target, f| d psi / d lambda>|^2 summed over f
  for (let f = 0; f < n; f++) {
    let re = 0
    let im = 0

    for (let a = 0; a < d; a++) {
      const dr = (plus.re[a * n + f]! - minus.re[a * n + f]!) / (2 * h)
      const di = (plus.im[a * n + f]! - minus.im[a * n + f]!) / (2 * h)

      re += target.re[a]! * dr + target.im[a]! * di
      im += target.re[a]! * di - target.im[a]! * dr
    }

    p += re * re + im * im
  }

  return p
}

// ---------------------------------------------------------------------------------------------------------
// the mean-field (semiclassical) collision: the joint state is kept a product; each factor that reads both
// (a phase of the joint index) acts on each side through its average over the other side (Hartree); hops and
// the first square's loop act on the atom, the second square's loop on the register

export function meanFieldCollision(steps: readonly Step[], spec: BeatSpec, beats: number, atom: Vector, register: Vector): { atom: Vector; register: Vector } {
  const n = register.re.length
  const d = atom.re.length
  let a: Complex = { re: Float64Array.from(atom.re), im: Float64Array.from(atom.im) }
  let r: Complex = { re: Float64Array.from(register.re), im: Float64Array.from(register.im) }

  const exponentOf = (s: Step, i: number): number => (s.kind === 'phase' ? s.exponent(i) / spec.m : s.kind === 'turns' ? s.turns(i) : 0)

  for (let t = 0; t < beats; t++) {
    for (const s of steps) {
      if (s.kind === 'phase' || s.kind === 'turns') {
        const pa = Float64Array.from({ length: d }, (_, x) => a.re[x]! ** 2 + a.im[x]! ** 2)
        const pr = Float64Array.from({ length: n }, (_, f) => r.re[f]! ** 2 + r.im[f]! ** 2)
        const atomTurns = Float64Array.from({ length: d }, (_, x) => {
          let e = 0

          for (let f = 0; f < n; f++) e += pr[f]! * exponentOf(s, x * n + f)

          return e
        })
        const registerTurns = Float64Array.from({ length: n }, (_, f) => {
          let e = 0

          for (let x = 0; x < d; x++) e += pa[x]! * exponentOf(s, x * n + f)

          return e
        })

        a = applyFloat({ kind: 'turns', turns: x => atomTurns[x]! }, a, spec.m)
        r = applyFloat({ kind: 'turns', turns: f => registerTurns[f]! }, r, spec.m)
        continue
      }

      if (s.kind === 'hop') {
        a = applyFloat({ kind: 'hop', move: x => Math.floor(s.move(x * n) / n), z: s.z }, a, spec.m)
        continue
      }

      if (s.kind === 'loop') {
        // which square's loop: does the shift move the atom index or the register?
        const moved = s.shift(0)

        if (moved % n !== 0) r = applyFloat({ ...s, shift: f => s.shift(f) % n }, r, spec.m)
        else a = applyFloat({ ...s, shift: x => Math.floor(s.shift(x * n) / n) }, a, spec.m)
      }
    }
  }

  return { atom: a, register: r }
}

// the register's states ordered by energy (its lowest is the fresh register), and the atom dressed by that
// register's static field, its states ordered by energy
export function emissionSetup(
  n: number,
  spec: BeatSpec,
): { atomSector: Sector; atomH: Matrix; atom: { values: number[]; vectors: Vector[] }; registerH: Matrix; register: { values: number[]; vectors: Vector[] }; sector: Sector; mean: Float64Array } {
  const registerH = registerGenerator(n, spec)
  const register = eigenStates(registerH)
  const vacuum = register.vectors[0]!
  const p = Float64Array.from({ length: n }, (_, f) => vacuum.re[f]! ** 2 + vacuum.im[f]! ** 2)
  const { sector: atomSector, h: atomH } = atomGenerator(n, spec, p)

  return { atomSector, atomH, atom: eigenStates(atomH), registerH, register, sector: buildSector(squareLattice(2), n), mean: meanRung(atomSector, p) }
}
