import { createApplication } from './app.mjs'
const port = Number(process.env.PORT ?? 4174)
const app = createApplication({
  dataDir: process.env.BYTURN_DATA_DIR ?? '.data',
  publicUrl: process.env.BYTURN_PUBLIC_URL ?? `http://127.0.0.1:${port}`,
  devOrigin: process.env.BYTURN_DEV_ORIGIN ?? '',
  quota: Number(process.env.BYTURN_STORAGE_BYTES ?? 250_000_000),
})
app.server.listen(port, process.env.HOST ?? '127.0.0.1', () =>
  console.log(`Byturn listening on ${process.env.BYTURN_PUBLIC_URL ?? `http://127.0.0.1:${port}`}`),
)
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    void app.close().then(() => process.exit())
  })
