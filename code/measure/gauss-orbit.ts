// A FINITE-GROUP LINK REGISTER STORED ON ITS GAUSS ORBITS, FOR PATCHES TOO LARGE FOR A DENSE SECTOR (E-SPN-0185,
// E-SPN-0186). code/measure/prethermal-patch holds the register of E-SPN-0154: one group value on every link, the tree
// gauge fixed to the identity, so a configuration is the tuple of values on the non-tree links (the digits), and the
// residual Gauss freedom is one global conjugation. There the symmetric sector (1,589 states on the tetrahedron) is
// dense. A 4-loop patch has 120^4 = 207,360,000 configurations and 3,460,496 Gauss orbits, past any dense method, so
// this module keeps a state as ONE AMPLITUDE PER ORBIT and applies the register's own moves matrix free:
//
//   the table      every configuration's orbit (orbitOf), each orbit's representative (its least configuration) and its
//                  size, and, for a charged register, an element conj with configuration = conj rep conj^-1. Counted
//                  against Burnside: orbits = (1/|G|) sum_g (alphabet elements commuting with g)^digits
//   the alphabet   every digit ranges over the whole group, or over a union of classes (a TRUNCATION, E-SPN-0186): the
//                  configurations are then base^digits with base the alphabet's size, and a move that leaves the
//                  alphabet is dropped (the operator is P H P, P the projector on the truncated configurations)
//   a state        phi_o = the amplitude of EVERY configuration of orbit o (not the normalized orbit state), so a move
//                  reads phi at the neighbour's orbit with no weight; inner products carry the orbit sizes:
//                  <a, b> = sum_o |o| a_o b_o. In this basis every gauge-invariant real symmetric operator is real
//                  symmetric for that inner product, and a Floquet beat built from them is complex symmetric
//   a link move    T_l(h), from prethermal-patch's ops: a non-tree link's digit is left multiplied by h, a tree link
//                  (parent p, child v) is moved and gauge fixed back, which is the gauge transformation h on v's
//                  subtree (digits with their tail there are left multiplied by h, with their head there right
//                  multiplied by h^-1)
//   the vacuum     complex amplitudes (two numbers an orbit): one link's kernel, phi'(c) = sum_h k(h) phi(T_l(h) c) (k a
//                  complex class function), and the Hamiltonian H = sum_l sum_h e(h) T_l(h) + diag(r n_B(o))
//   a static pair  a fundamental (2) at dock a and its conjugate at dock b. The SU(2) subgroups act on the quaternions
//                  H = C^2 by left multiplication, and 2 x 2 of G x G is real, realized on H by x -> q x qbar'. So a
//                  charged state is one quaternion a configuration with psi(g c g^-1) = q_g psi(c) qbar_g (the global
//                  conjugation moves both charges), stored at the representative, read at any configuration as
//                  q_conj psi(rep) qbar_conj. A tree link's move is the gauge transformation h on the child's subtree,
//                  so the charge there is moved with it: by qbar_h on the left if a is in the subtree, by q_h on the
//                  right if b is. The Wilson line q_W(a -> b) is then left alone by every tree link, which is what
//                  fixes the convention (checked: at r = 0 the pair costs exactly n_2 = 3 a link of the shortest path,
//                  and the opposite convention does not). Where an orbit's stabilizer is larger than the center, the
//                  stored quaternion must commute with it, and project() makes it so
//
// THREADS: every command splits the orbits into equal index ranges over worker threads in shared memory, and each
// output entry is written by one thread summing in a fixed order, so a result is the same bit for bit at any thread
// count. The calling thread blocks on Atomics.wait, so the engine is synchronous, as an experiment's run is.
//
// DETERMINISM: no random numbers. EXACT: the tables are integer (group products and orbit indices); amplitudes are
// float measurement. NOTHING MOVES: a link holds a value, a plaquette reads the product around it.

import { Worker } from 'node:worker_threads'
import {
  lowestPair,
  type LowestPair,
} from '@/code/algebra/linear/eig-lanczos-restart'
import { type GaugeGroup } from '@/code/measure/hurwitz-gauge'
import {
  holonomy,
  linkValue,
  registerOf,
  type LinkOp,
  type Patch,
  type Register,
} from '@/code/measure/prethermal-patch'

// ---------------------------------------------------------------------------------------------------------
// the orbit table

export type OrbitRegister = {
  group: GaugeGroup
  patch: Patch
  register: Register
  digits: number
  // the allowed elements (ascending), each element's place in it (-1 outside), and the alphabet's size
  alphabet: Int16Array
  code: Int16Array
  base: number
  // base^digits, and the place value of each digit
  size: number
  stride: Int32Array
  // per configuration (shared)
  orbitOf: Int32Array
  conj: Uint8Array | null
  // per orbit (shared): the representative's configuration and its coded digits, the orbit's size
  repConfig: Int32Array
  repCode: Int16Array
  weight: Float64Array
  orbits: number
  burnside: number
  // orbits whose stabilizer is larger than the group's center, with the stabilizer's elements
  stabilized: { orbit: number; elements: number[] }[]
}

