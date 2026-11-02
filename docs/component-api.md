# Byturn component API / v1 proposal

Import components from src/design-system/components and load tokens.css and components.css once. Default visual controls: md 32 px; xs 28, sm 30, lg 38, xl 44. Multiline fields, badges, avatars and brand marks have anatomy-specific scales. Props/state rules are proposals for owner review. All visible labels must come from translation.json at the call site.

## BtBrandLockup

Approved vector signature, with symbol-to-n proportion preserved.

CSS identifier: `bt-brand-lockup`.

```ts
size?: BtSize
```

## BtBrandSymbol

The standalone symbol in small contextual applications.

CSS identifier: `bt-brand-symbol`.

```ts
size?: BtSize; decorative?: boolean
```

## BtButton

An action with independent intent, size and pending state.

CSS identifier: `bt-button`.

```ts
size?: BtSize; variant?: primary | secondary | ghost | danger; pending?: boolean; native button props
```

## BtIconButton

A compact action with a required accessible label.

CSS identifier: `bt-icon-button`.

```ts
label: string; BtButtonProps
```

## BtButtonGroup

Related actions under one accessible group name.

CSS identifier: `bt-button-group`.

```ts
label: string; children: ReactNode
```

## BtField

A grouping layout for custom compound fields; label the child explicitly.

CSS identifier: `bt-field`.

```ts
label: string; hint?: string; error?: string; children: ReactNode
```

## BtInput

A labeled native input with linked hint and error.

CSS identifier: `bt-input`.

```ts
label: string; hint?: string; error?: string; size?: BtSize; native input props
```

## BtTextarea

A multiline field that grows beyond control height.

CSS identifier: `bt-textarea`.

```ts
label: string; hint?: string; error?: string; size?: BtSize; native textarea props
```

## BtSelector

A native select with stable labels and keyboard behavior.

CSS identifier: `bt-selector`.

```ts
label: string; size?: BtSize; hint?: string; error?: string; native select props
```

## BtCheckbox

An independent option with a clickable label and hint.

CSS identifier: `bt-checkbox`.

```ts
label: string; hint?: string; size?: BtSize; native checkbox props
```

## BtRadioGroup

One choice within a named set of native radio inputs.

CSS identifier: `bt-radio-group`.

```ts
label: string; value: string; onChange(value); options: {value,label,disabled?}[]; size?: BtSize
```

## BtSwitch

An immediate on/off setting with a named switch.

CSS identifier: `bt-switch`.

```ts
label: string; checked: boolean; onCheckedChange(value); disabled?: boolean; size?: BtSize
```

## BtFileUpload

Image selection and local 5 MB validation; server checks remain required.

CSS identifier: `bt-file-upload`.

```ts
label; hint; typeError; sizeError; onFile(file); maxBytes?: number; disabled?: boolean
```

## BtSegmented

An exclusive inline choice using native radio semantics.

CSS identifier: `bt-segmented`.

```ts
label; value; onChange(value); options; size?: BtSize; disabled?: boolean
```

## BtTabs

Related panels with arrow-key navigation and associated labels.

CSS identifier: `bt-tabs`.

```ts
label; value; onValueChange(value); tabs: {value,label,content,disabled?}[]
```

## BtBreadcrumb

The location hierarchy, with the final item marked current.

CSS identifier: `bt-breadcrumb`.

```ts
label: string; items: {label,href?}[]
```

## BtPagination

Bounded previous/next navigation with page feedback.

CSS identifier: `bt-pagination`.

```ts
label; page; pageCount; onPageChange(page); previousLabel; nextLabel
```

## BtTable

Native headers and caption inside a contained scrolling region.

CSS identifier: `bt-table`.

```ts
caption; columns: {key,label}[]; rows: {id,cells}[]; emptyMessage
```

## BtCard

A neutral surface or an explicitly selected review surface.

CSS identifier: `bt-card`.

```ts
selected?: boolean; padding?: BtSize; native section props
```

## BtCollapse

Native disclosure, closed by default.

CSS identifier: `bt-collapse`.

```ts
title: string; children: ReactNode; defaultOpen?: boolean
```

## BtDialog

A modal with title, description, focus trap, Escape and focus return.

CSS identifier: `bt-dialog`.

```ts
trigger; title; description; closeLabel; children; open?; onOpenChange?
```

## BtDrawer

A side panel with the same modal focus contract as a dialog.

CSS identifier: `bt-drawer`.

```ts
BtDialog props; side placement
```

## BtPopover

Contextual content anchored to a trigger, dismissible with Escape.

CSS identifier: `bt-popover`.

```ts
trigger; label; children; closeLabel
```

## BtMenu

Keyboard-operated action menu with disabled and destructive items.

CSS identifier: `bt-menu`.

```ts
trigger; label; items: {id,label,onSelect,disabled?,danger?}[]
```

## BtTooltip

Brief supplementary text; never the only action label.

CSS identifier: `bt-tooltip`.

```ts
children: ReactElement; content: string
```

## BtToast

A dismissible notification for noncritical transient feedback.

CSS identifier: `bt-toast`.

```ts
open; onOpenChange; title; description; closeLabel
```

