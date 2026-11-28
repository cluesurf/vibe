// Block coarse-graining of partitioned pair dynamics on the line (milestone
// M11). Two exact notions of an effective rule at a larger scale:
//
//   - lumpability: a block map F (b cells to one coarse tone) is lumpable at a coarse step of tau rounds when
//     F(Phi^tau x) is a function of F(x) over every configuration of the infinite line. The center block's image
//     after tau rounds depends only on fine cells within tau c of it (c matchings per round), so a window of
//     2R + 1 blocks, R = ceil(tau c / b), reads it exactly. Two fine windows with one coarse window and two coarse
//     center images are a witness that F is not lumpable at ANY coarse radius (pad both identically outside);
//     no conflict over every fine window gives an effective rule G of radius R on the whole line.
//   - simulation contract: a section sigma (coarse tone to one fine block) is a contract at (b, tau) when Phi^tau
//     maps every configuration made of sigma blocks to one made of sigma blocks. Then G = sigma^-1 Phi^tau sigma is
//     a deterministic coarse rule on exactly that subset of configurations.
//
// The line's schedules are declared structure: edge (i, i + 1) has color i mod p and a round applies
// the colors in a fixed order, every edge oriented left to right. Exact integer arithmetic on Int8Array tones, no
// floating point in any decision, no random numbers.

import { PAIR_COUNT, PairTable } from '@/code/rule/pair-rule'
import { forwardRounds } from '@/code/rule/partitioned-pair'
import { PartitionSchedule } from '@/code/rule/partition-schedule'

export type LineSchedule = {
  name: string
  period: number
  // the colors in the order one round applies them
  order: readonly number[]
}

export const LINE_SCHEDULES: readonly LineSchedule[] = [
  { name: 'brick2', period: 2, order: [0, 1] },
  { name: 'brick3-forward', period: 3, order: [0, 1, 2] },
  { name: 'brick3-reverse', period: 3, order: [2, 1, 0] },
]

const mod = (x: number, m: number): number => ((x % m) + m) % m

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}

// One round (or several) on a finite window of the line in place. Cell k of the window sits at global position
// base + k; an edge is applied only when both its cells are in the window, so cells within rounds * colors of an end
// are not exact (callers read only the interior).
export function evolveWindow(input: {
  table: PairTable
  schedule: LineSchedule
  cells: Int8Array
  base: number
  rounds: number
}): void {
  const { table, schedule, cells, base, rounds } = input
  const w = cells.length
  const p = schedule.period

  for (let t = 0; t < rounds; t++) {
    for (const color of schedule.order) {
      for (let i = mod(color - base, p); i + 1 < w; i += p) {
        const out = table[(cells[i]! + 1) * 3 + (cells[i + 1]! + 1)]!

        cells[i] = Math.floor(out / 3) - 1
        cells[i + 1] = (out % 3) - 1
      }
    }
  }
}

// The same schedule on a ring of n cells whose cell 0 sits at global position `base` (n a multiple of the period),
// as a PartitionSchedule for code/rule/partitioned-pair: the independent path the gates re-run results on.
export function ringPartition(input: {
  schedule: LineSchedule
  n: number
  base: number
}): PartitionSchedule {
  const { schedule, n, base } = input
  const p = schedule.period

  if (n % p !== 0) {
    throw new Error(`coarse-block: ring of ${n} cells is not a multiple of period ${p}`)
  }

  const matchings = schedule.order.map(color => {
    const flat: number[] = []

    for (let i = 0; i < n; i++) {
      if (mod(base + i, p) === color) {
        flat.push(i, (i + 1) % n)
      }
    }

    return Int32Array.from(flat)
  })

  return {
    size: n,
    matchings,
    method: 'generator-coloring',
    colorCount: p,
    colorOrder: [...schedule.order],
    orientation: `left-to-right, edge (i, i + 1) of color (i + ${base}) mod ${p}`,
  }
}

// ---- block maps, declared before the first run ----

export type BlockMap = {
  name: string
  alphabet: readonly number[]
  // commutes with negating every tone (a C-conjugate rule then reads the negated run)
  negationSymmetric: boolean
  read(cells: Int8Array, start: number, b: number): number
}

