// THE RULE'S OWN MODES BELOW A CUSP: DOES ANY STAY ON THE SCREEN AND MOVE? (E-SPN-0182, OPEN-MOT-03). E-SPN-0181 ran
// the register member (E-SPN-0160's band member, carried over from the flat mesh) on the true mesh {3,4,3,4} at a cusp and
// found it does not travel: the screen is one-sided (6 slots along the layer, 18 down, 0 up) and the swap coin's bounce
// returns every excursion below it to the dock it left. Its named next step: a mover built FOR the screen, the rule's
// own eigenmodes on the layer and the docks under it, Bloch-reduced along the horosphere, asked whether any mode stays
// on the screen and with what husk dispersion. This file reads them.
//
// DERIVED BEFORE THE RUN (code/measure/cusp-bloch; the cusp v is the base cell's ideal vertex fixed by r1 .. r4).
// 1. THE TRANSLATION GROUP, AND ITS TWIST. The cusp's stabilizer [4,3,4] = <r1, r2, r3, r4> holds the husk's unit
//    translations t_i = r4 w (w the mirror of the base cube parallel to r4's face) and their conjugates under the cube
//    group. The labelling is the homomorphism phi onto W(F4) with phi(r4) = -I (E-FRC-0272), and w is a cell mirror, so
//    phi(t_i) = -phi(w): minus a reflection, an element of order 2 with det -1. So a unit translation MOVES the labels,
//    a Bloch reduction by Z^3 is twisted by phi(t_m) (the rule is covariant under every W(F4) element, E-FRC-0272 C1),
//    the eight parity classes of Z^3 carry eight distinct label actions, and the label-trivial kernel is 2 Z^3. Both
//    reductions are built; the twisted one (one layer dock per cell) is read, the even one checks the twist.
// 2. THE BAND LAW. By Jordan's lemma on the two projectors of the cycle (E-SPN-0180), every moving level of the rule in
//    any static geometry is cos E = cos M - 2 cos^2(M / 2) mu, mu an eigenvalue of H = C^dag C, C = Q_D V Q_S the
//    covariant Clifford hop. Below the cusp at husk momentum k (twisted), C(k) takes dock y's even register to dock x's
//    odd register by c0 gamma(g r_e) rho(g) e^(-i k . m) for each label e with n(y, e) = t_m x, g = phi(t_-m), c0 = 1 /
//    (2 sqrt 288). So the band structure below a cusp IS the spectrum of H(k), and the husk group velocity is
//    (dE / d mu)(d mu / dk) / 2 husk docks a beat (Hellmann-Feynman on H's eigenvectors).
// 3. WHERE A MODE LIVES. A mode's S home is its H eigenvector v (the even register at the docks where the S mixer acts);
//    its D home is C v / |C v| (the odd partner at the docks where the D mixer acts). Its LAYER SHARE is the weight of
//    its home on the layer docks. A SCREEN MODE is one whose layer share does not decay as the depth cut deepens; the
//    threshold is fixed here at THETA = 1/2 (more of its home on the screen than under it). The physical state between
//    beats is part in flight (a slot's value in transit to a neighbour, 3/4 of it below the layer for any layer dock,
//    E-SPN-0181 M2), so the home share, not the in-flight share, is what can say "on the screen".
// 4. THE LEAK IS FIXED. Every depth-1 dock hangs under exactly one layer dock through one facet (E-SPN-0181 M1), so for
//    any even field psi on the layer the depth-1 part of C psi is a sum of 18 terms per layer dock that never meet:
//    |P_1 C psi|^2 = 18 * 2 c0^2 |psi|^2 = |psi|^2 / 32 exactly, at every k (gamma(r)^T gamma(r) = |r|^2 = 2, rho
//    orthogonal). No Bloch phase can interfere it away. So the layer block of H is H_LL(k) = C_LL(k)^dag C_LL(k) + 1/32
//    exactly, C_LL the hop along the 6 layer slots, and a state held on the layer sits at mu = mu_along + 1/32.
// 5. THE SCREEN BAND SITS INSIDE THE DEPTH'S BAND. The along hop runs over 6 of the 24 slots, so mu_along is small
//    (at most 6^2 * 2 c0^2 = 1/16 by the triangle inequality; read over the gate k), and a state held on the layer lies
//    at 1/32 + mu_along. The region below holds 18, then about 330, then about 6,000 docks per layer dock, and the
//    spectrum of H there reaches past 0.1 (the open truncation's H is a compression of the infinite one, so its top
//    bounds the infinite top from below). The shells carry the same husk momentum k as the layer and no other conserved
//    label separates them, so a layer state at a mu inside the shells' band mixes into every shell at that mu, and
//    each added shell brings about 18 times more states to mix with. PREDICTED: NO SCREEN MODE. The band with the
//    largest layer share at each cut sits at or near the top of the spectrum, and its share FALLS as the cut deepens,
//    below THETA by the deepest cut read.
//
// THE CUTS. Dense diagonalization (code/algebra/linear/eig-hermitian-householder) at depth cuts 1 and 2 (19 and 349
// docks per cell, H of order 152 and 2,792), and at cut 3 (6,383 docks, order 51,064) a block Krylov space of 480
// vectors started from all 8 even directions of the layer dock, fully reorthogonalized, read for its top 8 eigenspaces
// (the largest layer share over each eigenspace's span). Each cut at the five gate momenta, with the reflecting frontier
// (the unitary rule's own) and, read only, the open one. Cut 2 doubles cut 1 and cut 3 adds a shell of 6,034 docks.
//
// GATES, fixed before the gate run (GATE_PLAN: k = 0, (pi/2, 0, 0), (pi, 0, 0), (pi/2, pi/2, pi/2), (0.37, -0.21, 0.13);
// the light member E-SPN-0181 used, (-1, 4), and the massless one, (0, 3)).
//  G1 THE TRANSLATIONS (exact, item 1): three unit translations in <r1 .. r4>, each shifting every dock of a layer patch
//     by one cube along its axis (1e-9); each label action M has M^2 = I and -M a reflection (trace of -M = 2); one label
//     action on every patch dock (0 disagreeing); the eight parity classes carry eight distinct label actions; the even
//     lattice's three label actions are the identity.
//  G2 THE QUOTIENT (exact counts): 0 inconsistent arrivals at every cut; every depth-1 dock has exactly one facet to the
//     layer.
//  G3 THE LEAK (exact, item 4): at every gate k, the depth-1 part of H's layer block is I / 32 and the layer block is
//     C_LL^dag C_LL + I / 32 (1e-15 per entry).
//  M  THE QUESTION (item 5 predicts it FAILS). At a gate k the rule has a SCREEN MODE when the band of largest layer share
//     at cut 3 (read among its top 8) has share >= THETA, that share differs from cut 2's largest by no more than cut 2's
//     band's deepest-shell weight (stable under the added shell: a bound state's share moves only through the weight
//     that reaches the cut), and cut 2's band is dispersive (husk speed >= 1e-6 docks a beat for the massless member).
//     M holds when some gate k has a screen mode.
// CONTROLS. C1 THE FLAT QUOTIENT (E-SPN-0167's stand-in, one dock per cell under the same code) must show moving bands:
//  mu = g^2(K) of E-SPN-0160 at K = (k, 0) for every gate k (1e-14); the massless husk speed at q = 1e-3 along an axis
//  within 1e-4 of sqrt(2)/4; the light and massless speeds at q = 0.6 equal code/measure/spinor-register diracSpeed
//  (1e-10) and exceed 0.1. C2 THE CLOSED SCREEN: at depth cut 0 with the reflecting frontier (the 18 down slots returned
//  to the dock) every band has layer share 1 (1e-12) and at the generic k the fastest moves (>= 1e-6): the reading finds
//  a moving screen band where the depth cannot take it. C3 COVERAGE: at cuts 1 and 2 (dense) the band of largest layer
//  share lies among the top 8 eigenvalues at every gate k, so reading the top 8 at cut 3 cannot miss it by position.
// INSTRUMENT. I1 THE TWIST: at cut 1 the even lattice's spectrum at K equals the union of the twisted spectra at K / 2 +
//  pi eps over the 8 eps (1e-12). I2 THE LAW ON THE TRUE MESH: on the even quotient at cut 1 and K = (0.74, -0.42, 0.26),
//  for six eigenvectors of H and both members, the plane {s, V Q_D V s} of the S member s closes under two beats of the
//  rule itself (code/measure/cusp-bloch blochBeat) and its phases are the law's (overlap <s|V Q_D V s> = mu to 1e-12,
//  closure and law 1e-10: float sums over 29,184 modes, the probe read 7.4e-12). I3 dense eigen residuals |C^dag C v -
//  mu v| <= 1e-12, Krylov Ritz residuals <= 1e-10. I4 at cut 2 every one of the Krylov reading's top 8 eigenspaces lies
//  on a dense eigenvalue and the largest on the largest (1e-10).
// VERDICT, fixed before the run: FAIL (as derived) when G1 .. G3, the controls and the instrument hold and M fails: no
//  mode of the rule stays on the screen. PASS when M holds with the rest: a screen mode exists, and item 3 of OPEN-MOT-03
//  (its wave packet) is next. PARTIAL otherwise.
// READ, gating nothing: per cut and k the largest layer share, its mu, deepest-shell weight, position and husk speed
//  (both members, and as a fraction of sqrt(2)/4); the open frontier at cut 2 and 3 (generic k); mu_along's largest over
//  the gate k; the closed screen's fastest speed; the equality of the S and D homes' layer shares band by band.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/ms-probe1.log: the unit translation r4 w and its label action diag(-1, 1,
//  -1, -1). tmp/ms-eig-probe.log: the Householder eigensolver against the eigenvalue-only one (gap 0, residual 1.6e-13
//  at n = 1,000, 9 s). tmp/ms-probe2.log and ms-probe2-d2.log: the three axes, quotients of 1, 19, 349 docks (twisted)
//  and 8, 152 (even), 0 inconsistent, 18 of 18 single-parent depth-1 docks, the flat quotient on the law to 8 digits.
//  tmp/ms-probe3.log and ms-probe3-d2.log (the largest layer shares): cut 1 0.70 (reflect) and 0.74 (open), cut 2 0.54
//  and 0.55, the S and D shares equal in every band, speeds 0.004 to 0.006 docks a beat. tmp/ms-probe4.log: the twist
//  (8.7e-15) and the plane check (overlap 6.7e-15, closure 7.4e-12, law 3.8e-12). tmp/ms-probe5.log (a 6^3 grid): the
//  closed screen's fastest band 0.083 docks a beat, the flat's 0.27, bands of share >= 1/2 at cut 1 at most 0.023.
//  tmp/ms-probe6-d1/d2/d3.log (single-vector Lanczos, generic k): the top band's share 0.70, 0.53, 0.40 at cuts 1, 2, 3
//  (0.74, 0.55, 0.41 open), its deepest-shell weight 0.30, 0.14, 0.07, its mu 0.083, 0.097, 0.106; ms-probe6b-d2.log,
//  the block Krylov reading, equal to the dense one at cut 2; ms-probe6b-d3.log, the block reading at cut 3 with 300
//  vectors, the same top share 0.402 but Ritz residuals up to 2.1e-9 on the 7th and 8th eigenspaces, which is why the
//  gate's space holds 480. ms-probe3-d2.log also read cut 2 at k = 0 (0.554, the second band from the top). The
//  smoke (tmp/ms-smoke.log, SMOKE_PLAN) caught two faults before the gate run, both fixed: G3 summed the six along
//  blocks' Grams where they land on one dock and must be summed first, and the smoke's 120-vector space left Ritz
//  residuals of 2.8e-5 (the smoke gates nothing). tmp/ms-probe7.log: the top of H on balls of
//  radius 1, 2, 3 about one cell, 0.043, 0.076, 0.094. So M was seen to fail at the generic k before these gates were
//  written; the three other symmetric momenta, cut 3 at k = 0, the controls C1 to C3 and I4 were not run.
//
// FIRST RUN (tmp/ms-gate-run1.log, 5,474 s on a loaded machine, under 1 GB): PARTIAL, on the instrument alone. G1, G2,
//  G3, C1, C2, C3, I1, I2 and I4 hold, M fails as derived, and I3 fails: the dense residuals read 1.4e-13 (inside
//  1e-12) but the cut 3 Krylov Ritz residuals reach 5.5e-5 against the 1e-10 fixed before the run. No gate moved and
//  none was rerun. What the failure does and does not touch: the residual bounds each Ritz value's distance to an
//  eigenvalue of H, so a residual of 5.5e-5 leaves one of the top 8 cut 3 eigenspaces located only to 5.5e-5; the
//  probe at the same cut (ms-probe6b-d3.log, 300 vectors) read the TOP eigenspace, the one of largest share at every
//  gate k here, at 1.4e-15 and the unconverged ones at the 7th and 8th places. The cut 3 shares are therefore read, not
//  certified; the cut 1 and cut 2 shares are dense and certified (1.4e-13).
//  - G1: three unit translations (shift error 2.2e-14), each label action of order 2 with -M a reflection, 0 disagreeing,
//    8 distinct parity classes, the even lattice label-trivial. G2: 1, 19, 349 and 6,383 docks per cell at cuts 0 to 3,
//    0 inconsistent, 18 of 18 depth-1 docks single-parent. G3: the leak is I / 32 to 6.9e-18 and the layer block C_LL^dag
//    C_LL + I / 32 to 1.4e-17 at all five k; mu_along at most exactly 1/32.
//  - M, the largest layer share at cuts 1, 2, 3: k = 0 and (pi, 0, 0) 0.704, 0.554, 0.412; (pi/2, 0, 0) 0.616, 0.432,
//    0.288; (pi/2, pi/2, pi/2) 0.477, 0.344, 0.228; generic 0.697, 0.544, 0.402. Falling at every k, below theta at
//    cut 3 everywhere, and at k = 0, (pi, 0, 0) and the generic k it falls by MORE than cut 2's deepest-shell weight
//    (0.142 against 0.117): the share leaves faster than a bound state's tail allows. The band sits at the top of the
//    spectrum at every cut (mu 0.084, 0.096, 0.106 at k = 0), riding up with the region's growing top. Its husk speed
//    is 0 at k = 0 and (pi, 0, 0) and at most 0.025 docks a beat anywhere (0.072 of sqrt(2)/4, at (pi/2, 0, 0), cut 1).
//  - C1: flat law 2.6e-16, massless speed at q = 1e-3 0.353553 against sqrt(2)/4 = 0.353553, at q = 0.6 light 0.2144
//    and massless 0.2978 equal to diracSpeed. C2: the closed screen, share 1 (2.5e-13), fastest band 0.0464 docks a beat.
//    C3: the most screen-bound band at most 2 eigenvalues from the top at cuts 1 and 2.
//  - I1 8.7e-15, I2 overlap 6.6e-15, closure 7.4e-12, law 3.8e-12, I4 4.5e-14. S and D shares equal band by band to
//    2.0e-11 (read). Open frontier at the generic k: 0.551 at cut 2, 0.410 at cut 3.
// WHY NONE, AND WHAT WOULD MAKE ONE. The screen couples down with a fixed strength, 1/32 on the diagonal of H at every k
//  (G3), as large as the along hop's whole reach (1/32), and it couples into shells whose own band reaches past 0.106:
//  a state held on the layer sits at most at 1/16, inside the depth's band, and mixes into every shell. The closed
//  screen (C2) is the same rule with the 18 down slots returned to the dock: there a screen band exists and moves, at
//  0.046 docks a beat (0.13 of sqrt(2)/4). So what would create a screen mode is a rule in which the screen's down slots
//  do not stream into the bulk (a layer dock that returns them, or a coin whose moving sector has no weight on the
//  down labels); the 18 down, 6 along split and the fixed 1/32 are geometry, so on this rule no such mode exists, and
//  even the closed screen's band is 7.6 times slower than the flat's.
//
// Depth L2 (the register rule's own spectrum below a cusp of the true mesh, read by the law E-SPN-0180 derived and
// checked here against the rule itself). DETERMINISM: no random numbers; the Lanczos start is a fixed Weyl sequence.
// NOTHING MOVES: the pieces hand values between slots and register components of one dock, and the stream takes each
// slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  bandPhase,
  bandSlope,
  blochBeat,
  cliffordHop,
  cuspQuotient,
  flatQuotient,
  hopGram,
  huskTranslations,
  partnerProject,
  screenBands,
  singletState,
  SWAP,
  topModes,
  type CuspQuotient,
  type HopBlock,
  type ScreenBand,
} from '@/code/measure/cusp-bloch'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { norm2, type PieceSpec, type State } from '@/code/measure/cusp-register'
import { labelledCoin, frameInverse } from '@/code/substrate/coxeter/label-transport'
import { cuspRegion } from '@/code/substrate/coxeter/labelled-region'
import { slotPermutation } from '@/code/measure/hyperbolic-lines'
import { matMul } from '@/code/substrate/coxeter/minkowski'
import {
  diracSpeed,
  f4Group,
  structureVector,
} from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { wrap } from '@/code/measure/dock-mixer'

