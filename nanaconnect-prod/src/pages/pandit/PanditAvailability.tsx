import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSetAvailability } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SlotForm { id: string; date: string; startTime: string; endTime: string; }

const PanditAvailability = () => {
  const { data: initialData, isLoading } = useQuery<any[]>({
    queryKey: ['pandit-availability-me'],
    queryFn: async () => {
      const res = await api.get('/pandits/me');
      return res.data.availability || [];
    },
  });

  const [slots, setSlots] = useState<SlotForm[]>([
    { id: '1', date: '', startTime: '08:00', endTime: '17:00' },
  ]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSlots(initialData.map((s, i) => ({
        id: String(i + 1),
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime
      })));
    }
  }, [initialData]);

  const setAvailability = useSetAvailability();

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const addSlot = () => setSlots([...slots, { id: Date.now().toString(), date: '', startTime: '08:00', endTime: '17:00' }]);
  const removeSlot = (id: string) => setSlots(slots.filter(s => s.id !== id));
  const updateSlot = (id: string, field: keyof SlotForm, value: string) =>
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    const incomplete = slots.some(s => !s.date);
    if (incomplete) { toast.error('Please fill in all dates'); return; }
    await setAvailability.mutateAsync(
      slots.map(s => ({ panditId: '', date: s.date, startTime: s.startTime, endTime: s.endTime, isAvailable: true }))
    );
    toast.success('Availability saved successfully!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Availability</h1>
          <p className="text-muted-foreground mt-1">Set your available dates and time slots</p>
        </div>
        <Button onClick={addSlot} size="sm" className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Slot
        </Button>
      </div>

      <div className="space-y-3">
        {slots.map(slot => (
          <Card key={slot.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Date *</Label>
                    <Input type="date" value={slot.date} min={new Date().toISOString().split('T')[0]}
                      onChange={e => updateSlot(slot.id, 'date', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input type="time" value={slot.startTime}
                      onChange={e => updateSlot(slot.id, 'startTime', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input type="time" value={slot.endTime}
                      onChange={e => updateSlot(slot.id, 'endTime', e.target.value)} className="mt-1" />
                  </div>
                </div>
                <button onClick={() => removeSlot(slot.id)}
                  className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={setAvailability.isPending}
        className="w-full bg-gradient-saffron hover:opacity-90 text-primary-foreground">
        {setAvailability.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Availability'}
      </Button>
    </div>
  );
};

export default PanditAvailability;
