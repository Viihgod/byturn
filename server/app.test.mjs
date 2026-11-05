import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import sharp from 'sharp'
import { createApplication } from './app.mjs'

async function fixture(t, options = {}) {
  const dataDir = mkdtempSync(join(tmpdir(), 'byturn-'))
  let app = createApplication({ dataDir, ...options })
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve))
  let base = `http://127.0.0.1:${app.server.address().port}`
  t.after(async () => {
    await app.close()
    assert.equal(dirname(resolve(dataDir)), resolve(tmpdir()))
    assert.ok(dataDir.startsWith(join(tmpdir(), 'byturn-')))
    rmSync(dataDir, { recursive: true, force: true })
  })
  async function request(
    path,
    { cookie = '', token = '', body, method = body ? 'POST' : 'GET', headers = {} } = {},
  ) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(token ? { authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = String(response.headers.get('content-type')).includes('application/json')
      ? await response.json()
      : Buffer.from(await response.arrayBuffer())
    return {
      status: response.status,
      data,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
    }
  }
  const password = 'Byturn-test-password!'
  const admin = await app.createUser({
    name: 'Admin',
    email: 'admin@example.test',
    password,
    role: 'admin',
  })
  const editor = await app.createUser({ name: 'Designer A', email: 'a@example.test', password })
  const other = await app.createUser({ name: 'Designer B', email: 'b@example.test', password })
  const client = await app.createUser({
    name: 'Client',
    email: 'client@example.test',
    password,
    role: 'client',
  })
  const login = async (email) => (await request('/api/login', { body: { email, password } })).cookie
  const cookie = await login(admin.email)
  const project = (
    await request('/api/projects', {
      cookie,
      body: { name: 'Campaign', client: 'Northline', tags: ['Design'] },
    })
  ).data.id
  const privateProject = (
    await request('/api/projects', {
      cookie,
      body: { name: 'Private dev work', client: 'Other client' },
    })
  ).data.id
  for (const [userId, permission, projectId] of [
    [editor.id, 'editor', project],
    [client.id, 'reviewer', project],
    [other.id, 'editor', privateProject],
  ])
    assert.equal(
      (
        await request(`/api/projects/${projectId}/grants`, {
          cookie,
          method: 'PUT',
          body: { userId, permission },
        })
      ).status,
      200,
    )
  const image = await sharp({
    create: { width: 64, height: 64, channels: 3, background: '#f2ff40' },
  })
    .png()
    .toBuffer()
  const upload = async (assetId, auth = { cookie }) =>
    request(`/api/projects/${project}/uploads`, {
      ...auth,
      body: {
        name: 'Poster',
        filename: 'poster.png',
        data: image.toString('base64'),
        ...(assetId ? { assetId } : {}),
      },
    })
  const link = async () =>
    (await request(`/api/projects/${project}/links`, { cookie, body: { label: 'Client review' } }))
      .data
  return {
    dataDir,
    app,
    request,
    admin,
    editor,
    other,
    client,
    cookie,
    project,
    privateProject,
    image,
    upload,
    link,
    login,
    restart: async () => {
      await app.close()
      app = createApplication({ dataDir })
      await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve))
      base = `http://127.0.0.1:${app.server.address().port}`
    },
  }
}

