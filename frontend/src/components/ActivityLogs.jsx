import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:8085/logs'

const LEVEL_BADGE = {
  INFO:  'badge-blue',
  WARN:  'badge-yellow',
  ERROR: 'badge-red',
  DEBUG: 'badge-gray',
}

const SERVICE_BADGE = {
  'Patient Service':      'badge-green',
  'Doctor Service':       'badge-blue',
  'Appointment Service':  'badge-teal',
  'Activity Log Service': 'badge-gray',
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterService, setFilterService] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 3000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoRefresh])

  async function load() {
    try {
      const data = await fetch(API).then(r => r.json())
      setLogs(Array.isArray(data) ? data : [])
    } catch {
      setLogs([])
    }
    setLoading(false)
  }

  async function clearLogs() {
    if (!confirm('Tüm loglar silinecek. Onaylıyor musunuz?')) return
    await fetch(API, { method: 'DELETE' })
    load()
  }

  async function addTestLog() {
    const services = ['Patient Service', 'Doctor Service', 'Appointment Service']
    const messages = [
      'Test log kaydı oluşturuldu',
      'Servis bağlantısı kontrol edildi',
      'Performans ölçümü tamamlandı',
    ]
    const levels = ['INFO', 'INFO', 'INFO', 'WARN']
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: services[Math.floor(Math.random() * services.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        level:   levels[Math.floor(Math.random() * levels.length)],
      }),
    })
    load()
  }

  const services = [...new Set(logs.map(l => l.service))]

  const filtered = logs
    .filter(l => !filterService || l.service === filterService)
    .filter(l => !filterLevel   || l.level   === filterLevel)

  const infoCount  = logs.filter(l => l.level === 'INFO').length
  const warnCount  = logs.filter(l => l.level === 'WARN').length
  const errorCount = logs.filter(l => l.level === 'ERROR').length

  return (
    <>
      <div className="stats">
        <div className="stat-card blue">
          <div className="stat-icon-wrap blue">📋</div>
          <div><div className="stat-label">Toplam Log</div><div className="stat-value">{logs.length}</div></div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon-wrap green">ℹ️</div>
          <div><div className="stat-label">INFO</div><div className="stat-value">{infoCount}</div></div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-wrap orange">⚠️</div>
          <div><div className="stat-label">WARN</div><div className="stat-value">{warnCount}</div></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon-wrap red">🔴</div>
          <div><div className="stat-label">ERROR</div><div className="stat-value">{errorCount}</div></div>
        </div>
      </div>

      <div className="section-header">
        <h2>Aktivite Logları</h2>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Otomatik yenile (3s)
          </label>
          <button className="btn btn-ghost" onClick={load}>🔄 Yenile</button>
          <button className="btn btn-ghost" onClick={addTestLog}>+ Test Log</button>
          <button className="btn btn-danger" onClick={clearLogs}>🗑 Temizle</button>
        </div>
      </div>

      <div className="toolbar">
        <select className="search-bar" style={{ flex: 'none', width: 'auto', minWidth: 180 }}
          value={filterService} onChange={e => setFilterService(e.target.value)}>
          <option value="">Tüm Servisler</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="search-bar" style={{ flex: 'none', width: 'auto', minWidth: 130 }}
          value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">Tüm Seviyeler</option>
          {['INFO','WARN','ERROR','DEBUG'].map(l => <option key={l}>{l}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: '.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          {autoRefresh && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>● CANLI</span>}
          {filtered.length} kayıt gösteriliyor
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loglar yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">📋</div>Log kaydı bulunamadı</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th style={{ width: 160 }}>Zaman</th>
                <th style={{ width: 170 }}>Servis</th>
                <th style={{ width: 80 }}>Seviye</th>
                <th>Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{l.id}</td>
                  <td>
                    <code style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{l.time}</code>
                  </td>
                  <td>
                    <span className={`badge ${SERVICE_BADGE[l.service] || 'badge-gray'}`}>
                      {l.service}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${LEVEL_BADGE[l.level] || 'badge-gray'}`}>
                      {l.level}
                    </span>
                  </td>
                  <td style={{ fontSize: '.83rem' }}>{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '.75rem', fontSize: '.75rem', color: 'var(--muted)', textAlign: 'right' }}>
        ⚡ Powered by <strong>Vert.x 4.5.1</strong> — Reaktif & Asenkron
      </div>
    </>
  )
}
