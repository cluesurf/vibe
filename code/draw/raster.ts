// A raster canvas as a flat RGBA byte buffer, plus the primitive draws the
// renderers share: the background fill and the filled disk. The renderers were
// each re-implementing these inline.

export type Color = [number, number, number]

// A width x height RGBA buffer filled with the background color, alpha 255.
export function makeCanvas(input: {
  width: number
  height: number
  background: Color
}): Uint8Array {
  const { width, height, background } = input
  const rgba = new Uint8Array(width * height * 4)
  for (let pixel = 0; pixel < width * height; pixel++) {
    const offset = pixel * 4
    rgba[offset] = background[0]
    rgba[offset + 1] = background[1]
    rgba[offset + 2] = background[2]
    rgba[offset + 3] = 255
  }
  return rgba
}

// Set one pixel. The caller is responsible for clipping (drawDisk does).
export function setPixel(
  rgba: Uint8Array,
  width: number,
  x: number,
  y: number,
  color: Color,
): void {
  const offset = (y * width + x) * 4
  rgba[offset] = color[0]
  rgba[offset + 1] = color[1]
  rgba[offset + 2] = color[2]
  rgba[offset + 3] = 255
}

// A filled disk of the given radius, clipped to the canvas. Center and radius may
// be fractional: it scans the integer pixels in the clipped bounding box and keeps
// those within the true (float) radius, so a sub-pixel dot still lands cleanly.
export function drawDisk(input: {
  rgba: Uint8Array
  width: number
  height: number
  centerX: number
  centerY: number
  radius: number
  color: Color
}): void {
  const { rgba, width, height, centerX, centerY, radius, color } = input
  const minX = Math.max(0, Math.floor(centerX - radius))
  const maxX = Math.min(width - 1, Math.ceil(centerX + radius))
  const minY = Math.max(0, Math.floor(centerY - radius))
  const maxY = Math.min(height - 1, Math.ceil(centerY + radius))
  const radiusSquared = radius * radius
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - centerX
      const dy = y - centerY
      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(rgba, width, x, y, color)
      }
    }
  }
}
