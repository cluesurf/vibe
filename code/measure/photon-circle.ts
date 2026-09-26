// Readings of the wave-shaped light against compact U(1): the exact shadow law, the branch it reads, and the
// comparison with float references, over a 17-member family of starts (E-FRC-0244, E-FRC-0245).
//
// THE LAW (derived in code/rule/photon-circle). For the wave form from a zero carried start, with the shadow
//   A~_t = A~_(t-1) + E~_(t-1) (unwrapped, from A~_0 = centered link angles),  E~_t = E_t + C^T (U_t - U_(t-1)) / q,
// every beat obeys
//   E~_t - E~_(t-1) = -kappa C^T (F_t + S_t / q) - C^T r_t,   S_t = C C^T U_(t-1),  r_t = (q V_t - p S_t) / q^2,
// F_t the flux value the rule's force read (the centered raw flux for E-FRC-0185, B - N n on the shadow's branch for
// the circle rule). All of these are binary fractions of 2^-32 or coarser below 2^40, so float64 holds them EXACTLY
// and the residual of the law is computed with no error: it must equal -C^T r_t, bounded by (plaquettes per link)
// / (2 q). The branch integer n_t = (C A~_t - S_t / q - F_t) / N must be an integer, and the Villain branch of the
// shadow itself is the n~_t with C A~_t - N n~_t in (-N/2, N/2]; E-FRC-0185 reads n_t != n~_t wherever a plaquette's
// shadow flux sits within the dither's offset S_t / q of the seam.
//
// THE REFERENCES (measurement, floats): the compact Villain leapfrog A += E, E -= kappa C^T [C A]_N, with its own
// branch, and the noncompact linear leapfrog A += E, E -= kappa C^T C A (E-FRC-0185's S reference), both from the
// same integer start. A string move is a plaquette whose Villain branch changes between beats in the reference.
//
// THE FAMILY. E-MTH-0028's 17 link starts are vibe-weave grid moves, which this rule has none of, so the photon
// analog is used: 16 hashed E-FRC-0164 starts on the side-4 bulk box, member k with its hash scale 1.37 + frac(k *
// SILVER) (member 0 is E-FRC-0164's own start), and the E-FRC-0165 hot start on side 8. Deterministic, no seeds.

import { circleBeatBackInPlace, circleBeatInPlace, makeCircleRule, type CircleRule } from '@/code/rule/photon-circle'
import { copyShapedState, curlTranspose, emptyShapedState, makeShapedRule, shapedBeatBackInPlace, shapedBeatInPlace, type ShapedRule, type ShapedState } from '@/code/rule/photon-shaped'
import { addHashedCurl, photonGaussViolations, photonLatticeD4, photonLink, setHashedAngles, type PhotonLattice, type PhotonRule, type PhotonState } from '@/code/rule/photon-links'
import { hotStart, K, N, Q, type Start } from '@/code/measure/photon-battery'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

export type Member = { readonly name: string; readonly side: number; readonly start: Start }

// E-FRC-0164's start with its hash scale as a parameter (the committed start is scale 1.37)
function hashedStart(scale: number): Start {
  return (rule, s) => {
    const { lattice } = rule

    for (let x = 0; x < lattice.cells; x++) {
      const u = ((x + 1) * GOLDEN * scale) % 1
      const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
      const y = lattice.neighbour[x * lattice.degree + d] ?? 0

      if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
        const v = u < 0.15 ? 1 : -1
        const [l, sign] = photonLink(lattice, x, d)

        s.vibe[x] = v
        s.vibe[y] = -v
        s.flux[l] = (s.flux[l] ?? 0) + sign * v * rule.charge
      }
    }

    setHashedAngles(rule, s, 512, 3.7 * scale)
    addHashedCurl(rule, s, 181, 5.3 * scale)
  }
}

export function photonFamily(): Member[] {
  return [
    ...Array.from({ length: 16 }, (_, k): Member => ({ name: `hashed+${k}`, side: 4, start: hashedStart(k === 0 ? 1.37 : 1.37 + ((k * SILVER) % 1)) })),
    { name: 'hot', side: 8, start: hotStart },
  ]
}

const viewOf = (s: ShapedState): PhotonState => ({ vibe: s.vibe, angle: s.angle, flux: s.flux, demon: new Int32Array(s.flux.length) })

