// THE POINTER IS WHAT THE ENVIRONMENT CONSERVES (E-QTM-0166, OPEN-QTM-06, the route "the pointer is what the environment
// conserves" in routes/quantum-relativity-light-computation.md, row "A · decoherence and pointer states"). Einselection
// picks the eigenbasis of what the system-environment coupling keeps. E-FND-0170 found that the only local conserved
// densities of the working rule are the love and fear counts. The route reads from this that the one pointer a covariant
// rule can pick is a dock's love and fear numbers, a charge-like superselection, and not the role, which would also
// explain E-QTM-0154 (a frame-covariant rule with a frame-invariant environment depolarizes every role basis alike).
// This file runs the route's test on C* (E-FND-0160): a member in a superposition of two local love counts against a
// member in a superposition of two roles at one dock, both coupled by the rule to the same environment, and reads the
// off-diagonal of the system's reduced state every beat.
//
// WHAT IS RUN, AND WHY IT IS NOT THE TEST AS WRITTEN.
//  - THE VACUUM OF C* IS NOT AN ENVIRONMENT. C*'s vacuum is the full sea (both tones' seas filled). Every piece of the
//    rule is one-body on a lone hole, and the one-body pieces are blind to the role and to the tone (E-FND-0160: R*'s
//    pieces act as R* (x) 1 on role and tone; both species run the same orbit). So a member alone in 8 to 16 vacuum docks
//    keeps every role coherence and every tone coherence exactly, at any number of docks: both superpositions dephase at
//    one rate, zero. That is the route's kill condition met for a structural reason, and it reads nothing about which
//    basis an environment picks, because the full sea couples to nothing. The rule couples a member only to another hole
//    (the sector pair pieces and the fear beat act on hole pairs counted from the sea). So the closest decisive version
//    takes as the environment one other hole, a fear-tone member, together with both members' positions over the docks
//    of the box: the L = 2 D4 torus (8 docks, the route's range) and the L = 4 torus (128 docks).
//  - "A LOCAL LOVE COUNT" ON C*. The tone is a species: a hole of the fear sea is a love-tone member (love count 1 at its
//    dock), a hole of the love sea a fear-tone member (fear count 1). A superposition of two local love counts at one dock
//    is taken as the member superposed between love-tone and fear-tone, same dock, same orbital start, same role chi1:
//    one branch has (love, fear) counts (1, 0) at the member's place, the other (0, 1). The rule keeps each species'
//    number, so the tone is conserved by the whole dynamics: the two branches never mix, and the system's reduced
//    off-diagonal is the overlap of what the rest of the world does in each branch. The rule cannot prepare such a state
//    (it never changes a count); it is put in by hand, as environment-induced superselection arguments do.
//  - THE ROLE SUPERPOSITION. A love-tone member in (|a> + |b>) / sqrt 2, a and b two states of one of the 4 role bases
//    (the 4 line classes of the role grid, the qutrit's 4 stabilizer bases), same orbital start.
//  - THE ENVIRONMENT MEMBER is fear-tone with role chi2 one of the 12 line states. So in the role case and in the love
//    branch the pair is unlike (distinguishable, kernel V = 1 + (w - 1) Phi Phi^dag), and in the fear branch the pair is
//    like (identical fermions, kernel U = P_sym + w P_anti), w the knit's fear angle ringUnit(0, 2), as in E-FND-0160.
//  - THE FAMILIES. Tone: chi1 over the 12 line states, chi2 over the 12 (144 cases). Role: 4 classes x 3 pairs (a, b) x
//    12 chi2 (144 cases). Both families are closed under the 216 grid moves, so neither favours a frame.
//  - THE ORBITS. E-FND-0160's rule (the member mixers at ringUnit(-1, 4), the sector string ringUnit(-2, 1) a unit of V
//    capped at 8, the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed), run on E-SPN-0175's two-hole
//    engine (code/measure/register-sea: the full slot-and-register space of both holes at every relative dock, no
//    truncation, floats on exact pieces), one beat at a time. Two starts: S1, both members at one dock in the moving
//    states of slot 0 and slot 1, register 0 (E-FND-0160's start, modes 0 and 8); S2, modes 17 (slot 2, register 1) and
//    109 (slot 13, register 5), not in the probes (the smoke saw it for 4 beats). 96 beats.
//
// DERIVED BEFORE THE GATE RUN (L1, from the construction).
// 1. THE KERNELS ARE CHANNELS. Both kernels and the control kernel below are sum_k e^(i theta_k) Pi_k with projectors Pi_k
//    on the role pair that commute with the role swap, and every other piece is role-blind and tone-blind. So each
//    branch is a sum over channels of one orbital run W_k psi0 (the contact phase moved by theta_k) times Pi_k chi, chi =
//    chi1 (x) chi2. Everything below is fixed by the channel overlaps G_kl = <W_k psi0 | W_l psi0> and the exchange
//    overlaps H_kl = <X W_k psi0 | W_l psi0>, X the exchange of the two holes (y -> -y, modes swapped).
// 2. THE TONE COHERENCE. Love branch: Psi_L = sum_l W_l psi0 (x) Pi^L_l chi (Pi^L: Phi-perp with theta 0, Phi with w).
//    Fear branch, antisymmetrized: Psi_F = sum_k [W_k P_- psi0 (x) Pi^F_k chi_s + W_k P_+ psi0 (x) Pi^F_k chi_a], P_+- =
//    (1 +- X) / 2, chi_s and chi_a the swap-symmetric and antisymmetric parts (Pi^F: sym with 0, anti with w). The
//    off-diagonal of the dock's (love, fear) count in the reduced state is <Psi_F | Psi_L> up to the fixed factor of the
//    second-quantized flip b_F^dag a_L, and
//      <Psi_F | Psi_L> = sum_kl [ (G_kl - H_kl) / 2 <Pi^F_k chi_s | Pi^L_l chi> + (G_kl + H_kl) / 2 <Pi^F_k chi_a | Pi^L_l chi> ].
//    The decoherence factor is D_T(t) = |<Psi_F | Psi_L>(t)| / |<Psi_F | Psi_L>(0)|. The tone populations are kept
//    exactly, since each species' number is conserved.
// 3. THE ROLE COHERENCE. rho_pair = sum_kl G_lk (Pi^L_k chi)(Pi^L_l chi)^dag, rho_1 = Tr_2 rho_pair, and D_R(t) =
//    |<a| rho_1(t) |b>| / |<a| rho_1(0) |b>|. The role populations are not kept: the singlet kernel moves weight
//    between a member's roles.
// 4. THE FEAR BEAT OFF KEEPS BOTH. With one channel every G and H is fixed in time, so D_T = D_R = 1: on C* every bit of
//    either dephasing comes from the fear beat.
// 5. A TONE-BLIND, ROLE-READING ENVIRONMENT KEEPS THE TONE (the control's design). If the like and unlike branches take
//    the same channels Pi_k, the overlap in point 2 is sum_k [<P_- psi0|psi0><Pi_k chi_s|Pi_k chi> + <P_+ psi0|psi0>
//    <Pi_k chi_a|Pi_k chi>] (W_k unitary and commuting with X), constant: D_T = 1 exactly, while a kernel diagonal in
//    the role's Z basis records role 0 against role 1 in the orbit. The control kernel is w^(n0), n0 the number of the
//    pair's members in role |0>, taken by both branches: channels n0 = 0, 1, 2 with contact angles 0, w, w^2.
// 6. WHAT IS NOT DERIVABLE is the size of each dephasing once the members are walkers: which of the two the rule's own
//    kernels make larger. A heuristic, not a derivation: in the tone case the two branches differ in which kernel acts
//    at all (the 3-dimensional anti channel takes w in one branch, the 1-dimensional singlet in the other), while the
//    role case is read only through the singlet.
//
// PROBES BEFORE THE GATES, disclosed (they set the thresholds; no gate moved after the gate run).
//  tmp/pc-probe1-L2.log (L = 2, 8 docks, start S1, 64 beats, the same families): mean coherence over the cases at beat
//   1: tone 0.7517, role 0.9185; mean loss a beat over the 64 beats: tone 0.2889, role 0.1094 (ratio 2.64). The box
//   recurs: g = <W_0 psi0 | W_1 psi0> returns to 1 at beats 24 and 48, so there is no exponential rate, only a
//   time-averaged loss. Role populations moved by up to 0.167. The control kernel: tone kept to 1e-13, role mean loss
//   0.246. Some cases do not dephase at all in either family (chi2 that makes both kernels act trivially).
//  tmp/pc-probe1-L4.log (L = 4, 128 docks, S1, 64 beats): beat 1 tone 0.7538, role 0.9188; mean loss a beat tone
//   0.1854, role 0.0587 (ratio 3.16); role populations moved by up to 0.085; control tone 9e-12 off 1, role 0.1345;
//   norms within 1.1e-12. The gates sit at a ratio of 1.5, about half the probes' 2.6 to 3.2, and the gate run adds the
//   unprobed start S2 and 32 more beats.
//  tmp/pc-smoke.log (this file with 4 beats, every code path): L = 2 and 4, S1 as in the probes; S2, seen here for 4
//   beats only, mean coherence at beat 1 tone 0.835, role 0.918 (ratio of losses 2.0, its exchange overlap h is about
//   0, so its fear branch has no exchange term). The smoke read the instrument's float floor at L = 4: the fear-off
//   residual 1.3e-11 and the role reduction against reducedRole 5e-12 after 4 beats, above the 1e-12 first written for
//   I1 (c) and (d), because both carry the runs' norm drift. Those two tolerances were set to 1e-9 before the gate run;
//   no physics gate was touched.
//
// HYPOTHESES AND GATES, fixed before the gate run. Boxes L = 2 and L = 4, starts S1 and S2, 96 beats, the 144 + 144
//  cases. loss_T = the mean over beats 1..96 and over the 144 tone cases of 1 - D_T, loss_R the same for the role
//  cases; first_T, first_R the same at beat 1 alone.
//  I1 INSTRUMENT. (a) The exchange route: <W_k P_-+ psi0 | W_l psi0> read from separately run P_-+ psi0 equals (G_kl -+
//     H_kl) / 2 within 1e-10 for k, l in {0, 1} at every beat (this checks that the rule commutes with the exchange and
//     the algebra of point 2). (b) Every run keeps its norm within 1e-10. (c) The fear beat off (every channel replaced
//     by channel 0): D_T and D_R within 1e-9 of 1 for every case at every beat. (d) The role reduction of point 3 for
//     the model kernel equals the partial trace of E-FND-0160's reducedRole(chi, g) within 1e-9 for every role case at
//     every beat (reducedRole takes the channel norms as exactly 1, so the two differ by the norm drift).
//  C1 CONTROL, THE OTHER OUTCOME IS READABLE. Under the tone-blind role-diagonal kernel of point 5, on every box and
//     start: loss_R >= 0.05 and every D_T within 1e-9 of 1 at every beat. There the role dephases and the tone does not,
//     which is the route's kill outcome, so the reader can see it.
//  H1 THE ROUTE'S HYPOTHESIS. On every box and start, loss_T >= 1.5 loss_R and first_T >= 1.5 first_R: the dock's love
//     and fear count dephases faster than any role superposition, on average over frames.
//  P1 THE FALSIFIER (the route's kill). On some box and start loss_T <= 1.1 loss_R: one rate (within 10%) or the role
//     faster.
// VERDICT. Fail if P1 fires. Pass if H1, I1 and C1 hold. Partial if P1 does not fire but H1 fails (a ratio between 1.1
//  and 1.5), or if I1 or C1 fails.
// READ, gating nothing: the mean coherences at beats 1, 2, 4, 8, 24, 48, 96; the per-class role loss (frame covariance
//  makes the four equal when chi2 runs over all 12 states); the largest role population drift; the least and largest
//  D_T and D_R; |g| and |h| at the reads.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show, at L2, that on C* the environment the rule supplies (one other hole and the
// docks) records a member's tone more strongly than its role, in every frame on average, and that the tone is the only
// one of the two whose populations the coupling keeps. It cannot show einselection in the usual sense: the environment
// is one hole, not a bath, the box recurs, so there is no rate and no irreversibility, and the coherence lost returns.
// The charge superposition cannot be prepared by the rule, so the result is about a state put in by hand, which is the
// standard status of superselection arguments (Wick, Wightman, Wigner 1952; Zurek 2003). The vacuum (the full sea) is
// shown, by derivation, to be no environment at all on C*, which is what the route asked for literally. C* is not the
// adopted rule, two holes on the 4d D4 torus are not the husk, and no ledger row becomes held from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaBeat,
  sectorBases,
  torus,
  FULL,
  MODES,
  type Pair,
  type SeaRule,
  type SectorBases,
  type Torus,
} from '@/code/measure/register-sea'
import {
  pairOverlap,
  reducedRole,
  type RoleVector,
} from '@/code/measure/role-register'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const FEAR: readonly [number, number] = [0, 2]
const CAP = 8
const BEATS = 96
const BOXES: readonly number[] = [2, 4]
const STARTS: readonly { name: string; m1: number; m2: number }[] = [
  { name: 'S1', m1: 0, m2: 8 },
  { name: 'S2', m1: 17, m2: 109 },
]
const READS: readonly number[] = [1, 2, 4, 8, 24, 48, 96]
const EXCHANGE_TOL = 1e-10
const NORM_TOL = 1e-10
const OFF_TOL = 1e-9
const REDUCE_TOL = 1e-9
const CONTROL_TONE_TOL = 1e-9
const CONTROL_ROLE_LOSS = 0.05
const H1_RATIO = 1.5
const P1_RATIO = 1.1

