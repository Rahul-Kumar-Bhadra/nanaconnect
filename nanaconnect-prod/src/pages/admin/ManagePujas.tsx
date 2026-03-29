import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { usePujaTypes } from '@/hooks/useApi';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PujaForm {
  name: string;
  category: string;
  duration: string;
  price: string;
  description: string;
  image: string;
}

const EMPTY_FORM: PujaForm = { name: '', category: '', duration: '', price: '', description: '', image: '🙏' };

const ManagePujas = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PujaForm>(EMPTY_FORM);
  const { data: pujaTypes, isLoading } = usePujaTypes();
  const qc = useQueryClient();

  const createPuja = useMutation({
    mutationFn: async (data: PujaForm) => {
      const res = await api.post('/admin/puja-categories', {
        name: data.name,
        category: data.category,
        duration: data.duration,
        price: parseFloat(data.price),
        description: data.description,
        image: data.image,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['puja-types'] });
      toast.success('Puja type added!');
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || 'Failed to add puja type'),
  });

  const deletePuja = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/puja-categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['puja-types'] });
      toast.success('Puja type deleted');
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || 'Failed to delete puja type'),
  });

  const handleSave = () => {
    if (!form.name || !form.category || !form.price) {
      toast.error('Please fill in Name, Category, and Price');
      return;
    }
    createPuja.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Puja Types</h1>
        <Button onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); }} size="sm"
          className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">
          {showForm ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Plus className="h-4 w-4 mr-1" />Add Puja</>}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Satyanarayan Puja" className="mt-1" />
              </div>
              <div>
                <Label>Category *</Label>
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Prosperity" className="mt-1" />
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g., 2-3 hours" className="mt-1" />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="3100" className="mt-1" />
              </div>
              <div>
                <Label>Emoji Icon</Label>
                <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="🙏" className="mt-1" maxLength={2} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this puja ceremony..." className="mt-1" rows={3} />
            </div>
            <Button onClick={handleSave} disabled={createPuja.isPending}
              className="bg-gradient-saffron hover:opacity-90 text-primary-foreground">
              {createPuja.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Puja Type'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : (pujaTypes || []).map(puja => (
              <Card key={puja.id} className="bg-card border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{puja.image}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast.info('Edit coming soon')}>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePuja.mutate(puja.id)}
                        disabled={deletePuja.isPending}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-2 inline-block">
                    {puja.category}
                  </span>
                  <h3 className="font-display font-semibold mt-2 text-card-foreground">{puja.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{puja.description}</p>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="font-bold text-primary">₹{puja.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">{puja.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))
        }
      </div>
    </div>
  );
};

export default ManagePujas;
