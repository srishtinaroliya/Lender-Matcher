import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type InsertMatchResult } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Lender Policies ===
  app.get(api.policies.list.path, async (req, res) => {
    const policies = await storage.getPolicies();
    res.json(policies);
  });

  app.get(api.policies.get.path, async (req, res) => {
    const policy = await storage.getPolicy(Number(req.params.id));
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json(policy);
  });

  app.post(api.policies.create.path, async (req, res) => {
    try {
      const input = api.policies.create.input.parse(req.body);
      const policy = await storage.createPolicy(input);
      res.status(201).json(policy);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.policies.update.path, async (req, res) => {
    try {
      const input = api.policies.update.input.parse(req.body);
      const policy = await storage.updatePolicy(Number(req.params.id), input);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.policies.delete.path, async (req, res) => {
    await storage.deletePolicy(Number(req.params.id));
    res.status(204).end();
  });

  // === Loan Applications ===
  app.get(api.applications.list.path, async (req, res) => {
    const applications = await storage.getApplications();
    res.json(applications);
  });

  app.get(api.applications.get.path, async (req, res) => {
    const appData = await storage.getApplication(Number(req.params.id));
    if (!appData) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(appData);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      // Coerce numeric fields from strings
      const bodySchema = api.applications.create.input.extend({
        yearsInBusiness: z.coerce.number(),
        annualRevenue: z.coerce.number(),
        guarantorFico: z.coerce.number(),
        paynetScore: z.coerce.number(),
        loanAmount: z.coerce.number(),
        loanTerm: z.coerce.number(),
        equipmentAge: z.coerce.number().optional(),
        softCostsAmount: z.coerce.number().optional(),
      });

      const input = bodySchema.parse(req.body);
      const application = await storage.createApplication(input);

      // Run automatic underwriting logic immediately upon creation
      const policies = await storage.getPolicies();
      for (const policy of policies) {
        if (!policy.isActive) continue;

        let isEligible = true;
        let reasons: string[] = [];
        let score = 100;
        let tierName = null;
        let interestRate = null;

        // Custom Logic for specific lenders based on metadata/name if needed
        // But we'll try to use the normalized fields first

        if (policy.minFico && application.guarantorFico < policy.minFico) {
          isEligible = false;
          reasons.push("FICO score (" + application.guarantorFico + ") is below minimum required (" + policy.minFico + ")");
        }
        
        if (policy.minPaynet && application.paynetScore < policy.minPaynet) {
          isEligible = false;
          reasons.push("PayNet score (" + application.paynetScore + ") is below minimum required (" + policy.minPaynet + ")");
        }

        if (policy.minYearsInBusiness && application.yearsInBusiness < policy.minYearsInBusiness && !policy.isStartupEligible) {
          isEligible = false;
          reasons.push("Years in business (" + application.yearsInBusiness + ") is below minimum required (" + policy.minYearsInBusiness + ")");
        }

        if (policy.minLoanAmount && application.loanAmount < policy.minLoanAmount) {
          isEligible = false;
          reasons.push("Loan amount (" + application.loanAmount + ") is below minimum allowed (" + policy.minLoanAmount + ")");
        }

        if (policy.maxLoanAmount && application.loanAmount > policy.maxLoanAmount) {
          isEligible = false;
          reasons.push("Loan amount (" + application.loanAmount + ") is above maximum allowed (" + policy.maxLoanAmount + ")");
        }

        if (policy.maxEquipmentAge && application.equipmentAge && application.equipmentAge > policy.maxEquipmentAge) {
          isEligible = false;
          reasons.push("Equipment age (" + application.equipmentAge + ") exceeds maximum allowed (" + policy.maxEquipmentAge + ")");
        }

        if (policy.requiresHomeownership && !application.isHomeowner) {
          isEligible = false;
          reasons.push("Lender requires homeownership");
        }

        if (policy.requiresCdl && !application.hasCdl && application.equipmentType.toLowerCase().includes("truck")) {
          isEligible = false;
          reasons.push("CDL required for trucking equipment with this lender");
        }

        if (policy.maxSoftCostsPercentage && application.softCostsAmount) {
          const softCostPercent = (application.softCostsAmount / application.loanAmount) * 100;
          if (softCostPercent > policy.maxSoftCostsPercentage) {
            isEligible = false;
            reasons.push("Soft costs (" + softCostPercent.toFixed(1) + "%) exceed maximum allowed (" + policy.maxSoftCostsPercentage + "%)");
          }
        }

        if (policy.allowedEquipmentTypes && policy.allowedEquipmentTypes.length > 0 && !policy.allowedEquipmentTypes.includes(application.equipmentType)) {
          isEligible = false;
          reasons.push("Equipment type (" + application.equipmentType + ") is not allowed by this lender");
        }

        if (policy.excludedStates && policy.excludedStates.includes(application.state)) {
          isEligible = false;
          reasons.push("State (" + application.state + ") is excluded by this lender");
        }

        if (policy.excludedIndustries && policy.excludedIndustries.includes(application.industry)) {
          isEligible = false;
          reasons.push("Industry (" + application.industry + ") is excluded by this lender");
        }

        // Tiers Logic (simplified for MVP)
        if (isEligible) {
          reasons.push("All lender criteria met.");
          if (policy.name === "EF Credit Box") {
             if (application.guarantorFico >= 725 && application.paynetScore >= 685) tierName = "Tier 1";
             else if (application.guarantorFico >= 710 && application.paynetScore >= 675) tierName = "Tier 2";
             else tierName = "Tier 3";
          }
        } else {
          score = 0;
        }

        await storage.createMatchResult({
          applicationId: application.id,
          policyId: policy.id,
          isEligible,
          score,
          reasons,
          tierName,
          interestRate
        });
      }

      const completeApp = await storage.getApplication(application.id);
      res.status(201).json(completeApp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const policies = await storage.getPolicies();
  if (policies.length === 0) {
    // 1. EF Credit Box
    await storage.createPolicy({
      name: "EF Credit Box",
      minFico: 700,
      minPaynet: 665,
      minYearsInBusiness: 2,
      excludedIndustries: ["Gaming", "Gambling", "Hazmat", "Oil", "Gas", "Adult Entertainment", "Beauty", "Tanning", "Tattoo", "Piercing", "Restaurant"],
      isActive: true,
      metadata: { tiers: [{ name: "Tier 1", fico: 725, paynet: 685, tib: 3 }, { name: "Tier 2", fico: 710, paynet: 675, tib: 3 }, { name: "Tier 3", fico: 700, paynet: 665, tib: 2 }] }
    });
    
    // 2. Apex Equipment Finance
    await storage.createPolicy({
      name: "Apex Equipment Finance",
      minFico: 640,
      minPaynet: 640,
      minYearsInBusiness: 2,
      maxEquipmentAge: 15,
      excludedStates: ["CA", "NV", "ND", "VT"],
      excludedIndustries: ["Cannabis", "Casino", "Gambling", "Copiers", "Aircraft", "Boats", "Non-profit"],
      maxSoftCostsPercentage: 25,
      isActive: true,
    });

    // 3. Advantage+ Financing
    await storage.createPolicy({
      name: "Advantage+ Financing",
      minFico: 680,
      minYearsInBusiness: 3,
      minLoanAmount: 10000,
      maxLoanAmount: 75000,
      isStartupEligible: true, // They do startups with 700+ FICO
      isActive: true,
    });

    // 4. Falcon Equipment Finance
    await storage.createPolicy({
      name: "Falcon Equipment Finance",
      minFico: 680,
      minPaynet: 660,
      minYearsInBusiness: 3,
      minLoanAmount: 15000,
      isActive: true,
    });

    // 5. Citizens Bank
    await storage.createPolicy({
      name: "Citizens Bank",
      minFico: 700,
      minYearsInBusiness: 2,
      requiresHomeownership: true,
      excludedStates: ["CA"],
      excludedIndustries: ["Cannabis"],
      isActive: true,
    });
  }
}