const centered = (b: number, n: number): number => {
  const c = ((b % n) + n) % n

  return 2 * c > n ? c - n : c
}

// E-FRC-0185's own centered value (photon-shaped centeredOf: an exact half turn reads 0)
const centeredShaped = (b: number, n: number): number => {
  const c = ((b % n) + n) % n

  if (2 * c === n) {
    return 0
  }

  return 2 * c > n ? c - n : c
}

// the Villain branch: n with b - N n in (-N/2, N/2]
const villainBranch = (b: number, n: number): number => Math.ceil((b - n / 2) / n)

export type Kind = 'wave' | 'circle'

export type MemberReading = {
  member: string
  side: number
  plaquettes: number
  // the largest residual of the law minus its bound's own term, and the bound
  lawResidual: number
  lawRoundingBound: number
  // |n_t - round(n_t)| worst, and the plaquette-beats at an exact half turn (E-FRC-0185 reads 0 there)
  branchNonInteger: number
  halfTurns: number
  // plaquette-beats where the rule's branch differs from the Villain branch of its own shadow
  branchOffLight: number
  // string moves of the rule (its branch n_t changing on a plaquette between beats) and of the Villain reference, and
  // the largest |shadow plaquette flux| the rule reached
  ruleStringMoves: number
  referenceStringMoves: number
  peakShadowFlux: number
  // worst |E~ - reference| over links and beats
  shadowFromVillain: number
  shadowFromLinear: number
  // the first beat at which the shadow leaves the Villain reference by more than 0.01 (-1 if never)
  firstDeparture: number
  // the shadow energy of the start and the single-plaquette seam energy kappa (1 - kappa lambda_max / 4) (N/2)^2
  startEnergy: number
  seamEnergy: number
}

function makeRule(kind: Kind, lattice: PhotonLattice): ShapedRule | CircleRule {
  return kind === 'circle' ? makeCircleRule({ lattice, n: N, k: K, q: Q }) : makeShapedRule({ lattice, n: N, k: K, q: Q, form: 'wave' })
}

const beatOf = (kind: Kind): ((rule: ShapedRule, s: ShapedState) => void) => (kind === 'circle' ? circleBeatInPlace : shapedBeatInPlace)

