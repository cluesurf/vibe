// CAN A SIGMA(648) COLOUR FIELD BREAK THE ONE-WALL NUMBER N_A (E-FRC-0291, note/project/vibe/roadmap/moving-matter item
// 0029, decision 003)? RULE: the register rule R*, with the spinor lift as the member's rotation (decision 0006). The
// one-wall number N_A has Tr N_A C^2 = 2, the hinge of route 1 (research/charge-one-after-anomaly.md). Decision 003:
// smooth Sigma(648) fields are flat (every g != 1 sits level >= 1 from the identity), so colour can break N_A only through
// a rough transverse flux that keeps the Wilson bulk gap open, read as E-SPN-0168's wall flow along a closed k2 loop.
//
// THE INSTRUMENT. E-SPN-0168's slab (L depth classes, the Wilson schedule on the first L / 2, E-SPN-0160's register rule
// on the rest, half 0, member unit ringUnit(-2, 5)) in a uniform field along (0, 1), and wall-face's wallFlow: every
// level within the window of pi along the loop k2 = k2Start + 2 pi t, each labeled wall A or B, the crossings counted
// (code/measure/wall-index, which reuses wall-face and wilson-register unchanged).
//
// STEP 1 (exact). Sigma(648) by closure; per conjugacy class: size, order, eigenphases in turns reduced to (-1/2, 1/2]
//  (character projection, fractions exact), level round(6 (1 - Re Tr g / 3)); d_min the least level over g != 1.
// STEP 2 (float). The bulk window: the two-class bulk slabs (all Wilson, all E-SPN-0160) in a uniform U(1) field of
//  flux f per (0, 1) cell, levels within 0.2 of pi at 4 k2 values, (k0, k1) = (0.02, 0.05), k2Start 0.013 (wall-pump
//  probe 6). Open means none. Read at every distinct nonzero |f| among the eigenphases AND among the cell fluxes of
//  STEP 3 (below), and the controls 1/15, 1/9 (must read open) and 1/3 (must read closed).
// STEP 3 (abelian flow). THE WALK'S OWN LINKS. A D4 hop r from x0 = a carries the Landau line integral B r1 (a + r0 / 2):
//  a diagonal hop carries half a cell's flux, and every elementary triangle in the (0, 1) planes carries half a cell. So
//  a uniform field whose links are Sigma(648) elements is a field h^(r1 (2 a + r0)) with h the TRIANGLE element, the cell
//  holonomy h^2, and colour component c carries cell flux 2 theta_c (theta_c an eigenphase of h, in (-1/2, 1/2]). A cell
//  holonomy g whose eigenphases are themselves small needs a square root in Sigma(648) with the same small phases, and
//  the group lacks it (the class table: no element has eigenphases (-1/18, -1/18, 1/9)); so the finest uniform pattern
//  the group allows is h in class 8 or its conjugate 22, cell fluxes (-2/9, -2/9, 4/9). The field classes run: every
//  class whose nonzero cell fluxes all read open in STEP 2, and the least-flux class (least max |2 theta|, the lower
//  index on a tie) whatever it reads. Per field: magnetic period Q the least multiple of the order of h at least 8; the
//  links h^m read from the product table for every hop and class, each a group element, its complex trace equal to the
//  sum of the U(1) component phases (1e-9); the bulk window at every loop step's k2 where the 4-value read is open; and
//  wallFlow per distinct nonzero component flux (window 0.2, 24 steps, Lanczos 80) at L 12 and L 16.
// STEP 4 (decision 008, replacing the non-abelian sample, which is not built: a colour-blind k2 loop reads Tr p = 0). The
//  least-rough abelian fields: links h^(r1 G(a + r0 / 2)), G an integer function on integer and half-integer x0
//  (code/measure/wall-stream), h in class 8 and in class 22 (the least largest |eigenphase|). Lumpy (s 1): G(a + 1/2) =
//  G(a) + 1, G(a + 1) = G(a + 1/2), cell holonomy h in every cell, Q 9; dilute sheets s 2, 3, 4: h on one strip of every
//  s-th column, Q 9 s; component flux integers a period (-1, -1, 2) for class 8, (-2, 1, 1) for class 22. Per candidate:
//  every link a group element (product table) closing over the period; per distinct component the bulk window at 4 k2
//  (window 0.2) and its nearest bulk level; where every component is open, the bulk at all 24 loop k2; a gapped
//  candidate's per-component wallFlow at L 12 and L 16 (predicted A 4 p_c, B -4 p_c), a loop step whose search stalls
//  at Lanczos 80 rerun at 160 then 320 (the first gate attempt stalled at L 16 on near-degenerate wall pairs at pi and
//  read those steps as empty). DIAGNOSTIC, never a gate (008 point
//  7): a closed component whose nearest bulk level lies in (0.04, 0.2) also flows at half that distance, L 12.
//
// CONTROLS, any misread makes the verdict OPEN (instrument):
//  G   the gap threshold as decision 003 cites it: 1/15 and 1/9 open, 1/3 closed.
//  C1  SU(3): the Cartan field H = diag(1, -1, 0) at flux 1/15 per cell (Q 15): component +1 reads A +4 B -4, component
//      -1 A -4 B +4, component 0 A 0 B 0 (REGATED after the first run by decision 008 point 6 to the clause 003 point 5
//      fixed before it; its wall Weyl cone levels in the window are not gated); along H sum_c H_c A_c = Tr H^2 x 4 = 8.
//  E   the stream-parameterized Lanczos copy (wall-stream) fed slabStream's own stream at flux 1/15, L 12 reproduces
//      wall-face wallFlow exactly: A and B up and down, ambiguous counts equal, every level offset and wall weight within
//      1e-10.
//  C2  the uniform centre field (omega per cell, a Sigma(648) field): the U(1) flux 1/3 bulk is closed, and so is the walk
//      pattern of the centre on the links (h = omega^2, cell flux -2/3 on every component, |2/3| read in STEP 2).
//  C3  flat links (Q 1, p 0, L 12) flow 0 on both walls.
//  I   every gap search and every flow step complete, every eigen residual at most 1e-8, every link a group element with
//      trace deviation at most 1e-9, eigenphase projections integer to 1e-9.
//
// GATES, fixed 2026-10-08 before any run (item 0029):
//  PASS (route 1's hinge holds, colour breaks N_A): some Sigma(648) field keeps the bulk window empty at every loop step
//   and flows a nonzero integer on wall A, equal and opposite on wall B, the same at L 12 and L 16.
//  KILL (amended by decision 008 point 2, which only removes the clause "or flows 0"): every STEP 3 and STEP 4 field
//   with a nonzero component flux puts bulk levels in the window.
//  PARTIAL: a gapped nonzero flow that differs between L 12 and 16 or is not opposite on B, or a gapped field with
//   nonzero component flux that flows 0 (suspect the instrument).
//
// WHAT THIS CAN AND CANNOT SHOW. The abelian part is a lookup: Sigma(648)'s finest uniform link pattern against the
// measured gap threshold. It cannot show that no non-uniform or non-abelian Sigma(648) field keeps the gap (STEP 4), it
// samples the gap at loop momenta rather than certifying it between them, and it is one-body. Floats for every spectrum;
// exact only for the group (product-table indices, fractions).
//
// FIRST RUN 2026-10-08 (tmp/windex.log, 1016 s): OPEN, no gate moved, none rerun.
//  - STEP 1: order 648, 24 classes, projections integer to 3e-15, d_min 3 (classes 8 and 22, phases (-1/9, -1/9, 2/9)
//    and (-2/9, 1/9, 1/9)). Every class with a nonzero phase has a component of |phase| at least 2/9.
//  - STEP 2: open (0 levels, complete) at 1/18, 1/15, 1/12, 1/9, 1/6; closed at 2/9 (16, nearest 0.123), 1/4, 1/3
//    (nearest 0.010), 5/12, 4/9, 5/9, 2/3, 7/9, 5/6, 8/9, 1; unread 5/18, 7/18 (eigenphases only, no field needs them)
//    and 1/2 (16 levels, incomplete). The threshold lies between 1/6 and 2/9. G holds.
//  - STEP 3: no class has all its cell fluxes open, so only the least-flux class 8 ran (Q 9, 216 links, every one a
//    group element, trace deviation 4.6e-15): bulk closed at 2/9 and 4/9, so not gapped; read (L 12 only): cell -2/9 A -2
//    B +2 (16 ambiguous), cell 4/9 A 0 B 0.
//  - Controls: C1's flows hold (component +1 A +4 B -4, component -1 A -4 B +4, along H 8 = Tr H^2 x 4), but component 0
//    holds 18 window levels with flow 0: the field-free wall Weyl cone at |k| = 0.054 sits inside window 0.2, so the
//    brief's "no in-gap level" clause cannot hold on this instrument and C1 reads false. C2 true, C3 true (A 0 B 0), I
//    true. With C1 false and STEP 4 not run the verdict is OPEN; STEP 3 alone reads the KILL side (no abelian field
//    keeps the gap).
//
// SECOND RUN 2026-10-08 (decision 008's STEP 4 and C1 regate, tmp/wstream.log, sh tmp/wstream.sh run, 14774 s): PASS.
//  - STEP 4: the lumpy fields (s 1, Q 9) are closed (class 8 component 2/9: 16 levels, nearest 0.0872; class 22
//    component -2/9: nearest 0.0865), their half-distance diagnostic flows A 0 B 0. Every dilute sheet (s 2, 3, 4, both
//    classes, Q 18, 27, 36) keeps the bulk window empty at 4 k2 and at all 24 loop k2, and every component flows the
//    predicted 4 p_c on A and -4 p_c on B at L 12 and L 16: class 8 (-1/9: A -4 B +4; 2/9: A +8 B -8), class 22 (-2/9:
//    A -8 B +8; 1/9: A +4 B -4). 6 passing fields; links all group elements closing over the period (trace dev 2.5e-15).
//  - Controls: G, C1 (regated: +1 A +4 B -4, -1 A -4 B +4, 0 A 0 B 0, along H 8), C2, C3, E (copy equals wall-face:
//    A 4 B -4, ambiguous 0, worst level offset 0), I and I4 true.
//  - The colour-blind sum over a field's components is 0 (class 8: -4 - 4 + 8), as decision 008 point 5 says it must be.
//  - The first STEP 4 attempt read class-8 s 2 and s 3 component 2/9 at L 16 as A 0: Lanczos 80 stalled on the
//    near-degenerate wall pairs at pi and returned no levels there. Stalled steps are now rerun at 160, then 320.
//
// DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  bulkWindow,
  componentFlow,
  elementOrder,
  frac,
  fracKey,
  fracText,
  fracValue,
  linkPattern,
  loopK2,
  registerSets,
  sigma648,
  sigmaClasses,
  type BulkRead,
  type ComponentFlow,
  type Frac,
  type Momentum,
} from '@/code/measure/wall-index'
import {
  gBulkWindow,
  gComponentFlow,
  gLinkCheck,
  periodFlux,
  sheetG,
  wallADepths,
  wallFlowOn,
  type GBulkRead,
  type GComponentFlow,
  type GLinkCheck,
} from '@/code/measure/wall-stream'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { slabStream, type Slab } from '@/code/measure/wilson-register'

