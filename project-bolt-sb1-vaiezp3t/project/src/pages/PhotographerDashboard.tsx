import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, Booking, Photographer, Package } from '../lib/supabase';
import { Calendar, DollarSign, Clock, Users, Camera, Settings, FileText, TrendingUp, ArrowRight, Check, X, Eye } from 'lucide-react';

export default function PhotographerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (profile?.id) {
      fetchPhotographerData();
    }
  }, [profile]);

  const fetchPhotographerData = async () => {
    if (!profile) return;

    // Fetch photographer profile
    const { data: photogData } = await supabase
      .from('photographers')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (photogData) {
      setPhotographer(photogData);

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          couple:profiles!bookings_couple_id_fkey(*)
        `)
        .eq('photographer_id', photogData.id)
        .order('created_at', { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData);
      }

      // Fetch packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('photographer_id', photogData.id);

      if (packagesData) {
        setPackages(packagesData);
      }
    }

    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
    }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'sindoor' },
    { label: 'Pending Requests', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'marigold' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: Check, color: 'sage' },
    { label: 'Total Earnings', value: `₹${bookings.filter(b => b.status === 'completed').reduce((a, b) => a + b.total_amount, 0).toLocaleString()}`, icon: DollarSign, color: 'ink' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sindoor border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center max-w-md px-8">
          <Camera size={48} className="mx-auto text-brand-grey mb-4" />
          <h2 className="font-display text-2xl text-ink mb-2">Complete Your Profile</h2>
          <p className="text-brand-grey mb-6">Set up your photographer profile to start receiving bookings.</p>
          <Link
            to="/photographer/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sindoor text-white font-semibold rounded-lg hover:bg-sindoor-deep transition-colors"
          >
            Create Photographer Profile
            <ArrowRight size={18} />
          </Link>
        </div>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center">
                <span className="text-marigold-soft font-display font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">{photographer.business_name}</h1>
                <p className="text-parchment/70 text-sm">{photographer.is_verified ? 'Verified Photographer' : 'Verification Pending'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings size={20} />
              </Link>
              <Link to="/" className="text-sm text-parchment/70 hover:text-parchment transition-colors">
                View Public Profile
              </Link>
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
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'packages', label: 'Packages', icon: FileText },
              { id: 'messages', label: 'Messages', icon: Users },
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
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
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

            {/* Trust Scores */}
            <div className="bg-brand-white rounded-xl border border-ink/10 p-6 mb-8">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Your Trust Scores</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-ink flex items-center justify-center border-2 border-dashed border-marigold/30">
                    <span className="font-display text-2xl font-bold text-marigold-soft">{photographer.portfolio_quality_score || '--'}</span>
                  </div>
                  <p className="text-sm text-brand-grey mt-2">Portfolio Quality</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-ink flex items-center justify-center border-2 border-dashed border-marigold/30">
                    <span className="font-display text-2xl font-bold text-marigold-soft">{photographer.on_time_score || '--'}</span>
                  </div>
                  <p className="text-sm text-brand-grey mt-2">On-Time Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-ink flex items-center justify-center border-2 border-dashed border-marigold/30">
                    <span className="font-display text-2xl font-bold text-marigold-soft">{photographer.satisfaction_score || '--'}</span>
                  </div>
                  <p className="text-sm text-brand-grey mt-2">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-brand-white rounded-xl border border-ink/10">
              <div className="p-6 border-b border-ink/10 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">Recent Bookings</h2>
                <button onClick={() => setActiveTab('bookings')} className="text-sm text-sindoor font-medium flex items-center gap-1 hover:underline">
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-ink/10">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-ink/5 transition-colors">
                    <div>
                      <p className="font-medium text-ink">{booking.couple?.full_name || 'Unknown Couple'}</p>
                      <p className="text-sm text-brand-grey">
                        {new Date(booking.wedding_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">₹{booking.total_amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                        booking.status === 'pending' ? 'bg-marigold/10 text-marigold' :
                        booking.status === 'completed' ? 'bg-ink/10 text-ink' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="p-8 text-center text-brand-grey">No bookings yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-brand-white rounded-xl border border-ink/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-ink">{booking.couple?.full_name || 'Unknown Couple'}</h3>
                    <p className="text-sm text-brand-grey">{booking.couple?.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-ink">₹{booking.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-brand-grey">{booking.coverage_hours} hours coverage</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-brand-grey uppercase tracking-wide">Wedding Date</p>
                      <p className="font-medium text-ink">
                        {new Date(booking.wedding_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-grey uppercase tracking-wide">Status</p>
                      <span className={`inline-block text-sm px-3 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-sage/10 text-sage' :
                        booking.status === 'pending' ? 'bg-marigold/10 text-marigold' :
                        booking.status === 'completed' ? 'bg-ink/10 text-ink' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-brand-grey uppercase tracking-wide">Escrow</p>
                      <span className={`inline-block text-sm px-3 py-1 rounded-full ${
                        booking.escrow_status === 'held' ? 'bg-sage/10 text-sage' :
                        booking.escrow_status === 'released' ? 'bg-ink/10 text-ink' :
                        'bg-marigold/10 text-marigold'
                      }`}>
                        {booking.escrow_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="px-4 py-2 bg-sage text-white rounded-lg font-medium text-sm hover:bg-sage/80 transition-colors flex items-center gap-1"
                        >
                          <Check size={16} /> Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <X size={16} /> Decline
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 border border-ink/10 text-ink-soft rounded-lg font-medium text-sm hover:bg-ink/5 transition-colors flex items-center gap-1">
                      <Eye size={16} /> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
                <Calendar size={48} className="mx-auto text-brand-grey mb-4" />
                <h3 className="font-display text-xl text-ink mb-2">No Bookings Yet</h3>
                <p className="text-brand-grey">Your incoming bookings will appear here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'packages' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-semibold text-ink">Your Packages</h2>
              <Link
                to="/photographer/packages/new"
                className="px-4 py-2 bg-sindoor text-white rounded-lg font-medium text-sm hover:bg-sindoor-deep transition-colors flex items-center gap-1"
              >
                Add Package
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-brand-white rounded-xl border border-ink/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-ink">{pkg.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${pkg.is_active ? 'bg-sage/10 text-sage' : 'bg-ink/10 text-ink-soft'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold text-sindoor mb-2">₹{pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-brand-grey mb-4">{pkg.coverage_hours} hours coverage</p>
                  <ul className="text-sm text-ink-soft space-y-1">
                    {pkg.deliverables.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-sage" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {packages.length === 0 && (
                <div className="col-span-full bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
                  <FileText size={48} className="mx-auto text-brand-grey mb-4" />
                  <h3 className="font-display text-xl text-ink mb-2">No Packages Created</h3>
                  <p className="text-brand-grey">Create packages to show couples what you offer.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-brand-white rounded-xl border border-ink/10 p-12 text-center">
            <Users size={48} className="mx-auto text-brand-grey mb-4" />
            <h3 className="font-display text-xl text-ink mb-2">Messages</h3>
            <p className="text-brand-grey">Your conversations with couples will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
