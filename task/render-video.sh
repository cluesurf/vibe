#!/usr/bin/env bash
# Assemble the per-beat horosphere PNG frames into a video.
# Frames are produced by: pnpm tsx code/gpu/render-horosphere-anim.ts  (writes make/frames/frame_NNNN.png)
# Usage: task/render-video.sh [framerate]   (default 20)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRAMES_DIR="$DIR/make/frames"
OUT_MP4="$DIR/make/horosphere.mp4"
FRAMERATE="${1:-20}"

if [ ! -d "$FRAMES_DIR" ]; then
  echo "no frames at $FRAMES_DIR, run: pnpm tsx code/gpu/render-horosphere-anim.ts"
  exit 1
fi

ffmpeg -y -framerate "$FRAMERATE" -i "$FRAMES_DIR/frame_%04d.png" \
  -pix_fmt yuv420p "$OUT_MP4"

echo "wrote $OUT_MP4"
