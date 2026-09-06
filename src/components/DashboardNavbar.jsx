import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { api } from '@/api/client.js'
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  CalendarCheck2,
  TrendingUp,
  Settings,
  Bell,
  Crown,
  LogOut,
  User,
  CheckCheck,
  Flame
} from 'lucide-react'

export default function DashboardNavbar() {
  const { user, logout, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    const loadSubscription = async () => {
      if (!token) return
      try {
        const data = await api('/payment/subscription', { token })
        setSubscription(data)
      } catch (err) {}
    }
    loadSubscription()
  }, [token])

  const loadNotifications = async () => {
    if (!token) return
    try {
      const data = await api('/notifications', { token })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {}
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 120000)
    return () => clearInterval(interval)
  }, [token])

  const markAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT', token })
      loadNotifications()
    } catch (err) {}
  }

  const markAllAsRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT', token })
      loadNotifications()
    } catch (err) {}
  }

  const isActive = (to) => location.pathname === to

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/nutrition', label: 'Nutrition', icon: Apple },
    { to: '/tracker', label: 'Tracker', icon: CalendarCheck2 },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  const userInitial = user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {/* ----------------- DESKTOP FLOATING LEFT SIDEBAR ----------------- */}
      <aside className="hidden lg:flex fixed top-6 left-6 bottom-6 w-20 flex-col items-center justify-between py-6 rounded-[2.5rem] glass-panel border border-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.06)] z-40">
        {/* Brand Icon */}
        <Link
          to="/dashboard"
          className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
          title="FitForge Dashboard"
        >
          <Dumbbell className="w-6 h-6 text-[#D4F63D]" />
        </Link>

        {/* Center Navigation Icons */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-[#D4F63D] text-slate-950 font-bold shadow-sm scale-105'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -right-1 w-1.5 h-1.5 rounded-full bg-slate-950" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions: Notifications & Profile */}
        <div className="flex flex-col items-center gap-3 relative">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfileMenu(false)
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute 1.5 top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute left-16 bottom-0 w-80 rounded-3xl glass-panel p-4 shadow-2xl border border-white z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`p-3 rounded-2xl text-xs cursor-pointer transition-colors ${
                          n.read ? 'bg-transparent text-slate-500' : 'bg-slate-50 text-slate-900 font-semibold'
                        }`}
                      >
                        <div>{n.title || n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                setShowNotifications(false)
              }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform ring-2 ring-white"
              title={user?.username || 'Profile'}
            >
              {userInitial}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute left-16 bottom-0 w-56 rounded-3xl glass-panel p-3 shadow-2xl border border-white z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.username || user?.name || 'Athlete'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                </div>
                <div className="py-1 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/analytics"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Reports & Exports</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                      navigate('/')
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ----------------- MOBILE FLOATING BOTTOM BAR ----------------- */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 rounded-full glass-panel border border-white/90 shadow-2xl z-50 px-4 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`p-2.5 rounded-full transition-all ${
                active
                  ? 'bg-[#D4F63D] text-slate-950 font-bold scale-110 shadow-sm'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
        <Link
          to="/profile"
          className={`p-2.5 rounded-full transition-all ${
            isActive('/profile')
              ? 'bg-[#D4F63D] text-slate-950 font-bold scale-110 shadow-sm'
              : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
        </Link>
      </nav>
    </>
  )
}