const blockSum = (cells: Int8Array, start: number, b: number): number => {
  let s = 0

  for (let k = 0; k < b; k++) {
    s += cells[start + k]!
  }

  return s
}

export const BLOCK_MAPS: readonly BlockMap[] = [
  {
    name: 'majority',
    alphabet: [-1, 0, 1],
    negationSymmetric: true,
    read(cells, start, b) {
      let plus = 0
      let minus = 0

      for (let k = 0; k < b; k++) {
        const v = cells[start + k]!

        if (v > 0) {
          plus++
        } else if (v < 0) {
          minus++
        }
      }

      return 2 * plus > b ? 1 : 2 * minus > b ? -1 : 0
    },
  },
  {
    name: 'netSign',
    alphabet: [-1, 0, 1],
    negationSymmetric: true,
    read: (cells, start, b) => Math.sign(blockSum(cells, start, b)),
  },
  {
    name: 'occupancy',
    alphabet: [0, 1],
    negationSymmetric: true,
    read(cells, start, b) {
      for (let k = 0; k < b; k++) {
        if (cells[start + k] !== 0) {
          return 1
        }
      }

      return 0
    },
  },
  {
    name: 'netResidue',
    alphabet: [-1, 0, 1],
    negationSymmetric: true,
    read: (cells, start, b) => mod(blockSum(cells, start, b) + 1, 3) - 1,
  },
  {
    name: 'decimation',
    alphabet: [-1, 0, 1],
    negationSymmetric: true,
    read: (cells, start) => cells[start]!,
  },
]

export function blockMap(name: string): BlockMap {
  const m = BLOCK_MAPS.find(x => x.name === name)

  if (!m) {
    throw new Error(`coarse-block: no block map ${name}`)
  }

  return m
}

// ---- helpers ----

// the block offsets that are not schedule translates of one another
export function blockOffsets(b: number, schedule: LineSchedule): number[] {
  return Array.from({ length: gcd(b, schedule.period) }, (_, o) => o)
}

// the number of distinct fine phases of the blocks offset + j b, and so the coarse period of an effective rule
export function phaseCount(b: number, schedule: LineSchedule): number {
  return schedule.period / gcd(b, schedule.period)
}

export function windowRadius(b: number, tau: number, schedule: LineSchedule): number {
  return Math.ceil((tau * schedule.order.length) / b)
}

// the fine code of a block, sum (s_k + 1) 3^k
export function blockCode(cells: Int8Array | readonly number[], start: number, b: number): number {
  let code = 0
  let weight = 1

  for (let k = 0; k < b; k++) {
    code += (cells[start + k]! + 1) * weight
    weight *= 3
  }

  return code
}

export function blockOfCode(code: number, b: number): number[] {
  const out: number[] = []

  let x = code

  for (let k = 0; k < b; k++) {
    out.push((x % 3) - 1)
    x = Math.floor(x / 3)
  }

  return out
}

// ---- lumpability ----

export type LumpWitness = {
  phase: number
  base: number
  left: number[]
  right: number[]
  coarse: number[]
  images: [number, number]
}

export type LumpResult = {
  verdict: 'lumpable' | 'not' | 'cap'
  radius: number
  windowCells: number
  windowsRead: number
  witness: LumpWitness | null
  // per phase, the coarse center image (an alphabet index) of every coarse window (key: base-A digits, alphabet
  // indices, leftmost block lowest); only when lumpable
  g: Int8Array[] | null
}

