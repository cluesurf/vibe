// The chosen g = 2 token (E-SPN-0064's nested palindrome) with its spin written inside the role about its own role
// point, so that one stand-in carries spin one half, g = 2, a conserved fermion number and an exact charge
// together. A STAND-IN, not the electron: code/rule/comoving-token.
//
// E-SPN-0064 chose the 16-beat nested palindrome z P x P y P y P x P z (P the depth pair): massive, covariant
// beat by beat under the 12 husk turns, the 2 pi sign, an isotropic mass, exact on the torus, 0.31 of the
// E-FRC-0179 photon's speed, g = 2 in every plane. Its spin is a bare doublet. E-SPN-0051 put that doublet in the
// role, as the parity-even subspace about a point, and E-SPN-0059/0062/0063 made the weight there, read about each
// token's own point, a fermion number that the comoving fear beat keeps. This joins the two.
//
// PART A (exact, L1): WHY THE TOKEN MUST LIVE IN THE DOUBLET. A husk turn acts on the role as rho(q) = S(q) (+)
// chi(q): S the doublet's spin matrix, chi a character on the line. A stream generator Gamma_a on the role is
// covariant when rho(q) Gamma_a rho(q)^dagger = s Gamma_b for every turn with R(q) e_a = s e_b. The central
// element q = -1 turns nothing (R = 1, s = 1) and acts as -1 on the doublet and +1 on the line (E-SPN-0051,
// 0054), so the blocks joining the doublet to the line are minus themselves: zero. On the line, rho is a scalar,
// so its block obeys L_a = s L_b, and the half turn about an axis other than a reverses a (s = -1, b = a): L_a =
// -L_a = 0. So every covariant generator vanishes on the line, and none squares to 1 there: NO covariant stream
// copies the line. The boson part of the role cannot ride the husk; a token that moves covariantly is in the
// doublet, which is to say it is a spinor, by force rather than by choice.
//
// PART B (the run). The token carries, per dock, an amplitude for each own point p, slot and role component. A
// color field of translations sits on the husk links (a golden Weyl sequence, a live field with holonomy): a copy
// crossing a link has its role displaced and its own point moved with it, D(v) A(p) D(v)^dagger = A(p + v). The
// COMOVING law streams the spin in the token's own frame, G_a(p) = D(p) (sigma_a (+) 1) D(p)^dagger. The
// FIXED-FRAME control streams it about the origin whatever the point, G_a = sigma_a (+) 1.
//
// PREDICTIONS, written before any run.
// A  the covariant generators on the role have complex dimension 1 per axis triple (the locked sigma_a on the
//    doublet, and nothing on the line), and sigma_a (+) 0 is one
// B1 with the color field off both laws are the plain nested token exactly (the own point never leaves the origin),
//    so g = 2 (E-MTR-0017, E-SPN-0064) carries over to the embedded token unchanged
// B2 with a live color field the comoving law keeps the fermion number (the doublet weight about each amplitude's
//    own point) at 1 on every beat, with exact norm, continuity, Gauss's law and reversal
// B3 the fixed-frame law leaks it into the line: the fermion number leaves 1 by more than 1e-3
//
// Gates, fixed before the first run:
// GA every covariant generator (the image of the twirl over the 24 units) is under 1e-12 on the line row and
//    column, the image's complex dimension is 1, and (sigma_x, sigma_y, sigma_z) (+) 0 is fixed by the twirl to 1e-12
// GB1 color field off, 4^3 torus, charge 1 in a uniform field along z, 640 beats (40 periods): both laws equal the
//    plain token (code/rule/spinor-token) embedded at the origin to 1e-12
// GB2 live color field, same torus and field, 10,000 beats (625 periods), comoving law: |1 - N / norm| under 1e-10
//    on every beat, norm drift under 1e-10, continuity under 1e-12, Gauss's law on a 2^3 cube under 1e-10,
//    reversal to 1e-9
// GB3 the same with the fixed-frame law: max |1 - N / norm| over 1e-3
//
// Depth: L1 for part A, L2 for part B (a constructed stand-in against gates).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { beatWalker, copyWalker, dockIndex, makeWalker, type Complex, type Step, type Walker } from '@/code/rule/spinor-token'
import { unitRotations } from '@/code/measure/token-gates'
import {
  beatRoleWalker,
  colorField,
  fermionNumber,
  inverseBeatRoleWalker,
  makeRoleWalker,
  roleDensity,
  roleIndex,
  roleTables,
  type Law,
  type RoleWalker,
} from '@/code/rule/comoving-token'

