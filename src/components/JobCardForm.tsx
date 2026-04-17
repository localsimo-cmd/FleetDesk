import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Vehicle, JobCard } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JobCardFormProps {
  job?: JobCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function JobCardForm({ job, open, onOpenChange, onSuccess }: JobCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    mechanic_id: '',
    job_type: 'service' as 'service' | 'repair' | 'inspection',
    odometer_at_job: 0,
    complaint_details: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (job) {
      setFormData({
        vehicle_id: job.vehicle_id,
        mechanic_id: job.mechanic_id,
        job_type: (['service', 'repair', 'inspection'].includes(job.job_type) ? job.job_type : 'service') as 'service' | 'repair' | 'inspection',
        odometer_at_job: job.odometer_at_job,
        complaint_details: job.complaint_details || '',
      });
    } else {
      setFormData({
        vehicle_id: '',
        mechanic_id: '',
        job_type: 'service',
        odometer_at_job: 0,
        complaint_details: '',
      });
    }
  }, [job, open]);

  async function fetchInitialData() {
    try {
      const [vehiclesRes, mechanicsRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('active', true),
        supabase.from('profiles').select('*')
      ]);
      
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        complaint_details: formData.complaint_details || null,
      };

      if (job) {
        const { error } = await supabase
          .from('job_cards')
          .update(dataToSubmit)
          .eq('id', job.id);
        if (error) throw error;
        toast.success('Job card updated');
      } else {
        const { error } = await supabase
          .from('job_cards')
          .insert([dataToSubmit]);
        if (error) throw error;
        toast.success('Job card created');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] border-none shadow-premium rounded-[2.5rem] bg-card p-10">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tightest leading-none">
            {job ? 'Edit' : 'New'}<br/>Job Card
          </DialogTitle>
          <DialogDescription className="text-md font-medium text-muted-foreground mt-2">
            Enter the details for this maintenance job.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vehicle</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(val) => {
                  const v = vehicles.find(v => v.id === val);
                  setFormData({ ...formData, vehicle_id: val, odometer_at_job: v?.current_odometer || 0 });
                }}
                required
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold transition-all">
                  <SelectValue placeholder="Select Vehicle" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-premium border-none p-2">
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id} className="rounded-lg h-10 font-bold mb-1">
                      {v.registration} — {v.make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Technician</Label>
              <Select 
                value={formData.mechanic_id} 
                onValueChange={(val) => setFormData({ ...formData, mechanic_id: val })}
                required
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold transition-all">
                  <SelectValue placeholder="Assign Technician" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-premium border-none p-2">
                  {mechanics.map(m => (
                    <SelectItem key={m.id} value={m.id} className="rounded-lg h-10 font-bold mb-1">
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Type</Label>
              <Select 
                value={formData.job_type} 
                onValueChange={(val: any) => setFormData({ ...formData, job_type: val })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-premium border-none p-2">
                  <SelectItem value="service" className="rounded-lg h-10 font-bold mb-1">Service</SelectItem>
                  <SelectItem value="repair" className="rounded-lg h-10 font-bold mb-1">Repair</SelectItem>
                  <SelectItem value="inspection" className="rounded-lg h-10 font-bold mb-1">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Odometer Reading</Label>
              <Input 
                type="number" 
                value={formData.odometer_at_job}
                onChange={(e) => setFormData({ ...formData, odometer_at_job: parseInt(e.target.value) || 0 })}
                required 
                className="h-12 rounded-xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black text-lg p-6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Details</Label>
            <Textarea 
              placeholder="Describe the problem or work to be done..." 
              className="min-h-[120px] rounded-[1.5rem] bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 p-6 font-medium text-md"
              value={formData.complaint_details}
              onChange={(e) => setFormData({ ...formData, complaint_details: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="pt-6 gap-3 flex-col md:flex-row">
            <Button size="lg" type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-14 px-8 font-black uppercase tracking-widest opacity-50">
              Cancel
            </Button>
            <Button size="lg" type="submit" disabled={loading} className="bg-primary text-primary-foreground shadow-premium rounded-xl h-14 px-10 font-black uppercase tracking-widest">
              {loading && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
              {job ? 'Save Changes' : 'Create Job Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