// ---- complex numbers, role vectors and role-pair matrices (index 3 r1 + r2) ----

type C = [number, number]
type Vec = C[]
type Mat = C[][]

const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cconj = (a: C): C => [a[0], -a[1]]
const cabs = (a: C): number => Math.hypot(a[0], a[1])
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cscale = (a: C, x: number): C => [a[0] * x, a[1] * x]
const OMEGA: C = [
  Math.cos((2 * Math.PI) / 3),
  Math.sin((2 * Math.PI) / 3),
]

function omegaPower(n: number): C {
  let r: C = [1, 0]

  for (let i = 0; i < ((n % 3) + 3) % 3; i++) {
    r = cmul(r, OMEGA)
  }

  return r
}

// the 12 line states, class by class: the Z basis, then the three bases sum_n omega^(j n + k n^2) |n> / sqrt 3
function lineStates(): Vec[] {
  const out: Vec[] = []

  for (let j = 0; j < 3; j++) {
    out.push([0, 1, 2].map(n => (n === j ? [1, 0] : [0, 0]) as C))
  }

  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 3; j++) {
      out.push(
        [0, 1, 2].map(n =>
          cscale(omegaPower(j * n + k * n * n), 1 / Math.sqrt(3)),
        ),
      )
    }
  }

  return out
}

