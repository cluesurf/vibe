// POSITIVE CONTROL, the full self when the one missing ingredient (attraction) is added. This proves two things:
// the test harness DOES detect a complete self (identity, self-repair, radiation) when it is present, so the
// negatives elsewhere are trustworthy, and ATTRACTION is precisely the missing ingredient, add it and everything
// works. The attraction used here is an explicit, non-local CHEAT (isolated charges hop toward the body centroid),
// it is NOT a base rule, the legitimate version must come from a longer-range rule (0A) or a gauge field (1A).
//
// Ingredients, the rest slot (0C, a zero-speed coin direction giving a persistent identity and the energy scale)
// plus the explicit attraction. Together they give all three properties of a self.
//   1. IDENTITY, the rest body stays exactly localized (occupied and extent unchanged).
//   2. SELF-REPAIR, a piece broken off far from the body RETURNS (the displaced extent collapses back to the body
//      extent), the restoring force the bare base lacked.
//   3. RADIATION, a moving disturbance still sheds to the bath (open difference falls to zero) while persisting on
//      the closed torus.
//
// So a complete discrete self is POSSIBLE, and the bare five things are missing exactly one thing, an attraction.
// The honest open work is to get that attraction from a legitimate discrete source (0A or 1A), not this cheat.
//
// Depth L2, the positive control, rest slot plus an explicit attraction give identity, self-repair, and radiation.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

