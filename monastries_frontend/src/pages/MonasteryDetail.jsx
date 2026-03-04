import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MapPin, Star, Calendar, Hotel, Compass, BookOpen, Users, Church, Sparkles, Mountain, Clock, AlertTriangle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api, getErrorMessage, locationAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { validateBooking } from '../utils/validation'
import { Layout } from '../components/Layout'
import { SkeletonDetail } from '../components/SkeletonCard'

const TYPE_META = {
  Hotel: { symbol: '🏨', color: '#3b82f6', label: 'Hotel' },
  Restaurant: { symbol: '🍽️', color: '#ef4444', label: 'Restaurant' },
  Shop: { symbol: '🛍️', color: '#a855f7', label: 'Shop' },
  'Tourist Attraction': { symbol: '📸', color: '#f59e0b', label: 'Tourist Attraction' },
  'Food Court': { symbol: '🍜', color: '#f97316', label: 'Food Court' },
  Cafe: { symbol: '☕', color: '#14b8a6', label: 'Cafe' },
  Guesthouse: { symbol: '🏠', color: '#22c55e', label: 'Guesthouse' },
  Other: { symbol: '📍', color: '#10b981', label: 'Other' },
}

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.Other
}

export default function MonasteryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [monastery, setMonastery] = useState(null)
  const [travelGuide, setTravelGuide] = useState(null)
  const [userLocations, setUserLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [guideLoading, setGuideLoading] = useState(false)
  const [bookingForm, setBookingForm] = useState({ visitDate: '', numberOfPeople: 1, contactNumber: '' })
  const [bookingErrors, setBookingErrors] = useState({})
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchMonastery() {
      try {
        const { data } = await api.get(`/monasteries/${id}`)
        if (!cancelled) setMonastery(data.data)
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) fetchMonastery()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!monastery) return
    let cancelled = false
    setGuideLoading(true)
    api.get(`/monasteries/${id}/travel-guide`)
      .then(({ data }) => { if (!cancelled) setTravelGuide(data.data) })
      .catch(() => { if (!cancelled) setTravelGuide(null) })
      .finally(() => { if (!cancelled) setGuideLoading(false) })
    return () => { cancelled = true }
  }, [id, monastery])

  useEffect(() => {
    let cancelled = false
    async function fetchUserLocations() {
      try {
        const response = await locationAPI.getAllActiveLocations()
        if (!cancelled) setUserLocations(response.data || [])
      } catch (error) {
        console.error('Failed to fetch user locations:', error)
      }
    }
    fetchUserLocations()
    return () => { cancelled = true }
  }, [])

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    const errs = validateBooking(bookingForm)
    setBookingErrors(errs)
    if (Object.keys(errs).length) return
    if (!user) {
      toast.info('Please log in to book.')
      navigate('/login')
      return
    }
    setBookingSubmitting(true)
    try {
      const { data } = await api.post('/booking/create', {
        monasteryId: monastery._id,
        monasteryName: monastery.name,
        visitDate: bookingForm.visitDate,
        numberOfPeople: Number(bookingForm.numberOfPeople),
        contactNumber: bookingForm.contactNumber || undefined,
      })
      toast.success(data.message || 'Booked successfully!')
      setBookingForm({ visitDate: '', numberOfPeople: 1, contactNumber: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBookingSubmitting(false)
    }
  }

  if (loading || !monastery) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <SkeletonDetail />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl overflow-hidden bg-stone-900/60 border border-amber-900/30 mb-8">
          <div className="relative aspect-[21/9] sm:aspect-[3/1]">
            <img src={monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200'} alt={monastery.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/90 text-stone-900 text-xs font-semibold">{monastery.region}</span>
              <span className="flex items-center gap-1 text-amber-400 text-sm"><Star className="w-4 h-4 fill-amber-400" /> {monastery.rating}</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">{monastery.name}</h1>
            <p className="text-stone-400 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> 
              {monastery.location?.district || monastery.location?.village || monastery.region || 'Sikkim'}
              {monastery.location?.state && `, ${monastery.location.state}`}
            </p>
            
            {monastery.link && (
              <a href={monastery.link} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 text-sm mt-1 inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Wikipedia Article
              </a>
            )}
            
            <p className="mt-4 text-stone-300 leading-relaxed">{monastery.description}</p>
            
            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {monastery.established && (
                <div><p className="text-stone-500">Established</p><p className="text-amber-100 font-medium">{monastery.established}</p></div>
              )}
              {monastery.foundedBy && (
                <div><p className="text-stone-500">Founded By</p><p className="text-amber-100 font-medium">{monastery.foundedBy}</p></div>
              )}
              {monastery.sect && (
                <div><p className="text-stone-500">Sect</p><p className="text-amber-100 font-medium">{monastery.sect}</p></div>
              )}
              {monastery.monks && (
                <div><p className="text-stone-500 flex items-center gap-1"><Users className="w-3 h-3" /> Monks</p><p className="text-amber-100 font-medium">{monastery.monks}</p></div>
              )}
              <div><p className="text-stone-500">Opening</p><p className="text-amber-100 font-medium">{monastery.openingHours || '—'}</p></div>
              <div><p className="text-stone-500">Entry</p><p className="text-amber-100 font-medium">{monastery.entryFee || 'Free'}</p></div>
              <div><p className="text-stone-500">Best time</p><p className="text-amber-100 font-medium">{monastery.bestTimeToVisit || '—'}</p></div>
              {monastery.altitude && (
                <div><p className="text-stone-500 flex items-center gap-1"><Mountain className="w-3 h-3" /> Altitude</p><p className="text-amber-100 font-medium">{monastery.altitude}m</p></div>
              )}
            </div>
            
            <div className="mt-5">
              <Link
                to={`/monastery/${id}/wiki`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-950/60 border border-amber-900/40 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/40 transition"
              >
                <BookOpen className="w-4 h-4" />
                Explore Wikipedia details & nearby hotels
              </Link>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {(monastery.features || []).map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-900/50 text-amber-100 text-xs border border-amber-700/50">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 mb-8">
          
          {/* History Section */}
          {monastery.history && Object.keys(monastery.history).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> History
              </h2>
              <div className="space-y-3 text-stone-300">
                {Object.entries(monastery.history).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-amber-200 font-semibold text-sm capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/(\d+)/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Architecture Section */}
          {monastery.architecture && Object.keys(monastery.architecture).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <Church className="w-5 h-5" /> Architecture
              </h2>
              <div className="space-y-3 text-stone-300">
                {monastery.architectureStyle && (
                  <div>
                    <p className="text-amber-200 font-semibold text-sm mb-1">Style</p>
                    <p className="text-sm">{monastery.architectureStyle}</p>
                  </div>
                )}
                {Object.entries(monastery.architecture).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <p className="text-amber-200 font-semibold text-sm mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <p className="text-amber-200 font-semibold text-sm mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm leading-relaxed">{value}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Festivals Section */}
          {monastery.festivals && monastery.festivals.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Festivals & Celebrations
              </h2>
              <div className="space-y-4">
                {monastery.festivals.map((festival, i) => (
                  <div key={i} className="p-4 rounded-xl bg-stone-900/60 border border-amber-900/30">
                    <h3 className="text-amber-200 font-semibold mb-1">{festival.name}</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">{festival.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deities Worshipped */}
          {monastery.deitiesWorshipped && monastery.deitiesWorshipped.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4">Deities Worshipped</h2>
              <div className="flex flex-wrap gap-2">
                {monastery.deitiesWorshipped.map((deity, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-900/50 text-amber-100 text-sm border border-amber-700/50">
                    {deity}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cultural Significance */}
          {monastery.culturalSignificance && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4">Cultural Significance</h2>
              <p className="text-stone-300 leading-relaxed">{monastery.culturalSignificance}</p>
            </section>
          )}

          {/* Infrastructure */}
          {monastery.infrastructure && Object.keys(monastery.infrastructure).length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4">Infrastructure & Facilities</h2>
              <div className="space-y-3 text-stone-300">
                {Object.entries(monastery.infrastructure).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <p className="text-amber-200 font-semibold text-sm mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <p className="text-amber-200 font-semibold text-sm mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm">{value}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Earthquake Damage / Restoration */}
          {(monastery.earthquakeDamage || monastery.restoration) && (
            <section className="glass rounded-2xl p-6 border-l-4 border-amber-600">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Conservation & Restoration
              </h2>
              <div className="space-y-3 text-stone-300">
                {monastery.earthquakeDamage && (
                  <div>
                    <p className="text-amber-200 font-semibold text-sm mb-2">Earthquake Damage</p>
                    {typeof monastery.earthquakeDamage === 'object' ? (
                      Object.entries(monastery.earthquakeDamage).map(([key, value]) => (
                        <p key={key} className="text-sm leading-relaxed mb-2">
                          <span className="font-medium">{key}:</span> {value}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm leading-relaxed">{monastery.earthquakeDamage}</p>
                    )}
                  </div>
                )}
                {monastery.restoration && (
                  <div>
                    <p className="text-amber-200 font-semibold text-sm mb-2">Restoration</p>
                    {typeof monastery.restoration === 'object' && monastery.restoration.info ? (
                      <p className="text-sm leading-relaxed">{monastery.restoration.info}</p>
                    ) : (
                      <p className="text-sm leading-relaxed">{monastery.restoration}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Nearby Attractions */}
          {monastery.nearbyAttractions && monastery.nearbyAttractions.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-amber-50 mb-4">Nearby Attractions</h2>
              <div className="flex flex-wrap gap-2">
                {monastery.nearbyAttractions.map((attraction, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-stone-900/60 text-amber-100 text-sm border border-amber-900/40">
                    {attraction}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Map Section */}
        {monastery.coordinates?.latitude && monastery.coordinates?.longitude && (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Location & Nearby Places
            </h2>
            <div className="rounded-2xl overflow-hidden border border-amber-900/40 relative z-0" style={{ height: '50vh', minHeight: '400px' }}>
              <MapContainer 
                center={[monastery.coordinates.latitude, monastery.coordinates.longitude]} 
                zoom={12} 
                scrollWheelZoom 
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* This Monastery Marker */}
                <Marker 
                  position={[monastery.coordinates.latitude, monastery.coordinates.longitude]}
                  icon={L.divIcon({
                    html: `
                      <div class="w-12 h-12 rounded-full border-3 border-amber-400 overflow-hidden shadow-xl cursor-pointer transform hover:scale-110 transition-transform">
                        <img src="${monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200'}" alt="${monastery.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-full h-full bg-amber-500 flex items-center justify-center text-2xl\\'>🏛️</div>'" />
                      </div>
                    `,
                    iconSize: [48, 48],
                    className: 'monastery-icon',
                  })}
                >
                  <Popup>
                    <div className="text-sm max-w-xs">
                      <p className="font-semibold text-amber-600 mb-1">{monastery.name}</p>
                      <p className="text-xs text-stone-600">{monastery.location?.district || monastery.location?.village || 'Sikkim'}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* User Locations (Businesses) */}
                {userLocations.map((location) => {
                  if (!location.location?.coordinates?.[1] || !location.location?.coordinates?.[0]) return null
                  const typeMeta = getTypeMeta(location.type)
                  
                  return (
                    <Marker
                      key={location._id}
                      position={[location.location.coordinates[1], location.location.coordinates[0]]}
                      icon={L.divIcon({
                        html: `
                          <div class="w-10 h-10 rounded-full border-2 shadow-lg cursor-pointer transform hover:scale-110 transition-transform" style="border-color:${typeMeta.color}; background:linear-gradient(135deg, ${typeMeta.color} 0%, ${typeMeta.color}dd 100%); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
                            <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">${typeMeta.symbol}</span>
                          </div>
                        `,
                        iconSize: [40, 40],
                        className: 'custom-location-icon',
                      })}
                    >
                      <Popup>
                        <div className="text-sm max-w-xs">
                          {location.imageUrl && (
                            <img 
                              src={location.imageUrl} 
                              alt={location.name} 
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <p className="font-semibold text-sm">{location.name}</p>
                          <p className="text-xs font-medium" style={{ color: typeMeta.color }}>{typeMeta.symbol} {location.type || 'Other'}</p>
                          <p className="text-xs mt-1">{location.location.address}</p>
                          {location.phone && (
                            <p className="text-xs mt-1">Ph: {location.phone}</p>
                          )}
                          <Link to={`/location/${location._id}`} className="text-xs text-blue-700 underline mt-2 inline-block">
                            View details
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
            <p className="text-stone-400 text-xs mt-2">
              {userLocations.length} nearby {userLocations.length === 1 ? 'business' : 'businesses'} shown on map
            </p>
          </section>
        )}

        {/* Travel guide */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2"><Compass className="w-5 h-5" /> Travel guide</h2>
          {guideLoading && <p className="text-stone-400 text-sm">Loading travel info...</p>}
          {travelGuide && !guideLoading && (
            <div className="glass rounded-2xl p-6 space-y-4">
              {travelGuide.recommendedHotel && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/60">
                  <Hotel className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-100">Recommended stay: {travelGuide.recommendedHotel.name}</p>
                    <p className="text-stone-400 text-sm">{travelGuide.recommendedHotel.reason}</p>
                  </div>
                </div>
              )}
              {travelGuide.hotels && travelGuide.hotels.length > 0 && (
                <div>
                  <p className="text-stone-400 text-sm mb-2">Nearby hotels ({travelGuide.hotels.length})</p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {travelGuide.hotels.slice(0, 5).map((h, i) => (
                      <li key={i} className="text-sm text-amber-100/90">{h.name} — {h.distance?.text || '—'} · {h.rating}/5</li>
                    ))}
                  </ul>
                </div>
              )}
              {travelGuide.travelTips && (
                <div>
                  <p className="text-stone-400 text-sm mb-1">Tips</p>
                  <p className="text-sm text-amber-100/90">{travelGuide.travelTips.thingsToCarry?.join(', ')}</p>
                </div>
              )}
            </div>
          )}
          {!travelGuide && !guideLoading && <p className="text-stone-500 text-sm">Travel guide not available for this monastery.</p>}
        </section>

        {/* Book visit */}
        <section>
          <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Book a visit</h2>
          {user ? (
            <form onSubmit={handleBookingSubmit} className="glass rounded-2xl p-6 max-w-md space-y-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Visit date</label>
                <input type="date" value={bookingForm.visitDate} onChange={(e) => setBookingForm((f) => ({ ...f, visitDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                {bookingErrors.visitDate && <p className="text-xs text-rose-400 mt-1">{bookingErrors.visitDate}</p>}
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Number of people</label>
                <input type="number" min={1} value={bookingForm.numberOfPeople} onChange={(e) => setBookingForm((f) => ({ ...f, numberOfPeople: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                {bookingErrors.numberOfPeople && <p className="text-xs text-rose-400 mt-1">{bookingErrors.numberOfPeople}</p>}
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Contact number (optional)</label>
                <input type="tel" value={bookingForm.contactNumber} onChange={(e) => setBookingForm((f) => ({ ...f, contactNumber: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <button type="submit" disabled={bookingSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-60">
                {bookingSubmitting ? 'Booking...' : 'Confirm booking'}
              </button>
            </form>
          ) : (
            <p className="text-stone-400">Please <Link to="/login" className="text-amber-400 hover:underline">log in</Link> to book a visit.</p>
          )}
        </section>
      </div>
    </Layout>
  )
}
