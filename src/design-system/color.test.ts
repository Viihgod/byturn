import { expect, it } from 'vitest'
import { composite, contrastRatio, hexToRgb } from './color'
import tokens from './foundation.tokens.json'

it('computes known contrast ratios and rejects invalid colors', () => {
  expect(contrastRatio(hexToRgb('#000000'), hexToRgb('#ffffff'))).toBeCloseTo(21)
  expect(contrastRatio(hexToRgb('#ffffff'), hexToRgb('#000000'))).toBeCloseTo(21)
  expect(contrastRatio(hexToRgb('#ffffff'), hexToRgb('#ffffff'))).toBe(1)
  expect(() => hexToRgb('red')).toThrow('six-digit')
  expect(composite([0, 0, 0], [255, 255, 255], 2)).toEqual([0, 0, 0])
  expect(composite([0, 0, 0], [255, 255, 255], -1)).toEqual([255, 255, 255])
})
it('meets the declared text and control-boundary contrast targets in both themes', () => {
  for (const [theme, values] of Object.entries(tokens.semantic)) {
    for (const [foreground, background] of [
      [values.text, values.canvas],
      [values['text-muted'], values.surface],
      [values['action-text'], values['action-fill']],
      [values.danger, values['danger-fill']],
      [values.success, values['success-fill']],
      [values.warning, values['warning-fill']],
    ]) {
      expect(
        contrastRatio(hexToRgb(foreground), hexToRgb(background)),
        `${theme}: ${foreground} / ${background}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrastRatio(hexToRgb(values.border), hexToRgb(values.surface))).toBeGreaterThanOrEqual(
      3,
    )
    for (const [color, foreground] of [
      ['#369cff', values['info-text']],
      ['#ad64ff', values['client-text']],
      ['#ff6db7', values['studio-text']],
    ]) {
      const background = composite(
        hexToRgb(color),
        hexToRgb(values.surface),
        values['support-alpha'],
        theme === 'light' ? 'multiply' : 'normal',
      )
      expect(
        contrastRatio(hexToRgb(foreground), background),
        `${theme}: ${color}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  }
})
