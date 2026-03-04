import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3777'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Parse error response (backend may send JSON or text)
export function getErrorMessage(err) {
  const res = err.response
  if (!res) return err.message || 'Network or server error'
  const data = res.data
  if (data && typeof data === 'object' && data.message) return data.message
  if (typeof data === 'string') return data.replace(/^ERROR\s*:\s*/i, '')
  return res.statusText || 'Something went wrong'
}

// ===== Location APIs =====

export const locationAPI = {
  // Create a new location listing
  createLocation: (locationData) =>
    api.post('/location/create', locationData),

  // Get all user's locations
  getMyLocations: () =>
    api.get('/location/my-locations'),

  // Get all active locations (for map)
  getAllActiveLocations: () =>
    api.get('/location/all-active'),

  // Get single location by ID
  getLocationById: (id) =>
    api.get(`/location/${id}`),

  // Track a single view
  trackLocationView: (id) =>
    api.post(`/location/${id}/view`),

  // Update location details
  updateLocation: (id, data) =>
    api.patch(`/location/${id}`, data),

  // Delete location
  deleteLocation: (id) =>
    api.delete(`/location/${id}`),

  // Get subscription details for a location
  getSubscription: (id) =>
    api.get(`/location/${id}/subscription`),

  // Renew subscription
  renewSubscription: (id) =>
    api.post(`/location/${id}/renew-subscription`),

  // Cancel subscription
  cancelSubscription: (id) =>
    api.post(`/location/${id}/cancel-subscription`),

  // Search locations by query
  searchLocations: (query) =>
    api.get(`/location/search/${query}`),

  // Find nearby locations
  findNearby: (coordinates, maxDistance = 5000) =>
    api.post('/location/find-nearby', { coordinates, maxDistance }),
}
