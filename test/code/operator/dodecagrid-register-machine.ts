// Conformance for code/operator/dodecagrid-register-machine: the conserving Minsky
// machine wired onto the {5,3,4} dodecagrid. This module only COMPOSES buildDodecagrid +
// carveRegisters + RegisterMachine, so the check is an integration one: the machine it
// builds runs a real program with the result and conservation the register machine
// guarantees.

import { suite, check, equal, ok } from '@/test/code/harness'
import { buildDodecagridRegisterMachine } from '@/code/operator/dodecagrid-register-machine'
import { minskyAddProgram } from '@/code/operator/register-machine'

suite('operator/dodecagrid-register-machine: composition', [
  check('the built machine runs ADD with the correct result and conservation', () => {
    const m = buildDodecagridRegisterMachine({
      maxCells: 120,
      numRegisters: 4,
      perRegister: 8,
    })
    ok(m.regions.length === 4, 'four register regions carved from dodecagrid cells')
    ok(m.ground.length > 0, 'ground holds the remaining cells')
    equal(m.charge(), 0, 'starts neutral')
    m.set(0, 2)
    m.set(1, 3)
    const { conserved } = m.run(minskyAddProgram())
    ok(conserved, 'charge conserved throughout the run')
    equal(m.read(0), 5, 'R0 = 2 + 3')
    equal(m.read(1), 0, 'R1 drained')
    equal(m.charge(), 0, 'net charge still zero')
  }),
])
