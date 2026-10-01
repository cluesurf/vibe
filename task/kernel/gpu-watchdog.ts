// THE GPU WATCHDOG: the teardown a rented GPU machine gets whether or not anyone remembers it. task/kernel/
// A GPU droplet bills by the hour whether it is working, idle or powered off (only DESTROYING it stops the bill), and a
// benchmark run can die at any step: a crashed script, a lost laptop session, an ssh that never returns. So the run that
// creates the machine (task/kernel/gpu-run.ts) starts this at the moment of creation, as a detached process that
// outlives it, and this destroys the machine at the deadline no matter what happened in between.
//
//   timed   gpu-watchdog.ts --id <droplet id> --deadline <ISO time> [--tag vibe-gpu-bench]
//           ONE timed wait until the deadline (no polling), then destroy that droplet by its id and confirm by tag
//           that it is gone. It refuses to touch a droplet that does not carry the tag. A SIGTERM (the run finished
//           and destroyed the droplet itself) stands it down
//   sweep   gpu-watchdog.ts --sweep [--tag vibe-gpu-bench] [--cap-minutes 150]
//           now, once: destroy every droplet carrying the tag that is older than the cap, and list the rest. The
//           one command for a leftover from a crashed run
//
// The DigitalOcean token is read from the environment only (DIGITALOCEAN_ACCESS_TOKEN, which doctl reads itself), never
// from a file or an argument; this project supplies it with `term zone load cluesurf -- ...` (note/research/vibe/
// kernel.md). Every action is appended to tmp/gpu-watchdog.log (gitignored), or to --log.

import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const TAG = 'vibe-gpu-bench'
export const CAP_MINUTES = 150

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`)

  return i >= 0 ? process.argv[i + 1] : undefined
}

const LOG = arg('log') ?? fileURLToPath(new URL('../../tmp/gpu-watchdog.log', import.meta.url))

export function log(line: string, file = LOG): void {
  const text = `${new Date().toISOString()} [watchdog ${process.pid}] ${line}`

  mkdirSync(dirname(file), { recursive: true })
  appendFileSync(file, `${text}\n`)
  console.log(text)
}

export type Droplet = { id: number; name: string; tags: string[]; created_at: string; status: string }

// doctl with the token from the environment; its JSON output parsed
export function doctl(args: string[]): string {
  if (!process.env.DIGITALOCEAN_ACCESS_TOKEN) {
    throw new Error('DIGITALOCEAN_ACCESS_TOKEN is not set (run under term zone load, or export it)')
  }

  return execFileSync('doctl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

export const tagged = (tag: string): Droplet[] =>
  JSON.parse(doctl(['compute', 'droplet', 'list', '--tag-name', tag, '-o', 'json']) || '[]') as Droplet[]

// destroy one droplet by id, only if it carries the tag; true when it is gone afterwards (confirmed by listing the tag)
export function destroy(id: number, tag: string, file = LOG): boolean {
  const before = tagged(tag)
  const mine = before.find(d => d.id === id)

  if (!mine) {
    log(`droplet ${id} is not among the droplets tagged ${tag} (${before.length} tagged): nothing to destroy`, file)

    return true
  }

  log(`destroying droplet ${id} (${mine.name}, created ${mine.created_at}, ${mine.status})`, file)

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      doctl(['compute', 'droplet', 'delete', String(id), '--force'])
    } catch (e) {
      log(`delete attempt ${attempt} failed: ${(e as Error).message.split('\n')[0]}`, file)
    }

    const after = tagged(tag)

    if (!after.some(d => d.id === id)) {
      log(`confirmed: droplet ${id} is gone (doctl compute droplet list --tag-name ${tag}: ${after.length} left)`, file)

      return true
    }

    // a delete is accepted before the droplet leaves the list: one fixed pause before asking again
    execFileSync('sleep', ['10'])
  }

  log(`FAILED: droplet ${id} still listed under ${tag} after 5 attempts; destroy it by hand`, file)

  return false
}

async function timed(id: number, deadline: number, tag: string): Promise<void> {
  const wait = Math.max(0, deadline - Date.now())

  log(`armed for droplet ${id} (tag ${tag}): destroy at ${new Date(deadline).toISOString()}, in ${(wait / 60000).toFixed(1)} min`)
  process.on('SIGTERM', () => {
    log(`stood down for droplet ${id}: the run destroyed it itself`)
    process.exit(0)
  })

  await new Promise(resolve => setTimeout(resolve, wait))
  log(`deadline reached for droplet ${id}`)
  process.exit(destroy(id, tag) ? 0 : 1)
}

function sweep(tag: string, capMinutes: number): void {
  const now = Date.now()
  const list = tagged(tag)
  let failed = 0

  log(`sweep: ${list.length} droplet(s) tagged ${tag}, cap ${capMinutes} min`)

  for (const d of list) {
    const age = (now - Date.parse(d.created_at)) / 60000

    if (age > capMinutes) {
      log(`droplet ${d.id} (${d.name}) is ${age.toFixed(0)} min old, over the cap`)
      failed += destroy(d.id, tag) ? 0 : 1
    } else {
      log(`droplet ${d.id} (${d.name}) is ${age.toFixed(0)} min old, under the cap: left running`)
    }
  }

  process.exit(failed > 0 ? 1 : 0)
}

// run only when invoked directly (gpu-run.ts imports the helpers)
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const tag = arg('tag') ?? TAG

  if (process.argv.includes('--sweep')) {
    sweep(tag, Number(arg('cap-minutes') ?? CAP_MINUTES))
  } else {
    const id = Number(arg('id'))
    const deadline = Date.parse(arg('deadline') ?? '')

    if (!Number.isInteger(id) || id <= 0 || Number.isNaN(deadline)) {
      console.error('usage: gpu-watchdog.ts --id <droplet id> --deadline <ISO time> [--tag t] | --sweep [--tag t] [--cap-minutes m]')
      process.exit(2)
    }

    void timed(id, deadline, tag)
  }
}
