import { useState, useEffect } from 'react'

const API = 'http://localhost:8081/api/patients'
const empty = { name: '', surname: '', tcNo: '', phone: '', email: '', age: '', bloodType: '', gender: '' }
const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','0+','0-']
const pad = n => String(n).padStart(6, '0')

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setPatients(await fetch(API).then(r => r.json())) }
    catch { setPatients([]) }
    setLoading(false)
  }

  async function save() {
    const body = { ...form, age: Number(form.age) }
    if (modal === 'add') {
      await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setModal(null); load()
  }

  async function remove(id) {
    if (!confirm('Bu hasta kaydı silinecek. Onaylıyor musunuz?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' }); load()
  }

  function openAdd() { setForm(empty); setModal('add') }
  function openEdit(p) { setForm({ ...p, age: String(p.age) }); setEditId(p.id); setModal('edit') }

  const filtered = patients.filter(p =>
    `${p.name} ${p.surname} ${p.tcNo} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="stats">
        <div className="stat-card blue"><div className="stat-icon-wrap blue">👥</div><div><div className="stat-label">Toplam Kayıt</div><div className="stat-value">{patients.length}</div></div></div>
        <div className="stat-card green"><div className="stat-icon-wrap green">🔍</div><div><div className="stat-label">Filtrelenen</div><div className="stat-value">{filtered.length}</div></div></div>
        <div className="stat-card red"><div className="stat-icon-wrap red">🩸</div><div><div className="stat-label">Kan Grubu Çeşidi</div><div className="stat-value">{new Set(patients.map(p=>p.bloodType).filter(Boolean)).size}</div></div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap orange">📊</div><div><div className="stat-label">Ortalama Yaş</div><div className="stat-value">{patients.length ? Math.round(patients.reduce((s,p)=>s+p.age,0)/patients.length) : '—'}</div></div></div>
      </div>

      <div className="section-header">
        <h2>Hasta Kayıt Listesi</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Yeni Hasta Kaydı</button>
      </div>
      <div className="toolbar">
        <input className="search-bar" placeholder="TC Kimlik No, ad soyad veya e-posta ile arayın..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <div className="loading">Kayıtlar yükleniyor...</div> : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">👤</div>Hasta kaydı bulunamadı</div>
        ) : (
          <table>
            <thead><tr><th>Protokol No</th><th>Ad Soyad</th><th>TC Kimlik No</th><th>Yaş</th><th>Kan Gr.</th><th>Telefon</th><th>E-posta</th><th>İşlem</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="proto">P-{pad(p.id)}</span></td>
                  <td><strong>{p.name} {p.surname}</strong></td>
                  <td><code style={{fontSize:'.8rem',letterSpacing:'1px'}}>{p.tcNo}</code></td>
                  <td>{p.age}</td>
                  <td><span className="badge badge-red">{p.bloodType||'—'}</span></td>
                  <td>{p.phone}</td>
                  <td style={{fontSize:'.78rem',color:'var(--muted)'}}>{p.email}</td>
                  <td><div className="actions-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Düzenle</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Sil</button>
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
              <h3>{modal === 'add' ? '+ Yeni Hasta Kaydı' : 'Hasta Bilgilerini Güncelle'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>TC Kimlik No</label><input value={form.tcNo} onChange={e => setForm({...form,tcNo:e.target.value})} placeholder="11 haneli TC Kimlik No" maxLength={11} /></div>
              <div className="form-row">
                <div className="form-group"><label>Ad</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label>Soyad</label><input value={form.surname} onChange={e => setForm({...form,surname:e.target.value})} /></div>
              </div>
              <div className="form-row-3">
                <div className="form-group"><label>Yaş</label><input type="number" value={form.age} onChange={e => setForm({...form,age:e.target.value})} /></div>
                <div className="form-group"><label>Cinsiyet</label>
                  <select value={form.gender||''} onChange={e => setForm({...form,gender:e.target.value})}>
                    <option value="">Seçin</option>
                    <option>Erkek</option><option>Kadın</option>
                  </select>
                </div>
                <div className="form-group"><label>Kan Grubu</label>
                  <select value={form.bloodType} onChange={e => setForm({...form,bloodType:e.target.value})}>
                    <option value="">Seçin</option>
                    {bloodTypes.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Telefon</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="0555 000 00 00" /></div>
                <div className="form-group"><label>E-posta</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
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