const kron = (a: Vec, b: Vec): Vec => {
  const o: Vec = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      o.push(cmul(a[i]!, b[j]!))
    }
  }

  return o
}

const inner = (a: Vec, b: Vec): C =>
  a.reduce<C>((s, x, i) => cadd(s, cmul(cconj(x), b[i]!)), [0, 0])
const apply = (m: Mat, v: Vec): Vec =>
  m.map(row =>
    row.reduce<C>((s, x, j) => cadd(s, cmul(x, v[j]!)), [0, 0]),
  )
const matrix = (f: (i: number, j: number) => C): Mat =>
  Array.from({ length: 9 }, (_, i) =>
    Array.from({ length: 9 }, (_, j) => f(i, j)),
  )
const swapIndex = (i: number): number => 3 * (i % 3) + Math.floor(i / 3)
const PHI: Vec = Array.from(
  { length: 9 },
  (_, k) => (k % 4 === 0 ? [1 / Math.sqrt(3), 0] : [0, 0]) as C,
)
const P_PHI = matrix((i, j) => cmul(PHI[i]!, cconj(PHI[j]!)))
const P_PERP = matrix((i, j) => [
  (i === j ? 1 : 0) - P_PHI[i]![j]![0],
  -P_PHI[i]![j]![1],
])
const P_SYM = matrix((i, j) => [
  ((i === j ? 1 : 0) + (swapIndex(j) === i ? 1 : 0)) / 2,
  0,
])
const P_ANTI = matrix((i, j) => [
  ((i === j ? 1 : 0) - (swapIndex(j) === i ? 1 : 0)) / 2,
  0,
])
const zeros = (i: number): number =>
  (Math.floor(i / 3) === 0 ? 1 : 0) + (i % 3 === 0 ? 1 : 0)
