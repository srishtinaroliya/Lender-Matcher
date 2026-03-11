import { useApplication, useRunUnderwriting } from "@/hooks/use-applications";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ShieldCheck, XCircle, CheckCircle2, Loader2, AlertCircle, Zap } from "lucide-react";
import { Link } from "wouter";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ApplicationDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: app, isLoading } = useApplication(id);
  const { mutate: runUnderwriting, isPending: isUnderwriting } = useRunUnderwriting();

  if (isLoading) {
    return <div className="animate-pulse p-8">Loading application details...</div>;
  }

  if (!app) {
    return <div className="p-8 text-center text-rose-500">Application not found</div>;
  }

  const hasMatches = app.matches && app.matches.length > 0;
  const approvedMatches = (app.matches || []).filter(m => m.isEligible);
  const rejectedMatches = (app.matches || []).filter(m => !m.isEligible);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/applications" className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display text-slate-900">{app.businessName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  app.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-100 text-slate-700'
                }
              `}>
                {app.status}
              </span>
            </div>
            <p className="text-slate-500 mt-1">App ID: #{app.id} • Submitted {formatDate(app.createdAt)}</p>
          </div>
        </div>
        
        {!hasMatches && (
          <button 
            onClick={() => runUnderwriting(id)} 
            disabled={isUnderwriting}
            className="fintech-button-primary bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 shadow-lg"
          >
            {isUnderwriting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
            Run Match Engine
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: App Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="fintech-card p-6">
            <h3 className="text-lg font-bold font-display border-b border-slate-100 pb-3 mb-4">Request</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(app.loanAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Term</p>
                  <p className="font-semibold">{app.loanTerm} mos</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Equipment</p>
                  <p className="font-semibold">{app.equipmentType}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fintech-card p-6">
            <h3 className="text-lg font-bold font-display border-b border-slate-100 pb-3 mb-4">Business & Financials</h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Industry</span>
                <span className="font-semibold text-slate-900">{app.industry}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">State</span>
                <span className="font-semibold text-slate-900">{app.state}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Time in Business</span>
                <span className="font-semibold text-slate-900">{app.yearsInBusiness} yrs</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Annual Revenue</span>
                <span className="font-semibold text-slate-900">{formatCurrency(app.annualRevenue)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">FICO Score</span>
                <span className="font-semibold text-slate-900">{app.guarantorFico}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-slate-500">PayNet Score</span>
                <span className="font-semibold text-slate-900">{app.paynetScore}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Underwriting Results */}
        <div className="lg:col-span-2">
          {!hasMatches ? (
            <div className="fintech-card p-12 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-300 bg-slate-50/50">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Ready to Underwrite</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">Run the match engine to evaluate this application against all active lender policies and find eligible programs.</p>
              <button 
                onClick={() => runUnderwriting(id)} 
                disabled={isUnderwriting}
                className="fintech-button-primary bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 shadow-lg px-8 py-3 text-lg"
              >
                {isUnderwriting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Zap className="w-6 h-6 mr-2" />}
                Run Match Engine
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Underwriting Results</h3>
                  <p className="text-slate-500 mt-1">Found {approvedMatches.length} eligible programs out of {app.matches.length} policies checked.</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-center px-4 border-r border-slate-200">
                    <p className="text-3xl font-display font-bold text-emerald-600">{approvedMatches.length}</p>
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">Approved</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-3xl font-display font-bold text-rose-600">{rejectedMatches.length}</p>
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">Declined</p>
                  </div>
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                {app.matches.map((match) => (
                  <div key={match.id} className={cn(
                    "relative overflow-hidden rounded-2xl border bg-white shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-6",
                    match.isEligible ? "border-emerald-200" : "border-rose-200"
                  )}>
                    {/* Status Indicator Bar */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", match.isEligible ? "bg-emerald-500" : "bg-rose-500")} />
                    
                    <div className="flex-1 pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        {match.isEligible ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                        <h4 className="text-lg font-bold font-display text-slate-900">{match.policy.name}</h4>
                      </div>
                      <p className="text-sm text-slate-500">
                        {match.isEligible ? "Meets all underwriting criteria." : "Failed to meet criteria."}
                      </p>
                      
                      {!match.isEligible && match.reasons && match.reasons.length > 0 && (
                        <div className="mt-4 bg-rose-50 p-4 rounded-xl border border-rose-100">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Decline Reasons
                          </p>
                          <ul className="list-disc list-inside text-sm text-rose-700 space-y-1 ml-1">
                            {match.reasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl min-w-[120px]">
                      <span className="text-sm font-semibold text-slate-500 mb-1">Match Score</span>
                      <div className="text-3xl font-display font-bold" style={{ color: `hsl(${match.score * 1.2}, 80%, 40%)` }}>
                        {match.score}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${match.score}%`, backgroundColor: `hsl(${match.score * 1.2}, 80%, 45%)` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
