// Keyboard + mouse navigation, built into the render layer (not the app), so any host that mounts a canvas gets
// HyperRogue-style controls for free. It is framework-agnostic, it attaches DOM listeners to a canvas and
// window and drives a Camera. Held keys move the walker each frame (called from the engine's `tick`), the mouse
// looks around (drag), and the wheel zooms (2D) or dollies forward (3D).
//
//   W / Up        forward            A / Left   turn left        Q   strafe left      Space  rise (3D)
//   S / Down      back               D / Right  turn right       E   strafe right     Shift  sink (3D)
//   mouse drag    look (yaw / pitch)            wheel            zoom (2D) / move (3D)

import type { Camera } from '@/code/render/gpu/camera'

const MOVE_SPEED = 1.6 // hyperbolic length per second
const TURN_SPEED = 1.9 // radians per second
const MOUSE_LOOK = 0.005 // radians per pixel
const WHEEL_ZOOM = 0.0015
const WHEEL_MOVE = 0.004

export type Controls = {
  // advance the held-key motion by `dt` seconds, called once per frame by the engine before it renders
  tick(dt: number): void
  detach(): void
}

export function attachControls(input: {
  canvas: HTMLCanvasElement
  camera: Camera
}): Controls {
  const { canvas, camera } = input
  const held = new Set<string>()
  let dragging = false
  let lastX = 0
  let lastY = 0

  const onKeyDown = (e: KeyboardEvent): void => {
    held.add(e.key.length === 1 ? e.key.toLowerCase() : e.key)
    if (NAV_KEYS.has(e.key) || NAV_KEYS.has(e.key.toLowerCase())) {
      e.preventDefault()
    }
  }
  const onKeyUp = (e: KeyboardEvent): void => {
    held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key)
  }

  const onPointerDown = (e: PointerEvent): void => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    canvas.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) {
      return
    }
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    camera.turn(-dx * MOUSE_LOOK)
    camera.tilt(-dy * MOUSE_LOOK)
  }
  const onPointerUp = (e: PointerEvent): void => {
    dragging = false
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId)
    }
  }
  const onWheel = (e: WheelEvent): void => {
    e.preventDefault()
    if (camera.mode === '2d') {
      camera.zoomBy(Math.exp(-e.deltaY * WHEEL_ZOOM))
    } else {
      camera.moveForward(-e.deltaY * WHEEL_MOVE)
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })

  const axis = (positive: string[], negative: string[]): number =>
    (positive.some(k => held.has(k)) ? 1 : 0) -
    (negative.some(k => held.has(k)) ? 1 : 0)

  return {
    tick(dt) {
      const forward = axis(['w', 'ArrowUp'], ['s', 'ArrowDown'])
      const turn = axis(['a', 'ArrowLeft'], ['d', 'ArrowRight'])
      const strafe = axis(['e'], ['q'])
      const lift = axis([' '], ['Shift'])
      if (forward) {
        camera.moveForward(forward * MOVE_SPEED * dt)
      }
      if (turn) {
        camera.turn(turn * TURN_SPEED * dt)
      }
      if (strafe) {
        camera.moveRight(strafe * MOVE_SPEED * dt)
      }
      if (lift) {
        camera.moveUp(lift * MOVE_SPEED * dt)
      }
    },
    detach() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
    },
  }
}

const NAV_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  'q',
  'e',
  ' ',
  'Shift',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])