const P_ZERO = [0, 1, 2].map(n =>
  matrix((i, j) => [i === j && zeros(i) === n ? 1 : 0, 0]),
)

// a kernel as channels: each projector with the index of the orbital run (contact moved by ch fear angles) it takes
type Channel = { P: Mat; ch: number }
type Kernel = { love: Channel[]; fear: Channel[] }

const MODEL: Kernel = {
  love: [
    { P: P_PERP, ch: 0 },
    { P: P_PHI, ch: 1 },
  ],
  fear: [
    { P: P_SYM, ch: 0 },
    { P: P_ANTI, ch: 1 },
  ],
}
const CONTROL: Kernel = {
  love: P_ZERO.map((P, n) => ({ P, ch: n })),
  fear: P_ZERO.map((P, n) => ({ P, ch: n })),
}
const OFF = (k: Kernel): Kernel => ({
  love: k.love.map(c => ({ P: c.P, ch: 0 })),
  fear: k.fear.map(c => ({ P: c.P, ch: 0 })),
})

type Overlaps = { G: C[][]; H: C[][] }

// point 2: <Psi_F | Psi_L>
function toneOverlap(k: Kernel, chi: Vec, o: Overlaps): C {
  const sym = apply(P_SYM, chi)
  const anti = apply(P_ANTI, chi)

  let sum: C = [0, 0]

  for (const f of k.fear) {
    for (const l of k.love) {
      const g = o.G[f.ch]![l.ch]!
      const h = o.H[f.ch]![l.ch]!
      const love = apply(l.P, chi)
      const minus = cscale(cadd(g, cscale(h, -1)), 0.5)
      const plus = cscale(cadd(g, h), 0.5)

      sum = cadd(sum, cmul(minus, inner(apply(f.P, sym), love)))
      sum = cadd(sum, cmul(plus, inner(apply(f.P, anti), love)))
    }
  }

  return sum
}

