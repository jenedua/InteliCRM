import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    // Simple Analytics
    const totalOpportunities = await prisma.opportunity.count({ where: { tenantId } });
    const wonOpportunities = await prisma.opportunity.count({ where: { tenantId, stage: "WON" } });
    
    const wonValueAgg = await prisma.opportunity.aggregate({
      where: { tenantId, stage: "WON" },
      _sum: { value: true }
    });

    const totalContacts = await prisma.contact.count({ where: { tenantId } });

    // Mock CAC and LTV for demonstration
    const cac = totalContacts > 0 ? 150.50 : 0; // Mock calculation
    const ltv = wonOpportunities > 0 ? (wonValueAgg._sum.value || 0) / wonOpportunities : 0;

    res.json({
      totalOpportunities,
      wonOpportunities,
      totalRevenue: wonValueAgg._sum.value || 0,
      totalContacts,
      cac,
      ltv,
      conversionRate: totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as analyticsRoutes };
