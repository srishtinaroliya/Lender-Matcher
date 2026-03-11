import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateApplication } from "@/hooks/use-applications";
import { insertLoanApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

// Create extended schema with coercions for number fields
const formSchema = insertLoanApplicationSchema.extend({
  yearsInBusiness: z.coerce.number().min(0, "Must be positive"),
  annualRevenue: z.coerce.number().min(1, "Required"),
  guarantorFico: z.coerce.number().min(300, "Min 300").max(850, "Max 850"),
  paynetScore: z.coerce.number().min(0).max(100),
  loanAmount: z.coerce.number().min(1000, "Minimum $1,000"),
  loanTerm: z.coerce.number().min(1, "Minimum 1 month"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const { mutate: createApplication, isPending } = useCreateApplication();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "CA",
      industry: "Construction",
      equipmentType: "Heavy Machinery",
      yearsInBusiness: 1,
      annualRevenue: 100000,
      guarantorFico: 700,
      paynetScore: 75,
      loanAmount: 50000,
      loanTerm: 36,
    }
  });

  const onSubmit = (data: FormData) => {
    createApplication(data, {
      onSuccess: (result) => {
        setLocation(`/applications/${result.id}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/applications" className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">New Application</h1>
          <p className="text-slate-500 mt-1">Enter applicant details for automated underwriting.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="fintech-card overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Section 1 */}
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
                <input {...register("businessName")} className="fintech-input" placeholder="Acme Corp" />
                {errors.businessName && <p className="text-rose-500 text-sm mt-1">{errors.businessName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
                <select {...register("industry")} className="fintech-input">
                  <option value="Construction">Construction</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Medical">Medical</option>
                  <option value="IT">IT & Software</option>
                  <option value="Retail">Retail</option>
                </select>
                {errors.industry && <p className="text-rose-500 text-sm mt-1">{errors.industry.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">State (2 Letter)</label>
                <input {...register("state")} className="fintech-input" placeholder="CA" maxLength={2} />
                {errors.state && <p className="text-rose-500 text-sm mt-1">{errors.state.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Years in Business</label>
                <input type="number" {...register("yearsInBusiness")} className="fintech-input" placeholder="5" />
                {errors.yearsInBusiness && <p className="text-rose-500 text-sm mt-1">{errors.yearsInBusiness.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Financial Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Revenue ($)</label>
                <input type="number" {...register("annualRevenue")} className="fintech-input" placeholder="500000" />
                {errors.annualRevenue && <p className="text-rose-500 text-sm mt-1">{errors.annualRevenue.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Guarantor FICO</label>
                <input type="number" {...register("guarantorFico")} className="fintech-input" placeholder="720" />
                {errors.guarantorFico && <p className="text-rose-500 text-sm mt-1">{errors.guarantorFico.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">PayNet Score</label>
                <input type="number" {...register("paynetScore")} className="fintech-input" placeholder="80" />
                {errors.paynetScore && <p className="text-rose-500 text-sm mt-1">{errors.paynetScore.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Loan Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loan Amount ($)</label>
                <input type="number" {...register("loanAmount")} className="fintech-input" placeholder="100000" />
                {errors.loanAmount && <p className="text-rose-500 text-sm mt-1">{errors.loanAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Term (Months)</label>
                <input type="number" {...register("loanTerm")} className="fintech-input" placeholder="36" />
                {errors.loanTerm && <p className="text-rose-500 text-sm mt-1">{errors.loanTerm.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Equipment Type</label>
                <input {...register("equipmentType")} className="fintech-input" placeholder="e.g. Heavy Machinery" />
                {errors.equipmentType && <p className="text-rose-500 text-sm mt-1">{errors.equipmentType.message}</p>}
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Link href="/applications" className="fintech-button-outline">Cancel</Link>
          <button type="submit" disabled={isPending} className="fintech-button-primary min-w-[160px]">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