// point 3: member 1's role state, 3 x 3
function memberRole(k: Kernel, chi: Vec, o: Overlaps): Mat {
  const r: Mat = [0, 1, 2].map(() => [0, 1, 2].map(() => [0, 0] as C))

  for (const a of k.love) {
    for (const b of k.love) {
      const va = apply(a.P, chi)
      const vb = apply(b.P, chi)
      const g = o.G[b.ch]![a.ch]!

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let x = 0; x < 3; x++) {
            r[i]![j] = cadd(
              r[i]![j]!,
              cmul(g, cmul(va[3 * i + x]!, cconj(vb[3 * j + x]!))),
            )
          }
        }
      }
    }
  }

  return r
}

const sandwich = (r: Mat, a: Vec, b: Vec): C => {
  let s: C = [0, 0]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      s = cadd(s, cmul(cconj(a[i]!), cmul(r[i]![j]!, b[j]!)))
    }
  }

  return s
}

const toRoleVector = (v: Vec): RoleVector => ({
  re: Float64Array.from(v.map(x => x[0])),
  im: Float64Array.from(v.map(x => x[1])),
})

// member 1's role from E-FND-0160's reducedRole, traced over member 2
function referenceRole(chi: Vec, g: C): Mat {
  const rho = reducedRole(toRoleVector(chi), g)
  const r: Mat = [0, 1, 2].map(() => [0, 1, 2].map(() => [0, 0] as C))

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let x = 0; x < 3; x++) {
        const at = (3 * i + x) * 9 + 3 * j + x

        r[i]![j] = cadd(r[i]![j]!, [rho.re[at]!, rho.im[at]!])
      }
    }
  }

  return r
}

// ---- the cases ----

type ToneCase = { chi: Vec }
type RoleCase = { chi: Vec; a: Vec; b: Vec; cls: number }

function cases(): { tone: ToneCase[]; role: RoleCase[] } {
  const lines = lineStates()
  const tone: ToneCase[] = []
  const role: RoleCase[] = []

  for (const c1 of lines) {
    for (const c2 of lines) {
      tone.push({ chi: kron(c1, c2) })
    }
  }

  for (let cls = 0; cls < 4; cls++) {
    const basis = lines.slice(3 * cls, 3 * cls + 3)

    for (let p = 0; p < 3; p++) {
      for (let q = p + 1; q < 3; q++) {
        const a = basis[p]!
        const b = basis[q]!
        const c1 = a.map((x, i) => cscale(cadd(x, b[i]!), Math.SQRT1_2))

        for (const c2 of lines) {
          role.push({ chi: kron(c1, c2), a, b, cls })
        }
      }
    }
  }

  return { tone, role }
}

// ---- the orbital runs ----

// <X a | b>, X the exchange (y -> -y, the two modes swapped), without building X a
function exchangeOverlap(t: Torus, a: Pair, b: Pair): C {
  let re = 0
  let im = 0

  for (let i = 0; i < t.sites.length; i++) {
    const n = t.neg[i]!

    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        const ka = n * FULL + z * MODES + x
        const kb = i * FULL + x * MODES + z
        const ar = a.re[ka]!
        const ai = a.im[ka]!

        re += ar * b.re[kb]! + ai * b.im[kb]!
        im += ar * b.im[kb]! - ai * b.re[kb]!
      }
    }
  }

  return [re, im]
}

// P_+- psi = (psi +- X psi) / 2
function exchangePart(t: Torus, s: Pair, sign: 1 | -1): Pair {
  const o = newPair(t)

  for (let i = 0; i < t.sites.length; i++) {
    const n = t.neg[i]!

    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        const k = i * FULL + x * MODES + z
        const kk = n * FULL + z * MODES + x

        o.re[k] = (s.re[k]! + sign * s.re[kk]!) / 2
        o.im[k] = (s.im[k]! + sign * s.im[kk]!) / 2
      }
    }
  }

  return o
}

