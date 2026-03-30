import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Loader2, Eye, User as UserIcon, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  phone?: string;
  createdAt: string;
}

const useAdminUsers = () =>
  useQuery<UserRecord[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
  });

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const devotees = (users || []).filter(u => u.role === 'user');

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete their associated data.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Users</h1>
        <span className="text-sm text-muted-foreground">{devotees.length} registered devotees</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground">City</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="p-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : devotees.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  )
                : devotees.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{u.name}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4 text-muted-foreground">{u.city}</td>
                      <td className="p-4 text-muted-foreground">{u.createdAt?.split('T')[0] ?? u.createdAt}</td>
                      <td className="p-4 text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4 py-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <UserIcon className="h-5 w-5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Full Name</p>
                                    <p className="font-medium">{selectedUser.name}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Mail className="h-5 w-5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                                    <p className="font-medium">{selectedUser.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Phone className="h-5 w-5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <MapPin className="h-5 w-5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">City</p>
                                    <p className="font-medium">{selectedUser.city}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Member Since</p>
                                    <p className="font-medium">{selectedUser.createdAt?.split('T')[0] ?? selectedUser.createdAt}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
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

export default ManageUsers;
