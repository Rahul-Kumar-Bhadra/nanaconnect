import { useState } from 'react';
import { useAdminAllPandits, useAdminDeletePandit, useVerifyPandit, PanditProfile } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, XCircle, Star, Trash2, Ban, ShieldCheck, 
  Eye, GraduationCap, Languages, MapPin, IndianRupee, Clock, BookOpen 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  suspended: 'bg-destructive/10 text-destructive',
};

const ManagePandits = () => {
  const { data: pandits, isLoading } = useAdminAllPandits();
  const verifyPandit = useVerifyPandit();
  const deletePandit = useAdminDeletePandit();
  const [selectedPandit, setSelectedPandit] = useState<PanditProfile | null>(null);

  const handleAction = async (id: string, action: 'verify' | 'suspend') => {
    try {
      await verifyPandit.mutateAsync({ id, action });
      toast.success(action === 'verify' ? 'Pandit activated!' : 'Pandit suspended');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} pandit`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY remove this pandit identity? The user will remain a normal devotee.')) {
      try {
        await deletePandit.mutateAsync(id);
        toast.success('Pandit profile removed');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to remove pandit');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Manage Pandits</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-4 font-medium text-muted-foreground">City</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Experience</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                  ))
                : (pandits || []).map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-foreground font-medium">{p.name}</td>
                      <td className="p-4 text-muted-foreground">{p.city}</td>
                      <td className="p-4 text-muted-foreground">{p.experience} yrs</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-foreground">
                          <Star className="h-3 w-3 fill-warning text-warning" />{p.rating}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[p.status || (p.verified ? 'active' : 'pending')]}`}>
                          {p.status || (p.verified ? 'active' : 'pending')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="View Details"
                                onClick={() => setSelectedPandit(p)}
                              >
                                <Eye className="h-4 w-4 text-primary" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Pandit Profile Details</DialogTitle>
                              </DialogHeader>
                              {selectedPandit && (
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                                      {selectedPandit.avatar || '🙏'}
                                    </div>
                                    <div>
                                      <h3 className="font-display text-lg font-bold">{selectedPandit.name}</h3>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {selectedPandit.city}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Experience</p>
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" /> {selectedPandit.experience} Years
                                      </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Pricing</p>
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        <IndianRupee className="h-4 w-4 text-primary" /> ₹{selectedPandit.pricePerHour}/hr
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Languages</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedPandit.languages?.map(l => (
                                        <span key={l} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                                          {l}
                                        </span>
                                      )) || 'N/A'}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Specializations</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedPandit.specializations?.map(s => (
                                        <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                                          {s}
                                        </span>
                                      )) || 'N/A'}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" /> Bio
                                    </p>
                                    <p className="text-sm text-foreground italic leading-relaxed">
                                      "{selectedPandit.bio || 'No bio provided'}"
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2 flex items-center gap-1 px-1">
                                      <Clock className="h-3 w-3" /> Availability Slots
                                    </p>
                                    <div className="space-y-2">
                                      {((selectedPandit as any).availability?.length > 0) ? (
                                        (selectedPandit as any).availability.map((slot: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/30 border border-border/50">
                                            <span className="font-medium text-primary">{slot.date}</span>
                                            <span className="text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-muted-foreground px-1">No availability slots set</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {p.status !== 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Activate/Verify"
                              onClick={() => handleAction(p.id, 'verify')} 
                              disabled={verifyPandit.isPending}
                            >
                              <ShieldCheck className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {p.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Suspend"
                              onClick={() => handleAction(p.id, 'suspend')} 
                              disabled={verifyPandit.isPending}
                            >
                              <Ban className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Remove Identity"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(p.id)} 
                            disabled={deletePandit.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default ManagePandits;
