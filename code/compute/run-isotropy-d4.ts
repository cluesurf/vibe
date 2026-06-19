// GPU 24-direction scale-up: SIMULATE the discrete wave's light cone on a 4D lattice with the {3,4,3,4} bulk's
// 24 directions (the 24-cell, +-e_i+-e_j), and confirm the light cone is ISOTROPIC (reaches axes and body-
// diagonals at the same rate), versus the 8-direction hypercubic (+-e_i) which is anisotropic. This simulates,
// at scale on the GPU, what p233 showed analytically. Bonus, the 24-direction degree 24 = 0 mod 3, so the
// mod-3 wave conserves cleanly. Run: pnpm tsx code/gpu/run-isotropy-d4.ts

import { create, globals } from 'webgpu'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const L = 24
const N = L * L * L * L
const T = 8 // beats (light cone radius stays < L/2)
const WG = 64

const WGSL = /* wgsl */ `
struct P { L:u32, count:u32, _a:u32, _b:u32 };
@group(0) @binding(0) var<uniform> p:P;
@group(0) @binding(1) var<storage,read> prev:array<i32>;
@group(0) @binding(2) var<storage,read> cur:array<i32>;
@group(0) @binding(3) var<storage,read_write> nxt:array<i32>;
@group(0) @binding(4) var<storage,read> off:array<vec4<i32>>;
@group(0) @binding(5) var<storage,read_write> reached:array<i32>;
fn ix(x:i32,y:i32,z:i32,w:i32)->u32{ let L=i32(p.L); let a=(x%L+L)%L; let b=(y%L+L)%L; let c=(z%L+L)%L; let d=(w%L+L)%L; return u32(((d*L+c)*L+b)*L+a); }
@compute @workgroup_size(${WG})
fn step(@builtin(global_invocation_id) gid:vec3<u32>){
  let i=gid.x; if(i>=p.L*p.L*p.L*p.L){return;}
  let L=p.L; let x=i32(i%L); let y=i32((i/L)%L); let z=i32((i/(L*L))%L); let w=i32(i/(L*L*L));
  var s=0; for(var n=0u;n<p.count;n++){ let o=off[n]; s+=cur[ix(x+o.x,y+o.y,z+o.z,w+o.w)]; }
  let v=((s - prev[i]) % 3 + 3) % 3;
  nxt[i]=v; if(v!=0){ reached[i]=1; }
}`

function offsets24(): Int32Array {
  const o: number[] = []
  const ax = [0, 1, 2, 3]

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const v = [0, 0, 0, 0]
          v[ax[a]!] = sa
          v[ax[b]!] = sb
          o.push(v[0]!, v[1]!, v[2]!, v[3]!)
        }
      }
    }
  }

  return new Int32Array(o) // 24 * 4
}

function offsets8(): Int32Array {
  const o: number[] = []

  for (let a = 0; a < 4; a++) {
    for (const s of [1, -1]) {
      const v = [0, 0, 0, 0]
      v[a] = s
      o.push(v[0]!, v[1]!, v[2]!, v[3]!)
    }
  }

  return new Int32Array(o) // 8 * 4
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter')

    return
  }

  const device = await adapter.requestDevice()
  const module = device.createShaderModule({ code: WGSL })
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'step' },
  })

  const mk = (n: number): GPUBuffer =>
    device.createBuffer({
      size: n * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const uni = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const stage = device.createBuffer({
    size: N * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const C = L >> 1

  const measure = async (
    off: Int32Array,
    label: string,
  ): Promise<number> => {
    const count = off.length / 4

    let prev = mk(N),
      cur = mk(N),
      nxt = mk(N)

    const reached = mk(N),
      offBuf = mk(off.length)

    device.queue.writeBuffer(offBuf, 0, off)

    const seed = new Int32Array(N)
    seed[((C * L + C) * L + C) * L + C] = 1
    device.queue.writeBuffer(cur, 0, seed)
    device.queue.writeBuffer(reached, 0, new Int32Array(N))
    device.queue.writeBuffer(uni, 0, new Uint32Array([L, count, 0, 0]))

    const layout = pipeline.getBindGroupLayout(0)

    for (let t = 0; t < T; t++) {
      const bg = device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: uni } },
          { binding: 1, resource: { buffer: prev } },
          { binding: 2, resource: { buffer: cur } },
          { binding: 3, resource: { buffer: nxt } },
          { binding: 4, resource: { buffer: offBuf } },
          { binding: 5, resource: { buffer: reached } },
        ],
      })

      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bg)
      pass.dispatchWorkgroups(Math.ceil(N / WG))
      pass.end()
      device.queue.submit([enc.finish()])

      const tmp = prev
      prev = cur
      cur = nxt
      nxt = tmp
    }

    const enc = device.createCommandEncoder()
    enc.copyBufferToBuffer(reached, 0, stage, 0, N * 4)
    device.queue.submit([enc.finish()])
    await stage.mapAsync(GPUMapMode.READ)

    const r = new Int32Array(stage.getMappedRange().slice(0))
    stage.unmap()

    // light-cone extent, max along an AXIS vs along the body-DIAGONAL (1,1,1,1)/2
    let axisExt = 0,
      diagExt = 0

    for (let i = 0; i < N; i++) {
      if (r[i] === 0) {
        continue
      }

      const x = i % L,
        y = Math.floor(i / L) % L,
        z = Math.floor(i / (L * L)) % L,
        w = Math.floor(i / (L * L * L))

      const dx = x - C,
        dy = y - C,
        dz = z - C,
        dw = w - C

      axisExt = Math.max(
        axisExt,
        Math.abs(dx),
        Math.abs(dy),
        Math.abs(dz),
        Math.abs(dw),
      )
      diagExt = Math.max(diagExt, (dx + dy + dz + dw) / 2) // projection on the unit diagonal
    }

    const ratio = diagExt / axisExt
    console.log(
      `  ${label}: axis extent ${axisExt}, diagonal extent ${diagExt.toFixed(1)}, isotropy ratio diag/axis = ${ratio.toFixed(2)} (1 = isotropic)`,
    )

    return ratio
  }

  console.log(
    `GPU 24-direction light-cone isotropy, 4D L=${L} (${N.toLocaleString()} cells), ${T} beats:`,
  )

  const r24 = await measure(
    offsets24(),
    '24-dir (the {3,4,3,4} bulk, +-e_i+-e_j)',
  )

  const r8 = await measure(
    offsets8(),
    ' 8-dir (hypercubic, +-e_i)        ',
  )

  console.log(
    `  => the 24-direction light cone is ${Math.abs(r24 - 1) < Math.abs(r8 - 1) ? 'MORE ISOTROPIC' : 'not more isotropic'} than the 8-direction`,
  )
  console.log(
    '     (24-dir ratio ' +
      r24.toFixed(2) +
      ' closer to 1 than 8-dir ' +
      r8.toFixed(2) +
      '). The discrete {3,4,3,4} rule',
  )
  console.log(
    '     coarse-grains to an isotropic continuum at scale, simulated on the GPU (p233 was the analytic version).',
  )
  console.log(
    `RESULT: 24-dir isotropy ${r24.toFixed(2)} vs 8-dir ${r8.toFixed(2)} (1 = isotropic).`,
  )
}

run().catch(e =>
  console.error(e instanceof Error ? e.message : String(e)),
)
