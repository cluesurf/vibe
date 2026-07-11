// A reduced per-cell ternary field, the tone read as Z3 ({-1,0,+1} = {2,0,1} mod 3) on a 1D chain, evolved by an
// exactly reversible second-order cellular automaton, u(t+1) = (rule(left, c, right) - u(t-1)) mod 3. The map is
// reversible for ANY rule, the inverse simply swaps the t+1 and t-1 slots, u(t-1) = (rule(...) - u(t+1)) mod 3.
// This is the per-cell (scalar) reading of the tone, used to test whether a topological kink (a domain wall) can
// be a self. It is a REDUCED model, the committed substrate is the lattice gas (tone on directed edges), this
// scalar reading is a stand-in for studying kinks.
//
// The central finding (see test/experiment/selves/per-cell-radiation-obstruction), ternary is too COARSE to carry
// a soft radiation field, so a localized perturbation never sheds cleanly to the bath, it either stays trapped
// (decoupled rules) or spreads into persistent order-1 turbulence (coupled rules). Healing, and therefore the
// self's corrective agency, must be EMERGENT (soft long-wavelength modes of many tones), not a per-cell property.

export type TernaryField = {
  prev: Int8Array
  curr: Int8Array
  size: number
}

// a local update rule, maps a cell and its two neighbours (each in {0,1,2}) to a value in {0,1,2} before the
// second-order subtraction. Constant domains are fixed points exactly when rule(u,u,u) = 2u mod 3.
export type TernaryRule = (
  left: number,
  center: number,
  right: number,
) => number

export type TernaryBoundary =
  | { form: 'periodic' }
  | { form: 'absorbing'; left: number; right: number; margin?: number }

const mod3 = (value: number): number => ((value % 3) + 3) % 3

export function makeTernaryField(input: {
  size: number
  fill: (index: number) => number
}): TernaryField {
  const { size, fill } = input
  const u = new Int8Array(size)

  for (let x = 0; x < size; x++) {
    u[x] = mod3(fill(x))
  }

  // at rest, prev equals curr (zero initial velocity).
  return { prev: u.slice(), curr: u.slice(), size }
}

// a single reversible step. Periodic wraps. Absorbing clamps a margin at each end back to its fixed vacuum, which
// drains outgoing disturbances, this is the bath.
export function stepTernaryField(input: {
  field: TernaryField
  rule: TernaryRule
  boundary: TernaryBoundary
}): TernaryField {
  const { field, rule, boundary } = input
  const { size, curr, prev } = field
  const next = new Int8Array(size)
  const periodic = boundary.form === 'periodic'
  const leftVacuum = boundary.form === 'absorbing' ? boundary.left : 0
  const rightVacuum = boundary.form === 'absorbing' ? boundary.right : 0

  for (let x = 0; x < size; x++) {
    const left =
      x === 0 ? (periodic ? curr[size - 1]! : leftVacuum) : curr[x - 1]!

    const right =
      x === size - 1
        ? periodic
          ? curr[0]!
          : rightVacuum
        : curr[x + 1]!

    next[x] = mod3(rule(left, curr[x]!, right) - prev[x]!)
  }

  if (boundary.form === 'absorbing') {
    const margin = boundary.margin ?? 4

    for (let x = 0; x < margin; x++) {
      next[x] = leftVacuum
    }

    for (let x = size - margin; x < size; x++) {
      next[x] = rightVacuum
    }
  }

  return { prev: curr, curr: next, size }
}

// the additive (linear) rule, u(t+1) = (left + right - u(t-1)) mod 3. Reversible and propagating, but additive,
// so a localized disturbance spreads into a self-similar order-1 pattern rather than a soft pulse.
export const linearTernaryRule: TernaryRule = (left, _center, right) =>
  mod3(left + right)

// the decoupled rule, u(t+1) = (2c - u(t-1)) mod 3. Each cell oscillates independently with period 3, no coupling,
// so a disturbance is trapped in place and never radiates.
export const decoupledTernaryRule: TernaryRule = (
  _left,
  center,
  _right,
) => mod3(2 * center)

// the number of domain walls (adjacent cells that differ). The count of walls is the topological charge of the
// configuration, a single kink contributes one wall, and no local rule can create or destroy a lone wall in the
// interior without an antiwall, this is the kink's exact base-level identity.
export function wallCount(u: Int8Array): number {
  let count = 0

  for (let x = 0; x < u.length - 1; x++) {
    if (u[x] !== u[x + 1]) {
      count++
    }
  }

  return count
}

// the count of cells that differ between two fields, the size of a perturbation.
export function fieldDifference(a: Int8Array, b: Int8Array): number {
  let count = 0

  for (let x = 0; x < a.length; x++) {
    if (a[x] !== b[x]) {
      count++
    }
  }

  return count
}

// how far from a center the perturbation has spread (its radius), 0 means it never left the center.
export function spreadRadius(input: {
  clean: Int8Array
  perturbed: Int8Array
  center: number
}): number {
  const { clean, perturbed, center } = input

  let low = clean.length
  let high = -1

  for (let x = 0; x < clean.length; x++) {
    if (clean[x] !== perturbed[x]) {
      if (x < low) {
        low = x
      }

      if (x > high) {
        high = x
      }
    }
  }

  if (high < 0) {
    return 0
  }

  return Math.max(center - low, high - center)
}