const NESTED: readonly Step[] = ['z', 'up', 'down', 'x', 'up', 'down', 'y', 'up', 'down', 'y', 'up', 'down', 'x', 'up', 'down', 'z']
const SIDE = 4
const EMBED_BEATS = 640
const RUN_BEATS = 10000
const CUBE = 2

type C3 = { re: Float64Array; im: Float64Array }

// part A: the twirl over the 24 units on triples of 3 x 3 role generators, basis (doublet up, doublet down, line)
function partA(): { dimension: number; lineWorst: number; lockedFixedGap: number } {
  const units = unitRotations()
  const rho = (spin: Complex[]): C3 => {
    const m: C3 = { re: new Float64Array(9), im: new Float64Array(9) }

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        m.re[i * 3 + j] = (spin[i * 2 + j] ?? [0, 0])[0]
        m.im[i * 3 + j] = (spin[i * 2 + j] ?? [0, 0])[1]
      }
    }

    m.re[8] = 1

    return m
  }
  const mul = (a: C3, b: C3): C3 => {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 3; j++) {
          re[i * 3 + j] = (re[i * 3 + j] ?? 0) + (a.re[i * 3 + k] ?? 0) * (b.re[k * 3 + j] ?? 0) - (a.im[i * 3 + k] ?? 0) * (b.im[k * 3 + j] ?? 0)
          im[i * 3 + j] = (im[i * 3 + j] ?? 0) + (a.re[i * 3 + k] ?? 0) * (b.im[k * 3 + j] ?? 0) + (a.im[i * 3 + k] ?? 0) * (b.re[k * 3 + j] ?? 0)
        }
      }
    }

    return { re, im }
  }
  const dagger = (a: C3): C3 => {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        re[i * 3 + j] = a.re[j * 3 + i] ?? 0
        im[i * 3 + j] = -(a.im[j * 3 + i] ?? 0)
      }
    }

    return { re, im }
  }
  const twirl = (x: C3[]): C3[] => {
    const out: C3[] = [0, 1, 2].map(() => ({ re: new Float64Array(9), im: new Float64Array(9) }))

    for (const { rotation } of units) {
      const r = rho(rotation.spin)
      const rd = dagger(r)

      for (let a = 0; a < 3; a++) {
        const image = [0, 1, 2].map(i => rotation.matrix[3 * i + a] ?? 0)
        const b = image.findIndex(v => Math.abs(v) > 0.5)
        const s = image[b] ?? 1
        const moved = mul(mul(r, x[a]!), rd)

        for (let i = 0; i < 9; i++) {
          out[b]!.re[i] = (out[b]!.re[i] ?? 0) + (s * (moved.re[i] ?? 0)) / units.length
          out[b]!.im[i] = (out[b]!.im[i] ?? 0) + (s * (moved.im[i] ?? 0)) / units.length
        }
      }
    }

    return out
  }
  const flat = (x: C3[]): number[] => x.flatMap(m => [...m.re, ...m.im])
  const images: number[][] = []
  let lineWorst = 0

  for (let a = 0; a < 3; a++) {
    for (let e = 0; e < 9; e++) {
      for (const imaginary of [false, true]) {
        const x: C3[] = [0, 1, 2].map(() => ({ re: new Float64Array(9), im: new Float64Array(9) }))

        ;(imaginary ? x[a]!.im : x[a]!.re)[e] = 1

        const y = twirl(x)

        for (const m of y) {
          for (let i = 0; i < 9; i++) {
            if (Math.floor(i / 3) === 2 || i % 3 === 2) {
              lineWorst = Math.max(lineWorst, Math.hypot(m.re[i] ?? 0, m.im[i] ?? 0))
            }
          }
        }

        images.push(flat(y))
      }
    }
  }

  // the real rank of the image, by Gram-Schmidt; the space is complex, so its complex dimension is half
  const basis: number[][] = []

  for (const v of images) {
    const w = [...v]

    for (const b of basis) {
      const dot = w.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

      for (let i = 0; i < w.length; i++) {
        w[i] = (w[i] ?? 0) - dot * (b[i] ?? 0)
      }
    }

    const length = Math.hypot(...w)

    if (length > 1e-9) {
      basis.push(w.map(x => x / length))
    }
  }

  const locked: C3[] = [
    { re: Float64Array.from([0, 1, 0, 1, 0, 0, 0, 0, 0]), im: new Float64Array(9) },
    { re: new Float64Array(9), im: Float64Array.from([0, -1, 0, 1, 0, 0, 0, 0, 0]) },
    { re: Float64Array.from([1, 0, 0, 0, -1, 0, 0, 0, 0]), im: new Float64Array(9) },
  ]
  const fixed = twirl(locked)
  const lockedFixedGap = Math.max(...flat(fixed).map((x, i) => Math.abs(x - (flat(locked)[i] ?? 0))))

  return { dimension: basis.length / 2, lineWorst, lockedFixedGap }
}

