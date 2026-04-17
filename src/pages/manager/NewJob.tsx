import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobCardForm from '@/components/JobCardForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewJob() {
  const navigate = useNavigate();

  return (
    <div className="p-10 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-6 mb-12">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl h-12 w-12 hover:bg-secondary">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-foreground tracking-tightest uppercase italic leading-none">
            New Job Card
          </h1>
          <p className="text-lg font-medium text-muted-foreground mt-2">
            Create a new maintenance record.
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-[2.5rem] p-12 shadow-premium border-none relative overflow-hidden flex items-center justify-center group">
        <div className="absolute inset-0 bg-primary/5 transition-colors" />
        <div className="relative z-10 text-center w-full max-w-md space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Enter Details</h2>
          <JobCardForm 
            open={true} 
            onOpenChange={(open) => {
              if (!open) navigate('/jobs');
            }} 
            onSuccess={() => navigate('/jobs')}
          />
        </div>
      </div>
    </div>
  );
}