export function lumpability(input: {
  table: PairTable
  schedule: LineSchedule
  b: number
  offset: number
  tau: number
  map: BlockMap
  cap: number
}): LumpResult {
  const { table, schedule, b, offset, tau, map, cap } = input
  const radius = windowRadius(b, tau, schedule)
  const blocks = 2 * radius + 1
  const w = blocks * b
  const a = map.alphabet.length
  const keys = a ** blocks
  const phases = phaseCount(b, schedule)
  const index = new Map(map.alphabet.map((t, i) => [t, i]))
  const total = 3 ** w
  const limit = Math.min(total, cap)
  const g: Int8Array[] = []
  const cells = new Int8Array(w)
  const work = new Int8Array(w)

  let read = 0

  for (let phase = 0; phase < phases; phase++) {
    const base = offset + (phase - radius) * b
    const image = new Int8Array(keys).fill(-2)
    // the first fine code read per coarse key: a Float64Array, since codes pass 2^31 once the cap is past 3^19
    const first = new Float64Array(keys).fill(-1)

    cells.fill(-1)

    for (let code = 0; code < limit; code++) {
      if (code > 0) {
        // odometer
        let k = 0

        while (cells[k] === 1) {
          cells[k] = -1
          k++
        }

        cells[k] = cells[k]! + 1
      }

      let key = 0
      let weight = 1

      for (let j = 0; j < blocks; j++) {
        key += index.get(map.read(cells, j * b, b))! * weight
        weight *= a
      }

      work.set(cells)
      evolveWindow({ table, schedule, cells: work, base, rounds: tau })

      const out = index.get(map.read(work, radius * b, b))!

      read++

      if (image[key] === -2) {
        image[key] = out
        first[key] = code
      } else if (image[key] !== out) {
        const coarse: number[] = []

        for (let j = 0; j < blocks; j++) {
          coarse.push(map.read(cells, j * b, b))
        }

        return {
          verdict: 'not',
          radius,
          windowCells: w,
          windowsRead: read,
          witness: {
            phase,
            base,
            left: Array.from(decodeCells(first[key]!, w)),
            right: Array.from(cells),
            coarse,
            images: [map.alphabet[image[key]!]!, map.alphabet[out]!],
          },
          g: null,
        }
      }
    }

    g.push(image)
  }

  return {
    verdict: limit < total ? 'cap' : 'lumpable',
    radius,
    windowCells: w,
    windowsRead: read,
    witness: null,
    g: limit < total ? null : g,
  }
}

export function decodeCells(code: number, w: number): Int8Array {
  const out = new Int8Array(w)

  let x = code

  for (let i = 0; i < w; i++) {
    out[i] = (x % 3) - 1
    x = Math.floor(x / 3)
  }

  return out
}

// Re-run a witness on a ring by code/rule/partitioned-pair (an independent round): both windows padded with the
// same vacuum, the coarse starts must agree block for block and the coarse center images must differ.
export function checkWitness(input: {
  table: PairTable
  schedule: LineSchedule
  b: number
  tau: number
  map: BlockMap
  witness: LumpWitness
  radius: number
}): boolean {
  const { table, schedule, b, tau, map, witness, radius } = input
  const w = witness.left.length
  const unit = lcm(schedule.period, b)
  const pad = tau * schedule.order.length + b
  const n = Math.ceil((w + 2 * pad) / unit) * unit
  // the window starts at ring cell `pad`, so ring cell 0 sits at global position base - pad
  const ringBase = witness.base - pad
  const partition = ringPartition({ schedule, n, base: ringBase })

  const run = (cells: readonly number[]): { start: number[]; center: number } => {
    const state = new Int8Array(n)

    cells.forEach((v, k) => {
      state[pad + k] = v
    })

    const start: number[] = []

    for (let j = 0; j < 2 * radius + 1; j++) {
      start.push(map.read(state, pad + j * b, b))
    }

    const after = forwardRounds({ table, schedule: partition, state, rounds: tau })

    return { start, center: map.read(after, pad + radius * b, b) }
  }

  const x = run(witness.left)
  const y = run(witness.right)

  return x.start.join(',') === y.start.join(',') && x.center !== y.center
}

// ---- simulation contracts ----

export type Contract = {
  // the fine block code of each alphabet letter, in alphabet order
  sigma: number[]
  radius: number
  // per phase, the coarse center image (an alphabet index) of every coarse window
  g: Int8Array[]
}

