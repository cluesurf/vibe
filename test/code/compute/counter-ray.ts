// code/compute/counter-ray.ts against the standalone copy inside test/verify/turing-universality-native-3434.ts.
//
// The verifier imports nothing by design, so its tables live inside its own closure. This suite reads the
// verifier's source, adds (in memory: the verifier file is never changed) a recorder around its origin controller
// and a dump of its tables right after its three Bennett runs, runs that copy through tsx on stdin, and compares:
//
//   - the line map and its inverse on all 144 symbol pairs
//   - the antipodal slots and the 12 lines
//   - the 24 transport frames, all 25 entries of each, exactly
//   - the controller, forward and inverse, on every (cell 0 ports, controller state) the verifier fed it during
//     its runs (0, 2), (3, 1) and (5, 1): 1,106 forward and 1,106 inverse beats
//
// The controller agreement is over those reachable inputs only; the controller is not a finite table.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONTROLLER_PHASES,
  type ControllerPhase,
  type ControllerState,
  LINES,
  OPPOSITE_SLOT,
  SYMBOL_COUNT,
  TRANSPORTS,
  controllerForward,
  controllerInverse,
  lineMap,
  lineMapInverse,
} from '@/code/compute/counter-ray'
import { check, equal, exactArray, ok, suite } from '@/test/code/harness'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const VERIFIER = join(ROOT, 'test', 'verify', 'turing-universality-native-3434.ts')
// the dump is written into the gitignored tmp/ (a pipe would cut it at 64 KB when the copy exits)
const DUMP_DIR = join(ROOT, 'tmp', 'counter-ray-agreement')

// the verifier's phase names, in the order of CONTROLLER_PHASES
const VERIFIER_PHASES = [
  'START',
  'L1_HEAD_ODD',
  'L1_DISPATCH_EVEN',
  'L1_DEC1',
  'L1_DEC1_ODD',
  'L1_INC2A',
  'L1_INC2A_ODD',
  'L1_INC2B',
  'L1_INC2B_ODD',
  'L1_INC3',
  'L2_HEAD_ODD',
  'L2_DISPATCH_EVEN',
  'L2_DEC3',
  'L2_DEC3_ODD',
  'L2_INC1',
  'HALT_ODD',
  'HALT_EVEN',
] as const

type VerifierCtrl = { phase: string; launch: number; ret: number }

type ControllerRecord = {
  dir: 'fwd' | 'inv'
  inPorts: number[]
  inCtrl: VerifierCtrl
  outPorts: number[]
  outCtrl: VerifierCtrl
}

type Dump = {
  line: [number, number][]
  lineInv: [number, number][]
  opp: number[]
  lines: [number, number][]
  frames: string[][][]
  records: ControllerRecord[]
  halts: number[]
}

function replaceOnce(source: string, needle: string, replacement: string): string {
  const at = source.indexOf(needle)

  if (at < 0 || source.indexOf(needle, at + 1) >= 0) {
    throw new Error(`anchor not found exactly once in the verifier: ${needle}`)
  }

  return source.slice(0, at) + replacement + source.slice(at + needle.length)
}

const RECORDER = `
  const __ctrlRecords: unknown[] = []
  const __record = (dir: string, a: Uint8Array, c: CtrlState, r: { arr: Uint8Array; ctrl: CtrlState }) => {
    __ctrlRecords.push({ dir, inPorts: Array.from(a), inCtrl: { ...c }, outPorts: Array.from(r.arr), outCtrl: { ...r.ctrl } })
    return r
  }
  const applyOriginCtrlFwd = (a: Uint8Array, c: CtrlState) => __record('fwd', a, c, applyOriginCtrlFwdRaw(a, c))
  const applyOriginCtrlInv = (a: Uint8Array, c: CtrlState) => __record('inv', a, c, applyOriginCtrlInvRaw(a, c))

  function stepSys(`

const DUMP = `
  {
    const __line: number[][] = []
    const __lineInv: number[][] = []
    for (let a = 0; a < N_SP; a++) for (let b = 0; b < N_SP; b++) {
      __line.push([...lRevLine(a, b)])
      __lineInv.push([...lRevLineInv(a, b)])
    }
    __writeFileSync(process.env.COUNTER_RAY_DUMP!, JSON.stringify({
      line: __line,
      lineInv: __lineInv,
      opp: OPP,
      lines: LINES,
      frames: TRANSPORTS.map(f => f.map(row => row.map(([x, y]) => x.toString() + ',' + y.toString()))),
      records: __ctrlRecords,
      halts: [runC0.haltBeat, runC3.haltBeat, runC5.haltBeat],
    }))
    process.exit(0)
  }
`

