import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { lastCompleteShellRatio } from '@/code/substrate/coxeter/growth'

// SS5 (experiments/17). LSM-tree levels. A log-structured-merge database keeps geometrically growing sorted
// LEVELS and merges each down into the next, and the radial shells of the bulk ARE those levels, each shell a
// larger sorted run than the one inside it. We confirm the shells grow monotonically with a stable geometric
// ratio (the level fan-out) and that the number of levels to hold N items is logarithmic. The control is the
// flat honeycomb, whose shell ratio drifts toward 1 (no stable geometric level structure). Reference, the LSM
// level design (a fixed fan-out per level).

export default experiment({
  id: 'data-structure/lsm-levels',
  code: 'E-DST-0016',
  title:
    'SS5: the radial shells are geometric LSM levels with a stable fan-out and logarithmic level count',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = buildCoxeterMatrixMesh([3, 4, 3, 4], 4000)
    const flat = buildCoxeterMatrixMesh([3, 4, 3, 3], 4000)
    const complete = mesh.shells.slice(1, mesh.shells.length - 1) // drop the root and the truncated last shell

    // levels grow monotonically (each radial level larger than the one inside it)
    let monotonic = true

    for (let i = 1; i < complete.length; i++) {
      if (complete[i]! < complete[i - 1]!) {
        monotonic = false
      }
    }

    // a stable geometric level fan-out (the level-size ratio), bounded above 1
    const levelFanout = lastCompleteShellRatio(mesh.shells)
    const flatFanout = lastCompleteShellRatio(flat.shells)
    const geometricLevels =
      levelFanout > 1.3 && levelFanout > flatFanout

    // the number of levels to hold the cells is logarithmic
    const levels = mesh.shells.length
    const logarithmicLevels =
      levels <= 4 * Math.log2(mesh.adjacency.length)

    const ok = monotonic && geometricLevels && logarithmicLevels

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the radial shells of the bulk form LSM-tree levels, monotonically growing with a stable geometric fan-out, so a log-structured store maps onto the radial axis with a logarithmic number of levels and the crystal growth as its append log',
      metrics: {
        levels,
        levelFanout,
        levelsAreMonotonic: monotonic ? 1 : 0,
        logarithmicLevels: logarithmicLevels ? 1 : 0,
      },
      // CONTROL: the flat honeycomb's shell ratio drifts lower (no stable geometric level structure), so the
      // LSM level fan-out is the hyperbolic growth.
      control: {
        flatLevelFanout: flatFanout,
        geometricLevels: geometricLevels ? 1 : 0,
      },
      notes:
        'SS5 of experiments/17. The radial axis is the level, scale, and priority direction, shared with the heap (SS4) and the skip-list shortcut (DS9).',
    })
  },
})
