import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  FileText, 
  Users, 
  History, 
  Calendar,
  Download,
  Filter,
  Loader2,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export default function Reports() {
  const [accountabilityData, setAccountabilityData] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    setLoading(true);
    try {
      // Fetch parts accountability
      const { data: jobParts } = await supabase
        .from('job_parts')
        .select('*, part:part_catalogue(name)');
      
      if (jobParts) {
        const groupedParts = jobParts.reduce((acc: any, curr: any) => {
          const partName = curr.part?.name || 'Unknown';
          if (!acc[partName]) {
            acc[partName] = { name: partName, ordered: 0, fitted: 0 };
          }
          acc[partName].ordered += curr.qty_ordered;
          acc[partName].fitted += curr.qty_fitted;
          return acc;
        }, {});
        setAccountabilityData(Object.values(groupedParts));
      }

      // Fetch mechanic productivity
      const { data: jobCards } = await supabase
        .from('job_cards')
        .select('*, mechanic:profiles(full_name)')
        .eq('status', 'closed');

      if (jobCards) {
        const groupedMechanics = jobCards.reduce((acc: any, curr: any) => {
          const mechanicName = curr.mechanic?.full_name || 'Unassigned';
          if (!acc[mechanicName]) {
            acc[mechanicName] = { name: mechanicName, jobs: 0 };
          }
          acc[mechanicName].jobs += 1;
          return acc;
        }, {});
        setProductivityData(Object.values(groupedMechanics));
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium">Generating reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed insights into fleet operations and productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm" onClick={fetchReportData}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="accountability" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl h-14 shadow-sm">
          <TabsTrigger value="accountability" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
            <FileText className="w-4 h-4 mr-2" />
            Parts Accountability
          </TabsTrigger>
          <TabsTrigger value="productivity" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
            <Users className="w-4 h-4 mr-2" />
            Mechanic Productivity
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
            <History className="w-4 h-4 mr-2" />
            Fleet History
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
            <Calendar className="w-4 h-4 mr-2" />
            Service Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accountability">
          {accountabilityData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle>Parts Ordered vs Fitted</CardTitle>
                  <CardDescription>Identifying the "ordered but not fitted" discrepancy</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accountabilityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="ordered" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ordered" />
                      <Bar dataKey="fitted" fill="#10b981" radius={[4, 4, 0, 0]} name="Fitted" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle>Discrepancy Summary</CardTitle>
                  <CardDescription>Items requiring investigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accountabilityData.map((item) => {
                    const diff = item.ordered - item.fitted;
                    if (diff === 0) return null;
                    return (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.ordered} ordered, {item.fitted} fitted</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none">
                          {diff} Missing
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState title="No parts data available" description="Start adding parts to job cards to see accountability reports." />
          )}
        </TabsContent>

        <TabsContent value="productivity">
          {productivityData.length > 0 ? (
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle>Mechanic Performance</CardTitle>
                <CardDescription>Jobs completed per mechanic this month</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="jobs" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="No productivity data" description="Close job cards to track mechanic performance." />
          )}
        </TabsContent>

        <TabsContent value="history">
          <EmptyState title="Fleet History Report" description="Select a vehicle to view its full maintenance timeline." icon={History} />
        </TabsContent>

        <TabsContent value="schedule">
          <EmptyState title="Upcoming Service Schedule" description="No services scheduled for the next 7 days." icon={Calendar} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, description, icon: Icon = Inbox }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
      <Icon className="w-16 h-16 mb-4 opacity-10" />
      <p className="text-xl font-medium text-slate-900 dark:text-white">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
