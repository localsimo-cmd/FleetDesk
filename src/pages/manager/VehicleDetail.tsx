import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Vehicle, JobCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Truck, 
  Wrench, 
  Calendar, 
  Clock, 
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { safeFormat } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVehicleData();
    }
  }, [id]);

  async function fetchVehicleData() {
    setLoading(true);
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      const { data: jobsData, error: jobsError } = await supabase
        .from('job_cards')
        .select('*, mechanic:profiles(full_name)')
        .eq('vehicle_id', id)
        .order('opened_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) return <div className="p-20 text-center font-black">Vehicle not found</div>;

  return (
    <div className="p-10 max-w-[1700px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl h-12 w-12 hover:bg-secondary">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-black tracking-widest uppercase inline-block mb-2">
              {vehicle.registration}
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
              {vehicle.make} {vehicle.model}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/jobs/new" className={cn(buttonVariants({ size: "lg" }), "bg-primary text-primary-foreground shadow-premium rounded-2xl h-14 px-8 font-black uppercase tracking-widest transition-transform hover:scale-105")}>
            <Wrench className="w-5 h-5 mr-3" />
            New Job Card
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Vehicle Specs */}
        <div className="space-y-8">
          <Card className="border-none shadow-premium bg-card rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tightest">Asset Specs</h2>
            </div>
            
            <div className="space-y-6">
              <SpecItem label="Year" value={vehicle.year.toString()} />
              <SpecItem label="VIN" value={vehicle.vin || 'N/A'} />
              <SpecItem label="Engine No" value={vehicle.engine_no || 'N/A'} />
              <SpecItem label="Current Odometer" value={`${vehicle.current_odometer.toLocaleString()} km`} highlight />
              <SpecItem label="Fiscal Expiry" value={vehicle.tax_expiry ? safeFormat(vehicle.tax_expiry, 'MMMM dd, yyyy') : 'N/A'} />
              <div className="pt-4">
                <Badge className={cn(
                  "rounded-2xl px-6 py-2 text-sm font-black border-none shadow-sm capitalize tracking-widest",
                  vehicle.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {vehicle.active ? 'Operational' : 'Retired Asset'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Service History */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black uppercase tracking-tightest flex items-center gap-3">
              <History className="w-7 h-7 text-primary" />
              Service History
            </h2>
            <Badge variant="outline" className="rounded-full px-4 py-1 font-bold border-border shadow-sm">
              {jobs.length} Records
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="border-none shadow-smooth bg-card rounded-[2rem] p-8 group hover:shadow-premium hover:-translate-x-2 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110",
                          job.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          <ClipboardList className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">#{job.job_number} • {job.job_type}</p>
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">
                            {safeFormat(job.opened_at, 'MMMM dd, yyyy')}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                             <div className="flex items-center gap-1">
                               <Calendar className="w-3 h-3" />
                               <span>Opened at {job.odometer_at_job.toLocaleString()} km</span>
                             </div>
                             {job.closed_at && (
                               <div className="flex items-center gap-1 text-emerald-600/80">
                                 <CheckCircle2 className="w-3 h-3" />
                                 <span>Completed</span>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/20 bg-card rounded-[2.5rem] border-2 border-dashed border-border/50">
                <FileText className="w-32 h-32 mb-6" />
                <p className="text-xl font-black uppercase tracking-widest leading-none">No Records Found</p>
                <p className="text-sm font-bold mt-2">This asset has no recorded maintenance history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={cn("p-6 rounded-[1.5rem] space-y-1 transition-all", highlight ? "bg-primary text-primary-foreground shadow-premium" : "bg-secondary/30")}>
      <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-60", highlight && "opacity-80")}>{label}</p>
      <p className={cn("text-lg font-black tracking-tight", highlight ? "text-2xl" : "text-foreground")}>{value}</p>
    </div>
  );
}

function History({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}
