// Self-test of the pre-registration tool, on a fixture checklist and ledger in a fresh temp directory.
//
//   node_modules/.bin/tsx --test task/pre-register/pre-register.test.ts

import assert from 'node:assert/strict'
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { findGate, whatHash } from './gate'
import { appendProbe, readProbes, readVerdict } from './probe-log'
import { runProbe } from './probe'

const ID = 'vibe-roadmap-fixture-0001'
const GATE_AT = '2026-11-13T10:00:00.000Z'
const HOUR = 3600 * 1000
const PASS = [process.execPath, '-e', "console.log('verdict: pass')"]

// A roadmap with one experiment item, its `what` dated by a ledger line, as `pnpm checklist set` leaves it.
function fixture(what: string): { roadmap: string; logDir: string; setWhat: (what: string, at: string) => void } {
  const base = mkdtempSync(join(tmpdir(), 'pre-register-'))
  const roadmap = join(base, 'roadmap')
  const project = join(roadmap, 'fixture')
  mkdirSync(project, { recursive: true })
  const setWhat = (text: string, at: string): void => {
    writeFileSync(join(project, 'checklist.json'), JSON.stringify({ item: [{ id: ID, what: text, state: 'open' }] }))
    appendFileSync(join(project, 'checklist.ledger.jsonl'), `${JSON.stringify({ id: ID, hash: whatHash(text), at })}\n`)
  }
  setWhat(what, GATE_AT)
  return { roadmap, logDir: join(base, 'probe-log'), setWhat }
}

function at(offsetHours: number): () => Date {
  return () => new Date(Date.parse(GATE_AT) + offsetHours * HOUR)
}

function probe(f: ReturnType<typeof fixture>, offsetHours: number, command = PASS) {
  return runProbe({
    item: ID,
    command,
    roadmap: f.roadmap,
    logDir: f.logDir,
    cwd: process.cwd(),
    now: at(offsetHours),
    out: () => undefined,
  })
}

test('the gate is the last ledger line for the item, hashed like the checklist tool', () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const lookup = findGate(ID, f.roadmap)
  assert.ok(lookup.ok)
  assert.equal(lookup.gate.at, GATE_AT)
  assert.equal(lookup.gate.hash, whatHash('gate: slope 1.00 within 0.02'))
})

test('a probe after the gate line is accepted and its verdict recorded', async () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const result = await probe(f, 1)
  assert.equal(result.code, 0, result.message)
  assert.equal(result.line?.recorded, true)
  assert.equal(result.line?.verdict, 'pass')
  assert.deepEqual(result.line?.refused, [])
  assert.equal(readProbes(f.logDir, ID).length, 1)
})

test('a probe that predates the gate line refuses every later verdict', async () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const gate = findGate(ID, f.roadmap)
  assert.ok(gate.ok)
  // A probe that ran an hour before the gate was dated (the gate set again to the same text after it).
  appendProbe(f.logDir, {
    at: new Date(Date.parse(GATE_AT) - HOUR).toISOString(),
    item: ID,
    command: PASS,
    gate: { hash: gate.gate.hash, at: '2026-11-12T00:00:00.000Z' },
    exit: 0,
    verdict: 'pass',
    recorded: true,
    refused: [],
  })
  const result = await probe(f, 1)
  assert.equal(result.code, 3)
  assert.equal(result.line?.recorded, false)
  assert.match(result.line!.refused.join('\n'), /predates the gate line/)
})

test('a probe whose own clock reads before the gate line is refused', async () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const result = await probe(f, -1)
  assert.equal(result.code, 3)
  assert.match(result.line!.refused.join('\n'), /this probe at .* predates the gate line/)
})

test('changing what after a probe makes the next verdict refused', async () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const first = await probe(f, 1)
  assert.equal(first.code, 0, first.message)
  f.setWhat('gate: slope 1.00 within 0.05', new Date(Date.parse(GATE_AT) + 2 * HOUR).toISOString())
  const second = await probe(f, 3)
  assert.equal(second.code, 3)
  assert.equal(second.line?.recorded, false)
  assert.match(second.line!.refused.join('\n'), /what changed after it/)
  const history = readProbes(f.logDir, ID)
  assert.deepEqual(
    history.map(line => line.recorded),
    [true, false],
  )
})

test('a what edited outside the checklist tool has no dated gate, so no probe runs', async () => {
  const f = fixture('gate: slope 1.00 within 0.02')
  const project = join(f.roadmap, 'fixture')
  writeFileSync(join(project, 'checklist.json'), JSON.stringify({ item: [{ id: ID, what: 'gate: edited by hand' }] }))
  const result = await probe(f, 1)
  assert.equal(result.code, 2)
  assert.match(result.message, /outside pnpm checklist set/)
  assert.equal(readProbes(f.logDir, ID).length, 0)
})

test('the verdict is read from run-experiment JSON or a verdict line', () => {
  assert.equal(readVerdict(JSON.stringify({ code: 'x', verdict: { status: 'solved', ok: true } }, null, 2)), 'solved')
  assert.equal(readVerdict(JSON.stringify({ verdict: true })), 'true')
  assert.equal(readVerdict('slope 1.01\nverdict: pass\n'), 'pass')
  assert.equal(readVerdict('no verdict here'), null)
})
