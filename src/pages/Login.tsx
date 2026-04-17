import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wrench, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('System override authorized');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-10 overflow-hidden relative">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <Card className="w-full max-w-xl border-none shadow-premium bg-card rounded-[3rem] p-10 relative z-10 animate-in fade-in zoom-in duration-1000">
        <CardHeader className="space-y-2 flex flex-col items-center mb-6">
          <div className="bg-primary text-primary-foreground p-4 rounded-3xl shadow-premium mb-2 transition-transform cursor-pointer">
            <Wrench className="w-10 h-10" />
          </div>
          <CardTitle className="text-5xl font-black uppercase tracking-tightest leading-none text-center">
            Fleet<span className="text-primary">Desk</span>
          </CardTitle>
          <CardDescription className="text-lg font-bold text-muted-foreground uppercase tracking-widest opacity-60 text-center">
            Operator Sign In
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-8">
          <CardContent className="space-y-6 p-0">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="yours@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-bold transition-all px-6"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-14 rounded-2xl bg-secondary/50 border-none shadow-sm focus:ring-2 focus:ring-primary/20 font-black transition-all px-6"
              />
            </div>
          </CardContent>
          <CardFooter className="p-0 flex flex-col items-center gap-6">
            <Button size="lg" className="w-full bg-primary text-primary-foreground shadow-premium rounded-2xl h-16 text-lg font-black uppercase tracking-widest hover:opacity-90 transition-opacity" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="w-full border-t border-border pt-4 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Stuck or seeing errors?</p>
              <button 
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Force System Reset (Clear Session)
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
