// This file kept for legacy type compatibility.
// All data now comes from the FastAPI backend via /src/hooks/useApi.ts
// Types have been moved to useApi.ts

export type UserRole = 'user' | 'pandit' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  avatar?: string;
  createdAt: string;
}

// Re-export types from useApi for any files that still import from here
export type { PujaType, PanditProfile, Booking, Review, Availability } from '@/hooks/useApi';
