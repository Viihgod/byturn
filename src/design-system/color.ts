export type Rgb = [number, number, number]
export function hexToRgb(hex: string): Rgb {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error('Expected a six-digit hexadecimal color')
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)) as Rgb
}
export function composite(
  foreground: Rgb,
  background: Rgb,
  alpha: number,
  mode: 'normal' | 'multiply' = 'normal',
): Rgb {
  const opacity = Math.max(0, Math.min(1, alpha))
  return background.map(
    (channel, index) =>
      channel * (1 - opacity) +
      (mode === 'multiply' ? (channel * foreground[index]) / 255 : foreground[index]) * opacity,
  ) as Rgb
}
function luminance(color: Rgb): number {
  const linear = color.map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}
export function contrastRatio(first: Rgb, second: Rgb): number {
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