function packet(side: number): { plain: Walker; role: RoleWalker } {
  const plain = makeWalker(side)
  const role = makeRoleWalker(side)
  let total = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const r2 = (x - side / 2) ** 2 + (y - side / 2) ** 2 + (z - side / 2) ** 2

        total += Math.exp(-r2 / 2)
      }
    }
  }

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const d = dockIndex(side, x, y, z)
        const g = Math.exp(-((x - side / 2) ** 2 + (y - side / 2) ** 2 + (z - side / 2) ** 2) / 4) / Math.sqrt(total)

        plain.re[4 * d] = g
        // spin up in slot 0 at the origin: e0 = |0>
        role.re[roleIndex(d, 0, 0, 0)] = g
      }
    }
  }

  return { plain, role }
}

function field(side: number): (Float64Array | undefined)[] {
  const thetaY = new Float64Array(side ** 3)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        thetaY[dockIndex(side, x, y, z)] = ((2 * Math.PI) / side) * x
      }
    }
  }

  return [undefined, thetaY, undefined]
}

// the embedded plain walker's amplitude against the role walker's, at the origin point (e0 = |0>, e1 = (|1> + |2>)
// / sqrt 2), with every other point and the line required to be empty
function embeddingGap(plain: Walker, role: RoleWalker): number {
  let worst = 0
  const h = Math.SQRT1_2

  for (let d = 0; d < plain.side ** 3; d++) {
    for (let p = 0; p < 9; p++) {
      for (let slot = 0; slot < 2; slot++) {
        const o = roleIndex(d, p, slot, 0)
        const up: Complex = p === 0 ? [plain.re[4 * d + 2 * slot] ?? 0, plain.im[4 * d + 2 * slot] ?? 0] : [0, 0]
        const down: Complex = p === 0 ? [plain.re[4 * d + 2 * slot + 1] ?? 0, plain.im[4 * d + 2 * slot + 1] ?? 0] : [0, 0]
        const expected: Complex[] = [up, [down[0] * h, down[1] * h], [down[0] * h, down[1] * h]]

        for (let r = 0; r < 3; r++) {
          worst = Math.max(worst, Math.hypot((role.re[o + r] ?? 0) - (expected[r] ?? [0, 0])[0], (role.im[o + r] ?? 0) - (expected[r] ?? [0, 0])[1]))
        }
      }
    }
  }

  return worst
}

