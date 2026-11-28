// Fail when a tracked file names the private setup of a machine that worked on this repo:
// an absolute home path, a local host name, a node install path, the parent workspace's
// layout or notes, a private checklist id, or the word for a portable computer. This
// repository is public, so each of these publishes something about its author's machine.
//
//   pnpm check:private
//
// It scans every file `git ls-files` lists, in the working tree, skipping binaries, and
// prints file:line and the rule for each hit. Exit 1 on any hit, 0 on none.
//
// The patterns are written generically (escaped slashes, split words) so this file never
// matches itself, and it names no person, machine or private path.

import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { REPO_ROOT } from '@/code/tool/private-path'

export type PrivateRule = { name: string; pattern: RegExp }

export type PrivateHit = { file: string; line: number; rule: string; text: string }

export const PRIVATE_RULES: readonly PrivateRule[] = [
  { name: 'home-path', pattern: /\/(Users|home)\/[A-Za-z0-9._-]+\// },
  { name: 'windows-home-path', pattern: /\b[A-Za-z]:\\{1,2}Users\\{1,2}/i },
  { name: 'local-hostname', pattern: /\b[A-Za-z0-9][A-Za-z0-9-]*-[A-Za-z0-9-]*\.local\b|\b[A-Za-z0-9-]+\.local(?=[:/'"`]|$)/ },
  { name: 'mac-hostname', pattern: /\b[A-Za-z0-9]+(?:[-'’][A-Za-z0-9]+)*[-'’]s?-?(?:MacBook|Mac-?mini|Mac-?Studio|iMac|MBP)\b|\b(?:MacBook|Mac-?mini|Mac-?Studio|iMac)(?:-[A-Za-z0-9]+)+\b/i },
  { name: 'tool-install-path', pattern: /\.(?:nvm|fnm|volta|asdf)\/|\/opt\/homebrew\/|\/usr\/local\/Cellar\// },
  { name: 'private-notes', pattern: /\bnote\/project\// },
  { name: 'private-checklist-id', pattern: /\bvibe-[a-z]+(?:-[a-z]+)*-\d{4}\b/ },
  { name: 'portable-computer', pattern: /\blap[t]ops?\b/i },
  { name: 'parent-workspace', pattern: /\bbase\/crew\/|\btask\/term\// },
  { name: 'worktree-path', pattern: /\b[A-Za-z0-9_-]+\.worktree\// },
]

// Checklist-shaped ids that are test fixtures, not private items.
export const ALLOWED_IDS: readonly string[] = ['vibe-roadmap-fixture-0001']

const BINARY_PROBE_BYTES = 8000

function isBinary(buffer: Buffer): boolean {
  const end = Math.min(buffer.length, BINARY_PROBE_BYTES)
  for (let i = 0; i < end; i++) if (buffer[i] === 0) return true
  return false
}

// The checklist rule matches each id on the line, and passes only when every one is allowed.
function lineHits(text: string, rule: PrivateRule): boolean {
  if (rule.name !== 'private-checklist-id') return rule.pattern.test(text)
  const global = new RegExp(rule.pattern.source, 'g')
  for (const match of text.matchAll(global)) if (!ALLOWED_IDS.includes(match[0])) return true
  return false
}

// A file's own path is published too, so it is checked as line 0.
export function scanText(file: string, text: string): PrivateHit[] {
  const hits: PrivateHit[] = []
  for (const rule of PRIVATE_RULES) {
    if (lineHits(file, rule)) hits.push({ file, line: 0, rule: rule.name, text: file })
  }
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    for (const rule of PRIVATE_RULES) {
      if (lineHits(line, rule)) hits.push({ file, line: i + 1, rule: rule.name, text: line.trim().slice(0, 160) })
    }
  }
  return hits
}

// Scan the given files (paths relative to root), skipping missing files and binaries.
export function scanFiles(input: { root: string; files: readonly string[] }): PrivateHit[] {
  const hits: PrivateHit[] = []
  for (const file of input.files) {
    const full = join(input.root, file)
    let buffer: Buffer
    try {
      if (!statSync(full).isFile()) continue
      buffer = readFileSync(full)
    } catch {
      continue
    }
    if (isBinary(buffer)) continue
    hits.push(...scanText(file, buffer.toString('utf8')))
  }
  return hits
}

export function trackedFiles(root: string): string[] {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 1 << 28 })
  return out.toString('utf8').split('\0').filter(Boolean)
}

function main(): void {
  const root = resolve(REPO_ROOT)
  const hits = scanFiles({ root, files: trackedFiles(root) })
  for (const hit of hits) console.log(`${hit.file}:${hit.line}: ${hit.rule}: ${hit.text}`)
  if (hits.length > 0) {
    const files = new Set(hits.map(hit => hit.file)).size
    const byFolder = new Map<string, number>()
    for (const hit of hits) {
      const folder = hit.file.split('/').slice(0, 2).join('/')
      byFolder.set(folder, (byFolder.get(folder) ?? 0) + 1)
    }
    for (const [folder, count] of [...byFolder].sort((a, b) => b[1] - a[1])) console.error(`  ${count}\t${folder}`)
    console.error(`check:private: ${hits.length} hits in ${files} files`)
    process.exit(1)
  }
  console.log('check:private: clean')
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(REPO_ROOT, 'task', 'check-private.ts')) main()
