// The gate of a board experiment: the ledger line that last set its checklist item's `what`.
//
// Gates (each number and tolerance) are written into the item's `what` with
// `pnpm checklist set <project> <id> --set what=... --commit` before any code. The checklist tool appends one
// line `{"id","hash","at"}` to the `checklist.ledger.jsonl` beside the checklist every time an item's `what`
// changes, where `hash` is the first 12 hex digits of sha1(what) (task/checklist/write/write.ts, whatHash). So
// the last ledger line for an id hashes and dates the gate in force now.

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Gate = {
  id: string
  // sha1(what), first 12 hex digits, as the checklist tool writes it
  hash: string
  // ISO time the ledger recorded this `what`
  at: string
  // the `what` text in the checklist now
  what: string
  // the checklist.json the item lives in
  checklist: string
}

export type GateLookup = { ok: true; gate: Gate } | { ok: false; reason: string }

// Same hash as task/checklist/write/write.ts whatHash.
export function whatHash(what: unknown): string {
  return createHash('sha1')
    .update(String(what ?? ''))
    .digest('hex')
    .slice(0, 12)
}

// The ClueSurf repo base: the nearest directory above `from` holding note/project/workflow.
export function findRepoBase(from: string = dirname(fileURLToPath(import.meta.url))): string {
  let dir = resolve(from)
  for (;;) {
    if (existsSync(join(dir, 'note', 'project', 'workflow'))) {
      return dir
    }
    const up = dirname(dir)
    if (up === dir) {
      throw new Error(`no note/project/workflow above ${from}: pass --repo <cluesurf dir>`)
    }
    dir = up
  }
}

// Every checklist.json under a directory, depth first.
function checklists(dir: string): string[] {
  const found: string[] = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name === 'checklist.json') {
      found.push(path)
    } else if (!name.startsWith('.') && name !== 'node_modules' && statSync(path).isDirectory()) {
      found.push(...checklists(path))
    }
  }
  return found
}

type Item = { id: string; what?: string }

// Find the item in any checklist under `<repo>/note/project/vibe/roadmap`, then its last ledger line.
export function findGate(id: string, roadmap: string): GateLookup {
  for (const checklist of checklists(roadmap)) {
    const list = JSON.parse(readFileSync(checklist, 'utf8')) as { item?: Item[] }
    const item = (list.item ?? []).find(entry => entry.id === id)
    if (!item) {
      continue
    }
    const ledger = join(dirname(checklist), 'checklist.ledger.jsonl')
    if (!existsSync(ledger)) {
      return { ok: false, reason: `${ledger} does not exist, so ${id} has no dated gate` }
    }
    let last: { id: string; hash: string; at: string } | undefined
    for (const line of readFileSync(ledger, 'utf8').split('\n')) {
      if (!line.trim()) {
        continue
      }
      const entry = JSON.parse(line) as { id: string; hash: string; at: string }
      if (entry.id === id) {
        last = entry
      }
    }
    if (!last) {
      return { ok: false, reason: `no ledger line for ${id} in ${ledger}: set its gate with pnpm checklist set` }
    }
    const what = String(item.what ?? '')
    const now = whatHash(what)
    if (now !== last.hash) {
      return {
        ok: false,
        reason: `${id} what hashes to ${now} but its last ledger line says ${last.hash}: the gate was edited outside pnpm checklist set, so it has no date`,
      }
    }
    return { ok: true, gate: { id, hash: last.hash, at: last.at, what, checklist } }
  }
  return { ok: false, reason: `no item ${id} in any checklist.json under ${roadmap}` }
}
