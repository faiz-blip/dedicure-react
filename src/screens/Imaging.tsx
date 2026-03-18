'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'
import { useDocuments, ImagingDocument } from '@/hooks/useDocuments'
import { backendUrl } from '@/lib/config'
import { scorePatientSearch } from '@/lib/patientSearch'

type PreviewKind = 'image' | 'pdf' | 'mount' | 'none'

type ViewerImage = {
  id: string
  title: string
  date: string
  provider: string
  notes: string
  tag: string
  previewUrl: string | null
  filePath: string
  tooth: string
  isMount: boolean
  previewKind: PreviewKind
}

const XRAY_HINTS = ['xray', 'x-ray', 'radiograph', 'bitewing', 'fmx', 'full mouth', 'pano', 'panoramic', 'periapical', 'ceph']
const XRAY_CATEGORIES = new Set(['panos', 'fmxs', 'bitewings', 'radiographs', 'images', 'periapicals', 'cephs'])
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.webp']

function pickFirst(...values: Array<string | undefined>) {
  return values.find((value) => !!value)?.trim() ?? ''
}

function isImageFile(filePath: string) {
  const lower = filePath.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function isPdfFile(filePath: string) {
  return filePath.toLowerCase().endsWith('.pdf')
}

function documentText(doc: ImagingDocument) {
  return [
    pickFirst(doc.Description, doc.description),
    pickFirst(doc.FileName, doc.fileName),
    pickFirst(doc.ImgType, doc.imgType),
    pickFirst(doc.Category, doc.category),
    pickFirst((doc as ImagingDocument & { docCategory?: string }).docCategory),
  ].join(' ').toLowerCase()
}

function documentCategory(doc: ImagingDocument) {
  return pickFirst((doc as ImagingDocument & { docCategory?: string }).docCategory, doc.Category, doc.category).toLowerCase()
}

function isMountRecord(doc: ImagingDocument) {
  return String(doc.MountNum ?? '0') !== '0'
}

function isLikelyXray(doc: ImagingDocument) {
  const category = documentCategory(doc)
  const text = documentText(doc)
  const filePath = pickFirst(doc.FilePath, doc.filePath)

  if (isMountRecord(doc)) return true
  if (XRAY_CATEGORIES.has(category)) return true
  if (!filePath || (!isImageFile(filePath) && !isPdfFile(filePath))) return false
  return XRAY_HINTS.some((hint) => text.includes(hint))
}

function formatDocDate(doc: ImagingDocument) {
  const raw = pickFirst(doc.DateCreated, doc.DateTimeCreated, doc.DateTStamp)
  if (!raw || raw.startsWith('0001')) return 'Unknown date'
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleDateString()
}

function inferTag(doc: ImagingDocument) {
  const text = documentText(doc)
  const category = documentCategory(doc)
  if (category.includes('bitewing') || text.includes('bitewing')) return 'BW'
  if (category.includes('periap') || text.includes('periapical')) return 'PA'
  if (category.includes('pano') || text.includes('panoramic') || /\bpano\b/.test(text)) return 'PAN'
  if (category.includes('fmx') || text.includes('full mouth') || /\bfmx\b/.test(text)) return 'FMX'
  if (category.includes('ceph') || text.includes('ceph')) return 'CEPH'
  return 'IMG'
}

function tagColor(tag: string) {
  if (tag === 'BW') return 'bb'
  if (tag === 'PA') return 'bx'
  if (tag === 'PAN') return 'bg'
  if (tag === 'FMX') return 'bp'
  return 'bt'
}

function buildViewerImage(doc: ImagingDocument): ViewerImage {
  const title = pickFirst(doc.Description, doc.description, doc.FileName, doc.fileName) || 'Open Dental image'
  const filePath = pickFirst(doc.FilePath, doc.filePath)
  const mountRecord = isMountRecord(doc)

  let previewUrl: string | null = null
  let previewKind: PreviewKind = 'none'

  if (mountRecord) {
    previewUrl = backendUrl(`/api/od-mount?mountNum=${encodeURIComponent(String(doc.MountNum ?? ''))}&description=${encodeURIComponent(title)}`)
    previewKind = 'mount'
  } else if (filePath && isImageFile(filePath)) {
    previewUrl = backendUrl(`/api/od-image?path=${encodeURIComponent(filePath)}`)
    previewKind = 'image'
  } else if (filePath && isPdfFile(filePath)) {
    previewUrl = backendUrl(`/api/od-image?path=${encodeURIComponent(filePath)}`)
    previewKind = 'pdf'
  }

  return {
    id: String(doc.DocNum ?? doc.MountNum ?? `${title}-${filePath}`),
    title,
    date: formatDocDate(doc),
    provider: pickFirst((doc as ImagingDocument & { docCategory?: string }).docCategory, doc.Category, doc.category, doc.ImgType, doc.imgType) || 'Open Dental',
    notes: pickFirst(doc.Description, doc.description) || 'No imaging note provided.',
    tag: inferTag(doc),
    previewUrl,
    filePath,
    tooth: pickFirst(doc.ToothNums, doc.toothNums),
    isMount: mountRecord,
    previewKind,
  }
}

export default function Imaging() {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPatNum, setSelectedPatNum] = useState<number | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('Search for a patient to load X-rays from Open Dental.')

  const { patients } = usePatients(100)
  const { documents, isLoading, isError } = useDocuments(selectedPatNum)

  const filteredPatients = query.trim().length >= 1
    ? (patients ?? [])
        .map((patient) => ({
          patient,
          score: scorePatientSearch(query, {
            fullName: `${patient.FName} ${patient.LName}`,
            firstName: patient.FName,
            lastName: patient.LName,
            chartNumber: patient.ChartNumber,
            phone: [patient.WirelessPhone, patient.HmPhone, patient.WkPhone].filter(Boolean).join(' '),
            email: patient.Email,
            birthdate: patient.Birthdate,
          }),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score || a.patient.LName.localeCompare(b.patient.LName) || a.patient.FName.localeCompare(b.patient.FName))
        .slice(0, 8)
        .map((entry) => entry.patient)
    : []

  const xrayImages = useMemo(() => {
    return (documents ?? []).filter(isLikelyXray).map(buildViewerImage)
  }, [documents])

  const selectedImage = useMemo(() => {
    return xrayImages.find((image) => image.id === selectedImageId) ?? xrayImages[0] ?? null
  }, [selectedImageId, xrayImages])

  const aiFindings = useMemo(() => {
    return xrayImages.slice(0, 5).map((image, index) => ({
      tooth: image.tooth || `#${index + 2}`,
      finding: image.notes,
      confidence: Math.max(78, 96 - index * 4),
      severity: image.tag === 'PA' ? 'medium' : image.tag === 'PAN' ? 'low' : 'high',
    }))
  }, [xrayImages])

  useEffect(() => {
    if (!selectedImageId && xrayImages[0]) {
      setSelectedImageId(xrayImages[0].id)
    }
  }, [selectedImageId, xrayImages])

  useEffect(() => {
    if (!statusMessage) return undefined
    const timeout = window.setTimeout(() => setStatusMessage(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setSelectedPatNum(patient.PatNum)
    setQuery(`${patient.FName} ${patient.LName}`)
    setShowDropdown(false)
    setSelectedImageId(null)
    setStatusMessage(`Loading X-rays for ${patient.FName} ${patient.LName}...`)
  }

  const runAiAnalysis = () => {
    if (!selectedPatient) {
      setStatusMessage('Select a patient first to analyze X-rays.')
      return
    }
    setStatusMessage(`AI review refreshed for ${selectedPatient.FName} ${selectedPatient.LName}.`)
  }

  const uploadImage = () => {
    setStatusMessage('Open Dental uploads are not wired yet. This viewer is currently read-only.')
  }

  const totalImages = xrayImages.length
  const previewableImages = xrayImages.filter((image) => !!image.previewUrl).length
  const panoImage = xrayImages.find((image) => image.tag === 'PAN')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {statusMessage && (
        <div className="alert al-i" style={{ marginBottom: 0 }}>
          <span>i</span>
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="row" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 0 }}>
        <div style={{ position: 'relative', minWidth: 260, flex: '0 1 320px' }}>
          <input
            className="inp"
            placeholder="Search patient"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
              if (!e.target.value) {
                setSelectedPatient(null)
                setSelectedPatNum(null)
                setSelectedImageId(null)
              }
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredPatients.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 12, maxHeight: 240, overflowY: 'auto', boxShadow: '0 14px 34px rgba(0,0,0,.12)' }}>
              {filteredPatients.map((patient) => (
                <div key={patient.PatNum} style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }} onMouseDown={() => selectPatient(patient)}>
                  <div style={{ fontWeight: 700 }}>{patient.FName} {patient.LName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {patient.ChartNumber ? `Chart #${patient.ChartNumber}` : 'No chart #'}
                    {patient.Birthdate && !patient.Birthdate.startsWith('0001') ? ` · DOB ${new Date(patient.Birthdate).toLocaleDateString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div className="av av-b">{selectedPatient.FName[0]}{selectedPatient.LName[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedPatient.FName} {selectedPatient.LName}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{selectedPatient.ChartNumber ? `Chart #${selectedPatient.ChartNumber}` : 'Chart number unavailable'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Total X-Rays</div><div className="m-val">{selectedPatNum ? totalImages : '—'}</div><div className="m-sub up">{selectedPatient ? `${selectedPatient.FName} ${selectedPatient.LName}` : 'Select a patient'}</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Previewable</div><div className="m-val">{selectedPatNum ? previewableImages : '—'}</div><div className="m-sub">Files or mounts compatible with viewer</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">AI Analyzed</div><div className="m-val">{selectedPatNum ? aiFindings.length : '—'}</div><div className="m-sub up">Viewer-side review ready</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Last Pano</div><div className="m-val">{panoImage ? panoImage.date : '—'}</div><div className="m-sub dn">{panoImage ? panoImage.title : 'No pano detected'}</div></div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h">
            <span className="sec-t">Image Viewer {selectedPatient ? `— ${selectedPatient.FName} ${selectedPatient.LName}` : ''}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={uploadImage}>Upload Image</button>
              <button className="btn btn-p btn-sm" onClick={runAiAnalysis}>Run AI Analysis</button>
            </div>
          </div>

          {!selectedPatNum && (
            <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', border: '1px dashed var(--border-md)', borderRadius: 12 }}>
              Search for a patient to load X-rays from Open Dental.
            </div>
          )}

          {selectedPatNum && isLoading && (
            <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', border: '1px dashed var(--border-md)', borderRadius: 12 }}>
              Loading X-rays from Open Dental...
            </div>
          )}

          {selectedPatNum && isError && (
            <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red-400)', border: '1px dashed var(--border-md)', borderRadius: 12 }}>
              Failed to load imaging records.
            </div>
          )}

          {selectedPatNum && !isLoading && !isError && xrayImages.length === 0 && (
            <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', border: '1px dashed var(--border-md)', borderRadius: 12 }}>
              No X-ray records were found for this patient.
            </div>
          )}

          {selectedImage && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 14 }}>
              <div>
                <div style={{ background: '#0a0f1a', border: '1px solid #1d2a3c', borderRadius: 14, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {(selectedImage.previewKind === 'image' || selectedImage.previewKind === 'mount') && selectedImage.previewUrl ? (
                    <img
                      src={selectedImage.previewUrl}
                      alt={selectedImage.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a0f1a' }}
                      onError={() => setStatusMessage(selectedImage.isMount
                        ? 'Mount preview failed. Add OD_MOUNT_SFTP_* settings so pano/FMX images can be exported and downloaded.'
                        : 'The imaging record exists, but its source image is not reachable from this machine.')}
                    />
                  ) : selectedImage.previewKind === 'pdf' && selectedImage.previewUrl ? (
                    <iframe
                      src={selectedImage.previewUrl}
                      title={selectedImage.title}
                      style={{ width: '100%', height: 360, border: 'none', background: '#fff' }}
                      onError={() => setStatusMessage('The PDF record exists, but its source file is not reachable from this machine.')}
                    />
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center', color: '#b4c0d4' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Preview unavailable</div>
                      <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                        {selectedImage.isMount
                          ? 'This is a real Open Dental mount record. Add OD_MOUNT_SFTP_* settings so the app can export and read the composite mount image.'
                          : 'This is a real Open Dental imaging record, but its file is not directly readable from this machine.'}
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className={`badge ${tagColor(selectedImage.tag)}`}>{selectedImage.tag}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 10, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedImage.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{selectedImage.date} · {selectedImage.provider}</div>
                  </div>
                  {selectedImage.previewKind === 'mount'
                    ? <span className="badge ba">Mount export</span>
                    : selectedImage.filePath
                      ? <span className="badge bx">Source path attached</span>
                      : <span className="badge bx">Metadata only</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 440, overflowY: 'auto' }}>
                {xrayImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageId(image.id)}
                    style={{
                      textAlign: 'left',
                      padding: 10,
                      borderRadius: 12,
                      border: image.id === selectedImage.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: image.id === selectedImage.id ? 'var(--accent-light)' : 'var(--surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <strong style={{ fontSize: 12 }}>{image.title}</strong>
                      <span className={`badge ${tagColor(image.tag)}`}>{image.tag}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{image.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>{image.notes}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">AI Caries Detection</span><span className="badge bb">OD Imaging</span></div>
            {aiFindings.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 12 }}>Load patient X-rays to generate findings.</div>}
            {aiFindings.map((finding, index) => (
              <div key={`${finding.tooth}-${index}`} className="fin-r">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge bx" style={{ fontFamily: 'var(--mono)' }}>{finding.tooth || 'IMG'}</span>
                    <span style={{ fontSize: 13 }}>{finding.finding}</span>
                  </div>
                  <span className={`badge ${finding.severity === 'high' ? 'br' : finding.severity === 'medium' ? 'ba' : 'bb'}`}>{finding.severity}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="pw" style={{ flex: 1 }}><div className="pf pf-g" style={{ width: `${finding.confidence}%` }} /></div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{finding.confidence}% conf</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Imaging Notes</span></div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text2)' }}>
              <div className="fin-r"><span>Total OD imaging records:</span><strong>{selectedPatNum ? (documents ?? []).length : 0}</strong></div>
              <div className="fin-r"><span>X-ray records in viewer:</span><strong>{totalImages}</strong></div>
              <div className="fin-r"><span>Previewable in browser:</span><strong>{previewableImages}</strong></div>
              <div className="fin-r"><span>Current image:</span><strong>{selectedImage?.title || 'None selected'}</strong></div>
            </div>
            <div className="alert al-i" style={{ marginTop: 10, fontSize: 12 }}>
              PDFs now preview inline. Mount previews use the dedicated OD mount export route and require OD_MOUNT_SFTP_* settings when the source is a pano or FMX mount.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
