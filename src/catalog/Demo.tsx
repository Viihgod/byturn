import { ExtendedDemo } from './ExtendedDemo'
import { useState } from 'react'
import { DotsThree, PencilSimple, ClockCounterClockwise } from '@phosphor-icons/react'
import * as Bt from '../design-system/components'
import type { BtSize } from '../design-system/scales'
import { useTranslation } from '../i18n/locale'
import specimen from './specimen.svg'

export function Demo({ name, size }: { name: string; size: BtSize }) {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [choice, setChoice] = useState('one')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(false)
  const [file, setFile] = useState('')
  const [zoom, setZoom] = useState(1)
  const [version, setVersion] = useState('2')
  const action = () => setChecked((value) => !value)
  const sampleButton = (
    <Bt.BtButton size={size} onClick={action}>
      {checked ? t('sample.saved') : t('sample.save')}
    </Bt.BtButton>
  )
  const dialogProps = {
    title: t('sample.dialogTitle'),
    description: t('sample.dialogBody'),
    closeLabel: t('sample.close'),
    children: (
      <Bt.BtInput label={t('sample.email')} defaultValue="review@example.com" size={size} />
    ),
  }
  const versions = [
    { id: '2', label: t('sample.current') },
    { id: '1', label: t('sample.history') },
  ]
  const groupOptions = [
    { value: 'one', label: t('sample.account') },
    { value: 'two', label: t('sample.privateLink'), disabled: true },
  ]
  switch (name) {
    case 'BtBrandLockup':
      return <Bt.BtBrandLockup size="sm" />
    case 'BtBrandSymbol':
      return <Bt.BtBrandSymbol size={size} />
    case 'BtButton':
      return (
        <div className="bt-stack">
          <div className="bt-inline">
            {sampleButton}
            <Bt.BtButton variant="secondary" size={size}>
              {t('sample.cancel')}
            </Bt.BtButton>
            <Bt.BtButton variant="ghost" size={size}>
              {t('sample.edit')}
            </Bt.BtButton>
          </div>
          <div className="bt-inline">
            <Bt.BtButton pending size={size}>
              {t('sample.save')}
            </Bt.BtButton>
            <Bt.BtButton disabled size={size}>
              {t('sample.readOnly')}
            </Bt.BtButton>
            <Bt.BtButton variant="danger" size={size}>
              {t('sample.delete')}
            </Bt.BtButton>
          </div>
        </div>
      )
    case 'BtIconButton':
      return (
        <Bt.BtIconButton
          label={t('sample.edit')}
          variant="secondary"
          size={size}
          onClick={action}
          aria-pressed={checked}
        >
          <PencilSimple />
        </Bt.BtIconButton>
      )
    case 'BtButtonGroup':
      return (
        <Bt.BtButtonGroup label={t('sample.more')}>
          {sampleButton}
          <Bt.BtButton variant="secondary" size={size}>
            {t('sample.cancel')}
          </Bt.BtButton>
        </Bt.BtButtonGroup>
      )
    case 'BtField':
      return (
        <Bt.BtField label={t('sample.client')} hint={t('sample.notifyHint')}>
          <Bt.BtCheckbox
            label={t('sample.notifications')}
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            size={size}
          />
        </Bt.BtField>
      )
    case 'BtInput':
      return (
        <div className="bt-stack">
          <Bt.BtInput
            label={t('sample.email')}
            type="email"
            hint={t('sample.emailHint')}
            placeholder="name@example.com"
            size={size}
          />
          <Bt.BtInput
            label={t('sample.email')}
            type="email"
            error={t('sample.emailError')}
            defaultValue="invalid"
            size={size}
          />
          <Bt.BtInput
            label={t('sample.readOnly')}
            readOnly
            value="review@example.com"
            size={size}
          />
        </div>
      )
    case 'BtTextarea':
      return (
        <Bt.BtTextarea
          label={t('sample.comment')}
          hint={t('sample.commentHint')}
          defaultValue={t('sample.commentText')}
          size={size}
        />
      )
    case 'BtSelector':
      return (
        <Bt.BtSelector
          label={t('sample.client')}
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          size={size}
        >
          <option value="one">Northline</option>
          <option value="two">Fieldwork</option>
        </Bt.BtSelector>
      )
    case 'BtCheckbox':
      return (
        <div className="bt-stack">
          <Bt.BtCheckbox
            label={t('sample.notifications')}
            hint={t('sample.notifyHint')}
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            size={size}
          />
          <Bt.BtCheckbox label={t('sample.readOnly')} checked disabled size={size} />
        </div>
      )
    case 'BtRadioGroup':
      return (
        <Bt.BtRadioGroup
          label={t('sample.access')}
          value={choice}
          onChange={setChoice}
          options={groupOptions}
          size={size}
        />
      )
    case 'BtSwitch':
      return (
        <Bt.BtSwitch
          label={t('sample.notifications')}
          checked={checked}
          onCheckedChange={setChecked}
          size={size}
        />
      )
    case 'BtFileUpload':
      return (
        <div className="bt-stack">
          <Bt.BtFileUpload
            size={size}
            label={t('sample.upload')}
            hint={t('sample.uploadHint')}
            typeError={t('sample.typeError')}
            sizeError={t('sample.sizeError')}
            onFile={(selected) => setFile(selected.name)}
          />
          {file && (
            <span role="status">
              {t('sample.fileSelected')}: {file}
            </span>
          )}
        </div>
      )
    case 'BtSegmented':
      return (
        <Bt.BtSegmented
          label={t('sample.access')}
          value={choice}
          onChange={setChoice}
          options={[
            { value: 'one', label: t('sample.studio') },
            { value: 'two', label: t('sample.client') },
          ]}
          size={size}
        />
      )
    case 'BtTabs':
      return (
        <Bt.BtTabs
          label={t('sample.campaign')}
          value={choice}
          onValueChange={setChoice}
          tabs={[
            { value: 'one', label: t('sample.overview'), content: t('sample.overviewBody') },
            { value: 'two', label: t('sample.activity'), content: t('sample.activityBody') },
          ]}
        />
      )
    case 'BtBreadcrumb':
      return (
        <Bt.BtBreadcrumb
          label={t('sample.breadcrumb')}
          items={[
            { label: t('sample.workspace'), href: '#components' },
            { label: 'Northline', href: '#components' },
            { label: t('sample.asset') },
          ]}
        />
      )
    case 'BtPagination':
      return (
        <Bt.BtPagination
          label={t('sample.pagination')}
          page={page}
          pageCount={3}
          onPageChange={setPage}
          previousLabel={t('sample.previous')}
          nextLabel={t('sample.next')}
        />
      )
    case 'BtTable':
      return (
        <Bt.BtTable
          caption={t('sample.campaign')}
          columns={[
            { key: 'file', label: t('sample.file') },
            { key: 'status', label: t('sample.status') },
          ]}
          rows={[
            {
              id: 'one',
              cells: {
                file: t('sample.asset'),
                status: <Bt.BtStatus tone="warning">{t('sample.pending')}</Bt.BtStatus>,
              },
            },
            {
              id: 'two',
              cells: {
                file: 'Email',
                status: <Bt.BtStatus tone="success">{t('sample.approved')}</Bt.BtStatus>,
              },
            },
          ]}
          emptyMessage={t('sample.emptyTitle')}
        />
      )
    case 'BtCard':
      return (
        <Bt.BtCard selected>
          <strong>01 / {t('tab.review')}</strong>
          <p>{t('sample.overviewBody')}</p>
        </Bt.BtCard>
      )
    case 'BtCollapse':
      return (
        <Bt.BtCollapse title={t('catalog.rules')}>
          <p>{t('sample.popoverBody')}</p>
        </Bt.BtCollapse>
      )
    case 'BtDialog':
      return (
        <Bt.BtDialog
          {...dialogProps}
          trigger={
            <Bt.BtButton variant="secondary" size={size}>
              {t('sample.openDialog')}
            </Bt.BtButton>
          }
        />
      )
    case 'BtDrawer':
      return (
        <Bt.BtDrawer
          {...dialogProps}
          trigger={
            <Bt.BtButton variant="secondary" size={size}>
              {t('sample.openDrawer')}
            </Bt.BtButton>
          }
        />
      )
    case 'BtPopover':
      return (
        <Bt.BtPopover
          trigger={
            <Bt.BtButton variant="secondary" size={size}>
              {t('sample.openPopover')}
            </Bt.BtButton>
          }
          label={t('sample.openPopover')}
          closeLabel={t('sample.close')}
        >
          <p>{t('sample.popoverBody')}</p>
        </Bt.BtPopover>
      )
    case 'BtMenu':
      return (
        <div className="bt-inline">
          <Bt.BtMenu
            trigger={
              <Bt.BtIconButton label={t('sample.more')} variant="secondary" size={size}>
                <DotsThree />
              </Bt.BtIconButton>
            }
            label={t('sample.more')}
            items={[
              { id: 'edit', label: t('sample.edit'), onSelect: action },
              { id: 'locked', label: t('sample.readOnly'), disabled: true, onSelect: action },
              { id: 'delete', label: t('sample.delete'), danger: true, onSelect: action },
            ]}
          />
          {checked && <span role="status">{t('catalog.previewAction')}</span>}
        </div>
      )
    case 'BtTooltip':
      return (
        <Bt.BtTooltip content={t('sample.tooltip')}>
          <Bt.BtIconButton label={t('sample.tooltip')} variant="secondary" size={size}>
            <ClockCounterClockwise />
          </Bt.BtIconButton>
        </Bt.BtTooltip>
      )
    case 'BtToast':
      return (
        <>
          <Bt.BtButton variant="secondary" size={size} onClick={() => setToast(true)}>
            {t('sample.showToast')}
          </Bt.BtButton>
          <Bt.BtToast
            open={toast}
            onOpenChange={setToast}
            title={t('sample.saved')}
            description={t('sample.savedBody')}
            closeLabel={t('sample.close')}
          />
        </>
      )
    case 'BtBadge':
      return (
        <div className="bt-inline">
          <Bt.BtBadge tone="info">V2</Bt.BtBadge>
          <Bt.BtBadge tone="client">{t('sample.client')}</Bt.BtBadge>
          <Bt.BtBadge tone="studio">{t('sample.studio')}</Bt.BtBadge>
          <Bt.BtBadge tone="neutral">{t('sample.readOnly')}</Bt.BtBadge>
        </div>
      )
    case 'BtStatus':
      return (
        <div className="bt-stack">
          <Bt.BtStatus tone="warning">{t('sample.pending')}</Bt.BtStatus>
          <Bt.BtStatus tone="success">{t('sample.approved')}</Bt.BtStatus>
          <Bt.BtStatus tone="danger">{t('sample.changes')}</Bt.BtStatus>
        </div>
      )
    case 'BtAlert':
      return (
        <Bt.BtAlert title={t('sample.alertTitle')} tone="warning">
          {t('sample.alertBody')}
        </Bt.BtAlert>
      )
    case 'BtSpinner':
      return <Bt.BtSpinner label={t('sample.loading')} size={size} />
    case 'BtSkeleton':
      return <Bt.BtSkeleton label={t('sample.loading')} />
    case 'BtProgress':
      return <Bt.BtProgress label={t('sample.progress')} value={64} />
    case 'BtEmptyState':
      return (
        <Bt.BtEmptyState
          title={t('sample.emptyTitle')}
          action={<Bt.BtButton size={size}>{t('sample.upload')}</Bt.BtButton>}
        >
          {t('sample.emptyBody')}
        </Bt.BtEmptyState>
      )
    case 'BtAvatar':
      return <Bt.BtAvatar name="Alex Morgan" size={size} />
    case 'BtAvatarGroup':
      return (
        <Bt.BtAvatarGroup label={t('sample.team')}>
          <Bt.BtAvatar name="Alex Morgan" size={size} />
          <Bt.BtAvatar name="Jordan Lee" size={size} />
          <Bt.BtAvatar name="Sam Park" size={size} />
        </Bt.BtAvatarGroup>
      )
    case 'BtVersionSelector':
      return (
        <Bt.BtVersionSelector
          label={t('sample.version')}
          value={version}
          onChange={setVersion}
          versions={versions}
          size={size}
        />
      )
    case 'BtCommentThread':
      return (
        <Bt.BtCommentThread
          author="Alex Morgan"
          time="10:42"
          version="V2"
          stateLabel={t('sample.open')}
        >
          {t('sample.commentText')}
        </Bt.BtCommentThread>
      )
    case 'BtApprovalPanel':
      return (
        <Bt.BtApprovalPanel
          title={checked ? t('sample.approved') : t('sample.approvalTitle')}
          description={t('sample.approvalBody')}
          approveLabel={t('sample.approve')}
          changesLabel={t('sample.request')}
          onApprove={() => setChecked(true)}
          onRequestChanges={() => setChecked(false)}
        />
      )
    case 'BtAssetCard':
      return (
        <Bt.BtAssetCard
          title={t('sample.asset')}
          client="Northline"
          version="V2"
          status={t('sample.pending')}
          tone="warning"
          preview={<img src={specimen} alt={t('sample.imageAlt')} />}
          action={
            <Bt.BtButton size={size} onClick={action}>
              {checked ? t('catalog.previewAction') : t('sample.openReview')}
            </Bt.BtButton>
          }
        />
      )
    case 'BtImageViewer':
      return (
        <Bt.BtImageViewer
          src={specimen}
          alt={t('sample.imageAlt')}
          zoom={zoom}
          onZoomChange={setZoom}
          fitLabel={t('sample.fit')}
          zoomInLabel={t('sample.zoomIn')}
          zoomOutLabel={t('sample.zoomOut')}
        />
      )
    default:
      return <ExtendedDemo name={name} size={size} />
  }
}
