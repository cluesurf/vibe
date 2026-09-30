// PARITY ON THE TRUE MESH, WHERE THE CUSP ORIENTS THE DEPTH (E-FRC-0272, OPEN-CPA-01). E-FRC-0258 split the register into
// two chiral halves and gave them different masses; E-SPN-0167 then found that on the flat quotient the husk keeps an
// exact parity (-I, which keeps both halves), so P violation "needs an oriented depth"; E-SPN-0168 and E-FRC-0267 found
// it on the one-sided face of a flat Wilson slab. Every one of those reads ran on a FLAT stand-in: the depth-period-2
// quotient of the flat D4 mesh, or a flat slab. The model's mesh is {3,4,3,4}, and E-FRC-0258 argued, without a run,
// that there "the cusp fixes the depth's direction, so the physical parity should be the depth-keeping reflection".
// This file runs the chiral mass on the true mesh near a cusp and asks which husk mirrors survive.
//
// DERIVED BEFORE THE RUN (code/substrate/coxeter/label-transport, code/substrate/coxeter/labelled-region,
// code/measure/cusp-register; the cusp v is the ideal vertex of the base cell fixed by the mirrors r1 .. r4).
// 1. THE LABELLING IS FORCED, AND IT ALTERNATES ORIENTATION. A rule written in labels needs the facets of every cell
//    labelled by the 24 roots with d against -d across each facet. The frame step is tau_d = F_d X_d with X_d in the
//    facet's stabilizer sending d to -d; label-transport builds the two candidates, the antipodal X_d = Z and the
//    translation-like X_d = R_d, and E-SPN-0156 measured that the second carries holonomy on {3,4,3,4} (order 3 around
//    every triangle). So the antipodal labelling is the one the true mesh admits. F_d is a reflection (det -1) and Z the
//    point inversion of a 4d cell (det +1), so EVERY STEP REVERSES ORIENTATION: det f_x = (-1)^(steps from the base),
//    and the cell graph is bipartite. Relative to parallel transport a step turns the frame by -R_d (E-SPN-0156), a
//    W(F4) REFLECTION, and a reflection swaps the register halves (g J = det(g) J g, E-FRC-0258). So on the true mesh a
//    rule's half J is the left half on even docks and the right half on odd docks: the stream carries a member's
//    LABEL chirality, and its geometric chirality flips every step. The flat mesh's translations keep orientation, so
//    there the two notions agree and this could not be seen.
// 2. THE CUSP. The cusp layer is the top of the mesh: at a layer dock 6 slots cross into layer neighbours, 18 go down,
//    none up (probe, gated in E-SPN-0181). The stabilizer of v is [4,3,4] = <r1, r2, r3, r4>, acting on the husk (the
//    horosphere) as the symmetry group of the cube tiling: r1, r2, r3 fix the base cube, r4 is the mirror in one of its
//    faces. Every element fixes v and keeps every horosphere, so it is a husk mirror exactly when det = -1 in O(4,1).
// 3. WHAT A LABEL RULE KEEPS. The labelling is the homomorphism phi of [3,4,3,4] onto W(F4) with phi(r_i) = r_i for the
//    cell mirrors and phi(r4) = Z = -I (label-transport). Every g is k s with k in the kernel (a symmetry of every rule
//    written in labels, on the whole mesh) and s = phi(g). The chiral pieces commute with the 576 rotations of W(F4) and
//    with no reflection (E-FRC-0267). So g is a symmetry of the chiral rule EXACTLY WHEN det phi(g) = +1. On the cusp
//    stabilizer that is the character chi(r1) = chi(r2) = chi(r3) = -1, chi(r4) = +1, while the husk orientation is
//    det(r_i) = -1 for all four. They differ on r4: THE FACE MIRROR r4 IS A HUSK MIRROR WHOSE LABEL ACTION IS -I, the
//    register identity, so it keeps both chiral halves, and the chiral rule keeps it. Composed with the half-turn
//    (r1 r2)^2 about the axis through the two cube centers, it gives the POINT INVERSION OF THE HUSK ABOUT A FACE CENTER,
//    with chi = +1: kept. The inversion about a cube center (the central element of <r1, r2, r3>, three reflections) has
//    chi = -1: broken. The half-turns r1 r4 and r2 r4 are husk ROTATIONS with chi = -1: broken. So on the true husk the
//    chiral mass keeps an exact parity (the inversion about a face center, which trades the two orientation classes and
//    so undoes the alternation of item 1) and gives up some rotations instead. PREDICTED: P IS NOT VIOLATED, and
//    E-FRC-0258's "the cusp picks the depth-keeping reflection" is refuted: the cusp does orient the depth, but the
//    labelling hides that orientation from any rule written in labels.
// 4. WHAT WOULD TELL LEFT FROM RIGHT. A rule that reads a dock's orientation class e(x) = det f_x (the mass u+ on the half
//    with J e = +1, the GEOMETRIC chiral mass) transforms by det(g): it keeps exactly the husk rotations (det = +1) and
//    breaks every husk mirror, so it violates P on the true husk. Its cost: it is not a rule written in labels (it reads
//    how the dock sits in the oriented bulk), and since the stream keeps J while e flips, a member meets the two masses
//    on alternate beats. PREDICTED: every husk mirror broken, every husk rotation kept.
// 5. THE FLAT STAND-IN, as the control: on the flat box with translation labels (det +1 everywhere) the same code must
//    reproduce E-SPN-0167's pattern in real space: the chiral rule keeps -I and breaks P_imp = diag(-1, -1, -1, 1) and
//    R4 = diag(1, 1, 1, -1); the achiral rule keeps all three.
//
// GATES, fixed before the gate run (GATE_PLAN: regions of radius 2 and 3, 6 beats, two mass pairs: E-FRC-0258's light
// and minus units, and the light unit against the massless one; the test vector is the Weyl state of cusp-register).
//  P1 ORIENTATION (exact): all 24 transports have det -1; on every region every pair of neighbours has opposite frame
//     determinant (bipartite), 0 exceptions.
//  P2 THE CUSP MIRRORS (exact): r1 .. r4 fix v (1e-9 relative); r1, r2, r3 fix the base cell with label actions of det -1;
//     r4 moves it to a neighbour with label action -I and the register identity; <r1, r2, r3> has 48 elements and
//     <r1, r2, r4> 16, each maps its region onto itself with ONE label action on every cell (0 disagreeing); the
//     inversion about the base cube's center is found in the first group and the inversion about the face center between
//     the two region centers in the second, each acting on every layer cell's husk position as h -> 2p - h (1e-9).
//  P3 THE LABEL CHIRAL RULE (the derived pattern, item 3): for every element, max over t of the defect <= 1e-12 when
//     det phi(g) = +1, and the defect at the last beat >= 1e-3 when det phi(g) = -1; at least one husk mirror (det -1 in
//     O(4,1)) is kept (r4), the face-center inversion is kept and the cube-center inversion broken.
//  P4 THE GEOMETRIC CHIRAL RULE (item 4): kept (<= 1e-12) exactly the det +1 elements, broken (>= 1e-3 at the last beat)
//     every det -1 element.
// CONTROLS. C1 the achiral rule (E-SPN-0160's pieces) keeps every tested element (<= 1e-12): a wrong symmetry operator
//  fails here. C2 the flat box of side 4 (item 5): the chiral rule keeps -I (<= 1e-12) and breaks P_imp and R4 (>= 1e-3
//  at the last beat); the achiral rule keeps all three.
// INSTRUMENT. I1 the structured pieces equal the dense ones the Bloch readings use (1e-13, four pieces). I2 a plane wave
//  of an eigenvector of the dense cycle at K = (pi/2, 0, 0, 0) on the flat box returns times its eigenvalue after one
//  cycle (1e-12). I3 the reflecting frontier keeps the norm of the Weyl state on the largest region over the beats
//  (1e-12 relative).
// VERDICT, fixed before the run: FAIL (as derived) when P1 .. P4 hold with the controls and the instrument: the chiral
//  mass keeps an exact husk parity on the true mesh. PASS when the label chiral rule breaks every tested husk mirror
//  (P violated on the true husk) with the controls and instrument holding. PARTIAL otherwise (a control or the instrument
//  failing, or a derivation refuted without P violation).
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/hm-probe1.log: det tau -1 on all 24, frame det (-1)^distance on the
//  481-cell ball, r1 .. r4 fix v, r4's label matrix -I with the register identity, r1 .. r3 label det -1, the base
//  dock's slots 6 layer, 18 down, 0 up. tmp/hm-smoke.log (5 elements, radius 2, 4 beats, the light and minus pair):
//  dense agreement 1.3e-15; flat Bloch check 1.4e-15; flat -I kept, P_imp and R4 broken (5.3e-2), achiral all kept;
//  true mesh r1, r2 broken for both chiral rules (3.9e-2), r4 kept by the label rule and broken by the geometric one,
//  r1 r4 broken by the label rule and kept by the geometric one, r1 r2 kept by both, every defect of the achiral rule
//  at 3e-16. No gate was written after those numbers that is not item 3's or item 4's derived pattern. tmp/hm-parity-
//  smoke.log (SMOKE_PLAN, radius 1, 2 beats): every code path ran, every gate as derived.
//
// FIRST RUN (tmp/hm-parity-gate-run1.log, 270 s, 1.3 GB): FAIL, as derived. Every gate, control and instrument held; no
//  gate moved and none was rerun.
//  - P1: 24 of 24 transports det -1; 0 neighbour pairs of equal orientation on the four regions (481, 914, 8,857 and
//    16,800 docks).
//  - P2: r4's label action -I with the register identity; <r1, r2, r3> 48 elements, <r1, r2, r4> 16, one label action
//    each on every cell; both inversions found.
//  - P3: the label chiral rule keeps every det-phi +1 element to 3.6e-16 over 6 beats and breaks every det-phi -1 element
//    by at least 5.7e-2 (0.22 with the light unit against the massless one); of the husk mirrors it keeps 16 readings (4
//    per two-center region: r4 times each of the 4 turns about the axis through the two cube centers, that is r4, two
//    improper quarter turns and the face-center inversion) and breaks 112; it breaks 16
//    rotation readings (the half-turns such as r1 r4); the cube-center inversion is broken.
//  - P4: the geometric chiral rule keeps every husk rotation to 3.6e-16 and breaks every husk mirror, 0 of 128 kept, by at
//    least 5.9e-2.
//  - C1: the achiral rule keeps all 64 elements to 3.8e-16. C2: flat -I 3.7e-16, P_imp and R4 7.5e-2.
//  - Instrument: dense agreement 1.3e-15, Bloch 1.6e-15, norm 8.3e-14.
// NEXT. (1) Whether the geometric chiral mass keeps E-FRC-0258's one-body results (the band, c*, R, the census) when a
//  member meets m+ and m- on alternate beats, and whether reading e(x) can be written as a local piece of the rule at all
//  (it is how the dock sits in the oriented bulk, not anything its labels hold). (2) The Wilson half of E-FRC-0267 on the
//  true mesh near the cusp, where the one-sided screen of E-SPN-0181 plays the slab face's part.
//
// Depth L1 (the labelling's orientation and the cusp stabilizer's two characters are group theory) and L2 (the register
// rule run on the true mesh and read for its symmetries). DETERMINISM: no random numbers; the test vector is a Weyl
// sequence. NOTHING MOVES: the pieces hand values between slots and register components of one dock, and the stream
// takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  cloneState,
  denseAgreement,
  densePiece,
  gap2,
  imageOperator,
  newState,
  norm2,
  registerBeat,
  symmetryDefects,
  weylState,
  type ImageOperator,
  type PieceSpec,
  type Unit,
  type Walk,
} from '@/code/measure/cusp-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import {
  REGISTER_ROOTS,
  f4Group,
  type GroupElement,
} from '@/code/measure/spinor-register'
import { det4 } from '@/code/measure/chiral-register'
import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4BoxMesh,
  d4Coordinates,
  d4Vector,
} from '@/code/substrate/d4-box-integer'
import {
  labelledCoin,
  labelTransports,
} from '@/code/substrate/coxeter/label-transport'
import {
  buildLabelledRegion,
  closeGroup,
  regionImage,
  type LabelledRegion,
} from '@/code/substrate/coxeter/labelled-region'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import {
  determinant,
  identity,
  matMul,
  matVec,
  nullVector,
  reflectionMatrix,
  type Mat,
} from '@/code/substrate/coxeter/minkowski'