const copyPair = (s: Pair): Pair => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

type Stepper = { state: Pair; spare: Pair; rule: SeaRule }

function step(t: Torus, B: SectorBases, s: Stepper, beat: 1 | 2): void {
  const out = seaBeat(t, s.rule, B, s.state, beat, s.spare)

  s.spare = s.state
  s.state = out
}

type Family = {
  tone: number[]
  role: number[]
  roleByClass: number[]
  rolePop: number
}

function readFamily(
  k: Kernel,
  cs: { tone: ToneCase[]; role: RoleCase[] },
  o: Overlaps,
  o0: Overlaps,
): Family {
  const tone = cs.tone.map(
    c =>
      cabs(toneOverlap(k, c.chi, o)) / cabs(toneOverlap(k, c.chi, o0)),
  )
  const roleByClass = [0, 0, 0, 0]

  let rolePop = 0

  const role = cs.role.map(c => {
    const r = memberRole(k, c.chi, o)
    const r0 = memberRole(k, c.chi, o0)
    const d = cabs(sandwich(r, c.a, c.b)) / cabs(sandwich(r0, c.a, c.b))

    roleByClass[c.cls]! += (1 - d) / (cs.role.length / 4)

    for (const v of [c.a, c.b]) {
      rolePop = Math.max(
        rolePop,
        Math.abs(sandwich(r, v, v)[0] - sandwich(r0, v, v)[0]),
      )
    }

    return d
  })

  return { tone, role, roleByClass, rolePop }
}

const mean = (x: readonly number[]): number =>
  x.reduce((s, y) => s + y, 0) / x.length

type RunResult = {
  box: number
  start: string
  docks: number
  lossT: number
  lossR: number
  firstT: number
  firstR: number
  ctrlLossR: number
  ctrlToneOff: number
  ctrlFirstR: number
  exchangeResidual: number
  normResidual: number
  offResidual: number
  reduceResidual: number
  rolePop: number
  roleByClass: number[]
  toneMin: number
  toneMax: number
  roleMin: number
  roleMax: number
  reads: Record<string, number>
}

