import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [openJobs, setOpenJobs] = useState<JobCard[]>([]);
  const [stats, setStats] = useState({
    open: 0,
    completedThisWeek: 0,
    partsLoggedToday: 0,
    partsNotFitted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch open jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('job_cards')
        .select('*, vehicle:vehicles(*)')
        .eq('mechanic_id', profile?.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });

      if (jobsError) throw jobsError;
      setOpenJobs(jobs || []);

      // Fetch stats (simplified for demo)
      setStats({
        open: jobs?.length || 0,
        completedThisWeek: 4, // Mock
        partsLoggedToday: 12, // Mock
        partsNotFitted: 2 // Mock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mechanic Dashboard</h1>
          <p className="text-slate-500">Welcome back, {profile?.full_name}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/jobs/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Job Card
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Open Jobs</p>
                <h3 className="text-2xl font-bold">{stats.open}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed (Week)</p>
                <h3 className="text-2xl font-bold">{stats.completedThisWeek}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Parts Logged Today</p>
                <h3 className="text-2xl font-bold">{stats.partsLoggedToday}</h3>
              </div>
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.partsNotFitted > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Parts Not Fitted</p>
                <h3 className={cn("text-2xl font-bold", stats.partsNotFitted > 0 ? "text-amber-600" : "")}>
                  {stats.partsNotFitted}
                </h3>
              </div>
              <div className={cn("p-2 rounded-lg", stats.partsNotFitted > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600")}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Current Workload</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : openJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2">{job.job_number}</Badge>
                        <h3 className="text-lg font-bold text-slate-900">{job.vehicle?.registration}</h3>
                        <p className="text-sm text-slate-500">{job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.year})</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none capitalize">
                        {job.job_type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Opened {format(new Date(job.opened_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-slate-500">
              <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
              <p>No open jobs. Start a new one to get going.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
