// Frozen coset walls on the coset-union hub vacuum, under B' (E-RLT-0095).
//
// THE QUESTION. E-RLT-0092 found that the hub vacuum under L makes a frozen wall one dock thick wherever a spatial
// coset of its symmetry that keeps the hub lattice (C, g, gC, the translation 2 r0) meets the vacuum: every trit of the
// core taken from one side or the other, the same at every beat, passing B'. Does the coset-union vacuum of E-RLT-0093
// (every L' dock a hub, every root dock storing its frame's four lines, oriented under 2T and one element) keep them?
//
// THE ARGUMENT, before the run. The union runs as four hub vacua that share no slot (E-RLT-0093 U0). A planted coset
// maps the union's store to its image, and so each part to a part of the image: four walls, one per part, laid on top
// of each other. If the four parts never meet at a dock, each freezes as E-RLT-0092's did, and so does the union.
// They meet where a core dock holds single lines of two different parts at once: L then applies K there, which moves
// lines and melts. E-RLT-0092's cores hold spliced vibes, so singles at the core are possible. NOT predicted.
//
// THE READER (code/measure/union-walls): the planted run, the vacuum and the image vacuum in lockstep, a dock's own
// ideal the vacuum outside and the image inside; departing = not holding the own ideal over a window of 6 beats; E =
// the docks with a neighbor across the interface; B' = departing inside E at every window and never growing. It is
// E-RLT-0092's B' with the ideal fixed to the two planted ground states (at least as strict). The interface is the
// plane of basis coordinate 0 at 6 (and, by the torus, at 0), side 12, windows from beat 72 to 192.
//
// THE CASES, each (g, t, c) about the box origin then t, the image store planted inside:
//  C    charge conjugation (identity, 0, -1)
//  g    the least element of W(F4) outside the vacuum's kept group, about the hub (t = hub - g hub), c = +1
//  gC   the same with c = -1
//  2r0  the translation by twice the first root (keeps every class of D4 / 2 D4)
//  r0   the translation by the first root (sends hubs onto root docks; E-RLT-0092's melting case, a control)
//
// Gates, fixed before this file's first run (no probe of this reader was run on the union before it):
//  W0 the reader (integer+0): the vacuum planted against itself departs nowhere at any window; on the hub vacuum, C
//     and 2r0 pass B' and r0 does not (E-RLT-0092's verdicts, reproduced by this stricter reader); a lone love planted
//     at a dock three layers deep inside the union's C case makes B' fail (departing outside E)
//  W  per start of E-MTH-0028's 17: on the coset-union vacuum, C, g, gC and 2r0 pass B'
// Verdict: pass if W0 holds and W holds on every start; fail if W0 holds and W fails on some start; partial if W0
// does not hold (the reader is not calibrated).
// Beside, never gates: r0 on the union; per case the end docks, the departing docks at the last window (holding the
// other side's history, or neither), whether the departing set is frozen, and the husk columns departing outside E.
//
// FIRST RUN (220 s, tmp/rlt095-run1.log): pass, no gate moved, every number identical over the 17 starts. W0 holds:
// the vacuum against itself departs on 0 docks; the hub vacuum reproduces E-RLT-0092 (C and 2r0 pass with a frozen
// core of exactly 432 docks at every window, r0 departs on 20,592 to 20,634 docks, 13,728 to 13,758 outside E, on
// 1,152 husk columns); a lone love three layers deep in the union's C case departs on 8 docks outside E (on 8
// columns) at every window, so B' fails as it must. W holds: C, gC and 2r0 freeze into a core of 1,728 docks (four
// times the hub's 432: one core per part) and g into 1,458, every one holding NEITHER side's history, the same at all
// 20 windows, 0 docks and 0 husk columns outside E, 0 growth. r0 melts (every dock departs, 13,824 outside E on 1,152
// columns). DISCLOSED: E here is every dock with a neighbor across the interface (6,912 docks, the two layers beside
// each interface), wider than E-RLT-0092's ideal-wall end docks (2,052 for 2r0 there); the cores measured sit inside
// both. The core's trits are not described by this reader (E-RLT-0092's is), so "one side's value, nothing novel" is
// not claimed here. Title written after the run.
//
// DETERMINISM: no random numbers. Starts are E-MTH-0028's family. Every count is an exact integer. Depth L2. Husk
// first: the husk columns holding a departing dock outside E are the gated number (a column holds one exactly when
// the bulk count is positive, so the verdicts agree and only the numbers differ).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { makeBounceKernel } from '@/code/measure/bounce-pair-kernel'
import { boxHusk } from '@/code/measure/causal-components'
import { storeImage } from '@/code/measure/coset-walls'
import { orientedHub, type CoinData } from '@/code/measure/varying-vacuum'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates, d4Vector } from '@/code/substrate/d4-box'
import { baseHub, coinsOnce, orientedUnion, storeOfKind, type StoreKind } from '@/code/measure/dense-hub'
import { readWall, type WallReading } from '@/code/measure/union-walls'

