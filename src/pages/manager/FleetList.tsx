import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  MoreVertical,
  Trash2,
  FileText,
  Truck
} from 'lucide-react';
import VehicleForm from '@/components/VehicleForm';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function FleetList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('registration', { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this vehicle?')) return;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Vehicle deactivated');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to deactivate vehicle');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-[1700px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
            Fleet List
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Manage your vehicles and maintenance tasks.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search vehicles..." 
              className="pl-12 h-12 bg-card border-none rounded-2xl shadow-sm focus:shadow-premium transition-all font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground shadow-premium rounded-2xl h-14 px-8 hover:scale-105 transition-transform"
            onClick={() => {
              setSelectedVehicle(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-3" />
            <span className="font-bold">Add Asset</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-secondary/50 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-none shadow-smooth bg-card rounded-[2.5rem] overflow-hidden group hover:shadow-premium hover:-translate-y-2 transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-black tracking-widest uppercase inline-block mb-2">
                      {vehicle.registration}
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-muted-foreground font-bold">{vehicle.year}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-secondary">
                        <MoreVertical className="w-6 h-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-premium border-border">
                      <DropdownMenuItem onClick={() => {
                        setSelectedVehicle(vehicle);
                        setIsFormOpen(true);
                      }} className="rounded-xl h-12 font-bold focus:bg-primary focus:text-primary-foreground">
                        <Edit2 className="w-4 h-4 mr-3" />
                        Edit Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl h-12 font-bold text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDelete(vehicle.id)}>
                        <Trash2 className="w-4 h-4 mr-3" />
                        Retire Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Odometer</p>
                    <p className="text-xl font-black">{vehicle.current_odometer.toLocaleString()} km</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl",
                    vehicle.tax_expiry && new Date(vehicle.tax_expiry) < new Date() ? "bg-red-100/50" : "bg-secondary/50"
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fiscal Expiry</p>
                    <p className={cn(
                      "text-xl font-black",
                      vehicle.tax_expiry && new Date(vehicle.tax_expiry) < new Date() ? "text-red-600" : "text-foreground"
                    )}>
                      {vehicle.tax_expiry ? format(new Date(vehicle.tax_expiry), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge className={cn(
                    "rounded-2xl px-4 py-1.5 text-xs font-black border-none shadow-sm capitalize tracking-widest",
                    vehicle.active 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-slate-100 text-slate-500"
                  )}>
                    {vehicle.active ? 'Operational' : 'Retired'}
                  </Badge>
                  <Link 
                    to={`/fleet/${vehicle.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                      "rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-primary-foreground h-12 transition-all shadow-sm"
                    )}
                  >
                    View History
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-muted-foreground/30">
          <Truck className="w-40 h-40 mb-8" />
          <h2 className="text-4xl font-black uppercase tracking-widest">No Assets Found</h2>
          <Button 
            variant="outline" 
            size="lg"
            className="mt-8 rounded-2xl h-14 px-10 border-2"
            onClick={() => setIsFormOpen(true)}
          >
            Register First vehicle
          </Button>
        </div>
      )}

      <VehicleForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