const EXACT = 1e-12
const BROKEN = 1e-3
const AGREE = 1e-13
const LIGHT: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const MASSLESS: readonly [number, number] = [0, 3]

export type ParityPlan = {
  radii: number[]
  beats: number
  flatSide: number
  pairs: (readonly [number, number])[][]
}

export const GATE_PLAN: ParityPlan = {
  radii: [2, 3],
  beats: 6,
  flatSide: 4,
  pairs: [
    [LIGHT, MINUS],
    [LIGHT, MASSLESS],
  ],
}

export const SMOKE_PLAN: ParityPlan = {
  radii: [1],
  beats: 2,
  flatSide: 4,
  pairs: [[LIGHT, MINUS]],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/cusp-parity',
  code: 'E-FRC-0272',
  title:
    "the chiral mass keeps an exact husk parity on the true mesh, fail as derived: the one labelling {3,4,3,4} admits reverses orientation at every step (24 of 24 transports det -1, 0 neighbour pairs of equal orientation on regions of 481 to 16,800 docks), so a rule written in labels holds each register half left-handed on even docks and right-handed on odd ones; the cusp's face mirror r4 acts on the labels as -I, the register identity, so the chiral mass keeps it and the husk's point inversion about a face center (3.6e-16 over 6 beats) while it breaks the cube-center mirrors, the cube-center inversion and the half-turns such as r1 r4 (by 5.7e-2, and 0.22 against a massless half); E-FRC-0258's argument that the cusp picks the depth-keeping reflection is refuted; a rule that reads each dock's orientation keeps every husk rotation and breaks all 128 husk-mirror readings; controls: the achiral rule keeps all 64 elements (3.8e-16), and the flat box reproduces E-SPN-0167 in real space (-I kept, P_imp and R4 broken by 7.5e-2)",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return cuspParityRun(GATE_PLAN)
  },
})

