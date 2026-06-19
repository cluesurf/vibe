// 0C tested (plans/bound-body-base-modifications), a REST slot gives a persistent bound IDENTITY and the energy
// scale a self needs. The bare single-speed substrate has no way to tell a bound (slow) excitation from a free
// (fast) one, every structure either disperses or is pinned. Adding ONE zero-speed coin direction (the rest slot,
// a discrete enrichment of the mesh, no new field or tone) fixes both at once.
//
//   - A rest body (charges in the rest slot) NEVER streams, so it stays exactly localized, a persistent identity,
//     which the bare substrate could not hold (bodies dispersed).
//   - The energy scale works, a MOVING disturbance added to the body streams away and the bath absorbs it (the
//     open difference falls to zero) while the rest body is untouched, on the closed torus it persists. So the
//     body sheds a free disturbance, a real piece of agency.
//
// What it still does NOT give, self-repair. A DISPLACED rest charge (moved to a neighbour) stays displaced, there
// is no restoring force to pull it back, because the rest slot supplies the energy scale but not an attraction. So
// 0C upgrades identity from disperses to persists-and-sheds, and the one remaining gap, pulling a displaced part
// back, is purely the attraction (1A gauge, or the arrow). This is the furthest a single discrete enrichment gets.
//
// Depth L2, the rest slot, a persistent bound identity with an energy scale that radiates free disturbances, but
// no self-repair without an added attraction.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import {
  run,
  beatInto,
  streamSourceTable,
} from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

export default experiment({
  id: 'selves/rest-slot-identity',
  title:
    'a rest slot gives a persistent bound identity that radiates free disturbances (0C), self-repair still needs attraction',
  category: 'selves',
  substrates: ['3434-rest'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 30
    const coin: Mesh = d4MeshWithRest({ side })
    const base: Mesh = d4Mesh({ side })
    const degree = coin.degree
    const rest = degree - 1
    const opposite = Array.from({ length: degree }, (_, d) =>
      coin.opposite(d),
    )
    const rule = headOnRotate({ opposite })
    const table = streamSourceTable(coin) // precompute the stream gather once, reused for every beat
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

    // 1. the rest body persists exactly (a bound identity).
    let body = restBody()
    const start = extent(body)
    body = run(body, rule, beats)
    const end = extent(body)
    const persists = end.occ === start.occ && end.ext === start.ext

    // 2. a moving disturbance radiates to the bath (open) while the rest body is untouched.
    const withDisturbance = (): Will => {
      const w = cloneWill(restBody())
      for (let d = 0; d < 8; d++) {
        w.data[center * degree + d] = 1
      }
      return w
    }
    const diff = (open: boolean): { peak: number; final: number } => {
      let clean = restBody(),
        pert = withDisturbance()
      let peak = 0,
        final = 0
      let cleanScratch: Will = {
        mesh: coin,
        data: new Int8Array(clean.data.length),
      }
      let pertScratch: Will = {
        mesh: coin,
        data: new Int8Array(pert.data.length),
      }
      for (let t = 0; t < beats; t++) {
        beatInto({
          src: clean,
          dst: cleanScratch,
          table,
          collision: rule,
        })
        {
          const s = clean
          clean = cleanScratch
          cleanScratch = s
        }
        beatInto({
          src: pert,
          dst: pertScratch,
          table,
          collision: rule,
        })
        {
          const s = pert
          pert = pertScratch
          pertScratch = s
        }
        if (open) {
          absorbBoundary(clean)
          absorbBoundary(pert)
        }
        let d = 0
        for (let i = 0; i < clean.data.length; i++) {
          if (clean.data[i] !== pert.data[i]) {
            d++
          }
        }
        if (d > peak) {
          peak = d
        }
        final = d
      }
      return { peak, final }
    }
    const open = diff(true)
    const closed = diff(false)
    const radiatesFreeDisturbance = open.final === 0 && closed.final > 0

    // 3. a displaced rest charge does NOT return (no self-repair without attraction).
    const displaced = (): Will => {
      const w = cloneWill(restBody())
      const nb = base.neighbour(center, 0)
      w.data[center * degree + rest] = 0
      w.data[nb * degree + rest] = 1
      return w
    }
    let dsp = displaced()
    let cleanBody = restBody()
    let dspScratch: Will = {
      mesh: coin,
      data: new Int8Array(dsp.data.length),
    }
    let cleanBodyScratch: Will = {
      mesh: coin,
      data: new Int8Array(cleanBody.data.length),
    }
    let displacedFinal = 0
    for (let t = 0; t < beats; t++) {
      beatInto({ src: dsp, dst: dspScratch, table, collision: rule })
      {
        const s = dsp
        dsp = dspScratch
        dspScratch = s
      }
      beatInto({
        src: cleanBody,
        dst: cleanBodyScratch,
        table,
        collision: rule,
      })
      {
        const s = cleanBody
        cleanBody = cleanBodyScratch
        cleanBodyScratch = s
      }
      let d = 0
      for (let i = 0; i < dsp.data.length; i++) {
        if (dsp.data[i] !== cleanBody.data[i]) {
          d++
        }
      }
      displacedFinal = d
    }
    const noSelfRepair = displacedFinal > 0

    const ok = persists && radiatesFreeDisturbance && noSelfRepair
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a single zero-speed coin direction (the rest slot, a discrete enrichment of the mesh) gives the substrate an energy scale and a persistent bound identity, a rest body never streams so it stays exactly localized (occupied and extent unchanged), which the bare single-speed substrate could not hold, and a moving (free) disturbance added to it radiates to the bath on the open lattice (the difference falls to zero) while persisting on the closed torus, so the body sheds free disturbances, but a DISPLACED rest charge stays displaced (no restoring force), so the rest slot supplies identity and the energy scale but not self-repair, which still needs an added attraction',
      metrics: {
        startOccupied: start.occ,
        endOccupied: end.occ,
        startExtent: start.ext,
        endExtent: end.ext,
        disturbanceOpenFinal: open.final,
        disturbanceClosedFinal: closed.final,
        displacedFinal,
        persists: persists ? 1 : 0,
        radiatesFreeDisturbance: radiatesFreeDisturbance ? 1 : 0,
        noSelfRepair: noSelfRepair ? 1 : 0,
        beats,
      },
      control: { disturbanceClosedFinal: closed.final, displacedFinal },
      notes:
        'the furthest a single discrete enrichment gets. The rest slot (0C) upgrades identity from disperses (bare substrate) to persists-and-sheds-free-disturbances, with an energy scale separating bound (rest) from free (moving). The one remaining gap is self-repair (a displaced part returning), which is purely the attraction, 1A gauge or the arrow. So the full self = rest slot (identity, energy scale) + attraction (self-repair)',
    })
  },
})
