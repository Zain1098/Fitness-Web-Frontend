import { useAuth } from '../context/AuthContext.jsx'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { API_BASE_URL } from '../config/api.js'

export default function Reports(){
  const { token, user } = useAuth()
  if(!user) return null
  const download = ()=>{ window.open(API_BASE_URL + '/reports/workouts.csv', '_blank') }
  return (
    <>
    <DashboardNavbar />
    <section className="ff-section" id="reports">
      <div className="ff-container">
        <h2 className="ff-title">Reports</h2>
        <div className="ff-panel" style={{padding:'24px'}}>
          <a className="ff-btn" onClick={download}>Download Workouts CSV</a>
        </div>
      </div>
    </section>
    </>
  )
}