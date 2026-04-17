import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Vehicle } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function VehicleForm({ vehicle, open, onOpenChange, onSuccess }: VehicleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registration: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    engine_no: '',
    tax_expiry: '',
    current_odometer: 0,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registration: vehicle.registration,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin || '',
        engine_no: vehicle.engine_no || '',
        tax_expiry: vehicle.tax_expiry || '',
        current_odometer: vehicle.current_odometer,
      });
    } else {
      setFormData({
        registration: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        engine_no: '',
        tax_expiry: '',
        current_odometer: 0,
      });
    }
  }, [vehicle, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        vin: formData.vin || null,
        engine_no: formData.engine_no || null,
        tax_expiry: formData.tax_expiry || null,
      };

      if (vehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(dataToSubmit)
          .eq('id', vehicle.id);
        if (error) throw error;
        toast.success('Vehicle updated successfully');
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert([dataToSubmit]);
        if (error) throw error;
        toast.success('Vehicle added successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] border-none shadow-premium rounded-[2.5rem] bg-card p-10">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-4xl font-black uppercase tracking-tightest leading-none">
            {vehicle ? 'Update' : 'Register'}<br/>Fleet Asset
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-muted-foreground mt-4">
            Configure the structural parameters for this mobile unit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Callsign / Registration</Label>
              <Input 
                placeholder="e.g. ALPHA-01" 
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black text-lg p-6 uppercase tracking-widest"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vintage / Year</Label>
              <Input 
                type="number" 
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black text-lg p-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Manufacturer</Label>
              <Input 
                placeholder="e.g. Boeing / Toyota" 
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold text-lg p-6 px-4"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Model Designation</Label>
              <Input 
                placeholder="e.g. Raptor / Hilux" 
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold text-lg p-6 px-4"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chassis Global ID (VIN)</Label>
            <Input 
              placeholder="Unique 17-digit identification code" 
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-mono text-sm p-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Engine Manifest</Label>
              <Input 
                value={formData.engine_no}
                onChange={(e) => setFormData({ ...formData, engine_no: e.target.value })}
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-mono text-xs p-6"
                placeholder="Internal Engine Number"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fiscal/Tax Deadline</Label>
              <Input 
                type="date" 
                value={formData.tax_expiry}
                onChange={(e) => setFormData({ ...formData, tax_expiry: e.target.value })}
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black p-6"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Mileage Log (km)</Label>
            <Input 
              type="number" 
              value={formData.current_odometer}
              onChange={(e) => setFormData({ ...formData, current_odometer: parseInt(e.target.value) || 0 })}
              required 
              className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black text-2xl p-6 text-primary"
            />
          </div>

          <DialogFooter className="pt-8 gap-4 flex-col md:flex-row">
            <Button size="lg" type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-16 px-8 font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
              Cancel
            </Button>
            <Button size="lg" type="submit" disabled={loading} className="bg-primary text-primary-foreground shadow-premium rounded-2xl h-16 px-12 font-black uppercase tracking-widest hover:scale-105 transition-all">
              {loading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
              {vehicle ? 'Commit Update' : 'Register Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