const THETA = 0.5
const EXACT = 1e-15
const TIGHT = 1e-12
const SUM = 1e-10
const MOVING = 1e-6
const TOP = 8
const REG = 8
const LIGHT: readonly [number, number] = [-1, 4]
const MASSLESS: readonly [number, number] = [0, 3]
const REFERENCE = Math.SQRT2 / 4
const GENERIC = [0.37, -0.21, 0.13]

export type ScreenPlan = {
  ks: number[][]
  denseCuts: number[]
  lanczosCut: number
  lanczosSteps: number
  flatSmallQ: number
  flatQ: number
}

export const GATE_PLAN: ScreenPlan = {
  ks: [
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
    [Math.PI, 0, 0],
    [Math.PI / 2, Math.PI / 2, Math.PI / 2],
    GENERIC,
  ],
  denseCuts: [1, 2],
  lanczosCut: 3,
  lanczosSteps: 480,
  flatSmallQ: 1e-3,
  flatQ: 0.6,
}

export const SMOKE_PLAN: ScreenPlan = {
  ks: [GENERIC],
  denseCuts: [1],
  lanczosCut: 2,
  lanczosSteps: 120,
  flatSmallQ: 1e-3,
  flatQ: 0.6,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/screen-modes',
  code: 'E-SPN-0182',
  title:
    'no mode of the register rule stays on the true screen, partial on the instrument: below a cusp of {3,4,3,4} the husk translations twist the labels (each unit step acts as minus a reflection, the label-trivial kernel is 2 Z^3), and by the band law the modes there are the spectrum of H(k) = C^dag C; each depth-1 dock has one layer parent, so the layer couples down with exactly 1/32 at every k (to 6.9e-18), as much as the whole along hop, into shells whose band reaches past 0.106; the most screen-bound band falls from 0.70 to 0.55 to 0.41 of its weight on the layer at depth cuts 1, 2, 3 (0.62 to 0.29 and 0.48 to 0.23 at other momenta), below 1/2 everywhere and faster than its deepest shell allows, and moves at most 0.025 docks a beat against the flat quotient\'s sqrt(2)/4 (controls: the flat quotient reproduces sqrt(2)/4 and diracSpeed, and the closed screen carries a band at 0.046); the cut 3 Krylov reading left Ritz residuals of 5.5e-5 against 1e-10, so the cut 3 shares are read, not certified',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return screenModesRun(GATE_PLAN)
  },
})

