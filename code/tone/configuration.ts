// A configuration assigns a tone value to every element (or every component of
// every element, for the spinor alphabet). Stored densely in an Int32Array.

import { Alphabet, slotsPerElement, randomValue } from '~/tone/alphabet'
import { Rng } from '~/core/rng'

export interface Configuration {
  readonly form: 'configuration'
  readonly alphabet: Alphabet
  readonly size: number // number of elements
  readonly slots: number // slots per element
  readonly values: Int32Array // length size * slots
}

export function makeConfiguration(input: {
  alphabet: Alphabet
  size: number
  rng?: Rng
}): Configuration {
  const slots = slotsPerElement(input.alphabet)
  const values = new Int32Array(input.size * slots)
  if (input.rng) {
    for (let i = 0; i < values.length; i++) {
      values[i] = randomValue({ alphabet: input.alphabet, u: input.rng.next() })
    }
  }
  return {
    form: 'configuration',
    alphabet: input.alphabet,
    size: input.size,
    slots,
    values,
  }
}

export function getTone(
  c: Configuration,
  input: { element: number; slot?: number },
): number {
  return c.values[input.element * c.slots + (input.slot ?? 0)] ?? 0
}

export function setTone(
  c: Configuration,
  input: { element: number; slot?: number; value: number },
): void {
  c.values[input.element * c.slots + (input.slot ?? 0)] = input.value
}

export function cloneConfiguration(c: Configuration): Configuration {
  return {
    form: 'configuration',
    alphabet: c.alphabet,
    size: c.size,
    slots: c.slots,
    values: Int32Array.from(c.values),
  }
}