const unitOf = (k: readonly [number, number]): Unit => {
  const t = unitAngle(ringUnit(k[0], k[1]))

  return [Math.cos(t), Math.sin(t)]
}
const conj = (u: Unit): Unit => [u[0], -u[1]]

type Rules = {
  achiral: PieceSpec[][]
  label: PieceSpec[][]
  geometric: PieceSpec[][]
}

function rulesFor(plus: Unit, minus: Unit): Rules {
  const S = (a: Unit, b: Unit): PieceSpec => ({
    sector: 'S',
    plus: a,
    minus: b,
  })
  const D = (a: Unit, b: Unit): PieceSpec => ({
    sector: 'D',
    plus: conj(a),
    minus: conj(b),
  })

  return {
    achiral: [[S(plus, plus)], [D(plus, plus)]],
    label: [[S(plus, minus)], [D(plus, minus)]],
    // class 0: det f = +1, class 1: det f = -1, where the halves trade masses
    geometric: [
      [S(plus, minus), S(minus, plus)],
      [D(plus, minus), D(minus, plus)],
    ],
  }
}

type Tested = {
  name: string
  det5: number
  detLabel: number
  op: ImageOperator
}

type RegionRead = {
  region: LabelledRegion
  tested: Tested[]
  bipartiteExceptions: number
  disagreeing: number
  invariant: boolean
  inversion?: string
}

