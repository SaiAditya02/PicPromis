import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, Booking, Photographer, Package } from '../lib/supabase';
import { Calendar, DollarSign, Clock, Heart, Camera, MessageCircle, Star, Check, ArrowRight, MapPin, Search, Filter, X } from 'lucide-react';

export default function CustomerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [photographers, setPhotographers] = useState<(Photographer & { profiles: { full_name: string; avatar_url: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchCity, setSearchCity] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookingData, setBookingData] = useState({
    wedding_date: '',
    notes: '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        photographer:photographers(
          *,
          profile:profiles!photographers_profile_id_fkey(*)
        )
      `)
      .or(`couple_id.eq.${profile.id},customer_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData);
    }

    // Fetch verified photographers
    const { data: photographersData } = await supabase
      .from('photographers')
      .select(`
        *,
        profiles:profiles!photographers_profile_id_fkey(full_name, avatar_url)
      `)
      .eq('is_verified', true);

    if (photographersData) {
      setPhotographers(photographersData);
    }

    setLoading(false);
  };

  const fetchPackages = async (photographerId: string) => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('photographer_id', photographerId)
      .eq('is_active', true);
    if (data) setPackages(data);
  };

  const handleBookPhotographer = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    fetchPackages(photographer.id);
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!profile || !selectedPhotographer || !selectedPackage) return;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        couple_id: profile.id,
        customer_id: profile.id,
        photographer_id: selectedPhotographer.id,
        wedding_date: bookingData.wedding_date,
        total_amount: selectedPackage.price,
        coverage_hours: selectedPackage.coverage_hours,
        deliverables: selectedPackage.deliverables,
        notes: bookingData.notes,
        status: 'pending',
        escrow_status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      setShowBookingModal(false);
      setActiveTab('bookings');
      fetchData();
    }
  };

  const filteredPhotographers = photographers.filter(p => {
    if (searchCity && !p.cities.some(c => c.toLowerCase().includes(searchCity.toLowerCase()))) return false;
    if (selectedStyle !== 'all' && !p.styles.includes(selectedStyle)) return false;
    if (p.base_price < priceRange[0] || p.base_price > priceRange[1]) return false;
    return true;
  });

  const styles = ['all', 'Traditional', 'Cinematic', 'Candid', 'Editorial'];

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'sindoor' },
    { label: 'Upcoming Weddings', value: bookings.filter(b => b.status === 'confirmed').length, icon: Heart, color: 'marigold' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: Check, color: 'sage' },
    { label: 'Total Spent', value: `₹${bookings.filter(b => b.status === 'completed').reduce((a, b) => a + b.total_amount, 0).toLocaleString()}`, icon: DollarSign, color: 'ink' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sindoor border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-ink text-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center">
                  <span className="text-marigold-soft font-display font-bold text-xl">P</span>
                </div>
                <span className="font-display font-semibold text-xl">PicPromise</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-parchment/70">Welcome, {profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium border border-parchment/30 rounded-lg hover:bg-parchment/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-brand-white border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            {[
              { id: 'discover', label: 'Find Photographers', icon: Search },
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-sindoor text-sindoor'
                    : 'border-transparent text-brand-grey hover:text-ink-soft'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discover' && (
          <>
            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-brand-white rounded-xl border border-ink/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                      <stat.icon size={20} className={`text-${stat.color}`} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink">{stat.value}</p>
                  <p className="text-sm text-brand-grey">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-brand-white rounded-xl border border-ink/10 p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter size={18} className="text-brand-grey" />
                <h3 className="font-medium text-ink">Filter Photographers</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-brand-grey mb-2">City</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey" />
                    <input
                      type="text"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      placeholder="Search city..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink/10 bg-parchment focus:border-sindoor outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-brand-grey mb-2">Style</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-ink/10 bg-parchment focus:border-sindoor outline-none transition-all"
                  >
                    {styles.map((s) => (
                      <option key={s} value={s}>{s === 'all' ? 'All Styles' : s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-brand-grey mb-2">Price Range</label>
                  <select
                    value={`${priceRange[0]}-${priceRange[1]}`}
                    onChange={(e) => {
                      const [min, max] = e.target.value.split('-').map(Number);
                      setPriceRange([min, max]);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-ink/10 bg-parchment focus:border-sindoor outline-none transition-all"
                  >
                    <option value="0-500000">All Prices</option>
                    <option value="0-50000">Under ₹50,000</option>
                    <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                    <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
                    <option value="200000-500000">Above ₹2,00,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photographers Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotographers.map((photographer) => (
                <div key={photographer.id} className="bg-brand-white rounded-xl border border-ink/10 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[4/3] bg-ink/10 relative">
                    {photographer.portfolio_urls?.[0] ? (
                      <img
                        src={photographer.portfolio_urls[0]}
                        alt={photographer.business_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={40} className="text-brand-grey" />
                      </div>
                    )}
                    {photographer.is_verified && (
                      <span className="absolute top-3 right-3 bg-sage text-white text-xs px-2 py-1 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-marigold-soft font-display font-bold">
                        {photographer.business_name[0]}
                      </div>
                      <div>
                        <h3 className="font-medium text-ink">{photographer.business_name}</h3>
                        <p className="text-sm text-brand-grey">{photographer.cities.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {photographer.styles.map((style) => (
                        <span key={style} className="text-xs px-2 py-1 bg-marigold/10 text-ink-soft rounded">
                          {style}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-semibold text-sindoor">
                        ₹{photographer.base_price.toLocaleString()}+
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-sage">
                          <Clock size={14} />
                          {photographer.on_time_score}%
                        </span>
                        <span className="flex items-center gap-1 text-marigold">
                          <Star size={14} />
                          {photographer.satisfaction_score}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookPhotographer(photographer)}
                      className="w-full mt-4 py-2.5 bg-sindoor text-white font-medium rounded-lg hover:bg-sindoor-deep transition-colors flex items-center justify-center gap-2"
                    >
                      Book Now <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPhotographers.length === 0 && (
              <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
                <Camera size={48} className="mx-auto text-brand-grey mb-4" />
                <h3 className="font-display text-xl text-ink mb-2">No Photographers Found</h3>
                <p className="text-brand-grey">Try adjusting your filters or search in a different city.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-brand-white rounded-xl border border-ink/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-ink flex items-center justify-center text-marigold-soft font-display font-bold text-xl">
                      {booking.photographer?.business_name?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 className="font-medium text-ink">{booking.photographer?.business_name || 'Unknown Photographer'}</h3>
                      <p className="text-sm text-brand-grey">{booking.coverage_hours} hours · {booking.deliverables?.length || 0} deliverables</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-ink">₹{booking.total_amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                      booking.status === 'pending' ? 'bg-marigold/10 text-marigold' :
                      booking.status === 'completed' ? 'bg-ink/10 text-ink' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ink/10 grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-brand-grey uppercase tracking-wide">Wedding Date</p>
                    <p className="font-medium text-ink">
                      {new Date(booking.wedding_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-grey uppercase tracking-wide">Escrow Status</p>
                    <span className={`inline-block text-sm px-3 py-1 rounded-full ${
                      booking.escrow_status === 'held' ? 'bg-sage/10 text-sage' :
                      booking.escrow_status === 'released' ? 'bg-ink/10 text-ink' :
                      'bg-marigold/10 text-marigold'
                    }`}>
                      {booking.escrow_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-brand-grey uppercase tracking-wide">Booked On</p>
                    <p className="font-medium text-ink">
                      {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
                <Calendar size={48} className="mx-auto text-brand-grey mb-4" />
                <h3 className="font-display text-xl text-ink mb-2">No Bookings Yet</h3>
                <p className="text-brand-grey mb-6">Find and book your perfect wedding photographer.</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-3 bg-sindoor text-white font-semibold rounded-lg hover:bg-sindoor-deep transition-colors"
                >
                  Find Photographers
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-brand-grey mb-4" />
            <h3 className="font-display text-xl text-ink mb-2">Messages</h3>
            <p className="text-brand-grey">Your conversations with photographers will appear here.</p>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedPhotographer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-parchment rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-ink text-parchment p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold">Book {selectedPhotographer.business_name}</h3>
                  <p className="text-parchment/70 text-sm">Select a package and your wedding date</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Package Selection */}
              <div>
                <label className="block text-sm font-medium text-ink mb-3">Select Package</label>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPackage?.id === pkg.id
                          ? 'border-sindoor bg-sindoor/5'
                          : 'border-ink/10 hover:border-ink/30'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-ink">{pkg.name}</span>
                        <span className="font-display text-lg font-semibold text-sindoor">₹{pkg.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-brand-grey">{pkg.coverage_hours} hours coverage</p>
                      <ul className="text-xs text-ink-soft mt-2 space-y-1">
                        {pkg.deliverables.slice(0, 3).map((d, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check size={12} className="text-sage" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                  {packages.length === 0 && (
                    <p className="text-brand-grey text-center py-4">No packages available</p>
                  )}
                </div>
              </div>

              {/* Wedding Date */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Wedding Date</label>
                <input
                  type="date"
                  value={bookingData.wedding_date}
                  onChange={(e) => setBookingData({ ...bookingData, wedding_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-ink/10 bg-brand-white focus:border-sindoor outline-none transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any special requirements or details..."
                  className="w-full px-4 py-3 rounded-lg border border-ink/10 bg-brand-white focus:border-sindoor outline-none transition-all resize-none"
                />
              </div>

              {/* Summary */}
              {selectedPackage && (
                <div className="bg-ink/5 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-brand-grey">Package</span>
                    <span className="font-medium text-ink">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-brand-grey">Total Amount</span>
                    <span className="font-display text-xl font-bold text-sindoor">₹{selectedPackage.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-brand-grey mt-2">Payment will be held in escrow until delivery milestones are completed.</p>
                </div>
              )}

              <button
                onClick={handleCreateBooking}
                disabled={!selectedPackage || !bookingData.wedding_date}
                className={`w-full py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedPackage && bookingData.wedding_date
                    ? 'bg-sindoor text-white hover:bg-sindoor-deep'
                    : 'bg-ink/10 text-ink/40 cursor-not-allowed'
                }`}
              >
                Create Booking Request
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
