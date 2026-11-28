// Rewrite run logs and fetched record files so they name no machine: the repo root becomes ".", the home folder
// "~", node's install folder "node", and host and user names go (code/tool/private-path.ts). A record runner calls
// it on every file it writes into test/record/, since a crash there leaves a stack trace of absolute paths.
//
//   tsx task/scrub-log.ts [--root <remote package root>]... <file>...
//
// --root names another folder that is this repo's root somewhere else (a droplet's package folder), also written
// as ".". A file that does not exist is skipped; a file already clean is left untouched.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { REPO_ROOT, scrubPrivate } from '@/code/tool/private-path'

export function scrubLog(input: { text: string; roots?: readonly string[] }): string {
  let out = input.text
  const roots = [...(input.roots ?? [])].filter(r => r.length > 1).sort((a, b) => b.length - a.length)
  for (const root of roots) out = out.split(root.replace(/\/$/, '')).join('.')
  return scrubPrivate(out)
}

function main(): void {
  const args = process.argv.slice(2)
  const roots: string[] = []
  const files: string[] = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? ''
    if (arg === '--root') {
      const next = args[++i]
      if (next) roots.push(next)
    } else files.push(arg)
  }
  for (const file of files) {
    const path = resolve(file)
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    const clean = scrubLog({ text, roots })
    if (clean !== text) writeFileSync(path, clean)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(REPO_ROOT, 'task', 'scrub-log.ts')) main()
