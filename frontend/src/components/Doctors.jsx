import { useState, useEffect } from 'react'

const API = 'http://localhost:8083/api/doctors'
const specialties = ['Kardiyoloji','Noroloji','Ortopedi','Dahiliye','Pediatri','Dermatoloji','Psikiyatri','Üroloji','Göz Hastalıkları','KBB']
const unvanlar = ['Uzm. Dr.','Prof. Dr.','Doç. Dr.','Op. Dr.','Dr.']
const empty = { name: '', surname: '', specialty: '', phone: '', email: '', available: true }

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAvailable, setFilterAvailable] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setDoctors(await fetch(API).then(r => r.json())) }
    catch { setDoctors([]) }
    setLoading(false)
  }

  async function save() {
    if (modal === 'add') {
      await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`${API}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setModal(null); load()
  }

  async function remove(id) {
    if (!confirm('Bu hekim kaydı silinecek. Onaylıyor musunuz?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' }); load()
  }

  function openAdd() { setForm(empty); setModal('add') }
  function openEdit(d) { setForm({...d}); setEditId(d.id); setModal('edit') }

  const filtered = doctors
    .filter(d => !filterAvailable || d.available)
    .filter(d => `${d.name} ${d.surname} ${d.specialty}`.toLowerCase().includes(search.toLowerCase()))

  const available = doctors.filter(d => d.available).length

  return (
    <>
      <div className="stats">
        <div className="stat-card blue"><div className="stat-icon-wrap blue">👨‍⚕️</div><div><div className="stat-label">Toplam Hekim</div><div className="stat-value">{doctors.length}</div></div></div>
        <div className="stat-card green"><div className="stat-icon-wrap green">✅</div><div><div className="stat-label">Müsait</div><div className="stat-value">{available}</div></div></div>
        <div className="stat-card red"><div className="stat-icon-wrap red">🔴</div><div><div className="stat-label">Meşgul</div><div className="stat-value">{doctors.length - available}</div></div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap orange">🏷️</div><div><div className="stat-label">Poliklinik</div><div className="stat-value">{new Set(doctors.map(d=>d.specialty)).size}</div></div></div>
      </div>

      <div className="section-header">
        <h2>Hekim Listesi</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Yeni Hekim Ekle</button>
      </div>
      <div className="toolbar">
        <input className="search-bar" placeholder="Ad, soyad veya poliklinik ile arayın..." value={search} onChange={e => setSearch(e.target.value)} />
        <label style={{display:'flex',alignItems:'center',gap:'.4rem',fontSize:'.82rem',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
          <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} />
          Sadece müsait
        </label>
      </div>

      <div className="card">
        {loading ? <div className="loading">Yükleniyor...</div> : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">👨‍⚕️</div>Hekim bulunamadı</div>
        ) : (
          <table>
            <thead><tr><th>Hekim</th><th>Poliklinik</th><th>Dahili / Telefon</th><th>E-posta</th><th>Durum</th><th>İşlem</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><strong>Uzm. Dr. {d.name} {d.surname}</strong></td>
                  <td><span className="badge badge-blue">{d.specialty} Polikliniği</span></td>
                  <td>{d.phone}</td>
                  <td style={{fontSize:'.78rem',color:'var(--muted)'}}>{d.email}</td>
                  <td><span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`}>{d.available ? '● Müsait' : '● Meşgul'}</span></td>
                  <td><div className="actions-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>Düzenle</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(d.id)}>Sil</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modal === 'add' ? '+ Yeni Hekim Kaydı' : 'Hekim Bilgilerini Güncelle'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Ad</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label>Soyad</label><input value={form.surname} onChange={e => setForm({...form,surname:e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Poliklinik / Uzmanlık</label>
                <select value={form.specialty} onChange={e => setForm({...form,specialty:e.target.value})}>
                  <option value="">Seçin</option>
                  {specialties.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Telefon / Dahili</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
                <div className="form-group"><label>E-posta</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Müsaitlik Durumu</label>
                <select value={String(form.available)} onChange={e => setForm({...form,available:e.target.value==='true'})}>
                  <option value="true">✅ Müsait — Randevu Alınabilir</option>
                  <option value="false">🔴 Meşgul — Randevu Alınamaz</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>İptal</button>
              <button className="btn btn-primary" onClick={save}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