export function cuspParityRun(plan: ParityPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()
  const { normals, metric, center } = coin.frame
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const R = normals.map(n => reflectionMatrix(n, metric))
  const I5 = identity(center.length)
  const v = nullVector(normals.slice(1), metric)
  const vScale = Math.max(...v.map(Math.abs))
  const group = f4Group()
  const bySlots = (slots: Int32Array): GroupElement | undefined =>
    group.find(g => g.slots.every((x, d) => x === slots[d]))
  const chart = horosphericalChart(coin)
  const onLayer = (g: Mat): boolean =>
    Math.abs(chart.level(matVec(g, center)) - chart.layerLevel) <
    1e-9 * chart.layerLevel
  const husk = (g: Mat): number[] => chart.coordinates(matVec(g, center))
  const c1 = matMul(R[4]!, coin.inversion)

  // ---------------- P1 (transports), P2 (mirrors) ----------------
  const tauDets = tau.map(t => Math.round(determinant(t)))
  const P1tau = tauDets.every(d => d === -1)
  const fixesV = [1, 2, 3, 4].every(i =>
    matVec(R[i]!, v).every(
      (x, a) => Math.abs(x - v[a]!) <= 1e-9 * vScale,
    ),
  )
  const small = buildLabelledRegion({ coin, seeds: [I5], radius: 1 })
  const pair = buildLabelledRegion({ coin, seeds: [I5, c1], radius: 1 })
  const mirrorActions = [1, 2, 3, 4].map(i => {
    // r1, r2, r3 fix the base cell (its ball is theirs); r4 swaps the base cell and its neighbour c1
    const img = regionImage({
      coin,
      region: i === 4 ? pair : small,
      g: R[i]!,
    })
    const el = img ? bySlots(img.slots) : undefined

    return {
      i,
      movesBase:
        img !== undefined && img.cellMap[0] !== 0,
      det: el ? det4(el.matrix) : 0,
      minusI:
        !!el &&
        el.matrix.every((r, a) =>
          r.every((x, b) => x === (a === b ? -1 : 0)),
        ),
      registerIdentity:
        !!el &&
        el.register.every((r, a) =>
          r.every((x, b) => x === (a === b ? 1 : 0)),
        ),
    }
  })
  const P2mirrors =
    fixesV &&
    mirrorActions
      .slice(0, 3)
      .every(m => !m.movesBase && m.det === -1) &&
    mirrorActions[3]!.movesBase &&
    mirrorActions[3]!.minusI &&
    mirrorActions[3]!.registerIdentity &&
    small.cells === 25
  const cubeGroup = closeGroup([R[1]!, R[2]!, R[3]!], 200)
  const faceGroup = closeGroup([R[1]!, R[2]!, R[4]!], 200)

  log('P1 P2 mirrors')

  // ---------------- the regions and their symmetry operators ----------------
  const readRegion = (
    seeds: Mat[],
    radius: number,
    elements: Mat[],
    p: number[],
  ): RegionRead => {
    const region = buildLabelledRegion({ coin, seeds, radius })
    const dets = region.frames.map(f => Math.sign(determinant(f)))

    let bipartiteExceptions = 0

    for (let x = 0; x < region.cells; x++) {
      for (let d = 0; d < 24; d++) {
        const n = region.neighbour[x * 24 + d]!

        if (n >= 0 && dets[n] !== -dets[x]!) {
          bipartiteExceptions++
        }
      }
    }

    const layer = region.frames
      .map((f, x) => ({ f, x }))
      .filter(({ f }) => onLayer(f))
    const tested: Tested[] = []

    let disagreeing = 0
    let invariant = true
    let inversion: string | undefined

    elements.forEach((g, k) => {
      const img = regionImage({ coin, region, g })
      const el = img ? bySlots(img.slots) : undefined

      if (!img || !el) {
        invariant = false

        return
      }

      disagreeing += img.disagreeing

      const inverts = layer.every(({ f, x }) => {
        const h = husk(f)
        const hg = husk(region.frames[img.cellMap[x]!]!)

        return h.every((c, a) => Math.abs(hg[a]! + c - 2 * p[a]!) <= 1e-9)
      })
      const name = `g${k}`

      if (inverts) {
        inversion = name
      }

      tested.push({
        name,
        det5: Math.round(determinant(g)),
        detLabel: det4(el.matrix),
        op: imageOperator(img.cellMap, el),
      })
    })

    return {
      region,
      tested,
      bipartiteExceptions,
      disagreeing,
      invariant,
      inversion,
    }
  }

  const faceCenter = husk(I5).map((x, a) => (x + husk(c1)[a]!) / 2)
  const cubeCenter = husk(I5)

  type RuleRead = {
    radius: number
    which: 'cube' | 'face'
    pair: number
    rule: keyof Rules
    tested: Tested[]
    defects: number[][]
  }

  const reads: RuleRead[] = []
  const regionReads: RegionRead[] = []

  let normDrift = 0

  for (const radius of plan.radii) {
    for (const which of ['cube', 'face'] as const) {
      const rr =
        which === 'cube'
          ? readRegion([I5], radius, cubeGroup, cubeCenter)
          : readRegion([I5, c1], radius, faceGroup, faceCenter)

      regionReads.push(rr)

      const cls = Int8Array.from(rr.region.frames, f =>
        determinant(f) > 0 ? 0 : 1,
      )
      const psi = weylState(rr.region.cells)
      const ops = rr.tested.map(t => t.op)

      plan.pairs.forEach((pair, pi) => {
        const rules = rulesFor(unitOf(pair[0]!), unitOf(pair[1]!))

        for (const rule of ['achiral', 'label', 'geometric'] as const) {
          if (rule === 'achiral' && pi > 0) {
            continue
          }

          const walk: Walk = {
            cells: rr.region.cells,
            neighbour: rr.region.neighbour,
            classOf:
              rule === 'geometric' ? cls : new Int8Array(rr.region.cells),
            schedule: rules[rule],
            frontier: 'reflect',
          }

          reads.push({
            radius,
            which,
            pair: pi,
            rule,
            tested: rr.tested,
            defects: symmetryDefects(walk, ops, psi, plan.beats),
          })

          if (rule === 'label' && pi === 0) {
            let s = psi
            const n0 = norm2(psi)

            for (let t = 0; t < plan.beats; t++) {
              s = registerBeat(walk, s, t).state
            }

            normDrift = Math.max(normDrift, Math.abs(norm2(s) / n0 - 1))
          }

          log(`radius ${radius} ${which} pair ${pi} ${rule}`)
        }
      })
    }
  }

  const P1 =
    P1tau && regionReads.every(r => r.bipartiteExceptions === 0)
  const P2 =
    P2mirrors &&
    cubeGroup.length === 48 &&
    faceGroup.length === 16 &&
    regionReads.every(
      r => r.invariant && r.disagreeing === 0 && r.inversion !== undefined,
    )
  const worst = (d: number[]): number => Math.max(...d)
  const last = (d: number[]): number => d[d.length - 1]!
  const judge = (
    rule: keyof Rules,
    keep: (t: Tested) => boolean,
  ): { ok: boolean; keptWorst: number; brokeLeast: number } => {
    let ok = true
    let keptWorst = 0
    let brokeLeast = Number.POSITIVE_INFINITY

    for (const r of reads.filter(x => x.rule === rule)) {
      r.tested.forEach((t, k) => {
        const d = r.defects[k]!

        if (keep(t)) {
          keptWorst = Math.max(keptWorst, worst(d))
          ok &&= worst(d) <= EXACT
        } else {
          brokeLeast = Math.min(brokeLeast, last(d))
          ok &&= last(d) >= BROKEN
        }
      })
    }

    return { ok, keptWorst, brokeLeast }
  }
  const C1 = judge('achiral', () => true)
  const P3pattern = judge('label', t => t.detLabel === 1)
  const P4pattern = judge('geometric', t => t.det5 === 1)
  const inversionKept = (which: 'cube' | 'face', rule: keyof Rules) =>
    reads
      .filter(r => r.which === which && r.rule === rule)
      .every(r => {
        const rr = regionReads.find(x => x.tested === r.tested)!
        const k = r.tested.findIndex(t => t.name === rr.inversion)

        return k >= 0 && worst(r.defects[k]!) <= EXACT
      })
  const inversionBroken = (which: 'cube' | 'face', rule: keyof Rules) =>
    reads
      .filter(r => r.which === which && r.rule === rule)
      .every(r => {
        const rr = regionReads.find(x => x.tested === r.tested)!
        const k = r.tested.findIndex(t => t.name === rr.inversion)

        return k >= 0 && last(r.defects[k]!) >= BROKEN
      })
  const labelMirrorsKept = reads
    .filter(r => r.rule === 'label')
    .reduce(
      (n, r) =>
        n +
        r.tested.filter(
          (t, k) => t.det5 === -1 && worst(r.defects[k]!) <= EXACT,
        ).length,
      0,
    )
  const labelMirrorsBroken = reads
    .filter(r => r.rule === 'label')
    .reduce(
      (n, r) =>
        n +
        r.tested.filter(
          (t, k) => t.det5 === -1 && last(r.defects[k]!) >= BROKEN,
        ).length,
      0,
    )
  const labelRotationsBroken = reads
    .filter(r => r.rule === 'label')
    .reduce(
      (n, r) =>
        n +
        r.tested.filter(
          (t, k) => t.det5 === 1 && last(r.defects[k]!) >= BROKEN,
        ).length,
      0,
    )
  const geometricMirrorsKept = reads
    .filter(r => r.rule === 'geometric')
    .reduce(
      (n, r) =>
        n +
        r.tested.filter(
          (t, k) => t.det5 === -1 && worst(r.defects[k]!) <= EXACT,
        ).length,
      0,
    )
  const P3 =
    P3pattern.ok &&
    labelMirrorsKept > 0 &&
    inversionKept('face', 'label') &&
    inversionBroken('cube', 'label')
  const P4 =
    P4pattern.ok &&
    inversionBroken('face', 'geometric') &&
    inversionBroken('cube', 'geometric')

  log('P3 P4 C1')

  // ---------------- C2: the flat box ----------------
  const side = plan.flatSide
  const mesh = d4BoxMesh({ side })
  const cells = side ** 4
  const nb = new Int32Array(cells * 24)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      nb[x * 24 + d] = mesh.neighbour(x, d)
    }
  }

  const byMatrix = (m: number[][]): GroupElement | undefined =>
    group.find(g =>
      g.matrix.every((r, i) => r.every((x, j) => x === m[i]![j])),
    )
  const flatOp = (m: number[][]): ImageOperator => {
    const cellMap = new Int32Array(cells)

    for (let x = 0; x < cells; x++) {
      const p = d4Vector(d4BoxCoordinates({ cell: x, side }))
      const img = m.map(r => r.reduce((s, c, k) => s + c * p[k]!, 0))

      cellMap[x] = d4BoxCell({ coordinates: d4Coordinates(img), side })
    }

    return imageOperator(cellMap, byMatrix(m)!)
  }
  const diag = (d: number[]): number[][] =>
    d.map((x, i) => d.map((_, j) => (i === j ? x : 0)))
  const flatOps = [
    flatOp(diag([-1, -1, -1, -1])),
    flatOp(diag([-1, -1, -1, 1])),
    flatOp(diag([1, 1, 1, -1])),
  ]
  const flatRules = rulesFor(unitOf(LIGHT), unitOf(MINUS))
  const flatWalk = (s: PieceSpec[][]): Walk => ({
    cells,
    neighbour: nb,
    classOf: new Int8Array(cells),
    schedule: s,
    frontier: 'reflect',
  })
  const flatPsi = weylState(cells)
  const flatAchiral = symmetryDefects(
    flatWalk(flatRules.achiral),
    flatOps,
    flatPsi,
    plan.beats,
  )
  const flatChiral = symmetryDefects(
    flatWalk(flatRules.label),
    flatOps,
    flatPsi,
    plan.beats,
  )
  const C2 =
    flatAchiral.every(d => worst(d) <= EXACT) &&
    worst(flatChiral[0]!) <= EXACT &&
    last(flatChiral[1]!) >= BROKEN &&
    last(flatChiral[2]!) >= BROKEN

  log('C2')

  // ---------------- instrument ----------------
  const specs: PieceSpec[] = [
    ...flatRules.achiral.flat(),
    ...flatRules.label.flat(),
  ]
  const agreement = Math.max(...specs.map(denseAgreement))
  const I1 = agreement <= AGREE
  const K = [Math.PI / 2, 0, 0, 0]
  const U = cycleMatrix(
    flatRules.label.map(p => densePiece(p[0]!)),
    REGISTER_ROOTS,
    K,
  )
  const ev = complexEigenvalues({ re: U.re, im: U.im, n: 192 })

  let pick = 0

  ev.re.forEach((x, i) => {
    if (
      Math.abs(Math.atan2(ev.im[i]!, x)) >
      Math.abs(Math.atan2(ev.im[pick]!, ev.re[pick]!))
    ) {
      pick = i
    }
  })

  const lam: [number, number] = [ev.re[pick]!, ev.im[pick]!]
  const phi = complexEigenvector({ re: U.re, im: U.im, n: 192, value: lam })
  const wave = newState(cells)

  for (let x = 0; x < cells; x++) {
    const p = d4Vector(d4BoxCoordinates({ cell: x, side }))
    const ph = p.reduce((s, c, k) => s + c * K[k]!, 0)

    for (let m = 0; m < 192; m++) {
      wave.re[x * 192 + m] =
        Math.cos(ph) * phi.re[m]! - Math.sin(ph) * phi.im[m]!
      wave.im[x * 192 + m] =
        Math.cos(ph) * phi.im[m]! + Math.sin(ph) * phi.re[m]!
    }
  }

  let cycled = wave

  for (let t = 0; t < 2; t++) {
    cycled = registerBeat(flatWalk(flatRules.label), cycled, t).state
  }

  const expect = cloneState(wave)

  for (let k = 0; k < expect.re.length; k++) {
    expect.re[k] = lam[0] * wave.re[k]! - lam[1] * wave.im[k]!
    expect.im[k] = lam[0] * wave.im[k]! + lam[1] * wave.re[k]!
  }

  const blochGap = Math.sqrt(gap2(cycled, expect) / norm2(wave))
  const I2 = blochGap <= EXACT
  const I3 = normDrift <= EXACT
  const instrument = I1 && I2 && I3
  const controls = C1.ok && C2
  const derived = P1 && P2 && P3 && P4
  const everyMirrorBroken =
    labelMirrorsKept === 0 && labelMirrorsBroken > 0
  const status: Verdict['status'] =
    instrument && controls && derived
      ? 'fail'
      : instrument && controls && everyMirrorBroken
        ? 'pass'
        : 'partial'
  const e = (x: number): string => x.toExponential(2)
  const regionSizes = regionReads
    .map(r => `${r.region.cells}`)
    .join(', ')

  return verdict({
    status,
    claim: `P1 ${P1} (transport dets ${[...new Set(tauDets)].join(',')}, bipartite exceptions ${regionReads.map(r => r.bipartiteExceptions).join('/')}); P2 ${P2} (r4 label -I ${mirrorActions[3]!.minusI}, register identity ${mirrorActions[3]!.registerIdentity}; groups ${cubeGroup.length} and ${faceGroup.length}; inversions found ${regionReads.map(r => r.inversion ?? 'none').join('/')}); P3 ${P3} (label chiral rule: kept worst ${e(P3pattern.keptWorst)}, broken least ${e(P3pattern.brokeLeast)}; husk mirrors kept ${labelMirrorsKept}, broken ${labelMirrorsBroken}; husk rotations broken ${labelRotationsBroken}; face-center inversion kept, cube-center inversion broken: ${inversionKept('face', 'label') && inversionBroken('cube', 'label')}); P4 ${P4} (geometric chiral rule: kept worst ${e(P4pattern.keptWorst)}, broken least ${e(P4pattern.brokeLeast)}, husk mirrors kept ${geometricMirrorsKept}); C1 ${C1.ok} (achiral worst ${e(C1.keptWorst)}); C2 ${C2} (flat -I ${e(worst(flatChiral[0]!))}, P_imp ${e(last(flatChiral[1]!))}, R4 ${e(last(flatChiral[2]!))}); instrument I1 ${I1} (${e(agreement)}) I2 ${I2} (${e(blochGap)}) I3 ${I3} (${e(normDrift)})`,
    metrics: {
      P1: flag(P1),
      P2: flag(P2),
      P3: flag(P3),
      P4: flag(P4),
      C1: flag(C1.ok),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      labelKeptWorst: P3pattern.keptWorst,
      labelBrokenLeast: P3pattern.brokeLeast,
      labelMirrorsKept,
      labelMirrorsBroken,
      labelRotationsBroken,
      geometricKeptWorst: P4pattern.keptWorst,
      geometricBrokenLeast: P4pattern.brokeLeast,
      geometricMirrorsKept,
      achiralWorst: C1.keptWorst,
      flatMinusI: worst(flatChiral[0]!),
      flatPimp: last(flatChiral[1]!),
      flatR4: last(flatChiral[2]!),
      denseAgreement: agreement,
      blochGap,
      normDrift,
      cubeGroup: cubeGroup.length,
      faceGroup: faceGroup.length,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1.ok),
      C2: flag(C2),
      achiralWorst: C1.keptWorst,
      flatPimp: last(flatChiral[1]!),
    },
    notes: `L1 and L2. Regions (cells): ${regionSizes} (radius ${plan.radii.join(', ')}; the ball about the base cell for <r1, r2, r3>, the two-center region for <r1, r2, r4>). ${plan.beats} beats, pairs ${plan.pairs.map(p => p.map(x => `(${x.join(',')})`).join(' vs ')).join('; ')}. The two-center region at the largest radius, per rule and pair, each element as name(det in O(4,1), det of its label action) and its last-beat defect: ${reads
      .filter(
        r =>
          r.which === 'face' &&
          r.radius === plan.radii[plan.radii.length - 1],
      )
      .map(
        r =>
          `[r${r.radius} ${r.which} p${r.pair} ${r.rule}: ${r.tested
            .map(
              (t, k) =>
                `${t.name}(${t.det5},${t.detLabel})${e(last(r.defects[k]!))}`,
            )
            .join(' ')}]`,
      )
      .join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
