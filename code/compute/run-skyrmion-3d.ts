// PART I/II GATE on the GPU: does the 3D direction field STABILIZE and SPONTANEOUSLY FORM topological selves
// (skyrmions) when the symmetry-allowed chiral stabilizer (a DMI-like term) is present? Large 3D lattice,
// overdamped relaxation of n in S^2 under exchange + chiral-DMI + field, on the GPU via the `webgpu` package.
// We run WITH and WITHOUT the stabilizer from a RANDOM start and measure the topological (skyrmion) charge
// that forms. With it, selves should emerge and hold; without it, the field relaxes to vacuum (no selves).
// Run: pnpm tsx code/gpu/run-skyrmion-3d.ts

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const L = 64 // cube side, N = L^3 sites of the 3D direction field
const STEPS = 1200
const DT = 0.1
const FIELD = 0.2 // Zeeman field along +z (sets the background)
const WG = 64

const WGSL = /* wgsl */ `
struct P { L:u32, pad0:u32, pad1:u32, pad2:u32, dmi:f32, field:f32, dt:f32, pad3:f32 };
@group(0) @binding(0) var<uniform> p:P;
@group(0) @binding(1) var<storage,read> ni:array<vec4<f32>>;
@group(0) @binding(2) var<storage,read_write> no:array<vec4<f32>>;
fn ix(x:i32,y:i32,z:i32)->u32 { let L=i32(p.L); let a=(x+L)%L; let b=(y+L)%L; let c=(z+L)%L; return u32((c*L+b)*L+a); }
@compute @workgroup_size(${WG})
fn main(@builtin(global_invocation_id) gid:vec3<u32>){
  let N=p.L*p.L*p.L; let i=gid.x; if(i>=N){return;}
  let L=i32(p.L); let x=i32(i%p.L); let y=i32((i/p.L)%p.L); let z=i32(i/(p.L*p.L));
  let n=ni[i].xyz;
  let xp=ni[ix(x+1,y,z)].xyz; let xm=ni[ix(x-1,y,z)].xyz;
  let yp=ni[ix(x,y+1,z)].xyz; let ym=ni[ix(x,y-1,z)].xyz;
  let zp=ni[ix(x,y,z+1)].xyz; let zm=ni[ix(x,y,z-1)].xyz;
  let Hex = xp+xm+yp+ym+zp+zm;                                  // exchange (align with neighbours)
  let Hd  = cross(vec3<f32>( 1.,0.,0.),xp)+cross(vec3<f32>(-1.,0.,0.),xm)   // chiral DMI (the stabilizer)
          + cross(vec3<f32>(0., 1.,0.),yp)+cross(vec3<f32>(0.,-1.,0.),ym)
          + cross(vec3<f32>(0.,0., 1.),zp)+cross(vec3<f32>(0.,0.,-1.),zm);
  var H = Hex + p.dmi*Hd + vec3<f32>(0.,0.,p.field);
  let Hp = H - dot(n,H)*n;                                       // project onto the tangent of S^2
  let nn = normalize(n + p.dt*Hp);                              // overdamped relaxation toward the energy minimum
  no[i] = vec4<f32>(nn, 0.);
}`

