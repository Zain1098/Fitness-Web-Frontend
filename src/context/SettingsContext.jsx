import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    units: 'kg',
    heightUnit: 'cm',
    dateFormat: 'DD/MM/YYYY',
    weekStartsOn: 'monday'
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ff_token')
    if (!token) {
      setLoaded(true)
      return
    }

    api('/settings', { token })
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const updateSettings = async (newSettings, token) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    if (token) {
      try {
        await api('/settings', { method: 'PUT', body: newSettings, token })
      } catch (err) {
        console.error('Failed to save settings:', err)
      }
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    switch (settings.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  const convertWeight = (kg, toUnit = settings.units) => {
    if (!kg) return 0
    return toUnit === 'lbs' ? (kg * 2.20462).toFixed(1) : kg.toFixed(1)
  }

  const convertHeight = (cm, toUnit = settings.heightUnit) => {
    if (!cm) return 0
    if (toUnit === 'inches') return (cm / 2.54).toFixed(1)
    if (toUnit === 'feet') return (cm / 30.48).toFixed(2)
    return cm.toFixed(1)
  }

  const convertHeightToDb = (value, fromUnit = settings.heightUnit) => {
    if (!value) return 0
    const num = Number(value)
    if (fromUnit === 'inches') return num * 2.54
    if (fromUnit === 'feet') return num * 30.48
    return num
  }

  const convertWeightToDb = (value, fromUnit = settings.units) => {
    if (!value) return 0
    return fromUnit === 'lbs' ? Number(value) * 0.453592 : Number(value)
  }

  const getWeightUnit = () => settings.units === 'lbs' ? 'lbs' : 'kg'
  const getHeightUnit = () => settings.heightUnit || 'cm'

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      formatDate,
      convertWeight,
      convertHeight,
      convertHeightToDb,
      convertWeightToDb,
      getWeightUnit,
      getHeightUnit,
      loaded
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