const product = (g: GaugeGroup, a: number, b: number): number =>
  g.table[a * g.order + b]!

export function decodeConfig(
  reg: OrbitRegister,
  c: number,
  out: Int16Array,
): void {
  for (let d = 0; d < reg.digits; d++) {
    out[d] = reg.alphabet[c % reg.base]!
    c = Math.floor(c / reg.base)
  }
}

export function encodeConfig(
  reg: OrbitRegister,
  x: ArrayLike<number>,
): number {
  let c = 0

  for (let d = reg.digits - 1; d >= 0; d--) {
    const k = reg.code[x[d]!]!

    if (k < 0) {
      return -1
    }

    c = c * reg.base + k
  }

  return c
}

// the group's center (elements commuting with every element)
export function centerOf(g: GaugeGroup): number[] {
  const out: number[] = []

  for (let z = 0; z < g.order; z++) {
    let central = true

    for (let h = 0; h < g.order && central; h++) {
      central = product(g, z, h) === product(g, h, z)
    }

    if (central) {
      out.push(z)
    }
  }

  return out
}

// the table of a register on `patch` whose digits range over `alphabet` (null: the whole group). `withConj` also
// records, for every configuration, an element conjugating its orbit's representative onto it (a charged register
// needs it)
export function orbitRegister(
  group: GaugeGroup,
  patch: Patch,
  classes: number[][],
  alphabet: readonly number[] | null,
  withConj: boolean,
): OrbitRegister {
  const G = group.order

  if (G > 255) {
    throw new Error('gauss-orbit: a group of more than 255 elements')
  }

  const register = registerOf(group, patch, classes)
  const digits = register.digits
  const allowed = alphabet
    ? [...alphabet].sort((a, b) => a - b)
    : [...Array(G).keys()]
  const code = new Int16Array(G).fill(-1)

  allowed.forEach((x, i) => (code[x] = i))

  // the alphabet must be closed under conjugation (a union of classes)
  for (const x of allowed) {
    for (let h = 0; h < G; h++) {
      const y = product(group, product(group, h, x), group.inverse[h]!)

      if (code[y]! < 0) {
        throw new Error('gauss-orbit: the alphabet is not a union of classes')
      }
    }
  }

  const base = allowed.length
  const size = base ** digits

  if (size > 2 ** 31 - 1) {
    throw new Error(`gauss-orbit: ${size} configurations`)
  }

  const stride = Int32Array.from({ length: digits }, (_, d) => base ** d)
  const shared32 = (n: number): Int32Array =>
    new Int32Array(new SharedArrayBuffer(n * 4))
  const orbitOf = shared32(size).fill(-1)
  const conj = withConj ? new Uint8Array(new SharedArrayBuffer(size)) : null
  // conjugation by h on coded digits: cj[h * base + i]
  const cj = new Int32Array(G * base)

  for (let h = 0; h < G; h++) {
    for (let i = 0; i < base; i++) {
      cj[h * base + i] = code[
        product(group, product(group, h, allowed[i]!), group.inverse[h]!)
      ]!
    }
  }

  const reps: number[] = []
  const sizes: number[] = []
  const stabilized: { orbit: number; elements: number[] }[] = []
  const center = centerOf(group).length
  const x = new Int32Array(digits)

  for (let c = 0; c < size; c++) {
    if (orbitOf[c]! >= 0) {
      continue
    }

    const id = reps.length

    let rest = c

    for (let d = 0; d < digits; d++) {
      x[d] = rest % base
      rest = Math.floor(rest / base)
    }

    let count = 0

    const stab: number[] = []

    for (let h = 0; h < G; h++) {
      let c2 = 0

      for (let d = digits - 1; d >= 0; d--) {
        c2 = c2 * base + cj[h * base + x[d]!]!
      }

      if (c2 === c) {
        stab.push(h)
      }

      if (orbitOf[c2]! < 0) {
        orbitOf[c2] = id
        count++

        if (conj) {
          conj[c2] = h
        }
      }
    }

    reps.push(c)
    sizes.push(count)

    if (stab.length > center) {
      stabilized.push({ orbit: id, elements: stab })
    }
  }

  const orbits = reps.length
  const repConfig = shared32(orbits)
  const repCode = new Int16Array(new SharedArrayBuffer(orbits * digits * 2))
  const weight = new Float64Array(new SharedArrayBuffer(orbits * 8))

  reps.forEach((c, o) => {
    repConfig[o] = c
    weight[o] = sizes[o]!

    let rest = c

    for (let d = 0; d < digits; d++) {
      repCode[o * digits + d] = rest % base
      rest = Math.floor(rest / base)
    }
  })

  // Burnside: (1/|G|) sum_g (alphabet elements commuting with g)^digits
  let burnside = 0n

  for (let g = 0; g < G; g++) {
    let fixed = 0

    for (const a of allowed) {
      if (product(group, g, a) === product(group, a, g)) {
        fixed++
      }
    }

    burnside += BigInt(fixed) ** BigInt(digits)
  }

  return {
    group,
    patch,
    register,
    digits,
    alphabet: Int16Array.from(allowed),
    code,
    base,
    size,
    stride,
    orbitOf,
    conj,
    repConfig,
    repCode,
    weight,
    orbits,
    burnside: Number(burnside / BigInt(G)),
    stabilized,
  }
}

