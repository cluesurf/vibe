// The hunt for emergent MIDDLE LAYERS, faithfully. Run the pure five-thing rule on the GPU, then ask, as you
// COARSE-GRAIN (block-average the charge into balls of growing radius), does the pattern become more
// PERSISTENT in time (slow modes = a real emergent layer) or churn just as fast at every scale (no layer)?
// We measure the temporal autocorrelation of the coarse charge at scales radius 0,1,2,3. If it decays slower
// at coarser scales, a persistent middle layer emerges from the churn. NOT physics names, just persistence.
// Run: pnpm tsx --max-old-space-size=8192 code/gpu/run-emergent-layers.ts

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }
const WORKGROUP = 256
const CELLS = 600_000
const WARMUP = 400
const K = 8 // beats between snapshots
const M = 30 // snapshots
const SCALES = [0, 1, 2, 3]

const PURE_RULE_WGSL = /* wgsl */ `
struct Params { colorStart: u32, colorCount: u32, pad0: u32, pad1: u32 };
@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read_write> tone: array<u32>;
@group(0) @binding(2) var<storage, read> edgeV: array<u32>;
@group(0) @binding(3) var<storage, read> edgeW: array<u32>;
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= P.colorCount) { return; }
  var perm = array<u32,9>(5u,3u,6u,1u,4u,7u,2u,0u,8u);
  let e = P.colorStart + gid.x; let v = edgeV[e]; let w = edgeW[e];
  let out = perm[tone[v] * 3u + tone[w]];
  tone[v] = out / 3u; tone[w] = out % 3u;
}
`

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no GPU')

    return
  }

  const device = await adapter.requestDevice()
  const g = buildDodecagrid({ maxCells: CELLS })
  const N = g.cellCount
  const eu: number[] = [],
    ev: number[] = []

  for (let v = 0; v < N; v++) {
    for (let p = g.offsets[v]!; p < g.offsets[v + 1]!; p++) {
      const w = g.adj[p]!

      if (w > v) {
        eu.push(v)
        ev.push(w)
      }
    }
  }

  const E = eu.length
  const mask = new Uint32Array(N)
  const color = new Int32Array(E)

  let maxColor = 0

  for (let i = 0; i < E; i++) {
    const used = mask[eu[i]!]! | mask[ev[i]!]!

    let c = 0

    while (used & (1 << c)) {
      c++
    }

    color[i] = c
    mask[eu[i]!]! |= 1 << c
    mask[ev[i]!]! |= 1 << c

    if (c > maxColor) maxColor = c
  }

  const C = maxColor + 1
  const colorOffsets = new Array(C + 1).fill(0)

  for (let i = 0; i < E; i++) {
    colorOffsets[color[i]! + 1]++
  }

  for (let c = 0; c < C; c++) colorOffsets[c + 1] += colorOffsets[c]!

  const edgeV = new Uint32Array(E),
    edgeW = new Uint32Array(E)

  const cur = colorOffsets.slice()

  for (let i = 0; i < E; i++) {
    const at = cur[color[i]!]!++

    edgeV[at] = eu[i]!
    edgeW[at] = ev[i]!
  }

  console.log(
    `built ${N.toLocaleString()} cells, ${E.toLocaleString()} edges, ${C} colours`,
  )

  // BFS-ball partitions at each scale (radius R). ballOf[scale][cell] = super-cell index.
  const partitions = SCALES.map(R => {
    const ballOf = new Int32Array(N).fill(-1)

    let nb = 0

    if (R === 0) {
      for (let i = 0; i < N; i++) ballOf[i] = i

      return { ballOf, count: N }
    }

    for (let s = 0; s < N; s++) {
      if (ballOf[s]! >= 0) continue

      const id = nb++

      ballOf[s] = id

      let frontier = [s]

      for (let r = 0; r < R; r++) {
        const nx: number[] = []

        for (const u of frontier) {
          for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
            const w = g.adj[p]!

            if (ballOf[w]! < 0) {
              ballOf[w] = id
              nx.push(w)
            }
          }
        }

        frontier = nx
      }
    }

    return { ballOf, count: nb }
  })

  console.log(
    'scale (radius) -> super-cells:',
    SCALES.map(
      (R, i) => `R${R}:${partitions[i]!.count.toLocaleString()}`,
    ).join('  '),
  )

  // GPU buffers
  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const toneBuf = device.createBuffer({
    size: N * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })

  const seed = new Uint32Array(N)
  const r = makeRng({ seed: 987654321 })
  const nx = () => r.next()

  for (let i = 0; i < N; i++) {
    const x = nx()

    seed[i] = x < 0.2 ? 1 : x < 0.4 ? 2 : 0
  }

  device.queue.writeBuffer(toneBuf, 0, seed)

  const vBuf = device.createBuffer({
    size: E * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(vBuf, 0, edgeV)

  const wBuf = device.createBuffer({
    size: E * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(wBuf, 0, edgeW)

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({ code: PURE_RULE_WGSL }),
      entryPoint: 'main',
    },
  })

  const layout = pipeline.getBindGroupLayout(0)
  const bind = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: params } },
      { binding: 1, resource: { buffer: toneBuf } },
      { binding: 2, resource: { buffer: vBuf } },
      { binding: 3, resource: { buffer: wBuf } },
    ],
  })

  const staging = device.createBuffer({
    size: N * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const beatGpu = () => {
    for (let c = 0; c < C; c++) {
      const start = colorOffsets[c]!,
        count = colorOffsets[c + 1]! - start

      if (!count) continue

      device.queue.writeBuffer(
        params,
        0,
        new Uint32Array([start, count, 0, 0]),
      )

      const enc = device.createCommandEncoder()
      const p = enc.beginComputePass()

      p.setPipeline(pipeline)
      p.setBindGroup(0, bind)
      p.dispatchWorkgroups(Math.ceil(count / WORKGROUP))
      p.end()
      device.queue.submit([enc.finish()])
    }
  }

  for (let b = 0; b < WARMUP; b++) beatGpu()

  await device.queue.onSubmittedWorkDone()

  // snapshots: coarse charge per scale per snapshot
  const series = partitions.map(p =>
    Array.from({ length: M }, () => new Float64Array(p.count)),
  )

  for (let s = 0; s < M; s++) {
    for (let b = 0; b < K; b++) beatGpu()

    {
      const enc = device.createCommandEncoder()

      enc.copyBufferToBuffer(toneBuf, 0, staging, 0, N * 4)
      device.queue.submit([enc.finish()])
    }

    await staging.mapAsync(GPUMapMode.READ)

    const t = new Uint32Array(staging.getMappedRange().slice(0))

    staging.unmap()

    for (let sc = 0; sc < SCALES.length; sc++) {
      const ballOf = partitions[sc]!.ballOf
      const arr = series[sc]![s]!

      for (let i = 0; i < N; i++) {
        const q = t[i] === 1 ? 1 : t[i] === 2 ? -1 : 0

        if (q) {
          const bi = ballOf[i]!

          arr[bi] = arr[bi]! + q
        }
      }
    }
  }

  // temporal autocorrelation C(tau) per scale, normalized to C(0)=1
  console.log(
    'Persistence by scale: temporal autocorrelation of coarse charge (slower decay at coarse = a layer)',
  )

  console.log(
    '  scale | C(1 step) | C(2) | C(4) | C(8)  [steps of ' +
      K +
      ' beats]',
  )

  for (let sc = 0; sc < SCALES.length; sc++) {
    const ser = series[sc]!
    const n = partitions[sc]!.count

    const c0 = (): number => {
      let s = 0

      for (let st = 0; st < M; st++) {
        for (let i = 0; i < n; i++) s += ser[st]![i]! * ser[st]![i]!
      }

      return s
    }

    const ctau = (tau: number): number => {
      let s = 0

      for (let st = 0; st + tau < M; st++) {
        for (let i = 0; i < n; i++)
          s += ser[st]![i]! * ser[st + tau]![i]!
      }

      return s
    }

    const base = c0() / M
    const c = (tau: number) =>
      ctau(tau) / Math.max(1, M - tau) / Math.max(1e-9, base)

    console.log(
      `   R${SCALES[sc]}   |   ${c(1).toFixed(2)}    | ${c(2).toFixed(2)} | ${c(4).toFixed(2)} | ${c(8).toFixed(2)}`,
    )
  }

  console.log(
    '  => if C decays SLOWER as scale grows, a persistent slow mode (middle layer) emerges. flat across scales = pure churn, no layer.',
  )
}

run().catch(e =>
  console.error(e instanceof Error ? e.message : String(e)),
)
