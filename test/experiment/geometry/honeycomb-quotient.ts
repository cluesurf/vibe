// THE FINITE QUOTIENT of the {3,4,3,4} honeycomb modulo (3 + sqrt 2) (item vibe-roadmap-honeycomb-0008, gates
// pre-registered in the item's `what` before any probe). Code: code/substrate/coxeter/quotient-3434.ts. Spec:
// audit.md section 3.3 and note/honeycomb-transfer-radius.md section 6.
//
// Q1 size. |G_7| (the reflections) and |K_7| (the 24 transports), exact by a deterministic Schreier-Sims chain;
//    |G_7| divides |O(5, 7)| = 553,190,400; |K_7 cap H_7| (H = W(F4), sifted through K_7's chain) times |G_7| / 1152
//    is |K_7|; and K_7 cap H_7 contains the normal closure of the cusp twists, as u^7 = 1 mod 7 predicts.
//    Escalate if |K_7| > 2,000,000.
// Q2 systole. The largest r <= 4 whose reduced r-ball equals the honeycomb's labelled r-ball (tables entry for entry
//    up to radius 3, shells and same-shell edges at radius 4). Escalate if under 4.
// Q3 the cusp torus. The layer frames U(n) for n in [0, 14)^3 are distinct in K_7 and U(n) = 1 only on 14 Z^3: a
//    cubic 3-torus of side 14, not 7 (a unit cusp step twists the labels).
// Q4 the rule. When |K_7| fits, the quotient is a mesh the rule takes, and 96 beats run forward and back exactly
//    with charge, count and C kept, on the stand-in store.
//
// Under keys 3 a dock is a block, never a point. Under keys 2 the quotient is an instrument, not the present: the
// present is the whole infinite honeycomb, and the quotient holds its states that repeat under the congruence kernel.