// the integer magnetic energy of every orbit: sum over the patch's triangles of n_B(holonomy), read at the
// representative; `every` > 0 re-reads it at every `every`-th configuration (1: all of them) and returns the number
// that differ from their orbit's value (0 if it is constant on orbits, as gauge invariance says)
export function orbitMagnetic(
  reg: OrbitRegister,
  nB: Int32Array,
  every = 0,
): { energy: Float64Array; mismatches: number; checked: number } {
  const x = new Int16Array(reg.digits)
  const energy = new Float64Array(new SharedArrayBuffer(reg.orbits * 8))

  const at = (c: number): number => {
    decodeConfig(reg, c, x)

    return reg.patch.triangles.reduce(
      (s, t) => s + nB[holonomy(reg.register, x, t)]!,
      0,
    )
  }

  for (let o = 0; o < reg.orbits; o++) {
    energy[o] = at(reg.repConfig[o]!)
  }

  let mismatches = 0
  let checked = 0

  if (every > 0) {
    for (let c = 0; c < reg.size; c += every) {
      checked++

      if (at(c) !== energy[reg.orbitOf[c]!]) {
        mismatches++
      }
    }
  }

  return { energy, mismatches, checked }
}

// the mean over closed dock walks of <q0(holonomy)> in a real vacuum state phi (per-configuration amplitudes,
// normalized with the orbit sizes)
export function orbitLoopMean(
  reg: OrbitRegister,
  phi: Float64Array,
  stride: number,
  walks: readonly (readonly number[])[],
): number {
  const x = new Int16Array(reg.digits)

  let total = 0

  for (let o = 0; o < reg.orbits; o++) {
    decodeConfig(reg, reg.repConfig[o]!, x)

    let q = 0

    for (const w of walks) {
      q += reg.group.q0[holonomy(reg.register, x, w)]!
    }

    const a = phi[o * stride]!
    const b = stride > 1 ? phi[o * stride + 1]! : 0

    total += reg.weight[o]! * (a * a + b * b) * (q / walks.length)
  }

  return total
}

// ---------------------------------------------------------------------------------------------------------
// the link action tables and the charge flags

// per link: the digits it touches and, for each, the coded result act[h * base + code] (-1 outside the alphabet)
export type LinkAction = { digits: Int32Array; act: Int16Array[] }

export function linkActions(reg: OrbitRegister): LinkAction[] {
  const g = reg.group
  const G = g.order

  return reg.register.ops.map((ops: LinkOp[]) => {
    const act = ops.map(op => {
      const t = new Int16Array(new SharedArrayBuffer(G * reg.base * 2))

      for (let h = 0; h < G; h++) {
        for (let i = 0; i < reg.base; i++) {
          let y = reg.alphabet[i]!

          if (op.left) {
            y = product(g, h, y)
          }

          if (op.right) {
            y = product(g, y, g.inverse[h]!)
          }

          t[h * reg.base + i] = reg.code[y]!
        }
      }

      return t
    })

    return { digits: Int32Array.from(ops.map(o => o.digit)), act }
  })
}

