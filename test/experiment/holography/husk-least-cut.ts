// LEAST CUTS IN THE BULK UNDER A HUSK REGION (E-HLG-0038, route H11b, OPEN-GRV-10). Ryu and Takayanagi's area is the
// least cut through the bulk under a boundary region; if a code on the bulk realizes it, the region's entropy equals the
// cut, and the route asks whether on the true {3,4,3,4} mesh the least cut under a husk region scales as the region's
// boundary. Kill, named in advance: "the least cut does not scale as the region's boundary".
//
// WHAT IS CUT. The mesh's cells below one cusp (code/measure/cusp-green buildCuspQuotient, every cell at Busemann level
// at most the floor), unfolded over a periodic W^3 box of husk windows. Every link has capacity 1. The source is the
// husk cells of a cube A of side R, the sink every other husk cell; the least cut is the max flow (Dinic), certified by
// the residual graph: the links leaving the source side number exactly the flow.
//
// DERIVED BEFORE THE GATE RUN. The husk is the top layer of the mesh (E-GRV-0150): each husk cell has 6 husk links
// and 18 down links, and the bulk below only widens (a cell at level l takes horizontal steps of 1/l; a window holds
// about 0.66 l^2 cells a level). Cutting A's 6R^2 husk boundary links and all 18 R^3 down links of A's cells separates
// A, so the least cut is at most 18 R^3 + 6 R^2, a volume law. A cut deeper in the bulk crosses more links (the layers
// widen), so the bound should be the least cut on a deep enough floor; a shallow floor removes bulk paths and can make
// the cut smaller, an artifact of the floor.
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/mc-cut-probe1.ts, under a minute): floor 5 reads 18, 120, 378, 768, 1242, 1824
// at R = 1 to 6 (volume law up to R = 3, then about 50 R^2); floors 9 and 17 read 168, 1248, 4104, 9600 at R = 2, 4, 6, 8,
// = 18 R^3 + 6 R^2 exactly, and at R = 10 floor 9 reads 16,176 and floor 17 reads 18,600 = 18,000 + 600. So P1 below
// was seen before the gates; the certificate and the control are new.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every flow is certified (the residual graph's source side is crossed by exactly the flow's number of
//     links), and the quotient is exact (0 missing neighbours, 0 inconsistent steps).
//  C1 CONTROL (the cut can be an area): with the floor at the husk (floor 1, no bulk) the least cut is 6 R^2 exactly at
//     every R, the boundary of the cube.
//  H1 THE ROUTE: at floor 17 the least cut over R^2 is one constant within 10 percent over R = 4 to 10.
//  P1 THE KILL (the derivation): at floor 17 the least cut is exactly 18 R^3 + 6 R^2 at R = 2, 4, 6, 8, 10: the down links
//     of the region, a volume law.
//  R  READ: floor 9's cut against the bound at each R (the floor artifact).
// VERDICT, fixed before the run: FAIL (the route's kill, as derived) when I1, C1 and P1 hold; PASS when I1, C1 and H1
//  hold; PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. Unit capacities on the cell graph below a cusp; it says nothing of a code that would
//  make the cut an entropy, and nothing of horospheres deeper in the bulk, where the bulk lies on both sides.
//
// FIRST RUN 2026-10-02 (tmp/lc-hlg-run1.log, 63 s): FAIL, the route's kill as derived, every gate as registered. I1:
//  every flow certified, the quotients exact. C1: 6 R^2 with no bulk. P1: at floor 17 the least cut is 168, 1248, 4104,
//  9600, 18600 at R = 2 to 10, exactly 18 R^3 + 6 R^2. H1 fails: cut / R^2 grows 78, 114, 150, 186. Floor 9 reads the
//  bound to R = 8 and 16,176 at R = 10, the floor artifact.
//
// Depth L1: exact max flow with a certificate.
// DETERMINISM: fixed geometry; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  buildCuspQuotient,
  type CuspQuotient,
} from '@/code/measure/cusp-green'

