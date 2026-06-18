// The uniform byte layout for the fold shaders (code/render/fold.wgsl.ts), in ONE place. Both the headless
// readback adapter (PNG / GIF) and the browser canvas adapter (React) pack the same bytes through these
// functions, so the WGSL `Params` struct has a single source of truth on the TypeScript side.

// the fold cap. Deep / paracompact tilings need more, this is ample for {p,q} and {p,q,r}.
export const FOLD_ITERATIONS = 200

// the 2D camera, a Mobius pan (the disk point under the screen centre), a zoom, and a view rotation. `aspect` is
// the viewport width / height so a non-square canvas keeps the disk circular instead of stretching it to fill.
export type Fold2DUniform = {
  pan: [number, number]
  zoom: number
  rotation: number
  edgeWidth: number
  aspect: number
}

// the 3D camera, a Mobius world-shift (the negated camera ball point), an eye position (its negative is the
// look direction), and the raymarch parameters. `aspect` is the viewport width / height (1 = square).
export type Fold3DUniform = {
  shift: [number, number, number]
  eye: [number, number, number]
  edgeWidth: number
  detail: number
  maxSteps: number
  aspect: number
}

// pack the 2D Params: n0,n1,n2 (vec4), cam (vec4: panX, panY, zoom, rotation), iterations (u32), edgeWidth,
// 2 pads. 80 bytes.
export function packFold2D(mirrors: number[][], cam: Fold2DUniform): ArrayBuffer {
  const data = new ArrayBuffer(80)
  const f = new Float32Array(data)
  const u = new Uint32Array(data)
  for (let i = 0; i < 3; i++) {
    f[i * 4 + 0] = mirrors[i]?.[0] ?? 0
    f[i * 4 + 1] = mirrors[i]?.[1] ?? 0
    f[i * 4 + 2] = mirrors[i]?.[2] ?? 0
    f[i * 4 + 3] = 0
  }
  f[12] = cam.pan[0]
  f[13] = cam.pan[1]
  f[14] = cam.zoom
  f[15] = cam.rotation
  u[16] = FOLD_ITERATIONS
  f[17] = cam.edgeWidth
  f[18] = cam.aspect // pad0 slot, the viewport aspect for the circular-disk correction
  return data
}

// pack the 3D Params: n0..n3 (vec4), eye (vec4), cam (vec4), iterations (u32), edgeWidth, detail, maxSteps.
// 112 bytes. Shared by the exterior honeycomb shader and the solid-room interior shader.
export function packFold3D(mirrors: number[][], cam: Fold3DUniform): ArrayBuffer {
  const data = new ArrayBuffer(112)
  const f = new Float32Array(data)
  const u = new Uint32Array(data)
  for (let i = 0; i < 4; i++) {
    f[i * 4 + 0] = mirrors[i]?.[0] ?? 0
    f[i * 4 + 1] = mirrors[i]?.[1] ?? 0
    f[i * 4 + 2] = mirrors[i]?.[2] ?? 0
    f[i * 4 + 3] = mirrors[i]?.[3] ?? 0
  }
  f[16] = cam.eye[0]; f[17] = cam.eye[1]; f[18] = cam.eye[2]; f[19] = cam.aspect // eye.w carries the aspect
  f[20] = cam.shift[0]; f[21] = cam.shift[1]; f[22] = cam.shift[2]; f[23] = 0
  u[24] = FOLD_ITERATIONS
  f[25] = cam.edgeWidth
  f[26] = cam.detail
  f[27] = cam.maxSteps
  return data
}
