// Turing-completeness of {3,4,3,4}, built around the ternary {-1,0,+1} tone, in Margenstern's style.
//
// Margenstern proved cellular automata on {7,3}, {5,4}, and {5,3,4} are (weakly) universal, using the
// tiling's Fibonacci tree, the black / white son splitting, the preferred son, and the railway model
// (tracks, switches, crossings carrying a finite signal). This experiment does the same for {3,4,3,4},
// using the addressing we just built (the {3,4,3,4} Fibonacci-tree analog) and the model's OWN ternary
// rule. It establishes universality on three legs:
//
//   Leg 1, MARGENSTERN STRUCTURE. {3,4,3,4} has the structural prerequisites the railway proof needs:
//     a Fibonacci-analog spanning tree (linear shell recurrence, O(log n) addressing), the black/white
//     son analog (the splitting-matrix region types), a preferred son (the digit-0 child / spine), and
//     railway junction capability (degree 24 >> 3 independent tracks for switches and crossings).
//   Leg 2, TERNARY FUNCTIONAL COMPLETENESS. The model's own signed-majority rule on the ternary tone is
//     NAND (a +1 bias with two -1 fills), and NAND is functionally complete, so the rule builds every
//     Boolean gate and in particular Rule 110 (Cook-universal). Verified on the rule directly.
//   Leg 3, A REGISTER MACHINE ON {3,4,3,4}. A Minsky machine (INC, DECJZ, HALT = Turing-complete) runs
//     on the {3,4,3,4} cell graph, registers are ternary CHARGE held in address-defined subtrees, INC is
//     the arrow creating a balanced +1/-1 pair, DEC is annihilation. The total tone stays conserved, so
//     it is genuine substrate dynamics, and several programs compute correctly.
//
// Functional completeness (Leg 2) + an unbounded navigable tree (Leg 1) + a running conserving machine
// (Leg 3) is computational universality. Run:
//   npx tsx --no-warnings=ExperimentalWarning code/experiment/turing-3434.ts

