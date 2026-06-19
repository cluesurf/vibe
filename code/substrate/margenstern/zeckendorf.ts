// The Fibonacci numeral system (Zeckendorf representation), the exact integer coordinate Margenstern gives
// every tile of the pentagrid {5,4} and, by the twin theorem, the heptagrid {7,3}. Every positive integer is a
// unique sum of non-consecutive Fibonacci numbers, written as a binary word with no two adjacent 1s. That word
// IS the tile's address, and the whole point is exactness, these are integers, so dedup and identity never
// drift the way a floating-point cell center does. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md and the splitting-method notes.

// the Fibonacci basis used for Zeckendorf, F1=1, F2=2, F3=3, F4=5, F5=8, ... (the "no two consecutive" basis,
// which omits the ordinary-Fibonacci leading 1 so the representation is unique)
const FIB_CACHE: number[] = [1, 2]

function fibUpTo(n: number): number[] {
  while (FIB_CACHE[FIB_CACHE.length - 1]! <= n) {
    const a = FIB_CACHE[FIB_CACHE.length - 1]!
    const b = FIB_CACHE[FIB_CACHE.length - 2]!
    FIB_CACHE.push(a + b)
  }

  return FIB_CACHE
}

// the Zeckendorf address of a positive integer, as a binary string most-significant-digit first, no "11"
export function toZeckendorf(value: number): string {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Zeckendorf needs a positive integer, got ${value}`)
  }

  const fib = fibUpTo(value)
  let top = fib.length - 1
  while (fib[top]! > value) {
    top--
  }

  let remainder = value
  let out = ''
  for (let i = top; i >= 0; i--) {
    if (fib[i]! <= remainder) {
      out += '1'
      remainder -= fib[i]!
    } else if (out.length > 0) {
      out += '0'
    }
  }

  return out
}

// the integer value of a Zeckendorf address (the inverse of toZeckendorf)
export function fromZeckendorf(address: string): number {
  let sum = 0
  const len = address.length
  fibUpTo(0)
  while (FIB_CACHE.length < len) {
    const a = FIB_CACHE[FIB_CACHE.length - 1]!
    const b = FIB_CACHE[FIB_CACHE.length - 2]!
    FIB_CACHE.push(a + b)
  }

  for (let i = 0; i < len; i++) {
    if (address[len - 1 - i] === '1') {
      sum += FIB_CACHE[i]!
    }
  }

  return sum
}

// is this a legal Zeckendorf address (binary, no two adjacent 1s)?
export function isZeckendorf(address: string): boolean {
  return (
    /^[01]+$/.test(address) &&
    !address.includes('11') &&
    (address.length === 1 || address[0] !== '0')
  )
}

// append "00", the continuator rewrite, the address of a node's preferred son is its own address plus "00"
export function appendContinuator(address: string): string {
  return address + '00'
}

// the count of pentagrid/heptagrid tiles in generation n of a single sector, f_{2n+1} = 1, 3, 8, 21, 55, ...
// (the dominant growth ratio is the golden ratio squared, phi^2 ~ 2.618)
export function sectorGeneration(n: number): number {
  let a = 1
  let b = 3
  if (n === 0) {
    return 1
  }

  for (let i = 1; i < n; i++) {
    const next = 3 * b - a
    a = b
    b = next
  }

  return b
}