const SIDE = 12
const FROM = 72
const TO = 192
const WINDOW = 6
const CASES = ['C', 'g', 'gC', '2r0', 'r0'] as const
const GATED = ['C', 'g', 'gC', '2r0'] as const

type CaseName = (typeof CASES)[number]

const R0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])

// g applied to a basis-coordinate point, through its doubled matrix on the standard vector
function actBasis(coins: CoinData, g: number, basis: readonly number[]): number[] {
  const v = d4Vector([...basis])
  const w = (coins.doubled[g] as number[][]).map(row => row.reduce((s, x, k) => s + x * (v[k] as number), 0) / 2)

  return d4Coordinates(w)
}

function imageOf(coins: CoinData, name: CaseName, store: Int8Array, hub: readonly number[], g: number): Int8Array {
  const identity = coins.table.identity

  if (name === 'C') return storeImage(coins, SIDE, store, identity, -1, [0, 0, 0, 0])
  if (name === '2r0') return storeImage(coins, SIDE, store, identity, 1, R0.map(v => 2 * v))
  if (name === 'r0') return storeImage(coins, SIDE, store, identity, 1, R0)

  const gh = actBasis(coins, g, hub)
  const t = hub.map((v, k) => v - (gh[k] as number))

  return storeImage(coins, SIDE, store, g, name === 'gC' ? -1 : 1, t)
}

type Setup = { kernel: ReturnType<typeof makeBounceKernel>; layout: Int8Array; column: Int32Array; columns: number; inside: Uint8Array; hub: number[] }

function setupOf(): Setup {
  const weave = makeColorWeave({ side: SIDE, table: 'bind' })
  const husk = boxHusk(weave.mesh, SIDE)
  const inside = Uint8Array.from({ length: weave.mesh.cellCount }, (_, x) => ((d4BoxCoordinates({ cell: x, side: SIDE })[0] ?? 0) >= SIDE / 2 ? 1 : 0))

  return { kernel: makeBounceKernel(weave, 'lone'), layout: separatedLayout(weave), column: husk.column, columns: husk.columns, inside, hub: baseHub(SIDE, 0) }
}

function readCase(coins: CoinData, s: Setup, which: StoreKind, name: CaseName, g: number, edit?: (r: { vibe: Int8Array }) => void): WallReading {
  const store = storeOfKind(which, SIDE, s.hub)

  return readWall({ kernel: s.kernel, layout: s.layout, store, image: imageOf(coins, name, store, s.hub, g), inside: s.inside, column: s.column, columns: s.columns, from: FROM, to: TO, window: WINDOW, edit })
}

const leastOutside = (coins: CoinData, group: readonly number[]): number => {
  for (let g = 0; g < coins.table.permutations.length; g++) if (!group.includes(g)) return g

  return -1
}

