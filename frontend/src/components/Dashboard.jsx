import { useState, useEffect } from 'react'

const PAPI = 'http://localhost:8081/api/patients'
const AAPI = 'http://localhost:8082/api/appointments'
const DAPI = 'http://localhost:8083/api/doctors'

export default function Dashboard({ onNavigate }) {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    fetch(PAPI).then(r => r.json()).then(setPatients).catch(() => {})
    fetch(AAPI).then(r => r.json()).then(setAppointments).catch(() => {})
    fetch(DAPI).then(r => r.json()).then(setDoctors).catch(() => {})
  }, [])

  const bekliyor   = appointments.filter(a => a.status === 'BEKLIYOR').length
  const tamamlandi = appointments.filter(a => a.status === 'TAMAMLANDI').length
  const musait     = doctors.filter(d => d.available).length

  const sonHastalar = [...patients].reverse().slice(0, 5)
  const sonRandevular = [...appointments].reverse().slice(0, 5)

  const statusDot = s => s === 'TAMAMLANDI' ? 'green' : s === 'IPTAL' ? 'red' : 'blue'
  const badgeClass = s => s === 'TAMAMLANDI' ? 'badge-green' : s === 'IPTAL' ? 'badge-red' : 'badge-yellow'

  return (
    <>
      {/* İstatistikler */}
      <div className="stats">
        <div className="stat-card blue" onClick={() => onNavigate('patients')} style={{cursor:'pointer'}}>
          <div className="stat-icon-wrap blue">👤</div>
          <div>
            <div className="stat-label">Toplam Hasta</div>
            <div className="stat-value">{patients.length}</div>
          </div>
        </div>
        <div className="stat-card orange" onClick={() => onNavigate('appointments')} style={{cursor:'pointer'}}>
          <div className="stat-icon-wrap orange">📅</div>
          <div>
            <div className="stat-label">Bekleyen Randevu</div>
            <div className="stat-value">{bekliyor}</div>
          </div>
        </div>
        <div className="stat-card green" onClick={() => onNavigate('appointments')} style={{cursor:'pointer'}}>
          <div className="stat-icon-wrap green">✅</div>
          <div>
            <div className="stat-label">Tamamlanan</div>
            <div className="stat-value">{tamamlandi}</div>
          </div>
        </div>
        <div className="stat-card blue" onClick={() => onNavigate('doctors')} style={{cursor:'pointer'}}>
          <div className="stat-icon-wrap blue">👨‍⚕️</div>
          <div>
            <div className="stat-label">Müsait Hekim</div>
            <div className="stat-value">{musait}</div>
          </div>
        </div>
      </div>

      {/* Alt grid */}
      <div className="dash-grid">
        {/* Son Kayıtlı Hastalar */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>👤 Son Kayıtlı Hastalar</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('patients')}>Tümü →</button>
          </div>
          <div className="dash-card-body">
            {sonHastalar.length === 0
              ? <div className="empty"><div className="empty-icon">👤</div>Kayıtlı hasta yok</div>
              : sonHastalar.map(p => (
                <div className="activity-item" key={p.id}>
                  <div className="activity-dot blue" />
                  <div className="activity-text">
                    <strong>{p.name} {p.surname}</strong>
                    <span style={{color:'var(--muted)', fontSize:'.75rem', marginLeft:'.5rem'}}>{p.tcNo}</span>
                  </div>
                  <span className="badge badge-gray activity-time">{p.bloodType || '—'}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Son Randevular */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>📅 Son Randevular</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('appointments')}>Tümü →</button>
          </div>
          <div className="dash-card-body">
            {sonRandevular.length === 0
              ? <div className="empty"><div className="empty-icon">📅</div>Randevu yok</div>
              : sonRandevular.map(a => (
                <div className="activity-item" key={a.id}>
                  <div className={`activity-dot ${statusDot(a.status)}`} />
                  <div className="activity-text">
                    <strong>Hasta #{a.patientId}</strong>
                    <span style={{color:'var(--muted)', fontSize:'.75rem', marginLeft:'.5rem'}}>→ Hekim #{a.doctorId}</span>
                  </div>
                  <span className={`badge ${badgeClass(a.status)} activity-time`}>{a.status}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Hekim Durumu */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>👨‍⚕️ Hekim Durumu</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('doctors')}>Tümü →</button>
          </div>
          <div className="dash-card-body">
            {doctors.slice(0, 5).map(d => (
              <div className="activity-item" key={d.id}>
                <div className={`activity-dot ${d.available ? 'green' : 'red'}`} />
                <div className="activity-text">
                  <strong>Dr. {d.name} {d.surname}</strong>
                </div>
                <span className={`badge ${d.available ? 'badge-teal' : 'badge-red'} activity-time`}>
                  {d.specialty}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sistem Bilgisi */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>⚙️ Sistem Bilgisi</h4>
          </div>
          <div className="dash-card-body">
            {[
              { label: 'Hasta Servisi',   val: 'Spring Boot 3.2',  ok: true },
              { label: 'Randevu Servisi', val: 'Spark Java 2.9.4', ok: true },
              { label: 'Hekim Servisi',   val: 'Dropwizard 2.1.6', ok: true },
              { label: 'Arayüz',          val: 'React + Nginx',    ok: true },
              { label: 'Veritabanı',      val: 'H2 (In-Memory)',   ok: true },
              { label: 'Konteyner',       val: 'Docker Compose',   ok: true },
            ].map(({ label, val, ok }) => (
              <div className="activity-item" key={label}>
                <div className={`activity-dot ${ok ? 'green' : 'red'}`} />
                <div className="activity-text" style={{color:'var(--muted)', fontSize:'.78rem'}}>{label}</div>
                <span className={`badge ${ok ? 'badge-green' : 'badge-red'} activity-time`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
