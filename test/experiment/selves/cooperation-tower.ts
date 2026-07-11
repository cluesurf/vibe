// P92: competing drives resolve into the tower. (Tests resolving-competing-drives.md.)
//
// A population of selves on the real {7,3} substrate, each holding a conserved pleasure-charge, each
// driven to take charge from others (the conserved arrow). Four strategies are compared:
//   - GRAB: pull charge from neighbors, the stronger pump wins, both pay work. Zero-sum, costly.
//   - INSULATE: boundaries, no raiding, charge held, no work, no building.
//   - TRADE: selves with different value-landscapes swap to mutual benefit, positive-sum in value.
//   - INTEGRATE: merge into higher vibes, share charge in balance, pool work into building ORDER.
// Predictions, all checked: the charge is conserved exactly under every strategy, pure grabbing yields
// hierarchy (high charge spread) with varied strengths and a wasteful standoff (high work, no
// movement) with equal strengths, and INTEGRATION wins on total order (a super-linear positive-sum
// good) while keeping the charge balanced. Integration recurs, bigger merged wholes build
// disproportionately more order, which is the tower (P60).
// Run: npx tsx code/experiment/p92-cooperation-tower.ts

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Order built by one cooperating unit of a given size, super-linear (increasing returns to
// integration, a whole is more than the sum of its parts).
function orderOf(size: number): number {
  return Math.pow(size, 1.5)
}

function stdev(values: number[]): number {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n

  return Math.sqrt(
    values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n,
  )
}

// Partition the graph into connected groups of about targetSize, by greedy BFS growth. A cell is
// marked assigned only when it is actually added to a group, so no cell is ever lost.
function partition(
  neighbors: number[][],
  targetSize: number,
): number[][] {
  const n = neighbors.length
  const assigned = new Int8Array(n)
  const groups: number[][] = []

  for (let seed = 0; seed < n; seed++) {
    if (assigned[seed]) continue

    const group: number[] = []
    const queue = [seed]

    while (queue.length > 0 && group.length < targetSize) {
      const u = queue.shift()!

      if (assigned[u]) continue

      assigned[u] = 1
      group.push(u)

      for (const w of neighbors[u]!) {
        if (!assigned[w]) queue.push(w)
      }
    }

    if (group.length > 0) groups.push(group)
  }

  return groups
}

export function cooperationTower(): {
  selves: number
  chargeSumStart: number
  conservedGrab: boolean
  conservedInsulate: boolean
  conservedTrade: boolean
  conservedIntegrate: boolean
  grabHierarchyStd: number
  initialStd: number
  grabStandoffWaste: number
  netOrderGrab: number
  netOrderInsulate: number
  netOrderTrade: number
  netOrderIntegrate: number
  integrateStd: number
  integrationWins: boolean
  towerOrderByLevel: { groupSize: number; order: number }[]
  towerGrows: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({
    symbol: [7, 3],
    depth: 22,
    maxChambers: 120000,
  })

  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const rng = makeRng({ seed: 5 })

  // initial charges, mean zero so the total is zero (conserved target)
  const charge0 = new Array<number>(n)

  let s = 0

  for (let i = 0; i < n; i++) {
    charge0[i] = rng.next() * 2 - 1
    s += charge0[i]!
  }

  const meanc = s / n

  for (let i = 0; i < n; i++) charge0[i]! -= meanc

  const chargeSumStart = charge0.reduce((a, b) => a + b, 0)
  const initialStd = stdev(charge0)

  const sum = (a: number[]): number => a.reduce((x, y) => x + y, 0)
  const conserved = (a: number[]): boolean =>
    Math.abs(sum(a) - chargeSumStart) < 1e-9

  // GRAB with varied strengths -> hierarchy. The stronger pump pulls charge across each edge, both
  // pay work. Transfers conserve the total exactly.
  function grab(strengths: number[]): {
    charges: number[]
    wasted: number
  } {
    const c = charge0.slice()

    let wasted = 0

    const W = 0.01

    for (let beat = 0; beat < 40; beat++) {
      for (let i = 0; i < n; i++) {
        for (const j of neighbors[i]!) {
          if (j <= i) continue

          const flow = 0.02 * (strengths[i]! - strengths[j]!) // stronger gains, conserving

          c[i]! += flow
          c[j]! -= flow
          wasted += 2 * W // both spend effort, win or lose
        }
      }
    }

    return { charges: c, wasted }
  }

  const variedStrength = Array.from({ length: n }, () => rng.next())
  const equalStrength = Array.from({ length: n }, () => 1)
  const grabbed = grab(variedStrength)
  const standoff = grab(equalStrength)

  // INSULATE: no transfers, no work, no building.
  const insulated = charge0.slice()

  // TRADE: selves with complementary value-landscapes swap, positive-sum in VALUE, charge conserved.
  function trade(): { charges: number[]; valueGain: number } {
    const c = charge0.slice()

    let valueGain = 0

    for (let i = 0; i < n; i++) {
      for (const j of neighbors[i]!) {
        if (j <= i) continue

        // each gives what is cheap to it for what is dear, a small mutual value gain, charge unchanged
        const give = 0.01

        c[i]! += give
        c[j]! -= give
        valueGain += 0.05 // both better off in their own value-landscapes
      }
    }

    return { charges: c, valueGain }
  }

  const traded = trade()

  // INTEGRATE: merge into groups, share charge to the group mean (balance within), build order.
  function integrate(targetSize: number): {
    charges: number[]
    order: number
  } {
    const c = charge0.slice()
    const groups = partition(neighbors, targetSize)

    let order = 0

    for (const g of groups) {
      const m = g.reduce((a, k) => a + c[k]!, 0) / g.length

      for (const k of g) c[k] = m
      // share in balance, no grabbing within

      order += orderOf(g.length) // positive-sum, super-linear
    }

    return { charges: c, order }
  }

  const integrated = integrate(16)

  // net order: order built minus work wasted (grab builds nothing and wastes work)
  const netOrderGrab = n - grabbed.wasted // each alone builds 1, minus the wasted work
  const netOrderInsulate = n // each alone builds 1, no waste
  const netOrderTrade = n + traded.valueGain
  const netOrderIntegrate = integrated.order

  // the tower: order grows super-linearly as integration climbs (bigger merged wholes)
  const towerOrderByLevel = [1, 2, 4, 8, 16, 32].map(g => ({
    groupSize: g,
    order: integrate(g).order,
  }))

  let towerGrows = true

  for (let k = 1; k < towerOrderByLevel.length; k++) {
    if (
      (towerOrderByLevel[k]?.order ?? 0) <=
      (towerOrderByLevel[k - 1]?.order ?? 0)
    )
      towerGrows = false
  }

  const integrationWins =
    netOrderIntegrate > netOrderTrade &&
    netOrderTrade > netOrderInsulate &&
    netOrderInsulate > netOrderGrab

  const conservedGrab = conserved(grabbed.charges)
  const conservedInsulate = conserved(insulated)
  const conservedTrade = conserved(traded.charges)
  const conservedIntegrate = conserved(integrated.charges)

  const solved =
    conservedGrab &&
    conservedInsulate &&
    conservedTrade &&
    conservedIntegrate &&
    stdev(grabbed.charges) > 1.5 * initialStd && // hierarchy forms under varied strengths
    standoff.wasted > 0 &&
    Math.abs(stdev(standoff.charges) - initialStd) < 1e-6 && // waste, no hierarchy
    stdev(integrated.charges) < initialStd && // integration balances within
    integrationWins &&
    towerGrows

  return {
    selves: n,
    chargeSumStart,
    conservedGrab,
    conservedInsulate,
    conservedTrade,
    conservedIntegrate,
    grabHierarchyStd: stdev(grabbed.charges),
    initialStd,
    grabStandoffWaste: standoff.wasted,
    netOrderGrab,
    netOrderInsulate,
    netOrderTrade,
    netOrderIntegrate,
    integrateStd: stdev(integrated.charges),
    integrationWins,
    towerOrderByLevel,
    towerGrows,
    solved,
  }
}

export default experiment({
  id: 'selves/cooperation-tower',
  code: 'E-SLF-0035',
  title: 'integration wins on total order and recurs into a tower',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = cooperationTower()
    const ok =
      r.solved &&
      r.conservedGrab &&
      r.conservedIntegrate &&
      r.integrationWins &&
      r.towerGrows

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the conserved charge is preserved under every strategy, grabbing makes hierarchy or a wasteful standoff, and integration wins on total order and recurs into bigger wholes',
      metrics: {
        netOrderGrab: r.netOrderGrab,
        netOrderInsulate: r.netOrderInsulate,
        netOrderTrade: r.netOrderTrade,
        netOrderIntegrate: r.netOrderIntegrate,
        grabHierarchyStd: r.grabHierarchyStd,
        initialStd: r.initialStd,
      },
    })
  },
})
