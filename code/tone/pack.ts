// The tone bit-pack, the second-order memory of a cell carried in one integer. The pair (current, previous)
// of ternary codes is packed as (previous << 2) | current, nine states. Renders and a couple of experiments
// inlined these, here is the one home, with the signed mapping and the canonical tone colours.

// pack the current and previous ternary codes (each 0,1,2) into one integer
export function pack(input: {
  current: number
  previous: number
}): number {
  return (input.previous << 2) | input.current
}

export function currentOf(packed: number): number {
  return packed & 3
}

export function previousOf(packed: number): number {
  return (packed >> 2) & 3
}

// tone code {0,1,2} -> signed {0, +1, -1} (peace, pleasure, pain)
export function signedTone(code: number): number {
  return code === 0 ? 0 : code === 1 ? 1 : -1
}

// the canonical three-tone palette, black = 0 (peace), blue = +1 (pleasure), red = -1 (pain)
export function toneColor(code: number): [number, number, number] {
  if (code === 1) {
    return [60, 130, 255]
  }

  if (code === 2) {
    return [255, 60, 70]
  }

  return [0, 0, 0]
}
