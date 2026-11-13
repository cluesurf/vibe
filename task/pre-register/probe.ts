// Run one probe of a board experiment under its gate, log it, and record or refuse its verdict.

import { spawn } from 'node:child_process'
import { join } from 'node:path'

import { findGate } from './gate'
import { appendProbe, judge, readProbes, readVerdict, type ProbeLine } from './probe-log'

export type ProbeOptions = {
  item: string
  // the probe, argument by argument
  command: string[]
  // the directory searched for the item's checklist.json, normally <repo>/note/project/vibe/roadmap
  roadmap: string
  // where <item>.jsonl lives
  logDir: string
  // the directory the probe runs in, and where node_modules/.bin/tsx is looked for
  cwd: string
  // the clock, replaceable in the self-test
  now?: () => Date
  // where the probe's output goes, replaceable in the self-test
  out?: (text: string) => void
}

export type ProbeResult = { code: number; line: ProbeLine | null; message: string }

// A `.ts` experiment file under test/experiment/ runs through task/run-experiment.ts, which prints its verdict as
// JSON. Any other `.ts` file runs with tsx. Anything else runs as given.
export function resolveCommand(command: string[], cwd: string): string[] {
  const [first, ...rest] = command
  if (!first || !first.endsWith('.ts')) {
    return command
  }
  const tsx = join(cwd, 'node_modules', '.bin', 'tsx')
  if (first.includes('test/experiment/')) {
    return [tsx, 'task/run-experiment.ts', first, ...rest]
  }
  return [tsx, first, ...rest]
}

function execute(
  command: string[],
  cwd: string,
  out: (text: string) => void,
): Promise<{ exit: number | null; stdout: string }> {
  return new Promise(done => {
    const [file, ...args] = command
    let stdout = ''
    const child = spawn(file!, args, { cwd, stdio: ['inherit', 'pipe', 'inherit'] })
    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stdout += text
      out(text)
    })
    child.on('error', error => {
      out(`could not start ${file}: ${error.message}\n`)
      done({ exit: 127, stdout })
    })
    child.on('close', exit => done({ exit, stdout }))
  })
}

export async function runProbe(options: ProbeOptions): Promise<ProbeResult> {
  const now = options.now ?? (() => new Date())
  const out = options.out ?? ((text: string) => process.stdout.write(text))
  if (options.command.length === 0) {
    return { code: 2, line: null, message: 'give the probe after --, e.g. -- test/experiment/x/y.ts' }
  }
  const lookup = findGate(options.item, options.roadmap)
  if (!lookup.ok) {
    return { code: 2, line: null, message: `no gate, so no probe: ${lookup.reason}` }
  }
  const gate = lookup.gate
  const at = now().toISOString()
  const reasons = judge(gate, readProbes(options.logDir, options.item), at)
  const command = resolveCommand(options.command, options.cwd)
  const { exit, stdout } = await execute(command, options.cwd, out)

  // A gate edited while the probe ran was edited after seeing it.
  const after = findGate(options.item, options.roadmap)
  if (!after.ok) {
    reasons.push(`after the probe: ${after.reason}`)
  } else if (after.gate.hash !== gate.hash || after.gate.at !== gate.at) {
    reasons.push(`what changed while the probe ran, from ${gate.hash} (${gate.at}) to ${after.gate.hash} (${after.gate.at})`)
  }

  const line: ProbeLine = {
    at,
    item: options.item,
    command,
    gate: { hash: gate.hash, at: gate.at },
    exit,
    verdict: readVerdict(stdout),
    recorded: reasons.length === 0,
    refused: reasons,
  }
  appendProbe(options.logDir, line)

  if (!line.recorded) {
    return {
      code: 3,
      line,
      message: `verdict refused for ${options.item}:\n${reasons.map(reason => `  ${reason}`).join('\n')}\nThe gate can no longer be shown to come first. Pre-register a new experiment item with its gate set before any probe.`,
    }
  }
  return {
    code: exit === 0 ? 0 : 1,
    line,
    message: `recorded ${options.item}: verdict ${line.verdict ?? '(none printed)'}, exit ${exit}, gate ${gate.hash} set ${gate.at}`,
  }
}
