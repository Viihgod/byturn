export type Point = { x: number; y: number }
/** Fit the original image, excluding the stage's padding and letterbox space. */
export function fittedImage(
  width: number,
  height: number,
  naturalWidth: number,
  naturalHeight: number,
) {
  if (![width, height, naturalWidth, naturalHeight].every((v) => Number.isFinite(v) && v > 0))
    return { width: 0, height: 0 }
  const scale = Math.min(width / naturalWidth, height / naturalHeight)
  return { width: naturalWidth * scale, height: naturalHeight * scale }
}
export function pointInImage(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): Point {
  return {
    x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
  }
}