## BtBadge

A contextual label with Orbit transparency separate from its text.

CSS identifier: `bt-badge`.

```ts
tone?: BtTone; size?: BtSize; children
```

## BtStatus

A named status with an additional visual marker.

CSS identifier: `bt-status`.

```ts
tone?: BtTone; children
```

## BtAlert

Persistent contextual feedback; dangerous errors use alert semantics.

CSS identifier: `bt-alert`.

```ts
tone?: BtTone; title: string; children?
```

## BtSpinner

A loading indicator with an accessible status label.

CSS identifier: `bt-spinner`.

```ts
label: string; size?: BtSize
```

## BtSkeleton

A reserved loading shape with an announced purpose.

CSS identifier: `bt-skeleton`.

```ts
label: string; lines?: number
```

## BtProgress

Determinate or indeterminate native progress.

CSS identifier: `bt-progress`.

```ts
label: string; value?: number
```

## BtEmptyState

A useful explanation and optional next action for empty data.

CSS identifier: `bt-empty-state`.

```ts
title: string; children?; action?: ReactNode
```

## BtAvatar

A named person with initials and optional image.

CSS identifier: `bt-avatar`.

```ts
name: string; src?: string; size?: BtSize
```

## BtAvatarGroup

An accessible group of related participants.

CSS identifier: `bt-avatar-group`.

```ts
label: string; children: ReactNode
```

## BtVersionSelector

Version choice without confusing current and historical files.

CSS identifier: `bt-version-selector`.

```ts
label; value; versions: {id,label}[]; onChange(value); size?; disabled?
```

## BtCommentThread

A comment preserves author, time, version and resolution label.

CSS identifier: `bt-comment-thread`.

```ts
author; time; version; stateLabel; resolved?; children
```

## BtApprovalPanel

Explicit version decision actions with pending and read-only states.

CSS identifier: `bt-approval-panel`.

```ts
title; description; approveLabel; changesLabel; onApprove; onRequestChanges; pending?; readOnly?
```

## BtAssetCard

File context, preview, version and a contextual next action.

CSS identifier: `bt-asset-card`.

```ts
title; client; version; status; tone?; preview; action
```

## BtImageViewer

Fit/zoom controls with a scrollable image region.

CSS identifier: `bt-image-viewer`.

```ts
src; alt; zoom; onZoomChange; fitLabel; zoomInLabel; zoomOutLabel
```

## BtSearchInput

Clearable search with a named action and focus return.

CSS identifier: `bt-search-input`.

```ts
label; clearLabel; value; onValueChange; placeholder?; disabled?; size?
```

## BtDateField

A native calendar-date field without implicit UTC conversion.

CSS identifier: `bt-date-field`.

```ts
label; value: YYYY-MM-DD; onValueChange; min?; max?; hint?; error?; disabled?; required?; size?
```

## BtCombobox

A searchable single choice with listbox and active-descendant keyboard behavior.

CSS identifier: `bt-combobox`.

```ts
label; value; options: BtChoice[]; onValueChange; placeholder; emptyMessage; disabled?; size?
```

## BtMultiSelector

Native multiple selection with a stable label and disabled choices.

CSS identifier: `bt-multi-selector`.

```ts
label; value: string[]; options: BtChoice[]; onValueChange; hint?; disabled?; rows?; size?
```

## BtChecklist

A controlled checklist with a progress count and independent disabled entries.

CSS identifier: `bt-checklist`.

```ts
label; items: {id,label,checked,disabled?}[]; onCheckedChange(id,checked); disabled?; size?
```

## BtFilterChip

A toggleable filter and separately named remove action.

CSS identifier: `bt-filter-chip`.

```ts
label; selected; onSelectedChange; removeLabel?; onRemove?; disabled?; size?
```

## BtConfirmDialog

A deliberate confirmation that keeps failures open and blocks duplicate submissions.

CSS identifier: `bt-confirm-dialog`.

```ts
trigger; title; description; confirmLabel; cancelLabel; errorMessage; onConfirm(): void | boolean | Promise<void | boolean>
```

## State and accessibility contract

Buttons use native button semantics and type=button by default. Pending blocks duplicate activation. Inputs link help/errors to their control and retain native validation/readonly/disabled semantics. Native selects/radios preserve browser keyboard behavior. Radix supplies keyboard and focus behavior for dialogs, drawers, menus, tabs, switches, popovers, tooltips and toast. Dialog title, description and close label are required. Menu disabled items are not actions. Do not hide an essential instruction only in a tooltip.

Badges keep text separate from Orbit tint/multiply; statuses also provide words and a visual dot. A color alone never names a decision. Native progress supports indeterminate state. Skeletons/spinners announce a purpose; reduced motion disables decorative rotation. Tables use native caption/headers and contained horizontal scrolling. Form-field grouping is not an automatic accessible label for arbitrary custom children; label them explicitly.

Review patterns are controlled presentational compositions. They do not persist approvals, enforce workspace permissions, convert files or provide real upload security. The file selector provides local MIME/size feedback; servers still validate actual bytes and identity. The image viewer fits/zooms an illustrative image; it is not a comparison/diff engine.
