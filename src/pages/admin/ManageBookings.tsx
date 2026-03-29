import { useAdminBookings, useAdminCancelBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

const ManageBookings = () => {
  const { data: bookings, isLoading } = useAdminBookings();
  const cancelBooking = useAdminCancelBooking();

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking.mutateAsync(id);
        toast.success('Booking cancelled');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to cancel booking');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Manage Bookings</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Booking</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Pandit</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                  ))
                : (bookings || []).map(b => (
                    <tr key={b.id} className="border-b border-border last:border-0">
                      <td className="p-4 text-muted-foreground font-mono text-xs">{b.id.slice(0, 8)}…</td>
                      <td className="p-4 text-foreground">{b.userName}</td>
                      <td className="p-4 text-muted-foreground">{b.panditName}</td>
                      <td className="p-4 text-muted-foreground">{b.date}</td>
                      <td className="p-4 font-medium text-foreground">₹{b.totalPrice.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 h-8 px-2"
                            onClick={() => handleCancel(b.id)}
                            disabled={cancelBooking.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
