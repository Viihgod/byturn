import type { ReactElement, ReactNode } from 'react'
import { Dialog, DropdownMenu, Popover, Toast, Tooltip } from 'radix-ui'
import { BtButton, BtCloseIcon, BtIconButton } from './core'

type DialogProps = {
  trigger: ReactElement
  title: string
  description: string
  closeLabel: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
export function BtDialog({
  trigger,
  title,
  description,
  closeLabel,
  children,
  open,
  onOpenChange,
  placement = 'center',
}: DialogProps & { placement?: 'center' | 'side' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bt-overlay" />
        <Dialog.Content
          className={placement === 'side' ? 'bt-dialog bt-drawer' : 'bt-dialog'}
          data-placement={placement}
        >
          <div className="bt-dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <BtIconButton label={closeLabel} variant="ghost">
                <BtCloseIcon />
              </BtIconButton>
            </Dialog.Close>
          </div>
          <Dialog.Description className="bt-dialog-description">{description}</Dialog.Description>
          <div>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
export function BtDrawer(props: DialogProps) {
  return <BtDialog {...props} placement="side" />
}
export function BtPopover({
  trigger,
  label,
  children,
  closeLabel,
}: {
  trigger: ReactElement
  label: string
  children: ReactNode
  closeLabel: string
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bt-popover" sideOffset={8} aria-label={label}>
          <div>{children}</div>
          <Popover.Close asChild>
            <BtButton variant="secondary">{closeLabel}</BtButton>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
export function BtMenu({
  trigger,
  label,
  items,
}: {
  trigger: ReactElement
  label: string
  items: { id: string; label: string; disabled?: boolean; danger?: boolean; onSelect: () => void }[]
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bt-menu"
          aria-label={label}
          aria-labelledby={undefined}
          sideOffset={8}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              className="bt-menu-item"
              data-danger={item.danger}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
export function BtTooltip({ children, content }: { children: ReactElement; content: string }) {
  return (
    <Tooltip.Provider delayDuration={350}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bt-tooltip" sideOffset={8}>
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
export function BtToast({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  closeLabel: string
}) {
  return (
    <Toast.Provider label={title} duration={6000} swipeDirection="right">
      <Toast.Root className="bt-toast" open={open} onOpenChange={onOpenChange}>
        <Toast.Title>{title}</Toast.Title>
        <Toast.Description>{description}</Toast.Description>
        <Toast.Close asChild>
          <BtIconButton label={closeLabel} variant="ghost">
            <BtCloseIcon />
          </BtIconButton>
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className="bt-toast-viewport" />
    </Toast.Provider>
  )
}
