// Finite tone alphabets. The tone is the state on each element. Kept finite by
// the discreteness principle, built from the substrate by monism.

export type Alphabet =
  | { readonly form: 'boolean' } // {0,1}, the bare bit
  | { readonly form: 'ternary' } // {-1,0,+1}, v3 ternary tone
  | { readonly form: 'clock'; readonly q: number } // Z_q, an emergent phase
  | { readonly form: 'spinor'; readonly components: number } // multi-component tone

// Number of stored slots per element (1, except spinor which stores components).
export function slotsPerElement(a: Alphabet): number {
  return a.form === 'spinor' ? a.components : 1
}

// Number of distinct values a single slot can take.
export function valueCount(a: Alphabet): number {
  switch (a.form) {
    case 'boolean':
      return 2
    case 'ternary':
      return 3
    case 'clock':
      return a.q
    case 'spinor':
      return 3 // spinor components stored as ternary amplitudes by default
  }
}

// A random slot value for the given alphabet.
export function randomValue(input: {
  alphabet: Alphabet
  u: number
}): number {
  const a = input.alphabet
  switch (a.form) {
    case 'boolean':
      return input.u < 0.5 ? 0 : 1
    case 'ternary':
      return Math.floor(input.u * 3) - 1
    case 'clock':
      return Math.floor(input.u * a.q)
    case 'spinor':
      return Math.floor(input.u * 3) - 1
  }
}
