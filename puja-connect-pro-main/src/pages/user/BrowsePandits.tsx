import { useState } from 'react';
import { usePandits } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, MapPin, CheckCircle, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

const CITIES = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Bhubaneswar'];

const BrowsePandits = () => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const { data: pandits, isLoading, error } = usePandits(cityFilter !== 'All' ? { city: cityFilter } : {});

  const filtered = (pandits || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.languages.some(l => l.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Find Pandits</h1>
        <p className="text-muted-foreground mt-1">Browse verified priests near you</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or language..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CITIES.map(city => (
            <Button key={city} variant={cityFilter === city ? 'default' : 'outline'} size="sm"
              onClick={() => setCityFilter(city)}
              className={cityFilter === city ? 'bg-primary text-primary-foreground' : ''}>
              {city}
            </Button>
          ))}
        </div>
      </div>

      {error && <div className="text-center py-10 text-destructive">Failed to load pandits. Please try again.</div>}

      <div className="grid sm:grid-cols-2 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6 flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          : filtered.map(pandit => (
              <Card key={pandit.userId} className="bg-card border-border hover:shadow-saffron transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                      {pandit.avatar || '🙏'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-card-foreground">{pandit.name}</h3>
                        {pandit.verified && <CheckCircle className="h-4 w-4 text-success shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pandit.city}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{pandit.rating} ({pandit.reviewCount})</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pandit.bio}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Languages className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{pandit.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-primary">₹{pandit.pricePerHour.toLocaleString()}/hr</span>
                        <Link to={`/user/book?pandit=${pandit.userId}`}>
                          <Button size="sm" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">Book</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        }
      </div>
    </div>
  );
};

export default BrowsePandits;
