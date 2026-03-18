import { createServer } from 'node:http'
import { access, readFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

const PORT = Number(process.env.API_PORT ?? 3006)
const OD_BASE = process.env.OPENDENTAL_API_URL ?? 'https://api.opendental.com/api/v1'
const OD_DEV_KEY = process.env.OPENDENTAL_DEV_KEY ?? ''
const OD_KEY = process.env.OPENDENTAL_API_KEY ?? ''

const SFTP_HOST = process.env.OD_MOUNT_SFTP_HOST ?? ''
const SFTP_PORT = process.env.OD_MOUNT_SFTP_PORT ?? '22'
const SFTP_USERNAME = process.env.OD_MOUNT_SFTP_USERNAME ?? ''
const SFTP_PASSWORD = process.env.OD_MOUNT_SFTP_PASSWORD ?? ''
const SFTP_REMOTE_DIR = (process.env.OD_MOUNT_SFTP_REMOTE_DIR ?? '').replace(/\/+$|\/+$/g, '')

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.webp', '.pdf'])
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

const OD_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `ODFHIR ${OD_DEV_KEY}/${OD_KEY}`,
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function sendBuffer(res, status, buffer, contentType, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': buffer.length,
    ...extraHeaders,
  })
  res.end(buffer)
}

function normalizeWindowsPath(input) {
  return input.replace(/\//g, '\\').trim()
}

function safeDescription(input) {
  const cleaned = input.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'mount'
}

function remoteFileName(mountNum, description) {
  return `${safeDescription(description)}-${mountNum}.jpg`
}

function mountConfigReady() {
  return !!(SFTP_HOST && SFTP_USERNAME && SFTP_PASSWORD && SFTP_REMOTE_DIR)
}

async function readRequestBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

async function fetchPatientMap() {
  try {
    const response = await fetch(`${OD_BASE}/patients`, { headers: OD_HEADERS })
    if (!response.ok) return {}
    const data = await response.json()
    if (!Array.isArray(data)) return {}
    return Object.fromEntries(data.map((patient) => [patient.PatNum, [patient.FName || patient.Preferred, patient.LName].filter(Boolean).join(' ')]))
  } catch {
    return {}
  }
}

async function enrichLiveResponse(endpoint, data) {
  if (endpoint === 'claims' || endpoint === 'appointments') {
    const patientMap = await fetchPatientMap()
    return data.map((item) => ({
      ...item,
      PatientName: patientMap[item.PatNum] ?? item.PatientName ?? null,
    }))
  }
  return data
}

async function handleOdProxy(req, res, url) {
  if (!OD_DEV_KEY || !OD_KEY) {
    sendJson(res, 503, { error: 'Open Dental API keys are not configured.' })
    return
  }

  const endpoint = url.pathname.replace(/^\/api\/od\//, '')
  const search = url.search || ''
  const targetUrl = `${OD_BASE}/${endpoint}${search}`

  const headers = { ...OD_HEADERS }
  const init = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await readRequestBody(req)
  }

  try {
    if (endpoint === 'procedurelogs' && req.method === 'GET' && url.searchParams.has('dateStart')) {
      const parsedUrl = new URL(targetUrl)
      const dateStart = parsedUrl.searchParams.get('dateStart')
      const dateEnd = parsedUrl.searchParams.get('dateEnd')
      let offset = 0
      const limit = 1000
      let keepFetching = true
      let allRows = []

      while (keepFetching) {
        parsedUrl.searchParams.set('Offset', String(offset))
        const pageRes = await fetch(parsedUrl.toString(), init)
        if (!pageRes.ok) {
          sendJson(res, pageRes.status, { error: await pageRes.text() || 'Open Dental error.' })
          return
        }
        const pageData = await pageRes.json()
        if (!Array.isArray(pageData) || pageData.length === 0) break

        const validRows = pageData.filter((row) => {
          if (!row.ProcDate || !dateStart || !dateEnd) return false
          return row.ProcDate >= dateStart && row.ProcDate <= dateEnd
        })
        allRows = allRows.concat(validRows)

        const lastRecordDate = pageData[pageData.length - 1]?.ProcDate
        if (pageData.length < limit || !dateStart || !lastRecordDate || lastRecordDate < dateStart) {
          keepFetching = false
        } else {
          offset += limit
        }
      }

      sendJson(res, 200, allRows)
      return
    }

    const odRes = await fetch(targetUrl, init)
    const contentType = odRes.headers.get('content-type') ?? 'application/json'

    if (odRes.ok && req.method === 'GET' && contentType.includes('application/json')) {
      const data = await odRes.json()
      const responseData = Array.isArray(data) ? await enrichLiveResponse(endpoint, data) : data
      sendJson(res, 200, responseData)
      return
    }

    const body = Buffer.from(await odRes.arrayBuffer())
    sendBuffer(res, odRes.status, body, contentType)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy failure.'
    sendJson(res, 503, { error: message })
  }
}

async function handleOdImage(res, url) {
  const rawPath = url.searchParams.get('path') ?? ''
  if (!rawPath) {
    sendJson(res, 400, { error: 'Missing path parameter.' })
    return
  }

  const filePath = normalizeWindowsPath(rawPath)
  const ext = path.extname(filePath).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    sendJson(res, 400, { error: 'Unsupported file type.' })
    return
  }

  try {
    await access(filePath)
    const data = await readFile(filePath)
    sendBuffer(res, 200, data, MIME_TYPES[ext] ?? 'application/octet-stream', { 'Cache-Control': 'private, max-age=300' })
  } catch {
    sendJson(res, 404, { error: 'Image file not accessible from this machine.' })
  }
}

