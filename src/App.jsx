import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from './config/api.js'
import ToastContainer from './components/Toast.jsx'
import './App.css'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Workouts from './pages/Workouts.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Progress from './pages/Progress.jsx'
import Settings from './pages/Settings.jsx'
import Reports from './pages/Reports.jsx'
import Analytics from './pages/Analytics.jsx'
import Contact from './pages/Contact.jsx'
import Services from './pages/Services.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Profile from './pages/Profile.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Exercises from './pages/Exercises.jsx'
import SavedExercises from './pages/SavedExercises.jsx'
import DailyTracker from './pages/DailyTracker.jsx'
import TrackerAnalytics from './pages/TrackerAnalytics.jsx'
import MaintenancePage from './pages/MaintenancePage.jsx'
import Checkout from './pages/Checkout.jsx'

function App() {
  const [showMaintenance, setShowMaintenance] = useState(false);

  // Maintenance check disabled - no backend endpoint
  // useEffect(() => {
  //   const checkMaintenance = async () => {
  //     try {
  //       const res = await fetch(`${API_BASE_URL}/maintenance`);
  //       const data = await res.json();
  //       if (data.maintenanceMode) setShowMaintenance(true);
  //     } catch (err) {}
  //   };
  //   checkMaintenance();
  //   const interval = setInterval(checkMaintenance, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // Tracking disabled - no backend endpoints
  // useEffect(() => {
  //   fetch(`${API_BASE_URL}/track/impression`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' }
  //   }).catch(() => {});
  // }, []);

  // useEffect(() => {
  //   const startTime = Date.now();
  //   const handleBeforeUnload = () => {
  //     const duration = Math.round((Date.now() - startTime) / 60000);
  //     navigator.sendBeacon(`${API_BASE_URL}/track/session`, 
  //       JSON.stringify({ duration }));
  //   };
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  // }, []);

  if (showMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <ErrorBoundary>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/about/mission" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/services" element={<Services />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/exercises/saved" element={<SavedExercises />} />
      <Route path="/tracker" element={<DailyTracker />} />
      <Route path="/tracker/analytics" element={<TrackerAnalytics />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
    </ErrorBoundary>
  )
}

export default App
