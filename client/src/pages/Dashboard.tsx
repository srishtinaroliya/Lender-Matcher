import { useApplications } from "@/hooks/use-applications";
import { formatCurrency, formatNumber } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowUpRight, Clock, FileText, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: apps, isLoading } = useApplications();

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 bg-slate-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="h-96 bg-slate-200 rounded-2xl"></div>
    </div>;
  }

  const appsList = apps || [];
  const totalVolume = appsList.reduce((sum, app) => sum + app.loanAmount, 0);
  const pendingApps = appsList.filter(a => a.status === 'pending');
  const approvedApps = appsList.filter(a => a.status === 'approved' || a.status === 'completed');

  // Group by industry for the chart
  const industryDataMap = appsList.reduce((acc, app) => {
    acc[app.industry] = (acc[app.industry] || 0) + app.loanAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(industryDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 industries

  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and volume metrics</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="fintech-card p-6 border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500">Total Applications</p>
            <h3 className="text-2xl font-bold font-display mt-1">{formatNumber(appsList.length)}</h3>
          </div>
        </div>

        <div className="fintech-card p-6 border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <span className="text-indigo-600 font-bold text-xl">$</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500">Pipeline Volume</p>
            <h3 className="text-2xl font-bold font-display mt-1">{formatCurrency(totalVolume)}</h3>
          </div>
        </div>

        <div className="fintech-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500">Approved Apps</p>
            <h3 className="text-2xl font-bold font-display mt-1">{formatNumber(approvedApps.length)}</h3>
          </div>
        </div>

        <div className="fintech-card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500">Pending Review</p>
            <h3 className="text-2xl font-bold font-display mt-1">{formatNumber(pendingApps.length)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="fintech-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold font-display mb-6">Volume by Industry</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `$${val >= 1000000 ? (val/1000000).toFixed(1)+'M' : (val/1000).toFixed(0)+'k'}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="fintech-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display">Recent Applications</h3>
            <Link href="/applications" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="flex-1 space-y-4">
            {appsList.slice(0, 5).map(app => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <div className="group flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{app.businessName}</p>
                    <p className="text-xs text-slate-500">{app.industry} • {app.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(app.loanAmount)}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {appsList.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                No applications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
