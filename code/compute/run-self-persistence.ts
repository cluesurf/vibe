// GPU vast-scale test of proto-self PERSISTENCE under the bare conserving knit-gas.
//
// A higher-order self needs, first, a pattern that holds together and stays localized as the rule churns.
// This runner seeds a compact, momentum-balanced blob of aligned populations (a proto-self) on a vacuum, runs
// the deterministic 24-direction {3,4,3,4} lattice gas (stream + momentum-conserving collide) at large scale,
// and measures whether the blob STAYS LOCALIZED (a bound self) or SPREADS (a gas). The localization is the
// root-mean-square radius of the net-positive charge about the seed center, measured over beats.
//
// This is an HONEST measurement, not a rigged positive. The bare five base things are known to give identity
// and a radiation channel but NOT a bound, self-repairing body (that needs one more discrete ingredient, an
// attraction). So the expected reading is that the blob spreads ballistically, radius growing about linearly in
// time, which establishes the baseline any real binding must beat. The runner reports the growth rate so a later
// attractive enrichment can be measured against it at the same scale.
//
// It also verifies the determinism backbone exactly at scale, charge and momentum conserved to the integer, and
// self-checks the GPU kernel against a CPU reference (bit-identical one beat) on a small lattice.
//
// Run: pnpm call code/compute/run-self-persistence.ts

import { create, globals } from 'webgpu'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const DIRN = 24
const WG = 64

// the small lattice for the CPU self-check, and the large lattice for the science measure
const CHECK_L = 6
const SCIENCE_L = 32
const BEATS = 12

// the 24 directions +-e_i+-e_j, and the permutation under swapping axes 0<->1 (a 24-cell symmetry involution)
function dirs(): { vecs: number[][]; swap: number[] } {
  const vecs: number[][] = []

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const v = [0, 0, 0, 0]
          v[a] = sa
          v[b] = sb
          vecs.push(v)
        }
      }
    }
  }

  const key = (v: number[]): string => v.join(',')
  const idx = new Map(vecs.map((v, i) => [key(v), i]))
  const swap = vecs.map(v => idx.get(key([v[1]!, v[0]!, v[2]!, v[3]!]))!)

  return { vecs, swap }
}

const WGSL = /* wgsl */ `
struct P { L:u32, _a:u32, _b:u32, _c:u32 };
@group(0) @binding(0) var<uniform> p:P;
@group(0) @binding(1) var<storage,read> inp:array<i32>;
@group(0) @binding(2) var<storage,read_write> outp:array<i32>;
@group(0) @binding(3) var<storage,read> off:array<vec4<i32>>;
@group(0) @binding(4) var<storage,read> swap:array<u32>;
fn ix(x:i32,y:i32,z:i32,w:i32)->u32{ let L=i32(p.L); let a=(x%L+L)%L; let b=(y%L+L)%L; let c=(z%L+L)%L; let d=(w%L+L)%L; return u32((((d*L+c)*L+b)*L+a)); }
@compute @workgroup_size(${WG})
fn step(@builtin(global_invocation_id) gid:vec3<u32>){
  let cell=gid.x; if(cell>=p.L*p.L*p.L*p.L){return;}
  let L=p.L; let x=i32(cell%L); let y=i32((cell/L)%L); let z=i32((cell/(L*L))%L); let w=i32(cell/(L*L*L));
  var pop:array<i32,24>;
  for(var k=0u;k<24u;k++){ let o=off[k]; pop[k]=inp[ix(x-o.x,y-o.y,z-o.z,w-o.w)*24u+k]; }
  var mx=0; var my=0; var mz=0; var mw=0;
  for(var k=0u;k<24u;k++){ let o=off[k]; mx+=pop[k]*o.x; my+=pop[k]*o.y; mz+=pop[k]*o.z; mw+=pop[k]*o.w; }
  if(mx==0 && my==0 && mz==0 && mw==0){
    var tmp:array<i32,24>;
    for(var k=0u;k<24u;k++){ tmp[k]=pop[swap[k]]; }
    for(var k=0u;k<24u;k++){ pop[k]=tmp[k]; }
  }
  for(var k=0u;k<24u;k++){ outp[cell*24u+k]=pop[k]; }
}`