function verifierDump(): Dump {
  let source = "import { writeFileSync as __writeFileSync } from 'node:fs'\n" + readFileSync(VERIFIER, 'utf8')

  source = replaceOnce(source, 'function applyOriginCtrlFwd(', 'function applyOriginCtrlFwdRaw(')
  source = replaceOnce(source, 'function applyOriginCtrlInv(', 'function applyOriginCtrlInvRaw(')
  source = replaceOnce(source, '\n  function stepSys(', RECORDER)

  const lastRun = '  const runC5 = runBijectiveProgram(5, 1) // (5,1,0) -> (5,11,0)\n'

  source = replaceOnce(source, lastRun, lastRun + DUMP)

  mkdirSync(DUMP_DIR, { recursive: true })

  const dumpPath = join(DUMP_DIR, `verifier-dump-${process.pid}.json`)
  const res = spawnSync(join(ROOT, 'node_modules', '.bin', 'tsx'), ['--no-warnings=ExperimentalWarning', '-'], {
    cwd: ROOT,
    input: source,
    encoding: 'utf8',
    env: { ...process.env, COUNTER_RAY_DUMP: dumpPath },
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  })

  if (res.error) {
    throw res.error
  }

  if (res.status !== 0 || !existsSync(dumpPath)) {
    throw new Error(`verifier copy exited ${String(res.status)} without a dump: ${(res.stderr ?? '').slice(-2000)}`)
  }

  return JSON.parse(readFileSync(dumpPath, 'utf8')) as Dump
}

let cached: Dump | null = null

function dump(): Dump {
  cached ??= verifierDump()

  return cached
}

function phaseOf(name: string): ControllerPhase {
  const i = (VERIFIER_PHASES as readonly string[]).indexOf(name)

  if (i < 0) {
    throw new Error(`unknown verifier phase ${name}`)
  }

  return CONTROLLER_PHASES[i]!
}

function sameState(mine: ControllerState, theirs: VerifierCtrl): boolean {
  return mine.phase === phaseOf(theirs.phase) && mine.launch === theirs.launch && mine.ret === theirs.ret
}

suite('compute/counter-ray: the module equals the verifier copy', [
  check('line map and its inverse agree on all 144 pairs', () => {
    const d = dump()

    equal(d.line.length, SYMBOL_COUNT * SYMBOL_COUNT, 'line map size')
    equal(d.lineInv.length, SYMBOL_COUNT * SYMBOL_COUNT, 'inverse size')

    for (let a = 0; a < SYMBOL_COUNT; a++) {
      for (let b = 0; b < SYMBOL_COUNT; b++) {
        exactArray(lineMap(a, b), d.line[a * SYMBOL_COUNT + b]!, `lineMap(${a}, ${b})`)
        exactArray(lineMapInverse(a, b), d.lineInv[a * SYMBOL_COUNT + b]!, `lineMapInverse(${a}, ${b})`)
      }
    }
  }),
  check('antipodal slots and the 12 lines agree', () => {
    const d = dump()

    exactArray(OPPOSITE_SLOT, d.opp, 'opposite slot')
    equal(LINES.length, d.lines.length, 'line count')
    LINES.forEach((l, i) => exactArray(l, d.lines[i]!, `line ${i}`))
  }),
  check('the 24 transport frames agree entry by entry', () => {
    const d = dump()

    equal(d.frames.length, TRANSPORTS.length, 'frame count')
    TRANSPORTS.forEach((frame, s) => {
      frame.forEach((row, i) => {
        row.forEach(([x, y], j) => {
          equal(`${x},${y}`, d.frames[s]![i]![j]!, `frame ${s} entry (${i}, ${j})`)
        })
      })
    })
  }),
  check('the controller agrees on every beat of the three Bennett runs, forward and inverse', () => {
    const d = dump()
    const fwd = d.records.filter(r => r.dir === 'fwd').length
    const inv = d.records.filter(r => r.dir === 'inv').length

    exactArray(d.halts, [6, 354, 746], 'halt beats')
    equal(fwd, 6 + 354 + 746, 'forward beats recorded')
    equal(inv, 6 + 354 + 746, 'inverse beats recorded')

    for (const [k, r] of d.records.entries()) {
      const input: ControllerState = { phase: phaseOf(r.inCtrl.phase), launch: r.inCtrl.launch, ret: r.inCtrl.ret }
      const step = r.dir === 'fwd' ? controllerForward(r.inPorts, input) : controllerInverse(r.inPorts, input)

      exactArray(step.ports, r.outPorts, `record ${k} (${r.dir} ${r.inCtrl.phase}) ports`)
      ok(sameState(step.controller, r.outCtrl), `record ${k} (${r.dir} ${r.inCtrl.phase}) controller state`)
    }
  }),
])