// Dinic's max flow on undirected unit-capacity edges from a source set to a sink set, with the certificate
function leastCut(
  n: number,
  edges: Int32Array,
  source: Uint8Array,
  sink: Uint8Array,
): { flow: number; certified: boolean } {
  const m = edges.length / 2
  const head = new Int32Array(n).fill(-1)
  const next = new Int32Array(2 * m)
  const to = new Int32Array(2 * m)
  const cap = new Int8Array(2 * m)

  for (let e = 0; e < m; e++) {
    const u = edges[2 * e]!
    const v = edges[2 * e + 1]!

    to[2 * e] = v
    cap[2 * e] = 1
    next[2 * e] = head[u]!
    head[u] = 2 * e
    to[2 * e + 1] = u
    cap[2 * e + 1] = 1
    next[2 * e + 1] = head[v]!
    head[v] = 2 * e + 1
  }

  const level = new Int32Array(n)
  const cursor = new Int32Array(n)
  const queue = new Int32Array(n)

  const bfs = (): boolean => {
    level.fill(-1)

    let qh = 0
    let qt = 0
    let reached = false

    for (let i = 0; i < n; i++) {
      if (source[i]) {
        level[i] = 0
        queue[qt++] = i
      }
    }

    while (qh < qt) {
      const u = queue[qh++]!

      if (sink[u]) {
        reached = true
        continue
      }

      for (let e = head[u]!; e >= 0; e = next[e]!) {
        if (cap[e]! > 0 && level[to[e]!]! < 0) {
          level[to[e]!] = level[u]! + 1
          queue[qt++] = to[e]!
        }
      }
    }

    return reached
  }

  const push = (u: number): boolean => {
    if (sink[u]) {
      return true
    }

    for (; cursor[u]! >= 0; cursor[u] = next[cursor[u]!]!) {
      const e = cursor[u]!
      const v = to[e]!

      if (
        cap[e]! > 0 &&
        level[v] === level[u]! + 1 &&
        !source[v] &&
        push(v)
      ) {
        cap[e] = cap[e]! - 1
        cap[e ^ 1] = cap[e ^ 1]! + 1

        return true
      }
    }

    return false
  }

  let flow = 0

  while (bfs()) {
    cursor.set(head)

    for (let i = 0; i < n; i++) {
      if (source[i]) {
        while (push(i)) {
          flow++
        }
      }
    }
  }

  // certificate: the source side of the residual graph is crossed by exactly `flow` original links
  bfs()

  let crossing = 0

  for (let e = 0; e < m; e++) {
    const u = edges[2 * e]!
    const v = edges[2 * e + 1]!

    if (level[u]! >= 0 !== level[v]! >= 0) {
      crossing++
    }
  }

  return { flow, certified: crossing === flow }
}

function cutAt(
  q: CuspQuotient,
  R: number,
): { flow: number; certified: boolean; nodes: number } {
  const W = R + 6
  const husk = Array.from(q.level).indexOf(1)
  const n = q.cells * W ** 3
  const id = (a: number, x: number, y: number, z: number): number =>
    ((x * W + y) * W + z) * q.cells + a
  const wrap = (v: number): number => ((v % W) + W) % W
  const edges: number[] = []

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < W; y++) {
      for (let z = 0; z < W; z++) {
        for (let a = 0; a < q.cells; a++) {
          for (let d = 0; d < 24; d++) {
            const e = 24 * a + d
            const b = q.neighbour[e]!

            if (b < 0) {
              continue
            }

            const u = id(a, x, y, z)
            const v = id(
              b,
              wrap(x + q.shift[3 * e]!),
              wrap(y + q.shift[3 * e + 1]!),
              wrap(z + q.shift[3 * e + 2]!),
            )

            if (u < v) {
              edges.push(u, v)
            }
          }
        }
      }
    }
  }

  const source = new Uint8Array(n)
  const sink = new Uint8Array(n)
  const lo = 3

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < W; y++) {
      for (let z = 0; z < W; z++) {
        const inside =
          x >= lo &&
          x < lo + R &&
          y >= lo &&
          y < lo + R &&
          z >= lo &&
          z < lo + R

        if (inside) {
          source[id(husk, x, y, z)] = 1
        } else {
          sink[id(husk, x, y, z)] = 1
        }
      }
    }
  }

  return {
    ...leastCut(n, Int32Array.from(edges), source, sink),
    nodes: n,
  }
}

