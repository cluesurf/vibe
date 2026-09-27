// Is g = 2 derived from the knit's own schedule? (E-SPN-0083)
//
// THE QUESTION. E-SPN-0079 made g = 2 a theorem of one principle, T = 0: the order of a token's copies adds no lattice
// Pauli term (the Dirac square root), and with CPT and the shortest period that principle leaves one schedule, the
// 16-beat nested palindrome. The token there is a STAND-IN whose schedule is chosen. If the adopted knit's own
// schedule (the lone bounce collision L on the coset-union vacuum, E-RLT-0084, E-RLT-0093), read as the token's
// schedule, has T = 0 and gives g = 2, then g = 2 is derived rather than chosen.
//
// WHAT THE KNIT RUNS, read from the code before any number (code/measure/knit-schedule). Every beat collides every
// dock (P K on even beats, K P on odd ones) and then ONE permutation copies every slot one dock along its own root.
// There is no order among the 24 copies, and the copy's direction is chosen by the SLOT; the role point rides along,
// moved by the link's grid move. The census's token is different in kind: it has two slots and a spin, and its copy
// along an axis is steered by the spin (the locked Gamma_a = tau_z sigma_a, which E-SPN-0066 shows covariance forces).
//
// FOUR THEOREMS, stated before the run, each checked below.
// A (no order). The knit's copies commute: one permutation per beat, independent of the beat and of the start. So the
//   ordering term T of anything the knit runs is identically 0: every commutator of two of its copies vanishes.
// B (the slot steers, the spin rides). A copy whose direction is set by a label that commutes with the spin (the
//   knit's slot, the stand-in's 'spectator' mode) leaves the spin out of the band: every symbol commutes with 1 (x)
//   sigma, so the two spin states have one spectrum in any field (the Peierls phase is spin blind too) and the spin's
//   g is 0, not 2. T = 0 here removes the Pauli square along with the Pauli term.
// C (the free token has no coin). A lone vibe keeps its slot under every collision the knit uses (P, K, B, L): the
//   collision keeps the occupation momentum, a lone vibe's is its root, and one slot has that root. So the knit's free
//   token copies along its own root every beat: massless, and confined to its line (E-RLT-0093's line locality). A
//   token on one line has no cyclotron orbit, no Landau level and no g. In the census its word is one axis, x^N,
//   which is a bowl in no plane (b = 0).
// D (a spin-steered copy needs an order). The locked generators of two axes anticommute, so no basis is an eigenbasis
//   of both and no permutation copies along both in one beat. Read with the order averaged (the simultaneous copy
//   exp(-i sum Gamma_a pi_a) to second order), one beat copying x, y and z at once has a = b = 1, c = 0, z = -2 in every
//   plane: T = 0, g = 2, isotropic, at period ONE. Every sequential order of the same beat is a saddle (c = +-2). So
//   the knit's shape, one simultaneous copy per beat, is exactly the Dirac square root, and a spinor cannot run it:
//   the nested palindrome is the shortest lattice schedule that reproduces it to second order.
// THE LAZY ROOT TOKEN (E-MTR-0023) copies all its 24 root ports in one permutation per beat and rests the rest; its
// copy is steered by the port and it has no spin. Laziness changes the copied fraction (the speed), not the order: its
// T is 0 at every depth by A, and it has no g by B.
//
// Gates, fixed before this file's first run (tmp/ks-probe3 computed the K2, K3 and K4 numbers first, disclosed; the
// theorems were written before it):
//  K0 per start of E-MTH-0028's 17 (the start enters only the links): the adopted kernel (L, 'alternate', the coset-union
//     vacuum's weave, side 8) runs P K on even beats and K P on odd beats for t = 0 .. 23; its copy target is slot d of
//     the dock one root step along r_d for every slot, a bijection; the target is the same array on every start, and
//     the link array differs between at least two starts
//  K1 per start: on the coset-union vacuum under L, a lone love on each of the 24 center slots with each of the 9 role
//     points departs from the vacuum only on its own line for 24 beats (0 trits off the line): the role never turns a
//     copy onto another line
//  K2 exhaustive: over every dock of full lines plus one lone vibe (294,912 docks for K, B, L together) the lone vibe
//     keeps its slot (0 moved); over every dock of full lines alone (12,288) every line goes to itself (0 leaks); the
//     pair move leaves a line holding one vibe untouched (0 of 288 cases, every store trit, points equal or not)
//  K3 the census, exact integers: the one-beat simultaneous xyz copy (N = 1) is a bowl with g^2 = 4 and T = 0 in all
//     three planes with equal kinetic terms; each of its 6 sequential orders has a saddle plane; the lone token's word
//     x^N (N = 1, 2, 4, 5) is a bowl in no plane
//  K4 steering: the locked generators of two axes anticommute (0) and do not commute (2); the spectator generators
//     commute (0); the spectator symbols of x y z and of the nested palindrome commute with the spin at two k points
//     (below 1e-14) and the locked ones do not (above 0.1)
//  K5 the lazy root token at D = 1 .. 16 on side 4: its stream is one permutation, its own inverse, copying every
//     root port of every dock to another dock and leaving every self port where it is
//  D  the derivation: the knit's own free token has a coin (some lone vibe changes slot) and its word reads a bowl with
//     T = 0 and g = 2. PREDICTED TO FAIL by C.
// Verdict: fail (as predicted) if K0 to K5 hold and D fails; pass if K0 to K5 and D hold; partial if any K fails.
//
// FIRST RUN (91 s, tmp/ks-spn83-run1.log): FAIL, as predicted, no gate moved. K0 to K5 hold: the order PK, KP on every
// start, the copy target one fixed bijection on all 17 starts while the 17 link arrays all differ; 0 of 3,672 role runs
// leave the line; 0 of 294,912 lone docks move the lone vibe, 0 leaks over 12,288 full docks, 0 of 288 pair cases
// touched; the simultaneous copy reads a = b = 1, c = 0, z = -2 per plane (g^2 = 4, T = 0), all 6 orders saddles, the
// lone words 0 bowls; locked anticommutator 0, commutator 2, spectator spin commutator 0, locked 1.72; 0 lazy
// violations. D fails: no coin. Beside: the 9 role points give 5 (one start 6) distinct histories at most per
// direction, 43 to 51 over the 24 directions, so the role decides meetings on the line. Title written after the run.
//
// DETERMINISM: no random numbers. Starts are E-MTH-0028's family; k points are fixed; every dock state is enumerated.
// Depth L2. The census reading is the husk's (axes x, y, z of the husk); the knit's kernel runs in the bulk box and
// its line is read through its husk shadow.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { bounceRunner } from '@/code/measure/bounce-pair-kernel'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import { hubVacuum } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { denseFresh } from '@/code/measure/dense-hub'
import { readWord, isBowl } from '@/code/measure/g-two-census'
import { loneKeepsSlot, orderedReadings, simultaneousReading, steeringCheck } from '@/code/measure/knit-schedule'
import { lazyStreamMap, portCount } from '@/code/rule/lazy-root-token'
import { type Step } from '@/code/rule/spinor-token'

