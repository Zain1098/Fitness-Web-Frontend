import { useEffect, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'

export default function SavedExercises(){
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(()=>{
    setLoading(true); setError('')
    api('/exercise-library', { token }).then(r=> setItems(r.items||[]) ).catch(e=> setError(e.message||'failed') ).finally(()=> setLoading(false))
  }, [token])
  const remove = async (id)=>{ await api('/exercise-library/'+id, { method:'DELETE', token }); setItems(items.filter(x=>x._id!==id)) }
  return (
    <>
      <DashboardNavbar />
      <section className="ff-section" id="saved-exercises">
        <div className="ff-container">
          <h2 className="ff-title">Saved Exercises</h2>
          {loading && <div className="ff-panel">Loading...</div>}
          {error && !loading && <div className="ff-panel">{error}</div>}
          <div className="ff-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            {items.map((ex)=> (
              <div key={ex._id} className="ff-card" style={{ display:'grid', gridTemplateColumns:'120px 1fr auto', gap:'10px', alignItems:'center' }}>
                <img src={ex.imageUrl||'/img/home/dumbells.png'} alt={ex.name} style={{ width:'120px', height:'80px', objectFit:'cover', borderRadius:'10px' }} />
                <div>
                  <div style={{color:'var(--ff-text)', fontWeight:700}}>{ex.name}</div>
                  <div style={{color:'var(--ff-muted)'}}>{ex.type} • {ex.target}</div>
                  <div style={{color:'var(--ff-muted)'}}>Equipment: {ex.equipment} • Level: {ex.difficulty}</div>
                </div>
                <button className="ff-btn" onClick={()=>remove(ex._id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}