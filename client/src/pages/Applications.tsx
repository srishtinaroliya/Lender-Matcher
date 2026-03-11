import { useApplications } from "@/hooks/use-applications";
import { formatCurrency, formatDate } from "@/lib/format";
import { Link } from "wouter";
import { Plus, Search, ChevronRight } from "lucide-react";

export default function Applications() {
  const { data: apps, isLoading } = useApplications();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Loan Applications</h1>
          <p className="text-slate-500 mt-1">Manage and underwrite business loan requests</p>
        </div>
        <Link href="/applications/new" className="fintech-button-primary">
          <Plus className="w-4 h-4 mr-2" /> Create Application
        </Link>
      </div>

      <div className="fintech-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by business name..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount/Term</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Financials</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading applications...</td>
                </tr>
              ) : apps?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-lg font-semibold text-slate-900">No applications found</p>
                      <p className="text-sm mt-1 mb-6">Create the first application to get started.</p>
                      <Link href="/applications/new" className="fintech-button-outline">Add Application</Link>
                    </div>
                  </td>
                </tr>
              ) : apps?.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{app.businessName}</p>
                    <p className="text-xs text-slate-500 mt-1">{app.industry} • {app.state}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{formatCurrency(app.loanAmount)}</p>
                    <p className="text-xs text-slate-500 mt-1">{app.loanTerm} months • {app.equipmentType}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">Rev: <span className="font-semibold">{formatCurrency(app.annualRevenue)}</span></p>
                    <p className="text-xs text-slate-500 mt-1">FICO: {app.guarantorFico} • PayNet: {app.paynetScore}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }
                    `}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/applications/${app.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