export function contractFor(input: {
  table: PairTable
  schedule: LineSchedule
  b: number
  offset: number
  tau: number
  alphabetSize: number
  sigma: readonly number[]
}): Contract | null {
  const { table, schedule, b, offset, tau, alphabetSize, sigma } = input
  const radius = windowRadius(b, tau, schedule)
  const blocks = 2 * radius + 1
  const w = blocks * b
  const keys = alphabetSize ** blocks
  const phases = phaseCount(b, schedule)
  const inverse = new Int8Array(3 ** b).fill(-1)
  const patterns = sigma.map(code => blockOfCode(code, b))

  sigma.forEach((code, i) => {
    inverse[code] = i
  })

  const cells = new Int8Array(w)
  const g: Int8Array[] = []

  for (let phase = 0; phase < phases; phase++) {
    const base = offset + (phase - radius) * b
    const image = new Int8Array(keys)

    for (let key = 0; key < keys; key++) {
      let x = key

      for (let j = 0; j < blocks; j++) {
        const letter = x % alphabetSize

        x = Math.floor(x / alphabetSize)
        cells.set(patterns[letter]!, j * b)
      }

      evolveWindow({ table, schedule, cells, base, rounds: tau })

      const back = inverse[blockCode(cells, radius * b, b)]!

      if (back < 0) {
        return null
      }

      image[key] = back
    }

    g.push(image)
  }

  return { sigma: [...sigma], radius, g }
}

// Every section consistent with a block map (F(sigma(t)) = t), or with no map every injective section on the ternary
// alphabet, in lexicographic order of the block codes.
export function sections(input: { b: number; map: BlockMap | null }): {
  alphabet: readonly number[]
  list: number[][]
} {
  const { b, map } = input
  const codes = 3 ** b
  const alphabet = map ? map.alphabet : [-1, 0, 1]
  const options = alphabet.map(t => {
    const out: number[] = []

    for (let c = 0; c < codes; c++) {
      if (!map || map.read(Int8Array.from(blockOfCode(c, b)), 0, b) === t) {
        out.push(c)
      }
    }

    return out
  })
  const list: number[][] = []

  const pick = (i: number, chosen: number[]): void => {
    if (i === alphabet.length) {
      list.push([...chosen])

      return
    }

    for (const c of options[i]!) {
      if (!chosen.includes(c)) {
        chosen.push(c)
        pick(i + 1, chosen)
        chosen.pop()
      }
    }
  }

  pick(0, [])

  return { alphabet, list }
}

// ---- naming an effective rule ----

// a coarse window's alphabet indices from its key
function digits(key: number, base: number, length: number): number[] {
  const out: number[] = []

  let x = key

  for (let i = 0; i < length; i++) {
    out.push(x % base)
    x = Math.floor(x / base)
  }

  return out
}

export type Candidate = {
  name: string
  table: PairTable
  schedule: LineSchedule
  rounds: number
}

export type EffectiveName =
  | { kind: 'identity' }
  | { kind: 'shift'; shift: number }
  // radius 0: each coarse cell maps its own letter by a fixed permutation of its phase (letters as alphabet tones)
  | { kind: 'onsite'; maps: number[][] }
  | { kind: 'pair'; rule: string; schedule: string; rounds: number; alignment: number }
  | { kind: 'local'; radius: number; phases: number }

export function effectiveNameKey(e: EffectiveName): string {
  switch (e.kind) {
    case 'identity':
      return 'identity'
    case 'shift':
      return `shift ${e.shift}`
    case 'onsite':
      return `onsite ${e.maps.map(m => `[${m.join(' ')}]`).join('')}`
    case 'pair':
      return `pair ${e.rule} on ${e.schedule} x${e.rounds} @${e.alignment}`
    case 'local':
      return `local r${e.radius} phases ${e.phases}`
  }
}

