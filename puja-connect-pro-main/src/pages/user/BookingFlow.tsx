import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePujaTypes, usePandits, useCreateBooking, useCreatePaymentOrder, useVerifyPayment } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpay = (): Promise<boolean> => {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingFlow = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedPuja = searchParams.get('puja');
  const preselectedPandit = searchParams.get('pandit');

  const [step, setStep] = useState(preselectedPuja ? 2 : 1);
  const [selectedPuja, setSelectedPuja] = useState(preselectedPuja || '');
  const [selectedPandit, setSelectedPandit] = useState(preselectedPandit || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const { data: pujaTypes, isLoading: loadingPujas } = usePujaTypes();
  const { data: pandits, isLoading: loadingPandits } = usePandits();
  const createBooking = useCreateBooking();
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const puja = (pujaTypes || []).find(p => p.id === selectedPuja);
  const pandit = (pandits || []).find(p => p.userId === selectedPandit);
  const totalPrice = pandit ? pandit.pricePerHour * durationHours : 0;

  const STEPS = ['Select Puja', 'Select Pandit', 'Details', 'Payment'];

  const handlePayAndBook = async () => {
    if (!selectedPuja || !selectedPandit || !date || !time || !address) {
      toast.error('Please fill all required fields');
      return;
    }
    setPaying(true);

    try {
      // 1. Create booking in backend
      const booking = await createBooking.mutateAsync({
        panditId: selectedPandit,
        pujaTypeId: selectedPuja,
        date,
        time,
        durationHours,
        address,
        notes,
      });

      // 2. Create Razorpay order
      const order = await createOrder.mutateAsync(booking.id);

      // 3. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setPaying(false);
        return;
      }

      // 4. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.order_id,
        name: 'NanaConnect',
        description: `${puja?.name} with ${pandit?.name}`,
        prefill: {},
        theme: { color: '#E65C00' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // 5. Verify payment on backend
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Booking confirmed! The pandit will reach out shortly.');
            navigate('/user/bookings');
          } catch {
            toast.error('Payment verification failed. Contact support with your payment ID.');
          }
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      toast.error('Booking failed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <h1 className="font-display text-2xl font-bold text-foreground">Book a Puja</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{i + 1 < step ? '✓' : i + 1}</div>
            <span className={`text-sm hidden sm:block ${i + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < 3 && <div className={`w-6 h-0.5 ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Puja */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">Choose a puja ceremony:</p>
          {loadingPujas
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            : (pujaTypes || []).map(p => (
                <Card key={p.id} onClick={() => setSelectedPuja(p.id)} className={`cursor-pointer transition-all ${
                  selectedPuja === p.id ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
                }`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.image}</span>
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.duration}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">₹{p.price.toLocaleString()}</span>
                  </CardContent>
                </Card>
              ))
          }
          <Button onClick={() => setStep(2)} disabled={!selectedPuja} className="w-full bg-gradient-saffron hover:opacity-90 text-primary-foreground">
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Select Pandit */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">Choose a pandit:</p>
          {loadingPandits
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            : (pandits || []).filter(p => p.verified).map(p => (
                <Card key={p.userId} onClick={() => setSelectedPandit(p.userId)} className={`cursor-pointer transition-all ${
                  selectedPandit === p.userId ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
                }`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">{p.avatar || '🙏'}</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        <p className="text-sm text-muted-foreground">{p.experience} yrs · {p.city}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-warning text-warning" />{p.rating} ({p.reviewCount})
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-primary">₹{p.pricePerHour}/hr</span>
                  </CardContent>
                </Card>
              ))
          }
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedPandit} className="flex-1 bg-gradient-saffron hover:opacity-90 text-primary-foreground">
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Date/Time/Address */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} className="mt-1" />
            </div>
            <div>
              <Label>Time *</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Duration (hours)</Label>
            <Input type="number" min={1} max={12} value={durationHours}
              onChange={e => setDurationHours(parseInt(e.target.value) || 1)} className="mt-1" />
          </div>
          <div>
            <Label>Puja Address *</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Full address where puja will be held" className="mt-1" />
          </div>
          <div>
            <Label>Special Instructions (optional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special requests..." className="mt-1" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(4)} disabled={!date || !time || !address}
              className="flex-1 bg-gradient-saffron hover:opacity-90 text-primary-foreground">
              Review <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Summary + Pay */}
      {step === 4 && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Booking Summary</h3>
              {[
                { label: 'Puja', value: puja?.name },
                { label: 'Pandit', value: pandit?.name },
                { label: 'Date', value: date },
                { label: 'Time', value: time },
                { label: 'Duration', value: `${durationHours} hour${durationHours > 1 ? 's' : ''}` },
                { label: 'Address', value: address },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
            <Button onClick={handlePayAndBook} disabled={paying}
              className="flex-1 bg-gradient-saffron hover:opacity-90 text-primary-foreground">
              {paying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : `Pay ₹${totalPrice.toLocaleString()}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
