import { useState, useEffect } from 'react'

const AAPI = 'http://localhost:8082/api/appointments'
const PAPI = 'http://localhost:8081/api/patients'
const DAPI = 'http://localhost:8083/api/doctors'

const statuses = ['BEKLIYOR','TAMAMLANDI','IPTAL']
const HOURS = Array.from({length:11},(_,i)=>`${String(i+8).padStart(2,'0')}:00`)
const MUAYENE_TURLERI = ['İlk Muayene','Kontrol','Konsültasyon','Acil','Takip','Diğer']
const empty = { patientId:'', doctorId:'', apptDate:'', apptTime:'', description:'', muayeneTuru:'İlk Muayene', status:'BEKLIYOR' }
const pad = n => String(n).padStart(6,'0')

function splitDate(s) {
  if (!s) return { apptDate:'', apptTime:'' }
  const [d,t] = s.split(' ')
  return { apptDate: d||'', apptTime: t ? t.slice(0,5) : '' }
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [a,p,d] = await Promise.all([
        fetch(AAPI).then(r=>r.json()),
        fetch(PAPI).then(r=>r.json()),
        fetch(DAPI).then(r=>r.json()),
      ])
      setAppointments(Array.isArray(a)?a:[])
      setPatients(Array.isArray(p)?p:[])
      setDoctors(Array.isArray(d)?d:[])
    } catch {}
    setLoading(false)
  }

  async function save() {
    const body = { ...form, patientId:Number(form.patientId), doctorId:Number(form.doctorId), appointmentDate:`${form.apptDate} ${form.apptTime}` }
    if (modal==='add') {
      await fetch(AAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    } else {
      await fetch(`${AAPI}/${editId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    }
    setModal(null); loadAll()
  }

  async function remove(id) {
    if (!confirm('Bu randevu kaydı silinecek. Onaylıyor musunuz?')) return
    await fetch(`${AAPI}/${id}`,{method:'DELETE'}); loadAll()
  }

  function openAdd() { setForm(empty); setModal('add') }
  function openEdit(a) {
    const {apptDate,apptTime} = splitDate(a.appointmentDate)
    setForm({patientId:String(a.patientId),doctorId:String(a.doctorId),apptDate,apptTime,description:a.description||'',muayeneTuru:a.muayeneTuru||'İlk Muayene',status:a.status})
    setEditId(a.id); setModal('edit')
  }

  const patientName = id => { const p=patients.find(p=>p.id===id); return p?`${p.name} ${p.surname}`:`Hasta #${id}` }
  const patientProto = id => { const p=patients.find(p=>p.id===id); return p?`P-${pad(p.id)}`:'' }
  const doctorName  = id => { const d=doctors.find(d=>d.id===id); return d?`Uzm. Dr. ${d.name} ${d.surname}`:`Hekim #${id}` }
  const doctorSpec  = id => { const d=doctors.find(d=>d.id===id); return d?`${d.specialty} Pol.`:'' }
  const badgeClass  = s  => s==='TAMAMLANDI'?'badge-green':s==='IPTAL'?'badge-red':'badge-yellow'

  const filtered   = appointments.filter(a=>!filterStatus||a.status===filterStatus)
  const bekliyor   = appointments.filter(a=>a.status==='BEKLIYOR').length
  const tamamlandi = appointments.filter(a=>a.status==='TAMAMLANDI').length
  const iptal      = appointments.filter(a=>a.status==='IPTAL').length

  return (
    <>
      <div className="stats">
        <div className="stat-card blue"><div className="stat-icon-wrap blue">📅</div><div><div className="stat-label">Toplam Randevu</div><div className="stat-value">{appointments.length}</div></div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap orange">⏳</div><div><div className="stat-label">Bekleyen</div><div className="stat-value">{bekliyor}</div></div></div>
        <div className="stat-card green"><div className="stat-icon-wrap green">✅</div><div><div className="stat-label">Tamamlanan</div><div className="stat-value">{tamamlandi}</div></div></div>
        <div className="stat-card red"><div className="stat-icon-wrap red">❌</div><div><div className="stat-label">İptal</div><div className="stat-value">{iptal}</div></div></div>
      </div>

      <div className="section-header">
        <h2>Poliklinik Randevu Listesi</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Yeni Randevu</button>
      </div>

      <div className="toolbar">
        {['','BEKLIYOR','TAMAMLANDI','IPTAL'].map(s=>(
          <button key={s} className={`btn ${filterStatus===s?'btn-primary':'btn-ghost'}`} onClick={()=>setFilterStatus(s)}>
            {s||'Tümü'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading">Randevular yükleniyor...</div> : filtered.length===0 ? (
          <div className="empty"><div className="empty-icon">📅</div>Randevu kaydı bulunamadı</div>
        ) : (
          <table>
            <thead><tr><th>Hasta</th><th>Protokol</th><th>Hekim</th><th>Poliklinik</th><th>Randevu Tarihi</th><th>Saat</th><th>Muayene Türü</th><th>Durum</th><th>İşlem</th></tr></thead>
            <tbody>
              {filtered.map(a=>{
                const [d,t] = (a.appointmentDate||'').split(' ')
                return (
                  <tr key={a.id}>
                    <td><strong>{patientName(a.patientId)}</strong></td>
                    <td><span className="proto">{patientProto(a.patientId)}</span></td>
                    <td>{doctorName(a.doctorId)}</td>
                    <td><span className="badge badge-teal">{doctorSpec(a.doctorId)}</span></td>
                    <td>{d||'—'}</td>
                    <td><strong>{t||'—'}</strong></td>
                    <td><span className="badge badge-gray">{a.muayeneTuru||'—'}</span></td>
                    <td><span className={`badge ${badgeClass(a.status)}`}>{a.status}</span></td>
                    <td><div className="actions-cell">
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(a)}>Düzenle</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>remove(a.id)}>Sil</button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modal==='add'?'+ Yeni Randevu Kaydı':'Randevu Bilgilerini Güncelle'}</h3>
              <button className="modal-close" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Hasta</label>
                <select value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
                  <option value="">Hasta seçin</option>
                  {patients.map(p=><option key={p.id} value={p.id}>P-{pad(p.id)} — {p.name} {p.surname} ({p.tcNo})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Hekim / Poliklinik</label>
                <select value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}>
                  <option value="">Hekim seçin</option>
                  {doctors.map(d=>(
                    <option key={d.id} value={d.id}>
                      Uzm. Dr. {d.name} {d.surname} — {d.specialty} {d.available?'✓':'✗'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Muayene Türü</label>
                <select value={form.muayeneTuru} onChange={e=>setForm({...form,muayeneTuru:e.target.value})}>
                  {MUAYENE_TURLERI.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Randevu Tarihi</label>
                  <input type="date" value={form.apptDate} onChange={e=>setForm({...form,apptDate:e.target.value})} />
                </div>
                <div className="form-group"><label>Randevu Saati</label>
                  <select value={form.apptTime} onChange={e=>setForm({...form,apptTime:e.target.value})}>
                    <option value="">Saat seçin</option>
                    {HOURS.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Açıklama / Şikayet</label>
                <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Hasta şikayeti veya randevu açıklaması" />
              </div>
              {modal==='edit' && (
                <div className="form-group"><label>Randevu Durumu</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="BEKLIYOR">⏳ Bekliyor</option>
                    <option value="TAMAMLANDI">✅ Tamamlandı</option>
                    <option value="IPTAL">❌ İptal Edildi</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>İptal</button>
              <button className="btn btn-primary" onClick={save}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
