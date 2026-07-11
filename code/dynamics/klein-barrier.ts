// The Klein paradox, read off the knit's OWN coined Dirac walk. A relativistic (Dirac) particle
// launched at a TALL electrostatic step does not reflect the way an ordinary particle would: as the
// step grows past the mass gap it keeps transmitting, approaching a nonzero constant instead of the
// exponential shut-off a nonrelativistic particle shows. The reason is that inside a scalar potential
// the positive-energy incoming particle couples to the negative-energy (antiparticle) states on the
// far side, and the barrier becomes transparent. The signature is specific to a SCALAR (electrostatic)
// potential, which shifts both chiralities equally. A MASS barrier (a region of large local mass, i.e.
// a real energy gap) does the opposite: it reflects, and transmission dies as the barrier grows.
//
// This is measured on the {3,4,3,4} coin's single-particle sector, the two-component coined Dirac
// walk (relativity/dirac-from-discrete): a right-moving Gaussian packet is evolved by the exact
// coin+shift rule, with a barrier region that is either a scalar phase (electrostatic potential, both
// chiralities shifted equally) or a large local mass (mass barrier). The transmitted probability past
// the barrier is measured at the end.

type Complex = readonly [number, number]

const cadd = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]

const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cabs2 = (a: Complex): number => a[0] * a[0] + a[1] * a[1]
const IMAG: Complex = [0, 1]

// A right-moving Gaussian wave packet hits a barrier region on the coined Dirac walk. The final
// probability is split into three parts: reflected (ended LEFT of the barrier), inside (ended within
// the barrier region), and transmitted (ended RIGHT of the barrier). For a SHARP STEP (a wide barrier)
// the physically meaningful number is the penetration = inside + transmitted (how much got past the
// step face); for a THIN barrier it is transmitted (how much tunnelled all the way through). The
// barrier is either a scalar electrostatic potential (kind 'potential', a phase e^{-i height} applied
// equally to both chiralities in the region each step) or a mass barrier (kind 'mass', a large local
// mass in the coin mixing in the region). The lattice is kept wide so the packet and barrier stay away
// from the wrap seam.
export function diracBarrierProbability(input: {
  size: number
  steps: number
  mass: number
  momentum: number
  width: number
  barrierStart: number
  barrierWidth: number
  height: number
  kind: 'potential' | 'mass'
}): { reflected: number; inside: number; transmitted: number } {
  const {
    size: L,
    steps,
    mass,
    momentum: k0,
    width: sigma,
    barrierStart,
    barrierWidth,
    height,
    kind,
  } = input

  const wrap = (x: number): number => ((x % L) + L) % L
  const barrierEnd = barrierStart + barrierWidth

  // right-moving Gaussian packet, centred a bit left of the barrier, in the R (right-mover) chirality
  const x0 = Math.floor(barrierStart - 4 * sigma)

  let R: Complex[] = new Array(L).fill([0, 0])
  let Lf: Complex[] = new Array(L).fill([0, 0])

  let normSeed = 0

  for (let x = 0; x < L; x++) {
    const g = Math.exp(-((x - x0) * (x - x0)) / (2 * sigma * sigma))
    const phase = k0 * x

    R[x] = [g * Math.cos(phase), g * Math.sin(phase)]
    normSeed += cabs2(R[x]!)
  }

  const inv = 1 / Math.sqrt(normSeed)

  for (let x = 0; x < L; x++) R[x] = [R[x]![0] * inv, R[x]![1] * inv]

  // precompute the local coin (cos m, sin m) per site: a mass barrier raises the local mass
  const cosM = new Float64Array(L)
  const sinM = new Float64Array(L)

  for (let x = 0; x < L; x++) {
    const inBarrier = x >= barrierStart && x < barrierEnd
    const localMass =
      kind === 'mass' && inBarrier ? mass + height : mass

    cosM[x] = Math.cos(localMass)
    sinM[x] = Math.sin(localMass)
  }

  // precompute the scalar-potential phase per site (electrostatic step: e^{-i height} in the region)
  const potRe = new Float64Array(L)
  const potIm = new Float64Array(L)

  for (let x = 0; x < L; x++) {
    const inBarrier = x >= barrierStart && x < barrierEnd
    const v = kind === 'potential' && inBarrier ? height : 0

    potRe[x] = Math.cos(-v)
    potIm[x] = Math.sin(-v)
  }

  for (let t = 0; t < steps; t++) {
    // coin: local mass mixes the two chiralities
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

    // scalar potential: equal phase to both chiralities in the barrier region
    for (let x = 0; x < L; x++) {
      const pr = potRe[x]!
      const pi = potIm[x]!

      if (pr !== 1 || pi !== 0) {
        R2[x] = cmul([pr, pi], R2[x]!)
        L2[x] = cmul([pr, pi], L2[x]!)
      }
    }

    // shift: R moves +1, L moves -1
    const R3: Complex[] = new Array(L).fill([0, 0])
    const L3: Complex[] = new Array(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = R2[x]!
      L3[wrap(x - 1)] = L2[x]!
    }

    R = R3
    Lf = L3
  }

  // split the final probability into reflected / inside-barrier / transmitted
  let reflected = 0
  let inside = 0
  let transmitted = 0
  let total = 0

  for (let x = 0; x < L; x++) {
    const p = cabs2(R[x]!) + cabs2(Lf[x]!)

    total += p

    if (x < barrierStart) reflected += p
    else if (x < barrierEnd) inside += p
    else transmitted += p
  }

  const norm = total || 1

  return {
    reflected: reflected / norm,
    inside: inside / norm,
    transmitted: transmitted / norm,
  }
}