// CPU topological charge of a z-slice (Berg-Luscher skyrmion number)
function sliceCharge(buf: Float32Array, z: number): number {
  const at = (x: number, y: number): number[] => {
    const i = (z * L + y) * L + x

    return [buf[i * 4]!, buf[i * 4 + 1]!, buf[i * 4 + 2]!]
  }

  const dot = (a: number[], b: number[]): number =>
    a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

  const cross = (a: number[], b: number[]): number[] => [
    a[1]! * b[2]! - a[2]! * b[1]!,
    a[2]! * b[0]! - a[0]! * b[2]!,
    a[0]! * b[1]! - a[1]! * b[0]!,
  ]

  const tri = (a: number[], b: number[], c: number[]): number => {
    const num = dot(a, cross(b, c))
    const den = 1 + dot(a, b) + dot(b, c) + dot(c, a)

    return 2 * Math.atan2(num, den)
  }

  let q = 0

  for (let x = 0; x < L - 1; x++) {
    for (let y = 0; y < L - 1; y++) {
      const a = at(x, y),
        b = at(x + 1, y),
        c = at(x + 1, y + 1),
        d = at(x, y + 1)

      q += tri(a, b, c) + tri(a, c, d)
    }
  }

  return q / (4 * Math.PI)
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()
  const N = L * L * L
  const bytes = N * 16

  // deterministic random initial direction field (unit vectors), the symmetry-broken start
  const seed = new Float32Array(N * 4)
  const r = makeRng({ seed: 22222221 })
  const rnd = (): number => r.next()

  for (let i = 0; i < N; i++) {
    const u = 2 * rnd() - 1,
      ph = 2 * Math.PI * rnd(),
      s = Math.sqrt(1 - u * u)

    seed[i * 4] = s * Math.cos(ph)
    seed[i * 4 + 1] = s * Math.sin(ph)
    seed[i * 4 + 2] = u
  }

  const module = device.createShaderModule({ code: WGSL })
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  })

  const params = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const mk = (): GPUBuffer =>
    device.createBuffer({
      size: bytes,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const staging = device.createBuffer({
    size: bytes,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const dispatch = Math.ceil(N / WG)

  const trial = async (dmi: number, label: string): Promise<void> => {
    device.queue.writeBuffer(params, 0, new Uint32Array([L, 0, 0, 0]))
    device.queue.writeBuffer(
      params,
      16,
      new Float32Array([dmi, FIELD, DT, 0]),
    )

    const bufs: [GPUBuffer, GPUBuffer] = [mk(), mk()]
    device.queue.writeBuffer(bufs[0], 0, seed)

    const layout = pipeline.getBindGroupLayout(0)
    const bind = (a: GPUBuffer, b: GPUBuffer): GPUBindGroup =>
      device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: params } },
          { binding: 1, resource: { buffer: a } },
          { binding: 2, resource: { buffer: b } },
        ],
      })

    let src = 0

    const readCharge = async (): Promise<number> => {
      const enc = device.createCommandEncoder()
      enc.copyBufferToBuffer(bufs[src]!, 0, staging, 0, bytes)
      device.queue.submit([enc.finish()])
      await staging.mapAsync(GPUMapMode.READ)

      const out = new Float32Array(staging.getMappedRange().slice(0))
      staging.unmap()

      let tot = 0

      for (let z = 4; z < L; z += 8) {
        tot += Math.abs(sliceCharge(out, z))
      } // average |Q| over several slices

      return tot / Math.floor((L - 4) / 8)
    }

    const marks: number[] = []

    for (let s = 0; s < STEPS; s++) {
      if (s === 0 || s === 300 || s === 600 || s === STEPS - 1) {
        marks.push(Math.round((await readCharge()) * 10) / 10)
      }

      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
      pass.dispatchWorkgroups(dispatch)
      pass.end()
      device.queue.submit([enc.finish()])
      src = 1 - src
    }

    console.log(
      `  ${label}: mean |skyrmion charge| per slice at steps 0,300,600,${STEPS - 1} = ${marks.join(', ')}`,
    )
  }

  console.log(
    `3D direction field on the GPU, ${N.toLocaleString()} sites (${L}^3), from a RANDOM start:`,
  )
  await trial(0.0, 'NO stabilizer (exchange + field only)   ')
  await trial(0.5, 'WITH chiral stabilizer (exchange+DMI+field)')
  console.log(
    '  => if WITH-stabilizer holds non-zero charge while NO-stabilizer decays to 0, topological',
  )
  console.log(
    '     selves FORM and PERSIST spontaneously in 3D once the rule supplies the stabilizer.',
  )
}

run().catch(e =>
  console.error(e instanceof Error ? e.message : String(e)),
)
