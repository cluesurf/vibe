// GPU Skyrme-sign gate-closer, the CLEAN route: a DOUBLE-TWIST PERIODIC background. Instead of a localized
// soliton (whose sea energy is surface-dominated, defeating p205/p214/p216/L32), use a uniform two-axis twist
// of the direction field on a TORUS (periodic, no surface, no box, no localization). The fermion sea energy is
// then purely bulk gradient energy, Delta E(q) = A*q^2 + B*q^4, where q is the twist rate. B IS the Skyrme
// coefficient, its SIGN settles "does the rule supply a stabilizer". Computed by KPM (Tr|H|) + stochastic trace
// + common random numbers, on the GPU at L=32. Run: pnpm tsx code/gpu/run-skyrme-twist.ts
// n(x,y) = (sin(qx), -cos(qx)sin(qy), cos(qx)cos(qy)), unit, periodic for q = 2*pi*k/L, Skyrme density ~ q^4.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const L = 32
const N = L * L * L
const FN = 16 * N
const MASS = 1.5
const MCHEB = 240
const NRV = 12
const Ks = [1, 2, 3, 4] // twist winding numbers; q = 2*pi*k/L
const A = (Math.sqrt(3) + MASS) * 1.06

// double twist (Skyrme density ~ q^4 != 0); k=0 -> (0,0,1) uniform vacuum
function nrt3(k: number): Float32Array {
  const out = new Float32Array(3 * N),
    q = (2 * Math.PI * k) / L

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        const s = (z * L + y) * L + x
        out[s * 3] = Math.sin(q * x)
        out[s * 3 + 1] = -Math.cos(q * x) * Math.sin(q * y)
        out[s * 3 + 2] = Math.cos(q * x) * Math.cos(q * y)
      }
    }
  }

  return out
}

// single helix (ONE twist axis -> ZERO Skyrme density; its q^4 is the pure lattice-exchange artifact)
function nrt3helix(k: number): Float32Array {
  const out = new Float32Array(3 * N),
    q = (2 * Math.PI * k) / L

  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        const s = (z * L + y) * L + x
        out[s * 3] = Math.sin(q * x)
        out[s * 3 + 1] = 0
        out[s * 3 + 2] = Math.cos(q * x)
      }
    }
  }

  return out
}

function absCoeffs(M: number): Float64Array {
  const c = new Float64Array(M)
  c[0] = 2 / Math.PI

  for (let k = 1; 2 * k < M; k++) {
    c[2 * k] = ((-4 / Math.PI) * (-1) ** k) / (4 * k * k - 1)
  }

  return c
}

function jackson(M: number): Float64Array {
  const g = new Float64Array(M),
    Np = M + 1

  for (let n = 0; n < M; n++) {
    g[n] =
      ((Np - n) * Math.cos((Math.PI * n) / Np) +
        Math.sin((Math.PI * n) / Np) / Math.tan(Math.PI / Np)) /
      Np
  }

  return g
}

