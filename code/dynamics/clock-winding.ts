// A clock field on a ring and its topological WINDING. Each cell carries a CLOCK value (a direction, Z_n), the
// coarse-grained direction of the tone-flow. The winding W is how many full turns the clock makes around the ring,
// an integer, a TOPOLOGICAL CHARGE. A reversible local rule cannot change W without a phase slip (a gradient steep
// enough to wrap past n/2). So the winding is the self's IDENTITY, a robust integer, when the resolution n is fine
// enough (coarse ternary slips, the 24-cell resolution protects it). This is topology made concrete, the identity
// is the twist of the feeling-direction field, not arbitrary points.

export type ClockRing = {
  prev: Int32Array
  curr: Int32Array
  size: number
  states: number
}

const modn = (value: number, n: number): number => ((value % n) + n) % n

// the winding, the sum of the wrapped adjacent clock-differences divided by the number of states. An integer when
// the field is periodic around the ring.
export function clockWinding(
  clock: Int32Array,
  states: number,
): number {
  const size = clock.length

  let sum = 0

  for (let x = 0; x < size; x++) {
    let diff = modn(clock[(x + 1) % size]! - clock[x]!, states)

    if (diff > states / 2) {
      diff -= states
    }

    sum += diff
  }

  return Math.round(sum / states)
}

// a reversible second-order clock wave, clock(t+1) = (left + right - clock(t-1)) mod n. Linear and reversible, it
// preserves the winding as long as the clock stays smooth (no phase slip), which holds at fine resolution.
export function stepClockRing(ring: ClockRing): ClockRing {
  const { prev, curr, size, states } = ring
  const next = new Int32Array(size)

  for (let x = 0; x < size; x++) {
    next[x] = modn(
      curr[(x - 1 + size) % size]! + curr[(x + 1) % size]! - prev[x]!,
      states,
    )
  }

  return { prev: curr, curr: next, size, states }
}

// a winding-`turns` initial condition, the clock makes `turns` full turns around the ring (a smooth twist), at rest.
export function makeTwist(input: {
  size: number
  states: number
  turns: number
}): ClockRing {
  const { size, states, turns } = input
  const clock = new Int32Array(size)

  for (let x = 0; x < size; x++) {
    clock[x] = modn(Math.round((states * turns * x) / size), states)
  }

  return { prev: clock.slice(), curr: clock.slice(), size, states }
}