test('project covers select only project images, persist and restrict changes to internal editors', async (t) => {
  const f = await fixture(t)
  const path = `/api/projects/${f.project}/cover`
  const read = async (cookie = f.cookie) =>
    (await f.request(`/api/projects/${f.project}`, { cookie })).data
  assert.equal((await read()).cover, null)
  const upload = (await f.upload()).data
  const first = (await read()).cover
  assert.equal(first.versionId, upload.versionId)
  assert.equal(first.assetId, upload.assetId)
  const second = (await f.upload(upload.assetId)).data
  assert.equal((await read()).cover.versionId, second.versionId)
  const editorCookie = await f.login(f.editor.email)
  assert.equal(
    (
      await f.request(path, {
        cookie: editorCookie,
        method: 'PUT',
        body: { imageId: first.imageId },
      })
    ).status,
    200,
  )
  await f.restart()
  assert.deepEqual((await read()).cover, first)
  await f.upload(upload.assetId)
  assert.deepEqual((await read()).cover, first)
  const link = await f.link()
  for (const auth of [
    { cookie: await f.login(f.client.email) },
    { token: link.token },
    { cookie: await f.login(f.other.email) },
  ]) {
    assert.ok(
      [403, 404].includes(
        (await f.request(path, { ...auth, method: 'PUT', body: { imageId: null } })).status,
      ),
    )
  }
  await f.request(`/api/projects/${f.project}/grants`, {
    cookie: f.cookie,
    method: 'PUT',
    body: { userId: f.editor.id, permission: 'viewer' },
  })
  assert.equal(
    (await f.request(path, { cookie: editorCookie, method: 'PUT', body: { imageId: null } }))
      .status,
    403,
  )
  const foreign = (
    await f.request(`/api/projects/${f.privateProject}/uploads`, {
      cookie: f.cookie,
      body: { name: 'Private', filename: 'private.png', data: f.image.toString('base64') },
    })
  ).data
  const foreignProject = (
    await f.request(`/api/projects/${f.privateProject}`, { cookie: f.cookie })
  ).data
  assert.equal(foreignProject.cover.versionId, foreign.versionId)
  assert.equal(
    (
      await f.request(path, {
        cookie: f.cookie,
        method: 'PUT',
        body: { imageId: foreignProject.cover.imageId },
      })
    ).status,
    400,
  )
  assert.deepEqual((await read()).cover, first)
  assert.equal(
    (await f.request(path, { cookie: f.cookie, method: 'PUT', body: { imageId: null } })).status,
    200,
  )
  assert.notEqual((await read()).cover.versionId, first.versionId)
})

test('multi-image uploads are atomic, bounded and account for the entire batch quota', async (t) => {
  const f = await fixture(t)
  const source = { filename: 'one.png', data: f.image.toString('base64') }
  const path = `/api/projects/${f.project}/uploads`
  for (const images of [
    [],
    Array.from({ length: 21 }, () => source),
    [source, { filename: 'bad.png', data: Buffer.from('not an image').toString('base64') }],
  ])
    assert.equal(
      (await f.request(path, { cookie: f.cookie, body: { name: 'Batch', images } })).status,
      400,
    )
  assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM versions').get().n, 0)
  assert.equal(readdirSync(join(f.dataDir, 'files')).length, 0)
  const result = await f.request(path, {
    cookie: f.cookie,
    body: {
      name: 'Carousel',
      images: [source, { ...source, filename: 'two.png' }, { ...source, filename: 'three.png' }],
    },
  })
  assert.equal(result.status, 201)
  const dto = (await f.request('/api/projects/' + f.project, { cookie: f.cookie })).data
  assert.equal(dto.assets.length, 1)
  const version = dto.assets[0].versions[0]
  assert.equal(version.images.length, 3)
  assert.equal(version.bytes, f.image.length * 3)
  assert.deepEqual(
    version.images.map((i) => i.filename),
    ['one.png', 'two.png', 'three.png'],
  )
  assert.equal(new Set(version.images.map((i) => i.id)).size, 3)
  const limited = await fixture(t, { quota: f.image.length * 2 - 1 })
  assert.equal(
    (
      await limited.request(`/api/projects/${limited.project}/uploads`, {
        cookie: limited.cookie,
        body: { images: [source, source] },
      })
    ).status,
    413,
  )
  assert.equal(readdirSync(join(limited.dataDir, 'files')).length, 0)
})