const WGSL = /* wgsl */ `
struct P { L:u32, N:u32, mass:f32, a:f32, scA:f32, scB:f32, mom:u32, nPart:u32 };
@group(0) @binding(0) var<uniform> p:P;
@group(0) @binding(1) var<storage,read> inp:array<f32>;
@group(0) @binding(2) var<storage,read> nrt:array<f32>;
@group(0) @binding(3) var<storage,read_write> outp:array<f32>;
fn rd(s:u32, c:u32)->vec2<f32>{ let i=(s*8u+c)*2u; return vec2<f32>(inp[i], inp[i+1u]); }
fn cm(a:vec2<f32>, b:vec2<f32>)->vec2<f32>{ return vec2<f32>(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }
@compute @workgroup_size(64)
fn matvec(@builtin(global_invocation_id) gid:vec3<u32>){
  let s=gid.x; if(s>=p.N){return;} let L=p.L; let Li=i32(L);
  let x=i32(s%L); let y=i32((s/L)%L); let z=i32(s/(L*L));
  var oR:array<f32,8>; var oI:array<f32,8>;
  for(var c=0u;c<8u;c++){ oR[c]=0.0; oI[c]=0.0; }
  for(var axis=0u; axis<3u; axis++){
    var ox=0; var oy=0; var oz=0;
    if(axis==0u){ox=1;} else if(axis==1u){oy=1;} else {oz=1;}
    let xp=(x+ox+Li)%Li; let yp=(y+oy+Li)%Li; let zp=(z+oz+Li)%Li; // PERIODIC
    let xm=(x-ox+Li)%Li; let ym=(y-oy+Li)%Li; let zm=(z-oz+Li)%Li;
    let sp = u32((zp*Li+yp)*Li+xp); let sm = u32((zm*Li+ym)*Li+xm);
    for(var d=0u; d<4u; d++){
      var dp:u32; var coef:vec2<f32>;
      if(axis==0u){ dp = 3u-d; coef=vec2<f32>(0.0,-0.5); }
      else if(axis==1u){ dp = 3u-d; let sgn = select(-0.5, 0.5, (d%2u)==1u); coef=vec2<f32>(sgn,0.0); }
      else { if(d==0u){dp=2u;coef=vec2<f32>(0.0,-0.5);} else if(d==1u){dp=3u;coef=vec2<f32>(0.0,0.5);} else if(d==2u){dp=0u;coef=vec2<f32>(0.0,-0.5);} else {dp=1u;coef=vec2<f32>(0.0,0.5);} }
      for(var t=0u; t<2u; t++){
        let diff = rd(sp, dp*2u+t) - rd(sm, dp*2u+t);
        let v = cm(coef, diff); let c = d*2u+t;
        oR[c] += v.x; oI[c] += v.y;
      }
    }
  }
  let nx=nrt[s*3u]; let ny=nrt[s*3u+1u]; let nz=nrt[s*3u+2u];
  let m00=vec2<f32>(nz,0.0); let m01=vec2<f32>(nx,-ny); let m10=vec2<f32>(nx,ny); let m11=vec2<f32>(-nz,0.0);
  for(var d=0u; d<4u; d++){
    let bd = select(-1.0, 1.0, d<2u); let g = p.mass*bd;
    let psi0 = rd(s, d*2u); let psi1 = rd(s, d*2u+1u);
    let r0 = cm(m00,psi0)+cm(m01,psi1); let r1 = cm(m10,psi0)+cm(m11,psi1);
    oR[d*2u] += g*r0.x; oI[d*2u] += g*r0.y; oR[d*2u+1u] += g*r1.x; oI[d*2u+1u] += g*r1.y;
  }
  for(var c=0u;c<8u;c++){ let i=(s*8u+c)*2u; outp[i]=oR[c]; outp[i+1u]=oI[c]; }
}
@compute @workgroup_size(256)
fn combine(@builtin(global_invocation_id) gid:vec3<u32>){ let i=gid.x; if(i>=16u*p.N){return;} outp[i]=p.scA*inp[i]-p.scB*nrt[i]; }
var<workgroup> sdat:array<f32,256>;
@compute @workgroup_size(256)
fn dotPartial(@builtin(global_invocation_id) gid:vec3<u32>, @builtin(local_invocation_id) lid:vec3<u32>, @builtin(workgroup_id) wid:vec3<u32>){
  let i=gid.x; var v=0.0; if(i<16u*p.N){ v=inp[i]*nrt[i]; }
  sdat[lid.x]=v; workgroupBarrier();
  for(var st=128u; st>0u; st>>=1u){ if(lid.x<st){ sdat[lid.x]+=sdat[lid.x+st]; } workgroupBarrier(); }
  if(lid.x==0u){ outp[wid.x]=sdat[0]; }
}
@compute @workgroup_size(256)
fn dotFinal(@builtin(local_invocation_id) lid:vec3<u32>){
  var v=0.0; var k=lid.x; loop{ if(k>=p.nPart){break;} v+=inp[k]; k+=256u; }
  sdat[lid.x]=v; workgroupBarrier();
  for(var st=128u; st>0u; st>>=1u){ if(lid.x<st){ sdat[lid.x]+=sdat[lid.x+st]; } workgroupBarrier(); }
  if(lid.x==0u){ outp[p.mom]=sdat[0]; }
}`

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter')

    return
  }

  const device = await adapter.requestDevice()
  const mod = device.createShaderModule({ code: WGSL })
  const mk = (n: number): GPUBuffer =>
    device.createBuffer({
      size: n * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const nPart = Math.ceil(FN / 256)
  const Bb = [mk(FN), mk(FN), mk(FN)],
    tmp = mk(FN),
    xi = mk(FN),
    nrt = mk(3 * N),
    partials = mk(nPart),
    moments = mk(MCHEB)

  const stage = device.createBuffer({
    size: MCHEB * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const uni = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const pipe = (e: string): GPUComputePipeline =>
    device.createComputePipeline({
      layout: 'auto',
      compute: { module: mod, entryPoint: e },
    })

  const pMat = pipe('matvec'),
    pComb = pipe('combine'),
    pDP = pipe('dotPartial'),
    pDF = pipe('dotFinal')

  const bg = (
    pl: GPUComputePipeline,
    b1: GPUBuffer,
    b2: GPUBuffer,
    b3: GPUBuffer,
  ): GPUBindGroup =>
    device.createBindGroup({
      layout: pl.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uni } },
        { binding: 1, resource: { buffer: b1 } },
        { binding: 2, resource: { buffer: b2 } },
        { binding: 3, resource: { buffer: b3 } },
      ],
    })

  const bgDF = (): GPUBindGroup =>
    device.createBindGroup({
      layout: pDF.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uni } },
        { binding: 1, resource: { buffer: partials } },
        { binding: 3, resource: { buffer: moments } },
      ],
    })

  const setUni = (scA: number, scB: number, mom: number): void => {
    device.queue.writeBuffer(uni, 0, new Uint32Array([L, N]))
    device.queue.writeBuffer(
      uni,
      8,
      new Float32Array([MASS, A, scA, scB]),
    )
    device.queue.writeBuffer(uni, 24, new Uint32Array([mom, nPart]))
  }

  const wgN = Math.ceil(N / 64),
    wgF = Math.ceil(FN / 256)

  async function computeMoments(): Promise<Float64Array> {
    const step = (
      inBuf: GPUBuffer,
      outBuf: GPUBuffer,
      scA: number,
      scB: number,
      t0: GPUBuffer,
      mom: number,
      dotCur: GPUBuffer,
    ): void => {
      setUni(scA, scB, mom)
      const enc = device.createCommandEncoder()

      let pass = enc.beginComputePass()
      pass.setPipeline(pMat)
      pass.setBindGroup(0, bg(pMat, inBuf, nrt, tmp))
      pass.dispatchWorkgroups(wgN)
      pass.end()
      pass = enc.beginComputePass()
      pass.setPipeline(pComb)
      pass.setBindGroup(0, bg(pComb, tmp, t0, outBuf))
      pass.dispatchWorkgroups(wgF)
      pass.end()
      pass = enc.beginComputePass()
      pass.setPipeline(pDP)
      pass.setBindGroup(0, bg(pDP, xi, dotCur, partials))
      pass.dispatchWorkgroups(wgF)
      pass.end()
      pass = enc.beginComputePass()
      pass.setPipeline(pDF)
      pass.setBindGroup(0, bgDF())
      pass.dispatchWorkgroups(1)
      pass.end()
      device.queue.submit([enc.finish()])
    }

    const dotOnly = (cur: GPUBuffer, mom: number): void => {
      setUni(0, 0, mom)
      const enc = device.createCommandEncoder()

      let pass = enc.beginComputePass()
      pass.setPipeline(pDP)
      pass.setBindGroup(0, bg(pDP, xi, cur, partials))
      pass.dispatchWorkgroups(wgF)
      pass.end()
      pass = enc.beginComputePass()
      pass.setPipeline(pDF)
      pass.setBindGroup(0, bgDF())
      pass.dispatchWorkgroups(1)
      pass.end()
      device.queue.submit([enc.finish()])
    }

    dotOnly(Bb[0]!, 0)
    step(Bb[0]!, Bb[1]!, 1 / A, 0, Bb[0]!, 1, Bb[1]!)
    let i0 = 0,
      i1 = 1

    for (let n = 2; n < MCHEB; n++) {
      const itn = 3 - i0 - i1
      step(Bb[i1]!, Bb[itn]!, 2 / A, 1, Bb[i0]!, n, Bb[itn]!)
      i0 = i1
      i1 = itn
    }

    const enc = device.createCommandEncoder()
    enc.copyBufferToBuffer(moments, 0, stage, 0, MCHEB * 4)
    device.queue.submit([enc.finish()])
    await stage.mapAsync(GPUMapMode.READ)
    const out = new Float64Array(
      new Float32Array(stage.getMappedRange().slice(0)),
    )

    stage.unmap()

    return out
  }

  const c = absCoeffs(MCHEB),
    g = jackson(MCHEB)

  const vacN = nrt3(0)
  const dblN = Ks.map(k => nrt3(k)),
    helN = Ks.map(k => nrt3helix(k))

  const dMuD = Ks.map(() => new Float64Array(MCHEB)),
    dMuH = Ks.map(() => new Float64Array(MCHEB))

  const rng = makeRng({ seed: 271 })
  console.log(
    `GPU Skyrme twist (double + helix control), L=${L} (dim ${8 * N}), ${MCHEB} moments, ${NRV} probes, a=${A.toFixed(2)}`,
  )

  for (let r = 0; r < NRV; r++) {
    const xd = new Float32Array(FN)

    for (let i = 0; i < FN; i++) {
      xd[i] = rng.next() < 0.5 ? -1 : 1
    }

    device.queue.writeBuffer(xi, 0, xd)
    device.queue.writeBuffer(nrt, 0, vacN)
    device.queue.writeBuffer(Bb[0]!, 0, xd)
    const muV = await computeMoments()

    for (let ki = 0; ki < Ks.length; ki++) {
      device.queue.writeBuffer(nrt, 0, dblN[ki]!)
      device.queue.writeBuffer(Bb[0]!, 0, xd)
      const mD = await computeMoments()

      for (let n = 0; n < MCHEB; n++) {
        dMuD[ki]![n]! += (mD[n]! - muV[n]!) / NRV
      }

      device.queue.writeBuffer(nrt, 0, helN[ki]!)
      device.queue.writeBuffer(Bb[0]!, 0, xd)
      const mH = await computeMoments()

      for (let n = 0; n < MCHEB; n++) {
        dMuH[ki]![n]! += (mH[n]! - muV[n]!) / NRV
      }
    }

    process.stdout.write(`  probe ${r + 1}/${NRV}\r`)
  }

  const energies = (dMu: Float64Array[]): { q: number; dE: number }[] =>
    Ks.map((k, ki) => {
      let s = 0

      for (let n = 0; n < MCHEB; n++) {
        s += g[n]! * c[n]! * dMu[ki]![n]!
      }

      return { q: (2 * Math.PI * k) / L, dE: -0.5 * A * s }
    })

  const fit = (
    pts: { q: number; dE: number }[],
  ): { A: number; B: number } => {
    let s4 = 0,
      s6 = 0,
      s8 = 0,
      t1 = 0,
      t2 = 0

    for (const p of pts) {
      const q2 = p.q * p.q,
        q4 = q2 * q2

      s4 += q4
      s6 += q4 * q2
      s8 += q4 * q4
      t1 += q2 * p.dE
      t2 += q4 * p.dE
    }

    const det = s4 * s8 - s6 * s6

    return {
      A: (t1 * s8 - t2 * s6) / det,
      B: (s4 * t2 - s6 * t1) / det,
    }
  }

  const dbl = energies(dMuD),
    hel = energies(dMuH)

  console.log(
    '\nDelta E(q): double-twist (Skyrme) vs helix (control, no Skyrme):',
  )

  for (let i = 0; i < Ks.length; i++) {
    console.log(
      `  q=${dbl[i]!.q.toFixed(3)}: double ${dbl[i]!.dE.toFixed(1)}, helix ${hel[i]!.dE.toFixed(1)}`,
    )
  }

  const fD = fit(dbl),
    fH = fit(hel)

  // the helix q^4 is the pure lattice-exchange artifact; scale it by the exchange ratio (A_double/A_helix) and subtract
  const ratio = fD.A / fH.A
  const skyrme = fD.B - ratio * fH.B
  console.log(
    `  double:  A(q^2)=${fD.A.toFixed(1)}, B(q^4)=${fD.B.toFixed(1)}`,
  )
  console.log(
    `  helix :  A(q^2)=${fH.A.toFixed(1)}, B(q^4)=${fH.B.toFixed(1)}  (pure lattice artifact, no Skyrme)`,
  )
  console.log(`  exchange ratio A_double/A_helix = ${ratio.toFixed(2)}`)
  console.log(
    `  ISOLATED SKYRME = B_double - ratio*B_helix = ${skyrme.toFixed(1)}`,
  )
  const stabilizing = skyrme > 0
  console.log(
    `  => ${stabilizing ? 'SKYRME > 0 (POSITIVE): the fermion supplies a STABILIZING term. GATE CLOSED (positive sign).' : 'Skyrme <= 0 after subtraction: not stabilizing by this measure. Honest result.'}`,
  )
  console.log(
    `RESULT: skyrme=${skyrme.toFixed(1)} (raw B_double=${fD.B.toFixed(1)}, B_helix=${fH.B.toFixed(1)}), stabilizing ${stabilizing}`,
  )
}

run().catch(e =>
  console.error(e instanceof Error ? e.message : String(e)),
)