const SIDE = 8
const BEATS = 24
const NESTED: Step[] = ['z', 'up', 'down', 'x', 'up', 'down', 'y', 'up', 'down', 'y', 'up', 'down', 'x', 'up', 'down', 'z']
const KS: number[][] = [
  [0.1, 0.2, 0.3],
  [0.7, -0.4, 0.05],
]

// K1 on one start: off-line departures and the number of distinct histories over the 9 role points
function roleReading(): { offLine: number; distinctMax: number; distinctSum: number; runs: number } {
  const h = denseFresh(SIDE, 'lone', 'union')
  const center = centerOf(SIDE)
  const vac: Reduced[] = []
  const vr = bounceRunner(h.kernel, hubVacuum(h))

  for (let t = 0; t < BEATS; t++) {
    vr.beat()

    const s = vr.state()

    vac.push({ vibe: Int8Array.from(s.vibe), point: Int8Array.from(s.point), store: Int8Array.from(s.store), spoint: Int8Array.from(s.spoint) })
  }

  let offLine = 0
  let distinctMax = 0
  let distinctSum = 0
  let runs = 0

  for (let d = 0; d < 24; d++) {
    const line = LINE_OF[d] as number
    const hashes = new Set<number>()

    for (let p = 0; p < 9; p++) {
      const start = hubVacuum(h)

      start.vibe[center * 24 + d] = 1
      start.point[center * 24 + d] = p

      const run = bounceRunner(h.kernel, start)
      let hash = 2166136261

      for (let t = 0; t < BEATS; t++) {
        run.beat()

        const a = run.state()
        const b = vac[t] as Reduced

        for (let i = 0; i < a.vibe.length; i++) {
          const differs = a.vibe[i] !== b.vibe[i] || (a.vibe[i] !== 0 && a.point[i] !== b.point[i])

          if (!differs) continue
          if (LINE_OF[i % 24] !== line) offLine++
          if (a.vibe[i] !== b.vibe[i]) hash = Math.imul(hash ^ (t * 1_000_003 + i * 3 + (a.vibe[i] as number) + 1), 16777619) >>> 0
        }

        for (let i = 0; i < a.store.length; i++) {
          if ((a.store[i] !== b.store[i] || a.spoint[i] !== b.spoint[i]) && i % 12 !== line) offLine++
        }
      }

      hashes.add(hash)
      runs++
    }

    distinctMax = Math.max(distinctMax, hashes.size)
    distinctSum += hashes.size
  }

  return { offLine, distinctMax, distinctSum, runs }
}

