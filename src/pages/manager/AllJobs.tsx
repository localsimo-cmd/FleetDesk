import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { JobCard } from '@/types';
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
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  Download,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import JobCardForm from '@/components/JobCardForm';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AllJobs() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .select('*, vehicle:vehicles(registration), mechanic:profiles(full_name)')
        .order('opened_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job card?')) return;
    
    try {
      const { error } = await supabase
        .from('job_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Job card deleted');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job card');
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.vehicle?.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.mechanic?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-[1700px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
            Job Cards
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Full record of all fleet maintenance and service history.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-12 h-12 bg-card border-none rounded-2xl shadow-sm focus:shadow-premium transition-all font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground shadow-premium rounded-2xl h-12 px-6 hover:opacity-90 transition-opacity"
            onClick={() => {
              setSelectedJob(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-3" />
            <span className="font-bold">New Job Card</span>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium bg-card rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent border-border h-20">
                <TableHead className="font-black uppercase tracking-widest text-xs px-8 text-muted-foreground">ID / Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Vehicle Asset</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Technician</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Type</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-xs text-muted-foreground">Opened On</TableHead>
                <TableHead className="text-right px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={6} className="h-24 px-8">
                      <div className="h-4 bg-secondary animate-pulse rounded-full w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} className="group border-border hover:bg-secondary/30 transition-colors h-28">
                    <TableCell className="px-8">
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-black text-primary">#{job.job_number}</div>
                        <Badge className={cn(
                          "rounded-xl px-2 py-0.5 text-[10px] font-black border-none shadow-sm uppercase tracking-tighter",
                          job.status === 'open' 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-emerald-100 text-emerald-700"
                        )}>
                          {job.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-black text-xl text-foreground mb-1">{job.vehicle?.registration}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fleet Asset</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs">
                          {job.mechanic?.full_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-foreground">{job.mechanic?.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-xl border-border px-3 py-1 font-bold text-[10px] uppercase tracking-wider bg-card">
                        {job.job_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-muted-foreground text-sm">
                      {format(new Date(job.opened_at), 'MMMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/jobs/${job.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "rounded-2xl h-12 w-12 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                          )}
                        >
                          <FileText className="w-5 h-5 text-current" />
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-secondary">
                              <MoreVertical className="w-6 h-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-premium border-border">
                            <DropdownMenuItem onClick={() => {
                              setSelectedJob(job);
                              setIsFormOpen(true);
                            }} className="rounded-xl h-12 font-bold focus:bg-primary focus:text-primary-foreground">
                              <Edit2 className="w-4 h-4 mr-3" />
                              Edit Job Card
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl h-12 font-bold text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDelete(job.id)}>
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete Job Card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-40">
                    <div className="flex flex-col items-center justify-center text-muted-foreground/20">
                      <ClipboardList className="w-40 h-40 mb-8" />
                      <h2 className="text-4xl font-black uppercase tracking-widest">No Job Cards Found</h2>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="mt-8 rounded-2xl h-14 px-10 border-2"
                        onClick={() => setIsFormOpen(true)}
                      >
                        Create First Job Card
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JobCardForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        job={selectedJob}
        onSuccess={fetchJobs}
      />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
