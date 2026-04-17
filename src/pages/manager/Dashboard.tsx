import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { format } from 'date-fns';
import { 
  Truck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    openJobs: 0,
    criticalAlerts: 0,
    completedThisMonth: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [vehicles, jobs, alerts] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact' }),
        supabase.from('job_cards').select('*, vehicle:vehicles(registration)').order('opened_at', { ascending: false }),
        supabase.from('service_alerts').select('id', { count: 'exact' }).in('status', ['due_soon', 'overdue'])
      ]);

      const openJobs = jobs.data?.filter(j => j.status === 'open') || [];
      const completedThisMonth = jobs.data?.filter(j => 
        j.status === 'closed' && 
        new Date(j.closed_at) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ) || [];

      setStats({
        totalVehicles: vehicles.count || 0,
        openJobs: openJobs.length,
        criticalAlerts: alerts.count || 0,
        completedThisMonth: completedThisMonth.length
      });

      setRecentJobs(jobs.data?.slice(0, 8) || []);

      // Generate chart data from last 7 days
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          date: d.toISOString().split('T')[0],
          name: format(d, 'EEE'),
          jobs: 0
        };
      }).reverse();

      jobs.data?.forEach(job => {
        const jobDate = job.opened_at.split('T')[0];
        const dayData = last7Days.find(d => d.date === jobDate);
        if (dayData) {
          dayData.jobs += 1;
        }
      });

      setChartData(last7Days);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Management overview and fleet maintenance metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-2xl border-border bg-card shadow-sm hover:bg-secondary transition-all h-12 px-6" 
            onClick={fetchDashboardData}
          >
            <Calendar className="w-5 h-5 mr-3 text-primary" />
            <span className="font-bold">Refresh</span>
          </Button>
          <Button size="lg" className="bg-primary text-primary-foreground shadow-premium rounded-2xl h-12 px-6 hover:opacity-90 transition-opacity">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="font-bold">Reports</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Fleet" 
          value={stats.totalVehicles} 
          icon={Truck} 
          trend="Total Assets"
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Open Jobs" 
          value={stats.openJobs} 
          icon={Wrench} 
          trend="In Progress"
          trendUp={false}
          color="amber"
        />
        <StatCard 
          title="Service Alerts" 
          value={stats.criticalAlerts} 
          icon={AlertTriangle} 
          trend="Action Needed"
          trendUp={false}
          color="red"
        />
        <StatCard 
          title="Completed Jobs" 
          value={`${stats.completedThisMonth}`} 
          icon={CheckCircle2} 
          trend="This Month"
          trendUp={true}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart Card */}
        <Card className="xl:col-span-2 border-none shadow-premium bg-card-gradient card-gradient rounded-[2.5rem] p-4 overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Throughput</CardTitle>
                <CardDescription className="text-lg font-medium">Weekly job card analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14, fontWeight: 600 }}
                    dy={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '24px',
                      padding: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ fontWeight: 800, textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="step" 
                    dataKey="jobs" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorJobs)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Center - Simplified */}
        <div className="space-y-8">
          <Card className="border-none shadow-premium bg-card rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Recent Jobs</CardTitle>
                <Link to="/jobs" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-5 group cursor-pointer">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm",
                      job.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                    )}>
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-lg font-black text-foreground truncate">{job.vehicle?.registration}</p>
                        <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded-full">
                          {format(new Date(job.opened_at), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{job.job_type} • #{job.job_number}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-50">
                  <Clock className="w-12 h-12 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm">Quiet Period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-600/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    red: "bg-red-600 shadow-red-600/20",
    green: "bg-emerald-600 shadow-emerald-600/20",
  };

  return (
    <Card className="border-none shadow-smooth bg-card rounded-[2.5rem] overflow-hidden group hover:shadow-premium hover:-translate-y-2 transition-all duration-500 cursor-pointer">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className={cn("w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110", colors[color])}>
            <Icon className="w-7 h-7" />
          </div>
          <div className={cn(
            "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-inner",
            trendUp ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}>
            {trend}
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest opacity-70 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none">{value}</h3>
            {trendUp && <TrendingUp className="w-5 h-5 text-emerald-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