import { performance } from 'node:perf_hooks'
import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import {
  buildQuotient3434,
  cuspTorus,
  orthogonalOrder,
  quotientOrders,
  quotientSystole,
  type Quotient3434,
} from '@/code/substrate/coxeter/quotient-3434'
import { SLOT_CLASS } from '@/code/substrate/coxeter/exact-ball-mesh'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  lockedTables,
  sameConfiguration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  baseHub,
  classOf as boxClassOf,
  storeOfKind,
} from '@/code/measure/dense-hub'
import {
  laws,
  vacuumConfiguration,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import { vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const SLOTS = 24
const LINES = 12
const MAX_DOCKS = 2000000
const REDUCE = { prime: 7, sqrtTwo: 4 }

export type QuotientOptions = {
  // the largest radius of the systole test, and the largest at which the exact ball's table is compared
  systoleRadius: number
  exactRadius: number
  beats: number
}

export const LAPTOP: QuotientOptions = { systoleRadius: 4, exactRadius: 3, beats: 96 }

function bijective(tables: LockedTables): boolean {
  const seen = new Uint8Array(tables.target.length)
  let ok = true

  for (let i = 0; i < tables.target.length; i++) {
    const t = tables.target[i]!

    ok &&= seen[t] === 0 && tables.source[t] === i
    seen[t] = 1
  }

  return ok
}

// the stand-in store of exact-cusp's experiment: the held (class, line) pattern of the box's union store, every sign
// +1, read through a breadth-first class assignment (the class map need not be well defined on the quotient)
function standInStore(q: Quotient3434): Int8Array {
  const side = 4
  const hub = baseHub(side, 0)
  const boxStore = storeOfKind('union', side, hub)
  const held = new Uint8Array(16 * LINES)

  for (let x = 0; x < side ** 4; x++) {
    const c = boxClassOf(x, side, hub)

    for (let l = 0; l < LINES; l++) {
      if (boxStore[x * LINES + l] !== 0) {
        held[c * LINES + l] = 1
      }
    }
  }

  const classOf = new Uint8Array(q.cells)
  const assigned = new Uint8Array(q.cells)

  assigned[0] = 1

  for (let x = 0; x < q.cells; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = q.table[x * SLOTS + k]!

      if (!assigned[y]) {
        assigned[y] = 1
        classOf[y] = classOf[x]! ^ SLOT_CLASS[k]!
      }
    }
  }

  const baseClass = SLOT_CLASS[LINE_FIRSTS[0]!]!
  const store = new Int8Array(q.cells * LINES)

  for (let x = 0; x < q.cells; x++) {
    for (let l = 0; l < LINES; l++) {
      store[x * LINES + l] = held[(classOf[x]! ^ baseClass) * LINES + l] ? 1 : 0
    }
  }

  return store
}

// exported for E-GMT-0043 (honeycomb-subgroup-search), which gates the same rule on its winning quotient
export function ruleRun(q: Quotient3434, beats: number): {
  bijective: boolean
  lawBreaks: number
  cBreaks: number
  notBack: number
  secondsPerBeat: number
} {
  const weave = makeColorWeave({ mesh: q.mesh, table: 'bind' })
  const tables = lockedTables(weave, 'pass')
  const layout = separatedLayout(weave)
  const store = standInStore(q)
  let lawBreaks = 0
  let cBreaks = 0
  let notBack = 0
  let seconds = 0

  for (const threshold of [THRESHOLD_KEEP, THRESHOLD_EXCHANGE]) {
    const vacuum = toWords(vacuumConfiguration({ cells: q.cells, store, layout }, 'all'))
    const conjugate = toWords(
      vacuumConfiguration(
        { cells: q.cells, store: Int8Array.from(store, v => -v), layout },
        'all',
      ),
    )
    const run = vetoPathRunner('none', tables, vacuum, threshold, 0, true)
    const crun = vetoPathRunner('none', tables, conjugate, threshold, 0, true)
    const l0 = laws(vacuum)
    const t0 = performance.now()

    for (let t = 0; t < beats; t++) {
      run.beat()
      crun.beat()

      const s = run.state()
      const c = crun.state()
      const l = laws(s)

      lawBreaks += l[0] !== l0[0] || l[1] !== l0[1] ? 1 : 0

      let off = 0

      for (let i = 0; i < s.vibe.length && off === 0; i++) {
        off += s.vibe[i] !== -c.vibe[i]! || (s.vibe[i] !== 0 && s.point[i] !== c.point[i]) ? 1 : 0
      }

      for (let i = 0; i < s.store.length && off === 0; i++) {
        off += s.store[i] !== -c.store[i]! || (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i]) ? 1 : 0
      }

      cBreaks += off > 0 ? 1 : 0
    }

    seconds = Math.max(seconds, (performance.now() - t0) / 1000 / beats / 2)

    for (let t = 0; t < beats; t++) {
      run.back()
    }

    notBack += sameConfiguration(run.state(), vacuum) ? 0 : 1
  }

  return { bijective: bijective(tables), lawBreaks, cBreaks, notBack, secondsPerBeat: seconds }
}

