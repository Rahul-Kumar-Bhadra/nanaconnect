import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PanditProfileData {
  userId: string;
  name: string;
  experience: number;
  languages: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  specializations: string[];
  pricePerHour: number;
  city: string;
  avatar: string;
}

const PanditProfilePage = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery<PanditProfileData>({
    queryKey: ['pandit-profile-me'],
    queryFn: async () => {
      const res = await api.get('/pandits/me');
      return res.data;
    },
  });

  const [experience, setExperience] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [city, setCity] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setExperience(String(profile.experience));
      setPricePerHour(String(profile.pricePerHour));
      setCity(profile.city);
      setLanguages(profile.languages.join(', '));
      setBio(profile.bio);
      setSpecializations(profile.specializations.join(', '));
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const res = await api.put('/pandits/profile', {
        experience: parseInt(experience) || 0,
        price_per_hour: parseFloat(pricePerHour) || 0,
        city,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        bio,
        specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      });
      return res.data;
    },
    onSuccess: () => toast.success('Profile updated successfully!'),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
              {profile?.avatar || '🙏'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-card-foreground">
                  {user?.name || profile?.name}
                </h2>
                {profile?.verified && <CheckCircle className="h-5 w-5 text-success" />}
              </div>
              {profile?.verified
                ? <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full mt-1 inline-block">Verified Pandit</span>
                : <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full mt-1 inline-block">Pending Verification</span>
              }
              {profile && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm text-foreground">{profile.rating} ({profile.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Experience (years)</Label>
              <Input type="number" value={experience} onChange={e => setExperience(e.target.value)} className="mt-1" min={0} />
            </div>
            <div>
              <Label>Price per hour (₹)</Label>
              <Input type="number" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} className="mt-1" min={0} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Mumbai" className="mt-1" />
            </div>
            <div>
              <Label>Languages</Label>
              <Input value={languages} onChange={e => setLanguages(e.target.value)}
                placeholder="Hindi, Sanskrit, Odia" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Comma separated</p>
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Tell devotees about your experience and expertise..." className="mt-1" rows={4} />
          </div>

          <div>
            <Label>Specializations</Label>
            <Input value={specializations} onChange={e => setSpecializations(e.target.value)}
              placeholder="Satyanarayan Puja, Griha Pravesh, Vivah Sanskar" className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Comma separated</p>
          </div>

          <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}
            className="w-full bg-gradient-saffron hover:opacity-90 text-primary-foreground">
            {updateProfile.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              : 'Update Profile'
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanditProfilePage;