test('carousel order persists; annotations follow image IDs and stale approval cannot override a reorder', async (t) => {
  const f = await fixture(t)
  const second = await sharp({
    create: { width: 90, height: 64, channels: 3, background: '#369cff' },
  })
    .png()
    .toBuffer()
  const up = (
    await f.request(`/api/projects/${f.project}/uploads`, {
      cookie: f.cookie,
      body: {
        name: 'Carousel',
        images: [
          { filename: 'first.png', data: f.image.toString('base64') },
          { filename: 'second.png', data: second.toString('base64') },
        ],
      },
    })
  ).data
  const path = `/api/assets/${up.assetId}/versions/${up.versionId}`
  const { token } = await f.link()
  let dto = (await f.request('/api/review', { token })).data
  const images = dto.assets[0].versions[0].images
  const pin = await f.request(path + '/comments', {
    token,
    body: {
      name: 'Client',
      body: 'Mark second image',
      imageId: images[1].id,
      anchor: { x: 0.7, y: 0.2 },
    },
  })
  assert.equal(pin.status, 200)
  assert.equal(
    (
      await f.request(path + '/comments', {
        token,
        body: { name: 'Client', body: 'Missing image', anchor: { x: 0.2, y: 0.2 } },
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await f.request(path + '/images/order', {
        cookie: f.cookie,
        method: 'PUT',
        body: { revision: 0, imageIds: [images[1].id, images[1].id] },
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await f.request(path + '/images/order', {
        token,
        method: 'PUT',
        body: { revision: 0, imageIds: images.map((i) => i.id) },
      })
    ).status,
    404,
  )
  assert.equal(
    (
      await f.request(path + '/images/order', {
        cookie: f.cookie,
        method: 'PUT',
        body: { revision: 0, imageIds: [images[1].id, images[0].id] },
      })
    ).status,
    200,
  )
  assert.equal(
    (
      await f.request(path + '/decision', {
        token,
        body: { name: 'Client', state: 'approved', revision: 0 },
      })
    ).status,
    409,
  )
  assert.deepEqual((await f.request(path + '/file', { token })).data, second)
  const preview = await f.request(path + '/images/' + images[1].id + '/thumbnail', { token })
  assert.equal(preview.status, 200)
  assert.equal((await sharp(preview.data).metadata()).format, 'webp')
  await f.restart()
  dto = (await f.request('/api/review', { token })).data
  assert.deepEqual(
    dto.assets[0].versions[0].images.map((i) => i.id),
    [images[1].id, images[0].id],
  )
  assert.equal(dto.events.find((e) => e.id === pin.data.id).imageId, images[1].id)
  assert.equal(dto.events.find((e) => e.id === pin.data.id).reference, 'C001')
  assert.equal(dto.events.filter((e) => e.type === 'images.reordered').length, 1)
})

test('approval is terminal for all carousel slides and cannot create duplicate approvals', async (t) => {
  const f = await fixture(t)
  const img = { filename: 'slide.png', data: f.image.toString('base64') }
  const up = (
    await f.request(`/api/projects/${f.project}/uploads`, {
      cookie: f.cookie,
      body: { name: 'Approved carousel', images: [img, img] },
    })
  ).data
  const { token } = await f.link()
  const path = `/api/assets/${up.assetId}/versions/${up.versionId}`
  const comment = await f.request(path + '/comments', {
    token,
    body: { name: 'Client', body: 'A regular comment' },
  })
  assert.equal(comment.status, 200)
  assert.equal(
    (
      await f.request(path + '/decision', {
        token,
        body: { name: 'Client', state: 'changes', body: 'Adjust title', revision: 0 },
      })
    ).status,
    200,
  )
  assert.equal(
    (
      await f.request(path + '/decision', {
        token,
        body: { name: 'Client', state: 'approved', revision: 1 },
      })
    ).status,
    200,
  )
  for (const state of ['approved', 'changes']) {
    const blocked = await f.request(path + '/decision', {
      token,
      body: { name: 'Client', state, body: 'Repeated', revision: 2 },
    })
    assert.equal(blocked.status, 409)
    assert.equal(blocked.data.error, 'VERSION_APPROVED')
  }
  for (const auth of [{ token }, { cookie: f.cookie }])
    assert.equal(
      (
        await f.request(path + '/comments', {
          ...auth,
          body: { name: 'Client', body: 'Locked reply', replyTo: comment.data.id },
        })
      ).status,
      409,
    )
  const dto = (await f.request('/api/review', { token })).data
  const version = dto.assets[0].versions[0]
  assert.equal(
    (
      await f.request(path + '/images/order', {
        cookie: f.cookie,
        method: 'PUT',
        body: { revision: 2, imageIds: version.images.map((i) => i.id).reverse() },
      })
    ).status,
    409,
  )
  assert.deepEqual(
    dto.events
      .filter((e) => ['comment', 'changes', 'approved'].includes(e.type))
      .map((e) => e.reference),
    ['C001', 'R001', 'A001'],
  )
  assert.equal(dto.events.filter((e) => e.type === 'approved').length, 1)
  for (const image of version.images)
    assert.deepEqual(
      (await f.request(path + '/images/' + image.id + '/download', { token })).data,
      f.image,
    )
  const next = await f.upload(up.assetId)
  assert.equal(next.status, 201)
  const updated = (await f.request('/api/review', { token })).data
  assert.equal(updated.assets[0].versions[0].state, 'review')
  assert.equal(updated.assets[0].versions[0].images.length, 1)
})

test('image IDs cannot cross version/project boundaries and revoked links lose originals and thumbnails', async (t) => {
  const f = await fixture(t)
  const first = (await f.upload()).data
  const second = (await f.upload()).data
  const { token, id } = await f.link()
  const dto = (await f.request('/api/review', { token })).data
  const image = dto.assets.find((a) => a.id === second.assetId).versions[0].images[0]
  const path = `/api/assets/${first.assetId}/versions/${first.versionId}`
  assert.equal((await f.request(path + '/images/' + image.id + '/file', { token })).status, 404)
  assert.equal(
    (
      await f.request(path + '/comments', {
        token,
        body: {
          name: 'Client',
          body: 'Wrong slide',
          imageId: image.id,
          anchor: { x: 0.5, y: 0.5 },
        },
      })
    ).status,
    400,
  )
  const other = await f.login(f.other.email)
  const ownImage = dto.assets.find((a) => a.id === first.assetId).versions[0].images[0]
  assert.equal(
    (await f.request(path + '/images/' + ownImage.id + '/thumbnail', { cookie: other })).status,
    404,
  )
  await f.request('/api/links/' + id, { cookie: f.cookie, method: 'DELETE' })
  for (const action of ['file', 'thumbnail'])
    assert.equal(
      (await f.request(path + '/images/' + ownImage.id + '/' + action, { token })).status,
      404,
    )
})

test('single-image migration keeps existing pin locations, replies and original bytes', async (t) => {
  const f = await fixture(t)
  const up = (await f.upload()).data
  f.app.db.exec(
    'DROP TABLE events; CREATE TABLE events(id TEXT PRIMARY KEY,project_id TEXT,asset_id TEXT,version_id TEXT,type TEXT,body TEXT,actor TEXT,identity TEXT,created TEXT,anchor_x REAL,anchor_y REAL,parent_id TEXT,party TEXT); DELETE FROM version_images; PRAGMA user_version=1;',
  )
  const insert = f.app.db.prepare('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
  insert.run(
    'pin',
    f.project,
    up.assetId,
    up.versionId,
    'comment',
    'Old pin',
    'Client',
    'declared',
    new Date().toISOString(),
    0.12,
    0.88,
    null,
    'client',
  )
  insert.run(
    'reply',
    f.project,
    up.assetId,
    up.versionId,
    'comment',
    'Old reply',
    'Designer',
    'account',
    new Date().toISOString(),
    null,
    null,
    'pin',
    'team',
  )
  await f.restart()
  const dto = (await f.request('/api/projects/' + f.project, { cookie: f.cookie })).data
  const version = dto.assets[0].versions[0]
  assert.equal(version.images.length, 1)
  const pin = dto.events.find((e) => e.id === 'pin'),
    reply = dto.events.find((e) => e.id === 'reply')
  assert.equal(pin.anchorX, 0.12)
  assert.equal(pin.anchorY, 0.88)
  assert.equal(pin.imageId, version.images[0].id)
  assert.equal(reply.imageId, pin.imageId)
  assert.equal(reply.parentId, pin.id)
  assert.deepEqual(
    (
      await f.request(
        `/api/assets/${up.assetId}/versions/${up.versionId}/images/${version.images[0].id}/file`,
        { cookie: f.cookie },
      )
    ).data,
    f.image,
  )
})

test('version-specific pins support guest/team replies and reject cross-version or invalid anchors', async (t) => {
  const f = await fixture(t)
  const uploaded = (await f.upload()).data
  const { token, id: linkId } = await f.link()
  const path = `/api/assets/${uploaded.assetId}/versions/${uploaded.versionId}/comments`
  const pin = await f.request(path, {
    token,
    body: { name: 'Taylor', body: 'Please adjust this phrase.', anchor: { x: 0.72, y: 0.25 } },
  })
  assert.equal(pin.status, 200)
  assert.ok(pin.data.id)
  const editorCookie = await f.login(f.editor.email)
  assert.equal(
    (
      await f.request(path, {
        cookie: editorCookie,
        body: { body: 'We will update it.', replyTo: pin.data.id },
      })
    ).status,
    200,
  )
  assert.equal(
    (
      await f.request(path, {
        token,
        body: { name: 'Taylor', body: 'Thank you.', replyTo: pin.data.id },
      })
    ).status,
    200,
  )
  for (const anchor of [
    null,
    { x: -0.01, y: 0.2 },
    { x: 1.01, y: 0.2 },
    { x: '0.5', y: 0.2 },
    { x: 0.5 },
    [],
  ])
    assert.equal(
      (await f.request(path, { token, body: { name: 'Taylor', body: 'Invalid', anchor } })).status,
      400,
    )
  assert.equal(
    (
      await f.request(path, {
        cookie: await f.login(f.other.email),
        body: { body: 'Cross-project', anchor: { x: 0.1, y: 0.1 } },
      })
    ).status,
    404,
  )
  const next = (await f.upload(uploaded.assetId)).data
  assert.equal(
    (
      await f.request(`/api/assets/${uploaded.assetId}/versions/${next.versionId}/comments`, {
        cookie: editorCookie,
        body: { body: 'Wrong version', replyTo: pin.data.id },
      })
    ).status,
    400,
  )
  await f.restart()
  const dto = (await f.request('/api/review', { token })).data
  const stored = dto.events.find((e) => e.id === pin.data.id)
  assert.equal(stored.anchorX, 0.72)
  assert.equal(stored.anchorY, 0.25)
  assert.equal(stored.versionId, uploaded.versionId)
  assert.equal(stored.party, 'client')
  const replies = dto.events.filter((e) => e.parentId === pin.data.id)
  assert.deepEqual(
    replies.map((e) => e.party),
    ['team', 'client'],
  )
  assert.ok(replies.every((e) => e.anchorX === null && e.versionId === uploaded.versionId))
  await f.request('/api/links/' + linkId, { cookie: f.cookie, method: 'DELETE' })
  assert.equal(
    (
      await f.request(path, {
        token,
        body: { name: 'Taylor', body: 'Revoked', replyTo: pin.data.id },
      })
    ).status,
    404,
  )
})

test('internal accounts edit deliveries but cannot submit client approval, and clients cannot rename assets', async (t) => {
  const f = await fixture(t)
  const up = (await f.upload()).data
  const editor = await f.login(f.editor.email)
  const client = await f.login(f.client.email)
  for (const cookie of [f.cookie, editor])
    assert.equal(
      (
        await f.request(`/api/assets/${up.assetId}/versions/${up.versionId}/decision`, {
          cookie,
          body: { state: 'approved', revision: 0 },
        })
      ).status,
      403,
    )
  assert.equal(
    (
      await f.request('/api/assets/' + up.assetId, {
        cookie: client,
        method: 'PATCH',
        body: { name: 'Client overwrite' },
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await f.request('/api/assets/' + up.assetId, {
        cookie: editor,
        method: 'PATCH',
        body: { name: 'Revised delivery' },
      })
    ).status,
    200,
  )
  const saved = (await f.request('/api/projects/' + f.project, { cookie: client })).data
  assert.equal(saved.assets[0].name, 'Revised delivery')
  assert.equal(saved.assets[0].currentVersion, up.versionId)
  assert.equal(
    (
      await f.request(`/api/assets/${up.assetId}/versions/${up.versionId}/decision`, {
        cookie: client,
        body: { state: 'approved', revision: 0 },
      })
    ).status,
    200,
  )
})

test('additive migration preserves legacy comments, original files and active sessions', async (t) => {
  const f = await fixture(t)
  const up = (await f.upload()).data
  f.app.db.exec(
    'DROP TABLE events; CREATE TABLE events(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),asset_id TEXT,version_id TEXT,type TEXT NOT NULL,body TEXT NOT NULL,actor TEXT NOT NULL,identity TEXT NOT NULL,created TEXT NOT NULL); PRAGMA user_version=0;',
  )
  f.app.db
    .prepare('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?)')
    .run(
      'historic-comment',
      f.project,
      up.assetId,
      up.versionId,
      'comment',
      'Existing feedback',
      'Original client',
      'declared',
      new Date().toISOString(),
    )
  await f.restart()
  const dto = (await f.request('/api/projects/' + f.project, { cookie: f.cookie })).data
  const old = dto.events.find((e) => e.id === 'historic-comment')
  assert.equal(old.body, 'Existing feedback')
  assert.equal(old.anchorX, null)
  assert.equal(old.parentId, null)
  assert.equal(old.party, 'unknown')
  assert.deepEqual(
    (
      await f.request(`/api/assets/${up.assetId}/versions/${up.versionId}/file`, {
        cookie: f.cookie,
      })
    ).data,
    f.image,
  )
  assert.equal(
    (
      await f.request(`/api/assets/${up.assetId}/versions/${up.versionId}/comments`, {
        cookie: f.cookie,
        body: { body: 'A new marker', anchor: { x: 0, y: 1 } },
      })
    ).status,
    200,
  )
})

test('persistent multi-session V1 change request → V2 approval → download → revocation preserves history', async (t) => {
  const f = await fixture(t)
  const a = await f.upload()
  assert.equal(a.status, 201)
  const { assetId, versionId: v1 } = a.data
  const link = await f.link()
  const endpoint = (v) => `/api/assets/${assetId}/versions/${v}`
  assert.equal((await f.request(endpoint(v1) + '/download', { token: link.token })).status, 409)
  assert.equal(
    (
      await f.request(endpoint(v1) + '/decision', {
        token: link.token,
        body: { name: 'Taylor', state: 'changes', body: 'Change the date', revision: 0 },
      })
    ).status,
    200,
  )
  const { versionId: v2 } = (await f.upload(assetId, { cookie: await f.login(f.editor.email) }))
    .data
  assert.equal(
    (
      await f.request(endpoint(v1) + '/decision', {
        token: link.token,
        body: { name: 'Taylor', state: 'approved', revision: 1 },
      })
    ).status,
    409,
  )
  const state = await f.request('/api/review', { token: link.token })
  assert.equal(state.data.assets[0].versions[0].state, 'review')
  assert.equal(
    (
      await f.request(endpoint(v2) + '/decision', {
        token: link.token,
        body: { name: 'Taylor', state: 'approved', revision: 0 },
      })
    ).status,
    200,
  )
  assert.deepEqual(
    (await f.request(endpoint(v2) + '/download', { token: link.token })).data,
    f.image,
  )
  assert.equal(
    (await f.request('/api/links/' + link.id, { cookie: f.cookie, method: 'DELETE' })).status,
    200,
  )
  for (const path of ['/api/review', endpoint(v2) + '/file', endpoint(v2) + '/download'])
    assert.equal((await f.request(path, { token: link.token })).status, 404)
  assert.equal(
    (
      await f.request(endpoint(v2) + '/comments', {
        token: link.token,
        body: { name: 'Taylor', body: 'Too late' },
      })
    ).status,
    404,
  )
  await f.restart()
  const saved = (
    await f.request('/api/projects/' + f.project, { cookie: await f.login(f.admin.email) })
  ).data
  assert.equal(saved.assets[0].versions.length, 2)
  assert.equal(saved.assets[0].versions[0].state, 'approved')
  assert.ok(
    saved.events.some(
      (e) => e.type === 'changes' && e.body === 'Change the date' && e.identity === 'declared',
    ),
  )
  assert.ok(saved.events.some((e) => e.type === 'link.revoked'))
})

test('account grants, links and file endpoints cannot cross project boundaries', async (t) => {
  const f = await fixture(t)
  const up = (await f.upload()).data
  const otherCookie = await f.login(f.other.email)
  const listed = await f.request('/api/projects', { cookie: otherCookie })
  assert.deepEqual(
    listed.data.map((p) => p.id),
    [f.privateProject],
  )
  for (const path of [
    '/api/projects/' + f.project,
    `/api/assets/${up.assetId}/versions/${up.versionId}/file`,
  ])
    assert.equal((await f.request(path, { cookie: otherCookie })).status, 404)
  assert.equal((await f.upload(up.assetId, { cookie: otherCookie })).status, 404)
  const link = await f.link()
  assert.equal(
    (await f.request('/api/projects/' + f.privateProject, { token: link.token })).status,
    404,
  )
  assert.equal((await f.request('/api/users', { token: link.token })).status, 403)
  assert.equal((await f.request('/api/projects', { token: link.token })).status, 403)
  const dto = (await f.request('/api/review', { token: link.token })).data
  assert.equal(dto.links.length, 0)
  assert.equal(dto.grants.length, 0)
})

test('client account reviews independently of a guest link; clients cannot edit or manage users', async (t) => {
  const f = await fixture(t)
  const upload = (await f.upload()).data
  const cookie = await f.login(f.client.email)
  assert.equal((await f.upload(upload.assetId, { cookie })).status, 403)
  assert.equal(
    (await f.request('/api/users', { cookie, body: { name: 'Injected', role: 'admin' } })).status,
    403,
  )
  assert.equal(
    (
      await f.request(`/api/projects/${f.project}/grants`, {
        cookie: f.cookie,
        method: 'PUT',
        body: { userId: f.client.id, permission: 'editor' },
      })
    ).status,
    400,
  )
  const url = `/api/assets/${upload.assetId}/versions/${upload.versionId}/decision`
  assert.equal(
    (
      await f.request(url, {
        cookie,
        body: { name: 'Someone else', state: 'approved', revision: 0 },
      })
    ).status,
    200,
  )
  const data = (await f.request('/api/projects/' + f.project, { cookie })).data
  assert.equal(data.events.at(-1).actor, 'Client')
  assert.equal(data.events.at(-1).identity, 'account')
})

test('disabled users and removed grants take effect immediately, and viewer cannot comment', async (t) => {
  const f = await fixture(t)
  const uploaded = (await f.upload()).data
  const cookie = await f.login(f.editor.email)
  await f.request(`/api/projects/${f.project}/grants`, {
    cookie: f.cookie,
    method: 'PUT',
    body: { userId: f.editor.id, permission: 'viewer' },
  })
  assert.equal(
    (
      await f.request(`/api/assets/${uploaded.assetId}/versions/${uploaded.versionId}/comments`, {
        cookie,
        body: { body: 'Not allowed' },
      })
    ).status,
    403,
  )
  await f.request(`/api/projects/${f.project}/grants`, {
    cookie: f.cookie,
    method: 'PUT',
    body: { userId: f.editor.id, permission: 'none' },
  })
  assert.equal((await f.request('/api/projects/' + f.project, { cookie })).status, 404)
  assert.equal(
    (
      await f.request('/api/users/' + f.editor.id, {
        cookie: f.cookie,
        method: 'PATCH',
        body: { active: false },
      })
    ).status,
    200,
  )
  assert.equal((await f.request('/api/me', { cookie })).status, 401)
  assert.equal(
    (
      await f.request('/api/users/' + f.admin.id, {
        cookie: f.cookie,
        method: 'PATCH',
        body: { active: false },
      })
    ).status,
    400,
  )
})

test('concurrent decisions reject stale revision, and a new version never inherits approval', async (t) => {
  const f = await fixture(t)
  const uploaded = (await f.upload()).data
  const { token } = await f.link()
  const path = `/api/assets/${uploaded.assetId}/versions/${uploaded.versionId}/decision`
  const results = await Promise.all(
    ['approved', 'changes'].map((state) =>
      f.request(path, {
        token,
        body: { state, revision: 0, name: 'Taylor', body: 'An adjustment' },
      }),
    ),
  )
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
  const newVersion = await f.upload(uploaded.assetId)
  assert.equal(newVersion.status, 201)
  const project = (await f.request('/api/projects/' + f.project, { cookie: f.cookie })).data
  assert.equal(project.assets[0].versions[0].state, 'review')
  assert.equal(
    (
      await f.request(
        `/api/assets/${uploaded.assetId}/versions/${newVersion.data.versionId}/download`,
        { token },
      )
    ).status,
    409,
  )
})

test('image validation, quota and origin checks reject invalid changes', async (t) => {
  const f = await fixture(t, { quota: 1 })
  assert.equal((await f.upload()).status, 413)
  assert.equal(
    (
      await f.request(`/api/projects/${f.project}/uploads`, {
        cookie: f.cookie,
        body: {
          name: 'Fake PNG',
          filename: 'fake.png',
          data: Buffer.from('<svg><script/></svg>').toString('base64'),
        },
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await f.request('/api/projects', {
        cookie: f.cookie,
        headers: { origin: 'https://unrelated.example' },
        body: { name: 'CSRF', client: 'Blocked' },
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await f.request('/api/users', {
        cookie: f.cookie,
        body: { name: 'Weak', email: 'weak@example.test', password: '123', role: 'member' },
      })
    ).status,
    400,
  )
})
