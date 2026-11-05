import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { mkdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { resolve, join, extname, sep } from 'node:path'
import sharp from 'sharp'

const derive = promisify(scrypt)
const digest = (value) => createHash('sha256').update(value).digest('hex')
const now = () => new Date().toISOString()
const fail = (status, code) => {
  throw Object.assign(new Error(code), { status, code })
}
const string = (value, max = 200) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    fail(400, 'INVALID_INPUT')
  return value.trim()
}
const publicUser = ({ id, name, email, role, active }) => ({
  id,
  name,
  email,
  role,
  active: Boolean(active),
})
async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 200)
    fail(400, 'PASSWORD_LENGTH')
  return `${salt}:${(await derive(password, salt, 64)).toString('hex')}`
}
async function verify(password, stored) {
  if (typeof password !== 'string' || password.length > 200) return false
  const [salt, hash] = stored.split(':')
  const result = await derive(password, salt, 64)
  return timingSafeEqual(result, Buffer.from(hash, 'hex'))
}

export function createApplication({
  dataDir,
  publicUrl = 'http://127.0.0.1:4174',
  devOrigin = '',
  quota = 250_000_000,
  staticDir = resolve('dist'),
}) {
  if (!Number.isSafeInteger(quota) || quota < 1)
    throw new Error('STORAGE_BYTES must be a positive integer')
  const root = resolve(dataDir)
  mkdirSync(join(root, 'files'), { recursive: true })
  const db = new DatabaseSync(join(root, 'byturn.sqlite'))
  if (db.prepare('PRAGMA user_version').get().user_version > 3) {
    db.close()
    throw new Error('This data directory requires a newer Byturn build')
  }
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','member','client')),active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,name TEXT NOT NULL,client TEXT NOT NULL,tags TEXT NOT NULL DEFAULT '[]',created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS grants(project_id TEXT REFERENCES projects(id),user_id TEXT REFERENCES users(id),permission TEXT NOT NULL CHECK(permission IN ('viewer','editor','reviewer')),PRIMARY KEY(project_id,user_id));
    CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),name TEXT NOT NULL,current_version TEXT);
    CREATE TABLE IF NOT EXISTS versions(id TEXT PRIMARY KEY,asset_id TEXT NOT NULL REFERENCES assets(id),number INTEGER NOT NULL,filename TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,path TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'review',revision INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,UNIQUE(asset_id,number));
    CREATE TABLE IF NOT EXISTS links(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),hash TEXT UNIQUE NOT NULL,label TEXT NOT NULL,revoked TEXT,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),asset_id TEXT,version_id TEXT,type TEXT NOT NULL,body TEXT NOT NULL,actor TEXT NOT NULL,identity TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS version_images(id TEXT PRIMARY KEY,version_id TEXT NOT NULL REFERENCES versions(id),position INTEGER NOT NULL,filename TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,path TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS images_version ON version_images(version_id,position);
    CREATE INDEX IF NOT EXISTS assets_project ON assets(project_id);
    CREATE INDEX IF NOT EXISTS events_project ON events(project_id,created);
    CREATE INDEX IF NOT EXISTS versions_asset ON versions(asset_id);
  `)
  // Additive migration: preserve existing accounts, events and original files.
  const eventColumns = new Set(
    db
      .prepare('PRAGMA table_info(events)')
      .all()
      .map((column) => column.name),
  )
  db.exec('BEGIN IMMEDIATE')
  try {
    for (const [column, definition] of [
      ['anchor_x', 'REAL'],
      ['anchor_y', 'REAL'],
      ['parent_id', 'TEXT REFERENCES events(id)'],
      ['party', "TEXT NOT NULL DEFAULT 'unknown'"],
      ['image_id', 'TEXT REFERENCES version_images(id)'],
    ]) {
      if (!eventColumns.has(column))
        db.exec(`ALTER TABLE events ADD COLUMN ${column} ${definition}`)
    }
    db.exec(`INSERT INTO version_images(id,version_id,position,filename,mime,bytes,path)
      SELECT v.id,v.id,0,v.filename,v.mime,v.bytes,v.path FROM versions v WHERE NOT EXISTS(SELECT 1 FROM version_images i WHERE i.version_id=v.id);
      UPDATE events SET image_id=(SELECT id FROM version_images WHERE version_id=events.version_id ORDER BY position LIMIT 1) WHERE anchor_x IS NOT NULL AND image_id IS NULL;
      UPDATE events SET image_id=(SELECT root.image_id FROM events root WHERE root.id=events.parent_id) WHERE parent_id IS NOT NULL AND image_id IS NULL;
      CREATE TABLE IF NOT EXISTS project_covers(project_id TEXT PRIMARY KEY REFERENCES projects(id),image_id TEXT NOT NULL REFERENCES version_images(id));
      PRAGMA user_version=3; COMMIT`)
  } catch (error) {
    db.exec('ROLLBACK')
    db.close()
    throw error
  }
  const one = (sql, ...args) => db.prepare(sql).get(...args)
  const all = (sql, ...args) => db.prepare(sql).all(...args)
  const run = (sql, ...args) => db.prepare(sql).run(...args)
  const transaction = (fn) => {
    db.exec('BEGIN IMMEDIATE')
    try {
      const r = fn()
      db.exec('COMMIT')
      return r
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  }
  const attempts = new Map()
  function limit(key, maximum = 10) {
    const time = Date.now()
    for (const [k, v] of attempts) if (v.until < time) attempts.delete(k)
    const bucket = attempts.get(key) ?? { count: 0, until: time + 15 * 60_000 }
    if (bucket.count >= maximum || attempts.size > 2000) fail(429, 'RATE_LIMIT')
    bucket.count++
    attempts.set(key, bucket)
  }
  function context(req) {
    const cookie = /(?:^|;\s*)byturn_session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
    const user = cookie
      ? one(
          'SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.hash=? AND s.expires>? AND u.active=1',
          digest(cookie),
          Date.now(),
        )
      : null
    const bearer = /^Bearer ([A-Za-z0-9_-]{40,60})$/.exec(req.headers.authorization ?? '')?.[1]
    const link = bearer
      ? one('SELECT * FROM links WHERE hash=? AND revoked IS NULL', digest(bearer))
      : null
    if (bearer && !link) fail(404, 'LINK_UNAVAILABLE')
    return { user, link }
  }
  function access(ctx, projectId, action = 'read') {
    if (!one('SELECT id FROM projects WHERE id=?', projectId)) fail(404, 'NOT_FOUND')
    if (ctx.link) {
      const live = one(
        'SELECT id FROM links WHERE id=? AND revoked IS NULL AND project_id=?',
        ctx.link.id,
        projectId,
      )
      if (!live || ['edit', 'share', 'admin'].includes(action)) fail(404, 'NOT_FOUND')
      return 'reviewer'
    }
    if (!ctx.user || !one('SELECT id FROM users WHERE id=? AND active=1', ctx.user.id))
      fail(401, 'UNAUTHORIZED')
    if (action === 'review' && ctx.user.role !== 'client') fail(403, 'FORBIDDEN')
    if (ctx.user.role === 'admin') return 'admin'
    const grant = one(
      'SELECT permission FROM grants WHERE project_id=? AND user_id=?',
      projectId,
      ctx.user.id,
    )
    if (!grant) fail(404, 'NOT_FOUND')
    if (
      (['edit', 'share'].includes(action) && grant.permission !== 'editor') ||
      (action === 'review' && grant.permission !== 'reviewer') ||
      (action === 'comment' && grant.permission === 'viewer')
    )
      fail(403, 'FORBIDDEN')
    return grant.permission
  }
  function admin(ctx) {
    if (!ctx.user || ctx.user.role !== 'admin' || ctx.link) fail(403, 'FORBIDDEN')
  }
  function actor(ctx, body = {}) {
    return ctx.user
      ? { name: ctx.user.name, identity: 'account' }
      : { name: string(body.name, 100), identity: 'declared' }
  }
  function event(ctx, project, asset, version, type, body = '', input = {}) {
    const who = actor(ctx, input)
    const id = randomUUID()
    run(
      'INSERT INTO events(id,project_id,asset_id,version_id,type,body,actor,identity,created,anchor_x,anchor_y,parent_id,party,image_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      id,
      project,
      asset,
      version,
      type,
      body,
      who.name,
      who.identity,
      now(),
      type === 'comment' ? (input.anchor?.x ?? null) : null,
      type === 'comment' ? (input.anchor?.y ?? null) : null,
      type === 'comment' ? (input.replyTo ?? null) : null,
      ctx.link || ctx.user?.role === 'client' ? 'client' : 'team',
      type === 'comment' ? (input.imageId ?? null) : null,
    )
    return id
  }
  function projectDTO(ctx, id) {
    const permission = access(ctx, id)
    const p = one('SELECT * FROM projects WHERE id=?', id)
    const assets = all('SELECT * FROM assets WHERE project_id=? ORDER BY rowid DESC', id).map(
      (a) => ({
        id: a.id,
        name: a.name,
        currentVersion: a.current_version,
        versions: all(
          'SELECT id,number,filename,mime,bytes,state,revision,created FROM versions WHERE asset_id=? ORDER BY number DESC',
          a.id,
        ).map((version) => ({
          ...version,
          images: all(
            'SELECT id,position,filename,mime,bytes FROM version_images WHERE version_id=? ORDER BY position',
            version.id,
          ),
        })),
      }),
    )
    const events = all(
      'SELECT id,asset_id AS assetId,version_id AS versionId,type,body,actor,identity,created,anchor_x AS anchorX,anchor_y AS anchorY,parent_id AS parentId,party,image_id AS imageId FROM events WHERE project_id=? ORDER BY rowid',
      id,
    )
    const counters = new Map()
    for (const item of events) {
      const prefix =
        {
          comment: 'C',
          changes: 'R',
          approved: 'A',
          'version.uploaded': 'U',
          'images.reordered': 'O',
        }[item.type] ?? 'E'
      const key = (item.versionId ?? item.assetId ?? id) + ':' + prefix
      const count = (counters.get(key) ?? 0) + 1
      counters.set(key, count)
      item.reference = prefix + String(count).padStart(3, '0')
    }
    const links =
      !ctx.link && ['admin', 'editor'].includes(permission)
        ? all(
            'SELECT id,label,revoked,created FROM links WHERE project_id=? ORDER BY rowid DESC',
            id,
          )
        : []
    const grants =
      !ctx.link && permission === 'admin'
        ? all(
            'SELECT g.user_id AS userId,g.permission,u.name,u.role FROM grants g JOIN users u ON u.id=g.user_id WHERE project_id=?',
            id,
          )
        : []
    return {
      id: p.id,
      name: p.name,
      client: p.client,
      tags: JSON.parse(p.tags),
      permission,
      cover:
        one(
          'SELECT a.id AS assetId,v.id AS versionId,i.id AS imageId FROM project_covers c JOIN version_images i ON i.id=c.image_id JOIN versions v ON v.id=i.version_id JOIN assets a ON a.id=v.asset_id WHERE c.project_id=? AND a.project_id=?',
          id,
          id,
        ) ??
        one(
          'SELECT a.id AS assetId,v.id AS versionId,i.id AS imageId FROM assets a JOIN versions v ON v.id=a.current_version JOIN version_images i ON i.version_id=v.id WHERE a.project_id=? ORDER BY v.rowid DESC,i.position LIMIT 1',
          id,
        ) ??
        null,
      assets,
      events,
      links,
      grants,
    }
  }
  async function createUser({ name, email, password, role = 'member' }) {
    email = string(email, 200).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['admin', 'member', 'client'].includes(role))
      fail(400, 'INVALID_INPUT')
    const hashed = await passwordHash(password)
    const id = randomUUID()
    try {
      run(
        'INSERT INTO users(id,name,email,password,role) VALUES(?,?,?,?,?)',
        id,
        string(name, 100),
        email,
        hashed,
        role,
      )
    } catch (e) {
      if (e.code?.includes('CONSTRAINT')) fail(409, 'ACCOUNT_EXISTS')
      throw e
    }
    return publicUser(one('SELECT * FROM users WHERE id=?', id))
  }
  function createProject(ctx, body) {
    admin(ctx)
    const id = randomUUID()
    const tags = body.tags ?? []
    if (!Array.isArray(tags) || tags.length > 10) fail(400, 'INVALID_INPUT')
    run(
      'INSERT INTO projects VALUES(?,?,?,?,?)',
      id,
      string(body.name),
      string(body.client),
      JSON.stringify(tags.map((t) => string(t, 40))),
      now(),
    )
    event(ctx, id, null, null, 'project.created')
    return { id }
  }
  async function bodyOf(req, maximum = 6_800_000) {
    if (!String(req.headers['content-type'] ?? '').startsWith('application/json'))
      fail(415, 'JSON_REQUIRED')
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > maximum) fail(413, maximum > 6_800_000 ? 'BATCH_TOO_LARGE' : 'FILE_TOO_LARGE')
      chunks.push(chunk)
    }
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString())
      if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'INVALID_INPUT')
      return body
    } catch {
      fail(400, 'INVALID_INPUT')
    }
  }
  function reply(res, status, body, headers = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
    res.end(JSON.stringify(body))
  }
  const allowedOrigins = new Set([
    new URL(publicUrl).origin,
    ...(devOrigin ? [new URL(devOrigin).origin] : []),
  ])
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${publicUrl.startsWith('https:') ? '; Secure' : ''}`
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('Cache-Control', 'no-store')
    try {
      const path = new URL(req.url, 'http://localhost').pathname
      if (
        !['GET', 'HEAD'].includes(req.method) &&
        req.headers.origin &&
        !allowedOrigins.has(req.headers.origin)
      )
        fail(403, 'ORIGIN_REJECTED')
      if (path === '/api/login' && req.method === 'POST') {
        limit('login:' + req.socket.remoteAddress)
        const b = await bodyOf(req)
        const email = string(b.email).toLowerCase()
        const u = one('SELECT * FROM users WHERE email=? AND active=1', email)
        const fallback = '00000000000000000000000000000000:' + '00'.repeat(64)
        if (!(await verify(b.password, u?.password ?? fallback)) || !u) fail(401, 'LOGIN_FAILED')
        const token = randomBytes(32).toString('base64url')
        run('DELETE FROM sessions WHERE expires<?', Date.now())
        run('INSERT INTO sessions VALUES(?,?,?)', digest(token), u.id, Date.now() + 8 * 3600_000)
        return reply(res, 200, publicUser(u), {
          'Set-Cookie': `byturn_session=${token}; ${cookieFlags}; Max-Age=28800`,
        })
      }
      if (path === '/api/logout' && req.method === 'POST') {
        const cookie = /(?:^|;\s*)byturn_session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
        if (cookie) run('DELETE FROM sessions WHERE hash=?', digest(cookie))
        return reply(res, 200, {}, { 'Set-Cookie': `byturn_session=; ${cookieFlags}; Max-Age=0` })
      }
      if (!path.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'METHOD_NOT_ALLOWED')
        const file = resolve(staticDir, '.' + decodeURIComponent(path))
        const target =
          file.startsWith(resolve(staticDir) + sep) && existsSync(file) && extname(file)
            ? file
            : join(staticDir, 'index.html')
        if (!existsSync(target)) fail(404, 'NOT_FOUND')
        const mime =
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
            '.ttf': 'font/ttf',
            '.png': 'image/png',
            '.webp': 'image/webp',
          }[extname(target)] ?? 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Security-Policy':
            "default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
        })
        return res.end(req.method === 'HEAD' ? undefined : readFileSync(target))
      }
      const ctx = context(req)
      if (!ctx.user && !ctx.link) fail(401, 'UNAUTHORIZED')
      if (path === '/api/me' && req.method === 'GET')
        return reply(res, 200, ctx.user ? publicUser(ctx.user) : null)
      if (path === '/api/review' && req.method === 'GET') {
        if (!ctx.link) fail(404, 'LINK_UNAVAILABLE')
        return reply(res, 200, projectDTO(ctx, ctx.link.project_id))
      }
      if (path === '/api/users') {
        admin(ctx)
        if (req.method === 'GET')
          return reply(
            res,
            200,
            all('SELECT id,name,email,role,active FROM users ORDER BY name').map(publicUser),
          )
        if (req.method === 'POST') return reply(res, 201, await createUser(await bodyOf(req)))
      }
      let m = /^\/api\/users\/([^/]+)$/.exec(path)
      if (m && req.method === 'PATCH') {
        admin(ctx)
        const b = await bodyOf(req)
        const u = one('SELECT * FROM users WHERE id=?', m[1])
        if (!u) fail(404, 'NOT_FOUND')
        if (m[1] === ctx.user.id && b.active === false) fail(400, 'CANNOT_DISABLE_SELF')
        const hashed = b.password ? await passwordHash(b.password) : null
        transaction(() => {
          if (b.active !== undefined) {
            if (typeof b.active !== 'boolean') fail(400, 'INVALID_INPUT')
            run('UPDATE users SET active=? WHERE id=?', b.active ? 1 : 0, u.id)
          }
          if (hashed) run('UPDATE users SET password=? WHERE id=?', hashed, u.id)
          if (hashed || b.active === false) run('DELETE FROM sessions WHERE user_id=?', u.id)
        })
        return reply(res, 200, {})
      }
      if (path === '/api/projects') {
        if (ctx.link) fail(403, 'FORBIDDEN')
        if (req.method === 'POST') return reply(res, 201, createProject(ctx, await bodyOf(req)))
        if (req.method === 'GET') {
          const projects =
            ctx.user.role === 'admin'
              ? all('SELECT id FROM projects ORDER BY rowid DESC')
              : all(
                  'SELECT p.id FROM projects p JOIN grants g ON g.project_id=p.id WHERE g.user_id=? ORDER BY p.rowid DESC',
                  ctx.user.id,
                )
          return reply(
            res,
            200,
            projects.map((p) => projectDTO(ctx, p.id)),
          )
        }
      }
      m = /^\/api\/projects\/([^/]+)$/.exec(path)
      if (m && req.method === 'GET') return reply(res, 200, projectDTO(ctx, m[1]))
      m = /^\/api\/projects\/([^/]+)\/cover$/.exec(path)
      if (m && req.method === 'PUT') {
        const project = m[1]
        access(ctx, project, 'edit')
        const b = await bodyOf(req)
        if (b.imageId === null) run('DELETE FROM project_covers WHERE project_id=?', project)
        else {
          const image = one(
            'SELECT i.id FROM version_images i JOIN versions v ON v.id=i.version_id JOIN assets a ON a.id=v.asset_id WHERE i.id=? AND a.project_id=?',
            string(b.imageId),
            project,
          )
          if (!image) fail(400, 'INVALID_IMAGE_REFERENCE')
          run(
            'INSERT INTO project_covers(project_id,image_id) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET image_id=excluded.image_id',
            project,
            image.id,
          )
        }
        return reply(res, 200, {})
      }
      m = /^\/api\/projects\/([^/]+)\/grants$/.exec(path)
      if (m && req.method === 'PUT') {
        admin(ctx)
        const b = await bodyOf(req)
        access(ctx, m[1])
        const u = one('SELECT * FROM users WHERE id=?', b.userId)
        if (!u) fail(400, 'INVALID_INPUT')
        if (b.permission === 'none')
          run('DELETE FROM grants WHERE project_id=? AND user_id=?', m[1], u.id)
        else {
          if (
            !['viewer', 'editor', 'reviewer'].includes(b.permission) ||
            (u.role === 'client' && b.permission === 'editor') ||
            (u.role === 'member' && b.permission === 'reviewer') ||
            u.role === 'admin'
          )
            fail(400, 'INVALID_INPUT')
          run(
            'INSERT INTO grants VALUES(?,?,?) ON CONFLICT(project_id,user_id) DO UPDATE SET permission=excluded.permission',
            m[1],
            u.id,
            b.permission,
          )
        }
        event(ctx, m[1], null, null, 'access.updated', u.name + ' / ' + b.permission)
        return reply(res, 200, {})
      }
      m = /^\/api\/projects\/([^/]+)\/links$/.exec(path)
      if (m && req.method === 'POST') {
        const b = await bodyOf(req)
        access(ctx, m[1], 'share')
        const token = randomBytes(32).toString('base64url')
        const id = randomUUID()
        run(
          'INSERT INTO links VALUES(?,?,?,?,NULL,?)',
          id,
          m[1],
          digest(token),
          string(b.label),
          now(),
        )
        event(ctx, m[1], null, null, 'link.created', b.label)
        return reply(res, 201, { id, token })
      }
      m = /^\/api\/links\/([^/]+)$/.exec(path)
      if (m && req.method === 'DELETE') {
        const link = one('SELECT * FROM links WHERE id=?', m[1])
        if (!link) fail(404, 'NOT_FOUND')
        access(ctx, link.project_id, 'share')
        transaction(() => {
          run('UPDATE links SET revoked=? WHERE id=?', now(), link.id)
          event(ctx, link.project_id, null, null, 'link.revoked', link.label)
        })
        return reply(res, 200, {})
      }
      m = /^\/api\/projects\/([^/]+)\/uploads$/.exec(path)
      if (m && req.method === 'POST') {
        const project = m[1]
        access(ctx, project, 'edit')
        const b = await bodyOf(req, 35_000_000)
        const input = b.images === undefined ? [{ filename: b.filename, data: b.data }] : b.images
        if (!Array.isArray(input) || !input.length || input.length > 20) fail(400, 'IMAGE_COUNT')
        const images = []
        let total = 0
        for (const item of input) {
          if (
            !item ||
            typeof item.data !== 'string' ||
            item.data.length > 6_666_668 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(item.data)
          )
            fail(400, 'INVALID_IMAGE')
          const bytes = Buffer.from(item.data, 'base64')
          if (!bytes.length || bytes.length > 5_000_000) fail(413, 'FILE_TOO_LARGE')
          total += bytes.length
          if (total > 25_000_000) fail(413, 'BATCH_TOO_LARGE')
          let metadata
          try {
            metadata = await sharp(bytes, { limitInputPixels: 24_000_000 }).metadata()
            if (!['png', 'jpeg', 'webp'].includes(metadata.format) || metadata.pages > 1)
              fail(400, 'INVALID_IMAGE')
            await sharp(bytes, { limitInputPixels: 24_000_000 }).stats()
          } catch {
            fail(400, 'INVALID_IMAGE')
          }
          images.push({
            id: randomUUID(),
            filename: string(item.filename, 180),
            mime: 'image/' + metadata.format,
            bytes,
          })
        }
        const first = images[0]
        const name = string(b.name ?? first.filename)
        const vid = randomUUID()
        const written = []
        let aid
        try {
          aid = transaction(() => {
            access(ctx, project, 'edit')
            if (
              Number(one('SELECT COALESCE(SUM(bytes),0) AS size FROM versions').size) + total >
              quota
            )
              fail(413, 'STORAGE_FULL')
            const asset = b.assetId
              ? one('SELECT * FROM assets WHERE id=? AND project_id=?', b.assetId, project)
              : null
            if (b.assetId && !asset) fail(404, 'NOT_FOUND')
            const assetId = asset?.id ?? randomUUID()
            if (!asset) run('INSERT INTO assets VALUES(?,?,?,NULL)', assetId, project, name)
            const number = Number(
              one(
                'SELECT COALESCE(MAX(number),0)+1 AS number FROM versions WHERE asset_id=?',
                assetId,
              ).number,
            )
            run(
              'INSERT INTO versions(id,asset_id,number,filename,mime,bytes,path,created) VALUES(?,?,?,?,?,?,?,?)',
              vid,
              assetId,
              number,
              first.filename,
              first.mime,
              total,
              first.id,
              now(),
            )
            for (const [position, image] of images.entries()) {
              const disk = join(root, 'files', image.id)
              writeFileSync(disk, image.bytes, { flag: 'wx', mode: 0o600 })
              written.push(disk)
              run(
                'INSERT INTO version_images VALUES(?,?,?,?,?,?,?)',
                image.id,
                vid,
                position,
                image.filename,
                image.mime,
                image.bytes.length,
                image.id,
              )
            }
            run('UPDATE assets SET current_version=? WHERE id=?', vid, assetId)
            event(ctx, project, assetId, vid, 'version.uploaded', String(number))
            return assetId
          })
        } catch (error) {
          for (const disk of written) {
            try {
              unlinkSync(disk)
            } catch {
              /* Preserve the transaction failure. */
            }
          }
          throw error
        }
        return reply(res, 201, { assetId: aid, versionId: vid })
      }
      m = /^\/api\/assets\/([^/]+)$/.exec(path)
      if (m && req.method === 'PATCH') {
        const asset = one('SELECT * FROM assets WHERE id=?', m[1])
        if (!asset) fail(404, 'NOT_FOUND')
        const b = await bodyOf(req)
        access(ctx, asset.project_id, 'edit')
        const name = string(b.name)
        transaction(() => {
          run('UPDATE assets SET name=? WHERE id=?', name, asset.id)
          event(ctx, asset.project_id, asset.id, null, 'asset.updated', name)
        })
        return reply(res, 200, {})
      }
      m = /^\/api\/assets\/([^/]+)\/versions\/([^/]+)\/images\/order$/.exec(path)
      if (m && req.method === 'PUT') {
        const asset = one('SELECT * FROM assets WHERE id=?', m[1])
        const version = one('SELECT * FROM versions WHERE id=? AND asset_id=?', m[2], m[1])
        if (!asset || !version) fail(404, 'NOT_FOUND')
        access(ctx, asset.project_id, 'edit')
        const b = await bodyOf(req)
        transaction(() => {
          const current = one('SELECT current_version FROM assets WHERE id=?', asset.id)
          const live = one('SELECT state,revision FROM versions WHERE id=?', version.id)
          if (live.state === 'approved') fail(409, 'VERSION_APPROVED')
          if (current.current_version !== version.id || live.revision !== b.revision)
            fail(409, 'STALE_VERSION')
          const ids = all('SELECT id FROM version_images WHERE version_id=?', version.id).map(
            (image) => image.id,
          )
          if (
            !Array.isArray(b.imageIds) ||
            b.imageIds.length !== ids.length ||
            new Set(b.imageIds).size !== ids.length ||
            !b.imageIds.every((id) => ids.includes(id))
          )
            fail(400, 'INVALID_ORDER')
          b.imageIds.forEach((id, position) =>
            run(
              'UPDATE version_images SET position=? WHERE id=? AND version_id=?',
              position,
              id,
              version.id,
            ),
          )
          const first = one(
            'SELECT filename,mime,path FROM version_images WHERE version_id=? ORDER BY position LIMIT 1',
            version.id,
          )
          run(
            'UPDATE versions SET filename=?,mime=?,path=?,revision=revision+1 WHERE id=?',
            first.filename,
            first.mime,
            first.path,
            version.id,
          )
          event(ctx, asset.project_id, asset.id, version.id, 'images.reordered')
        })
        return reply(res, 200, {})
      }
      m =
        /^\/api\/assets\/([^/]+)\/versions\/([^/]+)(?:\/images\/([^/]+))?\/(comments|decision|file|download|thumbnail)$/.exec(
          path,
        )
      if (m) {
        const asset = one('SELECT * FROM assets WHERE id=?', m[1])
        const version = one('SELECT * FROM versions WHERE id=? AND asset_id=?', m[2], m[1])
        if (!asset || !version) fail(404, 'NOT_FOUND')
        const action = m[4]
        if (m[3] && !['file', 'download', 'thumbnail'].includes(action)) fail(404, 'NOT_FOUND')
        access(
          ctx,
          asset.project_id,
          action === 'comments' ? 'comment' : action === 'decision' ? 'review' : 'read',
        )
        if (['file', 'download', 'thumbnail'].includes(action) && req.method === 'GET') {
          const image = m[3]
            ? one('SELECT * FROM version_images WHERE id=? AND version_id=?', m[3], version.id)
            : one(
                'SELECT * FROM version_images WHERE version_id=? ORDER BY position LIMIT 1',
                version.id,
              )
          if (!image) fail(404, 'NOT_FOUND')
          if (action === 'thumbnail') {
            const preview = await sharp(readFileSync(join(root, 'files', image.path)), {
              limitInputPixels: 24_000_000,
            })
              .rotate()
              .resize({ width: 240, height: 180, fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 75 })
              .toBuffer()
            access(ctx, asset.project_id, 'read')
            res.writeHead(200, { 'Content-Type': 'image/webp', 'Content-Length': preview.length })
            return res.end(preview)
          }
          if (
            action === 'download' &&
            (version.state !== 'approved' || asset.current_version !== version.id)
          )
            fail(409, 'NOT_APPROVED')
          res.writeHead(200, {
            'Content-Type': image.mime,
            'Content-Length': image.bytes,
            ...(action === 'download'
              ? {
                  'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(image.filename)}`,
                }
              : {}),
          })
          return res.end(readFileSync(join(root, 'files', image.path)))
        }
        if (req.method === 'POST' && ['comments', 'decision'].includes(action)) {
          if (ctx.link) limit('review:' + ctx.link.id + ':' + req.socket.remoteAddress, 100)
          const b = await bodyOf(req)
          const id = transaction(() => {
            access(ctx, asset.project_id, action === 'comments' ? 'comment' : 'review')
            const current = one('SELECT current_version FROM assets WHERE id=?', asset.id)
            const live = one('SELECT state,revision FROM versions WHERE id=?', version.id)
            if (live.state === 'approved') fail(409, 'VERSION_APPROVED')
            if (current.current_version !== version.id) fail(409, 'STALE_VERSION')
            if (action === 'comments') {
              if (
                b.anchor !== undefined &&
                (!b.anchor ||
                  typeof b.anchor !== 'object' ||
                  Array.isArray(b.anchor) ||
                  !['x', 'y'].every(
                    (key) =>
                      typeof b.anchor[key] === 'number' &&
                      Number.isFinite(b.anchor[key]) &&
                      b.anchor[key] >= 0 &&
                      b.anchor[key] <= 1,
                  ))
              )
                fail(400, 'INVALID_ANCHOR')
              let imageId = null
              if (b.replyTo !== undefined) {
                if (typeof b.replyTo !== 'string' || b.anchor !== undefined)
                  fail(400, 'INVALID_REPLY')
                const parent = one(
                  "SELECT id,image_id FROM events WHERE id=? AND project_id=? AND asset_id=? AND version_id=? AND type='comment' AND parent_id IS NULL",
                  b.replyTo,
                  asset.project_id,
                  asset.id,
                  version.id,
                )
                if (!parent) fail(400, 'INVALID_REPLY')
                if (b.imageId !== undefined && b.imageId !== parent.image_id)
                  fail(400, 'INVALID_IMAGE_REFERENCE')
                imageId = parent.image_id
              } else if (b.anchor !== undefined || b.imageId !== undefined) {
                const images = all(
                  'SELECT id FROM version_images WHERE version_id=? ORDER BY position',
                  version.id,
                )
                imageId = b.imageId ?? (images.length === 1 ? images[0].id : null)
                if (!images.some((image) => image.id === imageId))
                  fail(400, 'INVALID_IMAGE_REFERENCE')
              }
              return event(
                ctx,
                asset.project_id,
                asset.id,
                version.id,
                'comment',
                string(b.body, 4000),
                { ...b, imageId },
              )
            } else {
              if (b.revision !== live.revision) fail(409, 'STALE_VERSION')
              if (!['approved', 'changes'].includes(b.state)) fail(400, 'INVALID_INPUT')
              const note = b.state === 'changes' ? string(b.body, 4000) : ''
              run('UPDATE versions SET state=?,revision=revision+1 WHERE id=?', b.state, version.id)
              event(ctx, asset.project_id, asset.id, version.id, b.state, note, b)
            }
          })
          return reply(res, 200, { id })
        }
      }
      fail(404, 'NOT_FOUND')
    } catch (e) {
      if (res.headersSent) return res.destroy()
      reply(res, e.status ?? 500, { error: e.code && e.status ? e.code : 'SERVER_ERROR' })
    }
  })
  server.requestTimeout = 120_000
  server.headersTimeout = 15_000
  return {
    server,
    db,
    createUser,
    createProject,
    close: () =>
      new Promise((resolveClose) => {
        server.close(() => {
          db.close()
          resolveClose()
        })
        server.closeIdleConnections()
      }),
  }
}
