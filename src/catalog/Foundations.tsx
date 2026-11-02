import { BtBadge, BtCollapse, BtTable } from '../design-system/components'
import { useTranslation } from '../i18n/locale'
import tokens from '../design-system/foundation.tokens.json'
import { composite, contrastRatio, hexToRgb } from '../design-system/color'
import type { TranslationKey } from '../i18n/locale'

export function Foundations({ theme }: { theme: 'dark' | 'light' }) {
  const { t } = useTranslation()
  const values = tokens.semantic[theme]
  const pairs: { label: TranslationKey; foreground: string; background: string; target: number }[] =
    [
      { label: 'guide.bodyPair', foreground: values.text, background: values.canvas, target: 4.5 },
      {
        label: 'guide.mutedPair',
        foreground: values['text-muted'],
        background: values.surface,
        target: 4.5,
      },
      {
        label: 'guide.actionPair',
        foreground: values['action-text'],
        background: values['action-fill'],
        target: 4.5,
      },
      {
        label: 'guide.borderPair',
        foreground: values.border,
        background: values.surface,
        target: 3,
      },
    ]
  const contrastRows: { id: string; cells: { pair: string; ratio: string; target: string } }[] =
    pairs.map((pair) => ({
      id: pair.label,
      cells: {
        pair: t(pair.label),
        ratio: `${contrastRatio(hexToRgb(pair.foreground), hexToRgb(pair.background)).toFixed(2)}:1`,
        target: `${pair.target}:1`,
      },
    }))
  for (const [name, color, foreground] of [
    ['Blue', '#369cff', values['info-text']],
    ['Violet', '#ad64ff', values['client-text']],
    ['Pink', '#ff6db7', values['studio-text']],
  ]) {
    const fill = composite(
      hexToRgb(color),
      hexToRgb(values.surface),
      values['support-alpha'],
      theme === 'light' ? 'multiply' : 'normal',
    )
    contrastRows.push({
      id: name,
      cells: {
        pair: `${name} / Orbit 02`,
        ratio: `${contrastRatio(hexToRgb(foreground), fill).toFixed(2)}:1`,
        target: '4.5:1',
      },
    })
  }
  return (
    <div className="guide-page">
      <div className="guide-page-heading">
        <p className="guide-kicker">{t('guide.proposed')}</p>
        <h1>{t('guide.foundationsTitle')}</h1>
        <p className="guide-lead">{t('guide.foundationsIntro')}</p>
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.palette')}</h2>
        <p>{t('guide.paletteBody')}</p>
      </div>
      <div className="palette-grid">
        {Object.entries(tokens.primitive.color)
          .slice(0, 4)
          .map(([name, value]) => (
            <div className="palette-swatch" key={name}>
              <div style={{ background: value }} />
              <code>{value.toUpperCase()}</code>
            </div>
          ))}
      </div>
      <div className="orbit-specimen" aria-label={t('guide.orbit')}>
        <div className="orbit-plane" data-orbit="blue" />
        <div className="orbit-plane" data-orbit="violet" />
        <div className="orbit-plane" data-orbit="pink" />
        <span>Orbit 02</span>
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.scale')}</h2>
        <p>{t('guide.scaleBody')}</p>
      </div>
      <BtTable
        caption={t('guide.scale')}
        columns={[
          { key: 'size', label: t('guide.scaleName') },
          { key: 'control', label: t('guide.controlHeight') },
          { key: 'space', label: t('guide.spacing') },
          { key: 'radius', label: t('guide.radius') },
        ]}
        rows={Object.entries(tokens.primitive.controlHeight).map(([size, height]) => ({
          id: size,
          cells: {
            size,
            control: `${height}px`,
            space: `${tokens.primitive.space[size as keyof typeof tokens.primitive.space]}px`,
            radius: `${tokens.primitive.radius[size as keyof typeof tokens.primitive.radius]}px`,
          },
        }))}
        emptyMessage=""
      />
      <BtCollapse title={t('guide.touch')}>
        <p>{t('guide.touchBody')}</p>
      </BtCollapse>
      <div className="guide-section-heading">
        <h2>{t('guide.typeRamp')}</h2>
        <p>{t('guide.typeRampBody')}</p>
      </div>
      <div className="type-ramp">
        {Object.entries(tokens.primitive.type).map(([size, value]) => (
          <div key={size}>
            <code>
              {size} / {value}px
            </code>
            <span style={{ fontSize: value }}>{t('guide.controlSample')}</span>
          </div>
        ))}
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.surfaces')}</h2>
        <p>{t('guide.surfacesBody')}</p>
      </div>
      <div className="shape-ramp">
        {Object.entries(tokens.primitive.radius).map(([size, value]) => (
          <div key={size}>
            <span style={{ borderRadius: value }} />
            <code>
              {size} / {value}px
            </code>
          </div>
        ))}
      </div>
      <div className="elevation-demo">
        <span>{t('guide.panelSample')}</span>
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.semanticStates')}</h2>
        <p>{t('guide.semanticStatesBody')}</p>
      </div>
      <div className="bt-inline">
        <BtBadge tone="success">{t('sample.approved')}</BtBadge>
        <BtBadge tone="warning">{t('sample.pending')}</BtBadge>
        <BtBadge tone="danger">{t('sample.changes')}</BtBadge>
      </div>
      <div className="guide-section-heading">
        <h2>{t('guide.contrast')}</h2>
        <p>{t('guide.contrastBody')}</p>
      </div>
      <BtTable
        caption={t('guide.contrast')}
        columns={[
          { key: 'pair', label: t('guide.pair') },
          { key: 'ratio', label: t('guide.ratio') },
          { key: 'target', label: t('guide.target') },
        ]}
        rows={contrastRows}
        emptyMessage=""
      />
      <BtCollapse title={t('guide.motion')}>
        <p>{t('guide.motionBody')}</p>
      </BtCollapse>
    </div>
  )
}
