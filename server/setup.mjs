import { createApplication } from './app.mjs'
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const demo = process.argv.includes('--demo')
const dataDir = process.env.BYTURN_DATA_DIR ?? '.data'
const app = createApplication({ dataDir })
try {
  if (app.db.prepare('SELECT COUNT(*) AS count FROM users').get().count)
    throw new Error('Setup requires an empty user database. Existing data was preserved.')
  const password = demo ? 'Byturn-review-2026!' : process.env.BYTURN_ADMIN_PASSWORD
  const admin = await app.createUser({
    name: demo ? 'Alex Morgan' : (process.env.BYTURN_ADMIN_NAME ?? 'Administrator'),
    email: demo ? 'admin@byturn.local' : process.env.BYTURN_ADMIN_EMAIL,
    password,
    role: 'admin',
  })
  if (demo) {
    const editor = await app.createUser({
      name: 'Jamie Lee',
      email: 'designer@byturn.local',
      password,
      role: 'member',
    })
    const other = await app.createUser({
      name: 'Sam Rivera',
      email: 'developer@byturn.local',
      password,
      role: 'member',
    })
    const client = await app.createUser({
      name: 'Taylor Brooks',
      email: 'client@byturn.local',
      password,
      role: 'client',
    })
    const ctx = { user: admin, link: null }
    const project = app.createProject(ctx, {
      name: 'Autumn launch',
      client: 'Northline',
      tags: ['Campaign', 'Design'],
    }).id
    const separate = app.createProject(ctx, {
      name: 'Website release',
      client: 'Pine Studio',
      tags: ['Development'],
    }).id
    const grant = app.db.prepare('INSERT INTO grants VALUES(?,?,?)')
    grant.run(project, editor.id, 'editor')
    grant.run(project, client.id, 'reviewer')
    grant.run(separate, other.id, 'editor')
    for (const [i, name] of ['Weekend poster', 'Launch story', 'Event card'].entries()) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200"><rect width="1000" height="1200" fill="${['#d8dfc4', '#e4d9ed', '#e5dfc7'][i]}"/><text x="70" y="105" fill="#28351e" font-size="30" font-family="sans-serif">NORTHLINE / OUTSIDE TOGETHER</text><text x="70" y="350" fill="#28351e" font-size="120" font-weight="bold" font-family="sans-serif">A LONG</text><text x="70" y="495" fill="#28351e" font-size="120" font-weight="bold" font-family="sans-serif">WEEKEND</text><circle cx="760" cy="850" r="110" fill="#f2ff40"/><text x="70" y="1030" fill="#28351e" font-size="45" font-family="sans-serif">NOVEMBER 14–16</text><text x="70" y="1110" fill="#28351e" font-size="35" font-family="sans-serif">Find your way out.</text></svg>`
      const bytes = await sharp(Buffer.from(svg)).png().toBuffer()
      const asset = randomUUID()
      const version = randomUUID()
      const date = new Date().toISOString()
      writeFileSync(join(dataDir, 'files', version), bytes, { mode: 0o600 })
      app.db.prepare('INSERT INTO assets VALUES(?,?,?,?)').run(asset, project, name, version)
      app.db
        .prepare(
          'INSERT INTO versions(id,asset_id,number,filename,mime,bytes,path,created) VALUES(?,?,1,?,?,?,?,?)',
        )
        .run(version, asset, name + '.png', 'image/png', bytes.length, version, date)
      app.db
        .prepare('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?)')
        .run(
          randomUUID(),
          project,
          asset,
          version,
          'version.uploaded',
          '1',
          admin.name,
          'account',
          date,
        )
    }
    console.log(
      'Demo data created. Accounts: admin@byturn.local, designer@byturn.local, developer@byturn.local, client@byturn.local. Password is documented in docs/product-runbook.md. This is explicit local demo data.',
    )
  } else
    console.log(
      'Administrator created. Start the application and sign in with the configured credentials.',
    )
} finally {
  app.db.close()
}
