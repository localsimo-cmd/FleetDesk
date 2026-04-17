import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Smartphone,
  Globe,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Profile Information</h3>
          <p className="text-sm text-slate-500">Update your personal details and how others see you.</p>
        </div>
        <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="w-10 h-10" />
              </div>
              <Button variant="outline" className="rounded-xl">Change Avatar</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.email?.split('@')[0] || ''} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email || ''} disabled className="rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8">Save Changes</Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-lg font-bold">Preferences</h3>
          <p className="text-sm text-slate-500">Customize your experience and interface.</p>
        </div>
        <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-slate-500">Receive alerts about maintenance and job cards.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-slate-500">Get real-time updates on your mobile device.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-lg font-bold">Security</h3>
          <p className="text-sm text-slate-500">Manage your password and account security.</p>
        </div>
        <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <Lock className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Change Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Update</Button>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <Shield className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
