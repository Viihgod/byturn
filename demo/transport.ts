import type { Project, ReviewEvent, Version } from '../src/product/api'
import posterV1 from './poster-v1.png'
import posterV2 from './poster-v2.png'

const assetId = 'weekend-poster'
const firstDate = '2026-11-09T15:00:00Z'
const secondDate = '2026-11-10T15:00:00Z'

function makeVersion(number: 1 | 2): Version {
  const id = 'v' + number
  const filename = 'northline-weekend-' + id + '.png'
  return {
    id, number, filename, mime: 'image/png', bytes: 0,
    state: number === 1 ? 'changes' : 'review',
    revision: number === 1 ? 1 : 0,
    created: number === 1 ? firstDate : secondDate,
    images: [{ id: id + '-poster', position: 0, filename, mime: 'image/png', bytes: 0 }],
  }
}

function seedEvent(event: Partial<ReviewEvent> & Pick<ReviewEvent, 'id' | 'versionId' | 'type' | 'body' | 'reference'>): ReviewEvent {
  return {
    assetId, actor: 'Jamie Lee', identity: 'account', created: firstDate,
    anchorX: null, anchorY: null, parentId: null, party: 'team', imageId: null,
    ...event,
  }
}

export function installDemoTransport() {
  const v1 = makeVersion(1)
  const v2 = makeVersion(2)
  const project: Project = {
    id: 'demo-project', name: 'Northline · Autumn launch', client: 'Northline',
    tags: ['Campaign'], permission: 'reviewer', cover: null, links: [], grants: [],
    assets: [{ id: assetId, name: 'Weekend poster', currentVersion: v2.id, versions: [v2, v1] }],
    events: [
      seedEvent({ id: 'upload-v1', versionId: 'v1', type: 'version.uploaded', body: '1', reference: 'U001' }),
      seedEvent({ id: 'date-pin', versionId: 'v1', type: 'comment', body: 'The event opens Saturday. Please change the date to November 15–16.', actor: 'Taylor Brooks', identity: 'declared', party: 'client', anchorX: 0.28, anchorY: 0.84, imageId: 'v1-poster', reference: 'C001' }),
      seedEvent({ id: 'request-v1', versionId: 'v1', type: 'changes', body: 'Update the date on the poster before handoff.', actor: 'Taylor Brooks', identity: 'declared', party: 'client', reference: 'R001' }),
      seedEvent({ id: 'upload-v2', versionId: 'v2', type: 'version.uploaded', body: '2', created: secondDate, reference: 'U001' }),
    ],
  }
  const originalFetch = window.fetch.bind(window)
  const error = (status: number, code: string) => Response.json({ error: code }, { status })
  const files = { v1: posterV1, v2: posterV2 } as const
  const ready = Promise.all(([v1, v2] as const).map(async (version) => {
    const response = await originalFetch(files[version.id as keyof typeof files])
    if (!response.ok) throw new Error('Missing demo artwork')
    const blob = await response.blob()
    version.bytes = blob.size
    version.images[0].bytes = blob.size
    return [version.id, blob] as const
  })).then((entries) => new Map(entries))

  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.href)
    const path = url.pathname
    if (url.origin !== location.origin || !path.startsWith('/api/')) return originalFetch(input, init)
    if (path === '/api/me') return error(401, 'UNAUTHORIZED')
    if (new Headers(init?.headers).get('authorization') !== 'Bearer demo') return error(404, 'NOT_FOUND')
    const method = init?.method ?? 'GET'
    if (path === '/api/review' && method === 'GET') {
      await ready
      return Response.json(project)
    }
    const match = /^\/api\/assets\/weekend-poster\/versions\/(v[12])(?:\/images\/(v[12]-poster))?\/(file|thumbnail|download|comments|decision)$/.exec(path)
    if (!match) return error(404, 'NOT_FOUND')
    const [, id, imageId, action] = match
    const version = id === 'v1' ? v1 : v2
    if (imageId && imageId !== version.images[0].id) return error(404, 'NOT_FOUND')
    if (method === 'GET' && ['file', 'thumbnail', 'download'].includes(action)) {
      if (action === 'download' && version.state !== 'approved') return error(403, 'FORBIDDEN')
      return new Response((await ready).get(id))
    }
    if (method !== 'POST' || !['comments', 'decision'].includes(action)) return error(404, 'NOT_FOUND')
    if (version !== v2) return error(409, 'STALE_VERSION')
    if (version.state === 'approved') return error(409, 'VERSION_APPROVED')

    const inputBody = JSON.parse(String(init?.body ?? '{}'))
    const note = typeof inputBody.body === 'string' ? inputBody.body.trim().slice(0, 4000) : ''
    const name = typeof inputBody.name === 'string' ? inputBody.name.trim().slice(0, 80) : ''
    if (!name) return error(400, 'INVALID_INPUT')
    const type = action === 'decision' ? inputBody.state : 'comment'
    if (!['comment', 'changes', 'approved'].includes(type) || (type !== 'approved' && !note))
      return error(400, 'INVALID_INPUT')
    if (action === 'decision' && inputBody.revision !== version.revision)
      return error(409, 'STALE_VERSION')

    const parent = inputBody.replyTo
      ? project.events.find((event) => event.id === inputBody.replyTo && event.versionId === id && event.type === 'comment' && !event.parentId)
      : undefined
    if (inputBody.replyTo && !parent) return error(400, 'INVALID_REPLY')
    const anchor = inputBody.anchor
    if (anchor && (parent || inputBody.imageId !== version.images[0].id ||
      ![anchor.x, anchor.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)))
      return error(400, 'INVALID_ANCHOR')
    if (type !== 'comment') {
      version.state = type
      version.revision += 1
    }
    const count = project.events.filter((event) => event.versionId === id && event.type === type).length
    const prefix = type === 'comment' ? 'C' : type === 'changes' ? 'R' : 'A'
    const eventId = crypto.randomUUID()
    project.events.push(seedEvent({
      id: eventId, versionId: id, type, body: type === 'approved' ? '' : note,
      actor: name, identity: 'declared', party: 'client', created: new Date().toISOString(),
      parentId: parent?.id ?? null, imageId: anchor ? version.images[0].id : (parent?.imageId ?? null),
      anchorX: anchor?.x ?? null, anchorY: anchor?.y ?? null,
      reference: prefix + String(count + 1).padStart(3, '0'),
    }))
    return Response.json({ id: eventId })
  }
}
