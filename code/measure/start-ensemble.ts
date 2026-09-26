// E-MTH-0028: a family of deterministic link starts, and the ensemble readings of an experiment run over it.
//
// A vibe weave's grid moves start from a Weyl sequence (code/rule/vibe-weave linkStart). Which one is an arbitrary
// choice, and E-MTH-0027 found that changing it (the golden start of 2026-09-24 to the integer start) moved 8
// statuses among 59 experiments. A verdict that depends on that choice is a reading of one start, not of the
// model. This file gives the measurement a family of starts and the readings over it:
//
// - the family: member "integer+k" is linkStart(slot, count, k), the committed integer Weyl sequence with its
//   phase moved by k * 27145 mod 2^16 (the silver rate), so "integer+0" is the committed start; member "golden"
//   is the retired golden start of 2026-09-24, floor(216 frac((i + 1) 731 (sqrt 5 - 1) / 200)), rebuilt here in
//   exact integers (an integer square root) and checked slot for slot against the float formula it replaced
// - withStart runs any function with the family member as every weave's default start, restoring the committed
//   start after, so an existing experiment runs unedited over the family
// - the readings: per gate the fraction of members that pass, per metric the distribution, and the PAIRED
//   comparison of an adopted rule against its base on the same member, which names the gates the adopted rule
//   fails and the base passes; a control that reads nothing on both sides of a pair is uninformative, reported
//   as such and never counted as the change's failure
//
// Measurement code: it may use reals. The starts it hands the rule are integers.

import { linkStart, useLinkStart, type LinkStartOf } from '@/code/rule/vibe-weave'

export type StartMember = { readonly name: string; readonly start: LinkStartOf }

// the integer square root of a non-negative bigint
function isqrt(n: bigint): bigint {
  if (n < 2n) {
    return n
  }

  let x = 1n << BigInt((n.toString(2).length >> 1) + 1)

  for (;;) {
    const y = (x + n / x) >> 1n

    if (y >= x) {
      return x
    }

    x = y
  }
}

// floor(k n r) for r = 731 (sqrt 5 - 1) / 200 and integers k, n >= 1: with A = 731 k n, k n r = (A sqrt 5 - A) / 200,
// and since A sqrt 5 is irrational its floor is isqrt(5 A^2), so the floor of the quotient is (isqrt(5 A^2) - A) div 200
function floorGoldenRate(k: bigint, n: bigint): bigint {
  const a = 731n * k * n

  return (isqrt(5n * a * a) - a) / 200n
}

// the retired golden start, exact: floor(count frac(n r)) = floor(count n r) - count floor(n r), n = slot + 1
export function goldenLinkStart(slot: number, count: number): number {
  const n = BigInt(slot + 1)
  const c = BigInt(count)

  return Number(floorGoldenRate(c, n) - c * floorGoldenRate(1n, n))
}

// the float formula it replaced, kept only to check the exact one against (code/rule/vibe-weave before E-MTH-0027)
export function goldenLinkStartFloat(slot: number, count: number): number {
  const golden = (Math.sqrt(5) - 1) / 2

  return Math.floor((((slot + 1) * golden * 7.31) % 1) * count)
}

// the family: integer+0 .. integer+(offsets - 1), then golden
export function startFamily(offsets: number): StartMember[] {
  return [
    ...Array.from({ length: offsets }, (_, k): StartMember => ({ name: `integer+${k}`, start: (slot, count) => linkStart(slot, count, k) })),
    { name: 'golden', start: goldenLinkStart },
  ]
}

export function memberNamed(name: string): StartMember {
  if (name === 'golden') {
    return { name, start: goldenLinkStart }
  }

  const k = Number(name.replace('integer+', ''))

  if (!name.startsWith('integer+') || !Number.isInteger(k) || k < 0) {
    throw new Error(`no start member named ${name}`)
  }

  return { name, start: (slot, count) => linkStart(slot, count, k) }
}

// run fn with the member as every weave's default start, and restore the committed start after
export function withStart<T>(member: StartMember, fn: () => T): T {
  const previous = useLinkStart(member.start)

  try {
    return fn()
  } finally {
    useLinkStart(previous)
  }
}

export type MemberRun = {
  readonly member: string
  readonly status: string
  readonly metrics: Readonly<Record<string, number>>
  readonly control: Readonly<Record<string, number>>
}

// the 0/1 gate keys: every metric or control key holding the word "gate" (gate_x, gateG1, H_on_gate_x, gate7, not
// "gates...") whose value is 0 or 1 on every member
export function gateKeys(runs: readonly MemberRun[]): string[] {
  const keys = new Set<string>()

  for (const run of runs) {
    for (const key of [...Object.keys(run.metrics), ...Object.keys(run.control)]) {
      if (/(^|_)gate([A-Z0-9_]|$)/.test(key)) {
        keys.add(key)
      }
    }
  }

  const valueOf = (run: MemberRun, key: string): number | undefined => run.metrics[key] ?? run.control[key]

  return [...keys].filter(key => runs.every(run => valueOf(run, key) === 0 || valueOf(run, key) === 1)).sort()
}

export function readKey(run: MemberRun, key: string): number | undefined {
  return run.metrics[key] ?? run.control[key]
}

// per gate: members passing over members run
export function passFractions(runs: readonly MemberRun[]): { gate: string; pass: number; of: number }[] {
  const statusPass = runs.filter(r => r.status === 'pass').length

  return [
    { gate: 'status=pass', pass: statusPass, of: runs.length },
    ...gateKeys(runs).map(gate => ({ gate, pass: runs.filter(r => readKey(r, gate) === 1).length, of: runs.length })),
  ]
}

export type Distribution = { min: number; median: number; max: number; distinct: number; values: number[] }

export function distribution(values: readonly number[]): Distribution {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = sorted.length >> 1
  const median = sorted.length === 0 ? Number.NaN : sorted.length % 2 === 1 ? (sorted[middle] ?? 0) : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2

  return {
    min: sorted[0] ?? Number.NaN,
    median,
    max: sorted[sorted.length - 1] ?? Number.NaN,
    distinct: new Set(sorted.map(v => v.toPrecision(10))).size,
    values: [...values],
  }
}

// the paired comparison on one member: the gates the adopted column fails and the base column passes. The
// gate names are read from two key prefixes of the same run (for example "H_comoving_gate_" and "H_off_gate_").
export function addedFailures(run: MemberRun, adoptedPrefix: string, basePrefix: string): { added: string[]; gained: string[]; bothFail: string[]; compared: number } {
  const added: string[] = []
  const gained: string[] = []
  const bothFail: string[] = []
  let compared = 0

  for (const key of [...Object.keys(run.metrics), ...Object.keys(run.control)]) {
    if (!key.startsWith(adoptedPrefix)) {
      continue
    }

    const gate = key.slice(adoptedPrefix.length)
    const adopted = readKey(run, key)
    const base = readKey(run, `${basePrefix}${gate}`)

    if (base === undefined || adopted === undefined) {
      continue
    }

    compared += 1

    if (base === 1 && adopted === 0) {
      added.push(gate)
    } else if (base === 0 && adopted === 1) {
      gained.push(gate)
    } else if (base === 0 && adopted === 0) {
      bothFail.push(gate)
    }
  }

  return { added: [...new Set(added)], gained: [...new Set(gained)], bothFail: [...new Set(bothFail)], compared }
}