export function huskLeastCutRun(): Verdict {
  const started = Date.now()
  const sizes = [2, 4, 6, 8, 10]
  const floors = [1, 9, 17]
  const cuts = new Map<number, number[]>()
  const metrics: Record<string, number> = {}

  let i1 = true

  for (const f of floors) {
    const q = buildCuspQuotient(f)

    i1 &&= q.missing === 0 && q.inconsistent === 0

    const row: number[] = []

    for (const R of sizes) {
      const c = cutAt(q, R)

      i1 &&= c.certified
      row.push(c.flow)
      metrics[`cut_floor${f}_R${R}`] = c.flow
    }

    cuts.set(f, row)
  }

  const bound = (R: number): number => 18 * R ** 3 + 6 * R ** 2
  const c1 = sizes.every((R, k) => cuts.get(1)![k] === 6 * R * R)
  const deep = cuts.get(17)!
  const p1 = sizes.every((R, k) => deep[k] === bound(R))
  const perArea = sizes
    .map((R, k) => deep[k]! / (R * R))
    .filter((_, k) => sizes[k]! >= 4)
  const meanArea = perArea.reduce((a, b) => a + b, 0) / perArea.length
  const h1 = perArea.every(v => Math.abs(v / meanArea - 1) < 0.1)
  const status =
    i1 && c1 && p1 ? 'fail' : i1 && c1 && h1 ? 'pass' : 'partial'
  const shallow = cuts.get(9)!

  return verdict({
    status,
    claim: `${p1 ? 'the least cut under a husk region is a volume, not an area' : 'the least cut under a husk region was read'}: on the true {3,4,3,4} mesh below a cusp (floor 17) the max flow from a husk cube of side R to the rest of the husk is ${deep.join(', ')} at R = ${sizes.join(', ')}, ${p1 ? 'exactly' : 'against'} 18 R^3 + 6 R^2, the 18 down links of every cell of the region and its husk boundary, because the bulk below the husk only widens; the same instrument reads 6 R^2 with no bulk (${c1 ? 'the control' : 'control failed'}), and a floor at level 9 cuts less at R = 10 (${shallow[shallow.length - 1]} against ${bound(10)}), a floor artifact`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      meanCutOverArea: meanArea,
      ...metrics,
      seconds: (Date.now() - started) / 1000,
    },
    control: { huskOnly: c1 ? 1 : 0 },
    notes: `L1. Gates I1 ${i1}, C1 ${c1}, H1 ${h1} (cut / R^2 at R 4 to 10: ${perArea.map(v => v.toFixed(1)).join(', ')}), P1 ${p1}. Floor 9: ${shallow.join(', ')}; bound ${sizes.map(bound).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'holography/husk-least-cut',
  code: 'E-HLG-0038',
  title:
    'the least cut in the bulk under a husk region is a volume, not an area, fail as derived (the route kill): on the true {3,4,3,4} mesh below a cusp (floor 17) the certified max flow from a husk cube of side R to the rest of the husk is 168, 1248, 4104, 9600, 18600 at R = 2 to 10, exactly 18 R^3 + 6 R^2, the 18 down links of every cell of the region plus its husk boundary, because the husk is the top layer and the bulk below only widens, so a minimal surface hugs the husk; with no bulk the same instrument reads the area 6 R^2, and a floor at level 9 cuts less at R = 10 (16,176), a floor artifact; no Ryu-Takayanagi area law under the cusp husk',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return huskLeastCutRun()
  },
})
