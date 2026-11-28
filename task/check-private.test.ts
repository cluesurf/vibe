// Self-test of check:private and the scrubber every writer uses, on planted files in a fresh temp directory outside git.
//
//   node_modules/.bin/tsx --test task/check-private.test.ts
//
// Every planted string is joined from parts, so this file never matches the rules it tests.

import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { REPO_ROOT, repoPath, scrubError, scrubPrivate } from '@/code/tool/private-path'

import { ALLOWED_IDS, PRIVATE_RULES, scanFiles, scanText } from './check-private'
import { scrubLog } from './scrub-log'

const S = '/'

// one planted line per rule, each expected to fire that rule
const PLANTED: Record<string, string> = {
  'home-path': `cd ${S}Users${S}someone${S}code`,
  'windows-home-path': `C:${'\\'}Users${'\\'}someone${'\\'}code`,
  'local-hostname': `ssh someones-box${'.'}local`,
  'mac-hostname': `built on Someones-${'Mac'}Book-Pro`,
  'tool-install-path': `~${S}${'.'}nvm${S}versions${S}node${S}v24${S}bin${S}node`,
  'private-notes': `see ${'note'}${S}project${S}vibe${S}readme.md`,
  'private-checklist-id': `closes ${'vibe'}-roadmap-board-0042`,
  'portable-computer': `ran on the ${'lap'}top overnight`,
  'parent-workspace': `${'base'}${S}crew${S}something`,
  'worktree-path': `deck${S}${'vibe'}.worktree${S}research`,
}

test('every rule has a planted line, and each planted line fires its own rule', () => {
  assert.deepEqual(Object.keys(PLANTED).sort(), PRIVATE_RULES.map(r => r.name).sort())
  for (const [rule, line] of Object.entries(PLANTED)) {
    const hits = scanText('planted.txt', line)
    assert.ok(hits.some(h => h.rule === rule), `${rule} did not fire on: ${line}`)
  }
})

test('planted files on disk are found with file and line, and binaries are skipped', () => {
  const root = mkdtempSync(join(tmpdir(), 'check-private-'))
  const lines = ['a clean first line', ...Object.values(PLANTED)]
  writeFileSync(join(root, 'notes.md'), `${lines.join('\n')}\n`)
  writeFileSync(join(root, 'image.bin'), Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(PLANTED['home-path']!)]))
  writeFileSync(join(root, 'clean.ts'), 'export const x = 1\n')
  const hits = scanFiles({ root, files: ['notes.md', 'image.bin', 'clean.ts', 'missing.txt'] })
  assert.ok(hits.every(h => h.file === 'notes.md'))
  assert.equal(new Set(hits.map(h => h.rule)).size, PRIVATE_RULES.length)
  assert.ok(hits.every(h => h.line >= 2), 'the clean first line is not a hit')
})

test('a file path itself is checked', () => {
  const hits = scanText(`test${S}probe-log${S}${'vibe'}-roadmap-board-0042.jsonl`, '{}')
  assert.ok(hits.some(h => h.line === 0 && h.rule === 'private-checklist-id'))
})

test('the allow list passes fixture ids, but not a private id beside one', () => {
  assert.ok(ALLOWED_IDS.length > 0)
  for (const id of ALLOWED_IDS) assert.deepEqual(scanText('fixture.ts', `const ID = '${id}'`), [])
  const mixed = scanText('fixture.ts', `${ALLOWED_IDS[0]} and ${'vibe'}-roadmap-board-0042`)
  assert.ok(mixed.some(h => h.rule === 'private-checklist-id'))
})

test('ordinary code and prose pass', () => {
  const clean = [
    'p.local = LOCAL_R.map(x => x)',
    'The MacBook is a computer.',
    'home/garden/plants',
    'node_modules/.bin/tsx task/run-experiment.ts',
    'vibe-burst',
  ]
  for (const line of clean) assert.deepEqual(scanText('clean.ts', line), [], line)
})

test('scrubPrivate writes the repo root as ".", the home folder as "~", and node as "node"', () => {
  const frame = `at run (file://${REPO_ROOT}/code/rule/x.ts:3:9)`
  assert.equal(scrubPrivate(frame), 'at run (./code/rule/x.ts:3:9)')
  assert.equal(scrubPrivate(`${REPO_ROOT}/test/record/a.log`), './test/record/a.log')
  assert.equal(scrubPrivate(`${homedir()}/elsewhere/file`), '~/elsewhere/file')
  assert.equal(scrubPrivate(`${process.execPath} --version`), 'node --version')
  const stack = scrubError(new Error(`missing ${REPO_ROOT}/x.json`))
  assert.ok(!stack.includes(REPO_ROOT) && !stack.includes(homedir()), stack)
})

test('repoPath is relative to the repo root wherever the process runs', () => {
  assert.equal(repoPath(join(REPO_ROOT, 'code', 'tool', 'x.ts')), 'code/tool/x.ts')
  assert.equal(repoPath('code/tool/x.ts'), 'code/tool/x.ts')
  assert.equal(repoPath(REPO_ROOT), '.')
})

test('scrubLog writes another machine\'s package folder as "."', () => {
  const remote = `${S}root${S}runs${S}one${S}pkg`
  const text = `Error at ${remote}/code/x.ts:1\n`
  assert.equal(scrubLog({ text, roots: [remote, `${S}root${S}runs${S}one`] }), 'Error at ./code/x.ts:1\n')
})
