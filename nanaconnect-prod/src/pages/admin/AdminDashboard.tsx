import { useAnalytics, useAdminBookings } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, DollarSign, UserCheck, TrendingUp, BookOpen } from 'lucide-react';

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useAnalytics();
  const { data: bookings } = useAdminBookings();

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Total Pandits', value: analytics?.activePandits, icon: UserCheck, color: 'text-success' },
    { label: 'Total Bookings', value: analytics?.totalBookings, icon: Calendar, color: 'text-warning' },
    { label: 'Revenue', value: analytics ? `₹${analytics.totalRevenue.toLocaleString()}` : undefined, icon: DollarSign, color: 'text-primary' },
    { label: 'Verified Pandits', value: analytics?.verifiedPandits, icon: UserCheck, color: 'text-success' },
    { label: 'Pending Bookings', value: analytics?.pendingBookings, icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-xl font-bold text-foreground">{stat.value ?? '—'}</p>}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Bookings</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Puja</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {(bookings || []).slice(0, 10).map(b => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-foreground">{b.userName}</td>
                    <td className="p-4 text-muted-foreground">{b.pujaName}</td>
                    <td className="p-4 text-muted-foreground">{b.date}</td>
                    <td className="p-4 font-medium text-foreground">₹{b.totalPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        b.status === 'confirmed' ? 'bg-success/10 text-success' :
                        b.status === 'pending' ? 'bg-warning/10 text-warning' :
                        b.status === 'completed' ? 'bg-primary/10 text-primary' :
                        'bg-destructive/10 text-destructive'}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
