// THE GPU RUN: rent one GPU droplet, run task/kernel/gpu-job.sh on it, bring the logs back, destroy it. task/kernel/
// A thin wrapper: this is task/kernel/droplet-run.ts --kind gpu, kept so `pnpm gpu:run` and its flags keep working.
// Every guarantee (refuse on a leftover tagged vibe-gpu-bench, exactly one droplet, the detached watchdog at creation,
// the readiness and first-boot waits, the job's sentinels and --verify, destroy by id in a finally and on signals,
// confirmation by tag, the minutes and the cost) is droplet-run's; see its header.
//
//   gpu-run.ts --region <slug> --ssh-key <id or fingerprint> [--identity <private key>] [--size gpu-mi300x1-192gb]
//              [--image <slug>] [--feature hip|cuda] [--cap-minutes 150] [--commit]
//   gpu-run.ts --verify <run directory>
//   environment: VIBE_GPU_REGION, VIBE_GPU_SSH_KEY, VIBE_GPU_IDENTITY, VIBE_GPU_SIZE, VIBE_GPU_IMAGE, VIBE_GPU_FEATURE,
//                VIBE_GPU_CAP_MINUTES
//
// Runs now land in tmp/droplet-run/<time>/ (the runs before this wrapper are in tmp/gpu-run/).

import { argv } from 'node:process'

if (!argv.includes('--kind')) {
  argv.push('--kind', 'gpu')
}

// imported after the argument is in place, since droplet-run reads its arguments when it loads
const { main } = await import('./droplet-run')

await main()
