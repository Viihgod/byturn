import { describe, expect, it } from 'vitest'
import { fittedImage, pointInImage } from './coordinates'

describe('image-relative annotation coordinates', () => {
  it('keeps the same phrase anchored when a portrait image moves from letterboxed desktop to mobile', () => {
    const desktop = fittedImage(900, 600, 1000, 1200)
    expect(desktop).toEqual({ width: 500, height: 600 })
    // A phrase at original image pixel (720, 300), clicked with stage padding/offset already excluded.
    const anchor = pointInImage(592, 246, { left: 232, top: 96, ...desktop })
    expect(anchor).toEqual({ x: 0.72, y: 0.25 })
    const mobile = fittedImage(358, 348, 1000, 1200)
    expect(mobile).toEqual({ width: 290, height: 348 })
    expect(anchor.x * mobile.width).toBeCloseTo(208.8)
    expect(anchor.y * mobile.height).toBeCloseTo(87)
    expect(anchor.x * 1000).toBe(720)
    expect(anchor.y * 1200).toBe(300)
  })
  it('fits a landscape image without placing markers on empty vertical space', () => {
    expect(fittedImage(320, 600, 1600, 900)).toEqual({ width: 320, height: 180 })
    expect(pointInImage(330, 500, { left: 10, top: 320, width: 320, height: 180 })).toEqual({
      x: 1,
      y: 1,
    })
    expect(fittedImage(0, 600, 1600, 900)).toEqual({ width: 0, height: 0 })
  })
})