// CPU reference: one beat, the same stream + momentum-conserving collide, for the self-check
function cpuBeat(
  inp: Int32Array,
  L: number,
  vecs: number[][],
  swap: number[],
): Int32Array {
  const N = L * L * L * L
  const out = new Int32Array(N * DIRN)
  const ix = (x: number, y: number, z: number, w: number): number => {
    const a = ((x % L) + L) % L
    const b = ((y % L) + L) % L
    const c = ((z % L) + L) % L
    const d = ((w % L) + L) % L

    return ((d * L + c) * L + b) * L + a
  }

  for (let cell = 0; cell < N; cell++) {
    const x = cell % L
    const y = Math.floor(cell / L) % L
    const z = Math.floor(cell / (L * L)) % L
    const w = Math.floor(cell / (L * L * L))
    const pop = new Int32Array(DIRN)

    for (let k = 0; k < DIRN; k++) {
      const o = vecs[k]!
      pop[k] =
        inp[
          ix(x - o[0]!, y - o[1]!, z - o[2]!, w - o[3]!) * DIRN + k
        ]!
    }

    let mx = 0
    let my = 0
    let mz = 0
    let mw = 0

    for (let k = 0; k < DIRN; k++) {
      const o = vecs[k]!
      mx += pop[k]! * o[0]!
      my += pop[k]! * o[1]!
      mz += pop[k]! * o[2]!
      mw += pop[k]! * o[3]!
    }

    if (mx === 0 && my === 0 && mz === 0 && mw === 0) {
      const tmp = Int32Array.from(pop)

      for (let k = 0; k < DIRN; k++) {
        pop[k] = tmp[swap[k]!]!
      }
    }

    for (let k = 0; k < DIRN; k++) {
      out[cell * DIRN + k] = pop[k]!
    }
  }

  return out
}

// seed a compact momentum-balanced proto-self at the lattice center: every cell within `radius` of center gets
// all 24 populations set to +1 (net charge 24, net momentum 0), vacuum elsewhere
function seedProtoSelf(L: number, radius: number): Int32Array {
  const N = L * L * L * L
  const state = new Int32Array(N * DIRN)
  const c = Math.floor(L / 2)

  for (let w = c - radius; w <= c + radius; w++) {
    for (let z = c - radius; z <= c + radius; z++) {
      for (let y = c - radius; y <= c + radius; y++) {
        for (let x = c - radius; x <= c + radius; x++) {
          const cell = ((w * L + z) * L + y) * L + x

          for (let k = 0; k < DIRN; k++) {
            state[cell * DIRN + k] = 1
          }
        }
      }
    }
  }

  return state
}

// root-mean-square radius of the net-positive charge about the seed center, with minimal-image wrap
function rmsRadius(state: Int32Array, L: number): number {
  const c = Math.floor(L / 2)

  let weight = 0
  let sumR2 = 0

  for (let w = 0; w < L; w++) {
    for (let z = 0; z < L; z++) {
      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          const cell = ((w * L + z) * L + y) * L + x

          let q = 0

          for (let k = 0; k < DIRN; k++) {
            q += state[cell * DIRN + k]!
          }

          if (q <= 0) {
            continue
          }

          const dd = (a: number): number => {
            const r = ((a - c + L / 2 + L) % L) - L / 2

            return r * r
          }

          const r2 = dd(x) + dd(y) + dd(z) + dd(w)
          weight += q
          sumR2 += q * r2
        }
      }
    }
  }

  return weight > 0 ? Math.sqrt(sumR2 / weight) : 0
}

