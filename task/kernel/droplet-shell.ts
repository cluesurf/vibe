// THE DROPLET SHELL: the ssh, readiness and package-copy pieces shared by task/kernel/droplet-run.ts (one job, one
// machine) and task/burst/index.ts (a batch of jobs on one temporary machine). task/kernel/
//
// Nothing here creates or destroys a machine. The DigitalOcean helpers (doctl, tagged, destroy) stay in
// gpu-watchdog.ts, and the price lookup is here because both runners print a cost.

import { execFileSync, spawnSync } from 'node:child_process'
import { doctl } from './gpu-watchdog'

// what of the package goes to a machine: everything tsconfig.check.json typechecks (so a typecheck there is the same
// one as here), and the kernel's sources, never kernel/host (a build for this laptop's arch)
export const PACKAGE_PATHS = [
  'package.json',
  'tsconfig.json',
  'tsconfig.check.json',
  'kernel/Cargo.toml',
  'kernel/Cargo.lock',
  'kernel/build.rs',
  'kernel/src',
  'code',
  'task',
  'test',
  'research',
]

export const pause = (seconds: number): void => {
  execFileSync('sleep', [String(seconds)])
}

export type Shell = {
  options: () => string[]
  remote: (host: string, command: string, timeout?: number) => string
  waitSsh: (host: string, until: number) => void
  waitSetup: (host: string) => void
}

// ssh bound to one known_hosts file (a rented machine's key is new every time, so it never goes in ~/.ssh) and one
// private key, logging through the caller's log
export function makeShell(knownHosts: string, identity: string | undefined, log: (line: string) => void): Shell {
  const options = (): string[] => [
    '-o',
    'BatchMode=yes',
    '-o',
    'ConnectTimeout=15',
    '-o',
    'ServerAliveInterval=30',
    '-o',
    'ServerAliveCountMax=10',
    '-o',
    'StrictHostKeyChecking=accept-new',
    '-o',
    `UserKnownHostsFile=${knownHosts}`,
    ...(identity ? ['-i', identity, '-o', 'IdentitiesOnly=yes'] : []),
  ]

  // one command on the machine; its output, or a thrown error naming what failed
  const remote = (host: string, command: string, timeout = 120_000): string => {
    const r = spawnSync('ssh', [...options(), host, command], { timeout, maxBuffer: 1 << 26 })

    if (r.status !== 0) {
      throw new Error(`ssh failed (${r.status}): ${r.stderr?.toString().trim().split('\n')[0] ?? ''}`)
    }

    return r.stdout.toString()
  }

  // ssh up AND the machine running our commands. A GPU image finishes its own first-boot setup after ssh answers, and
  // until then its login prints "Please wait while we get your droplet ready..." and exits 0 WITHOUT running the command
  // (the first GPU run was lost that way): so a command counts only when its own marker comes back
  const waitSsh = (host: string, until: number): void => {
    for (;;) {
      const r = spawnSync('ssh', [...options(), host, 'echo vibe-ready-$((6 * 7))'], { timeout: 40_000 })

      if (r.status === 0 && r.stdout?.toString().includes('vibe-ready-42')) {
        return
      }

      if (r.stdout?.toString().trim()) {
        log(`not ready yet: ${r.stdout.toString().trim().split('\n')[0]}`)
      }

      if (Date.now() > until) {
        throw new Error('no ssh to the machine in time')
      }

      pause(10)
    }
  }

  // the image's own first-boot setup (cloud-init), waited for with a stated bound: 15 minutes
  const waitSetup = (host: string): void => {
    const out = remote(host, 'timeout 900 cloud-init status --wait >/dev/null 2>&1; echo vibe-setup-$(cloud-init status 2>/dev/null | tr -d " ")', 960_000)

    log(`first-boot setup: ${out.trim().split('\n').pop() ?? '(nothing)'}`)

    if (!out.includes('vibe-setup-')) {
      throw new Error('the first-boot setup wait did not run')
    }
  }

  return { options, remote, waitSsh, waitSetup }
}

export type Size = { slug: string; price_hourly: number; vcpus: number; memory: number; regions: string[]; available: boolean }

// DigitalOcean's size list (needs the token); empty when it cannot be read
export function sizes(): Size[] {
  try {
    return JSON.parse(doctl(['compute', 'size', 'list', '-o', 'json'])) as Size[]
  } catch {
    return []
  }
}

export function priceHourly(size: string): number | undefined {
  return sizes().find(x => x.slug === size)?.price_hourly
}
