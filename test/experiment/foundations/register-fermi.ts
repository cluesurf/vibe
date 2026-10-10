// THE FERMI HALF OF OPEN-CSM-14 ON A THIN LEVEL (E-FND-0175, item 0031 of moving-matter, decision 001). E-FND-0165 read a
// Gibbs form for three holes on the L = 6 torus, at a filling of 1.2e-3 a mode, where Fermi-Dirac and Gibbs agree to
// O(f). Decision 001: make the level thin, not the holes many. A level of ONE momentum class holds 4 up-band modes, so
// the exact store's three holes could fill it to 0.75. Exclusion itself is E-SPN-0191's, not claimed here.
//
// STAGE 0, fixed before the run (2026-10-08, from the item): the one-hole band levels on every torus with sides >= 6
// (even, sides may differ: the shape is a boundary condition, not a parameter shrunk), the extreme levels' class counts,
// the gap to the next level, and the 3-hole sorted store at P = 3 k0. Pick the smallest store under 8 GB whose bottom or
// top level is ONE class. None: STOP, verdict open, unreachable by the exact engine. Only a pick allows stage 1 (the
// law check before any run, then the S1 / S2 runs with the free control).
// INSTRUMENT (a failure is a fail: the table cannot be trusted): C1 the stand-in frame (register-fermi levelsAt) equals
// bandLevels on the real torus(4) to the bit; C2 the L = 6 level table is E-FND-0165's (40, 96, 96, 96, 64, 24, 96, 48,
// 32, 32, 24 classes); C3 E is invariant under the 384 coordinate permutations and sign flips on the L = 6 grid to 1e-9,
// so a box and its side permutations hold one level structure and nondecreasing sides cover every box.
//
// FIRST RUN (tmp/fermi-gate.log, this file, 1,279 s; the probe before it, tmp/fermi-probe.log, the same table): no box
// qualifies, OPEN.
//  - C1 0 (to the bit), C2 the table to every class, C3 1.8e-15.
//  - 26 candidate boxes, 6^4 to 8x8x8x10; 21 under 8 GB. The bottom level is E 0.380251 on every box (the band's
//    minimum, held by classes every even box contains), never fewer than 8 classes (6x6x8x10, 6x6x8x14, 6x6x10x10,
//    6x8x10x10). The top level is never fewer than 4 classes (6x6x8x8 at 1.82 GB, 6x8x8x10, 6x8x8x12): E(q) = E(-q) and
//    each sign flip is a symmetry, so a top away from the classes q = -q is never alone. Three holes on the thinnest
//    extreme fill it to at most 3 / 16 = 0.19, under the 0.5 the Fermi read needs.
//  - So the Fermi half of OPEN-CSM-14 is open, unreachable by the exact engine (decision 001 point 4); no fallback
//    engine is built, the law check and stage 1 are not run.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import { bandLevels, holeFrame } from '@/code/measure/register-holes'
import { probeLine, thinLevelProbe } from '@/code/measure/register-fermi'

const LIGHT: readonly [number, number] = [-1, 4]
const LIMIT = 8e9
const MODES = 4
const HOLES = 3
const SYMMETRY_TOL = 1e-9
const TABLE6 = '40,96,96,96,64,24,96,48,32,32,24'

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-fermi',
  code: 'E-FND-0175',
  title:
    'the Fermi half of the register sea\'s statistics on a thin level, open (unreachable by the exact engine): over 26 tori with sides from 6 (sides may differ) and a 3-hole store under 8 GB, no extreme band level is one momentum class; the bottom level is never under 8 classes and the top never under 4, so three holes fill the thinnest extreme to at most 0.19, under the 0.5 a Fermi-Dirac read needs; the stand-in frame equals the real one to the bit and reproduces E-FND-0165\'s L = 6 level table',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerFermiRun()
  },
})

export function registerFermiRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const Ps = [
    registerPiece(scaled(singletProjector24(), 24), u),
    registerPiece(scaled(partnerProjector48(), 48), [u[0], -u[1]]),
  ]
  const t4 = torus(4)
  const p = thinLevelProbe(Ps, LIMIT, bandLevels(holeFrame(t4, Ps, 8)), t4.momenta, log)
  const C1 = p.standIn === 0
  const C2 = p.table6.counts.join(',') === TABLE6
  const C3 = p.symmetry <= SYMMETRY_TOL
  const under = p.rows.filter(r => Math.min(r.bottom.bytes, r.top.bytes) < LIMIT)
  const leastBottom = Math.min(...p.rows.filter(r => r.bottom.bytes < LIMIT).map(r => r.bottom.classes.length))
  const leastTop = Math.min(...p.rows.filter(r => r.top.bytes < LIMIT).map(r => r.top.classes.length))
  const thinnest = Math.min(leastBottom, leastTop)
  const status = !C1 || !C2 || !C3 ? 'fail' : 'open'

  return verdict({
    status,
    claim: p.pick
      ? `stage 0 found a one-class ${p.pick.end} level on ${p.pick.sides.join('x')} (store ${(p.pick.bytes / 1e9).toFixed(2)} GB); stage 1 is not built in this file`
      : `no torus with sides >= 6 and a 3-hole store under 8 GB has a one-class extreme level (${under.length} of ${p.rows.length} boxes under the limit): the bottom level is never under ${leastBottom} classes and the top never under ${leastTop}, so three holes fill the thinnest extreme to at most ${(HOLES / (MODES * thinnest)).toFixed(4)}; the Fermi half is open, unreachable by the exact engine; instrument C1 ${C1} (${p.standIn.toExponential(2)}) C2 ${C2} C3 ${C3} (${p.symmetry.toExponential(2)})`,
    metrics: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      boxes: p.rows.length,
      underLimit: under.length,
      leastBottom,
      leastTop,
      bestFilling: HOLES / (MODES * thinnest),
      picked: flag(p.pick !== null),
      standIn: p.standIn,
      symmetry: p.symmetry,
      seconds: (Date.now() - started) / 1000,
    },
    notes: `L1: an exact count of the one-hole band levels, no dynamics. The register rule's member at ringUnit(-1, 4), fiber 8 (one half). L = 6 levels ${p.table6.levels.map(x => x.toFixed(6)).join(' ')}. Per box: ${p.rows.map(probeLine).join('; ')}. Decision 001 point 4: no fallback engine.`,
  })
}