export default experiment({
  id: 'selves/full-self-positive-control',
  code: 'E-SLF-0052',
  title:
    'positive control: rest slot plus an (explicit, cheat) attraction give a full self (identity, self-repair, radiation)',
  category: 'selves',
  substrates: ['3434-rest'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 40
    const coin: Mesh = d4MeshWithRest({ side })
    const base: Mesh = d4Mesh({ side })
    const degree = coin.degree
    const rest = degree - 1
    const opposite = Array.from({ length: degree }, (_, d) =>
      coin.opposite(d),
    )

    const rule = headOnRotate({ opposite })
    const half = side / 2
    const coord = (c: number): [number, number, number, number] => [
      c % side,
      Math.floor(c / side) % side,
      Math.floor(c / (side * side)) % side,
      Math.floor(c / (side * side * side)) % side,
    ]

    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    // the EXPLICIT attraction (a cheat, positive control only). An isolated rest charge (separated from the bulk)
    // hops one step toward the body's rest centroid. Bulk charges (many rest neighbours) stay, so no collapse.
    const accrete = (will: Will): void => {
      const q = new Array<number>(coin.cellCount)

      let total = 0,
        sx = 0,
        sy = 0,
        sz = 0,
        sw = 0

      for (let c = 0; c < coin.cellCount; c++) {
        const n = will.data[c * degree + rest]!

        q[c] = n

        if (n > 0) {
          const [x, y, z, w] = coord(c)

          total += n
          sx += n * x
          sy += n * y
          sz += n * z
          sw += n * w
        }
      }

      if (total === 0) {
        return
      }

      const cx = sx / total,
        cy = sy / total,
        cz = sz / total,
        cw = sw / total

      const moves: [number, number][] = []

      for (let c = 0; c < coin.cellCount; c++) {
        if (q[c]! <= 0) {
          continue
        }

        let nearby = 0

        for (let d = 0; d < 24; d++) {
          nearby += q[base.neighbour(c, d)]!
        }

        if (nearby >= 3) {
          continue
        }
        // bulk stays, no collapse

        let bestNb = -1,
          bestDist = Infinity

        for (let d = 0; d < 24; d++) {
          const nb = base.neighbour(c, d)
          const [x, y, z, w] = coord(nb)
          const dd =
            (x - cx) ** 2 +
            (y - cy) ** 2 +
            (z - cz) ** 2 +
            (w - cw) ** 2

          if (dd < bestDist) {
            bestDist = dd
            bestNb = nb
          }
        }

        if (bestNb >= 0) {
          moves.push([c, bestNb])
        }
      }

      for (const [from, to] of moves) {
        if (will.data[from * degree + rest]! > 0) {
          will.data[from * degree + rest] = 0
          will.data[to * degree + rest] =
            will.data[to * degree + rest]! + 1
        }
      }
    }

    const restBody = (): Will => {
      const will = makeWill(coin)

      for (let c = 0; c < coin.cellCount; c++) {
        const [x, y, z, w] = coord(c)

        if (
          (x - half) ** 2 +
            (y - half) ** 2 +
            (z - half) ** 2 +
            (w - half) ** 2 <=
          4
        ) {
          will.data[c * degree + rest] = 1
        }
      }

      return will
    }

    const extent = (will: Will): { occ: number; ext: number } => {
      let occ = 0,
        ext = 0

      for (let c = 0; c < coin.cellCount; c++) {
        const b = c * degree

        let on = false

        for (let d = 0; d < degree; d++) {
          if (will.data[b + d] !== 0) {
            on = true
            break
          }
        }

        if (on) {
          occ++

          const [x, y, z, w] = coord(c)
          const dd =
            Math.abs(x - half) +
            Math.abs(y - half) +
            Math.abs(z - half) +
            Math.abs(w - half)

          if (dd > ext) {
            ext = dd
          }
        }
      }

      return { occ, ext }
    }

    const table = streamSourceTable(coin) // precompute the stream gather once, reused for every beat

    // one full step, allocation-free, beat src into dst via the table then accrete and absorb in place. dst becomes
    // the new state, the caller ping-pongs src and dst. Identical result to beat then accrete then absorb.
    const stepFull = (src: Will, dst: Will, open: boolean): Will => {
      beatInto({ src, dst, table, collision: rule })
      accrete(dst)

      if (open) {
        absorbBoundary(dst)
      }

      return dst
    }

    const scratchOf = (will: Will): Will => ({
      mesh: coin,
      data: new Int8Array(will.data.length),
    })

    // 1. identity, the body persists.
    let body = restBody()
    let bodyScratch = scratchOf(body)

    const startBody = extent(body)

    for (let t = 0; t < beats; t++) {
      const next = stepFull(body, bodyScratch, false)

      bodyScratch = body
      body = next
    }

    const endBody = extent(body)
    const persists =
      endBody.occ === startBody.occ && endBody.ext === startBody.ext

    // 2. self-repair, a piece broken off far returns (its extent collapses back to the body extent).
    const farDisplaced = (): Will => {
      const w = cloneWill(restBody())

      let nb = center

      for (let k = 0; k < 4; k++) {
        nb = base.neighbour(nb, 0)
      }

      w.data[center * degree + rest] = 0
      w.data[nb * degree + rest] = 1

      return w
    }

    let displaced = farDisplaced()
    let displacedScratch = scratchOf(displaced)

    const displacedStart = extent(displaced).ext

    for (let t = 0; t < beats; t++) {
      const next = stepFull(displaced, displacedScratch, false)

      displacedScratch = displaced
      displaced = next
    }

    const displacedEnd = extent(displaced).ext
    const selfRepairs =
      displacedStart > startBody.ext + 2 &&
      displacedEnd <= startBody.ext + 1

    // 3. radiation, a moving disturbance sheds to the bath (open) and persists on the closed torus.
    const withDisturbance = (): Will => {
      const w = cloneWill(restBody())

      for (let d = 0; d < 8; d++) {
        w.data[center * degree + d] = 1
      }

      return w
    }

    const diff = (open: boolean): number => {
      let clean = restBody(),
        pert = withDisturbance()

      let cleanScratch = scratchOf(clean),
        pertScratch = scratchOf(pert)

      let final = 0

      for (let t = 0; t < beats; t++) {
        const nc = stepFull(clean, cleanScratch, open)

        cleanScratch = clean
        clean = nc

        const np = stepFull(pert, pertScratch, open)

        pertScratch = pert
        pert = np

        let d = 0

        for (let i = 0; i < clean.data.length; i++) {
          if (clean.data[i] !== pert.data[i]) {
            d++
          }
        }

        final = d
      }

      return final
    }

    const openFinal = diff(true)
    const closedFinal = diff(false)
    const radiates = openFinal === 0 && closedFinal > 0

    const ok = persists && selfRepairs && radiates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a complete discrete self is possible when an attraction is added to the rest slot, the rest body persists exactly (identity), a piece broken off far from the body returns as the explicit attraction pulls it back (self-repair, the displaced extent collapses to the body extent), and a moving disturbance still sheds to the bath on the open lattice while persisting on the closed torus (radiation), so the test harness detects a full self when one is present and the bare five things are missing exactly one ingredient, an attraction, the attraction used here is an explicit non-local cheat (a positive control), the legitimate version must come from a longer-range rule or a gauge field',
      metrics: {
        bodyStartOccupied: startBody.occ,
        bodyEndOccupied: endBody.occ,
        bodyStartExtent: startBody.ext,
        bodyEndExtent: endBody.ext,
        displacedStartExtent: displacedStart,
        displacedEndExtent: displacedEnd,
        radiationOpenFinal: openFinal,
        radiationClosedFinal: closedFinal,
        persists: persists ? 1 : 0,
        selfRepairs: selfRepairs ? 1 : 0,
        radiates: radiates ? 1 : 0,
        beats,
      },
      control: {
        displacedStartExtent: displacedStart,
        displacedEndExtent: displacedEnd,
      },
      notes:
        'positive control with an explicit attraction (a cheat). It proves the harness detects a full self (identity, self-repair, radiation) and that attraction is the precise missing ingredient. NOT a base solution, the attraction is non-local and hand-built. The legitimate attraction must come from 0A (longer-range rule) or 1A (gauge field). With the rest slot (0C) for identity and energy scale already legitimate and discrete, the whole problem reduces to sourcing this one attraction discretely',
    })
  },
})
