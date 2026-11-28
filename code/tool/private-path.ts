// Keep the machine that ran a tool out of the files it writes. Records, logs, ledgers and
// exported headers are committed to a public repository, so an absolute path, a stack trace
// or a host name written into one publishes the private layout of whoever ran it. Every
// writer passes its text through `scrubPrivate` and its paths through `repoPath`.
//
// The repo root is found from this file's own location (code/tool/ is two levels below it),
// never from process.cwd(), so the result is the same whatever directory a tool runs from.

import { homedir, hostname, userInfo } from 'node:os'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

// A path as it should appear in a committed file: relative to the repo root, with forward
// slashes. A path outside the repo keeps only what scrubPrivate leaves of it.
export function repoPath(path: string): string {
  const full = isAbsolute(path) ? path : resolve(REPO_ROOT, path)
  const rel = relative(REPO_ROOT, full)
  if (rel === '') return '.'
  if (!rel.startsWith('..') && !isAbsolute(rel)) return rel.split(sep).join('/')
  return scrubPrivate(full)
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function safeUserName(): string | null {
  try {
    return userInfo().username || null
  } catch {
    return null
  }
}

// The node binary's install folder (bin/node lives two levels below it), so a stack frame
// inside node's own files reads `node/...` instead of a version-manager path. Only a private
// install counts: a shared prefix such as /usr/local holds other tools whose paths must stay.
function nodeInstallRoot(): string | null {
  const root = dirname(dirname(process.execPath))
  const home = homedir()
  if (home && (root === home || root.startsWith(`${home}${sep}`))) return root
  if (/[\\/]\.(?:nvm|fnm|volta|asdf)[\\/]|[\\/]Cellar[\\/]/.test(root)) return root
  return null
}

// Every machine-specific string, longest first, so the repo root (inside the home folder) is
// replaced before the home folder itself.
function replacements(): { from: string; to: string }[] {
  const list: { from: string; to: string }[] = []
  const add = (from: string | null | undefined, to: string): void => {
    if (from && from.length > 1 && from !== sep) list.push({ from, to })
  }
  add(REPO_ROOT, '.')
  add(nodeInstallRoot(), 'node')
  add(process.execPath, 'node')
  add(homedir(), '~')
  return list.sort((a, b) => b.from.length - a.from.length)
}

// Text with the repo root as ".", node's install folder as "node", the home folder as "~",
// and the host and user names removed. Applies to file:// URLs in stack frames too.
export function scrubPrivate(text: string): string {
  let out = text
  for (const { from, to } of replacements()) {
    const forward = from.split(sep).join('/')
    out = out.split(`file://${forward}`).join(to).split(forward).join(to).split(from).join(to)
  }
  const host = hostname()
  if (host) {
    const short = host.replace(/\.local$/i, '')
    out = out.replace(new RegExp(`\\b${escapeRegExp(host)}\\b`, 'g'), 'host')
    if (short.length > 2) out = out.replace(new RegExp(`\\b${escapeRegExp(short)}\\b`, 'g'), 'host')
  }
  const user = safeUserName()
  // The user name only where it names an account (a path segment or user@host), so a user
  // name that is also an ordinary word never rewrites data.
  if (user) {
    const name = escapeRegExp(user)
    out = out
      .replace(new RegExp(`([/\\\\])${name}(?=[/\\\\])`, 'g'), '$1user')
      .replace(new RegExp(`\\b${name}@`, 'g'), 'user@')
  }
  return out
}

// An error as text fit for a committed file: its message and stack, scrubbed.
export function scrubError(error: unknown): string {
  if (error instanceof Error) return scrubPrivate(error.stack ?? `${error.name}: ${error.message}`)
  return scrubPrivate(String(error))
}
