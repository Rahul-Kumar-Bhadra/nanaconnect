import { useState } from 'react';
import { usePujaTypes } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const BrowsePujas = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: pujaTypes, isLoading, error } = usePujaTypes();

  const categories = ['All', ...new Set((pujaTypes || []).map(p => p.category))];
  const filtered = (pujaTypes || []).filter(p =>
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Browse Pujas</h1>
        <p className="text-muted-foreground mt-1">Explore sacred rituals and ceremonies</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pujas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'bg-primary text-primary-foreground' : ''}>
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-center py-10 text-destructive">Failed to load pujas. Please try again.</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          : filtered.map(puja => (
              <Card key={puja.id} className="bg-card border-border overflow-hidden hover:shadow-saffron transition-shadow">
                <div className="h-36 bg-gradient-saffron flex items-center justify-center">
                  <span className="text-6xl">{puja.image}</span>
                </div>
                <CardContent className="p-5">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{puja.category}</span>
                  <h3 className="font-display text-lg font-semibold mt-3 text-card-foreground">{puja.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{puja.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xl font-bold text-primary">₹{puja.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">{puja.duration}</span>
                    </div>
                    <Link to={`/user/book?puja=${puja.id}`}>
                      <Button size="sm" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
        }
      </div>
    </div>
  );
};

export default BrowsePujas;
