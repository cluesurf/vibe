// Complex scalars for operator APIs. Matrices store re/im as parallel
// Float64Arrays (see dense.ts); this type is for scalar interchange.

export interface Complex {
  readonly re: number
  readonly im: number
}

export function complex(input: { re: number; im: number }): Complex {
  return { re: input.re, im: input.im }
}

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

export function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
}

export function cConj(a: Complex): Complex {
  return { re: a.re, im: -a.im }
}

export function cAbs(a: Complex): number {
  return Math.hypot(a.re, a.im)
}

export function cArg(a: Complex): number {
  return Math.atan2(a.im, a.re)
}

export function cFromPhase(input: { phase: number }): Complex {
  return { re: Math.cos(input.phase), im: Math.sin(input.phase) }
}

export function cScale(a: Complex, scalar: number): Complex {
  return { re: a.re * scalar, im: a.im * scalar }
}

export function cAbs2(a: Complex): number {
  return a.re * a.re + a.im * a.im
}
