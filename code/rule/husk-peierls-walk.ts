// Matter that reads the light (E-FRC-0252): a charged test vibe on a husk line whose hop picks up the light's
// own compact angle as a Peierls phase, held EXACTLY in the cyclotomic integers Z[zeta_M].
//
// THE HOP. On a line of husk docks 0 .. n - 1 (a ring), the link from dock x to x + 1 carries the husk axis angle
// A_x, a cycling number with 4D values (code/rule/trit-column), so its Peierls phase is zeta_(4D)^(-q A_x) for a
// vibe of charge q. The rule's angle is minus the textbook vector potential (its drift is A <- A + E, see
// code/rule/trit-kinetic), so the minus sign here is the textbook e^(+i q A_textbook): derived, not fitted.
// The gauge-covariant swap T on the pair (x, x + 1) takes
//   (T psi)_(x+1) = zeta_(4D)^(-q A_x) psi_x,   (T psi)_x = zeta_(4D)^(+q A_x) psi_(x+1)
// and T^2 = 1. The hop is V = e^(i theta T) = cos theta + i sin theta T with theta = 2 pi / M (zeta = zeta_M):
//   2 V = (zeta + zeta^-1) + (zeta - zeta^-1) T
// so twice the hop has entries in Z[zeta_M] and the rule holds psi~ = 2^k psi exactly after k hops. A beat runs
// the even links (x even) and then the odd links, each a matching, so nothing inside a substep depends on order.
// e^(i theta T) puts the uniform state (k = 0) at the bottom of the band: E(k) = -2 theta cos k per beat for
// small theta, mass 1 / (2 theta). M must be a multiple of 4D, so zeta_(4D) = zeta_M^(M / 4D).
//
// EXACT. An element is its coefficients on zeta^0 .. zeta^(M/2 - 1) (M a power of two, so Phi_M = x^(M/2) + 1
// and zeta^(M/2) = -1), BigInt, so nothing grows past a bound. Multiplying by a power of zeta is a signed
// rotation of the coefficients: no product of two elements is ever formed in the hop.
//
// REVERSIBLE. 2 V^-1 = (zeta + zeta^-1) - (zeta - zeta^-1) T with the same angles, so a beat is undone by the odd
// links then the even links with the minus sign, returning 4 psi~ per substep undone.
//
// GAUGE COVARIANT. A_x -> A_x + c(x + 1) - c(x) with psi_x -> zeta_(4D)^(-q c(x)) psi_x maps the hop to itself.
//
// A TEST VIBE, disclosed: the vibe reads the light and does not source it (no back-action), and it hops only
// along one husk line. Integers only in the rule: no float, no trig, no rounding.

export type PeierlsWalk = {
  // M, the order of zeta; half = M / 2 coefficients per element
  readonly order: number
  readonly half: number
  // M / (4D): zeta_(4D) = zeta^step
  readonly step: number
  // the line length (even)
  readonly sites: number
  // psi~, sites * half coefficients
  readonly amp: bigint[]
  // hops applied, net (each forward substep +1, each undone substep -1 counts two factors of 2 back: see scale)
  hops: number
}

export function makeWalk(input: { order: number; depth: number; sites: number; start: readonly number[] }): PeierlsWalk {
  const { order, depth, sites } = input

  if (order % (4 * depth) !== 0) throw new Error('the order must be a multiple of 4D')
  if ((order & (order - 1)) !== 0) throw new Error('the order must be a power of two')
  if (sites % 2 !== 0) throw new Error('the line must have an even number of docks')

  const half = order / 2
  const amp: bigint[] = new Array<bigint>(sites * half).fill(0n)

  input.start.forEach((v, x) => (amp[x * half] = BigInt(v)))

  return { order, half, step: order / (4 * depth), sites, amp, hops: 0 }
}

export function copyWalk(w: PeierlsWalk): PeierlsWalk {
  return { ...w, amp: w.amp.slice() }
}

const mod = (x: number, m: number): number => ((x % m) + m) % m

// out[at + j] += sign * zeta^k * a[from + j], over one element
function addRotated(out: bigint[], at: number, a: bigint[], from: number, k: number, sign: 1 | -1, half: number): void {
  const order = 2 * half
  const r = mod(k, order)
  const flip = r >= half
  const s = flip ? r - half : r

  for (let j = 0; j < half; j++) {
    const c = a[from + j]!

    if (c === 0n) continue

    let t = j + s
    let neg = flip

    if (t >= half) {
      t -= half
      neg = !neg
    }

    out[at + t] = neg === (sign < 0) ? out[at + t]! + c : out[at + t]! - c
  }
}

