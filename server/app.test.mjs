import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
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
