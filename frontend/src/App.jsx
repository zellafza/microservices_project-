import { useState, useEffect } from 'react'
import Patients from './components/Patients.jsx'
import Doctors from './components/Doctors.jsx'
import Appointments from './components/Appointments.jsx'
import Dashboard from './components/Dashboard.jsx'
import ActivityLogs from './components/ActivityLogs.jsx'

const NAV = [
  { section: 'Genel' },
  { id: 'dashboard',    label: 'Ana Ekran',            icon: '🏠' },
  { section: 'Hasta İşlemleri' },
  { id: 'patients',     label: 'Hasta Kayıt',          icon: '👤' },
  { id: 'appointments', label: 'Poliklinik Randevusu', icon: '📅' },
  { section: 'Personel' },
  { id: 'doctors',      label: 'Hekim Listesi',        icon: '👨‍⚕️' },
  { section: 'Sistem' },
  { id: 'logs',         label: 'Aktivite Logları',     icon: '📋' },
]

const PAGE_TITLES = {
  dashboard:    { title: 'Ana Ekran',            sub: 'Genel Bakış' },
  patients:     { title: 'Hasta Kayıt',          sub: 'Hasta İşlemleri › Hasta Kayıt' },
  appointments: { title: 'Poliklinik Randevusu', sub: 'Hasta İşlemleri › Randevu' },
  doctors:      { title: 'Hekim Listesi',        sub: 'Personel › Hekim Listesi' },
  logs:         { title: 'Aktivite Logları',     sub: 'Sistem › Aktivite Logları' },
}

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  const pad = n => String(n).padStart(2, '0')
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const date = now.toLocaleDateString('tr-TR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  return (
    <div className="topbar-clock">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const { title, sub } = PAGE_TITLES[tab]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>
          <div className="logo-text">
            <strong>MediSoft HBYS</strong>
            <span>Hastane Bilgi Sistemi</span>
          </div>
        </div>
        {NAV.map((item, i) =>
          item.section ? (
            <div className="sidebar-section" key={i}>
              <div className="sidebar-section-title">{item.section}</div>
            </div>
          ) : (
            <div key={item.id} className={`sidebar-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
              <span className="si-icon">{item.icon}</span>
              {item.label}
            </div>
          )
        )}
        <div className="sidebar-footer">
          <div className="avatar">YK</div>
          <div className="user-info">
            <strong>Yönetici Kullanıcı</strong>
            <span>Sistem Yöneticisi</span>
          </div>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <div className="page-title">{title}</div>
            <div className="page-sub">{sub}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">🏥 Merkez Hastane</span>
            <Clock />
          </div>
        </header>
        <main className="page">
          {tab === 'dashboard'    && <Dashboard onNavigate={setTab} />}
          {tab === 'patients'     && <Patients />}
          {tab === 'appointments' && <Appointments />}
          {tab === 'doctors'      && <Doctors />}
          {tab === 'logs'         && <ActivityLogs />}
        </main>
      </div>
    </div>
  )
}
