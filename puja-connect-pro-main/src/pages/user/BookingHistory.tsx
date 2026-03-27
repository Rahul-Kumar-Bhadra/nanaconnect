import { useMyBookings, useSubmitReview } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
};

const BookingHistory = () => {
  const { data: bookings, isLoading } = useMyBookings();
  const submitReview = useSubmitReview();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleReview = async (bookingId: string) => {
    await submitReview.mutateAsync({ bookingId, rating, comment });
    toast.success('Review submitted!');
    setReviewingId(null);
    setComment('');
    setRating(5);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-1">View and track your booking history</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : (bookings || []).length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(bookings || []).map(booking => (
            <Card key={booking.id} className="bg-card border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">🙏</div>
                    <div>
                      <h3 className="font-medium text-card-foreground">{booking.pujaName}</h3>
                      <p className="text-sm text-muted-foreground">by {booking.panditName}</p>
                      <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">{booking.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-bold text-primary">₹{booking.totalPrice.toLocaleString()}</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => setReviewingId(booking.id)}>Rate</Button>
                    )}
                  </div>
                </div>
                {reviewingId === booking.id && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3 border border-border">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setRating(s)}
                          className={`text-2xl ${s <= rating ? 'text-warning' : 'text-muted-foreground'}`}>★</button>
                      ))}
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-2 rounded-md border border-border bg-background text-foreground text-sm resize-none h-20" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReview(booking.id)} disabled={submitReview.isPending}>
                        {submitReview.isPending ? 'Submitting...' : 'Submit'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReviewingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