export function honeycombQuotient(options: QuotientOptions): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)
  const cell = exactCell()

  // ---- Q1 ----
  const orders = quotientOrders(REDUCE, cell)
  const bound = orthogonalOrder(REDUCE.prime)
  const divides = bound % orders.groupOrder === 0
  const indexConsistent = orders.frameMeetsCell * orders.cellQuotient === orders.frameOrder
  const closureDivides = orders.frameMeetsCell % orders.twistClosure === 0
  const q1Consistent =
    divides && indexConsistent && closureDivides && orders.twistsInFrames && orders.unipotentPeriod
  const fits = orders.frameOrder <= MAX_DOCKS

  log(`Q1 |G_7| ${orders.groupOrder} (orbits ${orders.chains.group.orbitSizes.join(' ')}), |K_7| ${orders.frameOrder} (orbits ${orders.chains.frames.orbitSizes.join(' ')}), |K_7 cap H_7| ${orders.frameMeetsCell}, twist closure ${orders.twistClosure}, cell quotient ${orders.cellQuotient}, |O(5,7)| / |G_7| ${bound / orders.groupOrder}, u^7 = 1 ${orders.unipotentPeriod}, twists in K_7 ${orders.twistsInFrames}`)

  // ---- Q2 ----
  const systole = quotientSystole(REDUCE, options.systoleRadius, options.exactRadius, cell)

  log(`Q2 reduced shells ${systole.reducedShells.join(', ')}; ${systole.rows.map(r => `r=${r.radius} tables ${r.tablesEqual} shells ${r.shellsEqual} same-shell edges ${r.sameShellEdges}`).join('; ')}; systole ${systole.systole}`)

  // ---- Q3 ----
  const torus = cuspTorus(REDUCE, cell)
  const axisSide14 = torus.axisPeriods.every(k => k === 14)
  // with n in [0, 14)^3 the only n with U(n) = 1 is 0, so the kernel list is empty when the lattice is 14 Z^3
  const torusCubic14 = torus.kernel.length === 0 && torus.distinct && axisSide14

  log(`Q3 cusp torus: axis periods ${torus.axisPeriods.join(', ')}, nonzero kernel points in [0,14)^3 ${torus.kernel.length}, layer frames distinct ${torus.distinct} (${torus.layerDocks}), cubic side 14 ${torusCubic14}`)

  // ---- Q4 ----
  let rule: ReturnType<typeof ruleRun> | undefined

  if (fits) {
    const q = buildQuotient3434({ reduce: REDUCE, maxDocks: MAX_DOCKS, cell })

    rule = ruleRun(q, options.beats)
    log(`Q4 ${q.cells} docks, ${options.beats} beats: bijective ${rule.bijective}, law breaks ${rule.lawBreaks}, C breaks ${rule.cBreaks}, not back ${rule.notBack}`)
  } else {
    log(`Q4 not run: |K_7| ${orders.frameOrder} > ${MAX_DOCKS}`)
  }

  const q4 = rule
    ? rule.bijective && rule.lawBreaks === 0 && rule.cBreaks === 0 && rule.notBack === 0
    : false
  const escalate = !fits || systole.systole < 4
  const status = !q1Consistent || !torusCubic14 ? 'fail' : escalate ? 'open' : q4 ? 'pass' : 'fail'

  return verdict({
    status,
    claim: `the {3,4,3,4} honeycomb's frame group K reduced modulo (3 + sqrt 2) is a finite group K_7 of ${orders.frameOrder} elements, ${orders.frameMeetsCell} times the cell quotient |G_7| / 1152 = ${orders.cellQuotient}, because a unit cusp translation u has u^7 = 1 mod 7 while its label twist h is an involution, so h = u^7 h^-1 lies in K_7; each cusp layer closes into a cubic 3-torus of side 14; the Cayley graph's systole is ${systole.systole}${fits ? '' : `; at more than ${MAX_DOCKS} docks it is not built (escalated)`}`,
    metrics: {
      groupOrder: orders.groupOrder,
      orthogonalIndex: bound / orders.groupOrder,
      frameOrder: orders.frameOrder,
      frameMeetsCell: orders.frameMeetsCell,
      twistClosure: orders.twistClosure,
      cellQuotient: orders.cellQuotient,
      systole: systole.systole,
      reducedShell2: systole.reducedShells[2] ?? -1,
      reducedShell3: systole.reducedShells[3] ?? -1,
      reducedShell4: systole.reducedShells[4] ?? -1,
      torusSide: torus.axisPeriods[0] ?? -1,
      torusLayerDocks: torus.layerDocks,
      ruleLawBreaks: rule?.lawBreaks ?? -1,
      ruleCBreaks: rule?.cBreaks ?? -1,
      ruleNotBack: rule?.notBack ?? -1,
      seconds: seconds(),
    },
    notes:
      'L1 (an instrument, exact). Gates pre-registered in vibe-roadmap-honeycomb-0008 before any probe. Orders are exact (deterministic Schreier-Sims on F_7^5). The congruence kernel is not inside K (it holds u^7, whose label image is the twist), so the label-consistent quotient is a |K_7 cap H_7|-fold cover of the cell quotient. Status open = the item escalates (size or systole), not a failed measurement.',
  })
}

export default experiment({
  id: 'geometry/honeycomb-quotient',
  code: 'E-GMT-0042',
  title:
    'the {3,4,3,4} honeycomb modulo (3 + sqrt 2): the frame group K_7 by exact Schreier-Sims, its overlap with W(F4) forced by the cusp twists (u^7 = 1 mod 7), the cusp layers as cubic 3-tori of side 14, and the systole of its Cayley graph',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return honeycombQuotient(LAPTOP)
  },
})
