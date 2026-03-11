import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePolicy, useUpdatePolicy, usePolicy } from "@/hooks/use-policies";
import { insertLenderPolicySchema } from "@shared/schema";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

// Form schema with coercions and array handling from strings
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().default(true),
  minFico: z.coerce.number().optional().nullable(),
  minPaynet: z.coerce.number().optional().nullable(),
  minYearsInBusiness: z.coerce.number().optional().nullable(),
  minLoanAmount: z.coerce.number().optional().nullable(),
  maxLoanAmount: z.coerce.number().optional().nullable(),
  allowedEquipmentTypes: z.string().optional(),
  excludedStates: z.string().optional(),
  excludedIndustries: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PolicyForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id;
  const policyId = isEditing ? Number(params.id) : undefined;
  
  const { data: existingPolicy, isLoading: isLoadingPolicy } = usePolicy(policyId || 0);
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy();
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdatePolicy();
  
  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { isActive: true }
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (existingPolicy && isEditing) {
      reset({
        name: existingPolicy.name,
        isActive: existingPolicy.isActive ?? true,
        minFico: existingPolicy.minFico,
        minPaynet: existingPolicy.minPaynet,
        minYearsInBusiness: existingPolicy.minYearsInBusiness,
        minLoanAmount: existingPolicy.minLoanAmount,
        maxLoanAmount: existingPolicy.maxLoanAmount,
        allowedEquipmentTypes: existingPolicy.allowedEquipmentTypes?.join(", ") || "",
        excludedStates: existingPolicy.excludedStates?.join(", ") || "",
        excludedIndustries: existingPolicy.excludedIndustries?.join(", ") || "",
      });
    }
  }, [existingPolicy, isEditing, reset]);

  const onSubmit = (data: FormData) => {
    // Transform comma separated strings back to arrays
    const payload = {
      ...data,
      allowedEquipmentTypes: data.allowedEquipmentTypes ? data.allowedEquipmentTypes.split(",").map(s => s.trim()).filter(Boolean) : null,
      excludedStates: data.excludedStates ? data.excludedStates.split(",").map(s => s.trim().toUpperCase()).filter(Boolean) : null,
      excludedIndustries: data.excludedIndustries ? data.excludedIndustries.split(",").map(s => s.trim()).filter(Boolean) : null,
    };

    if (isEditing && policyId) {
      updatePolicy({ id: policyId, data: payload as any }, {
        onSuccess: () => setLocation("/policies")
      });
    } else {
      createPolicy(payload as any, {
        onSuccess: () => setLocation("/policies")
      });
    }
  };

  if (isEditing && isLoadingPolicy) {
    return <div className="p-8 text-center text-slate-500">Loading policy...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/policies" className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">{isEditing ? 'Edit Policy' : 'New Policy'}</h1>
          <p className="text-slate-500 mt-1">Set underwriting parameters and exclusions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="fintech-card overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Policy Name</label>
              <input {...register("name")} className="fintech-input text-lg font-semibold" placeholder="e.g. Premium Construction Tier 1" />
              {errors.name && <p className="text-rose-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Active Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Minimum Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Min FICO</label>
                <input type="number" {...register("minFico")} className="fintech-input" placeholder="e.g. 680" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Min PayNet</label>
                <input type="number" {...register("minPaynet")} className="fintech-input" placeholder="e.g. 70" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Min Years in Biz</label>
                <input type="number" {...register("minYearsInBusiness")} className="fintech-input" placeholder="e.g. 2" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Loan Amounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Min Amount ($)</label>
                <input type="number" {...register("minLoanAmount")} className="fintech-input" placeholder="e.g. 10000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Amount ($)</label>
                <input type="number" {...register("maxLoanAmount")} className="fintech-input" placeholder="e.g. 250000" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-2 mb-6">Inclusions & Exclusions</h3>
            <p className="text-xs text-slate-500 mb-4">Enter comma-separated values.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Allowed Equipment Types (leave blank for all)</label>
                <input {...register("allowedEquipmentTypes")} className="fintech-input" placeholder="e.g. Heavy Machinery, Trucks, Medical" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Excluded States</label>
                <input {...register("excludedStates")} className="fintech-input" placeholder="e.g. CA, NY, NV" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Excluded Industries</label>
                <input {...register("excludedIndustries")} className="fintech-input" placeholder="e.g. Cannabis, Adult, Firearms" />
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <Link href="/policies" className="fintech-button-outline">Cancel</Link>
          <button type="submit" disabled={isPending} className="fintech-button-primary min-w-[160px]">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Policy"}
          </button>
        </div>
      </form>
    </div>
  );
}
