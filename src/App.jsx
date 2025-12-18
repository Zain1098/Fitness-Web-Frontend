import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { API_BASE_URL } from './config/api.js'
import ToastContainer from './components/Toast.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import './App.css'
import Home from './pages/Home.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const About = lazy(() => import('./pages/About.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Workouts = lazy(() => import('./pages/Workouts.jsx'))
const Nutrition = lazy(() => import('./pages/Nutrition.jsx'))
const Progress = lazy(() => import('./pages/Progress.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Services = lazy(() => import('./pages/Services.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Exercises = lazy(() => import('./pages/Exercises.jsx'))
const SavedExercises = lazy(() => import('./pages/SavedExercises.jsx'))
const DailyTracker = lazy(() => import('./pages/DailyTracker.jsx'))
const TrackerAnalytics = lazy(() => import('./pages/TrackerAnalytics.jsx'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))

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
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
    </ErrorBoundary>
  )
}

export default App
