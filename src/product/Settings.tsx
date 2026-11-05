import { useId, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { ArrowUpRight, GearSix, ShieldCheck, X } from '@phosphor-icons/react'
import { BtIconButton } from '../design-system/core'
import { useTranslation } from '../i18n/locale'
import type { TranslationKey } from '../i18n/locale'

const narrowQuery = '(max-width: 800px)'
const subscribeViewport = (update: () => void) => {
  const query = matchMedia(narrowQuery)
  query.addEventListener('change', update)
  return () => query.removeEventListener('change', update)
}
export function Settings({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()
  const p = (key: string) => t(('product.' + key) as TranslationKey)
  const id = useId()
  const narrow = useSyncExternalStore(subscribeViewport, () => matchMedia(narrowQuery).matches)
  return (
    <Popover.Root modal>
      <Popover.Trigger asChild>
        <button className="p-settings-trigger">
          <GearSix />
          {p('settings')}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <div className="p-settings-layer">
          <div className="p-settings-overlay" aria-hidden="true" />
          <Popover.Content
            className="bt-dialog p-settings-modal"
            side={narrow ? 'bottom' : 'right'}
            align={narrow ? 'start' : 'end'}
            sideOffset={12}
            collisionPadding={16}
            aria-labelledby={id}
            aria-modal="true"
            aria-describedby={id + '-description'}
          >
            <div className="bt-dialog-heading">
              <h2 id={id}>{p('settings')}</h2>
              <Popover.Close asChild>
                <BtIconButton label={p('close')} variant="ghost">
                  <X />
                </BtIconButton>
              </Popover.Close>
            </div>
            <p className="bt-dialog-description" id={id + '-description'}>
              {p('settingsIntro')}
            </p>
            {children && (
              <section className="p-settings-preferences">
                <h3>{p('preferences')}</h3>
                {children}
              </section>
            )}
            <section className="p-settings-resources">
              <h3>{p('resources')}</h3>
              <div className="p-settings-resource">
                <ShieldCheck size={24} aria-hidden="true" />
                <div>
                  <h4>{p('designSystem')}</h4>
                  <p>{p('designSystemHint')}</p>
                </div>
              </div>
              <a className="p-settings-link" href="?guide=1" target="_blank" rel="noreferrer">
                {p('openDesignSystem')}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </section>
          </Popover.Content>
        </div>
      </Popover.Portal>
    </Popover.Root>
  )
}
