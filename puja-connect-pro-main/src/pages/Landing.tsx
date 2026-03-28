import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Shield, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePujaTypes, usePandits } from '@/hooks/useApi';

const Landing = () => {
  const { data: pujaTypes, isLoading: loadingPujas } = usePujaTypes();
  const { data: pandits, isLoading: loadingPandits } = usePandits();

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            <span className="font-display text-xl font-bold text-foreground">NanaConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-warm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-8xl animate-float">🕉️</div>
          <div className="absolute top-40 right-20 text-6xl animate-float" style={{ animationDelay: '1s' }}>🪷</div>
          <div className="absolute bottom-20 left-1/3 text-7xl animate-float" style={{ animationDelay: '2s' }}>🔔</div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Book Trusted Pandits for{' '}
              <span className="text-gradient-saffron">Sacred Ceremonies</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with verified, experienced priests for all your religious ceremonies and rituals. From Griha Pravesh to Satyanarayan Puja.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground shadow-saffron px-8">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Browse Pandits</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
          >
            {[
              { label: 'Verified Pandits', value: '500+' },
              { label: 'Pujas Completed', value: '10K+' },
              { label: 'Happy Families', value: '8K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient-saffron">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Why Choose NanaConnect?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Verified Pandits', desc: 'All priests are verified with background checks and credentials.' },
              { icon: Star, title: 'Top Rated', desc: 'Choose from highly rated pandits with genuine reviews.' },
              { icon: Clock, title: 'Flexible Booking', desc: 'Book by hour or package. Pick a date and time that works for you.' },
              { icon: MapPin, title: 'Pan India', desc: 'Find pandits in your city speaking your preferred language.' },
            ].map((f) => (
              <motion.div key={f.title} whileHover={{ y: -4 }}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-saffron transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Pujas — live from API */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Popular Pujas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingPujas
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-5 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))
              : (Array.isArray(pujaTypes) ? pujaTypes : []).slice(0, 4).map((puja) => (
                  <motion.div key={puja.id} whileHover={{ y: -4 }}
                    className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                    <div className="h-32 bg-gradient-saffron flex items-center justify-center">
                      <span className="text-5xl">{puja.image}</span>
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{puja.category}</span>
                      <h3 className="font-display text-lg font-semibold mt-3 text-card-foreground">{puja.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{puja.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold text-primary">₹{puja.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{puja.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Top Pandits — live from API */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Top Rated Pandits</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingPandits
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ))
              : (Array.isArray(pandits) ? pandits : []).slice(0, 4).map((pandit) => (
                  <motion.div key={pandit.userId} whileHover={{ y: -4 }}
                    className="bg-card rounded-xl p-6 border border-border shadow-sm text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-4xl">
                      {pandit.avatar || '🙏'}
                    </div>
                    <h3 className="font-display font-semibold text-card-foreground">{pandit.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pandit.city}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium text-foreground">{pandit.rating}</span>
                      <span className="text-xs text-muted-foreground">({pandit.reviewCount})</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 mt-3">
                      {(pandit.languages || []).slice(0, 2).map(l => (
                        <span key={l} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{l}</span>
                      ))}
                    </div>
                    <p className="text-primary font-bold mt-3">₹{pandit.pricePerHour}/hr</p>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-warm">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Book Your Puja?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of families who trust NanaConnect for their sacred ceremonies.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground shadow-saffron px-10">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🕉️</span>
            <span className="font-display text-xl font-bold text-foreground">NanaConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">Connecting devotees with trusted pandits across India.</p>
          <p className="text-xs text-muted-foreground mt-4">© 2026 NanaConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
