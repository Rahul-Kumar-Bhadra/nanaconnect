import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Star, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, usePujaTypes } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const UserDashboard = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading: loadingBookings } = useMyBookings();
  const { data: pujaTypes } = usePujaTypes();

  const upcoming = (bookings || []).filter(b => b.status === 'confirmed' || b.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Namaste, {user?.name?.split(' ')[0] || 'User'} 🙏
        </h1>
        <p className="text-muted-foreground mt-1">Welcome to your dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: (bookings || []).length, icon: Calendar, color: 'text-primary' },
          { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'text-warning' },
          { label: 'Completed', value: (bookings || []).filter(b => b.status === 'completed').length, icon: Star, color: 'text-success' },
          { label: 'Pujas Available', value: (pujaTypes || []).length, icon: BookOpen, color: 'text-primary' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  {loadingBookings ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold text-foreground">{stat.value}</p>}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/user/pujas">
          <Card className="bg-card border-border hover:shadow-saffron transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="text-4xl">🪷</span>
              <div>
                <h3 className="font-display font-semibold text-card-foreground">Browse Pujas</h3>
                <p className="text-sm text-muted-foreground">Explore our collection of sacred rituals</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/user/pandits">
          <Card className="bg-card border-border hover:shadow-saffron transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <span className="text-4xl">📿</span>
              <div>
                <h3 className="font-display font-semibold text-card-foreground">Find Pandits</h3>
                <p className="text-sm text-muted-foreground">Browse verified priests near you</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Upcoming Bookings</h2>
          <Link to="/user/bookings">
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </Link>
        </div>
        {loadingBookings ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : upcoming.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming bookings. Browse pujas to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.slice(0, 3).map(booking => (
              <Card key={booking.id} className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{booking.date}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {booking.pujaName}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <UserIcon className="h-3.5 w-3.5" />
                        {booking.panditName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-border/50 mt-4">
                      <div className="text-sm font-medium text-foreground">
                        Time: <span className="text-muted-foreground">{booking.time}</span>
                      </div>
                      <div className="text-sm font-bold text-primary">
                      ₹{booking.totalPrice}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