// one substep on the links of one parity: `angles[x]` is A on the link x -> x + 1, `q` the charge, `dir` +1 for the
// hop and -1 for its inverse
function substep(w: PeierlsWalk, parity: number, angles: ArrayLike<number>, q: number, dir: 1 | -1): void {
  const { half, sites, step } = w
  const next: bigint[] = new Array<bigint>(sites * half).fill(0n)
  const s: 1 | -1 = dir

  for (let x = parity; x < sites; x += 2) {
    const y = (x + 1) % sites
    const ph = step * q * (angles[x] ?? 0)
    const ax = x * half
    const ay = y * half

    // new_x = (z + 1/z) psi_x + dir (z - 1/z) zeta^(+step q A) psi_y
    addRotated(next, ax, w.amp, ax, 1, 1, half)
    addRotated(next, ax, w.amp, ax, -1, 1, half)
    addRotated(next, ax, w.amp, ay, 1 + ph, s, half)
    addRotated(next, ax, w.amp, ay, -1 + ph, s === 1 ? -1 : 1, half)
    // new_y = (z + 1/z) psi_y + dir (z - 1/z) zeta^(-step q A) psi_x
    addRotated(next, ay, w.amp, ay, 1, 1, half)
    addRotated(next, ay, w.amp, ay, -1, 1, half)
    addRotated(next, ay, w.amp, ax, 1 - ph, s, half)
    addRotated(next, ay, w.amp, ax, -1 - ph, s === 1 ? -1 : 1, half)
  }

  for (let i = 0; i < next.length; i++) w.amp[i] = next[i]!
}

// one beat: the even links, then the odd links, reading the same angles
export function walkBeat(w: PeierlsWalk, angles: ArrayLike<number>, q: number): void {
  substep(w, 0, angles, q, 1)
  substep(w, 1, angles, q, 1)
  w.hops += 2
}

// the inverse of walkBeat with the same angles: psi~ comes back multiplied by 4 per substep undone (2 V^-1 2 V = 4)
export function walkBeatBack(w: PeierlsWalk, angles: ArrayLike<number>, q: number): void {
  substep(w, 1, angles, q, -1)
  substep(w, 0, angles, q, -1)
  w.hops += 2
}

// the constant term of sum_x psi~_x conj(psi~_x): sum of the squares of every coefficient. For a unitary walk
// from a real start it equals 4^(hops) sum start^2 on every Galois conjugate, so this is the trace of the norm
export function normTrace(w: PeierlsWalk): bigint {
  let s = 0n

  for (const c of w.amp) s += c * c

  return s
}

// the gauge map: psi_x -> zeta_(4D)^(-q c(x)) psi_x, in place
export function gaugeWalk(w: PeierlsWalk, c: ArrayLike<number>, q: number): void {
  const { half, sites, step } = w
  const next: bigint[] = new Array<bigint>(sites * half).fill(0n)

  for (let x = 0; x < sites; x++) addRotated(next, x * half, w.amp, x * half, -step * q * (c[x] ?? 0), 1, half)

  for (let i = 0; i < next.length; i++) w.amp[i] = next[i]!
}

export function sameWalk(a: PeierlsWalk, b: PeierlsWalk, scaleB = 1n): boolean {
  for (let i = 0; i < a.amp.length; i++) if (a.amp[i] !== b.amp[i]! * scaleB) return false

  return true
}

// measurement only: the probabilities |psi_x|^2 / sum, from the coefficients shifted to doubles
export function probabilities(w: PeierlsWalk): Float64Array {
  const { half, sites, order } = w
  let bits = 0

  for (const c of w.amp) {
    const b = (c < 0n ? -c : c).toString(2).length

    if (b > bits) bits = b
  }

  const shift = BigInt(Math.max(0, bits - 60))
  const cos = Float64Array.from({ length: half }, (_, j) => Math.cos((2 * Math.PI * j) / order))
  const sin = Float64Array.from({ length: half }, (_, j) => Math.sin((2 * Math.PI * j) / order))
  const p = new Float64Array(sites)
  let total = 0

  for (let x = 0; x < sites; x++) {
    let re = 0
    let im = 0

    for (let j = 0; j < half; j++) {
      const c = w.amp[x * half + j]!

      if (c === 0n) continue

      const v = Number(c >> shift)

      re += v * cos[j]!
      im += v * sin[j]!
    }

    p[x] = re * re + im * im
    total += p[x]!
  }

  for (let x = 0; x < sites; x++) p[x] = p[x]! / total

  return p
}