export type IndexPlan = {
  at: Momentum
  window: number
  gapK2: number
  loopSteps: number
  lanczosSteps: number
  depths: readonly number[]
  minSide: number
  controlFlux: Frac
  // STEP 4: the sheet spacings s (s 1 lumpy, 2 to 4 dilute) and the diagnostic's lower edge (decision 008 point 7)
  sheets: readonly number[]
  diagnosticFloor: number
  // STEP 4 flows: longer Krylov sizes for a loop step whose search stalled at lanczosSteps (rerun only then)
  retrySteps: readonly number[]
}

export const INDEX_PLAN: IndexPlan = {
  at: { k0: 0.02, k1: 0.05, k2Start: 0.013 },
  window: 0.2,
  gapK2: 4,
  loopSteps: 24,
  lanczosSteps: 80,
  depths: [12, 16],
  minSide: 8,
  controlFlux: frac(1, 15),
  sheets: [1, 2, 3, 4],
  diagnosticFloor: 0.04,
  retrySteps: [160, 320],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/wall-index',
  code: 'E-FRC-0291',
  title:
    'explores whether a Sigma(648) colour field can carry a wall index that breaks the one-wall member number: the register bulk gap stays open up to flux 1/6 per cell and closes at 2/9; the uniform and the lumpy group-valued fields close it, but dilute sheets of the order-9 element (h on one strip of every second to fourth column) keep it open and each colour component flows 4 p on wall A and -4 p on wall B at depths 12 and 16',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wallIndexRun(INDEX_PLAN)
  },
})