function liveRun(law: Law): { fermionWorst: number; normDrift: number; continuity: number; gaussGap: number; reversalGap: number } {
  const side = SIDE
  const tables = roleTables()
  const color = colorField(side, false)
  const theta = field(side)
  const start = packet(side).role
  const w: RoleWalker = { side, re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
  const flow = new Float64Array(3 * side ** 3)
  const currents = new Float64Array(3 * side ** 3)
  let fermionWorst = 0
  let normDrift = 0
  let continuity = 0
  const periods = Math.round(RUN_BEATS / NESTED.length)

  for (let t = 0; t < periods; t++) {
    for (const step of NESTED) {
      const before = roleDensity(w)

      currents.fill(0)
      beatRoleWalker({ walker: w, step, law, tables, color, charge: 1, theta, currents })

      const after = roleDensity(w)

      for (let d = 0; d < side ** 3; d++) {
        const x = d % side
        const y = Math.floor(d / side) % side
        const z = Math.floor(d / (side * side))
        let divergence = 0

        for (let axis = 0; axis < 3; axis++) {
          const back = dockIndex(side, x - (axis === 0 ? 1 : 0), y - (axis === 1 ? 1 : 0), z - (axis === 2 ? 1 : 0))

          divergence += (currents[3 * d + axis] ?? 0) - (currents[3 * back + axis] ?? 0)
        }

        continuity = Math.max(continuity, Math.abs((after[d] ?? 0) - (before[d] ?? 0) + divergence))
      }

      for (let i = 0; i < flow.length; i++) {
        flow[i] = (flow[i] ?? 0) + (currents[i] ?? 0)
      }

      const n = fermionNumber(w, tables)

      fermionWorst = Math.max(fermionWorst, Math.abs(1 - n.doublet / n.total))
      normDrift = Math.max(normDrift, Math.abs(n.total - 1))
    }
  }

  // Gauss's law on a cube
  const lo = side / 2 - CUBE / 2
  const inside = (d: number): boolean => {
    const x = d % side
    const y = Math.floor(d / side) % side
    const z = Math.floor(d / (side * side))

    return x >= lo && x < lo + CUBE && y >= lo && y < lo + CUBE && z >= lo && z < lo + CUBE
  }
  let outward = 0

  for (let d = 0; d < side ** 3; d++) {
    const x = d % side
    const y = Math.floor(d / side) % side
    const z = Math.floor(d / (side * side))

    for (let axis = 0; axis < 3; axis++) {
      const ahead = dockIndex(side, x + (axis === 0 ? 1 : 0), y + (axis === 1 ? 1 : 0), z + (axis === 2 ? 1 : 0))

      outward += inside(d) && !inside(ahead) ? (flow[3 * d + axis] ?? 0) : 0
      outward -= !inside(d) && inside(ahead) ? (flow[3 * d + axis] ?? 0) : 0
    }
  }

  const d0 = roleDensity(start)
  const d1 = roleDensity(w)
  let left = 0

  for (let d = 0; d < side ** 3; d++) {
    left += inside(d) ? (d0[d] ?? 0) - (d1[d] ?? 0) : 0
  }

  const back: RoleWalker = { side, re: Float64Array.from(w.re), im: Float64Array.from(w.im) }

  for (let t = 0; t < periods; t++) {
    for (const step of [...NESTED].reverse()) {
      inverseBeatRoleWalker({ walker: back, step, law, tables, color, charge: 1, theta })
    }
  }

  let reversalGap = 0

  for (let i = 0; i < back.re.length; i++) {
    reversalGap += ((back.re[i] ?? 0) - (start.re[i] ?? 0)) ** 2 + ((back.im[i] ?? 0) - (start.im[i] ?? 0)) ** 2
  }

  return { fermionWorst, normDrift, continuity, gaussGap: Math.abs(outward - left), reversalGap: Math.sqrt(reversalGap) }
}

export default experiment({
  id: 'spin/comoving-token',
  code: 'E-SPN-0066',
  title:
    'the chosen g = 2 token with its spin inside the role about its own point, a STAND-IN: no husk-covariant stream can copy the role\'s boson line, so a covariant token is in the spinor doublet by force; streamed in its own frame through a live color field it keeps the fermion number, the charge and g = 2 together, where the same token streamed in a fixed frame leaks into the line',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const a = partA()
    const ga = a.lineWorst < 1e-12 && a.dimension === 1 && a.lockedFixedGap < 1e-12

    // GB1: color off, both laws against the plain token
    const tables = roleTables()
    const off = colorField(SIDE, true)
    const theta = field(SIDE)
    const embed: Record<Law, number> = { comoving: 0, fixed: 0 }

    for (const law of ['comoving', 'fixed'] as const) {
      const { plain, role } = packet(SIDE)
      const p: Walker = copyWalker(plain)

      for (let t = 0; t < EMBED_BEATS; t++) {
        const step = NESTED[t % NESTED.length] ?? 'x'

        beatWalker({ walker: p, step, mode: 'locked', charge: 1, theta })
        beatRoleWalker({ walker: role, step, law, tables, color: off, charge: 1, theta })
        embed[law] = Math.max(embed[law], embeddingGap(p, role))
      }
    }

    const gb1 = embed.comoving < 1e-12 && embed.fixed < 1e-12
    const comoving = liveRun('comoving')
    const fixed = liveRun('fixed')
    const gb2 = comoving.fermionWorst < 1e-10 && comoving.normDrift < 1e-10 && comoving.continuity < 1e-12 && comoving.gaussGap < 1e-10 && comoving.reversalGap < 1e-9
    const gb3 = fixed.fermionWorst > 1e-3
    const ok = ga && gb1 && gb2 && gb3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `every husk-covariant stream generator on the role vanishes on its boson line (worst ${a.lineWorst.toExponential(1)}), the covariant generators form a space of complex dimension ${a.dimension}, and the locked sigma_a on the doublet is one (gap ${a.lockedFixedGap.toExponential(1)}), so a covariant token is a spinor by force; with the color field off the role token is the plain nested token to ${Math.max(embed.comoving, embed.fixed).toExponential(1)} over ${EMBED_BEATS} beats, so its g = 2 carries over; through a live color field for ${RUN_BEATS} beats the comoving law keeps the fermion number to ${comoving.fermionWorst.toExponential(1)}, the norm to ${comoving.normDrift.toExponential(1)}, continuity to ${comoving.continuity.toExponential(1)} and Gauss's law to ${comoving.gaussGap.toExponential(1)}, and reverses to ${comoving.reversalGap.toExponential(1)}, while the fixed-frame law moves the fermion number share by ${fixed.fermionWorst.toFixed(4)} and is not even unitary in the color field (its norm reaches ${fixed.normDrift.toExponential(1)}), so reading the spin in the token's own frame is what makes the stream a law at all once the links carry color`,
      metrics: {
        covariantDimension: a.dimension,
        covariantLineWorst: a.lineWorst,
        lockedFixedGap: a.lockedFixedGap,
        embedGapComoving: embed.comoving,
        embedGapFixed: embed.fixed,
        comovingFermionWorst: comoving.fermionWorst,
        comovingNormDrift: comoving.normDrift,
        comovingContinuity: comoving.continuity,
        comovingGaussGap: comoving.gaussGap,
        comovingReversalGap: comoving.reversalGap,
      },
      control: {
        fixedFermionWorst: fixed.fermionWorst,
        fixedNormDrift: fixed.normDrift,
        fixedContinuity: fixed.continuity,
        fixedGaussGap: fixed.gaussGap,
        fixedReversalGap: fixed.reversalGap,
      },
      notes:
        'L1 for part A, L2 for part B. STAND-IN in every sense E-SPN-0053 listed: one amplitude with no constituents, the charge a label felt as a Peierls phase, the coin angle and the 16-beat schedule chosen rather than derived. What part A adds is that the spin is no longer a free choice once the token lives in the role: the only covariant way to stream a role on the husk is the locked sigma_a on its parity-even doublet, because the central element of the husk\'s double cover is -1 there and +1 on the line, and a half turn reverses an axis. The color field here is translations only (the Heisenberg part of the link group), fixed on the links, not the knit\'s own Sigma(648) links and not dynamical; the U(1) field is put in. The fermion number is exact because each piece keeps the doublet about the amplitude\'s own point: the coin acts on slots, the comoving stream is block diagonal in that doublet, and a link carries the doublet about p to the doublet about p + v. The fixed-frame control is the same token read about the origin, which is what the model\'s fear beat does to a pair (E-SPN-0059). First run, recorded: every gate passed, and the control failed harder than predicted. The fixed-frame law is not unitary once the links carry color: a link carries the forward projector (1 + G) / 2 to D(v) (1 + G) D(v)^dagger / 2, which is not orthogonal to the backward projector arriving at the same dock and point, so weight is created, the norm grows without bound (7.5e159 over 10,000 beats) and it is not reversible. In the comoving law the carried projector IS the one about the moved point, which is why it is unitary. So GB3 passes for a stronger reason than written: the fixed frame is not a rule at all in a color field. The claim text was corrected after the first run (it had called the control\'s charge exact); no gate or number changed.',
    })
  },
})
