import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        city: user.city,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await updateProfile.mutateAsync(formData);
      updateUser(res.user);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">🙏</div>
            <div>
              <h2 className="font-display text-lg font-semibold text-card-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email} disabled className="mt-1 bg-muted/50" />
            </div>
            <div>
              <Label>City</Label>
              <Input 
                value={formData.city} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX" 
                className="mt-1" 
              />
            </div>
          </div>
          <Button 
            className="bg-gradient-saffron hover:opacity-90 text-primary-foreground"
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
