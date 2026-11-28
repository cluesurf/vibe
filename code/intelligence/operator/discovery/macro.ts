/**
 * A macro is a found path fragment turned into one operator (the source's
 * section 15.5): `compose` over a fixed sequence of primitive operators.
 *
 * A macro is named by its primitive steps, `macro:port-0+port-2+port-2`, so
 * the name is the macro: two compositions that run the same primitives are
 * one operator, a macro built from macros flattens to its primitives, and a
 * macro learned on one geometry is rebuilt on another by the same names
 * (it exists there only when every step it names exists there).
 */

import { compose, operatorIndex, type Operator } from '@/code/intelligence/operator/operator'

export const MACRO_PREFIX = 'macro:'
const STEP_SEPARATOR = '+'

export function isMacroId(id: string): boolean {
  return id.startsWith(MACRO_PREFIX)
}

/** The id of the macro running `steps` (primitive ids) in order. */
export function macroId(steps: readonly string[]): string {
  if (steps.length < 2) {
    throw new Error(`macroId: a macro has at least 2 steps, got ${steps.length}`)
  }

  for (const step of steps) {
    if (isMacroId(step) || step.includes(STEP_SEPARATOR)) {
      throw new Error(`macroId: step ${step} is not a primitive id`)
    }
  }

  return `${MACRO_PREFIX}${steps.join(STEP_SEPARATOR)}`
}

/** The primitive steps an operator id stands for: itself for a primitive, its steps for a macro. */
export function primitiveSteps(id: string): string[] {
  return isMacroId(id) ? id.slice(MACRO_PREFIX.length).split(STEP_SEPARATOR) : [id]
}

/** The primitive steps of a path of operator ids, macros flattened. */
export function flattenPath(ids: readonly string[]): string[] {
  return ids.flatMap(primitiveSteps)
}

/**
 * Macros over `operators` (the primitives of one environment), one per step
 * list, in the given order. A step list naming an operator the environment
 * lacks gives null in its place, never a partial macro.
 */
export function buildMacros<S>(
  steps: readonly (readonly string[])[],
  operators: readonly Operator<S>[],
  options: { memo?: boolean } = {},
): (Operator<S> | null)[] {
  const index = operatorIndex(operators)

  return steps.map(list => {
    const parts: Operator<S>[] = []

    for (const id of list) {
      const operator = index.get(id)

      if (operator === undefined || isMacroId(id)) {
        return null
      }

      parts.push(operator)
    }

    return compose(macroId(list), parts, options)
  })
}