export default experiment({
  id: 'spin/knit-g-schedule',
  code: 'E-SPN-0083',
  title:
    "g = 2 on the knit's own schedule, fail as predicted (not derived): the adopted knit copies all 24 roots in one permutation per beat, steered by the slot, so its copies commute and T = 0 holds trivially, but the spin never enters the band (spectator symbols commute with sigma exactly) and a lone vibe keeps its slot on 294,912 of 294,912 docks (no coin: a massless line mover whose census word is a bowl in no plane); a spin-steered copy cannot be simultaneous (the locked generators anticommute), and read with its order averaged the one-beat x, y, z copy is the Dirac square root at period one (T = 0, g = 2) while all 6 sequential orders are saddles; the role decides which vacuum member a lone vibe meets (up to 6 histories from 9 role points) but never its line, on 17 of 17 starts; the lazy root token also copies in one permutation, so laziness does not change T",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- K2, K3, K4, K5: exact and start-free ----
    const lone = loneKeepsSlot()
    const k2 = lone.moved === 0 && lone.lineLeaks === 0 && lone.pairTouched === 0 && lone.docks === 294912 && lone.fullDocks === 12288 && lone.pairCases === 288

    const sim = simultaneousReading([[0, 1, 2]], 1)
    const orders = orderedReadings([[0, 1, 2]], 1)
    const saddleOrders = orders.filter(r => r.planes.some(v => !isBowl(v))).length
    const g2four = sim.g2.every(g => g !== undefined && g[0] === 4 && g[1] === 1)
    const isotropic = sim.planes.every(v => v.a === sim.planes[0]?.a && v.b === sim.planes[0]?.a && v.c === 0)
    const loneWords = ['x', 'xx', 'xxxx', 'xxxxx'].map(w => ({ w, bowls: readWord(w).planes.filter(isBowl).length }))
    const k3 = sim.bowl.every(Boolean) && g2four && sim.orderingFree && isotropic && saddleOrders === orders.length && loneWords.every(x => x.bowls === 0)

    const steer = steeringCheck([['x', 'y', 'z'], NESTED], KS)
    const k4 = steer.lockedAnticommutator === 0 && steer.lockedCommutator === 2 && steer.spectatorCommutator === 0 && steer.spectatorSpinCommutator < 1e-14 && steer.lockedSpinCommutator > 0.1

    let lazyBad = 0

    for (let depth = 1; depth <= 16; depth++) {
      const spec = { side: 4, depth, phase: 'none' as const }
      const map = lazyStreamMap(spec)
      const Q = portCount(depth)
      const seen = new Uint8Array(map.length)

      for (let i = 0; i < map.length; i++) {
        const to = map[i] as number
        const port = i % Q

        if (seen[to]) lazyBad++
        seen[to] = 1
        if (map[to] !== i) lazyBad++
        if (port < 24 ? Math.floor(to / Q) === Math.floor(i / Q) : to !== i) lazyBad++
      }
    }

    const k5 = lazyBad === 0

    log('exact')

    // ---- K0, K1 per start ----
    const family = startFamily(16)
    let referenceTarget: Int32Array | undefined
    const linkKeys = new Set<string>()
    const perStart = family.map(member =>
      withStart(member, () => {
        const h = denseFresh(SIDE, 'lone', 'union')
        const k = h.kernel
        let orderOk = k.schedule === 'alternate'

        for (let t = 0; t < 24; t++) {
          const o = collisionOrder(k.schedule, t).join('')

          orderOk = orderOk && o === (t % 2 === 0 ? 'PK' : 'KP')
        }

        let targetOk = true
        const hit = new Uint8Array(k.target.length)

        for (let x = 0; x < h.cells; x++) {
          for (let d = 0; d < 24; d++) {
            const to = k.target[x * 24 + d] as number

            targetOk = targetOk && to === h.mesh.neighbour(x, d) * 24 + d && hit[to] === 0
            hit[to] = 1
          }
        }

        const sameTarget = referenceTarget === undefined ? true : referenceTarget.every((v, i) => v === k.target[i])

        referenceTarget ??= Int32Array.from(k.target)
        linkKeys.add(Array.from(makeColorWeave({ side: SIDE, table: 'bind' }).links).slice(0, 4096).join(','))

        const role = roleReading()

        log(`start ${member.name}`)

        return { name: member.name, k0: orderOk && targetOk && sameTarget, role }
      }),
    )

    const k0 = perStart.every(p => p.k0) && linkKeys.size >= 2
    const k1 = perStart.map(p => p.role.offLine === 0)
    const count = (xs: boolean[]): number => xs.filter(Boolean).length

    // ---- D: the derivation ----
    const d = lone.moved > 0 && loneWords.some(x => x.bowls > 0)
    const instruments = k0 && k1.every(Boolean) && k2 && k3 && k4 && k5
    const status = instruments ? (d ? 'pass' : 'fail') : 'partial'

    return verdict({
      status,
      claim: `the knit copies all 24 roots in one permutation per beat (P K, K P alternating) on all ${family.length} starts, steered by the slot: a lone vibe keeps its slot on ${lone.docks} of ${lone.docks} docks (no coin), its departures stay on its line for all 9 role points on ${count(k1)} of ${family.length} starts, and its census word x^N is a bowl in no plane; so T = 0 on the knit only because its copies commute, which also leaves the spin out (spectator symbols commute with sigma to ${steer.spectatorSpinCommutator.toExponential(1)}): g = 2 is not derived; a spin-steered copy cannot be simultaneous (the locked generators anticommute), and read with its order averaged the one-beat xyz copy is T = 0, g^2 = ${sim.g2[0]?.join('/')} at period 1 while all ${orders.length} sequential orders are saddles`,
      metrics: {
        gateK0: k0 ? 1 : 0,
        gateK1: count(k1),
        gateK2: k2 ? 1 : 0,
        gateK3: k3 ? 1 : 0,
        gateK4: k4 ? 1 : 0,
        gateK5: k5 ? 1 : 0,
        gateD: d ? 1 : 0,
        starts: family.length,
        distinctLinkArrays: linkKeys.size,
        loneDocks: lone.docks,
        loneMoved: lone.moved,
        fullDocks: lone.fullDocks,
        lineLeaks: lone.lineLeaks,
        pairCases: lone.pairCases,
        pairTouched: lone.pairTouched,
        roleRuns: perStart.reduce((s, p) => s + p.role.runs, 0),
        roleOffLine: perStart.reduce((s, p) => s + p.role.offLine, 0),
        roleDistinctMax: Math.max(...perStart.map(p => p.role.distinctMax)),
        roleDistinctTotalMin: Math.min(...perStart.map(p => p.role.distinctSum)),
        roleDistinctTotalMax: Math.max(...perStart.map(p => p.role.distinctSum)),
        simultaneousOrders: sim.orders,
        simultaneousA: (sim.planes[0]?.a ?? 0) / sim.orders,
        simultaneousC: (sim.planes[0]?.c ?? 0) / sim.orders,
        simultaneousZ: (sim.planes[0]?.z ?? 0) / sim.orders,
        simultaneousG2: (sim.g2[0]?.[0] ?? 0) / (sim.g2[0]?.[1] ?? 1),
        sequentialSaddleOrders: saddleOrders,
        loneWordBowls: loneWords.reduce((s, x) => s + x.bowls, 0),
        lockedAnticommutator: steer.lockedAnticommutator,
        lockedCommutator: steer.lockedCommutator,
        spectatorCommutator: steer.spectatorCommutator,
        spectatorSpinCommutator: steer.spectatorSpinCommutator,
        lockedSpinCommutator: steer.lockedSpinCommutator,
        lazyViolations: lazyBad,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        nestedA: readWord('z00x00y00y00x00z').planes[0]?.a ?? NaN,
        nestedZ: readWord('z00x00y00y00x00z').planes[0]?.z ?? NaN,
        xxAT: readWord('xx').planes[0]?.aT ?? NaN,
      },
      notes: `L2, exact, deterministic. Gates: K0 ${k0}, K1 ${count(k1)} of ${family.length}, K2 ${k2}, K3 ${k3}, K4 ${k4}, K5 ${k5}, D ${d}. K2: ${lone.moved} of ${lone.docks} lone docks move the lone vibe, ${lone.lineLeaks} line leaks over ${lone.fullDocks} full docks, pair move touched ${lone.pairTouched} of ${lone.pairCases}. K3: simultaneous xyz (sum over ${sim.orders} orders) ${JSON.stringify(sim.planes.map(v => [v.a, v.b, v.c, v.z]))}, g^2 ${JSON.stringify(sim.g2)}; sequential orders ${JSON.stringify(orders.map(r => [r.order, r.planes.map(v => [v.a, v.b, v.c, v.z])]))}; lone words ${JSON.stringify(loneWords)}. K4 ${JSON.stringify(steer)}. K5 lazy violations ${lazyBad}. Per start (off line; distinct histories over 9 points, largest and total over 24 directions): ${perStart.map(p => `${p.name} ${p.role.offLine}; ${p.role.distinctMax}, ${p.role.distinctSum}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