function runOne(
  L: number,
  start: { name: string; m1: number; m2: number },
  log: (s: string) => void,
): RunResult {
  const unit = (kj: readonly [number, number]): [number, number] => {
    const th = unitAngle(ringUnit(kj[0], kj[1]))

    return [Math.cos(th), Math.sin(th)]
  }

  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const fear = unitAngle(ringUnit(FEAR[0], FEAR[1]))
  const T = torus(L)
  const B = sectorBases()
  const rule = (n: number): SeaRule => ({
    u,
    string: -sAng,
    cap: CAP,
    contact: -2 * vAng - n * fear,
    dock: null,
    member: false,
  })
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const mv = movingBlocks(T, [
    registerPiece(qS, u),
    registerPiece(qD, [u[0], -u[1]]),
  ])
  const psi0 = pairStart(T, mv, 'W', start.m1, 'W', start.m2, 0)
  // the three channel runs (contact moved by 0, 1, 2 fear angles), and P_-+ psi0 under channels 0 and 1
  const runs: Stepper[] = [0, 1, 2].map(n => ({
    state: copyPair(psi0),
    spare: newPair(T),
    rule: rule(n),
  }))
  const minus = exchangePart(T, psi0, -1)
  const plus = exchangePart(T, psi0, 1)
  const parts: { sign: -1 | 1; s: Stepper; ch: number }[] = []

  for (const ch of [0, 1]) {
    parts.push({
      sign: -1,
      s: { state: copyPair(minus), spare: newPair(T), rule: rule(ch) },
      ch,
    })

    parts.push({
      sign: 1,
      s: { state: copyPair(plus), spare: newPair(T), rule: rule(ch) },
      ch,
    })
  }

  const overlaps = (): Overlaps => ({
    G: runs.map(a => runs.map(b => pairOverlap(a.state, b.state))),
    H: runs.map(a =>
      runs.map(b => exchangeOverlap(T, a.state, b.state)),
    ),
  })
  const cs = cases()
  const o0 = overlaps()

  let lossT = 0
  let lossR = 0
  let firstT = 0
  let firstR = 0
  let ctrlLossR = 0
  let ctrlFirstR = 0
  let ctrlToneOff = 0
  let exchangeResidual = 0
  let offResidual = 0
  let reduceResidual = 0
  let rolePop = 0
  let toneMin = Infinity
  let toneMax = 0
  let roleMin = Infinity
  let roleMax = 0

  const roleByClass = [0, 0, 0, 0]
  const reads: Record<string, number> = {}

  for (let beat = 1; beat <= BEATS; beat++) {
    const b = beat % 2 === 1 ? 1 : 2

    for (const r of runs) {
      step(T, B, r, b)
    }

    for (const p of parts) {
      step(T, B, p.s, b)
    }

    const o = overlaps()

    // I1 (a): the exchange route
    for (const p of parts) {
      for (const l of [0, 1]) {
        const direct = pairOverlap(p.s.state, runs[l]!.state)
        const g = o.G[p.ch]![l]!
        const h = o.H[p.ch]![l]!
        const formula = cscale(cadd(g, cscale(h, p.sign)), 0.5)

        exchangeResidual = Math.max(
          exchangeResidual,
          cabs(cadd(direct, cscale(formula, -1))),
        )
      }
    }

    const m = readFamily(MODEL, cs, o, o0)
    const c = readFamily(CONTROL, cs, o, o0)
    const off = readFamily(OFF(MODEL), cs, o, o0)
    const offC = readFamily(OFF(CONTROL), cs, o, o0)

    for (const x of [
      ...off.tone,
      ...off.role,
      ...offC.tone,
      ...offC.role,
    ]) {
      offResidual = Math.max(offResidual, Math.abs(x - 1))
    }

    // I1 (d): the role reduction against reducedRole, with g = <phi_perp | phi_Phi>
    for (const rc of cs.role) {
      const mine = memberRole(MODEL, rc.chi, o)
      const ref = referenceRole(rc.chi, o.G[0]![1]!)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          reduceResidual = Math.max(
            reduceResidual,
            cabs(cadd(mine[i]![j]!, cscale(ref[i]![j]!, -1))),
          )
        }
      }
    }

    const tLoss = 1 - mean(m.tone)
    const rLoss = 1 - mean(m.role)

    lossT += tLoss / BEATS
    lossR += rLoss / BEATS
    ctrlLossR += (1 - mean(c.role)) / BEATS

    if (beat === 1) {
      firstT = tLoss
      firstR = rLoss
      ctrlFirstR = 1 - mean(c.role)
    }

    for (const x of c.tone) {
      ctrlToneOff = Math.max(ctrlToneOff, Math.abs(x - 1))
    }

    m.roleByClass.forEach((x, i) => {
      roleByClass[i]! += x / BEATS
    })
    rolePop = Math.max(rolePop, m.rolePop)
    toneMin = Math.min(toneMin, ...m.tone)
    toneMax = Math.max(toneMax, ...m.tone)
    roleMin = Math.min(roleMin, ...m.role)
    roleMax = Math.max(roleMax, ...m.role)

    if (READS.includes(beat)) {
      reads[`toneMean_b${beat}`] = mean(m.tone)
      reads[`roleMean_b${beat}`] = mean(m.role)
      reads[`g_b${beat}`] = cabs(o.G[0]![1]!)
      reads[`h_b${beat}`] = cabs(o.H[0]![1]!)
      log(
        `L ${L} ${start.name} beat ${beat}: tone ${mean(m.tone).toFixed(4)} role ${mean(m.role).toFixed(4)} | control tone ${mean(c.tone).toFixed(6)} role ${mean(c.role).toFixed(4)} | |g| ${cabs(o.G[0]![1]!).toFixed(4)} |h| ${cabs(o.H[0]![1]!).toFixed(4)} | exch ${exchangeResidual.toExponential(2)} off ${offResidual.toExponential(2)} red ${reduceResidual.toExponential(2)}`,
      )
    }
  }

  let normResidual = 0

  for (const s of [...runs.map(r => r.state)]) {
    normResidual = Math.max(normResidual, Math.abs(pairNorm(s) - 1))
  }

  // P_-+ psi0 are not normalized: their norms are kept
  for (const p of parts) {
    const ref = p.sign === -1 ? minus : plus

    normResidual = Math.max(
      normResidual,
      Math.abs(pairNorm(p.s.state) - pairNorm(ref)),
    )
  }

  return {
    box: L,
    start: start.name,
    docks: T.sites.length,
    lossT,
    lossR,
    firstT,
    firstR,
    ctrlLossR,
    ctrlToneOff,
    ctrlFirstR,
    exchangeResidual,
    normResidual,
    offResidual,
    reduceResidual,
    rolePop,
    roleByClass,
    toneMin,
    toneMax,
    roleMin,
    roleMax,
    reads,
  }
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function pointerConservedRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const results: RunResult[] = []

  for (const L of BOXES) {
    for (const s of STARTS) {
      results.push(runOne(L, s, log))
    }
  }

  const I1 = results.every(
    r =>
      r.exchangeResidual <= EXCHANGE_TOL &&
      r.normResidual <= NORM_TOL &&
      r.offResidual <= OFF_TOL &&
      r.reduceResidual <= REDUCE_TOL,
  )
  const C1 = results.every(
    r =>
      r.ctrlLossR >= CONTROL_ROLE_LOSS &&
      r.ctrlToneOff <= CONTROL_TONE_TOL,
  )
  const H1 = results.every(
    r =>
      r.lossT >= H1_RATIO * r.lossR && r.firstT >= H1_RATIO * r.firstR,
  )
  const P1 = results.some(r => r.lossT <= P1_RATIO * r.lossR)
  const status = P1 ? 'fail' : H1 && I1 && C1 ? 'pass' : 'partial'
  const metrics: Record<string, number> = {
    I1: flag(I1),
    C1: flag(C1),
    H1: flag(H1),
    P1: flag(P1),
  }

  for (const r of results) {
    const key = `L${r.box}${r.start}`

    metrics[`${key}_docks`] = r.docks
    metrics[`${key}_lossT`] = r.lossT
    metrics[`${key}_lossR`] = r.lossR
    metrics[`${key}_ratio`] = r.lossT / r.lossR
    metrics[`${key}_firstT`] = r.firstT
    metrics[`${key}_firstR`] = r.firstR
    metrics[`${key}_firstRatio`] = r.firstT / r.firstR
    metrics[`${key}_ctrlLossR`] = r.ctrlLossR
    metrics[`${key}_ctrlFirstR`] = r.ctrlFirstR
    metrics[`${key}_ctrlToneOff`] = r.ctrlToneOff
    metrics[`${key}_exchangeResidual`] = r.exchangeResidual
    metrics[`${key}_normResidual`] = r.normResidual
    metrics[`${key}_offResidual`] = r.offResidual
    metrics[`${key}_reduceResidual`] = r.reduceResidual
    metrics[`${key}_rolePop`] = r.rolePop
    metrics[`${key}_toneMin`] = r.toneMin
    metrics[`${key}_toneMax`] = r.toneMax
    metrics[`${key}_roleMin`] = r.roleMin
    metrics[`${key}_roleMax`] = r.roleMax
    r.roleByClass.forEach((x, i) => {
      metrics[`${key}_roleLossClass${i}`] = x
    })

    for (const [k, v] of Object.entries(r.reads)) {
      metrics[`${key}_${k}`] = v
    }
  }

  metrics.seconds = (Date.now() - started) / 1000

  const line = results
    .map(
      r =>
        `L ${r.box} (${r.docks} docks) ${r.start}: loss a beat tone ${r.lossT.toFixed(4)} role ${r.lossR.toFixed(4)} (ratio ${(r.lossT / r.lossR).toFixed(2)}), first beat ${r.firstT.toFixed(4)} and ${r.firstR.toFixed(4)} (${(r.firstT / r.firstR).toFixed(2)}), role populations moved up to ${r.rolePop.toFixed(4)}; control role loss ${r.ctrlLossR.toFixed(4)}, control tone off 1 by ${r.ctrlToneOff.toExponential(2)}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `H1 ${H1}, P1 ${P1}, C1 ${C1}, I1 ${I1}: ${line}`,
    metrics,
    control: {
      C1: flag(C1),
      ...Object.fromEntries(
        results.map(r => [
          `L${r.box}${r.start}_ctrlLossR`,
          r.ctrlLossR,
        ]),
      ),
    },
    notes: `L2. C* (E-FND-0160) on E-SPN-0175's two-hole engine, the D4 torus L 2 (8 docks) and 4 (128 docks), starts ${STARTS.map(s => `${s.name} modes ${s.m1}, ${s.m2}`).join('; ')}, ${BEATS} beats. The environment is one fear-tone member and the docks, since the full sea couples to nothing. The tone superposition is put in by hand. Floats on exact pieces, residuals reported. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/pointer-conserved',
  code: 'E-QTM-0166',
  title:
    'the pointer is what the environment conserves, on C*: a member superposed between two local love counts against a member superposed between two roles, coupled to one other hole over 8 and 128 docks',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pointerConservedRun()
  },
})