const unitOf = (k: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(k[0], k[1]))

  return [Math.cos(t), Math.sin(t)]
}
const massOf = (k: readonly [number, number]): number => {
  const u = unitOf(k)

  return wrap(Math.atan2(u[1], u[0]) - Math.PI)
}
// husk docks a beat, from d mu / dk (spacing 1: the unit lattice)
const speedOf = (M: number, mu: number, gradient: readonly number[]): number =>
  (bandSlope(M, mu) * Math.hypot(...gradient)) / 2

type Cut = {
  cut: number
  k: number[]
  best: ScreenBand
  // how many eigenvalues lie above the best band
  above: number
  speedMassless: number
  speedLight: number
  residual: number
  sharesEqual: number
  top: number[]
  spectrum: number[]
}

export function screenModesRun(plan: ScreenPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()
  const group = f4Group()
  const patch = cuspRegion({ coin, skin: 2, depth: 0 })
  const tr = huskTranslations(coin, patch.frames)
  const Mlight = massOf(LIGHT)
  const Mmassless = massOf(MASSLESS)

  // ---------------- G1: the translations ----------------
  let disagreeing = 0
  let shiftError = 0

  const labelMatrices = tr.map(t => group[t.element]?.matrix)
  const orderTwo = labelMatrices.every(
    m =>
      !!m &&
      m.every((row, i) =>
        row.every(
          (_, j) =>
            m[i]!.reduce((s, x, l) => s + x * m[l]![j]!, 0) === (i === j ? 1 : 0),
        ),
      ) &&
      -m.reduce((s, row, i) => s + row[i]!, 0) === 2,
  )

  for (const t of tr) {
    shiftError = Math.max(
      shiftError,
      t.shiftError,
      ...t.shift.map((v, a) => Math.abs(v - (a === t.axis ? 1 : 0))),
    )

    for (let x = 0; x < patch.cells; x++) {
      const image = matMul(t.T, patch.frames[x]!)
      const y = patch.index.get(patch.keyOf(image))

      if (y === undefined) {
        continue
      }

      const perm = slotPermutation(
        coin,
        matMul(frameInverse(coin, patch.frames[y]!), image),
      )

      if (!perm || perm.some((v, d) => v !== group[t.element]!.slots[d])) {
        disagreeing++
      }
    }
  }

  const classes = new Set<string>()

  for (let c = 0; c < 8; c++) {
    let m: number[][] = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0)))

    tr.forEach((t, i) => {
      if ((c >> i) & 1) {
        const g = group[t.element]!.matrix

        m = m.map(row => [0, 1, 2, 3].map(j => row.reduce((s, x, l) => s + x * g[l]![j]!, 0)))
      }
    })

    classes.add(m.flat().join(','))
  }

  const isIdentity = (e: number): boolean =>
    group[e]!.matrix.every((r, i) => r.every((x, j) => x === (i === j ? 1 : 0)))
  const evenOne = cuspQuotient({ coin, translations: tr, depth: 1, kind: 'even' })
  const G1 =
    tr.length === 3 &&
    shiftError <= 1e-9 &&
    orderTwo &&
    disagreeing === 0 &&
    classes.size === 8 &&
    evenOne.generatorElements.every(isIdentity)

  log('G1')

  // ---------------- G2: the quotients ----------------
  const cuts = [...new Set([0, ...plan.denseCuts, plan.lanczosCut])].sort((a, b) => a - b)
  const quotients = new Map<number, CuspQuotient>()

  for (const d of cuts) {
    quotients.set(d, cuspQuotient({ coin, translations: tr, depth: d, kind: 'unit' }))
  }

  const one = quotients.get(1) ?? cuspQuotient({ coin, translations: tr, depth: 1, kind: 'unit' })

  let singleParent = 0
  let depthOne = 0

  for (let x = 0; x < one.docks; x++) {
    if (one.depth[x] !== 1) {
      continue
    }

    depthOne++

    let up = 0

    for (let e = 0; e < 24; e++) {
      const y = one.target[x * 24 + e]!

      if (y >= 0 && one.depth[y] === 0) {
        up++
      }
    }

    if (up === 1) {
      singleParent++
    }
  }

  const G2 =
    [...quotients.values()].every(q => q.inconsistent === 0) &&
    depthOne === 18 &&
    singleParent === depthOne

  log('G2')

  // ---------------- G3: the leak ----------------
  let leakGap = 0
  let layerBlockGap = 0

  const blockGram = (list: HopBlock[]): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(REG * REG)
    const im = new Float64Array(REG * REG)

    for (const b of list) {
      for (let i = 0; i < REG; i++) {
        for (let j = 0; j < REG; j++) {
          let sr = 0
          let si = 0

          for (let l = 0; l < REG; l++) {
            const ar = b.re[l * REG + i]!
            const ai = -b.im[l * REG + i]!
            const br = b.re[l * REG + j]!
            const bi = b.im[l * REG + j]!

            sr += ar * br - ai * bi
            si += ar * bi + ai * br
          }

          re[i * REG + j]! += sr
          im[i * REG + j]! += si
        }
      }
    }

    return { re, im }
  }

  let alongTop = 0
  let splitRight = true

  for (const k of plan.ks) {
    const blocks = cliffordHop({ q: one, k, boundary: 'reflect' })
    // layer dock 0 is the one layer dock of the twisted cell
    const fromLayer = blocks.filter(b => b.y === 0)
    // every depth-1 dock receives one block from the layer, so its Gram adds block by block; the 6 along blocks all
    // land on the one layer dock of the cell, so they add as a sum first
    const down = blockGram(fromLayer.filter(b => one.depth[b.x] === 1))
    const alongBlocks = fromLayer.filter(b => one.depth[b.x] === 0)

    splitRight &&= alongBlocks.length === 6 && fromLayer.length === 24

    const along = blockGram([
      {
        ...alongBlocks[0]!,
        re: alongBlocks.reduce((s, b) => s.map((v, t) => v + b.re[t]!), new Float64Array(REG * REG)),
        im: alongBlocks.reduce((s, b) => s.map((v, t) => v + b.im[t]!), new Float64Array(REG * REG)),
      },
    ])
    const H = hopGram(one.docks, blocks)

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        leakGap = Math.max(
          leakGap,
          Math.abs(down.re[i * REG + j]! - (i === j ? 1 / 32 : 0)),
          Math.abs(down.im[i * REG + j]!),
        )
        layerBlockGap = Math.max(
          layerBlockGap,
          Math.abs(H.re[i * H.n + j]! - along.re[i * REG + j]! - (i === j ? 1 / 32 : 0)),
          Math.abs(H.im[i * H.n + j]! - along.im[i * REG + j]!),
        )
      }
    }

    alongTop = Math.max(alongTop, ...hermitianEigenRows(REG, along.re, along.im).values)
  }

  const G3 = splitRight && leakGap <= EXACT && layerBlockGap <= EXACT

  log('G3')

  // ---------------- the dense cuts ----------------
  const dense: Cut[] = []

  let sharesEqual = 0

  const readDense = (cut: number, k: number[], boundary: 'reflect' | 'open'): Cut => {
    const q = quotients.get(cut)!
    const r = screenBands({ q, k, boundary, gradientAbove: 0.3 })
    const best = r.bands.reduce((a, b) => (b.score > a.score ? b : a))
    const above = r.bands
      .filter(b => b.mu > best.mu + 1e-12)
      .reduce((s, b) => s + b.multiplicity, 0)
    const equal = Math.max(...r.bands.map(b => Math.abs(b.homeS - b.homeD)))
    const ordered = [...r.bands].sort((a, b) => b.mu - a.mu)
    const top: number[] = []

    for (const b of ordered) {
      for (let i = 0; i < b.multiplicity && top.length < TOP; i++) {
        top.push(b.mu)
      }
    }

    return {
      cut,
      k,
      best,
      above,
      speedMassless: best.gradient ? speedOf(Mmassless, best.mu, best.gradient) : 0,
      speedLight: best.gradient ? speedOf(Mlight, best.mu, best.gradient) : 0,
      residual: r.residual,
      sharesEqual: equal,
      top,
      spectrum: r.bands.map(b => b.mu),
    }
  }

  for (const cut of plan.denseCuts) {
    for (const k of plan.ks) {
      const c = readDense(cut, k, 'reflect')

      dense.push(c)
      sharesEqual = Math.max(sharesEqual, c.sharesEqual)
      log(`dense cut ${cut} k ${k.map(x => x.toFixed(3)).join(',')} share ${c.best.score.toFixed(3)}`)
    }
  }

  const lastDense = plan.denseCuts[plan.denseCuts.length - 1]!
  const openDense = readDense(lastDense, GENERIC, 'open')

  log('dense open')

  // ---------------- the Lanczos cut ----------------
  type Top = { k: number[]; modes: ReturnType<typeof topModes> }

  const lanczos: Top[] = plan.ks.map(k => {
    const modes = topModes({
      q: quotients.get(plan.lanczosCut)!,
      k,
      boundary: 'reflect',
      steps: plan.lanczosSteps,
      count: TOP,
    })

    log(`lanczos cut ${plan.lanczosCut} k ${k.map(x => x.toFixed(3)).join(',')}`)

    return { k, modes }
  })
  const lanczosOpen = topModes({
    q: quotients.get(plan.lanczosCut)!,
    k: GENERIC,
    boundary: 'open',
    steps: plan.lanczosSteps,
    count: TOP,
  })
  // I4: Lanczos at the last dense cut against the dense top 8
  let lanczosAgreement = 0

  for (const k of plan.ks) {
    const modes = topModes({
      q: quotients.get(lastDense)!,
      k,
      boundary: 'reflect',
      steps: plan.lanczosSteps,
      count: TOP,
    })
    const d = dense.find(c => c.cut === lastDense && c.k === k)!

    // every Ritz cluster sits on a dense eigenvalue, and the largest on the largest
    lanczosAgreement = Math.max(
      lanczosAgreement,
      Math.abs(modes[0]!.mu - d.top[0]!),
      ...modes.map(m => Math.min(...d.spectrum.map(x => Math.abs(x - m.mu)))),
    )
  }

  log('lanczos')

  // ---------------- M ----------------
  const perK = plan.ks.map(k => {
    const two = dense.find(c => c.cut === lastDense && c.k === k)!
    const three = lanczos.find(t => t.k === k)!
    const bestThree = three.modes.reduce((a, b) => (b.share > a.share ? b : a))
    const stable = Math.abs(bestThree.share - two.best.score) <= two.best.deepest
    const screen =
      bestThree.share >= THETA && stable && two.speedMassless >= MOVING

    return { k, two, bestThree, stable, screen }
  })
  const M = perK.some(p => p.screen)

  // ---------------- C1: the flat quotient ----------------
  const flat = flatQuotient()

  let flatLaw = 0

  for (const k of plan.ks) {
    const r = screenBands({ q: flat, k, boundary: 'reflect' })
    const s = structureVector([k[0]!, k[1]!, k[2]!, 0])
    const g2 = s.reduce((a, x) => a + x * x, 0) / 4

    flatLaw = Math.max(flatLaw, ...r.bands.map(b => Math.abs(b.mu - g2)))
  }

  const flatSpeed = (q: number, M: number): number => {
    const r = screenBands({ q: flat, k: [q, 0, 0], boundary: 'reflect', gradientAbove: 0 })
    const b = r.bands[r.bands.length - 1]!

    return speedOf(M, b.mu, b.gradient!)
  }
  const flatSmall = flatSpeed(plan.flatSmallQ, Mmassless)
  const flatMassless = flatSpeed(plan.flatQ, Mmassless)
  const flatLight = flatSpeed(plan.flatQ, Mlight)
  const diracMassless = diracSpeed([plan.flatQ, 0, 0, 0], Mmassless)
  const diracLight = diracSpeed([plan.flatQ, 0, 0, 0], Mlight)
  const C1 =
    flatLaw <= 1e-14 &&
    Math.abs(flatSmall - REFERENCE) <= 1e-4 &&
    Math.abs(flatMassless - diracMassless) <= SUM &&
    Math.abs(flatLight - diracLight) <= SUM &&
    flatMassless > 0.1 &&
    flatLight > 0.1

  log('C1')

  // ---------------- C2: the closed screen ----------------
  const closed = screenBands({
    q: quotients.get(0)!,
    k: GENERIC,
    boundary: 'reflect',
    gradientAbove: 0,
  })
  const closedShare = Math.min(...closed.bands.map(b => b.score))
  const closedFastest = Math.max(
    ...closed.bands
      .filter(b => b.mu > 1e-12)
      .map(b => speedOf(Mmassless, b.mu, b.gradient!)),
  )
  const C2 = Math.abs(closedShare - 1) <= TIGHT && closedFastest >= MOVING

  // ---------------- C3: coverage ----------------
  const C3 = dense.every(c => c.above < TOP)

  log('C2 C3')

  // ---------------- I1: the twist ----------------
  const K = [0.74, -0.42, 0.26]
  const spectrumOf = (q: CuspQuotient, k: number[]): number[] => {
    const H = hopGram(q.docks, cliffordHop({ q, k, boundary: 'reflect' }))

    return Array.from(hermitianEigenRows(H.n, H.re, H.im).values)
  }
  const big = spectrumOf(evenOne, K)
  const small: number[] = []

  for (let e = 0; e < 8; e++) {
    small.push(...spectrumOf(one, K.map((x, i) => x / 2 + Math.PI * ((e >> i) & 1))))
  }

  small.sort((a, b) => a - b)

  const twistGap = Math.max(...big.map((x, i) => Math.abs(x - small[i]!)))
  const I1 = big.length === small.length && twistGap <= TIGHT

  log('I1')

  // ---------------- I2: the law on the true mesh, through the rule itself ----------------
  const Heven = hopGram(evenOne.docks, cliffordHop({ q: evenOne, k: K, boundary: 'reflect' }))
  const eig = hermitianEigenRows(Heven.n, Heven.re, Heven.im)
  const n = Heven.n
  const walk = { q: evenOne, k: K }
  const inner = (a: State, b: State): [number, number] => {
    let r = 0
    let i = 0

    for (let t = 0; t < a.re.length; t++) {
      r += a.re[t]! * b.re[t]! + a.im[t]! * b.im[t]!
      i += a.re[t]! * b.im[t]! - a.im[t]! * b.re[t]!
    }

    return [r, i]
  }

  let overlapGap = 0
  let closure = 0
  let lawGap = 0

  for (const mass of [LIGHT, MASSLESS]) {
    const u = unitOf(mass)
    const Mm = massOf(mass)
    const S: PieceSpec = { sector: 'S', plus: u, minus: u }
    const D: PieceSpec = { sector: 'D', plus: [u[0], -u[1]], minus: [u[0], -u[1]] }

    for (const i of [0, 5, 40, Math.floor(n / 2), n - 3, n - 1]) {
      const mu = eig.values[i]!
      const s = singletState(
        evenOne.docks,
        eig.vectorsRe.subarray(i * n, i * n + n),
        eig.vectorsIm.subarray(i * n, i * n + n),
      )
      const p = blochBeat(walk, partnerProject(evenOne.docks, blochBeat(walk, s, SWAP)), SWAP)
      const ov = inner(s, p)

      overlapGap = Math.max(overlapGap, Math.hypot(ov[0] - mu, ov[1]))

      for (let t = 0; t < p.re.length; t++) {
        p.re[t]! -= ov[0] * s.re[t]! - ov[1] * s.im[t]!
        p.im[t]! -= ov[0] * s.im[t]! + ov[1] * s.re[t]!
      }

      const pn = Math.sqrt(norm2(p))
      const basis: State[] = [s]

      if (pn > 1e-10) {
        for (let t = 0; t < p.re.length; t++) {
          p.re[t]! /= pn
          p.im[t]! /= pn
        }

        basis.push(p)
      }

      const images = basis.map(v => blochBeat(walk, blochBeat(walk, v, S), D))
      const A = images.map(w => basis.map(v => inner(v, w)))

      images.forEach((w, j) => {
        const r = { re: Float64Array.from(w.re), im: Float64Array.from(w.im) }

        basis.forEach((v, a) => {
          const [cr, ci] = A[j]![a]!

          for (let t = 0; t < r.re.length; t++) {
            r.re[t]! -= cr * v.re[t]! - ci * v.im[t]!
            r.im[t]! -= cr * v.im[t]! + ci * v.re[t]!
          }
        })

        closure = Math.max(closure, Math.sqrt(norm2(r)))
      })

      const want = bandPhase(Mm, mu)
      const phases: [number, number][] = []

      if (basis.length === 1) {
        phases.push(A[0]![0]!)
      } else {
        const a = A[0]![0]!
        const b = A[1]![0]!
        const c = A[0]![1]!
        const d = A[1]![1]!
        const trace: [number, number] = [a[0] + d[0], a[1] + d[1]]
        const det: [number, number] = [
          a[0] * d[0] - a[1] * d[1] - (b[0] * c[0] - b[1] * c[1]),
          a[0] * d[1] + a[1] * d[0] - (b[0] * c[1] + b[1] * c[0]),
        ]
        const dr = (trace[0] ** 2 - trace[1] ** 2) / 4 - det[0]
        const di = (2 * trace[0] * trace[1]) / 4 - det[1]
        const mod = Math.hypot(dr, di)
        const sr = Math.sqrt((mod + dr) / 2)
        const si = (di >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, (mod - dr) / 2))

        phases.push([trace[0] / 2 + sr, trace[1] / 2 + si], [trace[0] / 2 - sr, trace[1] / 2 - si])
      }

      for (const [x, y] of phases) {
        lawGap = Math.max(lawGap, Math.abs(Math.PI - Math.abs(Math.atan2(y, x)) - want))
      }
    }
  }

  const I2 = overlapGap <= TIGHT && closure <= SUM && lawGap <= SUM
  const denseResidual = Math.max(...dense.map(c => c.residual), openDense.residual)
  const ritzResidual = Math.max(
    ...lanczos.flatMap(t => t.modes.map(m => m.residual)),
    ...lanczosOpen.map(m => m.residual),
  )
  const I3 = denseResidual <= TIGHT && ritzResidual <= SUM
  const I4 = lanczosAgreement <= SUM
  const instrument = I1 && I2 && I3 && I4
  const controls = C1 && C2 && C3
  const derived = G1 && G2 && G3

  log('instrument')

  const status: Verdict['status'] =
    derived && controls && instrument ? (M ? 'pass' : 'fail') : 'partial'
  const f = (x: number, d = 3): string => x.toFixed(d)
  const e = (x: number): string => x.toExponential(2)
  const kName = (k: number[]): string => k.map(x => f(x, 2)).join(',')
  const bestOf = (cut: number, k: number[]): Cut => dense.find(c => c.cut === cut && c.k === k)!
  const metrics: Record<string, number> = {
    G1: flag(G1),
    G2: flag(G2),
    G3: flag(G3),
    M: flag(M),
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    theta: THETA,
    leakGap,
    layerBlockGap,
    alongTop,
    sharesEqual,
    flatLaw,
    flatSmall,
    flatMassless,
    flatLight,
    closedShare,
    closedFastest,
    twistGap,
    overlapGap,
    closure,
    lawGap,
    denseResidual,
    ritzResidual,
    lanczosAgreement,
    docksCut1: quotients.get(1)?.docks ?? 0,
    docksCut2: quotients.get(2)?.docks ?? 0,
    docksCut3: quotients.get(3)?.docks ?? 0,
    seconds: (Date.now() - started) / 1000,
  }

  plan.ks.forEach((k, i) => {
    for (const cut of plan.denseCuts) {
      const c = bestOf(cut, k)

      metrics[`share_c${cut}_k${i}`] = c.best.score
      metrics[`mu_c${cut}_k${i}`] = c.best.mu
      metrics[`speed_c${cut}_k${i}`] = c.speedMassless
    }

    metrics[`share_c${plan.lanczosCut}_k${i}`] = perK[i]!.bestThree.share
    metrics[`mu_c${plan.lanczosCut}_k${i}`] = perK[i]!.bestThree.mu
  })

  const generic = plan.ks.findIndex(k => k === GENERIC)
  const shareTrail = (i: number): string =>
    [
      ...plan.denseCuts.map(cut => f(bestOf(cut, plan.ks[i]!).best.score)),
      f(perK[i]!.bestThree.share),
    ].join(', ')

  return verdict({
    status,
    claim: `G1 ${G1} (3 unit translations, shift error ${e(shiftError)}, label actions of order 2 with -M a reflection ${orderTwo}, ${disagreeing} disagreeing, ${classes.size} parity classes distinct, even lattice label-trivial); G2 ${G2} (docks per cell ${cuts.map(c => quotients.get(c)!.docks).join(', ')} at cuts ${cuts.join(', ')}, 0 inconsistent, ${singleParent} of ${depthOne} depth-1 docks single-parent); G3 ${G3} (leak I/32 to ${e(leakGap)}, layer block to ${e(layerBlockGap)}); M ${M} (the largest layer share at cuts ${[...plan.denseCuts, plan.lanczosCut].join(', ')} per k: ${plan.ks.map((k, i) => `[${kName(k)}] ${shareTrail(i)}${perK[i]!.stable ? '' : ' unstable'}`).join('; ')}; theta ${THETA}); C1 ${C1} (flat law ${e(flatLaw)}, massless speed at q ${plan.flatSmallQ} ${f(flatSmall, 6)} against ${f(REFERENCE, 6)}, at q ${plan.flatQ} light ${f(flatLight, 4)} and massless ${f(flatMassless, 4)} against diracSpeed ${f(diracLight, 4)} and ${f(diracMassless, 4)}); C2 ${C2} (closed screen: share ${f(closedShare, 12)}, fastest ${f(closedFastest, 4)} docks a beat); C3 ${C3} (the most screen-bound band at most ${Math.max(...dense.map(c => c.above))} eigenvalues from the top); instrument I1 ${I1} (${e(twistGap)}) I2 ${I2} (overlap ${e(overlapGap)}, closure ${e(closure)}, law ${e(lawGap)}) I3 ${I3} (${e(denseResidual)}, Ritz ${e(ritzResidual)}) I4 ${I4} (${e(lanczosAgreement)})`,
    metrics,
    control: {
      flatMassless,
      closedFastest,
      closedShare,
    },
    notes: `L2. Per cut and k, the band of largest layer share: ${plan.ks
      .map((k, i) => {
        const parts = plan.denseCuts.map(cut => {
          const c = bestOf(cut, k)

          return `cut ${cut}: share ${f(c.best.score)} mu ${f(c.best.mu, 5)} x${c.best.multiplicity} deepest ${f(c.best.deepest)} above ${c.above} speed ${f(c.speedMassless, 4)} massless, ${f(c.speedLight, 4)} light (${f(c.speedMassless / REFERENCE, 3)} of sqrt(2)/4)`
        })
        const t = perK[i]!.bestThree

        parts.push(`cut ${plan.lanczosCut}: share ${f(t.share)} mu ${f(t.mu, 5)} deepest ${f(t.deepest)}; top ${lanczos[i]!.modes.map(m => f(m.mu, 4)).join(' ')}`)

        return `[k ${kName(k)}] ${parts.join('; ')}`
      })
      .join(' ')}. Open frontier at the generic k: cut ${lastDense} share ${f(openDense.best.score)} mu ${f(openDense.best.mu, 5)}; cut ${plan.lanczosCut} share ${f(Math.max(...lanczosOpen.map(m => m.share)))} top mu ${f(lanczosOpen[0]!.mu, 5)}. mu_along at most ${f(alongTop, 6)} over the gate k (1/32 = 0.03125). S and D homes' layer shares equal band by band to ${e(sharesEqual)}. Generic k index ${generic}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
