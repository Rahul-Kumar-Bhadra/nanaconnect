import { useAuth } from '@/contexts/AuthContext';
import { usePanditBookings } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Star, DollarSign, Clock, CheckCircle } from 'lucide-react';

const PanditDashboard = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = usePanditBookings();

  const pending = (bookings || []).filter(b => b.status === 'pending');
  const completed = (bookings || []).filter(b => b.status === 'completed');
  const totalEarnings = completed.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome, {user?.name?.split(' ').pop() || 'Pandit'} ji 🙏
        </h1>
        <p className="text-muted-foreground mt-1">Your dashboard overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: (bookings || []).length, icon: Calendar, color: 'text-primary' },
          { label: 'Pending', value: pending.length, icon: Clock, color: 'text-warning' },
          { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-success' },
          { label: 'Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-xl font-bold text-foreground">{stat.value}</p>}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Pending Requests</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : pending.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="p-6 text-center text-muted-foreground">No pending bookings.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pending.map(b => (
              <Card key={b.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{b.pujaName}</p>
                    <p className="text-sm text-muted-foreground">{b.userName} · {b.date} at {b.time}</p>
                  </div>
                  <span className="font-bold text-primary">₹{b.totalPrice.toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanditDashboard;
