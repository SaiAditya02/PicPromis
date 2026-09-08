import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Camera, DollarSign, ChevronRight, Check } from 'lucide-react';

const STYLES = ['Traditional', 'Cinematic', 'Candid', 'Editorial'];
const CITIES = ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Kolkata'];

export default function PhotographerSetup() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    styles: [] as string[],
    cities: [] as string[],
    base_price: 50000,
    portfolio_urls: ['', '', '', ''],
  });

  const handleStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleCityToggle = (city: string) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city],
    }));
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('photographers').insert({
        profile_id: profile.id,
        business_name: formData.business_name,
        bio: formData.bio,
        styles: formData.styles,
        cities: formData.cities,
        base_price: formData.base_price,
        portfolio_urls: formData.portfolio_urls.filter(url => url.trim() !== ''),
        verification_status: 'pending',
      });

      if (!error) {
        navigate('/photographer/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.business_name.trim() !== '';
    if (step === 2) return formData.styles.length > 0 && formData.cities.length > 0;
    if (step === 3) return formData.base_price >= 10000;
    return true;
  };

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center mb-4">
            <Camera size={32} className="text-marigold-soft" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">Create Your Profile</h1>
          <p className="text-brand-grey">Set up your photographer profile to start receiving bookings</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-sindoor' : 'bg-ink/10'
              }`}
            />
          ))}
        </div>

        {/* Stepper */}
        <div className="bg-brand-white rounded-2xl border border-ink/10 p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-sindoor/10 flex items-center justify-center text-sindoor font-mono text-sm font-semibold">1</div>
                <div>
                  <h2 className="font-display text-xl text-ink">Business Details</h2>
                  <p className="text-sm text-brand-grey">Tell us about your photography business</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="e.g., Captured Moments Photography"
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-parchment focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Describe your photography style, experience, and what makes you unique..."
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-parchment focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-sindoor/10 flex items-center justify-center text-sindoor font-mono text-sm font-semibold">2</div>
                <div>
                  <h2 className="font-display text-xl text-ink">Style & Location</h2>
                  <p className="text-sm text-brand-grey">Select your photography styles and service areas</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-3">Photography Styles *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleStyleToggle(style)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.styles.includes(style)
                            ? 'border-sindoor bg-sindoor/5'
                            : 'border-ink/10 hover:border-ink/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-ink">{style}</span>
                          {formData.styles.includes(style) && <Check size={18} className="text-sindoor" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-3">Service Cities *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCityToggle(city)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.cities.includes(city)
                            ? 'border-sindoor bg-sindoor/5'
                            : 'border-ink/10 hover:border-ink/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-ink">{city}</span>
                          {formData.cities.includes(city) && <Check size={18} className="text-sindoor" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-sindoor/10 flex items-center justify-center text-sindoor font-mono text-sm font-semibold">3</div>
                <div>
                  <h2 className="font-display text-xl text-ink">Pricing</h2>
                  <p className="text-sm text-brand-grey">Set your base starting price</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Base Starting Price (INR) *</label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-grey" />
                    <input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })}
                      min={10000}
                      step={5000}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink/10 bg-parchment focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all text-2xl font-display font-semibold"
                    />
                  </div>
                  <p className="text-sm text-brand-grey mt-2">This is your starting price for basic coverage. You can create detailed packages later.</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-sindoor/10 flex items-center justify-center text-sindoor font-mono text-sm font-semibold">4</div>
                <div>
                  <h2 className="font-display text-xl text-ink">Portfolio</h2>
                  <p className="text-sm text-brand-grey">Add links to your best work samples</p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.portfolio_urls.map((url, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const urls = [...formData.portfolio_urls];
                          urls[index] = e.target.value;
                          setFormData({ ...formData, portfolio_urls: urls });
                        }}
                        placeholder={`Portfolio image URL ${index + 1}`}
                        className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-parchment focus:border-sindoor focus:ring-2 focus:ring-sindoor/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-sm text-brand-grey">Paste direct URLs to your hosted images. You can add up to 4 showcase images.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border-2 border-ink/20 text-ink-soft font-medium rounded-xl hover:bg-ink/5 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex-1 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-sindoor text-white hover:bg-sindoor-deep'
                    : 'bg-ink/10 text-ink/40 cursor-not-allowed'
                }`}
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-sage text-white font-semibold rounded-xl hover:bg-sage/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Profile'} <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
