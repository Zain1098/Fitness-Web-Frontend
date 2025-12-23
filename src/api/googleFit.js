import { api } from './client.js'

export const googleFitApi = {
  getStatus: async (token) => {
    return await api('/googlefit/status', { token })
  },

  getAuthUrl: async (token) => {
    return await api('/googlefit/auth', { token })
  },

  sync: async (days = 7, token) => {
    return await api(`/googlefit/sync?days=${days}`, { method: 'POST', token })
  },

  disconnect: async (token) => {
    return await api('/googlefit/disconnect', { method: 'POST', token })
  }
}
