import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lender Policies
export const lenderPolicies = pgTable("lender_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  minFico: integer("min_fico"),
  minPaynet: integer("min_paynet"),
  minYearsInBusiness: integer("min_years_in_business"),
  minLoanAmount: integer("min_loan_amount"),
  maxLoanAmount: integer("max_loan_amount"),
  allowedEquipmentTypes: text("allowed_equipment_types").array(),
  excludedStates: text("excluded_states").array(),
  excludedIndustries: text("excluded_industries").array(),
  maxEquipmentAge: integer("max_equipment_age"),
  requiresHomeownership: boolean("requires_homeownership").default(false),
  requiresCdl: boolean("requires_cdl").default(false),
  maxSoftCostsPercentage: integer("max_soft_costs_percentage"),
  isStartupEligible: boolean("is_startup_eligible").default(false),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}), // For any extra rules
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan Applications
export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  state: text("state").notNull(), // 2 letter state code
  yearsInBusiness: integer("years_in_business").notNull(),
  annualRevenue: integer("annual_revenue").notNull(),
  guarantorFico: integer("guarantor_fico").notNull(),
  paynetScore: integer("paynet_score").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  loanTerm: integer("loan_term").notNull(),
  equipmentType: text("equipment_type").notNull(),
  equipmentAge: integer("equipment_age").default(0),
  isHomeowner: boolean("is_homeowner").default(false),
  hasCdl: boolean("has_cdl").default(false),
  softCostsAmount: integer("soft_costs_amount").default(0),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Match Results
export const matchResults = pgTable("match_results", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  policyId: integer("policy_id").notNull(),
  isEligible: boolean("is_eligible").notNull(),
  score: integer("score").notNull(), // 0-100
  reasons: text("reasons").array().notNull(), // Reasons for rejection or match notes
  tierName: text("tier_name"),
  interestRate: text("interest_rate"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const matchResultsRelations = relations(matchResults, ({ one }) => ({
  application: one(loanApplications, {
    fields: [matchResults.applicationId],
    references: [loanApplications.id],
  }),
  policy: one(lenderPolicies, {
    fields: [matchResults.policyId],
    references: [lenderPolicies.id],
  }),
}));

export const loanApplicationsRelations = relations(loanApplications, ({ many }) => ({
  matches: many(matchResults),
}));

export const lenderPoliciesRelations = relations(lenderPolicies, ({ many }) => ({
  matches: many(matchResults),
}));

// Schemas
export const insertLenderPolicySchema = createInsertSchema(lenderPolicies).omit({ id: true, createdAt: true });
export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({ id: true, status: true, createdAt: true });
export const insertMatchResultSchema = createInsertSchema(matchResults).omit({ id: true, createdAt: true });

// Types
export type LenderPolicy = typeof lenderPolicies.$inferSelect;
export type InsertLenderPolicy = z.infer<typeof insertLenderPolicySchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type MatchResult = typeof matchResults.$inferSelect;
export type InsertMatchResult = z.infer<typeof insertMatchResultSchema>;

export type MatchResultWithPolicy = MatchResult & { policy: LenderPolicy };
export type LoanApplicationWithMatches = LoanApplication & { matches: MatchResultWithPolicy[] };