// per link, two flags: the charge at dock a (left) and at dock b (right) lie in the subtree a tree link's move
// transforms (non-tree links move no charge). `sign` 1 is the convention that leaves the Wilson line alone; -1
// reverses it (q_h on the left, qbar_h on the right) and 0 drops the charge factors (both are controls)
export function chargeFlags(
  patch: Patch,
  a: number,
  b: number,
  sign: 1 | 0 | -1 = 1,
): Int8Array {
  const out = new Int8Array(patch.links.length * 2)

  patch.links.forEach((_, l) => {
    if (!patch.tree[l]) {
      return
    }

    const v = patch.parentLink.indexOf(l)
    const sub = patch.subtree[v]!

    out[2 * l] = sub[a] ? sign : 0
    out[2 * l + 1] = sub[b] ? sign : 0
  })

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the threaded engine

const PROGRAM = `
const { workerData } = require('node:worker_threads')
const d = workerData
const ctrl = new Int32Array(d.ctrl)
const orbitOf = new Int32Array(d.orbitOf)
const conj = d.conj ? new Uint8Array(d.conj) : null
const repConfig = new Int32Array(d.repConfig)
const repCode = new Int16Array(d.repCode)
const stride = d.stride
const D = d.digits
const base = d.base
const G = d.G
const links = d.links.map(l => ({ digits: l.digits, act: l.act.map(b => new Int16Array(b)) }))
const slots = d.slots.map(b => new Float64Array(b))
const kernels = d.kernels.map(b => new Float64Array(b))
const diag = new Float64Array(d.diag)
const quat = new Float64Array(d.quat)
const flags = new Int8Array(d.flags)
const N = d.orbits
const lo = Math.floor((N * d.id) / d.workers)
const hi = Math.floor((N * (d.id + 1)) / d.workers)
const one = new Int32Array(D)

// the neighbour configuration of orbit o under T_l(h), or -1 if it leaves the alphabet
function neighbour(L, o, h) {
  let c = repConfig[o]
  const ds = L.digits
  for (let j = 0; j < ds.length; j++) {
    const t = ds[j]
    const k = repCode[o * D + t]
    const v = L.act[j][h * base + k]
    if (v < 0) return -1
    c += (v - k) * stride[t]
  }
  return c
}

// one link, complex kernel (slot kr: re, ki: im), complex amplitudes
function link(l, kre, kim, src, dst) {
  const L = links[l]
  const s = slots[src]
  const o2s = slots[dst]
  const kr = kernels[kre]
  const ki = kernels[kim]
  for (let o = lo; o < hi; o++) {
    let sr = 0
    let si = 0
    for (let h = 0; h < G; h++) {
      const a = kr[h]
      const b = ki[h]
      if (a === 0 && b === 0) continue
      const c = neighbour(L, o, h)
      if (c < 0) continue
      const p = orbitOf[c] * 2
      const xr = s[p]
      const xi = s[p + 1]
      sr += a * xr - b * xi
      si += a * xi + b * xr
    }
    o2s[2 * o] = sr
    o2s[2 * o + 1] = si
  }
}

// the Hamiltonian on complex amplitudes: every link with the real kernel ke, plus the diagonal
function hamiltonian(ke, src, dst) {
  const s = slots[src]
  const out = slots[dst]
  const e = kernels[ke]
  for (let o = lo; o < hi; o++) {
    let sr = diag[o] * s[2 * o]
    let si = diag[o] * s[2 * o + 1]
    for (let l = 0; l < links.length; l++) {
      const L = links[l]
      for (let h = 0; h < G; h++) {
        const a = e[h]
        if (a === 0) continue
        const c = neighbour(L, o, h)
        if (c < 0) continue
        const p = orbitOf[c] * 2
        sr += a * s[p]
        si += a * s[p + 1]
      }
    }
    out[2 * o] = sr
    out[2 * o + 1] = si
  }
}

// the charged Hamiltonian on quaternion amplitudes (w, x, y, z): psi(c) = q_g psi(rep) qbar_g, g = conj[c]; a tree
// link carrying the charge at a multiplies by qbar_h on the left, at b by q_h on the right
function charged(ke, src, dst) {
  const s = slots[src]
  const out = slots[dst]
  const e = kernels[ke]
  for (let o = lo; o < hi; o++) {
    const dg = diag[o]
    let aw = dg * s[4 * o]
    let ax = dg * s[4 * o + 1]
    let ay = dg * s[4 * o + 2]
    let az = dg * s[4 * o + 3]
    for (let l = 0; l < links.length; l++) {
      const L = links[l]
      const fa = flags[2 * l]
      const fb = flags[2 * l + 1]
      for (let h = 0; h < G; h++) {
        const coef = e[h]
        if (coef === 0) continue
        const c = neighbour(L, o, h)
        if (c < 0) continue
        const p = orbitOf[c] * 4
        let pw = s[p]
        let px = s[p + 1]
        let py = s[p + 2]
        let pz = s[p + 3]
        const g = conj[c]
        if (g !== 0) {
          // q p qbar
          const qw = quat[4 * g], qx = quat[4 * g + 1], qy = quat[4 * g + 2], qz = quat[4 * g + 3]
          const tw = qw * pw - qx * px - qy * py - qz * pz
          const tx = qw * px + qx * pw + qy * pz - qz * py
          const ty = qw * py - qx * pz + qy * pw + qz * px
          const tz = qw * pz + qx * py - qy * px + qz * pw
          pw = tw * qw + tx * qx + ty * qy + tz * qz
          px = -tw * qx + tx * qw - ty * qz + tz * qy
          py = -tw * qy + tx * qz + ty * qw - tz * qx
          pz = -tw * qz - tx * qy + ty * qx + tz * qw
        }
        if (fa) {
          // qbar_h p (flag 1), q_h p (flag -1, the reversed convention)
          const qw = quat[4 * h], qx = -fa * quat[4 * h + 1], qy = -fa * quat[4 * h + 2], qz = -fa * quat[4 * h + 3]
          const tw = qw * pw - qx * px - qy * py - qz * pz
          const tx = qw * px + qx * pw + qy * pz - qz * py
          const ty = qw * py - qx * pz + qy * pw + qz * px
          const tz = qw * pz + qx * py - qy * px + qz * pw
          pw = tw; px = tx; py = ty; pz = tz
        }
        if (fb) {
          // p q_h (flag 1), p qbar_h (flag -1)
          const qw = quat[4 * h], qx = fb * quat[4 * h + 1], qy = fb * quat[4 * h + 2], qz = fb * quat[4 * h + 3]
          const tw = pw * qw - px * qx - py * qy - pz * qz
          const tx = pw * qx + px * qw + py * qz - pz * qy
          const ty = pw * qy - px * qz + py * qw + pz * qx
          const tz = pw * qz + px * qy - py * qx + pz * qw
          pw = tw; px = tx; py = ty; pz = tz
        }
        aw += coef * pw
        ax += coef * px
        ay += coef * py
        az += coef * pz
      }
    }
    out[4 * o] = aw
    out[4 * o + 1] = ax
    out[4 * o + 2] = ay
    out[4 * o + 3] = az
  }
}

Atomics.add(ctrl, 3, 1)
Atomics.notify(ctrl, 3)
let gen = 0
for (;;) {
  Atomics.wait(ctrl, 1, gen)
  gen = Atomics.load(ctrl, 1)
  const cmd = Atomics.load(ctrl, 0)
  if (cmd === 9) break
  if (cmd === 1) link(ctrl[4], ctrl[5], ctrl[6], ctrl[7], ctrl[8])
  else if (cmd === 2) hamiltonian(ctrl[5], ctrl[7], ctrl[8])
  else if (cmd === 3) charged(ctrl[5], ctrl[7], ctrl[8])
  Atomics.add(ctrl, 2, 1)
  Atomics.notify(ctrl, 2)
}
`

export type OrbitEngine = {
  reg: OrbitRegister
  threads: number
  // the shared vectors (width numbers an orbit) and kernel tables (|G| numbers)
  slots: Float64Array[]
  kernels: Float64Array[]
  // the diagonal (one number an orbit), and the charge flags of the charged Hamiltonian
  diag: Float64Array
  flags: Int8Array
  // slots[dst] = (sum_h k(h) T_l(h)) slots[src], k = kernels[kre] + i kernels[kim], complex amplitudes
  link: (l: number, kre: number, kim: number, src: number, dst: number) => void
  // slots[dst] = (sum_l sum_h e(h) T_l(h) + diag) slots[src], e = kernels[ke]: complex amplitudes
  hamiltonian: (ke: number, src: number, dst: number) => void
  // the same on charged quaternion amplitudes, with the charge flags
  charged: (ke: number, src: number, dst: number) => void
  close: () => void
}

export function orbitEngine(
  reg: OrbitRegister,
  input: { threads: number; slots: number; width: number; kernels: number },
): OrbitEngine {
  const G = reg.group.order
  const shared = (n: number): Float64Array =>
    new Float64Array(new SharedArrayBuffer(n * 8))
  const slots = Array.from({ length: input.slots }, () =>
    shared(reg.orbits * input.width),
  )
  const kernels = Array.from({ length: input.kernels }, () => shared(G))
  const diag = shared(reg.orbits)
  const flags = new Int8Array(
    new SharedArrayBuffer(Math.max(1, reg.patch.links.length * 2)),
  )
  const quat = shared(G * 4)

  if (reg.group.quat) {
    reg.group.quat.forEach((q, i) => quat.set(q, 4 * i))
  }

  const actions = linkActions(reg)
  const ctrl = new Int32Array(new SharedArrayBuffer(16 * 4))
  const threads = input.threads
  const workers = Array.from({ length: threads }, (_, id) => {
    const w = new Worker(PROGRAM, {
      eval: true,
      workerData: {
        ctrl: ctrl.buffer,
        orbitOf: reg.orbitOf.buffer,
        conj: reg.conj ? reg.conj.buffer : null,
        repConfig: reg.repConfig.buffer,
        repCode: reg.repCode.buffer,
        stride: [...reg.stride],
        digits: reg.digits,
        base: reg.base,
        G,
        links: actions.map(a => ({
          digits: [...a.digits],
          act: a.act.map(t => t.buffer),
        })),
        slots: slots.map(s => s.buffer),
        kernels: kernels.map(k => k.buffer),
        diag: diag.buffer,
        quat: quat.buffer,
        flags: flags.buffer,
        orbits: reg.orbits,
        workers: threads,
        id,
      },
    })

    w.unref()

    return w
  })

  for (;;) {
    const ready = Atomics.load(ctrl, 3)

    if (ready >= threads) {
      break
    }

    Atomics.wait(ctrl, 3, ready, 1000)
  }

  const run = (cmd: number, args: number[]): void => {
    args.forEach((v, i) => (ctrl[4 + i] = v))
    Atomics.store(ctrl, 0, cmd)
    Atomics.store(ctrl, 2, 0)
    Atomics.add(ctrl, 1, 1)
    Atomics.notify(ctrl, 1)

    for (;;) {
      const done = Atomics.load(ctrl, 2)

      if (done >= threads) {
        break
      }

      Atomics.wait(ctrl, 2, done, 1000)
    }
  }

  return {
    reg,
    threads,
    slots,
    kernels,
    diag,
    flags,
    link: (l, kre, kim, src, dst) => run(1, [l, kre, kim, src, dst]),
    hamiltonian: (ke, src, dst) => run(2, [0, ke, 0, src, dst]),
    charged: (ke, src, dst) => {
      if (!reg.conj || !reg.group.quat) {
        throw new Error('gauss-orbit: a charged register needs conj and quaternions')
      }

      run(3, [0, ke, 0, src, dst])
    },
    close: () => {
      Atomics.store(ctrl, 0, 9)
      Atomics.add(ctrl, 1, 1)
      Atomics.notify(ctrl, 1)

      for (const w of workers) {
        void w.terminate()
      }
    },
  }
}

// ---------------------------------------------------------------------------------------------------------
// inner products and the charged projection

// sum_o |o| sum_k a[o w + k] b[o w + k] (real), for vectors of width w
export function orbitInner(
  reg: OrbitRegister,
  a: Float64Array,
  b: Float64Array,
  width: number,
): number {
  let s = 0

  for (let o = 0; o < reg.orbits; o++) {
    let t = 0

    for (let k = 0; k < width; k++) {
      t += a[o * width + k]! * b[o * width + k]!
    }

    s += reg.weight[o]! * t
  }

  return s
}

// the complex BILINEAR form sum_o |o| a_o b_o (no conjugation) of two complex vectors (re, im interleaved), with an
// optional diagonal phase m_o (re, im per orbit) between them
export function orbitBilinear(
  reg: OrbitRegister,
  a: Float64Array,
  b: Float64Array,
  phase?: Float64Array,
): [number, number] {
  let sr = 0
  let si = 0

  for (let o = 0; o < reg.orbits; o++) {
    let br = b[2 * o]!
    let bi = b[2 * o + 1]!

    if (phase) {
      const pr = phase[2 * o]!
      const pi = phase[2 * o + 1]!
      const t = pr * br - pi * bi

      bi = pr * bi + pi * br
      br = t
    }

    const ar = a[2 * o]!
    const ai = a[2 * o + 1]!
    const w = reg.weight[o]!

    sr += w * (ar * br - ai * bi)
    si += w * (ar * bi + ai * br)
  }

  return [sr, si]
}

// a charged state's stored quaternion at every stabilized orbit replaced by its average over the stabilizer's
// conjugation (q x qbar), which is the projection onto covariant states; returns the largest change
export function projectCovariant(
  reg: OrbitRegister,
  v: Float64Array,
): number {
  const Q = reg.group.quat!

  let worst = 0

  for (const { orbit, elements } of reg.stabilized) {
    const p = [0, 1, 2, 3].map(k => v[4 * orbit + k]!)
    const acc = [0, 0, 0, 0]

    for (const s of elements) {
      const q = Q[s]!
      const r = sandwich(q, p)

      for (let k = 0; k < 4; k++) {
        acc[k] = acc[k]! + r[k]! / elements.length
      }
    }

    for (let k = 0; k < 4; k++) {
      worst = Math.max(worst, Math.abs(acc[k]! - p[k]!))
      v[4 * orbit + k] = acc[k]!
    }
  }

  return worst
}

// ---------------------------------------------------------------------------------------------------------
// lowest states (restarted Lanczos, code/algebra/linear/eig-lanczos-restart)

export type LowestOptions = {
  steps: number
  tolerance: number
  cycles: number
  log?: (line: string) => void
}

// the lowest state of the vacuum Hamiltonian (kernel slot `kernel`, the engine's diagonal) from a real start (one
// number an orbit); uses slots 0 and 1
export function vacuumLowest(
  engine: OrbitEngine,
  kernel: number,
  start: Float64Array,
  opts: LowestOptions,
): LowestPair {
  const reg = engine.reg
  const N = reg.orbits
  const s0 = engine.slots[0]!
  const s1 = engine.slots[1]!

  return lowestPair({
    size: N,
    apply: (x, out) => {
      for (let o = 0; o < N; o++) {
        s0[2 * o] = x[o]!
        s0[2 * o + 1] = 0
      }

      engine.hamiltonian(kernel, 0, 1)

      for (let o = 0; o < N; o++) {
        out[o] = s1[2 * o]!
      }
    },
    inner: (a, b) => orbitInner(reg, a, b, 1),
    start,
    ...opts,
  })
}

// the lowest charged state (quaternion amplitudes, the engine's charge flags and diagonal) from a start (four numbers
// an orbit), kept covariant by projectCovariant; uses slots 0 and 1
export function chargedLowest(
  engine: OrbitEngine,
  kernel: number,
  start: Float64Array,
  opts: LowestOptions,
): LowestPair & { drift: number } {
  const reg = engine.reg
  const res = lowestPair({
    size: reg.orbits * 4,
    apply: (x, out) => {
      engine.slots[0]!.set(x)
      engine.charged(kernel, 0, 1)
      out.set(engine.slots[1]!)
    },
    inner: (a, b) => orbitInner(reg, a, b, 4),
    project: v => void projectCovariant(reg, v),
    start,
    ...opts,
  })
  const copy = Float64Array.from(res.vector)

  return { ...res, drift: projectCovariant(reg, copy) }
}

// the Wilson line of a dock path (a, .., b) as a charged state: one quaternion an orbit, q of the path's product at the
// representative (zero where none of its links' moves can reach: never, the line is defined everywhere). It is
// covariant (W(g c g^-1) = g W g^-1), so it needs no projection
export function wilsonLine(
  reg: OrbitRegister,
  path: readonly number[],
): Float64Array {
  const Q = reg.group.quat!
  const x = new Int16Array(reg.digits)
  const out = new Float64Array(reg.orbits * 4)

  for (let o = 0; o < reg.orbits; o++) {
    decodeConfig(reg, reg.repConfig[o]!, x)

    let w = reg.group.identity

    for (let i = 0; i + 1 < path.length; i++) {
      w = product(
        reg.group,
        w,
        linkValue(reg.register, x, path[i]!, path[i + 1]!),
      )
    }

    out.set(Q[w]!, 4 * o)
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the UNFIXED charged register (every link free, the Gauss law at every dock), the instrument for a small group: no
// tree, no orbits, no conj. A state is one quaternion a configuration (G^links of them). H moves link l by h on the
// left; the projector onto charged gauge-invariant states is the product over docks v of the average over g of
// [qbar_g if v = a] psi(Omega_v(g) U) [q_g if v = b], Omega_v(g) multiplying links leaving v by g on the left and links
// entering v by g^-1 on the right (a physical state has psi(Omega U) = q_(Omega_a) psi(U) qbar_(Omega_b)). With a = b =
// -1 it is the vacuum, four copies of it

export type FreeCharged = {
  size: number
  apply: (x: Float64Array, out: Float64Array) => void
  project: (v: Float64Array) => void
  inner: (a: Float64Array, b: Float64Array) => number
  // the Wilson line of a dock path, as a state
  line: (path: readonly number[]) => Float64Array
}

export function freeCharged(
  group: GaugeGroup,
  patch: Patch,
  e: Float64Array,
  nB: Int32Array,
  r: number,
  a: number,
  b: number,
): FreeCharged {
  const G = group.order
  const L = patch.links.length
  const size = G ** L
  const Q = group.quat!
  const pw = Int32Array.from({ length: L }, (_, l) => G ** l)
  const digitOf = (c: number, l: number): number =>
    Math.floor(c / pw[l]!) % G

  const valueOn = (c: number, s: number, t: number): number => {
    const l = patch.links.findIndex(
      ([p, q]) => (p === s && q === t) || (p === t && q === s),
    )
    const v = digitOf(c, l)

    return patch.links[l]![0] === s ? v : group.inverse[v]!
  }

  const magnetic = new Float64Array(size)

  for (let c = 0; c < size; c++) {
    let m = 0

    for (const [i, j, k] of patch.triangles) {
      const h = product(
        group,
        product(group, valueOn(c, i, j), valueOn(c, j, k)),
        valueOn(c, k, i),
      )

      m += nB[h]!
    }

    magnetic[c] = r * m
  }

  const apply = (x: Float64Array, out: Float64Array): void => {
    for (let c = 0; c < size; c++) {
      const m = magnetic[c]!

      let a0 = m * x[4 * c]!
      let a1 = m * x[4 * c + 1]!
      let a2 = m * x[4 * c + 2]!
      let a3 = m * x[4 * c + 3]!

      for (let l = 0; l < L; l++) {
        const d = digitOf(c, l)

        for (let h = 0; h < G; h++) {
          const k = e[h]!

          if (k === 0) {
            continue
          }

          const c2 = 4 * (c + (product(group, h, d) - d) * pw[l]!)

          a0 += k * x[c2]!
          a1 += k * x[c2 + 1]!
          a2 += k * x[c2 + 2]!
          a3 += k * x[c2 + 3]!
        }
      }

      out[4 * c] = a0
      out[4 * c + 1] = a1
      out[4 * c + 2] = a2
      out[4 * c + 3] = a3
    }
  }

  const Qf = new Float64Array(G * 4)

  Q.forEach((q, i) => Qf.set(q, 4 * i))

  // per dock, the links it moves: [link, leaves the dock, enters it]
  const moved = patch.docks.map((_, dock) =>
    patch.links.flatMap(([s, t], l) =>
      s === dock || t === dock ? [[l, s === dock ? 1 : 0, t === dock ? 1 : 0]] : [],
    ),
  )

  const project = (v: Float64Array): void => {
    const tmp = new Float64Array(size * 4)

    patch.docks.forEach((_, dock) => {
      tmp.fill(0)

      const touch = moved[dock]!

      for (let c = 0; c < size; c++) {
        for (let g = 0; g < G; g++) {
          let c2 = c

          for (const [l, left, right] of touch) {
            const d = digitOf(c, l!)

            let y = d

            if (left) {
              y = product(group, g, y)
            }

            if (right) {
              y = product(group, y, group.inverse[g]!)
            }

            c2 += (y - d) * pw[l!]!
          }

          let pw0 = v[4 * c2]!
          let px = v[4 * c2 + 1]!
          let py = v[4 * c2 + 2]!
          let pz = v[4 * c2 + 3]!

          if (dock === a) {
            // qbar_g p
            const qw = Qf[4 * g]!
            const qx = -Qf[4 * g + 1]!
            const qy = -Qf[4 * g + 2]!
            const qz = -Qf[4 * g + 3]!
            const tw = qw * pw0 - qx * px - qy * py - qz * pz
            const tx = qw * px + qx * pw0 + qy * pz - qz * py
            const ty = qw * py - qx * pz + qy * pw0 + qz * px
            const tz = qw * pz + qx * py - qy * px + qz * pw0

            pw0 = tw
            px = tx
            py = ty
            pz = tz
          }

          if (dock === b) {
            // p q_g
            const qw = Qf[4 * g]!
            const qx = Qf[4 * g + 1]!
            const qy = Qf[4 * g + 2]!
            const qz = Qf[4 * g + 3]!
            const tw = pw0 * qw - px * qx - py * qy - pz * qz
            const tx = pw0 * qx + px * qw + py * qz - pz * qy
            const ty = pw0 * qy - px * qz + py * qw + pz * qx
            const tz = pw0 * qz + px * qy - py * qx + pz * qw

            pw0 = tw
            px = tx
            py = ty
            pz = tz
          }

          tmp[4 * c] = tmp[4 * c]! + pw0 / G
          tmp[4 * c + 1] = tmp[4 * c + 1]! + px / G
          tmp[4 * c + 2] = tmp[4 * c + 2]! + py / G
          tmp[4 * c + 3] = tmp[4 * c + 3]! + pz / G
        }
      }

      v.set(tmp)
    })
  }

  const inner = (x: Float64Array, y: Float64Array): number => {
    let s = 0

    for (let i = 0; i < x.length; i++) {
      s += x[i]! * y[i]!
    }

    return s
  }

  const line = (path: readonly number[]): Float64Array => {
    const out = new Float64Array(size * 4)

    for (let c = 0; c < size; c++) {
      let w = group.identity

      for (let i = 0; i + 1 < path.length; i++) {
        w = product(group, w, valueOn(c, path[i]!, path[i + 1]!))
      }

      out.set(Q[w]!, 4 * c)
    }

    return out
  }

  return { size: size * 4, apply, project, inner, line }
}

// the Hamilton product a b
export function quaternionProduct(
  a: readonly number[],
  b: readonly number[],
): number[] {
  return [
    a[0]! * b[0]! - a[1]! * b[1]! - a[2]! * b[2]! - a[3]! * b[3]!,
    a[0]! * b[1]! + a[1]! * b[0]! + a[2]! * b[3]! - a[3]! * b[2]!,
    a[0]! * b[2]! - a[1]! * b[3]! + a[2]! * b[0]! + a[3]! * b[1]!,
    a[0]! * b[3]! + a[1]! * b[2]! - a[2]! * b[1]! + a[3]! * b[0]!,
  ]
}

// q p qbar
export function sandwich(q: readonly number[], p: readonly number[]): number[] {
  const [qw, qx, qy, qz] = q as [number, number, number, number]
  const [pw, px, py, pz] = p as [number, number, number, number]
  const tw = qw * pw - qx * px - qy * py - qz * pz
  const tx = qw * px + qx * pw + qy * pz - qz * py
  const ty = qw * py - qx * pz + qy * pw + qz * px
  const tz = qw * pz + qx * py - qy * px + qz * pw

  return [
    tw * qw + tx * qx + ty * qy + tz * qz,
    -tw * qx + tx * qw - ty * qz + tz * qy,
    -tw * qy + tx * qz + ty * qw - tz * qx,
    -tw * qz - tx * qy + ty * qx + tz * qw,
  ]
}