export default experiment({
  id: 'relativity/union-walls',
  code: 'E-RLT-0095',
  title:
    "frozen coset walls on the coset-union vacuum, pass: planted against the vacuum and its image run in lockstep (B', departure only on docks beside the interface and never growing), the four lattice-keeping cosets C, g, gC and 2 r0 freeze on all 17 starts into cores of 1,728, 1,458, 1,728 and 1,728 docks (for C, gC and 2 r0 the hub's 432 four times over, one per independent part) that hold neither side's history, the same at all 20 windows, 0 of 1,728 husk columns departing outside; the translation r0 melts (13,824 docks on 1,152 columns outside); the reader reproduces E-RLT-0092 on the hub vacuum (C and 2 r0 cores of 432, r0 melting) and fails a lone love planted three layers deep (8 docks outside)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const coins = coinsOnce()
    const gUnion = leastOutside(coins, orientedUnion(coins).group)
    const gHub = leastOutside(coins, orientedHub(coins).group)

    // ---- W0 at integer+0 ----
    const s0 = setupOf()
    const unionStore = storeOfKind('union', SIDE, s0.hub)
    const self = readWall({ kernel: s0.kernel, layout: s0.layout, store: unionStore, image: unionStore, inside: s0.inside, column: s0.column, columns: s0.columns, from: FROM, to: TO, window: WINDOW })
    const hubC = readCase(coins, s0, 'hub', 'C', gHub)
    const hub2r0 = readCase(coins, s0, 'hub', '2r0', gHub)
    const hubR0 = readCase(coins, s0, 'hub', 'r0', gHub)
    const deep = d4BoxCell({ coordinates: [9, 6, 6, 6], side: SIDE })
    const defect = readCase(coins, s0, 'union', 'C', gUnion, r => {
      r.vibe[deep * 24 + 3] = 1
    })
    const w0 = self.departing.every(v => v === 0) && hubC.passes && hub2r0.passes && !hubR0.passes && !defect.passes

    log('W0')

    // ---- W per start ----
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const s = setupOf()
        const cases = Object.fromEntries(CASES.map(name => [name, readCase(coins, s, 'union', name, gUnion)])) as Record<CaseName, WallReading>

        log(`start ${member.name}`)

        return { name: member.name, cases }
      }),
    )

    const passing = (name: CaseName): number => perStart.filter(p => p.cases[name].passes).length
    const w = perStart.every(p => GATED.every(name => p.cases[name].passes))
    const status = w0 ? (w ? 'pass' : 'fail') : 'partial'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (name: CaseName, f: (r: WallReading) => number): string => range(perStart.map(p => f(p.cases[name])))
    const maxOf = (xs: number[]): number => Math.max(0, ...xs)
    const caseLine = (name: CaseName): string =>
      `${name}: passes on ${passing(name)} of ${family.length}; E ${over(name, r => r.endDocks)} docks; departing at the last window ${over(name, r => r.departing[r.departing.length - 1] ?? 0)} (other side's history ${over(name, r => r.holdsOther)}, neither ${over(name, r => r.holdsNeither)}); OUTSIDE E, husk columns (worst window) ${over(name, r => maxOf(r.outsideColumns))} of 1728, bulk docks ${over(name, r => maxOf(r.outside))} of 20736; grew ${over(name, r => maxOf(r.grew))}; frozen on ${perStart.filter(p => p.cases[name].frozen).length}`
    const metrics: Record<string, number> = { gateW0: w0 ? 1 : 0, gateW: w ? 1 : 0, starts: family.length, gUnion, gHub }

    for (const name of CASES) {
      metrics[`${name}_passing`] = passing(name)
      metrics[`${name}_outsideColumnsMax`] = Math.max(...perStart.map(p => maxOf(p.cases[name].outsideColumns)))
      metrics[`${name}_outsideDocksMax`] = Math.max(...perStart.map(p => maxOf(p.cases[name].outside)))
      metrics[`${name}_departingLastMax`] = Math.max(...perStart.map(p => p.cases[name].departing[p.cases[name].departing.length - 1] ?? 0))
      metrics[`${name}_endDocks`] = perStart[0]?.cases[name].endDocks ?? 0
      metrics[`${name}_frozen`] = perStart.filter(p => p.cases[name].frozen).length
    }

    metrics.seconds = (Date.now() - started) / 1000

    const describe = (r: WallReading): string => `passes ${r.passes}, departing ${JSON.stringify(r.departing)}, outside ${JSON.stringify(r.outside)} (columns ${JSON.stringify(r.outsideColumns)}), frozen ${r.frozen}, other ${r.holdsOther}, neither ${r.holdsNeither}`

    return verdict({
      status,
      claim: `on the coset-union vacuum, the lattice-keeping cosets C, g, gC and 2r0 ${w ? 'freeze into walls confined to their end docks on every start' : 'do not all pass B\''} (${GATED.map(name => `${name} ${passing(name)} of ${family.length}`).join(', ')}); r0 passes on ${passing('r0')}; the reader reproduces E-RLT-0092 on the hub vacuum (C ${hubC.passes}, 2r0 ${hub2r0.passes}, r0 ${hubR0.passes})`,
      metrics,
      control: {
        selfDeparting: maxOf(self.departing),
        hubC: hubC.passes ? 1 : 0,
        hubCDepartingLast: hubC.departing[hubC.departing.length - 1] ?? 0,
        hub2r0: hub2r0.passes ? 1 : 0,
        hubR0: hubR0.passes ? 1 : 0,
        hubR0OutsideMax: maxOf(hubR0.outside),
        defect: defect.passes ? 1 : 0,
        defectOutsideMax: maxOf(defect.outside),
      },
      notes: `L2. Gates: W0 ${w0} (self ${maxOf(self.departing)} departing; hub C ${describe(hubC)}; hub 2r0 ${describe(hub2r0)}; hub r0 ${describe(hubR0)}; union C with a deep lone love ${describe(defect)}), W ${w}. g for the union ${gUnion}, for the hub ${gHub}. ${CASES.map(caseLine).join('. ')}. At integer+0: ${CASES.map(name => `${name} ${describe(perStart[0]!.cases[name])}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
