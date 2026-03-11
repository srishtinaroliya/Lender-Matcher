import { usePolicies, useDeletePolicy } from "@/hooks/use-policies";
import { formatCurrency } from "@/lib/format";
import { Link } from "wouter";
import { Plus, ShieldCheck, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function Policies() {
  const { data: policies, isLoading } = usePolicies();
  const { mutate: deletePolicy } = useDeletePolicy();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Lender Policies</h1>
          <p className="text-slate-500 mt-1">Configure underwriting rules and matching criteria</p>
        </div>
        <Link href="/policies/new" className="fintech-button-primary">
          <Plus className="w-4 h-4 mr-2" /> New Policy
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : policies?.length === 0 ? (
        <div className="fintech-card p-12 text-center flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No policies configured</h3>
          <p className="text-slate-500 mb-6 max-w-md">Create your first lender policy to start matching loan applications to the right programs automatically.</p>
          <Link href="/policies/new" className="fintech-button-primary">Create Policy</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {policies?.map(policy => (
            <div key={policy.id} className="fintech-card flex flex-col relative overflow-hidden group">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {policy.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400" />
                    )}
                    <h3 className="text-lg font-bold font-display text-slate-900">{policy.name}</h3>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${policy.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {policy.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Actions that appear on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Link href={`/policies/${policy.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this policy?")) deletePolicy(policy.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-6 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Min FICO</p>
                    <p className="text-lg font-bold text-slate-900">{policy.minFico || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Min PayNet</p>
                    <p className="text-lg font-bold text-slate-900">{policy.minPaynet || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Loan Range</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {policy.minLoanAmount ? formatCurrency(policy.minLoanAmount) : '$0'} - {policy.maxLoanAmount ? formatCurrency(policy.maxLoanAmount) : 'No Max'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Excluded States</p>
                  <div className="flex flex-wrap gap-1">
                    {policy.excludedStates && policy.excludedStates.length > 0 ? (
                      policy.excludedStates.map(state => (
                        <span key={state} className="text-xs px-2 py-1 bg-rose-50 text-rose-700 font-medium rounded-md border border-rose-100">{state}</span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
