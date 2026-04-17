import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search,
  Truck,
  Wrench,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_alerts')
        .select('*, vehicle:vehicles(registration), part:part_catalogue(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAlerts = alerts.filter(alert => 
    alert.vehicle?.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.part?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Service Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor upcoming and overdue vehicle maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl" onClick={fetchAlerts}>
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by vehicle or part..." 
            className="pl-11 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-12 px-6 border-none shadow-sm bg-white dark:bg-slate-900">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl text-white shadow-lg",
                    alert.status === 'overdue' ? "bg-red-500 shadow-red-500/20" : "bg-amber-500 shadow-amber-500/20"
                  )}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <Badge className={cn(
                    "rounded-full px-3 py-1 border-none font-bold uppercase text-[10px]",
                    alert.status === 'overdue' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                  )}>
                    {alert.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{alert.vehicle?.registration}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{alert.part?.name}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Threshold</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{alert.threshold_km} km</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{alert.km_since_fit} km</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Link 
                    to="/jobs/new"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-10 font-bold text-white text-center flex items-center justify-center"
                    )}
                  >
                    Create Job
                  </Link>
                  <Link 
                    to={`/fleet`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-xl h-10 border-slate-200 dark:border-slate-800 flex items-center justify-center px-4"
                    )}
                  >
                    View Vehicle
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <CheckCircle2 className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-xl font-medium">No active alerts</p>
            <p className="text-sm">All vehicles are up to date with their maintenance schedules.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
