import { usePanditBookings, useRespondBooking } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const PanditBookings = () => {
  const { data: bookings, isLoading } = usePanditBookings();
  const respond = useRespondBooking();

  const handle = async (id: string, action: 'accept' | 'reject') => {
    await respond.mutateAsync({ id, action });
    toast.success(action === 'accept' ? 'Booking accepted!' : 'Booking rejected');
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Bookings</h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : (bookings || []).length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(bookings || []).map(b => (
            <Card key={b.id} className="bg-card border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-card-foreground">{b.pujaName}</h3>
                    <p className="text-sm text-muted-foreground">Customer: {b.userName}</p>
                    <p className="text-sm text-muted-foreground">{b.date} at {b.time}</p>
                    <p className="text-xs text-muted-foreground mt-1">{b.address}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-primary">₹{b.totalPrice.toLocaleString()}</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    {b.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handle(b.id, 'accept')} disabled={respond.isPending}
                          className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => handle(b.id, 'reject')} disabled={respond.isPending}
                          className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanditBookings;
