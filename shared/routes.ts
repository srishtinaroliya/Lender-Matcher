import { z } from 'zod';
import { insertLenderPolicySchema, insertLoanApplicationSchema, lenderPolicies, loanApplications, matchResults } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  policies: {
    list: {
      method: 'GET' as const,
      path: '/api/policies' as const,
      responses: {
        200: z.array(z.custom<typeof lenderPolicies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/policies/:id' as const,
      responses: {
        200: z.custom<typeof lenderPolicies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/policies' as const,
      input: insertLenderPolicySchema,
      responses: {
        201: z.custom<typeof lenderPolicies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/policies/:id' as const,
      input: insertLenderPolicySchema.partial(),
      responses: {
        200: z.custom<typeof lenderPolicies.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/policies/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications' as const,
      responses: {
        200: z.array(z.custom<typeof loanApplications.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id' as const,
      responses: {
        200: z.custom<any>(), // Returns LoanApplicationWithMatches
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications' as const,
      input: insertLoanApplicationSchema,
      responses: {
        201: z.custom<any>(), // Returns LoanApplicationWithMatches
        400: errorSchemas.validation,
      },
    },
    runUnderwriting: {
      method: 'POST' as const,
      path: '/api/applications/:id/underwrite' as const,
      responses: {
        200: z.array(z.custom<typeof matchResults.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
