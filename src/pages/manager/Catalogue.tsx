import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PartCatalogueItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { 
  Search, 
  Plus, 
  Filter, 
  Package,
  CheckCircle2,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Catalogue() {
  const [parts, setParts] = useState<PartCatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartCatalogueItem | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  async function fetchParts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('part_catalogue')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this part?')) return;
    try {
      const { error } = await supabase
        .from('part_catalogue')
        .update({ active: false })
        .eq('id', id);
      if (error) throw error;
      toast.success('Part deactivated');
      fetchParts();
    } catch (error) {
      toast.error('Failed to deactivate part');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-[1700px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
            Catalogue
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Manage your parts and service items.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search parts..." 
              className="pl-12 h-12 bg-card border-none rounded-2xl shadow-sm focus:shadow-premium transition-all font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground shadow-premium rounded-2xl h-12 px-6 hover:opacity-90 transition-opacity"
            onClick={() => {
              setSelectedPart(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-3" />
            <span className="font-bold">Add Part</span>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium bg-card rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent border-border h-16">
                <TableHead className="font-black uppercase tracking-widest text-xs px-8 text-muted-foreground">Name</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Category</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">SKU</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground text-center">Auto-Service</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Interval</TableHead>
                <TableHead className="text-right px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={6} className="h-20 px-8">
                      <div className="h-4 bg-secondary animate-pulse rounded-full w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <TableRow key={part.id} className="group border-border hover:bg-secondary/30 transition-colors h-24">
                    <TableCell className="font-black text-xl text-foreground px-8">
                      {part.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-xl border-border px-3 py-1 font-bold text-[10px] uppercase tracking-wider bg-card">
                        {part.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-primary">
                      {part.sku || '---'}
                    </TableCell>
                    <TableCell className="text-center">
                      {part.is_service_item ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Service Item</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">General</span>
                      )}
                    </TableCell>
                    <TableCell className="font-black text-foreground">
                      {part.service_interval_km ? (
                        <div className="flex items-baseline gap-1">
                          <span>{part.service_interval_km.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground uppercase opacity-50">km</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm" onClick={() => {
                          setSelectedPart(part);
                          setIsFormOpen(true);
                        }}>
                          <Edit2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm" onClick={() => handleDelete(part.id)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-40">
                    <div className="flex flex-col items-center justify-center text-muted-foreground/20">
                      <Package className="w-40 h-40 mb-8" />
                      <h2 className="text-4xl font-black uppercase tracking-widest">Catalogue Empty</h2>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="mt-8 rounded-2xl h-14 px-10 border-2"
                        onClick={() => setIsFormOpen(true)}
                      >
                        Add First Component
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PartForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        part={selectedPart}
        onSuccess={fetchParts}
      />
    </div>
  );
}

function PartForm({ part, open, onOpenChange, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    is_service_item: false,
    service_interval_km: 0,
  });

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        category: part.category,
        sku: part.sku || '',
        is_service_item: part.is_service_item,
        service_interval_km: part.service_interval_km || 0,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        sku: '',
        is_service_item: false,
        service_interval_km: 0,
      });
    }
  }, [part, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        sku: formData.sku || null,
        service_interval_km: formData.is_service_item ? formData.service_interval_km : null,
      };

      if (part) {
        const { error } = await supabase.from('part_catalogue').update(dataToSubmit).eq('id', part.id);
        if (error) throw error;
        toast.success('Part updated');
      } else {
        const { error } = await supabase.from('part_catalogue').insert([dataToSubmit]);
        if (error) throw error;
        toast.success('Part added');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{part ? 'Edit Part' : 'Add New Part'}</DialogTitle>
          <DialogDescription>Define a part for the catalogue to use in job cards.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Part Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              required 
              placeholder="e.g. Oil Filter"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                required 
                placeholder="e.g. Filters"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>SKU (Optional)</Label>
              <Input 
                value={formData.sku} 
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                placeholder="e.g. OF-123"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <Checkbox 
              id="service-item" 
              checked={formData.is_service_item} 
              onCheckedChange={(checked) => setFormData({ ...formData, is_service_item: !!checked })} 
            />
            <Label htmlFor="service-item" className="cursor-pointer">This is a service item (requires regular replacement)</Label>
          </div>
          {formData.is_service_item && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Service Interval (km)</Label>
              <Input 
                type="number" 
                value={formData.service_interval_km} 
                onChange={(e) => setFormData({ ...formData, service_interval_km: parseInt(e.target.value) || 0 })} 
                required 
                className="rounded-xl"
              />
              <p className="text-xs text-slate-500">Alerts will be generated when a vehicle exceeds this mileage since last fitment.</p>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {part ? 'Update Part' : 'Add Part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
