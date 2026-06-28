// Conformance for code/coarse/block-charge-tower: the real-space pair-blocking renormalization tower.
// The defining property of a charge-summing renormalization step is that the TOTAL charge is exactly
// conserved at every level (summing pairs never creates or destroys charge), and the per-level
// compressibility is Var(field)/blockSize. Both re-derived by hand on small fields.

import { suite, check, equal, close } from '@/test/code/harness'
import { blockChargeTower } from '@/code/coarse/block-charge-tower'

suite('coarse/block-charge-tower: charge conservation up the tower', [
  // A uniform field has zero variance at every level, and its total is conserved exactly.
  check('a uniform field conserves total charge and has zero compressibility', () => {
    const levels = blockChargeTower({ field: [1, 1, 1, 1], levels: 2 })
    equal(levels.length, 3)
    for (const lv of levels) {
      equal(lv.totalCharge, 4, 'total charge is conserved at every level')
      close(lv.compressibility, 0, 1e-12, 'uniform field has zero variance')
    }
    // block sizes double: 1, 2, 4.
    equal(levels[0]!.blockSize, 1)
    equal(levels[1]!.blockSize, 2)
    equal(levels[2]!.blockSize, 4)
  }),
  // field [2,0,2,0]: level 0 mean 1, variance ((1)^2 *4)/4 = 1, compressibility 1/1 = 1.
  // pair sums -> [2,2]: level 1 mean 2, variance 0, compressibility 0/2 = 0. Total 4 throughout.
  check('compressibility is Var/blockSize and total is conserved', () => {
    const levels = blockChargeTower({ field: [2, 0, 2, 0], levels: 1 })
    equal(levels[0]!.totalCharge, 4)
    close(levels[0]!.compressibility, 1, 1e-12)
    equal(levels[1]!.totalCharge, 4)
    close(levels[1]!.compressibility, 0, 1e-12)
  }),
  // A net-zero (charge-balanced) field stays zero charge at every level.
  check('a balanced field conserves zero charge', () => {
    const levels = blockChargeTower({ field: [1, -1, 1, -1], levels: 2 })
    for (const lv of levels) {
      equal(lv.totalCharge, 0, 'balanced field stays charge-neutral')
    }
    // level 0 variance: mean 0, var = (1+1+1+1)/4 = 1, compressibility 1.
    close(levels[0]!.compressibility, 1, 1e-12)
  }),
])
