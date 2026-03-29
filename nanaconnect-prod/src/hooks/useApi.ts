// ─────────────────────────────────────────────────────────────────────────────
// Central API hooks — every page uses these instead of mockData imports
// Uses React Query for caching, loading states, and error handling
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────
export interface PujaType {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  category: string;
}

export interface PanditProfile {
  id: string;
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
  status?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  panditId: string;
  panditName: string;
  pujaTypeId: string;
  pujaName: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'confirmed' | 'completed' | 'rejected';
  totalPrice: number;
}

export interface Availability {
  id: string;
  panditId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  panditId: string;
  bookingId: string;
  rating: number;
  comment: string;
  date: string;
}

// ── Puja Types ────────────────────────────────────────────────────────────
export const usePujaTypes = () =>
  useQuery<PujaType[]>({
    queryKey: ['puja-types'],
    queryFn: async () => {
      const res = await api.get('/puja-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // cache 10 minutes
  });

// ── Pandits list (with optional filters) ─────────────────────────────────
export interface PanditFilters {
  city?: string;
  puja_type?: string;
  language?: string;
  min_rating?: number;
  page?: number;
  limit?: number;
}
export const usePandits = (filters: PanditFilters = {}) =>
  useQuery<PanditProfile[]>({
    queryKey: ['pandits', filters],
    queryFn: async () => {
      const res = await api.get('/pandits', { params: filters });
      return res.data;
    },
  });

// ── Single pandit profile ──────────────────────────────────────────────────
export const usePandit = (id: string) =>
  useQuery<PanditProfile>({
    queryKey: ['pandit', id],
    queryFn: async () => {
      const res = await api.get(`/pandits/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

// ── Pandit availability for a date ────────────────────────────────────────
export const usePanditAvailability = (panditId: string, date: string) =>
  useQuery<Availability[]>({
    queryKey: ['availability', panditId, date],
    queryFn: async () => {
      const res = await api.get(`/pandits/${panditId}/availability`, { params: { date } });
      return res.data;
    },
    enabled: !!panditId && !!date,
  });

// ── Current user's bookings ────────────────────────────────────────────────
export const useMyBookings = () =>
  useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data;
    },
  });

// ── Pandit's received bookings ─────────────────────────────────────────────
export const usePanditBookings = () =>
  useQuery<Booking[]>({
    queryKey: ['pandit-bookings'],
    queryFn: async () => {
      const res = await api.get('/pandits/me/bookings');
      return res.data;
    },
  });

// ── Create booking ─────────────────────────────────────────────────────────
export interface CreateBookingPayload {
  panditId: string;
  pujaTypeId: string;
  date: string;
  time: string;
  durationHours: number;
  address: string;
  notes?: string;
}
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const res = await api.post('/bookings', {
        pandit_id: payload.panditId,
        puja_category_id: payload.pujaTypeId,
        booking_date: payload.date,
        start_time: payload.time,
        duration_hours: payload.durationHours,
        address: payload.address,
        notes: payload.notes,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ── Cancel booking ─────────────────────────────────────────────────────────
export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ── Pandit accept / reject booking ────────────────────────────────────────
export const useRespondBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'reject' }) => {
      const res = await api.put(`/pandits/bookings/${id}/${action}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pandit-bookings'] });
    },
  });
};

// ── Razorpay: create order ─────────────────────────────────────────────────
export const useCreatePaymentOrder = () =>
  useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post('/payments/create-order', { booking_id: bookingId });
      return res.data; // { order_id, amount, currency, key_id }
    },
  });

// ── Razorpay: verify payment ───────────────────────────────────────────────
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: VerifyPaymentPayload) => {
      const res = await api.post('/payments/verify', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ── Pandit: set availability ───────────────────────────────────────────────
export const useSetAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slots: Omit<Availability, 'id'>[]) => {
      const res = await api.post('/pandits/availability', { slots });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

// ── Submit review ──────────────────────────────────────────────────────────
export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) => {
      const res = await api.post(`/bookings/${bookingId}/review`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ── Admin: pending pandits ─────────────────────────────────────────────────
export const useAdminPendingPandits = () =>
  useQuery<PanditProfile[]>({
    queryKey: ['admin-pending-pandits'],
    queryFn: async () => {
      const res = await api.get('/admin/pandits/pending');
      return res.data;
    },
  });

// ── Admin: verify pandit ───────────────────────────────────────────────────
export const useVerifyPandit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'verify' | 'suspend' }) => {
      const res = await api.put(`/admin/pandits/${id}/${action}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-pandits'] });
      qc.invalidateQueries({ queryKey: ['pandits'] });
    },
  });
};

// ── Admin: all bookings ────────────────────────────────────────────────────
export const useAdminBookings = () =>
  useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await api.get('/admin/bookings');
      return res.data;
    },
  });

// ── Admin: analytics ──────────────────────────────────────────────────────
export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  activePandits: number;
  totalUsers: number;
  pendingBookings: number;
  verifiedPandits: number;
}
export const useAnalytics = () =>
  useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/admin/analytics');
      return res.data;
    },
  });

// ── Admin: cancel booking ──────────────────────────────────────────────────
export const useAdminCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.put(`/admin/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// ── Admin: delete pandit profile ───────────────────────────────────────────
export const useAdminDeletePandit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/pandits/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pandits'] });
      qc.invalidateQueries({ queryKey: ['admin-pending-pandits'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// ── Admin: get all pandits ────────────────────────────────────────────────
export const useAdminAllPandits = () =>
  useQuery<PanditProfile[]>({
    queryKey: ['admin-all-pandits'],
    queryFn: async () => {
      const res = await api.get('/admin/pandits');
      return res.data;
    },
  });

// ── Auth: update profile ──────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; city?: string; phone?: string }) => {
      const res = await api.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      // We also need to update the AuthContext user object, 
      // but that's handled in the component calling this.
    },
  });
};