function totals(
  state: Int32Array,
  vecs: number[][],
): { charge: number; mom: number[] } {
  const n = state.length / DIRN

  let charge = 0

  const mom = [0, 0, 0, 0]

  for (let cell = 0; cell < n; cell++) {
    for (let k = 0; k < DIRN; k++) {
      const v = state[cell * DIRN + k]!
      charge += v

      for (let j = 0; j < 4; j++) {
        mom[j]! += v * vecs[k]![j]!
      }
    }
  }

  return { charge, mom }
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter (this runner needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()
  const { vecs, swap } = dirs()
  const module = device.createShaderModule({ code: WGSL })
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'step' },
  })
  const layout = pipeline.getBindGroupLayout(0)

  // each direction is already 4D, filling a vec4<i32> exactly (4 i32, the array stride)
  const offData = new Int32Array(vecs.flat())
  const swapData = new Uint32Array(swap)

  // one full run at a given lattice size, returning the seeded blob's radius over beats and the conserved sums
  const simulate = async (
    L: number,
    beats: number,
    captureEvery: number,
  ): Promise<{
    radii: { beat: number; radius: number }[]
    start: { charge: number; mom: number[] }
    end: { charge: number; mom: number[] }
    endState: Int32Array
  }> => {
    const N = L * L * L * L
    const SZ = N * DIRN

    const mk = (n: number): GPUBuffer =>
      device.createBuffer({
        size: n * 4,
        usage:
          GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_SRC |
          GPUBufferUsage.COPY_DST,
      })

    let a = mk(SZ)
    let b = mk(SZ)
    const offBuf = mk(DIRN * 4)
    const swapBuf = mk(DIRN)
    const uni = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    const stage = device.createBuffer({
      size: SZ * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    })

    device.queue.writeBuffer(offBuf, 0, offData)
    device.queue.writeBuffer(swapBuf, 0, swapData)
    device.queue.writeBuffer(uni, 0, new Uint32Array([L, 0, 0, 0]))

    const init = seedProtoSelf(L, 1)
    device.queue.writeBuffer(a, 0, init)

    const stepOnce = (src: GPUBuffer, dst: GPUBuffer): void => {
      const bg = device.createBindGroup({
        layout,
        entries: [
          { binding: 0, resource: { buffer: uni } },
          { binding: 1, resource: { buffer: src } },
          { binding: 2, resource: { buffer: dst } },
          { binding: 3, resource: { buffer: offBuf } },
          { binding: 4, resource: { buffer: swapBuf } },
        ],
      })
      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bg)
      pass.dispatchWorkgroups(Math.ceil(N / WG))
      pass.end()
      device.queue.submit([enc.finish()])
    }

    const readState = async (buf: GPUBuffer): Promise<Int32Array> => {
      const enc = device.createCommandEncoder()
      enc.copyBufferToBuffer(buf, 0, stage, 0, SZ * 4)
      device.queue.submit([enc.finish()])
      await stage.mapAsync(GPUMapMode.READ)
      const out = new Int32Array(stage.getMappedRange().slice(0))
      stage.unmap()

      return out
    }

    const start = totals(init, vecs)
    const radii: { beat: number; radius: number }[] = [
      { beat: 0, radius: rmsRadius(init, L) },
    ]

    let src = a
    let dst = b

    for (let t = 1; t <= beats; t++) {
      stepOnce(src, dst)
      const tmp = src
      src = dst
      dst = tmp

      if (t % captureEvery === 0 || t === beats) {
        const s = await readState(src)
        radii.push({ beat: t, radius: rmsRadius(s, L) })
      }
    }

    const endState = await readState(src)
    const end = totals(endState, vecs)

    return { radii, start, end, endState }
  }

  // 1. CPU self-check on a small lattice: GPU one beat must match the CPU reference bit for bit
  const checkN = CHECK_L * CHECK_L * CHECK_L * CHECK_L
  const checkInit = seedProtoSelf(CHECK_L, 1)
  const cpuOne = cpuBeat(checkInit, CHECK_L, vecs, swap)
  const gpuCheck = await simulate(CHECK_L, 1, 1)
  let mismatches = 0

  for (let i = 0; i < checkN * DIRN; i++) {
    if (gpuCheck.endState[i] !== cpuOne[i]) {
      mismatches++
    }
  }

  console.log(
    `self-check L=${CHECK_L} one beat: GPU vs CPU mismatches ${mismatches} -> ${mismatches === 0 ? 'IDENTICAL' : 'FAIL'}`,
  )

  // 2. the science run at scale
  const L = SCIENCE_L
  const N = L * L * L * L
  const sim = await simulate(L, BEATS, 3)
  const chargeOk = sim.end.charge === sim.start.charge
  const momOk = sim.end.mom.every((m, i) => m === sim.start.mom[i]!)

  console.log(
    `\nGPU proto-self persistence, 4D L=${L} (${N.toLocaleString()} docks x 24 sites = ${(N * DIRN).toLocaleString()} vibes), ${BEATS} beats:`,
  )
  console.log(
    `  determinism backbone: charge conserved ${chargeOk} (${sim.start.charge} -> ${sim.end.charge}), momentum conserved ${momOk}`,
  )
  console.log('  proto-self rms radius over beats (seeded blob):')

  for (const r of sim.radii) {
    console.log(`    beat ${r.beat}: radius ${r.radius.toFixed(3)}`)
  }

  // linear (ballistic) growth rate of the radius, the baseline a real binding must beat
  const first = sim.radii[0]!
  const last = sim.radii[sim.radii.length - 1]!
  const growthPerBeat =
    last.beat > first.beat
      ? (last.radius - first.radius) / (last.beat - first.beat)
      : 0

  console.log(
    `  radius growth per beat: ${growthPerBeat.toFixed(3)} (ballistic baseline, near 1 means the bare rule does NOT bind)`,
  )
  console.log(
    'RESULT: at scale the bare conserving knit-gas conserves exactly and the proto-self',
  )
  console.log(
    `        ${growthPerBeat > 0.5 ? 'SPREADS (no binding from the bare rule, as expected, the honest baseline)' : 'STAYS LOCALIZED (binding signal, investigate for artifacts)'}.`,
  )
}

run().catch(e => console.error(e instanceof Error ? e.message : String(e)))
