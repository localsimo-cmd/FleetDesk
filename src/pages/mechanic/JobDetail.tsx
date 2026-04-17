import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard, JobPart, PartCatalogueItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [job, setJob] = useState<JobCard | null>(null);
  const [parts, setParts] = useState<JobPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [odometerOut, setOdometerOut] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Add Part Modal State
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [catalogue, setCatalogue] = useState<PartCatalogueItem[]>([]);
  const [searchPart, setSearchPart] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchCatalogue();
    }
  }, [id]);

  async function fetchCatalogue() {
    const { data } = await supabase.from('part_catalogue').select('*').eq('active', true);
    if (data) setCatalogue(data);
  }

  async function fetchJobDetails() {
    setLoading(true);
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('job_cards')
        .select('*, vehicle:vehicles(*), mechanic:profiles(*)')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);
      setNotes(jobData.notes || '');
      setOdometerOut(jobData.odometer_out?.toString() || '');

      const { data: partsData, error: partsError } = await supabase
        .from('job_parts')
        .select('*, part:part_catalogue(*)')
        .eq('job_id', id);

      if (partsError) throw partsError;
      setParts(partsData || []);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }

  const handleAddPart = async () => {
    if (!selectedPartId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('job_parts').insert([{
        job_id: id,
        part_id: selectedPartId,
        qty_ordered: partQty,
        qty_fitted: 0,
        fitted: false
      }]);

      if (error) throw error;
      toast.success('Part added to job card');
      setIsAddPartOpen(false);
      fetchJobDetails();
    } catch (error) {
      toast.error('Failed to add part');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePart = async (partId: string) => {
    if (!confirm('Remove this part from the job card?')) return;
    try {
      const { error } = await supabase.from('job_parts').delete().eq('id', partId);
      if (error) throw error;
      setParts(parts.filter(p => p.id !== partId));
      toast.success('Part removed');
    } catch (error) {
      toast.error('Failed to remove part');
    }
  };

  const handleUpdatePart = async (partId: string, updates: Partial<JobPart>) => {
    try {
      const { error } = await supabase
        .from('job_parts')
        .update(updates)
        .eq('id', partId);

      if (error) throw error;
      
      setParts(parts.map(p => p.id === partId ? { ...p, ...updates } : p));
    } catch (error) {
      toast.error('Failed to update part');
    }
  };

  const handleCloseJob = async () => {
    if (!odometerOut) {
      toast.error('Please enter the closing odometer reading');
      return;
    }

    const odoOut = parseInt(odometerOut);
    if (odoOut < (job?.odometer_at_job || 0)) {
      toast.error('Odometer out cannot be less than odometer in');
      return;
    }

    setSaving(true);
    try {
      const { error: jobError } = await supabase
        .from('job_cards')
        .update({
          status: 'closed',
          odometer_out: odoOut,
          notes,
          closed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (jobError) throw jobError;

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ current_odometer: odoOut })
        .eq('id', job?.vehicle_id);

      if (vehicleError) throw vehicleError;

      const { error: partsError } = await supabase
        .from('job_parts')
        .update({ fit_odometer: odoOut })
        .eq('job_id', id)
        .eq('fitted', true);

      if (partsError) throw partsError;

      toast.success('Job card closed successfully');
      navigate('/manager');
    } catch (error) {
      console.error('Error closing job:', error);
      toast.error('Failed to close job card');
    } finally {
      setSaving(false);
    }
  };

  const unfittedCount = parts.filter(p => p.qty_ordered > p.qty_fitted).length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-40">
        <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!job) return <div className="p-20 text-center font-black">Job not found</div>;

  return (
    <div className="pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30 px-10 py-8 shadow-sm">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl h-12 w-12 hover:bg-secondary">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-sm">
                  Job #{job.job_number}
                </div>
                <Badge className={cn(
                  "rounded-2xl px-3 py-1 text-[10px] font-black border-none shadow-sm uppercase tracking-widest",
                  job.status === 'open' 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-emerald-100 text-emerald-700"
                )}>
                  {job.status}
                </Badge>
                {unfittedCount > 0 && job.status === 'open' && (
                  <Badge className="bg-amber-100 text-amber-700 rounded-2xl px-3 py-1 text-[10px] font-black border-none shadow-sm uppercase tracking-widest italic animate-pulse">
                    Parts Pending
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
                {job.vehicle?.registration}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right lg:border-l lg:pl-8 border-border">
            <div className="space-y-1">
              <p className="text-2xl font-black uppercase tracking-tighter leading-none">{job.vehicle?.make} {job.vehicle?.model}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                {job.vehicle?.year} • {job.job_type}
              </p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-[1.25rem] flex flex-col items-center justify-center min-w-[80px]">
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shadow-sm",
                job.status === 'open' ? "bg-blue-500" : "bg-emerald-500"
              )} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 max-w-[1700px] mx-auto space-y-10">
        {/* Meta Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-none shadow-smooth bg-card rounded-[2rem] p-8 flex flex-col justify-between h-44 hover:shadow-premium transition-all">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Odometer In</div>
            <div className="text-4xl font-black tracking-tight leading-none">{job.odometer_at_job.toLocaleString()} <span className="text-lg opacity-30 italic">km</span></div>
          </Card>
          
          <Card className="md:col-span-1 lg:col-span-2 border-none shadow-smooth bg-card rounded-[2rem] p-8 flex flex-col justify-between h-44 hover:shadow-premium transition-all">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Complaint / Notes</div>
            <div className="text-lg font-bold text-foreground overflow-hidden text-ellipsis line-clamp-2 leading-snug">
              {job.complaint_details || 'No notes provided.'}
            </div>
          </Card>
          
          <Card className="border-none shadow-smooth bg-card rounded-[2rem] p-8 flex flex-col justify-between h-44 hover:shadow-premium transition-all">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Opened On</div>
            <div className="text-xl font-black uppercase tracking-tighter leading-none italic">
              {format(new Date(job.opened_at), 'MMMM dd')}<br/>
              <span className="text-sm opacity-50 uppercase not-italic">{format(new Date(job.opened_at), 'HH:mm')}</span>
            </div>
          </Card>
        </div>

        {/* Action Center Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Main Parts List */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-none shadow-premium bg-card rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-border">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tightest">Parts List</CardTitle>
                  <p className="text-xs font-bold text-muted-foreground">Track parts used on this job</p>
                </div>
                {job.status === 'open' && (
                  <Button size="lg" className="rounded-2xl h-12 px-6 bg-primary text-primary-foreground shadow-premium font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAddPartOpen(true)}>
                    <Plus className="w-5 h-5 mr-3" />
                    Add Part
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-secondary/30 h-14">
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] text-muted-foreground">Part</TableHead>
                      <TableHead className="text-center font-black uppercase tracking-widest text-[9px] text-muted-foreground">Qty</TableHead>
                      <TableHead className="text-center font-black uppercase tracking-widest text-[9px] text-muted-foreground">Used</TableHead>
                      <TableHead className="text-center font-black uppercase tracking-widest text-[9px] text-muted-foreground">Fitted</TableHead>
                      <TableHead className="text-right px-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id} className={cn(
                        "border-border h-24 transition-colors group",
                        part.qty_ordered > part.qty_fitted ? "bg-amber-50/20" : "hover:bg-secondary/20"
                      )}>
                        <TableCell className="px-8">
                          <div className="flex flex-col">
                            <span className="font-black text-lg text-foreground uppercase tracking-tightest">{part.part?.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{part.part?.category}</span>
                              {part.part?.is_service_item && (
                                <Badge className="text-[7px] font-black bg-primary/10 text-primary border-none uppercase tracking-widest h-4 px-1.5 shadow-none">Protocol Item</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-black text-xl italic">{part.qty_ordered}</TableCell>
                        <TableCell className="text-center">
                          {job.status === 'open' ? (
                            <Input 
                              type="number" 
                              className="w-20 mx-auto h-12 text-center rounded-xl bg-secondary/50 border-none font-black text-lg shadow-sm focus:ring-2 focus:ring-primary/20"
                              value={part.qty_fitted}
                              onChange={(e) => handleUpdatePart(part.id, { qty_fitted: parseInt(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="font-black text-xl italic">{part.qty_fitted}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            className="w-8 h-8 rounded-xl border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-none shadow-sm"
                            checked={part.fitted}
                            disabled={job.status === 'closed'}
                            onCheckedChange={(checked) => handleUpdatePart(part.id, { 
                              fitted: !!checked,
                              qty_fitted: checked ? part.qty_ordered : 0
                            })}
                          />
                        </TableCell>
                        <TableCell className="text-right px-8">
                          {job.status === 'open' && (
                            <Button variant="ghost" size="icon" className="h-12 w-12 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100" onClick={() => handleRemovePart(part.id)}>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {parts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-32">
                          <div className="flex flex-col items-center justify-center text-muted-foreground/10">
                            <Plus className="w-20 h-20 mb-4" />
                            <p className="font-black uppercase tracking-widest text-2xl">Awaiting Material Logistics</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Notes & Closing */}
          <div className="space-y-8">
            <Card className="border-none shadow-premium bg-card rounded-[2rem] p-8 space-y-4">
              <div className="space-y-1 mb-2">
                <CardTitle className="text-xl font-black uppercase tracking-widest italic">Worker Notes</CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Technician notes and diagnostics</p>
              </div>
              <Textarea 
                placeholder="Enter job notes here..."
                className="min-h-[200px] rounded-[1.5rem] bg-secondary/50 border-none p-6 font-medium text-md shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                readOnly={job.status === 'closed'}
              />
            </Card>

            {job.status === 'open' && (
              <Card className="border-none shadow-premium bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-10 text-primary-foreground space-y-6">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black uppercase tracking-tight italic">Close Job</CardTitle>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 leading-none">Complete maintenance and archive record</p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-80">Odometer Out (km)</Label>
                  <Input 
                    type="number"
                    placeholder="Closing mileage..."
                    value={odometerOut}
                    onChange={(e) => setOdometerOut(e.target.value)}
                    className="h-14 rounded-2xl bg-white/10 border-none shadow-inner font-black text-3xl p-6 placeholder:text-white/20 focus:bg-white/20 transition-all text-center"
                  />
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black italic uppercase">In: {job.odometer_at_job} km</span>
                    {odometerOut && parseInt(odometerOut) > job.odometer_at_job && (
                      <span className="text-[10px] font-black uppercase text-emerald-300">Delta: +{parseInt(odometerOut) - job.odometer_at_job} km</span>
                    )}
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-white text-primary rounded-2xl h-14 font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-premium"
                  onClick={handleCloseJob}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                  Archive Job
                </Button>
                
                <div className="p-6 bg-white/10 rounded-[1.5rem] backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Archive requirements:
                  </p>
                  <div className="space-y-2 text-[10px] font-bold opacity-70 italic leading-tight">
                    <p>• All logistics accounted for and fitted.</p>
                    <p>• Odometer delta exceeds entry telemetry.</p>
                    <p>• Observations log populated with details.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Part Modal */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-premium rounded-[2.5rem] bg-card p-10">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-tightest leading-none">Add Part</DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground mt-1 uppercase tracking-widest text-[10px]">Select part from catalogue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search parts..." 
                className="pl-12 h-12 rounded-xl bg-secondary/50 border-none shadow-sm font-bold"
                value={searchPart}
                onChange={(e) => setSearchPart(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-auto rounded-xl bg-secondary/20 p-2 space-y-1 border border-border">
              {catalogue
                .filter(p => p.name.toLowerCase().includes(searchPart.toLowerCase()))
                .map(item => (
                  <div 
                    key={item.id}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between",
                      selectedPartId === item.id 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-card hover:shadow-sm"
                    )}
                    onClick={() => setSelectedPartId(item.id)}
                  >
                    <div>
                      <p className="font-black uppercase tracking-tightest">{item.name}</p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-70")}>
                        {item.category} — {item.sku || 'No SKU'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</Label>
              <Input 
                type="number" 
                value={partQty} 
                onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
                min={1}
                className="h-12 rounded-xl bg-secondary/50 border-none shadow-sm text-xl font-black p-4 text-center"
              />
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button variant="ghost" onClick={() => setIsAddPartOpen(false)} className="rounded-xl h-12 font-black uppercase tracking-widest opacity-50">Cancel</Button>
            <Button 
              className="bg-primary text-primary-foreground shadow-premium rounded-xl h-12 px-10 font-black uppercase tracking-widest" 
              onClick={handleAddPart}
              disabled={!selectedPartId || saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add to Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
