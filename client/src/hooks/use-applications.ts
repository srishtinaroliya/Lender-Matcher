import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertLoanApplication, type LoanApplicationWithMatches } from "@shared/schema";

export function useApplications() {
  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.applications.get.responses[200].parse(await res.json()) as LoanApplicationWithMatches;
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLoanApplication) => {
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create application");
      return api.applications.create.responses[201].parse(await res.json()) as LoanApplicationWithMatches;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
    },
  });
}

export function useRunUnderwriting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.runUnderwriting.path, { id });
      const res = await fetch(url, {
        method: api.applications.runUnderwriting.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to run underwriting");
      return api.applications.runUnderwriting.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
    },
  });
}
