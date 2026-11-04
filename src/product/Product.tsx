import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  DownloadSimple,
  FolderSimple,
  LinkSimple,
  Moon,
  Plus,
  ShieldCheck,
  SignOut,
  Sun,
  UploadSimple,
  UsersThree,
} from '@phosphor-icons/react'
import { BtBrandLockup, BtButton, BtIconButton } from '../design-system/core'
import { BtDialog } from '../design-system/overlays'
import { LocaleProvider } from '../i18n/context'
import { useTranslation } from '../i18n/locale'
import { api, ApiError, filePath, imagePayload } from './api'
import { Settings } from './Settings'
import type { Asset, Project, User, Version } from './api'
import '../design-system/components.css'
import './product.css'

type Key = keyof (typeof import('../i18n/translation.json'))['en']
function useCopy() {
  const { t, locale } = useTranslation()
  return { p: (key: string) => t(('product.' + key) as Key) ?? key, locale }
}
function route() {
  const parts = location.hash.slice(1).split('/')
  return { page: parts[0] || 'projects', project: parts[1], asset: parts[2] }
}
const go = (hash: string) => {
  location.hash = hash
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="p-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
function readForm(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  return Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
}
function State({ state }: { state: Version['state'] }) {
  const { p } = useCopy()
  return (
    <span className="p-state" data-state={state}>
      <i />
      {p(state)}
    </span>
  )
}
function Image({ asset, version, token = '' }: { asset: string; version: string; token?: string }) {
  const [image, setImage] = useState({ version: '', url: '' })
  const { p } = useCopy()
  useEffect(() => {
    let disposed = false
    let object = ''
    api<Blob>(filePath(asset, version), { token, blob: true })
      .then((blob) => {
        if (!disposed) {
          object = URL.createObjectURL(blob)
          setImage({ version, url: object })
        }
      })
      .catch(() => {})
    return () => {
      disposed = true
      if (object) URL.revokeObjectURL(object)
    }
  }, [asset, version, token])
  return image.version === version && image.url ? (
    <img src={image.url} alt="" />
  ) : (
    <span className="p-image-loading">{p('loadingImage')}</span>
  )
}
function Dialog({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
}: {
  title: string
  description: string
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { p } = useCopy()
  return (
    <BtDialog
      title={title}
      description={description}
      closeLabel={p('close')}
      trigger={<BtButton variant="secondary">{trigger}</BtButton>}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </BtDialog>
  )
}
export default function Product() {
  return (
    <LocaleProvider>
      <Workspace />
    </LocaleProvider>
  )
}
function Workspace() {
  const { p, locale } = useCopy()
  const { setLocale } = useTranslation()
  const [current, setCurrent] = useState(route)
  const token = current.page === 'review' ? (current.project ?? '') : ''
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('byturn-theme') === 'light' ? 'light' : 'dark',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('byturn-theme', theme)
  }, [theme])
  useEffect(() => {
    document.title = 'Byturn — Review workspace'
    const change = () => {
      const next = route()
      if ((next.page === 'review' ? (next.project ?? '') : '') !== token) setLoading(true)
      setCurrent(next)
      setError('')
      setNotice('')
    }
    addEventListener('hashchange', change)
    return () => removeEventListener('hashchange', change)
  }, [token])
  const refresh = useCallback(async () => {
    const me = await api<User>('/me').catch((e) => {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    })
    setUser(me)
    if (token) {
      try {
        setProjects([await api<Project>('/review', { token })])
        setUnavailable(false)
      } catch (e) {
        setProjects([])
        if (e instanceof ApiError && [401, 404].includes(e.status)) setUnavailable(true)
        else throw e
      }
    } else if (me) {
      const all = await api<Project[]>('/projects')
      setProjects(all)
      setUsers(me.role === 'admin' ? await api<User[]>('/users') : [])
    } else {
      setProjects([])
      setUsers([])
    }
  }, [token])
  useEffect(() => {
    let active = true
    // External server state is loaded on mount and when the review credential changes.
    // oxlint-disable-next-line react/set-state-in-effect
    refresh()
      .catch((e) => {
        if (active) setError(e instanceof ApiError ? e.code : 'SERVER_ERROR')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    const timer = setInterval(() => {
      refresh().catch((e) => {
        if (active) setError(e instanceof ApiError ? e.code : 'SERVER_ERROR')
      })
    }, 10_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [refresh])
  async function act(fn: () => Promise<unknown>, message = 'saved') {
    if (pending) return false
    setPending(true)
    setError('')
    setNotice('')
    try {
      await fn()
      await refresh()
      setNotice(message)
      return true
    } catch (e) {
      setError(e instanceof ApiError ? e.code : 'SERVER_ERROR')
      return false
    } finally {
      setPending(false)
    }
  }
  const flash = (
    <div className="p-feedback" aria-live="polite">
      {error && (
        <p role="alert" className="p-error">
          {p('error.' + error)}
        </p>
      )}
      {notice && (
        <p role="status" className="p-notice">
          <Check />
          {p(notice)}
        </p>
      )}
    </div>
  )
  const preferences = (
    <div className="p-preferences">
      <select
        aria-label={p('language')}
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'pt-BR')}
      >
        <option value="en">EN</option>
        <option value="pt-BR">PT-BR</option>
      </select>
      <BtIconButton
        label={p(theme === 'dark' ? 'light' : 'dark')}
        variant="ghost"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </BtIconButton>
      {user && (
        <BtIconButton
          label={p('logout')}
          variant="ghost"
          onClick={() => {
            void act(async () => {
              await api('/logout', { method: 'POST' })
              setUser(null)
              go('projects')
            }, 'signedOut')
          }}
        >
          <SignOut />
        </BtIconButton>
      )}
    </div>
  )
  if (loading)
    return (
      <main className="p-loading">
        <BtBrandLockup size="lg" />
        <p>{p('loading')}</p>
      </main>
    )
  if (!token && !user)
    return (
      <main className="p-login">
        <div className="p-login-brand">
          <BtBrandLockup size="lg" />
          <div>
            <span className="p-eyebrow">{p('studioWorkspace')}</span>
            <h1>{p('loginHeadline')}</h1>
            <p>{p('loginIntro')}</p>
          </div>
          <span className="p-subtle">{p('selfHosted')}</span>
        </div>
        <section className="p-login-form">
          {preferences}
          <div className="p-login-fields">
            <h2>{p('signIn')}</h2>
            <p className="p-subtle">{p('loginHint')}</p>
            {flash}
            <form
              onSubmit={(e) => {
                const body = readForm(e)
                void act(async () => {
                  await api('/login', { body })
                }, 'welcome')
              }}
            >
              <Field label={p('email')}>
                <input name="email" type="email" required autoComplete="username" />
              </Field>
              <Field label={p('password')}>
                <input name="password" type="password" required autoComplete="current-password" />
              </Field>
              <BtButton type="submit" size="lg" pending={pending}>
                {p('signIn')}
                <ArrowUpRight />
              </BtButton>
            </form>
            <p className="p-subtle p-small">{p('noSignup')}</p>
          </div>
        </section>
      </main>
    )
  const project = token ? projects[0] : projects.find((item) => item.id === current.project)
  const asset = project?.assets.find((item) => item.id === current.asset)
  return (
    <div className={`p-shell ${token ? 'p-guest' : ''}`}>
      {!token && (
        <aside className="p-sidebar">
          <a href="#projects" aria-label={p('projects')}>
            <BtBrandLockup size="lg" />
          </a>
          <span className="p-eyebrow">{p('studioWorkspace')}</span>
          <nav>
            <a aria-current={current.page !== 'team' ? 'page' : undefined} href="#projects">
              <FolderSimple />
              {p('projects')}
            </a>
            {user?.role === 'admin' && (
              <a aria-current={current.page === 'team' ? 'page' : undefined} href="#team">
                <UsersThree />
                {p('team')}
              </a>
            )}
          </nav>
          <div className="p-sidebar-base">
            <Settings />
            <div className="p-person">
              <span className="p-avatar">{user?.name.slice(0, 1)}</span>
              <div>
                <strong>{user?.name}</strong>
                <small>{p(user?.role ?? 'member')}</small>
              </div>
            </div>
          </div>
        </aside>
      )}
      <div className="p-body">
        <header className="p-topbar">
          {token ? (
            <BtBrandLockup size="md" />
          ) : (
            <span className="p-subtle">
              Byturn <span aria-hidden="true">/</span>{' '}
              {p(current.page === 'team' ? 'administration' : 'workspace')}
            </span>
          )}
          {preferences}
        </header>
        {flash}
        {token && unavailable ? (
          <main className="p-empty">
            <LinkSimple size={36} />
            <h1>{p('unavailable')}</h1>
            <p>{p('unavailableHint')}</p>
          </main>
        ) : current.page === 'team' && user?.role === 'admin' ? (
          <Admin users={users} projects={projects} self={user.id} pending={pending} act={act} />
        ) : project ? (
          asset ? (
            <Review
              key={asset.id}
              project={project}
              asset={asset}
              token={token}
              user={user}
              act={act}
              pending={pending}
            />
          ) : (
            <ProjectView
              key={project.id}
              project={project}
              token={token}
              act={act}
              pending={pending}
            />
          )
        ) : (
          <Projects
            projects={projects}
            admin={user?.role === 'admin'}
            act={act}
            pending={pending}
          />
        )}
      </div>
    </div>
  )
}
type Actions = {
  pending: boolean
  act: (fn: () => Promise<unknown>, message?: string) => Promise<boolean>
}
function Projects({
  projects,
  admin,
  act,
  pending,
}: { projects: Project[]; admin: boolean } & Actions) {
  const { p } = useCopy()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const filtered = projects.filter((project) =>
    [project.name, project.client, ...project.tags]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <main className="p-content">
      <div className="p-heading">
        <div>
          <span className="p-eyebrow">{p('yourWorkspace')}</span>
          <h1>{p('projects')}</h1>
          <p>{p('projectsIntro')}</p>
        </div>
        {admin && (
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title={p('newProject')}
            description={p('projectHint')}
            trigger={
              <>
                <Plus />
                {p('newProject')}
              </>
            }
          >
            <form
              onSubmit={(e) => {
                const data = readForm(e)
                void act(async () => {
                  const created = await api<{ id: string }>('/projects', {
                    body: {
                      ...data,
                      tags: data.tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    },
                  })
                  setOpen(false)
                  go('project/' + created.id)
                })
              }}
            >
              <Field label={p('projectName')}>
                <input name="name" required maxLength={200} />
              </Field>
              <Field label={p('clientName')}>
                <input name="client" required maxLength={200} />
              </Field>
              <Field label={p('tags')}>
                <input name="tags" placeholder={p('tagsHint')} />
              </Field>
              <BtButton type="submit" pending={pending}>
                {p('createProject')}
              </BtButton>
            </form>
          </Dialog>
        )}
      </div>
      <div className="p-toolbar">
        <input
          type="search"
          aria-label={p('searchProjects')}
          placeholder={p('searchProjects')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>
          {filtered.length} {p('projects').toLowerCase()}
        </span>
      </div>
      <div className="p-projects">
        {filtered.map((project) => (
          <a className="p-project-card" href={'#project/' + project.id} key={project.id}>
            <div className="p-project-icon">
              <FolderSimple size={28} />
              <ArrowUpRight />
            </div>
            <span className="p-eyebrow">{project.client}</span>
            <h2>{project.name}</h2>
            <div className="p-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <footer>
              <span>
                {project.assets.length} {p('files')}
              </span>
              <span>
                {p(project.permission)}
                <ArrowUpRight />
              </span>
            </footer>
          </a>
        ))}
      </div>
      {!filtered.length && (
        <div className="p-empty">
          <FolderSimple size={32} />
          <h2>{p('noProjects')}</h2>
          <p>{p(admin ? 'createFirst' : 'askAccess')}</p>
        </div>
      )}
    </main>
  )
}
function Upload({ project, asset, pending, act }: { project: Project; asset?: Asset } & Actions) {
  const { p } = useCopy()
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={p(asset ? 'newVersion' : 'upload')}
      description={p('uploadHint')}
      trigger={
        <>
          <UploadSimple />
          {p(asset ? 'newVersion' : 'upload')}
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const data = new FormData(form)
          const file = data.get('file') as File
          void act(async () => {
            await api(`/projects/${project.id}/uploads`, {
              body: {
                ...(await imagePayload(file)),
                name: asset?.name ?? data.get('name'),
                ...(asset ? { assetId: asset.id } : {}),
              },
            })
            setOpen(false)
          }, 'uploaded')
        }}
      >
        {!asset && (
          <Field label={p('assetName')}>
            <input name="name" required maxLength={200} />
          </Field>
        )}
        <Field label={p('file')}>
          <input name="file" type="file" accept="image/png,image/jpeg,image/webp" required />
        </Field>
        <p className="p-subtle">{p(asset ? 'versionHint' : 'originalHint')}</p>
        <BtButton type="submit" pending={pending}>
          {p('upload')}
        </BtButton>
      </form>
    </Dialog>
  )
}
function Sharing({ project, act, pending }: { project: Project } & Actions) {
  const { p } = useCopy()
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  return (
    <Dialog
      title={p('share')}
      description={p('shareHint')}
      trigger={
        <>
          <LinkSimple />
          {p('share')}
        </>
      }
    >
      <form
        onSubmit={(e) => {
          const body = readForm(e)
          void act(async () => {
            const created = await api<{ token: string }>(`/projects/${project.id}/links`, { body })
            setUrl(location.origin + location.pathname + '#review/' + created.token)
            setCopied(false)
          })
        }}
      >
        <Field label={p('linkLabel')}>
          <input name="label" required maxLength={100} placeholder={p('linkPlaceholder')} />
        </Field>
        <BtButton type="submit" pending={pending}>
          {p('createLink')}
        </BtButton>
      </form>
      {url && (
        <div className="p-link-result">
          <Field label={p('copyNow')}>
            <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          </Field>
          <BtButton
            variant="secondary"
            onClick={() => {
              void navigator.clipboard
                .writeText(url)
                .then(() => setCopied(true))
                .catch(() => setCopied(false))
            }}
          >
            {p(copied ? 'copied' : 'copyLink')}
          </BtButton>
          <a href={url} target="_blank" rel="noreferrer">
            {p('openReview')}
            <ArrowUpRight />
          </a>
        </div>
      )}
      <h3>{p('projectLinks')}</h3>
      <div className="p-link-list">
        {project.links.map((link) => (
          <div key={link.id}>
            <div>
              <strong>{link.label}</strong>
              <small>{p(link.revoked ? 'revoked' : 'active')}</small>
            </div>
            {!link.revoked && (
              <BtButton
                variant="danger"
                pending={pending}
                onClick={() => {
                  void act(() => api('/links/' + link.id, { method: 'DELETE' }), 'linkRevoked')
                  setUrl('')
                }}
              >
                {p('revoke')}
              </BtButton>
            )}
          </div>
        ))}
      </div>
      <p className="p-subtle p-small">{p('revokeHint')}</p>
    </Dialog>
  )
}
function ProjectView({
  project,
  token,
  act,
  pending,
}: { project: Project; token: string } & Actions) {
  const { p } = useCopy()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const editable = !token && ['admin', 'editor'].includes(project.permission)
  const assets = project.assets.filter(
    (a) =>
      (filter === 'all' || a.versions[0].state === filter) &&
      a.name.toLowerCase().includes(search.toLowerCase()),
  )
  const href = (asset: Asset) =>
    token ? `#review/${token}/${asset.id}` : `#project/${project.id}/${asset.id}`
  return (
    <main className="p-content">
      {!token && (
        <a className="p-back" href="#projects">
          <ArrowLeft />
          {p('allProjects')}
        </a>
      )}
      <div className="p-heading">
        <div>
          <span className="p-eyebrow">{project.client}</span>
          <h1>{project.name}</h1>
          <p>{p(token ? 'clientIntro' : 'projectIntro')}</p>
          <div className="p-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        {editable && (
          <div className="p-actions">
            <Sharing project={project} act={act} pending={pending} />
            <Upload project={project} act={act} pending={pending} />
          </div>
        )}
      </div>
      <div className="p-toolbar">
        <input
          type="search"
          aria-label={p('searchFiles')}
          placeholder={p('searchFiles')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label={p('filterState')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {['all', 'review', 'changes', 'approved'].map((value) => (
            <option key={value} value={value}>
              {p(value)}
            </option>
          ))}
        </select>
        <span>
          {assets.length} {p('files')}
        </span>
      </div>
      <div className="p-assets">
        {assets.map((asset) => (
          <a className="p-asset-card" key={asset.id} href={href(asset)}>
            <div className="p-thumbnail">
              <Image asset={asset.id} version={asset.currentVersion} token={token} />
              <span className="p-version">V{asset.versions[0].number}</span>
            </div>
            <div className="p-asset-info">
              <h2>{asset.name}</h2>
              <State state={asset.versions[0].state} />
              <footer>
                <span>
                  {(asset.versions[0].bytes / 1000).toFixed(0)} KB ·{' '}
                  {asset.versions[0].mime.split('/')[1].toUpperCase()}
                </span>
                <ArrowUpRight />
              </footer>
            </div>
          </a>
        ))}
      </div>
      {!assets.length && (
        <div className="p-empty">
          <UploadSimple size={32} />
          <h2>{p('noFiles')}</h2>
          <p>{p(editable ? 'uploadFirst' : 'filesSoon')}</p>
        </div>
      )}
      <div className="p-project-foot">
        <ShieldCheck />
        {p(token ? 'guestScope' : 'accessHint')}
      </div>
    </main>
  )
}
function Review({
  project,
  asset,
  token,
  user,
  act,
  pending,
}: { project: Project; asset: Asset; token: string; user: User | null } & Actions) {
  const { p, locale } = useCopy()
  const [selected, setSelected] = useState(asset.currentVersion)
  const version = asset.versions.find((v) => v.id === selected) ?? asset.versions[0]
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [decision, setDecision] = useState(false)
  const edit = !token && ['admin', 'editor'].includes(project.permission)
  const review = Boolean(token) || ['admin', 'reviewer'].includes(project.permission)
  const comment = project.permission !== 'viewer'
  const latest = version.id === asset.currentVersion
  const back = token ? `#review/${token}` : `#project/${project.id}`
  const events = project.events
    .filter(
      (e) =>
        e.versionId === version.id &&
        ['comment', 'approved', 'changes', 'version.uploaded'].includes(e.type),
    )
    .toReversed()
  async function submit(state?: 'changes' | 'approved') {
    const ok = await act(
      () =>
        api(filePath(asset.id, version.id).replace('/file', state ? '/decision' : '/comments'), {
          token,
          body: { name, body, ...(state ? { state, revision: version.revision } : {}) },
        }),
      state ? 'decisionSaved' : 'commentSaved',
    )
    if (ok) {
      setBody('')
      setDecision(false)
    }
  }
  return (
    <main className="p-review">
      <div className="p-review-heading">
        <a className="p-back" href={back}>
          <ArrowLeft />
          {project.name}
        </a>
        <div className="p-actions">
          {edit && <Upload project={project} asset={asset} act={act} pending={pending} />}
          {latest && version.state === 'approved' && (
            <BtButton
              variant="secondary"
              pending={pending}
              onClick={() => {
                void act(async () => {
                  const blob = await api<Blob>(filePath(asset.id, version.id, true), {
                    token,
                    blob: true,
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = version.filename
                  a.click()
                  setTimeout(() => URL.revokeObjectURL(url), 1000)
                }, 'downloaded')
              }}
            >
              <DownloadSimple />
              {p('download')}
            </BtButton>
          )}
        </div>
      </div>
      <div className="p-review-title">
        <div>
          <span className="p-eyebrow">{project.client}</span>
          <h1>{asset.name}</h1>
        </div>
        <State state={version.state} />
        <Field label={p('version')}>
          <select
            value={version.id}
            onChange={(e) => {
              setSelected(e.target.value)
              setBody('')
              setDecision(false)
            }}
          >
            {asset.versions.map((v) => (
              <option key={v.id} value={v.id}>
                V{v.number}
                {v.id === asset.currentVersion ? ' · ' + p('latest') : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {!latest && <p className="p-history-note">{p('historical')}</p>}
      <div className="p-review-grid">
        <section className="p-preview" aria-label={p('preview')}>
          <div className="p-artboard">
            <Image asset={asset.id} version={version.id} token={token} />
          </div>
          <footer>
            {version.filename}
            <span>
              {(version.bytes / 1000).toFixed(0)} KB · V{version.number}
            </span>
          </footer>
        </section>
        <aside className="p-discussion">
          <div className="p-discussion-title">
            <h2>{p('feedback')}</h2>
            <span>{events.length}</span>
          </div>
          {comment ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submit()
              }}
            >
              {!user && (
                <Field label={p('yourName')}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </Field>
              )}
              {user && (
                <p className="p-small p-subtle">
                  {p('commentAs')} <strong>{user.name}</strong>
                </p>
              )}
              <Field label={p(decision ? 'changeDetails' : 'comment')}>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  maxLength={4000}
                  rows={3}
                  placeholder={p('feedbackPlaceholder')}
                />
              </Field>
              <div className="p-actions">
                <BtButton type="submit" variant="secondary" pending={pending}>
                  {p('sendComment')}
                </BtButton>
                {decision && (
                  <BtButton
                    pending={pending}
                    disabled={!body.trim() || (!user && !name.trim())}
                    onClick={() => {
                      void submit('changes')
                    }}
                  >
                    {p('confirmChanges')}
                  </BtButton>
                )}
              </div>
            </form>
          ) : (
            <p className="p-subtle">{p('viewOnly')}</p>
          )}
          {review && latest && (
            <div className="p-review-decision">
              <p>
                {p('decisionHint')} V{version.number}.
              </p>
              <div className="p-actions">
                <BtButton
                  pending={pending}
                  disabled={!user && !name.trim()}
                  onClick={() => {
                    void submit('approved')
                  }}
                >
                  <Check />
                  {p('approve')}
                </BtButton>
                <BtButton
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setDecision(!decision)}
                >
                  {p('requestChanges')}
                </BtButton>
              </div>
              {!user && <small>{p('declaredHint')}</small>}
            </div>
          )}
          <div className="p-timeline">
            {events.map((event) => (
              <article key={event.id}>
                <div className="p-timeline-head">
                  <span className="p-avatar">{event.actor.slice(0, 1)}</span>
                  <div>
                    <strong>{event.actor}</strong>
                    <small>
                      {p(event.identity === 'declared' ? 'declared' : 'account')} ·{' '}
                      {new Date(event.created).toLocaleString(locale, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>
                </div>
                <span className="p-event-type">{p(event.type)}</span>
                {event.body && <p>{event.body}</p>}
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
function Admin({
  users,
  projects,
  self,
  act,
  pending,
}: { users: User[]; projects: Project[]; self: string } & Actions) {
  const { p } = useCopy()
  const [open, setOpen] = useState(false)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [userId, setUserId] = useState('')
  const [permission, setPermission] = useState('viewer')
  const [reset, setReset] = useState<User | null>(null)
  const project = projects.find((p) => p.id === projectId)
  const selected = users.find((u) => u.id === userId)
  return (
    <main className="p-content">
      <div className="p-heading">
        <div>
          <span className="p-eyebrow">{p('administration')}</span>
          <h1>{p('team')}</h1>
          <p>{p('teamIntro')}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title={p('addAccount')}
          description={p('accountHint')}
          trigger={
            <>
              <Plus />
              {p('addAccount')}
            </>
          }
        >
          <form
            onSubmit={(e) => {
              const body = readForm(e)
              void act(async () => {
                await api('/users', { body })
                setOpen(false)
              })
            }}
          >
            <Field label={p('name')}>
              <input name="name" required maxLength={100} />
            </Field>
            <Field label={p('email')}>
              <input name="email" required type="email" autoComplete="off" />
            </Field>
            <Field label={p('password')}>
              <input
                name="password"
                required
                type="password"
                minLength={12}
                maxLength={200}
                autoComplete="new-password"
              />
            </Field>
            <p className="p-subtle p-small">{p('passwordHint')}</p>
            <Field label={p('accountType')}>
              <select name="role">
                {['member', 'client', 'admin'].map((role) => (
                  <option key={role} value={role}>
                    {p(role)}
                  </option>
                ))}
              </select>
            </Field>
            <BtButton type="submit" pending={pending}>
              {p('addAccount')}
            </BtButton>
          </form>
        </Dialog>
      </div>
      <div className="p-panel p-user-table">
        <table>
          <thead>
            <tr>
              <th>{p('person')}</th>
              <th>{p('accountType')}</th>
              <th>{p('projectAccess')}</th>
              <th>{p('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="p-table-person">
                    <span className="p-avatar">{user.name[0]}</span>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  {p(user.role)}
                  <small>{p(user.active ? 'active' : 'disabled')}</small>
                </td>
                <td>
                  {user.role === 'admin'
                    ? p('allProjects')
                    : projects
                        .flatMap((project) =>
                          project.grants
                            .filter((g) => g.userId === user.id)
                            .map((g) => project.name + ' / ' + p(g.permission)),
                        )
                        .join(', ') || p('noAccess')}
                </td>
                <td>
                  <div className="p-actions">
                    <BtButton size="sm" variant="ghost" onClick={() => setReset(user)}>
                      {p('resetPassword')}
                    </BtButton>
                    {user.id !== self && (
                      <BtButton
                        size="sm"
                        variant="ghost"
                        pending={pending}
                        onClick={() => {
                          void act(() =>
                            api('/users/' + user.id, {
                              method: 'PATCH',
                              body: { active: !user.active },
                            }),
                          )
                        }}
                      >
                        {p(user.active ? 'disable' : 'enable')}
                      </BtButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="p-panel p-access">
        <h2>{p('projectAccess')}</h2>
        <p className="p-subtle">{p('accessIntro')}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void act(() =>
              api(`/projects/${projectId}/grants`, { method: 'PUT', body: { userId, permission } }),
            )
          }}
        >
          <Field label={p('project')}>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
              <option value="">{p('choose')}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.client} / {project.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={p('person')}>
            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value)
                setPermission('viewer')
              }}
              required
            >
              <option value="">{p('choose')}</option>
              {users
                .filter((u) => u.role !== 'admin' && u.active)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {p(u.role)}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={p('permission')}>
            <select value={permission} onChange={(e) => setPermission(e.target.value)}>
              {['viewer', ...(selected?.role === 'client' ? [] : ['editor']), 'reviewer'].map(
                (role) => (
                  <option key={role} value={role}>
                    {p(role + 'Detail')}
                  </option>
                ),
              )}
            </select>
          </Field>
          <BtButton type="submit" pending={pending} disabled={!projectId || !userId}>
            {p('saveAccess')}
          </BtButton>
        </form>
        <div className="p-grants">
          {project?.grants.map((grant) => (
            <div key={grant.userId}>
              <span>
                <strong>{grant.name}</strong>
                <small>{p(grant.permission)}</small>
              </span>
              <BtButton
                size="sm"
                variant="ghost"
                pending={pending}
                onClick={() => {
                  void act(() =>
                    api(`/projects/${project.id}/grants`, {
                      method: 'PUT',
                      body: { userId: grant.userId, permission: 'none' },
                    }),
                  )
                }}
              >
                {p('removeAccess')}
              </BtButton>
            </div>
          ))}
        </div>
      </section>
      <BtDialog
        title={p('resetPassword')}
        description={p('resetHint')}
        trigger={<button hidden />}
        closeLabel={p('close')}
        open={Boolean(reset)}
        onOpenChange={(open) => {
          if (!open) setReset(null)
        }}
      >
        <form
          onSubmit={(e) => {
            const body = readForm(e)
            void act(async () => {
              await api('/users/' + reset?.id, { method: 'PATCH', body })
              setReset(null)
            })
          }}
        >
          <p>{reset?.email}</p>
          <Field label={p('password')}>
            <input
              name="password"
              required
              type="password"
              minLength={12}
              maxLength={200}
              autoComplete="new-password"
            />
          </Field>
          <BtButton pending={pending} type="submit">
            {p('resetPassword')}
          </BtButton>
        </form>
      </BtDialog>
    </main>
  )
}