export function wallIndexRun(plan: IndexPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---------------- STEP 1: the class table ----------------
  const group = sigma648()
  const { classes, worst: projection } = sigmaClasses(group)
  const nonId = classes.filter(c => c.rep !== group.identity)
  const dMin = Math.min(...nonId.map(c => c.level))
  const leastPhase = Math.min(...nonId.map(c => fracValue(c.maxAbs)))
  const leastPhaseClasses = classes
    .map((c, i) => ({ c, i }))
    .filter(x => x.c.rep !== group.identity)
    .filter(x => fracValue(x.c.maxAbs) === leastPhase)
    .map(x => x.i)
  const classLine = classes
    .map(
      (c, i) =>
        `${i}: size ${c.size} order ${c.order} level ${c.level} phases (${c.phases.map(fracText).join(', ')}) cell (${c.cell.map(fracText).join(', ')})`,
    )
    .join('; ')

  log('STEP 1')

  // ---------------- STEP 2: the gap table ----------------
  const sets = registerSets()
  const gapK2 = loopK2(plan.at.k2Start, plan.gapK2)
  const fluxes = new Map<string, Frac>()

  for (const c of classes) {
    for (const f of [...c.phases, ...c.cell]) {
      if (f.num !== 0) {
        const a = frac(Math.abs(f.num), f.den)

        fluxes.set(fracKey(a), a)
      }
    }
  }

  const controls = [frac(1, 15), frac(1, 9), frac(1, 3)]

  for (const f of controls) {
    fluxes.set(fracKey(f), f)
  }

  const gaps = new Map<string, BulkRead>()

  for (const f of [...fluxes.values()].sort(
    (a, b) => fracValue(a) - fracValue(b),
  )) {
    gaps.set(
      fracKey(f),
      bulkWindow(
        sets,
        f,
        plan.at,
        gapK2,
        plan.window,
        plan.lanczosSteps,
      ),
    )
  }

  const gapOf = (f: Frac): BulkRead =>
    gaps.get(fracKey(frac(Math.abs(f.num), f.den)))!
  // open: no level in the window and the search complete (the certificate); closed: a level in the window with eigen
  // residual at most 1e-8; anything else is unread
  const open = (f: Frac): boolean => {
    const g = gapOf(f)

    return g.count === 0 && g.complete
  }
  const closed = (f: Frac): boolean => {
    const g = gapOf(f)

    return g.count > 0 && g.worstEigen <= 1e-8
  }
  const read = (f: Frac): boolean => open(f) || closed(f)
  const sortedFluxes = [...fluxes.values()].sort(
    (a, b) => fracValue(a) - fracValue(b),
  )
  const gapLine = sortedFluxes
    .map(f => {
      const g = gapOf(f)

      return `${fracText(f)}: ${g.count}${g.count ? ` (nearest ${g.nearest.toFixed(4)})` : ''}${g.complete ? '' : ' incomplete'}${read(f) ? '' : ' UNREAD'}`
    })
    .join(', ')
  const narrowestClosed = sortedFluxes.find(closed)
  const openBelow = sortedFluxes.filter(
    f =>
      open(f) &&
      (!narrowestClosed || fracValue(f) < fracValue(narrowestClosed)),
  )
  const widestOpen = openBelow[openBelow.length - 1]
  const G =
    open(controls[0]!) && open(controls[1]!) && closed(controls[2]!)

  log('STEP 2')

  // ---------------- STEP 3: the abelian fields ----------------
  const nonzero = (fs: readonly Frac[]): Frac[] =>
    fs.filter(f => f.num !== 0)
  const leastCell = Math.min(...nonId.map(c => fracValue(c.maxCell)))
  const leastIndex = classes.findIndex(
    c =>
      c.rep !== group.identity && fracValue(c.maxCell) === leastCell,
  )
  const fieldIndices = classes
    .map((c, i) => ({ c, i }))
    .filter(
      x =>
        x.c.rep !== group.identity &&
        (nonzero(x.c.cell).every(open) || x.i === leastIndex),
    )
    .map(x => x.i)

  type FieldRead = {
    index: number
    Q: number
    links: ReturnType<typeof linkPattern>
    gapped: boolean
    loopBulk: number
    flows: ComponentFlow[]
  }

  const fields: FieldRead[] = fieldIndices.map(index => {
    const c = classes[index]!
    const order = elementOrder(group, c.rep)
    const Q = order * Math.ceil(plan.minSide / order)
    const links = linkPattern(group, c.rep, c.cell, Q)
    const distinct = [
      ...new Map(nonzero(c.cell).map(f => [fracKey(f), f])).values(),
    ]
    const fourOpen = distinct.every(open)

    let loopBulk = 0

    if (fourOpen) {
      const k2s = loopK2(plan.at.k2Start, plan.loopSteps)

      for (const f of distinct) {
        loopBulk += bulkWindow(
          sets,
          frac(Math.abs(f.num), f.den),
          plan.at,
          k2s,
          plan.window,
          plan.lanczosSteps,
        ).count
      }
    }

    const gapped = fourOpen && loopBulk === 0
    // a field with bulk levels in the window is decided by its gap: its flow is read at the first depth only
    const depths = gapped ? plan.depths : plan.depths.slice(0, 1)
    const flows = depths.flatMap(L =>
      distinct.map(f => {
        const r = componentFlow(
          sets,
          f,
          Q,
          L,
          plan.at,
          plan.loopSteps,
          plan.window,
          plan.lanczosSteps,
        )

        log(
          `class ${index} cell ${fracText(f)} L ${L}: A ${r.flow.netA} B ${r.flow.netB}`,
        )

        return r
      }),
    )

    return {
      index,
      Q,
      links,
      gapped,
      loopBulk,
      flows,
    }
  })

  // ---------------- STEP 4: the least-rough abelian fields (decision 008) ----------------
  type ComponentGap = { theta: Frac; p: number; bulk: GBulkRead }
  type Diagnostic = { theta: Frac; nearest: number; flow: GComponentFlow }
  type SheetRead = {
    index: number
    s: number
    Q: number
    links: GLinkCheck
    p: number[]
    gaps: ComponentGap[]
    gapped: boolean
    loopBulk: number
    flows: GComponentFlow[]
    diagnostics: Diagnostic[]
  }

  const bulkOpen = (b: GBulkRead): boolean => b.count === 0 && b.complete
  const bulkClosed = (b: GBulkRead): boolean =>
    b.count > 0 && b.worstEigen <= 1e-8
  const sheets: SheetRead[] = leastPhaseClasses.flatMap(index =>
    plan.sheets.map(s => {
      const c = classes[index]!
      const Q = 9 * s
      const G = sheetG(s)
      const links = gLinkCheck(group, c.rep, c.phases, Q, G)
      const p = c.phases.map(f => periodFlux(f, Q, G))
      const distinct = [
        ...new Map(nonzero(c.phases).map(f => [fracKey(f), f])).values(),
      ]
      const gaps = distinct.map(theta => ({
        theta,
        p: periodFlux(theta, Q, G),
        bulk: gBulkWindow(
          sets,
          theta,
          Q,
          G,
          plan.at,
          gapK2,
          plan.window,
          plan.lanczosSteps,
        ),
      }))
      const fourOpen = gaps.every(g => bulkOpen(g.bulk))

      let loopBulk = 0

      if (fourOpen) {
        const k2s = loopK2(plan.at.k2Start, plan.loopSteps)

        for (const g of gaps) {
          loopBulk += gBulkWindow(
            sets,
            g.theta,
            Q,
            G,
            plan.at,
            k2s,
            plan.window,
            plan.lanczosSteps,
          ).count
        }
      }

      const gapped = fourOpen && loopBulk === 0
      const flows = gapped
        ? plan.depths.flatMap(L =>
            gaps.map(g => {
              const r = gComponentFlow(
                sets,
                g.theta,
                Q,
                G,
                L,
                plan.at,
                plan.loopSteps,
                plan.window,
                plan.lanczosSteps,
                plan.retrySteps,
              )

              log(
                `STEP 4 class ${index} s ${s} component ${fracText(g.theta)} L ${L}: A ${r.flow.netA} B ${r.flow.netB}`,
              )

              return r
            }),
          )
        : []
      // DIAGNOSTIC, never a gate (008 point 7): a closed component whose nearest bulk level lies in (floor, window) also
      // flows at half that distance, L 12
      const diagnostics = gapped
        ? []
        : gaps
            .filter(
              g =>
                g.bulk.count > 0 &&
                g.bulk.nearest > plan.diagnosticFloor &&
                g.bulk.nearest < plan.window,
            )
            .map(g => {
              const w = g.bulk.nearest / 2
              const flow = gComponentFlow(
                sets,
                g.theta,
                Q,
                G,
                plan.depths[0]!,
                plan.at,
                plan.loopSteps,
                w,
                plan.lanczosSteps,
                plan.retrySteps,
              )

              log(
                `STEP 4 diagnostic class ${index} s ${s} component ${fracText(g.theta)} window ${w.toFixed(4)}: A ${flow.flow.netA} B ${flow.flow.netB}`,
              )

              return { theta: g.theta, nearest: g.bulk.nearest, flow }
            })

      log(
        `STEP 4 class ${index} s ${s}: ${gaps.map(g => `${fracText(g.theta)} ${g.bulk.count} (nearest ${Number.isFinite(g.bulk.nearest) ? g.bulk.nearest.toFixed(4) : 'none'})`).join(', ')}, gapped ${gapped}`,
      )

      return {
        index,
        s,
        Q,
        links,
        p,
        gaps,
        gapped,
        loopBulk,
        flows,
        diagnostics,
      }
    }),
  )

  // ---------------- controls C1, C3 ----------------
  const H = [1, -1, 0]
  const cf = plan.controlFlux
  const c1 = H.map(h =>
    componentFlow(
      sets,
      frac(h * cf.num, cf.den),
      cf.den,
      plan.depths[0]!,
      plan.at,
      plan.loopSteps,
      plan.window,
      plan.lanczosSteps,
    ),
  )

  log('C1')

  const c3 = componentFlow(
    sets,
    frac(0, 1),
    1,
    plan.depths[0]!,
    plan.at,
    plan.loopSteps,
    plan.window,
    plan.lanczosSteps,
  )

  log('C3')

  // ---------------- control E: the stream-parameterized copy against wall-face ----------------
  // C1's component +1 is wall-face wallFlow at flux 1/15, Q 15, L 12; the copy is fed slabStream's own stream there
  const eRef = c1[0]!.flow
  const eSlab: Slab = {
    L: plan.depths[0]!,
    qa: cf.den,
    p: cf.num,
    profile: Array.from({ length: plan.depths[0]! }, (_, i) =>
      i < plan.depths[0]! / 2 ? 1 : 0,
    ),
  }
  const eCopy = wallFlowOn(
    eSlab,
    sets,
    K => slabStream(eSlab, K, DOCK_ROOTS),
    plan.at.k0,
    plan.at.k1,
    plan.at.k2Start,
    plan.loopSteps,
    wallADepths(plan.depths[0]!),
    plan.window,
    plan.lanczosSteps,
    plan.window,
  )
  const eOffset = eRef.steps.reduce((worst, st, t) => {
    const other = eCopy.steps[t]!

    if (other.levels.length !== st.levels.length) {
      return Infinity
    }

    return st.levels.reduce(
      (w, l, j) =>
        Math.max(
          w,
          Math.abs(l.offset - other.levels[j]!.offset),
          Math.abs(l.wallA - other.levels[j]!.wallA),
        ),
      worst,
    )
  }, 0)
  const E =
    eCopy.A.up === eRef.A.up &&
    eCopy.A.down === eRef.A.down &&
    eCopy.B.up === eRef.B.up &&
    eCopy.B.down === eRef.B.down &&
    eCopy.netA === eRef.netA &&
    eCopy.netB === eRef.netB &&
    eCopy.ambiguous === eRef.ambiguous &&
    eOffset <= 1e-10

  log('E')

  // C1 regated on flow after the data (decision 008 point 6, the clause 003 point 5 fixed before the run): component 0
  // flows A 0 B 0; its wall Weyl cone levels in the window are not gated
  const C1 =
    c1[0]!.flow.netA === 4 &&
    c1[0]!.flow.netB === -4 &&
    c1[1]!.flow.netA === -4 &&
    c1[1]!.flow.netB === 4 &&
    c1[2]!.flow.netA === 0 &&
    c1[2]!.flow.netB === 0
  const alongH = H.reduce((s, h, i) => s + h * c1[i]!.flow.netA, 0)
  const C2 = !open(frac(1, 3)) && !open(frac(2, 3))
  const C3 = c3.flow.netA === 0 && c3.flow.netB === 0

  // ---------------- instrument ----------------
  // a field whose bulk puts levels in the window is decided by its gap; its flow is read, never gated (with bulk
  // levels in the window the search need not complete)
  const allFlows = [
    ...fields.filter(f => f.gapped).flatMap(f => f.flows),
    ...c1,
    c3,
  ]
  const I =
    projection <= 1e-9 &&
    [
      ...controls,
      frac(2, 3),
      ...fields.flatMap(f => nonzero(classes[f.index]!.cell)),
    ].every(read) &&
    allFlows.every(r =>
      r.flow.steps.every(st => st.complete && st.eigenResidual <= 1e-8),
    ) &&
    fields.every(f => f.links.inGroup && f.links.worstTrace <= 1e-9)
  // STEP 4's instrument: every link a group element closing over the period, every component's bulk read open or
  // closed, every gated flow complete with eigen residual at most 1e-8
  const sheetFlows = sheets.flatMap(f => f.flows)
  const I4 =
    sheets.every(
      f =>
        f.links.inGroup &&
        f.links.closes &&
        f.links.worstTrace <= 1e-9 &&
        f.gaps.every(g => bulkOpen(g.bulk) || bulkClosed(g.bulk)),
    ) &&
    sheetFlows.every(r =>
      r.flow.steps.every(st => st.complete && st.eigenResidual <= 1e-8),
    )
  const controlsOk = G && C1 && C2 && C3 && E && I && I4

  // ---------------- the verdict ----------------
  const flowsAt = (f: FieldRead, L: number): ComponentFlow[] =>
    f.flows.filter(r => r.L === L)
  const passing = fields.filter(
    f =>
      f.gapped &&
      flowsAt(f, plan.depths[0]!).some((r, i) => {
        const other = flowsAt(f, plan.depths[1]!)[i]!

        return (
          r.flow.netA !== 0 &&
          r.flow.netB === -r.flow.netA &&
          other.flow.netA === r.flow.netA &&
          other.flow.netB === r.flow.netB
        )
      }),
  )
  const partialFields = fields.filter(
    f =>
      f.gapped &&
      !passing.includes(f) &&
      f.flows.some(r => r.flow.netA !== 0 || r.flow.netB !== 0),
  )
  const gappedZero = fields.filter(
    f =>
      f.gapped &&
      f.flows.every(r => r.flow.netA === 0 && r.flow.netB === 0),
  )
  // STEP 4 by the same gates: flows paired by component across the two depths
  const sheetAt = (f: SheetRead, L: number): GComponentFlow[] =>
    f.flows.filter(r => r.L === L)
  const sheetPassing = sheets.filter(
    f =>
      f.gapped &&
      sheetAt(f, plan.depths[0]!).some((r, i) => {
        const other = sheetAt(f, plan.depths[1]!)[i]!

        return (
          r.flow.netA !== 0 &&
          r.flow.netB === -r.flow.netA &&
          other.flow.netA === r.flow.netA &&
          other.flow.netB === r.flow.netB
        )
      }),
  )
  const sheetPartial = sheets.filter(
    f =>
      f.gapped &&
      !sheetPassing.includes(f) &&
      (f.flows.some(r => r.flow.netA !== 0 || r.flow.netB !== 0) ||
        f.flows.every(r => r.flow.netA === 0 && r.flow.netB === 0)),
  )
  // KILL (decision 008 point 2): every STEP 3 and STEP 4 field with a nonzero component flux puts bulk levels in the
  // window
  const kill =
    fields.every(f => !f.gapped) &&
    sheets.every(f => !f.gapped && f.gaps.some(g => bulkClosed(g.bulk)))
  const status: Verdict['status'] = !controlsOk
    ? 'open'
    : passing.length > 0 || sheetPassing.length > 0
      ? 'pass'
      : partialFields.length > 0 ||
          gappedZero.length > 0 ||
          sheetPartial.length > 0
        ? 'partial'
        : kill
          ? 'fail'
          : 'open'
  const sheetFlowText = (r: GComponentFlow): string =>
    `${fracText(r.theta)} p ${r.p} L ${r.L} window ${r.window.toFixed(4)}: A ${r.flow.netA} (up ${r.flow.A.up} down ${r.flow.A.down}) B ${r.flow.netB} (up ${r.flow.B.up} down ${r.flow.B.down}), ambiguous ${r.flow.ambiguous}, eigen ${r.flow.worstEigen.toExponential(1)}, complete ${r.flow.steps.every(s => s.complete)}`
  const sheetLine = sheets
    .map(
      f =>
        `class ${f.index} s ${f.s} (Q ${f.Q}, p (${f.p.join(', ')}), ${f.links.links} links in group ${f.links.inGroup} closing ${f.links.closes}, trace dev ${f.links.worstTrace.toExponential(1)}): bulk ${f.gaps.map(g => `${fracText(g.theta)} ${g.bulk.count}${g.bulk.complete ? '' : ' incomplete'} nearest ${Number.isFinite(g.bulk.nearest) ? g.bulk.nearest.toFixed(4) : 'none'}`).join(', ')}; gapped ${f.gapped}${f.gapped ? `, loop bulk ${f.loopBulk}; flows ${f.flows.map(sheetFlowText).join('; ')}` : ''}${f.diagnostics.length ? `; diagnostic (logged, never gated) ${f.diagnostics.map(d => sheetFlowText(d.flow)).join('; ')}` : ''}`,
    )
    .join(' | ')
  const flowText = (r: ComponentFlow): string =>
    `cell ${fracText(r.cell)} Q ${r.Q} p ${r.p} L ${r.L}: A ${r.flow.netA} (up ${r.flow.A.up} down ${r.flow.A.down}) B ${r.flow.netB} (up ${r.flow.B.up} down ${r.flow.B.down}), ambiguous ${r.flow.ambiguous}, eigen ${r.flow.worstEigen.toExponential(1)}, complete ${r.flow.steps.every(s => s.complete)}`
  const fieldLine = fields
    .map(
      f =>
        `class ${f.index} (cell ${classes[f.index]!.cell.map(fracText).join(', ')}, Q ${f.Q}, ${f.links.links} links in group ${f.links.inGroup}, trace dev ${f.links.worstTrace.toExponential(1)}, gapped ${f.gapped}${f.gapped ? `, loop bulk ${f.loopBulk}` : ''}): ${f.flows.map(flowText).join('; ')}`,
    )
    .join(' | ')
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `STEP 1: order ${group.order}, ${classes.length} classes, d_min ${dMin}, least largest |eigenphase| ${leastPhaseClasses.map(i => `class ${i} (${classes[i]!.phases.map(fracText).join(', ')})`).join(' and ')}; finest walk pattern class ${leastIndex} (cell ${classes[leastIndex]!.cell.map(fracText).join(', ')}). STEP 2 (bulk levels within ${plan.window} of pi): ${gapLine}; widest open ${widestOpen ? fracText(widestOpen) : 'none'}, narrowest closed ${narrowestClosed ? fracText(narrowestClosed) : 'none'}. STEP 3: ${fieldLine}. STEP 4 (G sheets): ${sheetLine}. Controls: G ${G}, C1 ${C1} (regated on flow, 008 point 6: ${c1.map(flowText).join('; ')}; along H ${alongH}), C2 ${C2}, C3 ${C3} (${flowText(c3)}), E ${E} (copy A ${eCopy.netA} B ${eCopy.netB} ambiguous ${eCopy.ambiguous} against A ${eRef.netA} B ${eRef.netB} ambiguous ${eRef.ambiguous}, worst offset ${eOffset.toExponential(1)}), I ${I}, I4 ${I4}.${status === 'fail' ? ' KILL at window 0.2: every STEP 3 and STEP 4 field with a nonzero component flux puts bulk levels in the window.' : ''}`,
    metrics: {
      order: group.order,
      classes: classes.length,
      dMin,
      projection,
      widestOpen: widestOpen ? fracValue(widestOpen) : 0,
      narrowestClosed: narrowestClosed ? fracValue(narrowestClosed) : 0,
      finestCellFlux: leastCell,
      fields: fields.length,
      gappedFields: fields.filter(f => f.gapped).length,
      passing: passing.length + sheetPassing.length,
      sheets: sheets.length,
      gappedSheets: sheets.filter(f => f.gapped).length,
      G: flag(G),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      E: flag(E),
      I: flag(I),
      I4: flag(I4),
      eOffset,
      alongH,
      seconds,
    },
    control: {
      G: flag(G),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      E: flag(E),
      instrument: flag(I && I4),
    },
    notes: `L2. Class table: ${classLine}. Window ${plan.window}, (k0, k1) = (${plan.at.k0}, ${plan.at.k1}), k2Start ${plan.at.k2Start}, ${plan.gapK2} gap k2 values, ${plan.loopSteps} loop steps, Lanczos ${plan.lanczosSteps}. ${seconds.toFixed(0)} s.`,
  })
}