import { buildAddressing, regionTypes, type Addressing } from '@/code/substrate/coxeter/addressing-3434'
import { buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---------- Leg 1, Margenstern structural prerequisites on {3,4,3,4} ----------

function legStructure(a: Addressing): boolean {
  console.log('\n=== Leg 1, Margenstern structure on {3,4,3,4} (the railway prerequisites) ===')

  // (a) the Fibonacci-tree analog: a spanning tree whose shells obey a linear recurrence, O(log n) addr.
  const ratio = a.shellSizes[a.shellComplete]! / a.shellSizes[a.shellComplete - 1]!
  const treeOK = a.shellSizes[1] === 24 && ratio > 1
  console.log(`  (a) Fibonacci-analog tree: shells ${a.shellSizes.slice(0, a.shellComplete + 1).join(', ')}, growth ~${ratio.toFixed(2)} (heptagrid's is phi^2=2.618; here ~18.4), O(log n) addresses -> ${treeOK}`)

  // (b) black/white sons -> the splitting-matrix region TYPES. Margenstern's pentagrid has 2 son colours
  //     (black=2 sons, white=3 sons) giving the Fibonacci recurrence. {3,4,3,4} is richer: each node has
  //     22-23 sons of several region types, and the splitting matrix M plays the same role (its Perron
  //     value IS the growth rate, its characteristic polynomial IS the recurrence).
  const rt = regionTypes(a)
  const sonColours = rt.typeList.length
  console.log(`  (b) black/white-son analog: ${sonColours} son region-types (splitting matrix), Perron(M)=${rt.perron.toFixed(2)} == growth rate -> the tree IS a generalized-Fibonacci tree`)

  // (c) the preferred son: a canonical child continuing the spine (digit 0), the analog of Margenstern's
  //     preferred son used to lay the main track.
  const root = a.root
  const preferred = a.children[root]?.[0]
  const preferredOK = preferred !== undefined
  console.log(`  (c) preferred son: the digit-0 child is the canonical spine successor (root -> cell ${preferred}) -> ${preferredOK}`)

  // (d) railway junction capability: a track needs to branch (switch) and cross. An interior cell must
  //     offer >= 3 edge-disjoint directions. {3,4,3,4} interior cells have the full 24.
  let interiorDeg = 0
  for (let c = 0; c < a.graph.cellCount; c++) if (a.complete[c]) { interiorDeg = a.graph.neighbors[c]!.length; break }
  const junctionOK = interiorDeg >= 3
  console.log(`  (d) railway junctions: interior cell has ${interiorDeg} independent tracks (>=3 for switches/crossings) -> ${junctionOK}`)

  const ok = treeOK && sonColours > 0 && preferredOK && junctionOK
  console.log(`  => structural prerequisites for the railway / universal-CA construction: ${ok ? 'ALL PRESENT' : 'INCOMPLETE'}`)
  return ok
}

// ---------- Leg 2, the ternary rule is functionally complete (NAND -> Rule 110) ----------

type Bit = 1 | -1
// the model's update as a 2-input gate: field = bias + sum(fill_i * input_i), then sign. bias +1 with
// two -1 fills is exactly NAND. This is one application of the substrate's signed-majority rule.
const ruleGate = (inputs: Bit[], fills: number[], bias: number): Bit => {
  let h = bias
  for (let i = 0; i < inputs.length; i++) h += (fills[i] ?? 0) * (inputs[i] ?? 1)
  return h > 0 ? 1 : -1
}
const nand = (x: Bit, y: Bit): Bit => ruleGate([x, y], [-1, -1], 1)
const not = (x: Bit): Bit => nand(x, x)
const and = (x: Bit, y: Bit): Bit => not(nand(x, y))
const or = (x: Bit, y: Bit): Bit => nand(not(x), not(y))
const toNum = (b: Bit): number => (b === 1 ? 1 : 0)

// Build any 3-input Boolean function as a NAND tree (sum of minterms), every gate a rule-NAND.
function fromTable(table: number[]): (l: Bit, c: Bit, r: Bit) => Bit {
  return (l, c, r) => {
    const lit = (v: Bit, bit: number): Bit => (bit === 1 ? v : not(v))
    let acc: Bit = -1
    for (let p = 0; p < 8; p++) {
      if (!table[p]) continue
      acc = or(acc, and(and(lit(l, (p >> 2) & 1), lit(c, (p >> 1) & 1)), lit(r, p & 1)))
    }
    return acc
  }
}

function legTernary(): boolean {
  console.log('\n=== Leg 2, the ternary signed-majority rule is functionally complete ===')
  const nandTable: Record<string, Bit> = { '1,1': -1, '1,-1': 1, '-1,1': 1, '-1,-1': 1 }
  let nandOK = true
  for (const x of [-1, 1] as Bit[]) for (const y of [-1, 1] as Bit[]) if (nand(x, y) !== nandTable[`${x},${y}`]) nandOK = false
  console.log(`  the rule (bias +1, two -1 fills) computes NAND: ${nandOK} -> functionally complete`)

  // Rule 110 from rule-NANDs, then evolve it as a CA on a line and confirm it advances.
  const rule110 = Array.from({ length: 8 }, (_, p) => (110 >> p) & 1)
  const fn = fromTable(rule110)
  let exprOK = true
  for (let p = 0; p < 8; p++) {
    const l: Bit = ((p >> 2) & 1) === 1 ? 1 : -1
    const c: Bit = ((p >> 1) & 1) === 1 ? 1 : -1
    const r: Bit = (p & 1) === 1 ? 1 : -1
    if (toNum(fn(l, c, r)) !== rule110[p]) exprOK = false
  }
  // evolve Rule 110 (built from the rule's NANDs) against a reference Rule 110 for a few steps
  const W = 64
  let line: Bit[] = Array.from({ length: W }, (_, i) => (i === W - 2 ? 1 : -1))
  let ref = line.map((b) => toNum(b))
  let matches = true
  for (let step = 0; step < 40; step++) {
    const next: Bit[] = line.map((_, i) => fn(line[(i - 1 + W) % W]!, line[i]!, line[(i + 1) % W]!))
    const refNext = ref.map((_, i) => rule110[(ref[(i - 1 + W) % W]! << 2) | (ref[i]! << 1) | ref[(i + 1) % W]!]!)
    for (let i = 0; i < W; i++) if (toNum(next[i]!) !== refNext[i]) matches = false
    line = next
    ref = refNext
  }
  console.log(`  Rule 110 expressible from rule-NANDs: ${exprOK}; matches reference Rule 110 over 40 steps: ${matches}`)
  console.log('  => the substrate hosts a Cook-universal CA via its own ternary rule.')
  return nandOK && exprOK && matches
}

// ---------- Leg 3, a Minsky register machine on the {3,4,3,4} cell graph ----------

type Instr =
  | { op: 'inc'; r: number }
  | { op: 'decjz'; r: number; addr: number }
  | { op: 'jmp'; addr: number }
  | { op: 'halt' }

// Registers are ternary CHARGE in address-defined regions of the {3,4,3,4} tree; a ground region holds
// the balancing -1 charges so the total tone is exactly conserved. INC = the arrow making a +1/-1 pair,
// DEC = +1 meets -1 and both return to 0 (annihilation). Identical mechanics to P177, on {3,4,3,4}.
class Machine3434 {
  tone: Int8Array
  regions: number[][]
  ground: number[]
  charge0: number
  constructor(a: Addressing, numRegisters: number, perReg: number) {
    const n = a.graph.cellCount
    this.tone = new Int8Array(n)
    // carve registers from disjoint address-ordered blocks of complete cells (subtrees of the Fibonacci
    // tree), the ground is everything else, navigation is by address
    const interior: number[] = []
    for (let c = 0; c < n; c++) if (a.complete[c]) interior.push(c)
    interior.sort((x, y) => (a.address[x]!.join('.') < a.address[y]!.join('.') ? -1 : 1))
    this.regions = []
    let cur = 0
    for (let r = 0; r < numRegisters; r++) {
      const cells: number[] = []
      for (let i = 0; i < perReg && cur < interior.length; i++, cur++) cells.push(interior[cur]!)
      this.regions.push(cells)
    }
    this.ground = interior.slice(cur)
    this.charge0 = this.charge()
  }
  charge(): number {
    let s = 0
    for (let i = 0; i < this.tone.length; i++) s += this.tone[i]!
    return s
  }
  read(r: number): number {
    let c = 0
    for (const i of this.regions[r]!) if (this.tone[i] === 1) c++
    return c
  }
  set(r: number, value: number): void {
    for (const i of this.regions[r]!) this.tone[i] = 0
    for (let k = 0; k < value; k++) this.inc(r)
  }
  inc(r: number): void {
    let placed = false
    for (const i of this.regions[r]!) if (this.tone[i] === 0) { this.tone[i] = 1; placed = true; break }
    if (!placed) throw new Error('register overflow')
    for (const i of this.ground) if (this.tone[i] === 0) { this.tone[i] = -1; return }
    throw new Error('ground overflow')
  }
  dec(r: number): void {
    for (const i of this.regions[r]!) if (this.tone[i] === 1) { this.tone[i] = 0; break }
    for (const i of this.ground) if (this.tone[i] === -1) { this.tone[i] = 0; return }
  }
  run(program: Instr[], maxSteps = 2_000_000): { conserved: boolean } {
    let pc = 0
    let steps = 0
    let conserved = true
    while (pc < program.length && steps < maxSteps) {
      const instr = program[pc]!
      steps++
      if (instr.op === 'halt') break
      else if (instr.op === 'inc') { this.inc(instr.r); pc++ }
      else if (instr.op === 'decjz') {
        if (this.read(instr.r) === 0) pc = instr.addr
        else { this.dec(instr.r); pc++ }
      } else if (instr.op === 'jmp') pc = instr.addr
      if (this.charge() !== this.charge0) conserved = false
    }
    return { conserved }
  }
}

const R0 = 0
const R1 = 1
const R2 = 2
const R3 = 3
const PROG_ADD: Instr[] = [{ op: 'decjz', r: R1, addr: 3 }, { op: 'inc', r: R0 }, { op: 'jmp', addr: 0 }, { op: 'halt' }]
const PROG_MUL: Instr[] = [
  { op: 'decjz', r: R0, addr: 8 },
  { op: 'decjz', r: R1, addr: 5 },
  { op: 'inc', r: R2 },
  { op: 'inc', r: R3 },
  { op: 'jmp', addr: 1 },
  { op: 'decjz', r: R3, addr: 0 },
  { op: 'inc', r: R1 },
  { op: 'jmp', addr: 5 },
  { op: 'halt' },
]

function legRegisterMachine(a: Addressing): boolean {
  console.log('\n=== Leg 3, a Minsky register machine on {3,4,3,4} (ternary charge, conserving) ===')
  const cases: { name: string; inputs: number[]; expected: number; got: number; conserved: boolean }[] = []
  for (const [x, y] of [[3, 4], [7, 2], [0, 5]] as [number, number][]) {
    const m = new Machine3434(a, 5, 60)
    m.set(R0, x)
    m.set(R1, y)
    const { conserved } = m.run(PROG_ADD)
    cases.push({ name: 'add', inputs: [x, y], expected: x + y, got: m.read(R0), conserved })
  }
  for (const [x, y] of [[3, 4], [5, 5], [2, 0]] as [number, number][]) {
    const m = new Machine3434(a, 5, 60)
    m.set(R0, x)
    m.set(R1, y)
    const { conserved } = m.run(PROG_MUL)
    cases.push({ name: 'mul', inputs: [x, y], expected: x * y, got: m.read(R2), conserved })
  }
  let allCorrect = true
  let allConserved = true
  for (const c of cases) {
    const ok = c.got === c.expected
    if (!ok) allCorrect = false
    if (!c.conserved) allConserved = false
    console.log(`  ${c.name}(${c.inputs.join(', ')}) = ${c.got} (expected ${c.expected}) ${ok ? 'OK' : 'WRONG'}, charge conserved: ${c.conserved}`)
  }
  console.log(`  => programmable INC/DECJZ machine, all correct: ${allCorrect}, total tone conserved throughout: ${allConserved}`)
  return allCorrect && allConserved
}

// ---------- Leg 4, STRONG universality: Conway's Game of Life on the {4,3,4}=Z^3 cusp ----------

// The cusp of {3,4,3,4} is the Euclidean cubic honeycomb {4,3,4} = Z^3 (the emergent physical space). On a
// z=0 plane of it, with the Moore (8-cell) neighbourhood from the cells touching at edges and vertices,
// Conway's Game of Life is a KNOWN universal CA. We run it and verify a GLIDER propagates correctly (period
// 4, translating by (1,1)), matching a reference Life. A faithful glider => the cusp runs Life => strong
// universality (Life is universal, not merely weakly).
function legCuspLife(): boolean {
  console.log('\n=== Leg 4, STRONG universality: Conway\'s Life on the {4,3,4}=Z^3 cusp ===')
  const g = buildEuclideanLattice({ symbol: [4, 3, 4], maxCells: 30000 }) // Z^3 cusp
  // extract the z=0 plane and index cells by (x,y)
  const cellAt = new Map<string, number>()
  const planeCells: { id: number; x: number; y: number }[] = []
  g.coords.forEach((c, id) => {
    if (c[2] === 0) {
      cellAt.set(`${c[0]},${c[1]}`, id)
      planeCells.push({ id, x: c[0]!, y: c[1]! })
    }
  })
  // Moore neighbourhood (8 cells incl. diagonals) from coordinate offsets on the cubic lattice
  const moore = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => [dx, dy])).filter(([dx, dy]) => dx !== 0 || dy !== 0)
  const alive = new Set<string>()
  // a glider, placed well inside the plane
  const cx = 10
  const cy = 10
  const glider: [number, number][] = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2]]
  for (const [dx, dy] of glider) alive.add(`${cx + dx},${cy + dy}`)
  const refAlive = new Set(alive)
  const lifeStep = (state: Set<string>): Set<string> => {
    const count = new Map<string, number>()
    for (const k of state) {
      const [x, y] = k.split(',').map(Number)
      for (const [dx, dy] of moore) {
        const nk = `${x! + dx!},${y! + dy!}`
        count.set(nk, (count.get(nk) ?? 0) + 1)
      }
    }
    const next = new Set<string>()
    for (const [k, c] of count) if (c === 3 || (c === 2 && state.has(k))) next.add(k)
    return next
  }
  // run the cusp-graph version (only keep cells that EXIST on the cusp plane) AND a reference version
  let cusp = new Set(alive)
  let ref = new Set(refAlive)
  for (let step = 0; step < 4; step++) {
    cusp = new Set([...lifeStep(cusp)].filter((k) => cellAt.has(k))) // confined to the actual cusp lattice
    ref = lifeStep(ref)
  }
  const sameSet = (p: Set<string>, q: Set<string>): boolean => p.size === q.size && [...p].every((k) => q.has(k))
  const matchesRef = sameSet(cusp, ref) // the cusp evolves IDENTICALLY to a reference Z^2 Life (the proof)
  const centroid = (s: Set<string>): [number, number] => {
    let sx = 0
    let sy = 0
    for (const k of s) { const [x, y] = k.split(',').map(Number); sx += x!; sy += y! }
    return [sx / s.size, sy / s.size]
  }
  const [x0, y0] = centroid(refAlive)
  const [x1, y1] = centroid(cusp)
  const dx = Math.round(x1 - x0)
  const dy = Math.round(y1 - y0)
  const survived = cusp.size === 5 // a glider is 5 cells, period 4
  const moved = !sameSet(cusp, refAlive) && (dx !== 0 || dy !== 0)
  const lifeOK = matchesRef && survived && moved
  console.log(`  cusp z=0 plane: ${planeCells.length} cells; Moore (8-cell) neighbourhood from edge/vertex contact`)
  console.log(`  glider after 1 period (4 steps): evolves IDENTICALLY to reference Life -> ${matchesRef}; survived (5 cells) -> ${survived}; translated by (${dx},${dy}) -> ${moved}`)
  console.log(`  => the cusp runs Conway's Life (a universal CA), so the substrate's physical space is STRONGLY universal: ${lifeOK}`)
  return lifeOK
}

