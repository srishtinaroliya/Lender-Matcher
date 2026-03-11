import { db } from "./db";
import {
  lenderPolicies,
  loanApplications,
  matchResults,
  type LenderPolicy,
  type InsertLenderPolicy,
  type LoanApplication,
  type InsertLoanApplication,
  type MatchResult,
  type InsertMatchResult,
  type LoanApplicationWithMatches,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Policies
  getPolicies(): Promise<LenderPolicy[]>;
  getPolicy(id: number): Promise<LenderPolicy | undefined>;
  createPolicy(policy: InsertLenderPolicy): Promise<LenderPolicy>;
  updatePolicy(id: number, updates: Partial<InsertLenderPolicy>): Promise<LenderPolicy>;
  deletePolicy(id: number): Promise<void>;

  // Applications
  getApplications(): Promise<LoanApplication[]>;
  getApplication(id: number): Promise<LoanApplicationWithMatches | undefined>;
  createApplication(application: InsertLoanApplication): Promise<LoanApplication>;

  // Matches
  createMatchResult(match: InsertMatchResult): Promise<MatchResult>;
}

export class DatabaseStorage implements IStorage {
  async getPolicies(): Promise<LenderPolicy[]> {
    return await db.select().from(lenderPolicies).orderBy(lenderPolicies.id);
  }

  async getPolicy(id: number): Promise<LenderPolicy | undefined> {
    const [policy] = await db.select().from(lenderPolicies).where(eq(lenderPolicies.id, id));
    return policy;
  }

  async createPolicy(policy: InsertLenderPolicy): Promise<LenderPolicy> {
    const [created] = await db.insert(lenderPolicies).values(policy).returning();
    return created;
  }

  async updatePolicy(id: number, updates: Partial<InsertLenderPolicy>): Promise<LenderPolicy> {
    const [updated] = await db.update(lenderPolicies)
      .set(updates)
      .where(eq(lenderPolicies.id, id))
      .returning();
    return updated;
  }

  async deletePolicy(id: number): Promise<void> {
    await db.delete(lenderPolicies).where(eq(lenderPolicies.id, id));
  }

  async getApplications(): Promise<LoanApplication[]> {
    return await db.select().from(loanApplications).orderBy(loanApplications.id);
  }

  async getApplication(id: number): Promise<LoanApplicationWithMatches | undefined> {
    const [app] = await db.select().from(loanApplications).where(eq(loanApplications.id, id));
    if (!app) return undefined;

    const matches = await db.select().from(matchResults).where(eq(matchResults.applicationId, id));
    
    // We need to fetch policies for the matches to return MatchResultWithPolicy
    const policies = await this.getPolicies();
    const policyMap = new Map(policies.map(p => [p.id, p]));

    const matchesWithPolicies = matches.map(m => ({
      ...m,
      policy: policyMap.get(m.policyId)!
    }));

    return {
      ...app,
      matches: matchesWithPolicies
    };
  }

  async createApplication(application: InsertLoanApplication): Promise<LoanApplication> {
    const [created] = await db.insert(loanApplications).values(application).returning();
    return created;
  }

  async createMatchResult(match: InsertMatchResult): Promise<MatchResult> {
    const [created] = await db.insert(matchResults).values(match).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
