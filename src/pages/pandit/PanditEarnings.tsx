import { usePanditBookings } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp } from 'lucide-react';

const PanditEarnings = () => {
  const { data: bookings, isLoading } = usePanditBookings();
  const completed = (bookings || []).filter(b => b.status === 'completed');
  const total = completed.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Earnings</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold text-foreground">₹{total.toLocaleString()}</p>}
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold text-foreground">{completed.length}</p>}
              <p className="text-sm text-muted-foreground">Completed Bookings</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Earnings History</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : completed.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="p-6 text-center text-muted-foreground">No completed bookings yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {completed.map(b => (
              <Card key={b.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{b.pujaName}</p>
                    <p className="text-sm text-muted-foreground">{b.userName} · {b.date}</p>
                  </div>
                  <span className="text-lg font-bold text-success">+₹{b.totalPrice.toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanditEarnings;
