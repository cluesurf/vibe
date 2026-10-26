// E-SPN-0216, a read ADDED AFTER the radius reads landed (disclosed, gating nothing): the sector()-built body diagonals
// also read spectral radius about 1.0005 on the whole stored space at R 12 on the ball. This asks (1) whether that
// growth needs the open edge (the same read on the torus) and (2) whether it lives only in the remainder (the radius of
// the cycle followed by the projection onto invariant states, P U, on the ball). Writes ../remainder-probe.json
// (refuses to overwrite). 6 native threads.
import { existsSync, writeFileSync } from 'node:fs'
import { pairLevel } from '@/code/measure/pair-direction'
import {
  invarianceDefect,
  invariantPart,
  patternState,
  spectralRadius,
  stabilizers,
} from '@/code/measure/reduced-unitarity'
import {
  cloneState,
  littleGroup,
  reducedCounts,
  reducedCycle,
  reducedEngine,
  scaleState,
  sector,
  type Boundary,
  type RState,
} from '@/code/measure/register-reduced'
import { setup } from '@/code/measure/register-track'

const OUT = `${import.meta.dirname}/../remainder-probe.json`
const opts = { backend: 'native', threads: 6 } as const
const started = Date.now()
const log = (what: string): void => console.log(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

if (existsSync(OUT)) {
  throw new Error(`refusing to overwrite ${OUT}`)
}

const su = setup()
const R = 12
const CYCLES = 2048
const plain = (st: RState): number => {
  let n = 0

  for (let k = 0; k < st.re.length; k++) {
    n += st.re[k]! ** 2 + st.im[k]! ** 2
  }

  return n
}
const rows: Record<string, unknown>[] = []

for (const boundary of ['torus', 'ball'] as Boundary[]) {
  const level = pairLevel({ su, aB: 3.5, R, opts, boundary })

  for (const d of [[1, 1, 1], [1, 1, -1]]) {
    const K = d.map(x => (0.32 * x) / Math.sqrt(3)).concat(0)
    const s = sector(su.group, littleGroup(su.group, K), R, boundary)
    const e = reducedEngine(s, su.u, K, reducedCounts(s, su.table, level.alpha, su.theta), 'vector', opts)
    const stab = stabilizers(s)
    const full = spectralRadius(e, patternState(s), CYCLES)
    // P U: the cycle, then the invariant part, from the pattern's invariant part
    let st = invariantPart(s, patternState(s), stab)
    const logs: number[] = []

    scaleState(st, 1 / Math.sqrt(plain(st)))

    for (let t = 0; t < CYCLES; t++) {
      const u = cloneState(st)

      reducedCycle(e, u)
      st = invariantPart(s, u, stab)

      const n = plain(st)

      logs.push(Math.log(n) / 2)
      scaleState(st, 1 / Math.sqrt(n))
    }

    const q = CYCLES / 4
    const projected = Math.exp(logs.slice(3 * q).reduce((a, b) => a + b, 0) / q)
    const row = {
      boundary,
      diagonal: d,
      reps: s.count,
      radius: full.radius,
      quarters: full.quarters,
      remainder: invarianceDefect(s, full.state, stab),
      projectedRadius: projected,
    }

    rows.push(row)
    log(JSON.stringify(row))
  }
}

writeFileSync(OUT, JSON.stringify(rows, null, 1))
log('done')