// G of radius `radius` per phase (values alphabet indices) at coarse cell j of phase j mod phases
export function nameEffective(input: {
  g: readonly Int8Array[]
  radius: number
  alphabet: readonly number[]
  candidates: readonly Candidate[]
}): EffectiveName {
  const { g, radius, alphabet, candidates } = input
  const a = alphabet.length
  const blocks = 2 * radius + 1
  const keys = a ** blocks
  const phases = g.length

  const every = (f: (window: number[], value: number, phase: number) => boolean): boolean => {
    for (let phase = 0; phase < phases; phase++) {
      for (let key = 0; key < keys; key++) {
        if (!f(digits(key, a, blocks), g[phase]![key]!, phase)) {
          return false
        }
      }
    }

    return true
  }

  if (every((win, v) => win[radius] === v)) {
    return { kind: 'identity' }
  }

  for (let s = 1; s <= radius; s++) {
    for (const shift of [s, -s]) {
      if (every((win, v) => win[radius - shift] === v)) {
        return { kind: 'shift', shift }
      }
    }
  }

  // on-site: G reads only the center cell
  const onsite: number[][] = Array.from({ length: phases }, () => new Array<number>(a).fill(-1))

  if (
    every((win, v, phase) => {
      const row = onsite[phase]!
      const c = win[radius]!

      if (row[c] === -1) {
        row[c] = v
      }

      return row[c] === v
    })
  ) {
    return { kind: 'onsite', maps: onsite.map(row => row.map(i => alphabet[i]!)) }
  }

  // coarse partitioned rules, on windows of radius max(radius, rounds * colors)
  for (const c of candidates) {
    const rc = Math.max(radius, c.rounds * c.schedule.order.length)
    const cb = 2 * rc + 1
    const ck = a ** cb
    const period = lcm(phases, c.schedule.period)

    for (let alignment = 0; alignment < c.schedule.period; alignment++) {
      let ok = true

      const cells = new Int8Array(cb)

      for (let j = 0; j < period && ok; j++) {
        const gj = g[j % phases]!

        for (let key = 0; key < ck && ok; key++) {
          const win = digits(key, a, cb)

          for (let i = 0; i < cb; i++) {
            cells[i] = alphabet[win[i]!]!
          }

          evolveWindow({
            table: c.table,
            schedule: c.schedule,
            cells,
            base: j - rc + alignment,
            rounds: c.rounds,
          })

          const out = alphabet.indexOf(cells[rc]!)

          let inner = 0
          let weight = 1

          for (let i = rc - radius; i <= rc + radius; i++) {
            inner += win[i]! * weight
            weight *= a
          }

          if (out < 0 || gj[inner] !== out) {
            ok = false
          }
        }
      }

      if (ok) {
        return {
          kind: 'pair',
          rule: c.name,
          schedule: c.schedule.name,
          rounds: c.rounds,
          alignment,
        }
      }
    }
  }

  // the least radius G reads
  for (let r = 0; r <= radius; r++) {
    let ok = true

    for (let phase = 0; phase < phases && ok; phase++) {
      const seen = new Map<number, number>()

      for (let key = 0; key < keys && ok; key++) {
        const win = digits(key, a, blocks)

        let inner = 0
        let weight = 1

        for (let i = radius - r; i <= radius + r; i++) {
          inner += win[i]! * weight
          weight *= a
        }

        const v = g[phase]![key]!
        const prior = seen.get(inner)

        if (prior === undefined) {
          seen.set(inner, v)
        } else if (prior !== v) {
          ok = false
        }
      }
    }

    if (ok) {
      return { kind: 'local', radius: r, phases }
    }
  }

  return { kind: 'local', radius, phases }
}

// G applied to every configuration of a coarse ring of m cells (phase of cell j is j mod phases): the image of each
// configuration as alphabet indices
export function ringImage(input: {
  g: readonly Int8Array[]
  radius: number
  alphabetSize: number
  config: readonly number[]
}): number[] {
  const { g, radius, alphabetSize, config } = input
  const m = config.length
  const phases = g.length

  return config.map((_, j) => {
    let key = 0
    let weight = 1

    for (let i = -radius; i <= radius; i++) {
      key += config[mod(j + i, m)]! * weight
      weight *= alphabetSize
    }

    return g[j % phases]![key]!
  })
}

// Re-derive a contract on every configuration of a coarse ring of m cells by the fine ring run
// (code/rule/partitioned-pair): returns the number of configurations where the fine run leaves the sigma blocks or
// disagrees with G.
export function contractRingMismatches(input: {
  table: PairTable
  schedule: LineSchedule
  b: number
  offset: number
  tau: number
  contract: Contract
  alphabetSize: number
  m: number
}): { configs: number; mismatches: number; fineD: boolean } {
  const { table, schedule, b, offset, tau, contract, alphabetSize, m } = input
  const excitation = (s: Int8Array): number => s.reduce((acc, v) => acc + v * v, 0)
  const n = m * b
  const partition = ringPartition({ schedule, n, base: offset })
  const inverse = new Int8Array(3 ** b).fill(-1)
  const patterns = contract.sigma.map(code => blockOfCode(code, b))

  contract.sigma.forEach((code, i) => {
    inverse[code] = i
  })

  const configs = alphabetSize ** m

  let mismatches = 0
  // the fine D conserved on the subset itself (every configuration of sigma blocks on this ring)
  let fineD = true

  for (let key = 0; key < configs; key++) {
    const config = digits(key, alphabetSize, m)
    const state = new Int8Array(n)

    config.forEach((letter, j) => state.set(patterns[letter]!, j * b))

    const after = forwardRounds({ table, schedule: partition, state, rounds: tau })

    fineD &&= excitation(after) === excitation(state)

    const predicted = ringImage({
      g: contract.g,
      radius: contract.radius,
      alphabetSize,
      config,
    })

    for (let j = 0; j < m; j++) {
      if (inverse[blockCode(after, j * b, b)] !== predicted[j]) {
        mismatches++
        break
      }
    }
  }

  return { configs, mismatches, fineD }
}

