import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { MapPin, Phone, Globe, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { locationAPI } from '../api'

export default function LocationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  const trackLocationViewOnce = async (locationId) => {
    try {
      const key = `location_view_${locationId}`
      const now = Date.now()
      const lastTrackedAt = Number(localStorage.getItem(key) || 0)
      const cooldownMs = 60 * 1000 // 1 minute

      if (now - lastTrackedAt < cooldownMs) return false

      await locationAPI.trackLocationView(locationId)
      localStorage.setItem(key, String(now))
      return true
    } catch (error) {
      // Silently ignore tracking errors
      console.error('Failed to track view:', error)
      return false
    }
  }

  useEffect(() => {
    fetchLocation()
  }, [id])

  const fetchLocation = async () => {
    try {
      setLoading(true)
      const response = await locationAPI.getLocationById(id)
      const tracked = await trackLocationViewOnce(id)
      setLocation({
        ...response.data,
        views: (response.data.views || 0) + (tracked ? 1 : 0)
      })
    } catch (error) {
      toast.error('Failed to fetch location details')
      console.error(error)
      navigate('/map')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-stone-400 mt-4">Loading location...</p>
        </div>
      </Layout>
    )
  }

  if (!location) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-stone-400 text-lg">Location not found</p>
          <button
            onClick={() => navigate('/map')}
            className="mt-6 px-6 py-3 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-500 transition"
          >
            Back to Map
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout noHero>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-stone-900 rounded-lg border border-amber-900/30 overflow-hidden">
          {/* Image */}
          {location.imageUrl && (
            <img
              src={location.imageUrl}
              alt={location.name}
              className="w-full h-96 object-cover"
            />
          )}

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-amber-50">{location.name}</h1>
                  <p className="text-amber-400 mt-2 text-lg">{location.type}</p>
                </div>
                {location.isApproved && (
                  <span className="px-4 py-2 bg-green-900/30 border border-green-600/50 rounded-full text-green-300 text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-amber-50 mb-3">About</h2>
              <p className="text-amber-100 leading-relaxed">{location.description}</p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-amber-50 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-stone-400">Phone</p>
                      <a href={`tel:${location.phone}`} className="text-amber-100 hover:text-amber-50">
                        {location.phone}
                      </a>
                    </div>
                  </div>

                  {location.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-stone-400">Website</p>
                        <a
                          href={location.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-100 hover:text-amber-50 break-all"
                        >
                          {location.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {location.hours && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-stone-400">Hours</p>
                        <p className="text-amber-100">{location.hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div>
                <h3 className="text-lg font-semibold text-amber-50 mb-4">Location</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-stone-400">Address</p>
                    <p className="text-amber-100">{location.location.address}</p>
                    <p className="text-xs text-stone-500 mt-2">
                      Coordinates: {location.location.coordinates[1].toFixed(4)}, {location.location.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-amber-50 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-stone-400">Views</p>
                  <p className="text-2xl font-bold text-amber-300">{location.views || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Rating</p>
                  <p className="text-2xl font-bold text-amber-300">{location.rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Reviews</p>
                  <p className="text-2xl font-bold text-amber-300">{location.reviewCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Listed Since</p>
                  <p className="text-sm text-amber-300">
                    {new Date(location.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            {location.userId && (
              <div className="bg-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-50 mb-4">Listed By</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center">
                    <span className="text-amber-50 font-bold">
                      {location.userId.firstName?.[0]}{location.userId.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-amber-50">
                      {location.userId.firstName} {location.userId.lastName}
                    </p>
                    {location.userId.phoneNumber && (
                      <p className="text-sm text-stone-400">{location.userId.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
