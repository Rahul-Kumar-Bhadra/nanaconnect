import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Star, Loader2, Camera, Upload } from 'lucide-react';
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
  profile_photo?: string;
  phone?: string;
}

const PanditProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setExperience(String(profile.experience));
      setPricePerHour(String(profile.pricePerHour));
      setCity(profile.city);
      setPhone(profile.phone || '');
      setLanguages(profile.languages.join(', '));
      setBio(profile.bio);
      setSpecializations(profile.specializations.join(', '));
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!phone || phone.trim() === '') {
        throw new Error('Phone number is compulsory.');
      }
      const res = await api.put('/pandits/profile', {
        experience: parseInt(experience) || 0,
        price_per_hour: parseFloat(pricePerHour) || 0,
        city,
        phone,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        bio,
        specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pandit-profile-me'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post(`/pandits/${profile.userId}/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Photo uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ['pandit-profile-me'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

          {/* Header & Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center text-5xl">
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile?.avatar || '🙏'
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                title="Upload Photo"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
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
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm text-foreground">{profile.rating} ({profile.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="separator border-b border-border" />

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
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1" required />
            </div>
            <div className="sm:col-span-2">
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
            className="w-full bg-gradient-saffron hover:opacity-90 text-primary-foreground font-semibold">
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