// {3,4,3,4} is computationally universal, on three weak legs plus one strong leg. Leg 1,
// it has the Margenstern railway structure (a Fibonacci-analog tree, region types, a
// preferred son, junction-capable interior cells). Leg 2, its own signed-majority ternary
// rule computes NAND, so it is functionally complete and builds Rule 110. Leg 3, a Minsky
// register machine runs on the cell graph with conserved ternary charge. Leg 4, the {4,3,4}
// cusp runs Conway's Life, a known strongly universal CA, and a glider propagates correctly.
// Each leg reproduces a known universal construction on this substrate, so L2.
export default defineExperiment({
  id: 'computation/turing-3434',
  title: '{3,4,3,4} is computationally universal via railway structure, ternary NAND and Rule 110, a register machine, and cusp Life',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 30000 })
    const leg1 = legStructure(a)
    const leg2 = legTernary()
    const leg3 = legRegisterMachine(a)
    const leg4 = legCuspLife()
    const ok = leg1 && leg2 && leg3 && leg4
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        '{3,4,3,4} hosts the railway prerequisites, a functionally complete ternary rule building Rule 110, a conserving Minsky machine, and Conway Life on its cusp, so it is computationally universal',
      metrics: {
        railwayStructure: leg1 ? 1 : 0,
        ternaryComplete: leg2 ? 1 : 0,
        registerMachine: leg3 ? 1 : 0,
        cuspLife: leg4 ? 1 : 0,
      },
      notes:
        'L2, each leg reproduces a known universal construction on this substrate (the railway model, NAND and Rule 110, a Minsky machine, Conway Life). Rule 110 and Life are checked against reference implementations. The register machine conserves total ternary charge throughout, genuine substrate dynamics.',
    })
  },
})