async function handleOdMount(res, url) {
  const mountNum = url.searchParams.get('mountNum') ?? ''
  const description = url.searchParams.get('description') ?? 'mount'

  if (!mountNum) {
    sendJson(res, 400, { error: 'Missing mountNum parameter.' })
    return
  }

  if (!mountConfigReady()) {
    sendJson(res, 503, { error: 'OD mount export is not configured. Add OD_MOUNT_SFTP_* settings.' })
    return
  }

  if (!OD_DEV_KEY || !OD_KEY) {
    sendJson(res, 503, { error: 'Open Dental API keys are not configured.' })
    return
  }

  const fileName = remoteFileName(mountNum, description)
  const remotePath = `${SFTP_REMOTE_DIR}/${fileName}`
  const sftpAddress = `${SFTP_HOST}/${remotePath}`.replace(/([^:]\/)\/+/g, '$1')

  const exportRes = await fetch(`${OD_BASE}/documents/DownloadSftp`, {
    method: 'POST',
    headers: OD_HEADERS,
    body: JSON.stringify({
      MountNum: Number(mountNum),
      SftpAddress: sftpAddress,
      SftpUsername: SFTP_USERNAME,
      SftpPassword: SFTP_PASSWORD,
    }),
  })

  if (!exportRes.ok) {
    const message = await exportRes.text()
    sendJson(res, exportRes.status, { error: `Open Dental mount export failed: ${message || exportRes.statusText}` })
    return
  }

  const curlUrl = `sftp://${SFTP_HOST}:${SFTP_PORT}/${remotePath.replace(/^\/+/, '')}`
  try {
    const { stdout } = await execFileAsync('curl.exe', [
      '--silent',
      '--show-error',
      '--fail',
      '--user',
      `${SFTP_USERNAME}:${SFTP_PASSWORD}`,
      curlUrl,
    ], {
      encoding: 'buffer',
      maxBuffer: 25 * 1024 * 1024,
    })
    sendBuffer(res, 200, Buffer.from(stdout), 'image/jpeg', { 'Cache-Control': 'private, max-age=300' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SFTP download error.'
    sendJson(res, 502, { error: `Mount export succeeded, but the image could not be downloaded from SFTP: ${message}` })
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing request URL.' })
    return
  }

  const url = new URL(req.url, `http://${req.headers.host ?? `127.0.0.1:${PORT}`}`)

  if (url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (url.pathname.startsWith('/api/od/')) {
    await handleOdProxy(req, res, url)
    return
  }

  if (url.pathname === '/api/od-image') {
    await handleOdImage(res, url)
    return
  }

  if (url.pathname === '/api/od-mount') {
    await handleOdMount(res, url)
    return
  }

  sendJson(res, 404, { error: 'Not found.' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`dedicure-react API listening on http://127.0.0.1:${PORT}`)
})
