// Conformance for code/operator/register-machine: the conserving Minsky counter machine
// on ternary charge. Facts:
//   - carveRegisters partitions the cells exactly.
//   - INC/DEC keep the total tone charge at exactly zero (each +1 paired with a -1).
//   - the ADD program leaves R0 = a + b with R1 drained, charge conserved throughout.
//   - the MULTIPLY program leaves R2 = a * b, charge conserved throughout.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  RegisterMachine,
  carveRegisters,
  minskyAddProgram,
  minskyMultiplyProgram,
} from '@/code/operator/register-machine'

// A generous layout: 160 cells, 4 registers of 16 (room for a*b up to 9), the rest ground.
const cellCount = 160
const perRegister = 16
const cells = Array.from({ length: cellCount }, (_, i) => i)
const { regions, ground } = carveRegisters({
  cells,
  numRegisters: 4,
  perRegister,
})

function machine(): RegisterMachine {
  return new RegisterMachine({
    tone: new Int8Array(cellCount),
    regions,
    ground,
  })
}

suite('operator/register-machine: layout', [
  check('carveRegisters partitions the cells exactly', () => {
    equal(regions.length, 4, 'four register regions')

    for (const region of regions) {
      equal(
        region.length,
        perRegister,
        'each region has perRegister cells',
      )
    }

    equal(
      ground.length,
      cellCount - 4 * perRegister,
      'ground gets the remainder',
    )

    const all = new Set([...regions.flat(), ...ground])

    equal(all.size, cellCount, 'no cell is shared or lost')
  }),
])

suite('operator/register-machine: conserving primitives', [
  check('INC and DEC keep total charge at zero', () => {
    const m = machine()

    equal(m.charge(), 0, 'starts neutral')
    m.inc(0)
    m.inc(0)
    equal(
      m.charge(),
      0,
      'two INCs still net zero (each +1 has a -1 in ground)',
    )
    equal(m.read(0), 2, 'register 0 holds two +1 charges')
    m.dec(0)
    equal(m.charge(), 0, 'DEC stays neutral')
    equal(m.read(0), 1, 'one charge remains')
  }),
])

suite('operator/register-machine: Minsky programs', [
  check(
    'ADD leaves R0 = a + b with R1 drained, charge conserved',
    () => {
      for (const [a, b] of [
        [2, 3],
        [5, 0],
        [0, 4],
        [6, 1],
      ]) {
        const m = machine()

        m.set(0, a!)
        m.set(1, b!)

        const { conserved } = m.run(minskyAddProgram())

        ok(conserved, `charge conserved for ADD ${a}+${b}`)
        equal(m.read(0), a! + b!, `R0 = ${a}+${b}`)
        equal(m.read(1), 0, 'R1 drained')
        equal(m.charge(), 0, 'net charge still zero')
      }
    },
  ),
  check('MULTIPLY leaves R2 = a * b, charge conserved', () => {
    for (const [a, b] of [
      [2, 3],
      [4, 0],
      [3, 3],
      [1, 5],
    ]) {
      const m = machine()

      m.set(0, a!)
      m.set(1, b!)

      const { conserved } = m.run(minskyMultiplyProgram())

      ok(conserved, `charge conserved for MUL ${a}*${b}`)
      equal(m.read(2), a! * b!, `R2 = ${a}*${b}`)
    }
  }),
])
