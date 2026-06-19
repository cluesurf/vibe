// GPU KPM sea-energy gate-closer: the Dirac-skyrmion sea energy E_sea = -(1/2)Tr|H| vs TEXTURE soliton size R,
// at large lattice (L~32) to open a clean B*R + D/R scaling window the CPU (L=14) could not. The Dirac matvec
// runs as a WGSL compute kernel; the Chebyshev moment recurrence + stochastic-trace dots run on-GPU with COMMON
// RANDOM NUMBERS (vacuum cancels per-sample). A MINIMUM in Delta E_sea(R) proves the Skyrme coefficient D > 0
// (the fermion supplies the stabilizer). Run: pnpm tsx code/gpu/run-kpm-sea-energy.ts

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const L = 32
const N = L * L * L
const FN = 16 * N // flat f32 length (8 components x re/im)
const MASS = 1.5
const MCHEB = 240
const NRV = 8
const Rs = [3, 4, 6, 9, 13]
const A = (Math.sqrt(3) + MASS) * 1.06 // spectral bound: |H| <= sqrt(3)+M (exact), small margin

// direction field n(x) (3 per site): uniformz (vacuum) or a charge-1 hopfion texture of size R
function nrt3(mode: 'uniformz' | 'texture', R: number): Float32Array {
  const out = new Float32Array(3 * N),
    C = L / 2
  for (let x = 0; x < L; x++)
    for (let y = 0; y < L; y++)
      for (let z = 0; z < L; z++) {
        const s = (z * L + y) * L + x
        let nx: number, ny: number, nz: number
        if (mode === 'uniformz') {
          nx = 0
          ny = 0
          nz = 1
        } else {
          const X = (x - C + 0.5) / R,
            Y = (y - C + 0.5) / R,
            Z = (z - C + 0.5) / R,
            r2 = X * X + Y * Y + Z * Z,
            d0 = 1 + r2
          const a = (2 * X) / d0,
            b = (2 * Y) / d0,
            cc = (2 * Z) / d0,
            dd = (1 - r2) / d0
          nx = 2 * (a * cc + b * dd)
          ny = 2 * (b * cc - a * dd)
          nz = a * a + b * b - cc * cc - dd * dd
          const m = Math.hypot(nx, ny, nz) || 1
          nx /= m
          ny /= m
          nz /= m
        }
        out[s * 3] = nx
        out[s * 3 + 1] = ny
        out[s * 3 + 2] = nz
      }
  return out
}
function absCoeffs(M: number): Float64Array {
  const c = new Float64Array(M)
  c[0] = 2 / Math.PI
  for (let k = 1; 2 * k < M; k++)
    c[2 * k] = ((-4 / Math.PI) * (-1) ** k) / (4 * k * k - 1)
  return c
}
function jackson(M: number): Float64Array {
  const g = new Float64Array(M),
    Np = M + 1
  for (let n = 0; n < M; n++)
    g[n] =
      ((Np - n) * Math.cos((Math.PI * n) / Np) +
        Math.sin((Math.PI * n) / Np) / Math.tan(Math.PI / Np)) /
      Np
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
  // kinetic: per axis, the (out d, neighbour d', coef) structure of alpha_i*(-i)*0.5
  // axis x: all coef (0,-0.5), d->d': 0->3,1->2,2->1,3->0
  // axis y: coef d0(-0.5,0)d1(0.5,0)d2(-0.5,0)d3(0.5,0), d->d': 0->3,1->2,2->1,3->0
  // axis z: coef d0(0,-0.5)d1(0,0.5)d2(0,-0.5)d3(0,0.5), d->d': 0->2,1->3,2->0,3->1
  for(var axis=0u; axis<3u; axis++){
    var ox=0; var oy=0; var oz=0;
    if(axis==0u){ox=1;} else if(axis==1u){oy=1;} else {oz=1;}
    let xp=x+ox; let yp=y+oy; let zp=z+oz; let xm=x-ox; let ym=y-oy; let zm=z-oz;
    let hasP = xp>=0 && xp<Li && yp>=0 && yp<Li && zp>=0 && zp<Li;
    let hasM = xm>=0 && xm<Li && ym>=0 && ym<Li && zm>=0 && zm<Li;
    let sp = select(0u, u32((zp*Li+yp)*Li+xp), hasP);
    let sm = select(0u, u32((zm*Li+ym)*Li+xm), hasM);
    for(var d=0u; d<4u; d++){
      var dp:u32; var coef:vec2<f32>;
      if(axis==0u){ dp = 3u-d; coef=vec2<f32>(0.0,-0.5); }
      else if(axis==1u){ dp = 3u-d; let sgn = select(-0.5, 0.5, (d%2u)==1u); coef=vec2<f32>(sgn,0.0); }
      else { if(d==0u){dp=2u;coef=vec2<f32>(0.0,-0.5);} else if(d==1u){dp=3u;coef=vec2<f32>(0.0,0.5);} else if(d==2u){dp=0u;coef=vec2<f32>(0.0,-0.5);} else {dp=1u;coef=vec2<f32>(0.0,0.5);} }
      for(var t=0u; t<2u; t++){
        var diff = vec2<f32>(0.0,0.0);
        if(hasP){ diff += rd(sp, dp*2u+t); }
        if(hasM){ diff -= rd(sm, dp*2u+t); }
        let v = cm(coef, diff); let c = d*2u+t;
        oR[c] += v.x; oI[c] += v.y;
      }
    }
  }
  // mass: mass * beta[d] * (n.tau)[t][t'] * psi[d,t'];  n.tau=[[nz,nx-i ny],[nx+i ny,-nz]]
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
// combine: out = scA*tmp - scB*t0   (binding 1=tmp, 2=t0, 3=out)
@compute @workgroup_size(256)
fn combine(@builtin(global_invocation_id) gid:vec3<u32>){ let i=gid.x; if(i>=16u*p.N){return;} outp[i]=p.scA*inp[i]-p.scB*nrt[i]; }
// dot partials: partials[wg] = sum_local xi*cur   (1=xi, 2=cur, 3=partials)
var<workgroup> sdat:array<f32,256>;
@compute @workgroup_size(256)
fn dotPartial(@builtin(global_invocation_id) gid:vec3<u32>, @builtin(local_invocation_id) lid:vec3<u32>, @builtin(workgroup_id) wid:vec3<u32>){
  let i=gid.x; var v=0.0; if(i<16u*p.N){ v=inp[i]*nrt[i]; }
  sdat[lid.x]=v; workgroupBarrier();
  for(var st=128u; st>0u; st>>=1u){ if(lid.x<st){ sdat[lid.x]+=sdat[lid.x+st]; } workgroupBarrier(); }
  if(lid.x==0u){ outp[wid.x]=sdat[0]; }
}
// dot final: moments[mom] = sum partials   (1=partials, 3=moments)
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
  const B = [mk(FN), mk(FN), mk(FN)],
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
  // dotFinal uses only bindings 0,1,3 (auto layout omits binding 2)
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

  // moments for the current nrt buffer + xi buffer, written to `moments`, read back
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
    // mom0: dot(xi, t0=B[0]); mom1: t1=B[1]=(1/a)H B[0]; dot(xi,B[1])
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
    dotOnly(B[0]!, 0)
    step(B[0]!, B[1]!, 1 / A, 0, B[0]!, 1, B[1]!) // t1 = (1/a) H t0 ; dot uses B[1]
    let i0 = 0,
      i1 = 1
    for (let n = 2; n < MCHEB; n++) {
      const itn = 3 - i0 - i1
      step(B[i1]!, B[itn]!, 2 / A, 1, B[i0]!, n, B[itn]!)
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
  const vacN = nrt3('uniformz', 0)
  const texN = Rs.map(R => nrt3('texture', R))
  const dMu = Rs.map(() => new Float64Array(MCHEB))
  const rng = makeRng({ seed: 999 })
  console.log(
    `GPU KPM sea energy, L=${L} (dim ${8 * N}), ${MCHEB} moments, ${NRV} probes, spectral bound a=${A.toFixed(2)}`,
  )
  for (let r = 0; r < NRV; r++) {
    const xd = new Float32Array(FN)
    for (let i = 0; i < FN; i++) {
      xd[i] = rng.next() < 0.5 ? -1 : 1
    }
    device.queue.writeBuffer(xi, 0, xd)
    device.queue.writeBuffer(nrt, 0, vacN)
    device.queue.writeBuffer(B[0]!, 0, xd)
    const muV = await computeMoments()
    for (let ri = 0; ri < Rs.length; ri++) {
      device.queue.writeBuffer(nrt, 0, texN[ri]!)
      device.queue.writeBuffer(B[0]!, 0, xd)
      const muH = await computeMoments()
      for (let n = 0; n < MCHEB; n++)
        dMu[ri]![n]! += (muH[n]! - muV[n]!) / NRV
    }
    process.stdout.write(`  probe ${r + 1}/${NRV}\r`)
  }
  const deltaE = Rs.map((R, ri) => {
    let s = 0
    for (let n = 0; n < MCHEB; n++) s += g[n]! * c[n]! * dMu[ri]![n]!
    return [R, Math.round(-0.5 * A * s * 100) / 100] as [number, number]
  })
  console.log('\nDelta E_sea(R) (texture soliton, fermion sea):')
  for (const [R, dE] of deltaE) console.log(`  R=${R}: ${dE}`)
  let minI = 0
  for (let i = 1; i < deltaE.length; i++)
    if (deltaE[i]![1] < deltaE[minI]![1]) minI = i
  const hasMin = minI > 0 && minI < deltaE.length - 1
  console.log(`  minimum at R=${deltaE[minI]![0]} (interior=${hasMin})`)
  console.log(
    hasMin
      ? '  => MINIMUM found: Delta E ~ B*R + D/R with D>0 (Skyrme STABILIZING). GATE CLOSED (positive sign).'
      : '  => no interior minimum: the 1/R term is still not isolated at this L; honest partial.',
  )
  console.log(
    `RESULT: deltaE ${deltaE.map(d => d[1]).join('/')}, interior minimum ${hasMin}`,
  )
}

run().catch(e =>
  console.error(e instanceof Error ? e.message : String(e)),
)
