export type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'client'
  active: boolean
}
export type Version = {
  id: string
  number: number
  filename: string
  mime: string
  bytes: number
  state: 'review' | 'changes' | 'approved'
  revision: number
  created: string
}
export type Asset = { id: string; name: string; currentVersion: string; versions: Version[] }
export type Project = {
  id: string
  name: string
  client: string
  tags: string[]
  permission: 'admin' | 'editor' | 'viewer' | 'reviewer'
  assets: Asset[]
  events: {
    id: string
    assetId: string | null
    versionId: string | null
    type: string
    body: string
    actor: string
    identity: string
    created: string
  }[]
  links: { id: string; label: string; revoked: string | null; created: string }[]
  grants: { userId: string; name: string; role: string; permission: string }[]
}
export class ApiError extends Error {
  code: string
  status: number
  constructor(code: string, status: number) {
    super(code)
    this.code = code
    this.status = status
  }
}
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string; blob?: boolean } = {},
): Promise<T> {
  const response = await fetch('/api' + path, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.token ? { authorization: 'Bearer ' + options.token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(error.error ?? 'SERVER_ERROR', response.status)
  }
  return (options.blob ? await response.blob() : await response.json()) as T
}
export const filePath = (asset: string, version: string, download = false) =>
  `/assets/${asset}/versions/${version}/${download ? 'download' : 'file'}`
export async function imagePayload(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new ApiError('INVALID_IMAGE', 400)
  if (file.size > 5_000_000) throw new ApiError('FILE_TOO_LARGE', 413)
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  return { filename: file.name, data }
}