// Coarse conserved quantities of G on every configuration of a coarse ring of m cells: Q = sum of tones, D = sum of
// squares, the sum mod 3.
export function coarseConservation(input: {
  g: readonly Int8Array[]
  radius: number
  alphabet: readonly number[]
  m: number
}): { q: boolean; d: boolean; residue: boolean } {
  const { g, radius, alphabet, m } = input
  const a = alphabet.length
  const out = { q: true, d: true, residue: true }

  for (let key = 0; key < a ** m; key++) {
    const config = digits(key, a, m)
    const image = ringImage({ g, radius, alphabetSize: a, config })
    const tones = config.map(i => alphabet[i]!)
    const next = image.map(i => alphabet[i]!)
    const q0 = tones.reduce((s, v) => s + v, 0)
    const q1 = next.reduce((s, v) => s + v, 0)
    const d0 = tones.reduce((s, v) => s + v * v, 0)
    const d1 = next.reduce((s, v) => s + v * v, 0)

    out.q &&= q0 === q1
    out.d &&= d0 === d1
    out.residue &&= mod(q0, 3) === mod(q1, 3)
  }

  return out
}

// Fine speeds: a lone tone on each uniform background the rule fixes, on a ring of n cells (a multiple of 6), every
// start phase; the displacement over the least period, at most maxPeriod rounds, after which the state is a
// translate of the start, as a reduced fraction in cells per round ('wander' when none). With n > 2 * colors *
// maxPeriod no translate can come from wrapping the ring.
export function fineSpeeds(input: {
  table: PairTable
  schedule: LineSchedule
  n: number
  maxPeriod: number
}): string[] {
  const { table, schedule, n, maxPeriod } = input

  if (n <= 2 * schedule.order.length * maxPeriod) {
    throw new Error(`coarse-block: ring of ${n} cells can wrap within ${maxPeriod} rounds`)
  }

  const out = new Set<string>()

  for (const bg of [-1, 0, 1]) {
    const pair = (bg + 1) * 4

    if (table[pair] !== pair) {
      continue
    }

    for (const tone of [-1, 0, 1]) {
      if (tone === bg) {
        continue
      }

      for (let pos = 0; pos < schedule.period; pos++) {
        const partition = ringPartition({ schedule, n, base: 0 })
        const start = new Int8Array(n).fill(bg)

        start[pos] = tone

        let state = start
        let found: string | null = null

        for (let t = 1; t <= maxPeriod && found === null; t++) {
          state = forwardRounds({ table, schedule: partition, state, rounds: 1 })

          // only translations by a multiple of the period are symmetries of the schedule: a lone tone on another
          // phase has the same shape but meets the colors in another order
          for (let d = 0; d < n; d += schedule.period) {
            let same = true

            for (let i = 0; i < n && same; i++) {
              same = state[(i + d) % n] === start[i]
            }

            if (same) {
              const disp = d > n / 2 ? d - n : d
              const k = gcd(Math.abs(disp), t) || 1

              found = `${disp / k}/${t / k}`
              break
            }
          }
        }

        out.add(found ?? 'wander')
      }
    }
  }

  return [...out].sort()
}

export function fraction(num: number, den: number): string {
  const k = gcd(Math.abs(num), den) || 1

  return `${num / k}/${den / k}`
}

// tables are compared as keys
export function tableKeyOf(table: PairTable): string {
  return Array.from(table.slice(0, PAIR_COUNT)).join(',')
}
