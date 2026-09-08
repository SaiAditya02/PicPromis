import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, ChevronRight, ChevronDown, Check, Star, Clock, Camera, Heart, Sparkles, MapPin, DollarSign, Users, Award, ArrowRight } from 'lucide-react';

// Custom hook for scroll-triggered animations
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollReveal();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

// Glassmorphic Navigation
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#how', label: 'How it works' },
    { href: '#trust', label: 'Trust & Safety' },
    { href: '#portfolio', label: 'Verified Partners' },
    { href: '#personas', label: "Who it's for" },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-parchment/80 backdrop-blur-lg shadow-lg border-b border-ink/10'
        : 'bg-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-marigold-soft font-display font-bold text-lg">P</span>
            </div>
            <span className="font-display font-semibold text-xl text-ink">PicPromise</span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-ink-soft font-medium text-sm hover:text-ink transition-colors group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sindoor group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/auth" className="px-5 py-2.5 bg-sindoor text-brand-white font-semibold text-sm rounded shadow-lg shadow-sindoor/30 hover:shadow-xl hover:shadow-sindoor/40 hover:-translate-y-0.5 transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-ink hover:text-sindoor transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
            }`}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-ink/10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-soft font-medium py-2 hover:text-sindoor transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/auth" className="w-full px-5 py-3 bg-sindoor text-brand-white font-semibold rounded text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

// AI Matching Modal
function AIMatchingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    city: '',
    services: [] as string[],
    styles: [] as string[],
    budget: '',
  });
  const [isMatching, setIsMatching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);

  const cities = ['Hyderabad', 'Bengaluru', 'Chennai'];
  const services = [
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'videography', label: 'Videography', icon: Camera },
    { id: 'drone', label: 'Drone Shots', icon: Camera },
    { id: 'album', label: 'Photo Album', icon: Camera },
  ];
  const styles = ['Traditional', 'Cinematic', 'Candid', 'Editorial'];
  const budgets = ['Under \u20B950,000', '\u20B950,000 - \u20B91,00,000', '\u20B91,00,000 - \u20B92,00,000', 'Above \u20B92,00,000'];

  const handleSelect = (field: string, value: string) => {
    setSelections((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setSelections((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleStyleToggle = (style: string) => {
    setSelections((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsMatching(true);
      setTimeout(() => {
        setIsMatching(false);
        setIsMatched(true);
      }, 2500);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelections({ city: '', services: [], styles: [], budget: '' });
    setIsMatching(false);
    setIsMatched(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  const canProceed = () => {
    if (step === 1) return selections.city !== '';
    if (step === 2) return selections.services.length > 0;
    if (step === 3) return selections.styles.length > 0;
    if (step === 4) return selections.budget !== '';
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-parchment rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="bg-ink text-parchment p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold">Find Your Photographer</h3>
              <p className="text-parchment/70 text-sm mt-1">AI-powered matching in 4 steps</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-marigold' : 'bg-white/20'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isMatched ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-sage to-sage/80 rounded-full flex items-center justify-center mb-6 animate-float">
                <Check size={48} className="text-white" />
              </div>
              <h4 className="font-display text-3xl text-ink mb-3">Top 5 Matches Found!</h4>
              <p className="text-brand-grey mb-6">
                Based on your preferences for {selections.services.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} in {selections.styles.join(' & ')} styles, we&apos;ve found photographers in {selections.city} within your budget.
              </p>
              <div className="space-y-3">
                <Link to="/auth" className="block w-full py-3 bg-sindoor text-brand-white font-semibold rounded-lg hover:bg-sindoor-deep transition-colors text-center">
                  View My Matches
                </Link>
                <button onClick={handleReset} className="w-full py-3 text-ink-soft font-medium hover:text-ink transition-colors">
                  Start Over
                </button>
              </div>
            </div>
          ) : isMatching ? (
            <div className="text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-marigold/30 rounded-full animate-ping" />
                <div className="absolute inset-2 border-4 border-marigold/50 rounded-full" style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '150ms' }} />
                <div className="absolute inset-4 bg-gradient-to-br from-sindoor to-sindoor-deep rounded-full animate-pulse" />
              </div>
              <h4 className="font-display text-2xl text-ink mb-2">Matching in Progress...</h4>
              <p className="text-brand-grey">Analyzing {selections.city}&apos;s top {selections.styles.join(' & ')} photographers</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="animate-fade-in">
                  <h4 className="font-display text-xl text-ink mb-4">Select Your City</h4>
                  <p className="text-brand-grey text-sm mb-6">Where is your wedding taking place?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelect('city', city)}
                        className={`p-4 rounded-xl border-2 transition-all ${selections.city === city
                          ? 'border-sindoor bg-sindoor/5 shadow-lg'
                          : 'border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                          }`}
                      >
                        <MapPin size={24} className={`mx-auto mb-2 ${selections.city === city ? 'text-sindoor' : 'text-brand-grey'}`} />
                        <span className={`font-medium ${selections.city === city ? 'text-ink' : 'text-ink-soft'}`}>
                          {city}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h4 className="font-display text-xl text-ink mb-2">Select Services</h4>
                  <p className="text-brand-grey text-sm mb-6">Choose all services you need (select multiple)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        className={`p-5 rounded-xl border-2 transition-all text-left relative ${selections.services.includes(service.id)
                          ? 'border-sindoor bg-sindoor/5 shadow-lg'
                          : 'border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                          }`}
                      >
                        {selections.services.includes(service.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sindoor flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        <service.icon size={24} className={`mb-3 ${selections.services.includes(service.id) ? 'text-sindoor' : 'text-brand-grey'}`} />
                        <span className={`font-medium block ${selections.services.includes(service.id) ? 'text-ink' : 'text-ink-soft'}`}>
                          {service.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in">
                  <h4 className="font-display text-xl text-ink mb-2">Choose Your Style</h4>
                  <p className="text-brand-grey text-sm mb-6">Select all styles you like (select multiple)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style}
                        onClick={() => handleStyleToggle(style)}
                        className={`p-5 rounded-xl border-2 transition-all text-left relative ${selections.styles.includes(style)
                          ? 'border-sindoor bg-sindoor/5 shadow-lg'
                          : 'border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                          }`}
                      >
                        {selections.styles.includes(style) && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sindoor flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        <Camera size={24} className={`mb-3 ${selections.styles.includes(style) ? 'text-sindoor' : 'text-brand-grey'}`} />
                        <span className={`font-medium block ${selections.styles.includes(style) ? 'text-ink' : 'text-ink-soft'}`}>
                          {style}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in">
                  <h4 className="font-display text-xl text-ink mb-4">Set Your Budget</h4>
                  <p className="text-brand-grey text-sm mb-6">What&apos;s your photography budget range?</p>
                  <div className="space-y-3">
                    {budgets.map((budget) => (
                      <button
                        key={budget}
                        onClick={() => handleSelect('budget', budget)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selections.budget === budget
                          ? 'border-sindoor bg-sindoor/5 shadow-lg'
                          : 'border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                          }`}
                      >
                        <DollarSign size={24} className={selections.budget === budget ? 'text-sindoor' : 'text-brand-grey'} />
                        <span className={`font-medium ${selections.budget === budget ? 'text-ink' : 'text-ink-soft'}`}>
                          {budget}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 border-2 border-ink/20 text-ink-soft font-medium rounded-lg hover:bg-ink/5 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex-1 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${canProceed()
                    ? 'bg-sindoor text-brand-white hover:bg-sindoor-deep'
                    : 'bg-ink/10 text-ink/40 cursor-not-allowed'
                    }`}
                >
                  {step === 4 ? 'Find Matches' : 'Continue'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection({ onOpenModal }: { onOpenModal: () => void }) {
  const stats: { value: number; suffix: string; label: string; isDecimal?: boolean }[] = [
    { value: 100, suffix: '+', label: 'Verified photographers' },
    { value: 500, suffix: '+', label: 'Customers matched' },
    { value: 95, suffix: '%+', label: 'Escrow success rate' },
    { value: 4, suffix: '/5', label: 'Satisfaction score' },
  ];

  return (
    <section className="min-h-screen pt-24 lg:pt-32 pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-marigold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sindoor/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sindoor/10 border border-sindoor/20 mb-6">
              <Sparkles size={16} className="text-sindoor" />
              <span className="text-sm font-mono font-medium text-sindoor tracking-wide">
                A TRUSTED WEDDING PHOTOGRAPHY MARKETPLACE
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-ink leading-[1.05] mb-6">
              The promise isn&apos;t the portfolio.
              <br />
              <em className="text-sindoor font-medium">It&apos;s what happens after you book.</em>
            </h1>

            <p className="text-lg text-brand-grey leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              PicPromise AI-matches you to five verified photographers, holds your payment in escrow until each milestone is delivered, and backs the booking with a protection plan — for the one day that can&apos;t be redone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button onClick={onOpenModal} className="group px-8 py-4 bg-sindoor text-brand-white font-semibold rounded-lg shadow-lg shadow-sindoor/30 hover:shadow-xl hover:shadow-sindoor/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Find My Photographer
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 border-t border-ink/10 pt-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="font-display text-2xl lg:text-3xl text-ink font-semibold">
                    {stat.isDecimal ? (
                      <span>
                        <AnimatedCounter end={stat.value * 10} duration={2500} />
                        {stat.suffix}
                      </span>
                    ) : (
                      <>
                        <AnimatedCounter end={stat.value} duration={1800} />
                        {stat.suffix}
                      </>
                    )}
                  </div>
                  <div className="text-xs lg:text-sm text-brand-grey mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Wax Seal */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Invitation Card */}
              <div className="absolute inset-4 lg:inset-8 bg-brand-white rounded-xl border border-ink/10 shadow-2xl overflow-hidden">
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(27, 36, 64, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(27, 36, 64, 0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                {/* Thread */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[repeating-linear-gradient(#B33A3A_0_6px,transparent_6px_12px)] opacity-30" />
              </div>

              {/* Wax Seal */}
              <div className="absolute inset-0 flex items-center justify-center animate-stamp">
                <div className="relative w-36 h-36 lg:w-44 lg:h-44">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-sindoor to-sindoor-deep shadow-2xl shadow-sindoor/50" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                  <div className="absolute inset-3 lg:inset-4 rounded-full border-2 border-dashed border-marigold-soft/60 flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-display text-4xl lg:text-5xl font-bold text-marigold-soft">P</span>
                      <p className="text-[8px] lg:text-[9px] font-mono text-marigold-soft/80 tracking-widest mt-1">VERIFIED & SEALED</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center font-mono text-xs text-brand-grey whitespace-nowrap">
              Every booking closes with a verified seal —<br />not a five-star review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Problem Section with Tabs
function ProblemSection() {
  const [activeTab, setActiveTab] = useState<'customer' | 'photographer'>('customer');
  const { ref, isVisible } = useScrollReveal();

  const customerProblems = [
    'No transparency into a photographer\'s real track record — reviews are easily gamed, portfolios curated or borrowed.',
    'Fake or misleading portfolios, with no verification of authorship or actual delivery.',
    'Pricing confusion — inconsistent packages make comparing vendors apples-to-apples nearly impossible.',
    'No recourse if a photographer cancels last-minute, loses data, or delivers late.',
  ];

  const photographerProblems = [
    'High customer acquisition cost — heavy reliance on word-of-mouth or expensive ad spend.',
    'No structured tools for contracts, milestone payments, or delivery workflow — managed manually over chat.',
    'Payment risk — customers delaying or disputing final payment after delivery, with no neutral escrow mechanism.',
  ];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-2xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              A Fragmented, Low-Trust Marketplace
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mb-4">
            Two sides, waiting on the same missing piece.
          </h2>
          <p className="text-brand-grey text-lg">
            Directories list vendors. They don&apos;t verify quality, guarantee delivery, or protect either side financially — so both sides are left carrying the risk alone.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className={`flex gap-2 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'customer'
              ? 'bg-sindoor/10 text-sindoor border-2 border-sindoor'
              : 'bg-ink/5 text-ink-soft border-2 border-transparent hover:bg-ink/10'
              }`}
          >
            <Users size={18} className="inline mr-2" />
            Customer
          </button>
          <button
            onClick={() => setActiveTab('photographer')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'photographer'
              ? 'bg-marigold/20 text-amber-900 border-2 border-marigold'
              : 'bg-ink/5 text-ink-soft border-2 border-transparent hover:bg-ink/10'
              }`}
          >
            <Camera size={18} className="inline mr-2" />
            For Photographers
          </button>
        </div>

        {/* Content Card */}
        <div className={`relative bg-brand-white rounded-2xl border border-ink/10 overflow-hidden transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Decorative Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-parchment border border-ink/10" />

          <div className="p-8 lg:p-10">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase mb-6 ${activeTab === 'customer' ? 'bg-red-100 text-sindoor-deep' : 'bg-amber-100 text-amber-900'
              }`}>
              {activeTab === 'customer' ? 'Customers' : 'The Photographer'}
            </div>

            <div className="space-y-4">
              {(activeTab === 'customer' ? customerProblems : photographerProblems).map((problem, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-brand-grey font-display">—</span>
                  <p className="text-ink-soft leading-relaxed">{problem}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal();
  const clauses = [
    { num: '01', term: 'Matching', title: 'AI Matching Engine', desc: 'A guided questionnaire on style, budget, location, date, and coverage hours returns a ranked shortlist of the top 5 photographers — not an endless scroll.' },
    { num: '02', term: 'Identity', title: 'Verification Badge', desc: 'Identity, business registration, and portfolio-authorship checks — completed before a photographer is ever listed as "Verified."' },
    { num: '03', term: 'Scoring', title: 'Composite Trust Scores', desc: 'Portfolio Quality, On-Time Delivery, and Customer Satisfaction — each computed from verified, platform-tracked data, not open-ended reviews.' },
    { num: '04', term: 'Payment', title: 'Escrow Payments', desc: 'Couples pay into escrow at booking. Funds release on milestone completion: booking confirmed, event completed, gallery delivered.' },
    { num: '05', term: 'Timeline', title: 'Delivery Workflow', desc: 'A shared timeline for shoot date, editing milestones, and final delivery — visible to both Customers and the photographer.' },
    { num: '06', term: 'Guarantee', title: 'Protection Plan', desc: 'Coverage for cancellation, data loss, and delayed delivery, with a defined refund policy — the safety net for a day with no re-shoot.' },
    { num: '07', term: 'Pricing', title: 'Standardized Packages', desc: 'Photographers map their offerings to common tiers — hours, deliverables, albums, second shooter — so couples compare like-for-like.' },
  ];

  return (
    <section id="how" ref={ref} className="py-20 lg:py-32 bg-ink text-parchment relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`max-w-2xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-marigold" />
            <span className="font-mono text-xs font-semibold text-marigold tracking-widest uppercase">
              The Terms of the Promise
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Seven clauses, not seven features.
          </h2>
          <p className="text-parchment/70 text-lg">
            Each one exists because a directory listing, left alone, has failed a couple or a photographer before.
          </p>
        </div>

        <div className="border-t border-parchment/10">
          {clauses.map((clause, index) => (
            <div
              key={clause.num}
              className={`grid lg:grid-cols-[90px_1fr_1fr] gap-4 lg:gap-8 py-8 border-b border-parchment/10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="font-mono text-marigold text-lg font-medium">{clause.num}</div>
              <div>
                <div className="font-mono text-xs text-parchment/50 uppercase tracking-widest mb-2">{clause.term}</div>
                <h3 className="font-display text-xl text-white font-medium">{clause.title}</h3>
              </div>
              <p className="text-parchment/70 leading-relaxed lg:max-w-md">{clause.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Trust Scores Section
function TrustScoresSection() {
  const { ref, isVisible } = useScrollReveal();
  const scores: { score: number; title: string; desc: string; icon: any; isDecimal?: boolean }[] = [
    { score: 92, title: 'Portfolio Quality Score', desc: 'Authorship-verified work, judged on real delivered galleries — not a curated highlight reel.', icon: Camera },
    { score: 96, title: 'On-Time Delivery Score', desc: 'Tracked directly against the shared delivery workflow timeline, milestone by milestone.', icon: Clock },
    { score: 4, title: 'Customer Satisfaction Score', desc: 'Drawn from structured post-event surveys — closed, verified, and far harder to game.', icon: Star },
  ];

  return (
    <section id="trust" ref={ref} className="py-20 lg:py-32 bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Verified, Not Self-Reported
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mb-4">
            Three scores, stamped from real data.
          </h2>
          <p className="text-brand-grey text-lg">
            Every score below is drawn from tracked platform activity — not from a review box anyone can fill in.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {scores.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group bg-brand-white rounded-2xl border border-ink/10 p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center border-2 border-dashed border-marigold/30 group-hover:scale-110 transition-transform duration-500">
                  {item.isDecimal ? (
                    <span className="font-display text-3xl font-bold text-marigold-soft">
                      <AnimatedCounter end={item.score * 10} duration={2000} />
                    </span>
                  ) : (
                    <span className="font-display text-3xl font-bold text-marigold-soft">
                      <AnimatedCounter end={item.score} duration={2000} />
                    </span>
                  )}
                </div>
                <Icon size={24} className="text-sindoor mx-auto mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-display text-xl text-ink font-semibold mb-3">{item.title}</h3>
                <p className="text-brand-grey leading-relaxed text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Photographer Portfolio Section
function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { ref, isVisible } = useScrollReveal();
  const filters = ['all', 'Traditional', 'Cinematic', 'Candid'];

  const photographers = [
    { name: 'Priya Sharma', style: 'Cinematic', onTime: 98, quality: 94, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop' },
    { name: 'Arjun Reddy', style: 'Traditional', onTime: 96, quality: 91, img: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=500&fit=crop' },
    { name: 'Meera Krishnan', style: 'Candid', onTime: 100, quality: 97, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=500&fit=crop' },
    { name: 'Vikram Das', style: 'Cinematic', onTime: 94, quality: 89, img: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=500&fit=crop' },
  ];

  const filtered = activeFilter === 'all' ? photographers : photographers.filter(p => p.style === activeFilter);

  return (
    <section id="portfolio" ref={ref} className="py-20 lg:py-32 bg-parchment-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-2xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Verified Partners
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mb-4">
            Meet Our Verified Partners
          </h2>
          <p className="text-brand-grey text-lg">
            Every photographer is vetted for quality, reliability, and professionalism before joining the platform.
          </p>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap gap-3 mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${activeFilter === filter
                ? 'bg-sindoor text-white'
                : 'bg-brand-white text-ink-soft hover:bg-ink/10'
                }`}
            >
              {filter === 'all' ? 'All Styles' : filter}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((photographer, index) => (
            <div
              key={photographer.name}
              className={`group bg-brand-white rounded-2xl overflow-hidden border border-ink/10 hover:shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={photographer.img}
                  alt={photographer.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Link to="/auth" className="w-full py-2 bg-sindoor text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-sindoor-deep transition-colors">
                    View Portfolio <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-semibold text-ink">{photographer.name}</h3>
                  <span className="px-2 py-1 bg-marigold/10 text-marigold text-xs font-medium rounded">
                    {photographer.style}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-sage">
                    <Clock size={14} />
                    <span className="font-medium">{photographer.onTime}%</span>
                    <span className="text-brand-grey">on-time</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sindoor">
                    <Award size={14} />
                    <span className="font-medium">{photographer.quality}%</span>
                    <span className="text-brand-grey">quality</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Comparison Table Section
function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal();
  const comparisons = [
    { capability: 'Vendor discovery & reviews', incumbent: 'Yes', picpromise: 'Yes' },
    { capability: 'AI-matched shortlist', incumbent: 'No', picpromise: 'Top 5 from a guided questionnaire' },
    { capability: 'Verified quality scoring', incumbent: 'Self-reported only', picpromise: 'Verification badge + 3 composite scores' },
    { capability: 'Escrow / milestone payments', incumbent: 'No', picpromise: 'Yes' },
    { capability: 'Delivery workflow management', incumbent: 'No', picpromise: 'Yes' },
    { capability: 'Cancellation / delay protection', incumbent: 'No', picpromise: 'Yes' },
    { capability: 'Standardized, comparable packages', incumbent: 'No', picpromise: 'Yes' },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-parchment-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-2xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Why Not Just Use a Directory
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mb-4">
            Discovery was never the hard part.
          </h2>
          <p className="text-brand-grey text-lg">
            WeddingWire, The Knot, and WedMeGood monetize listings and reviews. None of them own the transaction, the guarantee, or the delivery workflow — they stop at discovery.
          </p>
        </div>

        <div className={`bg-brand-white rounded-2xl border border-ink/10 overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Header */}
          <div className="grid grid-cols-3 bg-ink text-parchment">
            <div className="p-4 lg:p-5 font-mono text-xs uppercase tracking-widest">Capability</div>
            <div className="p-4 lg:p-5 font-mono text-xs uppercase tracking-widest border-l border-parchment/10">Incumbents</div>
            <div className="p-4 lg:p-5 font-mono text-xs uppercase tracking-widest border-l border-parchment/10">PicPromise</div>
          </div>

          {/* Rows */}
          {comparisons.map((row) => (
            <div key={row.capability} className="grid grid-cols-3 border-t border-ink/10 hover:bg-ink/5 transition-colors">
              <div className="p-4 lg:p-5 font-medium text-ink-soft">{row.capability}</div>
              <div className={`p-4 lg:p-5 border-l border-ink/10 ${row.incumbent === 'Yes' ? 'text-sage font-medium' : 'text-red-400'}`}>
                {row.incumbent}
              </div>
              <div className={`p-4 lg:p-5 border-l border-ink/10 ${row.picpromise === 'Yes' ? 'text-sage font-semibold' : 'text-sage font-medium'}`}>
                {row.picpromise}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Personas Section
function PersonasSection() {
  const { ref, isVisible } = useScrollReveal();
  const personas = [
    {
      role: 'The Planning Couple',
      title: '24–32, planning 4–9 months out.',
      desc: 'Overwhelmed by choice, short on time, and anxious about being let down on the one day that can\'t be redone.',
      wants: 'a short, guided decision process; proof of real quality; a safety net.',
      icon: Heart,
      color: 'sindoor',
    },
    {
      role: 'The Independent Photographer',
      title: 'A small team of 1–5, wearing every hat.',
      desc: 'Juggling shooting, editing, client communication, and collections — all manually, all at once.',
      wants: 'qualified leads, fewer payment disputes, less admin overhead.',
      icon: Camera,
      color: 'marigold',
    },
  ];

  return (
    <section id="personas" ref={ref} className="py-20 lg:py-32 bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-2xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Built Around Two People
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink">
            Not personas — the two sides of the same booking.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.role}
                className={`bg-brand-white rounded-2xl border border-ink/10 p-8 hover:shadow-xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-widest uppercase mb-4 ${persona.color === 'sindoor' ? 'bg-red-100 text-sindoor-deep' : 'bg-amber-100 text-amber-900'
                  }`}>
                  <Icon size={14} />
                  {persona.role}
                </div>
                <h3 className="font-display text-2xl text-ink font-semibold mb-4">{persona.title}</h3>
                <p className="text-brand-grey leading-relaxed mb-6">{persona.desc}</p>
                <div className="pt-4 border-t border-dashed border-ink/10">
                  <span className="text-sm text-ink-soft">
                    <strong className="text-ink">Wants:</strong> {persona.wants}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Cities Section
function CitiesSection() {
  const { ref, isVisible } = useScrollReveal();
  const cities = [
    { name: 'Hyderabad', idx: '01', img: 'https://images.unsplash.com/photo-1572872991400-9b4b5b8476a4?w=600&h=400&fit=crop' },
    { name: 'Bengaluru', idx: '02', img: 'https://images.unsplash.com/photo-1596176530559-8655423bbd33?w=600&h=400&fit=crop' },
    { name: 'Chennai', idx: '03', img: 'https://images.unsplash.com/photo-1582510003544-a4717-ddf15418c5af?w=600&h=400&fit=crop' },
  ];

  return (
    <section id="cities" ref={ref} className="py-20 lg:py-32 bg-parchment-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Go-to-Market
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink mb-4">
            Launching supply-first, in three cities.
          </h2>
          <p className="text-brand-grey text-lg">
            100 verified photographers onboarded before heavy demand-side marketing begins — so day-one matching has quality inventory behind it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cities.map((city, index) => (
            <div
              key={city.name}
              className={`group bg-brand-white rounded-2xl overflow-hidden border border-ink/10 hover:shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin size={40} className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="font-mono text-marigold font-semibold text-sm mb-2 tracking-wider">CITY {city.idx}</div>
                <h3 className="font-display text-2xl text-ink">{city.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Accordion Section
function FAQSection() {
  const { ref, isVisible } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: 'How does the escrow payment system work?',
      answer: 'When you book a photographer, your payment is held securely in escrow. Funds are released in milestones: a portion when booking is confirmed, more when the event is completed, and the final payment when your gallery is delivered. This protects both you and the photographer.',
    },
    {
      question: 'What if the photographer cancels last-minute?',
      answer: "Our Protection Plan covers photographer cancellations. If a verified photographer cancels within 30 days of your event, we'll help you find a replacement from our network or provide a full refund. Your payment in escrow is always protected.",
    },
    {
      question: 'How are photographers verified?',
      answer: 'Every photographer undergoes identity verification, business registration checks, and portfolio authorship verification. We review actual delivered galleries from past events to ensure quality. Only verified photographers receive our seal.',
    },
    {
      question: 'What happens if my photos are delayed?',
      answer: 'Our delivery workflow tracks timelines for both Customers and photographer. If a photographer misses agreed deadlines, our Protection Plan kicks in with defined refund policies. We monitor delivery milestones to ensure accountability.',
    },
    {
      question: 'Can I compare photographers easily?',
      answer: 'Yes! All photographers use standardized package structures showing hours, deliverables, albums, and add-ons. This makes comparing offerings straightforward, plus each photographer has verified Trust Scores for quality and reliability.',
    },
    {
      question: 'What is the matching process?',
      answer: "Complete a quick questionnaire about your style preferences, budget, location, and coverage needs. Our AI engine analyzes our verified network and returns your top 5 matches — eliminating endless scrolling and guesswork.",
    },
  ];

  return (
    <section id="faq" ref={ref} className="py-20 lg:py-32 bg-parchment">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sindoor" />
            <span className="font-mono text-xs font-semibold text-sindoor tracking-widest uppercase">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink">
            Got questions? We&apos;ve got answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-brand-white rounded-xl border border-ink/10 overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-ink/5 transition-colors"
              >
                <span className="font-medium text-ink">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-brand-grey flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-48' : 'max-h-0'
                  }`}
              >
                <p className="px-6 pb-6 text-brand-grey leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ onOpenModal }: { onOpenModal: () => void }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-sindoor text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4">
            Book with a promise, not a guess.
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Answer a short questionnaire and get your top 5 verified photographers — escrow-protected, from booking to delivery.
          </p>
          <button
            onClick={onOpenModal}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-sindoor font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Find My Photographer
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="mt-12 pt-6 border-t border-white/30 font-mono text-xs tracking-widest text-white/70">
            SEALED · ESCROW-PROTECTED · DELIVERY-GUARANTEED
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const footerLinks = {
    Product: ['How it works', 'Trust & Safety', 'Protection Plan', 'Pricing'],
    'For Photographers': ['Get verified', 'Milestone payouts', 'Become a partner'],
    Company: ['About', 'Launch cities', 'Contact'],
  };

  return (
    <footer className="bg-ink text-parchment/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-10 pb-10 border-b border-parchment/10">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sindoor to-sindoor-deep flex items-center justify-center">
                <span className="text-marigold-soft font-display font-bold text-lg">P</span>
              </div>
              <span className="font-display font-semibold text-xl text-white">PicPromise</span>
            </a>
            <p className="text-sm leading-relaxed">
              A trust layer for wedding photography bookings — verified photographers, escrow-protected payments, and a delivery guarantee.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
          <p className="text-xs">© 2026 PicPromise. All rights reserved.</p>
          <p className="text-xs">Hyderabad · Bengaluru · Chennai</p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFindPhotographer = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-parchment font-sans antialiased">
      <Navigation />
      <main>
        <HeroSection onOpenModal={handleFindPhotographer} />
        <ProblemSection />
        <FeaturesSection />
        <TrustScoresSection />
        <PortfolioSection />
        <ComparisonSection />
        <PersonasSection />
        <CitiesSection />
        <FAQSection />
        <CTASection onOpenModal={handleFindPhotographer} />
      </main>
      <Footer />
      <AIMatchingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
