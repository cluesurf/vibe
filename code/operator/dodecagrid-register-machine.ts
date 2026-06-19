// A conserving Minsky register machine wired onto the {5,3,4} dodecagrid: registers are charge held in
// address-ordered blocks of cells carved from the dodecagrid cell-index space, the ground is everything
// else (it holds the balancing -1 charges so total tone is conserved). INC creates a +1/-1 pair, DEC
// annihilates one, test-zero counts the +1 charges in a region. Composes buildDodecagrid +
// carveRegisters + RegisterMachine.

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import {
  carveRegisters,
  RegisterMachine,
} from '@/code/operator/register-machine'

export function buildDodecagridRegisterMachine(input: {
  maxCells: number
  numRegisters: number
  perRegister: number
}): RegisterMachine {
  const g = buildDodecagrid({ maxCells: input.maxCells })
  const cells = Array.from({ length: g.cellCount }, (_, i) => i)
  const { regions, ground } = carveRegisters({
    cells,
    numRegisters: input.numRegisters,
    perRegister: input.perRegister,
  })

  return new RegisterMachine({
    tone: new Int8Array(g.cellCount),
    regions,
    ground,
  })
}