// the largest eigenvalue of M = C^T C by power iteration on a golden Weyl start (measurement)
export function curlCurlMax(lattice: PhotonLattice): number {
  const size = lattice.plaquetteSize
  const v = Float64Array.from({ length: lattice.links }, (_, l) => ((l + 1) * GOLDEN) % 1 - 0.5)
  const b = new Float64Array(lattice.plaquetteCount)
  const out = new Float64Array(lattice.links)
  let lambda = 0

  for (let it = 0; it < 200; it++) {
    for (let p = 0; p < lattice.plaquetteCount; p++) {
      let s = 0

      for (let j = 0; j < size; j++) {
        s += (lattice.plaquetteSigns[p * size + j] ?? 0) * (v[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
      }

      b[p] = s
    }

    out.fill(0)

    for (let p = 0; p < lattice.plaquetteCount; p++) {
      for (let j = 0; j < size; j++) {
        const l = lattice.plaquetteLinks[p * size + j] ?? 0

        out[l] = (out[l] ?? 0) + (lattice.plaquetteSigns[p * size + j] ?? 0) * (b[p] ?? 0)
      }
    }

    let norm = 0

    for (let l = 0; l < out.length; l++) {
      norm += (out[l] ?? 0) ** 2
    }

    norm = Math.sqrt(norm)
    lambda = norm / Math.sqrt(v.reduce((s, x) => s + x * x, 0))

    for (let l = 0; l < out.length; l++) {
      v[l] = (out[l] ?? 0) / norm
    }
  }

  return lambda
}

// One member under one rule for `beats` beats: the law, the branches, the references.
export function readMember(input: { member: Member; kind: Kind; beats: number; lambdaMax: number }): MemberReading {
  const { member, kind, beats } = input
  const lattice = photonLatticeD4({ side: member.side })
  const rule = makeRule(kind, lattice)
  const s = emptyShapedState(rule, 'zero')

  member.start(rule.base, viewOf(s))

  const beat = beatOf(kind)
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns
  const P = lattice.plaquetteCount
  const L = lattice.links
  const p = rule.p
  const q = rule.q
  const kappa = p / q
  // the shadow, unwrapped
  const shadowA = Float64Array.from(s.angle, a => centered(a, N))
  const shadowE = Float64Array.from(s.flux)
  const previousE = new Float64Array(L)
  // the references
  const villainA = Float64Array.from(shadowA)
  const villainE = Float64Array.from(shadowE)
  const linearA = Float64Array.from(shadowA)
  const linearE = Float64Array.from(shadowE)
  const villainN = new Int32Array(P)
  const ruleN = new Int32Array(P)
  const newer = new Float64Array(L)
  const older = new Float64Array(L)
  const lawForce = new Float64Array(L)
  const plaquettesPerLink = new Int32Array(L)

  for (let e = 0; e < P * size; e++) {
    plaquettesPerLink[links[e] as number] = (plaquettesPerLink[links[e] as number] ?? 0) + 1
  }

  const maxPerLink = Math.max(...plaquettesPerLink)
  const lawRoundingBound = maxPerLink / (2 * q)

  // start energy of the shadow: |E|^2 + kappa (C A).(C E) + kappa |C A|^2
  let startEnergy = 0

  for (let l = 0; l < L; l++) {
    startEnergy += (shadowE[l] as number) ** 2
  }

  for (let pl = 0; pl < P; pl++) {
    let ca = 0
    let ce = 0

    for (let j = 0; j < size; j++) {
      ca += (signs[pl * size + j] as number) * (shadowA[links[pl * size + j] as number] as number)
      ce += (signs[pl * size + j] as number) * (shadowE[links[pl * size + j] as number] as number)
    }

    startEnergy += kappa * ca * ce + kappa * ca * ca
    villainN[pl] = villainBranch(ca, N)
  }

  const seamEnergy = kappa * (1 - (kappa * input.lambdaMax) / 4) * (N / 2) ** 2

  let lawResidual = 0
  let branchNonInteger = 0
  let halfTurns = 0
  let branchOffLight = 0
  let referenceStringMoves = 0
  let ruleStringMoves = 0
  let peakShadowFlux = 0
  let shadowFromVillain = 0
  let shadowFromLinear = 0
  let firstDeparture = -1

  const referenceBeat = (A: Float64Array, E: Float64Array, compact: boolean, count: boolean): void => {
    for (let l = 0; l < L; l++) {
      A[l] = (A[l] as number) + (E[l] as number)
    }

    for (let pl = 0; pl < P; pl++) {
      let b = 0

      for (let j = 0; j < size; j++) {
        b += (signs[pl * size + j] as number) * (A[links[pl * size + j] as number] as number)
      }

      let flux = b

      if (compact) {
        const n = villainBranch(b, N)

        if (count && n !== villainN[pl]) {
          referenceStringMoves++
          villainN[pl] = n
        }

        flux = b - N * n
      }

      const force = kappa * flux

      for (let j = 0; j < size; j++) {
        const l = links[pl * size + j] as number

        E[l] = (E[l] as number) - (signs[pl * size + j] as number) * force
      }
    }
  }

  for (let t = 1; t <= beats; t++) {
    previousE.set(shadowE)
    // the shadow angle moves by the previous shadow flux: A~_t = A~_(t-1) + E~_(t-1)
    for (let l = 0; l < L; l++) {
      shadowA[l] = (shadowA[l] as number) + (previousE[l] as number)
    }

    // U_(t-1) before the beat, for S_t and w_(t-1)
    curlTranspose(lattice, s.carried[0]!, older)
    beat(rule, s)
    curlTranspose(lattice, s.carried[0]!, newer)

    for (let l = 0; l < L; l++) {
      shadowE[l] = (s.flux[l] as number) + ((newer[l] as number) - (older[l] as number)) / q
    }

    // the law: E~_t - E~_(t-1) + kappa C^T (F_t + S_t / q) must be -C^T r_t
    lawForce.fill(0)

    for (let pl = 0, o = 0; pl < P; pl++, o += size) {
      let braw = 0
      let spread = 0
      let shadowFlux = 0

      for (let j = 0; j < size; j++) {
        const l = links[o + j] as number
        const g = signs[o + j] as number

        braw += g * (s.angle[l] as number)
        spread += g * (older[l] as number)
        shadowFlux += g * (shadowA[l] as number)
      }

      let F: number

      if (kind === 'circle') {
        const n = Math.ceil((q * braw + spread - (q * N) / 2) / (q * N))

        F = braw - N * n
      } else {
        const c = centeredShaped(braw, N)

        halfTurns += 2 * (((braw % N) + N) % N) === N ? 1 : 0
        F = c
      }

      const nt = (shadowFlux - spread / q - F) / N
      const nearest = Math.round(nt)

      branchNonInteger = Math.max(branchNonInteger, Math.abs(nt - nearest))

      if (t > 1 && nearest !== ruleN[pl]) {
        ruleStringMoves++
      }

      ruleN[pl] = nearest
      branchOffLight += nearest === villainBranch(shadowFlux, N) ? 0 : 1
      peakShadowFlux = Math.max(peakShadowFlux, Math.abs(shadowFlux - N * villainBranch(shadowFlux, N)))

      // the Villain law's force, kappa (F + S / q): the rule paid round(p S / q) / q for kappa S / q, so the residual
      // of the law is exactly C^T of those roundings
      const force = kappa * (F + spread / q)

      for (let j = 0; j < size; j++) {
        const l = links[o + j] as number

        lawForce[l] = (lawForce[l] as number) + (signs[o + j] as number) * force
      }
    }

    for (let l = 0; l < L; l++) {
      // E~_t - E~_(t-1) + C^T (kappa F + V / q) is identically 0 by the rule's algebra, and V / q = kappa S / q + r
      lawResidual = Math.max(lawResidual, Math.abs((shadowE[l] as number) - (previousE[l] as number) + (lawForce[l] as number)))
    }

    referenceBeat(villainA, villainE, true, true)
    referenceBeat(linearA, linearE, false, false)

    let worstVillain = 0

    for (let l = 0; l < L; l++) {
      worstVillain = Math.max(worstVillain, Math.abs((shadowE[l] as number) - (villainE[l] as number)))
      shadowFromLinear = Math.max(shadowFromLinear, Math.abs((shadowE[l] as number) - (linearE[l] as number)))
    }

    shadowFromVillain = Math.max(shadowFromVillain, worstVillain)

    if (firstDeparture < 0 && worstVillain > 0.01) {
      firstDeparture = t
    }
  }

  return {
    member: member.name,
    side: member.side,
    plaquettes: P,
    lawResidual,
    lawRoundingBound,
    branchNonInteger,
    halfTurns,
    branchOffLight,
    ruleStringMoves,
    referenceStringMoves,
    peakShadowFlux,
    shadowFromVillain,
    shadowFromLinear,
    firstDeparture,
    startEnergy,
    seamEnergy,
  }
}

// exact reversal: `beats` forward then back, every angle, flux and carried integer compared with the start, and
// Gauss's law checked at the far end
export function reverseMember(input: { member: Member; kind: Kind; beats: number }): { mismatches: number; gauss: number; anglesMoved: number } {
  const lattice = photonLatticeD4({ side: input.member.side })
  const rule = makeRule(input.kind, lattice)
  const s = emptyShapedState(rule, 'zero')

  input.member.start(rule.base, viewOf(s))

  const start = copyShapedState(s)

  for (let t = 0; t < input.beats; t++) {
    beatOf(input.kind)(rule, s)
  }

  const gauss = photonGaussViolations(rule.base as PhotonRule, viewOf(s))
  let anglesMoved = 0

  for (let l = 0; l < s.angle.length; l++) {
    anglesMoved += s.angle[l] === start.angle[l] ? 0 : 1
  }

  for (let t = 0; t < input.beats; t++) {
    ;(input.kind === 'circle' ? circleBeatBackInPlace : shapedBeatBackInPlace)(rule, s)
  }

  let mismatches = 0

  for (let l = 0; l < s.angle.length; l++) {
    mismatches += s.angle[l] === start.angle[l] ? 0 : 1
    mismatches += s.flux[l] === start.flux[l] ? 0 : 1
  }

  s.carried.forEach((c, j) => {
    for (let i = 0; i < c.length; i++) {
      mismatches += c[i] === start.carried[j]![i] ? 0 : 1
    }
  })

  return { mismatches, gauss, anglesMoved }
}
